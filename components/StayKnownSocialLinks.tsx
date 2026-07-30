"use client";

type SocialName = "tiktok" | "x" | "youtube";

type SocialLink = {
  name: SocialName;
  label: string;
  href: string;
};

const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    name: "tiktok",
    label: "Open StayKnown on TikTok",
    href: "https://www.tiktok.com/@stayknownapp",
  },
  {
    name: "x",
    label: "Open StayKnown on X",
    href: "https://x.com/stayknownapp",
  },
  {
    name: "youtube",
    label: "Open StayKnown on YouTube",
    href: "https://www.youtube.com/@stayknownapp",
  },
];

function SocialGlyph({ name }: { name: SocialName }) {
  if (name === "tiktok") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
        <path d="M15.6 3c.42 1.74 1.44 3.12 3.4 3.74v3.02a8.2 8.2 0 0 1-3.38-1.05v6.05A6.24 6.24 0 1 1 10.2 8.6v3.08a3.23 3.23 0 1 0 2.38 3.12V3h3.02Z" />
      </svg>
    );
  }

  if (name === "x") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
        <path d="M4.3 3h4.6l4.1 5.48L17.78 3H20l-5.98 6.86L20.7 21h-4.6l-4.62-6.18L6.08 21H3.85l6.6-7.56L4.3 3Zm3.5 1.7H6.9l10.08 14.6h.9L7.8 4.7Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
      <path d="M21.58 7.19a2.84 2.84 0 0 0-2-2C17.82 4.7 12 4.7 12 4.7s-5.82 0-7.58.49a2.84 2.84 0 0 0-2 2A29.46 29.46 0 0 0 1.93 12a29.46 29.46 0 0 0 .49 4.81 2.84 2.84 0 0 0 2 2c1.76.49 7.58.49 7.58.49s5.82 0 7.58-.49a2.84 2.84 0 0 0 2-2 29.46 29.46 0 0 0 .49-4.81 29.46 29.46 0 0 0-.49-4.81ZM10 15.12V8.88L15.2 12 10 15.12Z" />
    </svg>
  );
}

export default function StayKnownSocialLinks({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {!compact ? (
        <span className="mr-1 text-[9px] font-black uppercase tracking-[0.16em] text-white/34">
          Follow @stayknownapp
        </span>
      ) : null}

      {SOCIAL_LINKS.map((social) => (
        <a
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.label}
          title={social.label}
          className="group relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-[12px] border border-white/[0.13] bg-[linear-gradient(145deg,rgba(255,255,255,0.11),rgba(255,255,255,0.025))] text-white/68 shadow-[inset_0_1px_0_rgba(255,255,255,0.13),0_10px_24px_rgba(0,0,0,0.38)] transition duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:border-white/30 hover:bg-white hover:text-black active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          <span className="pointer-events-none absolute inset-x-2 top-0 h-px bg-white/35 transition group-hover:bg-white" />
          <SocialGlyph name={social.name} />
        </a>
      ))}
    </div>
  );
}
