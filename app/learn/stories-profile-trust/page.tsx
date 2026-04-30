"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Tier = "Starter" | "Pro" | "ProMax";

const seo = {
  title:
    "Stories + Profile Trust | StayKnown Identity, Stories, Recognition, and Safety Context",
  description:
    "Learn how StayKnown Stories and profile trust help users recognize each other through names, avatars, verified cues, story media, places, viewers, likes, reports, and safety-aware communication.",
  url: "https://stay-known.com/learn/stories-profile-trust",
  image: "https://stay-known.com/hero/stories-profile.png",
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
              PROFILE DEPTH
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

function StoryStep({
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

function StorySignalCard({
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
        <SectionLabel>Trust assurance</SectionLabel>

        <div className="mt-3 text-[19px] sm:text-[24px] font-black tracking-[-0.045em] leading-tight text-white">
          “Before I message, reply, or react, I want to recognize the person —
          not just see a random username.”
        </div>

        <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
          <p>
            Stories and profile trust help StayKnown feel more human. A story
            can show a real moment, a place label, a caption, a verified cue, an
            avatar, and a name that makes the person easier to recognize.
          </p>

          <p>
            The feature is not only about posting. It supports trust,
            recognition, safety-aware communication, story replies, and
            confidence before a chat or safety relationship becomes active.
          </p>
        </div>
      </div>
    </PremiumPanel>
  );
}

export default function LearnStoriesProfileTrustPage() {
  const [tier, setTier] = useState<Tier>("Pro");

  const tierCopy = useMemo(() => {
    return {
      Starter: [
        "Starter can keep the profile foundation simple: avatar, first name, last name, username, and basic identity cues.",
        "Starter may have limited story viewing or story-related surfaces depending on the app’s current plan rules.",
        "The public learn page should still explain why stories and profile trust matter before users upgrade.",
        "Starter users should understand that profile clarity supports safer communication and reduces confusion.",
      ],
      Pro: [
        "Pro can unlock story viewing and story-linked communication as part of the stronger chat and trust experience.",
        "Stories can support image or video media, captions, place labels, overlays, seen states, and story replies.",
        "Pro users benefit from profile cues such as avatar, first and last name, username, and verified status when available.",
        "Pro makes the communication layer feel more alive while still respecting safety, reporting, and privacy boundaries.",
      ],
      ProMax: [
        "ProMax should present the richest story and profile-trust posture across premium chat, stories, profile recognition, and polished identity surfaces.",
        "Best for users who want stronger recognition, more expressive communication, story context, and premium presentation.",
        "Pairs naturally with Safety Gallery, contact approval, secure chat protection, language-aware chat, and ProMax shell effects.",
        "ProMax should make stories feel premium and trustworthy without turning them into unsafe public surveillance or uncontrolled exposure.",
      ],
    } as Record<Tier, string[]>;
  }, []);

  const tierNote: Record<Tier, string> = useMemo(
    () => ({
      Starter:
        "Starter should still keep profile identity clean, because names and avatars affect trust even before premium story features are unlocked.",
      Pro: "Stories should remain tied to respectful communication, reporting, and safety-aware profile recognition.",
      ProMax:
        "ProMax can make the story layer richer, but privacy, abuse reporting, and lawful communication remain mandatory boundaries.",
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
      "StayKnown Stories",
      "profile trust",
      "story replies",
      "story viewers",
      "story likes",
      "verified profile",
      "avatar recognition",
      "safety communication",
      "trusted chat",
      "profile identity",
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
              Learn • Stories + Profile Trust
            </div>
          </div>

          <div className="sm:hidden mt-3 flex items-center justify-between">
            <MobileNavLink href="/" label="Back to Home" />
            <MobileNavLink
              href="/learn/get-safe-guidance"
              label="Next: Guidance"
            />
          </div>

          <div className="hidden sm:flex mt-5 items-center justify-center gap-3">
            <CTA href="/" label="Back to Home" />
            <CTA
              href="/learn/language-aware-chat"
              label="Language-Aware Chat"
            />
            <CTA
              href="/learn/get-safe-guidance"
              label="Next: Get Safe Guidance"
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
                Identity, stories, recognition, and trust
              </div>

              <h1 className="mt-4 text-white/95 font-black tracking-[-0.06em] text-[38px] sm:text-[54px] lg:text-[60px] leading-[0.94]">
                Stories + Profile Trust
              </h1>

              <div className="mt-4 max-w-[76ch] space-y-3 text-white/62 font-medium text-[13px] sm:text-[14px] leading-relaxed">
                <p>
                  StayKnown Stories help people feel recognizable before they
                  communicate. A story can carry a profile image, first and last
                  name, username, verified cue, caption, place label, media, and
                  viewer context.
                </p>

                <p>
                  This makes stories more than entertainment. They become a
                  trust surface that supports safer chat, contact confidence,
                  story replies, and recognition inside the wider StayKnown
                  safety network.
                </p>
              </div>

              <TintedCallout title="The product boundary">
                Stories should support trust and recognition, not stalking,
                pressure, exposure, harassment, or unsafe public tracking.{" "}
                <em>
                  Story context should stay tied to respectful, lawful,
                  safety-aware communication.
                </em>
              </TintedCallout>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MiniStat
                  label="Identity"
                  value="Profile"
                  detail="Names, avatars, usernames, and verified cues support recognition."
                />
                <MiniStat
                  label="Story"
                  value="Media"
                  detail="Image or video stories can include captions, place, and overlays."
                />
                <MiniStat
                  label="Trust"
                  value="Signals"
                  detail="Seen states, viewers, likes, reports, and replies add context."
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
                  <MobileNavLink href="/learn/safety-gallery" label="Gallery" />
                </div>

                <div className="hidden sm:flex flex-wrap gap-3">
                  <CTA href="/learn/chat" label="Learn: StayKnown Chat" />
                  <CTA
                    href="/learn/safety-gallery"
                    label="Learn: Safety Gallery"
                  />
                </div>
              </div>
            </div>

            <div className="order-2 lg:order-none lg:col-start-1 flex items-start justify-center lg:justify-start">
              <img
                src="/hero/stories-profile.png"
                alt="StayKnown stories and profile trust"
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
                <SectionLabel>Profile foundation</SectionLabel>

                <div className="mt-3 text-[20px] sm:text-[25px] font-black tracking-[-0.045em] leading-tight text-white">
                  A story is easier to trust when it is connected to a clear
                  profile.
                </div>

                <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
                  <p>
                    The story layer can load the user’s avatar, first name, last
                    name, username, and verified status so story surfaces do not
                    feel anonymous or confusing.
                  </p>

                  <p>
                    That is important in Chat. The story strip should show the
                    person’s first and last name when available, or first name
                    only. The username should be a fallback when no name exists.
                  </p>
                </div>
              </div>
            </PremiumPanel>
          </div>

          <div className="mb-6 grid gap-3 md:grid-cols-5">
            <StoryStep
              n="1"
              title="Profile loads"
              body="Avatar, first name, last name, username, and verified cue create recognition context."
            />
            <StoryStep
              n="2"
              title="Story is created"
              body="The user publishes image or video story media with caption, place, overlays, and duration rules."
            />
            <StoryStep
              n="3"
              title="Feed displays"
              body="Active story feed shows recognizable people, not anonymous content blocks."
            />
            <StoryStep
              n="4"
              title="Engagement tracks"
              body="Seen states, segment viewers, likes, story replies, and notifications create useful interaction context."
            />
            <StoryStep
              n="5"
              title="Safety remains"
              body="Delete, report, abuse boundaries, and privacy expectations keep the feature responsible."
            />
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StorySignalCard
              label="Story signal"
              title="Caption"
              body="Captions help explain the moment without forcing a chat message first."
            />
            <StorySignalCard
              label="Story signal"
              title="Place label"
              body="Place context can support safety awareness when location permission and reverse geocoding allow it."
            />
            <StorySignalCard
              label="Story signal"
              title="Overlays"
              body="Overlays can make stories feel expressive while keeping the story surface polished."
            />
            <StorySignalCard
              label="Story signal"
              title="Seen + viewers"
              body="Seen states and segment viewers help users understand who interacted with the story."
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <FeatureCard glyph="▣" title="Image and video stories">
              Stories can use image or video media. Image duration should stay
              short and readable, while video duration should stay controlled so
              the feed feels smooth.
              <div className="mt-3 text-white/45">
                This keeps the product premium instead of letting stories feel
                heavy or uncontrolled.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⌁" title="Place-aware story context">
              A story can include a place label when the app has enough location
              context. This can help trusted people understand where a moment
              happened without turning stories into unsafe tracking.
              <div className="mt-3 text-white/45">
                Place context should remain respectful, consent-aware, and tied
                to the user’s own story.
              </div>
            </FeatureCard>

            <FeatureCard glyph="✔" title="Profile names should feel human">
              Story labels should prefer first and last name when available,
              first name when that is all the app has, and username only as a
              fallback.
              <div className="mt-3 text-white/45">
                This avoids making the story strip feel cold or overly
                username-driven.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⟡" title="Story replies feed Chat">
              Story replies can open or create the direct thread with the story
              owner, carrying story metadata so the reply has context.
              <div className="mt-3 text-white/45">
                This connects Stories to Chat without making stories replace
                private conversation.
              </div>
            </FeatureCard>

            <FeatureCard glyph="◌" title="Likes, viewers, and seen states">
              Segment viewers, likes, and seen states help the story feel alive.
              They also help users understand who has interacted with their
              content.
              <div className="mt-3 text-white/45">
                Keep these surfaces small, calm, and privacy-aware.
              </div>
            </FeatureCard>

            <FeatureCard glyph="!" title="Delete and report controls">
              Users need control over their own stories, and viewers need a way
              to report misuse.
              <div className="mt-3 space-y-2 text-white/62">
                <div>• delete own story</div>
                <div>• delete own story media</div>
                <div>• report story or story segment</div>
                <div>• keep abuse review accessible</div>
              </div>
            </FeatureCard>

            <FeatureCard glyph="⚖" title="Law-abiding story use">
              Stories must not be used for harassment, stalking, shaming,
              impersonation, non-consensual exposure, threats, or unsafe
              location pressure.
              <div className="mt-3 text-white/45">
                Profile trust only works when story behavior stays respectful
                and policy-aware.
              </div>
            </FeatureCard>

            <FeatureCard glyph="✦" title="Investor value">
              Stories make StayKnown more than an emergency utility. They create
              recurring profile engagement, recognition, trust, and chat
              activity while still connecting back to the safety mission.
              <div className="mt-3 text-white/45">
                This gives Pro and ProMax more daily value beyond rare emergency
                moments.
              </div>
            </FeatureCard>
          </div>

          <div className="mt-6">
            <PremiumPanel>
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <SectionLabel>Related learn pages</SectionLabel>

                  <div className="mt-3 text-[21px] sm:text-[28px] font-black tracking-[-0.045em] leading-tight text-white">
                    Stories support Chat, Safety Gallery, and profile trust
                    without replacing those pages.
                  </div>

                  <p className="mt-3 text-[12.8px] leading-relaxed text-white/56 font-medium">
                    Use the linked pages to understand the wider communication
                    and recognition system. This page stays focused on stories,
                    identity cues, viewers, replies, and profile trust.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      title: "StayKnown Chat",
                      body: "Stories can become private replies and conversation context.",
                      href: "/learn/chat",
                    },
                    {
                      title: "Safety Gallery",
                      body: "Recognition images support trusted identity context.",
                      href: "/learn/safety-gallery",
                    },
                    {
                      title: "Language-Aware Chat",
                      body: "Story replies and chats can benefit from language preference.",
                      href: "/learn/language-aware-chat",
                    },
                    {
                      title: "Privacy & Anti-Abuse",
                      body: "Stories need clear lawful-use boundaries.",
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
                    This page is written for discovery around story trust,
                    profile recognition, story replies, and safety-aware social
                    context.
                  </div>

                  <p className="mt-3 text-[12.8px] leading-relaxed text-white/56 font-medium">
                    Visitors should understand the value quickly: StayKnown
                    Stories help people recognize each other through profile
                    identity, media, captions, places, viewers, and replies
                    while keeping safety, privacy, and abuse reporting in view.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "A user posts an image story with a caption and place label so trusted people recognize the moment.",
                    "A viewer replies to a story and the reply opens a private chat with story context.",
                    "A profile shows first and last name where available so story labels feel human.",
                    "A user reports a story segment that appears abusive, misleading, or unsafe.",
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
