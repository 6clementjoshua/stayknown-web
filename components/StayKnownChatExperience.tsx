"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import StayKnownChatDemo from "@/components/StayKnownChatDemo";
import {
  STAYKNOWN_CHAT_BOUNDARIES,
  STAYKNOWN_CHAT_FAQS,
  TRUSTED_CIRCLE_CONSENT_STEPS,
  TRUSTED_CIRCLE_ROLES,
} from "@/lib/stayknown-chat-content";

const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.stayknown.app";

type AtlasMode = "direct" | "circle" | "media" | "safety";

const ATLAS = {
  direct: {
    label: "Direct Chat",
    eyebrow: "Recognised one-to-one communication",
    title: "A private conversation begins with an authorised relationship.",
    body:
      "StayKnown connects direct Chat to approved people, visible identity context, protected entry, delivery states, replies, reactions, translation-aware messages, and deliberate safety sharing.",
    image: "/hero/secure-chat-biometric.png",
    imageAlt: "StayKnown protected direct Chat interface",
    points: [
      "Opening a profile does not silently grant private Chat.",
      "The conversation remains isolated from any later Trusted Circle.",
      "Read, delivery, presence, mute, privacy, and notifications remain connected to the correct person and account.",
    ],
  },
  circle: {
    label: "Trusted Circle",
    eyebrow: "Consent-governed multi-member communication",
    title: "Group participation is a permission flow, not an instant add button.",
    body:
      "A Trusted Circle is created beside the founding private conversation—not on top of it. A clear Circle Lead role, required member consent, candidate acceptance, member responsibilities, selective audiences, and separate history protect everyone involved.",
    image: "/hero/chat-translation.png",
    imageAlt: "StayKnown multilingual Chat interface representing Trusted Circle communication",
    points: [
      "The original direct history is never copied into the Circle.",
      "A candidate sees the Circle only after the required consent sequence.",
      "Circle Lead, Steward, and Member capabilities remain explicit.",
    ],
  },
  media: {
    label: "Voice, media & translation",
    eyebrow: "Communication that fits the moment",
    title: "Text is only one way trusted people may need to communicate.",
    body:
      "Voice notes, photos, videos, files, audio, stickers, replies, translation-aware messages, and deliberately shared location help people carry more useful context without scanning private device media in advance.",
    image: "/hero/chat-stickers-voice.png",
    imageAlt: "StayKnown voice notes, stickers, and media Chat interface",
    points: [
      "You choose each attachment through your phone’s photo or file picker.",
      "Location remains a separate, deliberate share action.",
      "Message audience rules also apply to attachments and previews.",
    ],
  },
  safety: {
    label: "Safety boundary",
    eyebrow: "Clear limits around communication",
    title: "Chat supports safety context without pretending to be emergency dispatch.",
    body:
      "StayKnown can connect conversation to recognised people, safety cards, approved-contact context, protected notifications, and precise permission boundaries. It does not guarantee professional monitoring, rescue, or emergency-service response.",
    image: "/hero/contact-approval.png",
    imageAlt: "StayKnown consent-based approved contact interface",
    points: [
      "Circle membership does not create emergency-contact or SOS access.",
      "Safety and location actions remain separate from ordinary membership.",
      "Urgent situations still require the appropriate local emergency service.",
    ],
  },
} satisfies Record<
  AtlasMode,
  {
    label: string;
    eyebrow: string;
    title: string;
    body: string;
    image: string;
    imageAlt: string;
    points: readonly string[];
  }
>;

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="mx-auto max-w-4xl text-center">
      <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#8ff3d0]">
        {eyebrow}
      </div>
      <h2 className="mt-4 text-balance text-[34px] font-black leading-[0.98] tracking-[-0.065em] text-white sm:text-[46px] md:text-[56px]">
        {title}
      </h2>
      <p className="mx-auto mt-5 max-w-[76ch] text-[14px] font-semibold leading-relaxed text-white/60 sm:text-[15px] md:text-[16px]">
        {body}
      </p>
    </div>
  );
}

export default function StayKnownChatExperience() {
  const [atlasMode, setAtlasMode] = useState<AtlasMode>("direct");
  const active = ATLAS[atlasMode];

  return (
    <main className="min-h-screen overflow-x-clip bg-black text-white">
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
          background: #000;
        }

        body {
          margin: 0;
          background: #000;
          color-scheme: dark;
          overflow-x: hidden;
          text-rendering: geometricPrecision;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        #interactive-chat-demo,
        #trusted-circle-consent,
        #roles,
        #privacy-boundaries,
        #chat-faq {
          scroll-margin-top: 88px;
        }
      `}</style>

      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-black/82 backdrop-blur-2xl">
        <div className="mx-auto flex min-h-[68px] max-w-7xl items-center gap-3 px-4 sm:px-5 lg:px-6">
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-2.5 rounded-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
            aria-label="Return to StayKnown homepage"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-[13px] border border-white bg-white shadow-[0_10px_24px_rgba(0,0,0,0.36),inset_0_1px_0_rgba(255,255,255,1),inset_0_-4px_10px_rgba(0,0,0,0.09)]">
              <Image src="/6logo.png" alt="" width={20} height={20} priority />
            </span>
            <span>
              <span className="block text-[12px] font-black tracking-[0.22em] text-white">
                STAYKNOWN
              </span>
              <span className="mt-0.5 hidden text-[9px] font-bold text-white/36 sm:block">
                Chat & Trusted Circles
              </span>
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Chat page sections">
            {[
              ["Demo", "#interactive-chat-demo"],
              ["Consent", "#trusted-circle-consent"],
              ["Roles", "#roles"],
              ["Boundaries", "#privacy-boundaries"],
              ["FAQ", "#chat-faq"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="inline-flex min-h-9 items-center rounded-full px-3 text-[10px] font-black text-white/54 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
              >
                {label}
              </a>
            ))}
          </nav>

          <a
            href={GOOGLE_PLAY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex h-9 items-center rounded-[13px] border border-white bg-white px-3.5 text-[9px] font-black uppercase tracking-[0.08em] text-black shadow-[0_10px_24px_rgba(0,0,0,0.3)] transition hover:-translate-y-px hover:bg-black hover:text-white lg:ml-3"
          >
            Google Play
          </a>
        </div>
      </header>

      <section className="relative isolate overflow-hidden border-b border-white/[0.08]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(143,243,208,0.09),transparent_42%),radial-gradient(circle_at_82%_70%,rgba(255,255,255,0.055),transparent_42%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.86))]" />

        <div className="relative mx-auto grid min-h-[720px] max-w-7xl items-center gap-12 px-4 py-16 sm:px-5 lg:grid-cols-[1.02fr_0.98fr] lg:px-6 lg:py-20">
          <div>
            <div className="inline-flex min-h-8 items-center rounded-full border border-[#8ff3d0]/35 bg-[#8ff3d0]/[0.055] px-3 text-[9px] font-black uppercase tracking-[0.18em] text-[#b9ffe9]">
              Consent-based communication
            </div>
            <h1 className="mt-5 max-w-[13ch] text-balance text-[48px] font-black leading-[0.9] tracking-[-0.075em] text-white sm:text-[64px] lg:text-[78px]">
              Chat built around trust, permission, and real safety boundaries.
            </h1>
            <p className="mt-6 max-w-[62ch] text-[14px] font-semibold leading-relaxed text-white/66 sm:text-[16px]">
              StayKnown combines approved-contact conversations, protected entry, translation-aware messaging, voice and media, and Trusted Circle group communication without turning membership into hidden access.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#interactive-chat-demo"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[15px] border border-white bg-white px-5 text-[10px] font-black uppercase tracking-[0.09em] text-black transition hover:-translate-y-px hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
              >
                Try the interactive demo
                <ArrowIcon />
              </a>
              <a
                href="#trusted-circle-consent"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[15px] border border-white/[0.15] bg-black px-5 text-[10px] font-black uppercase tracking-[0.09em] text-white/66 transition hover:border-white hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
              >
                Understand Circle consent
                <ArrowIcon />
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {[
                "Approved-contact direct Chat",
                "Trusted Circle roles",
                "Selective message audiences",
                "Translation-aware messages",
                "Voice, media, files & location",
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex min-h-8 items-center rounded-full border border-white/[0.11] px-3 text-[8.5px] font-black uppercase tracking-[0.08em] text-white/48"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative min-h-[580px]">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.06]" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8ff3d0]/[0.045] blur-[70px]" />

            <Image
              src="/hero/chat-translation.png"
              alt="StayKnown translated Chat interface"
              width={430}
              height={880}
              quality={90}
              priority
              className="absolute left-1/2 top-1/2 z-20 h-auto w-[250px] -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_42px_90px_rgba(0,0,0,0.92)] sm:w-[300px]"
            />
            <Image
              src="/hero/secure-chat-biometric.png"
              alt=""
              width={330}
              height={680}
              className="absolute left-[1%] top-[14%] z-10 hidden h-auto w-[155px] -rotate-[8deg] object-contain opacity-48 drop-shadow-[0_28px_60px_rgba(0,0,0,0.9)] sm:block"
            />
            <Image
              src="/hero/chat-stickers-voice.png"
              alt=""
              width={330}
              height={680}
              className="absolute bottom-[8%] right-[1%] z-30 hidden h-auto w-[155px] rotate-[8deg] object-contain opacity-54 drop-shadow-[0_28px_60px_rgba(0,0,0,0.9)] sm:block"
            />

            <div className="absolute bottom-5 left-1/2 z-40 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#8ff3d0]/40 bg-black/92 px-3 py-2 text-[8px] font-black uppercase tracking-[0.14em] text-[#b9ffe9] shadow-[0_0_32px_rgba(143,243,208,0.12)]">
              Recognisable people · deliberate access
            </div>
          </div>
        </div>
      </section>

      <StayKnownChatDemo variant="page" />

      <section className="border-y border-white/[0.08] bg-[#050505] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6">
          <SectionHeading
            eyebrow="Chat feature atlas"
            title="Explore each communication boundary without losing the full picture."
            body="Switch between direct Chat, Trusted Circles, expressive communication, and the safety boundary that keeps communication helpful without overstating what the app can do."
          />

          <div className="mt-9 flex flex-wrap justify-center gap-2">
            {(Object.keys(ATLAS) as AtlasMode[]).map((mode) => {
              const selected = mode === atlasMode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setAtlasMode(mode)}
                  aria-pressed={selected}
                  className={`inline-flex min-h-10 items-center rounded-[14px] border px-4 text-[9px] font-black uppercase tracking-[0.1em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8ff3d0]/45 ${
                    selected
                      ? "border-white bg-white text-black"
                      : "border-white/[0.13] bg-black text-white/48 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {ATLAS[mode].label}
                </button>
              );
            })}
          </div>

          <div className="mt-6 grid overflow-hidden rounded-[34px] border border-white/[0.13] bg-black shadow-[0_34px_100px_rgba(0,0,0,0.68)] lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative min-h-[550px] overflow-hidden border-b border-white/[0.09] lg:min-h-[650px] lg:border-b-0 lg:border-r">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(143,243,208,0.07),transparent_48%)]" />
              <Image
                key={active.image}
                src={active.image}
                alt={active.imageAlt}
                width={430}
                height={880}
                quality={90}
                className="absolute left-1/2 top-1/2 h-auto w-[245px] -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_42px_90px_rgba(0,0,0,0.92)] sm:w-[290px]"
              />
            </div>

            <div className="flex min-h-[550px] flex-col p-6 sm:p-8 lg:min-h-[650px] lg:p-10">
              <div className="text-[9px] font-black uppercase tracking-[0.22em] text-[#8ff3d0]">
                {active.eyebrow}
              </div>
              <h3 className="mt-4 max-w-[16ch] text-balance text-[36px] font-black leading-[0.96] tracking-[-0.06em] text-white sm:text-[46px]">
                {active.title}
              </h3>
              <p className="mt-5 max-w-[64ch] text-[13px] font-semibold leading-relaxed text-white/58 sm:text-[14px]">
                {active.body}
              </p>

              <div className="mt-7 grid gap-3">
                {active.points.map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-3 rounded-[19px] border border-white/[0.11] bg-[#050505] p-4"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] border border-[#8ff3d0]/38 text-[#8ff3d0]">
                      <CheckIcon />
                    </span>
                    <span className="text-[12px] font-semibold leading-relaxed text-white/62">
                      {point}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-8">
                <a
                  href={GOOGLE_PLAY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-[15px] border border-white bg-white px-5 text-[10px] font-black uppercase tracking-[0.09em] text-black transition hover:-translate-y-px hover:bg-black hover:text-white"
                >
                  Open StayKnown on Google Play
                  <ArrowIcon />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="trusted-circle-consent" className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[620px] w-[980px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8ff3d0]/[0.035] blur-[140px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-5 lg:px-6">
          <SectionHeading
            eyebrow="Trusted Circle consent bridge"
            title="Adding one person is a sequence of independent decisions."
            body="StayKnown avoids the unsafe pattern where one member can expose everyone else to a stranger with a single tap. The invitation moves only after the required Circle-specific reviews are complete."
          />

          <div className="mt-11 grid gap-3 lg:grid-cols-5">
            {TRUSTED_CIRCLE_CONSENT_STEPS.map((item, index) => (
              <article
                key={item.number}
                className="relative overflow-hidden rounded-[25px] border border-white/[0.1] bg-[#050505] p-5 shadow-[0_22px_64px_rgba(0,0,0,0.4)]"
              >
                <div className="absolute right-4 top-2 text-[42px] font-black tracking-[-0.08em] text-white/[0.045]">
                  {item.number}
                </div>
                <div className="relative">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-[#8ff3d0]/35 text-[9px] font-black text-[#b9ffe9]">
                    {item.number}
                  </span>
                  <h3 className="mt-5 text-[17px] font-black leading-tight tracking-[-0.03em] text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[11.5px] font-semibold leading-relaxed text-white/52">
                    {item.body}
                  </p>
                </div>
                {index < TRUSTED_CIRCLE_CONSENT_STEPS.length - 1 ? (
                  <div className="pointer-events-none absolute -right-3 top-1/2 hidden h-px w-6 bg-[#8ff3d0]/35 lg:block" />
                ) : null}
              </article>
            ))}
          </div>

          <div className="mx-auto mt-6 max-w-4xl rounded-[24px] border border-[#8ff3d0]/25 bg-[#8ff3d0]/[0.045] p-5 text-center">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#8ff3d0]">
              Declines remain respected
            </div>
            <p className="mt-3 text-[12px] font-semibold leading-relaxed text-white/62">
              A decline does not require a public reason. The Circle receives a neutral status update, and the same Circle cannot immediately pressure the person with repeated invitations.
            </p>
          </div>
        </div>
      </section>

      <section id="roles" className="border-y border-white/[0.08] bg-[#050505] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6">
          <SectionHeading
            eyebrow="Circle roles and responsibilities"
            title="Every Circle responsibility has a clear owner."
            body="The Circle Lead remains responsible for the Circle, Stewards help only with assigned tasks, and Members keep the boundaries they accepted."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {TRUSTED_CIRCLE_ROLES.map((role, index) => (
              <article
                key={role.role}
                className={`rounded-[30px] border p-6 shadow-[0_24px_74px_rgba(0,0,0,0.42)] ${
                  index === 0
                    ? "border-white bg-white text-black"
                    : "border-white/[0.1] bg-black text-white"
                }`}
              >
                <div className={`text-[9px] font-black uppercase tracking-[0.2em] ${index === 0 ? "text-black/44" : "text-[#8ff3d0]/72"}`}>
                  {role.label}
                </div>
                <h3 className="mt-3 text-[28px] font-black tracking-[-0.055em]">
                  {role.role}
                </h3>
                <p className={`mt-4 text-[13px] font-semibold leading-relaxed ${index === 0 ? "text-black/62" : "text-white/56"}`}>
                  {role.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="privacy-boundaries" className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6">
          <SectionHeading
            eyebrow="What membership never means"
            title="Clear permission limits are part of the product—not fine print."
            body="The safest communication system explains what does not happen. These boundaries keep a Trusted Circle from silently becoming a surveillance, contact, or private-message shortcut."
          />

          <div className="mx-auto mt-10 grid max-w-5xl gap-3 sm:grid-cols-2">
            {STAYKNOWN_CHAT_BOUNDARIES.map((boundary, index) => (
              <div
                key={boundary}
                className="flex items-start gap-3 rounded-[22px] border border-white/[0.1] bg-[#050505] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] border border-[#8ff3d0]/35 text-[9px] font-black text-[#b9ffe9]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-[12px] font-semibold leading-relaxed text-white/62">
                  {boundary}
                </span>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-[30px] border border-white/[0.11] bg-white text-black shadow-[0_30px_90px_rgba(0,0,0,0.52)]">
            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
              <div>
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-black/42">
                  Plans and availability
                </div>
                <h3 className="mt-3 text-balance text-[32px] font-black leading-[0.98] tracking-[-0.055em] sm:text-[40px]">
                  The StayKnown app shows the Chat features available to your account.
                </h3>
                <p className="mt-4 text-[12.5px] font-semibold leading-relaxed text-black/58">
                  Direct Chat, Trusted Circle access, member capacity, invitation eligibility, and advanced controls can vary by plan and account eligibility. Open StayKnown to see your current options.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <a
                  href={GOOGLE_PLAY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[15px] border border-black bg-black px-5 text-[10px] font-black uppercase tracking-[0.09em] text-white transition hover:-translate-y-px hover:bg-white hover:text-black"
                >
                  Open StayKnown on Google Play
                  <ArrowIcon />
                </a>
                <Link
                  href="/plans"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[15px] border border-black/[0.12] px-5 text-[10px] font-black uppercase tracking-[0.09em] text-black/62 transition hover:border-black hover:text-black"
                >
                  Compare StayKnown plans
                  <ArrowIcon />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="chat-faq" className="border-t border-white/[0.08] bg-[#050505] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-5 lg:px-6">
          <SectionHeading
            eyebrow="Chat questions answered"
            title="Understand the boundary before depending on the conversation."
            body="These answers explain who can start direct Chat, how Trusted Circle consent works, who sees selected messages, how location is shared, how histories stay separate, and what StayKnown does not replace."
          />

          <div className="mt-9 grid gap-3">
            {STAYKNOWN_CHAT_FAQS.map((faq, index) => (
              <details
                key={faq.question}
                className="group overflow-hidden rounded-[22px] border border-white/[0.1] bg-black transition open:border-white/[0.2] open:bg-white/[0.035]"
              >
                <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 px-4 py-3 marker:hidden sm:px-5 [&::-webkit-details-marker]:hidden">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-white/[0.11] text-[8px] font-black text-[#b9ffe9]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1 text-[12.5px] font-black leading-snug text-white/82 sm:text-[13.5px]">
                    {faq.question}
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.1] text-[17px] text-white/44 transition group-open:rotate-45 group-open:text-white">
                    +
                  </span>
                </summary>
                <div className="border-t border-white/[0.08] px-4 pb-5 pt-4 sm:px-5">
                  <p className="text-[12px] font-semibold leading-relaxed text-white/58 sm:text-[13px]">
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-white/[0.08] py-16 sm:py-20">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8ff3d0]/[0.045] blur-[120px]" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-5">
          <div className="text-[10px] font-black uppercase tracking-[0.26em] text-[#8ff3d0]">
            Stay connected with intention
          </div>
          <h2 className="mt-4 text-balance text-[38px] font-black leading-[0.96] tracking-[-0.065em] text-white sm:text-[52px]">
            Communication becomes safer when every person can see the boundary.
          </h2>
          <p className="mx-auto mt-5 max-w-[68ch] text-[14px] font-semibold leading-relaxed text-white/58">
            Download StayKnown to explore the communication features available to your account. StayKnown does not replace local emergency services or guarantee professional emergency response.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={GOOGLE_PLAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[15px] border border-white bg-white px-5 text-[10px] font-black uppercase tracking-[0.09em] text-black transition hover:-translate-y-px hover:bg-black hover:text-white"
            >
              Get StayKnown on Google Play
              <ArrowIcon />
            </a>
            <Link
              href="/trust-safety"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[15px] border border-white/[0.15] px-5 text-[10px] font-black uppercase tracking-[0.09em] text-white/62 transition hover:border-white hover:text-white"
            >
              Read Trust & Safety
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.08] bg-black">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-center text-[10px] font-semibold text-white/34 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:text-left lg:px-6">
          <span>StayKnown™ · Consent-based safety and communication</span>
          <span>A 6 Clement Joshua service™ · stay-known.com</span>
        </div>
      </footer>
    </main>
  );
}
