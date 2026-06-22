"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Tier = "Starter" | "Pro" | "ProMax";

const seo = {
  title: "VPN Safety Gate | StayKnown Location Reliability Protection",
  description:
    "Learn how StayKnown handles VPN detection to protect location reliability, active Visit tracking, SOS context, safety alerts, and trusted-contact confidence.",
  url: "https://stay-known.com/learn/vpn-safety",
  image: "https://stay-known.com/hero/vpn-safety-gate.png",
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
              STRICTEST POSTURE
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

function GateStep({
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
        <SectionLabel>Reliability assurance</SectionLabel>

        <div className="mt-3 text-[19px] sm:text-[24px] font-black tracking-[-0.045em] leading-tight text-white">
          “If my safety app is using location, I need the location signal to be
          as trustworthy as possible.”
        </div>

        <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
          <p>
            VPN Safety Gate protects the integrity of StayKnown’s safety flows.
            VPNs can interfere with location confidence, network trust signals,
            safety checks, and how contacts interpret location-based alerts.
          </p>

          <p>
            The goal is not to punish the user. The goal is to explain the risk,
            pause sensitive flows when needed, and resume cleanly once the VPN
            is turned off.
          </p>
        </div>
      </div>
    </PremiumPanel>
  );
}

export default function LearnVpnSafetyPage() {
  const [tier, setTier] = useState<Tier>("Starter");

  const tierCopy = useMemo(() => {
    return {
      Starter: [
        "Starter users can be blocked at app launch when VPN is detected so core location safety remains reliable.",
        "The app should explain the issue in friendly language and auto-refresh once VPN is turned off.",
        "Starter Visit and location flows depend on trustworthy device location, not masked or confusing network context.",
        "The gate should be direct without looking scary: turn VPN off, return to StayKnown, continue safely.",
      ],
      Pro: [
        "Pro adds higher sensitivity because SOS readiness and stronger safety communication depend on reliable context.",
        "If VPN appears during an active Visit, trusted contacts may need a warning that location reliability may be disrupted.",
        "The app-launch VPN block and mid-Visit VPN warning must remain separate so emails are not sent for ordinary launch blocking.",
        "Chat VPN gating should appear only when opening StayKnown Chat while VPN is active.",
      ],
      ProMax: [
        "ProMax should use the strictest, clearest VPN safety posture across Visits, SOS, chat, and sensitive safety states.",
        "Best for users who depend on consistent safety tracking, premium emergency readiness, and trusted-recipient confidence.",
        "The UX should auto-dismiss or recover immediately when VPN is disabled so users are not trapped in a stale warning.",
        "ProMax should feel firm, premium, and protective without turning the gate into a confusing technical screen.",
      ],
    } as Record<Tier, string[]>;
  }, []);

  const tierNote: Record<Tier, string> = useMemo(
    () => ({
      Starter:
        "VPN blocking exists to protect location reliability. It should use friendly language, not raw network error text.",
      Pro: "Mid-Visit VPN detection can notify contacts because an active safety session may be affected.",
      ProMax:
        "Keep VPN enforcement strict but smooth: once VPN is off, the modal should disappear or refresh immediately.",
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
      "VPN safety gate",
      "location reliability",
      "mobile safety app",
      "live location protection",
      "anti-abuse safety app",
      "StayKnown VPN policy",
      "SOS location reliability",
      "trusted contact alerts",
      "Visit safety tracking",
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
              Learn • VPN Safety Gate
            </div>
          </div>

          <div className="sm:hidden mt-3 flex items-center justify-between">
            <MobileNavLink href="/" label="Back to Home" />
            <MobileNavLink href="/learn/chat" label="Next: Chat" />
          </div>

          <div className="hidden sm:flex mt-5 items-center justify-center gap-3">
            <CTA href="/" label="Back to Home" />
            <CTA href="/learn/safety-gallery" label="Safety Gallery" />
            <CTA href="/learn/chat" label="Next: StayKnown Chat" />
          </div>
        </div>
      </header>

      <section className="relative w-full">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.065),transparent_58%)]" />

        <div className="mx-auto max-w-6xl px-4 pt-8 pb-0">
          <div className="mx-auto max-w-4xl">
            <div className="order-1 lg:order-none lg:col-start-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[10.5px] font-black tracking-[0.20em] text-white/46 uppercase">
                Protecting safety location reliability
              </div>

              <h1 className="mt-4 text-white/95 font-black tracking-[-0.06em] text-[38px] sm:text-[54px] lg:text-[60px] leading-[0.94]">
                VPN Safety Gate
              </h1>

              <div className="mt-4 max-w-[76ch] space-y-3 text-white/62 font-medium text-[13px] sm:text-[14px] leading-relaxed">
                <p>
                  StayKnown relies on location context during Visits, SOS,
                  manual captures, and safety communication. VPN usage can make
                  that context harder to trust, especially when safety decisions
                  depend on where the user appears to be.
                </p>

                <p>
                  VPN Safety Gate explains the risk, pauses or blocks sensitive
                  flows where appropriate, and lets the user continue once the
                  VPN is turned off and the app can refresh the safety state.
                </p>
              </div>

              <TintedCallout title="The VPN rule">
                StayKnown does not treat VPN usage as a normal background detail
                during safety flows.{" "}
                <em>
                  When location reliability matters, the app can require VPN to
                  be off before continuing.
                </em>
              </TintedCallout>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MiniStat
                  label="Gate"
                  value="VPN Off"
                  detail="Sensitive safety flows require clearer location trust."
                />
                <MiniStat
                  label="Visit"
                  value="Warn"
                  detail="Mid-Visit VPN use can disrupt live reliability."
                />
                <MiniStat
                  label="Recovery"
                  value="Auto"
                  detail="The warning should clear once VPN is disabled."
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
                    href="/learn/safety-gallery"
                    label="Safety Gallery"
                  />
                  <MobileNavLink href="/learn/chat" label="Chat" />
                </div>

                <div className="hidden sm:flex flex-wrap gap-3">
                  <CTA
                    href="/learn/safety-gallery"
                    label="Learn: Safety Gallery"
                  />
                  <CTA href="/learn/chat" label="Learn: StayKnown Chat" />
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
                <SectionLabel>Policy clarity</SectionLabel>

                <div className="mt-3 text-[20px] sm:text-[25px] font-black tracking-[-0.045em] leading-tight text-white">
                  The VPN policy has separate meanings depending on where the
                  user is in the app.
                </div>

                <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
                  <p>
                    App launch, active Visits, and Chat are not the same
                    context. A launch block should not behave like a mid-Visit
                    safety interruption, and the Chat VPN gate should only
                    appear when the user tries to enter Chat with VPN on.
                  </p>

                  <p>
                    Separating these cases prevents false alarm, keeps contact
                    messaging accurate, and makes the product feel more
                    deliberate.
                  </p>
                </div>
              </div>
            </PremiumPanel>
          </div>

          <div className="mb-6 grid gap-3 md:grid-cols-5">
            <GateStep
              n="1"
              title="VPN detected"
              body="The app detects VPN usage before or during a safety-relevant flow."
            />
            <GateStep
              n="2"
              title="Risk explained"
              body="StayKnown explains that location reliability may be reduced."
            />
            <GateStep
              n="3"
              title="Flow pauses"
              body="The affected flow is blocked, paused, or warned depending on context."
            />
            <GateStep
              n="4"
              title="User turns it off"
              body="The user disables VPN from the device or VPN app."
            />
            <GateStep
              n="5"
              title="State refreshes"
              body="The app detects recovery and lets the user continue safely."
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <FeatureCard glyph="▣" title="App-launch VPN block">
              If VPN is already on when the user opens StayKnown, the app can
              block access until VPN is off.
              <div className="mt-3 text-white/45">
                This should be a clean gate only. It should not send contact
                emails, trigger emergency copy, or pretend an active Visit was
                interrupted.
              </div>
            </FeatureCard>

            <FeatureCard glyph="!" title="Mid-Visit VPN interruption">
              If VPN turns on during an active Visit, the meaning changes.
              Trusted contacts may need to know that live location reliability
              may be disrupted.
              <div className="mt-3 text-white/45">
                This is the context where a safety email can make sense, because
                an active session was already running.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⌁" title="Chat VPN gate">
              StayKnown Chat can have its own VPN gate, but it should appear
              only when the user attempts to open Chat while VPN is active.
              <div className="mt-3 text-white/45">
                It should not appear at app launch, and it should not duplicate
                the main safety gate.
              </div>
            </FeatureCard>

            <FeatureCard glyph="✔" title="Auto-dismiss behavior">
              Once VPN is turned off, the warning should close or refresh
              immediately. The “I have turned it off” action is only a backup
              for slow device state updates.
              <div className="mt-3 text-white/45">
                This prevents users from feeling trapped after they already
                fixed the problem.
              </div>
            </FeatureCard>

            <FeatureCard glyph="◌" title="Location reliability">
              VPN detection matters because Visit, SOS, manual capture, and chat
              location context all depend on trustworthy device signals.
              <div className="mt-3 space-y-2 text-white/62">
                <div>• readable place labels</div>
                <div>• latest available location</div>
                <div>• trusted contact confidence</div>
                <div>• emergency state interpretation</div>
              </div>
            </FeatureCard>

            <FeatureCard glyph="⟡" title="Friendly safety language">
              VPN errors should not look like developer logs. The app should
              explain the issue like a safety assistant:
              <div className="mt-3 text-white/45">
                “Turn off VPN so StayKnown can keep your safety location more
                reliable.”
              </div>
            </FeatureCard>

            <FeatureCard glyph="⚖" title="Law-abiding safety posture">
              VPN Safety Gate supports reliable, consent-aware safety sharing.
              It does not authorize surveillance, stalking, coercion,
              harassment, or misuse of location features.
              <div className="mt-3 text-white/45">
                In immediate danger, users should contact local emergency
                services directly.
              </div>
            </FeatureCard>

            <FeatureCard glyph="✦" title="Investor value">
              VPN enforcement makes StayKnown feel more serious than ordinary
              location sharing. It shows the product thinks about signal
              quality, misuse risk, contact trust, and safety-state integrity.
              <div className="mt-3 text-white/45">
                Reliability policy is part of the premium safety infrastructure.
              </div>
            </FeatureCard>
          </div>

          <div className="mt-6">
            <PremiumPanel>
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <SectionLabel>Search discovery focus</SectionLabel>

                  <div className="mt-3 text-[21px] sm:text-[28px] font-black tracking-[-0.045em] leading-tight text-white">
                    This page is written for discovery around VPN blocking,
                    location reliability, and safety app trust.
                  </div>

                  <p className="mt-3 text-[12.8px] leading-relaxed text-white/56 font-medium">
                    Visitors should understand the rule quickly: StayKnown can
                    require VPN to be off when safety location reliability
                    matters. Different VPN states have different meanings at app
                    launch, during an active Visit, and when opening Chat.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      title: "Visit + LIVE + SOS",
                      body: "See why live safety context needs reliable signals.",
                      href: "/learn/visit-live-sos",
                    },
                    {
                      title: "Manual Capture",
                      body: "Extra safety updates still need trustworthy location.",
                      href: "/learn/manual-capture",
                    },
                    {
                      title: "StayKnown Chat",
                      body: "Chat can have its own VPN entry gate.",
                      href: "/learn/chat",
                    },
                    {
                      title: "Privacy & Anti-Abuse",
                      body: "Reliability and lawful use belong together.",
                      href: "/learn/privacy-anti-abuse",
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
