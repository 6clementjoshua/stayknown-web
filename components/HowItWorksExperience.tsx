"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.stayknown.app";

type StageTone = "neutral" | "safe" | "sos";

type StageIcon =
  | "contacts"
  | "visit"
  | "live"
  | "capture"
  | "safe"
  | "sos"
  | "verify"
  | "shield"
  | "arrow"
  | "play"
  | "pause"
  | "replay"
  | "check"
  | "lock";

type SafetyStage = {
  id: string;
  number: string;
  eyebrow: string;
  navLabel: string;
  title: string;
  summary: string;
  image: string;
  imageAlt: string;
  icon: StageIcon;
  tone: StageTone;
  userAction: string;
  contactExperience: string;
  accessBoundary: string;
  learnHref: string;
};

const TOUR_INTERVAL_MS = 7600;

const STAGES: readonly SafetyStage[] = [
  {
    id: "approve",
    number: "01",
    eyebrow: "Permission relationship",
    navLabel: "Approve",
    title: "Trusted access starts with mutual approval.",
    summary:
      "StayKnown begins with a visible relationship between people—not a hidden map. The user decides who can participate in supported safety flows.",
    image: "/hero/contact-approval.png",
    imageAlt: "StayKnown approved-contact consent screen",
    icon: "contacts",
    tone: "neutral",
    userAction:
      "Send or accept an approved-contact request and decide who may participate in the supported safety relationship.",
    contactExperience:
      "The other person sees a clear request and approval state. They do not receive silent access to the user’s location.",
    accessBoundary:
      "Approval creates a trusted relationship. It does not automatically start LIVE sharing.",
    learnHref: "/learn/contact-approval",
  },
  {
    id: "visit",
    number: "02",
    eyebrow: "User-started session",
    navLabel: "Visit",
    title: "A Visit gives movement purpose, context, and a clear beginning.",
    summary:
      "The user starts protection for a destination, journey, ride, meeting, or unfamiliar environment and selects the people who should receive the safety context.",
    image: "/hero/visit-live-sos.png",
    imageAlt: "StayKnown Visit, LIVE, and SOS controls",
    icon: "visit",
    tone: "neutral",
    userAction:
      "Review the pre-start guidance, add a destination, choose approved recipients, and deliberately begin the Visit.",
    contactExperience:
      "Selected trusted contacts understand that the user has started a real safety session, where they are going, and what protection is active.",
    accessBoundary:
      "Nothing starts merely because someone is approved. The user intentionally begins the Visit.",
    learnHref: "/learn/visit-live-sos",
  },
  {
    id: "live",
    number: "03",
    eyebrow: "Active-session visibility",
    navLabel: "LIVE",
    title: "LIVE sharing belongs to the safety session—not to permanent tracking.",
    summary:
      "During an active Visit, permitted contacts can follow location, status, confidence, and session context inside a controlled safety map.",
    image: "/hero/live-map.png",
    imageAlt: "StayKnown LIVE safety map for approved contacts",
    icon: "live",
    tone: "safe",
    userAction:
      "Keep LIVE protection active while travelling, riding, visiting, or entering a place where trusted people may need context.",
    contactExperience:
      "Recipients see the permitted map, active Visit state, location confidence, and the user identity they already recognize.",
    accessBoundary:
      "The map is private to the authorized safety flow. It is not a public nearby-user map.",
    learnHref: "/learn/live-map",
  },
  {
    id: "capture",
    number: "04",
    eyebrow: "Intentional safety evidence",
    navLabel: "Capture",
    title: "Add a fresh safety update when the situation needs more context.",
    summary:
      "Manual Capture lets the user add an intentional safety location or supporting update during an active Visit without changing the normal protection rhythm.",
    image: "/hero/manual-capture.png",
    imageAlt: "StayKnown Manual Emergency Capture screen",
    icon: "capture",
    tone: "neutral",
    userAction:
      "Tap Capture during the supported active flow when an additional location or safety update may help trusted people understand the situation.",
    contactExperience:
      "Trusted contacts receive a clearer event with timing and context rather than an unexplained location dot.",
    accessBoundary:
      "Capture is visible and user-initiated. StayKnown does not rely on hidden background camera or audio recording.",
    learnHref: "/learn/manual-capture",
  },
  {
    id: "safe",
    number: "05",
    eyebrow: "Direct reassurance",
    navLabel: "I’M SAFE",
    title: "Confirm safety without surrendering everyday independence.",
    summary:
      "I’M SAFE gives the user a direct way to reassure trusted people. Scheduled check-ins also make silence easier to understand when a confirmation is missed.",
    image: "/hero/get-safe-hints.png",
    imageAlt: "StayKnown I’M SAFE and safety-guidance screen",
    icon: "safe",
    tone: "safe",
    userAction:
      "Confirm I’M SAFE from the app and allow the supported safety context to accompany the check-in.",
    contactExperience:
      "Trusted contacts receive a clear reassurance signal and can distinguish a confirmed check-in from a missed prompt.",
    accessBoundary:
      "The user communicates safety intentionally. The feature does not turn into all-day surveillance.",
    learnHref: "/learn/get-safe-guidance",
  },
  {
    id: "sos",
    number: "06",
    eyebrow: "Urgent escalation",
    navLabel: "SOS",
    title: "When danger becomes urgent, the interface becomes unmistakable.",
    summary:
      "SOS shifts StayKnown into a high-clarity emergency state and sends the strongest available safety context to selected contacts and responders.",
    image: "/hero/sos-activated.png",
    imageAlt: "StayKnown active SOS emergency state",
    icon: "sos",
    tone: "sos",
    userAction:
      "Deliberately activate SOS or use an available configured safety trigger when urgent escalation is required.",
    contactExperience:
      "SOS contacts and responders receive an urgent alert, recognition information, session context, and clear response actions.",
    accessBoundary:
      "StayKnown supports trusted-contact escalation but does not claim universal professional dispatch or replace local emergency services.",
    learnHref: "/learn/sos",
  },
  {
    id: "end",
    number: "07",
    eyebrow: "Verified completion",
    navLabel: "End safely",
    title: "Protection ends through intent—not an accidental tap.",
    summary:
      "Verified ending adds a stronger confirmation before the active Visit or SOS is closed, helping the safety session finish clearly.",
    image: "/hero/end-visit-verify.png",
    imageAlt: "StayKnown verified end Visit confirmation",
    icon: "verify",
    tone: "safe",
    userAction:
      "Confirm the end of the Visit or SOS through the supported verified-stop flow.",
    contactExperience:
      "Trusted contacts receive a meaningful completion state instead of simply losing access without explanation.",
    accessBoundary:
      "LIVE access ends with the session. Approved contacts do not retain an always-on route afterward.",
    learnHref: "/learn/end-visit-verify",
  },
] as const;

const CONSENT_STATES = [
  {
    label: "Approved contact",
    status: "Relationship ready",
    explanation:
      "The people know each other inside StayKnown, but no LIVE session is running.",
    icon: "contacts" as StageIcon,
  },
  {
    label: "Visit active",
    status: "Selected access",
    explanation:
      "Only the recipients selected for the active safety flow receive its context.",
    icon: "visit" as StageIcon,
  },
  {
    label: "SOS active",
    status: "Urgent escalation",
    explanation:
      "The configured emergency circle receives the strongest available alert context.",
    icon: "sos" as StageIcon,
  },
  {
    label: "Session ended",
    status: "LIVE access closed",
    explanation:
      "The safety session is finished and its LIVE access does not continue permanently.",
    icon: "lock" as StageIcon,
  },
] as const;

function toneClass(tone: StageTone) {
  if (tone === "safe") {
    return {
      text: "text-[#18b88a]",
      border: "border-[#18b88a]/55",
      background: "bg-[#18b88a]",
      shadow: "shadow-[0_0_26px_rgba(24,184,138,0.30)]",
    };
  }

  if (tone === "sos") {
    return {
      text: "text-[#f04c55]",
      border: "border-[#f04c55]/65",
      background: "bg-[#f04c55]",
      shadow: "shadow-[0_0_28px_rgba(240,76,85,0.34)]",
    };
  }

  return {
    text: "text-white",
    border: "border-white/55",
    background: "bg-white",
    shadow: "shadow-[0_0_24px_rgba(255,255,255,0.22)]",
  };
}

function StageIcon({
  name,
  className = "h-4 w-4",
}: {
  name: StageIcon;
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
    case "contacts":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 20v-1.5A4.5 4.5 0 0 1 8 14h2a4.5 4.5 0 0 1 4.5 4.5V20" />
          <path d="M16 7.5a2.5 2.5 0 1 1 0 5" />
          <path d="M17.5 15a4 4 0 0 1 3 3.9V20" />
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
    case "verify":
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
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 4.5 6v5.5c0 4.7 3.1 7.7 7.5 9.5 4.4-1.8 7.5-4.8 7.5-9.5V6z" />
        </svg>
      );
    case "lock":
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
    <svg
      viewBox="0 0 512 512"
      aria-hidden="true"
      className="h-[17px] w-[17px] shrink-0"
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

function DownloadButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={GOOGLE_PLAY_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Download StayKnown on Google Play"
      className={`
        group relative inline-flex h-10 items-center justify-center gap-2.5
        overflow-hidden rounded-[14px] border border-white bg-white px-4
        text-black
        shadow-[0_12px_30px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,1),inset_0_-5px_12px_rgba(0,0,0,0.09)]
        transition duration-200 hover:-translate-y-px hover:border-white/25
        hover:bg-black hover:text-white active:translate-y-0
        active:scale-[0.985] focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-white/40 ${className}
      `}
    >
      <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-white" />
      <span className="flex h-7 w-7 items-center justify-center rounded-[9px] border border-black/[0.07] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,1),0_5px_12px_rgba(0,0,0,0.10)]">
        <GooglePlayMark />
      </span>
      <span className="text-[10px] font-black tracking-[-0.01em]">
        Get StayKnown
      </span>
    </a>
  );
}

function HeroDeviceStack() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto h-[470px] w-full max-w-[520px] sm:h-[560px]">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.08]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.045]" />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: 30, rotate: 7 }}
        animate={{ opacity: 0.78, x: 0, rotate: 7 }}
        transition={{ duration: reduceMotion ? 0 : 0.75, delay: 0.12 }}
        className="absolute right-[3%] top-[15%] w-[37%] sm:right-[1%]"
      >
        <Image
          src="/hero/sos-activated.png"
          alt="StayKnown active SOS screen"
          width={340}
          height={690}
          priority
          className="h-auto w-full object-contain drop-shadow-[0_26px_54px_rgba(0,0,0,0.72)]"
        />
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: -30, rotate: -7 }}
        animate={{ opacity: 0.78, x: 0, rotate: -7 }}
        transition={{ duration: reduceMotion ? 0 : 0.75, delay: 0.18 }}
        className="absolute left-[2%] top-[14%] w-[37%]"
      >
        <Image
          src="/hero/contact-approval.png"
          alt="StayKnown contact approval screen"
          width={340}
          height={690}
          priority
          className="h-auto w-full object-contain drop-shadow-[0_26px_54px_rgba(0,0,0,0.72)]"
        />
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 26, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: reduceMotion ? 0 : 0.8,
          delay: 0.25,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="absolute left-1/2 top-[7%] z-10 w-[45%] -translate-x-1/2"
      >
        <Image
          src="/hero/visit-live-sos.png"
          alt="StayKnown Visit, LIVE, and SOS screen"
          width={390}
          height={790}
          priority
          className="h-auto w-full object-contain drop-shadow-[0_34px_72px_rgba(0,0,0,0.82)]"
        />
      </motion.div>

      <motion.div
        animate={
          reduceMotion
            ? { opacity: 0.85 }
            : { opacity: [0.55, 1, 0.55], scale: [0.96, 1.03, 0.96] }
        }
        transition={{
          duration: reduceMotion ? 0 : 4.6,
          repeat: reduceMotion ? 0 : Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[5%] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#18b88a]/45 bg-black px-3 py-2 text-[#18b88a] shadow-[0_0_28px_rgba(24,184,138,0.18)]"
      >
        <span className="h-2 w-2 rounded-full bg-[#18b88a] shadow-[0_0_14px_rgba(24,184,138,0.72)]" />
        <span className="text-[8px] font-black uppercase tracking-[0.16em]">
          User-controlled safety session
        </span>
      </motion.div>
    </div>
  );
}

function InteractiveJourney() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTouring, setIsTouring] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const timerRef = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();

  const activeStage = STAGES[activeIndex];
  const tone = toneClass(activeStage.tone);

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const rotateY = useSpring(
    useTransform(pointerX, [0, 1], [-5.5, 5.5]),
    { stiffness: 140, damping: 20 },
  );
  const rotateX = useSpring(
    useTransform(pointerY, [0, 1], [4.5, -4.5]),
    { stiffness: 140, damping: 20 },
  );

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const goTo = useCallback(
    (index: number, manual = true) => {
      const safeIndex = Math.max(0, Math.min(STAGES.length - 1, index));
      setActiveIndex(safeIndex);

      if (manual) {
        setIsTouring(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibility = () => setIsVisible(!document.hidden);
    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);

    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    clearTimer();

    if (!isTouring || reduceMotion || !isVisible) return;

    timerRef.current = window.setTimeout(() => {
      setActiveIndex((current) => {
        if (current >= STAGES.length - 1) {
          setIsTouring(false);
          return current;
        }

        return current + 1;
      });
    }, TOUR_INTERVAL_MS);

    return clearTimer;
  }, [
    activeIndex,
    clearTimer,
    isTouring,
    isVisible,
    reduceMotion,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const indexes = [
      activeIndex,
      Math.min(STAGES.length - 1, activeIndex + 1),
      Math.max(0, activeIndex - 1),
    ];

    indexes.forEach((index) => {
      const stage = STAGES[index];
      const image = new window.Image();
      image.src = stage.image;
      image.decode?.().catch(() => undefined);
    });
  }, [activeIndex]);

  const handlePointerMove = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (reduceMotion) return;

    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width);
    pointerY.set((event.clientY - rect.top) / rect.height);
  };

  const resetTilt = () => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  };

  const handleKeyboard = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(activeIndex + 1);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(activeIndex - 1);
    }

    if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      goTo(STAGES.length - 1);
    }
  };

  return (
    <section
      id="journey"
      className="relative overflow-hidden bg-black py-16 sm:py-20 lg:py-24"
    >
      <div className="pointer-events-none absolute left-1/2 top-[46%] h-[680px] w-[1040px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.045]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-[9px] font-black uppercase tracking-[0.28em] text-white/38">
            Interactive safety journey
          </div>
          <h2 className="mt-4 text-[38px] font-black leading-[0.94] tracking-[-0.068em] text-white sm:text-[50px] md:text-[60px]">
            See exactly when safety access starts—and when it stops.
          </h2>
          <p className="mx-auto mt-5 max-w-[68ch] text-[13px] font-semibold leading-relaxed text-white/56 sm:text-[14px] md:text-[15px]">
            Move through each stage to understand the user action, the trusted
            contact experience, and the consent boundary that keeps StayKnown
            different from always-on tracking.
          </p>
        </div>

        <div
          tabIndex={0}
          onKeyDown={handleKeyboard}
          className="mt-10 overflow-hidden rounded-[34px] border border-white/[0.13] bg-black outline-none shadow-[0_36px_110px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.08)] focus-visible:ring-2 focus-visible:ring-white/28"
          aria-label="Interactive StayKnown safety journey"
        >
          <div className="flex flex-col gap-3 border-b border-white/[0.09] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-[11px] border bg-black ${tone.border} ${tone.text} ${tone.shadow}`}
              >
                <StageIcon
                  name={activeStage.icon}
                  className="h-3.5 w-3.5"
                />
              </span>
              <div>
                <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white/32">
                  Stage {activeStage.number} of 07
                </div>
                <div
                  className="mt-1 text-[11px] font-black text-white/78"
                  aria-live="polite"
                >
                  {activeStage.navLabel}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (activeIndex === STAGES.length - 1 && !isTouring) {
                  setActiveIndex(0);
                }
                setIsTouring((current) => !current);
              }}
              className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-[13px] border border-white/[0.14] bg-black px-3 text-[9px] font-black uppercase tracking-[0.13em] text-white/68 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:border-white/25 hover:text-white sm:self-auto"
            >
              <StageIcon
                name={
                  activeIndex === STAGES.length - 1 && !isTouring
                    ? "replay"
                    : isTouring
                      ? "pause"
                      : "play"
                }
                className="h-3.5 w-3.5"
              />
              {activeIndex === STAGES.length - 1 && !isTouring
                ? "Replay tour"
                : isTouring
                  ? "Pause tour"
                  : "Auto tour"}
            </button>
          </div>

          <div className="grid lg:grid-cols-[0.88fr_1.12fr]">
            <div
              onPointerMove={handlePointerMove}
              onPointerLeave={resetTilt}
              className="relative min-h-[540px] overflow-hidden border-b border-white/[0.09] p-5 sm:p-7 lg:min-h-[710px] lg:border-b-0 lg:border-r"
            >
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.08]" />
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />

              <div className="relative flex h-full flex-col">
                <div className="flex items-center justify-between">
                  <span className={`text-[8px] font-black uppercase tracking-[0.18em] ${tone.text}`}>
                    {activeStage.eyebrow}
                  </span>
                  <span className="text-[9px] font-black tabular-nums tracking-[0.16em] text-white/28">
                    {activeStage.number}
                  </span>
                </div>

                <div className="relative flex flex-1 items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeStage.id}
                      initial={
                        reduceMotion
                          ? false
                          : { opacity: 0, y: 16, scale: 0.97 }
                      }
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={
                        reduceMotion
                          ? { opacity: 0 }
                          : { opacity: 0, y: -10, scale: 0.985 }
                      }
                      transition={{
                        duration: reduceMotion ? 0 : 0.42,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      style={{
                        rotateX: reduceMotion ? 0 : rotateX,
                        rotateY: reduceMotion ? 0 : rotateY,
                        transformPerspective: 1100,
                      }}
                      className="relative w-[230px] sm:w-[260px]"
                    >
                      <div className="pointer-events-none absolute -inset-7 rounded-[48px] border border-white/[0.055]" />
                      <div className="pointer-events-none absolute -inset-3 rounded-[40px] border border-white/[0.11]" />
                      <Image
                        src={activeStage.image}
                        alt={activeStage.imageAlt}
                        width={420}
                        height={860}
                        priority={activeIndex === 0}
                        quality={90}
                        className="relative z-10 h-auto w-full object-contain drop-shadow-[0_34px_76px_rgba(0,0,0,0.86)]"
                      />
                      <div className="pointer-events-none absolute inset-x-[18%] bottom-[-18px] h-10 rounded-[50%] bg-black shadow-[0_18px_36px_rgba(0,0,0,0.96)]" />
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="text-center text-[8.5px] font-semibold text-white/28">
                  Move your pointer for a controlled 3D view
                </div>
              </div>
            </div>

            <div className="relative min-h-[580px] p-5 sm:p-7 lg:min-h-[710px] lg:p-9">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeStage.id}-content`}
                  initial={
                    reduceMotion ? false : { opacity: 0, x: 18, y: 4 }
                  }
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={
                    reduceMotion ? { opacity: 0 } : { opacity: 0, x: -10 }
                  }
                  transition={{
                    duration: reduceMotion ? 0 : 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex h-full flex-col"
                >
                  <div className={`text-[9px] font-black uppercase tracking-[0.24em] ${tone.text}`}>
                    {activeStage.eyebrow}
                  </div>

                  <h3 className="mt-4 max-w-[15ch] text-[34px] font-black leading-[0.96] tracking-[-0.063em] text-white sm:text-[42px] lg:text-[47px]">
                    {activeStage.title}
                  </h3>

                  <p className="mt-5 max-w-[62ch] text-[13px] font-semibold leading-relaxed text-white/58 sm:text-[14px]">
                    {activeStage.summary}
                  </p>

                  <div className="mt-7 grid gap-3">
                    {[
                      {
                        label: "What the user does",
                        text: activeStage.userAction,
                        icon: activeStage.icon,
                      },
                      {
                        label: "What trusted contacts understand",
                        text: activeStage.contactExperience,
                        icon: "contacts" as StageIcon,
                      },
                      {
                        label: "Consent boundary",
                        text: activeStage.accessBoundary,
                        icon: "lock" as StageIcon,
                      },
                    ].map((item, index) => (
                      <article
                        key={item.label}
                        className={`relative overflow-hidden rounded-[21px] border bg-black p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] ${
                          index === 2
                            ? tone.border
                            : "border-white/[0.11]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-[10px] border bg-black ${
                              index === 2
                                ? `${tone.border} ${tone.text}`
                                : "border-white/[0.12] text-white/64"
                            }`}
                          >
                            <StageIcon
                              name={item.icon}
                              className="h-3.5 w-3.5"
                            />
                          </span>
                          <span className="text-[8.5px] font-black uppercase tracking-[0.17em] text-white/38">
                            {item.label}
                          </span>
                        </div>
                        <p className="mt-3 text-[11.5px] font-semibold leading-relaxed text-white/67 sm:text-[12.5px]">
                          {item.text}
                        </p>
                      </article>
                    ))}
                  </div>

                  <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-7">
                    <button
                      type="button"
                      onClick={() => goTo(activeIndex - 1)}
                      disabled={activeIndex === 0}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.14] bg-black text-white/68 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                      aria-label="Previous StayKnown stage"
                    >
                      <span className="rotate-180">
                        <StageIcon name="arrow" className="h-3.5 w-3.5" />
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (activeIndex === STAGES.length - 1) {
                          setActiveIndex(0);
                          setIsTouring(false);
                        } else {
                          goTo(activeIndex + 1);
                        }
                      }}
                      className="inline-flex h-9 items-center gap-2 rounded-[13px] border border-white bg-white px-3.5 text-[10px] font-black text-black shadow-[0_10px_24px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,1),inset_0_-4px_10px_rgba(0,0,0,0.09)] transition hover:-translate-y-px hover:border-white/25 hover:bg-black hover:text-white active:translate-y-0 active:scale-[0.99]"
                    >
                      {activeIndex === STAGES.length - 1
                        ? "Replay journey"
                        : "Next stage"}
                      <StageIcon
                        name={
                          activeIndex === STAGES.length - 1
                            ? "replay"
                            : "arrow"
                        }
                        className="h-3.5 w-3.5"
                      />
                    </button>

                    <Link
                      href={activeStage.learnHref}
                      className="inline-flex min-h-9 items-center gap-2 rounded-[13px] border border-white/[0.14] bg-black px-3.5 text-[10px] font-black text-white/68 transition hover:border-white/25 hover:text-white"
                    >
                      Feature detail
                      <StageIcon name="arrow" className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <nav
            aria-label="StayKnown safety journey stages"
            className="border-t border-white/[0.09] px-3 py-3 sm:px-4"
          >
            <div className="sk-scroll-hidden flex gap-2 overflow-x-auto pb-1">
              {STAGES.map((stage, index) => {
                const active = index === activeIndex;
                const stageTone = toneClass(stage.tone);

                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => goTo(index)}
                    aria-current={active ? "step" : undefined}
                    className={`inline-flex min-h-9 shrink-0 items-center gap-2 rounded-[13px] border px-2.5 text-[9px] font-black transition ${
                      active
                        ? "border-white bg-white text-black shadow-[inset_0_1px_0_rgba(255,255,255,1)]"
                        : "border-white/[0.11] bg-black text-white/48 hover:border-white/24 hover:text-white"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-[7px] border ${
                        active
                          ? "border-black/[0.09] bg-white text-black"
                          : `${stageTone.border} ${stageTone.text} bg-black`
                      }`}
                    >
                      <StageIcon
                        name={stage.icon}
                        className="h-3 w-3"
                      />
                    </span>
                    {stage.navLabel}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </section>
  );
}

function ConsentArchitecture() {
  return (
    <section className="relative overflow-hidden bg-white py-16 text-black sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-black/[0.12]" />

      <div className="mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.28em] text-black/38">
              Consent architecture
            </div>
            <h2 className="mt-4 max-w-[13ch] text-[40px] font-black leading-[0.94] tracking-[-0.068em] sm:text-[52px] md:text-[60px]">
              Approval is not the same as active location access.
            </h2>
            <p className="mt-5 max-w-[58ch] text-[13px] font-semibold leading-relaxed text-black/58 sm:text-[14px]">
              StayKnown separates the trusted relationship, the active safety
              session, the emergency escalation, and the verified ending. That
              separation is the foundation of the consent-first model.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {[
                "No hidden access",
                "No public map",
                "No permanent LIVE session",
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex min-h-8 items-center gap-2 rounded-full border border-black/[0.14] bg-white px-3 text-[9px] font-black uppercase tracking-[0.1em] text-black/62 shadow-[inset_0_1px_0_rgba(255,255,255,1)]"
                >
                  <StageIcon name="check" className="h-3.5 w-3.5" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-[28px] top-[44px] bottom-[44px] w-px bg-black/[0.12] sm:left-1/2 sm:top-[28px] sm:bottom-[28px] sm:-translate-x-1/2" />

            <div className="grid gap-3 sm:grid-cols-2">
              {CONSENT_STATES.map((state, index) => {
                const isSos = state.icon === "sos";
                const isClosed = state.icon === "lock";

                return (
                  <motion.article
                    key={state.label}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{
                      duration: 0.42,
                      delay: index * 0.07,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="relative overflow-hidden rounded-[24px] border border-black/[0.14] bg-white p-5 shadow-[0_18px_42px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-[12px] border bg-white ${
                          isSos
                            ? "border-[#d7353d]/55 text-[#d7353d] shadow-[0_0_22px_rgba(215,53,61,0.18)]"
                            : isClosed
                              ? "border-black/[0.18] text-black"
                              : "border-[#0e8f70]/50 text-[#0e8f70] shadow-[0_0_22px_rgba(14,143,112,0.14)]"
                        }`}
                      >
                        <StageIcon
                          name={state.icon}
                          className="h-4 w-4"
                        />
                      </span>
                      <span className="text-[8px] font-black uppercase tracking-[0.18em] text-black/30">
                        State {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <h3 className="mt-5 text-[22px] font-black tracking-[-0.045em]">
                      {state.label}
                    </h3>
                    <div
                      className={`mt-2 text-[9px] font-black uppercase tracking-[0.14em] ${
                        isSos
                          ? "text-[#d7353d]"
                          : isClosed
                            ? "text-black/48"
                            : "text-[#0e8f70]"
                      }`}
                    >
                      {state.status}
                    </div>
                    <p className="mt-4 text-[11.5px] font-semibold leading-relaxed text-black/58">
                      {state.explanation}
                    </p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustedContactHandoff() {
  const notices = [
    {
      label: "Visit started",
      body: "Destination, selected recipients, and active safety context.",
      tone: "neutral" as StageTone,
      icon: "visit" as StageIcon,
    },
    {
      label: "LIVE context",
      body: "Permitted location, confidence, user recognition, and session state.",
      tone: "safe" as StageTone,
      icon: "live" as StageIcon,
    },
    {
      label: "I’M SAFE",
      body: "Direct reassurance with the supported check-in context.",
      tone: "safe" as StageTone,
      icon: "safe" as StageIcon,
    },
    {
      label: "SOS active",
      body: "Urgent escalation with clear response actions and safety details.",
      tone: "sos" as StageTone,
      icon: "sos" as StageIcon,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-black py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[980px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.045]" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 sm:px-5 lg:grid-cols-[1fr_0.92fr] lg:items-center lg:px-6">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.28em] text-white/38">
            Trusted-contact handoff
          </div>
          <h2 className="mt-4 max-w-[13ch] text-[40px] font-black leading-[0.94] tracking-[-0.068em] text-white sm:text-[52px] md:text-[60px]">
            Context travels with the alert.
          </h2>
          <p className="mt-5 max-w-[62ch] text-[13px] font-semibold leading-relaxed text-white/56 sm:text-[14px]">
            A safety notification should explain what happened, what protection
            is active, and what the trusted person can do next. StayKnown is
            designed around that handoff—not just a raw coordinate.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {[
              "Identity and recognition",
              "Visit or SOS state",
              "Location confidence",
              "Response actions",
            ].map((item) => (
              <div
                key={item}
                className="flex min-h-12 items-center gap-3 rounded-[18px] border border-white/[0.12] bg-black px-4 text-[10px] font-black text-white/68 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-[10px] border border-white/[0.13] text-white/64">
                  <StageIcon name="check" className="h-3.5 w-3.5" />
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[470px]">
          <div className="absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07]" />

          <div className="relative space-y-3">
            {notices.map((notice, index) => {
              const tone = toneClass(notice.tone);

              return (
                <motion.article
                  key={notice.label}
                  initial={{ opacity: 0, x: 24, y: 8 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`relative overflow-hidden rounded-[22px] border bg-black p-4 shadow-[0_20px_48px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.07)] ${tone.border}`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border bg-black ${tone.border} ${tone.text} ${tone.shadow}`}
                    >
                      <StageIcon
                        name={notice.icon}
                        className="h-4 w-4"
                      />
                    </span>
                    <div>
                      <div className="text-[11px] font-black text-white">
                        {notice.label}
                      </div>
                      <p className="mt-1.5 text-[10.5px] font-semibold leading-relaxed text-white/52">
                        {notice.body}
                      </p>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCallToAction() {
  return (
    <section className="relative overflow-hidden bg-white py-16 text-black sm:py-20">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-5 lg:px-6">
        <div className="text-[9px] font-black uppercase tracking-[0.28em] text-black/36">
          Begin with understanding
        </div>
        <h2 className="mx-auto mt-4 max-w-[14ch] text-[42px] font-black leading-[0.94] tracking-[-0.07em] sm:text-[54px] md:text-[62px]">
          Install the safety system you control.
        </h2>
        <p className="mx-auto mt-5 max-w-[66ch] text-[13px] font-semibold leading-relaxed text-black/56 sm:text-[14px]">
          Start with the free Starter plan, add an approved contact, practise
          the flow, and choose when a real safety session should begin.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <DownloadButton className="w-full max-w-[210px] sm:w-auto" />
          <Link
            href="/plans"
            className="inline-flex h-10 w-full max-w-[210px] items-center justify-center gap-2 rounded-[14px] border border-black/[0.18] bg-white px-4 text-[10px] font-black text-black shadow-[inset_0_1px_0_rgba(255,255,255,1)] transition hover:-translate-y-px hover:border-black hover:bg-black hover:text-white sm:w-auto"
          >
            Compare plans
            <StageIcon name="arrow" className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mx-auto mt-7 flex max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[9px] font-black uppercase tracking-[0.12em] text-black/38">
          <Link href="/privacy" className="transition hover:text-black">
            Privacy
          </Link>
          <Link href="/trust-safety" className="transition hover:text-black">
            Trust &amp; Safety
          </Link>
          <Link href="/security" className="transition hover:text-black">
            Security
          </Link>
          <Link href="/help-center" className="transition hover:text-black">
            Help Center
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HowItWorksExperience() {
  return (
    <main className="min-h-screen overflow-x-clip bg-black text-white">
      <style jsx global>{`
        #main-content {
          background: #000;
        }

        .sk-how-nav-link {
          position: relative;
        }

        .sk-how-nav-link::after {
          position: absolute;
          right: 0;
          bottom: -5px;
          left: 0;
          height: 1px;
          content: "";
          background: currentColor;
          opacity: 0;
          transform: scaleX(0.35);
          transition:
            opacity 180ms ease,
            transform 180ms ease;
        }

        .sk-how-nav-link:hover::after,
        .sk-how-nav-link:focus-visible::after {
          opacity: 0.55;
          transform: scaleX(1);
        }

        @media (prefers-reduced-motion: reduce) {
          .sk-how-nav-link::after {
            transition: none;
          }
        }
      `}</style>

      <header className="sticky top-0 z-50 border-b border-white/[0.09] bg-black/94 backdrop-blur-2xl">
        <div className="mx-auto flex min-h-[66px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-5 lg:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-[13px] border border-white bg-white shadow-[0_10px_24px_rgba(0,0,0,0.36),inset_0_1px_0_rgba(255,255,255,1),inset_0_-4px_10px_rgba(0,0,0,0.09)]">
              <Image
                src="/6logo.png"
                alt=""
                width={20}
                height={20}
                priority
              />
            </span>
            <span>
              <span className="block text-[10px] font-black tracking-[0.22em]">
                STAYKNOWN
              </span>
              <span className="mt-1 block text-[7px] font-black uppercase tracking-[0.18em] text-white/32">
                How it works
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-5 md:flex">
            <a
              href="#journey"
              className="sk-how-nav-link text-[9px] font-black uppercase tracking-[0.13em] text-white/52 transition hover:text-white"
            >
              Journey
            </a>
            <Link
              href="/plans"
              className="sk-how-nav-link text-[9px] font-black uppercase tracking-[0.13em] text-white/52 transition hover:text-white"
            >
              Plans
            </Link>
            <Link
              href="/trust-safety"
              className="sk-how-nav-link text-[9px] font-black uppercase tracking-[0.13em] text-white/52 transition hover:text-white"
            >
              Trust
            </Link>
          </nav>

          <DownloadButton />
        </div>
      </header>

      <section className="relative isolate overflow-hidden bg-black">
        <div className="pointer-events-none absolute left-1/2 top-[45%] h-[760px] w-[1180px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.045]" />
        <div className="pointer-events-none absolute left-1/2 top-[45%] h-[520px] w-[860px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07]" />

        <div className="relative mx-auto grid min-h-[720px] max-w-6xl items-center gap-8 px-4 py-14 sm:px-5 lg:grid-cols-[1.02fr_0.98fr] lg:px-6 lg:py-20">
          <div>
            <div className="inline-flex min-h-8 items-center gap-2 rounded-full border border-[#18b88a]/45 bg-black px-3 text-[8px] font-black uppercase tracking-[0.18em] text-[#18b88a] shadow-[0_0_24px_rgba(24,184,138,0.13)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#18b88a] shadow-[0_0_12px_rgba(24,184,138,0.72)]" />
              Consent-first safety
            </div>

            <h1 className="mt-6 max-w-[11ch] text-[52px] font-black leading-[0.9] tracking-[-0.076em] sm:text-[68px] lg:text-[78px]">
              Safety access should have a beginning, purpose, and end.
            </h1>

            <p className="mt-6 max-w-[61ch] text-[14px] font-semibold leading-relaxed text-white/58 sm:text-[15px]">
              StayKnown helps people move, visit, check in, and escalate danger
              through user-started safety sessions—without turning trusted
              relationships into permanent surveillance.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#journey"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[14px] border border-white bg-white px-4 text-[10px] font-black text-black shadow-[0_12px_30px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,1),inset_0_-5px_12px_rgba(0,0,0,0.09)] transition hover:-translate-y-px hover:border-white/25 hover:bg-black hover:text-white"
              >
                Explore the journey
                <StageIcon name="arrow" className="h-3.5 w-3.5" />
              </a>
              <Link
                href="/#app-preview"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[14px] border border-white/[0.15] bg-black px-4 text-[10px] font-black text-white/68 transition hover:border-white/28 hover:text-white"
              >
                View all app screens
                <StageIcon name="arrow" className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-[8.5px] font-black uppercase tracking-[0.12em] text-white/34">
              <span>Approved contacts</span>
              <span>Active Visits</span>
              <span>LIVE context</span>
              <span>I’M SAFE</span>
              <span>SOS</span>
            </div>
          </div>

          <HeroDeviceStack />
        </div>
      </section>

      <InteractiveJourney />
      <ConsentArchitecture />
      <TrustedContactHandoff />
      <FinalCallToAction />
    </main>
  );
}
