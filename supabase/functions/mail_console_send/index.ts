// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "supabase";

type MailMode = "support" | "newsletter" | "advert" | "investor";
type ImagePosition = "none" | "top" | "bottom" | "both";
type ReplyMode = "reply_enabled" | "no_reply";

type RecipientInput = {
  email?: unknown;
  name?: unknown;
};

type SendBody = {
  mode?: unknown;
  sender_identity_id?: unknown;

  // You can send either:
  // to: "email@example.com"
  // to: ["a@example.com", "b@example.com"]
  // recipients: [{ email, name }]
  to?: unknown;
  recipients?: unknown;

  subject?: unknown;
  title?: unknown;
  subtitle?: unknown;
  badge?: unknown;

  // Plain text message or rich HTML message.
  message?: unknown;
  message_text?: unknown;
  message_html?: unknown;
  body_text?: unknown;
  body_html?: unknown;

  image_url?: unknown;
  image_position?: unknown;

  cta_label?: unknown;
  cta_url?: unknown;

  reply_mode?: unknown;

  // Optional metadata from dashboard.
  meta?: unknown;
};

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEFAULT_LOGO_URL =
  "https://ipognlibpkbauusvfeic.supabase.co/storage/v1/object/public/public-assets/stayknown-logo.png";

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function mustEnv(name: string): string {
  const v = Deno.env.get(name);
  if (!v || !v.trim()) {
    throw new Error(`Missing env var: ${name}`);
  }
  return v.trim();
}

function optionalEnv(...names: string[]): string {
  for (const name of names) {
    const v = Deno.env.get(name);
    if (v && v.trim()) return v.trim();
  }
  return "";
}

function safeTrim(v: unknown): string {
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

function normalizeEmail(v: unknown): string {
  return safeTrim(v).toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function safeMode(v: unknown): MailMode {
  const s = safeTrim(v).toLowerCase();
  if (s === "newsletter") return "newsletter";
  if (s === "advert") return "advert";
  if (s === "investor") return "investor";
  return "support";
}

function safeImagePosition(v: unknown): ImagePosition {
  const s = safeTrim(v).toLowerCase();
  if (s === "top" || s === "bottom" || s === "both") return s;
  return "none";
}

function safeReplyMode(v: unknown, mode: MailMode): ReplyMode {
  const s = safeTrim(v).toLowerCase();
  if (s === "no_reply") return "no_reply";

  if (mode === "newsletter" || mode === "advert") {
    return "no_reply";
  }

  return "reply_enabled";
}

function isPublicHttpUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch (_) {
    return false;
  }
}

function cleanBasicHtml(raw: string): string {
  // This is not a full sanitizer, but it removes the dangerous things
  // we do not want inside an email body.
  return raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "");
}

function textToHtml(text: string): string {
  const clean = text.trim();
  if (!clean) return "";

  return clean
    .split(/\n{2,}/)
    .map((para) => {
      const lines = para
        .split(/\n/)
        .map((line) => escapeHtml(line))
        .join("<br/>");

      return `<p style="margin:0 0 14px 0; font-size:15px; line-height:1.75; color:rgba(0,0,0,0.82);">${lines}</p>`;
    })
    .join("");
}

function htmlToText(html: string): string {
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

function parseRecipients(
  body: SendBody,
): Array<{ email: string; name: string }> {
  const out: Array<{ email: string; name: string }> = [];

  const addEmail = (emailValue: unknown, nameValue?: unknown) => {
    const email = normalizeEmail(emailValue);
    if (!email || !isValidEmail(email)) return;

    out.push({
      email,
      name: safeTrim(nameValue),
    });
  };

  if (typeof body.to === "string") {
    body.to
      .split(/[,\n;]/)
      .map((x) => x.trim())
      .filter(Boolean)
      .forEach((email) => addEmail(email));
  }

  if (Array.isArray(body.to)) {
    body.to.forEach((email) => addEmail(email));
  }

  if (Array.isArray(body.recipients)) {
    body.recipients.forEach((r: RecipientInput) => {
      if (r && typeof r === "object") {
        addEmail(r.email, r.name);
      }
    });
  }

  const seen = new Set<string>();
  return out.filter((r) => {
    if (seen.has(r.email)) return false;
    seen.add(r.email);
    return true;
  });
}

function getLogoUrl(): string {
  return (
    optionalEnv("BRAND_LOGO_URL", "MAIL_CONSOLE_LOGO_URL") || DEFAULT_LOGO_URL
  );
}

function trademarkHtml(appName: string) {
  const serviceLine = "A 6 Clement Joshua service\u2122";

  return `
    <div style="text-align:center; margin:0 0 10px 0;">
      <div style="font-size:12px; font-weight:950; letter-spacing:2.6px; color:rgba(0,0,0,0.78);">
        ${escapeHtml(appName)}\u2122
      </div>
      <div style="height:6px;"></div>
      <div style="font-size:11px; font-weight:900; letter-spacing:1.6px; color:rgba(0,0,0,0.58);">
        ${escapeHtml(serviceLine)}
      </div>
      <div style="height:10px;"></div>
    </div>
  `;
}

function brandLogoHtml(appName: string) {
  const logo = getLogoUrl();

  return `
    ${trademarkHtml(appName)}
    <div style="text-align:center; margin:0 0 10px 0;">
      <img src="${escapeHtml(logo)}" width="64" height="64" alt="${escapeHtml(appName)}"
        style="display:inline-block; border-radius:18px; box-shadow:0 14px 38px rgba(0,0,0,0.14);" />
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
      box-shadow:inset 0 1px 0 rgba(255,255,255,0.85), 0 10px 30px rgba(0,0,0,0.06);
      font-size:12px;
      font-weight:800;
      letter-spacing:0.6px;
      color:#111;
    ">${escapeHtml(text)}</span>
  `;
}

function imageBlock(url: string, alt: string) {
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
        style="display:block; width:100%; max-height:420px; object-fit:cover;" />
    </div>
  `;
}

function ctaButton(label: string, url: string) {
  if (!label || !url || !isPublicHttpUrl(url)) return "";

  return `
    <div style="text-align:center; margin-top:18px; margin-bottom:4px;">
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
        box-shadow:inset 0 1px 0 rgba(255,255,255,0.92), 0 20px 55px rgba(0,0,0,0.08);
      ">${escapeHtml(label)}</a>
    </div>
  `;
}

function dividerHtml() {
  return `<div style="height:1px; background:rgba(0,0,0,0.08); margin:18px 0;"></div>`;
}

function emailShell(p: {
  appName: string;
  title: string;
  subtitle?: string;
  badge?: string;
  contentHtml: string;
  footerHtml?: string;
}) {
  const badge = p.badge
    ? `<div style="text-align:center; margin:10px 0 0 0;">${pill(p.badge)}</div>`
    : "";

  const subtitle = p.subtitle
    ? `<div style="text-align:center; margin:10px 0 0 0; font-size:13px; color:rgba(0,0,0,0.65); line-height:1.55;">${escapeHtml(p.subtitle)}</div>`
    : "";

  const year = new Date().getFullYear();
  const serviceLine = "A 6 Clement Joshua service\u2122";
  const legalLine = `\u00A9 ${year} ${p.appName}\u2122 \u00B7 ${serviceLine}`;

  return `
  <div style="margin:0; padding:0; background:#f3f4f6;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f3f4f6; padding:26px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="560" style="width:560px; max-width:100%;">
            <tr>
              <td style="padding:10px 6px;">
                ${brandLogoHtml(p.appName)}

                <div style="text-align:center; font-size:18px; font-weight:950; letter-spacing:0.6px; color:#0b0b0b; line-height:1.35;">
                  ${escapeHtml(p.title)}
                </div>

                ${badge}
                ${subtitle}

                <div style="height:18px;"></div>

                <div style="
                  border-radius:22px;
                  border:1px solid rgba(0,0,0,0.10);
                  background:rgba(255,255,255,0.78);
                  box-shadow:inset 0 1px 0 rgba(255,255,255,0.92), 0 28px 75px rgba(0,0,0,0.09);
                  overflow:hidden;
                ">
                  <div style="padding:18px 20px;">
                    ${p.contentHtml}
                  </div>
                </div>

                <div style="height:14px;"></div>

                <div style="text-align:center; font-size:11px; color:rgba(0,0,0,0.55); line-height:1.5;">
                  ${p.footerHtml ?? `This message was sent by ${escapeHtml(p.appName)}.`}
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

function unsubscribeUrlFor(email: string, campaignId: string) {
  const base = optionalEnv(
    "MAIL_CONSOLE_UNSUBSCRIBE_BASE_URL",
    "PUBLIC_UNSUBSCRIBE_BASE_URL",
  );

  if (!base || !isPublicHttpUrl(base)) return "";

  const u = new URL(base);
  u.searchParams.set("email", email);
  u.searchParams.set("campaign_id", campaignId);
  return u.toString();
}

function buildFooterHtml(p: {
  appName: string;
  mode: MailMode;
  replyMode: ReplyMode;
  fromEmail: string;
  replyToEmail: string;
  recipientEmail: string;
  campaignId: string;
}) {
  const unsubscribeUrl =
    p.mode === "newsletter" || p.mode === "advert"
      ? unsubscribeUrlFor(p.recipientEmail, p.campaignId)
      : "";

  if (p.mode === "newsletter" || p.mode === "advert") {
    const unsubscribeLine = unsubscribeUrl
      ? `<a href="${escapeHtml(unsubscribeUrl)}" style="color:rgba(0,0,0,0.72); font-weight:800;">Unsubscribe</a>`
      : `Unsubscribe link will be available from the mail console public page.`;

    return `
      You received this message from ${escapeHtml(p.appName)} because your email was added to a StayKnown communication list.
      <div style="height:6px;"></div>
      This newsletter inbox may not be monitored. For support, contact support@stay-known.com.
      <div style="height:6px;"></div>
      ${unsubscribeLine}
    `;
  }

  if (p.replyMode === "reply_enabled") {
    return `
      You can reply directly to this email.
      <div style="height:6px;"></div>
      Sent from ${escapeHtml(p.fromEmail)}${p.replyToEmail ? ` · Replies go to ${escapeHtml(p.replyToEmail)}` : ""}.
    `;
  }

  return `
    This message was sent by ${escapeHtml(p.appName)}.
    <div style="height:6px;"></div>
    Please contact support@stay-known.com if you need help.
  `;
}

function buildBrandedEmailHtml(p: {
  appName: string;
  mode: MailMode;
  title: string;
  subtitle: string;
  badge: string;
  messageHtml: string;
  imageUrl: string;
  imagePosition: ImagePosition;
  ctaLabel: string;
  ctaUrl: string;
  footerHtml: string;
}) {
  const topImage =
    p.imagePosition === "top" || p.imagePosition === "both"
      ? imageBlock(p.imageUrl, p.title)
      : "";

  const bottomImage =
    p.imagePosition === "bottom" || p.imagePosition === "both"
      ? imageBlock(p.imageUrl, p.title)
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
    ${topImage}

    <div style="font-size:15px; line-height:1.75; color:rgba(0,0,0,0.82);">
      ${p.messageHtml}
    </div>

    ${cta ? `${dividerHtml()}${cta}` : ""}

    ${bottomImage}

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
    footerHtml: p.footerHtml,
  });
}

async function resendSend(params: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  headers?: Record<string, string>;
}) {
  const payload: Record<string, unknown> = {
    from: params.from,
    to: [params.to],
    subject: params.subject,
    html: params.html,
    text: params.text,
  };

  if (params.replyTo) {
    payload.reply_to = params.replyTo;
  }

  if (params.headers && Object.keys(params.headers).length > 0) {
    payload.headers = params.headers;
  }

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await r.json().catch(() => ({}));

  if (!r.ok) {
    throw new Error(
      `Resend failed: ${r.status} ${r.statusText} :: ${JSON.stringify(data)}`,
    );
  }

  return data;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
  }

  let campaignId: string | null = null;

  try {
    const SUPABASE_URL = mustEnv("SUPABASE_URL");
    const SUPABASE_ANON_KEY = mustEnv("SUPABASE_ANON_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = mustEnv("SUPABASE_SERVICE_ROLE_KEY");
    const RESEND_API_KEY = mustEnv("RESEND_API_KEY");

    const authHeader = req.headers.get("Authorization") ?? "";

    if (!authHeader.toLowerCase().startsWith("bearer ")) {
      return jsonResponse({ ok: false, error: "Missing authorization" }, 401);
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();

    if (userErr || !user) {
      return jsonResponse({ ok: false, error: "Invalid login session" }, 401);
    }

    const userEmail = normalizeEmail(user.email);

    const { data: adminRow, error: adminErr } = await admin
      .from("mail_console_admins")
      .select("id,user_id,email,role,is_active")
      .or(`user_id.eq.${user.id},email.eq.${userEmail}`)
      .eq("is_active", true)
      .maybeSingle();

    if (adminErr) {
      throw new Error(`Admin check failed: ${adminErr.message}`);
    }

    if (!adminRow) {
      return jsonResponse(
        { ok: false, error: "You are not allowed to use the mail console" },
        403,
      );
    }

    const body = (await req.json().catch(() => ({}))) as SendBody;

    const mode = safeMode(body.mode);
    const senderIdentityId = safeTrim(body.sender_identity_id);

    if (!senderIdentityId) {
      return jsonResponse(
        { ok: false, error: "sender_identity_id is required" },
        400,
      );
    }

    const recipients = parseRecipients(body);

    if (recipients.length === 0) {
      return jsonResponse(
        { ok: false, error: "At least one valid recipient is required" },
        400,
      );
    }

    // First version safety limit.
    // We can later add queue/batch sending for bigger newsletter lists.
    if (recipients.length > 50) {
      return jsonResponse(
        {
          ok: false,
          error:
            "This first mail console sender supports up to 50 recipients per send. We will add batch sending next.",
        },
        400,
      );
    }

    const subject = safeTrim(body.subject);

    if (!subject) {
      return jsonResponse({ ok: false, error: "Subject is required" }, 400);
    }

    if (subject.length > 180) {
      return jsonResponse(
        {
          ok: false,
          error: "Subject is too long. Keep it under 180 characters.",
        },
        400,
      );
    }

    const rawHtml = safeTrim(body.message_html) || safeTrim(body.body_html);

    const rawText =
      safeTrim(body.message_text) ||
      safeTrim(body.body_text) ||
      safeTrim(body.message);

    const messageHtml = rawHtml ? cleanBasicHtml(rawHtml) : textToHtml(rawText);

    if (!messageHtml.trim()) {
      return jsonResponse(
        { ok: false, error: "Message body is required" },
        400,
      );
    }

    const imageUrl = safeTrim(body.image_url);
    const imagePosition = imageUrl
      ? safeImagePosition(body.image_position)
      : "none";

    if (imageUrl && !isPublicHttpUrl(imageUrl)) {
      return jsonResponse(
        { ok: false, error: "image_url must be a public http/https URL" },
        400,
      );
    }

    const ctaLabel = safeTrim(body.cta_label);
    const ctaUrl = safeTrim(body.cta_url);

    if (ctaUrl && !isPublicHttpUrl(ctaUrl)) {
      return jsonResponse(
        { ok: false, error: "cta_url must be a public http/https URL" },
        400,
      );
    }

    const replyMode = safeReplyMode(body.reply_mode, mode);

    const { data: sender, error: senderErr } = await admin
      .from("mail_console_sender_identities")
      .select(
        "id,label,from_name,from_email,reply_to_email,purpose,can_send_support,can_send_newsletter,is_active",
      )
      .eq("id", senderIdentityId)
      .eq("is_active", true)
      .maybeSingle();

    if (senderErr) {
      throw new Error(`Sender query failed: ${senderErr.message}`);
    }

    if (!sender) {
      return jsonResponse(
        { ok: false, error: "Selected sender was not found or is inactive" },
        400,
      );
    }

    const canSendSupport =
      sender.can_send_support === true &&
      (mode === "support" || mode === "investor");

    const canSendNewsletter =
      sender.can_send_newsletter === true &&
      (mode === "newsletter" || mode === "advert");

    if (!canSendSupport && !canSendNewsletter) {
      return jsonResponse(
        {
          ok: false,
          error:
            "Selected sender is not allowed for this email mode. Choose another sender.",
        },
        400,
      );
    }

    const appName = optionalEnv("MAIL_CONSOLE_APP_NAME") || "StayKnown";

    const title =
      safeTrim(body.title) ||
      (mode === "newsletter"
        ? "StayKnown Newsletter"
        : mode === "advert"
          ? "StayKnown Announcement"
          : mode === "investor"
            ? "StayKnown Investor Update"
            : "StayKnown Support");

    const subtitle = safeTrim(body.subtitle);

    const badge =
      safeTrim(body.badge) ||
      (mode === "newsletter"
        ? "NEWSLETTER"
        : mode === "advert"
          ? "ANNOUNCEMENT"
          : mode === "investor"
            ? "INVESTOR"
            : "SUPPORT");

    const campaignMeta =
      body.meta && typeof body.meta === "object" && !Array.isArray(body.meta)
        ? body.meta
        : {};

    const { data: campaign, error: campaignErr } = await admin
      .from("mail_console_campaigns")
      .insert({
        mode,
        sender_identity_id: sender.id,
        title,
        subject,
        body_html: messageHtml,
        body_text: rawText || htmlToText(messageHtml),
        image_url: imageUrl || null,
        image_position: imagePosition,
        cta_label: ctaLabel || null,
        cta_url: ctaUrl || null,
        reply_mode: replyMode,
        status: "sending",
        created_by: user.id,
        meta: {
          ...campaignMeta,
          created_from: "mail_console_send_edge_function",
          sender_email: sender.from_email,
          sender_label: sender.label,
          requested_recipient_count: recipients.length,
        },
      })
      .select("id")
      .single();

    if (campaignErr || !campaign) {
      throw new Error(
        `Campaign insert failed: ${campaignErr?.message ?? "unknown error"}`,
      );
    }

    campaignId = safeTrim(campaign.id);

    if (!campaignId) {
      throw new Error("Campaign ID was not returned after insert");
    }

    const activeCampaignId = campaignId;

    const newsletterLike = mode === "newsletter" || mode === "advert";

    const summary = {
      requested: recipients.length,
      sent: 0,
      failed: 0,
      skipped: 0,
      results: [] as Array<Record<string, unknown>>,
    };

    for (const recipient of recipients) {
      let campaignRecipientId: string | null = null;
      let logId: number | null = null;

      try {
        if (newsletterLike) {
          const { data: unsub } = await admin
            .from("mail_console_unsubscribes")
            .select("id")
            .eq("email", recipient.email)
            .maybeSingle();

          if (unsub) {
            summary.skipped += 1;
            summary.results.push({
              email: recipient.email,
              status: "skipped",
              reason: "unsubscribed",
            });

            await admin.from("mail_console_campaign_recipients").insert({
              campaign_id: campaignId,
              email: recipient.email,
              name: recipient.name || null,
              status: "skipped",
              error: "Recipient is unsubscribed",
            });

            await admin.from("mail_console_send_logs").insert({
              campaign_id: campaignId,
              sender_identity_id: sender.id,
              mode,
              recipient_email: recipient.email,
              subject,
              status: "skipped",
              error: "Recipient is unsubscribed",
              meta: {
                reason: "unsubscribed",
              },
            });

            continue;
          }
        }

        const { data: cr, error: crErr } = await admin
          .from("mail_console_campaign_recipients")
          .insert({
            campaign_id: campaignId,
            email: recipient.email,
            name: recipient.name || null,
            status: "queued",
            meta: {
              mode,
            },
          })
          .select("id")
          .single();

        if (crErr || !cr) {
          throw new Error(
            `Campaign recipient insert failed: ${
              crErr?.message ?? "unknown error"
            }`,
          );
        }

        campaignRecipientId = cr.id;

        const { data: logRow, error: logErr } = await admin
          .from("mail_console_send_logs")
          .insert({
            campaign_id: campaignId,
            sender_identity_id: sender.id,
            mode,
            recipient_email: recipient.email,
            subject,
            status: "queued",
            meta: {
              recipient_name: recipient.name || null,
              reply_mode: replyMode,
              image_position: imagePosition,
              has_image: Boolean(imageUrl),
              has_cta: Boolean(ctaLabel && ctaUrl),
            },
          })
          .select("id")
          .single();

        if (logErr || !logRow) {
          throw new Error(
            `Send log insert failed: ${logErr?.message ?? "unknown error"}`,
          );
        }

        logId = Number(logRow.id);

        const replyTo =
          replyMode === "reply_enabled"
            ? safeTrim(sender.reply_to_email) || safeTrim(sender.from_email)
            : "";

        const footerHtml = buildFooterHtml({
          appName,
          mode,
          replyMode,
          fromEmail: safeTrim(sender.from_email),
          replyToEmail: replyTo,
          recipientEmail: recipient.email,
          campaignId: activeCampaignId,
        });

        const html = buildBrandedEmailHtml({
          appName,
          mode,
          title,
          subtitle,
          badge,
          messageHtml,
          imageUrl,
          imagePosition,
          ctaLabel,
          ctaUrl,
          footerHtml,
        });

        const text = rawText || htmlToText(html);

        const from = `${safeTrim(sender.from_name)} <${safeTrim(
          sender.from_email,
        )}>`;

        const headers: Record<string, string> = {};

        const unsubUrl = newsletterLike
          ? unsubscribeUrlFor(recipient.email, activeCampaignId)
          : "";

        if (unsubUrl) {
          headers["List-Unsubscribe"] = `<${unsubUrl}>`;
        }

        const resendResult = await resendSend({
          apiKey: RESEND_API_KEY,
          from,
          to: recipient.email,
          subject,
          html,
          text,
          replyTo: replyTo || undefined,
          headers,
        });

        const resendEmailId =
          safeTrim((resendResult as any)?.id) ||
          safeTrim((resendResult as any)?.data?.id);

        await admin
          .from("mail_console_campaign_recipients")
          .update({
            status: "sent",
            resend_email_id: resendEmailId || null,
            sent_at: new Date().toISOString(),
            meta: {
              resend: resendResult,
            },
          })
          .eq("id", campaignRecipientId);

        await admin
          .from("mail_console_send_logs")
          .update({
            status: "sent",
            resend_email_id: resendEmailId || null,
            sent_at: new Date().toISOString(),
            meta: {
              recipient_name: recipient.name || null,
              reply_mode: replyMode,
              image_position: imagePosition,
              has_image: Boolean(imageUrl),
              has_cta: Boolean(ctaLabel && ctaUrl),
              resend: resendResult,
            },
          })
          .eq("id", logId);

        summary.sent += 1;
        summary.results.push({
          email: recipient.email,
          status: "sent",
          resend_email_id: resendEmailId || null,
        });
      } catch (sendErr) {
        const errText =
          sendErr instanceof Error ? sendErr.message : String(sendErr);

        summary.failed += 1;
        summary.results.push({
          email: recipient.email,
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
        } else if (campaignId) {
          await admin.from("mail_console_campaign_recipients").insert({
            campaign_id: campaignId,
            email: recipient.email,
            name: recipient.name || null,
            status: "failed",
            error: errText,
          });
        }

        if (logId !== null) {
          await admin
            .from("mail_console_send_logs")
            .update({
              status: "failed",
              error: errText,
            })
            .eq("id", logId);
        } else if (campaignId) {
          await admin.from("mail_console_send_logs").insert({
            campaign_id: campaignId,
            sender_identity_id: sender.id,
            mode,
            recipient_email: recipient.email,
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
          ...campaignMeta,
          created_from: "mail_console_send_edge_function",
          sender_email: sender.from_email,
          sender_label: sender.label,
          requested_recipient_count: recipients.length,
          summary,
        },
      })
      .eq("id", campaignId);

    return jsonResponse({
      ok: summary.sent > 0,
      campaign_id: campaignId,
      mode,
      sender: {
        label: sender.label,
        from_email: sender.from_email,
      },
      summary,
    });
  } catch (e) {
    const errText = e instanceof Error ? e.message : String(e);

    try {
      if (campaignId) {
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (SUPABASE_URL && SERVICE_ROLE) {
          const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
            auth: { persistSession: false },
          });

          await admin
            .from("mail_console_campaigns")
            .update({
              status: "failed",
              meta: {
                fatal_error: errText,
              },
            })
            .eq("id", campaignId);
        }
      }
    } catch (_) {}

    return jsonResponse(
      {
        ok: false,
        error: errText,
      },
      500,
    );
  }
});
