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

type SlideCategory =
  | "Safety guidance"
  | "Visit protection"
  | "Emergency response"
  | "Secure communication"
  | "Consent and trust";

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

const TRANSITION_MS = 420;
const TEMPORARY_PAUSE_MS = 1400;
const SWIPE_OFFSET = 58;
const SWIPE_VELOCITY = 480;

function categoryForSlide(id: string): SlideCategory {
  if (id.includes("sos") || id.includes("capture") || id.includes("vpn")) {
    return "Emergency response";
  }

  if (
    id.includes("chat") ||
    id.includes("stories") ||
    id.includes("promax-shell")
  ) {
    return "Secure communication";
  }

  if (
    id.includes("contact") ||
    id.includes("verification") ||
    id.includes("gallery")
  ) {
    return "Consent and trust";
  }

  if (
    id.includes("visit") ||
    id.includes("live-map") ||
    id.includes("end-visit")
  ) {
    return "Visit protection";
  }

  return "Safety guidance";
}

function formatCounter(value: number) {
  return String(value).padStart(2, "0");
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none">
      <path
        d={direction === "left" ? "M15 18 9 12l6-6" : "m9 6 6 6-6 6"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PauseIcon({ paused }: { paused: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[17px] w-[17px]"
      fill="none"
    >
      {paused ? (
        <path
          d="m9 7 8 5-8 5V7Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      ) : (
        <>
          <path
            d="M9 7v10M15 7v10"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

function GridIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[17px] w-[17px]"
      fill="none"
    >
      <rect
        x="4"
        y="4"
        width="6"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <rect
        x="14"
        y="4"
        width="6"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <rect
        x="4"
        y="14"
        width="6"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <rect
        x="14"
        y="14"
        width="6"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none">
      <path
        d="M12 3.5 19 6v5.2c0 4.2-2.7 7.7-7 9.3-4.3-1.6-7-5.1-7-9.3V6l7-2.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="m9.2 12 1.8 1.8 3.9-4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const HeroSlider = forwardRef<HeroSliderHandle, Props>(function HeroSlider(
  { slides, intervalMs = 6000, learnBasePath = "/learn", autoplay = true },
  ref,
) {
  const items = useMemo(() => slides, [slides]);
  const prefersReducedMotion = Boolean(useReducedMotion());

  const [[idx, direction], setSlideState] = useState<[number, Direction]>([
    0, 0,
  ]);
  const [previousIdx, setPreviousIdx] = useState<number | null>(null);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [isPausedByUser, setIsPausedByUser] = useState(false);
  const [isInViewport, setIsInViewport] = useState(true);
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const clearPreviousTimerRef = useRef<number | null>(null);
  const temporaryPauseTimerRef = useRef<number | null>(null);
  const hoverRef = useRef(false);
  const focusRef = useRef(false);
  const temporaryPauseRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(hover: none) and (pointer: coarse)");

    const applyPointerMode = (event?: MediaQueryList | MediaQueryListEvent) => {
      const source = event ?? mediaQuery;
      setIsCoarsePointer(source.matches);
    };

    applyPointerMode(mediaQuery);
    mediaQuery.addEventListener("change", applyPointerMode);

    return () => mediaQuery.removeEventListener("change", applyPointerMode);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry?.isIntersecting ?? true);
      },
      {
        threshold: 0.18,
        rootMargin: "120px 0px 120px 0px",
      },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!items.length) return;

    setSlideState(([current]) => [Math.min(current, items.length - 1), 0]);
    setPreviousIdx(null);
  }, [items.length]);

  useEffect(() => {
    if (typeof window === "undefined" || !items.length) return;

    const indexes = new Set([
      idx,
      (idx + 1) % items.length,
      (idx - 1 + items.length) % items.length,
    ]);

    for (const imageIndex of indexes) {
      const item = items[imageIndex];
      if (!item) continue;

      const image = new window.Image();
      image.src = item.src;
      image.decode?.().catch(() => undefined);
    }
  }, [idx, items]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }

      if (clearPreviousTimerRef.current !== null) {
        window.clearTimeout(clearPreviousTimerRef.current);
      }

      if (temporaryPauseTimerRef.current !== null) {
        window.clearTimeout(temporaryPauseTimerRef.current);
      }
    };
  }, []);

  const clearPreviousLayerLater = useCallback(() => {
    if (typeof window === "undefined") return;

    if (clearPreviousTimerRef.current !== null) {
      window.clearTimeout(clearPreviousTimerRef.current);
    }

    clearPreviousTimerRef.current = window.setTimeout(
      () => setPreviousIdx(null),
      prefersReducedMotion ? 80 : TRANSITION_MS + 70,
    );
  }, [prefersReducedMotion]);

  const moveTo = useCallback(
    (nextIndex: number, nextDirection: Direction = 0) => {
      const total = items.length;
      if (!total) return;

      const safeIndex = ((nextIndex % total) + total) % total;

      setSlideState(([current]) => {
        if (safeIndex === current) return [current, 0];

        setPreviousIdx(current);
        clearPreviousLayerLater();

        const resolvedDirection: Direction =
          nextDirection || (safeIndex > current ? 1 : -1);

        return [safeIndex, resolvedDirection];
      });
    },
    [clearPreviousLayerLater, items.length],
  );

  const go = useCallback(
    (nextIndex: number, nextDirection: Direction = 0) => {
      moveTo(nextIndex, nextDirection);
    },
    [moveTo],
  );

  const next = useCallback(() => {
    if (!items.length) return;
    moveTo(idx + 1, 1);
  }, [idx, items.length, moveTo]);

  const prev = useCallback(() => {
    if (!items.length) return;
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
    [idx, items.length, moveTo, next, prev],
  );

  const pauseBriefly = useCallback(() => {
    if (typeof window === "undefined") return;

    temporaryPauseRef.current = true;

    if (temporaryPauseTimerRef.current !== null) {
      window.clearTimeout(temporaryPauseTimerRef.current);
    }

    temporaryPauseTimerRef.current = window.setTimeout(() => {
      temporaryPauseRef.current = false;
    }, TEMPORARY_PAUSE_MS);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const shouldRun =
      autoplay &&
      !prefersReducedMotion &&
      !isPausedByUser &&
      !isBrowserOpen &&
      isInViewport &&
      items.length > 1;

    if (!shouldRun) return;

    timerRef.current = window.setInterval(() => {
      if (
        document.hidden ||
        hoverRef.current ||
        focusRef.current ||
        temporaryPauseRef.current
      ) {
        return;
      }

      setSlideState(([current]) => {
        const total = items.length;
        if (!total) return [current, 0];

        const safeIndex = (current + 1) % total;
        setPreviousIdx(current);
        clearPreviousLayerLater();

        return [safeIndex, 1];
      });
    }, intervalMs);

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [
    autoplay,
    clearPreviousLayerLater,
    intervalMs,
    isBrowserOpen,
    isInViewport,
    isPausedByUser,
    items.length,
    prefersReducedMotion,
  ]);

  const slide = items[idx];
  if (!slide) return null;

  const renderedIndexes =
    previousIdx === null || previousIdx === idx ? [idx] : [previousIdx, idx];

  const mappedId = routeAlias[slide.id] ?? slide.id;
  const learnHref = slide.learnHref ?? `${learnBasePath}/${mappedId}`;
  const category = categoryForSlide(slide.id);
  const positionPercent = ((idx + 1) / items.length) * 100;

  const softFloat = prefersReducedMotion ? { y: 0 } : { y: [0, -2, 0, 1.5, 0] };

  const softFloatTransition = prefersReducedMotion
    ? { duration: 0 }
    : {
        duration: 11,
        repeat: Infinity,
        ease: "easeInOut" as const,
      };

  const handleKeyboard = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;

    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement
    ) {
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      pauseBriefly();
      next();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      pauseBriefly();
      prev();
    }

    if (event.key === "Escape" && isBrowserOpen) {
      setIsBrowserOpen(false);
    }
  };

  const handlePrev = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    pauseBriefly();
    prev();
  };

  const handleNext = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    pauseBriefly();
    next();
  };

  const handleBrowserSelection = (slideIndex: number) => {
    pauseBriefly();
    go(slideIndex, slideIndex >= idx ? 1 : -1);
    setIsBrowserOpen(false);
  };

  const learnMoreCta = (
    <Link
      href={learnHref}
      className="group relative inline-flex min-h-12 items-center justify-center overflow-hidden rounded-full border border-white/80 bg-white px-6 text-[13px] font-black tracking-[-0.01em] !text-black shadow-[0_16px_42px_rgba(0,0,0,0.36),inset_0_1px_0_rgba(255,255,255,1),inset_0_-6px_14px_rgba(0,0,0,0.08)] transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_20px_54px_rgba(0,0,0,0.46),inset_0_1px_0_rgba(255,255,255,1),inset_0_-8px_16px_rgba(0,0,0,0.09)] active:translate-y-0 active:scale-[0.985] visited:!text-black focus:!text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      aria-label={`Learn more about ${slide.title}`}
    >
      <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-white" />
      <span className="relative">Learn more</span>
      <span className="relative ml-2 transition-transform duration-200 group-hover:translate-x-0.5">
        →
      </span>
    </Link>
  );

  return (
    <div
      ref={rootRef}
      className="group relative w-full rounded-[32px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/15 sm:rounded-[40px]"
      onMouseEnter={() => {
        hoverRef.current = true;
      }}
      onMouseLeave={() => {
        hoverRef.current = false;
      }}
      onFocusCapture={() => {
        focusRef.current = true;
      }}
      onBlurCapture={(event) => {
        const nextFocusedElement = event.relatedTarget;
        if (
          nextFocusedElement instanceof Node &&
          event.currentTarget.contains(nextFocusedElement)
        ) {
          return;
        }

        focusRef.current = false;
      }}
      onKeyDown={handleKeyboard}
      tabIndex={0}
      style={{ WebkitTapHighlightColor: "transparent" }}
      aria-roledescription="carousel"
      aria-label="StayKnown app feature presentation"
    >
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        Slide {idx + 1} of {items.length}: {slide.title}
      </p>

      <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_30%_22%,rgba(255,255,255,0.09),transparent_30%),radial-gradient(circle_at_76%_70%,rgba(255,255,255,0.045),transparent_42%)]" />

      <div className="relative overflow-hidden rounded-[inherit] border border-white/[0.08] bg-[linear-gradient(145deg,rgba(255,255,255,0.058),rgba(255,255,255,0.018)_38%,rgba(255,255,255,0.035))] shadow-[0_34px_120px_rgba(0,0,0,0.44),inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(255,255,255,0.025)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)]" />

        <div className="relative grid min-h-[690px] grid-cols-1 items-center gap-5 px-4 pb-5 pt-6 sm:min-h-[760px] sm:px-6 sm:pb-7 sm:pt-8 md:px-8 lg:min-h-[650px] lg:grid-cols-[0.98fr_1.02fr] lg:gap-10 lg:px-10 lg:py-10 xl:px-12">
          <div className="relative order-2 flex min-w-0 items-center justify-center lg:order-1 lg:justify-start">
            <div className="relative flex h-[410px] w-full items-center justify-center sm:h-[500px] md:h-[560px] lg:h-[570px] lg:justify-start xl:h-[600px]">
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-[72%] w-[76%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.055] blur-[70px] lg:left-[42%]" />
              <div className="pointer-events-none absolute bottom-[4%] left-1/2 h-14 w-[52%] -translate-x-1/2 rounded-full bg-black/75 blur-2xl lg:left-[42%]" />
              <div className="pointer-events-none absolute bottom-[8%] left-1/2 h-px w-[58%] -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)] lg:left-[42%]" />

              {renderedIndexes.map((itemIndex) => {
                const item = items[itemIndex];
                if (!item) return null;

                const active = itemIndex === idx;
                const inactiveX = direction >= 0 ? -18 : 18;

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
                        : `translate3d(${inactiveX}px,8px,0) scale(0.985)`,
                      filter: active ? "blur(0px)" : "blur(3px)",
                      transition: prefersReducedMotion
                        ? "opacity 90ms ease"
                        : `opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms cubic-bezier(0.22,1,0.36,1), filter ${TRANSITION_MS}ms ease`,
                      pointerEvents: active ? "auto" : "none",
                    }}
                    className={`absolute inset-0 flex items-center justify-center will-change-[opacity,transform,filter] lg:justify-start ${
                      active ? "z-[3]" : "z-[2]"
                    }`}
                  >
                    <motion.div
                      animate={active ? softFloat : { y: 0 }}
                      transition={
                        active ? softFloatTransition : { duration: 0 }
                      }
                      drag={active && isCoarsePointer ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.16}
                      onDragStart={() => {
                        if (!active) return;
                        temporaryPauseRef.current = true;
                      }}
                      onDragEnd={(_, info) => {
                        temporaryPauseRef.current = false;
                        if (!active || !isCoarsePointer) return;

                        if (
                          info.offset.x < -SWIPE_OFFSET ||
                          info.velocity.x < -SWIPE_VELOCITY
                        ) {
                          pauseBriefly();
                          next();
                          return;
                        }

                        if (
                          info.offset.x > SWIPE_OFFSET ||
                          info.velocity.x > SWIPE_VELOCITY
                        ) {
                          pauseBriefly();
                          prev();
                        }
                      }}
                      className="flex h-full w-full touch-pan-y items-center justify-center lg:justify-start"
                    >
                      <img
                        src={item.src}
                        alt={active ? item.title : ""}
                        draggable={false}
                        loading={itemIndex === 0 ? "eager" : "lazy"}
                        decoding="async"
                        className={`relative z-10 block h-auto w-auto select-none object-contain drop-shadow-[0_26px_78px_rgba(0,0,0,0.78)] ${
                          item.kind === "pill"
                            ? "max-h-[72%] max-w-[82%]"
                            : "max-h-[96%] max-w-[86%] sm:max-w-[78%] lg:max-w-[94%]"
                        }`}
                      />
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative order-1 flex min-w-0 items-center justify-center text-center lg:order-2 lg:justify-start lg:text-left">
            <div className="relative min-h-[250px] w-full max-w-[760px] sm:min-h-[270px] lg:min-h-[430px]">
              {renderedIndexes.map((itemIndex) => {
                const item = items[itemIndex];
                if (!item) return null;

                const active = itemIndex === idx;
                const inactiveX = direction >= 0 ? -14 : 14;
                const itemCategory = categoryForSlide(item.id);
                const itemMappedId = routeAlias[item.id] ?? item.id;
                const itemLearnHref =
                  item.learnHref ?? `${learnBasePath}/${itemMappedId}`;

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
                        : `translate3d(${inactiveX}px,6px,0) scale(0.99)`,
                      filter: active ? "blur(0px)" : "blur(3px)",
                      transition: prefersReducedMotion
                        ? "opacity 90ms ease"
                        : `opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms cubic-bezier(0.22,1,0.36,1), filter ${TRANSITION_MS}ms ease`,
                      pointerEvents: active ? "auto" : "none",
                    }}
                    className={`absolute inset-x-0 top-0 will-change-[opacity,transform,filter] ${
                      active ? "z-[3]" : "z-[2]"
                    }`}
                  >
                    <div className="mx-auto max-w-[680px] lg:mx-0">
                      <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                        <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.055] px-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/64 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
                          <ShieldIcon />
                          {itemCategory}
                        </span>

                        <span className="inline-flex min-h-8 items-center rounded-full border border-white/[0.08] bg-black/20 px-3 text-[10px] font-black tracking-[0.14em] text-white/42">
                          {formatCounter(itemIndex + 1)} /{" "}
                          {formatCounter(items.length)}
                        </span>
                      </div>

                      <h3 className="mt-5 text-[34px] font-black leading-[0.96] tracking-[-0.06em] text-white sm:text-[46px] md:text-[54px] lg:max-w-[11ch] lg:text-[60px] xl:text-[66px]">
                        {item.title}
                      </h3>

                      <p className="mx-auto mt-5 max-w-[58ch] text-[14px] font-semibold leading-[1.75] text-white/58 sm:text-[15px] lg:mx-0 lg:max-w-[54ch] lg:text-[16px]">
                        {item.teaser}
                      </p>

                      <div className="mt-7 hidden items-center justify-center gap-3 lg:flex lg:justify-start">
                        {active ? (
                          <Link
                            href={itemLearnHref}
                            className="group relative inline-flex min-h-12 items-center justify-center overflow-hidden rounded-full border border-white/80 bg-white px-6 text-[13px] font-black tracking-[-0.01em] !text-black shadow-[0_16px_42px_rgba(0,0,0,0.36),inset_0_1px_0_rgba(255,255,255,1),inset_0_-6px_14px_rgba(0,0,0,0.08)] transition duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0 active:scale-[0.985] visited:!text-black focus:!text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                            aria-label={`Learn more about ${item.title}`}
                          >
                            <span className="pointer-events-none absolute inset-x-4 top-0 h-px bg-white" />
                            <span className="relative">Learn more</span>
                            <span className="relative ml-2 transition-transform duration-200 group-hover:translate-x-0.5">
                              →
                            </span>
                          </Link>
                        ) : null}

                        <button
                          type="button"
                          onClick={() =>
                            setIsBrowserOpen((current) => !current)
                          }
                          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.055] px-5 text-[12px] font-black text-white/76 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl transition hover:border-white/[0.18] hover:bg-white/[0.09] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
                          aria-expanded={isBrowserOpen}
                          aria-controls="stayknown-slide-browser"
                        >
                          <GridIcon />
                          Browse all screens
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="relative z-20 border-t border-white/[0.07] bg-black/25 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/[0.11] bg-white/[0.055] text-white/82 shadow-[0_12px_30px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition hover:border-white/25 hover:bg-white hover:text-black active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                aria-label="Previous StayKnown screen"
              >
                <ArrowIcon direction="left" />
              </button>

              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/38">
                  <span className="truncate">{category}</span>
                  <span className="shrink-0">
                    {formatCounter(idx + 1)} / {formatCounter(items.length)}
                  </span>
                </div>

                <div
                  className="h-2 overflow-hidden rounded-full border border-white/[0.06] bg-white/[0.055] shadow-[inset_0_2px_5px_rgba(0,0,0,0.4)]"
                  role="progressbar"
                  aria-label="StayKnown feature position"
                  aria-valuemin={1}
                  aria-valuemax={items.length}
                  aria-valuenow={idx + 1}
                >
                  <div
                    className="h-full rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.26),inset_0_1px_0_rgba(255,255,255,0.9)] transition-[width] duration-500 ease-out"
                    style={{ width: `${positionPercent}%` }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/[0.11] bg-white/[0.055] text-white/82 shadow-[0_12px_30px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition hover:border-white/25 hover:bg-white hover:text-black active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                aria-label="Next StayKnown screen"
              >
                <ArrowIcon direction="right" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
              <button
                type="button"
                onClick={() => setIsPausedByUser((current) => !current)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.045] px-4 text-[11px] font-black text-white/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 disabled:cursor-not-allowed disabled:opacity-45"
                aria-label={
                  isPausedByUser
                    ? "Resume automatic slide movement"
                    : "Pause automatic slide movement"
                }
                aria-pressed={isPausedByUser}
                disabled={!autoplay || prefersReducedMotion}
              >
                <PauseIcon paused={isPausedByUser} />
                {prefersReducedMotion
                  ? "Motion reduced"
                  : isPausedByUser
                    ? "Resume"
                    : "Pause"}
              </button>

              <button
                type="button"
                onClick={() => setIsBrowserOpen((current) => !current)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.045] px-4 text-[11px] font-black text-white/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
                aria-expanded={isBrowserOpen}
                aria-controls="stayknown-slide-browser"
              >
                <GridIcon />
                {isBrowserOpen ? "Close screens" : "All screens"}
              </button>

              <div className="lg:hidden">{learnMoreCta}</div>
            </div>
          </div>
        </div>

        <div
          id="stayknown-slide-browser"
          hidden={!isBrowserOpen}
          className="relative z-20 border-t border-white/[0.07] bg-black/78 px-4 py-5 backdrop-blur-2xl sm:px-6 sm:py-6 lg:px-10"
        >
          <div className="mx-auto max-w-6xl">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/36">
                  Complete app presentation
                </div>
                <h4 className="mt-2 text-[20px] font-black tracking-[-0.035em] text-white sm:text-[24px]">
                  Choose any StayKnown screen
                </h4>
              </div>

              <span className="hidden text-[11px] font-bold text-white/34 sm:block">
                {items.length} screens
              </span>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, itemIndex) => {
                const active = itemIndex === idx;

                return (
                  <button
                    key={`${item.id}-browser-option`}
                    type="button"
                    onClick={() => handleBrowserSelection(itemIndex)}
                    className={`group flex min-h-[72px] items-center gap-3 rounded-[18px] border px-3.5 py-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 ${
                      active
                        ? "border-white/35 bg-white text-black"
                        : "border-white/[0.08] bg-white/[0.035] text-white hover:border-white/[0.16] hover:bg-white/[0.07]"
                    }`}
                    aria-current={active ? "true" : undefined}
                  >
                    <span
                      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] border text-[11px] font-black ${
                        active
                          ? "border-black/10 bg-black/[0.045] text-black"
                          : "border-white/[0.08] bg-black/20 text-white/55"
                      }`}
                    >
                      {formatCounter(itemIndex + 1)}
                    </span>

                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-black tracking-[-0.01em]">
                        {item.title}
                      </span>
                      <span
                        className={`mt-1 block truncate text-[10px] font-bold ${
                          active ? "text-black/50" : "text-white/34"
                        }`}
                      >
                        {categoryForSlide(item.id)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-10 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)]" />
      </div>
    </div>
  );
});

export default HeroSlider;
