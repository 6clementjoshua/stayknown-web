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
      "StayKnown Safety & Anti-Stalking Policy | Consent, SOS, Live Location, Chat Safety & Abuse Prevention";

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
      "Read the StayKnown Safety & Anti-Stalking Policy covering consent-based safety use, approved contacts, live location sharing, SOS alerts, chat safety, abuse reporting, minors, Nigeria and global emergency-use limits.",
    );
    upsertMeta(
      "keywords",
      "StayKnown safety policy, anti-stalking safety app, approved contacts, consent-based location sharing, SOS safety app, live location anti-harassment, Nigeria safety app, emergency contact app, chat safety policy, abuse reporting, anti-coercion policy",
    );
    upsertMeta("robots", "index, follow");
    upsertMeta("author", "6 Clement Joshua");
    upsertProperty(
      "og:title",
      "StayKnown Safety & Anti-Stalking Policy | Consent-Based Safety App Rules",
    );
    upsertProperty(
      "og:description",
      "StayKnown safety rules for lawful use, approved contacts, SOS, live maps, chat, anti-stalking, anti-harassment, minors, reporting, enforcement, and global emergency limits.",
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.12),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(16,185,129,0.10),transparent_25%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.10),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(16,185,129,0.08),transparent_25%)]" />
      <div className="absolute left-[7%] top-[18%] h-48 w-48 animate-[floatSlow_9s_ease-in-out_infinite] rounded-full bg-sky-400/10 blur-3xl" />
      <div className="absolute right-[8%] top-[32%] h-56 w-56 animate-[floatSlow_11s_ease-in-out_infinite_reverse] rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="absolute bottom-[8%] left-[30%] h-60 w-60 animate-[floatSlow_13s_ease-in-out_infinite] rounded-full bg-white/8 blur-3xl" />
    </div>
  );
}

function SafetyIllustration() {
  return (
    <div className="relative mx-auto h-[280px] w-[190px] md:h-[320px] md:w-[220px]">
      <div className="absolute inset-0 animate-[softPulse_4s_ease-in-out_infinite] rounded-[2.2rem] bg-emerald-400/15 blur-2xl" />
      <div className="relative h-full w-full rounded-[2rem] border border-black/15 bg-white/75 p-3 shadow-2xl backdrop-blur dark:border-white/15 dark:bg-white/[0.055]">
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-black/20 dark:bg-white/20" />
        <div className="rounded-[1.5rem] border border-black/10 bg-gradient-to-b from-white to-zinc-100 p-4 dark:border-white/10 dark:from-white/[0.10] dark:to-white/[0.03]">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-black text-white dark:bg-white dark:text-black">
              <ShieldIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-black tracking-[0.18em] text-zinc-500 dark:text-white/35">
                SAFETY CENTER
              </div>
              <div className="text-[13px] font-black text-zinc-950 dark:text-white">
                Anti-Stalking Rules
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {[
              ["Consent first", "No hidden tracking"],
              ["Approved people", "Trusted contacts only"],
              ["Report misuse", "Abuse review available"],
              ["Emergency limits", "Official help still matters"],
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
            Misuse blocked
          </div>
          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.9)]" />
        </div>
      </div>
    </div>
  );
}

export default function SafetyPage() {
  const { theme, setTheme } = useThemeMode();
  useSeoMeta();

  const nav = useMemo(
    () =>
      [
        ["summary", "Summary"],
        ["mission", "Mission"],
        ["consent", "Consent"],
        ["contacts", "Contacts"],
        ["location", "Location"],
        ["sos", "SOS"],
        ["chat", "Chat & media"],
        ["stories", "Stories"],
        ["minors", "Minors"],
        ["vpn", "VPN"],
        ["global", "Nigeria & global"],
        ["prohibited", "Prohibited"],
        ["recipient", "Recipients"],
        ["report", "Reporting"],
        ["enforcement", "Enforcement"],
        ["legal", "Legal"],
        ["contact", "Contact"],
      ] as const,
    [],
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "StayKnown Safety & Anti-Stalking Policy",
    dateModified: UPDATED_AT,
    version: VERSION,
    publisher: {
      "@type": "Organization",
      name: "StayKnown",
      brand: "A 6 Clement Joshua service™",
      url: "https://stay-known.com",
    },
    description:
      "Safety and anti-stalking policy for StayKnown covering consent-based safety use, approved contacts, live location, SOS, chat, minors, Nigeria and global use, reporting, enforcement, and legal cooperation.",
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
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(16,185,129,0.16),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(239,68,68,0.10),transparent_28%)]" />

              <div className="relative grid gap-8 md:grid-cols-[1fr_260px] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill>Safety Policy</Pill>
                    <Pill>Anti-Stalking</Pill>
                    <Pill>Consent Always</Pill>
                  </div>

                  <h1 className="mt-5 max-w-3xl text-[30px] font-black tracking-[-0.045em] text-zinc-950 dark:text-white/95 md:text-[46px] md:leading-[1.02]">
                    StayKnown Safety & Anti-Stalking Policy for lawful,
                    consent-based protection.
                  </h1>

                  <p className="mt-5 max-w-3xl text-[14.5px] font-semibold leading-relaxed text-zinc-700 dark:text-white/62 md:text-[15px]">
                    This policy explains the safety rules for StayKnown users,
                    approved contacts, SOS responders, chat participants, map
                    viewers, guardians, and recipients. StayKnown is built for
                    protection, trusted communication, and responsible safety
                    awareness — not stalking, harassment, coercion, hidden
                    tracking, false emergencies, or abuse.
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

                <SafetyIllustration />
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
              <aside className="border-b border-black/10 bg-black/[0.02] p-5 dark:border-white/10 dark:bg-black/20 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:p-6">
                <div className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-white/35">
                  On this page
                </div>

                <nav
                  aria-label="Safety and Anti-Stalking Policy sections"
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
                    Core rule
                  </div>
                  <p className="mt-2 text-[12px] font-semibold leading-relaxed text-zinc-600 dark:text-white/45">
                    StayKnown must never be used for stalking, harassment,
                    coercive control, false emergencies, or hidden monitoring.
                  </p>
                </div>
              </aside>

              <div className="p-5 md:p-8">
                <div className="space-y-8">
                  <section id="summary" className="scroll-mt-24 space-y-4">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      1) Safety summary
                    </H2>
                    <P>
                      Safety tools can protect people, but they can also be
                      abused when used without consent, transparency, or lawful
                      purpose. StayKnown’s safety model is based on user
                      control, approved contacts, consent-aware communication,
                      anti-stalking protections, reporting, enforcement, and
                      lawful cooperation where necessary.
                    </P>

                    <div className="grid gap-3 md:grid-cols-3">
                      <Callout
                        title="Safety first"
                        body="StayKnown exists to help real people stay connected to trusted people during safety moments."
                        tone="safe"
                        icon={<ShieldIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="No stalking"
                        body="Do not use StayKnown to secretly track, pressure, threaten, expose, or control another person."
                        tone="danger"
                        icon={<AlertIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="Report misuse"
                        body="Unsafe behavior, impersonation, unwanted contact, fake emergencies, and coercive use should be reported."
                        tone="report"
                        icon={<ReportIcon className="h-5 w-5" />}
                      />
                    </div>
                  </section>

                  <section id="mission" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      2) StayKnown safety mission
                    </H2>
                    <P>
                      StayKnown was created to reduce uncertainty when a person
                      is moving, visiting, meeting someone, travelling, working,
                      going to school, commuting, chatting with trusted
                      contacts, or facing a possible safety concern. It is
                      designed as a safety-awareness and trusted-contact
                      service.
                    </P>
                    <UL
                      items={[
                        "To help users share safety context with people they trust.",
                        "To help approved contacts understand a user’s Visit, SOS, manual capture, chat map, or safety alert.",
                        "To support responsible communication across families, friends, workplaces, schools, communities, and travel situations where lawful.",
                        "To discourage hidden tracking, stalking, harassment, coercion, and misuse of location or contact data.",
                        "To give users and contacts clearer safety context while still reminding them that official emergency services must be used for immediate danger.",
                      ]}
                    />
                  </section>

                  <section id="consent" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ContactIcon className="h-4 w-4" />}>
                      3) Consent, notice, and transparency
                    </H2>
                    <P>
                      Consent is central to StayKnown. A user must not use
                      StayKnown to secretly place people into safety roles,
                      repeatedly target someone who declined, or turn safety
                      alerts into harassment.
                    </P>
                    <UL
                      items={[
                        "Only add contacts where you have permission, lawful basis, or a legitimate safety relationship.",
                        "Tell contacts they may receive StayKnown alerts, map links, emails, push notifications, or safety context.",
                        "Do not pressure someone into accepting contact approval or SOS responder responsibility.",
                        "Respect declined, expired, removed, blocked, or withdrawn contact status.",
                        "Do not use StayKnown to bypass privacy settings, blocked-add settings, contact preferences, or no-contact boundaries.",
                        "Do not misrepresent what a StayKnown alert, map, SOS, or contact request means.",
                      ]}
                    />
                    <LinkCard
                      href="/contact-consent"
                      title="Contact Approval & Consent"
                      body="Dedicated rules for approved contacts, SOS responders, consent records, removal, blocked-add settings, and trusted-contact duties."
                    />
                  </section>

                  <section id="contacts" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ContactIcon className="h-4 w-4" />}>
                      4) Trusted contacts and responder responsibility
                    </H2>
                    <P>
                      Approved contacts and SOS responders must treat safety
                      information with care. Receiving an alert does not give a
                      person the right to shame, control, follow, expose, or
                      threaten the user.
                    </P>
                    <UL
                      items={[
                        "Use alerts only for the safety purpose intended.",
                        "Do not share live map links, chat map details, safety gallery images, profile information, or alert screenshots unnecessarily.",
                        "Do not use location information to confront someone unsafely or take reckless action.",
                        "Call or message the user where safe and appropriate.",
                        "Contact appropriate local emergency channels if danger appears credible.",
                        "Report abusive or suspicious alerts if StayKnown is being used to target, frighten, manipulate, or harass you.",
                      ]}
                    />
                  </section>

                  <section id="location" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LocationIcon className="h-4 w-4" />}>
                      5) Location safety, LIVE map, and accuracy limits
                    </H2>
                    <P>
                      Location is sensitive. StayKnown location features must be
                      used only for lawful, user-controlled, safety-focused
                      purposes.
                    </P>
                    <UL
                      items={[
                        "Location accuracy depends on GPS, device hardware, operating system permissions, battery settings, network quality, VPN status, app state, and provider coverage.",
                        "Location may be delayed, stale, approximate, missing, or wrong.",
                        "Live maps and chat maps are safety context, not a legally certified or emergency-dispatch-grade location source.",
                        "Users must not rely on StayKnown as their only method for life-critical decisions.",
                        "Recipients should treat location as time-sensitive and approximate unless confirmed through other reliable channels.",
                        "Location must not be used to stalk, threaten, shame, punish, expose, exploit, follow, or control another person.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/location-safety"
                        title="Location & Live Safety"
                        body="Detailed rules for Visit sessions, LIVE sharing, SOS, manual capture, chat maps, VPN gates, and accuracy limits."
                      />
                      <LinkCard
                        href="/privacy"
                        title="Privacy Policy"
                        body="How StayKnown handles location, contact, chat, media, safety, payment, and legal-request data."
                      />
                    </div>
                  </section>

                  <section id="sos" className="scroll-mt-24 space-y-3">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      6) SOS, manual capture, and emergency posture
                    </H2>
                    <P>
                      SOS and manual capture are high-seriousness safety flows.
                      They must not be used for jokes, revenge, manipulation,
                      panic creation, or fake emergencies.
                    </P>
                    <UL
                      items={[
                        "Do not trigger SOS as a prank, test, punishment, threat, or manipulation.",
                        "Do not create fake SOS alerts, fake Visit sessions, or misleading manual capture events.",
                        "Do not use SOS or manual capture to force someone to answer, meet, send money, or reveal information.",
                        "Do not misuse alerts to involve police, family, employers, schools, or public agencies under false pretenses.",
                        "If danger is immediate, use official emergency services first.",
                        "Repeated false emergency use may lead to restrictions, suspension, permanent ban, preservation of records, and lawful reporting where appropriate.",
                      ]}
                    />
                    <LinkCard
                      href="/emergency"
                      title="Emergency Disclaimer"
                      body="StayKnown does not replace Nigerian emergency agencies, U.S. 911, U.K./EU 999/112, police, ambulance, fire, medical, or official rescue services."
                    />
                  </section>

                  <section id="chat" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ChatIcon className="h-4 w-4" />}>
                      7) Chat, voice notes, stickers, media, and translation
                      safety
                    </H2>
                    <P>
                      StayKnown Chat and expressive tools must be used lawfully
                      and respectfully. Private communication remains subject to
                      safety, abuse, privacy, and acceptable-use rules.
                    </P>
                    <UL
                      items={[
                        "Do not use chat to threaten, harass, exploit, stalk, impersonate, coerce, groom, or intimidate anyone.",
                        "Do not use voice notes, stickers, video stickers, music stickers, media, files, or reactions to target or abuse someone.",
                        "Do not upload or send illegal, hateful, exploitative, stolen, private, threatening, or abusive content.",
                        "Do not use translation to impersonate, mislead, manipulate, threaten, or hide abuse.",
                        "Do not rely on translation as legal, medical, or emergency interpretation.",
                        "Report abusive chat behavior, unsafe media, or repeated unwanted contact.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/acceptable-use"
                        title="Acceptable Use"
                        body="Full behavior rules for chat, media, stories, stickers, location, contact alerts, and safety features."
                      />
                      <LinkCard
                        href="/abuse"
                        title="Abuse Reporting"
                        body="Report harassment, impersonation, threatening messages, unwanted contact, unsafe media, or fake emergency behavior."
                      />
                    </div>
                  </section>

                  <section id="stories" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ChatIcon className="h-4 w-4" />}>
                      8) Stories, profiles, and public-facing trust surfaces
                    </H2>
                    <P>
                      Stories, avatars, names, profiles, and safety gallery
                      information can help people recognize who they are
                      communicating with. They must not be used to expose,
                      shame, stalk, impersonate, or pressure anyone.
                    </P>
                    <UL
                      items={[
                        "Do not post stories to target, shame, threaten, or expose another person.",
                        "Do not impersonate another person using names, avatars, videos, images, or profile details.",
                        "Do not use story replies to pressure or harass someone.",
                        "Do not use place labels, backgrounds, profile cues, or media to reveal someone’s private location without permission.",
                        "Do not upload another person’s image or private content without permission or lawful basis.",
                      ]}
                    />
                  </section>

                  <section id="minors" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      9) Minor safety, guardians, schools, and vulnerable users
                    </H2>
                    <P>
                      Minors and vulnerable users require heightened care.
                      StayKnown must never be used to exploit, groom, threaten,
                      manipulate, secretly monitor, or control a child, teen,
                      dependent, student, employee, or vulnerable person.
                    </P>
                    <UL
                      items={[
                        "Under 13 users are not permitted to create an account or use StayKnown.",
                        "Ages 13–15 may use StayKnown only with active permission and supervision of a parent or legal guardian where allowed.",
                        "Ages 16–17 may use StayKnown with parent or legal guardian permission/consent and lawful safety purpose where required.",
                        "Adults must not use StayKnown to secretly monitor minors unless they have lawful authority and the use is consistent with applicable law and safety purpose.",
                        "Schools, organizations, churches, nonprofits, workplaces, and youth programs should use StayKnown only with proper notice, consent, and role clarity.",
                        "Reports involving minors, grooming, exploitation, stalking, coercion, or credible threats may receive heightened review and enforcement.",
                      ]}
                    />
                    <LinkCard
                      href="/minors"
                      title="Child Safety & Minor Use"
                      body="Dedicated child, teen, guardian, school, family, and vulnerable-user safety policy."
                    />
                  </section>

                  <section id="vpn" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      10) VPN, device integrity, and reliability rules
                    </H2>
                    <P>
                      StayKnown may warn, restrict, or block certain flows where
                      VPN, fake GPS, modified-device behavior, emulators, or
                      suspicious signals can reduce safety reliability.
                    </P>
                    <UL
                      items={[
                        "Do not use VPNs, fake GPS, spoofing tools, emulators, automation, modified apps, or device manipulation to mislead StayKnown or contacts.",
                        "Do not bypass safety gates, plan limits, contact approval, biometric checks, SOS verification, or enforcement restrictions.",
                        "VPN use may reduce location confidence and may cause safety gates, warnings, restrictions, or Visit interruption behavior.",
                        "Mid-Visit VPN disruption may affect alerts and trusted-contact confidence.",
                        "Device and network integrity checks exist to protect users and reduce abuse.",
                      ]}
                    />
                    <LinkCard
                      href="/security"
                      title="Security Disclosure"
                      body="Responsible disclosure route for vulnerability reports and platform-integrity concerns."
                    />
                  </section>

                  <section id="global" className="scroll-mt-24 space-y-3">
                    <H2 icon={<GlobeIcon className="h-4 w-4" />}>
                      11) Nigeria, United States, United Kingdom, EU, and global
                      use
                    </H2>
                    <P>
                      StayKnown may support users in different countries, but
                      privacy laws, emergency systems, telecom reliability, map
                      coverage, school rules, workplace rules, and consent
                      expectations differ by region.
                    </P>

                    <H3>Nigeria usage language</H3>
                    <UL
                      items={[
                        "In Nigeria, StayKnown should be used for lawful personal, family, community, travel, workplace, school, and safety awareness with trusted people.",
                        "Users must not use StayKnown to shame, threaten, monitor, extort, pressure, or control another person.",
                        "Contacts should understand that network issues, power, road conditions, rural coverage, city congestion, device quality, and provider delays may affect alerts.",
                        "If immediate danger is suspected, contacts should use appropriate local channels, which may include trusted family, local police, medical help, FRSC, NSCDC, NEMA, state emergency agencies, private security, or nearby responsible responders depending on the situation.",
                        "StayKnown does not replace Nigerian police, ambulance, hospitals, fire service, road safety, civil defence, disaster management, or any official authority.",
                      ]}
                    />

                    <H3>United States usage language</H3>
                    <UL
                      items={[
                        "In the United States, StayKnown is not 911, a public safety answering point, law enforcement, EMS, fire department, or rescue provider.",
                        "Users must respect state and federal laws on stalking, harassment, privacy, location sharing, minors, workplace monitoring, and protective orders.",
                        "If immediate danger is suspected, contact 911 or the correct local emergency service.",
                      ]}
                    />

                    <H3>United Kingdom, EU, and other countries</H3>
                    <UL
                      items={[
                        "In the U.K. and EU, users and contacts should use official emergency numbers such as 999 or 112 where immediate danger is suspected.",
                        "European users may have stricter consent, data protection, transparency, and privacy rights for location, contact, and safety data.",
                        "In all countries, users must not use StayKnown to violate local laws, privacy rules, employment rules, school rules, family court orders, child-protection rules, sanctions rules, telecom rules, or emergency-service laws.",
                      ]}
                    />
                  </section>

                  <section id="prohibited" className="scroll-mt-24 space-y-3">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      12) Prohibited uses
                    </H2>
                    <P>
                      The following uses are prohibited and may lead to
                      warnings, restrictions, suspensions, permanent bans,
                      preservation of records, official reporting, or legal
                      cooperation where appropriate.
                    </P>
                    <UL
                      items={[
                        "Stalking, harassment, intimidation, threats, coercion, retaliation, bullying, or control.",
                        "Hidden tracking, covert surveillance, unauthorized monitoring, or location collection without lawful basis and required consent.",
                        "False emergencies, fake SOS alerts, prank alerts, hoaxes, swatting, or misleading safety claims.",
                        "Impersonation of users, contacts, guardians, responders, officials, medical workers, law enforcement, or StayKnown staff.",
                        "Violence, kidnapping, trafficking, forced movement, exploitation, grooming, extortion, blackmail, doxxing, or physical-harm coordination.",
                        "Fraud, scams, payment abuse, account deception, chargeback abuse, money laundering, or illegal financial activity.",
                        "Violating protective orders, restraining orders, custody rules, school rules, workplace restrictions, or similar legal boundaries.",
                        "Spamming contacts, mass messaging, unwanted notifications, or repeated requests after someone declines or blocks.",
                        "Bypassing plan limits, safety gates, contact approval, device checks, VPN rules, SOS verification, or enforcement restrictions.",
                        "Reverse engineering, scraping, API abuse, automation, fake GPS, bot activity, or interference with service integrity.",
                        "Uploading or sending illegal, hateful, exploitative, stolen, threatening, or abusive content.",
                      ]}
                    />
                  </section>

                  <section id="recipient" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ContactIcon className="h-4 w-4" />}>
                      13) Recipient and trusted-contact duties
                    </H2>
                    <P>
                      Recipients of StayKnown alerts must act responsibly.
                      Receiving safety context does not grant ownership over the
                      user, the user’s movement, or the user’s private
                      information.
                    </P>
                    <UL
                      items={[
                        "Use alerts to support safety, not to shame, monitor, follow, threaten, or control the user.",
                        "Treat location and timestamps as approximate and possibly delayed.",
                        "Do not share alert links, screenshots, map links, profile details, or private information unnecessarily.",
                        "Do not attempt unsafe confrontation or reckless intervention.",
                        "Contact official emergency services or appropriate local safety channels if danger seems credible.",
                        "Report misuse if alerts appear abusive, fake, coercive, or unsafe.",
                      ]}
                    />
                  </section>

                  <section id="report" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ReportIcon className="h-4 w-4" />}>
                      14) Reporting abuse or safety concerns
                    </H2>
                    <P>
                      Report abuse when StayKnown is used for stalking,
                      harassment, threats, fraud, false alerts, coercion,
                      contact abuse, minor exploitation, impersonation, or
                      unsafe behavior.
                    </P>
                    <UL
                      items={[
                        "Use the subject line: StayKnown Safety Report.",
                        "Include dates, times, usernames, emails, profiles, alert examples, screenshots, or session details if safe.",
                        "Explain whether you asked the person to stop.",
                        "Tell us if there is a minor, protective order, immediate danger, or legal concern.",
                        "Do not put yourself in danger to collect evidence.",
                        "If immediate danger exists, contact local emergency services first.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/abuse"
                        title="Abuse Reporting"
                        body="Dedicated route for reporting stalking, harassment, unwanted contact, impersonation, false emergencies, and unsafe use."
                      />
                      <LinkCard
                        href="/law"
                        title="Law Enforcement & Emergency Requests"
                        body="Official request handling, emergency disclosure, preservation, and legal process."
                      />
                    </div>
                  </section>

                  <section id="enforcement" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      15) Enforcement, safety review, and appeals
                    </H2>
                    <P>
                      StayKnown may use technical, policy, and support processes
                      to reduce misuse and protect users, contacts, and the
                      public.
                    </P>
                    <UL
                      items={[
                        "Warnings or safety education.",
                        "Temporary or permanent restrictions on contacts, alerts, chat, stories, media, manual capture, SOS, Visit, or account features.",
                        "Contact removal, request blocking, thread blocking, or visibility limits.",
                        "Account suspension or permanent account ban.",
                        "Device, network, payment, or identifier restrictions.",
                        "Removal or restriction of abusive content.",
                        "Preservation of records where appropriate.",
                        "Cooperation with valid legal process or emergency disclosure rules where applicable.",
                      ]}
                    />
                    <P>
                      If you believe an enforcement action was a mistake, you
                      may contact support for review. StayKnown is not required
                      to restore access where risk remains.
                    </P>
                  </section>

                  <section id="legal" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      16) Legal cooperation and preservation
                    </H2>
                    <P>
                      StayKnown respects applicable law and may respond to valid
                      legal process. We may preserve or disclose information if
                      required by law or if necessary to enforce policies,
                      protect rights and safety, prevent fraud, or prevent harm.
                    </P>
                    <UL
                      items={[
                        "StayKnown may preserve logs and records where required by law or reasonably needed to investigate abuse, threats, fraud, or safety risks.",
                        "StayKnown may cooperate with valid legal process.",
                        "StayKnown may review emergency disclosure requests where there is credible risk of serious harm.",
                        "StayKnown does not support covert surveillance or unlawful monitoring.",
                        "StayKnown may reject, narrow, or challenge requests that are overbroad, unlawful, unsafe, unclear, or connected to misuse.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/law"
                        title="Law Enforcement & Emergency Requests"
                        body="Dedicated policy for official requests, emergency disclosure, preservation, and legal process."
                      />
                      <LinkCard
                        href="/retention"
                        title="Data Retention"
                        body="How safety logs, contact records, location records, chat metadata, and legal holds may be kept."
                      />
                    </div>
                  </section>

                  <section id="contact" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ReportIcon className="h-4 w-4" />}>
                      17) Contact and related policies
                    </H2>
                    <P>
                      For safety questions, abuse reports, contact approval
                      concerns, privacy concerns, legal concerns, or security
                      reports, use the appropriate StayKnown support route.
                    </P>
                    <UL
                      items={[
                        "Support: support@stay-known.com",
                        "Report immediate danger to official emergency services first.",
                        "Use Abuse Reporting for stalking, harassment, unwanted contact, impersonation, false emergency use, or unsafe behavior.",
                        "Use Security Disclosure for vulnerability reports or platform-integrity concerns.",
                        "Use Law Enforcement & Emergency Requests for valid official requests, preservation, or urgent legal concerns.",
                      ]}
                    />

                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/terms"
                        title="Terms of Service"
                        body="Main agreement for accounts, lawful use, safety limits, subscriptions, enforcement, and liability limits."
                      />
                      <LinkCard
                        href="/privacy"
                        title="Privacy Policy"
                        body="How StayKnown processes account, location, contact, chat, media, payment, retention, and legal request data."
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
                        href="/acceptable-use"
                        title="Acceptable Use"
                        body="Detailed prohibited-use rules for accounts, chat, media, stories, location, alerts, and contact features."
                      />
                      <LinkCard
                        href="/emergency"
                        title="Emergency Disclaimer"
                        body="StayKnown is not an official emergency service in Nigeria, the U.S., U.K./EU, or any country."
                      />
                    </div>
                  </section>

                  <section className="space-y-3 rounded-[1.6rem] border border-black/10 bg-black/[0.025] p-5 dark:border-white/10 dark:bg-white/[0.03]">
                    <H2>18) Changes to this Safety & Anti-Stalking Policy</H2>
                    <P>
                      StayKnown may update this policy to reflect new safety
                      features, contact flows, SOS behavior, chat rules, abuse
                      reporting improvements, legal requirements,
                      country-specific expectations, or operational needs. If
                      updates are material, StayKnown may provide notice through
                      the app, website, email, or another reasonable method.
                    </P>
                  </section>

                  <section className="space-y-3 rounded-[1.6rem] border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.035]">
                    <H2>Appendix A — In-app short safety notice</H2>
                    <P>
                      StayKnown is built for lawful, voluntary, consent-aware
                      safety use. Do not use StayKnown for stalking, harassment,
                      intimidation, hidden tracking, coercion, impersonation,
                      false emergencies, fraud, exploitation, or unlawful
                      monitoring. Contacts and SOS responders must use safety
                      information responsibly. StayKnown does not replace
                      official emergency services in Nigeria, the United States,
                      the United Kingdom, the European Union, or any country. If
                      immediate danger exists, contact local emergency services
                      first.
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
