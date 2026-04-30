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
      "StayKnown Emergency Disclaimer | SOS, Live Location, Trusted Contacts & Official Emergency Services";

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
      "Read the StayKnown Emergency Disclaimer explaining SOS limits, live location limits, manual capture limits, trusted contact response, Nigeria, U.S., U.K./EU, and global emergency-service boundaries.",
    );
    upsertMeta(
      "keywords",
      "StayKnown emergency disclaimer, SOS safety app, emergency contact app Nigeria, live location safety limits, 911 disclaimer, 112 emergency disclaimer, 999 emergency disclaimer, trusted contacts, manual capture, safety app limitations, anti-stalking emergency policy",
    );
    upsertMeta("robots", "index, follow");
    upsertMeta("author", "6 Clement Joshua");
    upsertProperty(
      "og:title",
      "StayKnown Emergency Disclaimer | SOS & Official Emergency Service Limits",
    );
    upsertProperty(
      "og:description",
      "StayKnown helps notify trusted contacts, but it does not replace police, ambulance, fire service, 911, 112, 999, Nigerian emergency agencies, or official emergency responders.",
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

function PhoneIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M8.2 4.4 10.1 8c.35.66.24 1.46-.28 2l-.92.94a12.6 12.6 0 0 0 5.16 5.16l.94-.92c.54-.52 1.34-.63 2-.28l3.6 1.9c.64.34.96 1.08.76 1.78l-.62 2.15c-.18.63-.77 1.06-1.43 1.02C10.4 21.2 2.8 13.6 2.25 4.69c-.04-.66.39-1.25 1.02-1.43l2.15-.62c.7-.2 1.44.12 1.78.76Z"
        stroke="currentColor"
        strokeWidth="1.65"
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
  tone?: "normal" | "danger" | "safe" | "law" | "report";
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_15%_20%,rgba(239,68,68,0.12),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(16,185,129,0.10),transparent_25%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_15%_20%,rgba(239,68,68,0.10),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(16,185,129,0.08),transparent_25%)]" />
      <div className="absolute left-[7%] top-[18%] h-48 w-48 animate-[floatSlow_9s_ease-in-out_infinite] rounded-full bg-red-400/10 blur-3xl" />
      <div className="absolute right-[8%] top-[32%] h-56 w-56 animate-[floatSlow_11s_ease-in-out_infinite_reverse] rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="absolute bottom-[8%] left-[30%] h-60 w-60 animate-[floatSlow_13s_ease-in-out_infinite] rounded-full bg-white/8 blur-3xl" />
    </div>
  );
}

function EmergencyIllustration() {
  return (
    <div className="relative mx-auto h-[280px] w-[190px] md:h-[320px] md:w-[220px]">
      <div className="absolute inset-0 animate-[softPulse_4s_ease-in-out_infinite] rounded-[2.2rem] bg-red-400/15 blur-2xl" />
      <div className="relative h-full w-full rounded-[2rem] border border-black/15 bg-white/75 p-3 shadow-2xl backdrop-blur dark:border-white/15 dark:bg-white/[0.055]">
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-black/20 dark:bg-white/20" />
        <div className="rounded-[1.5rem] border border-black/10 bg-gradient-to-b from-white to-zinc-100 p-4 dark:border-white/10 dark:from-white/[0.10] dark:to-white/[0.03]">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-black text-white dark:bg-white dark:text-black">
              <AlertIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-black tracking-[0.18em] text-zinc-500 dark:text-white/35">
                EMERGENCY LIMITS
              </div>
              <div className="text-[13px] font-black text-zinc-950 dark:text-white">
                Official Help First
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {[
              ["Call emergency services", "If danger is immediate"],
              ["Alert trusted contacts", "StayKnown can support awareness"],
              ["Check location limits", "GPS and networks may fail"],
              ["Do not fake alerts", "Emergency misuse can harm people"],
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
            Disclaimer active
          </div>
          <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_14px_rgba(239,68,68,0.9)]" />
        </div>
      </div>
    </div>
  );
}

export default function EmergencyPage() {
  const { theme, setTheme } = useThemeMode();
  useSeoMeta();

  const nav = useMemo(
    () =>
      [
        ["summary", "Summary"],
        ["immediate", "Immediate danger"],
        ["role", "StayKnown role"],
        ["not", "What we are not"],
        ["can", "What we can do"],
        ["limits", "Limits"],
        ["sos", "SOS"],
        ["visit", "Visit & LIVE"],
        ["contacts", "Contacts"],
        ["location", "Location"],
        ["network", "Network delays"],
        ["global", "Nigeria & global"],
        ["false", "False alerts"],
        ["minors", "Minors"],
        ["records", "Records"],
        ["law", "Legal"],
        ["contact", "Contact"],
      ] as const,
    [],
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "StayKnown Emergency Disclaimer",
    dateModified: UPDATED_AT,
    version: VERSION,
    publisher: {
      "@type": "Organization",
      name: "StayKnown",
      brand: "A 6 Clement Joshua service™",
      url: "https://stay-known.com",
    },
    description:
      "Emergency Disclaimer for StayKnown covering SOS, Visit, LIVE sharing, manual capture, trusted contact response, location accuracy, Nigeria and global emergency service limits, false alerts, records, and legal cooperation.",
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
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(239,68,68,0.14),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.14),transparent_28%)]" />

              <div className="relative grid gap-8 md:grid-cols-[1fr_260px] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill>Emergency Disclaimer</Pill>
                    <Pill>SOS Limits</Pill>
                    <Pill>Official Help First</Pill>
                  </div>

                  <h1 className="mt-5 max-w-3xl text-[30px] font-black tracking-[-0.045em] text-zinc-950 dark:text-white/95 md:text-[46px] md:leading-[1.02]">
                    StayKnown Emergency Disclaimer for SOS, live location, and
                    trusted-contact alerts.
                  </h1>

                  <p className="mt-5 max-w-3xl text-[14.5px] font-semibold leading-relaxed text-zinc-700 dark:text-white/62 md:text-[15px]">
                    StayKnown can help notify approved contacts and provide
                    safety context, but it does not replace official emergency
                    services in Nigeria, the United States, the United Kingdom,
                    the European Union, or any country. If immediate danger
                    exists, contact the official emergency number or local
                    emergency authority first.
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

                <EmergencyIllustration />
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
              <aside className="border-b border-black/10 bg-black/[0.02] p-5 dark:border-white/10 dark:bg-black/20 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:p-6">
                <div className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-white/35">
                  On this page
                </div>

                <nav
                  aria-label="Emergency Disclaimer sections"
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

                <div className="mt-6 rounded-[1.4rem] border border-red-500/20 bg-red-500/[0.06] p-4 dark:border-red-400/20 dark:bg-red-400/[0.07]">
                  <div className="flex items-center gap-2 text-[12px] font-black text-zinc-950 dark:text-white/86">
                    <PhoneIcon className="h-4 w-4" />
                    Immediate danger
                  </div>
                  <p className="mt-2 text-[12px] font-semibold leading-relaxed text-zinc-700 dark:text-white/55">
                    Call the official emergency number or local emergency
                    authority first. Do not wait for an app alert.
                  </p>
                </div>
              </aside>

              <div className="p-5 md:p-8">
                <div className="space-y-8">
                  <section id="summary" className="scroll-mt-24 space-y-4">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      1) Emergency disclaimer summary
                    </H2>
                    <P>
                      StayKnown is a safety-awareness and trusted-contact
                      service. It can support safety communication, location
                      context, SOS alerts, manual capture, Visit sessions, LIVE
                      sharing, chat context, and approved-contact notifications.
                      It does not guarantee rescue, police response, ambulance
                      response, fire response, medical care, official dispatch,
                      prevention of harm, or any specific outcome.
                    </P>

                    <div className="grid gap-3 md:grid-cols-3">
                      <Callout
                        title="Official help first"
                        body="If there is immediate danger, use official emergency services or the correct local emergency channel before relying on StayKnown."
                        tone="danger"
                        icon={<PhoneIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="StayKnown can support awareness"
                        body="StayKnown may help trusted contacts understand a safety event, but contacts may miss, delay, or misread alerts."
                        tone="safe"
                        icon={<ContactIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="Location is not guaranteed"
                        body="GPS, battery, VPN, device settings, provider outages, and networks can affect location and delivery."
                        tone="law"
                        icon={<LocationIcon className="h-5 w-5" />}
                      />
                    </div>
                  </section>

                  <section id="immediate" className="scroll-mt-24 space-y-3">
                    <H2 icon={<PhoneIcon className="h-4 w-4" />}>
                      2) Immediate danger comes first
                    </H2>
                    <P>
                      If you, a minor, a dependent, a contact, or another person
                      is in immediate danger, contact the proper local emergency
                      number, emergency agency, law enforcement, medical
                      provider, fire service, rescue service, trusted responder,
                      or local authority first.
                    </P>
                    <UL
                      items={[
                        "Do not wait for a StayKnown alert, email, push notification, chat message, map update, or location point if immediate action is needed.",
                        "Use local emergency numbers, official emergency apps, police, ambulance, fire, medical, rescue, road-safety, civil-defence, disaster-management, or local safety channels where appropriate.",
                        "If it is unsafe to call, follow local emergency guidance for silent, text-based, family, community, or trusted-responder options where available.",
                        "If a StayKnown contact receives an urgent alert and cannot reach the user, the contact should use responsible judgment and official emergency channels where danger seems credible.",
                      ]}
                    />
                  </section>

                  <section id="role" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      3) StayKnown’s role in safety situations
                    </H2>
                    <P>
                      StayKnown can help a user communicate safety context to
                      trusted people during Visits, LIVE sharing, SOS events,
                      manual capture updates, chat, and related safety flows.
                    </P>
                    <Example
                      title="StayKnown may help with"
                      items={[
                        "Notifying trusted contacts when a user starts or updates a safety session.",
                        "Sharing user-triggered safety context during an active Visit, SOS flow, or manual capture event.",
                        "Helping contacts understand that a safety event is active or recently changed.",
                        "Providing history and delivery context where records are available.",
                        "Supporting safer communication through chat, voice notes, translation, media, and profile trust where enabled.",
                        "Providing map or place-label context so approved contacts can better understand a user’s safety location.",
                      ]}
                    />
                  </section>

                  <section id="not" className="scroll-mt-24 space-y-3">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      4) What StayKnown is not
                    </H2>
                    <P>
                      StayKnown does not become an official emergency responder
                      simply because a user starts a Visit, triggers SOS, sends
                      manual capture, shares LIVE context, sends a chat message,
                      or shows a map.
                    </P>
                    <UL
                      items={[
                        "StayKnown is not police, ambulance, fire service, rescue service, medical service, private security, emergency dispatch, public safety answering point, or government emergency authority.",
                        "StayKnown is not U.S. 911, U.K./EU 999 or 112, Nigerian police, Nigerian ambulance, FRSC, NSCDC, NEMA, state emergency agencies, hospitals, fire service, or any official emergency body.",
                        "StayKnown does not guarantee that any contact will receive, read, understand, or act on an alert.",
                        "StayKnown does not guarantee real-time location, exact coordinates, exact address, building-level location, or perfect delivery.",
                        "StayKnown does not guarantee intervention, rescue, prevention of harm, or a specific outcome.",
                        "StayKnown does not monitor every session live or make emergency decisions for users or contacts.",
                      ]}
                    />
                  </section>

                  <section id="can" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      5) What StayKnown can do
                    </H2>
                    <P>
                      Depending on plan, region, device permissions,
                      connectivity, feature availability, third-party providers,
                      and user settings, StayKnown may support several safety
                      functions.
                    </P>
                    <UL
                      items={[
                        "Send user-triggered safety notifications to trusted contacts.",
                        "Share Visit status and location context during an active session where permissions allow.",
                        "Support SOS alert flows where available.",
                        "Support manual capture safety updates during active safety flows.",
                        "Show safety history logs to help users review personal safety activity.",
                        "Provide notification delivery context where available.",
                        "Support chat, media, voice notes, translation, stories, stickers, and profile trust where enabled.",
                        "Support verified stop flows for sensitive ending actions where configured.",
                      ]}
                    />
                  </section>

                  <section id="limits" className="scroll-mt-24 space-y-3">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      6) What StayKnown cannot guarantee
                    </H2>
                    <UL
                      items={[
                        "Real-time delivery of emails, push notifications, app updates, map links, or chat messages.",
                        "Perfect location accuracy or continuous GPS availability.",
                        "That a phone will remain charged, online, unlocked, permitted, or able to transmit data.",
                        "That a contact will see, understand, believe, or respond to an alert.",
                        "That emergency services will be contacted by a recipient.",
                        "That official responders will act based on StayKnown data.",
                        "That network providers, email providers, app stores, GPS, operating systems, payment providers, map providers, or hosting providers will perform without delay.",
                        "That a safety event will prevent harm.",
                      ]}
                    />
                    <Callout
                      title="No single safety tool is enough"
                      body="Use StayKnown as one safety layer. Keep emergency numbers, direct calls, trusted contacts, local safety plans, and real-world judgment active."
                      tone="law"
                      icon={<ShieldIcon className="h-5 w-5" />}
                    />
                  </section>

                  <section id="sos" className="scroll-mt-24 space-y-3">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      7) SOS use and limitations
                    </H2>
                    <P>
                      SOS is a serious safety signal. It should be used only
                      when the user needs urgent trusted-contact attention or
                      feels unsafe.
                    </P>
                    <UL
                      items={[
                        "SOS may notify selected contacts depending on plan, settings, connectivity, permissions, and feature availability.",
                        "SOS does not automatically call police, ambulance, fire service, rescue, 911, 112, 999, FRSC, NSCDC, NEMA, or any official emergency system unless a separate official emergency system is used.",
                        "SOS does not guarantee that contacts are awake, online, reachable, willing, or able to help.",
                        "SOS may include location context if permissions, device state, and network state allow it.",
                        "SOS should not be used as a prank, test, threat, manipulation, false claim, or pressure tactic.",
                        "In immediate danger, contact local emergency services directly.",
                      ]}
                    />
                    <LinkCard
                      href="/location-safety"
                      title="Location & Live Safety"
                      body="Detailed rules for Visit sessions, LIVE sharing, SOS, manual capture, chat maps, VPN gates, and accuracy limits."
                    />
                  </section>

                  <section id="visit" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LocationIcon className="h-4 w-4" />}>
                      8) Visit, LIVE sharing, and manual capture limitations
                    </H2>
                    <P>
                      Visit, LIVE sharing, and manual capture can help trusted
                      contacts understand safety context, but they are not a
                      guarantee of safety, location truth, or intervention.
                    </P>
                    <UL
                      items={[
                        "Visit sessions depend on location permission, GPS, network access, battery, device settings, app state, provider availability, and plan features.",
                        "LIVE links may show delayed, approximate, incomplete, stale, or unavailable location data.",
                        "Contacts should treat LIVE information as safety context, not exact proof of current location.",
                        "A Visit ending does not guarantee the person is safe unless the user confirms safety through real-world communication.",
                        "Manual capture may fail or delay if the device cannot get location or send data.",
                        "Manual capture must not be used to spam, frighten, manipulate, mislead, or pressure contacts.",
                      ]}
                    />
                  </section>

                  <section id="contacts" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ContactIcon className="h-4 w-4" />}>
                      9) How trusted contacts should respond
                    </H2>
                    <P>
                      Contacts receiving StayKnown alerts should act carefully,
                      lawfully, and safely. They should not take unsafe action
                      or treat approximate app data as absolute proof.
                    </P>
                    <UL
                      items={[
                        "Attempt safe direct contact first by calling or messaging the user where possible.",
                        "Check whether the alert is SOS, Visit, manual capture, chat map, end state, or another safety update.",
                        "If danger seems likely, contact the appropriate local emergency service or trusted local safety channel and provide relevant context.",
                        "Do not attempt unsafe personal intervention.",
                        "Do not publicly share the user’s location, profile, alert, chat, safety gallery, or map details unless necessary for safety or law.",
                        "Treat timestamps, location, and place labels as approximate and potentially delayed.",
                      ]}
                    />
                    <LinkCard
                      href="/contact-consent"
                      title="Contact Approval & Consent"
                      body="Rules for approved contacts, SOS responders, consent records, blocked-add settings, removals, and trusted-contact duties."
                    />
                  </section>

                  <section id="location" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LocationIcon className="h-4 w-4" />}>
                      10) Location accuracy limitations
                    </H2>
                    <P>
                      Location data depends on many factors outside StayKnown’s
                      full control. It may be approximate, delayed, stale,
                      missing, or wrong.
                    </P>
                    <UL
                      items={[
                        "GPS may be weak indoors, underground, in dense buildings, in markets, in rural areas, on roads with poor coverage, or during poor environmental conditions.",
                        "Battery saver, denied permissions, background restrictions, device settings, or app state may stop updates.",
                        "Network issues may delay or prevent upload of location points.",
                        "Reverse-geocoded place labels may be approximate, outdated, or unavailable.",
                        "VPN, fake GPS, device tampering, modified apps, emulators, or unreliable network state may reduce location confidence.",
                        "A displayed location may not represent the user’s exact current position.",
                      ]}
                    />
                  </section>

                  <section id="network" className="scroll-mt-24 space-y-3">
                    <H2 icon={<GlobeIcon className="h-4 w-4" />}>
                      11) Network, provider, and delivery delays
                    </H2>
                    <P>
                      StayKnown depends on third-party systems such as mobile
                      networks, operating systems, email providers, push
                      systems, hosting providers, app stores, payment
                      processors, maps, translation systems, and geocoding
                      providers.
                    </P>
                    <UL
                      items={[
                        "Emails may be delayed, filtered, blocked, rejected, or sent to spam.",
                        "Push notifications may be delayed by phone settings, battery saver, OS rules, or network state.",
                        "Map links may load slowly or fail if the recipient has poor connectivity.",
                        "App background behavior may vary across devices and operating systems.",
                        "Third-party outages may affect alerts, maps, emails, storage, subscriptions, wallet, translation, or chat.",
                      ]}
                    />
                  </section>

                  <section id="global" className="scroll-mt-24 space-y-3">
                    <H2 icon={<GlobeIcon className="h-4 w-4" />}>
                      12) Nigeria, United States, United Kingdom, EU, and global
                      emergency use
                    </H2>
                    <P>
                      Emergency systems differ by country. StayKnown is not a
                      replacement for any country’s official emergency system,
                      government agency, police, ambulance, fire, medical, road
                      safety, civil defence, or disaster-management service.
                    </P>

                    <H3>Nigeria emergency language</H3>
                    <UL
                      items={[
                        "In Nigeria, StayKnown is not the Nigeria Police Force, ambulance service, fire service, hospital, FRSC, NSCDC, NEMA, state emergency agency, private security, or any official authority.",
                        "If immediate danger is suspected, users and contacts should use appropriate local channels, which may include trusted family, local police, medical help, FRSC, NSCDC, NEMA, state emergency agencies, private security, or nearby responsible responders depending on the situation.",
                        "Network issues, power supply, rural coverage, city congestion, road conditions, device quality, and provider delays may affect StayKnown alerts and location accuracy.",
                        "StayKnown should support safety awareness; it should not replace real-world emergency planning, direct calls, community support, or official help.",
                      ]}
                    />

                    <H3>United States emergency language</H3>
                    <UL
                      items={[
                        "In the United States, StayKnown is not 911, a public safety answering point, law enforcement, EMS, fire department, hospital, or rescue provider.",
                        "If immediate danger is suspected, call 911 or the correct local emergency service.",
                        "StayKnown data may be delayed, approximate, unavailable, or insufficient for official response.",
                      ]}
                    />

                    <H3>United Kingdom, EU, and other countries</H3>
                    <UL
                      items={[
                        "In the U.K. and EU, StayKnown is not 999, 112, police, ambulance, fire service, emergency dispatch, medical service, or official rescue.",
                        "If immediate danger is suspected, use 999, 112, or the official local emergency number for the place where the event is happening.",
                        "Local privacy, consent, emergency, telecom, child-protection, workplace, school, and safety laws may apply.",
                      ]}
                    />
                  </section>

                  <section id="false" className="scroll-mt-24 space-y-3">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      13) False emergencies are prohibited
                    </H2>
                    <P>
                      False emergency use can cause panic, waste resources,
                      damage trust, and endanger others. StayKnown prohibits
                      false SOS events and misleading safety claims.
                    </P>
                    <UL
                      items={[
                        "Do not create fake SOS alerts.",
                        "Do not create false Visit or manual capture events to manipulate contacts.",
                        "Do not use emergency language to threaten, harass, scare, extort, or pressure someone.",
                        "Do not use StayKnown to frame, mislead, lure, exploit, or endanger another person.",
                        "Repeated false emergencies may result in feature restrictions, account suspension, permanent ban, preservation of records, and lawful cooperation where appropriate.",
                      ]}
                    />
                    <LinkCard
                      href="/acceptable-use"
                      title="Acceptable Use"
                      body="Detailed prohibited-use rules for false alerts, contact abuse, location misuse, chat abuse, payment misuse, and platform abuse."
                    />
                  </section>

                  <section id="minors" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      14) Minors and vulnerable users
                    </H2>
                    <P>
                      Emergency and safety features involving minors or
                      vulnerable users must be handled with heightened care.
                    </P>
                    <UL
                      items={[
                        "Under 13 users are not permitted to create an account or use StayKnown.",
                        "Minors who are permitted under policy require appropriate guardian permission and lawful safety use.",
                        "StayKnown must not be used to groom, exploit, coerce, threaten, or secretly monitor minors.",
                        "If a minor is in immediate danger, contact local emergency services or the proper local authority first.",
                        "Reports involving minors may require urgent review and preservation of relevant records.",
                      ]}
                    />
                    <LinkCard
                      href="/minors"
                      title="Child Safety & Minor Use"
                      body="Dedicated rules for minors, guardians, families, schools, vulnerable users, and youth safety."
                    />
                  </section>

                  <section id="records" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      15) Records, history, preservation, and privacy
                    </H2>
                    <P>
                      StayKnown may retain certain safety records to provide
                      history, troubleshoot delivery, prevent abuse, investigate
                      reports, comply with law, and support safety auditing.
                    </P>
                    <UL
                      items={[
                        "Safety session records may include start time, stop time, state changes, SOS events, and manual capture events.",
                        "Notification records may include timestamps, recipient identifiers, and delivery status where available.",
                        "Location records may exist only where permissions and feature state allowed collection.",
                        "Records may be preserved where required by law or reasonably needed to investigate abuse, threats, false emergencies, fraud, or serious safety concerns.",
                        "Retention does not guarantee every record exists or can be produced later.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/privacy"
                        title="Privacy Policy"
                        body="How StayKnown handles account, location, contact, chat, media, payment, retention, and legal-request data."
                      />
                      <LinkCard
                        href="/retention"
                        title="Data Retention"
                        body="Detailed retention rules for safety logs, contact records, location records, chat metadata, and legal holds."
                      />
                    </div>
                  </section>

                  <section id="law" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      16) Legal cooperation and emergency requests
                    </H2>
                    <P>
                      StayKnown respects applicable law and may respond to valid
                      legal process. In limited emergency circumstances,
                      StayKnown may review urgent requests where disclosure may
                      be necessary to prevent death, serious injury, kidnapping,
                      trafficking, exploitation, or imminent harm.
                    </P>
                    <UL
                      items={[
                        "StayKnown may preserve records where required by law or where reasonably needed for safety review.",
                        "StayKnown may disclose information if required by law or necessary to protect rights and safety, prevent fraud, prevent harm, or enforce policies.",
                        "StayKnown may reject, narrow, or question requests that are overbroad, unlawful, unsafe, unclear, or connected to abuse.",
                        "StayKnown does not support covert surveillance or unlawful monitoring.",
                      ]}
                    />
                    <LinkCard
                      href="/law"
                      title="Law Enforcement & Emergency Requests"
                      body="Dedicated policy for official requests, emergency disclosures, preservation, legal process, and user notice."
                    />
                  </section>

                  <section id="contact" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ReportIcon className="h-4 w-4" />}>
                      17) Contact and related policies
                    </H2>
                    <P>
                      For safety questions, abuse reports, legal concerns,
                      emergency-related policy questions, security reports, or
                      privacy requests, use the proper StayKnown support route.
                    </P>
                    <UL
                      items={[
                        "Support: support@stay-known.com",
                        "If there is immediate danger, contact your local emergency number or official emergency authority first.",
                        "Use Abuse Reporting for stalking, harassment, impersonation, false emergency use, unwanted contact, or unsafe behavior.",
                        "Use Law Enforcement & Emergency Requests for official requests, preservation, emergency disclosure, or urgent legal concerns.",
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
                        body="Report stalking, harassment, unwanted contact, false emergencies, impersonation, or unsafe use."
                      />
                      <LinkCard
                        href="/security"
                        title="Security Disclosure"
                        body="Responsible vulnerability reporting and platform-integrity route."
                      />
                    </div>
                  </section>

                  <section className="space-y-3 rounded-[1.6rem] border border-black/10 bg-black/[0.025] p-5 dark:border-white/10 dark:bg-white/[0.03]">
                    <H2>18) Changes to this Emergency Disclaimer</H2>
                    <P>
                      StayKnown may update this disclaimer to reflect new safety
                      features, SOS behavior, manual capture changes, map
                      providers, emergency-service expectations, legal
                      requirements, country-specific language, provider
                      limitations, or operational needs. If updates are
                      material, StayKnown may provide notice through the app,
                      website, email, or another reasonable method.
                    </P>
                  </section>

                  <section className="space-y-3 rounded-[1.6rem] border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.035]">
                    <H2>Appendix A — In-app short emergency notice</H2>
                    <P>
                      StayKnown does not replace emergency services, police,
                      ambulance, fire service, medical care, rescue services,
                      road safety agencies, civil defence, disaster-management
                      agencies, 911, 112, 999, Nigerian emergency authorities,
                      or official emergency dispatch in any country. If
                      immediate danger exists, contact the official local
                      emergency number or proper local authority first.
                      StayKnown can help notify trusted contacts and provide
                      safety context, but alerts, maps, chat, emails, push
                      notifications, and location data may be delayed,
                      approximate, unavailable, missed, or wrong. Do not create
                      false emergencies or misuse SOS.
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
                    This disclaimer is provided for product transparency and
                    should be reviewed by qualified legal counsel before public
                    launch, regulatory filing, investor review, app-store
                    submission, or law-enforcement request handling.
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
