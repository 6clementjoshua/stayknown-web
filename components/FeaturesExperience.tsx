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
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.stayknown.app";

type FeatureTone = "neutral" | "safe" | "sos";
type FeatureIcon =
  | "visit"
  | "live"
  | "capture"
  | "verify"
  | "sos"
  | "responders"
  | "phrase"
  | "contacts"
  | "identity"
  | "gallery"
  | "chat"
  | "translate"
  | "voice"
  | "stories"
  | "vpn"
  | "privacy"
  | "shell"
  | "check"
  | "arrow"
  | "shield"
  | "lock"
  | "grid";

type FeatureItem = {
  title: string;
  body: string;
  icon: FeatureIcon;
};

type FeaturePillar = {
  id: string;
  number: string;
  label: string;
  eyebrow: string;
  title: string;
  summary: string;
  image: string;
  imageAlt: string;
  secondaryImage: string;
  secondaryImageAlt: string;
  tone: FeatureTone;
  icon: FeatureIcon;
  learnHref: string;
  highlights: readonly string[];
  items: readonly FeatureItem[];
};

const PILLARS: readonly FeaturePillar[] = [
  {
    id: "safety-sessions",
    number: "01",
    label: "Safety Sessions",
    eyebrow: "Movement with a defined purpose",
    title: "Visits turn everyday movement into a clear safety session.",
    summary:
      "Start protection for a destination, journey, ride, meeting, or unfamiliar environment. LIVE context stays connected to that session and ends deliberately.",
    image: "/hero/visit-live.png",
    imageAlt: "StayKnown Visit and LIVE protection screen",
    secondaryImage: "/hero/live-map.png",
    secondaryImageAlt: "StayKnown LIVE map for approved contacts",
    tone: "safe",
    icon: "visit",
    learnHref: "/learn/visit-live-sos",
    highlights: [
      "User-started Visit",
      "Selected approved recipients",
      "LIVE session context",
      "Verified ending",
    ],
    items: [
      {
        title: "Destination-aware Visits",
        body:
          "Add a destination, review pre-start guidance, select permitted contacts, and create a visible beginning for the safety flow.",
        icon: "visit",
      },
      {
        title: "LIVE safety sharing",
        body:
          "Share location, confidence, identity, and active-session context only while the supported Visit or SOS flow is running.",
        icon: "live",
      },
      {
        title: "Manual Capture",
        body:
          "Add an intentional extra safety location or supporting update when the active situation needs more context.",
        icon: "capture",
      },
      {
        title: "Confirmed completion",
        body:
          "End active protection through a verification-first flow so location access does not disappear through an accidental tap.",
        icon: "verify",
      },
    ],
  },
  {
    id: "emergency-response",
    number: "02",
    label: "Emergency Response",
    eyebrow: "High-clarity escalation",
    title: "SOS changes the interface, message priority, and response expectations.",
    summary:
      "When a situation becomes urgent, StayKnown moves from normal safety support into an unmistakable emergency state for selected contacts and responders.",
    image: "/hero/sos-activated.png",
    imageAlt: "StayKnown active SOS emergency state",
    secondaryImage: "/hero/end-sos-verify.png",
    secondaryImageAlt: "StayKnown verified end SOS screen",
    tone: "sos",
    icon: "sos",
    learnHref: "/learn/sos",
    highlights: [
      "Urgent SOS state",
      "Selected SOS contacts",
      "Responder actions",
      "Verified stop",
    ],
    items: [
      {
        title: "Intentional SOS activation",
        body:
          "Activate a visible emergency state when urgent escalation is required, with strong feedback that the alert flow is running.",
        icon: "sos",
      },
      {
        title: "Contacts and responders",
        body:
          "Send urgent safety context to configured SOS contacts and responders with the user identity and available session information.",
        icon: "responders",
      },
      {
        title: "Emergency phrase controls",
        body:
          "Use configured emergency phrases and escalation timing to strengthen supported trigger and response behaviour.",
        icon: "phrase",
      },
      {
        title: "Verified SOS ending",
        body:
          "Require a stronger confirmation before emergency protection is stopped, helping prevent accidental cancellation.",
        icon: "verify",
      },
    ],
  },
  {
    id: "trusted-identity",
    number: "03",
    label: "Trusted Identity",
    eyebrow: "Know who is inside the safety flow",
    title: "Recognition and consent matter before location ever appears.",
    summary:
      "Approved contacts, profile identity, verification, and Safety Gallery recognition help users understand who they are trusting and who is responding.",
    image: "/hero/contact-approval.png",
    imageAlt: "StayKnown approved-contact request screen",
    secondaryImage: "/hero/verification.png",
    secondaryImageAlt: "StayKnown verified identity screen",
    tone: "neutral",
    icon: "identity",
    learnHref: "/learn/contact-approval",
    highlights: [
      "Approved relationships",
      "Visible identity",
      "Verification signals",
      "Safety recognition",
    ],
    items: [
      {
        title: "Consent-based contacts",
        body:
          "Create a visible approval relationship before supported safety access becomes available. Requests can be declined, restricted, blocked, or revoked.",
        icon: "contacts",
      },
      {
        title: "Verified identity",
        body:
          "Use verification signals to help people recognize verified individuals and organizations across safety and communication flows.",
        icon: "identity",
      },
      {
        title: "Safety Gallery",
        body:
          "Keep recognition images available for trusted contacts during Visits, SOS alerts, and safety communication.",
        icon: "gallery",
      },
      {
        title: "Profile trust",
        body:
          "Names, avatars, relationship status, and profile surfaces support recognition before conversations and safety sessions begin.",
        icon: "shield",
      },
    ],
  },
  {
    id: "secure-communication",
    number: "04",
    label: "Secure Communication",
    eyebrow: "Communication designed around safety",
    title: "Chat stays expressive without losing the protection layer.",
    summary:
      "StayKnown combines secure entry, multilingual communication, voice and media, and recognizable profiles so trusted people can communicate before, during, and after safety events.",
    image: "/hero/secure-chat-biometric.png",
    imageAlt: "StayKnown secure biometric chat protection screen",
    secondaryImage: "/hero/chat-translation.png",
    secondaryImageAlt: "StayKnown language-aware chat screen",
    tone: "neutral",
    icon: "chat",
    learnHref: "/learn/secure-chat-protection",
    highlights: [
      "Protected chat entry",
      "Translation-aware messages",
      "Voice and media",
      "Recognizable profiles",
    ],
    items: [
      {
        title: "Secure chat protection",
        body:
          "Use biometric or device-level protection so private safety conversations remain harder for an unintended person to open.",
        icon: "lock",
      },
      {
        title: "Language-aware chat",
        body:
          "Handle recipient language preferences and supported translations so safety communication can remain understandable across languages.",
        icon: "translate",
      },
      {
        title: "Voice, media, and stickers",
        body:
          "Send voice notes, media, and expressive content while keeping the wider communication experience connected to trusted identities.",
        icon: "voice",
      },
      {
        title: "Stories and profile context",
        body:
          "Use stories, avatars, names, and profile surfaces to strengthen recognition before communication begins.",
        icon: "stories",
      },
    ],
  },
  {
    id: "safety-integrity",
    number: "05",
    label: "Safety Integrity",
    eyebrow: "Reliability before visual polish",
    title: "The platform protects the conditions that make safety data useful.",
    summary:
      "Location reliability, privacy boundaries, device protection, and plan-aware navigation help the app remain understandable when users need it quickly.",
    image: "/hero/vpn-safety-gate.png",
    imageAlt: "StayKnown VPN safety reliability gate",
    secondaryImage: "/hero/promax-shell.png",
    secondaryImageAlt: "StayKnown premium plan-aware app shell",
    tone: "safe",
    icon: "shield",
    learnHref: "/learn/vpn-safety",
    highlights: [
      "VPN reliability gate",
      "Sensitive-screen protection",
      "Plan-aware capacity",
      "Fast safety navigation",
    ],
    items: [
      {
        title: "VPN safety gate",
        body:
          "Warn or block supported location flows when VPN use can weaken confidence in the safety location being presented.",
        icon: "vpn",
      },
      {
        title: "Sensitive-screen privacy",
        body:
          "Use device-level screen protection on supported sensitive areas to reduce casual third-party screenshots or recordings.",
        icon: "privacy",
      },
      {
        title: "Plan-aware capacity",
        body:
          "Make contact, SOS, responder, Gallery, translation, and personalization capacity clear across Starter, Pro, and Pro Max.",
        icon: "grid",
      },
      {
        title: "Premium app shell",
        body:
          "Keep high-value safety, contacts, chat, profile, and emergency actions easy to reach through a fast plan-aware navigation system.",
        icon: "shell",
      },
    ],
  },
] as const;

const ALL_CAPABILITIES = [
  "Approved contacts",
  "Active Visits",
  "Destination context",
  "LIVE safety map",
  "Manual Capture",
  "I’M SAFE check-ins",
  "Missed check-in follow-up",
  "SOS contacts",
  "SOS responders",
  "Emergency phrase controls",
  "Verified Visit ending",
  "Verified SOS ending",
  "Safety Gallery",
  "Verified identity",
  "Secure chat entry",
  "Translation-aware chat",
  "Voice notes and media",
  "Stories and profile trust",
  "VPN reliability gate",
  "Sensitive-screen privacy",
] as const;

function toneStyles(tone: FeatureTone) {
  if (tone === "safe") {
    return {
      text: "text-[#18b88a]",
      border: "border-[#18b88a]/58",
      dot: "bg-[#18b88a]",
      glow: "shadow-[0_0_26px_rgba(24,184,138,0.24)]",
    };
  }

  if (tone === "sos") {
    return {
      text: "text-[#f04c55]",
      border: "border-[#f04c55]/64",
      dot: "bg-[#f04c55]",
      glow: "shadow-[0_0_28px_rgba(240,76,85,0.28)]",
    };
  }

  return {
    text: "text-white",
    border: "border-white/58",
    dot: "bg-white",
    glow: "shadow-[0_0_24px_rgba(255,255,255,0.18)]",
  };
}

function FeatureIconView({
  name,
  className = "h-4 w-4",
}: {
  name: FeatureIcon;
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
    case "verify":
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 4.5 6v5.5c0 4.7 3.1 7.7 7.5 9.5 4.4-1.8 7.5-4.8 7.5-9.5V6z" />
          {name === "verify" ? <path d="m8.5 12 2.2 2.2 4.8-5" /> : null}
        </svg>
      );
    case "sos":
      return (
        <svg {...common}>
          <path d="M12 3 2.8 19h18.4z" />
          <path d="M12 9v4M12 16.5h.01" />
        </svg>
      );
    case "responders":
    case "contacts":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 20v-1.5A4.5 4.5 0 0 1 8 14h2a4.5 4.5 0 0 1 4.5 4.5V20" />
          <path d="M16 7.5a2.5 2.5 0 1 1 0 5M17.5 15a4 4 0 0 1 3 3.9V20" />
        </svg>
      );
    case "phrase":
      return (
        <svg {...common}>
          <path d="M4 5h16v11H8l-4 4z" />
          <path d="M8 9h8M8 12h5" />
        </svg>
      );
    case "identity":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M5 21a7 7 0 0 1 14 0" />
          <path d="m17 5 1.2 1.2L21 3.4" />
        </svg>
      );
    case "gallery":
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.5" />
          <path d="m5.5 17 4.5-4 3 2.5 2.5-2 3 3" />
        </svg>
      );
    case "chat":
      return (
        <svg {...common}>
          <path d="M4 5h16v11H9l-5 4z" />
          <path d="M8 9h8M8 12h6" />
        </svg>
      );
    case "translate":
      return (
        <svg {...common}>
          <path d="M4 5h8M8 3v2M5 8c1.5 3 3.8 5.2 7 6.5M11 8c-.8 2.2-2.3 4.1-4.5 5.6" />
          <path d="m14 19 3.2-8 3.3 8M15.3 16h4" />
        </svg>
      );
    case "voice":
      return (
        <svg {...common}>
          <rect x="9" y="3" width="6" height="12" rx="3" />
          <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6" />
        </svg>
      );
    case "stories":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      );
    case "vpn":
      return (
        <svg {...common}>
          <path d="M12 3 4.5 6v5.5c0 4.7 3.1 7.7 7.5 9.5 4.4-1.8 7.5-4.8 7.5-9.5V6z" />
          <path d="m8 16 8-8M9 8h.01M15 16h.01" />
        </svg>
      );
    case "privacy":
    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="10" width="14" height="10" rx="3" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" />
        </svg>
      );
    case "shell":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <path d="M8 8h8M8 12h3M8 16h8" />
        </svg>
      );
    case "grid":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="6" height="6" rx="1.5" />
          <rect x="14" y="4" width="6" height="6" rx="1.5" />
          <rect x="4" y="14" width="6" height="6" rx="1.5" />
          <rect x="14" y="14" width="6" height="6" rx="1.5" />
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
      className="h-[17px] w-[17px]"
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

function DevicePair({
  pillar,
}: {
  pillar: FeaturePillar;
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

  const handleMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width);
    pointerY.set((event.clientY - rect.top) / rect.height);
  };

  const reset = () => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  };

  const tone = toneStyles(pillar.tone);

  return (
    <div
      onPointerMove={handleMove}
      onPointerLeave={reset}
      className="relative mx-auto h-[500px] w-full max-w-[500px] sm:h-[610px]"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.075]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[470px] w-[470px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />

      <motion.div
        key={`${pillar.id}-secondary`}
        initial={reduceMotion ? false : { opacity: 0, x: 25, rotate: 6 }}
        animate={{ opacity: 0.82, x: 0, rotate: 6 }}
        exit={{ opacity: 0, x: 18 }}
        transition={{
          duration: reduceMotion ? 0 : 0.48,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          rotateX: reduceMotion ? 0 : rotateX,
          rotateY: reduceMotion ? 0 : rotateY,
          transformPerspective: 1200,
        }}
        className="absolute right-[3%] top-[17%] w-[42%]"
      >
        <Image
          src={pillar.secondaryImage}
          alt={pillar.secondaryImageAlt}
          width={400}
          height={820}
          quality={88}
          className="h-auto w-full object-contain drop-shadow-[0_30px_68px_rgba(0,0,0,0.82)]"
        />
      </motion.div>

      <motion.div
        key={pillar.id}
        initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.985 }}
        transition={{
          duration: reduceMotion ? 0 : 0.52,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          rotateX: reduceMotion ? 0 : rotateX,
          rotateY: reduceMotion ? 0 : rotateY,
          transformPerspective: 1200,
        }}
        className="absolute left-[9%] top-[6%] z-10 w-[49%]"
      >
        <Image
          src={pillar.image}
          alt={pillar.imageAlt}
          width={430}
          height={880}
          priority={pillar.id === PILLARS[0].id}
          quality={90}
          className="h-auto w-full object-contain drop-shadow-[0_38px_82px_rgba(0,0,0,0.88)]"
        />
      </motion.div>

      <motion.div
        key={`${pillar.id}-status`}
        initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: reduceMotion ? 0 : 0.42,
          delay: reduceMotion ? 0 : 0.18,
        }}
        className={`absolute bottom-[6%] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border bg-black px-3 py-2 ${tone.border} ${tone.text} ${tone.glow}`}
      >
        <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
        <span className="whitespace-nowrap text-[8px] font-black uppercase tracking-[0.15em]">
          {pillar.label}
        </span>
      </motion.div>
    </div>
  );
}

function PillarAtlas() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activePillar = PILLARS[activeIndex];
  const tone = toneStyles(activePillar.tone);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const nearby = [
      activeIndex,
      Math.max(0, activeIndex - 1),
      Math.min(PILLARS.length - 1, activeIndex + 1),
    ];

    nearby.forEach((index) => {
      const pillar = PILLARS[index];
      [pillar.image, pillar.secondaryImage].forEach((src) => {
        const image = new window.Image();
        image.src = src;
        image.decode?.().catch(() => undefined);
      });
    });
  }, [activeIndex]);

  return (
    <section id="feature-atlas" className="relative overflow-hidden bg-black py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute left-1/2 top-[48%] h-[720px] w-[1120px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-[9px] font-black uppercase tracking-[0.28em] text-white/38">
            Product capability atlas
          </div>
          <h2 className="mt-4 text-[40px] font-black leading-[0.94] tracking-[-0.068em] text-white sm:text-[52px] md:text-[62px]">
            Five connected systems. One understandable safety product.
          </h2>
          <p className="mx-auto mt-5 max-w-[68ch] text-[13px] font-semibold leading-relaxed text-white/56 sm:text-[14px]">
            Select a pillar to inspect the real app surfaces, supporting
            capabilities, and the role each system plays inside StayKnown.
          </p>
        </div>

        <div className="mt-9 flex gap-2 overflow-x-auto pb-2 sk-scroll-hidden">
          {PILLARS.map((pillar, index) => {
            const selected = index === activeIndex;
            const itemTone = toneStyles(pillar.tone);

            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-current={selected ? "page" : undefined}
                className={`group inline-flex min-h-10 shrink-0 items-center gap-2.5 rounded-[14px] border px-3 text-[9px] font-black transition ${
                  selected
                    ? "border-white bg-white text-black shadow-[inset_0_1px_0_rgba(255,255,255,1)]"
                    : "border-white/[0.11] bg-black text-white/48 hover:border-white/24 hover:text-white"
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-[8px] border ${
                    selected
                      ? "border-black/[0.09] text-black"
                      : `${itemTone.border} ${itemTone.text}`
                  }`}
                >
                  <FeatureIconView name={pillar.icon} className="h-3.5 w-3.5" />
                </span>
                {pillar.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 overflow-hidden rounded-[34px] border border-white/[0.13] bg-black shadow-[0_38px_118px_rgba(0,0,0,0.74),inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="grid lg:grid-cols-[0.94fr_1.06fr]">
            <div className="relative min-h-[560px] overflow-hidden border-b border-white/[0.09] p-5 sm:p-7 lg:min-h-[760px] lg:border-b-0 lg:border-r">
              <AnimatePresence mode="wait">
                <DevicePair key={activePillar.id} pillar={activePillar} />
              </AnimatePresence>
            </div>

            <div className="relative min-h-[640px] p-5 sm:p-7 lg:min-h-[760px] lg:p-9">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activePillar.id}-copy`}
                  initial={{ opacity: 0, x: 18, y: 5 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex h-full flex-col"
                >
                  <div className={`text-[9px] font-black uppercase tracking-[0.23em] ${tone.text}`}>
                    {activePillar.eyebrow}
                  </div>
                  <h3 className="mt-4 max-w-[14ch] text-[36px] font-black leading-[0.95] tracking-[-0.065em] text-white sm:text-[45px] lg:text-[50px]">
                    {activePillar.title}
                  </h3>
                  <p className="mt-5 max-w-[62ch] text-[13px] font-semibold leading-relaxed text-white/57 sm:text-[14px]">
                    {activePillar.summary}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {activePillar.highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className={`inline-flex min-h-8 items-center gap-2 rounded-full border bg-black px-3 text-[8.5px] font-black uppercase tracking-[0.1em] text-white/60 ${tone.border}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                        {highlight}
                      </span>
                    ))}
                  </div>

                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    {activePillar.items.map((item, index) => (
                      <article
                        key={item.title}
                        className={`rounded-[22px] border bg-black p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] ${
                          index === 0 ? tone.border : "border-white/[0.11]"
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-[11px] border bg-black ${
                            index === 0
                              ? `${tone.border} ${tone.text} ${tone.glow}`
                              : "border-white/[0.12] text-white/62"
                          }`}
                        >
                          <FeatureIconView
                            name={item.icon}
                            className="h-3.5 w-3.5"
                          />
                        </span>
                        <h4 className="mt-4 text-[14px] font-black tracking-[-0.025em] text-white">
                          {item.title}
                        </h4>
                        <p className="mt-2 text-[11px] font-semibold leading-relaxed text-white/53">
                          {item.body}
                        </p>
                      </article>
                    ))}
                  </div>

                  <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-7">
                    <Link
                      href={activePillar.learnHref}
                      className="inline-flex h-9 items-center gap-2 rounded-[13px] border border-white bg-white px-3.5 text-[10px] font-black text-black shadow-[0_10px_24px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,1),inset_0_-4px_10px_rgba(0,0,0,0.09)] transition hover:-translate-y-px hover:border-white/25 hover:bg-black hover:text-white"
                    >
                      Explore this system
                      <FeatureIconView name="arrow" className="h-3.5 w-3.5" />
                    </Link>

                    <Link
                      href="/how-it-works"
                      className="inline-flex min-h-9 items-center gap-2 rounded-[13px] border border-white/[0.14] bg-black px-3.5 text-[10px] font-black text-white/65 transition hover:border-white/25 hover:text-white"
                    >
                      Follow the full journey
                      <FeatureIconView name="arrow" className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CapabilityIndex() {
  const [query, setQuery] = useState("");

  const visibleCapabilities = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return ALL_CAPABILITIES;
    return ALL_CAPABILITIES.filter((capability) =>
      capability.toLowerCase().includes(normalized),
    );
  }, [query]);

  return (
    <section className="relative overflow-hidden bg-white py-16 text-black sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.28em] text-black/38">
              Complete capability index
            </div>
            <h2 className="mt-4 max-w-[12ch] text-[40px] font-black leading-[0.94] tracking-[-0.068em] sm:text-[52px] md:text-[60px]">
              Find the exact protection or communication capability.
            </h2>
            <p className="mt-5 max-w-[58ch] text-[13px] font-semibold leading-relaxed text-black/56 sm:text-[14px]">
              Search the product index without opening a crowded comparison
              table. Plans control capacity and access, while the safety model
              remains consistent.
            </p>

            <label className="mt-7 block">
              <span className="text-[8px] font-black uppercase tracking-[0.16em] text-black/38">
                Search capabilities
              </span>
              <span className="mt-2 flex h-11 items-center gap-3 rounded-[15px] border border-black/[0.18] bg-white px-3 shadow-[inset_0_1px_0_rgba(255,255,255,1),0_10px_24px_rgba(0,0,0,0.05)]">
                <FeatureIconView name="grid" className="h-4 w-4 text-black/42" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Try “SOS”, “translation”, or “privacy”"
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[12px] font-semibold text-black outline-none placeholder:text-black/30"
                />
              </span>
            </label>

            <div className="mt-3 text-[9px] font-black uppercase tracking-[0.12em] text-black/32" aria-live="polite">
              {visibleCapabilities.length} capabilities shown
            </div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {visibleCapabilities.map((capability, index) => (
              <motion.div
                key={capability}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.26,
                  delay: Math.min(index, 8) * 0.025,
                }}
                className="flex min-h-12 items-center gap-3 rounded-[18px] border border-black/[0.13] bg-white px-4 shadow-[inset_0_1px_0_rgba(255,255,255,1)]"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] border border-[#0e8f70]/45 text-[#0e8f70]">
                  <FeatureIconView name="check" className="h-3.5 w-3.5" />
                </span>
                <span className="text-[10.5px] font-black text-black/70">
                  {capability}
                </span>
              </motion.div>
            ))}

            {visibleCapabilities.length === 0 ? (
              <div className="col-span-full rounded-[20px] border border-black/[0.14] bg-white p-5 text-center">
                <div className="text-[12px] font-black">
                  No exact capability matched.
                </div>
                <p className="mt-2 text-[11px] font-semibold text-black/48">
                  Try a broader word such as safety, Visit, chat, contact, or
                  SOS.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function CapacityBridge() {
  const plans = [
    {
      name: "Starter",
      line: "Core safety access",
      metrics: ["1 approved contact", "Visits", "Twice-daily I’M SAFE"],
    },
    {
      name: "Pro",
      line: "Full safety system",
      metrics: [
        "3 approved contacts",
        "6 SOS contacts",
        "3 responders",
        "1 Gallery photo",
      ],
    },
    {
      name: "Pro Max",
      line: "Complete premium access",
      metrics: [
        "6 approved contacts",
        "10 SOS contacts",
        "6 responders",
        "2 Gallery photos",
      ],
    },
  ];

  return (
    <section className="relative overflow-hidden bg-black py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[980px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.045]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-[9px] font-black uppercase tracking-[0.28em] text-white/38">
            Capacity without confusion
          </div>
          <h2 className="mt-4 text-[40px] font-black leading-[0.94] tracking-[-0.068em] text-white sm:text-[52px] md:text-[60px]">
            The plan changes capacity. The consent boundary does not.
          </h2>
          <p className="mx-auto mt-5 max-w-[67ch] text-[13px] font-semibold leading-relaxed text-white/55 sm:text-[14px]">
            Starter, Pro, and Pro Max provide different contact, SOS, responder,
            Gallery, communication, and personalization capacity. None of them
            turns StayKnown into permanent tracking.
          </p>
        </div>

        <div className="mt-9 grid gap-3 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.article
              key={plan.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.42,
                delay: index * 0.07,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`rounded-[26px] border bg-black p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.065)] ${
                plan.name === "Pro"
                  ? "border-[#18b88a]/52 shadow-[0_0_30px_rgba(24,184,138,0.11),inset_0_1px_0_rgba(255,255,255,0.065)]"
                  : "border-white/[0.12]"
              }`}
            >
              <div className="text-[8px] font-black uppercase tracking-[0.18em] text-white/32">
                {plan.line}
              </div>
              <h3 className="mt-3 text-[28px] font-black tracking-[-0.055em] text-white">
                {plan.name}
              </h3>
              <div className="mt-5 space-y-2.5">
                {plan.metrics.map((metric) => (
                  <div
                    key={metric}
                    className="flex items-center gap-3 border-t border-white/[0.09] pt-2.5 text-[10.5px] font-bold text-white/58"
                  >
                    <FeatureIconView
                      name="check"
                      className={`h-3.5 w-3.5 ${
                        plan.name === "Pro"
                          ? "text-[#18b88a]"
                          : "text-white/48"
                      }`}
                    />
                    {metric}
                  </div>
                ))}
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/plans"
            className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-white bg-white px-4 text-[10px] font-black text-black shadow-[0_12px_28px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,1),inset_0_-5px_12px_rgba(0,0,0,0.09)] transition hover:-translate-y-px hover:border-white/25 hover:bg-black hover:text-white"
          >
            Compare full plans
            <FeatureIconView name="arrow" className="h-3.5 w-3.5" />
          </Link>
          <DownloadButton />
        </div>
      </div>
    </section>
  );
}

export default function FeaturesExperience() {
  return (
    <main className="min-h-screen overflow-x-clip bg-black text-white">
      <style jsx global>{`
        #main-content {
          background: #000000;
        }

        .sk-feature-nav-link {
          position: relative;
        }

        .sk-feature-nav-link::after {
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

        .sk-feature-nav-link:hover::after,
        .sk-feature-nav-link:focus-visible::after {
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
                Product features
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-5 md:flex">
            <a
              href="#feature-atlas"
              className="sk-feature-nav-link text-[9px] font-black uppercase tracking-[0.13em] text-white/52 transition hover:text-white"
            >
              Atlas
            </a>
            <Link
              href="/how-it-works"
              className="sk-feature-nav-link text-[9px] font-black uppercase tracking-[0.13em] text-white/52 transition hover:text-white"
            >
              How it works
            </Link>
            <Link
              href="/plans"
              className="sk-feature-nav-link text-[9px] font-black uppercase tracking-[0.13em] text-white/52 transition hover:text-white"
            >
              Plans
            </Link>
          </nav>

          <DownloadButton />
        </div>
      </header>

      <section className="relative isolate overflow-hidden bg-black">
        <div className="pointer-events-none absolute left-1/2 top-[47%] h-[800px] w-[1200px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.042]" />
        <div className="pointer-events-none absolute left-1/2 top-[47%] h-[560px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.065]" />

        <div className="relative mx-auto grid min-h-[730px] max-w-6xl items-center gap-10 px-4 py-14 sm:px-5 lg:grid-cols-[1.03fr_0.97fr] lg:px-6 lg:py-20">
          <div>
            <div className="inline-flex min-h-8 items-center gap-2 rounded-full border border-[#18b88a]/46 bg-black px-3 text-[8px] font-black uppercase tracking-[0.18em] text-[#18b88a] shadow-[0_0_24px_rgba(24,184,138,0.13)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#18b88a] shadow-[0_0_12px_rgba(24,184,138,0.72)]" />
              Complete safety platform
            </div>

            <h1 className="mt-6 max-w-[11ch] text-[52px] font-black leading-[0.9] tracking-[-0.076em] sm:text-[68px] lg:text-[79px]">
              Every feature has a role inside the safety system.
            </h1>

            <p className="mt-6 max-w-[62ch] text-[14px] font-semibold leading-relaxed text-white/58 sm:text-[15px]">
              Explore StayKnown by capability pillar—from active Visits and
              urgent SOS escalation to verified identity, secure communication,
              and the reliability controls that protect location confidence.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#feature-atlas"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[14px] border border-white bg-white px-4 text-[10px] font-black text-black shadow-[0_12px_30px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,1),inset_0_-5px_12px_rgba(0,0,0,0.09)] transition hover:-translate-y-px hover:border-white/25 hover:bg-black hover:text-white"
              >
                Open feature atlas
                <FeatureIconView name="arrow" className="h-3.5 w-3.5" />
              </a>
              <Link
                href="/how-it-works"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[14px] border border-white/[0.15] bg-black px-4 text-[10px] font-black text-white/68 transition hover:border-white/28 hover:text-white"
              >
                Follow the safety journey
                <FeatureIconView name="arrow" className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-[8.5px] font-black uppercase tracking-[0.12em] text-white/34">
              <span>Safety sessions</span>
              <span>Emergency response</span>
              <span>Trusted identity</span>
              <span>Secure communication</span>
              <span>Safety integrity</span>
            </div>
          </div>

          <div className="relative mx-auto h-[520px] w-full max-w-[520px] sm:h-[610px]">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.075]" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />

            {[
              {
                src: "/hero/contact-approval.png",
                alt: "StayKnown approved contacts",
                className: "left-[1%] top-[17%] w-[34%] -rotate-[7deg] opacity-72",
              },
              {
                src: "/hero/visit-live-sos.png",
                alt: "StayKnown Visit and SOS controls",
                className: "left-1/2 top-[4%] z-10 w-[43%] -translate-x-1/2",
              },
              {
                src: "/hero/secure-chat-biometric.png",
                alt: "StayKnown secure chat",
                className: "right-[1%] top-[17%] w-[34%] rotate-[7deg] opacity-72",
              },
            ].map((screen, index) => (
              <motion.div
                key={screen.src}
                initial={{ opacity: 0, y: 22, scale: 0.96 }}
                animate={{
                  opacity: index === 1 ? 1 : 0.72,
                  y: 0,
                  scale: 1,
                }}
                transition={{
                  duration: 0.72,
                  delay: index * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`absolute ${screen.className}`}
              >
                <Image
                  src={screen.src}
                  alt={screen.alt}
                  width={400}
                  height={820}
                  priority
                  className="h-auto w-full object-contain drop-shadow-[0_34px_76px_rgba(0,0,0,0.84)]"
                />
              </motion.div>
            ))}

            <motion.div
              animate={{ scale: [0.97, 1.03, 0.97], opacity: [0.6, 1, 0.6] }}
              transition={{
                duration: 4.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-[5%] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#18b88a]/45 bg-black px-3 py-2 text-[#18b88a] shadow-[0_0_28px_rgba(24,184,138,0.16)]"
            >
              <span className="h-2 w-2 rounded-full bg-[#18b88a]" />
              <span className="text-[8px] font-black uppercase tracking-[0.15em]">
                Connected capability system
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      <PillarAtlas />
      <CapabilityIndex />
      <CapacityBridge />
    </main>
  );
}
