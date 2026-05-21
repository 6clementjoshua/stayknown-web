// app/missed-im-safe-response/missed-im-safe-response-client.tsx
"use client";

import React from "react";

type ResponseChoice = "will_check" | "reached_them" | "could_not_reach";

type Props = {
  uid: string;
  contact: string;
  contactName: string;
  subjectName: string;
  response: ResponseChoice;
  expected: string;
  due: string;
  sent: string;
  exp: number;
  sig: string;
};

type UiState =
  | "gate"
  | "working"
  | "recorded"
  | "already_recorded"
  | "expired"
  | "invalid"
  | "error";

type ActionResp = {
  ok: boolean;
  state?: "recorded" | "already_recorded" | "expired" | "invalid" | "error";
  message?: string;
  title?: string;
};

const SUPPORT_EMAIL = "support@stay-known.com";

function responseLabel(response: ResponseChoice) {
  switch (response) {
    case "will_check":
      return "I will check on them";
    case "reached_them":
      return "I reached them";
    case "could_not_reach":
      return "Could not reach them";
  }
}

function responseContext(response: ResponseChoice, subjectName: string) {
  switch (response) {
    case "will_check":
      return {
        title: `You are about to record that you will check on ${subjectName}.`,
        body:
          `Only continue if you genuinely intend to check on ${subjectName} through a trusted contact method. ` +
          "By continuing, you confirm that StayKnown may record this response for internal safety history, support review, audit review, and investigation context connected to this missed I’M SAFE notice.",
        success: `Thank you. StayKnown recorded that you will check on ${subjectName}.`,
      };

    case "reached_them":
      return {
        title: `You are about to record that you reached ${subjectName}.`,
        body:
          `Only continue if you genuinely contacted ${subjectName} and believe this response is accurate. ` +
          "By continuing, you confirm that StayKnown may record this response for internal safety history, support review, audit review, and investigation context connected to this missed I’M SAFE notice.",
        success: `Thank you. StayKnown recorded that you reached ${subjectName}.`,
      };

    case "could_not_reach":
      return {
        title: `You are about to record that you could not reach ${subjectName}.`,
        body:
          `Only continue if you genuinely attempted to check on ${subjectName} and could not reach them. ` +
          "By continuing, you confirm that StayKnown may record this response for internal safety history, support review, audit review, and investigation context connected to this missed I’M SAFE notice.",
        success: `StayKnown recorded that you could not reach ${subjectName}.`,
      };
  }
}

function formatRemaining(exp: number) {
  const now = Math.floor(Date.now() / 1000);
  const secs = Math.max(0, exp - now);
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  return `${mins}:${String(rem).padStart(2, "0")}`;
}

function fmtDateTime(v: string) {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function GlassSpinner() {
  return (
    <div className="relative h-10 w-10 shrink-0">
      <div
        className="absolute inset-0 rounded-full border border-black/15 border-t-black/70 animate-spin"
        style={{ animationDuration: "900ms" }}
      />
      <div
        className="absolute inset-[6px] rounded-full border border-black/8 border-b-black/45 animate-spin"
        style={{ animationDuration: "1300ms", animationDirection: "reverse" }}
      />
    </div>
  );
}

function AnimatedCheck() {
  return (
    <div className="relative flex h-[86px] w-[86px] items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-[#dff5ee] animate-[skApprovePulse_2.4s_ease-in-out_infinite]" />
      <div className="absolute inset-[8px] rounded-full border border-[#bfe6d9] bg-white shadow-[0_18px_44px_rgba(14,143,112,0.18)]" />
      <svg viewBox="0 0 52 52" className="relative z-[2] h-8 w-8" fill="none">
        <path
          d="M14 27.5 22.2 35.5 38.5 18.5"
          stroke="#0e8f70"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-[skCheckDraw_700ms_ease-out_forwards]"
          style={{
            strokeDasharray: 40,
            strokeDashoffset: 40,
          }}
        />
      </svg>
    </div>
  );
}

function AnimatedDecline() {
  return (
    <div className="relative flex h-[86px] w-[86px] items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-[#f8e1e1] animate-[skDeclinePulse_2.4s_ease-in-out_infinite]" />
      <div className="absolute inset-[8px] rounded-full border border-[#ecc7c7] bg-white shadow-[0_18px_44px_rgba(160,47,47,0.16)]" />
      <div className="relative z-[2] text-[30px] font-black text-[#a02f2f] leading-none">
        ×
      </div>
    </div>
  );
}

function SweepButton({
  children,
  onClick,
  tone = "dark",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  tone?: "dark" | "green" | "light";
  disabled?: boolean;
}) {
  const cls =
    tone === "green"
      ? "bg-[#dff5ee] text-[#0e8f70] border-[#ccebdd] hover:shadow-[0_14px_34px_rgba(14,143,112,0.18)]"
      : tone === "light"
        ? "bg-black/[0.04] text-black/76 border-black/10 hover:bg-black/[0.06]"
        : "bg-black text-white border-black hover:shadow-[0_16px_34px_rgba(0,0,0,0.18)]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group relative overflow-hidden rounded-full border px-5 py-3 text-[13px] font-extrabold transition-all duration-200 ease-out active:scale-[0.985] ${
        disabled ? "opacity-55 cursor-not-allowed" : "hover:-translate-y-[1px]"
      } ${cls}`}
    >
      <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-[linear-gradient(115deg,transparent_18%,rgba(255,255,255,0.22)_42%,transparent_64%)] bg-[length:220%_100%] animate-[skButtonSweep_1.8s_linear_infinite]" />
      <span className="relative z-[1]">{children}</span>
    </button>
  );
}

export default function MissedImSafeResponseClient({
  uid,
  contact,
  contactName,
  subjectName,
  response,
  expected,
  due,
  sent,
  exp,
  sig,
}: Props) {
  const [uiState, setUiState] = React.useState<UiState>("gate");
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [remaining, setRemaining] = React.useState(formatRemaining(exp));

  const context = responseContext(response, subjectName);
  const label = responseLabel(response);
  const shownContact = contactName.trim() || contact;

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      if (now >= exp) {
        setRemaining("0:00");
        setUiState((prev) =>
          prev === "recorded" || prev === "already_recorded" ? prev : "expired",
        );
        window.clearInterval(timer);
        return;
      }

      setRemaining(formatRemaining(exp));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [exp]);

  async function submitResponse() {
    if (busy) return;

    setBusy(true);
    setUiState("working");
    setMessage("");

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch("/api/missed-im-safe-response/act", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          uid,
          contact,
          contact_name: contactName,
          subject_name: subjectName,
          response,
          expected,
          due,
          sent,
          exp,
          sig,
        }),
      });

      window.clearTimeout(timeout);

      const data = (await res.json().catch(() => ({}))) as ActionResp;

      if (!res.ok || !data?.ok) {
        const state = data?.state;

        if (state === "expired") {
          setUiState("expired");
          setMessage(
            data?.message || "This response link expired for security reasons.",
          );
          return;
        }

        if (state === "already_recorded") {
          setUiState("already_recorded");
          setMessage(
            data?.message ||
              "This missed I’M SAFE response has already been received. If the situation has changed, continue checking on them directly. If there may be immediate danger, follow local emergency procedures.",
          );
          return;
        }

        setUiState("error");
        setMessage(
          data?.message ||
            "This missed I’M SAFE response has already been received. If the situation has changed, continue checking on them directly. If there may be immediate danger, follow local emergency procedures.",
        );
        return;
      }

      if (data.state === "already_recorded") {
        setUiState("already_recorded");
        setMessage(
          data.message ||
            "A response from this contact has already been recorded for this missed I’M SAFE notice.",
        );
        return;
      }

      setUiState("recorded");
      setMessage(data.message || context.success);
    } catch (e) {
      window.clearTimeout(timeout);

      setUiState("error");
      setMessage(
        e instanceof DOMException && e.name === "AbortError"
          ? "The confirmation server took too long to respond. Please try again."
          : "This response could not be completed right now. Please try again shortly.",
      );
    } finally {
      setBusy(false);
    }
  }

  const isFinal =
    uiState === "recorded" ||
    uiState === "already_recorded" ||
    uiState === "expired" ||
    uiState === "invalid" ||
    uiState === "error";

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-black px-4 py-8 md:py-12">
      <style>{`
        @keyframes skApprovePulse {
          0%,100% { transform: scale(1); opacity: .92; }
          50% { transform: scale(1.08); opacity: .72; }
        }
        @keyframes skDeclinePulse {
          0%,100% { transform: scale(1); opacity: .92; }
          50% { transform: scale(1.08); opacity: .72; }
        }
        @keyframes skCheckDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes skButtonSweep {
          0% { background-position: 220% 0; }
          100% { background-position: -20% 0; }
        }
      `}</style>

      <div className="mx-auto w-full max-w-[720px]">
        <div className="rounded-[34px] border border-black/10 bg-white/92 shadow-[0_30px_100px_rgba(0,0,0,0.12)] backdrop-blur-2xl overflow-hidden">
          <div className="px-6 pt-6 md:px-8 md:pt-8">
            <div className="text-center">
              <div className="flex justify-center">
                <div className="rounded-[24px] border border-white/90 bg-white/90 px-4 py-3 shadow-[0_14px_38px_rgba(0,0,0,0.12)]">
                  <img
                    src="/6logo.png"
                    alt="StayKnown"
                    className="h-10 w-10 object-contain"
                  />
                </div>
              </div>

              <div className="mt-4 text-[11px] font-black uppercase tracking-[0.34em] text-black/42">
                StayKnown
              </div>

              <div className="mt-2 text-[10px] font-black uppercase tracking-[0.26em] text-black/34">
                Missed I’M SAFE response
              </div>
            </div>

            <div className="mt-5 text-center">
              <h1 className="mt-1 text-[25px] md:text-[29px] font-black tracking-[-0.04em] text-black/92">
                {uiState === "recorded"
                  ? "Response recorded"
                  : uiState === "already_recorded"
                    ? "Response already recorded"
                    : uiState === "expired"
                      ? "Response link expired"
                      : uiState === "invalid"
                        ? "Invalid response link"
                        : uiState === "working"
                          ? "Recording your response"
                          : "Confirm your safety response"}
              </h1>

              <p className="mt-3 text-[13px] md:text-[14px] leading-6 text-black/62">
                {uiState === "gate"
                  ? context.title
                  : uiState === "working"
                    ? "Securely recording your response…"
                    : message || context.success}
              </p>
            </div>

            <div className="mt-6 rounded-[24px] border border-black/8 bg-black/[0.03] p-4 md:p-5">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/42">
                Response overview
              </div>

              <div className="mt-3 space-y-3 text-[13px] leading-6 text-black/72">
                <div>
                  <span className="font-black text-black/84">Contact:</span>{" "}
                  {shownContact}
                </div>
                <div>
                  <span className="font-black text-black/84">
                    Person to check:
                  </span>{" "}
                  {subjectName}
                </div>
                <div>
                  <span className="font-black text-black/84">Response:</span>{" "}
                  {label}
                </div>
                <div>
                  <span className="font-black text-black/84">
                    Expected check-in:
                  </span>{" "}
                  {fmtDateTime(expected)}
                </div>
                <div>
                  <span className="font-black text-black/84">Due after:</span>{" "}
                  {fmtDateTime(due)}
                </div>
                <div>
                  <span className="font-black text-black/84">
                    Security timer:
                  </span>{" "}
                  {remaining}
                </div>
              </div>
            </div>

            {uiState === "gate" && (
              <div className="mt-4 rounded-[24px] border border-black/8 bg-black/[0.03] p-4 md:p-5">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/42">
                  StayKnown safety confirmation
                </div>
                <div className="mt-3 text-[13px] leading-6 text-black/68">
                  {context.body}
                </div>
                <div className="mt-3 text-[13px] leading-6 text-black/68">
                  Do not submit false, misleading, abusive, or pressure-based
                  responses. If you believe {subjectName} may be in immediate
                  danger, contact them directly and follow local emergency
                  procedures.
                </div>
              </div>
            )}

            <div className="mt-8 flex min-h-[118px] items-center justify-center">
              {uiState === "working" ? null : uiState === "recorded" ||
                uiState === "already_recorded" ? (
                <AnimatedCheck />
              ) : isFinal ? (
                <AnimatedDecline />
              ) : null}
            </div>
          </div>

          <div className="px-6 pb-6 pt-2 md:px-8 md:pb-8">
            {uiState === "gate" && (
              <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row">
                <SweepButton
                  tone="light"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.location.replace("about:blank");
                      window.close();
                    }
                  }}
                >
                  Cancel
                </SweepButton>

                <SweepButton
                  tone={response === "reached_them" ? "green" : "dark"}
                  onClick={submitResponse}
                  disabled={busy}
                >
                  I understand and record my response
                </SweepButton>
              </div>
            )}

            {uiState === "working" && (
              <div className="flex flex-col items-center justify-center gap-3">
                <GlassSpinner />
                <div className="text-center text-[13px] font-bold text-black/62">
                  Securely recording your response…
                </div>
              </div>
            )}

            {isFinal && (
              <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row">
                {uiState === "error" && (
                  <SweepButton
                    tone="dark"
                    onClick={() => {
                      setUiState("gate");
                      setMessage("");
                    }}
                  >
                    Try again
                  </SweepButton>
                )}

                <SweepButton
                  tone="light"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.location.replace("about:blank");
                      window.close();
                    }
                  }}
                >
                  Close
                </SweepButton>
              </div>
            )}

            <div className="mt-6 border-t border-black/8 pt-4 text-center text-[11px] leading-5 text-black/46">
              This page is part of StayKnown safety awareness and internal proof
              history.
              <div className="mt-1">Support: {SUPPORT_EMAIL}</div>
              <div className="mt-1">
                A 6 Clement Joshua service™ · © {new Date().getFullYear()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
