import Link from "next/link";
import type { UpdatePost } from "@/lib/stayknown-updates";
import { publicDate } from "@/lib/stayknown-updates";
import { UpdateBlocks } from "./UpdateBlocks";
import { UpdateLikeButton } from "./UpdateLikeButton";
import { StayKnownUpdateEffects } from "./StayKnownUpdateEffects";

export function UpdateArticle({
  post,
  views,
}: {
  post: UpdatePost;
  views: number;
}) {
  const date = new Intl.DateTimeFormat("en", {
    dateStyle: "long",
    timeZone: "Africa/Lagos",
  }).format(new Date(publicDate(post)));
  return (
    <main
      className={`min-h-screen bg-black text-white sk-update-preset-${post.animation_preset}`}
    >
      <StayKnownUpdateEffects preset={post.animation_preset} postId={post.id} />
      <style>{`
@keyframes skFall{0%{transform:translate3d(0,-8vh,0) rotate(0);opacity:0}8%{opacity:1}100%{transform:translate3d(var(--drift,40px),110vh,0) rotate(720deg);opacity:.1}}
@keyframes skEditorialRise{0%{opacity:0;transform:translateY(26px)}100%{opacity:1;transform:translateY(0)}}
@keyframes skQuietGlow{0%{opacity:.45;filter:brightness(.78)}100%{opacity:1;filter:brightness(1)}}
@keyframes skLineSweep{0%{clip-path:inset(0 100% 0 0)}100%{clip-path:inset(0 0 0 0)}}
@keyframes skSpotlight{0%{opacity:.2;filter:blur(7px);transform:scale(.985)}100%{opacity:1;filter:blur(0);transform:scale(1)}}
@keyframes skMilestone{0%{opacity:0;transform:scale(.94) translateY(18px)}62%{transform:scale(1.012) translateY(0)}100%{opacity:1;transform:scale(1)}}
.sk-confetti{animation-name:skFall;animation-timing-function:cubic-bezier(.16,.78,.18,1);animation-fill-mode:both}
.sk-update-preset-editorial-rise article>div{animation:skEditorialRise .78s cubic-bezier(.16,.78,.18,1) both}
.sk-update-preset-quiet-glow article>div{animation:skQuietGlow 1.15s ease-out both}
.sk-update-preset-line-sweep h1{animation:skLineSweep .95s cubic-bezier(.16,.78,.18,1) both}
.sk-update-preset-spotlight article>div{animation:skSpotlight .9s cubic-bezier(.16,.78,.18,1) both}
.sk-update-preset-milestone-burst article>div{animation:skMilestone .85s cubic-bezier(.16,.78,.18,1) both}
@media(prefers-reduced-motion:reduce){.sk-confetti{display:none}.sk-update-preset-editorial-rise article>div,.sk-update-preset-quiet-glow article>div,.sk-update-preset-line-sweep h1,.sk-update-preset-spotlight article>div,.sk-update-preset-milestone-burst article>div{animation:none!important}}
`}</style>
      <header className="sticky top-0 z-40 border-b border-white/[.08] bg-black/82 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between">
          <Link
            href="/updates"
            className="text-[11px] font-black tracking-[.18em]"
          >
            STAYKNOWN <span className="text-white/35">UPDATES</span>
          </Link>
          <div className="text-[9px] font-black uppercase tracking-[.17em] text-white/35">
            A 6 Clement Joshua service™
          </div>
        </div>
      </header>
      <article className="px-4 pb-24 pt-14 sm:px-6 sm:pt-20">
        <div className="mx-auto max-w-[980px]">
          <div className="text-[9px] font-black uppercase tracking-[.22em] text-white/38">
            {post.category} · {date}
          </div>
          {post.kicker ? (
            <div className="mt-8 text-[11px] font-black uppercase tracking-[.19em] text-white/50">
              {post.kicker}
            </div>
          ) : null}
          <h1 className="mt-4 max-w-[920px] text-[46px] font-black leading-[.88] tracking-[-.072em] sm:text-[72px] lg:text-[92px]">
            {post.title}
          </h1>
          <p className="mt-8 max-w-[760px] text-[16px] font-semibold leading-7 text-white/54 sm:text-[19px]">
            {post.summary}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <UpdateLikeButton
              postId={post.id}
              initial={Number(post.like_count || 0)}
            />
            <span className="rounded-full border border-white/10 px-3.5 py-2 text-[10px] font-black text-white/42">
              ◉ {views.toLocaleString()} views
            </span>
          </div>
          {post.hero_image_url || post.image_16_9_url ? (
            <figure className="mt-12 overflow-hidden rounded-[34px] border border-white/10">
              <img
                src={post.hero_image_url || post.image_16_9_url || ""}
                alt={post.hero_alt_text || ""}
                className="aspect-[16/9] w-full object-cover"
              />
            </figure>
          ) : null}
          <div className="mt-14">
            <UpdateBlocks blocks={post.body || []} />
          </div>
          <footer className="mx-auto mt-16 max-w-[760px] border-t border-white/10 pt-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[8px] font-black uppercase tracking-[.18em] text-white/28">
                  Published by
                </div>
                <div className="mt-1 text-[12px] font-black text-white/68">
                  {post.author_name}
                </div>
              </div>
              <Link
                href="/updates"
                className="rounded-full border border-white/15 px-4 py-2 text-[10px] font-black transition hover:bg-white hover:text-black"
              >
                Back to Updates
              </Link>
            </div>
          </footer>
        </div>
      </article>
    </main>
  );
}
