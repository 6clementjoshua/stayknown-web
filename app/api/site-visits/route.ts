// app/api/site-visits/route.ts
//
// Public-safe aggregate website visit authority for StayKnown.
//
// The route:
// - records one accepted public page opening per explicit browser POST;
// - counts repeat visits, including returns and refreshes;
// - reads only aggregate totals from Supabase;
// - never stores IP addresses, account IDs, cookies, device fingerprints,
//   user agents, referrers, coordinates, or individual visit records;
// - rejects API/private paths, cross-origin browser submissions, prefetches,
//   and obvious crawler traffic before calling the database authority.

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type JsonObject = Record<string, unknown>;

type VisitRecordRow = {
  total_visits?: unknown;
  route_visits?: unknown;
  today_visits?: unknown;
  recording_started_at?: unknown;
  last_recorded_at?: unknown;
};

type VisitSummaryRow = {
  total_visits?: unknown;
  today_visits?: unknown;
  tracked_public_routes?: unknown;
  recording_started_at?: unknown;
  last_recorded_at?: unknown;
};

const MAX_BODY_BYTES = 4096;
const MAX_PATH_LENGTH = 240;

const BOT_USER_AGENT_PATTERN =
  /(?:\bbot\b|crawler|spider|slurp|bingpreview|google-inspectiontool|googleother|mediapartners-google|adsbot|facebookexternalhit|facebot|twitterbot|linkedinbot|pinterestbot|whatsapp|telegrambot|discordbot|applebot|duckduckbot|yandex|baiduspider|semrushbot|ahrefsbot|mj12bot|dotbot|petalbot|bytespider|headlesschrome|lighthouse|pagespeed|uptimerobot|statuscake|pingdom|site24x7)/i;

const BLOCKED_PATH_PREFIXES = [
  "/api",
  "/_next",
  "/live",
  "/mail-auth",
  "/mail-console",
  "/login-callback",
] as const;

const responseHeaders: Record<string, string> = {
  "Cache-Control": "no-store, max-age=0",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
};

function jsonResponse(body: JsonObject, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: responseHeaders,
  });
}

function adminClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("website_visit_counter_not_configured");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function asObject(value: unknown): JsonObject {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as JsonObject;
}

function firstRpcRow(value: unknown): JsonObject {
  if (Array.isArray(value)) {
    return asObject(value[0]);
  }

  return asObject(value);
}

function countString(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.trunc(value).toString();
  }

  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    return value.trim().replace(/^0+(?=\d)/, "");
  }

  return "0";
}

function isoDateOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const clean = value.trim();
  if (!clean) return null;

  const parsed = Date.parse(clean);
  if (!Number.isFinite(parsed)) return null;

  return new Date(parsed).toISOString();
}

function isBlockedPath(pathname: string): boolean {
  const lowerPath = pathname.toLowerCase();

  return BLOCKED_PATH_PREFIXES.some((prefix) => {
    return lowerPath === prefix || lowerPath.startsWith(`${prefix}/`);
  });
}

function normalizePublicPath(value: unknown): string | null {
  if (typeof value !== "string") return null;

  let path = value.trim();

  if (
    !path ||
    path.length > MAX_PATH_LENGTH ||
    !path.startsWith("/") ||
    path.includes("?") ||
    path.includes("#") ||
    path.includes("\\") ||
    /[\u0000-\u001F\u007F]/.test(path)
  ) {
    return null;
  }

  path = path.replace(/\/{2,}/g, "/");

  if (path.length > 1) {
    path = path.replace(/\/+$/g, "");
  }

  if (
    isBlockedPath(path) ||
    /\.(?:avif|bmp|css|gif|ico|jpe?g|js|json|map|mjs|mp3|mp4|ogg|pdf|png|svg|txt|webm|webmanifest|webp|woff2?)$/i.test(
      path,
    )
  ) {
    return null;
  }

  return path;
}

function headerOrigin(value: string | null): string | null {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function isSameOriginBrowserRequest(request: NextRequest): boolean {
  const expectedOrigin = request.nextUrl.origin;
  const origin = headerOrigin(request.headers.get("origin"));
  const referer = headerOrigin(request.headers.get("referer"));
  const fetchSite = (request.headers.get("sec-fetch-site") ?? "")
    .trim()
    .toLowerCase();

  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
    return false;
  }

  if (origin) return origin === expectedOrigin;
  if (referer) return referer === expectedOrigin;

  return false;
}

function isPrefetchRequest(request: NextRequest): boolean {
  const purpose = (
    request.headers.get("purpose") ??
    request.headers.get("sec-purpose") ??
    request.headers.get("x-purpose") ??
    ""
  )
    .trim()
    .toLowerCase();

  return purpose.includes("prefetch");
}

function isObviousCrawler(request: NextRequest): boolean {
  const userAgent = (request.headers.get("user-agent") ?? "").trim();

  if (!userAgent) return true;

  return BOT_USER_AGENT_PATTERN.test(userAgent);
}

function safeLogFailure(operation: string, error: unknown): void {
  const type = error instanceof Error ? error.name : "UnknownError";

  console.error(`SITE_VISITS ${operation}_failed type=${type}`);
}

function summaryPayload(row: VisitSummaryRow): JsonObject {
  return {
    ok: true,
    totalVisits: countString(row.total_visits),
    todayVisits: countString(row.today_visits),
    trackedPublicRoutes: countString(row.tracked_public_routes),
    recordingStartedAt: isoDateOrNull(row.recording_started_at),
    lastRecordedAt: isoDateOrNull(row.last_recorded_at),
    measurement: "recorded_public_page_openings",
    repeatVisitsIncluded: true,
    personalIdentityStored: false,
  };
}

function recordPayload(row: VisitRecordRow, path: string): JsonObject {
  return {
    ok: true,
    recorded: true,
    path,
    totalVisits: countString(row.total_visits),
    routeVisits: countString(row.route_visits),
    todayVisits: countString(row.today_visits),
    recordingStartedAt: isoDateOrNull(row.recording_started_at),
    lastRecordedAt: isoDateOrNull(row.last_recorded_at),
    measurement: "recorded_public_page_openings",
    repeatVisitsIncluded: true,
    personalIdentityStored: false,
  };
}

export async function GET(): Promise<NextResponse> {
  try {
    const admin = adminClient();

    const { data, error } = await admin.rpc("get_public_website_visit_summary");

    if (error) {
      safeLogFailure("summary_rpc", new Error(error.code || "rpc_error"));

      return jsonResponse(
        {
          ok: false,
          code: "summary_unavailable",
          message: "The recorded visit total is temporarily unavailable.",
        },
        503,
      );
    }

    const row = firstRpcRow(data) as VisitSummaryRow;

    return jsonResponse(summaryPayload(row));
  } catch (error: unknown) {
    safeLogFailure("summary", error);

    return jsonResponse(
      {
        ok: false,
        code: "summary_unavailable",
        message: "The recorded visit total is temporarily unavailable.",
      },
      503,
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isSameOriginBrowserRequest(request)) {
    return jsonResponse(
      {
        ok: false,
        code: "invalid_origin",
        message: "This visit could not be recorded from the current request.",
      },
      403,
    );
  }

  if (isPrefetchRequest(request) || isObviousCrawler(request)) {
    return jsonResponse(
      {
        ok: true,
        recorded: false,
        code: "not_a_public_page_opening",
      },
      202,
    );
  }

  const contentType = (request.headers.get("content-type") ?? "").toLowerCase();

  if (!contentType.includes("application/json")) {
    return jsonResponse(
      {
        ok: false,
        code: "unsupported_media_type",
        message: "Send the request as JSON.",
      },
      415,
    );
  }

  const declaredLength = Number.parseInt(
    request.headers.get("content-length") ?? "0",
    10,
  );

  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return jsonResponse(
      {
        ok: false,
        code: "request_too_large",
        message: "The visit request is too large.",
      },
      413,
    );
  }

  let rawBody: string;

  try {
    rawBody = await request.text();
  } catch {
    return jsonResponse(
      {
        ok: false,
        code: "invalid_body",
        message: "The visit request could not be read.",
      },
      400,
    );
  }

  if (!rawBody || Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
    return jsonResponse(
      {
        ok: false,
        code: "invalid_body",
        message: "The visit request is invalid.",
      },
      400,
    );
  }

  let body: JsonObject;

  try {
    body = asObject(JSON.parse(rawBody) as unknown);
  } catch {
    return jsonResponse(
      {
        ok: false,
        code: "invalid_json",
        message: "The visit request contains invalid JSON.",
      },
      400,
    );
  }

  const path = normalizePublicPath(body.path);

  if (!path) {
    return jsonResponse(
      {
        ok: false,
        code: "invalid_public_path",
        message:
          "The requested page is not eligible for the public visit total.",
      },
      400,
    );
  }

  try {
    const admin = adminClient();

    const { data, error } = await admin.rpc("record_public_website_visit", {
      p_path: path,
    });

    if (error) {
      safeLogFailure("record_rpc", new Error(error.code || "rpc_error"));

      return jsonResponse(
        {
          ok: false,
          code: "recording_unavailable",
          message:
            "This page opening could not be added to the total right now.",
        },
        503,
      );
    }

    const row = firstRpcRow(data) as VisitRecordRow;

    return jsonResponse(recordPayload(row, path));
  } catch (error: unknown) {
    safeLogFailure("record", error);

    return jsonResponse(
      {
        ok: false,
        code: "recording_unavailable",
        message: "This page opening could not be added to the total right now.",
      },
      503,
    );
  }
}
