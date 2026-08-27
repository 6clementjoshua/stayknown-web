import { adminClient } from "@/lib/stayknown-updates";
import { requireUpdatesAdmin } from "@/lib/stayknown-updates-auth";

export const dynamic = "force-dynamic";

const BUCKET = "stayknown-updates-media";

function noStoreJson(body: unknown, init: ResponseInit = {}) {
  return Response.json(body, {
    ...init,
    headers: {
      "cache-control": "no-store, max-age=0",
      ...(init.headers || {}),
    },
  });
}

export async function GET(req: Request) {
  try {
    await requireUpdatesAdmin(req);

    const sb = adminClient();
    const { data, error } = await sb.storage.from(BUCKET).list("uploads", {
      limit: 100,
      offset: 0,
      sortBy: { column: "created_at", order: "desc" },
    });

    if (error) {
      console.error("updates_media_list_failed", error);
      return noStoreJson(
        { ok: false, error: "Publication media could not be loaded." },
        { status: 502 },
      );
    }

    const files = (data || [])
      .filter((item) => Boolean(item.name) && !item.name.endsWith("/"))
      .map((item) => {
        const path = `uploads/${item.name}`;
        const publicUrl = sb.storage.from(BUCKET).getPublicUrl(path).data
          .publicUrl;

        return {
          name: item.name,
          path,
          publicUrl,
          createdAt: item.created_at || null,
          updatedAt: item.updated_at || null,
          size: Number(item.metadata?.size || 0),
          mimeType: String(item.metadata?.mimetype || ""),
        };
      });

    return noStoreJson({ ok: true, files });
  } catch (error) {
    const status = Number((error as { status?: number })?.status) || 500;
    return noStoreJson(
      {
        ok: false,
        error:
          status === 401
            ? "Sign in to Updates & Publication Admin again."
            : status === 403
              ? "This administrator cannot view publication media."
              : "Publication media is temporarily unavailable.",
      },
      { status },
    );
  }
}
