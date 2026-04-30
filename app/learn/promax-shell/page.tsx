"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Tier = "Starter" | "Pro" | "ProMax";

const seo = {
  title: "ProMax MainShell | StayKnown Premium Safety Navigation",
  description:
    "Learn how StayKnown ProMax MainShell creates a premium safety navigation layer for Visits, LIVE, SOS readiness, Safety Gallery access, contact trust, and fast emergency-aware actions.",
  url: "https://stay-known.com/learn/promax-shell",
  image: "https://stay-known.com/hero/promax-shell.png",
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
  bullets: string[];
  highlight?: boolean;
  note?: string;
}) {
  return (
    <PremiumPanel className={highlight ? "border-white/18" : ""}>
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="text-white/95 font-black tracking-[-0.025em] text-[14px] sm:text-[15px]">
            {tier}
          </div>
          {highlight && (
            <div className="text-[10px] font-black tracking-[0.22em] text-white/56">
              FULL POSTURE
            </div>
          )}
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

function SoliloquyBox() {
  return (
    <PremiumPanel>
      <div className="p-5 sm:p-6">
        <SectionLabel>Scenario thinking</SectionLabel>
        <div className="mt-3 text-[19px] sm:text-[24px] font-black tracking-[-0.045em] leading-tight text-white">
          “I need the app to stay calm, clear, and fast when I am under
          pressure.”
        </div>
        <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
          <p>
            That is the MainShell idea. It is not just a navigation bar. It is
            the app’s main safety cockpit — the place users return to when they
            need Visits, LIVE context, Safety Gallery, Contacts, Chat, History,
            Profile, and plan-aware actions to feel close and predictable.
          </p>
          <p>
            For visitors, it makes the app feel easier to trust. For investors,
            it shows StayKnown is thinking about habit, retention, clarity, and
            premium product feel. For safety readers, it shows the interface is
            designed to reduce confusion when a user needs to act quickly.
          </p>
        </div>
      </div>
    </PremiumPanel>
  );
}

export default function LearnProMaxShellPage() {
  const [tier, setTier] = useState<Tier>("ProMax");

  const tierCopy = useMemo(() => {
    return {
      Starter: [
        "Standard navigation posture with access to core safety basics such as Visit flow and essential account areas.",
        "Premium shell behaviors are not fully enabled, keeping Starter focused on basic safety use.",
        "The MainShell center action is not treated as a premium Safety Gallery entry on Starter.",
        "SOS and deeper readiness flows remain gated to paid plans inside the app.",
      ],
      Pro: [
        "Unlock stronger safety posture with practical premium navigation behaviors and cleaner access to safety actions.",
        "MainShell can support Safety Gallery entry and SOS readiness where plan rules allow it.",
        "Designed for users who need more than basic check-ins and want faster movement through safety features.",
        "Pro improves the feeling of readiness while keeping the interface controlled and understandable.",
      ],
      ProMax: [
        "The full premium MainShell posture with the strongest navigation clarity, safety readiness, and polished interaction feel.",
        "Designed to feel calm under stress: visible safety actions, predictable spacing, and high-confidence screen transitions.",
        "Best for users who want the most complete StayKnown experience: safety, chat, profile, personalization, and premium navigation.",
        "ProMax helps communicate that StayKnown is a serious safety platform, not a casual utility app.",
      ],
    } as Record<Tier, string[]>;
  }, []);

  const tierNote: Record<Tier, string> = useMemo(
    () => ({
      Starter:
        "Starter remains useful for basic safety, but premium readiness features stay gated to preserve the plan model.",
      Pro: "Pro is the practical upgrade: SOS readiness, Safety Gallery access, and cleaner premium movement across safety features.",
      ProMax:
        "ProMax is the full premium shell posture: maximum clarity, fastest access, and the strongest safety presentation.",
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
      "ProMax safety app",
      "premium safety navigation",
      "StayKnown MainShell",
      "SOS readiness",
      "Safety Gallery",
      "live visit safety",
      "mobile safety app interface",
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
              Learn • ProMax MainShell
            </div>
          </div>

          <div className="sm:hidden mt-3 flex items-center justify-between">
            <MobileNavLink
              href="/learn/visit-live"
              label="Previous: Live Emitter"
            />
            <MobileNavLink href="/" label="Back to Home" />
          </div>

          <div className="hidden sm:flex mt-5 flex-wrap justify-center gap-3">
            <CTA href="/" label="Back to Home" />
            <CTA href="/learn/visit-live" label="Previous: Live Emitter" />
            <CTA href="/learn/visit-live-sos" label="Live + SOS" />
          </div>
        </div>
      </header>

      <section className="relative w-full lg:-mb-[360px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.065),transparent_58%)]" />

        <div className="mx-auto max-w-6xl px-4 pt-8 pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] items-start gap-8 lg:gap-10">
            <div className="order-1 lg:order-none lg:col-start-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[10.5px] font-black tracking-[0.20em] text-white/46 uppercase">
                Premium safety cockpit
              </div>

              <h1 className="mt-4 text-white/95 font-black tracking-[-0.06em] text-[38px] sm:text-[54px] lg:text-[60px] leading-[0.94]">
                ProMax MainShell
              </h1>

              <div className="mt-4 max-w-[76ch] space-y-3 text-white/62 font-medium text-[13px] sm:text-[14px] leading-relaxed">
                <p>
                  MainShell is the main navigation layer users live inside. It
                  shapes how quickly they reach Visit controls, LIVE posture,
                  Safety Gallery, Chat, History, Contacts, Profile, and
                  plan-aware safety actions.
                </p>
                <p>
                  ProMax MainShell is designed to feel premium without hiding
                  the important parts. The goal is calm speed: fewer
                  distractions, stronger visual confidence, and faster access to
                  safety.
                </p>
              </div>

              <TintedCallout title="What “MainShell” actually means">
                MainShell is the safety cockpit of StayKnown. It is where
                motion, spacing, button placement, and feature access are tuned
                for real moments of stress.{" "}
                <em>Less searching. Less hesitation. Faster reactions.</em>
              </TintedCallout>

              <TintedCallout title="Important plan gate: the center action">
                In the MainShell, the center action can serve as a premium entry
                into{" "}
                <span className="text-white/78 font-black">Safety Gallery</span>{" "}
                on <span className="text-white/78 font-black">Pro</span> and{" "}
                <span className="text-white/78 font-black">ProMax</span>.
                <div className="mt-2 text-white/52 text-[12.4px] leading-relaxed">
                  On <span className="text-white/75 font-black">Starter</span>,
                  premium readiness actions remain gated so the safety and
                  subscription model stays clear.
                </div>
              </TintedCallout>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MiniStat
                  label="Posture"
                  value="Premium"
                  detail="Designed to feel calm, clear, and high-confidence."
                />
                <MiniStat
                  label="Access"
                  value="Safety first"
                  detail="Keeps core safety areas easier to reach."
                />
                <MiniStat
                  label="Plan"
                  value="ProMax"
                  detail="The most complete shell and readiness experience."
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
            </div>

            <div className="order-2 lg:order-none lg:col-start-1 flex items-start justify-center lg:justify-start">
              <img
                src="/hero/promax-shell.png"
                alt="ProMax MainShell"
                className="
                  block object-contain select-none
                  drop-shadow-[0_26px_95px_rgba(0,0,0,0.78)]
                  max-w-[86vw] max-h-[44vh]
                  sm:max-w-[560px] sm:max-h-[62vh]
                  lg:max-w-[780px] lg:max-h-[74vh]
                  xl:max-w-[860px]
                  transform-gpu transition duration-700 ease-out hover:scale-[1.01]
                   lg:-translate-y-[1080px] xl:-translate-y-[1180px] 2xl:-translate-y-[1360px]
                "
                draggable={false}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full">
        <div className="mx-auto max-w-6xl px-4 pb-12">
          <div className="mb-5 grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-5">
            <SoliloquyBox />

            <PremiumPanel>
              <div className="p-5 sm:p-6">
                <SectionLabel>Safety and interface posture</SectionLabel>
                <div className="mt-3 text-[20px] sm:text-[25px] font-black tracking-[-0.045em] leading-tight text-white">
                  Premium design is useful only if it makes safety faster, not
                  harder.
                </div>
                <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
                  <p>
                    The ProMax shell should never bury critical actions behind
                    decoration. Visual polish must support clarity: readable
                    navigation, stable motion, recognizable state changes, and
                    safety controls that remain obvious.
                  </p>
                  <p>
                    StayKnown’s premium experience is not meant to turn
                    emergency actions into entertainment. It is meant to make
                    the app feel trustworthy, calm, and serious enough for
                    real-world safety use.
                  </p>
                </div>
              </div>
            </PremiumPanel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <FeatureCard glyph="◧" title="Calm navigation posture">
              The shell reduces clutter and keeps important destinations
              visually anchored. Users should not hunt for core areas like Home,
              Contacts, Chat, History, Profile, or safety actions.
              <div className="mt-3 text-white/45">
                Example: <em>Start Visit</em> stays obvious, and escalation
                paths remain intentional.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⌁" title="Hardware-like premium feel">
              Subtle motion, stable spacing, glassy panels, and quiet
              transitions make the app feel engineered rather than chaotic. The
              interface should stay calm even when the user’s situation is
              stressful.
            </FeatureCard>

            <FeatureCard glyph="＋" title="Center action and Safety Gallery">
              On Pro and ProMax, the center action can become a fast Safety
              Gallery entry point for adding and managing safety images used in
              premium readiness flows.
              <div className="mt-3 text-white/45">
                Starter users should see premium readiness as gated, not broken.
              </div>
            </FeatureCard>

            <FeatureCard glyph="!" title="Safety first, even in premium mode">
              Premium effects should never hide critical controls. SOS, Visit
              state, account safety, and contact trust should remain readable,
              predictable, and easy to explain.
              <div className="mt-3 text-white/45">
                See <em>Safety &amp; Anti-Stalking</em>, <em>Acceptable Use</em>
                , and <em>Emergency Disclaimer</em>.
              </div>
            </FeatureCard>

            <FeatureCard glyph="▣" title="Why this matters under stress">
              Under pressure, users need comprehension more than decoration. A
              better shell reduces cognitive load: fewer confusing paths,
              clearer labels, and faster access to the next correct action.
              <div className="mt-3 text-white/45">
                Example: a user should know where to go for Visit, Chat, Safety
                Gallery, or Profile without thinking too long.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⟡" title="Plan clarity">
              <div className="space-y-2">
                <div>
                  <span className="text-white/78 font-black">Starter:</span>{" "}
                  core safety basics and standard navigation posture.
                </div>
                <div>
                  <span className="text-white/78 font-black">Pro:</span>{" "}
                  practical premium safety upgrades, SOS readiness, and Safety
                  Gallery entry where enabled.
                </div>
                <div>
                  <span className="text-white/78 font-black">ProMax:</span>{" "}
                  complete premium shell posture with the strongest navigation
                  and readiness experience.
                </div>
              </div>
            </FeatureCard>

            <FeatureCard glyph="⚖" title="Law-abiding explanation">
              MainShell is a navigation and safety-readiness layer. It does not
              replace emergency services and does not authorize misuse of
              location, chat, or contact features. It should support lawful,
              consent-aware safety use.
              <div className="mt-3 text-white/45">
                Users should contact local emergency services in immediate
                danger.
              </div>
            </FeatureCard>

            <FeatureCard glyph="◌" title="Why investors should care">
              MainShell is a retention surface. It connects safety habits, plan
              tiers, profile trust, Safety Gallery, Chat, History, Contacts, and
              future premium experiences in one familiar daily interface.
              <div className="mt-3 text-white/45">
                A strong shell can make StayKnown feel like a premium platform,
                not a one-time emergency tool.
              </div>
            </FeatureCard>
          </div>

          <div className="mt-6">
            <PremiumPanel>
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <SectionLabel>Search discovery focus</SectionLabel>
                  <div className="mt-3 text-[21px] sm:text-[28px] font-black tracking-[-0.045em] leading-tight text-white">
                    This page is written for discovery around premium safety app
                    navigation, SOS readiness, and ProMax safety experience.
                  </div>
                  <p className="mt-3 text-[12.8px] leading-relaxed text-white/56 font-medium">
                    Search engines and visitors need plain product language.
                    MainShell is the app’s premium safety navigation layer — the
                    surface that connects everyday movement, urgent safety,
                    trusted communication, and plan-based value.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "A user opens the app and immediately understands where Visit, Chat, and Profile live.",
                    "A Pro user reaches Safety Gallery faster through a clear premium shell action.",
                    "A ProMax user experiences smoother navigation and stronger premium readiness.",
                    "A visitor understands that the app is designed for safety clarity, not visual noise.",
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
        </div>
      </section>

      <footer className="relative w-full">
        <div className="mx-auto max-w-6xl px-4 pb-10">
          <div className="h-px bg-white/[0.08]" />

          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] sm:text-[12px] font-semibold text-white/45 leading-relaxed">
              <a href="/privacy" className="hover:text-white/75 transition">
                Privacy Policy
              </a>
              <span className="text-white/18">•</span>
              <a href="/terms" className="hover:text-white/75 transition">
                Terms of Service
              </a>
              <span className="text-white/18">•</span>
              <a
                href="/acceptable-use"
                className="hover:text-white/75 transition"
              >
                Acceptable Use
              </a>
              <span className="text-white/18">•</span>
              <a href="/safety" className="hover:text-white/75 transition">
                Safety &amp; Anti-Stalking
              </a>
              <span className="text-white/18">•</span>
              <a href="/emergency" className="hover:text-white/75 transition">
                Emergency Disclaimer
              </a>
              <span className="text-white/18">•</span>
              <a href="/minors" className="hover:text-white/75 transition">
                Child Safety &amp; Minor Use
              </a>
              <span className="text-white/18">•</span>
              <a href="/abuse" className="hover:text-white/75 transition">
                Abuse Reporting
              </a>
              <span className="text-white/18">•</span>
              <a href="/retention" className="hover:text-white/75 transition">
                Data Retention
              </a>
              <span className="text-white/18">•</span>
              <a href="/law" className="hover:text-white/75 transition">
                Law Enforcement
              </a>
              <span className="text-white/18">•</span>
              <a href="/security" className="hover:text-white/75 transition">
                Security Disclosure
              </a>
            </div>

            <div className="text-[12px] text-white/50 font-semibold">
              A 6 Clement Joshua service
              <span className="text-white/25 ml-1 align-super text-[10px]">
                ™
              </span>
            </div>

            <div className="text-[11px] text-white/30 font-semibold">
              {new Date().getFullYear()} • stay-known.com
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
