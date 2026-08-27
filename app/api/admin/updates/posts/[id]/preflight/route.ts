import { canonicalPath } from "@/lib/stayknown-updates";
import { requireUpdatesAdmin } from "@/lib/stayknown-updates-auth";
import { inspectSeo, type SeoIssue } from "@/lib/stayknown-updates-seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
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

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await params;
    await requireUpdatesAdmin(req, ["owner", "admin", "editor"]);

    const input = (await req.json()) as Record<string, any>;
    const slug = stringValue(input.slug);
    const status = stringValue(input.status) || "published";

    const issues: SeoIssue[] = inspectSeo({
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
      canonical_path: slug ? canonicalPath(slug) : null,
    });

    if (status === "scheduled") {
      const scheduledFor = stringValue(input.scheduled_for);
      const scheduledTime = scheduledFor
        ? new Date(scheduledFor).getTime()
        : Number.NaN;

      if (!Number.isFinite(scheduledTime) || scheduledTime <= Date.now()) {
        issues.unshift({
          level: "block",
          code: "schedule_invalid",
          message:
            "Schedule time is missing or is not in the future. Choose a future date/time before scheduling.",
        });
      }
    }

    const blockers = issues.filter((issue) => issue.level === "block");
    const warnings = issues.filter((issue) => issue.level === "warning");
    const hints = issues.filter((issue) => issue.level === "hint");

    return noStoreJson({
      ok: blockers.length === 0,
      checkedAt: new Date().toISOString(),
      blockers: blockers.length,
      warnings: warnings.length,
      hints: hints.length,
      issues,
    });
  } catch (error) {
    const status = Number((error as { status?: number })?.status) || 500;

    return noStoreJson(
      {
        ok: false,
        error:
          status === 401
            ? "Sign in to Updates & Publication Admin again."
            : status === 403
              ? "This administrator cannot run publication checks."
              : error instanceof Error
                ? error.message
                : "Publication preflight failed.",
      },
      { status },
    );
  }
}
