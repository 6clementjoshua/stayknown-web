"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Tier = "Starter" | "Pro" | "ProMax";

const seo = {
  title:
    "Language-Aware Chat | StayKnown Translation Preferences and Multilingual Messaging",
  description:
    "Learn how StayKnown Chat supports language-aware messaging, recipient language preferences, translation status, Nigerian languages, global languages, and future expansion.",
  url: "https://stay-known.com/learn/language-aware-chat",
  image: "https://stay-known.com/hero/chat-translation.png",
};

const proLanguages = [
  "English",
  "French",
  "Spanish",
  "Portuguese",
  "German",
  "Arabic",
  "Igbo",
  "Hausa",
  "Yoruba",
  "Swahili",
  "Hindi",
  "Urdu",
];

const proMaxLanguages = [
  "Arabic",
  "Bulgarian",
  "Czech",
  "Danish",
  "German",
  "Greek",
  "English",
  "English (UK)",
  "English (US)",
  "Spanish",
  "Estonian",
  "Finnish",
  "French",
  "Hausa",
  "Hindi",
  "Hungarian",
  "Indonesian",
  "Igbo",
  "Italian",
  "Japanese",
  "Korean",
  "Lithuanian",
  "Latvian",
  "Norwegian Bokmål",
  "Dutch",
  "Polish",
  "Portuguese",
  "Portuguese (Brazil)",
  "Portuguese (Portugal)",
  "Romanian",
  "Russian",
  "Slovak",
  "Slovenian",
  "Swedish",
  "Swahili",
  "Turkish",
  "Ukrainian",
  "Urdu",
  "Yoruba",
  "Chinese",
];

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
              GLOBAL DEPTH
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

function LanguagePill({ label }: { label: string }) {
  return (
    <div className="rounded-full border border-white/10 bg-black/25 px-3 py-2 text-[11.5px] font-semibold text-white/60">
      {label}
    </div>
  );
}

function LanguageStep({
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
        <SectionLabel>Language assurance</SectionLabel>

        <div className="mt-3 text-[19px] sm:text-[24px] font-black tracking-[-0.045em] leading-tight text-white">
          “Safety communication should not fail just because two trusted people
          prefer different languages.”
        </div>

        <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
          <p>
            Language-Aware Chat lets StayKnown treat language preference as part
            of the communication layer. The sender’s message, the receiver’s
            preference, and the translation state can travel with the message so
            the app can explain what is happening clearly.
          </p>

          <p>
            This page focuses on language preference, translation readiness, and
            expansion. Secure access, chat stickers, and the wider chat product
            are explained on their own pages.
          </p>
        </div>
      </div>
    </PremiumPanel>
  );
}

export default function LearnLanguageAwareChatPage() {
  const [tier, setTier] = useState<Tier>("Pro");

  const tierCopy = useMemo(() => {
    return {
      Starter: [
        "Starter should keep language behavior simple and default to English where premium translation is not available.",
        "Starter can still understand the feature from this page before upgrading to translation-ready chat.",
        "Manual language preference controls should remain limited so free users are not confused by locked translation behavior.",
        "The goal is clarity: basic chat stays usable, while multilingual automation becomes upgrade value.",
      ],
      Pro: [
        "Pro supports a focused language set for practical multilingual chat, including English, French, Spanish, Portuguese, German, Arabic, Igbo, Hausa, Yoruba, Swahili, Hindi, and Urdu.",
        "Pro is ideal for users who need common global languages plus key Nigerian and African language support in trusted conversations.",
        "Messages can carry sender and receiver language preference metadata so translation can be requested when needed.",
        "Pro should present translation as a helpful safety communication layer, not as a perfect replacement for human judgment.",
      ],
      ProMax: [
        "ProMax supports the full current language catalog for the broadest multilingual communication posture.",
        "Best for users who want the strongest global chat readiness across English variants, European languages, African languages, Asian languages, and expansion-ready architecture.",
        "ProMax should feel premium because language support becomes part of the full chat experience: messages, media captions, voice/media context, and safety communication.",
        "The language catalog can expand over time as provider support, quality checks, and product safety rules improve.",
      ],
    } as Record<Tier, string[]>;
  }, []);

  const tierNote: Record<Tier, string> = useMemo(
    () => ({
      Starter:
        "Starter should remain simple: English-first behavior, with premium translation and richer language controls reserved for upgrades.",
      Pro: "Pro includes Nigerian languages in the supported product catalog: Igbo, Hausa, and Yoruba, alongside Swahili and other global languages.",
      ProMax:
        "ProMax uses the full supported catalog today and should remain open to expansion when new languages meet quality and safety expectations.",
    }),
    [],
  );

  const languageList = tier === "ProMax" ? proMaxLanguages : proLanguages;

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
      "language-aware chat",
      "chat translation",
      "recipient language preference",
      "Nigerian language chat",
      "Igbo translation",
      "Hausa translation",
      "Yoruba translation",
      "multilingual safety communication",
      "StayKnown Chat",
      "translation-ready messaging",
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
              Learn • Language-Aware Chat
            </div>
          </div>

          <div className="sm:hidden mt-3 flex items-center justify-between">
            <MobileNavLink href="/" label="Back to Home" />
            <MobileNavLink
              href="/learn/stories-profile-trust"
              label="Next: Stories"
            />
          </div>

          <div className="hidden sm:flex mt-5 items-center justify-center gap-3">
            <CTA href="/" label="Back to Home" />
            <CTA href="/learn/chat" label="StayKnown Chat" />
            <CTA
              href="/learn/stories-profile-trust"
              label="Next: Stories + Profile"
            />
          </div>
        </div>
      </header>

      <section className="relative w-full">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.065),transparent_58%)]" />

        <div className="mx-auto max-w-6xl px-4 pt-8 pb-0">
          <div className="mx-auto max-w-4xl">
            <div className="order-1 lg:order-none lg:col-start-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[10.5px] font-black tracking-[0.20em] text-white/46 uppercase">
                Translation-ready trusted communication
              </div>

              <h1 className="mt-4 text-white/95 font-black tracking-[-0.06em] text-[38px] sm:text-[54px] lg:text-[60px] leading-[0.94]">
                Language-Aware Chat
              </h1>

              <div className="mt-4 max-w-[76ch] space-y-3 text-white/62 font-medium text-[13px] sm:text-[14px] leading-relaxed">
                <p>
                  StayKnown Chat can understand that the sender and receiver may
                  prefer different languages. That matters when communication is
                  tied to trust, safety, location context, voice notes, media,
                  and urgent follow-up.
                </p>

                <p>
                  The language layer can store sender preference, receiver
                  preference, translation status, translated text, and source
                  language so the app can explain whether a message is pending,
                  translated, or not needed.
                </p>
              </div>

              <TintedCallout title="Built for Nigeria and global use">
                The current catalog includes Nigerian languages such as Igbo,
                Hausa, and Yoruba, plus Swahili and a broad global language set.
                <em>
                  {" "}
                  StayKnown should remain open to expansion as translation
                  quality, provider coverage, and safety review improve.
                </em>
              </TintedCallout>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MiniStat
                  label="Pro"
                  value="12"
                  detail="Focused language set for practical multilingual chat."
                />
                <MiniStat
                  label="ProMax"
                  value="40"
                  detail="Full current supported language catalog."
                />
                <MiniStat
                  label="Expansion"
                  value="Open"
                  detail="More languages can be added after quality review."
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
                    href="/learn/secure-chat-protection"
                    label="Secure"
                  />
                </div>

                <div className="hidden sm:flex flex-wrap gap-3">
                  <CTA href="/learn/chat" label="Learn: StayKnown Chat" />
                  <CTA
                    href="/learn/secure-chat-protection"
                    label="Learn: Secure Chat Protection"
                  />
                </div>
              </div>
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
                <SectionLabel>Current supported languages</SectionLabel>

                <div className="mt-3 text-[20px] sm:text-[25px] font-black tracking-[-0.045em] leading-tight text-white">
                  {tier === "ProMax"
                    ? "ProMax shows the full language catalog."
                    : tier === "Pro"
                      ? "Pro shows the focused language catalog."
                      : "Starter learns the catalog, while translation remains upgrade value."}
                </div>

                <p className="mt-4 text-[12.7px] leading-relaxed text-white/58 font-medium">
                  Use the tabs above to preview plan-aware language support. The
                  catalog is written clearly for visitors, investors, and users
                  who want to know whether their preferred language is part of
                  the current StayKnown direction.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {(tier === "Starter" ? proLanguages : languageList).map(
                    (lang) => (
                      <LanguagePill key={lang} label={lang} />
                    ),
                  )}
                </div>

                {tier === "Starter" ? (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4 text-[12.3px] leading-relaxed font-medium text-white/50">
                    Starter preview shows the Pro language set for education,
                    but premium translation behavior should remain gated.
                  </div>
                ) : null}
              </div>
            </PremiumPanel>
          </div>

          <div className="mb-6 grid gap-3 md:grid-cols-5">
            <LanguageStep
              n="1"
              title="User preference"
              body="Each user can have a language preference for chat or a thread."
            />
            <LanguageStep
              n="2"
              title="Message sent"
              body="The message stores sender and receiver language context where available."
            />
            <LanguageStep
              n="3"
              title="Translation requested"
              body="If the receiver has a different supported preference, translation can be marked pending."
            />
            <LanguageStep
              n="4"
              title="Result delivered"
              body="Translated text, target language, source language, and status can be patched onto the message."
            />
            <LanguageStep
              n="5"
              title="UI explains"
              body="The app can show translated text, tiny progress states, or retry affordances without confusing the chat."
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <FeatureCard glyph="✔" title="Recipient-first translation">
              Language-Aware Chat should care about the receiver’s selected
              language. The sender can write naturally, while the app prepares
              the message for the person who needs to read it.
              <div className="mt-3 text-white/45">
                This is important in safety conversations, where meaning should
                arrive clearly.
              </div>
            </FeatureCard>

            <FeatureCard glyph="▣" title="Translation status should be visible">
              A message can move through clear states:
              <div className="mt-3 space-y-2 text-white/62">
                <div>• not needed</div>
                <div>• pending</div>
                <div>• done</div>
                <div>• delayed or failed with a tiny retry affordance</div>
              </div>
              <div className="mt-3 text-white/45">
                The UI should stay calm, small, and premium.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⌁" title="Nigerian language support">
              The current catalog includes Igbo, Hausa, and Yoruba. This matters
              because StayKnown’s identity is not only global; it also needs to
              feel useful for Nigerian users and families.
              <div className="mt-3 text-white/45">
                Treat these languages as first-class product entries, not hidden
                experimental extras.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⟡" title="Voice, media, and files">
              Language awareness should not stop at text. Voice notes, media,
              files, and sticker-related context can show translated captions or
              translated text where the app has enough content to translate.
              <div className="mt-3 text-white/45">
                Keep the spinner tiny under the message, then shift layout
                smoothly when the translation arrives.
              </div>
            </FeatureCard>

            <FeatureCard glyph="!" title="Quality and safety boundary">
              Translation helps communication, but it should not be presented as
              perfect legal, medical, or emergency interpretation.
              <div className="mt-3 text-white/45">
                In immediate danger, users should contact local emergency
                services directly and use clear local language where possible.
              </div>
            </FeatureCard>

            <FeatureCard glyph="◌" title="Open to expansion">
              More languages can be added later when support is reliable enough.
              The page should make that future clear without promising every
              language immediately.
              <div className="mt-3 text-white/45">
                Expansion should consider provider coverage, translation
                quality, safety wording, and user demand.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⚖" title="Law-abiding communication">
              Translation should not be used to harass, impersonate, manipulate,
              threaten, or mislead another person. Language support belongs
              inside the same acceptable-use and anti-abuse rules as Chat.
              <div className="mt-3 text-white/45">
                Blocking, reporting, and privacy controls remain important.
              </div>
            </FeatureCard>

            <FeatureCard glyph="✦" title="Investor value">
              Language-Aware Chat helps StayKnown become more than a local
              safety app. It supports families, travel, cross-border
              relationships, diaspora communities, and premium global expansion.
              <div className="mt-3 text-white/45">
                ProMax language depth becomes a strong subscription story.
              </div>
            </FeatureCard>
          </div>

          <div className="mt-6">
            <PremiumPanel>
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <SectionLabel>Related learn pages</SectionLabel>

                  <div className="mt-3 text-[21px] sm:text-[28px] font-black tracking-[-0.045em] leading-tight text-white">
                    Language-Aware Chat connects to Chat, Secure Chat, and
                    profile trust without repeating them.
                  </div>

                  <p className="mt-3 text-[12.8px] leading-relaxed text-white/56 font-medium">
                    Use the linked pages for the communication product,
                    biometric/device protection, and recognition context. This
                    page stays focused on languages, translation status, and
                    multilingual safety communication.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      title: "StayKnown Chat",
                      body: "Messages, media, stickers, stories, and voice notes.",
                      href: "/learn/chat",
                    },
                    {
                      title: "Secure Chat Protection",
                      body: "Biometric-aware and device-level privacy posture.",
                      href: "/learn/secure-chat-protection",
                    },
                    {
                      title: "Stories + Profile Trust",
                      body: "Names, avatars, stories, and recognition cues.",
                      href: "/learn/stories-profile-trust",
                    },
                    {
                      title: "Privacy & Anti-Abuse",
                      body: "Language support must stay lawful and respectful.",
                      href: "/learn/privacy-anti-abuse",
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
                    This page is written for discovery around multilingual
                    safety chat, Nigerian language support, and
                    translation-ready messaging.
                  </div>

                  <p className="mt-3 text-[12.8px] leading-relaxed text-white/56 font-medium">
                    Visitors should understand the value quickly: StayKnown Chat
                    can support language preferences, translation status, Igbo,
                    Hausa, Yoruba, Swahili, global languages, and future
                    expansion for safer communication across different language
                    communities.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "A Pro user chats with a contact who prefers Yoruba while the sender uses English.",
                    "A Pro user keeps Hausa, Igbo, Swahili, Arabic, Hindi, and Urdu available in the focused language set.",
                    "A ProMax user accesses the full language catalog for broader global communication.",
                    "A translated message shows a tiny pending state before the translated text appears smoothly.",
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
                Terms of Service
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
