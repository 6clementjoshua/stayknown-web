"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const UPDATED_AT = "2026-04-30";
const VERSION = "1.0";

type ThemeMode = "dark" | "light";

function fmtDate(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function useThemeMode() {
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? window.localStorage.getItem("stayknown-policy-theme")
        : null;

    if (saved === "light" || saved === "dark") {
      setTheme(saved);
      return;
    }

    const prefersLight =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: light)").matches;

    setTheme(prefersLight ? "light" : "dark");
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.skTheme = theme;
    window.localStorage.setItem("stayknown-policy-theme", theme);
  }, [theme]);

  return { theme, setTheme };
}

function useSeoMeta() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    document.title =
      "StayKnown Location & Live Safety Policy | Live Map, SOS, Approved Contacts & Chat Location";

    const upsertMeta = (name: string, content: string) => {
      let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    const upsertProperty = (property: string, content: string) => {
      let tag = document.querySelector<HTMLMetaElement>(
        `meta[property="${property}"]`,
      );
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    upsertMeta(
      "description",
      "Read the StayKnown Location & Live Safety Policy covering live location sharing, Visit sessions, SOS alerts, manual capture, approved contacts, chat maps, VPN safety gates, Nigeria, U.S., U.K./EU, and global emergency-use limits.",
    );
    upsertMeta(
      "keywords",
      "StayKnown location policy, live safety sharing, safety app Nigeria, SOS location sharing, approved contacts, live map policy, chat location map, emergency contact app, anti-stalking location sharing, VPN safety gate, safety app privacy, 911, 112, 999, Nigeria emergency safety",
    );
    upsertMeta("robots", "index, follow");
    upsertMeta("author", "6 Clement Joshua");
    upsertProperty(
      "og:title",
      "StayKnown Location & Live Safety Policy | Approved Contact Location Sharing",
    );
    upsertProperty(
      "og:description",
      "How StayKnown handles live location, Visit sessions, SOS alerts, manual capture, chat maps, approved contacts, location accuracy, VPN restrictions, and emergency-service limits.",
    );
    upsertProperty("og:type", "website");
    upsertProperty("og:site_name", "StayKnown");
  }, []);
}

function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 3.2 19 6v5.5c0 4.45-2.85 8.45-7 9.8-4.15-1.35-7-5.35-7-9.8V6l7-2.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="m8.8 12.1 2.15 2.15 4.55-5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LocationIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 21s6.2-5.55 6.2-11.1A6.2 6.2 0 1 0 5.8 9.9C5.8 15.45 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12 12.25a2.35 2.35 0 1 0 0-4.7 2.35 2.35 0 0 0 0 4.7Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function MapIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="m4.8 6.2 4.6-1.8 5.2 1.8 4.6-1.8v13.4l-4.6 1.8-5.2-1.8-4.6 1.8V6.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9.4 4.4v13.4M14.6 6.2v13.4"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function ContactIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M8.6 11.2a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M3.8 19.2c.55-3.1 2.3-4.9 4.8-4.9s4.25 1.8 4.8 4.9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M16.4 6.2c1.7.35 2.8 1.65 2.8 3.35s-1.1 3-2.8 3.35"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M15.1 15.1c2.6.35 4.25 1.85 5.1 4.1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AlertIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 3.8 21 19.2H3L12 3.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12 9v4.6M12 16.8h.01"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M7.5 10.4V8.25A4.5 4.5 0 0 1 12 3.75a4.5 4.5 0 0 1 4.5 4.5v2.15"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M6.6 10.4h10.8c1.1 0 2 .9 2 2v5.85c0 1.1-.9 2-2 2H6.6c-1.1 0-2-.9-2-2V12.4c0-1.1.9-2 2-2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12 14.25v2.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GlobeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M3.8 12h16.4M12 3.5c2.15 2.25 3.25 5.05 3.25 8.5S14.15 18.25 12 20.5C9.85 18.25 8.75 15.45 8.75 12S9.85 5.75 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function H2({
  children,
  id,
  icon,
}: {
  children: React.ReactNode;
  id?: string;
  icon?: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="scroll-mt-24 text-[18px] md:text-[20px] font-black tracking-[-0.025em] text-zinc-950 dark:text-white/94"
    >
      <span className="inline-flex items-center gap-2.5">
        {icon ? (
          <span className="grid h-8 w-8 place-items-center rounded-2xl border border-black/10 bg-black/[0.04] text-zinc-900 shadow-sm dark:border-white/10 dark:bg-white/[0.05] dark:text-white/85">
            {icon}
          </span>
        ) : null}
        <span>{children}</span>
      </span>
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 text-[14px] font-extrabold text-zinc-900 dark:text-white/88">
      {children}
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[13.5px] md:text-[14px] font-semibold leading-relaxed text-zinc-700 dark:text-white/62">
      {children}
    </p>
  );
}

function UL({ items }: { items: string[] }) {
  return (
    <ul className="ml-5 list-disc space-y-1.5 text-[13.5px] md:text-[14px] font-semibold leading-relaxed text-zinc-700 dark:text-white/62">
      {items.map((t, i) => (
        <li key={`${t}-${i}`}>{t}</li>
      ))}
    </ul>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-black/10 bg-black/[0.035] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-zinc-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/55">
      {children}
    </span>
  );
}

function Callout({
  title,
  body,
  tone = "normal",
  icon,
}: {
  title: string;
  body: string;
  tone?: "normal" | "danger" | "safe" | "law" | "map";
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={cx(
        "group relative overflow-hidden rounded-[1.35rem] border p-4 shadow-sm transition duration-300 hover:-translate-y-0.5",
        tone === "danger" &&
          "border-red-500/20 bg-red-500/[0.06] dark:border-red-400/20 dark:bg-red-400/[0.07]",
        tone === "safe" &&
          "border-emerald-600/20 bg-emerald-600/[0.06] dark:border-emerald-300/20 dark:bg-emerald-300/[0.07]",
        tone === "law" &&
          "border-sky-700/20 bg-sky-700/[0.055] dark:border-sky-300/20 dark:bg-sky-300/[0.07]",
        tone === "map" &&
          "border-violet-600/20 bg-violet-500/[0.07] dark:border-violet-300/20 dark:bg-violet-300/[0.07]",
        tone === "normal" &&
          "border-black/10 bg-white/70 dark:border-white/10 dark:bg-white/[0.035]",
      )}
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-black/[0.04] blur-2xl dark:bg-white/[0.06]" />
      <div className="relative flex gap-3">
        {icon ? (
          <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-2xl border border-black/10 bg-white/70 text-zinc-900 dark:border-white/10 dark:bg-black/30 dark:text-white/80">
            {icon}
          </div>
        ) : null}
        <div>
          <div className="text-[13px] font-black text-zinc-950 dark:text-white/90">
            {title}
          </div>
          <div className="mt-2 text-[13px] font-semibold leading-relaxed text-zinc-700 dark:text-white/62">
            {body}
          </div>
        </div>
      </div>
    </div>
  );
}

function Example({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[1.35rem] border border-black/10 bg-black/[0.025] p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="text-[12.5px] font-black text-zinc-900 dark:text-white/86">
        {title}
      </div>
      <div className="mt-2">
        <UL items={items} />
      </div>
    </div>
  );
}

function LinkCard({
  href,
  title,
  body,
}: {
  href: string;
  title: string;
  body: string;
}) {
  return (
    <a
      href={href}
      className="group rounded-[1.35rem] border border-black/10 bg-white/70 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/[0.035] dark:hover:bg-white/[0.06]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[13px] font-black text-zinc-950 dark:text-white/90">
            {title}
          </div>
          <p className="mt-1.5 text-[12.5px] font-semibold leading-relaxed text-zinc-600 dark:text-white/50">
            {body}
          </p>
        </div>
        <span className="text-zinc-400 transition group-hover:translate-x-0.5 group-hover:text-zinc-900 dark:text-white/30 dark:group-hover:text-white/75">
          →
        </span>
      </div>
    </a>
  );
}

function FloatingBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.12),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(16,185,129,0.10),transparent_25%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.10),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(16,185,129,0.08),transparent_25%)]" />
      <div className="absolute left-[7%] top-[18%] h-48 w-48 animate-[floatSlow_9s_ease-in-out_infinite] rounded-full bg-sky-400/10 blur-3xl" />
      <div className="absolute right-[8%] top-[32%] h-56 w-56 animate-[floatSlow_11s_ease-in-out_infinite_reverse] rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="absolute bottom-[8%] left-[30%] h-60 w-60 animate-[floatSlow_13s_ease-in-out_infinite] rounded-full bg-white/8 blur-3xl" />
    </div>
  );
}

function MapIllustration() {
  return (
    <div className="relative mx-auto h-[280px] w-[190px] md:h-[320px] md:w-[220px]">
      <div className="absolute inset-0 animate-[softPulse_4s_ease-in-out_infinite] rounded-[2.2rem] bg-sky-400/15 blur-2xl" />
      <div className="relative h-full w-full rounded-[2rem] border border-black/15 bg-white/75 p-3 shadow-2xl backdrop-blur dark:border-white/15 dark:bg-white/[0.055]">
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-black/20 dark:bg-white/20" />
        <div className="rounded-[1.5rem] border border-black/10 bg-gradient-to-b from-white to-zinc-100 p-4 dark:border-white/10 dark:from-white/[0.10] dark:to-white/[0.03]">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-black text-white dark:bg-white dark:text-black">
              <LocationIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-black tracking-[0.18em] text-zinc-500 dark:text-white/35">
                LIVE SAFETY
              </div>
              <div className="text-[13px] font-black text-zinc-950 dark:text-white">
                Approved Map
              </div>
            </div>
          </div>

          <div className="relative mt-5 h-36 overflow-hidden rounded-[1.35rem] border border-black/10 bg-[linear-gradient(135deg,rgba(14,165,233,0.15),rgba(16,185,129,0.15)),linear-gradient(90deg,rgba(0,0,0,0.08)_1px,transparent_1px),linear-gradient(rgba(0,0,0,0.08)_1px,transparent_1px)] bg-[length:auto,22px_22px,22px_22px] dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(14,165,233,0.14),rgba(16,185,129,0.12)),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)]">
            <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 animate-[softPulse_2.6s_ease-in-out_infinite] rounded-full border border-sky-500/25 bg-sky-500/10" />
            <div className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-zinc-950 text-white shadow-xl dark:bg-white dark:text-black">
              <ShieldIcon className="h-5 w-5" />
            </div>
            <div className="absolute bottom-3 left-3 right-3 rounded-2xl border border-black/10 bg-white/85 p-2 backdrop-blur dark:border-white/10 dark:bg-black/50">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500 dark:text-white/35">
                Context visible
              </div>
              <div className="mt-0.5 text-[11.5px] font-black text-zinc-950 dark:text-white/90">
                Approved contact only
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {["Visit active", "SOS ready", "VPN gate", "Chat map"].map(
              (label, index) => (
                <div
                  key={label}
                  className="animate-[riseIn_0.7s_ease_both] rounded-2xl border border-black/10 bg-white/80 px-3 py-2 text-[10.5px] font-black text-zinc-700 dark:border-white/10 dark:bg-black/20 dark:text-white/55"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {label}
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LocationSafetyPage() {
  const { theme, setTheme } = useThemeMode();
  useSeoMeta();

  const nav = useMemo(
    () =>
      [
        ["summary", "Summary"],
        ["purpose", "Purpose"],
        ["how", "How it works"],
        ["approved", "Approved contacts"],
        ["visit", "Visit & LIVE"],
        ["sos", "SOS & manual capture"],
        ["chat", "Chat map"],
        ["accuracy", "Accuracy limits"],
        ["vpn", "VPN safety gate"],
        ["global", "Nigeria & global use"],
        ["misuse", "Misuse rules"],
        ["retention", "Retention"],
        ["contact", "Contact"],
      ] as const,
    [],
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "StayKnown Location & Live Safety Policy",
    dateModified: UPDATED_AT,
    version: VERSION,
    publisher: {
      "@type": "Organization",
      name: "StayKnown",
      brand: "A 6 Clement Joshua service™",
      url: "https://stay-known.com",
    },
    description:
      "Location and live safety policy for StayKnown covering Visit sessions, SOS alerts, manual capture, chat maps, approved contacts, Nigeria, global usage, VPN restrictions, and emergency-service limits.",
  };

  return (
    <main className="min-h-screen overflow-hidden bg-zinc-50 text-zinc-950 transition-colors duration-500 dark:bg-black dark:text-white">
      <FloatingBackdrop />

      <style jsx global>{`
        @keyframes floatSlow {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(0, -18px, 0) scale(1.04);
          }
        }

        @keyframes softPulse {
          0%,
          100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.04);
          }
        }

        @keyframes riseIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.001ms !important;
          }
        }

        html {
          scroll-behavior: smooth;
        }

        html[data-sk-theme="dark"] {
          color-scheme: dark;
        }

        html[data-sk-theme="light"] {
          color-scheme: light;
        }

        html[data-sk-theme="dark"] body {
          background: #000;
        }

        html[data-sk-theme="light"] body {
          background: #fafafa;
        }
      `}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="relative z-10 pt-7">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4">
          <div className="flex flex-col items-center gap-2">
            <Image
              src="/6logo.png"
              alt="StayKnown"
              width={38}
              height={38}
              priority
              className="rounded-full"
            />
            <div className="font-extrabold tracking-[0.28em] text-[12px] text-zinc-900 dark:text-white">
              STAYKNOWN
            </div>
          </div>
        </div>
      </header>

      <section className="relative z-10 w-full">
        <div className="mx-auto max-w-6xl px-4 pt-8 pb-16 md:pt-12">
          <article className="overflow-hidden rounded-[2rem] border border-black/10 bg-white/80 shadow-2xl shadow-black/[0.05] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.045] dark:shadow-black/40">
            <div className="relative overflow-hidden border-b border-black/10 px-5 py-7 dark:border-white/10 md:px-8 md:py-9">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(14,165,233,0.17),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.14),transparent_28%)]" />

              <div className="relative grid gap-8 md:grid-cols-[1fr_260px] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill>Location Policy</Pill>
                    <Pill>Live Safety</Pill>
                    <Pill>Approved Contacts</Pill>
                  </div>

                  <h1 className="mt-5 max-w-3xl text-[30px] font-black tracking-[-0.045em] text-zinc-950 dark:text-white/95 md:text-[46px] md:leading-[1.02]">
                    StayKnown Location & Live Safety Policy for Visit sessions,
                    SOS alerts, chat maps, and approved contacts.
                  </h1>

                  <p className="mt-5 max-w-3xl text-[14.5px] font-semibold leading-relaxed text-zinc-700 dark:text-white/62 md:text-[15px]">
                    This policy explains how StayKnown uses location and live
                    safety information for active Visit sessions, LIVE map
                    sharing, SOS alerts, manual emergency capture, chat map
                    context, approved-contact access, place labels, VPN safety
                    gates, Nigeria and global usage, and emergency-service
                    limitations.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <div className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-[12px] font-black text-zinc-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/55">
                      Version {VERSION}
                    </div>
                    <div className="rounded-full border border-black/10 bg-white/70 px-4 py-2 text-[12px] font-black text-zinc-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/55">
                      Updated: {fmtDate(UPDATED_AT)}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setTheme(theme === "dark" ? "light" : "dark")
                      }
                      className="rounded-full border border-black/10 bg-zinc-950 px-4 py-2 text-[12px] font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-black dark:border-white/10 dark:bg-white dark:text-black dark:hover:bg-white/90"
                    >
                      {theme === "dark" ? "Light mode" : "Dark mode"}
                    </button>
                  </div>
                </div>

                <MapIllustration />
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
              <aside className="border-b border-black/10 bg-black/[0.02] p-5 dark:border-white/10 dark:bg-black/20 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:p-6">
                <div className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-white/35">
                  On this page
                </div>

                <nav
                  aria-label="Location and Live Safety Policy sections"
                  className="mt-4 grid gap-1.5"
                >
                  {nav.map(([id, label]) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      className="rounded-2xl px-3 py-2 text-[12.5px] font-bold text-zinc-600 transition hover:bg-black/[0.04] hover:text-zinc-950 dark:text-white/48 dark:hover:bg-white/[0.05] dark:hover:text-white/86"
                    >
                      {label}
                    </a>
                  ))}
                </nav>

                <div className="mt-6 rounded-[1.4rem] border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.035]">
                  <div className="flex items-center gap-2 text-[12px] font-black text-zinc-950 dark:text-white/86">
                    <LocationIcon className="h-4 w-4" />
                    Location rule
                  </div>
                  <p className="mt-2 text-[12px] font-semibold leading-relaxed text-zinc-600 dark:text-white/45">
                    StayKnown location sharing is for lawful, consent-based
                    safety use. It is not for hidden tracking, stalking,
                    pressure, or coercive monitoring.
                  </p>
                </div>
              </aside>

              <div className="p-5 md:p-8">
                <div className="space-y-8">
                  <section id="summary" className="scroll-mt-24 space-y-4">
                    <H2 icon={<MapIcon className="h-4 w-4" />}>
                      1) Location safety summary
                    </H2>
                    <P>
                      StayKnown uses location to help users share safety context
                      with trusted people. Location may support active Visits,
                      LIVE map sharing, SOS alerts, manual emergency capture,
                      chat map context, approved-contact visibility, place
                      labels, safety history, and abuse prevention. Location
                      access must remain lawful, permission-based, and
                      safety-focused.
                    </P>

                    <div className="grid gap-3 md:grid-cols-3">
                      <Callout
                        title="Approved access"
                        body="Location visibility is designed for approved contacts and permitted safety flows, not random public access."
                        tone="safe"
                        icon={<ContactIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="Accuracy has limits"
                        body="GPS, battery, VPN, network, phone settings, map services, and device quality can affect location accuracy."
                        tone="map"
                        icon={<LocationIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="Emergency services first"
                        body="StayKnown does not replace Nigerian emergency agencies, U.S. 911, U.K./EU 999/112, police, ambulance, fire, or official rescue services."
                        tone="danger"
                        icon={<AlertIcon className="h-5 w-5" />}
                      />
                    </div>
                  </section>

                  <section id="purpose" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      2) Purpose of location and live safety features
                    </H2>
                    <P>
                      StayKnown was created to reduce uncertainty when people
                      are moving, visiting, meeting someone, travelling,
                      commuting, chatting with trusted contacts, or facing a
                      possible safety concern. The location system exists to
                      support awareness, trust, and faster human response from
                      people the user chose or approved.
                    </P>
                    <UL
                      items={[
                        "To help a user share where they are during an active Visit.",
                        "To help approved contacts understand a user’s last known safety context during LIVE sharing.",
                        "To support SOS alerts with location and readable area context where available.",
                        "To support manual emergency capture during an active Visit.",
                        "To support chat map context between approved contacts where the chat feature requires location metadata.",
                        "To help users and contacts understand whether an alert is current, delayed, approximate, or limited.",
                        "To protect against misuse, stalking, harassment, fake alerts, repeated unwanted contact, and abusive location behavior.",
                      ]}
                    />
                  </section>

                  <section id="how" className="scroll-mt-24 space-y-3">
                    <H2 icon={<MapIcon className="h-4 w-4" />}>
                      3) How StayKnown location sharing works
                    </H2>
                    <P>
                      StayKnown location sharing is not meant to be an always-on
                      public tracker. It is connected to specific safety flows
                      that the app controls, such as Visit sessions, SOS, manual
                      capture, and approved-contact chat.
                    </P>
                    <UL
                      items={[
                        "A user must grant required device permissions before location features can work.",
                        "The app may capture coordinates, accuracy, captured time, place label, and related safety metadata.",
                        "Approved contacts may receive a link, notification, email, app notice, or map view depending on the feature.",
                        "The live map may show current or last known location depending on app state, device state, network state, and provider availability.",
                        "Chat map views may describe the sender’s safety context connected to the message, not a full public live-tracking profile.",
                        "Place labels may be generated through map/geocoding services to make coordinates easier for humans to understand.",
                      ]}
                    />
                    <Example
                      title="Simple example"
                      items={[
                        "If Clement starts a Visit and shares it with an approved contact, that contact may open the StayKnown Live Map and see permitted safety context.",
                        "If a user sends a chat message with required location metadata, the approved contact may open the chat map and see where that safety message came from.",
                        "If SOS is active, StayKnown may show stronger emergency context, but it still does not become official emergency dispatch.",
                      ]}
                    />
                  </section>

                  <section id="approved" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ContactIcon className="h-4 w-4" />}>
                      4) Approved contacts and consent boundaries
                    </H2>
                    <P>
                      StayKnown is built around trusted and approved contact
                      relationships. A person should not be placed into a safety
                      role secretly, deceptively, or against their will.
                    </P>
                    <UL
                      items={[
                        "Emergency contacts and SOS responders may require approval before receiving certain safety access.",
                        "Contacts must not be added for intimidation, spam, harassment, stalking, retaliation, or pressure.",
                        "If a contact declines, blocks additions, asks to be removed, or withdraws consent, that boundary must be respected.",
                        "A contact’s access should match the user’s permitted safety flow; being a contact does not give unlimited access to all private data.",
                        "StayKnown may keep approval and consent records to prevent disputes, prove authorization, and protect users.",
                        "Approved contacts must use information responsibly and must not publish, sell, shame, exploit, threaten, or misuse a user’s location.",
                      ]}
                    />
                    <LinkCard
                      href="/contact-consent"
                      title="Contact Approval & Consent"
                      body="Read the dedicated rules for approved contacts, SOS responders, consent records, blocked-add settings, and trusted-contact responsibilities."
                    />
                  </section>

                  <section id="visit" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LocationIcon className="h-4 w-4" />}>
                      5) Visit sessions and LIVE map sharing
                    </H2>
                    <P>
                      A Visit session is a user-controlled safety flow that can
                      help approved contacts understand where the user is during
                      a selected movement, meeting, trip, or safety-relevant
                      activity.
                    </P>
                    <UL
                      items={[
                        "A Visit may include start time, expected context, destination, live state, captured location, place label, and update history.",
                        "LIVE sharing may show a user’s current or last known safety position while the Visit is active.",
                        "Ending a Visit may stop or reduce live sharing depending on the feature and session state.",
                        "A delayed, stale, or unavailable location should not be treated as guaranteed real-time truth.",
                        "Approved contacts should call the user, check other reliable sources, or contact official emergency services if they reasonably believe there is danger.",
                        "Users should keep their phone charged, location permission enabled, mobile data available, and battery restrictions managed during safety sessions.",
                      ]}
                    />
                    <Callout
                      title="Visit completion"
                      body="When a Visit ends, approved contacts may still see limited history or session status where needed for safety, records, abuse prevention, or lawful purposes."
                      tone="law"
                      icon={<MapIcon className="h-5 w-5" />}
                    />
                  </section>

                  <section id="sos" className="scroll-mt-24 space-y-3">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      6) SOS alerts and manual emergency capture
                    </H2>
                    <P>
                      SOS and manual capture features are designed to help a
                      user send urgent safety context to trusted contacts. They
                      do not guarantee rescue, police response, ambulance
                      response, fire response, or official intervention.
                    </P>
                    <UL
                      items={[
                        "SOS may include activation time, emergency state, user identity, safety gallery context, location, map link, place label, and contact notification records.",
                        "Manual emergency capture may send an extra location update during an active Visit without changing the normal tracking rhythm.",
                        "StayKnown may require confirmation, verification, or stronger stop flows to reduce accidental SOS ending.",
                        "False SOS alerts, fake emergencies, prank alerts, swatting, or repeated abusive manual captures are prohibited.",
                        "Contacts who receive SOS should use judgment, call the user where possible, and contact official emergency services if appropriate.",
                        "In Nigeria, users and contacts should follow applicable local emergency and law-enforcement channels. In the U.S., U.K., EU, and other countries, use the official emergency number for that location.",
                      ]}
                    />
                    <LinkCard
                      href="/emergency"
                      title="Emergency Disclaimer"
                      body="Read the dedicated emergency limitation policy before relying on SOS, LIVE sharing, or manual capture."
                    />
                  </section>

                  <section id="chat" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      7) Chat location map and safety-message context
                    </H2>
                    <P>
                      StayKnown Chat may include location metadata so approved
                      contacts understand where a safety message came from. This
                      is different from the full Visit LIVE map. The chat map is
                      meant to describe the sender’s safety context for that
                      communication.
                    </P>
                    <UL
                      items={[
                        "A chat message may include latitude, longitude, accuracy, captured time, client tag, and readable place label where supported.",
                        "The receiver may see a map icon or chat map view connected to the message.",
                        "The map should identify the sender/context clearly so the approved contact knows whose safety location they are viewing.",
                        "Chat location context should not be used to stalk, pressure, threaten, monitor, expose, or shame a user.",
                        "If location is disabled or unreliable, StayKnown may block sending or show a friendly warning because safety context cannot be captured reliably.",
                        "Chat translation, voice notes, media, stickers, and message content remain subject to the Privacy Policy, Terms, and Acceptable Use rules.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/privacy"
                        title="Privacy Policy"
                        body="Explains how chat, map metadata, media, messages, safety gallery, and location information are processed."
                      />
                      <LinkCard
                        href="/acceptable-use"
                        title="Acceptable Use"
                        body="Rules for responsible chat, media, stickers, voice notes, reporting, and prohibited content."
                      />
                    </div>
                  </section>

                  <section id="accuracy" className="scroll-mt-24 space-y-3">
                    <H2 icon={<MapIcon className="h-4 w-4" />}>
                      8) Location accuracy, map labels, and provider limits
                    </H2>
                    <P>
                      StayKnown may use GPS, device services, network signals,
                      map providers, and geocoding providers to turn coordinates
                      into understandable safety context. This helps contacts
                      read locations like areas, roads, landmarks, hospitals,
                      schools, public buildings, or nearby places where
                      providers support those labels.
                    </P>
                    <UL
                      items={[
                        "Location may be precise, approximate, delayed, stale, missing, or wrong.",
                        "Buildings, roads, borders, schools, hospitals, government buildings, and landmarks may not always appear or may be outdated depending on map data.",
                        "Reverse-geocoded labels may describe a nearby area instead of the exact door, room, floor, compound, estate, or shop.",
                        "Rural areas, low-network zones, thick buildings, markets, campuses, highways, and poor GPS environments can reduce accuracy.",
                        "Map providers such as TomTom, OpenCage, Mapbox, or other services may have outages, rate limits, coverage differences, or label errors.",
                        "A location shown on StayKnown should be treated as safety context, not a legally certified or emergency-dispatch-grade position.",
                      ]}
                    />
                    <Example
                      title="Nigeria and global examples"
                      items={[
                        "In Lagos traffic, a phone may report the nearest road or area rather than the exact bus stop or building.",
                        "In Cross River or rural areas, weak signal can delay updates or show a wider accuracy radius.",
                        "In the U.S. or U.K., a map may show a nearby street or business even if the user is inside a large building.",
                        "In EU countries, local privacy rules may require stricter consent and data handling for location sharing.",
                      ]}
                    />
                  </section>

                  <section id="vpn" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      9) VPN safety gate and network reliability
                    </H2>
                    <P>
                      StayKnown may warn, restrict, or block certain flows when
                      VPN behavior, network routing, spoofing, device settings,
                      or suspicious signals can reduce safety reliability.
                    </P>
                    <UL
                      items={[
                        "VPN usage may hide or confuse network context and may reduce StayKnown’s ability to assess safety-location reliability.",
                        "If a VPN is active before app launch, StayKnown may show a safety gate or block usage until the VPN is turned off.",
                        "If VPN is enabled during an active Visit, StayKnown may stop or restrict safety flows and may notify contacts where the app is configured to do so.",
                        "The VPN safety gate is not a punishment; it is a reliability and safety-control measure.",
                        "Users must not use VPNs, spoofing tools, modified devices, fake GPS apps, emulators, or bypass methods to mislead contacts or StayKnown systems.",
                      ]}
                    />
                    <Callout
                      title="Why this matters"
                      body="A safety app should protect trust. If the app cannot trust location or network signals, it may limit the feature instead of showing contacts unreliable safety data."
                      tone="law"
                      icon={<ShieldIcon className="h-5 w-5" />}
                    />
                  </section>

                  <section id="global" className="scroll-mt-24 space-y-3">
                    <H2 icon={<GlobeIcon className="h-4 w-4" />}>
                      10) Nigeria, United States, United Kingdom, EU, and global
                      usage
                    </H2>
                    <P>
                      StayKnown may be used by people in different countries,
                      but emergency systems, privacy laws, telecom reliability,
                      map coverage, and legal expectations differ by location.
                      Users and contacts must follow the law and emergency
                      procedures of the country where the safety event happens.
                    </P>

                    <H3>Nigeria usage language</H3>
                    <UL
                      items={[
                        "In Nigeria, StayKnown should be used as a safety-awareness and trusted-contact tool, not as a replacement for police, ambulance, fire service, FRSC, NSCDC, NEMA, state emergency agencies, private security, hospitals, or local emergency channels.",
                        "Network conditions, power issues, road conditions, rural coverage, market congestion, campuses, estates, and building density can affect update speed and accuracy.",
                        "Contacts in Nigeria should call the user first where safe, contact family or trusted responders, and use appropriate local emergency or law-enforcement channels if danger is suspected.",
                        "Users must not use StayKnown to threaten, monitor, shame, extort, track, or control another person. Nigerian users must respect privacy, consent, criminal law, civil rights, and local safety rules.",
                      ]}
                    />

                    <H3>United States usage language</H3>
                    <UL
                      items={[
                        "In the United States, StayKnown is not 911, a public safety answering point, law enforcement, EMS, fire department, or rescue provider.",
                        "If there is immediate danger, users and contacts should call 911 or the correct local emergency number.",
                        "Users must respect consent, protective orders, anti-stalking laws, harassment laws, privacy laws, school rules, workplace rules, and state-specific location privacy expectations.",
                      ]}
                    />

                    <H3>United Kingdom, EU, and other regions</H3>
                    <UL
                      items={[
                        "In the U.K. and EU, users and contacts should use official emergency channels such as 999, 112, or the correct local number where immediate help is needed.",
                        "European users may have stronger privacy, consent, data minimization, transparency, and rights requirements for location and safety data.",
                        "In any country, users must not use StayKnown in a way that violates local privacy, employment, school, family, child-protection, stalking, harassment, telecom, sanctions, or emergency-service laws.",
                      ]}
                    />
                  </section>

                  <section id="misuse" className="scroll-mt-24 space-y-3">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      11) Prohibited misuse of location features
                    </H2>
                    <UL
                      items={[
                        "No stalking, harassment, intimidation, threats, coercive control, retaliation, or surveillance.",
                        "No hidden tracking of a partner, ex-partner, child, employee, student, tenant, customer, stranger, protected person, or vulnerable person without lawful basis and required consent.",
                        "No using StayKnown to violate restraining orders, protective orders, custody orders, school restrictions, workplace restrictions, or no-contact instructions.",
                        "No fake SOS, prank alerts, false emergencies, hoax reports, swatting, or repeated manual captures designed to scare people.",
                        "No exposing, posting, selling, leaking, or sharing another person’s location outside the intended safety flow.",
                        "No fake GPS, spoofing, VPN bypass, modified app behavior, automation, scraping, or attempts to defeat safety gates.",
                        "No using map information to facilitate theft, assault, kidnapping, trafficking, exploitation, extortion, doxxing, or violence.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/safety"
                        title="Safety & Anti-Stalking"
                        body="Dedicated safety policy for anti-stalking, anti-harassment, protective-order, and coercive-use rules."
                      />
                      <LinkCard
                        href="/abuse"
                        title="Abuse Reporting"
                        body="Report location misuse, unwanted contact, impersonation, fake emergencies, stalking, or unsafe behavior."
                      />
                    </div>
                  </section>

                  <section id="retention" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      12) Location data retention and legal handling
                    </H2>
                    <P>
                      StayKnown may retain location and safety records for
                      service operation, user history, notification delivery,
                      support, abuse prevention, legal compliance, security,
                      dispute handling, and emergency or law-enforcement request
                      handling.
                    </P>
                    <UL
                      items={[
                        "Live session records may be retained for history, reliability, and safety auditing.",
                        "SOS and manual capture records may be retained because they can involve urgent safety context.",
                        "Chat map metadata may be retained with message history and safety records where applicable.",
                        "Consent and approved-contact records may be retained to prove authorization and prevent disputes.",
                        "Some records may be preserved longer where required by law, safety concern, legal hold, abuse investigation, fraud prevention, or official request.",
                        "Deletion requests may be limited where retention is legally permitted or required for safety, fraud prevention, security, or compliance.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/privacy"
                        title="Privacy Policy"
                        body="Explains broader data handling, user rights, service providers, privacy requests, and lawful disclosures."
                      />
                      <LinkCard
                        href="/retention"
                        title="Data Retention"
                        body="Detailed retention rules for safety logs, location records, chat metadata, media, legal holds, and deletion limits."
                      />
                    </div>
                  </section>

                  <section id="contact" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ContactIcon className="h-4 w-4" />}>
                      13) Contact and related policies
                    </H2>
                    <P>
                      For location privacy questions, live map concerns, contact
                      approval issues, safety misuse, abuse reports, or legal
                      concerns, contact StayKnown support.
                    </P>
                    <UL
                      items={[
                        "Support: support@stay-known.com",
                        "Use Abuse Reporting for stalking, harassment, unwanted tracking, impersonation, or fake emergency concerns.",
                        "Use Law Enforcement & Emergency Requests for valid official requests, emergency preservation, or legal process.",
                        "Use Security Disclosure for vulnerability reports or platform-integrity concerns.",
                      ]}
                    />

                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/terms"
                        title="Terms of Service"
                        body="Main agreement for StayKnown accounts, lawful use, safety limits, subscriptions, and enforcement."
                      />
                      <LinkCard
                        href="/privacy"
                        title="Privacy Policy"
                        body="How StayKnown processes account, location, contact, chat, media, payment, retention, and legal request data."
                      />
                      <LinkCard
                        href="/contact-consent"
                        title="Contact Approval & Consent"
                        body="Approved contacts, SOS responders, consent records, blocked-add settings, and removal rights."
                      />
                      <LinkCard
                        href="/emergency"
                        title="Emergency Disclaimer"
                        body="Important limits: StayKnown does not replace official emergency services in Nigeria, the U.S., U.K./EU, or any country."
                      />
                      <LinkCard
                        href="/law"
                        title="Law Enforcement & Emergency Requests"
                        body="Official request handling, emergency disclosure, legal preservation, and user notice rules."
                      />
                      <LinkCard
                        href="/security"
                        title="Security Disclosure"
                        body="Responsible vulnerability reporting and platform-integrity concerns."
                      />
                    </div>
                  </section>

                  <section className="space-y-3 rounded-[1.6rem] border border-black/10 bg-black/[0.025] p-5 dark:border-white/10 dark:bg-white/[0.03]">
                    <H2>14) Changes to this Location & Live Safety Policy</H2>
                    <P>
                      StayKnown may update this policy to reflect new map
                      providers, safety flows, Visit behavior, SOS behavior, VPN
                      gate changes, chat map changes, legal requirements,
                      provider limitations, country-specific expectations, or
                      operational needs. If updates are material, StayKnown may
                      provide notice through the app, website, email, or another
                      reasonable method.
                    </P>
                  </section>

                  <section className="space-y-3 rounded-[1.6rem] border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.035]">
                    <H2>Appendix A — In-app short location notice</H2>
                    <P>
                      StayKnown uses location only for supported safety flows
                      such as active Visit sessions, LIVE map sharing, SOS
                      alerts, manual emergency capture, chat location context,
                      approved-contact visibility, safety history, and abuse
                      prevention. Location may be delayed, approximate, missing,
                      or affected by GPS, battery, VPN, network, device
                      settings, and map providers. StayKnown does not replace
                      official emergency services in Nigeria, the United States,
                      the United Kingdom, the European Union, or any country.
                      Use StayKnown lawfully, with consent, and never for
                      stalking, harassment, hidden tracking, or coercive
                      monitoring.
                    </P>
                  </section>
                </div>

                <div className="mt-10 h-px bg-black/10 dark:bg-white/10" />

                <footer className="mt-6 text-center">
                  <div className="text-[12px] font-semibold text-zinc-600 dark:text-white/50">
                    A 6 Clement Joshua service
                    <span className="ml-1 align-super text-[10px] text-zinc-400 dark:text-white/25">
                      ™
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] font-semibold text-zinc-500 dark:text-white/30">
                    {new Date().getFullYear()} • stay-known.com
                  </div>
                  <p className="mx-auto mt-3 max-w-2xl text-[11px] font-semibold leading-relaxed text-zinc-500 dark:text-white/30">
                    This policy is provided for product transparency and should
                    be reviewed by qualified legal counsel before public launch,
                    regulatory filing, investor review, app-store submission, or
                    law-enforcement request handling.
                  </p>
                </footer>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
