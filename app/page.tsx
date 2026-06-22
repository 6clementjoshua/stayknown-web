"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import HeroSlider, { type HeroSlide } from "../components/HeroSlider";
import StayKnownActionMenu from "@/components/StayKnownActionMenu";

type StoreKind = "google" | "apple";

function GooglePlayMark() {
  return (
    <svg
      viewBox="0 0 512 512"
      aria-hidden="true"
      className="h-[18px] w-[18px] shrink-0"
    >
      <path
        d="M96 38.4v435.2c0 17.2 18.8 27.8 33.5 18.8l251.3-153.7L96 38.4z"
        fill="#34A853"
      />
      <path
        d="M96 38.4l284.8 300.3 68.2-41.7c22.7-13.9 22.7-46.8 0-60.7L380.8 194.6 96 38.4z"
        fill="#4285F4"
      />
      <path d="M96 38.4l284.8 156.2L294.2 256 96 38.4z" fill="#FBBC04" />
      <path
        d="M96 473.6 294.2 256l86.6 82.7L129.5 492.4C114.8 501.4 96 490.8 96 473.6z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppStoreMark() {
  return (
    <svg
      viewBox="0 0 384 512"
      aria-hidden="true"
      className="h-[18px] w-[18px] shrink-0"
    >
      <path
        fill="currentColor"
        d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.3-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.5-19.2-39.4.6-75.7 22.9-96 58.2-41 71.1-10.5 176.5 29.5 234.3 19.5 28.2 42.8 59.9 73.4 58.8 29.4-1.2 40.5-19 76-19s45.5 19 76.5 18.4c31.6-.6 51.6-28.8 71-57.2 22.4-32.7 31.6-64.4 32.1-66-.7-.3-61.8-23.7-62.2-94.6zM261.1 103.2c16.2-19.7 27.2-47.1 24.2-74.4-23.4.9-51.8 15.6-68.6 35.3-15.1 17.4-28.3 45.3-24.7 72 26.1 2 52.8-13.3 69.1-32.9z"
      />
    </svg>
  );
}

function DownloadStoreButtons() {
  const [activeStore, setActiveStore] = useState<StoreKind | null>(null);

  const openFeedback = (store: StoreKind) => {
    setActiveStore(store);
  };

  const storeLabel =
    activeStore === "google"
      ? "Google Play"
      : activeStore === "apple"
        ? "App Store"
        : "Store";

  return (
    <div className="relative z-30 mx-auto flex w-full flex-col items-center">
      <div className="flex items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={() => openFeedback("google")}
          className="
            group relative flex h-[54px] w-[86px] flex-col items-center justify-center gap-1
            overflow-hidden rounded-2xl border border-white/12 bg-white/[0.045]
            text-white shadow-[0_18px_50px_rgba(0,0,0,0.45)]
            transition duration-200
            hover:bg-white hover:text-black hover:border-white/30
            active:scale-[0.98]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25
            sm:h-[56px] sm:w-[92px]
          "
          aria-label="Google Play launch notice"
        >
          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_35%_18%,rgba(255,255,255,0.2),transparent_58%)] opacity-80" />
          <span className="relative">
            <GooglePlayMark />
          </span>
          <span className="relative text-[9.5px] font-black tracking-[-0.01em] leading-none">
            Google Play
          </span>
        </button>

        <button
          type="button"
          onClick={() => openFeedback("apple")}
          className="
            group relative flex h-[54px] w-[86px] flex-col items-center justify-center gap-1
            overflow-hidden rounded-2xl border border-white/12 bg-white/[0.045]
            text-white shadow-[0_18px_50px_rgba(0,0,0,0.45)]
            transition duration-200
            hover:bg-white hover:text-black hover:border-white/30
            active:scale-[0.98]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25
            sm:h-[56px] sm:w-[92px]
          "
          aria-label="App Store launch notice"
        >
          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_35%_18%,rgba(255,255,255,0.2),transparent_58%)] opacity-80" />
          <span className="relative">
            <AppStoreMark />
          </span>
          <span className="relative text-[9.5px] font-black tracking-[-0.01em] leading-none">
            App Store
          </span>
        </button>
      </div>

      {activeStore ? (
        <div
          className="
            sk-download-feedback
            mt-3 w-[min(92vw,430px)] overflow-hidden rounded-[24px]
            border border-white/70 bg-white text-black
            shadow-[0_24px_80px_rgba(0,0,0,0.55)]
          "
        >
          <div className="relative p-4 sm:p-5">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(0,0,0,0.06),transparent_52%)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white" />

            <button
              type="button"
              onClick={() => setActiveStore(null)}
              className="
                absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full
                bg-black/[0.055] text-[15px] font-black text-black/55
                transition hover:bg-black/10 hover:text-black
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15
              "
              aria-label="Close launch notice"
            >
              ×
            </button>

            <div className="relative pr-8">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-black/42">
                {storeLabel}
              </div>

              <div className="mt-1 text-[15px] sm:text-[16px] font-black tracking-[-0.035em] text-black">
                StayKnown will launch soon.
              </div>

              <p className="mt-2 text-[12.3px] sm:text-[12.8px] font-semibold leading-relaxed text-black/62">
                The app is not live on the stores yet. Please check back from
                time to time, or follow the official brand on TikTok{" "}
                <a
                  href="https://www.tiktok.com/@6clementjoshua"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-black text-black underline decoration-black/25 underline-offset-4 transition hover:decoration-black"
                >
                  @6clementjoshua
                </a>{" "}
                for the launch date.
              </p>

              <div className="mt-3 rounded-2xl border border-black/10 bg-black/[0.035] p-3">
                <p className="text-[11.8px] sm:text-[12.2px] font-semibold leading-relaxed text-black/58">
                  Anyone who would like to support the project can do so
                  respectfully through the support page.
                </p>

                <a
                  href="/donate"
                  className="
                    mt-2 inline-flex h-8 items-center justify-center rounded-full
                    bg-black px-4 text-[11px] font-black tracking-[-0.01em] text-white
                    transition hover:bg-black/85 active:scale-[0.99]
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20
                  "
                >
                  Support StayKnown
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

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
        id: "verification",
        src: "/hero/verification.png",
        kind: "device",
        title: "Verified Identity",
        teaser:
          "StayKnown verification helps people recognize verified individuals and organizations across safety, contacts, chat, stories, SOS, Visit, and trusted-contact flows.",
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
    <main className="min-h-screen bg-black flex flex-col overflow-x-hidden">
      <style jsx global>{`
        html,
        body {
          background: #000;
          color-scheme: dark;
          overflow-x: hidden;
        }

        .sk-menu-wrap > button,
        .sk-menu-wrap > div > button {
          background: transparent !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          box-shadow: none !important;
          border: 1px solid transparent !important;
          color: rgba(255, 255, 255, 0.92) !important;
        }

        .sk-menu-wrap > button:hover,
        .sk-menu-wrap > div > button:hover {
          background: rgba(255, 255, 255, 0.06) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          color: #ffffff !important;
        }

        .sk-menu-wrap > button:focus-visible,
        .sk-menu-wrap > div > button:focus-visible {
          outline: none !important;
          border-color: rgba(255, 255, 255, 0.16) !important;
          box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.05) !important;
        }

        .sk-download-feedback {
          animation: skDownloadFeedbackIn 240ms cubic-bezier(0.2, 0.8, 0.2, 1)
            both;
        }

        @keyframes skDownloadFeedbackIn {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      {/* Brand */}
      <header className="relative z-50 pt-5 sm:pt-6">
        <div className="relative mx-auto flex max-w-6xl items-center justify-center px-2">
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

          <div className="absolute right-[-3px] top-1/2 -translate-y-1/2 sm:right-[-18px] md:right-[-28px] lg:right-[-36px] xl:right-[-44px]">
            <div className="sk-menu-wrap">
              <StayKnownActionMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="w-full flex-1">
        <div className="mx-auto max-w-6xl px-5 pt-7 sm:px-4 sm:pt-7 md:pt-8">
          <HeroSlider slides={slides} intervalMs={6000} />

          <div className="mt-4 sm:mt-5">
            <DownloadStoreButtons />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 w-full">
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-4 sm:pb-10 sm:pt-6">
          <div className="h-px bg-white/[0.08]" />

          <div className="mt-6 sm:mt-8 flex flex-col items-center gap-3 text-center">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] sm:text-[12px] font-semibold text-white/42 leading-relaxed">
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
                href="/trust-safety"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Trust &amp; Safety
              </a>
              <span className="text-white/18">•</span>

              <a
                href="/verification-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Verification Policy
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
                href="/guardian-consent"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/75 transition"
              >
                Guardian Consent
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
                href="/creator-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white/75"
              >
                Creator Policy
              </a>

              <span className="text-white/18">•</span>
              <a
                href="/donor-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white/75"
              >
                Donor Policy
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
