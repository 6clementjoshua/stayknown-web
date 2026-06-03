// app/missed-im-safe-response/page.tsx
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import MissedImSafeResponseClient from "./missed-im-safe-response-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ResponseChoice = "will_check" | "reached_them" | "could_not_reach";

type PublicPerson = {
  name: string;
  verified: boolean;
  username: string | null;
};

type SafeProfile = {
  id: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  username: string;
  verified: boolean;
};

type VerifyOk = {
  ok: true;
  uid: string;
  contact: string;
  contactName: string;
  subjectName: string;
  response: ResponseChoice;
  expected: string;
  due: string;
  sent: string;
  exp: number;
};

type VerifyFail = {
  ok: false;
  reason:
    | "missing_uid"
    | "missing_contact"
    | "missing_response"
    | "missing_expected"
    | "missing_due"
    | "missing_sent"
    | "missing_exp"
    | "missing_sig"
    | "missing_secret"
    | "bad_exp"
    | "expired"
    | "bad_response"
    | "bad_signature";
};

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    return null;
  }

  return createClient(url, serviceRole, {
    auth: { persistSession: false },
  });
}

function clean(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function cleanOne(v: string | string[] | undefined) {
  if (typeof v === "string") return v.trim();
  if (Array.isArray(v) && typeof v[0] === "string") return v[0].trim();
  return "";
}

function responseOk(v: string): ResponseChoice | null {
  const s = v.trim().toLowerCase();
  if (s === "will_check") return "will_check";
  if (s === "reached_them") return "reached_them";
  if (s === "could_not_reach") return "could_not_reach";
  return null;
}

function signatureMessage(p: {
  uid: string;
  contact: string;
  contactName: string;
  subjectName: string;
  response: string;
  expected: string;
  due: string;
  sent: string;
  exp: number;
}) {
  return [
    `uid=${p.uid}`,
    `contact=${p.contact}`,
    `contact_name=${p.contactName}`,
    `subject_name=${p.subjectName}`,
    `response=${p.response}`,
    `expected=${p.expected}`,
    `due=${p.due}`,
    `sent=${p.sent}`,
    `exp=${p.exp}`,
  ].join("&");
}

function verifySignature(params: URLSearchParams): VerifyOk | VerifyFail {
  const uid = (params.get("uid") || "").trim();
  const contact = (params.get("contact") || "").trim().toLowerCase();
  const contactName = (params.get("contact_name") || "").trim();
  const subjectName = (params.get("subject_name") || "").trim();
  const responseRaw = (params.get("response") || "").trim().toLowerCase();
  const expected = (params.get("expected") || "").trim();
  const due = (params.get("due") || "").trim();
  const sent = (params.get("sent") || "").trim();
  const exp = (params.get("exp") || "").trim();
  const sig = (params.get("sig") || "").trim();
  const secret = (process.env.MISSED_SAFE_RESPONSE_SIGNING_SECRET || "").trim();

  if (!uid) return { ok: false, reason: "missing_uid" };
  if (!contact) return { ok: false, reason: "missing_contact" };
  if (!responseRaw) return { ok: false, reason: "missing_response" };
  if (!expected) return { ok: false, reason: "missing_expected" };
  if (!due) return { ok: false, reason: "missing_due" };
  if (!sent) return { ok: false, reason: "missing_sent" };
  if (!exp) return { ok: false, reason: "missing_exp" };
  if (!sig) return { ok: false, reason: "missing_sig" };
  if (!secret) return { ok: false, reason: "missing_secret" };

  const response = responseOk(responseRaw);
  if (!response) return { ok: false, reason: "bad_response" };

  const now = Math.floor(Date.now() / 1000);
  const expNum = Number(exp);

  if (!Number.isFinite(expNum)) {
    return { ok: false, reason: "bad_exp" };
  }

  if (expNum < now) {
    return { ok: false, reason: "expired" };
  }

  const message = signatureMessage({
    uid,
    contact,
    contactName,
    subjectName,
    response,
    expected,
    due,
    sent,
    exp: expNum,
  });

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  if (expectedSig !== sig) {
    return { ok: false, reason: "bad_signature" };
  }

  return {
    ok: true,
    uid,
    contact,
    contactName,
    subjectName: subjectName || "StayKnown member",
    response,
    expected,
    due,
    sent,
    exp: expNum,
  };
}

function profileFromRow(
  data: Record<string, unknown> | null,
): SafeProfile | null {
  if (!data) return null;

  return {
    id: String(data.id || ""),
    email: clean(data.email),
    displayName: clean(data.display_name),
    firstName: clean(data.first_name),
    lastName: clean(data.last_name),
    username: clean(data.username),
    verified: data.verified === true,
  };
}

function nameFromProfile(profile: SafeProfile | null, fallback: string) {
  if (!profile) return fallback.trim() || "StayKnown member";

  const full = `${profile.firstName} ${profile.lastName}`.trim();

  return (
    profile.displayName ||
    full ||
    profile.username ||
    fallback.trim() ||
    "StayKnown member"
  );
}

function publicPerson(
  profile: SafeProfile | null,
  fallback: string,
): PublicPerson {
  return {
    name: nameFromProfile(profile, fallback),
    verified: profile?.verified === true,
    username: profile?.username || null,
  };
}

async function loadProfileById(uid: string) {
  const sb = admin();
  if (!sb) return null;

  const cleanUid = uid.trim();
  if (!cleanUid) return null;

  const { data, error } = await sb
    .from("profiles")
    .select("id,email,display_name,first_name,last_name,username,verified")
    .eq("id", cleanUid)
    .maybeSingle();

  if (error) {
    console.error("loadProfileById failed:", error.message);
    return null;
  }

  return profileFromRow(data as Record<string, unknown> | null);
}

async function loadProfileByEmail(email: string) {
  const sb = admin();
  if (!sb) return null;

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return null;

  const { data, error } = await sb
    .from("profiles")
    .select("id,email,display_name,first_name,last_name,username,verified")
    .ilike("email", cleanEmail)
    .maybeSingle();

  if (error) {
    console.error("loadProfileByEmail failed:", error.message);
    return null;
  }

  return profileFromRow(data as Record<string, unknown> | null);
}

function InvalidState({ reason }: { reason: string }) {
  return (
    <div className="min-h-screen bg-[#f4f5f7] text-black flex items-center justify-center px-4">
      <div className="w-full max-w-[560px] rounded-[32px] border border-black/10 bg-white/92 shadow-[0_30px_100px_rgba(0,0,0,0.12)] backdrop-blur-2xl p-6 md:p-8">
        <div className="flex justify-center">
          <div className="rounded-[24px] border border-white/90 bg-white/90 px-4 py-3 shadow-[0_14px_38px_rgba(0,0,0,0.12)]">
            <img
              src="/6logo.png"
              alt="StayKnown"
              className="h-9 w-9 object-contain"
            />
          </div>
        </div>

        <div className="mt-5 text-center">
          <div className="text-[11px] font-black uppercase tracking-[0.34em] text-black/42">
            StayKnown
          </div>
          <h1 className="mt-3 text-[24px] font-black tracking-[-0.03em] text-black/90">
            Invalid or Expired Link
          </h1>
          <p className="mt-3 text-[13px] leading-6 text-black/62">
            This missed I’M SAFE response link is no longer valid. For privacy,
            safety, and audit protection, response links expire and cannot be
            trusted after expiry.
          </p>

          <div className="mt-5 rounded-[22px] border border-black/8 bg-black/[0.03] px-4 py-4 text-left">
            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-black/42">
              Safety note
            </div>
            <div className="mt-2 text-[13px] leading-6 text-black/66">
              Do not use old, copied, or unexpected links. If you believe
              someone may be in danger, contact them directly and follow local
              emergency procedures.
            </div>
          </div>

          <div className="mt-4 text-[11px] uppercase tracking-[0.18em] text-black/36">
            Reason: {reason}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function MissedImSafeResponsePage({
  searchParams,
}: {
  searchParams:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
}) {
  const resolved = await searchParams;
  const params = new URLSearchParams();

  for (const [k, v] of Object.entries(resolved ?? {})) {
    const value = cleanOne(v);
    if (value) params.set(k, value);
  }

  const verified = verifySignature(params);

  if (!verified.ok) {
    return <InvalidState reason={verified.reason} />;
  }

  const [subjectProfile, contactProfile] = await Promise.all([
    loadProfileById(verified.uid),
    loadProfileByEmail(verified.contact),
  ]);

  const initialSubject = publicPerson(subjectProfile, verified.subjectName);
  const initialContact = publicPerson(
    contactProfile,
    verified.contactName || verified.contact,
  );

  return (
    <MissedImSafeResponseClient
      uid={verified.uid}
      contact={verified.contact}
      contactName={verified.contactName}
      subjectName={verified.subjectName}
      response={verified.response}
      expected={verified.expected}
      due={verified.due}
      sent={verified.sent}
      exp={verified.exp}
      sig={(params.get("sig") || "").trim()}
      initialSubject={initialSubject}
      initialContact={initialContact}
    />
  );
}
