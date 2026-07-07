"use client";

import Image from "next/image";
import Link from "next/link";

const seo = {
  title:
    "StayKnown Family Safety | Trusted Contacts, Loved Ones, Visits, and Everyday Protection",
  description:
    "Learn how StayKnown helps families, loved ones, guardians, friends, and trusted contacts stay connected through consent-based safety, Visits, SOS, I’m Safe, and emergency awareness.",
  url: "https://stay-known.com/learn/family-safety",
  image: "https://stay-known.com/hero/stayknown-family-farewell.png",
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

function FamilyStep({
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
        <SectionLabel>The loved-one problem</SectionLabel>

        <div className="mt-3 text-[19px] sm:text-[24px] font-black tracking-[-0.045em] leading-tight text-white">
          People do not worry because they want control. They worry because they
          care.
        </div>

        <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
          <p>
            A parent may worry about a child going to school. A family may worry
            about someone traveling. A friend may worry when someone leaves late
            at night. A guardian may worry when silence lasts longer than
            expected.
          </p>

          <p>
            StayKnown turns that care into a structured safety connection:
            trusted contacts, approved access, Visit context, SOS readiness, and
            clear confirmation when the person is safe.
          </p>
        </div>
      </div>
    </PremiumPanel>
  );
}

export default function LearnFamilySafetyPage() {
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
      "family safety app",
      "trusted contacts",
      "approved contacts",
      "guardian safety",
      "student safety",
      "travel safety",
      "SOS app",
      "I am safe confirmation",
      "consent-based safety",
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
              Learn • Family Safety
            </div>
          </div>

          <div className="sm:hidden mt-3 flex items-center justify-between">
            <MobileNavLink href="/" label="Back to Home" />
            <MobileNavLink href="/learn/safe-journey" label="Safe Journey" />
          </div>

          <div className="hidden sm:flex mt-5 items-center justify-center gap-3">
            <CTA href="/" label="Back to Home" />
            <CTA href="/learn/safe-journey" label="Safe Journey" />
            <CTA href="/learn/chat" label="StayKnown Chat" />
          </div>
        </div>
      </header>

      <section className="relative w-full">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.065),transparent_58%)]" />

        <div className="mx-auto max-w-6xl px-4 pt-8 pb-8">
          <PremiumPanel className="overflow-hidden">
            <div className="grid gap-0 lg:grid-cols-[1.04fr_0.96fr] lg:items-stretch">
              <div className="relative min-h-[360px] sm:min-h-[440px] lg:min-h-[620px]">
                <Image
                  src="/hero/stayknown-family-farewell.png"
                  alt="StayKnown family safety and loved ones"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 56vw"
                  className="object-cover"
                  style={{ objectPosition: "center center" }}
                />

                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.10),rgba(0,0,0,0.56))]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_26%_76%,rgba(0,0,0,0.70),transparent_55%)]" />

                <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-auto sm:max-w-[410px]">
                  <div className="rounded-[24px] border border-white/16 bg-black/38 p-4 text-white shadow-[0_22px_70px_rgba(0,0,0,0.58)] backdrop-blur-2xl">
                    <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/50">
                      Care should continue
                    </div>
                    <div className="mt-2 text-[20px] font-black leading-tight tracking-[-0.045em] text-white">
                      When someone leaves, safety should leave with them.
                    </div>
                    <p className="mt-2 text-[12.2px] font-medium leading-relaxed text-white/64">
                      StayKnown helps families and trusted people stay connected
                      to the safety moments that matter.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative p-5 sm:p-7 lg:p-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[10.5px] font-black tracking-[0.20em] text-white/46 uppercase">
                  Family, guardians, trusted people, and care
                </div>

                <h1 className="mt-4 text-white/95 font-black tracking-[-0.06em] text-[38px] sm:text-[54px] lg:text-[62px] leading-[0.94]">
                  StayKnown Family Safety
                </h1>

                <div className="mt-4 max-w-[76ch] space-y-3 text-white/62 font-medium text-[13px] sm:text-[14px] leading-relaxed">
                  <p>
                    StayKnown is built for the people who care when someone
                    leaves home: parents, guardians, family members, partners,
                    friends, and trusted contacts who need peace of mind without
                    invading privacy.
                  </p>

                  <p>
                    It helps turn ordinary movement into a safer, more
                    accountable experience through approved contacts, Visit
                    context, SOS, emergency contacts, safety confirmation, and
                    privacy-first boundaries.
                  </p>
                </div>

                <TintedCallout title="The family safety promise">
                  StayKnown helps trusted people care earlier, respond faster,
                  and understand safety context better — without turning love
                  into surveillance.
                </TintedCallout>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <MiniStat
                    label="For parents"
                    value="Peace"
                    detail="Know when a child or loved one is moving through a safety moment."
                  />
                  <MiniStat
                    label="For users"
                    value="Control"
                    detail="The user chooses approved contacts and safety access."
                  />
                  <MiniStat
                    label="For emergencies"
                    value="Speed"
                    detail="SOS and emergency contacts help trusted people act sooner."
                  />
                </div>

                <div className="mt-6 sm:hidden flex items-center justify-between gap-3">
                  <MobileNavLink href="/learn/safe-journey" label="Journey" />
                  <MobileNavLink
                    href="/learn/location-live-safety"
                    label="Live Safety"
                  />
                </div>

                <div className="mt-6 hidden sm:flex flex-wrap gap-3">
                  <CTA href="/learn/safe-journey" label="Learn: Safe Journey" />
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
                <SectionLabel>Why families understand it</SectionLabel>

                <div className="mt-3 text-[20px] sm:text-[25px] font-black tracking-[-0.045em] leading-tight text-white">
                  The product is built around a simple truth: people want their
                  loved ones to return safely.
                </div>

                <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
                  <p>
                    Safety is not only about strangers or crime. It is about the
                    normal moments that can become uncertain: road travel,
                    school runs, visits, late movement, unfamiliar locations,
                    missed calls, and silence.
                  </p>

                  <p>
                    StayKnown gives trusted people a safer way to care without
                    forcing constant phone calls, pressure, or guesswork.
                  </p>
                </div>
              </div>
            </PremiumPanel>
          </div>

          <div className="mb-6 grid gap-3 md:grid-cols-5">
            <FamilyStep
              n="1"
              title="User chooses"
              body="The user decides who can become part of their trusted safety circle."
            />
            <FamilyStep
              n="2"
              title="Contact approves"
              body="Trusted relationships are built through approval, not silent access."
            />
            <FamilyStep
              n="3"
              title="Movement begins"
              body="A Visit, trip, or safety flow creates context around where the user is going."
            />
            <FamilyStep
              n="4"
              title="Concern reduces"
              body="Trusted people have clearer safety context instead of waiting in fear."
            />
            <FamilyStep
              n="5"
              title="Help is closer"
              body="SOS, emergency contacts, and I’m Safe confirmation help during urgent moments."
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <FeatureCard glyph="♡" title="Built for care, not control">
              StayKnown is not designed to let people spy on others. It is built
              for trusted safety relationships where the user remains in control
              of who can receive important safety context.
              <div className="mt-3 text-white/45">
                That difference matters. Safety should protect trust, not break
                it.
              </div>
            </FeatureCard>

            <FeatureCard glyph="✓" title="Approved contacts create trust">
              Families and friends should not gain access secretly. StayKnown
              uses approval flows so safety access is intentional, visible, and
              connected to people the user trusts.
              <div className="mt-3 text-white/45">
                This keeps the app aligned with consent, privacy, and real
                safety.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⌖" title="Useful for school and daily movement">
              Parents and guardians can understand why StayKnown matters when a
              child leaves for school, a student moves around campus, or a young
              person travels to unfamiliar places.
              <div className="mt-3 text-white/45">
                The app gives safety a structure before people become worried.
              </div>
            </FeatureCard>

            <FeatureCard glyph="◌" title="Visits make movement clearer">
              A Visit can help show that someone is going somewhere or spending
              time somewhere with safety context active. This turns movement
              into something trusted people can understand.
              <div className="mt-3 text-white/45">
                Families do not need to guess every detail when the user chooses
                to share safety context.
              </div>
            </FeatureCard>

            <FeatureCard glyph="!" title="SOS when care becomes urgent">
              If something feels wrong, SOS can help trusted people know that
              the user may need help. Emergency contacts make the response path
              clearer.
              <div className="mt-3 text-white/45">
                StayKnown does not replace emergency services, but it can help
                loved ones respond faster.
              </div>
            </FeatureCard>

            <FeatureCard glyph="↻" title="I’m Safe restores peace">
              Sometimes a family only needs confirmation that the person is
              okay. “I’m Safe” helps close the worry loop when the situation is
              resolved.
              <div className="mt-3 text-white/45">
                Simple confirmation can reduce panic, repeated calls, and fear.
              </div>
            </FeatureCard>

            <FeatureCard glyph="▣" title="Safety Gallery and recognition">
              Safety Gallery can help trusted contacts recognize the user and
              understand useful identity or safety context during Visit, SOS, or
              concern.
              <div className="mt-3 text-white/45">
                When safety matters, recognition and context can be important.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⟡" title="Chat keeps trusted people connected">
              StayKnown Chat supports communication around the safety network:
              messages, voice notes, media, profile trust, and other ways to
              stay connected.
              <div className="mt-3 text-white/45">
                Safety becomes stronger when trusted people can communicate
                inside the same product.
              </div>
            </FeatureCard>

            <FeatureCard glyph="◈" title="Strong privacy boundary">
              The app must always protect against misuse. StayKnown should not
              support stalking, harassment, coercion, threats, or forced
              monitoring.
              <div className="mt-3 text-white/45">
                This is why consent, approval, reporting, and legal boundaries
                are part of the product identity.
              </div>
            </FeatureCard>

            <FeatureCard glyph="✦" title="Why the world needs it">
              People already use phones to ask, “Where are you?” StayKnown turns
              that everyday concern into a stronger safety system with trust,
              consent, emergency readiness, and peace of mind.
              <div className="mt-3 text-white/45">
                The product is easy to understand because the problem is already
                part of everyday life.
              </div>
            </FeatureCard>
          </div>

          <div className="mt-6">
            <PremiumPanel>
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <SectionLabel>Who benefits</SectionLabel>

                  <div className="mt-3 text-[21px] sm:text-[28px] font-black tracking-[-0.045em] leading-tight text-white">
                    StayKnown supports the people who leave and the people who
                    wait.
                  </div>

                  <p className="mt-3 text-[12.8px] leading-relaxed text-white/56 font-medium">
                    The user gets control, privacy, and emergency readiness.
                    Their trusted people get better awareness, faster response
                    signals, and peace of mind when movement matters.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "A parent wants to know their child reached school safely.",
                    "A family wants peace when someone travels by road.",
                    "A partner wants safety assurance during a late outing.",
                    "A trusted friend wants to know when someone got home safely.",
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
                    Family Safety explains the emotional purpose. Other pages
                    explain the product tools.
                  </div>

                  <p className="mt-3 text-[12.8px] leading-relaxed text-white/56 font-medium">
                    Visitors can continue into Safe Journey, Location & Live
                    Safety, Chat, SOS, approved contacts, and privacy policy
                    pages to understand the full StayKnown system.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      title: "Safe Journey",
                      body: "Travel, movement, visits, and safety before panic begins.",
                      href: "/learn/safe-journey",
                    },
                    {
                      title: "Location & Live Safety",
                      body: "Visit, live context, maps, safety sharing, and approved access.",
                      href: "/learn/location-live-safety",
                    },
                    {
                      title: "StayKnown Chat",
                      body: "Messages, voice notes, stickers, media, and trusted communication.",
                      href: "/learn/chat",
                    },
                    {
                      title: "Secure Chat Protection",
                      body: "Device-level and biometric-aware privacy for safety conversations.",
                      href: "/learn/secure-chat-protection",
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
                  A loved one should not have to vanish before care becomes
                  urgent.
                </div>

                <p className="mx-auto mt-4 max-w-2xl text-[13px] sm:text-[14px] leading-relaxed font-medium text-white/56">
                  StayKnown is built to make family safety more intentional,
                  more respectful, and more connected — with consent at the
                  center.
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
                    href="/learn/safe-journey"
                    className="
                      inline-flex h-11 items-center justify-center rounded-full
                      border border-white/16 bg-white/[0.08] px-5
                      text-[12px] font-black tracking-[-0.01em] !text-white
                      backdrop-blur-xl transition hover:bg-white/[0.14]
                      active:scale-[0.99] visited:!text-white focus:!text-white
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20
                    "
                  >
                    Continue to Safe Journey
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
