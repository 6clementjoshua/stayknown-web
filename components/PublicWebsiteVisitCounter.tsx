"use client";

import {
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

const SITE_VISIT_EVENT = "stayknown:site-visit-recorded";
const SUMMARY_REFRESH_MS = 20_000;

type VisitSummary = {
  totalVisits: string;
  todayVisits: string;
  trackedPublicRoutes: string;
  recordingStartedAt: string | null;
  lastRecordedAt: string | null;
};

type VisitRecordedDetail = {
  totalVisits?: unknown;
  todayVisits?: unknown;
  recordingStartedAt?: unknown;
  lastRecordedAt?: unknown;
};

type PublicWebsiteVisitCounterProps = {
  className?: string;
};

function safeCount(value: unknown): string {
  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    return value.trim().replace(/^0+(?=\d)/, "");
  }

  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.trunc(value).toString();
  }

  return "0";
}

function safeIsoDate(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const clean = value.trim();
  if (!clean || !Number.isFinite(Date.parse(clean))) {
    return null;
  }

  return new Date(clean).toISOString();
}

function parseSummary(value: unknown): VisitSummary | null {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const payload = value as Record<string, unknown>;

  if (payload.ok !== true) return null;

  return {
    totalVisits: safeCount(payload.totalVisits),
    todayVisits: safeCount(payload.todayVisits),
    trackedPublicRoutes: safeCount(payload.trackedPublicRoutes),
    recordingStartedAt: safeIsoDate(payload.recordingStartedAt),
    lastRecordedAt: safeIsoDate(payload.lastRecordedAt),
  };
}

function formatCount(value: string): string {
  try {
    return new Intl.NumberFormat("en-US").format(BigInt(value));
  } catch {
    return value;
  }
}

function formatDate(value: string | null): string {
  if (!value) return "Not available yet";

  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return "Not available yet";
  }
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[15px] w-[15px] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
    >
      <path d="m7 7 10 10" />
      <path d="M17 7 7 17" />
    </svg>
  );
}

/**
 * Mount this once in app/layout.tsx.
 *
 * It records one accepted opening for the current public pathname and records
 * again when client-side navigation opens another public pathname. It does not
 * render UI and does not store visitor identity in the browser.
 */
export function PublicWebsiteVisitTracker() {
  const pathname = usePathname();
  const lastRecordedPathRef = useRef<string | null>(null);

  useEffect(() => {
    const path = pathname?.trim();

    if (!path || lastRecordedPathRef.current === path) {
      return;
    }

    lastRecordedPathRef.current = path;

    const controller = new AbortController();

    async function recordVisit() {
      try {
        const response = await fetch("/api/site-visits", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({ path }),
          cache: "no-store",
          credentials: "same-origin",
          keepalive: true,
          signal: controller.signal,
        });

        if (!response.ok) return;

        const payload: unknown = await response.json();

        if (
          payload == null ||
          typeof payload !== "object" ||
          Array.isArray(payload)
        ) {
          return;
        }

        const detail = payload as VisitRecordedDetail;

        window.dispatchEvent(
          new CustomEvent<VisitRecordedDetail>(SITE_VISIT_EVENT, { detail }),
        );
      } catch {
        // Visit counting must never interrupt page navigation or rendering.
      }
    }

    void recordVisit();

    return () => controller.abort();
  }, [pathname]);

  return null;
}

export default function PublicWebsiteVisitCounter({
  className = "",
}: PublicWebsiteVisitCounterProps) {
  const [summary, setSummary] = useState<VisitSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const mountedRef = useRef(true);

  const loadSummary = useCallback(async () => {
    try {
      const response = await fetch("/api/site-visits", {
        method: "GET",
        headers: {
          accept: "application/json",
        },
        cache: "no-store",
        credentials: "same-origin",
      });

      if (!response.ok) return;

      const payload: unknown = await response.json();
      const parsed = parseSummary(payload);

      if (mountedRef.current && parsed) {
        setSummary(parsed);
      }
    } catch {
      // The counter remains available as an explanatory control even if the
      // latest aggregate cannot be fetched temporarily.
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void loadSummary();

    const refreshTimer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadSummary();
      }
    }, SUMMARY_REFRESH_MS);

    const handleFocus = () => {
      void loadSummary();
    };

    const handleRecordedVisit = (event: Event) => {
      const customEvent = event as CustomEvent<VisitRecordedDetail>;
      const detail = customEvent.detail;

      if (!detail || !mountedRef.current) return;

      setSummary((current) => ({
        totalVisits: safeCount(detail.totalVisits),
        todayVisits: safeCount(detail.todayVisits),
        trackedPublicRoutes: current?.trackedPublicRoutes ?? "0",
        recordingStartedAt:
          safeIsoDate(detail.recordingStartedAt) ??
          current?.recordingStartedAt ??
          null,
        lastRecordedAt:
          safeIsoDate(detail.lastRecordedAt) ?? current?.lastRecordedAt ?? null,
      }));

      setLoading(false);
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener(SITE_VISIT_EVENT, handleRecordedVisit);

    return () => {
      mountedRef.current = false;
      window.clearInterval(refreshTimer);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener(SITE_VISIT_EVENT, handleRecordedVisit);
    };
  }, [loadSummary]);

  useEffect(() => {
    if (!dialogOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDialogOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dialogOpen]);

  const formattedTotal = useMemo(
    () => (summary ? formatCount(summary.totalVisits) : null),
    [summary],
  );

  const formattedToday = useMemo(
    () => (summary ? formatCount(summary.todayVisits) : "0"),
    [summary],
  );

  const formattedRoutes = useMemo(
    () => (summary ? formatCount(summary.trackedPublicRoutes) : "0"),
    [summary],
  );

  const buttonLabel = formattedTotal
    ? `${formattedTotal} recorded website visits. Open details.`
    : "Recorded website visits. Open details.";

  const closeFromBackdrop = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setDialogOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        aria-label={buttonLabel}
        aria-haspopup="dialog"
        aria-expanded={dialogOpen}
        className={`sk-visit-counter group relative inline-flex h-9 min-w-9 items-center justify-center gap-2 overflow-hidden rounded-full bg-transparent px-2.5 text-white/72 transition duration-300 hover:-translate-y-0.5 hover:text-white active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 sm:min-w-[88px] sm:px-3 ${className}`}
      >
        <span
          aria-hidden="true"
          className="sk-visit-counter-outline pointer-events-none absolute inset-0 rounded-full"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[1px] rounded-full border border-black bg-black"
        />

        <span className="relative z-10 flex items-center gap-2">
          <EyeIcon />

          <span
            key={formattedTotal ?? "loading"}
            className="sk-visit-count-enter tabular-nums text-[10px] font-black tracking-[-0.015em]"
          >
            {loading && !formattedTotal ? "—" : (formattedTotal ?? "Visits")}
          </span>

          <span className="hidden text-[8px] font-black uppercase tracking-[0.11em] text-white/34 sm:inline">
            visits
          </span>
        </span>
      </button>

      {dialogOpen ? (
        <div
          role="presentation"
          onMouseDown={closeFromBackdrop}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/72 px-4 py-8 backdrop-blur-md"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="recorded-website-visits-title"
            aria-describedby="recorded-website-visits-description"
            className="sk-visit-dialog-enter relative w-full max-w-[420px] overflow-hidden rounded-[30px] border border-white/[0.17] bg-[#080808] p-5 text-left text-white shadow-[0_38px_120px_rgba(0,0,0,0.82),inset_0_1px_0_rgba(255,255,255,0.09)] sm:p-6"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.11),transparent_45%)]" />

            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-[16px] border border-white/[0.15] bg-[linear-gradient(145deg,rgba(255,255,255,0.13),rgba(255,255,255,0.025))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_14px_28px_rgba(0,0,0,0.44)]">
                  <EyeIcon />
                </div>

                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  aria-label="Close recorded website visits explanation"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.11] bg-white/[0.035] text-white/55 transition hover:border-white/25 hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="mt-5 text-[9px] font-black uppercase tracking-[0.21em] text-white/36">
                Public website measurement
              </div>

              <h2
                id="recorded-website-visits-title"
                className="mt-2 text-[30px] font-black leading-[0.96] tracking-[-0.06em]"
              >
                Recorded website visits
              </h2>

              <p
                id="recorded-website-visits-description"
                className="mt-4 text-[12.5px] font-semibold leading-relaxed text-white/58"
              >
                This total increases when a public StayKnown page is opened.
                Repeat openings are included, so the number represents recorded
                visits rather than a claim about unique individuals.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-[19px] border border-white/[0.11] bg-white/[0.035] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <div className="text-[8px] font-black uppercase tracking-[0.15em] text-white/32">
                    All recorded visits
                  </div>
                  <div className="mt-2 tabular-nums text-[24px] font-black tracking-[-0.055em]">
                    {formattedTotal ?? "Unavailable"}
                  </div>
                </div>

                <div className="rounded-[19px] border border-white/[0.11] bg-white/[0.035] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <div className="text-[8px] font-black uppercase tracking-[0.15em] text-white/32">
                    Recorded today
                  </div>
                  <div className="mt-2 tabular-nums text-[24px] font-black tracking-[-0.055em]">
                    {formattedToday}
                  </div>
                </div>
              </div>

              <dl className="mt-4 overflow-hidden rounded-[19px] border border-white/[0.1] bg-black">
                <div className="grid grid-cols-[0.8fr_1.2fr] gap-3 px-3.5 py-3">
                  <dt className="text-[8px] font-black uppercase tracking-[0.13em] text-white/30">
                    Measurement began
                  </dt>
                  <dd className="text-right text-[10px] font-black leading-snug text-white/65">
                    {formatDate(summary?.recordingStartedAt ?? null)}
                  </dd>
                </div>

                <div className="grid grid-cols-[0.8fr_1.2fr] gap-3 border-t border-white/[0.08] px-3.5 py-3">
                  <dt className="text-[8px] font-black uppercase tracking-[0.13em] text-white/30">
                    Public routes seen
                  </dt>
                  <dd className="text-right text-[10px] font-black text-white/65">
                    {formattedRoutes}
                  </dd>
                </div>

                <div className="grid grid-cols-[0.8fr_1.2fr] gap-3 border-t border-white/[0.08] px-3.5 py-3">
                  <dt className="text-[8px] font-black uppercase tracking-[0.13em] text-white/30">
                    Last updated
                  </dt>
                  <dd className="text-right text-[10px] font-black leading-snug text-white/65">
                    {formatDate(summary?.lastRecordedAt ?? null)}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 rounded-[18px] border border-white/[0.09] bg-white/[0.025] p-3.5 text-[10.5px] font-semibold leading-relaxed text-white/42">
                The public total begins from the activation of this measurement
                system. It is not padded with estimated history, and no personal
                identity is displayed by the counter.
              </div>

              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="mt-5 inline-flex min-h-10 w-full items-center justify-center rounded-[14px] border border-white bg-white px-4 text-[10px] font-black uppercase tracking-[0.12em] text-black shadow-[0_12px_28px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,1)] transition hover:-translate-y-0.5 hover:bg-[#111] hover:text-white active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                I understand
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <style jsx>{`
        .sk-visit-counter-outline {
          padding: 1px;
          background: conic-gradient(
            from 0deg,
            rgba(255, 255, 255, 0.1),
            rgba(255, 255, 255, 0.72),
            rgba(90, 90, 90, 0.38),
            rgba(255, 255, 255, 0.16),
            rgba(255, 255, 255, 0.7),
            rgba(255, 255, 255, 0.1)
          );
          animation: sk-visit-outline-spin 4.8s linear infinite;
        }

        .sk-visit-counter-outline::after {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: inherit;
          background: #000;
        }

        .sk-visit-count-enter {
          animation: sk-visit-count-enter 340ms cubic-bezier(0.22, 1, 0.36, 1)
            both;
        }

        .sk-visit-dialog-enter {
          animation: sk-visit-dialog-enter 220ms cubic-bezier(0.22, 1, 0.36, 1)
            both;
        }

        @keyframes sk-visit-outline-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes sk-visit-count-enter {
          from {
            opacity: 0;
            transform: translateY(4px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes sk-visit-dialog-enter {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sk-visit-counter,
          .sk-visit-counter *,
          .sk-visit-dialog-enter {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}
