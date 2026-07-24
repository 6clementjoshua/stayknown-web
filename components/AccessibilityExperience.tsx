"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";

const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.stayknown.app";

type AccessibilityIcon =
  | "text"
  | "contrast"
  | "motion"
  | "keyboard"
  | "reader"
  | "color"
  | "focus"
  | "sound"
  | "arrow"
  | "check"
  | "shield";

type TextScale = "standard" | "large" | "largest";
type ContrastMode = "standard" | "strong";
type MotionMode = "full" | "reduced";

function AccessibilityIconView({
  name,
  className = "h-4 w-4",
}: {
  name: AccessibilityIcon;
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
    case "text":
      return (
        <svg {...common}>
          <path d="M5 5h14M12 5v14M8 19h8" />
        </svg>
      );
    case "contrast":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v18M12 7a5 5 0 0 1 0 10" />
        </svg>
      );
    case "motion":
      return (
        <svg {...common}>
          <path d="M4 8h10M4 12h16M4 16h10" />
          <path d="m15 6 3 2-3 2M13 14l3 2-3 2" />
        </svg>
      );
    case "keyboard":
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="12" rx="2.5" />
          <path d="M7 10h.01M10 10h.01M13 10h.01M16 10h.01M7 14h10" />
        </svg>
      );
    case "reader":
      return (
        <svg {...common}>
          <circle cx="12" cy="5" r="2" />
          <path d="M5 9h14M12 9v12M8 21l4-7 4 7M8 12l-3 4M16 12l3 4" />
        </svg>
      );
    case "color":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 8h.01M16 8h.01M8 16h.01M16 16h.01" />
        </svg>
      );
    case "focus":
      return (
        <svg {...common}>
          <path d="M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "sound":
      return (
        <svg {...common}>
          <path d="M5 10h3l4-4v12l-4-4H5z" />
          <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />
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

function AccessibilityOrbit() {
  const reduced = useReducedMotion();
  const nodes = [
    { icon: "text" as AccessibilityIcon, label: "Text" },
    { icon: "keyboard" as AccessibilityIcon, label: "Keyboard" },
    { icon: "reader" as AccessibilityIcon, label: "Labels" },
    { icon: "motion" as AccessibilityIcon, label: "Motion" },
  ];

  return (
    <div className="relative mx-auto h-[500px] w-full max-w-[520px] sm:h-[600px]">
      <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07]" />
      <div className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />

      <motion.div
        animate={reduced ? undefined : { rotate: 360 }}
        transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
        className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#8ff3d0]/24"
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
              transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
              className={`absolute flex h-11 w-11 items-center justify-center rounded-[14px] border border-[#8ff3d0]/44 bg-black text-[#8ff3d0] shadow-[0_14px_32px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.08)] ${positions[index]}`}
            >
              <AccessibilityIconView name={node.icon} className="h-4 w-4" />
            </motion.span>
          );
        })}
      </motion.div>

      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduced ? 0 : 0.7 }}
        className="absolute left-1/2 top-1/2 flex h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[52px] border border-white bg-white text-black shadow-[0_36px_90px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,1),inset_0_-12px_28px_rgba(0,0,0,0.10)]"
      >
        <AccessibilityIconView name="reader" className="h-[88px] w-[88px]" />
      </motion.div>

      <motion.div
        animate={
          reduced
            ? undefined
            : { scale: [0.97, 1.03, 0.97], opacity: [0.58, 1, 0.58] }
        }
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[5%] left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#8ff3d0]/45 bg-black px-3 py-2 text-[#8ff3d0] shadow-[0_0_28px_rgba(143,243,208,0.16)]"
      >
        <span className="h-2 w-2 rounded-full bg-[#8ff3d0]" />
        <span className="text-[8px] font-black uppercase tracking-[0.15em]">
          Understandable interaction
        </span>
      </motion.div>
    </div>
  );
}

function AccessibilityStudio() {
  const systemReduced = useReducedMotion();
  const [textScale, setTextScale] = useState<TextScale>("standard");
  const [contrast, setContrast] = useState<ContrastMode>("standard");
  const [motionMode, setMotionMode] = useState<MotionMode>(
    systemReduced ? "reduced" : "full",
  );

  const scaleClass = {
    standard: "text-[13px]",
    large: "text-[15px]",
    largest: "text-[17px]",
  }[textScale];

  const strongContrast = contrast === "strong";
  const reducedMotion = motionMode === "reduced";

  return (
    <section
      id="studio"
      className="relative overflow-hidden bg-black py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-[9px] font-black uppercase tracking-[0.28em] text-white/38">
            Interactive accessibility studio
          </div>
          <h2 className="mt-4 text-[40px] font-black leading-[0.94] tracking-[-0.068em] text-white sm:text-[52px] md:text-[62px]">
            Test readable choices directly on the page.
          </h2>
          <p className="mx-auto mt-5 max-w-[68ch] text-[13px] font-semibold leading-relaxed text-white/56 sm:text-[14px]">
            These controls demonstrate text scaling, contrast, and motion
            preference locally. They do not claim universal device or assistive
            technology compatibility.
          </p>
        </div>

        <div className="mt-9 grid gap-4 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="rounded-[28px] border border-white/[0.13] bg-black p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/38">
              Preview controls
            </div>

            <div className="mt-6">
              <div className="text-[9px] font-black uppercase tracking-[0.14em] text-white/42">
                Text size
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(["standard", "large", "largest"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTextScale(value)}
                    aria-pressed={textScale === value}
                    className={`h-9 rounded-[13px] border text-[9px] font-black capitalize transition ${
                      textScale === value
                        ? "border-white bg-white text-black"
                        : "border-white/[0.13] bg-black text-white/48 hover:border-white/28 hover:text-white"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="text-[9px] font-black uppercase tracking-[0.14em] text-white/42">
                Contrast
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["standard", "strong"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setContrast(value)}
                    aria-pressed={contrast === value}
                    className={`h-9 rounded-[13px] border text-[9px] font-black capitalize transition ${
                      contrast === value
                        ? "border-white bg-white text-black"
                        : "border-white/[0.13] bg-black text-white/48 hover:border-white/28 hover:text-white"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="text-[9px] font-black uppercase tracking-[0.14em] text-white/42">
                Motion
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["full", "reduced"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMotionMode(value)}
                    aria-pressed={motionMode === value}
                    className={`h-9 rounded-[13px] border text-[9px] font-black capitalize transition ${
                      motionMode === value
                        ? "border-white bg-white text-black"
                        : "border-white/[0.13] bg-black text-white/48 hover:border-white/28 hover:text-white"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-6 text-[10px] font-semibold leading-relaxed text-white/38">
              Your operating system and browser preferences remain authoritative.
              The website also respects the reduced-motion media preference.
            </p>
          </div>

          <div
            className={`relative overflow-hidden rounded-[30px] border p-5 shadow-[0_32px_90px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-7 ${
              strongContrast
                ? "border-white bg-white text-black"
                : "border-white/[0.13] bg-black text-white"
            }`}
          >
            <motion.div
              animate={
                reducedMotion
                  ? undefined
                  : { rotate: [0, 2.5, 0, -2.5, 0] }
              }
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={`absolute right-[-55px] top-[-55px] flex h-40 w-40 items-center justify-center rounded-full border ${
                strongContrast
                  ? "border-black/[0.13]"
                  : "border-[#8ff3d0]/20"
              }`}
            >
              <div
                className={`h-24 w-24 rounded-full border ${
                  strongContrast
                    ? "border-black/[0.13]"
                    : "border-[#8ff3d0]/24"
                }`}
              />
            </motion.div>

            <div className="relative max-w-[600px]">
              <div
                className={`text-[9px] font-black uppercase tracking-[0.17em] ${
                  strongContrast ? "text-[#0b7a62]" : "text-[#8ff3d0]"
                }`}
              >
                Accessible preview
              </div>

              <h3 className="mt-4 max-w-[14ch] text-[36px] font-black leading-[0.96] tracking-[-0.062em] sm:text-[46px]">
                Safety information should remain readable under pressure.
              </h3>

              <p
                className={`mt-5 font-semibold leading-relaxed ${
                  strongContrast ? "text-black" : "text-white/62"
                } ${scaleClass}`}
              >
                StayKnown uses clear headings, visible state changes, labelled
                controls, keyboard-focus treatment, and redundant text so
                meaning does not depend on colour alone.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  ["Visible focus", "Keyboard users should see where interaction is currently located.", "focus" as AccessibilityIcon],
                  ["Text and icon states", "Important meaning is repeated through wording, symbols, and structure.", "color" as AccessibilityIcon],
                  ["Reduced motion", "Animation can stop or simplify when the system preference requests it.", "motion" as AccessibilityIcon],
                  ["Descriptive labels", "Controls and images use meaningful labels where the interface requires them.", "reader" as AccessibilityIcon],
                ].map(([title, body, icon]) => (
                  <article
                    key={title}
                    className={`rounded-[19px] border p-4 ${
                      strongContrast
                        ? "border-black/[0.17] bg-white"
                        : "border-white/[0.11] bg-black"
                    }`}
                  >
                    <AccessibilityIconView
                      name={icon as AccessibilityIcon}
                      className={`h-4 w-4 ${
                        strongContrast ? "text-[#0b7a62]" : "text-[#8ff3d0]"
                      }`}
                    />
                    <h4 className="mt-3 text-[13px] font-black">{title}</h4>
                    <p
                      className={`mt-2 text-[10.5px] font-semibold leading-relaxed ${
                        strongContrast ? "text-black/62" : "text-white/50"
                      }`}
                    >
                      {body}
                    </p>
                  </article>
                ))}
              </div>

              <button
                type="button"
                className={`mt-7 inline-flex h-10 items-center gap-2 rounded-[14px] border px-4 text-[10px] font-black focus-visible:outline-none focus-visible:ring-4 ${
                  strongContrast
                    ? "border-black bg-black text-white focus-visible:ring-[#0b7a62]/35"
                    : "border-white bg-white text-black focus-visible:ring-[#8ff3d0]/45"
                }`}
              >
                Visible keyboard focus
                <AccessibilityIconView name="focus" className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Commitments() {
  const items = [
    {
      title: "Keyboard-accessible navigation",
      body:
        "Interactive controls use native buttons and links, logical tab order, and visible focus treatment.",
      icon: "keyboard" as AccessibilityIcon,
    },
    {
      title: "Reduced-motion support",
      body:
        "Premium animations respect the operating system’s reduced-motion preference and avoid making motion the only source of meaning.",
      icon: "motion" as AccessibilityIcon,
    },
    {
      title: "Meaning beyond colour",
      body:
        "Mint, white, and SOS red are paired with labels, icons, borders, and explicit state language.",
      icon: "color" as AccessibilityIcon,
    },
    {
      title: "Readable hierarchy",
      body:
        "Headings, body copy, supporting text, and controls use a deliberate hierarchy for fast scanning.",
      icon: "text" as AccessibilityIcon,
    },
    {
      title: "Descriptive interface labels",
      body:
        "Images, controls, dynamic updates, and navigation receive descriptive text where it improves understanding.",
      icon: "reader" as AccessibilityIcon,
    },
    {
      title: "Accessible support route",
      body:
        "Accessibility problems can be reported through the Help Center or request form for review.",
      icon: "shield" as AccessibilityIcon,
    },
  ];

  return (
    <section className="bg-white py-16 text-black sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-[9px] font-black uppercase tracking-[0.28em] text-black/36">
            Accessibility commitments
          </div>
          <h2 className="mt-4 text-[40px] font-black leading-[0.94] tracking-[-0.068em] sm:text-[52px] md:text-[60px]">
            Clear interaction is part of safety quality.
          </h2>
        </div>

        <div className="mt-9 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.42,
                delay: index * 0.055,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="rounded-[24px] border border-black/[0.14] bg-white p-5 shadow-[0_20px_52px_rgba(0,0,0,0.075),inset_0_1px_0_rgba(255,255,255,1)]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-[13px] border border-[#0b7a62]/42 bg-white text-[#0b7a62]">
                <AccessibilityIconView name={item.icon} className="h-4 w-4" />
              </span>
              <h3 className="mt-5 text-[19px] font-black tracking-[-0.04em]">
                {item.title}
              </h3>
              <p className="mt-3 text-[11px] font-semibold leading-relaxed text-black/56">
                {item.body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AccessibilityExperience() {
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
                Accessibility
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-5 md:flex">
            <a href="#studio" className="text-[9px] font-black uppercase tracking-[0.13em] text-white/52 hover:text-white">
              Studio
            </a>
            <Link href="/help-center" className="text-[9px] font-black uppercase tracking-[0.13em] text-white/52 hover:text-white">
              Help
            </Link>
            <Link href="/submit-request" className="text-[9px] font-black uppercase tracking-[0.13em] text-white/52 hover:text-white">
              Report
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
              Accessible safety information
            </div>

            <h1 className="mt-6 max-w-[11ch] text-[52px] font-black leading-[0.9] tracking-[-0.076em] sm:text-[68px] lg:text-[79px]">
              Safety interaction should remain clear across different abilities and preferences.
            </h1>

            <p className="mt-6 max-w-[64ch] text-[14px] font-semibold leading-relaxed text-white/58 sm:text-[15px]">
              StayKnown’s website uses labelled controls, visible focus,
              reduced-motion support, readable hierarchy, and meaning that does
              not depend on colour alone. Accessibility remains an ongoing
              product responsibility—not a one-time claim.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#studio"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[14px] border border-white bg-white px-4 text-[10px] font-black text-black hover:bg-black hover:text-white"
              >
                Open accessibility studio
                <AccessibilityIconView name="arrow" className="h-3.5 w-3.5" />
              </a>
              <Link
                href="/submit-request"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[14px] border border-white/[0.15] bg-black px-4 text-[10px] font-black text-white/68 hover:border-white/28 hover:text-white"
              >
                Report an accessibility issue
                <AccessibilityIconView name="arrow" className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <AccessibilityOrbit />
        </div>
      </section>

      <AccessibilityStudio />
      <Commitments />

      <section className="bg-black py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-5 lg:px-6">
          <div className="text-[9px] font-black uppercase tracking-[0.28em] text-[#8ff3d0]">
            Important scope
          </div>
          <h2 className="mx-auto mt-4 max-w-[14ch] text-[42px] font-black leading-[0.94] tracking-[-0.07em] text-white sm:text-[54px] md:text-[62px]">
            Accessibility support varies by device, browser, operating system, and assistive technology.
          </h2>
          <p className="mx-auto mt-5 max-w-[69ch] text-[13px] font-semibold leading-relaxed text-white/55 sm:text-[14px]">
            This page describes current design commitments and demonstrations.
            It does not claim formal universal certification or compatibility
            with every configuration. Report specific barriers so they can be
            reviewed.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/help-center"
              className="inline-flex h-10 w-full max-w-[210px] items-center justify-center gap-2 rounded-[14px] border border-white bg-white px-4 text-[10px] font-black text-black hover:bg-black hover:text-white sm:w-auto"
            >
              Help Center
              <AccessibilityIconView name="arrow" className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/submit-request"
              className="inline-flex h-10 w-full max-w-[210px] items-center justify-center gap-2 rounded-[14px] border border-white/[0.16] bg-black px-4 text-[10px] font-black text-white/66 hover:border-white hover:text-white sm:w-auto"
            >
              Submit a request
              <AccessibilityIconView name="arrow" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
