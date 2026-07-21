import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type JsonRow = Record<string, unknown>;
type ImageKind = "avatar" | "safety";

function clean(value: unknown): string {
  if (value == null) return "";
  const text = String(value).trim();
  return text.toLowerCase() === "null" ? "" : text;
}

function firstNonEmpty(values: unknown[]): string {
  for (const value of values) {
    const text = clean(value);
    if (text) return text;
  }
  return "";
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function createAdminClient(supabaseUrl: string, serviceRole: string) {
  return createClient(supabaseUrl, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

type AdminClient = ReturnType<typeof createAdminClient>;

function supabaseObjectFromUrl(
  value: string,
): { bucket: string; path: string } | null {
  try {
    const url = new URL(value);
    const pathname = decodeURIComponent(url.pathname);

    const markers = [
      "/storage/v1/object/public/",
      "/storage/v1/object/sign/",
      "/storage/v1/object/authenticated/",
    ];

    for (const marker of markers) {
      const markerIndex = pathname.indexOf(marker);
      if (markerIndex < 0) continue;

      const objectPath = pathname.slice(markerIndex + marker.length);
      const slashIndex = objectPath.indexOf("/");

      if (slashIndex <= 0 || slashIndex >= objectPath.length - 1) {
        return null;
      }

      return {
        bucket: objectPath.slice(0, slashIndex),
        path: objectPath.slice(slashIndex + 1),
      };
    }
  } catch {}

  return null;
}

function storageCandidates(
  rawValue: string,
  fallbackBuckets: string[],
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
    result.push({ bucket: cleanBucket, path: cleanPath });
  };

  const absolute = supabaseObjectFromUrl(rawValue);
  if (absolute) {
    add(absolute.bucket, absolute.path);
    return result;
  }

  const normalized = clean(rawValue).replace(/^\/+/, "");
  if (!normalized) return result;

  const slashIndex = normalized.indexOf("/");

  if (slashIndex > 0 && slashIndex < normalized.length - 1) {
    const prefix = normalized.slice(0, slashIndex);
    const remainder = normalized.slice(slashIndex + 1);

    add(prefix, remainder);

    for (const bucket of fallbackBuckets) {
      add(bucket, remainder);
    }
  }

  for (const bucket of fallbackBuckets) {
    add(bucket, normalized);
  }

  return result;
}

function contentTypeFromPath(path: string): string {
  const normalized = path.toLowerCase();

  if (normalized.endsWith(".png")) return "image/png";
  if (normalized.endsWith(".webp")) return "image/webp";
  if (normalized.endsWith(".gif")) return "image/gif";
  if (normalized.endsWith(".svg")) return "image/svg+xml";
  if (normalized.endsWith(".avif")) return "image/avif";

  return "image/jpeg";
}

async function downloadStoredImage(params: {
  admin: AdminClient;
  rawValue: string;
  fallbackBuckets: string[];
}): Promise<{ bytes: ArrayBuffer; contentType: string } | null> {
  const candidates = storageCandidates(params.rawValue, params.fallbackBuckets);

  for (const candidate of candidates) {
    try {
      const { data, error } = await params.admin.storage
        .from(candidate.bucket)
        .download(candidate.path);

      if (error || !data) continue;

      return {
        bytes: await data.arrayBuffer(),
        contentType: clean(data.type) || contentTypeFromPath(candidate.path),
      };
    } catch {}
  }

  return null;
}

async function loadImageSource(params: {
  admin: AdminClient;
  alertId: string;
  kind: ImageKind;
}): Promise<{
  rawValues: string[];
  fallbackBuckets: string[];
} | null> {
  const { data: alertData, error: alertError } = await params.admin
    .from("threat_alerts")
    .select("owner_user_id,owner_avatar_url,owner_safety_image_url")
    .eq("id", params.alertId)
    .maybeSingle();

  if (alertError || !alertData || typeof alertData !== "object") {
    return null;
  }

  const alert = alertData as JsonRow;
  const ownerUserId = clean(alert.owner_user_id);

  if (!ownerUserId) return null;

  if (params.kind === "avatar") {
    let userProfile: JsonRow | null = null;
    let profile: JsonRow | null = null;

    try {
      const { data } = await params.admin
        .from("user_profile")
        .select("profile_photo_url")
        .eq("user_id", ownerUserId)
        .maybeSingle();

      if (data && typeof data === "object") {
        userProfile = data as JsonRow;
      }
    } catch {}

    try {
      const { data } = await params.admin
        .from("profiles")
        .select("avatar_url")
        .eq("id", ownerUserId)
        .maybeSingle();

      if (data && typeof data === "object") {
        profile = data as JsonRow;
      }
    } catch {}

    return {
      rawValues: [
        firstNonEmpty([userProfile?.profile_photo_url, profile?.avatar_url]),
        clean(alert.owner_avatar_url),
      ].filter(Boolean),
      fallbackBuckets: [
        "avatars",
        "avatar",
        "profile-avatars",
        "profile-images",
        "profile-photos",
        "user-avatars",
      ],
    };
  }

  let gallery: JsonRow | null = null;

  try {
    const { data } = await params.admin
      .from("safety_gallery")
      .select("path,created_at")
      .eq("user_id", ownerUserId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data && typeof data === "object") {
      gallery = data as JsonRow;
    }
  } catch {}

  return {
    rawValues: [
      clean(gallery?.path),
      clean(alert.owner_safety_image_url),
    ].filter(Boolean),
    fallbackBuckets: [
      "safety-gallery",
      "safety_gallery",
      "safety-images",
      "safety_images",
    ],
  };
}

function unavailable(status = 404) {
  return new NextResponse(null, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET(request: NextRequest) {
  const alertId = clean(request.nextUrl.searchParams.get("alert"));
  const kind = clean(request.nextUrl.searchParams.get("kind")) as ImageKind;

  if (!isUuid(alertId) || (kind !== "avatar" && kind !== "safety")) {
    return unavailable(400);
  }

  const supabaseUrl = firstNonEmpty([
    process.env.SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ]).replace(/\/+$/g, "");

  const serviceRole = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!supabaseUrl || !serviceRole) {
    return unavailable(503);
  }

  const admin = createAdminClient(supabaseUrl, serviceRole);

  try {
    const source = await loadImageSource({
      admin,
      alertId,
      kind,
    });

    if (!source) return unavailable();

    for (const rawValue of source.rawValues) {
      const downloaded = await downloadStoredImage({
        admin,
        rawValue,
        fallbackBuckets: source.fallbackBuckets,
      });

      if (!downloaded) continue;

      return new NextResponse(downloaded.bytes, {
        status: 200,
        headers: {
          "Content-Type": downloaded.contentType,
          "Cache-Control": "private, max-age=300, stale-while-revalidate=3600",
          "Content-Disposition": "inline",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    return unavailable();
  } catch {
    return unavailable(500);
  }
}
