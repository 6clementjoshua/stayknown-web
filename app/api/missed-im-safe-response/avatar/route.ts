// app/api/missed-im-safe-response/avatar/route.ts
import crypto from "crypto";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

type ResponseChoice = "will_check" | "reached_them" | "could_not_reach";
type PersonKind = "subject" | "contact";
type JsonRow = Record<string, unknown>;

type VerifiedRequest =
  | {
      ok: true;
      person: PersonKind;
      uid: string;
      contact: string;
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

type SupabaseConfig = {
  url: string;
  serviceRoleKey: string;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function clean(value: unknown): string {
  if (value == null) return "";

  const text = String(value).trim();
  return text.toLowerCase() === "null" ? "" : text;
}

function cleanEmail(value: unknown): string {
  return clean(value).toLowerCase();
}

function firstNonEmpty(values: unknown[]): string {
  for (const value of values) {
    const text = clean(value);
    if (text) return text;
  }

  return "";
}

function asResponse(value: string): ResponseChoice | null {
  const normalized = value.trim().toLowerCase();

  if (normalized === "will_check") return "will_check";
  if (normalized === "reached_them") return "reached_them";
  if (normalized === "could_not_reach") return "could_not_reach";

  return null;
}

function signatureMessage(params: {
  uid: string;
  contact: string;
  contactName: string;
  subjectName: string;
  response: ResponseChoice;
  expected: string;
  due: string;
  sent: string;
  exp: number;
}) {
  return [
    `uid=${params.uid}`,
    `contact=${params.contact}`,
    `contact_name=${params.contactName}`,
    `subject_name=${params.subjectName}`,
    `response=${params.response}`,
    `expected=${params.expected}`,
    `due=${params.due}`,
    `sent=${params.sent}`,
    `exp=${params.exp}`,
  ].join("&");
}

function safeEqual(left: string, right: string): boolean {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);

  return (
    leftBytes.length === rightBytes.length &&
    crypto.timingSafeEqual(leftBytes, rightBytes)
  );
}

function verifyRequest(searchParams: URLSearchParams): VerifiedRequest {
  const personValue = clean(searchParams.get("person"));
  const person: PersonKind | null =
    personValue === "subject" || personValue === "contact" ? personValue : null;

  const uid = clean(searchParams.get("uid"));
  const contact = cleanEmail(searchParams.get("contact"));
  const contactName = clean(searchParams.get("contact_name"));
  const subjectName = clean(searchParams.get("subject_name"));
  const response = asResponse(clean(searchParams.get("response")));
  const expected = clean(searchParams.get("expected"));
  const due = clean(searchParams.get("due"));
  const sent = clean(searchParams.get("sent"));
  const expRaw = clean(searchParams.get("exp"));
  const sig = clean(searchParams.get("sig"));
  const secret = clean(process.env.MISSED_SAFE_RESPONSE_SIGNING_SECRET);

  if (!person || !UUID_RE.test(uid) || !contact.includes("@")) {
    return {
      ok: false,
      status: 400,
      message: "Invalid avatar request.",
    };
  }

  if (!response || !expected || !due || !sent || !expRaw || !sig || !secret) {
    return {
      ok: false,
      status: 400,
      message: "Incomplete avatar request.",
    };
  }

  const exp = Number(expRaw);

  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) {
    return {
      ok: false,
      status: 410,
      message: "This avatar link has expired.",
    };
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(
      signatureMessage({
        uid,
        contact,
        contactName,
        subjectName,
        response,
        expected,
        due,
        sent,
        exp,
      }),
    )
    .digest("base64url");

  if (!safeEqual(expectedSignature, sig)) {
    return {
      ok: false,
      status: 403,
      message: "Invalid avatar signature.",
    };
  }

  return {
    ok: true,
    person,
    uid,
    contact,
  };
}

function supabaseConfig(): SupabaseConfig {
  const url = firstNonEmpty([
    process.env.SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ]).replace(/\/+$/g, "");

  const serviceRoleKey = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!url || !serviceRoleKey) {
    throw new Error("StayKnown avatar service is not configured.");
  }

  return { url, serviceRoleKey };
}

function serviceHeaders(config: SupabaseConfig, extra?: HeadersInit): Headers {
  const headers = new Headers(extra);

  headers.set("apikey", config.serviceRoleKey);
  headers.set("Authorization", `Bearer ${config.serviceRoleKey}`);

  return headers;
}

async function restRows(params: {
  config: SupabaseConfig;
  table: string;
  select: string;
  filters: Record<string, string>;
  limit?: number;
}): Promise<JsonRow[]> {
  const url = new URL(
    `${params.config.url}/rest/v1/${encodeURIComponent(params.table)}`,
  );

  url.searchParams.set("select", params.select);

  for (const [column, value] of Object.entries(params.filters)) {
    url.searchParams.set(column, `eq.${value}`);
  }

  url.searchParams.set("limit", String(params.limit ?? 1));

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: serviceHeaders(params.config, {
      Accept: "application/json",
    }),
  });

  if (!response.ok) {
    return [];
  }

  const payload: unknown = await response.json().catch(() => []);

  if (!Array.isArray(payload)) return [];

  return payload.filter(
    (item): item is JsonRow =>
      typeof item === "object" && item !== null && !Array.isArray(item),
  );
}

async function resolveContactUserId(
  config: SupabaseConfig,
  email: string,
): Promise<string> {
  const profileRows = await restRows({
    config,
    table: "profiles",
    select: "id",
    filters: { email },
  });

  const profileId = clean(profileRows[0]?.id);
  if (UUID_RE.test(profileId)) return profileId;

  const userProfileRows = await restRows({
    config,
    table: "user_profile",
    select: "user_id",
    filters: { email },
  });

  const userProfileId = clean(userProfileRows[0]?.user_id);
  if (UUID_RE.test(userProfileId)) return userProfileId;

  return "";
}

async function authMetadataAvatar(
  config: SupabaseConfig,
  userId: string,
): Promise<string> {
  const response = await fetch(
    `${config.url}/auth/v1/admin/users/${encodeURIComponent(userId)}`,
    {
      method: "GET",
      cache: "no-store",
      headers: serviceHeaders(config, {
        Accept: "application/json",
      }),
    },
  );

  if (!response.ok) return "";

  const payload: unknown = await response.json().catch(() => null);

  if (
    typeof payload !== "object" ||
    payload === null ||
    Array.isArray(payload)
  ) {
    return "";
  }

  const user = payload as JsonRow;
  const metadataRaw = user.user_metadata;

  if (
    typeof metadataRaw !== "object" ||
    metadataRaw === null ||
    Array.isArray(metadataRaw)
  ) {
    return "";
  }

  const metadata = metadataRaw as JsonRow;

  return firstNonEmpty([
    metadata.avatar_url,
    metadata.picture,
    metadata.photo_url,
  ]);
}

async function avatarCandidates(
  config: SupabaseConfig,
  userId: string,
): Promise<string[]> {
  const candidates: string[] = [];

  const userProfileRows = await restRows({
    config,
    table: "user_profile",
    select: "profile_photo_url",
    filters: { user_id: userId },
  });

  candidates.push(clean(userProfileRows[0]?.profile_photo_url));

  const profileRows = await restRows({
    config,
    table: "profiles",
    select: "avatar_url",
    filters: { id: userId },
  });

  candidates.push(clean(profileRows[0]?.avatar_url));
  candidates.push(await authMetadataAvatar(config, userId));

  return [...new Set(candidates.filter(Boolean))];
}

function storageObjectFromUrl(
  value: string,
): { bucket: string; path: string } | null {
  try {
    const url = new URL(value);
    const pathname = decodeURIComponent(url.pathname);

    const patterns = [
      /\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+)$/,
      /\/storage\/v1\/render\/image\/(?:public|sign|authenticated)\/([^/]+)\/(.+)$/,
    ];

    for (const pattern of patterns) {
      const match = pathname.match(pattern);

      if (match) {
        return {
          bucket: match[1],
          path: match[2],
        };
      }
    }
  } catch {}

  return null;
}

function storageCandidates(
  rawValue: string,
): Array<{ bucket: string; path: string }> {
  const result: Array<{ bucket: string; path: string }> = [];
  const seen = new Set<string>();

  const add = (bucket: string, path: string) => {
    const cleanBucket = clean(bucket);
    const cleanPath = clean(path).replace(/^\/+/, "");

    if (!cleanBucket || !cleanPath) return;

    const key = `${cleanBucket}/${cleanPath}`;

    if (seen.has(key)) return;

    seen.add(key);
    result.push({
      bucket: cleanBucket,
      path: cleanPath,
    });
  };

  const absolute = storageObjectFromUrl(rawValue);

  if (absolute) {
    add(absolute.bucket, absolute.path);
    return result;
  }

  const normalized = clean(rawValue).replace(/^\/+/, "");

  if (!normalized) return result;

  if (normalized.startsWith("avatars/")) {
    add("avatars", normalized.slice("avatars/".length));
  } else if (normalized.startsWith("safety-gallery/")) {
    add("safety-gallery", normalized.slice("safety-gallery/".length));
  } else {
    const slashIndex = normalized.indexOf("/");

    if (slashIndex > 0 && slashIndex < normalized.length - 1) {
      add(normalized.slice(0, slashIndex), normalized.slice(slashIndex + 1));
    }

    add("avatars", normalized);
    add("safety-gallery", normalized);
  }

  return result;
}

async function storageResponse(
  config: SupabaseConfig,
  object: { bucket: string; path: string },
): Promise<Response | null> {
  const encodedPath = object.path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  const endpoints = [
    `${config.url}/storage/v1/object/authenticated/${encodeURIComponent(
      object.bucket,
    )}/${encodedPath}`,
    `${config.url}/storage/v1/object/${encodeURIComponent(
      object.bucket,
    )}/${encodedPath}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "GET",
        cache: "no-store",
        headers: serviceHeaders(config, {
          Accept:
            "image/avif,image/webp,image/png,image/jpeg,image/*,*/*;q=0.8",
        }),
      });

      if (!response.ok) continue;

      const contentType = clean(response.headers.get("content-type"));

      if (!contentType.toLowerCase().startsWith("image/")) {
        continue;
      }

      const bytes = await response.arrayBuffer();

      return new Response(bytes, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Length": String(bytes.byteLength),
          "Cache-Control": "private, max-age=300, stale-while-revalidate=600",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch {
      // Try the next compatible Storage endpoint.
    }
  }

  return null;
}

function remoteImageAllowed(value: string): boolean {
  try {
    const url = new URL(value);

    if (url.protocol !== "https:") return false;

    const host = url.hostname.toLowerCase();

    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host.endsWith(".local")
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

async function remoteResponse(value: string): Promise<Response | null> {
  if (!remoteImageAllowed(value)) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(value, {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept: "image/avif,image/webp,image/png,image/jpeg,image/*,*/*;q=0.8",
      },
    });

    if (!response.ok) return null;

    const contentType = clean(response.headers.get("content-type"));

    if (!contentType.toLowerCase().startsWith("image/")) {
      return null;
    }

    const bytes = await response.arrayBuffer();

    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "private, max-age=300, stale-while-revalidate=600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: NextRequest) {
  const verified = verifyRequest(request.nextUrl.searchParams);

  if (!verified.ok) {
    return new Response(verified.message, {
      status: verified.status,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }

  try {
    const config = supabaseConfig();

    const userId =
      verified.person === "subject"
        ? verified.uid
        : await resolveContactUserId(config, verified.contact);

    if (!UUID_RE.test(userId)) {
      return new Response("This person has no StayKnown avatar.", {
        status: 404,
        headers: {
          "Cache-Control": "private, max-age=60",
        },
      });
    }

    const candidates = await avatarCandidates(config, userId);

    for (const candidate of candidates) {
      for (const object of storageCandidates(candidate)) {
        const response = await storageResponse(config, object);

        if (response) return response;
      }

      const remote = await remoteResponse(candidate);

      if (remote) return remote;
    }

    return new Response("This person has no StayKnown avatar.", {
      status: 404,
      headers: {
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (error) {
    console.error("[MISSED_IM_SAFE_AVATAR]", error);

    return new Response("StayKnown could not prepare this avatar.", {
      status: 503,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }
}
