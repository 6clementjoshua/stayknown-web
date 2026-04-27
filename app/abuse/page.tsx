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

export default function AbuseReportingPage() {
  const nav = [
    ["overview", "Overview"],
    ["report", "How to report"],
    ["urgent", "Immediate danger"],
    ["abuse", "Abusive use"],
    ["fraud", "Fraud & scams"],
    ["kidnapping", "Kidnapping & coercion"],
    ["contacts", "Contact abuse"],
    ["chat", "Chat, stories & media abuse"],
    ["minors", "Minor safety"],
    ["evidence", "What to include"],
    ["review", "How we review"],
    ["enforcement", "Enforcement"],
    ["appeals", "Appeals"],
    ["law", "Lawful requests"],
    ["retention", "Record preservation"],
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
                Abuse Reporting & Enforcement Policy
              </h1>
              <div className="text-white/40 font-semibold text-[12px]">
                Version {VERSION} • Updated: {fmtDate(UPDATED_AT)}
              </div>
            </div>

            <P>
              This policy explains how StayKnown handles reports of abuse,
              stalking, harassment, fraud, scams, false emergencies, contact
              abuse, kidnapping-related misuse, account misuse, and other
              conduct that can put people at risk.
            </P>

            <Callout
              title="If there is immediate danger"
              body="Contact your local emergency number first. StayKnown can review reports, restrict misuse, preserve relevant records where appropriate, and cooperate with valid legal process, but StayKnown is not emergency services or law enforcement."
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
                  StayKnown is designed for lawful, consent-aware personal
                  safety. Because safety tools can be misused, StayKnown may
                  investigate reports, restrict accounts, limit features,
                  preserve relevant logs, and cooperate with lawful requests
                  where required or appropriate.
                </P>
                <P>
                  Abuse reporting exists to protect users, trusted contacts,
                  minors, vulnerable people, and the public from harmful use of
                  StayKnown features.
                </P>
                <Example
                  title="This policy covers reports involving"
                  items={[
                    "Stalking, harassment, intimidation, threats, or coercive use.",
                    "Fraud, scams, fake emergencies, false SOS events, or misleading alerts.",
                    "Kidnapping-related misuse, luring, extortion, trafficking, or physical-harm coordination.",
                    "Contact abuse, repeated unwanted notifications, spam, or targeting someone who asked to stop.",
                    "Chat, stories, stickers, media, or profile misuse where available.",
                    "Attempts to bypass safeguards, plan limits, VPN/location reliability checks, or account restrictions.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="report">2) How to report abuse</H2>
                <P>
                  To report misuse, contact StayKnown support with clear details
                  so the report can be reviewed safely.
                </P>
                <Callout title="Report email" body="support@stay-known.com" />
                <UL
                  items={[
                    "Use the subject line: StayKnown Abuse Report.",
                    "Include the account, email, username, phone, link, or contact details involved if you have them.",
                    "Include dates, times, screenshots, message content, notification examples, or session details you can safely share.",
                    "Do not put yourself in danger to collect evidence.",
                    "If the issue involves immediate danger, contact local emergency services first.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="urgent">
                  3) Immediate danger and emergency situations
                </H2>
                <P>
                  StayKnown is not emergency services, medical services, law
                  enforcement, or a professional rescue organization. If someone
                  is in immediate danger, contact your local emergency number
                  first.
                </P>
                <UL
                  items={[
                    "If you receive an SOS or emergency alert, try safe direct contact if appropriate.",
                    "If danger seems likely, contact local emergency services.",
                    "Do not attempt unsafe intervention.",
                    "Do not create false emergencies or misuse SOS.",
                    "False alerts may endanger others and may be illegal.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="abuse">4) Abusive use of StayKnown</H2>
                <P>
                  StayKnown must not be used to stalk, harass, intimidate,
                  threaten, shame, monitor, manipulate, pressure, or control
                  another person.
                </P>
                <UL
                  items={[
                    "No covert surveillance or hidden tracking.",
                    "No using safety sessions to pressure someone.",
                    "No using location, Visit history, or safety alerts to threaten a person.",
                    "No repeated unwanted alerts after someone asks you to stop.",
                    "No using the app to violate restraining orders, protective orders, bail terms, workplace restrictions, school rules, or similar legal limits.",
                    "No impersonation, false identity, or misleading safety claims.",
                  ]}
                />
                <Example
                  title="Not allowed"
                  items={[
                    "Adding an ex-partner’s email to repeatedly send unwanted alerts.",
                    "Using safety logs to threaten someone by claiming you know where they are.",
                    "Using StayKnown to pressure someone to respond, travel, meet, or prove their location.",
                    "Creating a false emergency to force attention or frighten contacts.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="fraud">5) Fraud, scams, and false safety claims</H2>
                <P>
                  Fraud and scam-related misuse can create real danger.
                  StayKnown prohibits using the service to mislead users,
                  contacts, support teams, emergency responders, or the public.
                </P>
                <UL
                  items={[
                    "No fake SOS or fake emergency events.",
                    "No false claims designed to make contacts panic or send money.",
                    "No impersonating a user, contact, emergency responder, support agent, or StayKnown staff.",
                    "No using payment, coins, subscriptions, or digital benefits for fraud, laundering, illegal funding, or deception.",
                    "No creating accounts or sessions for scams, extortion, blackmail, or manipulation.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="kidnapping">
                  6) Kidnapping, coercion, trafficking, and physical harm
                </H2>
                <P>
                  StayKnown strictly prohibits use connected to kidnapping,
                  extortion, trafficking, coercion, stalking, violence, or any
                  plan to physically harm another person.
                </P>
                <UL
                  items={[
                    "Do not use StayKnown to lure someone to an unsafe location.",
                    "Do not use location sharing to coordinate harm.",
                    "Do not use contacts, alerts, chat, stories, or media to intimidate or control a victim.",
                    "Do not use StayKnown to facilitate trafficking, exploitation, forced movement, or unlawful confinement.",
                    "Do not use StayKnown to collect information for targeting or exploiting someone.",
                  ]}
                />
                <Callout
                  title="High-risk reports"
                  body="Reports involving kidnapping, trafficking, extortion, credible threats, or imminent harm may require urgent preservation of records and cooperation with valid legal process."
                />
              </div>

              <div className="space-y-3">
                <H2 id="contacts">
                  7) Contact abuse and unwanted notifications
                </H2>
                <P>
                  Contacts are part of the safety network. They must not be used
                  as targets for spam, harassment, manipulation, or pressure.
                </P>
                <UL
                  items={[
                    "Only add contacts you have permission to notify.",
                    "Remove a contact if they ask you to stop.",
                    "Do not repeatedly trigger alerts to annoy, scare, shame, or pressure someone.",
                    "Do not add strangers or third parties for non-safety purposes.",
                    "Do not use contact alerts as marketing, promotion, punishment, or broadcast messaging.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="chat">
                  8) Chat, stories, stickers, media, and profile abuse
                </H2>
                <P>
                  If StayKnown includes chat, stories, stickers, media, voice
                  notes, profile images, or other user content, those features
                  must be used lawfully and respectfully.
                </P>
                <UL
                  items={[
                    "No threats, harassment, hate, exploitation, or targeted abuse.",
                    "No impersonation or misleading profile identity.",
                    "No using stories or profile context to stalk, shame, expose, or pressure someone.",
                    "No media or stickers used to intimidate, defame, exploit, or target another person.",
                    "No attempts to bypass block, report, privacy, or plan-gated restrictions.",
                    "No unlawful sharing of private content.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="minors">9) Minor safety and vulnerable users</H2>
                <P>
                  Reports involving minors, vulnerable users, exploitation, or
                  grooming concerns are treated seriously. StayKnown is for
                  lawful safety use only and must not be used to target,
                  manipulate, or exploit minors.
                </P>
                <UL
                  items={[
                    "Under 13 users are not permitted to create an account or use StayKnown.",
                    "Minors who are permitted under the policy must have required guardian permission and lawful safety purpose.",
                    "No grooming, coercion, harassment, intimidation, or exploitation of minors.",
                    "If there is immediate danger to a minor, contact local emergency services or the proper local authority first.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="evidence">10) What to include in a report</H2>
                <P>
                  Clear information helps StayKnown review reports faster and
                  avoid acting on incomplete or misleading claims.
                </P>
                <UL
                  items={[
                    "Your name and contact email, if safe to provide.",
                    "The email, username, profile, phone, contact, or account involved.",
                    "Dates and times of the behavior.",
                    "Screenshots, notification examples, email headers, links, message text, or story/media examples if safe to share.",
                    "Whether you already asked the person to stop.",
                    "Whether there is a legal order, police report, school report, workplace restriction, or emergency concern.",
                    "Any immediate safety risk you want support to understand.",
                  ]}
                />
                <Callout
                  title="Protect yourself first"
                  body="Do not confront an abuser or put yourself in danger to gather screenshots. Report what you can safely provide."
                />
              </div>

              <div className="space-y-3">
                <H2 id="review">11) How StayKnown may review reports</H2>
                <P>
                  StayKnown may review reports using available account, device,
                  session, notification, support, and security information,
                  subject to applicable law and privacy obligations.
                </P>
                <UL
                  items={[
                    "We may review reported account activity, alert patterns, message/report metadata, session state, notification delivery history, support records, and abuse-prevention signals.",
                    "We may compare reports against prior complaints or repeated suspicious behavior.",
                    "We may preserve relevant records if needed for safety, legal compliance, or abuse prevention.",
                    "We may be unable to share every detail of an investigation to protect privacy, safety, legal process, and platform integrity.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="enforcement">12) Enforcement actions</H2>
                <P>
                  Violations may result in action depending on severity,
                  context, risk, repeat behavior, and applicable law.
                </P>
                <UL
                  items={[
                    "Warning or safety education.",
                    "Feature restriction, including limits on contacts, notifications, chat, stories, media, stickers, SOS, or Visit-related features.",
                    "Temporary suspension.",
                    "Permanent account ban.",
                    "Device, network, payment, or identifier restrictions where appropriate.",
                    "Removal or restriction of abusive content.",
                    "Preservation of records where required or appropriate.",
                    "Cooperation with valid legal process or emergency disclosure rules where applicable.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="appeals">13) Appeals and mistaken reports</H2>
                <P>
                  If you believe an enforcement action was a mistake, you may
                  contact support and request review.
                </P>
                <UL
                  items={[
                    "Explain what happened clearly.",
                    "Provide relevant evidence or context.",
                    "Do not create new accounts to bypass a restriction while an appeal is pending.",
                    "Repeated abusive appeals, threats, or false claims may lead to further restrictions.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="law">14) Lawful requests and cooperation</H2>
                <P>
                  StayKnown respects applicable law and may respond to valid
                  legal process. We may disclose information if required by law
                  or if we believe disclosure is necessary to protect rights,
                  safety, prevent fraud, prevent harm, or enforce policies.
                </P>
                <UL
                  items={[
                    "We may require proper legal process before disclosing user information.",
                    "We may preserve records when legally required or when reasonably necessary to investigate abuse or threats.",
                    "We may cooperate with lawful emergency or government requests where applicable.",
                    "We do not support covert surveillance or unlawful use of safety data.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="retention">15) Record preservation and retention</H2>
                <P>
                  Some records may be retained for safety history, abuse
                  prevention, dispute resolution, legal compliance, and safety
                  auditing. Deletion requests may be limited where records must
                  be retained for legal, security, or safety reasons.
                </P>
                <UL
                  items={[
                    "Safety session logs may be retained to support history, investigations, and user protection.",
                    "Notification delivery records may be retained to understand whether alerts were sent or failed.",
                    "Security and abuse-prevention logs may be retained to reduce repeat harassment, fraud, or device-level abuse.",
                    "Support records may be retained to resolve reports and prevent repeated abuse.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="contact">16) Contact</H2>
                <P>To report abuse or request review:</P>
                <P>support@stay-known.com</P>
                <P>
                  If you are in immediate danger, contact your local emergency
                  number first.
                </P>
              </div>

              <div className="space-y-3">
                <H2 id="apptext">Appendix A — In-app text this page expands</H2>
                <P>
                  This page expands the abuse, fraud, enforcement, reporting,
                  and legal cooperation language shown inside the StayKnown app.
                </P>

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

                <H3>Government, Legal Requests & Cooperation</H3>
                <UL
                  items={[
                    "We respect applicable laws and may respond to valid legal process as required.",
                    "We may disclose information if we believe it is necessary to comply with law, enforce our terms, protect rights and safety, prevent fraud, or prevent harm.",
                    "We may preserve logs and records where required by law or where reasonably needed to investigate abuse or threats.",
                    "We encourage lawful, transparent use and do not support covert surveillance.",
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
