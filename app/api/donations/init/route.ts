import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const DEFAULT_SITE_URL = "https://www.stay-known.com";

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

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

function clampAmount(value: unknown, currency: string) {
  const raw = Number(value);

  if (!Number.isFinite(raw)) {
    throw new Error("Invalid donation amount.");
  }

  const amount = Math.round(raw);

  const minimumByCurrency: Record<string, number> = {
    NGN: 1000,
    USD: 2,
    GBP: 2,
    EUR: 2,
    KES: 200,
    GHS: 20,
    UGX: 7000,
    TZS: 5000,
    RWF: 2500,
    ZAR: 40,
    XAF: 1500,
    XOF: 1500,
    ZMW: 40,
  };

  const maximumByCurrency: Record<string, number> = {
    NGN: 5000000,
    USD: 10000,
    GBP: 10000,
    EUR: 10000,
    KES: 1000000,
    GHS: 100000,
    UGX: 30000000,
    TZS: 25000000,
    RWF: 10000000,
    ZAR: 200000,
    XAF: 6000000,
    XOF: 6000000,
    ZMW: 200000,
  };

  const minimum = minimumByCurrency[currency] ?? 2;
  const maximum = maximumByCurrency[currency] ?? 10000;

  if (amount < minimum) {
    throw new Error(`Minimum donation is ${currency} ${minimum}.`);
  }

  if (amount > maximum) {
    throw new Error(
      `Maximum donation is ${currency} ${maximum} per transaction.`,
    );
  }

  return amount;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const donorName = safeTrim(body.donor_name).slice(0, 120);
    const donorEmail = cleanEmail(body.donor_email);
    const donorMessage = safeTrim(body.donor_message).slice(0, 1000);
    const currency = safeTrim(body.currency || "NGN").toUpperCase() || "NGN";
    const amount = clampAmount(body.amount, currency);

    if (!isEmail(donorEmail)) {
      return Response.json(
        { ok: false, message: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const allowedCurrencies = new Set([
      "NGN",
      "USD",
      "GBP",
      "EUR",
      "KES",
      "GHS",
      "UGX",
      "TZS",
      "RWF",
      "ZAR",
      "XAF",
      "XOF",
      "ZMW",
    ]);

    if (!allowedCurrencies.has(currency)) {
      return Response.json(
        {
          ok: false,
          message:
            "This currency is not available for donation right now. Please choose another supported currency.",
        },
        { status: 400 },
      );
    }

    const base = appBaseUrl();
    const txRef = `sk_donation_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 10)}`;

    const sb = getSupabase();

    const { error: insertError } = await sb.from("donations").insert({
      tx_ref: txRef,
      donor_name: donorName || null,
      donor_email: donorEmail,
      amount,
      currency_code: currency,
      donor_message: donorMessage || null,
      status: "pending",
      provider: "flutterwave",
      provider_payload: {
        source: "stayknown_website",
        user_agent: req.headers.get("user-agent") || "",
        origin: req.headers.get("origin") || "",
        referer: req.headers.get("referer") || "",
      },
    });

    if (insertError) throw insertError;

    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mustEnv("FLUTTERWAVE_SECRET_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref: txRef,
        amount,
        currency,
        redirect_url: `${base}/donate/verify`,
        customer: {
          email: donorEmail,
          name: donorName || "StayKnown Supporter",
        },
        customizations: {
          title: "Support StayKnown",
          description:
            "Donation to support StayKnown backend growth, live safety systems, and translation infrastructure.",
          logo: `${base}/6logo.png`,
        },
        meta: {
          purpose: "stayknown_donation",
          donor_message: donorMessage || "",
        },
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data?.status !== "success" || !data?.data?.link) {
      throw new Error(
        `Flutterwave init failed: ${response.status} ${JSON.stringify(data)}`,
      );
    }

    return Response.json({
      ok: true,
      tx_ref: txRef,
      checkout_url: data.data.link,
    });
  } catch (error) {
    console.error("DONATION_INIT_ERROR", error);

    const message =
      error instanceof Error && error.message
        ? error.message
        : "We could not start this donation right now.";

    return Response.json({ ok: false, message }, { status: 500 });
  }
}

export async function GET() {
  return Response.json(
    { ok: false, message: "Method not allowed." },
    { status: 405 },
  );
}
