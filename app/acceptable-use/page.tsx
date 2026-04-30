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
      "StayKnown Acceptable Use Policy | Anti-Stalking, SOS, Chat, Live Location & Safety Rules";

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
      "Read the StayKnown Acceptable Use Policy covering anti-stalking rules, approved contacts, live location sharing, SOS alerts, secure chat, media, stickers, minors, payments, abuse reporting, Nigeria and global safety use.",
    );
    upsertMeta(
      "keywords",
      "StayKnown acceptable use policy, safety app rules, anti-stalking app policy, live location sharing rules, SOS misuse, approved contacts, chat safety policy, Nigeria safety app, abuse reporting, emergency contact app, VPN safety gate, minors safety policy",
    );
    upsertMeta("robots", "index, follow");
    upsertMeta("author", "6 Clement Joshua");
    upsertProperty(
      "og:title",
      "StayKnown Acceptable Use Policy | Safety App Misuse Rules",
    );
    upsertProperty(
      "og:description",
      "Rules for lawful, consent-based StayKnown use covering location, SOS, contacts, chat, media, payments, minors, anti-stalking, and abuse prevention.",
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
  tone?: "normal" | "danger" | "safe" | "law" | "report" | "billing";
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

function RulesIllustration() {
  return (
    <div className="relative mx-auto h-[280px] w-[190px] md:h-[320px] md:w-[220px]">
      <div className="absolute inset-0 animate-[softPulse_4s_ease-in-out_infinite] rounded-[2.2rem] bg-white/[0.045] blur-2xl" />
      <div className="relative h-full w-full rounded-[2rem] border border-white/15 bg-white/[0.055] p-3 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-white/20" />
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-white text-black">
              <AlertIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-black tracking-[0.18em] text-white/35">
                USE RULES
              </div>
              <div className="text-[13px] font-black text-white">
                Safety Boundaries
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {[
              ["No stalking", "No hidden tracking"],
              ["No fake SOS", "No panic misuse"],
              ["No spam", "No unwanted alerts"],
              ["No bypass", "No fake GPS or VPN abuse"],
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
            Rules enforced
          </div>
          <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.9)]" />
        </div>
      </div>
    </div>
  );
}

export default function AcceptableUsePage() {
  useSeoMeta();

  const nav = useMemo(
    () =>
      [
        ["summary", "Summary"],
        ["purpose", "Purpose"],
        ["baseline", "Rules"],
        ["consent", "Consent"],
        ["stalking", "Anti-stalking"],
        ["fraud", "Fraud"],
        ["harm", "Violence"],
        ["emergency", "SOS"],
        ["location", "Location"],
        ["vpn", "VPN"],
        ["chat", "Chat"],
        ["media", "Media"],
        ["payments", "Payments"],
        ["minors", "Minors"],
        ["spam", "Spam"],
        ["security", "Security"],
        ["global", "Nigeria & global"],
        ["reports", "Reports"],
        ["legal", "Legal"],
        ["contact", "Contact"],
      ] as const,
    [],
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "StayKnown Acceptable Use Policy",
    dateModified: UPDATED_AT,
    version: VERSION,
    publisher: {
      "@type": "Organization",
      name: "StayKnown",
      brand: "A 6 Clement Joshua service™",
      url: "https://stay-known.com",
    },
    description:
      "Acceptable Use Policy for StayKnown covering lawful safety use, approved contacts, live location, SOS, chat, media, payments, minors, anti-stalking, abuse reporting, enforcement, and global emergency limits.",
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
                    <Pill>Acceptable Use</Pill>
                    <Pill>Misuse Rules</Pill>
                    <Pill>Safety Boundaries</Pill>
                  </div>

                  <h1 className="mt-5 max-w-3xl text-[30px] font-black tracking-[-0.045em] text-white md:text-[46px] md:leading-[1.02]">
                    StayKnown Acceptable Use Policy for safety, location, SOS,
                    chat, contacts, and payments.
                  </h1>

                  <p className="mt-5 max-w-3xl text-[14.5px] font-semibold leading-relaxed text-white/62 md:text-[15px]">
                    This policy explains what is allowed and prohibited when
                    using StayKnown. It applies to safety features, approved
                    contacts, live location sharing, SOS alerts, manual capture,
                    chat, voice notes, stickers, stories, media, profiles,
                    subscriptions, wallet/coins, payments, support, reports, and
                    website flows.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <SoftBadge>Version {VERSION}</SoftBadge>
                    <SoftBadge>Updated: {fmtDate(UPDATED_AT)}</SoftBadge>
                    <PrimaryButton href="/abuse">Report misuse</PrimaryButton>
                  </div>
                </div>

                <RulesIllustration />
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
              <aside className="border-b border-white/10 bg-black/35 p-5 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:p-6">
                <div className="text-[12px] font-black uppercase tracking-[0.2em] text-white/35">
                  On this page
                </div>

                <nav
                  aria-label="Acceptable Use Policy sections"
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
                    <AlertIcon className="h-4 w-4" />
                    Strict rulebook
                  </div>
                  <p className="mt-2 text-[12px] font-semibold leading-relaxed text-white/50">
                    This page is the detailed misuse rulebook. Safety features
                    must never become stalking, spam, fraud, or coercion.
                  </p>
                </div>
              </aside>

              <div className="p-5 md:p-8">
                <div className="space-y-8">
                  <section id="summary" className="scroll-mt-24 space-y-4">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      1) Acceptable use summary
                    </H2>
                    <P>
                      StayKnown must be used only for lawful, consent-based,
                      safety-focused purposes. It must not be used for stalking,
                      harassment, intimidation, secret tracking, false
                      emergencies, fraud, exploitation, violence, spam,
                      impersonation, platform abuse, payment abuse, or unlawful
                      surveillance.
                    </P>

                    <div className="grid gap-3 md:grid-cols-3">
                      <Callout
                        title="Allowed"
                        body="Using StayKnown to share real safety context with approved, trusted contacts."
                        icon={<ShieldIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="Not allowed"
                        body="Using StayKnown to track, threaten, pressure, expose, impersonate, or manipulate another person."
                        icon={<AlertIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="Report misuse"
                        body="Unsafe behavior can lead to restrictions, preservation, legal review, or permanent removal."
                        icon={<ReportIcon className="h-5 w-5" />}
                      />
                    </div>
                  </section>

                  <section id="purpose" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      2) Purpose of this policy
                    </H2>
                    <P>
                      StayKnown exists to help people move, visit, communicate,
                      and share safety context with trusted people. This policy
                      protects that purpose by setting clear boundaries for how
                      the Service may and may not be used.
                    </P>
                    <Example
                      title="Acceptable safety-focused use"
                      items={[
                        "Starting a Visit before going somewhere so approved contacts know a safety session is active.",
                        "Using LIVE sharing during a real safety session.",
                        "Sending Manual Capture as an extra safety checkpoint during an active Visit.",
                        "Triggering SOS when you need urgent trusted-contact attention.",
                        "Using chat, voice notes, translation, stickers, and stories to communicate respectfully with approved people.",
                        "Adding contacts only when you have permission, lawful basis, or a legitimate safety relationship.",
                      ]}
                    />
                  </section>

                  <section id="baseline" className="scroll-mt-24 space-y-3">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      3) Baseline rules every user must follow
                    </H2>
                    <UL
                      items={[
                        "Use StayKnown only for lawful, safety-focused, consent-aware purposes.",
                        "Respect privacy, consent, contact preferences, blocks, reports, approved-contact boundaries, and safety limits.",
                        "Do not create false safety events, fake emergencies, misleading sessions, false contact requests, or deceptive alerts.",
                        "Do not attempt to bypass plan limits, safety gates, VPN rules, device checks, contact approval, SOS verification, payment checks, or enforcement restrictions.",
                        "Do not use the Service to threaten, stalk, harass, coerce, shame, exploit, impersonate, groom, extort, or control anyone.",
                        "Do not interfere with StayKnown systems, APIs, storage, email delivery, push notifications, maps, live links, payments, wallet, or chat systems.",
                        "Do not upload, send, or publish illegal, exploitative, hateful, threatening, stolen, private, abusive, or harmful content.",
                        "Do not use StayKnown in a way that violates local law, court orders, protective orders, custody restrictions, school rules, workplace restrictions, platform rules, sanctions, or export-control rules.",
                      ]}
                    />
                  </section>

                  <section id="consent" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ContactIcon className="h-4 w-4" />}>
                      4) Consent, contacts, and notice
                    </H2>
                    <P>
                      Contacts and responders are part of a trusted safety
                      network. They must not be added, notified, or targeted
                      without a proper safety reason and permission or lawful
                      basis.
                    </P>
                    <UL
                      items={[
                        "Only add contacts you have permission, lawful basis, or a legitimate safety relationship to notify.",
                        "Tell contacts they may receive StayKnown safety emails, push alerts, map links, chat context, SOS alerts, or updates.",
                        "Do not add contacts to embarrass, scare, annoy, threaten, punish, pressure, monitor, or control them.",
                        "Do not use another person’s email, phone, username, image, profile, or identity without permission.",
                        "Respect a contact’s request to stop receiving alerts unless a lawful safety basis requires otherwise.",
                        "Do not bypass contact approval, invite, decline, expiration, removal, blocked-add, or consent rules.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/contact-consent"
                        title="Contact Approval & Consent"
                        body="Dedicated rules for approved contacts, SOS responders, consent records, blocked-add settings, and removals."
                      />
                      <LinkCard
                        href="/privacy"
                        title="Privacy Policy"
                        body="How StayKnown processes contact identifiers, approvals, messages, notifications, and consent records."
                      />
                    </div>
                  </section>

                  <section id="stalking" className="scroll-mt-24 space-y-3">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      5) Anti-stalking and anti-harassment rules
                    </H2>
                    <P>
                      StayKnown has zero tolerance for stalking, harassment,
                      intimidation, threats, coercion, control, and secret
                      tracking.
                    </P>
                    <UL
                      items={[
                        "Do not track or monitor anyone without consent, knowledge, and lawful basis.",
                        "Do not use location, Visit history, LIVE links, alerts, screenshots, messages, profile information, safety gallery images, or chat maps to control another person.",
                        "Do not send repeated unwanted alerts, messages, story replies, voice notes, stickers, media, or contact requests.",
                        "Do not use StayKnown to follow, pressure, expose, threaten, shame, punish, or retaliate against someone.",
                        "Do not use the Service to violate protective orders, restraining orders, custody orders, school restrictions, workplace restrictions, or similar legal boundaries.",
                        "Do not use StayKnown to gather personal information for targeting, exploitation, blackmail, doxxing, harassment, or retaliation.",
                      ]}
                    />
                    <LinkCard
                      href="/safety"
                      title="Safety & Anti-Stalking"
                      body="The broader StayKnown safety policy covering anti-stalking, anti-harassment, anti-coercion, and trusted-contact obligations."
                    />
                  </section>

                  <section id="fraud" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      6) Fraud, scams, impersonation, and deception
                    </H2>
                    <UL
                      items={[
                        "Do not impersonate a user, contact, guardian, responder, emergency official, medical worker, support agent, law enforcement officer, government official, or StayKnown staff.",
                        "Do not create fake emergencies to cause panic, force attention, damage someone’s reputation, or manipulate people.",
                        "Do not use safety alerts, chat, or contact requests to request money, extort, blackmail, threaten, deceive, or pressure anyone.",
                        "Do not forge, replay, tamper with, or misrepresent StayKnown emails, notifications, live links, receipts, chat messages, SOS alerts, or approval pages.",
                        "Do not create multiple accounts to avoid restrictions, bans, plan limits, payment controls, contact limits, or enforcement.",
                        "Do not use StayKnown to create false evidence or misleading safety records against another person.",
                      ]}
                    />
                  </section>

                  <section id="harm" className="scroll-mt-24 space-y-3">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      7) Violence, harm, kidnapping, trafficking, and
                      exploitation
                    </H2>
                    <P>
                      StayKnown strictly prohibits use connected to violence,
                      kidnapping, trafficking, coercion, exploitation,
                      extortion, or physical harm.
                    </P>
                    <UL
                      items={[
                        "Do not use StayKnown to coordinate, threaten, hide, or facilitate harm.",
                        "Do not use StayKnown to lure someone to an unsafe place.",
                        "Do not use StayKnown to facilitate kidnapping, trafficking, forced movement, coercion, exploitation, grooming, or extortion.",
                        "Do not use location, chat, stories, contacts, or alerts to identify or target vulnerable people.",
                        "Do not use StayKnown to mislead emergency contacts, family, police, medical teams, schools, workplaces, or public agencies.",
                        "Reports involving credible threats, kidnapping, trafficking, exploitation, or imminent harm may lead to urgent review, preservation, and lawful cooperation.",
                      ]}
                    />
                  </section>

                  <section id="emergency" className="scroll-mt-24 space-y-3">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      8) SOS, emergency, and false-alert rules
                    </H2>
                    <P>
                      SOS and emergency-related flows are serious safety
                      functions. They must be used only for genuine safety
                      needs.
                    </P>
                    <UL
                      items={[
                        "Do not trigger SOS as a joke, test, prank, threat, punishment, or manipulation.",
                        "Do not create false emergency alerts, misleading manual captures, fake Visit sessions, or false safety events.",
                        "Do not use SOS to force someone to respond, meet, send money, prove loyalty, or reveal information.",
                        "Do not misuse emergency language to scare contacts, family, support, employers, schools, police, or public agencies.",
                        "Do not interfere with a user’s active SOS or pressure them to end protection.",
                        "If you are in immediate danger, contact local emergency services directly first.",
                      ]}
                    />
                    <LinkCard
                      href="/emergency"
                      title="Emergency Disclaimer"
                      body="Important limits explaining that StayKnown is not police, ambulance, fire service, 911, 112, 999, or official emergency dispatch."
                    />
                  </section>

                  <section id="location" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LocationIcon className="h-4 w-4" />}>
                      9) Visit, LIVE, map links, and location integrity
                    </H2>
                    <P>
                      Visit, LIVE, manual capture, chat maps, and location
                      features exist to support active safety awareness. They
                      must not be used to stalk, expose, fabricate, or mislead.
                    </P>
                    <UL
                      items={[
                        "Start a Visit only for real safety-focused context.",
                        "Do not create fake Visit sessions to deceive, pressure, frame, threaten, or manipulate someone.",
                        "Do not share LIVE links with people who should not receive them.",
                        "Do not access, guess, reuse, brute-force, scrape, or publish another person’s live link.",
                        "Do not spoof GPS, fake movement, or alter device location to mislead StayKnown or contacts.",
                        "Do not use fake GPS, emulators, modified apps, rooted/jailbroken manipulation, automation, or network tools to falsify safety context.",
                        "Do not use location data to threaten, expose, follow, shame, control, punish, or exploit a person.",
                        "Do not treat location as perfect proof; it may be approximate, delayed, stale, missing, or wrong.",
                      ]}
                    />
                    <LinkCard
                      href="/location-safety"
                      title="Location & Live Safety"
                      body="Detailed rules for Visit sessions, LIVE sharing, SOS, manual capture, chat maps, VPN gates, and accuracy limits."
                    />
                  </section>

                  <section id="vpn" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      10) VPN, network, and bypass restrictions
                    </H2>
                    <P>
                      VPN and network integrity matter because StayKnown uses
                      location and safety context. Users must not bypass safety
                      checks or hide abusive behavior.
                    </P>
                    <UL
                      items={[
                        "Do not use VPN, proxies, Tor-like routing, spoofing tools, fake GPS, emulators, or network manipulation to bypass restrictions.",
                        "Do not use VPN to hide abuse, avoid enforcement, manipulate location confidence, or bypass chat/location safety rules.",
                        "Do not bypass app-launch VPN checks, chat VPN gates, mid-Visit VPN warnings, or safety blocks.",
                        "Do not intercept, replay, forge, alter, or modify StayKnown requests, links, messages, alerts, emails, receipts, or notifications.",
                        "Do not interfere with email delivery, push notifications, live links, map views, payment verification, or safety alerts.",
                      ]}
                    />
                  </section>

                  <section id="chat" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ChatIcon className="h-4 w-4" />}>
                      11) Chat, files, media, stickers, stories, and private
                      communication
                    </H2>
                    <P>
                      StayKnown Chat and media features must be used
                      respectfully and lawfully.
                    </P>
                    <UL
                      items={[
                        "Do not use chat to threaten, harass, stalk, coerce, exploit, impersonate, groom, extort, or intimidate someone.",
                        "Do not send illegal, hateful, exploitative, abusive, harmful, deceptive, or threatening content.",
                        "Do not send malware, phishing links, spyware, harmful files, credential-stealing links, or deceptive attachments.",
                        "Do not bypass block, report, plan-gate, privacy, translation, VPN, media, or safety controls.",
                        "Do not use chat location context to target, follow, expose, shame, or control someone.",
                        "Do not upload or share private content, identity documents, images, videos, voice notes, or files without lawful permission.",
                        "Do not use stickers, voice stickers, music stickers, or video stickers to threaten, harass, shame, impersonate, or exploit a person.",
                        "Do not use stories, avatars, profile trust surfaces, or names to impersonate, shame, expose, threaten, or target anyone.",
                        "Do not use translation to impersonate, manipulate, threaten, deceive, or hide abuse.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/privacy"
                        title="Privacy Policy"
                        body="How StayKnown handles chat, media, translation, location metadata, safety gallery, and message records."
                      />
                      <LinkCard
                        href="/abuse"
                        title="Abuse Reporting"
                        body="Report threatening messages, unwanted contact, impersonation, unsafe media, or fake emergency behavior."
                      />
                    </div>
                  </section>

                  <section id="media" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ChatIcon className="h-4 w-4" />}>
                      12) Safety Gallery, recognition images, and user content
                    </H2>
                    <P>
                      Safety Gallery and profile media exist to help trusted
                      people recognize the user in safety contexts. They must
                      not be used for harassment, shame, impersonation, or
                      unlawful exposure.
                    </P>
                    <UL
                      items={[
                        "Upload only lawful images, videos, files, voice content, and media you have the right to use.",
                        "Do not upload another person’s private image, likeness, voice, or personal content without permission or lawful basis.",
                        "Do not use Safety Gallery, profile images, stories, or media to impersonate, defame, shame, expose, blackmail, or target anyone.",
                        "Do not use recognition images for stalking, surveillance, intimidation, or doxxing.",
                        "Do not bypass file, sticker, duration, storage, moderation, safety, or plan-gate rules.",
                        "Do not upload copyrighted music, video, or sticker content unless you own it or have the required rights.",
                      ]}
                    />
                  </section>

                  <section id="payments" className="scroll-mt-24 space-y-3">
                    <H2 icon={<WalletIcon className="h-4 w-4" />}>
                      13) Payments, subscriptions, coins, wallet, and refunds
                    </H2>
                    <P>
                      If StayKnown includes subscriptions, purchases, coins,
                      wallet, sending, withdrawals, or receipts, those systems
                      must not be abused.
                    </P>
                    <UL
                      items={[
                        "Do not use payment systems for fraud, money laundering, illegal funding, scams, deception, or chargeback abuse.",
                        "Do not manipulate receipts, app-store transactions, Paystack references, webhooks, ledgers, outbox jobs, wallet balances, withdrawals, subscription state, or plan gates.",
                        "Do not impersonate another user to receive coins, money, refunds, withdrawals, gifts, or plan benefits.",
                        "Do not use coins, payments, refunds, or wallet features to threaten, bribe, exploit, extort, or manipulate another person.",
                        "Do not bypass purchase verification, subscription expiry, failed-payment handling, account restrictions, or fraud checks.",
                        "Do not treat a paid plan as an emergency guarantee; paid features do not guarantee rescue, official dispatch, exact location, or contact response.",
                      ]}
                    />
                    <LinkCard
                      href="/billing-policy"
                      title="Billing & Refunds"
                      body="Dedicated rules for Starter, Pro, Pro Max, subscription payments, wallet/coins, receipts, cancellations, and refunds."
                    />
                  </section>

                  <section id="minors" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      14) Minors and vulnerable users
                    </H2>
                    <P>
                      StayKnown must not be used to target, exploit, groom,
                      manipulate, threaten, or secretly monitor minors or
                      vulnerable people.
                    </P>
                    <UL
                      items={[
                        "Under 13 users are not permitted to create an account or use StayKnown.",
                        "Ages 13–15 require active guardian permission and supervision where allowed.",
                        "Ages 16–17 require guardian permission or consent and lawful safety use where required.",
                        "Do not use StayKnown to facilitate grooming, trafficking, kidnapping, coercion, exploitation, or unsafe contact.",
                        "Do not use chat, stories, stickers, media, location, contact requests, or alerts to pressure a minor.",
                        "If a minor is in immediate danger, contact emergency services or the appropriate local authority first.",
                      ]}
                    />
                    <LinkCard
                      href="/minors"
                      title="Child Safety & Minor Use"
                      body="Dedicated rules for minors, guardians, families, schools, vulnerable users, and youth safety."
                    />
                  </section>

                  <section id="spam" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ContactIcon className="h-4 w-4" />}>
                      15) Spam, mass messaging, and contact abuse
                    </H2>
                    <P>
                      StayKnown contact and notification systems are safety
                      channels, not marketing, intimidation, or harassment
                      tools.
                    </P>
                    <UL
                      items={[
                        "Do not bulk-message contacts, users, strangers, or emails.",
                        "Do not repeatedly trigger alerts to annoy, frighten, pressure, or shame someone.",
                        "Do not use StayKnown as a broadcast, campaign, sales, or promotional system.",
                        "Do not use automated tools to send alerts, invites, contact requests, messages, reports, or approvals.",
                        "Do not add contacts without permission or lawful basis.",
                        "Do not use multiple accounts to avoid message, contact, alert, plan, or enforcement limits.",
                      ]}
                    />
                  </section>

                  <section id="security" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      16) Security, API, storage, and platform interference
                    </H2>
                    <P>
                      StayKnown’s systems must not be attacked, bypassed,
                      reverse engineered, scraped, or interfered with.
                    </P>
                    <UL
                      items={[
                        "Do not reverse engineer, disrupt, overload, scrape, or interfere with the Service.",
                        "Do not abuse APIs, storage, signed URLs, Supabase, Edge Functions, push systems, email systems, payment systems, translation systems, live maps, or map routes.",
                        "Do not access accounts, sessions, messages, media, location, contacts, wallet, subscriptions, safety gallery, or data that are not yours.",
                        "Do not bypass row-level security, authentication, JWT/session checks, storage policies, backend validation, webhook verification, or plan checks.",
                        "Do not use bots, automation, credential stuffing, brute force, denial-of-service, vulnerability testing, or scanning that harms users or service reliability.",
                        "Report security issues privately through the Security Disclosure route.",
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
                      17) Nigeria, United States, United Kingdom, EU, and global
                      use
                    </H2>
                    <P>
                      StayKnown may be used in different countries, but safety
                      laws, emergency systems, telecom reliability, privacy
                      expectations, and consent rules differ by location.
                    </P>

                    <H3>Nigeria usage language</H3>
                    <UL
                      items={[
                        "In Nigeria, use StayKnown only for lawful personal, family, community, workplace, travel, school, or safety awareness with trusted people.",
                        "Do not use StayKnown to shame, threaten, extort, monitor, expose, pressure, or control anyone.",
                        "Network issues, power supply, road conditions, rural coverage, city congestion, and provider delays may affect alerts and location accuracy.",
                        "If immediate danger is suspected, use appropriate local channels, which may include trusted family, local police, medical help, FRSC, NSCDC, NEMA, state emergency agencies, private security, or nearby responsible responders depending on the situation.",
                        "StayKnown does not replace Nigerian police, ambulance, hospitals, fire service, road safety, civil defence, disaster management, or any official authority.",
                      ]}
                    />

                    <H3>United States, U.K./EU, and other countries</H3>
                    <UL
                      items={[
                        "In the United States, StayKnown is not 911, a public safety answering point, law enforcement, EMS, fire department, or rescue provider.",
                        "In the U.K. and EU, StayKnown is not 999, 112, police, ambulance, fire service, or official emergency dispatch.",
                        "Users must follow local laws on stalking, harassment, privacy, minors, employment, schools, telecom, location sharing, protective orders, and emergency-service misuse.",
                        "If immediate danger is suspected, contact the official emergency number for the place where the event is happening.",
                      ]}
                    />
                  </section>

                  <section id="reports" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ReportIcon className="h-4 w-4" />}>
                      18) Reports, review, enforcement, and appeals
                    </H2>
                    <P>
                      StayKnown may investigate reports of misuse and take
                      action to protect users, contacts, minors, vulnerable
                      people, platform integrity, and the public.
                    </P>
                    <UL
                      items={[
                        "Violations may lead to warnings, feature limits, content removal, contact removal, account suspension, permanent ban, device restrictions, network restrictions, payment restrictions, or wallet restrictions.",
                        "StayKnown may preserve relevant records where required by law or reasonably needed to investigate abuse, threats, fraud, or safety risk.",
                        "StayKnown may cooperate with valid legal process or emergency requests where appropriate.",
                        "StayKnown may restrict features before a full investigation is complete if immediate safety risk exists.",
                        "Reports made in bad faith may themselves violate this policy.",
                        "If you believe an enforcement action was a mistake, you may contact support and request review. Do not create new accounts to bypass restrictions.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/abuse"
                        title="Abuse Reporting"
                        body="Report stalking, harassment, unwanted contact, impersonation, fake SOS, unsafe media, or platform misuse."
                      />
                      <LinkCard
                        href="/retention"
                        title="Data Retention"
                        body="How safety logs, location records, contact records, chat metadata, and legal holds may be kept."
                      />
                    </div>
                  </section>

                  <section id="legal" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      19) Lawful requests and cooperation
                    </H2>
                    <P>
                      StayKnown respects applicable laws and may respond to
                      valid legal process. We may preserve or disclose
                      information where required by law or necessary to enforce
                      terms, protect rights and safety, prevent fraud, or
                      prevent harm.
                    </P>
                    <UL
                      items={[
                        "StayKnown may preserve logs and records where required by law or reasonably needed to investigate abuse, threats, fraud, or safety concerns.",
                        "StayKnown may cooperate with lawful requests involving credible threats, fraud, kidnapping, trafficking, exploitation, or immediate harm.",
                        "StayKnown may reject, narrow, or question requests that are overbroad, unlawful, unsafe, or connected to misuse.",
                        "StayKnown does not support covert surveillance or unlawful monitoring.",
                      ]}
                    />
                    <LinkCard
                      href="/law"
                      title="Law Enforcement & Emergency Requests"
                      body="Dedicated policy for official requests, emergency disclosure, legal preservation, and request handling."
                    />
                  </section>

                  <section id="contact" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ReportIcon className="h-4 w-4" />}>
                      20) Contact and related policies
                    </H2>
                    <P>
                      For acceptable-use questions, abuse reports, safety
                      concerns, enforcement review, privacy concerns, or legal
                      concerns, contact StayKnown support.
                    </P>
                    <UL
                      items={[
                        "Support: support@stay-known.com",
                        "If you are in immediate danger, contact your local emergency number first.",
                        "Use Abuse Reporting for stalking, harassment, impersonation, fake emergency use, unwanted contact, or unsafe behavior.",
                        "Use Security Disclosure for vulnerability reports or platform-integrity concerns.",
                        "Use Law Enforcement & Emergency Requests for official requests, preservation, or urgent legal concerns.",
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
                        body="Broader safety policy for anti-stalking, anti-harassment, anti-coercion, and trusted-contact responsibilities."
                      />
                      <LinkCard
                        href="/location-safety"
                        title="Location & Live Safety"
                        body="Rules for Visit sessions, LIVE sharing, SOS, manual capture, chat maps, VPN gates, and accuracy limits."
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
                      <LinkCard
                        href="/emergency"
                        title="Emergency Disclaimer"
                        body="StayKnown is not official emergency services in Nigeria, the U.S., U.K./EU, or any country."
                      />
                    </div>
                  </section>

                  <section className="space-y-3 rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5">
                    <H2>21) Changes to this Acceptable Use Policy</H2>
                    <P>
                      StayKnown may update this policy to reflect new safety
                      features, chat features, media tools, payment systems,
                      contact flows, abuse patterns, legal requirements,
                      provider limitations, country-specific expectations, or
                      operational needs. If updates are material, StayKnown may
                      provide notice through the app, website, email, or another
                      reasonable method.
                    </P>
                  </section>

                  <section className="space-y-3 rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5">
                    <H2>Appendix A — In-app short acceptable-use notice</H2>
                    <P>
                      Use StayKnown only for lawful, safety-focused,
                      consent-based purposes. Do not use StayKnown for stalking,
                      harassment, hidden tracking, intimidation, false
                      emergencies, fraud, exploitation, violence, spam,
                      impersonation, payment abuse, unlawful surveillance, or
                      attempts to bypass safety systems. Respect approved
                      contacts, privacy, location limits, chat rules, minors,
                      local laws, and emergency-service boundaries. StayKnown
                      does not replace official emergency services in Nigeria,
                      the United States, the United Kingdom, the European Union,
                      or any country.
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
