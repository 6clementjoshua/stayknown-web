"use client";

import { useEffect, useRef, useState } from "react";

type MenuItem = {
  href: string;
  title: string;
  body: string;
};

const menuItems: MenuItem[] = [
  {
    href: "/about",
    title: "About StayKnown",
    body: "Learn what StayKnown is, who owns it, and what the safety platform is built for.",
  },
  {
    href: "/submit-request",
    title: "Submit a request",
    body: "Get help with account, safety, contacts, SOS, live map, chat, billing, wallet, or app issues.",
  },
  {
    href: "/submit-feature",
    title: "Submit an app feature",
    body: "Suggest a new safety feature, app improvement, UI upgrade, or product idea.",
  },
  {
    href: "/contact",
    title: "Contact us",
    body: "Send a responsible brand, product, support, partnership, or policy message.",
  },
];

function DotsIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 6.4h.01M12 12h.01M12 17.6h.01"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
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

export default function StayKnownActionMenu() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current) return;
      if (wrapRef.current.contains(event.target as Node)) return;
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative z-50">
      <button
        type="button"
        aria-label="Open StayKnown menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="
          grid h-11 w-11 place-items-center rounded-full
          border border-black/10 bg-white/78 text-zinc-950
          shadow-[0_18px_45px_rgba(0,0,0,0.10)]
          backdrop-blur-xl transition
          hover:-translate-y-0.5 hover:bg-white
          active:scale-[0.97]
          dark:border-white/10 dark:bg-white/[0.055] dark:text-white
          dark:shadow-[0_18px_45px_rgba(0,0,0,0.35)]
          dark:hover:bg-white/[0.085]
        "
      >
        <DotsIcon className="h-6 w-6" />
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close StayKnown menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-black/0 md:hidden"
          />

          <div
            className="
              fixed inset-x-3 top-[76px] z-50
              origin-top animate-[skMenuIn_0.18s_ease-out_both]
              overflow-hidden rounded-[1.65rem]
              border border-black/10 bg-white/92
              p-2 shadow-2xl shadow-black/15 backdrop-blur-2xl
              dark:border-white/10 dark:bg-zinc-950/92 dark:shadow-black/50

              md:absolute md:inset-auto md:right-0 md:top-[calc(100%+12px)]
              md:w-[360px]
            "
          >
            <div className="px-3 pb-2 pt-3">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-white/35">
                StayKnown
              </div>
              <div className="mt-1 text-[14px] font-black tracking-[-0.02em] text-zinc-950 dark:text-white/92">
                Quick actions
              </div>
            </div>

            <div className="grid gap-1.5">
              {menuItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="
                    group flex items-start justify-between gap-3
                    rounded-[1.25rem] px-3 py-3
                    transition
                    hover:bg-black/[0.045]
                    dark:hover:bg-white/[0.06]
                  "
                >
                  <span>
                    <span className="block text-[13px] font-black text-zinc-950 dark:text-white/90">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-[12px] font-semibold leading-relaxed text-zinc-600 dark:text-white/46">
                      {item.body}
                    </span>
                  </span>

                  <span
                    className="
                      mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full
                      border border-black/10 bg-white/70 text-zinc-500
                      transition group-hover:translate-x-0.5 group-hover:text-zinc-950
                      dark:border-white/10 dark:bg-white/[0.05] dark:text-white/35
                      dark:group-hover:text-white
                    "
                  >
                    <ArrowIcon className="h-4 w-4" />
                  </span>
                </a>
              ))}
            </div>

            <div className="mt-2 border-t border-black/10 px-3 py-3 dark:border-white/10">
              <p className="text-[11px] font-semibold leading-relaxed text-zinc-500 dark:text-white/32">
                Use these pages responsibly. StayKnown does not accept abusive,
                unlawful, threatening, fraudulent, spam, or irrelevant contact.
              </p>
            </div>
          </div>

          <style jsx global>{`
            @keyframes skMenuIn {
              from {
                opacity: 0;
                transform: translateY(-8px) scale(0.985);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }

            @media (prefers-reduced-motion: reduce) {
              * {
                animation-duration: 0.001ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.001ms !important;
              }
            }
          `}</style>
        </>
      ) : null}
    </div>
  );
}
