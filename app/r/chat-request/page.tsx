"use client";

import { useEffect, useState } from "react";

export default function ChatRequestRedirectPage() {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rid = params.get("rid");
    const t = params.get("t");

    if (!rid || !t) {
      setShowHint(true);
      return;
    }

    // Attempt to open the app via custom scheme
    const appUrl = `stayknown://chat-request/review?rid=${encodeURIComponent(
      rid
    )}&t=${encodeURIComponent(t)}`;

    // Try to open the app
    window.location.href = appUrl;

    // If app is not installed, after delay show hint
    const timer = setTimeout(() => {
      setShowHint(true);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="
        min-h-screen
        flex items-center justify-center
        bg-[#f3f4f6]
        px-6
      "
    >
      <div
        className="
          w-full max-w-md
          rounded-3xl
          border border-black/10
          bg-white/70
          backdrop-blur-xl
          shadow-[0_30px_80px_rgba(0,0,0,0.08)]
          p-8
          text-center
        "
      >
        <div className="text-[16px] font-[900] tracking-tight text-black">
          Opening StayKnown…
        </div>

        {showHint && (
          <div className="mt-5 text-[12px] font-[700] leading-relaxed text-black/55 tracking-[0.2px]">
            To review this chat request, please ensure
            <span className="font-[900] text-black"> StayKnown™ </span>
            is installed on your device from the official App Store or
            Google Play Store.
          </div>
        )}
      </div>
    </div>
  );
}