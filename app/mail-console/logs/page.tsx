import { NextRequest, NextResponse } from "next/server";
import { MAIL_CONSOLE_COOKIE } from "@/lib/mailConsoleServerAuth";
import { requireMailConsoleAdmin } from "@/lib/mailConsoleAdmin";

export const runtime = "nodejs";

type MailMode = "support" | "newsletter" | "advert" | "investor";
type ImagePosition = "none" | "top" | "bottom" | "both";
type BodyMediaPlacement = "top" | "bottom" | "custom";
type BodyImageShape = "banner" | "pill" | "rectangle" | "square" | "circle";
type BodyBlockKind = "audio" | "image" | "message";
type BodyHintFontStyle = "normal" | "italic";
type StoreBadgePlacement = "top" | "bottom";

type DraftInsertResult = {
  id: string;
};

type CampaignOpenRow = {
  id: string;
  created_at: string | null;
  sent_at: string | null;
  mode: MailMode | string;
  sender_identity_id: string | null;
  footer_policy_id: string | null;
  draft_label: string | null;
  title: string | null;
  subject: string | null;
  body_html: string | null;
  body_text: string | null;
  image_url: string | null;
  image_position: ImagePosition | string | null;
  cta_label: string | null;
  cta_url: string | null;
  footer_html: string | null;
  footer_text: string | null;
  reply_mode: string | null;
  status: string | null;
  meta: Record<string, unknown> | null;
};

function clean(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function escapeHtml(s: string) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeMode(v: unknown): MailMode {
  const s = clean(v).toLowerCase();

  if (s === "newsletter") return "newsletter";
  if (s === "advert") return "advert";
  if (s === "investor") return "investor";

  return "support";
}

function safeImagePosition(v: unknown): ImagePosition {
  const s = clean(v).toLowerCase();

  if (s === "top" || s === "bottom" || s === "both") return s;

  return "none";
}

function safeBodyMediaPlacement(v: unknown): BodyMediaPlacement {
  const s = clean(v).toLowerCase();

  if (s === "top") return "top";
  if (s === "bottom") return "bottom";

  return "custom";
}

function safeBodyImageShape(v: unknown): BodyImageShape {
  const s = clean(v).toLowerCase();

  if (s === "banner") return "banner";
  if (s === "pill") return "pill";
  if (s === "square") return "square";
  if (s === "circle") return "circle";

  return "rectangle";
}

function safeBodyHintFontStyle(v: unknown): BodyHintFontStyle {
  const s = clean(v).toLowerCase();

  return s === "italic" ? "italic" : "normal";
}

function safeStoreBadgePlacement(v: unknown): StoreBadgePlacement {
  const s = clean(v).toLowerCase();

  return s === "top" ? "top" : "bottom";
}

function safeHexColor(v: unknown, fallback = "#6b7280") {
  const s = clean(v);

  return /^#[0-9a-f]{6}$/i.test(s) ? s : fallback;
}

function safeNumber(v: unknown, fallback: number, min: number, max: number) {
  const n = Number(clean(v));

  if (!Number.isFinite(n)) return fallback;

  return Math.max(min, Math.min(max, Math.round(n)));
}

function safeBoolean(v: unknown) {
  if (typeof v === "boolean") return v;

  const s = clean(v).toLowerCase();

  return s === "true" || s === "1" || s === "yes" || s === "on";
}

function safePublicHttpUrl(v: unknown) {
  const url = clean(v);

  if (!url) return "";

  try {
    const parsed = new URL(url);

    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return url;
    }

    return "";
  } catch (_) {
    return "";
  }
}

function safeArrayValue(v: unknown): unknown[] {
  if (Array.isArray(v)) return v;

  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);

      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  return [];
}

function safeStringArray(v: unknown) {
  return safeArrayValue(v)
    .map((x) => clean(x))
    .filter(Boolean);
}

function safeBodyBlockOrder(v: unknown): BodyBlockKind[] {
  const fallback: BodyBlockKind[] = ["audio", "message", "image"];
  const raw = safeArrayValue(v);

  if (raw.length === 0) return fallback;

  const allowed = new Set(["audio", "image", "message"]);

  const cleaned = raw
    .map((x) => clean(x))
    .filter((x): x is BodyBlockKind => allowed.has(x));

  const unique = [...new Set(cleaned)];

  for (const item of fallback) {
    if (!unique.includes(item)) {
      unique.push(item);
    }
  }

  return unique;
}

function textToHtml(text: string) {
  return text
    .trim()
    .split(/\n{2,}/)
    .map((para) => {
      const lines = para
        .split(/\n/)
        .map((line) => escapeHtml(line))
        .join("<br/>");

      return `<p>${lines}</p>`;
    })
    .join("");
}

function htmlToText(html: string) {
  return html
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function draftMediaNoticeHtml(note: string) {
  const cleanNote = clean(note);

  if (!cleanNote) return "";

  return `
    <div style="
      margin-top:14px;
      padding:12px 14px;
      border-radius:16px;
      border:1px solid rgba(0,0,0,0.10);
      background:rgba(0,0,0,0.035);
      color:rgba(0,0,0,0.62);
      font-size:12px;
      line-height:1.55;
      text-align:center;
    ">
      ${escapeHtml(cleanNote)}
    </div>
  `;
}

function buildDraftBodyHtml(params: {
  message: string;
  bannerNote: string;
  bodyMediaNote: string;
}) {
  const messageHtml = textToHtml(params.message);

  return `
    <div style="font-size:15px;line-height:1.75;color:rgba(0,0,0,0.82);">
      ${messageHtml}
    </div>

    ${draftMediaNoticeHtml(params.bannerNote)}
    ${draftMediaNoticeHtml(params.bodyMediaNote)}
  `;
}

function getOpenMode(status: string) {
  return status === "draft" ? "editable" : "readonly";
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(MAIL_CONSOLE_COOKIE)?.value || "";
    const { admin } = await requireMailConsoleAdmin(token);

    const id = clean(req.nextUrl.searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing campaign or draft id.",
        },
        { status: 400 },
      );
    }

    const { data, error } = await admin
      .from("mail_console_campaigns")
      .select(
        [
          "id",
          "created_at",
          "sent_at",
          "mode",
          "sender_identity_id",
          "footer_policy_id",
          "draft_label",
          "title",
          "subject",
          "body_html",
          "body_text",
          "image_url",
          "image_position",
          "cta_label",
          "cta_url",
          "footer_html",
          "footer_text",
          "reply_mode",
          "status",
          "meta",
        ].join(","),
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        { status: 500 },
      );
    }

    const campaign = data as CampaignOpenRow | null;

    if (!campaign) {
      return NextResponse.json(
        {
          ok: false,
          error: "Draft or campaign not found.",
        },
        { status: 404 },
      );
    }

    const status = clean(campaign.status).toLowerCase();
    const openMode = getOpenMode(status);

    return NextResponse.json({
      ok: true,
      id: campaign.id,
      status,
      open_mode: openMode,
      editable: openMode === "editable",
      readonly: openMode === "readonly",
      campaign,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : "Could not open draft or campaign.",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(MAIL_CONSOLE_COOKIE)?.value || "";
    const { admin, adminEmail } = await requireMailConsoleAdmin(token);

    const body = await req.json().catch(() => ({}));

    const mode = safeMode(body.mode);
    const senderIdentityId = clean(body.sender_identity_id);
    const subject = clean(body.subject) || "Untitled Draft";
    const title = clean(body.title) || subject;
    const subtitle = clean(body.subtitle);
    const badge = clean(body.badge);
    const message = clean(body.message);

    const brandLogoUrl = safePublicHttpUrl(body.brand_logo_url);

    const imageUrl = clean(body.image_url);
    const imagePosition = safeImagePosition(
      body.banner_position || body.image_position,
    );

    const bannerHeight = safeNumber(body.banner_height, 96, 64, 150);
    const bannerNote = clean(body.banner_note);

    const bodyAudioPlacement = safeBodyMediaPlacement(
      body.body_audio_placement,
    );
    const bodyAudioSize = safeNumber(body.body_audio_size, 76, 32, 100);
    const bodyAudioDisplayName =
      clean(body.body_audio_display_name) || "StayKnown Audio";
    const bodyAudioHint = clean(body.body_audio_hint).slice(0, 160);
    const bodyAudioHintColor = safeHexColor(body.body_audio_hint_color);
    const bodyAudioHintFontStyle = safeBodyHintFontStyle(
      body.body_audio_hint_font_style,
    );

    const bodyImagePlacement = safeBodyMediaPlacement(
      body.body_image_placement,
    );
    const bodyImageShape = safeBodyImageShape(body.body_image_shape);
    const bodyImageSize = safeNumber(body.body_image_size, 88, 32, 100);
    const bodyImageDisplayName =
      clean(body.body_image_display_name) || "StayKnown Image";
    const bodyImageHint = clean(body.body_image_hint).slice(0, 160);
    const bodyImageHintColor = safeHexColor(body.body_image_hint_color);
    const bodyImageHintFontStyle = safeBodyHintFontStyle(
      body.body_image_hint_font_style,
    );

    const bodyBlockOrder = safeBodyBlockOrder(body.body_block_order);
    const bodyMediaNote = clean(body.body_media_note);

    const ctaLabel = clean(body.cta_label);
    const ctaUrl = clean(body.cta_url);

    const footerPolicyId = clean(body.footer_policy_id);
    const footerHtml = clean(body.footer_html);

    const policyLinks = safeStringArray(body.policy_links);

    const storeBadgePlacement = safeStoreBadgePlacement(
      body.store_badge_placement,
    );
    const googlePlayEnabled = safeBoolean(body.google_play_enabled);
    const googlePlayUrl = safePublicHttpUrl(body.google_play_url);
    const appStoreEnabled = safeBoolean(body.app_store_enabled);
    const appStoreUrl = safePublicHttpUrl(body.app_store_url);

    const recipientEmails = safeStringArray(body.recipient_emails).map(
      (email) => email.toLowerCase(),
    );

    const fileModes = safeStringArray(body.file_modes);
    const fileDisplayNames = safeStringArray(body.file_display_names);

    const replyMode =
      mode === "newsletter" || mode === "advert" ? "no_reply" : "reply_enabled";

    const bodyHtml = buildDraftBodyHtml({
      message,
      bannerNote,
      bodyMediaNote,
    });

    const { data, error } = await admin
      .from("mail_console_campaigns")
      .insert({
        mode,
        sender_identity_id: senderIdentityId || null,
        footer_policy_id: footerPolicyId || null,
        draft_label: title,
        title,
        subject,
        body_html: bodyHtml,
        body_text: message,
        image_url: imageUrl || null,
        image_position: imagePosition,
        cta_label: ctaLabel || null,
        cta_url: ctaUrl || null,
        footer_html: footerHtml,
        footer_text: htmlToText(footerHtml),
        reply_mode: replyMode,
        status: "draft",
        meta: {
          created_from: "mail_console_save_draft",
          open_behavior: "draft_opens_editable_sent_opens_readonly",
          admin_email: adminEmail,

          subtitle: subtitle || null,
          badge: badge || null,
          brand_logo_url: brandLogoUrl || null,

          policy_links: policyLinks,

          store_badge_placement: storeBadgePlacement,
          google_play_enabled: googlePlayEnabled,
          google_play_url: googlePlayUrl || null,
          app_store_enabled: appStoreEnabled,
          app_store_url: appStoreUrl || null,

          banner_position: imagePosition,
          banner_height: bannerHeight,
          banner_note: bannerNote || null,

          body_audio_display_name: bodyAudioDisplayName,
          body_audio_placement: bodyAudioPlacement,
          body_audio_size: bodyAudioSize,
          body_audio_hint: bodyAudioHint || null,
          body_audio_hint_color: bodyAudioHintColor,
          body_audio_hint_font_style: bodyAudioHintFontStyle,

          body_image_display_name: bodyImageDisplayName,
          body_image_placement: bodyImagePlacement,
          body_image_shape: bodyImageShape,
          body_image_size: bodyImageSize,
          body_image_hint: bodyImageHint || null,
          body_image_hint_color: bodyImageHintColor,
          body_image_hint_font_style: bodyImageHintFontStyle,

          body_block_order: bodyBlockOrder,
          body_media_note: bodyMediaNote || null,

          message_has_body_audio_token: message.includes("{{audio}}"),
          message_has_body_image_token: message.includes("{{image}}"),

          recipient_emails: recipientEmails,
          recipient_count: recipientEmails.length,

          file_modes: fileModes,
          file_display_names: fileDisplayNames,

          device_file_warning:
            "Device-selected banner/audio/body-image files are not stored inside this JSON draft. Re-select those files before sending this draft unless a later stored-file draft flow is added.",
        },
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
        },
        { status: 500 },
      );
    }

    const insertedDraft = data as DraftInsertResult | null;
    const draftId = clean(insertedDraft?.id);

    if (!draftId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Draft was saved, but no draft id was returned.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      draft_id: draftId,
      open_url: `/mail-console/send?draft_id=${encodeURIComponent(draftId)}`,
      readonly_url: `/mail-console/send?campaign_id=${encodeURIComponent(
        draftId,
      )}&view=readonly`,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Could not save draft.",
      },
      { status: 500 },
    );
  }
}
