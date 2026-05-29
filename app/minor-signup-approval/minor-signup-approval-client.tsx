// app/minor-signup-approval/minor-signup-approval-client.tsx
"use client";

import React from "react";

type Actor = "minor" | "guardian";
type Decision = "approve" | "decline";

type ActionResp = {
  ok: boolean;
  state?:
    | "pending_both"
    | "waiting_guardian"
    | "waiting_minor"
    | "fully_approved"
    | "declined"
    | "expired"
    | "cancelled"
    | "already_resolved"
    | "invalid"
    | "error";
  message?: string;
  request?: {
    id?: string;
    status?: string;

    minor_name?: string;
    minor_email_masked?: string;
    minor_age_years?: number | null;

    guardian_name?: string;
    guardian_email_masked?: string;
    guardian_relationship?: string;

    minor_approved?: boolean;
    guardian_approved?: boolean;
    minor_declined?: boolean;
    guardian_declined?: boolean;

    minor_completed_at?: string | null;
    guardian_completed_at?: string | null;
    decided_at?: string | null;

    consent_version?: string | null;
    expires_at?: string | null;
  };
};

type Props = {
  requestId: string;
  actor: Actor;
  decision: Decision;
  exp: number;
  sig: string;
};

type UiState =
  | "gate"
  | "working"
  | "waiting"
  | "approved"
  | "declined"
  | "expired"
  | "cancelled"
  | "invalid"
  | "error";

const SUPPORT_EMAIL = "support@stay-known.com";

function actorLabel(actor: Actor) {
  return actor === "minor" ? "minor user" : "parent or guardian";
}

function decisionLabel(decision: Decision) {
  return decision === "approve" ? "approve" : "decline";
}

function safeText(v?: string | null, fallback = "") {
  const s = (v || "").trim();
  return s || fallback;
}

function requestWasDeclined(req?: ActionResp["request"]) {
  return req?.minor_declined === true || req?.guardian_declined === true;
}

function requestIsFullyApproved(req?: ActionResp["request"]) {
  return req?.minor_approved === true && req?.guardian_approved === true;
}

function requestHasAnyApproval(req?: ActionResp["request"]) {
  return req?.minor_approved === true || req?.guardian_approved === true;
}

function isActorDone(actor: Actor, req?: ActionResp["request"]) {
  if (!req) return false;

  if (actor === "minor") {
    return req.minor_approved === true || req.minor_declined === true;
  }

  return req.guardian_approved === true || req.guardian_declined === true;
}

function formatRemaining(exp: number) {
  const now = Math.floor(Date.now() / 1000);
  const secs = Math.max(0, exp - now);
  const hours = Math.floor(secs / 3600);
  const mins = Math.floor((secs % 3600) / 60);
  const rem = secs % 60;

  if (hours > 0) {
    return `${hours}h ${String(mins).padStart(2, "0")}m`;
  }

  return `${mins}:${String(rem).padStart(2, "0")}`;
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

function MiniStatusRow({
  minorDone,
  guardianDone,
}: {
  minorDone: boolean;
  guardianDone: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-[18px] border border-black/8 bg-black/[0.03] px-4 py-4">
        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/42">
          Minor
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div
            className={`h-3.5 w-3.5 rounded-full border ${
              minorDone
                ? "border-[#0e8f70] bg-[#dff5ee]"
                : "border-black/14 bg-white"
            }`}
          />
          <div className="text-[13px] font-bold text-black/78">
            {minorDone ? "Completed" : "Waiting"}
          </div>
        </div>
      </div>

      <div className="rounded-[18px] border border-black/8 bg-black/[0.03] px-4 py-4">
        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/42">
          Guardian
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div
            className={`h-3.5 w-3.5 rounded-full border ${
              guardianDone
                ? "border-[#0e8f70] bg-[#dff5ee]"
                : "border-black/14 bg-white"
            }`}
          />
          <div className="text-[13px] font-bold text-black/78">
            {guardianDone ? "Completed" : "Waiting"}
          </div>
        </div>
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

export default function MinorSignupApprovalClient({
  requestId,
  actor,
  decision,
  exp,
  sig,
}: Props) {
  const [uiState, setUiState] = React.useState<UiState>("gate");
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [remaining, setRemaining] = React.useState(formatRemaining(exp));

  const [minorDone, setMinorDone] = React.useState(false);
  const [guardianDone, setGuardianDone] = React.useState(false);

  const [minorName, setMinorName] = React.useState("the minor user");
  const [minorEmailMasked, setMinorEmailMasked] = React.useState("");
  const [minorAge, setMinorAge] = React.useState<number | null>(null);

  const [guardianName, setGuardianName] = React.useState("the guardian");
  const [guardianEmailMasked, setGuardianEmailMasked] = React.useState("");
  const [guardianRelationship, setGuardianRelationship] =
    React.useState("parent/guardian");

  const hasSubmittedThisPageRef = React.useRef(false);
  const pollStopRef = React.useRef(false);
  const pollTimerRef = React.useRef<number | null>(null);

  const clearPolling = React.useCallback(() => {
    pollStopRef.current = true;
    if (pollTimerRef.current !== null) {
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const applyRequestDetails = React.useCallback((data: ActionResp) => {
    const req = data.request;

    setMinorDone(req?.minor_approved === true);
    setGuardianDone(req?.guardian_approved === true);

    setMinorName(safeText(req?.minor_name, "the minor user"));
    setMinorEmailMasked(safeText(req?.minor_email_masked));
    setMinorAge(
      typeof req?.minor_age_years === "number" ? req.minor_age_years : null,
    );

    setGuardianName(safeText(req?.guardian_name, "the guardian"));
    setGuardianEmailMasked(safeText(req?.guardian_email_masked));
    setGuardianRelationship(
      safeText(req?.guardian_relationship, "parent/guardian"),
    );
  }, []);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      if (now >= exp) {
        setRemaining("0:00");
        setUiState((prev) =>
          prev === "approved" || prev === "declined" ? prev : "expired",
        );
        window.clearInterval(timer);
        return;
      }
      setRemaining(formatRemaining(exp));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [exp]);

  const syncApprovalStatus = React.useCallback(
    async ({ allowWaiting = false }: { allowWaiting?: boolean } = {}) => {
      const res = await fetch(
        `/api/minor-signup/status?rid=${encodeURIComponent(requestId)}`,
        { cache: "no-store" },
      );

      const data = (await res.json().catch(() => ({}))) as ActionResp;

      if (!res.ok || !data?.ok) {
        if (hasSubmittedThisPageRef.current) {
          setUiState((prev) =>
            prev === "approved" || prev === "declined" ? prev : "waiting",
          );
          setMessage(
            actor === "minor"
              ? "Your confirmation has been recorded. StayKnown is waiting for your guardian to complete the consent review."
              : "Your guardian confirmation has been recorded. StayKnown is waiting for the minor to confirm they started this account creation flow.",
          );
          return false;
        }

        return false;
      }

      const req = data.request;
      applyRequestDetails(data);

      if (requestWasDeclined(req) || data.state === "declined") {
        setUiState("declined");
        setMessage(
          "This minor signup request was declined. StayKnown will not continue this account creation flow.",
        );
        return true;
      }

      if (data.state === "cancelled") {
        setUiState("cancelled");
        setMessage(
          "This minor signup request was cancelled. A fresh account creation flow is required.",
        );
        return true;
      }

      if (data.state === "expired" || req?.status === "expired") {
        setUiState("expired");
        setMessage(
          "This request expired for security reasons. A fresh account creation flow is required.",
        );
        return true;
      }

      if (data.state === "fully_approved" || requestIsFullyApproved(req)) {
        setUiState("approved");
        setMessage(
          "Both confirmations are complete. The minor signup flow may now continue to StayKnown email verification.",
        );
        return true;
      }

      const thisActorDone = isActorDone(actor, req);

      if (
        data.state === "waiting_guardian" ||
        data.state === "waiting_minor" ||
        allowWaiting ||
        thisActorDone ||
        hasSubmittedThisPageRef.current ||
        requestHasAnyApproval(req)
      ) {
        setUiState("waiting");

        if (data.state === "waiting_guardian") {
          setMessage(
            "The minor confirmation has been recorded. StayKnown is waiting for the guardian to approve.",
          );
        } else if (data.state === "waiting_minor") {
          setMessage(
            "The guardian confirmation has been recorded. StayKnown is waiting for the minor to confirm they started this account creation flow.",
          );
        } else {
          setMessage(
            actor === "minor"
              ? "Your confirmation has been recorded. StayKnown is waiting for your guardian to approve."
              : "Your guardian confirmation has been recorded. StayKnown is waiting for the minor to confirm.",
          );
        }

        return false;
      }

      setUiState("gate");
      setMessage("");
      return false;
    },
    [actor, applyRequestDetails, requestId],
  );

  const startPolling = React.useCallback(
    ({ allowWaiting = true }: { allowWaiting?: boolean } = {}) => {
      clearPolling();
      pollStopRef.current = false;

      async function tick() {
        if (pollStopRef.current) return;

        try {
          const done = await syncApprovalStatus({ allowWaiting });
          if (done || pollStopRef.current) {
            clearPolling();
            return;
          }
        } catch {}

        if (!pollStopRef.current) {
          pollTimerRef.current = window.setTimeout(tick, 1800);
        }
      }

      void tick();
    },
    [clearPolling, syncApprovalStatus],
  );

  React.useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const done = await syncApprovalStatus({ allowWaiting: false });
        if (cancelled) return;

        if (done) return;

        startPolling({ allowWaiting: false });
      } catch {
        if (!cancelled) {
          setUiState("error");
          setMessage(
            "This request could not be loaded right now. Please refresh or try again shortly.",
          );
        }
      }
    }

    void boot();

    return () => {
      cancelled = true;
      clearPolling();
    };
  }, [clearPolling, startPolling, syncApprovalStatus]);

  async function submitFinalDecision() {
    if (busy) return;

    hasSubmittedThisPageRef.current = true;
    clearPolling();
    setBusy(true);
    setUiState("working");
    setMessage("");

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch("/api/minor-signup/act", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          request_id: requestId,
          actor,
          decision,
          exp,
          sig,
        }),
      });

      window.clearTimeout(timeout);

      const data = (await res.json().catch(() => ({}))) as ActionResp;

      if (!res.ok || !data?.ok) {
        const state = data?.state;
        applyRequestDetails(data);

        if (state === "waiting_guardian" || state === "waiting_minor") {
          setUiState("waiting");
          setMessage(
            state === "waiting_guardian"
              ? "The minor confirmation has been recorded. StayKnown is waiting for guardian approval."
              : "The guardian confirmation has been recorded. StayKnown is waiting for the minor to confirm.",
          );

          window.setTimeout(() => {
            startPolling({ allowWaiting: true });
          }, 300);

          return;
        }

        if (state === "expired") {
          setUiState("expired");
          setMessage(
            data?.message ||
              `This request expired for security reasons. Please restart the process. For help, contact ${SUPPORT_EMAIL}.`,
          );
          return;
        }

        if (state === "declined") {
          setUiState("declined");
          setMessage(
            data?.message ||
              "This minor signup request has already been declined and will not proceed.",
          );
          return;
        }

        if (state === "cancelled") {
          setUiState("cancelled");
          setMessage(
            data?.message ||
              "This minor signup request was cancelled and cannot proceed.",
          );
          return;
        }

        if (state === "already_resolved") {
          const req = data.request;

          if (requestWasDeclined(req)) {
            setUiState("declined");
            setMessage(
              data?.message ||
                "This request has already been declined and will not proceed.",
            );
            return;
          }

          if (requestIsFullyApproved(req)) {
            setUiState("approved");
            setMessage(
              "This minor signup request was already approved. No further action is needed.",
            );
            return;
          }

          if (requestHasAnyApproval(req) || isActorDone(actor, req)) {
            setUiState("waiting");
            setMessage(
              actor === "minor"
                ? "Your confirmation has been recorded. StayKnown is waiting for your guardian."
                : "Your guardian confirmation has been recorded. StayKnown is waiting for the minor.",
            );

            window.setTimeout(() => {
              startPolling({ allowWaiting: true });
            }, 300);

            return;
          }

          setUiState("invalid");
          setMessage(
            data?.message ||
              `This request has already been resolved and cannot be changed. For help, contact ${SUPPORT_EMAIL}.`,
          );
          return;
        }

        setUiState("error");
        setMessage(
          data?.message ||
            "This request could not be completed right now. Please try again shortly.",
        );
        return;
      }

      applyRequestDetails(data);

      if (data.state === "declined") {
        setUiState("declined");
        setMessage(
          data.message ||
            "This request has been declined. StayKnown will not continue the minor account creation flow.",
        );
        return;
      }

      if (data.state === "fully_approved") {
        setUiState("approved");
        setMessage(
          data.message ||
            "Both confirmations are complete. The minor signup flow may now continue to email verification.",
        );
        return;
      }

      if (data.state === "waiting_guardian") {
        setUiState("waiting");
        setMessage(
          "Your confirmation has been recorded. StayKnown is waiting for guardian approval.",
        );

        window.setTimeout(() => {
          startPolling({ allowWaiting: true });
        }, 300);

        return;
      }

      if (data.state === "waiting_minor") {
        setUiState("waiting");
        setMessage(
          "Your guardian confirmation has been recorded. StayKnown is waiting for the minor to confirm they started this account creation flow.",
        );

        window.setTimeout(() => {
          startPolling({ allowWaiting: true });
        }, 300);

        return;
      }

      setUiState("waiting");
      setMessage(
        "This confirmation has been recorded. StayKnown is waiting for the other required confirmation.",
      );

      window.setTimeout(() => {
        startPolling({ allowWaiting: true });
      }, 300);
    } catch (e) {
      window.clearTimeout(timeout);

      try {
        const done = await syncApprovalStatus({ allowWaiting: true });

        if (done) return;

        if (hasSubmittedThisPageRef.current) {
          setUiState("waiting");
          setMessage(
            actor === "minor"
              ? "Your confirmation may have been recorded. StayKnown is checking for guardian approval."
              : "Your guardian confirmation may have been recorded. StayKnown is checking for the minor confirmation.",
          );

          window.setTimeout(() => {
            startPolling({ allowWaiting: true });
          }, 300);

          return;
        }
      } catch {}

      setUiState("error");
      setMessage(
        e instanceof DOMException && e.name === "AbortError"
          ? "The confirmation server took too long to respond. Please try again."
          : "This request could not be completed right now. Please try again shortly.",
      );
    } finally {
      setBusy(false);
    }
  }

  const titleText =
    decision === "approve"
      ? actor === "minor"
        ? "Confirm you started this account"
        : "Approve guardian consent"
      : actor === "minor"
        ? "Decline this account request"
        : "Decline guardian consent";

  const mainDescription =
    actor === "minor"
      ? decision === "approve"
        ? "You are confirming that you started this StayKnown account creation flow and understand that your parent or guardian must approve before you can continue."
        : "You are declining this StayKnown account creation flow. If you decline, the minor account setup will stop."
      : decision === "approve"
        ? "You are confirming that you are authorized to approve this minor’s StayKnown use and understand the safety, location, contact, chat, privacy, and emergency limits."
        : "You are declining guardian consent for this StayKnown minor account. If you decline, the account setup will stop.";

  const safetyContext =
    actor === "minor"
      ? "StayKnown asks this because someone may try to create a minor account without the minor’s awareness. Your confirmation helps prove that you started this flow willingly."
      : "Guardian approval means you understand StayKnown may process safety data such as approved contacts, SOS context, Visit sessions, chat metadata, and location-related safety information.";

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

      <div className="mx-auto w-full max-w-[760px]">
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
                Minor signup approval
              </div>
            </div>

            <div className="mt-5 text-center">
              <h1 className="mt-1 text-[25px] md:text-[29px] font-black tracking-[-0.04em] text-black/92">
                {uiState === "approved"
                  ? "Both confirmations complete"
                  : uiState === "declined"
                    ? "Signup request declined"
                    : uiState === "expired"
                      ? "Request expired"
                      : uiState === "cancelled"
                        ? "Request cancelled"
                        : uiState === "waiting"
                          ? "Waiting for the other confirmation"
                          : uiState === "invalid"
                            ? "Request already resolved"
                            : titleText}
              </h1>

              <p className="mt-3 text-[13px] md:text-[14px] leading-6 text-black/62">
                {uiState === "approved"
                  ? message ||
                    "Both required confirmations have been completed successfully."
                  : uiState === "declined"
                    ? message ||
                      "This minor signup request has been declined and will not continue."
                    : uiState === "expired"
                      ? message ||
                        "This request expired for security reasons and must be restarted."
                      : uiState === "cancelled"
                        ? message ||
                          "This request was cancelled and must be restarted."
                        : uiState === "waiting"
                          ? message ||
                            "One confirmation is complete. The request will finish only when the other party also confirms."
                          : uiState === "working"
                            ? "Securely processing your decision…"
                            : uiState === "error"
                              ? message ||
                                "This request could not be completed right now."
                              : mainDescription}
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-black/10 bg-white/72 p-4 shadow-[0_18px_55px_rgba(0,0,0,0.07)] backdrop-blur-2xl md:p-5">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/42">
                  Minor
                </div>

                <div className="mt-3 text-[16px] font-black text-black/86">
                  {minorName}
                </div>

                <div className="mt-1 text-[12px] font-semibold text-black/48">
                  {minorEmailMasked || "Email hidden"}
                </div>

                <div className="mt-2 text-[12px] font-bold text-black/58">
                  {minorAge ? `Age: ${minorAge}` : "Eligible minor flow"}
                </div>
              </div>

              <div className="rounded-[24px] border border-black/10 bg-white/72 p-4 shadow-[0_18px_55px_rgba(0,0,0,0.07)] backdrop-blur-2xl md:p-5">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/42">
                  Guardian
                </div>

                <div className="mt-3 text-[16px] font-black text-black/86">
                  {guardianName}
                </div>

                <div className="mt-1 text-[12px] font-semibold text-black/48">
                  {guardianEmailMasked || "Email hidden"}
                </div>

                <div className="mt-2 text-[12px] font-bold text-black/58">
                  Relationship: {guardianRelationship}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[24px] border border-black/10 bg-white/72 p-4 text-center shadow-[0_18px_55px_rgba(0,0,0,0.07)] backdrop-blur-2xl md:p-5">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/42">
                Request overview
              </div>

              <div className="mt-3 space-y-2 text-[12px] leading-5 text-black/68">
                <div>
                  <span className="font-black text-black/84">Role:</span>{" "}
                  {actorLabel(actor)}
                </div>

                <div>
                  <span className="font-black text-black/84">Decision:</span>{" "}
                  {decisionLabel(decision)}
                </div>

                <div>
                  <span className="font-black text-black/84">
                    Security timer:
                  </span>{" "}
                  {remaining}
                </div>

                <div>
                  <span className="font-black text-black/84">Request ID:</span>{" "}
                  <span className="break-all">{requestId}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[24px] border border-black/10 bg-white/72 p-4 text-center shadow-[0_18px_55px_rgba(0,0,0,0.07)] backdrop-blur-2xl md:p-5">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/42">
                StayKnown minor safety standard
              </div>

              <div className="mx-auto mt-3 max-w-[600px] text-[12px] leading-5 text-black/62">
                StayKnown is for lawful, safety-focused use only. It must not be
                used to stalk, punish, shame, exploit, secretly monitor, or
                pressure a minor. If either the minor or guardian declines, the
                signup flow stops.
              </div>

              <div className="mt-3 text-[13px] leading-6 text-black/68">
                {safetyContext}
              </div>
            </div>

            {actor === "guardian" &&
              uiState === "gate" &&
              decision === "approve" && (
                <div className="mt-4 rounded-[24px] border border-black/10 bg-black/[0.03] p-4 text-left md:p-5">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/42">
                    Guardian acknowledgement
                  </div>

                  <div className="mt-3 space-y-2 text-[12px] leading-5 text-black/64">
                    <div>
                      • I understand I may become the first trusted safety
                      contact for this minor after approval.
                    </div>
                    <div>
                      • I understand StayKnown can include location, Visit, SOS,
                      approved-contact, chat, and safety alert flows.
                    </div>
                    <div>
                      • I understand StayKnown does not replace official
                      emergency services, child-protection authorities, schools,
                      guardians, police, ambulance, or real-world safety
                      planning.
                    </div>
                    <div>
                      • I understand I may later request withdrawal, deletion,
                      or support subject to safety, legal, abuse-prevention, and
                      retention limits.
                    </div>
                  </div>
                </div>
              )}

            {(uiState === "waiting" ||
              uiState === "approved" ||
              uiState === "declined") && (
              <div className="mt-4">
                <MiniStatusRow
                  minorDone={minorDone}
                  guardianDone={guardianDone}
                />
              </div>
            )}

            <div className="mt-8 flex min-h-[118px] items-center justify-center">
              {uiState === "working" ? null : uiState === "approved" ||
                uiState === "waiting" ? (
                <AnimatedCheck />
              ) : uiState === "declined" ||
                uiState === "expired" ||
                uiState === "cancelled" ||
                uiState === "invalid" ||
                uiState === "error" ? (
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
                  tone={decision === "approve" ? "green" : "dark"}
                  onClick={submitFinalDecision}
                  disabled={busy}
                >
                  {decision === "approve"
                    ? actor === "minor"
                      ? "I started this account"
                      : "I understand and approve"
                    : actor === "minor"
                      ? "I decline this request"
                      : "I understand and decline"}
                </SweepButton>
              </div>
            )}

            {uiState === "working" && (
              <div className="flex flex-col items-center justify-center gap-3">
                <GlassSpinner />
                <div className="text-center text-[13px] font-bold text-black/62">
                  Securely processing your decision…
                </div>
              </div>
            )}

            {uiState === "waiting" && (
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="text-center text-[13px] font-bold text-black/62">
                  Confirmation recorded. Waiting for the other required
                  confirmation…
                </div>
              </div>
            )}

            {(uiState === "approved" ||
              uiState === "declined" ||
              uiState === "expired" ||
              uiState === "cancelled" ||
              uiState === "invalid" ||
              uiState === "error") && (
              <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row">
                {uiState === "error" && (
                  <SweepButton
                    tone="dark"
                    onClick={() => {
                      hasSubmittedThisPageRef.current = false;
                      setUiState("gate");
                      setMessage("");
                      startPolling({ allowWaiting: false });
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
              This page is part of StayKnown minor account protection and
              guardian consent review.
              <div className="mt-1">Support: {SUPPORT_EMAIL}</div>
              <div className="mt-1">
                A 6Clement Joshua Service™ · © {new Date().getFullYear()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
