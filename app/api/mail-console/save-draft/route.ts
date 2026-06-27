import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { MAIL_CONSOLE_COOKIE } from "@/lib/mailConsoleServerAuth";
import { requireMailConsoleAdmin } from "@/lib/mailConsoleAdmin";

export const runtime = "nodejs";

type MailMode = "support" | "newsletter" | "advert" | "investor";
type ImagePosition = "none" | "top" | "bottom" | "both";
type AttachmentMode = "attach" | "link_only" | "inline_image";
type BodyMediaPlacement = "top" | "bottom" | "custom";
type BodyImageShape = "banner" | "pill" | "rectangle" | "square" | "circle";
type BodyBlockKind = "audio" | "image" | "message";
type BodyHintFontStyle = "normal" | "italic";
type StoreBadgePlacement = "top" | "bottom";

type MailConsoleAdminClient = Awaited<
  ReturnType<typeof requireMailConsoleAdmin>
>["admin"];

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

type DraftAttachmentRole =
  | "banner_top"
  | "banner_bottom"
  | "body_audio"
  | "body_image"
  | "file";

type DraftStoredAttachment = {
  id: string;
  role: DraftAttachmentRole;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  storage_bucket: string;
  storage_path: string;
  attachment_mode: AttachmentMode;
  display_name: string;
  signed_url?: string;
};

const STORAGE_BUCKET = "mail-console-attachments";
const SIGNED_URL_SECONDS = 7 * 24 * 60 * 60;

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

function safeAttachmentMode(v: unknown): AttachmentMode {
  const s = clean(v).toLowerCase();

  if (s === "link_only") return "link_only";
  if (s === "inline_image") return "inline_image";

  return "attach";
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

function fileExtension(name: string) {
  const safeName = clean(name);
  const match = safeName.match(/(\.[a-z0-9]{1,10})$/i);

  return match ? match[1].toLowerCase() : "";
}

function mimeDefaultExtension(mime: string) {
  const lower = mime.toLowerCase();

  if (lower.includes("png")) return ".png";
  if (lower.includes("jpeg") || lower.includes("jpg")) return ".jpg";
  if (lower.includes("webp")) return ".webp";
  if (lower.includes("gif")) return ".gif";
  if (lower.includes("mp3") || lower.includes("mpeg")) return ".mp3";
  if (lower.includes("wav")) return ".wav";
  if (lower.includes("mp4")) return ".mp4";
  if (lower.includes("pdf")) return ".pdf";
  if (lower.includes("zip")) return ".zip";

  return "";
}

function cleanFilename(name: string) {
  return (
    name
      .replace(/[^\w.\-() ]+/g, "_")
      .replace(/\s+/g, "_")
      .slice(0, 120) || "attachment"
  );
}

function cleanDisplayFilename(
  value: string,
  fallback: string,
  originalName = "",
  mime = "",
) {
  const originalExt = fileExtension(originalName) || mimeDefaultExtension(mime);

  const cleanedBase =
    value
      .trim()
      .replace(/[<>:"/\\|?*\u0000-\u001F]+/g, "")
      .replace(/\s+/g, " ")
      .replace(/\.[a-z0-9]{1,10}$/i, "")
      .slice(0, 90) ||
    fallback
      .trim()
      .replace(/[<>:"/\\|?*\u0000-\u001F]+/g, "")
      .replace(/\s+/g, " ")
      .replace(/\.[a-z0-9]{1,10}$/i, "")
      .slice(0, 90) ||
    "StayKnown File";

  return `${cleanedBase}${originalExt}`;
}

function defaultAttachmentDisplayName(file: File, index: number) {
  const serial = String(index + 1).padStart(2, "0");
  const ext = fileExtension(file.name) || mimeDefaultExtension(file.type);

  if (file.type.startsWith("image/")) return `StayKnown Image ${serial}${ext}`;
  if (file.type.startsWith("audio/")) return `StayKnown Audio ${serial}${ext}`;
  if (file.type.startsWith("video/")) return `StayKnown Video ${serial}${ext}`;

  return `StayKnown File ${serial}${ext}`;
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

function getOptionalFile(form: FormData | null, key: string) {
  if (!form) return null;

  const value = form.get(key);

  return value instanceof File && value.size > 0 ? value : null;
}

function getFiles(form: FormData | null, key: string) {
  if (!form) return [];

  return form
    .getAll(key)
    .filter((value): value is File => value instanceof File && value.size > 0);
}

function getFormStringArray(form: FormData, key: string) {
  const repeated = form
    .getAll(key)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);

  if (repeated.length > 1) return repeated;

  return safeStringArray(clean(form.get(key)));
}

function safeDraftAttachments(v: unknown): DraftStoredAttachment[] {
  if (!Array.isArray(v)) return [];

  return v
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const row = item as Record<string, unknown>;
      const role = clean(row.role) as DraftAttachmentRole;
      const attachmentMode = safeAttachmentMode(row.attachment_mode);
      const storagePath = clean(row.storage_path);
      const fileName = clean(row.file_name);
      const mimeType = clean(row.mime_type) || "application/octet-stream";
      const storageBucket = clean(row.storage_bucket) || STORAGE_BUCKET;
      const sizeBytes = Number(row.size_bytes);

      if (
        role !== "banner_top" &&
        role !== "banner_bottom" &&
        role !== "body_audio" &&
        role !== "body_image" &&
        role !== "file"
      ) {
        return null;
      }

      if (!storagePath || !fileName) return null;

      return {
        id: clean(row.id) || randomUUID(),
        role,
        file_name: fileName,
        display_name: clean(row.display_name) || fileName,
        mime_type: mimeType,
        size_bytes: Number.isFinite(sizeBytes) ? sizeBytes : 0,
        storage_bucket: storageBucket,
        storage_path: storagePath,
        attachment_mode: attachmentMode,
      };
    })
    .filter((item): item is DraftStoredAttachment => Boolean(item));
}

async function signDraftAttachment(
  admin: MailConsoleAdminClient,
  attachment: DraftStoredAttachment,
) {
  const { data, error } = await admin.storage
    .from(attachment.storage_bucket || STORAGE_BUCKET)
    .createSignedUrl(attachment.storage_path, SIGNED_URL_SECONDS);

  return {
    ...attachment,
    signed_url: error ? "" : data?.signedUrl || "",
    signed_url_error: error?.message || null,
  };
}

async function uploadDraftAttachment(params: {
  admin: MailConsoleAdminClient;
  campaignId: string;
  file: File;
  role: DraftAttachmentRole;
  displayName: string;
  attachmentMode: AttachmentMode;
}) {
  const mime = params.file.type || "application/octet-stream";
  const filename = cleanDisplayFilename(
    params.displayName,
    params.file.name || "StayKnown File",
    params.file.name,
    mime,
  );

  const buffer = Buffer.from(await params.file.arrayBuffer());

  const storagePath = `${params.campaignId}/draft-${params.role}-${randomUUID()}-${cleanFilename(
    filename,
  )}`;

  const { error: uploadError } = await params.admin.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, buffer, {
      contentType: mime,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(
      `Draft file upload failed for ${filename}: ${uploadError.message}`,
    );
  }

  await params.admin.from("mail_console_attachments").insert({
    campaign_id: params.campaignId,
    file_name: filename,
    mime_type: mime,
    size_bytes: params.file.size,
    storage_bucket: STORAGE_BUCKET,
    storage_path: storagePath,
    attachment_mode: params.attachmentMode,
    created_by: null,
  });

  return {
    id: randomUUID(),
    role: params.role,
    file_name: filename,
    display_name: filename,
    mime_type: mime,
    size_bytes: params.file.size,
    storage_bucket: STORAGE_BUCKET,
    storage_path: storagePath,
    attachment_mode: params.attachmentMode,
  } satisfies DraftStoredAttachment;
}

function validateDraftFiles(params: {
  bannerTopFile: File | null;
  bannerBottomFile: File | null;
  bodyAudioFile: File | null;
  bodyImageFile: File | null;
  files: File[];
  fileModes: AttachmentMode[];
}) {
  const imageLimit = 8 * 1024 * 1024;
  const audioLimit = 20 * 1024 * 1024;
  const fileLimit = 20 * 1024 * 1024;

  if (params.bannerTopFile && !params.bannerTopFile.type.startsWith("image/")) {
    return "Top banner must be an image file.";
  }

  if (
    params.bannerBottomFile &&
    !params.bannerBottomFile.type.startsWith("image/")
  ) {
    return "Bottom banner must be an image file.";
  }

  if (params.bodyImageFile && !params.bodyImageFile.type.startsWith("image/")) {
    return "Body image must be an image file.";
  }

  if (params.bodyAudioFile && !params.bodyAudioFile.type.startsWith("audio/")) {
    return "Body audio must be an audio file.";
  }

  if (params.bannerTopFile && params.bannerTopFile.size > imageLimit) {
    return "Top banner image must be under 8MB.";
  }

  if (params.bannerBottomFile && params.bannerBottomFile.size > imageLimit) {
    return "Bottom banner image must be under 8MB.";
  }

  if (params.bodyImageFile && params.bodyImageFile.size > imageLimit) {
    return "Body image must be under 8MB.";
  }

  if (params.bodyAudioFile && params.bodyAudioFile.size > audioLimit) {
    return "Body audio must be under 20MB.";
  }

  for (let i = 0; i < params.files.length; i += 1) {
    const file = params.files[i];
    const mode = params.fileModes[i] || "attach";

    if (file.size > fileLimit) {
      return `${file.name || "Attachment"} is too large. Keep each draft attachment under 20MB.`;
    }

    if (mode === "inline_image" && !file.type.startsWith("image/")) {
      return "Only image files can use Inline image mode.";
    }
  }

  return "";
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

    const baseMeta = campaign.meta || {};
    const storedAttachments = safeDraftAttachments(baseMeta.draft_attachments);
    const signedAttachments = await Promise.all(
      storedAttachments.map((attachment) =>
        signDraftAttachment(admin, attachment),
      ),
    );

    const status = clean(campaign.status).toLowerCase();
    const openMode = getOpenMode(status);

    return NextResponse.json({
      ok: true,
      id: campaign.id,
      status,
      open_mode: openMode,
      editable: openMode === "editable",
      readonly: openMode === "readonly",
      attachments: signedAttachments,
      campaign: {
        ...campaign,
        meta: {
          ...baseMeta,
          draft_attachments: signedAttachments,
          draft_attachment_count: signedAttachments.length,
        },
      },
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

    const contentType = req.headers.get("content-type") || "";
    const isMultipart = contentType
      .toLowerCase()
      .includes("multipart/form-data");

    let form: FormData | null = null;
    let body: Record<string, unknown> = {};

    if (isMultipart) {
      form = await req.formData();
    } else {
      const parsed = await req.json().catch(() => ({}));
      body =
        parsed && typeof parsed === "object"
          ? (parsed as Record<string, unknown>)
          : {};
    }

    const field = (key: string) =>
      form ? clean(form.get(key)) : clean(body[key]);
    const fieldUnknown = (key: string) => (form ? form.get(key) : body[key]);

    const stringArrayField = (key: string) =>
      form ? getFormStringArray(form, key) : safeStringArray(body[key]);

    const mode = safeMode(fieldUnknown("mode"));
    const senderIdentityId = field("sender_identity_id");
    const subject = field("subject") || "Untitled Draft";
    const title = field("title") || subject;
    const subtitle = field("subtitle");
    const badge = field("badge");
    const message = field("message");

    const brandLogoUrl = safePublicHttpUrl(fieldUnknown("brand_logo_url"));

    const imageUrl = field("image_url");
    const imagePosition = safeImagePosition(
      fieldUnknown("banner_position") || fieldUnknown("image_position"),
    );

    const bannerHeight = safeNumber(fieldUnknown("banner_height"), 96, 64, 150);
    const bannerNote = field("banner_note");

    const bodyAudioPlacement = safeBodyMediaPlacement(
      fieldUnknown("body_audio_placement"),
    );
    const bodyAudioSize = safeNumber(
      fieldUnknown("body_audio_size"),
      76,
      32,
      100,
    );
    const bodyAudioDisplayName =
      field("body_audio_display_name") || "StayKnown Audio";
    const bodyAudioHint = field("body_audio_hint").slice(0, 160);
    const bodyAudioHintColor = safeHexColor(
      fieldUnknown("body_audio_hint_color"),
    );
    const bodyAudioHintFontStyle = safeBodyHintFontStyle(
      fieldUnknown("body_audio_hint_font_style"),
    );

    const bodyImagePlacement = safeBodyMediaPlacement(
      fieldUnknown("body_image_placement"),
    );
    const bodyImageShape = safeBodyImageShape(fieldUnknown("body_image_shape"));
    const bodyImageSize = safeNumber(
      fieldUnknown("body_image_size"),
      88,
      32,
      100,
    );
    const bodyImageDisplayName =
      field("body_image_display_name") || "StayKnown Image";
    const bodyImageHint = field("body_image_hint").slice(0, 160);
    const bodyImageHintColor = safeHexColor(
      fieldUnknown("body_image_hint_color"),
    );
    const bodyImageHintFontStyle = safeBodyHintFontStyle(
      fieldUnknown("body_image_hint_font_style"),
    );

    const bodyBlockOrder = safeBodyBlockOrder(fieldUnknown("body_block_order"));
    const bodyMediaNote = field("body_media_note");

    const ctaLabel = field("cta_label");
    const ctaUrl = field("cta_url");

    const footerPolicyId = field("footer_policy_id");
    const footerHtml = field("footer_html");

    const policyLinks = stringArrayField("policy_links");

    const storeBadgePlacement = safeStoreBadgePlacement(
      fieldUnknown("store_badge_placement"),
    );
    const googlePlayEnabled = safeBoolean(fieldUnknown("google_play_enabled"));
    const googlePlayUrl = safePublicHttpUrl(fieldUnknown("google_play_url"));
    const appStoreEnabled = safeBoolean(fieldUnknown("app_store_enabled"));
    const appStoreUrl = safePublicHttpUrl(fieldUnknown("app_store_url"));

    const recipientEmails = stringArrayField("recipient_emails").map((email) =>
      email.toLowerCase(),
    );

    const fileModes = stringArrayField("file_modes").map((modeValue) =>
      safeAttachmentMode(modeValue),
    );
    const fileDisplayNames = stringArrayField("file_display_names");

    const bannerTopFile = getOptionalFile(form, "banner_top_file");
    const bannerBottomFile = getOptionalFile(form, "banner_bottom_file");
    const bodyAudioFile = getOptionalFile(form, "body_audio_file");
    const bodyImageFile = getOptionalFile(form, "body_image_file");
    const files = getFiles(form, "files");

    const normalizedFileModes = files.map(
      (_, index) => fileModes[index] || "attach",
    );

    const validationError = validateDraftFiles({
      bannerTopFile,
      bannerBottomFile,
      bodyAudioFile,
      bodyImageFile,
      files,
      fileModes: normalizedFileModes,
    });

    if (validationError) {
      return NextResponse.json(
        {
          ok: false,
          error: validationError,
        },
        { status: 400 },
      );
    }

    const replyMode =
      mode === "newsletter" || mode === "advert" ? "no_reply" : "reply_enabled";

    const bodyHtml = buildDraftBodyHtml({
      message,
      bannerNote,
      bodyMediaNote,
    });

    const baseMeta = {
      created_from: "mail_console_save_draft",
      open_behavior: "draft_opens_editable_sent_opens_readonly",
      draft_storage_version: "formdata_files_v1",
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

      file_modes: normalizedFileModes,
      file_display_names: fileDisplayNames,
    };

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
        meta: baseMeta,
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

    const insertedDraft = data as unknown as DraftInsertResult | null;
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

    const uploadedAttachments: DraftStoredAttachment[] = [];

    if (bannerTopFile) {
      uploadedAttachments.push(
        await uploadDraftAttachment({
          admin,
          campaignId: draftId,
          file: bannerTopFile,
          role: "banner_top",
          displayName: "StayKnown Top Banner",
          attachmentMode: "inline_image",
        }),
      );
    }

    if (bannerBottomFile) {
      uploadedAttachments.push(
        await uploadDraftAttachment({
          admin,
          campaignId: draftId,
          file: bannerBottomFile,
          role: "banner_bottom",
          displayName: "StayKnown Bottom Banner",
          attachmentMode: "inline_image",
        }),
      );
    }

    if (bodyAudioFile) {
      uploadedAttachments.push(
        await uploadDraftAttachment({
          admin,
          campaignId: draftId,
          file: bodyAudioFile,
          role: "body_audio",
          displayName: bodyAudioDisplayName,
          attachmentMode: "link_only",
        }),
      );
    }

    if (bodyImageFile) {
      uploadedAttachments.push(
        await uploadDraftAttachment({
          admin,
          campaignId: draftId,
          file: bodyImageFile,
          role: "body_image",
          displayName: bodyImageDisplayName,
          attachmentMode: "inline_image",
        }),
      );
    }

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const attachmentMode = normalizedFileModes[i] || "attach";
      const displayName = cleanDisplayFilename(
        fileDisplayNames[i] || "",
        defaultAttachmentDisplayName(file, i),
        file.name,
        file.type,
      );

      uploadedAttachments.push(
        await uploadDraftAttachment({
          admin,
          campaignId: draftId,
          file,
          role: "file",
          displayName,
          attachmentMode,
        }),
      );
    }

    const finalMeta = {
      ...baseMeta,
      draft_has_stored_files: uploadedAttachments.length > 0,
      draft_attachment_count: uploadedAttachments.length,
      draft_attachments: uploadedAttachments,
      device_file_warning:
        uploadedAttachments.length > 0
          ? null
          : "No device files were uploaded with this draft.",
    };

    const { error: updateError } = await admin
      .from("mail_console_campaigns")
      .update({
        meta: finalMeta,
      })
      .eq("id", draftId);

    if (updateError) {
      return NextResponse.json(
        {
          ok: false,
          error: updateError.message,
        },
        { status: 500 },
      );
    }

    const signedAttachments = await Promise.all(
      uploadedAttachments.map((attachment) =>
        signDraftAttachment(admin, attachment),
      ),
    );

    return NextResponse.json({
      ok: true,
      draft_id: draftId,
      attachment_count: signedAttachments.length,
      attachments: signedAttachments,
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
