"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import StayKnownSocialLinks from "@/components/StayKnownSocialLinks";
import type { UpdatePost } from "@/lib/stayknown-updates";
import { publicDate } from "@/lib/stayknown-updates";

type FooterLink = {
  label: string;
  href: string;
};

type UpdateFilter =
  | "All"
  | "Product"
  | "Safety"
  | "Technology"
  | "Company"
  | "Release"
  | "Recognition";

const UPDATE_FILTERS: readonly UpdateFilter[] = [
  "All",
  "Product",
  "Safety",
  "Technology",
  "Company",
  "Release",
  "Recognition",
];

const FOOTER_GROUPS: Array<{ title: string; links: FooterLink[] }> = [
  {
    title: "Explore",
    links: [
      { label: "How StayKnown Works", href: "/how-it-works" },
      { label: "Watch StayKnown", href: "/watch" },
      { label: "Product Features", href: "/features" },
      { label: "Secure Chat", href: "/learn/chat" },
      { label: "Chat & Trusted Circles", href: "/chat" },
      { label: "Plans & Pricing", href: "/plans" },
      { label: "Trust & Safety", href: "/trust-safety" },
    ],
  },
  {
    title: "People",
    links: [
      { label: "Students", href: "/students" },
      { label: "Travel & Rides", href: "/travel-rides" },
      { label: "Families & Guardians", href: "/families-guardians" },
      { label: "Child Safety & Minor Use", href: "/minors" },
      { label: "Guardian Consent", href: "/guardian-consent" },
      { label: "Accessibility", href: "/accessibility" },
    ],
  },
  {
    title: "Safety & Support",
    links: [
      { label: "Safety & Anti-Stalking", href: "/safety" },
      { label: "Contact Consent", href: "/contact-consent" },
      { label: "Location & Live Safety", href: "/location-safety" },
      { label: "Emergency Disclaimer", href: "/emergency" },
      { label: "Abuse Reporting", href: "/abuse" },
      { label: "Help Center", href: "/help-center" },
      { label: "Public Status", href: "/status" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About StayKnown", href: "/about" },
      { label: "Press & Updates", href: "/press-updates" },
      {
        label: "Google Play Recognition",
        href: "/recognition/google-play-indie-corner",
      },
      { label: "Contact", href: "/contact" },
      { label: "Submit Request", href: "/submit-request" },
      { label: "Submit Feature", href: "/submit-feature" },
      { label: "Creator Apply", href: "/creator-apply" },
      { label: "Donate", href: "/donate" },
    ],
  },
  {
    title: "Legal & Security",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Acceptable Use", href: "/acceptable-use" },
      { label: "Data Retention", href: "/retention" },
      { label: "Security Disclosure", href: "/security" },
      { label: "Law Enforcement Requests", href: "/law" },
      { label: "Billing & Refunds", href: "/billing-policy" },
      { label: "Creator Policy", href: "/creator-policy" },
      { label: "Donor Policy", href: "/donor-policy" },
    ],
  },
];

function matchesFilter(post: UpdatePost, filter: UpdateFilter) {
  if (filter === "All") return true;

  const category = post.category.trim().toLowerCase();

  if (filter === "Safety") {
    return category.includes("safety") || category.includes("trust");
  }

  return category === filter.toLowerCase();
}

function formatMonth(post: UpdatePost) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(new Date(publicDate(post)));
}

function formatDate(post: UpdatePost) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(new Date(publicDate(post)));
}

function SiteFooter() {
  return (
    <footer className="relative z-20 w-full border-t border-white/[0.08] bg-black">
      <div className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-5 sm:pb-10 sm:pt-12 lg:px-6">
        <div className="grid gap-9 lg:grid-cols-[1.15fr_2.85fr]">
          <div>
            <div className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-[16px] border border-white bg-white shadow-[0_12px_28px_rgba(0,0,0,0.40),inset_0_1px_0_rgba(255,255,255,1),inset_0_-5px_12px_rgba(0,0,0,0.09)]">
                <Image src="/6logo.png" alt="" width={24} height={24} />
              </span>
              <span>
                <span className="block text-[13px] font-black tracking-[0.2em] text-white">
                  STAYKNOWN
                </span>
                <span className="mt-1 block text-[10px] font-bold text-white/38">
                  Consent-based safety technology
                </span>
              </span>
            </div>

            <p className="mt-5 max-w-[34ch] text-[12px] font-semibold leading-relaxed text-white/42">
              StayKnown helps people share safety context with approved contacts
              during Visits, check-ins, SOS, and other intentional safety flows.
            </p>
            <StayKnownSocialLinks className="mt-5" />
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {FOOTER_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                  {group.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target={
                          link.href.startsWith("http") ? "_blank" : undefined
                        }
                        rel={
                          link.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="inline-flex min-h-8 items-center text-[12px] font-semibold leading-snug text-white/58 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/[0.08] pt-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="text-[11px] font-semibold text-white/36">
            A 6 Clement Joshua service
            <span className="ml-1 align-super text-[9px] text-white/22">™</span>
          </div>
          <div className="text-[11px] font-semibold text-white/28">
            {new Date().getFullYear()} • stay-known.com
          </div>
        </div>
      </div>
    </footer>
  );
}

export function UpdatesFeed({
  posts,
  totalViews,
}: {
  posts: UpdatePost[];
  totalViews: number;
}) {
  const [activeFilter, setActiveFilter] = useState<UpdateFilter>("All");

  const filteredPosts = useMemo(
    () => posts.filter((post) => matchesFilter(post, activeFilter)),
    [activeFilter, posts],
  );

  const groups = useMemo(() => {
    const grouped = new Map<string, UpdatePost[]>();

    for (const post of filteredPosts) {
      const key = formatMonth(post);
      grouped.set(key, [...(grouped.get(key) || []), post]);
    }

    return grouped;
  }, [filteredPosts]);

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-black/95 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-[1160px] items-center justify-between gap-4">
          <Link
            href="/"
            aria-label="StayKnown home"
            className="group inline-flex min-h-11 items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-[11px] border border-white bg-white transition duration-300 group-hover:scale-[1.04]">
              <Image src="/6logo.png" alt="" width={18} height={18} priority />
            </span>
            <span className="text-[11px] font-black tracking-[0.18em] text-white">
              STAYKNOWN
            </span>
          </Link>

          <div className="rounded-full border border-white/[0.12] bg-white/[0.03] px-3 py-2 text-[9px] font-black tracking-[0.03em] text-white/45">
            ◉ {totalViews.toLocaleString()} UPDATE VIEWS
          </div>
        </div>
      </header>

      <section className="px-4 pb-12 pt-14 sm:px-6 sm:pb-14 sm:pt-20 lg:pt-24">
        <div className="mx-auto max-w-[1160px]">
          <div className="max-w-[900px]">
            <div className="text-[9px] font-black uppercase tracking-[0.25em] text-white/32">
              Official StayKnown publication
            </div>
            <h1 className="mt-5 max-w-[11ch] text-[54px] font-black leading-[0.86] tracking-[-0.075em] text-white sm:text-[72px] lg:text-[92px]">
              StayKnown Updates.
            </h1>
            <p className="mt-7 max-w-[620px] text-[14px] font-semibold leading-7 text-white/48">
              The official public record of what StayKnown is building,
              changing, releasing and learning across safety technology.
            </p>
          </div>

          <nav
            className="mt-10 flex max-w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Filter StayKnown updates"
          >
            {UPDATE_FILTERS.map((filter) => {
              const active = filter === activeFilter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  aria-pressed={active}
                  className={`shrink-0 rounded-full border px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.15em] transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 ${
                    active
                      ? "border-white bg-white text-black"
                      : "border-white/[0.11] bg-white/[0.025] text-white/42 hover:border-white/[0.24] hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </nav>
        </div>
      </section>

      <section className="border-t border-white/[0.08] px-4 pb-24 sm:px-6 lg:pb-28">
        <div className="mx-auto max-w-[1160px]">
          {[...groups.entries()].map(([month, items]) => (
            <section key={month} className="pt-12 sm:pt-16">
              <div className="sticky top-[57px] z-20 -mx-2 border-b border-white/[0.07] bg-black/92 px-2 py-3 text-[9px] font-black uppercase tracking-[0.24em] text-white/32 backdrop-blur-xl">
                {month}
              </div>

              <div>
                {items.map((post) => (
                  <article
                    key={post.id}
                    className="group border-b border-white/[0.09] py-10 sm:py-14"
                  >
                    <Link
                      href={`/updates/${post.slug}`}
                      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
                    >
                      <div className="grid gap-7 lg:grid-cols-[1fr_.42fr] lg:items-end">
                        <div>
                          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
                            {post.category} · {formatDate(post)}
                          </div>
                          <h2 className="mt-4 max-w-[800px] text-[34px] font-black leading-[0.96] tracking-[-0.052em] transition duration-500 group-hover:translate-x-1 sm:text-[48px] lg:text-[52px]">
                            {post.title}
                          </h2>
                          <p className="mt-5 max-w-[680px] text-[13px] font-semibold leading-6 text-white/45">
                            {post.summary}
                          </p>
                        </div>

                        <div className="lg:text-right">
                          <span className="inline-flex rounded-full border border-white/[0.14] px-4 py-2.5 text-[10px] font-black transition duration-300 group-hover:bg-white group-hover:text-black">
                            Read update ↗
                          </span>
                          <div className="mt-3 text-[9px] font-black text-white/26">
                            ♡ {Number(post.like_count || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ))}

          {!posts.length ? (
            <div className="py-16 sm:py-20">
              <div className="max-w-[680px] border-y border-white/[0.08] py-10 sm:py-12">
                <div className="text-[9px] font-black uppercase tracking-[0.24em] text-white/28">
                  Publication archive
                </div>
                <h2 className="mt-4 max-w-[18ch] text-[28px] font-black leading-[1] tracking-[-0.045em] text-white sm:text-[34px]">
                  The record begins with the first published update.
                </h2>
                <p className="mt-4 max-w-[560px] text-[12px] font-semibold leading-6 text-white/38">
                  Official StayKnown product, safety, technology and company
                  updates will appear here as they are published.
                </p>
              </div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-16 text-[12px] font-semibold text-white/38">
              No published updates in {activeFilter} yet.
            </div>
          ) : null}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
