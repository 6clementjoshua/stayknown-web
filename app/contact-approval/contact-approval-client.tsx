"use client";

import React from "react";

type Actor = "owner" | "target";
type Decision = "approve" | "decline";

type ActionResp = {
  ok: boolean;
  state?:
    | "pending_other_party"
    | "fully_approved"
    | "declined"
    | "expired"
    | "already_resolved"
    | "invalid";
  message?: string;
  request?: {
    status?: string;
    owner_approved?: boolean;
    target_approved?: boolean;
    owner_declined?: boolean;
    target_declined?: boolean;
    owner_completed_at?: string | null;
    target_completed_at?: string | null;
    expires_at?: string | null;
    added_type?: string | null;
    requester_name?: string | null;
    requester_email_masked?: string | null;
    target_name?: string | null;
    target_email_masked?: string | null;
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
  | "invalid"
  | "error";

type StatusSyncResult = "terminal" | "recorded" | "gate" | "unavailable";

const SUPPORT_EMAIL = "support@stay-known.com";

function actorLabel(actor: Actor) {
  return actor === "owner" ? "account owner" : "contact email owner";
}

function decisionLabel(decision: Decision) {
  return decision === "approve" ? "approve" : "decline";
}

function typeLabel(v?: string | null) {
  const s = (v || "").trim().toLowerCase();
  if (s === "sos") return "SOS contact";
  if (s === "emergency") return "emergency contact";
  return "contact";
}

function safePersonLabel(name?: string | null, emailMasked?: string | null) {
  const n = (name || "").trim();
  if (n) return n;
  return (emailMasked || "the user").trim();
}

function otherPartyHasApproved(
  req: ActionResp["request"] | undefined,
  actor: Actor,
) {
  if (!req) return false;

  if (actor === "owner") {
    return req.target_approved === true;
  }

  return req.owner_approved === true;
}

function requestIsFullyApproved(req?: ActionResp["request"]) {
  return req?.owner_approved === true && req?.target_approved === true;
}

function requestWasDeclined(req?: ActionResp["request"]) {
  return req?.owner_declined === true || req?.target_declined === true;
}

function formatRemaining(exp: number) {
  const now = Math.floor(Date.now() / 1000);
  const secs = Math.max(0, exp - now);
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
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
  ownerDone,
  targetDone,
}: {
  ownerDone: boolean;
  targetDone: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-[18px] border border-black/8 bg-black/[0.03] px-4 py-4">
        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/42">
          Account owner
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div
            className={`h-3.5 w-3.5 rounded-full border ${
              ownerDone
                ? "border-[#0e8f70] bg-[#dff5ee]"
                : "border-black/14 bg-white"
            }`}
          />
          <div className="text-[13px] font-bold text-black/78">
            {ownerDone ? "Completed" : "Waiting"}
          </div>
        </div>
      </div>

      <div className="rounded-[18px] border border-black/8 bg-black/[0.03] px-4 py-4">
        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/42">
          Contact email owner
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div
            className={`h-3.5 w-3.5 rounded-full border ${
              targetDone
                ? "border-[#0e8f70] bg-[#dff5ee]"
                : "border-black/14 bg-white"
            }`}
          />
          <div className="text-[13px] font-bold text-black/78">
            {targetDone ? "Completed" : "Waiting"}
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

export default function ContactApprovalClient({
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
  const [ownerDone, setOwnerDone] = React.useState(false);
  const [targetDone, setTargetDone] = React.useState(false);
  const [requestType, setRequestType] = React.useState("contact");
  const [requesterName, setRequesterName] = React.useState("StayKnown user");
  const [requesterEmailMasked, setRequesterEmailMasked] = React.useState("");
  const [targetName, setTargetName] = React.useState("");
  const [targetEmailMasked, setTargetEmailMasked] = React.useState("");

  const pollStopRef = React.useRef(false);
  const pollTimerRef = React.useRef<number | null>(null);

  const recordedMessage = React.useCallback(
    () =>
      actor === "owner"
        ? "Your confirmation has been recorded. The request will complete when the contact email owner also confirms."
        : "Your confirmation has been recorded. The request will complete when the account owner also confirms.",
    [actor],
  );

  const otherPartyMessage = React.useCallback(
    () =>
      actor === "owner"
        ? "The contact email owner has already confirmed. Please confirm from your side to complete this request."
        : "The account owner has already confirmed. Please confirm from your side to complete this request.",
    [actor],
  );

  const isThisActorDone = React.useCallback(
    (req?: ActionResp["request"]) => {
      if (!req) return false;

      if (actor === "owner") {
        return req.owner_approved === true || req.owner_declined === true;
      }

      return req.target_approved === true || req.target_declined === true;
    },
    [actor],
  );

  const clearPolling = React.useCallback(() => {
    pollStopRef.current = true;

    if (pollTimerRef.current !== null) {
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      const now = Math.floor(Date.now() / 1000);

      if (now >= exp) {
        setRemaining("0:00");
        setUiState((previous) =>
          previous === "approved" || previous === "declined"
            ? previous
            : "expired",
        );
        setMessage(
          (previous) =>
            previous ||
            "This request expired for security reasons. A fresh approval process is required.",
        );
        window.clearInterval(timer);
        return;
      }

      setRemaining(formatRemaining(exp));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [exp]);

  const applyRequestDetails = React.useCallback((data: ActionResp) => {
    const req = data.request;

    setOwnerDone(req?.owner_approved === true || req?.owner_declined === true);
    setTargetDone(
      req?.target_approved === true || req?.target_declined === true,
    );
    setRequestType(typeLabel(req?.added_type));
    setRequesterName((req?.requester_name || "StayKnown user").trim());
    setRequesterEmailMasked((req?.requester_email_masked || "").trim());
    setTargetName((req?.target_name || "").trim());
    setTargetEmailMasked((req?.target_email_masked || "").trim());
  }, []);

  const applyKnownRequestState = React.useCallback(
    (data: ActionResp): StatusSyncResult => {
      const req = data.request;

      applyRequestDetails(data);

      if (requestWasDeclined(req) || data.state === "declined") {
        setUiState("declined");
        setMessage("This request was declined. The email will not be added.");
        return "terminal";
      }

      if (data.state === "expired" || req?.status === "expired") {
        setUiState("expired");
        setMessage(
          "This request expired for security reasons. A fresh approval process is required.",
        );
        return "terminal";
      }

      if (data.state === "fully_approved" || requestIsFullyApproved(req)) {
        setUiState("approved");
        setMessage(
          "Both confirmations are complete. The contact has now been added successfully.",
        );
        return "terminal";
      }

      if (data.state === "invalid") {
        setUiState("invalid");
        setMessage(
          "This signed request is invalid or no longer available. Start a fresh approval process.",
        );
        return "terminal";
      }

      if (isThisActorDone(req)) {
        setUiState("waiting");
        setMessage(recordedMessage());
        return "recorded";
      }

      if (otherPartyHasApproved(req, actor)) {
        setUiState("gate");
        setMessage(otherPartyMessage());
        return "gate";
      }

      if (data.state === "already_resolved") {
        setUiState("invalid");
        setMessage(
          `This request has already been resolved and cannot be changed. For help, contact ${SUPPORT_EMAIL}.`,
        );
        return "terminal";
      }

      setUiState("gate");
      setMessage("");
      return "gate";
    },
    [
      actor,
      applyRequestDetails,
      isThisActorDone,
      otherPartyMessage,
      recordedMessage,
    ],
  );

  const syncApprovalStatus =
    React.useCallback(async (): Promise<StatusSyncResult> => {
      if (Math.floor(Date.now() / 1000) >= exp) {
        setUiState("expired");
        setMessage(
          "This request expired for security reasons. A fresh approval process is required.",
        );
        return "terminal";
      }

      try {
        const response = await fetch(
          `/api/contact-approval/status?rid=${encodeURIComponent(requestId)}`,
          { cache: "no-store" },
        );

        const data = (await response.json().catch(() => ({}))) as ActionResp;

        if (!response.ok || !data?.ok) {
          if (
            data?.state === "declined" ||
            data?.state === "expired" ||
            data?.state === "already_resolved" ||
            data?.state === "invalid"
          ) {
            return applyKnownRequestState(data);
          }

          return "unavailable";
        }

        return applyKnownRequestState(data);
      } catch {
        return "unavailable";
      }
    }, [applyKnownRequestState, exp, requestId]);

  const startPolling = React.useCallback(() => {
    clearPolling();
    pollStopRef.current = false;

    async function tick() {
      if (pollStopRef.current) return;

      const result = await syncApprovalStatus();

      if (result === "terminal" || pollStopRef.current) {
        clearPolling();
        return;
      }

      if (!pollStopRef.current) {
        pollTimerRef.current = window.setTimeout(tick, 1800);
      }
    }

    void tick();
  }, [clearPolling, syncApprovalStatus]);

  React.useEffect(() => {
    let cancelled = false;

    async function boot() {
      const result = await syncApprovalStatus();
      if (cancelled) return;

      if (result === "terminal") return;

      if (result === "unavailable") {
        setUiState("error");
        setMessage(
          "This request could not be loaded securely right now. Check your connection and try again.",
        );
        return;
      }

      startPolling();
    }

    void boot();

    return () => {
      cancelled = true;
      clearPolling();
    };
  }, [clearPolling, startPolling, syncApprovalStatus]);

  const closePage = React.useCallback(() => {
    if (typeof window === "undefined") return;

    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.assign("/");
  }, []);

  async function submitFinalDecision() {
    if (busy) return;

    clearPolling();
    setBusy(true);
    setUiState("working");
    setMessage("");

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch("/api/contact-approval/act", {
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

      const data = (await response.json().catch(() => ({}))) as ActionResp;

      if (!response.ok || !data?.ok) {
        if (data?.state === "pending_other_party") {
          applyRequestDetails(data);
          setUiState("waiting");
          setMessage(recordedMessage());
          window.setTimeout(startPolling, 300);
          return;
        }

        if (
          data?.state === "expired" ||
          data?.state === "declined" ||
          data?.state === "already_resolved" ||
          data?.state === "invalid"
        ) {
          const result = applyKnownRequestState(data);

          // An already-resolved response can mean the other party completed
          // first. In that case this actor must still see the confirmation gate.
          if (result === "gate") {
            startPolling();
          }

          return;
        }

        setUiState("error");
        setMessage(
          "This request could not be completed securely right now. Please try again shortly.",
        );
        return;
      }

      const result = applyKnownRequestState(data);

      if (result === "gate") {
        // The action endpoint accepted the request but returned an incomplete
        // snapshot. Keep the page stable while the status endpoint reconciles.
        setUiState("waiting");
        setMessage(
          "StayKnown received your decision and is securely confirming its status.",
        );
      }

      if (result !== "terminal") {
        window.setTimeout(startPolling, 300);
      }
    } catch (error) {
      const statusResult = await syncApprovalStatus();

      if (statusResult === "terminal" || statusResult === "recorded") {
        return;
      }

      setUiState("error");
      setMessage(
        error instanceof DOMException && error.name === "AbortError"
          ? "The confirmation took too long to verify. Check your connection and try again."
          : "StayKnown could not confirm whether the decision was received. Check your connection and try again.",
      );
    } finally {
      window.clearTimeout(timeout);
      setBusy(false);
    }
  }

  const titleText =
    decision === "approve"
      ? "Confirm this contact request"
      : "Decline this contact request";

  const reconfirmText =
    decision === "approve"
      ? `You are about to confirm, as the ${actorLabel(actor)}, that this ${requestType} request is legitimate.`
      : `You are about to decline, as the ${actorLabel(actor)}, this ${requestType} request.`;

  const actorContext =
    actor === "owner"
      ? `This means you confirm that you intentionally started the request to add ${safePersonLabel(
          targetName,
          targetEmailMasked,
        )}.`
      : `This means you confirm that you agree to be added as a ${requestType} for ${safePersonLabel(
          requesterName,
          requesterEmailMasked,
        )}.`;

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
                Contact confirmation
              </div>
            </div>

            <div className="mt-5 text-center">
              <h1 className="mt-1 text-[25px] md:text-[29px] font-black tracking-[-0.04em] text-black/92">
                {uiState === "approved"
                  ? "Confirmation complete"
                  : uiState === "declined"
                    ? "Request declined"
                    : uiState === "expired"
                      ? "Request expired"
                      : uiState === "waiting"
                        ? "Waiting for the other confirmation"
                        : uiState === "invalid"
                          ? "Request already resolved"
                          : uiState === "error"
                            ? "Secure confirmation unavailable"
                            : titleText}
              </h1>

              <p className="mt-3 text-[13px] md:text-[14px] leading-6 text-black/62">
                {uiState === "approved"
                  ? message ||
                    "Both required confirmations have been completed successfully."
                  : uiState === "declined"
                    ? message ||
                      "This request has been declined and the email will not be added."
                    : uiState === "expired"
                      ? message ||
                        "This request expired for security reasons and must be restarted."
                      : uiState === "waiting"
                        ? message ||
                          "One confirmation is complete. The request will finish only when the other party also confirms."
                        : uiState === "working"
                          ? "Securely processing your decision…"
                          : uiState === "error"
                            ? message ||
                              "This request could not be completed right now."
                            : message ||
                              `You were brought to this page because StayKnown requires explicit confirmation before a contact can be added. ${reconfirmText}`}
              </p>
            </div>

            <div className="mt-6 rounded-[24px] border border-black/10 bg-white/72 p-4 text-center shadow-[0_18px_55px_rgba(0,0,0,0.07)] backdrop-blur-2xl md:p-5">
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
                  <span className="font-black text-black/84">Protection:</span>{" "}
                  Signed, time-limited confirmation
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[24px] border border-black/10 bg-white/72 p-4 text-center shadow-[0_18px_55px_rgba(0,0,0,0.07)] backdrop-blur-2xl md:p-5">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/42">
                StayKnown safety standard
              </div>
              <div className="mx-auto mt-3 max-w-[560px] text-[12px] leading-5 text-black/62">
                StayKnown is only for known, trusted, and legitimate safety
                relationships. It must not be used to stalk, pressure, monitor,
                or track strangers. Abuse, false claims, or suspicious behavior
                may lead to restrictions, reporting, or account action where
                required.
              </div>

              <div className="mt-3 text-[13px] leading-6 text-black/68">
                {actorContext}
              </div>
            </div>

            {(uiState === "waiting" ||
              uiState === "approved" ||
              uiState === "declined") && (
              <div className="mt-4">
                <MiniStatusRow ownerDone={ownerDone} targetDone={targetDone} />
              </div>
            )}

            <div className="mt-8 flex min-h-[118px] items-center justify-center">
              {uiState === "working" ? null : uiState === "approved" ||
                uiState === "waiting" ? (
                <AnimatedCheck />
              ) : uiState === "declined" ||
                uiState === "expired" ||
                uiState === "invalid" ||
                uiState === "error" ? (
                <AnimatedDecline />
              ) : null}
            </div>
          </div>

          <div className="px-6 pb-6 pt-2 md:px-8 md:pb-8">
            {uiState === "gate" && (
              <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row">
                <SweepButton tone="light" onClick={closePage}>
                  Cancel
                </SweepButton>

                <SweepButton
                  tone={decision === "approve" ? "green" : "dark"}
                  onClick={submitFinalDecision}
                  disabled={busy}
                >
                  {decision === "approve"
                    ? "I understand and confirm"
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
                  Your confirmation is recorded. Waiting for the other
                  confirmation…
                </div>
              </div>
            )}

            {(uiState === "approved" ||
              uiState === "declined" ||
              uiState === "expired" ||
              uiState === "invalid" ||
              uiState === "error") && (
              <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row">
                {uiState === "error" && (
                  <SweepButton
                    tone="dark"
                    onClick={() => {
                      setUiState("working");
                      setMessage("Securely refreshing this request…");

                      void syncApprovalStatus().then((result) => {
                        if (result === "unavailable") {
                          setUiState("error");
                          setMessage(
                            "This request could not be loaded securely right now. Check your connection and try again.",
                          );
                          return;
                        }

                        if (result !== "terminal") {
                          startPolling();
                        }
                      });
                    }}
                  >
                    Try again
                  </SweepButton>
                )}

                <SweepButton tone="light" onClick={closePage}>
                  Close
                </SweepButton>
              </div>
            )}

            <div className="mt-6 border-t border-black/8 pt-4 text-center text-[11px] leading-5 text-black/46">
              This page is part of StayKnown account protection and contact
              safety review.
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
