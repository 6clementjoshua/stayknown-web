"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const UPDATED_AT = "2026-05-01";

type HelpArticle = {
  id: string;
  category: string;
  title: string;
  summary: string;
  answer: string[];
  links?: { label: string; href: string }[];
  tags: string[];
};

const articles: HelpArticle[] = [
  {
    id: "getting-started",
    category: "Getting started",
    title: "How do I start using StayKnown safely?",
    summary:
      "Set up your account, profile, permissions, approved contacts, and safety basics before relying on visits or SOS.",
    answer: [
      "Create your account with accurate personal details so trusted contacts can recognize you during safety moments.",
      "Allow the required device permissions, especially location and notifications, because Visit, LIVE, SOS, manual capture, and chat map flows depend on reliable device access.",
      "Add trusted contacts and wait for approval where approval is required. StayKnown is built around known, trusted, consent-aware safety relationships.",
      "Review the safety rules before using LIVE sharing, SOS, chat, stories, stickers, or location features.",
    ],
    links: [
      { label: "Contact Approval & Consent", href: "/contact-consent" },
      { label: "Safety & Anti-Stalking", href: "/safety" },
      { label: "Submit a request", href: "/submit-request" },
    ],
    tags: ["setup", "account", "permissions", "contacts", "start"],
  },
  {
    id: "start-visit",
    category: "Visits & LIVE",
    title: "What is a Visit and when should I start one?",
    summary:
      "A Visit is the main safety session that lets StayKnown understand that you are actively moving, visiting, or meeting.",
    answer: [
      "Start a Visit before a safety-relevant movement, meeting, trip, visit, ride, work stop, school stop, or situation where trusted people may need context.",
      "A Visit can support destination context, LIVE sharing, safety history, SOS readiness, and manual capture when those features are available.",
      "Do not start fake Visits. StayKnown safety sessions should reflect real safety use, not pranks, pressure, or manipulation.",
    ],
    links: [
      { label: "Location & Live Safety", href: "/location-safety" },
      { label: "Emergency Disclaimer", href: "/emergency" },
    ],
    tags: ["visit", "start visit", "live", "destination", "tracking"],
  },
  {
    id: "live-map-approved",
    category: "Visits & LIVE",
    title: "Who can see my live map?",
    summary:
      "Live map access should only flow through permitted safety paths and approved trusted-contact relationships.",
    answer: [
      "Approved contacts may receive access to map context only through supported StayKnown safety flows such as active Visit, SOS, manual capture, or approved-contact chat map.",
      "StayKnown is not built for public tracking. Map access is intended for trusted, consent-aware safety relationships.",
      "Anyone receiving a link or alert must use it responsibly and must not share it unnecessarily.",
    ],
    links: [
      { label: "Location & Live Safety", href: "/location-safety" },
      { label: "Data Retention", href: "/retention" },
      { label: "Abuse Reporting", href: "/abuse" },
    ],
    tags: ["live map", "approved contacts", "location", "privacy", "map"],
  },
  {
    id: "location-not-updating",
    category: "Troubleshooting",
    title: "Why is my location not updating correctly?",
    summary:
      "Location depends on device permissions, GPS, network, battery settings, app state, VPN, and provider reliability.",
    answer: [
      "Check that location permission is enabled for StayKnown and that the app is allowed to use precise location where your device supports it.",
      "Turn off VPN when using safety flows because VPN can reduce location confidence and may trigger StayKnown safety gates.",
      "Check your network connection, battery saver mode, and device GPS. Poor coverage, weak GPS, or aggressive battery settings can delay updates.",
      "If the location still looks wrong, stop relying on the app alone and directly contact your trusted contacts or local emergency services if danger exists.",
    ],
    links: [
      { label: "Location & Live Safety", href: "/location-safety" },
      { label: "Security Disclosure", href: "/security" },
      { label: "Submit a request", href: "/submit-request" },
    ],
    tags: ["location", "gps", "not updating", "vpn", "map", "troubleshooting"],
  },
  {
    id: "vpn-block",
    category: "Troubleshooting",
    title: "Why does StayKnown warn me about VPN?",
    summary:
      "VPN can interfere with safety reliability, location confidence, fraud prevention, and platform integrity.",
    answer: [
      "StayKnown may warn, restrict, or block certain flows when VPN is active because safety location should be as reliable as possible.",
      "If VPN is enabled before opening the app, you may see a safety gate. If VPN turns on during an active Visit, StayKnown may treat that as a safety reliability issue.",
      "Turn VPN off before using Visit, LIVE, SOS, chat location, or manual capture.",
    ],
    links: [
      { label: "Location & Live Safety", href: "/location-safety" },
      { label: "Security Disclosure", href: "/security" },
    ],
    tags: ["vpn", "blocked", "location", "safety gate", "security"],
  },
  {
    id: "sos-use",
    category: "SOS & emergency",
    title: "When should I use SOS?",
    summary:
      "SOS is for serious safety moments, not jokes, pressure, revenge, or fake emergencies.",
    answer: [
      "Use SOS when you believe you may need urgent trusted-contact awareness or safety escalation.",
      "Do not use SOS as a prank, test, threat, manipulation, or false emergency.",
      "If someone is in immediate danger, contact official emergency services first. StayKnown does not replace police, ambulance, fire service, hospitals, rescue teams, or official dispatch.",
    ],
    links: [
      { label: "Emergency Disclaimer", href: "/emergency" },
      { label: "Safety & Anti-Stalking", href: "/safety" },
      { label: "Abuse Reporting", href: "/abuse" },
    ],
    tags: ["sos", "emergency", "urgent", "help", "danger"],
  },
  {
    id: "end-sos",
    category: "SOS & emergency",
    title: "Why does ending SOS require confirmation?",
    summary:
      "Verified stopping protects users from accidental or unsafe emergency cancellation.",
    answer: [
      "When SOS is active, StayKnown may require stronger confirmation before ending it so protection is not stopped by mistake.",
      "This helps prevent accidental taps, pressure from another person, or confusing emergency states.",
      "If SOS was triggered accidentally, end it only when you are sure it is safe and appropriate.",
    ],
    links: [
      { label: "Emergency Disclaimer", href: "/emergency" },
      { label: "Data Retention", href: "/retention" },
    ],
    tags: ["end sos", "verify", "stop sos", "confirmation"],
  },
  {
    id: "manual-capture",
    category: "SOS & emergency",
    title: "What is Manual Emergency Capture?",
    summary:
      "Manual Capture lets a user send an extra safety update during an active Visit.",
    answer: [
      "Manual Capture is designed for active Visit moments where you want to send an extra location safety update without changing the normal Visit flow.",
      "The feature may depend on plan limits, active Visit state, approved contacts, device permissions, and location reliability.",
      "Do not use Manual Capture to spam contacts or create false safety events.",
    ],
    links: [
      { label: "Location & Live Safety", href: "/location-safety" },
      { label: "Terms of Service", href: "/terms" },
    ],
    tags: ["manual capture", "capture", "visit", "location", "limit"],
  },
  {
    id: "contact-approval",
    category: "Contacts",
    title: "Why do contacts need approval?",
    summary:
      "Approval keeps StayKnown consent-aware and helps prevent stalking, unwanted alerts, and unsafe contact misuse.",
    answer: [
      "StayKnown is designed around approved, trusted people. Approval helps prove that a person accepted or declined a safety role.",
      "Contacts may need to confirm by email or through a consent flow before they receive certain safety responsibility.",
      "If someone declines or removes themselves, respect that decision.",
    ],
    links: [
      { label: "Contact Approval & Consent", href: "/contact-consent" },
      { label: "Safety & Anti-Stalking", href: "/safety" },
    ],
    tags: ["contact", "approval", "consent", "pending", "declined"],
  },
  {
    id: "pending-contact",
    category: "Contacts",
    title: "What should I do if a contact is still pending?",
    summary:
      "Pending means the person has not completed the approval step yet, or the request may have expired.",
    answer: [
      "Ask the person to check their email and complete the approval step if they agree to be a trusted contact.",
      "If the request expired, use the available resend flow where supported.",
      "Do not repeatedly pressure someone to accept a contact request.",
    ],
    links: [
      { label: "Contact Approval & Consent", href: "/contact-consent" },
      { label: "Submit a request", href: "/submit-request" },
    ],
    tags: ["pending", "contact", "email", "approval", "resend"],
  },
  {
    id: "blocked-add",
    category: "Contacts",
    title: "Why can’t I add someone as a contact?",
    summary:
      "They may have security settings enabled, may have declined, or your request may not be permitted.",
    answer: [
      "A user may block other people from adding them based on their security settings.",
      "A contact request can also fail if the email is wrong, the person declined, the approval expired, or the account is restricted.",
      "StayKnown should not be used to bypass someone’s privacy or safety boundary.",
    ],
    links: [
      { label: "Contact Approval & Consent", href: "/contact-consent" },
      { label: "Abuse Reporting", href: "/abuse" },
    ],
    tags: ["blocked", "add contact", "cannot add", "security setting"],
  },
  {
    id: "chat-approved",
    category: "Chat",
    title: "Who can I chat with on StayKnown?",
    summary:
      "StayKnown chat should be tied to approved contacts and safety-aware communication.",
    answer: [
      "Chat is designed for trusted, approved-contact communication, not random messaging or harassment.",
      "Some chat features may depend on plan, safety rules, account state, language settings, and contact relationship.",
      "Messages may include safety context such as location metadata where supported by the app flow.",
    ],
    links: [
      { label: "Acceptable Use", href: "/acceptable-use" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Safety & Anti-Stalking", href: "/safety" },
    ],
    tags: ["chat", "approved contacts", "messages", "thread"],
  },
  {
    id: "translation",
    category: "Chat",
    title: "How does chat translation work?",
    summary:
      "Translation can help users communicate across languages, but it is not emergency, legal, or medical interpretation.",
    answer: [
      "StayKnown can support language-aware chat flows where messages are translated based on sender and receiver language settings.",
      "Translation may be delayed, unavailable, or imperfect depending on provider, network, content, and language support.",
      "Do not rely on translation as legal, medical, official, or emergency interpretation.",
    ],
    links: [
      { label: "Acceptable Use", href: "/acceptable-use" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
    tags: ["translation", "language", "chat", "deepl", "messages"],
  },
  {
    id: "stickers-media",
    category: "Chat",
    title: "What can I send in chat?",
    summary:
      "Chat may support text, voice notes, media, stickers, stories, and expressive content where allowed.",
    answer: [
      "You may only send content you have the right to use and that follows StayKnown safety rules.",
      "Do not send threats, harassment, private content without permission, illegal media, stolen files, exploitative content, or abusive stickers.",
      "Some media and sticker features may be plan-gated or limited for safety and performance.",
    ],
    links: [
      { label: "Acceptable Use", href: "/acceptable-use" },
      { label: "Safety & Anti-Stalking", href: "/safety" },
    ],
    tags: ["stickers", "media", "voice notes", "stories", "files", "chat"],
  },
  {
    id: "plans",
    category: "Plans & billing",
    title: "What is the difference between Starter, Pro, and Pro Max?",
    summary:
      "Plans unlock different safety, chat, story, manual capture, profile, and premium features.",
    answer: [
      "Starter gives basic access where available, with lower limits and more feature gates.",
      "Pro unlocks more advanced safety and communication features.",
      "Pro Max is the highest tier and may include the strongest premium experiences, higher limits, and advanced personalization.",
      "Specific features can change over time and may depend on region, app version, payment state, device, and safety requirements.",
    ],
    links: [
      { label: "Billing & Refunds", href: "/billing-policy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Submit a request", href: "/submit-request" },
    ],
    tags: ["starter", "pro", "pro max", "plans", "billing", "subscription"],
  },
  {
    id: "payment-failed",
    category: "Plans & billing",
    title: "What happens if payment fails?",
    summary:
      "Your plan may not activate, may downgrade, or may require payment update depending on billing rules.",
    answer: [
      "If payment fails, StayKnown may keep your account active but remove paid access until payment is resolved.",
      "Some features may become unavailable after expiry or downgrade.",
      "Check your payment provider, app store, bank, card, Paystack flow, or receipt details before submitting a support request.",
    ],
    links: [
      { label: "Billing & Refunds", href: "/billing-policy" },
      { label: "Submit a request", href: "/submit-request" },
    ],
    tags: ["payment", "failed", "billing", "subscription", "paystack"],
  },
  {
    id: "wallet-coins",
    category: "Plans & billing",
    title: "How do wallet, coins, and withdrawals work?",
    summary:
      "Wallet features may separate coins from withdrawable balance and may require safety and payment checks.",
    answer: [
      "Coins may be used for supported in-app actions, while withdrawable balance may follow separate rules.",
      "Withdrawals may require account checks, minimum balance, provider availability, and fraud prevention.",
      "Do not use wallet, coins, receipts, or withdrawals for fraud, scams, laundering, chargeback abuse, or illegal activity.",
    ],
    links: [
      { label: "Billing & Refunds", href: "/billing-policy" },
      { label: "Security Disclosure", href: "/security" },
    ],
    tags: ["wallet", "coins", "withdraw", "balance", "payments"],
  },
  {
    id: "privacy-location",
    category: "Privacy & safety",
    title: "Does StayKnown sell my location data?",
    summary:
      "StayKnown is a safety-first service and should not sell personal data.",
    answer: [
      "StayKnown’s privacy posture is built around safety, approved contacts, service operation, abuse prevention, legal compliance, and user protection.",
      "Location is sensitive and should be processed only for supported safety features, account history, legal needs, abuse review, or service operation as described in policy.",
      "Always review the Privacy Policy and Location & Live Safety page for the current legal language.",
    ],
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Location & Live Safety", href: "/location-safety" },
      { label: "Data Retention", href: "/retention" },
    ],
    tags: ["privacy", "location", "sell data", "data", "tracking"],
  },
  {
    id: "anti-stalking",
    category: "Privacy & safety",
    title: "What if someone uses StayKnown to stalk or harass me?",
    summary:
      "Report misuse immediately. StayKnown is not for stalking, harassment, coercion, or hidden monitoring.",
    answer: [
      "StayKnown must not be used for stalking, harassment, intimidation, coercion, false emergencies, hidden tracking, impersonation, or retaliation.",
      "Use the Abuse Reporting page if someone is misusing contact requests, map links, SOS, chat, media, stories, or alerts.",
      "If you are in immediate danger, contact official emergency services or trusted local help first.",
    ],
    links: [
      { label: "Abuse Reporting", href: "/abuse" },
      { label: "Safety & Anti-Stalking", href: "/safety" },
      { label: "Emergency Disclaimer", href: "/emergency" },
    ],
    tags: ["stalking", "harassment", "abuse", "report", "safety"],
  },
  {
    id: "minor-use",
    category: "Privacy & safety",
    title: "Can minors use StayKnown?",
    summary:
      "Minor use requires strict safety rules, guardian involvement, and legal compliance.",
    answer: [
      "Under 13 users are not permitted to create an account or use StayKnown.",
      "Teen use may require parent or legal guardian permission and supervision depending on age, region, and law.",
      "StayKnown must never be used to exploit, groom, threaten, secretly monitor, or control a minor.",
    ],
    links: [
      { label: "Child Safety & Minor Use", href: "/minors" },
      { label: "Safety & Anti-Stalking", href: "/safety" },
    ],
    tags: ["minor", "child", "teen", "guardian", "school"],
  },
  {
    id: "notifications",
    category: "Troubleshooting",
    title: "Why are notifications or emails not arriving?",
    summary:
      "Delivery can depend on email providers, spam folders, push permission, device settings, and network conditions.",
    answer: [
      "Check spam, promotions, updates, or blocked sender folders for emails.",
      "Make sure push notification permission is enabled on your device.",
      "Check that the contact email is correct and that the contact has completed any required approval step.",
      "Network issues, provider delays, or device restrictions may delay alerts.",
    ],
    links: [
      { label: "Contact Approval & Consent", href: "/contact-consent" },
      { label: "Submit a request", href: "/submit-request" },
    ],
    tags: ["notifications", "email", "not arriving", "push", "spam"],
  },
  {
    id: "logo-broken",
    category: "Troubleshooting",
    title: "Why does the email logo look broken?",
    summary:
      "Email images need a full public HTTPS URL, not a local website path.",
    answer: [
      "Email clients cannot read local paths such as /6logo.png.",
      "The email template must use a full public URL such as https://stay-known.com/6logo.png.",
      "If that URL does not open directly in a browser after deployment, the logo file is not deployed correctly in the public folder.",
    ],
    links: [{ label: "Submit a request", href: "/submit-request" }],
    tags: ["email", "logo", "broken image", "vercel", "resend"],
  },
  {
    id: "account-security",
    category: "Account & security",
    title: "How do I keep my StayKnown account secure?",
    summary: "Protect your device, email, login access, and safety settings.",
    answer: [
      "Use a secure device lock and keep your email account protected.",
      "Do not share passwords, login links, OTPs, recovery access, or device access.",
      "Review contacts regularly and remove anyone who should no longer receive alerts.",
      "Report suspicious activity, unknown contact requests, or account access issues.",
    ],
    links: [
      { label: "Security Disclosure", href: "/security" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Submit a request", href: "/submit-request" },
    ],
    tags: ["account", "security", "login", "password", "device"],
  },
  {
    id: "delete-account",
    category: "Account & security",
    title: "Can I delete my account or data?",
    summary:
      "Deletion may be available, but some records can remain for safety, legal, billing, fraud, or abuse-prevention reasons.",
    answer: [
      "You may request deletion where applicable.",
      "Some records may need to be retained for law, safety review, abuse prevention, fraud prevention, payment records, disputes, support, or legal holds.",
      "Use the Privacy Policy and Data Retention page to understand what may remain and why.",
    ],
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Data Retention", href: "/retention" },
      { label: "Submit a request", href: "/submit-request" },
    ],
    tags: ["delete", "account", "data", "privacy", "retention"],
  },
];

const categories = [
  "All",
  "Getting started",
  "Visits & LIVE",
  "SOS & emergency",
  "Contacts",
  "Chat",
  "Plans & billing",
  "Privacy & safety",
  "Troubleshooting",
  "Account & security",
];

function useSeoMeta() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    document.title =
      "StayKnown Help Center | Safety, SOS, Live Location, Contacts, Chat, Billing & Account Help";

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
      "Search the StayKnown Help Center for answers about safety setup, Visit sessions, LIVE location, SOS, manual capture, approved contacts, chat, translation, stickers, billing, wallet, privacy, security, and troubleshooting.",
    );
    upsertMeta(
      "keywords",
      "StayKnown help center, StayKnown support, SOS help, live location help, approved contacts help, safety app FAQ, StayKnown billing help, StayKnown chat help, StayKnown account help, StayKnown troubleshooting",
    );
    upsertMeta("robots", "index, follow");
    upsertMeta("author", "6 Clement Joshua");

    upsertProperty("og:title", "StayKnown Help Center");
    upsertProperty(
      "og:description",
      "Self-service answers for StayKnown safety, SOS, visits, contacts, chat, billing, wallet, privacy, account, and troubleshooting.",
    );
    upsertProperty("og:type", "website");
    upsertProperty("og:site_name", "StayKnown");
  }, []);
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M10.7 18.2a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15ZM16.2 16.2 21 21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
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

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M8.2 5.8 14.4 12l-6.2 6.2"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 3.6 13.8 9l5.6 1.8-5.6 1.8L12 18l-1.8-5.4-5.6-1.8L10.2 9 12 3.6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
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

function StillNeedHelp({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.035] shadow-sm",
        compact ? "p-4" : "p-5 md:p-6",
      )}
    >
      <div className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-white/[0.055] blur-3xl" />

      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/85">
            <ShieldIcon className="h-5 w-5" />
          </span>
          <div>
            <div className="text-[14px] font-black text-white/92">
              Still need help?
            </div>
            <div className="text-[12px] font-semibold text-white/42">
              Send a clear request after checking the answers.
            </div>
          </div>
        </div>

        <p className="mt-4 text-[13px] font-semibold leading-relaxed text-white/58">
          If the Help Center did not solve it, submit a support request with
          your account email, device, app version, exact feature, and what
          happened.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href="/submit-request"
            className="rounded-full border border-white/15 bg-white px-4 py-2 text-[12px] font-black text-black transition hover:-translate-y-0.5 hover:bg-white/90"
          >
            Submit request
          </a>
          <a
            href="/submit-feature"
            className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-[12px] font-black text-white/72 transition hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.075] hover:text-white"
          >
            Suggest feature
          </a>
        </div>
      </div>
    </div>
  );
}

export default function HelpCenterPage() {
  useSeoMeta();

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [openId, setOpenId] = useState<string>("getting-started");

  const filteredArticles = useMemo(() => {
    const q = query.trim().toLowerCase();

    return articles.filter((article) => {
      const categoryMatches =
        activeCategory === "All" || article.category === activeCategory;

      if (!categoryMatches) return false;
      if (!q) return true;

      const haystack = [
        article.title,
        article.summary,
        article.category,
        article.answer.join(" "),
        article.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [activeCategory, query]);

  const featured = articles.slice(0, 6);

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

        @keyframes helpRise {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.99);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes softGlow {
          0%,
          100% {
            opacity: 0.45;
            transform: scale(1);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.05);
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
            transition-duration: 0.001ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <header className="relative z-10 pt-7">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4">
          <div className="flex flex-col items-center gap-2">
            <Image
              src="/6logo.png"
              alt="StayKnown"
              width={40}
              height={40}
              priority
              className="rounded-full bg-white object-contain p-0.5"
            />
            <div className="text-[12px] font-extrabold tracking-[0.28em] text-white">
              STAYKNOWN
            </div>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-8 md:pt-12">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/60 backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(255,255,255,0.105),transparent_32%),radial-gradient(circle_at_80%_12%,rgba(255,255,255,0.045),transparent_26%)]" />

          <div className="relative px-5 py-8 md:px-8 md:py-10">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/52">
                <SparkIcon className="h-4 w-4" />
                Self-service safety help
              </div>

              <h1 className="mt-5 text-[34px] font-black tracking-[-0.05em] text-white md:text-[58px] md:leading-[1.02]">
                StayKnown Help Center
              </h1>

              <p className="mx-auto mt-5 max-w-3xl text-[14px] font-semibold leading-relaxed text-white/60 md:text-[15px]">
                Search answers about Visits, LIVE sharing, SOS, Manual Capture,
                approved contacts, chat, translation, stickers, stories,
                billing, wallet, privacy, security, and troubleshooting before
                contacting support.
              </p>

              <div className="mx-auto mt-7 max-w-2xl">
                <div className="relative">
                  <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/36" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search: SOS, live map, contact approval, payment, VPN, chat..."
                    className="w-full rounded-[1.45rem] border border-white/10 bg-black/45 py-4 pl-12 pr-4 text-[14px] font-bold text-white outline-none shadow-sm transition placeholder:text-white/28 hover:border-white/16 hover:bg-black/55 focus:border-white/24 focus:bg-black/65 focus:ring-4 focus:ring-white/[0.045]"
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setActiveCategory(category);
                      setOpenId("");
                    }}
                    className={cx(
                      "rounded-full border px-3.5 py-2 text-[11.5px] font-black transition",
                      activeCategory === category
                        ? "border-white/20 bg-white text-black"
                        : "border-white/10 bg-white/[0.04] text-white/50 hover:border-white/18 hover:bg-white/[0.07] hover:text-white",
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {featured.map((article, index) => (
                <button
                  key={article.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(article.category);
                    setOpenId(article.id);
                    setQuery("");
                    window.setTimeout(() => {
                      document
                        .getElementById("answers")
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                    }, 80);
                  }}
                  className="group animate-[helpRise_0.55s_ease_both] rounded-[1.55rem] border border-white/10 bg-white/[0.032] p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-white/18 hover:bg-white/[0.06]"
                  style={{ animationDelay: `${index * 65}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-[0.14em] text-white/34">
                        {article.category}
                      </div>
                      <div className="mt-2 text-[15px] font-black text-white/92">
                        {article.title}
                      </div>
                    </div>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.045] text-white/36 transition group-hover:translate-x-0.5 group-hover:text-white">
                      <ArrowIcon className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="mt-3 text-[13px] font-semibold leading-relaxed text-white/50">
                    {article.summary}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div id="answers" className="grid gap-6 pt-8 lg:grid-cols-[1fr_320px]">
          <section className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-[12px] font-black uppercase tracking-[0.18em] text-white/35">
                  Answers
                </div>
                <h2 className="mt-1 text-[24px] font-black tracking-[-0.035em] text-white">
                  {activeCategory === "All"
                    ? "All help topics"
                    : activeCategory}
                </h2>
              </div>

              <div className="text-[12px] font-bold text-white/38">
                {filteredArticles.length} result
                {filteredArticles.length === 1 ? "" : "s"}
              </div>
            </div>

            {filteredArticles.length === 0 ? (
              <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-6">
                <div className="text-[16px] font-black text-white/90">
                  No matching result
                </div>
                <p className="mt-2 text-[13px] font-semibold leading-relaxed text-white/54">
                  Try searching for words like SOS, Visit, contact, map,
                  payment, VPN, chat, sticker, privacy, or account.
                </p>
                <div className="mt-5">
                  <StillNeedHelp compact />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredArticles.map((article, index) => {
                  const isOpen = openId === article.id;

                  return (
                    <article
                      key={article.id}
                      className="animate-[helpRise_0.45s_ease_both] overflow-hidden rounded-[1.55rem] border border-white/10 bg-white/[0.032] shadow-sm transition hover:border-white/16"
                      style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenId(isOpen ? "" : article.id)}
                        className="flex w-full items-start justify-between gap-4 p-5 text-left"
                      >
                        <span>
                          <span className="text-[11px] font-black uppercase tracking-[0.14em] text-white/34">
                            {article.category}
                          </span>
                          <span className="mt-1 block text-[16px] font-black text-white/92">
                            {article.title}
                          </span>
                          <span className="mt-2 block text-[13px] font-semibold leading-relaxed text-white/50">
                            {article.summary}
                          </span>
                        </span>

                        <span
                          className={cx(
                            "mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/40 transition",
                            isOpen && "rotate-90 bg-white text-black",
                          )}
                        >
                          <ArrowIcon className="h-4 w-4" />
                        </span>
                      </button>

                      {isOpen ? (
                        <div className="border-t border-white/10 px-5 pb-5 pt-4">
                          <div className="space-y-3">
                            {article.answer.map((line, i) => (
                              <p
                                key={`${article.id}-line-${i}`}
                                className="text-[13.5px] font-semibold leading-relaxed text-white/60"
                              >
                                {line}
                              </p>
                            ))}
                          </div>

                          {article.links?.length ? (
                            <div className="mt-5 flex flex-wrap gap-2">
                              {article.links.map((link) => (
                                <a
                                  key={link.href}
                                  href={link.href}
                                  className="rounded-full border border-white/10 bg-white/[0.045] px-3.5 py-2 text-[12px] font-black text-white/60 transition hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.075] hover:text-white"
                                >
                                  {link.label}
                                </a>
                              ))}
                            </div>
                          ) : null}

                          <div className="mt-5">
                            <StillNeedHelp compact />
                          </div>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <StillNeedHelp />

            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5">
              <div className="text-[14px] font-black text-white/90">
                Emergency reminder
              </div>
              <p className="mt-3 text-[13px] font-semibold leading-relaxed text-white/55">
                StayKnown is not police, ambulance, fire service, emergency
                dispatch, rescue service, hospital, road safety, or official
                government response. If immediate danger exists, contact local
                emergency services or proper local authority first.
              </p>
              <a
                href="/emergency"
                className="mt-4 inline-flex rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-[12px] font-black text-white/60 transition hover:border-white/18 hover:bg-white/[0.075] hover:text-white"
              >
                Read emergency limits
              </a>
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5">
              <div className="text-[14px] font-black text-white/90">
                Fast policy links
              </div>
              <div className="mt-4 grid gap-2">
                {[
                  ["Terms", "/terms"],
                  ["Privacy", "/privacy"],
                  ["Location & Live Safety", "/location-safety"],
                  ["Contact Consent", "/contact-consent"],
                  ["Acceptable Use", "/acceptable-use"],
                  ["Safety & Anti-Stalking", "/safety"],
                  ["Billing & Refunds", "/billing-policy"],
                ].map(([label, href]) => (
                  <a
                    key={href}
                    href={href}
                    className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-[12.5px] font-black text-white/55 transition hover:border-white/18 hover:bg-white/[0.065] hover:text-white"
                  >
                    {label}
                    <ArrowIcon className="h-4 w-4 text-white/30 transition group-hover:translate-x-0.5 group-hover:text-white" />
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div className="mx-auto mt-12 h-px max-w-3xl bg-white/10" />

        <footer className="mx-auto mt-7 max-w-4xl text-center">
          <div className="mx-auto rounded-[1.6rem] border border-white/10 bg-black/35 px-5 py-6">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] font-black uppercase tracking-[0.12em] text-white/35">
              <a href="/privacy" className="transition hover:text-white">
                Privacy
              </a>
              <a href="/terms" className="transition hover:text-white">
                Terms
              </a>
              <a href="/safety" className="transition hover:text-white">
                Safety
              </a>
              <a href="/acceptable-use" className="transition hover:text-white">
                Acceptable Use
              </a>
              <a href="/billing-policy" className="transition hover:text-white">
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

            <p className="mx-auto mt-3 max-w-2xl text-[11px] font-semibold leading-relaxed text-white/30">
              Help Center answers are provided for product guidance and do not
              replace official emergency services, legal advice, medical advice,
              police, ambulance, fire service, rescue service, or government
              authority.
            </p>
          </div>
        </footer>
      </section>
    </main>
  );
}
