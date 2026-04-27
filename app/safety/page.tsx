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

export default function SafetyPage() {
  const nav = [
    ["overview", "Overview"],
    ["mission", "Safety mission"],
    ["userduties", "User duties"],
    ["design", "Safety-by-design"],
    ["consent", "Consent and notice"],
    ["contacts", "Trusted contacts"],
    ["location", "Location safety"],
    ["visit", "Visit and LIVE rules"],
    ["sos", "SOS rules"],
    ["capture", "Manual Capture"],
    ["verified", "Verified stop"],
    ["gallery", "Safety Gallery"],
    ["chat", "Chat and media"],
    ["stories", "Stories and profiles"],
    ["language", "Translation safety"],
    ["vpn", "VPN and reliability"],
    ["minors", "Minor safety"],
    ["stalking", "Anti-stalking"],
    ["prohibited", "Prohibited uses"],
    ["recipient", "Recipient duties"],
    ["misuse", "Misuse prevention"],
    ["enforcement", "Enforcement"],
    ["legal", "Legal cooperation"],
    ["report", "Reporting abuse"],
    ["emergency", "Emergency reminder"],
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
                Safety & Anti-Stalking Policy
              </h1>
              <div className="text-white/40 font-semibold text-[12px]">
                Version {VERSION} • Updated: {fmtDate(UPDATED_AT)}
              </div>
            </div>

            <P>
              StayKnown is a safety-focused service built for lawful, voluntary,
              consent-aware check-ins, Visit sessions, SOS alerts, trusted
              contacts, secure communication, and responsible safety context.
              This policy explains the safety obligations every user, contact,
              recipient, guardian, and account holder must follow.
            </P>

            <Callout
              title="Safety first. Consent always."
              body="StayKnown is designed for personal safety, not covert tracking, stalking, harassment, intimidation, surveillance, coercion, fraud, or abuse. Users must use the service lawfully, transparently, and only for safety-focused purposes."
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
                  Safety tools must be built and used carefully because they can
                  help people, but they can also be abused. StayKnown’s safety
                  approach is based on consent, user control, transparency,
                  trusted contacts, anti-abuse protections, reporting, and
                  lawful cooperation.
                </P>
                <P>
                  This policy applies to all StayKnown features, including
                  Visits, LIVE location sharing, SOS, Manual Capture, verified
                  stop flows, contact approval, Safety Gallery, notifications,
                  chat, stories, stickers, media, voice notes, translation,
                  profile trust, and any future safety features.
                </P>
              </div>

              <div className="space-y-3">
                <H2 id="mission">2) StayKnown safety mission</H2>
                <P>
                  StayKnown exists to help people get safe and stay connected to
                  trusted people wherever they go. The service is intended to
                  reduce uncertainty during travel, late-night movement, first
                  meetings, errands, rides, visits, emergencies, and moments
                  where a person wants trusted people to understand their safety
                  context.
                </P>
                <Example
                  title="What StayKnown is for"
                  items={[
                    "A user starts a Visit so trusted contacts know a safety session is active.",
                    "A user shares LIVE safety context during movement or a visit.",
                    "A user triggers SOS when they need urgent trusted-contact attention.",
                    "A user sends Manual Capture to provide an extra safety checkpoint.",
                    "A user uses Chat, voice notes, translation, and stories to communicate safely with trusted people.",
                    "A trusted contact receives an alert and responds responsibly.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="userduties">3) User duties and required behavior</H2>
                <P>
                  Every StayKnown user must use the service in a lawful,
                  responsible, respectful, safety-focused way.
                </P>
                <UL
                  items={[
                    "Use StayKnown only for lawful personal safety, trusted communication, and consent-aware safety support.",
                    "Provide accurate account, profile, contact, and safety information where required.",
                    "Keep your device, account, and login access secure.",
                    "Only add contacts you have permission or lawful basis to notify.",
                    "Tell contacts they may receive StayKnown alerts or safety emails.",
                    "Do not create false emergencies, fake Visit sessions, misleading SOS events, or deceptive safety claims.",
                    "Do not misuse location, chat, stories, media, stickers, voice notes, or profile details to pressure another person.",
                    "Respect blocks, reports, contact preferences, invite settings, and requests to stop.",
                    "Follow local law, platform rules, and any legal orders that apply to you.",
                    "Contact emergency services directly in immediate danger.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="design">4) Safety-by-design principles</H2>
                <P>
                  StayKnown is designed around safety controls and responsible
                  product behavior. These controls may evolve as new features
                  are added.
                </P>
                <UL
                  items={[
                    "User initiated: Visit, LIVE, SOS, and safety actions are started by the account holder.",
                    "User controlled: users can stop sessions and manage safety settings.",
                    "Trusted contacts: contacts should be people the user lawfully and intentionally selects.",
                    "Consent-based contact approval: certain contact roles may require approval or consent flows.",
                    "No stealth safety posture: StayKnown is not built as a hidden tracking service.",
                    "Plan-aware limits: feature limits help reduce abuse and keep premium safety features sustainable.",
                    "Security controls: rate limits, device checks, VPN reliability rules, reports, and restrictions may be used to reduce misuse.",
                    "Audit and history: certain records may be retained to support safety history, abuse prevention, and lawful review.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="consent">5) Consent, notice, and transparency</H2>
                <P>
                  Consent and notice are core parts of StayKnown safety. Users
                  must not use the service to secretly monitor, pressure, or
                  target people.
                </P>
                <UL
                  items={[
                    "You must have permission or lawful basis before adding a person as a contact or safety recipient.",
                    "You must inform contacts that they may receive safety alerts, emails, or notifications.",
                    "You must not add a person for harassment, intimidation, spam, punishment, coercion, or non-safety reasons.",
                    "If a contact asks you to stop sending alerts, you must remove them unless a lawful safety basis requires otherwise.",
                    "You must not use StayKnown to bypass someone’s privacy settings or contact preferences.",
                    "You must not misrepresent what StayKnown alerts mean.",
                  ]}
                />
                <Example
                  title="Consent examples"
                  items={[
                    "Allowed: adding a sibling after telling them they may receive Visit and SOS alerts.",
                    "Allowed: adding a guardian or trusted adult for commute safety with proper permission.",
                    "Not allowed: adding a stranger, ex-partner, or unwilling contact to repeatedly send alerts.",
                    "Not allowed: using alerts to pressure someone to answer you or reveal their location.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="contacts">
                  6) Trusted contacts and responder responsibility
                </H2>
                <P>
                  Contacts, emergency contacts, SOS contacts, and responders
                  must treat alerts responsibly. Receiving a StayKnown alert
                  does not give anyone permission to harass, threaten, expose,
                  or control the user.
                </P>
                <UL
                  items={[
                    "Contacts should use alerts to support safety, not to shame or control the user.",
                    "Contacts should call or message the user directly when safe and appropriate.",
                    "Contacts should contact local emergency services if danger seems likely.",
                    "Contacts should not share sensitive location, alert, or profile information unnecessarily.",
                    "Responders must understand their role and act lawfully.",
                    "Contacts who misuse alerts may be removed, blocked, reported, or restricted.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="location">
                  7) Location safety, accuracy, and permissions
                </H2>
                <P>
                  Location is sensitive. StayKnown location features must be
                  used only for lawful, user-controlled safety purposes.
                </P>
                <UL
                  items={[
                    "Location accuracy depends on GPS, device hardware, operating system permissions, battery settings, network quality, and environment.",
                    "Location updates may be delayed, inaccurate, blocked, or unavailable.",
                    "Users are responsible for enabling permissions needed for safety features they choose to use.",
                    "Users must not rely on StayKnown as the only method for life-critical decisions.",
                    "Location data must not be used to stalk, threaten, shame, punish, exploit, or control another person.",
                    "Recipients should treat location as approximate and time-sensitive, not guaranteed.",
                  ]}
                />
                <Callout
                  title="Location is not a guarantee"
                  body="StayKnown can support awareness, but it cannot guarantee perfect GPS accuracy, perfect delivery, or real-world intervention."
                />
              </div>

              <div className="space-y-3">
                <H2 id="visit">8) Visit and LIVE safety rules</H2>
                <P>
                  Visit and LIVE features are meant to help trusted people
                  understand that a user has started a safety session. They must
                  not be used to create false records, manipulate contacts, or
                  mislead others.
                </P>
                <UL
                  items={[
                    "Start Visit only for real safety-focused check-ins or movement context.",
                    "Do not create fake Visit sessions to deceive, frame, threaten, or pressure someone.",
                    "Do not use Visit history to shame or control another person.",
                    "Do not send LIVE links for stalking or harassment.",
                    "Do not share a LIVE link with people who should not receive it.",
                    "End Visit responsibly when the safety session is complete.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="sos">9) SOS rules and emergency posture</H2>
                <P>
                  SOS is a high-seriousness safety state. It should be used only
                  when the user needs urgent attention from trusted contacts.
                </P>
                <UL
                  items={[
                    "Do not trigger SOS as a joke, prank, punishment, test, threat, or manipulation.",
                    "Do not create false SOS alerts to cause panic.",
                    "Do not misuse SOS to force someone to respond.",
                    "Do not use SOS to mislead contacts, emergency services, or the public.",
                    "If danger is immediate, contact local emergency services directly.",
                    "Repeated false SOS misuse may result in restrictions, suspension, or permanent ban.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="capture">10) Manual Capture safety rules</H2>
                <P>
                  Manual Capture is intended as an extra safety checkpoint
                  during an active safety flow. It must not be abused.
                </P>
                <UL
                  items={[
                    "Use Manual Capture for genuine safety updates.",
                    "Do not use Manual Capture to spam contacts.",
                    "Do not use Manual Capture to mislead contacts about your safety state.",
                    "Do not use it to harass, intimidate, or pressure recipients.",
                    "Plan limits may apply to reduce abuse and preserve service reliability.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="verified">11) Verified stop and sensitive endings</H2>
                <P>
                  Some safety flows may require a stronger confirmation before
                  ending protection. This helps reduce accidental or improper
                  stopping of a safety state.
                </P>
                <UL
                  items={[
                    "Do not pressure a user to end SOS, Visit, or LIVE protection.",
                    "Do not attempt to stop another user’s safety flow without authorization.",
                    "Do not bypass biometric or device-level confirmation where required.",
                    "Verified stop does not replace emergency services.",
                    "If something feels unsafe, the user should seek real-world help immediately.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="gallery">12) Safety Gallery and recognition images</H2>
                <P>
                  Safety Gallery exists to help trusted people recognize the
                  user in safety contexts. It must not be used for harassment,
                  shaming, impersonation, or non-consensual exposure.
                </P>
                <UL
                  items={[
                    "Upload only lawful, appropriate images connected to your own safety profile.",
                    "Do not upload another person’s image without permission or lawful basis.",
                    "Do not use Safety Gallery to impersonate, defame, shame, or expose someone.",
                    "Do not use recognition images for stalking or targeting.",
                    "Premium or ProMax image access does not remove consent and privacy obligations.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="chat">
                  13) Chat, voice notes, stickers, and media safety
                </H2>
                <P>
                  StayKnown Chat and expressive tools must be used lawfully and
                  respectfully. Private communication is still subject to
                  safety, abuse, and policy rules.
                </P>
                <UL
                  items={[
                    "Do not use chat to threaten, harass, exploit, stalk, impersonate, or coerce another person.",
                    "Do not use voice notes, stickers, video stickers, music stickers, media, or files to intimidate or target someone.",
                    "Do not share illegal, hateful, exploitative, or abusive content.",
                    "Do not bypass blocking, reporting, VPN gates, plan limits, or privacy controls.",
                    "Do not use translation to mislead, manipulate, or impersonate.",
                    "Report abusive chat behavior to support.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="stories">
                  14) Stories, profile trust, and public-facing surfaces
                </H2>
                <P>
                  Stories and profile features help people recognize each other,
                  but they must not be used to expose, shame, stalk, or pressure
                  anyone.
                </P>
                <UL
                  items={[
                    "Do not post stories to target, shame, threaten, or expose another person.",
                    "Do not use place labels or profile cues for stalking or harassment.",
                    "Do not impersonate another person through names, avatars, images, or stories.",
                    "Do not use story replies to pressure or harass someone.",
                    "Use reporting tools for abusive stories or profile misuse.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="language">15) Translation and language safety</H2>
                <P>
                  Language support can help trusted people communicate, but
                  translation must not be treated as perfect or used to deceive.
                </P>
                <UL
                  items={[
                    "Do not use translation to impersonate, mislead, threaten, or manipulate someone.",
                    "Do not rely on translation as legal, medical, or emergency interpretation.",
                    "If a message is safety-critical, use clear direct communication and emergency services where needed.",
                    "Translation delays or failures may occur.",
                    "Language features remain subject to acceptable-use and anti-abuse rules.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="vpn">
                  16) VPN, device integrity, and reliability rules
                </H2>
                <P>
                  StayKnown may require VPN to be off or may warn users when VPN
                  usage affects location reliability, safety integrity, or abuse
                  prevention.
                </P>
                <UL
                  items={[
                    "Do not use VPN or network tools to bypass safety checks, location reliability rules, plan limits, restrictions, or enforcement.",
                    "Do not use device manipulation, spoofing, emulators, fake GPS, or automation to mislead StayKnown.",
                    "VPN warnings may appear at app launch, during safety flows, or before chat entry depending on context.",
                    "Mid-Visit VPN disruption may affect safety alerts and trusted-contact confidence.",
                    "Device and network integrity checks exist to protect users and reduce abuse.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="minors">17) Minor safety and vulnerable users</H2>
                <P>
                  Minors and vulnerable users require heightened care. StayKnown
                  must never be used to exploit, groom, threaten, manipulate, or
                  secretly monitor a minor or vulnerable person.
                </P>
                <UL
                  items={[
                    "Under 13 users are not permitted to create an account or use StayKnown.",
                    "13–15 users require active permission and supervision of a parent or legal guardian.",
                    "16–17 users require parent or guardian permission or consent and lawful safety use.",
                    "Local law controls if it requires a higher age threshold or stronger consent.",
                    "Do not use StayKnown to facilitate grooming, coercion, trafficking, kidnapping, forced movement, or exploitation.",
                    "Reports involving minors may require urgent review, preservation, and lawful cooperation.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="stalking">
                  18) Anti-stalking and anti-harassment rules
                </H2>
                <P>
                  StayKnown has zero tolerance for use connected to stalking,
                  harassment, coercion, intimidation, threats, or secret
                  tracking.
                </P>
                <UL
                  items={[
                    "No tracking without consent or knowledge.",
                    "No repeated unwanted alerts.",
                    "No using location or safety logs to control another person.",
                    "No using StayKnown to violate protective orders, restraining orders, custody orders, workplace restrictions, school restrictions, or legal boundaries.",
                    "No threatening someone with their location, history, profile, messages, stories, or contacts.",
                    "No using StayKnown to follow, monitor, expose, or punish someone.",
                  ]}
                />
                <Example
                  title="Strictly not allowed"
                  items={[
                    "Sending repeated alerts to someone who asked you to stop.",
                    "Using safety logs to threaten someone with location knowledge.",
                    "Adding a contact to intimidate them.",
                    "Using Stories or Chat to pressure someone into meeting.",
                    "Using fake GPS or VPN tools to mislead contacts.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="prohibited">19) Prohibited uses</H2>
                <P>
                  The following uses are prohibited and may lead to
                  restrictions, suspension, permanent ban, reporting, record
                  preservation, or legal cooperation.
                </P>
                <UL
                  items={[
                    "Stalking, harassment, intimidation, threats, coercion, or control.",
                    "Covert surveillance or tracking without permission.",
                    "False emergencies, fake SOS alerts, or misleading safety claims.",
                    "Fraud, scams, extortion, blackmail, payment misuse, or account deception.",
                    "Kidnapping, trafficking, forced movement, exploitation, grooming, or physical-harm coordination.",
                    "Violating protective orders, restraining orders, custody rules, school rules, workplace restrictions, or similar legal limits.",
                    "Spamming contacts, mass messaging, or unwanted notifications.",
                    "Impersonation of a user, contact, guardian, responder, emergency official, or StayKnown staff.",
                    "Bypassing plan limits, safety gates, contact approval, device checks, VPN rules, or enforcement restrictions.",
                    "Reverse engineering, scraping, API abuse, automation, fake GPS, bot activity, or interference with service integrity.",
                    "Uploading or sending illegal, hateful, exploitative, threatening, or abusive content.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="recipient">
                  20) Recipient and trusted-contact responsibilities
                </H2>
                <P>
                  Recipients of StayKnown alerts must act responsibly. Receiving
                  safety context does not grant ownership over the user or the
                  right to expose private information.
                </P>
                <UL
                  items={[
                    "Use alerts to support safety, not to shame, control, or monitor the user outside consent.",
                    "Treat location and timestamps as approximate and possibly delayed.",
                    "Do not share alert links or private details unnecessarily.",
                    "Do not attempt unsafe intervention.",
                    "Contact local emergency services if danger seems likely.",
                    "Report misuse if alerts appear abusive, fake, coercive, or unsafe.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="misuse">21) Misuse prevention and safety review</H2>
                <P>
                  StayKnown may use technical, policy, and support processes to
                  reduce misuse and protect users.
                </P>
                <UL
                  items={[
                    "Rate limits may apply to contacts, alerts, manual captures, messages, and safety actions.",
                    "Suspicious patterns may trigger restriction, review, or blocking.",
                    "Repeated false alerts, reported abuse, mass messaging, and high-risk network signals may lead to enforcement.",
                    "Device, account, contact, payment, and network identifiers may be considered for abuse prevention.",
                    "StayKnown may preserve relevant records when abuse, threats, fraud, or safety risks are reported.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="enforcement">22) Enforcement</H2>
                <P>
                  StayKnown may take action when users, contacts, or feature use
                  violate safety rules or create risk.
                </P>
                <UL
                  items={[
                    "Warning or safety education.",
                    "Temporary restriction of features.",
                    "Contact, chat, story, notification, SOS, Manual Capture, Visit, or media limits.",
                    "Account suspension.",
                    "Permanent account ban.",
                    "Device, network, payment, or identifier restrictions.",
                    "Removal or restriction of abusive content.",
                    "Preservation of records where appropriate.",
                    "Cooperation with valid legal process or emergency disclosure rules where applicable.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="legal">23) Legal cooperation and preservation</H2>
                <P>
                  StayKnown respects applicable law and may respond to valid
                  legal process. We may preserve or disclose information if
                  required by law or if necessary to enforce policies, protect
                  rights and safety, prevent fraud, or prevent harm.
                </P>
                <UL
                  items={[
                    "We may preserve logs and records where required by law or reasonably needed to investigate abuse or threats.",
                    "We may cooperate with valid legal process.",
                    "We may review emergency disclosure requests where there is credible risk of serious harm.",
                    "We do not support covert surveillance or unlawful monitoring.",
                    "We may reject, narrow, or challenge requests that are overbroad, unlawful, unsafe, or connected to misuse.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="report">24) Reporting abuse or safety concerns</H2>
                <P>
                  Report abuse when StayKnown is used for stalking, harassment,
                  threats, fraud, false alerts, coercion, contact abuse, minor
                  exploitation, impersonation, or unsafe behavior.
                </P>
                <Callout title="Report email" body="support@stay-known.com" />
                <UL
                  items={[
                    "Use the subject line: StayKnown Safety Report.",
                    "Include dates, times, usernames, emails, profiles, alert examples, screenshots, or session details if safe.",
                    "Explain whether you asked the person to stop.",
                    "Tell us if there is a minor, protective order, immediate danger, or legal concern.",
                    "Do not put yourself in danger to collect evidence.",
                    "If immediate danger exists, contact local emergency services first.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="emergency">25) Emergency reminder</H2>
                <P>
                  StayKnown is not emergency services, law enforcement, medical
                  services, or a rescue organization. It is a safety support
                  tool that can help notify trusted contacts and provide safety
                  context.
                </P>
                <UL
                  items={[
                    "If you are in immediate danger, contact your local emergency number first.",
                    "Notifications and emails may be delayed, blocked, filtered, or missed.",
                    "Contacts may not see or respond to alerts.",
                    "Location may be inaccurate or unavailable.",
                    "StayKnown cannot guarantee intervention or outcome.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="apptext">
                  Appendix A — In-app text this policy expands
                </H2>
                <P>
                  This page expands the safety and anti-stalking language shown
                  inside the StayKnown app.
                </P>

                <H3>Purpose & Humanitarian Motive</H3>
                <UL
                  items={[
                    "StayKnown is built to help people stay safe by enabling voluntary safety check-ins, visit status sharing, and emergency notifications to trusted contacts.",
                    "The service exists to reduce uncertainty during travel, late-night movement, first meetings, or any situation where someone wants a trusted person to know they are safe.",
                    "StayKnown is designed with humanitarian intent: to support safety and protection of human life and dignity across communities globally.",
                    "StayKnown is not designed for covert surveillance and is not intended for stalking, harassment, or monitoring anyone without permission.",
                  ]}
                />

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

                <H3>Reporting, Enforcement & Appeals</H3>
                <UL
                  items={[
                    "Violations may result in warnings, feature restrictions, account/device suspensions, or permanent bans.",
                    "We may investigate reports of misuse to protect users, contacts, and the public.",
                    "If you believe an enforcement action was a mistake, you may contact support to request review.",
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
