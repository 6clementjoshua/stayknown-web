"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.stayknown.app";

export type AudienceKind = "students" | "travel" | "families";

type AudienceTone = "neutral" | "safe" | "sos";
type AudienceIcon =
  | "student"
  | "travel"
  | "family"
  | "contacts"
  | "visit"
  | "live"
  | "capture"
  | "safe"
  | "sos"
  | "guardian"
  | "verify"
  | "shield"
  | "lock"
  | "arrow"
  | "check"
  | "spark";

type Scenario = {
  id: string;
  number: string;
  label: string;
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  secondaryImage?: string;
  secondaryImageAlt?: string;
  icon: AudienceIcon;
  tone: AudienceTone;
  learnHref: string;
  userAction: string;
  trustedAction: string;
  boundary: string;
};

type AudienceConfig = {
  kind: AudienceKind;
  route: string;
  titleLabel: string;
  heroEyebrow: string;
  heroTitle: string;
  heroBody: string;
  orbitLabel: string;
  orbitIcon: AudienceIcon;
  heroImage: string;
  heroImageAlt: string;
  heroSecondaryImage: string;
  heroSecondaryImageAlt: string;
  introTitle: string;
  introBody: string;
  contextLabels: readonly string[];
  scenarios: readonly Scenario[];
  principles: readonly {
    title: string;
    body: string;
    icon: AudienceIcon;
    tone: AudienceTone;
  }[];
  boundaryTitle: string;
  boundaryBody: string;
  boundaryPoints: readonly string[];
  finalTitle: string;
  finalBody: string;
  related: readonly {
    label: string;
    href: string;
  }[];
};

const CONFIGS: Record<AudienceKind, AudienceConfig> = {
  students: {
    kind: "students",
    route: "/students",
    titleLabel: "Student safety",
    heroEyebrow: "Independence with a visible safety layer",
    heroTitle:
      "Move through school, campus, transport, and new experiences without permanent tracking.",
    heroBody:
      "StayKnown helps students and young adults start safety only when it matters—during a commute, late study, a party, a new accommodation, an unfamiliar meeting, or an uncertain journey.",
    orbitLabel: "Student-controlled safety",
    orbitIcon: "student",
    heroImage: "/hero/stayknown-safe-journey-bus.png",
    heroImageAlt: "A student journey viewed from inside a bus",
    heroSecondaryImage: "/hero/visit-live-sos.png",
    heroSecondaryImageAlt: "StayKnown Visit, LIVE, and SOS controls",
    introTitle: "Four common student moments. One consent-first response.",
    introBody:
      "Choose a situation to see what the student does, what trusted people understand, and where the privacy boundary remains.",
    contextLabels: [
      "School transport",
      "Late study",
      "Campus and parties",
      "New accommodation",
      "Unfamiliar meetings",
    ],
    scenarios: [
      {
        id: "commute",
        number: "01",
        label: "Commute",
        eyebrow: "School and campus transport",
        title: "Start a Visit before the route begins.",
        body:
          "A student can add a destination, select approved contacts, and begin a safety session for a bus, ride, walk, or unfamiliar route.",
        image: "/hero/visit-live-sos.png",
        imageAlt: "StayKnown Visit controls for a student journey",
        secondaryImage: "/hero/stayknown-safe-journey-bus.png",
        secondaryImageAlt: "A student transport journey",
        icon: "visit",
        tone: "safe",
        learnHref: "/learn/safe-journey",
        userAction:
          "Review the route, choose approved recipients, and deliberately start the Visit.",
        trustedAction:
          "Selected contacts receive the destination and active safety-session context.",
        boundary:
          "The student decides when the Visit begins. Approval alone does not expose everyday movement.",
      },
      {
        id: "late-study",
        number: "02",
        label: "Late study",
        eyebrow: "Evening movement",
        title: "Keep LIVE context active until arrival.",
        body:
          "When leaving a library, class, workplace, or study group late, the student can keep the active Visit visible to selected people.",
        image: "/hero/live-map.png",
        imageAlt: "StayKnown LIVE map for a late student journey",
        secondaryImage: "/hero/visit-live.png",
        secondaryImageAlt: "StayKnown active Visit screen",
        icon: "live",
        tone: "safe",
        learnHref: "/learn/live-map",
        userAction:
          "Keep the supported Visit active during the late movement and end it after arrival.",
        trustedAction:
          "Recipients can understand location confidence, identity, and whether the session remains active.",
        boundary:
          "LIVE sharing belongs to the active Visit and closes when that safety session ends.",
      },
      {
        id: "check-in",
        number: "03",
        label: "Check-in",
        eyebrow: "Independent reassurance",
        title: "Confirm I’M SAFE without constant calls.",
        body:
          "A direct check-in can reassure family or trusted people while allowing the student to remain independent and focused.",
        image: "/hero/get-safe-hints.png",
        imageAlt: "StayKnown I’M SAFE guidance for students",
        secondaryImage: "/hero/stories-profile.png",
        secondaryImageAlt: "StayKnown profile and identity screen",
        icon: "safe",
        tone: "safe",
        learnHref: "/learn/get-safe-guidance",
        userAction:
          "Confirm I’M SAFE through the supported check-in flow.",
        trustedAction:
          "Trusted people receive a clear reassurance signal and can distinguish it from a missed prompt.",
        boundary:
          "A check-in communicates safety intentionally; it does not become a permanent location feed.",
      },
      {
        id: "danger",
        number: "04",
        label: "Urgent danger",
        eyebrow: "Emergency escalation",
        title: "Escalate clearly when the situation becomes unsafe.",
        body:
          "SOS creates a high-clarity urgent state for configured contacts and responders when ordinary reassurance is no longer enough.",
        image: "/hero/sos-activated.png",
        imageAlt: "StayKnown active SOS state for urgent student safety",
        secondaryImage: "/hero/end-sos-verify.png",
        secondaryImageAlt: "StayKnown verified SOS ending screen",
        icon: "sos",
        tone: "sos",
        learnHref: "/learn/sos",
        userAction:
          "Activate the supported SOS flow when urgent escalation is required.",
        trustedAction:
          "Configured recipients receive the strongest available safety context and response actions.",
        boundary:
          "StayKnown supports trusted-contact escalation but does not replace the correct local emergency service.",
      },
    ],
    principles: [
      {
        title: "The student remains central",
        body:
          "The person moving decides when a normal safety Visit begins and who receives its context.",
        icon: "student",
        tone: "neutral",
      },
      {
        title: "Guardians need lawful boundaries",
        body:
          "Eligible minor access uses the guardian-consent flow and remains subject to anti-stalking and no-contact rules.",
        icon: "guardian",
        tone: "safe",
      },
      {
        title: "Safety context beats a raw dot",
        body:
          "Destination, identity, timing, confidence, and session state help trusted people understand what is happening.",
        icon: "shield",
        tone: "safe",
      },
      {
        title: "Urgency stays unmistakable",
        body:
          "SOS is visually and operationally distinct from ordinary check-ins and Visits.",
        icon: "sos",
        tone: "sos",
      },
    ],
    boundaryTitle: "Care should support independence—not erase it.",
    boundaryBody:
      "Students and young adults need protection that respects consent, age, guardian rules, school boundaries, and personal dignity.",
    boundaryPoints: [
      "Users under 13 are not eligible for normal account access.",
      "Ages 13–17 require the supported guardian-consent process.",
      "Approved contacts do not receive permanent LIVE access.",
      "Stalking, coercive control, grooming, luring, and exploitation are prohibited.",
    ],
    finalTitle: "Practise the safety flow before the day you need it.",
    finalBody:
      "Install StayKnown, add an approved contact, understand Visit and I’M SAFE, and review SOS with the trusted people who may respond.",
    related: [
      { label: "Minor safety", href: "/minors" },
      { label: "Guardian consent", href: "/guardian-consent" },
      { label: "Trust & Safety", href: "/trust-safety" },
    ],
  },
  travel: {
    kind: "travel",
    route: "/travel-rides",
    titleLabel: "Travel & rides",
    heroEyebrow: "Journeys with purpose-bound safety",
    heroTitle:
      "Add context to rides, road travel, airports, work trips, and unfamiliar destinations.",
    heroBody:
      "StayKnown helps travellers and ride users create a clear beginning, active LIVE context, intentional updates, and a verified end—without turning every journey into permanent tracking.",
    orbitLabel: "Journey-bound protection",
    orbitIcon: "travel",
    heroImage: "/hero/stayknown-safe-journey-bus.png",
    heroImageAlt: "A road journey viewed from inside a bus",
    heroSecondaryImage: "/hero/live-map.png",
    heroSecondaryImageAlt: "StayKnown LIVE safety map",
    introTitle: "Follow the journey from pickup to verified arrival.",
    introBody:
      "Select a stage to see how StayKnown adds destination, identity, location confidence, and urgent escalation to a real trip.",
    contextLabels: [
      "Ride-hailing",
      "Road travel",
      "Airports",
      "Work trips",
      "Unfamiliar destinations",
    ],
    scenarios: [
      {
        id: "prepare",
        number: "01",
        label: "Prepare",
        eyebrow: "Before departure",
        title: "Create the safety session before movement begins.",
        body:
          "Add a destination, review safety guidance, and select the approved contacts who should understand the journey.",
        image: "/hero/visit-live-sos.png",
        imageAlt: "StayKnown Visit preparation controls",
        secondaryImage: "/hero/stayknown-safe-journey-bus.png",
        secondaryImageAlt: "A road-travel scene",
        icon: "visit",
        tone: "safe",
        learnHref: "/learn/visit-live-sos",
        userAction:
          "Confirm the destination and deliberately start the Visit before or at pickup.",
        trustedAction:
          "Selected contacts receive the journey purpose and active-session state.",
        boundary:
          "The Visit does not start merely because a contact relationship exists.",
      },
      {
        id: "route",
        number: "02",
        label: "On route",
        eyebrow: "LIVE journey context",
        title: "Show the active route without creating an all-day map.",
        body:
          "During the Visit, permitted recipients can follow supported location context and understand that the traveller remains inside an active safety session.",
        image: "/hero/live-map.png",
        imageAlt: "StayKnown LIVE map during a journey",
        secondaryImage: "/hero/visit-live.png",
        secondaryImageAlt: "StayKnown active Visit screen",
        icon: "live",
        tone: "safe",
        learnHref: "/learn/live-map",
        userAction:
          "Keep the Visit active during the route and review location-confidence warnings when they appear.",
        trustedAction:
          "Recipients see the permitted user identity, location confidence, and Visit state.",
        boundary:
          "LIVE access remains private to selected recipients and the active safety flow.",
      },
      {
        id: "change",
        number: "03",
        label: "Route change",
        eyebrow: "Fresh safety evidence",
        title: "Use Manual Capture when the situation changes.",
        body:
          "An unexpected stop, route deviation, new pickup point, or unfamiliar place may require an intentional additional safety update.",
        image: "/hero/manual-capture.png",
        imageAlt: "StayKnown Manual Capture during travel",
        secondaryImage: "/hero/get-safe-hints.png",
        secondaryImageAlt: "StayKnown safety guidance",
        icon: "capture",
        tone: "neutral",
        learnHref: "/learn/manual-capture",
        userAction:
          "Send a visible additional safety update when more context may help trusted people.",
        trustedAction:
          "Recipients receive a clearer event with timing and location context.",
        boundary:
          "Manual Capture is user-initiated and is not a promise of hidden audio or camera recording.",
      },
      {
        id: "urgent",
        number: "04",
        label: "Urgent",
        eyebrow: "Emergency escalation",
        title: "Raise SOS when the route or encounter becomes dangerous.",
        body:
          "When a journey moves beyond normal uncertainty into urgent danger, SOS changes the interface and message priority.",
        image: "/hero/sos-activated.png",
        imageAlt: "StayKnown active SOS during travel",
        secondaryImage: "/hero/sos-active.png",
        secondaryImageAlt: "StayKnown SOS active screen",
        icon: "sos",
        tone: "sos",
        learnHref: "/learn/sos",
        userAction:
          "Activate SOS through the supported trigger when urgent escalation is required.",
        trustedAction:
          "Configured contacts and responders receive urgent safety context and response actions.",
        boundary:
          "StayKnown is not a ride operator, transport authority, police, ambulance, or official dispatch service.",
      },
    ],
    principles: [
      {
        title: "Destination gives context",
        body:
          "A journey is easier to understand when trusted people know where the user intends to go.",
        icon: "travel",
        tone: "neutral",
      },
      {
        title: "Confidence remains visible",
        body:
          "Location delay, accuracy, network state, and VPN limits can affect what the map means.",
        icon: "live",
        tone: "safe",
      },
      {
        title: "Fresh updates stay intentional",
        body:
          "Manual Capture adds context through a visible user action rather than hidden recording.",
        icon: "capture",
        tone: "neutral",
      },
      {
        title: "Arrival closes the session",
        body:
          "Verified completion creates a clear ending and closes active LIVE access.",
        icon: "verify",
        tone: "safe",
      },
    ],
    boundaryTitle: "Travel safety is not a guarantee of route, driver, or destination safety.",
    boundaryBody:
      "StayKnown supports awareness and trusted-contact communication. Users must still follow local transport guidance and contact the correct authority when danger exists.",
    boundaryPoints: [
      "StayKnown does not verify every driver, vehicle, route, property, or destination.",
      "Network and device conditions can delay or reduce location confidence.",
      "VPN or proxy use can weaken supported location reliability.",
      "Official emergency and transport services remain separate from StayKnown.",
    ],
    finalTitle: "Start the Visit before uncertainty begins.",
    finalBody:
      "Install StayKnown, approve the people you trust, review the route together, and understand how LIVE, Capture, and SOS work before departure.",
    related: [
      { label: "Safe journey", href: "/learn/safe-journey" },
      { label: "Location safety", href: "/location-safety" },
      { label: "Emergency limits", href: "/emergency" },
    ],
  },
  families: {
    kind: "families",
    route: "/families-guardians",
    titleLabel: "Families & guardians",
    heroEyebrow: "Care with visible consent boundaries",
    heroTitle:
      "Support loved ones, teens, and young adults without turning care into hidden surveillance.",
    heroBody:
      "StayKnown gives families and eligible guardians approved relationships, purposeful Visits, I’M SAFE reassurance, urgent SOS escalation, and clear endings.",
    orbitLabel: "Care without covert tracking",
    orbitIcon: "family",
    heroImage: "/hero/stayknown-family-farewell.png",
    heroImageAlt: "A family saying goodbye before a journey",
    heroSecondaryImage: "/hero/contact-approval.png",
    heroSecondaryImageAlt: "StayKnown contact-approval screen",
    introTitle: "Care changes with the relationship and the active safety state.",
    introBody:
      "Select a family moment to see how approval, guardian consent, check-ins, and urgent escalation remain distinct.",
    contextLabels: [
      "Family journeys",
      "Eligible minors",
      "Young adults",
      "Daily reassurance",
      "Urgent response",
    ],
    scenarios: [
      {
        id: "relationship",
        number: "01",
        label: "Approve",
        eyebrow: "Trusted relationship",
        title: "Begin with a visible approved-contact relationship.",
        body:
          "Family connection outside StayKnown does not automatically create location access inside the platform.",
        image: "/hero/contact-approval.png",
        imageAlt: "StayKnown approved family-contact screen",
        secondaryImage: "/hero/verification.png",
        secondaryImageAlt: "StayKnown verified identity screen",
        icon: "contacts",
        tone: "neutral",
        learnHref: "/learn/contact-approval",
        userAction:
          "Send or accept the supported contact request and confirm the relationship deliberately.",
        trustedAction:
          "Both people see the approval state and identity associated with the relationship.",
        boundary:
          "Approval prepares supported safety flows; it does not create permanent location access.",
      },
      {
        id: "guardian",
        number: "02",
        label: "Guardian",
        eyebrow: "Age-aware consent",
        title: "Eligible minors use a stronger guardian-consent process.",
        body:
          "Users aged 13–17 require the supported guardian flow, while users under 13 are not eligible for normal account access.",
        image: "/hero/stories-profile.png",
        imageAlt: "StayKnown profile and identity screen",
        secondaryImage: "/hero/contact-approval.png",
        secondaryImageAlt: "StayKnown approved-contact screen",
        icon: "guardian",
        tone: "safe",
        learnHref: "/guardian-consent",
        userAction:
          "Complete the supported guardian approval and identity process for an eligible minor.",
        trustedAction:
          "The guardian relationship and approval status remain visible and reviewable.",
        boundary:
          "Guardian status does not authorize stalking, coercive control, exploitation, or violation of lawful no-contact rules.",
      },
      {
        id: "reassure",
        number: "03",
        label: "Reassure",
        eyebrow: "I’M SAFE",
        title: "Replace repeated checking calls with a direct reassurance signal.",
        body:
          "The user can confirm I’M SAFE, while trusted people can understand the difference between a completed and missed check-in.",
        image: "/hero/get-safe-hints.png",
        imageAlt: "StayKnown I’M SAFE family reassurance screen",
        secondaryImage: "/hero/stayknown-family-farewell.png",
        secondaryImageAlt: "Family journey context",
        icon: "safe",
        tone: "safe",
        learnHref: "/learn/get-safe-guidance",
        userAction:
          "Confirm I’M SAFE through the supported check-in flow.",
        trustedAction:
          "Approved trusted people receive a clear reassurance or missed-prompt context.",
        boundary:
          "The check-in communicates safety without opening a permanent family map.",
      },
      {
        id: "respond",
        number: "04",
        label: "Respond",
        eyebrow: "SOS and verified ending",
        title: "Urgent moments receive stronger context and a clear end state.",
        body:
          "SOS helps configured family contacts and responders understand urgency, while verified stopping prevents an accidental disappearance of the emergency state.",
        image: "/hero/sos-activated.png",
        imageAlt: "StayKnown family SOS response screen",
        secondaryImage: "/hero/end-visit-verify.png",
        secondaryImageAlt: "StayKnown verified Visit ending screen",
        icon: "sos",
        tone: "sos",
        learnHref: "/learn/sos",
        userAction:
          "Activate urgent escalation when required and use verified completion when the safety state is genuinely over.",
        trustedAction:
          "Recipients see the urgent or completed state rather than simply losing context.",
        boundary:
          "Families should still contact the correct local emergency or safeguarding authority when immediate danger exists.",
      },
    ],
    principles: [
      {
        title: "Relationship does not equal surveillance",
        body:
          "Family, guardian, partner, or caregiver status does not automatically create permanent access.",
        icon: "family",
        tone: "neutral",
      },
      {
        title: "Minor protection is age-aware",
        body:
          "Under-13 access is blocked and ages 13–17 use the supported guardian-consent process.",
        icon: "guardian",
        tone: "safe",
      },
      {
        title: "Reassurance remains direct",
        body:
          "I’M SAFE helps loved ones communicate clearly without requiring constant checking calls.",
        icon: "safe",
        tone: "safe",
      },
      {
        title: "Abuse rules apply to family relationships",
        body:
          "Stalking, threats, coercive control, grooming, exploitation, and ignored blocks remain prohibited.",
        icon: "shield",
        tone: "sos",
      },
    ],
    boundaryTitle: "Protective care must remain lawful, visible, and respectful.",
    boundaryBody:
      "StayKnown supports families and guardians while preserving the user’s consent, dignity, lawful rights, and ability to end or report misuse.",
    boundaryPoints: [
      "A family relationship does not override a decline, restriction, removal, or block.",
      "Guardian flows do not authorize hidden surveillance or coercive control.",
      "Protective orders and lawful no-contact boundaries take priority.",
      "Immediate child-safety concerns should reach the correct local safeguarding authority.",
    ],
    finalTitle: "Build a family safety plan before an urgent moment.",
    finalBody:
      "Agree who should be approved, when a Visit should be used, what an I’M SAFE confirmation means, and how recipients should respond to SOS.",
    related: [
      { label: "Child safety", href: "/minors" },
      { label: "Guardian consent", href: "/guardian-consent" },
      { label: "Abuse reporting", href: "/abuse" },
    ],
  },
};

function accentStyles(tone: AudienceTone) {
  if (tone === "safe") {
    return {
      text: "text-[#8ff3d0]",
      deepText: "text-[#0b7a62]",
      border: "border-[#8ff3d0]/58",
      dot: "bg-[#8ff3d0]",
      glow: "shadow-[0_0_28px_rgba(143,243,208,0.22)]",
    };
  }

  if (tone === "sos") {
    return {
      text: "text-[#f04c55]",
      deepText: "text-[#d7353d]",
      border: "border-[#f04c55]/64",
      dot: "bg-[#f04c55]",
      glow: "shadow-[0_0_30px_rgba(240,76,85,0.25)]",
    };
  }

  return {
    text: "text-white",
    deepText: "text-black",
    border: "border-white/55",
    dot: "bg-white",
    glow: "shadow-[0_0_24px_rgba(255,255,255,0.16)]",
  };
}

function AudienceIconView({
  name,
  className = "h-4 w-4",
}: {
  name: AudienceIcon;
  className?: string;
}) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };

  switch (name) {
    case "student":
      return (
        <svg {...common}>
          <path d="m3 9 9-5 9 5-9 5z" />
          <path d="M7 12v4c3 2 7 2 10 0v-4M21 9v6" />
        </svg>
      );
    case "travel":
      return (
        <svg {...common}>
          <path d="M4 17h16M6 17l1-8h10l1 8M9 9V6h6v3" />
          <circle cx="8" cy="19" r="1.5" />
          <circle cx="16" cy="19" r="1.5" />
        </svg>
      );
    case "family":
    case "contacts":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 20v-1.5A4.5 4.5 0 0 1 8 14h2a4.5 4.5 0 0 1 4.5 4.5V20" />
          <path d="M16 7.5a2.5 2.5 0 1 1 0 5M17.5 15a4 4 0 0 1 3 3.9V20" />
        </svg>
      );
    case "guardian":
      return (
        <svg {...common}>
          <path d="M12 3 4.5 6v5.5c0 4.7 3.1 7.7 7.5 9.5 4.4-1.8 7.5-4.8 7.5-9.5V6z" />
          <circle cx="12" cy="10" r="2" />
          <path d="M8.5 16a3.5 3.5 0 0 1 7 0" />
        </svg>
      );
    case "visit":
      return (
        <svg {...common}>
          <path d="M5 21c4-5 10-5 14-10" />
          <path d="M15 7h4v4" />
          <circle cx="5" cy="17" r="2" />
          <circle cx="18" cy="6" r="2" />
        </svg>
      );
    case "live":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="2.5" />
          <path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4" />
          <path d="M4.8 4.8a10.2 10.2 0 0 0 0 14.4M19.2 4.8a10.2 10.2 0 0 1 0 14.4" />
        </svg>
      );
    case "capture":
      return (
        <svg {...common}>
          <path d="M4 8h3l1.5-2h7L17 8h3v10H4z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      );
    case "safe":
    case "verify":
      return (
        <svg {...common}>
          <path d="M12 3 4.5 6v5.5c0 4.7 3.1 7.7 7.5 9.5 4.4-1.8 7.5-4.8 7.5-9.5V6z" />
          <path d="m8.5 12 2.2 2.2 4.8-5" />
        </svg>
      );
    case "sos":
      return (
        <svg {...common}>
          <path d="M12 3 2.8 19h18.4z" />
          <path d="M12 9v4M12 16.5h.01" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 4.5 6v5.5c0 4.7 3.1 7.7 7.5 9.5 4.4-1.8 7.5-4.8 7.5-9.5V6z" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="10" width="14" height="10" rx="3" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4z" />
          <path d="m18.5 14 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
        </svg>
      );
    case "arrow":
    default:
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m14 7 5 5-5 5" />
        </svg>
      );
  }
}

function GooglePlayMark() {
  return (
    <svg viewBox="0 0 512 512" aria-hidden="true" className="h-[17px] w-[17px]">
      <path d="M96 38.4v435.2c0 17.2 18.8 27.8 33.5 18.8l251.3-153.7L96 38.4z" fill="#34A853" />
      <path d="M96 38.4l284.8 300.3 68.2-41.7c22.7-13.9 22.7-46.8 0-60.7L380.8 194.6 96 38.4z" fill="#4285F4" />
      <path d="M96 38.4l284.8 156.2L294.2 256 96 38.4z" fill="#FBBC04" />
      <path d="M96 473.6 294.2 256l86.6 82.7L129.5 492.4C114.8 501.4 96 490.8 96 473.6z" fill="#EA4335" />
    </svg>
  );
}

function DownloadButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={GOOGLE_PLAY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative inline-flex h-10 items-center justify-center gap-2.5 overflow-hidden rounded-[14px] border border-white bg-white px-4 text-black shadow-[0_12px_30px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,1),inset_0_-5px_12px_rgba(0,0,0,0.09)] transition hover:-translate-y-px hover:border-white/25 hover:bg-black hover:text-white active:translate-y-0 active:scale-[0.985] ${className}`}
    >
      <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-white" />
      <span className="flex h-7 w-7 items-center justify-center rounded-[9px] border border-black/[0.07] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,1),0_5px_12px_rgba(0,0,0,0.10)]">
        <GooglePlayMark />
      </span>
      <span className="text-[10px] font-black">Get StayKnown</span>
    </a>
  );
}

function AudienceOrbit({ config }: { config: AudienceConfig }) {
  const reduceMotion = useReducedMotion();

  const orbitNodes = [
    { icon: "contacts" as AudienceIcon, label: "Approved" },
    { icon: "visit" as AudienceIcon, label: "Visit" },
    { icon: "safe" as AudienceIcon, label: "I’M SAFE" },
    { icon: "sos" as AudienceIcon, label: "SOS" },
  ];

  return (
    <div className="relative mx-auto h-[500px] w-full max-w-[520px] sm:h-[610px]">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[490px] w-[490px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />

      <motion.div
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{
          duration: 42,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/[0.12]"
      >
        {orbitNodes.map((node, index) => {
          const positions = [
            "left-1/2 top-[-21px] -translate-x-1/2",
            "right-[-21px] top-1/2 -translate-y-1/2",
            "bottom-[-21px] left-1/2 -translate-x-1/2",
            "left-[-21px] top-1/2 -translate-y-1/2",
          ];

          const isSos = node.icon === "sos";

          return (
            <motion.span
              key={node.label}
              animate={reduceMotion ? undefined : { rotate: -360 }}
              transition={{
                duration: 42,
                repeat: Infinity,
                ease: "linear",
              }}
              className={`absolute flex h-11 w-11 items-center justify-center rounded-[14px] border bg-black shadow-[0_14px_32px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.08)] ${
                isSos
                  ? "border-[#f04c55]/55 text-[#f04c55]"
                  : "border-[#8ff3d0]/42 text-[#8ff3d0]"
              } ${positions[index]}`}
            >
              <AudienceIconView name={node.icon} className="h-4 w-4" />
            </motion.span>
          );
        })}
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: reduceMotion ? 0 : 0.78,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="absolute left-1/2 top-1/2 z-10 h-[260px] w-[210px] -translate-x-1/2 -translate-y-1/2"
      >
        <Image
          src={config.heroSecondaryImage}
          alt={config.heroSecondaryImageAlt}
          width={430}
          height={880}
          priority
          className="h-auto w-full object-contain drop-shadow-[0_38px_82px_rgba(0,0,0,0.9)]"
        />
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: -24, rotate: -8 }}
        animate={{ opacity: 0.56, x: 0, rotate: -8 }}
        transition={{ duration: reduceMotion ? 0 : 0.68, delay: 0.15 }}
        className="absolute left-[2%] top-[21%] h-[250px] w-[155px] overflow-hidden rounded-[28px] border border-white/[0.12] shadow-[0_30px_70px_rgba(0,0,0,0.7)]"
      >
        <Image
          src={config.heroImage}
          alt={config.heroImageAlt}
          fill
          priority
          sizes="155px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/18" />
      </motion.div>

      <motion.div
        animate={
          reduceMotion
            ? undefined
            : { scale: [0.97, 1.03, 0.97], opacity: [0.58, 1, 0.58] }
        }
        transition={{
          duration: 4.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[4%] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#8ff3d0]/46 bg-black px-3 py-2 text-[#8ff3d0] shadow-[0_0_28px_rgba(143,243,208,0.17)]"
      >
        <AudienceIconView name={config.orbitIcon} className="h-3.5 w-3.5" />
        <span className="whitespace-nowrap text-[8px] font-black uppercase tracking-[0.15em]">
          {config.orbitLabel}
        </span>
      </motion.div>
    </div>
  );
}

function ScenarioDevice({ scenario }: { scenario: Scenario }) {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-5.5, 5.5]), {
    stiffness: 150,
    damping: 21,
  });
  const rotateX = useSpring(useTransform(pointerY, [0, 1], [4.5, -4.5]), {
    stiffness: 150,
    damping: 21,
  });

  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width);
    pointerY.set((event.clientY - rect.top) / rect.height);
  };

  const reset = () => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  };

  const tone = accentStyles(scenario.tone);

  return (
    <div
      onPointerMove={move}
      onPointerLeave={reset}
      className="relative h-full min-h-[530px] overflow-hidden"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.075]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />

      <motion.div
        style={{
          rotateX: reduceMotion ? 0 : rotateX,
          rotateY: reduceMotion ? 0 : rotateY,
          transformPerspective: 1200,
        }}
        className="absolute inset-0"
      >
        {scenario.secondaryImage ? (
          scenario.secondaryImage.includes("stayknown-") ? (
            <div className="absolute right-[4%] top-[17%] h-[330px] w-[205px] rotate-[7deg] overflow-hidden rounded-[32px] border border-white/[0.12] opacity-72 shadow-[0_30px_68px_rgba(0,0,0,0.84)]">
              <Image
                src={scenario.secondaryImage}
                alt={scenario.secondaryImageAlt ?? ""}
                fill
                sizes="205px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/12" />
            </div>
          ) : (
            <div className="absolute right-[7%] top-[18%] w-[39%] rotate-[7deg] opacity-78">
              <Image
                src={scenario.secondaryImage}
                alt={scenario.secondaryImageAlt ?? ""}
                width={400}
                height={820}
                quality={88}
                className="h-auto w-full object-contain drop-shadow-[0_30px_68px_rgba(0,0,0,0.84)]"
              />
            </div>
          )
        ) : null}

        <div className="absolute left-[10%] top-[6%] z-10 w-[46%]">
          <Image
            src={scenario.image}
            alt={scenario.imageAlt}
            width={430}
            height={880}
            quality={90}
            className="h-auto w-full object-contain drop-shadow-[0_38px_82px_rgba(0,0,0,0.9)]"
          />
        </div>
      </motion.div>

      <div
        className={`absolute bottom-[7%] left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border bg-black px-3 py-2 ${tone.border} ${tone.text} ${tone.glow}`}
      >
        <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
        <span className="whitespace-nowrap text-[8px] font-black uppercase tracking-[0.15em]">
          {scenario.label}
        </span>
      </div>
    </div>
  );
}

function ScenarioLab({ config }: { config: AudienceConfig }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeScenario = config.scenarios[activeIndex];
  const tone = accentStyles(activeScenario.tone);

  const handleKeyboard = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setActiveIndex((current) =>
        Math.min(config.scenarios.length - 1, current + 1),
      );
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(0, current - 1));
    }

    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(config.scenarios.length - 1);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    [
      activeIndex,
      Math.max(0, activeIndex - 1),
      Math.min(config.scenarios.length - 1, activeIndex + 1),
    ].forEach((index) => {
      const scenario = config.scenarios[index];
      [scenario.image, scenario.secondaryImage]
        .filter((value): value is string => Boolean(value))
        .forEach((src) => {
          const image = new window.Image();
          image.src = src;
          image.decode?.().catch(() => undefined);
        });
    });
  }, [activeIndex, config.scenarios]);

  return (
    <section
      id="situations"
      className="relative overflow-hidden bg-black py-16 sm:py-20 lg:py-24"
    >
      <div className="pointer-events-none absolute left-1/2 top-[48%] h-[760px] w-[1140px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-[9px] font-black uppercase tracking-[0.28em] text-white/38">
            Interactive situation lab
          </div>
          <h2 className="mt-4 text-[40px] font-black leading-[0.94] tracking-[-0.068em] text-white sm:text-[52px] md:text-[62px]">
            {config.introTitle}
          </h2>
          <p className="mx-auto mt-5 max-w-[69ch] text-[13px] font-semibold leading-relaxed text-white/56 sm:text-[14px]">
            {config.introBody}
          </p>
        </div>

        <div
          tabIndex={0}
          onKeyDown={handleKeyboard}
          className="mt-9 overflow-hidden rounded-[35px] border border-white/[0.13] bg-black outline-none shadow-[0_40px_124px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,0.08)] focus-visible:ring-2 focus-visible:ring-white/30"
          aria-label={`${config.titleLabel} interactive safety situations`}
        >
          <div className="sk-scroll-hidden flex gap-2 overflow-x-auto border-b border-white/[0.09] px-3 py-3 sm:px-4">
            {config.scenarios.map((scenario, index) => {
              const selected = index === activeIndex;
              const itemTone = accentStyles(scenario.tone);

              return (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-current={selected ? "step" : undefined}
                  className={`inline-flex min-h-11 shrink-0 items-center gap-2.5 rounded-[14px] border px-3 text-left transition ${
                    selected
                      ? "border-white bg-white text-black shadow-[inset_0_1px_0_rgba(255,255,255,1)]"
                      : "border-white/[0.11] bg-black text-white/48 hover:border-white/24 hover:text-white"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[8px] border ${
                      selected
                        ? "border-black/[0.09] text-black"
                        : `${itemTone.border} ${itemTone.text}`
                    }`}
                  >
                    <AudienceIconView
                      name={scenario.icon}
                      className="h-3.5 w-3.5"
                    />
                  </span>
                  <span>
                    <span className="block text-[7px] font-black uppercase tracking-[0.13em] opacity-55">
                      {scenario.number}
                    </span>
                    <span className="mt-1 block text-[9px] font-black">
                      {scenario.label}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-[1.02fr_0.98fr]">
            <div className="relative min-h-[550px] border-b border-white/[0.09] lg:min-h-[720px] lg:border-b-0 lg:border-r">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeScenario.id}-visual`}
                  initial={{ opacity: 0, y: 14, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.99 }}
                  transition={{
                    duration: 0.42,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="absolute inset-0"
                >
                  <ScenarioDevice scenario={activeScenario} />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="relative min-h-[620px] p-5 sm:p-7 lg:min-h-[720px] lg:p-9">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeScenario.id}-copy`}
                  initial={{ opacity: 0, x: 18, y: 4 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex h-full flex-col"
                >
                  <div className={`text-[9px] font-black uppercase tracking-[0.23em] ${tone.text}`}>
                    {activeScenario.eyebrow}
                  </div>

                  <h3 className="mt-4 max-w-[15ch] text-[36px] font-black leading-[0.95] tracking-[-0.065em] text-white sm:text-[45px] lg:text-[49px]">
                    {activeScenario.title}
                  </h3>

                  <p className="mt-5 max-w-[61ch] text-[13px] font-semibold leading-relaxed text-white/57 sm:text-[14px]">
                    {activeScenario.body}
                  </p>

                  <div className="mt-7 grid gap-3">
                    {[
                      {
                        label: "What the user does",
                        body: activeScenario.userAction,
                        icon: activeScenario.icon,
                      },
                      {
                        label: "What trusted people understand",
                        body: activeScenario.trustedAction,
                        icon: "contacts" as AudienceIcon,
                      },
                      {
                        label: "Safety boundary",
                        body: activeScenario.boundary,
                        icon: "lock" as AudienceIcon,
                      },
                    ].map((item, index) => (
                      <article
                        key={item.label}
                        className={`rounded-[20px] border bg-black p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] ${
                          index === 2 ? tone.border : "border-white/[0.11]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-[10px] border bg-black ${
                              index === 2
                                ? `${tone.border} ${tone.text}`
                                : "border-white/[0.12] text-white/58"
                            }`}
                          >
                            <AudienceIconView
                              name={item.icon}
                              className="h-3.5 w-3.5"
                            />
                          </span>
                          <span className="text-[8.5px] font-black uppercase tracking-[0.16em] text-white/36">
                            {item.label}
                          </span>
                        </div>
                        <p className="mt-3 text-[11.5px] font-semibold leading-relaxed text-white/62 sm:text-[12.5px]">
                          {item.body}
                        </p>
                      </article>
                    ))}
                  </div>

                  <div className="mt-auto flex flex-wrap gap-2.5 pt-7">
                    <Link
                      href={activeScenario.learnHref}
                      className="inline-flex h-9 items-center gap-2 rounded-[13px] border border-white bg-white px-3.5 text-[10px] font-black text-black shadow-[0_10px_24px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,1),inset_0_-4px_10px_rgba(0,0,0,0.09)] transition hover:-translate-y-px hover:border-white/25 hover:bg-black hover:text-white"
                    >
                      Open detailed guide
                      <AudienceIconView
                        name="arrow"
                        className="h-3.5 w-3.5"
                      />
                    </Link>
                    <Link
                      href="/how-it-works"
                      className="inline-flex h-9 items-center gap-2 rounded-[13px] border border-white/[0.14] bg-black px-3.5 text-[10px] font-black text-white/65 transition hover:border-white/25 hover:text-white"
                    >
                      Full safety journey
                      <AudienceIconView
                        name="arrow"
                        className="h-3.5 w-3.5"
                      />
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PrinciplesSection({ config }: { config: AudienceConfig }) {
  return (
    <section className="relative overflow-hidden bg-white py-16 text-black sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-[9px] font-black uppercase tracking-[0.28em] text-black/36">
            Safety design principles
          </div>
          <h2 className="mt-4 text-[40px] font-black leading-[0.94] tracking-[-0.068em] sm:text-[52px] md:text-[60px]">
            Protection should remain understandable in real life.
          </h2>
        </div>

        <div className="mt-9 grid gap-3 md:grid-cols-2">
          {config.principles.map((principle, index) => {
            const tone = accentStyles(principle.tone);

            return (
              <motion.article
                key={principle.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.42,
                  delay: index * 0.065,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative overflow-hidden rounded-[25px] border border-black/[0.14] bg-white p-5 shadow-[0_20px_52px_rgba(0,0,0,0.075),inset_0_1px_0_rgba(255,255,255,1)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-[13px] border bg-white ${
                      principle.tone === "safe"
                        ? "border-[#0b7a62]/45 text-[#0b7a62] shadow-[0_0_22px_rgba(11,122,98,0.13)]"
                        : principle.tone === "sos"
                          ? "border-[#d7353d]/52 text-[#d7353d] shadow-[0_0_24px_rgba(215,53,61,0.14)]"
                          : "border-black/[0.16] text-black"
                    }`}
                  >
                    <AudienceIconView
                      name={principle.icon}
                      className="h-4 w-4"
                    />
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-[0.17em] text-black/28">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="mt-5 max-w-[18ch] text-[24px] font-black leading-[1] tracking-[-0.052em]">
                  {principle.title}
                </h3>
                <p className="mt-4 text-[11.5px] font-semibold leading-relaxed text-black/56">
                  {principle.body}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function BoundarySection({ config }: { config: AudienceConfig }) {
  return (
    <section className="relative overflow-hidden bg-black py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[650px] w-[1050px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />

      <div className="relative mx-auto grid max-w-6xl gap-9 px-4 sm:px-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:px-6">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.28em] text-[#8ff3d0]">
            Important boundary
          </div>
          <h2 className="mt-4 max-w-[13ch] text-[40px] font-black leading-[0.94] tracking-[-0.068em] text-white sm:text-[52px] md:text-[60px]">
            {config.boundaryTitle}
          </h2>
          <p className="mt-5 max-w-[59ch] text-[13px] font-semibold leading-relaxed text-white/56 sm:text-[14px]">
            {config.boundaryBody}
          </p>
        </div>

        <div className="grid gap-3">
          {config.boundaryPoints.map((point, index) => (
            <motion.div
              key={point}
              initial={{ opacity: 0, x: 18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{
                duration: 0.4,
                delay: index * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex items-start gap-3 rounded-[20px] border border-white/[0.12] bg-black p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] border border-[#8ff3d0]/45 bg-black text-[#8ff3d0]">
                <AudienceIconView name="check" className="h-3.5 w-3.5" />
              </span>
              <span className="text-[11.5px] font-semibold leading-relaxed text-white/62 sm:text-[12.5px]">
                {point}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AudienceExperience({
  kind,
}: {
  kind: AudienceKind;
}) {
  const config = CONFIGS[kind];

  return (
    <main className="min-h-screen overflow-x-clip bg-black text-white">
      <style jsx global>{`
        #main-content {
          background: #000000;
        }

        .sk-audience-nav {
          position: relative;
        }

        .sk-audience-nav::after {
          position: absolute;
          right: 0;
          bottom: -5px;
          left: 0;
          height: 1px;
          content: "";
          background: currentColor;
          opacity: 0;
          transform: scaleX(0.35);
          transition:
            opacity 180ms ease,
            transform 180ms ease;
        }

        .sk-audience-nav:hover::after,
        .sk-audience-nav:focus-visible::after {
          opacity: 0.55;
          transform: scaleX(1);
        }
      `}</style>

      <header className="sticky top-0 z-50 border-b border-white/[0.09] bg-black/94 backdrop-blur-2xl">
        <div className="mx-auto flex min-h-[66px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-5 lg:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-[13px] border border-white bg-white shadow-[0_10px_24px_rgba(0,0,0,0.36),inset_0_1px_0_rgba(255,255,255,1),inset_0_-4px_10px_rgba(0,0,0,0.09)]">
              <Image
                src="/6logo.png"
                alt=""
                width={20}
                height={20}
                priority
              />
            </span>
            <span>
              <span className="block text-[10px] font-black tracking-[0.22em]">
                STAYKNOWN
              </span>
              <span className="mt-1 block text-[7px] font-black uppercase tracking-[0.18em] text-white/32">
                {config.titleLabel}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-5 md:flex">
            <a
              href="#situations"
              className="sk-audience-nav text-[9px] font-black uppercase tracking-[0.13em] text-white/52 transition hover:text-white"
            >
              Situations
            </a>
            <Link
              href="/how-it-works"
              className="sk-audience-nav text-[9px] font-black uppercase tracking-[0.13em] text-white/52 transition hover:text-white"
            >
              How it works
            </Link>
            <Link
              href="/trust-safety"
              className="sk-audience-nav text-[9px] font-black uppercase tracking-[0.13em] text-white/52 transition hover:text-white"
            >
              Trust
            </Link>
          </nav>

          <DownloadButton />
        </div>
      </header>

      <section className="relative isolate overflow-hidden bg-black">
        <div className="pointer-events-none absolute left-1/2 top-[45%] h-[820px] w-[1220px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />
        <div className="pointer-events-none absolute left-1/2 top-[45%] h-[570px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.065]" />

        <div className="relative mx-auto grid min-h-[720px] max-w-6xl items-center gap-10 px-4 py-14 sm:px-5 lg:grid-cols-[1.05fr_0.95fr] lg:px-6 lg:py-20">
          <div>
            <div className="inline-flex min-h-8 items-center gap-2 rounded-full border border-[#8ff3d0]/46 bg-black px-3 text-[8px] font-black uppercase tracking-[0.18em] text-[#8ff3d0] shadow-[0_0_24px_rgba(143,243,208,0.13)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#8ff3d0] shadow-[0_0_12px_rgba(143,243,208,0.72)]" />
              {config.heroEyebrow}
            </div>

            <h1 className="mt-6 max-w-[11ch] text-[52px] font-black leading-[0.9] tracking-[-0.076em] sm:text-[68px] lg:text-[79px]">
              {config.heroTitle}
            </h1>

            <p className="mt-6 max-w-[64ch] text-[14px] font-semibold leading-relaxed text-white/58 sm:text-[15px]">
              {config.heroBody}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#situations"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[14px] border border-white bg-white px-4 text-[10px] font-black text-black shadow-[0_12px_30px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,1),inset_0_-5px_12px_rgba(0,0,0,0.09)] transition hover:-translate-y-px hover:border-white/25 hover:bg-black hover:text-white"
              >
                Explore situations
                <AudienceIconView name="arrow" className="h-3.5 w-3.5" />
              </a>
              <Link
                href="/plans"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[14px] border border-white/[0.15] bg-black px-4 text-[10px] font-black text-white/68 transition hover:border-white/28 hover:text-white"
              >
                Compare plans
                <AudienceIconView name="arrow" className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-[8.5px] font-black uppercase tracking-[0.12em] text-white/34">
              {config.contextLabels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>

          <AudienceOrbit config={config} />
        </div>
      </section>

      <ScenarioLab config={config} />
      <PrinciplesSection config={config} />
      <BoundarySection config={config} />

      <section className="relative overflow-hidden bg-white py-16 text-black sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-5 lg:px-6">
          <div className="text-[9px] font-black uppercase tracking-[0.28em] text-black/36">
            Prepare before the moment
          </div>
          <h2 className="mx-auto mt-4 max-w-[14ch] text-[42px] font-black leading-[0.94] tracking-[-0.07em] sm:text-[54px] md:text-[62px]">
            {config.finalTitle}
          </h2>
          <p className="mx-auto mt-5 max-w-[68ch] text-[13px] font-semibold leading-relaxed text-black/56 sm:text-[14px]">
            {config.finalBody}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <DownloadButton className="w-full max-w-[210px] sm:w-auto" />
            {config.related.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex h-10 w-full max-w-[210px] items-center justify-center gap-2 rounded-[14px] border border-black/[0.17] bg-white px-4 text-[10px] font-black text-black transition hover:-translate-y-px hover:border-black hover:bg-black hover:text-white sm:w-auto"
              >
                {item.label}
                <AudienceIconView name="arrow" className="h-3.5 w-3.5" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
