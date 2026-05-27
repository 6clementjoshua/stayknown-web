"use client";

import Image from "next/image";
import { useEffect } from "react";

const UPDATED_AT = "2026-05-27";
const VERSION = "1.0";

function fmtDate(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}

function useSeoMeta() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    document.title =
      "StayKnown Creator Policy | Influencer Applications, Earnings, Brand Safety & Verification";

    const upsertMeta = (name: string, content: string) => {
      let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    const upsertProperty = (property: string, content: string) => {
      let tag = document.querySelector<HTMLMetaElement>(
        `meta[property="${property}"]`,
      );
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    upsertMeta(
      "description",
      "StayKnown Creator Policy explains influencer applications, earning opportunities, one-video enrollment, campaign review, sample video rules, social proof, future KYC, brand-safety responsibilities, and privacy handling.",
    );
    upsertMeta(
      "keywords",
      "StayKnown creator policy, StayKnown influencer application, creator earnings, safety app influencer, StayKnown ambassador, StayKnown campaign, creator verification, brand safety",
    );
    upsertMeta("robots", "index, follow");
    upsertMeta("author", "6 Clement Joshua");

    upsertProperty("og:title", "StayKnown Creator Policy");
    upsertProperty(
      "og:description",
      "Rules for creators, influencers, ambassadors, application review, earnings, campaign conduct, social proof, and future verification.",
    );
    upsertProperty("og:type", "website");
    upsertProperty("og:site_name", "StayKnown");
  }, []);
}

function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 3.2 19 6v5.5c0 4.45-2.85 8.45-7 9.8-4.15-1.35-7-5.35-7-9.8V6l7-2.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="m8.8 12.1 2.15 2.15 4.55-5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VideoIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M5.8 7.2h8.4A2.8 2.8 0 0 1 17 10v4a2.8 2.8 0 0 1-2.8 2.8H5.8A2.8 2.8 0 0 1 3 14v-4a2.8 2.8 0 0 1 2.8-2.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="m17 10.4 3.4-2.1c.5-.3 1.1.1 1.1.7v6c0 .6-.6 1-1.1.7L17 13.6v-3.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MoneyIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M4.5 7.2h15v9.6h-15V7.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M7.2 10.2h.01M16.8 13.8h.01M12 14.6a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LinkIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M9.8 13.7a3.4 3.4 0 0 1 0-4.8l2.6-2.6a3.4 3.4 0 1 1 4.8 4.8l-1.1 1.1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M14.2 10.3a3.4 3.4 0 0 1 0 4.8l-2.6 2.6a3.4 3.4 0 1 1-4.8-4.8l1.1-1.1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 12.2a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M4.5 20.2c.7-4 3.4-6.1 7.5-6.1s6.8 2.1 7.5 6.1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ReportIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M6.4 4.5h8.4l2.8 2.8v12.2H6.4v-15Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M14.8 4.5v2.8h2.8M9 10.5h6M9 13.4h6M9 16.3h3.5"
        stroke="currentColor"
        strokeWidth="1.7"
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

function FloatingBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.055),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(255,255,255,0.045),transparent_25%)]" />
      <div className="absolute left-[7%] top-[18%] h-48 w-48 animate-[floatSlow_9s_ease-in-out_infinite] rounded-full bg-white/[0.035] blur-3xl" />
      <div className="absolute right-[8%] top-[32%] h-56 w-56 animate-[floatSlow_11s_ease-in-out_infinite_reverse] rounded-full bg-white/[0.03] blur-3xl" />
      <div className="absolute bottom-[8%] left-[30%] h-60 w-60 animate-[floatSlow_13s_ease-in-out_infinite] rounded-full bg-white/[0.02] blur-3xl" />
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-white/58">
      {children}
    </span>
  );
}

function SoftBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-[12px] font-black text-white/55">
      {children}
    </div>
  );
}

function SectionTitle({
  children,
  icon,
  kicker,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  kicker?: string;
}) {
  return (
    <div>
      {kicker ? (
        <div className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/34">
          {kicker}
        </div>
      ) : null}

      <h2 className="text-[22px] font-black tracking-[-0.035em] text-white md:text-[28px]">
        <span className="inline-flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.045] text-white/85">
            {icon}
          </span>
          <span>{children}</span>
        </span>
      </h2>
    </div>
  );
}

function PrincipleCard({
  icon,
  title,
  body,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  delay?: number;
}) {
  return (
    <div
      className="group animate-[riseIn_0.55s_ease_both] rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-white/18 hover:bg-white/[0.06]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-black/40 text-white/82 transition group-hover:bg-white group-hover:text-black">
          {icon}
        </div>
        <div>
          <div className="text-[15px] font-black text-white/92">{title}</div>
          <p className="mt-2 text-[13px] font-semibold leading-relaxed text-white/54">
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}

function BulletCard({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.032] p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.045] text-white/82">
          {icon}
        </span>
        <div className="text-[15px] font-black text-white/92">{title}</div>
      </div>

      <div className="mt-4 grid gap-2">
        {items.map((item) => (
          <div
            key={item}
            className="flex gap-3 rounded-2xl border border-white/10 bg-black/22 px-3 py-3"
          >
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-white/65" />
            <span className="text-[13px] font-semibold leading-relaxed text-white/56">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LinkCard({
  href,
  title,
  body,
}: {
  href: string;
  title: string;
  body: string;
}) {
  return (
    <a
      href={href}
      className="group rounded-[1.35rem] border border-white/10 bg-white/[0.032] p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[13px] font-black text-white/92">{title}</div>
          <p className="mt-1.5 text-[12.5px] font-semibold leading-relaxed text-white/52">
            {body}
          </p>
        </div>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/35 transition group-hover:translate-x-0.5 group-hover:text-white">
          <ArrowIcon className="h-4 w-4" />
        </span>
      </div>
    </a>
  );
}

export default function CreatorPolicyPage() {
  useSeoMeta();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "StayKnown Creator Policy",
    dateModified: UPDATED_AT,
    version: VERSION,
    publisher: {
      "@type": "Organization",
      name: "StayKnown",
      brand: "A 6 Clement Joshua service™",
      url: "https://stay-known.com",
      logo: "https://stay-known.com/6logo.png",
    },
    description:
      "StayKnown Creator Policy covering influencer applications, earnings, campaign quality, brand safety, social proof, sample video review, future KYC, and creator responsibilities.",
  };

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <FloatingBackdrop />

      <style jsx global>{`
        @keyframes floatSlow {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(0, -18px, 0) scale(1.04);
          }
        }

        @keyframes riseIn {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.99);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes pulseHalo {
          0%,
          100% {
            opacity: 0.45;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.055);
          }
        }

        html {
          scroll-behavior: smooth;
          color-scheme: dark;
          background: #000;
        }

        body {
          background: #000;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="relative z-10 pt-7">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4">
          <a href="/" className="flex flex-col items-center gap-2">
            <Image
              src="/6logo.png"
              alt="StayKnown"
              width={40}
              height={40}
              priority
              className="rounded-full bg-white object-contain p-0.5"
            />
            <div className="text-[12px] font-extrabold tracking-[0.28em] text-white">
              STAYKNOWN
            </div>
          </a>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-8 md:pt-12">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/60 backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(255,255,255,0.11),transparent_32%),radial-gradient(circle_at_80%_12%,rgba(255,255,255,0.045),transparent_26%)]" />

          <div className="relative grid gap-8 px-5 py-8 md:grid-cols-[1fr_280px] md:items-center md:px-8 md:py-10">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Pill>Creator Policy</Pill>
                <Pill>Brand Safety</Pill>
                <Pill>Paid Opportunities</Pill>
              </div>

              <h1 className="mt-5 max-w-4xl text-[34px] font-black tracking-[-0.055em] text-white md:text-[58px] md:leading-[1.02]">
                StayKnown Creator Policy for influencers, ambassadors, and
                responsible safety education.
              </h1>

              <p className="mt-5 max-w-3xl text-[14px] font-semibold leading-relaxed text-white/60 md:text-[15px]">
                StayKnown may work with creators who can explain the app
                clearly, lawfully, and responsibly. This policy explains who can
                apply, how applications are reviewed, how creators may earn, and
                what conduct is required when representing a safety-focused
                platform.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <SoftBadge>Version {VERSION}</SoftBadge>
                <SoftBadge>Updated: {fmtDate(UPDATED_AT)}</SoftBadge>
              </div>
            </div>

            <div className="relative mx-auto h-[260px] w-[220px] md:h-[300px] md:w-[250px]">
              <div className="absolute inset-0 animate-[pulseHalo_4s_ease-in-out_infinite] rounded-full bg-white/[0.055] blur-3xl" />
              <div className="relative flex h-full w-full items-center justify-center rounded-[2rem] border border-white/12 bg-white/[0.045] p-5 shadow-2xl shadow-black/50 backdrop-blur-2xl">
                <div className="grid h-32 w-32 place-items-center rounded-[2.2rem] border border-white/12 bg-black/45 text-white shadow-2xl">
                  <VideoIcon className="h-20 w-20" />
                </div>

                <div className="absolute left-5 top-5 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/80">
                  <UserIcon className="h-6 w-6" />
                </div>

                <div className="absolute right-5 top-8 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/80">
                  <MoneyIcon className="h-6 w-6" />
                </div>

                <div className="absolute bottom-6 left-8 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/80">
                  <LinkIcon className="h-6 w-6" />
                </div>

                <div className="absolute bottom-5 right-7 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-white/80">
                  <ShieldIcon className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="pt-8">
          <div className="grid gap-4 md:grid-cols-3">
            <PrincipleCard
              icon={<UserIcon className="h-5 w-5" />}
              title="Real identity required"
              body="Creators must apply with their real legal name, accurate country/city, correct social links, and a real StayKnown identity."
              delay={0}
            />
            <PrincipleCard
              icon={<VideoIcon className="h-5 w-5" />}
              title="Quality first"
              body="Applicants submit one short compressed sample video and four social proof links so StayKnown can review clarity, trust, and audience fit."
              delay={80}
            />
            <PrincipleCard
              icon={<ShieldIcon className="h-5 w-5" />}
              title="Safety brand rules"
              body="Creators must explain StayKnown responsibly and must not mislead users, fake results, exaggerate emergency claims, or damage user trust."
              delay={160}
            />
          </div>
        </section>

        <section className="pt-10">
          <SectionTitle
            kicker="How creators can earn"
            icon={<MoneyIcon className="h-5 w-5" />}
          >
            Creator earning opportunities are based on selection, quality, and
            real performance
          </SectionTitle>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <BulletCard
              icon={<VideoIcon className="h-5 w-5" />}
              title="One-video first enrollment"
              items={[
                "StayKnown may start selected creators with one approved video before any larger campaign.",
                "The first video helps us review delivery, accuracy, editing quality, audience response, and brand fit.",
                "Payment is not automatic just because an application is submitted. You must be selected and approved for a creator opportunity.",
                "StayKnown may decide the earning amount based on video quality, views, engagement, clarity, originality, and campaign value.",
              ]}
            />

            <BulletCard
              icon={<MoneyIcon className="h-5 w-5" />}
              title="How payment may be decided"
              items={[
                "Possible earnings may depend on video quality, verified posting, public engagement, views, audience relevance, and whether the creator followed the brief.",
                "StayKnown may offer a fixed fee, performance-based reward, bonus opportunity, product credit, campaign invite, or ambassador opportunity depending on the campaign.",
                "No creator should claim a fixed amount unless StayKnown has confirmed it in writing.",
                "Fraudulent views, fake engagement, bought followers, copied content, or misleading campaign reports may lead to non-payment and removal.",
              ]}
            />

            <BulletCard
              icon={<LinkIcon className="h-5 w-5" />}
              title="StayKnown feed opportunities"
              items={[
                "Creators enrolled on the platform may be considered for quick creator opportunities based on past activity, profile quality, content behavior, and campaign fit.",
                "Posting responsibly on the StayKnown feed may help us understand creator consistency and safety-awareness style.",
                "Past activities, public profile behavior, audience trust, and quality of previous submissions may influence future creator invitations.",
                "StayKnown may prioritize creators who understand the app, use the platform responsibly, and can explain safety features clearly.",
              ]}
            />

            <BulletCard
              icon={<ShieldIcon className="h-5 w-5" />}
              title="No guarantee of selection or payment"
              items={[
                "Submitting an application does not create employment, partnership, agency, sponsorship, endorsement, or guaranteed payment.",
                "StayKnown may approve, reject, pause, or remove applications at its discretion for brand-safety, quality, legal, compliance, or operational reasons.",
                "Any campaign payment, deliverable, timeline, usage right, and content requirement must be confirmed by StayKnown before work begins.",
                "Creators are responsible for their own taxes, platform rules, local laws, and truthful disclosure of paid or sponsored content where required.",
              ]}
            />
          </div>
        </section>

        <section className="pt-10">
          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.032] p-5 shadow-sm md:p-6">
            <SectionTitle
              kicker="Application review"
              icon={<ReportIcon className="h-5 w-5" />}
            >
              What StayKnown reviews before selecting creators
            </SectionTitle>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {[
                "Legal full name, country, city, email, WhatsApp, TikTok, and StayKnown identity.",
                "Application focus, such as SOS, live map, safety chat, chat translation, I’M SAFE, or general StayKnown awareness.",
                "Four public social proof links showing real creator history, public content, and engagement quality.",
                "One short compressed sample video showing content quality, clarity, delivery, editing, and audience style.",
                "Follower confirmations for Stay Known and 6 Clement Joshua official pages where required by the application.",
                "Whether the applicant appears truthful, safe, professional, brand-aligned, and suitable to explain a safety platform.",
              ].map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-black/24 px-4 py-3"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-white/65" />
                  <span className="text-[13px] font-semibold leading-relaxed text-white/58">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pt-10">
          <div className="grid gap-4 lg:grid-cols-2">
            <BulletCard
              icon={<UserIcon className="h-5 w-5" />}
              title="Identity and future verification"
              items={[
                "Do not upload identity documents on the public creator application form.",
                "If shortlisted, StayKnown may send a private verification link and request identity/KYC documents appropriate to the applicant’s country.",
                "The applicant’s legal name and submitted details must match future verification documents.",
                "Applicants who are not comfortable with future verification should not proceed with the application.",
              ]}
            />

            <BulletCard
              icon={<VideoIcon className="h-5 w-5" />}
              title="Sample video and media handling"
              items={[
                "The sample video must be the applicant’s own content or content they are authorized to submit.",
                "Applicants should upload one short compressed video, maximum 1MB, clear enough for review.",
                "Creators may use trusted compression apps or editors to reduce file size while keeping the clip readable.",
                "Sample videos may be deleted after review or when no longer needed for assessment, compliance, security, or lawful recordkeeping.",
              ]}
            />
          </div>
        </section>

        <section className="pt-10">
          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.032] p-5 shadow-sm md:p-6">
            <SectionTitle
              kicker="Creator conduct"
              icon={<ShieldIcon className="h-5 w-5" />}
            >
              What creators must not do
            </SectionTitle>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {[
                "No false claims that StayKnown guarantees rescue, police response, medical help, or official emergency dispatch.",
                "No misleading demonstrations of SOS, live map, location sharing, approved contacts, or safety chat.",
                "No fake emergencies, staged danger, harassment, stalking, intimidation, or fear-based content that misuses safety features.",
                "No stolen videos, copied content, impersonation, fake identity, fake engagement, bought followers, or inflated campaign results.",
                "No content that promotes abuse, illegal activity, fraud, hacking, bypassing safety checks, or violating platform rules.",
                "No use of StayKnown branding, logo, screenshots, user data, or app materials outside approved campaign instructions.",
                "No public statement that a creator is officially employed, endorsed, sponsored, or partnered unless StayKnown confirms it in writing.",
                "No disclosure of private campaign details, unpublished features, user information, review decisions, or internal communication without permission.",
              ].map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-black/24 px-4 py-3"
                >
                  <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-white/12 bg-white/[0.045] text-[11px] font-black text-white/70">
                    !
                  </span>
                  <span className="text-[13px] font-semibold leading-relaxed text-white/58">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pt-10">
          <SectionTitle
            kicker="Connected pages"
            icon={<LinkIcon className="h-5 w-5" />}
          >
            Read before applying
          </SectionTitle>

          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <LinkCard
              href="/creator-apply"
              title="Creator Application"
              body="Apply to create responsible StayKnown content, feature education, or awareness campaigns."
            />
            <LinkCard
              href="/privacy"
              title="Privacy Policy"
              body="How StayKnown handles application, account, contact, media, and support information."
            />
            <LinkCard
              href="/terms"
              title="Terms of Service"
              body="Main agreement for using StayKnown and its website responsibly."
            />
            <LinkCard
              href="/safety"
              title="Safety & Anti-Stalking"
              body="Rules for safety features, anti-stalking, false emergency, and responsible app explanation."
            />
            <LinkCard
              href="/acceptable-use"
              title="Acceptable Use"
              body="Platform conduct rules for chat, media, accounts, payments, and safety features."
            />
            <LinkCard
              href="/submit-request"
              title="Submit Request"
              body="Use the request form for formal creator, support, or policy questions."
            />
          </div>
        </section>

        <div className="mx-auto mt-12 h-px max-w-3xl bg-white/10" />

        <footer className="mx-auto mt-7 max-w-4xl text-center">
          <div className="mx-auto rounded-[1.6rem] border border-white/10 bg-black/35 px-5 py-6">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] font-black uppercase tracking-[0.12em] text-white/35">
              <a href="/creator-apply" className="transition hover:text-white">
                Apply
              </a>
              <a href="/privacy" className="transition hover:text-white">
                Privacy
              </a>
              <a href="/terms" className="transition hover:text-white">
                Terms
              </a>
              <a href="/safety" className="transition hover:text-white">
                Safety
              </a>
              <a href="/acceptable-use" className="transition hover:text-white">
                Acceptable Use
              </a>
              <a href="/trust-safety" className="transition hover:text-white">
                Trust & Safety
              </a>
            </div>

            <div className="mt-5 flex items-center justify-center gap-3">
              <Image
                src="/6logo.png"
                alt="6 Clement Joshua service logo"
                width={28}
                height={28}
                className="rounded-md bg-white object-contain p-0.5"
              />
              <div className="text-[12px] font-semibold text-white/55">
                A 6 Clement Joshua service
                <span className="ml-1 align-super text-[10px] text-white/28">
                  ™
                </span>
              </div>
            </div>

            <div className="mt-2 text-[11px] font-semibold text-white/32">
              {new Date().getFullYear()} • stay-known.com
            </div>

            <p className="mx-auto mt-3 max-w-2xl text-[11px] font-semibold leading-relaxed text-white/30">
              This Creator Policy is for transparency and does not create
              employment, partnership, endorsement, sponsorship, agency,
              guaranteed enrollment, or guaranteed payment.
            </p>
          </div>
        </footer>
      </section>
    </main>
  );
}
