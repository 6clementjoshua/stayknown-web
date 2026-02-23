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
            <span className="pointer-events-none absolute inset-0 opacity-0 active:opacity-100 transition duration-75 bg-white/[0.06]" />
        </Link>
    );
}

/* -------------------------
   Desktop CTA (smaller pill + white hover)
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

/* -------------------------
   Page (SECOND of the 3 learn routes)
   Route: /learn/end-visit-verify
-------------------------- */
export default function LearnEndVisitVerifyPage() {
    const [tier, setTier] = useState<Tier>("Starter");

    const tierCopy = useMemo(() => {
        return {
            Starter: [
                "End a Visit instantly when you’re done — sharing stops right away.",
                "Great for everyday check-ins (rides, short walks, quick errands).",
                "You can still use basic device protection (PIN/biometrics) for privacy.",
                "If you want stronger “stop-control” options across more safety actions, upgrade in-app.",
            ],
            Pro: [
                "Optional “verify to end” for Visits when your security toggle is on.",
                "Adds a deliberate confirmation step so endings aren’t caused by accidental taps.",
                "Helpful for routine high-pressure situations (crowds, checkpoints, night trips).",
                "Pairs with App Lock + Biometrics “Apply to” so your Visit controls stay protected.",
            ],
            ProMax: [
                "Most confident control for ending safety sharing during sensitive routines.",
                "Optimized for people who run Visits frequently and want maximum consistency.",
                "More control + clearer posture for advanced safety setups.",
                "Best combined with full coverage on App Lock/Biometrics targets for Visit actions.",
            ],
        } as Record<Tier, string[]>;
    }, []);

    const tierNote: Record<Tier, string> = useMemo(
        () => ({
            Starter:
                "Visits are designed for trusted sharing. Keep recipients limited to people you know.",
            Pro: "If you enable verification, keep your PIN/biometrics updated so you don’t lock yourself out.",
            ProMax:
                "For best safety posture, enable App Lock + Biometrics on Visit stop actions and sensitive screens.",
        }),
        []
    );

    return (
        <main className="min-h-screen bg-black">
            {/* centered brand header */}
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
                        <div className="text-white/40 font-medium text-[11px]">
                            Learn • End Visit (Verification)
                        </div>
                    </div>

                    {/* Mobile header nav (small, no pill) */}
                    <div className="sm:hidden mt-3 flex items-center justify-between">
                        <MobileNavLink href="/" label="Back to Home" />
                        <MobileNavLink
                            href="/learn/secure-chat-passcode"
                            label="Next: Secure Chat"
                        />
                    </div>

                    {/* Desktop header nav (smaller pills) */}
                    <div className="hidden sm:flex mt-5 items-center justify-center gap-3">
                        <CTA href="/" label="Back to Home" />
                        <CTA
                            href="/learn/secure-chat-passcode"
                            label="Next: Secure Chat"
                        />
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="relative w-full lg:-mb-[400px]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.06),transparent_58%)]" />

                <div className="mx-auto max-w-6xl px-4 pt-8 pb-0 sm:pb-0">
                    <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] items-start gap-8 lg:gap-6 xl:gap-8">
                        {/* Caption (mobile row 1, desktop right) */}
                        <div className="order-1 lg:order-none lg:col-start-2">
                            <div className="text-white/95 font-semibold tracking-[-0.03em] text-[40px] sm:text-[54px] lg:text-[58px] leading-[0.98]">
                                End Visit — Confirmed Finish
                            </div>

                            <div className="mt-4 text-white/62 font-normal text-[13.5px] sm:text-[14.5px] leading-relaxed max-w-[72ch]">
                                Visits are often used in tense, time-sensitive routines. If you
                                enable your security toggle, ending a Visit can require{" "}
                                <span className="text-white/78 font-medium">
                                    biometric or PIN confirmation
                                </span>{" "}
                                so a session isn’t ended by mistake—or by someone else handling
                                your phone.
                            </div>

                            <TintedCallout title="Designed for normal safety routines (not SOS)">
                                This is for everyday “stay safe while I move” sessions: rides,
                                late-night trips, unfamiliar routes, checkpoints, crowded places,
                                or any routine where you want your sharing to stay active until{" "}
                                <em>you</em> confirm it’s done.
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
                                    <MobileNavLink
                                        href="/learn/end-sos-verify"
                                        label="Previous: End SOS"
                                    />
                                    <MobileNavLink
                                        href="/learn/secure-chat-passcode"
                                        label="Explore: Secure Chat"
                                    />
                                </div>

                                <div className="hidden sm:flex flex-wrap gap-3">
                                    <CTA href="/learn/end-sos-verify" label="Previous: End SOS" />
                                    <CTA
                                        href="/learn/secure-chat-passcode"
                                        label="Explore: Secure Chat Passcode"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Device (mobile row 2, desktop left) */}
                        <div className="order-2 lg:order-none lg:col-start-1 flex items-start justify-center lg:justify-start">
                            <img
                                src="/hero/end-visit-verify.png"
                                alt="End Visit — Confirmed Finish"
                                draggable={false}
                                className="
                  block object-contain select-none
                  drop-shadow-[0_22px_80px_rgba(0,0,0,0.75)]
                  max-w-[86vw] max-h-[44vh]
                  sm:max-w-[560px] sm:max-h-[62vh]
                  lg:max-w-[720px] lg:max-h-[74vh]
                  xl:max-w-[780px]
                  transform-gpu
                  lg:-translate-y-[800px] xl:-translate-y-[980px] 2xl:-translate-y-[1150px]
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
                        <FeatureCard glyph="▶" title="Simple flow (what happens)">
                            <div className="space-y-2">
                                <div>
                                    <span className="text-white/75 font-medium">1)</span> You start a
                                    Visit to share while you move.
                                </div>
                                <div>
                                    <span className="text-white/75 font-medium">2)</span> When you tap{" "}
                                    <span className="text-white/85 font-medium">End Visit</span>, the
                                    app checks your settings.
                                </div>
                                <div>
                                    <span className="text-white/75 font-medium">3)</span> If enabled,
                                    the system asks for{" "}
                                    <span className="text-white/85 font-medium">biometrics or PIN</span>.
                                </div>
                                <div>
                                    <span className="text-white/75 font-medium">4)</span> On success,
                                    the Visit ends and live sharing stops immediately.
                                </div>
                            </div>
                        </FeatureCard>

                        <FeatureCard glyph="⌁" title="Why add confirmation for visits?">
                            Visits are frequently used in places where your phone might be
                            handled quickly—rides, bags, pockets, crowded situations. A protected
                            ending reduces:
                            <div className="mt-3 space-y-2 text-white/62">
                                <div>• accidental tap endings</div>
                                <div>• “phone grabbed” disruptions</div>
                                <div>• unintentional stops while navigating</div>
                            </div>
                        </FeatureCard>

                        <FeatureCard glyph="▣" title="What recipients should rely on">
                            Recipients can treat a Visit as active until it’s actually ended
                            in-app. When your configuration requires confirmation, an end signal
                            is only produced after you complete that confirmation step.
                            <div className="mt-3 text-white/45">
                                This supports clearer expectations for trusted contacts.
                            </div>
                        </FeatureCard>

                        <FeatureCard glyph="⟡" title="Works with your existing security screens">
                            This behavior is driven by the same security stack:
                            <div className="mt-3 space-y-2 text-white/62">
                                <div>
                                    • <span className="text-white/80 font-medium">App Lock</span>: add
                                    “Stop Visit / End Visit” under Apply to.
                                </div>
                                <div>
                                    • <span className="text-white/80 font-medium">Biometrics</span>: enable
                                    and apply to Visit stop.
                                </div>
                                <div>
                                    • <span className="text-white/80 font-medium">PIN</span>: fallback for
                                    protected actions.
                                </div>
                            </div>
                        </FeatureCard>

                        <FeatureCard glyph="✦" title="Good defaults (recommended)">
                            Recommended settings for most users:
                            <div className="mt-3 space-y-2 text-white/62">
                                <div>• Enable App Lock</div>
                                <div>• Apply to: Stop Visit / End Visit + Disable Live Location</div>
                                <div>• Enable Biometrics if your device supports it</div>
                                <div>• Keep a PIN set as fallback</div>
                            </div>
                        </FeatureCard>

                        <FeatureCard glyph="!" title="Keep it safety-first">
                            Visits are intended for trusted sharing—not public tracking. Keep
                            recipients limited to people you trust, and end the session when
                            you’re safe.
                            <div className="mt-3 text-white/45">
                                <em>In emergencies, prioritize local emergency services.</em>
                            </div>
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
                                Terms of Use
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