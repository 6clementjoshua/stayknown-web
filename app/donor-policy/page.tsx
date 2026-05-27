"use client";

import Image from "next/image";
import { useEffect } from "react";

const UPDATED_AT = "2026-05-27";
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
      "StayKnown Donor Policy | Donations, Flutterwave Payments, Receipts & Platform Support";

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
      "StayKnown Donor Policy explains donations, Flutterwave payment processing, receipts, donation use, donor privacy, refunds, chargebacks, and support for backend, live map, translation, and safety systems.",
    );
    upsertMeta(
      "keywords",
      "StayKnown donation policy, StayKnown donor policy, Flutterwave donation, safety app donation, StayKnown support, donate to StayKnown, donor privacy, donation receipt",
    );
    upsertMeta("robots", "index, follow");
    upsertMeta("author", "6 Clement Joshua");

    upsertProperty("og:title", "StayKnown Donor Policy");
    upsertProperty(
      "og:description",
      "Donation rules, donor privacy, payment confirmation, Flutterwave processing, receipts, and how donations support StayKnown infrastructure.",
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

function DonateIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 20s-7.2-4.4-8.6-9.2C2.6 8 4.2 5.6 6.9 5.2c1.6-.2 3.2.5 4.1 1.8.9-1.3 2.5-2 4.1-1.8 2.7.4 4.3 2.8 3.5 5.6C19.2 15.6 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PaymentIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M4.5 7h15A1.5 1.5 0 0 1 21 8.5v7A1.5 1.5 0 0 1 19.5 17h-15A1.5 1.5 0 0 1 3 15.5v-7A1.5 1.5 0 0 1 4.5 7Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M3.5 10h17M7 14h3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ServerIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M6.5 4.5h11A2.5 2.5 0 0 1 20 7v1.2a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 8.2V7a2.5 2.5 0 0 1 2.5-2.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M6.5 13.3h11A2.5 2.5 0 0 1 20 15.8V17a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17v-1.2a2.5 2.5 0 0 1 2.5-2.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M7.4 7.6h.01M7.4 16.4h.01M10 7.6h6.2M10 16.4h6.2"
        stroke="currentColor"
        strokeWidth="1.9"
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

export default function DonorPolicyPage() {
  useSeoMeta();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "StayKnown Donor Policy",
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
      "StayKnown Donor Policy covering donations, Flutterwave payment processing, receipts, privacy, refunds, chargebacks, and support for backend, live map, chat translation, and safety infrastructure.",
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
          <a href="/" className="flex flex-col items-center gap-2">
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
          </a>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-8 md:pt-12">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/60 backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(255,255,255,0.11),transparent_32%),radial-gradient(circle_at_80%_12%,rgba(255,255,255,0.045),transparent_26%)]" />

          <div className="relative grid gap-8 px-5 py-8 md:grid-cols-[1fr_280px] md:items-center md:px-8 md:py-10">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Pill>Donor Policy</Pill>
                <Pill>Flutterwave</Pill>
                <Pill>Platform Support</Pill>
              </div>

              <h1 className="mt-5 max-w-4xl text-[34px] font-black tracking-[-0.055em] text-white md:text-[58px] md:leading-[1.02]">
                StayKnown Donor Policy for supporters funding safer technology.
              </h1>

              <p className="mt-5 max-w-3xl text-[14px] font-semibold leading-relaxed text-white/60 md:text-[15px]">
                Donations help StayKnown expand backend systems, improve live
                safety infrastructure, strengthen multilingual chat translation,
                advance live map reliability, and continue building safety
                features for real people.
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
                  <DonateIcon className="h-20 w-20" />
                </div>

                <div className="absolute left-5 top-5 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/80">
                  <PaymentIcon className="h-6 w-6" />
                </div>

                <div className="absolute right-5 top-8 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/80">
                  <ServerIcon className="h-6 w-6" />
                </div>

                <div className="absolute bottom-6 left-8 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/80">
                  <GlobeIcon className="h-6 w-6" />
                </div>

                <div className="absolute bottom-5 right-7 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/80">
                  <ShieldIcon className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="pt-8">
          <div className="grid gap-4 md:grid-cols-3">
            <PrincipleCard
              icon={<ServerIcon className="h-5 w-5" />}
              title="Technology support"
              body="Donations help fund backend growth, safety infrastructure, live map systems, translation flows, reliability, and security improvements."
              delay={0}
            />
            <PrincipleCard
              icon={<PaymentIcon className="h-5 w-5" />}
              title="Flutterwave payments"
              body="Donation checkout is handled through Flutterwave where supported payment methods and countries are available."
              delay={80}
            />
            <PrincipleCard
              icon={<ShieldIcon className="h-5 w-5" />}
              title="Donor privacy"
              body="StayKnown uses donor information for payment confirmation, receipts, support, fraud prevention, accounting, and lawful recordkeeping."
              delay={160}
            />
          </div>
        </section>

        <section className="pt-10">
          <SectionTitle
            kicker="What donations support"
            icon={<DonateIcon className="h-5 w-5" />}
          >
            Donations support product growth, not emergency dispatch
          </SectionTitle>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <BulletCard
              icon={<ServerIcon className="h-5 w-5" />}
              title="Backend and reliability"
              items={[
                "Server-side systems that power real-time safety flows, account features, storage, notifications, and platform reliability.",
                "Monitoring, scaling, database improvements, maintenance, and technical work needed to keep safety features stable.",
                "Backend work for Visits, SOS, approved contacts, chat, payments, and product operations.",
                "Infrastructure improvements that help StayKnown serve more users without weakening safety or reliability.",
              ]}
            />

            <BulletCard
              icon={<GlobeIcon className="h-5 w-5" />}
              title="Language and live map systems"
              items={[
                "Language model training and improvement for multilingual chat translation and recipient language preferences.",
                "Live map reliability, location context handling, and approved-contact map visibility improvements.",
                "Safety labels, location context, and privacy-aware communication improvements.",
                "Research and product development for future safety, communication, and trusted-contact features.",
              ]}
            />

            <BulletCard
              icon={<ShieldIcon className="h-5 w-5" />}
              title="Safety and security improvements"
              items={[
                "Abuse-prevention work, responsible platform monitoring, security improvements, and anti-misuse design.",
                "Better protections around SOS, live map links, contact approvals, account access, VPN gates, and sensitive safety data.",
                "Trust and safety documentation, policy support, reporting improvements, and user education.",
                "Work that helps reduce misuse, fake emergencies, stalking, harassment, impersonation, fraud, or unsafe content.",
              ]}
            />

            <BulletCard
              icon={<ReportIcon className="h-5 w-5" />}
              title="Operational and review costs"
              items={[
                "Support, review, compliance, email confirmation, payment reconciliation, and internal reporting costs.",
                "Technical and administrative work required to keep donation records, confirmations, and support responses organized.",
                "Creator, partner, and awareness flows that help explain StayKnown responsibly to the public.",
                "Donations may be pooled and used based on StayKnown’s operational priorities, unless a specific written campaign says otherwise.",
              ]}
            />
          </div>
        </section>

        <section className="pt-10">
          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.032] p-5 shadow-sm md:p-6">
            <SectionTitle
              kicker="Payment handling"
              icon={<PaymentIcon className="h-5 w-5" />}
            >
              Donation checkout, confirmation, and receipts
            </SectionTitle>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {[
                "Flutterwave may process donation payments using supported cards, bank methods, mobile money, transfers, or other methods available by country and currency.",
                "StayKnown verifies successful donations through the payment provider before showing confirmation or sending receipt emails.",
                "Donors should enter a correct email address because donation confirmation and receipt summaries are sent by email.",
                "Payment availability, currency support, transaction limits, and provider checks may depend on Flutterwave, issuing banks, country rules, and payment method availability.",
                "StayKnown may store transaction reference, amount, currency, donor email, donor name if provided, provider payload, and verification status.",
                "If a payment is taken but the confirmation page fails, donors should contact StayKnown with their Flutterwave reference or transaction ID.",
              ].map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-black/24 px-4 py-3"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-white/65" />
                  <span className="text-[13px] font-semibold leading-relaxed text-white/58">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pt-10">
          <div className="grid gap-4 lg:grid-cols-2">
            <BulletCard
              icon={<ShieldIcon className="h-5 w-5" />}
              title="Donor information and privacy"
              items={[
                "StayKnown does not sell donor information.",
                "Donor information is used for donation processing, receipts, support, fraud prevention, security, accounting, legal compliance, and operational reporting.",
                "Payment details such as card numbers are handled by the payment provider, not stored directly by StayKnown’s website.",
                "Donation records may be retained for accounting, tax, security, payment-dispute, fraud-prevention, support, or legal reasons.",
              ]}
            />

            <BulletCard
              icon={<ReportIcon className="h-5 w-5" />}
              title="Refunds, mistakes, and disputes"
              items={[
                "Donations are generally voluntary support for StayKnown’s technology and product mission.",
                "If a donation was made by mistake, duplicated, or appears unauthorized, contact StayKnown promptly through the request form with the payment reference.",
                "Refund decisions may depend on payment status, provider rules, settlement status, fraud review, chargeback status, and applicable law.",
                "Chargebacks, suspicious payments, payment abuse, or fraudulent donations may lead to review, restriction, preservation of records, or provider reporting.",
              ]}
            />
          </div>
        </section>

        <section className="pt-10">
          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.032] p-5 shadow-sm md:p-6">
            <SectionTitle
              kicker="Important limits"
              icon={<ShieldIcon className="h-5 w-5" />}
            >
              Donation support does not change app safety limits
            </SectionTitle>

            <p className="mt-4 text-[13.5px] font-semibold leading-relaxed text-white/58">
              StayKnown is a safety-focused technology platform, but it is not
              police, ambulance, fire service, emergency dispatch, rescue
              service, hospital, civil defence, or government authority.
              Donations help improve the platform and infrastructure. They do
              not guarantee emergency response, personal rescue, official
              intervention, feature delivery date, access to private systems, or
              special treatment.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <LinkCard
                href="/emergency"
                title="Emergency Disclaimer"
                body="Understand StayKnown’s limits and why local emergency services must be contacted first in immediate danger."
              />
              <LinkCard
                href="/location-safety"
                title="Location & Live Safety"
                body="Read how Visits, LIVE maps, location sharing, VPN gates, and accuracy limits work."
              />
              <LinkCard
                href="/trust-safety"
                title="Trust & Safety"
                body="Learn how StayKnown approaches consent, abuse prevention, safety sharing, and platform integrity."
              />
            </div>
          </div>
        </section>

        <section className="pt-10">
          <SectionTitle
            kicker="Connected pages"
            icon={<DonateIcon className="h-5 w-5" />}
          >
            Donation and support routes
          </SectionTitle>

          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <LinkCard
              href="/donate"
              title="Donate"
              body="Support StayKnown backend growth, live map reliability, chat translation, and safety infrastructure."
            />
            <LinkCard
              href="/privacy"
              title="Privacy Policy"
              body="How StayKnown handles account, payment, donation, support, media, and safety data."
            />
            <LinkCard
              href="/billing-policy"
              title="Billing & Refunds"
              body="Related payment, billing, refund, receipt, and provider-handling information."
            />
            <LinkCard
              href="/terms"
              title="Terms of Service"
              body="Main website and service terms for using StayKnown responsibly."
            />
            <LinkCard
              href="/submit-request"
              title="Submit Request"
              body="Use this route for donation, payment, receipt, support, or formal request questions."
            />
            <LinkCard
              href="/security"
              title="Security Disclosure"
              body="Report responsible security concerns or payment-related website vulnerabilities."
            />
          </div>
        </section>

        <div className="mx-auto mt-12 h-px max-w-3xl bg-white/10" />

        <footer className="mx-auto mt-7 max-w-4xl text-center">
          <div className="mx-auto rounded-[1.6rem] border border-white/10 bg-black/35 px-5 py-6">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] font-black uppercase tracking-[0.12em] text-white/35">
              <a href="/donate" className="transition hover:text-white">
                Donate
              </a>
              <a href="/privacy" className="transition hover:text-white">
                Privacy
              </a>
              <a href="/terms" className="transition hover:text-white">
                Terms
              </a>
              <a href="/billing-policy" className="transition hover:text-white">
                Billing
              </a>
              <a href="/trust-safety" className="transition hover:text-white">
                Trust & Safety
              </a>
              <a href="/submit-request" className="transition hover:text-white">
                Request
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
              This Donor Policy is for transparency and does not replace legal,
              tax, financial, accounting, or emergency advice.
            </p>
          </div>
        </footer>
      </section>
    </main>
  );
}
