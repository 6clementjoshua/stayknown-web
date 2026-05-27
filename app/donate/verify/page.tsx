"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import StayKnownActionMenu from "@/components/StayKnownActionMenu";

type VerifyState = "checking" | "success" | "failed";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
      <path d="M20 6.8 9.6 17.2 4 11.6" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
      <path d="M12 8v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 17h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M10.3 4.5 2.8 17.7A2 2 0 0 0 4.5 20.7h15a2 2 0 0 0 1.7-3L13.7 4.5a2 2 0 0 0-3.4 0Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

export default function DonateVerifyPage() {
  const [state, setState] = useState<VerifyState>("checking");
  const [message, setMessage] = useState("Please wait while we verify your payment.");
  const [details, setDetails] = useState<{
    amount?: number;
    currency_code?: string;
    tx_ref?: string;
    transaction_id?: string;
    donor_email?: string;
  } | null>(null);

  const params = useMemo(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function verifyDonation() {
      try {
        const transactionId =
          params?.get("transaction_id") ||
          params?.get("id") ||
          params?.get("transactionId") ||
          "";

        const txRef =
          params?.get("tx_ref") ||
          params?.get("txRef") ||
          params?.get("reference") ||
          "";

        if (!transactionId && !txRef) {
          throw new Error("Missing payment reference.");
        }

        const response = await fetch("/api/donations/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transaction_id: transactionId,
            tx_ref: txRef,
          }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data?.ok) {
          throw new Error(
            data?.message ||
              "We could not verify this donation. Please contact support with your payment reference.",
          );
        }

        if (cancelled) return;

        setDetails(data.donation || null);
        setState("success");
        setMessage(
          data?.message ||
            "Donation confirmed. Thank you for supporting StayKnown.",
        );
      } catch (error) {
        if (cancelled) return;

        setState("failed");
        setMessage(
          error instanceof Error
            ? error.message
            : "We could not verify this donation right now.",
        );
      }
    }

    verifyDonation();

    return () => {
      cancelled = true;
    };
  }, [params]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <style jsx global>{`
        html,
        body {
          background: #000;
          color-scheme: dark;
          overflow-x: hidden;
        }

        @keyframes skSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes skGlow {
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

        @keyframes skPanelIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.99);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
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
            <Image src="/6logo.png" alt="StayKnown" width={34} height={34} priority />
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

      <section className="relative mx-auto flex min-h-[calc(100vh-98px)] max-w-3xl items-center justify-center px-4 py-12">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.04] blur-3xl" />

        <div className="relative w-full animate-[skPanelIn_0.38s_ease-out_both] overflow-hidden rounded-[2rem] border border-white/[0.11] bg-white/[0.05] p-5 text-center shadow-2xl shadow-black/60 backdrop-blur-2xl sm:p-7">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.07),transparent_32%)]" />

          <div className="relative">
            <div
              className={cn(
                "mx-auto grid h-16 w-16 place-items-center rounded-[1.4rem] border shadow-2xl",
                state === "success"
                  ? "border-white/20 bg-white text-black shadow-white/10"
                  : state === "failed"
                    ? "border-white/15 bg-white/[0.06] text-white/80 shadow-black/50"
                    : "border-white/12 bg-black/45 text-white/80 shadow-black/50",
              )}
            >
              {state === "checking" ? (
                <div className="h-7 w-7 animate-[skSpin_0.85s_linear_infinite] rounded-full border-2 border-white/15 border-t-white/85" />
              ) : state === "success" ? (
                <CheckIcon />
              ) : (
                <AlertIcon />
              )}
            </div>

            <h1 className="mt-5 text-[25px] font-black leading-tight tracking-[-0.045em] text-white sm:text-[34px]">
              {state === "checking"
                ? "Confirming your donation"
                : state === "success"
                  ? "Thank you for supporting StayKnown"
                  : "Donation verification needs attention"}
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-[13px] font-semibold leading-relaxed text-white/52">
              {message}
            </p>

            {state === "success" && details ? (
              <div className="mx-auto mt-5 max-w-md rounded-[1.5rem] border border-white/[0.10] bg-black/35 p-4 text-left">
                <div className="grid gap-2 text-[12px] font-semibold text-white/55">
                  {details.currency_code && details.amount ? (
                    <div className="flex justify-between gap-4">
                      <span>Amount</span>
                      <span className="font-black text-white/82">
                        {details.currency_code} {Number(details.amount).toLocaleString()}
                      </span>
                    </div>
                  ) : null}

                  {details.tx_ref ? (
                    <div className="flex justify-between gap-4">
                      <span>Reference</span>
                      <span className="max-w-[210px] truncate font-black text-white/82">
                        {details.tx_ref}
                      </span>
                    </div>
                  ) : null}

                  {details.donor_email ? (
                    <div className="flex justify-between gap-4">
                      <span>Receipt</span>
                      <span className="max-w-[210px] truncate font-black text-white/82">
                        {details.donor_email}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <a
                href="/"
                className="rounded-full bg-white px-5 py-3 text-[12px] font-black text-black shadow-2xl shadow-white/10 transition hover:-translate-y-0.5 hover:bg-white/90 active:scale-[0.98]"
              >
                Return Home
              </a>

              {state === "failed" ? (
                <a
                  href="/submit-request"
                  className="rounded-full border border-white/[0.12] bg-white/[0.045] px-5 py-3 text-[12px] font-black text-white/80 shadow-2xl shadow-black/30 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/[0.07] hover:text-white active:scale-[0.98]"
                >
                  Contact Support
                </a>
              ) : (
                <a
                  href="/donate"
                  className="rounded-full border border-white/[0.12] bg-white/[0.045] px-5 py-3 text-[12px] font-black text-white/80 shadow-2xl shadow-black/30 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/[0.07] hover:text-white active:scale-[0.98]"
                >
                  Donate Again
                </a>
              )}
            </div>

            <p className="mt-5 text-[11px] font-semibold leading-relaxed text-white/34">
              A confirmation email is sent after successful verification. If payment was taken and this page did not confirm, contact support with your Flutterwave reference.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}