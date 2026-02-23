// app/live/LiveClient.tsx
"use client";

import React from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { createClient } from "@supabase/supabase-js";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LiveClient({ sessionId }: { sessionId: string }) {
    const mapRef = React.useRef<HTMLDivElement | null>(null);

    // ✅ Fix: pass initial value (null)
    const markerRef = React.useRef<mapboxgl.Marker | null>(null);
    const mapInstance = React.useRef<mapboxgl.Map | null>(null);

    React.useEffect(() => {
        if (!mapRef.current) return;

        const map = new mapboxgl.Map({
            container: mapRef.current,
            style: "mapbox://styles/mapbox/dark-v11",
            center: [0, 0],
            zoom: 14,
        });

        mapInstance.current = map;

        const marker = new mapboxgl.Marker({ color: "#ffffff" })
            .setLngLat([0, 0])
            .addTo(map);

        markerRef.current = marker;

        // Optional: nicer controls
        map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "bottom-right");

        const channel = supabase
            .channel("live-track-" + sessionId)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "visit_locations",
                    filter: `session_id=eq.${sessionId}`,
                },
                (payload) => {
                    const { lat, lng } = payload.new as any;

                    if (typeof lat === "number" && typeof lng === "number") {
                        markerRef.current?.setLngLat([lng, lat]);

                        mapInstance.current?.flyTo({
                            center: [lng, lat],
                            speed: 1.15,
                            curve: 1.6,
                            essential: true,
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            markerRef.current = null;
            mapInstance.current?.remove();
            mapInstance.current = null;
        };
    }, [sessionId]);

    return (
        <div className="h-screen w-screen bg-black relative overflow-hidden">
            <div ref={mapRef} className="absolute inset-0" />

            {/* Premium Glass Header */}
            <div className="pointer-events-none absolute top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full backdrop-blur-xl bg-white/10 border border-white/20 text-white font-semibold tracking-wide shadow-2xl">
                StayKnown™ Live Tracking
            </div>
        </div>
    );
}