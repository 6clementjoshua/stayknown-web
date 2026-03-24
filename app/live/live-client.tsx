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

function formatCoords(lat: number, lng: number) {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

function googleMapsHref(lat?: number, lng?: number) {
  if (typeof lat !== "number" || typeof lng !== "number") return "";
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function buildMarkerEl() {
  const el = document.createElement("div");
  el.style.width = "44px";
  el.style.height = "44px";
  el.style.borderRadius = "9999px";
  el.style.display = "flex";
  el.style.alignItems = "center";
  el.style.justifyContent = "center";
  el.style.background = "rgba(12,12,12,0.88)";
  el.style.border = "1px solid rgba(255,255,255,0.24)";
  el.style.boxShadow =
    "0 14px 38px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.18)";
  el.style.backdropFilter = "blur(10px)";
  (el.style as any).webkitBackdropFilter = "blur(10px)";
  el.style.color = "#ffffff";
  el.style.fontWeight = "900";
  el.style.fontSize = "18px";
  el.style.letterSpacing = "0.02em";
  el.textContent = "6";
  return el;
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
  const [sosActive, setSosActive] = React.useState(false);
  const [placeLabel, setPlaceLabel] = React.useState("Preparing live map…");
  const [coordsLabel, setCoordsLabel] = React.useState("");
  const [mapHref, setMapHref] = React.useState("");
  const [loadingNote, setLoadingNote] = React.useState(
    "Connecting to live location…",
  );

  React.useEffect(() => {
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
          anchor: "center",
        });
      }

      return markerRef.current;
    };

    const applyPoint = (
      lat: number,
      lng: number,
      place?: string,
      nextStatus: LiveStatus = "live",
    ) => {
      const nextLngLat: [number, number] = [lng, lat];
      const marker = ensureMarker();

      if (marker && mapRef.current) {
        if (!marker.getElement().isConnected) {
          marker.setLngLat(nextLngLat).addTo(mapRef.current);
        } else {
          marker.setLngLat(nextLngLat);
        }
      }

      if (!hasCenteredOnFirstLivePoint) {
        mapRef.current?.jumpTo({
          center: nextLngLat,
          zoom: 15,
        });
        hasCenteredOnFirstLivePoint = true;
      } else {
        mapRef.current?.easeTo({
          center: nextLngLat,
          duration: 1200,
          essential: true,
        });
      }

      const cleanPlace =
        typeof place === "string" && place.trim()
          ? place.trim()
          : "Live location available";

      setPlaceLabel(cleanPlace);
      setCoordsLabel(formatCoords(lat, lng));
      setMapHref(googleMapsHref(lat, lng));
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
            setLoadingNote("Live connection established…");
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
            applyPoint(data.lat, data.lng, data.place, "live");
            setLoadingNote("Receiving live movement…");
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

    async function boot() {
      try {
        if (!mapDivRef.current) return;

        const publicMapToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!publicMapToken) {
          throw new Error("Missing NEXT_PUBLIC_MAPBOX_TOKEN");
        }

        mapboxgl.accessToken = publicMapToken;

        setLoadingNote("Opening live map…");

        mapRef.current = new mapboxgl.Map({
          container: mapDivRef.current,
          style: "mapbox://styles/mapbox/dark-v11",
          center: [8.6753, 9.082],
          zoom: 5,
          attributionControl: false,
        });

        await new Promise<void>((resolve, reject) => {
          const map = mapRef.current!;
          map.on("load", () => resolve());
          map.on("error", () =>
            reject(new Error("The live map could not be rendered.")),
          );
        });

        if (closed) return;

        setLoadingNote("Loading latest live location…");

        const ac = new AbortController();
        const timeout = setTimeout(() => ac.abort(), 8000);

        const seed = await fetch(
          `/api/live/seed?sid=${encodeURIComponent(sessionId)}`,
          {
            cache: "no-store",
            signal: ac.signal,
          },
        ).then((r) => r.json() as Promise<SeedResp>);

        clearTimeout(timeout);

        if (!seed?.ok) {
          throw new Error(seed?.error || "seed_failed");
        }

        if (closed) return;

        setSosActive(Boolean(seed.sos_active));

        if (seed.ended) {
          setStatus("ended");
          setLoadingNote("This visit has ended.");
        } else {
          setStatus("live");
          setLoadingNote("Connected to live tracking.");
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
          );
        } else {
          setPlaceLabel(
            seed.ended ? "Visit ended" : "Waiting for first live update…",
          );
          setCoordsLabel("");
          setMapHref("");
        }

        connectStream();
      } catch (error) {
        if (closed) return;
        setStatus("error");
        setLoadingNote(
          error instanceof Error
            ? error.message
            : "Unable to open the live map right now.",
        );
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
  }, [sessionId]);

  const headerText =
    status === "ended"
      ? "Visit ended"
      : sosActive
        ? "SOS Active"
        : "StayKnown™ Live Tracking";

  return (
    <div className="h-screen w-screen bg-black relative overflow-hidden">
      <div ref={mapDivRef} className="absolute inset-0" />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/75 to-transparent" />

      <div className="absolute top-5 left-1/2 -translate-x-1/2 px-5 py-3 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 text-white font-semibold tracking-wide shadow-2xl">
        {headerText}
      </div>

      <div className="absolute top-20 left-1/2 -translate-x-1/2">
        <div className="rounded-full backdrop-blur-xl bg-black/35 border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-white/75 shadow-xl">
          {loadingNote}
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[min(92vw,580px)]">
        <div className="rounded-[28px] backdrop-blur-xl bg-white/10 border border-white/15 shadow-2xl px-4 py-4 text-white">
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/55 text-center">
            Current area
          </div>

          <div className="mt-2 text-center text-sm sm:text-base font-semibold leading-snug">
            {placeLabel}
          </div>

          {!!coordsLabel && !!mapHref && (
            <div className="mt-2 text-center text-xs break-all">
              <a
                href={mapHref}
                target="_blank"
                rel="noreferrer"
                className="text-white/65 underline underline-offset-4"
              >
                {coordsLabel}
              </a>
            </div>
          )}

          {!coordsLabel && status === "live" && (
            <div className="mt-2 text-center text-xs text-white/50">
              Live coordinates will appear as soon as the first update arrives.
            </div>
          )}

          {status === "ended" && (
            <div className="mt-3 text-center text-xs text-white/60">
              This visit has already ended. The last visible point is shown
              here.
            </div>
          )}

          {sosActive && (
            <div className="mt-3 text-center text-[11px] font-bold uppercase tracking-[0.22em] text-white">
              SOS is active
            </div>
          )}
        </div>
      </div>

      {status === "loading" && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/10 border border-white/15 text-white/85 text-sm">
          Opening live location…
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center text-white px-6">
          <div className="text-center max-w-sm">
            <div className="text-lg font-bold">Unable to load tracking</div>
            <div className="opacity-70 mt-2 text-sm">{loadingNote}</div>
          </div>
        </div>
      )}
    </div>
  );
}
