"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Tier = "Starter" | "Pro" | "ProMax";

const seo = {
  title: "GET SAFE | StayKnown Safety Mission by 6 Clement Joshua",
  description:
    "GET SAFE is the StayKnown mission: helping people move, visit, communicate, and share safety context with trusted people wherever they go.",
  url: "https://stay-known.com/learn/get-safe-guidance",
  image: "https://stay-known.com/hero/get-safe-hints.png",
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
              FULL MISSION
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

function MissionStep({
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
        <SectionLabel>Opening mission</SectionLabel>

        <div className="mt-3 text-[19px] sm:text-[24px] font-black tracking-[-0.045em] leading-tight text-white">
          “Wherever people go — to visit, meet, travel, work, commute, chat, or
          check in — they deserve tools that help them get safe and stay known.”
        </div>

        <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
          <p>
            GET SAFE is the warm introduction to StayKnown. It explains why the
            app exists before a visitor enters the deeper feature slides.
          </p>

          <p>
            The message is simple: 6 Clement Joshua designed StayKnown to help
            people move with more confidence, communicate with trusted people,
            and share safety context in a lawful, consent-aware way.
          </p>
        </div>
      </div>
    </PremiumPanel>
  );
}

export default function LearnGetSafeGuidancePage() {
  const [tier, setTier] = useState<Tier>("Starter");

  const tierCopy = useMemo(() => {
    return {
      Starter: [
        "Starter introduces the basic safety foundation: create a profile, add trusted contacts, and use essential Visit safety flows.",
        "It helps people understand the mission before they move into stronger paid safety tools.",
        "Starter keeps the entry point accessible while making the value of Pro and ProMax clear.",
        "The message is simple: safety should be understandable before it becomes premium.",
      ],
      Pro: [
        "Pro strengthens the GET SAFE mission with deeper safety readiness: SOS, more manual captures, secure chat, translation-ready communication, and stronger trusted-contact workflows.",
        "It is designed for people who want more than basic check-ins when they visit, travel, commute, or meet others.",
        "Pro makes StayKnown feel like a practical daily safety companion, not only an emergency app.",
        "It helps users stay connected to trusted people while keeping the app serious, lawful, and safety-aware.",
      ],
      ProMax: [
        "ProMax represents the most complete GET SAFE posture across Visits, LIVE sharing, SOS, chat, stories, stickers, translation, profile trust, and premium UI.",
        "It is built for users who want the richest safety and communication experience with the highest polish.",
        "ProMax should feel like the full 6 Clement Joshua safety vision: premium, human, global, and trust-centered.",
        "It is the strongest plan for people who want StayKnown to support movement, communication, recognition, and emergency readiness together.",
      ],
    } as Record<Tier, string[]>;
  }, []);

  const tierNote: Record<Tier, string> = useMemo(
    () => ({
      Starter:
        "Starter is the open door into the StayKnown safety mission. It should feel welcoming, not limited or confusing.",
      Pro: "Pro is where the mission becomes stronger for people who need more safety capacity and communication depth.",
      ProMax:
        "ProMax is the full premium StayKnown experience, but lawful use, privacy, and consent remain the foundation.",
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
      "GET SAFE",
      "StayKnown safety mission",
      "6 Clement Joshua",
      "personal safety app",
      "visit safety",
      "live location sharing",
      "SOS safety",
      "secure chat",
      "trusted contacts",
      "safety communication",
      "anti-abuse safety app",
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
              Learn • GET SAFE
            </div>
          </div>

          <div className="sm:hidden mt-3 flex items-center justify-between">
            <MobileNavLink href="/" label="Back to Home" />
            <MobileNavLink href="/learn/visit-live" label="Next: Visit" />
          </div>

          <div className="hidden sm:flex mt-5 items-center justify-center gap-3">
            <CTA href="/" label="Back to Home" />
            <CTA href="/learn/visit-live" label="Start: Visit + LIVE" />
            <CTA href="/learn/chat" label="Explore: Chat" />
          </div>
        </div>
      </header>

      <section className="relative w-full pb-10 sm:pb-12 lg:pb-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.065),transparent_58%)]" />

        <div className="mx-auto max-w-6xl px-4 pt-8 pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] items-start gap-8 lg:gap-8">
            <div className="order-1 lg:order-none lg:col-start-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[10.5px] font-black tracking-[0.20em] text-white/46 uppercase">
                A 6 Clement Joshua safety mission
              </div>

              <h1 className="mt-4 whitespace-nowrap text-white/95 font-black tracking-[-0.08em] text-[52px] sm:text-[82px] lg:text-[96px] xl:text-[108px] leading-[0.82]">
                GET SAFE
              </h1>

              <div className="mt-5 max-w-[76ch] space-y-3 text-white/62 font-medium text-[13px] sm:text-[14px] leading-relaxed">
                <p>
                  StayKnown begins with a human promise: help people get safe
                  wherever they go. Whether someone is visiting a friend,
                  entering a ride, walking at night, meeting a new person,
                  traveling, chatting, or checking in with family, safety should
                  feel closer and clearer.
                </p>

                <p>
                  6 Clement Joshua created StayKnown to bring Visits, LIVE
                  sharing, SOS readiness, trusted contacts, safety gallery,
                  secure chat, translation, stories, stickers, and profile trust
                  into one connected safety experience.
                </p>
              </div>

              <TintedCallout title="The warm-up page for everything that follows">
                This page introduces the mission before the visitor enters the
                detailed slides.{" "}
                <em>
                  StayKnown is built for lawful, consent-aware, human safety —
                  not stalking, pressure, secret tracking, or abuse.
                </em>
              </TintedCallout>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MiniStat
                  label="Mission"
                  value="Get Safe"
                  detail="Help people move, visit, and communicate with more confidence."
                />
                <MiniStat
                  label="Network"
                  value="Trusted"
                  detail="Safety works better when trusted people understand the context."
                />
                <MiniStat
                  label="Platform"
                  value="StayKnown"
                  detail="Visits, SOS, chat, stories, and recognition in one safety app."
                />
              </div>

              <div className="mt-7">
                <SectionLabel>Mission by plan</SectionLabel>

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
                  <MobileNavLink href="/learn/visit-live" label="Visit" />
                  <MobileNavLink href="/learn/sos" label="SOS" />
                </div>

                <div className="hidden sm:flex flex-wrap gap-3">
                  <CTA href="/learn/visit-live" label="Learn: Visit + LIVE" />
                  <CTA href="/learn/sos" label="Learn: SOS Active State" />
                </div>
              </div>
            </div>

            <div className="order-2 lg:order-none lg:col-start-1 flex items-start justify-center lg:justify-start lg:-translate-y-[1100px] xl:-translate-y-[860px] 2xl:-translate-y-[980px]">
              <img
                src="/hero/get-safe-hints.png"
                alt="GET SAFE StayKnown safety mission"
                draggable={false}
                className="
      block object-contain select-none
      drop-shadow-[0_26px_95px_rgba(0,0,0,0.78)]
      max-w-[86vw] max-h-[44vh]
      sm:max-w-[560px] sm:max-h-[62vh]
      lg:max-w-[720px] lg:max-h-[74vh]
      xl:max-w-[780px]
      transform-gpu transition duration-700 ease-out hover:scale-[1.01]
    "
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full -mt-[420px] lg:-mt-[500px] xl:-mt-[760px] 2xl:-mt-[880px]">
        <div className="mx-auto max-w-6xl px-4 pb-10 sm:pb-14">
          <div className="mb-5 grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-5">
            <ScenarioBox />

            <PremiumPanel>
              <div className="p-5 sm:p-6">
                <SectionLabel>Why StayKnown exists</SectionLabel>

                <div className="mt-3 text-[20px] sm:text-[25px] font-black tracking-[-0.045em] leading-tight text-white">
                  The world does not only need emergency buttons. People need
                  safety presence before, during, and after movement.
                </div>

                <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
                  <p>
                    Many safety moments begin quietly. A person starts a visit,
                    enters a new place, shares a location, sends a message,
                    waits outside, takes a ride, or asks someone trusted to stay
                    aware.
                  </p>

                  <p>
                    StayKnown is built around that reality. It combines everyday
                    communication with safety states so people can feel less
                    alone when movement matters.
                  </p>
                </div>
              </div>
            </PremiumPanel>
          </div>

          <div className="mb-6 grid gap-3 md:grid-cols-5">
            <MissionStep
              n="1"
              title="Move"
              body="People go places every day: visits, rides, errands, work, school, meetings, and travel."
            />
            <MissionStep
              n="2"
              title="Share"
              body="A Visit or LIVE link can keep trusted people aware while movement is active."
            />
            <MissionStep
              n="3"
              title="Escalate"
              body="SOS, manual capture, and verified stop create stronger safety states when attention matters."
            />
            <MissionStep
              n="4"
              title="Communicate"
              body="Chat, voice notes, stickers, stories, and translation help trusted people stay connected."
            />
            <MissionStep
              n="5"
              title="Trust"
              body="Contact approval, safety gallery, profile recognition, VPN policy, and anti-abuse rules protect the mission."
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <FeatureCard glyph="▣" title="Visits and LIVE sharing">
              StayKnown starts with movement. A user can begin a Visit so
              trusted people understand that a safety session is active.
              <div className="mt-3 text-white/45">
                LIVE sharing turns “I am going somewhere” into a clearer safety
                signal.
              </div>
            </FeatureCard>

            <FeatureCard glyph="!" title="SOS and urgent attention">
              Some moments need stronger attention. SOS helps the app shift from
              ordinary safety context into an urgent safety posture.
              <div className="mt-3 text-white/45">
                It is not a replacement for emergency services, but it gives
                trusted people clearer context when the user needs help.
              </div>
            </FeatureCard>

            <FeatureCard glyph="✔" title="Manual Capture and Verified Stop">
              Manual Capture lets a user send one more safety checkpoint.
              Verified Stop makes sensitive endings more deliberate.
              <div className="mt-3 text-white/45">
                Together, they help StayKnown think about the full safety
                lifecycle: start, update, escalate, and finish.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⌁" title="Chat, voice, stickers, and stories">
              Safety does not end with alerts. People also need conversation:
              voice notes, media, stickers, story replies, profile context, and
              trusted communication.
              <div className="mt-3 text-white/45">
                This gives StayKnown daily usefulness beyond rare emergency
                moments.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⟡" title="Language and humanity">
              People do not all speak the same language. Language-aware chat
              helps trusted users communicate across English, Nigerian
              languages, African languages, and global language preferences.
              <div className="mt-3 text-white/45">
                StayKnown should remain open to language expansion as quality
                and safety checks improve.
              </div>
            </FeatureCard>

            <FeatureCard glyph="◌" title="Trust and recognition">
              Contact approval, Safety Gallery, first and last names, avatars,
              verified cues, and story context help users know who they are
              helping or speaking with.
              <div className="mt-3 text-white/45">
                Safety becomes stronger when people are recognizable and
                relationships are consent-aware.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⚖" title="Law-abiding safety mission">
              StayKnown is for lawful, consent-aware personal safety. It must
              not be used for stalking, coercion, harassment, secret tracking,
              impersonation, threats, or abuse.
              <div className="mt-3 text-white/45">
                Abuse reporting, privacy rules, emergency disclaimers, child
                safety, law enforcement, and data retention pages should remain
                visible and easy to reach.
              </div>
            </FeatureCard>

            <FeatureCard glyph="✦" title="Investor and visitor value">
              GET SAFE explains the whole product in one human sentence before
              features become technical. It shows that StayKnown is not only a
              map, not only a chat, and not only an SOS button.
              <div className="mt-3 text-white/45">
                It is a safety-first platform with recurring use, premium plan
                depth, trust controls, and communication value.
              </div>
            </FeatureCard>
          </div>

          <div className="mt-6">
            <PremiumPanel>
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <SectionLabel>Start exploring</SectionLabel>

                  <div className="mt-3 text-[21px] sm:text-[28px] font-black tracking-[-0.045em] leading-tight text-white">
                    GET SAFE should be the first slide because it explains the
                    “why” before the visitor sees the “how.”
                  </div>

                  <p className="mt-3 text-[12.8px] leading-relaxed text-white/56 font-medium">
                    After this mission slide, the learn flow can move into Visit
                    + LIVE, SOS, Manual Capture, Verified Stop, Contact
                    Approval, Safety Gallery, VPN Safety, Chat, Language,
                    Stories, Plans, Privacy, and the larger StayKnown vision.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      title: "Visit + LIVE",
                      body: "Start with movement and trusted visibility.",
                      href: "/learn/visit-live",
                    },
                    {
                      title: "SOS Active State",
                      body: "Understand urgent safety posture.",
                      href: "/learn/sos",
                    },
                    {
                      title: "StayKnown Chat",
                      body: "See communication, stickers, voice, and stories.",
                      href: "/learn/chat",
                    },
                    {
                      title: "Privacy & Anti-Abuse",
                      body: "Understand lawful and consent-aware boundaries.",
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
                    This page is written for discovery around the StayKnown
                    mission, personal safety, visits, SOS, secure chat, and
                    trusted movement.
                  </div>

                  <p className="mt-3 text-[12.8px] leading-relaxed text-white/56 font-medium">
                    Visitors should understand the message quickly: GET SAFE is
                    the reason StayKnown exists. 6 Clement Joshua designed the
                    app to help people move, visit, communicate, and stay
                    connected to trusted people wherever they go.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "A visitor understands the StayKnown mission before seeing individual features.",
                    "A parent sees how Visits, chat, and trusted contacts can support safer movement.",
                    "An investor sees that StayKnown is a platform, not a single emergency button.",
                    "A law or policy reader sees that the product is built around lawful safety and anti-abuse boundaries.",
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
