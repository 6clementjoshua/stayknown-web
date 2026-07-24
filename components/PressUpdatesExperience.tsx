"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";

type PressIcon =
  | "press"
  | "facts"
  | "language"
  | "brand"
  | "updates"
  | "copy"
  | "print"
  | "contact"
  | "android"
  | "shield"
  | "arrow"
  | "check"
  | "spark";

type PressTab = "facts" | "language" | "brand" | "contact";

const OFFICIAL_DESCRIPTION =
  "StayKnown is a consent-first Android personal safety and communication platform for approved contacts, active Visits, LIVE safety sharing, I’M SAFE check-ins, SOS alerts, recognition, and secure communication.";

const PRESS_TABS = {
  facts: {
    eyebrow: "Approved product facts",
    title: "Use clear, verifiable language about the product.",
    body:
      "These facts describe the current public StayKnown proposition without inventing partnerships, ratings, emergency-dispatch coverage, or user numbers.",
    points: [
      "StayKnown is available as an Android application.",
      "The platform uses approved contacts and purposeful safety sessions.",
      "Core product areas include Visits, LIVE sharing, I’M SAFE, SOS, recognition, and secure communication.",
      "Starter, Pro, and Pro Max provide different feature capacity.",
      "Nigeria pricing uses NGN and the supported Paystack route; global pricing uses USD and the supported Flutterwave route.",
    ],
    icon: "facts" as PressIcon,
  },
  language: {
    eyebrow: "Safety language",
    title: "Describe safety support without promising guaranteed rescue.",
    body:
      "Media, creators, partners, and public materials should preserve the difference between trusted-contact awareness and official emergency response.",
    points: [
      "Say “supports trusted-contact safety awareness” rather than “guarantees safety.”",
      "Say “SOS alerts configured contacts and responders” rather than “automatically dispatches police.”",
      "Say “consent-first active sharing” rather than “tracks people everywhere.”",
      "Mention network, device, location-confidence, and emergency-service limitations when relevant.",
      "Do not present family, guardian, or partner access as permission for surveillance.",
    ],
    icon: "language" as PressIcon,
  },
  brand: {
    eyebrow: "Brand usage",
    title: "Keep StayKnown visually recognizable and factually consistent.",
    body:
      "Use the official 6 mark, the STAYKNOWN wordmark, real product screenshots, black-and-white primary surfaces, mint safety accents, and red only for urgent SOS states.",
    points: [
      "Official public name: StayKnown.",
      "Founder line: Built by 6clement Joshua.",
      "Primary visual language: black, white, premium bevel, and controlled depth.",
      "Safety accent: mint green. Emergency accent: red.",
      "Do not recolour, stretch, distort, or replace the official 6 mark with an approximate symbol.",
    ],
    icon: "brand" as PressIcon,
  },
  contact: {
    eyebrow: "Press and partnership enquiries",
    title: "Use the public request route so enquiries can be reviewed.",
    body:
      "Press, creator, partnership, product, accessibility, safety, and general business enquiries should use the relevant public StayKnown route.",
    points: [
      "General enquiries: Contact or Submit Request.",
      "Creator participation: Creator Apply.",
      "Feature proposals: Submit Feature.",
      "Security vulnerabilities: Security Disclosure.",
      "Abuse and stalking reports: Abuse Reporting.",
    ],
    icon: "contact" as PressIcon,
  },
} as const;

const UPDATES = [
  {
    label: "Product availability",
    title: "StayKnown is publicly available on Android.",
    body:
      "The website directs visitors to the official Google Play listing. Account creation, safety actions, and checkout occur inside the installed application.",
    icon: "android" as PressIcon,
    href: "https://play.google.com/store/apps/details?id=com.stayknown.app",
    external: true,
  },
  {
    label: "Consent-first product education",
    title: "New public How It Works, Features, Watch, and Trust experiences.",
    body:
      "The website now explains the safety journey, capability system, interactive product film, plan capacity, and trust boundaries through real app screens.",
    icon: "updates" as PressIcon,
    href: "/how-it-works",
    external: false,
  },
  {
    label: "Audience education",
    title: "Dedicated student, travel, family, and guardian safety guidance.",
    body:
      "Public audience pages explain how the same consent-first safety model applies to different real-life situations without becoming permanent tracking.",
    icon: "shield" as PressIcon,
    href: "/students",
    external: false,
  },
  {
    label: "Pricing transparency",
    title: "IP-resolved NGN or global USD plan presentation.",
    body:
      "The Plans page presents Nigeria pricing in NGN and other supported countries through the global USD route, with the app rechecking before checkout.",
    icon: "facts" as PressIcon,
    href: "/plans",
    external: false,
  },
] as const;

function PressIconView({
  name,
  className = "h-4 w-4",
}: {
  name: PressIcon;
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
    case "press":
      return (
        <svg {...common}>
          <path d="M5 4h14v16H5z" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      );
    case "facts":
      return (
        <svg {...common}>
          <path d="M6 3h9l3 3v15H6z" />
          <path d="M15 3v4h4M9 11h6M9 15h6" />
        </svg>
      );
    case "language":
      return (
        <svg {...common}>
          <path d="M4 5h8M8 3v2M5 8c1.5 3 3.8 5.2 7 6.5M11 8c-.8 2.2-2.3 4.1-4.5 5.6" />
          <path d="m14 19 3.2-8 3.3 8M15.3 16h4" />
        </svg>
      );
    case "brand":
      return (
        <svg {...common}>
          <path d="M12 3 4.5 6v5.5c0 4.7 3.1 7.7 7.5 9.5 4.4-1.8 7.5-4.8 7.5-9.5V6z" />
          <path d="m8.5 12 2.2 2.2 4.8-5" />
        </svg>
      );
    case "updates":
      return (
        <svg {...common}>
          <path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.6" />
          <path d="M4 4v4.6h4.6M12 8v4l3 2" />
        </svg>
      );
    case "copy":
      return (
        <svg {...common}>
          <rect x="8" y="8" width="11" height="11" rx="2" />
          <path d="M5 16H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      );
    case "print":
      return (
        <svg {...common}>
          <path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-5h18v5a2 2 0 0 1-2 2h-2" />
          <path d="M7 14h10v7H7z" />
        </svg>
      );
    case "contact":
      return (
        <svg {...common}>
          <path d="M4 5h16v11H9l-5 4z" />
          <path d="M8 9h8M8 12h6" />
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
    case "spark":
      return (
        <svg {...common}>
          <path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4z" />
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

function PressOrbit() {
  const reduced = useReducedMotion();
  const nodes = [
    "facts" as PressIcon,
    "language" as PressIcon,
    "brand" as PressIcon,
    "updates" as PressIcon,
  ];

  return (
    <div className="relative mx-auto h-[500px] w-full max-w-[520px] sm:h-[610px]">
      <div className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07]" />
      <div className="absolute left-1/2 top-1/2 h-[490px] w-[490px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />

      <motion.div
        animate={reduced ? undefined : { rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
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
              key={node}
              animate={reduced ? undefined : { rotate: -360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className={`absolute flex h-11 w-11 items-center justify-center rounded-[14px] border border-[#8ff3d0]/44 bg-black text-[#8ff3d0] shadow-[0_14px_32px_rgba(0,0,0,0.58)] ${positions[index]}`}
            >
              <PressIconView name={node} className="h-4 w-4" />
            </motion.span>
          );
        })}
      </motion.div>

      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduced ? 0 : 0.75 }}
        className="absolute left-1/2 top-1/2 flex h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[54px] border border-white bg-white text-black shadow-[0_36px_90px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,1),inset_0_-12px_28px_rgba(0,0,0,0.10)]"
      >
        <PressIconView name="press" className="h-[92px] w-[92px]" />
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
        <PressIconView name="spark" className="h-3.5 w-3.5" />
        <span className="text-[8px] font-black uppercase tracking-[0.15em]">
          Public facts, not invented claims
        </span>
      </motion.div>
    </div>
  );
}

function PressKitLab() {
  const [tab, setTab] = useState<PressTab>("facts");
  const [copied, setCopied] = useState(false);
  const active = PRESS_TABS[tab];

  const copyDescription = async () => {
    try {
      await navigator.clipboard.writeText(OFFICIAL_DESCRIPTION);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section id="press-kit" className="bg-black py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-[9px] font-black uppercase tracking-[0.28em] text-white/38">
            Interactive press kit
          </div>
          <h2 className="mt-4 text-[40px] font-black leading-[0.94] tracking-[-0.068em] text-white sm:text-[52px] md:text-[62px]">
            Use approved facts, language, and visual rules.
          </h2>
        </div>

        <div className="mt-9 flex flex-wrap justify-center gap-2">
          {(Object.keys(PRESS_TABS) as PressTab[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-pressed={tab === id}
              className={`h-9 rounded-[13px] border px-3 text-[9px] font-black capitalize transition ${
                tab === id
                  ? "border-white bg-white text-black"
                  : "border-white/[0.13] bg-black text-white/46 hover:border-white/28 hover:text-white"
              }`}
            >
              {id}
            </button>
          ))}
        </div>

        <div className="mt-5 overflow-hidden rounded-[32px] border border-white/[0.13] bg-black shadow-[0_38px_110px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
            <div className="relative min-h-[490px] overflow-hidden border-b border-white/[0.09] p-6 lg:min-h-[650px] lg:border-b-0 lg:border-r">
              <div className="absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07]" />
              <div className="absolute left-1/2 top-1/2 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, scale: 0.93, rotate: -4 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.96, rotate: 3 }}
                  transition={{ duration: 0.42 }}
                  className="absolute left-1/2 top-1/2 flex h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[52px] border border-white bg-white text-black shadow-[0_36px_90px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,1)]"
                >
                  <PressIconView name={active.icon} className="h-[84px] w-[84px]" />
                </motion.div>
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${tab}-copy`}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.4 }}
                className="flex min-h-[600px] flex-col p-5 sm:p-7 lg:min-h-[650px] lg:p-9"
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
                        <PressIconView name="check" className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-[11.5px] font-semibold leading-relaxed text-white/62 sm:text-[12.5px]">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto flex flex-wrap gap-2.5 pt-7">
                  <button
                    type="button"
                    onClick={() => void copyDescription()}
                    className="inline-flex h-9 items-center gap-2 rounded-[13px] border border-white bg-white px-3.5 text-[10px] font-black text-black hover:bg-black hover:text-white"
                  >
                    <PressIconView name="copy" className="h-3.5 w-3.5" />
                    {copied ? "Copied" : "Copy official description"}
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex h-9 items-center gap-2 rounded-[13px] border border-white/[0.14] bg-black px-3.5 text-[10px] font-black text-white/65 hover:border-white hover:text-white"
                  >
                    <PressIconView name="print" className="h-3.5 w-3.5" />
                    Print page
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function UpdatesSection() {
  return (
    <section className="bg-white py-16 text-black sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-[9px] font-black uppercase tracking-[0.28em] text-black/36">
            Current public updates
          </div>
          <h2 className="mt-4 text-[40px] font-black leading-[0.94] tracking-[-0.068em] sm:text-[52px] md:text-[60px]">
            Product developments described without fabricated press coverage.
          </h2>
          <p className="mx-auto mt-5 max-w-[68ch] text-[13px] font-semibold leading-relaxed text-black/56 sm:text-[14px]">
            This page does not invent awards, endorsements, partnerships,
            ratings, media articles, or user numbers. It publishes only current
            product and website developments.
          </p>
        </div>

        <div className="mt-9 grid gap-3 md:grid-cols-2">
          {UPDATES.map((update, index) => (
            <motion.article
              key={update.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.42,
                delay: index * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="rounded-[25px] border border-black/[0.14] bg-white p-5 shadow-[0_20px_52px_rgba(0,0,0,0.075),inset_0_1px_0_rgba(255,255,255,1)]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-[13px] border border-[#0b7a62]/42 bg-white text-[#0b7a62]">
                <PressIconView name={update.icon} className="h-4 w-4" />
              </span>
              <div className="mt-5 text-[8px] font-black uppercase tracking-[0.16em] text-[#0b7a62]">
                {update.label}
              </div>
              <h3 className="mt-2 text-[22px] font-black leading-[1] tracking-[-0.048em]">
                {update.title}
              </h3>
              <p className="mt-4 text-[11px] font-semibold leading-relaxed text-black/56">
                {update.body}
              </p>

              {update.external ? (
                <a
                  href={update.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex h-9 items-center gap-2 rounded-[13px] border border-black/[0.15] bg-white px-3.5 text-[10px] font-black text-black hover:border-black hover:bg-black hover:text-white"
                >
                  Open update
                  <PressIconView name="arrow" className="h-3.5 w-3.5" />
                </a>
              ) : (
                <Link
                  href={update.href}
                  className="mt-5 inline-flex h-9 items-center gap-2 rounded-[13px] border border-black/[0.15] bg-white px-3.5 text-[10px] font-black text-black hover:border-black hover:bg-black hover:text-white"
                >
                  Open update
                  <PressIconView name="arrow" className="h-3.5 w-3.5" />
                </Link>
              )}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function PressUpdatesExperience() {
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
                Press &amp; Updates
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-5 md:flex">
            <a href="#press-kit" className="text-[9px] font-black uppercase tracking-[0.13em] text-white/52 hover:text-white">
              Press kit
            </a>
            <Link href="/about" className="text-[9px] font-black uppercase tracking-[0.13em] text-white/52 hover:text-white">
              About
            </Link>
            <Link href="/submit-request" className="text-[9px] font-black uppercase tracking-[0.13em] text-white/52 hover:text-white">
              Enquiries
            </Link>
          </nav>

          <Link
            href="/submit-request"
            className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-white bg-white px-4 text-[10px] font-black text-black hover:bg-black hover:text-white"
          >
            Contact
            <PressIconView name="arrow" className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-black">
        <div className="absolute left-1/2 top-[45%] h-[820px] w-[1220px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />

        <div className="relative mx-auto grid min-h-[720px] max-w-6xl items-center gap-10 px-4 py-14 sm:px-5 lg:grid-cols-[1.05fr_0.95fr] lg:px-6 lg:py-20">
          <div>
            <div className="inline-flex min-h-8 items-center gap-2 rounded-full border border-[#8ff3d0]/46 bg-black px-3 text-[8px] font-black uppercase tracking-[0.18em] text-[#8ff3d0]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8ff3d0]" />
              Official media information
            </div>

            <h1 className="mt-6 max-w-[11ch] text-[52px] font-black leading-[0.9] tracking-[-0.076em] sm:text-[68px] lg:text-[79px]">
              Product facts, approved language, brand guidance, and current updates.
            </h1>

            <p className="mt-6 max-w-[64ch] text-[14px] font-semibold leading-relaxed text-white/58 sm:text-[15px]">
              This public media room helps press, creators, partners, and
              reviewers describe StayKnown accurately without inventing
              endorsements, emergency guarantees, partnerships, ratings, or
              user statistics.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#press-kit"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[14px] border border-white bg-white px-4 text-[10px] font-black text-black hover:bg-black hover:text-white"
              >
                Open press kit
                <PressIconView name="arrow" className="h-3.5 w-3.5" />
              </a>
              <Link
                href="/about"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[14px] border border-white/[0.15] bg-black px-4 text-[10px] font-black text-white/68 hover:border-white hover:text-white"
              >
                About StayKnown
                <PressIconView name="arrow" className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <PressOrbit />
        </div>
      </section>

      <PressKitLab />
      <UpdatesSection />

      <section className="bg-black py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-5 lg:px-6">
          <div className="text-[9px] font-black uppercase tracking-[0.28em] text-[#8ff3d0]">
            Enquiries
          </div>
          <h2 className="mx-auto mt-4 max-w-[14ch] text-[42px] font-black leading-[0.94] tracking-[-0.07em] text-white sm:text-[54px] md:text-[62px]">
            Send the right request through the right public route.
          </h2>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {[
              ["General request", "/submit-request"],
              ["Creator application", "/creator-apply"],
              ["Feature proposal", "/submit-feature"],
              ["Security disclosure", "/security"],
              ["Abuse report", "/abuse"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-white/[0.16] bg-black px-4 text-[10px] font-black text-white/66 hover:border-white hover:text-white"
              >
                {label}
                <PressIconView name="arrow" className="h-3.5 w-3.5" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
