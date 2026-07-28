// app/account-closure/contact-action/page.tsx
// StayKnown Secure Account Closure & Recovery
//
// Protected contact-response gate for signed safety-notice actions.
//
// SECURITY RULES
// - GET/page load never consumes or mutates the token.
// - The raw token is never rendered as visible text.
// - A deliberate POST to /api/account-closure/contact-action is required.
// - Each one-use token is restricted to the purpose embedded in its email link.
// - A contact response never signs the contact into another person's account.
// - A contact response never unlocks, reactivates, closes, or controls the
//   protected account.
// - Email scanners and link-preview bots may open this page safely.

import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import StayKnownActionMenu from "@/components/StayKnownActionMenu";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.stayknown.app";

const SUPPORT_EMAIL = "support@stay-known.com";

type ContactPurpose = "acknowledge" | "concern";

type SearchParams = {
  purpose?: string | string[];
  token?: string | string[];
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

type ActionPresentation = {
  purpose: ContactPurpose;
  eyebrow: string;
  title: string;
  summary: string;
  primaryLabel: string;
  primaryTone: "mint" | "danger";
  statusLabel: string;
  icon: "received" | "concern";
  guidanceTitle: string;
  guidance: string[];
  acknowledgementText: string;
};

export const metadata: Metadata = {
  title: "Safety Notice Response | StayKnown",
  description:
    "Securely acknowledge a StayKnown safety notice or report concern.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  },
  referrer: "no-referrer",
  alternates: {
    canonical: "/account-closure/contact-action",
  },
  openGraph: {
    title: "StayKnown Protected Safety Response",
    description:
      "A protected contact-response page for a StayKnown safety notice.",
    type: "website",
    url: "/account-closure/contact-action",
    siteName: "StayKnown",
  },
};

function cleanOne(value: string | string[] | undefined): string {
  if (typeof value === "string") return value.trim();

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0].trim();
  }

  return "";
}

function parsePurpose(value: string): ContactPurpose | null {
  const normalized = value.trim().toLowerCase();

  if (normalized === "acknowledge") return "acknowledge";
  if (normalized === "concern") return "concern";

  return null;
}

function tokenLooksSafe(value: string): boolean {
  return /^[A-Za-z0-9_-]{32,160}$/.test(value);
}

function presentationFor(purpose: ContactPurpose): ActionPresentation {
  switch (purpose) {
    case "acknowledge":
      return {
        purpose,
        eyebrow: "Safety notice acknowledgement",
        title: "Confirm that you received this notice?",
        summary:
          "This records only that the protected StayKnown safety notice reached you. It stops eligible repeated alerts for this specific notice after the backend verifies the one-use action.",
        primaryLabel: "I received this safety notice",
        primaryTone: "mint",
        statusLabel: "Response not recorded",
        icon: "received",
        guidanceTitle: "What this acknowledgement means",
        guidance: [
          "It records receipt of this specific safety notice.",
          "It may stop repeated alerts connected to this same protected event.",
          "It does not confirm that the person is safe.",
          "It does not unlock, reactivate, close, sign in to, or control their StayKnown account.",
          "It does not reveal their chats, location history, contacts, credentials, or private account information.",
          "You should still use a safe and appropriate contact method when a welfare check is needed.",
        ],
        acknowledgementText:
          "I understand that this records receipt only. It does not confirm the person is safe and does not give me access to or control over their StayKnown account.",
      };

    case "concern":
      return {
        purpose,
        eyebrow: "Safety concern response",
        title: "Record that you are concerned?",
        summary:
          "Use this when the notice gives you a genuine reason to be concerned about the person's safety. StayKnown will preserve the concern as protected safety evidence and route it through the applicable response flow.",
        primaryLabel: "I am concerned about their safety",
        primaryTone: "danger",
        statusLabel: "Concern not recorded",
        icon: "concern",
        guidanceTitle: "Respond without increasing risk",
        guidance: [
          "Use a private and appropriate channel when checking on the person.",
          "Do not confront a suspected coercer or expose hidden safety planning.",
          "Do not request passwords, verification codes, device access, or account credentials.",
          "Do not forward the signed security email or share this one-use action.",
          "A concern report does not unlock, reactivate, close, sign in to, or control the person's account.",
          "Contact the appropriate local emergency authority when there is immediate danger.",
        ],
        acknowledgementText:
          "I understand that this records a safety concern only. I will not request account credentials, expose private safety planning, or take action that could increase danger.",
      };
  }
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
        d="M12 3.2 19 6v5.45c0 4.5-2.85 8.5-7 9.85-4.15-1.35-7-5.35-7-9.85V6l7-2.8Z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
      <path
        d="m8.8 12.1 2.15 2.15 4.55-5"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReceivedIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="4"
        y="5"
        width="16"
        height="14"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.65"
      />
      <path
        d="m7.3 9 4.7 3.7L16.7 9"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m9.2 15.1 1.5 1.5 3.2-3.3"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ConcernIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 3.3 21 19H3L12 3.3Z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
      <path
        d="M12 9v4.5"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.7" r="0.9" fill="currentColor" />
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
      <rect
        x="5.2"
        y="10"
        width="13.6"
        height="10"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.65"
      />
      <path
        d="M8.2 10V7.7a3.8 3.8 0 1 1 7.6 0V10"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
      <path
        d="M12 14.1v2.2"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
    </svg>
  );
}

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

function DecisionIcon({ kind }: { kind: ActionPresentation["icon"] }) {
  const Icon = kind === "concern" ? ConcernIcon : ReceivedIcon;

  const toneClass =
    kind === "concern"
      ? "border-rose-200/20 bg-rose-300/[0.07] text-rose-100"
      : "border-[#92f3cf]/20 bg-[#92f3cf]/[0.08] text-[#b8ffe5]";

  return (
    <div className="relative flex h-[92px] w-[92px] items-center justify-center">
      <div className="absolute inset-0 rounded-[29px] border border-white/[0.13] bg-white/[0.045] shadow-[0_0_65px_rgba(146,243,207,0.10)]" />
      <div className="absolute inset-[7px] rounded-[24px] border border-white/[0.14] bg-[linear-gradient(145deg,rgba(255,255,255,0.15),rgba(255,255,255,0.035)_58%,rgba(0,0,0,0.28))] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-12px_28px_rgba(0,0,0,0.28),0_22px_50px_rgba(0,0,0,0.38)]" />
      <span
        className={`relative z-[2] flex h-12 w-12 items-center justify-center rounded-[17px] border shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_12px_30px_rgba(0,0,0,0.25)] ${toneClass}`}
      >
        <Icon className="h-6 w-6" />
      </span>
    </div>
  );
}

function StatusPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-7 items-center rounded-full border border-white/[0.12] bg-white/[0.065] px-3 text-[9px] font-black uppercase tracking-[0.17em] text-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_22px_rgba(0,0,0,0.22)]">
      {children}
    </span>
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
      className={`sk-dark-bevel rounded-[27px] border border-white/[0.095] bg-[linear-gradient(145deg,rgba(255,255,255,0.078),rgba(255,255,255,0.026)_54%,rgba(0,0,0,0.18))] p-5 shadow-[0_25px_72px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.085)] backdrop-blur-xl sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

function GooglePlayButton() {
  return (
    <a
      href={GOOGLE_PLAY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="sk-white-bevel group inline-flex min-h-12 items-center justify-center gap-3 rounded-[17px] border border-white/90 bg-white px-5 !text-black shadow-[0_18px_50px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,1),inset_0_-5px_13px_rgba(0,0,0,0.07)] transition duration-200 hover:-translate-y-0.5 hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 active:translate-y-0 active:scale-[0.985]"
      aria-label="Get StayKnown on Google Play"
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

function PolicyLinks() {
  const links = [
    ["Account Closure & Recovery", "/account-closure"],
    ["Privacy Policy", "/privacy"],
    ["Data Retention", "/retention"],
    ["Terms of Service", "/terms"],
    ["Help Center", "/help-center"],
    ["Contact Support", "/submit-request"],
  ] as const;

  return (
    <nav
      aria-label="Account safety policies"
      className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center"
    >
      {links.map(([label, href]) => (
        <a
          key={href}
          href={href}
          className="text-[10px] font-black text-white/48 underline decoration-white/15 underline-offset-4 transition hover:text-white/80 hover:decoration-white/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
        >
          {label}
        </a>
      ))}
    </nav>
  );
}

function PrimaryButton({
  tone,
  children,
}: {
  tone: ActionPresentation["primaryTone"];
  children: ReactNode;
}) {
  const className =
    tone === "danger"
      ? "border-rose-200/80 bg-[linear-gradient(145deg,#fff8f8,#ffdede)] text-[#8d1717] shadow-[inset_0_1px_0_white,inset_0_-8px_20px_rgba(120,0,0,0.12),0_20px_46px_rgba(0,0,0,0.34)]"
      : "border-[#c9f6e5] bg-[linear-gradient(145deg,#effff9,#bcefdc)] text-[#065f4b] shadow-[inset_0_1px_0_white,inset_0_-8px_20px_rgba(0,90,65,0.12),0_20px_46px_rgba(0,0,0,0.34)]";

  return (
    <button
      type="submit"
      className={`group relative inline-flex min-h-[54px] w-full touch-manipulation items-center justify-center overflow-hidden rounded-[19px] border px-5 py-3.5 text-[13px] font-black tracking-[-0.015em] outline-none transition duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050709] active:translate-y-0 active:scale-[0.985] ${className}`}
    >
      <span className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/65 to-transparent" />
      <span>{children}</span>
      <span
        aria-hidden="true"
        className="ml-3 text-[16px] transition duration-200 group-hover:translate-x-0.5"
      >
        →
      </span>
    </button>
  );
}

function ResponseForm({
  action,
  token,
}: {
  action: ActionPresentation;
  token: string;
}) {
  return (
    <form
      method="post"
      action="/api/account-closure/contact-action"
      className="mt-7"
    >
      <input type="hidden" name="purpose" value={action.purpose} />
      <input type="hidden" name="token" value={token} />
      <input
        type="hidden"
        name="source"
        value="account_closure_contact_email_action_page"
      />

      <label className="sk-dark-bevel mb-4 flex cursor-pointer items-start gap-3 rounded-[20px] border border-white/[0.11] bg-white/[0.038] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.075),0_14px_35px_rgba(0,0,0,0.24)]">
        <input
          type="checkbox"
          name="contact_response_acknowledged"
          value="true"
          required
          className="mt-0.5 h-5 w-5 shrink-0 accent-[#92f3cf]"
        />

        <span className="text-left text-[11.5px] font-semibold leading-[1.62] text-white/62">
          {action.acknowledgementText}
        </span>
      </label>

      <PrimaryButton tone={action.primaryTone}>
        {action.primaryLabel}
      </PrimaryButton>

      <p className="mt-3 text-center text-[10px] font-semibold leading-[1.55] text-white/36">
        Nothing is recorded until the protected backend verifies and consumes
        this one-use token.
      </p>
    </form>
  );
}

function InvalidLinkPage({ reason }: { reason: "missing" | "invalid" }) {
  return (
    <PageShell>
      <div className="mx-auto w-full max-w-2xl">
        <PremiumCard className="text-center">
          <div className="mx-auto flex h-[78px] w-[78px] items-center justify-center rounded-[25px] border border-white/[0.13] bg-white/[0.045] text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_22px_55px_rgba(0,0,0,0.35)]">
            <LockIcon className="h-8 w-8" />
          </div>

          <div className="mt-5">
            <StatusPill>
              {reason === "missing" ? "Incomplete link" : "Invalid link"}
            </StatusPill>
          </div>

          <h1 className="mt-5 text-[34px] font-black leading-[0.98] tracking-[-0.06em] text-white sm:text-[44px]">
            This safety-response link cannot be used.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-[13px] font-semibold leading-[1.75] text-white/58 sm:text-[14px]">
            The link may be incomplete, altered, expired, or no longer valid.
            Opening this page did not acknowledge the notice, report concern,
            unlock an account, or make another account change.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <a
              href="/account-closure"
              className="sk-white-bevel inline-flex min-h-12 items-center justify-center rounded-[18px] border border-white/90 bg-white px-5 text-[12px] font-black text-black shadow-[inset_0_1px_0_white,inset_0_-7px_18px_rgba(0,0,0,0.10),0_16px_36px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
            >
              Review safety policy
            </a>

            <a
              href="/submit-request"
              className="sk-dark-bevel inline-flex min-h-12 items-center justify-center rounded-[18px] border border-white/[0.13] bg-white/[0.045] px-5 text-[12px] font-black text-white/76 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_15px_34px_rgba(0,0,0,0.25)] transition hover:bg-white/[0.075] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
            >
              Contact StayKnown Support
            </a>
          </div>

          <p className="mt-6 text-[10.5px] font-semibold leading-[1.6] text-white/38">
            Support: {SUPPORT_EMAIL}
          </p>
        </PremiumCard>
      </div>
    </PageShell>
  );
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#050709] text-white">
      <style>{`
        html { color-scheme: dark; }
        body { background: #050709; }

        .sk-dark-bevel,
        .sk-white-bevel,
        .sk-logo-bevel {
          position: relative;
          isolation: isolate;
        }

        .sk-dark-bevel::after,
        .sk-white-bevel::after,
        .sk-logo-bevel::after {
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
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div aria-hidden="true" className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-12%,rgba(146,243,207,0.12),transparent_35%),radial-gradient(circle_at_10%_32%,rgba(255,255,255,0.05),transparent_25%),radial-gradient(circle_at_90%_28%,rgba(255,255,255,0.045),transparent_24%),linear-gradient(180deg,#0b1012_0%,#050709_46%,#020303_100%)]" />
        <div className="absolute -left-32 top-32 h-80 w-80 rounded-full bg-[#92f3cf]/[0.035] blur-[110px]" />
        <div className="absolute -right-32 top-20 h-96 w-96 rounded-full bg-white/[0.025] blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.045] [background-image:linear-gradient(rgba(255,255,255,.17)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.17)_1px,transparent_1px)] [background-size:46px_46px] [mask-image:linear-gradient(to_bottom,black,transparent_76%)]" />
      </div>

      <header className="relative z-40 border-b border-white/[0.075] bg-[#050709]/88 backdrop-blur-2xl">
        <div className="mx-auto flex min-h-[74px] max-w-6xl items-center justify-between gap-3 px-4 sm:px-5 lg:px-6">
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
                Protected safety response
              </span>
            </span>
          </a>

          <div className="sk-menu-wrap">
            <StayKnownActionMenu />
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-74px)] max-w-6xl items-center px-4 py-12 sm:px-5 sm:py-16 lg:px-6">
        {children}
      </div>
    </main>
  );
}

export default async function AccountClosureContactActionPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const purposeRaw = cleanOne(params.purpose);
  const token = cleanOne(params.token);

  if (!purposeRaw || !token) {
    return <InvalidLinkPage reason="missing" />;
  }

  const purpose = parsePurpose(purposeRaw);

  if (!purpose || !tokenLooksSafe(token)) {
    return <InvalidLinkPage reason="invalid" />;
  }

  const action = presentationFor(purpose);
  const alternatePurpose =
    purpose === "acknowledge" ? "concern" : "acknowledge";

  return (
    <PageShell>
      <div className="mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)] lg:items-start">
        <PremiumCard className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <StatusPill>{action.statusLabel}</StatusPill>

            <span className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.16em] text-[#92f3cf]/65">
              <LockIcon className="h-4 w-4" />
              One-use contact action
            </span>
          </div>

          <div className="mt-7 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-start">
            <DecisionIcon kind={action.icon} />

            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#92f3cf]/70">
                {action.eyebrow}
              </p>

              <h1 className="mt-3 text-[36px] font-black leading-[0.96] tracking-[-0.065em] text-white sm:text-[46px]">
                {action.title}
              </h1>

              <p className="mt-5 text-[13px] font-semibold leading-[1.72] text-white/60 sm:text-[14px]">
                {action.summary}
              </p>
            </div>
          </div>

          <div className="mt-7 rounded-[22px] border border-[#92f3cf]/[0.14] bg-[#92f3cf]/[0.045] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
            <div className="flex items-start gap-3">
              <ShieldIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#b8ffe5]" />

              <div>
                <p className="text-[11px] font-black text-white">
                  Opening this page changed nothing
                </p>

                <p className="mt-1.5 text-[11px] font-semibold leading-[1.62] text-white/52">
                  StayKnown does not consume contact-response tokens on page
                  load. This prevents email scanners, link previews, accidental
                  taps, and forwarded previews from recording a response.
                </p>
              </div>
            </div>
          </div>

          <ResponseForm action={action} token={token} />
        </PremiumCard>

        <div className="space-y-5">
          <PremiumCard>
            <h2 className="text-[16px] font-black tracking-[-0.03em] text-white">
              {action.guidanceTitle}
            </h2>

            <ul className="mt-4 space-y-3">
              {action.guidance.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-[12px] font-semibold leading-[1.62] text-white/57"
                >
                  <span
                    className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full shadow-[0_0_15px_rgba(146,243,207,0.32)] ${
                      action.primaryTone === "danger"
                        ? "bg-rose-200/90"
                        : "bg-[#92f3cf]/80"
                    }`}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </PremiumCard>

          <PremiumCard className="border-white/[0.075]">
            <h2 className="text-[15px] font-black tracking-[-0.025em] text-white">
              Need the other response?
            </h2>

            <p className="mt-3 text-[11.5px] font-semibold leading-[1.65] text-white/52">
              This one-use link is restricted to{" "}
              <strong className="text-white/82">
                {purpose === "acknowledge"
                  ? "receipt acknowledgement"
                  : "reporting concern"}
              </strong>
              . To choose{" "}
              <strong className="text-white/82">
                {alternatePurpose === "acknowledge"
                  ? "I received this safety notice"
                  : "I am concerned about their safety"}
              </strong>
              , return to the original StayKnown email and use its separate
              signed button.
            </p>

            <div className="mt-4 rounded-[18px] border border-white/[0.10] bg-white/[0.035] p-4">
              <p className="text-[10.5px] font-black uppercase tracking-[0.13em] text-white/55">
                No account authority
              </p>

              <p className="mt-2 text-[11px] font-semibold leading-[1.6] text-white/48">
                Neither contact response can unlock, restore, close, sign in to,
                or control the protected account. Trusted contacts may assist,
                but only the verified account owner can complete owner recovery.
              </p>
            </div>

            <a
              href="/submit-request"
              className="sk-dark-bevel mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-[16px] border border-white/[0.12] bg-white/[0.045] px-4 text-[11px] font-black text-white/73 shadow-[inset_0_1px_0_rgba(255,255,255,0.075),0_13px_30px_rgba(0,0,0,0.24)] transition hover:bg-white/[0.075] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
            >
              Contact StayKnown Support
            </a>

            <p className="mt-4 text-center text-[10px] font-semibold text-white/35">
              {SUPPORT_EMAIL}
            </p>
          </PremiumCard>
        </div>

        <footer className="lg:col-span-2">
          <div className="border-t border-white/[0.075] pt-7 text-center">
            <GooglePlayButton />

            <div className="mt-5">
              <PolicyLinks />
            </div>

            <p className="mt-5 text-[10px] font-semibold leading-[1.6] text-white/34">
              StayKnown does not replace police, ambulance, fire service,
              medical care, or another official emergency authority.
            </p>

            <p className="mt-2 text-[10px] font-black tracking-[0.08em] text-white/28">
              STAYKNOWN™ · A 6 CLEMENT JOSHUA SERVICE™
            </p>
          </div>
        </footer>
      </div>
    </PageShell>
  );
}
