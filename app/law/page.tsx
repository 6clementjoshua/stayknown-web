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

export default function LawPage() {
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
                            <h1 className="text-white/92 font-black tracking-[-0.02em] text-[22px] md:text-[26px]">Law Enforcement & Legal Requests</h1>
                            <div className="text-white/40 font-semibold text-[12px]">
                                Version {VERSION} • Updated: {fmtDate(UPDATED_AT)}
                            </div>
                        </div>

                        <div className="mt-6 space-y-6">
                            <div className="space-y-3">
                                <H2>1) General approach</H2>
                                <P>
                                    StayKnown respects applicable laws and may respond to valid legal process as required. We do not support covert surveillance and we encourage
                                    lawful, transparent use.
                                </P>
                            </div>

                            <div className="space-y-3">
                                <H2>2) When we may disclose information</H2>
                                <UL
                                    items={[
                                        "To comply with law or valid legal process.",
                                        "To enforce our terms and policies.",
                                        "To protect rights and safety and to prevent harm.",
                                        "To prevent or investigate fraud, abuse, or threats.",
                                    ]}
                                />
                            </div>

                            <div className="space-y-3">
                                <H2>3) Preservation</H2>
                                <P>
                                    Where required by law or reasonably needed to investigate abuse or threats, we may preserve logs and records. Preservation does not necessarily
                                    mean disclosure, but it may be necessary for safety and legal compliance.
                                </P>
                            </div>

                            <div className="space-y-3">
                                <H2>4) In-app text this page expands</H2>
                                <UL
                                    items={[
                                        "We respect applicable laws and may respond to valid legal process as required.",
                                        "We may disclose information if we believe it is necessary to comply with law, enforce our terms, protect rights and safety, prevent fraud, or prevent harm.",
                                        "We may preserve logs and records where required by law or where reasonably needed to investigate abuse or threats.",
                                        "We encourage lawful, transparent use and do not support covert surveillance.",
                                    ]}
                                />
                            </div>

                            <div className="space-y-3">
                                <H2>5) Contact</H2>
                                <P>support@stay-known.com</P>
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