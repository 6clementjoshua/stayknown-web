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
      "
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
            <span className="relative font-semibold tracking-[-0.01em]">
                {children}
            </span>
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
        font-semibold text-[13px]
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
                <div>
                    <div className="text-white/95 font-semibold tracking-[-0.02em] text-[15px] sm:text-[16px]">
                        {title}
                    </div>
                    <div className="mt-2 text-white/62 font-normal text-[13px] leading-relaxed">
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
    bullets: string[];
    highlight?: boolean;
}) {
    return (
        <div
            className={[
                "relative rounded-2xl border p-5 sm:p-6",
                "bg-white/[0.03] shadow-[0_22px_70px_rgba(0,0,0,0.6)]",
                highlight ? "border-white/18" : "border-white/10",
            ].join(" ")}
        >
            <div className="relative">
                <div className="flex items-center justify-between">
                    <div className="text-white/95 font-semibold text-[15px]">
                        {tier}
                    </div>
                    {highlight && (
                        <div className="text-[11px] tracking-[0.18em] text-white/60">
                            PRO MAX
                        </div>
                    )}
                </div>

                <ul className="mt-4 space-y-2">
                    {bullets.map((b, i) => (
                        <li key={i} className="flex gap-2 text-white/62 text-[13px]">
                            <span className="text-white/40">•</span>
                            <span>{b}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default function LearnProMaxShellPage() {
    const [tier, setTier] = useState<Tier>("ProMax");

    const tierCopy = useMemo(() => {
        return {
            Starter: [
                "Standard navigation layout.",
                "Core Visit features only.",
                "No premium shell behaviors.",
            ],
            Pro: [
                "Enhanced safety UI polish.",
                "Access to SOS during Visits.",
                "Smoother overall safety flow.",
            ],
            ProMax: [
                "Premium MainShell navigation experience.",
                "Fastest access patterns to safety actions.",
                "Hardware-like feel with calm UI posture.",
            ],
        };
    }, []);

    return (
        <main className="min-h-screen bg-black">
            {/* Centered Brand */}
            <header className="pt-7">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="flex flex-col items-center gap-2">
                        <Image
                            src="/6logo.png"
                            alt="StayKnown"
                            width={34}
                            height={34}
                            priority
                        />
                        <div className="text-white font-semibold tracking-[0.28em] text-[12px]">
                            STAYKNOWN
                        </div>
                        <div className="text-white/40 text-[11px]">
                            Learn • ProMax MainShell
                        </div>
                    </div>

                    <div className="mt-5 flex flex-wrap justify-center gap-3">
                        <CTA href="/" label="Back to Home" />
                        <CTA href="/learn/visit-live" label="Previous: Live Emitter" />
                    </div>
                </div>
            </header>

            {/* HERO */}
            <section className="relative w-full">
                <div className="mx-auto max-w-6xl px-4 pt-8 pb-10">
                    <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] items-start gap-10">
                        {/* Device LEFT */}
                        <div className="order-2 lg:order-1 flex items-start justify-center lg:justify-start lg:pt-[6px]">
                            <img
                                src="/hero/promax-shell.png"
                                alt="ProMax MainShell"
                                className="
                  block object-contain select-none
                  drop-shadow-[0_22px_80px_rgba(0,0,0,0.75)]
                  max-w-[86vw] max-h-[46vh]
                  sm:max-w-[560px] sm:max-h-[62vh]
                  lg:max-w-[780px] lg:max-h-[74vh]
                  xl:max-w-[860px]
                "
                                draggable={false}
                            />
                        </div>

                        {/* Caption RIGHT */}
                        <div className="order-1 lg:order-2">
                            <div className="text-white/95 font-semibold tracking-[-0.03em] text-[42px] sm:text-[56px] leading-[0.98]">
                                ProMax MainShell
                            </div>

                            <div className="mt-4 text-white/62 text-[14px] leading-relaxed max-w-[70ch]">
                                A calmer, more intentional navigation shell designed to feel
                                like hardware — keeping safety one tap away while reducing visual noise.
                            </div>

                            {/* Plan Toggle */}
                            <div className="mt-8">
                                <div className="text-white/45 text-[11px] tracking-[0.22em]">
                                    EXPERIENCE BY PLAN
                                </div>

                                <div className="mt-3 flex gap-2 flex-wrap">
                                    <Pill active={tier === "Starter"} onClick={() => setTier("Starter")}>Starter</Pill>
                                    <Pill active={tier === "Pro"} onClick={() => setTier("Pro")}>Pro</Pill>
                                    <Pill active={tier === "ProMax"} onClick={() => setTier("ProMax")}>ProMax</Pill>
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
                    </div>
                </div>
            </section>

            {/* DETAILS */}
            <section className="w-full">
                <div className="mx-auto max-w-6xl px-4 pb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <FeatureCard glyph="◧" title="Calm Navigation">
                            Reduces clutter. Prioritizes clarity. Keeps core safety
                            actions visually anchored and easy to access.
                        </FeatureCard>

                        <FeatureCard glyph="⌁" title="Hardware Feel">
                            Subtle motion and spacing create a stable interface
                            that feels engineered — not chaotic.
                        </FeatureCard>

                        <FeatureCard glyph="!" title="Safety First">
                            Even in premium mode, safety actions remain immediate.
                            No hiding critical controls behind visual effects.
                        </FeatureCard>

                        <FeatureCard glyph="▣" title="Why It Matters">
                            In stressful moments, cognitive load matters.
                            ProMax is designed to reduce friction and improve reaction speed.
                        </FeatureCard>
                    </div>
                </div>
            </section>

            {/* Footer with policies */}
            <footer className="w-full">
                <div className="mx-auto max-w-6xl px-4 pb-10">
                    <div className="h-px bg-white/[0.08]" />

                    <div className="mt-8 flex flex-col items-center gap-3 text-center">
                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] sm:text-[12px] font-semibold text-white/45">
                            <a href="/privacy" className="hover:text-white/75 transition">Privacy Policy</a>
                            <span>•</span>
                            <a href="/terms" className="hover:text-white/75 transition">Terms of Use</a>
                            <span>•</span>
                            <a href="/acceptable-use" className="hover:text-white/75 transition">Acceptable Use</a>
                            <span>•</span>
                            <a href="/safety" className="hover:text-white/75 transition">Safety & Anti-Stalking</a>
                            <span>•</span>
                            <a href="/emergency" className="hover:text-white/75 transition">Emergency Disclaimer</a>
                        </div>

                        <div className="text-[12px] text-white/50 font-semibold">
                            A 6 Clement Joshua service <span className="text-white/25">™</span>
                        </div>

                        <div className="text-[11px] text-white/30 font-semibold">
                            {new Date().getFullYear()} • stay-known.com
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}