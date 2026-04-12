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
  wrap.style.width = "78px";
  wrap.style.height = "92px";
  wrap.style.display = "flex";
  wrap.style.flexDirection = "column";
  wrap.style.alignItems = "center";
  wrap.style.justifyContent = "center";
  wrap.style.position = "relative";

  const pulse = document.createElement("div");
  pulse.style.position = "absolute";
  pulse.style.top = "10px";
  pulse.style.width = "58px";
  pulse.style.height = "58px";
  pulse.style.borderRadius = "9999px";
  pulse.style.background = "rgba(17,17,17,0.10)";
  pulse.style.boxShadow = "0 0 0 10px rgba(17,17,17,0.06)";

  const pin = document.createElement("div");
  pin.style.width = "56px";
  pin.style.height = "56px";
  pin.style.borderRadius = "9999px";
  pin.style.display = "flex";
  pin.style.alignItems = "center";
  pin.style.justifyContent = "center";
  pin.style.background = "rgba(255,255,255,0.98)";
  pin.style.border = "1px solid rgba(0,0,0,0.08)";
  pin.style.boxShadow =
    "0 16px 34px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.96)";
  pin.style.backdropFilter = "blur(8px)";
  (pin.style as any).webkitBackdropFilter = "blur(8px)";
  pin.style.position = "relative";
  pin.style.zIndex = "2";

  const img = document.createElement("img");
  img.src = "/6logo.png";
  img.alt = "StayKnown";
  img.style.width = "28px";
  img.style.height = "28px";
  img.style.objectFit = "contain";

  const label = document.createElement("div");
  label.textContent = "StayKnown";
  label.style.marginTop = "7px";
  label.style.fontSize = "10px";
  label.style.fontWeight = "900";
  label.style.letterSpacing = "0.08em";
  label.style.color = "#111111";
  label.style.textTransform = "uppercase";
  label.style.textShadow = "0 1px 0 rgba(255,255,255,0.65)";
  label.style.position = "relative";
  label.style.zIndex = "2";

  pin.appendChild(img);
  wrap.appendChild(pulse);
  wrap.appendChild(pin);
  wrap.appendChild(label);

  return wrap;
}

export default function LiveClient({ sessionId }: { sessionId: string }) {
  const mapDivRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<mapboxgl.Map | null>(null);
  const markerRef = React.useRef<mapboxgl.Marker | null>(null);
  const eventSourceRef = React.useRef<EventSource | null>(null);
  const reconnectTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

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
    let closed = false;
    let hasCenteredOnFirstLivePoint = false;
    const inApp = isInAppBrowser();

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

      if (renderMode === "map" && marker && mapRef.current) {
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
            duration: 1400,
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
              renderMode === "map"
                ? "Live connection established…"
                : "Live text updates established…",
            );
            return;
          }

          if (data.type === "ka") {
            return;
          }

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
              renderMode === "map"
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
            return;
          }
        } catch {}
      };

      ev.onerror = () => {
        closeStream();

        if (closed) return;

        setLoadingNote("Reconnecting to live location…");
        reconnectTimerRef.current = setTimeout(() => {
          connectStream();
        }, 2000);
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
          renderMode === "map"
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
        }, 10000);

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
        if (inApp) {
          setRenderMode("fallback");
          setBrowserHint(
            "Your email app browser does not fully support the premium live map. Live updates will still continue below.",
          );
          await bootSeedOnly();
          return;
        }

        setRenderMode("map");
        await bootMap();
      } catch (error) {
        console.error("[live-client.boot]", error);

        try {
          setRenderMode("fallback");
          setBrowserHint(
            "The premium live map could not open in this browser. Live updates are still active below.",
          );
          await bootSeedOnly();
        } catch (fallbackError) {
          if (closed) return;
          setStatus("error");
          setLoadingNote(
            fallbackError instanceof Error
              ? fallbackError.message
              : "Unable to open the live map right now.",
          );
        }
      }
    }

    boot();

    return () => {
      closed = true;
      clearReconnect();
      closeStream();
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [renderMode, sessionId]);

  const headerTitle =
    status === "ended" ? "Visit ended" : sosActive ? "SOS active" : "Live";

  return (
    <div className="h-screen w-screen bg-[#f3f4f6] relative overflow-hidden">
      {renderMode === "map" ? (
        <div ref={mapDivRef} className="absolute inset-0" />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(242,243,245,1)_48%,rgba(235,237,240,1))]" />
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-white/95 via-white/70 to-transparent" />

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <div className="rounded-[38px] bg-white/94 border border-black/10 shadow-xl px-6 py-4 backdrop-blur-xl min-w-[260px]">
          <div className="flex flex-col items-center justify-center">
            <img
              src="/6logo.png"
              alt="StayKnown"
              className="h-9 w-9 object-contain"
            />
            <div className="mt-2 text-[11px] uppercase tracking-[0.30em] text-black/50 font-black text-center">
              StayKnown
            </div>
            <div className="mt-2 text-[20px] font-black tracking-tight text-black text-center">
              {headerTitle}
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.28em] text-black/50 text-center">
              {loadingNote}
            </div>
          </div>
        </div>
      </div>

      {renderMode === "fallback" && (
        <div className="absolute inset-x-0 top-[142px] z-10 px-4">
          <div className="mx-auto max-w-xl rounded-[28px] bg-white/86 border border-black/8 shadow-[0_18px_45px_rgba(0,0,0,0.10)] backdrop-blur-xl px-5 py-4">
            <div className="text-[11px] uppercase tracking-[0.24em] text-black/40 font-bold">
              Live view
            </div>
            <div className="mt-2 text-sm font-semibold text-black/75 leading-6">
              {browserHint}
            </div>

            {!!mapHref && (
              <div className="mt-4 flex flex-col gap-3">
                <a
                  href={mapHref}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-black text-white text-center font-black px-5 py-3 shadow-lg"
                >
                  Open location in Google Maps
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-5">
        <div className="mx-auto w-full max-w-xl rounded-[30px] bg-white/92 border border-black/10 shadow-[0_24px_60px_rgba(0,0,0,0.14)] backdrop-blur-2xl overflow-hidden">
          <div className="px-5 pt-3 pb-2">
            <div className="mx-auto h-1.5 w-14 rounded-full bg-black/10" />
          </div>

          <div className="px-5 pb-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-black/45 font-bold">
                  Current area
                </div>
                <div className="mt-2 text-[22px] leading-[1.15] font-black text-black">
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
                        : "bg-emerald-500/12 text-emerald-700"
                  }`}
                >
                  {sosActive
                    ? "SOS active"
                    : status === "ended"
                      ? "Ended"
                      : "Live"}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-[22px] border border-black/8 bg-[#f6f7f8] px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.22em] text-black/40 font-bold">
                  Last update
                </div>
                <div className="mt-1 text-sm font-bold text-black">
                  {lastUpdatedLabel}
                </div>
              </div>

              <div className="rounded-[22px] border border-black/8 bg-[#f6f7f8] px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.22em] text-black/40 font-bold">
                  Session
                </div>
                <div className="mt-1 text-sm font-bold text-black">
                  {destinationLabel}
                </div>
              </div>
            </div>

            {!!coordsLabel && !!mapHref && (
              <div className="mt-4 rounded-[22px] border border-black/8 bg-[#f6f7f8] px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.22em] text-black/40 font-bold">
                  Coordinates
                </div>
                <a
                  href={mapHref}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block text-sm font-bold text-black/75 underline underline-offset-4 break-all"
                >
                  {coordsLabel}
                </a>
              </div>
            )}

            {status === "error" && (
              <div className="mt-4 rounded-[22px] border border-red-200 bg-red-50 px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.22em] text-red-500 font-bold">
                  Live status
                </div>
                <div className="mt-1 text-sm font-bold text-red-700">
                  {loadingNote}
                </div>
              </div>
            )}

            {status === "ended" && (
              <div className="mt-4 rounded-[22px] border border-black/8 bg-[#f6f7f8] px-4 py-3 text-sm font-medium text-black/65">
                This visit has ended. The last known live point is shown here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
