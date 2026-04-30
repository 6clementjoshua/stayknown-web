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
      "StayKnown Security Disclosure & Platform Integrity | Vulnerability Reports, VPN, API, Location & Safety Controls";

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
      "Read the StayKnown Security Disclosure & Platform Integrity Policy covering vulnerability reporting, good-faith research, API abuse, VPN integrity, fake GPS, location safety, chat/media security, payments, notifications, minors, legal cooperation, and Nigeria/global security expectations.",
    );
    upsertMeta(
      "keywords",
      "StayKnown security disclosure, platform integrity policy, vulnerability reporting, safety app security, VPN safety gate, fake GPS detection, API abuse prevention, chat media security, location integrity, Nigeria safety app security, responsible disclosure",
    );
    upsertMeta("robots", "index, follow");
    upsertMeta("author", "6 Clement Joshua");
    upsertProperty(
      "og:title",
      "StayKnown Security Disclosure & Platform Integrity | Responsible Reporting",
    );
    upsertProperty(
      "og:description",
      "How StayKnown handles responsible vulnerability reports, prohibited testing, account security, device integrity, VPN checks, API abuse, payments, chat/media security, and safety-platform enforcement.",
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

function SecurityIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 3.3 19.2 6v5.45c0 4.55-2.92 8.55-7.2 9.95-4.28-1.4-7.2-5.4-7.2-9.95V6L12 3.3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 12.4 11 14.2l3.9-4.35"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BugIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M8.2 9.3a3.8 3.8 0 0 1 7.6 0v6.2a3.8 3.8 0 0 1-7.6 0V9.3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 5.2 7.4 3.4M14.8 5.2l1.8-1.8M4.4 10.2h3.8M15.8 10.2h3.8M4.4 15h3.8M15.8 15h3.8M12 9.3v10M8.9 7.2h6.2"
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
  tone?: "normal" | "danger" | "safe" | "security" | "law" | "report";
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
        tone === "security" &&
          "border-cyan-600/20 bg-cyan-500/[0.07] dark:border-cyan-300/20 dark:bg-cyan-300/[0.07]",
        tone === "law" &&
          "border-sky-700/20 bg-sky-700/[0.055] dark:border-sky-300/20 dark:bg-sky-300/[0.07]",
        tone === "report" &&
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_15%_20%,rgba(6,182,212,0.12),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(16,185,129,0.10),transparent_25%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_15%_20%,rgba(6,182,212,0.10),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(16,185,129,0.08),transparent_25%)]" />
      <div className="absolute left-[7%] top-[18%] h-48 w-48 animate-[floatSlow_9s_ease-in-out_infinite] rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute right-[8%] top-[32%] h-56 w-56 animate-[floatSlow_11s_ease-in-out_infinite_reverse] rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="absolute bottom-[8%] left-[30%] h-60 w-60 animate-[floatSlow_13s_ease-in-out_infinite] rounded-full bg-white/8 blur-3xl" />
    </div>
  );
}

function SecurityIllustration() {
  return (
    <div className="relative mx-auto h-[280px] w-[190px] md:h-[320px] md:w-[220px]">
      <div className="absolute inset-0 animate-[softPulse_4s_ease-in-out_infinite] rounded-[2.2rem] bg-cyan-400/15 blur-2xl" />
      <div className="relative h-full w-full rounded-[2rem] border border-black/15 bg-white/75 p-3 shadow-2xl backdrop-blur dark:border-white/15 dark:bg-white/[0.055]">
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-black/20 dark:bg-white/20" />
        <div className="rounded-[1.5rem] border border-black/10 bg-gradient-to-b from-white to-zinc-100 p-4 dark:border-white/10 dark:from-white/[0.10] dark:to-white/[0.03]">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-black text-white dark:bg-white dark:text-black">
              <SecurityIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-black tracking-[0.18em] text-zinc-500 dark:text-white/35">
                SECURITY
              </div>
              <div className="text-[13px] font-black text-zinc-950 dark:text-white">
                Platform Integrity
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {[
              ["Report privately", "Responsible disclosure"],
              ["No user harm", "Do not touch real data"],
              ["Protect location", "No fake GPS or bypass"],
              ["Secure safety", "Do not disrupt alerts"],
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
            Integrity active
          </div>
          <div className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_14px_rgba(6,182,212,0.9)]" />
        </div>
      </div>
    </div>
  );
}

export default function SecurityPage() {
  const { theme, setTheme } = useThemeMode();
  useSeoMeta();

  const nav = useMemo(
    () =>
      [
        ["summary", "Summary"],
        ["principles", "Principles"],
        ["reporting", "Report"],
        ["safeharbor", "Good-faith research"],
        ["prohibited", "Prohibited testing"],
        ["account", "Account"],
        ["device", "Device"],
        ["location", "Location"],
        ["vpn", "VPN"],
        ["api", "API"],
        ["chat", "Chat/media"],
        ["payments", "Payments"],
        ["contacts", "Contacts"],
        ["data", "Data boundaries"],
        ["monitoring", "Monitoring"],
        ["incidents", "Incidents"],
        ["users", "User duties"],
        ["minors", "Minors"],
        ["global", "Nigeria & global"],
        ["law", "Legal"],
        ["contact", "Contact"],
      ] as const,
    [],
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "StayKnown Security Disclosure & Platform Integrity Policy",
    dateModified: UPDATED_AT,
    version: VERSION,
    publisher: {
      "@type": "Organization",
      name: "StayKnown",
      brand: "A 6 Clement Joshua service™",
      url: "https://stay-known.com",
    },
    description:
      "Security Disclosure and Platform Integrity Policy for StayKnown covering responsible vulnerability reporting, good-faith research, prohibited testing, account security, device integrity, location integrity, VPN checks, API abuse, chat/media security, payments, contacts, minors, legal cooperation, and Nigeria/global security expectations.",
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
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(6,182,212,0.16),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.14),transparent_28%)]" />

              <div className="relative grid gap-8 md:grid-cols-[1fr_260px] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill>Security Disclosure</Pill>
                    <Pill>Platform Integrity</Pill>
                    <Pill>Responsible Reporting</Pill>
                  </div>

                  <h1 className="mt-5 max-w-3xl text-[30px] font-black tracking-[-0.045em] text-zinc-950 dark:text-white/95 md:text-[46px] md:leading-[1.02]">
                    StayKnown Security Disclosure & Platform Integrity Policy
                    for responsible vulnerability reporting and safety-system
                    protection.
                  </h1>

                  <p className="mt-5 max-w-3xl text-[14.5px] font-semibold leading-relaxed text-zinc-700 dark:text-white/62 md:text-[15px]">
                    Security matters because StayKnown may involve Visit
                    sessions, LIVE safety sharing, SOS alerts, trusted contacts,
                    location context, Safety Gallery images, chat, stories,
                    stickers, translation, payments, device checks, and
                    abuse-prevention signals.
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

                <SecurityIllustration />
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
              <aside className="border-b border-black/10 bg-black/[0.02] p-5 dark:border-white/10 dark:bg-black/20 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:p-6">
                <div className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-white/35">
                  On this page
                </div>

                <nav
                  aria-label="Security Disclosure and Platform Integrity Policy sections"
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

                <div className="mt-6 rounded-[1.4rem] border border-cyan-500/20 bg-cyan-500/[0.06] p-4 dark:border-cyan-300/20 dark:bg-cyan-300/[0.07]">
                  <div className="flex items-center gap-2 text-[12px] font-black text-zinc-950 dark:text-white/86">
                    <SecurityIcon className="h-4 w-4" />
                    Security is safety
                  </div>
                  <p className="mt-2 text-[12px] font-semibold leading-relaxed text-zinc-700 dark:text-white/55">
                    Do not bypass security controls, abuse APIs, manipulate
                    location, attack devices, interfere with notifications, or
                    test the Service in ways that put people at risk.
                  </p>
                </div>
              </aside>

              <div className="p-5 md:p-8">
                <div className="space-y-8">
                  <section id="summary" className="scroll-mt-24 space-y-4">
                    <H2 icon={<SecurityIcon className="h-4 w-4" />}>
                      1) Security summary
                    </H2>
                    <P>
                      StayKnown uses security and integrity controls to protect
                      users, contacts, minors, safety sessions, account access,
                      location reliability, notifications, payments, and
                      abuse-prevention systems. This policy explains how
                      security reports should be handled and what behavior is
                      prohibited.
                    </P>

                    <div className="grid gap-3 md:grid-cols-3">
                      <Callout
                        title="Report privately"
                        body="Security findings should be sent to support@stay-known.com before any public disclosure."
                        tone="report"
                        icon={<BugIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="Do no harm"
                        body="Testing must never expose user data, interrupt SOS, break live location, spam contacts, or harm a person."
                        tone="safe"
                        icon={<ShieldIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="No bypass abuse"
                        body="Do not bypass VPN gates, fake GPS controls, plan limits, contact approval, chat safety, payments, or security checks."
                        tone="danger"
                        icon={<AlertIcon className="h-5 w-5" />}
                      />
                    </div>
                  </section>

                  <section id="principles" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      2) Security principles
                    </H2>
                    <UL
                      items={[
                        "Protect safety first: security testing must never endanger a user, contact, minor, responder, or the public.",
                        "Respect privacy: do not access, copy, expose, change, delete, or share data that does not belong to you.",
                        "Respect consent: do not test against another person’s account, device, contact list, live link, media, chat, or safety session without permission.",
                        "Minimize harm: stop testing immediately if you discover a weakness that could expose people or disrupt safety features.",
                        "Report privately: send security findings to support@stay-known.com and allow review before public disclosure.",
                        "No abuse: security research must not become stalking, harassment, fraud, extortion, scraping, spam, or service disruption.",
                      ]}
                    />
                  </section>

                  <section id="reporting" className="scroll-mt-24 space-y-3">
                    <H2 icon={<BugIcon className="h-4 w-4" />}>
                      3) Reporting vulnerabilities
                    </H2>
                    <P>
                      If you believe you found a security vulnerability, report
                      it privately and clearly.
                    </P>

                    <Callout
                      title="Security contact"
                      body="support@stay-known.com"
                      tone="report"
                      icon={<ReportIcon className="h-5 w-5" />}
                    />

                    <UL
                      items={[
                        "Use the subject line: Security Disclosure — StayKnown.",
                        "Describe the issue, affected page, app, API, backend, storage bucket, Edge Function, payment flow, chat flow, map flow, or feature.",
                        "Explain the likely security or safety impact.",
                        "Include safe reproduction steps that do not expose another user’s data.",
                        "Include screenshots, logs, request IDs, timestamps, test account IDs, browser/device details, or app version if safe.",
                        "Do not include personal data belonging to other users unless absolutely necessary to explain the risk.",
                        "Do not publicly disclose sensitive details before StayKnown has had time to investigate.",
                      ]}
                    />

                    <Example
                      title="Useful report examples"
                      items={[
                        "A route exposes data without authentication.",
                        "A signed live-map link can be reused outside its intended limits.",
                        "A user can access another user’s Safety Gallery image.",
                        "A chat media URL can be opened without permission.",
                        "A rate limit can be bypassed to send excessive alerts.",
                        "A payment webhook or receipt flow can be manipulated.",
                      ]}
                    />
                  </section>

                  <section id="safeharbor" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      4) Good-faith security research
                    </H2>
                    <P>
                      Good-faith research means testing in a way that is
                      limited, responsible, lawful, privacy-preserving, and
                      safe. StayKnown values reports that help protect users
                      without causing harm.
                    </P>
                    <UL
                      items={[
                        "Use only accounts, devices, contacts, media, sessions, payments, and data you own or have explicit permission to test.",
                        "Keep testing limited to the minimum needed to prove the issue.",
                        "Avoid service disruption, bulk traffic, spam, false SOS, mass contact alerts, or automated attacks.",
                        "Stop immediately if you access another person’s data or affect safety features.",
                        "Report promptly and privately.",
                        "Do not demand payment, threaten disclosure, or use the issue for leverage.",
                      ]}
                    />
                    <Callout
                      title="No public bounty promise"
                      body="This policy does not create a guaranteed bug bounty, reward, contract, employment relationship, authorization to access data, or immunity. StayKnown may still take action against harmful or unlawful activity."
                      tone="law"
                      icon={<LockIcon className="h-5 w-5" />}
                    />
                  </section>

                  <section id="prohibited" className="scroll-mt-24 space-y-3">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      5) Prohibited security testing and misuse
                    </H2>
                    <P>
                      The following conduct is not allowed, even if described as
                      research.
                    </P>
                    <UL
                      items={[
                        "Accessing, copying, changing, deleting, or exposing another user’s data.",
                        "Testing against accounts, devices, contacts, live sessions, minors, or safety flows without permission.",
                        "Triggering false SOS alerts, fake Visit sessions, fake Manual Captures, or misleading notifications.",
                        "Sending spam, mass alerts, mass emails, repeated notifications, or mass contact requests.",
                        "Testing that interrupts Visit, LIVE, SOS, chat, notification, payment, wallet, or contact approval flows.",
                        "Denial-of-service attacks, load testing, stress testing, brute forcing, credential stuffing, scraping, or automated abuse.",
                        "Reverse engineering, bypassing device integrity checks, fake GPS/spoofing, VPN bypass abuse, emulator misuse, bot activity, or API abuse.",
                        "Attempting to defeat plan limits, rate limits, subscription checks, wallet rules, payment verification, or premium gates.",
                        "Attempting to bypass block/report restrictions, consent flows, contact approvals, child safety protections, or anti-stalking controls.",
                        "Publicly disclosing exploitable details before StayKnown can investigate and mitigate.",
                      ]}
                    />
                  </section>

                  <section id="account" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      6) Account and identity security
                    </H2>
                    <P>
                      Users are responsible for keeping account access secure.
                      StayKnown may use authentication, device, session, and
                      abuse-prevention controls to protect accounts.
                    </P>
                    <UL
                      items={[
                        "Do not share passwords, login links, one-time codes, recovery codes, or account access.",
                        "Keep your email account secure because it may be used for account recovery or important notifications.",
                        "Use a secure device lock and avoid leaving your device unlocked around people you do not trust.",
                        "Do not impersonate another user, contact, guardian, responder, support agent, emergency official, law enforcement officer, or StayKnown staff.",
                        "Do not create accounts for scams, stalking, harassment, fraud, false emergencies, or bypassing bans.",
                        "Report unauthorized access or suspicious account activity immediately.",
                      ]}
                    />
                  </section>

                  <section id="device" className="scroll-mt-24 space-y-3">
                    <H2 icon={<SecurityIcon className="h-4 w-4" />}>
                      7) Device and app integrity
                    </H2>
                    <P>
                      StayKnown safety features depend on honest device state,
                      operating system permissions, network conditions, and user
                      behavior.
                    </P>
                    <UL
                      items={[
                        "Do not tamper with the app, modify app code, patch runtime behavior, inject tools, hook functions, or alter network calls.",
                        "Do not use fake GPS, spoofed sensors, rooted/jailbroken manipulation, emulator abuse, automation, or scripts to mislead safety features.",
                        "Do not bypass biometric/device-level protection where required.",
                        "Do not interfere with push notifications, background location, Visit state, SOS state, manual capture state, or location updates.",
                        "Do not use another person’s device to start, stop, or manipulate safety sessions without authorization.",
                        "Keep your phone, browser, operating system, and app updated for security and reliability.",
                      ]}
                    />
                  </section>

                  <section id="location" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LocationIcon className="h-4 w-4" />}>
                      8) Location integrity and safety signals
                    </H2>
                    <P>
                      Location integrity is critical to StayKnown. Users must
                      not manipulate location or reliability signals to mislead
                      contacts, responders, support, or the platform.
                    </P>
                    <UL
                      items={[
                        "Do not spoof location, fake route movement, or create false safety records.",
                        "Do not interfere with location permissions to mislead contacts during a safety event.",
                        "Do not use fake location tools, automation, emulators, modified apps, or network manipulation to deceive StayKnown.",
                        "Do not use location metadata to stalk, threaten, shame, expose, punish, or control another person.",
                        "Treat location and time data as approximate and subject to network/device delay.",
                        "If location is wrong during a safety event, use direct communication and emergency services where needed.",
                      ]}
                    />
                    <LinkCard
                      href="/location-safety"
                      title="Location & Live Safety"
                      body="Rules for Visit sessions, LIVE sharing, SOS, manual capture, chat maps, VPN gates, location accuracy, and map limitations."
                    />
                  </section>

                  <section id="vpn" className="scroll-mt-24 space-y-3">
                    <H2 icon={<GlobeIcon className="h-4 w-4" />}>
                      9) VPN, network, and reliability integrity
                    </H2>
                    <P>
                      StayKnown may warn, restrict, or block certain flows when
                      VPN or network behavior affects safety reliability, abuse
                      prevention, or location confidence.
                    </P>
                    <UL
                      items={[
                        "Do not use VPN, proxies, Tor-like routing, network manipulation, or high-risk network tools to bypass restrictions.",
                        "Do not use VPN to hide abusive behavior, avoid enforcement, manipulate location reliability, or bypass region/payment/security controls.",
                        "Do not bypass app-launch VPN checks, chat VPN gates, live-map rules, or mid-Visit VPN disruption rules.",
                        "Do not use network tools to intercept, replay, forge, alter, or modify StayKnown requests.",
                        "Do not interfere with email delivery, push notifications, live links, map links, payment callbacks, webhook verification, or alert delivery.",
                        "Mid-Visit VPN activation may disrupt safety confidence and may trigger warning or stop behavior where configured.",
                      ]}
                    />
                  </section>

                  <section id="api" className="scroll-mt-24 space-y-3">
                    <H2 icon={<BugIcon className="h-4 w-4" />}>
                      10) API, automation, and abuse controls
                    </H2>
                    <P>
                      StayKnown may apply rate limits, device checks, API
                      controls, plan limits, storage policies, and anti-abuse
                      protections to maintain safety and reliability.
                    </P>
                    <UL
                      items={[
                        "Do not abuse APIs, scrape data, enumerate users, or probe private endpoints.",
                        "Do not automate account creation, contact invites, alerts, chat messages, stickers, media uploads, story posts, reports, payments, or withdrawals.",
                        "Do not bypass rate limits, quota limits, plan gates, subscription checks, or paid feature restrictions.",
                        "Do not interfere with Supabase, Edge Functions, storage, signed URLs, email systems, push systems, translation systems, payment systems, or map/live-link routes.",
                        "Do not attempt to discover private buckets, storage paths, message IDs, user IDs, token formats, webhook secrets, or link signatures by brute force.",
                        "Do not use bots to spam reports, contacts, messages, alerts, approvals, payments, or support.",
                      ]}
                    />
                  </section>

                  <section id="chat" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ChatIcon className="h-4 w-4" />}>
                      11) Chat, stories, stickers, voice, and media security
                    </H2>
                    <P>
                      Chat and media features may carry private communication
                      and safety context. They must not be abused, attacked, or
                      bypassed.
                    </P>
                    <UL
                      items={[
                        "Do not access another user’s chat, attachments, stickers, voice notes, stories, profile media, files, location context, or Safety Gallery images.",
                        "Do not upload malware, harmful files, deceptive links, spyware, phishing content, credential theft content, or abusive media.",
                        "Do not exploit sticker, media, voice, music, video, file upload, trimming, storage, or preview flows.",
                        "Do not bypass block, report, plan-gate, translation, VPN, media, or privacy controls.",
                        "Do not use chat to phish for login codes, payment details, identity information, contact information, or private safety data.",
                        "Do not use stories or profile surfaces for impersonation, stalking, harassment, coercion, or targeting.",
                      ]}
                    />
                    <LinkCard
                      href="/acceptable-use"
                      title="Acceptable Use"
                      body="Detailed prohibited-use rules for chat, media, stickers, stories, location, payments, contacts, and platform behavior."
                    />
                  </section>

                  <section id="payments" className="scroll-mt-24 space-y-3">
                    <H2 icon={<WalletIcon className="h-4 w-4" />}>
                      12) Payments, coins, subscriptions, and wallet safety
                    </H2>
                    <P>
                      If StayKnown includes subscriptions, in-app purchases,
                      coins, wallet, transfers, withdrawals, or receipts, those
                      flows must be used lawfully and securely.
                    </P>
                    <UL
                      items={[
                        "Do not exploit purchases, receipts, webhooks, balances, ledgers, outbox jobs, refunds, chargebacks, or withdrawals.",
                        "Do not use payments, coins, subscriptions, or wallet features for fraud, laundering, illegal funding, scams, deception, extortion, or chargeback abuse.",
                        "Do not impersonate another user to receive coins, payments, refunds, withdrawals, benefits, or plan access.",
                        "Do not attempt to bypass plan entitlements, subscription expiry, failed-payment state, or server-side verification.",
                        "Do not manipulate receipts, webhook payloads, payment provider references, subscription records, wallet balances, or ledger entries.",
                        "Report wallet or payment security issues privately.",
                      ]}
                    />
                    <LinkCard
                      href="/billing-policy"
                      title="Billing & Refunds"
                      body="Subscription, Pro, Pro Max, wallet, coins, receipts, payment failure, chargeback, cancellation, and refund guidance."
                    />
                  </section>

                  <section id="contacts" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ContactIcon className="h-4 w-4" />}>
                      13) Contacts, notifications, and email security
                    </H2>
                    <P>
                      Contact and alert systems must remain trustworthy. Abuse
                      can cause fear, harassment, confusion, false emergency
                      response, or unsafe escalation.
                    </P>
                    <UL
                      items={[
                        "Do not add contacts without permission, lawful basis, or a legitimate safety relationship.",
                        "Do not spam contacts or repeatedly trigger alerts.",
                        "Do not forge, replay, alter, or manipulate safety emails, approval pages, live links, notification payloads, or map links.",
                        "Do not use alert links, live links, or email previews to mislead recipients.",
                        "Do not interfere with contact approval, invite, decline, expiration, removal, or consent flows.",
                        "Do not use notification systems for phishing, threats, scams, impersonation, harassment, or fake emergencies.",
                      ]}
                    />
                    <LinkCard
                      href="/contact-consent"
                      title="Contact Approval & Consent"
                      body="Approved contacts, SOS responders, consent records, blocked-add settings, removals, and trusted-contact duties."
                    />
                  </section>

                  <section id="data" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      14) Data protection and access boundaries
                    </H2>
                    <P>
                      StayKnown data access must stay limited to authorized
                      users, lawful purposes, and required service operation.
                    </P>
                    <UL
                      items={[
                        "Do not access another person’s profile, contact list, location, Visit, SOS, chat, story, media, wallet, subscription, payment, or Safety Gallery data.",
                        "Do not attempt to bypass row-level security, storage policies, signed URLs, JWT checks, session checks, backend validation, RPC authorization, or webhook verification.",
                        "Do not exfiltrate data or test with real user data.",
                        "Do not publish private records, screenshots, links, coordinates, message content, account data, payment data, or contact information.",
                        "Do not use leaked, scraped, guessed, phished, or stolen credentials.",
                        "Do not attempt to reverse engineer private database structure, Edge Functions, SQL rules, storage paths, or security rules for abuse.",
                      ]}
                    />
                    <LinkCard
                      href="/privacy"
                      title="Privacy Policy"
                      body="How StayKnown processes account, location, contact, chat, media, payment, retention, security, and lawful-request data."
                    />
                  </section>

                  <section id="monitoring" className="scroll-mt-24 space-y-3">
                    <H2 icon={<SecurityIcon className="h-4 w-4" />}>
                      15) Monitoring, restrictions, and enforcement
                    </H2>
                    <P>
                      StayKnown may use monitoring, logging, rate limits,
                      restrictions, and enforcement to protect safety and
                      platform integrity.
                    </P>
                    <UL
                      items={[
                        "Suspicious activity may trigger review, throttling, temporary restriction, or permanent ban.",
                        "Accounts, devices, networks, payment methods, contacts, or identifiers may be restricted when abuse is detected.",
                        "Features may be limited to prevent spam, stalking, harassment, fraud, false SOS, payment abuse, API abuse, or system abuse.",
                        "Reports, appeals, security events, and enforcement records may be retained where appropriate.",
                        "StayKnown may preserve records where required by law or needed to investigate abuse, fraud, security incidents, or threats.",
                      ]}
                    />
                    <LinkCard
                      href="/abuse"
                      title="Abuse Reporting"
                      body="Report stalking, harassment, false SOS, unwanted contact, impersonation, fraud, unsafe media, or safety misuse."
                    />
                  </section>

                  <section id="incidents" className="scroll-mt-24 space-y-3">
                    <H2 icon={<BugIcon className="h-4 w-4" />}>
                      16) Security incident response
                    </H2>
                    <P>
                      When StayKnown identifies a credible security issue, it
                      may take steps to reduce harm and protect users.
                    </P>
                    <UL
                      items={[
                        "Review the report and assess severity.",
                        "Mitigate or fix the issue where possible.",
                        "Restrict abused features, endpoints, accounts, devices, payments, or networks.",
                        "Rotate keys, invalidate sessions, revoke tokens, update signatures, or tighten policies where needed.",
                        "Preserve logs relevant to the incident.",
                        "Notify users, partners, platforms, regulators, or authorities where required by law or safety needs.",
                        "Improve monitoring, rate limits, validation, storage policies, RLS, backend checks, and policy language after review.",
                      ]}
                    />
                  </section>

                  <section id="users" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      17) User responsibilities
                    </H2>
                    <P>
                      Security is shared. Users must protect their accounts,
                      devices, contacts, and safety features.
                    </P>
                    <UL
                      items={[
                        "Keep your phone, operating system, browser, and StayKnown app updated.",
                        "Use device lock, biometric protection where available, and secure email access.",
                        "Do not share passwords, login links, one-time codes, or account access.",
                        "Do not leave an active safety session unattended on an unlocked device.",
                        "Review contacts and remove people who should no longer receive alerts.",
                        "Report suspicious activity, unwanted alerts, unknown contacts, strange account behavior, or suspected account access.",
                        "Use emergency services directly if immediate danger exists.",
                      ]}
                    />
                  </section>

                  <section id="minors" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      18) Minor and vulnerable-user safety
                    </H2>
                    <P>
                      Security issues involving minors, vulnerable people,
                      coercion, stalking, exploitation, or immediate harm are
                      treated seriously.
                    </P>
                    <UL
                      items={[
                        "Do not test against minor accounts, guardian flows, school/community flows, or vulnerable users without explicit lawful permission.",
                        "Do not use StayKnown to groom, exploit, threaten, control, stalk, shame, or track a minor.",
                        "Reports involving minors may require urgent review and record preservation.",
                        "If a minor is in immediate danger, contact local emergency services, child-safety authorities, guardians, or appropriate authorities first.",
                        "Security reports involving minors should be sent privately and safely.",
                      ]}
                    />
                    <LinkCard
                      href="/minors"
                      title="Child Safety & Minor Use"
                      body="Dedicated child, teen, guardian, school, family, and vulnerable-user safety policy."
                    />
                  </section>

                  <section id="global" className="scroll-mt-24 space-y-3">
                    <H2 icon={<GlobeIcon className="h-4 w-4" />}>
                      19) Nigeria, United States, United Kingdom, EU, and global
                      security context
                    </H2>
                    <P>
                      Security risks, privacy obligations, emergency-response
                      expectations, payment rules, telecom reliability, and
                      official-request processes differ by country. StayKnown
                      may apply security and integrity controls based on risk,
                      region, provider requirements, platform requirements, and
                      applicable law.
                    </P>

                    <H3>Nigeria security language</H3>
                    <UL
                      items={[
                        "In Nigeria, network conditions, power supply, rural coverage, road conditions, device quality, and provider delays may affect safety alerts, maps, and location reliability.",
                        "Do not use fake GPS, VPN abuse, scams, phishing, impersonation, false SOS, payment abuse, wallet abuse, or contact spam to misuse StayKnown.",
                        "Security incidents involving fraud, extortion, kidnapping concerns, child-safety concerns, stalking, harassment, or urgent harm may require preservation and lawful review.",
                        "If immediate danger exists, use appropriate local channels, which may include trusted family, local police, medical help, FRSC, NSCDC, NEMA, state emergency agencies, private security, child-safety authorities, or nearby responsible responders depending on the situation.",
                        "StayKnown does not replace Nigerian police, ambulance, hospitals, fire service, road safety, civil defence, disaster management, child-protection authorities, or any official authority.",
                      ]}
                    />

                    <H3>United States, U.K./EU, and other countries</H3>
                    <UL
                      items={[
                        "In the United States, StayKnown is not 911, law enforcement, EMS, fire department, child protective services, or rescue service.",
                        "In the U.K. and EU, StayKnown is not 999, 112, police, ambulance, fire service, safeguarding authority, child-protection authority, or official emergency dispatch.",
                        "European users may have stronger privacy, security, data minimization, notification, and legal-process expectations.",
                        "Users in all countries must follow local laws on cybersecurity, privacy, child safety, stalking, harassment, emergency-service misuse, payment fraud, telecom rules, and platform integrity.",
                      ]}
                    />
                  </section>

                  <section id="law" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ReportIcon className="h-4 w-4" />}>
                      20) Legal cooperation and preservation
                    </H2>
                    <P>
                      StayKnown respects applicable law and may respond to valid
                      legal process. It may preserve logs and records where
                      required by law or reasonably needed to investigate abuse,
                      fraud, threats, security incidents, or safety risks.
                    </P>
                    <UL
                      items={[
                        "StayKnown may preserve relevant records for security investigations.",
                        "StayKnown may disclose information if required by law or necessary to protect rights and safety, prevent fraud, prevent harm, or enforce policies.",
                        "StayKnown may cooperate with valid emergency or legal requests where appropriate.",
                        "StayKnown does not support covert surveillance or unlawful monitoring.",
                        "StayKnown may reject or narrow requests that are overbroad, unsafe, unlawful, unclear, or connected to abuse.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/law"
                        title="Law Enforcement & Emergency Requests"
                        body="Official request handling, emergency disclosure, legal preservation, and user notice rules."
                      />
                      <LinkCard
                        href="/retention"
                        title="Data Retention"
                        body="Security logs, safety logs, legal holds, deletion limits, chat metadata, support reports, and payment records."
                      />
                    </div>
                  </section>

                  <section id="contact" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ReportIcon className="h-4 w-4" />}>
                      21) Contact and related policies
                    </H2>
                    <P>
                      For security disclosures, abuse reports, account safety
                      issues, legal requests, or platform-integrity concerns,
                      contact StayKnown support. For immediate danger, contact
                      your local emergency number first.
                    </P>
                    <Callout
                      title="Security contact"
                      body="support@stay-known.com"
                      tone="report"
                      icon={<ReportIcon className="h-5 w-5" />}
                    />
                    <Example
                      title="Recommended subject lines"
                      items={[
                        "Security Disclosure — StayKnown",
                        "Account Security Issue — StayKnown",
                        "Platform Integrity Concern — StayKnown",
                        "Abuse Report — stalking / harassment / misuse",
                        "Child Safety Report — minor-related concern",
                        "Legal Request — StayKnown account / session",
                      ]}
                    />

                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/privacy"
                        title="Privacy Policy"
                        body="How StayKnown processes account, location, contact, chat, media, payment, security, retention, and lawful-request data."
                      />
                      <LinkCard
                        href="/safety"
                        title="Safety & Anti-Stalking"
                        body="Anti-stalking, anti-harassment, anti-coercion, false emergency, and trusted-contact safety rules."
                      />
                      <LinkCard
                        href="/acceptable-use"
                        title="Acceptable Use"
                        body="Detailed prohibited-use rules for accounts, chat, media, stories, location, alerts, payments, and contacts."
                      />
                      <LinkCard
                        href="/location-safety"
                        title="Location & Live Safety"
                        body="Visit sessions, LIVE sharing, SOS, manual capture, chat maps, VPN gates, and accuracy limits."
                      />
                      <LinkCard
                        href="/abuse"
                        title="Abuse Reporting"
                        body="Report stalking, harassment, false SOS, unwanted contact, impersonation, fraud, or unsafe behavior."
                      />
                      <LinkCard
                        href="/emergency"
                        title="Emergency Disclaimer"
                        body="StayKnown is not official emergency services in Nigeria, the U.S., U.K./EU, or any country."
                      />
                    </div>
                  </section>

                  <section className="space-y-3 rounded-[1.6rem] border border-black/10 bg-black/[0.025] p-5 dark:border-white/10 dark:bg-white/[0.03]">
                    <H2>
                      22) Changes to this Security Disclosure & Platform
                      Integrity Policy
                    </H2>
                    <P>
                      StayKnown may update this policy to reflect new security
                      controls, vulnerability-reporting processes, platform
                      integrity systems, API limits, VPN rules, location
                      reliability controls, payment systems, legal requirements,
                      provider limitations, country-specific expectations, or
                      operational needs. If updates are material, StayKnown may
                      provide notice through the app, website, email, or another
                      reasonable method.
                    </P>
                  </section>

                  <section className="space-y-3 rounded-[1.6rem] border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.035]">
                    <H2>Appendix A — In-app short security notice</H2>
                    <P>
                      Do not bypass StayKnown security controls, abuse APIs,
                      manipulate location, fake GPS, interfere with VPN/device
                      integrity checks, access another user’s data, disrupt
                      Visit or SOS flows, exploit chat/media/payment systems,
                      spam contacts, or test the Service in ways that put people
                      at risk. Report security issues privately to
                      support@stay-known.com with the subject “Security
                      Disclosure — StayKnown.” StayKnown may apply rate limits,
                      device checks, VPN gates, payment checks, anti-abuse
                      protections, restrictions, record preservation, and lawful
                      cooperation to protect users and platform integrity.
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
