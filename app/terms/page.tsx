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
      "StayKnown Terms of Service | Safety App Rules, Approved Contacts, SOS, Location & Secure Chat";

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
      "Read the StayKnown Terms of Service for safety app rules, live location sharing, SOS alerts, approved contacts, secure chat, anti-stalking use, subscriptions, liability limits, and lawful use.",
    );
    upsertMeta(
      "keywords",
      "StayKnown terms of service, safety app terms, SOS app rules, live location sharing terms, approved contacts, anti-stalking policy, secure chat rules, emergency disclaimer, subscription terms, Pro Max safety app",
    );
    upsertMeta("robots", "index, follow");
    upsertMeta("author", "6 Clement Joshua");
    upsertProperty(
      "og:title",
      "StayKnown Terms of Service | Safety, Location, SOS & Approved Contact Rules",
    );
    upsertProperty(
      "og:description",
      "The user agreement for StayKnown safety features, approved contacts, live location, SOS alerts, secure chat, subscriptions, abuse prevention, and legal limits.",
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

function DocumentIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M7 3.8h6.2L18 8.6v11.6H7V3.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M13.2 3.8v4.8H18"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9.3 12.2h5.4M9.3 15.2h5.4M9.3 18.2h3.5"
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

function CardIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M4.6 7.4c0-1.1.9-2 2-2h10.8c1.1 0 2 .9 2 2v9.2c0 1.1-.9 2-2 2H6.6c-1.1 0-2-.9-2-2V7.4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M4.8 9.4h14.4" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M7.5 14.8h3.2"
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
  tone?: "normal" | "danger" | "safe" | "law" | "billing";
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.12),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(16,185,129,0.10),transparent_25%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.10),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(16,185,129,0.08),transparent_25%)]" />
      <div className="absolute left-[7%] top-[18%] h-48 w-48 animate-[floatSlow_9s_ease-in-out_infinite] rounded-full bg-sky-400/10 blur-3xl" />
      <div className="absolute right-[8%] top-[32%] h-56 w-56 animate-[floatSlow_11s_ease-in-out_infinite_reverse] rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="absolute bottom-[8%] left-[30%] h-60 w-60 animate-[floatSlow_13s_ease-in-out_infinite] rounded-full bg-white/8 blur-3xl" />
    </div>
  );
}

function AgreementIllustration() {
  return (
    <div className="relative mx-auto h-[280px] w-[190px] md:h-[320px] md:w-[220px]">
      <div className="absolute inset-0 animate-[softPulse_4s_ease-in-out_infinite] rounded-[2.2rem] bg-emerald-400/15 blur-2xl" />
      <div className="relative h-full w-full rounded-[2rem] border border-black/15 bg-white/75 p-3 shadow-2xl backdrop-blur dark:border-white/15 dark:bg-white/[0.055]">
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-black/20 dark:bg-white/20" />
        <div className="rounded-[1.5rem] border border-black/10 bg-gradient-to-b from-white to-zinc-100 p-4 dark:border-white/10 dark:from-white/[0.10] dark:to-white/[0.03]">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-black text-white dark:bg-white dark:text-black">
              <DocumentIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-black tracking-[0.18em] text-zinc-500 dark:text-white/35">
                AGREEMENT
              </div>
              <div className="text-[13px] font-black text-zinc-950 dark:text-white">
                Safety Rules
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {[
              ["Use lawfully", "Safety-focused, consent-based access"],
              ["Respect contacts", "No stalking or coercive monitoring"],
              ["Emergency limits", "Not official emergency dispatch"],
              ["Protect access", "Secure account and device use"],
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
            Terms Active
          </div>
          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.9)]" />
        </div>
      </div>
    </div>
  );
}

export default function TermsPage() {
  const { theme, setTheme } = useThemeMode();
  useSeoMeta();

  const nav = useMemo(
    () =>
      [
        ["summary", "Summary"],
        ["accept", "Acceptance"],
        ["eligibility", "Eligibility"],
        ["accounts", "Accounts"],
        ["safety", "Safety use"],
        ["location", "Location"],
        ["contacts", "Contacts"],
        ["chat", "Chat & content"],
        ["plans", "Plans & payments"],
        ["ip", "IP ownership"],
        ["security", "Security"],
        ["disclaimers", "Disclaimers"],
        ["liability", "Liability"],
        ["termination", "Termination"],
        ["law", "Law & disputes"],
        ["contact", "Contact"],
      ] as const,
    [],
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TermsOfService",
    name: "StayKnown Terms of Service",
    dateModified: UPDATED_AT,
    version: VERSION,
    publisher: {
      "@type": "Organization",
      name: "StayKnown",
      brand: "A 6 Clement Joshua service™",
      url: "https://stay-known.com",
    },
    description:
      "Terms of Service for StayKnown safety app covering approved contacts, live location sharing, SOS alerts, secure chat, subscriptions, anti-stalking rules, emergency limits, and lawful use.",
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

      {/* Brand */}
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
            {/* Hero */}
            <div className="relative overflow-hidden border-b border-black/10 px-5 py-7 dark:border-white/10 md:px-8 md:py-9">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(16,185,129,0.16),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.14),transparent_28%)]" />

              <div className="relative grid gap-8 md:grid-cols-[1fr_260px] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill>Terms of Service</Pill>
                    <Pill>Safety Agreement</Pill>
                    <Pill>Lawful Use</Pill>
                  </div>

                  <h1 className="mt-5 max-w-3xl text-[30px] font-black tracking-[-0.045em] text-zinc-950 dark:text-white/95 md:text-[46px] md:leading-[1.02]">
                    StayKnown Terms of Service for safety, approved contacts,
                    live location, SOS, and secure communication.
                  </h1>

                  <p className="mt-5 max-w-3xl text-[14.5px] font-semibold leading-relaxed text-zinc-700 dark:text-white/62 md:text-[15px]">
                    These Terms govern access to StayKnown and explain the rules
                    for accounts, lawful safety use, approved contacts, live
                    location sharing, SOS alerts, secure chat, user content,
                    subscriptions, abuse prevention, enforcement, liability
                    limits, and legal compliance.
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

                <AgreementIllustration />
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
              {/* Sidebar */}
              <aside className="border-b border-black/10 bg-black/[0.02] p-5 dark:border-white/10 dark:bg-black/20 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:p-6">
                <div className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-white/35">
                  On this page
                </div>

                <nav
                  aria-label="Terms of Service sections"
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
                    <ShieldIcon className="h-4 w-4" />
                    Safety-first rule
                  </div>
                  <p className="mt-2 text-[12px] font-semibold leading-relaxed text-zinc-600 dark:text-white/45">
                    StayKnown must not be used for stalking, hidden tracking,
                    harassment, coercion, impersonation, false emergencies, or
                    unlawful surveillance.
                  </p>
                </div>
              </aside>

              <div className="p-5 md:p-8">
                <div className="space-y-8">
                  <section id="summary" className="scroll-mt-24 space-y-4">
                    <H2 icon={<DocumentIcon className="h-4 w-4" />}>
                      1) Agreement summary
                    </H2>
                    <P>
                      By accessing or using StayKnown, you agree to these Terms
                      of Service and the policies linked in these Terms. If you
                      do not agree, do not use StayKnown. StayKnown is a
                      safety-awareness and trusted-contact service. It is not a
                      police department, ambulance service, fire service,
                      emergency dispatch center, rescue service, or official
                      emergency response provider.
                    </P>

                    <div className="grid gap-3 md:grid-cols-3">
                      <Callout
                        title="Use StayKnown lawfully"
                        body="StayKnown is for consent-based safety communication, not stalking, pressure, intimidation, or unauthorized monitoring."
                        tone="safe"
                        icon={<ShieldIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="Location has limits"
                        body="GPS, network, maps, device permissions, battery state, VPNs, and third-party systems can affect accuracy and delivery."
                        tone="law"
                        icon={<LocationIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="Emergency services first"
                        body="If there is immediate danger, contact your local emergency number and follow official emergency guidance."
                        tone="danger"
                        icon={<AlertIcon className="h-5 w-5" />}
                      />
                    </div>
                  </section>

                  <section id="accept" className="scroll-mt-24 space-y-3">
                    <H2 icon={<DocumentIcon className="h-4 w-4" />}>
                      2) Acceptance of Terms
                    </H2>
                    <P>
                      These Terms form a legal agreement between you and the
                      operator of StayKnown. You accept these Terms when you
                      access the website, create an account, use the app, start
                      a Visit, use LIVE sharing, trigger SOS, send manual
                      capture, use chat, upload media, manage contacts, pay for
                      a plan, or otherwise use the Service.
                    </P>
                    <P>
                      If you use StayKnown on behalf of another person,
                      dependent, company, school, nonprofit, agency, household,
                      or organization, you represent that you have authority,
                      permission, and a lawful basis to do so.
                    </P>

                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/privacy"
                        title="Privacy Policy"
                        body="Explains how StayKnown handles account, location, contact, chat, media, safety, payment, retention, and legal request data."
                      />
                      <LinkCard
                        href="/acceptable-use"
                        title="Acceptable Use"
                        body="Detailed rules against stalking, harassment, impersonation, false emergencies, spam, and harmful misuse."
                      />
                    </div>
                  </section>

                  <section id="eligibility" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      3) Eligibility and lawful use
                    </H2>
                    <UL
                      items={[
                        "StayKnown is for lawful, safety-focused, consent-based use only.",
                        "You must have legal capacity to use the Service, or must use it with required parent, guardian, organization, or lawful representative consent.",
                        "You may not use StayKnown if doing so would violate a court order, protective order, restraining order, no-contact order, school rule, workplace rule, local law, platform rule, sanctions rule, or public-safety restriction.",
                        "You may not use StayKnown to secretly track, pressure, control, threaten, intimidate, exploit, impersonate, or harass another person.",
                        "If local law requires additional consent for location sharing, employee monitoring, family safety tools, minor use, or emergency-contact notification, you must comply with that law.",
                      ]}
                    />
                    <Example
                      title="Examples"
                      items={[
                        "Allowed: using StayKnown to share a late-night ride or visit with approved trusted contacts.",
                        "Allowed: a company using a business-approved safety flow with proper notice and staff consent.",
                        "Not allowed: using StayKnown to monitor an ex-partner, protected person, employee, student, minor, or family member without legal authority and proper consent.",
                        "Not allowed: using StayKnown to bypass a no-contact order or to pressure someone into accepting contact requests.",
                      ]}
                    />
                    <LinkCard
                      href="/minors"
                      title="Child Safety & Minor Use"
                      body="Rules for minors, guardians, lawful supervision, youth protection, and vulnerable-user safety."
                    />
                  </section>

                  <section id="accounts" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      4) Accounts, identity, and security
                    </H2>
                    <UL
                      items={[
                        "You are responsible for keeping your account, device, email, phone, passwords, and login methods secure.",
                        "You must provide accurate account, profile, contact, subscription, and safety information where required.",
                        "You must not create fake identities, impersonate another person, misrepresent your relationship to contacts, or submit false safety information.",
                        "You must not share account access in a way that enables unsafe use, unauthorized tracking, false alerts, harassment, fraud, or data exposure.",
                        "StayKnown may apply biometric, device-level, session, VPN, rate-limit, approval, or plan-gate protections to help secure the Service.",
                        "StayKnown may suspend, restrict, or terminate access if account behavior creates safety risk, fraud risk, abuse risk, legal risk, or public-safety concern.",
                      ]}
                    />
                    <Callout
                      title="Account responsibility"
                      body="Because StayKnown can involve safety alerts and sensitive location context, account access must be protected carefully. An unsafe device or shared login can create real-world harm."
                      tone="law"
                      icon={<LockIcon className="h-5 w-5" />}
                    />
                  </section>

                  <section id="safety" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      5) Safety-first use and prohibited conduct
                    </H2>
                    <P>
                      StayKnown is built for real people, approved contacts, and
                      responsible safety communication. You agree not to use
                      StayKnown in any way that causes harm, creates fear,
                      violates consent, violates law, or abuses emergency
                      awareness.
                    </P>
                    <UL
                      items={[
                        "No stalking, harassment, threats, intimidation, coercive control, retaliation, bullying, or targeting.",
                        "No hidden tracking, covert surveillance, unauthorized monitoring, or location collection without a lawful basis and required consent.",
                        "No false emergencies, fake SOS events, false reports, prank alerts, hoaxes, swatting, or misuse that may waste emergency resources.",
                        "No impersonation of users, contacts, law enforcement, medical staff, emergency responders, government officials, StayKnown staff, or trusted contacts.",
                        "No facilitation of violence, trafficking, kidnapping, exploitation, extortion, burglary, hate, discrimination, doxxing, or real-world harm.",
                        "No attempts to bypass plan limits, contact approval, VPN safety gate, SOS verification, device checks, rate limits, or security rules.",
                        "No scraping, reverse engineering, unauthorized API use, botting, spam, mass messaging, or abuse of email/push delivery systems.",
                        "No use of StayKnown to violate civil rights, protective orders, no-contact orders, workplace restrictions, school restrictions, or family court requirements.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/safety"
                        title="Safety & Anti-Stalking"
                        body="Dedicated anti-stalking, anti-harassment, anti-coercion, protective-order, and safety misuse rules."
                      />
                      <LinkCard
                        href="/abuse"
                        title="Abuse Reporting"
                        body="Report stalking, harassment, impersonation, false emergency use, unwanted contact, or unsafe behavior."
                      />
                    </div>
                  </section>

                  <section id="location" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LocationIcon className="h-4 w-4" />}>
                      6) Location, live map, SOS, manual capture, and emergency
                      limits
                    </H2>
                    <P>
                      Location-related features may include Visit sessions, LIVE
                      sharing, SOS, manual emergency capture, chat maps, place
                      labels, readable area descriptions, safety gallery
                      context, and approved-contact map views.
                    </P>
                    <UL
                      items={[
                        "Location features depend on permissions, device state, GPS, network connectivity, battery behavior, VPN status, map providers, and third-party systems.",
                        "Approved contacts may see location or safety context only through permitted StayKnown flows, such as active Visit, SOS, manual capture, or approved-contact chat map.",
                        "StayKnown does not guarantee continuous service, exact location, building-level precision, real-time updates, successful notification delivery, or recipient response.",
                        "StayKnown may block or warn users about VPN usage where VPN behavior can reduce safety reliability or location clarity.",
                        "You must not use StayKnown location features to secretly track, monitor, pressure, or control another person.",
                        "If you are in immediate danger, contact official emergency services first.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/location-safety"
                        title="Location & Live Safety"
                        body="Full rules for Visit sessions, LIVE sharing, SOS maps, chat maps, manual capture, VPN gates, and accuracy limits."
                      />
                      <LinkCard
                        href="/emergency"
                        title="Emergency Disclaimer"
                        body="Important legal limits explaining that StayKnown does not replace official emergency services."
                      />
                    </div>
                  </section>

                  <section id="contacts" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ContactIcon className="h-4 w-4" />}>
                      7) Approved contacts, consent, and notifications
                    </H2>
                    <P>
                      StayKnown’s contact system is designed to support trusted,
                      intentional, approved safety relationships. You are
                      responsible for choosing appropriate contacts and using
                      the contact system lawfully.
                    </P>
                    <UL
                      items={[
                        "You must not add contacts for spam, intimidation, harassment, surveillance, retaliation, or pressure.",
                        "Emergency contacts and SOS responders may require approval or consent before receiving certain safety responsibilities or map access.",
                        "If a person declines, removes themselves, blocks additions, or asks you to stop, you must respect that boundary.",
                        "StayKnown may keep approval, consent, delivery, and audit records to prove authorization, reduce disputes, prevent abuse, and protect users.",
                        "StayKnown may remove contacts, block contact requests, restrict alerts, or suspend accounts if contact features are misused.",
                      ]}
                    />
                    <LinkCard
                      href="/contact-consent"
                      title="Contact Approval & Consent"
                      body="Dedicated rules for approved contacts, SOS responders, consent records, blocked-add settings, removals, and trusted-contact responsibilities."
                    />
                  </section>

                  <section id="chat" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      8) Chat, media, stickers, voice notes, stories, and user
                      content
                    </H2>
                    <P>
                      StayKnown may include secure chat, stories, profile
                      surfaces, media sharing, files, stickers, voice notes,
                      translation, read receipts, message reactions, and
                      location-aware safety context. You are responsible for the
                      content you send, upload, create, or share.
                    </P>
                    <UL
                      items={[
                        "You must not send illegal, threatening, exploitative, hateful, abusive, harassing, sexually exploitative, stalking-related, violent, or deceptive content.",
                        "You must not upload media or stickers that you do not have rights to use, including copyrighted, private, intimate, stolen, or unauthorized material.",
                        "You must not use chat, stories, or profile features to impersonate, lure, exploit, threaten, dox, shame, extort, or coordinate harm.",
                        "StayKnown may restrict, remove, review, preserve, or report content where needed to enforce rules, protect users, comply with law, or investigate credible safety risks.",
                        "Translation, transcription, preview, thumbnail, moderation, and delivery systems may process message or media metadata where supported.",
                        "Removing content from the user interface does not always mean it is immediately deleted from backups, logs, legal holds, abuse systems, or safety records.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/privacy"
                        title="Privacy Policy"
                        body="Explains how chat, media, location metadata, translation, storage, and reporting data may be processed."
                      />
                      <LinkCard
                        href="/acceptable-use"
                        title="Acceptable Use"
                        body="Detailed prohibited-content and prohibited-behavior rules for user-generated content and communication."
                      />
                    </div>
                  </section>

                  <section id="plans" className="scroll-mt-24 space-y-3">
                    <H2 icon={<CardIcon className="h-4 w-4" />}>
                      9) Plans, subscriptions, payments, wallet, and refunds
                    </H2>
                    <P>
                      StayKnown may offer free and paid plans, including
                      Starter, Pro, and Pro Max, with different features,
                      limits, pricing, renewal rules, availability, and safety
                      gates. Some features may also depend on region, device,
                      operating system, app version, account standing, and legal
                      compliance.
                    </P>
                    <UL
                      items={[
                        "Pricing, plan benefits, billing period, renewal terms, taxes, and provider rules should be shown before purchase where required.",
                        "Payments may be handled by app stores, Paystack, card processors, banks, or other approved payment providers.",
                        "Paid plans do not guarantee rescue, emergency response, successful contact response, perfect location accuracy, or uninterrupted service.",
                        "StayKnown may change features, plan limits, pricing, names, availability, or included benefits where legally permitted and with required notice.",
                        "Refunds, cancellations, chargebacks, failed payments, downgrades, wallet/coin flows, and receipts are governed by the Billing & Refunds policy and applicable payment provider terms.",
                        "You must not use payments, wallet, coins, receipts, or subscriptions for fraud, money laundering, scams, chargeback abuse, or illegal activity.",
                      ]}
                    />
                    <Callout
                      title="Paid safety features are not emergency guarantees"
                      body="Pro or Pro Max access may unlock safety features, but no paid plan can guarantee emergency intervention, official dispatch, rescue, exact location, or recipient response."
                      tone="billing"
                      icon={<CardIcon className="h-5 w-5" />}
                    />
                    <LinkCard
                      href="/billing-policy"
                      title="Billing & Refunds"
                      body="Subscription, plan, payment failure, receipts, wallet, coins, cancellation, chargeback, and refund guidance."
                    />
                  </section>

                  <section id="ip" className="scroll-mt-24 space-y-3">
                    <H2 icon={<DocumentIcon className="h-4 w-4" />}>
                      10) Intellectual property and feedback
                    </H2>
                    <UL
                      items={[
                        "StayKnown, the StayKnown name, the 6 Clement Joshua service branding, logos, designs, software, interface, safety flows, text, graphics, icons, page structure, code, and product concepts are owned by the operator or its licensors.",
                        "You may not copy, clone, resell, reverse engineer, modify, scrape, decompile, reproduce, or misuse StayKnown or its branding except where the law expressly allows.",
                        "You may not use StayKnown trademarks, logos, safety language, screenshots, or branding to mislead people or imply endorsement.",
                        "If you submit feedback, feature ideas, bug reports, or suggestions, StayKnown may use them to improve the Service without owing compensation unless a separate written agreement says otherwise.",
                        "You keep rights to content you upload, but you grant StayKnown the permission needed to host, process, transmit, display, translate, store, moderate, and protect that content as part of the Service.",
                      ]}
                    />
                  </section>

                  <section id="security" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      11) Platform integrity, security, exports, and sanctions
                    </H2>
                    <UL
                      items={[
                        "You must not interfere with StayKnown systems, bypass safety gates, abuse APIs, overload infrastructure, exploit bugs, scrape data, or access accounts, sessions, media, contacts, maps, or data that are not yours.",
                        "You must not attempt to disable, bypass, or manipulate contact approval, VPN safety gates, biometric protection, subscription gates, plan limits, device checks, rate limits, SOS verification, or safety escalation logic.",
                        "You must not introduce malware, spyware, credential-stealing tools, automation abuse, surveillance tools, or harmful code.",
                        "Access may be restricted where required by sanctions, export-control laws, platform rules, safety risk, fraud risk, or legal obligations.",
                        "Security researchers must use responsible disclosure and must not access, expose, copy, alter, delete, or publish private user data.",
                      ]}
                    />
                    <LinkCard
                      href="/security"
                      title="Security Disclosure"
                      body="Responsible disclosure route for vulnerability reports and platform-integrity concerns."
                    />
                  </section>

                  <section id="disclaimers" className="scroll-mt-24 space-y-3">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      12) Disclaimers and service limitations
                    </H2>
                    <UL
                      items={[
                        "StayKnown is provided “as is” and “as available” to the maximum extent permitted by law.",
                        "StayKnown does not guarantee uninterrupted service, perfect safety, exact location accuracy, real-time delivery, successful message delivery, successful email delivery, device compatibility, map accuracy, translation accuracy, recipient response, or emergency intervention.",
                        "Third-party networks, mobile carriers, operating systems, app stores, payment processors, email providers, map providers, geocoding providers, translation providers, device manufacturers, GPS conditions, VPNs, and internet outages may affect service performance.",
                        "StayKnown is a safety-awareness tool and does not replace police, ambulance, fire service, emergency dispatch, medical care, rescue service, security professionals, legal advice, or official emergency numbers.",
                        "Users and contacts remain responsible for real-world decisions, including whether to call, check in, leave an area, contact authorities, seek medical care, or use official emergency services.",
                      ]}
                    />
                    <LinkCard
                      href="/emergency"
                      title="Emergency Disclaimer"
                      body="Read the dedicated safety limitation page before relying on any emergency or SOS feature."
                    />
                  </section>

                  <section id="liability" className="scroll-mt-24 space-y-3">
                    <H2 icon={<DocumentIcon className="h-4 w-4" />}>
                      13) Limitation of liability and indemnity
                    </H2>
                    <H3>13.1 Limitation of liability</H3>
                    <UL
                      items={[
                        "To the maximum extent permitted by law, StayKnown and its operator are not liable for indirect, incidental, special, consequential, exemplary, punitive, or similar damages.",
                        "StayKnown is not responsible for delays, outages, inaccurate location, failed alerts, blocked emails, app store issues, payment provider issues, recipient inaction, user misuse, device problems, carrier problems, or third-party failures.",
                        "Some jurisdictions do not allow certain limitations. Where those laws apply, limitations apply only to the maximum extent permitted.",
                      ]}
                    />
                    <H3>13.2 Indemnity</H3>
                    <P>
                      You agree to defend, indemnify, and hold harmless
                      StayKnown, its operator, service providers, licensors, and
                      related parties from claims, losses, liabilities, damages,
                      penalties, costs, and expenses arising from your misuse of
                      the Service, violation of these Terms, violation of law,
                      violation of another person’s rights, false information,
                      unsafe conduct, or user content.
                    </P>
                  </section>

                  <section id="termination" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      14) Enforcement, suspension, termination, and appeals
                    </H2>
                    <UL
                      items={[
                        "StayKnown may warn, restrict, suspend, terminate, block, remove, throttle, downgrade, or disable accounts, devices, features, sessions, contacts, content, or payments where needed to enforce these Terms or protect safety.",
                        "StayKnown may take immediate action for credible threats, stalking, harassment, false emergency misuse, impersonation, payment fraud, platform abuse, exploitation, or legal risk.",
                        "StayKnown may preserve relevant records where needed for legal compliance, abuse review, fraud prevention, safety review, or dispute handling.",
                        "You may stop using StayKnown at any time, but some records may remain as described in the Privacy Policy and Data Retention Policy.",
                        "If you believe enforcement was a mistake, you may contact support to request review. StayKnown is not required to restore accounts, content, or access where risk remains.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/retention"
                        title="Data Retention"
                        body="Explains how long records may be kept for safety, legal, support, security, and payment reasons."
                      />
                      <LinkCard
                        href="/abuse"
                        title="Abuse Reporting"
                        body="Explains how to report misuse and how StayKnown may review unsafe behavior."
                      />
                    </div>
                  </section>

                  <section id="law" className="scroll-mt-24 space-y-3">
                    <H2 icon={<DocumentIcon className="h-4 w-4" />}>
                      15) Governing law, disputes, legal requests, and civil
                      safety
                    </H2>
                    <P>
                      These Terms are intended to be interpreted consistently
                      with applicable laws in the places where StayKnown is
                      lawfully offered and used. If any provision is found
                      unenforceable, the remaining provisions remain effective
                      to the maximum extent permitted by law.
                    </P>
                    <UL
                      items={[
                        "You agree to contact StayKnown support first so we can try to resolve account, billing, privacy, safety, or product concerns.",
                        "Nothing in these Terms limits rights that cannot legally be limited in your jurisdiction.",
                        "StayKnown may respond to valid legal process and emergency requests as described in the Law Enforcement & Emergency Requests policy.",
                        "StayKnown may reject, narrow, preserve, or disclose information where permitted or required by law, safety need, court order, emergency circumstance, or valid legal process.",
                        "You must not submit fake legal requests, impersonate officials, misuse reporting tools, or create false safety claims.",
                      ]}
                    />
                    <LinkCard
                      href="/law"
                      title="Law Enforcement & Emergency Requests"
                      body="Dedicated policy for official requests, emergency disclosures, preservation, user notice, and legal process."
                    />
                  </section>

                  <section id="contact" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ContactIcon className="h-4 w-4" />}>
                      16) Contact and related policies
                    </H2>
                    <P>
                      For account support, policy questions, billing questions,
                      safety concerns, abuse reports, legal concerns, privacy
                      requests, or security disclosure, contact StayKnown
                      through the proper support route.
                    </P>
                    <UL
                      items={[
                        "Support: support@stay-known.com",
                        "Use the Abuse Reporting page for stalking, harassment, impersonation, false emergencies, unwanted contact, or unsafe behavior.",
                        "Use the Security Disclosure page for vulnerability reports.",
                        "Use the Law Enforcement & Emergency Requests page for official requests.",
                      ]}
                    />

                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/privacy"
                        title="Privacy Policy"
                        body="How StayKnown handles location, contact, chat, media, payment, retention, and request data."
                      />
                      <LinkCard
                        href="/location-safety"
                        title="Location & Live Safety"
                        body="Rules for Visit sessions, LIVE sharing, SOS, manual capture, chat maps, VPN gates, and accuracy limits."
                      />
                      <LinkCard
                        href="/contact-consent"
                        title="Contact Approval & Consent"
                        body="Approved contacts, SOS responders, consent records, blocked-add settings, and trusted-contact responsibilities."
                      />
                      <LinkCard
                        href="/safety"
                        title="Safety & Anti-Stalking"
                        body="Anti-stalking, anti-harassment, anti-coercion, protective-order, and misuse rules."
                      />
                      <LinkCard
                        href="/billing-policy"
                        title="Billing & Refunds"
                        body="Subscription, Pro, Pro Max, wallet, receipts, failed payments, cancellation, and refund guidance."
                      />
                      <LinkCard
                        href="/security"
                        title="Security Disclosure"
                        body="Responsible disclosure, vulnerability reports, and platform-integrity concerns."
                      />
                    </div>
                  </section>

                  <section className="space-y-3 rounded-[1.6rem] border border-black/10 bg-black/[0.025] p-5 dark:border-white/10 dark:bg-white/[0.03]">
                    <H2>17) Changes to these Terms</H2>
                    <P>
                      StayKnown may update these Terms to reflect new features,
                      safety improvements, legal requirements, product changes,
                      provider changes, policy changes, civil-safety
                      expectations, or operational needs. If changes are
                      material, StayKnown may provide notice through the app,
                      website, email, or another reasonable method, and may
                      require acceptance before continued use.
                    </P>
                  </section>

                  <section className="space-y-3 rounded-[1.6rem] border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.035]">
                    <H2>Appendix A — In-app short terms notice</H2>
                    <P>
                      By using StayKnown, you agree to use the Service only for
                      lawful, safety-focused, consent-based purposes. You must
                      not use StayKnown for stalking, harassment, hidden
                      tracking, intimidation, impersonation, false emergencies,
                      fraud, or illegal activity. StayKnown does not replace
                      official emergency services. Location, SOS, chat, contact,
                      payment, and notification features may be limited by plan,
                      permissions, device settings, provider systems, and law.
                      StayKnown may restrict or terminate access for violations,
                      safety risk, abuse, fraud, or legal concern.
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
                    These Terms are provided for product transparency and should
                    be reviewed by qualified legal counsel before public launch,
                    app-store submission, investor review, regulatory filing, or
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
