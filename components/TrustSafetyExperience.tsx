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
  useMemo,
  useState,
} from "react";

const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.stayknown.app";

type Accent = "neutral" | "safe" | "danger";
type TrustIcon =
  | "shield"
  | "contacts"
  | "location"
  | "visit"
  | "sos"
  | "capture"
  | "chat"
  | "lock"
  | "report"
  | "child"
  | "device"
  | "verification"
  | "block"
  | "law"
  | "billing"
  | "arrow"
  | "check"
  | "close"
  | "globe";

type TrustPillar = {
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
  icon: TrustIcon;
  accent: Accent;
  commitments: readonly string[];
  routes: readonly {
    label: string;
    href: string;
  }[];
};

type AccessState = {
  id: string;
  label: string;
  status: string;
  accent: Accent;
  icon: TrustIcon;
  location: string;
  contacts: string;
  userControl: string;
  explanation: string;
};

type ReportRoute = {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  action: string;
  icon: TrustIcon;
  accent: Accent;
};

const PILLARS: readonly TrustPillar[] = [
  {
    id: "consent",
    number: "01",
    label: "Consent",
    eyebrow: "Known people before safety access",
    title: "Approval is visible, revocable, and separate from LIVE sharing.",
    summary:
      "StayKnown is built around people with a lawful and trusted safety relationship. A contact request can be accepted, declined, restricted, removed, or blocked.",
    image: "/hero/contact-approval.png",
    imageAlt: "StayKnown approved-contact consent screen",
    secondaryImage: "/hero/verification.png",
    secondaryImageAlt: "StayKnown verified identity screen",
    icon: "contacts",
    accent: "neutral",
    commitments: [
      "Approved contacts do not automatically receive location access.",
      "Declines, removals, expirations, restrictions, and blocks must be respected.",
      "Contact approval history supports accountability and dispute review.",
      "Protective orders, no-contact rules, and lawful boundaries take priority.",
    ],
    routes: [
      { label: "Contact Consent", href: "/contact-consent" },
      { label: "Verification Policy", href: "/verification-policy" },
    ],
  },
  {
    id: "location",
    number: "02",
    label: "Location",
    eyebrow: "Purpose-bound safety sharing",
    title: "Location belongs to the active safety flow—not to silent surveillance.",
    summary:
      "Visit, LIVE, SOS, and Manual Capture provide location context for a defined safety purpose. They are not permission for hidden monitoring or stalking.",
    image: "/hero/live-map.png",
    imageAlt: "StayKnown LIVE safety map",
    secondaryImage: "/hero/manual-capture.png",
    secondaryImageAlt: "StayKnown Manual Capture screen",
    icon: "location",
    accent: "safe",
    commitments: [
      "LIVE access is tied to the supported Visit or SOS state.",
      "Manual Capture is visible and user-initiated.",
      "Location confidence, delay, device state, and VPN limits are communicated.",
      "The user can deliberately end the active safety session.",
    ],
    routes: [
      { label: "Location & Live Safety", href: "/location-safety" },
      { label: "Safety & Anti-Stalking", href: "/safety" },
    ],
  },
  {
    id: "emergency",
    number: "03",
    label: "SOS",
    eyebrow: "Urgent alerts without false promises",
    title: "SOS must be unmistakable, serious, and impossible to treat as a joke.",
    summary:
      "SOS is reserved for urgent personal escalation to selected contacts and responders. False emergencies, prank alerts, intimidation, and coercive use are prohibited.",
    image: "/hero/sos-activated.png",
    imageAlt: "StayKnown active SOS emergency state",
    secondaryImage: "/hero/end-sos-verify.png",
    secondaryImageAlt: "StayKnown verified SOS ending screen",
    icon: "sos",
    accent: "danger",
    commitments: [
      "SOS sends the strongest available safety context to configured recipients.",
      "False SOS, emergency hoaxes, prank alerts, and retaliatory alerts are prohibited.",
      "Verified ending helps prevent accidental emergency cancellation.",
      "StayKnown is not police, ambulance, fire service, or official dispatch.",
    ],
    routes: [
      { label: "Emergency Disclaimer", href: "/emergency" },
      { label: "Abuse Reporting", href: "/abuse" },
    ],
  },
  {
    id: "communication",
    number: "04",
    label: "Communication",
    eyebrow: "Trusted communication with enforceable boundaries",
    title: "Chat, stories, voice, media, and translation remain subject to safety rules.",
    summary:
      "Approved relationships do not permit harassment, threats, impersonation, scams, exploitation, unsafe media, or repeated unwanted contact.",
    image: "/hero/secure-chat-biometric.png",
    imageAlt: "StayKnown secure biometric chat screen",
    secondaryImage: "/hero/chat-translation.png",
    secondaryImageAlt: "StayKnown language-aware chat screen",
    icon: "chat",
    accent: "neutral",
    commitments: [
      "Blocked users and contact restrictions must be respected.",
      "Threats, harassment, impersonation, exploitation, and fraud are prohibited.",
      "Voice notes, media, stickers, stories, and translations follow the same safety rules.",
      "Sensitive chat surfaces use supported device-level privacy protection.",
    ],
    routes: [
      { label: "Acceptable Use", href: "/acceptable-use" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
  {
    id: "integrity",
    number: "05",
    label: "Integrity",
    eyebrow: "Reliable safety data and accountable access",
    title: "Security, device integrity, privacy, and enforcement protect the safety signal.",
    summary:
      "VPN gates, backend checks, rate limits, plan enforcement, device protections, reporting, and responsible disclosure help reduce manipulation and abuse.",
    image: "/hero/vpn-safety-gate.png",
    imageAlt: "StayKnown VPN reliability gate",
    secondaryImage: "/hero/safety-gallery.png",
    secondaryImageAlt: "StayKnown Safety Gallery screen",
    icon: "device",
    accent: "safe",
    commitments: [
      "VPN and device-integrity checks can protect location confidence.",
      "Bypassing contact approval, plan gates, device checks, or safety restrictions is prohibited.",
      "Sensitive records are used for service operation, protection, review, and lawful compliance.",
      "Security concerns should be submitted through the responsible disclosure route.",
    ],
    routes: [
      { label: "Security Disclosure", href: "/security" },
      { label: "Data Retention", href: "/retention" },
    ],
  },
  {
    id: "minors",
    number: "06",
    label: "Minors",
    eyebrow: "Age-aware access and guardian accountability",
    title: "Young users require stronger consent, identity, and guardian safeguards.",
    summary:
      "Users under 13 are blocked. Ages 13–17 require the supported guardian-consent process, with approval and safety expectations that do not remove the minor’s dignity or lawful rights.",
    image: "/hero/stories-profile.png",
    imageAlt: "StayKnown profile and identity screen",
    secondaryImage: "/hero/contact-approval.png",
    secondaryImageAlt: "StayKnown contact approval screen",
    icon: "child",
    accent: "neutral",
    commitments: [
      "Users under 13 are not eligible for normal StayKnown account access.",
      "Users aged 13–17 require the supported guardian-consent flow.",
      "Guardian access must follow the same anti-stalking and lawful-use boundaries.",
      "Unsafe contact, exploitation, grooming, luring, or coercion must be reported.",
    ],
    routes: [
      { label: "Child Safety & Minor Use", href: "/minors" },
      { label: "Guardian Consent", href: "/guardian-consent" },
    ],
  },
] as const;

const ACCESS_STATES: readonly AccessState[] = [
  {
    id: "unapproved",
    label: "Not approved",
    status: "No trusted relationship",
    accent: "neutral",
    icon: "block",
    location: "No StayKnown safety-location access",
    contacts: "No approved-contact relationship",
    userControl: "Request can be ignored, declined, or blocked",
    explanation:
      "A person cannot convert an unanswered or declined contact request into location access.",
  },
  {
    id: "approved",
    label: "Approved contact",
    status: "Relationship ready",
    accent: "safe",
    icon: "contacts",
    location: "No LIVE access by approval alone",
    contacts: "Visible trusted relationship",
    userControl: "User can restrict, remove, or block",
    explanation:
      "Approval prepares the relationship for supported safety flows but does not start location sharing.",
  },
  {
    id: "visit",
    label: "Visit active",
    status: "Selected safety access",
    accent: "safe",
    icon: "visit",
    location: "Permitted active-session context",
    contacts: "Only selected recipients",
    userControl: "User started the Visit and can end it deliberately",
    explanation:
      "The active Visit gives selected trusted people the safety context needed for that session.",
  },
  {
    id: "sos",
    label: "SOS active",
    status: "Urgent escalation",
    accent: "danger",
    icon: "sos",
    location: "Strongest available emergency context",
    contacts: "Configured SOS contacts and responders",
    userControl: "Emergency state uses visible activation and verified stopping",
    explanation:
      "SOS increases urgency and context, but StayKnown still does not become official emergency dispatch.",
  },
  {
    id: "ended",
    label: "Session ended",
    status: "LIVE access closed",
    accent: "neutral",
    icon: "lock",
    location: "No continuing active-session access",
    contacts: "Completion state may remain in history",
    userControl: "User deliberately closed the session",
    explanation:
      "Ending the Visit or SOS closes its LIVE access. Approval does not preserve permanent monitoring.",
  },
] as const;

const REPORT_ROUTES: readonly ReportRoute[] = [
  {
    id: "danger",
    label: "Immediate danger",
    eyebrow: "Urgent real-world response",
    title: "Contact the correct local emergency service first.",
    body:
      "StayKnown can support trusted-contact awareness but is not police, ambulance, fire service, rescue, hospital, or official dispatch.",
    href: "/emergency",
    action: "Read emergency limits",
    icon: "sos",
    accent: "danger",
  },
  {
    id: "abuse",
    label: "Stalking or abuse",
    eyebrow: "Platform misuse",
    title: "Report unwanted monitoring, threats, false SOS, impersonation, or harassment.",
    body:
      "Use the abuse-reporting route for stalking, repeated unwanted contact, coercive control, fake emergencies, unsafe content, or account misuse.",
    href: "/abuse",
    action: "Report abuse",
    icon: "report",
    accent: "danger",
  },
  {
    id: "security",
    label: "Security issue",
    eyebrow: "Responsible disclosure",
    title: "Report a vulnerability without exploiting users or data.",
    body:
      "Use the security route for technical vulnerabilities, account-security concerns, or responsible disclosure.",
    href: "/security",
    action: "Open security disclosure",
    icon: "lock",
    accent: "safe",
  },
  {
    id: "support",
    label: "Account or feature help",
    eyebrow: "User support",
    title: "Get help with access, Visits, SOS, contacts, plans, or settings.",
    body:
      "The Help Center and request route handle normal support, troubleshooting, onboarding, and account questions.",
    href: "/help-center",
    action: "Open Help Center",
    icon: "chat",
    accent: "neutral",
  },
  {
    id: "billing",
    label: "Payment issue",
    eyebrow: "Subscription support",
    title: "Review billing, refunds, payment verification, and plan-access rules.",
    body:
      "Use the billing policy for subscription conditions, payment verification, renewals, refunds, and plan-access boundaries.",
    href: "/billing-policy",
    action: "Review billing policy",
    icon: "billing",
    accent: "neutral",
  },
] as const;

const PROHIBITED_MISUSE = [
  "Stalking, hidden tracking, covert surveillance, or unauthorized location monitoring",
  "Threats, harassment, intimidation, coercive control, grooming, luring, or exploitation",
  "False SOS, prank alerts, fake Visits, emergency hoaxes, or retaliatory safety reports",
  "Impersonating users, guardians, responders, officials, organizations, or StayKnown staff",
  "Ignoring declines, removals, blocked-add settings, no-contact rules, or protective orders",
  "Bypassing VPN checks, device checks, contact approval, plan gates, or safety restrictions",
  "Abusive chat, unsafe media, fraud, payment abuse, scams, or deceptive account activity",
  "Using StayKnown to violate school, workplace, family-court, or lawful safety boundaries",
] as const;

const POLICY_LINKS = [
  { label: "Privacy Policy", href: "/privacy", icon: "lock" as TrustIcon },
  { label: "Terms of Service", href: "/terms", icon: "law" as TrustIcon },
  {
    label: "Location & Live Safety",
    href: "/location-safety",
    icon: "location" as TrustIcon,
  },
  {
    label: "Contact Consent",
    href: "/contact-consent",
    icon: "contacts" as TrustIcon,
  },
  {
    label: "Acceptable Use",
    href: "/acceptable-use",
    icon: "check" as TrustIcon,
  },
  {
    label: "Safety & Anti-Stalking",
    href: "/safety",
    icon: "shield" as TrustIcon,
  },
  {
    label: "Emergency Disclaimer",
    href: "/emergency",
    icon: "sos" as TrustIcon,
  },
  {
    label: "Child Safety & Minor Use",
    href: "/minors",
    icon: "child" as TrustIcon,
  },
  {
    label: "Guardian Consent",
    href: "/guardian-consent",
    icon: "contacts" as TrustIcon,
  },
  {
    label: "Abuse Reporting",
    href: "/abuse",
    icon: "report" as TrustIcon,
  },
  {
    label: "Data Retention",
    href: "/retention",
    icon: "device" as TrustIcon,
  },
  {
    label: "Law Enforcement Requests",
    href: "/law",
    icon: "law" as TrustIcon,
  },
  {
    label: "Security Disclosure",
    href: "/security",
    icon: "lock" as TrustIcon,
  },
  {
    label: "Billing & Refunds",
    href: "/billing-policy",
    icon: "billing" as TrustIcon,
  },
] as const;

function accentStyles(accent: Accent) {
  if (accent === "safe") {
    return {
      text: "text-[#18b88a]",
      border: "border-[#18b88a]/58",
      dot: "bg-[#18b88a]",
      shadow: "shadow-[0_0_28px_rgba(24,184,138,0.22)]",
    };
  }

  if (accent === "danger") {
    return {
      text: "text-[#f04c55]",
      border: "border-[#f04c55]/64",
      dot: "bg-[#f04c55]",
      shadow: "shadow-[0_0_30px_rgba(240,76,85,0.25)]",
    };
  }

  return {
    text: "text-white",
    border: "border-white/55",
    dot: "bg-white",
    shadow: "shadow-[0_0_24px_rgba(255,255,255,0.16)]",
  };
}

function TrustIconView({
  name,
  className = "h-4 w-4",
}: {
  name: TrustIcon;
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
    case "shield":
    case "verification":
      return (
        <svg {...common}>
          <path d="M12 3 4.5 6v5.5c0 4.7 3.1 7.7 7.5 9.5 4.4-1.8 7.5-4.8 7.5-9.5V6z" />
          {name === "verification" ? (
            <path d="m8.5 12 2.2 2.2 4.8-5" />
          ) : null}
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
    case "location":
      return (
        <svg {...common}>
          <path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z" />
          <circle cx="12" cy="10" r="2.3" />
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
    case "sos":
      return (
        <svg {...common}>
          <path d="M12 3 2.8 19h18.4z" />
          <path d="M12 9v4M12 16.5h.01" />
        </svg>
      );
    case "capture":
      return (
        <svg {...common}>
          <path d="M4 8h3l1.5-2h7L17 8h3v10H4z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      );
    case "chat":
      return (
        <svg {...common}>
          <path d="M4 5h16v11H9l-5 4z" />
          <path d="M8 9h8M8 12h6" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="10" width="14" height="10" rx="3" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" />
        </svg>
      );
    case "report":
      return (
        <svg {...common}>
          <path d="M6 4h9l3 3v13H6z" />
          <path d="M15 4v4h4M9 11h6M9 14h6M9 17h3" />
        </svg>
      );
    case "child":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M6 21a6 6 0 0 1 12 0M4 10l-2-2M20 10l2-2" />
        </svg>
      );
    case "device":
      return (
        <svg {...common}>
          <rect x="7" y="2.8" width="10" height="18.4" rx="2.2" />
          <path d="M10 5h4M11 18.2h2" />
        </svg>
      );
    case "block":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="m6 6 12 12" />
        </svg>
      );
    case "law":
      return (
        <svg {...common}>
          <path d="M12 3v18M6 6h12M7 6l-3 6h6zM17 6l-3 6h6zM8 21h8" />
        </svg>
      );
    case "billing":
      return (
        <svg {...common}>
          <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
          <path d="M3.5 10h17M7 15h3" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      );
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
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

function TrustShieldHero() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto h-[500px] w-full max-w-[520px] sm:h-[610px]">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.075]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />

      <motion.div
        animate={
          reduceMotion
            ? undefined
            : { rotate: 360 }
        }
        transition={{
          duration: 38,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/[0.11]"
      >
        {[
          { icon: "contacts" as TrustIcon, className: "left-1/2 top-[-18px] -translate-x-1/2" },
          { icon: "location" as TrustIcon, className: "right-[-18px] top-1/2 -translate-y-1/2" },
          { icon: "lock" as TrustIcon, className: "bottom-[-18px] left-1/2 -translate-x-1/2" },
          { icon: "sos" as TrustIcon, className: "left-[-18px] top-1/2 -translate-y-1/2" },
        ].map((item) => (
          <span
            key={item.icon}
            className={`absolute flex h-10 w-10 items-center justify-center rounded-[13px] border border-white/[0.15] bg-black text-white/70 shadow-[0_12px_28px_rgba(0,0,0,0.52),inset_0_1px_0_rgba(255,255,255,0.08)] ${item.className}`}
          >
            <TrustIconView name={item.icon} className="h-4 w-4" />
          </span>
        ))}
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.88, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: reduceMotion ? 0 : 0.8,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="absolute left-1/2 top-1/2 z-10 flex h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[52px] border border-white bg-white text-black shadow-[0_36px_90px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,1),inset_0_-12px_28px_rgba(0,0,0,0.10)]"
      >
        <span className="pointer-events-none absolute inset-x-8 top-1 h-px bg-white" />
        <TrustIconView name="shield" className="h-[92px] w-[92px]" />
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.5, delay: 0.3 }}
        className="absolute bottom-[6%] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#18b88a]/48 bg-black px-3 py-2 text-[#18b88a] shadow-[0_0_28px_rgba(24,184,138,0.17)]"
      >
        <span className="h-2 w-2 rounded-full bg-[#18b88a] shadow-[0_0_12px_rgba(24,184,138,0.68)]" />
        <span className="text-[8px] font-black uppercase tracking-[0.15em]">
          Consent · context · accountability
        </span>
      </motion.div>
    </div>
  );
}

function TrustPillarLab() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activePillar = PILLARS[activeIndex];
  const accent = accentStyles(activePillar.accent);
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

  return (
    <section id="trust-architecture" className="relative overflow-hidden bg-black py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute left-1/2 top-[48%] h-[760px] w-[1140px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-[9px] font-black uppercase tracking-[0.28em] text-white/38">
            Trust architecture
          </div>
          <h2 className="mt-4 text-[40px] font-black leading-[0.94] tracking-[-0.068em] text-white sm:text-[52px] md:text-[62px]">
            Safety features are governed by visible rules and boundaries.
          </h2>
          <p className="mx-auto mt-5 max-w-[69ch] text-[13px] font-semibold leading-relaxed text-white/56 sm:text-[14px]">
            Select a trust pillar to inspect how StayKnown separates consent,
            location access, emergency escalation, communication, integrity, and
            minor safety.
          </p>
        </div>

        <div className="mt-9 flex gap-2 overflow-x-auto pb-2 sk-scroll-hidden">
          {PILLARS.map((pillar, index) => {
            const selected = index === activeIndex;
            const itemAccent = accentStyles(pillar.accent);

            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-current={selected ? "page" : undefined}
                className={`inline-flex min-h-10 shrink-0 items-center gap-2.5 rounded-[14px] border px-3 text-[9px] font-black transition ${
                  selected
                    ? "border-white bg-white text-black shadow-[inset_0_1px_0_rgba(255,255,255,1)]"
                    : "border-white/[0.11] bg-black text-white/48 hover:border-white/24 hover:text-white"
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-[8px] border ${
                    selected
                      ? "border-black/[0.09] text-black"
                      : `${itemAccent.border} ${itemAccent.text}`
                  }`}
                >
                  <TrustIconView name={pillar.icon} className="h-3.5 w-3.5" />
                </span>
                {pillar.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 overflow-hidden rounded-[34px] border border-white/[0.13] bg-black shadow-[0_38px_118px_rgba(0,0,0,0.74),inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="grid lg:grid-cols-[0.94fr_1.06fr]">
            <div
              onPointerMove={move}
              onPointerLeave={reset}
              className="relative min-h-[560px] overflow-hidden border-b border-white/[0.09] p-5 sm:p-7 lg:min-h-[740px] lg:border-b-0 lg:border-r"
            >
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.075]" />
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activePillar.id}
                  initial={
                    reduceMotion
                      ? false
                      : { opacity: 0, y: 18, scale: 0.97 }
                  }
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.985 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.46,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{
                    rotateX: reduceMotion ? 0 : rotateX,
                    rotateY: reduceMotion ? 0 : rotateY,
                    transformPerspective: 1200,
                  }}
                  className="relative mx-auto h-[500px] w-full max-w-[470px] sm:h-[610px]"
                >
                  <div className="absolute right-[4%] top-[17%] w-[42%] rotate-[6deg] opacity-78">
                    <Image
                      src={activePillar.secondaryImage}
                      alt={activePillar.secondaryImageAlt}
                      width={400}
                      height={820}
                      quality={88}
                      className="h-auto w-full object-contain drop-shadow-[0_30px_68px_rgba(0,0,0,0.84)]"
                    />
                  </div>

                  <div className="absolute left-[8%] top-[5%] z-10 w-[49%]">
                    <Image
                      src={activePillar.image}
                      alt={activePillar.imageAlt}
                      width={430}
                      height={880}
                      priority={activeIndex === 0}
                      quality={90}
                      className="h-auto w-full object-contain drop-shadow-[0_38px_82px_rgba(0,0,0,0.9)]"
                    />
                  </div>

                  <div
                    className={`absolute bottom-[6%] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border bg-black px-3 py-2 ${accent.border} ${accent.text} ${accent.shadow}`}
                  >
                    <span className={`h-2 w-2 rounded-full ${accent.dot}`} />
                    <span className="whitespace-nowrap text-[8px] font-black uppercase tracking-[0.15em]">
                      {activePillar.label} boundary
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="relative min-h-[650px] p-5 sm:p-7 lg:min-h-[740px] lg:p-9">
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
                  <div className={`text-[9px] font-black uppercase tracking-[0.23em] ${accent.text}`}>
                    {activePillar.eyebrow}
                  </div>
                  <h3 className="mt-4 max-w-[14ch] text-[36px] font-black leading-[0.95] tracking-[-0.065em] text-white sm:text-[45px] lg:text-[50px]">
                    {activePillar.title}
                  </h3>
                  <p className="mt-5 max-w-[62ch] text-[13px] font-semibold leading-relaxed text-white/57 sm:text-[14px]">
                    {activePillar.summary}
                  </p>

                  <div className="mt-7 grid gap-3">
                    {activePillar.commitments.map((commitment, index) => (
                      <div
                        key={commitment}
                        className={`flex items-start gap-3 rounded-[19px] border bg-black p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] ${
                          index === 0 ? accent.border : "border-white/[0.11]"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] border bg-black ${
                            index === 0
                              ? `${accent.border} ${accent.text}`
                              : "border-white/[0.12] text-white/55"
                          }`}
                        >
                          <TrustIconView name="check" className="h-3.5 w-3.5" />
                        </span>
                        <span className="text-[11.5px] font-semibold leading-relaxed text-white/63 sm:text-[12.5px]">
                          {commitment}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto flex flex-wrap gap-2.5 pt-7">
                    {activePillar.routes.map((route, index) => (
                      <Link
                        key={route.href}
                        href={route.href}
                        className={`inline-flex h-9 items-center gap-2 rounded-[13px] px-3.5 text-[10px] font-black transition ${
                          index === 0
                            ? "border border-white bg-white text-black shadow-[0_10px_24px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,1),inset_0_-4px_10px_rgba(0,0,0,0.09)] hover:-translate-y-px hover:border-white/25 hover:bg-black hover:text-white"
                            : "border border-white/[0.14] bg-black text-white/65 hover:border-white/25 hover:text-white"
                        }`}
                      >
                        {route.label}
                        <TrustIconView name="arrow" className="h-3.5 w-3.5" />
                      </Link>
                    ))}
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

function AccessBoundaryLab() {
  const [activeId, setActiveId] = useState("approved");
  const activeState =
    ACCESS_STATES.find((state) => state.id === activeId) ?? ACCESS_STATES[1];
  const accent = accentStyles(activeState.accent);

  return (
    <section className="relative overflow-hidden bg-white py-16 text-black sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
        <div className="grid gap-9 lg:grid-cols-[0.84fr_1.16fr] lg:items-center">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.28em] text-black/36">
              Access boundary lab
            </div>
            <h2 className="mt-4 max-w-[12ch] text-[40px] font-black leading-[0.94] tracking-[-0.068em] sm:text-[52px] md:text-[60px]">
              See how access changes with the safety state.
            </h2>
            <p className="mt-5 max-w-[58ch] text-[13px] font-semibold leading-relaxed text-black/56 sm:text-[14px]">
              Approval, an active Visit, SOS escalation, and a completed session
              are different states. Select one to see what location and contact
              access actually means.
            </p>

            <div className="mt-7 grid gap-2">
              {ACCESS_STATES.map((state) => {
                const selected = state.id === activeId;
                const itemAccent = accentStyles(state.accent);

                return (
                  <button
                    key={state.id}
                    type="button"
                    onClick={() => setActiveId(state.id)}
                    className={`flex min-h-12 items-center gap-3 rounded-[17px] border px-3 text-left transition ${
                      selected
                        ? "border-black bg-black text-white shadow-[0_14px_32px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.12)]"
                        : "border-black/[0.14] bg-white text-black/58 hover:border-black hover:text-black"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] border ${
                        selected
                          ? `${itemAccent.border} ${itemAccent.text} bg-black`
                          : "border-black/[0.14] bg-white text-black/48"
                      }`}
                    >
                      <TrustIconView name={state.icon} className="h-3.5 w-3.5" />
                    </span>
                    <span>
                      <span className="block text-[10px] font-black">
                        {state.label}
                      </span>
                      <span
                        className={`mt-1 block text-[8px] font-black uppercase tracking-[0.12em] ${
                          selected ? itemAccent.text : "text-black/32"
                        }`}
                      >
                        {state.status}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.article
              key={activeState.id}
              initial={{ opacity: 0, x: 18, scale: 0.985 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.99 }}
              transition={{
                duration: 0.38,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative overflow-hidden rounded-[30px] border border-black/[0.16] bg-white p-5 shadow-[0_28px_76px_rgba(0,0,0,0.11),inset_0_1px_0_rgba(255,255,255,1)] sm:p-7"
            >
              <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-white" />

              <div className="flex items-start justify-between gap-3">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-[14px] border bg-white ${
                    activeState.accent === "safe"
                      ? "border-[#0e8f70]/48 text-[#0e8f70] shadow-[0_0_24px_rgba(14,143,112,0.14)]"
                      : activeState.accent === "danger"
                        ? "border-[#d7353d]/55 text-[#d7353d] shadow-[0_0_26px_rgba(215,53,61,0.16)]"
                        : "border-black/[0.17] text-black"
                  }`}
                >
                  <TrustIconView name={activeState.icon} className="h-5 w-5" />
                </span>
                <span className="text-[8px] font-black uppercase tracking-[0.16em] text-black/30">
                  Active boundary
                </span>
              </div>

              <h3 className="mt-6 text-[31px] font-black tracking-[-0.06em]">
                {activeState.label}
              </h3>
              <div
                className={`mt-2 text-[9px] font-black uppercase tracking-[0.15em] ${
                  activeState.accent === "safe"
                    ? "text-[#0e8f70]"
                    : activeState.accent === "danger"
                      ? "text-[#d7353d]"
                      : "text-black/43"
                }`}
              >
                {activeState.status}
              </div>

              <p className="mt-5 text-[12.5px] font-semibold leading-relaxed text-black/58">
                {activeState.explanation}
              </p>

              <div className="mt-6 grid gap-3">
                {[
                  ["Location", activeState.location, "location" as TrustIcon],
                  ["Contacts", activeState.contacts, "contacts" as TrustIcon],
                  ["User control", activeState.userControl, "shield" as TrustIcon],
                ].map(([label, value, icon]) => (
                  <div
                    key={label}
                    className="flex items-start gap-3 rounded-[18px] border border-black/[0.13] bg-white p-3.5"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] border border-black/[0.13] bg-white text-black/52">
                      <TrustIconView
                        name={icon as TrustIcon}
                        className="h-3.5 w-3.5"
                      />
                    </span>
                    <div>
                      <div className="text-[8px] font-black uppercase tracking-[0.13em] text-black/30">
                        {label}
                      </div>
                      <div className="mt-1.5 text-[11px] font-black leading-relaxed text-black/66">
                        {value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function MisuseSection() {
  return (
    <section className="relative overflow-hidden bg-black py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute left-1/2 top-[48%] h-[650px] w-[1040px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#f04c55]/[0.08]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
        <div className="grid gap-9 lg:grid-cols-[0.76fr_1.24fr] lg:items-start">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.28em] text-[#f04c55]">
              Prohibited misuse
            </div>
            <h2 className="mt-4 max-w-[12ch] text-[40px] font-black leading-[0.94] tracking-[-0.068em] text-white sm:text-[52px] md:text-[60px]">
              Safety tools cannot become control tools.
            </h2>
            <p className="mt-5 max-w-[58ch] text-[13px] font-semibold leading-relaxed text-white/56 sm:text-[14px]">
              StayKnown prohibits misuse that turns consent, location, emergency
              alerts, communication, identity, or payment systems into harm.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              <Link
                href="/acceptable-use"
                className="inline-flex h-9 items-center gap-2 rounded-[13px] border border-white bg-white px-3.5 text-[10px] font-black text-black shadow-[0_10px_24px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,1),inset_0_-4px_10px_rgba(0,0,0,0.09)] transition hover:-translate-y-px hover:border-white/25 hover:bg-black hover:text-white"
              >
                Read Acceptable Use
                <TrustIconView name="arrow" className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/abuse"
                className="inline-flex h-9 items-center gap-2 rounded-[13px] border border-[#f04c55]/58 bg-black px-3.5 text-[10px] font-black text-[#f04c55] transition hover:border-[#f04c55] hover:text-white"
              >
                Report abuse
                <TrustIconView name="arrow" className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {PROHIBITED_MISUSE.map((item, index) => (
              <motion.article
                key={item}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.045,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex items-start gap-3 rounded-[21px] border border-[#f04c55]/32 bg-black p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] border border-[#f04c55]/52 bg-black text-[#f04c55]">
                  <TrustIconView name="close" className="h-3.5 w-3.5" />
                </span>
                <span className="text-[11px] font-semibold leading-relaxed text-white/61 sm:text-[11.5px]">
                  {item}
                </span>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ReportingNavigator() {
  const [activeId, setActiveId] = useState("abuse");
  const activeRoute =
    REPORT_ROUTES.find((route) => route.id === activeId) ?? REPORT_ROUTES[1];
  const accent = accentStyles(activeRoute.accent);

  return (
    <section className="relative overflow-hidden bg-white py-16 text-black sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-[9px] font-black uppercase tracking-[0.28em] text-black/36">
            Reporting and response
          </div>
          <h2 className="mt-4 text-[40px] font-black leading-[0.94] tracking-[-0.068em] sm:text-[52px] md:text-[60px]">
            Choose the route that matches what happened.
          </h2>
          <p className="mx-auto mt-5 max-w-[66ch] text-[13px] font-semibold leading-relaxed text-black/56 sm:text-[14px]">
            Immediate danger, platform abuse, security vulnerabilities, account
            support, and billing issues require different response pathways.
          </p>
        </div>

        <div className="mt-9 grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="grid gap-2">
            {REPORT_ROUTES.map((route) => {
              const selected = route.id === activeId;
              const itemAccent = accentStyles(route.accent);

              return (
                <button
                  key={route.id}
                  type="button"
                  onClick={() => setActiveId(route.id)}
                  className={`flex min-h-14 items-center gap-3 rounded-[18px] border px-3 text-left transition ${
                    selected
                      ? "border-black bg-black text-white shadow-[0_14px_34px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.12)]"
                      : "border-black/[0.14] bg-white text-black/58 hover:border-black hover:text-black"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border ${
                      selected
                        ? `${itemAccent.border} ${itemAccent.text} bg-black`
                        : "border-black/[0.14] bg-white text-black/48"
                    }`}
                  >
                    <TrustIconView name={route.icon} className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-[10.5px] font-black">
                      {route.label}
                    </span>
                    <span
                      className={`mt-1 block text-[8px] font-black uppercase tracking-[0.12em] ${
                        selected ? itemAccent.text : "text-black/30"
                      }`}
                    >
                      {route.eyebrow}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.article
              key={activeRoute.id}
              initial={{ opacity: 0, x: 18, scale: 0.988 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{
                duration: 0.36,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative flex min-h-[390px] flex-col overflow-hidden rounded-[30px] border border-black/[0.16] bg-white p-5 shadow-[0_28px_76px_rgba(0,0,0,0.11),inset_0_1px_0_rgba(255,255,255,1)] sm:p-7"
            >
              <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-white" />
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-[14px] border bg-white ${
                  activeRoute.accent === "safe"
                    ? "border-[#0e8f70]/48 text-[#0e8f70] shadow-[0_0_24px_rgba(14,143,112,0.14)]"
                    : activeRoute.accent === "danger"
                      ? "border-[#d7353d]/55 text-[#d7353d] shadow-[0_0_26px_rgba(215,53,61,0.16)]"
                      : "border-black/[0.17] text-black"
                }`}
              >
                <TrustIconView name={activeRoute.icon} className="h-5 w-5" />
              </span>

              <div className="mt-6 text-[8.5px] font-black uppercase tracking-[0.16em] text-black/30">
                {activeRoute.eyebrow}
              </div>
              <h3 className="mt-3 max-w-[16ch] text-[31px] font-black leading-[0.98] tracking-[-0.06em]">
                {activeRoute.title}
              </h3>
              <p className="mt-5 max-w-[60ch] text-[12.5px] font-semibold leading-relaxed text-black/58">
                {activeRoute.body}
              </p>

              <div className="mt-auto pt-8">
                <Link
                  href={activeRoute.href}
                  className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-black bg-black px-4 text-[10px] font-black text-white shadow-[0_12px_28px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.12)] transition hover:-translate-y-px hover:bg-white hover:text-black"
                >
                  {activeRoute.action}
                  <TrustIconView name="arrow" className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function PolicyLibrary() {
  return (
    <section className="relative overflow-hidden bg-black py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
        <div className="grid gap-9 lg:grid-cols-[0.74fr_1.26fr] lg:items-start">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.28em] text-white/36">
              Public policy library
            </div>
            <h2 className="mt-4 max-w-[12ch] text-[40px] font-black leading-[0.94] tracking-[-0.068em] text-white sm:text-[52px] md:text-[60px]">
              Trust rules should remain easy to find.
            </h2>
            <p className="mt-5 max-w-[58ch] text-[13px] font-semibold leading-relaxed text-white/55 sm:text-[14px]">
              StayKnown keeps privacy, location, consent, anti-stalking,
              emergency, minor-safety, reporting, retention, legal, security,
              and billing information publicly accessible.
            </p>

            <div className="mt-7 rounded-[20px] border border-[#f04c55]/42 bg-black p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-[11px] border border-[#f04c55]/55 text-[#f04c55]">
                  <TrustIconView name="sos" className="h-3.5 w-3.5" />
                </span>
                <div>
                  <div className="text-[10px] font-black text-white">
                    Immediate danger
                  </div>
                  <p className="mt-1 text-[9.5px] font-semibold leading-relaxed text-white/43">
                    Contact the appropriate local emergency service or authority
                    first. StayKnown does not provide official dispatch.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {POLICY_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex min-h-14 items-center justify-between gap-3 rounded-[18px] border border-white/[0.12] bg-black px-4 text-white/58 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] transition hover:border-white/26 hover:text-white"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] border border-white/[0.13] text-white/54 transition group-hover:border-white/30 group-hover:text-white">
                    <TrustIconView name={item.icon} className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[10.5px] font-black">{item.label}</span>
                </span>
                <TrustIconView
                  name="arrow"
                  className="h-3.5 w-3.5 shrink-0 text-white/28 transition group-hover:translate-x-0.5 group-hover:text-white"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function TrustSafetyExperience() {
  return (
    <main className="min-h-screen overflow-x-clip bg-black text-white">
      <style jsx global>{`
        #main-content {
          background: #000000;
        }

        .sk-trust-nav-link {
          position: relative;
        }

        .sk-trust-nav-link::after {
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

        .sk-trust-nav-link:hover::after,
        .sk-trust-nav-link:focus-visible::after {
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
                Trust &amp; Safety
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-5 md:flex">
            <a
              href="#trust-architecture"
              className="sk-trust-nav-link text-[9px] font-black uppercase tracking-[0.13em] text-white/52 transition hover:text-white"
            >
              Architecture
            </a>
            <Link
              href="/safety"
              className="sk-trust-nav-link text-[9px] font-black uppercase tracking-[0.13em] text-white/52 transition hover:text-white"
            >
              Anti-stalking
            </Link>
            <Link
              href="/abuse"
              className="sk-trust-nav-link text-[9px] font-black uppercase tracking-[0.13em] text-white/52 transition hover:text-white"
            >
              Report
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
            <div className="inline-flex min-h-8 items-center gap-2 rounded-full border border-[#18b88a]/46 bg-black px-3 text-[8px] font-black uppercase tracking-[0.18em] text-[#18b88a] shadow-[0_0_24px_rgba(24,184,138,0.13)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#18b88a] shadow-[0_0_12px_rgba(24,184,138,0.72)]" />
              Consent-first protection
            </div>

            <h1 className="mt-6 max-w-[11ch] text-[52px] font-black leading-[0.9] tracking-[-0.076em] sm:text-[68px] lg:text-[79px]">
              Trust is a system of boundaries—not a marketing claim.
            </h1>

            <p className="mt-6 max-w-[64ch] text-[14px] font-semibold leading-relaxed text-white/58 sm:text-[15px]">
              StayKnown separates contact approval, active location access,
              urgent SOS escalation, communication, device integrity, minor
              protection, reporting, and verified completion so safety tools do
              not become control tools.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#trust-architecture"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[14px] border border-white bg-white px-4 text-[10px] font-black text-black shadow-[0_12px_30px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,1),inset_0_-5px_12px_rgba(0,0,0,0.09)] transition hover:-translate-y-px hover:border-white/25 hover:bg-black hover:text-white"
              >
                Explore trust architecture
                <TrustIconView name="arrow" className="h-3.5 w-3.5" />
              </a>
              <Link
                href="/abuse"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[14px] border border-[#f04c55]/58 bg-black px-4 text-[10px] font-black text-[#f04c55] transition hover:border-[#f04c55] hover:text-white"
              >
                Report misuse
                <TrustIconView name="arrow" className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-[8.5px] font-black uppercase tracking-[0.12em] text-white/34">
              <span>Consent</span>
              <span>Anti-stalking</span>
              <span>Emergency limits</span>
              <span>Minor safety</span>
              <span>Security disclosure</span>
            </div>
          </div>

          <TrustShieldHero />
        </div>
      </section>

      <TrustPillarLab />
      <AccessBoundaryLab />
      <MisuseSection />
      <ReportingNavigator />
      <PolicyLibrary />

      <section className="relative overflow-hidden bg-white py-16 text-black sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-5 lg:px-6">
          <div className="text-[9px] font-black uppercase tracking-[0.28em] text-black/36">
            Important emergency limitation
          </div>
          <h2 className="mx-auto mt-4 max-w-[14ch] text-[42px] font-black leading-[0.94] tracking-[-0.07em] sm:text-[54px] md:text-[62px]">
            StayKnown supports awareness. It is not official dispatch.
          </h2>
          <p className="mx-auto mt-5 max-w-[69ch] text-[13px] font-semibold leading-relaxed text-black/57 sm:text-[14px]">
            StayKnown is not police, ambulance, fire service, rescue service,
            hospital, road safety, civil defence, disaster management,
            government authority, or universal professional emergency response.
            Contact the correct local emergency service when immediate danger
            exists.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/emergency"
              className="inline-flex h-10 w-full max-w-[220px] items-center justify-center gap-2 rounded-[14px] border border-black bg-black px-4 text-[10px] font-black text-white shadow-[0_12px_28px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.12)] transition hover:-translate-y-px hover:bg-white hover:text-black sm:w-auto"
            >
              Emergency Disclaimer
              <TrustIconView name="arrow" className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/help-center"
              className="inline-flex h-10 w-full max-w-[220px] items-center justify-center gap-2 rounded-[14px] border border-black/[0.17] bg-white px-4 text-[10px] font-black text-black transition hover:-translate-y-px hover:border-black hover:bg-black hover:text-white sm:w-auto"
            >
              Open Help Center
              <TrustIconView name="arrow" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
