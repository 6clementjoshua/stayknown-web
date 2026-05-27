import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const DEFAULT_SITE_URL = "https://www.stay-known.com";
const DEFAULT_LOGO_URL = `${DEFAULT_SITE_URL}/6logo.png`;

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

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function appBaseUrl() {
  return env("SITE_BASE_URL", DEFAULT_SITE_URL).replace(/\/+$/g, "");
}

function getSupabase() {
  const url = env("SUPABASE_URL", env("NEXT_PUBLIC_SUPABASE_URL"));
  const key = env("SUPABASE_SERVICE_ROLE_KEY");

  if (!url) throw new Error("Missing SUPABASE_URL");
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

function money(amount: unknown, currency = "NGN") {
  const n = Number(amount || 0);

  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${currency} ${n.toLocaleString()}`;
  }
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

                  This message was sent by StayKnown for donation confirmation, product support, and platform-growth communication.
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

function detailRow(label: string, value: unknown) {
  const clean = safeTrim(value);
  if (!clean) return "";

  return `
    <tr>
      <td style="padding:7px 0; width:150px; color:rgba(255,255,255,0.42); font-size:12px; font-weight:850; vertical-align:top;">
        ${escapeHtml(label)}
      </td>
      <td style="padding:7px 0; color:rgba(255,255,255,0.82); font-size:13px; font-weight:700; line-height:1.55;">
        ${escapeHtml(clean)}
      </td>
    </tr>
  `;
}

function donorEmailHtml(p: {
  donorName: string;
  amount: string;
  currency: string;
  txRef: string;
  transactionId: string;
  createdAt: string;
}) {
  const content = `
    <div style="font-size:13px; color:rgba(255,255,255,0.74); line-height:1.7;">
      <div>
        Thank you${
          p.donorName
            ? `, <b style="color:#ffffff;">${escapeHtml(p.donorName)}</b>`
            : ""
        }. StayKnown has received your donation of <b style="color:#ffffff;">${escapeHtml(
          p.amount,
        )}</b>.
      </div>

      ${card(
        "What your support helps build",
        `Your donation helps StayKnown expand backend infrastructure, improve live map reliability, advance multilingual chat translation, strengthen safety systems, and continue building protection-focused technology for real people.`,
      )}

      ${card(
        "Donation details",
        `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${detailRow("Amount", p.amount)}
          ${detailRow("Currency", p.currency)}
          ${detailRow("Reference", p.txRef)}
          ${detailRow("Transaction ID", p.transactionId)}
          ${detailRow("Confirmed at", p.createdAt)}
        </table>
        `,
      )}

      ${card(
        "Our appreciation",
        `Every contribution helps us move the platform forward responsibly. Thank you for supporting the mission behind StayKnown and helping us build stronger safety, communication, and live-location systems.`,
      )}

      ${card(
        "Need help?",
        `For donation or payment questions, contact support through the StayKnown request form. Investor conversations should go to <b style="color:#ffffff;">investors@stay-known.com</b>. Partnerships should go to <b style="color:#ffffff;">partnership@stay-known.com</b>.`,
      )}
    </div>
  `;

  return shell({
    title: "Thank you for supporting StayKnown",
    subtitle:
      "Your donation was confirmed. This receipt summary is for your records.",
    contentHtml: content,
  });
}

function adminEmailHtml(p: {
  donorName: string;
  donorEmail: string;
  amount: string;
  currency: string;
  txRef: string;
  transactionId: string;
  donorMessage: string;
  createdAt: string;
}) {
  const content = `
    <div style="font-size:13px; color:rgba(255,255,255,0.74); line-height:1.7;">
      <div>
        A new <b style="color:#ffffff;">StayKnown donation</b> was verified through Flutterwave.
      </div>

      ${card(
        "Donation summary",
        `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${detailRow("Amount", p.amount)}
          ${detailRow("Currency", p.currency)}
          ${detailRow("Donor name", p.donorName || "Not provided")}
          ${detailRow("Donor email", p.donorEmail)}
          ${detailRow("Reference", p.txRef)}
          ${detailRow("Transaction ID", p.transactionId)}
          ${detailRow("Confirmed at", p.createdAt)}
        </table>
        `,
      )}

      ${
        p.donorMessage
          ? card(
              "Donor message",
              `<div style="white-space:pre-wrap;">${escapeHtml(
                p.donorMessage,
              )}</div>`,
            )
          : ""
      }

      ${card(
        "Internal note",
        `This donation supports StayKnown backend expansion, live map infrastructure, translation model advancement, and safety product development.`,
      )}
    </div>
  `;

  return shell({
    title: "New StayKnown donation confirmed",
    subtitle: "Flutterwave payment was verified and recorded.",
    contentHtml: content,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const transactionId = safeTrim(body.transaction_id || body.transactionId);
    const txRef = safeTrim(body.tx_ref || body.txRef);

    if (!transactionId && !txRef) {
      return Response.json(
        { ok: false, message: "Missing transaction reference." },
        { status: 400 },
      );
    }

    let verifyUrl = "";

    if (transactionId) {
      verifyUrl = `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(
        transactionId,
      )}/verify`;
    } else {
      verifyUrl = `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(
        txRef,
      )}`;
    }

    const verifyResponse = await fetch(verifyUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${mustEnv("FLUTTERWAVE_SECRET_KEY")}`,
        "Content-Type": "application/json",
      },
    });

    const verifyData = await verifyResponse.json().catch(() => ({}));

    if (!verifyResponse.ok || verifyData?.status !== "success") {
      throw new Error(
        `Flutterwave verify failed: ${verifyResponse.status} ${JSON.stringify(
          verifyData,
        )}`,
      );
    }

    const fw = verifyData.data || {};
    const resolvedTxRef = safeTrim(fw.tx_ref || txRef);
    const resolvedTransactionId = String(fw.id || transactionId || "");

    if (!resolvedTxRef) {
      throw new Error("Flutterwave response did not include tx_ref.");
    }

    const paymentStatus = safeTrim(fw.status).toLowerCase();
    const chargedAmount = Number(fw.charged_amount || fw.amount || 0);
    const currency = safeTrim(fw.currency || "NGN").toUpperCase();

    if (paymentStatus !== "successful") {
      return Response.json(
        {
          ok: false,
          status: paymentStatus || "failed",
          message: "This donation payment was not successful.",
        },
        { status: 400 },
      );
    }

    const sb = getSupabase();

    const { data: existing, error: findError } = await sb
      .from("donations")
      .select("*")
      .eq("tx_ref", resolvedTxRef)
      .maybeSingle();

    if (findError) throw findError;

    if (!existing) {
      throw new Error("Donation record not found.");
    }

    if (Number(existing.amount) !== Math.round(chargedAmount)) {
      throw new Error("Donation amount mismatch.");
    }

    if (String(existing.currency_code).toUpperCase() !== currency) {
      throw new Error("Donation currency mismatch.");
    }

    const alreadyVerified = existing.status === "successful";

    const { data: updated, error: updateError } = await sb
      .from("donations")
      .update({
        status: "successful",
        transaction_id: resolvedTransactionId,
        provider_payload: verifyData,
        verified_at: existing.verified_at || new Date().toISOString(),
      })
      .eq("tx_ref", resolvedTxRef)
      .select("*")
      .single();

    if (updateError) throw updateError;

    const createdAt = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const amountLabel = money(updated.amount, updated.currency_code);
    const donationTo = env("DONATION_TO_EMAIL", "support@stay-known.com");

    if (!alreadyVerified) {
      await Promise.all([
        resendSend({
          to: [updated.donor_email],
          subject: "Thank you for supporting StayKnown",
          html: donorEmailHtml({
            donorName: updated.donor_name || "",
            amount: amountLabel,
            currency: updated.currency_code,
            txRef: updated.tx_ref,
            transactionId: updated.transaction_id || resolvedTransactionId,
            createdAt,
          }),
        }),
        resendSend({
          to: [donationTo],
          subject: `StayKnown donation confirmed: ${amountLabel}`,
          html: adminEmailHtml({
            donorName: updated.donor_name || "",
            donorEmail: updated.donor_email,
            amount: amountLabel,
            currency: updated.currency_code,
            txRef: updated.tx_ref,
            transactionId: updated.transaction_id || resolvedTransactionId,
            donorMessage: updated.donor_message || "",
            createdAt,
          }),
        }),
      ]);
    }

    return Response.json({
      ok: true,
      status: "successful",
      donation: {
        tx_ref: updated.tx_ref,
        transaction_id: updated.transaction_id,
        amount: updated.amount,
        currency_code: updated.currency_code,
        donor_email: updated.donor_email,
      },
      message: alreadyVerified
        ? "Donation was already confirmed."
        : "Donation confirmed. Thank you for supporting StayKnown.",
    });
  } catch (error) {
    console.error("DONATION_VERIFY_ERROR", error);

    return Response.json(
      {
        ok: false,
        message:
          "We could not verify this donation right now. If payment was taken, please contact StayKnown support with your transaction reference.",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return Response.json(
    { ok: false, message: "Method not allowed." },
    { status: 405 },
  );
}
