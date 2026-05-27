"use client";

import Image from "next/image";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useMemo, useRef, useState } from "react";
import StayKnownActionMenu from "@/components/StayKnownActionMenu";

type ApplicationFocus =
  | "StayKnown safety overview"
  | "Live Visit protection"
  | "Live Map for approved contacts"
  | "SOS emergency flow"
  | "I’M SAFE daily check-in"
  | "Missed I’M SAFE alerts"
  | "Consent-based contacts"
  | "Safety chat"
  | "Chat translation"
  | "Voice notes and media sharing"
  | "Profile trust and safety gallery"
  | "VPN safety gate"
  | "Premium plans and safety access"
  | "General StayKnown awareness"
  | "Partnership / ambassador proposal";

type InfoKey =
  | "identity"
  | "location"
  | "contact"
  | "stayknown"
  | "tiktok"
  | "focus"
  | "audience"
  | "socialProof"
  | "video"
  | "followers"
  | "consent";

const applicationFocusOptions: ApplicationFocus[] = [
  "StayKnown safety overview",
  "Live Visit protection",
  "Live Map for approved contacts",
  "SOS emergency flow",
  "I’M SAFE daily check-in",
  "Missed I’M SAFE alerts",
  "Consent-based contacts",
  "Safety chat",
  "Chat translation",
  "Voice notes and media sharing",
  "Profile trust and safety gallery",
  "VPN safety gate",
  "Premium plans and safety access",
  "General StayKnown awareness",
  "Partnership / ambassador proposal",
];

const audienceOptions = [
  "Under 1,000",
  "1,000 - 5,000",
  "5,000 - 10,000",
  "10,000 - 50,000",
  "50,000 - 100,000",
  "100,000 - 500,000",
  "500,000+",
];

const platformOptions = [
  "TikTok",
  "Facebook",
  "Instagram",
  "YouTube",
  "X / Twitter",
  "LinkedIn",
  "Telegram",
  "Multiple platforms",
];

const consentText = `
StayKnown Creator / Influencer Application Consent

By submitting this application, I confirm that all information I provide is true, accurate, current, and submitted under my real identity. I understand that StayKnown may reject, pause, remove, or investigate any application that contains false, misleading, incomplete, copied, stolen, or unverifiable information.

I understand that StayKnown is a safety-focused platform. If I am selected to create content, I am responsible for representing the brand carefully, lawfully, and respectfully. I must not create content that misleads users, encourages unsafe behavior, misrepresents StayKnown features, impersonates another person, violates platform rules, spreads false claims, or damages the StayKnown brand.

I understand that StayKnown may review my submitted social profiles, audience information, video sample, engagement quality, public content history, and application details to decide whether I am suitable for creator, influencer, ambassador, awareness, or campaign opportunities.

I understand that the sample video I upload must be my own content or content I am authorized to submit. Clear HD, 4K, or 8K clips are preferred. Low-quality, blurry, copied, stolen, misleading, or unauthorized samples may be rejected.

I understand that StayKnown does not request identity documents at this public application stage. If I am shortlisted, StayKnown may send me a private verification link and request identity/KYC documents appropriate to my country. My legal name and submitted details must match any future verification documents. If I am not comfortable with future verification, I should not proceed.

I understand that my application information and sample media are collected only for application review, authenticity checks, brand-safety assessment, creator selection, and possible campaign follow-up. StayKnown does not sell my application information.

I understand that StayKnown may store my application details while reviewing the application and may delete sample media after review or when it is no longer needed for application assessment, compliance, security, or lawful recordkeeping.

I agree that StayKnown may contact me using the email, WhatsApp number, Telegram username, StayKnown identity, TikTok handle, or other social links I provide.

I confirm that I have opened and reviewed StayKnown Privacy Policy and Terms of Service before submitting this application.
`.trim();

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path
        d="M12 17v-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 7.5h.01"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12 3.8 19 6.5v5.2c0 4.5-2.9 7.4-7 8.6-4.1-1.2-7-4.1-7-8.6V6.5l7-2.7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="m8.8 12.1 2.1 2.1 4.5-4.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconVideo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M5.8 7.2h8.4A2.8 2.8 0 0 1 17 10v4a2.8 2.8 0 0 1-2.8 2.8H5.8A2.8 2.8 0 0 1 3 14v-4a2.8 2.8 0 0 1 2.8-2.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="m17 10.4 3.4-2.1c.5-.3 1.1.1 1.1.7v6c0 .6-.6 1-1.1.7L17 13.6v-3.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconProfile() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12 12.2a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M4.5 20.2c.7-4 3.4-6.1 7.5-6.1s6.8 2.1 7.5 6.1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconLinks() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M9.8 13.7a3.4 3.4 0 0 1 0-4.8l2.6-2.6a3.4 3.4 0 1 1 4.8 4.8l-1.1 1.1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M14.2 10.3a3.4 3.4 0 0 1 0 4.8l-2.6 2.6a3.4 3.4 0 1 1-4.8-4.8l1.1-1.1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MiniCard({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.45rem] border border-white/[0.10] bg-white/[0.045] p-4 shadow-2xl shadow-black/35 backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.07),transparent_28%)]" />
      <div className="relative flex gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/[0.12] bg-black/35 text-white/82">
          {icon}
        </div>
        <div>
          <div className="text-[13px] font-black text-white/92">{title}</div>
          <div className="mt-1.5 text-[12px] font-semibold leading-relaxed text-white/48">
            {body}
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldLabel({
  children,
  required,
  info,
  onInfo,
}: {
  children: ReactNode;
  required?: boolean;
  info: InfoKey;
  onInfo: (key: InfoKey) => void;
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <span className="text-[11px] font-black uppercase tracking-[0.14em] text-white/38">
        {children} {required ? <span className="text-white/70">*</span> : null}
      </span>
      <button
        type="button"
        onClick={() => onInfo(info)}
        className="grid h-6 w-6 place-items-center rounded-full border border-white/[0.10] bg-black/35 text-white/45 transition hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-white/82"
        aria-label="Show field information"
      >
        <InfoIcon />
      </button>
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      type={type}
      required={required}
      className="h-12 w-full rounded-2xl border border-white/[0.10] bg-black/55 px-3 text-[13px] font-bold text-white/82 outline-none transition placeholder:text-white/24 focus:border-white/25"
    />
  );
}

function SelectInput({
  value,
  onChange,
  children,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required={required}
      className="h-12 w-full rounded-2xl border border-white/[0.10] bg-black/55 px-3 text-[13px] font-bold text-white/82 outline-none transition focus:border-white/25"
    >
      {children}
    </select>
  );
}

function CheckRow({
  checked,
  onChange,
  disabled,
  title,
  body,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  title: string;
  body: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer gap-3 rounded-[1.25rem] border p-3 transition",
        disabled
          ? "cursor-not-allowed border-white/[0.06] bg-white/[0.025] opacity-50"
          : "border-white/[0.10] bg-black/30 hover:border-white/[0.16] hover:bg-white/[0.045]",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 accent-white"
      />
      <span>
        <span className="block text-[12px] font-black text-white/86">
          {title}
        </span>
        <span className="mt-1 block text-[11px] font-semibold leading-relaxed text-white/42">
          {body}
        </span>
      </span>
    </label>
  );
}

export default function CreatorApplyPage() {
  const consentRef = useRef<HTMLDivElement | null>(null);

  const [legalFullName, setLegalFullName] = useState("");
  const [country, setCountry] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [city, setCity] = useState("");

  const [email, setEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");

  const [stayknownIdentity, setStayknownIdentity] = useState("");
  const [tiktokHandle, setTiktokHandle] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const [mainPlatform, setMainPlatform] = useState("");
  const [audienceSize, setAudienceSize] = useState("");
  const [applicationFocus, setApplicationFocus] = useState<
    ApplicationFocus | ""
  >("");
  const [contentLanguage, setContentLanguage] = useState("");
  const [previousCampaignUrl, setPreviousCampaignUrl] = useState("");
  const [reasonForApplying, setReasonForApplying] = useState("");
  const [extraMessage, setExtraMessage] = useState("");

  const [socialProof1, setSocialProof1] = useState("");
  const [socialProof2, setSocialProof2] = useState("");
  const [socialProof3, setSocialProof3] = useState("");
  const [socialProof4, setSocialProof4] = useState("");

  const [sampleVideo, setSampleVideo] = useState<File | null>(null);

  const [followsStayknown, setFollowsStayknown] = useState(false);
  const [followsSixClementJoshua, setFollowsSixClementJoshua] = useState(false);
  const [privacyOpened, setPrivacyOpened] = useState(false);
  const [termsOpened, setTermsOpened] = useState(false);
  const [consentScrolled, setConsentScrolled] = useState(false);
  const [truthConfirmed, setTruthConfirmed] = useState(false);
  const [responsibilityAccepted, setResponsibilityAccepted] = useState(false);
  const [contactPermission, setContactPermission] = useState(false);
  const [futureKycNoticeAccepted, setFutureKycNoticeAccepted] = useState(false);
  const [mediaRetentionNoticeAccepted, setMediaRetentionNoticeAccepted] =
    useState(false);

  const [infoOpen, setInfoOpen] = useState<InfoKey | null>(null);
  const [busy, setBusy] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [applicationId, setApplicationId] = useState("");

  const canAcceptFinalConsent = useMemo(() => {
    return privacyOpened && termsOpened && consentScrolled;
  }, [privacyOpened, termsOpened, consentScrolled]);

  const videoLabel = useMemo(() => {
    if (!sampleVideo) return "Choose your best sample video";
    const mb = sampleVideo.size / (1024 * 1024);
    return `${sampleVideo.name} • ${mb.toFixed(1)}MB`;
  }, [sampleVideo]);

  const infoText = useMemo(() => {
    const map: Record<InfoKey, { title: string; body: string }> = {
      identity: {
        title: "Why we need your legal name",
        body: "StayKnown needs real identity details for brand-safety review. Do not use nicknames. If shortlisted later, your legal name must match any future verification documents.",
      },
      location: {
        title: "Why we ask for location",
        body: "Country, state, and city help us understand your market, language, campaign reach, and the appropriate verification process if you are shortlisted.",
      },
      contact: {
        title: "Why WhatsApp is required",
        body: "WhatsApp is required for reliable follow-up. Telegram is optional. We may also use your email for official application updates.",
      },
      stayknown: {
        title: "Why StayKnown identity is required",
        body: "Applicants must have a StayKnown account so we know they understand the platform they want to represent.",
      },
      tiktok: {
        title: "Why TikTok is required",
        body: "TikTok is one of the main channels for short safety-awareness content. Submit your correct public TikTok handle or profile link.",
      },
      focus: {
        title: "Why we ask your content focus",
        body: "This helps us know whether you want to talk about SOS, live maps, safety chat, translation, I’M SAFE check-ins, or general StayKnown awareness.",
      },
      audience: {
        title: "Why audience size matters",
        body: "Audience size and main platform help us place applicants into the right campaign level. Quality, trust, and responsible content matter more than numbers alone.",
      },
      socialProof: {
        title: "Why 4 social links are required",
        body: "Submit four public social/profile links that show your real content, engagement, or creator history. These links help us review authenticity and fit.",
      },
      video: {
        title: "Why sample video is required",
        body: "Upload one sample video that best represents your quality and delivery. HD, 4K, or 8K is preferred. Copied, stolen, blurry, or misleading samples may be rejected.",
      },
      followers: {
        title: "Why following is required",
        body: "Applicants must follow Stay Known and 6 Clement Joshua so they stay connected to official brand updates before any campaign discussion.",
      },
      consent: {
        title: "Why the consent is strict",
        body: "StayKnown is a safety-focused platform. Applicants must understand responsibility, truthfulness, future verification, media review, and privacy before submitting.",
      },
    };

    return infoOpen ? map[infoOpen] : null;
  }, [infoOpen]);

  function handleConsentScroll() {
    const el = consentRef.current;
    if (!el) return;

    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 12;
    if (nearBottom) setConsentScrolled(true);
  }

  function onVideoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    setErrorText("");

    if (!file) {
      setSampleVideo(null);
      return;
    }

    if (!file.type.startsWith("video/")) {
      setSampleVideo(null);
      setErrorText("Please upload a valid video file.");
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      setSampleVideo(null);
      setErrorText(
        "Sample video must be 1MB or smaller. Please compress your clip and upload a short, clear sample for review.",
      );
      return;
    }

    setSampleVideo(file);
  }

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy) return;

    setBusy(true);
    setErrorText("");
    setSuccessMessage("");
    setApplicationId("");

    try {
      if (!sampleVideo) {
        throw new Error("Please upload one sample video.");
      }

      if (!canAcceptFinalConsent) {
        throw new Error(
          "Please open Privacy, open Terms, and read the consent box to the end.",
        );
      }

      const form = new FormData();
      form.set("legal_full_name", legalFullName);
      form.set("country", country);
      form.set("state_region", stateRegion);
      form.set("city", city);
      form.set("email", email);
      form.set("whatsapp_number", whatsappNumber);
      form.set("telegram_username", telegramUsername);
      form.set("stayknown_identity", stayknownIdentity);
      form.set("tiktok_handle", tiktokHandle);
      form.set("facebook_url", facebookUrl);
      form.set("instagram_url", instagramUrl);
      form.set("youtube_url", youtubeUrl);
      form.set("main_platform", mainPlatform);
      form.set("audience_size", audienceSize);
      form.set("application_focus", applicationFocus);
      form.set("content_language", contentLanguage);
      form.set("previous_campaign_url", previousCampaignUrl);
      form.set("reason_for_applying", reasonForApplying);
      form.set("extra_message", extraMessage);
      form.set("social_proof_link_1", socialProof1);
      form.set("social_proof_link_2", socialProof2);
      form.set("social_proof_link_3", socialProof3);
      form.set("social_proof_link_4", socialProof4);

      form.set("follows_stayknown", String(followsStayknown));
      form.set("follows_six_clement_joshua", String(followsSixClementJoshua));
      form.set("privacy_opened", String(privacyOpened));
      form.set("terms_opened", String(termsOpened));
      form.set("consent_scrolled", String(consentScrolled));
      form.set("truth_confirmed", String(truthConfirmed));
      form.set("responsibility_accepted", String(responsibilityAccepted));
      form.set("contact_permission", String(contactPermission));
      form.set("future_kyc_notice_accepted", String(futureKycNoticeAccepted));
      form.set(
        "media_retention_notice_accepted",
        String(mediaRetentionNoticeAccepted),
      );

      form.set("sample_video", sampleVideo);

      const response = await fetch("/api/creator-applications", {
        method: "POST",
        body: form,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.ok) {
        throw new Error(
          data?.message || "We could not submit this application right now.",
        );
      }

      setApplicationId(String(data.application_id || ""));
      setSuccessMessage(
        data.message ||
          "Your StayKnown creator application has been submitted.",
      );

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setErrorText(
        error instanceof Error
          ? error.message
          : "We could not submit this application right now.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <style jsx global>{`
        html,
        body {
          background: #000;
          color-scheme: dark;
          overflow-x: hidden;
        }

        @keyframes skFloatIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.992);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes skSpin {
          to {
            transform: rotate(360deg);
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
            <Image
              src="/6logo.png"
              alt="StayKnown"
              width={34}
              height={34}
              priority
            />
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

      <section className="relative mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-5 sm:pt-10">
        <div className="pointer-events-none absolute left-1/2 top-14 h-80 w-80 -translate-x-1/2 rounded-full bg-white/[0.035] blur-3xl" />

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.045] px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/50 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <span className="h-1.5 w-1.5 rounded-full bg-white/65 shadow-[0_0_18px_rgba(255,255,255,0.5)]" />
            Creator application
          </div>

          <h1 className="mt-5 text-[31px] font-black leading-[1.05] tracking-[-0.06em] text-white sm:text-[46px]">
            Apply to create for StayKnown
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-[13px] font-semibold leading-relaxed text-white/52 sm:text-[14px]">
            We are reviewing responsible creators, influencers, and ambassadors
            who can explain StayKnown safety features clearly, lawfully, and
            with real audience trust.
          </p>
        </div>

        {successMessage ? (
          <div className="relative mx-auto mt-8 max-w-3xl animate-[skFloatIn_0.35s_ease-out_both] overflow-hidden rounded-[2rem] border border-white/[0.12] bg-white/[0.06] p-5 text-center shadow-2xl shadow-black/50 backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.07),transparent_32%)]" />
            <div className="relative">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-[1.25rem] bg-white text-black shadow-2xl shadow-white/10">
                <IconShield />
              </div>
              <h2 className="mt-4 text-[22px] font-black tracking-[-0.04em] text-white">
                Application submitted
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-[13px] font-semibold leading-relaxed text-white/55">
                {successMessage}
              </p>
              {applicationId ? (
                <p className="mt-3 text-[11px] font-bold text-white/35">
                  Application ID: {applicationId}
                </p>
              ) : null}
              <div className="mt-5 flex justify-center gap-2">
                <a
                  href="/"
                  className="rounded-full bg-white px-5 py-3 text-[12px] font-black text-black transition hover:bg-white/90"
                >
                  Return Home
                </a>
                <a
                  href="/submit-request"
                  className="rounded-full border border-white/[0.12] bg-white/[0.045] px-5 py-3 text-[12px] font-black text-white/75 transition hover:bg-white/[0.07] hover:text-white"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        ) : null}

        <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
          <MiniCard
            icon={<IconProfile />}
            title="Real identity only"
            body="Use your legal name. No nicknames, fake identities, impersonation, or misleading information."
          />
          <MiniCard
            icon={<IconVideo />}
            title="Best sample video"
            body="Upload one clear HD, 4K, or 8K sample that shows your strongest creator quality."
          />
          <MiniCard
            icon={<IconLinks />}
            title="Social proof required"
            body="Submit four public social/profile links so we can review authenticity and engagement."
          />
        </div>

        <form
          onSubmit={submitApplication}
          className="relative mt-6 overflow-hidden rounded-[2rem] border border-white/[0.11] bg-white/[0.05] p-4 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:p-5"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_33%),linear-gradient(135deg,rgba(255,255,255,0.075),transparent_28%)]" />

          <div className="relative grid gap-5">
            <div className="rounded-[1.5rem] border border-white/[0.10] bg-black/30 p-4">
              <div className="text-[14px] font-black text-white/92">
                Identity and location
              </div>
              <p className="mt-1 text-[12px] font-semibold leading-relaxed text-white/42">
                Submit your real details. These details must match any future
                verification if shortlisted.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label>
                  <FieldLabel required info="identity" onInfo={setInfoOpen}>
                    Legal full name
                  </FieldLabel>
                  <TextInput
                    value={legalFullName}
                    onChange={setLegalFullName}
                    placeholder="Your real full name"
                    required
                  />
                </label>

                <label>
                  <FieldLabel required info="location" onInfo={setInfoOpen}>
                    Country
                  </FieldLabel>
                  <TextInput
                    value={country}
                    onChange={setCountry}
                    placeholder="Country"
                    required
                  />
                </label>

                <label>
                  <FieldLabel info="location" onInfo={setInfoOpen}>
                    State / region
                  </FieldLabel>
                  <TextInput
                    value={stateRegion}
                    onChange={setStateRegion}
                    placeholder="State, province, or region"
                  />
                </label>

                <label>
                  <FieldLabel required info="location" onInfo={setInfoOpen}>
                    City
                  </FieldLabel>
                  <TextInput
                    value={city}
                    onChange={setCity}
                    placeholder="City"
                    required
                  />
                </label>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/[0.10] bg-black/30 p-4">
              <div className="text-[14px] font-black text-white/92">
                Contact and required handles
              </div>
              <p className="mt-1 text-[12px] font-semibold leading-relaxed text-white/42">
                WhatsApp, TikTok, and StayKnown identity are required for this
                application.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label>
                  <FieldLabel required info="contact" onInfo={setInfoOpen}>
                    Email
                  </FieldLabel>
                  <TextInput
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com"
                    type="email"
                    required
                  />
                </label>

                <label>
                  <FieldLabel required info="contact" onInfo={setInfoOpen}>
                    WhatsApp number
                  </FieldLabel>
                  <TextInput
                    value={whatsappNumber}
                    onChange={setWhatsappNumber}
                    placeholder="+234..."
                    required
                  />
                </label>

                <label>
                  <FieldLabel info="contact" onInfo={setInfoOpen}>
                    Telegram username
                  </FieldLabel>
                  <TextInput
                    value={telegramUsername}
                    onChange={setTelegramUsername}
                    placeholder="@username"
                  />
                </label>

                <label>
                  <FieldLabel required info="stayknown" onInfo={setInfoOpen}>
                    StayKnown username / handle / email
                  </FieldLabel>
                  <TextInput
                    value={stayknownIdentity}
                    onChange={setStayknownIdentity}
                    placeholder="Your StayKnown account identity"
                    required
                  />
                </label>

                <label>
                  <FieldLabel required info="tiktok" onInfo={setInfoOpen}>
                    TikTok handle or URL
                  </FieldLabel>
                  <TextInput
                    value={tiktokHandle}
                    onChange={setTiktokHandle}
                    placeholder="@handle or https://tiktok.com/@..."
                    required
                  />
                </label>

                <label>
                  <FieldLabel info="tiktok" onInfo={setInfoOpen}>
                    Facebook URL
                  </FieldLabel>
                  <TextInput
                    value={facebookUrl}
                    onChange={setFacebookUrl}
                    placeholder="https://facebook.com/..."
                  />
                </label>

                <label>
                  <FieldLabel info="tiktok" onInfo={setInfoOpen}>
                    Instagram URL
                  </FieldLabel>
                  <TextInput
                    value={instagramUrl}
                    onChange={setInstagramUrl}
                    placeholder="https://instagram.com/..."
                  />
                </label>

                <label>
                  <FieldLabel info="tiktok" onInfo={setInfoOpen}>
                    YouTube URL
                  </FieldLabel>
                  <TextInput
                    value={youtubeUrl}
                    onChange={setYoutubeUrl}
                    placeholder="https://youtube.com/..."
                  />
                </label>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/[0.10] bg-black/30 p-4">
              <div className="text-[14px] font-black text-white/92">
                Campaign fit
              </div>
              <p className="mt-1 text-[12px] font-semibold leading-relaxed text-white/42">
                Tell us what part of StayKnown you want to explain and where
                your audience is strongest.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label>
                  <FieldLabel required info="audience" onInfo={setInfoOpen}>
                    Main platform
                  </FieldLabel>
                  <SelectInput
                    value={mainPlatform}
                    onChange={setMainPlatform}
                    required
                  >
                    <option value="">Select platform</option>
                    {platformOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </SelectInput>
                </label>

                <label>
                  <FieldLabel required info="audience" onInfo={setInfoOpen}>
                    Audience size
                  </FieldLabel>
                  <SelectInput
                    value={audienceSize}
                    onChange={setAudienceSize}
                    required
                  >
                    <option value="">Select audience size</option>
                    {audienceOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </SelectInput>
                </label>

                <label className="sm:col-span-2">
                  <FieldLabel required info="focus" onInfo={setInfoOpen}>
                    What do you want to talk about?
                  </FieldLabel>
                  <SelectInput
                    value={applicationFocus}
                    onChange={(v) => setApplicationFocus(v as ApplicationFocus)}
                    required
                  >
                    <option value="">
                      Select StayKnown feature or campaign focus
                    </option>
                    {applicationFocusOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </SelectInput>
                </label>

                <label>
                  <FieldLabel info="focus" onInfo={setInfoOpen}>
                    Content language
                  </FieldLabel>
                  <TextInput
                    value={contentLanguage}
                    onChange={setContentLanguage}
                    placeholder="English, French, Yoruba..."
                  />
                </label>

                <label>
                  <FieldLabel info="audience" onInfo={setInfoOpen}>
                    Previous campaign URL
                  </FieldLabel>
                  <TextInput
                    value={previousCampaignUrl}
                    onChange={setPreviousCampaignUrl}
                    placeholder="https://..."
                  />
                </label>
              </div>

              <label className="mt-3 block">
                <FieldLabel required info="focus" onInfo={setInfoOpen}>
                  Why should StayKnown work with you?
                </FieldLabel>
                <textarea
                  value={reasonForApplying}
                  onChange={(event) => setReasonForApplying(event.target.value)}
                  rows={5}
                  required
                  placeholder="Explain your content style, audience, safety awareness angle, and how you plan to talk about StayKnown responsibly."
                  className="w-full resize-none rounded-[1.35rem] border border-white/[0.10] bg-black/55 px-3 py-3 text-[13px] font-semibold leading-relaxed text-white/82 outline-none transition placeholder:text-white/24 focus:border-white/25"
                />
              </label>
            </div>

            <div className="rounded-[1.5rem] border border-white/[0.10] bg-black/30 p-4">
              <div className="text-[14px] font-black text-white/92">
                Social proof and sample video
              </div>
              <p className="mt-1 text-[12px] font-semibold leading-relaxed text-white/42">
                Submit real, public links. Because we receive many applications,
                wrong or misleading links may lead to rejection.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[socialProof1, socialProof2, socialProof3, socialProof4].map(
                  (value, index) => {
                    const setters = [
                      setSocialProof1,
                      setSocialProof2,
                      setSocialProof3,
                      setSocialProof4,
                    ];

                    return (
                      <label key={index}>
                        <FieldLabel
                          required
                          info="socialProof"
                          onInfo={setInfoOpen}
                        >
                          Social proof link {index + 1}
                        </FieldLabel>
                        <TextInput
                          value={value}
                          onChange={setters[index]}
                          placeholder="https://social-profile-or-content-link"
                          required
                        />
                      </label>
                    );
                  },
                )}
              </div>

              <label className="mt-4 block">
                <FieldLabel required info="video" onInfo={setInfoOpen}>
                  Sample video
                </FieldLabel>
                <div className="rounded-[1.35rem] border border-dashed border-white/[0.16] bg-black/45 p-4">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={onVideoChange}
                    required
                    className="block w-full text-[12px] font-semibold text-white/55 file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-[12px] file:font-black file:text-black"
                  />
                  <p className="mt-3 text-[11px] font-semibold leading-relaxed text-white/36">
                    {videoLabel}. Upload one sample video that best represents
                    your content quality. HD, 4K, or 8K clips are preferred.
                    Maximum size: 1MB. Compress your clip before uploading;
                    short, clear HD samples are enough for review.
                  </p>
                </div>
              </label>

              <label className="mt-3 block">
                <FieldLabel info="focus" onInfo={setInfoOpen}>
                  Extra message
                </FieldLabel>
                <textarea
                  value={extraMessage}
                  onChange={(event) => setExtraMessage(event.target.value)}
                  rows={4}
                  placeholder="Anything else we should know?"
                  className="w-full resize-none rounded-[1.35rem] border border-white/[0.10] bg-black/55 px-3 py-3 text-[13px] font-semibold leading-relaxed text-white/82 outline-none transition placeholder:text-white/24 focus:border-white/25"
                />
              </label>
            </div>

            <div className="rounded-[1.5rem] border border-white/[0.10] bg-black/30 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[14px] font-black text-white/92">
                    Required confirmations
                  </div>
                  <p className="mt-1 text-[12px] font-semibold leading-relaxed text-white/42">
                    Read everything carefully. These confirmations are required
                    before submission.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setInfoOpen("consent")}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/[0.10] bg-black/35 text-white/45"
                >
                  <InfoIcon />
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <CheckRow
                  checked={followsStayknown}
                  onChange={setFollowsStayknown}
                  title="I follow Stay Known"
                  body="Required before application review."
                />
                <CheckRow
                  checked={followsSixClementJoshua}
                  onChange={setFollowsSixClementJoshua}
                  title="I follow 6 Clement Joshua"
                  body="Required before application review."
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setPrivacyOpened(true)}
                  className="rounded-full border border-white/[0.12] bg-white/[0.045] px-4 py-2 text-[11px] font-black text-white/70 transition hover:bg-white/[0.07] hover:text-white"
                >
                  Open Privacy Policy
                </a>
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setTermsOpened(true)}
                  className="rounded-full border border-white/[0.12] bg-white/[0.045] px-4 py-2 text-[11px] font-black text-white/70 transition hover:bg-white/[0.07] hover:text-white"
                >
                  Open Terms of Service
                </a>
              </div>

              <div className="mt-4 rounded-[1.35rem] border border-white/[0.10] bg-black/55 p-3">
                <div className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-white/38">
                  Scroll consent to the end
                </div>
                <div
                  ref={consentRef}
                  onScroll={handleConsentScroll}
                  className="max-h-56 overflow-y-auto rounded-2xl border border-white/[0.08] bg-black/55 p-3 text-[12px] font-semibold leading-relaxed text-white/54"
                >
                  <pre className="whitespace-pre-wrap font-sans">
                    {consentText}
                  </pre>
                </div>
                <p className="mt-2 text-[11px] font-semibold text-white/35">
                  {consentScrolled
                    ? "Consent read to the end."
                    : "You must read through to the end before final consent can be accepted."}
                </p>
              </div>

              <div className="mt-4 grid gap-3">
                <CheckRow
                  checked={truthConfirmed}
                  onChange={setTruthConfirmed}
                  disabled={!canAcceptFinalConsent}
                  title="I confirm my information is true"
                  body="All names, links, handles, location, and submitted media are real and accurate."
                />
                <CheckRow
                  checked={responsibilityAccepted}
                  onChange={setResponsibilityAccepted}
                  disabled={!canAcceptFinalConsent}
                  title="I accept creator responsibility"
                  body="If selected, I will represent StayKnown lawfully, respectfully, and without false claims."
                />
                <CheckRow
                  checked={contactPermission}
                  onChange={setContactPermission}
                  disabled={!canAcceptFinalConsent}
                  title="I allow StayKnown to contact me"
                  body="StayKnown may contact me by email, WhatsApp, Telegram, StayKnown identity, TikTok, or provided social links."
                />
                <CheckRow
                  checked={futureKycNoticeAccepted}
                  onChange={setFutureKycNoticeAccepted}
                  disabled={!canAcceptFinalConsent}
                  title="I understand future verification may be required"
                  body="If shortlisted, StayKnown may request identity/KYC documents through a private verification link."
                />
                <CheckRow
                  checked={mediaRetentionNoticeAccepted}
                  onChange={setMediaRetentionNoticeAccepted}
                  disabled={!canAcceptFinalConsent}
                  title="I understand media review and retention"
                  body="My sample video is used for application review and may be deleted after review or when no longer needed."
                />
              </div>
            </div>

            {errorText ? (
              <div className="rounded-2xl border border-white/[0.12] bg-white/[0.055] px-4 py-3 text-[12px] font-bold leading-relaxed text-white/72">
                {errorText}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className={cn(
                "flex h-13 w-full items-center justify-center rounded-full px-5 py-4 text-[13px] font-black shadow-2xl transition active:scale-[0.985]",
                busy
                  ? "cursor-not-allowed bg-white/55 text-black/60"
                  : "bg-white text-black shadow-white/10 hover:-translate-y-0.5 hover:bg-white/90",
              )}
            >
              {busy ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-[skSpin_0.85s_linear_infinite] rounded-full border-2 border-black/20 border-t-black" />
                  Submitting application...
                </span>
              ) : (
                "Submit Application"
              )}
            </button>

            <p className="text-center text-[11px] font-semibold leading-relaxed text-white/34">
              Do not submit identity documents here. If shortlisted, StayKnown
              will send a private verification link.
            </p>
          </div>
        </form>
      </section>

      {infoText ? (
        <div className="fixed inset-0 z-[2147483602] grid place-items-center bg-black/75 px-4 backdrop-blur-md">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            onClick={() => setInfoOpen(null)}
            aria-label="Close field information"
          />
          <div className="relative w-full max-w-sm overflow-hidden rounded-[1.6rem] border border-white/[0.12] bg-black/[0.92] p-5 shadow-2xl shadow-black/80">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.13),transparent_35%)]" />
            <div className="relative">
              <div className="text-[15px] font-black text-white/92">
                {infoText.title}
              </div>
              <p className="mt-2 text-[12px] font-semibold leading-relaxed text-white/52">
                {infoText.body}
              </p>
              <button
                type="button"
                onClick={() => setInfoOpen(null)}
                className="mt-4 w-full rounded-full bg-white px-4 py-3 text-[12px] font-black text-black transition hover:bg-white/90"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <footer className="relative z-20 w-full">
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-4 sm:pb-10 sm:pt-6">
          <div className="h-px bg-white/[0.08]" />

          <div className="mt-6 flex flex-col items-center gap-3 text-center sm:mt-8">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] font-semibold leading-relaxed text-white/42 sm:text-[12px]">
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white/75"
              >
                Privacy Policy
              </a>
              <span className="text-white/18">•</span>
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white/75"
              >
                Terms of Service
              </a>
              <span className="text-white/18">•</span>
              <a
                href="/acceptable-use"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white/75"
              >
                Acceptable Use
              </a>
              <span className="text-white/18">•</span>
              <a
                href="/safety"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white/75"
              >
                Safety &amp; Anti-Stalking
              </a>
              <span className="text-white/18">•</span>
              <a
                href="/trust-safety"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white/75"
              >
                Trust &amp; Safety
              </a>
              <span className="text-white/18">•</span>
              <a
                href="/security"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white/75"
              >
                Security Disclosure
              </a>
            </div>

            <div className="text-[12px] font-semibold text-white/50">
              A 6 Clement Joshua service
              <span className="ml-1 align-super text-[10px] text-white/25">
                ™
              </span>
            </div>

            <div className="text-[11px] font-semibold text-white/30">
              {new Date().getFullYear()} • stay-known.com
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
