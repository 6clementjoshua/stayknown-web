"use client";
import { useEffect, useState } from "react";
function token() {
  const k = "stayknown:update-like-token";
  let v = localStorage.getItem(k);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(k, v);
  }
  return v;
}
export function UpdateLikeButton({
  postId,
  initial,
}: {
  postId: string;
  initial: number;
}) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initial);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setLiked(localStorage.getItem(`stayknown:update-liked:${postId}`) === "1");
  }, [postId]);
  async function toggle() {
    if (busy) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/updates/${postId}/like`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: token() }),
      });
      if (!r.ok) throw new Error("like_failed");
      const j = await r.json();
      setLiked(!!j.liked);
      setCount(Number(j.likeCount) || 0);
      localStorage.setItem(
        `stayknown:update-liked:${postId}`,
        j.liked ? "1" : "0",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-pressed={liked}
      className="group inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/[0.035] px-3.5 py-2 text-[11px] font-black text-white/70 transition duration-300 hover:-translate-y-0.5 hover:border-white/32 hover:bg-white hover:text-black active:scale-95 disabled:opacity-50"
    >
      <span
        className={`text-[15px] transition duration-300 ${liked ? "scale-110" : "group-hover:scale-110"}`}
      >
        {liked ? "♥" : "♡"}
      </span>
      <span className="tabular-nums">{count.toLocaleString()}</span>
    </button>
  );
}
