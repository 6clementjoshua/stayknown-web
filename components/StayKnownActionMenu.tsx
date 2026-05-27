"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
    href: "/donate",
    title: "Support StayKnown",
    body: "Donate to help expand backend systems, live safety infrastructure, language translation, and product growth.",
  },
  {
    href: "/help-center",
    title: "Help Center",
    body: "Search answers about safety, visits, SOS, contacts, chat, billing, privacy, account help, and troubleshooting.",
  },
  {
    href: "/trust-safety",
    title: "Trust & Safety",
    body: "See how StayKnown protects users with consent-first sharing, approved contacts, SOS rules, abuse prevention, privacy, and security.",
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

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

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
  const [mounted, setMounted] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    if (open) {
      document.documentElement.setAttribute("data-sk-menu-open", "true");
      document.body.setAttribute("data-sk-menu-open", "true");
    } else {
      document.documentElement.removeAttribute("data-sk-menu-open");
      document.body.removeAttribute("data-sk-menu-open");
    }

    return () => {
      document.documentElement.removeAttribute("data-sk-menu-open");
      document.body.removeAttribute("data-sk-menu-open");
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (wrapRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;

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

  const modal = open ? (
    <>
      <button
        type="button"
        aria-label="Close StayKnown menu"
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-[2147483600] cursor-default",
          "bg-black/78 backdrop-blur-[7px]",
          "md:bg-black/58 md:backdrop-blur-[5px]",
        )}
      />

      <div
        ref={panelRef}
        className={cn(
          "fixed inset-x-3 top-[74px] z-[2147483601]",
          "max-h-[calc(100dvh-92px)] overflow-y-auto overscroll-contain",
          "origin-top animate-[skMenuIn_0.18s_ease-out_both]",
          "rounded-[1.65rem]",
          "border border-white/12 bg-black/[0.92]",
          "p-2 shadow-2xl shadow-black/90 backdrop-blur-2xl",
          "ring-1 ring-white/[0.05]",
          "md:left-auto md:right-4 md:top-[74px] md:w-[390px]",
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.13),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.055),transparent_34%)]" />

        <div className="relative px-3 pb-2 pt-3">
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white/35">
            StayKnown
          </div>
          <div className="mt-1 text-[14px] font-black tracking-[-0.02em] text-white/92">
            Quick actions
          </div>
        </div>

        <div className="relative grid gap-1.5">
          {menuItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "group flex items-start justify-between gap-3",
                "rounded-[1.25rem] px-3 py-3",
                "border border-transparent",
                "transition hover:border-white/10 hover:bg-white/[0.06]",
                "active:bg-white/[0.075]",
              )}
            >
              <span>
                <span className="block text-[13px] font-black text-white/92">
                  {item.title}
                </span>
                <span className="mt-1 block text-[12px] font-semibold leading-relaxed text-white/48">
                  {item.body}
                </span>
              </span>

              <span
                className={cn(
                  "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full",
                  "border border-white/10 bg-black/35 text-white/42",
                  "transition group-hover:translate-x-0.5 group-hover:border-white/18 group-hover:bg-white/[0.075] group-hover:text-white/82",
                  "group-active:bg-white/[0.09] group-active:text-white",
                )}
              >
                <ArrowIcon className="h-4 w-4" />
              </span>
            </a>
          ))}
        </div>

        <div className="relative mt-2 border-t border-white/10 px-3 py-3">
          <p className="text-[11px] font-semibold leading-relaxed text-white/34">
            Start with the Help Center before contacting support. Use every
            StayKnown page responsibly; abusive, unlawful, threatening,
            fraudulent, spam, or irrelevant contact may be reviewed.
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

        html[data-sk-menu-open="true"] button[aria-label="Previous slide"],
        html[data-sk-menu-open="true"] button[aria-label="Next slide"],
        html[data-sk-menu-open="true"] button[aria-label^="Go to slide"],
        html[data-sk-menu-open="true"] a[href^="/learn"] {
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          transform: scale(0.96) !important;
          transition:
            opacity 120ms ease,
            visibility 120ms ease,
            transform 120ms ease !important;
        }

        body[data-sk-menu-open="true"] button[aria-label="Previous slide"],
        body[data-sk-menu-open="true"] button[aria-label="Next slide"],
        body[data-sk-menu-open="true"] button[aria-label^="Go to slide"],
        body[data-sk-menu-open="true"] a[href^="/learn"] {
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          transform: scale(0.96) !important;
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
  ) : null;

  return (
    <div ref={wrapRef} className="relative z-[2147483601]">
      <button
        type="button"
        aria-label="Open StayKnown menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "grid h-10 w-10 place-items-center rounded-full",
          "border border-transparent bg-transparent text-white/90",
          "shadow-none backdrop-blur-0",
          "transition hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.055] hover:text-white active:scale-[0.97]",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/[0.055]",
        )}
      >
        <DotsIcon className="h-6 w-6" />
      </button>

      {mounted && modal ? createPortal(modal, document.body) : null}
    </div>
  );
}
