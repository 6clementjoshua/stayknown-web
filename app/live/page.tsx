// app/live/page.tsx
import crypto from "crypto";
import LiveClient from "./LiveClient";

function base64Url(input: Buffer) {
    return input
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
}

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
    const secret = process.env.TRACKING_SIGNING_SECRET || "";
    if (!secret) return false;

    const expected = base64Url(
        crypto.createHmac("sha256", secret).update(message).digest()
    );

    return expected === sig;
}

export default function LivePage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const params = new URLSearchParams();

    // normalize searchParams (Next may give string[])
    for (const [k, v] of Object.entries(searchParams)) {
        if (typeof v === "string") params.set(k, v);
        else if (Array.isArray(v) && v[0]) params.set(k, v[0]);
    }

    const valid = verifySignature(params);

    if (!valid) {
        return (
            <div className="h-screen flex items-center justify-center bg-black text-white">
                <div className="text-center px-6">
                    <h1 className="text-xl font-black tracking-tight">
                        Invalid or Expired Link
                    </h1>
                    <p className="opacity-60 mt-2">
                        This tracking session is no longer valid.
                    </p>
                </div>
            </div>
        );
    }

    const sid = params.get("sid")!;
    return <LiveClient sessionId={sid} />;
}