"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const UPDATED_AT = "2026-05-29";
const VERSION = "1.0";
const CONSENT_VERSION = "guardian-consent-v1.0-2026-05-29";

type LookupState = "idle" | "loading" | "ready" | "missing" | "error";
type SubmitState = "idle" | "submitting" | "success" | "error";

type ConsentRequest = {
  token: string;
  minorUserId?: string | null;
  minorFirstName?: string | null;
  minorLastName?: string | null;
  minorEmail?: string | null;
  minorAgeBand?: string | null;
  expiresAt?: string | null;
  status?:
    | "pending"
    | "approved"
    | "rejected"
    | "expired"
    | "withdrawn"
    | string;
};

type GuardianRelationship =
  | "parent"
  | "legal_guardian"
  | "caregiver"
  | "trusted_adult"
  | "other";

type GuardianForm = {
  guardianFirstName: string;
  guardianLastName: string;
  guardianEmail: string;
  guardianPhone: string;
  guardianRelationship: GuardianRelationship;
  guardianRelationshipOther: string;
  typedSignature: string;
  confirmAuthority: boolean;
  confirmMinorInfo: boolean;
  confirmSafetyUse: boolean;
  confirmLocation: boolean;
  confirmContacts: boolean;
  confirmDataRights: boolean;
  confirmEmergencyLimits: boolean;
  confirmPolicies: boolean;
};

function fmtDate(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}

function fmtDateTime(value?: string | null) {
  if (!value) return "Not provided";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Not provided";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function useSeoMeta() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    document.title =
      "StayKnown Guardian Consent | Minor Safety Approval for Ages 13–17";

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
      "Guardian consent page for StayKnown minor users ages 13–17. Review safety, location, SOS, contacts, chat, privacy, data rights, and emergency limits before approval.",
    );
    upsertMeta(
      "keywords",
      "StayKnown guardian consent, minor safety approval, parent consent, teen safety app, youth location safety, SOS guardian approval, StayKnown child safety",
    );
    upsertMeta("robots", "noindex, nofollow");
    upsertMeta("author", "6 Clement Joshua");

    upsertProperty(
      "og:title",
      "StayKnown Guardian Consent | Minor Safety Approval",
    );
    upsertProperty(
      "og:description",
      "Review and approve guardian consent for eligible StayKnown minor users ages 13–17.",
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
        strokeWidth="1.7"
      />
      <path
        d="M3.8 19.2c.55-3.05 2.22-4.78 4.6-4.78 1.45 0 2.62.64 3.45 1.82"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M16.8 20.4c2.5-.82 4.2-3.2 4.2-5.85V11.3l-4.2-1.65-4.2 1.65v3.25c0 2.65 1.7 5.03 4.2 5.85Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="m14.9 15.1 1.25 1.25 2.55-2.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlertIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 3.8 21 19.2H3L12 3.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12 9v4.6M12 16.8h.01"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M7.5 10.4V8.25A4.5 4.5 0 0 1 12 3.75a4.5 4.5 0 0 1 4.5 4.5v2.15"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M6.6 10.4h10.8c1.1 0 2 .9 2 2v5.85c0 1.1-.9 2-2 2H6.6c-1.1 0-2-.9-2-2V12.4c0-1.1.9-2 2-2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12 14.25v2.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LocationIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 21s6.2-5.55 6.2-11.1A6.2 6.2 0 1 0 5.8 9.9C5.8 15.45 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12 12.25a2.35 2.35 0 1 0 0-4.7 2.35 2.35 0 0 0 0 4.7Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function ContactIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M8.6 11.2a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M3.8 19.2c.55-3.1 2.3-4.9 4.8-4.9s4.25 1.8 4.8 4.9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M16.4 6.2c1.7.35 2.8 1.65 2.8 3.35s-1.1 3-2.8 3.35"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M15.1 15.1c2.6.35 4.25 1.85 5.1 4.1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
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

function H2({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <h2 className="text-[18px] font-black tracking-[-0.025em] text-white md:text-[20px]">
      <span className="inline-flex items-center gap-2.5">
        {icon ? (
          <span className="grid h-8 w-8 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/85 shadow-sm">
            {icon}
          </span>
        ) : null}
        <span>{children}</span>
      </span>
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[13.5px] font-semibold leading-relaxed text-white/62 md:text-[14px]">
      {children}
    </p>
  );
}

function UL({ items }: { items: string[] }) {
  return (
    <ul className="ml-5 list-disc space-y-1.5 text-[13.5px] font-semibold leading-relaxed text-white/60 md:text-[14px]">
      {items.map((t, i) => (
        <li key={`${t}-${i}`}>{t}</li>
      ))}
    </ul>
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
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-[1.35rem] border border-white/10 bg-white/[0.032] p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[13px] font-black text-white/92">{title}</div>
          <p className="mt-1.5 text-[12.5px] font-semibold leading-relaxed text-white/52">
            {body}
          </p>
        </div>
        <span className="text-white/35 transition group-hover:translate-x-0.5 group-hover:text-white/80">
          →
        </span>
      </div>
    </a>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-black uppercase tracking-[0.14em] text-white/40">
        {label}
        {required ? <span className="ml-1 text-white/70">*</span> : null}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-[14px] font-semibold text-white outline-none transition placeholder:text-white/22 focus:border-white/25 focus:bg-black/60"
      />
    </label>
  );
}

function SelectInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: GuardianRelationship;
  onChange: (v: GuardianRelationship) => void;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-black uppercase tracking-[0.14em] text-white/40">
        {label}
        <span className="ml-1 text-white/70">*</span>
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as GuardianRelationship)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-[14px] font-semibold text-white outline-none transition focus:border-white/25 focus:bg-black/60"
      >
        <option value="parent">Parent</option>
        <option value="legal_guardian">Legal guardian</option>
        <option value="caregiver">Caregiver</option>
        <option value="trusted_adult">
          Trusted adult with lawful authority
        </option>
        <option value="other">Other</option>
      </select>
    </label>
  );
}

function CheckboxRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-white/18 hover:bg-white/[0.05]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-white"
      />
      <span className="text-[13px] font-semibold leading-relaxed text-white/62">
        {children}
      </span>
    </label>
  );
}

function GuardianIllustration() {
  return (
    <div className="relative mx-auto h-[280px] w-[190px] md:h-[320px] md:w-[220px]">
      <div className="absolute inset-0 animate-[softPulse_4s_ease-in-out_infinite] rounded-[2.2rem] bg-white/[0.045] blur-2xl" />

      <div className="relative h-full w-full rounded-[2rem] border border-white/15 bg-white/[0.055] p-3 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-white/20" />

        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-white text-black">
              <GuardianIcon className="h-5 w-5" />
            </div>

            <div>
              <div className="text-[11px] font-black tracking-[0.18em] text-white/35">
                GUARDIAN FLOW
              </div>
              <div className="text-[13px] font-black text-white">
                Consent Review
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {[
              ["Age 13–17", "Consent required"],
              ["Approved adults", "Safety role only"],
              ["Location notice", "Sensitive data"],
              ["Emergency limits", "Not dispatch"],
            ].map(([title, body], index) => (
              <div
                key={title}
                className="animate-[riseIn_0.7s_ease_both] rounded-2xl border border-white/10 bg-black/30 p-3"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="text-[12px] font-black text-white/90">
                  {title}
                </div>
                <div className="mt-1 text-[10.5px] font-semibold text-white/45">
                  {body}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2">
          <div className="text-[10.5px] font-black uppercase tracking-[0.16em] text-white/35">
            Consent version
          </div>
          <div className="text-[10px] font-black text-white/65">v1.0</div>
        </div>
      </div>
    </div>
  );
}

function getTokenFromUrl() {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return (params.get("token") ?? "").trim();
}

function defaultForm(): GuardianForm {
  return {
    guardianFirstName: "",
    guardianLastName: "",
    guardianEmail: "",
    guardianPhone: "",
    guardianRelationship: "parent",
    guardianRelationshipOther: "",
    typedSignature: "",
    confirmAuthority: false,
    confirmMinorInfo: false,
    confirmSafetyUse: false,
    confirmLocation: false,
    confirmContacts: false,
    confirmDataRights: false,
    confirmEmergencyLimits: false,
    confirmPolicies: false,
  };
}

export default function GuardianConsentPage() {
  useSeoMeta();

  const [token, setToken] = useState("");
  const [lookupState, setLookupState] = useState<LookupState>("idle");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [request, setRequest] = useState<ConsentRequest | null>(null);
  const [form, setForm] = useState<GuardianForm>(() => defaultForm());
  const [error, setError] = useState("");

  useEffect(() => {
    const t = getTokenFromUrl();
    setToken(t);

    if (!t) {
      setLookupState("missing");
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLookupState("loading");
        setError("");

        const res = await fetch(
          `/api/guardian-consent/lookup?token=${encodeURIComponent(t)}`,
          { method: "GET" },
        );

        const json = await res.json().catch(() => null);

        if (cancelled) return;

        if (!res.ok || !json?.ok) {
          setLookupState("error");
          setError(
            json?.message ??
              "We could not verify this guardian consent link. Please request a new link from the StayKnown app.",
          );
          return;
        }

        setRequest(json.request as ConsentRequest);
        setLookupState("ready");
      } catch {
        if (cancelled) return;
        setLookupState("error");
        setError(
          "We could not load this consent request. Please check your connection and try again.",
        );
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const minorName = useMemo(() => {
    const first = (request?.minorFirstName ?? "").trim();
    const last = (request?.minorLastName ?? "").trim();
    const full = `${first} ${last}`.trim();
    return full || "the minor user";
  }, [request]);

  const allChecksComplete =
    form.confirmAuthority &&
    form.confirmMinorInfo &&
    form.confirmSafetyUse &&
    form.confirmLocation &&
    form.confirmContacts &&
    form.confirmDataRights &&
    form.confirmEmergencyLimits &&
    form.confirmPolicies;

  const signatureMatches =
    form.typedSignature.trim().length >= 3 &&
    `${form.guardianFirstName} ${form.guardianLastName}`
      .trim()
      .toLowerCase() === form.typedSignature.trim().toLowerCase();

  const isValid =
    token.trim().length > 0 &&
    form.guardianFirstName.trim().length >= 2 &&
    form.guardianLastName.trim().length >= 2 &&
    form.guardianEmail.trim().includes("@") &&
    form.guardianRelationship.trim().length > 0 &&
    (form.guardianRelationship !== "other" ||
      form.guardianRelationshipOther.trim().length >= 2) &&
    allChecksComplete &&
    signatureMatches;

  async function submitApproval() {
    if (!isValid || submitState === "submitting") return;

    try {
      setSubmitState("submitting");
      setError("");

      const res = await fetch("/api/guardian-consent/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          consentVersion: CONSENT_VERSION,
          guardian: {
            firstName: form.guardianFirstName.trim(),
            lastName: form.guardianLastName.trim(),
            email: form.guardianEmail.trim().toLowerCase(),
            phone: form.guardianPhone.trim() || null,
            relationship: form.guardianRelationship,
            relationshipOther:
              form.guardianRelationship === "other"
                ? form.guardianRelationshipOther.trim()
                : null,
            typedSignature: form.typedSignature.trim(),
          },
          acknowledgements: {
            confirmAuthority: form.confirmAuthority,
            confirmMinorInfo: form.confirmMinorInfo,
            confirmSafetyUse: form.confirmSafetyUse,
            confirmLocation: form.confirmLocation,
            confirmContacts: form.confirmContacts,
            confirmDataRights: form.confirmDataRights,
            confirmEmergencyLimits: form.confirmEmergencyLimits,
            confirmPolicies: form.confirmPolicies,
          },
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        setSubmitState("error");
        setError(
          json?.message ??
            "We could not record this consent. Please check the form and try again.",
        );
        return;
      }

      setSubmitState("success");
    } catch {
      setSubmitState("error");
      setError(
        "We could not submit this consent. Please check your connection and try again.",
      );
    }
  }

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

        @keyframes softPulse {
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

        @keyframes riseIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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
            scroll-behavior: auto !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>

      <header className="relative z-10 pt-7">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4">
          <div className="flex flex-col items-center gap-2">
            <Image
              src="/6logo.png"
              alt="StayKnown"
              width={38}
              height={38}
              priority
              className="rounded-full bg-white object-contain p-0.5"
            />
            <div className="text-[12px] font-extrabold tracking-[0.28em] text-white">
              STAYKNOWN
            </div>
          </div>
        </div>
      </header>

      <section className="relative z-10 w-full">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 md:pt-12">
          <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/60 backdrop-blur-2xl">
            <div className="relative overflow-hidden border-b border-white/10 px-5 py-7 md:px-8 md:py-9">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(255,255,255,0.105),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.05),transparent_28%)]" />

              <div className="relative grid gap-8 md:grid-cols-[1fr_260px] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill>Guardian Consent</Pill>
                    <Pill>Minor Safety</Pill>
                    <Pill>Ages 13–17</Pill>
                  </div>

                  <h1 className="mt-5 max-w-3xl text-[30px] font-black tracking-[-0.045em] text-white md:text-[46px] md:leading-[1.02]">
                    Guardian consent approval for eligible StayKnown minor
                    users.
                  </h1>

                  <p className="mt-5 max-w-3xl text-[14.5px] font-semibold leading-relaxed text-white/62 md:text-[15px]">
                    This page allows a parent, legal guardian, or properly
                    authorized trusted adult to review and approve StayKnown use
                    for an eligible minor user ages 13–17. StayKnown is a
                    safety-focused app with location, SOS, Visit, chat,
                    approved-contact, and emergency-context features.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <SoftBadge>Version {VERSION}</SoftBadge>
                    <SoftBadge>Consent: {CONSENT_VERSION}</SoftBadge>
                    <SoftBadge>Updated: {fmtDate(UPDATED_AT)}</SoftBadge>
                  </div>
                </div>

                <GuardianIllustration />
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
              <aside className="border-b border-white/10 bg-black/35 p-5 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:p-6">
                <div className="text-[12px] font-black uppercase tracking-[0.2em] text-white/35">
                  Consent status
                </div>

                <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-white/[0.032] p-4">
                  <div className="flex items-center gap-2 text-[12px] font-black text-white/88">
                    <GuardianIcon className="h-4 w-4" />
                    Review carefully
                  </div>
                  <p className="mt-2 text-[12px] font-semibold leading-relaxed text-white/50">
                    Only approve if you have authority to consent for this minor
                    and you understand StayKnown’s safety, location, contact,
                    chat, privacy, and emergency limits.
                  </p>
                </div>

                <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-white/[0.032] p-4">
                  <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/35">
                    Link status
                  </div>
                  <div className="mt-2 text-[13px] font-black text-white/78">
                    {lookupState === "loading"
                      ? "Checking link..."
                      : lookupState === "ready"
                        ? "Ready for review"
                        : lookupState === "missing"
                          ? "Missing token"
                          : lookupState === "error"
                            ? "Needs new link"
                            : "Preparing"}
                  </div>
                </div>

                <div className="mt-4 grid gap-2">
                  <LinkCard
                    href="/minors"
                    title="Child Safety & Minor Use"
                    body="Age rules, guardian duties, minor safety limits, reports, and data handling."
                  />
                  <LinkCard
                    href="/privacy"
                    title="Privacy Policy"
                    body="How StayKnown handles account, location, contact, chat, media, and safety data."
                  />
                  <LinkCard
                    href="/location-safety"
                    title="Location & Live Safety"
                    body="Visit sessions, LIVE map, SOS, manual capture, chat maps, and VPN gates."
                  />
                  <LinkCard
                    href="/emergency"
                    title="Emergency Disclaimer"
                    body="StayKnown does not replace official emergency services."
                  />
                </div>
              </aside>

              <div className="p-5 md:p-8">
                {lookupState === "missing" ? (
                  <section className="rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      Consent link missing
                    </H2>
                    <P>
                      This guardian consent page requires a secure consent link
                      from the StayKnown app. Please return to the app and ask
                      the minor user to resend the guardian consent email.
                    </P>
                  </section>
                ) : null}

                {lookupState === "loading" ? (
                  <section className="rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5">
                    <H2 icon={<LockIcon className="h-4 w-4" />}>
                      Checking consent link
                    </H2>
                    <P>StayKnown is verifying this guardian consent request.</P>
                  </section>
                ) : null}

                {lookupState === "error" ? (
                  <section className="rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      Consent link unavailable
                    </H2>
                    <P>{error}</P>
                  </section>
                ) : null}

                {submitState === "success" ? (
                  <section className="space-y-4 rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      Consent recorded
                    </H2>
                    <P>
                      Guardian consent has been recorded for {minorName}. The
                      minor user may now continue the StayKnown account flow
                      subject to age-appropriate safety rules, approved-contact
                      limits, and StayKnown policies.
                    </P>
                    <div className="rounded-2xl border border-white/10 bg-black/35 p-4 text-[13px] font-semibold leading-relaxed text-white/55">
                      The user should return to the StayKnown app. If the app
                      does not update immediately, they can refresh, sign out
                      and sign back in, or request support.
                    </div>
                  </section>
                ) : null}

                {lookupState === "ready" && submitState !== "success" ? (
                  <div className="space-y-8">
                    <section className="space-y-4 rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5">
                      <H2 icon={<GuardianIcon className="h-4 w-4" />}>
                        1) Minor user request
                      </H2>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/30">
                            Minor name
                          </div>
                          <div className="mt-1 text-[14px] font-black text-white/82">
                            {minorName}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/30">
                            Minor email
                          </div>
                          <div className="mt-1 text-[14px] font-black text-white/82">
                            {request?.minorEmail || "Not provided"}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/30">
                            Age band
                          </div>
                          <div className="mt-1 text-[14px] font-black text-white/82">
                            {request?.minorAgeBand || "13–17"}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-white/30">
                            Link expires
                          </div>
                          <div className="mt-1 text-[14px] font-black text-white/82">
                            {fmtDateTime(request?.expiresAt)}
                          </div>
                        </div>
                      </div>

                      <P>
                        Only continue if you recognize this minor and have
                        authority to approve their use of StayKnown.
                      </P>
                    </section>

                    <section className="space-y-4 rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5">
                      <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                        2) What you are approving
                      </H2>

                      <P>
                        StayKnown is a safety and security app. Depending on
                        settings, plan, permissions, and contact approvals, the
                        minor may use safety features involving location, Visit
                        sessions, SOS, manual emergency capture, approved
                        contacts, chat, media, voice notes, safety gallery,
                        alerts, and abuse reporting.
                      </P>

                      <UL
                        items={[
                          "StayKnown may process account information, date of birth, guardian consent status, approved contacts, safety sessions, SOS events, chat metadata, media references, location metadata, support records, and abuse reports.",
                          "Location may be precise, approximate, delayed, stale, missing, or affected by GPS, battery, VPN, network, device settings, and map providers.",
                          "Approved contacts and SOS responders should be trusted adults or responsible people who can help during a safety event.",
                          "StayKnown does not replace police, ambulance, fire service, emergency dispatch, child-protection authorities, schools, guardians, or real-world safety planning.",
                          "Guardian consent can later be withdrawn, but some records may be retained where required for safety, abuse prevention, legal compliance, security, dispute handling, or lawful requests.",
                        ]}
                      />
                    </section>

                    <section className="space-y-4 rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5">
                      <H2 icon={<ContactIcon className="h-4 w-4" />}>
                        3) Guardian information
                      </H2>

                      <div className="grid gap-4 md:grid-cols-2">
                        <TextInput
                          label="Guardian first name"
                          value={form.guardianFirstName}
                          onChange={(v) =>
                            setForm((p) => ({ ...p, guardianFirstName: v }))
                          }
                          required
                        />

                        <TextInput
                          label="Guardian last name"
                          value={form.guardianLastName}
                          onChange={(v) =>
                            setForm((p) => ({ ...p, guardianLastName: v }))
                          }
                          required
                        />

                        <TextInput
                          label="Guardian email"
                          value={form.guardianEmail}
                          onChange={(v) =>
                            setForm((p) => ({ ...p, guardianEmail: v }))
                          }
                          type="email"
                          required
                        />

                        <TextInput
                          label="Guardian phone"
                          value={form.guardianPhone}
                          onChange={(v) =>
                            setForm((p) => ({ ...p, guardianPhone: v }))
                          }
                          type="tel"
                          placeholder="Optional"
                        />

                        <SelectInput
                          label="Relationship"
                          value={form.guardianRelationship}
                          onChange={(v) =>
                            setForm((p) => ({
                              ...p,
                              guardianRelationship: v,
                            }))
                          }
                        />

                        {form.guardianRelationship === "other" ? (
                          <TextInput
                            label="Explain relationship"
                            value={form.guardianRelationshipOther}
                            onChange={(v) =>
                              setForm((p) => ({
                                ...p,
                                guardianRelationshipOther: v,
                              }))
                            }
                            required
                          />
                        ) : null}
                      </div>
                    </section>

                    <section className="space-y-4 rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5">
                      <H2 icon={<LockIcon className="h-4 w-4" />}>
                        4) Required acknowledgements
                      </H2>

                      <div className="grid gap-3">
                        <CheckboxRow
                          checked={form.confirmAuthority}
                          onChange={(v) =>
                            setForm((p) => ({ ...p, confirmAuthority: v }))
                          }
                        >
                          I confirm I am the parent, legal guardian, or an
                          authorized trusted adult with lawful authority to
                          approve StayKnown use for this minor.
                        </CheckboxRow>

                        <CheckboxRow
                          checked={form.confirmMinorInfo}
                          onChange={(v) =>
                            setForm((p) => ({ ...p, confirmMinorInfo: v }))
                          }
                        >
                          I reviewed the minor information shown on this page
                          and understand this approval is for an eligible user
                          ages 13–17 only.
                        </CheckboxRow>

                        <CheckboxRow
                          checked={form.confirmSafetyUse}
                          onChange={(v) =>
                            setForm((p) => ({ ...p, confirmSafetyUse: v }))
                          }
                        >
                          I understand StayKnown is for lawful, safety-focused
                          use only and must not be used for stalking,
                          harassment, punishment, coercive control, secret
                          monitoring, exploitation, or unsafe contact.
                        </CheckboxRow>

                        <CheckboxRow
                          checked={form.confirmLocation}
                          onChange={(v) =>
                            setForm((p) => ({ ...p, confirmLocation: v }))
                          }
                        >
                          I understand StayKnown may process location and safety
                          context for features such as Visits, LIVE map, SOS,
                          manual capture, chat maps, approved contacts, alerts,
                          and abuse prevention.
                        </CheckboxRow>

                        <CheckboxRow
                          checked={form.confirmContacts}
                          onChange={(v) =>
                            setForm((p) => ({ ...p, confirmContacts: v }))
                          }
                        >
                          I understand minor contacts, SOS contacts, and
                          responders should be responsible parents, guardians,
                          trusted adults, or appropriate safety contacts.
                        </CheckboxRow>

                        <CheckboxRow
                          checked={form.confirmDataRights}
                          onChange={(v) =>
                            setForm((p) => ({ ...p, confirmDataRights: v }))
                          }
                        >
                          I understand consent may be withdrawn and that data
                          deletion/export/control requests may be available,
                          subject to safety, legal, security, abuse-prevention,
                          and retention limits.
                        </CheckboxRow>

                        <CheckboxRow
                          checked={form.confirmEmergencyLimits}
                          onChange={(v) =>
                            setForm((p) => ({
                              ...p,
                              confirmEmergencyLimits: v,
                            }))
                          }
                        >
                          I understand StayKnown does not replace official
                          emergency services, police, ambulance, fire service,
                          emergency dispatch, child-protection authorities,
                          schools, guardians, or responsible real-world safety
                          planning.
                        </CheckboxRow>

                        <CheckboxRow
                          checked={form.confirmPolicies}
                          onChange={(v) =>
                            setForm((p) => ({ ...p, confirmPolicies: v }))
                          }
                        >
                          I have reviewed or had the opportunity to review the
                          Child Safety & Minor Use Policy, Privacy Policy,
                          Location & Live Safety Policy, Contact Consent Policy,
                          Safety & Anti-Stalking Policy, Data Retention Policy,
                          Abuse Reporting page, and Emergency Disclaimer.
                        </CheckboxRow>
                      </div>
                    </section>

                    <section className="space-y-4 rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5">
                      <H2 icon={<GuardianIcon className="h-4 w-4" />}>
                        5) Typed signature
                      </H2>

                      <P>
                        Type your full name exactly as entered above to sign
                        this consent approval.
                      </P>

                      <TextInput
                        label="Typed signature"
                        value={form.typedSignature}
                        onChange={(v) =>
                          setForm((p) => ({ ...p, typedSignature: v }))
                        }
                        placeholder="Guardian first name + last name"
                        required
                      />

                      {!signatureMatches && form.typedSignature.trim() ? (
                        <div className="rounded-2xl border border-white/10 bg-black/35 p-3 text-[12.5px] font-semibold leading-relaxed text-white/45">
                          Signature must match:{" "}
                          <span className="font-black text-white/75">
                            {`${form.guardianFirstName} ${form.guardianLastName}`.trim() ||
                              "guardian first name + last name"}
                          </span>
                        </div>
                      ) : null}

                      {error ? (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-[12.5px] font-semibold leading-relaxed text-white/62">
                          {error}
                        </div>
                      ) : null}

                      <button
                        type="button"
                        onClick={submitApproval}
                        disabled={!isValid || submitState === "submitting"}
                        className="w-full rounded-2xl border border-white/15 bg-white px-5 py-3.5 text-[13px] font-black uppercase tracking-[0.16em] text-black transition hover:-translate-y-0.5 hover:bg-white/90 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/12 disabled:text-white/25 disabled:hover:translate-y-0"
                      >
                        {submitState === "submitting"
                          ? "Recording consent..."
                          : "Approve guardian consent"}
                      </button>

                      <p className="text-center text-[11.5px] font-semibold leading-relaxed text-white/30">
                        Consent version: {CONSENT_VERSION}. Submission may
                        record time, request token, consent version, form
                        acknowledgements, and technical metadata for audit and
                        safety purposes.
                      </p>
                    </section>
                  </div>
                ) : null}

                <div className="mx-auto mt-12 h-px max-w-3xl bg-white/10" />

                <footer className="mx-auto mt-7 max-w-4xl text-center">
                  <div className="mx-auto rounded-[1.6rem] border border-white/10 bg-black/35 px-5 py-6">
                    <div className="flex items-center justify-center gap-3">
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
                      This consent page is provided for product transparency and
                      should be reviewed by qualified legal counsel before
                      public launch, regulatory filing, investor review,
                      app-store submission, or law-enforcement request handling.
                    </p>
                  </div>
                </footer>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
