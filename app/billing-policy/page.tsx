"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";

const UPDATED_AT = "2026-04-30";
const VERSION = "1.1";

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
      "StayKnown Billing & Refunds Policy | Starter, Pro, Pro Max, Coins, Wallet, Subscriptions & Payments";

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
      "Read the StayKnown Billing & Refunds Policy covering Starter, Pro, Pro Max, subscriptions, coins, wallet, withdrawals, receipts, failed payments, chargebacks, refunds, app-store purchases, Nigeria and global billing rules.",
    );
    upsertMeta(
      "keywords",
      "StayKnown billing policy, StayKnown refunds, StayKnown Pro, StayKnown Pro Max, safety app subscription, app wallet policy, coins policy, refund policy, Paystack billing, in-app purchase receipt, Nigeria safety app billing, subscription cancellation",
    );
    upsertMeta("robots", "index, follow");
    upsertMeta("author", "6 Clement Joshua");
    upsertProperty(
      "og:title",
      "StayKnown Billing & Refunds Policy | Pro, Pro Max, Coins & Wallet",
    );
    upsertProperty(
      "og:description",
      "Billing, subscription, coin, wallet, withdrawal, receipt, failed-payment, chargeback, cancellation, and refund rules for StayKnown.",
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

function ReceiptIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M6.4 3.8h11.2v16.4l-2-1.1-2 1.1-2-1.1-2 1.1-2-1.1-2 1.1V3.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9 8h6M9 11h6M9 14h3.8"
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

function BillingIllustration() {
  return (
    <div className="relative mx-auto h-[280px] w-[190px] md:h-[320px] md:w-[220px]">
      <div className="absolute inset-0 animate-[softPulse_4s_ease-in-out_infinite] rounded-[2.2rem] bg-white/[0.045] blur-2xl" />
      <div className="relative h-full w-full rounded-[2rem] border border-white/15 bg-white/[0.055] p-3 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-white/20" />

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-white text-black">
              <WalletIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-black tracking-[0.18em] text-white/35">
                BILLING CENTER
              </div>
              <div className="text-[13px] font-black text-white">
                Plans & Wallet
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {[
              ["Starter", "Free baseline safety"],
              ["Pro", "Paid premium features"],
              ["Pro Max", "Highest feature access"],
              ["Coins", "Wallet rules apply"],
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
            Billing governed
          </div>
          <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.9)]" />
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  useSeoMeta();

  const nav = useMemo(
    () =>
      [
        ["summary", "Summary"],
        ["plans", "Plans"],
        ["pricing", "Pricing"],
        ["renewals", "Renewals"],
        ["failed", "Failed payments"],
        ["cancellation", "Cancellation"],
        ["refunds", "Refunds"],
        ["coins", "Coins"],
        ["wallet", "Wallet"],
        ["withdrawals", "Withdrawals"],
        ["receipts", "Receipts"],
        ["fraud", "Fraud"],
        ["appstores", "App stores"],
        ["global", "Nigeria & global"],
        ["safety", "Safety limits"],
        ["retention", "Records"],
        ["contact", "Contact"],
      ] as const,
    [],
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "StayKnown Billing & Refunds Policy",
    dateModified: UPDATED_AT,
    version: VERSION,
    publisher: {
      "@type": "Organization",
      name: "StayKnown",
      brand: "A 6 Clement Joshua service™",
      url: "https://stay-known.com",
    },
    description:
      "Billing and Refunds Policy for StayKnown covering Starter, Pro, Pro Max, subscriptions, renewals, failed payments, cancellations, refunds, coins, wallet, withdrawals, receipts, chargebacks, app-store purchases, and Nigeria/global billing rules.",
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
                    <Pill>Billing</Pill>
                    <Pill>Refunds</Pill>
                    <Pill>Wallet & Coins</Pill>
                  </div>

                  <h1 className="mt-5 max-w-3xl text-[30px] font-black tracking-[-0.045em] text-white md:text-[46px] md:leading-[1.02]">
                    StayKnown Billing & Refunds Policy for subscriptions, coins,
                    wallet, receipts, cancellations, and payment safety.
                  </h1>

                  <p className="mt-5 max-w-3xl text-[14.5px] font-semibold leading-relaxed text-white/62 md:text-[15px]">
                    This policy explains how StayKnown handles Starter, Pro, Pro
                    Max, subscription billing, renewal, failed payments,
                    cancellations, refunds, app-store purchases, Paystack or
                    payment-provider flows, coins, wallet balances, withdrawals,
                    receipts, chargebacks, and payment-related abuse.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <SoftBadge>Version {VERSION}</SoftBadge>
                    <SoftBadge>Updated: {fmtDate(UPDATED_AT)}</SoftBadge>
                    <PrimaryButton href="/contact">
                      Billing support
                    </PrimaryButton>
                  </div>
                </div>

                <BillingIllustration />
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
              <aside className="border-b border-white/10 bg-black/35 p-5 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:p-6">
                <div className="text-[12px] font-black uppercase tracking-[0.2em] text-white/35">
                  On this page
                </div>

                <nav
                  aria-label="Billing and Refunds Policy sections"
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
                    <WalletIcon className="h-4 w-4" />
                    Billing rule
                  </div>
                  <p className="mt-2 text-[12px] font-semibold leading-relaxed text-white/50">
                    Paid features improve access, but they do not guarantee
                    rescue, exact location, contact response, or official
                    emergency service action.
                  </p>
                </div>
              </aside>

              <div className="p-5 md:p-8">
                <div className="space-y-8">
                  <section id="summary" className="scroll-mt-24 space-y-4">
                    <H2 icon={<WalletIcon className="h-4 w-4" />}>
                      1) Billing summary
                    </H2>
                    <P>
                      StayKnown may offer free and paid plans, optional
                      purchases, wallet features, coins, receipts, and
                      withdrawal-related features. Billing systems must be used
                      lawfully and honestly. Users must not manipulate payments,
                      subscriptions, receipts, wallet balances, coins, refunds,
                      withdrawals, or plan gates.
                    </P>

                    <div className="grid gap-3 md:grid-cols-3">
                      <Callout
                        title="Plans control feature access"
                        body="Starter, Pro, and Pro Max may have different limits, gates, and safety-feature access."
                        icon={<WalletIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="Refunds are limited"
                        body="Refunds depend on provider rules, app-store rules, local law, product use, fraud review, and payment status."
                        icon={<ReceiptIcon className="h-5 w-5" />}
                      />
                      <Callout
                        title="No payment abuse"
                        body="Chargeback abuse, receipt manipulation, fake purchases, wallet abuse, and payment fraud are prohibited."
                        icon={<AlertIcon className="h-5 w-5" />}
                      />
                    </div>
                  </section>

                  <section id="plans" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      2) Starter, Pro, and Pro Max plans
                    </H2>
                    <P>
                      StayKnown may provide different plan levels. Features,
                      limits, access, prices, currencies, billing intervals,
                      regional availability, and provider rules may change over
                      time.
                    </P>
                    <UL
                      items={[
                        "Starter may include baseline access and limited safety features.",
                        "Pro may include expanded access, higher limits, or premium features.",
                        "Pro Max may include the highest available plan access and premium personalization where available.",
                        "Plan names, features, limits, and pricing may be shown inside the app, website, checkout page, or app-store flow.",
                        "A paid plan does not guarantee that contacts will respond, that alerts will deliver instantly, that location will be exact, or that emergency services will act.",
                        "Some features may still require device permission, approved contacts, VPN/device integrity, network access, region support, and safety compliance.",
                      ]}
                    />
                  </section>

                  <section id="pricing" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ReceiptIcon className="h-4 w-4" />}>
                      3) Pricing, taxes, currency, and provider fees
                    </H2>
                    <P>
                      Pricing may vary by country, currency, app store, payment
                      provider, tax requirement, exchange rate, payment method,
                      promotion, or billing interval.
                    </P>
                    <UL
                      items={[
                        "Displayed prices may exclude or include taxes depending on region and provider rules.",
                        "Users are responsible for reviewing price, plan, currency, renewal period, and taxes before confirming purchase.",
                        "Payment providers, banks, card issuers, app stores, or mobile money providers may charge separate fees.",
                        "Exchange rates may change and may affect local-currency amounts.",
                        "Promotions, discounts, trials, or temporary offers may be changed, ended, or limited.",
                        "If a provider displays a final price at checkout, that checkout price controls the purchase.",
                      ]}
                    />
                  </section>

                  <section id="renewals" className="scroll-mt-24 space-y-3">
                    <H2 icon={<WalletIcon className="h-4 w-4" />}>
                      4) Renewals, expiry, upgrades, and downgrades
                    </H2>
                    <P>
                      Paid subscriptions may renew automatically unless canceled
                      according to the provider’s rules. StayKnown may downgrade
                      a user when payment fails, subscription expires, provider
                      verification fails, or the plan is no longer active.
                    </P>
                    <UL
                      items={[
                        "Subscriptions may renew monthly, yearly, or on another billing interval shown at checkout.",
                        "Upgrading may unlock features after payment verification succeeds.",
                        "Downgrading may remove access to Pro or Pro Max features after the plan changes or expires.",
                        "If payment verification is delayed, plan activation may also be delayed.",
                        "If a payment provider reverses, cancels, or flags a transaction, StayKnown may adjust plan access.",
                        "If a user cancels, access may continue until the end of the paid billing period unless provider rules say otherwise.",
                      ]}
                    />
                  </section>

                  <section id="failed" className="scroll-mt-24 space-y-3">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      5) Failed payments and interrupted billing
                    </H2>
                    <P>
                      A payment may fail because of bank decline, insufficient
                      funds, expired card, provider error, network issue, fraud
                      check, currency issue, webhook delay, app-store issue, or
                      account restriction.
                    </P>
                    <UL
                      items={[
                        "StayKnown may retry or ask the user to update payment details where supported.",
                        "Feature access may be paused, reduced, or downgraded if payment is not completed.",
                        "Failed payment notices may be sent by email, app notification, payment provider, app store, or in-app UI.",
                        "StayKnown is not responsible for bank fees, provider fees, failed-card fees, overdraft fees, or exchange-rate differences charged by third parties.",
                        "If payment succeeds but plan access does not update, users should contact support with the receipt or provider reference.",
                      ]}
                    />
                  </section>

                  <section id="cancellation" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      6) Cancellations
                    </H2>
                    <P>
                      Users may cancel subscriptions according to the payment
                      provider or app-store process used for the purchase.
                    </P>
                    <UL
                      items={[
                        "If purchased through an app store, cancellation may need to be completed through Apple, Google, or the relevant store account.",
                        "If purchased through a direct payment provider, cancellation may be handled in-app, on the website, or through support depending on the flow.",
                        "Deleting the app may not cancel a subscription.",
                        "Deleting an account may not automatically cancel a subscription if the provider requires separate cancellation.",
                        "Canceled subscriptions may remain active until the end of the current paid period unless provider rules say otherwise.",
                        "Users should save receipts and cancellation confirmations.",
                      ]}
                    />
                  </section>

                  <section id="refunds" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ReceiptIcon className="h-4 w-4" />}>
                      7) Refunds
                    </H2>
                    <P>
                      Refund eligibility depends on payment provider rules, app
                      store rules, local law, product usage, billing status,
                      fraud review, and whether the purchase was already used to
                      access paid features.
                    </P>
                    <UL
                      items={[
                        "App-store purchases may be refunded only by the app store where required by provider rules.",
                        "Direct provider purchases may be reviewed by StayKnown or the payment provider depending on the transaction.",
                        "Refund requests should include account email, transaction date, amount, payment reference, receipt, and reason for the request.",
                        "Refunds may be denied where paid features were used, the request is abusive, the transaction is fraudulent, or the request violates provider rules.",
                        "Partial refunds, credits, or account adjustments may be offered where appropriate but are not guaranteed.",
                        "Processing time depends on the payment provider, bank, card issuer, app store, and region.",
                      ]}
                    />
                    <Callout
                      title="Safety-product note"
                      body="Dissatisfaction with a contact’s response, emergency outcome, map accuracy, GPS quality, network delay, device issue, or third-party emergency response does not automatically create a refund right."
                      icon={<ShieldIcon className="h-5 w-5" />}
                    />
                  </section>

                  <section id="coins" className="scroll-mt-24 space-y-3">
                    <H2 icon={<WalletIcon className="h-4 w-4" />}>
                      8) Coins and digital balances
                    </H2>
                    <P>
                      StayKnown may offer coins or digital balances for approved
                      in-app actions. Coins are not the same as cash unless the
                      product clearly labels a balance as withdrawable and
                      withdrawal rules are satisfied.
                    </P>
                    <UL
                      items={[
                        "Coins may be purchased, earned, received, gifted, sent, or used only where the app allows.",
                        "Coins may be subject to plan limits, fraud checks, account standing, regional availability, and provider rules.",
                        "Coins may not be sold outside StayKnown or used for illegal activity.",
                        "Coins may not be used for scams, harassment, bribery, extortion, threats, manipulation, or unsafe contact.",
                        "Purchased coins may be non-refundable once delivered or used unless local law or provider rules require otherwise.",
                        "StayKnown may reverse coins connected to fraud, chargebacks, payment reversals, abuse, technical error, or policy violations.",
                      ]}
                    />
                  </section>

                  <section id="wallet" className="scroll-mt-24 space-y-3">
                    <H2 icon={<WalletIcon className="h-4 w-4" />}>
                      9) Wallet, withdrawable balance, and ledger accuracy
                    </H2>
                    <P>
                      If StayKnown provides wallet features, balances may be
                      separated into non-withdrawable coins and withdrawable
                      amounts. A ledger or transaction record may control the
                      final balance.
                    </P>
                    <UL
                      items={[
                        "Wallet balances may update after provider verification, fraud review, ledger update, or server processing.",
                        "A visible UI balance may be delayed or temporarily different from backend records.",
                        "StayKnown may correct balances affected by technical error, duplicate events, fraud, reversal, chargeback, or abuse.",
                        "Users must not exploit bugs, race conditions, webhook delays, receipt errors, ledger issues, or outbox delays.",
                        "Wallet features may be limited, paused, or unavailable by region, account status, provider support, or legal requirement.",
                        "StayKnown may require identity, fraud, bank, or account checks before allowing withdrawal features.",
                      ]}
                    />
                  </section>

                  <section id="withdrawals" className="scroll-mt-24 space-y-3">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      10) Withdrawals and bank-account handling
                    </H2>
                    <P>
                      Withdrawal features, if available, may require minimum
                      balance, identity checks, bank-account verification,
                      anti-fraud review, regional support, and payment-provider
                      approval.
                    </P>
                    <UL
                      items={[
                        "Withdrawals may be available only for balances clearly marked as withdrawable.",
                        "Coins that are not marked withdrawable may not be eligible for cash withdrawal.",
                        "StayKnown may set a minimum withdrawal amount.",
                        "StayKnown may delay, hold, deny, reverse, or investigate withdrawals connected to fraud, chargebacks, suspicious activity, policy violations, or legal requests.",
                        "Users are responsible for providing accurate bank, payment, identity, and tax information where required.",
                        "StayKnown is not responsible for delays caused by banks, payment providers, card issuers, mobile money providers, app stores, holidays, compliance checks, or network outages.",
                      ]}
                    />
                  </section>

                  <section id="receipts" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ReceiptIcon className="h-4 w-4" />}>
                      11) Receipts, email notices, and transaction records
                    </H2>
                    <P>
                      StayKnown may send branded receipts, plan activation
                      notices, failed-payment notices, cancellation notices,
                      refund notices, wallet notices, or withdrawal notices.
                    </P>
                    <UL
                      items={[
                        "Receipts may include transaction date, amount, plan or pack, provider reference, last four digits where available, and account identity.",
                        "Emails may be delayed, blocked, filtered, or sent to spam by providers.",
                        "Users should keep receipts for support, disputes, refund requests, and accounting.",
                        "If a receipt looks suspicious, users should contact support before clicking anything.",
                        "StayKnown emails should never be used to impersonate support, collect passwords, request OTPs, or demand money outside approved payment flows.",
                      ]}
                    />
                  </section>

                  <section id="fraud" className="scroll-mt-24 space-y-3">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      12) Fraud, chargebacks, and payment misuse
                    </H2>
                    <P>
                      StayKnown prohibits payment abuse, wallet abuse,
                      chargeback abuse, fake receipts, receipt replay, webhook
                      manipulation, refund fraud, and using payments or coins to
                      harm another person.
                    </P>
                    <UL
                      items={[
                        "Do not use stolen cards, stolen accounts, unauthorized payment methods, or fraudulent payment information.",
                        "Do not manipulate receipts, payment references, app-store records, webhook payloads, transaction IDs, subscription records, wallet balances, coins, ledgers, or outbox jobs.",
                        "Do not use chargebacks after receiving and using paid features unless the chargeback is lawful and legitimate.",
                        "Do not use coins, gifts, payments, or withdrawals for scams, bribery, extortion, harassment, threats, stalking, illegal funding, or money laundering.",
                        "StayKnown may restrict accounts, devices, payment methods, wallet features, withdrawals, coins, subscriptions, or support access when fraud is suspected.",
                        "StayKnown may preserve records and cooperate with valid legal process where fraud, safety risk, or payment abuse is involved.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/acceptable-use"
                        title="Acceptable Use"
                        body="Detailed prohibited-use rules for payments, coins, wallet, chat, media, contacts, location, and platform behavior."
                      />
                      <LinkCard
                        href="/security"
                        title="Security Disclosure"
                        body="Report payment, wallet, receipt, API, webhook, or platform-integrity vulnerabilities."
                      />
                    </div>
                  </section>

                  <section id="appstores" className="scroll-mt-24 space-y-3">
                    <H2 icon={<GlobeIcon className="h-4 w-4" />}>
                      13) App-store and third-party provider rules
                    </H2>
                    <P>
                      Some purchases may be controlled by Apple, Google,
                      Paystack, banks, card issuers, mobile money providers, or
                      other payment processors. Their rules may apply in
                      addition to StayKnown rules.
                    </P>
                    <UL
                      items={[
                        "App-store purchases may need to be managed through the app-store account.",
                        "Refunds for app-store purchases may need to be requested from the app store.",
                        "Direct payments may be handled by payment providers and may require provider verification.",
                        "Provider outages, delays, fraud checks, network issues, currency issues, tax rules, or bank restrictions may affect billing.",
                        "StayKnown may not be able to override third-party refund, chargeback, tax, or payment-processing decisions.",
                        "Users must not use third-party provider systems to commit fraud, evade policy, or bypass StayKnown safety gates.",
                      ]}
                    />
                  </section>

                  <section id="global" className="scroll-mt-24 space-y-3">
                    <H2 icon={<GlobeIcon className="h-4 w-4" />}>
                      14) Nigeria, United States, United Kingdom, EU, and global
                      billing
                    </H2>
                    <P>
                      Billing rules, consumer rights, refund windows, taxes,
                      payment providers, currencies, card rules, bank timelines,
                      and app-store requirements differ by country.
                    </P>

                    <H3>Nigeria billing language</H3>
                    <UL
                      items={[
                        "In Nigeria, billing may involve local banks, cards, Paystack-supported channels, mobile payment systems, currency conversion, network issues, provider outages, and bank processing delays.",
                        "Users should confirm plan, amount, currency, renewal, and payment provider before purchase.",
                        "Refunds or reversals may depend on provider processing, bank timelines, fraud checks, and transaction status.",
                        "Wallet or withdrawal features may require minimum thresholds, bank-account accuracy, compliance review, and anti-fraud checks.",
                        "StayKnown does not replace Nigerian banks, payment processors, card issuers, regulators, or consumer-protection bodies.",
                      ]}
                    />

                    <H3>United States, U.K./EU, and other countries</H3>
                    <UL
                      items={[
                        "In the United States, app-store, card, bank, state consumer law, tax, and payment-provider rules may affect purchases and refunds.",
                        "In the U.K. and EU, consumer cancellation, digital-content, tax, privacy, and payment rules may affect billing and refunds.",
                        "In any country, users must follow local laws on payment fraud, consumer disputes, taxes, money laundering, sanctions, and illegal funding.",
                        "Regional availability may limit plans, prices, payment methods, wallet features, withdrawal features, or coins.",
                      ]}
                    />
                  </section>

                  <section id="safety" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      15) Paid features do not replace safety judgment
                    </H2>
                    <P>
                      StayKnown is a safety-awareness and trusted-contact
                      service. Paid plans may provide more features, but paid
                      access is not a guarantee of safety or emergency response.
                    </P>
                    <UL
                      items={[
                        "Paid plans do not guarantee rescue.",
                        "Paid plans do not guarantee official emergency dispatch.",
                        "Paid plans do not guarantee exact GPS location or continuous live updates.",
                        "Paid plans do not guarantee that contacts will see, understand, or act on alerts.",
                        "Paid plans do not guarantee network, device, battery, email, push, map, payment, or provider reliability.",
                        "If immediate danger exists, contact official emergency services or the proper local authority first.",
                      ]}
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/emergency"
                        title="Emergency Disclaimer"
                        body="StayKnown does not replace official emergency services in Nigeria, the U.S., U.K./EU, or any country."
                      />
                      <LinkCard
                        href="/location-safety"
                        title="Location & Live Safety"
                        body="Rules for Visit sessions, LIVE sharing, SOS, manual capture, chat maps, VPN gates, and accuracy limits."
                      />
                    </div>
                  </section>

                  <section id="retention" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ReceiptIcon className="h-4 w-4" />}>
                      16) Billing records, retention, and disputes
                    </H2>
                    <P>
                      Billing records may be retained for receipts, customer
                      support, accounting, taxes, fraud prevention, disputes,
                      chargebacks, refund review, provider reconciliation,
                      wallet ledger accuracy, and legal compliance.
                    </P>
                    <UL
                      items={[
                        "Transaction records may include account identity, amount, currency, provider reference, plan, pack, timestamps, and receipt metadata.",
                        "Wallet and coin ledgers may be retained to prevent fraud and resolve balance disputes.",
                        "Refund and chargeback records may be retained for fraud prevention, legal compliance, and dispute defense.",
                        "Deletion requests may be limited where billing records must be retained for tax, fraud, legal, security, or accounting reasons.",
                        "StayKnown may preserve payment records where fraud, abuse, legal process, or safety risk is involved.",
                      ]}
                    />
                    <LinkCard
                      href="/retention"
                      title="Data Retention"
                      body="Detailed retention rules for safety logs, payment records, wallet ledgers, support reports, and legal holds."
                    />
                  </section>

                  <section id="contact" className="scroll-mt-24 space-y-3">
                    <H2 icon={<ReportIcon className="h-4 w-4" />}>
                      17) Contact and related policies
                    </H2>
                    <P>
                      For billing, subscription, receipt, refund, wallet, coin,
                      withdrawal, failed-payment, or chargeback questions,
                      contact StayKnown support.
                    </P>
                    <UL
                      items={[
                        "Support: support@stay-known.com",
                        "Use the subject line: Billing Support — StayKnown.",
                        "Include account email, transaction date, amount, currency, receipt, provider reference, and issue summary.",
                        "For suspected wallet or payment vulnerability, use: Security Disclosure — StayKnown.",
                        "For payment abuse, scams, extortion, or unsafe use involving coins or wallet, use: StayKnown Abuse Report.",
                      ]}
                    />

                    <div className="grid gap-3 md:grid-cols-2">
                      <LinkCard
                        href="/terms"
                        title="Terms of Service"
                        body="Main agreement for accounts, lawful use, safety limits, subscriptions, enforcement, and liability limits."
                      />
                      <LinkCard
                        href="/privacy"
                        title="Privacy Policy"
                        body="How StayKnown processes account, payment, receipt, wallet, contact, location, chat, and lawful-request data."
                      />
                      <LinkCard
                        href="/retention"
                        title="Data Retention"
                        body="Billing records, wallet ledgers, safety logs, legal holds, deletion limits, and support records."
                      />
                      <LinkCard
                        href="/security"
                        title="Security Disclosure"
                        body="Responsible reporting for payment, wallet, receipt, API, webhook, and platform-integrity vulnerabilities."
                      />
                      <LinkCard
                        href="/abuse"
                        title="Abuse Reporting"
                        body="Report scams, payment abuse, extortion, fraud, harassment, false SOS, or unsafe platform behavior."
                      />
                      <LinkCard
                        href="/acceptable-use"
                        title="Acceptable Use"
                        body="Rules against payment fraud, wallet abuse, contact abuse, location misuse, chat abuse, and platform misuse."
                      />
                    </div>
                  </section>

                  <section className="space-y-3 rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5">
                    <H2>18) Changes to this Billing & Refunds Policy</H2>
                    <P>
                      StayKnown may update this policy to reflect new plans,
                      prices, payment providers, app-store rules, taxes, wallet
                      features, coin features, withdrawal features, refund
                      rules, chargeback handling, legal requirements, provider
                      limitations, country-specific expectations, or operational
                      needs. If updates are material, StayKnown may provide
                      notice through the app, website, email, or another
                      reasonable method.
                    </P>
                  </section>

                  <section className="space-y-3 rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5">
                    <H2>Appendix A — In-app short billing notice</H2>
                    <P>
                      StayKnown may offer Starter, Pro, Pro Max, subscriptions,
                      coins, wallet features, receipts, withdrawals, and paid
                      features. Review plan, price, currency, renewal, taxes,
                      provider, and refund rules before purchase. Paid access
                      does not guarantee rescue, exact location, contact
                      response, official emergency dispatch, or provider
                      reliability. Refunds depend on provider rules, app-store
                      rules, local law, usage, fraud review, and transaction
                      status. Payment fraud, chargeback abuse, fake receipts,
                      wallet abuse, coin abuse, and attempts to bypass plan
                      gates are prohibited.
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
                      app-store submission, payment-provider onboarding, or
                      law-enforcement request handling.
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
