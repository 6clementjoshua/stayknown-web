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
import type { BillingRegionSnapshot } from "@/lib/stayknown-billing-types";

const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.stayknown.app";

type BillingPeriod = "monthly" | "yearly";
type PlanId = "starter" | "pro" | "proMax";
type ComparisonCategory =
  | "capacity"
  | "safety"
  | "communication"
  | "personalization";

type PlanIcon =
  | "starter"
  | "pro"
  | "proMax"
  | "contacts"
  | "sos"
  | "responders"
  | "visit"
  | "live"
  | "safe"
  | "gallery"
  | "chat"
  | "translate"
  | "stories"
  | "fonts"
  | "restrict"
  | "check"
  | "minus"
  | "arrow"
  | "shield"
  | "globe"
  | "calendar"
  | "lock"
  | "refresh";

type PricePoint = {
  monthly: number;
  yearly: number;
  currency: "NGN" | "USD";
  provider: "Paystack" | "Flutterwave";
};

type PlanDefinition = {
  id: PlanId;
  name: string;
  eyebrow: string;
  summary: string;
  recommendation: string;
  icon: PlanIcon;
  featured: boolean;
  capacities: readonly string[];
  features: readonly string[];
};

type ComparisonRow = {
  label: string;
  icon: PlanIcon;
  values: Record<PlanId, string>;
};

const PRICES: Record<
  Exclude<PlanId, "starter">,
  Record<"nigeria" | "global", PricePoint>
> = {
  pro: {
    nigeria: {
      monthly: 9999,
      yearly: 99999,
      currency: "NGN",
      provider: "Paystack",
    },
    global: {
      monthly: 14.99,
      yearly: 149.99,
      currency: "USD",
      provider: "Flutterwave",
    },
  },
  proMax: {
    nigeria: {
      monthly: 14999,
      yearly: 149999,
      currency: "NGN",
      provider: "Paystack",
    },
    global: {
      monthly: 24.99,
      yearly: 249.99,
      currency: "USD",
      provider: "Flutterwave",
    },
  },
};

const PLANS: readonly PlanDefinition[] = [
  {
    id: "starter",
    name: "Starter",
    eyebrow: "Core safety access",
    summary:
      "Begin with the essential StayKnown safety model, one approved contact, active Visits, and twice-daily I’M SAFE check-ins.",
    recommendation: "For learning and practising the core safety flow.",
    icon: "starter",
    featured: false,
    capacities: [
      "1 approved contact",
      "Core Visit access",
      "Twice-daily I’M SAFE",
    ],
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
    id: "pro",
    name: "Pro",
    eyebrow: "Full safety system",
    summary:
      "Unlock LIVE Visit protection, the complete SOS system, expanded trusted-contact capacity, communication, and richer safety context.",
    recommendation: "Recommended for everyday personal safety coverage.",
    icon: "pro",
    featured: true,
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
    id: "proMax",
    name: "Pro Max",
    eyebrow: "Complete premium access",
    summary:
      "Use StayKnown at its highest safety, communication, destination, and personalization capacity.",
    recommendation: "For users who need the largest trusted safety circle.",
    icon: "proMax",
    featured: false,
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
] as const;

const COMPARISON: Record<ComparisonCategory, readonly ComparisonRow[]> = {
  capacity: [
    {
      label: "Approved contacts",
      icon: "contacts",
      values: { starter: "1", pro: "3", proMax: "6" },
    },
    {
      label: "SOS contacts",
      icon: "sos",
      values: { starter: "Not included", pro: "6", proMax: "10" },
    },
    {
      label: "SOS responders",
      icon: "responders",
      values: { starter: "Not included", pro: "3", proMax: "6" },
    },
    {
      label: "Safety Gallery",
      icon: "gallery",
      values: {
        starter: "Not included",
        pro: "1 photo",
        proMax: "Up to 2 photos",
      },
    },
  ],
  safety: [
    {
      label: "Start and end Visits",
      icon: "visit",
      values: { starter: "Included", pro: "Included", proMax: "Included" },
    },
    {
      label: "Twice-daily I’M SAFE",
      icon: "safe",
      values: { starter: "Included", pro: "Included", proMax: "Included" },
    },
    {
      label: "LIVE Visit sharing",
      icon: "live",
      values: {
        starter: "Not included",
        pro: "Included",
        proMax: "Included",
      },
    },
    {
      label: "Full SOS system",
      icon: "sos",
      values: {
        starter: "Basic flows",
        pro: "Included",
        proMax: "Priority system",
      },
    },
    {
      label: "Destination guidance",
      icon: "shield",
      values: {
        starter: "Core",
        pro: "Rich context",
        proMax: "Full intelligence",
      },
    },
  ],
  communication: [
    {
      label: "Chat",
      icon: "chat",
      values: {
        starter: "Not included",
        pro: "Included",
        proMax: "Advanced",
      },
    },
    {
      label: "Translation",
      icon: "translate",
      values: {
        starter: "Not included",
        pro: "Basic",
        proMax: "Full support",
      },
    },
    {
      label: "Stories",
      icon: "stories",
      values: {
        starter: "Not included",
        pro: "Posting",
        proMax: "Full creation",
      },
    },
  ],
  personalization: [
    {
      label: "Font collection",
      icon: "fonts",
      values: {
        starter: "Default",
        pro: "Pro collection",
        proMax: "Full designer library",
      },
    },
    {
      label: "Chat personalization",
      icon: "chat",
      values: {
        starter: "Not included",
        pro: "Core",
        proMax: "Advanced",
      },
    },
    {
      label: "Contact controls",
      icon: "restrict",
      values: {
        starter: "Basic",
        pro: "Restrict",
        proMax: "Advanced restrict and block",
      },
    },
  ],
};

function PlanIconView({
  name,
  className = "h-4 w-4",
}: {
  name: PlanIcon;
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
    case "starter":
      return (
        <svg {...common}>
          <path d="M12 3 4.5 6v5.5c0 4.7 3.1 7.7 7.5 9.5 4.4-1.8 7.5-4.8 7.5-9.5V6z" />
        </svg>
      );
    case "pro":
      return (
        <svg {...common}>
          <path d="M5 18 8 7l4 6 4-6 3 11z" />
          <path d="M7 21h10" />
        </svg>
      );
    case "proMax":
      return (
        <svg {...common}>
          <path d="m12 3 2.1 4.3L19 8l-3.5 3.4.8 4.8L12 14l-4.3 2.2.8-4.8L5 8l4.9-.7z" />
          <path d="M5 21h14" />
        </svg>
      );
    case "contacts":
    case "responders":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 20v-1.5A4.5 4.5 0 0 1 8 14h2a4.5 4.5 0 0 1 4.5 4.5V20" />
          <path d="M16 7.5a2.5 2.5 0 1 1 0 5M17.5 15a4 4 0 0 1 3 3.9V20" />
        </svg>
      );
    case "sos":
      return (
        <svg {...common}>
          <path d="M12 3 2.8 19h18.4z" />
          <path d="M12 9v4M12 16.5h.01" />
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
    case "safe":
      return (
        <svg {...common}>
          <path d="M12 3 4.5 6v5.5c0 4.7 3.1 7.7 7.5 9.5 4.4-1.8 7.5-4.8 7.5-9.5V6z" />
          <path d="m8.5 12 2.2 2.2 4.8-5" />
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
    case "stories":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      );
    case "fonts":
      return (
        <svg {...common}>
          <path d="M5 5h14M12 5v14M8 19h8" />
        </svg>
      );
    case "restrict":
    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="10" width="14" height="10" rx="3" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 4.5 6v5.5c0 4.7 3.1 7.7 7.5 9.5 4.4-1.8 7.5-4.8 7.5-9.5V6z" />
        </svg>
      );
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M8 3v4M16 3v4M4 10h16" />
        </svg>
      );
    case "refresh":
      return (
        <svg {...common}>
          <path d="M20 7v5h-5" />
          <path d="M4 17v-5h5" />
          <path d="M6.1 8A7 7 0 0 1 18 7l2 5M4 12l2 5a7 7 0 0 0 11.9-1" />
        </svg>
      );
    case "minus":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
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
      <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-white" />
      <span className="flex h-7 w-7 items-center justify-center rounded-[9px] border border-black/[0.07] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,1),0_5px_12px_rgba(0,0,0,0.10)]">
        <GooglePlayMark />
      </span>
      <span className="text-[10px] font-black">Get StayKnown</span>
    </a>
  );
}

function countryFlag(countryCode: string): string {
  const code = countryCode.trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(code) || code === "ZZ") return "🌐";

  return String.fromCodePoint(
    ...[...code].map((character) => character.codePointAt(0)! + 127397),
  );
}

function formatPrice(
  amount: number,
  currency: "NGN" | "USD",
): string {
  return new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "NGN" ? 0 : 2,
    maximumFractionDigits: currency === "NGN" ? 0 : 2,
  }).format(amount);
}

function PlanCard({
  plan,
  period,
  region,
}: {
  plan: PlanDefinition;
  period: BillingPeriod;
  region: BillingRegionSnapshot;
}) {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-3.5, 3.5]), {
    stiffness: 160,
    damping: 22,
  });
  const rotateX = useSpring(useTransform(pointerY, [0, 1], [3, -3]), {
    stiffness: 160,
    damping: 22,
  });

  const handleMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width);
    pointerY.set((event.clientY - rect.top) / rect.height);
  };

  const reset = () => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  };

  const price =
    plan.id === "starter" ? null : PRICES[plan.id][region.region];
  const amount = price ? price[period] : 0;
  const monthlyEquivalent =
    price && period === "yearly" ? price.yearly / 12 : null;
  const savings =
    price && period === "yearly"
      ? price.monthly * 12 - price.yearly
      : null;

  const isPro = plan.id === "pro";
  const isProMax = plan.id === "proMax";

  return (
    <motion.article
      onPointerMove={handleMove}
      onPointerLeave={reset}
      style={{
        rotateX: reduceMotion ? 0 : rotateX,
        rotateY: reduceMotion ? 0 : rotateY,
        transformPerspective: 1200,
      }}
      className={`relative overflow-hidden rounded-[30px] border p-5 shadow-[0_30px_82px_rgba(0,0,0,0.56),inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-6 ${
        isPro
          ? "border-[#18b88a]/62 bg-black shadow-[0_0_38px_rgba(24,184,138,0.13),0_30px_82px_rgba(0,0,0,0.56),inset_0_1px_0_rgba(255,255,255,0.08)]"
          : "border-white/[0.13] bg-black"
      }`}
    >
      <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-white/[0.2]" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-[13px] border bg-black ${
              isPro
                ? "border-[#18b88a]/58 text-[#18b88a] shadow-[0_0_24px_rgba(24,184,138,0.18)]"
                : isProMax
                  ? "border-white/48 text-white shadow-[0_0_20px_rgba(255,255,255,0.14)]"
                  : "border-white/[0.16] text-white/62"
            }`}
          >
            <PlanIconView name={plan.icon} className="h-[17px] w-[17px]" />
          </span>

          {plan.featured ? (
            <span className="inline-flex min-h-7 items-center rounded-full border border-[#18b88a]/48 bg-black px-2.5 text-[8px] font-black uppercase tracking-[0.14em] text-[#18b88a]">
              Recommended
            </span>
          ) : null}
        </div>

        <div className="mt-5 text-[8px] font-black uppercase tracking-[0.18em] text-white/34">
          {plan.eyebrow}
        </div>
        <h3 className="mt-2 text-[31px] font-black tracking-[-0.062em] text-white">
          {plan.name}
        </h3>

        <div className="mt-5 min-h-[76px]">
          {plan.id === "starter" ? (
            <>
              <div className="text-[25px] font-black tracking-[-0.045em] text-white">
                Free
              </div>
              <div className="mt-2 text-[9.5px] font-bold text-white/38">
                No paid subscription required
              </div>
            </>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${plan.id}-${period}-${region.currencyCode}`}
                initial={{ opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.24 }}
              >
                <div className="text-[25px] font-black tracking-[-0.048em] text-white">
                  {formatPrice(amount, price!.currency)}
                </div>
                <div className="mt-2 text-[9.5px] font-bold text-white/38">
                  {period === "monthly" ? "per month" : "per year"} ·{" "}
                  {price!.provider}
                </div>
                {period === "yearly" &&
                monthlyEquivalent !== null &&
                savings !== null ? (
                  <div className="mt-2 text-[9px] font-black text-[#18b88a]">
                    {formatPrice(monthlyEquivalent, price!.currency)} monthly
                    equivalent · Save {formatPrice(savings, price!.currency)}
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <p className="mt-4 text-[11.5px] font-semibold leading-relaxed text-white/54">
          {plan.summary}
        </p>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {plan.capacities.map((capacity) => (
            <span
              key={capacity}
              className={`inline-flex min-h-7 items-center rounded-full border bg-black px-2.5 text-[8.5px] font-black ${
                isPro
                  ? "border-[#18b88a]/35 text-white/68"
                  : "border-white/[0.11] text-white/55"
              }`}
            >
              {capacity}
            </span>
          ))}
        </div>

        <div className="my-5 h-px bg-white/[0.09]" />

        <ul className="space-y-2.5">
          {plan.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2.5 text-[10.5px] font-semibold leading-relaxed text-white/59"
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border bg-black ${
                  isPro
                    ? "border-[#18b88a]/42 text-[#18b88a]"
                    : "border-white/[0.13] text-white/48"
                }`}
              >
                <PlanIconView name="check" className="h-3 w-3" />
              </span>
              {feature}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-7">
          <div className="mb-3 text-[9px] font-semibold leading-relaxed text-white/34">
            {plan.recommendation}
          </div>
          <DownloadButton className="w-full" />
        </div>
      </div>
    </motion.article>
  );
}

function BillingRouteBar({
  region,
  refreshing,
  onRefresh,
}: {
  region: BillingRegionSnapshot;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-3 rounded-[22px] border border-white/[0.12] bg-black px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_16px_40px_rgba(0,0,0,0.42)] sm:flex-row">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-[#18b88a]/48 bg-black text-[#18b88a] shadow-[0_0_24px_rgba(24,184,138,0.15)]">
          <PlanIconView name="globe" className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <div className="text-[8px] font-black uppercase tracking-[0.18em] text-white/32">
            IP-resolved billing route
          </div>
          <div className="mt-1 truncate text-[11px] font-black text-white/78">
            CURRENCY ·{" "}
            {region.countryCode === "ZZ"
              ? "GLOBAL"
              : region.countryCode}{" "}
            {countryFlag(region.countryCode)} · {region.currencyCode}
          </div>
          <div className="mt-1 text-[9px] font-semibold text-white/38">
            {region.countryName} · Secure checkout through {region.provider}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="inline-flex h-9 shrink-0 items-center gap-2 rounded-[13px] border border-white/[0.14] bg-black px-3 text-[8.5px] font-black uppercase tracking-[0.12em] text-white/58 transition hover:border-white/26 hover:text-white disabled:cursor-wait disabled:opacity-45"
      >
        <PlanIconView
          name="refresh"
          className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
        />
        {refreshing ? "Checking IP" : "Recheck location"}
      </button>
    </div>
  );
}

function ComparisonSection() {
  const [category, setCategory] =
    useState<ComparisonCategory>("capacity");

  const labels: readonly {
    id: ComparisonCategory;
    label: string;
  }[] = [
    { id: "capacity", label: "Capacity" },
    { id: "safety", label: "Safety" },
    { id: "communication", label: "Communication" },
    { id: "personalization", label: "Personalization" },
  ];

  return (
    <section className="relative overflow-hidden bg-white py-16 text-black sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-[9px] font-black uppercase tracking-[0.28em] text-black/36">
            Clear capability comparison
          </div>
          <h2 className="mt-4 text-[40px] font-black leading-[0.94] tracking-[-0.068em] sm:text-[52px] md:text-[60px]">
            Compare one decision category at a time.
          </h2>
          <p className="mx-auto mt-5 max-w-[66ch] text-[13px] font-semibold leading-relaxed text-black/56 sm:text-[14px]">
            StayKnown avoids a crowded wall of checkmarks. Select the capacity,
            safety, communication, or personalization category that matters to
            you.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {labels.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              className={`inline-flex h-9 items-center rounded-[13px] border px-3 text-[9px] font-black uppercase tracking-[0.12em] transition ${
                category === item.id
                  ? "border-black bg-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                  : "border-black/[0.15] bg-white text-black/48 hover:border-black hover:text-black"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mx-auto mt-6 max-w-5xl overflow-hidden rounded-[26px] border border-black/[0.14] bg-white shadow-[0_24px_62px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1)]">
          <div className="grid grid-cols-[1.25fr_repeat(3,0.75fr)] border-b border-black/[0.11] px-3 py-3 sm:px-5">
            <div className="text-[8px] font-black uppercase tracking-[0.15em] text-black/34">
              Capability
            </div>
            {["Starter", "Pro", "Pro Max"].map((name) => (
              <div
                key={name}
                className="text-center text-[8px] font-black uppercase tracking-[0.12em] text-black/48"
              >
                {name}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 7 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.26 }}
            >
              {COMPARISON[category].map((row, index) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-[1.25fr_repeat(3,0.75fr)] items-center px-3 py-4 sm:px-5 ${
                    index !== COMPARISON[category].length - 1
                      ? "border-b border-black/[0.09]"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5 pr-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] border border-black/[0.13] bg-white text-black/56">
                      <PlanIconView name={row.icon} className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-[9.5px] font-black text-black/66 sm:text-[10.5px]">
                      {row.label}
                    </span>
                  </div>

                  {(["starter", "pro", "proMax"] as const).map((planId) => {
                    const value = row.values[planId];
                    const unavailable = value === "Not included";

                    return (
                      <div
                        key={planId}
                        className={`px-1 text-center text-[8.5px] font-black leading-snug sm:text-[9.5px] ${
                          planId === "pro"
                            ? "text-[#0e8f70]"
                            : unavailable
                              ? "text-black/28"
                              : "text-black/58"
                        }`}
                      >
                        {value}
                      </div>
                    );
                  })}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default function PlansExperience({
  initialRegion,
}: {
  initialRegion: BillingRegionSnapshot;
}) {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const [region, setRegion] =
    useState<BillingRegionSnapshot>(initialRegion);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState("");

  const bestSavings = useMemo(() => {
    const pro = PRICES.pro[region.region];
    const proMax = PRICES.proMax[region.region];

    return Math.max(
      pro.monthly * 12 - pro.yearly,
      proMax.monthly * 12 - proMax.yearly,
    );
  }, [region.region]);

  const refreshRegion = async () => {
    if (refreshing) return;

    setRefreshing(true);
    setRefreshMessage("");

    try {
      const response = await fetch("/api/billing-region", {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Billing region request failed.");
      }

      const payload = (await response.json()) as BillingRegionSnapshot;
      setRegion(payload);
      setRefreshMessage(
        payload.resolved
          ? `Pricing refreshed for ${payload.countryName}.`
          : "The network country could not be confirmed, so global USD pricing remains active.",
      );
    } catch {
      setRefreshMessage(
        "The IP billing route could not be refreshed. The current pricing remains unchanged.",
      );
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <main className="min-h-screen overflow-x-clip bg-black text-white">
      <style jsx global>{`
        #main-content {
          background: #000000;
        }

        .sk-plan-nav-link {
          position: relative;
        }

        .sk-plan-nav-link::after {
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

        .sk-plan-nav-link:hover::after,
        .sk-plan-nav-link:focus-visible::after {
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
                Plans and pricing
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-5 md:flex">
            <a
              href="#choose-plan"
              className="sk-plan-nav-link text-[9px] font-black uppercase tracking-[0.13em] text-white/52 transition hover:text-white"
            >
              Choose
            </a>
            <Link
              href="/features"
              className="sk-plan-nav-link text-[9px] font-black uppercase tracking-[0.13em] text-white/52 transition hover:text-white"
            >
              Features
            </Link>
            <Link
              href="/how-it-works"
              className="sk-plan-nav-link text-[9px] font-black uppercase tracking-[0.13em] text-white/52 transition hover:text-white"
            >
              How it works
            </Link>
          </nav>

          <DownloadButton />
        </div>
      </header>

      <section className="relative isolate overflow-hidden bg-black">
        <div className="pointer-events-none absolute left-1/2 top-[45%] h-[820px] w-[1220px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />
        <div className="pointer-events-none absolute left-1/2 top-[45%] h-[570px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.065]" />

        <div className="relative mx-auto grid min-h-[700px] max-w-6xl items-center gap-10 px-4 py-14 sm:px-5 lg:grid-cols-[1.05fr_0.95fr] lg:px-6 lg:py-20">
          <div>
            <div className="inline-flex min-h-8 items-center gap-2 rounded-full border border-[#18b88a]/46 bg-black px-3 text-[8px] font-black uppercase tracking-[0.18em] text-[#18b88a] shadow-[0_0_24px_rgba(24,184,138,0.13)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#18b88a] shadow-[0_0_12px_rgba(24,184,138,0.72)]" />
              IP-resolved pricing
            </div>

            <h1 className="mt-6 max-w-[11ch] text-[52px] font-black leading-[0.9] tracking-[-0.076em] sm:text-[68px] lg:text-[79px]">
              Choose the safety capacity that fits your trusted circle.
            </h1>

            <p className="mt-6 max-w-[63ch] text-[14px] font-semibold leading-relaxed text-white/58 sm:text-[15px]">
              StayKnown resolves the visitor’s billing country from the network
              IP. Nigeria uses NGN through Paystack; all other supported
              countries use the global USD route through Flutterwave.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#choose-plan"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[14px] border border-white bg-white px-4 text-[10px] font-black text-black shadow-[0_12px_30px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,1),inset_0_-5px_12px_rgba(0,0,0,0.09)] transition hover:-translate-y-px hover:border-white/25 hover:bg-black hover:text-white"
              >
                Compare plans
                <PlanIconView name="arrow" className="h-3.5 w-3.5" />
              </a>
              <Link
                href="/features"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[14px] border border-white/[0.15] bg-black px-4 text-[10px] font-black text-white/68 transition hover:border-white/28 hover:text-white"
              >
                Explore all features
                <PlanIconView name="arrow" className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto h-[500px] w-full max-w-[510px] sm:h-[600px]">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.075]" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[470px] w-[470px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />

            {[
              {
                src: "/hero/contact-approval.png",
                alt: "StayKnown approved contacts screen",
                className:
                  "left-[2%] top-[18%] w-[34%] -rotate-[7deg] opacity-72",
              },
              {
                src: "/hero/promax-shell.png",
                alt: "StayKnown Pro Max application shell",
                className:
                  "left-1/2 top-[4%] z-10 w-[44%] -translate-x-1/2",
              },
              {
                src: "/hero/sos-activated.png",
                alt: "StayKnown SOS screen",
                className:
                  "right-[2%] top-[18%] w-[34%] rotate-[7deg] opacity-72",
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
                Capacity without permanent tracking
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      <section
        id="choose-plan"
        className="relative overflow-hidden bg-black py-16 sm:py-20 lg:py-24"
      >
        <div className="pointer-events-none absolute left-1/2 top-[48%] h-[760px] w-[1140px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <div className="text-[9px] font-black uppercase tracking-[0.28em] text-white/38">
              Plans and pricing
            </div>
            <h2 className="mt-4 text-[40px] font-black leading-[0.94] tracking-[-0.068em] text-white sm:text-[52px] md:text-[62px]">
              Final prices appear before you choose a plan.
            </h2>
            <p className="mx-auto mt-5 max-w-[68ch] text-[13px] font-semibold leading-relaxed text-white/56 sm:text-[14px]">
              The website resolves pricing from IP location. StayKnown performs
              the authoritative billing check again inside the app before
              opening the secure payment provider.
            </p>
          </div>

          <div className="mt-8">
            <BillingRouteBar
              region={region}
              refreshing={refreshing}
              onRefresh={refreshRegion}
            />

            {refreshMessage ? (
              <p
                className="mx-auto mt-3 max-w-3xl text-center text-[9.5px] font-semibold text-white/42"
                aria-live="polite"
              >
                {refreshMessage}
              </p>
            ) : null}
          </div>

          <div className="mx-auto mt-6 flex max-w-[330px] rounded-[17px] border border-white/[0.13] bg-black p-1">
            {(["monthly", "yearly"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setPeriod(value)}
                className={`relative flex h-9 flex-1 items-center justify-center rounded-[13px] text-[9px] font-black uppercase tracking-[0.12em] transition ${
                  period === value
                    ? "bg-white text-black shadow-[inset_0_1px_0_rgba(255,255,255,1)]"
                    : "text-white/42 hover:text-white"
                }`}
              >
                {value === "monthly" ? "Monthly" : "Yearly"}
              </button>
            ))}
          </div>

          {period === "yearly" ? (
            <div className="mt-3 text-center text-[9px] font-black text-[#18b88a]">
              Save up to {formatPrice(
                bestSavings,
                region.currencyCode,
              )} per year
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                period={period}
                region={region}
              />
            ))}
          </div>

          <div className="mx-auto mt-6 max-w-4xl rounded-[20px] border border-white/[0.11] bg-black px-4 py-3 text-center">
            <p className="text-[9.5px] font-semibold leading-relaxed text-white/39">
              IP geolocation is approximate. VPN or proxy use can change the
              detected country. The StayKnown app re-resolves the billing route
              before checkout and freezes the exact country, currency, provider,
              period, and amount for that payment session.
            </p>
          </div>
        </div>
      </section>

      <ComparisonSection />

      <section className="relative overflow-hidden bg-black py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-5 lg:px-6">
          <div className="text-[9px] font-black uppercase tracking-[0.28em] text-white/36">
            Secure checkout boundary
          </div>
          <h2 className="mx-auto mt-4 max-w-[14ch] text-[42px] font-black leading-[0.94] tracking-[-0.07em] text-white sm:text-[54px] md:text-[62px]">
            Review here. Subscribe inside StayKnown.
          </h2>
          <p className="mx-auto mt-5 max-w-[67ch] text-[13px] font-semibold leading-relaxed text-white/54 sm:text-[14px]">
            The website explains capacity and pricing. The installed app confirms
            your real billing country, currency, provider, billing period, and
            exact amount before opening checkout.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <DownloadButton className="w-full max-w-[210px] sm:w-auto" />
            <Link
              href="/how-it-works"
              className="inline-flex h-10 w-full max-w-[210px] items-center justify-center gap-2 rounded-[14px] border border-white/[0.15] bg-black px-4 text-[10px] font-black text-white/66 transition hover:border-white/28 hover:text-white sm:w-auto"
            >
              Understand the flow
              <PlanIconView name="arrow" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
