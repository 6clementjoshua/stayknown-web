import type { UpdateBlock } from "@/lib/stayknown-updates";
import { visibleUpdateBlocks } from "@/lib/stayknown-updates";

const paragraphSize = {
  compact: "text-[14px] leading-[1.85] sm:text-[15px]",
  standard: "text-[15px] leading-[1.9] sm:text-[16px]",
  large: "text-[17px] leading-[1.85] sm:text-[19px]",
} as const;

const paragraphWeight = {
  regular: "font-medium",
  medium: "font-semibold",
} as const;

const h2Size = {
  standard: "text-[30px] sm:text-[38px]",
  large: "text-[34px] sm:text-[44px]",
  display: "text-[40px] sm:text-[54px]",
} as const;

const h3Size = {
  standard: "text-[21px] sm:text-[23px]",
  large: "text-[25px] sm:text-[29px]",
} as const;

const quoteSize = {
  standard: "text-[19px] sm:text-[21px]",
  emphasis: "text-[23px] sm:text-[28px]",
} as const;

const imageWidth = {
  content: "w-full",
  wide: "relative left-1/2 w-[min(900px,calc(100vw-2rem))] -translate-x-1/2",
  full: "relative left-1/2 w-[min(1120px,calc(100vw-2rem))] -translate-x-1/2",
} as const;

function alignment(align: "left" | "center" | undefined) {
  return align === "center" ? "text-center" : "text-left";
}

export function UpdateBlocks({
  blocks,
  fallbackPosterUrl = "",
}: {
  blocks: UpdateBlock[];
  fallbackPosterUrl?: string;
}) {
  return (
    <div className="mx-auto max-w-[760px] space-y-7">
      {visibleUpdateBlocks(blocks).map((block, index) => {
        if (block.type === "heading2") {
          return (
            <h2
              key={index}
              className={`pt-7 font-black leading-[0.98] tracking-[-0.055em] ${h2Size[block.size || "standard"]} ${alignment(block.align)}`}
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === "heading3") {
          return (
            <h3
              key={index}
              className={`pt-4 font-black tracking-[-0.035em] ${h3Size[block.size || "standard"]} ${alignment(block.align)}`}
            >
              {block.text}
            </h3>
          );
        }

        if (block.type === "quote") {
          const centered = block.align === "center";
          return (
            <blockquote
              key={index}
              className={`${quoteSize[block.size || "standard"]} font-bold leading-relaxed text-white/[0.82] ${
                centered
                  ? "border-y border-white/[0.16] px-3 py-6 text-center"
                  : "border-l border-white/[0.35] pl-5 text-left"
              }`}
            >
              {block.text}
            </blockquote>
          );
        }

        if (block.type === "callout") {
          const emphasis = block.size === "emphasis";
          return (
            <aside
              key={index}
              className={`rounded-[26px] border border-white/[0.12] bg-white/[0.028] ${
                emphasis ? "p-7 sm:p-8" : "p-6"
              }`}
            >
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/[0.38]">
                {block.title || "StayKnown note"}
              </div>
              <p
                className={`mt-3 font-semibold text-white/[0.7] ${
                  emphasis
                    ? "text-[16px] leading-8 sm:text-[18px]"
                    : "text-[14px] leading-7"
                }`}
              >
                {block.text}
              </p>
            </aside>
          );
        }

        if (block.type === "image") {
          return (
            <figure
              key={index}
              className={`py-4 ${imageWidth[block.width || "content"]}`}
            >
              <img
                src={block.url}
                alt={block.alt || ""}
                loading="lazy"
                className="w-full rounded-[28px] border border-white/[0.1] object-cover"
              />
              {block.caption ? (
                <figcaption
                  className={`mt-3 font-semibold leading-relaxed text-white/[0.4] ${
                    block.caption_size === "standard"
                      ? "text-[11px] sm:text-[12px]"
                      : "text-[10px] sm:text-[11px]"
                  } ${alignment(block.caption_align)}`}
                >
                  {block.caption}
                </figcaption>
              ) : null}
            </figure>
          );
        }

        if (block.type === "video") {
          return (
            <figure
              key={index}
              className={`py-4 ${imageWidth[block.width || "wide"]}`}
            >
              <video
                src={block.url}
                poster={block.poster_url || fallbackPosterUrl || undefined}
                controls
                playsInline
                preload="metadata"
                className="w-full rounded-[28px] border border-white/[0.1] bg-black"
              />
              {block.caption ? (
                <figcaption className="mt-3 text-[10px] font-semibold leading-relaxed text-white/[0.4] sm:text-[11px]">
                  {block.caption}
                </figcaption>
              ) : null}
            </figure>
          );
        }

        if (block.type === "audio") {
          return (
            <section
              key={index}
              className="rounded-[24px] border border-white/[0.1] bg-white/[0.025] p-4 sm:p-5"
            >
              {block.title ? (
                <div className="mb-3 text-[11px] font-black text-white/[0.72]">
                  {block.title}
                </div>
              ) : null}
              <audio src={block.url} controls preload="metadata" className="w-full" />
              {block.caption ? (
                <p className="mt-3 text-[10px] font-semibold leading-5 text-white/[0.38]">
                  {block.caption}
                </p>
              ) : null}
            </section>
          );
        }

        if (block.type === "file") {
          return (
            <a
              key={index}
              href={block.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-4 rounded-[24px] border border-white/[0.1] bg-white/[0.02] p-4 transition hover:border-white/[0.25] hover:bg-white/[0.045]"
            >
              <div>
                <div className="text-[8px] font-black uppercase tracking-[0.16em] text-white/[0.3]">
                  Publication file
                </div>
                <div className="mt-1 text-[12px] font-black text-white/[0.72]">
                  {block.label || "Open attached file"}
                </div>
              </div>
              <span className="text-[12px] font-black text-white/[0.42]">↗</span>
            </a>
          );
        }

        if (block.type === "divider") {
          return <hr key={index} className="my-10 border-white/[0.1]" />;
        }

        if (block.type === "link") {
          return (
            <a
              key={index}
              href={block.url}
              className={`inline-flex rounded-full border border-white/[0.16] font-black transition hover:bg-white hover:text-black ${
                block.size === "compact"
                  ? "px-3.5 py-2 text-[10px]"
                  : "px-4 py-2.5 text-[11px]"
              }`}
            >
              {block.label} ↗
            </a>
          );
        }

        if (block.type === "paragraph") {
          return (
            <p
              key={index}
              className={`text-white/[0.7] ${paragraphSize[block.size || "standard"]} ${paragraphWeight[block.weight || "regular"]} ${alignment(block.align)}`}
            >
              {block.text}
            </p>
          );
        }

        return null;
      })}
    </div>
  );
}
