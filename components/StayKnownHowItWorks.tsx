"use client";

import Image from "next/image";
import Link from "next/link";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion } from "framer-motion";

type PresentationIcon =
  | "approval"
  | "visit"
  | "live"
  | "capture"
  | "safe"
  | "sos"
  | "verify"
  | "contacts"
  | "privacy"
  | "arrow"
  | "pause"
  | "play"
  | "replay";

type PresentationStep = {
  id: string;
  number: string;
  eyebrow: string;
  shortLabel: string;
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  icon: PresentationIcon;
  userAction: string;
  contactView: string;
  consentRule: string;
  learnHref: string;
  accentLabel: string;
};

const AUTOPLAY_MS = 7200;
const SWIPE_OFFSET = 58;
const SWIPE_VELOCITY = 520;

const PRESENTATION_STEPS: PresentationStep[] = [
  {
    id: "approved-contacts",
    number: "01",
    eyebrow: "Permission before access",
    shortLabel: "Approve contacts",
    title: "Safety starts with people the user has approved.",
    body: "StayKnown does not begin with a hidden family map. The user chooses trusted people and accepts the relationship before safety access can become available.",
    image: "/hero/contact-approval.png",
    imageAlt: "StayKnown approved-contact request and consent screen",
    icon: "approval",
    userAction:
      "The user sends or accepts a contact request and decides who can participate in supported safety flows.",
    contactView:
      "The other person sees a clear approval relationship—not silent access to the user’s location.",
    consentRule:
      "Approval can be declined, restricted, blocked, or revoked. Approval alone does not start LIVE sharing.",
    learnHref: "/learn/contact-approval",
    accentLabel: "Consent recorded",
  },
  {
    id: "start-visit",
    number: "02",
    eyebrow: "User-started protection",
    shortLabel: "Start a Visit",
    title: "The user starts a safety session for a real destination.",
    body: "A Visit gives movement a beginning, purpose, destination, selected recipients, and an expected finish. Safety sharing is tied to that active session.",
    image: "/hero/visit-live-sos.png",
    imageAlt: "StayKnown Visit, LIVE, and SOS controls",
    icon: "visit",
    userAction:
      "The user enters the Visit flow, reviews safety guidance, chooses the destination, and selects approved recipients.",
    contactView:
      "Selected contacts understand that a Visit has started, why the user is moving, and what safety state is active.",
    consentRule:
      "Nothing begins merely because someone is an approved contact. The user deliberately starts the Visit.",
    learnHref: "/learn/visit-live-sos",
    accentLabel: "Session initiated",
  },
  {
    id: "live-sharing",
    number: "03",
    eyebrow: "Active-session visibility",
    shortLabel: "Share LIVE",
    title: "LIVE access belongs to the Visit—not to permanent tracking.",
    body: "While the Visit is active, permitted contacts can follow the safety session with location context, status, and lawful-use boundaries.",
    image: "/hero/live-map.png",
    imageAlt: "StayKnown LIVE map for approved contacts",
    icon: "live",
    userAction:
      "The user keeps LIVE protection active while travelling, riding, visiting, or entering an unfamiliar environment.",
    contactView:
      "Approved recipients see the permitted safety map, Visit context, location confidence, and the current protection state.",
    consentRule:
      "The map is not a public nearby-user map. Access is restricted to the authorized Visit or SOS flow.",
    learnHref: "/learn/live-map",
    accentLabel: "LIVE with context",
  },
  {
    id: "manual-capture",
    number: "04",
    eyebrow: "Extra safety evidence",
    shortLabel: "Capture context",
    title: "The user can add an intentional safety update when needed.",
    body: "Manual Capture can add a fresh safety location or supporting context during an active Visit without changing the normal protection rhythm.",
    image: "/hero/manual-capture.png",
    imageAlt: "StayKnown Manual Emergency Capture screen",
    icon: "capture",
    userAction:
      "The user deliberately taps Capture during a supported active safety flow when an additional update may be useful.",
    contactView:
      "Trusted people receive clearer timing and safety evidence instead of an unexplained location dot.",
    consentRule:
      "Capture is visible and user-initiated. StayKnown does not introduce hidden background camera or audio recording.",
    learnHref: "/learn/manual-capture",
    accentLabel: "Evidence added",
  },
  {
    id: "im-safe",
    number: "05",
    eyebrow: "Reassurance without surveillance",
    shortLabel: "Confirm I’M SAFE",
    title: "A clear check-in can replace repeated “Where are you?” calls.",
    body: "I’M SAFE lets the user confirm wellbeing directly. Scheduled check-ins can also create understandable follow-up when a confirmation is missed.",
    image: "/hero/get-safe-hints.png",
    imageAlt: "StayKnown safety guidance and I’M SAFE controls",
    icon: "safe",
    userAction:
      "The user confirms I’M SAFE from the app, with available safety context attached by the supported flow.",
    contactView:
      "Trusted contacts receive a direct reassurance signal and can distinguish a confirmed check-in from silence or a missed prompt.",
    consentRule:
      "The user communicates safety intentionally. The feature is not a substitute for secretly watching the user all day.",
    learnHref: "/learn/get-safe-guidance",
    accentLabel: "Safety confirmed",
  },
  {
    id: "sos-escalation",
    number: "06",
    eyebrow: "Urgent escalation",
    shortLabel: "Activate SOS",
    title:
      "When danger becomes urgent, StayKnown shifts into a clear SOS state.",
    body: "SOS alerts selected trusted people with the strongest available safety context so they can verify, respond, and use local emergency channels when necessary.",
    image: "/hero/sos-activated.png",
    imageAlt: "StayKnown active SOS emergency state",
    icon: "sos",
    userAction:
      "The user intentionally activates SOS or uses an available configured safety trigger when urgent escalation is required.",
    contactView:
      "SOS contacts and responders receive an urgent alert, location and session context, recognition information, and clear response actions.",
    consentRule:
      "StayKnown supports personal escalation but does not claim universal professional dispatch or replace local emergency services.",
    learnHref: "/learn/sos",
    accentLabel: "Urgent alert active",
  },
  {
    id: "verified-ending",
    number: "07",
    eyebrow: "Protection ends with intent",
    shortLabel: "End safely",
    title: "A Visit or SOS should not stop through an accidental tap.",
    body: "Verified ending adds a stronger confirmation step before active protection is closed, helping the user finish the safety session deliberately.",
    image: "/hero/end-visit-verify.png",
    imageAlt: "StayKnown verified end Visit confirmation",
    icon: "verify",
    userAction:
      "The user confirms the end of the Visit or SOS through the supported verified-stop flow.",
    contactView:
      "Trusted contacts receive a meaningful completion state instead of simply losing access without explanation.",
    consentRule:
      "LIVE access ends with the session. Contacts do not retain an always-on route to the user afterward.",
    learnHref: "/learn/end-visit-verify",
    accentLabel: "Access closed",
  },
];

function PresentationIcon({
  name,
  className = "h-4 w-4",
}: {
  name: PresentationIcon;
  className?: string;
}) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };

  switch (name) {
    case "approval":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="m16 11 2 2 4-5" />
        </svg>
      );
    case "visit":
      return (
        <svg {...common}>
          <path d="M5 21c4-5 10-5 14-10" />
          <path d="M15 7h4v4" />
          <circle cx="5" cy="17" r="2" />
          <circle cx="18" cy="6" r="2" />
        </svg>
      );
    case "live":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="2.5" />
          <path d="M7.8 7.8a6 6 0 0 0 0 8.4" />
          <path d="M16.2 7.8a6 6 0 0 1 0 8.4" />
          <path d="M4.8 4.8a10.2 10.2 0 0 0 0 14.4" />
          <path d="M19.2 4.8a10.2 10.2 0 0 1 0 14.4" />
        </svg>
      );
    case "capture":
      return (
        <svg {...common}>
          <path d="M4 8h3l1.5-2h7L17 8h3v10H4z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      );
    case "safe":
      return (
        <svg {...common}>
          <path d="M12 3 4.5 6v5.5c0 4.7 3.1 7.7 7.5 9.5 4.4-1.8 7.5-4.8 7.5-9.5V6z" />
          <path d="m8.5 12 2.2 2.2 4.8-5" />
        </svg>
      );
    case "sos":
      return (
        <svg {...common}>
          <path d="M12 3 2.8 19h18.4z" />
          <path d="M12 9v4" />
          <path d="M12 16.5h.01" />
        </svg>
      );
    case "verify":
      return (
        <svg {...common}>
          <path d="M12 3 4.5 6v5.5c0 4.7 3.1 7.7 7.5 9.5 4.4-1.8 7.5-4.8 7.5-9.5V6z" />
          <path d="m8.5 12 2.2 2.2 4.8-5" />
        </svg>
      );
    case "contacts":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 20v-1.5A4.5 4.5 0 0 1 8 14h2a4.5 4.5 0 0 1 4.5 4.5V20" />
          <path d="M16 7.5a2.5 2.5 0 1 1 0 5" />
          <path d="M17.5 15a4 4 0 0 1 3 3.9V20" />
        </svg>
      );
    case "privacy":
      return (
        <svg {...common}>
          <rect x="5" y="10" width="14" height="10" rx="3" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          <path d="M12 14v2" />
        </svg>
      );
    case "pause":
      return (
        <svg {...common}>
          <path d="M9 7v10" />
          <path d="M15 7v10" />
        </svg>
      );
    case "play":
      return (
        <svg {...common}>
          <path d="m9 7 8 5-8 5z" />
        </svg>
      );
    case "replay":
      return (
        <svg {...common}>
          <path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.6" />
          <path d="M4 4v4.6h4.6" />
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

function clampIndex(index: number): number {
  const total = PRESENTATION_STEPS.length;
  return ((index % total) + total) % total;
}

export default function StayKnownHowItWorks() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const activeStep = PRESENTATION_STEPS[activeIndex];

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const goTo = useCallback((index: number, options?: { pause?: boolean }) => {
    const nextIndex = clampIndex(index);

    setActiveIndex(nextIndex);
    setHasCompleted(nextIndex === PRESENTATION_STEPS.length - 1);

    if (options?.pause) {
      setIsPaused(true);
    }
  }, []);

  const next = useCallback(
    (options?: { manual?: boolean }) => {
      if (activeIndex >= PRESENTATION_STEPS.length - 1) {
        setHasCompleted(true);
        setIsPaused(true);
        return;
      }

      goTo(activeIndex + 1, { pause: options?.manual });
    },
    [activeIndex, goTo],
  );

  const previous = useCallback(() => {
    goTo(activeIndex - 1, { pause: true });
    setHasCompleted(false);
  }, [activeIndex, goTo]);

  const replay = useCallback(() => {
    clearTimer();
    setActiveIndex(0);
    setHasCompleted(false);
    setIsPaused(false);
  }, [clearTimer]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const coarsePointerQuery = window.matchMedia(
      "(hover: none) and (pointer: coarse)",
    );

    const updatePointer = (event?: MediaQueryList | MediaQueryListEvent) => {
      setIsCoarsePointer((event ?? coarsePointerQuery).matches);
    };

    updatePointer();
    coarsePointerQuery.addEventListener("change", updatePointer);

    return () => {
      coarsePointerQuery.removeEventListener("change", updatePointer);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(Boolean(entry?.isIntersecting));
      },
      {
        threshold: 0.32,
      },
    );

    observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const updateVisibility = () => {
      setIsDocumentVisible(!document.hidden);
    };

    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);

    return () => {
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    clearTimer();

    if (prefersReducedMotion) return;
    if (isPaused || hasCompleted) return;
    if (!isInView || !isDocumentVisible) return;

    timerRef.current = window.setTimeout(() => {
      next();
    }, AUTOPLAY_MS);

    return clearTimer;
  }, [
    activeIndex,
    clearTimer,
    hasCompleted,
    isDocumentVisible,
    isInView,
    isPaused,
    next,
    prefersReducedMotion,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const indexes = [
      activeIndex,
      clampIndex(activeIndex + 1),
      clampIndex(activeIndex - 1),
    ];

    for (const index of indexes) {
      const step = PRESENTATION_STEPS[index];
      if (!step) continue;

      const image = new window.Image();
      image.src = step.image;
      image.decode?.().catch(() => undefined);
    }
  }, [activeIndex]);

  const progress = useMemo(
    () => ((activeIndex + 1) / PRESENTATION_STEPS.length) * 100,
    [activeIndex],
  );

  const handleKeyboard = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      next({ manual: true });
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      previous();
    }

    if (event.key === " " || event.key === "Enter") {
      const target = event.target as HTMLElement;
      if (target.tagName === "BUTTON" || target.tagName === "A") return;

      event.preventDefault();
      setIsPaused((current) => !current);
    }

    if (event.key === "Home") {
      event.preventDefault();
      goTo(0, { pause: true });
    }

    if (event.key === "End") {
      event.preventDefault();
      goTo(PRESENTATION_STEPS.length - 1, { pause: true });
    }
  };

  if (!activeStep) return null;

  return (
    <section
      ref={sectionRef}
      id="guided-demo"
      tabIndex={0}
      onKeyDown={handleKeyboard}
      aria-roledescription="interactive presentation"
      aria-label="How StayKnown works"
      className="
        relative isolate overflow-hidden bg-black py-16 outline-none
        sm:py-20 lg:py-24
      "
    >
      <div className="pointer-events-none absolute left-1/2 top-[44%] h-[650px] w-[1050px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.035] blur-[145px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.08]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/[0.08]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
        <header
          data-sk-reveal
          className="sk-reveal mx-auto max-w-4xl text-center"
        >
          <div className="text-[9px] font-black uppercase tracking-[0.28em] text-white/38">
            How StayKnown works
          </div>

          <h2 className="sk-sharp-type mx-auto mt-4 max-w-[15ch] text-[36px] font-black leading-[0.94] tracking-[-0.067em] text-white sm:text-[48px] md:text-[58px]">
            One complete safety journey, controlled by the user.
          </h2>

          <p className="mx-auto mt-5 max-w-[68ch] text-[13px] font-semibold leading-relaxed text-white/56 sm:text-[14px] md:text-[15px]">
            Follow an approved-contact relationship from permission through an
            active Visit, LIVE context, I’M SAFE, SOS escalation, and a verified
            ending. Nothing becomes permanent tracking.
          </p>
        </header>

        <div
          data-sk-reveal
          className="
            sk-reveal mt-10 overflow-hidden rounded-[34px] border
            border-white/[0.12] bg-[#060606]
            shadow-[0_34px_110px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.075)]
          "
        >
          <div className="relative border-b border-white/[0.08] px-4 py-3.5 sm:px-5">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent)]" />

            <div className="relative flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] border border-white/[0.13] bg-[linear-gradient(145deg,rgba(255,255,255,0.13),rgba(255,255,255,0.025))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_20px_rgba(0,0,0,0.38)]">
                  <PresentationIcon
                    name={activeStep.icon}
                    className="h-3.5 w-3.5"
                  />
                </div>

                <div className="min-w-0">
                  <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white/34">
                    Interactive presentation
                  </div>
                  <div
                    className="mt-1 truncate text-[11px] font-black text-white/76"
                    aria-live="polite"
                  >
                    Step {activeIndex + 1} of {PRESENTATION_STEPS.length} ·{" "}
                    {activeStep.shortLabel}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {hasCompleted ? (
                  <button
                    type="button"
                    onClick={replay}
                    className="
                      inline-flex h-9 items-center gap-2 rounded-[13px] border
                      border-white/[0.13] bg-white/[0.06] px-3 text-[9px]
                      font-black uppercase tracking-[0.14em] text-white/72
                      shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]
                      transition hover:border-white/[0.22] hover:bg-white/[0.1]
                      hover:text-white focus-visible:outline-none
                      focus-visible:ring-2 focus-visible:ring-white/35
                    "
                    aria-label="Replay the StayKnown presentation"
                  >
                    <PresentationIcon name="replay" className="h-3.5 w-3.5" />
                    Replay
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsPaused((current) => !current)}
                    className="
                      inline-flex h-9 items-center gap-2 rounded-[13px] border
                      border-white/[0.13] bg-white/[0.06] px-3 text-[9px]
                      font-black uppercase tracking-[0.14em] text-white/72
                      shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]
                      transition hover:border-white/[0.22] hover:bg-white/[0.1]
                      hover:text-white focus-visible:outline-none
                      focus-visible:ring-2 focus-visible:ring-white/35
                    "
                    aria-label={
                      isPaused
                        ? "Resume the StayKnown presentation"
                        : "Pause the StayKnown presentation"
                    }
                  >
                    <PresentationIcon
                      name={isPaused ? "play" : "pause"}
                      className="h-3.5 w-3.5"
                    />
                    {isPaused ? "Resume" : "Pause"}
                  </button>
                )}
              </div>
            </div>

            <div
              className="relative mt-3 h-1 overflow-hidden rounded-full bg-white/[0.08]"
              role="progressbar"
              aria-label="StayKnown presentation progress"
              aria-valuemin={1}
              aria-valuemax={PRESENTATION_STEPS.length}
              aria-valuenow={activeIndex + 1}
            >
              <div
                className="h-full rounded-full bg-white transition-[width] duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-[0.88fr_1.12fr]">
            <div className="relative min-h-[540px] overflow-hidden border-b border-white/[0.08] bg-black p-5 sm:p-7 lg:min-h-[690px] lg:border-b-0 lg:border-r">
              <div className="pointer-events-none absolute left-1/2 top-[45%] h-[390px] w-[390px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.055] blur-[95px]" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.055),transparent_48%)]" />

              <div className="relative flex h-full flex-col">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex h-7 items-center rounded-full border border-white/[0.11] bg-white/[0.045] px-2.5 text-[8px] font-black uppercase tracking-[0.17em] text-white/48">
                    {activeStep.accentLabel}
                  </span>

                  <span className="text-[9px] font-black tabular-nums tracking-[0.16em] text-white/28">
                    {activeStep.number} / 07
                  </span>
                </div>

                <motion.div
                  key={activeStep.id}
                  initial={
                    prefersReducedMotion
                      ? false
                      : { opacity: 0, y: 12, scale: 0.99 }
                  }
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.42,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  drag={isCoarsePointer ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.16}
                  onDragEnd={(_, info) => {
                    if (!isCoarsePointer) return;

                    if (
                      info.offset.x <= -SWIPE_OFFSET ||
                      info.velocity.x <= -SWIPE_VELOCITY
                    ) {
                      next({ manual: true });
                      return;
                    }

                    if (
                      info.offset.x >= SWIPE_OFFSET ||
                      info.velocity.x >= SWIPE_VELOCITY
                    ) {
                      previous();
                    }
                  }}
                  className="relative mx-auto mt-5 flex w-full max-w-[310px] flex-1 items-center justify-center"
                >
                  <div className="relative w-full">
                    <div className="pointer-events-none absolute -inset-x-12 bottom-[-28px] h-20 rounded-[50%] bg-black shadow-[0_18px_42px_rgba(0,0,0,0.9)]" />

                    <div className="relative mx-auto aspect-[9/19.5] w-[218px] overflow-hidden rounded-[34px] border-[6px] border-[#161616] bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.13),inset_0_1px_0_rgba(255,255,255,0.12),0_30px_85px_rgba(0,0,0,0.72)] sm:w-[246px]">
                      <div className="absolute left-1/2 top-2.5 z-20 h-4 w-[72px] -translate-x-1/2 rounded-full border border-white/[0.04] bg-black" />

                      <Image
                        key={activeStep.image}
                        src={activeStep.image}
                        alt={activeStep.imageAlt}
                        fill
                        sizes="(max-width: 639px) 218px, 246px"
                        className="object-cover"
                        priority={activeIndex === 0}
                        quality={88}
                      />

                      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(128deg,rgba(255,255,255,0.16),transparent_24%,transparent_68%,rgba(255,255,255,0.025))]" />
                      <div className="pointer-events-none absolute inset-x-3 top-1 h-px bg-white/[0.16]" />
                    </div>
                  </div>
                </motion.div>

                <div className="mt-4 text-center text-[9px] font-semibold text-white/30">
                  Swipe on mobile · Use ← and → with a keyboard
                </div>
              </div>
            </div>

            <div className="relative min-h-[540px] overflow-hidden p-5 sm:p-7 lg:min-h-[690px] lg:p-9">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,0.075),transparent_45%)]" />

              <motion.div
                key={`${activeStep.id}-copy`}
                initial={
                  prefersReducedMotion ? false : { opacity: 0, x: 14, y: 4 }
                }
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative flex h-full flex-col"
                aria-live="polite"
              >
                <div className="text-[9px] font-black uppercase tracking-[0.24em] text-white/38">
                  {activeStep.eyebrow}
                </div>

                <h3 className="sk-sharp-type mt-4 max-w-[15ch] text-[32px] font-black leading-[0.96] tracking-[-0.062em] text-white sm:text-[40px] lg:text-[44px]">
                  {activeStep.title}
                </h3>

                <p className="mt-5 max-w-[60ch] text-[13px] font-semibold leading-relaxed text-white/58 sm:text-[14px]">
                  {activeStep.body}
                </p>

                <div className="mt-7 grid gap-3">
                  <article className="rounded-[21px] border border-white/[0.1] bg-white/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">
                    <div className="flex items-center gap-2.5 text-[9px] font-black uppercase tracking-[0.18em] text-white/40">
                      <span className="flex h-7 w-7 items-center justify-center rounded-[10px] border border-white/[0.1] bg-white/[0.04]">
                        <PresentationIcon
                          name={activeStep.icon}
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      What the user does
                    </div>
                    <p className="mt-3 text-[12px] font-semibold leading-relaxed text-white/68">
                      {activeStep.userAction}
                    </p>
                  </article>

                  <article className="rounded-[21px] border border-white/[0.1] bg-white/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">
                    <div className="flex items-center gap-2.5 text-[9px] font-black uppercase tracking-[0.18em] text-white/40">
                      <span className="flex h-7 w-7 items-center justify-center rounded-[10px] border border-white/[0.1] bg-white/[0.04]">
                        <PresentationIcon
                          name="contacts"
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      What trusted contacts understand
                    </div>
                    <p className="mt-3 text-[12px] font-semibold leading-relaxed text-white/68">
                      {activeStep.contactView}
                    </p>
                  </article>

                  <article className="rounded-[21px] border border-white/[0.13] bg-white/[0.065] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
                    <div className="flex items-center gap-2.5 text-[9px] font-black uppercase tracking-[0.18em] text-white/46">
                      <span className="flex h-7 w-7 items-center justify-center rounded-[10px] border border-white/[0.11] bg-white/[0.05]">
                        <PresentationIcon
                          name="privacy"
                          className="h-3.5 w-3.5"
                        />
                      </span>
                      Consent boundary
                    </div>
                    <p className="mt-3 text-[12px] font-bold leading-relaxed text-white/75">
                      {activeStep.consentRule}
                    </p>
                  </article>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-7">
                  <button
                    type="button"
                    onClick={previous}
                    disabled={activeIndex === 0}
                    className="
                      inline-flex h-9 w-9 items-center justify-center rounded-full
                      border border-white/[0.13] bg-white/[0.055] text-white/72
                      shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_9px_22px_rgba(0,0,0,0.34)]
                      transition hover:border-white/[0.22] hover:bg-white/[0.1]
                      hover:text-white disabled:cursor-not-allowed
                      disabled:opacity-30 focus-visible:outline-none
                      focus-visible:ring-2 focus-visible:ring-white/35
                    "
                    aria-label="Previous StayKnown presentation step"
                  >
                    <span className="rotate-180">
                      <PresentationIcon name="arrow" className="h-3.5 w-3.5" />
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (hasCompleted) {
                        replay();
                      } else {
                        next({ manual: true });
                      }
                    }}
                    className="
                      inline-flex h-9 items-center gap-2 rounded-[13px] border
                      border-white bg-white px-3.5 text-[10px] font-black
                      text-black shadow-[0_10px_24px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,1),inset_0_-4px_10px_rgba(0,0,0,0.08)]
                      transition hover:-translate-y-px hover:border-white/[0.22]
                      hover:bg-[#111111] hover:text-white active:translate-y-0
                      active:scale-[0.99] focus-visible:outline-none
                      focus-visible:ring-2 focus-visible:ring-white/35
                    "
                  >
                    {hasCompleted ? "Replay journey" : "Next step"}
                    <PresentationIcon
                      name={hasCompleted ? "replay" : "arrow"}
                      className="h-3.5 w-3.5"
                    />
                  </button>

                  <Link
                    href={activeStep.learnHref}
                    className="
                      inline-flex min-h-9 items-center gap-2 rounded-[13px]
                      border border-white/[0.12] bg-white/[0.05] px-3.5
                      text-[10px] font-black text-white/70 transition
                      hover:border-white/[0.22] hover:bg-white/[0.1]
                      hover:text-white focus-visible:outline-none
                      focus-visible:ring-2 focus-visible:ring-white/35
                    "
                  >
                    Learn this feature
                    <PresentationIcon name="arrow" className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>

          <nav
            aria-label="StayKnown presentation steps"
            className="border-t border-white/[0.08] bg-black/60 px-3 py-3 sm:px-4"
          >
            <div className="sk-scroll-hidden flex gap-2 overflow-x-auto pb-1">
              {PRESENTATION_STEPS.map((step, index) => {
                const active = index === activeIndex;
                const complete = index < activeIndex;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => goTo(index, { pause: true })}
                    aria-label={`Show step ${index + 1}: ${step.shortLabel}`}
                    aria-current={active ? "step" : undefined}
                    className={`
                      group inline-flex min-h-9 shrink-0 items-center gap-2
                      rounded-[13px] border px-2.5 text-[9px] font-black
                      transition focus-visible:outline-none
                      focus-visible:ring-2 focus-visible:ring-white/35
                      ${
                        active
                          ? "border-white/90 bg-white text-black shadow-[inset_0_1px_0_rgba(255,255,255,1)]"
                          : complete
                            ? "border-white/[0.16] bg-white/[0.075] text-white/76 hover:bg-white/[0.11]"
                            : "border-white/[0.09] bg-white/[0.035] text-white/46 hover:border-white/[0.16] hover:text-white/72"
                      }
                    `}
                  >
                    <span
                      className={`
                        flex h-5 w-5 items-center justify-center rounded-[7px]
                        border text-[8px] tabular-nums
                        ${
                          active
                            ? "border-black/[0.08] bg-black/[0.045]"
                            : "border-white/[0.09] bg-white/[0.035]"
                        }
                      `}
                    >
                      {step.number}
                    </span>
                    {step.shortLabel}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        <div
          data-sk-reveal
          className="
            sk-reveal mx-auto mt-5 flex max-w-4xl flex-col items-center
            justify-between gap-3 rounded-[22px] border border-white/[0.09]
            bg-white/[0.035] px-4 py-3 text-center sm:flex-row sm:text-left
          "
        >
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/36">
              Important boundary
            </div>
            <p className="mt-1.5 text-[11px] font-semibold leading-relaxed text-white/58">
              StayKnown helps trusted people respond with context. It does not
              replace local emergency services or guarantee professional
              dispatch.
            </p>
          </div>

          <Link
            href="/trust-safety"
            className="
              inline-flex min-h-9 shrink-0 items-center gap-2 rounded-[13px]
              border border-white/[0.12] bg-white/[0.05] px-3.5 text-[9px]
              font-black uppercase tracking-[0.12em] text-white/68 transition
              hover:border-white/[0.22] hover:bg-white/[0.1] hover:text-white
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-white/35
            "
          >
            Trust &amp; Safety
            <PresentationIcon name="arrow" className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
