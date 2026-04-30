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
  context?: string;
  messageId?: string;
  threadId?: string;
};

type Freshness = "live" | "recent" | "offline";

const INITIAL_VIEW_ZOOM = 14.35;
const MAP_LOAD_TIMEOUT_MS = 15000;

function getTomTomStyleUrl() {
  return (process.env.NEXT_PUBLIC_TOMTOM_STYLE_URL || "").trim();
}

function formatCoords(lat: number, lng: number) {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

function googleMapsHref(lat: number, lng: number) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function safeText(v?: string | null, fallback = "") {
  const s = String(v || "").trim();
  return s || fallback;
}

function formatCapturedTime(v?: string) {
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

function freshnessFrom(v?: string): Freshness {
  if (!v) return "offline";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "offline";

  const diffMs = Date.now() - d.getTime();
  const mins = diffMs / 60000;

  if (mins <= 2) return "live";
  if (mins <= 30) return "recent";
  return "offline";
}

function freshnessLabel(f: Freshness) {
  if (f === "live") return "LIVE";
  if (f === "recent") return "RECENT";
  return "OFFLINE";
}

function freshnessHint(f: Freshness) {
  if (f === "live") {
    return "This chat location was captured very recently.";
  }
  if (f === "recent") {
    return "This is a recent chat location, not a live visit session.";
  }
  return "This is an older shared chat location, shown for context only.";
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

function buildMarkerEl(isFresh: boolean) {
  const wrap = document.createElement("div");
  wrap.style.position = "relative";
  wrap.style.width = "78px";
  wrap.style.height = "78px";
  wrap.style.display = "grid";
  wrap.style.placeItems = "center";

  const ring = document.createElement("div");
  ring.style.position = "absolute";
  ring.style.width = isFresh ? "74px" : "52px";
  ring.style.height = isFresh ? "74px" : "52px";
  ring.style.borderRadius = "999px";
  ring.style.border = isFresh
    ? "1px solid rgba(255,255,255,0.72)"
    : "1px solid rgba(255,255,255,0.44)";
  ring.style.background = isFresh
    ? "rgba(255,255,255,0.10)"
    : "rgba(255,255,255,0.06)";
  ring.style.boxShadow = "0 16px 45px rgba(0,0,0,0.28)";

  const pin = document.createElement("div");
  pin.style.position = "relative";
  pin.style.width = "36px";
  pin.style.height = "36px";
  pin.style.borderRadius = "999px";
  pin.style.background = "rgba(255,255,255,0.96)";
  pin.style.border = "1px solid rgba(0,0,0,0.12)";
  pin.style.display = "grid";
  pin.style.placeItems = "center";
  pin.style.boxShadow = "0 12px 30px rgba(0,0,0,0.25)";

  const img = document.createElement("img");
  img.src = "/6logo.png";
  img.alt = "StayKnown";
  img.style.width = "18px";
  img.style.height = "18px";
  img.style.objectFit = "contain";

  pin.appendChild(img);
  wrap.appendChild(ring);
  wrap.appendChild(pin);

  return wrap;
}

export default function ChatMapClient({ payload }: { payload: ChatMapPayload }) {
  const mapDivRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<maplibregl.Map | null>(null);
  const markerRef = React.useRef<maplibregl.Marker | null>(null);

  const [mapReady, setMapReady] = React.useState(false);
  const [mapError, setMapError] = React.useState("");
  const [fallbackMode, setFallbackMode] = React.useState(false);
  const [darkTheme, setDarkTheme] = React.useState(false);
  const [sheetShrunk, setSheetShrunk] = React.useState(false);

  const freshness = freshnessFrom(payload.capturedAt);
  const isFresh = freshness === "live" || freshness === "recent";
  const sender = safeText(payload.senderName, "StayKnown user");
  const username = safeText(payload.senderUsername);
  const place = safeText(payload.place, "Shared chat location");
  const coords = formatCoords(payload.lat, payload.lng);
  const accuracy =
    typeof payload.accuracy === "number" && Number.isFinite(payload.accuracy)
      ? `± ${payload.accuracy.toFixed(payload.accuracy >= 10 ? 0 : 1)} m`
      : "—";

  React.useEffect(() => {
    setDarkTheme(window.matchMedia?.("(prefers-color-scheme: dark)").matches);
  }, []);

  React.useEffect(() => {
    let closed = false;

    async function boot() {
      try {
        const styleUrl = getTomTomStyleUrl();
        const tomtomKey = (process.env.NEXT_PUBLIC_TOMTOM_API_KEY || "").trim();

        if (!styleUrl || !tomtomKey) {
          throw new Error("StayKnown map is not fully configured.");
        }

        if (!mapDivRef.current) {
          throw new Error("Map container missing.");
        }

        const map = new maplibregl.Map({
          container: mapDivRef.current,
          style: styleUrl,
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
            finish(() => reject(new Error("Map took too long to load.")));
          }, MAP_LOAD_TIMEOUT_MS);

          map.once("load", () => {
            finish(() => {
              clearTimeout(timeout);
              resolve();
            });
          });

          map.once("error", () => {
            finish(() => {
              clearTimeout(timeout);
              reject(new Error("Map could not be rendered."));
            });
          });
        });

        if (closed) return;

        markerRef.current = new maplibregl.Marker({
          element: buildMarkerEl(isFresh),
          anchor: "center",
        })
          .setLngLat([payload.lng, payload.lat])
          .addTo(map);

        map.jumpTo({
          center: [payload.lng, payload.lat],
          zoom: INITIAL_VIEW_ZOOM,
        });

        window.requestAnimationFrame(() => map.resize());
        setTimeout(() => map.resize(), 150);
        setTimeout(() => map.resize(), 500);

        setMapReady(true);
        setMapError("");
      } catch (e) {
        if (closed) return;
        setMapReady(false);
        setFallbackMode(true);
        setMapError(
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
  }, [payload.lat, payload.lng, isFresh]);

  const cardBg = darkTheme ? "bg-black/78" : "bg-white/78";
  const cardBorder = darkTheme ? "border-white/10" : "border-white/70";
  const textMain = darkTheme ? "text-white" : "text-black";
  const textSub = darkTheme ? "text-white/62" : "text-black/58";
  const zoomBottom = sheetShrunk ? "bottom-[112px]" : "bottom-[300px]";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505]">
      <div ref={mapDivRef} className="absolute inset-0" />

      {fallbackMode ? (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1d1d1d,#050505_58%)]" />
      ) : null}

      <div className="absolute left-3 top-3 z-40 rounded-[22px] border border-white/60 bg-white/76 px-3 py-2 shadow-[0_12px_30px_rgba(0,0,0,0.12)] backdrop-blur-2xl">
        <div className="flex items-center gap-2">
          <img src="/6logo.png" alt="StayKnown" className="h-5 w-5 object-contain" />
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-black/58">
              StayKnown Chat Map
            </div>
            <div className="text-[11px] font-extrabold text-black/82">
              Approved contact location
            </div>
          </div>
        </div>
      </div>

      <div
        className={`absolute right-4 z-40 flex flex-col gap-2 transition-opacity ${zoomBottom}`}
      >
        <button
          type="button"
          aria-label="Zoom in"
          disabled={!mapReady}
          onClick={() => mapRef.current?.zoomIn({ duration: 220 })}
          className="h-8 w-8 rounded-[18px] border border-white/55 bg-white/42 text-[17px] font-black text-black/64 shadow-[0_10px_24px_rgba(0,0,0,0.12)] backdrop-blur-xl disabled:opacity-40"
        >
          +
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          disabled={!mapReady}
          onClick={() => mapRef.current?.zoomOut({ duration: 220 })}
          className="h-8 w-8 rounded-[18px] border border-white/45 bg-white/32 text-[17px] font-black text-black/64 shadow-[0_10px_24px_rgba(0,0,0,0.12)] backdrop-blur-xl disabled:opacity-40"
        >
          −
        </button>
      </div>

      <section
        className={`absolute inset-x-0 bottom-0 z-50 rounded-t-[30px] border-t ${cardBorder} ${cardBg} shadow-[0_-18px_50px_rgba(0,0,0,0.24)] backdrop-blur-2xl transition-all duration-200`}
      >
        <button
          type="button"
          onClick={() => setSheetShrunk((v) => !v)}
          className="w-full px-5 pt-3"
          aria-label="Toggle location details"
        >
          <div className="mx-auto h-1.5 w-12 rounded-full bg-black/18" />
        </button>

        <div
          className={`px-4 pb-4 pt-3 transition-all duration-200 ${
            sheetShrunk ? "max-h-[92px] overflow-hidden" : "max-h-[420px]"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[18px] border border-white/60 bg-white/74 shadow-[0_10px_24px_rgba(0,0,0,0.10)]">
              <img src="/6logo.png" alt="StayKnown" className="h-6 w-6 object-contain" />
            </div>

            <div className="min-w-0 flex-1">
              <div className={`text-[10px] font-black uppercase tracking-[0.18em] ${textSub}`}>
                {freshnessLabel(freshness)} • Chat location
              </div>

              <h1 className={`mt-1 truncate text-[18px] font-black tracking-[-0.02em] ${textMain}`}>
                {sender}&apos;s shared location
              </h1>

              {username ? (
                <div className={`mt-0.5 truncate text-[11px] font-bold ${textSub}`}>
                  @{username}
                </div>
              ) : null}
            </div>

            <a
              href={googleMapsHref(payload.lat, payload.lng)}
              target="_blank"
              rel="noreferrer"
              className="rounded-[16px] border border-white/60 bg-white/66 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-black/70"
            >
              Open
            </a>
          </div>

          {!sheetShrunk ? (
            <>
              <div className="mt-4 grid gap-2">
                <div className="rounded-[22px] border border-white/60 bg-white/64 px-3 py-3">
                  <div className="text-[9px] font-black uppercase tracking-[0.16em] text-black/42">
                    Current area
                  </div>
                  <div className="mt-1 text-[13px] font-extrabold leading-5 text-black/80">
                    {place}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-[18px] border border-white/60 bg-white/52 px-3 py-2">
                    <div className="text-[8px] font-black uppercase tracking-[0.14em] text-black/42">
                      Captured
                    </div>
                    <div className="mt-1 text-[11px] font-extrabold text-black/76">
                      {formatCapturedTime(payload.capturedAt)}
                    </div>
                  </div>

                  <div className="rounded-[18px] border border-white/60 bg-white/52 px-3 py-2">
                    <div className="text-[8px] font-black uppercase tracking-[0.14em] text-black/42">
                      Accuracy
                    </div>
                    <div className="mt-1 text-[11px] font-extrabold text-black/76">
                      {accuracy}
                    </div>
                  </div>
                </div>

                <div className="rounded-[18px] border border-white/60 bg-white/46 px-3 py-2 text-[10px] font-bold leading-4 text-black/56">
                  {freshnessHint(freshness)}
                </div>

                <div className="rounded-[18px] border border-white/60 bg-white/46 px-3 py-2 text-[9px] font-bold leading-4 text-black/46">
                  Coordinates: {coords}
                </div>

                {mapError ? (
                  <div className="rounded-[18px] border border-white/60 bg-white/46 px-3 py-2 text-[10px] font-bold leading-4 text-black/56">
                    {mapError}
                  </div>
                ) : null}

                <div className="rounded-[20px] border border-white/60 bg-white/42 px-3 py-2 text-center text-[9px] font-bold leading-4 text-black/52">
                  {safetyUseHint()}
                </div>

                <div className="rounded-[18px] border border-white/60 bg-white/38 px-3 py-1.5 text-center text-[8px] font-semibold text-black/44">
                  {legalTinyLine()}
                </div>
              </div>
            </>
          ) : (
            <div className="mt-3 text-center text-[8px] font-semibold text-black/44">
              {legalTinyLine()}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}