"use client";

import Image from "next/image";

const UPDATED_AT = "2026-02-22";
const VERSION = "1.0";

function fmtDate(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
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
  return (
    <div className="text-white/85 font-extrabold text-[13.5px] mt-3">
      {children}
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-white/62 font-semibold text-[13px] leading-relaxed">
      {children}
    </p>
  );
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
      <div className="mt-2 text-white/62 font-semibold text-[13px] leading-relaxed">
        {body}
      </div>
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
    ["baseline", "Baseline rules"],
    ["lawful", "Lawful safety use"],
    ["consent", "Consent and contacts"],
    ["stalking", "Anti-stalking"],
    ["fraud", "Fraud and scams"],
    ["danger", "Violence and harm"],
    ["emergency", "SOS and emergencies"],
    ["visit", "Visit and LIVE"],
    ["location", "Location integrity"],
    ["vpn", "VPN and bypass"],
    ["chat", "Chat and media"],
    ["stickers", "Stickers and voice"],
    ["stories", "Stories and profiles"],
    ["gallery", "Safety Gallery"],
    ["language", "Translation"],
    ["payments", "Payments and wallet"],
    ["minors", "Minor safety"],
    ["spam", "Spam and contact abuse"],
    ["security", "Security interference"],
    ["reports", "Reports and enforcement"],
    ["appeals", "Appeals"],
    ["law", "Legal cooperation"],
    ["contact", "Contact"],
    ["apptext", "App text"],
  ] as const;

  return (
    <main className="min-h-screen bg-black flex flex-col">
      <header className="pt-7">
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Image
              src="/6logo.png"
              alt="StayKnown"
              width={34}
              height={34}
              priority
            />
            <div className="text-white font-extrabold tracking-[0.28em] text-[12px]">
              STAYKNOWN
            </div>
          </div>
        </div>
      </header>

      <section className="w-full">
        <div className="mx-auto max-w-4xl px-4 pt-10 pb-16">
          <article className="card glass p-6 md:p-7">
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <h1 className="text-white/92 font-black tracking-[-0.02em] text-[22px] md:text-[26px]">
                Acceptable Use Policy
              </h1>
              <div className="text-white/40 font-semibold text-[12px]">
                Version {VERSION} • Updated: {fmtDate(UPDATED_AT)}
              </div>
            </div>

            <P>
              This Acceptable Use Policy explains what is allowed and prohibited
              when using StayKnown. It applies to all StayKnown safety,
              communication, profile, contact, location, payment, media, and web
              features.
            </P>

            <Callout
              title="Use StayKnown for safety — never for abuse"
              body="StayKnown is designed for lawful, voluntary, consent-aware personal safety. It must not be used for stalking, harassment, secret tracking, intimidation, fraud, false emergencies, exploitation, violence, coercion, spam, or unlawful surveillance."
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
                  StayKnown exists to help people move, visit, communicate, and
                  share safety context with trusted people. This policy protects
                  that purpose by setting clear boundaries for how the service
                  may and may not be used.
                </P>
                <Example
                  title="Acceptable safety-focused use"
                  items={[
                    "Starting a Visit before going somewhere so trusted contacts know a safety session is active.",
                    "Using LIVE sharing during a real safety session.",
                    "Sending Manual Capture as an extra safety checkpoint during an active Visit.",
                    "Triggering SOS when you feel unsafe and need trusted-contact attention.",
                    "Using chat, voice notes, translation, and stories to communicate respectfully with trusted people.",
                    "Adding contacts only when you have permission or a lawful safety basis.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="baseline">2) Baseline rules every user must follow</H2>
                <UL
                  items={[
                    "Use StayKnown only for lawful, safety-focused, consent-aware purposes.",
                    "Respect privacy, consent, contact preferences, blocks, reports, and safety boundaries.",
                    "Do not create false safety events, fake emergencies, misleading sessions, or deceptive alerts.",
                    "Do not attempt to bypass plan limits, safety gates, VPN rules, device checks, contact approval, or enforcement restrictions.",
                    "Do not use the service to threaten, stalk, harass, coerce, shame, exploit, or control anyone.",
                    "Do not interfere with StayKnown systems, APIs, storage, email delivery, push notifications, maps, live links, payments, or chat systems.",
                    "Do not upload, send, or publish illegal, exploitative, hateful, threatening, abusive, or harmful content.",
                    "Do not use StayKnown in a way that violates local law, court orders, protective orders, custody restrictions, school rules, workplace restrictions, platform rules, or sanctions/export-control rules.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="lawful">3) Lawful safety use only</H2>
                <P>
                  StayKnown is not a tool for surveillance, control, punishment,
                  manipulation, or proof-gathering against another person. It is
                  a safety support service.
                </P>
                <UL
                  items={[
                    "You must have a lawful basis for the safety actions you perform.",
                    "You must not use StayKnown to monitor someone else without permission.",
                    "You must not use StayKnown to violate a person’s privacy, legal rights, or safety.",
                    "You must not use StayKnown to commit, plan, hide, or facilitate crime.",
                    "You must not use StayKnown to mislead contacts, emergency responders, support, or legal authorities.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="consent">4) Consent, contacts, and notice</H2>
                <P>
                  Contacts and responders are part of a trusted safety network.
                  They must not be added, notified, or targeted without a proper
                  safety reason and permission or lawful basis.
                </P>
                <UL
                  items={[
                    "Only add contacts you have permission or a lawful basis to notify.",
                    "Tell contacts they may receive StayKnown safety emails, push alerts, or updates.",
                    "Do not add contacts to embarrass, scare, annoy, threaten, punish, or pressure them.",
                    "Do not use another person’s email, phone, username, or identity without permission.",
                    "Respect a contact’s request to stop receiving alerts unless a lawful safety basis requires otherwise.",
                    "Do not bypass contact approval, invite, decline, or consent rules.",
                  ]}
                />
                <Example
                  title="Allowed vs not allowed"
                  items={[
                    "Allowed: adding your sibling after telling them they may receive late-night Visit alerts.",
                    "Allowed: adding a trusted responder who consents to receive SOS-related communication.",
                    "Not allowed: adding an ex-partner’s email to repeatedly send unwanted alerts.",
                    "Not allowed: adding strangers or work contacts for intimidation or spam.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="stalking">
                  5) Anti-stalking and anti-harassment rules
                </H2>
                <P>
                  StayKnown has zero tolerance for stalking, harassment,
                  intimidation, threats, coercion, control, and secret tracking.
                </P>
                <UL
                  items={[
                    "Do not track or monitor anyone without consent or knowledge.",
                    "Do not use location, Visit history, LIVE links, alerts, or chat to control another person.",
                    "Do not send repeated unwanted alerts, messages, story replies, voice notes, stickers, or media.",
                    "Do not use StayKnown to follow, pressure, expose, threaten, shame, or punish someone.",
                    "Do not use the service to violate protective orders, restraining orders, custody orders, school restrictions, workplace restrictions, or similar legal boundaries.",
                    "Do not use StayKnown to gather personal information for targeting, exploitation, blackmail, or retaliation.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="fraud">
                  6) Fraud, scams, impersonation, and deception
                </H2>
                <P>
                  StayKnown must not be used for fraud, scams, fake identities,
                  false emergencies, payment abuse, or deceptive safety claims.
                </P>
                <UL
                  items={[
                    "Do not impersonate a user, contact, guardian, responder, emergency official, support agent, or StayKnown staff.",
                    "Do not create fake emergencies to cause panic, force attention, or manipulate people.",
                    "Do not use safety alerts or chat to request money, extort, blackmail, or deceive.",
                    "Do not use subscriptions, coins, wallet, withdrawals, payment flows, or receipts for fraud, laundering, illegal funding, or chargeback abuse.",
                    "Do not forge, replay, tamper with, or misrepresent StayKnown emails, notifications, live links, receipts, or alerts.",
                    "Do not create multiple accounts to avoid restrictions, bans, plan limits, or enforcement.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="danger">
                  7) Violence, harm, kidnapping, trafficking, and exploitation
                </H2>
                <P>
                  StayKnown strictly prohibits use connected to violence,
                  kidnapping, trafficking, coercion, exploitation, extortion, or
                  physical harm.
                </P>
                <UL
                  items={[
                    "Do not use StayKnown to coordinate harm or threaten harm.",
                    "Do not use StayKnown to lure someone to an unsafe place.",
                    "Do not use StayKnown to facilitate kidnapping, trafficking, forced movement, coercion, or exploitation.",
                    "Do not use location, chat, stories, contacts, or alerts to identify or target vulnerable people.",
                    "Do not use StayKnown to mislead emergency contacts or hide abuse.",
                    "Reports involving credible threats, kidnapping, trafficking, or imminent harm may lead to urgent review, preservation, and lawful cooperation.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="emergency">8) SOS, emergency, and false-alert rules</H2>
                <P>
                  SOS and emergency-related flows are serious safety functions.
                  They must be used only for genuine safety needs.
                </P>
                <UL
                  items={[
                    "Do not trigger SOS as a joke, test, prank, threat, punishment, or manipulation.",
                    "Do not create false emergency alerts or misleading safety events.",
                    "Do not use SOS to force someone to respond or prove they care.",
                    "Do not misuse emergency language to scare contacts or support.",
                    "Do not interfere with a user’s active SOS or pressure them to end protection.",
                    "If you are in immediate danger, contact local emergency services directly.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="visit">9) Visit, LIVE, and map-link rules</H2>
                <P>
                  Visit and LIVE features exist to support active safety
                  awareness. They must not be used to create false evidence,
                  stalk others, or mislead contacts.
                </P>
                <UL
                  items={[
                    "Start a Visit only for real safety-focused context.",
                    "Do not create fake Visit sessions to deceive, pressure, frame, or threaten someone.",
                    "Do not share LIVE links with people who should not receive them.",
                    "Do not use LIVE map links for stalking, public exposure, or harassment.",
                    "Do not manipulate location or timestamps to mislead contacts.",
                    "Do not attempt to access, guess, reuse, or brute-force another person’s live link.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="location">10) Location integrity</H2>
                <P>
                  Location data is sensitive and must not be manipulated or
                  misused.
                </P>
                <UL
                  items={[
                    "Do not spoof GPS, fake movement, or alter device location to mislead StayKnown or contacts.",
                    "Do not use fake GPS, emulators, rooted/jailbroken manipulation, automation, or network tools to falsify location.",
                    "Do not use location data to threaten, expose, follow, shame, control, or exploit a person.",
                    "Do not treat location as perfect proof; it may be approximate or delayed.",
                    "Do not interfere with location permissions during safety flows to mislead recipients.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="vpn">11) VPN, network, and bypass restrictions</H2>
                <P>
                  VPN and network integrity matter because StayKnown uses
                  location and safety context. Users must not bypass safety
                  checks or hide abusive behavior.
                </P>
                <UL
                  items={[
                    "Do not use VPN, proxies, Tor-like routing, or network manipulation to bypass restrictions.",
                    "Do not use VPN to hide abuse, avoid enforcement, manipulate location confidence, or bypass chat/location safety rules.",
                    "Do not bypass app-launch VPN checks, chat VPN gates, or mid-Visit VPN warnings.",
                    "Do not intercept, replay, forge, or modify StayKnown requests.",
                    "Do not interfere with email delivery, push notifications, live links, or safety alerts.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="chat">
                  12) Chat, files, media, and private communication
                </H2>
                <P>
                  StayKnown Chat and media features must be used respectfully
                  and lawfully.
                </P>
                <UL
                  items={[
                    "Do not use chat to threaten, harass, stalk, coerce, exploit, impersonate, or intimidate someone.",
                    "Do not send illegal, hateful, exploitative, abusive, harmful, deceptive, or threatening content.",
                    "Do not send malware, phishing links, spyware, harmful files, or deceptive attachments.",
                    "Do not bypass block, report, plan-gate, privacy, translation, VPN, or safety controls.",
                    "Do not use chat location context to target, follow, or shame someone.",
                    "Do not upload or share private content without lawful permission.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="stickers">
                  13) Stickers, voice notes, music, and video stickers
                </H2>
                <P>
                  Expressive tools are still subject to safety and abuse rules.
                  Stickers, voice stickers, music stickers, video stickers, and
                  media cannot be used to harm others.
                </P>
                <UL
                  items={[
                    "Do not create or send stickers that threaten, harass, shame, exploit, or target a person.",
                    "Do not use voice notes or voice stickers to intimidate, impersonate, or manipulate.",
                    "Do not use music or video stickers to send unlawful, abusive, or deceptive content.",
                    "Do not attempt to bypass sticker limits, duration rules, storage policies, or plan gates.",
                    "Do not use saved/custom stickers to distribute another person’s private content without permission.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="stories">
                  14) Stories, profile trust, and public-facing context
                </H2>
                <P>
                  Stories and profile trust features help users recognize each
                  other, but they must not be used for abuse.
                </P>
                <UL
                  items={[
                    "Do not post stories to expose, shame, threaten, stalk, or target someone.",
                    "Do not impersonate another person with names, avatars, stories, profile images, or verified cues.",
                    "Do not use place labels to reveal sensitive locations without lawful reason.",
                    "Do not use story replies to harass or pressure someone.",
                    "Do not report stories falsely to punish or silence another user.",
                    "Do not use profile trust features for deception or stalking.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="gallery">15) Safety Gallery and recognition images</H2>
                <P>
                  Safety Gallery images exist to support recognition in safety
                  contexts. They must not be abused.
                </P>
                <UL
                  items={[
                    "Upload only lawful images you have the right to use.",
                    "Do not upload another person’s image without permission or lawful basis.",
                    "Do not use Safety Gallery to impersonate, shame, expose, defame, or target anyone.",
                    "Do not use recognition images for stalking or surveillance.",
                    "Do not bypass plan gates, image limits, or storage protections.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="language">
                  16) Translation and multilingual communication
                </H2>
                <P>
                  Translation can support communication, but users must not use
                  it to mislead or abuse.
                </P>
                <UL
                  items={[
                    "Do not use translation to impersonate, manipulate, threaten, deceive, or coerce.",
                    "Do not rely on translation as legal, medical, emergency, or professional interpretation.",
                    "Do not use translated content to hide harassment or abuse.",
                    "Do not pressure a user because of their language preference.",
                    "Do not attempt to bypass plan-based language limits or translation controls.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="payments">
                  17) Payments, coins, wallet, and subscription misuse
                </H2>
                <P>
                  If StayKnown includes subscriptions, purchases, coins, wallet,
                  sending, or withdrawal features, those systems must not be
                  abused.
                </P>
                <UL
                  items={[
                    "Do not use payment systems for fraud, money laundering, illegal funding, scams, deception, or chargeback abuse.",
                    "Do not manipulate receipts, webhooks, ledgers, outbox jobs, wallet balances, withdrawals, or subscription state.",
                    "Do not impersonate another user to receive coins, money, refunds, or plan benefits.",
                    "Do not use coins or payments to threaten, bribe, exploit, or manipulate another person.",
                    "Do not bypass purchase verification, plan gates, or account restrictions.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="minors">18) Minors and vulnerable users</H2>
                <P>
                  StayKnown must not be used to target, exploit, groom,
                  manipulate, threaten, or secretly monitor minors or vulnerable
                  people.
                </P>
                <UL
                  items={[
                    "Under 13 users are not permitted to create an account or use StayKnown.",
                    "13–15 users require active guardian permission and supervision.",
                    "16–17 users require guardian permission or consent and lawful safety use.",
                    "Do not use StayKnown to facilitate grooming, trafficking, kidnapping, coercion, exploitation, or unsafe contact.",
                    "Do not use chat, stories, stickers, media, location, or alerts to pressure a minor.",
                    "If a minor is in immediate danger, contact emergency services or the appropriate local authority first.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="spam">19) Spam, mass messaging, and contact abuse</H2>
                <P>
                  StayKnown contact and notification systems are safety
                  channels, not marketing or harassment tools.
                </P>
                <UL
                  items={[
                    "Do not bulk-message contacts or strangers.",
                    "Do not repeatedly trigger alerts to annoy, frighten, or pressure someone.",
                    "Do not use StayKnown as a broadcast, campaign, sales, or promotional system.",
                    "Do not use automated tools to send alerts, invites, messages, or reports.",
                    "Do not add contacts without permission.",
                    "Do not use multiple accounts to avoid message, contact, or alert limits.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="security">
                  20) Security, API, storage, and interference
                </H2>
                <P>
                  StayKnown’s systems must not be attacked, bypassed, reverse
                  engineered, scraped, or interfered with.
                </P>
                <UL
                  items={[
                    "Do not reverse engineer, disrupt, overload, scrape, or interfere with the service.",
                    "Do not abuse APIs, storage, signed URLs, Supabase, Edge Functions, push systems, email systems, payment systems, or map routes.",
                    "Do not access accounts, sessions, messages, media, location, contacts, wallet, or data that are not yours.",
                    "Do not bypass row-level security, authentication, JWT/session checks, storage policies, or backend validation.",
                    "Do not use bots, automation, credential stuffing, brute force, denial-of-service, or vulnerability testing that harms users.",
                    "Report security issues privately to support@stay-known.com.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="reports">21) Reports, review, and enforcement</H2>
                <P>
                  StayKnown may investigate reports of misuse and take action to
                  protect users, contacts, minors, vulnerable people, platform
                  integrity, and the public.
                </P>
                <UL
                  items={[
                    "Violations may lead to warnings, feature limits, account suspension, permanent ban, content removal, device restrictions, network restrictions, or payment restrictions.",
                    "StayKnown may preserve relevant records where required by law or reasonably needed to investigate abuse or threats.",
                    "StayKnown may cooperate with valid legal process or emergency requests where appropriate.",
                    "StayKnown may restrict features before a full investigation is complete if immediate safety risk exists.",
                    "Reports made in bad faith may themselves violate this policy.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="appeals">22) Appeals</H2>
                <P>
                  If you believe an enforcement action was a mistake, you may
                  contact support and request review.
                </P>
                <UL
                  items={[
                    "Explain what happened clearly.",
                    "Provide account identifiers and relevant evidence.",
                    "Do not create new accounts to bypass restrictions.",
                    "Do not threaten support staff or reporters.",
                    "Repeated abusive appeals may lead to further restrictions.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="law">23) Lawful requests and cooperation</H2>
                <P>
                  StayKnown respects applicable laws and may respond to valid
                  legal process. We may preserve or disclose information where
                  required by law or necessary to enforce terms, protect rights
                  and safety, prevent fraud, or prevent harm.
                </P>
                <UL
                  items={[
                    "We may preserve logs and records where required by law or reasonably needed to investigate abuse or threats.",
                    "We may cooperate with lawful requests involving credible threats, fraud, kidnapping, trafficking, exploitation, or immediate harm.",
                    "We may reject, narrow, or question requests that are overbroad, unlawful, unsafe, or connected to misuse.",
                    "We do not support covert surveillance or unlawful monitoring.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="contact">24) Contact</H2>
                <P>
                  For acceptable-use questions, abuse reports, safety concerns,
                  or enforcement review, contact:
                </P>
                <Callout title="Support" body="support@stay-known.com" />
                <P>
                  If you are in immediate danger, contact your local emergency
                  number first.
                </P>
              </div>

              <div className="space-y-3">
                <H2 id="apptext">
                  Appendix A — In-app text this policy expands
                </H2>
                <P>
                  This page expands the acceptable-use, prohibited-use,
                  user-duty, fraud-prevention, and platform-integrity language
                  shown inside the StayKnown app.
                </P>

                <H3>Consent, Transparency & Notice to Contacts</H3>
                <UL
                  items={[
                    "You must have a lawful basis and consent to share location or safety updates with any person.",
                    "You are responsible for informing your contacts that they may receive safety emails, notifications, or alerts.",
                    "StayKnown is designed so recipients can understand that alerts are from a safety product and are initiated by the user.",
                    "You may not add contacts for the purpose of harassment, intimidation, spam, or any non-safety purpose.",
                    "If a contact requests you to stop contacting them, you must respect that request and remove them.",
                  ]}
                />

                <H3>Prohibited Uses</H3>
                <UL
                  items={[
                    "You may not use StayKnown to stalk, harass, intimidate, or threaten anyone.",
                    "You may not track people without consent or knowledge.",
                    "You may not facilitate physical harm, kidnapping, extortion, trafficking, or violence.",
                    "You may not collect location data to target or exploit a person.",
                    "You may not abuse email delivery by spamming contacts or third parties.",
                    "You may not attempt to access accounts, sessions, or data that are not yours.",
                    "You may not reverse engineer, interfere with, or disrupt the service.",
                    "You may not use the service to violate restraining orders, protective orders, or similar legal restrictions.",
                  ]}
                />

                <H3>Fraud, Scam, Kidnapping & Abuse Prevention</H3>
                <UL
                  items={[
                    "StayKnown is a safety product. Misuse can cause serious harm.",
                    "We may restrict accounts, devices, or features if we detect suspicious usage patterns including high-risk network signals, unusual session behaviors, repeated mass messaging, reported abuse, or attempts to bypass safeguards.",
                    "You must never use StayKnown to lure someone, coordinate harm, or mislead emergency contacts.",
                    "Where required by law or where necessary to prevent harm, we may preserve relevant logs and cooperate with lawful requests.",
                    "If you believe someone is using StayKnown to target you or another person, contact support immediately and contact local authorities if needed.",
                  ]}
                />

                <H3>User Responsibilities & Community Standards</H3>
                <UL
                  items={[
                    "You are responsible for keeping your account secure and not sharing access improperly.",
                    "You are responsible for using accurate information and selecting trusted contacts.",
                    "You are responsible for using the app only for lawful, safety-focused purposes.",
                    "You are responsible for respecting others’ privacy and consent.",
                    "You must not create false or misleading safety sessions.",
                    "You must not upload or share content that is illegal, hateful, or used to target others.",
                  ]}
                />

                <H3>Platform Integrity</H3>
                <UL
                  items={[
                    "You must not attempt to bypass security controls, abuse APIs, or interfere with device integrity checks.",
                    "Access from certain regions may be limited to comply with sanctions, export controls, or platform requirements.",
                    "We may apply rate limits, device checks, and anti-abuse protections to protect users and maintain reliability.",
                  ]}
                />
              </div>
            </div>

            <div className="mt-10 h-px bg-white/10" />

            <div className="mt-6 text-center">
              <div className="text-[12px] font-semibold text-white/50">
                A 6 Clement Joshua service
                <span className="text-white/25 ml-1 align-super text-[10px]">
                  ™
                </span>
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
