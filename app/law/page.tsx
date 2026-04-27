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

export default function LawPage() {
  const nav = [
    ["overview", "Overview"],
    ["principles", "Legal request principles"],
    ["requests", "Request types"],
    ["required", "What requests must include"],
    ["data", "Data categories"],
    ["preservation", "Preservation"],
    ["emergency", "Emergency disclosure"],
    ["usernotice", "User notice"],
    ["rejection", "When we may reject"],
    ["international", "International requests"],
    ["minors", "Minor safety"],
    ["abuse", "Abuse investigations"],
    ["retention", "Retention limits"],
    ["lawfuluse", "No covert surveillance"],
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
                Law Enforcement & Legal Requests
              </h1>
              <div className="text-white/40 font-semibold text-[12px]">
                Version {VERSION} • Updated: {fmtDate(UPDATED_AT)}
              </div>
            </div>

            <P>
              StayKnown is a safety and communication service. This page
              explains how StayKnown may handle law enforcement requests,
              government requests, emergency disclosure requests, preservation
              requests, legal process, abuse investigations, and safety-related
              cooperation.
            </P>

            <Callout
              title="Safety and lawful process"
              body="StayKnown does not support covert surveillance, stalking, unlawful monitoring, or casual requests for user data. We may respond to valid legal process, emergency safety requests, or preservation needs where required or permitted by applicable law."
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
                  StayKnown exists to help people move, visit, communicate, and
                  share safety context with trusted people. Because the service
                  may process safety sessions, contacts, notifications, location
                  context, account records, and abuse-prevention signals, legal
                  requests must be handled carefully.
                </P>
                <P>
                  Our approach is to respect applicable law, protect users,
                  reduce abuse, preserve safety-relevant records where
                  appropriate, and avoid turning a safety product into a tool
                  for unlawful surveillance.
                </P>
              </div>

              <div className="space-y-3">
                <H2 id="principles">2) Legal request principles</H2>
                <UL
                  items={[
                    "We respect applicable laws and may respond to valid legal process as required.",
                    "We review requests for proper authority, scope, clarity, and legal basis.",
                    "We may reject, narrow, or ask for clarification if a request is overbroad, vague, informal, or inconsistent with applicable law.",
                    "We do not support covert surveillance, stalking, harassment, or unlawful monitoring.",
                    "We may preserve relevant logs and records where required by law or where reasonably needed to investigate abuse, threats, fraud, or safety risks.",
                    "We may cooperate with lawful emergency requests where there is a credible risk of death, serious injury, kidnapping, trafficking, or imminent harm.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="requests">3) Types of requests we may receive</H2>
                <P>
                  StayKnown may receive different types of requests from law
                  enforcement, courts, regulators, government agencies, lawyers,
                  users, contacts, or safety reporters. Not every request
                  results in disclosure.
                </P>

                <H3>3.1 Preservation requests</H3>
                <P>
                  A preservation request asks StayKnown to preserve existing
                  records for a limited period while valid legal process is
                  obtained. Preservation does not automatically mean disclosure.
                </P>

                <H3>3.2 Legal process</H3>
                <P>
                  Legal process may include a subpoena, court order, warrant,
                  regulatory demand, or other formal legal request that is valid
                  under applicable law.
                </P>

                <H3>3.3 Emergency disclosure requests</H3>
                <P>
                  Emergency requests may involve credible risk of death, serious
                  physical injury, kidnapping, trafficking, exploitation, or
                  imminent harm. These requests are reviewed with urgency.
                </P>

                <H3>3.4 User or contact reports</H3>
                <P>
                  Users and contacts may report abuse, stalking, harassment,
                  threats, fraud, false emergencies, or suspicious activity.
                  Those reports may lead to safety review, enforcement, record
                  preservation, or legal cooperation where appropriate.
                </P>
              </div>

              <div className="space-y-3">
                <H2 id="required">4) What legal requests should include</H2>
                <P>
                  To help us review a request efficiently, legal requests should
                  be specific, lawful, and tied to identifiable accounts or
                  events.
                </P>
                <UL
                  items={[
                    "The requesting agency, court, authority, or legal representative.",
                    "The name, title, badge or reference number, and contact information of the requester.",
                    "The legal authority for the request.",
                    "The exact user, account, email, phone, username, session, alert, or event being requested.",
                    "The specific data requested and the relevant date/time range.",
                    "The reason the data is needed and how it relates to the investigation or emergency.",
                    "A signed document, court order, subpoena, warrant, preservation letter, or emergency disclosure statement where applicable.",
                    "For emergency requests, a clear explanation of the imminent danger and why normal legal process cannot wait.",
                  ]}
                />

                <Callout
                  title="Narrow requests are safer"
                  body="Requests should be limited to the information needed. Broad requests for all user data, all sessions, or all contacts may be challenged, narrowed, or rejected where permitted by law."
                />
              </div>

              <div className="space-y-3">
                <H2 id="data">5) Categories of data that may exist</H2>
                <P>
                  The data available depends on the user’s plan, device
                  permissions, active features, region, retention settings,
                  technical logs, and whether the user actually used the
                  relevant feature.
                </P>
                <UL
                  items={[
                    "Account identifiers, such as email, profile identifiers, username, and basic account metadata where available.",
                    "Safety session records, such as Visit start time, end time, session state, SOS state, manual capture events, or history records.",
                    "Location points during active safety sessions where the user granted permission and where records exist.",
                    "Notification delivery metadata, such as recipient contact identifiers, delivery status, timestamps, and alert type.",
                    "Contact approval and consent-related records where applicable.",
                    "Chat, stories, stickers, media, or message metadata where features are enabled and retained.",
                    "Device, network, VPN, security, rate-limit, and abuse-prevention signals where available.",
                    "Support reports, abuse reports, enforcement notes, and appeal records where applicable.",
                  ]}
                />
                <P>
                  StayKnown may not always have the data requested. Records may
                  not exist, may have expired, may not have been generated, or
                  may not be available because permissions, feature states, or
                  retention rules limited collection.
                </P>
              </div>

              <div className="space-y-3">
                <H2 id="preservation">6) Preservation of records</H2>
                <P>
                  Where required by law or reasonably needed to investigate
                  abuse or threats, StayKnown may preserve relevant logs and
                  records. Preservation is intended to prevent deletion or
                  alteration of records while proper review or legal process is
                  pending.
                </P>
                <UL
                  items={[
                    "Preservation may apply to safety session logs, notification delivery records, abuse reports, account records, or relevant security logs.",
                    "Preservation does not automatically mean that records will be disclosed.",
                    "Disclosure may still require valid legal process, emergency justification, user consent, or another lawful basis.",
                    "Preserved records may be retained longer where required by law, legal process, safety investigation, or abuse-prevention needs.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="emergency">7) Emergency disclosure requests</H2>
                <P>
                  In limited emergency situations, StayKnown may disclose
                  information if we reasonably believe disclosure is necessary
                  to prevent death, serious physical injury, kidnapping,
                  trafficking, exploitation, or imminent harm.
                </P>
                <UL
                  items={[
                    "Emergency requests should identify the person at risk.",
                    "Emergency requests should explain the immediate danger.",
                    "Emergency requests should identify the specific StayKnown account, session, alert, contact, or event involved.",
                    "Emergency requests should come from an authorized emergency responder, law enforcement officer, or appropriate authority where possible.",
                    "StayKnown may ask follow-up questions or request formal legal process after the emergency disclosure where appropriate.",
                  ]}
                />
                <Callout
                  title="StayKnown is not emergency services"
                  body="If someone is in immediate danger, contact local emergency services first. StayKnown may support lawful review and emergency disclosure where appropriate, but it does not replace emergency responders."
                />
              </div>

              <div className="space-y-3">
                <H2 id="usernotice">8) User notice</H2>
                <P>
                  Where legally permitted and safe, StayKnown may notify a user
                  when their information is requested. However, notice may be
                  delayed or withheld when prohibited by law, when the request
                  is confidential, or when notice could create risk.
                </P>
                <UL
                  items={[
                    "Notice may be withheld if legally prohibited.",
                    "Notice may be delayed if it could compromise an investigation.",
                    "Notice may be withheld if it could create risk of harm, retaliation, stalking, harassment, or evidence destruction.",
                    "StayKnown may challenge overbroad gag orders or confidentiality demands where appropriate and legally permitted.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="rejection">
                  9) When we may reject, narrow, or challenge requests
                </H2>
                <P>
                  StayKnown may reject, narrow, or challenge requests that do
                  not meet applicable requirements.
                </P>
                <UL
                  items={[
                    "Requests that are informal, unsigned, or lack legal authority.",
                    "Requests that are too broad, vague, or not tied to identifiable accounts or events.",
                    "Requests that seek data outside the relevant time period.",
                    "Requests that conflict with applicable law, privacy obligations, or user safety.",
                    "Requests that appear to support stalking, coercion, harassment, political intimidation, unlawful surveillance, or non-safety misuse.",
                    "Requests from private parties that require formal legal process before disclosure.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="international">
                  10) International and cross-border requests
                </H2>
                <P>
                  StayKnown may be used by people in different countries. Legal
                  requests may therefore involve cross-border issues, different
                  privacy rules, and different standards for disclosure.
                </P>
                <UL
                  items={[
                    "Requesters should use the appropriate legal process for their jurisdiction.",
                    "Cross-border requests may require mutual legal assistance, court orders, or other formal channels.",
                    "StayKnown may consider applicable privacy, human rights, safety, and data protection obligations when reviewing requests.",
                    "Access to the service may be limited in regions where sanctions, export controls, platform rules, or legal restrictions apply.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="minors">11) Minor safety and vulnerable users</H2>
                <P>
                  Requests involving minors, exploitation, trafficking,
                  grooming, kidnapping, coercion, or vulnerable users may
                  require urgent review. StayKnown takes child safety and
                  vulnerable-user safety seriously.
                </P>
                <UL
                  items={[
                    "If a minor is in immediate danger, contact emergency services first.",
                    "Reports involving minors should include the age or estimated age if known.",
                    "StayKnown may preserve records where required or where reasonably necessary to prevent harm.",
                    "StayKnown may cooperate with valid legal process or appropriate emergency requests involving child safety.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="abuse">
                  12) Abuse investigations and platform integrity
                </H2>
                <P>
                  StayKnown may review and preserve information when we detect
                  or receive reports of abuse, fraud, stalking, harassment,
                  false emergencies, repeated mass messaging, suspicious network
                  behavior, attempts to bypass safeguards, or high-risk safety
                  events.
                </P>
                <UL
                  items={[
                    "We may restrict accounts, devices, contacts, notifications, chat, stories, media, SOS, Visit features, or other product surfaces.",
                    "We may preserve logs and records when needed to investigate abuse or threats.",
                    "We may cooperate with lawful requests where required or appropriate.",
                    "We may take action even before receiving legal process where platform safety, user safety, or abuse-prevention rules require it.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="retention">
                  13) Retention limits and deletion requests
                </H2>
                <P>
                  StayKnown may retain safety logs for a reasonable period to
                  provide history, prevent abuse, resolve disputes, comply with
                  legal obligations, and meet safety auditing needs. Some
                  records may be retained longer where required by law or for
                  legitimate safety interests.
                </P>
                <UL
                  items={[
                    "A deletion request may not remove records that must be retained for legal, security, safety, fraud-prevention, or abuse-prevention reasons.",
                    "Preserved records may be held while valid legal process, emergency review, abuse investigation, or dispute resolution is pending.",
                    "Records not retained or not generated cannot be produced later.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="lawfuluse">
                  14) No covert surveillance or unlawful monitoring
                </H2>
                <P>
                  StayKnown is not built to help anyone secretly track another
                  person. Legal cooperation does not change the product’s
                  anti-stalking and consent-aware purpose.
                </P>
                <UL
                  items={[
                    "StayKnown does not authorize users to track people without permission.",
                    "StayKnown does not support private parties using legal threats to obtain another person’s data outside valid legal process.",
                    "StayKnown does not support use of the service to violate protective orders, restraining orders, workplace restrictions, school restrictions, or similar legal boundaries.",
                    "StayKnown may restrict accounts or refuse requests that appear connected to stalking, coercion, intimidation, or misuse.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="contact">15) Contact for legal requests</H2>
                <P>
                  For legal requests, abuse reports, preservation concerns, or
                  emergency safety concerns, contact:
                </P>

                <Callout
                  title="Primary contact"
                  body="support@stay-known.com"
                />

                <P>
                  Include “Legal Request,” “Preservation Request,” “Emergency
                  Disclosure Request,” or “Abuse Report” in the subject line
                  where appropriate.
                </P>

                <Example
                  title="Recommended subject lines"
                  items={[
                    "Legal Request — StayKnown account / session",
                    "Preservation Request — urgent safety matter",
                    "Emergency Disclosure Request — imminent harm",
                    "Abuse Report — stalking / harassment / misuse",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="apptext">Appendix A — In-app text this page expands</H2>
                <P>
                  This page expands the government, legal request, cooperation,
                  preservation, and safety language shown inside the StayKnown
                  app.
                </P>

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
                    "You must never use StayKnown to lure someone, coordinate harm, or mislead emergency contacts.",
                    "Where required by law or where necessary to prevent harm, we may preserve relevant logs and cooperate with lawful requests.",
                  ]}
                />

                <H3>Retention and safety auditing</H3>
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
