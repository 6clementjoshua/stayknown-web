// app/live/page.tsx
// StayKnown Upgrade Master File Record:
// secure recipient-bound LIVE Visit entry page.

import type { Metadata } from "next";
import Image from "next/image";

import LiveClient from "./live-client";
import { accessFromSearchParams, verifyLiveAccess } from "./live-access";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Secure LIVE Visit | StayKnown",
  description: "Protected recipient-bound StayKnown LIVE Visit access.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

type LiveSearchParams = Record<string, string | string[] | undefined>;

function firstSearchValue(value: string | string[] | undefined): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }

  return null;
}

/*
Never render the raw verification failure supplied by live-access.ts.

Those internal values can reveal signature, audience, token-version, expiry,
or recipient-validation details. The visitor only needs a stable support
reference that does not disclose how verification failed.
*/
function safeInvalidReference(reason: unknown): string {
  const normalized =
    typeof reason === "string" ? reason.trim().toLowerCase() : "";

  if (!normalized) return "LIVE-LINK-INVALID";
  if (normalized.includes("expired")) return "LIVE-LINK-EXPIRED";
  if (normalized.includes("missing")) return "LIVE-LINK-INCOMPLETE";

  if (
    normalized.includes("signature") ||
    normalized.includes("signed") ||
    normalized.includes("sig")
  ) {
    return "LIVE-LINK-UNVERIFIED";
  }

  if (
    normalized.includes("audience") ||
    normalized.includes("recipient") ||
    normalized.includes("version") ||
    normalized.includes("subject") ||
    normalized.includes("session")
  ) {
    return "LIVE-LINK-NOT-AUTHORIZED";
  }

  return "LIVE-LINK-INVALID";
}

function InvalidState({ reference }: { reference: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#222_0%,#080808_52%,#000_100%)] px-5 py-10 text-white">
      <section className="relative w-full max-w-[520px] overflow-hidden rounded-[34px] border border-white/12 bg-white/[0.055] p-7 text-center shadow-[0_32px_110px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl md:p-9">
        <div className="pointer-events-none absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

        <div className="mx-auto grid h-16 w-16 place-items-center rounded-[22px] border border-white/14 bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-12px_26px_rgba(0,0,0,0.22),0_18px_40px_rgba(0,0,0,0.32)]">
          <Image
            src="/6logo.png"
            alt="StayKnown"
            width={28}
            height={28}
            priority
            className="h-7 w-7 object-contain"
          />
        </div>

        <div className="mt-5 text-[10px] font-black uppercase tracking-[0.34em] text-white/46">
          StayKnown secure map
        </div>

        <h1 className="mt-3 text-[26px] font-black tracking-[-0.035em] md:text-[30px]">
          Invalid or expired link
        </h1>

        <p className="mx-auto mt-3 max-w-[420px] text-[13px] font-medium leading-6 text-white/62">
          This signed LIVE Visit link is no longer available. Ask the visitor
          for a fresh link while the Visit is still active.
        </p>

        <div className="mx-auto mt-5 inline-flex rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-[9px] font-extrabold uppercase tracking-[0.17em] text-white/38">
          Reference: {reference}
        </div>
      </section>
    </main>
  );
}

export default async function LivePage({
  searchParams,
}: {
  searchParams: Promise<LiveSearchParams> | LiveSearchParams;
}) {
  const resolved = await searchParams;
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(resolved ?? {})) {
    const firstValue = firstSearchValue(value);

    if (firstValue !== null) {
      params.set(key, firstValue);
    }
  }

  const access = accessFromSearchParams(params);
  const verified = verifyLiveAccess(access);

  if (!verified.ok) {
    return <InvalidState reference={safeInvalidReference(verified.reason)} />;
  }

  return (
    <LiveClient
      access={{
        sid: verified.sid,
        exp: verified.exp,
        uid: verified.uid,
        aud: verified.signedAud,
        sig: verified.sig,
        rid: verified.rid,
        version: verified.version,
      }}
    />
  );
}
