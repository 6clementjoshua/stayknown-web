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
      "StayKnown Data Retention Policy | Safety Logs, Location Records, SOS, Chat, Abuse Reports & Legal Holds";

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
      "Read the StayKnown Data Retention Policy covering safety logs, live location records, SOS alerts, manual capture, approved contacts, chat metadata, abuse reports, security logs, deletion requests, legal holds, and Nigeria/global compliance.",
    );
    upsertMeta(
      "keywords",
      "StayKnown data retention policy, safety app logs, location retention, SOS retention, chat metadata retention, abuse report records, legal hold safety app, Nigeria safety app data, privacy deletion request, emergency contact app records",
    );
    upsertMeta("robots", "index, follow");
    upsertMeta("author", "6 Clement Joshua");
    upsertProperty(
      "og:title",
      "StayKnown Data Retention Policy | Safety Logs, Location, SOS & Legal Holds",
    );
    upsertProperty(
      "og:description",
      "How StayKnown may retain safety records, location data, contact approvals, chat metadata, abuse reports, payment records, security logs, and legal preservation records.",
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

function ArchiveIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M4.5 6.2c0-.95.78-1.7 1.72-1.7h11.56c.94 0 1.72.75 1.72 1.7v2.25h-15V6.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M6 8.45h12v9.35c0 1-.8 1.8-1.8 1.8H7.8c-1 0-1.8-.8-1.8-1.8V8.45Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 12h5.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
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

function WalletIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M4.6 7.2c0-1.1.9-2 2-2h10.8c1.1 0 2 .9 2 2v9.6c0 1.1-.9 2-2 2H6.6c-1.1 0-2-.9-2-2V7.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M4.8 9.3h14.4" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M15.3 14.1h1.9"
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
  tone?: "normal" | "danger" | "safe" | "law" | "retention" | "billing";
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
        tone === "retention" &&
          "border-violet-600/20 bg-violet-500/[0.07] dark:border-violet-300/20 dark:bg-violet-300/[0.07]",
        tone === "billing" &&
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

function RetentionIllustration() {
  return (
    <div className="relative mx-auto h-[280px] w-[190px] md:h-[320px] md:w-[220px]">
      <div className="absolute inset-0 animate-[softPulse_4s_ease-in-out_infinite] rounded-[2.2rem] bg-violet-400/15 blur-2xl" />
      <div className="relative h-full w-full rounded-[2rem] border border-black/15 bg-white/75 p-3 shadow-2xl backdrop-blur dark:border-white/15 dark:bg-white/[0.055]">
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-black/20 dark:bg-white/20" />
        <div className="rounded-[1.5rem] border border-black/10 bg-gradient-to-b from-white to-zinc-100 p-4 dark:border-white/10 dark:from-white/[0.10] dark:to-white/[0.03]">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-black text-white dark:bg-white dark:text-black">
              <ArchiveIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-black tracking-[0.18em] text-zinc-500 dark:text-white/35">
                RECORD SAFETY
              </div>
              <div className="text-[13px] font-black text-zinc-950 dark:text-white">
                Retention Balance
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {[
              ["Keep what matters", "Safety history and audits"],
              ["Limit exposure", "No unnecessary hoarding"],
              ["Preserve if needed", "Legal and abuse review"],
              ["Delete when allowed", "Rights with safety limits"],
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
            Records governed
          </div>
          <div className="h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_14px_rgba(139,92,246,0.9)]" />
        </div>
      </div>
    </div>
  );
}

export default function RetentionPage() {
  const { theme, setTheme } = useThemeMode();
  useSeoMeta();

  const nav = useMemo(
    () =>
      [
        ["summary", "Summary"],
        ["principles", "Principles"],
        ["categories", "Records"],
        ["purpose", "Why retention"],
        ["location", "Location"],
        ["notifications", "Contacts"],
        ["chat", "Chat & media"],
        ["payments", "Payments"],
        ["abuse", "Abuse prevention"],
        ["legal", "Legal holds"],
        ["deletion", "Deletion"],
        ["minors", "Minors"],
        ["security", "Security logs"],
        ["global", "Nigeria & global"],
        ["limits", "Limits"],
        ["contact", "Contact"],
      ] as const,
    [],
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "StayKnown Data Retention Policy",
    dateModified: UPDATED_AT,
    version: VERSION,
    publisher: {
      "@type": "Organization",
      name: "StayKnown",
      brand: "A 6 Clement Joshua service™",
      url: "https://stay-known.com",
    },
    description:
      "Data Retention Policy for StayKnown covering safety logs, account data, location records, Visit sessions, SOS alerts, manual capture, contacts, notifications, chat, media, abuse reports, security logs, payment records, deletion requests, legal preservation, and Nigeria/global compliance.",
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
                    <Pill>Data Retention</Pill>
                    <Pill>Safety Logs</Pill>
                    <Pill>Legal Preservation</Pill>
                  </div>

                  <h1 className="mt-5 max-w-3xl text-[30px] font-black tracking-[-0.045em] text-zinc-950 dark:text-white/95 md:text-[46px] md:leading-[1.02]">
                    StayKnown Data Retention Policy for safety records, location
                    logs, abuse reports, and legal holds.
                  </h1>

                  <p className="mt-5 max-w-3xl text-[14.5px] font-semibold leading-relaxed text-zinc-700 dark:text-white/62 md:text-[15px]">
                    This policy explains why StayKnown may retain certain
                    records, what kinds of records may be retained, how
                    retention supports safety and abuse prevention, how deletion
                    requests are handled, and when legal preservation or longer
                    retention may apply.
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

                <RetentionIllustration />
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
              <aside className="border-b border-black/10 bg-black/[0.02] p-5 dark:border-white/10 dark:bg-black/20 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:p-6">
                <div className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-white/35">
                  On this page
                </div>

                <nav
                  aria-label="Data Retention Policy sections"
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
                    <ArchiveIcon className="h-4 w-4" />
                    Retention balance
                  </div>
                  <p className="mt-2 text-[12px] font-semibold leading-relaxed text-zinc-700 dark:text-white/55">
                    StayKnown should not keep everything forever, but some
                    safety records may need to remain for history, abuse
                    prevention, security, legal compliance, and user protection.
                  </p>
                </div>
              </aside>

              <div className="p-5 md:p-8">
                <div className="space-y-8">
                  <section id="summary" className="scroll-mt-24 space-y-4">
                    <H2 icon={<ArchiveIcon className="h-4 w-4" />}>
                      1) Retention summary
                    </H2>
                    <P>
                      StayKnown is a safety and communication service. Some
                      records may be needed after a safety event ends because
                      users may need history, contacts may need context, support
                      may need to troubleshoot delivery, and safety review may
                      need records to investigate misuse. Retention does not
                      mean StayKnown keeps every possible record forever.
                    </P>

                    <div className="grid gap-3 md:grid-cols-3">
                      <Callout
                        title="Safety purpose"
                        body="Records may be retained to provide history, investigate misuse, resolve disputes, support safety auditing, and comply with law."
                        tone="retention"
                        icon={<ArchiveIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="Privacy balance"
                        body="Keeping records unnecessarily creates privacy risk, so retention should be tied to a lawful and safety-focused purpose."
                        tone="safe"
                        icon={<ShieldIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="Deletion can have limits"
                        body="Deletion requests may be limited by safety, legal, fraud-prevention, child-safety, security, or dispute needs."
                        tone="law"
                        icon={<LockIcon className="h-5 w-5" />}
                      />
                    </div>
                  </section>

                  <section id="principles" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      2) Retention principles
                    </H2>
                    <UL
                      items={[
                        "Purpose-based retention: records should be retained only where reasonably connected to service operation, user history, safety, legal compliance, fraud prevention, support, dispute resolution, or platform integrity.",
                        "Safety-aware retention: emergency, SOS, location, contact-consent, abuse-report, and minor-safety records may need more careful handling.",
                        "Privacy-aware retention: records should not be kept longer than reasonably necessary unless legal, safety, security, or operational reasons require it.",
                        "Deletion with safeguards: user deletion requests may be honored where possible, but some records may need to remain where law, safety, fraud prevention, or abuse prevention requires it.",
                        "No covert tracking purpose: retaining records does not authorize stalking, hidden monitoring, harassment, or unlawful surveillance.",
                      ]}
                    />
                  </section>

                  <section id="categories" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ArchiveIcon className="h-4 w-4" />}>
                      3) Records StayKnown may retain
                    </H2>
                    <P>
                      The exact records available depend on the user’s plan,
                      device permissions, settings, region, feature use,
                      retention rules, provider behavior, and whether the record
                      was generated in the first place.
                    </P>

                    <H3>3.1 Account and profile records</H3>
                    <UL
                      items={[
                        "Account identifiers such as email, user ID, username, profile identifiers, and account metadata.",
                        "Profile information the user provides, such as display name, avatar, first name, last name, safety gallery information, and recognition-related content where enabled.",
                        "Account status, enforcement status, plan state, subscription state, and feature entitlements.",
                      ]}
                    />

                    <H3>3.2 Safety session records</H3>
                    <UL
                      items={[
                        "Visit start and stop events.",
                        "LIVE safety session state and related safety lifecycle events.",
                        "SOS activation, SOS state changes, notification attempts, and verified-stop events where available.",
                        "Manual Capture events and related safety update metadata.",
                        "History records shown to the user for review and safety awareness.",
                      ]}
                    />

                    <H3>3.3 Contact and notification records</H3>
                    <UL
                      items={[
                        "Trusted contact identifiers the user provides.",
                        "Contact approval, invite, acceptance, decline, expiration, removal, blocked-add, and consent-related records where applicable.",
                        "Notification delivery events, timestamps, alert types, delivery status, email metadata, and push metadata where available.",
                        "Support context needed to understand whether an alert was sent, delayed, failed, blocked, or delivered.",
                      ]}
                    />

                    <H3>
                      3.4 Chat, media, stories, stickers, and profile records
                    </H3>
                    <UL
                      items={[
                        "Message metadata, message content where retained, thread state, read/delivery status, reactions, reply metadata, and location context where supported.",
                        "Media, voice note, sticker, story, file, profile, and safety gallery references where enabled.",
                        "Translation metadata, source language, target language, translated text, or retry state where a translation feature is used.",
                        "Blocking, reporting, removal, and enforcement records connected to communication safety.",
                      ]}
                    />

                    <H3>
                      3.5 Security, device, network, VPN, and abuse-prevention
                      records
                    </H3>
                    <UL
                      items={[
                        "Rate-limit events, suspicious usage patterns, and anti-abuse signals.",
                        "Device, network, VPN, fake GPS, reliability, or platform-integrity signals where used for security or safety integrity.",
                        "Reports, enforcement actions, appeals, and support communications.",
                        "Logs needed to detect repeat abuse, harassment, fraud, stalking attempts, false alerts, or attempts to bypass safeguards.",
                      ]}
                    />
                  </section>

                  <section id="purpose" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      4) Why retention matters
                    </H2>
                    <P>
                      Safety products need a careful retention posture. Removing
                      every record immediately may harm users who need history,
                      prevent abuse review, or make it harder to respond to
                      legal requests. Keeping records unnecessarily may also
                      create privacy risk. StayKnown aims to balance both needs.
                    </P>
                    <UL
                      items={[
                        "To show users their own Visit, SOS, Manual Capture, and safety history.",
                        "To troubleshoot missed, delayed, or failed alerts.",
                        "To support contact approval and safety relationship review.",
                        "To investigate reports of stalking, harassment, false SOS events, fraud, contact abuse, or unsafe chat/media behavior.",
                        "To prevent repeat abuse by the same account, device, network, payment method, contact pattern, or identifier.",
                        "To comply with valid legal process, preservation requests, emergency safety review, tax obligations, payment records, or applicable law.",
                        "To resolve disputes, enforce policies, and protect users, contacts, minors, vulnerable people, and the public.",
                      ]}
                    />
                  </section>

                  <section id="location" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LocationIcon className="h-4 w-4" />}>
                      5) Location, Visit, LIVE, SOS, and manual capture records
                    </H2>
                    <P>
                      Location data is sensitive. StayKnown should only process
                      it where the user grants permission and where location is
                      needed for active safety features. Some location-related
                      records may be retained to support history, abuse
                      prevention, legal obligations, safety audits, and
                      troubleshooting.
                    </P>
                    <UL
                      items={[
                        "Visit sessions may retain start time, end time, state, destination context, and related safety events.",
                        "Location points may be retained where generated during active sessions and permitted by the user’s settings.",
                        "Readable place labels or reverse-geocoded context may be retained where created for a safety event.",
                        "Location accuracy, network reliability, VPN interruption, or device-permission state may be retained where relevant to safety integrity.",
                        "SOS and manual capture records may be retained because they can involve urgent safety context.",
                        "Location updates may be delayed, incomplete, or unavailable depending on device, GPS, battery, VPN, and network conditions.",
                      ]}
                    />
                    <Callout
                      title="No covert tracking purpose"
                      body="Retention of location-related records does not authorize stalking, secret monitoring, coercion, harassment, or tracking anyone without lawful basis and consent."
                      tone="danger"
                      icon={<AlertIcon className="h-5 w-5" />}
                    />
                    <LinkCard
                      href="/location-safety"
                      title="Location & Live Safety"
                      body="Detailed rules for Visit sessions, LIVE sharing, SOS, manual capture, chat maps, VPN gates, and accuracy limits."
                    />
                  </section>

                  <section
                    id="notifications"
                    className="scroll-mt-24 space-y-3"
                  >
                    <H2 icon={<ContactIcon className="h-4 w-4" />}>
                      6) Notifications, contacts, approval, and delivery records
                    </H2>
                    <P>
                      Notification records help users and support teams
                      understand what happened during safety events. For
                      example, a user may need to know whether an alert was
                      sent, failed, delayed, or delivered.
                    </P>
                    <UL
                      items={[
                        "StayKnown may retain contact identifiers selected by the user.",
                        "StayKnown may retain delivery attempts, timestamps, delivery status, and alert type.",
                        "StayKnown may retain email or push notification metadata needed for troubleshooting and abuse prevention.",
                        "StayKnown may retain contact approval records to confirm whether safety access was consent-based.",
                        "If a contact reports abuse, relevant contact and delivery records may be retained for review.",
                        "Blocked-add settings, removal records, and decline records may be retained to prevent repeated unwanted contact requests.",
                      ]}
                    />
                    <LinkCard
                      href="/contact-consent"
                      title="Contact Approval & Consent"
                      body="Rules for approved contacts, SOS responders, consent records, blocked-add settings, and removal rights."
                    />
                  </section>

                  <section id="chat" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ChatIcon className="h-4 w-4" />}>
                      7) Chat, stories, stickers, media, and profile records
                    </H2>
                    <P>
                      If StayKnown includes chat, stories, stickers, voice
                      notes, media, translation, or profile-trust features,
                      related records may be retained where needed to operate
                      the service, show user content, enforce policies, prevent
                      abuse, or comply with law.
                    </P>
                    <UL
                      items={[
                        "Message metadata may be retained to show conversations, delivery state, read/delivered status, reactions, reply context, or safety-related context.",
                        "Sticker, media, story, voice-note, file, safety-gallery, or profile records may be retained while the content is active or needed for account history.",
                        "Translation status, source language, target language, retry state, and translated text may be retained where the feature is used.",
                        "Reports involving chat, stories, stickers, media, or profile misuse may require preservation of relevant records.",
                        "Blocking, reporting, removal, and enforcement records may be retained to prevent repeated abuse.",
                        "Deleted or removed content may still have limited metadata, backups, abuse-review records, or legal-hold records retained where allowed or required.",
                      ]}
                    />
                    <Callout
                      title="Private communication still has policy boundaries"
                      body="Chat, stories, stickers, media, and profile features must not be used for harassment, threats, stalking, coercion, impersonation, exploitation, or unlawful exposure."
                      tone="law"
                      icon={<ShieldIcon className="h-5 w-5" />}
                    />
                  </section>

                  <section id="payments" className="scroll-mt-24 space-y-3">
                    <H2 icon={<WalletIcon className="h-4 w-4" />}>
                      8) Payment, subscription, wallet, receipt, and billing
                      records
                    </H2>
                    <P>
                      Payment and subscription records may be retained because
                      they can be needed for receipts, taxes, refunds,
                      chargebacks, fraud prevention, account support, and legal
                      compliance.
                    </P>
                    <UL
                      items={[
                        "Plan state, renewal state, expiry, downgrade, payment failure, and entitlement records may be retained.",
                        "Payment provider references, receipt metadata, transaction IDs, chargeback records, refund records, and support notes may be retained.",
                        "Wallet, coins, withdrawals, ledger entries, outbox records, and anti-fraud records may be retained where those features are available.",
                        "StayKnown does not need to retain full card numbers; payment providers may handle sensitive payment details under their own rules.",
                        "Payment-related deletion requests may be limited by tax, accounting, chargeback, fraud-prevention, dispute, and legal obligations.",
                      ]}
                    />
                    <LinkCard
                      href="/billing-policy"
                      title="Billing & Refunds"
                      body="Subscription, Pro, Pro Max, wallet, coins, receipts, payment failure, chargeback, cancellation, and refund guidance."
                    />
                  </section>

                  <section id="abuse" className="scroll-mt-24 space-y-3">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      9) Abuse prevention and enforcement retention
                    </H2>
                    <P>
                      Retention is important for stopping repeat abuse. A user
                      who abuses one account may attempt to return with another
                      account, device, contact list, payment method, or network.
                      Safety logs can help identify patterns without exposing
                      unnecessary data.
                    </P>
                    <UL
                      items={[
                        "Reports of stalking, harassment, contact abuse, fraud, false emergencies, threats, impersonation, or unsafe media may be retained.",
                        "Enforcement actions, warnings, restrictions, suspensions, bans, and appeals may be retained.",
                        "Suspicious device, network, payment, wallet, account, or identifier patterns may be retained where needed for safety and fraud prevention.",
                        "Records related to attempts to bypass plan limits, VPN rules, safety gates, contact approvals, device restrictions, or account restrictions may be retained.",
                        "Repeated mass messaging, unusual session behaviors, and reported abuse patterns may be retained for investigation.",
                      ]}
                    />
                    <LinkCard
                      href="/abuse"
                      title="Abuse Reporting"
                      body="How StayKnown reviews reports of stalking, harassment, false SOS, contact abuse, fraud, unsafe media, and safety misuse."
                    />
                  </section>

                  <section id="legal" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      10) Legal preservation, government requests, and legal
                      holds
                    </H2>
                    <P>
                      StayKnown may preserve or retain records where required by
                      law, valid legal process, emergency safety needs, abuse
                      investigation, fraud investigation, or official
                      preservation requests. Preservation does not automatically
                      mean disclosure.
                    </P>
                    <UL
                      items={[
                        "Records may be preserved when StayKnown receives a lawful preservation request.",
                        "Records may be preserved when there is credible risk of death, serious injury, kidnapping, trafficking, exploitation, fraud, child-safety concern, or imminent harm.",
                        "Records may be retained longer where needed to comply with law, court orders, regulatory requirements, tax requirements, accounting duties, or valid legal process.",
                        "StayKnown may disclose information if required by law or if necessary to protect rights and safety, prevent fraud, prevent harm, or enforce policies.",
                        "StayKnown does not support covert surveillance or unlawful monitoring.",
                        "Legal holds may delay deletion until the hold is released or the preservation need ends.",
                      ]}
                    />
                    <LinkCard
                      href="/law"
                      title="Law Enforcement & Emergency Requests"
                      body="Dedicated policy for official requests, emergency disclosures, preservation, legal process, and user notice."
                    />
                  </section>

                  <section id="deletion" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      11) Deletion requests and limits
                    </H2>
                    <P>
                      Users may request deletion where applicable. However,
                      deletion rights can be limited by legal, security, safety,
                      fraud prevention, child safety, abuse investigation,
                      dispute resolution, billing, tax, and platform-integrity
                      needs.
                    </P>
                    <UL
                      items={[
                        "Some records may need to be retained to comply with law.",
                        "Some records may need to be retained to investigate abuse, threats, fraud, stalking, false emergencies, or contact misuse.",
                        "Some records may need to be retained to enforce bans, device restrictions, payment restrictions, contact restrictions, or account restrictions.",
                        "Some records may need to be retained to resolve disputes, payment issues, refund issues, chargebacks, or support requests.",
                        "Some records may need to be retained to protect minors, vulnerable users, contacts, or the public.",
                        "Records that were never collected, were already deleted, or were not generated cannot be recovered later.",
                        "Backup copies may remain for a limited period until overwritten or expired according to operational systems.",
                      ]}
                    />
                    <Callout
                      title="Deletion contact"
                      body="For deletion or privacy requests, contact support@stay-known.com. StayKnown may need to verify your identity before acting on a request."
                      tone="retention"
                      icon={<ArchiveIcon className="h-5 w-5" />}
                    />
                    <LinkCard
                      href="/privacy"
                      title="Privacy Policy"
                      body="How StayKnown handles privacy rights, deletion requests, data processing, service providers, and lawful disclosures."
                    />
                  </section>

                  <section id="minors" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      12) Minor-related records
                    </H2>
                    <P>
                      Reports or records involving minors may require more
                      careful handling. StayKnown may preserve relevant records
                      where needed for child safety, abuse prevention, legal
                      compliance, emergency review, or guardian-related
                      disputes.
                    </P>
                    <UL
                      items={[
                        "Records involving suspected grooming, exploitation, coercion, trafficking, kidnapping, unsafe contact, or threats to a minor may be preserved.",
                        "Guardian consent and minor-use reports may be retained where relevant.",
                        "Deletion may be limited where records are needed to protect a minor or comply with legal obligations.",
                        "If a minor is in immediate danger, contact local emergency services or the proper local authority first.",
                      ]}
                    />
                    <LinkCard
                      href="/minors"
                      title="Child Safety & Minor Use"
                      body="Dedicated child, teen, guardian, school, family, and vulnerable-user safety policy."
                    />
                  </section>

                  <section id="security" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      13) Security logs and platform integrity
                    </H2>
                    <P>
                      Security logs help protect StayKnown, users, contacts, and
                      the public from misuse. Some security records may be
                      retained even after account changes or deletion requests
                      where retention is necessary for safety and platform
                      integrity.
                    </P>
                    <UL
                      items={[
                        "Authentication, device, network, and abuse-prevention signals may be retained where needed.",
                        "Rate limits, suspicious activity, blocked attempts, VPN safety gate events, fake GPS concerns, and fraud-prevention events may be retained.",
                        "Security reports and vulnerability communications may be retained to protect the Service.",
                        "Records related to reverse engineering, scraping, API abuse, bot activity, credential attacks, storage abuse, or bypass attempts may be retained.",
                        "Platform integrity records may be retained to prevent banned users, abusive devices, or fraudulent payment identifiers from returning.",
                      ]}
                    />
                    <LinkCard
                      href="/security"
                      title="Security Disclosure"
                      body="Responsible vulnerability reporting and platform-integrity route."
                    />
                  </section>

                  <section id="global" className="scroll-mt-24 space-y-3">
                    <H2 icon={<GlobeIcon className="h-4 w-4" />}>
                      14) Nigeria, United States, United Kingdom, EU, and global
                      retention
                    </H2>
                    <P>
                      Retention laws, privacy rights, emergency expectations,
                      tax obligations, child-safety rules, and legal process
                      requirements differ by country. StayKnown may adapt
                      retention handling to applicable law, user location, event
                      location, service availability, provider requirements, and
                      safety risk.
                    </P>

                    <H3>Nigeria retention language</H3>
                    <UL
                      items={[
                        "In Nigeria, StayKnown may retain safety, contact, location, abuse-report, support, and payment records where needed for lawful safety, dispute, fraud-prevention, or compliance purposes.",
                        "Network issues, power supply, road conditions, rural coverage, device quality, and provider delays may affect whether records exist or how complete they are.",
                        "If immediate danger exists, use appropriate local channels, which may include trusted family, local police, medical help, FRSC, NSCDC, NEMA, state emergency agencies, private security, child-safety authorities, or nearby responsible responders depending on the situation.",
                        "StayKnown does not replace Nigerian police, ambulance, hospitals, fire service, road safety, civil defence, disaster management, child-protection authorities, or any official authority.",
                      ]}
                    />

                    <H3>United States, U.K./EU, and other countries</H3>
                    <UL
                      items={[
                        "In the United States, retention may be affected by state privacy laws, legal holds, law-enforcement process, child-safety concerns, fraud-prevention needs, billing requirements, and tax obligations.",
                        "In the U.K. and EU, retention may be affected by data minimization, lawful basis, user rights, legal obligations, legitimate interests, and child-safety responsibilities.",
                        "In any country, StayKnown may limit deletion or preserve records where law, safety, security, child protection, fraud prevention, or legal process requires it.",
                        "Users and contacts must not treat retention records as permission for stalking, harassment, coercion, retaliation, or unlawful surveillance.",
                      ]}
                    />
                  </section>

                  <section id="limits" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ArchiveIcon className="h-4 w-4" />}>
                      15) Retention limits and practical expectations
                    </H2>
                    <P>
                      StayKnown may not always have every record a user,
                      contact, support person, lawyer, regulator, or authority
                      expects. Records depend on technical generation, feature
                      use, permissions, network state, retention schedules,
                      provider systems, and legal requirements.
                    </P>
                    <UL
                      items={[
                        "If location permission was off, location records may not exist.",
                        "If a notification failed before delivery metadata was created, the record may be limited.",
                        "If a user did not start a Visit, SOS, chat, story, or manual capture, related records may not exist.",
                        "If a record has expired under retention rules and was not preserved, it may not be available.",
                        "If a device was offline, data may be delayed, incomplete, or missing.",
                        "If a third-party provider failed, deleted, rejected, or did not create a record, StayKnown may not have that provider-level information.",
                      ]}
                    />
                    <Example
                      title="Simple examples"
                      items={[
                        "A user may see old Visit history because safety history is retained for review.",
                        "A reported contact-abuse pattern may be retained to prevent the same person from repeating the behavior.",
                        "A legal preservation request may prevent deletion of relevant logs while the matter is reviewed.",
                        "A deleted chat item may still have limited metadata retained if needed for abuse prevention or legal compliance.",
                        "A payment receipt may be retained for accounting, tax, chargeback, or refund purposes even after account deletion.",
                      ]}
                    />
                  </section>

                  <section id="contact" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ArchiveIcon className="h-4 w-4" />}>
                      16) Contact and related policies
                    </H2>
                    <P>
                      For privacy, deletion, retention, legal preservation,
                      billing records, or abuse reporting questions, contact
                      StayKnown support. If you are reporting immediate danger,
                      contact your local emergency number or proper local
                      authority first.
                    </P>
                    <UL
                      items={[
                        "Support: support@stay-known.com",
                        "Use Abuse Reporting for stalking, harassment, unwanted contact, false emergencies, impersonation, unsafe media, or safety misuse.",
                        "Use Law Enforcement & Emergency Requests for official requests, preservation, emergency disclosure, or urgent legal concerns.",
                        "Use Security Disclosure for vulnerability reports or platform-integrity concerns.",
                      ]}
                    />

                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/privacy"
                        title="Privacy Policy"
                        body="How StayKnown processes account, location, contact, chat, media, payment, retention, and lawful request data."
                      />
                      <LinkCard
                        href="/terms"
                        title="Terms of Service"
                        body="Main agreement for accounts, lawful use, safety limits, subscriptions, enforcement, and liability limits."
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
                        href="/abuse"
                        title="Abuse Reporting"
                        body="Report stalking, harassment, false SOS, unwanted contact, impersonation, fraud, or unsafe behavior."
                      />
                      <LinkCard
                        href="/law"
                        title="Law Enforcement & Emergency Requests"
                        body="Official request handling, emergency disclosure, legal preservation, and user notice rules."
                      />
                    </div>
                  </section>

                  <section className="space-y-3 rounded-[1.6rem] border border-black/10 bg-black/[0.025] p-5 dark:border-white/10 dark:bg-white/[0.03]">
                    <H2>17) Changes to this Data Retention Policy</H2>
                    <P>
                      StayKnown may update this policy to reflect new features,
                      retention schedules, provider changes, legal requirements,
                      billing flows, safety improvements, country-specific
                      expectations, or operational needs. If updates are
                      material, StayKnown may provide notice through the app,
                      website, email, or another reasonable method.
                    </P>
                  </section>

                  <section className="space-y-3 rounded-[1.6rem] border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.035]">
                    <H2>Appendix A — In-app short retention notice</H2>
                    <P>
                      StayKnown may retain account records, safety session
                      records, location records, notification records, contact
                      approval records, chat/media metadata, security logs,
                      payment records, support records, and abuse reports where
                      reasonably needed to operate the Service, provide history,
                      prevent abuse, resolve disputes, protect users, comply
                      with law, preserve records, or support safety auditing.
                      Deletion requests may be limited where records are needed
                      for legal, safety, fraud-prevention, payment,
                      child-safety, security, or abuse-review reasons. StayKnown
                      does not sell personal data and does not support covert
                      surveillance.
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
