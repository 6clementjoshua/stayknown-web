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

function H3({ children }: { children: React.ReactNode }) {
    return <div className="text-white/85 font-extrabold text-[13.5px] mt-3">{children}</div>;
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

export default function AcceptableUsePage() {
    const nav = [
        ["purpose", "Purpose"],
        ["rules", "Core rules"],
        ["stalking", "Anti-stalking & harassment"],
        ["fraud", "Fraud/scam misuse"],
        ["danger", "Violence & harm"],
        ["spam", "Spam & contact abuse"],
        ["security", "Security & interference"],
        ["reporting", "Reporting & enforcement"],
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
                            <h1 className="text-white/92 font-black tracking-[-0.02em] text-[22px] md:text-[26px]">Acceptable Use Policy</h1>
                            <div className="text-white/40 font-semibold text-[12px]">
                                Version {VERSION} • Updated: {fmtDate(UPDATED_AT)}
                            </div>
                        </div>

                        <P>
                            This policy explains what is allowed and not allowed when using StayKnown. It is written for a global safety product and focuses on
                            preventing stalking, harassment, scams, and misuse that can put people at risk.
                        </P>

                        <Callout
                            title="Zero tolerance for stalking"
                            body="StayKnown is designed for voluntary safety sharing. Any attempt to use the product to secretly track, harass, intimidate, or target someone is prohibited and may result in restriction, ban, and cooperation with lawful requests."
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
                                <H2 id="purpose">1) Purpose</H2>
                                <P>
                                    StayKnown exists to help people stay safe during travel, meetups, late-night movement, and other real-life situations. The product is built
                                    around consent and transparency: you start sessions, you choose contacts, and you can stop sharing.
                                </P>
                                <Example
                                    title="Allowed use"
                                    items={[
                                        "Sharing your route with a trusted family member while traveling at night.",
                                        "Starting a Visit session to reduce fear and uncertainty during a first meeting.",
                                        "Using SOS to notify trusted contacts when you feel unsafe (where available).",
                                    ]}
                                />
                            </div>

                            <div className="space-y-3">
                                <H2 id="rules">2) Core rules (plain language)</H2>
                                <UL
                                    items={[
                                        "Use StayKnown only for lawful, safety-focused purposes.",
                                        "Only add contacts you have permission to notify.",
                                        "Do not create false emergencies or fake SOS alerts.",
                                        "Do not attempt to bypass plan limits or manipulate the product.",
                                        "Respect requests to stop—remove contacts if asked.",
                                    ]}
                                />
                            </div>

                            <div className="space-y-3">
                                <H2 id="stalking">3) Anti-stalking & harassment</H2>
                                <P>
                                    You may not use StayKnown to stalk, harass, intimidate, threaten, or monitor someone without permission. This includes repeated unwanted
                                    notifications, tracking behavior, coercion, and using location signals to control or frighten someone.
                                </P>
                                <UL
                                    items={[
                                        "No covert surveillance: do not use StayKnown to secretly track people.",
                                        "No intimidation: do not use alerts to scare or pressure someone.",
                                        "No control: do not use safety tools to control where someone goes or who they meet.",
                                        "No violations of protective orders: do not use StayKnown to violate restraining/protective orders.",
                                    ]}
                                />
                                <Example
                                    title="Not allowed"
                                    items={[
                                        "Adding your ex-partner’s email to repeatedly send unwanted session alerts.",
                                        "Using location sharing to follow someone after they told you to stop.",
                                        "Starting sessions to ‘prove’ someone’s location or to threaten them.",
                                    ]}
                                />
                            </div>

                            <div className="space-y-3">
                                <H2 id="fraud">4) Fraud, scams, and kidnapping-related misuse</H2>
                                <P>
                                    Safety tools can be abused by criminals (for example: scams, extortion, kidnapping coordination, or creating fake emergencies). StayKnown
                                    strictly prohibits using the Service to lure, trap, extort, or mislead anyone.
                                </P>
                                <UL
                                    items={[
                                        "No false emergencies: do not use SOS to create panic or mislead contacts.",
                                        "No luring: do not use StayKnown to convince someone to go somewhere unsafe.",
                                        "No extortion: do not use safety logs or contact alerts to threaten or pressure someone.",
                                    ]}
                                />
                                <Callout
                                    title="Protecting communities"
                                    body="If we detect suspicious patterns (mass messaging, repeated false alerts, unusual device/network signals, repeated reports), we may restrict accounts or devices to prevent harm."
                                />
                            </div>

                            <div className="space-y-3">
                                <H2 id="danger">5) Violence, harm, and exploitation</H2>
                                <UL
                                    items={[
                                        "No violence facilitation: do not use StayKnown to coordinate harm.",
                                        "No trafficking exploitation: do not use StayKnown to target or move victims.",
                                        "No targeting vulnerable people: do not use the Service to identify or exploit others.",
                                    ]}
                                />
                            </div>

                            <div className="space-y-3">
                                <H2 id="spam">6) Spam & contact abuse</H2>
                                <P>
                                    Contact delivery is a safety channel—not a marketing channel. You may not spam people, bulk-message strangers, or repeatedly trigger
                                    alerts to cause distress.
                                </P>
                                <UL
                                    items={[
                                        "Do not add contacts without permission.",
                                        "Do not repeatedly trigger alerts to annoy or threaten someone.",
                                        "Do not use StayKnown as a broadcast or promotional system.",
                                    ]}
                                />
                            </div>

                            <div className="space-y-3">
                                <H2 id="security">7) Security, interference, and bypass attempts</H2>
                                <UL
                                    items={[
                                        "Do not attempt to reverse engineer, disrupt, or interfere with the Service.",
                                        "Do not attempt to access accounts, sessions, or data that are not yours.",
                                        "Do not bypass device integrity checks, rate limits, or anti-abuse protections.",
                                    ]}
                                />
                            </div>

                            <div className="space-y-3">
                                <H2 id="reporting">8) Reporting & enforcement</H2>
                                <P>
                                    Violations may lead to warnings, restrictions, suspension, or permanent ban. Where required by law or necessary to prevent harm, we may
                                    preserve logs and cooperate with lawful requests.
                                </P>
                                <P>To report misuse: support@stay-known.com (include what happened, dates, and any screenshots you can safely share).</P>
                            </div>

                            <div className="space-y-3">
                                <H2 id="apptext">Appendix A — In-app text this policy expands</H2>
                                <P>This page expands the short “Prohibited Uses / Fraud / Platform Integrity / Duties” content shown inside the app.</P>

                                <H3>Prohibited Uses (in-app)</H3>
                                <UL
                                    items={[
                                        "You may not use StayKnown to:",
                                        "• Stalk, harass, intimidate, or threaten anyone.",
                                        "• Track people without consent or knowledge (covert surveillance).",
                                        "• Facilitate physical harm, kidnapping, extortion, trafficking, or violence.",
                                        "• Collect location data to target or exploit a person.",
                                        "• Abuse email delivery (spamming contacts or third parties).",
                                        "• Attempt to access accounts, sessions, or data that are not yours.",
                                        "• Reverse engineer, interfere with, or disrupt the service.",
                                        "• Use the service to violate restraining orders, protective orders, or similar legal restrictions.",
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