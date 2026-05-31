"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo } from "react";

const UPDATED_AT = "2026-05-31";
const VERSION = "1.0";

function fmtDate(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
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
      "StayKnown Verification Policy | Verified Individual, Organization Badge, Badge Removal & Misuse Rules";

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
      "Read the StayKnown Verification Policy covering verified individual badges, verified organization badges, review ticks, badge misuse, identity rules, removal, appeals, abuse reporting, and safety limits.",
    );
    upsertMeta(
      "keywords",
      "StayKnown verification policy, verified individual badge, verified organization badge, safety app verification, identity verification, badge removal, verification misuse, impersonation policy, trust badge policy, verified account rules",
    );
    upsertMeta("robots", "index, follow");
    upsertMeta("author", "6 Clement Joshua");

    upsertProperty(
      "og:title",
      "StayKnown Verification Policy | Verified Badge Rules",
    );
    upsertProperty(
      "og:description",
      "Verified Individual, Verified Organization, review tick, badge misuse, removal, appeals, and safety trust rules for StayKnown.",
    );
    upsertProperty("og:type", "website");
    upsertProperty("og:site_name", "StayKnown");
  }, []);
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
        d="m6.7 12.35 3.35 3.35 7.25-7.6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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

function PersonIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 11.2a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M5.2 20.2c.8-4.25 3.25-6.35 6.8-6.35s6 2.1 6.8 6.35"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BuildingIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M5.5 20V5.2h13V20"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M8.4 8.4h1.6M14 8.4h1.6M8.4 11.7h1.6M14 11.7h1.6M8.4 15h1.6M14 15h1.6M4 20h16"
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

function VerifiedBadge({ variant = "black" }: { variant?: "black" | "grey" }) {
  return (
    <span
      className={[
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border",
        variant === "black"
          ? "border-white/16 bg-white text-black shadow-[0_20px_70px_rgba(255,255,255,0.16)]"
          : "border-white/16 bg-white/18 text-white/72 shadow-[0_20px_70px_rgba(255,255,255,0.08)]",
      ].join(" ")}
      aria-hidden="true"
    >
      <CheckIcon className="h-5 w-5" />
    </span>
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
    <Link
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
    </Link>
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

function VerificationIllustration() {
  return (
    <div className="relative mx-auto h-[280px] w-[190px] md:h-[320px] md:w-[220px]">
      <div className="absolute inset-0 animate-[softPulse_4s_ease-in-out_infinite] rounded-[2.2rem] bg-white/[0.045] blur-2xl" />

      <div className="relative h-full w-full rounded-[2rem] border border-white/15 bg-white/[0.055] p-3 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-white/20" />

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-3">
            <VerifiedBadge />

            <div>
              <div className="text-[11px] font-black tracking-[0.18em] text-white/35">
                VERIFIED
              </div>
              <div className="text-[13px] font-black text-white">
                Identity Trust
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {[
              ["Individual", "Real-person review"],
              ["Organization", "Entity-style review"],
              ["Review tick", "Pending or limited signal"],
              ["Removal", "Misuse can remove badge"],
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
            Trust marker
          </div>
          <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.9)]" />
        </div>
      </div>
    </div>
  );
}

export default function VerificationPolicyPage() {
  useSeoMeta();

  const nav = useMemo(
    () =>
      [
        ["summary", "Summary"],
        ["meaning", "Meaning"],
        ["badge-types", "Badge types"],
        ["eligibility", "Eligibility"],
        ["review", "Review process"],
        ["where", "Where shown"],
        ["limits", "Limits"],
        ["maintenance", "Maintain badge"],
        ["removal", "Removal"],
        ["abuse", "Abuse effects"],
        ["organizations", "Organizations"],
        ["minors", "Minors"],
        ["data", "Verification data"],
        ["reports", "Report misuse"],
        ["appeals", "Appeals"],
        ["legal", "Legal"],
        ["contact", "Contact"],
      ] as const,
    [],
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "StayKnown Verification Policy",
    dateModified: UPDATED_AT,
    version: VERSION,
    publisher: {
      "@type": "Organization",
      name: "StayKnown",
      brand: "A 6 Clement Joshua service™",
      url: "https://stay-known.com",
    },
    description:
      "Verification policy for StayKnown covering verified individual badges, verified organization badges, grey review ticks, badge use, badge removal, misuse, reporting, appeals, and legal limits.",
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
                    <Pill>Verification Policy</Pill>
                    <Pill>Identity Trust</Pill>
                    <Pill>Badge Rules</Pill>
                  </div>

                  <h1 className="mt-5 max-w-3xl text-[30px] font-black tracking-[-0.045em] text-white md:text-[46px] md:leading-[1.02]">
                    StayKnown Verification Policy for verified identity,
                    organization trust, and badge misuse prevention.
                  </h1>

                  <p className="mt-5 max-w-3xl text-[14.5px] font-semibold leading-relaxed text-white/62 md:text-[15px]">
                    This policy explains how StayKnown verification works, what
                    verified badges mean, what they do not mean, where badges
                    may appear, how users and organizations must maintain them,
                    what can cause removal, and how badge misuse can be reported
                    or enforced.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <SoftBadge>Version {VERSION}</SoftBadge>
                    <SoftBadge>Updated: {fmtDate(UPDATED_AT)}</SoftBadge>
                  </div>
                </div>

                <VerificationIllustration />
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
              <aside className="border-b border-white/10 bg-black/35 p-5 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:p-6">
                <div className="text-[12px] font-black uppercase tracking-[0.2em] text-white/35">
                  On this page
                </div>

                <nav
                  aria-label="Verification Policy sections"
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
                    <CheckIcon className="h-4 w-4" />
                    Core rule
                  </div>
                  <p className="mt-2 text-[12px] font-semibold leading-relaxed text-white/50">
                    A verified badge helps recognition. It is not a guarantee of
                    safety, legal authority, endorsement, or permission to
                    bypass consent.
                  </p>
                </div>
              </aside>

              <div className="p-5 md:p-8">
                <div className="space-y-8">
                  <section id="summary" className="scroll-mt-24 space-y-4">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      1) Summary
                    </H2>
                    <P>
                      StayKnown verification is a trust and recognition feature
                      inside a safety-first product. It helps users recognize
                      verified individuals and verified organizations, but it
                      does not remove the need for consent, safety judgment,
                      lawful use, contact approval, emergency caution, and abuse
                      reporting.
                    </P>

                    <div className="grid gap-3 md:grid-cols-3">
                      <Callout
                        title="Recognition, not blind trust"
                        body="Verification helps identify an account, but users and contacts should still use judgment."
                        icon={<CheckIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="No authority shortcut"
                        body="A badge does not automatically prove government, medical, law enforcement, school, security, or emergency authority."
                        icon={<AlertIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="Misuse can remove it"
                        body="Impersonation, false claims, harassment, fraud, coercion, unsafe safety flows, or identity changes can lead to removal."
                        icon={<ReportIcon className="h-5 w-5" />}
                      />
                    </div>
                  </section>

                  <section id="meaning" className="scroll-mt-24 space-y-3">
                    <H2 icon={<CheckIcon className="h-4 w-4" />}>
                      2) What StayKnown verification means
                    </H2>
                    <P>
                      A verified badge means StayKnown has reviewed certain
                      account identity, organization, or trust information
                      enough to display a verification marker inside the
                      product. The review may consider profile information,
                      account history, organization evidence, contact
                      information, public signals, documentation, and safety
                      risk.
                    </P>
                    <UL
                      items={[
                        "Verification helps users recognize an account in StayKnown surfaces.",
                        "Verification may be active, pending, limited, paused, removed, or under review.",
                        "Verification may apply to individuals or organizations depending on the approved badge type.",
                        "Verification is not a promise that every future action, message, alert, emergency claim, or request from the account is safe.",
                        "StayKnown may update, pause, or remove verification when risk, abuse, identity change, or inaccurate information appears.",
                      ]}
                    />
                  </section>

                  <section id="badge-types" className="scroll-mt-24 space-y-3">
                    <H2 icon={<PersonIcon className="h-4 w-4" />}>
                      3) Badge types and badge states
                    </H2>

                    <H3>Verified Individual</H3>
                    <P>
                      A Verified Individual badge is for a real-person account
                      that has passed StayKnown’s individual verification
                      review. It may appear beside a person’s name or profile
                      identity where the app supports verification display.
                    </P>
                    <UL
                      items={[
                        "Used for a person, not a business, office, school, charity, government agency, or group.",
                        "May require identity, profile, email, phone, account, safety, or public-presence review.",
                        "Must not be used to impersonate another person or imply authority the person does not have.",
                        "Can be removed if the account changes identity, misleads people, or violates StayKnown rules.",
                      ]}
                    />

                    <H3>Verified Organization</H3>
                    <P>
                      A Verified Organization badge is for an organization,
                      company, office, nonprofit, school, support body, safety
                      group, or entity-style account that passes StayKnown’s
                      organization review.
                    </P>
                    <UL
                      items={[
                        "Used for organization-style accounts, not personal identity accounts.",
                        "May require evidence of organization name, domain, public identity, operating presence, authorized contact, or role.",
                        "Does not automatically mean the organization has government, medical, law enforcement, school, security, nonprofit, charity, emergency, or regulatory authority.",
                        "May be removed if ownership, identity, purpose, public representation, or authority claims become misleading.",
                      ]}
                    />

                    <H3>Grey / pending / review-style tick</H3>
                    <P>
                      If StayKnown displays a grey or softer review tick, it
                      must not be treated as full verification. A grey tick may
                      indicate pending review, limited review, incomplete
                      review, temporary review, or a status that needs
                      explanation.
                    </P>
                    <UL
                      items={[
                        "Grey does not equal fully verified.",
                        "Users must not present a grey tick as proof of active verification approval.",
                        "StayKnown may remove or change grey review indicators at any time.",
                        "Full verified status should be shown only when the account has active verification approval.",
                      ]}
                    />
                  </section>

                  <section id="eligibility" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      4) Eligibility for verification
                    </H2>
                    <P>
                      Verification is discretionary. StayKnown may approve,
                      reject, pause, limit, or remove verification based on
                      account evidence, safety risk, abuse history, identity
                      clarity, region, policy compliance, legal risk, and
                      operational capacity.
                    </P>
                    <UL
                      items={[
                        "The account should represent a real individual or legitimate organization.",
                        "The account name, profile information, contact details, and public-facing identity should be accurate and consistent.",
                        "The account should not be created for impersonation, scams, fake authority, harassment, stalking, false emergencies, or manipulation.",
                        "The account should not use misleading names, logos, profile photos, organization labels, or public claims.",
                        "The account should not be restricted, banned, repeatedly reported, or under unresolved safety review.",
                        "StayKnown may require additional review for organizations, high-risk names, public-facing accounts, minors, guardians, schools, nonprofits, safety bodies, or authority-like accounts.",
                      ]}
                    />
                  </section>

                  <section id="review" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ReportIcon className="h-4 w-4" />}>
                      5) Verification review process
                    </H2>
                    <P>
                      StayKnown may request or review information to determine
                      whether an account should receive or keep a badge. The
                      process may vary depending on account type, region, risk,
                      evidence, and available review tools.
                    </P>
                    <UL
                      items={[
                        "StayKnown may review account profile details, name, username, email, phone, organization information, and public identity signals.",
                        "StayKnown may ask for proof of identity, proof of organization, proof of authority to represent an organization, or additional clarification.",
                        "StayKnown may compare submitted information with app activity, public sources, support history, safety reports, and fraud signals.",
                        "StayKnown may reject verification if information is incomplete, inconsistent, unverifiable, unsafe, misleading, or high-risk.",
                        "StayKnown may approve verification for one account type but not another.",
                        "StayKnown is not required to disclose every review signal, anti-abuse method, or internal risk rule.",
                      ]}
                    />
                  </section>

                  <section id="where" className="scroll-mt-24 space-y-3">
                    <H2 icon={<CheckIcon className="h-4 w-4" />}>
                      6) Where verification may appear
                    </H2>
                    <P>
                      Verification badges may appear beside names, profile
                      details, or identity surfaces where recognition can reduce
                      confusion and improve trust context. Display may vary by
                      app version, platform, feature, plan, region, and safety
                      state.
                    </P>
                    <UL
                      items={[
                        "Profile surfaces and public-facing identity areas.",
                        "Stories, story viewers, story likers, and profile trust surfaces.",
                        "Chat headers, chat lists, message identity context, and approved-contact chat surfaces.",
                        "Contact approval flows, contact requests, emergency contact context, and responder context where linked to a real StayKnown user account.",
                        "Visit alerts, LIVE updates, location safety notifications, and safety timeline events.",
                        "SOS alerts, SOS stopped notices, VPN/location interruption notices, and responder context.",
                        "Daily I’M SAFE emails, missed I’M SAFE alerts, push notification metadata, in-app notifications, and safety emails.",
                        "Website Learn pages, support references, or policy explanations where relevant.",
                      ]}
                    />
                    <P>
                      Manually typed responder names, manually entered contacts,
                      or external offices should not receive a verified badge
                      merely because the name matches a verified user. A badge
                      should appear only when the record is clearly linked to a
                      real StayKnown user or approved verified account.
                    </P>
                  </section>

                  <section id="limits" className="scroll-mt-24 space-y-3">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      7) What verification does not mean
                    </H2>
                    <P>
                      Verification has limits. Users and contacts must not treat
                      a badge as a guarantee, emergency certification, official
                      endorsement, or permission to ignore safety signals.
                    </P>
                    <UL
                      items={[
                        "Verification does not mean StayKnown guarantees the person or organization is safe.",
                        "Verification does not mean StayKnown endorses every action, message, request, alert, SOS, Visit, story, or claim from the account.",
                        "Verification does not confirm professional licensing unless StayKnown separately states that a specific credential was reviewed.",
                        "Verification does not automatically confirm government, police, medical, school, NGO, charity, security, rescue, or emergency authority.",
                        "Verification does not let users bypass contact approval, blocked-add settings, privacy settings, child-safety rules, or consent requirements.",
                        "Verification does not permit hidden tracking, stalking, harassment, coercion, false emergencies, fraud, or unlawful monitoring.",
                        "Verification does not replace official emergency services, legal advice, medical advice, identity documents, workplace checks, school checks, or background checks.",
                      ]}
                    />
                  </section>

                  <section id="maintenance" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      8) How to keep verification active
                    </H2>
                    <P>
                      Verified users and organizations must maintain accurate
                      identity information and safe behavior. Verification can
                      be reviewed at any time, especially after account changes,
                      reports, abuse signals, ownership changes, or public
                      identity disputes.
                    </P>
                    <UL
                      items={[
                        "Keep your real name, organization name, profile details, username, email, phone, and public identity signals accurate.",
                        "Do not change the verified account into a different person, business, office, organization, or purpose after approval.",
                        "Do not sell, rent, transfer, share, or hand over control of a verified account.",
                        "Keep profile photos, organization marks, websites, public descriptions, and contact details consistent with the approved verification.",
                        "Respond to reasonable StayKnown re-checks, identity clarification requests, or safety review requests.",
                        "Follow the Terms of Service, Privacy Policy, Safety & Anti-Stalking Policy, Contact Consent rules, Acceptable Use rules, Minor Use rules, and this Verification Policy.",
                        "Avoid using verification to pressure contacts, manipulate emergencies, demand trust, request money, collect private information, or imply authority you do not have.",
                        "Secure the verified account with strong access controls and report suspected takeover quickly.",
                      ]}
                    />
                  </section>

                  <section id="removal" className="scroll-mt-24 space-y-3">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      9) What can cause badge removal, pause, or review
                    </H2>
                    <P>
                      StayKnown may remove, pause, restrict, downgrade, or
                      review a badge when the verification becomes inaccurate,
                      unsafe, misleading, disputed, unverifiable, or abusive.
                    </P>
                    <UL
                      items={[
                        "The account impersonates another person, organization, office, school, nonprofit, emergency body, or authority.",
                        "The account changes identity after verification approval.",
                        "The badge is used to mislead users, contacts, donors, clients, responders, guardians, minors, or the public.",
                        "The account claims government, law enforcement, medical, emergency, school, company, security, charity, or nonprofit authority without adequate proof.",
                        "The account uses StayKnown for stalking, harassment, coercion, false emergencies, fake SOS alerts, fraud, scams, unsafe contact pressure, unlawful monitoring, or abuse.",
                        "Verification information becomes outdated, false, incomplete, unverifiable, or disputed.",
                        "The account is sold, transferred, rented, shared, hacked, or controlled by someone other than the verified owner or authorized organization representative.",
                        "The account violates safety rules, child-safety rules, privacy rules, acceptable-use rules, payment rules, app-store rules, or applicable law.",
                        "StayKnown receives credible reports, legal concerns, identity disputes, safety signals, or abuse indicators requiring review.",
                      ]}
                    />
                  </section>

                  <section id="abuse" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ReportIcon className="h-4 w-4" />}>
                      10) Effects of verification abuse
                    </H2>
                    <P>
                      Abuse of verification is serious because StayKnown is a
                      safety product. Misusing a badge can harm users, contacts,
                      minors, responders, organizations, and emergency trust.
                    </P>
                    <UL
                      items={[
                        "Badge removal or badge pause.",
                        "Loss of verified visibility in chat, stories, profile, contacts, Visit, SOS, emails, and notifications.",
                        "Contact restrictions, responder restrictions, blocked-add restrictions, or contact approval review.",
                        "Chat, story, profile, media, SOS, Visit, manual capture, or I’M SAFE feature restrictions.",
                        "Account review, temporary suspension, permanent ban, or device/network/payment restrictions.",
                        "Removal or restriction of misleading profile content, stories, media, organization labels, or badge claims.",
                        "Preservation of records where appropriate for investigation, legal process, emergency review, fraud review, or abuse enforcement.",
                        "Cooperation with valid legal requests or emergency disclosure review where required or permitted by law.",
                      ]}
                    />
                  </section>

                  <section
                    id="organizations"
                    className="scroll-mt-24 space-y-3"
                  >
                    <H2 icon={<BuildingIcon className="h-4 w-4" />}>
                      11) Organization-specific rules
                    </H2>
                    <P>
                      Verified organizations carry additional risk because users
                      may interpret organization identity as authority. Verified
                      organizations must present their role clearly and must not
                      overstate power, licensing, emergency status, nonprofit
                      status, school authority, or government connection.
                    </P>
                    <UL
                      items={[
                        "Use the organization badge only for the approved organization identity.",
                        "Do not rename the account into a different organization after approval without review.",
                        "Do not claim legal authority, government authority, law enforcement authority, medical authority, school authority, security authority, emergency response authority, charity status, or nonprofit status without proof.",
                        "Do not use organization verification to pressure users into sharing location, joining contacts, accepting responder roles, sending money, or disclosing private information.",
                        "Do not imply StayKnown partnership, endorsement, certification, employment, official approval, or agency status unless StayKnown has expressly authorized that claim in writing.",
                        "Keep organization contact routes, public profile, website, representative authority, and account control accurate.",
                        "Immediately report unauthorized control, employee misuse, account takeover, domain loss, organization closure, ownership change, or identity dispute.",
                      ]}
                    />
                  </section>

                  <section id="minors" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      12) Minors, guardians, schools, and vulnerable users
                    </H2>
                    <P>
                      Verification must not be used to exploit or pressure
                      minors, guardians, students, dependents, employees, or
                      vulnerable users. Accounts involving minors, schools,
                      youth programs, guardians, or vulnerable users may receive
                      heightened review.
                    </P>
                    <UL
                      items={[
                        "Verification does not let an adult bypass minor-safety rules, guardian consent requirements, or child-protection safeguards.",
                        "A verified adult, organization, school, nonprofit, or youth program must not use verification to pressure minors or guardians into unsafe contact, location sharing, chat, or SOS roles.",
                        "A verified organization working with minors should use clear notice, appropriate consent, role clarity, and lawful data practices.",
                        "StayKnown may restrict, remove, or review verification for reports involving minors, grooming, exploitation, coercion, impersonation, stalking, or child-safety concerns.",
                        "Under-13 account creation remains prohibited under StayKnown’s minor-use posture.",
                        "Where parental or guardian consent is required, verification does not replace that consent.",
                      ]}
                    />
                    <LinkCard
                      href="/minors"
                      title="Child Safety & Minor Use"
                      body="Dedicated child, teen, guardian, school, and vulnerable-user safety policy."
                    />
                  </section>

                  <section id="data" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      13) Verification data, retention, and privacy
                    </H2>
                    <P>
                      Verification may require collecting or reviewing data
                      connected to account identity, contact information,
                      organization identity, public representation, and safety
                      risk. StayKnown should handle verification information
                      according to its Privacy Policy, Data Retention Policy,
                      legal obligations, and safety needs.
                    </P>
                    <UL
                      items={[
                        "Verification data may include profile information, names, usernames, emails, phone numbers, organization information, public links, documentation, support history, and review notes.",
                        "StayKnown may keep verification records for safety, fraud prevention, abuse investigation, audit, legal, operational, or enforcement reasons.",
                        "StayKnown may limit access to verification records to authorized review, support, safety, legal, or security personnel.",
                        "StayKnown may preserve verification-related records when badge misuse, impersonation, fraud, safety risk, legal process, account takeover, or dispute is suspected.",
                        "Users may request privacy rights through the appropriate StayKnown privacy route, subject to legal, safety, fraud-prevention, and record-preservation limits.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/privacy"
                        title="Privacy Policy"
                        body="How StayKnown handles account, safety, contact, location, chat, verification, and legal request data."
                      />
                      <LinkCard
                        href="/retention"
                        title="Data Retention"
                        body="How records may be kept for safety, fraud prevention, legal, and operational needs."
                      />
                    </div>
                  </section>

                  <section id="reports" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ReportIcon className="h-4 w-4" />}>
                      14) Reporting badge misuse
                    </H2>
                    <P>
                      Users, contacts, organizations, guardians, responders, and
                      recipients should report badge misuse when verification
                      appears misleading, unsafe, false, or abusive.
                    </P>
                    <UL
                      items={[
                        "Someone pretends to be verified or displays a fake verification claim.",
                        "Someone uses a verified badge to pressure, threaten, manipulate, shame, or deceive.",
                        "A verified organization claims authority it does not have.",
                        "A verified user uses StayKnown for stalking, harassment, coercion, false emergencies, fake SOS, fraud, or unsafe contact behavior.",
                        "A badge appears beside the wrong name, person, organization, responder, or manually typed contact.",
                        "A verified account appears hacked, sold, transferred, rented, shared, or controlled by someone else.",
                        "A verified user or organization asks for money, credentials, private data, location, or emergency trust in a suspicious way.",
                      ]}
                    />
                    <P>
                      Reports should include usernames, emails, names, profile
                      links, screenshots, dates, times, alert examples, contact
                      requests, chat messages, story references, SOS/Visit
                      context, or any detail that helps review the issue safely.
                    </P>
                    <LinkCard
                      href="/abuse"
                      title="Abuse Reporting"
                      body="Report impersonation, badge misuse, harassment, unsafe contact behavior, false emergencies, or verification abuse."
                    />
                  </section>

                  <section id="appeals" className="scroll-mt-24 space-y-3">
                    <H2 icon={<CheckIcon className="h-4 w-4" />}>
                      15) Appeals and re-review
                    </H2>
                    <P>
                      If verification is rejected, paused, removed, or limited,
                      the user or organization may request review where
                      available. StayKnown may require additional information
                      before restoring or approving verification.
                    </P>
                    <UL
                      items={[
                        "A review request should explain why the verification decision may be wrong.",
                        "The requester should provide accurate identity, organization, ownership, role, or authority information where needed.",
                        "StayKnown may deny review where risk remains, information is insufficient, the account is unsafe, or the account violates policy.",
                        "StayKnown may restore verification, keep it removed, downgrade a badge, change badge type, request corrections, or keep the account under review.",
                        "Repeated abusive, false, or manipulative appeal attempts may lead to further restrictions.",
                      ]}
                    />
                  </section>

                  <section id="legal" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      16) Legal cooperation, emergencies, and safety review
                    </H2>
                    <P>
                      Verification records and badge misuse reports may be
                      relevant to safety, fraud, impersonation, emergency,
                      child-safety, or legal matters. StayKnown may preserve,
                      review, or disclose information when required or permitted
                      by law and consistent with its legal and safety policies.
                    </P>
                    <UL
                      items={[
                        "StayKnown may preserve verification records where badge misuse, impersonation, fraud, abuse, emergency risk, or legal concern is suspected.",
                        "StayKnown may cooperate with valid legal process.",
                        "StayKnown may review emergency disclosure requests where there is credible risk of serious harm.",
                        "StayKnown may reject, narrow, or challenge legal or emergency requests that are overbroad, unclear, unlawful, unsafe, or connected to misuse.",
                        "StayKnown does not support covert surveillance, unlawful monitoring, fake authority, or abusive verification claims.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/law"
                        title="Law Enforcement & Emergency Requests"
                        body="Official request handling, emergency disclosure, preservation, and legal process."
                      />
                      <LinkCard
                        href="/emergency"
                        title="Emergency Disclaimer"
                        body="StayKnown is not a replacement for official emergency services."
                      />
                    </div>
                  </section>

                  <section id="contact" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ReportIcon className="h-4 w-4" />}>
                      17) Contact and related policies
                    </H2>
                    <P>
                      For verification questions, badge misuse, impersonation,
                      organization disputes, safety issues, privacy concerns, or
                      legal concerns, use the appropriate StayKnown route.
                    </P>
                    <UL
                      items={[
                        "Support: support@stay-known.com",
                        "Use the subject line: StayKnown Verification Report.",
                        "Report immediate danger to official emergency services first.",
                        "Use Abuse Reporting for badge misuse, impersonation, harassment, false emergencies, unsafe contact behavior, or coercive use.",
                        "Use Law Enforcement & Emergency Requests for valid official requests, preservation, or urgent legal concerns.",
                      ]}
                    />

                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/learn/verification"
                        title="Learn: StayKnown Verification"
                        body="Plain-language guide for verified badges, grey ticks, where badges appear, and how misuse affects accounts."
                      />
                      <LinkCard
                        href="/safety"
                        title="Safety & Anti-Stalking"
                        body="Consent, anti-stalking, lawful safety use, SOS, location, chat, minors, reporting, and enforcement."
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
                        href="/privacy"
                        title="Privacy Policy"
                        body="How StayKnown processes account, verification, location, contact, chat, media, payment, retention, and legal request data."
                      />
                      <LinkCard
                        href="/abuse"
                        title="Abuse Reporting"
                        body="Report impersonation, badge misuse, unwanted contact, harassment, false emergencies, and unsafe behavior."
                      />
                    </div>
                  </section>

                  <section className="space-y-3 rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5">
                    <H2>18) Changes to this Verification Policy</H2>
                    <P>
                      StayKnown may update this policy to reflect verification
                      workflow changes, badge display changes, account safety
                      rules, legal requirements, organization review practices,
                      abuse-reporting improvements, app-store requirements, or
                      operational needs. If updates are material, StayKnown may
                      provide notice through the app, website, email, or another
                      reasonable method.
                    </P>
                  </section>

                  <section className="space-y-3 rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5">
                    <H2>Appendix A — In-app short verification notice</H2>
                    <P>
                      StayKnown verification helps people recognize verified
                      individuals and organizations. A badge is a trust marker,
                      not a guarantee of safety, official authority, emergency
                      approval, professional licensing, or StayKnown
                      endorsement. Verified users must follow all consent,
                      safety, contact, chat, Visit, SOS, anti-stalking, and
                      acceptable-use rules. Misuse, impersonation, false
                      authority claims, unsafe contact behavior, fake
                      emergencies, fraud, or identity changes can lead to badge
                      removal, restrictions, suspension, or reporting where
                      appropriate.
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
                      app-store submission, verification launch, or law
                      enforcement request handling.
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
