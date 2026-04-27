"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Tier = "Starter" | "Pro" | "ProMax";

const seo = {
  title: "Secure Chat Biometric Protection | StayKnown",
  description:
    "Learn how StayKnown Chat uses biometric-aware and device-level protection to help keep safety conversations, media, voice notes, stickers, stories, and trusted profiles more private.",
  url: "https://stay-known.com/learn/secure-chat-passcode",
  image: "https://stay-known.com/hero/secure-chat-biometric.png",
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
        shrink-0 w-9 h-9 rounded-xl border border-white/12 bg-white/[0.045]
        backdrop-blur-md flex items-center justify-center text-white/90 text-[14px]
        leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_35px_rgba(0,0,0,0.35)]
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
        "border border-white/[0.09] bg-white/[0.035]",
        "shadow-[0_28px_100px_rgba(0,0,0,0.62)] backdrop-blur-xl",
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
          "rounded-full border transition-all duration-200 px-3.5 h-[34px] text-[12px]",
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
          “This is a safety conversation. I want it protected before someone can
          read, send, or view private chat content.”
        </div>
        <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
          <p>
            That is the reason for biometric-aware chat protection. StayKnown
            Chat can contain personal conversations, voice notes, media,
            stickers, story replies, profile context, and safety-related
            information. It deserves a privacy posture that feels visible and
            serious.
          </p>
          <p>
            For users, this builds confidence. For visitors, it explains why the
            app is not just another chat product. For investors and policy
            readers, it shows that communication privacy is treated as part of
            the safety layer, not as an afterthought.
          </p>
        </div>
      </div>
    </PremiumPanel>
  );
}

export default function LearnSecureChatBiometricPage() {
  const [tier, setTier] = useState<Tier>("Starter");

  const tierCopy = useMemo(() => {
    return {
      Starter: [
        "Chat access is not available on Starter in the current platform direction.",
        "Starter remains focused on basic safety features such as Visits, trusted contacts, and essential safety setup.",
        "Users can still build their profile and safety foundation before upgrading to communication features.",
        "This keeps the free tier simple while reserving private chat surfaces for paid safety plans.",
      ],
      Pro: [
        "Unlock StayKnown Chat with biometric-aware or device-level protection for private safety conversations.",
        "Designed for direct messages, media, voice notes, stickers, receipts, presence, and profile-aware communication.",
        "Helpful for users who want safer conversation access without exposing sensitive chat content casually.",
        "Pro gives users the practical communication layer connected to the broader safety ecosystem.",
      ],
      ProMax: [
        "The most complete private communication posture with premium chat surfaces, stories, profile trust, and richer safety context.",
        "Best for users who want the full StayKnown experience: safety, communication, personalization, and high-polish UI.",
        "Supports stronger trust cues across profiles, stories, media, chat presence, and safety-aware messaging.",
        "ProMax is built for users who want maximum privacy feel, premium presentation, and complete communication readiness.",
      ],
    } as Record<Tier, string[]>;
  }, []);

  const tierNote: Record<Tier, string> = useMemo(
    () => ({
      Starter:
        "Starter keeps chat gated so the platform can preserve chat as a premium safety communication layer.",
      Pro: "Biometric protection depends on the device’s available authentication methods and the user’s local device settings.",
      ProMax:
        "ProMax is the full communication posture: private chat, safety context, profile trust, stories, and premium experience.",
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
      "secure chat",
      "biometric chat protection",
      "safety communication",
      "private messaging",
      "StayKnown Chat",
      "safety app",
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
              Learn • Secure Chat Biometric Protection
            </div>
          </div>

          <div className="sm:hidden mt-3 flex items-center justify-between">
            <MobileNavLink href="/" label="Back to Home" />
            <MobileNavLink
              href="/learn/end-sos-verify"
              label="Previous: End SOS"
            />
          </div>

          <div className="hidden sm:flex mt-5 items-center justify-center gap-3">
            <CTA href="/" label="Back to Home" />
            <CTA href="/learn/end-sos-verify" label="Previous: End SOS" />
            <CTA href="/learn/promax-shell" label="Explore ProMax Shell" />
          </div>
        </div>
      </header>

      <section className="relative w-full lg:-mb-[360px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.065),transparent_58%)]" />

        <div className="mx-auto max-w-6xl px-4 pt-8 pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] items-start gap-8 lg:gap-8">
            <div className="order-1 lg:order-none lg:col-start-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[10.5px] font-black tracking-[0.20em] text-white/46 uppercase">
                Biometric-aware private chat
              </div>

              <h1 className="mt-4 text-white/95 font-black tracking-[-0.06em] text-[38px] sm:text-[54px] lg:text-[60px] leading-[0.94]">
                Secure Chat Biometric Protection
              </h1>

              <div className="mt-4 max-w-[76ch] space-y-3 text-white/62 font-medium text-[13px] sm:text-[14px] leading-relaxed">
                <p>
                  StayKnown Chat is designed as a safety-aware communication
                  space, not a casual open inbox. It can carry messages, media,
                  voice notes, stickers, profile context, story replies, and
                  safety-sensitive conversation signals.
                </p>
                <p>
                  Biometric-aware protection helps make that private surface
                  feel protected before someone reads, sends, or interacts with
                  chat content on the device.
                </p>
              </div>

              <TintedCallout title="Centered on biometric and device-level protection">
                This page no longer describes email passcodes. The platform
                language should focus on biometric-aware access, device
                authentication, local privacy expectations, and responsible chat
                use.
              </TintedCallout>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MiniStat
                  label="Access"
                  value="Biometric aware"
                  detail="Uses device authentication posture where available."
                />
                <MiniStat
                  label="Surface"
                  value="Private chat"
                  detail="Protects a sensitive communication area, not just a screen."
                />
                <MiniStat
                  label="Trust"
                  value="Profile context"
                  detail="Works with identity, presence, receipts, media, and safety context."
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
                    label="Live + SOS"
                  />
                  <MobileNavLink
                    href="/learn/promax-shell"
                    label="ProMax Shell"
                  />
                </div>

                <div className="hidden sm:flex flex-wrap gap-3">
                  <CTA href="/learn/visit-live-sos" label="Learn: Live + SOS" />
                  <CTA
                    href="/learn/promax-shell"
                    label="Explore: ProMax Shell"
                  />
                </div>
              </div>
            </div>

            <div className="order-2 lg:order-none lg:col-start-1 flex items-start justify-center lg:justify-start">
              <img
                src="/hero/secure-chat-biometric.png"
                alt="Secure Chat Biometric Protection"
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
            <SoliloquyBox />

            <PremiumPanel>
              <div className="p-5 sm:p-6">
                <SectionLabel>Security and privacy posture</SectionLabel>
                <div className="mt-3 text-[20px] sm:text-[25px] font-black tracking-[-0.045em] leading-tight text-white">
                  Secure chat protection is about reducing casual exposure of
                  sensitive safety conversations.
                </div>
                <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
                  <p>
                    Chat may include personal messages, images, voice notes,
                    stickers, story replies, presence signals, and profile
                    context. If a device is shared, left open, or picked up by
                    someone else, biometric-aware protection can add friction
                    before private content is exposed.
                  </p>
                  <p>
                    This does not make a device impossible to compromise and it
                    does not replace responsible account security. It is one
                    visible layer in a larger privacy and safety posture.
                  </p>
                </div>
              </div>
            </PremiumPanel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <FeatureCard glyph="⌁" title="What biometric protection does">
              It adds a device-level privacy check around chat access or
              sensitive chat actions, depending on how the app is configured.
              The point is simple: private safety conversations should not feel
              casually open.
              <div className="mt-3 text-white/45">
                Example: a user opens Chat and confirms with Face ID,
                fingerprint, or their device authentication method.
              </div>
            </FeatureCard>

            <FeatureCard glyph="▣" title="What StayKnown Chat can carry">
              Chat is not only text. It can include messages, media, files,
              voice notes, stickers, presence, read receipts, profile previews,
              stories, and safety context.
              <div className="mt-3 text-white/45">
                That makes the chat surface valuable — and worth protecting.
              </div>
            </FeatureCard>

            <FeatureCard glyph="!" title="What it does not promise">
              Biometric protection is not a law-enforcement system, not a
              guarantee against device compromise, and not a substitute for
              emergency services. It is a privacy layer controlled by the user’s
              device capability.
              <div className="mt-3 text-white/45">
                In urgent danger, users should contact local emergency services.
              </div>
            </FeatureCard>

            <FeatureCard glyph="✦" title="Why this improves trust">
              When users see visible protection around communication, they are
              more likely to understand that StayKnown treats chat as part of
              the safety ecosystem — not as a basic social feature.
              <div className="mt-3 text-white/45">
                That trust matters for families, new connections, safety
                contacts, and high-risk routines.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⟡" title="Plan gating, explained clearly">
              <div className="space-y-2">
                <div>
                  <span className="text-white/78 font-black">Starter:</span>{" "}
                  basic safety features; chat is not available in the current
                  plan posture.
                </div>
                <div>
                  <span className="text-white/78 font-black">Pro:</span> private
                  chat access with communication tools and protection posture.
                </div>
                <div>
                  <span className="text-white/78 font-black">ProMax:</span>{" "}
                  complete premium communication experience with richer
                  surfaces.
                </div>
              </div>
            </FeatureCard>

            <FeatureCard glyph="⚖" title="Law-abiding explanation">
              StayKnown Chat should not be used to harass, stalk, coerce, or
              pressure others. Biometric protection helps protect the user’s own
              communication surface; it does not authorize misuse of messaging.
              <div className="mt-3 text-white/45">
                Users should follow the Acceptable Use, Safety, Privacy, and
                Abuse Reporting policies.
              </div>
            </FeatureCard>

            <FeatureCard glyph="◌" title="Why investors should care">
              Secure chat expands StayKnown from a safety alert app into a
              safety-first communication platform. Chat, profile trust, stories,
              media, translation readiness, and plan tiers create long-term
              product depth.
              <div className="mt-3 text-white/45">
                Biometric-aware protection strengthens the premium perception of
                that communication layer.
              </div>
            </FeatureCard>

            <FeatureCard glyph="▶" title="Simple user guidance">
              <div className="space-y-2">
                <div>• Keep your device lock enabled.</div>
                <div>• Do not let others use your account.</div>
                <div>• Block or report users who misuse Chat.</div>
                <div>
                  • Use SOS or local emergency services when safety is urgent.
                </div>
              </div>
            </FeatureCard>
          </div>

          <div className="mt-6">
            <PremiumPanel>
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <SectionLabel>Search discovery focus</SectionLabel>
                  <div className="mt-3 text-[21px] sm:text-[28px] font-black tracking-[-0.045em] leading-tight text-white">
                    This page is written for users searching for private safety
                    chat, biometric chat protection, and secure messaging inside
                    a safety app.
                  </div>
                  <p className="mt-3 text-[12.8px] leading-relaxed text-white/56 font-medium">
                    The content uses plain explanations so visitors, investors,
                    and search engines can understand the feature without
                    needing app code context. It also makes the product boundary
                    clear: privacy protection, safety communication, and
                    anti-abuse expectations.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "A user opens Chat and confirms with device authentication before viewing private messages.",
                    "A user sends a voice note or media message inside a protected safety communication space.",
                    "A family member understands that StayKnown Chat is tied to profile trust and safety context.",
                    "A user blocks or reports misuse instead of allowing harassment to continue.",
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
