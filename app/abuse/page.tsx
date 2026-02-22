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

export default function RetentionPage() {
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
                            <h1 className="text-white/92 font-black tracking-[-0.02em] text-[22px] md:text-[26px]">Data Retention Policy</h1>
                            <div className="text-white/40 font-semibold text-[12px]">
                                Version {VERSION} • Updated: {fmtDate(UPDATED_AT)}
                            </div>
                        </div>

                        <Callout
                            title="Retention has a safety purpose"
                            body="We retain certain records to provide history, prevent abuse, investigate misuse, resolve disputes, and comply with legal obligations."
                        />

                        <div className="mt-6 space-y-6">
                            <div className="space-y-3">
                                <H2>1) What we may retain</H2>
                                <UL
                                    items={[
                                        "Safety session logs (start/stop time, state changes).",
                                        "Notification delivery records (timestamps/status).",
                                        "Security and abuse-prevention logs (rate limiting, suspicious patterns).",
                                        "Support communications (to resolve issues and prevent repeated abuse).",
                                    ]}
                                />
                            </div>

                            <div className="space-y-3">
                                <H2>2) Why we retain it</H2>
                                <UL
                                    items={[
                                        "To show your history and help you understand your own safety sessions.",
                                        "To reduce harassment, fraud, and stalking attempts.",
                                        "To investigate reports and enforce policies.",
                                        "To comply with law and preserve records when required.",
                                    ]}
                                />
                            </div>

                            <div className="space-y-3">
                                <H2>3) Deletion requests</H2>
                                <P>
                                    You may request deletion where applicable, but some data may be retained for legal, security, safety auditing, or abuse prevention reasons.
                                    Contact support: support@stay-known.com
                                </P>
                            </div>

                            <div className="space-y-3">
                                <H2>4) In-app text this page expands</H2>
                                <UL
                                    items={[
                                        "Retention: we may retain safety logs for a reasonable period to provide history, prevent abuse, resolve disputes, comply with legal obligations, and meet safety auditing needs.",
                                        "Some records may be retained longer where required by law or for legitimate safety interests.",
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