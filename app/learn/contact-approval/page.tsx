"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Tier = "Starter" | "Pro" | "ProMax";

const seo = {
  title: "Contact Approval | StayKnown Consent-Based Emergency Contact Trust",
  description:
    "Learn how StayKnown contact approval protects trusted safety relationships with two-party confirmation, consent-aware setup, clear roles, and anti-abuse safeguards.",
  url: "https://stay-known.com/learn/contact-approval",
  image: "https://stay-known.com/hero/contact-approval.png",
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

function PlanTabs({
  tier,
  setTier,
}: {
  tier: Tier;
  setTier: (t: Tier) => void;
}) {
  const Tab = ({ t }: { t: Tier }) => {
    const active = tier === t;

    return (
      <button
        onClick={() => setTier(t)}
        className={[
          "relative px-0 py-2 text-[11.5px] font-semibold tracking-[-0.01em] transition select-none",
          active ? "text-white" : "text-white/52 hover:text-white/85",
        ].join(" ")}
      >
        {t}
        <span
          className={[
            "pointer-events-none absolute left-0 -bottom-[2px] h-[2px] rounded-full transition-all duration-200",
            active ? "w-full bg-white/65" : "w-0 bg-white/0",
          ].join(" ")}
        />
        <span className="pointer-events-none absolute inset-0 opacity-0 active:opacity-100 transition duration-75 bg-white/[0.06]" />
      </button>
    );
  };

  const Pill = ({ t }: { t: Tier }) => {
    const active = tier === t;

    return (
      <button
        onClick={() => setTier(t)}
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
        <span className="relative font-semibold tracking-[-0.01em]">{t}</span>
      </button>
    );
  };

  return (
    <>
      <div className="sm:hidden flex items-center justify-center gap-5">
        <Tab t="Starter" />
        <Tab t="Pro" />
        <Tab t="ProMax" />
      </div>

      <div className="hidden sm:flex flex-wrap gap-2">
        <Pill t="Starter" />
        <Pill t="Pro" />
        <Pill t="ProMax" />
      </div>
    </>
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

function TierBlock({
  tier,
  bullets,
  highlight,
  note,
}: {
  tier: Tier;
  highlight?: boolean;
  bullets: string[];
  note?: string;
}) {
  return (
    <PremiumPanel className={highlight ? "border-white/18" : ""}>
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="text-white/95 font-black tracking-[-0.025em] text-[14px] sm:text-[15px]">
            {tier}
          </div>

          {highlight ? (
            <div className="text-[10px] font-black tracking-[0.22em] text-white/56">
              TRUST DEPTH
            </div>
          ) : null}
        </div>

        <ul className="mt-4 space-y-2.5">
          {bullets.map((b, i) => (
            <li
              key={i}
              className="flex gap-2.5 text-white/62 font-medium text-[12.6px] leading-relaxed"
            >
              <span className="mt-[2px] text-white/42">•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {note ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-[11.8px] leading-relaxed text-white/48">
            <span className="font-black text-white/64">Note:</span>{" "}
            <em>{note}</em>
          </div>
        ) : null}
      </div>
    </PremiumPanel>
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

function FlowStep({
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.08),transparent_58%)]" />
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

function ScenarioBox() {
  return (
    <PremiumPanel>
      <div className="p-5 sm:p-6">
        <SectionLabel>Assurance standard</SectionLabel>

        <div className="mt-3 text-[19px] sm:text-[24px] font-black tracking-[-0.045em] leading-tight text-white">
          “No one should become part of my safety circle silently, and no one
          should be asked to carry safety responsibility without knowing.”
        </div>

        <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
          <p>
            Contact Approval is StayKnown’s trust gate. It helps make sure a
            safety relationship is intentional before the app depends on that
            person for Visit alerts, SOS context, or emergency communication.
          </p>

          <p>
            The experience should feel calm and reassuring: the account owner
            knows what they requested, the contact knows what role they are
            accepting, and the request does not complete until the required
            confirmations are in place.
          </p>
        </div>
      </div>
    </PremiumPanel>
  );
}

export default function LearnContactApprovalPage() {
  const [tier, setTier] = useState<Tier>("Starter");

  const tierCopy = useMemo(() => {
    return {
      Starter: [
        "Starter users can set up trusted safety relationships with clear approval expectations before relying on Visit sharing.",
        "A contact should understand who is adding them, what role they are being asked to accept, and why the relationship matters.",
        "Pending states should stay calm and readable so users know the request is waiting, not broken.",
        "Starter keeps contact trust understandable while higher tiers expand the safety actions those contacts may support.",
      ],
      Pro: [
        "Pro contact approval becomes more important because contacts may receive SOS-related context and urgent safety signals.",
        "Approved contacts help reduce confusion during escalation because the relationship is already known and intentional.",
        "The flow should support clear approvals, declines, expired links, and status refresh without raw or alarming error text.",
        "Pro users benefit from a stronger trust layer before using safety features that depend on emergency communication.",
      ],
      ProMax: [
        "ProMax should present the most complete contact trust posture across emergency contacts, SOS contacts, and responder-style safety roles.",
        "Best for users who need premium trust clarity, repeated safety routines, stronger consent language, and polished pending-state handling.",
        "Works best with Safety Gallery, verified stop, SOS readiness, profile identity, and richer safety-recognition surfaces.",
        "ProMax should make contact approval feel serious and premium without making the process intimidating.",
      ],
    } as Record<Tier, string[]>;
  }, []);

  const tierNote: Record<Tier, string> = useMemo(
    () => ({
      Starter:
        "Contact approval is about trust and consent. Only add people who should genuinely receive safety context.",
      Pro: "Because Pro unlocks SOS readiness, contacts should understand the role before urgent alerts depend on them.",
      ProMax:
        "ProMax can support the deepest trust posture, but consent and lawful use remain the foundation.",
    }),
    [],
  );

  const jsonLd = {
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
      "contact approval",
      "emergency contact consent",
      "trusted safety contacts",
      "SOS contact approval",
      "two-party confirmation",
      "personal safety app",
      "anti-stalking safety app",
      "StayKnown contact confirmation",
      "consent-based safety sharing",
    ],
  };

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
              Learn • Contact Approval
            </div>
          </div>

          <div className="sm:hidden mt-3 flex items-center justify-between">
            <MobileNavLink href="/" label="Back to Home" />
            <MobileNavLink
              href="/learn/safety-gallery"
              label="Next: Safety Gallery"
            />
          </div>

          <div className="hidden sm:flex mt-5 items-center justify-center gap-3">
            <CTA href="/" label="Back to Home" />
            <CTA href="/learn/verified-stop" label="Verified Stop" />
            <CTA href="/learn/safety-gallery" label="Next: Safety Gallery" />
          </div>
        </div>
      </header>

      <section className="relative w-full lg:-mb-[360px]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.065),transparent_58%)]" />

        <div className="mx-auto max-w-6xl px-4 pt-8 pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] items-start gap-8 lg:gap-8">
            <div className="order-1 lg:order-none lg:col-start-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[10.5px] font-black tracking-[0.20em] text-white/46 uppercase">
                Consent before trusted safety access
              </div>

              <h1 className="mt-4 text-white/95 font-black tracking-[-0.06em] text-[38px] sm:text-[54px] lg:text-[60px] leading-[0.94]">
                Contact Approval
              </h1>

              <div className="mt-4 max-w-[76ch] space-y-3 text-white/62 font-medium text-[13px] sm:text-[14px] leading-relaxed">
                <p>
                  StayKnown does not treat safety access as casual. A person
                  should know when they are being added, who is adding them,
                  what role they are being asked to accept, and why that
                  relationship matters.
                </p>

                <p>
                  Contact Approval creates a consent-aware trust layer before
                  safety alerts, Visit context, SOS updates, or emergency
                  communication depend on the relationship.
                </p>
              </div>

              <TintedCallout title="The assurance message">
                StayKnown is designed so trusted safety relationships are clear,
                intentional, and reviewable.{" "}
                <em>
                  A contact can approve, decline, or let an expired request
                  require a fresh process instead of being silently added.
                </em>
              </TintedCallout>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MiniStat
                  label="Trust"
                  value="Two sides"
                  detail="Both the account owner and contact side can be represented."
                />
                <MiniStat
                  label="Safety"
                  value="Consent"
                  detail="The role should be known before alerts depend on it."
                />
                <MiniStat
                  label="Status"
                  value="Clear"
                  detail="Pending, approved, declined, and expired states stay understandable."
                />
              </div>

              <div className="mt-7">
                <SectionLabel>Experience by plan</SectionLabel>

                <div className="mt-3">
                  <PlanTabs tier={tier} setTier={setTier} />
                </div>

                <div className="mt-4">
                  <TierBlock
                    tier={tier}
                    highlight={tier === "ProMax"}
                    bullets={tierCopy[tier]}
                    note={tierNote[tier]}
                  />
                </div>
              </div>

              <div className="mt-6">
                <div className="sm:hidden flex items-center justify-between gap-3">
                  <MobileNavLink href="/learn/sos" label="SOS" />
                  <MobileNavLink
                    href="/learn/safety-gallery"
                    label="Safety Gallery"
                  />
                </div>

                <div className="hidden sm:flex flex-wrap gap-3">
                  <CTA href="/learn/sos" label="Learn: SOS Active State" />
                  <CTA
                    href="/learn/safety-gallery"
                    label="Learn: Safety Gallery"
                  />
                </div>
              </div>
            </div>

            <div className="order-2 lg:order-none lg:col-start-1 flex items-start justify-center lg:justify-start">
              <img
                src="/hero/contact-approval.png"
                alt="StayKnown contact approval confirmation"
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
            <ScenarioBox />

            <PremiumPanel>
              <div className="p-5 sm:p-6">
                <SectionLabel>Trust posture</SectionLabel>

                <div className="mt-3 text-[20px] sm:text-[25px] font-black tracking-[-0.045em] leading-tight text-white">
                  A safety contact is not just a saved email. It is a trusted
                  role.
                </div>

                <div className="mt-4 space-y-3 text-[12.7px] leading-relaxed text-white/58 font-medium">
                  <p>
                    In normal apps, adding a contact may be simple. In a safety
                    app, that contact may later receive sensitive context about
                    a Visit, a location update, an SOS alert, or a user’s safety
                    state.
                  </p>

                  <p>
                    That is why approval should feel more careful. StayKnown can
                    show who is asking, what role is being requested, what is
                    waiting, and whether the relationship has completed or
                    stopped.
                  </p>
                </div>
              </div>
            </PremiumPanel>
          </div>

          <div className="mb-6 grid gap-3 md:grid-cols-5">
            <FlowStep
              n="1"
              title="Request starts"
              body="A user asks to add someone as a trusted contact, emergency contact, or SOS-related contact."
            />
            <FlowStep
              n="2"
              title="Role is shown"
              body="The request explains the safety role so the person understands what they are being asked to accept."
            />
            <FlowStep
              n="3"
              title="Both sides confirm"
              body="The account owner and contact email owner can be checked so the relationship is intentional."
            />
            <FlowStep
              n="4"
              title="Status stays clear"
              body="Pending, declined, expired, and approved states are shown with calm language."
            />
            <FlowStep
              n="5"
              title="Trust is created"
              body="Only after approval should the contact become part of the safety relationship."
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <FeatureCard glyph="✔" title="Consent before trust">
              Contact Approval makes the relationship visible before it becomes
              relied on. The person being added should not be surprised later
              when they receive safety communication.
              <div className="mt-3 text-white/45">
                This protects the user, the contact, and the integrity of the
                safety network.
              </div>
            </FeatureCard>

            <FeatureCard glyph="▣" title="Two-party confirmation">
              A stronger flow can require both sides to complete their part:
              <div className="mt-3 space-y-2 text-white/62">
                <div>
                  •{" "}
                  <span className="text-white/80 font-black">
                    Account owner:
                  </span>{" "}
                  confirms they intentionally started the request.
                </div>
                <div>
                  •{" "}
                  <span className="text-white/80 font-black">
                    Contact email owner:
                  </span>{" "}
                  confirms they agree to the role.
                </div>
              </div>
              <div className="mt-3 text-white/45">
                This creates a cleaner trust boundary than silent or one-sided
                contact additions.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⌁" title="Pending should feel safe">
              A pending request should not look broken. It should quietly tell
              the user what is still missing and what happens next.
              <div className="mt-3 space-y-2 text-white/62">
                <div>• waiting for account owner confirmation</div>
                <div>• waiting for contact email owner confirmation</div>
                <div>
                  • request complete only when required approvals finish
                </div>
              </div>
            </FeatureCard>

            <FeatureCard glyph="!" title="Decline without pressure">
              A contact should be able to decline a request without feeling
              trapped. Decline states should be clear, calm, and final enough to
              prevent old links from being used as pressure.
              <div className="mt-3 text-white/45">
                This supports consent and helps protect people from unwanted
                safety roles.
              </div>
            </FeatureCard>

            <FeatureCard glyph="◌" title="Expired links protect the process">
              Approval links should not stay useful forever. Expiration helps
              reduce the risk of old emails, forwarded links, or stale requests
              being used later without fresh context.
              <div className="mt-3 text-white/45">
                A fresh approval process is safer than forcing an old request to
                remain valid.
              </div>
            </FeatureCard>

            <FeatureCard glyph="⟡" title="Different contact roles matter">
              Not every contact carries the same meaning:
              <div className="mt-3 space-y-2 text-white/62">
                <div>
                  • <span className="text-white/80 font-black">Emergency:</span>{" "}
                  receives safety context for normal protection flows.
                </div>
                <div>
                  • <span className="text-white/80 font-black">SOS:</span> may
                  receive urgent escalation context.
                </div>
                <div>
                  • <span className="text-white/80 font-black">Responder:</span>{" "}
                  should understand added responsibility before accepting.
                </div>
              </div>
            </FeatureCard>

            <FeatureCard glyph="⚖" title="Law-abiding safety standard">
              StayKnown is for known, trusted, legitimate safety relationships.
              It should not be used to stalk, pressure, monitor, threaten, or
              track strangers.
              <div className="mt-3 text-white/45">
                Abuse, false claims, or suspicious behavior can be handled by
                restrictions, reporting, or account action where required.
              </div>
            </FeatureCard>

            <FeatureCard glyph="✦" title="Investor value">
              Contact Approval turns StayKnown into a trust network, not just a
              location-sharing tool. The product can prove that safety access is
              governed by consent, role clarity, and controlled state changes.
              <div className="mt-3 text-white/45">
                That strengthens user trust, reduces misuse risk, and supports a
                more defensible safety platform.
              </div>
            </FeatureCard>
          </div>

          <div className="mt-6">
            <PremiumPanel>
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <SectionLabel>Search discovery focus</SectionLabel>

                  <div className="mt-3 text-[21px] sm:text-[28px] font-black tracking-[-0.045em] leading-tight text-white">
                    This page is written for discovery around emergency contact
                    consent, SOS contact approval, and anti-abuse safety design.
                  </div>

                  <p className="mt-3 text-[12.8px] leading-relaxed text-white/56 font-medium">
                    Visitors should understand the assurance quickly: StayKnown
                    uses contact approval so trusted safety relationships are
                    not silent, vague, or forced. A person should understand the
                    role before the app depends on them during safety moments.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      title: "Safety Gallery",
                      body: "Recognition cues help contacts trust who they are helping.",
                      href: "/learn/safety-gallery",
                    },
                    {
                      title: "SOS Active State",
                      body: "Approved contacts matter most when urgent context is sent.",
                      href: "/learn/sos",
                    },
                    {
                      title: "Privacy & Anti-Abuse",
                      body: "Consent and lawful safety use belong together.",
                      href: "/learn/privacy-anti-abuse",
                    },
                    {
                      title: "Visit + LIVE + SOS",
                      body: "See how trusted contacts fit into the wider safety system.",
                      href: "/learn/visit-live-sos",
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
                Terms of Service
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
                href="/emergency"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Emergency Disclaimer
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/minors"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Child Safety &amp; Minor Use
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
                href="/retention"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Data Retention
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
