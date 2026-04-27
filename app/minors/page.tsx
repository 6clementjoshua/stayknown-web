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

export default function MinorsPage() {
  const nav = [
    ["overview", "Overview"],
    ["ages", "Age rules"],
    ["guardian", "Guardian duties"],
    ["consent", "Consent & lawful basis"],
    ["features", "Feature limits"],
    ["location", "Location safety"],
    ["contacts", "Contacts & alerts"],
    ["chat", "Chat, stories & media"],
    ["abuse", "Prohibited misuse"],
    ["reports", "Reporting concerns"],
    ["data", "Data & retention"],
    ["law", "Legal cooperation"],
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
                Child Safety & Minor Use
              </h1>
              <div className="text-white/40 font-semibold text-[12px]">
                Version {VERSION} • Updated: {fmtDate(UPDATED_AT)}
              </div>
            </div>

            <P>
              StayKnown is a safety-focused service. This page explains how
              minors may use StayKnown, when guardian permission is required,
              how safety alerts should be handled, and what conduct involving
              minors is strictly prohibited.
            </P>

            <Callout
              title="Child safety commitment"
              body="StayKnown may only be used by minors under the age rules below, with proper guardian permission where required, and only for lawful safety-focused purposes. The service must never be used to target, exploit, secretly monitor, threaten, shame, groom, or control a minor."
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
                  StayKnown is designed to help people communicate safety
                  context with trusted contacts. For minors, that purpose
                  requires stronger care: lawful basis, appropriate supervision,
                  responsible contacts, privacy respect, and clear boundaries
                  against abuse.
                </P>
                <P>
                  StayKnown is not designed for secret monitoring of children,
                  unlawful surveillance, coercion, grooming, exploitation, or
                  control. Guardian involvement must be lawful, transparent
                  where appropriate, and focused on safety.
                </P>
              </div>

              <div className="space-y-3">
                <H2 id="ages">2) Age rules — global baseline</H2>
                <UL
                  items={[
                    "Under 13: Not permitted to create an account or use StayKnown.",
                    "13–15: Permitted only with active permission and supervision of a parent or legal guardian and only for lawful safety use.",
                    "16–17: Permitted with permission or consent of a parent or legal guardian and only for lawful safety use.",
                    "18+: Permitted subject to StayKnown policies and terms.",
                    "If local law sets a higher age threshold or requires parental consent for older minors, local law controls.",
                  ]}
                />
                <Callout
                  title="Local law controls"
                  body="Some countries, states, schools, workplaces, guardianship arrangements, or child-protection laws may require stronger consent or prohibit certain uses. Users and guardians must follow the stricter applicable rule."
                />
              </div>

              <div className="space-y-3">
                <H2 id="guardian">3) Guardian responsibilities</H2>
                <P>
                  Parents or legal guardians who help a minor use StayKnown are
                  responsible for making sure the setup is lawful, appropriate,
                  and focused on safety.
                </P>
                <UL
                  items={[
                    "Confirm that the minor is old enough under StayKnown rules and local law.",
                    "Obtain required permission, consent, or legal authority before setup.",
                    "Explain how Visits, SOS alerts, location permissions, notifications, contacts, chat, and safety features may work.",
                    "Choose trusted contacts carefully and keep them updated.",
                    "Avoid adding contacts for pressure, shame, punishment, harassment, or non-safety reasons.",
                    "Keep account and device access secure.",
                    "Review safety use periodically and remove contacts or settings that are no longer appropriate.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="consent">4) Consent, lawful basis, and transparency</H2>
                <P>
                  StayKnown must not be used as a secret surveillance tool.
                  Where a minor is involved, the person setting up or managing
                  the service must have a lawful basis and the required guardian
                  authority.
                </P>
                <UL
                  items={[
                    "Do not create or manage a minor’s account without required authority.",
                    "Do not add a minor’s contacts without a safety-focused reason and appropriate permission.",
                    "Do not use StayKnown to hide monitoring from someone when law or policy requires notice.",
                    "Do not use alerts or location context to shame, punish, threaten, or control a minor.",
                    "Do not pressure a minor to share safety context for reasons unrelated to safety.",
                  ]}
                />
                <Example
                  title="Allowed safety-focused examples"
                  items={[
                    "A parent sets up StayKnown with a 16-year-old for commute safety and explains who receives alerts.",
                    "A guardian helps a 14-year-old use Visit check-ins for school travel where local law and family consent allow it.",
                    "A family agrees on trusted contacts for late-night rides or travel safety.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="features">5) Feature access and plan-aware safety</H2>
                <P>
                  Some StayKnown features may be limited by plan, region, age
                  rules, device permissions, or safety review. Minors should not
                  be pushed into features that are unnecessary or inappropriate
                  for their situation.
                </P>
                <UL
                  items={[
                    "Visit sessions should be used for real safety check-ins, not control.",
                    "SOS should be used only when the user needs urgent safety attention.",
                    "Manual Capture should be used for safety updates, not false evidence or pressure.",
                    "Safety Gallery should support recognition, not public exposure or humiliation.",
                    "Chat, stories, stickers, voice notes, and media must be respectful and lawful.",
                    "Premium features do not override minor safety rules.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="location">6) Location and Visit safety for minors</H2>
                <P>
                  Location features can support safety, but they can also be
                  misused. StayKnown location sharing must be user-controlled,
                  lawful, and safety-focused.
                </P>
                <UL
                  items={[
                    "Location accuracy depends on device settings, GPS, network, battery, and permissions.",
                    "Location updates may be delayed, unavailable, or inaccurate.",
                    "StayKnown does not replace emergency services or direct supervision.",
                    "Do not use location data to stalk, threaten, shame, or control a minor.",
                    "Do not use StayKnown to violate custody orders, school rules, protective orders, or local law.",
                  ]}
                />
                <Callout
                  title="Emergency reminder"
                  body="If a minor is in immediate danger, contact local emergency services first. StayKnown can help trusted contacts receive context, but it is not a rescue service."
                />
              </div>

              <div className="space-y-3">
                <H2 id="contacts">
                  7) Contacts, notifications, and trusted adults
                </H2>
                <P>
                  Contacts should be chosen carefully. A trusted contact may
                  receive alerts, safety updates, or notification context. That
                  role should not be given to someone who may exploit, shame, or
                  pressure the minor.
                </P>
                <UL
                  items={[
                    "Only add contacts with a lawful safety purpose.",
                    "Use responsible adults or trusted people where appropriate.",
                    "Inform contacts that they may receive safety alerts.",
                    "Remove contacts who should no longer receive alerts.",
                    "Do not use contact alerts to embarrass, threaten, punish, or spam anyone.",
                    "If a contact asks to stop receiving alerts, respect that request unless a lawful safety basis requires otherwise.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="chat">
                  8) Chat, stories, stickers, voice, and media involving minors
                </H2>
                <P>
                  If StayKnown includes chat, stories, stickers, voice notes,
                  media, or profile features, those surfaces must be used
                  carefully when minors are involved.
                </P>
                <UL
                  items={[
                    "No grooming, sexual exploitation, coercion, threats, harassment, or intimidation.",
                    "No sharing private minor-related content without lawful permission.",
                    "No impersonating a minor, guardian, responder, contact, or StayKnown staff.",
                    "No using stories or profile context to expose, shame, locate, or pressure a minor.",
                    "No using stickers, media, voice notes, or messages to target or manipulate a minor.",
                    "Reports involving minors may lead to urgent safety review and preservation of relevant records.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="abuse">9) Prohibited use involving minors</H2>
                <P>
                  StayKnown strictly prohibits misuse involving minors,
                  vulnerable users, or dependent persons.
                </P>
                <UL
                  items={[
                    "No covert monitoring of minors outside lawful guardian or authorized supervision.",
                    "No using StayKnown to target, exploit, groom, threaten, or manipulate minors.",
                    "No using StayKnown to facilitate kidnapping, trafficking, coercion, forced movement, or unsafe meetings.",
                    "No false SOS or false safety claims involving a minor.",
                    "No using safety logs, location, stories, or chats to shame or punish a minor.",
                    "No attempts to bypass blocks, reporting, age limits, plan limits, consent rules, or safety safeguards.",
                    "No use that violates custody orders, restraining orders, protective orders, school restrictions, or similar legal boundaries.",
                  ]}
                />
                <Example
                  title="Not allowed"
                  items={[
                    "An adult uses StayKnown to secretly monitor a minor without legal authority.",
                    "Someone uses a safety alert to lure a minor to an unsafe place.",
                    "A person uses chat or stories to pressure a minor to meet, travel, or share private information.",
                    "A guardian uses location data to shame a minor publicly or threaten them.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="reports">10) Reporting child safety concerns</H2>
                <P>
                  If you believe a minor is at risk or StayKnown is being used
                  to target, exploit, threaten, groom, harass, or manipulate a
                  minor, report it as soon as it is safe to do so.
                </P>
                <Callout title="Report email" body="support@stay-known.com" />
                <UL
                  items={[
                    "Use the subject line: Child Safety Report.",
                    "Include account, email, username, phone, link, or profile details if available.",
                    "Include dates, times, screenshots, notification examples, or messages if safe to share.",
                    "Do not put yourself or the minor in danger to gather evidence.",
                    "If there is immediate danger, contact local emergency services or the proper local child-safety authority first.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="data">
                  11) Data, privacy, and retention involving minors
                </H2>
                <P>
                  StayKnown aims to collect and retain only what is reasonably
                  necessary to operate safety features, prevent abuse, resolve
                  disputes, comply with law, and support safety auditing.
                </P>
                <UL
                  items={[
                    "Some records may be retained for legal, safety, abuse-prevention, or child-protection reasons.",
                    "Deletion requests may be limited where records are needed for safety, security, legal compliance, or abuse investigations.",
                    "Reports involving minors may require preservation of relevant records.",
                    "StayKnown does not sell personal data.",
                    "Guardians should avoid entering unnecessary personal information about minors.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="law">12) Legal requests and cooperation</H2>
                <P>
                  StayKnown may preserve records and cooperate with valid legal
                  process where required or appropriate, especially where
                  reports involve child safety, exploitation, grooming,
                  trafficking, kidnapping, credible threats, or imminent harm.
                </P>
                <UL
                  items={[
                    "We may respond to valid legal process as required by applicable law.",
                    "We may preserve relevant records where required or reasonably needed to investigate abuse or threats.",
                    "We may disclose information if necessary to comply with law, enforce policies, protect rights and safety, prevent fraud, or prevent harm.",
                    "We do not support covert surveillance or unlawful monitoring of minors.",
                  ]}
                />
              </div>

              <div className="space-y-3">
                <H2 id="apptext">Appendix A — In-app text this page expands</H2>
                <P>
                  This page expands the minor-use and age guidance shown inside
                  the StayKnown app.
                </P>

                <H3>Eligibility, Age & Parental Permission</H3>
                <UL
                  items={[
                    "StayKnown is for lawful, safety-focused use only.",
                    "Under 13: Not permitted to create an account or use StayKnown.",
                    "13–15: Permitted only with active permission and supervision of a parent or legal guardian and only for lawful safety use.",
                    "16–17: Permitted with permission/consent of a parent or legal guardian, and only for lawful safety use.",
                    "18+: Permitted subject to these Policies & Terms.",
                    "If your local law sets a higher age threshold or requires parental consent for older minors, your local law controls.",
                    "If you use StayKnown on behalf of someone else, such as a child, staff member, or dependent, you must have explicit permission and a lawful basis. You must also be able to demonstrate such permission if asked.",
                  ]}
                />

                <H3>Prohibited use involving minors</H3>
                <UL
                  items={[
                    "No covert monitoring of minors outside lawful guardian or authorized supervision.",
                    "No using the Service to target, exploit, or threaten minors.",
                    "No using StayKnown to facilitate grooming, harassment, intimidation, coercion, trafficking, kidnapping, or unsafe contact.",
                  ]}
                />

                <H3>Emergency and reporting reminder</H3>
                <UL
                  items={[
                    "If you believe a minor is at risk or the Service is being used to target a minor, contact support.",
                    "If there is immediate danger, contact your local emergency number.",
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
