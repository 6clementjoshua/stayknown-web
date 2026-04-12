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

function prefersDarkTheme() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function buildMarkerEl() {
  const wrap = document.createElement("div");
  wrap.style.width = "68px";
  wrap.style.height = "82px";
  wrap.style.display = "flex";
  wrap.style.flexDirection = "column";
  wrap.style.alignItems = "center";
  wrap.style.justifyContent = "center";
  wrap.style.position = "relative";

  const pulse = document.createElement("div");
  pulse.style.position = "absolute";
  pulse.style.top = "8px";
  pulse.style.width = "48px";
  pulse.style.height = "48px";
  pulse.style.borderRadius = "9999px";
  pulse.style.background = "rgba(17,17,17,0.08)";
  pulse.style.boxShadow = "0 0 0 10px rgba(17,17,17,0.05)";

  const pin = document.createElement("div");
  pin.style.width = "48px";
  pin.style.height = "48px";
  pin.style.borderRadius = "9999px";
  pin.style.display = "flex";
  pin.style.alignItems = "center";
  pin.style.justifyContent = "center";
  pin.style.background = "rgba(255,255,255,0.98)";
  pin.style.border = "1px solid rgba(0,0,0,0.08)";
  pin.style.boxShadow =
    "0 14px 28px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.96)";
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

function PremiumSpinner({ dark = false }: { dark?: boolean }) {
  return (
    <div className="relative h-5 w-5">
      <div
        className={`absolute inset-0 rounded-full border ${
          dark
            ? "border-white/25 border-t-white"
            : "border-black/20 border-t-black"
        } animate-spin`}
        style={{ animationDuration: "900ms" }}
      />
      <div
        className={`absolute inset-[2px] rounded-full border ${
          dark
            ? "border-[#bfc5cc]/45 border-b-[#ffffff]"
            : "border-[#c7ccd2]/70 border-b-[#5b6168]"
        } animate-spin`}
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
  const hasCenteredRef = React.useRef(false);
  const startYRef = React.useRef<number | null>(null);

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
  const [sheetExpanded, setSheetExpanded] = React.useState(true);
  const [darkTheme, setDarkTheme] = React.useState(false);

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
    if (bootedRef.current) return;
    bootedRef.current = true;

    let closed = false;

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

        if (!hasCenteredRef.current) {
          mapRef.current.jumpTo({
            center: nextLngLat,
            zoom: 16,
          });
          hasCenteredRef.current = true;
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
            clearReconnect();
            closeStream();
          }
        } catch {}
      };

      ev.onerror = () => {
        closeStream();

        if (closed || status === "ended") return;

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

      if (!seed.ended) connectStream();
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
        style: darkTheme
          ? "mapbox://styles/mapbox/dark-v11"
          : "mapbox://styles/mapbox/light-v11",
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
  }, [darkTheme, sessionId, status]);

  const headerTitle = status === "ended" ? "Ended" : sosActive ? "SOS" : "Live";

  const cardBg = darkTheme ? "bg-black/78" : "bg-white/90";
  const cardBorder = darkTheme ? "border-white/10" : "border-black/8";
  const cardText = darkTheme ? "text-white" : "text-black";
  const mutedText = darkTheme ? "text-white/45" : "text-black/45";
  const innerBg = darkTheme ? "bg-white/5" : "bg-[#f6f7f8]";
  const coordText = darkTheme ? "text-white/80" : "text-black/70";
  const expandedHeight = sheetExpanded ? "max-h-[72vh]" : "max-h-[118px]";

  const showSpinner = status === "loading";
  const showFallbackHint = renderMode === "fallback" && status !== "ended";

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    startYRef.current = e.clientY;
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startYRef.current === null) return;
    const delta = e.clientY - startYRef.current;

    if (delta > 24) {
      setSheetExpanded(false);
    } else if (delta < -24) {
      setSheetExpanded(true);
    }
    startYRef.current = null;
  };

  return (
    <div
      className={`h-screen w-screen relative overflow-hidden ${
        darkTheme ? "bg-[#090909]" : "bg-[#f3f4f6]"
      }`}
      onClick={() => setSheetExpanded(false)}
    >
      {renderMode === "map" ? (
        <div ref={mapDivRef} className="absolute inset-0" />
      ) : (
        <div
          className={`absolute inset-0 ${
            darkTheme
              ? "bg-[radial-gradient(circle_at_top,rgba(32,32,32,1),rgba(15,15,15,1)_48%,rgba(8,8,8,1))]"
              : "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(242,243,245,1)_48%,rgba(235,237,240,1))]"
          }`}
        />
      )}

      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-20 ${
          darkTheme
            ? "bg-gradient-to-b from-black/65 to-transparent"
            : "bg-gradient-to-b from-white/75 to-transparent"
        }`}
      />
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-64 ${
          darkTheme
            ? "bg-gradient-to-t from-black/88 via-black/45 to-transparent"
            : "bg-gradient-to-t from-white/95 via-white/70 to-transparent"
        }`}
      />

      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
        <div
          className={`rounded-[22px] ${cardBg} border ${cardBorder} shadow-lg px-3.5 py-2 backdrop-blur-xl min-w-[116px]`}
        >
          <div className="flex flex-col items-center justify-center">
            <img
              src="/6logo.png"
              alt="StayKnown"
              className="h-5 w-5 object-contain"
            />
            <div
              className={`mt-1 text-[8px] uppercase tracking-[0.24em] font-black text-center ${mutedText}`}
            >
              StayKnown
            </div>
          </div>
        </div>
      </div>

      {showSpinner && (
        <div className="absolute top-[74px] left-1/2 -translate-x-1/2 z-20">
          <div
            className={`rounded-full ${darkTheme ? "bg-black/45 border-white/10" : "bg-white/72 border-black/8"} border shadow-md backdrop-blur-xl px-3 py-2 flex items-center gap-2`}
          >
            <PremiumSpinner dark={darkTheme} />
            <span
              className={`text-[10px] uppercase tracking-[0.18em] font-bold ${darkTheme ? "text-white/70" : "text-black/55"}`}
            >
              Opening live view
            </span>
          </div>
        </div>
      )}

      {showFallbackHint && !showSpinner && (
        <div className="absolute top-[74px] left-1/2 -translate-x-1/2 z-20">
          <div
            className={`rounded-full ${darkTheme ? "bg-black/45 border-white/10" : "bg-white/72 border-black/8"} border shadow-md backdrop-blur-xl px-3 py-2 flex items-center gap-2`}
          >
            <PremiumSpinner dark={darkTheme} />
            <span
              className={`text-[10px] uppercase tracking-[0.18em] font-bold ${darkTheme ? "text-white/70" : "text-black/55"}`}
            >
              Live updates active
            </span>
          </div>
        </div>
      )}

      <div
        className="absolute inset-x-0 bottom-0 z-20 px-3 pb-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`mx-auto w-full max-w-xl rounded-[28px] ${cardBg} border ${cardBorder} shadow-[0_18px_50px_rgba(0,0,0,0.12)] backdrop-blur-2xl overflow-hidden transition-all duration-300 ${expandedHeight}`}
        >
          <div
            className="px-4 pt-2.5 pb-2 cursor-grab active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onDoubleClick={() => setSheetExpanded((v) => !v)}
          >
            <div
              className={`mx-auto h-1.5 w-12 rounded-full ${darkTheme ? "bg-white/12" : "bg-black/10"}`}
            />
          </div>

          <div className="px-4 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div
                  className={`text-[10px] uppercase tracking-[0.24em] font-bold ${mutedText}`}
                >
                  Current area
                </div>
                <div
                  className={`mt-1.5 text-[20px] leading-[1.12] font-black break-words ${cardText}`}
                >
                  {placeLabel}
                </div>
              </div>

              <div className="shrink-0">
                <div
                  className={`rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] font-black ${
                    sosActive
                      ? "bg-black text-white"
                      : status === "ended"
                        ? darkTheme
                          ? "bg-white/12 text-white"
                          : "bg-black/10 text-black"
                        : "bg-[#dff5ee] text-[#169873]"
                  }`}
                >
                  {sosActive ? "SOS" : headerTitle}
                </div>
              </div>
            </div>

            {sheetExpanded && (
              <>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div
                    className={`rounded-[20px] border ${cardBorder} ${innerBg} px-3 py-3`}
                  >
                    <div
                      className={`text-[10px] uppercase tracking-[0.20em] font-bold ${darkTheme ? "text-white/40" : "text-black/40"}`}
                    >
                      Last update
                    </div>
                    <div
                      className={`mt-1 text-sm font-bold leading-6 ${cardText}`}
                    >
                      {lastUpdatedLabel}
                    </div>
                  </div>

                  <div
                    className={`rounded-[20px] border ${cardBorder} ${innerBg} px-3 py-3`}
                  >
                    <div
                      className={`text-[10px] uppercase tracking-[0.20em] font-bold ${darkTheme ? "text-white/40" : "text-black/40"}`}
                    >
                      Session
                    </div>
                    <div
                      className={`mt-1 text-sm font-bold leading-6 ${cardText}`}
                    >
                      {destinationLabel}
                    </div>
                  </div>
                </div>

                {!!coordsLabel && !!mapHref && (
                  <div
                    className={`mt-3 rounded-[20px] border ${cardBorder} ${innerBg} px-3 py-3`}
                  >
                    <div
                      className={`text-[10px] uppercase tracking-[0.20em] font-bold ${darkTheme ? "text-white/40" : "text-black/40"}`}
                    >
                      Coordinates
                    </div>
                    <a
                      href={mapHref}
                      target="_blank"
                      rel="noreferrer"
                      className={`mt-1 block text-sm font-bold underline underline-offset-4 break-all ${coordText}`}
                    >
                      {coordsLabel}
                    </a>
                  </div>
                )}

                {showFallbackHint && (
                  <div
                    className={`mt-3 rounded-[20px] border ${cardBorder} ${innerBg} px-3 py-3`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="pt-0.5">
                        <PremiumSpinner dark={darkTheme} />
                      </div>
                      <div>
                        <div
                          className={`text-[10px] uppercase tracking-[0.20em] font-bold ${darkTheme ? "text-white/40" : "text-black/40"}`}
                        >
                          Live view
                        </div>
                        <div
                          className={`mt-1 text-sm font-semibold leading-6 ${darkTheme ? "text-white/70" : "text-black/70"}`}
                        >
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
                      className={`block rounded-full text-center font-black px-5 py-3 shadow-lg ${
                        darkTheme
                          ? "bg-white text-black"
                          : "bg-black text-white"
                      }`}
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
                  <div
                    className={`mt-3 rounded-[20px] border ${cardBorder} ${innerBg} px-3 py-3 text-sm font-medium ${darkTheme ? "text-white/65" : "text-black/65"}`}
                  >
                    This visit has ended. The last known live point is shown
                    here.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
