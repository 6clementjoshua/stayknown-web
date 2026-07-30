import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const SITE_URL = "https://www.stay-known.com";
const PAGE_PATH = "/website-reach";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

type VisitSummaryRow = {
  total_visits?: unknown;
  today_visits?: unknown;
  tracked_public_routes?: unknown;
  recording_started_at?: unknown;
  last_recorded_at?: unknown;
};

type VisitSummary = {
  available: boolean;
  totalVisits: string;
  todayVisits: string;
  trackedPublicRoutes: string;
  recordingStartedAt: string | null;
  lastRecordedAt: string | null;
};

export const metadata: Metadata = {
  title: "Recorded Website Visits",
  description:
    "See StayKnown's honest public website visit total, when measurement began, what the number includes, and how the count protects visitor privacy.",
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    type: "website",
    url: PAGE_PATH,
    title: "Recorded Website Visits | StayKnown",
    description:
      "A transparent public total of recorded StayKnown website page openings, including repeat visits and without displaying personal identity.",
    siteName: "StayKnown",
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "Recorded Website Visits | StayKnown",
    description:
      "See what the StayKnown public visit counter records and when measurement began.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

function adminClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("website_visit_counter_not_configured");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function firstRpcRow(value: unknown): Record<string, unknown> {
  if (Array.isArray(value)) {
    const first = value[0];

    if (first != null && typeof first === "object" && !Array.isArray(first)) {
      return first as Record<string, unknown>;
    }

    return {};
  }

  if (value != null && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function safeCount(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.trunc(value).toString();
  }

  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    return value.trim().replace(/^0+(?=\d)/, "");
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
      timeZoneName: "short",
    }).format(new Date(value));
  } catch {
    return "Not available yet";
  }
}

async function loadVisitSummary(): Promise<VisitSummary> {
  try {
    const admin = adminClient();

    const { data, error } = await admin.rpc("get_public_website_visit_summary");

    if (error) {
      console.error(
        `WEBSITE_REACH summary_failed code=${error.code || "rpc_error"}`,
      );

      return {
        available: false,
        totalVisits: "0",
        todayVisits: "0",
        trackedPublicRoutes: "0",
        recordingStartedAt: null,
        lastRecordedAt: null,
      };
    }

    const row = firstRpcRow(data) as VisitSummaryRow;

    return {
      available: true,
      totalVisits: safeCount(row.total_visits),
      todayVisits: safeCount(row.today_visits),
      trackedPublicRoutes: safeCount(row.tracked_public_routes),
      recordingStartedAt: safeIsoDate(row.recording_started_at),
      lastRecordedAt: safeIsoDate(row.last_recorded_at),
    };
  } catch (error: unknown) {
    const type = error instanceof Error ? error.name : "UnknownError";

    console.error(`WEBSITE_REACH summary_failed type=${type}`);

    return {
      available: false,
      totalVisits: "0",
      todayVisits: "0",
      trackedPublicRoutes: "0",
      recordingStartedAt: null,
      lastRecordedAt: null,
    };
  }
}

function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
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

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-[28px] border border-white/[0.12] bg-white/[0.035] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_24px_70px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-white/[0.25] hover:bg-white/[0.055] sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(255,255,255,0.09),transparent_46%)] opacity-70" />

      <div className="relative">
        <div className="text-[8px] font-black uppercase tracking-[0.18em] text-white/34">
          {label}
        </div>

        <div className="mt-3 break-words tabular-nums text-[34px] font-black leading-none tracking-[-0.07em] text-white sm:text-[42px]">
          {value}
        </div>

        <p className="mt-3 text-[11px] font-semibold leading-relaxed text-white/48">
          {description}
        </p>
      </div>
    </article>
  );
}

function PrincipleCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="rounded-[24px] border border-white/[0.1] bg-black p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]">
      <h2 className="text-[14px] font-black tracking-[-0.025em] text-white">
        {title}
      </h2>

      <div className="mt-3 text-[11.5px] font-semibold leading-relaxed text-white/48">
        {children}
      </div>
    </article>
  );
}

export default async function WebsiteReachPage() {
  const summary = await loadVisitSummary();

  const totalVisits = summary.available
    ? formatCount(summary.totalVisits)
    : "Temporarily unavailable";

  const todayVisits = summary.available
    ? formatCount(summary.todayVisits)
    : "—";

  const publicRoutes = summary.available
    ? formatCount(summary.trackedPublicRoutes)
    : "—";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: "Recorded Website Visits",
        description:
          "StayKnown's transparent public website visit total and measurement explanation.",
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        about: {
          "@id": `${SITE_URL}/#organization`,
        },
        inLanguage: "en",
        dateModified: "2026-07-30",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Recorded Website Visits",
            item: PAGE_URL,
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <script
        id="stayknown-website-reach-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />

      <section className="relative isolate border-b border-white/[0.08] px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-220px] h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-white/[0.055] blur-[110px]" />
          <div className="absolute bottom-[-180px] right-[-120px] h-[380px] w-[380px] rounded-full bg-white/[0.025] blur-[100px]" />
        </div>

        <div className="mx-auto max-w-[1120px]">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center justify-between gap-4"
          >
            <Link
              href="/"
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/[0.13] bg-white/[0.035] px-4 text-[9px] font-black uppercase tracking-[0.13em] text-white/58 transition hover:border-white/30 hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <span aria-hidden="true">←</span>
              Home
            </Link>

            <span className="text-[8px] font-black uppercase tracking-[0.18em] text-white/24">
              Public measurement
            </span>
          </nav>

          <div className="mt-14 grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.13] bg-white/[0.035] px-3 py-2 text-[8px] font-black uppercase tracking-[0.17em] text-white/46">
                <EyeIcon />
                Transparent website reach
              </div>

              <h1 className="mt-5 max-w-[760px] text-[47px] font-black leading-[0.9] tracking-[-0.075em] sm:text-[68px] lg:text-[82px]">
                Recorded website visits.
              </h1>

              <p className="mt-6 max-w-[720px] text-[14px] font-semibold leading-relaxed text-white/55 sm:text-[16px]">
                This is StayKnown&apos;s live total of accepted public page
                openings. Repeat openings are included, so it measures recorded
                visits rather than unique individuals.
              </p>
            </div>

            <aside className="relative overflow-hidden rounded-[32px] border border-white/[0.16] bg-white/[0.045] p-6 shadow-[0_34px_120px_rgba(0,0,0,0.56),inset_0_1px_0_rgba(255,255,255,0.09)] sm:p-7">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(255,255,255,0.12),transparent_48%)]" />

              <div className="relative">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/34">
                    All recorded visits
                  </div>

                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 rounded-full border border-white/50 shadow-[0_0_18px_rgba(255,255,255,0.72)]"
                  />
                </div>

                <div className="mt-5 break-words tabular-nums text-[49px] font-black leading-none tracking-[-0.08em] sm:text-[62px]">
                  {totalVisits}
                </div>

                <p className="mt-5 text-[11px] font-semibold leading-relaxed text-white/45">
                  The total begins from the activation of this measurement
                  system. No estimated history was added to make the number
                  appear larger.
                </p>

                {!summary.available ? (
                  <div className="mt-4 rounded-[16px] border border-white/[0.1] bg-black px-3.5 py-3 text-[10px] font-bold leading-relaxed text-white/45">
                    The live total could not be retrieved at this moment. Public
                    pages remain available normally.
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
        <div className="mx-auto max-w-[1120px]">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="Recorded today"
              value={todayVisits}
              description="Accepted public page openings recorded during the current UTC day."
            />

            <MetricCard
              label="Public routes seen"
              value={publicRoutes}
              description="Different eligible public StayKnown paths that have received at least one recorded opening."
            />

            <MetricCard
              label="Measurement began"
              value={formatDate(summary.recordingStartedAt)}
              description="The honest activation point for this counter. Earlier activity is not reconstructed."
            />
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
                What the total means
              </div>

              <h2 className="mt-3 text-[34px] font-black leading-[0.95] tracking-[-0.06em] sm:text-[45px]">
                Clear measurement without inflated claims.
              </h2>

              <p className="mt-5 text-[13px] font-semibold leading-relaxed text-white/50">
                The counter is intentionally described as visits. It does not
                claim that every opening came from a different person. A return,
                refresh, or another public page opened during the same browsing
                session may increase the total again.
              </p>

              <div className="mt-6 rounded-[24px] border border-white/[0.11] bg-white/[0.03] p-5">
                <div className="text-[8px] font-black uppercase tracking-[0.16em] text-white/30">
                  Last recorded update
                </div>

                <div className="mt-2 text-[13px] font-black leading-snug text-white/72">
                  {formatDate(summary.lastRecordedAt)}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <PrincipleCard title="Repeat visits are included">
                Returning later, refreshing, or opening another eligible public
                page can increase the total. That is why the label says recorded
                website visits.
              </PrincipleCard>

              <PrincipleCard title="No fabricated starting number">
                The total starts from the real activation date. Earlier website
                activity is not guessed, padded, or reconstructed.
              </PrincipleCard>

              <PrincipleCard title="Aggregate measurement only">
                The public counter works from combined totals. It does not
                display names, account identities, exact locations, or
                individual browsing records.
              </PrincipleCard>

              <PrincipleCard title="Search traffic is included naturally">
                A person arriving from a search result is counted when the
                public StayKnown page actually opens. Search impressions are not
                added as website visits.
              </PrincipleCard>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/[0.08] bg-white/[0.018] px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
        <div className="mx-auto grid max-w-[1120px] gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
              StayKnown public experience
            </div>

            <h2 className="mt-3 max-w-[720px] text-[34px] font-black leading-[0.96] tracking-[-0.06em] sm:text-[48px]">
              Explore the safety system behind the visits.
            </h2>

            <p className="mt-5 max-w-[700px] text-[13px] font-semibold leading-relaxed text-white/48">
              Learn how consent-first contacts, active Visits, LIVE sharing,
              I&apos;M SAFE check-ins, SOS escalation, secure chat, guardian
              safeguards and device security work together.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Link
              href="/features"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-[16px] border border-white bg-white px-5 text-[10px] font-black uppercase tracking-[0.12em] text-black shadow-[0_16px_34px_rgba(0,0,0,0.34)] transition hover:-translate-y-1 hover:bg-black hover:text-white active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              Explore features
              <ArrowIcon />
            </Link>

            <Link
              href="/trust-safety"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-[16px] border border-white/[0.15] bg-white/[0.035] px-5 text-[10px] font-black uppercase tracking-[0.12em] text-white/68 transition hover:-translate-y-1 hover:border-white hover:bg-white hover:text-black active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              Trust &amp; safety
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      <footer className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-4 text-[9px] font-black uppercase tracking-[0.13em] text-white/28 sm:flex-row sm:items-center sm:justify-between">
          <span>StayKnown recorded website visits</span>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy" className="transition hover:text-white">
              Privacy
            </Link>

            <Link href="/security" className="transition hover:text-white">
              Security
            </Link>

            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
