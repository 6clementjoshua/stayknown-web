"use client";

import Image from "next/image";
import Link from "next/link";

const seo = {
  title:
    "StayKnown Safe Journey | Consent-Based Safety for Travel, Visits, Family, and Daily Movement",
  description:
    "Learn why StayKnown was built for real-life movement, travel, visits, school, family safety, SOS, trusted contacts, and consent-based location safety.",
  url: "https://stay-known.com/learn/safe-journey",
  image: "https://stay-known.com/hero/stayknown-safe-journey-bus.png",
};

function MobileNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="
        relative inline-flex items-center gap-2 px-0 py-2
        text-[11.5px] font-semibold tracking-[-0.01em]
        text-white/68 transition hover:text-white/90 active:text-white select-none
      "
    >
      <span>{label}</span>
      <span className="opacity-60">›</span>
      <span className="pointer-events-none absolute inset-0 opacity-0 active:opacity-100 transition duration-75 bg-white/[0.06]" />
    </Link>
  );
}

function CTA({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="
        group relative hidden sm:inline-flex items-center justify-center
        h-8 md:h-[34px] px-3.5 md:px-4 rounded-full
        border border-white/14 bg-white/[0.055] text-white
        font-semibold text-[11.5px] md:text-[12px] tracking-[-0.01em]
        shadow-[0_16px_42px_rgba(0,0,0,0.55)]
        transition-all duration-200
        hover:bg-white hover:border-white/30 hover:text-black hover:[&_*]:text-black
        active:bg-black active:border-white/20 active:text-white active:[&_*]:text-white active:scale-[0.99]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30
        select-none overflow-hidden
      "
    >
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.14),transparent)] -translate-x-[120%] group-hover:translate-x-[120%] transition duration-700" />
      <span className="relative">{label}</span>
      <span className="relative ml-2 opacity-70">→</span>
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10.5px] font-black tracking-[0.26em] text-white/35 uppercase">
      {children}
    </div>
  );
}

function MonoIcon({ glyph }: { glyph: string }) {
  return (
    <div
      className="
        shrink-0 w-9 h-9 rounded-xl
        border border-white/12 bg-white/[0.045]
        backdrop-blur-md flex items-center justify-center
        text-white/90 text-[14px] leading-none
        shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_35px_rgba(0,0,0,0.35)]
      "
      aria-hidden
    >
      {glyph}
    </div>
  );
}

function PremiumPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-[28px]",
        "border border-white/[0.09]",
        "bg-white/[0.035]",
        "shadow-[0_28px_100px_rgba(0,0,0,0.62)]",
        "backdrop-blur-xl",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(255,255,255,0.12),transparent_52%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/15" />
      <div className="relative">{children}</div>
    </div>
  );
}

function TintedCallout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative mt-5 overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.025] p-4 sm:p-5 shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
      <div className="pointer-events-none absolute inset-0 rounded-[22px] bg-[radial-gradient(circle_at_18%_14%,rgba(255,255,255,0.09),transparent_60%)]" />
      <div className="relative">
        <div className="text-white/86 font-black tracking-[-0.02em] text-[12.8px] sm:text-[13.5px]">
          {title}
        </div>
        <div className="mt-2 text-white/60 text-[12.4px] leading-relaxed font-medium">
          {children}
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  glyph,
  title,
  children,
}: {
  glyph: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        group relative overflow-hidden rounded-[24px]
        border border-white/10 bg-white/[0.035]
        shadow-[0_24px_78px_rgba(0,0,0,0.58)]
        p-5 sm:p-6 transition-all duration-300
        hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.05]
      "
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.12),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" />

      <div className="relative flex items-start gap-3">
        <MonoIcon glyph={glyph} />

        <div className="min-w-0">
          <div className="text-white/95 font-black tracking-[-0.025em] text-[14px] sm:text-[15px]">
            {title}
          </div>
          <div className="mt-2 text-white/61 font-medium leading-relaxed text-[12.6px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <div className="text-[10px] font-black tracking-[0.18em] text-white/34 uppercase">
        {label}
      </div>
      <div className="mt-2 text-[18px] font-black tracking-[-0.04em] text-white">
        {value}
      </div>
      <div className="mt-1 text-[11.5px] font-medium leading-5 text-white/48">
        {detail}
      </div>
    </div>
  );
}

function JourneyStep({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-black/25 p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(255,255,255,0.08),transparent_58%)]" />
      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.055] text-[11px] font-black text-white/70">
            {n}
          </div>
          <div className="text-[13.2px] font-black tracking-[-0.025em] text-white/88">
            {title}
          </div>
        </div>
        <p className="mt-3 text-[12.3px] leading-relaxed font-medium text-white/52">
          {body}
        </p>
      </div>
    </div>
  );
}

function ScenarioBox() {
  return (
    <PremiumPanel>
      <div className="p-5 sm:p-6">
        <SectionLabel>The human problem</SectionLabel>

        <div className="mt-3 text-[19px] sm:text-[24px] font-black tracking-[-0.045em] leading-tight text-white">
          Every journey creates one silent question: “Are they safe?”
        </div>

        <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
          <p>
            People leave home every day. They travel, visit friends, enter
            vehicles, go to school, go to work, attend events, meet people, and
            move through places where anything can change quickly.
          </p>

          <p>
            Most times, loved ones only start asking questions when a call is
            missed, a message is ignored, or someone does not return when
            expected. StayKnown is built for the space before panic begins.
          </p>
        </div>
      </div>
    </PremiumPanel>
  );
}

export default function LearnSafeJourneyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: seo.title,
    description: seo.description,
    url: seo.url,
    image: seo.image,
    isPartOf: {
      "@type": "WebSite",
      name: "StayKnown",
      url: "https://stay-known.com",
    },
    about: [
      "StayKnown",
      "safe journey",
      "family safety app",
      "travel safety app",
      "SOS app",
      "trusted contacts",
      "consent-based location safety",
      "emergency contacts",
      "visit safety check-in",
      "I am safe confirmation",
    ],
  };

  return (
    <main className="min-h-screen bg-black overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.075),transparent_38%),radial-gradient(circle_at_18%_38%,rgba(255,255,255,0.04),transparent_34%),radial-gradient(circle_at_82%_56%,rgba(255,255,255,0.035),transparent_34%)]" />

      <header className="relative z-20 pt-7">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center gap-2">
            <Image
              src="/6logo.png"
              alt="StayKnown"
              width={34}
              height={34}
              priority
            />
            <div className="text-white font-black tracking-[0.28em] text-[12px]">
              STAYKNOWN
            </div>
            <div className="text-white/40 font-semibold text-[11px]">
              Learn • Safe Journey
            </div>
          </div>

          <div className="sm:hidden mt-3 flex items-center justify-between">
            <MobileNavLink href="/" label="Back to Home" />
            <MobileNavLink href="/learn/chat" label="Next: Chat" />
          </div>

          <div className="hidden sm:flex mt-5 items-center justify-center gap-3">
            <CTA href="/" label="Back to Home" />
            <CTA href="/learn/chat" label="StayKnown Chat" />
            <CTA href="/learn/secure-chat-protection" label="Secure Chat" />
          </div>
        </div>
      </header>

      <section className="relative w-full">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.065),transparent_58%)]" />

        <div className="mx-auto max-w-6xl px-4 pt-8 pb-8">
          <PremiumPanel className="overflow-hidden">
            <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
              <div className="relative min-h-[360px] sm:min-h-[440px] lg:min-h-[620px]">
                <Image
                  src="/hero/stayknown-safe-journey-bus.png"
                  alt="StayKnown safe journey story"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover"
                  style={{ objectPosition: "center center" }}
                />

                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.14),rgba(0,0,0,0.54))]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_78%,rgba(0,0,0,0.72),transparent_55%)]" />

                <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-auto sm:max-w-[390px]">
                  <div className="rounded-[24px] border border-white/16 bg-black/38 p-4 text-white shadow-[0_22px_70px_rgba(0,0,0,0.58)] backdrop-blur-2xl">
                    <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/50">
                      Movement needs protection
                    </div>
                    <div className="mt-2 text-[20px] font-black leading-tight tracking-[-0.045em] text-white">
                      A journey should not become a mystery.
                    </div>
                    <p className="mt-2 text-[12.2px] font-medium leading-relaxed text-white/64">
                      StayKnown helps trusted people stay aware when someone is
                      moving, visiting, traveling, or facing uncertainty.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative p-5 sm:p-7 lg:p-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[10.5px] font-black tracking-[0.20em] text-white/46 uppercase">
                  Travel, family, visits, SOS, and trust
                </div>

                <h1 className="mt-4 text-white/95 font-black tracking-[-0.06em] text-[38px] sm:text-[54px] lg:text-[62px] leading-[0.94]">
                  StayKnown Safe Journey
                </h1>

                <div className="mt-4 max-w-[76ch] space-y-3 text-white/62 font-medium text-[13px] sm:text-[14px] leading-relaxed">
                  <p>
                    StayKnown was built for the real moments people experience
                    every day: leaving home, entering transport, going to
                    school, visiting someone, traveling to a new place, or
                    moving through a situation where loved ones should not be
                    left in the dark.
                  </p>

                  <p>
                    It is a consent-based safety platform that helps users stay
                    connected to approved trusted contacts before a situation
                    becomes dangerous, confusing, or too late to explain.
                  </p>
                </div>

                <TintedCallout title="The simple promise">
                  StayKnown helps people create a trusted safety circle around
                  their movement, without turning care into spying.
                </TintedCallout>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <MiniStat
                    label="Before panic"
                    value="Awareness"
                    detail="Trusted people can understand movement context earlier."
                  />
                  <MiniStat
                    label="When urgent"
                    value="SOS"
                    detail="Emergency alerts and contacts help response move faster."
                  />
                  <MiniStat
                    label="After safety"
                    value="I’m Safe"
                    detail="A user can confirm they are okay when worry starts."
                  />
                </div>

                <div className="mt-6 sm:hidden flex items-center justify-between gap-3">
                  <MobileNavLink href="/learn/chat" label="Chat" />
                  <MobileNavLink
                    href="/learn/location-live-safety"
                    label="Live Safety"
                  />
                </div>

                <div className="mt-6 hidden sm:flex flex-wrap gap-3">
                  <CTA href="/learn/chat" label="Learn: Chat" />
                  <CTA
                    href="/learn/location-live-safety"
                    label="Learn: Location & Live Safety"
                  />
                </div>
              </div>
            </div>
          </PremiumPanel>
        </div>
      </section>

      <section className="relative w-full">
        <div className="mx-auto max-w-6xl px-4 pb-10 sm:pb-14">
          <div className="mb-5 grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-5">
            <ScenarioBox />

            <PremiumPanel>
              <div className="p-5 sm:p-6">
                <SectionLabel>Why it matters</SectionLabel>

                <div className="mt-3 text-[20px] sm:text-[25px] font-black tracking-[-0.045em] leading-tight text-white">
                  Safety is not only about emergency response. It is also about
                  knowing when to care early.
                </div>

                <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
                  <p>
                    Many safety problems begin quietly. A person delays, changes
                    route, enters an unfamiliar place, meets someone new, loses
                    phone access, or cannot explain what is happening.
                  </p>

                  <p>
                    StayKnown gives trusted people a better way to understand
                    context, receive alerts, and support the user without
                    needing constant calls or invasive monitoring.
                  </p>
                </div>
              </div>
            </PremiumPanel>
          </div>

          <div className="mb-6 grid gap-3 md:grid-cols-5">
            <JourneyStep
              n="1"
              title="User starts"
              body="A user begins a Visit, journey, or safety-related action inside StayKnown."
            />
            <JourneyStep
              n="2"
              title="Trust is chosen"
              body="Only approved contacts and selected emergency contacts are part of the safety circle."
            />
            <JourneyStep
              n="3"
              title="Context is shared"
              body="The app can help trusted people understand movement, safety status, and emergency context."
            />
            <JourneyStep
              n="4"
              title="SOS stays ready"
              body="When danger rises, emergency flows can help alert the right people faster."
            />
            <JourneyStep
              n="5"
              title="Safety is confirmed"
              body="The user can confirm “I’m safe,” close a Visit, or end emergency flow with clearer intent."
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <FeatureCard glyph="⌖" title="Built for real movement">
              StayKnown is designed around everyday movement: school, markets,
              work, night outings, travel, visits, events, transport, and places
              where family or trusted people may need to know that someone is
              still okay.
              <div className="mt-3 text-white/45">
                The product is not built only for emergencies. It is built for
                the normal movement that can become unsafe without warning.
              </div>
            </FeatureCard>

            <FeatureCard glyph="✓" title="Consent-based trusted contacts">
              StayKnown works through approved contacts and intentional safety
              relationships. A user chooses who belongs in their safety circle
              and who can receive important context.
              <div className="mt-3 text-white/45">
                This protects the mission: care should be trusted, not forced.
              </div>
            </FeatureCard>

            <FeatureCard glyph="!" title="SOS and emergency readiness">
              When a user is in distress, SOS and emergency contacts can help
              make the situation clearer. The goal is faster awareness, better
              response, and less confusion during urgent moments.
              <div className="mt-3 text-white/45">
                StayKnown does not replace police, hospitals, or emergency
                services, but it can help trusted people know something is
                wrong.
              </div>
            </FeatureCard>

            <FeatureCard glyph="◌" title="Visit safety check-ins">
              A Visit can help trusted people understand that a user is going
              somewhere, staying somewhere, or moving through a planned
              situation.
              <div className="mt-3 text-white/45">
                It gives movement a safety record instead of leaving loved ones
                to guess.
              </div>
            </FeatureCard>

            <FeatureCard glyph="▣" title="Safety proof and Safety Gallery">
              Safety Gallery and safety records help users keep useful identity
              or context that trusted contacts may need during a Visit, SOS, or
              concern.
              <div className="mt-3 text-white/45">
                This supports recognition, context, and accountability when
                safety matters.
              </div>
            </FeatureCard>

            <FeatureCard glyph="↻" title="I’m Safe confirmation">
              Sometimes the most important message is simple: “I’m safe.”
              StayKnown supports safety confirmation so worry can reduce when
              the user is okay.
              <div className="mt-3 text-white/45">
                This helps families and trusted people move from fear back to
                peace.
              </div>
            </FeatureCard>

            <FeatureCard glyph="◈" title="Privacy-first safety posture">
              StayKnown should never feel like a stalking tool. Its value is in
              trusted, consent-based protection, clear boundaries, and safety
              access that respects the user.
              <div className="mt-3 text-white/45">
                This is why approved contacts, notices, policies, and lawful-use
                language matter.
              </div>
            </FeatureCard>

            <FeatureCard glyph="✦" title="Why families understand it quickly">
              A parent wants to know their child reached school. A friend wants
              to know someone got home. A family wants peace during travel. A
              trusted person wants to help before silence becomes fear.
              <div className="mt-3 text-white/45">
                StayKnown turns that everyday concern into a product people can
                use.
              </div>
            </FeatureCard>

            <FeatureCard glyph="→" title="How a user can use it">
              A user signs up, adds approved contacts, sets emergency contacts,
              starts a Visit when needed, keeps SOS ready, chats with trusted
              people, and confirms safety when the situation ends.
              <div className="mt-3 text-white/45">
                The app should feel simple enough for daily use and strong
                enough for urgent moments.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⚖" title="Important safety boundary">
              StayKnown is a safety support platform. It should be used
              lawfully, respectfully, and with consent. It does not replace
              emergency services or official response systems.
              <div className="mt-3 text-white/45">
                The platform exists to help people protect one another, not to
                control, stalk, threaten, or abuse anyone.
              </div>
            </FeatureCard>
          </div>

          <div className="mt-6">
            <PremiumPanel>
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <SectionLabel>Who StayKnown is for</SectionLabel>

                  <div className="mt-3 text-[21px] sm:text-[28px] font-black tracking-[-0.045em] leading-tight text-white">
                    A safety layer for people who move, travel, visit, care, and
                    worry.
                  </div>

                  <p className="mt-3 text-[12.8px] leading-relaxed text-white/56 font-medium">
                    StayKnown can support individuals, families, students,
                    travelers, workers, partners, guardians, schools,
                    communities, public figures, and anyone who wants trusted
                    people to understand safety context when movement matters.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "A student leaves for school and their parent wants peace of mind.",
                    "A traveler enters a new city and wants trusted contacts aware.",
                    "Someone visits a new place and wants a safety check-in active.",
                    "A user feels unsafe and needs SOS or trusted-contact awareness quickly.",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-black/25 p-4 text-[12.4px] leading-relaxed text-white/58 font-medium"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </PremiumPanel>
          </div>

          <div className="mt-6">
            <PremiumPanel>
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <SectionLabel>Related learn pages</SectionLabel>

                  <div className="mt-3 text-[21px] sm:text-[28px] font-black tracking-[-0.045em] leading-tight text-white">
                    Safe Journey introduces the purpose. The other pages explain
                    the product layers.
                  </div>

                  <p className="mt-3 text-[12.8px] leading-relaxed text-white/56 font-medium">
                    After visitors understand why StayKnown exists, they can
                    explore the app features: chat, secure communication, VPN
                    safety, live protection, approved contacts, and emergency
                    flows.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      title: "StayKnown Chat",
                      body: "Messages, voice notes, stickers, media, and trusted communication.",
                      href: "/learn/chat",
                    },
                    {
                      title: "Secure Chat Protection",
                      body: "Device-level and biometric-aware protection for private safety conversations.",
                      href: "/learn/secure-chat-protection",
                    },
                    {
                      title: "VPN Safety",
                      body: "Location reliability and safety warnings when VPN usage can reduce accuracy.",
                      href: "/learn/vpn-safety",
                    },
                    {
                      title: "Location & Live Safety",
                      body: "Visit, live context, safety map, approved contacts, and movement awareness.",
                      href: "/learn/location-live-safety",
                    },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:bg-white/[0.06] hover:border-white/18"
                    >
                      <div className="text-[12.8px] font-black tracking-[-0.02em] text-white/86">
                        {item.title}
                      </div>
                      <div className="mt-2 text-[12.2px] leading-relaxed font-medium text-white/50">
                        {item.body}
                      </div>
                      <div className="mt-3 text-[10px] font-black tracking-[0.2em] text-white/32 group-hover:text-white/56">
                        OPEN
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </PremiumPanel>
          </div>

          <div className="mt-6">
            <PremiumPanel>
              <div className="p-5 sm:p-6 text-center">
                <SectionLabel>StayKnown promise</SectionLabel>

                <div className="mx-auto mt-3 max-w-3xl text-[26px] sm:text-[38px] font-black tracking-[-0.06em] leading-[0.98] text-white">
                  People should not have to disappear before someone knows they
                  may need help.
                </div>

                <p className="mx-auto mt-4 max-w-2xl text-[13px] sm:text-[14px] leading-relaxed font-medium text-white/56">
                  StayKnown is built to make safety more human, more
                  intentional, and more connected — before, during, and after
                  movement.
                </p>

                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href="/"
                    className="
                      inline-flex h-11 items-center justify-center rounded-full
                      bg-white px-5 text-[12px] font-black tracking-[-0.01em]
                      !text-black shadow-[0_18px_50px_rgba(0,0,0,0.3)]
                      transition hover:bg-white/88 active:scale-[0.99]
                      visited:!text-black focus:!text-black
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35
                    "
                  >
                    Back to Home
                  </Link>

                  <Link
                    href="/learn/chat"
                    className="
                      inline-flex h-11 items-center justify-center rounded-full
                      border border-white/16 bg-white/[0.08] px-5
                      text-[12px] font-black tracking-[-0.01em] !text-white
                      backdrop-blur-xl transition hover:bg-white/[0.14]
                      active:scale-[0.99] visited:!text-white focus:!text-white
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20
                    "
                  >
                    Continue to Chat
                  </Link>
                </div>
              </div>
            </PremiumPanel>
          </div>
        </div>
      </section>

      <footer className="relative w-full">
        <div className="mx-auto max-w-6xl px-4 pb-10">
          <div className="h-px bg-white/[0.08]" />

          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] sm:text-[12px] font-semibold text-white/45 leading-relaxed">
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Privacy Policy
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Terms of service
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/acceptable-use"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Acceptable Use
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/safety"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Safety &amp; Anti-Stalking
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/emergency"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Emergency Disclaimer
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/minors"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Child Safety &amp; Minor Use
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/abuse"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Abuse Reporting
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/retention"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Data Retention
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/law"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Law Enforcement
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/security"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Security Disclosure
              </a>
            </div>

            <div className="text-[12px] font-semibold text-white/50">
              A 6 Clement Joshua service
              <span className="text-white/25 ml-1 align-super text-[10px]">
                ™
              </span>
            </div>

            <div className="text-[11px] font-semibold text-white/30">
              {new Date().getFullYear()} • stay-known.com
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
