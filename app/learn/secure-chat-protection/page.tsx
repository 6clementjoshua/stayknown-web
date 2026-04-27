"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Tier = "Starter" | "Pro" | "ProMax";

const seo = {
  title:
    "Secure Chat Protection | StayKnown Biometric and Safety-Aware Chat Privacy",
  description:
    "Learn how StayKnown protects safety-aware chat with biometric/device-level access, VPN-aware entry, profile trust, private media boundaries, and anti-abuse communication rules.",
  url: "https://stay-known.com/learn/secure-chat-protection",
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
              STRONGEST PRIVACY
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

function ProtectionStep({
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
        <SectionLabel>Privacy assurance</SectionLabel>

        <div className="mt-3 text-[19px] sm:text-[24px] font-black tracking-[-0.045em] leading-tight text-white">
          “A safety chat should not be easy for someone nearby to casually open,
          inspect, or misuse.”
        </div>

        <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
          <p>
            Secure Chat Protection is the guardrail around the communication
            layer. It helps position StayKnown Chat as private, safety-aware,
            identity-conscious, and aligned with the trust expectations of the
            wider app.
          </p>

          <p>
            This page does not re-sell every chat feature. The Chat page
            explains stickers, media, voice notes, stories, and communication
            depth. This page explains why the chat layer needs protection.
          </p>
        </div>
      </div>
    </PremiumPanel>
  );
}

export default function LearnSecureChatProtectionPage() {
  const [tier, setTier] = useState<Tier>("Pro");

  const tierCopy = useMemo(() => {
    return {
      Starter: [
        "Starter can understand the protection model while keeping premium chat protection features gated.",
        "Basic safety use remains focused on Visits, contact setup, and core trust flows.",
        "If Starter chat access is enabled in the app, it should remain simpler and avoid premium protection-heavy expectations.",
        "Starter should still receive clear education about privacy, blocking, reporting, and lawful communication.",
      ],
      Pro: [
        "Pro can unlock protected chat access with biometric-aware or device-level confirmation where supported.",
        "Designed for users who want private safety conversations, voice notes, stickers, media, profile trust, and receipts behind a stronger access posture.",
        "Pairs with VPN-aware chat entry so the communication layer respects the wider safety reliability policy.",
        "Pro is the practical privacy upgrade for users who want safer communication without the full ProMax experience.",
      ],
      ProMax: [
        "ProMax should feel like the strongest private communication posture across chat, stories, media, stickers, profile trust, and personalization.",
        "Best for users who want premium privacy feel, full chat polish, richer communication surfaces, and the highest safety-aware presentation.",
        "Works naturally with ProMax shell effects, premium sticker rows, voice/music/video stickers, wallpapers, themes, and richer profile context.",
        "ProMax should make secure chat protection feel serious and premium without making the app slow, scary, or overcomplicated.",
      ],
    } as Record<Tier, string[]>;
  }, []);

  const tierNote: Record<Tier, string> = useMemo(
    () => ({
      Starter:
        "Starter education should be clear: private communication has safety responsibilities, even before premium chat protection is unlocked.",
      Pro: "Biometric and device-level protection depend on the user’s phone, app settings, and available authentication methods.",
      ProMax:
        "ProMax strengthens the premium privacy posture, but users still need responsible account behavior and lawful communication.",
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
      "secure chat protection",
      "biometric chat protection",
      "device-level chat privacy",
      "safety communication",
      "private messaging",
      "StayKnown Chat",
      "VPN chat gate",
      "profile trust",
      "anti-abuse chat policy",
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
              Learn • Secure Chat Protection
            </div>
          </div>

          <div className="sm:hidden mt-3 flex items-center justify-between">
            <MobileNavLink href="/" label="Back to Home" />
            <MobileNavLink
              href="/learn/language-aware-chat"
              label="Next: Language"
            />
          </div>

          <div className="hidden sm:flex mt-5 items-center justify-center gap-3">
            <CTA href="/" label="Back to Home" />
            <CTA href="/learn/chat" label="StayKnown Chat" />
            <CTA
              href="/learn/language-aware-chat"
              label="Next: Language-Aware Chat"
            />
          </div>
        </div>
      </header>

      <section className="relative w-full lg:-mb-[360px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.065),transparent_58%)]" />

        <div className="mx-auto max-w-6xl px-4 pt-8 pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] items-start gap-8 lg:gap-8">
            <div className="order-1 lg:order-none lg:col-start-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[10.5px] font-black tracking-[0.20em] text-white/46 uppercase">
                Biometric-aware communication privacy
              </div>

              <h1 className="mt-4 text-white/95 font-black tracking-[-0.06em] text-[38px] sm:text-[54px] lg:text-[60px] leading-[0.94]">
                Secure Chat Protection
              </h1>

              <div className="mt-4 max-w-[76ch] space-y-3 text-white/62 font-medium text-[13px] sm:text-[14px] leading-relaxed">
                <p>
                  Secure Chat Protection helps keep StayKnown’s private
                  communication layer aligned with the rest of the safety
                  product. Chat can carry identity, emotion, media, voice, story
                  context, and safety-related conversations.
                </p>

                <p>
                  Biometric-aware or device-level access makes the chat surface
                  feel more protected before private content is viewed or used
                  on a device.
                </p>
              </div>

              <TintedCallout title="Public language rule">
                Keep the public explanation centered on biometric-aware and
                device-level protection.{" "}
                <em>
                  Do not make the public route depend on “passcode” wording.
                </em>
              </TintedCallout>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MiniStat
                  label="Protection"
                  value="Device"
                  detail="Uses local authentication posture where available."
                />
                <MiniStat
                  label="Context"
                  value="Private"
                  detail="Applies to a communication surface, not only a button."
                />
                <MiniStat
                  label="Policy"
                  value="Respect"
                  detail="Supports blocking, reporting, and anti-abuse rules."
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
                  <MobileNavLink href="/learn/chat" label="Chat" />
                  <MobileNavLink
                    href="/learn/language-aware-chat"
                    label="Language"
                  />
                </div>

                <div className="hidden sm:flex flex-wrap gap-3">
                  <CTA href="/learn/chat" label="Learn: StayKnown Chat" />
                  <CTA
                    href="/learn/language-aware-chat"
                    label="Learn: Language-Aware Chat"
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
                  lg:-translate-y-[760px] xl:-translate-y-[940px] 2xl:-translate-y-[1100px]
                "
              />
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
                <SectionLabel>Protection boundary</SectionLabel>

                <div className="mt-3 text-[20px] sm:text-[25px] font-black tracking-[-0.045em] leading-tight text-white">
                  Chat protection is not the chat feature list. It is the
                  privacy posture around the feature list.
                </div>

                <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
                  <p>
                    Messages, stickers, voice notes, media, receipts, stories,
                    and profile context can make Chat valuable. Secure Chat
                    Protection explains why those surfaces should not feel
                    casually exposed.
                  </p>

                  <p>
                    The product should feel protected without becoming
                    intimidating. The user needs simple language, quick access
                    recovery, and clear reasons when protection appears.
                  </p>
                </div>
              </div>
            </PremiumPanel>
          </div>

          <div className="mb-6 grid gap-3 md:grid-cols-5">
            <ProtectionStep
              n="1"
              title="User opens chat"
              body="The user enters a communication surface that may include private safety context."
            />
            <ProtectionStep
              n="2"
              title="Protection checks"
              body="The app can request biometric or device-level confirmation if enabled."
            />
            <ProtectionStep
              n="3"
              title="Chat unlocks"
              body="After confirmation, messages, media, stickers, and context are visible."
            />
            <ProtectionStep
              n="4"
              title="Safety rules remain"
              body="VPN gates, blocking, reporting, and acceptable-use rules still apply."
            />
            <ProtectionStep
              n="5"
              title="User stays in control"
              body="The user can manage privacy expectations through app and device settings."
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <FeatureCard glyph="✔" title="What protection can cover">
              Secure Chat Protection can apply to the entry point or selected
              sensitive actions:
              <div className="mt-3 space-y-2 text-white/62">
                <div>• opening the chat surface</div>
                <div>• viewing private message content</div>
                <div>• sending or interacting with sensitive media</div>
                <div>• accessing profile-aware conversation context</div>
              </div>
            </FeatureCard>

            <FeatureCard glyph="▣" title="Why media and stickers matter">
              Stickers, voice stickers, music stickers, video stickers, photos,
              and files may feel playful, but they are still part of private
              communication.
              <div className="mt-3 text-white/45">
                If the chat surface is exposed, expressive content can be
                exposed too.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⌁" title="VPN-aware chat entry">
              StayKnown Chat can have its own VPN gate. That gate should appear
              only when the user tries to enter Chat with VPN active, not as a
              duplicate app-launch warning.
              <div className="mt-3 text-white/45">
                This keeps chat privacy and location reliability policies
                separate but aligned.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⟡" title="Profile trust and recognition">
              A protected chat should still feel human. Names, avatars, story
              previews, presence, and profile context help users recognize who
              they are speaking with.
              <div className="mt-3 text-white/45">
                Protection should not remove trust cues; it should guard the
                surface where trust cues appear.
              </div>
            </FeatureCard>

            <FeatureCard glyph="!" title="What it does not guarantee">
              Biometric-aware chat protection does not make a device impossible
              to compromise, does not replace safe account behavior, and does
              not turn private chat into an emergency service.
              <div className="mt-3 text-white/45">
                In immediate danger, users should contact local emergency
                services directly.
              </div>
            </FeatureCard>

            <FeatureCard glyph="◌" title="Friendly privacy language">
              Avoid raw security wording. Use clear user-facing language:
              <div className="mt-3 space-y-2 text-white/62">
                <div>• “Confirm it is you to open Chat.”</div>
                <div>• “Your private safety conversations are protected.”</div>
                <div>• “Use your device authentication to continue.”</div>
                <div>• “Turn off VPN before entering Chat.”</div>
              </div>
            </FeatureCard>

            <FeatureCard glyph="⚖" title="Law-abiding communication">
              Secure Chat Protection does not authorize harassment, stalking,
              threats, impersonation, coercion, or abuse. Private messaging
              still needs strong acceptable-use boundaries.
              <div className="mt-3 text-white/45">
                Blocking and reporting should remain easy to understand and
                available where appropriate.
              </div>
            </FeatureCard>

            <FeatureCard glyph="✦" title="Investor value">
              Secure Chat Protection strengthens StayKnown’s premium identity.
              It tells users and investors that chat is not a random add-on; it
              is a protected communication layer inside a safety platform.
              <div className="mt-3 text-white/45">
                That supports retention, trust, and upgrade value across Pro and
                ProMax.
              </div>
            </FeatureCard>
          </div>

          <div className="mt-6">
            <PremiumPanel>
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <SectionLabel>Related learn pages</SectionLabel>

                  <div className="mt-3 text-[21px] sm:text-[28px] font-black tracking-[-0.045em] leading-tight text-white">
                    Secure Chat Protection is one layer in the wider
                    communication system.
                  </div>

                  <p className="mt-3 text-[12.8px] leading-relaxed text-white/56 font-medium">
                    Use the linked pages to understand the chat feature set,
                    translation, VPN behavior, and profile trust without
                    repeating those topics here.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      title: "StayKnown Chat",
                      body: "Voice notes, stickers, media, stories, and chat depth.",
                      href: "/learn/chat",
                    },
                    {
                      title: "Language-Aware Chat",
                      body: "Recipient language preferences and translation-ready messaging.",
                      href: "/learn/language-aware-chat",
                    },
                    {
                      title: "VPN Safety",
                      body: "Chat entry behavior when VPN is active.",
                      href: "/learn/vpn-safety",
                    },
                    {
                      title: "Stories + Profile Trust",
                      body: "Names, avatars, stories, and recognition context.",
                      href: "/learn/stories-profile-trust",
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

          <div className="mt-6">
            <PremiumPanel>
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <SectionLabel>Search discovery focus</SectionLabel>

                  <div className="mt-3 text-[21px] sm:text-[28px] font-black tracking-[-0.045em] leading-tight text-white">
                    This page is written for discovery around biometric chat
                    privacy, secure messaging, and safety-aware communication.
                  </div>

                  <p className="mt-3 text-[12.8px] leading-relaxed text-white/56 font-medium">
                    Visitors should understand the boundary quickly: StayKnown
                    Chat can be expressive, media-rich, and profile-aware, while
                    Secure Chat Protection helps keep that private surface
                    harder to casually access on the user’s device.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "A user confirms with device authentication before opening private chat.",
                    "A Pro user keeps voice notes, stickers, and message context behind a stronger access layer.",
                    "A ProMax user combines secure chat protection with premium stickers, stories, themes, and profile trust.",
                    "A user blocks or reports abusive communication instead of treating privacy protection as permission for misuse.",
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
