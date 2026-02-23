import crypto from "crypto";
import LiveClient from "./live-client";

function verifySignature(params: URLSearchParams) {
    const sid = params.get("sid") || "";
    const exp = params.get("exp") || "";
    const uid = params.get("uid") || "";
    const aud = params.get("aud") || "";
    const sig = params.get("sig") || "";

    if (!sid || !exp || !sig) return false;

    const now = Math.floor(Date.now() / 1000);
    if (Number(exp) < now) return false;

    const message = `sid=${sid}&exp=${exp}&uid=${uid}&aud=${aud}`;

    const expected = crypto
        .createHmac("sha256", process.env.TRACKING_SIGNING_SECRET!)
        .update(message)
        .digest("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");

    return expected === sig;
}

export default function LivePage({
    searchParams,
}: {
    searchParams: Record<string, string | string[] | undefined>;
}) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
        if (typeof v === "string") params.set(k, v);
    }

    const valid = verifySignature(params);
    if (!valid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="text-center px-6">
                    <h1 className="text-xl font-bold">Invalid or Expired Link</h1>
                    <p className="opacity-60 mt-2">This tracking session is no longer valid.</p>
                </div>
            </div>
        );
    }

    const sid = params.get("sid")!;
    return <LiveClient sessionId={sid} />;
}