"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Tier = "Starter" | "Pro" | "ProMax";

const seo = {
  title:
    "End SOS Verified Stop | StayKnown Biometric Emergency Safety Controls",
  description:
    "Learn how StayKnown can protect End SOS actions with biometric or device-level confirmation so urgent safety sessions are not stopped by accident or casual phone handling.",
  url: "https://stay-known.com/learn/end-sos-verify",
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
          “If SOS is active, I do not want it to stop because of panic,
          pressure, or one wrong tap.”
        </div>
        <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
          <p>
            That is the purpose of Verified Stop. SOS is not a casual state. It
            is the urgent safety posture users rely on when they need trusted
            people to pay attention quickly.
          </p>
          <p>
            A biometric or device-level confirmation step can help make ending
            SOS more deliberate. It gives the user a stronger stop flow and
            helps trusted contacts understand that “SOS ended” happened after a
            real finish action, not a random tap.
          </p>
        </div>
      </div>
    </PremiumPanel>
  );
}

export default function LearnEndSosVerifyPage() {
  const [tier, setTier] = useState<Tier>("Starter");

  const tierCopy = useMemo(() => {
    return {
      Starter: [
        "Starter users can learn the SOS safety model, but SOS activation and management remain locked to paid plans.",
        "Starter remains focused on basic Visit safety, trusted contacts, and core setup flows.",
        "Basic device protection still depends on the user’s device settings, such as screen lock and biometrics.",
        "Upgrade inside the app for SOS features so plan status and entitlements stay verified across devices.",
      ],
      Pro: [
        "End SOS can require biometric or device-level verification when the user enables the related security setting.",
        "Adds a deliberate confirmation step before the app accepts an SOS stop action.",
        "Helps reduce accidental taps, casual phone handling, and unauthorized attempts to stop an active SOS.",
        "Recommended for users who rely on SOS standby, night travel, unfamiliar routes, or higher-risk routines.",
      ],
      ProMax: [
        "The strongest Verified Stop posture for urgent safety states and repeated high-stakes routines.",
        "Designed for the clearest, most deliberate SOS ending flow across the premium safety experience.",
        "Helps trusted recipients trust the transition from SOS Active to SOS Ended because the stop action was verified.",
        "Best combined with broader App Lock, biometric protection, and sensitive-action coverage inside the app.",
      ],
    } as Record<Tier, string[]>;
  }, []);

  const tierNote: Record<Tier, string> = useMemo(
    () => ({
      Starter:
        "SOS is a paid safety capability. Starter can learn the flow, but the active SOS feature remains gated.",
      Pro: "Verification is optional and depends on the user’s security configuration and available device authentication methods.",
      ProMax:
        "Verified Stop helps reduce accidental or pressured endings. Keep device authentication methods current and usable.",
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
      "End SOS verification",
      "SOS verified stop",
      "biometric emergency safety controls",
      "device authentication",
      "mobile safety app",
      "StayKnown SOS",
      "emergency safety app",
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
              Learn • End SOS Verified Stop
            </div>
          </div>

          <div className="sm:hidden mt-3 flex items-center justify-between">
            <MobileNavLink href="/" label="Back to Home" />
            <MobileNavLink
              href="/learn/end-visit-verify"
              label="Next: End Visit"
            />
          </div>

          <div className="hidden sm:flex mt-5 items-center justify-center gap-3">
            <CTA href="/" label="Back to Home" />
            <CTA
              href="/learn/end-visit-verify"
              label="Next: End Visit Verification"
            />
            <CTA
              href="/learn/secure-chat-passcode"
              label="Secure Chat Biometric"
            />
          </div>
        </div>
      </header>

      <section className="relative w-full">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.065),transparent_58%)]" />

        <div className="mx-auto max-w-6xl px-4 pt-8 pb-0">
          <div className="mx-auto max-w-4xl">
            <div className="order-1 lg:order-none lg:col-start-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[10.5px] font-black tracking-[0.20em] text-white/46 uppercase">
                Verified stop for urgent SOS
              </div>

              <h1 className="mt-4 text-white/95 font-black tracking-[-0.06em] text-[38px] sm:text-[54px] lg:text-[60px] leading-[0.94]">
                End SOS — Verified Stop
              </h1>

              <div className="mt-4 max-w-[76ch] space-y-3 text-white/62 font-medium text-[13px] sm:text-[14px] leading-relaxed">
                <p>
                  SOS is the urgent safety posture inside StayKnown. It should
                  not be ended casually, accidentally, or under pressure if the
                  user has enabled stronger protection.
                </p>
                <p>
                  Verified Stop adds a deliberate biometric or device-level
                  confirmation step before SOS can end, helping the user keep
                  control during high-stress moments.
                </p>
              </div>

              <TintedCallout title="What Verified Stop protects">
                In urgent moments, one wrong tap can matter. Verified Stop helps
                ensure the active SOS state is not casually dismissed.{" "}
                <em>
                  It is a safety control, not a replacement for emergency
                  services.
                </em>
              </TintedCallout>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MiniStat
                  label="Action"
                  value="End SOS"
                  detail="The user attempts to stop an urgent safety state."
                />
                <MiniStat
                  label="Protection"
                  value="Verified"
                  detail="Can require biometric or device-level confirmation."
                />
                <MiniStat
                  label="Signal"
                  value="SOS Ended"
                  detail="Trusted recipients get clearer state transition context."
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
                    href="/learn/end-visit-verify"
                    label="End Visit"
                  />
                  <MobileNavLink
                    href="/learn/secure-chat-passcode"
                    label="Secure Chat"
                  />
                </div>

                <div className="hidden sm:flex flex-wrap gap-3">
                  <CTA
                    href="/learn/end-visit-verify"
                    label="Learn: End Visit Verification"
                  />
                  <CTA
                    href="/learn/secure-chat-passcode"
                    label="Explore: Secure Chat Biometric"
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
                <SectionLabel>Safety and security posture</SectionLabel>
                <div className="mt-3 text-[20px] sm:text-[25px] font-black tracking-[-0.045em] leading-tight text-white">
                  Verified Stop protects the end of the most serious safety
                  state in the app.
                </div>
                <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
                  <p>
                    When SOS is active, trusted contacts may be watching for
                    updates, checking map context, or waiting for signs that the
                    user is safe. A careless stop could create confusion at the
                    worst time.
                  </p>
                  <p>
                    Verification adds friction at the right moment: before
                    ending an urgent state. It does not guarantee safety,
                    prevent every device compromise, or replace police,
                    ambulance, fire, or other emergency services.
                  </p>
                </div>
              </div>
            </PremiumPanel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <FeatureCard glyph="✔" title="How Verified Stop works">
              <div className="space-y-2">
                <div>
                  <span className="text-white/78 font-black">1)</span> The user
                  taps <span className="text-white/84 font-black">End SOS</span>
                  .
                </div>
                <div>
                  <span className="text-white/78 font-black">2)</span> If
                  verification is enabled, StayKnown requests biometric or
                  device-level confirmation.
                </div>
                <div>
                  <span className="text-white/78 font-black">3)</span> After
                  successful verification, SOS ends and the app can show the
                  ended state.
                </div>
              </div>
              <div className="mt-3 text-white/45">
                If verification is off, the flow can end more directly based on
                the user’s configured safety settings.
              </div>
            </FeatureCard>

            <FeatureCard
              glyph="⟡"
              title="Where verification settings come from"
            >
              Verified Stop can align with the same security posture used around
              other sensitive areas:
              <div className="mt-3 space-y-2 text-white/62">
                <div>
                  • <span className="text-white/80 font-black">App Lock:</span>{" "}
                  protect sensitive app areas and selected actions.
                </div>
                <div>
                  •{" "}
                  <span className="text-white/80 font-black">Biometrics:</span>{" "}
                  use available device authentication where supported.
                </div>
                <div>
                  •{" "}
                  <span className="text-white/80 font-black">Device auth:</span>{" "}
                  fallback behavior depends on phone settings and platform
                  support.
                </div>
              </div>
            </FeatureCard>

            <FeatureCard glyph="!" title="Why it matters in urgent moments">
              Panic, accidental taps, fast phone handling, and pressure from
              another person can all make stopping SOS risky. Verified Stop
              helps make the decision more deliberate.
              <div className="mt-3 text-white/45">
                It adds a “prove this is intentional” layer before the urgent
                safety state ends.
              </div>
            </FeatureCard>

            <FeatureCard glyph="▣" title="What trusted contacts can understand">
              Trusted recipients need clear state transitions:
              <div className="mt-3 text-white/62 space-y-2">
                <div>
                  •{" "}
                  <span className="text-white/80 font-black">SOS Active:</span>{" "}
                  urgent safety posture is running.
                </div>
                <div>
                  • <span className="text-white/80 font-black">SOS Ended:</span>{" "}
                  the stop action completed, including verification if enabled.
                </div>
              </div>
              <div className="mt-3 text-white/45">
                This helps reduce confusion and improves trust in the app’s
                safety signals.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⌁" title="Misuse resistance">
              Verified Stop helps reduce:
              <div className="mt-3 space-y-2 text-white/62">
                <div>• accidental SOS endings</div>
                <div>• casual phone handling during an urgent state</div>
                <div>• someone else attempting to stop the active SOS</div>
                <div>• unclear state transitions for trusted contacts</div>
              </div>
              <div className="mt-3 text-white/45">
                Combine with device lock and StayKnown security settings for the
                strongest posture.
              </div>
            </FeatureCard>

            <FeatureCard glyph="✦" title="Pro / ProMax gating">
              Verified Stop belongs to the SOS posture, so it is designed around
              Pro and ProMax safety readiness. Starter can still learn the flow
              and use basic Visit safety, but active SOS features remain gated.
              <div className="mt-3 text-white/45">
                Upgrades should happen inside the app so entitlements stay
                verified.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⚖" title="Law-abiding explanation">
              Verified Stop is a user protection layer. It does not authorize
              stalking, coercion, harassment, or misuse of location and contact
              features. It should support user-directed, consent-aware safety
              behavior.
              <div className="mt-3 text-white/45">
                In immediate danger, contact local emergency services.
              </div>
            </FeatureCard>

            <FeatureCard glyph="◌" title="Why investors should care">
              SOS Verified Stop shows that StayKnown thinks about the full
              safety lifecycle: readiness, activation, escalation, trusted
              recipient context, and verified ending.
              <div className="mt-3 text-white/45">
                That makes the product feel more complete, more premium, and
                more serious than a basic alert button.
              </div>
            </FeatureCard>
          </div>

          <div className="mt-6">
            <PremiumPanel>
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <SectionLabel>Search discovery focus</SectionLabel>
                  <div className="mt-3 text-[21px] sm:text-[28px] font-black tracking-[-0.045em] leading-tight text-white">
                    This page is written for discovery around SOS Verified Stop,
                    biometric emergency controls, and safety app protection.
                  </div>
                  <p className="mt-3 text-[12.8px] leading-relaxed text-white/56 font-medium">
                    Search engines and visitors need simple language. Verified
                    Stop means the app can ask for biometric or device-level
                    confirmation before ending an urgent SOS state, helping
                    users avoid accidental or pressured endings.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "A Pro user triggers SOS and later confirms with device authentication before ending it.",
                    "A trusted contact understands that SOS ended after the stop action was completed.",
                    "A user avoids ending SOS by mistake during panic or quick phone handling.",
                    "A ProMax user applies stronger protection across SOS, Visit, LIVE, and sensitive screens.",
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
