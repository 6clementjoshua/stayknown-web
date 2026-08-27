import type { UpdateBlock } from "@/lib/stayknown-updates";
export function UpdateBlocks({ blocks }: { blocks: UpdateBlock[] }) {
  return (
    <div className="mx-auto max-w-[760px] space-y-7">
      {blocks.map((b: any, i) => {
        if (b.type === "heading2")
          return (
            <h2
              key={i}
              className="pt-7 text-[32px] font-black leading-[.98] tracking-[-.055em] sm:text-[42px]"
            >
              {b.text}
            </h2>
          );
        if (b.type === "heading3")
          return (
            <h3
              key={i}
              className="pt-4 text-[22px] font-black tracking-[-.035em]"
            >
              {b.text}
            </h3>
          );
        if (b.type === "quote")
          return (
            <blockquote
              key={i}
              className="border-l border-white/35 pl-5 text-[20px] font-bold leading-relaxed text-white/80"
            >
              {b.text}
            </blockquote>
          );
        if (b.type === "callout")
          return (
            <aside
              key={i}
              className="rounded-[26px] border border-white/12 bg-white/[.028] p-6"
            >
              <div className="text-[9px] font-black uppercase tracking-[.2em] text-white/35">
                {b.title || "StayKnown note"}
              </div>
              <p className="mt-3 text-[14px] font-semibold leading-7 text-white/68">
                {b.text}
              </p>
            </aside>
          );
        if (b.type === "image")
          return (
            <figure key={i} className="py-4">
              <img
                src={b.url}
                alt={b.alt || ""}
                loading="lazy"
                className="w-full rounded-[28px] border border-white/10 object-cover"
              />
              {b.caption ? (
                <figcaption className="mt-3 text-[10px] font-semibold leading-relaxed text-white/38">
                  {b.caption}
                </figcaption>
              ) : null}
            </figure>
          );
        if (b.type === "divider")
          return <hr key={i} className="my-10 border-white/10" />;
        if (b.type === "link")
          return (
            <a
              key={i}
              href={b.url}
              className="inline-flex rounded-full border border-white/16 px-4 py-2.5 text-[11px] font-black transition hover:bg-white hover:text-black"
            >
              {b.label} ↗
            </a>
          );
        return (
          <p
            key={i}
            className="text-[15px] font-medium leading-[1.9] text-white/68 sm:text-[16px]"
          >
            {b.text}
          </p>
        );
      })}
    </div>
  );
}
