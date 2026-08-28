import { adminClient } from "@/lib/stayknown-updates";
import { requireUpdatesAdmin } from "@/lib/stayknown-updates-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function publicPostIsLive(post: any): boolean {
  if (!post || post.deleted_at) return false;
  if (post.status === "published") return true;
  if (post.status === "scheduled" && post.scheduled_for) {
    return new Date(post.scheduled_for).getTime() <= Date.now();
  }
  return false;
}

function articleBodyText(blocks: unknown): string {
  if (!Array.isArray(blocks)) return "";
  const lines: string[] = [];

  for (const block of blocks as any[]) {
    if (!block || block.type === "presentation" || block.type === "divider") {
      continue;
    }

    if (
      block.type === "paragraph" ||
      block.type === "heading2" ||
      block.type === "heading3" ||
      block.type === "quote"
    ) {
      const text = clean(block.text);
      if (text) lines.push(text);
      continue;
    }

    if (block.type === "callout") {
      const title = clean(block.title);
      const text = clean(block.text);
      if (title) lines.push(title);
      if (text) lines.push(text);
      continue;
    }

    if (block.type === "link") {
      const label = clean(block.label);
      const url = clean(block.url);
      if (label || url) lines.push([label, url].filter(Boolean).join(" — "));
    }
  }

  return lines.join("\n\n").slice(0, 12000);
}

function pickNewsletterSender(rows: any[]): any | null {
  const stayKnown = rows.filter((row) =>
    clean(row.from_email).toLowerCase().endsWith("@stay-known.com"),
  );

  const ranked = [...stayKnown].sort((a, b) => {
    const score = (row: any) => {
      const email = clean(row.from_email).toLowerCase();
      const label = clean(row.label).toLowerCase();
      const purpose = clean(row.purpose).toLowerCase();
      if (label.includes("stayknown news")) return 0;
      if (email === "no-reply@stay-known.com" && purpose === "newsletter") return 1;
      if (purpose === "newsletter" && !email.startsWith("creators@")) return 2;
      if (email === "stayknown@stay-known.com") return 3;
      if (purpose === "newsletter") return 4;
      return 5;
    };
    return score(a) - score(b);
  });

  return ranked[0] || null;
}

function copyNewsletterPreferences(meta: Record<string, unknown> | null | undefined) {
  const source = meta || {};
  const keys = [
    "policy_links",
    "social_tiktok_enabled",
    "social_tiktok_username",
    "social_twitter_enabled",
    "social_twitter_username",
    "social_facebook_enabled",
    "social_facebook_username",
    "store_badge_placement",
    "google_play_enabled",
    "google_play_url",
    "app_store_enabled",
    "app_store_url",
    "banner_height",
  ] as const;

  const output: Record<string, unknown> = {};
  for (const key of keys) {
    if (source[key] !== undefined) output[key] = source[key];
  }
  return output;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { user } = await requireUpdatesAdmin(request, [
      "owner",
      "admin",
      "editor",
    ]);

    const sb = adminClient();
    const { data: post, error: postError } = await sb
      .from("stayknown_updates_posts")
      .select(
        "id,slug,status,category,title,summary,body,image_16_9_url,hero_image_url,scheduled_for,published_at,updated_at,deleted_at",
      )
      .eq("id", id)
      .maybeSingle();

    if (postError) throw postError;
    if (!post) {
      return Response.json({ error: "Update not found." }, { status: 404 });
    }
    if (!publicPostIsLive(post)) {
      return Response.json(
        {
          error:
            "Publish the Update successfully before preparing its email campaign.",
        },
        { status: 409 },
      );
    }

    const adminEmail = clean(user.email).toLowerCase();
    const { data: mailAdmin, error: mailAdminError } = await sb
      .from("mail_console_admins")
      .select("id,email,role,is_active")
      .ilike("email", adminEmail)
      .eq("is_active", true)
      .maybeSingle();

    if (mailAdminError) throw mailAdminError;
    if (!mailAdmin) {
      return Response.json(
        {
          error:
            "This Updates administrator is not enabled in StayKnown Mail Console.",
        },
        { status: 403 },
      );
    }

    const { data: linkedRows, error: linkedError } = await sb
      .from("mail_console_campaigns")
      .select("id,status,created_at,sent_at,subject,draft_label")
      .contains("meta", { stayknown_update_id: post.id })
      .order("created_at", { ascending: false })
      .limit(20);

    if (linkedError) throw linkedError;

    const linked = linkedRows || [];
    const protectedCampaign = linked.find((row: any) =>
      ["queued", "sending", "sent", "scheduled"].includes(row.status),
    );
    if (protectedCampaign) {
      return Response.json(
        {
          ok: false,
          already_sent: true,
          campaign_id: protectedCampaign.id,
          campaign_status: protectedCampaign.status,
          open_url: "/mail-console/logs",
          error:
            "A linked email campaign already exists for this Update. Duplicate sending was blocked.",
        },
        { status: 409 },
      );
    }

    const existingDraft = linked.find((row: any) => row.status === "draft");
    if (existingDraft) {
      return Response.json({
        ok: true,
        reused: true,
        campaign_id: existingDraft.id,
        campaign_status: existingDraft.status,
        open_url: `/mail-console/send?draft_id=${encodeURIComponent(existingDraft.id)}`,
      });
    }

    const { data: senderRows, error: senderError } = await sb
      .from("mail_console_sender_identities")
      .select(
        "id,label,from_name,from_email,reply_to_email,purpose,can_send_newsletter,is_active",
      )
      .eq("is_active", true)
      .eq("can_send_newsletter", true);

    if (senderError) throw senderError;
    const sender = pickNewsletterSender(senderRows || []);
    if (!sender) {
      return Response.json(
        {
          error:
            "No active StayKnown newsletter-capable sender is available in Mail Console.",
        },
        { status: 409 },
      );
    }

    const { data: footerRows, error: footerError } = await sb
      .from("mail_console_footer_policies")
      .select("id,name,mode,footer_html,footer_text,is_default,is_active")
      .eq("is_active", true)
      .in("mode", ["newsletter", "general"])
      .order("is_default", { ascending: false });

    if (footerError) throw footerError;
    const footerPolicy =
      (footerRows || []).find(
        (row: any) => row.mode === "newsletter" && row.is_default,
      ) ||
      (footerRows || []).find((row: any) => row.mode === "newsletter") ||
      (footerRows || []).find((row: any) => row.is_default) ||
      (footerRows || [])[0] ||
      null;

    if (!footerPolicy) {
      return Response.json(
        {
          error:
            "Mail Console has no active Newsletter or General footer policy. Configure a footer policy before using Publish + Email.",
        },
        { status: 409 },
      );
    }

    const { data: previousCampaigns } = await sb
      .from("mail_console_campaigns")
      .select("sender_identity_id,meta,created_at")
      .eq("mode", "newsletter")
      .eq("sender_identity_id", sender.id)
      .order("created_at", { ascending: false })
      .limit(1);

    const preferenceMeta = copyNewsletterPreferences(
      previousCampaigns?.[0]?.meta as Record<string, unknown> | null,
    );

    const publicUrl = `https://www.stay-known.com/updates/${post.slug}`;
    const representativeImage = clean(post.image_16_9_url || post.hero_image_url);
    const bodyText = articleBodyText(post.body);
    const message = [
      clean(post.summary),
      bodyText,
      "Read the full official StayKnown Update for complete details.",
    ]
      .filter(Boolean)
      .join("\n\n")
      .slice(0, 14000);

    const meta = {
      ...preferenceMeta,
      created_from: "stayknown_updates_publish_email",
      stayknown_update_id: post.id,
      stayknown_update_slug: post.slug,
      stayknown_update_url: publicUrl,
      stayknown_update_banner_url: representativeImage || null,
      stayknown_update_published_at: post.published_at || null,
      stayknown_update_updated_at: post.updated_at || null,
      admin_email: adminEmail,
      subtitle: `${post.category || "Update"} · Official StayKnown Update`,
      badge: "STAYKNOWN UPDATE",
      brand_logo_url: "https://www.stay-known.com/6logo.png",
      policy_links:
        Array.isArray((preferenceMeta as any).policy_links) &&
        (preferenceMeta as any).policy_links.length
          ? (preferenceMeta as any).policy_links
          : ["privacy", "terms"],
      store_badge_placement:
        (preferenceMeta as any).store_badge_placement || "bottom",
      banner_position: representativeImage ? "top" : "none",
      banner_height: Number((preferenceMeta as any).banner_height || 96),
      recipient_emails: [],
      recipient_count: 0,
    };

    const { data: campaign, error: campaignError } = await sb
      .from("mail_console_campaigns")
      .insert({
        mode: "newsletter",
        sender_identity_id: sender.id,
        footer_policy_id: footerPolicy.id,
        draft_label: `Update email · ${post.title}`.slice(0, 240),
        title: clean(post.title) || "StayKnown Update",
        subject: clean(post.title) || "StayKnown Update",
        body_html: `<p>${escapeHtml(message).replaceAll("\n", "<br>")}</p>`,
        body_text: message,
        image_url: representativeImage || null,
        image_position: representativeImage ? "top" : "none",
        cta_label: "READ FULL UPDATE",
        cta_url: publicUrl,
        reply_mode: "no_reply",
        status: "draft",
        created_by: user.id,
        footer_html: null,
        footer_text: null,
        meta,
      })
      .select("id,status")
      .single();

    if (campaignError) throw campaignError;

    await sb.from("stayknown_update_audit_log").insert({
      post_id: post.id,
      actor_user_id: user.id,
      action: "email_draft_prepared",
      details: {
        campaign_id: campaign.id,
        sender_identity_id: sender.id,
        sender_email: sender.from_email,
        footer_policy_id: footerPolicy.id,
        duplicate_guard: true,
      },
    });

    return Response.json({
      ok: true,
      reused: false,
      campaign_id: campaign.id,
      campaign_status: campaign.status,
      open_url: `/mail-console/send?draft_id=${encodeURIComponent(campaign.id)}`,
    });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || "Could not prepare Update email." },
      { status: error?.status || 500 },
    );
  }
}
