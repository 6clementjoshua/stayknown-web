import crypto from "crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

type JsonRow = Record<string, unknown>;

type StorageObject = {
  bucket: string;
  path: string;
};

type VerifiedAccess =
  | {
      ok: true;
      cid: string;
      uid: string;
      aud: "contacts" | "self";
      exp: number;
    }
  | {
      ok: false;
      reason: string;
    };

function clean(value: unknown): string {
  if (value == null) {
    return "";
  }

  const text = String(value).trim();

  return text.toLowerCase() === "null" ? "" : text;
}

function firstNonEmpty(values: unknown[]): string {
  for (const value of values) {
    const text = clean(value);

    if (text) {
      return text;
    }
  }

  return "";
}

function safeEqualBase64Url(expected: string, received: string): boolean {
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(received);

    if (a.length !== b.length || a.length === 0) {
      return false;
    }

    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function verifyAccess(params: URLSearchParams): VerifiedAccess {
  const cid = clean(params.get("cid"));
  const uid = clean(params.get("uid"));
  const aud = clean(params.get("aud"));
  const expText = clean(params.get("exp"));
  const sig = clean(params.get("sig"));

  const secret = clean(process.env.TRACKING_SIGNING_SECRET);

  if (!cid || !uid || !expText || !sig || !secret) {
    return {
      ok: false,
      reason: "missing_access",
    };
  }

  if (aud !== "contacts" && aud !== "self") {
    return {
      ok: false,
      reason: "bad_audience",
    };
  }

  const exp = Number(expText);
  const now = Math.floor(Date.now() / 1000);

  if (!Number.isFinite(exp)) {
    return {
      ok: false,
      reason: "bad_exp",
    };
  }

  if (exp < now) {
    return {
      ok: false,
      reason: "expired",
    };
  }

  const message = `cid=${cid}&exp=${exp}` + `&uid=${uid}&aud=${aud}`;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  if (!safeEqualBase64Url(expected, sig)) {
    return {
      ok: false,
      reason: "bad_signature",
    };
  }

  return {
    ok: true,
    cid,
    uid,
    aud,
    exp,
  };
}

function createAdminClient() {
  const supabaseUrl = firstNonEmpty([
    process.env.SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ]).replace(/\/+$/g, "");

  const serviceRole = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!supabaseUrl || !serviceRole) {
    throw new Error("check_in_image_service_unavailable");
  }

  return createClient(supabaseUrl, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function parseStorageObject(
  rawValue: string,
  fallbackBucket: string,
): StorageObject | null {
  const value = clean(rawValue);

  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);

      const pathname = decodeURIComponent(url.pathname);

      const patterns = [
        /\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+)$/,
        /\/storage\/v1\/render\/image\/(?:public|sign|authenticated)\/([^/]+)\/(.+)$/,
      ];

      for (const pattern of patterns) {
        const match = pathname.match(pattern);

        if (!match) {
          continue;
        }

        return {
          bucket: match[1],
          path: match[2],
        };
      }

      return null;
    } catch {
      return null;
    }
  }

  const normalized = value.replace(/^\/+/, "");

  if (!normalized) {
    return null;
  }

  const knownBuckets = [
    "avatars",
    "safety-gallery",
    "profile-gallery",
    "profile-avatars",
    "profile-images",
    "profile-photos",
  ];

  for (const bucket of knownBuckets) {
    if (normalized.startsWith(`${bucket}/`)) {
      return {
        bucket,
        path: normalized.slice(bucket.length + 1),
      };
    }
  }

  return {
    bucket: fallbackBucket,
    path: normalized,
  };
}

function contentTypeFromPath(path: string, incoming: string): string {
  const direct = clean(incoming);

  if (direct.startsWith("image/")) {
    return direct;
  }

  const lower = path.toLowerCase();

  if (lower.endsWith(".png")) {
    return "image/png";
  }

  if (lower.endsWith(".webp")) {
    return "image/webp";
  }

  if (lower.endsWith(".gif")) {
    return "image/gif";
  }

  if (lower.endsWith(".avif")) {
    return "image/avif";
  }

  if (lower.endsWith(".svg")) {
    return "image/svg+xml";
  }

  return "image/jpeg";
}

async function downloadStorageObject({
  admin,
  object,
}: {
  admin: SupabaseClient;
  object: StorageObject;
}): Promise<Response | null> {
  try {
    const result = await admin.storage
      .from(object.bucket)
      .download(object.path);

    if (result.error || !result.data) {
      return null;
    }

    const bytes = await result.data.arrayBuffer();

    const contentType = contentTypeFromPath(object.path, result.data.type);

    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return null;
  }
}

async function proxyRemoteImage(rawUrl: string): Promise<Response | null> {
  const value = clean(rawUrl);

  if (!/^https?:\/\//i.test(value)) {
    return null;
  }

  /*
   * Supabase Storage URLs are handled by
   * downloadStorageObject so expired signed
   * URLs do not remain expired.
   */
  if (
    value.includes("/storage/v1/object/") ||
    value.includes("/storage/v1/render/image/")
  ) {
    return null;
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 7000);

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

    if (!response.ok) {
      return null;
    }

    const contentType = clean(response.headers.get("content-type"));

    if (!contentType.startsWith("image/")) {
      return null;
    }

    const bytes = await response.arrayBuffer();

    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function readAvatarCandidates(
  admin: SupabaseClient,
  userId: string,
): Promise<string[]> {
  const candidates: string[] = [];

  try {
    const result = await admin
      .from("user_profile")
      .select("profile_photo_url")
      .eq("user_id", userId)
      .maybeSingle();

    candidates.push(clean(result.data?.profile_photo_url));
  } catch {}

  try {
    const result = await admin
      .from("profiles")
      .select("avatar_url")
      .eq("id", userId)
      .maybeSingle();

    candidates.push(clean(result.data?.avatar_url));
  } catch {}

  try {
    const result = await admin.auth.admin.getUserById(userId);

    const metadata = result.data.user?.user_metadata ?? {};

    candidates.push(
      firstNonEmpty([
        metadata.avatar_url,
        metadata.picture,
        metadata.photo_url,
        metadata.profile_photo_url,
      ]),
    );
  } catch {}

  /*
   * Conventional paths used by StayKnown
   * profile uploads. These are attempted only
   * after the profile database fields.
   */
  candidates.push(
    `${userId}/avatar`,
    `${userId}/avatar.jpg`,
    `${userId}/avatar.jpeg`,
    `${userId}/avatar.png`,
    `${userId}/avatar.webp`,
  );

  return [...new Set(candidates.filter(Boolean))];
}

function storageAttemptsForCandidate(candidate: string): StorageObject[] {
  const attempts: StorageObject[] = [];

  const parsed = parseStorageObject(candidate, "avatars");

  if (parsed) {
    attempts.push(parsed);

    /*
     * Some old profile photos were kept in
     * safety-gallery. Try the same object key
     * there after the primary bucket.
     */
    if (parsed.bucket === "avatars") {
      attempts.push({
        bucket: "safety-gallery",
        path: parsed.path,
      });
    }
  }

  return attempts;
}

export async function GET(request: NextRequest) {
  const verified = verifyAccess(request.nextUrl.searchParams);

  if (!verified.ok) {
    return new Response("Invalid or expired check-in image request.", {
      status: 401,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }

  let admin: SupabaseClient;

  try {
    admin = createAdminClient();
  } catch {
    return new Response("Check-in image service is unavailable.", {
      status: 503,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }

  try {
    const checkInResult = await admin
      .from("daily_safety_checkins")
      .select("id,user_id")
      .eq("id", verified.cid)
      .eq("user_id", verified.uid)
      .maybeSingle();

    if (checkInResult.error || !checkInResult.data) {
      return new Response("Check-in image not found.", {
        status: 404,
        headers: {
          "Cache-Control": "no-store",
        },
      });
    }

    const candidates = await readAvatarCandidates(admin, verified.uid);

    const attemptedObjects = new Set<string>();

    for (const candidate of candidates) {
      const storageAttempts = storageAttemptsForCandidate(candidate);

      for (const object of storageAttempts) {
        const key = `${object.bucket}/${object.path}`;

        if (attemptedObjects.has(key)) {
          continue;
        }

        attemptedObjects.add(key);

        const downloaded = await downloadStorageObject({
          admin,
          object,
        });

        if (downloaded) {
          return downloaded;
        }
      }

      const remote = await proxyRemoteImage(candidate);

      if (remote) {
        return remote;
      }
    }

    return new Response("Check-in avatar not found.", {
      status: 404,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("Check-in avatar is temporarily unavailable.", {
      status: 503,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }
}
