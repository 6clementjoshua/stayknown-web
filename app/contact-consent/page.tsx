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
      "StayKnown Contact Approval & Consent Policy | Approved Contacts, SOS Responders & Safety Permissions";

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
      "Read the StayKnown Contact Approval & Consent Policy covering approved emergency contacts, SOS responders, contact invitations, consent records, blocked-add settings, removals, Nigeria and global safety use, and anti-stalking protections.",
    );
    upsertMeta(
      "keywords",
      "StayKnown contact consent, approved contacts, emergency contact approval, SOS responder consent, safety app consent, anti-stalking contact policy, Nigeria safety app, trusted contacts, emergency contact app, live location consent, contact approval policy",
    );
    upsertMeta("robots", "index, follow");
    upsertMeta("author", "6 Clement Joshua");
    upsertProperty(
      "og:title",
      "StayKnown Contact Approval & Consent Policy | Trusted Safety Contacts",
    );
    upsertProperty(
      "og:description",
      "How StayKnown handles approved contacts, SOS responders, consent, removal, blocked-add settings, trusted-contact responsibilities, and safety misuse prevention.",
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

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M20 6.8 9.6 17.2 4 11.6"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M4.5 7.2c0-1.1.9-2 2-2h11c1.1 0 2 .9 2 2v9.6c0 1.1-.9 2-2 2h-11c-1.1 0-2-.9-2-2V7.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="m5.3 7.1 6.7 5.2 6.7-5.2"
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
  tone?: "normal" | "danger" | "safe" | "law" | "consent";
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
        tone === "consent" &&
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

function ConsentIllustration() {
  return (
    <div className="relative mx-auto h-[280px] w-[190px] md:h-[320px] md:w-[220px]">
      <div className="absolute inset-0 animate-[softPulse_4s_ease-in-out_infinite] rounded-[2.2rem] bg-emerald-400/15 blur-2xl" />
      <div className="relative h-full w-full rounded-[2rem] border border-black/15 bg-white/75 p-3 shadow-2xl backdrop-blur dark:border-white/15 dark:bg-white/[0.055]">
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-black/20 dark:bg-white/20" />
        <div className="rounded-[1.5rem] border border-black/10 bg-gradient-to-b from-white to-zinc-100 p-4 dark:border-white/10 dark:from-white/[0.10] dark:to-white/[0.03]">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-black text-white dark:bg-white dark:text-black">
              <ContactIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-black tracking-[0.18em] text-zinc-500 dark:text-white/35">
                TRUSTED CONTACT
              </div>
              <div className="text-[13px] font-black text-zinc-950 dark:text-white">
                Approval Flow
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {[
              ["Requested", "User asks contact to join"],
              ["Reviewed", "Contact sees the safety role"],
              ["Approved", "Access becomes trusted"],
              ["Removable", "Consent can be withdrawn"],
            ].map(([title, body], index) => (
              <div
                key={title}
                className="animate-[riseIn_0.7s_ease_both] rounded-2xl border border-black/10 bg-white/80 p-3 dark:border-white/10 dark:bg-black/20"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <div className="text-[12px] font-black text-zinc-900 dark:text-white/90">
                      {title}
                    </div>
                    <div className="mt-0.5 text-[10.5px] font-semibold text-zinc-500 dark:text-white/45">
                      {body}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-2xl border border-black/10 bg-black/[0.035] px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="text-[10.5px] font-black uppercase tracking-[0.16em] text-zinc-500 dark:text-white/35">
            Consent-first
          </div>
          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.9)]" />
        </div>
      </div>
    </div>
  );
}

export default function ContactConsentPage() {
  const { theme, setTheme } = useThemeMode();
  useSeoMeta();

  const nav = useMemo(
    () =>
      [
        ["summary", "Summary"],
        ["purpose", "Purpose"],
        ["roles", "Contact roles"],
        ["approval", "Approval flow"],
        ["responsibilities", "Responsibilities"],
        ["removal", "Removal & blocking"],
        ["sos", "SOS responders"],
        ["minors", "Minors & guardians"],
        ["global", "Nigeria & global use"],
        ["misuse", "Misuse"],
        ["records", "Consent records"],
        ["contact", "Contact"],
      ] as const,
    [],
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "StayKnown Contact Approval & Consent Policy",
    dateModified: UPDATED_AT,
    version: VERSION,
    publisher: {
      "@type": "Organization",
      name: "StayKnown",
      brand: "A 6 Clement Joshua service™",
      url: "https://stay-known.com",
    },
    description:
      "Contact approval and consent policy for StayKnown covering emergency contacts, SOS responders, approved contacts, consent records, removals, blocked-add settings, Nigeria and global safety use, and anti-stalking protections.",
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
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(16,185,129,0.16),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(139,92,246,0.14),transparent_28%)]" />

              <div className="relative grid gap-8 md:grid-cols-[1fr_260px] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill>Contact Consent</Pill>
                    <Pill>Approved Contacts</Pill>
                    <Pill>SOS Responders</Pill>
                  </div>

                  <h1 className="mt-5 max-w-3xl text-[30px] font-black tracking-[-0.045em] text-zinc-950 dark:text-white/95 md:text-[46px] md:leading-[1.02]">
                    StayKnown Contact Approval & Consent Policy for trusted
                    safety contacts and SOS responders.
                  </h1>

                  <p className="mt-5 max-w-3xl text-[14.5px] font-semibold leading-relaxed text-zinc-700 dark:text-white/62 md:text-[15px]">
                    This policy explains how StayKnown handles approved
                    emergency contacts, SOS responders, consent records,
                    blocked-add settings, contact removals, invitation flows,
                    trusted-contact responsibilities, Nigeria and global usage,
                    and protection against stalking, harassment, coercion, and
                    hidden monitoring.
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

                <ConsentIllustration />
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
              <aside className="border-b border-black/10 bg-black/[0.02] p-5 dark:border-white/10 dark:bg-black/20 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:p-6">
                <div className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-white/35">
                  On this page
                </div>

                <nav
                  aria-label="Contact Approval and Consent Policy sections"
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
                    <ContactIcon className="h-4 w-4" />
                    Consent rule
                  </div>
                  <p className="mt-2 text-[12px] font-semibold leading-relaxed text-zinc-600 dark:text-white/45">
                    Safety access must be intentional, trusted, and lawful. No
                    person should be forced, tricked, spammed, or secretly
                    placed into a safety role.
                  </p>
                </div>
              </aside>

              <div className="p-5 md:p-8">
                <div className="space-y-8">
                  <section id="summary" className="scroll-mt-24 space-y-4">
                    <H2 icon={<ContactIcon className="h-4 w-4" />}>
                      1) Consent summary
                    </H2>
                    <P>
                      StayKnown is built around approved people, not random
                      tracking. Emergency contacts, SOS responders, and trusted
                      safety participants should understand the role they are
                      accepting and should have the ability to approve, decline,
                      remove, or block safety-contact access where the feature
                      allows.
                    </P>

                    <div className="grid gap-3 md:grid-cols-3">
                      <Callout
                        title="Contacts must be trusted"
                        body="StayKnown contact flows are for real safety relationships, not spam, intimidation, pressure, retaliation, or secret monitoring."
                        tone="safe"
                        icon={<ContactIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="Consent should be provable"
                        body="StayKnown may keep approval and consent records to prove authorization, prevent disputes, and protect users."
                        tone="consent"
                        icon={<CheckIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="Emergency limits remain"
                        body="Being a contact or SOS responder does not turn StayKnown into police, ambulance, fire service, 911, 112, 999, or official emergency dispatch."
                        tone="danger"
                        icon={<AlertIcon className="h-5 w-5" />}
                      />
                    </div>
                  </section>

                  <section id="purpose" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      2) Purpose of approved contacts
                    </H2>
                    <P>
                      Approved contacts help a user stay known during safety
                      moments. They may receive Visit updates, live map links,
                      SOS alerts, manual capture updates, chat safety context,
                      safety gallery context, or other alerts depending on the
                      feature, plan, region, and user permissions.
                    </P>
                    <UL
                      items={[
                        "To help trusted people know when a user has started, updated, or ended a safety session.",
                        "To help contacts understand location or map context during active Visit, SOS, manual capture, or chat safety flows.",
                        "To make safety alerts more meaningful by showing the user’s identity, profile, or safety gallery context where supported.",
                        "To create a consent-based system that discourages stalking, harassment, hidden tracking, and unwanted monitoring.",
                        "To support lawful family, friend, workplace, community, travel, event, school, or personal safety arrangements where allowed.",
                      ]}
                    />
                  </section>

                  <section id="roles" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ContactIcon className="h-4 w-4" />}>
                      3) Contact roles inside StayKnown
                    </H2>

                    <H3>3.1 Emergency contacts</H3>
                    <P>
                      Emergency contacts are people a user chooses for safety
                      awareness. They may receive alerts, map links, updates, or
                      communication related to visits, manual capture, or safety
                      events.
                    </P>

                    <H3>3.2 SOS responders</H3>
                    <P>
                      SOS responders may receive stronger urgent safety alerts
                      when the user activates SOS. A user should only choose SOS
                      responders who are able and willing to take safety alerts
                      seriously.
                    </P>

                    <H3>3.3 Approved chat contacts</H3>
                    <P>
                      Approved chat contacts may be able to communicate through
                      StayKnown Chat, view safety context connected to messages,
                      and use chat map features where supported.
                    </P>

                    <H3>3.4 Visitors and map viewers</H3>
                    <P>
                      A map viewer may be able to open a permitted StayKnown map
                      link only because the user’s safety flow allowed it. A map
                      viewer does not receive unlimited account access.
                    </P>

                    <Example
                      title="Plain examples"
                      items={[
                        "A sibling approved as an emergency contact may receive Visit updates.",
                        "A parent approved as an SOS responder may receive urgent SOS context.",
                        "A friend approved for chat may see chat safety context connected to messages.",
                        "A contact who was not approved should not receive private safety access just because they know the user.",
                      ]}
                    />
                  </section>

                  <section id="approval" className="scroll-mt-24 space-y-3">
                    <H2 icon={<MailIcon className="h-4 w-4" />}>
                      4) Contact approval and invitation flow
                    </H2>
                    <P>
                      StayKnown may use email, app notification, web approval
                      pages, pending states, consent checkboxes, and status
                      updates to help users and contacts understand whether a
                      safety relationship has been requested, approved,
                      declined, expired, removed, or blocked.
                    </P>
                    <UL
                      items={[
                        "A user may request to add a contact by providing the contact identifier required by the app.",
                        "The contact may receive a message explaining the safety role, the user who requested it, and what approval means.",
                        "The contact may approve, decline, ignore, or allow the request to expire depending on the feature.",
                        "The app may show pending, approved, declined, expired, or removed status.",
                        "Approved status may be required before Visit, SOS, chat, live map, or safety-gallery access becomes active.",
                        "If the request expires, the user may need to resend the request where the app allows.",
                      ]}
                    />
                    <Callout
                      title="No silent enrollment"
                      body="StayKnown should not be used to secretly place a person into a safety role. The approval flow exists so contacts understand the relationship and can make a choice."
                      tone="law"
                      icon={<MailIcon className="h-5 w-5" />}
                    />
                  </section>

                  <section
                    id="responsibilities"
                    className="scroll-mt-24 space-y-3"
                  >
                    <H2 icon={<CheckIcon className="h-4 w-4" />}>
                      5) Responsibilities of users and contacts
                    </H2>

                    <H3>5.1 User responsibilities</H3>
                    <UL
                      items={[
                        "Use accurate contact information and do not add people deceptively.",
                        "Tell contacts why you are adding them and what alerts they may receive.",
                        "Respect declines, removals, blocked-add settings, and requests to stop.",
                        "Do not use StayKnown to pressure someone into approving a request.",
                        "Remove contacts who should no longer receive safety updates.",
                        "Do not send false SOS alerts, prank safety updates, or repeated unwanted notifications.",
                      ]}
                    />

                    <H3>5.2 Contact responsibilities</H3>
                    <UL
                      items={[
                        "Use received safety information only for the safety purpose intended.",
                        "Do not publish, sell, leak, shame, threaten, exploit, or misuse another person’s location or safety data.",
                        "Do not use map access as permission to stalk, follow, control, harass, or confront someone unsafely.",
                        "If a safety alert appears urgent, contact the user where safe and use appropriate local emergency channels if danger is suspected.",
                        "If you no longer want the role, use available removal or support options.",
                      ]}
                    />

                    <Example
                      title="Responsible response examples"
                      items={[
                        "If a user sends an SOS, call them first if safe and possible.",
                        "If the user cannot be reached and danger seems credible, contact appropriate local emergency channels.",
                        "In Nigeria, that may include family, trusted responders, local security, police, medical help, FRSC, state emergency channels, or other relevant local support depending on the situation.",
                        "In the U.S., U.K., EU, or other countries, use the official emergency number and local safety guidance where immediate danger is suspected.",
                      ]}
                    />
                  </section>

                  <section id="removal" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      6) Removal, blocked-add settings, and withdrawal of
                      consent
                    </H2>
                    <P>
                      Consent should not be treated as permanent when the
                      relationship or safety need changes. StayKnown may provide
                      controls for removal, blocking additions, declining
                      requests, or contacting support.
                    </P>
                    <UL
                      items={[
                        "Users may remove contacts where the app allows.",
                        "Contacts may decline or withdraw from a role where the flow allows.",
                        "A user may be able to block other people from adding them as a contact depending on security settings.",
                        "If blocked-add settings are enabled, other users should receive a friendly notice that the person cannot be added because of their safety settings.",
                        "Repeated attempts to add someone who declined, blocked, or asked to stop may be treated as harassment.",
                        "StayKnown may remove or restrict contacts if abuse, impersonation, spam, stalking, coercion, or legal risk is detected.",
                      ]}
                    />
                    <LinkCard
                      href="/abuse"
                      title="Abuse Reporting"
                      body="Report unwanted contact requests, repeated approval pressure, impersonation, stalking, harassment, or unsafe behavior."
                    />
                  </section>

                  <section id="sos" className="scroll-mt-24 space-y-3">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      7) SOS responders and urgent alert consent
                    </H2>
                    <P>
                      SOS responder access is sensitive because it may involve
                      urgent alerts, location, safety gallery context, live map
                      links, and emergency status. Users should only add people
                      who understand the responsibility and are likely to
                      respond responsibly.
                    </P>
                    <UL
                      items={[
                        "SOS responders should know they may receive urgent alerts.",
                        "SOS responders should not treat StayKnown alerts as guaranteed official emergency dispatch.",
                        "SOS responders should use judgment and contact official emergency services where immediate danger is suspected.",
                        "Users must not add unwilling people as SOS responders.",
                        "False SOS alerts, repeated fake emergency use, or alerting people to intimidate them is prohibited.",
                        "StayKnown may require stronger consent, confirmation, or audit records for SOS-related flows.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/location-safety"
                        title="Location & Live Safety"
                        body="How Visit sessions, SOS alerts, manual capture, live maps, chat maps, and VPN gates work."
                      />
                      <LinkCard
                        href="/emergency"
                        title="Emergency Disclaimer"
                        body="Important safety limits: StayKnown does not replace official emergency services in any country."
                      />
                    </div>
                  </section>

                  <section id="minors" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      8) Minors, guardians, families, schools, and vulnerable
                      users
                    </H2>
                    <P>
                      Contact consent is especially important when minors or
                      vulnerable users are involved. StayKnown must not be used
                      to exploit, groom, threaten, secretly monitor, or control
                      a child, teen, dependent, student, employee, or vulnerable
                      person.
                    </P>
                    <UL
                      items={[
                        "Under 13 users are not permitted to create an account or use StayKnown.",
                        "Ages 13–15 may use StayKnown only with active parent or legal guardian permission and supervision, where allowed.",
                        "Ages 16–17 may use StayKnown with parent or legal guardian permission/consent and lawful safety purpose, where required.",
                        "If local law requires stricter age, guardian, school, workplace, or data rules, the stricter rule applies.",
                        "Adults must not use StayKnown to secretly monitor minors unless they have lawful authority and the use is consistent with applicable law and safety purpose.",
                        "Schools, organizations, churches, nonprofits, workplaces, and youth programs should use StayKnown only with proper notice, consent, and role clarity.",
                      ]}
                    />
                    <LinkCard
                      href="/minors"
                      title="Child Safety & Minor Use"
                      body="Read the dedicated child, teen, guardian, and vulnerable-user safety policy."
                    />
                  </section>

                  <section id="global" className="scroll-mt-24 space-y-3">
                    <H2 icon={<GlobeIcon className="h-4 w-4" />}>
                      9) Nigeria, United States, United Kingdom, EU, and global
                      use
                    </H2>
                    <P>
                      StayKnown can support users in different countries, but
                      consent, privacy, emergency response, telecom reliability,
                      family rules, workplace rules, and location-sharing laws
                      differ by region. Users and contacts must follow the law
                      where they live and where the safety event happens.
                    </P>

                    <H3>Nigeria usage language</H3>
                    <UL
                      items={[
                        "In Nigeria, StayKnown should be used for lawful personal, family, community, workplace, travel, and safety awareness with trusted people.",
                        "Users should not add contacts to shame, threaten, monitor, extort, or pressure anyone.",
                        "Contacts should understand that network issues, power, rural coverage, city congestion, road conditions, and provider delays may affect alerts.",
                        "If immediate danger is suspected, Nigerian contacts should use appropriate local channels, which may include trusted family, local police, medical help, FRSC, NSCDC, NEMA, state emergency agencies, private security, or nearby responsible responders depending on the situation.",
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
                        "European users may have stricter consent, data protection, transparency, and privacy rights for location and contact data.",
                        "In all countries, users must not use StayKnown to violate local laws, privacy rules, employment rules, school rules, family court orders, child-protection rules, or emergency-service laws.",
                      ]}
                    />
                  </section>

                  <section id="misuse" className="scroll-mt-24 space-y-3">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      10) Prohibited misuse of contact and consent features
                    </H2>
                    <UL
                      items={[
                        "No adding people without permission for harassment, intimidation, revenge, monitoring, spam, or coercion.",
                        "No repeated requests after a person declines, blocks, removes, or asks to stop.",
                        "No impersonating another person to gain contact approval.",
                        "No tricking a contact into approving a role they do not understand.",
                        "No using StayKnown to violate protective orders, restraining orders, no-contact orders, custody rules, school rules, workplace rules, or local law.",
                        "No using contact alerts to frighten, shame, manipulate, extort, or control someone.",
                        "No selling, leaking, posting, exposing, or misusing location or safety data received as an approved contact.",
                        "No fake emergencies, false SOS, swatting, prank safety alerts, or repeated manual captures designed to scare contacts.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/safety"
                        title="Safety & Anti-Stalking"
                        body="Dedicated rules against stalking, harassment, coercive control, protective-order violations, and unsafe monitoring."
                      />
                      <LinkCard
                        href="/acceptable-use"
                        title="Acceptable Use"
                        body="Full behavior rules for accounts, chat, media, contacts, location, alerts, and safety features."
                      />
                    </div>
                  </section>

                  <section id="records" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      11) Consent records, retention, and legal handling
                    </H2>
                    <P>
                      StayKnown may keep contact approval and consent records to
                      prove authorization, support app functionality, resolve
                      disputes, protect contacts, prevent abuse, handle legal
                      requests, and support safety investigations.
                    </P>
                    <UL
                      items={[
                        "Consent records may include requester, requested contact, role, approval state, timestamps, expiration state, decline state, removal state, and audit metadata.",
                        "Notification records may include delivery state, email or push delivery metadata, event type, and timestamp.",
                        "Blocked-add settings may be stored to prevent unwanted contact requests.",
                        "Records may be retained longer where needed for safety, fraud prevention, legal compliance, abuse review, security, or dispute handling.",
                        "Deletion requests may be limited where records must be preserved for legal, safety, fraud-prevention, security, or compliance reasons.",
                        "Law enforcement or emergency requests must follow the Law Enforcement & Emergency Requests policy.",
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
                        body="Detailed retention rules for safety logs, contact consent, chat metadata, location records, and legal holds."
                      />
                    </div>
                  </section>

                  <section id="contact" className="scroll-mt-24 space-y-3">
                    <H2 icon={<MailIcon className="h-4 w-4" />}>
                      12) Contact and related policies
                    </H2>
                    <P>
                      For contact approval issues, unwanted contact requests,
                      blocked-add questions, SOS responder concerns, abuse
                      reports, legal concerns, or privacy questions, contact
                      StayKnown support.
                    </P>
                    <UL
                      items={[
                        "Support: support@stay-known.com",
                        "Use Abuse Reporting for unwanted requests, harassment, stalking, impersonation, fake emergencies, or unsafe contact behavior.",
                        "Use Law Enforcement & Emergency Requests for valid official requests, legal preservation, or urgent safety disclosure questions.",
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
                        body="How StayKnown processes contact, approval, location, chat, media, and safety data."
                      />
                      <LinkCard
                        href="/location-safety"
                        title="Location & Live Safety"
                        body="Rules for Visit sessions, LIVE sharing, SOS, manual capture, chat maps, VPN gates, and accuracy limits."
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
                    <H2>
                      13) Changes to this Contact Approval & Consent Policy
                    </H2>
                    <P>
                      StayKnown may update this policy to reflect new contact
                      flows, SOS responder rules, approval-page changes,
                      blocked-add settings, chat-contact features, legal
                      requirements, provider limitations, country-specific
                      expectations, or safety improvements. If updates are
                      material, StayKnown may provide notice through the app,
                      website, email, or another reasonable method.
                    </P>
                  </section>

                  <section className="space-y-3 rounded-[1.6rem] border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.035]">
                    <H2>Appendix A — In-app short contact consent notice</H2>
                    <P>
                      StayKnown contact features are built for approved,
                      trusted, consent-based safety relationships. Do not add
                      people secretly, deceptively, or repeatedly after they
                      decline, remove, block, or ask you to stop. Emergency
                      contacts and SOS responders may receive safety alerts,
                      location context, map links, profile or safety gallery
                      context, and notification records depending on the
                      feature. StayKnown does not replace official emergency
                      services in Nigeria, the United States, the United
                      Kingdom, the European Union, or any country. Use contact
                      features lawfully and never for stalking, harassment,
                      intimidation, coercion, impersonation, or hidden
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
