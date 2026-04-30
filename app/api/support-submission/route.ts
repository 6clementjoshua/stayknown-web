import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type SubmissionType = "support_request" | "feature_request" | "contact_message";
type Priority = "low" | "normal" | "high" | "urgent";

const DEFAULT_LOGO_URL =
  "https://ipognlibpkbauusvfeic.supabase.co/storage/v1/object/public/public-assets/stayknown-logo.png";

function env(name: string, fallback = "") {
  return (process.env[name] || fallback).trim();
}

function mustEnv(name: string) {
  const value = env(name);
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

function safeTrim(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanEmail(value: unknown) {
  return safeTrim(value).toLowerCase();
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function clampSubmissionType(value: unknown): SubmissionType {
  const v = safeTrim(value).toLowerCase();

  if (
    v === "support_request" ||
    v === "feature_request" ||
    v === "contact_message"
  ) {
    return v;
  }

  throw new Error("Invalid submission type.");
}

function clampPriority(value: unknown): Priority {
  const v = safeTrim(value).toLowerCase();

  if (v === "low" || v === "normal" || v === "high" || v === "urgent") {
    return v;
  }

  return "normal";
}

function clampText(value: unknown, max: number) {
  return safeTrim(value).slice(0, max);
}

function typeLabel(type: SubmissionType) {
  if (type === "feature_request") return "App Feature Request";
  if (type === "contact_message") return "Contact Message";
  return "Support Request";
}

function priorityLabel(priority: Priority) {
  if (priority === "urgent") return "Urgent";
  if (priority === "high") return "High";
  if (priority === "low") return "Low";
  return "Normal";
}

function appBaseUrl() {
  return env("SITE_BASE_URL", "https://stay-known.com").replace(/\/+$/g, "");
}

function logoUrl() {
  return env("BRAND_LOGO_URL", DEFAULT_LOGO_URL);
}

async function resendSend(params: {
  to: string[];
  subject: string;
  html: string;
}) {
  const apiKey = mustEnv("RESEND_API_KEY");
  const from = mustEnv("RESEND_FROM");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      `Resend failed: ${response.status} ${response.statusText} ${JSON.stringify(
        data,
      )}`,
    );
  }

  return data;
}

function shell(params: {
  title: string;
  subtitle: string;
  contentHtml: string;
}) {
  const year = new Date().getFullYear();
  const base = appBaseUrl();

  return `
  <div style="margin:0; padding:0; background:#f3f4f6;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f3f4f6; padding:26px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="560" style="width:560px; max-width:560px;">
            <tr>
              <td style="padding:10px 6px;">
                <div style="text-align:center; margin:0 0 8px 0;">
                  <div style="font-size:12px; font-weight:950; letter-spacing:2.6px; color:rgba(0,0,0,0.78);">
                    STAYKNOWN™
                  </div>
                  <div style="height:10px;"></div>
                  <img src="${escapeHtml(logoUrl())}" width="64" height="64" alt="StayKnown"
                    style="display:inline-block; border-radius:18px; box-shadow:0 14px 38px rgba(0,0,0,0.14);" />
                </div>

                <div style="text-align:center; font-size:18px; font-weight:950; letter-spacing:0.4px; color:#0b0b0b;">
                  ${escapeHtml(params.title)}
                </div>

                <div style="margin-top:8px; text-align:center; font-size:13px; color:rgba(0,0,0,0.66); line-height:1.6;">
                  ${escapeHtml(params.subtitle)}
                </div>

                <div style="height:16px;"></div>

                <div style="
                  border-radius:22px;
                  border:1px solid rgba(0,0,0,0.10);
                  background:rgba(255,255,255,0.78);
                  box-shadow: inset 0 1px 0 rgba(255,255,255,0.92), 0 28px 75px rgba(0,0,0,0.09);
                  overflow:hidden;
                ">
                  <div style="padding:18px 20px;">
                    ${params.contentHtml}
                  </div>
                </div>

                <div style="height:14px;"></div>

                <div style="text-align:center; font-size:11px; color:rgba(0,0,0,0.55); line-height:1.7;">
                  <a href="${base}/privacy" style="color:rgba(0,0,0,0.68); text-decoration:none; font-weight:800;">Privacy</a>
                  <span style="padding:0 6px;">•</span>
                  <a href="${base}/terms" style="color:rgba(0,0,0,0.68); text-decoration:none; font-weight:800;">Terms</a>
                  <span style="padding:0 6px;">•</span>
                  <a href="${base}/safety" style="color:rgba(0,0,0,0.68); text-decoration:none; font-weight:800;">Safety</a>
                  <span style="padding:0 6px;">•</span>
                  <a href="${base}/acceptable-use" style="color:rgba(0,0,0,0.68); text-decoration:none; font-weight:800;">Acceptable Use</a>

                  <div style="height:8px;"></div>

                  This message was sent by StayKnown for support, safety, and product-improvement communication.
                  <div style="height:6px;"></div>
                  <span style="color:rgba(0,0,0,0.52);">© ${year} StayKnown™ · A 6 Clement Joshua service™</span>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>`;
}

function card(title: string, body: string) {
  return `
    <div style="
      margin-top:12px;
      padding:14px 14px;
      border-radius:18px;
      border:1px solid rgba(0,0,0,0.10);
      background:rgba(255,255,255,0.72);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.85), 0 18px 50px rgba(0,0,0,0.06);
      color:rgba(0,0,0,0.76);
      font-size:13px;
      line-height:1.65;
    ">
      <div style="font-weight:900; margin-bottom:6px;">${escapeHtml(title)}</div>
      <div>${body}</div>
    </div>
  `;
}

function badge(text: string) {
  return `
    <span style="
      display:inline-block;
      padding:7px 10px;
      border-radius:999px;
      border:1px solid rgba(0,0,0,0.10);
      background:rgba(0,0,0,0.04);
      font-size:11px;
      font-weight:900;
      letter-spacing:0.4px;
      color:rgba(0,0,0,0.72);
      margin:0 5px 6px 0;
    ">${escapeHtml(text)}</span>
  `;
}

function detailRow(label: string, value: unknown) {
  const clean = safeTrim(value);
  if (!clean) return "";

  return `
    <tr>
      <td style="padding:7px 0; width:150px; color:rgba(0,0,0,0.52); font-size:12px; font-weight:850; vertical-align:top;">
        ${escapeHtml(label)}
      </td>
      <td style="padding:7px 0; color:rgba(0,0,0,0.82); font-size:13px; font-weight:700; line-height:1.55;">
        ${escapeHtml(clean)}
      </td>
    </tr>
  `;
}

function supportCopyHtml(p: {
  id: string;
  submissionType: SubmissionType;
  fullName: string;
  email: string;
  stayknownUsername: string;
  accountEmail: string;
  category: string;
  priority: Priority;
  subject: string;
  message: string;
  appPlatform: string;
  appVersion: string;
  deviceInfo: string;
  relatedPolicy: string;
  consentToContact: boolean;
  createdAt: string;
}) {
  const content = `
    <div style="font-size:13px; color:rgba(0,0,0,0.78); line-height:1.7;">
      <div>
        A new <b>${escapeHtml(typeLabel(p.submissionType))}</b> was submitted from the StayKnown website.
      </div>

      <div style="height:12px;"></div>

      ${badge(typeLabel(p.submissionType))}
      ${badge(`Priority: ${priorityLabel(p.priority)}`)}
      ${p.category ? badge(`Category: ${p.category}`) : ""}
      ${p.relatedPolicy ? badge(`Policy: ${p.relatedPolicy}`) : ""}

      ${card(
        "Submission summary",
        `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${detailRow("Submission ID", p.id)}
          ${detailRow("Subject", p.subject)}
          ${detailRow("Name", p.fullName || "Not provided")}
          ${detailRow("Email", p.email)}
          ${detailRow("StayKnown username", p.stayknownUsername)}
          ${detailRow("Account email", p.accountEmail)}
          ${detailRow("App platform", p.appPlatform)}
          ${detailRow("App version", p.appVersion)}
          ${detailRow("Device info", p.deviceInfo)}
          ${detailRow("Consent to contact", p.consentToContact ? "Yes" : "No")}
          ${detailRow("Submitted at", p.createdAt)}
        </table>
        `,
      )}

      ${card(
        "Message",
        `<div style="white-space:pre-wrap;">${escapeHtml(p.message)}</div>`,
      )}

      ${card(
        "Safety and misuse reminder",
        `Review this submission for spam, threats, illegal requests, impersonation, fraud, attempts to bypass safety systems, abusive language, or urgent safety concerns before replying.`,
      )}
    </div>
  `;

  return shell({
    title: `New ${typeLabel(p.submissionType)}`,
    subtitle:
      "A website form submission was saved and copied to StayKnown support.",
    contentHtml: content,
  });
}

function userConfirmationHtml(p: {
  id: string;
  submissionType: SubmissionType;
  fullName: string;
  email: string;
  category: string;
  priority: Priority;
  subject: string;
  message: string;
  createdAt: string;
}) {
  const content = `
    <div style="font-size:13px; color:rgba(0,0,0,0.78); line-height:1.7;">
      <div>
        Thank you${p.fullName ? `, <b>${escapeHtml(p.fullName)}</b>` : ""}. StayKnown received your <b>${escapeHtml(
          typeLabel(p.submissionType),
        )}</b>.
      </div>

      ${card(
        "What happens next",
        `Our team will review your submission. If your message needs a reply and you allowed contact, we may respond using the email address you provided. Please do not submit duplicate requests unless you need to add important new information.`,
      )}

      ${card(
        "Your submission details",
        `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${detailRow("Submission ID", p.id)}
          ${detailRow("Type", typeLabel(p.submissionType))}
          ${detailRow("Priority", priorityLabel(p.priority))}
          ${detailRow("Category", p.category)}
          ${detailRow("Subject", p.subject)}
          ${detailRow("Submitted at", p.createdAt)}
        </table>
        `,
      )}

      ${card(
        "Your message summary",
        `<div style="white-space:pre-wrap;">${escapeHtml(p.message.slice(0, 1200))}${
          p.message.length > 1200 ? "…" : ""
        }</div>`,
      )}

      ${card(
        "Important safety notice",
        `StayKnown forms must not be used for threats, harassment, fake emergencies, spam, illegal requests, impersonation, payment fraud, or requests to bypass safety systems. Misuse may lead to review, restriction, preservation of records, or lawful reporting where appropriate.`,
      )}
    </div>
  `;

  return shell({
    title: "StayKnown received your submission",
    subtitle:
      "Your request has been recorded with a confirmation summary for your records.",
    contentHtml: content,
  });
}

function getSupabase() {
  const url = env("SUPABASE_URL", env("NEXT_PUBLIC_SUPABASE_URL"));
  const key = env(
    "SUPABASE_SERVICE_ROLE_KEY",
    env("SUPABASE_ANON_KEY", env("NEXT_PUBLIC_SUPABASE_ANON_KEY")),
  );

  if (!url) throw new Error("Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL");
  if (!key)
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const honeypot = safeTrim(body.website);
    if (honeypot) {
      return Response.json({ ok: true, ignored: true });
    }

    const submissionType = clampSubmissionType(body.submission_type);
    const priority = clampPriority(body.priority);

    const fullName = clampText(body.full_name, 120);
    const email = cleanEmail(body.email);
    const stayknownUsername = clampText(body.stayknown_username, 80);
    const accountEmail = cleanEmail(body.account_email);
    const category = clampText(body.category, 120);
    const subject = clampText(body.subject, 180);
    const message = clampText(body.message, 8000);
    const appPlatform = clampText(body.app_platform, 80);
    const appVersion = clampText(body.app_version, 80);
    const deviceInfo = clampText(body.device_info, 260);
    const relatedPolicy = clampText(body.related_policy, 120);
    const consentToContact = body.consent_to_contact !== false;

    if (!isEmail(email)) {
      return Response.json(
        {
          ok: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 },
      );
    }

    if (accountEmail && !isEmail(accountEmail)) {
      return Response.json(
        {
          ok: false,
          message: "Please enter a valid account email or leave it blank.",
        },
        { status: 400 },
      );
    }

    if (subject.length < 3) {
      return Response.json(
        {
          ok: false,
          message: "Please add a clear subject.",
        },
        { status: 400 },
      );
    }

    if (message.length < 20) {
      return Response.json(
        {
          ok: false,
          message: "Please explain the request with a little more detail.",
        },
        { status: 400 },
      );
    }

    const sb = getSupabase();

    const metadata = {
      user_agent: req.headers.get("user-agent") || "",
      origin: req.headers.get("origin") || "",
      referer: req.headers.get("referer") || "",
      ip_hint:
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "",
      website_route:
        submissionType === "feature_request"
          ? "/submit-feature"
          : submissionType === "contact_message"
            ? "/contact"
            : "/submit-request",
    };

    const { data, error } = await sb
      .from("support_submissions")
      .insert({
        submission_type: submissionType,
        full_name: fullName || null,
        email,
        stayknown_username: stayknownUsername || null,
        account_email: accountEmail || null,
        category: category || null,
        priority,
        subject,
        message,
        app_platform: appPlatform || null,
        app_version: appVersion || null,
        device_info: deviceInfo || null,
        related_policy: relatedPolicy || null,
        consent_to_contact: consentToContact,
        source: "website",
        status: "new",
        metadata,
      })
      .select("id, created_at")
      .single();

    if (error) {
      throw error;
    }

    const submissionId = String(data.id);
    const createdAt = new Date(String(data.created_at)).toLocaleString(
      "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
      },
    );

    const supportTo = env("SUPPORT_TO_EMAIL", "support@stay-known.com");

    const supportHtml = supportCopyHtml({
      id: submissionId,
      submissionType,
      fullName,
      email,
      stayknownUsername,
      accountEmail,
      category,
      priority,
      subject,
      message,
      appPlatform,
      appVersion,
      deviceInfo,
      relatedPolicy,
      consentToContact,
      createdAt,
    });

    const userHtml = userConfirmationHtml({
      id: submissionId,
      submissionType,
      fullName,
      email,
      category,
      priority,
      subject,
      message,
      createdAt,
    });

    await Promise.all([
      resendSend({
        to: [supportTo],
        subject: `StayKnown ${typeLabel(submissionType)}: ${subject}`,
        html: supportHtml,
      }),
      resendSend({
        to: [email],
        subject: `StayKnown received your ${typeLabel(submissionType).toLowerCase()}`,
        html: userHtml,
      }),
    ]);

    return Response.json({
      ok: true,
      submission_id: submissionId,
      message: "Your submission was received.",
    });
  } catch (error) {
    console.error("SUPPORT_SUBMISSION_ERROR", error);

    return Response.json(
      {
        ok: false,
        message:
          "We could not send this right now. Please try again in a moment.",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return Response.json(
    {
      ok: false,
      message: "Method not allowed.",
    },
    { status: 405 },
  );
}
