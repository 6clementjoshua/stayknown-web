// app/live/live-access.ts
// StayKnown Upgrade Master File Record:
// shared server-only authority for signed recipient-bound LIVE Visit access.

import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type LiveAudience = "contacts" | "self";
export type LiveAccessVersion = "v1" | "v2";

export type SignedLiveAccess = {
  sid: string;
  exp: string;
  uid: string;
  aud: string;
  sig: string;
  rid: string;
};

export type VerifiedLiveAccess = Omit<SignedLiveAccess, "aud"> & {
  aud: LiveAudience;
  ok: true;
  version: LiveAccessVersion;
  expNumber: number;
  signedAud: string;
};

export type LiveAccessFailure = {
  ok: false;
  reason:
    | "missing_sid"
    | "missing_exp"
    | "missing_uid"
    | "missing_aud"
    | "missing_sig"
    | "missing_secret"
    | "bad_exp"
    | "expired"
    | "bad_audience"
    | "bad_signature";
};

export type LiveAccessResult = VerifiedLiveAccess | LiveAccessFailure;

export type VisitRecipientAccess = {
  id: string;
  name: string;
  email: string;
};

export type VisitAccessContext = {
  visit: Record<string, unknown>;
  recipient: VisitRecipientAccess | null;
  legacyReadOnly: boolean;
};

const BASE64URL_SHA256_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const INTEGER_SECONDS_PATTERN = /^\d{9,13}$/;

export function clean(value: unknown): string {
  return String(value ?? "").trim();
}

export function normalizeEmail(value: unknown): string {
  return clean(value).toLowerCase();
}

function configuredSupabaseUrl(): string {
  return clean(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
}

export function createAdminClient(): SupabaseClient {
  const url = configuredSupabaseUrl();
  const serviceRole = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!url || !serviceRole) {
    throw new Error("live_configuration_unavailable");
  }

  return createClient(url, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function safeEqual(leftValue: string, rightValue: string): boolean {
  if (!leftValue || !rightValue) return false;

  const left = Buffer.from(leftValue, "utf8");
  const right = Buffer.from(rightValue, "utf8");

  if (left.length !== right.length) return false;

  try {
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

function signatureFor(secret: string, message: string): string {
  return createHmac("sha256", secret)
    .update(message, "utf8")
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function signatureLooksValid(value: string): boolean {
  return BASE64URL_SHA256_PATTERN.test(value);
}

function parseExpirySeconds(value: string): number | null {
  if (!INTEGER_SECONDS_PATTERN.test(value)) return null;

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function accessFromSearchParams(
  params: URLSearchParams,
): SignedLiveAccess {
  return {
    sid: clean(params.get("sid")),
    exp: clean(params.get("exp")),
    uid: clean(params.get("uid")),
    aud: clean(params.get("aud")),
    sig: clean(params.get("sig")),
    rid: clean(params.get("rid")),
  };
}

export function accessFromUnknown(raw: unknown): SignedLiveAccess {
  const body =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};

  return {
    sid: clean(body.sid ?? body.session_id),
    exp: clean(body.exp),
    uid: clean(body.uid),
    aud: clean(body.aud),
    sig: clean(body.sig),
    rid: clean(body.rid ?? body.recipient_contact_id),
  };
}

export function verifyLiveAccess(access: SignedLiveAccess): LiveAccessResult {
  const secret = clean(process.env.TRACKING_SIGNING_SECRET);

  if (!access.sid) return { ok: false, reason: "missing_sid" };
  if (!access.exp) return { ok: false, reason: "missing_exp" };
  if (!access.sig) return { ok: false, reason: "missing_sig" };
  if (!secret) return { ok: false, reason: "missing_secret" };

  const expNumber = parseExpirySeconds(access.exp);
  if (expNumber == null) return { ok: false, reason: "bad_exp" };

  if (expNumber < Math.floor(Date.now() / 1000)) {
    return { ok: false, reason: "expired" };
  }

  if (!signatureLooksValid(access.sig)) {
    return { ok: false, reason: "bad_signature" };
  }

  /*
  v2 is the recipient-bound format. A recipient ID is meaningful only for the
  contacts audience. Rejecting a signed "self + rid" combination prevents the
  recipient binding from being silently bypassed by the self-audience branch.
  */
  if (access.rid) {
    if (!access.uid) return { ok: false, reason: "missing_uid" };
    if (!access.aud) return { ok: false, reason: "missing_aud" };
    if (access.aud !== "contacts") {
      return { ok: false, reason: "bad_audience" };
    }

    const v2Message =
      `sid=${access.sid}` +
      `&exp=${expNumber}` +
      `&uid=${access.uid}` +
      `&aud=${access.aud}` +
      `&rid=${access.rid}`;

    const v2Expected = signatureFor(secret, v2Message);

    if (safeEqual(v2Expected, access.sig)) {
      return {
        ...access,
        aud: "contacts",
        ok: true,
        version: "v2",
        expNumber,
        signedAud: access.aud,
      };
    }

    return { ok: false, reason: "bad_signature" };
  }

  /*
  Preserve existing v1 links as read-only map links. The original signer could
  sign empty uid/aud values, so verification uses the exact values present in
  the signed message. Never rewrite those values before verification.
  */
  const v1Message =
    `sid=${access.sid}` +
    `&exp=${expNumber}` +
    `&uid=${access.uid}` +
    `&aud=${access.aud}`;

  const v1Expected = signatureFor(secret, v1Message);

  if (!safeEqual(v1Expected, access.sig)) {
    return { ok: false, reason: "bad_signature" };
  }

  return {
    ...access,
    aud: access.aud === "self" ? "self" : "contacts",
    ok: true,
    version: "v1",
    expNumber,
    signedAud: access.aud,
  };
}

export function appendAccessParams(url: URL, access: SignedLiveAccess): URL {
  url.searchParams.set("sid", access.sid);
  url.searchParams.set("exp", access.exp);
  url.searchParams.set("uid", access.uid);
  url.searchParams.set("aud", access.aud);
  url.searchParams.set("sig", access.sig);

  if (access.rid) {
    url.searchParams.set("rid", access.rid);
  }

  return url;
}

function logSupabaseAccessFailure(
  operation: "visit" | "recipient",
  error: {
    code?: string | null;
    message?: string | null;
    details?: string | null;
    hint?: string | null;
  },
): void {
  console.error(`[SK_LIVE_ACCESS] ${operation} lookup failed`, {
    code: clean(error.code) || null,
    message: clean(error.message) || null,
    details: clean(error.details) || null,
    hint: clean(error.hint) || null,
  });
}

export async function validateVisitAccess(
  admin: SupabaseClient,
  verified: VerifiedLiveAccess,
): Promise<VisitAccessContext> {
  let visitQuery = admin.from("visits").select("*").eq("id", verified.sid);

  /*
  v2 links are owner-bound. A legacy v1 link can legitimately contain an empty
  uid because the original signer permitted it; those links remain read-only.
  */
  if (verified.uid) {
    visitQuery = visitQuery.eq("user_id", verified.uid);
  }

  const visitResult = await visitQuery.maybeSingle();

  if (visitResult.error) {
    logSupabaseAccessFailure("visit", visitResult.error);
    throw new Error("visit_access_failed");
  }

  const visit = visitResult.data as Record<string, unknown> | null;

  if (!visit) {
    throw new Error("visit_not_found");
  }

  if (verified.aud === "self") {
    return {
      visit,
      recipient: null,
      legacyReadOnly: true,
    };
  }

  if (!verified.rid) {
    return {
      visit,
      recipient: null,
      legacyReadOnly: true,
    };
  }

  /*
  A recipient-bound link must match the exact approved contact record belonging
  to the same Visit owner. Blocked or restricted contacts lose access even when
  an older signed URL has not yet reached its timestamp expiry.
  */
  const contactResult = await admin
    .from("emergency_contacts")
    .select("id,name,alias,email,blocked,restricted,approval_status")
    .eq("id", verified.rid)
    .eq("user_id", verified.uid)
    .eq("approval_status", "approved")
    .maybeSingle();

  if (contactResult.error) {
    logSupabaseAccessFailure("recipient", contactResult.error);
    throw new Error("recipient_access_failed");
  }

  const row = contactResult.data as Record<string, unknown> | null;

  if (!row || row.blocked === true || row.restricted === true) {
    throw new Error("recipient_not_authorized");
  }

  const email = normalizeEmail(row.email);

  if (!email || !email.includes("@")) {
    throw new Error("recipient_email_missing");
  }

  return {
    visit,
    recipient: {
      id: clean(row.id),
      name: clean(row.name) || clean(row.alias) || email,
      email,
    },
    legacyReadOnly: false,
  };
}

export function visitOwnerUserId(
  context: VisitAccessContext,
  verified: VerifiedLiveAccess,
): string {
  return clean(context.visit.user_id) || verified.uid;
}

export function visitHasEnded(visit: Record<string, unknown>): boolean {
  if (clean(visit.ended_at)) return true;

  const status = clean(visit.status).toLowerCase();

  return (
    status === "ended" ||
    status === "completed" ||
    status === "cancelled" ||
    status === "canceled"
  );
}

export function canUseInteractiveLiveActions(
  verified: VerifiedLiveAccess,
  context: VisitAccessContext,
): boolean {
  return (
    verified.version === "v2" &&
    verified.aud === "contacts" &&
    Boolean(verified.rid) &&
    Boolean(context.recipient) &&
    !context.legacyReadOnly &&
    !visitHasEnded(context.visit)
  );
}

function firstRequestAddress(req: Request): string {
  const candidates = [
    req.headers.get("x-vercel-forwarded-for"),
    req.headers.get("cf-connecting-ip"),
    req.headers.get("x-forwarded-for")?.split(",")[0],
    req.headers.get("x-real-ip"),
  ];

  for (const candidate of candidates) {
    const value = clean(candidate).slice(0, 200);

    if (value) return value;
  }

  return "";
}

export function requestIpHash(req: Request): string {
  const secret = clean(
    process.env.LIVE_AUDIT_HASH_SECRET ??
      process.env.INTERNAL_EVENT_SECRET ??
      process.env.TRACKING_SIGNING_SECRET,
  );

  const raw = firstRequestAddress(req);

  if (!secret || !raw) return "";

  return createHmac("sha256", secret)
    .update(`stayknown-live-audit:${raw}`, "utf8")
    .digest("hex");
}

function looksLikeEmail(value: string): boolean {
  return (
    value.length >= 3 &&
    value.length <= 320 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  );
}

export async function resolveStayKnownUserByEmail(
  admin: SupabaseClient,
  email: string,
): Promise<string> {
  const normalized = normalizeEmail(email);

  if (!looksLikeEmail(normalized)) return "";

  /*
  Use exact equality. ilike() treats % and _ as wildcards and could resolve a
  different account when those characters appear in untrusted input.
  */
  try {
    const profile = await admin
      .from("profiles")
      .select("id")
      .eq("email", normalized)
      .limit(1)
      .maybeSingle();

    if (!profile.error && profile.data) {
      return clean(profile.data.id);
    }
  } catch {}

  try {
    const userProfile = await admin
      .from("user_profile")
      .select("user_id")
      .eq("email", normalized)
      .limit(1)
      .maybeSingle();

    if (!userProfile.error && userProfile.data) {
      return clean(userProfile.data.user_id);
    }
  } catch {}

  return "";
}
