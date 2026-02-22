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
import { motion, AnimatePresence } from "framer-motion";

export type SlideKind = "pill" | "device";
export type HeroSlide = {
    id: string;
    src: string;
    kind: SlideKind;
    title: string;
    teaser: string;
};

export type HeroSliderHandle = {
    next: () => void;
    prev: () => void;
    goTo: (index: number) => void;
};

type Props = {
    slides: HeroSlide[];
    intervalMs?: number;
};

const HeroSlider = forwardRef<HeroSliderHandle, Props>(function HeroSlider(
    { slides, intervalMs = 6000 },
    ref
) {
    const items = useMemo(() => slides.slice(0, 6), [slides]);
    const [idx, setIdx] = useState(0);

    const timerRef = useRef<number | null>(null);
    const hoverRef = useRef(false);

    // detect mobile-ish input
    const [isCoarsePointer, setIsCoarsePointer] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(hover: none) and (pointer: coarse)");
        const apply = () => setIsCoarsePointer(!!mq.matches);
        apply();
        mq.addEventListener?.("change", apply);
        return () => mq.removeEventListener?.("change", apply);
    }, []);

    // keep idx in bounds if slides change
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

    // autoplay (pause on hover / touch)
    useEffect(() => {
        if (items.length <= 1) return;

        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = window.setInterval(() => {
            if (!hoverRef.current) next();
        }, intervalMs);

        return () => {
            if (timerRef.current) window.clearInterval(timerRef.current);
            timerRef.current = null;
        };
    }, [items.length, intervalMs, next]);

    // keyboard
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") next();
            if (e.key === "ArrowLeft") prev();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [next, prev]);

    const slide = items[idx];
    if (!slide) return null;

    // Desktop tap: left half = prev, right half = next
    const onDesktopTap = (e: React.PointerEvent<HTMLDivElement>) => {
        if (isCoarsePointer) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        if (x < rect.width / 2) prev();
        else next();
    };

    // Smooth + directional transitions (no flicker feel)
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

    // ✅ text first, device slightly after (makes it feel intentional + smooth)
    const TRANSITION_DEVICE = {
        duration: 0.62,
        ease: [0.22, 1, 0.36, 1] as const,
        delay: 0.08,
    };

    // Swipe threshold tuning
    const SWIPE_OFFSET = 60;
    const SWIPE_VELOCITY = 500;

    const learnHref = `/learn/${slide.id}`; // placeholder route (wire later)

    return (
        <div
            className="relative w-full group"
            onMouseEnter={() => (hoverRef.current = true)}
            onMouseLeave={() => (hoverRef.current = false)}
            style={{ WebkitTapHighlightColor: "transparent" }}
        >
            {/* vignette */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.06),transparent_55%)]" />

            <div className="relative w-full min-h-[520px] md:min-h-[600px] lg:min-h-[620px]">
                {/* ✅ Desktop tap layer ONLY on desktop */}
                {!isCoarsePointer && (
                    <div
                        className="absolute inset-0 z-10 select-none"
                        onPointerUp={onDesktopTap}
                        style={{ touchAction: "none" }}
                    />
                )}

                {/* layout */}
                <div
                    className="
            relative grid grid-cols-1 lg:grid-cols-[0.98fr_1.02fr]
            items-center gap-8 md:gap-10
            h-[62vh] max-h-[640px] min-h-[460px]
            pb-12 md:pb-14
          "
                >
                    {/* ✅ Caption FIRST on mobile/tablet */}
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
                                <div className="pointer-events-none absolute -inset-y-10 -inset-x-10 bg-[radial-gradient(circle_at_50%_35%,rgba(0,0,0,0.58),transparent_68%)]" />

                                <div className="relative">
                                    <div className="text-white/95 font-black tracking-[-0.03em] text-[40px] sm:text-[52px] md:text-[62px] leading-[0.98]">
                                        {slide.title}
                                    </div>

                                    <div className="mt-4 text-white/58 font-semibold text-[13.5px] sm:text-[14px] md:text-[14.5px] leading-relaxed mx-auto lg:mx-0 max-w-[64ch]">
                                        {slide.teaser}
                                    </div>

                                    <div className="mt-7 flex items-center justify-center lg:justify-start">
                                        <Link
                                            href={learnHref}
                                            className="
                        relative inline-flex items-center justify-center
                        h-11 px-5 rounded-full
                        border border-white/14
                        bg-white/[0.07]
                        backdrop-blur-xl
                        text-white/90 font-semibold text-[13px]
                        shadow-[0_18px_40px_rgba(0,0,0,0.55)]
                        transition
                        duration-200
                        hover:bg-black hover:text-white
                        hover:border-white/20
                        active:scale-[0.99]
                        select-none
                        overflow-hidden
                      "
                                        >
                                            {/* subtle bevel highlight */}
                                            <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.22),transparent_55%)]" />
                                            {/* hover flicker to black */}
                                            <span className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition duration-150 bg-black" />
                                            <span className="relative">Learn more</span>
                                            
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* LEFT image */}
                    <div className="relative flex items-center justify-center lg:justify-start lg:pl-2 order-2 lg:order-1">
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={slide.id}
                                variants={DEVICE}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={TRANSITION_DEVICE}
                                className="relative"
                                drag={isCoarsePointer ? "x" : false}
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.18}
                                onDragStart={() => (hoverRef.current = true)}
                                onDragEnd={(_, info) => {
                                    hoverRef.current = false;
                                    if (!isCoarsePointer) return;

                                    const offset = info.offset.x;
                                    const velocity = info.velocity.x;

                                    if (offset < -SWIPE_OFFSET || velocity < -SWIPE_VELOCITY) {
                                        next();
                                        return;
                                    }
                                    if (offset > SWIPE_OFFSET || velocity > SWIPE_VELOCITY) {
                                        prev();
                                        return;
                                    }
                                }}
                                style={{
                                    WebkitTapHighlightColor: "transparent",
                                    touchAction: isCoarsePointer ? "pan-y" : "auto",
                                }}
                            >
                                {/* micro float */}
                                <motion.div
                                    animate={{ y: [0, -1.5, 0, 1.5, 0] }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                                    className="relative"
                                >
                                    <img
                                        src={slide.src}
                                        alt={slide.title}
                                        draggable={false}
                                        className="
                      block w-auto
                      max-w-[92vw]
                      sm:max-w-[540px]
                      md:max-w-[600px]
                      lg:max-w-[620px]
                      xl:max-w-[660px]
                      max-h-[72vh]
                      object-contain select-none
                      drop-shadow-[0_22px_80px_rgba(0,0,0,0.75)]
                    "
                                    />
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* ✅ Manual arrows — pushed to edges, centered vertically, mobile-friendly */}
                <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between">
                    {/* LEFT */}
                    <button
                        onClick={prev}
                        aria-label="Previous slide"
                        className="
              pointer-events-auto
              rounded-full
              border border-white/12
              bg-white/[0.06]
              backdrop-blur-md
              text-white/80
              hover:bg-white/[0.12]
              hover:text-white
              transition
              flex items-center justify-center
              font-black
              select-none

              w-8 h-8 text-[18px]
              sm:w-10 sm:h-10 sm:text-[20px]
              md:w-12 md:h-12 md:text-[22px]

              ml-2 sm:ml-3 md:ml-4
              lg:ml-0 lg:-translate-x-5 xl:-translate-x-10

              opacity-100 sm:opacity-0 sm:group-hover:opacity-100
              duration-300
            "
                    >
                        ‹
                    </button>

                    {/* RIGHT */}
                    <button
                        onClick={next}
                        aria-label="Next slide"
                        className="
              pointer-events-auto
              rounded-full
              border border-white/12
              bg-white/[0.06]
              backdrop-blur-md
              text-white/80
              hover:bg-white/[0.12]
              hover:text-white
              transition
              flex items-center justify-center
              font-black
              select-none

              w-8 h-8 text-[18px]
              sm:w-10 sm:h-10 sm:text-[20px]
              md:w-12 md:h-12 md:text-[22px]

              mr-2 sm:mr-3 md:mr-4
              lg:mr-0 lg:translate-x-5 xl:translate-x-10

              opacity-100 sm:opacity-0 sm:group-hover:opacity-100
              duration-300
            "
                    >
                        ›
                    </button>
                </div>

                {/* bottom fade */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 sm:h-40 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
            </div>
        </div>
    );
});

export default HeroSlider;