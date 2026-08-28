import { adminClient } from "@/lib/stayknown-updates";
import { requireUpdatesAdmin } from "@/lib/stayknown-updates-auth";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_BULK = 100;

function idsFrom(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(String).map((item) => item.trim()).filter((item) => UUID.test(item)))].slice(0, MAX_BULK);
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
    const input = await req.json().catch(() => ({}));
    const action = String(input?.action || "").trim();
    const ids = idsFrom(input?.ids);

    if (!ids.length) {
      return noStoreJson({ ok: false, error: "Choose at least one publication." }, { status: 400 });
    }

    if (action === "permanent_delete") {
      const { user } = await requireUpdatesAdmin(req, ["owner", "admin"]);
      if (input?.confirmation !== "PERMANENTLY DELETE") {
        return noStoreJson({ ok: false, error: "Permanent deletion confirmation is required." }, { status: 409 });
      }

      const sb = adminClient();
      const { data: rows, error: readError } = await sb
        .from("stayknown_updates_posts")
        .select("id,title,status,deleted_at")
        .in("id", ids)
        .not("deleted_at", "is", null);
      if (readError) throw readError;

      const deletableIds = (rows || []).map((row: any) => row.id);
      if (!deletableIds.length) return noStoreJson({ ok: true, count: 0 });

      await sb.from("stayknown_update_audit_log").insert(
        (rows || []).map((row: any) => ({
          post_id: row.id,
          actor_user_id: user.id,
          action: "permanent_delete",
          details: { previous_status: row.status, title: row.title },
        })),
      );

      const { error: deleteError } = await sb
        .from("stayknown_updates_posts")
        .delete()
        .in("id", deletableIds)
        .not("deleted_at", "is", null);
      if (deleteError) throw deleteError;

      return noStoreJson({ ok: true, count: deletableIds.length });
    }

    const { user } = await requireUpdatesAdmin(req, ["owner", "admin", "editor"]);
    const sb = adminClient();

    if (action === "soft_delete") {
      if (input?.confirmation !== "DELETE") {
        return noStoreJson({ ok: false, error: "Deletion confirmation is required." }, { status: 409 });
      }

      const { data: rows, error: readError } = await sb
        .from("stayknown_updates_posts")
        .select("id,title,status,deleted_at")
        .in("id", ids)
        .is("deleted_at", null);
      if (readError) throw readError;

      const activeIds = (rows || []).map((row: any) => row.id);
      if (!activeIds.length) return noStoreJson({ ok: true, count: 0 });

      const deletedAt = new Date();
      const deleteAfter = new Date(deletedAt.getTime() + 90 * 24 * 60 * 60 * 1000);
      const { error: updateError } = await sb
        .from("stayknown_updates_posts")
        .update({
          deleted_at: deletedAt.toISOString(),
          delete_after: deleteAfter.toISOString(),
          deleted_by: user.id,
        })
        .in("id", activeIds)
        .is("deleted_at", null);
      if (updateError) throw updateError;

      await sb.from("stayknown_update_audit_log").insert(
        (rows || []).map((row: any) => ({
          post_id: row.id,
          actor_user_id: user.id,
          action: "soft_deleted",
          details: {
            previous_status: row.status,
            title: row.title,
            delete_after: deleteAfter.toISOString(),
          },
        })),
      );

      return noStoreJson({ ok: true, count: activeIds.length, deleteAfter: deleteAfter.toISOString() });
    }

    if (action === "restore") {
      const { data: rows, error: readError } = await sb
        .from("stayknown_updates_posts")
        .select("id,title,status,deleted_at")
        .in("id", ids)
        .not("deleted_at", "is", null);
      if (readError) throw readError;

      const restoreIds = (rows || []).map((row: any) => row.id);
      if (!restoreIds.length) return noStoreJson({ ok: true, count: 0 });

      const { error: restoreError } = await sb
        .from("stayknown_updates_posts")
        .update({ deleted_at: null, delete_after: null, deleted_by: null })
        .in("id", restoreIds)
        .not("deleted_at", "is", null);
      if (restoreError) throw restoreError;

      await sb.from("stayknown_update_audit_log").insert(
        (rows || []).map((row: any) => ({
          post_id: row.id,
          actor_user_id: user.id,
          action: "restored",
          details: { restored_status: row.status, title: row.title },
        })),
      );

      return noStoreJson({ ok: true, count: restoreIds.length });
    }

    return noStoreJson({ ok: false, error: "Unsupported publication action." }, { status: 400 });
  } catch (error) {
    const status = Number((error as { status?: number })?.status) || 500;
    console.error("updates_publication_action_failed", error);
    return noStoreJson(
      {
        ok: false,
        error:
          status === 401
            ? "Sign in to Updates & Publication Admin again."
            : status === 403
              ? "This administrator cannot perform that publication action."
              : error instanceof Error
                ? error.message
                : "Publication action failed.",
      },
      { status },
    );
  }
}
