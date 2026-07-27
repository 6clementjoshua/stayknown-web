import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import StayKnownActionMenu from "@/components/StayKnownActionMenu";

const POLICY_VERSION = "1.0";
const POLICY_UPDATED = "July 27, 2026";
const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.stayknown.app";

const policyLinks = [
  { label: "Account Closure & Recovery", href: "/account-closure" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Data Retention", href: "/retention" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Safety & Anti-Stalking", href: "/safety" },
  { label: "Help Center", href: "/help-center" },
  { label: "Contact Support", href: "/submit-request" },
] as const;

const pageSections = [
  { label: "Summary", href: "#summary" },
  { label: "Safety review", href: "#safety-review" },
  { label: "Protection Lock", href: "#protection-lock" },
  { label: "Closure steps", href: "#closure-steps" },
  { label: "30-day recovery", href: "#recovery-period" },
  { label: "Chats & contacts", href: "#relationships" },
  { label: "Data handling", href: "#data-handling" },
  { label: "Reactivation", href: "#reactivation" },
  { label: "Support", href: "#support" },
] as const;

export const metadata: Metadata = {
  title: "Account Closure & Recovery Policy | StayKnown",
  description:
    "How StayKnown securely handles account closure requests, coercion risk, trusted-contact alerts, a 30-day recovery period, reactivation, chats, contacts, and retained safety records.",
  alternates: {
    canonical: "/account-closure",
  },
  openGraph: {
    title: "StayKnown Account Closure & Recovery Policy",
    description:
      "A security-first account closure process with owner verification, coercion protection, a 30-day recovery period, and clear treatment of chats, contacts, and safety records.",
    type: "article",
    url: "/account-closure",
    siteName: "StayKnown",
  },
};

function GooglePlayMark() {
  return (
    <svg
      viewBox="0 0 512 512"
      aria-hidden="true"
      className="h-[18px] w-[18px] shrink-0"
    >
      <path
        d="M96 38.4v435.2c0 17.2 18.8 27.8 33.5 18.8l251.3-153.7L96 38.4z"
        fill="#34A853"
      />
      <path
        d="M96 38.4l284.8 300.3 68.2-41.7c22.7-13.9 22.7-46.8 0-60.7L380.8 194.6 96 38.4z"
        fill="#4285F4"
      />
      <path d="M96 38.4l284.8 156.2L294.2 256 96 38.4z" fill="#FBBC04" />
      <path
        d="M96 473.6 294.2 256l86.6 82.7L129.5 492.4C114.8 501.4 96 490.8 96 473.6z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GooglePlayButton() {
  return (
    <a
      href={GOOGLE_PLAY_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Get StayKnown on Google Play"
      className="sk-white-bevel group inline-flex min-h-12 items-center justify-center gap-3 rounded-[17px] border border-white/90 bg-white px-5 !text-black shadow-[0_18px_50px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,1),inset_0_-5px_13px_rgba(0,0,0,0.07)] transition duration-200 hover:-translate-y-0.5 hover:bg-white/95 hover:!text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 active:translate-y-0 active:scale-[0.985]"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-black/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
        <GooglePlayMark />
      </span>
      <span className="flex flex-col items-start leading-none">
        <span className="text-[8px] font-black uppercase tracking-[0.16em] text-black/55">
          Get it on
        </span>
        <span className="mt-1 text-[14px] font-black tracking-[-0.035em] text-black">
          Google Play
        </span>
      </span>
    </a>
  );
}

function StatusPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-7 items-center rounded-full border border-white/[0.12] bg-white/[0.065] px-3 text-[9px] font-black uppercase tracking-[0.17em] text-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_22px_rgba(0,0,0,0.22)]">
      {children}
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#92f3cf]/70">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-[27px] font-black leading-[1.02] tracking-[-0.055em] text-white sm:text-[34px]">
        {title}
      </h2>
      {body ? (
        <p className="mt-4 text-[13px] font-semibold leading-[1.72] text-white/58 sm:text-[14px]">
          {body}
        </p>
      ) : null}
    </div>
  );
}

function PremiumCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`sk-dark-bevel rounded-[26px] border border-white/[0.095] bg-[linear-gradient(145deg,rgba(255,255,255,0.075),rgba(255,255,255,0.028)_52%,rgba(0,0,0,0.16))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

function PolicyLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="font-extrabold text-white underline decoration-white/25 underline-offset-4 transition hover:decoration-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
    >
      {children}
    </a>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-3">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3 text-[13px] font-semibold leading-[1.62] text-white/62"
        >
          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#92f3cf]/80 shadow-[0_0_16px_rgba(146,243,207,0.35)]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function AccountClosurePolicyPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "StayKnown Account Closure & Recovery Policy",
    url: "https://www.stay-known.com/account-closure",
    dateModified: "2026-07-27",
    description:
      "StayKnown's security-first rules for account closure, coercion protection, reactivation, contact notices, chat availability, and retained safety records.",
    isPartOf: {
      "@type": "WebSite",
      name: "StayKnown",
      url: "https://www.stay-known.com",
    },
  };

  return (
    <main
      id="top"
      className="min-h-screen overflow-x-hidden bg-[#050709] text-white"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <style>{`
        html { scroll-behavior: smooth; }
        .sk-dark-bevel, .sk-white-bevel, .sk-logo-bevel { position: relative; isolation: isolate; }
        .sk-dark-bevel::after, .sk-white-bevel::after, .sk-logo-bevel::after {
          content: "";
          position: absolute;
          inset: 1px;
          z-index: -1;
          pointer-events: none;
          border-radius: inherit;
          border-top: 1px solid rgba(255,255,255,0.10);
        }
        .sk-white-bevel::after {
          border-top-color: rgba(255,255,255,0.98);
          border-bottom: 1px solid rgba(0,0,0,0.08);
        }
        .sk-menu-wrap > button,
        .sk-menu-wrap > div > button {
          color: rgba(255,255,255,0.88) !important;
          border-color: rgba(255,255,255,0.10) !important;
          background: rgba(255,255,255,0.045) !important;
        }
        .sk-menu-wrap > button:hover,
        .sk-menu-wrap > div > button:hover {
          color: #ffffff !important;
          border-color: rgba(255,255,255,0.16) !important;
          background: rgba(255,255,255,0.08) !important;
        }
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <header className="sticky top-0 z-50 border-b border-white/[0.075] bg-[#050709]/88 backdrop-blur-2xl">
        <div className="relative mx-auto flex min-h-[74px] max-w-6xl items-center justify-between gap-3 px-4 sm:px-5 lg:px-6">
          <a
            href="/"
            aria-label="StayKnown home"
            className="inline-flex min-h-12 items-center gap-3 rounded-[16px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
          >
            <span className="sk-logo-bevel flex h-10 w-10 items-center justify-center rounded-[15px] border border-white/[0.15] bg-[linear-gradient(145deg,rgba(255,255,255,0.15),rgba(255,255,255,0.035))] shadow-[inset_0_1px_0_rgba(255,255,255,0.17),0_12px_26px_rgba(0,0,0,0.42)]">
              <Image src="/6logo.png" alt="" width={22} height={22} priority />
            </span>
            <span>
              <span className="block text-[12px] font-black tracking-[0.22em] text-white">
                STAYKNOWN
              </span>
              <span className="mt-0.5 hidden text-[9px] font-bold tracking-[0.04em] text-white/36 sm:block">
                Consent-based safety
              </span>
            </span>
          </a>

          <div className="sk-menu-wrap">
            <StayKnownActionMenu />
          </div>
        </div>
      </header>

      <section className="relative isolate overflow-hidden border-b border-white/[0.07]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(146,243,207,0.11),transparent_36%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.07),transparent_32%),linear-gradient(180deg,#090d10_0%,#050709_100%)]" />
        <div className="absolute -left-24 top-20 h-56 w-56 rounded-full bg-[#92f3cf]/[0.045] blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-12 sm:px-5 sm:pb-16 sm:pt-16 lg:px-6 lg:pb-20">
          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-2">
              <StatusPill>Security policy</StatusPill>
              <StatusPill>30-day recovery</StatusPill>
              <StatusPill>Coercion protection</StatusPill>
            </div>

            <h1 className="mt-6 max-w-[14ch] text-[44px] font-black leading-[0.92] tracking-[-0.075em] text-white sm:text-[60px] md:text-[72px]">
              Account closure should never become a shortcut around
              someone&apos;s safety.
            </h1>

            <p className="mt-6 max-w-3xl text-[15px] font-semibold leading-[1.75] text-white/62 sm:text-[16px]">
              This policy explains how StayKnown handles voluntary account
              closure, suspected pressure or coercion, owner verification,
              trusted-contact notices, a reversible 30-day recovery period,
              reactivation, chats, contacts, identity reservation, and records
              that may need to remain for safety, security, legal, or
              abuse-prevention purposes.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
              <span>Version {POLICY_VERSION}</span>
              <span aria-hidden="true">•</span>
              <span>Updated {POLICY_UPDATED}</span>
            </div>
          </div>

          <PremiumCard className="mt-9 max-w-4xl border-[#92f3cf]/[0.16] bg-[linear-gradient(145deg,rgba(146,243,207,0.09),rgba(255,255,255,0.03)_55%,rgba(0,0,0,0.16))]">
            <div className="grid gap-5 md:grid-cols-[auto_1fr] md:items-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-[17px] border border-[#92f3cf]/20 bg-[#92f3cf]/[0.08] text-[20px] shadow-[inset_0_1px_0_rgba(255,255,255,0.11),0_15px_38px_rgba(0,0,0,0.26)]">
                ◇
              </div>
              <div>
                <h2 className="text-[19px] font-black tracking-[-0.035em] text-white">
                  Immediate danger comes before account settings.
                </h2>
                <p className="mt-3 text-[13px] font-semibold leading-[1.67] text-white/61">
                  StayKnown is not an emergency dispatch service. If you or
                  another person may be in immediate danger, contact the
                  appropriate official emergency service or nearby trusted
                  authority first. An account closure request does not replace
                  emergency help.
                </p>
              </div>
            </div>
          </PremiumCard>
        </div>
      </section>

      <div className="border-b border-white/[0.07] bg-black/20">
        <nav
          aria-label="Account closure policy sections"
          className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3 sm:px-5 lg:px-6"
        >
          {pageSections.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full border border-white/[0.09] bg-white/[0.035] px-3.5 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-white/52 transition hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-5 sm:py-16 lg:px-6 lg:py-20">
        <section id="summary" className="scroll-mt-28">
          <SectionHeading
            eyebrow="1 · Policy summary"
            title="Closure is staged, verified, reversible, and safety-aware."
            body="StayKnown does not treat an account closure request as an ordinary one-tap setting. The process is designed to distinguish a voluntary decision from pressure, device theft, unauthorized access, or an attempt to remove a person's safety connection."
          />

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <PremiumCard>
              <p className="text-[10px] font-black uppercase tracking-[0.19em] text-white/40">
                Verified decision
              </p>
              <h3 className="mt-3 text-[20px] font-black tracking-[-0.04em] text-white">
                No immediate deletion
              </h3>
              <p className="mt-3 text-[13px] font-semibold leading-[1.62] text-white/57">
                A request must pass policy review, safety questions, security
                preflight, owner authentication, and a one-use email
                confirmation.
              </p>
            </PremiumCard>

            <PremiumCard>
              <p className="text-[10px] font-black uppercase tracking-[0.19em] text-white/40">
                Recovery window
              </p>
              <h3 className="mt-3 text-[20px] font-black tracking-[-0.04em] text-white">
                30 reversible days
              </h3>
              <p className="mt-3 text-[13px] font-semibold leading-[1.62] text-white/57">
                Confirmed closure makes the account unavailable to ordinary
                service use while preserving a secure route back to the same
                identity.
              </p>
            </PremiumCard>

            <PremiumCard>
              <p className="text-[10px] font-black uppercase tracking-[0.19em] text-white/40">
                Safety continuity
              </p>
              <h3 className="mt-3 text-[20px] font-black tracking-[-0.04em] text-white">
                Evidence is not erased blindly
              </h3>
              <p className="mt-3 text-[13px] font-semibold leading-[1.62] text-white/57">
                Eligible public and optional data may be removed or anonymized,
                while necessary safety, consent, security, billing, legal, and
                abuse records may be restricted and retained.
              </p>
            </PremiumCard>
          </div>
        </section>

        <section
          id="safety-review"
          className="scroll-mt-28 border-t border-white/[0.075] pt-14 sm:pt-16"
        >
          <SectionHeading
            eyebrow="2 · Safety review"
            title="Before continuing, StayKnown asks whether the decision is truly yours."
            body="The closure screen presents four Yes or No questions. These answers are used only to decide whether a normal closure may continue or whether StayKnown should protect the account from destructive changes."
          />

          <div className="mt-7 grid gap-4 lg:grid-cols-2">
            {[
              [
                "Are you closing StayKnown freely?",
                "No creates a critical coercion signal.",
              ],
              [
                "Is someone watching, pressuring, or instructing you to remove your safety account?",
                "Yes creates a critical coercion signal.",
              ],
              [
                "Would losing access make it harder for trusted people to know you are safe?",
                "Yes pauses closure and offers safety-focused guidance.",
              ],
              [
                "Do you need time, privacy, or assistance before continuing?",
                "Yes pauses closure and offers safer next steps.",
              ],
            ].map(([question, result], index) => (
              <PremiumCard key={question}>
                <div className="flex items-start gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] border border-white/[0.11] bg-white/[0.05] text-[11px] font-black text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_10px_25px_rgba(0,0,0,0.24)]">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-[15px] font-black leading-[1.35] text-white">
                      {question}
                    </h3>
                    <p className="mt-2 text-[12px] font-semibold leading-[1.55] text-white/50">
                      {result}
                    </p>
                  </div>
                </div>
              </PremiumCard>
            ))}
          </div>

          <PremiumCard className="mt-5 border-amber-200/[0.16] bg-[linear-gradient(145deg,rgba(251,191,36,0.07),rgba(255,255,255,0.025)_55%,rgba(0,0,0,0.16))]">
            <h3 className="text-[17px] font-black tracking-[-0.03em] text-white">
              Critical-answer rule
            </h3>
            <p className="mt-3 text-[13px] font-semibold leading-[1.67] text-white/59">
              “Closing freely: No” or “Pressure or monitoring: Yes” stops the
              closure process. StayKnown may activate a server-enforced
              Protection Lock and notify eligible approved safety contacts using
              controlled, high-priority channels. The screen may use neutral
              wording so a nearby coercer is not shown sensitive alert details.
            </p>
          </PremiumCard>
        </section>

        <section
          id="protection-lock"
          className="scroll-mt-28 border-t border-white/[0.075] pt-14 sm:pt-16"
        >
          <SectionHeading
            eyebrow="3 · Coercion Protection Lock"
            title="Destructive actions stop for 24 hours, but emergency access stays available."
            body="A Protection Lock is tied to the account on StayKnown's backend. Reinstalling the app, clearing local storage, restarting the device, or attempting the same destructive action elsewhere does not shorten the lock."
          />

          <div className="mt-7 grid gap-4 lg:grid-cols-2">
            <PremiumCard className="border-[#92f3cf]/[0.15]">
              <p className="text-[10px] font-black uppercase tracking-[0.19em] text-[#92f3cf]/70">
                Remains available
              </p>
              <BulletList
                items={[
                  "SOS and supported emergency-call actions.",
                  "I’M SAFE and manual safety capture where otherwise available.",
                  "Existing Visit and LIVE safety controls.",
                  "Read-only access to important safety information.",
                  "Official emergency services and appropriate nearby authorities.",
                ]}
              />
            </PremiumCard>

            <PremiumCard className="border-rose-200/[0.13]">
              <p className="text-[10px] font-black uppercase tracking-[0.19em] text-rose-100/65">
                Temporarily blocked
              </p>
              <BulletList
                items={[
                  "Account closure, sign-out, or account switching.",
                  "Removing approved contacts or recovery relationships.",
                  "Changing critical identity or security settings.",
                  "Removing trusted devices or active security sessions.",
                  "Other destructive actions that could reduce safety continuity.",
                ]}
              />
            </PremiumCard>
          </div>

          <PremiumCard className="mt-5">
            <h3 className="text-[17px] font-black tracking-[-0.03em] text-white">
              Contact acknowledgement does not unlock the account
            </h3>
            <p className="mt-3 text-[13px] font-semibold leading-[1.67] text-white/58">
              Eligible contacts may receive a signed email action to say they
              checked on the user or remain concerned. That acknowledgement may
              stop repeated contact alerts, but it cannot unlock the account,
              sign in for the owner, cancel security review, view unrestricted
              private data, or override the minimum 24-hour protection period.
            </p>
            <p className="mt-3 text-[13px] font-semibold leading-[1.67] text-white/58">
              After the minimum period, the owner must complete trusted-device
              biometric verification or an account-specific security email flow
              before destructive controls return.
            </p>
          </PremiumCard>
        </section>

        <section
          id="closure-steps"
          className="scroll-mt-28 border-t border-white/[0.075] pt-14 sm:pt-16"
        >
          <SectionHeading
            eyebrow="4 · Normal closure steps"
            title="A voluntary closure must pass every protected checkpoint."
            body="StayKnown may change the exact interface as security systems evolve, but the owner-verification and safety principles in this sequence remain controlling."
          />

          <div className="mt-7 space-y-3">
            {[
              [
                "Policy review",
                "Open the Account Closure, Privacy, Data Retention, and Terms information, then affirm that the information was reviewed and understood.",
              ],
              [
                "Safety-operation preflight",
                "An active Visit, LIVE, SOS, I’M SAFE delivery, Capture, Threat Alert, offline safety write, or other protected operation may need to finish first.",
              ],
              [
                "Strong owner verification",
                "Complete Protection Shield biometric verification on a trusted device where available. StayKnown never stores biometric material.",
              ],
              [
                "Deliberate confirmation",
                "Type CLOSE or complete another clear confirmation that distinguishes a staged closure from immediate permanent deletion.",
              ],
              [
                "One-use email confirmation",
                "Open a short-lived signed email link. The email also offers actions for an unauthorized request or a decision to keep the account.",
              ],
              [
                "Closure scheduled",
                "Only confirmed requests enter the 30-day recovery period. Until email confirmation, the account remains active.",
              ],
            ].map(([title, body], index) => (
              <div
                key={title}
                className="sk-dark-bevel grid gap-4 rounded-[22px] border border-white/[0.085] bg-white/[0.032] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.065),0_16px_45px_rgba(0,0,0,0.24)] sm:grid-cols-[44px_1fr] sm:items-start sm:p-5"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-[15px] border border-white/[0.11] bg-white/[0.05] text-[11px] font-black text-white/68 shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_10px_25px_rgba(0,0,0,0.24)]">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-[15px] font-black tracking-[-0.02em] text-white">
                    {title}
                  </h3>
                  <p className="mt-2 text-[12.5px] font-semibold leading-[1.62] text-white/55">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          id="recovery-period"
          className="scroll-mt-28 border-t border-white/[0.075] pt-14 sm:pt-16"
        >
          <SectionHeading
            eyebrow="5 · 30-day recovery period"
            title="The account becomes unavailable, not instantly erased."
            body="During the recovery period, the original account identity remains reserved. Ordinary discovery and communication are restricted, while verified reactivation remains possible."
          />

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <PremiumCard>
              <h3 className="text-[17px] font-black tracking-[-0.03em] text-white">
                Service status during closure
              </h3>
              <BulletList
                items={[
                  "The account is removed from ordinary user search and new contact selection.",
                  "New chats, Stories, Visits, LIVE sessions, and SOS initiation are unavailable from the closing account.",
                  "Ordinary presence, typing, and account-bound push activity stop.",
                  "Other accounts on the same device keep their own sessions and push registrations.",
                  "The email and username remain reserved to the original identity.",
                ]}
              />
            </PremiumCard>

            <PremiumCard>
              <h3 className="text-[17px] font-black tracking-[-0.03em] text-white">
                Six owner reminders
              </h3>
              <BulletList
                items={[
                  "Immediately after closure confirmation.",
                  "Day 7.",
                  "Day 14.",
                  "Day 21.",
                  "Three days before permanent closure.",
                  "Twenty-four hours before permanent closure.",
                ]}
              />
              <p className="mt-4 text-[11px] font-semibold leading-[1.55] text-white/42">
                Reminder wording changes as the permanent-closure date
                approaches. Delivery is best effort and may depend on email,
                device, provider, region, and account conditions.
              </p>
            </PremiumCard>
          </div>
        </section>

        <section
          id="relationships"
          className="scroll-mt-28 border-t border-white/[0.075] pt-14 sm:pt-16"
        >
          <SectionHeading
            eyebrow="6 · Chats, contacts, and relationship health"
            title="Other people should understand what changed without receiving private reasons."
            body="StayKnown uses clear unavailable states so contacts and chat participants are not left wondering whether their app is broken. Private closure answers and coercion details are not shown to ordinary contacts."
          />

          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            <PremiumCard>
              <p className="text-[10px] font-black uppercase tracking-[0.19em] text-white/40">
                Chats · first 7 days
              </p>
              <h3 className="mt-3 text-[19px] font-black tracking-[-0.04em] text-white">
                Read-only unavailable notice
              </h3>
              <p className="mt-3 text-[12.5px] font-semibold leading-[1.62] text-white/56">
                Existing messages may remain reviewable. The composer is
                disabled, the avatar may be visually softened, and a premium
                status explains that the account is temporarily unavailable.
              </p>
            </PremiumCard>

            <PremiumCard>
              <p className="text-[10px] font-black uppercase tracking-[0.19em] text-white/40">
                Chats · after 7 days
              </p>
              <h3 className="mt-3 text-[19px] font-black tracking-[-0.04em] text-white">
                Archived, not silently destroyed
              </h3>
              <p className="mt-3 text-[12.5px] font-semibold leading-[1.62] text-white/56">
                The notice moves out of the main chat list. Safety evidence and
                records covered by retention rules are not erased merely to hide
                the relationship change.
              </p>
            </PremiumCard>

            <PremiumCard>
              <p className="text-[10px] font-black uppercase tracking-[0.19em] text-white/40">
                Reactivation
              </p>
              <h3 className="mt-3 text-[19px] font-black tracking-[-0.04em] text-white">
                Normal relationship state returns
              </h3>
              <p className="mt-3 text-[12.5px] font-semibold leading-[1.62] text-white/56">
                Eligible chats, profile visibility, contacts, and relationship
                states may return when the same verified account is restored.
              </p>
            </PremiumCard>
          </div>

          <PremiumCard className="mt-5">
            <h3 className="text-[17px] font-black tracking-[-0.03em] text-white">
              Contact Health and Protection Readiness
            </h3>
            <p className="mt-3 text-[13px] font-semibold leading-[1.67] text-white/58">
              If the closing user was another person&apos;s approved emergency
              contact, guardian, SOS responder, or trusted recovery contact,
              StayKnown may mark that relationship as temporarily unavailable,
              notify the relationship owner, recalculate Protection Readiness,
              and recommend an approved replacement. It does not silently
              present an unavailable person as a healthy protection contact.
            </p>
          </PremiumCard>
        </section>

        <section
          id="data-handling"
          className="scroll-mt-28 border-t border-white/[0.075] pt-14 sm:pt-16"
        >
          <SectionHeading
            eyebrow="7 · Data handling and permanent closure"
            title="Permanent closure removes eligibility for ordinary use, but lawful retention may continue."
            body="StayKnown aims to remove or anonymize eligible public and optional data while protecting records that remain necessary for safety history, consent proof, legal obligations, security, fraud prevention, billing, disputes, or abuse review."
          />

          <div className="mt-7 grid gap-4 lg:grid-cols-2">
            <PremiumCard>
              <h3 className="text-[17px] font-black tracking-[-0.03em] text-white">
                Data that may be removed or anonymized
              </h3>
              <BulletList
                items={[
                  "Public profile visibility and ordinary discoverability.",
                  "Eligible avatar, biography, optional profile, and presentation data.",
                  "Presence, typing, ordinary push registrations, and nonessential preferences.",
                  "Eligible media or account content not subject to a safety, legal, security, or dispute hold.",
                ]}
              />
            </PremiumCard>

            <PremiumCard>
              <h3 className="text-[17px] font-black tracking-[-0.03em] text-white">
                Records that may remain restricted
              </h3>
              <BulletList
                items={[
                  "Contact consent, guardian approval, and relationship authorization evidence.",
                  "Visit, LIVE, SOS, Capture, delivery, and safety-timeline proof.",
                  "Account-closure, reactivation, device-security, fraud, and abuse audit records.",
                  "Payment, subscription, tax, refund, chargeback, and transaction records.",
                  "Records covered by legal hold, preservation request, investigation, or dispute.",
                ]}
              />
            </PremiumCard>
          </div>

          <p className="mt-5 text-[13px] font-semibold leading-[1.7] text-white/54">
            Read the <PolicyLink href="/privacy">Privacy Policy</PolicyLink> and{" "}
            <PolicyLink href="/retention">Data Retention Policy</PolicyLink> for
            broader information about deletion rights, verification,
            safety-history retention, legal holds, security logs, contact
            consent, chat, media, and provider records.
          </p>
        </section>

        <section
          id="reactivation"
          className="scroll-mt-28 border-t border-white/[0.075] pt-14 sm:pt-16"
        >
          <SectionHeading
            eyebrow="8 · Reactivation and identity protection"
            title="Returning restores the same identity; it does not create a second account."
            body="During the recovery period, Sign In and Create Account may intercept the reserved email and offer restoration instead of issuing an ordinary signup flow."
          />

          <div className="mt-7 grid gap-4 lg:grid-cols-2">
            <PremiumCard>
              <h3 className="text-[17px] font-black tracking-[-0.03em] text-white">
                Reactivation choices
              </h3>
              <BulletList
                items={[
                  "Restore my account.",
                  "This was not my request.",
                  "Keep the account closed.",
                  "Contact StayKnown Support when ownership or device evidence needs review.",
                ]}
              />
            </PremiumCard>

            <PremiumCard>
              <h3 className="text-[17px] font-black tracking-[-0.03em] text-white">
                Verification methods
              </h3>
              <BulletList
                items={[
                  "Email ownership and a one-use security link.",
                  "Trusted-device biometric verification where available.",
                  "Trusted-device and account-security evidence.",
                  "Optional recovery-contact confirmation as one risk signal.",
                  "Support or security review for higher-risk recovery attempts.",
                ]}
              />
            </PremiumCard>
          </div>

          <PremiumCard className="mt-5">
            <h3 className="text-[17px] font-black tracking-[-0.03em] text-white">
              A trusted recovery contact cannot take ownership
            </h3>
            <p className="mt-3 text-[13px] font-semibold leading-[1.67] text-white/58">
              A designated recovery contact may confirm that they know the
              claimant, report concern, or help StayKnown evaluate context. They
              cannot receive the owner&apos;s magic link, sign in as the owner,
              change the owner&apos;s email, view private chats, cancel a
              security lock alone, or restore the account without independent
              ownership verification.
            </p>
          </PremiumCard>
        </section>

        <section
          id="notifications"
          className="scroll-mt-28 border-t border-white/[0.075] pt-14 sm:pt-16"
        >
          <SectionHeading
            eyebrow="9 · Notifications and protected links"
            title="Closure and safety notices use controlled channels and signed actions."
            body="Notification availability depends on the user's approved relationships, delivery settings, valid contact details, provider availability, and the exact security state."
          />

          <div className="mt-7 grid gap-4 lg:grid-cols-2">
            <PremiumCard>
              <h3 className="text-[17px] font-black tracking-[-0.03em] text-white">
                Normal closure notices
              </h3>
              <BulletList
                items={[
                  "The owner receives confirmation, reminders, reactivation, and permanent-closure notices.",
                  "Eligible contacts may receive a calm closure-scheduled notice, a restoration notice, and a permanent-closure notice.",
                  "Contacts are not sent the owner's private reasons or safety-question answers.",
                ]}
              />
            </PremiumCard>

            <PremiumCard>
              <h3 className="text-[17px] font-black tracking-[-0.03em] text-white">
                Coercion-risk notices
              </h3>
              <BulletList
                items={[
                  "Eligible approved contacts may receive critical push and branded email alerts.",
                  "Repeated alerts may follow a controlled schedule until a signed email acknowledgement or the protection period ends.",
                  "Location context is limited to authorized safety purpose, available permission, reliability, time, and confidence.",
                  "Push may open the app, while security decisions remain inside signed email or protected web flows.",
                ]}
              />
            </PremiumCard>
          </div>
        </section>

        <section
          id="minors"
          className="scroll-mt-28 border-t border-white/[0.075] pt-14 sm:pt-16"
        >
          <SectionHeading
            eyebrow="10 · Minors, guardians, and vulnerable users"
            title="Higher-risk accounts may require stricter review."
            body="A guardian relationship does not remove the minor's safety rights, and guardian authority does not permit coercion, exploitation, hidden monitoring, or destruction of safety evidence."
          />
          <PremiumCard className="mt-7">
            <BulletList
              items={[
                "Accounts below StayKnown's permitted age remain ineligible for normal account use.",
                "A minor closure may require verified guardian context, while suspected guardian coercion must be handled as a safety concern rather than an automatic approval.",
                "The approved guardian may be considered for recovery or contact alerts only when the relationship is active, unrestricted, and not under safety review.",
                "StayKnown may preserve guardian-consent and minor-safety records where necessary for protection, legal compliance, or abuse prevention.",
              ]}
            />
          </PremiumCard>
        </section>

        <section
          id="acknowledgement"
          className="scroll-mt-28 border-t border-white/[0.075] pt-14 sm:pt-16"
        >
          <SectionHeading
            eyebrow="11 · Policy acknowledgement"
            title="The app may require the policies to be opened before closure continues."
            body="StayKnown may record which policy version was presented, when relevant policy links were opened, and when the owner affirmed their understanding. This does not prove that every word was read, but it records that the information was presented and affirmatively acknowledged."
          />

          <PremiumCard className="mt-7 border-[#92f3cf]/[0.15]">
            <p className="text-[13px] font-extrabold leading-[1.7] text-white/72">
              Suggested acknowledgement: “I confirm that I reviewed and
              understand the StayKnown Account Closure, Privacy, Data Retention,
              and Terms information, including the 30-day recovery period and
              the possibility that some safety, consent, security, billing,
              legal, or abuse-prevention records may remain.”
            </p>
          </PremiumCard>
        </section>

        <section
          id="support"
          className="scroll-mt-28 border-t border-white/[0.075] pt-14 sm:pt-16"
        >
          <SectionHeading
            eyebrow="12 · Support, unauthorized requests, and policy changes"
            title="Report a closure request you did not start."
            body="StayKnown may require identity verification before discussing private account details, changing closure state, releasing retained data, or restoring account access."
          />

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <PremiumCard>
              <h3 className="text-[17px] font-black tracking-[-0.03em] text-white">
                Get support
              </h3>
              <p className="mt-3 text-[13px] font-semibold leading-[1.67] text-white/58">
                Use the Help Center or Submit a Request page for closure,
                reactivation, unauthorized-attempt, privacy, retention, account
                ownership, or security concerns.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="/help-center"
                  className="sk-white-bevel inline-flex min-h-11 items-center justify-center rounded-[15px] border border-white/85 bg-white px-4 text-[11px] font-black !text-black shadow-[0_14px_35px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,1),inset_0_-4px_11px_rgba(0,0,0,0.07)] transition hover:-translate-y-0.5 hover:!text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
                >
                  Help Center
                </a>
                <a
                  href="/submit-request"
                  className="inline-flex min-h-11 items-center justify-center rounded-[15px] border border-white/[0.13] bg-white/[0.055] px-4 text-[11px] font-black text-white/82 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_35px_rgba(0,0,0,0.24)] transition hover:-translate-y-0.5 hover:bg-white/[0.085] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  Submit a Request
                </a>
              </div>
            </PremiumCard>

            <PremiumCard>
              <h3 className="text-[17px] font-black tracking-[-0.03em] text-white">
                Policy changes
              </h3>
              <p className="mt-3 text-[13px] font-semibold leading-[1.67] text-white/58">
                StayKnown may update this policy for security improvements,
                closure or recovery features, legal requirements, provider
                changes, safety findings, or operational needs. Material changes
                may be communicated through the app, website, email, push, or
                another reasonable method.
              </p>
            </PremiumCard>
          </div>

          <p className="mt-6 text-[11px] font-semibold leading-[1.58] text-white/35">
            This policy is product and operational guidance. Rights and
            retention requirements may vary by jurisdiction, legal hold, safety
            event, account status, and applicable law. StayKnown should obtain
            qualified legal review before relying on this page for regulatory,
            litigation, law-enforcement, or app-store representations.
          </p>
        </section>
      </div>

      <footer className="border-t border-white/[0.075] bg-black/35">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-5 lg:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="sk-logo-bevel flex h-11 w-11 items-center justify-center rounded-[16px] border border-white/[0.14] bg-white/[0.055] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_14px_36px_rgba(0,0,0,0.32)]">
                  <Image
                    src="/6logo.png"
                    alt="StayKnown"
                    width={23}
                    height={23}
                  />
                </span>
                <div>
                  <p className="text-[12px] font-black tracking-[0.22em] text-white">
                    STAYKNOWN
                  </p>
                  <p className="mt-1 text-[9px] font-bold text-white/36">
                    A 6 Clement Joshua service™
                  </p>
                </div>
              </div>

              <p className="mt-5 max-w-2xl text-[12px] font-semibold leading-[1.65] text-white/43">
                Consent-first safety for trusted contacts, Visits, LIVE sharing,
                SOS, I’M SAFE, secure communication, account protection, and
                responsible recovery.
              </p>
            </div>

            <GooglePlayButton />
          </div>

          <div className="mt-8 border-t border-white/[0.07] pt-6">
            <nav
              aria-label="StayKnown policy links"
              className="flex flex-wrap gap-x-5 gap-y-3"
            >
              {policyLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[10px] font-extrabold text-white/42 transition hover:text-white/78 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="mt-6 flex flex-col gap-2 border-t border-white/[0.055] pt-5 text-[9px] font-bold tracking-[0.05em] text-white/27 sm:flex-row sm:items-center sm:justify-between">
              <span>© {new Date().getFullYear()} StayKnown™</span>
              <a
                href="#top"
                className="w-fit text-white/34 transition hover:text-white/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              >
                Back to top ↑
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
