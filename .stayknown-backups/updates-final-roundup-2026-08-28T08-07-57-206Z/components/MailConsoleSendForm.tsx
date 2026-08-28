"use client";

import Link from "next/link";
import {
  ChangeEvent,
  KeyboardEvent,
  ClipboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type MailMode = "support" | "newsletter" | "advert" | "investor";
type ImagePosition = "none" | "top" | "bottom" | "both";
type AttachmentMode = "attach" | "link_only" | "inline_image";
type BodyMediaPlacement = "top" | "bottom" | "custom";
type BodyImageShape = "banner" | "pill" | "rectangle" | "square" | "circle";
type BodyBlockKind = "audio" | "image" | "message";
type BodyHintFontStyle = "normal" | "italic";
type StoreBadgePlacement = "top" | "bottom";
type RecipientStatus =
  | "ready"
  | "queued"
  | "sending"
  | "sent"
  | "failed"
  | "skipped"
  | "draft";

type RecipientChip = {
  id: string;
  email: string;
  status: RecipientStatus;
  error?: string;
};

type RecipientIssue = {
  value: string;
  reason: string;
  suggestion?: string;
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

const MAX_RECIPIENTS = 50;
const SEND_BATCH_SIZE = 5;
const RESEND_SAFE_WINDOW_MS = 3500;
const BODY_IMAGE_TOKEN = "{{image}}";
const BODY_AUDIO_TOKEN = "{{audio}}";

const POLICY_LINK_OPTIONS: Array<{
  key: PolicyLinkKey;
  label: string;
  href: string;
  brand?: "stayknown" | "6rides" | "foundation";
}> = [
  {
    key: "privacy",
    label: "Privacy Policy",
    href: "https://stay-known.com/privacy",
  },
  {
    key: "terms",
    label: "Terms of Service",
    href: "https://stay-known.com/terms",
  },
  {
    key: "location_safety",
    label: "Location & Live Safety",
    href: "https://stay-known.com/location-safety",
  },
  {
    key: "contact_consent",
    label: "Contact Consent",
    href: "https://stay-known.com/contact-consent",
  },
  {
    key: "acceptable_use",
    label: "Acceptable Use",
    href: "https://stay-known.com/acceptable-use",
  },
  {
    key: "safety",
    label: "Safety & Anti-Stalking",
    href: "https://stay-known.com/safety",
  },
  {
    key: "trust_safety",
    label: "Trust & Safety",
    href: "https://stay-known.com/trust-safety",
  },
  {
    key: "verification_policy",
    label: "Verification Policy",
    href: "https://stay-known.com/verification-policy",
  },
  {
    key: "emergency",
    label: "Emergency Disclaimer",
    href: "https://stay-known.com/emergency",
  },
  {
    key: "minors",
    label: "Child Safety & Minor Use",
    href: "https://stay-known.com/minors",
  },
  {
    key: "guardian_consent",
    label: "Guardian Consent",
    href: "https://stay-known.com/guardian-consent",
  },
  {
    key: "abuse",
    label: "Abuse Reporting",
    href: "https://stay-known.com/abuse",
  },
  {
    key: "retention",
    label: "Data Retention",
    href: "https://stay-known.com/retention",
  },
  {
    key: "law",
    label: "Law Enforcement Requests",
    href: "https://stay-known.com/law",
  },
  {
    key: "security",
    label: "Security Disclosure",
    href: "https://stay-known.com/security",
  },
  {
    key: "creator_policy",
    label: "Creator Policy",
    href: "https://stay-known.com/creator-policy",
  },
  {
    key: "donor_policy",
    label: "Donor Policy",
    href: "https://stay-known.com/donor-policy",
  },
  {
    key: "billing_policy",
    label: "Billing & Refunds",
    href: "https://stay-known.com/billing-policy",
  },
  {
    key: "rides_terms",
    label: "Terms of Service",
    href: "https://6rides.com/policies/terms",
    brand: "6rides",
  },
  {
    key: "rides_privacy",
    label: "Privacy Policy",
    href: "https://6rides.com/policies/privacy",
    brand: "6rides",
  },
  {
    key: "rides_acceptable_use",
    label: "Acceptable Use",
    href: "https://6rides.com/policies/acceptable-use",
    brand: "6rides",
  },
  {
    key: "rides_safety",
    label: "Safety Guidelines",
    href: "https://6rides.com/policies/safety",
    brand: "6rides",
  },
  {
    key: "rides_refunds",
    label: "Refund & Cancellation",
    href: "https://6rides.com/policies/refunds",
    brand: "6rides",
  },
  {
    key: "rides_subscription_billing",
    label: "Subscription & Billing",
    href: "https://6rides.com/policies/subscription-billing",
    brand: "6rides",
  },
  {
    key: "rides_partner_terms",
    label: "Partner Terms",
    href: "https://6rides.com/policies/partner-terms",
    brand: "6rides",
  },
  {
    key: "rides_emergency",
    label: "Emergency Disclaimer",
    href: "https://6rides.com/policies/emergency",
    brand: "6rides",
  },
  {
    key: "rides_contact",
    label: "Contact",
    href: "https://6rides.com/policies/contact",
    brand: "6rides",
  },
  {
    key: "rides_child_student_safety",
    label: "Child & Student Safety",
    href: "https://6rides.com/policies/child-student-safety",
    brand: "6rides",
  },
  {
    key: "rides_insurance_liability",
    label: "Insurance & Liability",
    href: "https://6rides.com/policies/insurance-liability",
    brand: "6rides",
  },
  {
    key: "rides_corporate_sla",
    label: "Corporate SLA",
    href: "https://6rides.com/policies/corporate-sla",
    brand: "6rides",
  },
  {
    key: "rides_cookies",
    label: "Cookies Policy",
    href: "https://6rides.com/policies/cookies",
    brand: "6rides",
  },
  {
    key: "foundation_privacy",
    label: "Privacy",
    href: "https://www.6clementjoshuafoundation.com/policies/privacy",
    brand: "foundation",
  },
  {
    key: "foundation_terms",
    label: "Terms",
    href: "https://www.6clementjoshuafoundation.com/policies/terms",
    brand: "foundation",
  },
  {
    key: "foundation_donor_privacy",
    label: "Donor Privacy",
    href: "https://www.6clementjoshuafoundation.com/policies/donor-privacy",
    brand: "foundation",
  },
  {
    key: "foundation_refund",
    label: "Refunds",
    href: "https://www.6clementjoshuafoundation.com/policies/refund",
    brand: "foundation",
  },
  {
    key: "foundation_transparency",
    label: "Transparency",
    href: "https://www.6clementjoshuafoundation.com/policies/transparency",
    brand: "foundation",
  },
  {
    key: "foundation_anti_fraud",
    label: "Anti-Fraud",
    href: "https://www.6clementjoshuafoundation.com/policies/anti-fraud",
    brand: "foundation",
  },
  {
    key: "foundation_child_safeguarding",
    label: "Child Safety",
    href: "https://www.6clementjoshuafoundation.com/policies/child-safeguarding",
    brand: "foundation",
  },
  {
    key: "foundation_whistleblowing",
    label: "Whistleblowing",
    href: "https://www.6clementjoshuafoundation.com/policies/whistleblowing",
    brand: "foundation",
  },
  {
    key: "foundation_cookies",
    label: "Cookies",
    href: "https://www.6clementjoshuafoundation.com/policies/cookies",
    brand: "foundation",
  },
];

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

const STAYKNOWN_DEFAULT_POLICY_KEYS: PolicyLinkKey[] = ["privacy", "terms"];

function brandNameForSenderEmail(email: string) {
  const normalized = email.trim().toLowerCase();

  if (normalized.endsWith("@6rides.com")) return "6Rides";
  if (normalized.endsWith("@6clementjoshuamusics.com")) {
    return "6 Clement Joshua Musics";
  }
  if (normalized.endsWith("@6clementjoshuafoundation.com")) {
    return "6 Clement Joshua Foundation";
  }

  return "StayKnown";
}

function policyBrandForSenderEmail(email: string) {
  const normalized = email.trim().toLowerCase();

  if (normalized.endsWith("@6rides.com")) return "6rides";
  if (normalized.endsWith("@6clementjoshuafoundation.com")) return "foundation";

  return "stayknown";
}

function isSixRidesPolicyKey(key: PolicyLinkKey) {
  return SIX_RIDES_POLICY_KEYS.includes(key);
}

type MailTemplate = {
  id: string;
  name: string;
  mode: string;
  subject: string | null;
  body_text: string | null;
  default_image_position: string;
};

type SenderIdentity = {
  id: string;
  label: string;
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
  is_default: boolean;
};

type PickedFile = {
  id: string;
  file: File;
  mode: AttachmentMode;
  displayName: string;
};

type CampaignMeta = Record<string, unknown>;

type OpenCampaignRow = {
  id: string;
  created_at: string | null;
  sent_at: string | null;
  mode: string | null;
  sender_identity_id: string | null;
  footer_policy_id: string | null;
  draft_label: string | null;
  title: string | null;
  subject: string | null;
  body_html: string | null;
  body_text: string | null;
  image_url: string | null;
  image_position: string | null;
  cta_label: string | null;
  cta_url: string | null;
  footer_html: string | null;
  footer_text: string | null;
  reply_mode: string | null;
  status: string | null;
  meta: CampaignMeta | null;
};

type StoredDraftAttachment = {
  id: string;
  role:
    | "banner_top"
    | "banner_bottom"
    | "body_audio"
    | "body_image"
    | "body_inline_audio"
    | "body_inline_image"
    | "body_inline_video"
    | "body_inline_file"
    | "file";
  file_name: string;
  display_name: string;
  mime_type: string;
  size_bytes: number;
  storage_bucket: string;
  storage_path: string;
  attachment_mode: AttachmentMode;
  signed_url?: string;

  inline_media_id?: string;
  inline_media_kind?: "audio" | "image" | "file";
  inline_media_size?: number;
  inline_media_placement?: BodyMediaPlacement;
  inline_media_hint?: string;
  inline_media_hint_color?: string;
  inline_media_hint_font_style?: BodyHintFontStyle;
  inline_media_image_shape?: BodyImageShape;
  inline_media_original_name?: string;
};

type StoredDraftInlineMediaItem = {
  id: string;
  kind: "audio" | "image" | "video" | "file";
  display_name?: string;
  displayName?: string;
  size?: number;
  placement?: BodyMediaPlacement;
  hint?: string;
  hint_color?: string;
  hintColor?: string;
  hint_font_style?: BodyHintFontStyle;
  hintFontStyle?: BodyHintFontStyle;
  image_shape?: BodyImageShape | null;
  imageShape?: BodyImageShape | null;
  mime_type?: string;
  mimeType?: string;
  original_name?: string;
  originalName?: string;
  signed_url?: string;
  signedUrl?: string;
  storage_bucket?: string;
  storageBucket?: string;
  storage_path?: string;
  storagePath?: string;
};

type BodyInlineMediaItem = {
  id: string;
  kind: "audio" | "image" | "video" | "file";
  file: File | null;
  previewUrl: string;
  displayName: string;
  size: number;
  placement: BodyMediaPlacement;
  hint: string;
  hintColor: string;
  hintFontStyle: BodyHintFontStyle;
  imageShape?: BodyImageShape;
  mimeType: string;
  originalName: string;
  storageBucket?: string;
  storagePath?: string;
};

type OpenCampaignResponse = {
  ok?: boolean;
  error?: string;
  id?: string;
  status?: string;
  open_mode?: "editable" | "readonly";
  editable?: boolean;
  readonly?: boolean;
  campaign?: OpenCampaignRow;
  attachments?: StoredDraftAttachment[];
  body_inline_media_items?: StoredDraftInlineMediaItem[];
};

type Props = {
  adminEmail: string;
  senders: SenderIdentity[];
  footerPolicies: FooterPolicy[];
  templates: MailTemplate[];
};

function senderAllowedForMode(sender: SenderIdentity, mode: MailMode) {
  if (mode === "newsletter" || mode === "advert") {
    return sender.can_send_newsletter;
  }

  return sender.can_send_support;
}

function modeLabel(mode: MailMode) {
  if (mode === "newsletter") return "Newsletter";
  if (mode === "advert") return "Advert / Announcement";
  if (mode === "investor") return "Investor Update";
  return "Support / Direct Email";
}

function defaultTitleForMode(mode: MailMode) {
  if (mode === "newsletter") return "StayKnown Newsletter";
  if (mode === "advert") return "StayKnown Announcement";
  if (mode === "investor") return "StayKnown Investor Update";
  return "StayKnown Support";
}

function defaultBadgeForMode(mode: MailMode) {
  if (mode === "newsletter") return "NEWSLETTER";
  if (mode === "advert") return "ANNOUNCEMENT";
  if (mode === "investor") return "INVESTOR";
  return "SUPPORT";
}

function niceFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

const MAIL_CONSOLE_SAFE_UPLOAD_BYTES = 15 * 1024 * 1024;

type MailSendApiResponse = {
  ok?: boolean;
  delivery_ok?: boolean;
  has_failures?: boolean;
  error?: string;
  message?: string;
  campaign_id?: string;
  summary?: {
    requested?: number;
    sent?: number;
    failed?: number;
    skipped?: number;
    results?: Array<Record<string, unknown>>;
  };
};

function textBytes(value: string) {
  return new TextEncoder().encode(value).length;
}

function safeJsonStringify(value: unknown, fallback = "[]") {
  try {
    return JSON.stringify(value) || fallback;
  } catch {
    return fallback;
  }
}

function oversizedPayloadMessage(totalBytes: number, fileCount: number) {
  return [
    `Your selected media/files are too large for one Send Email request.`,
    `Selected upload size: ${niceFileSize(totalBytes)} across ${fileCount} file(s).`,
    `To preserve quality, StayKnown will not auto-reduce image, audio, video, or PDF quality.`,
    `Please remove some files, split the email into smaller media sets, or use already-hosted links for large audio/video files.`,
  ].join(" ");
}

async function readMailSendApiResponse(
  res: Response,
): Promise<MailSendApiResponse> {
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = (await res.json().catch(() => ({}))) as MailSendApiResponse;

    if (
      !res.ok &&
      !data.error &&
      (res.status === 413 || data.message === "FUNCTION_PAYLOAD_TOO_LARGE")
    ) {
      return {
        ok: false,
        error:
          "Your selected media/files are too large for one Send Email request. Please split the media into smaller sets or use links for large audio/video files.",
      };
    }

    return data;
  }

  const text = await res.text().catch(() => "");

  if (
    res.status === 413 ||
    text.includes("FUNCTION_PAYLOAD_TOO_LARGE") ||
    text.includes("Request Entity Too Large")
  ) {
    return {
      ok: false,
      error:
        "Your selected media/files are too large for one Send Email request. StayKnown did not reduce quality. Please split the files into smaller sets or use links for large audio/video files.",
    };
  }

  return {
    ok: false,
    error:
      text ||
      `Email send failed with status ${res.status}. Please retry in a few minutes.`,
  };
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeEmailInput(value: string) {
  const raw = value.trim().replace(/^mailto:/i, "");

  const angleMatch = raw.match(/<([^<>@\s]+@[^<>\s@]+)>/);
  const email = angleMatch ? angleMatch[1] : raw;

  return email
    .trim()
    .replace(/^<+|>+$/g, "")
    .replace(/[.,;:]+$/g, "")
    .toLowerCase();
}

function isValidEmail(email: string) {
  const value = normalizeEmailInput(email);

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

function commaDomainSuggestion(value: string) {
  const trimmed = value.trim().replace(/^,+|,+$/g, "");

  if (!trimmed.includes("@") || !trimmed.includes(",")) {
    return "";
  }

  const atIndex = trimmed.indexOf("@");
  const commaIndex = trimmed.lastIndexOf(",");

  if (commaIndex < atIndex) {
    return "";
  }

  const left = trimmed.slice(0, commaIndex);
  const right = trimmed.slice(commaIndex + 1);

  if (!/^[a-z]{2,12}$/i.test(right)) {
    return "";
  }

  const fixed = `${left}.${right}`.toLowerCase();

  return isValidEmail(fixed) ? fixed : "";
}

function parseRecipientText(raw: string) {
  const candidates: string[] = [];
  const issues: RecipientIssue[] = [];

  const segments = raw
    .split(/[\s;\n\r\t]+/)
    .map((x) => x.trim())
    .filter(Boolean);

  for (const segment of segments) {
    const typoSuggestion = commaDomainSuggestion(segment);

    if (typoSuggestion) {
      issues.push({
        value: segment,
        reason: "This looks like a comma was used instead of a dot.",
        suggestion: typoSuggestion,
      });
      continue;
    }

    const parts = segment
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    for (const part of parts) {
      const suggestion = commaDomainSuggestion(part);

      if (suggestion) {
        issues.push({
          value: part,
          reason: "This looks like a comma was used instead of a dot.",
          suggestion,
        });
        continue;
      }

      candidates.push(part);
    }
  }

  return { candidates, issues };
}

function mergeRecipientList(existing: RecipientChip[], raw: string) {
  const parsed = parseRecipientText(raw);
  const next = [...existing];
  const issues = [...parsed.issues];
  const seen = new Set(existing.map((r) => r.email));
  let candidatesAdded = 0;

  for (const candidate of parsed.candidates) {
    const email = normalizeEmailInput(candidate);

    if (!email) continue;

    if (!isValidEmail(email)) {
      issues.push({
        value: candidate,
        reason: "Invalid email address.",
      });
      continue;
    }

    if (seen.has(email)) {
      issues.push({
        value: email,
        reason: "Duplicate email already added.",
      });
      continue;
    }

    if (next.length >= MAX_RECIPIENTS) {
      issues.push({
        value: email,
        reason: `Maximum ${MAX_RECIPIENTS} recipients allowed per send.`,
      });
      continue;
    }

    seen.add(email);
    candidatesAdded += 1;

    next.push({
      id: makeId("recipient"),
      email,
      status: "ready",
    });
  }

  return { next, issues, candidatesAdded };
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function revokePreviewUrl(url: string) {
  if (!url.startsWith("blob:")) return;

  URL.revokeObjectURL(url);
}

function bodyInlineToken(
  kind: "audio" | "image" | "video" | "file",
  id: string,
) {
  return `{{${kind}:${id}}}`;
}

function parseBodyInlineToken(token: string) {
  const match = token.match(/^\{\{(audio|image|video|file):([^}]+)\}\}$/);

  if (!match) return null;

  return {
    kind: match[1] as "audio" | "image" | "video" | "file",
    id: match[2],
  };
}

function bodyInlineFormPayload(item: BodyInlineMediaItem) {
  return {
    id: item.id,
    kind: item.kind,
    display_name: item.displayName,
    size: item.size,
    placement: item.placement,
    hint: item.hint,
    hint_color: item.hintColor,
    hint_font_style: item.hintFontStyle,
    image_shape: item.imageShape || null,
    mime_type: item.mimeType,
    original_name: item.originalName,
    file_field: `body_inline_media_file_${item.id}`,
    storage_bucket: item.storageBucket || null,
    storage_path: item.storagePath || null,
  };
}

function publicHttpLink(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return "";

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return trimmed;
    }

    return "";
  } catch (_) {
    return "";
  }
}

function cleanDisplayFilename(value: string, fallback: string) {
  const cleaned = value
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]+/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 90);

  return cleaned || fallback;
}

function defaultAttachmentDisplayName(file: File, index: number) {
  const serial = String(index + 1).padStart(2, "0");

  if (file.type.startsWith("image/")) return `StayKnown Image ${serial}`;
  if (file.type.startsWith("audio/")) return `StayKnown Audio ${serial}`;
  if (file.type.startsWith("video/")) return `StayKnown Video ${serial}`;

  return `StayKnown File ${serial}`;
}

function stringFromMeta(meta: CampaignMeta | null | undefined, key: string) {
  const value = meta?.[key];

  return typeof value === "string" ? value : "";
}

function numberFromMeta(
  meta: CampaignMeta | null | undefined,
  key: string,
  fallback: number,
) {
  const value = meta?.[key];
  const n = typeof value === "number" ? value : Number(value);

  return Number.isFinite(n) ? n : fallback;
}

function booleanFromMeta(
  meta: CampaignMeta | null | undefined,
  key: string,
  fallback = false,
) {
  const value = meta?.[key];

  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return fallback;

  const normalized = value.trim().toLowerCase();

  return (
    normalized === "true" ||
    normalized === "1" ||
    normalized === "yes" ||
    normalized === "on"
  );
}

function stringArrayFromMeta(
  meta: CampaignMeta | null | undefined,
  key: string,
) {
  const value = meta?.[key];

  if (!Array.isArray(value)) return [];

  return value.filter((item): item is string => typeof item === "string");
}

function safeMailModeValue(value: unknown): MailMode {
  const normalized = typeof value === "string" ? value.toLowerCase() : "";

  if (normalized === "newsletter") return "newsletter";
  if (normalized === "advert") return "advert";
  if (normalized === "investor") return "investor";

  return "support";
}

function safeImagePositionValue(value: unknown): ImagePosition {
  const normalized = typeof value === "string" ? value.toLowerCase() : "";

  if (
    normalized === "top" ||
    normalized === "bottom" ||
    normalized === "both" ||
    normalized === "none"
  ) {
    return normalized;
  }

  return "none";
}

function safeBodyPlacementValue(value: unknown): BodyMediaPlacement {
  const normalized = typeof value === "string" ? value.toLowerCase() : "";

  if (normalized === "top" || normalized === "bottom") {
    return normalized;
  }

  return "custom";
}

function safeBodyImageShapeValue(value: unknown): BodyImageShape {
  const normalized = typeof value === "string" ? value.toLowerCase() : "";

  if (normalized === "banner") return "banner";
  if (normalized === "pill") return "pill";
  if (normalized === "square") return "square";
  if (normalized === "circle") return "circle";

  return "rectangle";
}

function safeHintFontStyleValue(value: unknown): BodyHintFontStyle {
  return value === "italic" ? "italic" : "normal";
}

function safeStoreBadgePlacementValue(value: unknown): StoreBadgePlacement {
  return value === "top" ? "top" : "bottom";
}

function safePolicyLinksValue(value: string[]) {
  const allowed = new Set(POLICY_LINK_OPTIONS.map((item) => item.key));

  return value.filter((item): item is PolicyLinkKey =>
    allowed.has(item as PolicyLinkKey),
  );
}

function safeBodyBlockOrderValue(value: string[]) {
  const fallback: BodyBlockKind[] = ["audio", "message", "image"];
  const allowed = new Set(["audio", "message", "image"]);

  const cleaned = value.filter((item): item is BodyBlockKind =>
    allowed.has(item),
  );

  const unique = [...new Set(cleaned)];

  for (const item of fallback) {
    if (!unique.includes(item)) {
      unique.push(item);
    }
  }

  return unique;
}

type SocialPlatform = "tiktok" | "twitter" | "facebook";

function cleanSocialUsername(value: string) {
  return value
    .trim()
    .replace(/^@+/, "")
    .replace(/^https?:\/\/(www\.)?/i, "")
    .replace(/^(tiktok\.com\/@|twitter\.com\/|x\.com\/|facebook\.com\/)/i, "")
    .split(/[/?#]/)[0]
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .slice(0, 60);
}

function socialHref(platform: SocialPlatform, username: string) {
  const cleanName = cleanSocialUsername(username);

  if (!cleanName) return "";

  if (platform === "tiktok") return `https://www.tiktok.com/@${cleanName}`;
  if (platform === "twitter") return `https://twitter.com/${cleanName}`;

  return `https://www.facebook.com/${cleanName}`;
}

export default function MailConsoleSendForm({
  adminEmail,
  senders,
  footerPolicies,
  templates,
}: Props) {
  const brandLogoUrl = "/6logo.png";
  const messageTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [templateId, setTemplateId] = useState("");
  const [savingDraft, setSavingDraft] = useState(false);

  const [openedCampaignId, setOpenedCampaignId] = useState("");
  const [openedCampaignStatus, setOpenedCampaignStatus] = useState("");
  const [openedCampaignMode, setOpenedCampaignMode] = useState<
    "new" | "editable" | "readonly"
  >("new");
  const [openingCampaign, setOpeningCampaign] = useState(false);

  const [mode, setMode] = useState<MailMode>("support");
  const [senderId, setSenderId] = useState("");
  const [recipients, setRecipients] = useState<RecipientChip[]>([]);
  const [recipientInput, setRecipientInput] = useState("");
  const [recipientIssues, setRecipientIssues] = useState<RecipientIssue[]>([]);
  const [selectedRecipientEmails, setSelectedRecipientEmails] = useState<
    string[]
  >([]);
  const [editingRecipientEmail, setEditingRecipientEmail] = useState("");
  const [editingRecipientValue, setEditingRecipientValue] = useState("");
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState(defaultTitleForMode("support"));
  const [subtitle, setSubtitle] = useState("");
  const [badge, setBadge] = useState(defaultBadgeForMode("support"));
  const [message, setMessage] = useState("");

  const [bannerTopFile, setBannerTopFile] = useState<File | null>(null);
  const [bannerBottomFile, setBannerBottomFile] = useState<File | null>(null);
  const [bannerTopPreviewUrl, setBannerTopPreviewUrl] = useState("");
  const [bannerBottomPreviewUrl, setBannerBottomPreviewUrl] = useState("");
  const [imagePosition, setImagePosition] = useState<ImagePosition>("none");
  const [bannerHeight, setBannerHeight] = useState(96);

  const [bodyAudioFile, setBodyAudioFile] = useState<File | null>(null);
  const [bodyAudioPreviewUrl, setBodyAudioPreviewUrl] = useState("");
  const [bodyAudioDisplayName, setBodyAudioDisplayName] =
    useState("StayKnown Audio");
  const [bodyAudioPlacement, setBodyAudioPlacement] =
    useState<BodyMediaPlacement>("custom");
  const [bodyAudioSize, setBodyAudioSize] = useState(76);
  const [bodyAudioHint, setBodyAudioHint] = useState("");
  const [bodyAudioHintColor, setBodyAudioHintColor] = useState("#6b7280");
  const [bodyAudioHintFontStyle, setBodyAudioHintFontStyle] =
    useState<BodyHintFontStyle>("normal");

  const [bodyImageFile, setBodyImageFile] = useState<File | null>(null);
  const [bodyImagePreviewUrl, setBodyImagePreviewUrl] = useState("");
  const [bodyImageDisplayName, setBodyImageDisplayName] =
    useState("StayKnown Image");
  const [bodyImagePlacement, setBodyImagePlacement] =
    useState<BodyMediaPlacement>("custom");
  const [bodyImageShape, setBodyImageShape] =
    useState<BodyImageShape>("rectangle");
  const [bodyImageSize, setBodyImageSize] = useState(88);
  const [bodyImageHint, setBodyImageHint] = useState("");
  const [bodyImageHintColor, setBodyImageHintColor] = useState("#6b7280");
  const [bodyImageHintFontStyle, setBodyImageHintFontStyle] =
    useState<BodyHintFontStyle>("normal");
  const [bodyInlineMediaItems, setBodyInlineMediaItems] = useState<
    BodyInlineMediaItem[]
  >([]);
  const bodyInlineMediaItemsRef = useRef<BodyInlineMediaItem[]>([]);

  const [bodyBlockOrder, setBodyBlockOrder] = useState<BodyBlockKind[]>([
    "audio",
    "message",
    "image",
  ]);
  const [draggingBodyBlock, setDraggingBodyBlock] =
    useState<BodyBlockKind | null>(null);
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");

  const [storeBadgePlacement, setStoreBadgePlacement] =
    useState<StoreBadgePlacement>("bottom");
  const [googlePlayEnabled, setGooglePlayEnabled] = useState(false);
  const [googlePlayUrl, setGooglePlayUrl] = useState("");
  const [appStoreEnabled, setAppStoreEnabled] = useState(false);
  const [appStoreUrl, setAppStoreUrl] = useState("");

  const [footerPolicyId, setFooterPolicyId] = useState("");
  const [customFooter, setCustomFooter] = useState("");
  const [selectedPolicyLinks, setSelectedPolicyLinks] = useState<
    PolicyLinkKey[]
  >(["privacy", "terms"]);

  const [socialTikTokEnabled, setSocialTikTokEnabled] = useState(false);
  const [socialTikTokUsername, setSocialTikTokUsername] = useState("");

  const [socialTwitterEnabled, setSocialTwitterEnabled] = useState(false);
  const [socialTwitterUsername, setSocialTwitterUsername] = useState("");

  const [socialFacebookEnabled, setSocialFacebookEnabled] = useState(false);
  const [socialFacebookUsername, setSocialFacebookUsername] = useState("");

  const [files, setFiles] = useState<PickedFile[]>([]);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const [sendOverlayOpen, setSendOverlayOpen] = useState(false);
  const [sendComplete, setSendComplete] = useState(false);
  const [sendRows, setSendRows] = useState<RecipientChip[]>([]);
  const [activeSendEmail, setActiveSendEmail] = useState("");
  const sendAbortRef = useRef<AbortController | null>(null);
  const stopSendRef = useRef(false);
  const activeRowRef = useRef<HTMLDivElement | null>(null);

  const [readOnlyPreviewOpen, setReadOnlyPreviewOpen] = useState(false);
  const [readOnlyPreviewEmail, setReadOnlyPreviewEmail] = useState("");
  const bannerTopPreviewUrlRef = useRef("");
  const bannerBottomPreviewUrlRef = useRef("");
  const bodyAudioPreviewUrlRef = useRef("");
  const bodyImagePreviewUrlRef = useRef("");

  useEffect(() => {
    bodyInlineMediaItemsRef.current = bodyInlineMediaItems;
  }, [bodyInlineMediaItems]);

  useEffect(() => {
    bannerTopPreviewUrlRef.current = bannerTopPreviewUrl;
  }, [bannerTopPreviewUrl]);

  useEffect(() => {
    bannerBottomPreviewUrlRef.current = bannerBottomPreviewUrl;
  }, [bannerBottomPreviewUrl]);

  useEffect(() => {
    bodyAudioPreviewUrlRef.current = bodyAudioPreviewUrl;
  }, [bodyAudioPreviewUrl]);

  useEffect(() => {
    bodyImagePreviewUrlRef.current = bodyImagePreviewUrl;
  }, [bodyImagePreviewUrl]);

  useEffect(() => {
    return () => {
      revokePreviewUrl(bannerTopPreviewUrlRef.current);
      revokePreviewUrl(bannerBottomPreviewUrlRef.current);
      revokePreviewUrl(bodyAudioPreviewUrlRef.current);
      revokePreviewUrl(bodyImagePreviewUrlRef.current);

      for (const item of bodyInlineMediaItemsRef.current) {
        revokePreviewUrl(item.previewUrl);
      }
    };
  }, []);

  function applyOpenedCampaign(payload: OpenCampaignResponse) {
    const campaign = payload.campaign;

    if (!payload.ok || !campaign) {
      setStatus(payload.error || "Could not open draft or campaign.");
      return;
    }

    if (payload.readonly) {
      setStatus(
        "Sent campaigns open from the Logs page read-only overlay. Composer was not changed.",
      );
      return;
    }

    const meta = campaign.meta || {};
    const nextMode = safeMailModeValue(campaign.mode);
    const nextOpenMode: "editable" = "editable";
    setOpenedCampaignId(campaign.id);
    setOpenedCampaignStatus(campaign.status || "");
    setOpenedCampaignMode(nextOpenMode);

    setTemplateId("");
    setMode(nextMode);
    setSenderId(campaign.sender_identity_id || "");
    setFooterPolicyId(campaign.footer_policy_id || "");
    setSubject(campaign.subject || "");
    setTitle(campaign.title || campaign.draft_label || campaign.subject || "");
    setSubtitle(stringFromMeta(meta, "subtitle"));
    setBadge(stringFromMeta(meta, "badge") || defaultBadgeForMode(nextMode));
    setMessage(campaign.body_text || "");

    setImagePosition(
      safeImagePositionValue(
        stringFromMeta(meta, "banner_position") || campaign.image_position,
      ),
    );
    setBannerHeight(numberFromMeta(meta, "banner_height", 96));

    setBodyAudioDisplayName(
      stringFromMeta(meta, "body_audio_display_name") || "StayKnown Audio",
    );
    setBodyAudioPlacement(
      safeBodyPlacementValue(stringFromMeta(meta, "body_audio_placement")),
    );
    setBodyAudioSize(numberFromMeta(meta, "body_audio_size", 76));
    setBodyAudioHint(stringFromMeta(meta, "body_audio_hint"));
    setBodyAudioHintColor(
      stringFromMeta(meta, "body_audio_hint_color") || "#6b7280",
    );
    setBodyAudioHintFontStyle(
      safeHintFontStyleValue(
        stringFromMeta(meta, "body_audio_hint_font_style"),
      ),
    );

    setBodyImageDisplayName(
      stringFromMeta(meta, "body_image_display_name") || "StayKnown Image",
    );
    setBodyImagePlacement(
      safeBodyPlacementValue(stringFromMeta(meta, "body_image_placement")),
    );
    setBodyImageShape(
      safeBodyImageShapeValue(stringFromMeta(meta, "body_image_shape")),
    );
    setBodyImageSize(numberFromMeta(meta, "body_image_size", 88));
    setBodyImageHint(stringFromMeta(meta, "body_image_hint"));
    setBodyImageHintColor(
      stringFromMeta(meta, "body_image_hint_color") || "#6b7280",
    );
    setBodyImageHintFontStyle(
      safeHintFontStyleValue(
        stringFromMeta(meta, "body_image_hint_font_style"),
      ),
    );

    setBodyBlockOrder(
      safeBodyBlockOrderValue(stringArrayFromMeta(meta, "body_block_order")),
    );

    setCtaLabel(campaign.cta_label || "");
    setCtaUrl(campaign.cta_url || "");

    setStoreBadgePlacement(
      safeStoreBadgePlacementValue(
        stringFromMeta(meta, "store_badge_placement"),
      ),
    );
    setGooglePlayEnabled(booleanFromMeta(meta, "google_play_enabled"));
    setGooglePlayUrl(stringFromMeta(meta, "google_play_url"));
    setAppStoreEnabled(booleanFromMeta(meta, "app_store_enabled"));
    setAppStoreUrl(stringFromMeta(meta, "app_store_url"));

    setCustomFooter(campaign.footer_html || "");

    const nextPolicyLinks = safePolicyLinksValue(
      stringArrayFromMeta(meta, "policy_links"),
    );

    setSelectedPolicyLinks(
      nextPolicyLinks.length > 0 ? nextPolicyLinks : ["privacy", "terms"],
    );

    setSocialTikTokEnabled(booleanFromMeta(meta, "social_tiktok_enabled"));
    setSocialTikTokUsername(stringFromMeta(meta, "social_tiktok_username"));

    setSocialTwitterEnabled(booleanFromMeta(meta, "social_twitter_enabled"));
    setSocialTwitterUsername(stringFromMeta(meta, "social_twitter_username"));

    setSocialFacebookEnabled(booleanFromMeta(meta, "social_facebook_enabled"));
    setSocialFacebookUsername(stringFromMeta(meta, "social_facebook_username"));

    const restoredRecipients = stringArrayFromMeta(meta, "recipient_emails")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
      .map((email) => ({
        id: makeId("recipient"),
        email,
        status: "ready" as RecipientStatus,
      }));

    setRecipients(restoredRecipients);
    setRecipientInput("");
    setRecipientIssues([]);

    setBannerTopFile(null);
    setBannerBottomFile(null);
    setBannerTopPreviewUrl("");
    setBannerBottomPreviewUrl("");
    setBodyAudioFile(null);
    setBodyAudioPreviewUrl("");
    setBodyImageFile(null);
    setBodyImagePreviewUrl("");

    for (const item of bodyInlineMediaItemsRef.current) {
      revokePreviewUrl(item.previewUrl);
    }

    setBodyInlineMediaItems([]);
    setFiles([]);

    setReadOnlyPreviewOpen(false);
    setReadOnlyPreviewEmail("");
    setStatus(
      "Draft opened. Saved banner, body image, body audio, and attachments will be restored if they were stored with the draft.",
    );
  }

  async function restoreStoredDraftAttachments(
    attachments: StoredDraftAttachment[],
  ) {
    if (!attachments || attachments.length === 0) return;

    setStatus("Restoring saved draft files...");

    const restoredFiles: PickedFile[] = [];
    let failedToReloadCount = 0;

    async function loadFileFromSignedUrl(attachment: StoredDraftAttachment) {
      if (!attachment.signed_url) return null;

      try {
        const res = await fetch(attachment.signed_url, {
          cache: "no-store",
        });

        if (!res.ok) {
          failedToReloadCount += 1;
          return null;
        }

        const blob = await res.blob();

        return new File([blob], attachment.file_name, {
          type: attachment.mime_type || blob.type || "application/octet-stream",
        });
      } catch (_) {
        failedToReloadCount += 1;
        return null;
      }
    }

    for (const attachment of attachments) {
      const signedUrl = attachment.signed_url || "";

      if (
        attachment.role === "body_inline_audio" ||
        attachment.role === "body_inline_image" ||
        attachment.role === "body_inline_video" ||
        attachment.role === "body_inline_file"
      ) {
        continue;
      }

      if (!signedUrl) {
        failedToReloadCount += 1;
        continue;
      }

      if (attachment.role === "banner_top") {
        setBannerTopPreviewUrl(signedUrl);
        setImagePosition((prev) => (prev === "none" ? "top" : prev));
      }

      if (attachment.role === "banner_bottom") {
        setBannerBottomPreviewUrl(signedUrl);
        setImagePosition((prev) => (prev === "none" ? "bottom" : prev));
      }

      if (attachment.role === "body_audio") {
        setBodyAudioPreviewUrl(signedUrl);
        setBodyAudioDisplayName(
          attachment.display_name || attachment.file_name || "StayKnown Audio",
        );
      }

      if (attachment.role === "body_image") {
        setBodyImagePreviewUrl(signedUrl);
        setBodyImageDisplayName(
          attachment.display_name || attachment.file_name || "StayKnown Image",
        );
      }

      const file = await loadFileFromSignedUrl(attachment);

      if (!file) continue;

      if (attachment.role === "banner_top") {
        setBannerTopFile(file);
        continue;
      }

      if (attachment.role === "banner_bottom") {
        setBannerBottomFile(file);
        continue;
      }

      if (attachment.role === "body_audio") {
        setBodyAudioFile(file);
        continue;
      }

      if (attachment.role === "body_image") {
        setBodyImageFile(file);
        continue;
      }

      restoredFiles.push({
        id: makeId("restored-file"),
        file,
        mode:
          attachment.attachment_mode === "inline_image" ||
          attachment.attachment_mode === "link_only"
            ? attachment.attachment_mode
            : "attach",
        displayName: attachment.display_name || attachment.file_name,
      });
    }

    if (restoredFiles.length > 0) {
      setFiles(restoredFiles);
    }

    setStatus(
      failedToReloadCount > 0
        ? "Draft preview restored. Some files could not be fully reloaded for sending; reselect any missing file before sending."
        : "Draft opened and saved files restored.",
    );
  }

  function restoreStoredDraftInlineMediaItems(
    items: StoredDraftInlineMediaItem[],
  ) {
    if (!Array.isArray(items) || items.length === 0) return;

    const restored: BodyInlineMediaItem[] = [];

    for (const item of items) {
      const kind =
        item.kind === "audio" ||
        item.kind === "image" ||
        item.kind === "video" ||
        item.kind === "file"
          ? item.kind
          : null;

      const signedUrl = item.signed_url || item.signedUrl || "";

      if (!kind || !item.id || !signedUrl) {
        continue;
      }

      const displayName =
        item.display_name ||
        item.displayName ||
        (kind === "audio"
          ? "StayKnown Audio"
          : kind === "image"
            ? "StayKnown Image"
            : kind === "video"
              ? "StayKnown Video"
              : "StayKnown File");

      const size =
        typeof item.size === "number" && Number.isFinite(item.size)
          ? Math.max(32, Math.min(100, Math.round(item.size)))
          : kind === "audio"
            ? 76
            : kind === "image" || kind === "video"
              ? 88
              : 100;
      const placement: BodyMediaPlacement =
        item.placement === "top" || item.placement === "bottom"
          ? item.placement
          : "custom";

      const hint = typeof item.hint === "string" ? item.hint : "";

      const hintColor = item.hint_color || item.hintColor || "#6b7280";

      const hintFontStyle: BodyHintFontStyle =
        item.hint_font_style === "italic" || item.hintFontStyle === "italic"
          ? "italic"
          : "normal";

      const imageShape =
        kind === "image" || kind === "video" || kind === "file"
          ? item.image_shape || item.imageShape || "rectangle"
          : undefined;
      const restoredItem: BodyInlineMediaItem = {
        id: item.id,
        kind,
        file: null,
        previewUrl: signedUrl,
        displayName,
        size,
        placement,
        hint,
        hintColor,
        hintFontStyle,
        imageShape,
        mimeType:
          item.mime_type ||
          item.mimeType ||
          (kind === "audio"
            ? "audio/mpeg"
            : kind === "image"
              ? "image/png"
              : kind === "video"
                ? "video/mp4"
                : "application/octet-stream"),
        originalName: item.original_name || item.originalName || displayName,
        storageBucket: item.storage_bucket || item.storageBucket || "",
        storagePath: item.storage_path || item.storagePath || "",
      };

      restored.push(restoredItem);
    }

    setBodyInlineMediaItems(restored);
  }

  useEffect(() => {
    let cancelled = false;

    async function openCampaignFromUrl() {
      if (typeof window === "undefined") return;

      const params = new URLSearchParams(window.location.search);
      const draftId = params.get("draft_id") || "";
      const campaignId = params.get("campaign_id") || "";

      if (campaignId && !draftId) {
        window.history.replaceState(null, "", "/mail-console/send");
        setStatus(
          "Sent campaigns must be viewed from the Logs page overlay. Composer was not changed.",
        );
        return;
      }

      const openId = draftId;

      if (!openId) return;

      setOpeningCampaign(true);
      setStatus("Opening saved draft...");
      try {
        const res = await fetch(
          `/api/mail-console/save-draft?id=${encodeURIComponent(openId)}`,
        );

        const data = (await res
          .json()
          .catch(() => ({}))) as OpenCampaignResponse;

        if (cancelled) return;

        if (!res.ok || !data.ok) {
          setStatus(data.error || "Could not open draft or campaign.");
          return;
        }

        if (data.readonly) {
          setStatus(
            "Sent campaigns must be viewed from the Logs page overlay. Composer was not changed.",
          );
          return;
        }

        applyOpenedCampaign(data);

        restoreStoredDraftInlineMediaItems(
          data.body_inline_media_items ||
            ((data.campaign?.meta?.body_inline_media_items ||
              []) as StoredDraftInlineMediaItem[]),
        );

        await restoreStoredDraftAttachments(data.attachments || []);
      } catch (err) {
        if (cancelled) return;

        setStatus(
          err instanceof Error
            ? err.message
            : "Could not open draft or campaign.",
        );
      } finally {
        if (!cancelled) {
          setOpeningCampaign(false);
        }
      }
    }

    openCampaignFromUrl();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeSendEmail) return;

    activeRowRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [activeSendEmail, sendRows]);

  useEffect(() => {
    if (!readOnlyPreviewOpen) return;

    function closeOnEscape(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") {
        setReadOnlyPreviewOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [readOnlyPreviewOpen]);

  useEffect(() => {
    if (!status) return;
    if (sending || openingCampaign || savingDraft) return;

    const timer = window.setTimeout(() => {
      setStatus("");
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [status, sending, openingCampaign, savingDraft]);

  const allowedTemplates = useMemo(
    () => templates.filter((t) => t.mode === mode),
    [templates, mode],
  );

  const allowedSenders = useMemo(
    () => senders.filter((s) => senderAllowedForMode(s, mode)),
    [senders, mode],
  );

  const selectedSender = useMemo(
    () => allowedSenders.find((s) => s.id === senderId) || null,
    [allowedSenders, senderId],
  );

  const selectedBrandName = brandNameForSenderEmail(
    selectedSender?.from_email || "",
  );

  const selectedPolicyBrand = policyBrandForSenderEmail(
    selectedSender?.from_email || "",
  );

  const currentPolicyLinkOptions = useMemo(
    () =>
      POLICY_LINK_OPTIONS.filter((item) => {
        if (selectedPolicyBrand === "6rides") return item.brand === "6rides";
        if (selectedPolicyBrand === "foundation") {
          return item.brand === "foundation";
        }

        return item.brand !== "6rides" && item.brand !== "foundation";
      }),
    [selectedPolicyBrand],
  );

  useEffect(() => {
    if (selectedPolicyBrand === "6rides") {
      setSelectedPolicyLinks((prev) => {
        const current6Rides = prev.filter(isSixRidesPolicyKey);

        return current6Rides.length > 0 ? current6Rides : SIX_RIDES_POLICY_KEYS;
      });

      return;
    }

    if (selectedPolicyBrand === "foundation") {
      setSelectedPolicyLinks((prev) => {
        const currentFoundation = prev.filter(isFoundationPolicyKey);

        return currentFoundation.length > 0
          ? currentFoundation
          : FOUNDATION_POLICY_KEYS;
      });

      return;
    }

    setSelectedPolicyLinks((prev) => {
      const hasWrongBrandPolicy =
        prev.some(isSixRidesPolicyKey) || prev.some(isFoundationPolicyKey);

      return hasWrongBrandPolicy ? STAYKNOWN_DEFAULT_POLICY_KEYS : prev;
    });
  }, [selectedPolicyBrand]);

  const allowedFooters = useMemo(() => {
    const exact = footerPolicies.filter((f) => f.mode === mode);
    const general = footerPolicies.filter((f) => f.mode === "general");
    return [...exact, ...general];
  }, [footerPolicies, mode]);

  const selectedFooter = useMemo(
    () => allowedFooters.find((f) => f.id === footerPolicyId) || null,
    [allowedFooters, footerPolicyId],
  );

  const sendSummary = useMemo(() => {
    const total = sendRows.length;
    const sent = sendRows.filter((r) => r.status === "sent").length;
    const failed = sendRows.filter((r) => r.status === "failed").length;
    const skipped = sendRows.filter((r) => r.status === "skipped").length;
    const sendingNow = sendRows.filter((r) => r.status === "sending").length;
    const draft = sendRows.filter((r) => r.status === "draft").length;
    const queued = sendRows.filter((r) => r.status === "queued").length;

    return {
      total,
      sent,
      failed,
      skipped,
      sendingNow,
      draft,
      queued,
      done: sent + failed + skipped + draft,
    };
  }, [sendRows]);

  const sendOverlayKicker =
    sendSummary.total <= 1
      ? "Single Email Delivery"
      : sendSummary.total <= SEND_BATCH_SIZE
        ? "Direct Email Delivery"
        : "Sending Queue";
  const sendOverlayTitle = sendComplete
    ? sendSummary.total <= 1
      ? "Email sent"
      : "Sending complete"
    : sendSummary.total <= 1
      ? "Sending 1 email..."
      : `Sending ${sendSummary.total} emails...`;

  const sendOverlayDescription =
    sendSummary.total <= 1
      ? "This email is being delivered now. No batch waiting is used for a single recipient."
      : sendSummary.total <= SEND_BATCH_SIZE
        ? `Sending ${sendSummary.total} emails in one direct batch. No extra waiting step is needed because this is under the ${SEND_BATCH_SIZE}-recipient batch limit.`
        : `Sending ${sendSummary.total} emails in batches of ${SEND_BATCH_SIZE}. Already sent emails cannot be cancelled. Stopping now keeps remaining queued emails in draft status.`;
  const stopSendButtonLabel =
    sendSummary.total <= 1 ? "Stop send" : "Stop & save remaining as draft";

  const isReadOnlyCampaign = openedCampaignMode === "readonly";
  const isOpenedDraft = openedCampaignMode === "editable";
  const composerActionDisabled =
    sending || openingCampaign || isReadOnlyCampaign;

  const selectedRecipientEmailSet = useMemo(
    () => new Set(selectedRecipientEmails),
    [selectedRecipientEmails],
  );

  const allRecipientsMarked =
    recipients.length > 0 &&
    recipients.every((recipient) =>
      selectedRecipientEmailSet.has(recipient.email),
    );

  const selectedRecipientCount = recipients.filter((recipient) =>
    selectedRecipientEmailSet.has(recipient.email),
  ).length;

  function changeMode(nextMode: MailMode) {
    if (isReadOnlyCampaign) {
      setStatus("This sent campaign is read-only.");
      return;
    }

    setMode(nextMode);
    setSenderId("");
    setFooterPolicyId("");
    setCustomFooter("");
    setTitle(defaultTitleForMode(nextMode));
    setBadge(defaultBadgeForMode(nextMode));
    setStatus(`${modeLabel(nextMode)} mode selected.`);
  }

  function applyTemplate(nextTemplateId: string) {
    if (isReadOnlyCampaign) {
      setStatus("This sent campaign is read-only.");
      return;
    }

    setTemplateId(nextTemplateId);

    const template = templates.find((t) => t.id === nextTemplateId);
    if (!template) return;

    const nextMode = template.mode as MailMode;

    setMode(nextMode);
    setSenderId("");
    setFooterPolicyId("");
    setCustomFooter("");
    setSubject(template.subject || "");
    setTitle(template.subject || defaultTitleForMode(nextMode));
    setBadge(defaultBadgeForMode(nextMode));
    setMessage(template.body_text || "");

    const pos = template.default_image_position as ImagePosition;
    if (pos === "none" || pos === "top" || pos === "bottom" || pos === "both") {
      setImagePosition(pos);
    }

    setStatus(`Template loaded: ${template.name}`);
  }

  function addRecipientsFromText(raw: string, clearInput = true) {
    if (!raw.trim()) return false;

    const merged = mergeRecipientList(recipients, raw);

    setRecipients(merged.next);
    setRecipientIssues(merged.issues);

    if (clearInput && merged.candidatesAdded) {
      setRecipientInput("");
    }

    if (clearInput && merged.issues.length === 0) {
      setRecipientInput("");
    }

    if (merged.issues.length > 0) {
      setStatus("Fix the highlighted recipient email issue before sending.");
    } else {
      setStatus("");
    }

    return merged.issues.length === 0;
  }

  function commitRecipientInput() {
    if (!recipientInput.trim()) return;
    addRecipientsFromText(recipientInput, true);
  }

  function removeRecipient(email: string) {
    setRecipients((prev) => prev.filter((r) => r.email !== email));
    setRecipientIssues((prev) => prev.filter((i) => i.value !== email));
    setSelectedRecipientEmails((prev) => prev.filter((item) => item !== email));
  }

  function startRecipientEdit(email: string) {
    if (sending || openingCampaign || isReadOnlyCampaign) return;

    setEditingRecipientEmail(email);
    setEditingRecipientValue(email);
  }

  function cancelRecipientEdit() {
    setEditingRecipientEmail("");
    setEditingRecipientValue("");
  }

  function commitRecipientEdit(oldEmail: string) {
    const nextEmail = normalizeEmailInput(editingRecipientValue);

    if (!nextEmail) {
      cancelRecipientEdit();
      return;
    }

    if (!isValidEmail(nextEmail)) {
      setStatus("Enter a valid email address.");
      return;
    }

    const duplicate = recipients.some(
      (recipient) =>
        recipient.email !== oldEmail &&
        recipient.email.toLowerCase() === nextEmail,
    );

    if (duplicate) {
      setStatus("That email is already added.");
      return;
    }

    setRecipients((prev) =>
      prev.map((recipient) =>
        recipient.email === oldEmail
          ? {
              ...recipient,
              email: nextEmail,
              status: "ready",
              error: "",
            }
          : recipient,
      ),
    );

    setRecipientIssues((prev) =>
      prev.filter((issue) => issue.value.toLowerCase() !== oldEmail),
    );

    setSelectedRecipientEmails((prev) =>
      prev.map((email) => (email === oldEmail ? nextEmail : email)),
    );

    setEditingRecipientEmail("");
    setEditingRecipientValue("");
    setStatus("Recipient email updated.");
  }

  function toggleRecipientMarked(email: string) {
    setSelectedRecipientEmails((prev) =>
      prev.includes(email)
        ? prev.filter((item) => item !== email)
        : [...prev, email],
    );
  }

  function toggleMarkAllRecipients() {
    if (allRecipientsMarked) {
      setSelectedRecipientEmails([]);
      return;
    }

    setSelectedRecipientEmails(recipients.map((recipient) => recipient.email));
  }

  function clearMarkedRecipients() {
    if (selectedRecipientCount === 0) {
      setStatus("Mark at least one recipient email first.");
      return;
    }

    const selected = new Set(selectedRecipientEmails);

    setRecipients((prev) =>
      prev.filter((recipient) => !selected.has(recipient.email)),
    );

    setRecipientIssues((prev) =>
      prev.filter((issue) => !selected.has(issue.value.toLowerCase())),
    );

    setSelectedRecipientEmails([]);
    setStatus(`${selectedRecipientCount} marked email(s) removed.`);
  }

  function clearAllRecipients() {
    setRecipients([]);
    setRecipientInput("");
    setRecipientIssues([]);
    setSelectedRecipientEmails([]);
    setStatus("All recipient emails cleared.");
  }

  function applyRecipientSuggestion(issue: RecipientIssue) {
    if (!issue.suggestion) return;

    const merged = mergeRecipientList(recipients, issue.suggestion);

    setRecipients(merged.next);
    setRecipientIssues((prev) => prev.filter((x) => x.value !== issue.value));
    setRecipientInput("");
  }

  function handleRecipientKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      commitRecipientInput();
      return;
    }

    if (e.key === ",") {
      const current = recipientInput.trim();

      if (isValidEmail(normalizeEmailInput(current))) {
        e.preventDefault();
        addRecipientsFromText(current, true);
      }
    }

    if (e.key === "Backspace" && !recipientInput && recipients.length > 0) {
      const last = recipients[recipients.length - 1];
      removeRecipient(last.email);
    }
  }

  function handleRecipientPaste(e: ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text");

    if (!text.trim()) return;

    e.preventDefault();
    addRecipientsFromText(text, true);
  }

  function pickBannerFile(file: File | null, placement: "top" | "bottom") {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus("Banner must be an image file.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    if (placement === "top") {
      if (bannerTopPreviewUrl) revokePreviewUrl(bannerTopPreviewUrl);

      setBannerTopFile(file);
      setBannerTopPreviewUrl(previewUrl);

      if (imagePosition === "none") {
        setImagePosition("top");
      }
    } else {
      if (bannerBottomPreviewUrl) revokePreviewUrl(bannerBottomPreviewUrl);

      setBannerBottomFile(file);
      setBannerBottomPreviewUrl(previewUrl);

      if (imagePosition === "none") {
        setImagePosition("bottom");
      }
    }

    setStatus("Banner image selected and shown in preview.");
  }

  function clearBanner(placement: "top" | "bottom") {
    if (placement === "top") {
      if (bannerTopPreviewUrl) revokePreviewUrl(bannerTopPreviewUrl);

      setBannerTopFile(null);
      setBannerTopPreviewUrl("");
    } else {
      if (bannerBottomPreviewUrl) revokePreviewUrl(bannerBottomPreviewUrl);

      setBannerBottomFile(null);
      setBannerBottomPreviewUrl("");
    }

    setStatus("Banner image removed.");
  }

  function pickBodyAudioFile(file: File | null) {
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      setStatus("Body audio must be an audio file.");
      return;
    }

    if (bodyAudioPreviewUrl) revokePreviewUrl(bodyAudioPreviewUrl);

    const previewUrl = URL.createObjectURL(file);

    setBodyAudioFile(file);
    setBodyAudioPreviewUrl(previewUrl);
    setBodyAudioDisplayName((prev) => prev.trim() || "StayKnown Audio");

    setStatus(
      "Body audio selected. Tap inside the message and insert {{audio}} where you want it.",
    );
  }

  function clearBodyAudio() {
    if (bodyAudioPreviewUrl) revokePreviewUrl(bodyAudioPreviewUrl);

    setBodyAudioFile(null);
    setBodyAudioPreviewUrl("");
    setBodyAudioDisplayName("StayKnown Audio");
    setBodyAudioHint("");
    setBodyAudioHintColor("#6b7280");
    setBodyAudioHintFontStyle("normal");

    setStatus(
      "Selected body audio removed. Inserted audio markers in the message were not deleted.",
    );
  }
  function pickBodyImageFile(file: File | null) {
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      setStatus("Body media must be an image or video file.");
      return;
    }

    if (bodyImagePreviewUrl) revokePreviewUrl(bodyImagePreviewUrl);

    const previewUrl = URL.createObjectURL(file);

    setBodyImageFile(file);
    setBodyImagePreviewUrl(previewUrl);
    setBodyImageDisplayName(
      (prev) =>
        prev.trim() || (isVideo ? "StayKnown Video" : "StayKnown Image"),
    );

    setStatus(
      isVideo
        ? "Body video selected. Tap inside the message and insert it where you want it."
        : "Body image selected. Tap inside the message and insert it where you want it.",
    );
  }

  function clearBodyImage() {
    if (bodyImagePreviewUrl) revokePreviewUrl(bodyImagePreviewUrl);

    setBodyImageFile(null);
    setBodyImagePreviewUrl("");
    setBodyImageDisplayName("StayKnown Image");
    setBodyImageShape("rectangle");
    setBodyImageHint("");
    setBodyImageHintColor("#6b7280");
    setBodyImageHintFontStyle("normal");

    setStatus(
      "Selected body image/video removed. Inserted image or video markers in the message were not deleted.",
    );
  }
  function moveBodyBlock(dragged: BodyBlockKind, target: BodyBlockKind) {
    if (dragged === target) return;

    setBodyBlockOrder((prev) => {
      const next = prev.filter((x) => x !== dragged);
      const targetIndex = next.indexOf(target);

      if (targetIndex < 0) return prev;

      next.splice(targetIndex, 0, dragged);
      return next;
    });
  }

  function insertBodyTokenAtCursor(token: string) {
    const textarea = messageTextareaRef.current;
    const current = message;

    if (!textarea) {
      setMessage((prev) => `${prev.trimEnd()}\n\n${token}\n\n`);
      setStatus("Media inserted into the message body.");
      return;
    }

    const start = textarea.selectionStart ?? current.length;
    const end = textarea.selectionEnd ?? start;

    const textareaScrollTop = textarea.scrollTop;
    const textareaScrollLeft = textarea.scrollLeft;
    const windowScrollX = window.scrollX;
    const windowScrollY = window.scrollY;

    const before = current.slice(0, start);
    const after = current.slice(end);

    const prefix = before && !before.endsWith("\n") ? "\n\n" : "";
    const suffix = after && !after.startsWith("\n") ? "\n\n" : "";
    const insert = `${prefix}${token}${suffix}`;

    const next = `${before}${insert}${after}`;

    setMessage(next);
    setStatus("Media inserted at the cursor position.");

    window.requestAnimationFrame(() => {
      const nextCursor = start + insert.length;

      textarea.focus({
        preventScroll: true,
      });

      textarea.setSelectionRange(nextCursor, nextCursor);
      textarea.scrollTop = textareaScrollTop;
      textarea.scrollLeft = textareaScrollLeft;

      window.scrollTo(windowScrollX, windowScrollY);
    });
  }
  function insertCurrentBodyMedia(kind: "audio" | "image") {
    if (kind === "audio") {
      if (!bodyAudioPreviewUrl) {
        setStatus("Choose an audio file first.");
        return;
      }

      const id = makeId("body-audio");
      const previewUrl = bodyAudioFile
        ? URL.createObjectURL(bodyAudioFile)
        : bodyAudioPreviewUrl;

      const item: BodyInlineMediaItem = {
        id,
        kind: "audio",
        file: bodyAudioFile,
        previewUrl,
        displayName: cleanDisplayFilename(
          bodyAudioDisplayName,
          "StayKnown Audio",
        ),
        size: bodyAudioSize,
        placement: "custom",
        hint: bodyAudioHint,
        hintColor: bodyAudioHintColor,
        hintFontStyle: bodyAudioHintFontStyle,
        mimeType: bodyAudioFile?.type || "audio/mpeg",
        originalName:
          bodyAudioFile?.name || bodyAudioDisplayName || "StayKnown Audio",
      };

      setBodyInlineMediaItems((prev) => [...prev, item]);
      insertBodyTokenAtCursor(bodyInlineToken("audio", id));
      return;
    }

    if (!bodyImagePreviewUrl) {
      setStatus("Choose an image or video file first.");
      return;
    }

    const isVideo = bodyImageFile?.type.startsWith("video/") || false;
    const mediaKind: "image" | "video" = isVideo ? "video" : "image";

    const id = makeId(isVideo ? "body-video" : "body-image");
    const previewUrl = bodyImageFile
      ? URL.createObjectURL(bodyImageFile)
      : bodyImagePreviewUrl;

    const item: BodyInlineMediaItem = {
      id,
      kind: mediaKind,
      file: bodyImageFile,
      previewUrl,
      displayName: cleanDisplayFilename(
        bodyImageDisplayName,
        isVideo ? "StayKnown Video" : "StayKnown Image",
      ),
      size: bodyImageSize,
      placement: "custom",
      hint: bodyImageHint,
      hintColor: bodyImageHintColor,
      hintFontStyle: bodyImageHintFontStyle,
      imageShape: bodyImageShape,
      mimeType: bodyImageFile?.type || (isVideo ? "video/mp4" : "image/png"),
      originalName:
        bodyImageFile?.name ||
        bodyImageDisplayName ||
        (isVideo ? "StayKnown Video" : "StayKnown Image"),
    };

    setBodyInlineMediaItems((prev) => [...prev, item]);
    insertBodyTokenAtCursor(bodyInlineToken(mediaKind, id));
  }
  function insertAttachmentInsideMessage(picked: PickedFile) {
    try {
      if (!picked?.file) {
        setStatus("Choose an attachment first.");
        return;
      }

      const file = picked.file;
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const inlineKind: "image" | "video" | "file" = isImage
        ? "image"
        : isVideo
          ? "video"
          : "file";

      const id = makeId(
        inlineKind === "image"
          ? "body-image"
          : inlineKind === "video"
            ? "body-video"
            : "body-file",
      );

      const previewUrl = URL.createObjectURL(file);

      const item: BodyInlineMediaItem = {
        id,
        kind: inlineKind,
        file,
        previewUrl,
        displayName: cleanDisplayFilename(
          picked.displayName,
          isVideo
            ? "StayKnown Video"
            : isImage
              ? "StayKnown Image"
              : defaultAttachmentDisplayName(file, 0),
        ),
        size: 100,
        placement: "custom",
        hint: "",
        hintColor: "#6b7280",
        hintFontStyle: "normal",
        imageShape: "rectangle",
        mimeType: file.type || "application/octet-stream",
        originalName:
          file.name ||
          picked.displayName ||
          (isVideo
            ? "StayKnown Video"
            : isImage
              ? "StayKnown Image"
              : "StayKnown File"),
      };

      setBodyInlineMediaItems((prev) => [...prev, item]);

      // Keep the original file in the attachment list.
      // The backend will dedupe it so it does not double the payload.
      insertBodyTokenAtCursor(bodyInlineToken(inlineKind, id));

      setStatus(
        isImage
          ? "Image inserted inside the message body. It can still remain available as an attachment."
          : isVideo
            ? "Video marker inserted inside the message body. The file will be attached for delivery."
            : "File marker inserted inside the message body. The file will be attached for delivery.",
      );
    } catch (err) {
      console.error(
        "[MailConsole] insert attachment inside message failed",
        err,
      );
      setStatus(
        err instanceof Error
          ? `Could not insert attachment inside message: ${err.message}`
          : "Could not insert attachment inside message.",
      );
    }
  }
  async function saveDraft() {
    if (isReadOnlyCampaign) {
      setStatus(
        "This sent campaign is read-only and cannot be saved as a draft from this view.",
      );
      return;
    }

    if (savingDraft) return;

    const activeBodyInlineMediaItems = getActiveBodyInlineMediaItems();

    const normalizedMessage = normalizeLegacyBodyFileTokens(
      message,
      activeBodyInlineMediaItems,
    );

    const standaloneBodyAudioFile = shouldSendStandaloneBodyAudioFile()
      ? bodyAudioFile
      : null;

    const standaloneBodyImageFile = shouldSendStandaloneBodyImageFile()
      ? bodyImageFile
      : null;

    setSavingDraft(true);
    setStatus("");

    try {
      const form = new FormData();

      form.append("mode", mode);
      form.append("sender_identity_id", senderId);
      form.append(
        "recipient_emails",
        safeJsonStringify(recipients.map((r) => r.email)),
      );
      form.append("subject", subject);
      form.append("title", title);
      form.append("subtitle", subtitle);
      form.append("badge", badge);
      form.append("message", normalizedMessage);

      if (typeof window !== "undefined") {
        form.append(
          "brand_logo_url",
          new URL(brandLogoUrl, window.location.origin).toString(),
        );
      }

      form.append("image_position", imagePosition);
      form.append("banner_position", imagePosition);
      form.append(
        "banner_note",
        bannerTopFile || bannerBottomFile
          ? "Banner image is stored with this saved draft and will return when opened."
          : "",
      );
      form.append("banner_height", String(bannerHeight));

      if (bannerTopFile) {
        form.append("banner_top_file", bannerTopFile, bannerTopFile.name);
      }

      if (bannerBottomFile) {
        form.append(
          "banner_bottom_file",
          bannerBottomFile,
          bannerBottomFile.name,
        );
      }

      form.append("body_audio_placement", bodyAudioPlacement);
      form.append("body_audio_size", String(bodyAudioSize));
      form.append(
        "body_audio_display_name",
        cleanDisplayFilename(bodyAudioDisplayName, "StayKnown Audio"),
      );
      form.append("body_audio_hint", bodyAudioHint);
      form.append("body_audio_hint_color", bodyAudioHintColor);
      form.append("body_audio_hint_font_style", bodyAudioHintFontStyle);

      if (standaloneBodyAudioFile) {
        form.append(
          "body_audio_file",
          standaloneBodyAudioFile,
          standaloneBodyAudioFile.name,
        );
      }

      form.append("body_image_placement", bodyImagePlacement);
      form.append("body_image_shape", bodyImageShape);
      form.append("body_image_size", String(bodyImageSize));
      form.append(
        "body_image_display_name",
        cleanDisplayFilename(bodyImageDisplayName, "StayKnown Image"),
      );
      form.append("body_image_hint", bodyImageHint);
      form.append("body_image_hint_color", bodyImageHintColor);
      form.append("body_image_hint_font_style", bodyImageHintFontStyle);

      if (standaloneBodyImageFile) {
        form.append(
          "body_image_file",
          standaloneBodyImageFile,
          standaloneBodyImageFile.name,
        );
      }

      form.append(
        "body_inline_media_items",
        safeJsonStringify(
          activeBodyInlineMediaItems.map(bodyInlineFormPayload),
        ),
      );

      for (const item of activeBodyInlineMediaItems) {
        if (item.file) {
          form.append(
            `body_inline_media_file_${item.id}`,
            item.file,
            item.originalName,
          );
        }
      }

      form.append("body_block_order", safeJsonStringify(bodyPreviewOrder));

      form.append(
        "body_media_note",
        standaloneBodyAudioFile ||
          standaloneBodyImageFile ||
          activeBodyInlineMediaItems.some((item) => item.file)
          ? "Body audio/image files are stored with this saved draft and will return when opened."
          : "",
      );

      form.append("cta_label", ctaLabel);
      form.append("cta_url", ctaUrl);

      form.append("store_badge_placement", storeBadgePlacement);
      form.append("google_play_enabled", googlePlayEnabled ? "true" : "false");
      form.append("google_play_url", googlePlayUrl);
      form.append("app_store_enabled", appStoreEnabled ? "true" : "false");
      form.append("app_store_url", appStoreUrl);

      form.append("footer_policy_id", footerPolicyId);
      form.append("footer_html", footerText);
      form.append("policy_links", safeJsonStringify(selectedPolicyLinks));

      form.append(
        "social_tiktok_enabled",
        socialTikTokEnabled ? "true" : "false",
      );
      form.append(
        "social_tiktok_username",
        cleanSocialUsername(socialTikTokUsername),
      );

      form.append(
        "social_twitter_enabled",
        socialTwitterEnabled ? "true" : "false",
      );
      form.append(
        "social_twitter_username",
        cleanSocialUsername(socialTwitterUsername),
      );

      form.append(
        "social_facebook_enabled",
        socialFacebookEnabled ? "true" : "false",
      );
      form.append(
        "social_facebook_username",
        cleanSocialUsername(socialFacebookUsername),
      );

      form.append(
        "file_modes",
        safeJsonStringify(files.map((picked) => picked.mode)),
      );

      form.append(
        "file_display_names",
        safeJsonStringify(
          files.map((picked, index) =>
            cleanDisplayFilename(
              picked.displayName,
              defaultAttachmentDisplayName(picked.file, index),
            ),
          ),
        ),
      );

      for (let i = 0; i < files.length; i += 1) {
        const picked = files[i];
        const displayName = cleanDisplayFilename(
          picked.displayName,
          defaultAttachmentDisplayName(picked.file, i),
        );

        form.append("files", picked.file, displayName);
      }

      const res = await fetch("/api/mail-console/save-draft", {
        method: "POST",
        body: form,
      });

      const contentType = res.headers.get("content-type") || "";

      const data = contentType.includes("application/json")
        ? await res.json().catch(() => ({}))
        : {
            ok: false,
            error: await res.text().catch(() => ""),
          };

      if (!res.ok || !data.ok) {
        const errorText = String(data.error || "");

        if (
          res.status === 413 ||
          errorText.includes("FUNCTION_PAYLOAD_TOO_LARGE") ||
          errorText.includes("Request Entity Too Large")
        ) {
          setStatus(
            "Could not save draft because the selected media/files are too large for one request. StayKnown did not reduce quality. Please remove unused media, split files into smaller groups, or use temporary hosted links for large files.",
          );
          return;
        }

        setStatus(data.error || "Could not save draft.");
        return;
      }

      setOpenedCampaignId(data.draft_id || "");
      setOpenedCampaignStatus("draft");
      setOpenedCampaignMode("editable");

      setStatus(
        `Draft saved with ${data.attachment_count || 0} stored file(s). Draft ID: ${
          data.draft_id
        }`,
      );
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not save draft.");
    } finally {
      setSavingDraft(false);
    }
  }

  function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files || []);
    if (picked.length === 0) return;

    setFiles((prev) => {
      const mapped = picked.map((file, index) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        file,
        mode: "attach" as AttachmentMode,
        displayName: defaultAttachmentDisplayName(file, prev.length + index),
      }));

      return [...prev, ...mapped];
    });

    e.target.value = "";
    setStatus(
      "Files added as normal attachments by default. You may choose only one file as inline or link-only.",
    );
  }

  function updateFileMode(id: string, mode: AttachmentMode) {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          return {
            ...f,
            mode,
          };
        }

        if (mode !== "attach") {
          return {
            ...f,
            mode: "attach",
          };
        }

        return f;
      }),
    );
  }

  function updateFileDisplayName(id: string, displayName: string) {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              displayName,
            }
          : f,
      ),
    );
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function togglePolicyLink(key: PolicyLinkKey) {
    setSelectedPolicyLinks((prev) => {
      if (prev.includes(key)) {
        return prev.filter((x) => x !== key);
      }

      return [...prev, key];
    });
  }

  function getSelectedUploadFiles() {
    const selected: Array<{ label: string; file: File }> = [];

    if (bannerTopFile) {
      selected.push({ label: "top banner", file: bannerTopFile });
    }

    if (bannerBottomFile) {
      selected.push({ label: "bottom banner", file: bannerBottomFile });
    }

    if (bodyAudioFile) {
      selected.push({ label: "body audio", file: bodyAudioFile });
    }

    if (bodyImageFile) {
      selected.push({ label: "body image", file: bodyImageFile });
    }

    for (const item of bodyInlineMediaItems) {
      if (item.file) {
        selected.push({
          label: `inserted body ${item.kind}`,
          file: item.file,
        });
      }
    }

    for (const picked of files) {
      selected.push({
        label: picked.mode === "attach" ? "attachment" : picked.mode,
        file: picked.file,
      });
    }

    return selected;
  }

  function getSendUploadBlockReason() {
    // Do not block Send Email from the frontend because of selected media size.
    // Backend/provider limits will handle real hard failures.
    return "";
  }
  function bodyInlineTokenExistsInMessage(item: BodyInlineMediaItem) {
    const normalToken = `{{${item.kind}:${item.id}}}`;

    // Legacy support: old inserted files were sometimes saved as {{image:body-file-...}}
    const legacyFileImageToken =
      item.kind === "file" ? `{{image:${item.id}}}` : "";

    return (
      message.includes(normalToken) ||
      Boolean(legacyFileImageToken && message.includes(legacyFileImageToken))
    );
  }

  function getActiveBodyInlineMediaItems() {
    return bodyInlineMediaItems.filter(bodyInlineTokenExistsInMessage);
  }

  function normalizeLegacyBodyFileTokens(
    value: string,
    activeItems: BodyInlineMediaItem[],
  ) {
    let next = value;

    for (const item of activeItems) {
      if (item.kind !== "file") continue;

      next = next.replaceAll(`{{image:${item.id}}}`, `{{file:${item.id}}}`);
    }

    return next;
  }

  function hasInsertedAudioToken() {
    return /\{\{audio:[^}]+\}\}/.test(message);
  }

  function hasInsertedImageOrVideoToken() {
    return (
      /\{\{image:[^}]+\}\}/.test(message) || /\{\{video:[^}]+\}\}/.test(message)
    );
  }

  function shouldSendStandaloneBodyAudioFile() {
    if (!bodyAudioFile) return false;

    // If audio was inserted inside the message, do not also send it as a separate body block.
    if (hasInsertedAudioToken()) return false;

    return bodyPreviewOrder.includes("audio") || message.includes("{{audio}}");
  }

  function shouldSendStandaloneBodyImageFile() {
    if (!bodyImageFile) return false;

    // If image/video was inserted inside the message, do not also send it as a separate body block.
    if (hasInsertedImageOrVideoToken()) return false;

    return bodyPreviewOrder.includes("image") || message.includes("{{image}}");
  }

  function buildEmailForm(chunkEmails: string[]) {
    const form = new FormData();

    const activeBodyInlineMediaItems = getActiveBodyInlineMediaItems();

    const normalizedMessage = normalizeLegacyBodyFileTokens(
      message,
      activeBodyInlineMediaItems,
    );

    const standaloneBodyAudioFile = shouldSendStandaloneBodyAudioFile()
      ? bodyAudioFile
      : null;

    const standaloneBodyImageFile = shouldSendStandaloneBodyImageFile()
      ? bodyImageFile
      : null;

    form.append("mode", mode);
    form.append("sender_identity_id", senderId);
    form.append("to", chunkEmails.join(","));
    form.append("subject", subject);
    form.append("title", title);
    form.append("subtitle", subtitle);
    form.append("badge", badge);
    form.append("message", normalizedMessage);

    if (typeof window !== "undefined") {
      form.append(
        "brand_logo_url",
        new URL(brandLogoUrl, window.location.origin).toString(),
      );
    }

    form.append("image_position", imagePosition);
    form.append("banner_position", imagePosition);
    form.append("banner_height", String(bannerHeight));

    if (bannerTopFile) {
      form.append("banner_top_file", bannerTopFile, bannerTopFile.name);
    }

    if (bannerBottomFile) {
      form.append(
        "banner_bottom_file",
        bannerBottomFile,
        bannerBottomFile.name,
      );
    }

    form.append("body_audio_placement", bodyAudioPlacement);
    form.append("body_audio_size", String(bodyAudioSize));
    form.append(
      "body_audio_display_name",
      cleanDisplayFilename(bodyAudioDisplayName, "StayKnown Audio"),
    );
    form.append("body_audio_hint", bodyAudioHint);
    form.append("body_audio_hint_color", bodyAudioHintColor);
    form.append("body_audio_hint_font_style", bodyAudioHintFontStyle);

    form.append("body_image_placement", bodyImagePlacement);
    form.append("body_image_shape", bodyImageShape);
    form.append("body_image_size", String(bodyImageSize));
    form.append(
      "body_image_display_name",
      cleanDisplayFilename(bodyImageDisplayName, "StayKnown Image"),
    );
    form.append("body_image_hint", bodyImageHint);
    form.append("body_image_hint_color", bodyImageHintColor);
    form.append("body_image_hint_font_style", bodyImageHintFontStyle);

    form.append(
      "body_inline_media_items",
      safeJsonStringify(activeBodyInlineMediaItems.map(bodyInlineFormPayload)),
    );

    for (const item of activeBodyInlineMediaItems) {
      if (item.file) {
        form.append(
          `body_inline_media_file_${item.id}`,
          item.file,
          item.originalName,
        );
      }
    }

    form.append("body_block_order", safeJsonStringify(bodyPreviewOrder));

    if (standaloneBodyAudioFile) {
      form.append(
        "body_audio_file",
        standaloneBodyAudioFile,
        standaloneBodyAudioFile.name,
      );
    }

    if (standaloneBodyImageFile) {
      form.append(
        "body_image_file",
        standaloneBodyImageFile,
        standaloneBodyImageFile.name,
      );
    }

    form.append("cta_label", ctaLabel);
    form.append("cta_url", ctaUrl);

    form.append("store_badge_placement", storeBadgePlacement);
    form.append("google_play_enabled", googlePlayEnabled ? "true" : "false");
    form.append("google_play_url", googlePlayUrl);
    form.append("app_store_enabled", appStoreEnabled ? "true" : "false");
    form.append("app_store_url", appStoreUrl);

    form.append("footer_policy_id", footerPolicyId);
    form.append("footer_html", footerText);
    form.append("policy_links", safeJsonStringify(selectedPolicyLinks));

    form.append(
      "social_tiktok_enabled",
      socialTikTokEnabled ? "true" : "false",
    );
    form.append(
      "social_tiktok_username",
      cleanSocialUsername(socialTikTokUsername),
    );

    form.append(
      "social_twitter_enabled",
      socialTwitterEnabled ? "true" : "false",
    );
    form.append(
      "social_twitter_username",
      cleanSocialUsername(socialTwitterUsername),
    );

    form.append(
      "social_facebook_enabled",
      socialFacebookEnabled ? "true" : "false",
    );
    form.append(
      "social_facebook_username",
      cleanSocialUsername(socialFacebookUsername),
    );

    form.append(
      "file_modes",
      safeJsonStringify(files.map((picked) => picked.mode)),
    );

    form.append(
      "file_display_names",
      safeJsonStringify(
        files.map((picked, index) =>
          cleanDisplayFilename(
            picked.displayName,
            defaultAttachmentDisplayName(picked.file, index),
          ),
        ),
      ),
    );

    for (let i = 0; i < files.length; i += 1) {
      const picked = files[i];
      const displayName = cleanDisplayFilename(
        picked.displayName,
        defaultAttachmentDisplayName(picked.file, i),
      );

      form.append("files", picked.file, displayName);
    }

    return form;
  }
  function updateSendRowStatus(
    chunkEmails: string[],
    status: RecipientStatus,
    error = "",
  ) {
    setSendRows((prev) =>
      prev.map((row) =>
        chunkEmails.includes(row.email)
          ? {
              ...row,
              status,
              error: error || row.error,
            }
          : row,
      ),
    );

    setRecipients((prev) =>
      prev.map((row) =>
        chunkEmails.includes(row.email)
          ? {
              ...row,
              status,
              error: error || row.error,
            }
          : row,
      ),
    );
  }

  function updateSendResults(
    results: Array<Record<string, unknown>>,
    fallbackChunk: string[],
  ) {
    if (!Array.isArray(results) || results.length === 0) {
      updateSendRowStatus(fallbackChunk, "sent");
      return;
    }

    setSendRows((prev) =>
      prev.map((row) => {
        const result = results.find(
          (item) =>
            typeof item.email === "string" &&
            item.email.toLowerCase() === row.email,
        );

        if (!result) return row;

        const statusText =
          typeof result.status === "string" ? result.status : "sent";
        const error =
          typeof result.error === "string"
            ? result.error
            : typeof result.reason === "string"
              ? result.reason
              : "";

        const nextStatus: RecipientStatus =
          statusText === "failed"
            ? "failed"
            : statusText === "skipped"
              ? "skipped"
              : "sent";

        return {
          ...row,
          status: nextStatus,
          error,
        };
      }),
    );

    setRecipients((prev) =>
      prev.map((row) => {
        const result = results.find(
          (item) =>
            typeof item.email === "string" &&
            item.email.toLowerCase() === row.email,
        );

        if (!result) return row;

        const statusText =
          typeof result.status === "string" ? result.status : "sent";
        const error =
          typeof result.error === "string"
            ? result.error
            : typeof result.reason === "string"
              ? result.reason
              : "";

        const nextStatus: RecipientStatus =
          statusText === "failed"
            ? "failed"
            : statusText === "skipped"
              ? "skipped"
              : "sent";

        return {
          ...row,
          status: nextStatus,
          error,
        };
      }),
    );
  }

  function stopSendingAndSaveDraft() {
    stopSendRef.current = true;
    sendAbortRef.current?.abort();

    setSendRows((prev) =>
      prev.map((row) =>
        row.status === "queued" || row.status === "sending"
          ? {
              ...row,
              status: "draft",
              error: "Stopped and kept for draft/resume.",
            }
          : row,
      ),
    );

    setRecipients((prev) =>
      prev.map((row) =>
        row.status === "queued" || row.status === "sending"
          ? {
              ...row,
              status: "draft",
              error: "Stopped and kept for draft/resume.",
            }
          : row,
      ),
    );

    saveDraft();
    setSendComplete(true);
    setSending(false);
    setStatus(
      "Sending stopped. Remaining recipients were kept with the draft.",
    );
  }

  async function sendEmail() {
    if (isReadOnlyCampaign) {
      setStatus(
        "This sent campaign is read-only and cannot be sent again from this view.",
      );
      return;
    }

    if (sending) return;

    const merged = recipientInput.trim()
      ? mergeRecipientList(recipients, recipientInput)
      : {
          next: recipients,
          issues: [] as RecipientIssue[],
          candidatesAdded: 0,
        };

    if (merged.issues.length > 0) {
      setRecipients(merged.next);
      setRecipientIssues(merged.issues);
      setStatus("Fix duplicate or invalid recipient emails before sending.");
      return;
    }

    const finalRecipients = merged.next;

    setRecipients(finalRecipients);
    setRecipientInput("");
    setRecipientIssues([]);

    if (finalRecipients.length === 0) {
      setStatus("Add at least one recipient email.");
      return;
    }

    if (finalRecipients.length > MAX_RECIPIENTS) {
      setStatus(`Maximum ${MAX_RECIPIENTS} recipient emails allowed.`);
      return;
    }

    const activeInlineItems = getActiveBodyInlineMediaItems();

    if (activeInlineItems.length !== bodyInlineMediaItems.length) {
      setBodyInlineMediaItems(activeInlineItems);
    }

    setMessage((prev) =>
      normalizeLegacyBodyFileTokens(prev, activeInlineItems),
    );

    const uploadBlockReason = getSendUploadBlockReason();

if (uploadBlockReason) {
  console.warn("[MailConsole] Upload warning ignored:", uploadBlockReason);
}
    setSending(true);
    setStatus("");
    setSendComplete(false);
    setSendOverlayOpen(true);
    stopSendRef.current = false;

    const initialRows = finalRecipients.map((row) => ({
      ...row,
      status: "queued" as RecipientStatus,
      error: "",
    }));

    setSendRows(initialRows);
    setRecipients(initialRows);

    try {
      const emailList = finalRecipients.map((r) => r.email);

      for (let i = 0; i < emailList.length; i += SEND_BATCH_SIZE) {
        if (stopSendRef.current) break;

        const chunk = emailList.slice(i, i + SEND_BATCH_SIZE);
        const startedAt = Date.now();

        setActiveSendEmail(chunk[0] || "");
        updateSendRowStatus(chunk, "sending");

        const controller = new AbortController();
        sendAbortRef.current = controller;

        try {
          const res = await fetch("/api/mail-console/send", {
            method: "POST",
            body: buildEmailForm(chunk),
            signal: controller.signal,
          });

          const data = await readMailSendApiResponse(res);

          const results = Array.isArray(data?.summary?.results)
            ? data.summary.results
            : [];

          if (results.length > 0) {
            updateSendResults(results, chunk);
          } else if (!res.ok || !data.ok) {
            const error =
              data?.error ||
              data?.message ||
              "Email send failed for this batch. Please retry in a few minutes.";

            updateSendRowStatus(chunk, "failed", error);
          } else {
            updateSendRowStatus(chunk, "sent", "");
          }
        } catch (err) {
          if (stopSendRef.current) {
            updateSendRowStatus(chunk, "draft", "Stopped and kept for draft.");
            break;
          }

          const error =
            err instanceof Error
              ? err.message
              : "Email send failed for this batch. Please retry in a few minutes.";

          updateSendRowStatus(chunk, "failed", error);
        } finally {
          if (sendAbortRef.current === controller) {
            sendAbortRef.current = null;
          }
        }

        const elapsed = Date.now() - startedAt;
        const waitMs = RESEND_SAFE_WINDOW_MS - elapsed;
        const hasNextBatch = i + SEND_BATCH_SIZE < emailList.length;

        if (waitMs > 0 && hasNextBatch && !stopSendRef.current) {
          await delay(waitMs);
        }
      }

      if (!stopSendRef.current) {
        setSendComplete(true);

        setTimeout(() => {
          setStatus(
            "Sending finished. Check the delivery panel: sent emails are marked ✓, failed emails can be retried.",
          );
        }, 0);
      }
    } finally {
      sendAbortRef.current = null;
      setSending(false);
      setActiveSendEmail("");
    }
  }
  async function retryFailedEmails() {
    if (sending) return;

    const failedEmails = sendRows
      .filter((row) => row.status === "failed")
      .map((row) => row.email);

    if (failedEmails.length === 0) {
      setStatus("There are no failed emails to retry.");
      return;
    }

    setSending(true);
    setSendComplete(false);
    setStatus("");
    stopSendRef.current = false;

    try {
      for (let i = 0; i < failedEmails.length; i += SEND_BATCH_SIZE) {
        if (stopSendRef.current) break;

        const chunk = failedEmails.slice(i, i + SEND_BATCH_SIZE);
        const startedAt = Date.now();

        setActiveSendEmail(chunk[0] || "");
        updateSendRowStatus(chunk, "sending", "");

        const controller = new AbortController();
        sendAbortRef.current = controller;

        try {
          const res = await fetch("/api/mail-console/send", {
            method: "POST",
            body: buildEmailForm(chunk),
            signal: controller.signal,
          });

          const data = await readMailSendApiResponse(res);

          const results = Array.isArray(data?.summary?.results)
            ? data.summary.results
            : [];

          if (results.length > 0) {
            updateSendResults(results, chunk);
          } else if (!res.ok || !data.ok) {
            const error =
              data.error ||
              "Retry is not available right now because today’s email sending limit may have been reached. Please try again tomorrow.";
            updateSendRowStatus(chunk, "failed", error);
          } else {
            updateSendResults([], chunk);
          }
        } catch (err) {
          updateSendRowStatus(
            chunk,
            "failed",
            err instanceof Error ? err.message : "Retry failed.",
          );
        }

        const elapsed = Date.now() - startedAt;
        const waitMs = RESEND_SAFE_WINDOW_MS - elapsed;
        const hasNextBatch = i + SEND_BATCH_SIZE < failedEmails.length;
        if (waitMs > 0 && hasNextBatch && !stopSendRef.current) {
          await delay(waitMs);
        }
      }

      setSendComplete(true);
      setStatus("Failed email retry completed.");
    } finally {
      sendAbortRef.current = null;
      setSending(false);
      setActiveSendEmail("");
    }
  }

  function previewOnly() {
    setStatus("Preview updated.");
  }

  const defaultMailFooterHtml =
    "StayKnown — You are receiving this message from StayKnown. Please contact support if you received this in error.";

  const footerText =
    customFooter || selectedFooter?.footer_html || defaultMailFooterHtml;
  const hasAnyBanner = Boolean(bannerTopPreviewUrl || bannerBottomPreviewUrl);
  const topBannerPreview = bannerTopPreviewUrl || bannerBottomPreviewUrl;
  const bottomBannerPreview = bannerBottomPreviewUrl || bannerTopPreviewUrl;
  const googlePlayHref = googlePlayEnabled ? publicHttpLink(googlePlayUrl) : "";
  const appStoreHref = appStoreEnabled ? publicHttpLink(appStoreUrl) : "";
  const hasAnyStoreBadge = Boolean(googlePlayHref || appStoreHref);
  const hasConfiguredStoreBadge = googlePlayEnabled || appStoreEnabled;
  const socialPreviewLinks = [
    {
      platform: "tiktok" as SocialPlatform,
      enabled: socialTikTokEnabled,
      username: cleanSocialUsername(socialTikTokUsername),
      href: socialHref("tiktok", socialTikTokUsername),
      label: "TikTok",
      icon: "♪",
    },
    {
      platform: "twitter" as SocialPlatform,
      enabled: socialTwitterEnabled,
      username: cleanSocialUsername(socialTwitterUsername),
      href: socialHref("twitter", socialTwitterUsername),
      label: "Twitter",
      icon: "𝕏",
    },
    {
      platform: "facebook" as SocialPlatform,
      enabled: socialFacebookEnabled,
      username: cleanSocialUsername(socialFacebookUsername),
      href: socialHref("facebook", socialFacebookUsername),
      label: "Facebook",
      icon: "f",
    },
  ].filter((item) => item.enabled && item.username && item.href);

  const hasAnySocialLinks = socialPreviewLinks.length > 0;
  const messageHasBodyImageToken =
    message.includes(BODY_IMAGE_TOKEN) || /\{\{image:[^}]+\}\}/.test(message);

  const messageHasBodyAudioToken =
    message.includes(BODY_AUDIO_TOKEN) || /\{\{audio:[^}]+\}\}/.test(message);
  const enabledBodyBlocks = new Set<BodyBlockKind>(["message"]);

  if (bodyAudioFile || bodyAudioPreviewUrl) enabledBodyBlocks.add("audio");
  if (bodyImageFile || bodyImagePreviewUrl) enabledBodyBlocks.add("image");

  const bodyPreviewOrder = (() => {
    const baseOrder = bodyBlockOrder.filter((x) => enabledBodyBlocks.has(x));

    if (!baseOrder.includes("message")) {
      baseOrder.push("message");
    }

    const topBlocks: BodyBlockKind[] = [];
    const customBlocks: BodyBlockKind[] = [];
    const bottomBlocks: BodyBlockKind[] = [];

    for (const block of baseOrder) {
      if (block === "message") {
        customBlocks.push(block);
        continue;
      }

      const placement =
        block === "audio" ? bodyAudioPlacement : bodyImagePlacement;

      const shouldOnlyRenderInsideMessage =
        (block === "audio" && placement === "custom") ||
        (block === "image" && placement === "custom");

      if (shouldOnlyRenderInsideMessage) {
        continue;
      }

      if (placement === "top") {
        topBlocks.push(block);
      } else if (placement === "bottom") {
        bottomBlocks.push(block);
      }
    }

    return [...topBlocks, ...customBlocks, ...bottomBlocks];
  })();

  function renderStoreBadgesBlock(readOnly = false) {
    const allStores: Array<{
      key: "google" | "apple";
      enabled: boolean;
      href: string;
      icon: string;
      eyebrow: string;
      label: string;
      missingText: string;
    }> = [
      {
        key: "google",
        enabled: googlePlayEnabled,
        href: googlePlayHref,
        icon: "▶",
        eyebrow: "GET IT ON",
        label: "Google Play",
        missingText: "Google Play link missing",
      },
      {
        key: "apple",
        enabled: appStoreEnabled,
        href: appStoreHref,
        icon: "",
        eyebrow: "Download on the",
        label: "App Store",
        missingText: "App Store link missing",
      },
    ];

    const stores = allStores.filter((item) => item.enabled);

    if (stores.length === 0) return null;

    return (
      <div
        style={{
          ...storeBadgeWrapStyle,
          opacity: stores.some((item) => item.href) ? 1 : 0.62,
        }}
      >
        {stores.map((item) => {
          const badgeContent = (
            <>
              <span style={storeBadgeIconStyle}>{item.icon}</span>
              <span style={storeBadgeTextWrapStyle}>
                <span style={storeBadgeEyebrowStyle}>
                  {item.href ? item.eyebrow : "ADD LINK"}
                </span>
                <span style={storeBadgeLabelStyle}>
                  {item.href ? item.label : item.missingText}
                </span>
              </span>
            </>
          );

          if (!item.href) {
            return (
              <div
                key={item.key}
                title={item.missingText}
                style={{
                  ...storeBadgeStyle,
                  cursor: "not-allowed",
                  opacity: 0.62,
                }}
              >
                {badgeContent}
              </div>
            );
          }

          return (
            <a
              key={item.key}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              title={item.label}
              style={{
                ...storeBadgeStyle,
                pointerEvents: readOnly ? "auto" : "auto",
              }}
            >
              {badgeContent}
            </a>
          );
        })}
      </div>
    );
  }

  function renderSocialLinksBlock() {
    if (!hasAnySocialLinks) return null;

    return (
      <div style={previewSocialWrapStyle}>
        {socialPreviewLinks.map((item) => (
          <a
            key={item.platform}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            style={previewSocialLinkStyle}
            title={item.label}
          >
            <span style={previewSocialIconStyle}>{item.icon}</span>
            <span>@{item.username}</span>
          </a>
        ))}
      </div>
    );
  }

  function openReadOnlyPreview(email: string) {
    setReadOnlyPreviewEmail(email);
    setReadOnlyPreviewOpen(true);
  }

  function renderInlineBodyAudio() {
    if (!bodyAudioPreviewUrl) return null;

    return (
      <div style={embeddedMediaSlotStyle}>
        <a
          href={bodyAudioPreviewUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...previewAudioPlayerShellStyle,
            width: `${bodyAudioSize}%`,
          }}
        >
          <span style={previewAudioPlayButtonStyle}>▶</span>

          <span style={previewAudioContentStyle}>
            <span style={previewAudioTitleStyle}>
              {cleanDisplayFilename(bodyAudioDisplayName, "StayKnown Audio")}
            </span>

            <span style={previewAudioProgressTrackStyle}>
              <span style={previewAudioProgressFillStyle} />
            </span>

            <span style={previewAudioMetaStyle}>Audio message</span>
          </span>

          <span style={previewAudioListenTextStyle}>Tap to listen</span>
        </a>

        {bodyAudioHint ? (
          <div
            style={{
              ...previewMediaHintStyle,
              width: `${bodyAudioSize}%`,
              color: bodyAudioHintColor,
              fontStyle: bodyAudioHintFontStyle,
            }}
          >
            {bodyAudioHint}
          </div>
        ) : null}
      </div>
    );
  }

  function renderInlineBodyImage(readOnly = false) {
    if (!bodyImagePreviewUrl) return null;

    const frameStyle = getPreviewBodyImageFrameStyle(
      bodyImageShape,
      bodyImageSize,
    );

    const imageNode = (
      <img
        src={bodyImagePreviewUrl}
        alt={cleanDisplayFilename(bodyImageDisplayName, "StayKnown Image")}
        style={getPreviewBodyImageStyle(bodyImageShape)}
      />
    );

    return (
      <div style={embeddedMediaSlotStyle}>
        {readOnly ? (
          <a
            href={bodyImagePreviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              ...frameStyle,
              display: "block",
              textDecoration: "none",
            }}
          >
            {imageNode}
          </a>
        ) : (
          <div style={frameStyle}>{imageNode}</div>
        )}

        {bodyImageHint ? (
          <div
            style={{
              ...previewMediaHintStyle,
              width: `${bodyImageSize}%`,
              color: bodyImageHintColor,
              fontStyle: bodyImageHintFontStyle,
            }}
          >
            {bodyImageHint}
          </div>
        ) : null}
      </div>
    );
  }

  function renderInsertedBodyMediaItem(
    item: BodyInlineMediaItem,
    readOnly = false,
  ) {
    if (item.kind === "file") {
      const isImage = item.mimeType.startsWith("image/");

      if (isImage) {
        return (
          <div style={embeddedMediaSlotStyle}>
            <a
              href={item.previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                ...getPreviewBodyImageFrameStyle("rectangle", 100),
                display: "block",
                textDecoration: "none",
              }}
            >
              <img
                src={item.previewUrl}
                alt={cleanDisplayFilename(item.displayName, "StayKnown Image")}
                style={getPreviewBodyImageStyle("rectangle")}
              />
            </a>

            <div
              style={{
                ...previewMediaHintStyle,
                width: "100%",
                color: item.hintColor,
                fontStyle: item.hintFontStyle,
              }}
            >
              Tap image to open
            </div>
          </div>
        );
      }

      return (
        <div style={embeddedMediaSlotStyle}>
          <a
            href={item.previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              width: "100%",
              borderRadius: 22,
              padding: "14px 16px",
              background: "#ffffff",
              color: "#050505",
              textDecoration: "none",
              border: "1px solid rgba(0,0,0,0.10)",
              boxShadow: "0 16px 45px rgba(0,0,0,0.07)",
            }}
          >
            <span style={{ minWidth: 0 }}>
              <b
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 950,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {cleanDisplayFilename(item.displayName, "StayKnown File")}
              </b>

              <small
                style={{
                  display: "block",
                  marginTop: 4,
                  color: "rgba(0,0,0,0.55)",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                Tap to open or download
              </small>
            </span>

            <span
              style={{
                width: 38,
                height: 38,
                minWidth: 38,
                borderRadius: 999,
                background: "#050505",
                color: "white",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 950,
              }}
            >
              ↗
            </span>
          </a>
        </div>
      );
    }

    if (item.kind === "audio") {
      return (
        <div style={embeddedMediaSlotStyle}>
          <a
            href={item.previewUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              ...previewAudioPlayerShellStyle,
              width: `${item.size}%`,
            }}
          >
            <span style={previewAudioPlayButtonStyle}>▶</span>

            <span style={previewAudioContentStyle}>
              <span style={previewAudioTitleStyle}>
                {cleanDisplayFilename(item.displayName, "StayKnown Audio")}
              </span>

              <span style={previewAudioProgressTrackStyle}>
                <span style={previewAudioProgressFillStyle} />
              </span>

              <span style={previewAudioMetaStyle}>Audio message</span>
            </span>

            <span style={previewAudioListenTextStyle}>Tap to listen</span>
          </a>

          {item.hint ? (
            <div
              style={{
                ...previewMediaHintStyle,
                width: `${item.size}%`,
                color: item.hintColor,
                fontStyle: item.hintFontStyle,
              }}
            >
              {item.hint}
            </div>
          ) : null}
        </div>
      );
    }
    if (item.kind === "video") {
      const shape = item.imageShape || "rectangle";
      const frameStyle = getPreviewBodyImageFrameStyle(shape, item.size);

      return (
        <div style={embeddedMediaSlotStyle}>
          <div
            style={{
              ...frameStyle,
              background: "#000",
            }}
          >
            <video
              src={item.previewUrl}
              controls
              style={{
                display: "block",
                width: "100%",
                maxHeight: 340,
                background: "#000",
              }}
            />

            <a
              href={item.previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                padding: "9px 11px",
                background: "#ffffff",
                color: "#050505",
                fontSize: 12,
                fontWeight: 900,
                textAlign: "center",
                textDecoration: "none",
              }}
            >
              Tap to open video
            </a>
          </div>

          {item.hint ? (
            <div
              style={{
                ...previewMediaHintStyle,
                width: `${item.size}%`,
                color: item.hintColor,
                fontStyle: item.hintFontStyle,
              }}
            >
              {item.hint}
            </div>
          ) : null}
        </div>
      );
    }
    const shape = item.imageShape || "rectangle";
    const frameStyle = getPreviewBodyImageFrameStyle(shape, item.size);

    const imageNode = (
      <img
        src={item.previewUrl}
        alt={cleanDisplayFilename(item.displayName, "StayKnown Image")}
        style={getPreviewBodyImageStyle(shape)}
      />
    );

    return (
      <div style={embeddedMediaSlotStyle}>
        {readOnly ? (
          <a
            href={item.previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              ...frameStyle,
              display: "block",
              textDecoration: "none",
            }}
          >
            {imageNode}
          </a>
        ) : (
          <div style={frameStyle}>{imageNode}</div>
        )}

        {item.hint ? (
          <div
            style={{
              ...previewMediaHintStyle,
              width: `${item.size}%`,
              color: item.hintColor,
              fontStyle: item.hintFontStyle,
            }}
          >
            {item.hint}
          </div>
        ) : null}
      </div>
    );
  }

  function renderMessageTextWithInlineMedia(readOnly = false) {
    const content = message || "Your email body preview will appear here.";
    const parts = content.split(
      /(\{\{image:[^}]+\}\}|\{\{audio:[^}]+\}\}|\{\{video:[^}]+\}\}|\{\{file:[^}]+\}\}|\{\{image\}\}|\{\{audio\}\})/g,
    );

    return parts.map((part, index) => {
      const parsedToken = parseBodyInlineToken(part);

      if (parsedToken) {
        const item = bodyInlineMediaItems.find(
          (mediaItem) =>
            mediaItem.id === parsedToken.id &&
            mediaItem.kind === parsedToken.kind,
        );

        if (!item) {
          return (
            <span key={`missing-media-${index}`} style={{ color: "#b91c1c" }}>
              {part}
            </span>
          );
        }

        return (
          <div key={`message-media-${parsedToken.kind}-${parsedToken.id}`}>
            {renderInsertedBodyMediaItem(item, readOnly)}
          </div>
        );
      }

      if (part === BODY_IMAGE_TOKEN) {
        return (
          <div key={`message-image-${index}`}>
            {renderInlineBodyImage(readOnly)}
          </div>
        );
      }

      if (part === BODY_AUDIO_TOKEN) {
        return (
          <div key={`message-audio-${index}`}>{renderInlineBodyAudio()}</div>
        );
      }

      return <span key={`message-text-${index}`}>{part}</span>;
    });
  }

  function renderReadOnlyBodyBlock(block: BodyBlockKind) {
    if (block === "audio" && bodyAudioPreviewUrl) {
      return (
        <div key="readonly-audio" style={readOnlyBodyBlockStyle}>
          <a
            href={bodyAudioPreviewUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              ...previewAudioPlayerShellStyle,
              width: `${bodyAudioSize}%`,
            }}
          >
            <span style={previewAudioPlayButtonStyle}>▶</span>

            <span style={previewAudioContentStyle}>
              <span style={previewAudioTitleStyle}>
                {cleanDisplayFilename(bodyAudioDisplayName, "StayKnown Audio")}
              </span>

              <span style={previewAudioProgressTrackStyle}>
                <span style={previewAudioProgressFillStyle} />
              </span>

              <span style={previewAudioMetaStyle}>Audio message</span>
            </span>

            <span style={previewAudioListenTextStyle}>Tap to listen</span>
          </a>

          {bodyAudioHint ? (
            <div
              style={{
                ...previewMediaHintStyle,
                width: `${bodyAudioSize}%`,
                color: bodyAudioHintColor,
                fontStyle: bodyAudioHintFontStyle,
              }}
            >
              {bodyAudioHint}
            </div>
          ) : null}
        </div>
      );
    }
    if (block === "image" && bodyImagePreviewUrl) {
      return (
        <div key="readonly-image" style={readOnlyBodyBlockStyle}>
          <a
            href={bodyImagePreviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              ...getPreviewBodyImageFrameStyle(bodyImageShape, bodyImageSize),
              display: "block",
              textDecoration: "none",
            }}
          >
            <img
              src={bodyImagePreviewUrl}
              alt={cleanDisplayFilename(
                bodyImageDisplayName,
                "StayKnown Image",
              )}
              style={getPreviewBodyImageStyle(bodyImageShape)}
            />
          </a>

          {bodyImageHint ? (
            <div
              style={{
                ...previewMediaHintStyle,
                width: `${bodyImageSize}%`,
                color: bodyImageHintColor,
                fontStyle: bodyImageHintFontStyle,
              }}
            >
              {bodyImageHint}
            </div>
          ) : null}
        </div>
      );
    }
    return (
      <div key="readonly-message" style={readOnlyBodyBlockStyle}>
        <div style={previewMessageCardStyle}>
          <div style={previewMessageBodyStyle}>
            {renderMessageTextWithInlineMedia(true)}
          </div>
        </div>
      </div>
    );
  }

  function renderPreviewBodyBlock(block: BodyBlockKind) {
    if (block === "audio" && bodyAudioPreviewUrl) {
      return (
        <div
          key="audio"
          draggable
          onDragStart={() => setDraggingBodyBlock("audio")}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (draggingBodyBlock) moveBodyBlock(draggingBodyBlock, "audio");
            setDraggingBodyBlock(null);
          }}
          style={previewDraggableBlockStyle}
        >
          <a
            href={bodyAudioPreviewUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              ...previewAudioPlayerShellStyle,
              width: `${bodyAudioSize}%`,
            }}
          >
            <span style={previewAudioPlayButtonStyle}>▶</span>

            <span style={previewAudioContentStyle}>
              <span style={previewAudioTitleStyle}>
                {cleanDisplayFilename(bodyAudioDisplayName, "StayKnown Audio")}
              </span>

              <span style={previewAudioProgressTrackStyle}>
                <span style={previewAudioProgressFillStyle} />
              </span>

              <span style={previewAudioMetaStyle}>Audio message</span>
            </span>

            <span style={previewAudioListenTextStyle}>Tap to listen</span>
          </a>

          {bodyAudioHint ? (
            <div
              style={{
                ...previewMediaHintStyle,
                width: `${bodyAudioSize}%`,
                color: bodyAudioHintColor,
                fontStyle: bodyAudioHintFontStyle,
              }}
            >
              {bodyAudioHint}
            </div>
          ) : null}

          <div style={previewDragHintStyle}>Drag to reorder inside body</div>
        </div>
      );
    }
    if (block === "image" && bodyImagePreviewUrl) {
      return (
        <div
          key="image"
          draggable
          onDragStart={() => setDraggingBodyBlock("image")}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (draggingBodyBlock) moveBodyBlock(draggingBodyBlock, "image");
            setDraggingBodyBlock(null);
          }}
          style={previewDraggableBlockStyle}
        >
          <div
            style={getPreviewBodyImageFrameStyle(bodyImageShape, bodyImageSize)}
          >
            <img
              src={bodyImagePreviewUrl}
              alt={cleanDisplayFilename(
                bodyImageDisplayName,
                "StayKnown Image",
              )}
              style={getPreviewBodyImageStyle(bodyImageShape)}
            />
          </div>

          {bodyImageHint ? (
            <div
              style={{
                ...previewMediaHintStyle,
                width: `${bodyImageSize}%`,
                color: bodyImageHintColor,
                fontStyle: bodyImageHintFontStyle,
              }}
            >
              {bodyImageHint}
            </div>
          ) : null}

          <div style={previewDragHintStyle}>Drag to reorder inside body</div>
        </div>
      );
    }
    return (
      <div
        key="message"
        draggable
        onDragStart={() => setDraggingBodyBlock("message")}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => {
          if (draggingBodyBlock) moveBodyBlock(draggingBodyBlock, "message");
          setDraggingBodyBlock(null);
        }}
        style={previewDraggableBlockStyle}
      >
        <div style={previewMessageCardStyle}>
          <div style={previewMessageBodyStyle}>
            {renderMessageTextWithInlineMedia(false)}
          </div>
        </div>

        <div style={previewDragHintStyle}>Drag to reorder inside body</div>
      </div>
    );
  }

  return (
    <main
      className="sk-mail-composer"
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: 24,
        color: "#050505",
      }}
    >
      <style jsx global>{`
        .sk-mail-composer {
          font-family:
            Inter,
            "SF Pro Display",
            "SF Pro Text",
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Arial,
            sans-serif;
        }

        .sk-mail-composer button,
        .sk-mail-composer a,
        .sk-mail-composer input,
        .sk-mail-composer select,
        .sk-mail-composer textarea,
        .sk-mail-composer label[data-button="true"] {
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            border-color 180ms ease,
            background 180ms ease,
            opacity 180ms ease;
        }

        .sk-mail-composer button:hover,
        .sk-mail-composer a:hover,
        .sk-mail-composer label[data-button="true"]:hover {
          transform: translateY(-1px);
          box-shadow:
            inset 0 0 0 1px rgba(0, 0, 0, 0.12),
            0 18px 42px rgba(0, 0, 0, 0.14) !important;
        }

        .sk-mail-composer button:active,
        .sk-mail-composer a:active,
        .sk-mail-composer label[data-button="true"]:active {
          transform: translateY(0) scale(0.99);
        }

        .sk-mail-composer input:hover,
        .sk-mail-composer select:hover,
        .sk-mail-composer textarea:hover {
          border-color: rgba(0, 0, 0, 0.22) !important;
          box-shadow: 0 12px 34px rgba(0, 0, 0, 0.05);
        }

        .sk-mail-composer input:focus,
        .sk-mail-composer select:focus,
        .sk-mail-composer textarea:focus {
          border-color: rgba(0, 0, 0, 0.36) !important;
          box-shadow:
            0 0 0 4px rgba(0, 0, 0, 0.055),
            0 16px 42px rgba(0, 0, 0, 0.06);
        }

        .sk-mail-file-row {
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            border-color 180ms ease,
            background 180ms ease;
        }

        .sk-mail-file-row:hover {
          transform: translateY(-1px);
          border-color: rgba(0, 0, 0, 0.18) !important;
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.08);
          background: rgba(255, 255, 255, 0.96) !important;
        }

        .sk-recipient-chip-remove {
          opacity: 0;
          pointer-events: none;
        }

        .sk-recipient-chip:hover .sk-recipient-chip-remove {
          opacity: 1;
          pointer-events: auto;
        }

        .sk-mail-composer aside {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.22) transparent;
        }

        .sk-mail-composer aside::-webkit-scrollbar {
          width: 8px;
        }

        .sk-mail-composer aside::-webkit-scrollbar-track {
          background: transparent;
        }

        .sk-mail-composer aside::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.18);
          border-radius: 999px;
        }
      `}</style>

      <section style={{ maxWidth: 1180, margin: "0 auto" }}>
        <header
          style={{
            borderRadius: 30,
            background: "rgba(255,255,255,0.92)",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 24px 70px rgba(0,0,0,0.09)",
            padding: 24,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 18,
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={kickerStyle}>StayKnown Mail Console</div>
              <h1 style={h1Style}>
                {isOpenedDraft ? "Edit Draft" : "Compose Email"}
              </h1>

              <p style={subStyle}>
                Logged in as {adminEmail}
                {openedCampaignId ? (
                  <>
                    {" "}
                    · {isReadOnlyCampaign ? "Read-only" : "Draft"}{" "}
                    {openedCampaignStatus ? `· ${openedCampaignStatus}` : ""}
                  </>
                ) : null}
              </p>
            </div>

            <Link href="/mail-console" style={whitePillLinkStyle}>
              Back to Dashboard
            </Link>
          </div>
        </header>

        {openedCampaignId ? (
          <div
            style={{
              marginBottom: 18,
              padding: "12px 14px",
              borderRadius: 18,
              border: "1px solid rgba(0,0,0,0.08)",
              background: isReadOnlyCampaign
                ? "rgba(254,242,242,0.82)"
                : "rgba(239,246,255,0.86)",
              color: isReadOnlyCampaign ? "#991b1b" : "#1e3a8a",
              fontSize: 13,
              fontWeight: 850,
              lineHeight: 1.5,
            }}
          >
            {isReadOnlyCampaign
              ? "Read-only sent campaign. You can view this email, but Save Draft and Send Email are locked."
              : "Draft opened into composer. Re-select any device files if this draft used banner, body image, body audio, or attachments before sending."}
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.2fr) minmax(320px, 0.8fr)",
            gap: 18,
            alignItems: "start",
          }}
        >
          <section style={panelStyle}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Reusable template</label>
              <select
                value={templateId}
                onChange={(e) => applyTemplate(e.target.value)}
                style={inputStyle}
              >
                <option value="">Start without template</option>
                {allowedTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={sectionHeaderStyle}>Message setup</div>

            <div style={grid2Style}>
              <div>
                <label style={labelStyle}>Email mode</label>
                <select
                  value={mode}
                  onChange={(e) => changeMode(e.target.value as MailMode)}
                  style={inputStyle}
                >
                  <option value="support">Support / Direct Email</option>
                  <option value="newsletter">Newsletter</option>
                  <option value="advert">Advert / Announcement</option>
                  <option value="investor">Investor Update</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Sender address</label>
                <select
                  value={senderId}
                  onChange={(e) => setSenderId(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select sender</option>
                  {allowedSenders.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} — {s.from_email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={fieldStyle}>
              <div style={recipientHeaderRowStyle}>
                <label style={labelStyle}>Recipient email(s)</label>

                {recipients.length > 0 ? (
                  <div style={recipientBulkActionStyle}>
                    <label style={recipientMarkAllLabelStyle}>
                      <input
                        type="checkbox"
                        checked={allRecipientsMarked}
                        onChange={toggleMarkAllRecipients}
                      />
                      <span>Mark all</span>
                    </label>

                    <button
                      type="button"
                      onClick={clearMarkedRecipients}
                      disabled={selectedRecipientCount === 0}
                      style={{
                        ...recipientBulkButtonStyle,
                        opacity: selectedRecipientCount > 0 ? 1 : 0.5,
                        cursor:
                          selectedRecipientCount > 0
                            ? "pointer"
                            : "not-allowed",
                      }}
                    >
                      Clear selected
                    </button>

                    <button
                      type="button"
                      onClick={clearAllRecipients}
                      style={recipientBulkButtonStyle}
                    >
                      Clear all
                    </button>
                  </div>
                ) : null}
              </div>

              <div style={recipientBoxStyle}>
                {recipients.map((recipient) => {
                  const marked = selectedRecipientEmailSet.has(recipient.email);

                  return (
                    <div
                      key={recipient.id}
                      className="sk-recipient-chip"
                      onClick={() => startRecipientEdit(recipient.email)}
                      title="Click to edit email"
                      style={{
                        ...recipientChipStyle,
                        borderColor:
                          recipient.status === "failed"
                            ? "rgba(220,38,38,0.35)"
                            : recipient.status === "sent"
                              ? "rgba(22,163,74,0.34)"
                              : recipient.status === "sending"
                                ? "rgba(37,99,235,0.35)"
                                : "rgba(0,0,0,0.10)",
                        background:
                          recipient.status === "failed"
                            ? "rgba(254,226,226,0.86)"
                            : recipient.status === "sent"
                              ? "rgba(220,252,231,0.78)"
                              : recipient.status === "sending"
                                ? "rgba(219,234,254,0.82)"
                                : "white",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={marked}
                        onChange={() => toggleRecipientMarked(recipient.email)}
                        onClick={(e) => e.stopPropagation()}
                        style={recipientChipCheckboxStyle}
                        aria-label={`Mark ${recipient.email}`}
                      />
                      {editingRecipientEmail === recipient.email ? (
                        <input
                          value={editingRecipientValue}
                          autoFocus
                          onChange={(e) =>
                            setEditingRecipientValue(e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === "Tab") {
                              e.preventDefault();
                              commitRecipientEdit(recipient.email);
                            }

                            if (e.key === "Escape") {
                              e.preventDefault();
                              cancelRecipientEdit();
                            }
                          }}
                          onBlur={() => commitRecipientEdit(recipient.email)}
                          style={recipientEditInputStyle}
                        />
                      ) : (
                        <span style={recipientEmailTextStyle}>
                          {recipient.email}
                        </span>
                      )}

                      <span style={recipientStatusDotStyle}>
                        {recipient.status === "sent"
                          ? "✓"
                          : recipient.status === "failed"
                            ? "!"
                            : recipient.status === "sending"
                              ? "…"
                              : recipient.status === "skipped"
                                ? "↷"
                                : recipient.status === "draft"
                                  ? "D"
                                  : ""}
                      </span>

                      <button
                        type="button"
                        className="sk-recipient-chip-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecipient(recipient.email);
                        }}
                        style={recipientRemoveStyle}
                        aria-label={`Remove ${recipient.email}`}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}

                <input
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  onKeyDown={handleRecipientKeyDown}
                  onPaste={handleRecipientPaste}
                  onBlur={commitRecipientInput}
                  placeholder={
                    recipients.length === 0
                      ? "Paste emails, then press Enter or comma"
                      : "Add another email"
                  }
                  style={recipientInputStyle}
                />
              </div>

              <div style={recipientHelpStyle}>
                {recipients.length}/{MAX_RECIPIENTS} recipients · comma, Enter,
                semicolon, Tab and paste are supported.
              </div>

              {recipientIssues.length > 0 ? (
                <div style={recipientIssueBoxStyle}>
                  {recipientIssues.map((issue, index) => (
                    <div key={`${issue.value}-${index}`} style={issueRowStyle}>
                      <b>{issue.value}</b>
                      <span>{issue.reason}</span>

                      {issue.suggestion ? (
                        <button
                          type="button"
                          onClick={() => applyRecipientSuggestion(issue)}
                          style={issueSuggestionButtonStyle}
                        >
                          Use {issue.suggestion}
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Subject</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                style={inputStyle}
              />
            </div>

            <div style={grid3Style}>
              <div>
                <label style={labelStyle}>Header title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Badge</label>
                <input
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Subtitle</label>
                <input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Optional"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Message body</label>
              <textarea
                ref={messageTextareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Write the main email message here...

Tap inside this box where you want media, then use:
${BODY_IMAGE_TOKEN} for body image
${BODY_AUDIO_TOKEN} for body audio`}
                style={{ ...inputStyle, minHeight: 240, resize: "vertical" }}
              />

              <div style={tokenButtonRowStyle}>
                <button
                  type="button"
                  onClick={() => insertCurrentBodyMedia("image")}
                  disabled={!bodyImagePreviewUrl}
                  style={{
                    ...tinyUtilityButtonStyle,
                    opacity: bodyImagePreviewUrl ? 1 : 0.5,
                    cursor: bodyImagePreviewUrl ? "pointer" : "not-allowed",
                  }}
                >
                  Insert image here
                </button>

                <button
                  type="button"
                  onClick={() => insertCurrentBodyMedia("audio")}
                  disabled={!bodyAudioPreviewUrl}
                  style={{
                    ...tinyUtilityButtonStyle,
                    opacity: bodyAudioPreviewUrl ? 1 : 0.5,
                    cursor: bodyAudioPreviewUrl ? "pointer" : "not-allowed",
                  }}
                >
                  Insert audio here
                </button>
              </div>

              <div style={helpTextStyle}>
                Put your cursor inside the message, then insert image/audio. The
                marker will render in that exact position in preview and in the
                delivered email after the send route is patched.
              </div>

              {bodyImageFile &&
              bodyImagePlacement === "custom" &&
              !messageHasBodyImageToken ? (
                <div style={storeWarningStyle}>
                  Body image/video is selected, but it will not show until you
                  place your cursor in the message and click “Insert image/video
                  here”.
                </div>
              ) : null}

              {bodyAudioFile &&
              bodyAudioPlacement === "custom" &&
              !messageHasBodyAudioToken ? (
                <div style={storeWarningStyle}>
                  Body audio is selected, but it will not show until you place
                  your cursor in the message and click “Insert audio here”.
                </div>
              ) : null}
            </div>

            <div style={sectionHeaderStyle}>Banner image</div>

            <div style={grid2Style}>
              <div>
                <label style={labelStyle}>Banner position</label>
                <select
                  value={imagePosition}
                  onChange={(e) =>
                    setImagePosition(e.target.value as ImagePosition)
                  }
                  style={inputStyle}
                >
                  <option value="none">No banner image</option>
                  <option value="top">Before message</option>
                  <option value="bottom">After message</option>
                  <option value="both">Before and after</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Top banner image</label>
                <div style={bannerPickerStyle}>
                  <label data-button="true" style={filePickButtonStyle}>
                    Choose image
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        pickBannerFile(e.target.files?.[0] || null, "top");
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>

                  {bannerTopFile ? (
                    <button
                      type="button"
                      onClick={() => clearBanner("top")}
                      style={smallButtonStyle}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>

                {bannerTopFile ? (
                  <div style={bannerFileNameStyle}>{bannerTopFile.name}</div>
                ) : null}

                <div style={compactSliderRowStyle}>
                  <span>Banner height</span>
                  <input
                    type="range"
                    min={64}
                    max={150}
                    value={bannerHeight}
                    onChange={(e) => setBannerHeight(Number(e.target.value))}
                    style={rangeStyle}
                  />
                  <b>{bannerHeight}px</b>
                </div>
              </div>
            </div>

            {imagePosition === "both" || imagePosition === "bottom" ? (
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  {imagePosition === "both"
                    ? "Second / bottom banner image"
                    : "Bottom banner image"}
                </label>

                <div style={bannerPickerStyle}>
                  <label data-button="true" style={filePickButtonStyle}>
                    Choose image
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        pickBannerFile(e.target.files?.[0] || null, "bottom");
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>

                  {bannerBottomFile ? (
                    <button
                      type="button"
                      onClick={() => clearBanner("bottom")}
                      style={smallButtonStyle}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>

                {bannerBottomFile ? (
                  <div style={bannerFileNameStyle}>{bannerBottomFile.name}</div>
                ) : imagePosition === "both" && bannerTopFile ? (
                  <div style={bannerFileNameStyle}>
                    No second image selected. Top banner will repeat at the
                    bottom.
                  </div>
                ) : null}
              </div>
            ) : null}

            <div style={sectionHeaderStyle}>Inside message body</div>

            <div style={grid2Style}>
              <div style={compactMediaPanelStyle}>
                <div style={compactPanelTitleStyle}>Audio inside body</div>

                <div style={compactGridStyle}>
                  <div>
                    <label style={labelStyle}>Placement</label>
                    <select
                      value={bodyAudioPlacement}
                      onChange={(e) =>
                        setBodyAudioPlacement(
                          e.target.value as BodyMediaPlacement,
                        )
                      }
                      style={inputStyle}
                    >
                      <option value="custom">Default / drag in preview</option>
                      <option value="top">Beginning of body</option>
                      <option value="bottom">End of body</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Size</label>
                    <input
                      type="range"
                      min={32}
                      max={100}
                      value={bodyAudioSize}
                      onChange={(e) => setBodyAudioSize(Number(e.target.value))}
                      style={rangeStyle}
                    />
                  </div>
                </div>

                <div style={bannerPickerStyle}>
                  <label data-button="true" style={filePickButtonStyle}>
                    Choose audio
                    <input
                      type="file"
                      accept="audio/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        pickBodyAudioFile(e.target.files?.[0] || null);
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>

                  {bodyAudioFile ? (
                    <button
                      type="button"
                      onClick={clearBodyAudio}
                      style={smallButtonStyle}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>

                {bodyAudioFile ? (
                  <div style={bannerFileNameStyle}>{bodyAudioFile.name}</div>
                ) : null}

                <div style={{ marginTop: 10 }}>
                  <label style={labelStyle}>Audio display name</label>
                  <input
                    value={bodyAudioDisplayName}
                    onChange={(e) => setBodyAudioDisplayName(e.target.value)}
                    placeholder="StayKnown Audio"
                    style={inputStyle}
                  />
                </div>

                <div style={tokenButtonRowStyle}>
                  <button
                    type="button"
                    onClick={() => insertCurrentBodyMedia("audio")}
                    disabled={!bodyAudioPreviewUrl}
                    style={{
                      ...tinyUtilityButtonStyle,
                      opacity: bodyAudioPreviewUrl ? 1 : 0.5,
                      cursor: bodyAudioPreviewUrl ? "pointer" : "not-allowed",
                    }}
                  >
                    Insert audio in message
                  </button>
                </div>

                <div style={{ marginTop: 10 }}>
                  <label style={labelStyle}>Tiny hint under audio</label>
                  <input
                    value={bodyAudioHint}
                    onChange={(e) => setBodyAudioHint(e.target.value)}
                    placeholder="Example: Listen to this short StayKnown update."
                    style={inputStyle}
                  />

                  <div style={hintControlGridStyle}>
                    <label style={hintControlStyle}>
                      <span>Hint colour</span>
                      <input
                        type="color"
                        value={bodyAudioHintColor}
                        onChange={(e) => setBodyAudioHintColor(e.target.value)}
                        style={colorInputStyle}
                      />
                    </label>

                    <label style={hintControlStyle}>
                      <span>Text style</span>
                      <select
                        value={bodyAudioHintFontStyle}
                        onChange={(e) =>
                          setBodyAudioHintFontStyle(
                            e.target.value as BodyHintFontStyle,
                          )
                        }
                        style={hintSelectStyle}
                      >
                        <option value="normal">Normal</option>
                        <option value="italic">Italic</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>

              <div style={compactMediaPanelStyle}>
                <div style={compactPanelTitleStyle}>Image inside body</div>

                <div style={compactGridStyle}>
                  <div>
                    <label style={labelStyle}>Placement</label>
                    <select
                      value={bodyImagePlacement}
                      onChange={(e) =>
                        setBodyImagePlacement(
                          e.target.value as BodyMediaPlacement,
                        )
                      }
                      style={inputStyle}
                    >
                      <option value="custom">Default / drag in preview</option>
                      <option value="top">Beginning of body</option>
                      <option value="bottom">End of body</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Image style</label>
                    <select
                      value={bodyImageShape}
                      onChange={(e) =>
                        setBodyImageShape(e.target.value as BodyImageShape)
                      }
                      style={inputStyle}
                    >
                      <option value="rectangle">Rectangle</option>
                      <option value="banner">Banner</option>
                      <option value="pill">Pill rectangle</option>
                      <option value="square">Square</option>
                      <option value="circle">Circle</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Size</label>
                    <input
                      type="range"
                      min={32}
                      max={100}
                      value={bodyImageSize}
                      onChange={(e) => setBodyImageSize(Number(e.target.value))}
                      style={rangeStyle}
                    />
                  </div>
                </div>

                <div style={bannerPickerStyle}>
                  <label data-button="true" style={filePickButtonStyle}>
                    Choose image/video
                    <input
                      type="file"
                      accept="image/*,video/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        pickBodyImageFile(e.target.files?.[0] || null);
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>

                  {bodyImageFile ? (
                    <button
                      type="button"
                      onClick={clearBodyImage}
                      style={smallButtonStyle}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>

                {bodyImageFile ? (
                  <div style={bannerFileNameStyle}>{bodyImageFile.name}</div>
                ) : null}

                <div style={{ marginTop: 10 }}>
                  <label style={labelStyle}>Image / video display name</label>
                  <input
                    value={bodyImageDisplayName}
                    onChange={(e) => setBodyImageDisplayName(e.target.value)}
                    placeholder="StayKnown Image or Video"
                    style={inputStyle}
                  />
                </div>

                <div style={tokenButtonRowStyle}>
                  <button
                    type="button"
                    onClick={() => insertCurrentBodyMedia("image")}
                    disabled={!bodyImagePreviewUrl}
                    style={{
                      ...tinyUtilityButtonStyle,
                      opacity: bodyImagePreviewUrl ? 1 : 0.5,
                      cursor: bodyImagePreviewUrl ? "pointer" : "not-allowed",
                    }}
                  >
                    Insert image/video in message
                  </button>
                </div>

                <div style={{ marginTop: 10 }}>
                  <label style={labelStyle}>Tiny hint under image</label>
                  <input
                    value={bodyImageHint}
                    onChange={(e) => setBodyImageHint(e.target.value)}
                    placeholder="Example: See how StayKnown protects real people."
                    style={inputStyle}
                  />

                  <div style={hintControlGridStyle}>
                    <label style={hintControlStyle}>
                      <span>Hint colour</span>
                      <input
                        type="color"
                        value={bodyImageHintColor}
                        onChange={(e) => setBodyImageHintColor(e.target.value)}
                        style={colorInputStyle}
                      />
                    </label>

                    <label style={hintControlStyle}>
                      <span>Text style</span>
                      <select
                        value={bodyImageHintFontStyle}
                        onChange={(e) =>
                          setBodyImageHintFontStyle(
                            e.target.value as BodyHintFontStyle,
                          )
                        }
                        style={hintSelectStyle}
                      >
                        <option value="normal">Normal</option>
                        <option value="italic">Italic</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div style={sectionHeaderStyle}>App store badges</div>

            <div style={compactMediaPanelStyle}>
              <div style={compactPanelTitleStyle}>
                Store buttons inside body
              </div>

              <div style={grid2Style}>
                <label style={storeToggleCardStyle}>
                  <input
                    type="checkbox"
                    checked={googlePlayEnabled}
                    onChange={(e) => setGooglePlayEnabled(e.target.checked)}
                  />
                  <span>
                    <b>Add Google Play badge</b>
                    <small>Shows a Google Play button in the email body.</small>
                  </span>
                </label>

                <label style={storeToggleCardStyle}>
                  <input
                    type="checkbox"
                    checked={appStoreEnabled}
                    onChange={(e) => setAppStoreEnabled(e.target.checked)}
                  />
                  <span>
                    <b>Add App Store badge</b>
                    <small>
                      Shows an Apple App Store button in the email body.
                    </small>
                  </span>
                </label>
              </div>

              <div style={{ ...grid2Style, marginTop: 10 }}>
                <div>
                  <label style={labelStyle}>Google Play app link</label>
                  <input
                    value={googlePlayUrl}
                    onChange={(e) => setGooglePlayUrl(e.target.value)}
                    placeholder="https://play.google.com/store/apps/details?id=..."
                    disabled={!googlePlayEnabled}
                    style={{
                      ...inputStyle,
                      opacity: googlePlayEnabled ? 1 : 0.55,
                    }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Apple App Store app link</label>
                  <input
                    value={appStoreUrl}
                    onChange={(e) => setAppStoreUrl(e.target.value)}
                    placeholder="https://apps.apple.com/app/..."
                    disabled={!appStoreEnabled}
                    style={{
                      ...inputStyle,
                      opacity: appStoreEnabled ? 1 : 0.55,
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <label style={labelStyle}>Badge position</label>
                <select
                  value={storeBadgePlacement}
                  onChange={(e) =>
                    setStoreBadgePlacement(
                      e.target.value as StoreBadgePlacement,
                    )
                  }
                  style={inputStyle}
                >
                  <option value="top">Top of message body</option>
                  <option value="bottom">End of message body</option>
                </select>
              </div>

              {hasConfiguredStoreBadge && !hasAnyStoreBadge ? (
                <div style={storeWarningStyle}>
                  Add a valid http:// or https:// store link before sending, or
                  the badge will only show as a disabled placeholder in preview.
                </div>
              ) : null}
            </div>

            <div style={sectionHeaderStyle}>CTA button</div>

            <div style={grid2Style}>
              <div>
                <label style={labelStyle}>CTA button label</label>
                <input
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                  placeholder="Learn More"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>CTA URL</label>
                <input
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  placeholder="https://..."
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={sectionHeaderStyle}>Footer policy</div>

            <div style={grid2Style}>
              <div>
                <label style={labelStyle}>Footer policy</label>
                <select
                  value={footerPolicyId}
                  onChange={(e) => {
                    setFooterPolicyId(e.target.value);
                    setCustomFooter("");
                  }}
                  style={{ ...inputStyle, textAlign: "center" }}
                >
                  <option value="">Select footer policy</option>
                  {allowedFooters.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                      {f.is_default ? " — default" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Reply behavior</label>
                <input
                  value={
                    mode === "newsletter" || mode === "advert"
                      ? "No-reply / newsletter style"
                      : "Reply enabled"
                  }
                  readOnly
                  style={{ ...inputStyle, opacity: 0.76 }}
                />
              </div>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Editable footer text</label>
              <textarea
                value={customFooter || selectedFooter?.footer_html || ""}
                onChange={(e) => setCustomFooter(e.target.value)}
                placeholder="Select a footer policy or write custom footer text..."
                style={{
                  ...inputStyle,
                  minHeight: 120,
                  resize: "vertical",
                  textAlign: "center",
                  lineHeight: 1.65,
                }}
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Clickable policy links</label>

              <div style={policyBoxStyle}>
                {currentPolicyLinkOptions.map((item) => {
                  const active = selectedPolicyLinks.includes(item.key);

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => togglePolicyLink(item.key)}
                      style={{
                        border: 0,
                        borderRadius: 999,
                        padding: "9px 11px",
                        background: active ? "#050505" : "white",
                        color: active ? "white" : "#050505",
                        fontSize: 12,
                        fontWeight: 900,
                        cursor: "pointer",
                        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.10)",
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div style={helpTextStyle}>
                Selected links will appear centered and clickable in the
                delivered email footer.
              </div>

              <div style={{ ...compactMediaPanelStyle, marginTop: 12 }}>
                <div style={compactPanelTitleStyle}>Social media links</div>

                <div style={grid3Style}>
                  <label style={storeToggleCardStyle}>
                    <input
                      type="checkbox"
                      checked={socialTikTokEnabled}
                      onChange={(e) => setSocialTikTokEnabled(e.target.checked)}
                    />
                    <span>
                      <b>TikTok</b>
                      <small>Show TikTok under policy links.</small>
                    </span>
                  </label>

                  <label style={storeToggleCardStyle}>
                    <input
                      type="checkbox"
                      checked={socialTwitterEnabled}
                      onChange={(e) =>
                        setSocialTwitterEnabled(e.target.checked)
                      }
                    />
                    <span>
                      <b>Twitter</b>
                      <small>Show Twitter under policy links.</small>
                    </span>
                  </label>

                  <label style={storeToggleCardStyle}>
                    <input
                      type="checkbox"
                      checked={socialFacebookEnabled}
                      onChange={(e) =>
                        setSocialFacebookEnabled(e.target.checked)
                      }
                    />
                    <span>
                      <b>Facebook</b>
                      <small>Show Facebook under policy links.</small>
                    </span>
                  </label>
                </div>

                <div style={{ ...grid3Style, marginTop: 10 }}>
                  <div>
                    <label style={labelStyle}>TikTok username only</label>
                    <input
                      value={socialTikTokUsername}
                      onChange={(e) => setSocialTikTokUsername(e.target.value)}
                      onBlur={() =>
                        setSocialTikTokUsername(
                          cleanSocialUsername(socialTikTokUsername),
                        )
                      }
                      disabled={!socialTikTokEnabled}
                      placeholder="example: stayknown"
                      style={{
                        ...inputStyle,
                        opacity: socialTikTokEnabled ? 1 : 0.55,
                      }}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Twitter username only</label>
                    <input
                      value={socialTwitterUsername}
                      onChange={(e) => setSocialTwitterUsername(e.target.value)}
                      onBlur={() =>
                        setSocialTwitterUsername(
                          cleanSocialUsername(socialTwitterUsername),
                        )
                      }
                      disabled={!socialTwitterEnabled}
                      placeholder="example: stayknown"
                      style={{
                        ...inputStyle,
                        opacity: socialTwitterEnabled ? 1 : 0.55,
                      }}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Facebook username only</label>
                    <input
                      value={socialFacebookUsername}
                      onChange={(e) =>
                        setSocialFacebookUsername(e.target.value)
                      }
                      onBlur={() =>
                        setSocialFacebookUsername(
                          cleanSocialUsername(socialFacebookUsername),
                        )
                      }
                      disabled={!socialFacebookEnabled}
                      placeholder="example: stayknown"
                      style={{
                        ...inputStyle,
                        opacity: socialFacebookEnabled ? 1 : 0.55,
                      }}
                    />
                  </div>
                </div>

                <div style={helpTextStyle}>
                  Only active toggles with a username will appear in the
                  delivered email.
                </div>
              </div>
            </div>

            <div style={sectionHeaderStyle}>Attachments</div>

            <div style={uploadBoxStyle}>
              <input
                type="file"
                multiple
                onChange={handleFiles}
                accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip"
              />

              <div style={helpTextStyle}>
                Attachments are separate from banner images. Use this for files,
                documents, videos, PDFs, or extra inline images.
              </div>
            </div>

            {files.length > 0 ? (
              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                {files.map((picked) => {
                  const isImage = picked.file.type.startsWith("image/");
                  const hasAnotherSpecialFile = files.some(
                    (item) => item.id !== picked.id && item.mode !== "attach",
                  );

                  return (
                    <div
                      key={picked.id}
                      className="sk-mail-file-row"
                      style={fileRowStyle}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 900,
                            wordBreak: "break-word",
                          }}
                        >
                          {picked.displayName || "StayKnown File"}
                        </div>

                        <div style={fileMetaStyle}>
                          Original: {picked.file.name} ·{" "}
                          {picked.file.type || "unknown type"} ·{" "}
                          {niceFileSize(picked.file.size)}
                        </div>

                        <input
                          value={picked.displayName}
                          onChange={(e) =>
                            updateFileDisplayName(picked.id, e.target.value)
                          }
                          placeholder="Display name shown to recipient"
                          style={{
                            ...inputStyle,
                            marginTop: 8,
                            padding: "9px 11px",
                            fontSize: 12,
                          }}
                        />
                      </div>

                      <select
                        value={picked.mode}
                        onChange={(e) =>
                          updateFileMode(
                            picked.id,
                            e.target.value as AttachmentMode,
                          )
                        }
                        style={{
                          ...inputStyle,
                          width: 170,
                          padding: "10px 12px",
                        }}
                      >
                        <option value="attach">Attach at end</option>
                        <option
                          value="link_only"
                          disabled={hasAnotherSpecialFile}
                        >
                          Link only
                        </option>
                        <option
                          value="inline_image"
                          disabled={!isImage || hasAnotherSpecialFile}
                        >
                          Inline image
                        </option>
                      </select>
                      <button
                        type="button"
                        onClick={() => insertAttachmentInsideMessage(picked)}
                        style={smallButtonStyle}
                      >
                        Insert in message
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFile(picked.id)}
                        style={smallButtonStyle}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}

                <div style={helpTextStyle}>
                  All uploaded files are normal attachments by default. Only one
                  file can be changed to inline image or link-only. This
                  prevents many screenshots from appearing inside the email
                  body.
                </div>
              </div>
            ) : null}
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 22,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={previewOnly}
                style={secondaryButtonStyle}
              >
                Preview Setup
              </button>

              {isOpenedDraft ? (
                <Link href="/mail-console/send" style={secondaryButtonStyle}>
                  Compose New
                </Link>
              ) : null}

              <button
                type="button"
                onClick={saveDraft}
                disabled={savingDraft || composerActionDisabled}
                style={{
                  ...secondaryButtonStyle,
                  opacity: savingDraft || composerActionDisabled ? 0.58 : 1,
                  cursor:
                    savingDraft || composerActionDisabled
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {savingDraft ? "Saving..." : "Save Draft"}
              </button>

              <button
                type="button"
                onClick={sendEmail}
                disabled={composerActionDisabled}
                style={{
                  ...primaryButtonStyle,
                  opacity: composerActionDisabled ? 0.58 : 1,
                  cursor: composerActionDisabled ? "not-allowed" : "pointer",
                }}
              >
                {openingCampaign
                  ? "Opening..."
                  : sending
                    ? "Sending..."
                    : isReadOnlyCampaign
                      ? "Read Only"
                      : isOpenedDraft
                        ? "Send Draft"
                        : "Send Email"}
              </button>
            </div>

            {status ? <div style={statusStyle}>{status}</div> : null}
          </section>

          <aside style={previewPanelStickyStyle}>
            <div style={sectionHeaderStyle}>Live summary</div>

            <div style={summaryRowStyle}>
              <span>Mode</span>
              <b>{modeLabel(mode)}</b>
            </div>

            <div style={summaryRowStyle}>
              <span>Sender</span>
              <b>
                {selectedSender ? selectedSender.from_email : "Not selected"}
              </b>
            </div>

            <div style={summaryRowStyle}>
              <span>Reply-to</span>
              <b>{selectedSender?.reply_to_email || "—"}</b>
            </div>

            <div style={summaryRowStyle}>
              <span>Recipients</span>
              <b>{recipients.length}</b>
            </div>

            <div style={summaryRowStyle}>
              <span>Brand logo</span>
              <b>Inline automatic</b>
            </div>

            <div style={summaryRowStyle}>
              <span>Banner</span>
              <b>{hasAnyBanner ? imagePosition : "None"}</b>
            </div>

            <div style={summaryRowStyle}>
              <span>CTA</span>
              <b>{ctaLabel && ctaUrl ? "Yes" : "No"}</b>
            </div>

            <div style={summaryRowStyle}>
              <span>Store badges</span>
              <b>{hasAnyStoreBadge ? storeBadgePlacement : "None"}</b>
            </div>

            <div style={summaryRowStyle}>
              <span>Files</span>
              <b>{files.length}</b>
            </div>

            <div style={summaryRowStyle}>
              <span>Files</span>
              <b>{files.length}</b>
            </div>

            <div style={{ height: 16 }} />

            <div style={previewOuterStyle}>
              <div style={{ textAlign: "center", marginBottom: 10 }}>
                <div style={previewBrandTextStyle}>{selectedBrandName}™</div>
                <div style={{ height: 6 }} />
                <div style={previewServiceTextStyle}>
                  A 6 Clement Joshua service™
                </div>
                <div style={{ height: 10 }} />

                {logoFailed ? (
                  <div style={logoFallbackStyle}>6</div>
                ) : (
                  <img
                    src={brandLogoUrl}
                    alt="StayKnown"
                    width={64}
                    height={64}
                    onError={() => setLogoFailed(true)}
                    style={{
                      display: "inline-block",
                      width: 64,
                      height: 64,
                      borderRadius: 18,
                      boxShadow: "0 14px 38px rgba(0,0,0,0.14)",
                      background: "white",
                    }}
                  />
                )}

                <div style={{ height: 14 }} />

                <div style={previewTitleStyle}>{title || "Header title"}</div>

                {badge ? (
                  <div style={{ marginTop: 10 }}>
                    <span style={previewBadgeStyle}>{badge}</span>
                  </div>
                ) : null}

                {subtitle ? (
                  <div style={previewSubtitleStyle}>{subtitle}</div>
                ) : null}
              </div>

              {topBannerPreview &&
              (imagePosition === "top" || imagePosition === "both") ? (
                <div style={previewBannerWrapStyle}>
                  <img
                    src={topBannerPreview}
                    alt="Top banner"
                    style={{
                      ...previewBannerImageStyle,
                      height: bannerHeight,
                      maxHeight: bannerHeight,
                    }}
                  />
                </div>
              ) : null}

              {storeBadgePlacement === "top" ? renderStoreBadgesBlock() : null}

              <div style={previewBodyStackStyle}>
                {bodyPreviewOrder.map((block) => renderPreviewBodyBlock(block))}
              </div>

              {storeBadgePlacement === "bottom"
                ? renderStoreBadgesBlock()
                : null}

              {bottomBannerPreview &&
              imagePosition !== "none" &&
              (imagePosition === "bottom" || imagePosition === "both") ? (
                <div style={previewBannerWrapStyle}>
                  <img
                    src={bottomBannerPreview}
                    alt="Bottom banner"
                    style={{
                      ...previewBannerImageStyle,
                      height: bannerHeight,
                      maxHeight: bannerHeight,
                    }}
                  />
                </div>
              ) : null}

              {ctaLabel && ctaUrl ? (
                <div style={{ textAlign: "center", marginTop: 18 }}>
                  <span style={previewCtaStyle}>{ctaLabel}</span>
                </div>
              ) : null}

              {footerText ? (
                <div style={previewFooterStyle}>{footerText}</div>
              ) : null}

              {selectedPolicyLinks.length > 0 ? (
                <div style={previewPolicyLinksStyle}>
                  {selectedPolicyLinks.map((key) => {
                    const item = POLICY_LINK_OPTIONS.find((x) => x.key === key);
                    if (!item) return null;

                    return (
                      <a
                        key={key}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={previewPolicyLinkStyle}
                      >
                        {item.label}
                      </a>
                    );
                  })}
                </div>
              ) : null}
              {renderSocialLinksBlock()}
              <div style={previewLegalStyle}>
                © {new Date().getFullYear()} {selectedBrandName}™ · A 6 Clement
                Joshua service™
              </div>
            </div>
          </aside>
        </div>
      </section>

      {sendOverlayOpen ? (
        <div style={sendOverlayStyle}>
          <div style={sendModalStyle}>
            <div style={sendModalHeaderStyle}>
              <div>
                <div style={kickerStyle}>{sendOverlayKicker}</div>
                <h2 style={sendTitleStyle}>{sendOverlayTitle}</h2>
                <p style={sendSubStyle}>{sendOverlayDescription}</p>
              </div>

              {sendComplete ? (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {sendSummary.failed > 0 ? (
                    <button
                      type="button"
                      onClick={retryFailedEmails}
                      style={dangerButtonStyle}
                    >
                      ↻ Retry failed
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setSendOverlayOpen(false)}
                    style={secondaryButtonStyle}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={stopSendingAndSaveDraft}
                  style={dangerButtonStyle}
                >
                  {stopSendButtonLabel}
                </button>
              )}
            </div>

            <div style={sendStatsGridStyle}>
              <div style={sendStatStyle}>
                <span>Total</span>
                <b>{sendSummary.total}</b>
              </div>
              <div style={sendStatStyle}>
                <span>Sent</span>
                <b>{sendSummary.sent}</b>
              </div>
              <div style={sendStatStyle}>
                <span>Failed</span>
                <b>{sendSummary.failed}</b>
              </div>
              <div style={sendStatStyle}>
                <span>Skipped</span>
                <b>{sendSummary.skipped}</b>
              </div>
              <div style={sendStatStyle}>
                <span>Draft</span>
                <b>{sendSummary.draft}</b>
              </div>
              <div style={sendStatStyle}>
                <span>Sending</span>
                <b>{sendSummary.sendingNow}</b>
              </div>
              <div style={sendStatStyle}>
                <span>Queued</span>
                <b>{sendSummary.queued}</b>
              </div>
            </div>

            <div style={sendProgressTrackStyle}>
              <div
                style={{
                  ...sendProgressFillStyle,
                  width:
                    sendSummary.total > 0
                      ? `${Math.round((sendSummary.done / sendSummary.total) * 100)}%`
                      : "0%",
                }}
              />
            </div>

            <div style={sendRowsWrapStyle}>
              {sendRows.map((row, index) => {
                const active = row.email === activeSendEmail;

                return (
                  <div
                    key={row.id}
                    ref={active ? activeRowRef : null}
                    role="button"
                    tabIndex={0}
                    title="Open read-only email preview"
                    onClick={() => openReadOnlyPreview(row.email)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openReadOnlyPreview(row.email);
                      }
                    }}
                    style={{
                      ...sendRowStyle,
                      cursor: "pointer",
                      borderColor: active
                        ? "rgba(37,99,235,0.30)"
                        : "rgba(0,0,0,0.08)",
                      background: active ? "rgba(219,234,254,0.76)" : "white",
                    }}
                  >
                    <div style={sendRowIndexStyle}>{index + 1}</div>

                    <div style={{ minWidth: 0 }}>
                      <div style={sendRowEmailStyle}>{row.email}</div>
                      {row.error ? (
                        <div style={sendRowErrorStyle}>{row.error}</div>
                      ) : null}
                    </div>
                    {row.status === "failed" ? (
                      <button
                        type="button"
                        title="Retry this failed email"
                        onClick={(e) => {
                          e.stopPropagation();

                          setSendRows((prev) =>
                            prev.map((item) =>
                              item.email === row.email
                                ? {
                                    ...item,
                                    status: "queued",
                                    error: "",
                                  }
                                : item,
                            ),
                          );

                          setRecipients((prev) =>
                            prev.map((item) =>
                              item.email === row.email
                                ? {
                                    ...item,
                                    status: "queued",
                                    error: "",
                                  }
                                : item,
                            ),
                          );

                          window.setTimeout(() => {
                            retryFailedEmails();
                          }, 0);
                        }}
                        style={retryIconButtonStyle}
                      >
                        ↻
                      </button>
                    ) : null}
                    <div
                      style={{
                        ...sendStatusPillStyle,
                        background:
                          row.status === "sent"
                            ? "rgba(22,163,74,0.12)"
                            : row.status === "failed"
                              ? "rgba(220,38,38,0.12)"
                              : row.status === "sending"
                                ? "rgba(37,99,235,0.12)"
                                : row.status === "skipped"
                                  ? "rgba(234,179,8,0.14)"
                                  : row.status === "draft"
                                    ? "rgba(107,114,128,0.12)"
                                    : "rgba(0,0,0,0.045)",
                        color:
                          row.status === "sent"
                            ? "#15803d"
                            : row.status === "failed"
                              ? "#b91c1c"
                              : row.status === "sending"
                                ? "#1d4ed8"
                                : row.status === "skipped"
                                  ? "#92400e"
                                  : "#374151",
                      }}
                    >
                      {row.status === "sent"
                        ? "✓ sent"
                        : row.status === "failed"
                          ? "failed"
                          : row.status === "sending"
                            ? "sending..."
                            : row.status === "skipped"
                              ? "skipped"
                              : row.status === "draft"
                                ? "draft"
                                : "queued"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {readOnlyPreviewOpen ? (
        <div
          style={readOnlyOverlayStyle}
          onClick={() => setReadOnlyPreviewOpen(false)}
        >
          <div style={readOnlyModalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={readOnlyModalHeaderStyle}>
              <div>
                <div style={kickerStyle}>Read-only email preview</div>
                <h2 style={sendTitleStyle}>Sent email view</h2>
                <p style={sendSubStyle}>
                  {readOnlyPreviewEmail
                    ? `Previewing email for ${readOnlyPreviewEmail}.`
                    : "Previewing the composed email."}{" "}
                  Audio can be played, images can be opened, and videos can be
                  previewed from this view.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setReadOnlyPreviewOpen(false)}
                style={secondaryButtonStyle}
              >
                Close
              </button>
            </div>

            <div style={readOnlyBodyScrollStyle}>
              <div style={readOnlyEmailShellStyle}>
                <div style={{ textAlign: "center", marginBottom: 10 }}>
                  <div style={previewBrandTextStyle}>STAYKNOWN™</div>
                  <div style={{ height: 6 }} />
                  <div style={previewServiceTextStyle}>
                    A 6 Clement Joshua service™
                  </div>
                  <div style={{ height: 10 }} />

                  {logoFailed ? (
                    <div style={logoFallbackStyle}>6</div>
                  ) : (
                    <img
                      src={brandLogoUrl}
                      alt="StayKnown"
                      width={64}
                      height={64}
                      onError={() => setLogoFailed(true)}
                      style={{
                        display: "inline-block",
                        width: 64,
                        height: 64,
                        borderRadius: 18,
                        boxShadow: "0 14px 38px rgba(0,0,0,0.14)",
                        background: "white",
                      }}
                    />
                  )}

                  <div style={{ height: 14 }} />

                  <div style={previewTitleStyle}>{title || "Header title"}</div>

                  {badge ? (
                    <div style={{ marginTop: 10 }}>
                      <span style={previewBadgeStyle}>{badge}</span>
                    </div>
                  ) : null}

                  {subtitle ? (
                    <div style={previewSubtitleStyle}>{subtitle}</div>
                  ) : null}
                </div>

                {topBannerPreview &&
                (imagePosition === "top" || imagePosition === "both") ? (
                  <a
                    href={topBannerPreview}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ...previewBannerWrapStyle, display: "block" }}
                  >
                    <img
                      src={topBannerPreview}
                      alt="Top banner"
                      style={{
                        ...previewBannerImageStyle,
                        height: bannerHeight,
                        maxHeight: bannerHeight,
                      }}
                    />
                  </a>
                ) : null}

                {storeBadgePlacement === "top"
                  ? renderStoreBadgesBlock(true)
                  : null}

                <div style={previewBodyStackStyle}>
                  {bodyPreviewOrder.map((block) =>
                    renderReadOnlyBodyBlock(block),
                  )}
                </div>

                {storeBadgePlacement === "bottom"
                  ? renderStoreBadgesBlock(true)
                  : null}

                {bottomBannerPreview &&
                imagePosition !== "none" &&
                (imagePosition === "bottom" || imagePosition === "both") ? (
                  <a
                    href={bottomBannerPreview}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ...previewBannerWrapStyle, display: "block" }}
                  >
                    <img
                      src={bottomBannerPreview}
                      alt="Bottom banner"
                      style={{
                        ...previewBannerImageStyle,
                        height: bannerHeight,
                        maxHeight: bannerHeight,
                      }}
                    />
                  </a>
                ) : null}

                {ctaLabel && ctaUrl ? (
                  <div style={{ textAlign: "center", marginTop: 18 }}>
                    <a
                      href={ctaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={previewCtaStyle}
                    >
                      {ctaLabel}
                    </a>
                  </div>
                ) : null}

                {footerText ? (
                  <div style={previewFooterStyle}>{footerText}</div>
                ) : null}

                {selectedPolicyLinks.length > 0 ? (
                  <div style={previewPolicyLinksStyle}>
                    {selectedPolicyLinks.map((key) => {
                      const item = POLICY_LINK_OPTIONS.find(
                        (x) => x.key === key,
                      );
                      if (!item) return null;

                      return (
                        <a
                          key={key}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={previewPolicyLinkStyle}
                        >
                          {item.label}
                        </a>
                      );
                    })}
                  </div>
                ) : null}
                {renderSocialLinksBlock()}
                <div style={previewLegalStyle}>
                  © {new Date().getFullYear()} {selectedBrandName}™ · A 6
                  Clement Joshua service™
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function getPreviewBodyImageFrameStyle(
  shape: BodyImageShape,
  size: number,
): React.CSSProperties {
  const base: React.CSSProperties = {
    width: `${size}%`,
    maxWidth: "100%",
    minWidth: "min(180px, 100%)",
    margin: "0 auto",
    overflow: "hidden",
    border: "1px solid rgba(0,0,0,0.10)",
    background: "rgba(255,255,255,0.82)",
    boxShadow: "0 16px 45px rgba(0,0,0,0.07)",
  };

  if (shape === "banner") {
    return {
      ...base,
      borderRadius: 18,
      minWidth: "min(230px, 100%)",
    };
  }

  if (shape === "pill") {
    return {
      ...base,
      borderRadius: 28,
      minWidth: "min(220px, 100%)",
    };
  }

  if (shape === "square") {
    return {
      ...base,
      borderRadius: 18,
      aspectRatio: "1 / 1",
      minWidth: "min(180px, 100%)",
    };
  }

  if (shape === "circle") {
    return {
      ...base,
      borderRadius: 999,
      aspectRatio: "1 / 1",
      minWidth: "min(180px, 100%)",
    };
  }

  return {
    ...base,
    borderRadius: 18,
  };
}

function getPreviewBodyImageStyle(shape: BodyImageShape): React.CSSProperties {
  return {
    display: "block",
    width: "100%",
    height: shape === "square" || shape === "circle" ? "100%" : "auto",
    maxHeight: shape === "banner" ? 240 : 340,
    objectFit: "contain",
    objectPosition: "center",
    background: "rgba(0,0,0,0.04)",
  };
}

const panelStyle: React.CSSProperties = {
  borderRadius: 24,
  background: "white",
  border: "1px solid rgba(0,0,0,0.075)",
  boxShadow: "0 18px 55px rgba(0,0,0,0.055)",
  padding: 18,
};

const previewPanelStickyStyle: React.CSSProperties = {
  ...panelStyle,
  position: "sticky",
  top: 18,
  maxHeight: "calc(100vh - 36px)",
  overflowY: "auto",
  overflowX: "hidden",
  overscrollBehavior: "contain",
  alignSelf: "start",
};

const kickerStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 950,
  letterSpacing: 2.8,
  textTransform: "uppercase",
  color: "rgba(0,0,0,0.58)",
};

const h1Style: React.CSSProperties = {
  margin: "8px 0 4px",
  fontSize: 34,
  lineHeight: 1.05,
  fontWeight: 950,
};

const subStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: "rgba(0,0,0,0.62)",
  lineHeight: 1.5,
};

const whitePillLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  padding: "13px 18px",
  background: "white",
  color: "#050505",
  fontWeight: 950,
  textDecoration: "none",
  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.10)",
};

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 950,
  letterSpacing: 1.8,
  textTransform: "uppercase",
  color: "rgba(0,0,0,0.58)",
  margin: "6px 0 14px",
};

const grid2Style: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
  gap: 10,
  marginBottom: 12,
};

const grid3Style: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 10,
  marginBottom: 12,
};

const fieldStyle: React.CSSProperties = {
  marginBottom: 14,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 900,
  color: "rgba(0,0,0,0.62)",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 13,
  border: "1px solid rgba(0,0,0,0.11)",
  background: "white",
  padding: "10px 11px",
  fontSize: 13,
  color: "#050505",
  outline: "none",
};

const recipientBoxStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 7,
  alignItems: "center",
  minHeight: 48,
  borderRadius: 16,
  border: "1px solid rgba(0,0,0,0.11)",
  background: "white",
  padding: 8,
};

const recipientChipStyle: React.CSSProperties = {
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  maxWidth: "100%",
  borderRadius: 999,
  border: "1px solid rgba(0,0,0,0.10)",
  padding: "7px 24px 7px 10px",
  fontSize: 12,
  fontWeight: 850,
  color: "#050505",
  boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
};

const recipientEmailTextStyle: React.CSSProperties = {
  maxWidth: 230,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const recipientEditInputStyle: React.CSSProperties = {
  width: 220,
  maxWidth: "100%",
  border: 0,
  outline: "none",
  background: "rgba(255,255,255,0.92)",
  color: "#050505",
  fontSize: 12,
  fontWeight: 900,
  borderRadius: 999,
  padding: "3px 7px",
};

const recipientStatusDotStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 950,
  color: "rgba(0,0,0,0.58)",
};

const recipientRemoveStyle: React.CSSProperties = {
  position: "absolute",
  top: -5,
  right: -5,
  width: 18,
  height: 18,
  borderRadius: 999,
  border: 0,
  background: "#050505",
  color: "white",
  fontSize: 13,
  fontWeight: 900,
  lineHeight: "18px",
  cursor: "pointer",
  padding: 0,
  transition: "opacity 160ms ease, transform 160ms ease",
};

const recipientInputStyle: React.CSSProperties = {
  flex: "1 1 220px",
  minWidth: 180,
  border: 0,
  outline: "none",
  fontSize: 13,
  padding: "8px 6px",
  color: "#050505",
  background: "transparent",
};

const recipientHelpStyle: React.CSSProperties = {
  marginTop: 7,
  fontSize: 11,
  color: "rgba(0,0,0,0.55)",
  lineHeight: 1.45,
};

const recipientHeaderRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  flexWrap: "wrap",
  marginBottom: 6,
};

const recipientBulkActionStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 8,
  flexWrap: "wrap",
};

const recipientMarkAllLabelStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  borderRadius: 999,
  padding: "7px 10px",
  background: "rgba(0,0,0,0.045)",
  color: "#050505",
  fontSize: 11,
  fontWeight: 900,
  cursor: "pointer",
};

const recipientBulkButtonStyle: React.CSSProperties = {
  border: 0,
  borderRadius: 999,
  padding: "7px 10px",
  background: "#050505",
  color: "white",
  fontSize: 11,
  fontWeight: 900,
};

const recipientChipCheckboxStyle: React.CSSProperties = {
  width: 14,
  height: 14,
  margin: 0,
  accentColor: "#050505",
  cursor: "pointer",
};

const recipientIssueBoxStyle: React.CSSProperties = {
  marginTop: 8,
  display: "grid",
  gap: 6,
};

const issueRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  borderRadius: 14,
  border: "1px solid rgba(220,38,38,0.18)",
  background: "rgba(254,226,226,0.72)",
  color: "#7f1d1d",
  padding: "8px 10px",
  fontSize: 12,
  lineHeight: 1.35,
};

const issueSuggestionButtonStyle: React.CSSProperties = {
  border: 0,
  borderRadius: 999,
  background: "white",
  color: "#7f1d1d",
  padding: "6px 9px",
  fontSize: 11,
  fontWeight: 900,
  cursor: "pointer",
};

const bannerPickerStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  justifyContent: "space-between",
  borderRadius: 18,
  border: "1px dashed rgba(0,0,0,0.20)",
  background: "rgba(0,0,0,0.025)",
  padding: 12,
};

const filePickButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  padding: "8px 11px",
  background: "#050505",
  color: "white",
  fontWeight: 900,
  fontSize: 12,
  cursor: "pointer",
  boxShadow: "0 10px 22px rgba(0,0,0,0.10)",
};

const bannerFileNameStyle: React.CSSProperties = {
  marginTop: 8,
  fontSize: 12,
  lineHeight: 1.5,
  color: "rgba(0,0,0,0.58)",
  wordBreak: "break-word",
};

const policyBoxStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  justifyContent: "center",
  borderRadius: 18,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "rgba(0,0,0,0.025)",
  padding: 12,
};

const uploadBoxStyle: React.CSSProperties = {
  borderRadius: 22,
  border: "1px dashed rgba(0,0,0,0.20)",
  background: "rgba(0,0,0,0.025)",
  padding: 16,
};

const fileRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto auto auto",
  gap: 10,
  alignItems: "center",
  borderRadius: 18,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "white",
  padding: 12,
};

const fileMetaStyle: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(0,0,0,0.58)",
  marginTop: 3,
};

const primaryButtonStyle: React.CSSProperties = {
  border: 0,
  borderRadius: 999,
  padding: "10px 14px",
  background: "#050505",
  color: "white",
  fontWeight: 900,
  fontSize: 13,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  border: 0,
  borderRadius: 999,
  padding: "10px 14px",
  background: "white",
  color: "#050505",
  fontWeight: 900,
  fontSize: 13,
  cursor: "pointer",
  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)",
};

const dangerButtonStyle: React.CSSProperties = {
  border: 0,
  borderRadius: 999,
  padding: "10px 14px",
  background: "#7f1d1d",
  color: "white",
  fontWeight: 900,
  fontSize: 13,
  cursor: "pointer",
};

const smallButtonStyle: React.CSSProperties = {
  border: 0,
  borderRadius: 999,
  padding: "8px 10px",
  background: "rgba(0,0,0,0.06)",
  color: "#050505",
  fontWeight: 850,
  fontSize: 12,
  cursor: "pointer",
};

const statusStyle: React.CSSProperties = {
  marginTop: 14,
  borderRadius: 16,
  background: "rgba(0,0,0,0.035)",
  border: "1px solid rgba(0,0,0,0.07)",
  padding: 12,
  fontSize: 13,
  lineHeight: 1.5,
  color: "rgba(0,0,0,0.68)",
};

const summaryRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  borderBottom: "1px solid rgba(0,0,0,0.08)",
  padding: "12px 0",
  fontSize: 13,
};

const helpTextStyle: React.CSSProperties = {
  marginTop: 8,
  fontSize: 12,
  lineHeight: 1.55,
  color: "rgba(0,0,0,0.58)",
  textAlign: "center",
};

const previewOuterStyle: React.CSSProperties = {
  borderRadius: 22,
  background: "#f3f4f6",
  border: "1px solid rgba(0,0,0,0.08)",
  padding: 16,
};

const previewBrandTextStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 950,
  letterSpacing: 2.6,
  color: "rgba(0,0,0,0.78)",
};

const previewServiceTextStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.6,
  color: "rgba(0,0,0,0.58)",
};

const logoFallbackStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 64,
  height: 64,
  borderRadius: 18,
  background: "white",
  color: "#050505",
  fontSize: 24,
  fontWeight: 950,
  boxShadow: "0 14px 38px rgba(0,0,0,0.14)",
};

const previewTitleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 950,
  letterSpacing: 0.2,
  color: "#0b0b0b",
  lineHeight: 1.35,
};

const previewBadgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "6px 12px",
  borderRadius: 999,
  border: "1px solid rgba(0,0,0,0.10)",
  background: "rgba(255,255,255,0.72)",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: 0.6,
  color: "#111",
};

const previewSubtitleStyle: React.CSSProperties = {
  marginTop: 10,
  fontSize: 13,
  color: "rgba(0,0,0,0.65)",
  lineHeight: 1.55,
};

const previewBannerWrapStyle: React.CSSProperties = {
  margin: "14px 0",
  borderRadius: 20,
  border: "1px solid rgba(0,0,0,0.10)",
  overflow: "hidden",
  background: "#ffffff",
  boxShadow: "0 20px 60px rgba(0,0,0,0.07)",
};

const previewBannerImageStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  height: 96,
  maxHeight: 96,
  objectFit: "cover",
};

const previewMessageCardStyle: React.CSSProperties = {
  borderRadius: 22,
  border: "1px solid rgba(0,0,0,0.10)",
  background: "rgba(255,255,255,0.78)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.92),0 28px 75px rgba(0,0,0,0.09)",
  overflow: "hidden",
};

const previewMessageBodyStyle: React.CSSProperties = {
  padding: "18px 20px",
  fontSize: 15,
  lineHeight: 1.75,
  color: "rgba(0,0,0,0.82)",
  whiteSpace: "pre-wrap",
  minHeight: 130,
};

const previewCtaStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "13px 18px",
  borderRadius: 999,
  border: "1px solid rgba(0,0,0,0.10)",
  background: "rgba(255,255,255,0.86)",
  color: "#0b0b0b",
  textDecoration: "none",
  fontWeight: 950,
  letterSpacing: 0.4,
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.92),0 20px 55px rgba(0,0,0,0.08)",
};

const previewSocialWrapStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  flexWrap: "wrap",
  marginTop: 10,
  marginBottom: 8,
};

const previewSocialLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  borderRadius: 999,
  padding: "7px 10px",
  background: "rgba(255,255,255,0.88)",
  color: "#050505",
  textDecoration: "none",
  fontSize: 11,
  fontWeight: 900,
  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.10)",
};

const previewSocialIconStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 20,
  height: 20,
  borderRadius: 999,
  background: "#050505",
  color: "white",
  fontSize: 12,
  fontWeight: 950,
  lineHeight: 1,
};

const storeBadgeWrapStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  margin: "14px auto",
};

const storeBadgeStyle: React.CSSProperties = {
  minWidth: 154,
  minHeight: 48,
  borderRadius: 13,
  background: "#050505",
  color: "white",
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  padding: "8px 12px",
  textDecoration: "none",
  boxShadow: "0 14px 34px rgba(0,0,0,0.14)",
};

const storeBadgeIconStyle: React.CSSProperties = {
  width: 26,
  minWidth: 26,
  height: 26,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 20,
  lineHeight: 1,
};

const storeBadgeTextWrapStyle: React.CSSProperties = {
  display: "grid",
  gap: 1,
  textAlign: "left",
};

const storeBadgeEyebrowStyle: React.CSSProperties = {
  fontSize: 8,
  lineHeight: 1,
  fontWeight: 800,
  letterSpacing: 0.4,
  opacity: 0.86,
  textTransform: "uppercase",
};

const storeBadgeLabelStyle: React.CSSProperties = {
  fontSize: 17,
  lineHeight: 1.08,
  fontWeight: 950,
  letterSpacing: -0.2,
};

const storeToggleCardStyle: React.CSSProperties = {
  borderRadius: 16,
  border: "1px solid rgba(0,0,0,0.09)",
  background: "white",
  padding: 12,
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  cursor: "pointer",
};

const storeWarningStyle: React.CSSProperties = {
  marginTop: 10,
  borderRadius: 14,
  border: "1px solid rgba(234,179,8,0.30)",
  background: "rgba(254,249,195,0.72)",
  padding: "10px 12px",
  fontSize: 11,
  lineHeight: 1.45,
  color: "#854d0e",
  fontWeight: 750,
};

const tokenButtonRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginTop: 10,
};

const tinyUtilityButtonStyle: React.CSSProperties = {
  border: 0,
  borderRadius: 999,
  padding: "8px 11px",
  background: "#050505",
  color: "white",
  fontSize: 11,
  fontWeight: 900,
  cursor: "pointer",
};

const embeddedMediaSlotStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  margin: "14px auto",
  textAlign: "center",
};

const previewFooterStyle: React.CSSProperties = {
  marginTop: 16,
  fontSize: 11,
  lineHeight: 1.65,
  color: "rgba(0,0,0,0.55)",
  whiteSpace: "pre-wrap",
  textAlign: "center",
};

const previewPolicyLinksStyle: React.CSSProperties = {
  marginTop: 10,
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  justifyContent: "center",
  fontSize: 11,
  lineHeight: 1.5,
  textAlign: "center",
};

const previewPolicyLinkStyle: React.CSSProperties = {
  color: "rgba(0,0,0,0.72)",
  fontWeight: 900,
  textDecoration: "underline",
  textUnderlineOffset: 3,
};

const previewLegalStyle: React.CSSProperties = {
  marginTop: 8,
  textAlign: "center",
  fontSize: 11,
  lineHeight: 1.5,
  color: "rgba(0,0,0,0.52)",
};

const compactGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  marginBottom: 10,
};

const compactMediaPanelStyle: React.CSSProperties = {
  borderRadius: 18,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "rgba(0,0,0,0.018)",
  padding: 12,
};

const compactPanelTitleStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 950,
  letterSpacing: 0.8,
  color: "rgba(0,0,0,0.74)",
  marginBottom: 10,
};

const compactSliderRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "auto minmax(90px, 1fr) auto",
  alignItems: "center",
  gap: 8,
  marginTop: 8,
  fontSize: 11,
  color: "rgba(0,0,0,0.58)",
};

const rangeStyle: React.CSSProperties = {
  width: "100%",
  accentColor: "#050505",
};

const hintControlGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 0.8fr) minmax(0, 1.2fr)",
  gap: 8,
  marginTop: 8,
};

const hintControlStyle: React.CSSProperties = {
  display: "grid",
  gap: 5,
  fontSize: 10,
  fontWeight: 900,
  color: "rgba(0,0,0,0.50)",
};

const colorInputStyle: React.CSSProperties = {
  width: "100%",
  height: 34,
  border: "1px solid rgba(0,0,0,0.11)",
  borderRadius: 12,
  padding: 4,
  background: "white",
  cursor: "pointer",
};

const hintSelectStyle: React.CSSProperties = {
  ...inputStyle,
  height: 34,
  padding: "6px 9px",
  fontSize: 12,
};

const previewBodyStackStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
};

const previewDraggableBlockStyle: React.CSSProperties = {
  cursor: "grab",
};

const previewDragHintStyle: React.CSSProperties = {
  marginTop: 5,
  textAlign: "center",
  fontSize: 10,
  color: "rgba(0,0,0,0.38)",
};

const previewAudioPillStyle: React.CSSProperties = {
  margin: "0 auto",
  display: "flex",
  alignItems: "center",
  gap: 10,
  borderRadius: 999,
  border: "1px solid rgba(0,0,0,0.10)",
  background: "rgba(255,255,255,0.88)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.92),0 15px 38px rgba(0,0,0,0.075)",
  padding: "9px 12px",
};

const previewAudioIconStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 999,
  background: "#050505",
  color: "white",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 14,
  flexShrink: 0,
};

const previewMediaHintStyle: React.CSSProperties = {
  margin: "6px auto 0",
  textAlign: "center",
  fontSize: 11,
  lineHeight: 1.45,
  color: "#6b7280",
};

const previewBodyImageWrapStyle: React.CSSProperties = {
  margin: "0 auto",
  borderRadius: 22,
  overflow: "hidden",
  border: "1px solid rgba(0,0,0,0.10)",
  background: "white",
  boxShadow: "0 16px 45px rgba(0,0,0,0.07)",
};

const previewBodyImageStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  maxHeight: 260,
  objectFit: "cover",
};

const readOnlyOverlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 10020,
  background: "rgba(0,0,0,0.48)",
  backdropFilter: "blur(18px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 18,
};

const readOnlyModalStyle: React.CSSProperties = {
  width: "min(760px, 100%)",
  maxHeight: "92vh",
  overflow: "hidden",
  display: "grid",
  gridTemplateRows: "auto 1fr",
  borderRadius: 30,
  background: "white",
  border: "1px solid rgba(0,0,0,0.08)",
  boxShadow: "0 44px 120px rgba(0,0,0,0.34)",
  padding: 18,
};

const readOnlyModalHeaderStyle: React.CSSProperties = {
  display: "flex",
  gap: 14,
  alignItems: "flex-start",
  justifyContent: "space-between",
  flexWrap: "wrap",
  marginBottom: 14,
};

const readOnlyBodyScrollStyle: React.CSSProperties = {
  overflowY: "auto",
  paddingRight: 4,
};

const readOnlyEmailShellStyle: React.CSSProperties = {
  ...previewOuterStyle,
  width: "min(560px, 100%)",
  margin: "0 auto",
};

const readOnlyBodyBlockStyle: React.CSSProperties = {
  cursor: "default",
};

const retryIconButtonStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 999,
  border: 0,
  background: "#7f1d1d",
  color: "white",
  fontSize: 16,
  fontWeight: 950,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const sendOverlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 9999,
  background: "rgba(0,0,0,0.42)",
  backdropFilter: "blur(18px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 18,
};

const sendModalStyle: React.CSSProperties = {
  width: "min(760px, 100%)",
  maxHeight: "88vh",
  overflow: "hidden",
  display: "grid",
  gridTemplateRows: "auto auto auto 1fr",
  borderRadius: 28,
  background: "white",
  border: "1px solid rgba(0,0,0,0.08)",
  boxShadow: "0 40px 110px rgba(0,0,0,0.28)",
  padding: 18,
};

const sendModalHeaderStyle: React.CSSProperties = {
  display: "flex",
  gap: 14,
  alignItems: "flex-start",
  justifyContent: "space-between",
  flexWrap: "wrap",
  marginBottom: 14,
};

const sendTitleStyle: React.CSSProperties = {
  margin: "6px 0",
  fontSize: 24,
  lineHeight: 1.05,
  fontWeight: 950,
  color: "#050505",
};

const sendSubStyle: React.CSSProperties = {
  margin: 0,
  maxWidth: 520,
  fontSize: 12,
  lineHeight: 1.55,
  color: "rgba(0,0,0,0.62)",
};

const sendStatsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(95px, 1fr))",
  gap: 8,
  marginBottom: 12,
};

const sendStatStyle: React.CSSProperties = {
  borderRadius: 16,
  background: "rgba(0,0,0,0.035)",
  border: "1px solid rgba(0,0,0,0.06)",
  padding: "10px 12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  fontSize: 12,
};

const sendProgressTrackStyle: React.CSSProperties = {
  height: 9,
  borderRadius: 999,
  background: "rgba(0,0,0,0.07)",
  overflow: "hidden",
  marginBottom: 12,
};

const sendProgressFillStyle: React.CSSProperties = {
  height: "100%",
  borderRadius: 999,
  background: "#050505",
  transition: "width 220ms ease",
};

const sendRowsWrapStyle: React.CSSProperties = {
  overflowY: "auto",
  display: "grid",
  gap: 8,
  paddingRight: 4,
};

const sendRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "34px minmax(0, 1fr) auto",
  gap: 10,
  alignItems: "center",
  borderRadius: 16,
  border: "1px solid rgba(0,0,0,0.08)",
  padding: 10,
  transition: "background 180ms ease, border-color 180ms ease",
};

const sendRowIndexStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 999,
  background: "rgba(0,0,0,0.06)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 11,
  fontWeight: 950,
  color: "rgba(0,0,0,0.64)",
};

const sendRowEmailStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 900,
  color: "#050505",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const sendRowErrorStyle: React.CSSProperties = {
  marginTop: 3,
  fontSize: 11,
  lineHeight: 1.35,
  color: "#b91c1c",
};

const sendStatusPillStyle: React.CSSProperties = {
  borderRadius: 999,
  padding: "6px 9px",
  fontSize: 11,
  fontWeight: 950,
  whiteSpace: "nowrap",
};

const previewAudioPlayerShellStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  maxWidth: "100%",
  minWidth: "min(250px, 100%)",
  margin: "0 auto",
  boxSizing: "border-box",
  borderRadius: 999,
  padding: "10px 14px 10px 12px",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(245,245,245,0.96) 100%)",
  border: "1px solid rgba(255,255,255,0.92)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.96), inset 0 -1px 0 rgba(210,210,210,0.72), 0 16px 42px rgba(0,0,0,0.16)",
  color: "#111111",
  textDecoration: "none",
};

const previewAudioPlayButtonStyle: React.CSSProperties = {
  width: 42,
  height: 42,
  minWidth: 42,
  borderRadius: 999,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    "radial-gradient(circle at 30% 24%, #ffffff 0%, #f5f5f5 42%, #dcdcdc 100%)",
  border: "1px solid rgba(210,210,210,0.95)",
  boxShadow:
    "inset 0 2px 3px rgba(255,255,255,0.95), inset 0 -3px 7px rgba(0,0,0,0.10), 0 8px 18px rgba(0,0,0,0.12)",
  color: "#111111",
  fontSize: 13,
  fontWeight: 950,
  lineHeight: 1,
};

const previewAudioContentStyle: React.CSSProperties = {
  display: "block",
  minWidth: 0,
  flex: 1,
  textAlign: "left",
};

const previewAudioTitleStyle: React.CSSProperties = {
  display: "block",
  fontSize: 14,
  lineHeight: 1.2,
  fontWeight: 950,
  color: "#111111",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  letterSpacing: -0.1,
};

const previewAudioProgressTrackStyle: React.CSSProperties = {
  display: "block",
  marginTop: 7,
  height: 6,
  borderRadius: 999,
  background: "#e9e9e9",
  overflow: "hidden",
  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.08)",
};

const previewAudioProgressFillStyle: React.CSSProperties = {
  display: "block",
  width: "34%",
  height: "100%",
  borderRadius: 999,
  background: "linear-gradient(90deg, #111111 0%, #4b4b4b 100%)",
};

const previewAudioMetaStyle: React.CSSProperties = {
  display: "block",
  marginTop: 5,
  fontSize: 10,
  lineHeight: 1.2,
  color: "rgba(17,17,17,0.55)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const previewAudioListenTextStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "flex-end",
  minWidth: 78,
  fontSize: 11,
  lineHeight: 1.2,
  fontWeight: 950,
  color: "rgba(17,17,17,0.72)",
  whiteSpace: "nowrap",
};
