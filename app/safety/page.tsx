"use client";

import Image from "next/image";

const UPDATED_AT = "2026-02-22";
const VERSION = "1.0";

function fmtDate(iso: string) {
    const d = new Date(iso + "T00:00:00Z");
    return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "2-digit" });
}

function H2({ children, id }: { children: React.ReactNode; id?: string }) {
    return (
        <h2 id={id} className="text-white/92 font-black tracking-[-0.02em] text-[16px] md:text-[17px] scroll-mt-24">
            {children}
        </h2>
    );
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

function Example({ title, items }: { title: string; items: string[] }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-white/85 font-extrabold text-[12.5px]">{title}</div>
            <div className="mt-2">
                <UL items={items} />
            </div>
        </div>
    );
}

export default function SafetyPage() {
    const nav = [
        ["overview", "Overview"],
        ["design", "Safety-by-design"],
        ["consent", "Consent rules"],
        ["stalking", "Anti-stalking"],
        ["response", "Responding to alerts"],
        ["misuse", "Misuse prevention"],
        ["report", "Report abuse"],
        ["apptext", "App text (verbatim)"],
    ] as const;

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
                            <h1 className="text-white/92 font-black tracking-[-0.02em] text-[22px] md:text-[26px]">Safety & Anti-Stalking Policy</h1>
                            <div className="text-white/40 font-semibold text-[12px]">
                                Version {VERSION} • Updated: {fmtDate(UPDATED_AT)}
                            </div>
                        </div>

                        <P>
                            StayKnown is a safety product. This policy explains how StayKnown is intended to be used, what anti-stalking protections exist, and what we do
                            when misuse is suspected or reported.
                        </P>

                        <Callout
                            title="Safety first"
                            body="StayKnown is designed for voluntary safety check-ins and alerts to trusted contacts. It is not designed for covert tracking or monitoring without consent."
                        />

                        <div className="mt-6 h-px bg-white/10" />

                        <div className="mt-6 flex flex-wrap gap-2 text-[12px] font-semibold">
                            {nav.map(([id, label]) => (
                                <a
                                    key={id}
                                    href={`#${id}`}
                                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-white/60 hover:text-white/85 hover:bg-white/[0.06] transition"
                                >
                                    {label}
                                </a>
                            ))}
                        </div>

                        <div className="mt-8 space-y-8">
                            <div className="space-y-3">
                                <H2 id="overview">1) Overview</H2>
                                <P>
                                    Safety tools must be built carefully because they can be abused. StayKnown’s approach is: consent, transparency, user-control, and anti-abuse
                                    enforcement.
                                </P>
                                <Example
                                    title="What StayKnown is for"
                                    items={[
                                        "A person starting a Visit session to reassure family while traveling.",
                                        "A user sending an SOS alert to trusted contacts when they feel unsafe.",
                                        "Contacts receiving safety emails that clearly show it is a safety tool and user-triggered.",
                                    ]}
                                />
                            </div>

                            <div className="space-y-3">
                                <H2 id="design">2) Safety-by-design (how it’s meant to work)</H2>
                                <UL
                                    items={[
                                        "User initiated: sessions and SOS are started by the account holder.",
                                        "Stop anytime: ending the session stops sharing.",
                                        "Trusted contacts: you choose who receives alerts.",
                                        "No stealth: the product is not built for hidden tracking.",
                                        "Abuse controls: rate limits, restrictions, and review processes exist to reduce misuse.",
                                    ]}
                                />
                            </div>

                            <div className="space-y-3">
                                <H2 id="consent">3) Consent rules</H2>
                                <P>
                                    You must have a lawful basis and consent to share someone’s details or to notify them. You must inform your contacts that they may receive safety alerts.
                                </P>
                                <UL
                                    items={[
                                        "Only add contacts you have permission to notify.",
                                        "If a contact asks you to stop, remove them and stop sending alerts.",
                                        "Do not use alerts to pressure, threaten, or intimidate someone.",
                                    ]}
                                />
                            </div>

                            <div className="space-y-3">
                                <H2 id="stalking">4) Anti-stalking rules (strict)</H2>
                                <UL
                                    items={[
                                        "No tracking without consent or knowledge (covert surveillance).",
                                        "No harassment or intimidation via repeated alerts.",
                                        "No using location to control a person’s movement.",
                                        "No violating protective orders or legal restrictions.",
                                    ]}
                                />
                                <Example
                                    title="Not allowed"
                                    items={[
                                        "Sending repeated alerts to someone who asked you to stop.",
                                        "Using safety logs to threaten someone (“I know where you are”).",
                                        "Using StayKnown to coordinate harm or exploit someone.",
                                    ]}
                                />
                            </div>

                            <div className="space-y-3">
                                <H2 id="response">5) How contacts should respond to alerts</H2>
                                <P>
                                    Contacts receiving alerts should use judgment. If the user appears in danger, contacts should call the user and contact local emergency services as appropriate.
                                </P>
                                <UL
                                    items={[
                                        "If an SOS is received: try direct contact first if safe, then escalate to local emergency services where appropriate.",
                                        "If location updates seem delayed: treat them as approximate—networks may delay delivery.",
                                        "Never attempt unsafe intervention—use official emergency channels when needed.",
                                    ]}
                                />
                            </div>

                            <div className="space-y-3">
                                <H2 id="misuse">6) Misuse prevention & enforcement</H2>
                                <P>
                                    We may restrict accounts/devices/features if suspicious patterns are detected, including mass messaging, repeated false alerts, high-risk network signals,
                                    or repeated abuse reports.
                                </P>
                                <UL
                                    items={[
                                        "Warnings → feature restrictions → suspensions → permanent bans (depending on severity).",
                                        "We may preserve logs if required by law or necessary to prevent harm.",
                                        "We may cooperate with valid legal process.",
                                    ]}
                                />
                            </div>

                            <div className="space-y-3">
                                <H2 id="report">7) Reporting abuse</H2>
                                <P>Email: support@stay-known.com</P>
                                <P>
                                    Include what happened, dates/times, and any screenshots you can safely share. If you are in danger, contact your local emergency number first.
                                </P>
                            </div>

                            <div className="space-y-3">
                                <H2 id="apptext">Appendix A — In-app text this policy expands</H2>
                                <UL
                                    items={[
                                        "StayKnown is not designed for covert surveillance and is not intended for stalking, harassment, or monitoring anyone without permission.",
                                        "You may not use StayKnown to stalk, harass, intimidate, or threaten anyone, or track people without consent or knowledge.",
                                        "Violations may result in warnings, restrictions, suspensions, or permanent bans.",
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