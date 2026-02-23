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
     * If not provided, we’ll use `${learnBasePath}/${id}`.
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

    /**
     * Base path for Learn More links.
     * Example: "/learn" => /learn/{slide.id}
     */
    learnBasePath?: string;

    /**
     * Optional: pause auto-advance (useful when embedded in other carousels).
     */
    autoplay?: boolean;
};

const HeroSlider = forwardRef<HeroSliderHandle, Props>(function HeroSlider(
    { slides, intervalMs = 6000, learnBasePath = "/learn", autoplay = true },
    ref
) {
    const items = useMemo(() => slides.slice(0, 6), [slides]);
    const [idx, setIdx] = useState(0);

    const timerRef = useRef<number | null>(null);
    const hoverRef = useRef(false);

    const prefersReducedMotion = useReducedMotion();
    const [isCoarsePointer, setIsCoarsePointer] = useState(false);

    // Pointer detection (touch vs mouse)
    useEffect(() => {
        if (typeof window === "undefined") return;

        const mq = window.matchMedia("(hover: none) and (pointer: coarse)");

        const apply = (e?: MediaQueryList | MediaQueryListEvent) => {
            const matches = "matches" in (e ?? mq) ? (e ?? mq).matches : mq.matches;
            setIsCoarsePointer(matches);
        };

        apply(mq);
        mq.addEventListener("change", apply);
        return () => mq.removeEventListener("change", apply);
    }, []);

    // Clamp idx when slides change
    useEffect(() => {
        if (!items.length) return;
        setIdx((i) => Math.min(i, items.length - 1));
    }, [items.length]);

    const go = useCallback(
        (nextIndex: number) => {
            const m = items.length;
            if (!m) return;
            setIdx((nextIndex + m) % m);
        },
        [items.length]
    );

    const next = useCallback(() => {
        const m = items.length;
        if (!m) return;
        setIdx((i) => (i + 1) % m);
    }, [items.length]);

    const prev = useCallback(() => {
        const m = items.length;
        if (!m) return;
        setIdx((i) => (i - 1 + m) % m);
    }, [items.length]);

    useImperativeHandle(
        ref,
        () => ({
            next,
            prev,
            goTo: (index: number) => go(index),
        }),
        [next, prev, go]
    );

    // Autoplay (pauses on hover + when tab hidden)
    useEffect(() => {
        if (!autoplay) return;
        if (items.length <= 1) return;
        if (typeof window === "undefined") return;

        const clear = () => {
            if (timerRef.current) window.clearInterval(timerRef.current);
            timerRef.current = null;
        };

        const start = () => {
            clear();
            timerRef.current = window.setInterval(() => {
                if (!hoverRef.current && !document.hidden) next();
            }, intervalMs);
        };

        start();

        const onVis = () => start();
        document.addEventListener("visibilitychange", onVis);

        return () => {
            document.removeEventListener("visibilitychange", onVis);
            clear();
        };
    }, [autoplay, items.length, intervalMs, next]);

    // Keyboard nav
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

    const TEXT = {
        enter: { opacity: 0, x: 18, y: 2, scale: 0.965, filter: "blur(2px)" },
        center: { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" },
        exit: { opacity: 0, x: -26, y: 0, scale: 0.985, filter: "blur(2px)" },
    } as const;

    const DEVICE = {
        enter: { opacity: 0, x: 8, y: 6, scale: 0.975, filter: "blur(1.5px)" },
        center: { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" },
        exit: { opacity: 0, x: -14, y: -2, scale: 1.01, filter: "blur(1.5px)" },
    } as const;

    const TRANSITION_TEXT = {
        duration: 0.62,
        ease: [0.22, 1, 0.36, 1] as const,
    };

    const TRANSITION_DEVICE = {
        duration: 0.62,
        ease: [0.22, 1, 0.36, 1] as const,
        delay: 0.08,
    };

    const SWIPE_OFFSET = 60;
    const SWIPE_VELOCITY = 500;

    const learnHref = slide.learnHref ?? `${learnBasePath}/${slide.id}`;

    const LearnMoreCta = ({ size }: { size: "mobile" | "desktop" }) => (
        <Link
            href={learnHref}
            className={[
                // ✅ z-index ensures CTA stays in FRONT of any device image
                "relative z-[60] inline-flex items-center justify-center select-none overflow-hidden",
                "rounded-full border backdrop-blur-xl transition-colors duration-200",
                "shadow-[0_18px_40px_rgba(0,0,0,0.55)]",
                "border-white/14 bg-white/[0.07] text-white",
                "hover:bg-white hover:border-white/25 hover:!text-black",
                "active:bg-black active:border-white/20 active:!text-white active:scale-[0.99]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                size === "mobile" ? "h-9 px-4 text-[12px]" : "h-11 px-5 text-[13px]",
            ].join(" ")}
            aria-label="Learn more"
        >
            <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.20),transparent_58%)]" />
            <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.18),transparent)] -translate-x-[120%] hover:translate-x-[120%] transition duration-700" />
            <span className="relative">Learn more</span>
            <span className="relative ml-2 opacity-70">→</span>
            <span className="pointer-events-none absolute inset-0 opacity-0 active:opacity-100 transition duration-75 bg-white/[0.06]" />
        </Link>
    );

    return (
        <div
            className="relative w-full group"
            onMouseEnter={() => (hoverRef.current = true)}
            onMouseLeave={() => (hoverRef.current = false)}
            onFocusCapture={() => (hoverRef.current = true)}
            onBlurCapture={() => (hoverRef.current = false)}
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
                    <div className="relative flex items-center justify-center lg:justify-start order-1 lg:order-2">
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={slide.id + "-text"}
                                variants={TEXT}
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
                    <div className="relative flex items-center justify-center lg:justify-start lg:pl-2 order-2 lg:order-1">
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={slide.id}
                                variants={DEVICE}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={TRANSITION_DEVICE}
                                // ✅ important: create stacking context and keep image BELOW CTA
                                className="relative z-[10]"
                                drag={isCoarsePointer ? "x" : false}
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.18}
                                onDragStart={() => (hoverRef.current = true)}
                                onDragEnd={(_, info) => {
                                    hoverRef.current = false;
                                    if (!isCoarsePointer) return;

                                    if (info.offset.x < -SWIPE_OFFSET || info.velocity.x < -SWIPE_VELOCITY) next();
                                    if (info.offset.x > SWIPE_OFFSET || info.velocity.x > SWIPE_VELOCITY) prev();
                                }}
                            >
                                <motion.div
                                    animate={
                                        prefersReducedMotion ? { y: 0 } : { y: [0, -1.5, 0, 1.5, 0] }
                                    }
                                    transition={
                                        prefersReducedMotion
                                            ? { duration: 0 }
                                            : { duration: 10, repeat: Infinity, ease: "easeInOut" }
                                    }
                                >
                                    <img
                                        src={slide.src}
                                        alt={slide.title}
                                        draggable={false}
                                        // ✅ keep image from covering overlays by ensuring it's not higher z
                                        className="
                      relative z-[10]
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

                                {/* ✅ MOBILE CTA: force it in front even if the image overlaps */}
                                <div className="relative z-[60] mt-5 flex sm:hidden items-center justify-center">
                                    <LearnMoreCta size="mobile" />
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Arrows */}
                <div className="pointer-events-none absolute left-0 right-0 top-[56%] -translate-y-1/2 sm:top-1/2 flex items-center justify-between">
                    <button
                        onClick={prev}
                        className="pointer-events-auto rounded-full border border-white/12 bg-white/[0.06] backdrop-blur-md text-white/80 hover:bg-white/[0.12] transition font-black w-8 h-8 sm:w-10 sm:h-10"
                        aria-label="Previous slide"
                        type="button"
                    >
                        ‹
                    </button>

                    <button
                        onClick={next}
                        className="pointer-events-auto rounded-full border border-white/12 bg-white/[0.06] backdrop-blur-md text-white/80 hover:bg-white/[0.12] transition font-black w-8 h-8 sm:w-10 sm:h-10"
                        aria-label="Next slide"
                        type="button"
                    >
                        ›
                    </button>
                </div>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 sm:h-40 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
            </div>
        </div>
    );
});

export default HeroSlider;