import Image from "next/image";
import Link from "next/link";

import type { UpdatePost } from "@/lib/stayknown-updates";
import {
  getUpdatePresentation,
  publicDate,
} from "@/lib/stayknown-updates";

import { StayKnownUpdateEffects } from "./StayKnownUpdateEffects";
import { UpdateBlocks } from "./UpdateBlocks";
import { UpdateLikeButton } from "./UpdateLikeButton";
import { UpdatesSiteFooter } from "./UpdatesFeed";

const titleScale = {
  standard:
    "text-[40px] leading-[0.92] tracking-[-0.066em] sm:text-[62px] lg:text-[78px]",
  feature:
    "text-[46px] leading-[0.88] tracking-[-0.072em] sm:text-[72px] lg:text-[92px]",
} as const;

const summaryScale = {
  standard: "text-[16px] leading-7 sm:text-[19px]",
  large: "text-[18px] leading-8 sm:text-[22px]",
} as const;

const kickerScale = {
  standard: "text-[11px] tracking-[0.19em]",
  prominent: "text-[12px] tracking-[0.2em] sm:text-[13px]",
} as const;

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

  const presentation = getUpdatePresentation(post.body || []);

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

      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-black/[0.82] px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto grid max-w-[1120px] grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 sm:grid-cols-[1fr_auto_1fr]">
          <Link
            href="/updates"
            className="inline-flex items-center gap-2.5 justify-self-start text-[11px] font-black tracking-[0.18em]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-[11px] border border-white bg-white">
              <Image src="/6logo.png" alt="" width={18} height={18} />
            </span>
            <span>
              STAYKNOWN <span className="text-white/[0.35]">UPDATES</span>
            </span>
          </Link>

          <div className="col-span-2 row-start-2 justify-self-center whitespace-nowrap text-[8px] font-black uppercase tracking-[0.28em] text-white/[0.46] sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:text-[9px] lg:text-[10px]">
            ELIXIR OF SAFETY
          </div>

          <div className="justify-self-end text-right text-[8px] font-black uppercase tracking-[0.14em] text-white/[0.35] sm:col-start-3 sm:text-[9px] sm:tracking-[0.17em]">
            A 6 Clement Joshua service™
          </div>
        </div>
      </header>

      <article className="px-4 pb-24 pt-14 sm:px-6 sm:pt-20">
        <div className="mx-auto max-w-[980px]">
          <div className="text-[9px] font-black uppercase tracking-[0.22em] text-white/[0.38]">
            {post.category} · {date}
          </div>

          {post.kicker ? (
            <div
              className={`mt-8 font-black uppercase text-white/[0.5] ${kickerScale[presentation.kicker_scale]}`}
            >
              {post.kicker}
            </div>
          ) : null}

          <h1
            className={`mt-4 max-w-[920px] font-black ${titleScale[presentation.title_scale]}`}
          >
            {post.title}
          </h1>

          <p
            className={`mt-8 max-w-[760px] font-semibold text-white/[0.56] ${summaryScale[presentation.summary_scale]}`}
          >
            {post.summary}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <UpdateLikeButton
              postId={post.id}
              initial={Number(post.like_count || 0)}
            />
            <span className="rounded-full border border-white/[0.1] px-3.5 py-2 text-[10px] font-black text-white/[0.42]">
              ◉ {views.toLocaleString()} views
            </span>
          </div>

          {post.hero_image_url || post.image_16_9_url ? (
            <figure className="mt-12 overflow-hidden rounded-[34px] border border-white/[0.1]">
              <img
                src={post.hero_image_url || post.image_16_9_url || ""}
                alt={post.hero_alt_text || ""}
                className="aspect-[16/9] w-full object-cover"
              />
            </figure>
          ) : null}

          <div className="mt-14">
            <UpdateBlocks blocks={post.body || []} fallbackPosterUrl={post.image_16_9_url || post.hero_image_url || ""} />
          </div>

          <footer className="mx-auto mt-16 max-w-[760px] border-t border-white/[0.1] pt-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[8px] font-black uppercase tracking-[0.18em] text-white/[0.28]">
                  Published by
                </div>
                <div className="mt-1 text-[12px] font-black text-white/[0.68]">
                  {post.author_name}
                </div>
              </div>

              <Link
                href="/updates"
                className="rounded-full border border-white/[0.15] px-4 py-2 text-[10px] font-black transition hover:bg-white hover:!text-black"
              >
                Back to Updates
              </Link>
            </div>
          </footer>
        </div>
      </article>

      <UpdatesSiteFooter />
    </main>
  );
}
