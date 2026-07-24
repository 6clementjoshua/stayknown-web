"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.stayknown.app";

type AboutIcon =
  | "mission"
  | "consent"
  | "context"
  | "response"
  | "completion"
  | "founder"
  | "android"
  | "shield"
  | "arrow"
  | "check"
  | "spark";

type StoryTab = "why" | "how" | "what" | "boundary";

const STORY = {
  why: {
    eyebrow: "Why StayKnown exists",
    title: "Care often disappears when someone leaves the room.",
    body:
      "People travel, visit, commute, study, meet strangers, ride in unfamiliar vehicles, and enter uncertain places. Trusted people may care deeply, but ordinary calls and raw location links often lack purpose, identity, timing, and a clear end.",
    points: [
      "Movement creates uncertainty",
      "Raw location can be misunderstood",
      "Permanent family tracking can become intrusive",
      "Urgent moments need clearer escalation",
    ],
    image: "/hero/stayknown-family-farewell.png",
    imageAlt: "A family saying goodbye before a journey",
    icon: "mission" as AboutIcon,
  },
  how: {
    eyebrow: "How the product responds",
    title: "StayKnown turns safety into a visible session.",
    body:
      "The system separates approved relationships, user-started Visits, active LIVE context, direct I’M SAFE reassurance, urgent SOS escalation, and verified ending.",
    points: [
      "Consent before active access",
      "Destination and session context",
      "Urgency that looks different from normal use",
      "A deliberate end to LIVE sharing",
    ],
    image: "/hero/visit-live-sos.png",
    imageAlt: "StayKnown Visit, LIVE, and SOS controls",
    icon: "context" as AboutIcon,
  },
  what: {
    eyebrow: "What StayKnown is",
    title: "A consent-first personal safety and communication platform.",
    body:
      "StayKnown combines approved contacts, Visits, LIVE safety sharing, I’M SAFE check-ins, SOS, recognition, secure chat, language-aware communication, stories, and plan-aware capacity.",
    points: [
      "Android application",
      "Trusted-contact safety",
      "Purpose-bound location context",
      "Secure communication and recognition",
    ],
    image: "/hero/promax-shell.png",
    imageAlt: "StayKnown Pro Max application shell",
    icon: "android" as AboutIcon,
  },
  boundary: {
    eyebrow: "What StayKnown does not claim",
    title: "The platform supports awareness. It does not replace official emergency services.",
    body:
      "StayKnown is not police, ambulance, fire service, rescue, hospital, road-safety authority, government dispatch, or a guarantee that every route, contact, property, driver, or destination is safe.",
    points: [
      "No universal professional dispatch",
      "No permanent tracking promise",
      "No guarantee of device or network availability",
      "No permission for stalking or coercive control",
    ],
    image: "/hero/sos-activated.png",
    imageAlt: "StayKnown active SOS screen",
    icon: "shield" as AboutIcon,
  },
} as const;

function AboutIconView({
  name,
  className = "h-4 w-4",
}: {
  name: AboutIcon;
  className?: string;
}) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };

  switch (name) {
    case "mission":
    case "spark":
      return (
        <svg {...common}>
          <path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4z" />
          <path d="m18.5 14 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
        </svg>
      );
    case "consent":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 20v-1.5A4.5 4.5 0 0 1 8 14h2a4.5 4.5 0 0 1 4.5 4.5V20" />
          <path d="m15 10 2 2 4-5" />
        </svg>
      );
    case "context":
      return (
        <svg {...common}>
          <path d="M5 21c4-5 10-5 14-10" />
          <path d="M15 7h4v4" />
          <circle cx="5" cy="17" r="2" />
          <circle cx="18" cy="6" r="2" />
        </svg>
      );
    case "response":
      return (
        <svg {...common}>
          <path d="M12 3 2.8 19h18.4z" />
          <path d="M12 9v4M12 16.5h.01" />
        </svg>
      );
    case "completion":
      return (
        <svg {...common}>
          <path d="M12 3 4.5 6v5.5c0 4.7 3.1 7.7 7.5 9.5 4.4-1.8 7.5-4.8 7.5-9.5V6z" />
          <path d="m8.5 12 2.2 2.2 4.8-5" />
        </svg>
      );
    case "founder":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M5 21a7 7 0 0 1 14 0" />
        </svg>
      );
    case "android":
      return (
        <svg {...common}>
          <rect x="7" y="3" width="10" height="18" rx="2.2" />
          <path d="M10 6h4M11 18h2" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 4.5 6v5.5c0 4.7 3.1 7.7 7.5 9.5 4.4-1.8 7.5-4.8 7.5-9.5V6z" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );
    case "arrow":
    default:
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m14 7 5 5-5 5" />
        </svg>
      );
  }
}

function GooglePlayMark() {
  return (
    <svg viewBox="0 0 512 512" aria-hidden="true" className="h-[17px] w-[17px]">
      <path d="M96 38.4v435.2c0 17.2 18.8 27.8 33.5 18.8l251.3-153.7L96 38.4z" fill="#34A853" />
      <path d="M96 38.4l284.8 300.3 68.2-41.7c22.7-13.9 22.7-46.8 0-60.7L380.8 194.6 96 38.4z" fill="#4285F4" />
      <path d="M96 38.4l284.8 156.2L294.2 256 96 38.4z" fill="#FBBC04" />
      <path d="M96 473.6 294.2 256l86.6 82.7L129.5 492.4C114.8 501.4 96 490.8 96 473.6z" fill="#EA4335" />
    </svg>
  );
}

function DownloadButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={GOOGLE_PLAY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative inline-flex h-10 items-center justify-center gap-2.5 overflow-hidden rounded-[14px] border border-white bg-white px-4 text-black shadow-[0_12px_30px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,1),inset_0_-5px_12px_rgba(0,0,0,0.09)] transition hover:-translate-y-px hover:border-white/25 hover:bg-black hover:text-white active:translate-y-0 active:scale-[0.985] ${className}`}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-[9px] border border-black/[0.07] bg-white">
        <GooglePlayMark />
      </span>
      <span className="text-[10px] font-black">Get StayKnown</span>
    </a>
  );
}

function BrandOrbit() {
  const reduced = useReducedMotion();

  const nodes = [
    { icon: "consent" as AboutIcon, label: "Consent" },
    { icon: "context" as AboutIcon, label: "Context" },
    { icon: "response" as AboutIcon, label: "Response" },
    { icon: "completion" as AboutIcon, label: "Completion" },
  ];

  return (
    <div className="relative mx-auto h-[500px] w-full max-w-[520px] sm:h-[610px]">
      <div className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07]" />
      <div className="absolute left-1/2 top-1/2 h-[490px] w-[490px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />

      <motion.div
        animate={reduced ? undefined : { rotate: 360 }}
        transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
        className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#8ff3d0]/24"
      >
        {nodes.map((node, index) => {
          const positions = [
            "left-1/2 top-[-21px] -translate-x-1/2",
            "right-[-21px] top-1/2 -translate-y-1/2",
            "bottom-[-21px] left-1/2 -translate-x-1/2",
            "left-[-21px] top-1/2 -translate-y-1/2",
          ];

          return (
            <motion.span
              key={node.label}
              animate={reduced ? undefined : { rotate: -360 }}
              transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
              className={`absolute flex h-11 w-11 items-center justify-center rounded-[14px] border border-[#8ff3d0]/44 bg-black text-[#8ff3d0] shadow-[0_14px_32px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.08)] ${positions[index]}`}
            >
              <AboutIconView name={node.icon} className="h-4 w-4" />
            </motion.span>
          );
        })}
      </motion.div>

      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.86, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: reduced ? 0 : 0.8,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="absolute left-1/2 top-1/2 flex h-[205px] w-[205px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[56px] border border-white bg-white shadow-[0_36px_90px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,1),inset_0_-12px_28px_rgba(0,0,0,0.10)]"
      >
        <Image src="/6logo.png" alt="6clement Joshua brand mark" width={104} height={104} priority />
      </motion.div>

      <motion.div
        animate={
          reduced
            ? undefined
            : { scale: [0.97, 1.03, 0.97], opacity: [0.58, 1, 0.58] }
        }
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[4%] left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#8ff3d0]/45 bg-black px-3 py-2 text-[#8ff3d0]"
      >
        <AboutIconView name="spark" className="h-3.5 w-3.5" />
        <span className="text-[8px] font-black uppercase tracking-[0.15em]">
          Built by 6clement Joshua
        </span>
      </motion.div>
    </div>
  );
}

function StoryLab() {
  const [tab, setTab] = useState<StoryTab>("why");
  const active = STORY[tab];

  const tabs: readonly { id: StoryTab; label: string }[] = [
    { id: "why", label: "Why" },
    { id: "how", label: "How" },
    { id: "what", label: "What" },
    { id: "boundary", label: "Boundary" },
  ];

  return (
    <section id="story" className="relative overflow-hidden bg-black py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-[9px] font-black uppercase tracking-[0.28em] text-white/38">
            Product story
          </div>
          <h2 className="mt-4 text-[40px] font-black leading-[0.94] tracking-[-0.068em] text-white sm:text-[52px] md:text-[62px]">
            Understand the problem, response, product, and limit.
          </h2>
        </div>

        <div className="mt-9 flex justify-center gap-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              aria-pressed={tab === item.id}
              className={`h-9 rounded-[13px] border px-3 text-[9px] font-black uppercase tracking-[0.12em] transition ${
                tab === item.id
                  ? "border-white bg-white text-black"
                  : "border-white/[0.13] bg-black text-white/46 hover:border-white/28 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-5 overflow-hidden rounded-[32px] border border-white/[0.13] bg-black shadow-[0_38px_110px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="grid lg:grid-cols-[0.94fr_1.06fr]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${tab}-image`}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.4 }}
                className="relative min-h-[470px] overflow-hidden border-b border-white/[0.09] lg:min-h-[650px] lg:border-b-0 lg:border-r"
              >
                {active.image.includes("stayknown-") ? (
                  <>
                    <Image
                      src={active.image}
                      alt={active.imageAlt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/28 to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute h-[350px] w-[350px] rounded-full border border-white/[0.07]" />
                    <Image
                      src={active.image}
                      alt={active.imageAlt}
                      width={390}
                      height={800}
                      quality={90}
                      className="relative z-10 h-auto w-[245px] object-contain drop-shadow-[0_38px_82px_rgba(0,0,0,0.9)] sm:w-[285px]"
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${tab}-copy`}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.4 }}
                className="flex min-h-[570px] flex-col p-5 sm:p-7 lg:min-h-[650px] lg:p-9"
              >
                <div className="text-[9px] font-black uppercase tracking-[0.22em] text-[#8ff3d0]">
                  {active.eyebrow}
                </div>
                <h3 className="mt-4 max-w-[14ch] text-[36px] font-black leading-[0.95] tracking-[-0.065em] text-white sm:text-[45px] lg:text-[50px]">
                  {active.title}
                </h3>
                <p className="mt-5 max-w-[61ch] text-[13px] font-semibold leading-relaxed text-white/57 sm:text-[14px]">
                  {active.body}
                </p>

                <div className="mt-7 grid gap-3">
                  {active.points.map((point, index) => (
                    <div
                      key={point}
                      className={`flex items-start gap-3 rounded-[19px] border bg-black p-3.5 ${
                        index === 0
                          ? "border-[#8ff3d0]/45"
                          : "border-white/[0.11]"
                      }`}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] border border-[#8ff3d0]/42 text-[#8ff3d0]">
                        <AboutIconView name="check" className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-[11.5px] font-semibold leading-relaxed text-white/62 sm:text-[12.5px]">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto flex flex-wrap gap-2.5 pt-7">
                  <Link
                    href="/how-it-works"
                    className="inline-flex h-9 items-center gap-2 rounded-[13px] border border-white bg-white px-3.5 text-[10px] font-black text-black hover:bg-black hover:text-white"
                  >
                    How it works
                    <AboutIconView name="arrow" className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href="/trust-safety"
                    className="inline-flex h-9 items-center gap-2 rounded-[13px] border border-white/[0.14] bg-black px-3.5 text-[10px] font-black text-white/65 hover:border-white hover:text-white"
                  >
                    Trust &amp; Safety
                    <AboutIconView name="arrow" className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function MissionPillars() {
  const pillars = [
    {
      title: "Consent",
      body:
        "Known and approved people before supported safety access can become active.",
      icon: "consent" as AboutIcon,
    },
    {
      title: "Context",
      body:
        "Destination, identity, timing, confidence, and session state around location.",
      icon: "context" as AboutIcon,
    },
    {
      title: "Response",
      body:
        "Clear I’M SAFE reassurance and urgent SOS escalation for trusted recipients.",
      icon: "response" as AboutIcon,
    },
    {
      title: "Completion",
      body:
        "Verified ending so active LIVE access closes deliberately.",
      icon: "completion" as AboutIcon,
    },
  ];

  return (
    <section className="bg-white py-16 text-black sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-[9px] font-black uppercase tracking-[0.28em] text-black/36">
            Mission architecture
          </div>
          <h2 className="mt-4 text-[40px] font-black leading-[0.94] tracking-[-0.068em] sm:text-[52px] md:text-[60px]">
            Safety should be understandable from beginning to end.
          </h2>
        </div>

        <div className="mt-9 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar, index) => (
            <motion.article
              key={pillar.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.42,
                delay: index * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="rounded-[24px] border border-black/[0.14] bg-white p-5 shadow-[0_20px_52px_rgba(0,0,0,0.075),inset_0_1px_0_rgba(255,255,255,1)]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-[13px] border border-[#0b7a62]/42 bg-white text-[#0b7a62]">
                <AboutIconView name={pillar.icon} className="h-4 w-4" />
              </span>
              <h3 className="mt-5 text-[21px] font-black tracking-[-0.045em]">
                {pillar.title}
              </h3>
              <p className="mt-3 text-[11px] font-semibold leading-relaxed text-black/56">
                {pillar.body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AboutExperience() {
  return (
    <main className="min-h-screen overflow-x-clip bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-white/[0.09] bg-black/94 backdrop-blur-2xl">
        <div className="mx-auto flex min-h-[66px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-5 lg:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-[13px] border border-white bg-white">
              <Image src="/6logo.png" alt="" width={20} height={20} priority />
            </span>
            <span>
              <span className="block text-[10px] font-black tracking-[0.22em]">
                STAYKNOWN
              </span>
              <span className="mt-1 block text-[7px] font-black uppercase tracking-[0.18em] text-white/32">
                About
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-5 md:flex">
            <a href="#story" className="text-[9px] font-black uppercase tracking-[0.13em] text-white/52 hover:text-white">
              Story
            </a>
            <Link href="/features" className="text-[9px] font-black uppercase tracking-[0.13em] text-white/52 hover:text-white">
              Features
            </Link>
            <Link href="/press-updates" className="text-[9px] font-black uppercase tracking-[0.13em] text-white/52 hover:text-white">
              Press
            </Link>
          </nav>

          <DownloadButton />
        </div>
      </header>

      <section className="relative overflow-hidden bg-black">
        <div className="absolute left-1/2 top-[45%] h-[820px] w-[1220px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />

        <div className="relative mx-auto grid min-h-[720px] max-w-6xl items-center gap-10 px-4 py-14 sm:px-5 lg:grid-cols-[1.05fr_0.95fr] lg:px-6 lg:py-20">
          <div>
            <div className="inline-flex min-h-8 items-center gap-2 rounded-full border border-[#8ff3d0]/46 bg-black px-3 text-[8px] font-black uppercase tracking-[0.18em] text-[#8ff3d0]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8ff3d0]" />
              Built by 6clement Joshua
            </div>

            <h1 className="mt-6 max-w-[11ch] text-[52px] font-black leading-[0.9] tracking-[-0.076em] sm:text-[68px] lg:text-[79px]">
              StayKnown was built to make safety context clearer and more human.
            </h1>

            <p className="mt-6 max-w-[64ch] text-[14px] font-semibold leading-relaxed text-white/58 sm:text-[15px]">
              StayKnown is a consent-first personal safety and communication
              platform created by Clement Joshua. It helps people move, visit,
              check in, communicate, and escalate danger through purposeful
              safety sessions rather than permanent tracking.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#story"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[14px] border border-white bg-white px-4 text-[10px] font-black text-black hover:bg-black hover:text-white"
              >
                Explore the story
                <AboutIconView name="arrow" className="h-3.5 w-3.5" />
              </a>
              <Link
                href="/watch"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[14px] border border-white/[0.15] bg-black px-4 text-[10px] font-black text-white/68 hover:border-white hover:text-white"
              >
                Watch the journey
                <AboutIconView name="arrow" className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <BrandOrbit />
        </div>
      </section>

      <StoryLab />
      <MissionPillars />

      <section className="relative overflow-hidden bg-black py-16 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-9 px-4 sm:px-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-6">
          <div className="relative mx-auto h-[520px] w-full max-w-[470px]">
            <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07]" />
            <Image
              src="/hero/visit-live-sos.png"
              alt="StayKnown Visit, LIVE, and SOS screen"
              width={430}
              height={880}
              className="absolute left-[13%] top-[3%] z-10 h-auto w-[48%] object-contain drop-shadow-[0_38px_82px_rgba(0,0,0,0.9)]"
            />
            <Image
              src="/hero/secure-chat-biometric.png"
              alt="StayKnown secure chat screen"
              width={390}
              height={800}
              className="absolute right-[9%] top-[17%] h-auto w-[38%] rotate-[7deg] object-contain opacity-75 drop-shadow-[0_30px_68px_rgba(0,0,0,0.84)]"
            />
          </div>

          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.28em] text-[#8ff3d0]">
              Current product
            </div>
            <h2 className="mt-4 max-w-[13ch] text-[40px] font-black leading-[0.94] tracking-[-0.068em] text-white sm:text-[52px] md:text-[60px]">
              Available on Android with Starter, Pro, and Pro Max.
            </h2>
            <p className="mt-5 max-w-[61ch] text-[13px] font-semibold leading-relaxed text-white/56 sm:text-[14px]">
              The public website explains the product, pricing, trust rules,
              audience use cases, accessibility commitments, and service
              notices. Account creation, safety actions, and subscription
              checkout remain inside the installed application.
            </p>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <DownloadButton />
              <Link
                href="/plans"
                className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-white/[0.15] bg-black px-4 text-[10px] font-black text-white/68 hover:border-white hover:text-white"
              >
                Plans &amp; Pricing
                <AboutIconView name="arrow" className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/trust-safety"
                className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-white/[0.15] bg-black px-4 text-[10px] font-black text-white/68 hover:border-white hover:text-white"
              >
                Trust &amp; Safety
                <AboutIconView name="arrow" className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
