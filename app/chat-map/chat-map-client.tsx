"use client";

import React from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type ChatMapPayload = {
  lat: number;
  lng: number;
  accuracy?: number;
  place?: string;
  capturedAt?: string;
  senderName?: string;
  senderUsername?: string;
  senderId?: string;
  context?: string;
  messageId?: string;
  threadId?: string;
};

type ChatPresenceStatus = "in_chat" | "online" | "offline";
type CoordinateAge = "fresh" | "recent" | "old";
type RenderMode = "map" | "fallback";

type StatusResp = {
  ok: boolean;
  sender_id?: string | null;
  thread_id?: string | null;
  message_id?: string | null;
  presence?: {
    is_online?: boolean;
    is_in_this_chat?: boolean;
    active_thread_id?: string | null;
    last_seen_at?: string | null;
  };
  opened_message?: {
    id?: string | null;
    created_at?: string | null;
    lat?: number | null;
    lng?: number | null;
    place?: string | null;
    captured_at?: string | null;
  };
  latest_coordinate?: {
    message_id?: string | null;
    lat?: number;
    lng?: number;
    place?: string | null;
    captured_at?: string | null;
    created_at?: string | null;
  } | null;
  newer_coordinate_available?: boolean;
  error?: string;
  detail?: string;
};

const INITIAL_VIEW_ZOOM = 14.25;
const MAP_LOAD_TIMEOUT_MS = 16000;
const MAP_AUTO_RETRY_LIMIT = 2;
const MAP_RETRY_DELAY_MS = 900;
const STATUS_POLL_MS = 4000;

function safeText(v?: string | null, fallback = "") {
  const s = String(v || "").trim();
  return s || fallback;
}

function getTomTomStyleUrl() {
  return (process.env.NEXT_PUBLIC_TOMTOM_STYLE_URL || "").trim();
}

function prefersDarkTheme() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function isPhoneViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
}

function isDesktop() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(min-width: 900px)").matches;
}

function isInAppBrowser() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return (
    /Gmail/i.test(ua) ||
    /FBAN|FBAV|Instagram|Line|MicroMessenger|wv/i.test(ua) ||
    (/Android/i.test(ua) && /Version\/[\d.]+/i.test(ua))
  );
}

function formatCoords(lat: number, lng: number) {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

function formatCapturedTime(v?: string | null) {
  if (!v) return "Capture time unavailable";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "Capture time unavailable";

  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function coordinateAgeFrom(v?: string | null): CoordinateAge {
  if (!v) return "old";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "old";

  const mins = (Date.now() - d.getTime()) / 60000;
  if (mins <= 2) return "fresh";
  if (mins <= 30) return "recent";
  return "old";
}

function ageLabel(age: CoordinateAge) {
  if (age === "fresh") return "Fresh coordinate";
  if (age === "recent") return "Recent coordinate";
  return "Older coordinate";
}

function ageHint(age: CoordinateAge, newerAvailable: boolean) {
  if (newerAvailable) {
    return "This was opened from an older chat message. A newer chat coordinate exists in this thread.";
  }

  if (age === "fresh") {
    return "This chat coordinate was captured very recently.";
  }

  if (age === "recent") {
    return "This is a recent shared chat coordinate, not a live visit session.";
  }

  return "This is an older shared chat coordinate, shown for context only.";
}

function presenceStatusFrom(status?: StatusResp | null): ChatPresenceStatus {
  if (status?.presence?.is_in_this_chat) return "in_chat";
  if (status?.presence?.is_online) return "online";
  return "offline";
}

function presenceLabel(v: ChatPresenceStatus) {
  if (v === "in_chat") return "In this chat now";
  if (v === "online") return "Online in StayKnown";
  return "Not currently in chat";
}

function legalTinyLine() {
  const year = new Date().getFullYear();
  return `A 6 Clement Joshua Service™  •  © ${year}`;
}

function safetyUseHint() {
  return (
    "Use this chat location only for legitimate safety and approved-contact communication. " +
    "Do not use StayKnown to stalk, harass, pressure, or secretly monitor anyone. " +
    "Misuse may lead to safety review, access restriction, account action, and reporting where required."
  );
}

function buildMarkerEl(isFresh = true) {
  const wrap = document.createElement("div");
  wrap.style.width = "88px";
  wrap.style.height = "88px";
  wrap.style.display = "flex";
  wrap.style.alignItems = "center";
  wrap.style.justifyContent = "center";
  wrap.style.position = "relative";

  const makeRing = (delayMs: number, size: number) => {
    const ring = document.createElement("div");
    ring.style.position = "absolute";
    ring.style.width = `${size}px`;
    ring.style.height = `${size}px`;
    ring.style.borderRadius = "9999px";
    ring.style.border = "1.2px solid rgba(210,210,210,0.58)";
    ring.style.boxShadow = "0 0 16px rgba(255,255,255,0.06)";
    ring.style.opacity = "0";
    ring.style.transform = "scale(0.72)";
    ring.setAttribute("data-sk-radar", "1");
    ring.style.animation = isFresh
      ? `skChatRadar 2.9s ease-out ${delayMs}ms infinite`
      : "none";
    return ring;
  };

  const halo = document.createElement("div");
  halo.style.position = "absolute";
  halo.style.width = "52px";
  halo.style.height = "52px";
  halo.style.borderRadius = "9999px";
  halo.style.background = "rgba(255,255,255,0.10)";
  halo.style.backdropFilter = "blur(10px)";
  halo.style.boxShadow = "0 0 0 9px rgba(255,255,255,0.04)";

  const pin = document.createElement("div");
  pin.style.width = "44px";
  pin.style.height = "44px";
  pin.style.borderRadius = "9999px";
  pin.style.display = "flex";
  pin.style.alignItems = "center";
  pin.style.justifyContent = "center";
  pin.style.background =
    "linear-gradient(180deg, rgba(255,255,255,0.99), rgba(243,245,247,0.95))";
  pin.style.border = "1px solid rgba(255,255,255,0.98)";
  pin.style.boxShadow =
    "0 14px 30px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,1), inset 0 -8px 18px rgba(0,0,0,0.04)";
  pin.style.position = "relative";
  pin.style.zIndex = "3";

  const img = document.createElement("img");
  img.src = "/6logo.png";
  img.alt = "StayKnown";
  img.style.width = "18px";
  img.style.height = "18px";
  img.style.objectFit = "contain";

  pin.appendChild(img);

  if (isFresh) {
    wrap.appendChild(makeRing(0, 50));
    wrap.appendChild(makeRing(760, 62));
    wrap.appendChild(makeRing(1520, 76));
  }

  wrap.appendChild(halo);
  wrap.appendChild(pin);

  return wrap;
}

function PremiumSpinner() {
  return (
    <div className="relative h-5 w-5 shrink-0">
      <div
        className="absolute inset-0 rounded-full border border-white/70 border-t-black/65 animate-spin"
        style={{ animationDuration: "900ms" }}
      />
      <div
        className="absolute inset-[4px] rounded-full border border-black/10 border-b-black/45 animate-spin"
        style={{ animationDuration: "1300ms", animationDirection: "reverse" }}
      />
    </div>
  );
}

export default function ChatMapClient({
  payload,
}: {
  payload: ChatMapPayload;
}) {
  const mapDivRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<maplibregl.Map | null>(null);
  const markerRef = React.useRef<maplibregl.Marker | null>(null);

  const [renderMode, setRenderMode] = React.useState<RenderMode>("map");
  const [darkTheme, setDarkTheme] = React.useState(false);
  const [mapReady, setMapReady] = React.useState(false);
  const [mapRetrying, setMapRetrying] = React.useState(false);
  const [mapLoadError, setMapLoadError] = React.useState("");
  const [mobileSheetShrunk, setMobileSheetShrunk] = React.useState(false);
  const [status, setStatus] = React.useState<StatusResp | null>(null);

  const [lat, setLat] = React.useState(payload.lat);
  const [lng, setLng] = React.useState(payload.lng);
  const [place, setPlace] = React.useState(
    safeText(payload.place, "Shared chat location"),
  );
  const [capturedAt, setCapturedAt] = React.useState(payload.capturedAt || "");
  const [accuracy, setAccuracy] = React.useState(
    typeof payload.accuracy === "number" && Number.isFinite(payload.accuracy)
      ? payload.accuracy
      : undefined,
  );

  const sender = safeText(payload.senderName, "StayKnown user");
  const username = safeText(payload.senderUsername);
  const coords = formatCoords(lat, lng);

  const coordinateAge = coordinateAgeFrom(capturedAt);
  const presenceStatus = presenceStatusFrom(status);
  const newerAvailable = status?.newer_coordinate_available === true;

  const locationHeading = newerAvailable
    ? "Opened message"
    : coordinateAge === "old"
      ? "Shared coordinate"
      : "Current area";

  const eyebrow = `${presenceLabel(presenceStatus)} • Chat location`;

  const cardBg = darkTheme ? "bg-black/78" : "bg-white/92";
  const cardBorder = darkTheme ? "border-white/10" : "border-black/10";
  const cardText = darkTheme ? "text-white" : "text-black";
  const mutedText = darkTheme ? "text-white/45" : "text-black/45";
  const innerBg = darkTheme ? "bg-white/5" : "bg-[#f6f7f8]";
  const coordText = darkTheme ? "!text-white" : "!text-black";

  const isPhone = isPhoneViewport();
  const showMobileSheet = isPhone && renderMode === "map" && mapReady;
  const showZoomControls = renderMode === "map" && mapReady;
  const mobileSheetBottom = "bottom-[18px]";
  const mobileZoomBottom = mobileSheetShrunk
    ? "bottom-[112px]"
    : "bottom-[248px]";

  const centerMapOn = React.useCallback((nextLat: number, nextLng: number) => {
    const map = mapRef.current;
    if (!map) return;

    if (!Number.isFinite(nextLat) || !Number.isFinite(nextLng)) return;

    map.jumpTo({
      center: [nextLng, nextLat],
      zoom: Math.max(map.getZoom(), INITIAL_VIEW_ZOOM),
    });

    window.requestAnimationFrame(() => {
      map.resize();
    });
  }, []);

  const syncMarker = React.useCallback(
    (nextLat: number, nextLng: number, fresh: boolean) => {
      if (!mapRef.current) return;

      if (!markerRef.current) {
        markerRef.current = new maplibregl.Marker({
          element: buildMarkerEl(fresh),
          anchor: "center",
        })
          .setLngLat([nextLng, nextLat])
          .addTo(mapRef.current);
      } else {
        const el = markerRef.current.getElement();
        const hasRadar = Boolean(el.querySelector("[data-sk-radar='1']"));

        if ((fresh && !hasRadar) || (!fresh && hasRadar)) {
          markerRef.current.remove();
          markerRef.current = new maplibregl.Marker({
            element: buildMarkerEl(fresh),
            anchor: "center",
          })
            .setLngLat([nextLng, nextLat])
            .addTo(mapRef.current);
        } else {
          markerRef.current.setLngLat([nextLng, nextLat]);
        }
      }
    },
    [],
  );

  const fetchStatus = React.useCallback(async () => {
    const qs = new URLSearchParams();

    if (payload.threadId) qs.set("thread_id", payload.threadId);
    if (payload.messageId) qs.set("message_id", payload.messageId);
    if (payload.senderId) qs.set("sender_id", payload.senderId);

    qs.set("lat", String(payload.lat));
    qs.set("lng", String(payload.lng));

    if (payload.capturedAt) qs.set("captured_at", payload.capturedAt);

    const res = await fetch(`/api/chat-map/status?${qs.toString()}`, {
      cache: "no-store",
    });

    const json = (await res.json()) as StatusResp;

    if (!json.ok) {
      setStatus(json);
      return;
    }

    setStatus(json);

    const opened = json.opened_message;
    const nextLat =
      typeof opened?.lat === "number" && Number.isFinite(opened.lat)
        ? opened.lat
        : payload.lat;

    const nextLng =
      typeof opened?.lng === "number" && Number.isFinite(opened.lng)
        ? opened.lng
        : payload.lng;

    const nextPlace = safeText(
      opened?.place,
      payload.place || "Shared chat location",
    );
    const nextCaptured =
      safeText(opened?.captured_at) ||
      safeText(opened?.created_at) ||
      safeText(payload.capturedAt);

    setLat(nextLat);
    setLng(nextLng);
    setPlace(nextPlace);
    setCapturedAt(nextCaptured);

    syncMarker(nextLat, nextLng, coordinateAgeFrom(nextCaptured) !== "old");
    centerMapOn(nextLat, nextLng);
  }, [payload, syncMarker, centerMapOn]);

  React.useEffect(() => {
    setDarkTheme(prefersDarkTheme());

    const mq =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;

    const onChange = (e: MediaQueryListEvent) => setDarkTheme(e.matches);
    mq?.addEventListener?.("change", onChange);
    return () => mq?.removeEventListener?.("change", onChange);
  }, []);

  React.useEffect(() => {
    let closed = false;

    async function bootTomTomMap() {
      const tomtomStyleUrl = getTomTomStyleUrl();
      const tomtomKey = (process.env.NEXT_PUBLIC_TOMTOM_API_KEY || "").trim();

      if (!tomtomStyleUrl)
        throw new Error("Missing NEXT_PUBLIC_TOMTOM_STYLE_URL");
      if (!tomtomKey) throw new Error("Missing NEXT_PUBLIC_TOMTOM_API_KEY");

      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= MAP_AUTO_RETRY_LIMIT; attempt++) {
        if (!mapDivRef.current) throw new Error("Map container missing.");
        if (closed) return;

        try {
          setMapLoadError("");
          setMapReady(false);
          setMapRetrying(attempt > 0);

          markerRef.current?.remove();
          markerRef.current = null;

          mapRef.current?.remove();
          mapRef.current = null;

          const map = new maplibregl.Map({
            container: mapDivRef.current,
            style: tomtomStyleUrl,
            center: [payload.lng, payload.lat],
            zoom: INITIAL_VIEW_ZOOM,
            minZoom: 3,
            maxZoom: 19,
            attributionControl: false,
            dragRotate: false,
            pitchWithRotate: false,
            trackResize: true,
            fadeDuration: 0,
            transformRequest: (url) => ({
              url,
              headers: { "TomTom-Api-Key": tomtomKey },
            }),
          });

          mapRef.current = map;

          await new Promise<void>((resolve, reject) => {
            let settled = false;

            const finish = (fn: () => void) => {
              if (settled) return;
              settled = true;
              fn();
            };

            const timeout = setTimeout(() => {
              finish(() =>
                reject(
                  new Error("The chat map is taking longer than expected."),
                ),
              );
            }, MAP_LOAD_TIMEOUT_MS);

            map.once("load", () => {
              finish(() => {
                clearTimeout(timeout);
                setMapReady(true);
                setMapLoadError("");

                map.resize();
                window.requestAnimationFrame(() => map.resize());
                setTimeout(() => map.resize(), 150);
                setTimeout(() => map.resize(), 500);

                resolve();
              });
            });

            map.once("error", () => {
              finish(() => {
                clearTimeout(timeout);
                setMapReady(false);
                reject(new Error("The chat map could not be rendered yet."));
              });
            });
          });

          setMapRetrying(false);

          syncMarker(payload.lat, payload.lng, coordinateAge !== "old");

          map.jumpTo({
            center: [payload.lng, payload.lat],
            zoom: INITIAL_VIEW_ZOOM,
          });

          await fetchStatus();

          return;
        } catch (error) {
          lastError =
            error instanceof Error
              ? error
              : new Error("The chat map could not be rendered.");

          setMapReady(false);

          markerRef.current?.remove();
          markerRef.current = null;

          mapRef.current?.remove();
          mapRef.current = null;

          if (attempt < MAP_AUTO_RETRY_LIMIT) {
            setMapLoadError("Reloading map…");
            await new Promise((r) => setTimeout(r, MAP_RETRY_DELAY_MS));
            continue;
          }

          setMapRetrying(false);
          throw lastError;
        }
      }

      throw lastError ?? new Error("The chat map could not be rendered.");
    }

    async function boot() {
      try {
        await fetchStatus();

        if (isInAppBrowser()) {
          setRenderMode("fallback");
          setMapReady(false);
          return;
        }

        setRenderMode("map");
        await bootTomTomMap();
      } catch (e) {
        if (closed) return;
        setRenderMode("fallback");
        setMapReady(false);
        setMapLoadError(
          e instanceof Error ? e.message : "Map preview unavailable here.",
        );
      }
    }

    void boot();

    return () => {
      closed = true;
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [payload.lat, payload.lng]);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      void fetchStatus();
    }, STATUS_POLL_MS);

    return () => window.clearInterval(timer);
  }, [fetchStatus]);

  React.useEffect(() => {
    if (!mapRef.current || renderMode !== "map") return;

    const resizeMap = () => {
      window.requestAnimationFrame(() => {
        mapRef.current?.resize();
      });
    };

    resizeMap();

    const t1 = window.setTimeout(resizeMap, 60);
    const t2 = window.setTimeout(resizeMap, 180);
    const t3 = window.setTimeout(resizeMap, 420);
    const t4 = window.setTimeout(resizeMap, 900);

    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    vv?.addEventListener("resize", resizeMap);
    vv?.addEventListener("scroll", resizeMap);
    window.addEventListener("orientationchange", resizeMap);
    window.addEventListener("resize", resizeMap);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
      vv?.removeEventListener("resize", resizeMap);
      vv?.removeEventListener("scroll", resizeMap);
      window.removeEventListener("orientationchange", resizeMap);
      window.removeEventListener("resize", resizeMap);
    };
  }, [renderMode, mapReady, mobileSheetShrunk]);

  const infoRows = [
    {
      label: "Captured",
      value: formatCapturedTime(capturedAt),
      show: true,
    },
    {
      label: "Accuracy",
      value:
        typeof accuracy === "number" && Number.isFinite(accuracy)
          ? `± ${accuracy.toFixed(accuracy >= 10 ? 0 : 1)} m`
          : "—",
      show: true,
    },
    {
      label: "Message context",
      value: ageHint(coordinateAge, newerAvailable),
      show: true,
    },
    {
      label: "Coordinates",
      value: coords,
      show: true,
    },
  ].filter((x) => x.show);

  return (
    <div
      className="fixed inset-0 w-screen overflow-hidden bg-transparent"
      style={{ height: "100dvh", minHeight: "100dvh" }}
    >
      <style jsx global>{`
        @keyframes skChatRadar {
          0% {
            opacity: 0;
            transform: scale(0.72);
          }
          18% {
            opacity: 0.62;
          }
          100% {
            opacity: 0;
            transform: scale(1.45);
          }
        }
      `}</style>

      {renderMode === "map" ? (
        <div
          className="absolute inset-0 z-0 overflow-hidden"
          style={{ height: "100dvh" }}
        >
          <div
            ref={mapDivRef}
            className="absolute inset-0 h-full w-full"
            style={{
              height: "100dvh",
              minHeight: "100dvh",
              background: darkTheme ? "#111111" : "#eef1f4",
            }}
          />

          {showMobileSheet && isPhone ? (
            <div
              className={`absolute inset-x-0 z-30 px-3 pointer-events-none ${mobileSheetBottom}`}
            >
              <div
                data-sk-mobile-sheet="1"
                className="mx-auto w-[calc(100%-10px)] max-w-[640px] pointer-events-auto"
              >
                <div
                  className={`rounded-[30px] border shadow-[0_24px_60px_rgba(0,0,0,0.18)] overflow-hidden backdrop-blur-2xl ${
                    darkTheme
                      ? "bg-black/68 border-white/14"
                      : "bg-black/34 border-white/12"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setMobileSheetShrunk((v) => !v)}
                    className="w-full px-4 pt-1.5 pb-[2px]"
                    aria-label="Toggle chat map details"
                  >
                    <div
                      className={`mx-auto h-1.5 w-12 rounded-full ${
                        darkTheme ? "bg-white/18" : "bg-black/18"
                      }`}
                    />
                  </button>

                  <div className="px-4 pt-1.5 pb-[2px]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div
                          className={`flex items-center gap-1 text-[6px] uppercase tracking-[0.2em] font-extrabold ${mutedText}`}
                        >
                          <span>{presenceLabel(presenceStatus)}</span>
                          <span>•</span>
                          <span>{ageLabel(coordinateAge)}</span>
                        </div>

                        <div
                          className={`mt-1 text-[12px] font-black leading-[1.25] ${cardText}`}
                        >
                          {place}
                        </div>

                        <div
                          className={`mt-1 text-[9px] leading-4 ${
                            darkTheme ? "text-white/58" : "text-black/56"
                          }`}
                        >
                          {sender}
                          {username ? ` • @${username}` : ""}
                        </div>
                      </div>
                    </div>
                  </div>

                  {!mobileSheetShrunk ? (
                    <div className="px-4 pb-0">
                      <div
                        className={`rounded-[18px] border ${cardBorder} ${innerBg} px-3 py-2`}
                      >
                        <div
                          className="max-h-[116px] overflow-y-auto pr-[2px] text-center"
                          style={{ WebkitOverflowScrolling: "touch" }}
                        >
                          <div className="space-y-2">
                            <div>
                              <div
                                className={`text-[7px] uppercase tracking-[0.22em] font-extrabold ${
                                  darkTheme ? "text-white/38" : "text-black/40"
                                }`}
                              >
                                {locationHeading}
                              </div>
                              <div
                                className={`mt-1 text-[10px] font-bold leading-4 ${cardText}`}
                              >
                                {place}
                              </div>
                            </div>

                            {infoRows.map((item) => (
                              <div key={item.label}>
                                <div
                                  className={`text-[7px] uppercase tracking-[0.22em] font-extrabold ${
                                    darkTheme
                                      ? "text-white/38"
                                      : "text-black/40"
                                  }`}
                                >
                                  {item.label}
                                </div>
                                <div
                                  className={`mt-1 text-[10px] font-bold leading-4 break-words ${
                                    item.label === "Coordinates"
                                      ? `break-all ${coordText}`
                                      : darkTheme
                                        ? "text-white/82"
                                        : "text-black/78"
                                  }`}
                                >
                                  {item.value}
                                </div>
                              </div>
                            ))}

                            <div>
                              <div
                                className={`text-[7px] uppercase tracking-[0.22em] font-extrabold ${
                                  darkTheme ? "text-white/38" : "text-black/40"
                                }`}
                              >
                                Reminder
                              </div>
                              <div
                                className={`mt-1 text-[9px] leading-4 ${
                                  darkTheme ? "text-white/70" : "text-black/66"
                                }`}
                              >
                                {safetyUseHint()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div
                    className={`border-t px-3 py-1.5 text-center text-[7px] font-semibold leading-3 ${
                      darkTheme
                        ? "border-white/8 text-white/52"
                        : "border-black/8 text-black/50"
                    }`}
                  >
                    {legalTinyLine()}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div
          className="absolute inset-0 z-0"
          style={{
            height: "100dvh",
            background: darkTheme
              ? "radial-gradient(circle at top,#1d1d1d,#050505 58%)"
              : "linear-gradient(180deg,#eef1f4,#d9dde1)",
          }}
        />
      )}

      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20">
        <div className="rounded-[24px] bg-white/84 border border-white/92 shadow-[0_14px_38px_rgba(0,0,0,0.16)] px-4 py-2.5 backdrop-blur-2xl min-w-[132px]">
          <div className="flex flex-col items-center justify-center">
            <img
              src="/6logo.png"
              alt="StayKnown"
              className="h-5 w-5 object-contain"
            />
            <div className="mt-1 text-[8px] uppercase tracking-[0.34em] text-black/55 font-semibold">
              StayKnown
            </div>
          </div>
        </div>
      </div>

      {mapRetrying && (
        <div className="absolute top-[92px] left-1/2 -translate-x-1/2 z-20">
          <PremiumSpinner />
        </div>
      )}

      {mapLoadError && (
        <div className="absolute top-[124px] left-1/2 -translate-x-1/2 z-20">
          <div
            className={`rounded-full border shadow-md px-3 py-2 ${
              mapRetrying
                ? "bg-white/88 border-white/90"
                : "bg-white/88 border-white/90"
            }`}
          >
            <span className="text-[10px] tracking-[0.12em] font-bold whitespace-nowrap text-black/62">
              {mapLoadError}
            </span>
          </div>
        </div>
      )}

      {!isPhone ? (
        <div className="absolute inset-x-0 bottom-12 z-30 px-4">
          <div className="mx-auto flex w-full max-w-[1120px] flex-col items-center gap-2">
            <div
              className={`pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-1 rounded-full border ${cardBorder} ${cardBg} px-2 py-1.5 shadow-[0_14px_34px_rgba(0,0,0,0.10)] backdrop-blur-2xl`}
            >
              <div className="rounded-full border bg-[#dff5ee] text-[#0e8f70] border-[#ccebdd] px-2.5 py-[6px] text-[8px] font-extrabold uppercase tracking-[0.18em]">
                {presenceLabel(presenceStatus)}
              </div>

              <div className="rounded-full border border-white/75 bg-white/88 px-2 py-[6px] text-[8px] font-extrabold uppercase tracking-[0.13em] text-black/46">
                {locationHeading} <span className="ml-1 text-black/34">›</span>
              </div>

              <div className="rounded-full border border-white/75 bg-white/92 px-2.5 py-[6px] text-[10px] font-bold text-black/78 max-w-[280px] truncate">
                {place}
              </div>

              <div className="rounded-full border border-white/75 bg-white/88 px-2 py-[6px] text-[8px] font-extrabold uppercase tracking-[0.13em] text-black/46">
                Sender <span className="ml-1 text-black/34">›</span>
              </div>

              <div className="rounded-full border border-white/75 bg-white/92 px-2.5 py-[6px] text-[10px] font-bold text-black/78 max-w-[200px] truncate">
                {sender}
              </div>

              <div className="rounded-full border border-white/75 bg-white/88 px-2 py-[6px] text-[8px] font-extrabold uppercase tracking-[0.13em] text-black/46">
                Captured <span className="ml-1 text-black/34">›</span>
              </div>

              <div className="rounded-full border border-white/75 bg-white/92 px-2.5 py-[6px] text-[10px] font-bold text-black/78">
                {formatCapturedTime(capturedAt)}
              </div>
            </div>

            <div
              className={`pointer-events-auto flex max-w-[1080px] flex-wrap items-center justify-center gap-1.5 rounded-[18px] border ${cardBorder} ${cardBg} px-2.5 py-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.08)] backdrop-blur-2xl`}
            >
              {infoRows.map((item) => (
                <React.Fragment key={item.label}>
                  <div className="rounded-full border border-white/75 bg-white/88 px-2 py-[6px] text-[8px] font-extrabold uppercase tracking-[0.13em] text-black/46">
                    {item.label} <span className="ml-1 text-black/34">›</span>
                  </div>
                  <div className="rounded-[16px] border border-white/75 bg-white/92 px-3 py-[6px] text-[10px] font-bold text-black/78 max-w-[420px] whitespace-normal break-words text-center">
                    {item.value}
                  </div>
                </React.Fragment>
              ))}
            </div>

            <div className="pointer-events-none max-w-[980px] rounded-[22px] border border-white/70 bg-white/48 px-4 py-2 text-center text-[10px] font-bold leading-5 text-black/56 shadow-[0_10px_28px_rgba(0,0,0,0.10)] backdrop-blur-2xl">
              {safetyUseHint()}
            </div>

            <div
              className={`pointer-events-none max-w-[980px] rounded-[22px] border px-4 py-[5px] text-center text-[8px] font-semibold leading-4 shadow-[0_10px_28px_rgba(0,0,0,0.06)] backdrop-blur-2xl ${
                darkTheme
                  ? "border-white/10 bg-black/28 text-white/52"
                  : "border-white/70 bg-white/48 text-black/50"
              }`}
            >
              {legalTinyLine()}
            </div>
          </div>
        </div>
      ) : null}

      <div
        className={`absolute right-4 z-40 flex flex-col gap-2 ${
          showZoomControls
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        } ${isPhone ? mobileZoomBottom : "bottom-6"}`}
      >
        <button
          type="button"
          aria-label="Zoom in"
          disabled={!mapReady || renderMode !== "map"}
          onClick={() => mapRef.current?.zoomIn({ duration: 220 })}
          className="h-7 w-7 rounded-[18px] border border-white/55 bg-white/38 text-[16px] font-black text-black/58 shadow-[0_10px_24px_rgba(0,0,0,0.10)] backdrop-blur-xl disabled:opacity-40"
        >
          +
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          disabled={!mapReady || renderMode !== "map"}
          onClick={() => mapRef.current?.zoomOut({ duration: 220 })}
          className="h-7 w-7 rounded-[18px] border border-white/40 bg-white/22 text-[16px] font-black text-black/62 shadow-[0_10px_24px_rgba(0,0,0,0.12)] backdrop-blur-xl disabled:opacity-40"
        >
          −
        </button>
      </div>
    </div>
  );
}
