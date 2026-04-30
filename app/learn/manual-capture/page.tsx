"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Tier = "Starter" | "Pro" | "ProMax";

const seo = {
  title:
    "Manual Emergency Capture | StayKnown Extra Safety Location Updates During Visits",
  description:
    "Learn how StayKnown Manual Emergency Capture lets users send an extra safety location update during an active Visit without interrupting normal LIVE tracking.",
  url: "https://stay-known.com/learn/manual-capture",
  image: "https://stay-known.com/hero/manual-capture.png",
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
              MAX LIMIT
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

function ScenarioBox() {
  return (
    <PremiumPanel>
      <div className="p-5 sm:p-6">
        <SectionLabel>Scenario thinking</SectionLabel>

        <div className="mt-3 text-[19px] sm:text-[24px] font-black tracking-[-0.045em] leading-tight text-white">
          “I am not ready to trigger SOS, but I want my trusted people to get
          one more clear safety update right now.”
        </div>

        <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
          <p>
            That is where Manual Emergency Capture fits. It gives the user an
            intentional way to send an extra location and safety context update
            during an active Visit.
          </p>

          <p>
            It does not replace the normal Visit tracking rhythm. It works as an
            extra checkpoint when the user wants to refresh trusted contacts
            with the latest available context.
          </p>
        </div>
      </div>
    </PremiumPanel>
  );
}

export default function LearnManualCapturePage() {
  const [tier, setTier] = useState<Tier>("Starter");

  const tierCopy = useMemo(() => {
    return {
      Starter: [
        "Starter can use Manual Emergency Capture during an active Visit with a daily limit of 3 captures.",
        "Useful for simple check-ins when the user wants to send one extra location update without triggering SOS.",
        "Works best when device location is enabled and the app can obtain a reliable location fix.",
        "Starter keeps the flow simple so core safety remains accessible while higher safety capacity stays plan-aware.",
      ],
      Pro: [
        "Pro increases Manual Emergency Capture capacity to 6 captures per day.",
        "Better for users who move often, travel at night, meet new people, commute longer distances, or need more safety checkpoints.",
        "Pairs well with Pro SOS readiness, stronger Visit controls, and trusted contact notifications.",
        "Keeps the Visit active after capture so the user does not lose normal LIVE tracking.",
      ],
      ProMax: [
        "ProMax gives the highest Manual Emergency Capture capacity with 10 captures per day.",
        "Designed for users who want the most complete safety posture across Visits, LIVE sharing, SOS readiness, and premium controls.",
        "Best for high-frequency movement, professional routines, family safety coordination, or users who want stronger confidence during travel.",
        "Creates the most complete capture posture when combined with Safety Gallery, approved contacts, and device-level security.",
      ],
    } as Record<Tier, string[]>;
  }, []);

  const tierNote: Record<Tier, string> = useMemo(
    () => ({
      Starter:
        "Starter includes limited daily capture capacity. Upgrade inside the app when more emergency capture capacity is needed.",
      Pro: "Pro gives more room for repeated safety check-ins while preserving the difference between normal Visit updates and SOS escalation.",
      ProMax:
        "ProMax is the strongest plan for frequent manual safety updates and broader premium safety readiness.",
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
      "manual emergency capture",
      "safety location update",
      "mobile safety app",
      "live visit tracking",
      "emergency contact notification",
      "StayKnown Visit",
      "personal safety app",
      "location safety update",
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
              Learn • Manual Emergency Capture
            </div>
          </div>

          <div className="sm:hidden mt-3 flex items-center justify-between">
            <MobileNavLink href="/" label="Back to Home" />
            <MobileNavLink href="/learn/sos" label="Next: SOS" />
          </div>

          <div className="hidden sm:flex mt-5 items-center justify-center gap-3">
            <CTA href="/" label="Back to Home" />
            <CTA href="/learn/visit-live-sos" label="Visit + LIVE + SOS" />
            <CTA href="/learn/sos" label="Next: SOS Active" />
          </div>
        </div>
      </header>

      <section className="relative w-full lg:-mb-[360px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.065),transparent_58%)]" />

        <div className="mx-auto max-w-6xl px-4 pt-8 pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] items-start gap-8 lg:gap-8">
            <div className="order-1 lg:order-none lg:col-start-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[10.5px] font-black tracking-[0.20em] text-white/46 uppercase">
                Extra safety update during active Visits
              </div>

              <h1 className="mt-4 text-white/95 font-black tracking-[-0.06em] text-[38px] sm:text-[54px] lg:text-[60px] leading-[0.94]">
                Manual Emergency Capture
              </h1>

              <div className="mt-4 max-w-[76ch] space-y-3 text-white/62 font-medium text-[13px] sm:text-[14px] leading-relaxed">
                <p>
                  Manual Emergency Capture lets a StayKnown user send an extra
                  safety update while a Visit is already active. It is built for
                  moments where the user wants trusted contacts to receive fresh
                  location context without changing the normal Visit flow.
                </p>

                <p>
                  It is not the same as SOS. SOS is an urgent escalation state.
                  Manual Capture is a deliberate extra checkpoint that supports
                  safer movement, clearer contact awareness, and better
                  real-world context.
                </p>
              </div>

              <TintedCallout title="What Manual Capture is for">
                A user may be walking to a car, entering a new place, meeting
                someone, waiting outside, or feeling unsure. Manual Capture lets
                them send one more safety signal while the Visit continues.{" "}
                <em>
                  It supports safety communication, but it does not replace
                  emergency services.
                </em>
              </TintedCallout>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MiniStat
                  label="Trigger"
                  value="Tap"
                  detail="The user intentionally requests an extra capture."
                />
                <MiniStat
                  label="Context"
                  value="Active Visit"
                  detail="Capture works as part of the current safety session."
                />
                <MiniStat
                  label="Result"
                  value="Extra Update"
                  detail="Trusted contacts receive fresh safety context."
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
                    label="Visit + SOS"
                  />
                  <MobileNavLink href="/learn/sos" label="SOS" />
                </div>

                <div className="hidden sm:flex flex-wrap gap-3">
                  <CTA
                    href="/learn/visit-live-sos"
                    label="Learn: Visit + LIVE + SOS"
                  />
                  <CTA href="/learn/sos" label="Explore: SOS Active" />
                </div>
              </div>
            </div>

            <div className="order-2 lg:order-none lg:col-start-1 flex items-start justify-center lg:justify-start">
              <img
                src="/hero/manual-capture.png"
                alt="Manual Emergency Capture"
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
                <SectionLabel>Safety and product posture</SectionLabel>

                <div className="mt-3 text-[20px] sm:text-[25px] font-black tracking-[-0.045em] leading-tight text-white">
                  Manual Capture fills the gap between normal Visit updates and
                  full SOS escalation.
                </div>

                <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
                  <p>
                    Some moments are uncomfortable but not yet an emergency. The
                    user may still want trusted contacts to know exactly where
                    they are and that they requested a fresh update.
                  </p>

                  <p>
                    StayKnown can capture the latest available location, attach
                    readable context where available, and send it without ending
                    the Visit or interrupting the broader tracking rhythm.
                  </p>
                </div>
              </div>
            </PremiumPanel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <FeatureCard glyph="✔" title="How Manual Capture works">
              <div className="space-y-2">
                <div>
                  <span className="text-white/78 font-black">1)</span> The user
                  starts or continues an active Visit.
                </div>
                <div>
                  <span className="text-white/78 font-black">2)</span> The user
                  taps{" "}
                  <span className="text-white/84 font-black">
                    Manual Capture
                  </span>{" "}
                  when they want an extra safety update.
                </div>
                <div>
                  <span className="text-white/78 font-black">3)</span> StayKnown
                  captures the latest available location and session context.
                </div>
                <div>
                  <span className="text-white/78 font-black">4)</span> Trusted
                  contacts receive the extra update while normal Visit tracking
                  continues.
                </div>
              </div>
            </FeatureCard>

            <FeatureCard glyph="⌁" title="Why it is different from SOS">
              Manual Capture is a checkpoint. SOS is an emergency escalation
              posture. The distinction matters because users need a safety tool
              they can use before a situation becomes urgent.
              <div className="mt-3 text-white/45">
                This helps users communicate concern early without making every
                uncomfortable moment feel like a full emergency.
              </div>
            </FeatureCard>

            <FeatureCard glyph="▣" title="What contacts receive">
              A Manual Capture update can help trusted contacts understand:
              <div className="mt-3 space-y-2 text-white/62">
                <div>• the user is still inside an active Visit</div>
                <div>• the update was intentionally requested</div>
                <div>• the latest available location context</div>
                <div>• the timing of the extra safety signal</div>
              </div>
              <div className="mt-3 text-white/45">
                This improves clarity without making contacts guess whether the
                user is in SOS.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⟡" title="Location reliability matters">
              Manual Capture works best when location access is enabled, device
              sensors are available, and the app can obtain a reliable fix.
              StayKnown can explain failed captures with friendly safety-aware
              language instead of raw technical errors.
              <div className="mt-3 text-white/45">
                VPN restrictions and device location settings still matter
                because safety updates depend on trustworthy location context.
              </div>
            </FeatureCard>

            <FeatureCard glyph="!" title="When a user might tap it">
              Manual Capture is useful when a user:
              <div className="mt-3 space-y-2 text-white/62">
                <div>• arrives at a new place</div>
                <div>• enters a vehicle or leaves one</div>
                <div>• feels unsure but not ready to trigger SOS</div>
                <div>• wants contacts to receive a fresh checkpoint</div>
                <div>• needs to document a safety-relevant moment</div>
              </div>
            </FeatureCard>

            <FeatureCard glyph="◌" title="Daily plan limits">
              Manual Capture should stay plan-aware so the backend can control
              fair use and premium value:
              <div className="mt-3 space-y-2 text-white/62">
                <div>
                  • <span className="text-white/80 font-black">Starter:</span> 3
                  captures per day
                </div>
                <div>
                  • <span className="text-white/80 font-black">Pro:</span> 6
                  captures per day
                </div>
                <div>
                  • <span className="text-white/80 font-black">ProMax:</span> 10
                  captures per day
                </div>
              </div>
              <div className="mt-3 text-white/45">
                These limits keep the feature useful while preserving upgrade
                value for heavier safety routines.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⚖" title="Law-abiding explanation">
              Manual Capture is a user-directed safety action. It should not be
              used for stalking, coercion, harassment, unauthorized monitoring,
              or tracking another person without proper consent.
              <div className="mt-3 text-white/45">
                StayKnown safety tools should support lawful, consent-aware
                personal safety communication.
              </div>
            </FeatureCard>

            <FeatureCard glyph="✦" title="Why investors should care">
              Manual Capture adds retention value because it gives users a
              repeatable, everyday safety interaction — not only a rare SOS
              moment. It turns StayKnown into a daily safety companion rather
              than a single emergency button.
              <div className="mt-3 text-white/45">
                The feature also creates clear plan differentiation through
                daily capture capacity.
              </div>
            </FeatureCard>
          </div>

          <div className="mt-6">
            <PremiumPanel>
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <SectionLabel>Search discovery focus</SectionLabel>

                  <div className="mt-3 text-[21px] sm:text-[28px] font-black tracking-[-0.045em] leading-tight text-white">
                    This page is written for discovery around manual emergency
                    updates, safety location capture, and active Visit
                    check-ins.
                  </div>

                  <p className="mt-3 text-[12.8px] leading-relaxed text-white/56 font-medium">
                    Visitors and search engines need simple wording: Manual
                    Emergency Capture lets a user send an extra safety location
                    update during an active Visit without ending the Visit or
                    triggering SOS.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "A user taps Manual Capture while walking home so trusted contacts receive a fresh checkpoint.",
                    "A Pro user sends several extra updates during a longer trip without interrupting LIVE sharing.",
                    "A ProMax user combines frequent capture, trusted contacts, Safety Gallery, and SOS readiness.",
                    "A contact understands the difference between a manual checkpoint and a full SOS emergency.",
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
