"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Tier = "Starter" | "Pro" | "ProMax";

/* -------------------------
   Mobile header/inline links (NO pill feel)
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
   Desktop CTA (smaller pill + white hover)
   FIX: force ALL inner text/icons to black on hover (so nothing disappears)
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
   Plan tabs:
   - Mobile: text tabs (no pill feel)
   - Desktop: pills (smaller + white hover)
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
   Feature card
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
    highlight?: boolean;
    bullets: string[];
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
   Tiny tinted callout (no pill)
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

export default function LearnVisitLivePage() {
    const [tier, setTier] = useState<Tier>("Starter");

    const tierCopy = useMemo(() => {
        return {
            Starter: [
                "Live Location Emitter runs only during an active Visit — intentional, time-bounded sharing.",
                "Ends instantly when the Visit ends, so the safety boundary is always clear.",
                "Receivers get clean messaging that’s easy to understand at a glance.",
                "SOS remains locked on Starter (upgrade required inside the app).",
            ],
            Pro: [
                "Unlock SOS access for escalation during unsafe moments (Visit + SOS readiness).",
                "Stronger clarity across alerts and safety messaging for trusted recipients.",
                "Better continuity for frequent users who use Visits daily (clearer status posture).",
                "More premium guidance in what recipients should do when updates arrive.",
            ],
            ProMax: [
                "Most premium control and confidence across Live + SOS experiences.",
                "Fastest access patterns and strongest safety posture for high-stakes routines.",
                "Built for users who want maximum reliability + polish in urgent workflows.",
                "Most complete context posture for safety communications.",
            ],
        } as Record<Tier, string[]>;
    }, []);

    const tierNote: Record<Tier, string> = useMemo(
        () => ({
            Starter: "Live sharing is scoped to safety. Keep your recipients limited to people you trust.",
            Pro: "SOS is for real safety concerns. Use it responsibly and keep communications within trusted recipients.",
            ProMax: "ProMax is the full safety posture: maximum clarity, maximum readiness, maximum control.",
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
                        <div className="text-white/40 font-medium text-[11px]">
                            Learn • Live Location Emitter
                        </div>
                    </div>

                    <div className="sm:hidden mt-3 flex items-center justify-between">
                        <MobileNavLink href="/learn/visit-live-sos" label="Previous: Live + SOS" />
                        <MobileNavLink href="/learn/promax-shell" label="Next: ProMax Shell" />
                    </div>

                    <div className="hidden sm:flex mt-5 flex-wrap items-center justify-center gap-3">
                        <CTA href="/" label="Back to Home" />
                        <CTA href="/learn/visit-live-sos" label="Previous: Live + SOS" />
                        <CTA href="/learn/promax-shell" label="Next: ProMax MainShell" />
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="relative w-full lg:-mb-[400px]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.06),transparent_58%)]" />

                <div className="mx-auto max-w-6xl px-4 pt-8 pb-0 sm:pb-0">
                    <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] items-start gap-8 lg:gap-10">
                        <div className="order-1 lg:order-none lg:col-start-2">
                            <div className="text-white/95 font-semibold tracking-[-0.03em] text-[40px] sm:text-[54px] lg:text-[58px] leading-[0.98]">
                                Live Location Emitter
                            </div>

                            <div className="mt-4 text-white/62 font-normal text-[13.5px] sm:text-[14.5px] leading-relaxed max-w-[72ch]">
                                Live updates occur only during an active Visit. End the Visit and sharing stops immediately — built to keep safety focused and reduce misuse.
                            </div>

                            <TintedCallout title="Why this design is intentional">
                                StayKnown avoids “always-on” sharing by tying live updates to a Visit. That makes safety sharing{" "}
                                <span className="text-white/78 font-medium">explicit</span>,{" "}
                                <span className="text-white/78 font-medium">time-bounded</span>, and easier for recipients to interpret correctly.{" "}
                                <em>It’s safety-first — not passive tracking.</em>
                            </TintedCallout>

                            <div className="mt-7">
                                <div className="text-white/45 font-medium text-[11px] tracking-[0.22em] text-center sm:text-left">
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

                            <div className="mt-6">
                                <div className="sm:hidden flex items-center justify-between gap-3">
                                    <MobileNavLink href="/learn/visit-live-sos" label="Learn: Live + SOS" />
                                    <MobileNavLink href="/learn/promax-shell" label="Explore: ProMax Shell" />
                                </div>

                                <div className="hidden sm:flex flex-wrap gap-3">
                                    <CTA href="/learn/visit-live-sos" label="Learn: Live + SOS" />
                                    <CTA href="/learn/promax-shell" label="Explore: ProMax MainShell" />
                                </div>
                            </div>
                        </div>

                        {/* Device — match your proven upward push */}
                        <div className="order-2 lg:order-none lg:col-start-1 flex items-start justify-center lg:justify-start">
                            <img
                                src="/hero/visit-live.png"
                                alt="Live Location Emitter"
                                draggable={false}
                                className="
                  block object-contain select-none
                  drop-shadow-[0_22px_80px_rgba(0,0,0,0.75)]
                  max-w-[86vw] max-h-[44vh]
                  sm:max-w-[560px] sm:max-h-[62vh]
                  lg:max-w-[720px] lg:max-h-[74vh]
                  xl:max-w-[780px]
                  transform-gpu
                  lg:-translate-y-[750px] xl:-translate-y-[980px] 2xl:-translate-y-[1150px]
                "
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Detail cards */}
            <section className="w-full">
                <div className="mx-auto max-w-6xl px-4 pb-10 sm:pb-14">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                        <FeatureCard glyph="▣" title="What the emitter does">
                            During a Visit, StayKnown shares live presence updates so your trusted people can understand your status in a readable, safety-focused way.
                            <div className="mt-3 text-white/45">
                                Example: <em>“Visit active — LIVE updates enabled.”</em>
                            </div>
                        </FeatureCard>

                        <FeatureCard glyph="⌁" title="Why it only runs during a Visit">
                            Always-on tracking can be misused. By scoping Live to an active Visit, StayKnown keeps sharing intentional, time-bounded, and easier to trust.
                            <div className="mt-3 text-white/45">
                                <em>End Visit</em> → sharing stops immediately.
                            </div>
                        </FeatureCard>

                        <FeatureCard glyph="⟂" title="Real-world examples">
                            <div className="space-y-2">
                                <div>
                                    <span className="text-white/75 font-medium">•</span>{" "}
                                    Late-night travel: start a Visit so trusted people know your status until you arrive safely.
                                </div>
                                <div>
                                    <span className="text-white/75 font-medium">•</span>{" "}
                                    First-time meetup: keep the Visit active while you’re in the situation.
                                </div>
                                <div>
                                    <span className="text-white/75 font-medium">•</span>{" "}
                                    Long route: recipients can interpret updates as part of a single safety session.
                                </div>
                            </div>
                        </FeatureCard>

                        <FeatureCard glyph="!" title="Where SOS fits (Pro / ProMax)">
                            SOS is the escalation action for urgent moments. It’s designed to be fast and obvious for recipients. Starter users will not see the SOS as button inside the app.
                            <div className="mt-3 text-white/45">
                                TO USE THE SOS FEATURE: <em>“recommended to upgrade to Pro or ProMax”</em>
                            </div>
                        </FeatureCard>

                        <FeatureCard glyph="✦" title="Signals the UI makes obvious">
                            StayKnown uses clear state signaling so you can tell what’s happening instantly:
                            <span className="text-white/78 font-medium"> Idle</span>,{" "}
                            <span className="text-white/78 font-medium">LIVE</span>, and{" "}
                            <span className="text-white/78 font-medium">SOS</span>.
                            <div className="mt-3 text-white/45">
                                If you enabled <em>Visual Severity</em> in settings, those states become more distinct visually (purely visual — no behavior change).
                            </div>
                        </FeatureCard>

                        <FeatureCard glyph="⟡" title="Privacy & anti-stalking posture">
                            Live sharing is scoped to safety and intended for trusted recipients only. Avoid sharing safety updates publicly. Keep communication private and safety-focused.
                            <div className="mt-3 text-white/45">
                                See <em>Safety &amp; Anti-Stalking</em> and <em>Emergency Disclaimer</em> for policy details.
                            </div>
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