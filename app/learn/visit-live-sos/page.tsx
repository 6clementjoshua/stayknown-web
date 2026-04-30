"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Tier = "Starter" | "Pro" | "ProMax";

function MobileNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="
        relative inline-flex items-center gap-2
        px-0 py-2
        text-[11.5px] font-semibold tracking-[-0.01em]
        text-white/68
        transition
        hover:text-white/90
        active:text-white
        select-none
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
        border border-white/14
        bg-white/[0.055]
        text-white
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
        border border-white/12
        bg-white/[0.045]
        backdrop-blur-md
        flex items-center justify-center
        text-white/90
        text-[14px]
        leading-none
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
        border border-white/10
        bg-white/[0.035]
        shadow-[0_24px_78px_rgba(0,0,0,0.58)]
        p-5 sm:p-6
        transition-all duration-300
        hover:-translate-y-0.5
        hover:border-white/18
        hover:bg-white/[0.05]
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
          “I am going somewhere. I want someone I trust to know I started
          safely, see the Visit is active, and understand when it becomes
          urgent.”
        </div>
        <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
          <p>
            That is the StayKnown logic. A Visit is not random tracking. It is a
            user-started safety session. LIVE is the active context inside that
            session. SOS is the escalation layer for Pro and ProMax when the
            situation changes from routine safety sharing to urgent attention.
          </p>
          <p>
            For visitors, this makes the app easy to understand. For trusted
            contacts, it reduces confusion. For investors, it shows a platform
            that combines location, identity, consent, messaging, and emergency
            posture without turning safety into uncontrolled surveillance.
          </p>
        </div>
      </div>
    </PremiumPanel>
  );
}

export default function LearnVisitLiveSosPage() {
  const [tier, setTier] = useState<Tier>("Starter");

  const tierCopy = useMemo(() => {
    return {
      Starter: [
        "Start a Visit and use LIVE sharing only while the Visit is active. When the Visit ends, the live-sharing posture ends with it.",
        "Contacts can receive clear safety context, such as who started the Visit and whether the session is still active.",
        "SOS is not available on Starter. Starter keeps the everyday Visit/check-in flow simple.",
        "Best for basic safety sharing when a user wants trusted people to know they are on a route or in a planned situation.",
      ],
      Pro: [
        "Unlock SOS escalation for urgent moments during safety use, with clearer emergency posture for trusted recipients.",
        "Useful for users who regularly move through unfamiliar routes, late-night travel, meetings, or higher-risk routines.",
        "Supports richer safety communication, so recipients can distinguish normal Visit updates from urgent escalation.",
        "Pro is the practical safety upgrade for users who need more than check-ins but do not need the full ProMax posture.",
      ],
      ProMax: [
        "The strongest StayKnown posture: safety sessions, SOS readiness, premium UI behaviors, and the most complete experience.",
        "Designed for users who want maximum clarity, control, and confidence during repeated high-stakes movement.",
        "Works well for travel routines, public-facing work, unfamiliar meetings, distance travel, and users who need the most polished safety layer.",
        "ProMax communicates seriousness without adding confusion: the UI remains premium, fast, and intentionally direct.",
      ],
    } as Record<Tier, string[]>;
  }, []);

  const tierNote: Record<Tier, string> = useMemo(
    () => ({
      Starter:
        "Upgrades should happen inside the app so plan entitlement stays verified and consistent across devices.",
      Pro: "SOS should be used only for genuine safety concerns. It is not a prank, monitoring tool, or replacement for emergency services.",
      ProMax:
        "ProMax is the full safety posture for users who want the highest level of readiness and presentation inside StayKnown.",
    }),
    [],
  );

  return (
    <main className="min-h-screen bg-black overflow-hidden">
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
              Learn • Live Visit + SOS
            </div>
          </div>

          <div className="sm:hidden mt-3 flex items-center justify-between">
            <MobileNavLink href="/" label="Back to Home" />
            <MobileNavLink
              href="/learn/visit-live"
              label="Next: Live Emitter"
            />
          </div>

          <div className="hidden sm:flex mt-5 items-center justify-center gap-3">
            <CTA href="/" label="Back to Home" />
            <CTA href="/learn/visit-live" label="Next: Live Emitter" />
            <CTA href="/learn/end-sos-verify" label="End SOS verification" />
          </div>
        </div>
      </header>

      <section className="relative w-full lg:-mb-[360px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.065),transparent_58%)]" />

        <div className="mx-auto max-w-6xl px-4 pt-8 pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] items-start gap-8 lg:gap-8">
            <div className="order-1 lg:order-none lg:col-start-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[10.5px] font-black tracking-[0.20em] text-white/46 uppercase">
                Visit → LIVE → SOS readiness
              </div>

              <h1 className="mt-4 text-white/95 font-black tracking-[-0.06em] text-[38px] sm:text-[54px] lg:text-[60px] leading-[0.94]">
                Live Visit + SOS Ready
              </h1>

              <div className="mt-4 max-w-[76ch] space-y-3 text-white/62 font-medium text-[13px] sm:text-[14px] leading-relaxed">
                <p>
                  StayKnown starts with a simple idea: when a user begins a
                  Visit, the app should make their safety context easier for
                  trusted people to understand.
                </p>
                <p>
                  LIVE provides the active session posture. SOS is the stronger
                  escalation layer for Pro and ProMax users when the situation
                  becomes urgent.
                </p>
              </div>

              <TintedCallout title="What this means in real life">
                A user starts a Visit before a route, meeting, or movement that
                deserves safety awareness. Trusted contacts see the session
                context. If the situation becomes serious, SOS changes the tone
                from ordinary safety sharing to urgent escalation.{" "}
                <em>It is built for safety clarity, not public tracking.</em>
              </TintedCallout>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MiniStat
                  label="Visit"
                  value="Started by user"
                  detail="The safety session begins only when the user chooses to start it."
                />
                <MiniStat
                  label="LIVE"
                  value="Session-bound"
                  detail="Live context is tied to the active Visit posture."
                />
                <MiniStat
                  label="SOS"
                  value="Pro / ProMax"
                  detail="Urgent escalation is plan-gated and meant for real safety concerns."
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
                    href="/learn/visit-live"
                    label="Learn: Live Emitter"
                  />
                  <MobileNavLink
                    href="/learn/promax-shell"
                    label="Explore: ProMax Shell"
                  />
                </div>

                <div className="hidden sm:flex flex-wrap gap-3">
                  <CTA
                    href="/learn/visit-live"
                    label="Learn: Live Location Emitter"
                  />
                  <CTA
                    href="/learn/promax-shell"
                    label="Explore: ProMax MainShell"
                  />
                </div>
              </div>
            </div>

            <div className="order-2 lg:order-none lg:col-start-1 flex items-start justify-center lg:justify-start">
              <img
                src="/hero/visit-live-sos.png"
                alt="Live Visit + SOS Ready"
                draggable={false}
                className="
                  block object-contain select-none
                  drop-shadow-[0_26px_95px_rgba(0,0,0,0.78)]
                  max-w-[86vw] max-h-[44vh]
                  sm:max-w-[560px] sm:max-h-[62vh]
                  lg:max-w-[720px] lg:max-h-[74vh]
                  xl:max-w-[780px]
                  transform-gpu
                  transition duration-700 ease-out
                  hover:scale-[1.01]
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
            <SoliloquyBox />

            <PremiumPanel>
              <div className="p-5 sm:p-6">
                <SectionLabel>Law-abiding safety posture</SectionLabel>
                <div className="mt-3 text-[20px] sm:text-[25px] font-black tracking-[-0.045em] leading-tight text-white">
                  StayKnown is not designed for stalking, coercion, or public
                  surveillance.
                </div>
                <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
                  <p>
                    The flow is built around user-started sessions, trusted
                    contacts, consent-aware safety communication, and clear
                    context. A Visit should be started by the user for safety.
                    It should not be used to secretly monitor another person.
                  </p>
                  <p>
                    SOS is an urgent safety posture. It should be used
                    responsibly and only when the user has a real safety
                    concern. StayKnown does not replace police, ambulance, fire,
                    or other emergency services.
                  </p>
                </div>
              </div>
            </PremiumPanel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <FeatureCard glyph="▶" title="How a Visit works">
              <div className="space-y-2">
                <div>
                  <span className="text-white/78 font-black">1)</span> The user
                  taps{" "}
                  <span className="text-white/84 font-black">Start Visit</span>.
                  This begins a safety session with clear intent.
                </div>
                <div>
                  <span className="text-white/78 font-black">2)</span> LIVE
                  context becomes active during that session, so trusted
                  contacts can understand the user’s safety status.
                </div>
                <div>
                  <span className="text-white/78 font-black">3)</span> When the
                  user ends the Visit, the active sharing posture ends too.
                </div>
              </div>
              <div className="mt-3 text-white/45">
                Example: <em>“I’m leaving now. Keep an eye until I arrive.”</em>
              </div>
            </FeatureCard>

            <FeatureCard glyph="!" title="Where SOS fits">
              SOS is not the same as a normal Visit update. It is the stronger
              emergency signal for Pro and ProMax users when a situation needs
              urgent attention.
              <div className="mt-3 text-white/45">
                Example contexts: <em>being followed</em>,{" "}
                <em>feeling unsafe</em>, <em>a route changing unexpectedly</em>,
                or <em>needing trusted contacts to act quickly</em>.
              </div>
            </FeatureCard>

            <FeatureCard glyph="▣" title="What trusted contacts understand">
              A good safety alert should not be vague. StayKnown’s direction is
              to make messages understandable: who it is from, what state is
              active, and whether it is routine safety sharing or emergency
              escalation.
              <div className="mt-3 text-white/45">
                Routine: <em>“Visit active.”</em> Emergency:{" "}
                <em>“SOS triggered — please check immediately.”</em>
              </div>
            </FeatureCard>

            <FeatureCard glyph="⌁" title="Why this helps visitors trust it">
              Visitors do not need technical language. They need to understand
              the basic safety promise: StayKnown lets a user tell trusted
              people where they are, when they are actively in a safety session,
              and when help may be needed.
              <div className="mt-3 text-white/45">
                The design avoids making safety look like a hidden tracking
                product.
              </div>
            </FeatureCard>

            <FeatureCard glyph="◌" title="Why this matters to investors">
              The product is not just a map. It combines safety sessions, user
              identity, contact trust, profile recognition, chat context, plan
              tiers, and escalation logic into one retention-friendly platform.
              <div className="mt-3 text-white/45">
                That creates room for subscription value while keeping the core
                story simple: <em>trust, clarity, and safety context.</em>
              </div>
            </FeatureCard>

            <FeatureCard glyph="⚖" title="Why this matters to law enforcement">
              StayKnown should communicate clearly that it is a user safety
              tool, not a substitute for emergency services and not a tool for
              abuse. Clear session states, trusted-recipient intent, and policy
              links help set lawful expectations.
              <div className="mt-3 text-white/45">
                Users should contact local emergency services immediately in
                life-threatening situations.
              </div>
            </FeatureCard>

            <FeatureCard glyph="✦" title="UI states are intentionally obvious">
              The app separates ordinary and urgent states visually:{" "}
              <span className="text-white/78 font-black">Idle</span>,{" "}
              <span className="text-white/78 font-black">LIVE</span>, and{" "}
              <span className="text-white/78 font-black">SOS</span>. This helps
              users avoid guessing what is active.
              <div className="mt-3 text-white/45">
                Visual Severity Mode can make SOS feel more distinct without
                changing the underlying behavior.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⟡" title="Plan gating made simple">
              <div className="space-y-2">
                <div>
                  <span className="text-white/78 font-black">Starter:</span>{" "}
                  basic safety Visits and check-ins.
                </div>
                <div>
                  <span className="text-white/78 font-black">Pro:</span> adds
                  SOS escalation for users who need more safety readiness.
                </div>
                <div>
                  <span className="text-white/78 font-black">ProMax:</span> the
                  most complete premium safety posture.
                </div>
              </div>
              <div className="mt-3 text-white/45">
                Plan status should be managed in-app so entitlements stay
                synced.
              </div>
            </FeatureCard>
          </div>

          <div className="mt-6">
            <PremiumPanel>
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <SectionLabel>Practical examples</SectionLabel>
                  <div className="mt-3 text-[21px] sm:text-[28px] font-black tracking-[-0.045em] leading-tight text-white">
                    Same feature, different real-world moments.
                  </div>
                  <p className="mt-3 text-[12.8px] leading-relaxed text-white/56 font-medium">
                    A product like StayKnown becomes easier to understand when
                    visitors can imagine themselves using it. These examples
                    explain the feature without overpromising emergency
                    outcomes.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "A student going home late starts a Visit so trusted contacts know the session is active.",
                    "A user meeting someone new keeps LIVE active until the meeting is over.",
                    "A traveler on a long route uses Visit context to reduce uncertainty for family.",
                    "A Pro user escalates to SOS when the situation feels unsafe and needs urgent attention.",
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
                Terms of Service
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
