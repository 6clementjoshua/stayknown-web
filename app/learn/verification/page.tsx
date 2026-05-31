"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type BadgeView = "Individual" | "Organization" | "Review";

const seo = {
  title:
    "StayKnown Verification | Verified Individual, Organization Badge, Review Tick, Safety Trust Rules",
  description:
    "Learn how StayKnown verification works, what the black verified badge means, what grey or review ticks mean, where badges appear, how to keep verification active, what causes badge removal, and how to report misuse.",
  url: "https://stay-known.com/learn/verification",
  image: "https://stay-known.com/hero/verification.png",
};

function MobileNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="
        relative inline-flex items-center gap-2 px-0 py-2
        text-[11.5px] font-semibold tracking-[-0.01em]
        text-white/68 transition hover:text-white/90 active:text-white select-none
      "
    >
      <span>{label}</span>
      <span className="opacity-60">›</span>
      <span className="pointer-events-none absolute inset-0 opacity-0 active:opacity-100 transition duration-75 bg-white/[0.06]" />
    </Link>
  );
}

function CTA({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="
        group relative hidden sm:inline-flex items-center justify-center
        h-8 md:h-[34px] px-3.5 md:px-4 rounded-full
        border border-white/14 bg-white/[0.055] text-white
        font-semibold text-[11.5px] md:text-[12px] tracking-[-0.01em]
        shadow-[0_16px_42px_rgba(0,0,0,0.55)]
        transition-all duration-200
        hover:bg-white hover:border-white/30 hover:text-black hover:[&_*]:text-black
        active:bg-black active:border-white/20 active:text-white active:[&_*]:text-white active:scale-[0.99]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30
        select-none overflow-hidden
      "
    >
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.14),transparent)] -translate-x-[120%] group-hover:translate-x-[120%] transition duration-700" />
      <span className="relative">{label}</span>
      <span className="relative ml-2 opacity-70">→</span>
    </Link>
  );
}

function MonoIcon({ glyph }: { glyph: string }) {
  return (
    <div
      className="
        shrink-0 w-9 h-9 rounded-xl
        border border-white/12 bg-white/[0.045]
        backdrop-blur-md flex items-center justify-center
        text-white/90 text-[14px] leading-none
        shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_35px_rgba(0,0,0,0.35)]
      "
      aria-hidden
    >
      {glyph}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10.5px] font-black tracking-[0.26em] text-white/35 uppercase">
      {children}
    </div>
  );
}

function PremiumPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-[28px]",
        "border border-white/[0.09]",
        "bg-white/[0.035]",
        "shadow-[0_28px_100px_rgba(0,0,0,0.62)]",
        "backdrop-blur-xl",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(255,255,255,0.12),transparent_52%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/15" />
      <div className="relative">{children}</div>
    </div>
  );
}

function VerifiedBadge({
  tone = "black",
  size = "md",
}: {
  tone?: "black" | "grey";
  size?: "sm" | "md" | "lg";
}) {
  const dimensions =
    size === "lg" ? "h-16 w-16" : size === "sm" ? "h-7 w-7" : "h-10 w-10";

  const checkSize =
    size === "lg" ? "h-8 w-8" : size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";

  return (
    <span
      className={[
        "inline-flex shrink-0 items-center justify-center rounded-full border",
        dimensions,
        tone === "black"
          ? "border-white/16 bg-white text-black shadow-[0_20px_70px_rgba(255,255,255,0.16)]"
          : "border-white/16 bg-white/18 text-white/72 shadow-[0_20px_70px_rgba(255,255,255,0.08)]",
      ].join(" ")}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" className={checkSize}>
        <path
          d="m6.8 12.4 3.2 3.25 7.2-7.6"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function BadgeTabs({
  view,
  setView,
}: {
  view: BadgeView;
  setView: (v: BadgeView) => void;
}) {
  const items: BadgeView[] = ["Individual", "Organization", "Review"];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = item === view;

        return (
          <button
            key={item}
            type="button"
            onClick={() => setView(item)}
            className={[
              "relative inline-flex items-center justify-center select-none overflow-hidden",
              "rounded-full border transition-all duration-200",
              "px-3.5 h-[34px] text-[12px]",
              active
                ? "border-white/28 bg-white/[0.11] text-white shadow-[0_12px_34px_rgba(255,255,255,0.04)]"
                : "border-white/14 bg-white/[0.045] text-white/76 hover:bg-white hover:border-white/30 hover:text-black hover:[&_*]:text-black",
            ].join(" ")}
          >
            <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_58%)]" />
            <span className="relative font-semibold tracking-[-0.01em]">
              {item}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function FeatureCard({
  glyph,
  title,
  children,
}: {
  glyph: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        group relative overflow-hidden rounded-[24px]
        border border-white/10 bg-white/[0.035]
        shadow-[0_24px_78px_rgba(0,0,0,0.58)]
        p-5 sm:p-6 transition-all duration-300
        hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.05]
      "
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.12),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" />

      <div className="relative flex items-start gap-3">
        <MonoIcon glyph={glyph} />

        <div className="min-w-0">
          <div className="text-white/95 font-black tracking-[-0.025em] text-[14px] sm:text-[15px]">
            {title}
          </div>
          <div className="mt-2 text-white/61 font-medium leading-relaxed text-[12.6px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function TintedCallout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative mt-5 overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.025] p-4 sm:p-5 shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
      <div className="pointer-events-none absolute inset-0 rounded-[22px] bg-[radial-gradient(circle_at_18%_14%,rgba(255,255,255,0.09),transparent_60%)]" />
      <div className="relative">
        <div className="text-white/86 font-black tracking-[-0.02em] text-[12.8px] sm:text-[13.5px]">
          {title}
        </div>
        <div className="mt-2 text-white/60 text-[12.4px] leading-relaxed font-medium">
          {children}
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <div className="text-[10px] font-black tracking-[0.18em] text-white/34 uppercase">
        {label}
      </div>
      <div className="mt-2 text-[18px] font-black tracking-[-0.04em] text-white">
        {value}
      </div>
      <div className="mt-1 text-[11.5px] font-medium leading-5 text-white/48">
        {detail}
      </div>
    </div>
  );
}

function StepCard({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-black/25 p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(255,255,255,0.08),transparent_58%)]" />
      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.055] text-[11px] font-black text-white/70">
            {n}
          </div>
          <div className="text-[13.2px] font-black tracking-[-0.025em] text-white/88">
            {title}
          </div>
        </div>
        <p className="mt-3 text-[12.3px] leading-relaxed font-medium text-white/52">
          {body}
        </p>
      </div>
    </div>
  );
}

function RuleCard({
  title,
  label,
  body,
}: {
  title: string;
  label: string;
  body: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-black/25 p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.08),transparent_58%)]" />
      <div className="relative">
        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
          {label}
        </div>
        <div className="mt-2 text-[15px] font-black tracking-[-0.035em] text-white/90">
          {title}
        </div>
        <p className="mt-2 text-[12.4px] leading-relaxed font-medium text-white/55">
          {body}
        </p>
      </div>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-2.5">
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="flex gap-2.5 text-white/62 font-medium text-[12.6px] leading-relaxed"
        >
          <span className="mt-[2px] text-white/42">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function BadgeMeaningPanel({ view }: { view: BadgeView }) {
  const copy = {
    Individual: {
      label: "Verified Individual",
      title: "A real-person trust marker",
      tone: "black" as const,
      body: "The verified individual badge means StayKnown has reviewed enough account identity or trust information to display a verification marker beside that person’s account. It is designed to help users recognize the account across profile, chat, stories, contacts, Visit, SOS, safety alerts, and emails.",
      bullets: [
        "Used for a person, not a company or public office.",
        "Appears only when the account has active approved verification.",
        "Can be removed if the account changes identity, misleads people, or violates safety rules.",
        "Does not mean StayKnown guarantees the person is safe or truthful in every interaction.",
      ],
    },
    Organization: {
      label: "Verified Organization",
      title: "A trusted organization identity marker",
      tone: "black" as const,
      body: "The verified organization badge is for an organization, office, nonprofit, school, company, support body, safety group, or other entity-style account that passes StayKnown’s organization review. It helps people understand when a profile is presenting itself as an organization rather than a personal account.",
      bullets: [
        "Used for organizations, not personal identity accounts.",
        "May require proof of name, operating presence, contact channels, role, website, documentation, or public identity signals.",
        "Must not be used to falsely claim government, medical, police, school, emergency, security, or nonprofit authority.",
        "May be removed if the organization changes ownership, purpose, identity, or public representation.",
      ],
    },
    Review: {
      label: "Grey / Review Tick",
      title: "A pending or limited review signal",
      tone: "grey" as const,
      body: "A grey or softer review tick should not be treated as full verification. If StayKnown uses this state, it means the account, name, organization, or trust signal may be pending, under review, limited, or displayed for explanation while verification is not fully active.",
      bullets: [
        "Grey does not equal fully verified.",
        "It may show pending, review, limited, or incomplete verification status.",
        "Users should not present a grey tick as proof of full identity approval.",
        "Full verified status should use the approved active black verified badge only.",
      ],
    },
  } satisfies Record<
    BadgeView,
    {
      label: string;
      title: string;
      tone: "black" | "grey";
      body: string;
      bullets: string[];
    }
  >;

  const item = copy[view];

  return (
    <PremiumPanel>
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <VerifiedBadge tone={item.tone} size="lg" />

          <div className="min-w-0">
            <SectionLabel>{item.label}</SectionLabel>
            <div className="mt-2 text-[21px] sm:text-[28px] font-black tracking-[-0.045em] leading-tight text-white">
              {item.title}
            </div>
            <p className="mt-3 text-[12.8px] leading-relaxed text-white/56 font-medium">
              {item.body}
            </p>
          </div>
        </div>

        <BulletList items={item.bullets} />
      </div>
    </PremiumPanel>
  );
}

function VerificationPromise() {
  return (
    <PremiumPanel>
      <div className="p-5 sm:p-6">
        <SectionLabel>Verification promise</SectionLabel>

        <div className="mt-3 text-[19px] sm:text-[24px] font-black tracking-[-0.045em] leading-tight text-white">
          “Verification should help recognition, not create blind trust.”
        </div>

        <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
          <p>
            StayKnown verification is a trust marker inside a safety-first
            product. It helps people recognize verified individuals and verified
            organizations, but it is not a guarantee of safety, honesty,
            emergency authority, legal authority, professional licensing, or
            official endorsement.
          </p>

          <p>
            Verified users must still follow the same safety, consent,
            anti-stalking, contact approval, chat, Visit, SOS, and acceptable
            use rules as every other StayKnown account.
          </p>
        </div>
      </div>
    </PremiumPanel>
  );
}

export default function LearnVerificationPage() {
  const [view, setView] = useState<BadgeView>("Individual");

  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: seo.title,
      description: seo.description,
      url: seo.url,
      image: seo.image,
      isPartOf: {
        "@type": "WebSite",
        name: "StayKnown",
        url: "https://stay-known.com",
      },
      about: [
        "StayKnown verification",
        "verified individual badge",
        "verified organization badge",
        "identity verification",
        "trust and safety",
        "verification abuse",
        "badge removal",
        "safety app verification",
        "contact approval",
        "SOS trust signals",
      ],
    }),
    [],
  );

  return (
    <main className="min-h-screen bg-black overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.075),transparent_38%),radial-gradient(circle_at_18%_38%,rgba(255,255,255,0.04),transparent_34%),radial-gradient(circle_at_82%_56%,rgba(255,255,255,0.035),transparent_34%)]" />

      <header className="relative pt-7">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center gap-2">
            <Image
              src="/6logo.png"
              alt="StayKnown"
              width={34}
              height={34}
              priority
            />
            <div className="text-white font-black tracking-[0.28em] text-[12px]">
              STAYKNOWN
            </div>
            <div className="text-white/40 font-semibold text-[11px]">
              Learn • Verification
            </div>
          </div>

          <div className="sm:hidden mt-3 flex items-center justify-between">
            <MobileNavLink href="/" label="Back to Home" />
            <MobileNavLink href="/safety" label="Safety Policy" />
          </div>

          <div className="hidden sm:flex mt-5 items-center justify-center gap-3">
            <CTA href="/" label="Back to Home" />
            <CTA href="/safety" label="Safety Policy" />
            <CTA href="/abuse" label="Report Misuse" />
          </div>
        </div>
      </header>

      <section className="relative w-full lg:-mb-[360px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.065),transparent_58%)]" />

        <div className="mx-auto max-w-6xl px-4 pt-8 pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] items-start gap-8 lg:gap-8">
            <div className="order-1 lg:order-none lg:col-start-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[10.5px] font-black tracking-[0.20em] text-white/46 uppercase">
                Verified identity, trust markers, and badge safety
              </div>

              <h1 className="mt-4 text-white/95 font-black tracking-[-0.06em] text-[38px] sm:text-[54px] lg:text-[60px] leading-[0.94]">
                StayKnown Verification
              </h1>

              <div className="mt-4 max-w-[76ch] space-y-3 text-white/62 font-medium text-[13px] sm:text-[14px] leading-relaxed">
                <p>
                  StayKnown verification helps people recognize verified
                  individuals and verified organizations across the parts of the
                  app where identity matters: profile, stories, chat, contact
                  approval, Visit, SOS, alerts, notifications, and safety
                  emails.
                </p>

                <p>
                  Verification is a trust signal, not a permission to bypass
                  safety rules. A verified badge does not mean the person or
                  organization is safe, endorsed by StayKnown, approved by a
                  government, professionally licensed, or allowed to track
                  people without consent.
                </p>
              </div>

              <TintedCallout title="Core meaning">
                A verified badge means StayKnown has reviewed certain account
                identity, organization, or trust information enough to display a
                verification marker inside the product. It does not remove
                consent rules, contact approval, anti-stalking rules, emergency
                limits, or abuse enforcement.
              </TintedCallout>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MiniStat
                  label="Badge"
                  value="Black"
                  detail="Active verified individual or organization marker."
                />
                <MiniStat
                  label="Review"
                  value="Grey"
                  detail="Pending, limited, or review-style signal if used."
                />
                <MiniStat
                  label="Safety"
                  value="Rules"
                  detail="Verification can be removed for misuse or abuse."
                />
              </div>

              <div className="mt-7">
                <SectionLabel>Badge meanings</SectionLabel>

                <div className="mt-3">
                  <BadgeTabs view={view} setView={setView} />
                </div>

                <div className="mt-4">
                  <BadgeMeaningPanel view={view} />
                </div>
              </div>

              <div className="mt-6">
                <div className="sm:hidden flex items-center justify-between gap-3">
                  <MobileNavLink href="/safety" label="Safety" />
                  <MobileNavLink href="/abuse" label="Report" />
                </div>

                <div className="hidden sm:flex flex-wrap gap-3">
                  <CTA href="/safety" label="Read Safety Rules" />
                  <CTA href="/abuse" label="Report Badge Misuse" />
                </div>
              </div>
            </div>

            <div className="order-2 lg:order-none lg:col-start-1 flex items-start justify-center lg:justify-start">
              <img
                src="/hero/verification.png"
                alt="StayKnown verified identity badge"
                draggable={false}
                className="
                  block object-contain select-none
                  drop-shadow-[0_26px_95px_rgba(0,0,0,0.78)]
                  max-w-[86vw] max-h-[44vh]
                  sm:max-w-[560px] sm:max-h-[62vh]
                  lg:max-w-[720px] lg:max-h-[74vh]
                  xl:max-w-[780px]
                  transform-gpu transition duration-700 ease-out hover:scale-[1.01]
                  lg:-translate-y-[1080px] xl:-translate-y-[1180px] 2xl:-translate-y-[1360px]
                "
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full">
        <div className="mx-auto max-w-6xl px-4 pb-10 sm:pb-14">
          <div className="mb-5 grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-5">
            <VerificationPromise />

            <PremiumPanel>
              <div className="p-5 sm:p-6">
                <SectionLabel>Where it appears</SectionLabel>

                <div className="mt-3 text-[20px] sm:text-[25px] font-black tracking-[-0.045em] leading-tight text-white">
                  Badges appear where identity context can reduce confusion.
                </div>

                <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
                  <p>
                    Verification may appear beside names or profile surfaces in
                    profile screens, stories, story viewers, story likers, chat
                    headers, contact approvals, approved contact surfaces, Visit
                    alerts, SOS alerts, Daily I’M SAFE emails, missed I’M SAFE
                    alerts, notifications, and safety timeline contexts.
                  </p>

                  <p>
                    For manually entered responders or contacts, StayKnown
                    should show a badge only when the row is clearly linked to a
                    real StayKnown user account with active verification. A
                    manually typed name should not receive a verified badge by
                    name alone.
                  </p>
                </div>
              </div>
            </PremiumPanel>
          </div>

          <div className="mb-6 grid gap-3 md:grid-cols-5">
            <StepCard
              n="1"
              title="Account reviewed"
              body="StayKnown reviews identity, account, organization, or trust signals depending on the verification type."
            />
            <StepCard
              n="2"
              title="Badge approved"
              body="If approved, the account receives an active verification marker that can appear across supported surfaces."
            />
            <StepCard
              n="3"
              title="Badge displayed"
              body="The verified marker appears beside names where identity context helps users recognize the account."
            />
            <StepCard
              n="4"
              title="Rules continue"
              body="Verified users must still follow consent, anti-stalking, contact approval, SOS, Visit, chat, and safety rules."
            />
            <StepCard
              n="5"
              title="Review remains"
              body="StayKnown may re-check, pause, remove, or restrict verification if risk, misuse, or identity change appears."
            />
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <RuleCard
              label="Badge type"
              title="Verified Individual"
              body="Used for a real-person account that has passed StayKnown’s individual verification review. It helps people recognize the person, but it does not guarantee safety."
            />
            <RuleCard
              label="Badge type"
              title="Verified Organization"
              body="Used for an organization-style account such as a company, office, nonprofit, school, support body, or safety-related group that passes organization review."
            />
            <RuleCard
              label="Badge state"
              title="Grey or Review Tick"
              body="A softer tick should mean pending, limited, or review status only. It must not be presented as full verification unless active verification is approved."
            />
            <RuleCard
              label="Badge limit"
              title="No blind trust"
              body="A badge is a recognition signal, not proof that every action, request, alert, message, or emergency claim is safe or official."
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <FeatureCard glyph="✓" title="What verification means">
              Verification means StayKnown has reviewed enough information to
              show a verified marker for an individual or organization account.
              This can help users recognize a profile in safety flows, contact
              approvals, chat, stories, Visit, SOS, and alert contexts.
              <div className="mt-3 text-white/45">
                The badge supports recognition. It does not replace user
                judgment, consent, emergency services, or abuse reporting.
              </div>
            </FeatureCard>

            <FeatureCard glyph="!" title="What verification does not mean">
              Verification does not mean StayKnown guarantees the user is safe,
              honest, licensed, officially endorsed, or approved by government,
              police, medical, school, security, emergency, or nonprofit
              authorities.
              <div className="mt-3 text-white/45">
                A verified user cannot secretly track people, bypass contact
                approval, override blocked settings, or use safety features for
                stalking, harassment, coercion, false emergencies, or fraud.
              </div>
            </FeatureCard>

            <FeatureCard glyph="◉" title="How to keep verification active">
              To maintain verification, users must keep their real identity,
              organization name, profile details, contact information, and
              public representation accurate.
              <div className="mt-3 space-y-2 text-white/62">
                <div>• do not impersonate another person or organization</div>
                <div>• do not sell, rent, transfer, or share the account</div>
                <div>• do not change the account into a new identity</div>
                <div>• respond to reasonable StayKnown verification checks</div>
                <div>
                  • follow safety, privacy, contact, chat, and abuse rules
                </div>
              </div>
            </FeatureCard>

            <FeatureCard glyph="×" title="What can cause badge removal">
              StayKnown may remove, pause, or review verification if the account
              becomes misleading, unsafe, disputed, transferred, unverifiable,
              or abusive.
              <div className="mt-3 space-y-2 text-white/62">
                <div>• false identity or fake organization claims</div>
                <div>• using the badge to pressure contacts or victims</div>
                <div>• fake SOS alerts or false emergency claims</div>
                <div>
                  • stalking, harassment, coercion, or unlawful monitoring
                </div>
                <div>
                  • outdated, false, or unverifiable verification details
                </div>
              </div>
            </FeatureCard>

            <FeatureCard glyph="⚖" title="Effect of verification abuse">
              Abuse of verification can lead to badge removal, visibility loss,
              contact restrictions, chat restrictions, story restrictions, SOS
              or Visit feature restrictions, account review, suspension, or
              permanent ban.
              <div className="mt-3 text-white/45">
                Where appropriate, StayKnown may preserve records, review safety
                risk, and cooperate with valid legal or emergency requests.
              </div>
            </FeatureCard>

            <FeatureCard glyph="▣" title="Organization authority limits">
              A verified organization badge does not automatically mean
              government authority, law enforcement authority, medical
              authority, school authority, emergency response authority, charity
              approval, or legal authorization.
              <div className="mt-3 text-white/45">
                Organizations must not use verification to misrepresent their
                role, collect unsafe information, pressure users, or imply
                authority they do not legally have.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⟡" title="Safety flow visibility">
              Badge metadata may travel through safety systems so the UI can
              show the correct identity state in chat, stories, contacts,
              alerts, emails, push data, and safety timeline events.
              <div className="mt-3 text-white/45">
                This helps keep identity presentation consistent across the app
                without giving manually typed names fake verification.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⌁" title="Reporting badge misuse">
              Users should report badge misuse if someone pretends to be
              verified, uses a badge to pressure others, claims false authority,
              impersonates a person or organization, or uses verification in an
              abusive safety flow.
              <div className="mt-3 text-white/45">
                Reports can include usernames, emails, screenshots, alert
                examples, dates, times, contact request details, and why the
                badge appears misleading or unsafe.
              </div>
            </FeatureCard>
          </div>

          <div className="mt-6">
            <PremiumPanel>
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <SectionLabel>Do not misuse badges</SectionLabel>

                  <div className="mt-3 text-[21px] sm:text-[28px] font-black tracking-[-0.045em] leading-tight text-white">
                    Verification is not a weapon, shortcut, or immunity.
                  </div>

                  <p className="mt-3 text-[12.8px] leading-relaxed text-white/56 font-medium">
                    A verified badge should never be used to pressure someone
                    into approving contact requests, accepting SOS responder
                    duties, trusting a location link blindly, sending money,
                    revealing private information, ignoring abuse, or believing
                    false emergency claims.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "Do not claim a badge means StayKnown endorses you.",
                    "Do not use verification to bypass consent or contact approval.",
                    "Do not imply government, police, medical, school, or emergency authority without proof.",
                    "Do not use a verified account for stalking, harassment, fraud, coercion, or false emergencies.",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-black/25 p-4 text-[12.4px] leading-relaxed text-white/58 font-medium"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </PremiumPanel>
          </div>

          <div className="mt-6">
            <PremiumPanel>
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <SectionLabel>Related trust pages</SectionLabel>

                  <div className="mt-3 text-[21px] sm:text-[28px] font-black tracking-[-0.045em] leading-tight text-white">
                    Verification connects to safety, consent, abuse reporting,
                    and identity trust.
                  </div>

                  <p className="mt-3 text-[12.8px] leading-relaxed text-white/56 font-medium">
                    The full verification policy will define eligibility,
                    review, badge removal, appeals, misuse, evidence handling,
                    organization rules, and the relationship between
                    verification and other StayKnown policies.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      title: "Safety & Anti-Stalking",
                      body: "Consent, lawful use, SOS, live location, and abuse prevention.",
                      href: "/safety",
                    },
                    {
                      title: "Contact Consent",
                      body: "Approval rules for emergency contacts and SOS responders.",
                      href: "/contact-consent",
                    },
                    {
                      title: "Abuse Reporting",
                      body: "Report impersonation, badge misuse, harassment, and unsafe behavior.",
                      href: "/abuse",
                    },
                    {
                      title: "Verification Policy",
                      body: "Full legal-style policy for badge rules, removal, and review.",
                      href: "/verification-policy",
                    },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:bg-white/[0.06] hover:border-white/18"
                    >
                      <div className="text-[12.8px] font-black tracking-[-0.02em] text-white/86">
                        {item.title}
                      </div>
                      <div className="mt-2 text-[12.2px] leading-relaxed font-medium text-white/50">
                        {item.body}
                      </div>
                      <div className="mt-3 text-[10px] font-black tracking-[0.2em] text-white/32 group-hover:text-white/56">
                        OPEN
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </PremiumPanel>
          </div>

          <div className="mt-6">
            <PremiumPanel>
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <SectionLabel>Search discovery focus</SectionLabel>

                  <div className="mt-3 text-[21px] sm:text-[28px] font-black tracking-[-0.045em] leading-tight text-white">
                    This page is written for discovery around safety app
                    verification, trust badges, and identity recognition.
                  </div>

                  <p className="mt-3 text-[12.8px] leading-relaxed text-white/56 font-medium">
                    Visitors should understand the value quickly: StayKnown
                    verification helps identity recognition inside a safety app,
                    but it also has strict limits, maintenance rules, abuse
                    consequences, and reporting pathways.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "A verified individual appears in chat and story surfaces with an active black check.",
                    "A verified organization appears in safety context without claiming authority it does not have.",
                    "A grey review tick is treated as pending or limited, not full verification.",
                    "A verified badge can be removed when identity changes, abuse happens, or the account becomes misleading.",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-black/25 p-4 text-[12.4px] leading-relaxed text-white/58 font-medium"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </PremiumPanel>
          </div>
        </div>
      </section>

      <footer className="relative w-full">
        <div className="mx-auto max-w-6xl px-4 pb-10">
          <div className="h-px bg-white/[0.08]" />

          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] sm:text-[12px] font-semibold text-white/45 leading-relaxed">
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Privacy Policy
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Terms of service
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/acceptable-use"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Acceptable Use
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/safety"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Safety &amp; Anti-Stalking
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/contact-consent"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Contact Consent
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/verification-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Verification Policy
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/abuse"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Abuse Reporting
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/law"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Law Enforcement
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/security"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Security Disclosure
              </a>
            </div>

            <div className="text-[12px] font-semibold text-white/50">
              A 6 Clement Joshua service
              <span className="text-white/25 ml-1 align-super text-[10px]">
                ™
              </span>
            </div>

            <div className="text-[11px] font-semibold text-white/30">
              {new Date().getFullYear()} • stay-known.com
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
