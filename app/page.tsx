"use client";

import Image from "next/image";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import HeroSlider, { type HeroSlide } from "../components/HeroSlider";
import StayKnownActionMenu from "@/components/StayKnownActionMenu";

const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.stayknown.app";

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

function GooglePlayDownloadButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={GOOGLE_PLAY_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Download StayKnown on Google Play"
      className={`
        sk-google-play-button group inline-flex h-[52px] min-w-[184px]
        items-center justify-center gap-3 rounded-[18px]
        border border-white/85 bg-white px-5
        !text-black shadow-[0_18px_50px_rgba(0,0,0,0.34)]
        transition duration-200
        hover:border-white hover:bg-white/92 hover:!text-black
        active:scale-[0.985] active:bg-white active:!text-black
        visited:!text-black focus:!text-black
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-white/35 ${className}
      `}
    >
      <span
        className="
          flex h-8 w-8 shrink-0 items-center justify-center
          rounded-[10px] bg-black/[0.045]
        "
      >
        <GooglePlayMark />
      </span>

      <span className="flex flex-col items-start leading-none">
        <span
          className="
            sk-google-play-kicker text-[8px] font-black uppercase
            tracking-[0.16em]
          "
        >
          Get it on
        </span>

        <span
          className="
            sk-google-play-label mt-1 text-[14px] font-black
            tracking-[-0.035em]
          "
        >
          Google Play
        </span>
      </span>
    </a>
  );
}

function RevealOnScroll({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;

        setVisible(true);
        observer.unobserve(entry.target);
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      className={`sk-scroll-reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
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

            <div
              className="
                mt-6 flex flex-col gap-3
                sm:flex-row sm:items-center sm:justify-between
              "
            >
              <a
                href={activeSlide.href}
                className="
                  inline-flex h-12 items-center justify-center rounded-full
                  bg-white px-6 text-[13px] font-black tracking-[-0.01em]
                  !text-black shadow-[0_18px_50px_rgba(0,0,0,0.30)]
                  transition duration-200
                  hover:bg-white/90 hover:!text-black
                  active:scale-[0.99] active:!text-black
                  visited:!text-black focus:!text-black
                  focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-white/35
                "
              >
                Learn More
              </a>

              <GooglePlayDownloadButton className="w-full sm:w-auto" />
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
        <RevealOnScroll className="mx-auto max-w-3xl text-center">
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
        </RevealOnScroll>

        <div className="mt-9 grid gap-4 md:grid-cols-3">
          <RevealOnScroll delay={40} className="h-full">
            <div className="h-full rounded-[28px] border border-white/[0.09] bg-white/[0.045] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.32)]">
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
          </RevealOnScroll>

          <RevealOnScroll delay={120} className="h-full">
            <div className="h-full rounded-[28px] border border-white/[0.09] bg-white/[0.045] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.32)]">
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
          </RevealOnScroll>

          <RevealOnScroll delay={200} className="h-full">
            <div className="h-full rounded-[28px] border border-white/[0.09] bg-white/[0.045] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.32)]">
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
          </RevealOnScroll>
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

        .sk-google-play-button,
        .sk-google-play-button:link,
        .sk-google-play-button:visited,
        .sk-google-play-button:hover,
        .sk-google-play-button:focus,
        .sk-google-play-button:active {
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
        }

        .sk-google-play-button .sk-google-play-kicker {
          color: rgba(0, 0, 0, 0.56) !important;
          -webkit-text-fill-color: rgba(0, 0, 0, 0.56) !important;
        }

        .sk-google-play-button:hover .sk-google-play-kicker,
        .sk-google-play-button:focus .sk-google-play-kicker {
          color: rgba(0, 0, 0, 0.68) !important;
          -webkit-text-fill-color: rgba(0, 0, 0, 0.68) !important;
        }

        .sk-google-play-button .sk-google-play-label,
        .sk-google-play-button:hover .sk-google-play-label,
        .sk-google-play-button:focus .sk-google-play-label {
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
        }

        .sk-scroll-reveal {
          opacity: 0;
          filter: blur(7px);
          transform: translate3d(0, 30px, 0) scale(0.988);
          transition:
            opacity 780ms cubic-bezier(0.2, 0.8, 0.2, 1),
            transform 900ms cubic-bezier(0.2, 0.8, 0.2, 1),
            filter 900ms cubic-bezier(0.2, 0.8, 0.2, 1);
          will-change: opacity, transform, filter;
        }

        .sk-scroll-reveal.is-visible {
          opacity: 1;
          filter: blur(0);
          transform: translate3d(0, 0, 0) scale(1);
        }

        @media (prefers-reduced-motion: reduce) {
          html,
          body {
            scroll-behavior: auto;
          }

          .sk-scroll-reveal,
          .sk-scroll-reveal.is-visible {
            opacity: 1;
            filter: none;
            transform: none;
            transition: none;
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
          <RevealOnScroll className="mx-auto mb-6 max-w-3xl text-center">
            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-white/38">
              Inside the app
            </div>

            <h2 className="mt-3 text-[30px] font-black leading-[1] tracking-[-0.06em] text-white sm:text-[42px] md:text-[52px]">
              Built for movement, trust, SOS, visits, and approved contacts.
            </h2>
          </RevealOnScroll>

          <RevealOnScroll delay={80}>
            <HeroSlider slides={slides} intervalMs={6000} />
          </RevealOnScroll>

          <RevealOnScroll
            delay={160}
            className="mt-5 flex justify-center sm:mt-6"
          >
            <GooglePlayDownloadButton className="w-full max-w-[230px] sm:w-auto" />
          </RevealOnScroll>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 w-full bg-black">
        <RevealOnScroll className="mx-auto max-w-6xl px-4 pb-8 pt-4 sm:pb-10 sm:pt-6">
          <div className="h-px bg-white/[0.08]" />

          <div className="mt-6 flex flex-col items-center gap-3 text-center sm:mt-8">
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
        </RevealOnScroll>
      </footer>
    </main>
  );
}
