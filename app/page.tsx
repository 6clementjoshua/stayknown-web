"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import HeroSlider, { type HeroSlide } from "../components/HeroSlider";
import StayKnownActionMenu from "@/components/StayKnownActionMenu";

type StoreKind = "google" | "apple";

type CinematicHeroSlide = {
  id: string;
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  objectPosition?: string;
};

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

  const closeFeedback = () => {
    setActiveStore(null);
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
        <a
          href="https://play.google.com/store/apps/details?id=com.stayknown.app"
          target="_blank"
          rel="noopener noreferrer"
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
          aria-label="Download StayKnown on Google Play"
        >
          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_35%_18%,rgba(255,255,255,0.2),transparent_58%)] opacity-80" />
          <span className="relative">
            <GooglePlayMark />
          </span>
          <span className="relative text-[9.5px] font-black tracking-[-0.01em] leading-none">
            Google Play
          </span>
        </a>
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
        <>
          <button
            type="button"
            aria-label="Dismiss launch notice"
            className="fixed inset-0 z-[60] cursor-default bg-transparent"
            onPointerDown={closeFeedback}
          />

          <div
            className="
              sk-download-feedback sk-launch-feedback
              relative z-[70] mt-3 w-[min(92vw,430px)] overflow-hidden rounded-[24px]
              border border-white/70 bg-white text-black
              shadow-[0_24px_80px_rgba(0,0,0,0.55)]
            "
          >
            <div className="relative p-4 sm:p-5">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(0,0,0,0.06),transparent_52%)]" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white" />

              <button
                type="button"
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  closeFeedback();
                }}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  closeFeedback();
                }}
                className="
                  absolute right-3 top-3 z-[5] flex h-9 w-9 items-center justify-center rounded-full
                  bg-black/[0.055] text-[18px] font-black !text-black/55
                  transition hover:bg-black/10 hover:!text-black
                  active:scale-[0.96] active:bg-black/15
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
                    className="
                      sk-tiktok-launch-link
                      font-black !text-black underline decoration-black/25 underline-offset-4
                      transition hover:decoration-black
                      visited:!text-black active:!text-black focus:!text-black
                    "
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
                      sk-launch-support
                      mt-3 inline-flex h-9 min-w-[176px] items-center justify-center rounded-full
                      bg-black px-5 text-[11px] font-black tracking-[-0.01em] !text-white
                      shadow-[0_12px_28px_rgba(0,0,0,0.18)]
                      transition duration-200
                      hover:bg-black/85 hover:!text-white
                      active:bg-white active:!text-black active:scale-[0.99]
                      visited:!text-white focus:!text-white
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20
                    "
                  >
                    Support StayKnown
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function CinematicHeroSection({ slides }: { slides: CinematicHeroSlide[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[activeIndex] ?? slides[0];

  return (
    <section
      className="
        relative isolate w-full overflow-hidden bg-black
        min-h-[650px] h-[calc(100svh-94px)]
        sm:min-h-[690px] md:min-h-[720px] lg:min-h-[760px]
      "
      aria-label="StayKnown story introduction"
    >
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`
              absolute inset-0 transition-opacity duration-[1100ms] ease-out
              ${index === activeIndex ? "opacity-100" : "opacity-0"}
            `}
            aria-hidden={index !== activeIndex}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
              style={{
                objectPosition: slide.objectPosition ?? "center center",
              }}
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.62)_0%,rgba(0,0,0,0.18)_34%,rgba(0,0,0,0.52)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_70%,rgba(0,0,0,0.72),transparent_52%)]" />
      <div className="absolute inset-y-0 left-0 hidden w-[58%] bg-[linear-gradient(90deg,rgba(0,0,0,0.75),rgba(0,0,0,0.28),transparent)] md:block" />

      <div
        className="
          relative z-10 mx-auto flex h-full max-w-6xl items-end px-4 pb-7
          sm:px-5 sm:pb-9 md:items-center md:pb-0 lg:px-6
        "
      >
        <div
          className="
            sk-cinematic-card
            w-full max-w-[560px] overflow-hidden rounded-[30px]
            border border-white/18 bg-black/42 p-5 text-white
            shadow-[0_28px_90px_rgba(0,0,0,0.55)]
            backdrop-blur-2xl
            sm:p-6 md:rounded-[36px] md:p-7
          "
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.16),transparent_48%)]" />

          <div className="relative">
            <div
              className="
                inline-flex h-8 items-center rounded-full border border-white/14
                bg-white/[0.08] px-3 text-[10px] font-black uppercase
                tracking-[0.24em] text-white/72
              "
            >
              {activeSlide.eyebrow}
            </div>

            <h1
              className="
                mt-4 max-w-[12ch] text-[42px] font-black leading-[0.92]
                tracking-[-0.075em] text-white
                sm:text-[56px] md:text-[64px] lg:text-[70px]
              "
            >
              {activeSlide.title}
            </h1>

            <p
              className="
                mt-4 max-w-[48ch] text-[14px] font-semibold leading-relaxed
                text-white/76 sm:text-[15px] md:text-[16px]
              "
            >
              {activeSlide.body}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={activeSlide.href}
                className="
    inline-flex h-12 items-center justify-center rounded-full
    bg-white px-6 text-[13px] font-black tracking-[-0.01em]
    !text-black shadow-[0_18px_50px_rgba(0,0,0,0.3)]
    transition hover:bg-white/88 active:scale-[0.99]
    visited:!text-black focus:!text-black
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35
  "
              >
                Learn More
              </a>
            </div>

            <div className="mt-6 flex items-center gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`
                    h-2.5 rounded-full transition-all duration-300
                    ${
                      index === activeIndex
                        ? "w-9 bg-white"
                        : "w-2.5 bg-white/35 hover:bg-white/60"
                    }
                  `}
                  aria-label={`Show StayKnown hero slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StayKnownIntroSection() {
  return (
    <section id="stayknown-intro" className="relative z-10 bg-black">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-5 sm:py-16 lg:px-6 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="text-[10px] font-black uppercase tracking-[0.28em] text-white/38">
            Why StayKnown exists
          </div>

          <h2 className="mt-4 text-[34px] font-black leading-[0.98] tracking-[-0.065em] text-white sm:text-[46px] md:text-[56px]">
            Safety should begin before danger becomes a headline.
          </h2>

          <p className="mt-5 text-[14px] font-semibold leading-relaxed text-white/58 sm:text-[15px] md:text-[16px]">
            StayKnown is built for real life: travel, school, family movement,
            visits, night outings, ride-hailing, emergencies, and moments where
            trusted people need to know that someone is safe.
          </p>
        </div>

        <div className="mt-9 grid gap-4 md:grid-cols-3">
          <div className="rounded-[28px] border border-white/[0.09] bg-white/[0.045] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.32)]">
            <div className="text-[12px] font-black uppercase tracking-[0.2em] text-white/40">
              Consent First
            </div>
            <h3 className="mt-3 text-[22px] font-black tracking-[-0.045em] text-white">
              Not a spying app.
            </h3>
            <p className="mt-3 text-[13px] font-semibold leading-relaxed text-white/55">
              StayKnown is built around approved contacts, intentional safety
              sharing, privacy notices, and trusted access.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/[0.09] bg-white/[0.045] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.32)]">
            <div className="text-[12px] font-black uppercase tracking-[0.2em] text-white/40">
              Real Movement
            </div>
            <h3 className="mt-3 text-[22px] font-black tracking-[-0.045em] text-white">
              Visits, trips, and daily life.
            </h3>
            <p className="mt-3 text-[13px] font-semibold leading-relaxed text-white/55">
              From school runs to travel and visits, StayKnown helps trusted
              people understand safety context when it matters.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/[0.09] bg-white/[0.045] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.32)]">
            <div className="text-[12px] font-black uppercase tracking-[0.2em] text-white/40">
              Emergency Ready
            </div>
            <h3 className="mt-3 text-[22px] font-black tracking-[-0.045em] text-white">
              Help should not wait.
            </h3>
            <p className="mt-3 text-[13px] font-semibold leading-relaxed text-white/55">
              SOS, I’m Safe, safety evidence, and emergency contacts make
              response clearer when someone may need help.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  const storySlides: CinematicHeroSlide[] = useMemo(
    () => [
      {
        id: "safe-journey-bus",
        src: "/hero/stayknown-safe-journey-bus.png",
        alt: "A Nigerian journey scene viewed from inside a bus",
        eyebrow: "StayKnown Safety",
        title: "Stay safer wherever life takes you.",
        body: "StayKnown helps people stay connected to trusted loved ones while moving, traveling, visiting, entering vehicles, or facing uncertain situations.",
        href: "/learn/safe-journey",
        objectPosition: "center center",
      },
      {
        id: "family-farewell",
        src: "/hero/stayknown-family-farewell.png",
        alt: "A family saying goodbye to a loved one before a journey",
        eyebrow: "Trusted People",
        title: "When someone leaves, care should not stop.",
        body: "From family send-offs to everyday movement, StayKnown helps make awareness, safety proof, and emergency readiness part of real life.",
        href: "/learn/family-safety",
        objectPosition: "center center",
      },
    ],
    [],
  );
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
          scroll-behavior: smooth;
        }

        #stayknown-intro,
        #app-preview {
          scroll-margin-top: 92px;
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

        .sk-cinematic-card {
          position: relative;
        }

        .sk-download-feedback {
          animation: skDownloadFeedbackIn 240ms cubic-bezier(0.2, 0.8, 0.2, 1)
            both;
        }

        .sk-launch-feedback a,
        .sk-launch-feedback a:link,
        .sk-launch-feedback a:visited,
        .sk-launch-feedback a:hover,
        .sk-launch-feedback a:focus {
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
        }

        .sk-launch-feedback .sk-launch-support,
        .sk-launch-feedback .sk-launch-support:link,
        .sk-launch-feedback .sk-launch-support:visited,
        .sk-launch-feedback .sk-launch-support:hover,
        .sk-launch-feedback .sk-launch-support:focus {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
        }

        .sk-launch-feedback .sk-launch-support:active {
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
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
      <header className="relative z-50 bg-black/92 pt-5 sm:pt-6">
        <div className="relative mx-auto flex max-w-6xl items-center justify-center px-2 pb-4">
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

      {/* Cinematic Story Hero */}
      <CinematicHeroSection slides={storySlides} />

      {/* Emotional Explanation */}
      <StayKnownIntroSection />

      {/* App Preview */}
      <section id="app-preview" className="w-full bg-black">
        <div className="mx-auto max-w-6xl px-5 pb-10 pt-4 sm:px-4 sm:pb-12 sm:pt-6 md:pt-8">
          <div className="mx-auto mb-6 max-w-3xl text-center">
            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-white/38">
              Inside the app
            </div>

            <h2 className="mt-3 text-[30px] font-black leading-[1] tracking-[-0.06em] text-white sm:text-[42px] md:text-[52px]">
              Built for movement, trust, SOS, visits, and approved contacts.
            </h2>
          </div>

          <HeroSlider slides={slides} intervalMs={6000} />

          <div className="mt-4 sm:mt-5">
            <DownloadStoreButtons />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 w-full bg-black">
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
