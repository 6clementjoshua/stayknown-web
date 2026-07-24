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

const SCENE_DURATION_MS = 6800;

type SceneTone = "neutral" | "safe" | "sos";
type SceneKind = "environment" | "device";
type FilmIcon =
  | "play"
  | "pause"
  | "replay"
  | "arrow"
  | "contacts"
  | "visit"
  | "live"
  | "capture"
  | "safe"
  | "sos"
  | "chat"
  | "verify"
  | "shield"
  | "lock"
  | "sound"
  | "spark";

type FilmScene = {
  id: string;
  chapter: string;
  number: string;
  eyebrow: string;
  title: string;
  body: string;
  kind: SceneKind;
  tone: SceneTone;
  icon: FilmIcon;
  image: string;
  imageAlt: string;
  secondaryImage?: string;
  secondaryImageAlt?: string;
  actionLabel: string;
  actionHref: string;
  proof: readonly string[];
};

const FILM_SCENES: readonly FilmScene[] = [
  {
    id: "movement",
    chapter: "Why it exists",
    number: "01",
    eyebrow: "Everyday movement",
    title: "People leave home every day. Care should travel without becoming surveillance.",
    body:
      "StayKnown begins with a simple problem: journeys, visits, rides, school, work, and unfamiliar places create uncertainty for the people who care.",
    kind: "environment",
    tone: "neutral",
    icon: "spark",
    image: "/hero/stayknown-safe-journey-bus.png",
    imageAlt: "A journey viewed from inside a bus",
    actionLabel: "Safe journey story",
    actionHref: "/learn/safe-journey",
    proof: [
      "Movement has a purpose",
      "Safety access should be intentional",
      "Trusted people need context—not permanent tracking",
    ],
  },
  {
    id: "approval",
    chapter: "Consent",
    number: "02",
    eyebrow: "Trusted relationship",
    title: "Before location appears, the people involved must be known.",
    body:
      "Approved contacts create a visible, revocable safety relationship. A request can be accepted, declined, restricted, removed, or blocked.",
    kind: "device",
    tone: "neutral",
    icon: "contacts",
    image: "/hero/contact-approval.png",
    imageAlt: "StayKnown approved-contact screen",
    secondaryImage: "/hero/verification.png",
    secondaryImageAlt: "StayKnown identity verification screen",
    actionLabel: "Contact approval",
    actionHref: "/learn/contact-approval",
    proof: [
      "Approval is visible",
      "Approval alone does not start LIVE sharing",
      "Identity supports recognition",
    ],
  },
  {
    id: "visit",
    chapter: "Start",
    number: "03",
    eyebrow: "User-started protection",
    title: "A Visit gives the safety session a destination, recipients, and a beginning.",
    body:
      "The user reviews guidance, adds a destination, chooses approved recipients, and intentionally starts protection for the situation ahead.",
    kind: "device",
    tone: "safe",
    icon: "visit",
    image: "/hero/visit-live-sos.png",
    imageAlt: "StayKnown Visit, LIVE, and SOS controls",
    secondaryImage: "/hero/visit-live.png",
    secondaryImageAlt: "StayKnown active Visit and LIVE screen",
    actionLabel: "Visit and LIVE",
    actionHref: "/learn/visit-live-sos",
    proof: [
      "User chooses when protection starts",
      "Recipients are selected for the session",
      "Destination context travels with the Visit",
    ],
  },
  {
    id: "live",
    chapter: "Context",
    number: "04",
    eyebrow: "Active-session visibility",
    title: "LIVE sharing belongs to the Visit—not to everyday life.",
    body:
      "During an active permitted safety session, trusted contacts can understand location, confidence, user identity, and the state of the Visit.",
    kind: "device",
    tone: "safe",
    icon: "live",
    image: "/hero/live-map.png",
    imageAlt: "StayKnown LIVE safety map",
    secondaryImage: "/hero/promax-shell.png",
    secondaryImageAlt: "StayKnown premium app shell",
    actionLabel: "Open LIVE map guide",
    actionHref: "/learn/live-map",
    proof: [
      "Private to the supported safety flow",
      "Location confidence remains visible",
      "Access ends when the session ends",
    ],
  },
  {
    id: "capture",
    chapter: "Evidence",
    number: "05",
    eyebrow: "Intentional update",
    title: "Manual Capture adds fresh safety context when the situation changes.",
    body:
      "The user can send an additional safety location or supporting update during the active Visit without turning the app into hidden recording.",
    kind: "device",
    tone: "neutral",
    icon: "capture",
    image: "/hero/manual-capture.png",
    imageAlt: "StayKnown Manual Capture screen",
    secondaryImage: "/hero/get-safe-hints.png",
    secondaryImageAlt: "StayKnown safety-guidance screen",
    actionLabel: "Manual Capture",
    actionHref: "/learn/manual-capture",
    proof: [
      "Visible and user-initiated",
      "Adds timing and location context",
      "No hidden background camera promise",
    ],
  },
  {
    id: "safe",
    chapter: "Reassurance",
    number: "06",
    eyebrow: "I’M SAFE",
    title: "A direct check-in can reassure trusted people without surrendering independence.",
    body:
      "I’M SAFE creates a clear reassurance signal. Scheduled prompts also make a missed confirmation easier to understand and follow up.",
    kind: "device",
    tone: "safe",
    icon: "safe",
    image: "/hero/get-safe-hints.png",
    imageAlt: "StayKnown I’M SAFE guidance screen",
    secondaryImage: "/hero/stories-profile.png",
    secondaryImageAlt: "StayKnown profile and stories screen",
    actionLabel: "I’M SAFE guidance",
    actionHref: "/learn/get-safe-guidance",
    proof: [
      "Direct reassurance",
      "Missed prompts create clearer follow-up",
      "Check-ins do not become all-day surveillance",
    ],
  },
  {
    id: "sos",
    chapter: "Escalation",
    number: "07",
    eyebrow: "Urgent emergency state",
    title: "When danger becomes urgent, the experience becomes unmistakable.",
    body:
      "SOS sends the strongest available safety context to configured contacts and responders while keeping the user informed that escalation is active.",
    kind: "device",
    tone: "sos",
    icon: "sos",
    image: "/hero/sos-activated.png",
    imageAlt: "StayKnown active SOS emergency state",
    secondaryImage: "/hero/sos-active.png",
    secondaryImageAlt: "StayKnown SOS active interface",
    actionLabel: "Understand SOS",
    actionHref: "/learn/sos",
    proof: [
      "High-clarity urgent state",
      "Configured contacts and responders",
      "StayKnown does not claim official dispatch",
    ],
  },
  {
    id: "communication",
    chapter: "Connection",
    number: "08",
    eyebrow: "Secure communication",
    title: "Trusted people can communicate before, during, and after safety events.",
    body:
      "Protected chat entry, language-aware messages, voice, media, stories, and recognizable profiles keep communication connected to identity and safety.",
    kind: "device",
    tone: "neutral",
    icon: "chat",
    image: "/hero/secure-chat-biometric.png",
    imageAlt: "StayKnown secure biometric chat screen",
    secondaryImage: "/hero/chat-translation.png",
    secondaryImageAlt: "StayKnown translated chat screen",
    actionLabel: "Secure chat protection",
    actionHref: "/learn/secure-chat-protection",
    proof: [
      "Protected chat entry",
      "Language-aware communication",
      "Recognition before conversation",
    ],
  },
  {
    id: "ending",
    chapter: "Completion",
    number: "09",
    eyebrow: "Verified ending",
    title: "Protection should end with intent—not through an accidental tap.",
    body:
      "Visit and SOS completion can require stronger confirmation, creating a meaningful end state for the user and trusted recipients.",
    kind: "device",
    tone: "safe",
    icon: "verify",
    image: "/hero/end-visit-verify.png",
    imageAlt: "StayKnown verified Visit ending screen",
    secondaryImage: "/hero/end-sos-verify.png",
    secondaryImageAlt: "StayKnown verified SOS ending screen",
    actionLabel: "Verified stop",
    actionHref: "/learn/verified-stop",
    proof: [
      "Clear completion state",
      "Accidental stopping is reduced",
      "LIVE access closes with the session",
    ],
  },
] as const;

function toneStyles(tone: SceneTone) {
  if (tone === "safe") {
    return {
      text: "text-[#8ff3d0]",
      border: "border-[#8ff3d0]/58",
      dot: "bg-[#8ff3d0]",
      shadow: "shadow-[0_0_28px_rgba(143,243,208,0.22)]",
    };
  }

  if (tone === "sos") {
    return {
      text: "text-[#f04c55]",
      border: "border-[#f04c55]/64",
      dot: "bg-[#f04c55]",
      shadow: "shadow-[0_0_30px_rgba(240,76,85,0.26)]",
    };
  }

  return {
    text: "text-white",
    border: "border-white/55",
    dot: "bg-white",
    shadow: "shadow-[0_0_24px_rgba(255,255,255,0.16)]",
  };
}

function FilmIconView({
  name,
  className = "h-4 w-4",
}: {
  name: FilmIcon;
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
    case "play":
      return (
        <svg {...common}>
          <path d="m9 7 8 5-8 5z" />
        </svg>
      );
    case "pause":
      return (
        <svg {...common}>
          <path d="M9 7v10M15 7v10" />
        </svg>
      );
    case "replay":
      return (
        <svg {...common}>
          <path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.6" />
          <path d="M4 4v4.6h4.6" />
        </svg>
      );
    case "contacts":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 20v-1.5A4.5 4.5 0 0 1 8 14h2a4.5 4.5 0 0 1 4.5 4.5V20" />
          <path d="M16 7.5a2.5 2.5 0 1 1 0 5M17.5 15a4 4 0 0 1 3 3.9V20" />
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
          <path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4" />
          <path d="M4.8 4.8a10.2 10.2 0 0 0 0 14.4M19.2 4.8a10.2 10.2 0 0 1 0 14.4" />
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
          <path d="M12 9v4M12 16.5h.01" />
        </svg>
      );
    case "chat":
      return (
        <svg {...common}>
          <path d="M4 5h16v11H9l-5 4z" />
          <path d="M8 9h8M8 12h6" />
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
          <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" />
        </svg>
      );
    case "sound":
      return (
        <svg {...common}>
          <path d="M5 10h3l4-4v12l-4-4H5z" />
          <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4z" />
          <path d="m18.5 14 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
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
      <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-white" />
      <span className="flex h-7 w-7 items-center justify-center rounded-[9px] border border-black/[0.07] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,1),0_5px_12px_rgba(0,0,0,0.10)]">
        <GooglePlayMark />
      </span>
      <span className="text-[10px] font-black">Get StayKnown</span>
    </a>
  );
}

function HeroFilmStack() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto h-[500px] w-full max-w-[530px] sm:h-[610px]">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.075]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: -24, rotate: -7 }}
        animate={{ opacity: 0.72, x: 0, rotate: -7 }}
        transition={{ duration: reduceMotion ? 0 : 0.72, delay: 0.08 }}
        className="absolute left-[1%] top-[18%] w-[34%]"
      >
        <Image
          src="/hero/contact-approval.png"
          alt="StayKnown approved-contact screen"
          width={380}
          height={800}
          priority
          className="h-auto w-full object-contain drop-shadow-[0_34px_76px_rgba(0,0,0,0.84)]"
        />
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: reduceMotion ? 0 : 0.8,
          delay: 0.16,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="absolute left-1/2 top-[4%] z-10 w-[44%] -translate-x-1/2"
      >
        <Image
          src="/hero/visit-live-sos.png"
          alt="StayKnown Visit, LIVE, and SOS controls"
          width={430}
          height={880}
          priority
          className="h-auto w-full object-contain drop-shadow-[0_38px_82px_rgba(0,0,0,0.9)]"
        />
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: 24, rotate: 7 }}
        animate={{ opacity: 0.72, x: 0, rotate: 7 }}
        transition={{ duration: reduceMotion ? 0 : 0.72, delay: 0.24 }}
        className="absolute right-[1%] top-[18%] w-[34%]"
      >
        <Image
          src="/hero/sos-activated.png"
          alt="StayKnown active SOS screen"
          width={380}
          height={800}
          priority
          className="h-auto w-full object-contain drop-shadow-[0_34px_76px_rgba(0,0,0,0.84)]"
        />
      </motion.div>

      <motion.div
        animate={
          reduceMotion
            ? undefined
            : { scale: [0.97, 1.03, 0.97], opacity: [0.58, 1, 0.58] }
        }
        transition={{
          duration: 4.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[5%] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#8ff3d0]/45 bg-black px-3 py-2 text-[#8ff3d0] shadow-[0_0_28px_rgba(143,243,208,0.16)]"
      >
        <span className="h-2 w-2 rounded-full bg-[#8ff3d0]" />
        <span className="text-[8px] font-black uppercase tracking-[0.15em]">
          Nine-scene product film
        </span>
      </motion.div>
    </div>
  );
}

function DeviceScene({
  scene,
}: {
  scene: FilmScene;
}) {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-5.5, 5.5]), {
    stiffness: 150,
    damping: 21,
  });
  const rotateX = useSpring(useTransform(pointerY, [0, 1], [4.5, -4.5]), {
    stiffness: 150,
    damping: 21,
  });

  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width);
    pointerY.set((event.clientY - rect.top) / rect.height);
  };

  const reset = () => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  };

  const tone = toneStyles(scene.tone);

  return (
    <div
      onPointerMove={move}
      onPointerLeave={reset}
      className="relative h-full min-h-[520px] overflow-hidden"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.075]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />

      <motion.div
        style={{
          rotateX: reduceMotion ? 0 : rotateX,
          rotateY: reduceMotion ? 0 : rotateY,
          transformPerspective: 1200,
        }}
        className="absolute inset-0"
      >
        {scene.secondaryImage ? (
          <div className="absolute right-[7%] top-[18%] w-[39%] rotate-[7deg] opacity-78">
            <Image
              src={scene.secondaryImage}
              alt={scene.secondaryImageAlt ?? ""}
              width={400}
              height={820}
              quality={88}
              className="h-auto w-full object-contain drop-shadow-[0_30px_68px_rgba(0,0,0,0.84)]"
            />
          </div>
        ) : null}

        <div className="absolute left-[12%] top-[6%] z-10 w-[46%]">
          <Image
            src={scene.image}
            alt={scene.imageAlt}
            width={430}
            height={880}
            quality={90}
            className="h-auto w-full object-contain drop-shadow-[0_38px_82px_rgba(0,0,0,0.9)]"
          />
        </div>
      </motion.div>

      <div
        className={`absolute bottom-[7%] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border bg-black px-3 py-2 ${tone.border} ${tone.text} ${tone.shadow}`}
      >
        <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
        <span className="whitespace-nowrap text-[8px] font-black uppercase tracking-[0.15em]">
          {scene.chapter}
        </span>
      </div>
    </div>
  );
}

function EnvironmentScene({
  scene,
}: {
  scene: FilmScene;
}) {
  return (
    <div className="relative h-full min-h-[520px] overflow-hidden">
      <Image
        src={scene.image}
        alt={scene.imageAlt}
        fill
        quality={92}
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/38" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/54 to-transparent" />

      <div className="absolute inset-x-5 bottom-6 sm:inset-x-7">
        <div className="inline-flex min-h-8 items-center gap-2 rounded-full border border-white/28 bg-black/68 px-3 text-[8px] font-black uppercase tracking-[0.15em] text-white backdrop-blur-xl">
          <FilmIconView name="spark" className="h-3.5 w-3.5" />
          Real-world safety context
        </div>
      </div>
    </div>
  );
}

function CinematicPlayer() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(true);
  const [progressKey, setProgressKey] = useState(0);
  const timerRef = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();

  const scene = FILM_SCENES[activeIndex];
  const tone = toneStyles(scene.tone);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const selectScene = useCallback((index: number, pause = true) => {
    const next = Math.max(0, Math.min(FILM_SCENES.length - 1, index));
    setActiveIndex(next);
    setProgressKey((current) => current + 1);
    if (pause) setPlaying(false);
  }, []);

  useEffect(() => {
    const handleVisibility = () => setVisible(!document.hidden);
    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    clearTimer();

    if (!playing || !visible || reduceMotion) return;

    timerRef.current = window.setTimeout(() => {
      setActiveIndex((current) => {
        if (current >= FILM_SCENES.length - 1) {
          setPlaying(false);
          return current;
        }

        setProgressKey((value) => value + 1);
        return current + 1;
      });
    }, SCENE_DURATION_MS);

    return clearTimer;
  }, [
    activeIndex,
    clearTimer,
    playing,
    reduceMotion,
    visible,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    [
      activeIndex,
      Math.max(0, activeIndex - 1),
      Math.min(FILM_SCENES.length - 1, activeIndex + 1),
    ].forEach((index) => {
      const candidate = FILM_SCENES[index];
      [candidate.image, candidate.secondaryImage]
        .filter((value): value is string => Boolean(value))
        .forEach((src) => {
          const image = new window.Image();
          image.src = src;
          image.decode?.().catch(() => undefined);
        });
    });
  }, [activeIndex]);

  const handleKeyboard = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectScene(activeIndex + 1);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectScene(activeIndex - 1);
    }

    if (event.key === " ") {
      event.preventDefault();
      setPlaying((current) => !current);
      setProgressKey((current) => current + 1);
    }

    if (event.key === "Home") {
      event.preventDefault();
      selectScene(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      selectScene(FILM_SCENES.length - 1);
    }
  };

  const togglePlayback = () => {
    if (activeIndex === FILM_SCENES.length - 1 && !playing) {
      setActiveIndex(0);
      setPlaying(true);
      setProgressKey((current) => current + 1);
      return;
    }

    setPlaying((current) => !current);
    setProgressKey((current) => current + 1);
  };

  return (
    <section
      id="product-film"
      className="relative overflow-hidden bg-black py-16 sm:py-20 lg:py-24"
    >
      <div className="pointer-events-none absolute left-1/2 top-[48%] h-[790px] w-[1180px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-[9px] font-black uppercase tracking-[0.28em] text-white/38">
            Interactive product film
          </div>
          <h2 className="mt-4 text-[40px] font-black leading-[0.94] tracking-[-0.068em] text-white sm:text-[52px] md:text-[62px]">
            Watch the complete safety journey unfold.
          </h2>
          <p className="mx-auto mt-5 max-w-[69ch] text-[13px] font-semibold leading-relaxed text-white/56 sm:text-[14px]">
            The film advances automatically through nine chapters. Pause,
            replay, use the chapter strip, or control it with Left, Right,
            Space, Home, and End.
          </p>
        </div>

        <div
          tabIndex={0}
          onKeyDown={handleKeyboard}
          className="mt-9 overflow-hidden rounded-[35px] border border-white/[0.13] bg-black outline-none shadow-[0_40px_124px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,0.08)] focus-visible:ring-2 focus-visible:ring-white/30"
          aria-label="StayKnown interactive product film"
        >
          <div className="flex flex-col gap-3 border-b border-white/[0.09] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-[12px] border bg-black ${tone.border} ${tone.text} ${tone.shadow}`}
              >
                <FilmIconView name={scene.icon} className="h-4 w-4" />
              </span>
              <div>
                <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30">
                  Chapter {scene.number} of 09
                </div>
                <div
                  className="mt-1 text-[11px] font-black text-white/78"
                  aria-live="polite"
                >
                  {scene.chapter}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => selectScene(activeIndex - 1)}
                disabled={activeIndex === 0}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.14] bg-black text-white/60 transition hover:border-white/27 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                aria-label="Previous film chapter"
              >
                <span className="rotate-180">
                  <FilmIconView name="arrow" className="h-3.5 w-3.5" />
                </span>
              </button>

              <button
                type="button"
                onClick={togglePlayback}
                className="inline-flex h-9 items-center gap-2 rounded-[13px] border border-white bg-white px-3.5 text-[9px] font-black uppercase tracking-[0.1em] text-black shadow-[0_10px_24px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,1),inset_0_-4px_10px_rgba(0,0,0,0.09)] transition hover:-translate-y-px hover:border-white/25 hover:bg-black hover:text-white"
              >
                <FilmIconView
                  name={
                    activeIndex === FILM_SCENES.length - 1 && !playing
                      ? "replay"
                      : playing
                        ? "pause"
                        : "play"
                  }
                  className="h-3.5 w-3.5"
                />
                {activeIndex === FILM_SCENES.length - 1 && !playing
                  ? "Replay"
                  : playing
                    ? "Pause"
                    : "Play"}
              </button>

              <button
                type="button"
                onClick={() => selectScene(activeIndex + 1)}
                disabled={activeIndex === FILM_SCENES.length - 1}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.14] bg-black text-white/60 transition hover:border-white/27 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
                aria-label="Next film chapter"
              >
                <FilmIconView name="arrow" className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.06fr_0.94fr]">
            <div className="relative min-h-[540px] border-b border-white/[0.09] lg:min-h-[700px] lg:border-b-0 lg:border-r">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${scene.id}-visual`}
                  initial={
                    reduceMotion
                      ? false
                      : { opacity: 0, scale: 0.985, y: 10 }
                  }
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.992, y: -6 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.42,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="absolute inset-0"
                >
                  {scene.kind === "environment" ? (
                    <EnvironmentScene scene={scene} />
                  ) : (
                    <DeviceScene scene={scene} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="relative min-h-[590px] p-5 sm:p-7 lg:min-h-[700px] lg:p-9">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${scene.id}-copy`}
                  initial={{ opacity: 0, x: 18, y: 4 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex h-full flex-col"
                >
                  <div className={`text-[9px] font-black uppercase tracking-[0.23em] ${tone.text}`}>
                    {scene.eyebrow}
                  </div>

                  <h3 className="mt-4 max-w-[15ch] text-[36px] font-black leading-[0.95] tracking-[-0.065em] text-white sm:text-[45px] lg:text-[49px]">
                    {scene.title}
                  </h3>

                  <p className="mt-5 max-w-[61ch] text-[13px] font-semibold leading-relaxed text-white/57 sm:text-[14px]">
                    {scene.body}
                  </p>

                  <div className="mt-7 grid gap-3">
                    {scene.proof.map((item, index) => (
                      <div
                        key={item}
                        className={`flex items-start gap-3 rounded-[19px] border bg-black p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] ${
                          index === 0 ? tone.border : "border-white/[0.11]"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] border bg-black ${
                            index === 0
                              ? `${tone.border} ${tone.text}`
                              : "border-white/[0.12] text-white/55"
                          }`}
                        >
                          <FilmIconView
                            name={index === 2 ? "lock" : "shield"}
                            className="h-3.5 w-3.5"
                          />
                        </span>
                        <span className="text-[11.5px] font-semibold leading-relaxed text-white/63 sm:text-[12.5px]">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-7">
                    <Link
                      href={scene.actionHref}
                      className="inline-flex h-9 items-center gap-2 rounded-[13px] border border-white bg-white px-3.5 text-[10px] font-black text-black shadow-[0_10px_24px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,1),inset_0_-4px_10px_rgba(0,0,0,0.09)] transition hover:-translate-y-px hover:border-white/25 hover:bg-black hover:text-white"
                    >
                      {scene.actionLabel}
                      <FilmIconView name="arrow" className="h-3.5 w-3.5" />
                    </Link>

                    <Link
                      href="/features"
                      className="inline-flex min-h-9 items-center gap-2 rounded-[13px] border border-white/[0.14] bg-black px-3.5 text-[10px] font-black text-white/65 transition hover:border-white/25 hover:text-white"
                    >
                      Feature atlas
                      <FilmIconView name="arrow" className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="relative border-t border-white/[0.09] px-3 py-3 sm:px-4">
            <div className="absolute inset-x-0 top-0 h-px bg-white/[0.04]" />

            <div className="sk-scroll-hidden flex gap-2 overflow-x-auto pb-1">
              {FILM_SCENES.map((candidate, index) => {
                const selected = index === activeIndex;
                const candidateTone = toneStyles(candidate.tone);

                return (
                  <button
                    key={candidate.id}
                    type="button"
                    onClick={() => selectScene(index)}
                    aria-current={selected ? "step" : undefined}
                    className={`relative inline-flex min-h-11 shrink-0 items-center gap-2.5 overflow-hidden rounded-[14px] border px-3 text-left transition ${
                      selected
                        ? "border-white bg-white text-black shadow-[inset_0_1px_0_rgba(255,255,255,1)]"
                        : "border-white/[0.11] bg-black text-white/48 hover:border-white/24 hover:text-white"
                    }`}
                  >
                    {selected && playing && !reduceMotion ? (
                      <motion.span
                        key={`${progressKey}-${candidate.id}`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{
                          duration: SCENE_DURATION_MS / 1000,
                          ease: "linear",
                        }}
                        className={`absolute inset-x-0 bottom-0 h-px origin-left ${candidateTone.dot}`}
                      />
                    ) : null}

                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[8px] border ${
                        selected
                          ? "border-black/[0.09] text-black"
                          : `${candidateTone.border} ${candidateTone.text}`
                      }`}
                    >
                      <FilmIconView
                        name={candidate.icon}
                        className="h-3.5 w-3.5"
                      />
                    </span>

                    <span>
                      <span className="block text-[7px] font-black uppercase tracking-[0.13em] opacity-55">
                        {candidate.number}
                      </span>
                      <span className="mt-1 block text-[9px] font-black">
                        {candidate.chapter}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FilmPrinciples() {
  const principles = [
    {
      number: "01",
      label: "Start",
      title: "The user begins the safety session.",
      body:
        "Approval prepares the trusted relationship, but Visit, LIVE, Capture, I’M SAFE, and SOS require supported user action or configured safety logic.",
      icon: "play" as FilmIcon,
      tone: "neutral" as SceneTone,
    },
    {
      number: "02",
      label: "Context",
      title: "The alert explains what is happening.",
      body:
        "Identity, destination, safety state, location confidence, timing, and response actions help recipients understand more than a raw location dot.",
      icon: "live" as FilmIcon,
      tone: "safe" as SceneTone,
    },
    {
      number: "03",
      label: "Escalate",
      title: "Urgency becomes visually unmistakable.",
      body:
        "SOS changes the priority and clarity of the experience while remaining honest that StayKnown is not universal professional emergency dispatch.",
      icon: "sos" as FilmIcon,
      tone: "sos" as SceneTone,
    },
    {
      number: "04",
      label: "End",
      title: "Access closes with the safety session.",
      body:
        "Verified completion creates a clear end state. Approved contacts do not retain a permanent LIVE route after the Visit or SOS finishes.",
      icon: "verify" as FilmIcon,
      tone: "safe" as SceneTone,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-white py-16 text-black sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-[9px] font-black uppercase tracking-[0.28em] text-black/36">
            What the film proves
          </div>
          <h2 className="mt-4 text-[40px] font-black leading-[0.94] tracking-[-0.068em] sm:text-[52px] md:text-[60px]">
            The safety experience follows a deliberate rhythm.
          </h2>
          <p className="mx-auto mt-5 max-w-[66ch] text-[13px] font-semibold leading-relaxed text-black/56 sm:text-[14px]">
            StayKnown is designed around four understandable states: start,
            context, urgent escalation, and verified completion.
          </p>
        </div>

        <div className="mt-9 grid gap-3 md:grid-cols-2">
          {principles.map((principle, index) => {
            const accent = toneStyles(principle.tone);

            return (
              <motion.article
                key={principle.label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.42,
                  delay: index * 0.065,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative overflow-hidden rounded-[25px] border border-black/[0.14] bg-white p-5 shadow-[0_20px_52px_rgba(0,0,0,0.075),inset_0_1px_0_rgba(255,255,255,1)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-[13px] border bg-white ${
                      principle.tone === "safe"
                        ? "border-[#0b7a62]/48 text-[#0b7a62] shadow-[0_0_22px_rgba(11,122,98,0.13)]"
                        : principle.tone === "sos"
                          ? "border-[#d7353d]/52 text-[#d7353d] shadow-[0_0_24px_rgba(215,53,61,0.14)]"
                          : "border-black/[0.16] text-black"
                    }`}
                  >
                    <FilmIconView
                      name={principle.icon}
                      className="h-4 w-4"
                    />
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-[0.17em] text-black/28">
                    {principle.number}
                  </span>
                </div>

                <div
                  className={`mt-5 text-[8.5px] font-black uppercase tracking-[0.15em] ${
                    principle.tone === "safe"
                      ? "text-[#0b7a62]"
                      : principle.tone === "sos"
                        ? "text-[#d7353d]"
                        : "text-black/38"
                  }`}
                >
                  {principle.label}
                </div>
                <h3 className="mt-2 max-w-[18ch] text-[24px] font-black leading-[1] tracking-[-0.052em]">
                  {principle.title}
                </h3>
                <p className="mt-4 text-[11.5px] font-semibold leading-relaxed text-black/56">
                  {principle.body}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AudiencePreview() {
  const paths = [
    {
      label: "Students",
      eyebrow: "School and campus movement",
      body:
        "Use intentional safety sessions for classes, transport, unfamiliar meetings, late movement, and trusted guardian awareness.",
      image: "/hero/stayknown-safe-journey-bus.png",
      href: "/learn/safe-journey",
    },
    {
      label: "Travel & rides",
      eyebrow: "Journeys and destinations",
      body:
        "Add destination context, keep LIVE protection active, use Manual Capture, and escalate when the route or situation changes.",
      image: "/hero/visit-live.png",
      href: "/learn/visit-live",
    },
    {
      label: "Families & guardians",
      eyebrow: "Care without hidden tracking",
      body:
        "Support loved ones and eligible minors through approved relationships, visible safety sessions, check-ins, and clear boundaries.",
      image: "/hero/stayknown-family-farewell.png",
      href: "/learn/family-safety",
    },
  ] as const;

  return (
    <section className="relative overflow-hidden bg-black py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[650px] w-[1050px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-[9px] font-black uppercase tracking-[0.28em] text-white/38">
            See yourself in the journey
          </div>
          <h2 className="mt-4 text-[40px] font-black leading-[0.94] tracking-[-0.068em] text-white sm:text-[52px] md:text-[60px]">
            One safety model. Different real-life situations.
          </h2>
          <p className="mx-auto mt-5 max-w-[66ch] text-[13px] font-semibold leading-relaxed text-white/55 sm:text-[14px]">
            The same consent-first structure can support students, journeys,
            ride-hailing, families, guardians, visits, and uncertain moments.
          </p>
        </div>

        <div className="mt-9 grid gap-4 lg:grid-cols-3">
          {paths.map((path, index) => (
            <motion.article
              key={path.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.42,
                delay: index * 0.07,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative min-h-[420px] overflow-hidden rounded-[28px] border border-white/[0.13] bg-black shadow-[0_30px_80px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.07)]"
            >
              <Image
                src={path.image}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover opacity-74 transition duration-500 group-hover:scale-[1.025] group-hover:opacity-88"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/62 to-black/10" />

              <div className="absolute inset-x-5 bottom-5">
                <div className="text-[8px] font-black uppercase tracking-[0.16em] text-[#8ff3d0]">
                  {path.eyebrow}
                </div>
                <h3 className="mt-2 text-[27px] font-black tracking-[-0.055em] text-white">
                  {path.label}
                </h3>
                <p className="mt-3 text-[11px] font-semibold leading-relaxed text-white/57">
                  {path.body}
                </p>
                <Link
                  href={path.href}
                  className="mt-5 inline-flex h-9 items-center gap-2 rounded-[13px] border border-white/[0.17] bg-black/72 px-3.5 text-[10px] font-black text-white/70 backdrop-blur-xl transition hover:border-white hover:bg-white hover:text-black"
                >
                  Explore this story
                  <FilmIconView name="arrow" className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function WatchExperience() {
  return (
    <main className="min-h-screen overflow-x-clip bg-black text-white">
      <style jsx global>{`
        #main-content {
          background: #000000;
        }

        .sk-watch-nav-link {
          position: relative;
        }

        .sk-watch-nav-link::after {
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

        .sk-watch-nav-link:hover::after,
        .sk-watch-nav-link:focus-visible::after {
          opacity: 0.55;
          transform: scaleX(1);
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
                Watch the journey
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-5 md:flex">
            <a
              href="#product-film"
              className="sk-watch-nav-link text-[9px] font-black uppercase tracking-[0.13em] text-white/52 transition hover:text-white"
            >
              Film
            </a>
            <Link
              href="/how-it-works"
              className="sk-watch-nav-link text-[9px] font-black uppercase tracking-[0.13em] text-white/52 transition hover:text-white"
            >
              How it works
            </Link>
            <Link
              href="/features"
              className="sk-watch-nav-link text-[9px] font-black uppercase tracking-[0.13em] text-white/52 transition hover:text-white"
            >
              Features
            </Link>
          </nav>

          <DownloadButton />
        </div>
      </header>

      <section className="relative isolate overflow-hidden bg-black">
        <div className="pointer-events-none absolute left-1/2 top-[45%] h-[820px] w-[1220px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />
        <div className="pointer-events-none absolute left-1/2 top-[45%] h-[570px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.065]" />

        <div className="relative mx-auto grid min-h-[720px] max-w-6xl items-center gap-10 px-4 py-14 sm:px-5 lg:grid-cols-[1.05fr_0.95fr] lg:px-6 lg:py-20">
          <div>
            <div className="inline-flex min-h-8 items-center gap-2 rounded-full border border-[#8ff3d0]/46 bg-black px-3 text-[8px] font-black uppercase tracking-[0.18em] text-[#8ff3d0] shadow-[0_0_24px_rgba(143,243,208,0.13)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8ff3d0] shadow-[0_0_12px_rgba(143,243,208,0.72)]" />
              Cinematic product experience
            </div>

            <h1 className="mt-6 max-w-[11ch] text-[52px] font-black leading-[0.9] tracking-[-0.076em] sm:text-[68px] lg:text-[79px]">
              Watch safety move from consent to verified completion.
            </h1>

            <p className="mt-6 max-w-[64ch] text-[14px] font-semibold leading-relaxed text-white/58 sm:text-[15px]">
              Follow the complete StayKnown journey through real app screens and
              real-life context: approval, Visit, LIVE, Capture, I’M SAFE, SOS,
              secure communication, and a deliberate ending.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#product-film"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[14px] border border-white bg-white px-4 text-[10px] font-black text-black shadow-[0_12px_30px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,1),inset_0_-5px_12px_rgba(0,0,0,0.09)] transition hover:-translate-y-px hover:border-white/25 hover:bg-black hover:text-white"
              >
                <FilmIconView name="play" className="h-3.5 w-3.5" />
                Start the film
              </a>
              <Link
                href="/plans"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[14px] border border-white/[0.15] bg-black px-4 text-[10px] font-black text-white/68 transition hover:border-white/28 hover:text-white"
              >
                Compare plans
                <FilmIconView name="arrow" className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-[8.5px] font-black uppercase tracking-[0.12em] text-white/34">
              <span>9 chapters</span>
              <span>Real app screens</span>
              <span>Auto-play</span>
              <span>Keyboard controls</span>
              <span>Reduced-motion aware</span>
            </div>
          </div>

          <HeroFilmStack />
        </div>
      </section>

      <CinematicPlayer />
      <FilmPrinciples />
      <AudiencePreview />

      <section className="relative overflow-hidden bg-white py-16 text-black sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-5 lg:px-6">
          <div className="text-[9px] font-black uppercase tracking-[0.28em] text-black/36">
            Continue from the film
          </div>
          <h2 className="mx-auto mt-4 max-w-[14ch] text-[42px] font-black leading-[0.94] tracking-[-0.07em] sm:text-[54px] md:text-[62px]">
            Understand it. Compare it. Install it.
          </h2>
          <p className="mx-auto mt-5 max-w-[67ch] text-[13px] font-semibold leading-relaxed text-black/56 sm:text-[14px]">
            Explore the complete system, compare plan capacity, review the trust
            boundaries, and install StayKnown on Android.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <DownloadButton className="w-full max-w-[210px] sm:w-auto" />
            <Link
              href="/features"
              className="inline-flex h-10 w-full max-w-[210px] items-center justify-center gap-2 rounded-[14px] border border-black/[0.17] bg-white px-4 text-[10px] font-black text-black transition hover:-translate-y-px hover:border-black hover:bg-black hover:text-white sm:w-auto"
            >
              Feature atlas
              <FilmIconView name="arrow" className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/trust-safety"
              className="inline-flex h-10 w-full max-w-[210px] items-center justify-center gap-2 rounded-[14px] border border-black/[0.17] bg-white px-4 text-[10px] font-black text-black transition hover:-translate-y-px hover:border-black hover:bg-black hover:text-white sm:w-auto"
            >
              Trust &amp; Safety
              <FilmIconView name="arrow" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
