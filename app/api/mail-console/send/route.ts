import { getMailConsoleSiteUrl } from "@/lib/mailConsoleAdmin";
import { createUnsubscribeToken } from "@/lib/mailConsoleUnsubscribe";
import { readFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
import {
  MAIL_CONSOLE_COOKIE,
  verifyMailConsoleSessionToken,
} from "@/lib/mailConsoleServerAuth";

type MailMode = "support" | "newsletter" | "advert" | "investor";
type ImagePosition = "none" | "top" | "bottom" | "both";
type AttachmentMode = "attach" | "link_only" | "inline_image";

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
  contentId?: string;
  content_type?: string;
};

const STAYKNOWN_LOGO_CONTENT_ID = "stayknown-brand-logo";

async function getStayKnownLogoAttachment(): Promise<ResendAttachment | null> {
  try {
    const logoPath = path.join(process.cwd(), "public", "6logo.png");
    const logoBuffer = await readFile(logoPath);

    return {
      filename: "6logo.png",
      content: logoBuffer.toString("base64"),
      contentId: STAYKNOWN_LOGO_CONTENT_ID,
      content_type: "image/png",
    };
  } catch (_) {
    return null;
  }
}

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
  | "billing_policy";

const POLICY_LINK_OPTIONS: Record<
  PolicyLinkKey,
  {
    label: string;
    href: string;
  }
> = {
  privacy: { label: "Privacy Policy", href: "https://stay-known.com/privacy" },
  terms: { label: "Terms of Service", href: "https://stay-known.com/terms" },
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
  abuse: { label: "Abuse Reporting", href: "https://stay-known.com/abuse" },
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

function normalizeEmail(v: unknown) {
  return clean(v).toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

function isPublicHttpUrl(v: string) {
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch (_) {
    return false;
  }
}

function parseRecipients(raw: string) {
  const emails = raw
    .split(/[,\n;]/)
    .map((x) => normalizeEmail(x))
    .filter(Boolean)
    .filter(isValidEmail);

  return [...new Set(emails)];
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

function policyLinksHtml(keys: PolicyLinkKey[]) {
  if (keys.length === 0) return "";

  const links = keys
    .map((key) => {
      const item = POLICY_LINK_OPTIONS[key];

      if (!item) return "";

      return `<a href="${escapeHtml(item.href)}" target="_blank" rel="noopener noreferrer" style="color:rgba(0,0,0,0.72);font-weight:900;text-decoration:underline;text-underline-offset:3px;">${escapeHtml(item.label)}</a>`;
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

function getSiteUrl() {
  return (
    clean(process.env.NEXT_PUBLIC_SITE_URL) ||
    clean(process.env.SITE_URL) ||
    "https://stay-known.com"
  ).replace(/\/+$/g, "");
}

function getLogoUrl() {
  return (
    clean(process.env.MAIL_CONSOLE_BRAND_LOGO_URL) ||
    clean(process.env.BRAND_LOGO_URL) ||
    "https://ipognlibpkbauusvfeic.supabase.co/storage/v1/object/public/public-assets/stayknown-logo.png"
  );
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

function brandLogoHtml(appName: string) {
  return `
    ${trademarkHtml(appName)}
    <div style="text-align:center;margin:0 0 10px 0;">
      <img src="cid:${STAYKNOWN_LOGO_CONTENT_ID}" width="64" height="64" alt="${escapeHtml(appName)}"
        style="display:inline-block;width:64px;height:64px;border-radius:18px;background:#ffffff;box-shadow:0 14px 38px rgba(0,0,0,0.14);" />
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

function remoteImageBlock(url: string, alt: string) {
  if (!url || !isPublicHttpUrl(url)) return "";

  return `
    <div style="
      margin:14px 0;
      border-radius:20px;
      border:1px solid rgba(0,0,0,0.10);
      overflow:hidden;
      background:#ffffff;
      box-shadow:0 20px 60px rgba(0,0,0,0.07);
    ">
      <img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}"
        style="display:block;width:100%;max-height:420px;object-fit:cover;" />
    </div>
  `;
}

function inlineImageBlock(contentId: string, alt: string) {
  return `
    <div style="
      margin:14px 0;
      border-radius:20px;
      border:1px solid rgba(0,0,0,0.10);
      overflow:hidden;
      background:#ffffff;
      box-shadow:0 20px 60px rgba(0,0,0,0.07);
    ">
      <img src="cid:${escapeHtml(contentId)}" alt="${escapeHtml(alt)}"
        style="display:block;width:100%;max-height:420px;object-fit:cover;" />
    </div>
  `;
}

function ctaButton(label: string, url: string) {
  if (!label || !url || !isPublicHttpUrl(url)) return "";

  return `
    <div style="text-align:center;margin-top:18px;margin-bottom:4px;">
      <a href="${escapeHtml(url)}" style="
        display:inline-block;
        padding:13px 18px;
        border-radius:999px;
        border:1px solid rgba(0,0,0,0.10);
        background:rgba(255,255,255,0.86);
        color:#0b0b0b;
        text-decoration:none;
        font-weight:950;
        letter-spacing:0.4px;
        box-shadow:inset 0 1px 0 rgba(255,255,255,0.92),0 20px 55px rgba(0,0,0,0.08);
      ">${escapeHtml(label)}</a>
    </div>
  `;
}

function dividerHtml() {
  return `<div style="height:1px;background:rgba(0,0,0,0.08);margin:18px 0;"></div>`;
}

function linkOnlyFilesBlock(files: Array<{ filename: string; url: string }>) {
  if (files.length === 0) return "";

  const items = files
    .map(
      (f) => `
      <div style="padding:10px 0;border-top:1px solid rgba(0,0,0,0.08);">
        <a href="${escapeHtml(f.url)}" style="color:#050505;font-weight:900;text-decoration:none;">
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

function centeredFooterHtml(footerHtml: string) {
  const cleanFooter = clean(footerHtml);

  if (!cleanFooter) return "";

  const parts = cleanFooter.split("\n\n");

  const textPart = parts[0] || "";
  const htmlParts = parts.slice(1).join("\n\n");

  return `
    <div style="
      text-align:center;
      margin:0 auto;
      max-width:500px;
      font-size:11px;
      line-height:1.65;
      color:rgba(0,0,0,0.55);
    ">
      ${escapeHtml(textPart).replaceAll("\n", "<br/>")}
    </div>
    ${htmlParts}
  `;
}

function emailShell(p: {
  appName: string;
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
                ${brandLogoHtml(p.appName)}

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

function buildHtml(p: {
  appName: string;
  mode: MailMode;
  title: string;
  subtitle: string;
  badge: string;
  message: string;
  bannerImageUrlTop: string;
  bannerImageUrlBottom: string;
  bannerPosition: ImagePosition;
  ctaLabel: string;
  ctaUrl: string;
  footerHtml: string;
  inlineImageBlocks: string;
  linkOnlyFiles: Array<{ filename: string; url: string }>;
}) {
  const messageHtml = textToHtml(p.message);

  const topBannerUrl = p.bannerImageUrlTop;
  const bottomBannerUrl = p.bannerImageUrlBottom || p.bannerImageUrlTop;

  const remoteTop =
    p.bannerPosition === "top" || p.bannerPosition === "both"
      ? remoteImageBlock(topBannerUrl, p.title)
      : "";

  const remoteBottom =
    p.bannerPosition === "bottom" || p.bannerPosition === "both"
      ? remoteImageBlock(bottomBannerUrl, p.title)
      : "";
  const cta = ctaButton(p.ctaLabel, p.ctaUrl);

  const modeLabel =
    p.mode === "newsletter"
      ? "Newsletter"
      : p.mode === "advert"
        ? "Announcement"
        : p.mode === "investor"
          ? "Investor Communication"
          : "Support Communication";

  const contentHtml = `
    ${remoteTop}

    ${p.inlineImageBlocks}

    <div style="font-size:15px;line-height:1.75;color:rgba(0,0,0,0.82);">
      ${messageHtml}
    </div>

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
      ${escapeHtml(modeLabel)}
    </div>
  `;

  return emailShell({
    appName: p.appName,
    title: p.title,
    subtitle: p.subtitle,
    badge: p.badge,
    contentHtml,
    footerHtml: centeredFooterHtml(p.footerHtml),
  });
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

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      `Resend failed: ${res.status} ${res.statusText} ${JSON.stringify(data)}`,
    );
  }

  return data;
}

function cleanFilename(name: string) {
  return (
    name
      .replace(/[^\w.\-() ]+/g, "_")
      .replace(/\s+/g, "_")
      .slice(0, 120) || "attachment"
  );
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
    const resendApiKey = clean(process.env.RESEND_API_KEY);

    if (!supabaseUrl || !serviceRole) {
      return NextResponse.json(
        { ok: false, error: "Missing Supabase server config." },
        { status: 500 },
      );
    }

    if (!resendApiKey) {
      return NextResponse.json(
        { ok: false, error: "Missing RESEND_API_KEY in Vercel." },
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
    const recipientRaw = clean(form.get("to"));
    const recipients = parseRecipients(recipientRaw);

    const subject = clean(form.get("subject"));
    const title = clean(form.get("title"));
    const subtitle = clean(form.get("subtitle"));
    const badge = clean(form.get("badge"));
    const message = clean(form.get("message"));
    const bannerImageUrlTop =
      clean(form.get("banner_image_url_top")) || clean(form.get("image_url"));

    const bannerImageUrlBottom = clean(form.get("banner_image_url_bottom"));

    const bannerPosition = bannerImageUrlTop
      ? safeImagePosition(
          form.get("banner_position") || form.get("image_position"),
        )
      : "none";
    const ctaLabel = clean(form.get("cta_label"));
    const ctaUrl = clean(form.get("cta_url"));
    const footerPolicyId = clean(form.get("footer_policy_id"));
    const footerHtml = clean(form.get("footer_html"));
    const selectedPolicyLinks = parsePolicyLinks(
      clean(form.get("policy_links")),
    );

    if (!senderIdentityId) {
      return NextResponse.json(
        { ok: false, error: "Select a sender address." },
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

    if (bannerImageUrlTop && !isPublicHttpUrl(bannerImageUrlTop)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Top banner image URL must start with http:// or https://.",
        },
        { status: 400 },
      );
    }

    if (bannerImageUrlBottom && !isPublicHttpUrl(bannerImageUrlBottom)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Bottom banner image URL must start with http:// or https://.",
        },
        { status: 400 },
      );
    }

    if (ctaUrl && !isPublicHttpUrl(ctaUrl)) {
      return NextResponse.json(
        { ok: false, error: "CTA URL must start with http:// or https://." },
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

    const finalFooter = `${finalFooterText}\n\n${policyLinksHtml(selectedPolicyLinks)}`;

    const replyMode =
      mode === "newsletter" || mode === "advert" ? "no_reply" : "reply_enabled";

    const replyTo =
      replyMode === "reply_enabled"
        ? clean(senderRow.reply_to_email) || clean(senderRow.from_email)
        : "";

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
        image_url: bannerImageUrlTop || null,
        image_position: bannerPosition,
        cta_label: ctaLabel || null,
        cta_url: ctaUrl || null,
        footer_html: finalFooter,
        footer_text: htmlToText(finalFooter),
        reply_mode: replyMode,
        status: "sending",
        meta: {
          created_from: "next_api_mail_console_send",
          admin_email: adminEmail,
          sender_email: senderRow.from_email,
          recipient_count: recipients.length,
          policy_links: selectedPolicyLinks,
          banner_image_url_top: bannerImageUrlTop || null,
          banner_image_url_bottom: bannerImageUrlBottom || null,
        },
      })
      .select("id")
      .single();

    if (campaignError || !campaign?.id) {
      throw new Error(campaignError?.message || "Could not create campaign.");
    }

    campaignId = campaign.id;

    const files = form
      .getAll("files")
      .filter((v) => v instanceof File) as File[];
    const fileModesRaw = clean(form.get("file_modes"));

    let fileModes: AttachmentMode[] = [];

    try {
      const parsed = JSON.parse(fileModesRaw || "[]");
      fileModes = Array.isArray(parsed)
        ? parsed.map((x) => safeAttachmentMode(x))
        : [];
    } catch (_) {
      fileModes = [];
    }

    let totalAttachmentRawBytes = 0;
    const attachments: ResendAttachment[] = [];
    const linkOnlyFiles: Array<{ filename: string; url: string }> = [];
    const inlineBlocks: string[] = [];

    const logoAttachment = await getStayKnownLogoAttachment();

    if (logoAttachment) {
      attachments.push(logoAttachment);
    }

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const fileMode = fileModes[i] || "attach";
      const filename = cleanFilename(file.name);
      const mime = file.type || "application/octet-stream";
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
        storage_path: `pending/${campaignId}/${filename}`,
        attachment_mode: fileMode,
        created_by: null,
      });

      if (fileMode === "link_only") {
        const storagePath = `${campaignId}/${crypto.randomUUID()}-${filename}`;

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
          .createSignedUrl(storagePath, 7 * 24 * 60 * 60);

        if (signedError || !signed?.signedUrl) {
          throw new Error(
            `Signed URL failed for ${filename}: ${signedError?.message || "unknown error"}`,
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
        const contentId = `sk-inline-${i}-${crypto.randomUUID()}`;

        attachments.push({
          filename,
          content: base64,
          contentId,
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

    const appName = clean(process.env.MAIL_CONSOLE_APP_NAME) || "StayKnown";

    const html = buildHtml({
      appName,
      mode,
      title: title || subject,
      subtitle,
      badge,
      message,
      bannerImageUrlTop,
      bannerImageUrlBottom,
      bannerPosition,
      ctaLabel,
      ctaUrl,
      footerHtml: finalFooter,
      inlineImageBlocks: inlineBlocks.join(""),
      linkOnlyFiles,
    });
    const text = htmlToText(html);
    const from = `${senderRow.from_name} <${senderRow.from_email}>`;

    const newsletterLike = mode === "newsletter" || mode === "advert";
    const siteUrl = getMailConsoleSiteUrl();

    function unsubscribeLinkFor(email: string) {
      const token = createUnsubscribeToken(email);
      return `${siteUrl}/unsubscribe?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
    }

    const headers: Record<string, string> = {};

    if (newsletterLike) {
      headers["X-StayKnown-Email-Type"] = mode;
    }

    const summary = {
      requested: recipients.length,
      sent: 0,
      failed: 0,
      skipped: 0,
      results: [] as Array<Record<string, unknown>>,
    };

    for (const recipient of recipients) {
      let logId: number | null = null;
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
            },
          })
          .select("id")
          .single();

        logId = Number(logRow?.id || 0) || null;

        const recipientUnsubscribeLink = newsletterLike
          ? unsubscribeLinkFor(recipient)
          : "";

        const htmlForRecipient = newsletterLike
          ? html.replace(
              "</div>\n              </td>",
              `<div style="height:8px;"></div>
       <div style="text-align:center;font-size:11px;line-height:1.6;color:rgba(0,0,0,0.55);">
         <a href="${recipientUnsubscribeLink}" style="color:rgba(0,0,0,0.72);font-weight:900;">Unsubscribe from marketing emails</a>
       </div>
       </div>
              </td>`,
            )
          : html;

        if (newsletterLike) {
          headers["List-Unsubscribe"] = `<${recipientUnsubscribeLink}>`;
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
          headers,
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
        meta: {
          created_from: "next_api_mail_console_send",
          admin_email: adminEmail,
          sender_email: senderRow.from_email,
          recipient_count: recipients.length,
          attachment_count: attachments.length,
          link_only_count: linkOnlyFiles.length,
          summary,
        },
      })
      .eq("id", campaignId);

    return NextResponse.json({
      ok: summary.sent > 0,
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
