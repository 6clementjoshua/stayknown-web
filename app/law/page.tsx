"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";

const UPDATED_AT = "2026-04-30";
const VERSION = "2.1";

function fmtDate(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}

function useSeoMeta() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    document.title =
      "StayKnown Law Enforcement & Emergency Requests | Legal Process, Preservation, Safety Data & Official Requests";

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
      "Read the StayKnown Law Enforcement & Emergency Requests Policy covering legal process, preservation requests, emergency disclosure, user notice, safety records, location data, abuse investigations, Nigeria and global official-request handling.",
    );
    upsertMeta(
      "keywords",
      "StayKnown law enforcement requests, emergency disclosure request, legal process safety app, preservation request, location data request, safety app legal request, Nigeria emergency legal request, anti-stalking legal policy, user data request, official request policy",
    );
    upsertMeta("robots", "index, follow");
    upsertMeta("author", "6 Clement Joshua");
    upsertProperty(
      "og:title",
      "StayKnown Law Enforcement & Emergency Requests | Legal Process & Preservation",
    );
    upsertProperty(
      "og:description",
      "How StayKnown handles lawful requests, preservation, emergency disclosures, abuse investigations, user notice, and anti-surveillance safeguards.",
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

function LawIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 4.2v15.6M7.2 7.4h9.6M6 7.4l-3.2 5.7h6.4L6 7.4Zm12 0-3.2 5.7h6.4L18 7.4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.2 19.8h7.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
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
      className="scroll-mt-24 text-[18px] font-black tracking-[-0.025em] text-white md:text-[20px]"
    >
      <span className="inline-flex items-center gap-2.5">
        {icon ? (
          <span className="grid h-8 w-8 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/85 shadow-sm">
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
    <div className="mt-4 text-[14px] font-extrabold text-white/88">
      {children}
    </div>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[13.5px] font-semibold leading-relaxed text-white/62 md:text-[14px]">
      {children}
    </p>
  );
}

function UL({ items }: { items: string[] }) {
  return (
    <ul className="ml-5 list-disc space-y-1.5 text-[13.5px] font-semibold leading-relaxed text-white/60 md:text-[14px]">
      {items.map((t, i) => (
        <li key={`${t}-${i}`}>{t}</li>
      ))}
    </ul>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-white/58">
      {children}
    </span>
  );
}

function SoftBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-[12px] font-black text-white/55">
      {children}
    </div>
  );
}

function Callout({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/[0.032] p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.052]">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/[0.04] blur-2xl" />
      <div className="relative flex gap-3">
        {icon ? (
          <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-2xl border border-white/10 bg-black/40 text-white/82">
            {icon}
          </div>
        ) : null}
        <div>
          <div className="text-[13px] font-black text-white/92">{title}</div>
          <div className="mt-2 text-[13px] font-semibold leading-relaxed text-white/60">
            {body}
          </div>
        </div>
      </div>
    </div>
  );
}

function Example({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.032] p-4">
      <div className="text-[12.5px] font-black text-white/86">{title}</div>
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
      className="group rounded-[1.35rem] border border-white/10 bg-white/[0.032] p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[13px] font-black text-white/92">{title}</div>
          <p className="mt-1.5 text-[12.5px] font-semibold leading-relaxed text-white/52">
            {body}
          </p>
        </div>
        <span className="text-white/35 transition group-hover:translate-x-0.5 group-hover:text-white/80">
          →
        </span>
      </div>
    </a>
  );
}

function FloatingBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.055),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(255,255,255,0.045),transparent_25%)]" />
      <div className="absolute left-[7%] top-[18%] h-48 w-48 animate-[floatSlow_9s_ease-in-out_infinite] rounded-full bg-white/[0.035] blur-3xl" />
      <div className="absolute right-[8%] top-[32%] h-56 w-56 animate-[floatSlow_11s_ease-in-out_infinite_reverse] rounded-full bg-white/[0.03] blur-3xl" />
      <div className="absolute bottom-[8%] left-[30%] h-60 w-60 animate-[floatSlow_13s_ease-in-out_infinite] rounded-full bg-white/[0.02] blur-3xl" />
    </div>
  );
}

function LegalIllustration() {
  return (
    <div className="relative mx-auto h-[280px] w-[190px] md:h-[320px] md:w-[220px]">
      <div className="absolute inset-0 animate-[softPulse_4s_ease-in-out_infinite] rounded-[2.2rem] bg-white/[0.045] blur-2xl" />

      <div className="relative h-full w-full rounded-[2rem] border border-white/15 bg-white/[0.055] p-3 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-white/20" />

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-white text-black">
              <LawIcon className="h-5 w-5" />
            </div>

            <div>
              <div className="text-[11px] font-black tracking-[0.18em] text-white/35">
                LEGAL REQUESTS
              </div>
              <div className="text-[13px] font-black text-white">
                Lawful Process
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {[
              ["Verify authority", "Requester and legal basis"],
              ["Narrow the scope", "Specific accounts and dates"],
              ["Preserve if lawful", "No automatic disclosure"],
              ["Protect safety", "No covert misuse"],
            ].map(([title, body], index) => (
              <div
                key={title}
                className="animate-[riseIn_0.7s_ease_both] rounded-2xl border border-white/10 bg-black/30 p-3"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="text-[12px] font-black text-white/90">
                  {title}
                </div>
                <div className="mt-1 text-[10.5px] font-semibold text-white/45">
                  {body}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
          <div className="text-[10.5px] font-black uppercase tracking-[0.16em] text-white/35">
            Request reviewed
          </div>
          <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.9)]" />
        </div>
      </div>
    </div>
  );
}

export default function LawPage() {
  useSeoMeta();

  const nav = useMemo(
    () =>
      [
        ["summary", "Summary"],
        ["principles", "Principles"],
        ["types", "Request types"],
        ["required", "Requirements"],
        ["data", "Possible data"],
        ["preservation", "Preservation"],
        ["emergency", "Emergency disclosure"],
        ["notice", "User notice"],
        ["challenge", "Reject/narrow"],
        ["international", "International"],
        ["nigeria", "Nigeria"],
        ["minors", "Minors"],
        ["abuse", "Abuse review"],
        ["retention", "Retention"],
        ["surveillance", "No surveillance"],
        ["contact", "Contact"],
      ] as const,
    [],
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "StayKnown Law Enforcement & Emergency Requests Policy",
    dateModified: UPDATED_AT,
    version: VERSION,
    publisher: {
      "@type": "Organization",
      name: "StayKnown",
      brand: "A 6 Clement Joshua service™",
      url: "https://stay-known.com",
    },
    description:
      "Law Enforcement and Emergency Requests Policy for StayKnown covering legal process, preservation requests, emergency disclosure, user notice, location data, safety records, abuse investigations, minor safety, Nigeria and global legal request handling.",
  };

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
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
            opacity: 0.55;
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

        html {
          scroll-behavior: smooth;
          color-scheme: dark;
          background: #000;
        }

        body {
          background: #000;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.001ms !important;
          }
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
              className="rounded-full bg-white object-contain p-0.5"
            />
            <div className="text-[12px] font-extrabold tracking-[0.28em] text-white">
              STAYKNOWN
            </div>
          </div>
        </div>
      </header>

      <section className="relative z-10 w-full">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 md:pt-12">
          <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/60 backdrop-blur-2xl">
            <div className="relative overflow-hidden border-b border-white/10 px-5 py-7 md:px-8 md:py-9">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(255,255,255,0.105),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.05),transparent_28%)]" />

              <div className="relative grid gap-8 md:grid-cols-[1fr_260px] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill>Legal Requests</Pill>
                    <Pill>Emergency Disclosure</Pill>
                    <Pill>Preservation</Pill>
                  </div>

                  <h1 className="mt-5 max-w-3xl text-[30px] font-black tracking-[-0.045em] text-white md:text-[46px] md:leading-[1.02]">
                    StayKnown Law Enforcement & Emergency Requests Policy for
                    lawful process, preservation, and safety disclosures.
                  </h1>

                  <p className="mt-5 max-w-3xl text-[14.5px] font-semibold leading-relaxed text-white/62 md:text-[15px]">
                    This policy explains how StayKnown may handle law
                    enforcement requests, government requests, emergency
                    disclosure requests, preservation requests, court orders,
                    subpoenas, warrants, legal process, abuse investigations,
                    safety-related cooperation, and anti-surveillance
                    safeguards.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <SoftBadge>Version {VERSION}</SoftBadge>
                    <SoftBadge>Updated: {fmtDate(UPDATED_AT)}</SoftBadge>
                  </div>
                </div>

                <LegalIllustration />
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
              <aside className="border-b border-white/10 bg-black/35 p-5 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:p-6">
                <div className="text-[12px] font-black uppercase tracking-[0.2em] text-white/35">
                  On this page
                </div>

                <nav
                  aria-label="Law Enforcement and Emergency Requests Policy sections"
                  className="mt-4 grid gap-1.5"
                >
                  {nav.map(([id, label]) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      className="rounded-2xl px-3 py-2 text-[12.5px] font-bold text-white/50 transition hover:bg-white/[0.06] hover:text-white"
                    >
                      {label}
                    </a>
                  ))}
                </nav>

                <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/[0.032] p-4">
                  <div className="flex items-center gap-2 text-[12px] font-black text-white/88">
                    <LawIcon className="h-4 w-4" />
                    Legal route
                  </div>
                  <p className="mt-2 text-[12px] font-semibold leading-relaxed text-white/50">
                    StayKnown does not support casual data requests, covert
                    tracking, stalking, or unlawful monitoring. Requests must be
                    lawful, specific, and safety-aware.
                  </p>
                </div>
              </aside>

              <div className="p-5 md:p-8">
                <div className="space-y-8">
                  <section id="summary" className="scroll-mt-24 space-y-4">
                    <H2 icon={<LawIcon className="h-4 w-4" />}>
                      1) Legal request summary
                    </H2>
                    <P>
                      StayKnown exists to help people move, visit, communicate,
                      and share safety context with trusted people. Because the
                      Service may process safety sessions, contacts,
                      notifications, location context, account records, chat
                      metadata, payment records, and abuse-prevention signals,
                      legal requests must be handled carefully.
                    </P>

                    <div className="grid gap-3 md:grid-cols-3">
                      <Callout
                        title="Valid process matters"
                        body="StayKnown may respond to valid legal process where required or permitted by applicable law."
                        icon={<LawIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="Preservation is not disclosure"
                        body="Preserving records may prevent deletion while proper legal review is pending, but it does not automatically release data."
                        icon={<ArchiveIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="No covert surveillance"
                        body="StayKnown does not support stalking, hidden monitoring, harassment, coercion, or unlawful user-data requests."
                        icon={<AlertIcon className="h-5 w-5" />}
                      />
                    </div>
                  </section>

                  <section id="principles" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      2) Legal request principles
                    </H2>
                    <UL
                      items={[
                        "StayKnown respects applicable laws and may respond to valid legal process as required.",
                        "StayKnown reviews requests for proper authority, scope, clarity, urgency, safety risk, and legal basis.",
                        "StayKnown may reject, narrow, or ask for clarification if a request is overbroad, vague, informal, unsafe, or inconsistent with applicable law.",
                        "StayKnown does not support covert surveillance, stalking, harassment, coercion, retaliation, or unlawful monitoring.",
                        "StayKnown may preserve relevant logs and records where required by law or where reasonably needed to investigate abuse, threats, fraud, safety risks, or legal process.",
                        "StayKnown may cooperate with lawful emergency requests where there is credible risk of death, serious injury, kidnapping, trafficking, exploitation, or imminent harm.",
                        "StayKnown aims to protect user privacy while also supporting lawful safety, child protection, fraud prevention, and emergency needs.",
                      ]}
                    />
                  </section>

                  <section id="types" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ReportIcon className="h-4 w-4" />}>
                      3) Types of requests StayKnown may receive
                    </H2>
                    <P>
                      StayKnown may receive different types of requests from law
                      enforcement, courts, regulators, government agencies,
                      lawyers, users, contacts, guardians, or safety reporters.
                      Not every request results in disclosure.
                    </P>

                    <H3>3.1 Preservation requests</H3>
                    <P>
                      A preservation request asks StayKnown to preserve existing
                      records for a limited period while valid legal process is
                      obtained. Preservation does not automatically mean
                      disclosure.
                    </P>

                    <H3>3.2 Legal process</H3>
                    <P>
                      Legal process may include a subpoena, court order,
                      warrant, regulatory demand, legal notice, production
                      order, or other formal request that is valid under
                      applicable law.
                    </P>

                    <H3>3.3 Emergency disclosure requests</H3>
                    <P>
                      Emergency requests may involve credible risk of death,
                      serious physical injury, kidnapping, trafficking,
                      exploitation, child-safety risk, or imminent harm. These
                      requests are reviewed with urgency.
                    </P>

                    <H3>3.4 User, contact, or guardian reports</H3>
                    <P>
                      Users, contacts, and guardians may report abuse, stalking,
                      harassment, threats, fraud, false emergencies,
                      child-safety concerns, or suspicious activity. Those
                      reports may lead to safety review, enforcement, record
                      preservation, or legal cooperation where appropriate.
                    </P>
                  </section>

                  <section id="required" className="scroll-mt-24 space-y-3">
                    <H2 icon={<MailIcon className="h-4 w-4" />}>
                      4) What legal requests should include
                    </H2>
                    <P>
                      To help StayKnown review a request efficiently, legal
                      requests should be specific, lawful, dated, signed where
                      applicable, and tied to identifiable accounts or events.
                    </P>
                    <UL
                      items={[
                        "The requesting agency, court, authority, regulator, or legal representative.",
                        "The name, title, badge number, agency reference number, court reference, case reference, and contact information of the requester.",
                        "The legal authority for the request.",
                        "The exact user, account, email, phone, username, session, alert, map link, contact, message, payment reference, or event being requested.",
                        "The specific data requested and the relevant date/time range.",
                        "The reason the data is needed and how it relates to the investigation, emergency, legal process, or preservation request.",
                        "A signed document, court order, subpoena, warrant, preservation letter, emergency disclosure statement, or official letterhead where applicable.",
                        "For emergency requests, a clear explanation of the imminent danger and why normal legal process cannot wait.",
                      ]}
                    />
                    <Callout
                      title="Narrow requests are safer"
                      body="Requests should be limited to the information needed. Broad requests for all user data, all sessions, all contacts, or unrelated history may be challenged, narrowed, or rejected where permitted by law."
                      icon={<LawIcon className="h-5 w-5" />}
                    />
                  </section>

                  <section id="data" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ArchiveIcon className="h-4 w-4" />}>
                      5) Categories of data that may exist
                    </H2>
                    <P>
                      The data available depends on the user’s plan, device
                      permissions, active features, region, retention settings,
                      technical logs, provider systems, and whether the user
                      actually used the relevant feature.
                    </P>
                    <UL
                      items={[
                        "Account identifiers, such as email, user ID, profile identifiers, username, and basic account metadata where available.",
                        "Safety session records, such as Visit start time, end time, session state, SOS state, manual capture events, or history records.",
                        "Location points during active safety sessions where the user granted permission and where records exist.",
                        "Notification delivery metadata, such as recipient contact identifiers, delivery status, timestamps, email metadata, push metadata, and alert type.",
                        "Contact approval, invitation, decline, expiration, removal, blocked-add, and consent-related records where applicable.",
                        "Chat, stories, stickers, media, files, safety gallery, translation, or message metadata where features are enabled and retained.",
                        "Device, network, VPN, security, rate-limit, fake GPS, platform-integrity, and abuse-prevention signals where available.",
                        "Payment, subscription, wallet, coins, receipt, chargeback, refund, and fraud-prevention records where applicable.",
                        "Support reports, abuse reports, enforcement notes, appeal records, preservation notes, and legal request records where applicable.",
                      ]}
                    />
                    <P>
                      StayKnown may not always have the data requested. Records
                      may not exist, may have expired, may not have been
                      generated, or may not be available because permissions,
                      feature states, provider behavior, or retention rules
                      limited collection.
                    </P>
                  </section>

                  <section id="preservation" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ArchiveIcon className="h-4 w-4" />}>
                      6) Preservation of records
                    </H2>
                    <P>
                      Where required by law or reasonably needed to investigate
                      abuse, fraud, threats, or safety risks, StayKnown may
                      preserve relevant logs and records. Preservation is
                      intended to prevent deletion or alteration of records
                      while proper review or legal process is pending.
                    </P>
                    <UL
                      items={[
                        "Preservation may apply to safety session logs, location records, notification delivery records, abuse reports, account records, chat metadata, payment records, support records, or relevant security logs.",
                        "Preservation does not automatically mean that records will be disclosed.",
                        "Disclosure may still require valid legal process, emergency justification, user consent, or another lawful basis.",
                        "Preserved records may be retained longer where required by law, legal process, safety investigation, fraud review, or abuse-prevention needs.",
                        "A preservation request should identify the account, session, event, date range, and legal basis clearly.",
                      ]}
                    />
                    <LinkCard
                      href="/retention"
                      title="Data Retention"
                      body="Detailed retention rules for safety logs, location records, contact records, chat metadata, support reports, payment records, and legal holds."
                    />
                  </section>

                  <section id="emergency" className="scroll-mt-24 space-y-3">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      7) Emergency disclosure requests
                    </H2>
                    <P>
                      In limited emergency situations, StayKnown may disclose
                      information if we reasonably believe disclosure is
                      necessary to prevent death, serious physical injury,
                      kidnapping, trafficking, exploitation, child-safety harm,
                      or imminent harm.
                    </P>
                    <UL
                      items={[
                        "Emergency requests should identify the person at risk.",
                        "Emergency requests should explain the immediate danger.",
                        "Emergency requests should identify the specific StayKnown account, session, alert, contact, message, map link, or event involved.",
                        "Emergency requests should come from an authorized emergency responder, law enforcement officer, safeguarding authority, child-safety authority, or appropriate authority where possible.",
                        "StayKnown may ask follow-up questions or request formal legal process after emergency disclosure where appropriate.",
                        "StayKnown may limit disclosure to what appears reasonably necessary for the emergency.",
                      ]}
                    />
                    <Callout
                      title="StayKnown is not emergency services"
                      body="If someone is in immediate danger, contact local emergency services first. StayKnown may support lawful review and emergency disclosure where appropriate, but it does not replace emergency responders."
                      icon={<AlertIcon className="h-5 w-5" />}
                    />
                    <LinkCard
                      href="/emergency"
                      title="Emergency Disclaimer"
                      body="StayKnown does not replace official emergency services in Nigeria, the U.S., U.K./EU, or any country."
                    />
                  </section>

                  <section id="notice" className="scroll-mt-24 space-y-3">
                    <H2 icon={<MailIcon className="h-4 w-4" />}>
                      8) User notice
                    </H2>
                    <P>
                      Where legally permitted and safe, StayKnown may notify a
                      user when their information is requested. However, notice
                      may be delayed or withheld when prohibited by law, when
                      the request is confidential, or when notice could create
                      risk.
                    </P>
                    <UL
                      items={[
                        "Notice may be withheld if legally prohibited.",
                        "Notice may be delayed if it could compromise an investigation.",
                        "Notice may be withheld if it could create risk of harm, retaliation, stalking, harassment, evidence destruction, child-safety harm, or platform abuse.",
                        "StayKnown may challenge overbroad gag orders or confidentiality demands where appropriate and legally permitted.",
                        "StayKnown may be unable to provide full detail about a request if doing so would violate law, expose another person, or create safety risk.",
                      ]}
                    />
                  </section>

                  <section id="challenge" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      9) When StayKnown may reject, narrow, or challenge
                      requests
                    </H2>
                    <P>
                      StayKnown may reject, narrow, or challenge requests that
                      do not meet applicable requirements or create safety,
                      privacy, legal, or misuse concerns.
                    </P>
                    <UL
                      items={[
                        "Requests that are informal, unsigned, or lack legal authority.",
                        "Requests that are too broad, vague, or not tied to identifiable accounts or events.",
                        "Requests that seek data outside the relevant time period.",
                        "Requests that conflict with applicable law, privacy obligations, or user safety.",
                        "Requests that appear to support stalking, coercion, harassment, retaliation, political intimidation, unlawful surveillance, custody misuse, workplace misuse, school misuse, or non-safety misuse.",
                        "Requests from private parties that require formal legal process before disclosure.",
                        "Requests seeking data that does not exist, was not generated, has expired, or is outside StayKnown’s control.",
                        "Requests that ask StayKnown to create new surveillance, monitor future activity, or secretly track a user outside lawful process.",
                      ]}
                    />
                  </section>

                  <section
                    id="international"
                    className="scroll-mt-24 space-y-3"
                  >
                    <H2 icon={<GlobeIcon className="h-4 w-4" />}>
                      10) International and cross-border requests
                    </H2>
                    <P>
                      StayKnown may be used by people in different countries.
                      Legal requests may involve cross-border issues, different
                      privacy rules, different emergency systems, different
                      child-protection rules, and different standards for
                      disclosure.
                    </P>
                    <UL
                      items={[
                        "Requesters should use the appropriate legal process for their jurisdiction.",
                        "Cross-border requests may require mutual legal assistance, court orders, production orders, diplomatic channels, regulator channels, or other formal routes.",
                        "StayKnown may consider applicable privacy, human rights, safety, child-protection, due-process, and data-protection obligations when reviewing requests.",
                        "Access to the Service may be limited in regions where sanctions, export controls, platform rules, app-store rules, payment restrictions, or legal restrictions apply.",
                        "StayKnown may reject or narrow requests that conflict with applicable law or create safety risk.",
                      ]}
                    />
                  </section>

                  <section id="nigeria" className="scroll-mt-24 space-y-3">
                    <H2 icon={<GlobeIcon className="h-4 w-4" />}>
                      11) Nigeria, United States, United Kingdom, EU, and global
                      official-request context
                    </H2>
                    <P>
                      Official request handling may differ by country. StayKnown
                      may consider the location of the user, the location of the
                      incident, the requester’s authority, the legal basis, the
                      data location, the emergency risk, and applicable privacy
                      or safety obligations.
                    </P>

                    <H3>Nigeria request language</H3>
                    <UL
                      items={[
                        "In Nigeria, StayKnown may receive reports or requests involving safety alerts, location context, contact abuse, fraud, scams, extortion, false SOS, kidnapping concerns, child-safety concerns, or emergency situations.",
                        "Nigerian requests should identify the requesting authority, legal basis, account or event, relevant date range, and specific data requested.",
                        "If immediate danger exists, users and contacts should use appropriate local channels, which may include trusted family, local police, medical help, FRSC, NSCDC, NEMA, state emergency agencies, private security, child-safety authorities, or nearby responsible responders depending on the situation.",
                        "StayKnown does not replace Nigerian police, ambulance, hospitals, fire service, road safety, civil defence, disaster management, child-protection authorities, or any official authority.",
                      ]}
                    />

                    <H3>United States, U.K./EU, and other countries</H3>
                    <UL
                      items={[
                        "In the United States, StayKnown is not 911, law enforcement, EMS, fire department, child protective services, or rescue service.",
                        "In the U.K. and EU, StayKnown is not 999, 112, police, ambulance, fire service, safeguarding authority, child-protection authority, or official emergency dispatch.",
                        "European users may have stronger data protection rights, lawful-basis expectations, user notice rules, minimization requirements, and cross-border data handling requirements.",
                        "In all countries, official requests should be lawful, specific, safety-aware, and tied to a clear legal or emergency basis.",
                      ]}
                    />
                  </section>

                  <section id="minors" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      12) Minor safety and vulnerable users
                    </H2>
                    <P>
                      Requests involving minors, exploitation, trafficking,
                      grooming, kidnapping, coercion, unsafe contact, or
                      vulnerable users may require urgent review. StayKnown
                      takes child safety and vulnerable-user safety seriously.
                    </P>
                    <UL
                      items={[
                        "If a minor is in immediate danger, contact emergency services or the proper local child-safety authority first.",
                        "Reports involving minors should include the age or estimated age if known.",
                        "StayKnown may preserve records where required or where reasonably necessary to prevent harm.",
                        "StayKnown may cooperate with valid legal process or appropriate emergency requests involving child safety.",
                        "StayKnown does not support unlawful monitoring, grooming, exploitation, or misuse of minor-related safety data.",
                      ]}
                    />
                    <LinkCard
                      href="/minors"
                      title="Child Safety & Minor Use"
                      body="Dedicated child, teen, guardian, school, family, and vulnerable-user safety policy."
                    />
                  </section>

                  <section id="abuse" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ReportIcon className="h-4 w-4" />}>
                      13) Abuse investigations and platform integrity
                    </H2>
                    <P>
                      StayKnown may review and preserve information when we
                      detect or receive reports of abuse, fraud, stalking,
                      harassment, false emergencies, repeated mass messaging,
                      suspicious network behavior, payment abuse, attempts to
                      bypass safeguards, or high-risk safety events.
                    </P>
                    <UL
                      items={[
                        "StayKnown may restrict accounts, devices, contacts, notifications, chat, stories, media, stickers, SOS, Visit features, payment features, wallet features, or other product surfaces.",
                        "StayKnown may preserve logs and records when needed to investigate abuse, fraud, threats, or safety risks.",
                        "StayKnown may cooperate with lawful requests where required or appropriate.",
                        "StayKnown may take action even before receiving legal process where platform safety, user safety, child safety, fraud prevention, or abuse-prevention rules require it.",
                        "StayKnown may withhold investigation details where disclosure would create risk, expose another user, violate law, or undermine platform integrity.",
                      ]}
                    />
                    <LinkCard
                      href="/abuse"
                      title="Abuse Reporting"
                      body="Report stalking, harassment, false SOS, unwanted contact, impersonation, fraud, unsafe media, or safety misuse."
                    />
                  </section>

                  <section id="retention" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ArchiveIcon className="h-4 w-4" />}>
                      14) Retention limits and deletion requests
                    </H2>
                    <P>
                      StayKnown may retain safety logs for a reasonable period
                      to provide history, prevent abuse, resolve disputes,
                      comply with legal obligations, support billing/accounting
                      where applicable, and meet safety auditing needs. Some
                      records may be retained longer where required by law or
                      for legitimate safety interests.
                    </P>
                    <UL
                      items={[
                        "A deletion request may not remove records that must be retained for legal, security, safety, fraud-prevention, billing, child-safety, or abuse-prevention reasons.",
                        "Preserved records may be held while valid legal process, emergency review, abuse investigation, payment dispute, fraud review, or dispute resolution is pending.",
                        "Records not retained or not generated cannot be produced later.",
                        "Backup copies or provider-level records may remain for a limited period where operational systems require it.",
                      ]}
                    />
                    <LinkCard
                      href="/retention"
                      title="Data Retention"
                      body="Detailed retention rules for safety logs, location records, contact records, chat metadata, support reports, payment records, and legal holds."
                    />
                  </section>

                  <section id="surveillance" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      15) No covert surveillance or unlawful monitoring
                    </H2>
                    <P>
                      StayKnown is not built to help anyone secretly track
                      another person. Legal cooperation does not change the
                      product’s anti-stalking and consent-aware purpose.
                    </P>
                    <UL
                      items={[
                        "StayKnown does not authorize users to track people without permission, lawful basis, or required consent.",
                        "StayKnown does not support private parties using legal threats to obtain another person’s data outside valid legal process.",
                        "StayKnown does not support use of the Service to violate protective orders, restraining orders, custody rules, workplace restrictions, school restrictions, or similar legal boundaries.",
                        "StayKnown may restrict accounts or refuse requests that appear connected to stalking, coercion, intimidation, harassment, retaliation, custody misuse, workplace misuse, or non-safety monitoring.",
                        "StayKnown may preserve or disclose information where lawful and necessary to prevent harm, but that does not make StayKnown a real-time surveillance service.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/safety"
                        title="Safety & Anti-Stalking"
                        body="Broader policy covering anti-stalking, anti-harassment, anti-coercion, false emergency, and trusted-contact rules."
                      />
                      <LinkCard
                        href="/acceptable-use"
                        title="Acceptable Use"
                        body="Detailed prohibited-use rules for accounts, chat, media, stories, location, alerts, contacts, payments, and safety features."
                      />
                    </div>
                  </section>

                  <section id="contact" className="scroll-mt-24 space-y-3">
                    <H2 icon={<MailIcon className="h-4 w-4" />}>
                      16) Contact for legal requests and related policies
                    </H2>
                    <P>
                      For legal requests, abuse reports, preservation concerns,
                      emergency safety concerns, or official request handling,
                      contact StayKnown support. If there is immediate danger,
                      contact the official local emergency number or proper
                      local authority first.
                    </P>

                    <Callout
                      title="Primary legal contact"
                      body="support@stay-known.com"
                      icon={<MailIcon className="h-5 w-5" />}
                    />

                    <Example
                      title="Recommended subject lines"
                      items={[
                        "Legal Request — StayKnown account / session",
                        "Preservation Request — urgent safety matter",
                        "Emergency Disclosure Request — imminent harm",
                        "Abuse Report — stalking / harassment / misuse",
                        "Child Safety Report — minor-related safety concern",
                        "Security Disclosure — vulnerability or platform-integrity concern",
                      ]}
                    />

                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/privacy"
                        title="Privacy Policy"
                        body="How StayKnown handles account, location, contact, chat, media, payment, retention, and lawful request data."
                      />
                      <LinkCard
                        href="/retention"
                        title="Data Retention"
                        body="Safety logs, legal holds, deletion limits, location records, chat metadata, support reports, and payment records."
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
                      <LinkCard
                        href="/location-safety"
                        title="Location & Live Safety"
                        body="Visit sessions, LIVE sharing, SOS, manual capture, chat maps, VPN gates, and accuracy limits."
                      />
                      <LinkCard
                        href="/security"
                        title="Security Disclosure"
                        body="Responsible vulnerability reporting and platform-integrity route."
                      />
                    </div>
                  </section>

                  <section className="space-y-3 rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5">
                    <H2>
                      17) Changes to this Law Enforcement & Emergency Requests
                      Policy
                    </H2>
                    <P>
                      StayKnown may update this policy to reflect new legal
                      request processes, emergency disclosure procedures,
                      retention requirements, data categories, safety features,
                      country-specific requirements, provider changes, privacy
                      laws, or operational needs. If updates are material,
                      StayKnown may provide notice through the app, website,
                      email, or another reasonable method.
                    </P>
                  </section>

                  <section className="space-y-3 rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5">
                    <H2>Appendix A — In-app short legal request notice</H2>
                    <P>
                      StayKnown respects applicable law and may respond to valid
                      legal process, preservation requests, and emergency
                      disclosure requests where required or permitted. StayKnown
                      may preserve or disclose records when necessary to comply
                      with law, enforce policies, protect rights and safety,
                      prevent fraud, prevent harm, investigate abuse, or respond
                      to credible emergency risk. StayKnown does not support
                      covert surveillance, stalking, harassment, coercion, or
                      unlawful monitoring. Preservation does not automatically
                      mean disclosure. If immediate danger exists, contact the
                      official local emergency number or proper authority first.
                    </P>
                  </section>
                </div>

                <div className="mx-auto mt-12 h-px max-w-3xl bg-white/10" />

                <footer className="mx-auto mt-7 max-w-4xl text-center">
                  <div className="mx-auto rounded-[1.6rem] border border-white/10 bg-black/35 px-5 py-6">
                    <div className="flex items-center justify-center gap-3">
                      <Image
                        src="/6logo.png"
                        alt="6 Clement Joshua service logo"
                        width={28}
                        height={28}
                        className="rounded-md bg-white object-contain p-0.5"
                      />
                      <div className="text-[12px] font-semibold text-white/55">
                        A 6 Clement Joshua service
                        <span className="ml-1 align-super text-[10px] text-white/28">
                          ™
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 text-[11px] font-semibold text-white/32">
                      {new Date().getFullYear()} • stay-known.com
                    </div>

                    <p className="mx-auto mt-3 max-w-2xl text-[11px] font-semibold leading-relaxed text-white/30">
                      This policy is provided for product transparency and
                      should be reviewed by qualified legal counsel before
                      public launch, regulatory filing, investor review,
                      app-store submission, or law-enforcement request handling.
                    </p>
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
