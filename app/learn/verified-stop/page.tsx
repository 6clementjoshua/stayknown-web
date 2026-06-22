"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Tier = "Starter" | "Pro" | "ProMax";

const seo = {
  title: "Verified Stop | StayKnown Confirmed Safety Session End Controls",
  description:
    "Learn how StayKnown Verified Stop creates a clearer, safer finish layer for sensitive safety states like SOS and active Visits without repeating each detailed flow.",
  url: "https://stay-known.com/learn/verified-stop",
  image: "https://stay-known.com/hero/end-sos-verify.png",
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
              STRONGEST POSTURE
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

function CompareStopCard({
  image,
  label,
  title,
  body,
  href,
}: {
  image: string;
  label: string;
  title: string;
  body: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-black/25 p-4 shadow-[0_22px_70px_rgba(0,0,0,0.55)] transition hover:border-white/18 hover:bg-white/[0.055]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_12%,rgba(255,255,255,0.09),transparent_58%)]" />

      <div className="relative grid grid-cols-[94px_1fr] gap-4 items-center sm:grid-cols-[118px_1fr]">
        <div className="relative flex justify-center">
          <img
            src={image}
            alt={title}
            draggable={false}
            className="max-h-[175px] w-auto object-contain drop-shadow-[0_18px_50px_rgba(0,0,0,0.7)] transition duration-300 group-hover:scale-[1.02]"
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
          <div className="mt-3 text-[10px] font-black tracking-[0.2em] text-white/32 group-hover:text-white/58">
            OPEN DETAILS
          </div>
        </div>
      </div>
    </Link>
  );
}

function ScenarioBox() {
  return (
    <PremiumPanel>
      <div className="p-5 sm:p-6">
        <SectionLabel>Scenario thinking</SectionLabel>

        <div className="mt-3 text-[19px] sm:text-[24px] font-black tracking-[-0.045em] leading-tight text-white">
          “Starting a safety state is important. Ending it should also feel
          intentional, understood, and hard to do by mistake.”
        </div>

        <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
          <p>
            Verified Stop is the design principle behind protected endings. It
            does not belong to only one button. It is the idea that sensitive
            safety states should not disappear because of panic, pocket taps,
            casual phone handling, or unclear intent.
          </p>

          <p>
            This overview connects the two detailed stop flows without repeating
            them: ending an urgent SOS state and finishing an active Visit
            session.
          </p>
        </div>
      </div>
    </PremiumPanel>
  );
}

export default function LearnVerifiedStopPage() {
  const [tier, setTier] = useState<Tier>("Pro");

  const tierCopy = useMemo(() => {
    return {
      Starter: [
        "Starter users can understand the Verified Stop concept before upgrading to advanced protection flows.",
        "Basic Visit ending remains simple, while advanced protected-stop behavior is reserved for paid safety posture.",
        "Starter should still see clear education about lawful use, device security, and trusted-contact safety expectations.",
        "The goal is to make upgrade value understandable without confusing Starter users about active SOS access.",
      ],
      Pro: [
        "Pro can support stronger finish behavior around sensitive actions when the user enables the related security setting.",
        "Verified Stop helps the app treat safety endings as meaningful state changes, not casual UI exits.",
        "Useful for active safety sessions, urgent SOS states, night travel, rides, unfamiliar places, and higher-attention routines.",
        "Pro is the practical layer for users who want protected endings without needing every ProMax presentation feature.",
      ],
      ProMax: [
        "ProMax is the strongest posture for users who want safety sessions to start, run, escalate, and finish with maximum clarity.",
        "Best for repeated safety routines where accidental stops, unclear contact signals, or pressured endings are a serious concern.",
        "Pairs naturally with App Lock, Safety Gallery, trusted contacts, SOS readiness, premium shell behavior, and sensitive-action protection.",
        "ProMax should make verified endings feel serious, polished, and trustworthy without making the flow slow or confusing.",
      ],
    } as Record<Tier, string[]>;
  }, []);

  const tierNote: Record<Tier, string> = useMemo(
    () => ({
      Starter:
        "Starter can learn the model, but the strongest verified-stop behavior is part of the paid safety posture.",
      Pro: "Verification depends on available device authentication and the user’s enabled security settings.",
      ProMax:
        "Verified Stop reduces accidental endings, but it does not replace user judgment, emergency services, or lawful safety use.",
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
      "Verified Stop",
      "confirmed safety session ending",
      "biometric safety controls",
      "End SOS verification",
      "End Visit verification",
      "mobile safety app",
      "trusted contact safety",
      "device authentication safety",
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
              Learn • Verified Stop
            </div>
          </div>

          <div className="sm:hidden mt-3 flex items-center justify-between">
            <MobileNavLink href="/" label="Back to Home" />
            <MobileNavLink
              href="/learn/contact-approval"
              label="Next: Contacts"
            />
          </div>

          <div className="hidden sm:flex mt-5 items-center justify-center gap-3">
            <CTA href="/" label="Back to Home" />
            <CTA href="/learn/end-sos-verify" label="End SOS Details" />
            <CTA href="/learn/end-visit-verify" label="End Visit Details" />
          </div>
        </div>
      </header>

      <section className="relative w-full">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.065),transparent_58%)]" />

        <div className="mx-auto max-w-6xl px-4 pt-8 pb-0">
          <div className="mx-auto max-w-4xl">
            <div className="order-1 lg:order-none lg:col-start-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[10.5px] font-black tracking-[0.20em] text-white/46 uppercase">
                Confirmed endings for sensitive safety states
              </div>

              <h1 className="mt-4 text-white/95 font-black tracking-[-0.06em] text-[38px] sm:text-[54px] lg:text-[60px] leading-[0.94]">
                Verified Stop
              </h1>

              <div className="mt-4 max-w-[76ch] space-y-3 text-white/62 font-medium text-[13px] sm:text-[14px] leading-relaxed">
                <p>
                  Verified Stop is the safety principle that says ending an
                  active protection state should be clear, deliberate, and
                  harder to confuse with an accidental tap.
                </p>

                <p>
                  It sits above two detailed flows: End SOS verification for
                  urgent emergency posture, and End Visit verification for
                  active safety sessions. This page explains the shared logic
                  without repeating either full page.
                </p>
              </div>

              <TintedCallout title="The verified-stop promise">
                When a safety state ends, the app should help everyone
                understand that the finish action was intentional enough to
                trust.{" "}
                <em>
                  It is a protection layer, not a guarantee of safety or a
                  replacement for emergency services.
                </em>
              </TintedCallout>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MiniStat
                  label="Principle"
                  value="Intent"
                  detail="The stop action should feel deliberate."
                />
                <MiniStat
                  label="Scope"
                  value="Sensitive"
                  detail="Used around safety states that should not end casually."
                />
                <MiniStat
                  label="Signal"
                  value="Clear"
                  detail="Trusted recipients should understand the transition."
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
                  <MobileNavLink href="/learn/end-sos-verify" label="End SOS" />
                  <MobileNavLink
                    href="/learn/end-visit-verify"
                    label="End Visit"
                  />
                </div>

                <div className="hidden sm:flex flex-wrap gap-3">
                  <CTA
                    href="/learn/end-sos-verify"
                    label="Read: End SOS Verification"
                  />
                  <CTA
                    href="/learn/end-visit-verify"
                    label="Read: End Visit Verification"
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
            <ScenarioBox />

            <PremiumPanel>
              <div className="p-5 sm:p-6">
                <SectionLabel>Bridge logic</SectionLabel>

                <div className="mt-3 text-[20px] sm:text-[25px] font-black tracking-[-0.045em] leading-tight text-white">
                  The same idea applies to different safety states, but the
                  meaning changes by context.
                </div>

                <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
                  <p>
                    Ending SOS is about leaving the most urgent protection
                    posture. Ending a Visit is about finishing an active safety
                    session. They are not the same moment, so each deserves its
                    own detail page.
                  </p>

                  <p>
                    Verified Stop is the shared foundation: when the app is
                    protecting a sensitive state, stopping should be purposeful,
                    readable, and connected to the user’s security posture.
                  </p>
                </div>
              </div>
            </PremiumPanel>
          </div>

          <div className="mb-6 grid gap-5 lg:grid-cols-2">
            <CompareStopCard
              image="/hero/end-sos-verify.png"
              label="Urgent state"
              title="End SOS verification"
              body="For the highest-alert posture. The focus is preventing an urgent state from being dismissed casually or under unclear intent."
              href="/learn/end-sos-verify"
            />

            <CompareStopCard
              image="/hero/end-visit-verify.png"
              label="Active session"
              title="End Visit verification"
              body="For normal safety sharing. The focus is making sure an active Visit finishes because the user truly meant to end it."
              href="/learn/end-visit-verify"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <FeatureCard glyph="✔" title="What Verified Stop means">
              Verified Stop is not only a button style. It is a state-transition
              rule:
              <div className="mt-3 space-y-2 text-white/62">
                <div>• the current safety state is active</div>
                <div>• the user requests to stop it</div>
                <div>
                  • the app checks whether stronger confirmation applies
                </div>
                <div>• the finish state becomes easier to trust</div>
              </div>
            </FeatureCard>

            <FeatureCard glyph="⌁" title="What this page does not repeat">
              This page does not re-explain every End SOS or End Visit detail.
              Instead, it explains the shared design reason behind both flows:
              sensitive protection should not disappear casually.
              <div className="mt-3 text-white/45">
                Use the two linked pages for the deeper step-by-step behavior.
              </div>
            </FeatureCard>

            <FeatureCard glyph="▣" title="Why the transition matters">
              Safety products are judged by state clarity. Users and contacts
              need to know whether protection is active, ending, ended, failed,
              or waiting for confirmation.
              <div className="mt-3 text-white/45">
                Verified Stop helps make “ended” feel like a meaningful result,
                not an accidental disappearance.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⟡" title="Where device authentication fits">
              Biometric or device-level confirmation can act as the proof layer
              around selected stop actions. The exact behavior depends on device
              support, app settings, and the user’s enabled security posture.
              <div className="mt-3 text-white/45">
                Public copy should center on biometric/device-level verified
                stop, not public-facing passcode language.
              </div>
            </FeatureCard>

            <FeatureCard glyph="!" title="When friction is useful">
              Friction is bad when it slows ordinary use. It is useful when it
              protects a sensitive ending:
              <div className="mt-3 space-y-2 text-white/62">
                <div>• panic tapping</div>
                <div>• pocket or bag handling</div>
                <div>• someone else holding the phone</div>
                <div>• pressure to end protection too early</div>
              </div>
            </FeatureCard>

            <FeatureCard glyph="◌" title="Trusted contact interpretation">
              The recipient should not need to decode raw app behavior. If a
              safety state ends, the message and state label should make that
              transition understandable.
              <div className="mt-3 text-white/45">
                That is especially important during SOS, but it also matters for
                Visits watched by family, friends, or trusted contacts.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⚖" title="Law-abiding safety posture">
              Verified Stop supports user-directed safety. It does not authorize
              stalking, coercion, harassment, false alarms, unauthorized
              monitoring, or misuse of location sharing.
              <div className="mt-3 text-white/45">
                In immediate danger, users should contact local emergency
                services directly.
              </div>
            </FeatureCard>

            <FeatureCard glyph="✦" title="Investor value">
              Verified Stop proves the product thinks beyond activation. A
              serious safety platform must handle the full lifecycle: start,
              live state, escalation, trusted-recipient context, and protected
              finish.
              <div className="mt-3 text-white/45">
                That makes StayKnown feel more complete than a simple alert
                button or location-sharing screen.
              </div>
            </FeatureCard>
          </div>

          <div className="mt-6">
            <PremiumPanel>
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <SectionLabel>Search discovery focus</SectionLabel>

                  <div className="mt-3 text-[21px] sm:text-[28px] font-black tracking-[-0.045em] leading-tight text-white">
                    This page is written for discovery around verified stop,
                    protected safety endings, and biometric confirmation.
                  </div>

                  <p className="mt-3 text-[12.8px] leading-relaxed text-white/56 font-medium">
                    Visitors should understand the phrase quickly: Verified Stop
                    means sensitive safety states can require clearer intent
                    before they end. For deeper examples, the End SOS and End
                    Visit pages explain each flow separately.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      title: "SOS ends differently",
                      body: "Urgent safety posture deserves the strongest stop explanation.",
                      href: "/learn/end-sos-verify",
                    },
                    {
                      title: "Visits finish carefully",
                      body: "Active sharing should stop only when the user means to finish.",
                      href: "/learn/end-visit-verify",
                    },
                    {
                      title: "SOS state comes first",
                      body: "Understand what changes when SOS becomes active.",
                      href: "/learn/sos",
                    },
                    {
                      title: "Manual Capture is separate",
                      body: "A checkpoint is not the same as ending a safety state.",
                      href: "/learn/manual-capture",
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
