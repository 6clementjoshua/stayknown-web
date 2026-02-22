"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Tier = "Starter" | "Pro" | "ProMax";

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
                "relative inline-flex items-center justify-center select-none",
                "rounded-full border transition-all duration-200",
                "px-4 h-9 sm:h-10 text-[12px] sm:text-[13px]",
                active
                    ? "border-white/24 bg-white/[0.10] text-white"
                    : "border-white/14 bg-white/[0.05] text-white/80 hover:text-white hover:bg-white/[0.08]",
            ].join(" ")}
        >
            <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.18),transparent_55%)]" />
            <span className="relative font-semibold tracking-[-0.01em]">{children}</span>
        </button>
    );
}

function CTA({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="
        relative inline-flex items-center justify-center
        h-10 sm:h-11 px-5 rounded-full
        border border-white/14
        bg-white/[0.07]
        text-white
        font-semibold text-[13px] tracking-[-0.01em]
        shadow-[0_18px_40px_rgba(0,0,0,0.55)]
        transition-all duration-200
        hover:bg-white hover:border-white/25 hover:!text-black
        active:bg-black active:border-white/20 active:!text-white active:scale-[0.99]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30
        select-none overflow-hidden
      "
        >
            <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.14),transparent)] -translate-x-[120%] hover:translate-x-[120%] transition duration-700" />
            <span className="relative">{label}</span>
            <span className="relative ml-2 opacity-70">→</span>
            <span className="pointer-events-none absolute inset-0 opacity-0 active:opacity-100 transition duration-75 bg-white/[0.06]" />
        </Link>
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

export default function LearnVisitLivePage() {
    const [tier, setTier] = useState<Tier>("Starter");

    const tierCopy = useMemo(() => {
        return {
            Starter: [
                "Use Live Location Emitter during an active Visit only.",
                "Stops sharing instantly when the Visit ends.",
                "No SOS access on Starter (upgrade required).",
            ],
            Pro: [
                "Live Visit + advanced safety flow, including SOS access.",
                "Stronger clarity across alerts and safety messaging.",
                "Better control for people who use Visits frequently.",
            ],
            ProMax: [
                "Most premium control and confidence across Live + SOS.",
                "Fastest access patterns and strongest safety posture.",
                "Built for users who want maximum reliability + polish.",
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
                        <div className="text-white font-semibold tracking-[0.28em] text-[12px]">STAYKNOWN</div>
                        <div className="text-white/40 font-medium text-[11px]">Learn • Live Location Emitter</div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                        <CTA href="/" label="Back to Home" />
                        <CTA href="/learn/visit-live-sos" label="Previous: Live + SOS" />
                        <CTA href="/learn/promax-shell" label="Next: ProMax MainShell" />
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="relative w-full">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.06),transparent_58%)]" />

                <div className="mx-auto max-w-6xl px-4 pt-8 pb-8 sm:pb-10">
                    {/* ✅ Device aligns with caption start line (items-start + small top pad) */}
                    <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] items-start gap-10">
                        {/* Device LEFT — no background container */}
                        <div className="order-2 lg:order-1 flex items-start justify-center lg:justify-start lg:pt-[6px]">
                            <img
                                src="/hero/visit-live.png"
                                alt="Live Location Emitter"
                                draggable={false}
                                className="
                  block object-contain select-none
                  drop-shadow-[0_22px_80px_rgba(0,0,0,0.75)]
                  max-w-[86vw] max-h-[46vh]
                  sm:max-w-[560px] sm:max-h-[62vh]
                  lg:max-w-[760px] lg:max-h-[74vh]
                  xl:max-w-[820px]
                "
                            />
                        </div>

                        {/* Caption RIGHT */}
                        <div className="order-1 lg:order-2">
                            <div className="text-white/95 font-semibold tracking-[-0.03em] text-[40px] sm:text-[54px] lg:text-[58px] leading-[0.98]">
                                Live Location Emitter
                            </div>

                            <div className="mt-4 text-white/62 font-normal text-[13.5px] sm:text-[14.5px] leading-relaxed max-w-[70ch]">
                                Live updates occur only during an active Visit. End the Visit and sharing stops immediately —
                                built to keep safety focused and reduce misuse.
                            </div>

                            <div className="mt-8">
                                <div className="text-white/45 font-medium text-[11px] tracking-[0.22em]">EXPERIENCE BY PLAN</div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <Pill active={tier === "Starter"} onClick={() => setTier("Starter")}>Starter</Pill>
                                    <Pill active={tier === "Pro"} onClick={() => setTier("Pro")}>Pro</Pill>
                                    <Pill active={tier === "ProMax"} onClick={() => setTier("ProMax")}>ProMax</Pill>
                                </div>

                                <div className="mt-4">
                                    <TierBlock tier={tier} highlight={tier === "ProMax"} bullets={tierCopy[tier]} />
                                </div>
                            </div>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <CTA href="/learn/visit-live-sos" label="Learn: Live + SOS" />
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
                        <FeatureCard glyph="▣" title="What the emitter does">
                            During a Visit, the app shares live presence updates so your trusted people can understand
                            your status. It’s designed to be simple: active Visit = sharing on, end Visit = sharing off.
                        </FeatureCard>

                        <FeatureCard glyph="⌁" title="Why it only runs during a Visit">
                            Always-on tracking can be abused. StayKnown keeps Live sharing scoped to a Visit so safety
                            is intentional, time-bounded, and easier to trust.
                        </FeatureCard>

                        <FeatureCard glyph="⟂" title="Real-world example">
                            You’re meeting someone for the first time. Start a Visit. Your chosen people can see updates
                            while you’re in that situation. When you’re safe, end the Visit — everything stops.
                        </FeatureCard>

                        <FeatureCard glyph="!" title="Where SOS fits">
                            SOS is an escalation action when things feel unsafe. On StayKnown it’s available to Pro and
                            ProMax. Starter users will see SOS as locked/upgrade.
                        </FeatureCard>
                    </div>
                </div>
            </section>

            {/* Footer with policies + trademark */}
            <footer className="w-full">
                <div className="mx-auto max-w-6xl px-4 pb-10">
                    <div className="h-px bg-white/[0.08]" />

                    <div className="mt-8 flex flex-col items-center gap-3 text-center">
                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] sm:text-[12px] font-semibold text-white/45 leading-relaxed">
                            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-white/75 transition">Privacy Policy</a>
                            <span className="text-white/18">•</span>
                            <a href="/terms" target="_blank" rel="noopener noreferrer" className="hover:text-white/75 transition">Terms of Use</a>
                            <span className="text-white/18">•</span>
                            <a href="/acceptable-use" target="_blank" rel="noopener noreferrer" className="hover:text-white/75 transition">Acceptable Use</a>
                            <span className="text-white/18">•</span>
                            <a href="/safety" target="_blank" rel="noopener noreferrer" className="hover:text-white/75 transition">Safety &amp; Anti-Stalking</a>
                            <span className="text-white/18">•</span>
                            <a href="/emergency" target="_blank" rel="noopener noreferrer" className="hover:text-white/75 transition">Emergency Disclaimer</a>
                            <span className="text-white/18">•</span>
                            <a href="/minors" target="_blank" rel="noopener noreferrer" className="hover:text-white/75 transition">Child Safety &amp; Minor Use</a>
                            <span className="text-white/18">•</span>
                            <a href="/abuse" target="_blank" rel="noopener noreferrer" className="hover:text-white/75 transition">Abuse Reporting</a>
                            <span className="text-white/18">•</span>
                            <a href="/retention" target="_blank" rel="noopener noreferrer" className="hover:text-white/75 transition">Data Retention</a>
                            <span className="text-white/18">•</span>
                            <a href="/law" target="_blank" rel="noopener noreferrer" className="hover:text-white/75 transition">Law Enforcement</a>
                            <span className="text-white/18">•</span>
                            <a href="/security" target="_blank" rel="noopener noreferrer" className="hover:text-white/75 transition">Security Disclosure</a>
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