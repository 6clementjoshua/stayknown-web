"use client";

import { useEffect, useState } from "react";

function browserToken() {
  const key = "stayknown:update-like-token";
  let value = localStorage.getItem(key);

  if (!value) {
    value = crypto.randomUUID();
    localStorage.setItem(key, value);
  }

  return value;
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
  const [error, setError] = useState("");

  useEffect(() => {
    setLiked(localStorage.getItem(`stayknown:update-liked:${postId}`) === "1");
  }, [postId]);

  useEffect(() => {
    setCount(initial);
  }, [initial]);

  async function toggle() {
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      const response = await fetch(`/api/updates/${postId}/like`, {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({ token: browserToken() }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "Like could not be saved.");
      }

      const nextLiked = Boolean(payload.liked);
      const nextCount = Number(payload.likeCount);

      setLiked(nextLiked);
      setCount(Number.isFinite(nextCount) ? nextCount : count);
      localStorage.setItem(
        `stayknown:update-liked:${postId}`,
        nextLiked ? "1" : "0",
      );
    } catch (cause) {
      console.error("stayknown_update_like_failed", cause);
      setError("Like was not saved. Tap again to retry.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-1.5">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        aria-pressed={liked}
        aria-busy={busy}
        className="group inline-flex min-w-[70px] items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.035] px-3.5 py-2 text-[11px] font-black text-white/70 transition duration-300 hover:-translate-y-0.5 hover:border-white/32 hover:bg-white hover:!text-black active:scale-95 disabled:cursor-wait disabled:opacity-60"
      >
        {busy ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <span
            className={`text-[15px] transition duration-300 ${
              liked ? "scale-110" : "group-hover:scale-110"
            }`}
          >
            {liked ? "♥" : "♡"}
          </span>
        )}
        <span className="tabular-nums">{count.toLocaleString()}</span>
      </button>

      {error ? (
        <span role="status" className="text-[9px] font-bold text-white/45">
          {error}
        </span>
      ) : null}
    </div>
  );
}
