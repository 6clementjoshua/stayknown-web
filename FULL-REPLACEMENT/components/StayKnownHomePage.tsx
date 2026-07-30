"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import HeroSlider, { type HeroSlide } from "@/components/HeroSlider";
import StayKnownActionMenu from "@/components/StayKnownActionMenu";
import PublicWebsiteVisitCounter from "@/components/PublicWebsiteVisitCounter";
import StayKnownHowItWorks from "@/components/StayKnownHowItWorks";
import { HOME_FAQS } from "@/lib/stayknown-home-content";
import StayKnownRecognitionPill from "@/components/StayKnownRecognitionPill";
import StayKnownSocialLinks from "@/components/StayKnownSocialLinks";
import StayKnownChatDemo from "@/components/StayKnownChatDemo";

const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.stayknown.app";

type CinematicHeroSlide = {
  id: string;
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  objectPosition?: string;
};

type IconName =
  | "consent"
  | "visit"
  | "live"
  | "sos"
  | "check"
  | "student"
  | "travel"
  | "family"
  | "shield"
  | "privacy"
  | "proof"
  | "chat"
  | "language"
  | "voice"
  | "question"
  | "arrow";



type FooterLink = {
  label: string;
  href: string;
};

const HOME_NAV_ITEMS = [
  ["How it works", "/how-it-works"],
  ["Watch", "/watch"],
  ["Features", "/features"],
  ["Plans", "/plans"],
  ["Trust", "/trust-safety"],
  ["FAQ", "#faq"],
] as const;

const STORY_SLIDES: CinematicHeroSlide[] = [
  {
    id: "safe-journey-bus",
    src: "/hero/stayknown-safe-journey-bus.png",
    alt: "A Nigerian journey scene viewed from inside a bus",
    eyebrow: "Consent-first safety",
    title: "Safety when you choose it. Trusted people when you need them.",
    body: "Start a Visit, share safety context with approved contacts, keep LIVE protection active, or raise an SOS without permanent family tracking.",
    href: "/learn/safe-journey",
    objectPosition: "center center",
  },
  {
    id: "family-farewell",
    src: "/hero/stayknown-family-farewell.png",
    alt: "A family saying goodbye to a loved one before a journey",
    eyebrow: "Trusted people",
    title: "When someone leaves, care should not stop.",
    body: "StayKnown helps families support movement, visits, school, travel, ride-hailing, and uncertain moments without turning care into hidden surveillance.",
    href: "/learn/family-safety",
    objectPosition: "center center",
  },
];

const APP_SLIDES: HeroSlide[] = [
  {
    id: "get-safe-guidance",
    src: "/hero/get-safe-hints.png",
    kind: "device",
    title: "GET SAFE",
    teaser:
      "StayKnown was created by 6Clement Joshua to help people move, visit, chat, share safety context, and stay connected to trusted people wherever they go.",
  },
  {
    id: "visit-live-sos",
    src: "/hero/visit-live-sos.png",
    kind: "device",
    title: "Live Visit + SOS Ready",
    teaser:
      "Start a Visit, keep LIVE context active, and keep SOS close when the situation needs urgent escalation.",
  },
  {
    id: "visit-live",
    src: "/hero/visit-live.png",
    kind: "device",
    title: "Visit + LIVE Protection",
    teaser:
      "LIVE sharing is tied to an active Visit, helping trusted contacts understand where the user is while safety tracking is active.",
  },
  {
    id: "live-map",
    src: "/hero/live-map.png",
    kind: "device",
    title: "Live Map for Approved Contacts",
    teaser:
      "Approved contacts can open a safety map only from the user’s permitted Visit or SOS flow, with privacy notice, session context, and lawful-use boundaries.",
  },
  {
    id: "promax-shell",
    src: "/hero/promax-shell.png",
    kind: "device",
    title: "Pro Max Home Experience",
    teaser:
      "A premium home experience with fast access to safety, contacts, Chat, profile, and essential actions.",
  },
  {
    id: "manual-capture",
    src: "/hero/manual-capture.png",
    kind: "device",
    title: "Manual Emergency Capture",
    teaser:
      "During an active Visit, users can send an extra safety location update without disturbing the normal tracking rhythm.",
  },
  {
    id: "sos-activated",
    src: "/hero/sos-activated.png",
    kind: "device",
    title: "SOS Active State",
    teaser:
      "When SOS is active, StayKnown shifts into a high-clarity emergency state so the user knows escalation is running.",
  },
  {
    id: "sos-live-idle",
    src: "/hero/sos-live-idle.png",
    kind: "device",
    title: "SOS Ready, Not Confusing",
    teaser:
      "The SOS screen stays simple and readable, helping users understand when SOS is ready and when protection is active.",
  },
  {
    id: "end-sos-verify",
    src: "/hero/end-sos-verify.png",
    kind: "device",
    title: "End SOS — Verified Stop",
    teaser:
      "When protection is active, ending SOS can require a stronger confirmation so emergency protection is not stopped by mistake.",
  },
  {
    id: "end-visit-verify",
    src: "/hero/end-visit-verify.png",
    kind: "device",
    title: "End Visit — Confirmed Finish",
    teaser:
      "Visit completion can use a confirmation-first flow so safety sessions end with intent, not accidental taps.",
  },
  {
    id: "vpn-safety-gate",
    src: "/hero/vpn-safety-gate.png",
    kind: "device",
    title: "VPN Safety Gate",
    teaser:
      "StayKnown protects location reliability by warning or blocking flows when VPN usage can reduce safety accuracy.",
  },
  {
    id: "secure-chat-biometric",
    src: "/hero/secure-chat-biometric.png",
    kind: "device",
    title: "Secure Chat Protection",
    teaser:
      "StayKnown Chat can work with biometric or device-level protection so private safety conversations stay harder to access.",
  },
  {
    id: "chat-translation",
    src: "/hero/chat-translation.png",
    kind: "device",
    title: "Language-Aware Chat",
    teaser:
      "StayKnown Chat is built for multilingual communication with translation-aware message handling and recipient language preferences.",
  },
  {
    id: "chat-stickers-voice",
    src: "/hero/chat-stickers-voice.png",
    kind: "device",
    title: "Voice Notes + Stickers",
    teaser:
      "Users can send voice notes, custom stickers, voice stickers, music stickers, video stickers, media, and expressive chat content while the safety-first chat layer stays polished.",
  },
  {
    id: "contact-approval",
    src: "/hero/contact-approval.png",
    kind: "device",
    title: "Consent-Based Contacts",
    teaser:
      "Emergency contacts and SOS responders use approval steps so safety access remains intentional, trusted, and clear.",
  },
  {
    id: "verification",
    src: "/hero/verification.png",
    kind: "device",
    title: "Verified Identity",
    teaser:
      "StayKnown verification helps people recognize verified individuals and organizations across safety, contacts, chat, stories, SOS, Visit, and trusted-contact flows.",
  },
  {
    id: "safety-gallery",
    src: "/hero/safety-gallery.png",
    kind: "device",
    title: "Safety Gallery",
    teaser:
      "Profile and safety images help trusted contacts recognize the user during Visits, SOS alerts, and safety communication.",
  },
  {
    id: "stories-profile",
    src: "/hero/stories-profile.png",
    kind: "device",
    title: "Stories + Profile Trust",
    teaser:
      "Stories, avatars, names, and profile details help users recognize who they are connecting with before conversations begin.",
  },
];

/*
 * Premium public route flow completed:
 * /how-it-works, /features, /watch, /plans, /trust-safety,
 * /students, /travel-rides, /families-guardians, /accessibility,
 * /status, /about, and /press-updates.
 *
 * Homepage section anchors remain available for the shorter in-page experience.
 */
const FOOTER_GROUPS: Array<{ title: string; links: FooterLink[] }> = [
  {
    title: "Explore",
    links: [
      { label: "How StayKnown Works", href: "/how-it-works" },
      { label: "Watch StayKnown", href: "/watch" },
      { label: "Product Features", href: "/features" },
      { label: "Secure Chat", href: "/learn/chat" },
      { label: "Chat & Trusted Circles", href: "/chat" },
      { label: "Plans & Pricing", href: "/plans" },
      { label: "Trust & Safety", href: "/trust-safety" },
    ],
  },
  {
    title: "People",
    links: [
      { label: "Students", href: "/students" },
      { label: "Travel & Rides", href: "/travel-rides" },
      { label: "Families & Guardians", href: "/families-guardians" },
      { label: "Child Safety & Minor Use", href: "/minors" },
      { label: "Guardian Consent", href: "/guardian-consent" },
      { label: "Accessibility", href: "/accessibility" },
    ],
  },
  {
    title: "Safety & Support",
    links: [
      { label: "Safety & Anti-Stalking", href: "/safety" },
      { label: "Contact Consent", href: "/contact-consent" },
      { label: "Location & Live Safety", href: "/location-safety" },
      { label: "Emergency Disclaimer", href: "/emergency" },
      { label: "Abuse Reporting", href: "/abuse" },
      { label: "Help Center", href: "/help-center" },
      { label: "Public Status", href: "/status" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About StayKnown", href: "/about" },
      { label: "Press & Updates", href: "/press-updates" },
      { label: "Google Play Recognition", href: "/recognition/google-play-indie-corner" },
      { label: "Contact", href: "/contact" },
      { label: "Submit Request", href: "/submit-request" },
      { label: "Submit Feature", href: "/submit-feature" },
      { label: "Creator Apply", href: "/creator-apply" },
      { label: "Donate", href: "/donate" },
    ],
  },
  {
    title: "Legal & Security",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Acceptable Use", href: "/acceptable-use" },
      { label: "Data Retention", href: "/retention" },
      { label: "Security Disclosure", href: "/security" },
      { label: "Law Enforcement Requests", href: "/law" },
      { label: "Billing & Refunds", href: "/billing-policy" },
      { label: "Creator Policy", href: "/creator-policy" },
      { label: "Donor Policy", href: "/donor-policy" },
    ],
  },
];

function PremiumIcon({ name, className = "" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, string[]> = {
    consent: [
      "M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10Z",
      "M9.5 12.2 11 13.7l3.6-3.8",
    ],
    visit: [
      "M5 20V8.8c0-.55.45-1 1-1h12c.55 0 1 .45 1 1V20",
      "M8 7.8V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5v2.3",
      "M3 20h18",
      "M9 12h6",
    ],
    live: [
      "M12 19a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z",
      "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z",
      "M12 12h.01",
    ],
    sos: [
      "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z",
      "M12 7v6",
      "M12 17h.01",
    ],
    check: ["m5 12 4 4L19 6"],
    student: [
      "m3 9 9-5 9 5-9 5-9-5Z",
      "M7 11.2V16c2.8 2.1 7.2 2.1 10 0v-4.8",
    ],
    travel: [
      "M4 17 17 4",
      "m14 3 3 1 1 3",
      "M8 7 5 4",
      "M17 16 20 19",
      "M3 21h18",
    ],
    family: [
      "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
      "M16.5 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
      "M3 20v-2a5 5 0 0 1 10 0v2",
      "M13 20v-1.5a4 4 0 0 1 8 0V20",
    ],
    shield: [
      "M12 22s8-3.8 8-10V5l-8-3-8 3v7c0 6.2 8 10 8 10Z",
      "m8.8 12 2.1 2.1 4.6-4.8",
    ],
    privacy: [
      "M6 11V8a6 6 0 0 1 12 0v3",
      "M5 11h14v10H5z",
      "M12 15v2",
    ],
    proof: [
      "M7 3h8l4 4v14H7z",
      "M15 3v5h5",
      "m10 15 1.5 1.5L15 13",
    ],
    chat: [
      "M4 5h16v11H9l-5 4V5Z",
      "M8 9h8",
      "M8 12h6",
    ],
    language: [
      "M4 5h8",
      "M8 3v2",
      "M5 8c1.5 3 3.8 5.2 7 6.5",
      "M11 8c-.8 2.2-2.3 4.1-4.5 5.6",
      "m14 19 3.2-8 3.3 8",
      "M15.3 16h4",
    ],
    voice: [
      "M9 4a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0V4Z",
      "M5 10a7 7 0 0 0 14 0",
      "M12 17v4",
      "M8 21h8",
    ],
    question: [
      "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
      "M9.8 9a2.4 2.4 0 1 1 3.8 1.95c-.95.68-1.6 1.18-1.6 2.3",
      "M12 16.8h.01",
    ],
    arrow: ["M5 12h14", "m13 6 6 6-6 6"],
  };

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}

function GooglePlayMark() {
  return (
    <svg
      viewBox="0 0 512 512"
      aria-hidden="true"
      className="h-[18px] w-[18px] shrink-0"
    >
      <path
        d="M96 38.4v435.2c0 17.2 18.8 27.8 33.5 18.8l251.3-153.7L96 38.4z"
        fill="#34A853"
      />
      <path
        d="M96 38.4l284.8 300.3 68.2-41.7c22.7-13.9 22.7-46.8 0-60.7L380.8 194.6 96 38.4z"
        fill="#4285F4"
      />
      <path d="M96 38.4l284.8 156.2L294.2 256 96 38.4z" fill="#FBBC04" />
      <path
        d="M96 473.6 294.2 256l86.6 82.7L129.5 492.4C114.8 501.4 96 490.8 96 473.6z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GooglePlayDownloadButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={GOOGLE_PLAY_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Download StayKnown on Google Play"
      className={`
        sk-google-play-button group relative inline-flex h-11 min-w-[166px]
        items-center justify-center gap-2.5 overflow-hidden rounded-[15px]
        border border-white/90 bg-white px-4
        shadow-[0_12px_30px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,1),inset_0_-5px_12px_rgba(0,0,0,0.08)]
        transition duration-200
        hover:-translate-y-px hover:border-white/24 hover:bg-[#111111]
        active:translate-y-0 active:scale-[0.985]
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-white/40 ${className}
      `}
    >
      <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-white/95 transition group-hover:bg-white/22" />

      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] border border-black/[0.06] bg-[linear-gradient(145deg,#ffffff,#ececec)] shadow-[inset_0_1px_0_rgba(255,255,255,1),0_5px_11px_rgba(0,0,0,0.10)]">
        <GooglePlayMark />
      </span>

      <span className="flex flex-col items-start leading-none">
        <span className="sk-google-play-kicker text-[7px] font-black uppercase tracking-[0.16em]">
          Get it on
        </span>
        <span className="sk-google-play-label mt-1 text-[12.5px] font-black tracking-[-0.035em]">
          Google Play
        </span>
      </span>
    </a>
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  body?: string;
  align?: "left" | "center";
}) {
  const centered = align === "center";

  return (
    <div
      data-sk-reveal
      className={`sk-reveal ${centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl text-left"}`}
    >
      <div className="text-[10px] font-black uppercase tracking-[0.28em] text-white/42">
        {eyebrow}
      </div>
      <h2 className="sk-sharp-type mt-4 text-[34px] font-black leading-[0.98] tracking-[-0.065em] text-white sm:text-[46px] md:text-[56px]">
        {title}
      </h2>
      {body ? (
        <p className="mt-5 text-[14px] font-semibold leading-relaxed text-white/62 sm:text-[15px] md:text-[16px]">
          {body}
        </p>
      ) : null}
    </div>
  );
}

function CinematicHeroSection({ slides }: { slides: CinematicHeroSlide[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [isPaused, slides.length]);

  const activeSlide = slides[activeIndex] ?? slides[0];

  if (!activeSlide) return null;

  return (
    <section
      className="relative isolate h-[calc(100svh-82px)] min-h-[640px] w-full overflow-hidden bg-black sm:min-h-[690px] md:min-h-[720px] lg:min-h-[760px]"
      aria-label="StayKnown story introduction"
    >
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-[1050ms] ease-out ${
              index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-hidden={index !== activeIndex}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              quality={82}
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: slide.objectPosition ?? "center center" }}
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-black/42" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.22)_30%,rgba(0,0,0,0.72)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_68%,rgba(0,0,0,0.92),transparent_54%)]" />
      <div className="absolute inset-y-0 left-0 hidden w-[64%] bg-[linear-gradient(90deg,rgba(0,0,0,0.9),rgba(0,0,0,0.42),transparent)] md:block" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[linear-gradient(180deg,rgba(0,0,0,0.54),transparent)]" />

      <div className="relative z-10 mx-auto flex h-full max-w-6xl items-end px-4 pb-7 sm:px-5 sm:pb-9 md:items-center md:pb-0 lg:px-6">
        <div className="sk-cinematic-card sk-glass-bevel w-full max-w-[610px] overflow-hidden rounded-[30px] border border-white/18 bg-black/52 p-5 text-white shadow-[0_34px_110px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:p-6 md:rounded-[38px] md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(255,255,255,0.18),transparent_48%)]" />

          <div className="relative" aria-live="polite">
            <div className="inline-flex min-h-8 items-center rounded-full border border-white/15 bg-white/[0.08] px-3 text-[10px] font-black uppercase tracking-[0.24em] text-white/76 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
              {activeSlide.eyebrow}
            </div>

            <h1 className="sk-sharp-type mt-4 max-w-[13ch] text-[42px] font-black leading-[0.92] tracking-[-0.075em] text-white sm:text-[56px] md:text-[64px] lg:text-[70px]">
              {activeSlide.title}
            </h1>

            <p className="mt-4 max-w-[52ch] text-[14px] font-semibold leading-relaxed text-white/78 sm:text-[15px] md:text-[16px]">
              {activeSlide.body}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={activeSlide.href}
                className="sk-white-bevel inline-flex h-10 items-center justify-center rounded-[15px] border border-white bg-white px-5 text-[11px] font-black tracking-[-0.01em] !text-black transition duration-200 hover:-translate-y-px hover:border-white/25 hover:bg-[#111111] hover:!text-white active:translate-y-0 active:scale-[0.99] active:!text-white visited:!text-black focus:!text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                Learn More
              </a>

              <GooglePlayDownloadButton className="w-full sm:w-auto" />
            </div>

            <a
              href="#guided-demo"
              className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-full px-1 text-[11px] font-black text-white/72 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
            >
              Preview how a safety session works
              <PremiumIcon name="arrow" className="h-4 w-4" />
            </a>

            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className="group flex h-9 w-9 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                  aria-label={`Show StayKnown hero slide ${index + 1}`}
                  aria-pressed={index === activeIndex}
                >
                  <span
                    className={`block h-2.5 rounded-full transition-all duration-300 ${
                      index === activeIndex
                        ? "w-7 bg-white shadow-[0_0_14px_rgba(255,255,255,0.28)]"
                        : "w-2.5 bg-white/35 group-hover:bg-white/65"
                    }`}
                  />
                </button>
              ))}

              <button
                type="button"
                onClick={() => setIsPaused((current) => !current)}
                className="ml-1 inline-flex h-9 items-center rounded-full border border-white/12 bg-white/[0.06] px-3 text-[9px] font-black uppercase tracking-[0.16em] text-white/68 transition hover:border-white/20 hover:bg-white/[0.1] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                aria-label={isPaused ? "Resume hero slides" : "Pause hero slides"}
              >
                {isPaused ? "Resume" : "Pause"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustRibbon() {
  const items = [
    ["consent", "Approved contacts only"],
    ["visit", "User-started sessions"],
    ["privacy", "No hidden tracking"],
    ["check", "Access ends with the flow"],
    ["chat", "Secure chat & translation"],
    ["sos", "Emergency-ready context"],
  ] as const;

  return (
    <section
      aria-label="StayKnown safety and communication principles"
      className="relative z-20 border-y border-white/[0.08] bg-black"
    >
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-5 lg:px-6 lg:py-0">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 lg:gap-px lg:bg-white/[0.08] lg:px-px">
          {items.map(([icon, label]) => (
            <div
              key={label}
              className={`
                relative flex min-h-[82px] flex-col items-center justify-center
                gap-2 rounded-[18px] border border-white/[0.1] bg-black px-2.5
                text-center text-[9.5px] font-black leading-tight
                tracking-[-0.01em] text-white/70
                shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]
                sm:min-h-[86px] sm:px-3 sm:text-[10.5px]
                lg:min-h-[82px] lg:flex-row lg:gap-2.5 lg:rounded-none
                lg:border-0 lg:px-3 lg:text-[11px] lg:shadow-none
              `}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] border border-white/[0.12] bg-[linear-gradient(145deg,rgba(255,255,255,0.12),rgba(255,255,255,0.025))] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_10px_24px_rgba(0,0,0,0.38)]">
                <PremiumIcon name={icon} className="h-4 w-4 text-white/88" />
              </span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StayKnownIntroSection() {
  const pillars = [
    {
      icon: "consent" as const,
      eyebrow: "Consent first",
      title: "Care without permanent surveillance.",
      body: "Approved contacts, intentional sharing, visible privacy boundaries, and revocable access keep safety support connected to the user’s choice.",
    },
    {
      icon: "visit" as const,
      eyebrow: "Real movement",
      title: "Built around what is happening.",
      body: "A Visit can explain the destination, current safety state, selected recipients, and when LIVE access should begin or end.",
    },
    {
      icon: "sos" as const,
      eyebrow: "Clear escalation",
      title: "Context travels with urgent alerts.",
      body: "SOS, safety evidence, check-ins, and emergency contacts help trusted people understand what happened and what they should verify next.",
    },
  ];

  return (
    <section id="stayknown-intro" className="relative z-10 overflow-hidden bg-black">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-white/[0.035] blur-[110px]" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-5 sm:py-20 lg:px-6 lg:py-24">
        <SectionHeading
          eyebrow="Why StayKnown exists"
          title="Safety should begin before danger becomes a headline."
          body="StayKnown is built for travel, school, family movement, visits, night outings, ride-hailing, emergencies, and everyday moments where trusted people need meaningful safety context."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {pillars.map((pillar) => (
            <article
              key={pillar.title}
              data-sk-reveal
              className="sk-reveal sk-dark-bevel group relative h-full overflow-hidden rounded-[30px] border border-white/[0.1] bg-white/[0.045] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.38)] transition duration-300 hover:-translate-y-1 hover:border-white/[0.16] sm:p-6"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.1),transparent_48%)]" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-[17px] border border-white/[0.16] bg-[linear-gradient(145deg,rgba(255,255,255,0.15),rgba(255,255,255,0.025))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_14px_28px_rgba(0,0,0,0.42)]">
                  <PremiumIcon name={pillar.icon} className="h-5 w-5" />
                </div>
                <div className="mt-5 text-[10px] font-black uppercase tracking-[0.22em] text-white/42">
                  {pillar.eyebrow}
                </div>
                <h3 className="sk-sharp-type mt-3 text-[24px] font-black leading-[1.02] tracking-[-0.05em] text-white">
                  {pillar.title}
                </h3>
                <p className="mt-4 text-[13px] font-semibold leading-relaxed text-white/58 sm:text-[14px]">
                  {pillar.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      icon: "consent" as const,
      number: "01",
      title: "Choose your approved contacts",
      body: "Choose and approve the people who may receive your safety information.",
    },
    {
      icon: "visit" as const,
      number: "02",
      title: "Start the right flow",
      body: "Choose a Visit, I’M SAFE check-in, Capture, or SOS based on the situation.",
    },
    {
      icon: "live" as const,
      number: "03",
      title: "Share useful context",
      body: "Communicate the destination, LIVE state, location confidence, and active safety status.",
    },
    {
      icon: "sos" as const,
      number: "04",
      title: "Escalate when necessary",
      body: "Notify configured contacts when a check-in is missed or an urgent flow is activated.",
    },
    {
      icon: "check" as const,
      number: "05",
      title: "Finish with clarity",
      body: "Confirm safety or deliberately close the session so trusted people are not left uncertain.",
    },
  ];

  return (
    <section id="how-it-works" className="relative bg-[#050505]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-5 sm:py-20 lg:px-6 lg:py-24">
        <SectionHeading
          eyebrow="How StayKnown works"
          title="A complete safety session, not just a moving dot."
          body="The StayKnown flow explains who has access, why the session exists, what trusted people receive, and how the safety state ends."
        />

        <div className="mt-11 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, index) => (
            <article
              key={step.number}
              data-sk-reveal
              className="sk-reveal relative overflow-hidden rounded-[26px] border border-white/[0.1] bg-black p-5 shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
            >
              <div className="absolute right-4 top-3 text-[38px] font-black tracking-[-0.08em] text-white/[0.06]">
                {step.number}
              </div>
              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-[15px] border border-white/[0.14] bg-[linear-gradient(145deg,rgba(255,255,255,0.13),rgba(255,255,255,0.025))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.17),0_12px_24px_rgba(0,0,0,0.45)]">
                  <PremiumIcon name={step.icon} className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-[18px] font-black leading-tight tracking-[-0.035em] text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-[12px] font-semibold leading-relaxed text-white/52">
                  {step.body}
                </p>
              </div>
              {index < steps.length - 1 ? (
                <div className="pointer-events-none absolute -right-3 top-1/2 hidden h-px w-6 bg-white/20 lg:block" />
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}


type ChatMode = "secure" | "translation" | "expression";

function ChatAwarenessSection() {
  const [activeMode, setActiveMode] = useState<ChatMode>("secure");

  const modes = {
    secure: {
      icon: "privacy" as const,
      label: "Protected entry",
      eyebrow: "Secure approved-contact chat",
      title:
        "Private safety conversations stay connected to people you approved.",
      body:
        "StayKnown Chat is designed around recognizable approved contacts. Supported biometric or device-level protection can add another barrier before private conversations open.",
      image: "/hero/secure-chat-biometric.png",
      imageAlt:
        "StayKnown secure chat screen with biometric or device protection",
      points: [
        "Chat access is connected to approved StayKnown relationships.",
        "Protected entry can use supported biometric or device-level security.",
        "Identity and safety recognition remain visible around communication.",
      ],
      href: "/learn/secure-chat-protection",
      hrefLabel: "Secure chat protection",
    },
    translation: {
      icon: "language" as const,
      label: "Translation",
      eyebrow: "Language-aware communication",
      title:
        "Trusted people can understand messages across language differences.",
      body:
        "StayKnown supports recipient language preferences and translated message handling, helping safety and everyday communication remain clearer across multilingual relationships.",
      image: "/hero/chat-translation.png",
      imageAlt: "StayKnown language-aware translated chat screen",
      points: [
        "Recipients can use their selected supported chat language.",
        "Translation helps safety messages remain understandable.",
        "Language choice is part of the account communication experience.",
      ],
      href: "/learn/language-aware-chat",
      hrefLabel: "Language-aware chat",
    },
    expression: {
      icon: "voice" as const,
      label: "Voice & media",
      eyebrow: "Richer communication",
      title:
        "Voice notes, media, stickers, and stories make trusted communication more human.",
      body:
        "StayKnown Chat supports expressive communication around safety and everyday connection, including voice notes, media, stickers, and other supported message formats.",
      image: "/hero/chat-stickers-voice.png",
      imageAlt:
        "StayKnown chat screen showing voice notes, stickers, and media",
      points: [
        "Voice notes help when typing is inconvenient.",
        "Media and expressive content add useful communication context.",
        "Chat remains part of the approved-contact safety system.",
      ],
      href: "/learn/chat",
      hrefLabel: "Explore StayKnown Chat",
    },
  } satisfies Record<
    ChatMode,
    {
      icon: IconName;
      label: string;
      eyebrow: string;
      title: string;
      body: string;
      image: string;
      imageAlt: string;
      points: readonly string[];
      href: string;
      hrefLabel: string;
    }
  >;

  const active = modes[activeMode];

  return (
    <section
      id="chat-awareness"
      aria-labelledby="chat-awareness-title"
      className="relative overflow-hidden bg-black"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[720px] w-[1080px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />
      <div className="pointer-events-none absolute left-[8%] top-[18%] h-48 w-48 rounded-full bg-[#8ff3d0]/[0.045] blur-[85px]" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-5 sm:py-20 lg:px-6 lg:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#8ff3d0]">
            Safety-aware communication
          </div>
          <h2
            id="chat-awareness-title"
            className="sk-sharp-type mt-4 text-[34px] font-black leading-[0.98] tracking-[-0.065em] text-white sm:text-[46px] md:text-[56px]"
          >
            StayKnown is also a secure communication experience for approved
            contacts.
          </h2>
          <p className="mx-auto mt-5 max-w-[72ch] text-[14px] font-semibold leading-relaxed text-white/62 sm:text-[15px] md:text-[16px]">
            Chat connects protected entry, recognizable people, language-aware
            messages, voice, media, and everyday communication to the same
            approved-contact safety layer.
          </p>
        </div>

        <div className="mt-9 flex flex-wrap justify-center gap-2">
          {(Object.keys(modes) as ChatMode[]).map((mode) => {
            const item = modes[mode];
            const selected = mode === activeMode;

            return (
              <button
                key={mode}
                type="button"
                onClick={() => setActiveMode(mode)}
                aria-pressed={selected}
                className={`inline-flex min-h-10 items-center gap-2 rounded-[14px] border px-3.5 text-[9px] font-black uppercase tracking-[0.11em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8ff3d0]/45 ${
                  selected
                    ? "border-white bg-white text-black shadow-[0_10px_26px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,1)]"
                    : "border-white/[0.13] bg-black text-white/52 hover:border-white/[0.28] hover:text-white"
                }`}
              >
                <PremiumIcon name={item.icon} className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid overflow-hidden rounded-[34px] border border-white/[0.13] bg-[#050505] shadow-[0_38px_112px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.075)] lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative min-h-[520px] overflow-hidden border-b border-white/[0.09] lg:min-h-[680px] lg:border-b-0 lg:border-r">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.075]" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />

            <div
              key={activeMode}
              className="sk-chat-device-enter absolute inset-0 flex items-center justify-center"
            >
              <Image
                src={active.image}
                alt={active.imageAlt}
                width={430}
                height={880}
                quality={90}
                className="relative z-10 h-auto w-[230px] object-contain drop-shadow-[0_38px_82px_rgba(0,0,0,0.9)] sm:w-[270px]"
              />

              <div className="absolute right-[8%] top-[18%] hidden w-[145px] rotate-[8deg] opacity-38 sm:block">
                <Image
                  src={
                    activeMode === "secure"
                      ? "/hero/chat-translation.png"
                      : "/hero/secure-chat-biometric.png"
                  }
                  alt=""
                  width={300}
                  height={620}
                  className="h-auto w-full object-contain drop-shadow-[0_28px_64px_rgba(0,0,0,0.82)]"
                />
              </div>
            </div>

            <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#8ff3d0]/45 bg-black px-3 py-2 text-[#8ff3d0] shadow-[0_0_26px_rgba(143,243,208,0.14)]">
              <span className="h-2 w-2 rounded-full bg-[#8ff3d0]" />
              <span className="whitespace-nowrap text-[8px] font-black uppercase tracking-[0.15em]">
                Approved-contact communication
              </span>
            </div>
          </div>

          <div
            key={`${activeMode}-copy`}
            className="sk-chat-copy-enter flex min-h-[600px] flex-col p-5 sm:p-7 lg:min-h-[680px] lg:p-9"
          >
            <div className="text-[9px] font-black uppercase tracking-[0.22em] text-[#8ff3d0]">
              {active.eyebrow}
            </div>
            <h3 className="sk-sharp-type mt-4 max-w-[15ch] text-[35px] font-black leading-[0.96] tracking-[-0.062em] text-white sm:text-[44px] lg:text-[49px]">
              {active.title}
            </h3>
            <p className="mt-5 max-w-[61ch] text-[13px] font-semibold leading-relaxed text-white/58 sm:text-[14px]">
              {active.body}
            </p>

            <div className="mt-7 grid gap-3">
              {active.points.map((point, index) => (
                <div
                  key={point}
                  className={`flex items-start gap-3 rounded-[19px] border bg-black p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] ${
                    index === 0
                      ? "border-[#8ff3d0]/42"
                      : "border-white/[0.11]"
                  }`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] border border-[#8ff3d0]/40 text-[#8ff3d0]">
                    <PremiumIcon name="check" className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[11.5px] font-semibold leading-relaxed text-white/62 sm:text-[12.5px]">
                    {point}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-auto flex flex-wrap gap-2.5 pt-7">
              <a
                href={active.href}
                className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-white bg-white px-4 text-[10px] font-black text-black shadow-[0_10px_26px_rgba(0,0,0,0.36),inset_0_1px_0_rgba(255,255,255,1)] transition hover:-translate-y-px hover:bg-black hover:text-white"
              >
                {active.hrefLabel}
                <PremiumIcon name="arrow" className="h-3.5 w-3.5" />
              </a>
              <a
                href="/features"
                className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-white/[0.15] bg-black px-4 text-[10px] font-black text-white/66 transition hover:border-white hover:text-white"
              >
                Full feature atlas
                <PremiumIcon name="arrow" className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AudienceSection() {
  const audiences = [
    {
      icon: "student" as const,
      title: "Students and young adults",
      body: "Late study, campus movement, parties, new accommodation, and independent life without constant tracking calls.",
      action: "Share a Visit only when it matters.",
      href: "/students",
    },
    {
      icon: "travel" as const,
      title: "Travelers and ride users",
      body: "Unfamiliar routes, ride-hailing, airport movement, work trips, visits, and destinations that deserve extra safety context.",
      action: "Keep trusted people informed until arrival.",
      href: "/travel-rides",
    },
    {
      icon: "family" as const,
      title: "Families and guardians",
      body: "Support teens and young adults while preserving independence, approval, guardian consent, and visible privacy boundaries.",
      action: "Care without invisible surveillance.",
      href: "/families-guardians",
    },
  ];

  return (
    <section id="use-cases" className="bg-[#050505]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-5 sm:py-20 lg:px-6 lg:py-24">
        <SectionHeading
          eyebrow="Made for real people"
          title="Different lives. One consent-based safety layer."
          body="StayKnown can support independence and reassurance at the same time because the person being protected remains central to the sharing decision."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {audiences.map((audience) => (
            <article
              key={audience.title}
              data-sk-reveal
              className="sk-reveal relative overflow-hidden rounded-[30px] border border-white/[0.1] bg-black p-5 shadow-[0_24px_70px_rgba(0,0,0,0.42)] sm:p-6"
            >
              <div className="pointer-events-none absolute right-[-80px] top-[-80px] h-44 w-44 rounded-full bg-white/[0.045] blur-3xl" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-[17px] border border-white/[0.15] bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(255,255,255,0.025))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_15px_30px_rgba(0,0,0,0.42)]">
                  <PremiumIcon name={audience.icon} className="h-5 w-5" />
                </div>
                <h3 className="sk-sharp-type mt-5 text-[25px] font-black leading-[1] tracking-[-0.05em] text-white">
                  {audience.title}
                </h3>
                <p className="mt-4 text-[13px] font-semibold leading-relaxed text-white/56">
                  {audience.body}
                </p>
                <div className="mt-5 border-t border-white/[0.08] pt-4 text-[12px] font-black text-white/76">
                  {audience.action}
                </div>
                <a
                  href={audience.href}
                  className="mt-4 inline-flex h-9 items-center gap-2 rounded-[13px] border border-white/[0.15] bg-black px-3.5 text-[10px] font-black text-white/68 transition hover:border-white hover:bg-white hover:text-black"
                >
                  Explore this safety path
                  <PremiumIcon name="arrow" className="h-3.5 w-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AppPreviewSection() {
  return (
    <section id="app-preview" className="w-full bg-black">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-5 sm:py-20 lg:px-6 lg:py-24">
        <SectionHeading
          eyebrow="Inside the app"
          title="Built for movement, trust, SOS, visits, and approved contacts."
          body="Explore StayKnown across safety, consent, communication, verification, and emergency support."
        />

        <div className="mt-9">
          <HeroSlider slides={APP_SLIDES} intervalMs={6000} />
        </div>

        <div data-sk-reveal className="sk-reveal mt-7 flex justify-center">
          <GooglePlayDownloadButton className="w-full max-w-[205px] sm:w-auto" />
        </div>
      </div>
    </section>
  );
}

function PlansSection() {
  const plans = [
    {
      name: "Starter",
      kicker: "Core safety access",
      featured: false,
      pricePrimary: "Free",
      priceSecondary: "No paid subscription required",
      capacities: ["1 approved contact", "Core Visit access", "Twice-daily I’M SAFE"],
      features: [
        "Start and end Visits",
        "Add a destination and review Visit history",
        "Twice-daily I’M SAFE check-ins",
        "Basic emergency-contact and safety flows",
        "Core safety map and navigation",
        "Basic account, profile, and safety-proof access",
      ],
    },
    {
      name: "Pro",
      kicker: "Full safety system",
      featured: true,
      pricePrimary: "Nigeria · ₦9,999 monthly",
      priceSecondary:
        "₦99,999 yearly · Global $14.99 monthly or $149.99 yearly",
      capacities: [
        "3 approved contacts",
        "6 SOS contacts",
        "3 SOS responders",
        "1 Gallery photo",
      ],
      features: [
        "Everything included in Starter",
        "LIVE location sharing during Visits",
        "Full SOS system",
        "Emergency phrase and escalation-timing controls",
        "SOS history and responder management",
        "Rich Visit context, destination guidance, and verification",
        "Chat access and basic translation",
        "Story posting",
        "Premium Pro font collection",
        "Contact restriction control",
      ],
    },
    {
      name: "Pro Max",
      kicker: "Complete premium access",
      featured: false,
      pricePrimary: "Nigeria · ₦14,999 monthly",
      priceSecondary:
        "₦149,999 yearly · Global $24.99 monthly or $249.99 yearly",
      capacities: [
        "6 approved contacts",
        "10 SOS contacts",
        "6 SOS responders",
        "Up to 2 Gallery photos",
      ],
      features: [
        "Everything included in Pro",
        "Priority SOS responder system",
        "Full advanced chat system",
        "Full translation support",
        "Advanced chat personalization",
        "Full story creation",
        "Full destination intelligence",
        "Premium personalization",
        "Full designer font library",
        "Advanced restrict and block controls",
        "Highest StayKnown safety-feature capacity",
      ],
    },
  ];

  return (
    <section id="plans" className="relative overflow-hidden bg-[#050505]">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.035] blur-[140px]" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-5 sm:py-20 lg:px-6 lg:py-24">
        <SectionHeading
          eyebrow="Plans and pricing"
          title="See the real StayKnown capacity before opening the Play Store."
          body="Choose Starter, Pro, or Pro Max based on the number of trusted people and safety tools you need. Final currency, provider, and checkout availability are confirmed inside StayKnown."
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              data-sk-reveal
              className={`sk-reveal sk-plan-card group relative overflow-hidden rounded-[30px] border p-5 shadow-[0_24px_66px_rgba(0,0,0,0.40),inset_0_1px_0_rgba(255,255,255,0.07)] transition duration-300 hover:-translate-y-1 sm:p-6 ${
                plan.featured
                  ? "border-white/80 bg-white text-black hover:border-white hover:shadow-[0_28px_72px_rgba(0,0,0,0.46),inset_0_1px_0_rgba(255,255,255,1)]"
                  : "border-white/[0.11] bg-black text-white hover:border-white/[0.2] hover:bg-white/[0.035]"
              }`}
            >
              <div
                className={`pointer-events-none absolute inset-0 ${
                  plan.featured
                    ? "bg-[radial-gradient(circle_at_14%_0%,rgba(255,255,255,1),transparent_46%)]"
                    : "bg-[radial-gradient(circle_at_14%_0%,rgba(255,255,255,0.10),transparent_46%)]"
                }`}
              />

              <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div
                      className={`text-[9px] font-black uppercase tracking-[0.21em] ${
                        plan.featured ? "text-black/44" : "text-white/40"
                      }`}
                    >
                      {plan.kicker}
                    </div>
                    <h3 className="sk-sharp-type mt-2 text-[29px] font-black tracking-[-0.06em]">
                      {plan.name}
                    </h3>
                  </div>

                  {plan.featured ? (
                    <span className="inline-flex h-7 items-center rounded-full border border-black/[0.08] bg-black/[0.045] px-2.5 text-[8px] font-black uppercase tracking-[0.16em] text-black/62">
                      Recommended
                    </span>
                  ) : null}
                </div>

                <div className="mt-5 text-[16px] font-black tracking-[-0.035em]">
                  {plan.pricePrimary}
                </div>
                <div
                  className={`mt-2 min-h-[42px] text-[10.5px] font-bold leading-relaxed ${
                    plan.featured ? "text-black/52" : "text-white/46"
                  }`}
                >
                  {plan.priceSecondary}
                </div>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {plan.capacities.map((capacity) => (
                    <span
                      key={capacity}
                      className={`inline-flex min-h-7 items-center rounded-full border px-2.5 text-[9px] font-black ${
                        plan.featured
                          ? "border-black/[0.08] bg-black/[0.04] text-black/66"
                          : "border-white/[0.1] bg-white/[0.045] text-white/64"
                      }`}
                    >
                      {capacity}
                    </span>
                  ))}
                </div>

                <div
                  className={`my-5 h-px ${
                    plan.featured ? "bg-black/[0.09]" : "bg-white/[0.09]"
                  }`}
                />

                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-[11.5px] font-bold leading-relaxed"
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          plan.featured
                            ? "border-black/[0.08] bg-black/[0.045]"
                            : "border-white/[0.12] bg-white/[0.05]"
                        }`}
                      >
                        <PremiumIcon name="check" className="h-3 w-3" />
                      </span>
                      <span
                        className={
                          plan.featured ? "text-black/72" : "text-white/66"
                        }
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-7">
                  <GooglePlayDownloadButton
                    className={`w-full ${
                      plan.featured
                        ? "border-black/[0.10] hover:border-black/20"
                        : ""
                    }`}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-3xl text-center text-[10.5px] font-semibold leading-relaxed text-white/38">
          Prices may vary by billing region and payment provider. Paid plans do
          not guarantee official emergency response. StayKnown does not replace
          local emergency services.
        </p>
      </div>
    </section>
  );
}

function TrustSection() {
  const trustCards = [
    {
      icon: "privacy" as const,
      title: "Privacy is visible",
      body: "The user can understand when sharing starts, who receives it, and when an authorized safety session ends.",
      href: "/privacy",
      link: "Read the Privacy Policy",
    },
    {
      icon: "shield" as const,
      title: "Misuse is prohibited",
      body: "StayKnown’s safety policies address stalking, harassment, luring, unauthorized monitoring, abuse, and unsafe use.",
      href: "/trust-safety",
      link: "Open Trust & Safety",
    },
    {
      icon: "proof" as const,
      title: "Security can be reported",
      body: "A dedicated security disclosure page gives researchers and users a responsible way to report concerns.",
      href: "/security",
      link: "View Security Disclosure",
    },
  ];

  const comparison = [
    ["Sharing model", "User-started Visits and safety flows"],
    ["Contact access", "Approved and intentional"],
    ["Safety information", "Location plus destination, state, proof, and context"],
    ["Permanent tracking required", "No"],
    ["Professional emergency dispatch", "Not currently provided"],
  ];

  return (
    <section id="trust" className="bg-black">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-5 sm:py-20 lg:px-6 lg:py-24">
        <SectionHeading
          eyebrow="Trust and responsibility"
          title="Clear policies for safer, more respectful use."
          body="Explore StayKnown’s privacy, consent, anti-stalking, emergency, child-safety, billing, and security commitments before relying on the service."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {trustCards.map((card) => (
            <article
              key={card.title}
              data-sk-reveal
              className="sk-reveal rounded-[30px] border border-white/[0.1] bg-white/[0.045] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.42)] sm:p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-[17px] border border-white/[0.15] bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(255,255,255,0.025))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_15px_30px_rgba(0,0,0,0.42)]">
                <PremiumIcon name={card.icon} className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-[22px] font-black tracking-[-0.045em] text-white">
                {card.title}
              </h3>
              <p className="mt-3 text-[13px] font-semibold leading-relaxed text-white/56">
                {card.body}
              </p>
              <a
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-9 items-center gap-2 text-[11px] font-black text-white/78 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
              >
                {card.link}
                <PremiumIcon name="arrow" className="h-4 w-4" />
              </a>
            </article>
          ))}
        </div>

        <div data-sk-reveal className="sk-reveal mt-5 overflow-hidden rounded-[32px] border border-white/[0.11] bg-[#050505] shadow-[0_28px_80px_rgba(0,0,0,0.46)]">
          <div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">
                What StayKnown chooses differently
              </div>
              <h3 className="sk-sharp-type mt-3 text-[32px] font-black leading-[0.98] tracking-[-0.055em] text-white sm:text-[40px]">
                Context, consent, recognition, and escalation.
              </h3>
              <p className="mt-4 text-[13px] font-semibold leading-relaxed text-white/58 sm:text-[14px]">
                StayKnown is not being redesigned into an always-on family tracker. The competitive advantage remains a consent-recorded safety flow that tells trusted people what is happening and why access exists.
              </p>
            </div>

            <dl className="overflow-hidden rounded-[24px] border border-white/[0.1] bg-black">
              {comparison.map(([term, description], index) => (
                <div
                  key={term}
                  className={`grid gap-2 px-4 py-4 sm:grid-cols-[0.8fr_1.2fr] sm:items-center ${
                    index > 0 ? "border-t border-white/[0.08]" : ""
                  }`}
                >
                  <dt className="text-[11px] font-black uppercase tracking-[0.14em] text-white/40">
                    {term}
                  </dt>
                  <dd className="text-[13px] font-bold leading-relaxed text-white/76">
                    {description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}


function FaqSection() {
  return (
    <section
      id="faq"
      className="relative scroll-mt-[150px] overflow-hidden bg-black lg:scroll-mt-[82px]"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[920px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.03] blur-[140px]" />

      <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-5 sm:py-20 lg:px-6 lg:py-24">
        <SectionHeading
          eyebrow="Questions answered"
          title="Understand the safety boundary before depending on it."
          body="These are the most important questions about StayKnown’s consent model, location access, plans, and emergency role."
        />

        <div className="mx-auto mt-9 grid max-w-4xl gap-3">
          {HOME_FAQS.map((faq, index) => (
            <details
              key={faq.question}
              data-sk-reveal
              className={`
                sk-reveal group overflow-hidden rounded-[22px] border
                border-white/[0.1] bg-white/[0.035]
                shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]
                transition open:border-white/[0.16] open:bg-white/[0.055]
              `}
            >
              <summary
                className={`
                  flex min-h-14 cursor-pointer list-none items-center gap-3
                  px-4 py-3 text-left marker:hidden sm:px-5
                  [&::-webkit-details-marker]:hidden
              `}
              >
                <span
                  className={`
                    flex h-8 w-8 shrink-0 items-center justify-center
                    rounded-[11px] border border-white/[0.11]
                    bg-[linear-gradient(145deg,rgba(255,255,255,0.11),rgba(255,255,255,0.025))]
                    text-white/68
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_8px_18px_rgba(0,0,0,0.3)]
              `}
                >
                  <PremiumIcon
                    name="question"
                    className="h-3.5 w-3.5"
                  />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-[8px] font-black uppercase tracking-[0.18em] text-white/30">
                    Question {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-1 block text-[12px] font-black leading-snug text-white/82 sm:text-[13px]">
                    {faq.question}
                  </span>
                </span>

                <span
                  aria-hidden="true"
                  className={`
                    flex h-7 w-7 shrink-0 items-center justify-center
                    rounded-full border border-white/[0.1] bg-white/[0.035]
                    text-[16px] font-semibold text-white/48 transition
                    group-open:rotate-45 group-open:border-white/[0.18]
                    group-open:bg-white/[0.08] group-open:text-white
              `}
                >
                  +
                </span>
              </summary>

              <div className="border-t border-white/[0.08] px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
                <p className="pl-11 text-[11.5px] font-semibold leading-relaxed text-white/60 sm:text-[12.5px]">
                  {faq.answer}
                </p>
              </div>
            </details>
          ))}
        </div>

        <div
          data-sk-reveal
          className={`
            sk-reveal mx-auto mt-5 flex max-w-4xl flex-col items-center
            justify-between gap-3 rounded-[20px] border border-white/[0.09]
            bg-white/[0.03] px-4 py-3 text-center sm:flex-row sm:text-left
              `}
        >
          <p className="text-[10.5px] font-semibold leading-relaxed text-white/48">
            More onboarding, account, Visit, SOS, payment, and troubleshooting
            guidance is available in the StayKnown Help Center.
          </p>

          <a
            href="/help-center"
            className={`
              inline-flex min-h-9 shrink-0 items-center gap-2 rounded-[13px]
              border border-white/[0.12] bg-white/[0.05] px-3.5 text-[9px]
              font-black uppercase tracking-[0.12em] text-white/68 transition
              hover:border-white/[0.22] hover:bg-white/[0.1] hover:text-white
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-white/35
              `}
          >
            Open Help Center
            <PremiumIcon name="arrow" className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection() {
  return (
    <section className="bg-[#050505] px-4 py-10 sm:px-5 sm:py-14 lg:px-6">
      <div data-sk-reveal className="sk-reveal sk-white-bevel mx-auto max-w-6xl overflow-hidden rounded-[34px] border border-white bg-white p-6 text-black shadow-[0_24px_0_-17px_rgba(255,255,255,0.85),0_36px_100px_rgba(0,0,0,0.48)] sm:p-9">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/42">
              StayKnown on Android
            </div>
            <h2 className="sk-sharp-type mt-3 max-w-[18ch] text-[34px] font-black leading-[0.96] tracking-[-0.065em] text-black sm:text-[46px]">
              Stay independent. Keep the right people informed.
            </h2>
            <p className="mt-4 max-w-2xl text-[13px] font-semibold leading-relaxed text-black/58 sm:text-[14px]">
              Download StayKnown, choose your approved contacts, and prepare your safety settings before you need them.
            </p>
          </div>

          <GooglePlayDownloadButton className="w-full border-black/[0.10] sm:w-auto" />
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="relative z-20 w-full border-t border-white/[0.08] bg-black">
      <div className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-5 sm:pb-10 sm:pt-12 lg:px-6">
        <div className="grid gap-9 lg:grid-cols-[1.15fr_2.85fr]">
          <div>
            <div className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-[16px] border border-white bg-white shadow-[0_12px_28px_rgba(0,0,0,0.40),inset_0_1px_0_rgba(255,255,255,1),inset_0_-5px_12px_rgba(0,0,0,0.09)]">
                <Image src="/6logo.png" alt="" width={24} height={24} />
              </span>
              <span>
                <span className="block text-[13px] font-black tracking-[0.2em] text-white">
                  STAYKNOWN
                </span>
                <span className="mt-1 block text-[10px] font-bold text-white/38">
                  Consent-based safety technology
                </span>
              </span>
            </div>

            <p className="mt-5 max-w-[34ch] text-[12px] font-semibold leading-relaxed text-white/42">
              StayKnown helps people share safety context with approved contacts during Visits, check-ins, SOS, and other intentional safety flows.
            </p>
            <StayKnownSocialLinks className="mt-5" />
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {FOOTER_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                  {group.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target={link.href.startsWith("http") ? "_blank" : undefined}
                        rel={
                          link.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="inline-flex min-h-8 items-center text-[12px] font-semibold leading-snug text-white/58 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/[0.08] pt-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="text-[11px] font-semibold text-white/36">
            A 6 Clement Joshua service
            <span className="ml-1 align-super text-[9px] text-white/22">™</span>
          </div>
          <div className="text-[11px] font-semibold text-white/28">
            {new Date().getFullYear()} • stay-known.com
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function StayKnownHomePage() {
  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-sk-reveal]"),
    );

    if (elements.length === 0) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.06,
        rootMargin: "0px 0px -5% 0px",
      },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="flex min-h-screen w-full max-w-full flex-col overflow-x-clip bg-black">
      <style jsx global>{`
        html,
        body {
          width: 100%;
          max-width: 100%;
          margin: 0;
          background: #000;
          color-scheme: dark;
          overflow-x: hidden;
          overscroll-behavior-x: none;
          text-rendering: geometricPrecision;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        html {
          scroll-behavior: smooth;
        }

        @supports (overflow: clip) {
          html,
          body {
            overflow-x: clip;
          }
        }

        #stayknown-intro,
        #how-it-works,
        #guided-demo,
        #chat-demo,
        #use-cases,
        #app-preview,
        #plans,
        #trust {
          scroll-margin-top: 88px;
        }

        .sk-sharp-type {
          text-wrap: balance;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.025);
        }

        .sk-menu-wrap > button,
        .sk-menu-wrap > div > button {
          min-width: 44px !important;
          min-height: 44px !important;
          background: transparent !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          box-shadow: none !important;
          border: 1px solid transparent !important;
          color: rgba(255, 255, 255, 0.92) !important;
        }

        .sk-menu-wrap > button:hover,
        .sk-menu-wrap > div > button:hover {
          background: rgba(255, 255, 255, 0.06) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          color: #ffffff !important;
        }

        .sk-menu-wrap > button:focus-visible,
        .sk-menu-wrap > div > button:focus-visible {
          outline: none !important;
          border-color: rgba(255, 255, 255, 0.16) !important;
          box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.05) !important;
        }

        .sk-cinematic-card,
        .sk-glass-bevel,
        .sk-dark-bevel,
        .sk-white-bevel,
        .sk-logo-bevel {
          position: relative;
          isolation: isolate;
        }

        .sk-glass-bevel::after,
        .sk-dark-bevel::after,
        .sk-white-bevel::after,
        .sk-logo-bevel::after {
          content: "";
          position: absolute;
          inset: 1px;
          z-index: -1;
          pointer-events: none;
          border-radius: inherit;
          border-top: 1px solid rgba(255, 255, 255, 0.11);
        }

        .sk-white-bevel::after {
          border-top-color: rgba(255, 255, 255, 0.95);
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }

        .sk-google-play-button,
        .sk-google-play-button:link,
        .sk-google-play-button:visited,
        .sk-google-play-button:focus {
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
        }

        .sk-google-play-button .sk-google-play-kicker {
          color: rgba(0, 0, 0, 0.56) !important;
          -webkit-text-fill-color: rgba(0, 0, 0, 0.56) !important;
          transition: color 180ms ease;
        }

        .sk-google-play-button .sk-google-play-label {
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
          transition: color 180ms ease;
        }

        .sk-google-play-button:hover,
        .sk-google-play-button:active {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
        }

        .sk-google-play-button:hover .sk-google-play-kicker,
        .sk-google-play-button:active .sk-google-play-kicker {
          color: rgba(255, 255, 255, 0.58) !important;
          -webkit-text-fill-color: rgba(255, 255, 255, 0.58) !important;
        }

        .sk-google-play-button:hover .sk-google-play-label,
        .sk-google-play-button:active .sk-google-play-label {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
        }

        /*
         * The app-preview controls are owned by HeroSlider.tsx. These scoped
         * overrides keep the complete component API intact while making every
         * control on this homepage more restrained and premium.
         */
        #app-preview button[aria-label="Previous StayKnown screen"],
        #app-preview button[aria-label="Next StayKnown screen"] {
          width: 38px !important;
          height: 38px !important;
          min-width: 38px !important;
          min-height: 38px !important;
        }

        #app-preview button[aria-label="Pause automatic slide movement"],
        #app-preview button[aria-label="Resume automatic slide movement"],
        #app-preview button[aria-controls="stayknown-slide-browser"] {
          min-height: 36px !important;
          padding-left: 12px !important;
          padding-right: 12px !important;
          font-size: 10px !important;
        }

        #app-preview a[aria-label^="Learn more about"] {
          min-height: 40px !important;
          padding-left: 18px !important;
          padding-right: 18px !important;
          font-size: 11px !important;
          box-shadow:
            0 12px 28px rgba(0, 0, 0, 0.32),
            inset 0 1px 0 rgba(255, 255, 255, 1),
            inset 0 -5px 12px rgba(0, 0, 0, 0.08) !important;
        }


        .sk-reveal {
          opacity: 0;
          transform: translateY(14px);
          transition:
            opacity 420ms ease-out,
            transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .sk-reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .sk-chat-device-enter {
          animation: sk-chat-device-enter 520ms cubic-bezier(0.22, 1, 0.36, 1)
            both;
        }

        .sk-chat-copy-enter {
          animation: sk-chat-copy-enter 460ms cubic-bezier(0.22, 1, 0.36, 1)
            both;
        }

        @keyframes sk-chat-device-enter {
          from {
            opacity: 0;
            transform: translate3d(-14px, 14px, 0) scale(0.965)
              rotate(-1.5deg);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1) rotate(0);
          }
        }

        @keyframes sk-chat-copy-enter {
          from {
            opacity: 0;
            transform: translate3d(18px, 0, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }

          .sk-reveal,
          .sk-reveal.is-visible,
          .sk-chat-device-enter,
          .sk-chat-copy-enter {
            opacity: 1;
            transform: none;
            transition: none;
            animation: none;
          }
        }
      `}</style>

      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-black/82 backdrop-blur-2xl">
        <div className="relative mx-auto flex min-h-[68px] w-full max-w-none items-center justify-between gap-3 px-3 sm:px-4 lg:pl-6 lg:pr-1">
          <a
            href="#top"
            className="inline-flex min-h-10 items-center gap-2.5 rounded-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
            aria-label="StayKnown homepage"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-[13px] border border-white bg-white shadow-[0_10px_24px_rgba(0,0,0,0.36),inset_0_1px_0_rgba(255,255,255,1),inset_0_-4px_10px_rgba(0,0,0,0.09)]">
              <Image src="/6logo.png" alt="" width={20} height={20} priority />
            </span>
            <span>
              <span className="block text-[12px] font-black tracking-[0.22em] text-white">
                STAYKNOWN
              </span>
              <span className="mt-0.5 hidden text-[9px] font-bold tracking-[0.04em] text-white/36 sm:block">
                Consent-based safety
              </span>
            </span>
          </a>

          <nav
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex"
            aria-label="Homepage sections"
          >
            {HOME_NAV_ITEMS.map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="inline-flex min-h-9 items-center rounded-full px-3 text-[10px] font-black text-white/58 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1">
            <a
              href={GOOGLE_PLAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-9 items-center rounded-[13px] border border-white/85 bg-white px-3.5 text-[10px] font-black !text-black shadow-[0_10px_24px_rgba(0,0,0,0.30),inset_0_1px_0_rgba(255,255,255,1),inset_0_-4px_10px_rgba(0,0,0,0.08)] transition hover:-translate-y-px hover:border-white/25 hover:bg-[#111111] hover:!text-white active:translate-y-0 visited:!text-black focus:!text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:inline-flex"
            >
              Download
            </a>
            <div className="sk-menu-wrap">
              <StayKnownActionMenu />
            </div>
            <PublicWebsiteVisitCounter />
          </div>
        </div>

        <div className="border-t border-white/[0.07] px-3 pb-2 pt-2 lg:hidden">
          <nav
            className="mx-auto grid max-w-2xl grid-cols-3 gap-1 sm:grid-cols-6"
            aria-label="Mobile homepage sections"
          >
            {HOME_NAV_ITEMS.map(([label, href]) => (
              <a
                key={`mobile-${href}`}
                href={href}
                className={`
                  inline-flex min-h-8 items-center justify-center rounded-[11px]
                  border border-white/[0.09] bg-black px-2 text-center
                  text-[8.5px] font-black leading-tight text-white/58
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]
                  transition hover:border-white/[0.2] hover:bg-white/[0.06]
                  hover:text-white focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-white/35
              `}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
              <StayKnownRecognitionPill />
      </header>

      <div id="top" />
      <CinematicHeroSection slides={STORY_SLIDES} />
      <TrustRibbon />
      <StayKnownIntroSection />
      <HowItWorksSection />
      <StayKnownHowItWorks />
      <ChatAwarenessSection />
      <StayKnownChatDemo />
      <AudienceSection />
      <AppPreviewSection />
      <PlansSection />
      <TrustSection />
      <FaqSection />
      <FinalCtaSection />
      <SiteFooter />
    </main>
  );
}
