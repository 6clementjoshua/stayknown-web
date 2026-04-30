"use client";

import Image from "next/image";
import { useMemo } from "react";
import HeroSlider, { type HeroSlide } from "../components/HeroSlider";
import StayKnownActionMenu from "@/components/StayKnownActionMenu";

export default function Page() {
  const slides: HeroSlide[] = useMemo(
    () => [
      {
        id: "get-safe-guidance",
        src: "/hero/get-safe-hints.png",
        kind: "device",
        title: "GET SAFE",
        teaser:
          "StayKnown was created by 6Clement Joshua to help people move, visit, chat, share safety context, and stay connected to trusted people wherever they go.",
      },
      {
        id: "visit-live-sos",
        src: "/hero/visit-live-sos.png",
        kind: "device",
        title: "Live Visit + SOS Ready",
        teaser:
          "Start a Visit, keep LIVE context active, and keep SOS close when the situation needs urgent escalation.",
      },
      {
        id: "visit-live",
        src: "/hero/visit-live.png",
        kind: "device",
        title: "Visit + LIVE Protection",
        teaser:
          "LIVE sharing is tied to an active Visit, helping trusted contacts understand where the user is while safety tracking is active.",
      },
      {
        id: "live-map",
        src: "/hero/live-map.png",
        kind: "device",
        title: "Live Map for Approved Contacts",
        teaser:
          "Approved contacts can open a safety map only from the user’s permitted Visit or SOS flow, with privacy notice, session context, and lawful-use boundaries.",
      },
      {
        id: "promax-shell",
        src: "/hero/promax-shell.png",
        kind: "device",
        title: "ProMax MainShell",
        teaser:
          "A premium, plan-aware navigation shell built for fast access to safety, contacts, chat, profile, and high-value actions.",
      },
      {
        id: "manual-capture",
        src: "/hero/manual-capture.png",
        kind: "device",
        title: "Manual Emergency Capture",
        teaser:
          "During an active Visit, users can send an extra safety location update without disturbing the normal tracking rhythm.",
      },
      {
        id: "sos-activated",
        src: "/hero/sos-activated.png",
        kind: "device",
        title: "SOS Active State",
        teaser:
          "When SOS is active, StayKnown shifts into a high-clarity emergency state so the user knows escalation is running.",
      },
      {
        id: "sos-live-idle",
        src: "/hero/sos-live-idle.png",
        kind: "device",
        title: "SOS Ready, Not Confusing",
        teaser:
          "The SOS surface stays simple and readable, helping users understand when SOS is available and when it is not active.",
      },
      {
        id: "end-sos-verify",
        src: "/hero/end-sos-verify.png",
        kind: "device",
        title: "End SOS — Verified Stop",
        teaser:
          "When protection is active, ending SOS can require a stronger confirmation so emergency protection is not stopped by mistake.",
      },
      {
        id: "end-visit-verify",
        src: "/hero/end-visit-verify.png",
        kind: "device",
        title: "End Visit — Confirmed Finish",
        teaser:
          "Visit completion can use a confirmation-first flow so safety sessions end with intent, not accidental taps.",
      },
      {
        id: "vpn-safety-gate",
        src: "/hero/vpn-safety-gate.png",
        kind: "device",
        title: "VPN Safety Gate",
        teaser:
          "StayKnown protects location reliability by warning or blocking flows when VPN usage can reduce safety accuracy.",
      },
      {
        id: "secure-chat-biometric",
        src: "/hero/secure-chat-biometric.png",
        kind: "device",
        title: "Secure Chat Protection",
        teaser:
          "StayKnown Chat can work with biometric or device-level protection so private safety conversations stay harder to access.",
      },
      {
        id: "chat-translation",
        src: "/hero/chat-translation.png",
        kind: "device",
        title: "Language-Aware Chat",
        teaser:
          "StayKnown Chat is built for multilingual communication with translation-aware message handling and recipient language preferences.",
      },
      {
        id: "chat-stickers-voice",
        src: "/hero/chat-stickers-voice.png",
        kind: "device",
        title: "Voice Notes + Stickers",
        teaser:
          "Users can send voice notes, custom stickers, voice stickers, music stickers, video stickers, media, and expressive chat content while the safety-first chat layer stays polished.",
      },
      {
        id: "contact-approval",
        src: "/hero/contact-approval.png",
        kind: "device",
        title: "Consent-Based Contacts",
        teaser:
          "Emergency contacts and SOS responders use approval flows so safety access remains intentional, trusted, and auditable.",
      },
      {
        id: "safety-gallery",
        src: "/hero/safety-gallery.png",
        kind: "device",
        title: "Safety Gallery",
        teaser:
          "Profile and safety images help trusted contacts recognize the user during Visits, SOS alerts, and safety communication.",
      },
      {
        id: "stories-profile",
        src: "/hero/stories-profile.png",
        kind: "device",
        title: "Stories + Profile Trust",
        teaser:
          "Stories, avatars, names, and profile surfaces help users recognize who they are connecting with before conversations begin.",
      },
    ],
    [],
  );

  return (
    <main className="min-h-screen bg-black flex flex-col">
      {/* Brand */}
      <header className="relative z-50 pt-7">
        <div className="mx-auto grid max-w-6xl grid-cols-[44px_1fr_44px] items-center px-4">
          <div />

          <div className="flex flex-col items-center gap-2">
            <Image
              src="/6logo.png"
              alt="StayKnown"
              width={34}
              height={34}
              priority
            />
            <div className="text-white font-extrabold tracking-[0.28em] text-[12px]">
              STAYKNOWN
            </div>
          </div>

          <div className="flex justify-end">
            <StayKnownActionMenu />
          </div>
        </div>
      </header>

      {/* HERO ONLY */}
      <section className="w-full flex-1">
        <div className="mx-auto max-w-6xl px-4 pt-5">
          <HeroSlider slides={slides} intervalMs={6000} />
        </div>

        <div className="h-8 sm:h-10" />
      </section>

      {/* Footer */}
      <footer className="w-full">
        <div className="mx-auto max-w-6xl px-4 pb-7 sm:pb-10">
          <div className="h-px bg-white/[0.08]" />

          <div className="mt-6 sm:mt-8 flex flex-col items-center gap-3 text-center">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] sm:text-[12px] font-semibold text-white/45 leading-relaxed">
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Privacy Policy
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Terms of Service
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/location-safety"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Location &amp; Live Safety
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/contact-consent"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Contact Consent
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/acceptable-use"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Acceptable Use
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/safety"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Safety &amp; Anti-Stalking
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/emergency"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Emergency Disclaimer
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/minors"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Child Safety &amp; Minor Use
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/abuse"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Abuse Reporting
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/retention"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Data Retention
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/law"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Law Enforcement Requests
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/security"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Security Disclosure
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/billing-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Billing &amp; Refunds
              </a>
            </div>

            <div className="text-[12px] font-semibold text-white/50">
              A 6 Clement Joshua service
              <span className="text-white/25 ml-1 align-super text-[10px]">
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
