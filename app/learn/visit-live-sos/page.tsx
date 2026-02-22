"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Tier = "Starter" | "Pro" | "ProMax";

function Pill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "relative inline-flex items-center justify-center select-none overflow-hidden",
        "rounded-full border backdrop-blur-xl transition duration-200",
        "shadow-[0_18px_40px_rgba(0,0,0,0.55)]",
        "px-4 h-9 sm:h-10 text-[12px] sm:text-[13px] font-semibold",
        active
          ? "border-white/24 bg-white/[0.10] text-white"
          : "border-white/14 bg-white/[0.06] text-white/80 hover:text-white hover:bg-white/[0.09]",
      ].join(" ")}
    >
      {/* bevel highlight */}
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.20),transparent_58%)]" />
      {/* shimmer */}
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.18),transparent)] -translate-x-[120%] hover:translate-x-[120%] transition duration-700" />
      <span className="relative">{children}</span>
    </button>
  );
}

function LearnCTA({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="
        relative inline-flex items-center justify-center
        h-10 sm:h-11 px-5 rounded-full
        border border-white/14
        bg-white/[0.07]
        backdrop-blur-xl
        text-white/90 font-semibold text-[13px]
        shadow-[0_18px_40px_rgba(0,0,0,0.55)]
        transition duration-200
        hover:bg-white hover:text-black
        hover:border-white/25
        active:scale-[0.99]
        select-none overflow-hidden
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30
      "
    >
      {/* bevel highlight */}
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.20),transparent_58%)]" />
      {/* shimmer */}
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.18),transparent)] -translate-x-[120%] hover:translate-x-[120%] transition duration-700" />
      <span className="relative">{label}</span>
      <span className="relative ml-2 opacity-70">→</span>
      {/* tap flicker */}
      <span className="pointer-events-none absolute inset-0 opacity-0 active:opacity-100 transition duration-75 bg-black/[0.08]" />
    </Link>
  );
}

function FeatureCard({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        relative rounded-2xl border border-white/10
        bg-white/[0.05] backdrop-blur-xl
        shadow-[0_28px_80px_rgba(0,0,0,0.65)]
        p-5 sm:p-6
        overflow-hidden
      "
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.16),transparent_58%)]" />
      <div className="relative flex items-start gap-3">
        <div
          className="
            w-10 h-10 rounded-xl
            border border-white/12
            bg-white/[0.06]
            backdrop-blur-xl
            flex items-center justify-center
            text-[18px]
          "
          aria-hidden
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-white font-extrabold tracking-[-0.02em] text-[15px] sm:text-[16px]">
            {title}
          </div>
          <div className="mt-2 text-white/58 font-semibold leading-relaxed text-[13px]">
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
}: {
  tier: Tier;
  highlight?: boolean;
  bullets: string[];
}) {
  return (
    <div
      className={[
        "relative rounded-2xl border backdrop-blur-xl p-5 sm:p-6 overflow-hidden",
        "shadow-[0_24px_70px_rgba(0,0,0,0.6)]",
        highlight
          ? "border-white/18 bg-white/[0.07]"
          : "border-white/10 bg-white/[0.045]",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_14%,rgba(255,255,255,0.14),transparent_60%)]" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div className="text-white font-black tracking-[-0.03em] text-[16px] sm:text-[18px]">
            {tier}
          </div>
          {highlight && (
            <div className="text-[11px] font-extrabold tracking-[0.18em] text-white/70">
              RECOMMENDED
            </div>
          )}
        </div>
        <ul className="mt-4 space-y-2">
          {bullets.map((b, i) => (
            <li
              key={i}
              className="flex gap-2 text-white/60 font-semibold text-[13px] leading-relaxed"
            >
              <span className="mt-[2px] text-white/55">•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function LearnVisitLiveSosPage() {
  const [tier, setTier] = useState<Tier>("Starter");

  const tierCopy = useMemo(() => {
    // If you want exact entitlements, tell me and I’ll align wording.
    return {
      Starter: [
        "Start a Visit and share your live presence while the visit is active.",
        "SOS is available as an emergency escalation entry point.",
        "Designed to stay simple: fewer controls, focused safety basics.",
      ],
      Pro: [
        "More control over how your Visit runs (more clarity, more confidence).",
        "Richer notifications + stronger safety flow consistency during a Visit.",
        "A smoother premium feel across the experience.",
      ],
      ProMax: [
        "Fastest, most hardware-like access to safety actions.",
        "Full premium shell + advanced SOS readiness behavior and UI effects.",
        "Built for people who want maximum confidence + maximum control.",
      ],
    } as Record<Tier, string[]>;
  }, []);

  return (
    <main className="min-h-screen bg-black">
      {/* Top brand */}
      <header className="pt-7">
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <Image
              src="/6logo.png"
              alt="StayKnown"
              width={34}
              height={34}
              priority
            />
            <div className="flex flex-col leading-none">
              <div className="text-white font-extrabold tracking-[0.28em] text-[12px]">
                STAYKNOWN
              </div>
              <div className="mt-1 text-white/35 font-semibold text-[11px]">
                Learn • Live Visit + SOS
              </div>
            </div>
          </Link>

          <LearnCTA href="/" label="Back to Home" />
        </div>
      </header>

      {/* Hero */}
      <section className="relative w-full">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.07),transparent_58%)]" />
        <div className="mx-auto max-w-6xl px-4 pt-8 pb-6 sm:pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] items-center gap-10">
            {/* Caption */}
            <div className="order-1">
              <div className="text-white/95 font-black tracking-[-0.03em] text-[42px] sm:text-[56px] leading-[0.98]">
                Live Visit + SOS Ready
              </div>

              <div className="mt-4 text-white/58 font-semibold text-[13.5px] sm:text-[14.5px] leading-relaxed max-w-[68ch]">
                When a Visit starts, Live mode turns on — and SOS stays on standby
                so you can escalate in one tap if something feels wrong.
              </div>

              {/* Quick value bullets */}
              <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FeatureCard icon="🛰️" title="Live only during a Visit">
                  Live updates happen only while your Visit is active — stop the
                  Visit and sharing stops immediately.
                </FeatureCard>

                <FeatureCard icon="🛡️" title="SOS is one tap away">
                  If you need help fast, you can escalate instantly — without
                  searching menus.
                </FeatureCard>

                <FeatureCard icon="🔔" title="Clear alerts to your people">
                  The right people get the right message at the right time, so
                  they can act quickly.
                </FeatureCard>
              </div>

              {/* Tier toggle */}
              <div className="mt-8">
                <div className="text-white/50 font-semibold text-[12px] tracking-[0.22em]">
                  EXPERIENCE BY PLAN
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill active={tier === "Starter"} onClick={() => setTier("Starter")}>
                    Starter
                  </Pill>
                  <Pill active={tier === "Pro"} onClick={() => setTier("Pro")}>
                    Pro
                  </Pill>
                  <Pill active={tier === "ProMax"} onClick={() => setTier("ProMax")}>
                    ProMax
                  </Pill>
                </div>

                <div className="mt-4">
                  <TierBlock
                    tier={tier}
                    highlight={tier === "ProMax"}
                    bullets={tierCopy[tier]}
                  />
                </div>
              </div>
            </div>

            {/* Device */}
            <div className="order-2 flex items-center justify-center lg:justify-end">
              <div className="relative rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4 shadow-[0_30px_90px_rgba(0,0,0,0.7)]">
                <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.14),transparent_60%)]" />
                <img
                  src="/hero/visit-live-sos.png"
                  alt="Live Visit + SOS Ready"
                  className="
                    relative block object-contain select-none
                    max-w-[86vw] max-h-[46vh]
                    sm:max-w-[520px] sm:max-h-[62vh]
                    lg:max-w-[520px] lg:max-h-[62vh]
                    drop-shadow-[0_22px_80px_rgba(0,0,0,0.75)]
                  "
                  draggable={false}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed explanation */}
      <section className="w-full">
        <div className="mx-auto max-w-6xl px-4 pb-10 sm:pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <FeatureCard icon="▶️" title="How a Visit works (simple timeline)">
              <div className="mt-1 space-y-2">
                <div>
                  <span className="text-white/80">1)</span>{" "}
                  You tap <span className="text-white/85">Start Visit</span>.
                  Live mode activates automatically.
                </div>
                <div>
                  <span className="text-white/80">2)</span>{" "}
                  Your trusted people can receive updates while the Visit is
                  active.
                </div>
                <div>
                  <span className="text-white/80">3)</span>{" "}
                  You tap <span className="text-white/85">End Visit</span>.
                  Sharing stops immediately.
                </div>
              </div>
            </FeatureCard>

            <FeatureCard icon="🚨" title="When SOS applies">
              SOS is for moments when you feel unsafe or need urgent attention.
              It’s designed to be fast: one clear action that triggers a strong
              alert flow.
              <div className="mt-3 text-white/50">
                Example: “I’m being followed”, “I’m in trouble”, “I need someone
                to check on me now.”
              </div>
            </FeatureCard>

            <FeatureCard icon="🧭" title="What your contacts receive">
              Contacts can get a clear, readable message that includes context:
              who it’s from, what’s happening (Visit vs SOS), and what you want
              them to do next.
              <div className="mt-3 text-white/50">
                Example: “6 started a Visit — Live updates are active.” / “SOS
                triggered — please check immediately.”
              </div>
            </FeatureCard>

            <FeatureCard icon="🔒" title="Privacy & anti-stalking posture">
              Live sharing is scoped to your safety flow: it’s meant for trusted
              people and emergency use, not tracking. Visits end → sharing ends.
              This helps reduce misuse risk and keeps the product trustworthy.
            </FeatureCard>
          </div>

          {/* CTA row */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <LearnCTA href="/learn/visit-live" label="Next: Live Location Emitter" />
            <LearnCTA href="/learn/promax-shell" label="Explore: ProMax MainShell" />
          </div>
        </div>
      </section>

      {/* Footer line */}
      <footer className="w-full">
        <div className="mx-auto max-w-6xl px-4 pb-10">
          <div className="h-px bg-white/[0.08]" />
          <div className="mt-6 text-center text-white/35 font-semibold text-[12px]">
            A 6 Clement Joshua service <span className="text-white/25">™</span>
          </div>
        </div>
      </footer>
    </main>
  );
}