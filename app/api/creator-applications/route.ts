import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const DEFAULT_SITE_URL = "https://www.stay-known.com";
const DEFAULT_LOGO_URL = `${DEFAULT_SITE_URL}/6logo.png`;
const MEDIA_BUCKET = "creator-application-media";
const CONSENT_VERSION = "creator-application-v1";

const MAX_VIDEO_BYTES = 1 * 1024 * 1024; // 1MB

type FieldMap = Record<string, string>;

function env(name: string, fallback = "") {
  return (process.env[name] || fallback).trim();
}

function mustEnv(name: string) {
  const value = env(name);
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

function appBaseUrl() {
  return env("SITE_BASE_URL", DEFAULT_SITE_URL).replace(/\/+$/g, "");
}

function safeTrim(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanEmail(value: unknown) {
  return safeTrim(value).toLowerCase();
}

function clampText(value: unknown, max: number) {
  return safeTrim(value).slice(0, max);
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

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isSocialOrPortfolioUrl(value: string) {
  if (!value) return false;

  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");

    const allowedHosts = [
      "tiktok.com",
      "facebook.com",
      "instagram.com",
      "youtube.com",
      "youtu.be",
      "x.com",
      "twitter.com",
      "linkedin.com",
      "threads.net",
      "snapchat.com",
      "telegram.me",
      "t.me",
      "vimeo.com",
      "behance.net",
      "linktr.ee",
      "beacons.ai",
      "solo.to",
      "campsite.bio",
    ];

    return allowedHosts.some((allowed) => {
      return host === allowed || host.endsWith(`.${allowed}`);
    });
  } catch {
    return false;
  }
}

function boolFromForm(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return false;
  const v = value.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes" || v === "on";
}

function fileExtFromName(name: string) {
  const clean = name.toLowerCase().split("?")[0] || "";
  const dot = clean.lastIndexOf(".");
  if (dot === -1) return "mp4";
  return clean.slice(dot + 1).replace(/[^a-z0-9]/g, "") || "mp4";
}

function getSupabase() {
  const url = env("SUPABASE_URL", env("NEXT_PUBLIC_SUPABASE_URL"));
  const key = env("SUPABASE_SERVICE_ROLE_KEY");

  if (!url) throw new Error("Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL");
  if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

async function resendSend(params: {
  to: string[];
  subject: string;
  html: string;
}) {
  const apiKey = mustEnv("RESEND_API_KEY");
  const from = env("RESEND_CREATOR_FROM", mustEnv("RESEND_FROM"));

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

function consentText() {
  return `
StayKnown Creator / Influencer Application Consent

By submitting this application, I confirm that all information I provide is true, accurate, current, and submitted under my real identity. I understand that StayKnown may reject, pause, remove, or investigate any application that contains false, misleading, incomplete, copied, stolen, or unverifiable information.

I understand that StayKnown is a safety-focused platform. If I am selected to create content, I am responsible for representing the brand carefully, lawfully, and respectfully. I must not create content that misleads users, encourages unsafe behavior, misrepresents StayKnown features, impersonates another person, violates platform rules, spreads false claims, or damages the StayKnown brand.

I understand that StayKnown may review my submitted social profiles, audience information, video sample, engagement quality, public content history, and application details to decide whether I am suitable for creator, influencer, ambassador, awareness, or campaign opportunities.

I understand that the sample video I upload must be my own content or content I am authorized to submit. Clear HD, 4K, or 8K clips are preferred. Low-quality, blurry, copied, stolen, misleading, or unauthorized samples may be rejected.

I understand that StayKnown does not request identity documents at this public application stage. If I am shortlisted, StayKnown may send me a private verification link and request identity/KYC documents appropriate to my country. My legal name and submitted details must match any future verification documents. If I am not comfortable with future verification, I should not proceed.

I understand that my application information and sample media are collected only for application review, authenticity checks, brand-safety assessment, creator selection, and possible campaign follow-up. StayKnown does not sell my application information.

I understand that StayKnown may store my application details while reviewing the application and may delete sample media after review or when it is no longer needed for application assessment, compliance, security, or lawful recordkeeping.

I agree that StayKnown may contact me using the email, WhatsApp number, Telegram username, StayKnown identity, TikTok handle, or other social links I provide.

I confirm that I have opened and reviewed StayKnown Privacy Policy and Terms of Service before submitting this application.
`.trim();
}

function shell(params: {
  title: string;
  subtitle: string;
  contentHtml: string;
  logoUrl?: string;
}) {
  const year = new Date().getFullYear();
  const base = appBaseUrl();
  const logo = params.logoUrl || DEFAULT_LOGO_URL;

  return `
  <div style="margin:0; padding:0; background:#000000;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#000000; padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="560" style="width:560px; max-width:560px;">
            <tr>
              <td style="padding:10px 6px;">
                <div style="text-align:center; margin:0 0 10px 0;">
                  <img
                    src="${escapeHtml(logo)}"
                    width="64"
                    height="64"
                    alt="StayKnown"
                    style="display:inline-block;width:64px;height:64px;border-radius:16px;background:#ffffff;padding:4px;object-fit:contain;border:1px solid rgba(255,255,255,0.22);box-shadow:0 18px 45px rgba(255,255,255,0.10);"
                  />
                  <div style="height:12px;"></div>
                  <div style="font-size:12px; font-weight:950; letter-spacing:2.8px; color:rgba(255,255,255,0.92);">
                    STAYKNOWN™
                  </div>
                </div>

                <div style="text-align:center; font-size:20px; font-weight:950; letter-spacing:-0.2px; color:#ffffff; line-height:1.25;">
                  ${escapeHtml(params.title)}
                </div>

                <div style="margin-top:9px; text-align:center; font-size:13px; color:rgba(255,255,255,0.58); line-height:1.65;">
                  ${escapeHtml(params.subtitle)}
                </div>

                <div style="height:18px;"></div>

                <div style="
                  border-radius:24px;
                  border:1px solid rgba(255,255,255,0.12);
                  background:rgba(255,255,255,0.055);
                  box-shadow: inset 0 1px 0 rgba(255,255,255,0.10), 0 30px 80px rgba(0,0,0,0.42);
                  overflow:hidden;
                ">
                  <div style="padding:20px 21px;">
                    ${params.contentHtml}
                  </div>
                </div>

                <div style="height:16px;"></div>

                <div style="text-align:center; font-size:11px; color:rgba(255,255,255,0.38); line-height:1.8;">
                  <a href="${base}/privacy" style="color:rgba(255,255,255,0.62); text-decoration:none; font-weight:850;">Privacy</a>
                  <span style="padding:0 6px; color:rgba(255,255,255,0.20);">•</span>
                  <a href="${base}/terms" style="color:rgba(255,255,255,0.62); text-decoration:none; font-weight:850;">Terms</a>
                  <span style="padding:0 6px; color:rgba(255,255,255,0.20);">•</span>
                  <a href="${base}/safety" style="color:rgba(255,255,255,0.62); text-decoration:none; font-weight:850;">Safety</a>
                  <span style="padding:0 6px; color:rgba(255,255,255,0.20);">•</span>
                  <a href="${base}/acceptable-use" style="color:rgba(255,255,255,0.62); text-decoration:none; font-weight:850;">Acceptable Use</a>

                  <div style="height:9px;"></div>

                  This message was sent by StayKnown for creator, influencer, ambassador, campaign, and brand-safety application communication.
                  <div style="height:6px;"></div>
                  <span style="color:rgba(255,255,255,0.35);">© ${year} StayKnown™ · A 6 Clement Joshua service™</span>
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
      border:1px solid rgba(255,255,255,0.11);
      background:rgba(255,255,255,0.055);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 18px 50px rgba(0,0,0,0.22);
      color:rgba(255,255,255,0.72);
      font-size:13px;
      line-height:1.65;
    ">
      <div style="font-weight:950; margin-bottom:6px; color:rgba(255,255,255,0.92);">${escapeHtml(title)}</div>
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
      border:1px solid rgba(255,255,255,0.11);
      background:rgba(255,255,255,0.055);
      font-size:11px;
      font-weight:950;
      letter-spacing:0.4px;
      color:rgba(255,255,255,0.72);
      margin:0 5px 6px 0;
    ">${escapeHtml(text)}</span>
  `;
}

function detailRow(label: string, value: unknown) {
  const clean = safeTrim(value);
  if (!clean) return "";

  return `
    <tr>
      <td style="padding:7px 0; width:165px; color:rgba(255,255,255,0.42); font-size:12px; font-weight:850; vertical-align:top;">
        ${escapeHtml(label)}
      </td>
      <td style="padding:7px 0; color:rgba(255,255,255,0.82); font-size:13px; font-weight:700; line-height:1.55;">
        ${escapeHtml(clean)}
      </td>
    </tr>
  `;
}

function adminEmailHtml(
  p: FieldMap & { createdAt: string; applicationId: string },
) {
  const content = `
    <div style="font-size:13px; color:rgba(255,255,255,0.74); line-height:1.7;">
      <div>
        A new <b style="color:#ffffff;">StayKnown Creator Application</b> was submitted for review.
      </div>

      <div style="height:12px;"></div>

      ${badge("Creator application")}
      ${badge(`Focus: ${p.application_focus}`)}
      ${badge(`Country: ${p.country}`)}
      ${badge(`Platform: ${p.main_platform}`)}

      ${card(
        "Applicant identity",
        `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${detailRow("Application ID", p.applicationId)}
          ${detailRow("Legal full name", p.legal_full_name)}
          ${detailRow("Country", p.country)}
          ${detailRow("State / region", p.state_region)}
          ${detailRow("City", p.city)}
          ${detailRow("Email", p.email)}
          ${detailRow("WhatsApp", p.whatsapp_number)}
          ${detailRow("Telegram", p.telegram_username)}
          ${detailRow("Submitted at", p.createdAt)}
        </table>
        `,
      )}

      ${card(
        "Platform and campaign details",
        `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${detailRow("StayKnown identity", p.stayknown_identity)}
          ${detailRow("TikTok", p.tiktok_handle)}
          ${detailRow("Main platform", p.main_platform)}
          ${detailRow("Audience size", p.audience_size)}
          ${detailRow("Application focus", p.application_focus)}
          ${detailRow("Content language", p.content_language)}
          ${detailRow("Previous campaign", p.previous_campaign_url)}
        </table>
        `,
      )}

      ${card(
        "Social proof links",
        `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${detailRow("Link 1", p.social_proof_link_1)}
          ${detailRow("Link 2", p.social_proof_link_2)}
          ${detailRow("Link 3", p.social_proof_link_3)}
          ${detailRow("Link 4", p.social_proof_link_4)}
        </table>
        `,
      )}

      ${card(
        "Other profiles",
        `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${detailRow("Facebook", p.facebook_url)}
          ${detailRow("Instagram", p.instagram_url)}
          ${detailRow("YouTube", p.youtube_url)}
        </table>
        `,
      )}

      ${card(
        "Reason for applying",
        `<div style="white-space:pre-wrap;">${escapeHtml(p.reason_for_applying)}</div>`,
      )}

      ${
        p.extra_message
          ? card(
              "Extra message",
              `<div style="white-space:pre-wrap;">${escapeHtml(
                p.extra_message,
              )}</div>`,
            )
          : ""
      }

      ${card(
        "Sample video",
        `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${detailRow("Storage path", p.sample_video_path)}
          ${detailRow("Original file", p.sample_video_original_name)}
          ${detailRow("MIME type", p.sample_video_mime)}
          ${detailRow("Size bytes", p.sample_video_size_bytes)}
        </table>
        `,
      )}

      ${card(
        "Review note",
        `The sample video is stored in the private Supabase Storage bucket <b style="color:#ffffff;">creator-application-media</b>. Do not share applicant files outside authorized StayKnown review. If shortlisted, send a private ID/KYC verification link later.`,
      )}
    </div>
  `;

  return shell({
    title: "New creator application",
    subtitle:
      "A creator, influencer, ambassador, or campaign application needs review.",
    contentHtml: content,
  });
}

function applicantEmailHtml(
  p: FieldMap & { createdAt: string; applicationId: string },
) {
  const content = `
    <div style="font-size:13px; color:rgba(255,255,255,0.74); line-height:1.7;">
      <div>
        Thank you, <b style="color:#ffffff;">${escapeHtml(
          p.legal_full_name,
        )}</b>. StayKnown has received your creator application.
      </div>

      ${card(
        "What happens next",
        `Our team will review your application, your selected StayKnown focus area, your public social links, your sample video, and your audience fit. If shortlisted, we may contact you for next steps, including a private identity/KYC verification stage.`,
      )}

      ${card(
        "Your application summary",
        `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${detailRow("Application ID", p.applicationId)}
          ${detailRow("Legal full name", p.legal_full_name)}
          ${detailRow("Country", p.country)}
          ${detailRow("City", p.city)}
          ${detailRow("Email", p.email)}
          ${detailRow("WhatsApp", p.whatsapp_number)}
          ${detailRow("StayKnown identity", p.stayknown_identity)}
          ${detailRow("TikTok", p.tiktok_handle)}
          ${detailRow("Application focus", p.application_focus)}
          ${detailRow("Main platform", p.main_platform)}
          ${detailRow("Audience size", p.audience_size)}
          ${detailRow("Submitted at", p.createdAt)}
        </table>
        `,
      )}

      ${card(
        "Important responsibility notice",
        `StayKnown is a safety-focused platform. Applicants must submit real information and must not use fake identities, stolen content, misleading engagement, copied videos, impersonation, or false claims. If selected, you are expected to represent StayKnown carefully, lawfully, and responsibly.`,
      )}

      ${card(
        "Future verification",
        `Do not send identity documents by email. If you are shortlisted, StayKnown may send a private verification link and request appropriate identity/KYC documents for your country. Your legal name and details must match your submitted application.`,
      )}

      ${card(
        "Privacy and media handling",
        `Your application details and sample video are used for application review, authenticity checks, brand-safety assessment, and possible campaign follow-up. StayKnown does not sell your application information. Sample media may be deleted after review or when no longer needed for assessment, compliance, security, or lawful recordkeeping.`,
      )}
    </div>
  `;

  return shell({
    title: "StayKnown received your application",
    subtitle:
      "Your creator application has been recorded with a confirmation summary for your records.",
    contentHtml: content,
  });
}

function requireField(fields: FieldMap, key: string, label: string, min = 1) {
  const value = fields[key] || "";
  if (value.length < min) {
    throw new Error(`${label} is required.`);
  }
  return value;
}

function validateApplication(fields: FieldMap) {
  requireField(fields, "legal_full_name", "Legal full name", 4);
  requireField(fields, "country", "Country", 2);
  requireField(fields, "city", "City", 2);
  requireField(fields, "email", "Email", 5);
  requireField(fields, "whatsapp_number", "WhatsApp number", 6);
  requireField(
    fields,
    "stayknown_identity",
    "StayKnown username, handle, or email",
    3,
  );
  requireField(fields, "tiktok_handle", "TikTok handle or URL", 2);
  requireField(fields, "main_platform", "Main platform", 2);
  requireField(fields, "audience_size", "Audience size", 1);
  requireField(fields, "application_focus", "Application focus", 3);
  requireField(fields, "reason_for_applying", "Reason for applying", 30);

  if (!isEmail(fields.email)) {
    throw new Error("Please enter a valid email address.");
  }

  const socialProofKeys = [
    "social_proof_link_1",
    "social_proof_link_2",
    "social_proof_link_3",
    "social_proof_link_4",
  ];

  for (const key of socialProofKeys) {
    const value = fields[key];
    if (!value) throw new Error("All 4 social proof links are required.");
    if (!isHttpUrl(value) || !isSocialOrPortfolioUrl(value)) {
      throw new Error(
        "Social proof links must be valid public social/profile links.",
      );
    }
  }

  const optionalUrlKeys = [
    "facebook_url",
    "instagram_url",
    "youtube_url",
    "previous_campaign_url",
  ];

  for (const key of optionalUrlKeys) {
    const value = fields[key];
    if (value && !isHttpUrl(value)) {
      throw new Error(`${key.replaceAll("_", " ")} must be a valid URL.`);
    }
  }
}

function validateConsent(flags: Record<string, boolean>) {
  if (!flags.follows_stayknown) {
    throw new Error("You must confirm that you follow Stay Known.");
  }

  if (!flags.follows_six_clement_joshua) {
    throw new Error("You must confirm that you follow 6 Clement Joshua.");
  }

  if (!flags.privacy_opened) {
    throw new Error("Please open and review the Privacy Policy.");
  }

  if (!flags.terms_opened) {
    throw new Error("Please open and review the Terms of Service.");
  }

  if (!flags.consent_scrolled) {
    throw new Error("Please read the consent box to the end.");
  }

  if (!flags.truth_confirmed) {
    throw new Error(
      "Please confirm that your information is true and accurate.",
    );
  }

  if (!flags.responsibility_accepted) {
    throw new Error("Please accept the creator responsibility terms.");
  }

  if (!flags.contact_permission) {
    throw new Error(
      "Please allow StayKnown to contact you about this application.",
    );
  }

  if (!flags.future_kyc_notice_accepted) {
    throw new Error("Please accept the future verification notice.");
  }

  if (!flags.media_retention_notice_accepted) {
    throw new Error("Please accept the media review and retention notice.");
  }
}

function validateVideo(file: File | null) {
  if (!file) {
    throw new Error("Please upload one sample video.");
  }

  if (!file.type.startsWith("video/")) {
    throw new Error("The sample file must be a video.");
  }

  if (file.size <= 0) {
    throw new Error("The sample video appears to be empty.");
  }

  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error(
      "Sample video must be 1MB or smaller. Please compress your clip and upload a short, clear sample for review.",
    );
  }

  return file;
}

export async function POST(req: Request) {
  let uploadedVideoPath = "";

  try {
    const form = await req.formData();

    const honeypot = safeTrim(form.get("website"));
    if (honeypot) {
      return Response.json({ ok: true, ignored: true });
    }

    const fields: FieldMap = {
      legal_full_name: clampText(form.get("legal_full_name"), 140),
      country: clampText(form.get("country"), 120),
      state_region: clampText(form.get("state_region"), 120),
      city: clampText(form.get("city"), 120),

      email: cleanEmail(form.get("email")),
      whatsapp_number: clampText(form.get("whatsapp_number"), 80),
      telegram_username: clampText(form.get("telegram_username"), 80),

      stayknown_identity: clampText(form.get("stayknown_identity"), 120),
      tiktok_handle: clampText(form.get("tiktok_handle"), 220),
      facebook_url: clampText(form.get("facebook_url"), 500),
      instagram_url: clampText(form.get("instagram_url"), 500),
      youtube_url: clampText(form.get("youtube_url"), 500),

      main_platform: clampText(form.get("main_platform"), 120),
      audience_size: clampText(form.get("audience_size"), 80),
      application_focus: clampText(form.get("application_focus"), 160),
      content_language: clampText(form.get("content_language"), 120),
      previous_campaign_url: clampText(form.get("previous_campaign_url"), 500),
      reason_for_applying: clampText(form.get("reason_for_applying"), 2500),
      extra_message: clampText(form.get("extra_message"), 2000),

      social_proof_link_1: clampText(form.get("social_proof_link_1"), 500),
      social_proof_link_2: clampText(form.get("social_proof_link_2"), 500),
      social_proof_link_3: clampText(form.get("social_proof_link_3"), 500),
      social_proof_link_4: clampText(form.get("social_proof_link_4"), 500),
    };

    const flags = {
      follows_stayknown: boolFromForm(form.get("follows_stayknown")),
      follows_six_clement_joshua: boolFromForm(
        form.get("follows_six_clement_joshua"),
      ),
      privacy_opened: boolFromForm(form.get("privacy_opened")),
      terms_opened: boolFromForm(form.get("terms_opened")),
      consent_scrolled: boolFromForm(form.get("consent_scrolled")),
      truth_confirmed: boolFromForm(form.get("truth_confirmed")),
      responsibility_accepted: boolFromForm(
        form.get("responsibility_accepted"),
      ),
      contact_permission: boolFromForm(form.get("contact_permission")),
      future_kyc_notice_accepted: boolFromForm(
        form.get("future_kyc_notice_accepted"),
      ),
      media_retention_notice_accepted: boolFromForm(
        form.get("media_retention_notice_accepted"),
      ),
    };

    validateApplication(fields);
    validateConsent(flags);

    const videoEntry = form.get("sample_video");
    const videoFile = validateVideo(
      videoEntry instanceof File ? videoEntry : null,
    );

    const sb = getSupabase();

    const ext = fileExtFromName(videoFile.name);
    const applicationSeed = crypto.randomUUID();
    const videoPath = `applications/${new Date()
      .toISOString()
      .slice(0, 10)}/${applicationSeed}.${ext}`;

    const arrayBuffer = await videoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await sb.storage
      .from(MEDIA_BUCKET)
      .upload(videoPath, buffer, {
        contentType: videoFile.type || "video/mp4",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    uploadedVideoPath = videoPath;

    const fullConsentText = consentText();

    const metadata = {
      user_agent: req.headers.get("user-agent") || "",
      origin: req.headers.get("origin") || "",
      referer: req.headers.get("referer") || "",
      ip_hint:
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "",
      website_route: "/creator-apply",
      media_bucket: MEDIA_BUCKET,
      application_seed: applicationSeed,
    };

    const { data, error: insertError } = await sb
      .from("creator_applications")
      .insert({
        legal_full_name: fields.legal_full_name,
        country: fields.country,
        state_region: fields.state_region || null,
        city: fields.city,

        email: fields.email,
        whatsapp_number: fields.whatsapp_number,
        telegram_username: fields.telegram_username || null,

        stayknown_identity: fields.stayknown_identity,
        tiktok_handle: fields.tiktok_handle,
        facebook_url: fields.facebook_url || null,
        instagram_url: fields.instagram_url || null,
        youtube_url: fields.youtube_url || null,

        main_platform: fields.main_platform,
        audience_size: fields.audience_size,
        application_focus: fields.application_focus,
        content_language: fields.content_language || null,
        previous_campaign_url: fields.previous_campaign_url || null,
        reason_for_applying: fields.reason_for_applying,
        extra_message: fields.extra_message || null,

        follows_stayknown: flags.follows_stayknown,
        follows_six_clement_joshua: flags.follows_six_clement_joshua,

        privacy_opened: flags.privacy_opened,
        terms_opened: flags.terms_opened,
        consent_scrolled: flags.consent_scrolled,
        truth_confirmed: flags.truth_confirmed,
        responsibility_accepted: flags.responsibility_accepted,
        contact_permission: flags.contact_permission,

        future_kyc_notice_accepted: flags.future_kyc_notice_accepted,
        media_retention_notice_accepted: flags.media_retention_notice_accepted,

        sample_video_path: videoPath,
        sample_video_original_name: videoFile.name || null,
        sample_video_mime: videoFile.type || null,
        sample_video_size_bytes: videoFile.size || null,

        social_proof_link_1: fields.social_proof_link_1,
        social_proof_link_2: fields.social_proof_link_2,
        social_proof_link_3: fields.social_proof_link_3,
        social_proof_link_4: fields.social_proof_link_4,

        consent_version: CONSENT_VERSION,
        consent_text: fullConsentText,

        source: "website",
        status: "new",
        metadata,
      })
      .select("id, created_at")
      .single();

    if (insertError) {
      throw insertError;
    }

    const applicationId = String(data.id);
    const createdAt = new Date(String(data.created_at)).toLocaleString(
      "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
      },
    );

    const emailPayload: FieldMap & {
      createdAt: string;
      applicationId: string;
    } = {
      ...fields,
      createdAt,
      applicationId,
      sample_video_path: videoPath,
      sample_video_original_name: videoFile.name || "",
      sample_video_mime: videoFile.type || "",
      sample_video_size_bytes: String(videoFile.size || ""),
    };

    const toEmail = env(
      "CREATOR_APPLICATION_TO_EMAIL",
      "creators@stay-known.com",
    );

    await Promise.all([
      resendSend({
        to: [toEmail],
        subject: `StayKnown creator application: ${fields.legal_full_name}`,
        html: adminEmailHtml(emailPayload),
      }),
      resendSend({
        to: [fields.email],
        subject: "StayKnown received your creator application",
        html: applicantEmailHtml(emailPayload),
      }),
    ]);

    return Response.json({
      ok: true,
      application_id: applicationId,
      message:
        "Your StayKnown creator application has been submitted. A confirmation copy has been sent to your email.",
    });
  } catch (error) {
    console.error("CREATOR_APPLICATION_ERROR", error);

    if (uploadedVideoPath) {
      try {
        const sb = getSupabase();
        await sb.storage.from(MEDIA_BUCKET).remove([uploadedVideoPath]);
      } catch (cleanupError) {
        console.error("CREATOR_APPLICATION_CLEANUP_ERROR", cleanupError);
      }
    }

    const message =
      error instanceof Error && error.message
        ? error.message
        : "We could not submit this application right now. Please try again.";

    return Response.json(
      {
        ok: false,
        message,
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
