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
  | "vpn_blocked"
  | "expired"
  | "invalid"
  | "error";

type ActionResp = {
  ok: boolean;
  state?:
    | "recorded"
    | "already_recorded"
    | "vpn_blocked"
    | "expired"
    | "invalid"
    | "error";
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

function splitMessage(message: string) {
  return message
    .split(/\n+/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function fallbackMessage(uiState: UiState, contextSuccess: string) {
  switch (uiState) {
    case "already_recorded":
      return "This missed I’M SAFE response has already been received. If the situation has changed, continue checking on them directly. If there may be immediate danger, follow local emergency procedures.";
    case "vpn_blocked":
      return "StayKnown could not record this safety response because your connection appears to be using a VPN, proxy, relay, or hosted/masked network. Turn it off and try again so the safety record is not misleading.";
    case "expired":
      return "This response link expired for security reasons.";
    case "invalid":
      return "This response link is invalid or can no longer be trusted.";
    case "error":
      return "This response could not be completed right now. Please try again shortly.";
    default:
      return contextSuccess;
  }
}

function GlassSpinner() {
  return (
    <div className="relative h-9 w-9 shrink-0">
      <div
        className="absolute inset-0 rounded-full border border-black/12 border-t-black/70 animate-spin"
        style={{ animationDuration: "900ms" }}
      />
      <div
        className="absolute inset-[6px] rounded-full border border-black/8 border-b-black/45 animate-spin"
        style={{ animationDuration: "1300ms", animationDirection: "reverse" }}
      />
      <div className="absolute inset-[13px] rounded-full bg-black/70 shadow-[0_0_20px_rgba(0,0,0,0.16)]" />
    </div>
  );
}

function AnimatedCheck() {
  return (
    <div className="relative flex h-[74px] w-[74px] items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-black/[0.055] animate-[skApprovePulse_2.4s_ease-in-out_infinite]" />
      <div className="absolute inset-[7px] rounded-full border border-black/10 bg-white/94 shadow-[0_18px_44px_rgba(0,0,0,0.12)] backdrop-blur-xl" />
      <svg viewBox="0 0 52 52" className="relative z-[2] h-7 w-7" fill="none">
        <path
          d="M14 27.5 22.2 35.5 38.5 18.5"
          stroke="rgba(0,0,0,0.88)"
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
    <div className="relative flex h-[74px] w-[74px] items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-black/[0.055] animate-[skDeclinePulse_2.4s_ease-in-out_infinite]" />
      <div className="absolute inset-[7px] rounded-full border border-black/10 bg-white/94 shadow-[0_18px_44px_rgba(0,0,0,0.12)] backdrop-blur-xl" />
      <div className="relative z-[2] text-[28px] font-black leading-none text-black/78">
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
  tone?: "dark" | "light";
  disabled?: boolean;
}) {
  const cls =
    tone === "light"
      ? "bg-white/74 text-black/72 border-black/10 hover:bg-white/92"
      : "bg-black text-white border-black hover:shadow-[0_18px_44px_rgba(0,0,0,0.18)]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group relative overflow-hidden rounded-full border px-5 py-[13px] text-[12px] font-black tracking-[-0.01em] transition-all duration-200 ease-out active:scale-[0.985] ${
        disabled ? "cursor-not-allowed opacity-55" : "hover:-translate-y-[1px]"
      } ${cls}`}
    >
      <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-[linear-gradient(115deg,transparent_18%,rgba(255,255,255,0.24)_42%,transparent_64%)] bg-[length:220%_100%] animate-[skButtonSweep_1.8s_linear_infinite]" />
      <span className="relative z-[1]">{children}</span>
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-[18px] border border-black/[0.06] bg-white/52 px-4 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
      <div className="text-[9px] font-black uppercase tracking-[0.24em] text-black/34">
        {label}
      </div>
      <div className="mt-1 text-[12px] font-extrabold leading-5 text-black/72">
        {value}
      </div>
    </div>
  );
}

function StatusTitle({ uiState }: { uiState: UiState }) {
  const title =
    uiState === "recorded"
      ? "Response recorded"
      : uiState === "already_recorded"
        ? "Response already recorded"
        : uiState === "vpn_blocked"
          ? "Turn off VPN"
          : uiState === "expired"
            ? "Response link expired"
            : uiState === "invalid"
              ? "Invalid response link"
              : uiState === "working"
                ? "Recording your response"
                : "Confirm your safety response";

  return (
    <h1 className="mx-auto max-w-[520px] text-center text-[23px] font-black tracking-[-0.045em] text-black/90 md:text-[28px]">
      {title}
    </h1>
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
  const messageText = message || fallbackMessage(uiState, context.success);
  const messageParts = splitMessage(messageText);

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
      const state = data?.state;

      if (!res.ok || !data?.ok) {
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

        if (state === "vpn_blocked") {
          setUiState("vpn_blocked");
          setMessage(
            data?.message ||
              "StayKnown could not record this safety response because your connection appears to be using a VPN, proxy, relay, or hosted/masked network. Turn it off and try again so the safety record is not misleading.",
          );
          return;
        }

        if (state === "invalid") {
          setUiState("invalid");
          setMessage(
            data?.message ||
              "This response link is invalid or can no longer be trusted.",
          );
          return;
        }

        setUiState("error");
        setMessage(
          data?.message ||
            "This response could not be completed right now. Please try again shortly.",
        );
        return;
      }

      if (state === "already_recorded") {
        setUiState("already_recorded");
        setMessage(
          data.message ||
            "This missed I’M SAFE response has already been received. If the situation has changed, continue checking on them directly. If there may be immediate danger, follow local emergency procedures.",
        );
        return;
      }

      if (state === "vpn_blocked") {
        setUiState("vpn_blocked");
        setMessage(
          data.message ||
            "StayKnown could not record this safety response because your connection appears to be using a VPN, proxy, relay, or hosted/masked network. Turn it off and try again so the safety record is not misleading.",
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
    uiState === "vpn_blocked" ||
    uiState === "expired" ||
    uiState === "invalid" ||
    uiState === "error";

  const showDecline =
    uiState === "vpn_blocked" ||
    uiState === "expired" ||
    uiState === "invalid" ||
    uiState === "error";

  return (
    <div className="min-h-screen overflow-hidden bg-[#f3f4f6] px-4 py-7 text-black md:py-12">
      <style>{`
        @keyframes skApprovePulse {
          0%,100% { transform: scale(1); opacity: .92; }
          50% { transform: scale(1.08); opacity: .66; }
        }
        @keyframes skDeclinePulse {
          0%,100% { transform: scale(1); opacity: .92; }
          50% { transform: scale(1.08); opacity: .66; }
        }
        @keyframes skCheckDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes skButtonSweep {
          0% { background-position: 220% 0; }
          100% { background-position: -20% 0; }
        }
        @keyframes skFloat {
          0%,100% { transform: translate3d(0,0,0) scale(1); opacity:.48; }
          50% { transform: translate3d(0,-10px,0) scale(1.04); opacity:.74; }
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-120px] h-[280px] w-[280px] -translate-x-1/2 rounded-full bg-white/78 blur-3xl animate-[skFloat_6s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-160px] left-[-80px] h-[300px] w-[300px] rounded-full bg-black/[0.045] blur-3xl animate-[skFloat_7s_ease-in-out_infinite]" />
        <div className="absolute right-[-110px] top-[220px] h-[260px] w-[260px] rounded-full bg-white/72 blur-3xl animate-[skFloat_8s_ease-in-out_infinite]" />
      </div>

      <main className="relative z-[1] mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-[690px] items-center">
        <section className="w-full overflow-hidden rounded-[34px] border border-white/70 bg-white/72 shadow-[0_34px_110px_rgba(0,0,0,0.13)] backdrop-blur-2xl">
          <div className="border-b border-black/[0.06] bg-white/48 px-5 pb-5 pt-6 text-center md:px-8">
            <div className="flex justify-center">
              <div className="rounded-[23px] border border-white/90 bg-white/90 px-4 py-3 shadow-[0_14px_38px_rgba(0,0,0,0.12)] backdrop-blur-xl">
                <img
                  src="/6logo.png"
                  alt="StayKnown"
                  className="h-10 w-10 object-contain"
                />
              </div>
            </div>

            <div className="mt-4 text-[10px] font-black uppercase tracking-[0.36em] text-black/42">
              StayKnown
            </div>

            <div className="mt-2 text-[9px] font-black uppercase tracking-[0.26em] text-black/32">
              Missed I’M SAFE response
            </div>

            <div className="mx-auto mt-4 h-px max-w-[210px] bg-gradient-to-r from-transparent via-black/12 to-transparent" />

            <div className="mt-5">
              <StatusTitle uiState={uiState} />

              <div className="mx-auto mt-3 max-w-[530px] text-center text-[12px] font-semibold leading-6 text-black/58 md:text-[13px]">
                {uiState === "gate" ? (
                  <p>{context.title}</p>
                ) : uiState === "working" ? (
                  <p>Securely recording your response…</p>
                ) : (
                  messageParts.map((part, index) => (
                    <p
                      key={`${part}-${index}`}
                      className={index > 0 ? "mt-2" : ""}
                    >
                      {part}
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="px-5 py-5 md:px-8 md:py-6">
            <div className="rounded-[28px] border border-white/76 bg-white/58 p-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_18px_60px_rgba(0,0,0,0.06)] backdrop-blur-xl md:p-5">
              <div className="text-[9px] font-black uppercase tracking-[0.26em] text-black/34">
                Response overview
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <InfoRow label="Contact" value={shownContact} />
                <InfoRow label="Person to check" value={subjectName} />
                <InfoRow label="Response" value={label} />
                <InfoRow label="Security timer" value={remaining} />
                <InfoRow
                  label="Expected check-in"
                  value={fmtDateTime(expected)}
                />
                <InfoRow label="Due after" value={fmtDateTime(due)} />
              </div>
            </div>

            {uiState === "gate" && (
              <div className="mt-4 rounded-[28px] border border-white/76 bg-white/54 p-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_18px_60px_rgba(0,0,0,0.05)] backdrop-blur-xl md:p-5">
                <div className="text-[9px] font-black uppercase tracking-[0.26em] text-black/34">
                  StayKnown safety confirmation
                </div>

                <p className="mx-auto mt-3 max-w-[560px] text-center text-[12px] font-semibold leading-6 text-black/62">
                  {context.body}
                </p>

                <p className="mx-auto mt-3 max-w-[560px] text-center text-[12px] font-semibold leading-6 text-black/62">
                  Do not submit false, misleading, abusive, or pressure-based
                  responses. If you believe {subjectName} may be in immediate
                  danger, contact them directly and follow local emergency
                  procedures.
                </p>

                <p className="mx-auto mt-4 max-w-[560px] rounded-[22px] border border-black/[0.06] bg-white/58 px-4 py-3 text-center text-[10.5px] font-bold leading-5 text-black/46 shadow-[inset_0_1px_0_rgba(255,255,255,0.88)]">
                  For safety proof history, StayKnown may record your response
                  choice, response time, browser/device details, and approximate
                  IP-based location. VPN, proxy, or masked-network connections
                  may be blocked to prevent misleading safety records.
                </p>
              </div>
            )}

            <div className="mt-6 flex min-h-[88px] items-center justify-center">
              {uiState === "working" ? (
                <div className="flex flex-col items-center justify-center gap-3">
                  <GlassSpinner />
                  <div className="text-center text-[12px] font-black text-black/54">
                    Securely recording your response…
                  </div>
                </div>
              ) : uiState === "recorded" || uiState === "already_recorded" ? (
                <AnimatedCheck />
              ) : showDecline ? (
                <AnimatedDecline />
              ) : null}
            </div>

            {uiState === "gate" && (
              <div className="mt-2 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
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
                  tone="dark"
                  onClick={submitResponse}
                  disabled={busy}
                >
                  I understand and record my response
                </SweepButton>
              </div>
            )}

            {isFinal && (
              <div className="mt-2 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
                {(uiState === "error" || uiState === "vpn_blocked") && (
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

            <footer className="mt-6 border-t border-black/[0.07] pt-4 text-center text-[10px] font-semibold leading-5 text-black/42">
              This page is part of StayKnown safety awareness and internal proof
              history.
              <div className="mt-1">Support: {SUPPORT_EMAIL}</div>
              <div className="mt-1">
                A 6 Clement Joshua service™ · © {new Date().getFullYear()}
              </div>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}
