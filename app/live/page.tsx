import crypto from "crypto";
import LiveClient from "./live-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function verifySignature(params: URLSearchParams) {
  const sid = (params.get("sid") || "").trim();
  const exp = (params.get("exp") || "").trim();
  const uid = (params.get("uid") || "").trim();
  const aud = (params.get("aud") || "").trim();
  const sig = (params.get("sig") || "").trim();
  const secret = (process.env.TRACKING_SIGNING_SECRET || "").trim();

  if (!sid) return { ok: false, reason: "missing_sid" as const };
  if (!exp) return { ok: false, reason: "missing_exp" as const };
  if (!sig) return { ok: false, reason: "missing_sig" as const };
  if (!secret) return { ok: false, reason: "missing_secret" as const };

  const now = Math.floor(Date.now() / 1000);
  const expNum = Number(exp);

  if (!Number.isFinite(expNum)) {
    return { ok: false, reason: "bad_exp" as const };
  }

  if (expNum < now) {
    return { ok: false, reason: "expired" as const };
  }

  const message = `sid=${sid}&exp=${expNum}&uid=${uid}&aud=${aud}`;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  const ok = expected === sig;

  console.log("[live-verify]", {
    ok,
    reason: ok ? "ok" : "bad_signature",
    sid_present: Boolean(sid),
    uid_present: Boolean(uid),
    aud,
    exp,
    now,
    sig_prefix: sig.slice(0, 12),
    expected_prefix: expected.slice(0, 12),
    secret_present: Boolean(secret),
  });

  return { ok, reason: ok ? "ok" : ("bad_signature" as const) };
}

function InvalidState({ reason }: { reason?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center px-6 max-w-md">
        <div className="mx-auto mb-5 flex items-center justify-center">
          <img
            src="/6logo.png"
            alt="StayKnown"
            className="h-10 w-10 object-contain"
          />
        </div>

        <h1 className="text-xl font-bold tracking-tight">
          Invalid or Expired Link
        </h1>

        <p className="opacity-60 mt-2 text-sm leading-6">
          This live tracking session is no longer available. Please ask the user
          for a fresh link if tracking is still active.
        </p>

        {reason ? (
          <p className="opacity-40 mt-3 text-[11px] uppercase tracking-[0.18em]">
            Reason: {reason}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default async function LivePage({
  searchParams,
}: {
  searchParams:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
}) {
  const resolvedSearchParams = await searchParams;
  const params = new URLSearchParams();

  for (const [k, v] of Object.entries(resolvedSearchParams ?? {})) {
    if (typeof v === "string") {
      params.set(k, v);
    } else if (Array.isArray(v) && typeof v[0] === "string") {
      params.set(k, v[0]);
    }
  }

  console.log("[live-page.searchParams]", {
    entries: Array.from(params.entries()),
    sid: params.get("sid"),
    exp: params.get("exp"),
    uid: params.get("uid"),
    aud: params.get("aud"),
    sig_present: Boolean(params.get("sig")),
  });

  const verified = verifySignature(params);

  if (!verified.ok) {
    return <InvalidState reason={verified.reason} />;
  }

  const sid = (params.get("sid") || "").trim();

  if (!sid) {
    return <InvalidState reason="missing_sid_after_verify" />;
  }

  return <LiveClient sessionId={sid} />;
}
