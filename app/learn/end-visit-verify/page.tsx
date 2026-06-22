"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Tier = "Starter" | "Pro" | "ProMax";

const seo = {
  title: "End Visit Verification | StayKnown Biometric Safety Controls",
  description:
    "Learn how StayKnown can protect End Visit actions with biometric or device-level confirmation so active safety sessions are not stopped by mistake.",
  url: "https://stay-known.com/learn/end-visit-verify",
  image: "https://stay-known.com/hero/end-visit-verify.png",
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
          “I am safe now, but I do not want this Visit to end by accident before
          my trusted people know the session is finished.”
        </div>
        <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
          <p>
            That is the purpose of End Visit verification. A Visit is an active
            safety session. If a user is moving, meeting someone, riding at
            night, or passing through an unfamiliar place, ending that session
            should be intentional.
          </p>
          <p>
            Biometric or device-level confirmation can make the stop action feel
            more deliberate, especially when a phone is in a pocket, bag,
            vehicle, or crowded place where accidental taps can happen.
          </p>
        </div>
      </div>
    </PremiumPanel>
  );
}

export default function LearnEndVisitVerifyPage() {
  const [tier, setTier] = useState<Tier>("Starter");

  const tierCopy = useMemo(() => {
    return {
      Starter: [
        "End a Visit when the safety session is complete; active sharing should stop when the user intentionally finishes the Visit.",
        "Best for everyday check-ins, short routes, quick errands, and basic trusted-contact safety sharing.",
        "Basic device protection still depends on the user’s phone settings, such as screen lock or device biometrics.",
        "Stronger stop-control behavior belongs to paid safety plans where advanced protection rules can be applied.",
      ],
      Pro: [
        "Optional verification can protect End Visit actions when security settings are enabled.",
        "Adds a deliberate confirmation step so a Visit is less likely to end from an accidental tap or casual phone handling.",
        "Useful for crowded places, night travel, rides, checkpoints, unfamiliar locations, or other higher-attention routines.",
        "Pairs well with App Lock, biometrics, and protected-action settings when configured in the app.",
      ],
      ProMax: [
        "The most confident posture for ending safety sharing during sensitive or repeated routines.",
        "Designed for users who run Visits often and want stronger consistency around start, active, and finish states.",
        "Provides clearer control for premium safety workflows where active sharing should not stop casually.",
        "Best combined with broader app security coverage across Visit, LIVE, SOS, and sensitive screens.",
      ],
    } as Record<Tier, string[]>;
  }, []);

  const tierNote: Record<Tier, string> = useMemo(
    () => ({
      Starter:
        "Visits are designed for trusted sharing. Keep recipients limited to people you know and trust.",
      Pro: "If verification is enabled, keep your device authentication method updated so protected actions remain usable.",
      ProMax:
        "For the strongest posture, apply biometric/device confirmation to Visit stop actions and other sensitive safety controls.",
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
      "End Visit verification",
      "biometric safety controls",
      "live location safety app",
      "Visit sharing protection",
      "device authentication",
      "StayKnown safety app",
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
              Learn • End Visit Verification
            </div>
          </div>

          <div className="sm:hidden mt-3 flex items-center justify-between">
            <MobileNavLink href="/" label="Back to Home" />
            <MobileNavLink
              href="/learn/secure-chat-passcode"
              label="Next: Secure Chat"
            />
          </div>

          <div className="hidden sm:flex mt-5 items-center justify-center gap-3">
            <CTA href="/" label="Back to Home" />
            <CTA href="/learn/end-sos-verify" label="Previous: End SOS" />
            <CTA
              href="/learn/secure-chat-passcode"
              label="Next: Secure Chat Biometric"
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
                Verified finish for active Visits
              </div>

              <h1 className="mt-4 text-white/95 font-black tracking-[-0.06em] text-[38px] sm:text-[54px] lg:text-[60px] leading-[0.94]">
                End Visit — Confirmed Finish
              </h1>

              <div className="mt-4 max-w-[76ch] space-y-3 text-white/62 font-medium text-[13px] sm:text-[14px] leading-relaxed">
                <p>
                  A Visit is a safety session. It tells trusted people that the
                  user is actively sharing safety context while moving, meeting,
                  traveling, or checking in.
                </p>
                <p>
                  End Visit verification helps make the finish action
                  deliberate. When enabled, biometric or device-level
                  confirmation can reduce accidental endings and protect active
                  sharing from casual phone handling.
                </p>
              </div>

              <TintedCallout title="Designed for normal safety routines, not only emergencies">
                This is for everyday “stay with me while I move” sessions:
                rides, late-night trips, unfamiliar routes, crowded places,
                checkpoints, or moments where a user wants sharing to remain
                active until <em>they</em> confirm it is done.
              </TintedCallout>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MiniStat
                  label="Action"
                  value="End Visit"
                  detail="The user intentionally finishes an active safety session."
                />
                <MiniStat
                  label="Protection"
                  value="Biometric aware"
                  detail="Can require device-level confirmation when configured."
                />
                <MiniStat
                  label="Outcome"
                  value="Sharing stops"
                  detail="After a valid finish, active Visit sharing ends."
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
                    href="/learn/end-sos-verify"
                    label="Previous: End SOS"
                  />
                  <MobileNavLink
                    href="/learn/secure-chat-passcode"
                    label="Secure Chat"
                  />
                </div>

                <div className="hidden sm:flex flex-wrap gap-3">
                  <CTA href="/learn/end-sos-verify" label="Previous: End SOS" />
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
                  A protected finish helps keep safety sessions from ending
                  casually.
                </div>
                <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
                  <p>
                    A Visit may be active during movement, a ride, a meeting, a
                    route change, or a moment where trusted contacts are
                    watching for updates. If the phone is handled quickly, an
                    accidental stop can create confusion.
                  </p>
                  <p>
                    Verification does not replace judgment, emergency services,
                    or user responsibility. It is a protection layer around a
                    sensitive action: stopping an active safety session.
                  </p>
                </div>
              </div>
            </PremiumPanel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <FeatureCard glyph="▶" title="Simple flow">
              <div className="space-y-2">
                <div>
                  <span className="text-white/78 font-black">1)</span> The user
                  starts a Visit to share safety context while moving.
                </div>
                <div>
                  <span className="text-white/78 font-black">2)</span> The user
                  taps{" "}
                  <span className="text-white/84 font-black">End Visit</span>{" "}
                  when the session should finish.
                </div>
                <div>
                  <span className="text-white/78 font-black">3)</span> If
                  protection is enabled, the app requests biometric or device
                  confirmation.
                </div>
                <div>
                  <span className="text-white/78 font-black">4)</span> After
                  confirmation, the Visit ends and active sharing stops.
                </div>
              </div>
            </FeatureCard>

            <FeatureCard glyph="⌁" title="Why add confirmation for Visits?">
              Visits can happen during rides, crowds, checkpoints, errands,
              unfamiliar places, or late-night movement. A protected ending
              helps reduce accidental or casual stops.
              <div className="mt-3 space-y-2 text-white/62">
                <div>• accidental tap endings</div>
                <div>• phone-in-pocket mistakes</div>
                <div>• quick phone handling in a crowded place</div>
                <div>• confusion for trusted contacts watching the session</div>
              </div>
            </FeatureCard>

            <FeatureCard glyph="▣" title="What trusted contacts can understand">
              Recipients can treat the Visit as active until it has actually
              ended in-app. If verification is required, the end signal should
              only happen after the user completes that confirmation step.
              <div className="mt-3 text-white/45">
                This helps reduce unclear “did it end by mistake?” moments.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⟡" title="Works with security settings">
              This behavior can align with the app’s protection stack:
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
                  <span className="text-white/80 font-black">
                    PIN/device auth:
                  </span>{" "}
                  fallback depends on the device and app configuration.
                </div>
              </div>
            </FeatureCard>

            <FeatureCard glyph="✦" title="Recommended posture">
              <div className="space-y-2">
                <div>• Keep the device lock enabled.</div>
                <div>
                  • Enable biometric protection if the device supports it.
                </div>
                <div>
                  • Apply protection to Visit stop and other sensitive actions.
                </div>
                <div>
                  • Keep trusted contacts limited to people who should receive
                  safety context.
                </div>
              </div>
            </FeatureCard>

            <FeatureCard glyph="!" title="Keep it safety-first">
              Visits are intended for trusted sharing, not public tracking. End
              the session when safe, and do not use StayKnown to monitor someone
              secretly or pressure another person.
              <div className="mt-3 text-white/45">
                In immediate danger, contact local emergency services.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⚖" title="Law-abiding explanation">
              End Visit verification is a user protection layer. It does not
              authorize stalking, coercion, harassment, or misuse of location
              sharing. It should support consent-aware, user-directed safety
              sessions.
              <div className="mt-3 text-white/45">
                Policy pages should remain easy to find for safety, emergency,
                privacy, and abuse reporting expectations.
              </div>
            </FeatureCard>

            <FeatureCard glyph="◌" title="Why investors should care">
              Protected End Visit flows make safety sessions feel more complete.
              The app is not only starting safety states; it is also thinking
              carefully about how those states end.
              <div className="mt-3 text-white/45">
                That improves product trust, premium value, and retention for
                users who rely on repeated Visit routines.
              </div>
            </FeatureCard>
          </div>

          <div className="mt-6">
            <PremiumPanel>
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <SectionLabel>Search discovery focus</SectionLabel>
                  <div className="mt-3 text-[21px] sm:text-[28px] font-black tracking-[-0.045em] leading-tight text-white">
                    This page is written for discovery around biometric End
                    Visit confirmation, live location safety, and protected
                    safety sessions.
                  </div>
                  <p className="mt-3 text-[12.8px] leading-relaxed text-white/56 font-medium">
                    Search engines and visitors need simple wording. End Visit
                    verification means the user can finish active safety sharing
                    with more intent, especially when a phone could be tapped or
                    handled accidentally.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "A user ends a late-night Visit only after confirming with device authentication.",
                    "A trusted contact understands that active sharing stopped because the user completed the finish action.",
                    "A user avoids accidentally ending a Visit while moving through a crowded place.",
                    "A ProMax user applies stronger confirmation across sensitive safety controls.",
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
