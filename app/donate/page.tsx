"use client";

import Image from "next/image";
import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import StayKnownActionMenu from "@/components/StayKnownActionMenu";

type CurrencyCode =
  | "NGN"
  | "USD"
  | "GBP"
  | "EUR"
  | "KES"
  | "GHS"
  | "UGX"
  | "TZS"
  | "RWF"
  | "ZAR"
  | "XAF"
  | "XOF"
  | "ZMW";

type DonationReason = {
  title: string;
  body: string;
  icon: ReactNode;
};

const currencies: Array<{
  code: CurrencyCode;
  label: string;
  symbol: string;
  amounts: number[];
}> = [
  {
    code: "NGN",
    label: "Nigerian Naira",
    symbol: "₦",
    amounts: [5000, 10000, 25000, 50000, 100000],
  },
  {
    code: "USD",
    label: "US Dollar",
    symbol: "$",
    amounts: [5, 10, 25, 50, 100],
  },
  {
    code: "GBP",
    label: "British Pound",
    symbol: "£",
    amounts: [5, 10, 25, 50, 100],
  },
  { code: "EUR", label: "Euro", symbol: "€", amounts: [5, 10, 25, 50, 100] },
  {
    code: "KES",
    label: "Kenyan Shilling",
    symbol: "KSh",
    amounts: [500, 1000, 2500, 5000, 10000],
  },
  {
    code: "GHS",
    label: "Ghanaian Cedi",
    symbol: "GH₵",
    amounts: [50, 100, 250, 500, 1000],
  },
  {
    code: "UGX",
    label: "Ugandan Shilling",
    symbol: "USh",
    amounts: [20000, 50000, 100000, 250000, 500000],
  },
  {
    code: "TZS",
    label: "Tanzanian Shilling",
    symbol: "TSh",
    amounts: [10000, 25000, 50000, 100000, 250000],
  },
  {
    code: "RWF",
    label: "Rwandan Franc",
    symbol: "RF",
    amounts: [5000, 10000, 25000, 50000, 100000],
  },
  {
    code: "ZAR",
    label: "South African Rand",
    symbol: "R",
    amounts: [50, 100, 250, 500, 1000],
  },
  {
    code: "XAF",
    label: "Central African CFA Franc",
    symbol: "FCFA",
    amounts: [2500, 5000, 10000, 25000, 50000],
  },
  {
    code: "XOF",
    label: "West African CFA Franc",
    symbol: "CFA",
    amounts: [2500, 5000, 10000, 25000, 50000],
  },
  {
    code: "ZMW",
    label: "Zambian Kwacha",
    symbol: "ZK",
    amounts: [50, 100, 250, 500, 1000],
  },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function IconServer() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
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

function IconLanguage() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M4.5 5.5h8.2M8.6 4.2v1.3M10.9 5.5c-.6 3.5-2.6 6-6.2 7.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M6.5 8.4c1.1 1.8 2.5 3.2 4.4 4.1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M13 19.5l3.2-8.4c.2-.5.9-.5 1.1 0l3.2 8.4M14.3 16.4h4.9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMap() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M9 18.8 4.8 20.2A1 1 0 0 1 3.5 19.3V6.6a1 1 0 0 1 .7-1l4.8-1.6 6 2 4.2-1.4a1 1 0 0 1 1.3.9v12.8a1 1 0 0 1-.7 1L15 21l-6-2.2Z"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinejoin="round"
      />
      <path
        d="M9 4v14.8M15 6v15"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
      />
      <path
        d="M16.2 11.1c0 1.7-2.2 3.9-2.2 3.9s-2.2-2.2-2.2-3.9a2.2 2.2 0 1 1 4.4 0Z"
        stroke="currentColor"
        strokeWidth="1.55"
      />
      <path
        d="M14 11.1h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12 3.8 19 6.5v5.2c0 4.5-2.9 7.4-7 8.6-4.1-1.2-7-4.1-7-8.6V6.5l7-2.7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="m8.8 12.1 2.1 2.1 4.5-4.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12 20s-7.2-4.4-8.6-9.2C2.6 8 4.2 5.6 6.9 5.2c1.6-.2 3.2.5 4.1 1.8.9-1.3 2.5-2 4.1-1.8 2.7.4 4.3 2.8 3.5 5.6C19.2 15.6 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MiniCard({ title, body, icon }: DonationReason) {
  return (
    <div className="group relative overflow-hidden rounded-[1.55rem] border border-white/[0.10] bg-white/[0.045] p-4 shadow-2xl shadow-black/40 backdrop-blur-2xl transition duration-300 hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-white/[0.06]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.13),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_28%)] opacity-70" />
      <div className="relative flex gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/[0.12] bg-black/35 text-white/80 shadow-inner shadow-white/[0.04]">
          {icon}
        </div>
        <div>
          <h3 className="text-[13px] font-black tracking-[-0.01em] text-white/92">
            {title}
          </h3>
          <p className="mt-1.5 text-[12px] font-semibold leading-relaxed text-white/48">
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}

function formatAmount(amount: number, currency: CurrencyCode) {
  const selected = currencies.find((c) => c.code === currency) || currencies[0];

  if (currency === "NGN") {
    return `₦${amount.toLocaleString("en-NG")}`;
  }

  return `${selected.symbol} ${amount.toLocaleString("en-US")}`;
}

export default function DonatePage() {
  const [currency, setCurrency] = useState<CurrencyCode>("NGN");
  const selectedCurrency = useMemo(
    () => currencies.find((item) => item.code === currency) || currencies[0],
    [currency],
  );

  const [amount, setAmount] = useState<number>(selectedCurrency.amounts[1]);
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorMessage, setDonorMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorText, setErrorText] = useState("");

  const reasons: DonationReason[] = [
    {
      title: "Backend growth",
      body: "Help expand the systems that power real-time safety, notifications, storage, and platform reliability.",
      icon: <IconServer />,
    },
    {
      title: "Language model training",
      body: "Support better multilingual chat translation with stronger accuracy, speed, and context handling.",
      icon: <IconLanguage />,
    },
    {
      title: "Live map infrastructure",
      body: "Help improve live location systems, map performance, and approved-contact visibility during safety flows.",
      icon: <IconMap />,
    },
    {
      title: "Safer product advancement",
      body: "Fund security, abuse prevention, responsible scaling, and premium safety features for real users.",
      icon: <IconShield />,
    },
  ];

  function onCurrencyChange(nextCurrency: CurrencyCode) {
    const next =
      currencies.find((item) => item.code === nextCurrency) || currencies[0];
    setCurrency(next.code);
    setAmount(next.amounts[1]);
    setCustomAmount("");
    setErrorText("");
  }

  async function submitDonation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy) return;

    setBusy(true);
    setErrorText("");

    try {
      const resolvedAmount = customAmount.trim()
        ? Number(customAmount.trim())
        : amount;

      if (!Number.isFinite(resolvedAmount) || resolvedAmount <= 0) {
        throw new Error("Please enter a valid donation amount.");
      }

      if (!donorEmail.trim()) {
        throw new Error(
          "Please enter your email so we can send your confirmation.",
        );
      }

      const response = await fetch("/api/donations/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          donor_name: donorName,
          donor_email: donorEmail,
          donor_message: donorMessage,
          amount: resolvedAmount,
          currency,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.ok || !data?.checkout_url) {
        throw new Error(
          data?.message || "We could not start this donation right now.",
        );
      }

      window.location.href = data.checkout_url;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We could not start this donation right now.";
      setErrorText(message);
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <style jsx global>{`
        html,
        body {
          background: #000;
          color-scheme: dark;
          overflow-x: hidden;
        }

        @keyframes skFloatIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.992);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes skSoftPulse {
          0%,
          100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.03);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>

      <header className="relative z-50 pt-5 sm:pt-6">
        <div className="relative mx-auto flex max-w-6xl items-center justify-center px-2">
          <a href="/" className="flex flex-col items-center gap-2">
            <Image
              src="/6logo.png"
              alt="StayKnown"
              width={34}
              height={34}
              priority
            />
            <div className="text-[12px] font-extrabold tracking-[0.28em] text-white">
              STAYKNOWN
            </div>
          </a>

          <div className="absolute right-[-3px] top-1/2 -translate-y-1/2 sm:right-[-18px] md:right-[-28px] lg:right-[-36px] xl:right-[-44px]">
            <div className="sk-menu-wrap">
              <StayKnownActionMenu />
            </div>
          </div>
        </div>
      </header>

      <section className="relative mx-auto max-w-6xl px-4 pb-8 pt-8 sm:px-5 sm:pt-10">
        <div className="pointer-events-none absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-white/[0.035] blur-3xl" />

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.045] px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/50 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-white/65 shadow-[0_0_18px_rgba(255,255,255,0.5)]" />
            Platform support
          </div>

          <h1 className="mt-5 text-[31px] font-black leading-[1.05] tracking-[-0.06em] text-white sm:text-[46px]">
            Support the future of StayKnown
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-[13px] font-semibold leading-relaxed text-white/52 sm:text-[14px]">
            Your donation helps us expand backend systems, improve live safety
            infrastructure, strengthen multilingual chat translation, and keep
            building a safer platform for real people.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <a
              href="#donate"
              className="rounded-full border border-white/[0.12] bg-white/[0.045] px-5 py-3 text-[12px] font-black text-white/80 shadow-2xl shadow-black/30 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/[0.07] hover:text-white active:scale-[0.98]"
            >
              Donate Now
            </a>
            <a
              href="mailto:partnership@stay-known.com"
              className="rounded-full border border-white/[0.12] bg-white/[0.045] px-5 py-3 text-[12px] font-black text-white/80 shadow-2xl shadow-black/30 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/[0.07] hover:text-white active:scale-[0.98]"
            >
              Become a Partner
            </a>
          </div>
        </div>

        <div className="relative mt-8 grid gap-3 sm:grid-cols-2">
          {reasons.map((reason, index) => (
            <div
              key={reason.title}
              style={{ animationDelay: `${index * 65}ms` }}
              className="animate-[skFloatIn_0.42s_ease-out_both]"
            >
              <MiniCard {...reason} />
            </div>
          ))}
        </div>

        <div
          id="donate"
          className="relative mt-8 grid gap-4 lg:grid-cols-[1fr_0.92fr]"
        >
          <form
            onSubmit={submitDonation}
            className="relative overflow-hidden rounded-[2rem] border border-white/[0.11] bg-white/[0.05] p-4 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:p-5"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_33%),linear-gradient(135deg,rgba(255,255,255,0.075),transparent_28%)]" />

            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/[0.12] bg-black/35 text-white/85">
                  <IconHeart />
                </div>
                <div>
                  <h2 className="text-[17px] font-black tracking-[-0.03em] text-white">
                    Make a donation
                  </h2>
                  <p className="mt-1 text-[12px] font-semibold text-white/45">
                    Secure payment handled by Flutterwave.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] font-black uppercase tracking-[0.14em] text-white/38">
                    Currency
                  </span>
                  <select
                    value={currency}
                    onChange={(event) =>
                      onCurrencyChange(event.target.value as CurrencyCode)
                    }
                    className="mt-2 h-12 w-full rounded-2xl border border-white/[0.10] bg-black/55 px-3 text-[13px] font-bold text-white/82 outline-none transition focus:border-white/25"
                  >
                    {currencies.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.code} — {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-[11px] font-black uppercase tracking-[0.14em] text-white/38">
                    Custom amount
                  </span>
                  <input
                    value={customAmount}
                    onChange={(event) => setCustomAmount(event.target.value)}
                    inputMode="numeric"
                    placeholder={`${selectedCurrency.symbol} Custom`}
                    className="mt-2 h-12 w-full rounded-2xl border border-white/[0.10] bg-black/55 px-3 text-[13px] font-bold text-white/82 outline-none transition placeholder:text-white/25 focus:border-white/25"
                  />
                </label>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {selectedCurrency.amounts.map((item) => {
                  const active = !customAmount.trim() && item === amount;

                  return (
                    <button
                      key={`${currency}-${item}`}
                      type="button"
                      onClick={() => {
                        setAmount(item);
                        setCustomAmount("");
                      }}
                      className={cn(
                        "rounded-2xl border px-3 py-3 text-[12px] font-black transition active:scale-[0.98]",
                        active
                          ? "border-white/80 bg-white text-black shadow-lg shadow-white/10"
                          : "border-white/[0.10] bg-black/35 text-white/65 hover:border-white/[0.18] hover:bg-white/[0.055] hover:text-white",
                      )}
                    >
                      {formatAmount(item, currency)}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] font-black uppercase tracking-[0.14em] text-white/38">
                    Name
                  </span>
                  <input
                    value={donorName}
                    onChange={(event) => setDonorName(event.target.value)}
                    placeholder="Your name"
                    className="mt-2 h-12 w-full rounded-2xl border border-white/[0.10] bg-black/55 px-3 text-[13px] font-bold text-white/82 outline-none transition placeholder:text-white/25 focus:border-white/25"
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-black uppercase tracking-[0.14em] text-white/38">
                    Email for receipt
                  </span>
                  <input
                    value={donorEmail}
                    onChange={(event) => setDonorEmail(event.target.value)}
                    type="email"
                    placeholder="you@example.com"
                    className="mt-2 h-12 w-full rounded-2xl border border-white/[0.10] bg-black/55 px-3 text-[13px] font-bold text-white/82 outline-none transition placeholder:text-white/25 focus:border-white/25"
                    required
                  />
                </label>
              </div>

              <label className="mt-3 block">
                <span className="text-[11px] font-black uppercase tracking-[0.14em] text-white/38">
                  Message optional
                </span>
                <textarea
                  value={donorMessage}
                  onChange={(event) => setDonorMessage(event.target.value)}
                  placeholder="Leave a short message for the StayKnown team."
                  rows={4}
                  className="mt-2 w-full resize-none rounded-[1.35rem] border border-white/[0.10] bg-black/55 px-3 py-3 text-[13px] font-semibold leading-relaxed text-white/82 outline-none transition placeholder:text-white/25 focus:border-white/25"
                />
              </label>

              {errorText ? (
                <div className="mt-4 rounded-2xl border border-white/[0.12] bg-white/[0.055] px-4 py-3 text-[12px] font-bold leading-relaxed text-white/72">
                  {errorText}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={busy}
                className={cn(
                  "mt-5 flex h-13 w-full items-center justify-center rounded-full px-5 py-4 text-[13px] font-black shadow-2xl transition active:scale-[0.985]",
                  busy
                    ? "cursor-not-allowed bg-white/55 text-black/60"
                    : "bg-white text-black shadow-white/10 hover:-translate-y-0.5 hover:bg-white/90",
                )}
              >
                {busy ? "Opening secure checkout..." : "Donate Now"}
              </button>

              <p className="mt-3 text-center text-[11px] font-semibold leading-relaxed text-white/35">
                Payments are opened to supported countries and methods available
                through Flutterwave.
              </p>
            </div>
          </form>

          <aside className="grid content-start gap-3">
            <MiniCard
              title="Support with confidence"
              body="StayKnown is a real safety-focused platform. Donations help advance real technology, real infrastructure, and real user protection."
              icon={<IconShield />}
            />

            <div className="rounded-[1.55rem] border border-white/[0.10] bg-white/[0.045] p-4 shadow-2xl shadow-black/35 backdrop-blur-2xl">
              <h3 className="text-[13px] font-black text-white/90">
                Investor conversations
              </h3>
              <a
                href="mailto:investors@stay-known.com"
                className="mt-1 block text-[12px] font-bold text-white/55 transition hover:text-white"
              >
                investors@stay-known.com
              </a>

              <div className="my-4 h-px bg-white/[0.08]" />

              <h3 className="text-[13px] font-black text-white/90">
                Partnerships
              </h3>
              <a
                href="mailto:partnership@stay-known.com"
                className="mt-1 block text-[12px] font-bold text-white/55 transition hover:text-white"
              >
                partnership@stay-known.com
              </a>

              <div className="my-4 h-px bg-white/[0.08]" />

              <h3 className="text-[13px] font-black text-white/90">
                General requests
              </h3>
              <a
                href="/submit-request"
                className="mt-1 inline-flex rounded-full border border-white/[0.10] bg-black/35 px-3 py-2 text-[11px] font-black text-white/65 transition hover:bg-white/[0.065] hover:text-white"
              >
                Use the request form
              </a>
            </div>
          </aside>
        </div>
      </section>

      <footer className="relative z-20 w-full">
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-4 sm:pb-10 sm:pt-6">
          <div className="h-px bg-white/[0.08]" />

          <div className="mt-6 flex flex-col items-center gap-3 text-center sm:mt-8">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] font-semibold leading-relaxed text-white/42 sm:text-[12px]">
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white/75"
              >
                Privacy Policy
              </a>
              <span className="text-white/18">•</span>
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white/75"
              >
                Terms of Service
              </a>
              <span className="text-white/18">•</span>
              <a
                href="/location-safety"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white/75"
              >
                Location &amp; Live Safety
              </a>
              <span className="text-white/18">•</span>
              <a
                href="/acceptable-use"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white/75"
              >
                Acceptable Use
              </a>
              <span className="text-white/18">•</span>
              <a
                href="/safety"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white/75"
              >
                Safety &amp; Anti-Stalking
              </a>
              <span className="text-white/18">•</span>
              <a
                href="/trust-safety"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white/75"
              >
                Trust &amp; Safety
              </a>
              <span className="text-white/18">•</span>
              <a
                href="/security"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white/75"
              >
                Security Disclosure
              </a>
              <span className="text-white/18">•</span>
              <a
                href="/billing-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white/75"
              >
                Billing &amp; Refunds
              </a>
            </div>

            <div className="text-[12px] font-semibold text-white/50">
              A 6 Clement Joshua service
              <span className="ml-1 align-super text-[10px] text-white/25">
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
