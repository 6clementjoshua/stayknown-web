"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Tier = "Starter" | "Pro" | "ProMax";

const seo = {
  title: "SOS Active State | StayKnown Emergency Safety Escalation",
  description:
    "Learn how StayKnown SOS changes the app into an urgent safety posture with trusted-contact context, clear state language, Pro and ProMax gating, and law-abiding emergency safety guidance.",
  url: "https://stay-known.com/learn/sos",
  image: "https://stay-known.com/hero/sos-activated.png",
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10.5px] font-black tracking-[0.26em] text-white/35 uppercase">
      {children}
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

function PlanTabs({
  tier,
  setTier,
}: {
  tier: Tier;
  setTier: (t: Tier) => void;
}) {
  const Tab = ({ t }: { t: Tier }) => {
    const active = tier === t;

    return (
      <button
        onClick={() => setTier(t)}
        className={[
          "relative px-0 py-2 text-[11.5px] font-semibold tracking-[-0.01em] transition select-none",
          active ? "text-white" : "text-white/52 hover:text-white/85",
        ].join(" ")}
      >
        {t}
        <span
          className={[
            "pointer-events-none absolute left-0 -bottom-[2px] h-[2px] rounded-full transition-all duration-200",
            active ? "w-full bg-white/65" : "w-0 bg-white/0",
          ].join(" ")}
        />
        <span className="pointer-events-none absolute inset-0 opacity-0 active:opacity-100 transition duration-75 bg-white/[0.06]" />
      </button>
    );
  };

  const Pill = ({ t }: { t: Tier }) => {
    const active = tier === t;

    return (
      <button
        onClick={() => setTier(t)}
        className={[
          "relative inline-flex items-center justify-center select-none overflow-hidden",
          "rounded-full border transition-all duration-200",
          "px-3.5 h-[34px] text-[12px]",
          active
            ? "border-white/28 bg-white/[0.11] text-white shadow-[0_12px_34px_rgba(255,255,255,0.04)]"
            : "border-white/14 bg-white/[0.045] text-white/76 hover:bg-white hover:border-white/30 hover:text-black hover:[&_*]:text-black",
        ].join(" ")}
      >
        <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_58%)]" />
        <span className="relative font-semibold tracking-[-0.01em]">{t}</span>
      </button>
    );
  };

  return (
    <>
      <div className="sm:hidden flex items-center justify-center gap-5">
        <Tab t="Starter" />
        <Tab t="Pro" />
        <Tab t="ProMax" />
      </div>

      <div className="hidden sm:flex flex-wrap gap-2">
        <Pill t="Starter" />
        <Pill t="Pro" />
        <Pill t="ProMax" />
      </div>
    </>
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

function TierBlock({
  tier,
  bullets,
  highlight,
  note,
}: {
  tier: Tier;
  highlight?: boolean;
  bullets: string[];
  note?: string;
}) {
  return (
    <PremiumPanel className={highlight ? "border-white/18" : ""}>
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="text-white/95 font-black tracking-[-0.025em] text-[14px] sm:text-[15px]">
            {tier}
          </div>

          {highlight ? (
            <div className="text-[10px] font-black tracking-[0.22em] text-white/56">
              HIGHEST READINESS
            </div>
          ) : null}
        </div>

        <ul className="mt-4 space-y-2.5">
          {bullets.map((b, i) => (
            <li
              key={i}
              className="flex gap-2.5 text-white/62 font-medium text-[12.6px] leading-relaxed"
            >
              <span className="mt-[2px] text-white/42">•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {note ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-[11.8px] leading-relaxed text-white/48">
            <span className="font-black text-white/64">Note:</span>{" "}
            <em>{note}</em>
          </div>
        ) : null}
      </div>
    </PremiumPanel>
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

function CompareStateCard({
  image,
  title,
  label,
  body,
}: {
  image: string;
  title: string;
  label: string;
  body: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-black/25 p-4 shadow-[0_22px_70px_rgba(0,0,0,0.55)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_12%,rgba(255,255,255,0.09),transparent_58%)]" />

      <div className="relative grid grid-cols-[92px_1fr] gap-4 items-center sm:grid-cols-[116px_1fr]">
        <div className="relative flex justify-center">
          <img
            src={image}
            alt={title}
            draggable={false}
            className="max-h-[170px] w-auto object-contain drop-shadow-[0_18px_50px_rgba(0,0,0,0.7)]"
          />
        </div>

        <div>
          <div className="text-[10px] font-black tracking-[0.22em] text-white/35 uppercase">
            {label}
          </div>
          <div className="mt-2 text-[15px] sm:text-[17px] font-black tracking-[-0.035em] text-white">
            {title}
          </div>
          <p className="mt-2 text-[12.4px] leading-relaxed font-medium text-white/56">
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}

function ScenarioBox() {
  return (
    <PremiumPanel>
      <div className="p-5 sm:p-6">
        <SectionLabel>Scenario thinking</SectionLabel>

        <div className="mt-3 text-[19px] sm:text-[24px] font-black tracking-[-0.045em] leading-tight text-white">
          “When I press SOS, the app should become unmistakably urgent — not
          loud for decoration, but clear enough that everyone understands the
          state changed.”
        </div>

        <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
          <p>
            This page focuses on SOS as a state language. It is about what the
            app communicates after activation: urgency, recipient attention,
            user identity, current safety context, and the difference between
            standby and escalation.
          </p>

          <p>
            The deeper mechanics of Visits, Manual Capture, and Verified Stop
            are explained on their own pages so SOS can stay focused on what
            changes when the user enters an urgent protection posture.
          </p>
        </div>
      </div>
    </PremiumPanel>
  );
}

export default function LearnSosPage() {
  const [tier, setTier] = useState<Tier>("Pro");

  const tierCopy = useMemo(() => {
    return {
      Starter: [
        "Starter can learn how SOS works, but active SOS escalation is locked to paid safety plans.",
        "Starter users should rely on basic Visit safety and trusted setup until they upgrade for SOS readiness.",
        "The public SOS explanation remains visible so users understand what they unlock before subscribing.",
        "Starter should still show lawful use, consent, and emergency disclaimer language clearly.",
      ],
      Pro: [
        "Pro unlocks SOS activation for urgent safety moments when the user needs trusted people to pay attention immediately.",
        "The app can shift from ordinary safety context into a clearer emergency posture with stronger visual language.",
        "Trusted contacts can receive more serious context than a normal Visit update or Manual Capture checkpoint.",
        "Pro is the practical SOS tier for users who want emergency readiness without needing the full ProMax experience.",
      ],
      ProMax: [
        "ProMax gives the strongest SOS presentation posture across premium safety, identity, and user-confidence surfaces.",
        "Best for users who want maximum clarity around urgent states, high-risk movement, frequent travel, or repeated safety routines.",
        "Pairs naturally with Safety Gallery, stronger contact trust, verified stop behavior, premium shell effects, and polished emergency state design.",
        "ProMax should feel serious, fast, and refined — urgent without looking chaotic or cheap.",
      ],
    } as Record<Tier, string[]>;
  }, []);

  const tierNote: Record<Tier, string> = useMemo(
    () => ({
      Starter:
        "SOS is not available on Starter. Upgrade inside the app so entitlement checks stay verified across devices.",
      Pro: "SOS should be used for real safety concerns. It is not a prank feature, tracking shortcut, or replacement for emergency services.",
      ProMax:
        "ProMax is the highest StayKnown safety posture, but users should still contact local emergency services in immediate danger.",
    }),
    [],
  );

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
      "StayKnown SOS",
      "SOS active state",
      "mobile emergency safety app",
      "trusted contact alert",
      "personal safety escalation",
      "biometric verified stop",
      "lawful safety communication",
      "Pro safety plan",
      "ProMax safety plan",
    ],
  };

  return (
    <main className="min-h-screen bg-black overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.075),transparent_38%),radial-gradient(circle_at_18%_38%,rgba(255,255,255,0.04),transparent_34%),radial-gradient(circle_at_82%_56%,rgba(255,255,255,0.035),transparent_34%)]" />

      <header className="relative pt-7">
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
              Learn • SOS Active State
            </div>
          </div>

          <div className="sm:hidden mt-3 flex items-center justify-between">
            <MobileNavLink href="/" label="Back to Home" />
            <MobileNavLink
              href="/learn/verified-stop"
              label="Next: Verified Stop"
            />
          </div>

          <div className="hidden sm:flex mt-5 items-center justify-center gap-3">
            <CTA href="/" label="Back to Home" />
            <CTA href="/learn/manual-capture" label="Manual Capture" />
            <CTA href="/learn/verified-stop" label="Next: Verified Stop" />
          </div>
        </div>
      </header>

      <section className="relative w-full lg:-mb-[360px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.065),transparent_58%)]" />

        <div className="mx-auto max-w-6xl px-4 pt-8 pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] items-start gap-8 lg:gap-8">
            <div className="order-1 lg:order-none lg:col-start-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[10.5px] font-black tracking-[0.20em] text-white/46 uppercase">
                Urgent safety state for Pro and ProMax
              </div>

              <h1 className="mt-4 text-white/95 font-black tracking-[-0.06em] text-[38px] sm:text-[54px] lg:text-[60px] leading-[0.94]">
                SOS Active State
              </h1>

              <div className="mt-4 max-w-[76ch] space-y-3 text-white/62 font-medium text-[13px] sm:text-[14px] leading-relaxed">
                <p>
                  SOS is StayKnown’s urgent safety posture. It is the moment the
                  interface, contact messaging, and user context should stop
                  feeling routine and start communicating immediate attention.
                </p>

                <p>
                  The goal is not to make the screen noisy. The goal is to make
                  the state unmistakable: SOS is active, the user may need help,
                  trusted contacts should pay attention, and the app should
                  preserve clarity under pressure.
                </p>
              </div>

              <TintedCallout title="The main difference">
                Manual Capture says, “send one more checkpoint.” Visit says,
                “keep my safety session visible.” SOS says, “this situation now
                needs urgent attention.”{" "}
                <em>
                  SOS supports safety communication, but it does not replace
                  police, ambulance, fire, or other emergency services.
                </em>
              </TintedCallout>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MiniStat
                  label="State"
                  value="Urgent"
                  detail="The app communicates a serious safety posture."
                />
                <MiniStat
                  label="Access"
                  value="Pro+"
                  detail="SOS activation is gated to paid safety plans."
                />
                <MiniStat
                  label="Recipient"
                  value="Trusted"
                  detail="SOS context should go to approved safety contacts."
                />
              </div>

              <div className="mt-7">
                <SectionLabel>Experience by plan</SectionLabel>

                <div className="mt-3">
                  <PlanTabs tier={tier} setTier={setTier} />
                </div>

                <div className="mt-4">
                  <TierBlock
                    tier={tier}
                    highlight={tier === "ProMax"}
                    bullets={tierCopy[tier]}
                    note={tierNote[tier]}
                  />
                </div>
              </div>

              <div className="mt-6">
                <div className="sm:hidden flex items-center justify-between gap-3">
                  <MobileNavLink
                    href="/learn/manual-capture"
                    label="Manual Capture"
                  />
                  <MobileNavLink href="/learn/end-sos-verify" label="End SOS" />
                </div>

                <div className="hidden sm:flex flex-wrap gap-3">
                  <CTA
                    href="/learn/manual-capture"
                    label="Learn: Manual Capture"
                  />
                  <CTA
                    href="/learn/end-sos-verify"
                    label="Learn: End SOS Verification"
                  />
                </div>
              </div>
            </div>

            <div className="order-2 lg:order-none lg:col-start-1 flex items-start justify-center lg:justify-start">
              <img
                src="/hero/sos-activated.png"
                alt="SOS active emergency safety state"
                draggable={false}
                className="
                  block object-contain select-none
                  drop-shadow-[0_26px_95px_rgba(0,0,0,0.78)]
                  max-w-[86vw] max-h-[44vh]
                  sm:max-w-[560px] sm:max-h-[62vh]
                  lg:max-w-[720px] lg:max-h-[74vh]
                  xl:max-w-[780px]
                  transform-gpu transition duration-700 ease-out hover:scale-[1.01]
                  lg:-translate-y-[1080px] xl:-translate-y-[1180px] 2xl:-translate-y-[1360px]
                "
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full">
        <div className="mx-auto max-w-6xl px-4 pb-10 sm:pb-14">
          <div className="mb-5 grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-5">
            <ScenarioBox />

            <PremiumPanel>
              <div className="p-5 sm:p-6">
                <SectionLabel>Ready versus active</SectionLabel>

                <div className="mt-3 text-[20px] sm:text-[25px] font-black tracking-[-0.045em] leading-tight text-white">
                  SOS should look different before and after activation.
                </div>

                <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
                  <p>
                    In a safety product, state confusion is dangerous. A user
                    should not wonder whether SOS is idle, available,
                    activating, active, failed, or ended.
                  </p>

                  <p>
                    StayKnown can use distinct visual posture, short labels, and
                    recipient-facing language so the user and trusted contacts
                    understand the same event in the same way.
                  </p>
                </div>
              </div>
            </PremiumPanel>
          </div>

          <div className="mb-6 grid gap-5 lg:grid-cols-2">
            <CompareStateCard
              image="/hero/sos-live-idle.png"
              label="Reference state"
              title="SOS ready, not active"
              body="The idle state should tell users SOS is available without making them think escalation is already running. It stays calm, readable, and ready."
            />

            <CompareStateCard
              image="/hero/sos-activated.png"
              label="Main state"
              title="SOS activated"
              body="The active state should immediately communicate urgency. It should feel serious, direct, and unmistakable without becoming visually messy."
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <FeatureCard glyph="!" title="What changes when SOS activates">
              SOS should create a clear transition:
              <div className="mt-3 space-y-2 text-white/62">
                <div>• the user sees a stronger emergency state</div>
                <div>• trusted contacts receive urgent context</div>
                <div>• the app prioritizes clarity over decoration</div>
                <div>• ending the state can route toward Verified Stop</div>
              </div>
              <div className="mt-3 text-white/45">
                This page is about that transition, not the normal Visit
                lifecycle.
              </div>
            </FeatureCard>

            <FeatureCard glyph="▣" title="Recipient clarity">
              A trusted contact should quickly understand the difference between
              a normal safety update and a serious SOS event.
              <div className="mt-3 space-y-2 text-white/62">
                <div>
                  • <span className="text-white/80 font-black">Who:</span> the
                  account owner or protected user
                </div>
                <div>
                  • <span className="text-white/80 font-black">What:</span> SOS
                  was activated
                </div>
                <div>
                  • <span className="text-white/80 font-black">Where:</span>{" "}
                  latest available location context
                </div>
                <div>
                  • <span className="text-white/80 font-black">When:</span>{" "}
                  readable event timing
                </div>
              </div>
            </FeatureCard>

            <FeatureCard glyph="⌁" title="Why SOS needs restraint">
              Emergency UI can fail if it becomes too dramatic, too crowded, or
              too hard to read. StayKnown’s SOS state should feel premium but
              disciplined.
              <div className="mt-3 text-white/45">
                The design should make the user feel guided, not overwhelmed.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⟡" title="Trust signals around SOS">
              SOS becomes stronger when it is supported by recognition and
              context:
              <div className="mt-3 space-y-2 text-white/62">
                <div>• approved emergency contacts</div>
                <div>• Safety Gallery identity cues</div>
                <div>• profile name and trusted relationship context</div>
                <div>• readable session timing and latest location status</div>
              </div>
            </FeatureCard>

            <FeatureCard glyph="✔" title="Activation should be intentional">
              SOS should not feel like a hidden shortcut or accidental
              background behavior. It should be a clear user action with a clear
              outcome.
              <div className="mt-3 text-white/45">
                The user needs to know: “SOS is now active, and trusted people
                may be notified.”
              </div>
            </FeatureCard>

            <FeatureCard glyph="◌" title="After activation">
              After SOS activates, the app should continue explaining what is
              happening in calm language:
              <div className="mt-3 space-y-2 text-white/62">
                <div>• protection is active</div>
                <div>• trusted contacts may receive updates</div>
                <div>• location reliability depends on device settings</div>
                <div>• the user can follow the correct end-SOS flow later</div>
              </div>
            </FeatureCard>

            <FeatureCard glyph="⚖" title="Law-abiding safety language">
              SOS is a personal safety escalation feature. It should not be used
              to harass, threaten, falsely alarm, stalk, coerce, or create fake
              emergencies.
              <div className="mt-3 text-white/45">
                In immediate danger, users should contact local emergency
                services directly.
              </div>
            </FeatureCard>

            <FeatureCard glyph="✦" title="Investor value">
              SOS gives StayKnown a premium emergency posture beyond casual
              messaging or map sharing. It shows the product can support a full
              safety stack: readiness, escalation, trusted contact context,
              recognition, and verified ending.
              <div className="mt-3 text-white/45">
                That makes SOS a serious subscription anchor for Pro and ProMax.
              </div>
            </FeatureCard>
          </div>

          <div className="mt-6">
            <PremiumPanel>
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <SectionLabel>Related learn pages</SectionLabel>

                  <div className="mt-3 text-[21px] sm:text-[28px] font-black tracking-[-0.045em] leading-tight text-white">
                    SOS stays clearer when nearby topics have their own pages.
                  </div>

                  <p className="mt-3 text-[12.8px] leading-relaxed text-white/56 font-medium">
                    Instead of repeating every safety feature here, this page
                    focuses on the meaning and presentation of SOS. The other
                    pages explain the surrounding mechanics in more detail.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      title: "Manual Capture",
                      body: "Extra checkpoint before SOS is needed.",
                      href: "/learn/manual-capture",
                    },
                    {
                      title: "End SOS Verification",
                      body: "How urgent states can end deliberately.",
                      href: "/learn/end-sos-verify",
                    },
                    {
                      title: "Safety Gallery",
                      body: "Recognition cues for contacts during alerts.",
                      href: "/learn/safety-gallery",
                    },
                    {
                      title: "Contact Approval",
                      body: "Trusted recipients and consent-aware setup.",
                      href: "/learn/contact-approval",
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
                Terms of Use
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
