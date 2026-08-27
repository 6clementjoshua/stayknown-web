import { randomUUID } from "node:crypto";

import { adminClient } from "@/lib/stayknown-updates";
import { requireUpdatesAdmin } from "@/lib/stayknown-updates-auth";

export const dynamic = "force-dynamic";

const BUCKET = "stayknown-updates-media";
const MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const ALLOWED_PURPOSES = new Set([
  "representative-16-9",
  "representative-4-3",
  "representative-1-1",
  "article-body",
  "media-library",
]);

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function safeStem(filename: string): string {
  const stem = filename
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return stem || "stayknown-update-image";
}

function noStoreJson(body: unknown, init: ResponseInit = {}) {
  return Response.json(body, {
    ...init,
    headers: {
      "cache-control": "no-store, max-age=0",
      ...(init.headers || {}),
    },
  });
}

export async function POST(req: Request) {
  try {
    await requireUpdatesAdmin(req, ["owner", "admin", "editor"]);

    const payload = await req.json().catch(() => ({}));
    const filename = clean(payload?.filename);
    const mimeType = clean(payload?.mimeType).toLowerCase();
    const purpose = clean(payload?.purpose).toLowerCase();
    const sizeBytes = Number(payload?.sizeBytes);

    if (!filename || filename.length > 255) {
      return noStoreJson(
        { ok: false, error: "Choose a valid image file." },
        { status: 400 },
      );
    }

    const extension = ALLOWED_MIME_TYPES.get(mimeType);
    if (!extension) {
      return noStoreJson(
        {
          ok: false,
          error: "Use a JPEG, PNG or WebP image.",
        },
        { status: 415 },
      );
    }

    if (!Number.isFinite(sizeBytes) || sizeBytes <= 0 || sizeBytes > MAX_BYTES) {
      return noStoreJson(
        {
          ok: false,
          error: "Each Updates image must be 20 MB or smaller.",
        },
        { status: 413 },
      );
    }

    if (!ALLOWED_PURPOSES.has(purpose)) {
      return noStoreJson(
        { ok: false, error: "This image upload purpose is not supported." },
        { status: 400 },
      );
    }

    const storagePath = `uploads/${Date.now()}-${purpose}-${randomUUID()}-${safeStem(
      filename,
    )}.${extension}`;

    const sb = adminClient();
    const { data: signed, error: signedError } = await sb.storage
      .from(BUCKET)
      .createSignedUploadUrl(storagePath);

    if (signedError || !signed?.token) {
      console.error("updates_media_signed_upload_failed", {
        message: signedError?.message || "missing_upload_token",
      });
      return noStoreJson(
        {
          ok: false,
          error: "A secure image upload could not be prepared.",
        },
        { status: 502 },
      );
    }

    const publicUrl = sb.storage.from(BUCKET).getPublicUrl(storagePath).data
      .publicUrl;

    return noStoreJson({
      ok: true,
      bucket: BUCKET,
      path: storagePath,
      token: signed.token,
      publicUrl,
      maxBytes: MAX_BYTES,
    });
  } catch (error) {
    const status = Number((error as { status?: number })?.status) || 500;
    console.error("updates_media_upload_url_failed", error);
    return noStoreJson(
      {
        ok: false,
        error:
          status === 401
            ? "Sign in to Updates & Publication Admin again."
            : status === 403
              ? "This administrator cannot upload publication media."
              : "The image upload service is temporarily unavailable.",
      },
      { status },
    );
  }
}
