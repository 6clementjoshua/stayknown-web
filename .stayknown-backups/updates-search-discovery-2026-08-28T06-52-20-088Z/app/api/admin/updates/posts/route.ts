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

  if (publishing) return requested;
  if (VALID_SLUG.test(requested)) return requested;

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

function validateSchedule(input: Record<string, unknown>): string | null {
  if (stringValue(input.status) !== "scheduled") return null;

  const value = nullableTimestamp(input.scheduled_for);
  if (!value) return "Choose a future schedule time.";

  const time = new Date(value).getTime();
  if (!Number.isFinite(time) || time <= Date.now()) {
    return "Choose a future schedule time, or publish immediately instead.";
  }

  return null;
}

function seoInput(input: Record<string, any>, slug: string) {
  return {
    title: stringValue(input.title),
    summary: stringValue(input.summary),
    slug,
    category: stringValue(input.category),
    author_name: stringValue(input.author_name) || "StayKnown",
    body: Array.isArray(input.body) ? input.body : [],
    hero_alt_text: stringValue(input.hero_alt_text) || null,
    image_16_9_url: stringValue(input.image_16_9_url) || null,
    image_4_3_url: stringValue(input.image_4_3_url) || null,
    image_1_1_url: stringValue(input.image_1_1_url) || null,
    imageMeta:
      input.imageMeta && typeof input.imageMeta === "object"
        ? input.imageMeta
        : undefined,
    strict_seo: input.strict_seo !== false,
    canonical_path: canonicalPath(slug),
  };
}

export async function GET(req: Request) {
  try {
    await requireUpdatesAdmin(req);

    const { data, error } = await adminClient()
      .from("stayknown_updates_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) throw error;

    const rows = data || [];
    const posts = rows.filter((row: any) => !row.deleted_at);
    const deletedPosts = rows
      .filter((row: any) => Boolean(row.deleted_at))
      .sort(
        (a: any, b: any) =>
          new Date(b.deleted_at || 0).getTime() -
          new Date(a.deleted_at || 0).getTime(),
      );

    return Response.json({ posts, deletedPosts });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await requireUpdatesAdmin(req, ["owner", "admin", "editor"]);
    const input = (await req.json()) as Record<string, any>;
    const scheduleError = validateSchedule(input);
    if (scheduleError) {
      return Response.json({ error: scheduleError }, { status: 400 });
    }

    const publishing = ["published", "scheduled"].includes(input.status);
    const slug = resolveSlug(input, publishing);
    const canonical = canonicalPath(slug);
    const issues = inspectSeo(seoInput(input, slug));

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

    delete payload.id;
    delete payload.imageMeta;
    delete payload.deleted_at;
    delete payload.delete_after;
    delete payload.deleted_by;

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
      action:
        data.status === "published"
          ? "created_published"
          : data.status === "scheduled"
            ? "created_scheduled"
            : "created",
      details: {
        status: data.status,
        published_at: data.published_at || null,
        scheduled_for: data.scheduled_for || null,
      },
    });

    return Response.json({ post: data, issues }, { status: 201 });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}
