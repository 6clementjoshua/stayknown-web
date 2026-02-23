"use client";

import React from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

type SeedResp = {
    ok: boolean;
    session_id: string;
    latest?: { lat: number; lng: number; accuracy?: number; created_at?: string };
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

    React.useEffect(() => {
        let closed = false;

        async function boot() {
            try {
                // 1) seed (server fetch with service role)
                const seed = await fetch(`/api/live/seed?sid=${encodeURIComponent(sessionId)}`, {
                    cache: "no-store",
                }).then((r) => r.json() as Promise<SeedResp>);

                if (!seed?.ok) throw new Error("seed_failed");

                if (closed) return;

                setSosActive(Boolean(seed.sos_active));
                setStatus(seed.ended ? "ended" : "live");

                // 2) init map
                if (!mapDivRef.current) return;

                const startLngLat: [number, number] = seed.latest
                    ? [seed.latest.lng, seed.latest.lat]
                    : [0, 0];

                mapRef.current = new mapboxgl.Map({
                    container: mapDivRef.current,
                    style: "mapbox://styles/mapbox/dark-v11",
                    center: startLngLat,
                    zoom: seed.latest ? 14 : 2,
                });

                markerRef.current = new mapboxgl.Marker({ color: "#ffffff" })
                    .setLngLat(startLngLat)
                    .addTo(mapRef.current);

                // 3) subscribe via SSE (server relays realtime; client does NOT touch tables)
                const ev = new EventSource(`/api/live/stream?sid=${encodeURIComponent(sessionId)}`);

                ev.onmessage = (msg) => {
                    try {
                        const data = JSON.parse(msg.data);

                        if (data.type === "location" && typeof data.lat === "number" && typeof data.lng === "number") {
                            markerRef.current?.setLngLat([data.lng, data.lat]);
                            mapRef.current?.flyTo({ center: [data.lng, data.lat], speed: 1.2 });
                        }

                        if (data.type === "sos") {
                            setSosActive(Boolean(data.active));
                        }

                        if (data.type === "ended") {
                            setStatus("ended");
                        }
                    } catch {
                        // ignore
                    }
                };

                ev.onerror = () => {
                    // keep UI but stop streaming
                    ev.close();
                };

                return () => ev.close();
            } catch {
                if (!closed) setStatus("error");
            }
        }

        boot();

        return () => {
            closed = true;
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

            {/* Premium Glass Header */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 text-white font-semibold tracking-wide shadow-2xl">
                {headerText}
            </div>

            {status === "loading" && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm">
                    Loading map…
                </div>
            )}

            {status === "error" && (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                        <div className="text-lg font-bold">Unable to load tracking</div>
                        <div className="opacity-60 mt-2 text-sm">Please check the link or try again.</div>
                    </div>
                </div>
            )}
        </div>
    );
}