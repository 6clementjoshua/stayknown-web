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
import { motion, useReducedMotion } from "framer-motion";

export type SlideKind = "pill" | "device";

export type HeroSlide = {
  id: string;
  src: string;
  kind: SlideKind;
  title: string;
  teaser: string;
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

const TRANSITION_MS = 320;

const HeroSlider = forwardRef<HeroSliderHandle, Props>(function HeroSlider(
  { slides, intervalMs = 6000, learnBasePath = "/learn", autoplay = true },
  ref,
) {
  const items = useMemo(() => slides, [slides]);

  const [[idx, direction], setSlideState] = useState<[number, Direction]>([
    0, 0,
  ]);

  const [previousIdx, setPreviousIdx] = useState<number | null>(null);

  const timerRef = useRef<number | null>(null);
  const clearPreviousTimerRef = useRef<number | null>(null);
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
    setPreviousIdx(null);
  }, [items.length]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!items.length) return;

    for (const item of items) {
      const image = new window.Image();
      image.src = item.src;
      image.onload = () => {
        if ("decode" in image) {
          image.decode().catch(() => undefined);
        }
      };
    }
  }, [items]);

  useEffect(() => {
    return () => {
      if (clearPreviousTimerRef.current) {
        window.clearTimeout(clearPreviousTimerRef.current);
      }
    };
  }, []);

  const moveTo = useCallback(
    (nextIndex: number, nextDirection: Direction = 0) => {
      const total = items.length;
      if (!total) return;

      const safeIndex = ((nextIndex % total) + total) % total;

      setSlideState(([current]) => {
        if (safeIndex === current) return [current, 0];

        setPreviousIdx(current);

        if (typeof window !== "undefined") {
          if (clearPreviousTimerRef.current) {
            window.clearTimeout(clearPreviousTimerRef.current);
          }

          clearPreviousTimerRef.current = window.setTimeout(
            () => {
              setPreviousIdx(null);
            },
            prefersReducedMotion ? 60 : TRANSITION_MS + 40,
          );
        }

        const resolvedDirection: Direction =
          nextDirection || (safeIndex > current ? 1 : -1);

        return [safeIndex, resolvedDirection];
      });
    },
    [items.length, prefersReducedMotion],
  );

  const go = useCallback(
    (nextIndex: number, nextDirection: Direction = 0) => {
      moveTo(nextIndex, nextDirection);
    },
    [moveTo],
  );

  const next = useCallback(() => {
    const total = items.length;
    if (!total) return;

    moveTo(idx + 1, 1);
  }, [idx, items.length, moveTo]);

  const prev = useCallback(() => {
    const total = items.length;
    if (!total) return;

    moveTo(idx - 1, -1);
  }, [idx, items.length, moveTo]);

  useImperativeHandle(
    ref,
    () => ({
      next,
      prev,
      goTo: (index: number) => {
        const total = items.length;
        if (!total) return;

        const safeIndex = ((index % total) + total) % total;
        const nextDirection: Direction =
          safeIndex === idx ? 0 : safeIndex > idx ? 1 : -1;

        moveTo(safeIndex, nextDirection);
      },
    }),
    [next, prev, items.length, idx, moveTo],
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
          setSlideState(([current]) => {
            const total = items.length;
            if (!total) return [current, 0];

            const safeIndex = (current + 1) % total;

            setPreviousIdx(current);

            if (clearPreviousTimerRef.current) {
              window.clearTimeout(clearPreviousTimerRef.current);
            }

            clearPreviousTimerRef.current = window.setTimeout(
              () => {
                setPreviousIdx(null);
              },
              prefersReducedMotion ? 60 : TRANSITION_MS + 40,
            );

            return [safeIndex, 1];
          });
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
  }, [autoplay, items.length, intervalMs, prefersReducedMotion]);

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

  const SOFT_FLOAT = prefersReducedMotion
    ? { y: 0 }
    : { y: [0, -1.5, 0, 1.5, 0] };

  const SOFT_FLOAT_TRANSITION = prefersReducedMotion
    ? { duration: 0 }
    : {
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut" as const,
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

  const renderedIndexes = useMemo(() => {
    if (previousIdx === null || previousIdx === idx) return [idx];
    return [previousIdx, idx];
  }, [previousIdx, idx]);

  const LearnMoreCta = () => (
    <Link
      href={learnHref}
      className={[
        "relative z-[80] inline-flex items-center justify-center select-none overflow-hidden",
        "rounded-full border backdrop-blur-xl transition-all duration-200",
        "shadow-[0_18px_40px_rgba(0,0,0,0.55)]",
        "border-white/14 bg-white/[0.075] text-white",
        "hover:bg-white hover:border-white/25 hover:!text-black",
        "active:bg-black active:border-white/20 active:!text-white active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
        "h-10 px-5 text-[13px] sm:h-11 sm:px-5 sm:text-[13px]",
      ].join(" ")}
      aria-label={`Learn more about ${slide.title}`}
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.20),transparent_58%)]" />
      <span className="relative">Learn more</span>
      <span className="relative ml-2 opacity-70">→</span>
      <span className="pointer-events-none absolute inset-0 opacity-0 active:opacity-100 transition duration-75 bg-white/[0.06]" />
    </Link>
  );

  const Dots = ({ mobile = false }: { mobile?: boolean }) => {
    if (items.length <= 1) return null;

    return (
      <div
        className={[
          "relative z-[75] flex items-center justify-center gap-2",
          mobile ? "mt-4 px-7" : "",
        ].join(" ")}
      >
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
                "h-2 rounded-full border border-white/10 transition-all duration-300",
                active
                  ? "w-7 bg-white/78"
                  : "w-2 bg-white/24 hover:bg-white/45",
              ].join(" ")}
            />
          );
        })}
      </div>
    );
  };

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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_36%,rgba(255,255,255,0.055),transparent_58%)]" />

      <div className="relative w-full overflow-visible">
        <div
          className={[
            "relative mx-auto grid w-full grid-cols-1",
            "items-start justify-items-center",
            "gap-5 sm:gap-6 md:gap-8",
            "pb-8 sm:pb-10",
            "lg:min-h-[620px] lg:grid-cols-[0.98fr_1.02fr] lg:items-center lg:gap-10 lg:pb-16",
          ].join(" ")}
        >
          {/* Caption */}
          <div className="relative z-[30] order-1 flex w-full items-center justify-center lg:order-2 lg:justify-start">
            <div
              className={[
                "relative w-full max-w-[800px] text-center lg:text-left",
                "min-h-[168px]",
                "min-[390px]:min-h-[178px]",
                "sm:min-h-[180px]",
                "md:min-h-[196px]",
                "lg:min-h-[250px]",
              ].join(" ")}
            >
              {renderedIndexes.map((itemIndex) => {
                const item = items[itemIndex];
                if (!item) return null;

                const active = itemIndex === idx;
                const inactiveX = direction >= 0 ? -10 : 10;

                return (
                  <div
                    key={`${item.id}-${itemIndex}-text-layer`}
                    aria-hidden={!active}
                    style={{
                      opacity: active ? 1 : 0,
                      visibility:
                        active || itemIndex === previousIdx
                          ? "visible"
                          : "hidden",
                      transform: active
                        ? "translate3d(0,0,0) scale(1)"
                        : `translate3d(${inactiveX}px,4px,0) scale(0.992)`,
                      filter: active ? "blur(0px)" : "blur(3px)",
                      transition: prefersReducedMotion
                        ? "opacity 80ms ease"
                        : `opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms cubic-bezier(0.22,1,0.36,1), filter ${TRANSITION_MS}ms ease`,
                      pointerEvents: active ? "auto" : "none",
                    }}
                    className={[
                      "absolute inset-x-0 top-0 will-change-[opacity,transform,filter]",
                      active ? "z-[3]" : "z-[2]",
                    ].join(" ")}
                  >
                    <div className="relative mx-auto max-w-[92vw] lg:mx-0 lg:max-w-[760px]">
                      <div
                        className={[
                          "text-white/96 font-black tracking-[-0.045em]",
                          "text-[34px] leading-[1.02]",
                          "min-[390px]:text-[38px]",
                          "sm:text-[48px] sm:leading-[0.98]",
                          "md:text-[58px]",
                          "lg:text-[62px]",
                        ].join(" ")}
                      >
                        {item.title}
                      </div>

                      <div
                        className={[
                          "mx-auto mt-4 max-w-[34ch]",
                          "text-white/56 font-semibold leading-relaxed",
                          "text-[13px]",
                          "min-[390px]:text-[13.5px]",
                          "sm:max-w-[56ch] sm:text-[14px]",
                          "md:text-[14.5px]",
                          "lg:mx-0 lg:max-w-[64ch]",
                        ].join(" ")}
                      >
                        {item.teaser}
                      </div>

                      <div className="mt-7 hidden items-center justify-center lg:flex lg:justify-start">
                        {active ? <LearnMoreCta /> : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Device */}
          <div className="relative z-[20] order-2 flex w-full items-center justify-center lg:order-1 lg:justify-start lg:pl-2">
            <div
              className={[
                "relative w-full",
                "h-[38vh]",
                "min-[390px]:h-[40vh]",
                "sm:h-[48vh]",
                "md:h-[56vh]",
                "lg:h-[68vh]",
                "max-h-[760px]",
              ].join(" ")}
            >
              {renderedIndexes.map((itemIndex) => {
                const item = items[itemIndex];
                if (!item) return null;

                const active = itemIndex === idx;
                const inactiveX = direction >= 0 ? -12 : 12;

                return (
                  <div
                    key={`${item.id}-${itemIndex}-device-layer`}
                    aria-hidden={!active}
                    style={{
                      opacity: active ? 1 : 0,
                      visibility:
                        active || itemIndex === previousIdx
                          ? "visible"
                          : "hidden",
                      transform: active
                        ? "translate3d(0,0,0) scale(1)"
                        : `translate3d(${inactiveX}px,6px,0) scale(0.99)`,
                      filter: active ? "blur(0px)" : "blur(2px)",
                      transition: prefersReducedMotion
                        ? "opacity 80ms ease"
                        : `opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms cubic-bezier(0.22,1,0.36,1), filter ${TRANSITION_MS}ms ease`,
                      pointerEvents: active ? "auto" : "none",
                    }}
                    className={[
                      "absolute inset-0 flex w-full items-center justify-center will-change-[opacity,transform,filter] lg:justify-start",
                      active ? "z-[3]" : "z-[2]",
                    ].join(" ")}
                  >
                    <motion.div
                      animate={active ? SOFT_FLOAT : { y: 0 }}
                      transition={
                        active ? SOFT_FLOAT_TRANSITION : { duration: 0 }
                      }
                      drag={active && isCoarsePointer ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.18}
                      onDragStart={() => {
                        if (!active) return;
                        hoverRef.current = true;
                      }}
                      onDragEnd={(_, info) => {
                        hoverRef.current = false;
                        if (!active || !isCoarsePointer) return;

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
                      className="flex h-full w-full items-center justify-center lg:justify-start"
                    >
                      <img
                        src={item.src}
                        alt={item.title}
                        draggable={false}
                        loading={itemIndex === idx ? "eager" : "lazy"}
                        decoding="async"
                        className={[
                          "relative z-[20] block w-auto object-contain select-none",
                          "drop-shadow-[0_22px_80px_rgba(0,0,0,0.75)]",
                          "max-h-full",
                          "max-w-[74vw]",
                          "min-[390px]:max-w-[70vw]",
                          "sm:max-w-[430px]",
                          "md:max-w-[500px]",
                          "lg:max-w-[620px]",
                          "xl:max-w-[660px]",
                        ].join(" ")}
                      />
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile controls: device above dots, dots above Learn More */}
          <div className="relative z-[90] order-3 flex w-full flex-col items-center justify-center lg:hidden">
            <Dots mobile />
            <div className="mt-5 flex items-center justify-center">
              <LearnMoreCta />
            </div>
          </div>
        </div>

        {/* Desktop/tablet dots */}
        {items.length > 1 ? (
          <div className="absolute inset-x-0 bottom-9 z-[85] hidden items-center justify-center lg:flex">
            <Dots />
          </div>
        ) : null}

        {/* Arrows */}
        <div
          className={[
            "pointer-events-none absolute z-[90]",
            "-left-2 -right-2",
            "sm:-left-4 sm:-right-4",
            "md:-left-6 md:-right-6",
            "lg:-left-10 lg:-right-10",
            "xl:-left-14 xl:-right-14",
            "top-[62%] -translate-y-1/2",
            "sm:top-[60%]",
            "lg:top-1/2",
            "flex items-center justify-between",
          ].join(" ")}
        >
          <button
            onClick={handlePrev}
            className={[
              "pointer-events-auto flex items-center justify-center",
              "rounded-full border border-white/14 bg-black/48",
              "backdrop-blur-xl text-white/88",
              "shadow-[0_14px_38px_rgba(0,0,0,0.55)]",
              "transition-all duration-200",
              "hover:bg-white hover:text-black hover:border-white/25",
              "active:scale-95",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
              "w-10 h-10 text-[25px]",
              "sm:w-11 sm:h-11 sm:text-[28px]",
            ].join(" ")}
            aria-label="Previous slide"
            type="button"
          >
            <span className="-mt-[2px]">‹</span>
          </button>

          <button
            onClick={handleNext}
            className={[
              "pointer-events-auto flex items-center justify-center",
              "rounded-full border border-white/14 bg-black/48",
              "backdrop-blur-xl text-white/88",
              "shadow-[0_14px_38px_rgba(0,0,0,0.55)]",
              "transition-all duration-200",
              "hover:bg-white hover:text-black hover:border-white/25",
              "active:scale-95",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
              "w-10 h-10 text-[25px]",
              "sm:w-11 sm:h-11 sm:text-[28px]",
            ].join(" ")}
            aria-label="Next slide"
            type="button"
          >
            <span className="-mt-[2px]">›</span>
          </button>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[40] h-24 bg-gradient-to-t from-black/55 via-black/18 to-transparent lg:h-40 lg:from-black/70 lg:via-black/25" />
      </div>
    </div>
  );
});

export default HeroSlider;
