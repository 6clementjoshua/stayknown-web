// app/account-closure/owner-unlock/action/page.tsx
// StayKnown Secure Account Closure & Recovery
//
// Protected Protection Lock owner-unlock decision page.
//
// SECURITY RULES
// - GET/page load never consumes or mutates the token.
// - The raw token is never rendered as visible text.
// - A deliberate POST to /api/account-closure/owner-unlock/action is required.
// - The owner must acknowledge the safety consequences and type UNLOCK.
// - The backend API and atomic SQL RPC remain authoritative for token hash,
//   purpose, expiry, one-use enforcement, owner identity, lock deadline,
//   request state, safe cancellation and idempotency.
// - Email scanners and link-preview bots may open this page safely.
// - This page never signs the owner in and never releases the lock itself.

import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import StayKnownActionMenu from "@/components/StayKnownActionMenu";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.stayknown.app";

const SUPPORT_EMAIL = "support@stay-known.com";
const REQUIRED_CONFIRMATION = "UNLOCK";

type SearchParams = {
  token?: string | string[];
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export const metadata: Metadata = {
  title: "Unlock Protected StayKnown Account | StayKnown",
  description:
    "Securely review and confirm release of a StayKnown Protection Lock.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  },
  referrer: "no-referrer",
  alternates: {
    canonical: "/account-closure/owner-unlock/action",
  },
  openGraph: {
    title: "StayKnown Protection Lock Recovery",
    description:
      "A protected owner-verification page for a StayKnown Protection Lock.",
    type: "website",
    url: "/account-closure/owner-unlock/action",
    siteName: "StayKnown",
  },
};

function cleanOne(value: string | string[] | undefined): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0].trim();
  }

  return "";
}

function tokenLooksSafe(value: string): boolean {
  return /^[A-Za-z0-9_-]{32,160}$/.test(value);
}

function escapeText(value: string): string {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

function UnlockIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M5.4 8.5A7.6 7.6 0 1 1 4.9 16"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
      <path
        d="M4.5 4.9v4.8h4.8"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 8.2v4.1l2.7 1.7"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
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

function IdentityIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.65" />
      <path
        d="M5.5 19c.8-3.2 3.1-5 6.5-5s5.7 1.8 6.5 5"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
      <path
        d="m17.2 6.1 1.2 1.2 2.2-2.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
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

function StatusPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-7 items-center rounded-full border border-[#92f3cf]/20 bg-[#92f3cf]/[0.075] px-3 text-[9px] font-black uppercase tracking-[0.17em] text-[#c8ffeb] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_22px_rgba(0,0,0,0.22)]">
      {children}
    </span>
  );
}

function UnlockEmblem() {
  return (
    <div className="relative flex h-[96px] w-[96px] items-center justify-center">
      <div className="absolute inset-0 rounded-[30px] border border-white/[0.13] bg-white/[0.045] shadow-[0_0_68px_rgba(146,243,207,0.12)]" />
      <div className="absolute inset-[7px] rounded-[25px] border border-white/[0.14] bg-[linear-gradient(145deg,rgba(255,255,255,0.15),rgba(255,255,255,0.035)_58%,rgba(0,0,0,0.28))] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),inset_0_-12px_28px_rgba(0,0,0,0.28),0_22px_50px_rgba(0,0,0,0.38)]" />
      <span className="relative z-[2] flex h-[52px] w-[52px] items-center justify-center rounded-[18px] border border-[#92f3cf]/25 bg-[#92f3cf]/[0.085] text-[#c8ffeb] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_12px_30px_rgba(0,0,0,0.25)]">
        <UnlockIcon className="h-7 w-7" />
      </span>
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
      aria-label="Account recovery policies"
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

function ProtectionPoint({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="sk-dark-bevel rounded-[21px] border border-white/[0.095] bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_14px_36px_rgba(0,0,0,0.24)]">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] border border-[#92f3cf]/[0.18] bg-[#92f3cf]/[0.065] text-[#b8ffe5] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_24px_rgba(0,0,0,0.23)]">
          {icon}
        </span>

        <div>
          <p className="text-[11.5px] font-black text-white">{title}</p>

          <p className="mt-1.5 text-[11px] font-semibold leading-[1.62] text-white/52">
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}

function ConfirmationCheckbox({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  return (
    <label className="sk-dark-bevel flex cursor-pointer items-start gap-3 rounded-[20px] border border-white/[0.11] bg-white/[0.038] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.075),0_14px_35px_rgba(0,0,0,0.24)]">
      <input
        type="checkbox"
        name={name}
        value="true"
        required
        className="mt-0.5 h-5 w-5 shrink-0 accent-[#92f3cf]"
      />

      <span className="text-left text-[11.5px] font-semibold leading-[1.62] text-white/62">
        {children}
      </span>
    </label>
  );
}

function OwnerUnlockForm({ token }: { token: string }) {
  return (
    <form
      method="post"
      action="/api/account-closure/owner-unlock/action"
      className="mt-7"
    >
      <input type="hidden" name="token" value={token} />

      <input
        type="hidden"
        name="source"
        value="account_closure_owner_unlock_email_action_page"
      />

      <div className="space-y-3">
        <ConfirmationCheckbox name="owner_unlock_acknowledged">
          I understand that this asks StayKnown to release the{" "}
          <strong className="text-white/88">
            active Protection Lock on my own account
          </strong>{" "}
          only after the protected backend verifies this one-use owner action.
        </ConfirmationCheckbox>

        <ConfirmationCheckbox name="protected_access_acknowledged">
          I understand that unlocking cancels the unsafe closure attempt and
          restores ordinary access, but does not erase required safety evidence,
          transfer account control, or create a new account.
        </ConfirmationCheckbox>
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.16em] text-white/52">
          Type {REQUIRED_CONFIRMATION} to continue
        </span>

        <input
          type="text"
          name="typed_confirmation"
          required
          minLength={6}
          maxLength={6}
          pattern={REQUIRED_CONFIRMATION}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          inputMode="text"
          placeholder={REQUIRED_CONFIRMATION}
          aria-describedby="unlock-confirmation-help"
          className="sk-dark-bevel h-[54px] w-full rounded-[18px] border border-white/[0.12] bg-white/[0.045] px-4 text-[15px] font-black uppercase tracking-[0.18em] text-white outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.075),0_14px_35px_rgba(0,0,0,0.24)] placeholder:text-white/22 focus:border-[#92f3cf]/45 focus:ring-2 focus:ring-[#92f3cf]/20"
        />

        <span
          id="unlock-confirmation-help"
          className="mt-2 block text-[10px] font-semibold leading-[1.55] text-white/36"
        >
          The protected backend independently verifies this value, the one-use
          token, the owner identity, the completed 24-hour lock period, the
          original safety request, and current account state.
        </span>
      </label>

      <button
        type="submit"
        className="group relative mt-5 inline-flex min-h-[56px] w-full touch-manipulation items-center justify-center overflow-hidden rounded-[19px] border border-[#c9f6e5] bg-[linear-gradient(145deg,#effff9,#bcefdc)] px-5 py-3.5 text-[13px] font-black tracking-[-0.015em] text-[#065f4b] shadow-[inset_0_1px_0_white,inset_0_-8px_20px_rgba(0,90,65,0.12),0_20px_46px_rgba(0,0,0,0.34)] outline-none transition duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050709] active:translate-y-0 active:scale-[0.985]"
      >
        <span className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />

        <UnlockIcon className="mr-3 h-5 w-5" />

        <span>Unlock my protected StayKnown account</span>

        <span
          aria-hidden="true"
          className="ml-3 text-[16px] transition duration-200 group-hover:translate-x-0.5"
        >
          →
        </span>
      </button>

      <p className="mt-3 text-center text-[10px] font-semibold leading-[1.55] text-white/36">
        The Protection Lock remains active until the protected backend verifies
        and consumes this one-use token in one atomic transaction.
      </p>
    </form>
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-12%,rgba(146,243,207,0.13),transparent_35%),radial-gradient(circle_at_10%_32%,rgba(255,255,255,0.05),transparent_25%),radial-gradient(circle_at_90%_28%,rgba(255,255,255,0.045),transparent_24%),linear-gradient(180deg,#0b1012_0%,#050709_46%,#020303_100%)]" />
        <div className="absolute -left-32 top-32 h-80 w-80 rounded-full bg-[#92f3cf]/[0.04] blur-[110px]" />
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
                Protection Lock recovery
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

function InvalidLinkPage({ reason }: { reason: "missing" | "invalid" }) {
  return (
    <PageShell>
      <div className="mx-auto w-full max-w-2xl">
        <PremiumCard className="text-center">
          <div className="mx-auto flex h-[80px] w-[80px] items-center justify-center rounded-[26px] border border-white/[0.13] bg-white/[0.045] text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_22px_55px_rgba(0,0,0,0.35)]">
            <LockIcon className="h-8 w-8" />
          </div>

          <div className="mt-5">
            <span className="inline-flex min-h-7 items-center rounded-full border border-white/[0.12] bg-white/[0.06] px-3 text-[9px] font-black uppercase tracking-[0.17em] text-white/65">
              {reason === "missing"
                ? "Incomplete unlock link"
                : "Invalid unlock link"}
            </span>
          </div>

          <h1 className="mt-5 text-[34px] font-black leading-[0.98] tracking-[-0.06em] text-white sm:text-[44px]">
            This protected owner-unlock link cannot be used.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-[13px] font-semibold leading-[1.75] text-white/58 sm:text-[14px]">
            The link may be incomplete, altered, expired, revoked, or no longer
            valid. Opening this page did not release the Protection Lock, cancel
            the safety restriction, sign anyone in, or make another account
            change.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <a
              href="/account-closure"
              className="sk-white-bevel inline-flex min-h-12 items-center justify-center rounded-[18px] border border-white/90 bg-white px-5 text-[12px] font-black text-black shadow-[inset_0_1px_0_white,inset_0_-7px_18px_rgba(0,0,0,0.10),0_16px_36px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45"
            >
              Review protection policy
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

export default async function AccountClosureOwnerUnlockActionPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const token = escapeText(cleanOne(params.token));

  if (!token) {
    return <InvalidLinkPage reason="missing" />;
  }

  if (!tokenLooksSafe(token)) {
    return <InvalidLinkPage reason="invalid" />;
  }

  return (
    <PageShell>
      <div className="mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(300px,0.92fr)] lg:items-start">
        <PremiumCard className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <StatusPill>Protection Lock still active</StatusPill>

            <span className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.16em] text-[#92f3cf]/65">
              <LockIcon className="h-4 w-4" />
              One-use owner action
            </span>
          </div>

          <div className="mt-7 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-start">
            <UnlockEmblem />

            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#92f3cf]/70">
                Protection Lock recovery
              </p>

              <h1 className="mt-3 text-[36px] font-black leading-[0.96] tracking-[-0.065em] text-white sm:text-[46px]">
                Release your StayKnown Protection Lock?
              </h1>

              <p className="mt-5 text-[13px] font-semibold leading-[1.72] text-white/60 sm:text-[14px]">
                This action asks StayKnown to verify that the account owner is
                acting freely after the 24-hour protection period. A successful
                confirmation cancels the unsafe closure attempt and restores
                ordinary access to the same account.
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
                  StayKnown does not consume owner-unlock tokens on page load.
                  Email scanners, link previews, accidental taps, and forwarded
                  previews cannot release the Protection Lock.
                </p>
              </div>
            </div>
          </div>

          <OwnerUnlockForm token={token} />
        </PremiumCard>

        <div className="space-y-5">
          <PremiumCard>
            <h2 className="text-[16px] font-black tracking-[-0.03em] text-white">
              What unlocking means
            </h2>

            <div className="mt-4 space-y-3">
              <ProtectionPoint
                icon={<IdentityIcon className="h-5 w-5" />}
                title="Same protected account"
                body="StayKnown restores ordinary access to the same owner account. No duplicate account, new identity, or transfer of control is created."
              />

              <ProtectionPoint
                icon={<UnlockIcon className="h-5 w-5" />}
                title="Ordinary access returns"
                body="Eligible account controls, chat participation and approved-contact flows can return after the authoritative unlock transaction. Existing history remains preserved."
              />

              <ProtectionPoint
                icon={<ShieldIcon className="h-5 w-5" />}
                title="Safety remains authoritative"
                body="An expired or used token, identity mismatch, legal hold, changed request state or another security restriction can still refuse the unlock."
              />
            </div>
          </PremiumCard>

          <PremiumCard className="border-white/[0.075]">
            <h2 className="text-[15px] font-black tracking-[-0.025em] text-white">
              What unlocking does not erase
            </h2>

            <ul className="mt-4 space-y-3">
              {[
                "Required Protection Lock, consent and account-closure audit evidence.",
                "Eligible safety records preserved under StayKnown policy.",
                "Evidence required for abuse prevention, legal obligations, security review or dispute handling.",
                "Any separate legal hold or unrelated security restriction that remains authoritative.",
              ].map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-[11.5px] font-semibold leading-[1.62] text-white/54"
                >
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#92f3cf]/80 shadow-[0_0_15px_rgba(146,243,207,0.32)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 rounded-[18px] border border-white/[0.10] bg-white/[0.035] p-4">
              <p className="text-[10.5px] font-black uppercase tracking-[0.13em] text-white/55">
                Account owner only
              </p>

              <p className="mt-2 text-[11px] font-semibold leading-[1.6] text-white/48">
                A trusted contact may acknowledge a safety notice or report
                concern, but cannot use this owner-only page to sign in, unlock,
                close, restore, or control another person’s StayKnown account.
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
              Account unlocking does not replace police, ambulance, fire
              service, medical care, or another official emergency authority.
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
