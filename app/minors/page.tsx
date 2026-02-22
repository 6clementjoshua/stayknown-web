"use client";

import Image from "next/image";

const UPDATED_AT = "2026-02-22";
const VERSION = "1.0";

function fmtDate(iso: string) {
    const d = new Date(iso + "T00:00:00Z");
    return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "2-digit" });
}
function H2({ children }: { children: React.ReactNode }) {
    return <h2 className="text-white/92 font-black tracking-[-0.02em] text-[16px] md:text-[17px]">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
    return <p className="text-white/62 font-semibold text-[13px] leading-relaxed">{children}</p>;
}
function UL({ items }: { items: string[] }) {
    return (
        <ul className="ml-5 list-disc space-y-1 text-white/62 font-semibold text-[13px] leading-relaxed">
            {items.map((t, i) => (
                <li key={i}>{t}</li>
            ))}
        </ul>
    );
}
function Callout({ title, body }: { title: string; body: string }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-white/90 font-extrabold text-[12.5px]">{title}</div>
            <div className="mt-2 text-white/62 font-semibold text-[13px] leading-relaxed">{body}</div>
        </div>
    );
}

export default function MinorsPage() {
    return (
        <main className="min-h-screen bg-black flex flex-col">
            <header className="pt-7">
                <div className="mx-auto max-w-6xl px-4 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <Image src="/6logo.png" alt="StayKnown" width={34} height={34} priority />
                        <div className="text-white font-extrabold tracking-[0.28em] text-[12px]">STAYKNOWN</div>
                    </div>
                </div>
            </header>

            <section className="w-full">
                <div className="mx-auto max-w-4xl px-4 pt-10 pb-16">
                    <article className="card glass p-6 md:p-7">
                        <div className="flex items-baseline justify-between gap-4 flex-wrap">
                            <h1 className="text-white/92 font-black tracking-[-0.02em] text-[22px] md:text-[26px]">Child Safety & Minor Use</h1>
                            <div className="text-white/40 font-semibold text-[12px]">
                                Version {VERSION} • Updated: {fmtDate(UPDATED_AT)}
                            </div>
                        </div>

                        <Callout
                            title="Child safety commitment"
                            body="StayKnown is designed for safety. Minors must use the product only with proper guardian permission and lawful basis, and only for safety-focused use."
                        />

                        <div className="mt-6 space-y-6">
                            <div className="space-y-3">
                                <H2>1) Age rules (global baseline)</H2>
                                <UL
                                    items={[
                                        "Under 13: Not permitted to create an account or use StayKnown.",
                                        "13–15: Permitted only with active permission and supervision of a parent/legal guardian and only for lawful safety use.",
                                        "16–17: Permitted with permission/consent of a parent/legal guardian and only for lawful safety use.",
                                        "18+: Permitted subject to policies and terms.",
                                    ]}
                                />
                                <P>If your local law sets a higher age threshold or requires parental consent for older minors, local law controls.</P>
                            </div>

                            <div className="space-y-3">
                                <H2>2) Guardian responsibilities</H2>
                                <UL
                                    items={[
                                        "Guardians must ensure lawful basis and consent before setting up the app for a minor.",
                                        "Guardians should explain how alerts work and who receives them.",
                                        "Guardians should choose trusted contacts and keep them updated.",
                                    ]}
                                />
                            </div>

                            <div className="space-y-3">
                                <H2>3) Prohibited use involving minors</H2>
                                <UL
                                    items={[
                                        "No covert monitoring of minors outside lawful guardian/authorized supervision.",
                                        "No using the Service to target, exploit, or threaten minors.",
                                        "No using StayKnown to facilitate grooming, harassment, or intimidation.",
                                    ]}
                                />
                            </div>

                            <div className="space-y-3">
                                <H2>4) Reporting child safety issues</H2>
                                <P>If you believe a minor is at risk or the Service is being used to target a minor, contact:</P>
                                <P>support@stay-known.com</P>
                                <P>If there is immediate danger, contact your local emergency number.</P>
                            </div>

                            <div className="space-y-3">
                                <H2>5) In-app text this page expands</H2>
                                <UL
                                    items={[
                                        "Under 13: Not permitted to create an account or use StayKnown.",
                                        "13–15: permitted only with active permission and supervision of a parent or legal guardian.",
                                        "16–17: permitted with parent/guardian consent and lawful safety use.",
                                        "If local law sets a higher threshold, local law controls.",
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="mt-10 h-px bg-white/10" />
                        <div className="mt-6 text-center">
                            <div className="text-[12px] font-semibold text-white/50">
                                A 6 Clement Joshua service
                                <span className="text-white/25 ml-1 align-super text-[10px]">™</span>
                            </div>
                            <div className="mt-2 text-[11px] font-semibold text-white/30">{new Date().getFullYear()} • stay-known.com</div>
                        </div>
                    </article>
                </div>
            </section>
        </main>
    );
}