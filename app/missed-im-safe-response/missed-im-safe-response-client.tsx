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
  initialSubject?: PublicPerson;
  initialContact?: PublicPerson;
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

type PublicPerson = {
  name: string;
  verified: boolean;
  username?: string | null;
};

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
  subject?: PublicPerson;
  contact?: PublicPerson;
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

function cleanName(value: string) {
  return value.trim() || "StayKnown member";
}

function VerifiedBadge() {
  return (
    <span
      aria-label="Verified StayKnown user"
      title="Verified StayKnown user"
      className="inline-flex h-[12px] w-[12px] shrink-0 items-center justify-center rounded-full border border-black/10 bg-black text-white shadow-[0_3px_8px_rgba(0,0,0,0.12)]"
    >
      <svg viewBox="0 0 16 16" className="h-[7px] w-[7px]" fill="none">
        <path
          d="M3.4 8.2 6.45 11.1 12.6 4.9"
          stroke="currentColor"
          strokeWidth="2.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function NameWithBadge({
  name,
  verified,
}: {
  name: string;
  verified?: boolean;
}) {
  return (
    <span className="inline-flex max-w-full items-center justify-center gap-1.5 align-middle">
      <span className="min-w-0 truncate">{cleanName(name)}</span>
      {verified === true && <VerifiedBadge />}
    </span>
  );
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
        d="m7.5 5 5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GlassSpinner() {
  return (
    <div className="relative h-11 w-11 shrink-0" aria-label="Loading">
      <div className="absolute inset-0 rounded-full bg-white/70 shadow-[0_14px_34px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.96)]" />
      <div
        className="absolute inset-[3px] animate-spin rounded-full border border-black/10 border-t-black/75"
        style={{ animationDuration: "880ms" }}
      />
      <div
        className="absolute inset-[10px] animate-spin rounded-full border border-black/[0.07] border-b-black/40"
        style={{ animationDuration: "1260ms", animationDirection: "reverse" }}
      />
      <div className="absolute inset-[17px] rounded-full bg-black/80 shadow-[0_0_18px_rgba(0,0,0,0.22)]" />
    </div>
  );
}

function AnimatedCheck() {
  return (
    <div className="relative flex h-[86px] w-[86px] items-center justify-center">
      <div className="absolute inset-0 animate-[skApprovePulse_2.6s_ease-in-out_infinite] rounded-full bg-black/[0.055]" />
      <div className="absolute inset-[7px] rounded-full border border-white/90 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(230,232,235,0.86))] shadow-[0_20px_50px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,1),inset_0_-8px_18px_rgba(0,0,0,0.045)]" />
      <div className="absolute inset-[14px] rounded-full border border-black/[0.07] bg-white/72 backdrop-blur-xl" />
      <svg viewBox="0 0 52 52" className="relative z-[2] h-8 w-8" fill="none">
        <path
          d="M14 27.5 22.2 35.5 38.5 18.5"
          stroke="rgba(0,0,0,0.9)"
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
      <div className="absolute inset-0 animate-[skDeclinePulse_2.6s_ease-in-out_infinite] rounded-full bg-black/[0.055]" />
      <div className="absolute inset-[7px] rounded-full border border-white/90 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(230,232,235,0.86))] shadow-[0_20px_50px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,1),inset_0_-8px_18px_rgba(0,0,0,0.045)]" />
      <div className="absolute inset-[14px] rounded-full border border-black/[0.07] bg-white/72 backdrop-blur-xl" />
      <div className="relative z-[2] text-[30px] font-black leading-none text-black/80">
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
      ? "border-white/90 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(225,228,232,0.78))] text-black/72 shadow-[0_10px_24px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1),inset_0_-5px_12px_rgba(0,0,0,0.04)] hover:border-black/10 hover:text-black"
      : "border-black/90 bg-[linear-gradient(145deg,#1c1c1e,#050506)] text-white shadow-[0_16px_36px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.16),inset_0_-7px_14px_rgba(0,0,0,0.55)] hover:shadow-[0_20px_44px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-7px_14px_rgba(0,0,0,0.55)]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group relative min-h-[48px] min-w-0 overflow-hidden rounded-[18px] border px-5 py-[13px] text-[12px] font-black tracking-[-0.01em] outline-none transition duration-300 ease-out focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 active:translate-y-[1px] active:scale-[0.99] ${
        disabled ? "cursor-not-allowed opacity-45" : "hover:-translate-y-0.5"
      } ${cls}`}
    >
      <span className="pointer-events-none absolute inset-x-3 top-px h-px bg-white/70 opacity-80" />
      <span className="pointer-events-none absolute inset-0 translate-x-[-140%] bg-[linear-gradient(112deg,transparent_24%,rgba(255,255,255,0.34)_47%,transparent_69%)] transition-transform duration-700 group-hover:translate-x-[140%]" />
      <span className="relative z-[1] flex items-center justify-center gap-2">
        <span className="min-w-0 break-words">{children}</span>
        <ChevronIcon className="h-3.5 w-3.5 shrink-0 opacity-55 transition-transform duration-300 group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="group relative min-w-0 overflow-hidden rounded-[20px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.84),rgba(226,229,233,0.64))] px-4 py-3.5 text-center shadow-[0_12px_30px_rgba(0,0,0,0.075),inset_0_1px_0_rgba(255,255,255,1),inset_0_-7px_14px_rgba(0,0,0,0.035)] transition duration-300 hover:-translate-y-0.5 hover:border-white hover:shadow-[0_16px_36px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,1),inset_0_-7px_14px_rgba(0,0,0,0.04)]">
      <span className="pointer-events-none absolute inset-x-4 top-px h-px bg-white" />
      <div className="text-[9px] font-black uppercase tracking-[0.24em] text-black/34">
        {label}
      </div>
      <div className="mt-1 min-w-0 break-words text-[12px] font-extrabold leading-5 text-black/74">
        {value}
      </div>
    </div>
  );
}

function PersonCard({
  eyebrow,
  person,
  supporting,
}: {
  eyebrow: string;
  person: PublicPerson;
  supporting?: string;
}) {
  return (
    <div className="group relative min-w-0 overflow-hidden rounded-[24px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.9),rgba(222,225,229,0.66))] p-4 shadow-[0_18px_42px_rgba(0,0,0,0.09),inset_0_1px_0_rgba(255,255,255,1),inset_0_-10px_22px_rgba(0,0,0,0.04)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,1),inset_0_-10px_22px_rgba(0,0,0,0.045)]">
      <span className="pointer-events-none absolute inset-x-5 top-px h-px bg-white" />
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[16px] border border-white/90 bg-[linear-gradient(145deg,#ffffff,#dfe2e6)] text-[15px] font-black text-black/78 shadow-[0_10px_22px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,1),inset_0_-5px_10px_rgba(0,0,0,0.05)]">
          {cleanName(person.name).slice(0, 1).toUpperCase()}
        </div>

        <div className="min-w-0 text-left">
          <div className="text-[9px] font-black uppercase tracking-[0.22em] text-black/35">
            {eyebrow}
          </div>
          <div className="mt-1 min-w-0 text-[14px] font-black text-black/84">
            <NameWithBadge name={person.name} verified={person.verified} />
          </div>
          {supporting ? (
            <div className="mt-1 truncate text-[11px] font-semibold text-black/45">
              {supporting}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StatusRail({ uiState }: { uiState: UiState }) {
  const final =
    uiState === "recorded" ||
    uiState === "already_recorded" ||
    uiState === "vpn_blocked" ||
    uiState === "expired" ||
    uiState === "invalid" ||
    uiState === "error";

  const steps = [
    { label: "Review", active: uiState === "gate" },
    { label: "Confirm", active: uiState === "working" },
    { label: "Recorded", active: final },
  ];

  return (
    <div className="mx-auto mt-5 flex max-w-[420px] items-center justify-center gap-1.5 overflow-hidden rounded-full border border-white/80 bg-white/54 px-2 py-2 shadow-[0_10px_28px_rgba(0,0,0,0.07),inset_0_1px_0_rgba(255,255,255,1)] backdrop-blur-xl">
      {steps.map((step, index) => (
        <React.Fragment key={step.label}>
          <div
            className={`min-w-0 rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] transition duration-300 ${
              step.active
                ? "bg-black text-white shadow-[0_8px_18px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.17)]"
                : "text-black/34"
            }`}
          >
            {step.label}
          </div>
          {index < steps.length - 1 ? (
            <ChevronIcon className="h-3 w-3 shrink-0 text-black/24" />
          ) : null}
        </React.Fragment>
      ))}
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
                : uiState === "error"
                  ? "Response unavailable"
                  : "Confirm your safety response";

  return (
    <h1 className="mx-auto max-w-[560px] break-words text-center text-[24px] font-black tracking-[-0.045em] text-black/90 sm:text-[27px] md:text-[31px]">
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
  initialSubject,
  initialContact,
}: Props) {
  const [uiState, setUiState] = React.useState<UiState>("gate");
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [remaining, setRemaining] = React.useState(formatRemaining(exp));

  const [subjectPerson, setSubjectPerson] = React.useState<PublicPerson>({
    name: initialSubject?.name || subjectName,
    verified: initialSubject?.verified === true,
    username: initialSubject?.username || null,
  });

  const [contactPerson, setContactPerson] = React.useState<PublicPerson>({
    name: initialContact?.name || contactName.trim() || contact,
    verified: initialContact?.verified === true,
    username: initialContact?.username || null,
  });

  const displaySubjectName = cleanName(subjectPerson.name || subjectName);
  const displayContactName = cleanName(
    contactPerson.name || contactName || contact,
  );

  const context = responseContext(response, displaySubjectName);
  const label = responseLabel(response);
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

  function applyPeopleFromResponse(data: ActionResp) {
    if (data.subject?.name) {
      setSubjectPerson({
        name: data.subject.name,
        verified: data.subject.verified === true,
        username: data.subject.username || null,
      });
    }

    if (data.contact?.name) {
      setContactPerson({
        name: data.contact.name,
        verified: data.contact.verified === true,
        username: data.contact.username || null,
      });
    }
  }

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

      applyPeopleFromResponse(data);

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
    <div className="relative min-h-[100dvh] overflow-x-clip bg-[#eef0f3] px-3 py-5 text-black sm:px-4 sm:py-8 md:py-12">
      <style>{`
        @keyframes skApprovePulse {
          0%,100% { transform: scale(1); opacity: .8; }
          50% { transform: scale(1.1); opacity: .42; }
        }
        @keyframes skDeclinePulse {
          0%,100% { transform: scale(1); opacity: .8; }
          50% { transform: scale(1.1); opacity: .42; }
        }
        @keyframes skCheckDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes skFloat {
          0%,100% { transform: translate3d(0,0,0) scale(1); opacity:.38; }
          50% { transform: translate3d(0,-14px,0) scale(1.05); opacity:.68; }
        }
        @keyframes skSheen {
          0% { transform: translateX(-145%) skewX(-16deg); opacity: 0; }
          18% { opacity: .5; }
          56% { opacity: .22; }
          100% { transform: translateX(170%) skewX(-16deg); opacity: 0; }
        }

        html {
          background: #eef0f3;
          scroll-behavior: smooth;
        }

        body {
          min-width: 320px;
          background: #eef0f3;
        }

        @media (hover: none) {
          .sk-hover-only {
            display: none;
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

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(255,255,255,0.96),transparent_38%),radial-gradient(circle_at_8%_34%,rgba(255,255,255,0.72),transparent_30%),radial-gradient(circle_at_92%_56%,rgba(255,255,255,0.7),transparent_30%),linear-gradient(180deg,#f4f5f7_0%,#e9ebee_100%)]" />
        <div className="absolute left-1/2 top-[-150px] h-[340px] w-[340px] -translate-x-1/2 animate-[skFloat_7s_ease-in-out_infinite] rounded-full border border-white/60 bg-white/45 blur-3xl" />
        <div className="absolute bottom-[-180px] left-[-100px] h-[340px] w-[340px] animate-[skFloat_9s_ease-in-out_infinite_reverse] rounded-full bg-black/[0.045] blur-3xl" />
        <div className="absolute right-[-140px] top-[28%] h-[320px] w-[320px] animate-[skFloat_8s_ease-in-out_infinite] rounded-full border border-white/50 bg-white/42 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(rgba(0,0,0,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.025)_1px,transparent_1px)] [background-size:28px_28px]" />
      </div>

      <main className="relative z-[1] mx-auto flex min-h-[calc(100dvh-40px)] w-full max-w-[760px] items-center pb-[max(0px,env(safe-area-inset-bottom))] sm:min-h-[calc(100dvh-64px)] md:min-h-[calc(100dvh-96px)]">
        <section className="relative w-full min-w-0 overflow-hidden rounded-[30px] border border-white/85 bg-[linear-gradient(145deg,rgba(255,255,255,0.88),rgba(215,219,224,0.7))] shadow-[0_38px_120px_rgba(0,0,0,0.16),0_12px_34px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1),inset_0_-16px_34px_rgba(0,0,0,0.045)] backdrop-blur-3xl sm:rounded-[38px]">
          <div className="pointer-events-none absolute inset-[1px] rounded-[29px] border border-white/55 sm:rounded-[37px]" />
          <div className="pointer-events-none absolute inset-x-10 top-px h-px bg-white" />
          <div className="sk-hover-only pointer-events-none absolute -left-1/3 top-0 h-full w-1/3 animate-[skSheen_8s_ease-in-out_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)] blur-xl" />

          <header className="relative border-b border-black/[0.065] bg-white/38 px-4 pb-6 pt-5 text-center backdrop-blur-2xl sm:px-6 sm:pt-7 md:px-9 md:pb-7">
            <div className="flex justify-center">
              <div className="relative rounded-[22px] border border-white/95 bg-[linear-gradient(145deg,#ffffff,#dfe2e6)] p-3 shadow-[0_16px_38px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,1),inset_0_-7px_14px_rgba(0,0,0,0.05)]">
                <span className="pointer-events-none absolute inset-x-2 top-px h-px bg-white" />
                <img
                  src="/6logo.png"
                  alt="StayKnown"
                  className="h-10 w-10 object-contain"
                />
              </div>
            </div>

            <div className="mt-4 text-[10px] font-black uppercase tracking-[0.36em] text-black/45">
              StayKnown
            </div>
            <div className="mt-2 text-[9px] font-black uppercase tracking-[0.25em] text-black/30">
              Missed I’M SAFE response
            </div>

            <StatusRail uiState={uiState} />

            <div className="mx-auto mt-5 h-px max-w-[260px] bg-gradient-to-r from-transparent via-black/12 to-transparent" />

            <div className="mt-5">
              <StatusTitle uiState={uiState} />

              <div className="mx-auto mt-3 max-w-[570px] break-words text-center text-[12px] font-semibold leading-6 text-black/60 sm:text-[13px]">
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
          </header>

          <div className="relative px-4 py-5 sm:px-6 sm:py-6 md:px-9 md:py-7">
            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              <PersonCard
                eyebrow="Contact responding"
                person={contactPerson}
                supporting={contactPerson.username || contact}
              />
              <PersonCard
                eyebrow="Person to check"
                person={subjectPerson}
                supporting={subjectPerson.username || "StayKnown member"}
              />
            </div>

            <section className="relative mt-4 min-w-0 overflow-hidden rounded-[27px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.82),rgba(221,224,228,0.62))] p-4 shadow-[0_18px_52px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1),inset_0_-10px_24px_rgba(0,0,0,0.035)] backdrop-blur-2xl sm:p-5">
              <span className="pointer-events-none absolute inset-x-6 top-px h-px bg-white" />

              <div className="flex min-w-0 items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[9px] font-black uppercase tracking-[0.25em] text-black/35">
                    Response overview
                  </div>
                  <div className="mt-1 break-words text-[13px] font-black text-black/78">
                    {label}
                  </div>
                </div>

                <div className="shrink-0 rounded-full border border-white/90 bg-white/74 px-3 py-1.5 text-[10px] font-black text-black/55 shadow-[0_8px_18px_rgba(0,0,0,0.07),inset_0_1px_0_rgba(255,255,255,1)]">
                  {remaining}
                </div>
              </div>

              <div className="mt-4 grid min-w-0 grid-cols-1 gap-2.5 sm:grid-cols-2">
                <InfoRow label="Response" value={label} />
                <InfoRow label="Security timer" value={remaining} />
                <InfoRow
                  label="Expected check-in"
                  value={fmtDateTime(expected)}
                />
                <InfoRow label="Due after" value={fmtDateTime(due)} />
              </div>
            </section>

            {uiState === "gate" && (
              <section className="relative mt-4 min-w-0 overflow-hidden rounded-[27px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.8),rgba(218,222,226,0.6))] p-4 text-center shadow-[0_18px_52px_rgba(0,0,0,0.075),inset_0_1px_0_rgba(255,255,255,1),inset_0_-10px_24px_rgba(0,0,0,0.035)] backdrop-blur-2xl sm:p-5">
                <span className="pointer-events-none absolute inset-x-6 top-px h-px bg-white" />

                <div className="text-[9px] font-black uppercase tracking-[0.25em] text-black/35">
                  StayKnown safety confirmation
                </div>

                <p className="mx-auto mt-3 max-w-[580px] break-words text-[12px] font-semibold leading-6 text-black/64">
                  {context.body}
                </p>

                <div className="mx-auto mt-4 flex max-w-[610px] items-start gap-2.5 rounded-[20px] border border-white/85 bg-white/58 px-3.5 py-3 text-left shadow-[0_10px_24px_rgba(0,0,0,0.055),inset_0_1px_0_rgba(255,255,255,0.95)] sm:px-4">
                  <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-[9px] border border-white bg-[linear-gradient(145deg,#fff,#dfe2e6)] text-[11px] font-black text-black/70 shadow-[0_6px_14px_rgba(0,0,0,0.08)]">
                    !
                  </div>
                  <p className="min-w-0 break-words text-[11px] font-semibold leading-5 text-black/56">
                    Do not submit false, misleading, abusive, or pressure-based
                    responses. If you believe {displaySubjectName} may be in
                    immediate danger, contact them directly and follow local
                    emergency procedures.
                  </p>
                </div>

                <details className="group mx-auto mt-3 max-w-[610px] overflow-hidden rounded-[20px] border border-white/80 bg-white/48 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 outline-none transition hover:bg-white/46 focus-visible:ring-2 focus-visible:ring-black/20">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/42">
                      Safety proof details
                    </span>
                    <ChevronIcon className="h-3.5 w-3.5 shrink-0 text-black/35 transition-transform duration-300 group-open:rotate-90" />
                  </summary>
                  <div className="border-t border-black/[0.055] px-4 py-3 text-[10.5px] font-semibold leading-5 text-black/48">
                    For safety proof history, StayKnown may record your response
                    choice, response time, browser/device details, and
                    approximate IP-based location. VPN, proxy, or masked-network
                    connections may be blocked to prevent misleading safety
                    records.
                  </div>
                </details>
              </section>
            )}

            <div className="mt-6 flex min-h-[94px] items-center justify-center">
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
              <div className="mt-1 grid min-w-0 gap-3 sm:grid-cols-2">
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
              <div className="mt-1 grid min-w-0 gap-3 sm:grid-cols-2">
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

            <footer className="mt-7 min-w-0 border-t border-black/[0.065] pt-5 text-center text-[10px] font-semibold leading-5 text-black/42">
              <div>
                This page is part of StayKnown safety awareness and internal
                proof history.
              </div>
              <div className="mt-2">
                StayKnown does not replace emergency services. For urgent
                danger, contact local emergency services immediately.
              </div>

              <details className="group mx-auto mt-3 max-w-[610px] rounded-[18px] border border-white/80 bg-white/42 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 outline-none transition hover:bg-white/44 focus-visible:ring-2 focus-visible:ring-black/20">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/38">
                    Privacy and retention
                  </span>
                  <ChevronIcon className="h-3.5 w-3.5 shrink-0 text-black/32 transition-transform duration-300 group-open:rotate-90" />
                </summary>
                <div className="space-y-2 border-t border-black/[0.055] px-4 py-3 text-[10px] leading-5 text-black/42">
                  <p>
                    Safety proof history may be kept only as long as needed for
                    safety, audit, support, investigation, legal, or
                    abuse-prevention reasons.
                  </p>
                  <p>
                    For safety proof history, StayKnown may record your response
                    choice, response time, browser/device details, and
                    approximate IP-based location. VPN, proxy, or masked-network
                    connections may be blocked to prevent misleading safety
                    records.
                  </p>
                </div>
              </details>

              <div className="mt-3 break-words">Support: {SUPPORT_EMAIL}</div>
              <div className="mt-2">
                Privacy:{" "}
                <a
                  href="/privacy"
                  className="font-black underline decoration-black/30 underline-offset-2 transition hover:text-black"
                >
                  Privacy Policy
                </a>{" "}
                · Terms:{" "}
                <a
                  href="/terms"
                  className="font-black underline decoration-black/30 underline-offset-2 transition hover:text-black"
                >
                  Terms
                </a>
              </div>
              <div className="mt-2">
                A 6 Clement Joshua service™ · © {new Date().getFullYear()}
              </div>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}
