"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

function safeParam(v: string | null) {
  return (v ?? "").trim();
}

function buildAppDeepLink(reference: string, trxref: string, status: string) {
  const qs = new URLSearchParams();

  if (reference) qs.set("reference", reference);
  if (trxref) qs.set("trxref", trxref);
  if (status) qs.set("status", status);

  const query = qs.toString();

  return `stayknown://billing/paystack/callback${query ? `?${query}` : ""}`;
}

function tryOpenStayKnown(deepLink: string) {
  try {
    window.location.replace(deepLink);
    return;
  } catch (_) {
    // fallback below
  }

  try {
    window.location.href = deepLink;
    return;
  } catch (_) {
    // fallback below
  }

  try {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = deepLink;
    document.body.appendChild(iframe);

    window.setTimeout(() => {
      try {
        iframe.remove();
      } catch (_) {
        // ignore
      }
    }, 1200);
  } catch (_) {
    // ignore
  }
}

export default function PaystackBillingCallbackPage() {
  const [showOpenButton, setShowOpenButton] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const firstRetryTimer = useRef<number | null>(null);
  const secondRetryTimer = useRef<number | null>(null);
  const fallbackTimer = useRef<number | null>(null);

  const params = useMemo(() => {
    if (typeof window === "undefined") {
      return { reference: "", trxref: "", status: "" };
    }

    const sp = new URLSearchParams(window.location.search);

    return {
      reference: safeParam(sp.get("reference")),
      trxref: safeParam(sp.get("trxref")),
      status: safeParam(sp.get("status")),
    };
  }, []);

  const deepLink = useMemo(
    () => buildAppDeepLink(params.reference, params.trxref, params.status),
    [params.reference, params.trxref, params.status],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const openApp = () => {
      setAttemptCount((v) => v + 1);
      tryOpenStayKnown(deepLink);
    };

    // Try immediately.
    openApp();

    // Retry fast because some Android browsers ignore the first deep-link
    // while Paystack/browser redirect is still settling.
    firstRetryTimer.current = window.setTimeout(openApp, 350);

    // One more retry for slower Android WebView/browser behavior.
    secondRetryTimer.current = window.setTimeout(openApp, 950);

    // Show manual fallback quickly.
    fallbackTimer.current = window.setTimeout(() => {
      setShowOpenButton(true);
    }, 1200);

    return () => {
      if (firstRetryTimer.current !== null) {
        window.clearTimeout(firstRetryTimer.current);
      }

      if (secondRetryTimer.current !== null) {
        window.clearTimeout(secondRetryTimer.current);
      }

      if (fallbackTimer.current !== null) {
        window.clearTimeout(fallbackTimer.current);
      }
    };
  }, [deepLink]);

  const statusText =
    params.status.toLowerCase() === "success"
      ? "Payment received"
      : "Processing payment return";

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(180deg, #f4f5f7 0%, #eceff3 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          borderRadius: 28,
          border: "1px solid rgba(0,0,0,0.08)",
          background: "rgba(255,255,255,0.78)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          boxShadow:
            "0 28px 80px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.88)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "28px 22px 24px" }}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                width: 68,
                height: 68,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 22,
                background: "rgba(255,255,255,0.88)",
                border: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 14px 36px rgba(0,0,0,0.08)",
              }}
            >
              <Image
                src="/favicon.png"
                alt="StayKnown"
                width={42}
                height={42}
                priority
                style={{ objectFit: "contain" }}
              />
            </div>

            <div
              style={{
                marginTop: 14,
                fontSize: 18,
                fontWeight: 950,
                letterSpacing: "0.18em",
                color: "rgba(0,0,0,0.86)",
              }}
            >
              STAYKNOWN
            </div>

            <div
              style={{
                marginTop: 14,
                display: "inline-block",
                padding: "7px 12px",
                borderRadius: 999,
                border: "1px solid rgba(0,0,0,0.08)",
                background: "rgba(255,255,255,0.84)",
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: "0.04em",
                color: "rgba(0,0,0,0.78)",
              }}
            >
              {statusText}
            </div>

            <h1
              style={{
                margin: "16px 0 0",
                fontSize: 24,
                lineHeight: 1.15,
                fontWeight: 950,
                color: "#0b0b0b",
              }}
            >
              Opening StayKnown
            </h1>

            <p
              style={{
                margin: "12px auto 0",
                maxWidth: 420,
                fontSize: 14,
                lineHeight: 1.55,
                fontWeight: 700,
                color: "rgba(0,0,0,0.62)",
              }}
            >
              We received your payment return and are reopening the app now.
              StayKnown will confirm your subscription inside the app.
            </p>
          </div>

          <div
            style={{
              marginTop: 22,
              borderRadius: 22,
              border: "1px solid rgba(0,0,0,0.08)",
              background: "rgba(255,255,255,0.72)",
              padding: "18px 16px",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.88), 0 16px 40px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: "2px solid rgba(0,0,0,0.10)",
                  borderTopColor: "rgba(0,0,0,0.78)",
                  animation: "spin 0.9s linear infinite",
                }}
              />
            </div>

            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(0,0,0,0.45)",
                textAlign: "center",
              }}
            >
              Payment Reference
            </div>

            <div
              style={{
                marginTop: 8,
                textAlign: "center",
                fontSize: 14,
                fontWeight: 900,
                color: "rgba(0,0,0,0.84)",
                wordBreak: "break-word",
              }}
            >
              {params.reference || params.trxref || "Awaiting reference"}
            </div>

            <div
              style={{
                marginTop: 12,
                textAlign: "center",
                fontSize: 11.5,
                lineHeight: 1.45,
                fontWeight: 700,
                color: "rgba(0,0,0,0.48)",
              }}
            >
              Opening attempt {attemptCount || 1}
            </div>

            {showOpenButton ? (
              <div style={{ textAlign: "center", marginTop: 18 }}>
                <a
                  href={deepLink}
                  onClick={() => setAttemptCount((v) => v + 1)}
                  style={{
                    display: "inline-block",
                    padding: "12px 18px",
                    borderRadius: 999,
                    textDecoration: "none",
                    border: "1px solid rgba(0,0,0,0.10)",
                    background: "#0b0b0b",
                    color: "#ffffff",
                    fontSize: 13,
                    fontWeight: 900,
                    letterSpacing: "0.02em",
                    boxShadow: "0 18px 40px rgba(0,0,0,0.14)",
                  }}
                >
                  Open StayKnown
                </a>
              </div>
            ) : null}

            <p
              style={{
                margin: "16px 0 0",
                textAlign: "center",
                fontSize: 12.5,
                lineHeight: 1.5,
                fontWeight: 700,
                color: "rgba(0,0,0,0.56)",
              }}
            >
              If the app does not open automatically, use the button above.
            </p>
          </div>

          <div
            style={{
              marginTop: 18,
              textAlign: "center",
              fontSize: 11,
              lineHeight: 1.55,
              fontWeight: 700,
              color: "rgba(0,0,0,0.48)",
            }}
          >
            © {new Date().getFullYear()} StayKnown™ • A 6 Clement Joshua
            service™
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        html,
        body {
          margin: 0;
          padding: 0;
        }
      `}</style>
    </main>
  );
}
