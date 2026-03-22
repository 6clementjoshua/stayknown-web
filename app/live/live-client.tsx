"use client";

import React from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

type SeedResp = {
  ok: boolean;
  session_id: string;
  latest?: {
    lat: number;
    lng: number;
    accuracy?: number;
    place?: string;
    created_at?: string;
  };
  sos_active?: boolean;
  ended?: boolean;
};

export default function LiveClient({ sessionId }: { sessionId: string }) {
  const mapDivRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<mapboxgl.Map | null>(null);
  const markerRef = React.useRef<mapboxgl.Marker | null>(null);

  const [status, setStatus] = React.useState<
    "loading" | "live" | "ended" | "error"
  >("loading");
  const [sosActive, setSosActive] = React.useState(false);
  const [placeLabel, setPlaceLabel] = React.useState("Resolving location…");
  const [coordsLabel, setCoordsLabel] = React.useState("");

  React.useEffect(() => {
    let closed = false;
    let ev: EventSource | null = null;
    let hasCenteredOnFirstLivePoint = false;

    async function boot() {
      try {
        if (!mapDivRef.current) return;

        mapRef.current = new mapboxgl.Map({
          container: mapDivRef.current,
          style: "mapbox://styles/mapbox/dark-v11",
          center: [8.6753, 9.082],
          zoom: 5,
          attributionControl: false,
        });

        markerRef.current = new mapboxgl.Marker({ color: "#ffffff" });

        const seed = await fetch(
          `/api/live/seed?sid=${encodeURIComponent(sessionId)}`,
          { cache: "no-store" },
        ).then((r) => r.json() as Promise<SeedResp>);

        if (!seed?.ok) throw new Error("seed_failed");
        if (closed) return;

        setSosActive(Boolean(seed.sos_active));
        setStatus(seed.ended ? "ended" : "live");

        if (seed.latest) {
          const seedPlace =
            typeof seed.latest.place === "string"
              ? seed.latest.place.trim()
              : "";
          setPlaceLabel(seedPlace || "Location available");
          setCoordsLabel(`${seed.latest.lat}, ${seed.latest.lng}`);
        }

        if (
          seed.latest &&
          typeof seed.latest.lat === "number" &&
          typeof seed.latest.lng === "number"
        ) {
          const initialLngLat: [number, number] = [
            seed.latest.lng,
            seed.latest.lat,
          ];

          markerRef.current?.setLngLat(initialLngLat).addTo(mapRef.current);

          mapRef.current.jumpTo({
            center: initialLngLat,
            zoom: 15,
          });

          hasCenteredOnFirstLivePoint = true;
        }

        ev = new EventSource(
          `/api/live/stream?sid=${encodeURIComponent(sessionId)}`,
        );

        ev.onmessage = (msg) => {
          try {
            const data = JSON.parse(msg.data);

            if (
              data.type === "location" &&
              typeof data.lat === "number" &&
              typeof data.lng === "number"
            ) {
              const nextLngLat: [number, number] = [data.lng, data.lat];

              if (markerRef.current) {
                if (!markerRef.current.getElement().isConnected) {
                  markerRef.current
                    .setLngLat(nextLngLat)
                    .addTo(mapRef.current!);
                } else {
                  markerRef.current.setLngLat(nextLngLat);
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

              const livePlace =
                typeof data.place === "string" ? data.place.trim() : "";
              setPlaceLabel(livePlace || "Location available");
              setCoordsLabel(`${data.lat}, ${data.lng}`);
              setStatus("live");
            }

            if (data.type === "sos") {
              setSosActive(Boolean(data.active));
            }

            if (data.type === "ended") {
              setStatus("ended");
            }
          } catch {
            // ignore malformed events
          }
        };

        ev.onerror = () => {
          ev?.close();
        };
      } catch {
        if (!closed) setStatus("error");
      }
    }

    boot();

    return () => {
      closed = true;
      ev?.close();
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
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

      <div className="absolute top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 text-white font-semibold tracking-wide shadow-2xl">
        {headerText}
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[min(92vw,560px)]">
        <div className="rounded-[28px] backdrop-blur-xl bg-white/10 border border-white/15 shadow-2xl px-4 py-4 text-white">
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/55 text-center">
            Current area
          </div>
          <div className="mt-2 text-center text-sm sm:text-base font-semibold leading-snug">
            {placeLabel}
          </div>
          {!!coordsLabel && (
            <div className="mt-2 text-center text-xs text-white/55 break-all">
              {coordsLabel}
            </div>
          )}
        </div>
      </div>

      {status === "loading" && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/10 border border-white/15 text-white/80 text-sm">
          Connecting to live location…
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center">
            <div className="text-lg font-bold">Unable to load tracking</div>
            <div className="opacity-60 mt-2 text-sm">
              Please check the link or try again.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
