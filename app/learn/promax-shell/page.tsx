"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Tier = "Starter" | "Pro" | "ProMax";

/* -------------------------
   Mobile nav link (NO pill feel)
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
            <span className="pointer-events-none absolute inset-0 opacity-0 active:opacity-100 transition duration-75 bg-white/[0.06]" />
        </Link>
    );
}

/* -------------------------
   Desktop CTA (smaller + white hover)
   FIX: force ALL inner text/icons to black on hover
-------------------------- */
function CTA({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="
        relative hidden sm:inline-flex items-center justify-center
        h-8 md:h-9 px-3.5 md:px-4 rounded-full
        border border-white/14
        bg-white/[0.06]
        text-white
        font-semibold text-[12px] md:text-[12.5px] tracking-[-0.01em]
        shadow-[0_16px_36px_rgba(0,0,0,0.55)]
        transition-all duration-200
        hover:bg-white hover:border-white/30 hover:text-black hover:[&_*]:text-black
        active:bg-black active:border-white/20 active:text-white active:[&_*]:text-white active:scale-[0.99]
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
   Plan tabs
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
                    active ? "text-white" : "text-white/55 hover:text-white/85",
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
                    "px-3 md:px-3.5 h-8 md:h-8.5 text-[12px] md:text-[12.5px]",
                    active
                        ? "border-white/28 bg-white/[0.10] text-white"
                        : "border-white/14 bg-white/[0.05] text-white/78 hover:bg-white hover:border-white/30 hover:text-black hover:[&_*]:text-black",
                ].join(" ")}
            >
                <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.18),transparent_55%)]" />
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
    note,
}: {
    tier: Tier;
    bullets: string[];
    highlight?: boolean;
    note?: string;
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
                        <li
                            key={i}
                            className="flex gap-2 text-white/62 font-normal text-[13px] leading-relaxed"
                        >
                            <span className="mt-[2px] text-white/40">•</span>
                            <span>{b}</span>
                        </li>
                    ))}
                </ul>

                {note ? (
                    <div className="mt-4 text-[12px] leading-relaxed text-white/46">
                        <span className="font-semibold text-white/60">Note:</span>{" "}
                        <em>{note}</em>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

/* -------------------------
   Tinted text callout
-------------------------- */
function TintedCallout({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="relative mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_18%_14%,rgba(255,255,255,0.08),transparent_60%)]" />
            <div className="relative">
                <div className="text-white/85 font-semibold tracking-[-0.02em] text-[13px] sm:text-[14px]">
                    {title}
                </div>
                <div className="mt-2 text-white/60 text-[12.5px] leading-relaxed">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function LearnProMaxShellPage() {
    const [tier, setTier] = useState<Tier>("ProMax");

    const tierCopy = useMemo(() => {
        return {
            Starter: [
                "Standard navigation layout with core Visit flow.",
                "Core safety states are visible, but premium shell behaviors are not enabled.",
                "The MainShell “+” (Safety Gallery entry) is not available on Starter.",
                "SOS remains locked (upgrade required inside the app).",
            ],
            Pro: [
                "Premium shell polish and calmer navigation posture.",
                "MainShell “+” opens Safety Gallery (required for certain SOS flows).",
                "SOS available for escalation (designed to be one-tap and obvious).",
                "More consistent safety messaging across key screens.",
            ],
            ProMax: [
                "Full ProMax MainShell navigation experience (most premium posture).",
                "Fastest access patterns to safety actions + the calmest UI behavior.",
                "MainShell “+” opens Safety Gallery with the strongest gating posture.",
                "Built for maximum confidence, maximum clarity, and maximum control.",
            ],
        } as Record<Tier, string[]>;
    }, []);

    const tierNote: Record<Tier, string> = useMemo(
        () => ({
            Starter:
                "Starter is intentionally limited: you can learn the flow, but premium safety capabilities are restricted to protect the safety model.",
            Pro:
                "Pro adds the practical safety upgrades: SOS escalation + Safety Gallery entry from the MainShell.",
            ProMax:
                "ProMax is the full premium shell posture: engineered feel, fastest access, and the strongest readiness design.",
        }),
        [],
    );

    return (
        <main className="min-h-screen bg-black">
            <header className="pt-7">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="flex flex-col items-center gap-2">
                        <Image src="/6logo.png" alt="StayKnown" width={34} height={34} priority />
                        <div className="text-white font-semibold tracking-[0.28em] text-[12px]">
                            STAYKNOWN
                        </div>
                        <div className="text-white/40 text-[11px]">Learn • ProMax MainShell</div>
                    </div>

                    <div className="sm:hidden mt-3 flex items-center justify-between">
                        <MobileNavLink href="/learn/visit-live" label="Previous: Live Emitter" />
                        <MobileNavLink href="/" label="Back to Home" />
                    </div>

                    <div className="hidden sm:flex mt-5 flex-wrap justify-center gap-3">
                        <CTA href="/" label="Back to Home" />
                        <CTA href="/learn/visit-live" label="Previous: Live Emitter" />
                    </div>
                </div>
            </header>

            {/* HERO */}
            <section className="relative w-full lg:-mb-[400px]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.06),transparent_58%)]" />

                <div className="mx-auto max-w-6xl px-4 pt-8 pb-0 sm:pb-0">
                    <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] items-start gap-8 lg:gap-10">
                        <div className="order-1 lg:order-none lg:col-start-2">
                            <div className="text-white/95 font-semibold tracking-[-0.03em] text-[42px] sm:text-[56px] leading-[0.98]">
                                ProMax MainShell
                            </div>

                            <div className="mt-4 text-white/62 text-[14px] leading-relaxed max-w-[72ch]">
                                A calmer, more intentional navigation shell designed to feel like hardware — keeping safety one tap away while reducing visual noise.
                            </div>

                            <TintedCallout title="What “MainShell” actually means">
                                MainShell is the core navigation layer you live in: the place where motion, spacing, and button placement are tuned for speed under stress.{" "}
                                <em>Less searching. Less cognitive load. Faster reactions.</em>
                            </TintedCallout>

                            <TintedCallout title="Important plan gate: the “+” button">
                                In the MainShell, the center “+” button is a direct entry into{" "}
                                <span className="text-white/78 font-medium">Safety Gallery</span> on{" "}
                                <span className="text-white/78 font-medium">Pro</span> and{" "}
                                <span className="text-white/78 font-medium">ProMax</span>.
                                <div className="mt-2 text-white/52 text-[12.5px] leading-relaxed">
                                    On <span className="text-white/75 font-medium">Starter</span>, that “+” action is <em>not available</em>. This protects the safety posture and keeps premium readiness features properly gated.
                                </div>
                            </TintedCallout>

                            <div className="mt-7">
                                <div className="text-white/45 text-[11px] tracking-[0.22em] text-center sm:text-left">
                                    EXPERIENCE BY PLAN
                                </div>

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
                        </div>

                        {/* Device — match your proven upward push */}
                        <div className="order-2 lg:order-none lg:col-start-1 flex items-start justify-center lg:justify-start">
                            <img
                                src="/hero/promax-shell.png"
                                alt="ProMax MainShell"
                                className="
                  block object-contain select-none
                  drop-shadow-[0_22px_80px_rgba(0,0,0,0.75)]
                  max-w-[86vw] max-h-[44vh]
                  sm:max-w-[560px] sm:max-h-[62vh]
                  lg:max-w-[780px] lg:max-h-[74vh]
                  xl:max-w-[860px]
                  transform-gpu
                  lg:-translate-y-[850px] xl:-translate-y-[980px] 2xl:-translate-y-[1150px]
                "
                                draggable={false}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* DETAILS */}
            <section className="w-full">
                <div className="mx-auto max-w-6xl px-4 pb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <FeatureCard glyph="◧" title="Calm Navigation posture">
                            Reduces clutter and keeps primary actions visually anchored so you don’t hunt for buttons.
                            <div className="mt-3 text-white/45">
                                Example: <em>Start Visit</em> is obvious, and escalation paths stay intentional.
                            </div>
                        </FeatureCard>

                        <FeatureCard glyph="⌁" title="Hardware-like feel">
                            Subtle motion, stable spacing, and “quiet” transitions create a shell that feels engineered — not chaotic. The UI aims to stay calm while your situation may not be.
                        </FeatureCard>

                        <FeatureCard glyph="＋" title="The center “+” (Safety Gallery entry)">
                            On <span className="text-white/78 font-medium">Pro</span> and{" "}
                            <span className="text-white/78 font-medium">ProMax</span>, the “+” opens Safety Gallery so you can add and manage safety photos used in premium SOS readiness.
                            <div className="mt-3 text-white/45">
                                Starter users will see this as <em>not available</em> (upgrade inside the app).
                            </div>
                        </FeatureCard>

                        <FeatureCard glyph="!" title="Safety first, even in premium mode">
                            Premium never hides critical controls behind visual effects. Safety actions are kept obvious, and state is designed to read quickly.
                            <div className="mt-3 text-white/45">
                                See <em>Safety &amp; Anti-Stalking</em> and <em>Emergency Disclaimer</em> for policy posture.
                            </div>
                        </FeatureCard>

                        <FeatureCard glyph="▣" title="Why this matters under stress">
                            In urgent moments, reaction time and comprehension matter more than aesthetics. MainShell reduces cognitive load so you can act with less friction.
                            <div className="mt-3 text-white/45">
                                Example: <em>one tap to escalate</em>, clear recipient messaging, fast posture.
                            </div>
                        </FeatureCard>

                        <FeatureCard glyph="⟡" title="Plan clarity (what you should expect)">
                            <div className="space-y-2">
                                <div>
                                    <span className="text-white/75 font-medium">Starter:</span>{" "}
                                    learn the Visit flow, see safety states, but premium actions stay gated.
                                </div>
                                <div>
                                    <span className="text-white/75 font-medium">Pro:</span>{" "}
                                    unlock practical safety upgrades (SOS + Safety Gallery entry).
                                </div>
                                <div>
                                    <span className="text-white/75 font-medium">ProMax:</span>{" "}
                                    full premium shell posture with the strongest readiness design.
                                </div>
                            </div>
                        </FeatureCard>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full">
                <div className="mx-auto max-w-6xl px-4 pb-10">
                    <div className="h-px bg-white/[0.08]" />

                    <div className="mt-8 flex flex-col items-center gap-3 text-center">
                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] sm:text-[12px] font-semibold text-white/45">
                            <a href="/privacy" className="hover:text-white/75 transition">
                                Privacy Policy
                            </a>
                            <span className="text-white/18">•</span>
                            <a href="/terms" className="hover:text-white/75 transition">
                                Terms of Use
                            </a>
                            <span className="text-white/18">•</span>
                            <a href="/acceptable-use" className="hover:text-white/75 transition">
                                Acceptable Use
                            </a>
                            <span className="text-white/18">•</span>
                            <a href="/safety" className="hover:text-white/75 transition">
                                Safety &amp; Anti-Stalking
                            </a>
                            <span className="text-white/18">•</span>
                            <a href="/emergency" className="hover:text-white/75 transition">
                                Emergency Disclaimer
                            </a>
                        </div>

                        <div className="text-[12px] text-white/50 font-semibold">
                            A 6 Clement Joshua service
                            <span className="text-white/25 ml-1 align-super text-[10px]">™</span>
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