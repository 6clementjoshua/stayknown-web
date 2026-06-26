import { NextRequest, NextResponse } from "next/server";
import { MAIL_CONSOLE_COOKIE } from "@/lib/mailConsoleServerAuth";
import { requireMailConsoleAdmin } from "@/lib/mailConsoleAdmin";

type MailMode = "support" | "newsletter" | "advert" | "investor";
type ImagePosition = "none" | "top" | "bottom" | "both";
type BodyMediaPlacement = "top" | "bottom" | "custom";
type BodyBlockKind = "audio" | "image" | "message";
type BodyHintFontStyle = "normal" | "italic";

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

function safeBodyHintFontStyle(v: unknown): BodyHintFontStyle {
  const s = clean(v).toLowerCase();

  return s === "italic" ? "italic" : "normal";
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

function safeStringArray(v: unknown) {
  if (!Array.isArray(v)) return [];

  return v.map((x) => clean(x)).filter(Boolean);
}

function safeBodyBlockOrder(v: unknown): BodyBlockKind[] {
  const fallback: BodyBlockKind[] = ["audio", "message", "image"];

  if (!Array.isArray(v)) return fallback;

  const allowed = new Set(["audio", "image", "message"]);

  const cleaned = v
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

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(MAIL_CONSOLE_COOKIE)?.value || "";
    const { admin, adminEmail } = await requireMailConsoleAdmin(token);

    const body = await req.json().catch(() => ({}));

    const mode = safeMode(body.mode);
    const senderIdentityId = clean(body.sender_identity_id);
    const subject = clean(body.subject) || "Untitled Draft";
    const title = clean(body.title) || subject;
    const message = clean(body.message);

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
    const bodyAudioHint = clean(body.body_audio_hint).slice(0, 160);
    const bodyAudioHintColor = safeHexColor(body.body_audio_hint_color);
    const bodyAudioHintFontStyle = safeBodyHintFontStyle(
      body.body_audio_hint_font_style,
    );

    const bodyImagePlacement = safeBodyMediaPlacement(
      body.body_image_placement,
    );
    const bodyImageSize = safeNumber(body.body_image_size, 88, 32, 100);
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

    const recipientEmails = Array.isArray(body.recipient_emails)
      ? body.recipient_emails
          .map((x: unknown) => clean(x).toLowerCase())
          .filter(Boolean)
      : [];

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
          admin_email: adminEmail,

          policy_links: policyLinks,

          banner_position: imagePosition,
          banner_height: bannerHeight,
          banner_note: bannerNote || null,

          body_audio_placement: bodyAudioPlacement,
          body_audio_size: bodyAudioSize,
          body_audio_hint: bodyAudioHint || null,
          body_audio_hint_color: bodyAudioHintColor,
          body_audio_hint_font_style: bodyAudioHintFontStyle,

          body_image_placement: bodyImagePlacement,
          body_image_size: bodyImageSize,
          body_image_hint: bodyImageHint || null,
          body_image_hint_color: bodyImageHintColor,
          body_image_hint_font_style: bodyImageHintFontStyle,

          body_block_order: bodyBlockOrder,
          body_media_note: bodyMediaNote || null,

          recipient_emails: recipientEmails,
          recipient_count: recipientEmails.length,

          device_file_warning:
            "Device-selected banner/audio/body-image files are not stored inside drafts yet. Re-select those files before sending this draft.",

          read_only_view_note:
            "This draft can be opened as read-only text/metadata. Audio and image playback require the files to be uploaded and stored, which this JSON draft endpoint does not currently do.",
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

    return NextResponse.json({
      ok: true,
      draft_id: data.id,
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
