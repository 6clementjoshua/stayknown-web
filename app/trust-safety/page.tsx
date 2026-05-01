"use client";

import Image from "next/image";
import { useEffect } from "react";

const UPDATED_AT = "2026-05-01";
const VERSION = "1.0";

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
      "StayKnown Trust & Safety Center | Safety, Consent, SOS, Live Location, Abuse Prevention & Security";

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
      "StayKnown Trust & Safety Center explains how StayKnown protects users with approved contacts, consent-first safety sharing, live location, SOS, manual capture, anti-stalking rules, abuse reporting, privacy, security, and emergency limitations.",
    );
    upsertMeta(
      "keywords",
      "StayKnown trust and safety, safety app trust center, anti-stalking app, live location safety, SOS safety app, approved contacts, emergency contact safety, abuse reporting, child safety, privacy security safety app",
    );
    upsertMeta("robots", "index, follow");
    upsertMeta("author", "6 Clement Joshua");

    upsertProperty("og:title", "StayKnown Trust & Safety Center");
    upsertProperty(
      "og:description",
      "How StayKnown protects people through consent-first safety sharing, approved contacts, SOS, live location, abuse prevention, privacy, and security controls.",
    );
    upsertProperty("og:type", "website");
    upsertProperty("og:site_name", "StayKnown");
  }, []);
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
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

function ChildIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M6.3 20.2c.7-3.65 2.75-5.65 5.7-5.65s5 2 5.7 5.65"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M4.2 10.5 2.8 8.8M19.8 10.5l1.4-1.7"
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

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M8.2 5.8 14.4 12l-6.2 6.2"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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

function SectionTitle({
  children,
  icon,
  kicker,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  kicker?: string;
}) {
  return (
    <div>
      {kicker ? (
        <div className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/34">
          {kicker}
        </div>
      ) : null}

      <h2 className="text-[22px] font-black tracking-[-0.035em] text-white md:text-[28px]">
        <span className="inline-flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.045] text-white/85">
            {icon}
          </span>
          <span>{children}</span>
        </span>
      </h2>
    </div>
  );
}

function PrincipleCard({
  icon,
  title,
  body,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  delay?: number;
}) {
  return (
    <div
      className="group animate-[riseIn_0.55s_ease_both] rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-white/18 hover:bg-white/[0.06]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-black/40 text-white/82 transition group-hover:bg-white group-hover:text-black">
          {icon}
        </div>
        <div>
          <div className="text-[15px] font-black text-white/92">{title}</div>
          <p className="mt-2 text-[13px] font-semibold leading-relaxed text-white/54">
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}

function BulletCard({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.045] text-white/82">
          {icon}
        </span>
        <div className="text-[15px] font-black text-white/92">{title}</div>
      </div>

      <div className="mt-4 grid gap-2">
        {items.map((item) => (
          <div
            key={item}
            className="flex gap-3 rounded-2xl border border-white/10 bg-black/22 px-3 py-3"
          >
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-white/65" />
            <span className="text-[13px] font-semibold leading-relaxed text-white/56">
              {item}
            </span>
          </div>
        ))}
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
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/35 transition group-hover:translate-x-0.5 group-hover:text-white">
          <ArrowIcon className="h-4 w-4" />
        </span>
      </div>
    </a>
  );
}

function ActionPanel() {
  return (
    <div className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.035] p-5 shadow-sm md:p-6">
      <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-white/[0.055] blur-3xl" />

      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white/44">
          Need action?
        </div>

        <h3 className="mt-4 text-[24px] font-black tracking-[-0.035em] text-white">
          Report abuse, get help, or learn the rules before using safety
          features.
        </h3>

        <p className="mt-3 max-w-3xl text-[13.5px] font-semibold leading-relaxed text-white/56">
          If someone is misusing StayKnown for stalking, harassment, false SOS,
          unwanted contact, impersonation, payment fraud, or unsafe behavior,
          use the correct route below. If immediate danger exists, contact local
          emergency services first.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href="/abuse"
            className="rounded-full border border-white/15 bg-white px-4 py-2 text-[12px] font-black text-black transition hover:-translate-y-0.5 hover:bg-white/90"
          >
            Report abuse
          </a>
          <a
            href="/help-center"
            className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-[12px] font-black text-white/72 transition hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.075] hover:text-white"
          >
            Open Help Center
          </a>
          <a
            href="/submit-request"
            className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-[12px] font-black text-white/72 transition hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.075] hover:text-white"
          >
            Submit request
          </a>
        </div>
      </div>
    </div>
  );
}

export default function TrustSafetyPage() {
  useSeoMeta();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "StayKnown Trust & Safety Center",
    dateModified: UPDATED_AT,
    version: VERSION,
    publisher: {
      "@type": "Organization",
      name: "StayKnown",
      brand: "A 6 Clement Joshua service™",
      url: "https://stay-known.com",
      logo: "https://stay-known.com/6logo.png",
    },
    description:
      "StayKnown Trust & Safety Center covering approved contacts, consent-first safety sharing, live location, SOS, manual capture, anti-stalking rules, abuse reporting, privacy, security, minor safety, and emergency limitations.",
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

        @keyframes riseIn {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.99);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes pulseHalo {
          0%,
          100% {
            opacity: 0.45;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.055);
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
            transition-duration: 0.001ms !important;
            scroll-behavior: auto !important;
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
              width={40}
              height={40}
              priority
              className="rounded-full bg-white object-contain p-0.5"
            />
            <div className="text-[12px] font-extrabold tracking-[0.28em] text-white">
              STAYKNOWN
            </div>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-8 md:pt-12">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/60 backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(255,255,255,0.11),transparent_32%),radial-gradient(circle_at_80%_12%,rgba(255,255,255,0.045),transparent_26%)]" />

          <div className="relative grid gap-8 px-5 py-8 md:grid-cols-[1fr_280px] md:items-center md:px-8 md:py-10">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Pill>Trust & Safety</Pill>
                <Pill>Consent First</Pill>
                <Pill>Anti-Stalking</Pill>
              </div>

              <h1 className="mt-5 max-w-4xl text-[34px] font-black tracking-[-0.055em] text-white md:text-[58px] md:leading-[1.02]">
                StayKnown Trust & Safety Center for real protection, approved
                contacts, and responsible safety sharing.
              </h1>

              <p className="mt-5 max-w-3xl text-[14px] font-semibold leading-relaxed text-white/60 md:text-[15px]">
                StayKnown is built for safety-aware relationships: people you
                know, contacts you trust, locations you choose to share, and
                emergency moments that must never be abused. This center
                explains how StayKnown protects users, prevents misuse, and sets
                clear boundaries for responsible use.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <SoftBadge>Version {VERSION}</SoftBadge>
                <SoftBadge>Updated: {fmtDate(UPDATED_AT)}</SoftBadge>
              </div>
            </div>

            <div className="relative mx-auto h-[260px] w-[220px] md:h-[300px] md:w-[250px]">
              <div className="absolute inset-0 animate-[pulseHalo_4s_ease-in-out_infinite] rounded-full bg-white/[0.055] blur-3xl" />

              <div className="relative flex h-full w-full items-center justify-center rounded-[2rem] border border-white/12 bg-white/[0.045] p-5 shadow-2xl shadow-black/50 backdrop-blur-2xl">
                <div className="grid h-32 w-32 place-items-center rounded-[2.2rem] border border-white/12 bg-black/45 text-white shadow-2xl">
                  <ShieldIcon className="h-20 w-20" />
                </div>

                <div className="absolute left-5 top-5 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/80">
                  <LocationIcon className="h-6 w-6" />
                </div>

                <div className="absolute right-5 top-8 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/80">
                  <ContactIcon className="h-6 w-6" />
                </div>

                <div className="absolute bottom-6 left-8 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/80">
                  <LockIcon className="h-6 w-6" />
                </div>

                <div className="absolute bottom-5 right-7 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/80">
                  <AlertIcon className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="pt-8">
          <div className="grid gap-4 md:grid-cols-3">
            <PrincipleCard
              icon={<ContactIcon className="h-5 w-5" />}
              title="Known people, not random tracking"
              body="StayKnown is built around trusted contacts, approved access, consent-aware safety flows, and responsible emergency context."
              delay={0}
            />
            <PrincipleCard
              icon={<LocationIcon className="h-5 w-5" />}
              title="Location has a safety purpose"
              body="Location context is for Visits, LIVE sharing, SOS, Manual Capture, and approved-contact safety awareness — not stalking."
              delay={80}
            />
            <PrincipleCard
              icon={<AlertIcon className="h-5 w-5" />}
              title="SOS must never be abused"
              body="False emergencies, prank alerts, coercive SOS use, or using alerts to frighten people can lead to review and restrictions."
              delay={160}
            />
          </div>
        </section>

        <section className="pt-10">
          <SectionTitle
            kicker="How StayKnown protects users"
            icon={<ShieldIcon className="h-5 w-5" />}
          >
            Safety architecture users can understand
          </SectionTitle>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <BulletCard
              icon={<ContactIcon className="h-5 w-5" />}
              title="Consent and contact trust"
              items={[
                "Approved contacts and SOS responders help keep safety access intentional.",
                "Declines, removals, expirations, and blocked-add settings must be respected.",
                "Contact approval records help reduce disputes and support safety review.",
                "StayKnown is for people with a lawful and trusted safety relationship.",
              ]}
            />

            <BulletCard
              icon={<LocationIcon className="h-5 w-5" />}
              title="Visit, LIVE, SOS, and Manual Capture"
              items={[
                "Visit sessions help users share safety context when actively moving, visiting, or meeting.",
                "LIVE map context is tied to permitted safety flows and approved contact access.",
                "SOS is for serious safety moments, not jokes, pressure, revenge, or false emergencies.",
                "Manual Capture can send an extra safety update during an active Visit where supported.",
              ]}
            />

            <BulletCard
              icon={<ChatIcon className="h-5 w-5" />}
              title="Safety-aware communication"
              items={[
                "StayKnown Chat is designed around approved contacts and trusted communication.",
                "Chat, media, voice notes, stickers, stories, and translation must follow safety rules.",
                "Messages and media must not be used for threats, harassment, impersonation, or exploitation.",
                "Blocked users, reports, and restrictions help reduce communication abuse.",
              ]}
            />

            <BulletCard
              icon={<LockIcon className="h-5 w-5" />}
              title="Security and integrity controls"
              items={[
                "VPN and device-integrity checks can protect location reliability and platform safety.",
                "Rate limits, plan gates, storage policies, and backend checks help reduce abuse.",
                "Security reports should be submitted responsibly through the security route.",
                "Suspicious activity may lead to restriction, preservation of records, or review.",
              ]}
            />
          </div>
        </section>

        <section className="pt-10">
          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.032] p-5 shadow-sm md:p-6">
            <SectionTitle
              kicker="What StayKnown does not allow"
              icon={<AlertIcon className="h-5 w-5" />}
            >
              Clear prohibited safety misuse
            </SectionTitle>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {[
                "No stalking, harassment, threats, intimidation, or coercive control.",
                "No hidden tracking, covert surveillance, or unauthorized location monitoring.",
                "No false SOS, prank alerts, fake Visits, fake Manual Capture, or emergency hoaxes.",
                "No impersonation of users, contacts, guardians, responders, officials, or StayKnown staff.",
                "No pressure after someone declines, removes themselves, or blocks contact requests.",
                "No bypassing VPN checks, device checks, contact approval, plan gates, or safety restrictions.",
                "No using StayKnown to violate protective orders, no-contact rules, school rules, workplace rules, or family-court boundaries.",
                "No abusive chat, unsafe media, exploitative stickers, threats, scams, fraud, or payment abuse.",
              ].map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-black/24 px-4 py-3"
                >
                  <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-white/12 bg-white/[0.045] text-[11px] font-black text-white/70">
                    !
                  </span>
                  <span className="text-[13px] font-semibold leading-relaxed text-white/58">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <LinkCard
                href="/acceptable-use"
                title="Acceptable Use"
                body="Full platform rules for location, chat, media, payments, contacts, and safety behavior."
              />
              <LinkCard
                href="/safety"
                title="Safety & Anti-Stalking"
                body="Anti-stalking, anti-harassment, anti-coercion, and false emergency rules."
              />
              <LinkCard
                href="/abuse"
                title="Abuse Reporting"
                body="Report stalking, unwanted contact, impersonation, false SOS, threats, or unsafe behavior."
              />
            </div>
          </div>
        </section>

        <section className="pt-10">
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.032] p-5 shadow-sm md:p-6">
              <SectionTitle
                kicker="Emergency limitation"
                icon={<AlertIcon className="h-5 w-5" />}
              >
                StayKnown supports awareness — it is not official emergency
                dispatch
              </SectionTitle>

              <p className="mt-4 text-[13.5px] font-semibold leading-relaxed text-white/58">
                StayKnown is not police, ambulance, fire service, emergency
                dispatch, rescue service, hospital, road safety, civil defence,
                disaster management, government authority, or official emergency
                response. If immediate danger exists, contact local emergency
                services or proper local authority first.
              </p>

              <div className="mt-5 grid gap-3">
                <LinkCard
                  href="/emergency"
                  title="Emergency Disclaimer"
                  body="Read the important legal and safety limits before relying on SOS or location features."
                />
                <LinkCard
                  href="/location-safety"
                  title="Location & Live Safety"
                  body="Understand GPS limits, map delay, VPN restrictions, Visit sessions, and LIVE location behavior."
                />
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.032] p-5 shadow-sm md:p-6">
              <SectionTitle
                kicker="Privacy balance"
                icon={<LockIcon className="h-5 w-5" />}
              >
                Safety records must be useful without becoming careless
              </SectionTitle>

              <p className="mt-4 text-[13.5px] font-semibold leading-relaxed text-white/58">
                Location, contact, SOS, chat, media, payment, and security
                records can be sensitive. StayKnown’s safety posture is to use
                data for service operation, user protection, abuse prevention,
                support, legal compliance, and safety review — not covert
                surveillance.
              </p>

              <div className="mt-5 grid gap-3">
                <LinkCard
                  href="/privacy"
                  title="Privacy Policy"
                  body="How StayKnown handles account, location, contact, chat, media, payment, and request data."
                />
                <LinkCard
                  href="/retention"
                  title="Data Retention"
                  body="Why some safety records may be kept for legal, abuse, support, payment, or security reasons."
                />
              </div>
            </div>
          </div>
        </section>

        <section className="pt-10">
          <SectionTitle
            kicker="Children, teens, schools, and vulnerable users"
            icon={<ChildIcon className="h-5 w-5" />}
          >
            Extra care for people who need stronger protection
          </SectionTitle>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <PrincipleCard
              icon={<ChildIcon className="h-5 w-5" />}
              title="Minor safety matters"
              body="Underage users and teen safety flows require careful guardian involvement, lawful permission, and strong anti-exploitation rules."
              delay={0}
            />
            <PrincipleCard
              icon={<ShieldIcon className="h-5 w-5" />}
              title="No coercive monitoring"
              body="StayKnown must not be used to secretly control, pressure, exploit, groom, threaten, or monitor a child, teen, dependent, student, or vulnerable person."
              delay={80}
            />
            <PrincipleCard
              icon={<GlobeIcon className="h-5 w-5" />}
              title="Organizations need clear consent"
              body="Schools, workplaces, nonprofits, churches, families, and business users must use StayKnown with proper notice, role clarity, and lawful basis."
              delay={160}
            />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <LinkCard
              href="/minors"
              title="Child Safety & Minor Use"
              body="Dedicated guidance for children, teens, guardians, schools, family safety, and vulnerable users."
            />
            <LinkCard
              href="/contact-consent"
              title="Contact Approval & Consent"
              body="How approved contacts, SOS responders, blocked-add settings, decline states, and removal rights work."
            />
          </div>
        </section>

        <section className="pt-10">
          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.032] p-5 shadow-sm md:p-6">
            <SectionTitle
              kicker="Abuse response"
              icon={<ReportIcon className="h-5 w-5" />}
            >
              What can happen when StayKnown is misused
            </SectionTitle>

            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {[
                [
                  "Review",
                  "Reports and suspicious behavior may be reviewed for safety, fraud, harassment, or legal concern.",
                ],
                [
                  "Restriction",
                  "Features, contacts, alerts, chat, media, payments, or account access may be limited.",
                ],
                [
                  "Preservation",
                  "Relevant records may be preserved where needed for safety, abuse review, disputes, or law.",
                ],
                [
                  "Escalation",
                  "Where appropriate, StayKnown may cooperate with valid legal process or emergency requests.",
                ],
              ].map(([title, body]) => (
                <div
                  key={title}
                  className="rounded-[1.35rem] border border-white/10 bg-black/24 p-4"
                >
                  <div className="text-[13px] font-black text-white/92">
                    {title}
                  </div>
                  <p className="mt-2 text-[12.5px] font-semibold leading-relaxed text-white/52">
                    {body}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <LinkCard
                href="/abuse"
                title="Abuse Reporting"
                body="Report stalking, harassment, false SOS, unwanted contact, impersonation, fraud, or unsafe media."
              />
              <LinkCard
                href="/law"
                title="Law Enforcement Requests"
                body="Official request handling, emergency disclosure, legal preservation, and user notice rules."
              />
              <LinkCard
                href="/security"
                title="Security Disclosure"
                body="Responsible vulnerability reporting and platform integrity concerns."
              />
            </div>
          </div>
        </section>

        <section className="pt-10">
          <ActionPanel />
        </section>

        <section className="pt-10">
          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.032] p-5 shadow-sm md:p-6">
            <SectionTitle
              kicker="Trust library"
              icon={<ShieldIcon className="h-5 w-5" />}
            >
              Read the connected safety policies
            </SectionTitle>

            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <LinkCard
                href="/help-center"
                title="Help Center"
                body="Self-service answers for safety, SOS, live map, contacts, chat, billing, privacy, and account help."
              />
              <LinkCard
                href="/terms"
                title="Terms of Service"
                body="Main agreement for accounts, safety use, subscriptions, enforcement, and liability limits."
              />
              <LinkCard
                href="/privacy"
                title="Privacy Policy"
                body="How StayKnown processes account, location, contact, chat, media, payment, and legal-request data."
              />
              <LinkCard
                href="/location-safety"
                title="Location & Live Safety"
                body="Visit sessions, LIVE sharing, SOS, manual capture, chat maps, VPN gates, and accuracy limits."
              />
              <LinkCard
                href="/safety"
                title="Safety & Anti-Stalking"
                body="Anti-stalking, anti-harassment, consent, emergency misuse, and trusted-contact safety rules."
              />
              <LinkCard
                href="/billing-policy"
                title="Billing & Refunds"
                body="Subscriptions, Pro, Pro Max, wallet, coins, receipts, payment failure, cancellation, and refunds."
              />
            </div>
          </div>
        </section>

        <div className="mx-auto mt-12 h-px max-w-3xl bg-white/10" />

        <footer className="mx-auto mt-7 max-w-4xl text-center">
          <div className="mx-auto rounded-[1.6rem] border border-white/10 bg-black/35 px-5 py-6">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] font-black uppercase tracking-[0.12em] text-white/35">
              <a href="/help-center" className="transition hover:text-white">
                Help Center
              </a>
              <a href="/privacy" className="transition hover:text-white">
                Privacy
              </a>
              <a href="/terms" className="transition hover:text-white">
                Terms
              </a>
              <a href="/safety" className="transition hover:text-white">
                Safety
              </a>
              <a href="/acceptable-use" className="transition hover:text-white">
                Acceptable Use
              </a>
              <a href="/billing-policy" className="transition hover:text-white">
                Billing Policy
              </a>
            </div>

            <div className="mt-5 flex items-center justify-center gap-3">
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
              This Trust & Safety Center is provided for product transparency
              and does not replace official emergency services, legal advice,
              medical advice, police, ambulance, fire service, rescue service,
              or government authority.
            </p>
          </div>
        </footer>
      </section>
    </main>
  );
}
