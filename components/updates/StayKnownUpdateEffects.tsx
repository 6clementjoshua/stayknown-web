"use client";
import { useEffect, useMemo, useState } from "react";
import type { AnimationPreset } from "@/lib/stayknown-updates";

export function StayKnownUpdateEffects({
  preset,
  postId,
}: {
  preset: AnimationPreset;
  postId: string;
}) {
  const [pieces, setPieces] = useState<
    Array<{
      id: number;
      left: number;
      delay: number;
      duration: number;
      size: number;
      tone: number;
    }>
  >([]);
  const celebratory = preset === "confetti" || preset === "milestone-burst";
  useEffect(() => {
    if (
      !celebratory ||
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const key = `sk-update-effect:${postId}:${preset}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    setPieces(
      Array.from({ length: preset === "confetti" ? 72 : 42 }, (_, id) => ({
        id,
        left: Math.random() * 100,
        delay: Math.random() * 0.75,
        duration: 2.2 + Math.random() * 2.2,
        size: 4 + Math.random() * 7,
        tone: Math.floor(Math.random() * 4),
      })),
    );
    const t = setTimeout(() => setPieces([]), 5200);
    return () => clearTimeout(t);
  }, [celebratory, postId, preset]);
  if (!pieces.length) return null;
  const tones = ["#ffffff", "#d9d9d9", "#8f8f8f", "#454545"];
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[110] overflow-hidden"
    >
      {pieces.map((p) => (
        <i
          key={p.id}
          className="absolute -top-6 block rounded-[2px] sk-confetti"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.55,
            background: tones[p.tone],
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
