import crypto from "crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type LiveAudience = "contacts" | "self";

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
  version: "v1" | "v2";
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

export type VisitAccessContext = {
  visit: Record<string, unknown>;
  recipient: null | {
    id: string;
    name: string;
    email: string;
  };
  legacyReadOnly: boolean;
};

export function clean(value: unknown): string {
  return String(value ?? "").trim();
}

export function normalizeEmail(value: unknown): string {
  return clean(value).toLowerCase();
}

export function createAdminClient(): SupabaseClient {
  const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceRole = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!url || !serviceRole) {
    throw new Error("Live tracking is not fully configured yet.");
  }

  return createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function signatureFor(secret: string, message: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
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
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
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

  const expNumber = Number(access.exp);
  if (!Number.isFinite(expNumber)) return { ok: false, reason: "bad_exp" };
  if (expNumber < Math.floor(Date.now() / 1000)) {
    return { ok: false, reason: "expired" };
  }

  const v1Message = `sid=${access.sid}&exp=${expNumber}&uid=${access.uid}&aud=${access.aud}`;
  const v1Expected = signatureFor(secret, v1Message);

  if (access.rid) {
    if (!access.uid) return { ok: false, reason: "missing_uid" };
    if (!access.aud) return { ok: false, reason: "missing_aud" };
    if (access.aud !== "contacts" && access.aud !== "self") {
      return { ok: false, reason: "bad_audience" };
    }

    const v2Message = `sid=${access.sid}&exp=${expNumber}&uid=${access.uid}&aud=${access.aud}&rid=${access.rid}`;
    const v2Expected = signatureFor(secret, v2Message);

    if (safeEqual(v2Expected, access.sig)) {
      return {
        ...access,
        aud: access.aud,
        ok: true,
        version: "v2",
        expNumber,
        signedAud: access.aud,
      };
    }
  }

  // Preserve existing signed Visit links as read-only map links. The original
  // v1 signer allowed empty uid/aud values, so verification must use the exact
  // values that were signed rather than silently rewriting them first.
  if (!access.rid && safeEqual(v1Expected, access.sig)) {
    return {
      ...access,
      aud: access.aud === "self" ? "self" : "contacts",
      ok: true,
      version: "v1",
      expNumber,
      signedAud: access.aud,
    };
  }

  return { ok: false, reason: "bad_signature" };
}

export function appendAccessParams(url: URL, access: SignedLiveAccess): URL {
  url.searchParams.set("sid", access.sid);
  url.searchParams.set("exp", access.exp);
  url.searchParams.set("uid", access.uid);
  url.searchParams.set("aud", access.aud);
  url.searchParams.set("sig", access.sig);
  if (access.rid) url.searchParams.set("rid", access.rid);
  return url;
}

export async function validateVisitAccess(
  admin: SupabaseClient,
  verified: VerifiedLiveAccess,
): Promise<VisitAccessContext> {
  let visitQuery = admin.from("visits").select("*").eq("id", verified.sid);

  // v2 links are owner-bound. Legacy v1 links may not contain uid because the
  // old page allowed that field to be empty; those links remain view-only.
  if (verified.uid) {
    visitQuery = visitQuery.eq("user_id", verified.uid);
  }

  const visitResult = await visitQuery.maybeSingle();

  if (visitResult.error) {
    throw new Error(`visit_access_failed:${visitResult.error.message}`);
  }

  const visit = visitResult.data as Record<string, unknown> | null;
  if (!visit) throw new Error("visit_not_found");

  if (verified.aud === "self") {
    return {
      visit,
      recipient: null,
      legacyReadOnly: verified.version === "v1",
    };
  }

  if (!verified.rid) {
    return { visit, recipient: null, legacyReadOnly: true };
  }

  const contactResult = await admin
    .from("emergency_contacts")
    .select("id,name,alias,email,blocked,restricted,approval_status")
    .eq("id", verified.rid)
    .eq("user_id", verified.uid)
    .eq("approval_status", "approved")
    .maybeSingle();

  if (contactResult.error) {
    throw new Error(`recipient_access_failed:${contactResult.error.message}`);
  }

  const row = contactResult.data as Record<string, unknown> | null;
  if (!row || row.blocked === true || row.restricted === true) {
    throw new Error("recipient_not_authorized");
  }

  const email = normalizeEmail(row.email);
  if (!email.includes("@")) throw new Error("recipient_email_missing");

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

export function requestIpHash(req: Request): string {
  const secret = clean(
    process.env.LIVE_AUDIT_HASH_SECRET ??
      process.env.INTERNAL_EVENT_SECRET ??
      process.env.TRACKING_SIGNING_SECRET,
  );
  const raw = clean(
    req.headers.get("x-forwarded-for")?.split(",")[0] ??
      req.headers.get("x-real-ip") ??
      "unknown",
  );

  if (!secret) return "";
  return crypto.createHmac("sha256", secret).update(raw).digest("hex");
}

export async function resolveStayKnownUserByEmail(
  admin: SupabaseClient,
  email: string,
): Promise<string> {
  const normalized = normalizeEmail(email);
  if (!normalized) return "";

  try {
    const profile = await admin
      .from("profiles")
      .select("id")
      .ilike("email", normalized)
      .limit(1)
      .maybeSingle();

    if (!profile.error && profile.data) return clean(profile.data.id);
  } catch {}

  try {
    const userProfile = await admin
      .from("user_profile")
      .select("user_id")
      .ilike("email", normalized)
      .limit(1)
      .maybeSingle();

    if (!userProfile.error && userProfile.data) {
      return clean(userProfile.data.user_id);
    }
  } catch {}

  return "";
}
