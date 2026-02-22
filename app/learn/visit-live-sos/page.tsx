"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Tier = "Starter" | "Pro" | "ProMax";

/* -------------------------
   Small mobile nav link (NO pill feel)
-------------------------- */
function MobileNavLink({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="
        relative inline-flex items-center gap-2
        px-0 py-2
        text-[12px] font-semibold tracking-[-0.01em]
        text-white/70
        transition
        hover:text-white/90
        active:text-white
        select-none
      "
        >
            <span>{label}</span>
            <span className="opacity-60">›</span>

            {/* tap flicker only */}
            <span className="pointer-events-none absolute inset-0 opacity-0 active:opacity-100 transition duration-75 bg-white/[0.06]" />
        </Link>
    );
}

/* -------------------------
   Desktop CTA (smaller pill)
-------------------------- */
function CTA({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="
        relative hidden sm:inline-flex items-center justify-center
        h-9 md:h-10 px-4 md:px-5 rounded-full
        border border-white/14
        bg-white/[0.06]
        text-white
        font-semibold text-[12px] md:text-[13px] tracking-[-0.01em]
        shadow-[0_16px_36px_rgba(0,0,0,0.55)]
        transition-all duration-200
        hover:bg-white hover:border-white/25 hover:!text-black
        active:bg-black active:border-white/20 active:!text-white active:scale-[0.99]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30
        select-none overflow-hidden
      "
        >
            {/* micro shimmer */}
            <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.14),transparent)] -translate-x-[120%] hover:translate-x-[120%] transition duration-700" />
            <span className="relative">{label}</span>
            <span className="relative ml-2 opacity-70">→</span>
        </Link>
    );
}

/* -------------------------
   Monochrome icon chip
-------------------------- */
function MonoIcon({ glyph }: { glyph: string }) {
    return (
        <div
            className="
        w-10 h-10 rounded-xl
        border border-white/12
        bg-white/[0.04]
        backdrop-blur-md
        flex items-center justify-center
        text-white/90
        text-[16px]
        leading-none
      "
            aria-hidden
        >
            {glyph}
        </div>
    );
}

/* -------------------------
   Plan tabs:
   - Mobile: text tabs (no pill feel)
   - Desktop: pills
-------------------------- */
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
                    "relative px-0 py-2 text-[12px] font-semibold tracking-[-0.01em] transition select-none",
                    active ? "text-white" : "text-white/55 hover:text-white/80",
                ].join(" ")}
            >
                {t}
                <span
                    className={[
                        "pointer-events-none absolute left-0 -bottom-[2px] h-[2px] rounded-full transition",
                        active ? "w-full bg-white/60" : "w-0 bg-white/0",
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
                    "relative inline-flex items-center justify-center select-none",
                    "rounded-full border transition-all duration-200",
                    "px-3.5 md:px-4 h-8 md:h-9 text-[12px] md:text-[13px]",
                    active
                        ? "border-white/24 bg-white/[0.10] text-white"
                        : "border-white/14 bg-white/[0.05] text-white/80 hover:text-white hover:bg-white/[0.08]",
                ].join(" ")}
            >
                <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.18),transparent_55%)]" />
                <span className="relative font-semibold tracking-[-0.01em]">{t}</span>
            </button>
        );
    };

    return (
        <>
            {/* Mobile tabs */}
            <div className="sm:hidden flex items-center justify-center gap-5">
                <Tab t="Starter" />
                <Tab t="Pro" />
                <Tab t="ProMax" />
            </div>

            {/* Desktop pills */}
            <div className="hidden sm:flex flex-wrap gap-2">
                <Pill t="Starter" />
                <Pill t="Pro" />
                <Pill t="ProMax" />
            </div>
        </>
    );
}

/* -------------------------
   Feature Card
-------------------------- */
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
        group relative rounded-2xl
        border border-white/10
        bg-white/[0.035]
        shadow-[0_26px_80px_rgba(0,0,0,0.62)]
        p-5 sm:p-6
        transition-all duration-200
        hover:scale-[1.01]
        hover:border-white/16
      "
        >
            <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-200 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.12),transparent_60%)]" />
            <div className="relative flex items-start gap-3">
                <MonoIcon glyph={glyph} />
                <div className="min-w-0">
                    <div className="text-white/95 font-semibold tracking-[-0.02em] text-[15px] sm:text-[16px]">
                        {title}
                    </div>
                    <div className="mt-2 text-white/62 font-normal leading-relaxed text-[13px]">
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
                "relative rounded-2xl border p-5 sm:p-6",
                "bg-white/[0.03] shadow-[0_22px_70px_rgba(0,0,0,0.6)]",
                highlight ? "border-white/18" : "border-white/10",
            ].join(" ")}
        >
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_22%_14%,rgba(255,255,255,0.10),transparent_62%)]" />
            <div className="relative">
                <div className="flex items-center justify-between gap-3">
                    <div className="text-white/95 font-semibold tracking-[-0.02em] text-[15px] sm:text-[16px]">
                        {tier}
                    </div>
                    {highlight && (
                        <div className="text-[11px] font-semibold tracking-[0.18em] text-white/60">
                            PRO MAX
                        </div>
                    )}
                </div>
                <ul className="mt-4 space-y-2">
                    {bullets.map((b, i) => (
                        <li key={i} className="flex gap-2 text-white/62 font-normal text-[13px] leading-relaxed">
                            <span className="mt-[2px] text-white/40">•</span>
                            <span>{b}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

/* -------------------------
   Page
-------------------------- */
export default function LearnVisitLiveSosPage() {
    const [tier, setTier] = useState<Tier>("Starter");

    const tierCopy = useMemo(() => {
        return {
            Starter: [
                "Start a Visit with live sharing only while the Visit is active.",
                "Simple flow with core safety signals and clean messaging.",
                "SOS is locked on Starter (upgrade required).",
            ],
            Pro: [
                "Live Visit + SOS access for emergency escalation during unsafe moments.",
                "Richer alerts and a more premium, consistent safety experience.",
                "Better support for frequent users who rely on Visits daily.",
            ],
            ProMax: [
                "Fastest access and strongest “always-ready” safety posture.",
                "Premium shell behaviors + SOS access for rapid escalation.",
                "Built for maximum confidence + maximum control.",
            ],
        } as Record<Tier, string[]>;
    }, []);

    return (
        <main className="min-h-screen bg-black">
            {/* centered brand header */}
            <header className="pt-7">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="flex flex-col items-center gap-2">
                        <Image src="/6logo.png" alt="StayKnown" width={34} height={34} priority />
                        <div className="text-white font-semibold tracking-[0.28em] text-[12px]">
                            STAYKNOWN
                        </div>
                        <div className="text-white/40 font-medium text-[11px]">
                            Learn • Live Visit + SOS
                        </div>
                    </div>

                    {/* Mobile header nav (small, no pill) */}
                    <div className="sm:hidden mt-3 flex items-center justify-between">
                        <MobileNavLink href="/" label="Back to Home" />
                        <MobileNavLink href="/learn/visit-live" label="Next: Live Emitter" />
                    </div>

                    {/* Desktop header nav (smaller pills) */}
                    <div className="hidden sm:flex mt-5 items-center justify-center gap-3">
                        <CTA href="/" label="Back to Home" />
                        <CTA href="/learn/visit-live" label="Next: Live Emitter" />
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="relative w-full">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.06),transparent_58%)]" />

                <div className="mx-auto max-w-6xl px-4 pt-8 pb-8 sm:pb-10">
                    {/* Grid that allows: caption -> device -> plan -> links on mobile */}
                    <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] items-start gap-8 lg:gap-10">
                        {/* Caption (mobile row 1, desktop right) */}
                        <div className="lg:col-start-2 lg:row-start-1">
                            <div className="text-white/95 font-semibold tracking-[-0.03em] text-[40px] sm:text-[54px] lg:text-[58px] leading-[0.98]">
                                Live Visit + SOS Ready
                            </div>

                            <div className="mt-4 text-white/62 font-normal text-[13.5px] sm:text-[14.5px] leading-relaxed max-w-[70ch]">
                                When a Visit starts, Live mode turns on — and SOS stays on standby for Pro and ProMax,
                                so you can escalate in one tap if something feels wrong.
                            </div>
                        </div>

                        {/* Device (mobile row 2, desktop left) */}
                        <div className="lg:col-start-1 lg:row-start-1 flex items-start justify-center lg:justify-start lg:pt-[6px]">
                            <img
                                src="/hero/visit-live-sos.png"
                                alt="Live Visit + SOS Ready"
                                draggable={false}
                                className="
                  block object-contain select-none
                  drop-shadow-[0_22px_80px_rgba(0,0,0,0.75)]
                  max-w-[86vw] max-h-[44vh]
                  sm:max-w-[560px] sm:max-h-[62vh]
                  lg:max-w-[760px] lg:max-h-[74vh]
                  xl:max-w-[820px]
                "
                            />
                        </div>

                        {/* Plan block (mobile row 3, desktop right row 2) */}
                        <div className="lg:col-start-2 lg:row-start-2">
                            <div className="text-white/45 font-medium text-[11px] tracking-[0.22em] text-center sm:text-left">
                                EXPERIENCE BY PLAN
                            </div>

                            <div className="mt-3">
                                <PlanTabs tier={tier} setTier={setTier} />
                            </div>

                            <div className="mt-4">
                                <TierBlock tier={tier} highlight={tier === "ProMax"} bullets={tierCopy[tier]} />
                            </div>
                        </div>

                        {/* Learn/Explore links (mobile row 4 one-line, desktop right row 3) */}
                        <div className="lg:col-start-2 lg:row-start-3">
                            {/* Mobile: one line, spaced */}
                            <div className="sm:hidden flex items-center justify-between gap-3">
                                <MobileNavLink href="/learn/visit-live" label="Learn: Live Emitter" />
                                <MobileNavLink href="/learn/promax-shell" label="Explore: ProMax Shell" />
                            </div>

                            {/* Desktop: smaller pills, inline */}
                            <div className="hidden sm:flex flex-wrap gap-3">
                                <CTA href="/learn/visit-live" label="Learn: Live Location Emitter" />
                                <CTA href="/learn/promax-shell" label="Explore: ProMax MainShell" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Detail cards */}
            <section className="w-full">
                <div className="mx-auto max-w-6xl px-4 pb-10 sm:pb-14">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                        <FeatureCard glyph="▶" title="How a Visit works (simple timeline)">
                            <div className="space-y-2">
                                <div>
                                    <span className="text-white/75 font-medium">1)</span>{" "}
                                    Tap <span className="text-white/85 font-medium">Start Visit</span>. Live mode activates automatically.
                                </div>
                                <div>
                                    <span className="text-white/75 font-medium">2)</span>{" "}
                                    Your trusted people receive updates while the Visit is active.
                                </div>
                                <div>
                                    <span className="text-white/75 font-medium">3)</span>{" "}
                                    Tap <span className="text-white/85 font-medium">End Visit</span>. Sharing stops immediately.
                                </div>
                            </div>
                        </FeatureCard>

                        <FeatureCard glyph="!" title="When SOS applies (Pro / ProMax)">
                            SOS is for moments when you feel unsafe or need urgent attention. It’s designed to be fast:
                            one clear action that triggers a strong alert flow.
                            <div className="mt-3 text-white/45">
                                Example: “I’m being followed.” “I’m in trouble.” “Check on me now.”
                            </div>
                        </FeatureCard>

                        <FeatureCard glyph="▣" title="What your contacts receive">
                            Contacts get a readable message with context: who it’s from, what’s happening (Visit vs SOS),
                            and what you want them to do next.
                            <div className="mt-3 text-white/45">
                                Example: “Visit started — Live updates active.” / “SOS triggered — please act now.”
                            </div>
                        </FeatureCard>

                        <FeatureCard glyph="⌁" title="Privacy & anti-stalking posture">
                            Live sharing is scoped to safety: it’s meant for trusted people and emergency use — not tracking.
                            Visits end → sharing ends immediately to reduce misuse.
                        </FeatureCard>
                    </div>
                </div>
            </section>

            {/* Footer with full policies + trademark */}
            <footer className="w-full">
                <div className="mx-auto max-w-6xl px-4 pb-10">
                    <div className="h-px bg-white/[0.08]" />

                    <div className="mt-8 flex flex-col items-center gap-3 text-center">
                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] sm:text-[12px] font-semibold text-white/45 leading-relaxed">
                            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-white/75 transition">
                                Privacy Policy
                            </a>
                            <span className="text-white/18">•</span>
                            <a href="/terms" target="_blank" rel="noopener noreferrer" className="hover:text-white/75 transition">
                                Terms of Use
                            </a>
                            <span className="text-white/18">•</span>
                            <a href="/acceptable-use" target="_blank" rel="noopener noreferrer" className="hover:text-white/75 transition">
                                Acceptable Use
                            </a>
                            <span className="text-white/18">•</span>
                            <a href="/safety" target="_blank" rel="noopener noreferrer" className="hover:text-white/75 transition">
                                Safety &amp; Anti-Stalking
                            </a>
                            <span className="text-white/18">•</span>
                            <a href="/emergency" target="_blank" rel="noopener noreferrer" className="hover:text-white/75 transition">
                                Emergency Disclaimer
                            </a>
                            <span className="text-white/18">•</span>
                            <a href="/minors" target="_blank" rel="noopener noreferrer" className="hover:text-white/75 transition">
                                Child Safety &amp; Minor Use
                            </a>
                            <span className="text-white/18">•</span>
                            <a href="/abuse" target="_blank" rel="noopener noreferrer" className="hover:text-white/75 transition">
                                Abuse Reporting
                            </a>
                            <span className="text-white/18">•</span>
                            <a href="/retention" target="_blank" rel="noopener noreferrer" className="hover:text-white/75 transition">
                                Data Retention
                            </a>
                            <span className="text-white/18">•</span>
                            <a href="/law" target="_blank" rel="noopener noreferrer" className="hover:text-white/75 transition">
                                Law Enforcement
                            </a>
                            <span className="text-white/18">•</span>
                            <a href="/security" target="_blank" rel="noopener noreferrer" className="hover:text-white/75 transition">
                                Security Disclosure
                            </a>
                        </div>

                        <div className="text-[12px] font-semibold text-white/50">
                            A 6 Clement Joshua service
                            <span className="text-white/25 ml-1 align-super text-[10px]">™</span>
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