"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

const UPDATED_AT = "2026-05-01";

type HelpArticle = {
  id: string;
  category: string;
  title: string;
  summary: string;
  answer: string[];
  links?: { label: string; href: string }[];
  tags: string[];
  audience?: string[];
};

type CategoryCard = {
  name: string;
  title: string;
  body: string;
  icon:
    | "shield"
    | "pin"
    | "alert"
    | "users"
    | "chat"
    | "card"
    | "lock"
    | "tool"
    | "user";
};

const articles: HelpArticle[] = [
  {
    id: "getting-started",
    category: "Getting started",
    title: "How do I start using StayKnown safely?",
    summary:
      "Set up your account, profile, permissions, approved contacts, and safety basics before relying on Visits, LIVE, chat, Manual Capture, or SOS.",
    answer: [
      "Create your account with accurate personal details so trusted contacts can recognize you during safety moments.",
      "Allow required permissions, especially location and notifications. Visit, LIVE, SOS, Manual Capture, and chat map flows depend on reliable device access.",
      "Add trusted contacts and wait for approval where approval is required. StayKnown is built around known, trusted, consent-aware safety relationships.",
      "Add a Safety Gallery image where required so approved contacts can recognize you during safety communication.",
      "Review the safety rules before using LIVE sharing, SOS, chat, stories, stickers, or location features.",
    ],
    links: [
      { label: "Contact Approval & Consent", href: "/contact-consent" },
      { label: "Safety & Anti-Stalking", href: "/safety" },
      { label: "Trust & Safety", href: "/trust-safety" },
    ],
    tags: [
      "setup",
      "account",
      "permissions",
      "contacts",
      "start",
      "profile",
      "gallery",
    ],
    audience: ["users", "parents", "contacts"],
  },
  {
    id: "permissions",
    category: "Getting started",
    title: "Which permissions does StayKnown need?",
    summary:
      "Location, notification, camera, photo, microphone, and device permissions may be needed depending on the feature.",
    answer: [
      "Location permission supports Visits, LIVE sharing, SOS, Manual Capture, chat map context, and safety history.",
      "Notification permission helps you receive contact approvals, chat alerts, safety updates, support messages, and account notices.",
      "Camera and photo access may be used for profile images, Safety Gallery, chat media, stories, or stickers.",
      "Microphone permission may be used for voice notes or voice stickers where available.",
      "If a permission is denied, the related feature may not work until you enable it again in device settings.",
    ],
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Location & Live Safety", href: "/location-safety" },
    ],
    tags: [
      "permission",
      "location",
      "notification",
      "camera",
      "photo",
      "microphone",
      "device",
    ],
    audience: ["users"],
  },
  {
    id: "safety-gallery",
    category: "Getting started",
    title: "Why does StayKnown ask for a Safety Gallery image?",
    summary:
      "Safety Gallery helps approved contacts recognize the user in safety moments and contact-related flows.",
    answer: [
      "A Safety Gallery image can help approved contacts confirm who they are supporting during Visits, SOS alerts, live map sessions, and safety communication.",
      "For some Pro or Pro Max safety setup flows, StayKnown may require at least one safety image before setup is complete.",
      "Use a clear and appropriate image. Do not upload fake, misleading, stolen, abusive, or impersonation-based images.",
    ],
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Safety & Anti-Stalking", href: "/safety" },
    ],
    tags: [
      "safety gallery",
      "photo",
      "image",
      "profile",
      "identity",
      "recognition",
    ],
    audience: ["users", "contacts"],
  },
  {
    id: "start-visit",
    category: "Visits & LIVE",
    title: "What is a Visit and when should I start one?",
    summary:
      "A Visit is the main safety session that tells StayKnown you are actively moving, visiting, meeting, or entering a safety-relevant situation.",
    answer: [
      "Start a Visit before a safety-relevant movement, meeting, trip, visit, ride, work stop, school stop, or situation where trusted people may need context.",
      "A Visit can support destination context, LIVE sharing, safety history, SOS readiness, and Manual Capture where available.",
      "A Visit should reflect a real safety use. Do not start fake Visits for pranks, pressure, manipulation, harassment, or misleading records.",
      "If you are already in immediate danger, contact local emergency services or trusted local help first.",
    ],
    links: [
      { label: "Location & Live Safety", href: "/location-safety" },
      { label: "Emergency Disclaimer", href: "/emergency" },
    ],
    tags: [
      "visit",
      "start visit",
      "live",
      "destination",
      "tracking",
      "trip",
      "meeting",
    ],
    audience: ["users", "contacts"],
  },
  {
    id: "end-visit",
    category: "Visits & LIVE",
    title: "Why does ending a Visit need confirmation?",
    summary:
      "Ending a Visit may require confirmation so active safety sharing is not stopped by mistake.",
    answer: [
      "A confirmation step helps prevent accidental taps from ending safety tracking too early.",
      "It also helps users understand that LIVE context, Manual Capture availability, and Visit-related safety awareness may stop after the Visit ends.",
      "Only end a Visit when the safety moment is truly complete and you are comfortable stopping the active session.",
    ],
    links: [
      { label: "Location & Live Safety", href: "/location-safety" },
      { label: "Data Retention", href: "/retention" },
    ],
    tags: ["end visit", "stop visit", "confirmation", "live", "tracking"],
    audience: ["users"],
  },
  {
    id: "live-map-approved",
    category: "Visits & LIVE",
    title: "Who can see my live map?",
    summary:
      "Live map access should only flow through permitted safety paths and approved trusted-contact relationships.",
    answer: [
      "Approved contacts may receive access to map context through supported StayKnown safety flows such as active Visit, SOS, Manual Capture, or approved-contact chat map.",
      "StayKnown is not built for public tracking. Map access is intended for trusted, consent-aware safety relationships.",
      "Anyone receiving a link or alert must use it responsibly and must not share it unnecessarily.",
      "If a map link is misused, report it through Abuse Reporting or submit a support request.",
    ],
    links: [
      { label: "Location & Live Safety", href: "/location-safety" },
      { label: "Data Retention", href: "/retention" },
      { label: "Abuse Reporting", href: "/abuse" },
    ],
    tags: [
      "live map",
      "approved contacts",
      "location",
      "privacy",
      "map",
      "who can see",
    ],
    audience: ["users", "contacts", "visitors"],
  },
  {
    id: "map-accuracy",
    category: "Visits & LIVE",
    title: "Why can the map or address be slightly wrong?",
    summary:
      "Location accuracy depends on GPS, network, device permissions, battery mode, buildings, movement, provider data, and VPN state.",
    answer: [
      "GPS and network signals can be weaker indoors, near tall buildings, underground, in rural areas, or during poor connectivity.",
      "The readable place label can be delayed or approximate because it depends on reverse geocoding providers and map data.",
      "VPN or device-integrity issues can reduce location confidence and may trigger safety gates.",
      "Use StayKnown as a safety-awareness tool, not as a guarantee of exact coordinates or official emergency dispatch.",
    ],
    links: [
      { label: "Location & Live Safety", href: "/location-safety" },
      { label: "Emergency Disclaimer", href: "/emergency" },
    ],
    tags: [
      "map",
      "accuracy",
      "gps",
      "address",
      "place label",
      "wrong location",
      "reverse geocoding",
    ],
    audience: ["users", "contacts", "visitors"],
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
      "SOS alerts and related records may be reviewed if misuse, abuse, fraud, or legal concern is reported.",
    ],
    links: [
      { label: "Emergency Disclaimer", href: "/emergency" },
      { label: "Safety & Anti-Stalking", href: "/safety" },
      { label: "Abuse Reporting", href: "/abuse" },
    ],
    tags: ["sos", "emergency", "urgent", "help", "danger", "panic", "alert"],
    audience: ["users", "contacts", "law"],
  },
  {
    id: "end-sos",
    category: "SOS & emergency",
    title: "Why does ending SOS require verification?",
    summary:
      "Verified stopping protects users from accidental or unsafe emergency cancellation.",
    answer: [
      "When SOS is active, StayKnown may require stronger confirmation before ending it so protection is not stopped by mistake.",
      "This helps prevent accidental taps, pressure from another person, or confusing emergency states.",
      "If SOS was triggered accidentally, end it only when you are sure it is safe and appropriate.",
      "If immediate danger still exists, do not rely only on the app. Contact proper local emergency services or trusted local help.",
    ],
    links: [
      { label: "Emergency Disclaimer", href: "/emergency" },
      { label: "Data Retention", href: "/retention" },
    ],
    tags: ["end sos", "verify", "stop sos", "confirmation", "cancel sos"],
    audience: ["users", "contacts"],
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
      "Manual Capture should not be used to spam contacts or create false safety events.",
      "If the button is locked or capped, your plan, Visit state, contact setup, or daily limit may be the reason.",
    ],
    links: [
      { label: "Location & Live Safety", href: "/location-safety" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Billing & Refunds", href: "/billing-policy" },
    ],
    tags: [
      "manual capture",
      "capture",
      "visit",
      "location",
      "limit",
      "daily limit",
    ],
    audience: ["users"],
  },
  {
    id: "emergency-limits",
    category: "SOS & emergency",
    title: "Does StayKnown call police, ambulance, or fire service?",
    summary:
      "StayKnown supports safety awareness but does not replace official emergency services.",
    answer: [
      "StayKnown is not police, ambulance, fire service, rescue service, hospital, road safety, civil defence, disaster management, government authority, or official emergency dispatch.",
      "The app may notify approved contacts or support safety awareness depending on the feature, plan, device, network, and configuration.",
      "If immediate danger exists, contact local emergency services or proper local authority first.",
    ],
    links: [
      { label: "Emergency Disclaimer", href: "/emergency" },
      { label: "Trust & Safety", href: "/trust-safety" },
    ],
    tags: [
      "police",
      "ambulance",
      "fire",
      "emergency services",
      "dispatch",
      "government",
    ],
    audience: ["users", "contacts", "visitors", "law"],
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
      "SOS responders may carry stronger responsibility, so consent and audit records matter.",
      "If someone declines or removes themselves, respect that decision.",
    ],
    links: [
      { label: "Contact Approval & Consent", href: "/contact-consent" },
      { label: "Safety & Anti-Stalking", href: "/safety" },
    ],
    tags: [
      "contact",
      "approval",
      "consent",
      "pending",
      "declined",
      "responder",
    ],
    audience: ["users", "contacts"],
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
      "Make sure the email address is correct and the message did not go to spam or promotions.",
      "Do not repeatedly pressure someone to accept a contact request.",
    ],
    links: [
      { label: "Contact Approval & Consent", href: "/contact-consent" },
      { label: "Submit a request", href: "/submit-request" },
    ],
    tags: ["pending", "contact", "email", "approval", "resend", "expired"],
    audience: ["users", "contacts"],
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
      "If you believe this is an error, submit a request with the account email, contact email, and what happened.",
    ],
    links: [
      { label: "Contact Approval & Consent", href: "/contact-consent" },
      { label: "Abuse Reporting", href: "/abuse" },
    ],
    tags: [
      "blocked",
      "add contact",
      "cannot add",
      "security setting",
      "declined",
    ],
    audience: ["users"],
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
      "Do not use chat to threaten, pressure, impersonate, exploit, stalk, or harass anyone.",
    ],
    links: [
      { label: "Acceptable Use", href: "/acceptable-use" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Safety & Anti-Stalking", href: "/safety" },
    ],
    tags: ["chat", "approved contacts", "messages", "thread", "communication"],
    audience: ["users", "contacts"],
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
      "If a translation fails, use the retry icon where available or ask the sender to clarify.",
    ],
    links: [
      { label: "Acceptable Use", href: "/acceptable-use" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
    tags: [
      "translation",
      "language",
      "chat",
      "deepl",
      "messages",
      "igbo",
      "hausa",
      "yoruba",
    ],
    audience: ["users"],
  },
  {
    id: "voice-notes",
    category: "Chat",
    title: "Why can’t I send a voice note?",
    summary:
      "Voice notes may depend on microphone permission, plan rules, duration limits, network, and chat eligibility.",
    answer: [
      "Check that microphone permission is enabled for StayKnown.",
      "Voice note duration may depend on your plan and current app rules.",
      "You must be in an eligible approved-contact chat flow.",
      "If upload fails, check your network and try again when the connection is stable.",
    ],
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Submit a request", href: "/submit-request" },
    ],
    tags: ["voice note", "microphone", "audio", "duration", "chat upload"],
    audience: ["users"],
  },
  {
    id: "stickers-media",
    category: "Chat",
    title: "What can I send in chat?",
    summary:
      "Chat may support text, voice notes, media, stickers, stories, files, and expressive content where allowed.",
    answer: [
      "You may only send content you have the right to use and that follows StayKnown safety rules.",
      "Do not send threats, harassment, private content without permission, illegal media, stolen files, exploitative content, or abusive stickers.",
      "Some media and sticker features may be plan-gated or limited for safety and performance.",
      "Music stickers or media must only use content you own, are licensed to use, or are allowed to share.",
    ],
    links: [
      { label: "Acceptable Use", href: "/acceptable-use" },
      { label: "Safety & Anti-Stalking", href: "/safety" },
    ],
    tags: [
      "stickers",
      "media",
      "voice notes",
      "stories",
      "files",
      "chat",
      "music",
      "video sticker",
    ],
    audience: ["users"],
  },
  {
    id: "stories-profile",
    category: "Chat",
    title: "How do stories and profiles support trust?",
    summary:
      "Profiles, names, avatars, and stories help people recognize who they are connecting with.",
    answer: [
      "StayKnown uses profile surfaces to help approved contacts recognize the people they communicate with.",
      "Stories and profile details must not be used for impersonation, harassment, threats, exploitation, or misleading identity.",
      "If a profile or story looks abusive or fake, report it or submit a support request.",
    ],
    links: [
      { label: "Safety & Anti-Stalking", href: "/safety" },
      { label: "Abuse Reporting", href: "/abuse" },
    ],
    tags: ["stories", "profile", "avatar", "identity", "trust", "recognize"],
    audience: ["users", "contacts"],
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
    tags: [
      "starter",
      "pro",
      "pro max",
      "plans",
      "billing",
      "subscription",
      "upgrade",
    ],
    audience: ["users"],
  },
  {
    id: "subscription-not-active",
    category: "Plans & billing",
    title: "Why did my subscription not activate?",
    summary:
      "A subscription may not activate if payment failed, verification is delayed, app store state is pending, or account matching failed.",
    answer: [
      "Check that the payment completed successfully and that you are signed into the correct StayKnown account.",
      "Activation may require payment verification from the provider or app store.",
      "If your plan does not update after a reasonable wait, submit a request with your account email, receipt reference, payment date, and device.",
      "Do not send full card numbers, OTPs, passwords, or private bank credentials.",
    ],
    links: [
      { label: "Billing & Refunds", href: "/billing-policy" },
      { label: "Submit a request", href: "/submit-request" },
    ],
    tags: [
      "subscription",
      "not active",
      "activation",
      "receipt",
      "upgrade",
      "paystack",
      "app store",
    ],
    audience: ["users"],
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
      "Payment abuse, chargeback fraud, receipt tampering, or wallet misuse may lead to restriction or review.",
    ],
    links: [
      { label: "Billing & Refunds", href: "/billing-policy" },
      { label: "Submit a request", href: "/submit-request" },
    ],
    tags: [
      "payment",
      "failed",
      "billing",
      "subscription",
      "paystack",
      "declined",
      "card",
    ],
    audience: ["users"],
  },
  {
    id: "cancel-subscription",
    category: "Plans & billing",
    title: "How do I cancel Pro or Pro Max?",
    summary:
      "Cancellation depends on where you purchased the subscription and the billing provider used.",
    answer: [
      "If you subscribed through an app store, cancellation may need to be handled inside that store’s subscription settings.",
      "If you paid through a web or payment-provider flow, follow the cancellation or support instructions shown in the app or billing policy.",
      "Canceling may stop renewal but does not always create an automatic refund.",
      "Your paid access may remain until the end of the active billing period depending on the rules that apply.",
    ],
    links: [
      { label: "Billing & Refunds", href: "/billing-policy" },
      { label: "Submit a request", href: "/submit-request" },
    ],
    tags: ["cancel", "subscription", "pro", "pro max", "renewal", "refund"],
    audience: ["users"],
  },
  {
    id: "refund",
    category: "Plans & billing",
    title: "Can I get a refund?",
    summary:
      "Refunds depend on payment provider rules, app store rules, region, timing, usage, and policy eligibility.",
    answer: [
      "Refund eligibility is not automatic and may depend on the billing route, timing, account status, usage, fraud checks, and applicable law.",
      "If you purchased through an app store, that store may control refund review.",
      "If you contact StayKnown, include your account email, receipt reference, payment date, plan, and issue summary.",
      "Do not include full card numbers, bank passwords, OTPs, or private credentials.",
    ],
    links: [
      { label: "Billing & Refunds", href: "/billing-policy" },
      { label: "Submit a request", href: "/submit-request" },
    ],
    tags: ["refund", "money back", "billing", "receipt", "subscription"],
    audience: ["users"],
  },
  {
    id: "wallet-coins",
    category: "Plans & billing",
    title: "How do wallet, coins, and withdrawals work?",
    summary:
      "Wallet features may separate coins from withdrawable balance and may require safety and payment checks.",
    answer: [
      "Coins may be used for supported in-app actions, while withdrawable balance may follow separate rules.",
      "Withdrawals may require account checks, minimum balance, provider availability, fraud review, and payment compliance.",
      "Coin balance and withdrawable balance are not always the same thing.",
      "Do not use wallet, coins, receipts, or withdrawals for fraud, scams, laundering, chargeback abuse, or illegal activity.",
    ],
    links: [
      { label: "Billing & Refunds", href: "/billing-policy" },
      { label: "Security Disclosure", href: "/security" },
    ],
    tags: [
      "wallet",
      "coins",
      "withdraw",
      "balance",
      "payments",
      "coin balance",
    ],
    audience: ["users"],
  },
  {
    id: "privacy-location",
    category: "Privacy & safety",
    title: "Does StayKnown sell my location data?",
    summary:
      "StayKnown is a safety-first service and should not sell personal location data.",
    answer: [
      "StayKnown’s privacy posture is built around safety, approved contacts, service operation, abuse prevention, legal compliance, and user protection.",
      "Location is sensitive and should be processed only for supported safety features, account history, legal needs, abuse review, or service operation as described in policy.",
      "StayKnown is not a covert surveillance service and should not be used for hidden tracking.",
      "Always review the Privacy Policy and Location & Live Safety page for the current legal language.",
    ],
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Location & Live Safety", href: "/location-safety" },
      { label: "Data Retention", href: "/retention" },
    ],
    tags: [
      "privacy",
      "location",
      "sell data",
      "data",
      "tracking",
      "surveillance",
    ],
    audience: ["users", "contacts", "visitors"],
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
      "StayKnown may preserve relevant records, restrict features, suspend accounts, or cooperate with lawful requests where appropriate.",
    ],
    links: [
      { label: "Abuse Reporting", href: "/abuse" },
      { label: "Safety & Anti-Stalking", href: "/safety" },
      { label: "Emergency Disclaimer", href: "/emergency" },
    ],
    tags: [
      "stalking",
      "harassment",
      "abuse",
      "report",
      "safety",
      "coercion",
      "hidden tracking",
    ],
    audience: ["users", "contacts", "law"],
  },
  {
    id: "data-retention",
    category: "Privacy & safety",
    title: "Why can some records remain after deletion?",
    summary:
      "Some data may need to remain for safety, legal, billing, fraud, abuse-prevention, or dispute reasons.",
    answer: [
      "Deletion does not always remove every record immediately if safety, legal, fraud, billing, abuse review, dispute, backup, or compliance reasons apply.",
      "SOS events, abuse reports, payment records, security logs, and support records may have different retention rules.",
      "Review the Privacy Policy and Data Retention page for the current policy language.",
    ],
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Data Retention", href: "/retention" },
    ],
    tags: [
      "data retention",
      "delete",
      "records",
      "privacy",
      "legal hold",
      "backup",
    ],
    audience: ["users", "law"],
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
      "Schools, families, and organizations must use StayKnown lawfully, transparently, and with appropriate consent.",
    ],
    links: [
      { label: "Child Safety & Minor Use", href: "/minors" },
      { label: "Safety & Anti-Stalking", href: "/safety" },
    ],
    tags: [
      "minor",
      "child",
      "teen",
      "guardian",
      "school",
      "parent",
      "under 13",
    ],
    audience: ["parents", "users", "visitors"],
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
      "Network issues, provider delays, app store restrictions, or device battery settings may delay alerts.",
    ],
    links: [
      { label: "Contact Approval & Consent", href: "/contact-consent" },
      { label: "Submit a request", href: "/submit-request" },
    ],
    tags: ["notifications", "email", "not arriving", "push", "spam", "alerts"],
    audience: ["users", "contacts"],
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
    tags: [
      "location",
      "gps",
      "not updating",
      "vpn",
      "map",
      "troubleshooting",
      "battery",
    ],
    audience: ["users", "contacts"],
  },
  {
    id: "vpn-block",
    category: "Troubleshooting",
    title: "Why does StayKnown warn me about VPN?",
    summary:
      "VPN can interfere with safety reliability, location confidence, fraud prevention, and platform integrity.",
    answer: [
      "StayKnown may warn, restrict, or block certain flows when VPN is active because safety location should be as reliable as possible.",
      "If VPN is enabled before opening the app, you may see a safety gate.",
      "If VPN turns on during an active Visit, StayKnown may treat that as a safety reliability issue.",
      "Turn VPN off before using Visit, LIVE, SOS, chat location, or Manual Capture.",
    ],
    links: [
      { label: "Location & Live Safety", href: "/location-safety" },
      { label: "Security Disclosure", href: "/security" },
    ],
    tags: ["vpn", "blocked", "location", "safety gate", "security", "proxy"],
    audience: ["users"],
  },
  {
    id: "app-not-loading",
    category: "Troubleshooting",
    title: "What should I do if the app or website is not loading?",
    summary:
      "Loading issues can come from network, browser cache, app version, device state, service outage, or permissions.",
    answer: [
      "Check your internet connection and reload the app or website.",
      "Update the app to the latest version where available.",
      "Restart your device if the app is stuck.",
      "For website issues, clear browser cache or try another browser.",
      "If a safety feature is failing during danger, contact trusted people or local emergency services directly.",
    ],
    links: [
      { label: "Submit a request", href: "/submit-request" },
      { label: "Security Disclosure", href: "/security" },
    ],
    tags: [
      "not loading",
      "website",
      "app",
      "crash",
      "cache",
      "browser",
      "stuck",
    ],
    audience: ["users", "visitors"],
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
    tags: ["email", "logo", "broken image", "vercel", "resend", "image"],
    audience: ["admin", "users"],
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
    tags: [
      "account",
      "security",
      "login",
      "password",
      "device",
      "otp",
      "suspicious",
    ],
    audience: ["users"],
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
    tags: [
      "delete",
      "account",
      "data",
      "privacy",
      "retention",
      "remove account",
    ],
    audience: ["users"],
  },
  {
    id: "visitor-map-link",
    category: "Visitors & contacts",
    title: "I received a StayKnown map or safety link. What should I do?",
    summary:
      "Use the link only for the safety purpose it was sent for and do not share it unnecessarily.",
    answer: [
      "Open the link only if you are an intended trusted contact, visitor, or support person for that safety moment.",
      "Use the information responsibly and only to help the user stay safe.",
      "Do not post, forward, screenshot, sell, misuse, or share the link without a lawful and safety-based reason.",
      "If the link looks suspicious or abusive, report it or contact the person directly through a trusted channel.",
    ],
    links: [
      { label: "Location & Live Safety", href: "/location-safety" },
      { label: "Abuse Reporting", href: "/abuse" },
    ],
    tags: [
      "visitor",
      "map link",
      "live link",
      "contact",
      "received link",
      "share",
    ],
    audience: ["visitors", "contacts"],
  },
  {
    id: "law-enforcement",
    category: "Visitors & contacts",
    title:
      "How should law enforcement or emergency authorities contact StayKnown?",
    summary:
      "Official requests should use the law enforcement route and include valid authority, legal basis, and clear emergency context where applicable.",
    answer: [
      "StayKnown has a dedicated Law Enforcement Requests page for official requests, emergency disclosures, legal preservation, and valid process.",
      "Requests should identify the requesting authority, legal basis, user identifiers, time range, and emergency or investigation context.",
      "StayKnown may preserve or disclose information where required or permitted by law, policy, and valid process.",
      "Normal users should not use the law enforcement route for regular support issues.",
    ],
    links: [
      { label: "Law Enforcement Requests", href: "/law" },
      { label: "Data Retention", href: "/retention" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
    tags: [
      "law enforcement",
      "police",
      "legal request",
      "emergency disclosure",
      "authority",
      "records",
    ],
    audience: ["law", "visitors"],
  },
  {
    id: "business-use",
    category: "Visitors & contacts",
    title: "Can businesses, schools, churches, or organizations use StayKnown?",
    summary:
      "Organization use must be lawful, transparent, consent-aware, and should not become covert monitoring.",
    answer: [
      "Organizations should use StayKnown only with proper notice, role clarity, lawful basis, and consent where required.",
      "StayKnown should not be used for secret employee tracking, student monitoring, harassment, discipline abuse, or coercive control.",
      "Business or organization features may have separate rules, setup requirements, and safety responsibilities.",
      "If you need organization support, submit a request or contact StayKnown through the proper route.",
    ],
    links: [
      { label: "Trust & Safety", href: "/trust-safety" },
      { label: "Contact us", href: "/contact" },
      { label: "Submit a request", href: "/submit-request" },
    ],
    tags: [
      "business",
      "school",
      "church",
      "organization",
      "workplace",
      "consent",
      "enterprise",
    ],
    audience: ["visitors", "organizations"],
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
  "Visitors & contacts",
];

const categoryCards: CategoryCard[] = [
  {
    name: "Getting started",
    title: "Getting started",
    body: "Account setup, permissions, safety gallery, and first safety basics.",
    icon: "shield",
  },
  {
    name: "Visits & LIVE",
    title: "Visits & LIVE",
    body: "Start Visit, LIVE map, location accuracy, map labels, and ending a Visit.",
    icon: "pin",
  },
  {
    name: "SOS & emergency",
    title: "SOS & emergency",
    body: "SOS use, emergency limits, Manual Capture, and verified stopping.",
    icon: "alert",
  },
  {
    name: "Contacts",
    title: "Approved contacts",
    body: "Contact approvals, pending requests, declined contacts, and consent.",
    icon: "users",
  },
  {
    name: "Chat",
    title: "Chat & media",
    body: "Approved-contact chat, translation, voice notes, stickers, and stories.",
    icon: "chat",
  },
  {
    name: "Plans & billing",
    title: "Plans & billing",
    body: "Starter, Pro, Pro Max, subscription activation, refunds, wallet, and coins.",
    icon: "card",
  },
  {
    name: "Privacy & safety",
    title: "Privacy & safety",
    body: "Location privacy, anti-stalking, minors, retention, and abuse prevention.",
    icon: "lock",
  },
  {
    name: "Troubleshooting",
    title: "Troubleshooting",
    body: "Notifications, emails, VPN, map issues, app loading, and common fixes.",
    icon: "tool",
  },
  {
    name: "Account & security",
    title: "Account & security",
    body: "Login safety, device security, deletion, suspicious activity, and records.",
    icon: "user",
  },
];

const popularSearches = [
  "SOS",
  "live map",
  "contact approval",
  "payment failed",
  "subscription not active",
  "refund",
  "VPN",
  "location not updating",
  "voice note",
  "delete account",
  "law enforcement",
  "minor use",
];

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s@.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function articleSearchText(article: HelpArticle) {
  return normalizeText(
    [
      article.title,
      article.summary,
      article.category,
      article.answer.join(" "),
      article.tags.join(" "),
      article.audience?.join(" ") || "",
      article.links?.map((l) => l.label).join(" ") || "",
    ].join(" "),
  );
}

function getScore(article: HelpArticle, rawQuery: string) {
  const q = normalizeText(rawQuery);
  if (!q) return 1;

  const haystack = articleSearchText(article);
  const words = q.split(" ").filter(Boolean);
  let score = 0;

  if (normalizeText(article.title).includes(q)) score += 20;
  if (normalizeText(article.category).includes(q)) score += 14;
  if (normalizeText(article.summary).includes(q)) score += 10;
  if (article.tags.some((tag) => normalizeText(tag).includes(q))) score += 8;
  if (haystack.includes(q)) score += 6;

  for (const word of words) {
    if (normalizeText(article.title).includes(word)) score += 6;
    if (normalizeText(article.summary).includes(word)) score += 4;
    if (article.tags.some((tag) => normalizeText(tag).includes(word)))
      score += 4;
    if (haystack.includes(word)) score += 1;
  }

  return score;
}

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
      "Search the StayKnown Help Center for answers about safety setup, Visit sessions, LIVE location, SOS, manual capture, approved contacts, chat, translation, stickers, billing, wallet, privacy, security, visitors, law enforcement, and troubleshooting.",
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
      "Self-service answers for StayKnown safety, SOS, visits, contacts, chat, billing, wallet, privacy, account, visitor, law enforcement, and troubleshooting.",
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

function PinIcon({ className = "" }: { className?: string }) {
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

function UsersIcon({ className = "" }: { className?: string }) {
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

function ChatIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M5 5.4h14v9.2H9.4L5 18.7V5.4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M8.2 8.8h7.6M8.2 11.5h5.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CardIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M4.5 7.2h15v10.6h-15V7.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 10h15M7.2 15h4.4"
        stroke="currentColor"
        strokeWidth="1.7"
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

function ToolIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M14.7 5.1a4.3 4.3 0 0 0 4.2 5.6l-7.8 7.8a3 3 0 0 1-4.2-4.2l7.8-7.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M7.6 16.4h.01"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 11.4a3.8 3.8 0 1 0 0-7.6 3.8 3.8 0 0 0 0 7.6Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M5.5 20.2c.8-3.8 3.1-5.8 6.5-5.8s5.7 2 6.5 5.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CategoryIcon({ icon }: { icon: CategoryCard["icon"] }) {
  const cls = "h-5 w-5";
  if (icon === "pin") return <PinIcon className={cls} />;
  if (icon === "alert") return <AlertIcon className={cls} />;
  if (icon === "users") return <UsersIcon className={cls} />;
  if (icon === "chat") return <ChatIcon className={cls} />;
  if (icon === "card") return <CardIcon className={cls} />;
  if (icon === "lock") return <LockIcon className={cls} />;
  if (icon === "tool") return <ToolIcon className={cls} />;
  if (icon === "user") return <UserIcon className={cls} />;
  return <ShieldIcon className={cls} />;
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
          happened. Do not include passwords, OTPs, full card numbers, or
          private bank credentials.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href="/submit-request"
            className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-[12px] font-black text-white/72 transition hover:-translate-y-0.5 hover:border-white/18 hover:bg-white/[0.075] hover:text-white"
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

  const answersRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [openId, setOpenId] = useState<string>("getting-started");

  const searching = query.trim().length > 0;

  const filteredArticles = useMemo(() => {
    const q = query.trim();

    if (q) {
      return articles
        .map((article) => ({ article, score: getScore(article, q) }))
        .filter((item) => item.score > 0)
        .sort(
          (a, b) =>
            b.score - a.score || a.article.title.localeCompare(b.article.title),
        )
        .map((item) => item.article);
    }

    return articles.filter((article) => {
      return activeCategory === "All" || article.category === activeCategory;
    });
  }, [activeCategory, query]);

  useEffect(() => {
    if (!searching) return;
    if (!filteredArticles.length) {
      setOpenId("");
      return;
    }

    setOpenId(filteredArticles[0].id);
  }, [searching, filteredArticles]);

  function jumpToAnswers() {
    window.setTimeout(() => {
      answersRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 60);
  }

  function selectCategory(category: string) {
    setQuery("");
    setActiveCategory(category);
    const first =
      category === "All"
        ? articles[0]
        : articles.find((article) => article.category === category);

    setOpenId(first?.id || "");
    jumpToAnswers();
  }

  function searchFor(value: string) {
    setActiveCategory("All");
    setQuery(value);
    jumpToAnswers();
  }

  const resultTitle = searching
    ? `Search results for “${query.trim()}”`
    : activeCategory === "All"
      ? "All help topics"
      : activeCategory;

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
                billing, wallet, privacy, security, visitors, law requests, and
                troubleshooting before contacting support.
              </p>

              <div className="mx-auto mt-7 max-w-2xl">
                <div className="relative">
                  <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/36" />
                  <input
                    value={query}
                    onChange={(e) => {
                      setActiveCategory("All");
                      setQuery(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") jumpToAnswers();
                    }}
                    placeholder="Search: SOS, live map, contact approval, payment, VPN, chat, refund..."
                    className="w-full rounded-[1.45rem] border border-white/10 bg-black/45 py-4 pl-12 pr-24 text-[14px] font-bold text-white outline-none shadow-sm transition placeholder:text-white/28 hover:border-white/16 hover:bg-black/55 focus:border-white/24 focus:bg-black/65 focus:ring-4 focus:ring-white/[0.045]"
                  />

                  {query ? (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setOpenId(articles[0].id);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[11px] font-black text-white/55 transition hover:bg-white/[0.075] hover:text-white"
                    >
                      Clear
                    </button>
                  ) : null}
                </div>

                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => searchFor(term)}
                      className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[11px] font-black text-white/45 transition hover:border-white/18 hover:bg-white/[0.065] hover:text-white"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => selectCategory(category)}
                    className={cx(
                      "rounded-full border px-3.5 py-2 text-[11.5px] font-black transition",
                      !searching && activeCategory === category
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
              {categoryCards.map((card, index) => (
                <button
                  key={card.name}
                  type="button"
                  onClick={() => selectCategory(card.name)}
                  className="group animate-[helpRise_0.55s_ease_both] rounded-[1.55rem] border border-white/10 bg-white/[0.032] p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-white/18 hover:bg-white/[0.06]"
                  style={{ animationDelay: `${index * 55}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.045] text-white/80 transition group-hover:bg-white group-hover:text-black">
                      <CategoryIcon icon={card.icon} />
                    </span>

                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.045] text-white/36 transition group-hover:translate-x-0.5 group-hover:text-white">
                      <ArrowIcon className="h-4 w-4" />
                    </span>
                  </div>

                  <div className="mt-4 text-[15px] font-black text-white/92">
                    {card.title}
                  </div>
                  <p className="mt-2 text-[13px] font-semibold leading-relaxed text-white/50">
                    {card.body}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          ref={answersRef}
          id="answers"
          className="grid gap-6 pt-8 lg:grid-cols-[1fr_320px]"
        >
          <section className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-[12px] font-black uppercase tracking-[0.18em] text-white/35">
                  Answers
                </div>
                <h2 className="mt-1 text-[24px] font-black tracking-[-0.035em] text-white">
                  {resultTitle}
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
                  Try words like SOS, Visit, live map, contact, approval,
                  payment, refund, VPN, chat, sticker, privacy, law, visitor, or
                  account.
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
                          <span className="mt-3 flex flex-wrap gap-1.5">
                            {article.tags.slice(0, 5).map((tag) => (
                              <span
                                key={`${article.id}-${tag}`}
                                className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-white/32"
                              >
                                {tag}
                              </span>
                            ))}
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
                dispatch, rescue service, hospital, road safety, civil defence,
                or official government response. If immediate danger exists,
                contact local emergency services or proper local authority
                first.
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
                  ["Help Center", "/help-center"],
                  ["Trust & Safety", "/trust-safety"],
                  ["Terms", "/terms"],
                  ["Privacy", "/privacy"],
                  ["Location & Live Safety", "/location-safety"],
                  ["Contact Consent", "/contact-consent"],
                  ["Acceptable Use", "/acceptable-use"],
                  ["Safety & Anti-Stalking", "/safety"],
                  ["Emergency Disclaimer", "/emergency"],
                  ["Child Safety & Minor Use", "/minors"],
                  ["Abuse Reporting", "/abuse"],
                  ["Data Retention", "/retention"],
                  ["Law Enforcement Requests", "/law"],
                  ["Security Disclosure", "/security"],
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
              <a href="/help-center" className="transition hover:text-white">
                Help Center
              </a>
              <a href="/trust-safety" className="transition hover:text-white">
                Trust & Safety
              </a>
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
