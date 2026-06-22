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
          “I started a Visit. I want someone I trust to understand that I am
          actively moving, not just guessing where I am.”
        </div>
        <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
          <p>
            That is the role of the Live Location Emitter. It turns an active
            Visit into a readable safety posture. The app is not trying to
            create silent, always-on surveillance. It is trying to make a
            user-started safety session easier for trusted people to follow.
          </p>
          <p>
            For visitors, this makes StayKnown easier to understand. For
            investors, it shows the platform is built around intentional safety
            sessions, not just location dots. For policy and law-enforcement
            readers, it clarifies that the product is scoped to user safety and
            anti-abuse boundaries.
          </p>
        </div>
      </div>
    </PremiumPanel>
  );
}

export default function LearnVisitLivePage() {
  const [tier, setTier] = useState<Tier>("Starter");

  const tierCopy = useMemo(() => {
    return {
      Starter: [
        "Live sharing is scoped to an active Visit. The user starts the Visit, the session becomes active, and LIVE context follows that session.",
        "When the Visit ends, the live-sharing posture ends too. This keeps the safety boundary clear.",
        "Trusted recipients can understand the session as a safety update, not a random or confusing location ping.",
        "Starter is best for everyday check-ins, basic movement safety, and users who want simple Visit-based sharing.",
      ],
      Pro: [
        "Pro adds SOS escalation on top of the Visit/LIVE flow, so the user can move from routine safety sharing to urgent attention when needed.",
        "Useful for users who frequently travel at night, meet new people, move through unfamiliar areas, or need stronger safety readiness.",
        "Recipients can better distinguish ordinary Visit context from urgent escalation.",
        "Pro is the practical upgrade for users who want more than basic check-ins while keeping the experience direct.",
      ],
      ProMax: [
        "ProMax provides the most complete StayKnown posture: premium UI, stronger readiness, full safety context, and higher-value experiences.",
        "Designed for users who want maximum clarity, faster safety habits, and a more polished safety layer.",
        "Works well for repeated high-stakes routines, frequent movement, public-facing work, travel, and unfamiliar meetings.",
        "ProMax keeps safety communication premium without making it confusing or overly technical.",
      ],
    } as Record<Tier, string[]>;
  }, []);

  const tierNote: Record<Tier, string> = useMemo(
    () => ({
      Starter:
        "Starter focuses on basic Visit-based safety sharing. SOS remains a Pro / ProMax capability.",
      Pro: "SOS should be used responsibly and only for genuine safety concerns. It does not replace emergency services.",
      ProMax:
        "ProMax is the most complete safety posture for users who want the highest level of clarity and polish.",
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
              Learn • Live Location Emitter
            </div>
          </div>

          <div className="sm:hidden mt-3 flex items-center justify-between">
            <MobileNavLink
              href="/learn/visit-live-sos"
              label="Previous: Live + SOS"
            />
            <MobileNavLink
              href="/learn/promax-shell"
              label="Next: ProMax Shell"
            />
          </div>

          <div className="hidden sm:flex mt-5 flex-wrap items-center justify-center gap-3">
            <CTA href="/" label="Back to Home" />
            <CTA href="/learn/visit-live-sos" label="Previous: Live + SOS" />
            <CTA href="/learn/promax-shell" label="Next: ProMax MainShell" />
          </div>
        </div>
      </header>

      <section className="relative w-full">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.065),transparent_58%)]" />

        <div className="mx-auto max-w-6xl px-4 pt-8 pb-0">
          <div className="mx-auto max-w-4xl">
            <div className="order-1 lg:order-none lg:col-start-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[10.5px] font-black tracking-[0.20em] text-white/46 uppercase">
                Visit-bound live context
              </div>

              <h1 className="mt-4 text-white/95 font-black tracking-[-0.06em] text-[38px] sm:text-[54px] lg:text-[60px] leading-[0.94]">
                Live Location Emitter
              </h1>

              <div className="mt-4 max-w-[76ch] space-y-3 text-white/62 font-medium text-[13px] sm:text-[14px] leading-relaxed">
                <p>
                  Live updates occur only during an active Visit. This matters
                  because safety sharing should be intentional, readable, and
                  time-bounded.
                </p>
                <p>
                  StayKnown’s Live Location Emitter is not built as a silent
                  always-on tracker. It is a safety layer that helps trusted
                  contacts understand an active Visit while the user is moving,
                  meeting, traveling, or checking in.
                </p>
              </div>

              <TintedCallout title="Why this design is intentional">
                StayKnown avoids passive, unlimited sharing by tying live
                updates to a Visit. That makes safety sharing{" "}
                <span className="text-white/78 font-black">explicit</span>,{" "}
                <span className="text-white/78 font-black">time-bounded</span>,
                and easier for recipients to interpret correctly.{" "}
                <em>It is safety-first — not passive tracking.</em>
              </TintedCallout>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MiniStat
                  label="LIVE"
                  value="Only in Visit"
                  detail="The live posture follows the active safety session."
                />
                <MiniStat
                  label="Boundary"
                  value="Ends with Visit"
                  detail="When the user ends the Visit, the live posture stops."
                />
                <MiniStat
                  label="Purpose"
                  value="Trusted context"
                  detail="Designed for safety communication, not public tracking."
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
                    href="/learn/visit-live-sos"
                    label="Learn: Live + SOS"
                  />
                  <MobileNavLink
                    href="/learn/promax-shell"
                    label="Explore: ProMax Shell"
                  />
                </div>

                <div className="hidden sm:flex flex-wrap gap-3">
                  <CTA href="/learn/visit-live-sos" label="Learn: Live + SOS" />
                  <CTA
                    href="/learn/promax-shell"
                    label="Explore: ProMax MainShell"
                  />
                </div>
              </div>
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
                <SectionLabel>Security and anti-abuse posture</SectionLabel>
                <div className="mt-3 text-[20px] sm:text-[25px] font-black tracking-[-0.045em] leading-tight text-white">
                  The emitter is scoped so safety sharing does not become
                  uncontrolled surveillance.
                </div>
                <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
                  <p>
                    A user starts a Visit. LIVE becomes active inside that
                    Visit. The session has a clear safety meaning. This is
                    easier to explain to recipients, easier to audit mentally,
                    and easier to distinguish from stalking behavior.
                  </p>
                  <p>
                    StayKnown should never be used to secretly track another
                    person. It should not be used for coercion, stalking,
                    harassment, or public exposure of someone’s safety status.
                    Users should contact local emergency services immediately in
                    life-threatening situations.
                  </p>
                </div>
              </div>
            </PremiumPanel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <FeatureCard glyph="▣" title="What the emitter does">
              During a Visit, StayKnown shares live safety context so trusted
              people can understand the user’s active session in a readable way.
              It is less about showing a dot and more about explaining the
              safety posture.
              <div className="mt-3 text-white/45">
                Example: <em>“Visit active — LIVE updates enabled.”</em>
              </div>
            </FeatureCard>

            <FeatureCard glyph="⌁" title="Why it only runs during a Visit">
              Always-on tracking can be misused. By scoping LIVE to an active
              Visit, StayKnown keeps sharing intentional, limited, and easier to
              trust.
              <div className="mt-3 text-white/45">
                <em>Start Visit</em> → LIVE context can begin.{" "}
                <em>End Visit</em> → active sharing stops.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⟂" title="Real-world examples">
              <div className="space-y-2">
                <div>
                  <span className="text-white/75 font-black">•</span> Late-night
                  travel: start a Visit so trusted people know your safety
                  session is active.
                </div>
                <div>
                  <span className="text-white/75 font-black">•</span> First-time
                  meetup: keep the Visit active until the meeting is over.
                </div>
                <div>
                  <span className="text-white/75 font-black">•</span> Long
                  route: recipients can understand updates as part of one safety
                  session.
                </div>
              </div>
            </FeatureCard>

            <FeatureCard glyph="!" title="Where SOS fits">
              SOS is the escalation layer for Pro and ProMax. LIVE is the active
              session context; SOS is the stronger urgent signal when normal
              safety sharing is no longer enough.
              <div className="mt-3 text-white/45">
                Starter keeps the basic Visit flow. Pro and ProMax add the
                stronger emergency posture.
              </div>
            </FeatureCard>

            <FeatureCard glyph="✦" title="Signals the UI makes obvious">
              StayKnown uses clear state signaling so users understand what is
              happening instantly:{" "}
              <span className="text-white/78 font-black">Idle</span>,{" "}
              <span className="text-white/78 font-black">LIVE</span>, and{" "}
              <span className="text-white/78 font-black">SOS</span>.
              <div className="mt-3 text-white/45">
                Visual Severity Mode can make these states more distinct
                visually without changing the underlying behavior.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⚖" title="Law-abiding explanation">
              The emitter should be understood as user-directed safety sharing.
              It should not be used to monitor someone secretly or to pressure
              another person. StayKnown’s policy links should remain visible so
              expectations are clear.
              <div className="mt-3 text-white/45">
                See <em>Safety &amp; Anti-Stalking</em>, <em>Acceptable Use</em>
                , and <em>Emergency Disclaimer</em>.
              </div>
            </FeatureCard>

            <FeatureCard glyph="◌" title="Why investors should care">
              The Live Location Emitter is a core platform primitive. It anchors
              Visit sessions, supports SOS escalation, strengthens safety email
              context, and connects naturally to chat, profile trust, and plan
              tiers.
              <div className="mt-3 text-white/45">
                This is the type of feature that can create repeat engagement
                while still staying aligned with safety boundaries.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⟡" title="What recipients need to understand">
              Recipients need simple language. They should know that a Visit is
              active, LIVE updates are tied to that Visit, and an ended Visit
              means the active safety session is no longer running.
              <div className="mt-3 text-white/45">
                Clear recipient communication reduces panic, confusion, and
                delayed response.
              </div>
            </FeatureCard>
          </div>

          <div className="mt-6">
            <PremiumPanel>
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <SectionLabel>Simple product language</SectionLabel>
                  <div className="mt-3 text-[21px] sm:text-[28px] font-black tracking-[-0.045em] leading-tight text-white">
                    The emitter answers one question: is this user currently in
                    an active safety session?
                  </div>
                  <p className="mt-3 text-[12.8px] leading-relaxed text-white/56 font-medium">
                    That is the language visitors understand. It avoids
                    overusing technical terms like “background location,” and
                    focuses on user intent: a Visit is active, LIVE context is
                    active, and trusted people can follow the safety posture.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "A user starts a Visit before leaving work late at night.",
                    "A family member checks the update and understands the Visit is still active.",
                    "A trusted contact sees the session as safety context, not a random location ping.",
                    "When the Visit ends, the user’s active LIVE posture ends with it.",
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
