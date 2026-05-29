// app/minor-signup-approval/page.tsx
import crypto from "crypto";
import MinorSignupApprovalClient from "./minor-signup-approval-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type VerifyOk = {
  ok: true;
  requestId: string;
  actor: "minor" | "guardian";
  decision: "approve" | "decline";
  exp: number;
};

type VerifyFail = {
  ok: false;
  reason:
    | "missing_request_id"
    | "missing_actor"
    | "missing_decision"
    | "missing_exp"
    | "missing_sig"
    | "missing_secret"
    | "bad_exp"
    | "expired"
    | "bad_actor"
    | "bad_decision"
    | "bad_signature";
};

function cleanOne(v: string | string[] | undefined) {
  if (typeof v === "string") return v.trim();
  if (Array.isArray(v) && typeof v[0] === "string") return v[0].trim();
  return "";
}

function verifySignature(params: URLSearchParams): VerifyOk | VerifyFail {
  const requestId = (params.get("rid") || "").trim();
  const actor = (params.get("actor") || "").trim().toLowerCase();
  const decision = (params.get("decision") || "").trim().toLowerCase();
  const exp = (params.get("exp") || "").trim();
  const sig = (params.get("sig") || "").trim();
  const secret = (process.env.MINOR_SIGNUP_SIGNING_SECRET || "").trim();

  if (!requestId) return { ok: false, reason: "missing_request_id" };
  if (!actor) return { ok: false, reason: "missing_actor" };
  if (!decision) return { ok: false, reason: "missing_decision" };
  if (!exp) return { ok: false, reason: "missing_exp" };
  if (!sig) return { ok: false, reason: "missing_sig" };
  if (!secret) return { ok: false, reason: "missing_secret" };

  if (actor !== "minor" && actor !== "guardian") {
    return { ok: false, reason: "bad_actor" };
  }

  if (decision !== "approve" && decision !== "decline") {
    return { ok: false, reason: "bad_decision" };
  }

  const now = Math.floor(Date.now() / 1000);
  const expNum = Number(exp);

  if (!Number.isFinite(expNum)) {
    return { ok: false, reason: "bad_exp" };
  }

  if (expNum < now) {
    return { ok: false, reason: "expired" };
  }

  const message = `rid=${requestId}&actor=${actor}&decision=${decision}&exp=${expNum}`;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  if (expected !== sig) {
    return { ok: false, reason: "bad_signature" };
  }

  return {
    ok: true,
    requestId,
    actor: actor as "minor" | "guardian",
    decision: decision as "approve" | "decline",
    exp: expNum,
  };
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

          <div className="mt-2 text-[10px] font-black uppercase tracking-[0.26em] text-black/34">
            Minor signup approval
          </div>

          <h1 className="mt-3 text-[24px] font-black tracking-[-0.03em] text-black/90">
            Invalid or Expired Link
          </h1>

          <p className="mt-3 text-[13px] leading-6 text-black/62">
            This minor signup approval link is no longer valid. For privacy and
            safety, approval links expire quickly and cannot be reused.
          </p>

          <div className="mt-5 rounded-[22px] border border-black/8 bg-black/[0.03] px-4 py-4 text-left">
            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-black/42">
              Safety note
            </div>

            <div className="mt-2 text-[13px] leading-6 text-black/66">
              If this request was not expected, do not continue. StayKnown minor
              signup requires both the minor and guardian to confirm before the
              account can continue.
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

export default async function MinorSignupApprovalPage({
  searchParams,
}: {
  searchParams:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
}) {
  const resolved = await searchParams;
  const params = new URLSearchParams();

  for (const [k, v] of Object.entries(resolved ?? {})) {
    const clean = cleanOne(v);
    if (clean) params.set(k, clean);
  }

  const verified = verifySignature(params);

  if (!verified.ok) {
    return <InvalidState reason={verified.reason} />;
  }

  return (
    <MinorSignupApprovalClient
      requestId={verified.requestId}
      actor={verified.actor}
      decision={verified.decision}
      exp={verified.exp}
      sig={(params.get("sig") || "").trim()}
    />
  );
}
