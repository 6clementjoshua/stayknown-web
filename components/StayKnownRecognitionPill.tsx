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
    <div className="border-t border-white/[0.07] bg-black px-3 py-2 sm:px-5">
      <a
        href="/recognition/google-play-indie-corner"
        aria-label="Read about StayKnown's Google Play Indie Corner nomination"
        className="sk-recognition-pill group relative mx-auto flex min-h-[44px] w-full max-w-[620px] items-center gap-3 overflow-hidden rounded-[16px] border border-white/90 bg-white px-3.5 py-2 text-black shadow-[0_12px_34px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,1),inset_0_-6px_14px_rgba(0,0,0,0.08)] transition duration-300 hover:-translate-y-px hover:border-white/25 hover:bg-[#101010] hover:text-white active:translate-y-0 active:scale-[0.992] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 sm:min-h-[48px] sm:px-4"
      >
        <span className="pointer-events-none absolute inset-x-5 top-0 h-px bg-white" />
        <span className="sk-recognition-shine pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 rotate-12 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.72),transparent)] opacity-0" />

        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] border border-black/[0.07] bg-[linear-gradient(145deg,#ffffff,#e9e9e9)] shadow-[inset_0_1px_0_rgba(255,255,255,1),0_6px_13px_rgba(0,0,0,0.12)]">
          <GooglePlayMark />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[10px] font-black uppercase tracking-[0.15em] text-black/52 transition group-hover:text-white/52 sm:text-[10.5px]">
            Recognized by Google Play
          </span>
          <span className="mt-0.5 block truncate text-[12px] font-black tracking-[-0.025em] text-black transition group-hover:text-white sm:text-[13px]">
            Indie Corner nomination
          </span>
        </span>

        <span className="hidden rounded-full border border-black/[0.08] bg-black/[0.035] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-black/56 transition group-hover:border-white/[0.14] group-hover:bg-white/[0.06] group-hover:text-white/66 sm:inline-flex">
          Our story
        </span>

        <ArrowIcon />
      </a>

      <style jsx>{`
        .sk-recognition-pill:hover .sk-recognition-shine {
          animation: sk-recognition-shine 760ms ease-out;
        }

        @keyframes sk-recognition-shine {
          0% {
            left: -36%;
            opacity: 0;
          }
          18% {
            opacity: 0.65;
          }
          100% {
            left: 116%;
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sk-recognition-pill,
          .sk-recognition-pill * {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
