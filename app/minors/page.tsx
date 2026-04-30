"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const UPDATED_AT = "2026-04-30";
const VERSION = "2.0";

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
      "StayKnown Child Safety & Minor Use Policy | Guardian Consent, Location Safety, SOS & Teen Protection";

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
      "Read the StayKnown Child Safety & Minor Use Policy covering age rules, guardian consent, approved contacts, location sharing, SOS alerts, chat safety, abuse reporting, Nigeria and global youth safety limits.",
    );
    upsertMeta(
      "keywords",
      "StayKnown child safety policy, minor use policy, teen safety app, guardian consent, approved contacts for minors, SOS safety app for teens, location sharing minors, child privacy safety app, Nigeria child safety app, youth protection policy, anti-grooming app policy",
    );
    upsertMeta("robots", "index, follow");
    upsertMeta("author", "6 Clement Joshua");
    upsertProperty(
      "og:title",
      "StayKnown Child Safety & Minor Use Policy | Guardian Consent & Youth Safety",
    );
    upsertProperty(
      "og:description",
      "Age rules, guardian responsibilities, minor location safety, SOS limits, trusted contacts, reporting, privacy, retention, and legal cooperation for StayKnown.",
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

function ChildIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 10.8a3.35 3.35 0 1 0 0-6.7 3.35 3.35 0 0 0 0 6.7Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M6.4 20.2c.62-4.1 2.72-6.35 5.6-6.35s4.98 2.25 5.6 6.35"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M8.3 12.7 5.7 15M15.7 12.7l2.6 2.3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GuardianIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M8.4 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M3.8 19.2c.55-3.05 2.22-4.78 4.6-4.78 1.45 0 2.62.64 3.45 1.82"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M16.8 20.4c2.5-.82 4.2-3.2 4.2-5.85V11.3l-4.2-1.65-4.2 1.65v3.25c0 2.65 1.7 5.03 4.2 5.85Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="m14.9 15.1 1.25 1.25 2.55-2.8"
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

function ChatIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M5 5.4h14v9.2H9.4L5 18.7V5.4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M8.2 8.8h7.6M8.2 11.5h5.6"
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

function ReportIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M6.4 4.5h8.4l2.8 2.8v12.2H6.4v-15Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M14.8 4.5v2.8h2.8M9 10.5h6M9 13.4h6M9 16.3h3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
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
  tone?: "normal" | "danger" | "safe" | "law" | "youth" | "report";
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
        tone === "youth" &&
          "border-violet-600/20 bg-violet-500/[0.07] dark:border-violet-300/20 dark:bg-violet-300/[0.07]",
        tone === "report" &&
          "border-amber-600/20 bg-amber-500/[0.08] dark:border-amber-300/20 dark:bg-amber-300/[0.07]",
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_15%_20%,rgba(139,92,246,0.12),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(16,185,129,0.10),transparent_25%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_15%_20%,rgba(139,92,246,0.10),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(16,185,129,0.08),transparent_25%)]" />
      <div className="absolute left-[7%] top-[18%] h-48 w-48 animate-[floatSlow_9s_ease-in-out_infinite] rounded-full bg-violet-400/10 blur-3xl" />
      <div className="absolute right-[8%] top-[32%] h-56 w-56 animate-[floatSlow_11s_ease-in-out_infinite_reverse] rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="absolute bottom-[8%] left-[30%] h-60 w-60 animate-[floatSlow_13s_ease-in-out_infinite] rounded-full bg-white/8 blur-3xl" />
    </div>
  );
}

function YouthIllustration() {
  return (
    <div className="relative mx-auto h-[280px] w-[190px] md:h-[320px] md:w-[220px]">
      <div className="absolute inset-0 animate-[softPulse_4s_ease-in-out_infinite] rounded-[2.2rem] bg-violet-400/15 blur-2xl" />
      <div className="relative h-full w-full rounded-[2rem] border border-black/15 bg-white/75 p-3 shadow-2xl backdrop-blur dark:border-white/15 dark:bg-white/[0.055]">
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-black/20 dark:bg-white/20" />
        <div className="rounded-[1.5rem] border border-black/10 bg-gradient-to-b from-white to-zinc-100 p-4 dark:border-white/10 dark:from-white/[0.10] dark:to-white/[0.03]">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-black text-white dark:bg-white dark:text-black">
              <ChildIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-black tracking-[0.18em] text-zinc-500 dark:text-white/35">
                YOUTH SAFETY
              </div>
              <div className="text-[13px] font-black text-zinc-950 dark:text-white">
                Guardian-Aware Use
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {[
              ["Under 13", "Not permitted"],
              ["13–15", "Guardian supervised"],
              ["16–17", "Guardian consent where required"],
              ["All minors", "Safety purpose only"],
            ].map(([title, body], index) => (
              <div
                key={title}
                className="animate-[riseIn_0.7s_ease_both] rounded-2xl border border-black/10 bg-white/80 p-3 dark:border-white/10 dark:bg-black/20"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="text-[12px] font-black text-zinc-900 dark:text-white/90">
                  {title}
                </div>
                <div className="mt-1 text-[10.5px] font-semibold text-zinc-500 dark:text-white/45">
                  {body}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-2xl border border-black/10 bg-black/[0.035] px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="text-[10.5px] font-black uppercase tracking-[0.16em] text-zinc-500 dark:text-white/35">
            Minor safety
          </div>
          <div className="h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_14px_rgba(139,92,246,0.9)]" />
        </div>
      </div>
    </div>
  );
}

export default function MinorsPage() {
  const { theme, setTheme } = useThemeMode();
  useSeoMeta();

  const nav = useMemo(
    () =>
      [
        ["summary", "Summary"],
        ["ages", "Age rules"],
        ["guardian", "Guardian duties"],
        ["consent", "Consent"],
        ["features", "Features"],
        ["location", "Location"],
        ["contacts", "Contacts"],
        ["chat", "Chat & media"],
        ["prohibited", "Prohibited"],
        ["global", "Nigeria & global"],
        ["reports", "Reports"],
        ["data", "Data"],
        ["law", "Legal"],
        ["contact", "Contact"],
      ] as const,
    [],
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "StayKnown Child Safety & Minor Use Policy",
    dateModified: UPDATED_AT,
    version: VERSION,
    publisher: {
      "@type": "Organization",
      name: "StayKnown",
      brand: "A 6 Clement Joshua service™",
      url: "https://stay-known.com",
    },
    description:
      "Child Safety and Minor Use Policy for StayKnown covering age rules, guardian duties, consent, approved contacts, location safety, SOS, chat, media, data retention, Nigeria and global youth safety, and legal cooperation.",
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
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(139,92,246,0.16),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.14),transparent_28%)]" />

              <div className="relative grid gap-8 md:grid-cols-[1fr_260px] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill>Child Safety</Pill>
                    <Pill>Minor Use</Pill>
                    <Pill>Guardian Consent</Pill>
                  </div>

                  <h1 className="mt-5 max-w-3xl text-[30px] font-black tracking-[-0.045em] text-zinc-950 dark:text-white/95 md:text-[46px] md:leading-[1.02]">
                    StayKnown Child Safety & Minor Use Policy for guardian-aware
                    safety protection.
                  </h1>

                  <p className="mt-5 max-w-3xl text-[14.5px] font-semibold leading-relaxed text-zinc-700 dark:text-white/62 md:text-[15px]">
                    This policy explains how minors may use StayKnown, when
                    parent or legal guardian permission is required, how
                    approved contacts and SOS alerts should be handled, how
                    location and chat features must be protected, and what
                    conduct involving minors is strictly prohibited.
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

                <YouthIllustration />
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
              <aside className="border-b border-black/10 bg-black/[0.02] p-5 dark:border-white/10 dark:bg-black/20 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:p-6">
                <div className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-white/35">
                  On this page
                </div>

                <nav
                  aria-label="Child Safety and Minor Use Policy sections"
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

                <div className="mt-6 rounded-[1.4rem] border border-violet-500/20 bg-violet-500/[0.06] p-4 dark:border-violet-300/20 dark:bg-violet-300/[0.07]">
                  <div className="flex items-center gap-2 text-[12px] font-black text-zinc-950 dark:text-white/86">
                    <ChildIcon className="h-4 w-4" />
                    Youth protection
                  </div>
                  <p className="mt-2 text-[12px] font-semibold leading-relaxed text-zinc-700 dark:text-white/55">
                    StayKnown must never be used to exploit, secretly monitor,
                    pressure, groom, threaten, shame, or control a minor.
                  </p>
                </div>
              </aside>

              <div className="p-5 md:p-8">
                <div className="space-y-8">
                  <section id="summary" className="scroll-mt-24 space-y-4">
                    <H2 icon={<ChildIcon className="h-4 w-4" />}>
                      1) Child safety summary
                    </H2>
                    <P>
                      StayKnown is a safety-focused service. For minors, that
                      purpose requires stronger care: proper age eligibility,
                      parent or legal guardian permission where required,
                      responsible approved contacts, privacy respect, safer
                      communication, and strict boundaries against exploitation,
                      harassment, coercion, grooming, hidden monitoring, and
                      unsafe contact.
                    </P>

                    <div className="grid gap-3 md:grid-cols-3">
                      <Callout
                        title="Under 13 not permitted"
                        body="Children under 13 may not create an account or use StayKnown."
                        tone="danger"
                        icon={<AlertIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="Guardian-aware use"
                        body="Minors who are allowed to use StayKnown must follow guardian permission and local-law requirements."
                        tone="youth"
                        icon={<GuardianIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="Safety purpose only"
                        body="Minor-related use must be lawful, transparent where required, and focused on safety."
                        tone="safe"
                        icon={<ShieldIcon className="h-5 w-5" />}
                      />
                    </div>
                  </section>

                  <section id="ages" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ChildIcon className="h-4 w-4" />}>
                      2) Age rules — global baseline
                    </H2>
                    <UL
                      items={[
                        "Under 13: not permitted to create an account or use StayKnown.",
                        "Ages 13–15: permitted only with active permission and supervision of a parent or legal guardian and only for lawful safety use.",
                        "Ages 16–17: permitted with permission or consent of a parent or legal guardian and only for lawful safety use, where required.",
                        "Age 18+: permitted subject to StayKnown policies, Terms of Service, local law, and account standing.",
                        "If local law sets a higher age threshold, stronger parental consent, school approval, workplace approval, or special data-protection rule, the stricter rule applies.",
                      ]}
                    />
                    <Callout
                      title="Local law controls"
                      body="Some countries, states, schools, workplaces, guardianship arrangements, or child-protection laws may require stronger consent or prohibit certain uses. Users and guardians must follow the stricter applicable rule."
                      tone="law"
                      icon={<GlobeIcon className="h-5 w-5" />}
                    />
                  </section>

                  <section id="guardian" className="scroll-mt-24 space-y-3">
                    <H2 icon={<GuardianIcon className="h-4 w-4" />}>
                      3) Parent and legal guardian responsibilities
                    </H2>
                    <P>
                      Parents or legal guardians who help a minor use StayKnown
                      are responsible for making sure the setup is lawful,
                      appropriate, privacy-aware, and focused on safety.
                    </P>
                    <UL
                      items={[
                        "Confirm that the minor is old enough under StayKnown rules and local law.",
                        "Obtain required permission, consent, or legal authority before setup.",
                        "Explain how Visits, SOS alerts, location permissions, notifications, approved contacts, chat, media, stories, stickers, and safety features may work.",
                        "Choose trusted contacts carefully and keep them updated.",
                        "Avoid adding contacts for pressure, shame, punishment, harassment, retaliation, or non-safety reasons.",
                        "Keep account and device access secure.",
                        "Review safety use periodically and remove contacts or settings that are no longer appropriate.",
                        "Do not use StayKnown as a substitute for supervision, emergency services, medical care, law enforcement, school safety rules, or responsible real-world safety planning.",
                      ]}
                    />
                  </section>

                  <section id="consent" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      4) Consent, lawful basis, and transparency
                    </H2>
                    <P>
                      StayKnown must not be used as a secret surveillance tool.
                      Where a minor is involved, the person setting up or
                      managing the service must have the required authority and
                      must use the Service only for lawful safety purposes.
                    </P>
                    <UL
                      items={[
                        "Do not create or manage a minor’s account without required authority.",
                        "Do not add a minor’s contacts without a safety-focused reason and appropriate permission.",
                        "Do not use StayKnown to hide monitoring where law, school policy, workplace policy, family court order, or policy requires notice.",
                        "Do not use alerts, location context, chat, stories, or safety gallery content to shame, punish, threaten, or control a minor.",
                        "Do not pressure a minor to share safety context for reasons unrelated to safety.",
                        "Do not use StayKnown to violate custody rules, protective orders, school restrictions, workplace rules, or local law.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/contact-consent"
                        title="Contact Approval & Consent"
                        body="Rules for approved contacts, SOS responders, consent records, removals, and blocked-add settings."
                      />
                      <LinkCard
                        href="/privacy"
                        title="Privacy Policy"
                        body="How StayKnown handles minor-related account, contact, location, chat, media, and safety records."
                      />
                    </div>
                  </section>

                  <section id="features" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      5) Feature access and plan-aware safety
                    </H2>
                    <P>
                      Some StayKnown features may be limited by plan, region,
                      age rules, device permissions, safety review, or local
                      law. Minors should not be pushed into features that are
                      unnecessary or inappropriate for their situation.
                    </P>
                    <UL
                      items={[
                        "Visit sessions should be used for real safety check-ins, not control.",
                        "SOS should be used only when the user needs urgent safety attention.",
                        "Manual Capture should be used for safety updates, not false evidence or pressure.",
                        "Safety Gallery should support recognition, not public exposure or humiliation.",
                        "Chat, stories, stickers, voice notes, media, and translation must be respectful, lawful, and age-appropriate.",
                        "Premium features, Pro access, or Pro Max access do not override minor safety rules.",
                        "Paid plans do not guarantee rescue, official emergency response, exact location, or contact response.",
                      ]}
                    />
                    <LinkCard
                      href="/billing-policy"
                      title="Billing & Refunds"
                      body="Paid plans, purchases, wallet/coins, subscriptions, and refunds do not remove minor-safety obligations."
                    />
                  </section>

                  <section id="location" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LocationIcon className="h-4 w-4" />}>
                      6) Location, Visit, LIVE, and SOS safety for minors
                    </H2>
                    <P>
                      Location features can support safety, but they can also be
                      misused. StayKnown location sharing involving minors must
                      be lawful, permission-based, guardian-aware where
                      required, and safety-focused.
                    </P>
                    <UL
                      items={[
                        "Location accuracy depends on device settings, GPS, network, battery, VPN status, app state, map providers, and permissions.",
                        "Location updates may be delayed, unavailable, stale, or inaccurate.",
                        "StayKnown does not replace emergency services, direct supervision, trusted adults, or real-world safety planning.",
                        "Do not use location data to stalk, threaten, shame, punish, exploit, expose, or control a minor.",
                        "Do not use StayKnown to violate custody orders, school rules, protective orders, family court orders, workplace restrictions, or local law.",
                        "If a minor is in immediate danger, contact official emergency services or the proper local authority first.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/location-safety"
                        title="Location & Live Safety"
                        body="Detailed rules for Visit sessions, LIVE sharing, SOS, manual capture, chat maps, VPN gates, and accuracy limits."
                      />
                      <LinkCard
                        href="/emergency"
                        title="Emergency Disclaimer"
                        body="StayKnown does not replace official emergency services in Nigeria, the U.S., U.K./EU, or any country."
                      />
                    </div>
                  </section>

                  <section id="contacts" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ContactIcon className="h-4 w-4" />}>
                      7) Contacts, notifications, and trusted adults
                    </H2>
                    <P>
                      Contacts should be chosen carefully. A trusted contact may
                      receive alerts, safety updates, map links, chat context,
                      or notification records. That role should not be given to
                      someone who may exploit, shame, pressure, manipulate, or
                      endanger the minor.
                    </P>
                    <UL
                      items={[
                        "Only add contacts with a lawful safety purpose.",
                        "Use responsible adults or trusted people where appropriate.",
                        "Inform contacts that they may receive safety alerts.",
                        "Remove contacts who should no longer receive alerts.",
                        "Do not use contact alerts to embarrass, threaten, punish, spam, pressure, or control anyone.",
                        "If a contact asks to stop receiving alerts, respect that request unless a lawful safety basis requires otherwise.",
                        "Do not repeatedly request contact approval after a person declines, blocks, or asks to stop.",
                      ]}
                    />
                  </section>

                  <section id="chat" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ChatIcon className="h-4 w-4" />}>
                      8) Chat, stories, stickers, voice, and media involving
                      minors
                    </H2>
                    <P>
                      If StayKnown includes chat, stories, stickers, voice
                      notes, media, translation, or profile features, those
                      surfaces must be used carefully when minors are involved.
                    </P>
                    <UL
                      items={[
                        "No grooming, sexual exploitation, coercion, threats, harassment, intimidation, impersonation, or unsafe contact.",
                        "No sharing private minor-related content without lawful permission.",
                        "No impersonating a minor, guardian, responder, contact, school official, emergency official, or StayKnown staff.",
                        "No using stories, profile context, images, names, or place labels to expose, shame, locate, or pressure a minor.",
                        "No using stickers, media, voice notes, translations, or messages to target, manipulate, threaten, or exploit a minor.",
                        "Reports involving minors may lead to urgent safety review and preservation of relevant records.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/acceptable-use"
                        title="Acceptable Use"
                        body="Detailed prohibited-use rules for chat, media, stories, stickers, location, contacts, and safety features."
                      />
                      <LinkCard
                        href="/abuse"
                        title="Abuse Reporting"
                        body="Report child-safety concerns, impersonation, harassment, grooming concerns, threats, or unsafe contact."
                      />
                    </div>
                  </section>

                  <section id="prohibited" className="scroll-mt-24 space-y-3">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      9) Prohibited use involving minors
                    </H2>
                    <P>
                      StayKnown strictly prohibits misuse involving minors,
                      vulnerable users, students, dependents, or persons who
                      require heightened protection.
                    </P>
                    <UL
                      items={[
                        "No covert monitoring of minors outside lawful guardian or authorized supervision.",
                        "No using StayKnown to target, exploit, groom, threaten, intimidate, shame, or manipulate minors.",
                        "No using StayKnown to facilitate kidnapping, trafficking, coercion, forced movement, unsafe meetings, or exploitation.",
                        "No false SOS, false Visit, false manual capture, or false safety claims involving a minor.",
                        "No using safety logs, location, stories, chat, stickers, media, or profile information to shame or punish a minor.",
                        "No attempts to bypass blocks, reports, age limits, plan limits, consent rules, location safeguards, VPN gates, or safety controls.",
                        "No use that violates custody orders, restraining orders, protective orders, school restrictions, workplace rules, or similar legal boundaries.",
                      ]}
                    />
                    <Example
                      title="Not allowed"
                      items={[
                        "An adult uses StayKnown to secretly monitor a minor without legal authority.",
                        "Someone uses a safety alert to lure a minor to an unsafe place.",
                        "A person uses chat or stories to pressure a minor to meet, travel, or share private information.",
                        "A guardian uses location data to shame a minor publicly or threaten them.",
                      ]}
                    />
                  </section>

                  <section id="global" className="scroll-mt-24 space-y-3">
                    <H2 icon={<GlobeIcon className="h-4 w-4" />}>
                      10) Nigeria, United States, United Kingdom, EU, and global
                      use
                    </H2>
                    <P>
                      Child safety laws, privacy requirements, guardian consent,
                      school rules, family court orders, and emergency-response
                      systems differ by country. Users and guardians must follow
                      the law where they live and where the safety event
                      happens.
                    </P>

                    <H3>Nigeria usage language</H3>
                    <UL
                      items={[
                        "In Nigeria, minor-related StayKnown use should be limited to lawful family, guardian, school, travel, community, workplace, or safety awareness with trusted people.",
                        "StayKnown must not be used to shame, threaten, monitor, exploit, pressure, or control a minor.",
                        "Network issues, power supply, rural coverage, city congestion, road conditions, device quality, and provider delays may affect alerts and location accuracy.",
                        "If a minor is in immediate danger, use appropriate local channels, which may include trusted guardians, local police, medical help, FRSC, NSCDC, NEMA, state emergency agencies, private security, child-safety authorities, or nearby responsible responders depending on the situation.",
                        "StayKnown does not replace Nigerian police, ambulance, hospitals, fire service, road safety, civil defence, disaster management, child-protection authorities, or any official authority.",
                      ]}
                    />

                    <H3>United States, U.K./EU, and other countries</H3>
                    <UL
                      items={[
                        "In the United States, StayKnown is not 911, law enforcement, EMS, fire department, child protective services, school safety, or rescue service.",
                        "In the U.K. and EU, StayKnown is not 999, 112, police, ambulance, fire service, safeguarding authority, child-protection authority, or official emergency dispatch.",
                        "European users may have stricter consent, data protection, transparency, deletion, and privacy rights for minors’ data.",
                        "In every country, users must follow local laws on child safety, privacy, family law, school rules, employment rules, telecom, stalking, harassment, protective orders, and emergency-service misuse.",
                      ]}
                    />
                  </section>

                  <section id="reports" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ReportIcon className="h-4 w-4" />}>
                      11) Reporting child safety concerns
                    </H2>
                    <P>
                      If you believe a minor is at risk or StayKnown is being
                      used to target, exploit, threaten, groom, harass,
                      manipulate, impersonate, or pressure a minor, report it as
                      soon as it is safe to do so.
                    </P>
                    <UL
                      items={[
                        "Use the subject line: Child Safety Report.",
                        "Include account, email, username, phone, link, profile, alert, or message details if available.",
                        "Include dates, times, screenshots, notification examples, or message examples if safe to share.",
                        "Do not put yourself or the minor in danger to gather evidence.",
                        "If there is immediate danger, contact local emergency services, local law enforcement, a guardian, school authority, child-safety authority, or the proper local emergency channel first.",
                      ]}
                    />
                    <Callout
                      title="Report route"
                      body="Support: support@stay-known.com"
                      tone="report"
                      icon={<ReportIcon className="h-5 w-5" />}
                    />
                  </section>

                  <section id="data" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      12) Data, privacy, and retention involving minors
                    </H2>
                    <P>
                      StayKnown aims to collect and retain only what is
                      reasonably necessary to operate safety features, protect
                      users, prevent abuse, resolve disputes, comply with law,
                      and support safety auditing.
                    </P>
                    <UL
                      items={[
                        "Some records may be retained for legal, safety, abuse-prevention, security, fraud-prevention, or child-protection reasons.",
                        "Deletion requests may be limited where records are needed for safety, security, legal compliance, abuse investigations, fraud prevention, or legal holds.",
                        "Reports involving minors may require preservation of relevant records.",
                        "StayKnown does not sell personal data.",
                        "Guardians should avoid entering unnecessary personal information about minors.",
                        "Minor-related data may include account identifiers, contact approvals, safety sessions, SOS alerts, manual captures, chat metadata, media references, safety gallery content, reports, and support records where used.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/privacy"
                        title="Privacy Policy"
                        body="How StayKnown handles account, contact, location, chat, media, payment, retention, and lawful request data."
                      />
                      <LinkCard
                        href="/retention"
                        title="Data Retention"
                        body="Detailed retention rules for safety logs, contact approvals, location records, chat metadata, media, and legal holds."
                      />
                    </div>
                  </section>

                  <section id="law" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      13) Legal requests and cooperation
                    </H2>
                    <P>
                      StayKnown may preserve records and cooperate with valid
                      legal process where required or appropriate, especially
                      where reports involve child safety, exploitation,
                      grooming, trafficking, kidnapping, credible threats,
                      fraud, or imminent harm.
                    </P>
                    <UL
                      items={[
                        "StayKnown may respond to valid legal process as required by applicable law.",
                        "StayKnown may preserve relevant records where required or reasonably needed to investigate abuse or threats.",
                        "StayKnown may disclose information if necessary to comply with law, enforce policies, protect rights and safety, prevent fraud, or prevent harm.",
                        "StayKnown does not support covert surveillance or unlawful monitoring of minors.",
                        "StayKnown may reject, narrow, or question requests that are overbroad, unlawful, unsafe, unclear, or connected to misuse.",
                      ]}
                    />
                    <LinkCard
                      href="/law"
                      title="Law Enforcement & Emergency Requests"
                      body="Dedicated policy for official requests, emergency disclosure, preservation, legal process, and user notice."
                    />
                  </section>

                  <section id="contact" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ReportIcon className="h-4 w-4" />}>
                      14) Contact and related policies
                    </H2>
                    <P>
                      For child safety concerns, guardian questions, minor-use
                      issues, abuse reports, privacy requests, or legal
                      concerns, use the proper StayKnown support route.
                    </P>
                    <UL
                      items={[
                        "Support: support@stay-known.com",
                        "If there is immediate danger, contact the official local emergency number or appropriate child-safety authority first.",
                        "Use Abuse Reporting for unsafe contact, impersonation, harassment, grooming concerns, false emergencies, or minor-related misuse.",
                        "Use Law Enforcement & Emergency Requests for official requests, emergency preservation, legal process, or urgent child-safety concerns.",
                        "Use Security Disclosure for vulnerability reports or platform-integrity concerns.",
                      ]}
                    />

                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/terms"
                        title="Terms of Service"
                        body="Main agreement for accounts, lawful use, safety limits, subscriptions, enforcement, and liability limits."
                      />
                      <LinkCard
                        href="/safety"
                        title="Safety & Anti-Stalking"
                        body="Anti-stalking, anti-harassment, anti-coercion, false emergency, and trusted-contact safety rules."
                      />
                      <LinkCard
                        href="/acceptable-use"
                        title="Acceptable Use"
                        body="Detailed prohibited-use rules for accounts, chat, media, stories, location, alerts, and contact features."
                      />
                      <LinkCard
                        href="/location-safety"
                        title="Location & Live Safety"
                        body="Visit sessions, LIVE sharing, SOS, manual capture, chat maps, VPN gates, and accuracy limits."
                      />
                      <LinkCard
                        href="/contact-consent"
                        title="Contact Approval & Consent"
                        body="Approved contacts, SOS responders, consent records, blocked-add settings, and removal rights."
                      />
                      <LinkCard
                        href="/emergency"
                        title="Emergency Disclaimer"
                        body="StayKnown is not official emergency services in Nigeria, the U.S., U.K./EU, or any country."
                      />
                    </div>
                  </section>

                  <section className="space-y-3 rounded-[1.6rem] border border-black/10 bg-black/[0.025] p-5 dark:border-white/10 dark:bg-white/[0.03]">
                    <H2>15) Changes to this Child Safety & Minor Use Policy</H2>
                    <P>
                      StayKnown may update this policy to reflect new safety
                      features, age rules, guardian-consent requirements, chat
                      features, location features, abuse patterns, legal
                      requirements, country-specific expectations, or
                      operational needs. If updates are material, StayKnown may
                      provide notice through the app, website, email, or another
                      reasonable method.
                    </P>
                  </section>

                  <section className="space-y-3 rounded-[1.6rem] border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.035]">
                    <H2>Appendix A — In-app short minor-use notice</H2>
                    <P>
                      StayKnown is for lawful, safety-focused use only. Under 13
                      users are not permitted. Ages 13–15 may use StayKnown only
                      with active parent or legal guardian permission and
                      supervision. Ages 16–17 may use StayKnown with parent or
                      guardian permission or consent where required. StayKnown
                      must never be used to target, exploit, groom, threaten,
                      shame, secretly monitor, or control a minor. If immediate
                      danger exists, contact the official local emergency number
                      or appropriate child-safety authority first.
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
