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

function Callout({
    title,
    body,
}: {
    title: string;
    body: string;
}) {
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

export default function PrivacyPage() {
    const nav = [
        ["scope", "Scope"],
        ["principles", "Privacy principles"],
        ["collect", "Data we collect"],
        ["use", "How we use data"],
        ["location", "Location data"],
        ["contacts", "Contacts & notifications"],
        ["sharing", "Sharing & disclosures"],
        ["retention", "Retention"],
        ["security", "Security"],
        ["children", "Children & minors"],
        ["international", "International transfers"],
        ["rights", "Your rights (GDPR/UK + CCPA)"],
        ["law", "Law enforcement requests"],
        ["changes", "Changes"],
        ["contact", "Contact"],
        ["apptext", "App text (verbatim)"],
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
                                Privacy Policy
                            </h1>
                            <div className="text-white/40 font-semibold text-[12px]">
                                Version {VERSION} • Updated: {fmtDate(UPDATED_AT)}
                            </div>
                        </div>

                        <P>
                            StayKnown is a global personal-safety platform built for voluntary safety check-ins, visit sessions, and emergency alerts to trusted
                            contacts. This Privacy Policy explains what information we collect, why we collect it, how we share it, and the choices you have.
                            If you use StayKnown, you agree to the processing described here.
                        </P>

                        <Callout
                            title="Important safety note"
                            body="StayKnown is not a substitute for emergency services. If you are in immediate danger, contact your local emergency number first."
                        />

                        <div className="mt-6 h-px bg-white/10" />

                        {/* Quick nav chips */}
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
                            {/* 1) Scope */}
                            <div className="space-y-3">
                                <H2 id="scope">1) Scope / Who this applies to</H2>
                                <P>
                                    This Privacy Policy applies to StayKnown’s website, apps, and services (together, the “Service”). It covers information processed
                                    when you create an account, start a visit session, share updates with trusted contacts, use SOS (where available), or contact our support.
                                </P>
                                <P>
                                    If you use StayKnown on behalf of another person (for example, a dependent or staff member), you must have explicit permission and a lawful basis.
                                    You may be asked to demonstrate that permission.
                                </P>
                                <Example
                                    title="Simple examples"
                                    items={[
                                        "If you start a Visit, we process the session start time so your history and alerts work.",
                                        "If you add a contact email, we process it to send safety alerts you trigger.",
                                        "If you enable location updates during a Visit, we process coordinates so your chosen contacts can see where you are (during the active session).",
                                    ]}
                                />
                            </div>

                            {/* 2) Principles */}
                            <div className="space-y-3">
                                <H2 id="principles">2) Privacy principles we follow</H2>
                                <UL
                                    items={[
                                        "Minimum necessary: we aim to collect and store only what is needed to operate safety features, prevent abuse, and meet legal obligations.",
                                        "User control: safety sessions and SOS are user-initiated; there is no “silent tracking mode” built to secretly monitor people.",
                                        "Transparency: we explain what we collect and how it is used; we provide clear policy text and updates when material changes occur.",
                                        "Security: we apply security safeguards designed to protect data from unauthorized access.",
                                        "Abuse prevention: we may restrict or investigate suspicious activity to protect users, contacts, and the public.",
                                    ]}
                                />
                                <Callout
                                    title="What this means in normal words"
                                    body="We try to take only what we need, keep it secure, and ensure the product cannot be used as a stalking or harassment tool."
                                />
                            </div>

                            {/* 3) Data we collect */}
                            <div className="space-y-3">
                                <H2 id="collect">3) What information we collect</H2>

                                <H3>3.1 Account & identity information</H3>
                                <UL
                                    items={[
                                        "Identifiers needed to operate your account (for example: email).",
                                        "Authentication and session data used to keep you signed in securely.",
                                        "Basic profile fields you choose to provide.",
                                    ]}
                                />

                                <H3>3.2 Safety session & app activity information</H3>
                                <UL
                                    items={[
                                        "Visit sessions: start/stop times, session state, optional destination and timing notes you enter, and event logs.",
                                        "History events: records of your own safety sessions and actions for personal review and safety auditing.",
                                        "Notification events: delivery status, timestamps, and which contact identifiers you provided.",
                                    ]}
                                />

                                <H3>3.3 Location information (optional, permission-based)</H3>
                                <UL
                                    items={[
                                        "Approximate or precise location coordinates during active sessions when you grant location permission.",
                                        "Technical signals that affect accuracy (for example: GPS availability, network conditions).",
                                    ]}
                                />

                                <H3>3.4 Contacts you choose to notify</H3>
                                <UL
                                    items={[
                                        "Contact identifiers you provide (email/other identifiers depending on features).",
                                        "We rely on you to only add contacts you have permission to notify.",
                                    ]}
                                />

                                <H3>3.5 Device, network, and security information</H3>
                                <UL
                                    items={[
                                        "Device identifiers/tokens used for push notifications (so safety alerts can reach your device).",
                                        "App version, device type, and limited logs to diagnose reliability issues.",
                                        "Security and abuse-prevention signals (rate limits, suspicious behavior patterns, and report metadata).",
                                    ]}
                                />

                                <Callout
                                    title="We do not sell personal data"
                                    body="StayKnown does not sell personal data. We process data to operate safety features, prevent abuse, and meet legal requirements."
                                />
                            </div>

                            {/* 4) Use */}
                            <div className="space-y-3">
                                <H2 id="use">4) How we use information</H2>
                                <UL
                                    items={[
                                        "To provide and operate safety features (Visits, notifications, SOS where available, and history).",
                                        "To deliver messages you trigger and show delivery status (so you can understand what happened).",
                                        "To prevent stalking, harassment, fraud, mass-messaging abuse, or other harmful misuse.",
                                        "To provide support and troubleshoot performance and reliability issues.",
                                        "To comply with law, enforce terms, and protect rights and safety where necessary.",
                                    ]}
                                />
                                <Example
                                    title="Layman explanation"
                                    items={[
                                        "If an alert fails to deliver, we keep a delivery record so you can see it and choose another contact.",
                                        "If someone tries to spam many emails, we may restrict that account to protect people from harassment.",
                                        "If a device is repeatedly linked to abusive behavior, we may block that device to reduce harm.",
                                    ]}
                                />
                            </div>

                            {/* 5) Location */}
                            <div className="space-y-3">
                                <H2 id="location">5) Location data & permissions (important)</H2>
                                <P>
                                    Location accuracy depends on GPS, hardware, permissions, battery settings, and connectivity. If you disable location permissions,
                                    background location, battery optimization exceptions (where required), or network access, location updates may stop or become less accurate.
                                </P>
                                <UL
                                    items={[
                                        "You control whether location is shared by choosing permissions and starting/stopping sessions.",
                                        "StayKnown is built for voluntary safety sharing. It is not designed for covert tracking of other people.",
                                        "Do not rely on StayKnown alone for life-critical decisions—use emergency services when needed.",
                                    ]}
                                />
                                <Example
                                    title="Real-world examples"
                                    items={[
                                        "If you start a Visit but your phone has no data connection, alerts may be delayed.",
                                        "If your phone battery saver blocks background updates, location updates may stop until you reopen the app.",
                                        "If a contact sees a delayed location, they should call you directly or use local emergency services if appropriate.",
                                    ]}
                                />
                            </div>

                            {/* 6) Contacts */}
                            <div className="space-y-3">
                                <H2 id="contacts">6) Contacts & notifications</H2>
                                <P>
                                    StayKnown sends notifications to contacts you select. Depending on configuration, they may receive email notifications and/or push notifications.
                                    You are responsible for ensuring the contact details you provide are correct and that you have permission to notify them.
                                </P>
                                <UL
                                    items={[
                                        "You must inform contacts they may receive safety notifications.",
                                        "If a contact asks you to stop, you must remove them and stop sending alerts to them.",
                                        "Abuse of contact delivery (spam/harassment) can lead to restrictions or bans.",
                                    ]}
                                />
                                <Example
                                    title="Example: consent and respect"
                                    items={[
                                        "Allowed: You add your sibling and tell them you’ll use StayKnown for late-night rides.",
                                        "Not allowed: You add a stranger’s email to repeatedly send them alerts as intimidation or spam.",
                                    ]}
                                />
                            </div>

                            {/* 7) Sharing */}
                            <div className="space-y-3">
                                <H2 id="sharing">7) Sharing & disclosures</H2>
                                <P>
                                    We share information only when needed to operate the Service, to keep users safe, or to comply with law.
                                </P>

                                <H3>7.1 With your chosen contacts</H3>
                                <P>
                                    If you initiate a session or SOS, we deliver the relevant updates to the contacts you selected. That delivery necessarily shares
                                    what you choose to send (for example: session status and location during an active visit).
                                </P>

                                <H3>7.2 With service providers (processors)</H3>
                                <P>
                                    We may use service providers for hosting, logging, email delivery, push notifications, analytics limited to operations, and security monitoring.
                                    They process information under contractual safeguards and only for providing services to StayKnown.
                                </P>

                                <H3>7.3 For safety, fraud prevention, and abuse response</H3>
                                <P>
                                    Where necessary to protect users, we may investigate reports and suspicious activity, preserve logs, and take enforcement action
                                    (warnings, restrictions, suspensions, or bans).
                                </P>

                                <H3>7.4 For legal reasons</H3>
                                <P>
                                    We may disclose information if required by law or if we believe it is necessary to comply with law, enforce terms, protect rights and safety,
                                    prevent fraud, or prevent harm.
                                </P>
                            </div>

                            {/* 8) Retention */}
                            <div className="space-y-3">
                                <H2 id="retention">8) Data retention</H2>
                                <P>
                                    We retain safety logs for a reasonable period to provide history, prevent abuse, resolve disputes, comply with legal obligations,
                                    and meet safety auditing needs. Some records may be retained longer where required by law or for legitimate safety interests.
                                </P>
                                <Example
                                    title="Example retention reasons"
                                    items={[
                                        "You may want to review your past Visit sessions to understand patterns and improve safety behavior.",
                                        "We may keep security logs longer to prevent repeat harassment or fraud using the same device/network.",
                                        "Some logs may be preserved if there is a credible risk report or lawful request requiring preservation.",
                                    ]}
                                />
                            </div>

                            {/* 9) Security */}
                            <div className="space-y-3">
                                <H2 id="security">9) Security</H2>
                                <UL
                                    items={[
                                        "We use access controls and operational safeguards designed to protect information.",
                                        "We apply rate limits and anti-abuse protections to reduce harassment, fraud, and misuse.",
                                        "No system is perfect; keep your device secure and avoid sharing credentials.",
                                    ]}
                                />
                                <Callout
                                    title="Security disclosure"
                                    body="If you believe you discovered a security issue, contact: support@stay-known.com with details. Do not publicly disclose sensitive vulnerabilities without giving us a chance to fix them."
                                />
                            </div>

                            {/* 10) Children */}
                            <div className="space-y-3">
                                <H2 id="children">10) Children & minor use</H2>
                                <UL
                                    items={[
                                        "Under 13: Not permitted to create an account or use StayKnown.",
                                        "13–15: Permitted only with active permission and supervision of a parent or legal guardian and only for lawful safety use.",
                                        "16–17: Permitted with permission/consent of a parent or legal guardian, and only for lawful safety use.",
                                        "If local law sets a higher threshold or requires parental consent for older minors, local law controls.",
                                    ]}
                                />
                                <Example
                                    title="Example"
                                    items={[
                                        "A parent may use StayKnown with their teen for safety check-ins when traveling, if consent rules are satisfied.",
                                        "An adult may not use StayKnown to monitor a minor without a lawful basis or without the required guardian consent.",
                                    ]}
                                />
                            </div>

                            {/* 11) International */}
                            <div className="space-y-3">
                                <H2 id="international">11) International processing & cross-border transfers</H2>
                                <P>
                                    StayKnown may be accessed globally. Depending on where you live, your information may be processed in countries with different privacy laws.
                                    Where required, we use reasonable safeguards intended to protect cross-border transfers consistent with applicable requirements.
                                </P>
                                <UL
                                    items={[
                                        "We process data where our infrastructure and service providers operate.",
                                        "We apply contractual and technical safeguards where required by law.",
                                        "If a country restricts certain services (sanctions/export controls/platform requirements), access may be limited.",
                                    ]}
                                />
                            </div>

                            {/* 12) Rights */}
                            <div className="space-y-3">
                                <H2 id="rights">12) Your rights (GDPR/UK GDPR + US CCPA-style)</H2>

                                <H3>12.1 GDPR / UK GDPR style rights (where applicable)</H3>
                                <UL
                                    items={[
                                        "Right of access: request a copy of personal data we hold about you.",
                                        "Right to rectification: request correction of inaccurate data.",
                                        "Right to erasure: request deletion where applicable (some data may be retained for legal/safety reasons).",
                                        "Right to restriction: request limits on processing in certain cases.",
                                        "Right to data portability: request export of certain data you provided.",
                                        "Right to object: object to certain processing where applicable.",
                                    ]}
                                />

                                <H3>12.2 US CCPA/CPRA style rights (where applicable)</H3>
                                <UL
                                    items={[
                                        "Right to know: request categories and specific pieces of personal information collected (where applicable).",
                                        "Right to delete: request deletion (subject to exceptions like security and legal obligations).",
                                        "Right to correct: request correction of inaccurate information.",
                                        "Right to non-discrimination: you will not be discriminated against for exercising these rights.",
                                    ]}
                                />

                                <P>To exercise rights, contact: support@stay-known.com. We may need to verify your identity to protect your account.</P>
                                <Callout
                                    title="We do not sell personal data"
                                    body="StayKnown does not sell personal data. If we ever change this approach, we will update policies and provide legally required controls."
                                />
                            </div>

                            {/* 13) Law requests */}
                            <div className="space-y-3">
                                <H2 id="law">13) Law enforcement / government requests</H2>
                                <P>
                                    We respect applicable laws and respond to valid legal process where required. We may disclose information if we believe it is necessary
                                    to comply with law, enforce terms, protect rights and safety, prevent fraud, or prevent harm.
                                </P>
                                <P>
                                    We encourage lawful, transparent use and do not support covert surveillance. Misuse reports may lead to enforcement actions.
                                </P>
                            </div>

                            {/* 14) Changes */}
                            <div className="space-y-3">
                                <H2 id="changes">14) Changes to this Privacy Policy</H2>
                                <P>
                                    We may update this Privacy Policy to reflect new features, safety improvements, legal requirements, or operational changes. If updates are material,
                                    we will provide notice and may require acceptance before continued use.
                                </P>
                            </div>

                            {/* 15) Contact */}
                            <div className="space-y-3">
                                <H2 id="contact">15) Contact</H2>
                                <P>Support: support@stay-known.com</P>
                            </div>

                            {/* App text verbatim */}
                            <div className="space-y-3">
                                <H2 id="apptext">Appendix A — Your in-app policy text (verbatim)</H2>
                                <P>
                                    The paragraphs below match the short version shown inside the StayKnown app. The web policy expands on them for global coverage.
                                </P>

                                <H3>1) Purpose & Humanitarian Motive</H3>
                                <UL
                                    items={[
                                        "StayKnown is built to help people stay safe by enabling voluntary safety check-ins, visit status sharing, and emergency notifications to trusted contacts.",
                                        "The service exists to reduce uncertainty during travel, late-night movement, first meetings, or any situation where someone wants a trusted person to know they are safe.",
                                        "StayKnown is designed with humanitarian intent: to support safety and protection of human life and dignity across communities globally.",
                                        "StayKnown is not designed for covert surveillance and is not intended for stalking, harassment, or monitoring anyone without permission.",
                                        "Operator: StayKnown is provided as a service under the 6 Clement Joshua brand.",
                                    ]}
                                />

                                <H3>2) Eligibility, Age & Parental Permission</H3>
                                <UL
                                    items={[
                                        "StayKnown is for lawful, safety-focused use only.",
                                        "Age guidance (global):",
                                        "Under 13: Not permitted to create an account or use StayKnown.",
                                        "13–15: Permitted only with active permission and supervision of a parent or legal guardian and only for lawful safety use.",
                                        "16–17: Permitted with permission/consent of a parent or legal guardian, and only for lawful safety use.",
                                        "18+: Permitted subject to these Policies & Terms.",
                                        "If your local law sets a higher age threshold (or requires parental consent for older minors), your local law controls.",
                                        "If you use StayKnown on behalf of someone else (e.g., a child, staff member, or dependent), you must have explicit permission and a lawful basis. You must also be able to demonstrate such permission if asked.",
                                    ]}
                                />

                                <H3>3) Core Features & How StayKnown Works</H3>
                                <UL
                                    items={[
                                        "Core features may include (depending on region, plan, and device permissions):",
                                        "Visit sessions: start/stop a check-in session that can share updates with your selected contacts.",
                                        "Destination and timing: optional details you provide (where you are going, expected time, and related safety context).",
                                        "SOS: an emergency-triggered alert flow (plan dependent) intended to notify trusted recipients quickly.",
                                        "Notifications: in-app and push notifications to inform you of safety events, contact actions, and important updates.",
                                        "History: view logs of your own sessions and events for personal records and safety review.",
                                        "Personalization: user-controlled settings (appearance, fonts, and experience options) that do not change core safety rules.",
                                        "StayKnown is user-controlled: sessions and SOS are initiated by the account holder, and you can stop sessions at any time. There is no “silent mode” for secret tracking.",
                                    ]}
                                />

                                <H3>4) Consent, Transparency & Notice to Contacts</H3>
                                <UL
                                    items={[
                                        "You must have a lawful basis and consent to share location or safety updates with any person.",
                                        "You are responsible for informing your contacts that they may receive safety emails, notifications, or alerts.",
                                        "StayKnown is designed so recipients can understand that alerts are from a safety product and are initiated by the user.",
                                        "You may not add contacts for the purpose of harassment, intimidation, spam, or any non-safety purpose.",
                                        "If a contact requests you to stop contacting them, you must respect that request and remove them. Continued targeting may lead to enforcement actions.",
                                    ]}
                                />

                                <H3>5) Privacy, Data Handling & Retention</H3>
                                <UL
                                    items={[
                                        "We aim to collect and store only what is reasonably necessary to operate StayKnown safely and reliably.",
                                        "Data categories may include:",
                                        "Account data: identifiers needed to operate your account (e.g., email, device identifiers/tokens).",
                                        "Safety session data: session times, session state, and safety event logs.",
                                        "Location data: approximate or precise coordinates during active sessions when you grant permission.",
                                        "Notification delivery data: delivery status, timestamps, and recipient addresses you provide.",
                                        "Security and abuse-prevention data: logs and signals used to reduce fraud and protect users.",
                                        "We do not sell personal data.",
                                        "Retention: we may retain safety logs for a reasonable period to provide history, prevent abuse, resolve disputes, comply with legal obligations, and meet safety auditing needs. Some records may be retained longer where required by law or for legitimate safety interests.",
                                        "You are responsible for the accuracy of contact emails/identifiers you provide.",
                                    ]}
                                />

                                <H3>6) Location Accuracy, Permissions & Device Settings</H3>
                                <UL
                                    items={[
                                        "Location accuracy depends on GPS, device hardware, OS permissions, network connectivity, and device settings.",
                                        "If you disable location permissions, background location, battery optimization exceptions (where required), or connectivity, updates may stop or become less accurate.",
                                        "Some devices or networks may delay notifications or emails; do not rely on StayKnown as the only method for life-critical decisions.",
                                        "You are responsible for enabling permissions required for the safety features you choose to use.",
                                    ]}
                                />

                                <H3>7) Emergency Contacts, Notifications & Responsible Use</H3>
                                <UL
                                    items={[
                                        "StayKnown sends notifications to contacts you select. Those notifications may be sent via email and/or push depending on configuration.",
                                        "You should choose trusted contacts and keep them updated.",
                                        "Do not enter someone else’s email/identifier unless you have permission.",
                                        "You may be limited by plan tier for certain features (e.g., SOS access, contact limits, history access). Plan limits exist to protect against abuse and to provide product sustainability.",
                                        "You must not attempt to bypass plan limits, manipulate app behavior, or exploit the service.",
                                    ]}
                                />

                                <H3>8) Safety & Emergency Disclaimer</H3>
                                <UL
                                    items={[
                                        "StayKnown does NOT replace emergency services, medical services, law enforcement, or professional rescue organizations.",
                                        "If you are in immediate danger, contact your local emergency number and follow local guidance.",
                                        "Notifications and emails may be delayed, blocked, or filtered by networks and third-party providers.",
                                        "StayKnown is a support tool to increase awareness—not a guarantee of intervention.",
                                    ]}
                                />

                                <H3>9) Emergency Services & Real-World Response</H3>
                                <UL
                                    items={[
                                        "Recipients of alerts are responsible for deciding how to respond. They may contact you directly, contact local authorities, or take other reasonable steps.",
                                        "You should keep your device charged and maintain connectivity during active sessions.",
                                        "You must not create false emergencies or misuse SOS. Doing so may endanger others and may be illegal.",
                                    ]}
                                />

                                <H3>10) Prohibited Uses (Anti-Stalking / Anti-Harassment)</H3>
                                <UL
                                    items={[
                                        "You may not use StayKnown to:",
                                        "Stalk, harass, intimidate, or threaten anyone.",
                                        "Track people without consent or knowledge (covert surveillance).",
                                        "Facilitate physical harm, kidnapping, extortion, trafficking, or violence.",
                                        "Collect location data to target or exploit a person.",
                                        "Abuse email delivery (spamming contacts or third parties).",
                                        "Attempt to access accounts, sessions, or data that are not yours.",
                                        "Reverse engineer, interfere with, or disrupt the service.",
                                        "Use the service to violate restraining orders, protective orders, or similar legal restrictions.",
                                    ]}
                                />

                                <H3>11) Fraud, Scam, Kidnapping & Abuse Prevention</H3>
                                <UL
                                    items={[
                                        "StayKnown is a safety product. Misuse can cause serious harm.",
                                        "We may restrict accounts, devices, or features if we detect suspicious usage patterns (including high-risk network signals, unusual session behaviors, repeated mass messaging, reported abuse, or attempts to bypass safeguards).",
                                        "You must never use StayKnown to lure someone, coordinate harm, or mislead emergency contacts.",
                                        "Where required by law or where necessary to prevent harm, we may preserve relevant logs and cooperate with lawful requests.",
                                        "If you believe someone is using StayKnown to target you or another person, contact support immediately and contact local authorities if needed.",
                                    ]}
                                />

                                <H3>12) User Responsibilities & Community Standards</H3>
                                <UL
                                    items={[
                                        "You are responsible for:",
                                        "Keeping your account secure and not sharing access improperly.",
                                        "Using accurate information and selecting trusted contacts.",
                                        "Using the app only for lawful, safety-focused purposes.",
                                        "Respecting others’ privacy and consent.",
                                        "Not creating false or misleading safety sessions.",
                                        "You must not upload or share content that is illegal, hateful, or used to target others. If the product includes posting or messaging features, those features must also be used lawfully and respectfully.",
                                    ]}
                                />

                                <H3>13) Platform Integrity (Security, Networks, Exports)</H3>
                                <UL
                                    items={[
                                        "You must not attempt to bypass security controls, abuse APIs, or interfere with device integrity checks.",
                                        "Access from certain regions may be limited to comply with sanctions, export controls, or platform requirements.",
                                        "We may apply rate limits, device checks, and anti-abuse protections to protect users and maintain reliability.",
                                    ]}
                                />

                                <H3>14) Government, Legal Requests & Cooperation</H3>
                                <UL
                                    items={[
                                        "We respect applicable laws and may respond to valid legal process as required.",
                                        "We may disclose information if we believe it is necessary to: comply with law, enforce our terms, protect rights and safety, prevent fraud, or prevent harm.",
                                        "We may preserve logs and records where required by law or where reasonably needed to investigate abuse or threats.",
                                        "We encourage lawful, transparent use and do not support covert surveillance.",
                                    ]}
                                />

                                <H3>15) Reporting, Enforcement & Appeals</H3>
                                <UL
                                    items={[
                                        "Violations may result in warnings, feature restrictions, account/device suspensions, or permanent bans.",
                                        "We may investigate reports of misuse to protect users, contacts, and the public.",
                                        "If you believe an enforcement action was a mistake, you may contact support to request review.",
                                    ]}
                                />

                                <H3>16) Changes to Policies</H3>
                                <UL
                                    items={[
                                        "We may update these Policies to reflect new features, safety improvements, legal requirements, or operational changes.",
                                        "If updates are material, we will present an updated in-app version and may require acceptance before continued use.",
                                    ]}
                                />

                                <H3>17) Contact</H3>
                                <UL
                                    items={[
                                        "Support: support@stay-known.com",
                                        "If you have questions about safety, abuse reporting, or legal concerns, contact support.",
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