import LiveClient from "./live-client";
import { accessFromSearchParams, verifyLiveAccess } from "./live-access";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function InvalidState({ reason }: { reason?: string }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#222_0%,#080808_52%,#000_100%)] text-white grid place-items-center px-5 py-10">
      <section className="relative w-full max-w-[520px] overflow-hidden rounded-[34px] border border-white/12 bg-white/[0.055] p-7 text-center shadow-[0_32px_110px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl md:p-9">
        <div className="pointer-events-none absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-[22px] border border-white/14 bg-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-12px_26px_rgba(0,0,0,0.22),0_18px_40px_rgba(0,0,0,0.32)]">
          <img
            src="/6logo.png"
            alt="StayKnown"
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
          This signed live Visit link is no longer available. Ask the visitor
          for a fresh link when the Visit is still active.
        </p>

        {reason ? (
          <div className="mx-auto mt-5 inline-flex rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-[9px] font-extrabold uppercase tracking-[0.17em] text-white/38">
            Reference: {reason}
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default async function LivePage({
  searchParams,
}: {
  searchParams:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
}) {
  const resolved = await searchParams;
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(resolved ?? {})) {
    if (typeof value === "string") params.set(key, value);
    else if (Array.isArray(value) && typeof value[0] === "string") {
      params.set(key, value[0]);
    }
  }

  const access = accessFromSearchParams(params);
  const verified = verifyLiveAccess(access);

  if (!verified.ok) return <InvalidState reason={verified.reason} />;

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
