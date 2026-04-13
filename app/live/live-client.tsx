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
  destination_name?: string | null;
  destination_address?: string | null;
  error?: string;
  detail?: string;
};

type LiveStatus = "loading" | "live" | "ended" | "error";
type RenderMode = "map" | "fallback";
type SheetSnap = "expanded" | "collapsed";

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

function isDesktop() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(min-width: 900px)").matches;
}

function buildMarkerEl() {
  const wrap = document.createElement("div");
  wrap.style.width = "60px";
  wrap.style.height = "60px";
  wrap.style.display = "flex";
  wrap.style.alignItems = "center";
  wrap.style.justifyContent = "center";
  wrap.style.position = "relative";

  const pulse = document.createElement("div");
  pulse.style.position = "absolute";
  pulse.style.width = "52px";
  pulse.style.height = "52px";
  pulse.style.borderRadius = "9999px";
  pulse.style.background = "rgba(255,255,255,0.20)";
  pulse.style.boxShadow = "0 0 0 12px rgba(255,255,255,0.08)";
  pulse.style.backdropFilter = "blur(8px)";

  const pin = document.createElement("div");
  pin.style.width = "46px";
  pin.style.height = "46px";
  pin.style.borderRadius = "9999px";
  pin.style.display = "flex";
  pin.style.alignItems = "center";
  pin.style.justifyContent = "center";
  pin.style.background =
    "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(244,246,248,0.94))";
  pin.style.border = "1px solid rgba(255,255,255,0.95)";
  pin.style.boxShadow =
    "0 16px 34px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,1), inset 0 -8px 20px rgba(0,0,0,0.04)";
  pin.style.position = "relative";
  pin.style.zIndex = "2";

  const img = document.createElement("img");
  img.src = "/6logo.png";
  img.alt = "StayKnown";
  img.style.width = "20px";
  img.style.height = "20px";
  img.style.objectFit = "contain";

  pin.appendChild(img);
  wrap.appendChild(pulse);
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

function sessionLabelFromSeed(seed: SeedResp) {
  const destinationName =
    typeof seed.destination_name === "string"
      ? seed.destination_name.trim()
      : "";

  const destinationAddress =
    typeof seed.destination_address === "string"
      ? seed.destination_address.trim()
      : "";

  return destinationName || destinationAddress || "Last session";
}

export default function LiveClient({ sessionId }: { sessionId: string }) {
  const mapDivRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<mapboxgl.Map | null>(null);
  const markerRef = React.useRef<mapboxgl.Marker | null>(null);
  const eventSourceRef = React.useRef<EventSource | null>(null);
  const reconnectTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const pollTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const bootedRef = React.useRef(false);
  const hasCenteredRef = React.useRef(false);
  const startYRef = React.useRef<number | null>(null);

  const [status, setStatus] = React.useState<LiveStatus>("loading");
  const [renderMode, setRenderMode] = React.useState<RenderMode>("map");
  const [sosActive, setSosActive] = React.useState(false);
  const [placeLabel, setPlaceLabel] = React.useState("Preparing last session…");
  const [coordsLabel, setCoordsLabel] = React.useState("");
  const [mapHref, setMapHref] = React.useState("");
  const [lastUpdatedLabel, setLastUpdatedLabel] = React.useState(
    "Waiting for update…",
  );
  const [destinationLabel, setDestinationLabel] =
    React.useState("Last session");
  const [browserHint, setBrowserHint] = React.useState("");
  const [sheetSnap, setSheetSnap] = React.useState<SheetSnap>("collapsed");
  const [darkTheme, setDarkTheme] = React.useState(false);
  const [mapLoadError, setMapLoadError] = React.useState("");

  const stopPolling = React.useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const clearReconnect = React.useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const closeStream = React.useCallback(() => {
    try {
      eventSourceRef.current?.close();
    } catch {}
    eventSourceRef.current = null;
  }, []);

  const applyPoint = React.useCallback(
    (
      lat: number,
      lng: number,
      place?: string,
      nextStatus: LiveStatus = "live",
      createdAt?: string,
    ) => {
      const nextLngLat: [number, number] = [lng, lat];

      if (mapRef.current) {
        if (!markerRef.current) {
          markerRef.current = new mapboxgl.Marker({
            element: buildMarkerEl(),
            anchor: "center",
          });
        }

        if (!markerRef.current.getElement().isConnected) {
          markerRef.current.setLngLat(nextLngLat).addTo(mapRef.current);
        } else {
          markerRef.current.setLngLat(nextLngLat);
        }

        const padding = {
          top: isDesktop() ? 90 : 104,
          right: 16,
          bottom:
            sheetSnap === "expanded"
              ? isDesktop()
                ? 360
                : 330
              : isDesktop()
                ? 170
                : 154,
          left: 16,
        };

        if (!hasCenteredRef.current) {
          mapRef.current.jumpTo({
            center: nextLngLat,
            zoom: 16.2,
          });

          mapRef.current.easeTo({
            center: nextLngLat,
            zoom: 16.2,
            padding,
            duration: 0,
            essential: true,
          });

          hasCenteredRef.current = true;
        } else {
          mapRef.current.easeTo({
            center: nextLngLat,
            zoom: Math.max(mapRef.current.getZoom(), 16.2),
            padding,
            duration: 650,
            essential: true,
          });
        }

        window.requestAnimationFrame(() => {
          mapRef.current?.resize();
        });
      }

      const cleanPlace =
        typeof place === "string" && place.trim()
          ? place.trim()
          : nextStatus === "ended"
            ? "Last known location"
            : "Live location available";

      setPlaceLabel(cleanPlace);
      setCoordsLabel(formatCoords(lat, lng));
      setMapHref(googleMapsHref(lat, lng));
      setLastUpdatedLabel(formatLiveTime(createdAt));
      setStatus(nextStatus);
    },
    [sheetSnap],
  );

  const syncFromSeed = React.useCallback(
    (seed: SeedResp) => {
      setDestinationLabel(sessionLabelFromSeed(seed));
      setSosActive(seed.ended ? false : Boolean(seed.sos_active));
      setStatus(seed.ended ? "ended" : "live");

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
          seed.ended ? "Last known location" : "Waiting for first live update…",
        );
        setCoordsLabel("");
        setMapHref("");
      }

      if (seed.ended) {
        setSosActive(false);
        clearReconnect();
        closeStream();
        stopPolling();
      }
    },
    [applyPoint, clearReconnect, closeStream, stopPolling],
  );

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
    if (!mapRef.current) return;
    mapRef.current.setStyle(
      darkTheme
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/light-v11",
    );
  }, [darkTheme]);

  React.useEffect(() => {
    if (!mapRef.current) return;
    const onResize = () => mapRef.current?.resize();
    window.addEventListener("resize", onResize);
    const t = setTimeout(onResize, 120);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, [sheetSnap]);

  React.useEffect(() => {
    if (!mapRef.current) return;

    const run = () => {
      mapRef.current?.resize();
    };

    const t1 = setTimeout(run, 80);
    const t2 = setTimeout(run, 220);
    const t3 = setTimeout(run, 520);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [renderMode, sheetSnap, status]);

  React.useEffect(() => {
    if (!mapRef.current) return;

    mapRef.current.easeTo({
      padding: {
        top: isDesktop() ? 90 : 104,
        right: 16,
        bottom:
          sheetSnap === "expanded"
            ? isDesktop()
              ? 360
              : 330
            : isDesktop()
              ? 170
              : 154,
        left: 16,
      },
      duration: 220,
      essential: true,
    });

    const t = setTimeout(() => mapRef.current?.resize(), 230);
    return () => clearTimeout(t);
  }, [sheetSnap]);

  React.useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    let closed = false;

    async function fetchSeed() {
      const ac = new AbortController();
      const timeout = setTimeout(() => ac.abort(), 7000);

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

      if (closed) return null;
      return seed;
    }

    const startPolling = () => {
      stopPolling();

      pollTimerRef.current = setInterval(async () => {
        try {
          const seed = await fetchSeed();
          if (!seed || closed) return;
          syncFromSeed(seed);
        } catch {}
      }, 3000);
    };

    const connectStream = () => {
      if (closed) return;

      closeStream();

      const ev = new EventSource(
        `/api/live/stream?sid=${encodeURIComponent(sessionId)}`,
      );
      eventSourceRef.current = ev;

      ev.onmessage = async (msg) => {
        try {
          const data = JSON.parse(msg.data);

          if (data.type === "ready" || data.type === "ka") return;

          if (data.type === "location") {
            if (typeof data.lat === "number" && typeof data.lng === "number") {
              applyPoint(
                data.lat,
                data.lng,
                data.place,
                data.ended ? "ended" : "live",
                data.created_at,
              );
            }
            if (data.ended) {
              setStatus("ended");
              setSosActive(false);
              clearReconnect();
              closeStream();
              stopPolling();
            }
            return;
          }

          if (data.type === "sos") {
            setSosActive(Boolean(data.active));
            return;
          }

          if (data.type === "ended") {
            try {
              const seed = await fetchSeed();
              if (seed && !closed) {
                syncFromSeed(seed);
              }
            } catch {
              setStatus("ended");
              setSosActive(false);
            }
            clearReconnect();
            closeStream();
            stopPolling();
            return;
          }
        } catch {}
      };

      ev.onerror = () => {
        closeStream();
        if (closed) return;
        reconnectTimerRef.current = setTimeout(connectStream, 1200);
      };
    };

    async function bootMapWithSeed(seed: SeedResp) {
      if (!mapDivRef.current) throw new Error("Map container missing");

      const publicMapToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!publicMapToken) {
        throw new Error("Missing NEXT_PUBLIC_MAPBOX_TOKEN");
      }

      mapboxgl.accessToken = publicMapToken;
      setMapLoadError("");

      const map = new mapboxgl.Map({
        container: mapDivRef.current,
        style: darkTheme
          ? "mapbox://styles/mapbox/dark-v11"
          : "mapbox://styles/mapbox/light-v11",
        center:
          seed.latest &&
          typeof seed.latest.lng === "number" &&
          typeof seed.latest.lat === "number"
            ? [seed.latest.lng, seed.latest.lat]
            : [8.6753, 9.082],
        zoom:
          seed.latest &&
          typeof seed.latest.lng === "number" &&
          typeof seed.latest.lat === "number"
            ? 16.2
            : 5,
        attributionControl: false,
        dragRotate: false,
        pitchWithRotate: false,
        trackResize: true,
        fadeDuration: 0,
        preserveDrawingBuffer: false,
      });

      mapRef.current = map;

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          setMapLoadError("The live map could not be rendered.");
          reject(new Error("The live map could not be rendered."));
        }, 8000);

        map.once("load", () => {
          clearTimeout(timeout);

          map.resize();

          window.requestAnimationFrame(() => {
            map.resize();
          });

          setTimeout(() => {
            map.resize();
          }, 150);

          setTimeout(() => {
            map.resize();
          }, 500);

          resolve();
        });

        map.on("error", (e) => {
          console.error("[live-map.error]", e);
        });
      });

      syncFromSeed(seed);

      if (!seed.ended) {
        connectStream();
        startPolling();
      }
    }

    async function bootFallback(seed: SeedResp) {
      syncFromSeed(seed);

      if (!seed.ended) {
        startPolling();
      }
    }

    async function boot() {
      try {
        const seed = await fetchSeed();
        if (!seed) return;

        if (isInAppBrowser()) {
          setRenderMode("fallback");
          setBrowserHint(
            "Open in Chrome or Safari for the full map experience.",
          );
          await bootFallback(seed);
          return;
        }

        setRenderMode("map");
        await bootMapWithSeed(seed);
      } catch (error) {
        console.error("[live-client.boot]", error);

        try {
          const seed = await fetchSeed();
          if (!seed) return;

          setRenderMode("fallback");
          setBrowserHint("Map preview unavailable here.");
          await bootFallback(seed);
        } catch (fallbackError) {
          if (closed) return;
          setStatus("error");
          setMapLoadError(
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
      stopPolling();
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [
    sessionId,
    darkTheme,
    applyPoint,
    syncFromSeed,
    clearReconnect,
    closeStream,
    stopPolling,
  ]);

  const headerTitle = status === "ended" ? "Ended" : sosActive ? "SOS" : "Live";
  const locationHeading = status === "ended" ? "Last session" : "Current area";

  const cardBg = darkTheme ? "bg-black/78" : "bg-white/92";
  const cardBorder = darkTheme ? "border-white/10" : "border-black/10";
  const cardText = darkTheme ? "text-white" : "text-black";
  const mutedText = darkTheme ? "text-white/45" : "text-black/45";
  const innerBg = darkTheme ? "bg-white/5" : "bg-[#f6f7f8]";
  const coordText = darkTheme ? "text-white/80" : "text-black/70";

  const showSpinner = status === "loading";
  const showFallbackHint =
    renderMode === "fallback" && !isDesktop() && status !== "ended";

  const sheetHeightClass =
    sheetSnap === "expanded" ? "h-[72vh] md:h-[62vh]" : "h-[148px]";

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    startYRef.current = e.clientY;
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startYRef.current === null) return;

    const delta = e.clientY - startYRef.current;

    if (delta > 28) {
      setSheetSnap("collapsed");
    } else if (delta < -28) {
      setSheetSnap("expanded");
    } else {
      setSheetSnap((prev) => (prev === "expanded" ? "collapsed" : "expanded"));
    }

    startYRef.current = null;
  };

  return (
    <div
      className={`fixed inset-0 h-screen w-screen overflow-hidden ${
        darkTheme ? "bg-[#090909]" : "bg-[#f3f4f6]"
      }`}
    >
      {renderMode === "map" ? (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div
            ref={mapDivRef}
            className="absolute inset-0 h-full w-full"
            style={{
              background: darkTheme ? "#090909" : "#f3f4f6",
            }}
          />
        </div>
      ) : (
        <div
          className={`absolute inset-0 z-0 ${
            darkTheme
              ? "bg-[radial-gradient(circle_at_top,rgba(32,32,32,1),rgba(15,15,15,1)_48%,rgba(8,8,8,1))]"
              : "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(242,243,245,1)_48%,rgba(235,237,240,1))]"
          }`}
        />
      )}

      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-24 z-10 ${
          darkTheme
            ? "bg-gradient-to-b from-black/55 to-transparent"
            : "bg-gradient-to-b from-white/70 to-transparent"
        }`}
      />

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <div className="rounded-[24px] bg-white/78 border border-white/85 shadow-[0_10px_32px_rgba(0,0,0,0.14)] px-4 py-2.5 backdrop-blur-2xl min-w-[132px]">
          <div className="flex flex-col items-center justify-center">
            <img
              src="/6logo.png"
              alt="StayKnown"
              className="h-5 w-5 object-contain"
            />
            <div className="mt-1 text-[8px] uppercase tracking-[0.24em] font-black text-center text-black/65">
              StayKnown
            </div>
          </div>
        </div>
      </div>

      {showSpinner && (
        <div className="absolute top-[88px] left-1/2 -translate-x-1/2 z-20">
          <PremiumSpinner />
        </div>
      )}

      {mapLoadError && (
        <div className="absolute top-[120px] left-1/2 -translate-x-1/2 z-20">
          <div className="rounded-full bg-red-50 border border-red-200 shadow-md px-3 py-2">
            <span className="text-[10px] tracking-[0.12em] font-bold text-red-600 whitespace-nowrap">
              {mapLoadError}
            </span>
          </div>
        </div>
      )}

      {showFallbackHint && !showSpinner && (
        <div className="absolute top-[88px] left-1/2 -translate-x-1/2 z-20">
          <div className="rounded-full bg-white/70 border border-white/80 shadow-md px-3 py-1.5">
            <span className="text-[9px] font-bold text-black/60 whitespace-nowrap">
              Open in Chrome or Safari
            </span>
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-20 px-3 pb-4">
        <div
          className={`mx-auto w-full max-w-[760px] rounded-[30px] ${cardBg} border ${cardBorder} shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-2xl overflow-hidden transition-[height] duration-300 ${sheetHeightClass}`}
        >
          <div
            className="px-4 pt-2.5 pb-2 cursor-grab active:cursor-grabbing select-none touch-none"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          >
            <div
              className={`mx-auto h-1.5 w-12 rounded-full ${darkTheme ? "bg-white/14" : "bg-black/12"}`}
            />
          </div>

          <div className="h-full overflow-y-auto px-4 pb-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div
                  className={`text-[10px] uppercase tracking-[0.24em] font-bold ${mutedText}`}
                >
                  {locationHeading}
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

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                className={`rounded-[20px] border ${cardBorder} ${innerBg} px-3 py-3`}
              >
                <div
                  className={`text-[10px] uppercase tracking-[0.20em] font-bold ${darkTheme ? "text-white/40" : "text-black/40"}`}
                >
                  Last update
                </div>
                <div className={`mt-1 text-sm font-bold leading-6 ${cardText}`}>
                  {lastUpdatedLabel}
                </div>
              </div>

              <div
                className={`rounded-[20px] border ${cardBorder} ${innerBg} px-3 py-3`}
              >
                <div
                  className={`text-[10px] uppercase tracking-[0.20em] font-bold ${darkTheme ? "text-white/40" : "text-black/40"}`}
                >
                  Last session
                </div>
                <div className={`mt-1 text-sm font-bold leading-6 ${cardText}`}>
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
                <div
                  className={`text-sm font-semibold leading-6 ${darkTheme ? "text-white/70" : "text-black/70"}`}
                >
                  {browserHint}
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
                    darkTheme ? "bg-white text-black" : "bg-black text-white"
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
                  {mapLoadError || "Unable to open the live view right now."}
                </div>
              </div>
            )}

            {status === "ended" && (
              <div
                className={`mt-3 rounded-[20px] border ${cardBorder} ${innerBg} px-3 py-3 text-sm font-medium ${darkTheme ? "text-white/65" : "text-black/65"}`}
              >
                This visit has ended. This page now shows the last known
                location from that session.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
