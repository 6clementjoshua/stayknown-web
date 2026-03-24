import crypto from "crypto";
import LiveClient from "./live-client";

function verifySignature(params: URLSearchParams) {
  const sid = (params.get("sid") || "").trim();
  const exp = (params.get("exp") || "").trim();
  const uid = (params.get("uid") || "").trim();
  const aud = (params.get("aud") || "").trim();
  const sig = (params.get("sig") || "").trim();
  const secret = (process.env.TRACKING_SIGNING_SECRET || "").trim();

  if (!sid || !exp || !sig || !secret) return false;

  const now = Math.floor(Date.now() / 1000);
  const expNum = Number(exp);

  if (!Number.isFinite(expNum) || expNum < now) return false;

  const message = `sid=${sid}&exp=${expNum}&uid=${uid}&aud=${aud}`;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  return expected === sig;
}

function InvalidState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center px-6 max-w-md">
        <div className="mx-auto mb-5 h-14 w-14 rounded-full border border-white/15 bg-white/10 backdrop-blur-xl flex items-center justify-center text-xl font-black shadow-2xl">
          6
        </div>
        <h1 className="text-xl font-bold tracking-tight">
          Invalid or Expired Link
        </h1>
        <p className="opacity-60 mt-2 text-sm leading-6">
          This live tracking session is no longer available. Please ask the user
          for a fresh link if tracking is still active.
        </p>
      </div>
    </div>
  );
}

export default function LivePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const params = new URLSearchParams();

  for (const [k, v] of Object.entries(searchParams)) {
    if (typeof v === "string") {
      params.set(k, v);
    } else if (Array.isArray(v) && typeof v[0] === "string") {
      params.set(k, v[0]);
    }
  }

  const valid = verifySignature(params);

  if (!valid) {
    return <InvalidState />;
  }

  const sid = (params.get("sid") || "").trim();

  if (!sid) {
    return <InvalidState />;
  }

  return <LiveClient sessionId={sid} />;
}
