"use client";

import React from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type SeedResp = {
  ok: boolean;
  session_id: string;
  latest?: {
    lat: number;
    lng: number;
    accuracy?: number;
    place?: string;
    created_at?: string;
  } | null;
  sos_active?: boolean;
  ended?: boolean;
  error?: string;
  detail?: string;
};

type LiveStatus = "loading" | "live" | "ended" | "error";
type RenderMode = "map" | "fallback";

function formatCoords(lat: number, lng: number) {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

function googleMapsHref(lat?: number, lng?: number) {
  if (typeof lat !== "number" || typeof lng !== "number") return "";
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function formatLiveTime(v?: string) {
  if (!v) return "Waiting for update…";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "Waiting for update…";
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
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

function buildMarkerEl() {
  const wrap = document.createElement("div");
  wrap.style.width = "64px";
  wrap.style.height = "78px";
  wrap.style.display = "flex";
  wrap.style.flexDirection = "column";
  wrap.style.alignItems = "center";
  wrap.style.justifyContent = "center";
  wrap.style.position = "relative";

  const pulse = document.createElement("div");
  pulse.style.position = "absolute";
  pulse.style.top = "8px";
  pulse.style.width = "46px";
  pulse.style.height = "46px";
  pulse.style.borderRadius = "9999px";
  pulse.style.background = "rgba(17,17,17,0.08)";
  pulse.style.boxShadow = "0 0 0 8px rgba(17,17,17,0.05)";

  const pin = document.createElement("div");
  pin.style.width = "46px";
  pin.style.height = "46px";
  pin.style.borderRadius = "9999px";
  pin.style.display = "flex";
  pin.style.alignItems = "center";
  pin.style.justifyContent = "center";
  pin.style.background = "rgba(255,255,255,0.98)";
  pin.style.border = "1px solid rgba(0,0,0,0.08)";
  pin.style.boxShadow =
    "0 14px 28px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.96)";
  pin.style.position = "relative";
  pin.style.zIndex = "2";

  const img = document.createElement("img");
  img.src = "/6logo.png";
  img.alt = "StayKnown";
  img.style.width = "22px";
  img.style.height = "22px";
  img.style.objectFit = "contain";

  const label = document.createElement("div");
  label.textContent = "StayKnown";
  label.style.marginTop = "5px";
  label.style.fontSize = "8px";
  label.style.fontWeight = "900";
  label.style.letterSpacing = "0.12em";
  label.style.color = "#111111";
  label.style.textTransform = "uppercase";
  label.style.position = "relative";
  label.style.zIndex = "2";

  pin.appendChild(img);
  wrap.appendChild(pulse);
  wrap.appendChild(pin);
  wrap.appendChild(label);

  return wrap;
}

function PremiumSpinner() {
  return (
    <div className="relative h-4 w-4">
      <div
        className="absolute inset-0 rounded-full border border-black/25 border-t-black animate-spin"
        style={{ animationDuration: "900ms" }}
      />
      <div
        className="absolute inset-[2px] rounded-full border border-[#bfc5cc]/60 border-b-[#5b6168] animate-spin"
        style={{ animationDuration: "1300ms", animationDirection: "reverse" }}
      />
    </div>
  );
}

export default function LiveClient({ sessionId }: { sessionId: string }) {
  const mapDivRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<mapboxgl.Map | null>(null);
  const markerRef = React.useRef<mapboxgl.Marker | null>(null);
  const eventSourceRef = React.useRef<EventSource | null>(null);
  const reconnectTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const bootedRef = React.useRef(false);
  const renderModeRef = React.useRef<RenderMode>("map");

  const [status, setStatus] = React.useState<LiveStatus>("loading");
  const [renderMode, setRenderMode] = React.useState<RenderMode>("map");
  const [sosActive, setSosActive] = React.useState(false);
  const [placeLabel, setPlaceLabel] = React.useState("Preparing live map…");
  const [coordsLabel, setCoordsLabel] = React.useState("");
  const [mapHref, setMapHref] = React.useState("");
  const [loadingNote, setLoadingNote] = React.useState(
    "Connecting to live location…",
  );
  const [lastUpdatedLabel, setLastUpdatedLabel] = React.useState(
    "Waiting for update…",
  );
  const [destinationLabel, setDestinationLabel] = React.useState("Live visit");
  const [browserHint, setBrowserHint] = React.useState("");

  React.useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    let closed = false;
    let hasCenteredOnFirstLivePoint = false;

    const clearReconnect = () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    const closeStream = () => {
      try {
        eventSourceRef.current?.close();
      } catch {}
      eventSourceRef.current = null;
    };

    const ensureMarker = () => {
      if (!mapRef.current) return null;

      if (!markerRef.current) {
        markerRef.current = new mapboxgl.Marker({
          element: buildMarkerEl(),
          anchor: "bottom",
        });
      }

      return markerRef.current;
    };

    const applyPoint = (
      lat: number,
      lng: number,
      place?: string,
      nextStatus: LiveStatus = "live",
      createdAt?: string,
    ) => {
      const nextLngLat: [number, number] = [lng, lat];
      const marker = ensureMarker();

      if (renderModeRef.current === "map" && marker && mapRef.current) {
        if (!marker.getElement().isConnected) {
          marker.setLngLat(nextLngLat).addTo(mapRef.current);
        } else {
          marker.setLngLat(nextLngLat);
        }

        if (!hasCenteredOnFirstLivePoint) {
          mapRef.current.jumpTo({
            center: nextLngLat,
            zoom: 16,
          });
          hasCenteredOnFirstLivePoint = true;
        } else {
          mapRef.current.easeTo({
            center: nextLngLat,
            zoom: Math.max(mapRef.current.getZoom(), 16),
            duration: 1200,
            essential: true,
          });
        }
      }

      const cleanPlace =
        typeof place === "string" && place.trim()
          ? place.trim()
          : "Live location available";

      setPlaceLabel(cleanPlace);
      setCoordsLabel(formatCoords(lat, lng));
      setMapHref(googleMapsHref(lat, lng));
      setLastUpdatedLabel(formatLiveTime(createdAt));
      setStatus(nextStatus);
    };

    const connectStream = () => {
      if (closed) return;

      closeStream();

      const ev = new EventSource(
        `/api/live/stream?sid=${encodeURIComponent(sessionId)}`,
      );
      eventSourceRef.current = ev;

      ev.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);

          if (data.type === "ready") {
            setLoadingNote(
              renderModeRef.current === "map"
                ? "Live connection established…"
                : "Live updates established…",
            );
            return;
          }

          if (data.type === "ka") return;

          if (data.type === "warning") {
            setLoadingNote(
              typeof data.message === "string" && data.message.trim()
                ? data.message.trim()
                : "Refreshing live connection…",
            );
            return;
          }

          if (
            data.type === "location" &&
            typeof data.lat === "number" &&
            typeof data.lng === "number"
          ) {
            applyPoint(data.lat, data.lng, data.place, "live", data.created_at);
            setLoadingNote(
              renderModeRef.current === "map"
                ? "Receiving live movement…"
                : "Receiving live updates…",
            );
            return;
          }

          if (data.type === "sos") {
            setSosActive(Boolean(data.active));
            return;
          }

          if (data.type === "ended") {
            setStatus("ended");
            setLoadingNote("This visit has ended.");
          }
        } catch {}
      };

      ev.onerror = () => {
        closeStream();

        if (closed) return;

        setLoadingNote("Reconnecting to live location…");
        reconnectTimerRef.current = setTimeout(connectStream, 2000);
      };
    };

    async function bootSeedOnly() {
      setLoadingNote("Loading latest live location…");

      const ac = new AbortController();
      const timeout = setTimeout(() => ac.abort(), 8000);

      const seedRes = await fetch(
        `/api/live/seed?sid=${encodeURIComponent(sessionId)}`,
        {
          cache: "no-store",
          signal: ac.signal,
        },
      );

      const seed = (await seedRes.json()) as SeedResp;
      clearTimeout(timeout);

      if (!seed?.ok) {
        throw new Error(seed?.error || "seed_failed");
      }

      if (closed) return;

      setSosActive(Boolean(seed.sos_active));
      setDestinationLabel("Live visit");

      if (seed.ended) {
        setStatus("ended");
        setLoadingNote("This visit has ended.");
      } else {
        setStatus("live");
        setLoadingNote(
          renderModeRef.current === "map"
            ? "Connected to live tracking."
            : "Connected to live updates.",
        );
      }

      if (
        seed.latest &&
        typeof seed.latest.lat === "number" &&
        typeof seed.latest.lng === "number"
      ) {
        applyPoint(
          seed.latest.lat,
          seed.latest.lng,
          seed.latest.place,
          seed.ended ? "ended" : "live",
          seed.latest.created_at,
        );
      } else {
        setPlaceLabel(
          seed.ended ? "Visit ended" : "Waiting for first live update…",
        );
        setCoordsLabel("");
        setMapHref("");
      }

      connectStream();
    }

    async function bootMap() {
      if (!mapDivRef.current) return;

      const publicMapToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!publicMapToken) {
        throw new Error("Missing NEXT_PUBLIC_MAPBOX_TOKEN");
      }

      mapboxgl.accessToken = publicMapToken;
      setLoadingNote("Opening live map…");

      mapRef.current = new mapboxgl.Map({
        container: mapDivRef.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [8.6753, 9.082],
        zoom: 5,
        attributionControl: false,
        dragRotate: false,
        pitchWithRotate: false,
      });

      await new Promise<void>((resolve, reject) => {
        const map = mapRef.current!;
        const timeout = setTimeout(() => {
          reject(new Error("The live map could not be rendered."));
        }, 9000);

        map.once("load", () => {
          clearTimeout(timeout);
          resolve();
        });

        map.on("error", (e) => {
          console.error("[live-map.error]", e);
        });
      });

      await bootSeedOnly();
    }

    async function boot() {
      try {
        if (isInAppBrowser()) {
          renderModeRef.current = "fallback";
          setRenderMode("fallback");
          setBrowserHint(
            "Your email browser is using the lighter live view. Updates still continue in real time below.",
          );
          await bootSeedOnly();
          return;
        }

        renderModeRef.current = "map";
        setRenderMode("map");
        await bootMap();
      } catch (error) {
        console.error("[live-client.boot]", error);

        try {
          renderModeRef.current = "fallback";
          setRenderMode("fallback");
          setBrowserHint(
            "The premium map could not open in this browser. Live updates are still active below.",
          );
          await bootSeedOnly();
        } catch (fallbackError) {
          if (closed) return;
          setStatus("error");
          setLoadingNote(
            fallbackError instanceof Error
              ? fallbackError.message
              : "Unable to open the live view right now.",
          );
        }
      }
    }

    void boot();

    return () => {
      closed = true;
      clearReconnect();
      closeStream();
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [sessionId]);

  const headerTitle = status === "ended" ? "Ended" : sosActive ? "SOS" : "Live";

  return (
    <div className="h-screen w-screen bg-[#f3f4f6] relative overflow-hidden">
      {renderMode === "map" ? (
        <div ref={mapDivRef} className="absolute inset-0" />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(242,243,245,1)_48%,rgba(235,237,240,1))]" />
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/75 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white/95 via-white/70 to-transparent" />

      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
        <div className="rounded-[24px] bg-white/88 border border-black/8 shadow-lg px-4 py-2.5 backdrop-blur-xl min-w-[132px]">
          <div className="flex flex-col items-center justify-center">
            <img
              src="/6logo.png"
              alt="StayKnown"
              className="h-6 w-6 object-contain"
            />
            <div className="mt-1 text-[8px] uppercase tracking-[0.24em] text-black/50 font-black text-center">
              StayKnown
            </div>
          </div>
        </div>
      </div>

      {renderMode === "fallback" && (
        <div className="absolute top-[56px] left-1/2 -translate-x-1/2 z-20">
          <div className="rounded-full bg-white/82 border border-black/8 shadow-md backdrop-blur-xl px-3 py-1.5 flex items-center gap-2">
            <PremiumSpinner />
            <span className="text-[10px] uppercase tracking-[0.20em] text-black/55 font-bold">
              Opening live view
            </span>
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-20 px-3 pb-4">
        <div className="mx-auto w-full max-w-xl rounded-[28px] bg-white/90 border border-black/8 shadow-[0_18px_50px_rgba(0,0,0,0.12)] backdrop-blur-2xl overflow-hidden">
          <div className="px-4 pt-2.5 pb-2">
            <div className="mx-auto h-1.5 w-12 rounded-full bg-black/10" />
          </div>

          <div className="px-4 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.24em] text-black/45 font-bold">
                  Current area
                </div>
                <div className="mt-1.5 text-[20px] leading-[1.12] font-black text-black break-words">
                  {placeLabel}
                </div>
              </div>

              <div className="shrink-0">
                <div
                  className={`rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] font-black ${
                    sosActive
                      ? "bg-black text-white"
                      : status === "ended"
                        ? "bg-black/10 text-black"
                        : "bg-[#dff5ee] text-[#169873]"
                  }`}
                >
                  {sosActive ? "SOS" : headerTitle}
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-[20px] border border-black/6 bg-[#f6f7f8] px-3 py-3">
                <div className="text-[10px] uppercase tracking-[0.20em] text-black/40 font-bold">
                  Last update
                </div>
                <div className="mt-1 text-sm font-bold text-black leading-6">
                  {lastUpdatedLabel}
                </div>
              </div>

              <div className="rounded-[20px] border border-black/6 bg-[#f6f7f8] px-3 py-3">
                <div className="text-[10px] uppercase tracking-[0.20em] text-black/40 font-bold">
                  Session
                </div>
                <div className="mt-1 text-sm font-bold text-black leading-6">
                  {destinationLabel}
                </div>
              </div>
            </div>

            {!!coordsLabel && !!mapHref && (
              <div className="mt-3 rounded-[20px] border border-black/6 bg-[#f6f7f8] px-3 py-3">
                <div className="text-[10px] uppercase tracking-[0.20em] text-black/40 font-bold">
                  Coordinates
                </div>
                <a
                  href={mapHref}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block text-sm font-bold text-black/70 underline underline-offset-4 break-all"
                >
                  {coordsLabel}
                </a>
              </div>
            )}

            {renderMode === "fallback" && (
              <div className="mt-3 rounded-[20px] border border-black/6 bg-[#f6f7f8] px-3 py-3">
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    <PremiumSpinner />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.20em] text-black/40 font-bold">
                      Live view
                    </div>
                    <div className="mt-1 text-sm font-semibold text-black/70 leading-6">
                      {browserHint}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!!mapHref && renderMode === "fallback" && (
              <div className="mt-3">
                <a
                  href={mapHref}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-full bg-black text-white text-center font-black px-5 py-3 shadow-lg"
                >
                  Open location in Google Maps
                </a>
              </div>
            )}

            {status === "error" && (
              <div className="mt-3 rounded-[20px] border border-red-200 bg-red-50 px-3 py-3">
                <div className="text-[10px] uppercase tracking-[0.20em] text-red-500 font-bold">
                  Live status
                </div>
                <div className="mt-1 text-sm font-bold text-red-700">
                  {loadingNote}
                </div>
              </div>
            )}

            {status === "ended" && (
              <div className="mt-3 rounded-[20px] border border-black/6 bg-[#f6f7f8] px-3 py-3 text-sm font-medium text-black/65">
                This visit has ended. The last known live point is shown here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
