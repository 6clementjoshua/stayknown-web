"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

type CheckState = "idle" | "checking" | "reachable" | "unavailable";
type StatusIcon =
  | "pulse"
  | "website"
  | "billing"
  | "manifest"
  | "sitemap"
  | "brand"
  | "refresh"
  | "check"
  | "warning"
  | "arrow"
  | "shield"
  | "clock";

type ServiceCheck = {
  id: string;
  label: string;
  description: string;
  endpoint: string;
  icon: StatusIcon;
};

type ServiceResult = ServiceCheck & {
  state: CheckState;
  latencyMs: number | null;
  checkedAt: string | null;
};

const CHECKS: readonly ServiceCheck[] = [
  {
    id: "website",
    label: "Website shell",
    description: "Checks whether the public website asset layer is reachable.",
    endpoint: "/favicon.ico",
    icon: "website",
  },
  {
    id: "billing",
    label: "Billing-region route",
    description:
      "Checks the server route used by the Plans page to resolve the billing country.",
    endpoint: "/api/billing-region",
    icon: "billing",
  },
  {
    id: "manifest",
    label: "Web manifest",
    description:
      "Checks whether the public app-manifest metadata can be retrieved.",
    endpoint: "/manifest.webmanifest",
    icon: "manifest",
  },
  {
    id: "sitemap",
    label: "Public sitemap",
    description:
      "Checks whether the current public route index can be retrieved.",
    endpoint: "/sitemap.xml",
    icon: "sitemap",
  },
  {
    id: "brand",
    label: "Brand asset route",
    description:
      "Checks the public StayKnown logo route used by supported website flows.",
    endpoint: "/api/stayknown-logo",
    icon: "brand",
  },
] as const;

function StatusIconView({
  name,
  className = "h-4 w-4",
}: {
  name: StatusIcon;
  className?: string;
}) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };

  switch (name) {
    case "pulse":
      return (
        <svg {...common}>
          <path d="M3 12h4l2-6 4 12 2-6h6" />
        </svg>
      );
    case "website":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2.5" />
          <path d="M3 8h18M7 6h.01M10 6h.01" />
        </svg>
      );
    case "billing":
      return (
        <svg {...common}>
          <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
          <path d="M3.5 10h17M7 15h3" />
        </svg>
      );
    case "manifest":
      return (
        <svg {...common}>
          <path d="M6 3h9l3 3v15H6z" />
          <path d="M15 3v4h4M9 11h6M9 15h6" />
        </svg>
      );
    case "sitemap":
      return (
        <svg {...common}>
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <rect x="3" y="17" width="6" height="4" rx="1" />
          <rect x="15" y="17" width="6" height="4" rx="1" />
          <path d="M12 7v5M6 17v-3h12v3" />
        </svg>
      );
    case "brand":
      return (
        <svg {...common}>
          <path d="M12 3 4.5 6v5.5c0 4.7 3.1 7.7 7.5 9.5 4.4-1.8 7.5-4.8 7.5-9.5V6z" />
          <path d="m8.5 12 2.2 2.2 4.8-5" />
        </svg>
      );
    case "refresh":
      return (
        <svg {...common}>
          <path d="M20 7v5h-5" />
          <path d="M4 17v-5h5" />
          <path d="M6.1 8A7 7 0 0 1 18 7l2 5M4 12l2 5a7 7 0 0 0 11.9-1" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );
    case "warning":
      return (
        <svg {...common}>
          <path d="M12 3 2.8 19h18.4z" />
          <path d="M12 9v4M12 16.5h.01" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 4.5 6v5.5c0 4.7 3.1 7.7 7.5 9.5 4.4-1.8 7.5-4.8 7.5-9.5V6z" />
        </svg>
      );
    case "arrow":
    default:
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m14 7 5 5-5 5" />
        </svg>
      );
  }
}

function statusText(state: CheckState) {
  switch (state) {
    case "checking":
      return "Checking";
    case "reachable":
      return "Reachable";
    case "unavailable":
      return "Unavailable";
    default:
      return "Not checked";
  }
}

function statusClasses(state: CheckState) {
  switch (state) {
    case "checking":
      return {
        text: "text-white",
        border: "border-white/28",
        dot: "bg-white",
      };
    case "reachable":
      return {
        text: "text-[#8ff3d0]",
        border: "border-[#8ff3d0]/52",
        dot: "bg-[#8ff3d0]",
      };
    case "unavailable":
      return {
        text: "text-[#f04c55]",
        border: "border-[#f04c55]/58",
        dot: "bg-[#f04c55]",
      };
    default:
      return {
        text: "text-white/45",
        border: "border-white/[0.13]",
        dot: "bg-white/34",
      };
  }
}

function StatusOrbit({ overall }: { overall: CheckState }) {
  const reduced = useReducedMotion();
  const classes = statusClasses(overall);

  return (
    <div className="relative mx-auto h-[480px] w-full max-w-[510px] sm:h-[580px]">
      <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07]" />
      <div className="absolute left-1/2 top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />

      <motion.div
        animate={reduced ? undefined : { rotate: 360 }}
        transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
        className={`absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed ${classes.border}`}
      >
        {[0, 1, 2, 3].map((value) => {
          const positions = [
            "left-1/2 top-[-19px] -translate-x-1/2",
            "right-[-19px] top-1/2 -translate-y-1/2",
            "bottom-[-19px] left-1/2 -translate-x-1/2",
            "left-[-19px] top-1/2 -translate-y-1/2",
          ];

          return (
            <motion.span
              key={value}
              animate={reduced ? undefined : { rotate: -360 }}
              transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
              className={`absolute flex h-10 w-10 items-center justify-center rounded-[13px] border bg-black ${classes.border} ${classes.text} ${positions[value]}`}
            >
              <StatusIconView
                name={["website", "billing", "manifest", "sitemap"][value] as StatusIcon}
                className="h-4 w-4"
              />
            </motion.span>
          );
        })}
      </motion.div>

      <motion.div
        animate={
          reduced
            ? undefined
            : overall === "checking"
              ? { scale: [0.96, 1.04, 0.96] }
              : { scale: [0.985, 1.015, 0.985] }
        }
        transition={{
          duration: overall === "checking" ? 1.4 : 4.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute left-1/2 top-1/2 flex h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[52px] border bg-black ${classes.border} ${classes.text} shadow-[0_36px_90px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,0.08)]`}
      >
        <StatusIconView name="pulse" className="h-[86px] w-[86px]" />
      </motion.div>

      <div className={`absolute bottom-[5%] left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border bg-black px-3 py-2 ${classes.border} ${classes.text}`}>
        <span className={`h-2 w-2 rounded-full ${classes.dot}`} />
        <span className="whitespace-nowrap text-[8px] font-black uppercase tracking-[0.15em]">
          {statusText(overall)}
        </span>
      </div>
    </div>
  );
}

export default function StatusExperience() {
  const [results, setResults] = useState<ServiceResult[]>(
    CHECKS.map((check) => ({
      ...check,
      state: "idle",
      latencyMs: null,
      checkedAt: null,
    })),
  );
  const [lastRun, setLastRun] = useState<string | null>(null);

  const runChecks = useCallback(async () => {
    setResults(
      CHECKS.map((check) => ({
        ...check,
        state: "checking",
        latencyMs: null,
        checkedAt: null,
      })),
    );

    const checked = await Promise.all(
      CHECKS.map(async (check): Promise<ServiceResult> => {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 7000);
        const started = performance.now();

        try {
          const response = await fetch(check.endpoint, {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept:
                check.id === "billing"
                  ? "application/json"
                  : "*/*",
            },
            signal: controller.signal,
          });

          const latencyMs = Math.max(
            1,
            Math.round(performance.now() - started),
          );

          return {
            ...check,
            state: response.ok ? "reachable" : "unavailable",
            latencyMs,
            checkedAt: new Date().toISOString(),
          };
        } catch {
          return {
            ...check,
            state: "unavailable",
            latencyMs: null,
            checkedAt: new Date().toISOString(),
          };
        } finally {
          window.clearTimeout(timeout);
        }
      }),
    );

    setResults(checked);
    setLastRun(new Date().toISOString());
  }, []);

  useEffect(() => {
    void runChecks();
  }, [runChecks]);

  const overall: CheckState = useMemo(() => {
    if (results.some((result) => result.state === "checking")) {
      return "checking";
    }

    if (results.some((result) => result.state === "unavailable")) {
      return "unavailable";
    }

    if (
      results.length > 0 &&
      results.every((result) => result.state === "reachable")
    ) {
      return "reachable";
    }

    return "idle";
  }, [results]);

  const reachableCount = results.filter(
    (result) => result.state === "reachable",
  ).length;

  return (
    <main className="min-h-screen overflow-x-clip bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-white/[0.09] bg-black/94 backdrop-blur-2xl">
        <div className="mx-auto flex min-h-[66px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-5 lg:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-[13px] border border-white bg-white">
              <Image src="/6logo.png" alt="" width={20} height={20} priority />
            </span>
            <span>
              <span className="block text-[10px] font-black tracking-[0.22em]">
                STAYKNOWN
              </span>
              <span className="mt-1 block text-[7px] font-black uppercase tracking-[0.18em] text-white/32">
                Public status
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-5 md:flex">
            <a href="#checks" className="text-[9px] font-black uppercase tracking-[0.13em] text-white/52 hover:text-white">
              Checks
            </a>
            <Link href="/help-center" className="text-[9px] font-black uppercase tracking-[0.13em] text-white/52 hover:text-white">
              Help
            </Link>
            <Link href="/security" className="text-[9px] font-black uppercase tracking-[0.13em] text-white/52 hover:text-white">
              Security
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => void runChecks()}
            disabled={overall === "checking"}
            className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-white bg-white px-4 text-[10px] font-black text-black hover:bg-black hover:text-white disabled:cursor-wait disabled:opacity-55"
          >
            <StatusIconView
              name="refresh"
              className={`h-3.5 w-3.5 ${
                overall === "checking" ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>
      </header>

      <section className="relative overflow-hidden bg-black">
        <div className="absolute left-1/2 top-[45%] h-[820px] w-[1220px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]" />

        <div className="relative mx-auto grid min-h-[700px] max-w-6xl items-center gap-10 px-4 py-14 sm:px-5 lg:grid-cols-[1.05fr_0.95fr] lg:px-6 lg:py-20">
          <div>
            <div className={`inline-flex min-h-8 items-center gap-2 rounded-full border bg-black px-3 text-[8px] font-black uppercase tracking-[0.18em] ${statusClasses(overall).border} ${statusClasses(overall).text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${statusClasses(overall).dot}`} />
              Browser reachability status
            </div>

            <h1 className="mt-6 max-w-[11ch] text-[52px] font-black leading-[0.9] tracking-[-0.076em] sm:text-[68px] lg:text-[79px]">
              Check the public website routes from this browser.
            </h1>

            <p className="mt-6 max-w-[64ch] text-[14px] font-semibold leading-relaxed text-white/58 sm:text-[15px]">
              This page performs a lightweight reachability check against
              selected public StayKnown routes. It is not a historical uptime
              monitor, service-level agreement, or proof that every backend
              dependency is healthy.
            </p>

            <div className="mt-8 grid max-w-[500px] grid-cols-2 gap-3">
              <div className="rounded-[19px] border border-white/[0.12] bg-black p-4">
                <div className="text-[8px] font-black uppercase tracking-[0.15em] text-white/32">
                  Reachable
                </div>
                <div className="mt-2 text-[28px] font-black text-[#8ff3d0]">
                  {reachableCount}/{results.length}
                </div>
              </div>
              <div className="rounded-[19px] border border-white/[0.12] bg-black p-4">
                <div className="text-[8px] font-black uppercase tracking-[0.15em] text-white/32">
                  Last browser check
                </div>
                <div className="mt-2 text-[11px] font-black text-white/68">
                  {lastRun
                    ? new Date(lastRun).toLocaleTimeString()
                    : "Not completed"}
                </div>
              </div>
            </div>
          </div>

          <StatusOrbit overall={overall} />
        </div>
      </section>

      <section id="checks" className="bg-white py-16 text-black sm:py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-5 lg:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <div className="text-[9px] font-black uppercase tracking-[0.28em] text-black/36">
              Current browser checks
            </div>
            <h2 className="mt-4 text-[40px] font-black leading-[0.94] tracking-[-0.068em] sm:text-[52px] md:text-[60px]">
              Each result reflects this device and this moment.
            </h2>
          </div>

          <div className="mt-9 grid gap-3 lg:grid-cols-2">
            {results.map((result, index) => {
              const classes = statusClasses(result.state);

              return (
                <motion.article
                  key={result.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.34,
                    delay: index * 0.04,
                  }}
                  className="rounded-[24px] border border-black/[0.14] bg-white p-5 shadow-[0_20px_52px_rgba(0,0,0,0.075),inset_0_1px_0_rgba(255,255,255,1)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-[13px] border bg-white ${
                        result.state === "reachable"
                          ? "border-[#0b7a62]/45 text-[#0b7a62]"
                          : result.state === "unavailable"
                            ? "border-[#d7353d]/52 text-[#d7353d]"
                            : "border-black/[0.15] text-black"
                      }`}
                    >
                      <StatusIconView name={result.icon} className="h-4 w-4" />
                    </span>

                    <span
                      className={`inline-flex min-h-7 items-center gap-2 rounded-full border bg-white px-2.5 text-[8px] font-black uppercase tracking-[0.13em] ${
                        result.state === "reachable"
                          ? "border-[#0b7a62]/42 text-[#0b7a62]"
                          : result.state === "unavailable"
                            ? "border-[#d7353d]/48 text-[#d7353d]"
                            : "border-black/[0.14] text-black/45"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          result.state === "reachable"
                            ? "bg-[#0b7a62]"
                            : result.state === "unavailable"
                              ? "bg-[#d7353d]"
                              : "bg-black/35"
                        }`}
                      />
                      {statusText(result.state)}
                    </span>
                  </div>

                  <h3 className="mt-5 text-[21px] font-black tracking-[-0.045em]">
                    {result.label}
                  </h3>
                  <p className="mt-3 text-[11px] font-semibold leading-relaxed text-black/56">
                    {result.description}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <div className="rounded-[15px] border border-black/[0.11] bg-white p-3">
                      <div className="text-[7px] font-black uppercase tracking-[0.13em] text-black/28">
                        Endpoint
                      </div>
                      <div className="mt-1.5 truncate text-[9px] font-black text-black/62">
                        {result.endpoint}
                      </div>
                    </div>
                    <div className="rounded-[15px] border border-black/[0.11] bg-white p-3">
                      <div className="text-[7px] font-black uppercase tracking-[0.13em] text-black/28">
                        Browser latency
                      </div>
                      <div className="mt-1.5 text-[9px] font-black text-black/62">
                        {result.latencyMs === null
                          ? "Unavailable"
                          : `${result.latencyMs} ms`}
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-black py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-5 lg:px-6">
          <div className="text-[9px] font-black uppercase tracking-[0.28em] text-[#8ff3d0]">
            Public incident notice
          </div>
          <h2 className="mx-auto mt-4 max-w-[14ch] text-[42px] font-black leading-[0.94] tracking-[-0.07em] text-white sm:text-[54px] md:text-[62px]">
            No active public incident notice is configured on this page.
          </h2>
          <p className="mx-auto mt-5 max-w-[69ch] text-[13px] font-semibold leading-relaxed text-white/55 sm:text-[14px]">
            This statement means only that no manual public incident notice is
            currently published here. A successful browser check does not
            guarantee every app, notification, email, map, payment, or external
            provider function.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/help-center"
              className="inline-flex h-10 w-full max-w-[210px] items-center justify-center gap-2 rounded-[14px] border border-white bg-white px-4 text-[10px] font-black text-black hover:bg-black hover:text-white sm:w-auto"
            >
              Help Center
              <StatusIconView name="arrow" className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/security"
              className="inline-flex h-10 w-full max-w-[210px] items-center justify-center gap-2 rounded-[14px] border border-white/[0.16] bg-black px-4 text-[10px] font-black text-white/66 hover:border-white hover:text-white sm:w-auto"
            >
              Security disclosure
              <StatusIconView name="arrow" className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/submit-request"
              className="inline-flex h-10 w-full max-w-[210px] items-center justify-center gap-2 rounded-[14px] border border-white/[0.16] bg-black px-4 text-[10px] font-black text-white/66 hover:border-white hover:text-white sm:w-auto"
            >
              Submit a request
              <StatusIconView name="arrow" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
