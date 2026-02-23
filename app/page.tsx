"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import HeroSlider, { type HeroSlide } from "../components/HeroSlider";

export default function Page() {
  // ✅ Put these 3 new images in: /public/hero/
  //   1) /public/hero/end-sos-verify.png
  //   2) /public/hero/end-visit-verify.png
  //   3) /public/hero/secure-chat-passcode.png
  const slides: HeroSlide[] = useMemo(
    () => [
      {
        id: "end-sos-verify",
        src: "/hero/end-sos-verify.png",
        kind: "device",
        title: "End SOS — Verified Stop (Pro / ProMax)",
        teaser:
          "If verification is enabled, ending SOS requires confirmation (biometric/PIN or your chosen lock) to prevent accidental or forced stops.",
      },
      {
        id: "end-visit-verify",
        src: "/hero/end-visit-verify.png",
        kind: "device",
        title: "End Visit — Verified Stop",
        teaser:
          "Same protection for normal visits: when verification is enabled, Live sharing can only be stopped after a secure confirmation.",
      },
      {
        id: "secure-chat-passcode",
        src: "/hero/secure-chat-passcode.png",
        kind: "device",
        title: "Secure Chat Access",
        teaser:
          "New chats require a time-boxed passcode sent to the recipient’s email. Requests include identity + safety context, plus a labeled image (Live Capture or Gallery).",
      },
    ],
    []
  );

  return (
    <main className="min-h-screen bg-black flex flex-col">
      {/* Brand */}
      <header className="pt-7">
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-center">
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
        </div>
      </header>

      {/* HERO */}
      <section className="w-full">
        <div className="mx-auto max-w-6xl px-4 pt-5">
          <HeroSlider slides={slides} intervalMs={6000} />
        </div>

        {/* ✅ Mobile safety spacing (prevents device hitting CTA/footer) */}
        <div className="h-10 sm:h-0" />
      </section>

      {/* CTA (only button on page) */}
      <section className="w-full">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mt-2 sm:mt-4 flex items-center justify-center">
            <Link
              href="/learn-more"
              className={[
                "inline-flex items-center justify-center select-none",
                "h-10 px-5 rounded-full",
                "border border-white/14 bg-white/[0.06] backdrop-blur-md",
                "text-[12px] sm:text-[13px] font-semibold tracking-[0.14em] uppercase",
                "text-white/85 hover:text-white hover:border-white/24 hover:bg-white/[0.09]",
                "transition-all duration-200",
                "shadow-[0_10px_30px_rgba(0,0,0,0.55)]",
              ].join(" ")}
              aria-label="Learn more about verification and secure chat flows"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Gap before footer */}
      <section className="h-8 sm:h-10 md:h-12 lg:h-14" />

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
                Terms of Use
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
                Law Enforcement
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