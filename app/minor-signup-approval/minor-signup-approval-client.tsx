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

function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="m7.5 4.5 5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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

function MinorIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle
        cx="12"
        cy="8.2"
        r="3.2"
        stroke="currentColor"
        strokeWidth="1.65"
      />
      <path
        d="M5.7 19c.72-3.5 2.87-5.35 6.3-5.35s5.58 1.85 6.3 5.35"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GuardianIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M8.4 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="1.65"
      />
      <path
        d="M3.8 19.2c.55-3.05 2.22-4.78 4.6-4.78 1.45 0 2.62.64 3.45 1.82"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
      <path
        d="M16.8 20.4c2.5-.82 4.2-3.2 4.2-5.85V11.3l-4.2-1.65-4.2 1.65v3.25c0 2.65 1.7 5.03 4.2 5.85Z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
      <path
        d="m14.9 15.1 1.25 1.25 2.55-2.8"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle
        cx="12"
        cy="12"
        r="8.25"
        stroke="currentColor"
        strokeWidth="1.65"
      />
      <path
        d="M12 7.4v5.1l3.25 1.95"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AmbientBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[#050505]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-15%,rgba(255,255,255,0.16),transparent_38%),radial-gradient(circle_at_8%_28%,rgba(255,255,255,0.055),transparent_25%),radial-gradient(circle_at_92%_34%,rgba(255,255,255,0.045),transparent_24%),linear-gradient(180deg,#0b0b0c_0%,#050505_42%,#000_100%)]" />
      <div className="absolute left-[-8rem] top-[18%] h-72 w-72 rounded-full bg-white/[0.035] blur-[90px] animate-[skFloatA_12s_ease-in-out_infinite]" />
      <div className="absolute right-[-7rem] top-[8%] h-80 w-80 rounded-full bg-white/[0.03] blur-[100px] animate-[skFloatB_15s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-9rem] left-[24%] h-96 w-96 rounded-full bg-white/[0.025] blur-[120px] animate-[skFloatA_18s_ease-in-out_infinite_reverse]" />
      <div className="absolute inset-0 opacity-[0.055] [background-image:linear-gradient(rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.18)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:linear-gradient(to_bottom,black,transparent_72%)]" />
    </div>
  );
}

function GlassSpinner() {
  return (
    <div
      className="relative h-11 w-11 shrink-0"
      role="status"
      aria-label="Loading"
    >
      <div
        className="absolute inset-0 rounded-full border border-white/15 border-t-white animate-spin shadow-[0_0_28px_rgba(255,255,255,0.14)]"
        style={{ animationDuration: "900ms" }}
      />
      <div
        className="absolute inset-[7px] rounded-full border border-white/10 border-b-white/55 animate-spin"
        style={{ animationDuration: "1350ms", animationDirection: "reverse" }}
      />
      <div className="absolute inset-[15px] rounded-full bg-white/90 shadow-[0_0_18px_rgba(255,255,255,0.32)]" />
    </div>
  );
}

function AnimatedCheck() {
  return (
    <div className="relative flex h-[94px] w-[94px] items-center justify-center">
      <div className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.04] shadow-[0_0_55px_rgba(255,255,255,0.12)] animate-[skApprovePulse_2.4s_ease-in-out_infinite]" />
      <div className="absolute inset-[8px] rounded-full border border-white/20 bg-[linear-gradient(145deg,rgba(255,255,255,.98),rgba(215,215,215,.82))] shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_-10px_24px_rgba(0,0,0,.12),0_20px_46px_rgba(0,0,0,.34)]" />
      <div className="absolute inset-[15px] rounded-full border border-black/10 bg-black shadow-[inset_0_1px_1px_rgba(255,255,255,.18),0_8px_24px_rgba(0,0,0,.5)]" />
      <svg viewBox="0 0 52 52" className="relative z-[2] h-8 w-8" fill="none">
        <path
          d="M14 27.5 22.2 35.5 38.5 18.5"
          stroke="white"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-[skCheckDraw_700ms_ease-out_forwards]"
          style={{ strokeDasharray: 40, strokeDashoffset: 40 }}
        />
      </svg>
    </div>
  );
}

function AnimatedDecline() {
  return (
    <div className="relative flex h-[94px] w-[94px] items-center justify-center">
      <div className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.04] shadow-[0_0_55px_rgba(255,255,255,0.1)] animate-[skDeclinePulse_2.4s_ease-in-out_infinite]" />
      <div className="absolute inset-[8px] rounded-full border border-white/15 bg-[linear-gradient(145deg,#3d3d3f,#151516)] shadow-[inset_0_1px_0_rgba(255,255,255,.2),inset_0_-10px_24px_rgba(0,0,0,.4),0_20px_46px_rgba(0,0,0,.42)]" />
      <div className="relative z-[2] text-[34px] font-light leading-none text-white">
        ×
      </div>
    </div>
  );
}

function StatusDot({ done }: { done: boolean }) {
  return (
    <span
      className={`relative grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
        done
          ? "border-white/35 bg-white text-black shadow-[0_0_20px_rgba(255,255,255,.22)]"
          : "border-white/15 bg-black/50 text-transparent"
      }`}
      aria-hidden="true"
    >
      {done ? (
        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
          <path
            d="m3.5 8.2 2.6 2.6 6.1-6.1"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
      )}
    </span>
  );
}

function MiniStatusRow({
  minorDone,
  guardianDone,
}: {
  minorDone: boolean;
  guardianDone: boolean;
}) {
  const items = [
    { label: "Minor", done: minorDone },
    { label: "Guardian", done: guardianDone },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="group relative min-w-0 overflow-hidden rounded-[22px] border border-white/[0.11] bg-[linear-gradient(145deg,rgba(255,255,255,.085),rgba(255,255,255,.025))] p-[1px] shadow-[0_18px_42px_rgba(0,0,0,.28)]"
        >
          <div className="relative rounded-[21px] border border-black/35 bg-black/55 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,.08),inset_0_-12px_28px_rgba(0,0,0,.3)] backdrop-blur-xl">
            <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/38">
                  {item.label}
                </div>
                <div className="mt-1.5 truncate text-[13px] font-bold text-white/82">
                  {item.done ? "Completed" : "Waiting"}
                </div>
              </div>
              <StatusDot done={item.done} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SweepButton({
  children,
  onClick,
  tone = "dark",
  disabled = false,
  showChevron = true,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  tone?: "dark" | "light" | "ghost";
  disabled?: boolean;
  showChevron?: boolean;
}) {
  const cls =
    tone === "light"
      ? "border-white/85 bg-[linear-gradient(145deg,#ffffff,#d9d9db)] text-black shadow-[inset_0_1px_0_white,inset_0_-8px_18px_rgba(0,0,0,.12),0_16px_38px_rgba(0,0,0,.34)]"
      : tone === "ghost"
        ? "border-white/[0.11] bg-white/[0.04] text-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_12px_30px_rgba(0,0,0,.22)]"
        : "border-white/[0.16] bg-[linear-gradient(145deg,#323234,#080809)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.14),inset_0_-10px_24px_rgba(0,0,0,.46),0_18px_42px_rgba(0,0,0,.42)]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group relative min-h-12 touch-manipulation overflow-hidden rounded-[18px] border px-5 py-3 text-[12.5px] font-black tracking-[-0.01em] outline-none transition duration-300 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.985] ${
        disabled
          ? "cursor-not-allowed opacity-45"
          : "hover:-translate-y-0.5 hover:brightness-110"
      } ${cls}`}
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-[130%] bg-[linear-gradient(110deg,transparent_18%,rgba(255,255,255,.32)_45%,transparent_70%)] transition-transform duration-700 group-hover:translate-x-[130%]" />
      <span className="relative z-[1] flex items-center justify-center gap-2">
        <span>{children}</span>
        {showChevron ? (
          <ChevronIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        ) : null}
      </span>
    </button>
  );
}

function IdentityCard({
  label,
  name,
  email,
  detail,
  icon,
}: {
  label: string;
  name: string;
  email: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group relative min-w-0 overflow-hidden rounded-[26px] border border-white/[0.1] bg-[linear-gradient(145deg,rgba(255,255,255,.1),rgba(255,255,255,.025))] p-[1px] shadow-[0_20px_55px_rgba(0,0,0,.3)] transition duration-300 hover:-translate-y-0.5 hover:border-white/[0.18]">
      <div className="relative h-full rounded-[25px] border border-black/45 bg-black/60 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.09),inset_0_-18px_34px_rgba(0,0,0,.34)] backdrop-blur-2xl md:p-5">
        <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
        <div className="flex min-w-0 items-start gap-3.5">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[16px] border border-white/[0.12] bg-[linear-gradient(145deg,rgba(255,255,255,.13),rgba(255,255,255,.035))] text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,.13),0_12px_28px_rgba(0,0,0,.28)]">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/38">
              {label}
            </div>
            <div className="mt-2 break-words text-[16px] font-black text-white/92">
              {name}
            </div>
            <div className="mt-1 break-all text-[12px] font-semibold text-white/42">
              {email}
            </div>
            <div className="mt-2 text-[12px] font-bold text-white/58">
              {detail}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressRail({ uiState }: { uiState: UiState }) {
  const atResult =
    uiState === "approved" ||
    uiState === "declined" ||
    uiState === "expired" ||
    uiState === "cancelled" ||
    uiState === "invalid" ||
    uiState === "error";
  const atConfirm = uiState !== "gate";
  const steps = [
    { label: "Review", active: true },
    { label: "Confirm", active: atConfirm },
    { label: "Result", active: atResult },
  ];

  return (
    <div className="mx-auto flex max-w-[460px] items-center justify-center gap-1.5 sm:gap-2">
      {steps.map((step, index) => (
        <React.Fragment key={step.label}>
          <div
            className={`rounded-full border px-3 py-1.5 text-[9.5px] font-black uppercase tracking-[0.16em] transition ${
              step.active
                ? "border-white/20 bg-white text-black shadow-[0_8px_22px_rgba(255,255,255,.1)]"
                : "border-white/[0.08] bg-white/[0.025] text-white/30"
            }`}
          >
            {step.label}
          </div>
          {index < steps.length - 1 ? (
            <ChevronIcon
              className={`h-3 w-3 shrink-0 ${
                steps[index + 1].active ? "text-white/62" : "text-white/18"
              }`}
            />
          ) : null}
        </React.Fragment>
      ))}
    </div>
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

      /*
      Critical rule:
      Do NOT send this page to "waiting" just because the other person already approved.

      Example:
      - Guardian approved first.
      - Backend state is waiting_minor.
      - Minor opens actor=minor link.
      The minor must still see the gate and be able to approve.

      Waiting screen is only correct when:
      - this actor already submitted, or
      - this actor's side is already done, or
      - caller explicitly allows waiting after submission/polling.
    */
      if (thisActorDone || hasSubmittedThisPageRef.current || allowWaiting) {
        setUiState("waiting");

        if (data.state === "waiting_guardian") {
          setMessage(
            actor === "minor"
              ? "Your confirmation has been recorded. StayKnown is waiting for guardian approval."
              : "The minor confirmation is complete. Please complete the guardian decision if you have not already done so.",
          );
        } else if (data.state === "waiting_minor") {
          setMessage(
            actor === "guardian"
              ? "Your guardian confirmation has been recorded. StayKnown is waiting for the minor to confirm they started this account creation flow."
              : "Guardian approval is complete. Please confirm that you started this account creation flow.",
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

      /*
      If the other party has already approved but THIS link actor has not,
      keep the page on the decision gate so this actor can approve/decline.
    */
      setUiState("gate");

      if (actor === "minor" && data.state === "waiting_minor") {
        setMessage(
          "Guardian approval is complete. Please confirm that you personally started this StayKnown account request.",
        );
      } else if (actor === "guardian" && data.state === "waiting_guardian") {
        setMessage(
          "The minor has confirmed this account request. Please complete the guardian decision.",
        );
      } else {
        setMessage("");
      }

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
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-black text-white">
      <AmbientBackdrop />

      <style jsx global>{`
        @keyframes skApprovePulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.58;
          }
        }

        @keyframes skDeclinePulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.88;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.56;
          }
        }

        @keyframes skCheckDraw {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes skFloatA {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(14px, -20px, 0) scale(1.05);
          }
        }

        @keyframes skFloatB {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(-18px, 16px, 0) scale(1.04);
          }
        }

        @keyframes skRise {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.99);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes skHalo {
          0%,
          100% {
            opacity: 0.34;
            transform: scale(0.98);
          }
          50% {
            opacity: 0.72;
            transform: scale(1.03);
          }
        }

        html {
          background: #000;
          color-scheme: dark;
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          min-width: 320px;
          overflow-x: hidden;
          background: #000;
        }

        * {
          box-sizing: border-box;
        }

        @media (hover: none) {
          .sk-hover-lift {
            transform: none !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[1040px] items-start justify-center px-3 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-5 sm:pt-7 lg:items-center lg:py-10">
        <section className="relative w-full min-w-0 overflow-hidden rounded-[30px] border border-white/[0.13] bg-[linear-gradient(145deg,rgba(255,255,255,.13),rgba(255,255,255,.025))] p-[1px] shadow-[0_42px_130px_rgba(0,0,0,.68),0_0_0_1px_rgba(255,255,255,.025)] sm:rounded-[38px]">
          <div className="relative overflow-hidden rounded-[29px] border border-black/70 bg-[linear-gradient(180deg,rgba(25,25,27,.93),rgba(5,5,6,.98))] shadow-[inset_0_1px_0_rgba(255,255,255,.11),inset_0_-28px_70px_rgba(0,0,0,.5)] backdrop-blur-3xl sm:rounded-[37px]">
            <div className="pointer-events-none absolute inset-x-[8%] top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
            <div className="pointer-events-none absolute left-[12%] top-[-9rem] h-64 w-64 rounded-full bg-white/[0.07] blur-[80px] animate-[skHalo_7s_ease-in-out_infinite]" />
            <div className="pointer-events-none absolute right-[-5rem] top-[18%] h-52 w-52 rounded-full bg-white/[0.035] blur-[70px]" />

            <header className="relative border-b border-white/[0.08] px-4 pb-7 pt-5 sm:px-7 sm:pb-8 sm:pt-7 md:px-9">
              <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
                <div className="relative">
                  <div className="absolute -inset-3 rounded-[28px] bg-white/[0.06] blur-xl animate-[skHalo_5s_ease-in-out_infinite]" />
                  <div className="relative rounded-[24px] border border-white/[0.18] bg-[linear-gradient(145deg,rgba(255,255,255,.98),rgba(210,210,212,.88))] p-3 shadow-[inset_0_1px_0_white,inset_0_-8px_18px_rgba(0,0,0,.13),0_18px_44px_rgba(0,0,0,.42)]">
                    <img
                      src="/6logo.png"
                      alt="StayKnown"
                      className="h-10 w-10 object-contain sm:h-11 sm:w-11"
                    />
                  </div>
                </div>

                <div className="mt-4 text-[11px] font-black uppercase tracking-[0.34em] text-white/86">
                  StayKnown
                </div>
                <div className="mt-1.5 text-[9.5px] font-black uppercase tracking-[0.25em] text-white/35">
                  Minor signup protection
                </div>

                <div className="mt-5 w-full">
                  <ProgressRail uiState={uiState} />
                </div>

                <div
                  className="mt-6 animate-[skRise_550ms_ease-out_both]"
                  aria-live="polite"
                >
                  <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.035] px-3 py-1.5 text-[9.5px] font-black uppercase tracking-[0.16em] text-white/48 shadow-[inset_0_1px_0_rgba(255,255,255,.07)]">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        uiState === "approved"
                          ? "bg-white shadow-[0_0_10px_rgba(255,255,255,.9)]"
                          : uiState === "working" || uiState === "waiting"
                            ? "bg-white/60 shadow-[0_0_10px_rgba(255,255,255,.45)]"
                            : "bg-white/30"
                      }`}
                    />
                    {uiState === "approved"
                      ? "Approved"
                      : uiState === "declined"
                        ? "Declined"
                        : uiState === "expired"
                          ? "Expired"
                          : uiState === "cancelled"
                            ? "Cancelled"
                            : uiState === "waiting"
                              ? "Waiting"
                              : uiState === "working"
                                ? "Processing"
                                : uiState === "error"
                                  ? "Needs attention"
                                  : "Secure review"}
                  </div>

                  <h1 className="mx-auto mt-4 max-w-3xl text-balance text-[27px] font-black leading-[1.06] tracking-[-0.045em] text-white sm:text-[34px] md:text-[40px]">
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

                  <p className="mx-auto mt-4 max-w-2xl text-pretty text-[13px] font-semibold leading-6 text-white/55 sm:text-[14px]">
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
                                  : message || mainDescription}
                  </p>
                </div>
              </div>
            </header>

            <div className="relative grid min-w-0 gap-0 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className="min-w-0 px-4 py-5 sm:px-7 sm:py-7 md:px-9 lg:pr-7">
                <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                  <IdentityCard
                    label="Minor"
                    name={minorName}
                    email={minorEmailMasked || "Email hidden"}
                    detail={
                      minorAge ? `Age: ${minorAge}` : "Eligible minor flow"
                    }
                    icon={<MinorIcon className="h-5 w-5" />}
                  />

                  <IdentityCard
                    label="Guardian"
                    name={guardianName}
                    email={guardianEmailMasked || "Email hidden"}
                    detail={`Relationship: ${guardianRelationship}`}
                    icon={<GuardianIcon className="h-5 w-5" />}
                  />
                </div>

                <div className="mt-4 overflow-hidden rounded-[26px] border border-white/[0.1] bg-[linear-gradient(145deg,rgba(255,255,255,.085),rgba(255,255,255,.025))] p-[1px] shadow-[0_20px_55px_rgba(0,0,0,.28)]">
                  <div className="relative rounded-[25px] border border-black/45 bg-black/55 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.08),inset_0_-18px_34px_rgba(0,0,0,.3)] backdrop-blur-2xl sm:p-5">
                    <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    <div className="flex items-start gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[15px] border border-white/[0.11] bg-white/[0.045] text-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,.08)]">
                        <ShieldIcon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/38">
                          StayKnown minor safety standard
                        </div>

                        <p className="mt-3 text-[12.5px] font-semibold leading-5 text-white/55 sm:text-[13px]">
                          StayKnown is for lawful, safety-focused use only. It
                          must not be used to stalk, punish, shame, exploit,
                          secretly monitor, or pressure a minor. If either the
                          minor or guardian declines, the signup flow stops.
                        </p>

                        <div className="mt-3 rounded-[18px] border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[12.5px] font-semibold leading-5 text-white/63 shadow-[inset_0_1px_0_rgba(255,255,255,.05)]">
                          {safetyContext}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {actor === "guardian" &&
                  uiState === "gate" &&
                  decision === "approve" && (
                    <div className="mt-4 overflow-hidden rounded-[26px] border border-white/[0.1] bg-[linear-gradient(145deg,rgba(255,255,255,.09),rgba(255,255,255,.025))] p-[1px] shadow-[0_20px_55px_rgba(0,0,0,.28)]">
                      <div className="relative rounded-[25px] border border-black/45 bg-black/60 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.08),inset_0_-18px_34px_rgba(0,0,0,.3)] sm:p-5">
                        <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                        <div className="flex items-center gap-2.5">
                          <div className="grid h-8 w-8 place-items-center rounded-[12px] border border-white/[0.1] bg-white/[0.04] text-white/70">
                            <GuardianIcon className="h-4 w-4" />
                          </div>
                          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">
                            Guardian acknowledgement
                          </div>
                        </div>

                        <div className="mt-4 grid gap-2.5">
                          {[
                            "I understand I may become the first trusted safety contact for this minor after approval.",
                            "I understand StayKnown can include location, Visit, SOS, approved-contact, chat, and safety alert flows.",
                            "I understand StayKnown does not replace official emergency services, child-protection authorities, schools, guardians, police, ambulance, or real-world safety planning.",
                            "I understand I may later request withdrawal, deletion, or support subject to safety, legal, abuse-prevention, and retention limits.",
                          ].map((item, index) => (
                            <div
                              key={item}
                              className="group flex min-w-0 items-start gap-3 rounded-[18px] border border-white/[0.075] bg-white/[0.025] px-3.5 py-3 transition duration-300 hover:border-white/[0.14] hover:bg-white/[0.045]"
                            >
                              <div className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-white/[0.12] bg-black/45 text-[9px] font-black text-white/55">
                                {index + 1}
                              </div>
                              <p className="min-w-0 text-[12px] font-semibold leading-5 text-white/54">
                                {item}
                              </p>
                            </div>
                          ))}
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

                <div className="flex min-h-[126px] items-center justify-center pt-4 sm:min-h-[142px]">
                  {uiState === "working" ? (
                    <div className="flex flex-col items-center gap-3">
                      <GlassSpinner />
                      <div className="text-center text-[12.5px] font-bold text-white/52">
                        Securely processing your decision…
                      </div>
                    </div>
                  ) : uiState === "approved" || uiState === "waiting" ? (
                    <AnimatedCheck />
                  ) : uiState === "declined" ||
                    uiState === "expired" ||
                    uiState === "cancelled" ||
                    uiState === "invalid" ||
                    uiState === "error" ? (
                    <AnimatedDecline />
                  ) : (
                    <div className="grid h-16 w-16 place-items-center rounded-full border border-white/[0.09] bg-white/[0.025] text-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,.06)]">
                      <ShieldIcon className="h-7 w-7" />
                    </div>
                  )}
                </div>
              </div>

              <aside className="min-w-0 border-t border-white/[0.08] bg-black/30 px-4 py-5 backdrop-blur-2xl sm:px-7 sm:py-7 lg:border-l lg:border-t-0 lg:px-5 lg:py-7">
                <div className="lg:sticky lg:top-6">
                  <div className="rounded-[24px] border border-white/[0.1] bg-[linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.02))] p-[1px] shadow-[0_18px_44px_rgba(0,0,0,.28)]">
                    <div className="relative rounded-[23px] border border-black/45 bg-black/55 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,.07),inset_0_-16px_28px_rgba(0,0,0,.28)]">
                      <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/28 to-transparent" />
                      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/38">
                        Request overview
                      </div>

                      <div className="mt-4 grid gap-2.5">
                        <div className="flex items-center justify-between gap-3 rounded-[16px] border border-white/[0.07] bg-white/[0.025] px-3 py-3">
                          <span className="text-[11.5px] font-semibold text-white/42">
                            Role
                          </span>
                          <span className="text-right text-[11.5px] font-black text-white/78">
                            {actorLabel(actor)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3 rounded-[16px] border border-white/[0.07] bg-white/[0.025] px-3 py-3">
                          <span className="text-[11.5px] font-semibold text-white/42">
                            Decision
                          </span>
                          <span className="text-right text-[11.5px] font-black capitalize text-white/78">
                            {decisionLabel(decision)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3 rounded-[16px] border border-white/[0.07] bg-white/[0.025] px-3 py-3">
                          <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-white/42">
                            <ClockIcon className="h-3.5 w-3.5" />
                            Security timer
                          </span>
                          <span className="font-mono text-[12px] font-black tabular-nums text-white/82">
                            {remaining}
                          </span>
                        </div>
                      </div>

                      <details className="group mt-3 rounded-[16px] border border-white/[0.07] bg-white/[0.025]">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/40">
                          <span className="text-[11.5px] font-semibold text-white/42">
                            Request ID
                          </span>
                          <ChevronIcon className="h-3.5 w-3.5 text-white/38 transition-transform duration-300 group-open:rotate-90" />
                        </summary>
                        <div className="border-t border-white/[0.06] px-3 py-3">
                          <span className="block break-all font-mono text-[10.5px] leading-5 text-white/52">
                            {requestId}
                          </span>
                        </div>
                      </details>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[22px] border border-white/[0.08] bg-white/[0.025] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,.05)]">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-white/70 shadow-[0_0_12px_rgba(255,255,255,.55)]" />
                      <p className="text-[11.5px] font-semibold leading-5 text-white/43">
                        This secure link is bound to this signup request and
                        expires automatically. Do not forward it to another
                        person.
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>

            <div className="relative border-t border-white/[0.08] bg-black/45 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 backdrop-blur-2xl sm:px-7 sm:py-6 md:px-9">
              <div className="mx-auto max-w-[700px]">
                {uiState === "gate" && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SweepButton
                      tone="ghost"
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
                      tone={decision === "approve" ? "light" : "dark"}
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
                  <div className="rounded-[18px] border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-center text-[12.5px] font-bold text-white/50">
                    Your secure confirmation is being processed. Please keep
                    this page open.
                  </div>
                )}

                {uiState === "waiting" && (
                  <div className="rounded-[18px] border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-center text-[12.5px] font-bold text-white/50">
                    Confirmation recorded. Waiting for the other required
                    confirmation…
                  </div>
                )}

                {(uiState === "approved" ||
                  uiState === "declined" ||
                  uiState === "expired" ||
                  uiState === "cancelled" ||
                  uiState === "invalid" ||
                  uiState === "error") && (
                  <div className="grid gap-3 sm:grid-cols-2">
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

                    <div
                      className={
                        uiState === "error"
                          ? ""
                          : "sm:col-span-2 sm:mx-auto sm:w-1/2"
                      }
                    >
                      <SweepButton
                        tone="ghost"
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
                  </div>
                )}

                <footer className="mt-6 border-t border-white/[0.07] pt-4 text-center">
                  <p className="text-[10.5px] font-semibold leading-5 text-white/30">
                    This page is part of StayKnown minor account protection and
                    guardian consent review.
                  </p>
                  <div className="mt-1 text-[10.5px] font-semibold text-white/38">
                    Support: {SUPPORT_EMAIL}
                  </div>
                  <div className="mt-1 text-[10px] font-semibold text-white/24">
                    A 6Clement Joshua Service™ · © {new Date().getFullYear()}
                  </div>
                </footer>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
