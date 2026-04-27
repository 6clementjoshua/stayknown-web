"use client";

import Image from "next/image";
import Link from "next/link";

const UPDATED_AT = "2026-04-27";

function fmtDate(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/55 backdrop-blur-xl">
      {children}
    </span>
  );
}

function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2
      id={id}
      className="scroll-mt-24 text-[17px] md:text-[19px] font-black tracking-[-0.025em] text-white/92"
    >
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[13px] md:text-[13.5px] font-semibold leading-relaxed text-white/62">
      {children}
    </p>
  );
}

function UL({ items }: { items: string[] }) {
  return (
    <ul className="ml-5 list-disc space-y-1.5 text-[13px] md:text-[13.5px] font-semibold leading-relaxed text-white/62">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

function Card({
  title,
  body,
  children,
}: {
  title: string;
  body?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
      <div className="text-[12px] font-black uppercase tracking-[0.22em] text-white/42">
        {title}
      </div>
      {body ? (
        <div className="mt-3 text-[13px] font-semibold leading-relaxed text-white/64">
          {body}
        </div>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}

function Note({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4">
      <div className="text-[12px] font-black text-white/88">{title}</div>
      <div className="mt-2 text-[12.5px] font-semibold leading-relaxed text-white/60">
        {body}
      </div>
    </div>
  );
}

export default function LiveMapLearnPage() {
  const nav = [
    ["overview", "Overview"],
    ["permission", "Permission first"],
    ["approved", "Approved contacts"],
    ["visitor", "What visitors see"],
    ["privacy", "Privacy notice"],
    ["accuracy", "Accuracy limits"],
    ["sos", "SOS context"],
    ["ended", "Ended sessions"],
    ["abuse", "Misuse rules"],
    ["links", "Related pages"],
  ] as const;

  return (
    <main className="min-h-screen bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline: "StayKnown Live Map for Approved Contacts",
            description:
              "Learn how StayKnown live map links help approved contacts view user-permitted safety sessions with privacy notice, lawful-use boundaries, and safety context.",
            dateModified: UPDATED_AT,
            publisher: {
              "@type": "Organization",
              name: "StayKnown",
              brand: "6 Clement Joshua",
              url: "https://stay-known.com",
            },
            mainEntityOfPage: "https://stay-known.com/learn/live-map",
          }),
        }}
      />

      <header className="pt-7">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4">
          <Link href="/learn" className="flex flex-col items-center gap-2">
            <Image
              src="/6logo.png"
              alt="StayKnown"
              width={34}
              height={34}
              priority
            />
            <div className="text-[12px] font-extrabold tracking-[0.28em] text-white">
              STAYKNOWN
            </div>
          </Link>
        </div>
      </header>

      <section className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_48%_18%,rgba(255,255,255,0.10),transparent_36%),radial-gradient(circle_at_14%_55%,rgba(255,255,255,0.055),transparent_30%)]" />

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 pb-12 pt-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:pb-20">
          <div className="order-2 flex items-start justify-center lg:order-1 lg:justify-start lg:-translate-y-[1080px] xl:-translate-y-[1180px] 2xl:-translate-y-[1360px]">
            <img
              src="/hero/live-map.png"
              alt="StayKnown live map for approved contacts"
              draggable={false}
              className="
                block object-contain select-none
                drop-shadow-[0_28px_100px_rgba(0,0,0,0.82)]
                max-w-[88vw] max-h-[44vh]
                sm:max-w-[560px] sm:max-h-[62vh]
                lg:max-w-[720px] lg:max-h-[74vh]
                xl:max-w-[790px]
                transform-gpu transition duration-700 ease-out hover:scale-[1.01]
              "
            />
          </div>

          <div className="order-1 lg:order-2">
            <div className="flex flex-wrap gap-2">
              <Pill>Live map</Pill>
              <Pill>Approved contacts</Pill>
              <Pill>User permission</Pill>
            </div>

            <h1 className="mt-5 text-[44px] font-black leading-[0.95] tracking-[-0.065em] text-white/95 sm:text-[64px] lg:text-[78px]">
              Live Map for Approved Contacts
            </h1>

            <p className="mt-5 max-w-[66ch] text-[13.5px] font-semibold leading-relaxed text-white/62 sm:text-[14px]">
              StayKnown Live Map is built for trusted safety visibility, not
              public tracking. A visitor can only view a live safety session
              through a permitted link created from the user’s own Visit, LIVE,
              SOS, or safety notification flow.
            </p>

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Card
                title="Permission"
                body="The safety flow starts from the user and the contacts they approve or choose."
              />
              <Card
                title="Context"
                body="The map explains status, time, place, accuracy, and session information where available."
              />
              <Card
                title="Boundaries"
                body="The visitor must accept lawful safety use before viewing the map."
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-[12px] font-semibold">
              {nav.map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-white/55 transition hover:bg-white/[0.07] hover:text-white/85"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full -mt-[420px] lg:-mt-[700px] xl:-mt-[840px] 2xl:-mt-[980px]">
        <div className="mx-auto max-w-6xl px-4 pb-16">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <Card title="Visitor assurance">
              <div className="space-y-3">
                <H2 id="overview">1) What the Live Map is for</H2>
                <P>
                  The Live Map gives approved contacts and permitted recipients
                  a clear safety view during an active or recently ended
                  session. It helps them understand where the user was last
                  seen, when the last update arrived, whether the session is
                  live or ended, and what safety context the user provided.
                </P>
                <P>
                  It is not a public tracking page. It is not a social map. It
                  is not designed for casual monitoring. It exists so trusted
                  people can respond with care when the user has chosen to share
                  safety context.
                </P>
              </div>
            </Card>

            <Card title="Safety flow">
              <div className="space-y-3">
                <H2 id="permission">2) Permission starts with the user</H2>
                <UL
                  items={[
                    "The user starts a Visit, LIVE session, SOS, or related safety flow.",
                    "The user chooses or approves the trusted people who may receive safety alerts.",
                    "The link is created for safety visibility, not public discovery.",
                    "The recipient must treat the map as private safety context.",
                    "The link should not be shared with outsiders unless necessary for lawful emergency response.",
                  ]}
                />
              </div>
            </Card>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Card title="Approved contacts">
              <div className="space-y-3">
                <H2 id="approved">3) Who should see it</H2>
                <P>
                  The Live Map is intended for approved contacts, emergency
                  contacts, SOS contacts, responders, or permitted recipients
                  who have a lawful safety reason to view the session.
                </P>
                <UL
                  items={[
                    "Trusted family members.",
                    "Approved emergency contacts.",
                    "Approved SOS responders.",
                    "People the user intentionally notified.",
                    "Lawful safety recipients during a real concern.",
                  ]}
                />
              </div>
            </Card>

            <Card title="Visitor view">
              <div className="space-y-3">
                <H2 id="visitor">4) What visitors may see</H2>
                <P>
                  Depending on the session, device state, and available data,
                  the map may show live or last-known location, place label,
                  destination details, session status, started time, accuracy,
                  and safety notes.
                </P>
                <UL
                  items={[
                    "Live or last-known map position.",
                    "LIVE, SOS, or ended session state.",
                    "Last update time.",
                    "Approximate accuracy where available.",
                    "Destination or visit details the user provided.",
                    "A safety-use reminder and brand/legal line.",
                  ]}
                />
              </div>
            </Card>

            <Card title="Privacy gate">
              <div className="space-y-3">
                <H2 id="privacy">5) Visitor privacy notice</H2>
                <P>
                  The Live Map can show a privacy notice before the map opens.
                  This reminds the visitor that the session is only for approved
                  safety use and must not be used for stalking, harassment,
                  unlawful monitoring, or pressure.
                </P>
                <UL
                  items={[
                    "Visitor must acknowledge safety-use boundaries.",
                    "The map is for legitimate care and protection.",
                    "Misuse can lead to restriction or reporting.",
                  ]}
                />
              </div>
            </Card>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <Card title="Accuracy and delivery">
              <div className="space-y-3">
                <H2 id="accuracy">6) Accuracy, timing, and map limits</H2>
                <P>
                  The Live Map is a safety aid, not a guarantee of exact
                  real-time location. GPS, device permissions, battery state,
                  mobile network, browser behavior, VPN state, and third-party
                  providers can affect what the visitor sees.
                </P>
                <UL
                  items={[
                    "Location can be delayed, approximate, or unavailable.",
                    "Place labels may be approximate.",
                    "Email or push delivery may be delayed or filtered.",
                    "The user’s device may be offline, out of battery, or restricted by operating system settings.",
                    "The visitor should call the user directly or contact local emergency services if danger seems likely.",
                  ]}
                />
              </div>
            </Card>

            <Card title="SOS context">
              <div className="space-y-3">
                <H2 id="sos">7) During SOS or urgent safety states</H2>
                <P>
                  If SOS is active, the map should be treated as serious safety
                  context. Visitors should not assume the map alone is enough.
                  They should try direct contact and contact local emergency
                  services when danger seems likely.
                </P>
                <UL
                  items={[
                    "Try calling or messaging the user if safe.",
                    "Use the map as context, not as perfect proof.",
                    "Do not attempt unsafe personal intervention.",
                    "Escalate to official emergency channels when appropriate.",
                  ]}
                />
              </div>
            </Card>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card title="Ended sessions">
              <div className="space-y-3">
                <H2 id="ended">8) When the session has ended</H2>
                <P>
                  If a session is ended, the map may show last session or last
                  known location context instead of active LIVE movement. This
                  helps visitors understand that the safety flow is no longer
                  live and prevents confusion.
                </P>
                <UL
                  items={[
                    "Ended does not always prove the user is physically safe.",
                    "Last-known location may be stale or approximate.",
                    "Visitors should use direct communication if they are unsure.",
                    "If danger seems likely, contact emergency services.",
                  ]}
                />
              </div>
            </Card>

            <Card title="Abuse prevention">
              <div className="space-y-3">
                <H2 id="abuse">9) What visitors must not do</H2>
                <UL
                  items={[
                    "Do not use the map to stalk, monitor, threaten, shame, or control anyone.",
                    "Do not share the link publicly or with people who should not see it.",
                    "Do not use the location to follow or confront the user.",
                    "Do not save or publish private coordinates, screenshots, or safety notes except where necessary for lawful emergency response.",
                    "Do not use the map to violate protective orders, custody rules, school rules, workplace restrictions, or similar legal boundaries.",
                  ]}
                />
              </div>
            </Card>
          </div>

          <div className="mt-5">
            <Card title="Related safety pages">
              <div className="space-y-4">
                <H2 id="links">
                  10) Learn more about the connected safety flows
                </H2>
                <P>
                  The Live Map is connected to other StayKnown safety features.
                  These pages explain the surrounding flows and policy
                  boundaries.
                </P>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Link
                    href="/learn/visit-live"
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-[12px] font-extrabold text-white/70 transition hover:bg-white/[0.07] hover:text-white"
                  >
                    Visit + LIVE Protection →
                  </Link>
                  <Link
                    href="/learn/sos"
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-[12px] font-extrabold text-white/70 transition hover:bg-white/[0.07] hover:text-white"
                  >
                    SOS Active State →
                  </Link>
                  <Link
                    href="/learn/contact-approval"
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-[12px] font-extrabold text-white/70 transition hover:bg-white/[0.07] hover:text-white"
                  >
                    Contact Approval →
                  </Link>
                  <Link
                    href="/safety"
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-[12px] font-extrabold text-white/70 transition hover:bg-white/[0.07] hover:text-white"
                  >
                    Safety Policy →
                  </Link>
                </div>

                <Note
                  title="Lawful safety use only"
                  body="StayKnown Live Map is designed for approved safety visibility. It should never be used for covert surveillance, stalking, harassment, intimidation, or unlawful monitoring."
                />
              </div>
            </Card>
          </div>

          <div className="mt-10 h-px bg-white/10" />

          <div className="mt-6 flex flex-col items-center gap-2 text-center">
            <Link
              href="/learn"
              className="rounded-full border border-white/10 bg-white/[0.05] px-5 py-2.5 text-[12px] font-extrabold text-white/70 transition hover:bg-white hover:text-black"
            >
              Back to Learn
            </Link>

            <div className="mt-4 text-[12px] font-semibold text-white/50">
              A 6 Clement Joshua service
              <span className="ml-1 align-super text-[10px] text-white/25">
                ™
              </span>
            </div>
            <div className="text-[11px] font-semibold text-white/30">
              {new Date().getFullYear()} • stay-known.com • Updated{" "}
              {fmtDate(UPDATED_AT)}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
