"use client";

function GooglePlayMark() {
  return (
    <svg
      viewBox="0 0 512 512"
      aria-hidden="true"
      className="h-[18px] w-[18px] shrink-0 sm:h-5 sm:w-5"
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

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 shrink-0 transition duration-300 group-hover:translate-x-0.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export default function StayKnownRecognitionPill() {
  return (
    <div className="border-t border-white/[0.07] bg-black px-3 py-1.5 sm:px-5">
      <a
        href="/recognition/google-play-indie-corner"
        aria-label="Read about StayKnown's Google Play Indie Corner nomination"
        className="sk-recognition-pill group relative mx-auto flex min-h-[38px] w-full max-w-[620px] items-center gap-2.5 overflow-hidden rounded-full border border-white/90 bg-white px-3 py-[4px] text-black shadow-[0_10px_28px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,1),inset_0_-5px_12px_rgba(0,0,0,0.075)] transition duration-300 hover:-translate-y-px hover:border-white/20 hover:bg-[#101010] hover:text-white active:translate-y-0 active:scale-[0.992] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 sm:min-h-[40px] sm:px-3.5"
      >
        <span className="pointer-events-none absolute inset-x-6 top-0 z-[1] h-px bg-white" />

        <span className="sk-recognition-liquid sk-recognition-liquid-one pointer-events-none absolute -left-[16%] top-1/2 h-[46px] w-[48%] -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.18),rgba(95,95,95,0.11)_38%,rgba(255,255,255,0)_72%)] blur-[7px]" />
        <span className="sk-recognition-liquid sk-recognition-liquid-two pointer-events-none absolute -right-[14%] top-1/2 h-[44px] w-[46%] -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.96),rgba(135,135,135,0.14)_42%,rgba(255,255,255,0)_74%)] blur-[6px]" />
        <span className="sk-recognition-wave pointer-events-none absolute inset-y-0 left-[-34%] w-[72%] rounded-[50%] bg-[linear-gradient(105deg,transparent_0%,rgba(0,0,0,0.06)_30%,rgba(255,255,255,0.82)_50%,rgba(70,70,70,0.09)_68%,transparent_100%)] blur-[2px]" />

        <span className="relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[12px] border border-black/[0.07] bg-[linear-gradient(145deg,#ffffff,#e9e9e9)] shadow-[inset_0_1px_0_rgba(255,255,255,1),0_5px_11px_rgba(0,0,0,0.12)]">
          <GooglePlayMark />
        </span>

        <span className="relative z-10 min-w-0 flex-1">
          <span className="block truncate text-[10px] font-black uppercase tracking-[0.15em] text-black/52 transition group-hover:text-white/52 sm:text-[10.5px]">
            Recognized by Google Play
          </span>
          <span className="mt-0.5 block truncate text-[12px] font-black tracking-[-0.025em] text-black transition group-hover:text-white sm:text-[13px]">
            Indie Corner nomination
          </span>
        </span>

        <span className="relative z-10 hidden rounded-full border border-black/[0.08] bg-black/[0.035] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-black/56 transition group-hover:border-white/[0.14] group-hover:bg-white/[0.06] group-hover:text-white/66 sm:inline-flex">
          Our story
        </span>

        <span className="relative z-10 flex">
          <ArrowIcon />
        </span>
      </a>

      <style jsx>{`
        .sk-recognition-liquid,
        .sk-recognition-wave {
          opacity: 1;
          transition: opacity 220ms ease;
          will-change: transform, opacity;
        }

        .sk-recognition-liquid-one {
          animation: sk-recognition-liquid-one 7.4s ease-in-out infinite;
        }

        .sk-recognition-liquid-two {
          animation: sk-recognition-liquid-two 8.6s ease-in-out infinite;
        }

        .sk-recognition-wave {
          animation: sk-recognition-wave 6.8s ease-in-out infinite;
        }

        .sk-recognition-pill:hover .sk-recognition-liquid,
        .sk-recognition-pill:hover .sk-recognition-wave {
          opacity: 0;
          animation-play-state: paused;
        }

        @keyframes sk-recognition-liquid-one {
          0%,
          100% {
            transform: translate3d(-7%, -50%, 0) scaleX(0.88) scaleY(0.82);
          }
          48% {
            transform: translate3d(116%, -47%, 0) scaleX(1.18) scaleY(1.08);
          }
          72% {
            transform: translate3d(74%, -54%, 0) scaleX(0.94) scaleY(1.2);
          }
        }

        @keyframes sk-recognition-liquid-two {
          0%,
          100% {
            transform: translate3d(5%, -50%, 0) scaleX(1.02) scaleY(0.9);
          }
          44% {
            transform: translate3d(-120%, -55%, 0) scaleX(0.9) scaleY(1.16);
          }
          74% {
            transform: translate3d(-68%, -46%, 0) scaleX(1.16) scaleY(0.86);
          }
        }

        @keyframes sk-recognition-wave {
          0%,
          100% {
            transform: translate3d(-8%, 0, 0) skewX(-9deg) scaleX(0.86);
            opacity: 0.38;
          }
          50% {
            transform: translate3d(172%, 0, 0) skewX(7deg) scaleX(1.08);
            opacity: 0.72;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sk-recognition-pill,
          .sk-recognition-pill * {
            transition: none !important;
            animation: none !important;
          }

          .sk-recognition-liquid,
          .sk-recognition-wave {
            opacity: 0.22;
          }

          .sk-recognition-pill:hover .sk-recognition-liquid,
          .sk-recognition-pill:hover .sk-recognition-wave {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
