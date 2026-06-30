import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getMailConsoleSiteUrl } from "@/lib/mailConsoleAdmin";
import { createUnsubscribeToken } from "@/lib/mailConsoleUnsubscribe";
import {
  MAIL_CONSOLE_COOKIE,
  verifyMailConsoleSessionToken,
} from "@/lib/mailConsoleServerAuth";

export const runtime = "nodejs";

type MailMode = "support" | "newsletter" | "advert" | "investor";
type ImagePosition = "none" | "top" | "bottom" | "both";
type AttachmentMode = "attach" | "link_only" | "inline_image";
type BodyMediaPlacement = "top" | "bottom" | "custom";
type BodyImageShape = "banner" | "pill" | "rectangle" | "square" | "circle";
type BodyBlockKind = "audio" | "image" | "message";
type BodyHintFontStyle = "normal" | "italic";
type StoreBadgePlacement = "top" | "bottom";

type BodyInlineMediaKind = "audio" | "image" | "video" | "file";

type BodyInlineMediaItem = {
  id: string;
  kind: BodyInlineMediaKind;
  displayName: string;
  size: number;
  placement: BodyMediaPlacement;
  hint: string;
  hintColor: string;
  hintFontStyle: BodyHintFontStyle;
  imageShape: BodyImageShape;
  mimeType: string;
  originalName: string;
  fileField: string;
  storageBucket: string;
  storagePath: string;
};

type SenderRow = {
  id: string;
  label: string;
  from_name: string;
  from_email: string;
  reply_to_email: string | null;
  purpose: string;
  can_send_support: boolean;
  can_send_newsletter: boolean;
};

type FooterPolicy = {
  id: string;
  name: string;
  mode: string;
  footer_html: string;
  footer_text: string | null;
};

type ResendAttachment = {
  filename: string;
  content?: string;
  path?: string;
  content_id?: string;
  content_type?: string;
};

type PolicyLinkKey =
  | "privacy"
  | "terms"
  | "location_safety"
  | "contact_consent"
  | "acceptable_use"
  | "safety"
  | "trust_safety"
  | "verification_policy"
  | "emergency"
  | "minors"
  | "guardian_consent"
  | "abuse"
  | "retention"
  | "law"
  | "security"
  | "creator_policy"
  | "donor_policy"
  | "billing_policy"
  | "rides_terms"
  | "rides_privacy"
  | "rides_acceptable_use"
  | "rides_safety"
  | "rides_refunds"
  | "rides_subscription_billing"
  | "rides_partner_terms"
  | "rides_emergency"
  | "rides_contact"
  | "rides_child_student_safety"
  | "rides_insurance_liability"
  | "rides_corporate_sla"
  | "rides_cookies"
  | "foundation_privacy"
  | "foundation_terms"
  | "foundation_donor_privacy"
  | "foundation_refund"
  | "foundation_transparency"
  | "foundation_anti_fraud"
  | "foundation_child_safeguarding"
  | "foundation_whistleblowing"
  | "foundation_cookies";

const BODY_IMAGE_TOKEN = "{{image}}";
const BODY_AUDIO_TOKEN = "{{audio}}";

const SENT_VIEW_SIGNED_URL_SECONDS = 365 * 24 * 60 * 60;
const RESEND_PER_RECIPIENT_WAIT_MS = 2200;

const POLICY_LINK_OPTIONS: Record<
  PolicyLinkKey,
  {
    label: string;
    href: string;
  }
> = {
  privacy: {
    label: "Privacy Policy",
    href: "https://stay-known.com/privacy",
  },
  terms: {
    label: "Terms of Service",
    href: "https://stay-known.com/terms",
  },
  location_safety: {
    label: "Location & Live Safety",
    href: "https://stay-known.com/location-safety",
  },
  contact_consent: {
    label: "Contact Consent",
    href: "https://stay-known.com/contact-consent",
  },
  acceptable_use: {
    label: "Acceptable Use",
    href: "https://stay-known.com/acceptable-use",
  },
  safety: {
    label: "Safety & Anti-Stalking",
    href: "https://stay-known.com/safety",
  },
  trust_safety: {
    label: "Trust & Safety",
    href: "https://stay-known.com/trust-safety",
  },
  verification_policy: {
    label: "Verification Policy",
    href: "https://stay-known.com/verification-policy",
  },
  emergency: {
    label: "Emergency Disclaimer",
    href: "https://stay-known.com/emergency",
  },
  minors: {
    label: "Child Safety & Minor Use",
    href: "https://stay-known.com/minors",
  },
  guardian_consent: {
    label: "Guardian Consent",
    href: "https://stay-known.com/guardian-consent",
  },
  abuse: {
    label: "Abuse Reporting",
    href: "https://stay-known.com/abuse",
  },
  retention: {
    label: "Data Retention",
    href: "https://stay-known.com/retention",
  },
  law: {
    label: "Law Enforcement Requests",
    href: "https://stay-known.com/law",
  },
  security: {
    label: "Security Disclosure",
    href: "https://stay-known.com/security",
  },
  creator_policy: {
    label: "Creator Policy",
    href: "https://stay-known.com/creator-policy",
  },
  donor_policy: {
    label: "Donor Policy",
    href: "https://stay-known.com/donor-policy",
  },
  billing_policy: {
    label: "Billing & Refunds",
    href: "https://stay-known.com/billing-policy",
  },
  rides_terms: {
    label: "Terms of Service",
    href: "https://6rides.com/policies/terms",
  },
  rides_privacy: {
    label: "Privacy Policy",
    href: "https://6rides.com/policies/privacy",
  },
  rides_acceptable_use: {
    label: "Acceptable Use",
    href: "https://6rides.com/policies/acceptable-use",
  },
  rides_safety: {
    label: "Safety Guidelines",
    href: "https://6rides.com/policies/safety",
  },
  rides_refunds: {
    label: "Refund & Cancellation",
    href: "https://6rides.com/policies/refunds",
  },
  rides_subscription_billing: {
    label: "Subscription & Billing",
    href: "https://6rides.com/policies/subscription-billing",
  },
  rides_partner_terms: {
    label: "Partner Terms",
    href: "https://6rides.com/policies/partner-terms",
  },
  rides_emergency: {
    label: "Emergency Disclaimer",
    href: "https://6rides.com/policies/emergency",
  },
  rides_contact: {
    label: "Contact",
    href: "https://6rides.com/policies/contact",
  },
  rides_child_student_safety: {
    label: "Child & Student Safety",
    href: "https://6rides.com/policies/child-student-safety",
  },
  rides_insurance_liability: {
    label: "Insurance & Liability",
    href: "https://6rides.com/policies/insurance-liability",
  },
  rides_corporate_sla: {
    label: "Corporate SLA",
    href: "https://6rides.com/policies/corporate-sla",
  },
  rides_cookies: {
    label: "Cookies Policy",
    href: "https://6rides.com/policies/cookies",
  },
  foundation_privacy: {
    label: "Privacy",
    href: "https://www.6clementjoshuafoundation.com/policies/privacy",
  },
  foundation_terms: {
    label: "Terms",
    href: "https://www.6clementjoshuafoundation.com/policies/terms",
  },
  foundation_donor_privacy: {
    label: "Donor Privacy",
    href: "https://www.6clementjoshuafoundation.com/policies/donor-privacy",
  },
  foundation_refund: {
    label: "Refunds",
    href: "https://www.6clementjoshuafoundation.com/policies/refund",
  },
  foundation_transparency: {
    label: "Transparency",
    href: "https://www.6clementjoshuafoundation.com/policies/transparency",
  },
  foundation_anti_fraud: {
    label: "Anti-Fraud",
    href: "https://www.6clementjoshuafoundation.com/policies/anti-fraud",
  },
  foundation_child_safeguarding: {
    label: "Child Safety",
    href: "https://www.6clementjoshuafoundation.com/policies/child-safeguarding",
  },
  foundation_whistleblowing: {
    label: "Whistleblowing",
    href: "https://www.6clementjoshuafoundation.com/policies/whistleblowing",
  },
  foundation_cookies: {
    label: "Cookies",
    href: "https://www.6clementjoshuafoundation.com/policies/cookies",
  },
};

const SIX_RIDES_POLICY_KEYS: PolicyLinkKey[] = [
  "rides_terms",
  "rides_privacy",
  "rides_acceptable_use",
  "rides_safety",
  "rides_refunds",
  "rides_subscription_billing",
  "rides_partner_terms",
  "rides_emergency",
  "rides_contact",
  "rides_child_student_safety",
  "rides_insurance_liability",
  "rides_corporate_sla",
  "rides_cookies",
];

const FOUNDATION_POLICY_KEYS: PolicyLinkKey[] = [
  "foundation_privacy",
  "foundation_terms",
  "foundation_donor_privacy",
  "foundation_refund",
  "foundation_transparency",
  "foundation_anti_fraud",
  "foundation_child_safeguarding",
  "foundation_whistleblowing",
  "foundation_cookies",
];

function isFoundationPolicyKey(key: PolicyLinkKey) {
  return FOUNDATION_POLICY_KEYS.includes(key);
}

function isSixRidesPolicyKey(key: PolicyLinkKey) {
  return SIX_RIDES_POLICY_KEYS.includes(key);
}

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

function normalizeEmail(v: unknown) {
  const raw = clean(v).replace(/^mailto:/i, "");

  const angleMatch = raw.match(/<([^<>@\s]+@[^<>\s@]+)>/);
  const email = angleMatch ? angleMatch[1] : raw;

  return email
    .trim()
    .replace(/^<+|>+$/g, "")
    .replace(/[.,;:]+$/g, "")
    .toLowerCase();
}

function isValidEmail(email: string) {
  const value = normalizeEmail(email);

  if (!value) return false;
  if (value.length > 254) return false;
  if (/\s|,|;/.test(value)) return false;

  const atIndex = value.indexOf("@");

  if (atIndex <= 0) return false;
  if (atIndex !== value.lastIndexOf("@")) return false;
  if (atIndex >= value.length - 1) return false;

  const local = value.slice(0, atIndex);
  const domain = value.slice(atIndex + 1);

  if (!local || !domain) return false;
  if (local.length > 64) return false;
  if (domain.length > 253) return false;
  if (domain.startsWith(".") || domain.endsWith(".")) return false;
  if (domain.includes("..")) return false;

  return true;
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

function safeBoolean(v: unknown) {
  if (typeof v === "boolean") return v;

  const s = clean(v).toLowerCase();

  return s === "true" || s === "1" || s === "yes" || s === "on";
}

function safePublicHttpUrl(v: unknown) {
  const url = clean(v);

  if (!url) return "";

  return isPublicHttpUrl(url) ? url : "";
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

function isPublicHttpUrl(v: string) {
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch (_) {
    return false;
  }
}

function parseRecipientsStrict(raw: string) {
  const parts = raw
    .split(/[,\n;]/)
    .map((x) => normalizeEmail(x))
    .filter(Boolean);

  const valid: string[] = [];
  const invalid: string[] = [];
  const duplicate: string[] = [];
  const seen = new Set<string>();

  for (const email of parts) {
    if (!isValidEmail(email)) {
      invalid.push(email);
      continue;
    }

    if (seen.has(email)) {
      duplicate.push(email);
      continue;
    }

    seen.add(email);
    valid.push(email);
  }

  return {
    recipients: valid,
    invalid: [...new Set(invalid)],
    duplicate: [...new Set(duplicate)],
  };
}

function parsePolicyLinks(raw: string): PolicyLinkKey[] {
  try {
    const parsed = JSON.parse(raw || "[]");

    if (!Array.isArray(parsed)) {
      return ["privacy", "terms"];
    }

    const allowed = new Set(Object.keys(POLICY_LINK_OPTIONS));

    const links = parsed
      .map((x) => clean(x))
      .filter((x): x is PolicyLinkKey => allowed.has(x));

    return [...new Set(links)];
  } catch (_) {
    return ["privacy", "terms"];
  }
}

function parseBodyBlockOrder(raw: string): BodyBlockKind[] {
  try {
    const parsed = JSON.parse(raw || "[]");

    if (!Array.isArray(parsed)) {
      return ["audio", "message", "image"];
    }

    const allowed = new Set(["audio", "message", "image"]);

    const order = parsed
      .map((x) => clean(x))
      .filter((x): x is BodyBlockKind => allowed.has(x));

    const unique = [...new Set(order)];

    for (const required of ["audio", "message", "image"] as BodyBlockKind[]) {
      if (!unique.includes(required)) {
        unique.push(required);
      }
    }

    return unique;
  } catch (_) {
    return ["audio", "message", "image"];
  }
}

function parseStringArray(raw: string) {
  try {
    const parsed = JSON.parse(raw || "[]");

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((x) => clean(x)).filter(Boolean);
  } catch (_) {
    return [];
  }
}

function parseBodyInlineMediaItems(raw: string): BodyInlineMediaItem[] {
  try {
    const parsed = JSON.parse(raw || "[]");

    if (!Array.isArray(parsed)) return [];

    const items: BodyInlineMediaItem[] = [];

    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;

      const row = item as Record<string, unknown>;
      const id = clean(row.id);
      const kindRaw = clean(row.kind).toLowerCase();

      if (!id) continue;

      if (
        kindRaw !== "audio" &&
        kindRaw !== "image" &&
        kindRaw !== "video" &&
        kindRaw !== "file"
      ) {
        continue;
      }

      const kind = kindRaw as BodyInlineMediaKind;

      const fallbackDisplayName =
        kind === "audio"
          ? "StayKnown Audio"
          : kind === "image"
            ? "StayKnown Image"
            : kind === "video"
              ? "StayKnown Video"
              : "StayKnown File";

      const fallbackMimeType =
        kind === "audio"
          ? "audio/mpeg"
          : kind === "image"
            ? "image/png"
            : kind === "video"
              ? "video/mp4"
              : "application/octet-stream";

      const displayName =
        clean(row.display_name) ||
        clean(row.displayName) ||
        fallbackDisplayName;

      const mimeType = clean(row.mime_type || row.mimeType) || fallbackMimeType;

      items.push({
        id,
        kind,
        displayName,
        size: safeNumber(
          row.size,
          kind === "audio"
            ? 76
            : kind === "image" || kind === "video"
              ? 88
              : 100,
          32,
          100,
        ),
        placement: safeBodyMediaPlacement(row.placement),
        hint: clean(row.hint).slice(0, 160),
        hintColor: safeHexColor(row.hint_color || row.hintColor),
        hintFontStyle: safeBodyHintFontStyle(
          row.hint_font_style || row.hintFontStyle,
        ),
        imageShape:
          kind === "image" || kind === "video"
            ? safeBodyImageShape(row.image_shape || row.imageShape)
            : "rectangle",
        mimeType,
        originalName:
          clean(row.original_name || row.originalName) || displayName,
        fileField:
          clean(row.file_field || row.fileField) ||
          `body_inline_media_file_${id}`,
        storageBucket:
          clean(row.storage_bucket || row.storageBucket) ||
          "mail-console-attachments",
        storagePath: clean(row.storage_path || row.storagePath),
      });
    }

    return items;
  } catch (_) {
    return [];
  }
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

function policyLinksHtml(keys: PolicyLinkKey[]) {
  if (keys.length === 0) return "";

  const links = keys
    .map((key) => {
      const item = POLICY_LINK_OPTIONS[key];

      if (!item) return "";

      return `<a href="${escapeHtml(
        item.href,
      )}" target="_blank" rel="noopener noreferrer" style="color:rgba(0,0,0,0.72);font-weight:900;text-decoration:underline;text-underline-offset:3px;">${escapeHtml(
        item.label,
      )}</a>`;
    })
    .filter(Boolean)
    .join(`<span style="color:rgba(0,0,0,0.25);padding:0 6px;">•</span>`);

  return `
    <div style="
      margin:10px auto 0;
      text-align:center;
      max-width:500px;
      font-size:11px;
      line-height:1.65;
      color:rgba(0,0,0,0.55);
    ">
      ${links}
    </div>
  `;
}

function safeSocialUsername(v: unknown) {
  return clean(v)
    .replace(/^@+/, "")
    .replace(/^https?:\/\/(www\.)?/i, "")
    .replace(/^(tiktok\.com\/@|twitter\.com\/|x\.com\/|facebook\.com\/)/i, "")
    .split(/[/?#]/)[0]
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .slice(0, 60);
}

function socialLinksHtml(params: {
  tiktokEnabled: boolean;
  tiktokUsername: string;
  twitterEnabled: boolean;
  twitterUsername: string;
  facebookEnabled: boolean;
  facebookUsername: string;
}) {
  const links = [
    {
      enabled: params.tiktokEnabled,
      username: safeSocialUsername(params.tiktokUsername),
      href: `https://www.tiktok.com/@${safeSocialUsername(params.tiktokUsername)}`,
      icon: "♪",
      label: "TikTok",
    },
    {
      enabled: params.twitterEnabled,
      username: safeSocialUsername(params.twitterUsername),
      href: `https://twitter.com/${safeSocialUsername(params.twitterUsername)}`,
      icon: "𝕏",
      label: "Twitter",
    },
    {
      enabled: params.facebookEnabled,
      username: safeSocialUsername(params.facebookUsername),
      href: `https://www.facebook.com/${safeSocialUsername(params.facebookUsername)}`,
      icon: "f",
      label: "Facebook",
    },
  ].filter((item) => item.enabled && item.username);

  if (links.length === 0) return "";

  return `
    <div style="
      margin:10px auto 0;
      text-align:center;
      max-width:500px;
      font-size:11px;
      line-height:1.65;
    ">
      ${links
        .map(
          (item) => `
            <a href="${escapeHtml(item.href)}" target="_blank" rel="noopener noreferrer" style="
              display:inline-block;
              margin:4px;
              padding:7px 10px;
              border-radius:999px;
              background:#ffffff;
              color:#050505;
              text-decoration:none;
              font-size:11px;
              font-weight:900;
              border:1px solid rgba(0,0,0,0.10);
            ">
              <span style="
                display:inline-block;
                width:18px;
                height:18px;
                margin-right:5px;
                border-radius:999px;
                background:#050505;
                color:#ffffff;
                text-align:center;
                line-height:18px;
                font-size:11px;
                font-weight:950;
              ">${escapeHtml(item.icon)}</span>
              ${escapeHtml(item.label)}
            </a>
          `,
        )
        .join("")}
    </div>
  `;
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

      return `<p style="margin:0 0 14px 0;font-size:15px;line-height:1.75;color:rgba(0,0,0,0.82);">${lines}</p>`;
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

function trademarkHtml(appName: string) {
  return `
    <div style="text-align:center;margin:0 0 10px 0;">
      <div style="font-size:12px;font-weight:950;letter-spacing:2.6px;color:rgba(0,0,0,0.78);">
        ${escapeHtml(appName)}™
      </div>
      <div style="height:6px;"></div>
      <div style="font-size:11px;font-weight:900;letter-spacing:1.6px;color:rgba(0,0,0,0.58);">
        A 6 Clement Joshua service™
      </div>
      <div style="height:10px;"></div>
    </div>
  `;
}

function brandLogoHtml(appName: string, brandLogoUrl: string) {
  if (!brandLogoUrl) {
    return trademarkHtml(appName);
  }

  return `
    ${trademarkHtml(appName)}
    <div style="text-align:center;margin:0 0 10px 0;">
      <img src="${escapeHtml(brandLogoUrl)}" width="64" height="64" alt="${escapeHtml(
        appName,
      )}" style="display:inline-block;width:64px;height:64px;border-radius:18px;background:#ffffff;box-shadow:0 14px 38px rgba(0,0,0,0.14);" />
      <div style="height:6px;"></div>
    </div>
  `;
}

function pill(text: string) {
  return `
    <span style="
      display:inline-block;
      padding:6px 12px;
      border-radius:999px;
      border:1px solid rgba(0,0,0,0.10);
      background:rgba(255,255,255,0.72);
      box-shadow:inset 0 1px 0 rgba(255,255,255,0.85),0 10px 30px rgba(0,0,0,0.06);
      font-size:12px;
      font-weight:800;
      letter-spacing:0.6px;
      color:#111;
    ">${escapeHtml(text)}</span>
  `;
}

function bannerImageBlock(contentId: string, alt: string, height: number) {
  return `
    <div style="
      margin:12px 0;
      border-radius:16px;
      border:1px solid rgba(0,0,0,0.10);
      overflow:hidden;
      background:#ffffff;
      box-shadow:0 14px 34px rgba(0,0,0,0.07);
    ">
      <img src="cid:${escapeHtml(contentId)}" alt="${escapeHtml(
        alt,
      )}" style="display:block;width:100%;height:${height}px;max-height:${height}px;object-fit:cover;" />
    </div>
  `;
}

function inlineImageBlock(contentId: string, alt: string) {
  return `
    <div style="
      margin:14px 0;
      border-radius:18px;
      border:1px solid rgba(0,0,0,0.10);
      overflow:hidden;
      background:#ffffff;
      box-shadow:0 16px 45px rgba(0,0,0,0.07);
    ">
      <img src="cid:${escapeHtml(contentId)}" alt="${escapeHtml(
        alt,
      )}" style="display:block;width:100%;max-height:360px;object-fit:cover;" />
    </div>
  `;
}

function bodyImageBlock(params: {
  url: string;
  alt: string;
  size: number;
  shape: BodyImageShape;
  hint: string;
  hintColor: string;
  hintFontStyle: BodyHintFontStyle;
}) {
  const hint = clean(params.hint);
  const hintColor = safeHexColor(params.hintColor);
  const hintFontStyle = safeBodyHintFontStyle(params.hintFontStyle);

  if (!params.url) return "";

  let borderRadius = "18px";
  let imageHeight = "auto";
  let maxHeight = "none";
  let objectFit = "contain";

  if (params.shape === "banner") {
    borderRadius = "18px";
    maxHeight = "260px";
    objectFit = "cover";
  } else if (params.shape === "pill") {
    borderRadius = "28px";
    maxHeight = "280px";
    objectFit = "cover";
  } else if (params.shape === "square") {
    borderRadius = "18px";
    maxHeight = "520px";
    objectFit = "cover";
  } else if (params.shape === "circle") {
    borderRadius = "999px";
    maxHeight = "420px";
    objectFit = "cover";
  }

  return `
    <div style="text-align:center;margin:16px 0;width:100%;">
      <div style="
        display:block;
        width:100%;
        max-width:100%;
        border-radius:${borderRadius};
        overflow:hidden;
        border:1px solid rgba(0,0,0,0.10);
        background:#ffffff;
        box-shadow:0 16px 45px rgba(0,0,0,0.07);
      ">
        <img src="${escapeHtml(params.url)}" alt="${escapeHtml(
          params.alt,
        )}" style="
          display:block;
          width:100%;
          max-width:100%;
          height:${imageHeight};
          max-height:${maxHeight};
          object-fit:${objectFit};
          object-position:center;
          background:#ffffff;
        " />
      </div>

      ${
        hint
          ? `<div style="
              width:100%;
              max-width:100%;
              margin:7px auto 0;
              text-align:center;
              font-size:11px;
              line-height:1.45;
              color:${escapeHtml(hintColor)};
              font-style:${hintFontStyle};
            ">${escapeHtml(hint)}</div>`
          : ""
      }
    </div>
  `;
}

function bodyFileLinkBlock(params: {
  url: string;
  displayName: string;
  hint: string;
  hintColor: string;
  hintFontStyle: BodyHintFontStyle;
}) {
  const hint = clean(params.hint);
  const hintColor = safeHexColor(params.hintColor);
  const hintFontStyle = safeBodyHintFontStyle(params.hintFontStyle);
  const displayName = clean(params.displayName) || "StayKnown File";

  if (!params.url) return "";

  return `
    <div style="text-align:center;margin:16px 0;width:100%;">
      <a href="${escapeHtml(params.url)}" target="_blank" rel="noopener noreferrer" style="
        display:block;
        width:100%;
        box-sizing:border-box;
        border-radius:22px;
        padding:14px 16px;
        background:#ffffff;
        color:#050505;
        text-decoration:none;
        border:1px solid rgba(0,0,0,0.10);
        box-shadow:0 16px 45px rgba(0,0,0,0.07);
      ">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;">
          <tr>
            <td style="text-align:left;vertical-align:middle;">
              <div style="
                font-size:14px;
                line-height:1.35;
                font-weight:950;
                color:#050505;
                overflow:hidden;
                text-overflow:ellipsis;
                white-space:nowrap;
              ">${escapeHtml(displayName)}</div>

             <div style="
  margin-top:4px;
  font-size:11px;
  line-height:1.35;
  font-weight:800;
  color:rgba(0,0,0,0.55);
">File attachment</div>
            </td>

            <td width="44" align="right" style="width:44px;text-align:right;vertical-align:middle;">
              <span style="
                display:inline-block;
                width:38px;
                height:38px;
                border-radius:999px;
                background:#050505;
                color:#ffffff;
                text-align:center;
                line-height:38px;
                font-size:16px;
                font-weight:950;
              ">↗</span>
            </td>
          </tr>
        </table>
      </a>

      ${
        hint
          ? `<div style="
              width:100%;
              max-width:100%;
              margin:7px auto 0;
              text-align:center;
              font-size:11px;
              line-height:1.45;
              color:${escapeHtml(hintColor)};
              font-style:${hintFontStyle};
            ">${escapeHtml(hint)}</div>`
          : ""
      }
    </div>
  `;
}

function bodyVideoLinkBlock(params: {
  url: string;
  displayName: string;
  size: number;
  hint: string;
  hintColor: string;
  hintFontStyle: BodyHintFontStyle;
}) {
  const hint = clean(params.hint);
  const hintColor = safeHexColor(params.hintColor);
  const hintFontStyle = safeBodyHintFontStyle(params.hintFontStyle);
  const displayName = clean(params.displayName) || "StayKnown Video";

  if (!params.url) return "";

  return `
    <div style="text-align:center;margin:16px 0;width:100%;">
      <a href="${escapeHtml(params.url)}" target="_blank" rel="noopener noreferrer" style="
        display:inline-block;
        width:${params.size}%;
        max-width:100%;
        min-width:250px;
        box-sizing:border-box;
        border-radius:22px;
        padding:14px 16px;
        background:#ffffff;
        color:#050505;
        text-decoration:none;
        border:1px solid rgba(0,0,0,0.10);
        box-shadow:0 16px 45px rgba(0,0,0,0.07);
      ">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;">
          <tr>
            <td width="48" style="width:48px;text-align:left;vertical-align:middle;">
              <span style="
                display:inline-block;
                width:42px;
                height:42px;
                border-radius:999px;
                background:#050505;
                color:#ffffff;
                text-align:center;
                line-height:42px;
                font-size:16px;
                font-weight:950;
              ">▶</span>
            </td>

            <td style="text-align:left;vertical-align:middle;">
              <div style="
                font-size:14px;
                line-height:1.35;
                font-weight:950;
                color:#050505;
                overflow:hidden;
                text-overflow:ellipsis;
                white-space:nowrap;
              ">${escapeHtml(displayName)}</div>

              <div style="
                margin-top:4px;
                font-size:11px;
                line-height:1.35;
                font-weight:800;
                color:rgba(0,0,0,0.55);
              ">Tap to watch video</div>
            </td>

            <td width="44" align="right" style="width:44px;text-align:right;vertical-align:middle;">
              <span style="
                display:inline-block;
                width:38px;
                height:38px;
                border-radius:999px;
                background:#050505;
                color:#ffffff;
                text-align:center;
                line-height:38px;
                font-size:16px;
                font-weight:950;
              ">↗</span>
            </td>
          </tr>
        </table>
      </a>

      ${
        hint
          ? `<div style="
              width:${params.size}%;
              max-width:100%;
              margin:7px auto 0;
              text-align:center;
              font-size:11px;
              line-height:1.45;
              color:${escapeHtml(hintColor)};
              font-style:${hintFontStyle};
            ">${escapeHtml(hint)}</div>`
          : ""
      }
    </div>
  `;
}

function bodyAudioPillBlock(params: {
  url: string;
  displayName: string;
  size: number;
  hint: string;
  hintColor: string;
  hintFontStyle: BodyHintFontStyle;
}) {
  const hint = clean(params.hint);
  const hintColor = safeHexColor(params.hintColor);
  const hintFontStyle = safeBodyHintFontStyle(params.hintFontStyle);
  const displayName = clean(params.displayName) || "StayKnown Audio";

  return `
    <div style="text-align:center;margin:16px 0;">
      <a
        href="${escapeHtml(params.url)}"
        target="_blank"
        rel="noopener noreferrer"
        style="
          display:inline-block;
          width:${params.size}%;
          max-width:100%;
          min-width:250px;
          box-sizing:border-box;
          border-radius:999px;
          text-decoration:none;
          color:#111111;
        "
      >
        <table
          role="presentation"
          cellpadding="0"
          cellspacing="0"
          width="100%"
          style="
            width:100%;
            border-collapse:separate;
            border-spacing:0;
            border-radius:999px;
            overflow:hidden;
            background:#ffffff;
            border:1px solid rgba(255,255,255,0.92);
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,0.96),
              inset 0 -1px 0 rgba(210,210,210,0.72),
              0 16px 42px rgba(0,0,0,0.16);
          "
        >
          <tr>
            <td
              width="58"
              valign="middle"
              style="
                width:58px;
                padding:10px 0 10px 12px;
                vertical-align:middle;
              "
            >
              <span
                style="
                  width:42px;
                  height:42px;
                  border-radius:999px;
                  display:inline-block;
                  text-align:center;
                  line-height:42px;
                  background:
                    radial-gradient(circle at 30% 24%, #ffffff 0%, #f5f5f5 42%, #dcdcdc 100%);
                  border:1px solid rgba(210,210,210,0.95);
                  box-shadow:
                    inset 0 2px 3px rgba(255,255,255,0.95),
                    inset 0 -3px 7px rgba(0,0,0,0.10),
                    0 8px 18px rgba(0,0,0,0.12);
                  color:#111111;
                  font-size:14px;
                  font-weight:900;
                "
              >▶</span>
            </td>

            <td
              valign="middle"
              style="
                padding:10px 10px 10px 4px;
                vertical-align:middle;
                text-align:left;
              "
            >
              <div
                style="
                  font-size:14px;
                  line-height:1.2;
                  font-weight:950;
                  color:#111111;
                  white-space:nowrap;
                  overflow:hidden;
                  text-overflow:ellipsis;
                  letter-spacing:-0.1px;
                "
              >${escapeHtml(displayName)}</div>

              <div
                style="
                  margin-top:7px;
                  height:6px;
                  border-radius:999px;
                  background:#e9e9e9;
                  overflow:hidden;
                  box-shadow:inset 0 1px 2px rgba(0,0,0,0.08);
                "
              >
                <div
                  style="
                    width:34%;
                    height:6px;
                    border-radius:999px;
                    background:
                      linear-gradient(90deg, #111111 0%, #4b4b4b 100%);
                  "
                ></div>
              </div>

              <div
                style="
                  margin-top:5px;
                  font-size:10px;
                  line-height:1.2;
                  color:rgba(17,17,17,0.55);
                  white-space:nowrap;
                  overflow:hidden;
                  text-overflow:ellipsis;
                "
              >Audio message</div>
            </td>

            <td
              width="88"
              valign="middle"
              align="right"
              style="
                width:88px;
                padding:10px 14px 10px 4px;
                vertical-align:middle;
                text-align:right;
              "
            >
              <span
  style="
    display:inline-block;
    font-size:11px;
    line-height:1.2;
    font-weight:950;
    color:rgba(17,17,17,0.72);
    white-space:nowrap;
  "
>Audio</span>
            </td>
          </tr>
        </table>
      </a>

      ${
        hint
          ? `<div style="
              width:${params.size}%;
              max-width:100%;
              margin:8px auto 0;
              text-align:center;
              font-size:11px;
              line-height:1.45;
              color:${escapeHtml(hintColor)};
              font-style:${hintFontStyle};
            ">${escapeHtml(hint)}</div>`
          : ""
      }
    </div>
  `;
}
function ctaButton(label: string, url: string) {
  if (!label || !url || !isPublicHttpUrl(url)) return "";

  return `
    <div style="text-align:center;margin-top:18px;margin-bottom:4px;">
      <a href="${escapeHtml(url)}" style="
        display:inline-block;
        padding:12px 16px;
        border-radius:999px;
        border:1px solid rgba(0,0,0,0.10);
        background:rgba(255,255,255,0.86);
        color:#0b0b0b;
        text-decoration:none;
        font-weight:950;
        letter-spacing:0.3px;
        box-shadow:inset 0 1px 0 rgba(255,255,255,0.92),0 18px 45px rgba(0,0,0,0.075);
      ">${escapeHtml(label)}</a>
    </div>
  `;
}

function storeBadgesBlock(params: {
  placement: StoreBadgePlacement;
  googlePlayEnabled: boolean;
  googlePlayUrl: string;
  appStoreEnabled: boolean;
  appStoreUrl: string;
}) {
  const stores: Array<{
    enabled: boolean;
    href: string;
    icon: string;
    eyebrow: string;
    label: string;
  }> = [
    {
      enabled: params.googlePlayEnabled,
      href: params.googlePlayUrl,
      icon: "▶",
      eyebrow: "GET IT ON",
      label: "Google Play",
    },
    {
      enabled: params.appStoreEnabled,
      href: params.appStoreUrl,
      icon: "",
      eyebrow: "Download on the",
      label: "App Store",
    },
  ].filter((item) => item.enabled && item.href);

  if (stores.length === 0) return "";

  const badges = stores
    .map(
      (item) => `
        <a href="${escapeHtml(item.href)}" target="_blank" rel="noopener noreferrer" style="
          display:inline-flex;
          align-items:center;
          gap:9px;
          min-width:154px;
          min-height:48px;
          box-sizing:border-box;
          border-radius:13px;
          background:#050505;
          color:#ffffff;
          padding:8px 12px;
          text-decoration:none;
          box-shadow:0 14px 34px rgba(0,0,0,0.14);
        ">
          <span style="
            width:26px;
            min-width:26px;
            height:26px;
            display:inline-flex;
            align-items:center;
            justify-content:center;
            font-size:20px;
            line-height:1;
          ">${escapeHtml(item.icon)}</span>

          <span style="display:block;text-align:left;">
            <span style="
              display:block;
              font-size:8px;
              line-height:1;
              font-weight:800;
              letter-spacing:0.4px;
              opacity:0.86;
              text-transform:uppercase;
            ">${escapeHtml(item.eyebrow)}</span>

            <span style="
              display:block;
              margin-top:2px;
              font-size:17px;
              line-height:1.08;
              font-weight:950;
              letter-spacing:-0.2px;
            ">${escapeHtml(item.label)}</span>
          </span>
        </a>
      `,
    )
    .join("");

  return `
    <div style="
      text-align:center;
      margin:${params.placement === "top" ? "0 0 14px" : "16px 0 0"};
    ">
      <div style="
        display:inline-flex;
        flex-wrap:wrap;
        align-items:center;
        justify-content:center;
        gap:10px;
      ">
        ${badges}
      </div>
    </div>
  `;
}

function dividerHtml() {
  return `<div style="height:1px;background:rgba(0,0,0,0.08);margin:16px 0;"></div>`;
}

function centeredFooterTextHtml(footerText: string) {
  const cleanFooter = clean(footerText);

  if (!cleanFooter) return "";

  return `
    <div style="
      text-align:center;
      margin:0 auto;
      max-width:500px;
      font-size:11px;
      line-height:1.65;
      color:rgba(0,0,0,0.55);
    ">
      ${escapeHtml(cleanFooter).replaceAll("\n", "<br/>")}
    </div>
  `;
}

function linkOnlyFilesBlock(files: Array<{ filename: string; url: string }>) {
  if (files.length === 0) return "";

  const items = files
    .map(
      (f) => `
      <div style="padding:10px 0;border-top:1px solid rgba(0,0,0,0.08);">
        <a href="${escapeHtml(
          f.url,
        )}" style="color:#050505;font-weight:900;text-decoration:none;">
          ${escapeHtml(f.filename)}
        </a>
      </div>
    `,
    )
    .join("");

  return `
    <div style="
      margin-top:16px;
      padding:14px;
      border-radius:18px;
      border:1px solid rgba(0,0,0,0.10);
      background:rgba(255,255,255,0.70);
      box-shadow:inset 0 1px 0 rgba(255,255,255,0.85),0 18px 50px rgba(0,0,0,0.06);
    ">
      <div style="font-size:12px;font-weight:950;letter-spacing:1.4px;text-transform:uppercase;color:rgba(0,0,0,0.58);">
        Secure file links
      </div>
      ${items}
      <div style="font-size:11px;line-height:1.5;color:rgba(0,0,0,0.55);margin-top:8px;">
        These links may expire for security.
      </div>
    </div>
  `;
}

function emailShell(p: {
  appName: string;
  brandLogoUrl: string;
  title: string;
  subtitle: string;
  badge: string;
  contentHtml: string;
  footerHtml: string;
}) {
  const year = new Date().getFullYear();
  const legalLine = `© ${year} ${p.appName}™ · A 6 Clement Joshua service™`;

  return `
  <div style="margin:0;padding:0;background:#f3f4f6;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f3f4f6;padding:26px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="560" style="width:560px;max-width:100%;">
            <tr>
              <td style="padding:10px 6px;">
                ${brandLogoHtml(p.appName, p.brandLogoUrl)}

                <div style="text-align:center;font-size:18px;font-weight:950;letter-spacing:0.6px;color:#0b0b0b;line-height:1.35;">
                  ${escapeHtml(p.title)}
                </div>

                ${
                  p.badge
                    ? `<div style="text-align:center;margin:10px 0 0 0;">${pill(p.badge)}</div>`
                    : ""
                }

                ${
                  p.subtitle
                    ? `<div style="text-align:center;margin:10px 0 0 0;font-size:13px;color:rgba(0,0,0,0.65);line-height:1.55;">${escapeHtml(p.subtitle)}</div>`
                    : ""
                }

                <div style="height:18px;"></div>

                <div style="
                  border-radius:22px;
                  border:1px solid rgba(0,0,0,0.10);
                  background:rgba(255,255,255,0.78);
                  box-shadow:inset 0 1px 0 rgba(255,255,255,0.92),0 28px 75px rgba(0,0,0,0.09);
                  overflow:hidden;
                ">
                  <div style="padding:18px 20px;">
                    ${p.contentHtml}
                  </div>
                </div>

                <div style="height:14px;"></div>

                <div style="text-align:center;font-size:11px;color:rgba(0,0,0,0.55);line-height:1.5;">
                  ${p.footerHtml}
                  <!--SK_UNSUBSCRIBE-->
                  <div style="height:6px;"></div>
                  <span style="color:rgba(0,0,0,0.52);">${escapeHtml(legalLine)}</span>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>`;
}

function resolveBodyBlockOrder(params: {
  rawOrder: BodyBlockKind[];
  hasAudio: boolean;
  hasImage: boolean;
  audioPlacement: BodyMediaPlacement;
  imagePlacement: BodyMediaPlacement;
  audioAlreadyInsideMessage: boolean;
  imageAlreadyInsideMessage: boolean;
}) {
  const enabled = new Set<BodyBlockKind>(["message"]);

  if (params.hasAudio) enabled.add("audio");
  if (params.hasImage) enabled.add("image");

  const base = params.rawOrder.filter((x) => enabled.has(x));

  if (!base.includes("message")) {
    base.push("message");
  }

  const topBlocks: BodyBlockKind[] = [];
  const customBlocks: BodyBlockKind[] = [];
  const bottomBlocks: BodyBlockKind[] = [];

  for (const block of base) {
    if (block === "message") {
      customBlocks.push(block);
      continue;
    }

    if (block === "audio" && params.audioAlreadyInsideMessage) {
      continue;
    }

    if (block === "image" && params.imageAlreadyInsideMessage) {
      continue;
    }

    const placement =
      block === "audio" ? params.audioPlacement : params.imagePlacement;

    if (placement === "top") {
      topBlocks.push(block);
    } else if (placement === "bottom") {
      bottomBlocks.push(block);
    } else {
      customBlocks.push(block);
    }
  }

  return [...topBlocks, ...customBlocks, ...bottomBlocks];
}

function renderMessageHtmlWithInlineMedia(params: {
  message: string;
  bodyAudioHtml: string;
  bodyImageHtml: string;
  bodyInlineMediaHtmlByToken: Record<string, string>;
}) {
  const source = params.message || "";

  if (!source.trim()) return "";

  const parts = source.split(
    /(\{\{image:[^}]+\}\}|\{\{audio:[^}]+\}\}|\{\{video:[^}]+\}\}|\{\{file:[^}]+\}\}|\{\{image\}\}|\{\{audio\}\})/g,
  );

  return parts
    .map((part) => {
      if (part === BODY_IMAGE_TOKEN) {
        return params.bodyImageHtml || "";
      }

      if (part === BODY_AUDIO_TOKEN) {
        return params.bodyAudioHtml || "";
      }

      if (params.bodyInlineMediaHtmlByToken[part]) {
        return params.bodyInlineMediaHtmlByToken[part];
      }

      return textToHtml(part);
    })
    .join("");
}

function buildHtml(p: {
  appName: string;
  brandLogoUrl: string;
  mode: MailMode;
  title: string;
  subtitle: string;
  badge: string;
  message: string;
  bannerTopContentId: string;
  bannerBottomContentId: string;
  bannerPosition: ImagePosition;
  bannerHeight: number;
  ctaLabel: string;
  ctaUrl: string;
  storeBadgePlacement: StoreBadgePlacement;
  googlePlayEnabled: boolean;
  googlePlayUrl: string;
  appStoreEnabled: boolean;
  appStoreUrl: string;
  footerHtml: string;
  inlineImageBlocks: string;
  linkOnlyFiles: Array<{ filename: string; url: string }>;
  bodyAudioUrl: string;
  bodyAudioDisplayName: string;
  bodyAudioHint: string;
  bodyAudioHintColor: string;
  bodyAudioHintFontStyle: BodyHintFontStyle;
  bodyAudioSize: number;
  bodyImageUrl: string;
  bodyImageMimeType: string;
  bodyImageDisplayName: string;
  bodyImageShape: BodyImageShape;
  bodyImageHint: string;
  bodyImageHintColor: string;
  bodyImageHintFontStyle: BodyHintFontStyle;
  bodyImageSize: number;
  bodyBlockOrder: BodyBlockKind[];
  bodyAudioPlacement: BodyMediaPlacement;
  bodyImagePlacement: BodyMediaPlacement;
  bodyInlineMediaHtmlByToken: Record<string, string>;
}) {
  const topBannerContentId = p.bannerTopContentId || p.bannerBottomContentId;
  const bottomBannerContentId = p.bannerBottomContentId || p.bannerTopContentId;

  const remoteTop =
    topBannerContentId &&
    (p.bannerPosition === "top" || p.bannerPosition === "both")
      ? bannerImageBlock(topBannerContentId, p.title, p.bannerHeight)
      : "";

  const remoteBottom =
    bottomBannerContentId &&
    (p.bannerPosition === "bottom" || p.bannerPosition === "both")
      ? bannerImageBlock(bottomBannerContentId, p.title, p.bannerHeight)
      : "";

  const standaloneBodyAudioHtml =
    p.bodyAudioUrl && p.bodyAudioPlacement !== "custom"
      ? bodyAudioPillBlock({
          url: p.bodyAudioUrl,
          displayName: p.bodyAudioDisplayName || "StayKnown Audio",
          size: p.bodyAudioSize,
          hint: p.bodyAudioHint,
          hintColor: p.bodyAudioHintColor,
          hintFontStyle: p.bodyAudioHintFontStyle,
        })
      : "";

  const bodyImageIsVideo = p.bodyImageMimeType.startsWith("video/");

  const standaloneBodyImageHtml =
    p.bodyImageUrl && p.bodyImagePlacement !== "custom"
      ? bodyImageIsVideo
        ? bodyVideoLinkBlock({
            url: p.bodyImageUrl,
            displayName: p.bodyImageDisplayName || "StayKnown Video",
            size: p.bodyImageSize,
            hint: p.bodyImageHint,
            hintColor: p.bodyImageHintColor,
            hintFontStyle: p.bodyImageHintFontStyle,
          })
        : bodyImageBlock({
            url: p.bodyImageUrl,
            alt: p.bodyImageDisplayName || "StayKnown Image",
            size: p.bodyImageSize,
            shape: p.bodyImageShape,
            hint: p.bodyImageHint,
            hintColor: p.bodyImageHintColor,
            hintFontStyle: p.bodyImageHintFontStyle,
          })
      : "";
  const tokenBodyAudioHtml = p.bodyAudioUrl
    ? bodyAudioPillBlock({
        url: p.bodyAudioUrl,
        displayName: p.bodyAudioDisplayName || "StayKnown Audio",
        size: p.bodyAudioSize,
        hint: p.bodyAudioHint,
        hintColor: p.bodyAudioHintColor,
        hintFontStyle: p.bodyAudioHintFontStyle,
      })
    : "";

  const tokenBodyImageHtml = p.bodyImageUrl
    ? bodyImageIsVideo
      ? bodyVideoLinkBlock({
          url: p.bodyImageUrl,
          displayName: p.bodyImageDisplayName || "StayKnown Video",
          size: p.bodyImageSize,
          hint: p.bodyImageHint,
          hintColor: p.bodyImageHintColor,
          hintFontStyle: p.bodyImageHintFontStyle,
        })
      : bodyImageBlock({
          url: p.bodyImageUrl,
          alt: p.bodyImageDisplayName || "StayKnown Image",
          size: p.bodyImageSize,
          shape: p.bodyImageShape,
          hint: p.bodyImageHint,
          hintColor: p.bodyImageHintColor,
          hintFontStyle: p.bodyImageHintFontStyle,
        })
    : "";
  const audioAlreadyInsideMessage =
    Boolean(p.bodyAudioUrl) &&
    (p.message.includes(BODY_AUDIO_TOKEN) ||
      /\{\{audio:[^}]+\}\}/.test(p.message));

  const imageAlreadyInsideMessage =
    Boolean(p.bodyImageUrl) &&
    (p.message.includes(BODY_IMAGE_TOKEN) ||
      /\{\{image:[^}]+\}\}/.test(p.message) ||
      /\{\{video:[^}]+\}\}/.test(p.message));

  const messageHtml = renderMessageHtmlWithInlineMedia({
    message: p.message,
    bodyAudioHtml: tokenBodyAudioHtml,
    bodyImageHtml: tokenBodyImageHtml,
    bodyInlineMediaHtmlByToken: p.bodyInlineMediaHtmlByToken,
  });

  const resolvedBodyOrder = resolveBodyBlockOrder({
    rawOrder: p.bodyBlockOrder,
    hasAudio: Boolean(p.bodyAudioUrl),
    hasImage: Boolean(p.bodyImageUrl),
    audioPlacement: p.bodyAudioPlacement,
    imagePlacement: p.bodyImagePlacement,
    audioAlreadyInsideMessage,
    imageAlreadyInsideMessage,
  });

  const bodyBlocks = resolvedBodyOrder
    .map((block) => {
      if (block === "audio" && p.bodyAudioUrl) {
        if (p.bodyAudioPlacement !== "custom") {
          return standaloneBodyAudioHtml;
        }

        return bodyAudioPillBlock({
          url: p.bodyAudioUrl,
          displayName: p.bodyAudioDisplayName || "StayKnown Audio",
          size: p.bodyAudioSize,
          hint: p.bodyAudioHint,
          hintColor: p.bodyAudioHintColor,
          hintFontStyle: p.bodyAudioHintFontStyle,
        });
      }

      if (block === "image" && p.bodyImageUrl) {
        if (p.bodyImagePlacement !== "custom") {
          return standaloneBodyImageHtml;
        }

        return bodyImageIsVideo
          ? bodyVideoLinkBlock({
              url: p.bodyImageUrl,
              displayName: p.bodyImageDisplayName || "StayKnown Video",
              size: p.bodyImageSize,
              hint: p.bodyImageHint,
              hintColor: p.bodyImageHintColor,
              hintFontStyle: p.bodyImageHintFontStyle,
            })
          : bodyImageBlock({
              url: p.bodyImageUrl,
              alt: p.bodyImageDisplayName || "StayKnown Image",
              size: p.bodyImageSize,
              shape: p.bodyImageShape,
              hint: p.bodyImageHint,
              hintColor: p.bodyImageHintColor,
              hintFontStyle: p.bodyImageHintFontStyle,
            });
      }

      if (block === "message") {
        return `
          <div style="font-size:15px;line-height:1.75;color:rgba(0,0,0,0.82);">
            ${messageHtml}
          </div>
        `;
      }

      return "";
    })
    .filter(Boolean)
    .join("");

  const cta = ctaButton(p.ctaLabel, p.ctaUrl);

  const storeBadges = storeBadgesBlock({
    placement: p.storeBadgePlacement,
    googlePlayEnabled: p.googlePlayEnabled,
    googlePlayUrl: p.googlePlayUrl,
    appStoreEnabled: p.appStoreEnabled,
    appStoreUrl: p.appStoreUrl,
  });

  const modeLabelText =
    p.mode === "newsletter"
      ? "Newsletter"
      : p.mode === "advert"
        ? "Announcement"
        : p.mode === "investor"
          ? "Investor Communication"
          : "Support Communication";

  const contentHtml = `
    ${remoteTop}

    ${p.storeBadgePlacement === "top" ? storeBadges : ""}

    ${p.inlineImageBlocks}

    ${bodyBlocks}

    ${p.storeBadgePlacement === "bottom" ? storeBadges : ""}

    ${cta ? `${dividerHtml()}${cta}` : ""}

    ${remoteBottom}

    ${linkOnlyFilesBlock(p.linkOnlyFiles)}

    <div style="
      margin-top:16px;
      padding:12px 14px;
      border-radius:18px;
      border:1px solid rgba(0,0,0,0.08);
      background:rgba(255,255,255,0.62);
      color:rgba(0,0,0,0.62);
      font-size:12px;
      line-height:1.55;
      text-align:center;
    ">
      ${escapeHtml(modeLabelText)}
    </div>
  `;

  return emailShell({
    appName: p.appName,
    brandLogoUrl: p.brandLogoUrl,
    title: p.title,
    subtitle: p.subtitle,
    badge: p.badge,
    contentHtml,
    footerHtml: p.footerHtml,
  });
}

function unsubscribeHtml(link: string) {
  return `
    <div style="height:8px;"></div>
    <div style="text-align:center;font-size:11px;line-height:1.6;color:rgba(0,0,0,0.55);">
      <a href="${escapeHtml(
        link,
      )}" style="color:rgba(0,0,0,0.72);font-weight:900;text-decoration:underline;text-underline-offset:3px;">
        Unsubscribe from marketing emails
      </a>
    </div>
  `;
}

function brandNameForSenderEmail(fromEmail: string) {
  const email = clean(fromEmail).toLowerCase();

  if (email.endsWith("@6rides.com")) return "6Rides";
  if (email.endsWith("@6clementjoshuamusics.com")) {
    return "6 Clement Joshua Musics";
  }
  if (email.endsWith("@6clementjoshuafoundation.com")) {
    return "6 Clement Joshua Foundation";
  }

  return clean(process.env.MAIL_CONSOLE_APP_NAME) || "StayKnown";
}

function resolveResendApiKeyForSender(fromEmail: string) {
  const email = clean(fromEmail).toLowerCase();

  if (email.endsWith("@stay-known.com") || email.endsWith("@stayknown.com")) {
    return {
      apiKey:
        clean(process.env.RESEND_API_KEY_STAYKNOWN) ||
        clean(process.env.RESEND_API_KEY),
      envName: "RESEND_API_KEY_STAYKNOWN",
      brand: "StayKnown",
    };
  }

  if (email.endsWith("@6clementjoshuafoundation.com")) {
    return {
      apiKey: clean(process.env.RESEND_API_KEY_6CLEMENTJOSHUAFOUNDATION),
      envName: "RESEND_API_KEY_6CLEMENTJOSHUAFOUNDATION",
      brand: "6 Clement Joshua Foundation",
    };
  }

  if (email.endsWith("@6rides.com")) {
    return {
      apiKey: clean(process.env.RESEND_API_KEY_6RIDES),
      envName: "RESEND_API_KEY_6RIDES",
      brand: "6Rides",
    };
  }

  if (email.endsWith("@6clementjoshuamusics.com")) {
    return {
      apiKey: clean(process.env.RESEND_API_KEY_6CLEMENTJOSHUAMUSICS),
      envName: "RESEND_API_KEY_6CLEMENTJOSHUAMUSICS",
      brand: "6 Clement Joshua Musics",
    };
  }

  return {
    apiKey: clean(process.env.RESEND_API_KEY),
    envName: "RESEND_API_KEY",
    brand: "Default mail sender",
  };
}

function resendErrorText(data: unknown) {
  if (!data || typeof data !== "object") return "";

  const row = data as Record<string, unknown>;

  const name = typeof row.name === "string" ? row.name : "";
  const message = typeof row.message === "string" ? row.message : "";
  const error = typeof row.error === "string" ? row.error : "";

  return [name, message, error].filter(Boolean).join(": ");
}

function resendRetryAfterMs(res: Response) {
  const retryAfter = res.headers.get("retry-after");

  if (!retryAfter) return 2500;

  const seconds = Number(retryAfter);

  if (Number.isFinite(seconds) && seconds > 0) {
    return Math.min(seconds * 1000, 10000);
  }

  return 2500;
}

function delayMs(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendResend(params: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo: string;
  attachments: ResendAttachment[];
  headers: Record<string, string>;
}) {
  const payload: Record<string, unknown> = {
    from: params.from,
    to: [params.to],
    subject: params.subject,
    html: params.html,
    text: params.text,
  };

  if (params.replyTo) payload.reply_to = params.replyTo;
  if (params.attachments.length > 0) payload.attachments = params.attachments;
  if (Object.keys(params.headers).length > 0) payload.headers = params.headers;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      return data;
    }

    const providerText = resendErrorText(data);

    if (res.status === 429 && attempt === 0) {
      await delayMs(resendRetryAfterMs(res));
      continue;
    }

    if (res.status === 429) {
      const lowerProviderText = providerText.toLowerCase();

      if (
        lowerProviderText.includes("daily_quota_exceeded") ||
        lowerProviderText.includes("daily email sending quota")
      ) {
        throw new Error(
          "StayKnown email sending limit has been reached for today. Please save this message as a draft and try again after the Resend daily quota resets.",
        );
      }

      throw new Error(
        providerText
          ? `Email provider temporarily rate-limited this send. ${providerText}`
          : "Email provider temporarily rate-limited this send. Please retry in a few minutes.",
      );
    }

    throw new Error(
      providerText
        ? `Email provider rejected this message. ${res.status} ${res.statusText}: ${providerText}`
        : `Email provider rejected this message. ${res.status} ${res.statusText}`,
    );
  }

  throw new Error("Email provider could not send this message right now.");
}
export async function POST(req: NextRequest) {
  let campaignId: string | null = null;

  try {
    const sessionToken = req.cookies.get(MAIL_CONSOLE_COOKIE)?.value || "";
    const payload = verifyMailConsoleSessionToken(sessionToken);
    const adminEmail = payload.email;

    const supabaseUrl = clean(
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    );
    const serviceRole = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);

    if (!supabaseUrl || !serviceRole) {
      return NextResponse.json(
        { ok: false, error: "Missing Supabase server config." },
        { status: 500 },
      );
    }

    const admin = createClient(supabaseUrl, serviceRole, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: adminRow } = await admin
      .from("mail_console_admins")
      .select("id,email,role,is_active")
      .ilike("email", adminEmail)
      .eq("is_active", true)
      .maybeSingle();

    if (!adminRow) {
      return NextResponse.json(
        { ok: false, error: "Mail console session is not allowed." },
        { status: 403 },
      );
    }

    const form = await req.formData();

    const mode = safeMode(form.get("mode"));
    const senderIdentityId = clean(form.get("sender_identity_id"));
    const parsedRecipients = parseRecipientsStrict(clean(form.get("to")));
    const recipients = parsedRecipients.recipients;
    const subject = clean(form.get("subject"));
    const title = clean(form.get("title"));
    const subtitle = clean(form.get("subtitle"));
    const badge = clean(form.get("badge"));
    const message = clean(form.get("message"));

    const siteUrl = getMailConsoleSiteUrl();
    const formLogoUrl = safePublicHttpUrl(form.get("brand_logo_url"));
    const envLogoUrl = safePublicHttpUrl(process.env.MAIL_CONSOLE_LOGO_URL);
    const fallbackLogoUrl = safePublicHttpUrl(
      `${siteUrl.replace(/\/$/, "")}/6logo.png`,
    );
    const brandLogoUrl = formLogoUrl || envLogoUrl || fallbackLogoUrl;

    const bannerTopFileRaw = form.get("banner_top_file");
    const bannerBottomFileRaw = form.get("banner_bottom_file");
    const bodyAudioFileRaw = form.get("body_audio_file");
    const bodyImageFileRaw = form.get("body_image_file");

    const bannerTopFile =
      bannerTopFileRaw instanceof File ? bannerTopFileRaw : null;
    const bannerBottomFile =
      bannerBottomFileRaw instanceof File ? bannerBottomFileRaw : null;
    const bodyAudioFile =
      bodyAudioFileRaw instanceof File ? bodyAudioFileRaw : null;
    const bodyImageFile =
      bodyImageFileRaw instanceof File ? bodyImageFileRaw : null;

    const bannerPosition =
      bannerTopFile || bannerBottomFile
        ? safeImagePosition(
            form.get("banner_position") || form.get("image_position"),
          )
        : "none";

    const bannerHeight = safeNumber(form.get("banner_height"), 96, 64, 150);

    const bodyAudioPlacement = safeBodyMediaPlacement(
      form.get("body_audio_placement"),
    );
    const bodyAudioSize = safeNumber(form.get("body_audio_size"), 76, 32, 100);
    const bodyAudioDisplayName = cleanDisplayFilename(
      clean(form.get("body_audio_display_name")),
      "StayKnown Audio",
      bodyAudioFile?.name || "",
      bodyAudioFile?.type || "audio/mpeg",
    );
    const bodyAudioHint = clean(form.get("body_audio_hint")).slice(0, 160);
    const bodyAudioHintColor = safeHexColor(form.get("body_audio_hint_color"));
    const bodyAudioHintFontStyle = safeBodyHintFontStyle(
      form.get("body_audio_hint_font_style"),
    );

    const bodyImagePlacement = safeBodyMediaPlacement(
      form.get("body_image_placement"),
    );
    const bodyImageShape = safeBodyImageShape(form.get("body_image_shape"));
    const bodyImageSize = safeNumber(form.get("body_image_size"), 88, 32, 100);
    const bodyImageIsVideo = Boolean(bodyImageFile?.type?.startsWith("video/"));

    const bodyImageDisplayName = cleanDisplayFilename(
      clean(form.get("body_image_display_name")),
      bodyImageIsVideo ? "StayKnown Video" : "StayKnown Image",
      bodyImageFile?.name || "",
      bodyImageFile?.type || (bodyImageIsVideo ? "video/mp4" : "image/png"),
    );
    const bodyImageHint = clean(form.get("body_image_hint")).slice(0, 160);
    const bodyImageHintColor = safeHexColor(form.get("body_image_hint_color"));
    const bodyImageHintFontStyle = safeBodyHintFontStyle(
      form.get("body_image_hint_font_style"),
    );

    const bodyBlockOrder = parseBodyBlockOrder(
      clean(form.get("body_block_order")),
    );
    const bodyInlineMediaItems = parseBodyInlineMediaItems(
      clean(form.get("body_inline_media_items")),
    );
    const ctaLabel = clean(form.get("cta_label"));
    const ctaUrl = clean(form.get("cta_url"));

    const storeBadgePlacement = safeStoreBadgePlacement(
      form.get("store_badge_placement"),
    );
    const googlePlayEnabled = safeBoolean(form.get("google_play_enabled"));
    const googlePlayUrl = safePublicHttpUrl(form.get("google_play_url"));
    const appStoreEnabled = safeBoolean(form.get("app_store_enabled"));
    const appStoreUrl = safePublicHttpUrl(form.get("app_store_url"));

    const footerPolicyId = clean(form.get("footer_policy_id"));
    const footerHtml = clean(form.get("footer_html"));
    let selectedPolicyLinks = parsePolicyLinks(clean(form.get("policy_links")));

    const socialTikTokEnabled = safeBoolean(form.get("social_tiktok_enabled"));
    const socialTikTokUsername = safeSocialUsername(
      form.get("social_tiktok_username"),
    );

    const socialTwitterEnabled = safeBoolean(
      form.get("social_twitter_enabled"),
    );
    const socialTwitterUsername = safeSocialUsername(
      form.get("social_twitter_username"),
    );

    const socialFacebookEnabled = safeBoolean(
      form.get("social_facebook_enabled"),
    );
    const socialFacebookUsername = safeSocialUsername(
      form.get("social_facebook_username"),
    );

    if (!senderIdentityId) {
      return NextResponse.json(
        { ok: false, error: "Select a sender address." },
        { status: 400 },
      );
    }

    if (parsedRecipients.invalid.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: `Invalid recipient email(s): ${parsedRecipients.invalid.join(", ")}`,
          invalid_emails: parsedRecipients.invalid,
        },
        { status: 400 },
      );
    }

    if (parsedRecipients.duplicate.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: `Duplicate recipient email(s): ${parsedRecipients.duplicate.join(", ")}`,
          duplicate_emails: parsedRecipients.duplicate,
        },
        { status: 400 },
      );
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Add at least one valid recipient." },
        { status: 400 },
      );
    }

    if (recipients.length > 50) {
      return NextResponse.json(
        { ok: false, error: "Maximum 50 recipients per send." },
        { status: 400 },
      );
    }

    if (!subject) {
      return NextResponse.json(
        { ok: false, error: "Subject is required." },
        { status: 400 },
      );
    }

    if (!message) {
      return NextResponse.json(
        { ok: false, error: "Message body is required." },
        { status: 400 },
      );
    }

    if (ctaUrl && !isPublicHttpUrl(ctaUrl)) {
      return NextResponse.json(
        { ok: false, error: "CTA URL must start with http:// or https://." },
        { status: 400 },
      );
    }

    if (googlePlayEnabled && !googlePlayUrl) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Google Play badge is enabled, but the Google Play URL is missing or invalid. Use a public http:// or https:// link.",
        },
        { status: 400 },
      );
    }

    if (appStoreEnabled && !appStoreUrl) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "App Store badge is enabled, but the App Store URL is missing or invalid. Use a public http:// or https:// link.",
        },
        { status: 400 },
      );
    }

    if (bannerTopFile && !bannerTopFile.type.startsWith("image/")) {
      return NextResponse.json(
        { ok: false, error: "Top banner must be an image file." },
        { status: 400 },
      );
    }

    if (bannerBottomFile && !bannerBottomFile.type.startsWith("image/")) {
      return NextResponse.json(
        { ok: false, error: "Bottom banner must be an image file." },
        { status: 400 },
      );
    }

    if (bodyAudioFile && !bodyAudioFile.type.startsWith("audio/")) {
      return NextResponse.json(
        { ok: false, error: "Body audio must be an audio file." },
        { status: 400 },
      );
    }

    if (
      bodyImageFile &&
      !bodyImageFile.type.startsWith("image/") &&
      !bodyImageFile.type.startsWith("video/")
    ) {
      return NextResponse.json(
        { ok: false, error: "Body media must be an image or video file." },
        { status: 400 },
      );
    }

    if (bannerTopFile && bannerTopFile.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { ok: false, error: "Top banner image must be under 8MB." },
        { status: 400 },
      );
    }

    if (bannerBottomFile && bannerBottomFile.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { ok: false, error: "Bottom banner image must be under 8MB." },
        { status: 400 },
      );
    }

    if (
      bodyImageFile &&
      bodyImageFile.type.startsWith("image/") &&
      bodyImageFile.size > 8 * 1024 * 1024
    ) {
      return NextResponse.json(
        { ok: false, error: "Body image must be under 8MB." },
        { status: 400 },
      );
    }

    if (
      bodyImageFile &&
      bodyImageFile.type.startsWith("video/") &&
      bodyImageFile.size > 20 * 1024 * 1024
    ) {
      return NextResponse.json(
        { ok: false, error: "Body video must be under 20MB." },
        { status: 400 },
      );
    }

    if (bodyAudioFile && bodyAudioFile.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { ok: false, error: "Body audio must be under 20MB." },
        { status: 400 },
      );
    }

    const { data: sender, error: senderError } = await admin
      .from("mail_console_sender_identities")
      .select(
        "id,label,from_name,from_email,reply_to_email,purpose,can_send_support,can_send_newsletter",
      )
      .eq("id", senderIdentityId)
      .eq("is_active", true)
      .maybeSingle();

    if (senderError || !sender) {
      return NextResponse.json(
        { ok: false, error: senderError?.message || "Sender not found." },
        { status: 400 },
      );
    }

    const senderRow = sender as SenderRow;

    if (senderRow.from_email.toLowerCase().endsWith("@6rides.com")) {
      const selected6RidesLinks =
        selectedPolicyLinks.filter(isSixRidesPolicyKey);

      selectedPolicyLinks =
        selected6RidesLinks.length > 0
          ? selected6RidesLinks
          : SIX_RIDES_POLICY_KEYS;
    }

    if (
      senderRow.from_email
        .toLowerCase()
        .endsWith("@6clementjoshuafoundation.com")
    ) {
      const selectedFoundationLinks = selectedPolicyLinks.filter(
        isFoundationPolicyKey,
      );

      selectedPolicyLinks =
        selectedFoundationLinks.length > 0
          ? selectedFoundationLinks
          : FOUNDATION_POLICY_KEYS;
    }

    const senderAllowed =
      mode === "newsletter" || mode === "advert"
        ? senderRow.can_send_newsletter === true
        : senderRow.can_send_support === true;

    if (!senderAllowed) {
      return NextResponse.json(
        { ok: false, error: "This sender is not allowed for this mode." },
        { status: 400 },
      );
    }

    const resolvedResend = resolveResendApiKeyForSender(senderRow.from_email);
    const resendApiKey = resolvedResend.apiKey;

    console.log("[mail-console-send] resend route", {
      senderEmail: senderRow.from_email,
      senderId: senderRow.id,
      mode,
      resendEnvName: resolvedResend.envName,
      resendBrand: resolvedResend.brand,
      hasResendKey: Boolean(resendApiKey),
      recipientCount: recipients.length,
    });

    if (!resendApiKey) {
      return NextResponse.json(
        {
          ok: false,
          error: `Missing ${resolvedResend.envName} in Vercel for ${resolvedResend.brand}.`,
        },
        { status: 500 },
      );
    }

    let footerPolicy: FooterPolicy | null = null;

    if (footerPolicyId) {
      const { data: fp, error: fpError } = await admin
        .from("mail_console_footer_policies")
        .select("id,name,mode,footer_html,footer_text")
        .eq("id", footerPolicyId)
        .eq("is_active", true)
        .maybeSingle();

      if (fpError) {
        return NextResponse.json(
          { ok: false, error: fpError.message },
          { status: 400 },
        );
      }

      footerPolicy = (fp || null) as FooterPolicy | null;
    }

    const finalFooterText = footerHtml || footerPolicy?.footer_html || "";

    if (!finalFooterText) {
      return NextResponse.json(
        {
          ok: false,
          error: "Select a footer policy or write a custom footer.",
        },
        { status: 400 },
      );
    }

    const finalFooterHtml =
      centeredFooterTextHtml(finalFooterText) +
      policyLinksHtml(selectedPolicyLinks) +
      socialLinksHtml({
        tiktokEnabled: socialTikTokEnabled,
        tiktokUsername: socialTikTokUsername,
        twitterEnabled: socialTwitterEnabled,
        twitterUsername: socialTwitterUsername,
        facebookEnabled: socialFacebookEnabled,
        facebookUsername: socialFacebookUsername,
      });
    const replyMode =
      mode === "newsletter" || mode === "advert" ? "no_reply" : "reply_enabled";

    const replyTo =
      replyMode === "reply_enabled"
        ? clean(senderRow.reply_to_email) || clean(senderRow.from_email)
        : "";

    const files = form
      .getAll("files")
      .filter((v) => v instanceof File) as File[];

    const fileModesRaw = clean(form.get("file_modes"));
    const fileDisplayNamesRaw = clean(form.get("file_display_names"));

    let fileModes: AttachmentMode[] = [];

    try {
      const parsed = JSON.parse(fileModesRaw || "[]");
      fileModes = Array.isArray(parsed)
        ? parsed.map((x) => safeAttachmentMode(x))
        : [];
    } catch (_) {
      fileModes = [];
    }

    const fileDisplayNames = parseStringArray(fileDisplayNamesRaw);
    const normalizedFileModes = files.map(
      (_, index) => fileModes[index] || "attach",
    );
    const specialAttachmentCount = normalizedFileModes.filter(
      (modeValue) => modeValue !== "attach",
    ).length;

    if (specialAttachmentCount > 1) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Only one attachment can be inline image or link-only. Keep the rest as normal attachments.",
        },
        { status: 400 },
      );
    }

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const fileMode = normalizedFileModes[i];

      if (fileMode === "inline_image" && !file.type.startsWith("image/")) {
        return NextResponse.json(
          {
            ok: false,
            error: "Only image files can use Inline image mode.",
          },
          { status: 400 },
        );
      }
    }

    const { data: campaign, error: campaignError } = await admin
      .from("mail_console_campaigns")
      .insert({
        mode,
        sender_identity_id: senderRow.id,
        footer_policy_id: footerPolicy?.id || null,
        title: title || subject,
        subject,
        body_html: textToHtml(message),
        body_text: message,
        image_url: null,
        image_position: bannerPosition,
        cta_label: ctaLabel || null,
        cta_url: ctaUrl || null,
        footer_html: finalFooterHtml,
        footer_text: htmlToText(finalFooterHtml),
        reply_mode: replyMode,
        status: "sending",
        meta: {
          created_from: "next_api_mail_console_send",
          admin_email: adminEmail,
          sender_email: senderRow.from_email,
          brand_logo_url: brandLogoUrl || null,
          recipient_count: recipients.length,
          policy_links: selectedPolicyLinks,
          social_tiktok_enabled: socialTikTokEnabled,
          social_tiktok_username: socialTikTokUsername || null,
          social_twitter_enabled: socialTwitterEnabled,
          social_twitter_username: socialTwitterUsername || null,
          social_facebook_enabled: socialFacebookEnabled,
          social_facebook_username: socialFacebookUsername || null,
          store_badge_placement: storeBadgePlacement,
          google_play_enabled: googlePlayEnabled,
          google_play_url: googlePlayUrl || null,
          app_store_enabled: appStoreEnabled,
          app_store_url: appStoreUrl || null,
          banner_position: bannerPosition,
          banner_height: bannerHeight,
          banner_top_file_name: bannerTopFile?.name || null,
          banner_bottom_file_name: bannerBottomFile?.name || null,
          body_audio_file_name: bodyAudioFile?.name || null,
          body_audio_display_name: bodyAudioDisplayName,
          body_audio_placement: bodyAudioPlacement,
          body_audio_size: bodyAudioSize,
          body_audio_hint: bodyAudioHint || null,
          body_audio_hint_color: bodyAudioHintColor,
          body_audio_hint_font_style: bodyAudioHintFontStyle,
          body_image_file_name: bodyImageFile?.name || null,
          body_image_display_name: bodyImageDisplayName,
          body_image_placement: bodyImagePlacement,
          body_image_shape: bodyImageShape,
          body_image_size: bodyImageSize,
          body_image_hint: bodyImageHint || null,
          body_image_hint_color: bodyImageHintColor,
          body_image_hint_font_style: bodyImageHintFontStyle,
          body_block_order: bodyBlockOrder,
          body_inline_media_items: bodyInlineMediaItems.map((item) => ({
            id: item.id,
            kind: item.kind,
            display_name: item.displayName,
            size: item.size,
            placement: item.placement,
            hint: item.hint || null,
            hint_color: item.hintColor,
            hint_font_style: item.hintFontStyle,
            image_shape:
              item.kind === "image" || item.kind === "video"
                ? item.imageShape
                : null,
            mime_type: item.mimeType,
            original_name: item.originalName,
            storage_bucket: item.storageBucket || null,
            storage_path: item.storagePath || null,
          })),

          message_has_body_audio_token:
            message.includes(BODY_AUDIO_TOKEN) ||
            /\{\{audio:[^}]+\}\}/.test(message),
          message_has_body_image_token:
            message.includes(BODY_IMAGE_TOKEN) ||
            /\{\{image:[^}]+\}\}/.test(message),
          message_has_body_file_token: /\{\{file:[^}]+\}\}/.test(message),
          file_modes: normalizedFileModes,
          file_display_names: fileDisplayNames,
        },
      })
      .select("id")
      .single();

    if (campaignError || !campaign?.id) {
      throw new Error(campaignError?.message || "Could not create campaign.");
    }

    campaignId = campaign.id;

    let totalAttachmentRawBytes = 0;
    const attachments: ResendAttachment[] = [];
    const linkOnlyFiles: Array<{ filename: string; url: string }> = [];
    const inlineBlocks: string[] = [];

    let bannerTopContentId = "";
    let bannerBottomContentId = "";
    let bodyImageUrl = "";
    let bodyAudioUrl = "";
    const bodyInlineMediaHtmlByToken: Record<string, string> = {};
    const bodyInlineMediaMeta: Array<Record<string, unknown>> = [];

    if (bannerTopFile) {
      const buffer = Buffer.from(await bannerTopFile.arrayBuffer());

      totalAttachmentRawBytes += buffer.length;
      bannerTopContentId = `sk-banner-top-${randomUUID()}`;

      attachments.push({
        filename: cleanDisplayFilename(
          "StayKnown Top Banner",
          "StayKnown Top Banner",
          bannerTopFile.name,
          bannerTopFile.type,
        ),
        content: buffer.toString("base64"),
        content_id: bannerTopContentId,
        content_type: bannerTopFile.type || "image/png",
      });
    }

    if (bannerBottomFile) {
      const buffer = Buffer.from(await bannerBottomFile.arrayBuffer());

      totalAttachmentRawBytes += buffer.length;
      bannerBottomContentId = `sk-banner-bottom-${randomUUID()}`;

      attachments.push({
        filename: cleanDisplayFilename(
          "StayKnown Bottom Banner",
          "StayKnown Bottom Banner",
          bannerBottomFile.name,
          bannerBottomFile.type,
        ),
        content: buffer.toString("base64"),
        content_id: bannerBottomContentId,
        content_type: bannerBottomFile.type || "image/png",
      });
    }

    if (bodyImageFile) {
      const filename = bodyImageDisplayName;
      const mime =
        bodyImageFile.type || (bodyImageIsVideo ? "video/mp4" : "image/png");
      const buffer = Buffer.from(await bodyImageFile.arrayBuffer());

      const storagePath = `${campaignId}/${
        bodyImageIsVideo ? "body-video" : "body-image"
      }-${randomUUID()}-${cleanFilename(filename)}`;
      const { error: uploadError } = await admin.storage
        .from("mail-console-attachments")
        .upload(storagePath, buffer, {
          contentType: mime,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(
          `Body media upload failed for ${filename}: ${uploadError.message}`,
        );
      }

      const { data: signed, error: signedError } = await admin.storage
        .from("mail-console-attachments")
        .createSignedUrl(storagePath, 365 * 24 * 60 * 60);

      if (signedError || !signed?.signedUrl) {
        throw new Error(
          `Body media signed URL failed for ${filename}: ${
            signedError?.message || "unknown error"
          }`,
        );
      }

      bodyImageUrl = signed.signedUrl;

      await admin.from("mail_console_attachments").insert({
        campaign_id: campaignId,
        file_name: filename,
        mime_type: mime,
        size_bytes: bodyImageFile.size,
        storage_bucket: "mail-console-attachments",
        storage_path: storagePath,
        attachment_mode: bodyImageIsVideo ? "link_only" : "inline_image",
        created_by: null,
      });
    }

    if (totalAttachmentRawBytes > 25 * 1024 * 1024) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Inline images are too large for one email. Please reduce banner/body image size.",
        },
        { status: 400 },
      );
    }

    if (bodyAudioFile) {
      const filename = bodyAudioDisplayName;
      const buffer = Buffer.from(await bodyAudioFile.arrayBuffer());
      const storagePath = `${campaignId}/body-audio-${randomUUID()}-${cleanFilename(
        filename,
      )}`;

      const { error: uploadError } = await admin.storage
        .from("mail-console-attachments")
        .upload(storagePath, buffer, {
          contentType: bodyAudioFile.type || "audio/mpeg",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(
          `Audio upload failed for ${filename}: ${uploadError.message}`,
        );
      }

      const { data: signed, error: signedError } = await admin.storage
        .from("mail-console-attachments")
        .createSignedUrl(storagePath, SENT_VIEW_SIGNED_URL_SECONDS);

      if (signedError || !signed?.signedUrl) {
        throw new Error(
          `Audio signed URL failed for ${filename}: ${
            signedError?.message || "unknown error"
          }`,
        );
      }

      bodyAudioUrl = signed.signedUrl;

      await admin.from("mail_console_attachments").insert({
        campaign_id: campaignId,
        file_name: filename,
        mime_type: bodyAudioFile.type || "audio/mpeg",
        size_bytes: bodyAudioFile.size,
        storage_bucket: "mail-console-attachments",
        storage_path: storagePath,
        attachment_mode: "link_only",
        created_by: null,
      });
    }

    for (const item of bodyInlineMediaItems) {
      const fileRaw = form.get(item.fileField);
      const file = fileRaw instanceof File && fileRaw.size > 0 ? fileRaw : null;

      let signedUrl = "";
      let storagePath = item.storagePath;
      let mime = item.mimeType;

      if (file) {
        if (item.kind === "image" && !file.type.startsWith("image/")) {
          return NextResponse.json(
            { ok: false, error: "Inserted body image must be an image file." },
            { status: 400 },
          );
        }

        if (item.kind === "audio" && !file.type.startsWith("audio/")) {
          return NextResponse.json(
            { ok: false, error: "Inserted body audio must be an audio file." },
            { status: 400 },
          );
        }

        if (item.kind === "file" && file.size > 20 * 1024 * 1024) {
          return NextResponse.json(
            { ok: false, error: `${item.displayName} must be under 20MB.` },
            { status: 400 },
          );
        }

        if (item.kind === "image" && file.size > 8 * 1024 * 1024) {
          return NextResponse.json(
            { ok: false, error: `${item.displayName} must be under 8MB.` },
            { status: 400 },
          );
        }

        if (item.kind === "audio" && file.size > 20 * 1024 * 1024) {
          return NextResponse.json(
            { ok: false, error: `${item.displayName} must be under 20MB.` },
            { status: 400 },
          );
        }

        mime = file.type || item.mimeType;

        const filename = cleanDisplayFilename(
          item.displayName,
          item.kind === "audio" ? "StayKnown Audio" : "StayKnown Image",
          file.name,
          mime,
        );

        const buffer = Buffer.from(await file.arrayBuffer());

        storagePath = `${campaignId}/body-inline-${item.kind}-${item.id}-${randomUUID()}-${cleanFilename(
          filename,
        )}`;

        const { error: uploadError } = await admin.storage
          .from("mail-console-attachments")
          .upload(storagePath, buffer, {
            contentType: mime,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(
            `Inserted body ${item.kind} upload failed for ${filename}: ${uploadError.message}`,
          );
        }

        await admin.from("mail_console_attachments").insert({
          campaign_id: campaignId,
          file_name: filename,
          mime_type: mime,
          size_bytes: file.size,
          storage_bucket: "mail-console-attachments",
          storage_path: storagePath,
          attachment_mode:
            item.kind === "image" || mime.startsWith("image/")
              ? "inline_image"
              : "link_only",
          created_by: null,
        });
      }

      if (storagePath) {
        const { data: signed, error: signedError } = await admin.storage
          .from(item.storageBucket || "mail-console-attachments")
          .createSignedUrl(storagePath, SENT_VIEW_SIGNED_URL_SECONDS);

        if (signedError || !signed?.signedUrl) {
          throw new Error(
            `Inserted body ${item.kind} signed URL failed: ${
              signedError?.message || "unknown error"
            }`,
          );
        }

        signedUrl = signed.signedUrl;
      }

      if (!signedUrl) continue;

      const token = `{{${item.kind}:${item.id}}}`;

      if (item.kind === "audio") {
        bodyInlineMediaHtmlByToken[token] = bodyAudioPillBlock({
          url: signedUrl,
          displayName: item.displayName,
          size: item.size,
          hint: item.hint,
          hintColor: item.hintColor,
          hintFontStyle: item.hintFontStyle,
        });
      } else if (item.kind === "video" || mime.startsWith("video/")) {
        bodyInlineMediaHtmlByToken[token] = bodyVideoLinkBlock({
          url: signedUrl,
          displayName: item.displayName,
          size: item.size,
          hint: item.hint,
          hintColor: item.hintColor,
          hintFontStyle: item.hintFontStyle,
        });
      } else if (item.kind === "image" || mime.startsWith("image/")) {
        bodyInlineMediaHtmlByToken[token] = bodyImageBlock({
          url: signedUrl,
          alt: item.displayName,
          size: item.size,
          shape: item.imageShape || "rectangle",
          hint: item.hint || "",
          hintColor: item.hintColor,
          hintFontStyle: item.hintFontStyle,
        });
      } else {
        bodyInlineMediaHtmlByToken[token] = bodyFileLinkBlock({
          url: signedUrl,
          displayName: item.displayName,
          hint: item.hint,
          hintColor: item.hintColor,
          hintFontStyle: item.hintFontStyle,
        });
      }

      bodyInlineMediaMeta.push({
        id: item.id,
        kind: item.kind,
        display_name: item.displayName,
        size: item.size,
        placement: item.placement,
        hint: item.hint || null,
        hint_color: item.hintColor,
        hint_font_style: item.hintFontStyle,
        image_shape:
          item.kind === "image" || item.kind === "video"
            ? item.imageShape
            : null,
        mime_type: mime,
        original_name: item.originalName,
        storage_bucket: item.storageBucket || "mail-console-attachments",
        storage_path: storagePath,
      });
    }

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const mime = file.type || "application/octet-stream";
      const requestedFileMode = normalizedFileModes[i] || "attach";
      const fileMode = mime.startsWith("video/")
        ? "link_only"
        : requestedFileMode;

      const displayName = cleanDisplayFilename(
        fileDisplayNames[i] || "",
        defaultAttachmentDisplayName(file, i),
        file.name,
        file.type,
      );
      const filename = displayName;
      const storageSafeName = cleanFilename(displayName);
      const size = file.size;

      if (size > 20 * 1024 * 1024) {
        return NextResponse.json(
          {
            ok: false,
            error: `${filename} is too large. Use link-only for very large files or keep each file under 20MB.`,
          },
          { status: 400 },
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      await admin.from("mail_console_attachments").insert({
        campaign_id: campaignId,
        file_name: filename,
        mime_type: mime,
        size_bytes: size,
        storage_bucket: "mail-console-attachments",
        storage_path: `pending/${campaignId}/${storageSafeName}`,
        attachment_mode: fileMode,
        created_by: null,
      });

      if (fileMode === "link_only") {
        const storagePath = `${campaignId}/${randomUUID()}-${storageSafeName}`;

        const { error: uploadError } = await admin.storage
          .from("mail-console-attachments")
          .upload(storagePath, buffer, {
            contentType: mime,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(
            `Storage upload failed for ${filename}: ${uploadError.message}`,
          );
        }

        const { data: signed, error: signedError } = await admin.storage
          .from("mail-console-attachments")
          .createSignedUrl(storagePath, SENT_VIEW_SIGNED_URL_SECONDS);

        if (signedError || !signed?.signedUrl) {
          throw new Error(
            `Signed URL failed for ${filename}: ${
              signedError?.message || "unknown error"
            }`,
          );
        }

        linkOnlyFiles.push({
          filename,
          url: signed.signedUrl,
        });

        await admin
          .from("mail_console_attachments")
          .update({
            storage_path: storagePath,
            file_name: filename,
          })
          .eq("campaign_id", campaignId)
          .eq("file_name", filename);

        continue;
      }

      totalAttachmentRawBytes += size;

      if (totalAttachmentRawBytes > 25 * 1024 * 1024) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Attached files are too large for one email. Use link-only for videos/large documents.",
          },
          { status: 400 },
        );
      }

      const base64 = buffer.toString("base64");

      if (fileMode === "inline_image" && mime.startsWith("image/")) {
        const contentId = `sk-inline-${i}-${randomUUID()}`;

        attachments.push({
          filename,
          content: base64,
          content_id: contentId,
          content_type: mime,
        });

        inlineBlocks.push(inlineImageBlock(contentId, filename));
      } else {
        attachments.push({
          filename,
          content: base64,
          content_type: mime,
        });
      }
    }

    const appName = brandNameForSenderEmail(senderRow.from_email);

    const html = buildHtml({
      appName,
      brandLogoUrl,
      mode,
      title: title || subject,
      subtitle,
      badge,
      message,
      bannerTopContentId,
      bannerBottomContentId,
      bannerPosition,
      bannerHeight,
      ctaLabel,
      ctaUrl,
      storeBadgePlacement,
      googlePlayEnabled,
      googlePlayUrl,
      appStoreEnabled,
      appStoreUrl,
      footerHtml: finalFooterHtml,
      inlineImageBlocks: inlineBlocks.join(""),
      linkOnlyFiles,
      bodyAudioUrl,
      bodyAudioDisplayName,
      bodyAudioHint,
      bodyAudioHintColor,
      bodyAudioHintFontStyle,
      bodyAudioSize,
      bodyImageUrl,
      bodyImageMimeType: bodyImageFile?.type || "",
      bodyImageDisplayName,
      bodyImageShape,
      bodyImageHint,
      bodyImageHintColor,
      bodyImageHintFontStyle,
      bodyImageSize,
      bodyBlockOrder,
      bodyAudioPlacement,
      bodyImagePlacement,
      bodyInlineMediaHtmlByToken,
    });

    const sentPreviewHtml = html.replace("<!--SK_UNSUBSCRIBE-->", "");
    const text = htmlToText(sentPreviewHtml);
    const from = `${senderRow.from_name} <${senderRow.from_email}>`;
    const newsletterLike = mode === "newsletter" || mode === "advert";

    function unsubscribeLinkFor(email: string) {
      const token = createUnsubscribeToken(email);

      return `${siteUrl}/unsubscribe?email=${encodeURIComponent(
        email,
      )}&token=${encodeURIComponent(token)}`;
    }

    const summary = {
      requested: recipients.length,
      sent: 0,
      failed: 0,
      skipped: 0,
      results: [] as Array<Record<string, unknown>>,
    };
    let providerQuotaReached = false;
    for (const recipient of recipients) {
      if (providerQuotaReached) {
        summary.skipped += 1;
        summary.results.push({
          email: recipient,
          status: "skipped",
          error:
            "Email provider daily quota has been reached. This recipient was not attempted.",
        });

        continue;
      }
      let logId: string | null = null;
      let campaignRecipientId: string | null = null;

      try {
        if (newsletterLike) {
          const { data: unsub } = await admin
            .from("mail_console_unsubscribes")
            .select("id")
            .eq("email", recipient)
            .maybeSingle();

          if (unsub) {
            summary.skipped += 1;
            summary.results.push({
              email: recipient,
              status: "skipped",
              reason: "unsubscribed",
            });

            await admin.from("mail_console_send_logs").insert({
              campaign_id: campaignId,
              sender_identity_id: senderRow.id,
              mode,
              recipient_email: recipient,
              subject,
              status: "skipped",
              error: "Recipient is unsubscribed",
            });

            continue;
          }
        }

        const { data: cr } = await admin
          .from("mail_console_campaign_recipients")
          .insert({
            campaign_id: campaignId,
            email: recipient,
            status: "queued",
            meta: {
              mode,
            },
          })
          .select("id")
          .single();

        campaignRecipientId = cr?.id || null;

        const { data: logRow } = await admin
          .from("mail_console_send_logs")
          .insert({
            campaign_id: campaignId,
            sender_identity_id: senderRow.id,
            mode,
            recipient_email: recipient,
            subject,
            status: "queued",
            meta: {
              reply_mode: replyMode,
              attachment_count: attachments.length,
              link_only_count: linkOnlyFiles.length,
              store_badge_placement: storeBadgePlacement,
              google_play_enabled: googlePlayEnabled,
              google_play_url: googlePlayUrl || null,
              app_store_enabled: appStoreEnabled,
              app_store_url: appStoreUrl || null,
              brand_logo_url: brandLogoUrl || null,
              banner_position: bannerPosition,
              banner_height: bannerHeight,
              has_body_audio: Boolean(bodyAudioUrl),
              has_body_image: Boolean(bodyImageUrl),
              body_audio_display_name: bodyAudioDisplayName,
              body_audio_hint_color: bodyAudioHintColor,
              body_audio_hint_font_style: bodyAudioHintFontStyle,
              body_image_display_name: bodyImageDisplayName,
              body_image_shape: bodyImageShape,
              body_image_url: bodyImageUrl || null,
              body_image_hint: bodyImageHint || null,
              body_image_hint_color: bodyImageHintColor,
              body_image_hint_font_style: bodyImageHintFontStyle,
            },
          })
          .select("id")
          .single();

        logId = logRow?.id ? String(logRow.id) : null;

        const perHeaders: Record<string, string> = {};

        let htmlForRecipient = sentPreviewHtml;

        if (newsletterLike) {
          const recipientUnsubscribeLink = unsubscribeLinkFor(recipient);

          htmlForRecipient = html.replace(
            "<!--SK_UNSUBSCRIBE-->",
            unsubscribeHtml(recipientUnsubscribeLink),
          );

          perHeaders["X-StayKnown-Email-Type"] = mode;
          perHeaders["List-Unsubscribe"] = `<${recipientUnsubscribeLink}>`;
        }

        const resendResult = await sendResend({
          apiKey: resendApiKey,
          from,
          to: recipient,
          subject,
          html: htmlForRecipient,
          text,
          replyTo,
          attachments,
          headers: perHeaders,
        });

        const resendId =
          clean((resendResult as { id?: string })?.id) ||
          clean((resendResult as { data?: { id?: string } })?.data?.id);

        if (campaignRecipientId) {
          await admin
            .from("mail_console_campaign_recipients")
            .update({
              status: "sent",
              resend_email_id: resendId || null,
              sent_at: new Date().toISOString(),
              meta: {
                resend: resendResult,
              },
            })
            .eq("id", campaignRecipientId);
        }

        if (logId) {
          await admin
            .from("mail_console_send_logs")
            .update({
              status: "sent",
              resend_email_id: resendId || null,
              sent_at: new Date().toISOString(),
              meta: {
                reply_mode: replyMode,
                attachment_count: attachments.length,
                link_only_count: linkOnlyFiles.length,
                store_badge_placement: storeBadgePlacement,
                google_play_enabled: googlePlayEnabled,
                google_play_url: googlePlayUrl || null,
                app_store_enabled: appStoreEnabled,
                app_store_url: appStoreUrl || null,
                brand_logo_url: brandLogoUrl || null,
                banner_position: bannerPosition,
                banner_height: bannerHeight,
                has_body_audio: Boolean(bodyAudioUrl),
                has_body_image: Boolean(bodyImageUrl),
                body_audio_display_name: bodyAudioDisplayName,
                body_audio_hint_color: bodyAudioHintColor,
                body_audio_hint_font_style: bodyAudioHintFontStyle,
                body_image_display_name: bodyImageDisplayName,
                body_image_hint: bodyImageHint || null,
                body_image_hint_color: bodyImageHintColor,
                body_image_hint_font_style: bodyImageHintFontStyle,
                resend: resendResult,
              },
            })
            .eq("id", logId);
        }

        summary.sent += 1;
        summary.results.push({
          email: recipient,
          status: "sent",
          resend_email_id: resendId || null,
        });
      } catch (sendErr) {
        const errText =
          sendErr instanceof Error ? sendErr.message : String(sendErr);
        const quotaReached =
          errText.toLowerCase().includes("daily_quota_exceeded") ||
          errText.toLowerCase().includes("daily email sending quota") ||
          errText.toLowerCase().includes("sending quota");

        if (quotaReached) {
          providerQuotaReached = true;
        }

        summary.failed += 1;
        summary.results.push({
          email: recipient,
          status: "failed",
          error: errText,
        });

        if (campaignRecipientId) {
          await admin
            .from("mail_console_campaign_recipients")
            .update({
              status: "failed",
              error: errText,
            })
            .eq("id", campaignRecipientId);
        }

        if (logId) {
          await admin
            .from("mail_console_send_logs")
            .update({
              status: "failed",
              error: errText,
            })
            .eq("id", logId);
        } else {
          await admin.from("mail_console_send_logs").insert({
            campaign_id: campaignId,
            sender_identity_id: senderRow.id,
            mode,
            recipient_email: recipient,
            subject,
            status: "failed",
            error: errText,
          });
        }
      }

      const hasMoreRecipients =
        recipients.indexOf(recipient) < recipients.length - 1;

      if (hasMoreRecipients) {
        await delayMs(RESEND_PER_RECIPIENT_WAIT_MS);
      }
    }

    const finalStatus =
      summary.sent > 0
        ? "sent"
        : summary.skipped > 0 && summary.failed === 0
          ? "cancelled"
          : "failed";

    await admin
      .from("mail_console_campaigns")
      .update({
        status: finalStatus,
        sent_at: summary.sent > 0 ? new Date().toISOString() : null,
        body_html: sentPreviewHtml,
        body_text: text,
        image_url: bodyImageUrl || null,
        image_position: bannerPosition,
        footer_html: finalFooterHtml,
        footer_text: htmlToText(finalFooterHtml),
        meta: {
          created_from: "next_api_mail_console_send",
          admin_email: adminEmail,
          sender_email: senderRow.from_email,
          brand_logo_url: brandLogoUrl || null,
          recipient_count: recipients.length,
          attachment_count: attachments.length,
          link_only_count: linkOnlyFiles.length,
          store_badge_placement: storeBadgePlacement,
          google_play_enabled: googlePlayEnabled,
          google_play_url: googlePlayUrl || null,
          app_store_enabled: appStoreEnabled,
          app_store_url: appStoreUrl || null,
          banner_position: bannerPosition,
          banner_height: bannerHeight,
          banner_top_file_name: bannerTopFile?.name || null,
          banner_bottom_file_name: bannerBottomFile?.name || null,
          body_audio_file_name: bodyAudioFile?.name || null,
          body_audio_display_name: bodyAudioDisplayName,
          body_audio_placement: bodyAudioPlacement,
          body_audio_size: bodyAudioSize,
          body_audio_hint: bodyAudioHint || null,
          body_audio_hint_color: bodyAudioHintColor,
          body_audio_hint_font_style: bodyAudioHintFontStyle,
          body_image_file_name: bodyImageFile?.name || null,
          body_image_display_name: bodyImageDisplayName,
          body_image_placement: bodyImagePlacement,
          body_image_shape: bodyImageShape,
          body_image_size: bodyImageSize,
          body_image_hint: bodyImageHint || null,
          body_image_hint_color: bodyImageHintColor,
          body_image_hint_font_style: bodyImageHintFontStyle,
          body_block_order: bodyBlockOrder,

          body_inline_media_items: bodyInlineMediaMeta,
          body_inline_media_count: bodyInlineMediaMeta.length,

          policy_links: selectedPolicyLinks,
          file_modes: normalizedFileModes,
          file_display_names: fileDisplayNames,

          message_has_body_audio_token:
            message.includes(BODY_AUDIO_TOKEN) ||
            /\{\{audio:[^}]+\}\}/.test(message),
          message_has_body_image_token:
            message.includes(BODY_IMAGE_TOKEN) ||
            /\{\{image:[^}]+\}\}/.test(message),
          message_has_body_video_token: /\{\{video:[^}]+\}\}/.test(message),
          message_has_body_file_token: /\{\{file:[^}]+\}\}/.test(message),

          summary,
        },
      })
      .eq("id", campaignId);
    const firstFailure = summary.results.find(
      (item: Record<string, unknown>) =>
        item.status === "failed" && typeof item.error === "string",
    );

    return NextResponse.json({
      ok: true,
      delivery_ok: summary.sent > 0,
      has_failures: summary.failed > 0,
      error:
        summary.sent === 0 && summary.failed > 0
          ? String(firstFailure?.error || "All emails failed in this batch.")
          : "",
      campaign_id: campaignId,
      summary,
    });
  } catch (err) {
    const error = err instanceof Error ? err.message : "Send failed.";

    return NextResponse.json(
      {
        ok: false,
        error,
        campaign_id: campaignId,
      },
      { status: 500 },
    );
  }
}
