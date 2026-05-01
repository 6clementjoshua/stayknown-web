"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";

const UPDATED_AT = "2026-04-30";
const SITE_URL = "https://stay-known.com";
const LOGO_URL = `${SITE_URL}/6logo.png`;

type SubmitState = "idle" | "sending" | "success" | "error";

function fmtDate(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function useSeoMeta() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    document.title =
      "Submit a Request | StayKnown Support, Safety, Account, Billing & App Help";

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
      "Submit a StayKnown support request for account help, safety features, contacts, live location, SOS, chat, billing, wallet, app issues, security concerns, or policy questions.",
    );
    upsertMeta(
      "keywords",
      "StayKnown submit request, StayKnown support, safety app support, SOS app help, live location support, emergency contact app support, StayKnown billing support, StayKnown wallet support, StayKnown contact approval help, Nigeria safety app support",
    );
    upsertMeta("robots", "index, follow");
    upsertMeta("author", "6 Clement Joshua");

    upsertProperty("og:title", "Submit a Request | StayKnown Support");
    upsertProperty(
      "og:description",
      "Contact StayKnown support for safety, account, billing, contacts, SOS, live location, chat, wallet, app, and policy help.",
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

function RequestIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M6.4 4.5h8.4l2.8 2.8v12.2H6.4v-15Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M14.8 4.5v2.8h2.8M9 10.5h6M9 13.4h6M9 16.3h3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
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

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="m7.4 12.25 3.05 3.05 6.35-7"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-white/58">
      {children}
    </span>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[12px] font-black uppercase tracking-[0.14em] text-white/42">
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  name,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  name?: string;
}) {
  return (
    <input
      name={name}
      type={type}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="mt-2 w-full rounded-[1.15rem] border border-white/10 bg-white/[0.045] px-4 py-3 text-[14px] font-bold text-white outline-none shadow-sm transition placeholder:text-white/25 hover:border-white/16 hover:bg-white/[0.06] focus:border-white/24 focus:bg-white/[0.075] focus:ring-4 focus:ring-white/[0.045]"
    />
  );
}

function Select({
  value,
  onChange,
  children,
  name,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  name?: string;
}) {
  return (
    <select
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-2 w-full rounded-[1.15rem] border border-white/10 bg-[#0b0b0b] px-4 py-3 text-[14px] font-bold text-white outline-none shadow-sm transition hover:border-white/16 hover:bg-[#111] focus:border-white/24 focus:bg-[#111] focus:ring-4 focus:ring-white/[0.045]"
    >
      {children}
    </select>
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  required,
  name,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  required?: boolean;
  name?: string;
}) {
  return (
    <textarea
      name={name}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={7}
      className="mt-2 w-full resize-none rounded-[1.15rem] border border-white/10 bg-white/[0.045] px-4 py-3 text-[14px] font-bold leading-relaxed text-white outline-none shadow-sm transition placeholder:text-white/25 hover:border-white/16 hover:bg-white/[0.06] focus:border-white/24 focus:bg-white/[0.075] focus:ring-4 focus:ring-white/[0.045]"
    />
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

function FeedbackPanel({
  state,
  error,
  submissionId,
}: {
  state: SubmitState;
  error: string;
  submissionId: string;
}) {
  if (state !== "success" && state !== "error") return null;

  const isSuccess = state === "success";

  return (
    <div
      className={cx(
        "animate-[riseIn_0.35s_ease_both] rounded-[1.25rem] border p-4 shadow-sm",
        isSuccess
          ? "border-white/12 bg-white/[0.045]"
          : "border-white/10 bg-white/[0.04]",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cx(
            "grid h-9 w-9 shrink-0 place-items-center rounded-full border",
            isSuccess
              ? "border-white/15 bg-white text-black"
              : "border-white/12 bg-black text-white",
          )}
        >
          {isSuccess ? (
            <CheckIcon className="h-5 w-5" />
          ) : (
            <AlertIcon className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0">
          <div className="text-[13px] font-black text-white/92">
            {isSuccess ? "Request received" : "Request not sent"}
          </div>

          <p className="mt-1 text-[12.5px] font-semibold leading-relaxed text-white/56">
            {isSuccess
              ? "StayKnown has received your request. A confirmation email with your summary has been sent to the address you provided."
              : error || "We could not send this right now. Please try again."}
          </p>

          {isSuccess && submissionId ? (
            <div className="mt-2 text-[11px] font-black text-white/38">
              Submission ID: {submissionId}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function SubmitRequestPage() {
  useSeoMeta();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [stayknownUsername, setStayknownUsername] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [category, setCategory] = useState("Account or login help");
  const [priority, setPriority] = useState("normal");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [appPlatform, setAppPlatform] = useState("");
  const [appVersion, setAppVersion] = useState("");
  const [deviceInfo, setDeviceInfo] = useState("");
  const [relatedPolicy, setRelatedPolicy] = useState("");
  const [consentToContact, setConsentToContact] = useState(true);
  const [website, setWebsite] = useState("");

  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState("");
  const [submissionId, setSubmissionId] = useState("");

  const canSubmit = useMemo(() => {
    return (
      state !== "sending" &&
      email.trim().length >= 5 &&
      subject.trim().length >= 3 &&
      message.trim().length >= 20
    );
  }, [email, subject, message, state]);

  useEffect(() => {
    if (state !== "success" && state !== "error") return;

    const timer = window.setTimeout(() => {
      setState("idle");
      setError("");
      setSubmissionId("");
    }, 6000);

    return () => window.clearTimeout(timer);
  }, [state]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!canSubmit) {
      setError("Please complete the required fields before submitting.");
      setState("error");
      return;
    }

    setState("sending");
    setError("");
    setSubmissionId("");

    try {
      const res = await fetch("/api/support-submission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submission_type: "support_request",
          full_name: fullName,
          email,
          stayknown_username: stayknownUsername,
          account_email: accountEmail,
          category,
          priority,
          subject,
          message,
          app_platform: appPlatform,
          app_version: appVersion,
          device_info: deviceInfo,
          related_policy: relatedPolicy,
          consent_to_contact: consentToContact,
          website,

          site_url: SITE_URL,
          logo_url: LOGO_URL,
          brand_logo_url: LOGO_URL,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        throw new Error(
          typeof data?.message === "string"
            ? data.message
            : "We could not send this right now. Please try again.",
        );
      }

      setSubmissionId(String(data.submission_id || ""));
      setState("success");

      setSubject("");
      setMessage("");
      setDeviceInfo("");
      setAppVersion("");
      setRelatedPolicy("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We could not send this right now. Please try again.",
      );
      setState("error");
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Submit a Request | StayKnown Support",
    dateModified: UPDATED_AT,
    publisher: {
      "@type": "Organization",
      name: "StayKnown",
      brand: "A 6 Clement Joshua service™",
      url: SITE_URL,
      logo: LOGO_URL,
    },
    description:
      "Submit a StayKnown support request for account, safety, contacts, SOS, live location, chat, billing, wallet, app, and policy help.",
  };

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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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

              <div className="relative">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill>Support Request</Pill>
                  <Pill>Safety Help</Pill>
                  <Pill>StayKnown Support</Pill>
                </div>

                <h1 className="mt-5 max-w-4xl text-[30px] font-black tracking-[-0.045em] text-white md:text-[46px] md:leading-[1.02]">
                  Submit a StayKnown request for account, safety, location,
                  contact, chat, billing, wallet, or app support.
                </h1>

                <p className="mt-5 max-w-3xl text-[14.5px] font-semibold leading-relaxed text-white/62 md:text-[15px]">
                  Use this page to ask StayKnown for help with the app, your
                  account, contact approvals, SOS setup, Visit sessions, LIVE
                  map links, chat, notifications, billing, coins, wallet, safety
                  settings, or policy questions.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <div className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-[12px] font-black text-white/55">
                    Updated: {fmtDate(UPDATED_AT)}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[360px_1fr]">
              <aside className="border-b border-white/10 bg-black/35 p-5 lg:border-b-0 lg:border-r lg:p-7">
                <div className="space-y-4">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.032] p-5 shadow-sm">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      Before you submit
                    </H2>
                    <div className="mt-3">
                      <P>
                        StayKnown reviews requests for safety, support, and
                        product-improvement purposes. Do not use this form for
                        threats, harassment, fake emergencies, spam, illegal
                        requests, impersonation attempts, payment fraud, or
                        requests to bypass safety systems.
                      </P>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.032] p-5 shadow-sm">
                    <H2 icon={<AlertIcon className="h-4 w-4" />}>
                      Immediate danger
                    </H2>
                    <div className="mt-3">
                      <P>
                        StayKnown support is not emergency dispatch. If someone
                        is in immediate danger, contact the official local
                        emergency number or proper local authority first.
                      </P>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.032] p-5 shadow-sm">
                    <H2 icon={<RequestIcon className="h-4 w-4" />}>
                      Good request details
                    </H2>
                    <ul className="mt-3 ml-5 list-disc space-y-1.5 text-[13px] font-semibold leading-relaxed text-white/58">
                      <li>Your account email or username.</li>
                      <li>The exact feature involved.</li>
                      <li>What happened and when.</li>
                      <li>Your device and app version if known.</li>
                      <li>Receipt or payment reference for billing issues.</li>
                    </ul>
                  </div>
                </div>
              </aside>

              <div className="p-5 md:p-8">
                <form onSubmit={onSubmit} className="space-y-6">
                  <input
                    aria-hidden="true"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    name="website"
                    className="hidden"
                  />

                  <section className="rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5 shadow-sm">
                    <H2 icon={<RequestIcon className="h-4 w-4" />}>
                      Request details
                    </H2>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Full name</Label>
                        <Input
                          value={fullName}
                          onChange={setFullName}
                          placeholder="Your name"
                          name="full_name"
                        />
                      </div>

                      <div>
                        <Label>Email address *</Label>
                        <Input
                          value={email}
                          onChange={setEmail}
                          placeholder="you@example.com"
                          type="email"
                          required
                          name="email"
                        />
                      </div>

                      <div>
                        <Label>StayKnown username</Label>
                        <Input
                          value={stayknownUsername}
                          onChange={setStayknownUsername}
                          placeholder="@username"
                          name="stayknown_username"
                        />
                      </div>

                      <div>
                        <Label>Account email</Label>
                        <Input
                          value={accountEmail}
                          onChange={setAccountEmail}
                          placeholder="Account email if different"
                          type="email"
                          name="account_email"
                        />
                      </div>

                      <div>
                        <Label>Category</Label>
                        <Select
                          value={category}
                          onChange={setCategory}
                          name="category"
                        >
                          <option>Account or login help</option>
                          <option>Contact approval or consent</option>
                          <option>SOS or emergency contact setup</option>
                          <option>Visit, destination, or LIVE map</option>
                          <option>Manual capture or safety history</option>
                          <option>Chat, voice note, media, or stickers</option>
                          <option>Translation or language support</option>
                          <option>
                            Billing, subscription, coins, or wallet
                          </option>
                          <option>Notifications or emails</option>
                          <option>App bug or technical issue</option>
                          <option>Policy or safety question</option>
                          <option>Other support request</option>
                        </Select>
                      </div>

                      <div>
                        <Label>Priority</Label>
                        <Select
                          value={priority}
                          onChange={setPriority}
                          name="priority"
                        >
                          <option value="low">Low</option>
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </Select>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5 shadow-sm">
                    <H2 icon={<ShieldIcon className="h-4 w-4" />}>
                      Tell us what happened
                    </H2>

                    <div className="mt-5 space-y-4">
                      <div>
                        <Label>Subject *</Label>
                        <Input
                          value={subject}
                          onChange={setSubject}
                          placeholder="Example: I need help with contact approval"
                          required
                          name="subject"
                        />
                      </div>

                      <div>
                        <Label>Message *</Label>
                        <Textarea
                          value={message}
                          onChange={setMessage}
                          placeholder="Explain your request clearly. Include what happened, when it happened, what screen or feature was involved, and what you expected to happen."
                          required
                          name="message"
                        />
                        <div className="mt-2 text-[11px] font-bold text-white/35">
                          Minimum 20 characters. Do not include passwords, OTPs,
                          full card numbers, or unnecessary private data.
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5 shadow-sm">
                    <H2 icon={<RequestIcon className="h-4 w-4" />}>
                      App context
                    </H2>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>App platform</Label>
                        <Select
                          value={appPlatform}
                          onChange={setAppPlatform}
                          name="app_platform"
                        >
                          <option value="">Select platform</option>
                          <option>iPhone / iOS</option>
                          <option>Android</option>
                          <option>Web</option>
                          <option>Other</option>
                        </Select>
                      </div>

                      <div>
                        <Label>App version</Label>
                        <Input
                          value={appVersion}
                          onChange={setAppVersion}
                          placeholder="Example: 1.0.7"
                          name="app_version"
                        />
                      </div>

                      <div>
                        <Label>Device info</Label>
                        <Input
                          value={deviceInfo}
                          onChange={setDeviceInfo}
                          placeholder="Example: iPhone 14, Samsung A54, Chrome"
                          name="device_info"
                        />
                      </div>

                      <div>
                        <Label>Related policy</Label>
                        <Select
                          value={relatedPolicy}
                          onChange={setRelatedPolicy}
                          name="related_policy"
                        >
                          <option value="">No policy selected</option>
                          <option>Terms of Service</option>
                          <option>Privacy Policy</option>
                          <option>Safety & Anti-Stalking</option>
                          <option>Acceptable Use</option>
                          <option>Location & Live Safety</option>
                          <option>Contact Approval & Consent</option>
                          <option>Emergency Disclaimer</option>
                          <option>Child Safety & Minor Use</option>
                          <option>Abuse Reporting</option>
                          <option>Security Disclosure</option>
                          <option>Law Enforcement & Emergency Requests</option>
                          <option>Data Retention</option>
                          <option>Billing & Refunds Policy</option>
                        </Select>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5 shadow-sm">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={consentToContact}
                        onChange={(e) => setConsentToContact(e.target.checked)}
                        className="mt-1 h-4 w-4 accent-white"
                      />
                      <span className="text-[13px] font-semibold leading-relaxed text-white/60">
                        I agree that StayKnown may contact me about this request
                        using the email address I provided. I understand this
                        form must not be used for threats, harassment, fake
                        emergencies, illegal requests, impersonation, spam,
                        payment fraud, or requests to bypass safety systems.
                      </span>
                    </label>
                  </section>

                  <div className="space-y-3 rounded-[1.45rem] border border-white/10 bg-white/[0.025] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-[11px] font-bold leading-relaxed text-white/35">
                        By submitting, you agree that StayKnown may process this
                        request under its Privacy, Terms, Safety, Retention, and
                        Acceptable Use policies.
                      </div>

                      <button
                        type="submit"
                        disabled={!canSubmit}
                        className={cx(
                          "min-w-[190px] rounded-full border px-6 py-3 text-[13px] font-black shadow-xl transition",
                          canSubmit
                            ? "border-white/15 bg-white text-black hover:-translate-y-0.5 hover:bg-white/90"
                            : "cursor-not-allowed border-white/10 bg-white/10 text-white/30",
                        )}
                      >
                        {state === "sending" ? "Sending..." : "Submit request"}
                      </button>
                    </div>

                    <FeedbackPanel
                      state={state}
                      error={error}
                      submissionId={submissionId}
                    />
                  </div>
                </form>

                <div className="mx-auto mt-12 h-px max-w-3xl bg-white/10" />

                <footer className="mx-auto mt-7 max-w-4xl text-center">
                  <div className="mx-auto rounded-[1.6rem] border border-white/10 bg-black/35 px-5 py-6">
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] font-black uppercase tracking-[0.12em] text-white/35">
                      <a
                        href="/privacy"
                        className="transition hover:text-white"
                      >
                        Privacy
                      </a>
                      <a href="/terms" className="transition hover:text-white">
                        Terms
                      </a>
                      <a href="/safety" className="transition hover:text-white">
                        Safety
                      </a>
                      <a
                        href="/acceptable-use"
                        className="transition hover:text-white"
                      >
                        Acceptable Use
                      </a>
                      <a
                        href="/billing-policy"
                        className="transition hover:text-white"
                      >
                        Billing Policy
                      </a>
                    </div>

                    <div className="mt-5 flex items-center justify-center gap-3">
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
