import { randomUUID } from "node:crypto";

import { adminClient, canonicalPath } from "@/lib/stayknown-updates";
import { requireUpdatesAdmin } from "@/lib/stayknown-updates-auth";
import { inspectSeo } from "@/lib/stayknown-updates-seo";

const VALID_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function slugBase(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

function resolveSlug(input: Record<string, unknown>, publishing: boolean): string {
  const requested = stringValue(input.slug);

  if (publishing) {
    return requested;
  }

  if (VALID_SLUG.test(requested)) {
    return requested;
  }

  const fromContent =
    slugBase(requested) ||
    slugBase(stringValue(input.title)) ||
    slugBase(stringValue(input.kicker)) ||
    "draft";

  return `${fromContent}-${randomUUID().slice(0, 8)}`;
}

function nullableTimestamp(value: unknown): string | null {
  const text = stringValue(value);
  return text || null;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { user } = await requireUpdatesAdmin(req, ["owner", "admin", "editor"]);
    const input = (await req.json()) as Record<string, any>;
    const publishing = ["published", "scheduled"].includes(input.status);
    const slug = resolveSlug(input, publishing);
    const canonical = canonicalPath(slug);

    const issues = inspectSeo({
      ...input,
      slug,
      canonical_path: canonical,
    });

    if (publishing && issues.some((issue) => issue.level === "block")) {
      return Response.json({ error: "seo_blocked", issues }, { status: 422 });
    }

    const payload: Record<string, any> = {
      ...input,
      slug,
      canonical_path: canonical,
      scheduled_for: nullableTimestamp(input.scheduled_for),
      published_at: nullableTimestamp(input.published_at),
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    delete payload.id;
    delete payload.created_at;
    delete payload.created_by;
    delete payload.imageMeta;

    if (input.status === "published" && !payload.published_at) {
      payload.published_at = new Date().toISOString();
    }

    const sb = adminClient();
    const { data, error } = await sb
      .from("stayknown_updates_posts")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    await sb.from("stayknown_update_audit_log").insert({
      post_id: id,
      actor_user_id: user.id,
      action: "updated",
      details: { status: data.status },
    });

    return Response.json({ post: data, issues });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}
