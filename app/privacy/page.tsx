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
      "StayKnown Privacy Policy | Safety App, Live Location, SOS, Approved Contacts & Secure Chat";

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
      "Read the StayKnown Privacy Policy for safety app data, approved contacts, live location sharing, SOS alerts, secure chat, retention, privacy rights, and law enforcement request handling.",
    );
    upsertMeta(
      "keywords",
      "StayKnown privacy policy, safety app privacy, live location sharing privacy, SOS alert privacy, approved contacts, emergency contact consent, anti-stalking safety app, secure safety chat, data retention, CCPA, GDPR, US privacy rights",
    );
    upsertMeta("robots", "index, follow");
    upsertMeta("author", "6 Clement Joshua");
    upsertProperty(
      "og:title",
      "StayKnown Privacy Policy | Safety, Location & Approved Contact Data",
    );
    upsertProperty(
      "og:description",
      "How StayKnown handles safety app data, live location sharing, SOS alerts, approved contacts, chat, retention, privacy rights, and lawful disclosures.",
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

function SparkIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 2.8 13.7 8l5.3 1.7-5.3 1.7L12 16.8l-1.7-5.4L5 9.7 10.3 8 12 2.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="m18 14.4.85 2.55 2.55.85-2.55.85L18 21.2l-.85-2.55-2.55-.85 2.55-.85L18 14.4Z"
        stroke="currentColor"
        strokeWidth="1.4"
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

function PhoneIllustration() {
  return (
    <div className="relative mx-auto h-[280px] w-[190px] md:h-[320px] md:w-[220px]">
      <div className="absolute inset-0 animate-[softPulse_4s_ease-in-out_infinite] rounded-[2.2rem] bg-white/[0.045] blur-2xl" />

      <div className="relative h-full w-full rounded-[2rem] border border-white/15 bg-white/[0.055] p-3 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-white/20" />

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-white text-black">
              <ShieldIcon className="h-5 w-5" />
            </div>

            <div>
              <div className="text-[11px] font-black tracking-[0.18em] text-white/35">
                STAYKNOWN
              </div>
              <div className="text-[13px] font-black text-white">
                Privacy Guard
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {[
              ["Approved contacts", "Consent-first safety sharing"],
              ["Live location", "Active sessions only"],
              ["SOS alerts", "High-clarity emergency notice"],
              ["Secure chat", "Context, trust, reporting"],
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
            Protected
          </div>
          <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.9)]" />
        </div>
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  useSeoMeta();

  const nav = useMemo(
    () =>
      [
        ["summary", "Summary"],
        ["scope", "Scope"],
        ["principles", "Principles"],
        ["collect", "Data collected"],
        ["use", "Use of data"],
        ["location", "Location"],
        ["contacts", "Contacts"],
        ["chat", "Chat & media"],
        ["providers", "Providers"],
        ["sharing", "Disclosures"],
        ["retention", "Retention"],
        ["security", "Security"],
        ["children", "Minors"],
        ["rights", "Privacy rights"],
        ["law", "Law requests"],
        ["contact", "Contact"],
      ] as const,
    [],
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PrivacyPolicy",
    name: "StayKnown Privacy Policy",
    dateModified: UPDATED_AT,
    version: VERSION,
    publisher: {
      "@type": "Organization",
      name: "StayKnown",
      brand: "A 6 Clement Joshua service™",
      url: "https://stay-known.com",
    },
    description:
      "Privacy policy for StayKnown safety app covering live location sharing, approved contacts, SOS alerts, secure chat, data retention, privacy rights, and lawful disclosures.",
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
                    <Pill>Privacy Policy</Pill>
                    <Pill>Safety Data</Pill>
                    <Pill>Approved Contacts</Pill>
                  </div>

                  <h1 className="mt-5 max-w-3xl text-[30px] font-black tracking-[-0.045em] text-white md:text-[46px] md:leading-[1.02]">
                    StayKnown Privacy Policy for safety, location, SOS, approved
                    contacts, and secure communication.
                  </h1>

                  <p className="mt-5 max-w-3xl text-[14.5px] font-semibold leading-relaxed text-white/62 md:text-[15px]">
                    This Privacy Policy explains how StayKnown handles personal
                    data used for safety sessions, live location sharing, SOS
                    alerts, approved emergency contacts, secure chat, safety
                    gallery images, device signals, abuse prevention, retention,
                    and lawful requests.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <SoftBadge>Version {VERSION}</SoftBadge>
                    <SoftBadge>Updated: {fmtDate(UPDATED_AT)}</SoftBadge>
                  </div>
                </div>

                <PhoneIllustration />
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
              <aside className="border-b border-white/10 bg-black/35 p-5 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:p-6">
                <div className="text-[12px] font-black uppercase tracking-[0.2em] text-white/35">
                  On this page
                </div>

                <nav
                  aria-label="Privacy Policy sections"
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
                    <ShieldIcon className="h-4 w-4" />
                    Safety-first privacy
                  </div>
                  <p className="mt-2 text-[12px] font-semibold leading-relaxed text-white/50">
                    StayKnown does not sell personal data and does not support
                    hidden tracking, stalking, harassment, or coercive
                    monitoring.
                  </p>
                </div>
              </aside>

              <div className="p-5 md:p-8">
                <div className="space-y-8">
                  <section id="summary" className="scroll-mt-24 space-y-4">
                    <H2 icon={<SparkIcon className="h-4 w-4" />}>
                      1) Privacy summary
                    </H2>
                    <P>
                      StayKnown is a safety-awareness and trusted-contact
                      service. The app is designed to help people voluntarily
                      share safety context with approved contacts during visits,
                      live location sessions, SOS events, secure chat, and
                      related safety communication. This policy explains what we
                      collect, how we use it, who may receive it, how long we
                      may keep it, and what rights may apply to you.
                    </P>

                    <div className="grid gap-3 md:grid-cols-3">
                      <Callout
                        title="Consent matters"
                        body="StayKnown is designed around user permission, approved contacts, and lawful safety use. It is not built for hidden monitoring."
                        icon={<ContactIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="Location is sensitive"
                        body="Location data may be used for active Visit sessions, SOS alerts, chat location context, manual capture, and safety history when permissions and features allow."
                        icon={<LocationIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="Emergency limits"
                        body="StayKnown does not replace police, ambulance, fire service, emergency dispatch, 911, 112, 999, or any official emergency response service."
                        icon={<ShieldIcon className="h-5 w-5" />}
                      />
                    </div>
                  </section>

                  <section id="scope" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      2) Scope and who this policy applies to
                    </H2>
                    <P>
                      This Privacy Policy applies to StayKnown’s website, mobile
                      applications, web pages, safety map pages, live map flows,
                      chat map flows, emails, notifications, account features,
                      and related services together called the “Service.”
                    </P>
                    <P>
                      This policy applies when you create an account, use
                      StayKnown as a visitor or approved contact, start or end a
                      Visit, use LIVE sharing, trigger SOS, send manual safety
                      captures, use chat, upload safety media, contact support,
                      report misuse, request deletion, or interact with
                      StayKnown legal and safety pages.
                    </P>
                    <Example
                      title="Examples"
                      items={[
                        "If you start a Visit, we process session timing, safety state, and related safety context.",
                        "If you send an SOS alert, we process alert details needed to notify approved contacts.",
                        "If an approved contact opens a live map or chat map, we may show safety context connected to the permitted flow.",
                        "If you submit a report, we process the report so StayKnown can review misuse, harassment, stalking concerns, or safety abuse.",
                      ]}
                    />
                  </section>

                  <section id="principles" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      3) Privacy and safety principles
                    </H2>
                    <UL
                      items={[
                        "Minimum necessary: StayKnown aims to collect and keep only what is reasonably needed to operate safety features, prevent abuse, support users, and meet legal obligations.",
                        "Consent-first safety: safety visibility should begin from user action, approved contact relationships, and lawful purpose.",
                        "No hidden tracking: StayKnown is not designed for covert monitoring, stalking, harassment, intimidation, or controlling another person.",
                        "Purpose limitation: safety data should be used for safety, account operation, abuse prevention, support, compliance, and reliability.",
                        "Transparency: users and approved contacts should understand what safety information is being shown and why.",
                        "Security by design: StayKnown applies account, device, network, and operational safeguards to reduce unauthorized access and misuse.",
                        "Civil respect: StayKnown must not be used to discriminate, threaten, intimidate, exploit, impersonate, or violate protective orders, restraining orders, or civil rights.",
                      ]}
                    />
                  </section>

                  <section id="collect" className="scroll-mt-24 space-y-3">
                    <H2 icon={<SparkIcon className="h-4 w-4" />}>
                      4) Information StayKnown may collect
                    </H2>

                    <H3>4.1 Account and profile information</H3>
                    <UL
                      items={[
                        "Account identifiers such as email address, user ID, username, display name, and authentication status.",
                        "Profile information you choose to provide, such as first name, last name, avatar, phone number, safety gallery image, and selected preferences.",
                        "Subscription and plan state, including Starter, Pro, Pro Max, active, expired, failed, downgraded, or restored status.",
                      ]}
                    />

                    <H3>4.2 Safety session and emergency information</H3>
                    <UL
                      items={[
                        "Visit session records, including start time, end time, active status, destination context, safety notes, and visit state.",
                        "SOS records, including activation time, stop/verification events, escalation status, and notification delivery events.",
                        "Manual emergency capture records sent during active safety sessions.",
                        "Safety history records used for user review, reliability, abuse prevention, and safety auditing.",
                      ]}
                    />

                    <H3>4.3 Location and map information</H3>
                    <UL
                      items={[
                        "Precise or approximate coordinates when permission is granted and the feature requires location.",
                        "Accuracy, captured time, location source, place labels, map display context, and reverse-geocoded area descriptions.",
                        "Live map and chat map context shown only through permitted StayKnown flows, such as active Visit, SOS, manual capture, or approved-contact chat.",
                        "Signals affecting location reliability, including network conditions, GPS availability, VPN detection, battery behavior, and device permission state.",
                      ]}
                    />

                    <H3>
                      4.4 Contacts, approval, and communication information
                    </H3>
                    <UL
                      items={[
                        "Emergency contact and SOS responder identifiers that you provide, including email or other supported contact details.",
                        "Contact approval status, consent records, pending, approved, declined, expired, removed, or blocked-add state.",
                        "Notification delivery metadata, including sent time, delivery state, recipient identifier, and event type.",
                        "Chat thread participants, approved-contact state, message metadata, reactions, media references, translation state, read/delivery status, and safety location metadata where required by the feature.",
                      ]}
                    />

                    <H3>
                      4.5 Media, files, voice, stickers, and safety gallery
                    </H3>
                    <UL
                      items={[
                        "Images, videos, files, voice notes, stickers, safety gallery content, and related metadata you choose to upload or send.",
                        "Media type, storage path, size, duration, thumbnail, moderation or abuse-report metadata, and delivery state.",
                        "Translation or transcription-related metadata where supported and permitted.",
                      ]}
                    />

                    <H3>4.6 Device, security, and diagnostic information</H3>
                    <UL
                      items={[
                        "Device type, app version, operating system, language preference, push notification tokens, and limited diagnostic logs.",
                        "Security signals used to protect accounts, detect abuse, enforce limits, prevent spam, and protect safety flows.",
                        "Approximate network and reliability signals, including failed delivery, VPN safety gate events, and high-risk behavior patterns.",
                      ]}
                    />

                    <H3>
                      4.7 Payment, subscription, wallet, and receipt information
                    </H3>
                    <UL
                      items={[
                        "Plan purchase or renewal state, payment provider reference, subscription expiry, payment failure, refund state, and receipt metadata.",
                        "Wallet or coin ledger records where supported, including transaction type, amount, time, and fraud-prevention status.",
                        "StayKnown does not need to store full card numbers. Payment processors may handle card or bank details under their own security and compliance obligations.",
                      ]}
                    />

                    <Callout
                      title="No sale of personal data"
                      body="StayKnown does not sell personal data. Safety, location, contact, chat, and emergency information are used to operate the Service, protect users, enforce rules, and meet lawful obligations."
                      icon={<LockIcon className="h-5 w-5" />}
                    />
                  </section>

                  <section id="use" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      5) How StayKnown uses information
                    </H2>
                    <UL
                      items={[
                        "To create, authenticate, secure, and maintain user accounts.",
                        "To operate Visit sessions, live location sharing, SOS alerts, manual capture, approved contact notifications, and safety history.",
                        "To provide approved-contact safety visibility and context when a user has permitted or triggered a supported safety flow.",
                        "To support secure chat, chat location context, media delivery, read/delivery status, message reactions, translation handling, and abuse reporting.",
                        "To enforce contact approval, consent, blocked-add settings, and trusted contact responsibilities.",
                        "To send service notifications, safety alerts, approval emails, support replies, receipts, subscription messages, and critical policy notices.",
                        "To prevent stalking, harassment, impersonation, fraud, false emergency use, spam, coercive monitoring, and other misuse.",
                        "To troubleshoot location accuracy, notification delivery, app crashes, map reliability, translation issues, and device behavior.",
                        "To comply with law, respond to valid legal process, preserve relevant records, protect rights, protect safety, and enforce StayKnown policies.",
                      ]}
                    />
                  </section>

                  <section id="location" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LocationIcon className="h-4 w-4" />}>
                      6) Location data, live map, chat map, and accuracy
                    </H2>
                    <P>
                      Location information is sensitive. StayKnown uses location
                      to support safety features such as Visit sessions, LIVE
                      sharing, SOS alerts, manual emergency capture, approved
                      contact maps, chat map context, and safety history.
                    </P>
                    <UL
                      items={[
                        "Location sharing depends on permissions, device settings, app state, GPS, network access, battery settings, and supported plan features.",
                        "Approved contacts may see location-related safety context only through permitted flows, such as a user-started Visit, SOS alert, manual capture, or approved-contact chat map.",
                        "Location may be delayed, approximate, incomplete, or unavailable because of device, network, VPN, battery, permission, or third-party map provider limitations.",
                        "StayKnown may use place labels, reverse geocoding, and map providers to help contacts understand an area, but labels may not always be exact.",
                        "The VPN safety gate exists because VPN use can reduce reliability, confuse routing, or affect safety-location accuracy.",
                        "StayKnown does not guarantee exact lane-level, building-level, room-level, or real-time emergency positioning.",
                      ]}
                    />
                    <Callout
                      title="Emergency limitation"
                      body="If there is immediate danger, use official emergency services first. StayKnown can increase safety awareness, but it is not an emergency dispatch provider."
                      icon={<ShieldIcon className="h-5 w-5" />}
                    />
                  </section>

                  <section id="contacts" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ContactIcon className="h-4 w-4" />}>
                      7) Approved contacts, consent, and notifications
                    </H2>
                    <P>
                      StayKnown is built around trusted relationships. Emergency
                      contacts and SOS responders should be added only for
                      lawful, safety-focused purposes. Where approval is
                      required, contacts must approve before receiving certain
                      safety responsibilities or access.
                    </P>
                    <UL
                      items={[
                        "You must not add a person as a contact to harass, intimidate, spam, impersonate, monitor, pressure, or control them.",
                        "If a contact declines, asks to be removed, or blocks being added, you must respect that choice.",
                        "Contacts may receive email, push, web, live map, chat map, SOS, manual capture, or safety status notifications depending on feature and approval state.",
                        "Contact approval records may be retained to prove consent, reduce disputes, prevent abuse, and protect users.",
                        "False contact information, repeated unwanted notifications, or abuse of approval flows may lead to feature limits, suspension, or permanent removal.",
                      ]}
                    />
                    <Example
                      title="Allowed and not allowed"
                      items={[
                        "Allowed: adding a trusted sibling who agreed to receive safety Visit updates.",
                        "Allowed: adding a parent, spouse, close friend, or workplace safety contact with permission.",
                        "Not allowed: adding an ex-partner, stranger, protected person, or unwilling contact to pressure or monitor them.",
                        "Not allowed: using StayKnown to bypass a restraining order, protective order, no-contact order, school order, workplace order, or court instruction.",
                      ]}
                    />
                  </section>

                  <section id="chat" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      8) Secure chat, media, translation, and safety context
                    </H2>
                    <P>
                      StayKnown Chat is designed for approved-contact
                      communication, safety context, and responsible
                      coordination. Chat features may include text, media,
                      files, voice notes, stickers, reactions, translation,
                      read/delivery status, and location metadata.
                    </P>
                    <UL
                      items={[
                        "Messages may include safety metadata such as sender, recipient, thread ID, delivery/read status, location context, place label, and captured time.",
                        "Chat location context helps approved contacts understand where a message or safety update came from when the feature requires it.",
                        "Translation may process message text, media captions, voice note text, or language metadata through approved providers where enabled.",
                        "Users must not use chat to threaten, exploit, harass, impersonate, stalk, intimidate, or coordinate harm.",
                        "Reported chat content may be reviewed for safety, policy enforcement, legal compliance, and abuse prevention.",
                        "Deleted or removed content may remain in backups, logs, legal holds, safety records, or abuse-review systems where permitted or required.",
                      ]}
                    />
                  </section>

                  <section id="providers" className="scroll-mt-24 space-y-3">
                    <H2 icon={<SparkIcon className="h-4 w-4" />}>
                      9) Third-party service providers
                    </H2>
                    <P>
                      StayKnown may use trusted service providers to operate the
                      Service. These providers process information only as
                      needed for hosting, authentication, storage,
                      notifications, email, payments, maps, translation,
                      security, logging, and support.
                    </P>
                    <UL
                      items={[
                        "Supabase or similar infrastructure providers may support authentication, database, storage, edge functions, and security rules.",
                        "Resend or similar email providers may deliver safety alerts, approval emails, receipts, and account notices.",
                        "Paystack or other approved payment processors may process subscription, wallet, receipt, or payment information.",
                        "TomTom, OpenCage, Mapbox, or similar map/geocoding providers may process coordinates or place data to show maps and readable place labels.",
                        "DeepL or similar translation providers may process supported text or language data where translation features are enabled.",
                        "Apple, Google, device operating systems, and push notification providers may process device tokens and notification routing data.",
                      ]}
                    />
                    <P>
                      Third-party providers may have their own privacy and
                      security obligations. StayKnown aims to use providers that
                      support secure, lawful, and reliable operation of safety
                      features.
                    </P>
                  </section>

                  <section id="sharing" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      10) Sharing, disclosure, and access
                    </H2>

                    <H3>10.1 With approved contacts and recipients</H3>
                    <P>
                      When you trigger a StayKnown safety flow, approved
                      contacts or selected recipients may receive the
                      information needed to understand the safety event. This
                      may include your name, profile information, safety gallery
                      image, live map session, location, place label,
                      destination context, message context, timestamps, and
                      emergency status.
                    </P>

                    <H3>10.2 With service providers</H3>
                    <P>
                      StayKnown may share information with providers that help
                      us deliver the Service. These providers are expected to
                      process data for operational purposes such as hosting,
                      storage, maps, email, push notifications, payments,
                      translation, logs, and security.
                    </P>

                    <H3>
                      10.3 For safety, abuse prevention, and civil protection
                    </H3>
                    <P>
                      StayKnown may review, preserve, or disclose information
                      where reasonably necessary to investigate misuse, protect
                      users or contacts, prevent harassment, prevent stalking,
                      prevent fraud, enforce restrictions, or reduce credible
                      safety risks.
                    </P>

                    <H3>10.4 For legal, regulatory, and government reasons</H3>
                    <P>
                      StayKnown may disclose information when required by valid
                      legal process or where disclosure is reasonably necessary
                      to comply with law, protect life or safety, enforce terms,
                      protect rights, prevent fraud, investigate abuse, or
                      respond to lawful emergency requests.
                    </P>
                  </section>

                  <section id="retention" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      11) Data retention and deletion
                    </H2>
                    <P>
                      StayKnown keeps information for as long as reasonably
                      needed for the purpose collected, including safety
                      history, service operation, legal compliance, abuse
                      prevention, dispute resolution, account management,
                      payment records, and security.
                    </P>
                    <UL
                      items={[
                        "Account data may be kept while your account is active and for a reasonable period after closure where needed for legal, security, or abuse-prevention reasons.",
                        "Safety session logs may be retained so users can review history and so StayKnown can investigate safety incidents or misuse.",
                        "Contact approval and consent records may be retained to prove authorization, resolve disputes, and protect contacts.",
                        "Security logs may be retained longer to prevent repeated abuse, fraud, stalking, harassment, or bypass attempts.",
                        "Payment and receipt records may be retained as required for tax, accounting, chargeback, refund, and legal compliance.",
                        "Deletion requests may be limited where records must be preserved for law, safety, legal claims, fraud prevention, or legitimate security reasons.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/retention"
                        title="Data Retention Policy"
                        body="Read the detailed StayKnown retention flow for safety logs, account records, chat, media, and legal holds."
                      />
                      <LinkCard
                        href="/abuse"
                        title="Abuse Reporting"
                        body="Report misuse, stalking, harassment, impersonation, fake emergency use, or unsafe behavior."
                      />
                    </div>
                  </section>

                  <section id="security" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      12) Security controls
                    </H2>
                    <UL
                      items={[
                        "StayKnown uses access controls, authentication, database rules, service restrictions, and operational safeguards designed to protect safety data.",
                        "StayKnown may use rate limits, device checks, VPN safety gates, session validation, approval checks, plan checks, and abuse monitoring.",
                        "StayKnown may restrict accounts, devices, sessions, contact flows, or safety features where misuse, fraud, stalking, spam, or safety risk is detected.",
                        "No system is perfectly secure. Users must protect their devices, passwords, email accounts, phone numbers, and app access.",
                        "Security researchers should report vulnerabilities responsibly and should not access, extract, destroy, publish, or expose private user data.",
                      ]}
                    />
                    <LinkCard
                      href="/security"
                      title="Security Disclosure"
                      body="Use this route for vulnerability reports, responsible disclosure, and platform integrity concerns."
                    />
                  </section>

                  <section id="children" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      13) Children, teens, guardians, and vulnerable users
                    </H2>
                    <UL
                      items={[
                        "Under 13: not permitted to create an account or use StayKnown.",
                        "Ages 13–15: permitted only with active permission and supervision of a parent or legal guardian and only for lawful safety use.",
                        "Ages 16–17: permitted with permission or consent of a parent or legal guardian, and only for lawful safety use.",
                        "If local law requires a higher age, guardian consent, school approval, workplace approval, or special protection, the stricter rule applies.",
                        "Adults must not use StayKnown to exploit, pressure, secretly monitor, or unlawfully control minors or vulnerable persons.",
                        "Reports involving minors, coercion, exploitation, stalking, or credible safety threats may receive heightened review and enforcement.",
                      ]}
                    />
                    <Callout
                      title="Minor safety standard"
                      body="StayKnown must be used to increase safety and consent-based awareness, not to hide control, coercion, exploitation, or unauthorized monitoring."
                      icon={<ShieldIcon className="h-5 w-5" />}
                    />
                    <LinkCard
                      href="/minors"
                      title="Child Safety & Minor Use"
                      body="Read the dedicated minor-use rules, guardian expectations, and youth safety protections."
                    />
                  </section>

                  <section id="rights" className="scroll-mt-24 space-y-3">
                    <H2 icon={<SparkIcon className="h-4 w-4" />}>
                      14) Your privacy rights
                    </H2>
                    <P>
                      Depending on where you live, you may have privacy rights
                      under laws such as U.S. state privacy laws, California
                      privacy laws, GDPR, UK GDPR, Nigerian data protection law,
                      or other local laws. Rights may vary by jurisdiction.
                    </P>

                    <H3>14.1 Rights that may apply</H3>
                    <UL
                      items={[
                        "Access: request information about personal data StayKnown holds about you.",
                        "Correction: request correction of inaccurate or incomplete information.",
                        "Deletion: request deletion of eligible personal data.",
                        "Portability: request export of certain information in a usable format where required.",
                        "Restriction: request limits on certain processing where applicable.",
                        "Objection: object to certain processing where applicable.",
                        "Appeal: appeal certain privacy decisions where local law provides that right.",
                        "Non-discrimination: you should not be punished for exercising legally protected privacy rights.",
                      ]}
                    />

                    <H3>14.2 U.S. privacy and civil expectations</H3>
                    <UL
                      items={[
                        "StayKnown does not sell personal data.",
                        "StayKnown does not use safety-location data for hidden surveillance advertising.",
                        "StayKnown aims to use sensitive data only for safety, service operation, security, compliance, support, and fraud or abuse prevention.",
                        "Verified requests may be required before releasing, deleting, or changing account data.",
                        "Some records may be kept where needed for safety, legal compliance, fraud prevention, dispute handling, or security.",
                      ]}
                    />

                    <H3>14.3 How to make a request</H3>
                    <P>
                      Contact support@stay-known.com. StayKnown may ask you to
                      verify your identity, prove account ownership, provide
                      required details, or clarify the scope of the request
                      before acting.
                    </P>
                  </section>

                  <section id="law" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      15) Law enforcement, emergency requests, and civil safety
                    </H2>
                    <P>
                      StayKnown respects lawful process and user privacy. We do
                      not provide private user data to random individuals,
                      unsafe requesters, or unofficial parties simply because
                      they ask. Law enforcement, government agencies, courts,
                      emergency authorities, or authorized legal representatives
                      should use the proper request channel and provide
                      sufficient legal basis.
                    </P>
                    <UL
                      items={[
                        "StayKnown may require valid legal process before disclosing account, location, chat, contact, or safety records.",
                        "Emergency disclosures may be considered only where permitted by law and where there is a credible risk involving death, serious physical harm, exploitation, or urgent safety threat.",
                        "Requests should be limited, specific, lawful, and connected to a real investigation, emergency, court matter, or safety need.",
                        "StayKnown may preserve relevant records when legally required or where preservation is reasonably necessary to prevent harm or investigate abuse.",
                        "StayKnown may reject, narrow, or challenge requests that are overbroad, unlawful, unclear, unsafe, or inconsistent with user privacy and civil rights.",
                        "Where legally permitted and appropriate, StayKnown may notify affected users of legal requests. Notification may be delayed or withheld if prohibited by law, court order, safety concern, or emergency circumstance.",
                      ]}
                    />
                    <LinkCard
                      href="/law"
                      title="Law Enforcement & Emergency Requests"
                      body="Read the dedicated policy for official requests, emergency disclosures, preservation, and legal process."
                    />
                  </section>

                  <section id="contact" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ContactIcon className="h-4 w-4" />}>
                      16) Contact, reports, and policy cross-references
                    </H2>
                    <P>
                      For privacy questions, account requests, abuse reports,
                      safety concerns, or legal concerns, contact StayKnown
                      support.
                    </P>
                    <UL
                      items={[
                        "Privacy and support: support@stay-known.com",
                        "Abuse or misuse reports: use the Abuse Reporting page or contact support.",
                        "Security vulnerabilities: use the Security Disclosure page.",
                        "Law enforcement and emergency requests: use the Law Enforcement & Emergency Requests page.",
                      ]}
                    />

                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/terms"
                        title="Terms of Service"
                        body="Main user agreement for StayKnown accounts, safety features, limits, and enforcement."
                      />
                      <LinkCard
                        href="/location-safety"
                        title="Location & Live Safety"
                        body="Dedicated rules for live location, Visit sessions, SOS, chat maps, manual capture, and VPN gates."
                      />
                      <LinkCard
                        href="/contact-consent"
                        title="Contact Consent"
                        body="How approved contacts, SOS responders, consent, blocking, and removal rights work."
                      />
                      <LinkCard
                        href="/billing-policy"
                        title="Billing & Refunds"
                        body="Subscription, Pro, Pro Max, wallet, receipts, payment failure, and refund guidance."
                      />
                      <LinkCard
                        href="/safety"
                        title="Safety & Anti-Stalking"
                        body="Anti-stalking, anti-harassment, anti-coercion, protective-order, and misuse rules."
                      />
                      <LinkCard
                        href="/emergency"
                        title="Emergency Disclaimer"
                        body="Important limits: StayKnown does not replace official emergency services."
                      />
                    </div>
                  </section>

                  <section className="space-y-3 rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5">
                    <H2>17) Changes to this Privacy Policy</H2>
                    <P>
                      StayKnown may update this Privacy Policy to reflect new
                      features, safety improvements, legal requirements,
                      provider changes, technical changes, civil-safety
                      expectations, or operational needs. If changes are
                      material, StayKnown may provide notice through the app,
                      website, email, or another reasonable method, and may
                      require acceptance before continued use.
                    </P>
                  </section>

                  <section className="space-y-3 rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5">
                    <H2>Appendix A — In-app short privacy notice</H2>
                    <P>
                      StayKnown uses personal data to operate safety features,
                      approved-contact communication, Visit sessions, SOS
                      alerts, manual capture, live maps, chat maps, secure chat,
                      subscriptions, support, abuse prevention, and lawful
                      compliance. StayKnown does not sell personal data and does
                      not support hidden tracking, stalking, harassment, or
                      coercive monitoring. Location and safety data may be shown
                      to approved contacts only through supported and permitted
                      safety flows. StayKnown does not replace official
                      emergency services.
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
