"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const UPDATED_AT = "2026-04-30";
const VERSION = "1.0";

const STAYKNOWN_LOGO_SRC = "/hero/stay-known-logo.png";
const CLEMENT_LOGO_SRC = "/hero/6-clement-joshua-official-logo.png";

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
      "About StayKnown | A 6 Clement Joshua Service™ for Safety, Trusted Contacts, SOS, Live Location & Secure Communication";

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
      "Learn about StayKnown, a 6 Clement Joshua service™ built for safety, trusted contacts, live location sharing, SOS awareness, approved communication, anti-stalking protection, and people-centered security.",
    );
    upsertMeta(
      "keywords",
      "About StayKnown, StayKnown safety app, 6 Clement Joshua service, trusted contacts app, SOS safety app, live location safety, approved contacts, anti-stalking app, secure communication app, emergency contact app, personal safety technology, safety app for families, location safety platform",
    );
    upsertMeta("robots", "index, follow");
    upsertMeta("author", "6 Clement Joshua");

    upsertProperty("og:title", "About StayKnown | A 6 Clement Joshua Service™");
    upsertProperty(
      "og:description",
      "StayKnown is built to help people remain known, connected, and protected through trusted contacts, live location, SOS awareness, approved communication, and safety-first design.",
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

function SparkIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 3.6 13.8 9l5.6 1.8-5.6 1.8L12 18l-1.8-5.4-5.6-1.8L10.2 9 12 3.6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M18 15.2 18.8 18l2.8.8-2.8.8L18 22.4l-.8-2.8-2.8-.8 2.8-.8.8-2.8ZM5.2 2.4l.65 2.15L8 5.2l-2.15.65L5.2 8l-.65-2.15L2.4 5.2l2.15-.65.65-2.15Z"
        stroke="currentColor"
        strokeWidth="1.45"
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
  tone?: "normal" | "danger" | "safe" | "law" | "premium" | "report";
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
        tone === "premium" &&
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.12),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(16,185,129,0.10),transparent_25%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.09),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(16,185,129,0.08),transparent_25%)]" />
      <div className="absolute left-[7%] top-[18%] h-48 w-48 animate-[floatSlow_9s_ease-in-out_infinite] rounded-full bg-white/10 blur-3xl" />
      <div className="absolute right-[8%] top-[32%] h-56 w-56 animate-[floatSlow_11s_ease-in-out_infinite_reverse] rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="absolute bottom-[8%] left-[30%] h-60 w-60 animate-[floatSlow_13s_ease-in-out_infinite] rounded-full bg-violet-400/8 blur-3xl" />
    </div>
  );
}

function LogoStage() {
  return (
    <div className="relative mx-auto grid max-w-[420px] gap-4 sm:grid-cols-2">
      <div className="absolute inset-0 animate-[softPulse_4s_ease-in-out_infinite] rounded-[2.4rem] bg-black/10 blur-3xl dark:bg-white/10" />

      <div className="relative rounded-[1.8rem] border border-black/10 bg-white/85 p-5 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-white/[0.055]">
        <div className="grid aspect-square place-items-center rounded-[1.35rem] border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/95">
          <Image
            src={STAYKNOWN_LOGO_SRC}
            alt="StayKnown logo"
            width={150}
            height={150}
            priority
            className="h-auto w-[140px] object-contain"
          />
        </div>
        <div className="mt-4 text-center text-[12px] font-black uppercase tracking-[0.16em] text-zinc-600 dark:text-white/45">
          StayKnown
        </div>
      </div>

      <div className="relative rounded-[1.8rem] border border-black/10 bg-white/85 p-5 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-white/[0.055]">
        <div className="grid aspect-square place-items-center rounded-[1.35rem] border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/95">
          <Image
            src={CLEMENT_LOGO_SRC}
            alt="6 Clement Joshua official logo"
            width={150}
            height={150}
            priority
            className="h-auto w-[140px] object-contain"
          />
        </div>
        <div className="mt-4 text-center text-[12px] font-black uppercase tracking-[0.16em] text-zinc-600 dark:text-white/45">
          6 Clement Joshua
        </div>
      </div>
    </div>
  );
}

export default function AboutPage() {
  const { theme, setTheme } = useThemeMode();
  useSeoMeta();

  const nav = useMemo(
    () =>
      [
        ["overview", "Overview"],
        ["mission", "Mission"],
        ["ownership", "Ownership"],
        ["features", "Core features"],
        ["trust", "Trust model"],
        ["safety", "Safety position"],
        ["technology", "Technology"],
        ["investors", "Investor view"],
        ["law", "Legal readiness"],
        ["people", "For people"],
        ["support", "Support"],
      ] as const,
    [],
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About StayKnown",
    dateModified: UPDATED_AT,
    version: VERSION,
    publisher: {
      "@type": "Organization",
      name: "StayKnown",
      brand: "A 6 Clement Joshua service™",
      url: "https://stay-known.com",
    },
    description:
      "About StayKnown, a 6 Clement Joshua service focused on safety, trusted contacts, approved relationships, live location, SOS awareness, secure communication, anti-stalking safeguards, and people-centered protection.",
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
              src={STAYKNOWN_LOGO_SRC}
              alt="StayKnown"
              width={46}
              height={46}
              priority
              className="rounded-2xl bg-white object-contain p-1 shadow-sm"
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
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(255,255,255,0.18),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.14),transparent_28%)]" />

              <div className="relative grid gap-8 md:grid-cols-[1fr_430px] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill>About StayKnown</Pill>
                    <Pill>A 6 Clement Joshua Service™</Pill>
                    <Pill>Safety-first technology</Pill>
                  </div>

                  <h1 className="mt-5 max-w-4xl text-[30px] font-black tracking-[-0.045em] text-zinc-950 dark:text-white/95 md:text-[46px] md:leading-[1.02]">
                    StayKnown is built so trusted people can know where you are,
                    understand your safety context, and respond with confidence
                    when it matters.
                  </h1>

                  <p className="mt-5 max-w-3xl text-[14.5px] font-semibold leading-relaxed text-zinc-700 dark:text-white/62 md:text-[15px]">
                    StayKnown is a 6 Clement Joshua service™ created around one
                    simple human reality: when someone leaves home, travels,
                    visits, meets someone, or faces uncertainty, trusted people
                    should not be left guessing. StayKnown helps turn silence
                    into safety context through approved contacts, live
                    location, SOS awareness, secure communication, consent
                    controls, and anti-misuse rules.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <a
                      href="/submit-request"
                      className="rounded-full border border-black/10 bg-zinc-950 px-5 py-3 text-[12px] font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-black dark:border-white/10 dark:bg-white dark:text-black dark:hover:bg-white/90"
                    >
                      Submit a request
                    </a>
                    <a
                      href="/submit-feature"
                      className="rounded-full border border-black/10 bg-white/70 px-5 py-3 text-[12px] font-black text-zinc-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/[0.055] dark:text-white dark:hover:bg-white/[0.08]"
                    >
                      Submit an app feature
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        setTheme(theme === "dark" ? "light" : "dark")
                      }
                      className="rounded-full border border-black/10 bg-white/70 px-5 py-3 text-[12px] font-black text-zinc-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/[0.055] dark:text-white dark:hover:bg-white/[0.08]"
                    >
                      {theme === "dark" ? "Light mode" : "Dark mode"}
                    </button>
                  </div>

                  <div className="mt-4 text-[12px] font-black text-zinc-500 dark:text-white/35">
                    Updated: {fmtDate(UPDATED_AT)}
                  </div>
                </div>

                <LogoStage />
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
              <aside className="border-b border-black/10 bg-black/[0.02] p-5 dark:border-white/10 dark:bg-black/20 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:p-6">
                <div className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-white/35">
                  On this page
                </div>

                <nav
                  aria-label="About StayKnown sections"
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

                <div className="mt-6 rounded-[1.4rem] border border-emerald-500/20 bg-emerald-500/[0.07] p-4 dark:border-emerald-300/20 dark:bg-emerald-300/[0.07]">
                  <div className="flex items-center gap-2 text-[12px] font-black text-zinc-950 dark:text-white/86">
                    <ShieldIcon className="h-4 w-4" />
                    Core standard
                  </div>
                  <p className="mt-2 text-[12px] font-semibold leading-relaxed text-zinc-700 dark:text-white/55">
                    StayKnown is not built for spying. It is built for
                    consent-aware safety, trusted relationships, emergency
                    awareness, and responsible communication.
                  </p>
                </div>
              </aside>

              <div className="p-5 md:p-8">
                <div className="space-y-8">
                  <section id="overview" className="scroll-mt-24 space-y-4">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      1) What StayKnown is
                    </H2>
                    <P>
                      StayKnown is a safety, security, and trusted-communication
                      platform designed to help people remain known by approved
                      people they trust. It brings together trusted contacts,
                      live location sharing, Visit sessions, SOS awareness,
                      manual safety capture, secure chat, notification context,
                      and policy-backed safeguards into one people-centered
                      experience.
                    </P>

                    <div className="grid gap-3 md:grid-cols-3">
                      <Callout
                        title="Known by trusted people"
                        body="StayKnown is centered on approved contacts and clear safety relationships, not random public tracking."
                        tone="safe"
                        icon={<ContactIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="Safety context, not panic"
                        body="The app helps trusted people understand where a user is, what safety flow is active, and what action may be needed."
                        tone="premium"
                        icon={<LocationIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="Built against misuse"
                        body="StayKnown includes anti-stalking, anti-harassment, consent, location, emergency, abuse, and legal policies."
                        tone="law"
                        icon={<LockIcon className="h-5 w-5" />}
                      />
                    </div>
                  </section>

                  <section id="mission" className="scroll-mt-24 space-y-3">
                    <H2 icon={<SparkIcon className="h-4 w-4" />}>2) Mission</H2>
                    <P>
                      StayKnown’s mission is to reduce uncertainty during real
                      safety moments. The service is designed for the moments
                      when families, friends, trusted contacts, guardians,
                      colleagues, or approved responders need clarity: where the
                      person went, whether the person is still moving, whether a
                      Visit is active, whether SOS was triggered, and whether
                      the situation needs urgent attention.
                    </P>
                    <UL
                      items={[
                        "Make safety communication easier before, during, and after a visit or movement.",
                        "Give trusted contacts a responsible way to receive safety context.",
                        "Reduce the need for panic searching when a user intentionally shares safety information.",
                        "Support approved relationships rather than hidden monitoring.",
                        "Treat location, identity, chat, contacts, and emergency signals as serious safety data.",
                        "Build trust through strong policies, clear boundaries, and user-controlled safety flows.",
                      ]}
                    />
                  </section>

                  <section id="ownership" className="scroll-mt-24 space-y-3">
                    <H2 icon={<SparkIcon className="h-4 w-4" />}>
                      3) Ownership and brand
                    </H2>
                    <P>
                      StayKnown is presented as a 6 Clement Joshua service™.
                      That means the product is tied to a larger standard of
                      identity, responsibility, brand discipline, and long-term
                      service vision. The StayKnown name represents the product:
                      a safety platform focused on keeping people known to the
                      people they approve and trust. The 6 Clement Joshua mark
                      represents the service ownership, creative direction, and
                      brand authority behind the platform.
                    </P>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-[1.5rem] border border-black/10 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.035]">
                        <Image
                          src={STAYKNOWN_LOGO_SRC}
                          alt="StayKnown logo"
                          width={82}
                          height={82}
                          className="rounded-2xl bg-white object-contain p-2"
                        />
                        <div className="mt-4 text-[15px] font-black text-zinc-950 dark:text-white/90">
                          StayKnown
                        </div>
                        <p className="mt-2 text-[13px] font-semibold leading-relaxed text-zinc-700 dark:text-white/58">
                          The product identity for the safety app, live safety
                          sharing, trusted contact system, and secure
                          people-centered communication experience.
                        </p>
                      </div>

                      <div className="rounded-[1.5rem] border border-black/10 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.035]">
                        <Image
                          src={CLEMENT_LOGO_SRC}
                          alt="6 Clement Joshua official logo"
                          width={82}
                          height={82}
                          className="rounded-2xl bg-white object-contain p-2"
                        />
                        <div className="mt-4 text-[15px] font-black text-zinc-950 dark:text-white/90">
                          6 Clement Joshua
                        </div>
                        <p className="mt-2 text-[13px] font-semibold leading-relaxed text-zinc-700 dark:text-white/58">
                          The official service mark and ownership brand behind
                          StayKnown’s product direction, safety philosophy,
                          design quality, and long-term platform ambition.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section id="features" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LocationIcon className="h-4 w-4" />}>
                      4) Core StayKnown features
                    </H2>
                    <P>
                      StayKnown is built around practical safety flows, not just
                      a single map or alert button. The service connects
                      multiple safety layers so users and trusted contacts can
                      understand what is happening with more context.
                    </P>

                    <div className="grid gap-3 md:grid-cols-2">
                      <Callout
                        title="Visit sessions"
                        body="A user can start a safety-aware Visit flow so trusted people understand movement, destination context, and active safety status."
                        tone="normal"
                        icon={<LocationIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="LIVE map sharing"
                        body="Approved contacts can receive live safety context when the user intentionally shares it through supported flows."
                        tone="safe"
                        icon={<LocationIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="SOS awareness"
                        body="SOS flows help escalate urgent trusted-contact attention, while clearly stating that official emergency services must be contacted first in immediate danger."
                        tone="danger"
                        icon={<AlertIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="Manual capture"
                        body="Manual capture can send a current safety update during supported active flows, with limits and safeguards to reduce spam or misuse."
                        tone="premium"
                        icon={<ShieldIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="Approved contacts"
                        body="StayKnown is built around people the user approves, with consent-centered contact handling and removal rules."
                        tone="safe"
                        icon={<ContactIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="Secure communication"
                        body="Chat, voice notes, media, stickers, translation, and safety context are designed to support communication between approved people."
                        tone="normal"
                        icon={<ChatIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="Safety gallery"
                        body="Recognition-focused safety gallery support can help trusted contacts identify the user in serious safety contexts where enabled."
                        tone="law"
                        icon={<ShieldIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="Plan-aware access"
                        body="Starter, Pro, and Pro Max may provide different feature access while safety, policy, and anti-misuse rules remain active for everyone."
                        tone="report"
                        icon={<WalletIcon className="h-5 w-5" />}
                      />
                    </div>
                  </section>

                  <section id="trust" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ContactIcon className="h-4 w-4" />}>
                      5) The StayKnown trust model
                    </H2>
                    <P>
                      StayKnown’s trust model is simple: safety sharing should
                      be intentional, approved, and responsible. The platform is
                      not designed for secret spying, harassment, romantic
                      control, employer abuse, family intimidation, or random
                      location watching. A person’s safety data is sensitive, so
                      the system is built around consent, approved contacts,
                      accountability, and safety-first language.
                    </P>
                    <UL
                      items={[
                        "Users decide who can become part of their trusted safety circle.",
                        "Contacts should understand why they are receiving alerts or safety context.",
                        "Location and safety updates should be used for protection, not pressure.",
                        "Chat and media should support communication, not threats or coercion.",
                        "SOS should never be used as a prank, manipulation tool, or fake emergency.",
                        "Policy pages clearly define abuse, emergency limits, security rules, data retention, legal requests, and minor safety.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/contact-consent"
                        title="Contact Approval & Consent"
                        body="How StayKnown handles approved contacts, consent records, blocked-add settings, removals, and trusted-contact duties."
                      />
                      <LinkCard
                        href="/safety"
                        title="Safety & Anti-Stalking"
                        body="StayKnown’s anti-stalking, anti-harassment, anti-coercion, false emergency, and responsible-use expectations."
                      />
                    </div>
                  </section>

                  <section id="safety" className="scroll-mt-24 space-y-3">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      6) Safety position and emergency limits
                    </H2>
                    <P>
                      StayKnown can support safety awareness, but it is not a
                      police department, ambulance service, fire service,
                      emergency dispatch center, hospital, rescue service,
                      public safety answering point, or official emergency
                      responder. If immediate danger exists, users and contacts
                      should contact the proper local emergency number or local
                      authority first.
                    </P>
                    <UL
                      items={[
                        "StayKnown can help notify trusted people, but it cannot guarantee rescue.",
                        "StayKnown can show safety context, but it cannot guarantee exact GPS location.",
                        "StayKnown can send notifications, but it cannot guarantee that every recipient will see or act immediately.",
                        "StayKnown can preserve certain records where needed, but it cannot guarantee every record exists forever.",
                        "StayKnown can support communication, but it cannot replace real-world safety judgment.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/emergency"
                        title="Emergency Disclaimer"
                        body="Explains StayKnown’s emergency limits, SOS boundaries, official-help-first language, and global emergency expectations."
                      />
                      <LinkCard
                        href="/location-safety"
                        title="Location & Live Safety"
                        body="Explains Visit sessions, LIVE sharing, manual capture, SOS maps, VPN gates, location accuracy, and map limitations."
                      />
                    </div>
                  </section>

                  <section id="technology" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      7) Technology and platform standard
                    </H2>
                    <P>
                      StayKnown is designed as a modern safety platform with
                      mobile-first flows, server-backed data, policy-governed
                      records, live-map experiences, secure email notices,
                      payment-aware plan access, and safety controls across the
                      app and website. The product philosophy is to make safety
                      feel premium without making it confusing.
                    </P>
                    <UL
                      items={[
                        "Clear onboarding and safety education for real people.",
                        "Approved contacts and SOS responder consent flows.",
                        "Map and location context designed for safety, not public exposure.",
                        "Premium UI with smooth motion, readable copy, and strong warnings.",
                        "Friendly errors instead of raw technical messages.",
                        "VPN and device-integrity awareness where safety confidence requires it.",
                        "Server-side verification for sensitive flows such as payments, links, alerts, and records.",
                        "Policy-backed handling for privacy, retention, legal requests, abuse reports, and security disclosures.",
                      ]}
                    />
                    <LinkCard
                      href="/security"
                      title="Security Disclosure & Platform Integrity"
                      body="Responsible vulnerability reporting, API abuse rules, VPN/device integrity, payment security, and platform-integrity expectations."
                    />
                  </section>

                  <section id="investors" className="scroll-mt-24 space-y-3">
                    <H2 icon={<SparkIcon className="h-4 w-4" />}>
                      8) What investors and partners should understand
                    </H2>
                    <P>
                      StayKnown is positioned as more than a basic tracking app.
                      It is a safety infrastructure concept for trusted human
                      relationships: people leaving home, visiting someone,
                      moving through unfamiliar places, going to work,
                      traveling, meeting contacts, or checking in during
                      uncertain moments.
                    </P>
                    <UL
                      items={[
                        "The product addresses a broad human need: reducing uncertainty around personal safety.",
                        "The trust model is based on approved relationships, not surveillance.",
                        "The feature set can expand into personal, family, group, business, school, travel, and organization safety contexts.",
                        "The platform has policy depth across emergency limits, privacy, acceptable use, abuse reporting, retention, security, minors, billing, and legal requests.",
                        "The brand direction is premium, serious, safety-conscious, and built for public trust.",
                        "The long-term value is not only location; it is verified safety context, responsible communication, and trusted-response workflows.",
                      ]}
                    />
                    <Callout
                      title="Product philosophy"
                      body="StayKnown should feel powerful enough for serious safety use, but careful enough to protect against misuse, stalking, fake emergencies, fraud, and careless exposure of private information."
                      tone="premium"
                      icon={<ShieldIcon className="h-5 w-5" />}
                    />
                  </section>

                  <section id="law" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ReportIcon className="h-4 w-4" />}>
                      9) What legal, compliance, and public-safety reviewers
                      should see
                    </H2>
                    <P>
                      StayKnown is structured to show that safety technology
                      must come with boundaries. The platform distinguishes
                      between safety awareness and official emergency response,
                      explains data retention limits, defines prohibited use,
                      offers abuse reporting, provides security disclosure
                      routes, and outlines how lawful requests may be handled.
                    </P>
                    <UL
                      items={[
                        "Emergency disclaimer: StayKnown is not official emergency services.",
                        "Anti-stalking policy: the platform is not for hidden tracking or coercion.",
                        "Contact consent policy: trusted contacts and responders require responsible handling.",
                        "Location safety policy: maps and place labels can be delayed, approximate, or unavailable.",
                        "Acceptable use policy: false SOS, harassment, fraud, impersonation, and payment abuse are prohibited.",
                        "Child safety policy: minors and vulnerable users require heightened protection.",
                        "Retention policy: safety logs may be retained for history, support, abuse prevention, legal compliance, and security.",
                        "Law enforcement policy: requests must be lawful, specific, and safety-aware.",
                        "Security disclosure policy: vulnerability reports should be private, responsible, and non-harmful.",
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
                        body="Safety logs, legal holds, deletion limits, location records, chat metadata, support records, and payment records."
                      />
                    </div>
                  </section>

                  <section id="people" className="scroll-mt-24 space-y-3">
                    <H2 icon={<GlobeIcon className="h-4 w-4" />}>
                      10) Who StayKnown is for
                    </H2>
                    <P>
                      StayKnown is for real people who want stronger safety
                      awareness without turning their relationships into hidden
                      surveillance. It is for users who want trusted people to
                      know their safety context when they choose to share it,
                      and for contacts who want clearer information before panic
                      grows.
                    </P>
                    <UL
                      items={[
                        "People going on visits, trips, errands, meetings, work shifts, or unfamiliar routes.",
                        "Families and trusted circles who want clearer safety awareness.",
                        "Approved contacts who need responsible alerts and context.",
                        "Users who want communication, safety, location, and trust in one place.",
                        "Guardians and responsible adults using the service lawfully and transparently where required.",
                        "Organizations or future business users who need structured safety workflows with clear policy boundaries.",
                      ]}
                    />
                  </section>

                  <section id="support" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ReportIcon className="h-4 w-4" />}>
                      11) Support, ideas, and contact routes
                    </H2>
                    <P>
                      StayKnown provides support and feedback routes so users,
                      contacts, reviewers, and product-minded people can reach
                      the right place without mixing support, feature ideas, and
                      policy concerns.
                    </P>

                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/submit-request"
                        title="Submit a request"
                        body="Use this for account help, safety settings, contact approvals, SOS setup, Visit sessions, live map, chat, billing, wallet, policy questions, or app issues."
                      />
                      <LinkCard
                        href="/submit-feature"
                        title="Submit an app feature"
                        body="Use this to suggest new safety features, product improvements, UI polish, accessibility updates, business flows, language support, or premium experiences."
                      />
                      <LinkCard
                        href="/contact"
                        title="Contact us"
                        body="Use the contact page for general messages and communication with StayKnown support."
                      />
                      <LinkCard
                        href="/abuse"
                        title="Abuse Reporting"
                        body="Use this for stalking, harassment, false SOS, unwanted contact, impersonation, scams, unsafe media, or platform misuse."
                      />
                    </div>
                  </section>

                  <section className="space-y-3 rounded-[1.6rem] border border-black/10 bg-black/[0.025] p-5 dark:border-white/10 dark:bg-white/[0.03]">
                    <H2>12) About-page statement</H2>
                    <P>
                      StayKnown is a serious safety product with a premium brand
                      identity, but its deepest purpose is human: helping
                      trusted people stay aware when uncertainty could turn
                      dangerous. The platform is designed to make safety
                      communication feel easier, clearer, and more responsible,
                      while setting firm limits against stalking, harassment,
                      fake emergencies, illegal requests, fraud, and misuse.
                    </P>
                  </section>
                </div>

                <div className="mt-10 h-px bg-black/10 dark:bg-white/10" />

                <footer className="mt-6 text-center">
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] font-black uppercase tracking-[0.12em] text-zinc-500 dark:text-white/35">
                    <a
                      href="/privacy"
                      className="hover:text-zinc-950 dark:hover:text-white"
                    >
                      Privacy
                    </a>
                    <a
                      href="/terms"
                      className="hover:text-zinc-950 dark:hover:text-white"
                    >
                      Terms
                    </a>
                    <a
                      href="/safety"
                      className="hover:text-zinc-950 dark:hover:text-white"
                    >
                      Safety
                    </a>
                    <a
                      href="/acceptable-use"
                      className="hover:text-zinc-950 dark:hover:text-white"
                    >
                      Acceptable Use
                    </a>
                    <a
                      href="/billing-policy"
                      className="hover:text-zinc-950 dark:hover:text-white"
                    >
                      Billing Policy
                    </a>
                    <a
                      href="/security"
                      className="hover:text-zinc-950 dark:hover:text-white"
                    >
                      Security
                    </a>
                    <a
                      href="/law"
                      className="hover:text-zinc-950 dark:hover:text-white"
                    >
                      Law Requests
                    </a>
                  </div>

                  <div className="mt-5 flex items-center justify-center gap-3">
                    <Image
                      src={CLEMENT_LOGO_SRC}
                      alt="6 Clement Joshua official logo"
                      width={26}
                      height={26}
                      className="rounded-md bg-white object-contain p-0.5"
                    />
                    <div className="text-[12px] font-semibold text-zinc-600 dark:text-white/50">
                      A 6 Clement Joshua service
                      <span className="ml-1 align-super text-[10px] text-zinc-400 dark:text-white/25">
                        ™
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 text-[11px] font-semibold text-zinc-500 dark:text-white/30">
                    {new Date().getFullYear()} • stay-known.com
                  </div>
                </footer>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
