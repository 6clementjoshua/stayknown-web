"use client";

import Image from "next/image";
import { useMemo } from "react";
import HeroSlider, { type HeroSlide } from "../components/HeroSlider";

export default function Page() {
  const slides: HeroSlide[] = useMemo(
    () => [
      {
        id: "visit-live-sos",
        src: "/hero/visit-live-sos.png",
        kind: "device",
        title: "Live Visit + SOS Ready",
        teaser:
          "When a visit starts, Live mode turns on — with SOS on standby to escalate quickly if needed.",
      },
      {
        id: "visit-live",
        src: "/hero/visit-live.png",
        kind: "device",
        title: "Live Location Emitter",
        teaser:
          "Live updates occur only during an active visit. End the visit and sharing stops immediately.",
      },
      {
        id: "promax-shell",
        src: "/hero/promax-shell.png",
        kind: "device",
        title: "ProMax MainShell",
        teaser:
          "A collapsed premium shell — calmer navigation that feels like hardware, while keeping safety one tap away.",
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
        <div className="mx-auto max-w-6xl px-4 pt-6">
          <HeroSlider slides={slides} intervalMs={6000} />
        </div>
      </section>

      {/* ✅ MOBILE: add more breathing room before footer so caption never overlaps */}
      <section className="h-44 sm:h-28 md:h-32 lg:h-40" />

      {/* FOOTER */}
      <footer className="w-full">
        <div className="mx-auto max-w-6xl px-4 pb-10">
          <div className="h-px bg-white/[0.08]" />

          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[12px] font-semibold text-white/45 leading-relaxed">
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

            {/* Trademark dim */}
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