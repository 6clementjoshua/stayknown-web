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

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function useSeoMeta() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    document.title =
      "StayKnown Abuse Reporting & Enforcement Policy | Report Stalking, Harassment, False SOS & Safety Misuse";

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
      "Report StayKnown misuse, stalking, harassment, false SOS alerts, contact abuse, chat abuse, fraud, kidnapping concerns, minor safety issues, impersonation, and safety-app abuse.",
    );
    upsertMeta(
      "keywords",
      "StayKnown abuse reporting, report stalking app, report harassment, false SOS reporting, emergency contact abuse, safety app enforcement, Nigeria safety app abuse report, chat abuse report, contact abuse report, anti-stalking reporting, child safety report",
    );
    upsertMeta("robots", "index, follow");
    upsertMeta("author", "6 Clement Joshua");
    upsertProperty(
      "og:title",
      "StayKnown Abuse Reporting & Enforcement Policy | Safety Misuse Reports",
    );
    upsertProperty(
      "og:description",
      "How to report StayKnown misuse, stalking, harassment, false emergencies, contact abuse, fraud, minor safety risks, and unsafe behavior.",
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

function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-white/22 bg-transparent px-5 py-3 text-[12px] font-black text-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-white/50 hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-white/30"
    >
      <span className="relative z-10">{children}</span>
    </a>
  );
}

function Callout({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  tone?: "normal" | "danger" | "safe" | "law" | "report";
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

function AbuseIllustration() {
  return (
    <div className="relative mx-auto h-[280px] w-[190px] md:h-[320px] md:w-[220px]">
      <div className="absolute inset-0 animate-[softPulse_4s_ease-in-out_infinite] rounded-[2.2rem] bg-white/[0.045] blur-2xl" />
      <div className="relative h-full w-full rounded-[2rem] border border-white/15 bg-white/[0.055] p-3 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-white/20" />

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-white text-black">
              <ReportIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-black tracking-[0.18em] text-white/35">
                REPORT CENTER
              </div>
              <div className="text-[13px] font-black text-white">
                Abuse Review
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {[
              ["Report misuse", "Give safe details"],
              ["Review risk", "Safety context checked"],
              ["Restrict abuse", "Features may be limited"],
              ["Preserve records", "Where lawful and needed"],
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
            Report route
          </div>
          <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.9)]" />
        </div>
      </div>
    </div>
  );
}

export default function AbuseReportingPage() {
  useSeoMeta();

  const nav = useMemo(
    () =>
      [
        ["summary", "Summary"],
        ["report", "How to report"],
        ["urgent", "Immediate danger"],
        ["abuse", "Abusive use"],
        ["fraud", "Fraud & scams"],
        ["harm", "Kidnapping & harm"],
        ["contacts", "Contact abuse"],
        ["chat", "Chat & media"],
        ["minors", "Minor safety"],
        ["evidence", "Evidence"],
        ["review", "Review"],
        ["enforcement", "Enforcement"],
        ["appeals", "Appeals"],
        ["global", "Nigeria & global"],
        ["law", "Legal requests"],
        ["retention", "Preservation"],
        ["contact", "Contact"],
      ] as const,
    [],
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "StayKnown Abuse Reporting & Enforcement Policy",
    dateModified: UPDATED_AT,
    version: VERSION,
    publisher: {
      "@type": "Organization",
      name: "StayKnown",
      brand: "A 6 Clement Joshua service™",
      url: "https://stay-known.com",
    },
    description:
      "Abuse Reporting and Enforcement Policy for StayKnown covering stalking, harassment, false SOS, contact abuse, chat abuse, fraud, kidnapping concerns, minor safety reports, enforcement, appeals, record preservation, and legal requests.",
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
                    <Pill>Abuse Reporting</Pill>
                    <Pill>Safety Enforcement</Pill>
                    <Pill>Report Misuse</Pill>
                  </div>

                  <h1 className="mt-5 max-w-3xl text-[30px] font-black tracking-[-0.045em] text-white md:text-[46px] md:leading-[1.02]">
                    StayKnown Abuse Reporting & Enforcement Policy for safety
                    misuse, stalking, false alerts, and harmful behavior.
                  </h1>

                  <p className="mt-5 max-w-3xl text-[14.5px] font-semibold leading-relaxed text-white/62 md:text-[15px]">
                    This policy explains how to report abuse on StayKnown,
                    including stalking, harassment, fraud, scams, false SOS
                    alerts, contact abuse, kidnapping-related misuse, minor
                    safety concerns, chat and media abuse, account misuse, and
                    conduct that can put people at risk.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <SoftBadge>Version {VERSION}</SoftBadge>
                    <SoftBadge>Updated: {fmtDate(UPDATED_AT)}</SoftBadge>
                    <PrimaryButton href="/contact">
                      Contact support
                    </PrimaryButton>
                  </div>
                </div>

                <AbuseIllustration />
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
              <aside className="border-b border-white/10 bg-black/35 p-5 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:p-6">
                <div className="text-[12px] font-black uppercase tracking-[0.2em] text-white/35">
                  On this page
                </div>

                <nav
                  aria-label="Abuse Reporting and Enforcement Policy sections"
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
                    <ReportIcon className="h-4 w-4" />
                    Report route
                  </div>
                  <p className="mt-2 text-[12px] font-semibold leading-relaxed text-white/50">
                    Use support@stay-known.com for reports. If immediate danger
                    exists, contact official emergency services first.
                  </p>
                </div>
              </aside>

              <div className="p-5 md:p-8">
                <div className="space-y-8">
                  <section id="summary" className="scroll-mt-24 space-y-4">
                    <H2 icon={<ReportIcon className="h-4 w-4" />}>
                      1) Abuse reporting summary
                    </H2>
                    <P>
                      StayKnown is designed for lawful, consent-aware personal
                      safety. Because safety tools can be misused, StayKnown may
                      investigate reports, restrict accounts, limit features,
                      remove or restrict content, preserve relevant records, and
                      cooperate with lawful requests where required or
                      appropriate.
                    </P>

                    <div className="grid gap-3 md:grid-cols-3">
                      <Callout
                        title="Report unsafe use"
                        body="Report stalking, harassment, false emergencies, unwanted contact, impersonation, fraud, chat abuse, or minor safety concerns."
                        icon={<ReportIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="Immediate danger"
                        body="If someone is in immediate danger, contact official emergency services or the proper local authority first."
                        icon={<AlertIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="No misuse protection"
                        body="StayKnown may restrict accounts, contacts, devices, payments, or features when misuse creates safety risk."
                        icon={<ShieldIcon className="h-5 w-5" />}
                      />
                    </div>
                  </section>

                  <section id="report" className="scroll-mt-24 space-y-3">
                    <H2 icon={<MailIcon className="h-4 w-4" />}>
                      2) How to report abuse
                    </H2>
                    <P>
                      To report misuse, contact StayKnown support with clear
                      details so the report can be reviewed safely. Do not put
                      yourself, a child, a contact, or another person in danger
                      to collect evidence.
                    </P>
                    <Callout
                      title="Report email"
                      body="support@stay-known.com"
                      icon={<MailIcon className="h-5 w-5" />}
                    />
                    <UL
                      items={[
                        "Use the subject line: StayKnown Abuse Report.",
                        "For minor-related concerns, use the subject line: Child Safety Report.",
                        "For urgent legal or official requests, use the Law Enforcement & Emergency Requests route where available.",
                        "Include the account, email, username, phone, link, contact, thread, alert, map, or profile details involved if you have them.",
                        "Include dates, times, screenshots, message content, notification examples, email headers, or session details you can safely share.",
                        "Tell us if there is immediate danger, a minor, a protective order, a police report, a workplace report, a school report, or an ongoing threat.",
                      ]}
                    />
                  </section>

                  <section id="urgent" className="scroll-mt-24 space-y-3">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      3) Immediate danger and emergency situations
                    </H2>
                    <P>
                      StayKnown is not emergency services, medical services, law
                      enforcement, emergency dispatch, or a professional rescue
                      organization. If someone is in immediate danger, contact
                      the proper local emergency number or local authority
                      first.
                    </P>
                    <UL
                      items={[
                        "If you receive an SOS or emergency alert, try safe direct contact if appropriate.",
                        "If danger seems likely, contact local emergency services or the appropriate local safety channel.",
                        "Do not attempt unsafe intervention.",
                        "Do not create false emergencies or misuse SOS.",
                        "False alerts may endanger others and may be illegal.",
                      ]}
                    />
                    <LinkCard
                      href="/emergency"
                      title="Emergency Disclaimer"
                      body="StayKnown does not replace official emergency services in Nigeria, the U.S., U.K./EU, or any country."
                    />
                  </section>

                  <section id="abuse" className="scroll-mt-24 space-y-3">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      4) Abusive use of StayKnown
                    </H2>
                    <P>
                      StayKnown must not be used to stalk, harass, intimidate,
                      threaten, shame, monitor, manipulate, pressure, or control
                      another person.
                    </P>
                    <UL
                      items={[
                        "No covert surveillance or hidden tracking.",
                        "No using safety sessions to pressure someone.",
                        "No using location, Visit history, LIVE links, chat maps, or safety alerts to threaten a person.",
                        "No repeated unwanted alerts after someone asks you to stop, blocks, declines, or removes contact access.",
                        "No using the app to violate restraining orders, protective orders, bail terms, custody orders, workplace restrictions, school rules, or similar legal limits.",
                        "No impersonation, false identity, or misleading safety claims.",
                      ]}
                    />
                    <Example
                      title="Not allowed"
                      items={[
                        "Adding an ex-partner’s email to repeatedly send unwanted alerts.",
                        "Using safety logs to threaten someone by claiming you know where they are.",
                        "Using StayKnown to pressure someone to respond, travel, meet, send money, or prove their location.",
                        "Creating a false emergency to force attention or frighten contacts.",
                      ]}
                    />
                    <LinkCard
                      href="/safety"
                      title="Safety & Anti-Stalking"
                      body="Broader safety policy covering anti-stalking, anti-harassment, anti-coercion, and trusted-contact duties."
                    />
                  </section>

                  <section id="fraud" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      5) Fraud, scams, impersonation, and false safety claims
                    </H2>
                    <P>
                      Fraud and scam-related misuse can create real danger.
                      StayKnown prohibits using the Service to mislead users,
                      contacts, support teams, emergency responders, or the
                      public.
                    </P>
                    <UL
                      items={[
                        "No fake SOS or fake emergency events.",
                        "No false claims designed to make contacts panic or send money.",
                        "No impersonating a user, contact, guardian, emergency responder, support agent, law enforcement officer, government official, medical worker, or StayKnown staff.",
                        "No using payment, coins, subscriptions, wallet features, receipts, or digital benefits for fraud, money laundering, scams, illegal funding, or deception.",
                        "No creating accounts, sessions, alerts, contact requests, or reports for scams, extortion, blackmail, retaliation, or manipulation.",
                        "No forging, replaying, editing, or misrepresenting StayKnown emails, app alerts, live links, map links, receipts, approval pages, or support messages.",
                      ]}
                    />
                    <LinkCard
                      href="/acceptable-use"
                      title="Acceptable Use"
                      body="Detailed rulebook for prohibited conduct, false alerts, payment abuse, contact abuse, chat abuse, and location misuse."
                    />
                  </section>

                  <section id="harm" className="scroll-mt-24 space-y-3">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      6) Kidnapping, coercion, trafficking, extortion, and
                      physical harm
                    </H2>
                    <P>
                      StayKnown strictly prohibits use connected to kidnapping,
                      extortion, trafficking, coercion, stalking, violence,
                      exploitation, or any plan to physically harm another
                      person.
                    </P>
                    <UL
                      items={[
                        "Do not use StayKnown to lure someone to an unsafe location.",
                        "Do not use location sharing to coordinate harm.",
                        "Do not use contacts, alerts, chat, stories, stickers, media, or profile information to intimidate or control a victim.",
                        "Do not use StayKnown to facilitate trafficking, exploitation, forced movement, coercion, unsafe meetings, or unlawful confinement.",
                        "Do not use StayKnown to collect information for targeting, doxxing, extortion, violence, or exploitation.",
                        "Do not use safety features to mislead family, contacts, employers, schools, police, medical teams, or emergency agencies.",
                      ]}
                    />
                    <Callout
                      title="High-risk reports"
                      body="Reports involving kidnapping, trafficking, extortion, credible threats, minors, or imminent harm may require urgent review, preservation of records, and cooperation with valid legal process."
                      icon={<AlertIcon className="h-5 w-5" />}
                    />
                  </section>

                  <section id="contacts" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ContactIcon className="h-4 w-4" />}>
                      7) Contact abuse and unwanted notifications
                    </H2>
                    <P>
                      Contacts are part of the safety network. They must not be
                      used as targets for spam, harassment, manipulation,
                      pressure, threats, or unwanted monitoring.
                    </P>
                    <UL
                      items={[
                        "Only add contacts you have permission, lawful basis, or legitimate safety relationship to notify.",
                        "Remove a contact if they ask you to stop where the feature allows.",
                        "Do not repeatedly trigger alerts to annoy, scare, shame, pressure, or punish someone.",
                        "Do not add strangers or third parties for non-safety purposes.",
                        "Do not use contact alerts as marketing, promotion, punishment, broadcast messaging, or harassment.",
                        "Do not repeatedly request approval after someone declines, blocks, or asks to stop.",
                      ]}
                    />
                    <LinkCard
                      href="/contact-consent"
                      title="Contact Approval & Consent"
                      body="Rules for approved contacts, SOS responders, consent records, blocked-add settings, and removals."
                    />
                  </section>

                  <section id="chat" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ChatIcon className="h-4 w-4" />}>
                      8) Chat, stories, stickers, media, and profile abuse
                    </H2>
                    <P>
                      If StayKnown includes chat, stories, stickers, media,
                      voice notes, profile images, translation, or other user
                      content, those features must be used lawfully and
                      respectfully.
                    </P>
                    <UL
                      items={[
                        "No threats, harassment, hate, exploitation, grooming, coercion, or targeted abuse.",
                        "No impersonation or misleading profile identity.",
                        "No using stories, place labels, avatars, or profile context to stalk, shame, expose, locate, or pressure someone.",
                        "No media, voice notes, stickers, music stickers, video stickers, files, or reactions used to intimidate, defame, exploit, threaten, or target another person.",
                        "No attempts to bypass block, report, privacy, translation, VPN, media, or plan-gated restrictions.",
                        "No unlawful sharing of private content.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/privacy"
                        title="Privacy Policy"
                        body="How StayKnown handles chat, media, reports, translation, location metadata, and safety records."
                      />
                      <LinkCard
                        href="/acceptable-use"
                        title="Acceptable Use"
                        body="Detailed rules for chat, media, stickers, stories, location, contacts, payments, and platform behavior."
                      />
                    </div>
                  </section>

                  <section id="minors" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      9) Minor safety and vulnerable users
                    </H2>
                    <P>
                      Reports involving minors, vulnerable users, exploitation,
                      grooming concerns, unsafe contact, or coercion are treated
                      seriously. StayKnown is for lawful safety use only and
                      must not be used to target, manipulate, or exploit minors.
                    </P>
                    <UL
                      items={[
                        "Under 13 users are not permitted to create an account or use StayKnown.",
                        "Minors who are permitted under the policy must have required guardian permission and lawful safety purpose.",
                        "No grooming, coercion, harassment, intimidation, impersonation, unsafe contact, or exploitation of minors.",
                        "No using StayKnown to hide unlawful monitoring of minors or vulnerable persons.",
                        "If there is immediate danger to a minor, contact local emergency services, child-safety authorities, trusted guardians, or the proper local authority first.",
                      ]}
                    />
                    <LinkCard
                      href="/minors"
                      title="Child Safety & Minor Use"
                      body="Dedicated child, teen, guardian, school, family, and vulnerable-user safety policy."
                    />
                  </section>

                  <section id="evidence" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ReportIcon className="h-4 w-4" />}>
                      10) What to include in a report
                    </H2>
                    <P>
                      Clear information helps StayKnown review reports faster
                      and avoid acting on incomplete or misleading claims. Only
                      provide what you can safely share.
                    </P>
                    <UL
                      items={[
                        "Your name and contact email, if safe to provide.",
                        "The email, username, profile, phone, thread, map link, alert, contact, or account involved.",
                        "Dates and times of the behavior.",
                        "Screenshots, notification examples, email headers, links, message text, story/media examples, or alert examples if safe to share.",
                        "Whether you already asked the person to stop.",
                        "Whether there is a legal order, police report, school report, workplace restriction, guardian concern, child-safety concern, or emergency concern.",
                        "Any immediate safety risk you want support to understand.",
                      ]}
                    />
                    <Callout
                      title="Protect yourself first"
                      body="Do not confront an abuser or put yourself in danger to gather screenshots. Report what you can safely provide."
                      icon={<ShieldIcon className="h-5 w-5" />}
                    />
                  </section>

                  <section id="review" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      11) How StayKnown may review reports
                    </H2>
                    <P>
                      StayKnown may review reports using available account,
                      device, session, notification, support, safety, and
                      security information, subject to applicable law and
                      privacy obligations.
                    </P>
                    <UL
                      items={[
                        "We may review reported account activity, alert patterns, message/report metadata, session state, notification delivery history, support records, and abuse-prevention signals.",
                        "We may compare reports against prior complaints or repeated suspicious behavior.",
                        "We may preserve relevant records if needed for safety, legal compliance, security, fraud prevention, or abuse prevention.",
                        "We may be unable to share every detail of an investigation to protect privacy, safety, legal process, platform integrity, and other users.",
                        "We may act before review is complete if there is credible immediate safety risk, minor risk, fraud risk, or platform integrity risk.",
                      ]}
                    />
                  </section>

                  <section id="enforcement" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      12) Enforcement actions
                    </H2>
                    <P>
                      Violations may result in action depending on severity,
                      context, risk, repeat behavior, evidence, user history,
                      region, and applicable law.
                    </P>
                    <UL
                      items={[
                        "Warning or safety education.",
                        "Feature restriction, including limits on contacts, notifications, chat, stories, media, stickers, SOS, manual capture, Visit, LIVE map, or location-related features.",
                        "Temporary suspension.",
                        "Permanent account ban.",
                        "Device, network, payment, wallet, or identifier restrictions where appropriate.",
                        "Removal or restriction of abusive content.",
                        "Contact removal, thread blocking, or alert restriction.",
                        "Preservation of records where required or appropriate.",
                        "Cooperation with valid legal process or emergency disclosure rules where applicable.",
                      ]}
                    />
                  </section>

                  <section id="appeals" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ReportIcon className="h-4 w-4" />}>
                      13) Appeals and mistaken reports
                    </H2>
                    <P>
                      If you believe an enforcement action was a mistake, you
                      may contact support and request review. Appeals should be
                      respectful, truthful, and specific.
                    </P>
                    <UL
                      items={[
                        "Explain what happened clearly.",
                        "Provide relevant evidence or context.",
                        "Do not create new accounts to bypass a restriction while an appeal is pending.",
                        "Do not threaten support, reporters, contacts, users, or staff.",
                        "Repeated abusive appeals, threats, harassment, false claims, or evasion may lead to further restrictions.",
                      ]}
                    />
                  </section>

                  <section id="global" className="scroll-mt-24 space-y-3">
                    <H2 icon={<GlobeIcon className="h-4 w-4" />}>
                      14) Nigeria, United States, United Kingdom, EU, and global
                      abuse reporting
                    </H2>
                    <P>
                      Abuse reports may involve different legal systems, local
                      emergency channels, privacy rules, telecom realities,
                      child-safety authorities, schools, workplaces, courts, and
                      law-enforcement expectations.
                    </P>

                    <H3>Nigeria reporting language</H3>
                    <UL
                      items={[
                        "In Nigeria, StayKnown misuse may involve stalking, harassment, unwanted alerts, fake SOS, fraud, scams, extortion, impersonation, threats, or unsafe contact behavior.",
                        "If immediate danger exists, use appropriate local channels, which may include trusted family, local police, medical help, FRSC, NSCDC, NEMA, state emergency agencies, private security, child-safety authorities, or nearby responsible responders depending on the situation.",
                        "StayKnown does not replace Nigerian police, ambulance, hospitals, fire service, road safety, civil defence, disaster management, child-protection authorities, or any official authority.",
                        "Network issues, power supply, road conditions, rural coverage, device quality, and provider delays may affect alerts and records.",
                      ]}
                    />

                    <H3>United States, U.K./EU, and other countries</H3>
                    <UL
                      items={[
                        "In the United States, StayKnown is not 911, law enforcement, EMS, fire department, child protective services, or rescue service.",
                        "In the U.K. and EU, StayKnown is not 999, 112, police, ambulance, fire service, safeguarding authority, or official emergency dispatch.",
                        "Users must follow local laws on stalking, harassment, privacy, location sharing, minors, workplace monitoring, school rules, protective orders, emergency-service misuse, and legal reporting.",
                        "If immediate danger is suspected, contact the official emergency number for the place where the event is happening.",
                      ]}
                    />
                  </section>

                  <section id="law" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      15) Lawful requests and cooperation
                    </H2>
                    <P>
                      StayKnown respects applicable law and may respond to valid
                      legal process. We may disclose information if required by
                      law or if we believe disclosure is necessary to protect
                      rights, safety, prevent fraud, prevent harm, or enforce
                      policies.
                    </P>
                    <UL
                      items={[
                        "We may require proper legal process before disclosing user information.",
                        "We may preserve records when legally required or when reasonably necessary to investigate abuse or threats.",
                        "We may cooperate with lawful emergency or government requests where applicable.",
                        "We do not support covert surveillance or unlawful use of safety data.",
                        "We may reject, narrow, or question requests that are overbroad, unlawful, unsafe, unclear, or connected to misuse.",
                      ]}
                    />
                    <LinkCard
                      href="/law"
                      title="Law Enforcement & Emergency Requests"
                      body="Dedicated policy for official requests, emergency disclosure, legal preservation, and user notice."
                    />
                  </section>

                  <section id="retention" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      16) Record preservation and retention
                    </H2>
                    <P>
                      Some records may be retained for safety history, abuse
                      prevention, dispute resolution, legal compliance,
                      security, fraud prevention, and safety auditing. Deletion
                      requests may be limited where records must be retained for
                      legal, security, safety, or fraud-prevention reasons.
                    </P>
                    <UL
                      items={[
                        "Safety session logs may be retained to support history, investigations, and user protection.",
                        "Notification delivery records may be retained to understand whether alerts were sent, delayed, or failed.",
                        "Security and abuse-prevention logs may be retained to reduce repeat harassment, fraud, or device-level abuse.",
                        "Support records may be retained to resolve reports and prevent repeated abuse.",
                        "Records connected to credible threats, minors, fraud, legal holds, or official requests may be preserved longer where permitted or required.",
                      ]}
                    />
                    <LinkCard
                      href="/retention"
                      title="Data Retention"
                      body="Detailed retention rules for safety logs, contact records, location records, chat metadata, support reports, and legal holds."
                    />
                  </section>

                  <section id="contact" className="scroll-mt-24 space-y-3">
                    <H2 icon={<MailIcon className="h-4 w-4" />}>
                      17) Contact and related policies
                    </H2>
                    <P>
                      To report abuse, request review, or raise a safety
                      concern, contact StayKnown support. If there is immediate
                      danger, contact your local emergency number or proper
                      local authority first.
                    </P>
                    <UL
                      items={[
                        "Support and reports: support@stay-known.com",
                        "Subject line for abuse: StayKnown Abuse Report.",
                        "Subject line for minor concerns: Child Safety Report.",
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
                        href="/privacy"
                        title="Privacy Policy"
                        body="How StayKnown processes account, location, contact, chat, media, payment, retention, and legal-request data."
                      />
                    </div>
                  </section>

                  <section className="space-y-3 rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5">
                    <H2>
                      18) Changes to this Abuse Reporting & Enforcement Policy
                    </H2>
                    <P>
                      StayKnown may update this policy to reflect new reporting
                      tools, abuse patterns, enforcement methods, legal
                      requirements, product changes, provider limitations,
                      country-specific expectations, or operational needs. If
                      updates are material, StayKnown may provide notice through
                      the app, website, email, or another reasonable method.
                    </P>
                  </section>

                  <section className="space-y-3 rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5">
                    <H2>Appendix A — In-app short abuse reporting notice</H2>
                    <P>
                      Report StayKnown misuse, stalking, harassment,
                      impersonation, false SOS, unwanted contact, scams, unsafe
                      chat/media, minor safety concerns, or attempts to bypass
                      safety systems. Use support@stay-known.com with the
                      subject line “StayKnown Abuse Report” or “Child Safety
                      Report” where applicable. If there is immediate danger,
                      contact the official local emergency number or proper
                      local authority first. StayKnown may restrict accounts,
                      contacts, devices, payments, or features, preserve records
                      where lawful and needed, and cooperate with valid legal
                      process.
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
