"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export type SlideKind = "pill" | "device";

export type HeroSlide = {
  id: string;
  src: string;
  kind: SlideKind;
  title: string;
  teaser: string;

  /**
   * Optional: override the Learn More route per slide.
   * If not provided, we use `${learnBasePath}/${id}`.
   */
  learnHref?: string;
};

export type HeroSliderHandle = {
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
};

type Props = {
  slides: HeroSlide[];
  intervalMs?: number;
  learnBasePath?: string;
  autoplay?: boolean;
};

type Direction = -1 | 0 | 1;

const routeAlias: Record<string, string> = {
  "sos-activated": "sos",
  "sos-live-idle": "sos",
  "vpn-safety-gate": "vpn-safety",
  "secure-chat-biometric": "secure-chat-protection",
  "secure-chat-passcode": "secure-chat-protection",
  "chat-translation": "language-aware-chat",
  "chat-stickers-voice": "chat",
  "stories-profile": "stories-profile-trust",
  "get-safe-hints": "get-safe-guidance",
};

const HeroSlider = forwardRef<HeroSliderHandle, Props>(function HeroSlider(
  { slides, intervalMs = 6000, learnBasePath = "/learn", autoplay = true },
  ref,
) {
  // ✅ Use every slide passed from /learn/page.tsx.
  // The old code used slides.slice(0, 6), which hid the rest of your hero flow.
  const items = useMemo(() => slides, [slides]);

  const [[idx, direction], setSlideState] = useState<[number, Direction]>([
    0, 0,
  ]);

  const timerRef = useRef<number | null>(null);
  const hoverRef = useRef(false);

  const prefersReducedMotion = useReducedMotion();
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(hover: none) and (pointer: coarse)");

    const apply = (e?: MediaQueryList | MediaQueryListEvent) => {
      const source = e ?? mq;
      setIsCoarsePointer(source.matches);
    };

    apply(mq);
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!items.length) return;

    setSlideState(([current]) => [Math.min(current, items.length - 1), 0]);
  }, [items.length]);

  const go = useCallback(
    (nextIndex: number, nextDirection: Direction = 0) => {
      const total = items.length;
      if (!total) return;

      const safeIndex = ((nextIndex % total) + total) % total;
      setSlideState([safeIndex, nextDirection]);
    },
    [items.length],
  );

  const next = useCallback(() => {
    const total = items.length;
    if (!total) return;

    setSlideState(([current]) => [(current + 1) % total, 1]);
  }, [items.length]);

  const prev = useCallback(() => {
    const total = items.length;
    if (!total) return;

    setSlideState(([current]) => [(current - 1 + total) % total, -1]);
  }, [items.length]);

  useImperativeHandle(
    ref,
    () => ({
      next,
      prev,
      goTo: (index: number) => {
        const total = items.length;
        if (!total) return;

        setSlideState(([current]) => {
          const safeIndex = ((index % total) + total) % total;
          const nextDirection: Direction =
            safeIndex === current ? 0 : safeIndex > current ? 1 : -1;
          return [safeIndex, nextDirection];
        });
      },
    }),
    [next, prev, items.length],
  );

  useEffect(() => {
    if (!autoplay) return;
    if (items.length <= 1) return;
    if (typeof window === "undefined") return;

    const clear = () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      timerRef.current = null;
    };

    const start = () => {
      clear();

      timerRef.current = window.setInterval(() => {
        if (!hoverRef.current && !document.hidden) {
          next();
        }
      }, intervalMs);
    };

    start();

    const onVisibilityChange = () => start();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clear();
    };
  }, [autoplay, items.length, intervalMs, next]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const slide = items[idx];
  if (!slide) return null;

  const textVariants = {
    enter: (dir: Direction) => ({
      opacity: 0,
      x: prefersReducedMotion ? 0 : dir >= 0 ? 26 : -26,
      y: prefersReducedMotion ? 0 : 4,
      scale: prefersReducedMotion ? 1 : 0.972,
      filter: prefersReducedMotion ? "blur(0px)" : "blur(3px)",
    }),
    center: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
    },
    exit: (dir: Direction) => ({
      opacity: 0,
      x: prefersReducedMotion ? 0 : dir >= 0 ? -30 : 30,
      y: prefersReducedMotion ? 0 : -2,
      scale: prefersReducedMotion ? 1 : 0.985,
      filter: prefersReducedMotion ? "blur(0px)" : "blur(3px)",
    }),
  };

  const deviceVariants = {
    enter: (dir: Direction) => ({
      opacity: 0,
      x: prefersReducedMotion ? 0 : dir >= 0 ? 22 : -22,
      y: prefersReducedMotion ? 0 : 8,
      scale: prefersReducedMotion ? 1 : 0.972,
      filter: prefersReducedMotion ? "blur(0px)" : "blur(2px)",
    }),
    center: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
    },
    exit: (dir: Direction) => ({
      opacity: 0,
      x: prefersReducedMotion ? 0 : dir >= 0 ? -26 : 26,
      y: prefersReducedMotion ? 0 : -4,
      scale: prefersReducedMotion ? 1 : 1.01,
      filter: prefersReducedMotion ? "blur(0px)" : "blur(2px)",
    }),
  };

  const TRANSITION_TEXT = {
    duration: prefersReducedMotion ? 0.15 : 0.72,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  const TRANSITION_DEVICE = {
    duration: prefersReducedMotion ? 0.15 : 0.78,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  const SWIPE_OFFSET = 60;
  const SWIPE_VELOCITY = 500;

  const mappedId = routeAlias[slide.id] ?? slide.id;
  const learnHref = slide.learnHref ?? `${learnBasePath}/${mappedId}`;

  const pauseBriefly = () => {
    hoverRef.current = true;
    window.setTimeout(() => {
      hoverRef.current = false;
    }, 900);
  };

  const handlePrev = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    pauseBriefly();
    prev();
  };

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    pauseBriefly();
    next();
  };

  const LearnMoreCta = ({ size }: { size: "mobile" | "desktop" }) => (
    <Link
      href={learnHref}
      className={[
        "relative z-[70] inline-flex items-center justify-center select-none overflow-hidden",
        "rounded-full border backdrop-blur-xl transition-all duration-200",
        "shadow-[0_18px_40px_rgba(0,0,0,0.55)]",
        "border-white/14 bg-white/[0.07] text-white",
        "hover:bg-white hover:border-white/25 hover:!text-black",
        "active:bg-black active:border-white/20 active:!text-white active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
        size === "mobile" ? "h-9 px-4 text-[12px]" : "h-11 px-5 text-[13px]",
      ].join(" ")}
      aria-label={`Learn more about ${slide.title}`}
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.20),transparent_58%)]" />
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.18),transparent)] -translate-x-[120%] group-hover:translate-x-[120%] transition duration-700" />
      <span className="relative">Learn more</span>
      <span className="relative ml-2 opacity-70">→</span>
      <span className="pointer-events-none absolute inset-0 opacity-0 active:opacity-100 transition duration-75 bg-white/[0.06]" />
    </Link>
  );

  return (
    <div
      className="relative w-full group"
      onMouseEnter={() => {
        hoverRef.current = true;
      }}
      onMouseLeave={() => {
        hoverRef.current = false;
      }}
      onFocusCapture={() => {
        hoverRef.current = true;
      }}
      onBlurCapture={() => {
        hoverRef.current = false;
      }}
      style={{ WebkitTapHighlightColor: "transparent" }}
      aria-roledescription="carousel"
      aria-label="StayKnown hero slider"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.06),transparent_55%)]" />

      <div className="relative w-full min-h-[520px] md:min-h-[600px] lg:min-h-[620px]">
        <div
          className="
            relative grid grid-cols-1 lg:grid-cols-[0.98fr_1.02fr]
            items-center gap-7 sm:gap-8 md:gap-10
            h-[68vh] max-h-[680px] min-h-[520px]
            pb-10 sm:pb-12 md:pb-14
          "
        >
          {/* Caption */}
          <div className="relative z-[30] flex items-center justify-center lg:justify-start order-1 lg:order-2">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={`${slide.id}-${idx}-text`}
                custom={direction}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={TRANSITION_TEXT}
                className="w-full max-w-[760px] pr-0 lg:pr-2 text-center lg:text-left"
              >
                <div className="relative">
                  <div className="text-white/95 font-black tracking-[-0.03em] text-[38px] sm:text-[52px] md:text-[62px] leading-[0.98]">
                    {slide.title}
                  </div>

                  <div className="mt-4 text-white/58 font-semibold text-[13px] sm:text-[14px] md:text-[14.5px] leading-relaxed mx-auto lg:mx-0 max-w-[64ch]">
                    {slide.teaser}
                  </div>

                  <div className="mt-7 hidden sm:flex items-center justify-center lg:justify-start">
                    <LearnMoreCta size="desktop" />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Device */}
          <div className="relative z-[20] flex items-center justify-center lg:justify-start lg:pl-2 order-2 lg:order-1">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={`${slide.id}-${idx}-device`}
                custom={direction}
                variants={deviceVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={TRANSITION_DEVICE}
                className="relative z-[20]"
                drag={isCoarsePointer ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.18}
                onDragStart={() => {
                  hoverRef.current = true;
                }}
                onDragEnd={(_, info) => {
                  hoverRef.current = false;
                  if (!isCoarsePointer) return;

                  if (
                    info.offset.x < -SWIPE_OFFSET ||
                    info.velocity.x < -SWIPE_VELOCITY
                  ) {
                    next();
                  }

                  if (
                    info.offset.x > SWIPE_OFFSET ||
                    info.velocity.x > SWIPE_VELOCITY
                  ) {
                    prev();
                  }
                }}
              >
                <motion.div
                  animate={
                    prefersReducedMotion
                      ? { y: 0 }
                      : { y: [0, -1.5, 0, 1.5, 0] }
                  }
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : {
                          duration: 10,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }
                  }
                >
                  <img
                    src={slide.src}
                    alt={slide.title}
                    draggable={false}
                    className="
                      relative z-[20]
                      block w-auto object-contain select-none
                      drop-shadow-[0_22px_80px_rgba(0,0,0,0.75)]
                      max-w-[82vw] max-h-[40vh]
                      sm:max-w-[520px] sm:max-h-[56vh]
                      md:max-w-[560px] md:max-h-[62vh]
                      lg:max-w-[620px] lg:max-h-[68vh]
                      xl:max-w-[660px]
                    "
                  />
                </motion.div>

                <div className="relative z-[70] mt-5 flex sm:hidden items-center justify-center">
                  <LearnMoreCta size="mobile" />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Arrows */}
        <div
          className="
            pointer-events-none absolute left-0 right-0 top-[56%] z-[90]
            -translate-y-1/2 sm:top-1/2
            flex items-center justify-between
          "
        >
          <button
            onClick={handlePrev}
            className="
              pointer-events-auto flex items-center justify-center
              rounded-full border border-white/14 bg-black/45
              backdrop-blur-xl text-white/85
              shadow-[0_14px_38px_rgba(0,0,0,0.55)]
              transition-all duration-200
              hover:bg-white hover:text-black hover:border-white/25
              active:scale-95
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30
              w-9 h-9 sm:w-11 sm:h-11
              text-[24px] sm:text-[28px] font-black leading-none
            "
            aria-label="Previous slide"
            type="button"
          >
            <span className="-mt-[2px]">‹</span>
          </button>

          <button
            onClick={handleNext}
            className="
              pointer-events-auto flex items-center justify-center
              rounded-full border border-white/14 bg-black/45
              backdrop-blur-xl text-white/85
              shadow-[0_14px_38px_rgba(0,0,0,0.55)]
              transition-all duration-200
              hover:bg-white hover:text-black hover:border-white/25
              active:scale-95
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30
              w-9 h-9 sm:w-11 sm:h-11
              text-[24px] sm:text-[28px] font-black leading-none
            "
            aria-label="Next slide"
            type="button"
          >
            <span className="-mt-[2px]">›</span>
          </button>
        </div>

        {/* Dots */}
        {items.length > 1 ? (
          <div className="absolute inset-x-0 bottom-9 z-[85] flex items-center justify-center gap-2">
            {items.map((item, dotIndex) => {
              const active = dotIndex === idx;

              return (
                <button
                  key={`${item.id}-${dotIndex}`}
                  type="button"
                  aria-label={`Go to slide ${dotIndex + 1}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    pauseBriefly();
                    go(dotIndex, dotIndex > idx ? 1 : -1);
                  }}
                  className={[
                    "h-1.5 rounded-full border border-white/10 transition-all duration-300",
                    active
                      ? "w-6 bg-white/75"
                      : "w-1.5 bg-white/25 hover:bg-white/45",
                  ].join(" ")}
                />
              );
            })}
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[40] h-32 sm:h-40 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
      </div>
    </div>
  );
});

export default HeroSlider;
