import Link from "next/link";
import type { UpdatePost } from "@/lib/stayknown-updates";
import { publicDate } from "@/lib/stayknown-updates";
export function UpdatesFeed({
  posts,
  totalViews,
}: {
  posts: UpdatePost[];
  totalViews: number;
}) {
  const groups = new Map<string, UpdatePost[]>();
  for (const p of posts) {
    const k = new Intl.DateTimeFormat("en", {
      month: "long",
      year: "numeric",
      timeZone: "Africa/Lagos",
    }).format(new Date(publicDate(p)));
    groups.set(k, [...(groups.get(k) || []), p]);
  }
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-white/[.08] px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-[1160px] items-center justify-between">
          <Link href="/" className="text-[11px] font-black tracking-[.18em]">
            STAYKNOWN
          </Link>
          <div className="rounded-full border border-white/12 bg-white/[.03] px-3 py-2 text-[9px] font-black text-white/45">
            ◉ {totalViews.toLocaleString()} UPDATE VIEWS
          </div>
        </div>
      </header>
      <section className="px-4 pb-14 pt-20 sm:px-6 sm:pt-28">
        <div className="mx-auto max-w-[1160px]">
          <div className="text-[9px] font-black uppercase tracking-[.25em] text-white/32">
            Product · Safety · Technology · Company
          </div>
          <h1 className="mt-5 text-[62px] font-black leading-[.82] tracking-[-.078em] sm:text-[94px] lg:text-[124px]">
            StayKnown
            <br />
            Updates.
          </h1>
          <p className="mt-8 max-w-[620px] text-[14px] font-semibold leading-7 text-white/48">
            The official public record of what StayKnown is building, changing,
            releasing and learning across safety technology.
          </p>
        </div>
      </section>
      <section className="border-t border-white/[.08] px-4 pb-28 sm:px-6">
        <div className="mx-auto max-w-[1160px]">
          {[...groups.entries()].map(([month, items]) => (
            <section key={month} className="pt-16">
              <div className="sticky top-0 z-20 -mx-2 border-b border-white/[.07] bg-black/92 px-2 py-3 text-[9px] font-black uppercase tracking-[.24em] text-white/32 backdrop-blur-xl">
                {month}
              </div>
              <div>
                {items.map((p, i) => (
                  <article
                    key={p.id}
                    className="group border-b border-white/[.09] py-12 sm:py-16"
                  >
                    <Link href={`/updates/${p.slug}`} className="block">
                      <div className="grid gap-7 lg:grid-cols-[1fr_.42fr] lg:items-end">
                        <div>
                          <div className="text-[9px] font-black uppercase tracking-[.2em] text-white/30">
                            {p.category} ·{" "}
                            {new Intl.DateTimeFormat("en", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              timeZone: "Africa/Lagos",
                            }).format(new Date(publicDate(p)))}
                          </div>
                          <h2 className="mt-4 max-w-[800px] text-[36px] font-black leading-[.94] tracking-[-.055em] transition duration-500 group-hover:translate-x-1 sm:text-[52px]">
                            {p.title}
                          </h2>
                          <p className="mt-5 max-w-[680px] text-[13px] font-semibold leading-6 text-white/45">
                            {p.summary}
                          </p>
                        </div>
                        <div className="lg:text-right">
                          <span className="inline-flex rounded-full border border-white/14 px-4 py-2.5 text-[10px] font-black transition duration-300 group-hover:bg-white group-hover:text-black">
                            Read update ↗
                          </span>
                          <div className="mt-3 text-[9px] font-black text-white/26">
                            ♡ {Number(p.like_count || 0).toLocaleString()}
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
            <div className="py-24 text-[13px] font-semibold text-white/38">
              No public updates yet.
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
