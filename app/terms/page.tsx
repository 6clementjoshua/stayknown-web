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
        <h2
            id={id}
            className="text-white/92 font-black tracking-[-0.02em] text-[16px] md:text-[17px] scroll-mt-24"
        >
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

export default function TermsPage() {
    const nav = [
        ["accept", "Acceptance"],
        ["eligibility", "Eligibility"],
        ["accounts", "Accounts & security"],
        ["plans", "Plans & payments"],
        ["content", "User content"],
        ["acceptable", "Acceptable use"],
        ["ip", "IP ownership"],
        ["disclaimers", "Disclaimers"],
        ["liability", "Liability limits"],
        ["indemnity", "Indemnity"],
        ["termination", "Termination"],
        ["exports", "Export controls/sanctions"],
        ["disputes", "Disputes"],
        ["law", "Governing law"],
        ["changes", "Changes"],
        ["contact", "Contact"],
        ["apptext", "App terms (verbatim)"],
    ] as const;

    return (
        <main className="min-h-screen bg-black flex flex-col">
            {/* Brand */}
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
                            <h1 className="text-white/92 font-black tracking-[-0.02em] text-[22px] md:text-[26px]">
                                Terms of Use
                            </h1>
                            <div className="text-white/40 font-semibold text-[12px]">
                                Version {VERSION} • Updated: {fmtDate(UPDATED_AT)}
                            </div>
                        </div>

                        <P>
                            These Terms of Use govern your access to and use of StayKnown (the “Service”). By using the Service, you agree to these Terms and the
                            Privacy Policy. If you do not agree, do not use the Service.
                        </P>

                        <Callout
                            title="Safety disclaimer"
                            body="StayKnown is not emergency services. If you are in immediate danger, contact your local emergency number first."
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
                                <H2 id="accept">1) Acceptance of Terms</H2>
                                <P>
                                    By accessing or using StayKnown, you agree to comply with these Terms. If you use the Service on behalf of another person or an organization,
                                    you represent you have authority to accept these Terms for them.
                                </P>
                                <Example
                                    title="Example"
                                    items={[
                                        "If a company creates accounts for staff, the company must have authority and must ensure lawful, consent-based use.",
                                        "If you set up the app for a dependent, you must have explicit permission and comply with local law.",
                                    ]}
                                />
                            </div>

                            <div className="space-y-3">
                                <H2 id="eligibility">2) Eligibility & lawful use</H2>
                                <UL
                                    items={[
                                        "StayKnown is for lawful, safety-focused use only.",
                                        "You may not use StayKnown for stalking, harassment, intimidation, fraud, or threats.",
                                        "If local law restricts certain safety or location-sharing tools, you must comply with local law.",
                                    ]}
                                />
                                <P>
                                    StayKnown is designed to be user-controlled and transparent. Attempts to use the Service to secretly track someone, to bypass consent,
                                    or to violate restraining/protective orders are prohibited.
                                </P>
                            </div>

                            <div className="space-y-3">
                                <H2 id="accounts">3) Accounts & security</H2>
                                <UL
                                    items={[
                                        "You are responsible for maintaining the security of your account and device.",
                                        "Do not share credentials in ways that enable misuse.",
                                        "You must keep your contact information and safety contacts reasonably up to date.",
                                        "We may restrict or suspend access if we detect abuse, fraud, or risk to public safety.",
                                    ]}
                                />
                            </div>

                            <div className="space-y-3">
                                <H2 id="plans">4) Plans, payments & purchases</H2>
                                <P>
                                    StayKnown may offer free and paid plans (Starter, Pro, ProMax) with different features and limits. Pricing and features will be shown before you confirm a purchase.
                                </P>
                                <UL
                                    items={[
                                        "Payments may be processed by third parties (app stores or payment providers) and are subject to their terms.",
                                        "Digital items/subscriptions may be non-refundable where allowed by law, unless stated otherwise at purchase time.",
                                        "You must not use payments for money laundering, fraud, or illegal activity.",
                                    ]}
                                />
                            </div>

                            <div className="space-y-3">
                                <H2 id="content">5) User content & messaging (if available)</H2>
                                <P>
                                    If the Service includes posting, messaging, stories, or user-generated content, you are responsible for what you upload and share.
                                    We may remove content or restrict accounts to protect users and comply with law.
                                </P>
                                <UL
                                    items={[
                                        "No illegal content.",
                                        "No hate content, threats, or harassment.",
                                        "No content that targets a person for harm, intimidation, or exploitation.",
                                    ]}
                                />
                            </div>

                            <div className="space-y-3">
                                <H2 id="acceptable">6) Acceptable use (anti-stalking / anti-harassment)</H2>
                                <UL
                                    items={[
                                        "You may not use StayKnown to stalk, harass, intimidate, or threaten anyone.",
                                        "You may not track a person without consent or knowledge (covert surveillance).",
                                        "You may not use the Service to facilitate violence, kidnapping, extortion, trafficking, or harm.",
                                        "You may not abuse email delivery to spam or target third parties.",
                                        "You may not attempt to access data that is not yours or disrupt the Service.",
                                    ]}
                                />
                                <Example
                                    title="Plain examples"
                                    items={[
                                        "Allowed: sharing a late-night ride route with a trusted family member you informed.",
                                        "Not allowed: adding someone’s email repeatedly to annoy them or pressure them.",
                                        "Not allowed: trying to bypass plan limits or automate mass alerts.",
                                    ]}
                                />
                            </div>

                            <div className="space-y-3">
                                <H2 id="ip">7) Intellectual property</H2>
                                <UL
                                    items={[
                                        "StayKnown’s branding, designs, code, and assets are owned by the operator or licensors.",
                                        "You may not copy, reverse engineer, modify, or misuse the Service or branding except as permitted by law.",
                                        "Feedback you provide may be used to improve the Service without obligation to you.",
                                    ]}
                                />
                            </div>

                            <div className="space-y-3">
                                <H2 id="disclaimers">8) Disclaimers</H2>
                                <UL
                                    items={[
                                        "The Service is provided “as is” and “as available.”",
                                        "We do not guarantee uninterrupted service, real-time delivery, or perfect location accuracy.",
                                        "Third-party networks (mobile, GPS, email providers, app stores) may delay or block messages.",
                                    ]}
                                />
                            </div>

                            <div className="space-y-3">
                                <H2 id="liability">9) Limitation of liability</H2>
                                <UL
                                    items={[
                                        "To the maximum extent permitted by law, we are not liable for indirect, incidental, special, consequential, or punitive damages.",
                                        "You are responsible for how you use the Service and who you notify.",
                                        "Some jurisdictions do not allow certain limitations; in those cases, limitations apply to the extent permitted by law.",
                                    ]}
                                />
                                <P>
                                    This includes situations where messages are delayed, where location accuracy is imperfect, or where recipients choose not to respond.
                                </P>
                            </div>

                            <div className="space-y-3">
                                <H2 id="indemnity">10) Indemnity</H2>
                                <P>
                                    You agree to defend, indemnify, and hold harmless the service operator from claims, liabilities, damages, losses, and expenses
                                    arising from your misuse of StayKnown, violation of these terms, or violation of law.
                                </P>
                            </div>

                            <div className="space-y-3">
                                <H2 id="termination">11) Termination</H2>
                                <UL
                                    items={[
                                        "We may suspend or terminate access for violations of Policies & Terms, illegal activity, or to protect users and the public.",
                                        "You may stop using StayKnown at any time.",
                                    ]}
                                />
                                <P>
                                    We may also apply partial restrictions (for example: disabling mass notifications) when needed for safety.
                                </P>
                            </div>

                            <div className="space-y-3">
                                <H2 id="exports">12) Export controls & sanctions</H2>
                                <P>
                                    Access from certain regions may be limited to comply with sanctions, export controls, or platform requirements. You agree not to use the Service
                                    in violation of applicable export/sanctions laws.
                                </P>
                            </div>

                            <div className="space-y-3">
                                <H2 id="disputes">13) Disputes & complaints</H2>
                                <P>
                                    If you have a complaint, contact support first so we can try to resolve it quickly. Some jurisdictions require specific consumer rights processes.
                                </P>
                                <P>
                                    If you want an arbitration clause later, tell me and we’ll add it carefully (because it changes legal posture).
                                </P>
                            </div>

                            <div className="space-y-3">
                                <H2 id="law">14) Governing law</H2>
                                <UL
                                    items={[
                                        "These terms are intended to be interpreted in a manner consistent with applicable laws in your jurisdiction.",
                                        "If any provision is found unenforceable, the remaining provisions remain effective.",
                                    ]}
                                />
                            </div>

                            <div className="space-y-3">
                                <H2 id="changes">15) Changes to Terms</H2>
                                <P>
                                    We may update these Terms to reflect new features, safety improvements, legal requirements, or operational changes. If updates are material,
                                    we will provide notice and may require acceptance before continued use.
                                </P>
                            </div>

                            <div className="space-y-3">
                                <H2 id="contact">16) Contact</H2>
                                <P>Support: support@stay-known.com</P>
                            </div>

                            <div className="space-y-3">
                                <H2 id="apptext">Appendix A — Your in-app terms text (verbatim)</H2>
                                <P>The bullets below match what the StayKnown app shows inside the in-app dialog.</P>

                                <H3>1) Acceptance of Terms</H3>
                                <UL
                                    items={[
                                        "By using StayKnown, you agree to these Policies & Terms.",
                                        "If you do not agree, do not use the service.",
                                        "If you accept on behalf of an organization or another person, you represent that you have authority to do so.",
                                    ]}
                                />
                                <H3>2) Accounts & Security</H3>
                                <UL
                                    items={[
                                        "You are responsible for maintaining the security of your account and device.",
                                        "Do not share login credentials in ways that could allow misuse.",
                                        "You must provide accurate information and keep your emergency contacts up to date.",
                                        "We may restrict or suspend access if we detect abuse, fraud, or risk to public safety.",
                                    ]}
                                />
                                <H3>3) Plans, Payments & Purchases</H3>
                                <UL
                                    items={[
                                        "StayKnown may offer free and paid plans (e.g., Starter, Pro, ProMax) with different feature access and limits.",
                                        "If purchases are offered, pricing and features will be shown in-app before you confirm.",
                                        "Payments may be processed by third-party payment providers or app stores. Your payment is also subject to their terms.",
                                        "Digital items, subscriptions, or in-app benefits may be non-refundable where allowed by law, unless otherwise stated at purchase time.",
                                        "You must not use payments to launder money, fund illegal activity, or conduct fraud.",
                                    ]}
                                />
                                <H3>4) User Content & Messaging (if available)</H3>
                                <UL
                                    items={[
                                        "If StayKnown includes posting, messaging, stories, or user-generated content features, you are responsible for content you upload and share.",
                                        "You must not upload illegal content, hateful content, content that incites violence, or content that targets or harasses others.",
                                        "We may remove content or restrict accounts to comply with law, protect users, or enforce these terms.",
                                    ]}
                                />
                                <H3>5) Intellectual Property</H3>
                                <UL
                                    items={[
                                        "StayKnown and its branding, designs, code, and assets are owned by the service operator or its licensors.",
                                        "You may not copy, reverse engineer, modify, or misuse the service or its branding except as permitted by law.",
                                        "Feedback you provide may be used to improve the service without obligation to you.",
                                    ]}
                                />
                                <H3>6) Disclaimers</H3>
                                <UL
                                    items={[
                                        "StayKnown is provided “as is” and “as available.”",
                                        "We do not guarantee uninterrupted service, real-time delivery, or perfect location accuracy.",
                                        "Third-party networks (mobile, GPS, email providers, app stores) may delay or block messages.",
                                    ]}
                                />
                                <H3>7) Limitation of Liability</H3>
                                <UL
                                    items={[
                                        "To the maximum extent permitted by law, we are not liable for indirect, incidental, special, consequential, or punitive damages.",
                                        "You are responsible for how you use the service and who you notify.",
                                        "Some jurisdictions do not allow certain limitations; in those cases, limitations apply to the extent permitted by law.",
                                    ]}
                                />
                                <H3>8) Indemnity</H3>
                                <UL
                                    items={[
                                        "You agree to defend, indemnify, and hold harmless the service operator from claims, liabilities, damages, losses, and expenses arising from your misuse of StayKnown, violation of these terms, or violation of law.",
                                    ]}
                                />
                                <H3>9) Termination</H3>
                                <UL
                                    items={[
                                        "We may suspend or terminate access for violations of Policies & Terms, illegal activity, or to protect users and the public.",
                                        "You may stop using StayKnown at any time.",
                                    ]}
                                />
                                <H3>10) Governing Law</H3>
                                <UL
                                    items={[
                                        "These terms are intended to be interpreted in a manner consistent with applicable laws in your jurisdiction.",
                                        "If any provision is found unenforceable, the remaining provisions remain effective.",
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
                            <div className="mt-2 text-[11px] font-semibold text-white/30">
                                {new Date().getFullYear()} • stay-known.com
                            </div>
                        </div>
                    </article>
                </div>
            </section>
        </main>
    );
}