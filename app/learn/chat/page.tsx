"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Tier = "Starter" | "Pro" | "ProMax";

const seo = {
  title:
    "StayKnown Chat | Voice Notes, Stickers, Media, Stories, and Safety Communication",
  description:
    "Learn how StayKnown Chat brings together messages, voice notes, stickers, media, stories, receipts, presence, and safety-aware communication in a premium trusted chat experience.",
  url: "https://stay-known.com/learn/chat",
  image: "https://stay-known.com/hero/chat-stickers-voice.png",
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
              FULL CHAT
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

function ChatStep({
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

function StickerTypeCard({
  title,
  label,
  body,
}: {
  title: string;
  label: string;
  body: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-black/25 p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.08),transparent_58%)]" />
      <div className="relative">
        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
          {label}
        </div>
        <div className="mt-2 text-[15px] font-black tracking-[-0.035em] text-white/90">
          {title}
        </div>
        <p className="mt-2 text-[12.4px] leading-relaxed font-medium text-white/55">
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
        <SectionLabel>Communication promise</SectionLabel>

        <div className="mt-3 text-[19px] sm:text-[24px] font-black tracking-[-0.045em] leading-tight text-white">
          “Chat should feel expressive, premium, and personal — but still tied
          to the trust layer of a safety app.”
        </div>

        <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
          <p>
            StayKnown Chat is the conversation layer around the safety network.
            It gives users a place for direct messages, voice notes, expressive
            stickers, media, profile context, and story-linked communication.
          </p>

          <p>
            This page focuses on the communication product itself. Device-level
            chat protection, biometric-aware access, and local privacy posture
            are covered separately on the Secure Chat Protection page.
          </p>
        </div>
      </div>
    </PremiumPanel>
  );
}

export default function LearnChatPage() {
  const [tier, setTier] = useState<Tier>("Pro");

  const tierCopy = useMemo(() => {
    return {
      Starter: [
        "Starter can use basic chat access while premium chat layers remain gated.",
        "Starter can send essential messages, attachments, and location-style context where allowed by the app rules.",
        "Starter does not include premium translation, advanced story viewing, premium sticker depth, or richer personalization surfaces.",
        "This keeps everyday communication available while preserving clear upgrade value for Pro and ProMax.",
      ],
      Pro: [
        "Pro unlocks the stronger StayKnown Chat experience: voice notes, richer media, expressive stickers, receipts, profile trust, and communication polish.",
        "Voice stickers and advanced expressive tools can be Pro-gated so the chat surface feels premium without overloading Starter.",
        "Pro is the practical communication tier for users who want more than plain messaging while staying inside a safety-aware network.",
        "Pairs naturally with secure chat protection, VPN chat gating, profile trust, and translation-ready messaging.",
      ],
      ProMax: [
        "ProMax should feel like the full premium chat layer: richer stickers, advanced rows, voice/music/video sticker expression, stories, themes, wallpapers, and highest polish.",
        "Best for users who want the most expressive StayKnown communication experience without losing the safety-first identity of the app.",
        "ProMax can support deeper sticker packs, premium visual effects, broader personalization, and the most complete chat presentation.",
        "The experience should feel smooth, glossy, fast, and intentionally premium across composer, tabs, stickers, voice notes, media, and stories.",
      ],
    } as Record<Tier, string[]>;
  }, []);

  const tierNote: Record<Tier, string> = useMemo(
    () => ({
      Starter:
        "Starter chat should stay useful but simpler. Keep premium translation, advanced stickers, stories, and richer personalization as upgrade value.",
      Pro: "Pro is the main paid chat upgrade for expressive communication and stronger safety-aware conversation tools.",
      ProMax:
        "ProMax should present the full chat identity: expressive sticker culture, premium media flow, stories, personalization, and polished safety communication.",
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
      "StayKnown Chat",
      "voice notes",
      "chat stickers",
      "voice stickers",
      "music stickers",
      "video stickers",
      "safety communication",
      "secure messaging",
      "profile trust",
      "chat media",
      "stories",
      "premium chat app",
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
              Learn • StayKnown Chat
            </div>
          </div>

          <div className="sm:hidden mt-3 flex items-center justify-between">
            <MobileNavLink href="/" label="Back to Home" />
            <MobileNavLink
              href="/learn/secure-chat-protection"
              label="Next: Secure"
            />
          </div>

          <div className="hidden sm:flex mt-5 items-center justify-center gap-3">
            <CTA href="/" label="Back to Home" />
            <CTA href="/learn/vpn-safety" label="VPN Safety" />
            <CTA
              href="/learn/secure-chat-protection"
              label="Secure Chat Protection"
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
                Messages, voice, stickers, stories, and safety context
              </div>

              <h1 className="mt-4 text-white/95 font-black tracking-[-0.06em] text-[38px] sm:text-[54px] lg:text-[60px] leading-[0.94]">
                StayKnown Chat
              </h1>

              <div className="mt-4 max-w-[76ch] space-y-3 text-white/62 font-medium text-[13px] sm:text-[14px] leading-relaxed">
                <p>
                  StayKnown Chat is built to feel richer than plain messaging.
                  It brings together direct messages, voice notes, media,
                  stickers, presence, receipts, profile trust, stories, and
                  safety-aware context inside one premium communication layer.
                </p>

                <p>
                  The goal is expression without losing seriousness. Users can
                  communicate naturally while the product still carries the
                  trust expectations of a safety-first platform.
                </p>
              </div>

              <TintedCallout title="The chat difference">
                StayKnown Chat should not feel like a copied social inbox. It
                should feel like a premium safety communication space where
                expressive tools, identity cues, and trusted context work
                together.
              </TintedCallout>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MiniStat
                  label="Expression"
                  value="Stickers"
                  detail="Image, voice, music, and video sticker culture."
                />
                <MiniStat
                  label="Audio"
                  value="Voice"
                  detail="Voice notes and voice stickers make messages feel human."
                />
                <MiniStat
                  label="Trust"
                  value="Profiles"
                  detail="Names, avatars, presence, receipts, and stories add context."
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
                    href="/learn/secure-chat-protection"
                    label="Secure Chat"
                  />
                  <MobileNavLink
                    href="/learn/language-aware-chat"
                    label="Language"
                  />
                </div>

                <div className="hidden sm:flex flex-wrap gap-3">
                  <CTA
                    href="/learn/secure-chat-protection"
                    label="Learn: Secure Chat Protection"
                  />
                  <CTA
                    href="/learn/language-aware-chat"
                    label="Learn: Language-Aware Chat"
                  />
                </div>
              </div>
            </div>

            <div className="order-2 lg:order-none lg:col-start-1 flex items-start justify-center lg:justify-start">
              <img
                src="/hero/chat-stickers-voice.png"
                alt="StayKnown Chat voice notes and stickers"
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
            <ScenarioBox />

            <PremiumPanel>
              <div className="p-5 sm:p-6">
                <SectionLabel>Chat product posture</SectionLabel>

                <div className="mt-3 text-[20px] sm:text-[25px] font-black tracking-[-0.045em] leading-tight text-white">
                  Chat is where safety relationships become everyday
                  communication.
                </div>

                <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
                  <p>
                    A user may start with safety features, but repeated product
                    use often comes from communication: checking in, replying to
                    stories, sending a voice note, saving a sticker, or sharing
                    context with someone trusted.
                  </p>

                  <p>
                    That makes Chat a retention surface. The stronger it feels,
                    the more StayKnown becomes a living network instead of an
                    emergency-only utility.
                  </p>
                </div>
              </div>
            </PremiumPanel>
          </div>

          <div className="mb-6 grid gap-3 md:grid-cols-5">
            <ChatStep
              n="1"
              title="Trust starts"
              body="Users connect through profile identity, names, avatars, and approved safety relationships."
            />
            <ChatStep
              n="2"
              title="Conversation opens"
              body="Messages, media, voice notes, and receipts create everyday communication."
            />
            <ChatStep
              n="3"
              title="Expression grows"
              body="Stickers, voice stickers, music stickers, and video stickers make chat feel personal."
            />
            <ChatStep
              n="4"
              title="Context stays useful"
              body="Presence, stories, language preferences, and safety context help conversations feel alive."
            />
            <ChatStep
              n="5"
              title="Premium value deepens"
              body="Pro and ProMax unlock richer expression, personalization, and polished chat flows."
            />
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StickerTypeCard
              label="Sticker type"
              title="Image stickers"
              body="Fast visual expression for everyday chat. Starter can keep a simple image-sticker layer while premium tiers unlock richer organization and polish."
            />
            <StickerTypeCard
              label="Sticker type"
              title="Voice stickers"
              body="Short expressive audio moments that feel more personal than text. This is a strong Pro feature because it adds identity and emotion."
            />
            <StickerTypeCard
              label="Sticker type"
              title="Music stickers"
              body="Tiny music-based sticker moments for expressive chat culture, previews, and premium personalization without turning chat into a music app."
            />
            <StickerTypeCard
              label="Sticker type"
              title="Video stickers"
              body="Short looping video stickers with controlled duration and polished display, useful for ProMax expression and premium pack experiences."
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <FeatureCard glyph="▣" title="Sticker system as a premium identity">
              Stickers should become one of StayKnown Chat’s strongest visual
              signatures. They can include system packs, saved stickers, custom
              stickers, edited copies, voice stickers, music stickers, and short
              video stickers.
              <div className="mt-3 text-white/45">
                The experience should feel fast, polished, compact, and
                intentionally premium — not like a basic gallery picker.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⌁" title="Voice notes and voice stickers">
              Voice makes chat feel human. A voice note carries a full message;
              a voice sticker carries a short expressive moment.
              <div className="mt-3 space-y-2 text-white/62">
                <div>• hold to record</div>
                <div>• lock recording when needed</div>
                <div>• pause and resume smoothly</div>
                <div>• send quick voice moments with minimal friction</div>
              </div>
            </FeatureCard>

            <FeatureCard glyph="▶" title="Video sticker flow">
              Video stickers should stay short, lightweight, and controlled.
              They are not full videos; they are expressive sticker moments that
              can loop, preview, save, and send cleanly in chat.
              <div className="mt-3 text-white/45">
                Keep display smaller inside messages so stickers feel elegant,
                not oversized or distracting.
              </div>
            </FeatureCard>

            <FeatureCard glyph="♪" title="Music sticker flow">
              Music stickers can give chat a signature personality. They should
              feel like compact expressive clips, not full media posts.
              <div className="mt-3 text-white/45">
                The product value is emotional expression: a tiny sound,
                reaction, mood, or branded pack moment inside a conversation.
              </div>
            </FeatureCard>

            <FeatureCard glyph="✔" title="Saved, Yours, and custom stickers">
              A strong sticker system lets users save stickers, manage their own
              custom sticker area, and remove items cleanly.
              <div className="mt-3 space-y-2 text-white/62">
                <div>• saved stickers should be easy to find</div>
                <div>
                  • custom sticker errors should stay inside the custom tab
                </div>
                <div>• long-press can support multi-select delete</div>
                <div>
                  • editing should clone instead of changing the original
                </div>
              </div>
            </FeatureCard>

            <FeatureCard glyph="⟡" title="Presence, receipts, and story trust">
              Chat should show useful context without clutter:
              <div className="mt-3 space-y-2 text-white/62">
                <div>• sent, delivered, and read receipt meaning</div>
                <div>• online or recently seen context where appropriate</div>
                <div>
                  • first and last names under story tiles where available
                </div>
                <div>
                  • profile and story surfaces that help users recognize each
                  other
                </div>
              </div>
            </FeatureCard>

            <FeatureCard glyph="◌" title="Media and attachment polish">
              Attachments should feel premium and stable: no flicker, no harsh
              spinners, no broken skeletons, no confusing gallery icons when a
              sticker should display.
              <div className="mt-3 text-white/45">
                Chat media should load with calm feedback and display correctly
                for both sender and receiver.
              </div>
            </FeatureCard>

            <FeatureCard glyph="!" title="Safety-aware chat boundaries">
              StayKnown Chat should not be used for harassment, threats,
              stalking, coercion, impersonation, or abuse. Expression should
              stay tied to lawful, respectful communication.
              <div className="mt-3 text-white/45">
                Blocking, reporting, VPN gating, and acceptable-use language
                help keep chat aligned with the safety mission.
              </div>
            </FeatureCard>

            <FeatureCard glyph="✦" title="Investor value">
              Chat gives StayKnown recurring engagement beyond Visit and SOS
              moments. Stickers, voice, stories, profile trust, translation,
              themes, and media create a premium communication engine.
              <div className="mt-3 text-white/45">
                This can support retention, upgrades, personalization, and a
                stronger identity than basic location-sharing apps.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⚖" title="Policy and trust position">
              Because Chat can carry private content and social interaction, it
              needs strong policy framing: privacy, abuse reporting, acceptable
              use, child safety, and law-abiding communication.
              <div className="mt-3 text-white/45">
                Secure access is explained separately on the biometric
                protection page.
              </div>
            </FeatureCard>
          </div>

          <div className="mt-6">
            <PremiumPanel>
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <SectionLabel>Related learn pages</SectionLabel>

                  <div className="mt-3 text-[21px] sm:text-[28px] font-black tracking-[-0.045em] leading-tight text-white">
                    Chat connects to multiple StayKnown safety and trust pages
                    without repeating them.
                  </div>

                  <p className="mt-3 text-[12.8px] leading-relaxed text-white/56 font-medium">
                    This page explains the communication product. Use the linked
                    pages for biometric protection, translation, profile trust,
                    VPN gate behavior, and privacy boundaries.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      title: "Secure Chat Protection",
                      body: "Biometric-aware and device-level protection.",
                      href: "/learn/secure-chat-protection",
                    },
                    {
                      title: "Language-Aware Chat",
                      body: "Translation and recipient language preference.",
                      href: "/learn/language-aware-chat",
                    },
                    {
                      title: "Stories + Profile Trust",
                      body: "Profiles, stories, names, and recognition context.",
                      href: "/learn/stories-profile-trust",
                    },
                    {
                      title: "VPN Safety",
                      body: "Chat entry gate when VPN is active.",
                      href: "/learn/vpn-safety",
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
                    This page is written for discovery around premium safety
                    chat, voice notes, stickers, media, and trusted messaging.
                  </div>

                  <p className="mt-3 text-[12.8px] leading-relaxed text-white/56 font-medium">
                    Visitors should understand the value quickly: StayKnown Chat
                    is a premium communication layer with voice notes, sticker
                    culture, media, presence, receipts, stories, and safety
                    context. It is expressive, but still aligned with lawful and
                    trusted safety communication.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "A user sends a voice note to a trusted contact after a Visit update.",
                    "A Pro user saves a voice sticker and reuses it in a private conversation.",
                    "A ProMax user sends a short video sticker from a premium system pack.",
                    "A conversation uses receipts, presence, story context, and profile identity to feel trusted.",
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
                Terms of service
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
