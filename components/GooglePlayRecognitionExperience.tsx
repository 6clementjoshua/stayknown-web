"use client";

import Image from "next/image";
import {
  type CSSProperties,
  useEffect,
  useState,
} from "react";

import StayKnownSocialLinks from "@/components/StayKnownSocialLinks";

const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.stayknown.app";

type IconName =
  | "spark"
  | "shield"
  | "visit"
  | "live"
  | "sos"
  | "check"
  | "chat"
  | "guardian"
  | "device"
  | "history"
  | "delivery"
  | "arrow";

type ConfettiParticle = {
  left: number;
  delay: number;
  duration: number;
  size: number;
  rotate: number;
  drift: number;
  opacity: number;
};

type ConfettiStyle = CSSProperties & {
  "--sk-left": string;
  "--sk-delay": string;
  "--sk-duration": string;
  "--sk-size": string;
  "--sk-rotate": string;
  "--sk-drift": string;
  "--sk-opacity": string;
};

const CONFETTI: readonly ConfettiParticle[] = Array.from(
  { length: 54 },
  (_, index) => ({
    left: (index * 37 + 11) % 100,
    delay: ((index * 19) % 90) / 100,
    duration: 2.1 + ((index * 13) % 15) / 10,
    size: 4 + ((index * 7) % 8),
    rotate: (index * 47) % 360,
    drift: (index % 2 === 0 ? 1 : -1) * (18 + ((index * 11) % 74)),
    opacity: 0.38 + ((index * 9) % 48) / 100,
  }),
);

const FEATURE_CARDS = [
  {
    icon: "shield" as const,
    title: "Consent-first safety",
    body:
      "Approved contacts, visible access boundaries, and user-started sharing keep protection connected to permission rather than hidden monitoring.",
    href: "/trust-safety",
  },
  {
    icon: "visit" as const,
    title: "Visit protection",
    body:
      "A Visit can carry destination, timing, selected recipients, LIVE context, check-ins, and a deliberate verified finish.",
    href: "/how-it-works",
  },
  {
    icon: "live" as const,
    title: "LIVE context",
    body:
      "Approved contacts can understand the active safety state, location confidence, interruptions, resumed updates, and expected next action.",
    href: "/learn/live-map",
  },
  {
    icon: "sos" as const,
    title: "SOS escalation",
    body:
      "Urgent alerts can carry identity, trusted-contact context, location state, evidence, response actions, and clear active or stopped status.",
    href: "/learn/sos",
  },
  {
    icon: "check" as const,
    title: "I’M SAFE check-ins",
    body:
      "Twice-daily check-ins help a person confirm safety while missed confirmations can trigger the configured trusted-contact response flow.",
    href: "/features",
  },
  {
    icon: "chat" as const,
    title: "Safety-aware chat",
    body:
      "Approved-contact chat brings protected entry, translation, voice, media, safety cards, recognizable profiles, and expressive communication together.",
    href: "/learn/chat",
  },
  {
    icon: "guardian" as const,
    title: "Guardian safeguards",
    body:
      "Minor accounts use age-aware onboarding, guardian consent, approval continuity, and transparency instead of quietly treating every user the same.",
    href: "/families-guardians",
  },
  {
    icon: "device" as const,
    title: "Device security",
    body:
      "Device admission, trusted-session controls, biometric protection, broad security context, and account-isolated switching strengthen access protection.",
    href: "/security",
  },
  {
    icon: "history" as const,
    title: "Safety history",
    body:
      "Visit, SOS, delivery, response, location-confidence, device-health, Practice Mode, and owner-private notes can remain understandable after an event.",
    href: "/features",
  },
  {
    icon: "delivery" as const,
    title: "Delivery resilience",
    body:
      "Weak-network handling, queued safety events, push and email parity, response handoff, and delivery health reduce uncertainty when connectivity changes.",
    href: "/status",
  },
] as const;

function GooglePlayMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      aria-hidden="true"
      className={className}
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

function PremiumIcon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  const paths: Record<IconName, readonly string[]> = {
    spark: [
      "m12 2 1.4 5.2L18 9l-4.6 1.8L12 16l-1.4-5.2L6 9l4.6-1.8L12 2Z",
      "m18.5 14 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z",
    ],
    shield: [
      "M12 22s8-3.8 8-10V5l-8-3-8 3v7c0 6.2 8 10 8 10Z",
      "m8.8 12 2.1 2.1 4.6-4.8",
    ],
    visit: [
      "M5 20V8.8c0-.55.45-1 1-1h12c.55 0 1 .45 1 1V20",
      "M8 7.8V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5v2.3",
      "M3 20h18",
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
    chat: [
      "M4 5h16v11H9l-5 4V5Z",
      "M8 9h8",
      "M8 12h6",
    ],
    guardian: [
      "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
      "M16.5 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
      "M3 20v-2a5 5 0 0 1 10 0v2",
      "M13 20v-1.5a4 4 0 0 1 8 0V20",
    ],
    device: [
      "M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z",
      "M10 18h4",
    ],
    history: [
      "M3 12a9 9 0 1 0 3-6.7",
      "M3 4v5h5",
      "M12 7v5l3 2",
    ],
    delivery: [
      "M3 7h12v10H3z",
      "M15 10h3l3 3v4h-6z",
      "M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
      "M17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
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

function PremiumLink({
  href,
  children,
  external = false,
  light = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  light?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`group inline-flex min-h-11 items-center justify-center gap-2 rounded-[15px] border px-4 text-[10px] font-black uppercase tracking-[0.11em] shadow-[0_12px_30px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.12)] transition duration-300 hover:-translate-y-1 active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
        light
          ? "border-white bg-white text-black hover:border-white/25 hover:bg-[#111] hover:text-white"
          : "border-white/[0.15] bg-white/[0.045] text-white/72 hover:border-white/35 hover:bg-white/[0.1] hover:text-white"
      }`}
    >
      {children}
      <PremiumIcon
        name="arrow"
        className="h-3.5 w-3.5 transition duration-300 group-hover:translate-x-0.5"
      />
    </a>
  );
}

export default function GooglePlayRecognitionExperience() {
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!reducedMotion) {
      setCelebrate(true);
      const timer = window.setTimeout(() => setCelebrate(false), 4200);
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, []);

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-recognition-reveal]"),
    );

    if (elements.length === 0) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedMotion || !("IntersectionObserver" in window)) {
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
        threshold: 0.08,
        rootMargin: "0px 0px -7% 0px",
      },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen overflow-x-clip bg-black text-white">
      {celebrate ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[90] overflow-hidden"
        >
          {CONFETTI.map((particle, index) => {
            const style: ConfettiStyle = {
              "--sk-left": `${particle.left}%`,
              "--sk-delay": `${particle.delay}s`,
              "--sk-duration": `${particle.duration}s`,
              "--sk-size": `${particle.size}px`,
              "--sk-rotate": `${particle.rotate}deg`,
              "--sk-drift": `${particle.drift}px`,
              "--sk-opacity": `${particle.opacity}`,
            };

            return (
              <span
                key={index}
                className="sk-grey-confetti absolute top-[-8%] block bg-white"
                style={style}
              />
            );
          })}
        </div>
      ) : null}

      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-black/80 backdrop-blur-2xl">
        <div className="mx-auto flex min-h-[68px] max-w-6xl items-center justify-between gap-3 px-4 sm:px-5 lg:px-6">
          <a
            href="/"
            className="group inline-flex min-h-10 items-center gap-2.5 rounded-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
            aria-label="Return to StayKnown homepage"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-[13px] border border-white bg-white shadow-[0_10px_24px_rgba(0,0,0,0.36),inset_0_1px_0_rgba(255,255,255,1),inset_0_-4px_10px_rgba(0,0,0,0.09)] transition duration-300 group-hover:-translate-y-0.5">
              <Image src="/6logo.png" alt="" width={20} height={20} priority />
            </span>
            <span>
              <span className="block text-[12px] font-black tracking-[0.22em]">
                STAYKNOWN
              </span>
              <span className="mt-0.5 hidden text-[9px] font-bold text-white/36 sm:block">
                Google Play recognition
              </span>
            </span>
          </a>

          <div className="flex items-center gap-2">
            <a
              href="/"
              className="hidden min-h-9 items-center rounded-[13px] border border-white/[0.12] bg-white/[0.045] px-3 text-[9px] font-black uppercase tracking-[0.11em] text-white/62 transition hover:border-white/30 hover:text-white sm:inline-flex"
            >
              Homepage
            </a>
            <a
              href={GOOGLE_PLAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-9 items-center gap-2 rounded-[13px] border border-white bg-white px-3 text-[9px] font-black uppercase tracking-[0.11em] text-black shadow-[0_10px_24px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,1)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#111] hover:text-white"
            >
              <GooglePlayMark className="h-4 w-4" />
              Google Play
            </a>
          </div>
        </div>
      </header>

      <section className="relative isolate overflow-hidden border-b border-white/[0.08]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.10),transparent_34%),radial-gradient(circle_at_8%_82%,rgba(255,255,255,0.055),transparent_26%),radial-gradient(circle_at_92%_68%,rgba(255,255,255,0.05),transparent_25%)]" />
        <div className="pointer-events-none absolute left-1/2 top-[42%] h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.045]" />
        <div className="pointer-events-none absolute left-1/2 top-[42%] h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07]" />

        <div className="relative mx-auto grid min-h-[calc(100svh-68px)] max-w-6xl items-center gap-10 px-4 py-16 sm:px-5 sm:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:px-6 lg:py-24">
          <div className="sk-recognition-enter">
            <div className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.055] px-3 text-[9px] font-black uppercase tracking-[0.19em] text-white/68 shadow-[inset_0_1px_0_rgba(255,255,255,0.11)]">
              <PremiumIcon name="spark" className="h-4 w-4" />
              Indie Corner nomination
            </div>

            <h1 className="mt-6 max-w-[11ch] text-[48px] font-black leading-[0.91] tracking-[-0.075em] text-white sm:text-[66px] lg:text-[78px]">
              A meaningful moment for an independent safety idea.
            </h1>

            <p className="mt-6 max-w-[62ch] text-[14px] font-semibold leading-relaxed text-white/66 sm:text-[16px]">
              StayKnown received a Google Play Indie Corner nomination. For an
              independently built, consent-first safety platform, the moment
              matters because it gives the product, its mission, and the people
              it was designed to protect a wider opportunity to be understood.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <PremiumLink href={GOOGLE_PLAY_URL} external light>
                View StayKnown on Google Play
              </PremiumLink>
              <PremiumLink href="/features">Explore the feature atlas</PremiumLink>
              <PremiumLink href="/trust-safety">Read the safety principles</PremiumLink>
            </div>

            <p className="mt-5 max-w-[62ch] text-[10px] font-semibold leading-relaxed text-white/36">
              This page describes a nomination and recognition opportunity. It
              does not claim that StayKnown won an award, that Google guarantees
              the app, or that StayKnown replaces professional emergency services.
            </p>
          </div>

          <div className="relative mx-auto flex w-full max-w-[480px] items-center justify-center">
            <div className="sk-recognition-orbit absolute h-[410px] w-[410px] rounded-full border border-dashed border-white/[0.12]" />
            <div className="absolute h-[320px] w-[320px] rounded-full border border-white/[0.08]" />
            <div className="absolute h-[510px] w-[510px] rounded-full border border-white/[0.035]" />

            <div className="sk-recognition-medallion relative flex aspect-square w-[270px] flex-col items-center justify-center overflow-hidden rounded-full border border-white/90 bg-[radial-gradient(circle_at_36%_22%,#ffffff_0%,#f4f4f4_30%,#cfcfcf_66%,#909090_100%)] text-black shadow-[0_42px_110px_rgba(0,0,0,0.78),inset_0_2px_0_rgba(255,255,255,1),inset_0_-16px_34px_rgba(0,0,0,0.24)] sm:w-[320px]">
              <div className="pointer-events-none absolute inset-[10px] rounded-full border border-black/[0.13]" />
              <div className="pointer-events-none absolute inset-[19px] rounded-full border border-white/70" />
              <span className="flex h-20 w-20 items-center justify-center rounded-[25px] border border-black/[0.09] bg-white shadow-[0_16px_34px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,1)]">
                <GooglePlayMark className="h-11 w-11" />
              </span>
              <span className="mt-5 text-[9px] font-black uppercase tracking-[0.22em] text-black/48">
                Recognized by Google Play
              </span>
              <span className="mt-2 max-w-[14ch] text-center text-[24px] font-black leading-[0.95] tracking-[-0.055em] text-black sm:text-[28px]">
                Indie Corner nomination
              </span>
              <span className="mt-4 rounded-full border border-black/[0.09] bg-black/[0.045] px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.16em] text-black/55">
                StayKnown · Android
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#050505]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-5 sm:py-20 lg:px-6 lg:py-24">
          <div
            data-recognition-reveal
            className="sk-recognition-reveal mx-auto max-w-3xl text-center"
          >
            <div className="text-[9px] font-black uppercase tracking-[0.24em] text-white/38">
              Why the moment matters
            </div>
            <h2 className="mt-4 text-[36px] font-black leading-[0.96] tracking-[-0.065em] sm:text-[50px]">
              Recognition creates responsibility, not complacency.
            </h2>
            <p className="mt-5 text-[14px] font-semibold leading-relaxed text-white/58 sm:text-[15px]">
              StayKnown treats the nomination as encouragement to keep building
              a clearer, safer, more accountable product—not as permission to
              exaggerate what the app can do.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Visibility for an independent idea",
                body:
                  "A product built outside the largest technology companies can still present a serious mission, deliberate engineering, and a distinct point of view.",
              },
              {
                number: "02",
                title: "A reason to explain the difference",
                body:
                  "StayKnown is not designed as permanent hidden tracking. Its identity is built around consent, context, recognizable people, and explicit safety flows.",
              },
              {
                number: "03",
                title: "A higher standard to maintain",
                body:
                  "Recognition increases the obligation to protect privacy, communicate limitations, strengthen reliability, and keep every safety claim honest.",
              },
            ].map((item) => (
              <article
                key={item.number}
                data-recognition-reveal
                className="sk-recognition-reveal group relative overflow-hidden rounded-[30px] border border-white/[0.1] bg-black p-5 shadow-[0_26px_74px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.055)] transition duration-300 hover:-translate-y-1 hover:border-white/[0.2] sm:p-6"
              >
                <div className="absolute right-5 top-3 text-[50px] font-black tracking-[-0.08em] text-white/[0.045]">
                  {item.number}
                </div>
                <div className="relative">
                  <span className="flex h-12 w-12 items-center justify-center rounded-[17px] border border-white/[0.14] bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(255,255,255,0.025))] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_14px_30px_rgba(0,0,0,0.46)]">
                    <PremiumIcon name="spark" className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-[23px] font-black leading-[1.02] tracking-[-0.045em]">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-[13px] font-semibold leading-relaxed text-white/55">
                    {item.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-5 sm:py-20 lg:px-6 lg:py-24">
          <div
            data-recognition-reveal
            className="sk-recognition-reveal max-w-4xl"
          >
            <div className="text-[9px] font-black uppercase tracking-[0.24em] text-white/38">
              The product behind the nomination
            </div>
            <h2 className="mt-4 max-w-[14ch] text-[38px] font-black leading-[0.95] tracking-[-0.068em] sm:text-[54px]">
              More than a location dot. A connected safety system.
            </h2>
            <p className="mt-5 max-w-[75ch] text-[14px] font-semibold leading-relaxed text-white/58 sm:text-[15px]">
              StayKnown combines intentional safety sessions, approved-contact
              communication, strong identity context, response evidence,
              guardian safeguards, device protection, and resilience when the
              network is not perfect.
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {FEATURE_CARDS.map((feature) => (
              <a
                key={feature.title}
                href={feature.href}
                data-recognition-reveal
                className="sk-recognition-reveal group relative min-h-[235px] overflow-hidden rounded-[25px] border border-white/[0.1] bg-[#050505] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.05)] transition duration-300 hover:-translate-y-1 hover:border-white/[0.24] hover:bg-white/[0.045]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-[15px] border border-white/[0.14] bg-[linear-gradient(145deg,rgba(255,255,255,0.13),rgba(255,255,255,0.02))] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_12px_25px_rgba(0,0,0,0.42)]">
                  <PremiumIcon name={feature.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-[18px] font-black leading-tight tracking-[-0.04em]">
                  {feature.title}
                </h3>
                <p className="mt-3 text-[11.5px] font-semibold leading-relaxed text-white/50">
                  {feature.body}
                </p>
                <span className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.11] bg-white/[0.035] text-white/48 transition duration-300 group-hover:border-white/30 group-hover:bg-white group-hover:text-black">
                  <PremiumIcon name="arrow" className="h-3.5 w-3.5" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#050505] px-4 py-14 sm:px-5 sm:py-20 lg:px-6">
        <div
          data-recognition-reveal
          className="sk-recognition-reveal mx-auto max-w-6xl overflow-hidden rounded-[36px] border border-white bg-white p-6 text-black shadow-[0_28px_0_-19px_rgba(255,255,255,0.78),0_42px_120px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,1),inset_0_-16px_34px_rgba(0,0,0,0.08)] sm:p-9"
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_0.78fr] lg:items-center">
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.23em] text-black/42">
                Recognition with clarity
              </div>
              <h2 className="mt-4 max-w-[16ch] text-[37px] font-black leading-[0.94] tracking-[-0.065em] sm:text-[52px]">
                The mission remains bigger than the badge.
              </h2>
              <p className="mt-5 max-w-[68ch] text-[13px] font-semibold leading-relaxed text-black/58 sm:text-[14px]">
                StayKnown will keep improving the app, documenting its safety
                boundaries, listening to users, and building technology that
                helps trusted people understand what is happening without
                turning care into invisible surveillance.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href={GOOGLE_PLAY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-[15px] border border-black bg-black px-4 text-[10px] font-black uppercase tracking-[0.11em] text-white shadow-[0_12px_30px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:bg-white hover:text-black"
                >
                  Download StayKnown
                  <PremiumIcon name="arrow" className="h-3.5 w-3.5" />
                </a>
                <a
                  href="/about"
                  className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-[15px] border border-black/[0.12] bg-black/[0.04] px-4 text-[10px] font-black uppercase tracking-[0.11em] text-black/65 transition duration-300 hover:-translate-y-1 hover:border-black hover:text-black"
                >
                  Read the founder story
                  <PremiumIcon name="arrow" className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            <div className="rounded-[28px] border border-black/[0.09] bg-[linear-gradient(145deg,#f8f8f8,#dfdfdf)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,1),0_18px_44px_rgba(0,0,0,0.12)]">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-[17px] border border-black/[0.08] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,1),0_10px_24px_rgba(0,0,0,0.1)]">
                  <GooglePlayMark className="h-7 w-7" />
                </span>
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.17em] text-black/43">
                    StayKnown
                  </div>
                  <div className="mt-1 text-[16px] font-black tracking-[-0.035em]">
                    Indie Corner nomination
                  </div>
                </div>
              </div>

              <div className="my-5 h-px bg-black/[0.08]" />

              <dl className="space-y-3">
                {[
                  ["Platform", "Android · Google Play"],
                  ["Product focus", "Consent-first personal safety"],
                  ["Built by", "6Clement Joshua"],
                  ["Core promise", "Context, consent, recognition, escalation"],
                ].map(([term, description]) => (
                  <div
                    key={term}
                    className="grid grid-cols-[0.72fr_1.28fr] gap-3"
                  >
                    <dt className="text-[9px] font-black uppercase tracking-[0.13em] text-black/40">
                      {term}
                    </dt>
                    <dd className="text-[11px] font-black leading-snug text-black/72">
                      {description}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.08] bg-black">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 text-center sm:px-5 md:flex-row md:items-center md:justify-between md:text-left lg:px-6">
          <div>
            <div className="text-[11px] font-black tracking-[0.18em]">
              STAYKNOWN
            </div>
            <div className="mt-1 text-[10px] font-semibold text-white/34">
              A 6 Clement Joshua service™
            </div>
          </div>

          <StayKnownSocialLinks compact />

          <div className="text-[10px] font-semibold text-white/30">
            Recognition explained with accuracy and respect.
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .sk-recognition-enter {
          animation: sk-recognition-enter 720ms cubic-bezier(0.22, 1, 0.36, 1)
            both;
        }

        .sk-recognition-orbit {
          animation: sk-recognition-orbit 22s linear infinite;
        }

        .sk-recognition-medallion {
          animation: sk-recognition-float 5.6s ease-in-out infinite;
        }

        .sk-recognition-reveal {
          opacity: 0;
          transform: translateY(18px);
          transition:
            opacity 520ms ease-out,
            transform 620ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .sk-recognition-reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .sk-grey-confetti {
          left: var(--sk-left);
          width: var(--sk-size);
          height: calc(var(--sk-size) * 1.65);
          opacity: var(--sk-opacity);
          transform: rotate(var(--sk-rotate));
          border-radius: 2px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.74);
          animation: sk-grey-confetti-fall var(--sk-duration) ease-in
            var(--sk-delay) both;
        }

        @keyframes sk-recognition-enter {
          from {
            opacity: 0;
            transform: translate3d(0, 24px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes sk-recognition-orbit {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes sk-recognition-float {
          0%,
          100% {
            transform: translateY(0) rotate(-0.35deg);
          }
          50% {
            transform: translateY(-11px) rotate(0.35deg);
          }
        }

        @keyframes sk-grey-confetti-fall {
          0% {
            opacity: 0;
            transform: translate3d(0, -14vh, 0) rotate(var(--sk-rotate));
          }
          12% {
            opacity: var(--sk-opacity);
          }
          100% {
            opacity: 0;
            transform: translate3d(
                var(--sk-drift),
                112vh,
                0
              )
              rotate(calc(var(--sk-rotate) + 720deg));
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sk-recognition-enter,
          .sk-recognition-orbit,
          .sk-recognition-medallion,
          .sk-recognition-reveal,
          .sk-recognition-reveal.is-visible,
          .sk-grey-confetti {
            opacity: 1;
            transform: none;
            transition: none;
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
