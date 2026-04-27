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

export default function RetentionPage() {
  const nav = [
    ["overview", "Overview"],
    ["categories", "Records we may retain"],
    ["purpose", "Why retention matters"],
    ["location", "Location & Visit records"],
    ["notifications", "Notifications & contacts"],
    ["chat", "Chat, media & stories"],
    ["abuse", "Abuse prevention"],
    ["legal", "Legal preservation"],
    ["deletion", "Deletion requests"],
    ["minors", "Minor-related records"],
    ["security", "Security logs"],
    ["limits", "Limits and expectations"],
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
                Data Retention Policy
              </h1>
              <div className="text-white/40 font-semibold text-[12px]">
                Version {VERSION} • Updated: {fmtDate(UPDATED_AT)}
              </div>
            </div>

            <P>
              This policy explains why StayKnown may retain certain records,
              what kinds of records may be retained, how retention supports
              safety and abuse prevention, and how deletion requests are
              handled.
            </P>

            <Callout
              title="Retention has a safety purpose"
              body="StayKnown may retain certain records to provide user history, prevent abuse, investigate misuse, resolve disputes, support safety auditing, preserve evidence where appropriate, and comply with legal obligations."
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
                  StayKnown is a personal safety and communication service. Some
                  records may be needed after a safety event ends because users
                  may need history, contacts may need context, support may need
                  to troubleshoot delivery, and safety teams may need to
                  investigate misuse.
                </P>
                <P>
                  Retention does not mean StayKnown keeps every possible record
                  forever. It means certain records may be kept for a reasonable
                  period when they are needed for the product, safety, legal,
                  security, abuse-prevention, or dispute-resolution purposes.
                </P>
              </div>

              <div className="space-y-3">
                <H2 id="categories">2) Records StayKnown may retain</H2>
                <P>
                  The exact records available depend on the user’s plan, device
                  permissions, settings, region, feature use, retention rules,
                  and whether the record was generated in the first place.
                </P>

                <H3>2.1 Account and profile records</H3>
                <UL
                  items={[
                    "Account identifiers such as email, username, profile identifiers, and basic account metadata.",
                    "Profile information the user provides, such as display name, avatar, or recognition-related information where enabled.",
                    "Subscription or plan state needed to apply feature limits and entitlements.",
                  ]}
                />

                <H3>2.2 Safety session records</H3>
                <UL
                  items={[
                    "Visit start and stop events.",
                    "LIVE safety session state and related safety lifecycle events.",
                    "SOS activation, SOS state changes, and verified-stop events where available.",
                    "Manual Capture events and related safety update metadata.",
                    "History records shown to the user for review and safety awareness.",
                  ]}
                />

                <H3>2.3 Notification and contact records</H3>
                <UL
                  items={[
                    "Trusted contact identifiers the user provides.",
                    "Notification delivery events, timestamps, alert types, and delivery status where available.",
                    "Contact approval, invite, acceptance, decline, expiration, and consent-related records where applicable.",
                    "Support context needed to understand whether an alert was sent, delayed, failed, or blocked.",
                  ]}
                />

                <H3>2.4 Security and abuse-prevention records</H3>
                <UL
                  items={[
                    "Rate-limit events, suspicious usage patterns, and anti-abuse signals.",
                    "Device, network, VPN, or reliability-related signals where used for security or safety integrity.",
                    "Reports, enforcement actions, appeals, and support communications.",
                    "Logs needed to detect repeat abuse, harassment, fraud, stalking attempts, false alerts, or attempts to bypass safeguards.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="purpose">3) Why retention matters</H2>
                <P>
                  Safety products need a careful retention posture. Removing
                  every record immediately may harm users who need history,
                  prevent abuse review, or make it harder to respond to legal
                  requests. Keeping records unnecessarily may also create
                  privacy risk. StayKnown aims to balance both needs.
                </P>
                <UL
                  items={[
                    "To show users their own Visit, SOS, Manual Capture, and safety history.",
                    "To troubleshoot missed, delayed, or failed alerts.",
                    "To support contact approval and safety relationship review.",
                    "To investigate reports of stalking, harassment, false SOS events, fraud, or contact abuse.",
                    "To prevent repeat abuse by the same account, device, network, payment method, or identifier.",
                    "To comply with valid legal process, preservation requests, emergency safety review, or applicable law.",
                    "To resolve disputes, enforce policies, and protect users, contacts, minors, and the public.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="location">4) Location and Visit records</H2>
                <P>
                  Location data is sensitive. StayKnown should only process it
                  where the user grants permission and where location is needed
                  for active safety features. Some location-related records may
                  be retained to support history, abuse prevention, legal
                  obligations, safety audits, and troubleshooting.
                </P>
                <UL
                  items={[
                    "Visit sessions may retain start time, end time, state, and related safety events.",
                    "Location points may be retained where generated during active sessions and permitted by the user’s settings.",
                    "Readable place labels or reverse-geocoded context may be retained where created for a safety event.",
                    "Location accuracy, network reliability, VPN interruption, or device-permission state may be retained where relevant to safety integrity.",
                    "Location updates may be delayed, incomplete, or unavailable depending on device, GPS, battery, and network conditions.",
                  ]}
                />
                <Callout
                  title="No covert tracking purpose"
                  body="Retention of location-related records does not authorize stalking, secret monitoring, coercion, harassment, or tracking anyone without lawful basis and consent."
                />
              </div>

              <div className="space-y-3">
                <H2 id="notifications">
                  5) Notifications, contacts, and delivery records
                </H2>
                <P>
                  Notification records help users and support teams understand
                  what happened during safety events. For example, a user may
                  need to know whether an alert was sent, failed, delayed, or
                  delivered.
                </P>
                <UL
                  items={[
                    "StayKnown may retain contact identifiers selected by the user.",
                    "StayKnown may retain delivery attempts, timestamps, delivery status, and alert type.",
                    "StayKnown may retain email or push notification metadata needed for troubleshooting and abuse prevention.",
                    "StayKnown may retain contact approval records to confirm whether safety access was consent-based.",
                    "If a contact reports abuse, relevant contact and delivery records may be retained for review.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="chat">
                  6) Chat, stories, stickers, media, and profile records
                </H2>
                <P>
                  If StayKnown includes chat, stories, stickers, voice notes,
                  media, translation, or profile-trust features, related records
                  may be retained where needed to operate the service, show user
                  content, enforce policies, prevent abuse, or comply with law.
                </P>
                <UL
                  items={[
                    "Message metadata may be retained to show conversations, delivery state, read/delivered status, or safety-related context.",
                    "Sticker, media, story, voice-note, or profile records may be retained while the content is active or needed for account history.",
                    "Translation status, source language, target language, and translated text may be retained where the feature is used.",
                    "Reports involving chat, stories, stickers, media, or profile misuse may require preservation of relevant records.",
                    "Blocking, reporting, removal, and enforcement records may be retained to prevent repeated abuse.",
                  ]}
                />
                <Callout
                  title="Private communication still has policy boundaries"
                  body="Chat, stories, stickers, media, and profile features must not be used for harassment, threats, stalking, coercion, impersonation, or unlawful exposure."
                />
              </div>

              <div className="space-y-3">
                <H2 id="abuse">
                  7) Abuse prevention and enforcement retention
                </H2>
                <P>
                  Retention is important for stopping repeat abuse. A user who
                  abuses one account may attempt to return with another account,
                  device, contact list, or network. Safety logs can help
                  identify patterns without exposing unnecessary data.
                </P>
                <UL
                  items={[
                    "Reports of stalking, harassment, contact abuse, fraud, false emergencies, or threats may be retained.",
                    "Enforcement actions, warnings, restrictions, suspensions, bans, and appeals may be retained.",
                    "Suspicious device, network, payment, or identifier patterns may be retained where needed for safety and fraud prevention.",
                    "Records related to attempts to bypass plan limits, VPN rules, safety gates, contact approvals, or device restrictions may be retained.",
                    "Repeated mass messaging, unusual session behaviors, and reported abuse patterns may be retained for investigation.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="legal">
                  8) Legal preservation and government requests
                </H2>
                <P>
                  StayKnown may preserve or retain records where required by
                  law, valid legal process, emergency safety needs, or abuse
                  investigation. Preservation does not automatically mean
                  disclosure.
                </P>
                <UL
                  items={[
                    "Records may be preserved when StayKnown receives a lawful preservation request.",
                    "Records may be preserved when there is credible risk of death, serious injury, kidnapping, trafficking, exploitation, fraud, or imminent harm.",
                    "Records may be retained longer where needed to comply with law, court orders, regulatory requirements, or valid legal process.",
                    "StayKnown may disclose information if required by law or if necessary to protect rights and safety, prevent fraud, prevent harm, or enforce policies.",
                    "StayKnown does not support covert surveillance or unlawful monitoring.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="deletion">9) Deletion requests</H2>
                <P>
                  Users may request deletion where applicable. However, deletion
                  rights can be limited by legal, security, safety, fraud
                  prevention, child safety, abuse investigation, dispute
                  resolution, and platform-integrity needs.
                </P>
                <UL
                  items={[
                    "Some records may need to be retained to comply with law.",
                    "Some records may need to be retained to investigate abuse, threats, fraud, stalking, or false emergencies.",
                    "Some records may need to be retained to enforce bans, device restrictions, or account restrictions.",
                    "Some records may need to be retained to resolve disputes, payment issues, or support requests.",
                    "Some records may need to be retained to protect minors, vulnerable users, contacts, or the public.",
                    "Records that were never collected, were already deleted, or were not generated cannot be recovered later.",
                  ]}
                />
                <Callout
                  title="Deletion contact"
                  body="For deletion or privacy requests, contact support@stay-known.com. We may need to verify your identity before acting on a request."
                />
              </div>

              <div className="space-y-3">
                <H2 id="minors">10) Minor-related records</H2>
                <P>
                  Reports or records involving minors may require more careful
                  handling. StayKnown may preserve relevant records where needed
                  for child safety, abuse prevention, legal compliance, or
                  emergency review.
                </P>
                <UL
                  items={[
                    "Records involving suspected grooming, exploitation, coercion, trafficking, kidnapping, or threats to a minor may be preserved.",
                    "Guardian consent and minor-use reports may be retained where relevant.",
                    "Deletion may be limited where records are needed to protect a minor or comply with legal obligations.",
                    "If a minor is in immediate danger, contact local emergency services first.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="security">11) Security logs and platform integrity</H2>
                <P>
                  Security logs help protect StayKnown, users, contacts, and the
                  public from misuse. Some security records may be retained even
                  after account changes or deletion requests where retention is
                  necessary for safety and platform integrity.
                </P>
                <UL
                  items={[
                    "Authentication, device, network, and abuse-prevention signals may be retained where needed.",
                    "Rate limits, suspicious activity, blocked attempts, and fraud-prevention events may be retained.",
                    "Security reports and vulnerability communications may be retained to protect the service.",
                    "Records related to reverse engineering, scraping, API abuse, bot activity, or bypass attempts may be retained.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="limits">
                  12) Retention limits and practical expectations
                </H2>
                <P>
                  StayKnown may not always have every record a user, contact, or
                  authority expects. Records depend on technical generation,
                  feature use, permissions, network state, retention schedules,
                  and legal requirements.
                </P>
                <UL
                  items={[
                    "If location permission was off, location records may not exist.",
                    "If a notification failed before delivery metadata was created, the record may be limited.",
                    "If a user did not start a Visit or SOS, related safety-session records may not exist.",
                    "If a record has expired under retention rules and was not preserved, it may not be available.",
                    "If a device was offline, data may be delayed, incomplete, or missing.",
                  ]}
                />
                <Example
                  title="Simple examples"
                  items={[
                    "A user may see old Visit history because safety history is retained for review.",
                    "A reported contact-abuse pattern may be retained to prevent the same person from repeating the behavior.",
                    "A legal preservation request may prevent deletion of relevant logs while the matter is reviewed.",
                    "A deleted chat item may still have limited metadata retained if needed for abuse prevention or legal compliance.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="contact">13) Contact</H2>
                <P>
                  For privacy, deletion, retention, legal preservation, or abuse
                  reporting questions, contact:
                </P>
                <Callout title="Support" body="support@stay-known.com" />
                <P>
                  If you are reporting immediate danger, contact your local
                  emergency number first.
                </P>
              </div>

              <div className="space-y-3">
                <H2 id="apptext">Appendix A — In-app text this page expands</H2>
                <P>
                  This page expands the data retention language shown inside the
                  StayKnown app.
                </P>

                <H3>Privacy, Data Handling & Retention</H3>
                <UL
                  items={[
                    "We aim to collect and store only what is reasonably necessary to operate StayKnown safely and reliably.",
                    "Data categories may include account data, safety session data, location data, notification delivery data, and security and abuse-prevention data.",
                    "We do not sell personal data.",
                    "Retention: we may retain safety logs for a reasonable period to provide history, prevent abuse, resolve disputes, comply with legal obligations, and meet safety auditing needs.",
                    "Some records may be retained longer where required by law or for legitimate safety interests.",
                    "You are responsible for the accuracy of contact emails/identifiers you provide.",
                  ]}
                />

                <H3>Government, Legal Requests & Cooperation</H3>
                <UL
                  items={[
                    "We respect applicable laws and may respond to valid legal process as required.",
                    "We may disclose information if we believe it is necessary to comply with law, enforce our terms, protect rights and safety, prevent fraud, or prevent harm.",
                    "We may preserve logs and records where required by law or where reasonably needed to investigate abuse or threats.",
                    "We encourage lawful, transparent use and do not support covert surveillance.",
                  ]}
                />

                <H3>Fraud, Scam, Kidnapping & Abuse Prevention</H3>
                <UL
                  items={[
                    "StayKnown is a safety product. Misuse can cause serious harm.",
                    "We may restrict accounts, devices, or features if we detect suspicious usage patterns including high-risk network signals, unusual session behaviors, repeated mass messaging, reported abuse, or attempts to bypass safeguards.",
                    "Where required by law or where necessary to prevent harm, we may preserve relevant logs and cooperate with lawful requests.",
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
