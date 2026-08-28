import { randomUUID } from "node:crypto";

import { adminClient, canonicalPath, isPublicPost } from "@/lib/stayknown-updates";
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

function validateFutureSchedule(input: Record<string, unknown>): string | null {
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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { user } = await requireUpdatesAdmin(req, ["owner", "admin", "editor"]);
    const input = (await req.json()) as Record<string, any>;
    const sb = adminClient();

    const { data: existing, error: existingError } = await sb
      .from("stayknown_updates_posts")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();

    if (existingError) throw existingError;
    if (!existing) {
      return Response.json(
        { error: "This publication is unavailable or is in Recently Deleted." },
        { status: 409 },
      );
    }

    const currentlyPublic = isPublicPost(existing as any);

    if (
      currentlyPublic &&
      stringValue(input.slug) &&
      stringValue(input.slug) !== stringValue(existing.slug)
    ) {
      return Response.json(
        {
          error:
            "The slug is locked because this Update is already public. Keep the permanent URL unchanged.",
        },
        { status: 409 },
      );
    }

    if (currentlyPublic && stringValue(input.status) === "draft") {
      return Response.json(
        {
          error:
            "A public Update cannot be moved back to draft. Use the guarded delete flow if it must leave the public website.",
        },
        { status: 409 },
      );
    }

    if (
      currentlyPublic &&
      existing.status === "scheduled" &&
      stringValue(input.status) === "scheduled"
    ) {
      input.status = "published";
      input.published_at =
        nullableTimestamp(input.published_at) ||
        nullableTimestamp(existing.scheduled_for) ||
        new Date().toISOString();
      input.scheduled_for = null;
    } else {
      const scheduleError = validateFutureSchedule(input);
      if (scheduleError) {
        return Response.json({ error: scheduleError }, { status: 400 });
      }
    }

    const publishing = ["published", "scheduled"].includes(input.status);
    const slug = currentlyPublic
      ? stringValue(existing.slug)
      : resolveSlug(input, publishing);
    const canonical = canonicalPath(slug);
    const issues = inspectSeo(seoInput(input, slug));

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
    delete payload.deleted_at;
    delete payload.delete_after;
    delete payload.deleted_by;

    if (input.status === "published" && !payload.published_at) {
      payload.published_at = new Date().toISOString();
    }

    const { data, error } = await sb
      .from("stayknown_updates_posts")
      .update(payload)
      .eq("id", id)
      .is("deleted_at", null)
      .select("*")
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return Response.json(
        { error: "This publication is unavailable or is in Recently Deleted." },
        { status: 409 },
      );
    }

    await sb.from("stayknown_update_audit_log").insert({
      post_id: id,
      actor_user_id: user.id,
      action:
        data.status === "published"
          ? "published"
          : data.status === "scheduled"
            ? "scheduled"
            : "updated",
      details: {
        status: data.status,
        published_at: data.published_at || null,
        scheduled_for: data.scheduled_for || null,
      },
    });

    return Response.json({ post: data, issues });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}
