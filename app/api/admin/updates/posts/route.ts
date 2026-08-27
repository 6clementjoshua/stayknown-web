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
    // Publication remains strict. inspectSeo() will block a missing/invalid slug.
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

  // Drafts need a valid, collision-resistant internal URL key even while incomplete.
  return `${fromContent}-${randomUUID().slice(0, 8)}`;
}

function nullableTimestamp(value: unknown): string | null {
  const text = stringValue(value);
  return text || null;
}

export async function GET(req: Request) {
  try {
    await requireUpdatesAdmin(req);

    const { data, error } = await adminClient()
      .from("stayknown_updates_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) throw error;
    return Response.json({ posts: data || [] });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}

export async function POST(req: Request) {
  try {
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

    const now = new Date().toISOString();
    const payload: Record<string, any> = {
      ...input,
      slug,
      canonical_path: canonical,
      scheduled_for: nullableTimestamp(input.scheduled_for),
      created_by: user.id,
      updated_by: user.id,
      updated_at: now,
      published_at:
        input.status === "published"
          ? nullableTimestamp(input.published_at) || now
          : nullableTimestamp(input.published_at),
    };

    // The database owns post UUID generation; never insert the client's empty placeholder.
    delete payload.id;
    delete payload.imageMeta;

    const sb = adminClient();
    const { data, error } = await sb
      .from("stayknown_updates_posts")
      .insert(payload)
      .select("*")
      .single();

    if (error) throw error;

    await sb.from("stayknown_update_audit_log").insert({
      post_id: data.id,
      actor_user_id: user.id,
      action: "created",
      details: { status: data.status },
    });

    return Response.json({ post: data, issues }, { status: 201 });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}
