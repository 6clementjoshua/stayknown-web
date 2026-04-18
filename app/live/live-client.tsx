"use client";

import React from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

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
  started_at?: string | null;
  destination_name?: string | null;
  destination_address?: string | null;
  purpose?: string | null;
  person_to_meet?: string | null;
  expected_duration_minutes?: number | null;
  extra_note?: string | null;
  visitor_name?: string | null;
  error?: string;
  detail?: string;
};

type LiveStatus = "loading" | "live" | "ended" | "error";
type RenderMode = "map" | "fallback";

const INITIAL_VIEW_ZOOM = 14.1;
const FALLBACK_CENTER: [number, number] = [8.3349, 4.5736];
const FALLBACK_ZOOM = 12.8;
const MOVE_FOLLOW_THRESHOLD_METERS = 28;

function distanceMeters(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000;

  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);

  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);

  const aa = s1 * s1 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * s2 * s2;

  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return R * c;
}

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

function formatLiveDate(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatStartedTime(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDurationMins(v?: number | null) {
  if (typeof v !== "number" || !Number.isFinite(v) || v <= 0) return "—";
  if (v < 60) return `${v} mins`;

  const hrs = Math.floor(v / 60);
  const mins = v % 60;

  if (!mins) return `${hrs} hr${hrs > 1 ? "s" : ""}`;
  return `${hrs} hr${hrs > 1 ? "s" : ""} ${mins} mins`;
}

function cleanLabel(v?: string | null, fallback = "—") {
  const s = typeof v === "string" ? v.trim() : "";
  return s || fallback;
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

function sessionMetaRows(seedStatus: LiveStatus, sosActive: boolean) {
  const isEnded = seedStatus === "ended";

  return {
    statusText: sosActive ? "SOS" : isEnded ? "Ended" : "Live",
    statusClass: sosActive
      ? "bg-[#dff5ee] text-[#0e8f70] border-[#ccebdd]"
      : isEnded
        ? "bg-white/86 text-black/56 border-white/70"
        : "bg-[#dff5ee] text-[#0e8f70] border-[#ccebdd]",
  };
}

function buildMarkerEl(isLive = true) {
  const wrap = document.createElement("div");
  wrap.style.width = "88px";
  wrap.style.height = "88px";
  wrap.style.display = "flex";
  wrap.style.alignItems = "center";
  wrap.style.justifyContent = "center";
  wrap.style.position = "relative";

  const makeRing = (
    delayMs: number,
    size: number,
    borderColor: string,
    shadowColor: string,
  ) => {
    const ring = document.createElement("div");
    ring.style.position = "absolute";
    ring.style.width = `${size}px`;
    ring.style.height = `${size}px`;
    ring.style.borderRadius = "9999px";
    ring.style.border = `1.2px solid ${borderColor}`;
    ring.style.boxShadow = `0 0 16px ${shadowColor}`;
    ring.style.opacity = "0";
    ring.style.transform = "scale(0.72)";
    ring.setAttribute("data-sk-radar", "1");
    ring.style.animation = isLive
      ? `skLiveRadarStrong 2.9s ease-out ${delayMs}ms infinite`
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

  if (isLive) {
    wrap.appendChild(
      makeRing(0, 50, "rgba(138,138,138,0.70)", "rgba(120,120,120,0.08)"),
    );
    wrap.appendChild(
      makeRing(760, 62, "rgba(192,192,192,0.56)", "rgba(196,196,196,0.06)"),
    );
    wrap.appendChild(
      makeRing(1520, 76, "rgba(224,224,224,0.38)", "rgba(225,225,225,0.04)"),
    );
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

function safetyUseHint() {
  return (
    "Use this live session only for legitimate safety and care purposes involving people you know or are directly responsible for protecting. " +
    "Do not use StayKnown to stalk, harass, secretly monitor, or track anyone without consent or lawful safety reason. " +
    "Misuse may lead to safety review, access restriction, account action, and reporting where required."
  );
}

function legalTinyLine() {
  const year = new Date().getFullYear();
  return `A 6Clement Joshua Service™  •  © ${year}`;
}

type NearbyCategoryId =
  | "hospital"
  | "police"
  | "school"
  | "pharmacy"
  | "atm"
  | "fuel";

type NearbyCategory = {
  id: NearbyCategoryId;
  query: string;
  label: string;
};

type NearbyPoi = {
  id: string;
  name: string;
  category: NearbyCategoryId;
  lat: number;
  lng: number;
  distanceMeters?: number;
};

const POI_RADIUS_METERS = 700;
const POI_LIMIT_PER_CATEGORY = 2;
const POI_MIN_ZOOM_TO_SHOW = 15.8;
const POI_REFRESH_MOVE_THRESHOLD_METERS = 320;
const POI_REFRESH_MIN_MS = 120000;

const NEARBY_CATEGORIES: NearbyCategory[] = [
  { id: "hospital", query: "hospital", label: "Hospital" },
  { id: "police", query: "police station", label: "Police" },
  { id: "school", query: "school", label: "School" },
  { id: "pharmacy", query: "pharmacy", label: "Pharmacy" },
  { id: "atm", query: "atm", label: "ATM" },
  { id: "fuel", query: "gas station", label: "Fuel" },
];

function buildPoiLabelEl(name: string, darkTheme: boolean) {
  const wrap = document.createElement("div");
  wrap.style.display = "inline-flex";
  wrap.style.alignItems = "center";
  wrap.style.justifyContent = "center";
  wrap.style.padding = "3px 7px";
  wrap.style.borderRadius = "999px";
  wrap.style.background = darkTheme
    ? "rgba(10,10,10,0.88)"
    : "rgba(255,255,255,0.88)";
  wrap.style.border = darkTheme
    ? "1px solid rgba(255,255,255,0.10)"
    : "1px solid rgba(0,0,0,0.07)";
  wrap.style.boxShadow = "0 8px 18px rgba(0,0,0,0.10)";
  wrap.style.backdropFilter = "blur(10px)";
  wrap.style.whiteSpace = "nowrap";
  wrap.style.pointerEvents = "none";

  const text = document.createElement("div");
  text.textContent = name;
  text.style.fontSize = "10px";
  text.style.fontWeight = "800";
  text.style.lineHeight = "1";
  text.style.letterSpacing = "0";
  text.style.color = darkTheme ? "#f5f5f5" : "#171717";

  wrap.appendChild(text);
  return wrap;
}

async function fetchNearbyPois(
  lat: number,
  lng: number,
  apiKey: string,
  signal?: AbortSignal,
) {
  const requests = NEARBY_CATEGORIES.map(async (category) => {
    const url =
      `https://api.tomtom.com/search/2/categorySearch/${encodeURIComponent(category.query)}.json` +
      `?key=${encodeURIComponent(apiKey)}` +
      `&lat=${encodeURIComponent(String(lat))}` +
      `&lon=${encodeURIComponent(String(lng))}` +
      `&radius=${encodeURIComponent(String(POI_RADIUS_METERS))}` +
      `&limit=${encodeURIComponent(String(POI_LIMIT_PER_CATEGORY))}` +
      `&language=en-GB` +
      `&view=Unified`;

    const res = await fetch(url, { signal });
    if (!res.ok) return [] as NearbyPoi[];

    const json = await res.json().catch(() => ({}));
    const rows = Array.isArray(json?.results) ? json.results : [];

    return rows
      .map((row: any) => {
        const p = row?.position ?? {};
        const latNum = Number(p.lat);
        const lngNum = Number(p.lon);
        if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) return null;

        const name =
          String(
            row?.poi?.name || row?.address?.freeformAddress || "",
          ).trim() || category.label;

        return {
          id: String(row?.id || `${category.id}:${name}:${latNum}:${lngNum}`),
          name,
          category: category.id,
          lat: latNum,
          lng: lngNum,
          distanceMeters: distanceMeters(lat, lng, latNum, lngNum),
        } satisfies NearbyPoi;
      })
      .filter(Boolean) as NearbyPoi[];
  });

  const settled = await Promise.all(requests);
  const merged = settled.flat();

  const seen = new Set<String>();
  const deduped: NearbyPoi[] = [];

  for (const poi of merged) {
    const key = `${poi.name.toLowerCase()}|${poi.lat.toFixed(5)}|${poi.lng.toFixed(5)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(poi);
  }

  return deduped
    .sort((a, b) => (a.distanceMeters ?? 999999) - (b.distanceMeters ?? 999999))
    .slice(0, 10);
}

function getTomTomStyleUrl() {
  return (process.env.NEXT_PUBLIC_TOMTOM_STYLE_URL || "").trim();
}

export default function LiveClient({ sessionId }: { sessionId: string }) {
  const mapDivRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<maplibregl.Map | null>(null);
  const markerRef = React.useRef<maplibregl.Marker | null>(null);
  const poiMarkersRef = React.useRef<maplibregl.Marker[]>([]);
  const poiFetchAbortRef = React.useRef<AbortController | null>(null);
  const lastPoiCenterRef = React.useRef<{ lat: number; lng: number } | null>(
    null,
  );
  const lastPoiFetchAtRef = React.useRef<number>(0);

  const eventSourceRef = React.useRef<EventSource | null>(null);
  const reconnectTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const pollTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const bootedRef = React.useRef(false);
  const hasCenteredRef = React.useRef(false);
  const lastPointRef = React.useRef<{ lat: number; lng: number } | null>(null);

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
  const [darkTheme, setDarkTheme] = React.useState(false);
  const [mapLoadError, setMapLoadError] = React.useState("");
  const [mapReady, setMapReady] = React.useState(false);

  const [mobileSheetShrunk, setMobileSheetShrunk] = React.useState(false);
  const [accuracyLabel, setAccuracyLabel] = React.useState("—");

  const [accessGateOpen, setAccessGateOpen] = React.useState(true);
  const [accessAccepted, setAccessAccepted] = React.useState(false);

  const [visitorName, setVisitorName] = React.useState("User");
  const [startedDateLabel, setStartedDateLabel] = React.useState("—");
  const [startedTimeLabel, setStartedTimeLabel] = React.useState("—");
  const [destinationAddressLabel, setDestinationAddressLabel] =
    React.useState("—");
  const [purposeLabel, setPurposeLabel] = React.useState("—");
  const [personToMeetLabel, setPersonToMeetLabel] = React.useState("—");
  const [expectedDurationLabel, setExpectedDurationLabel] = React.useState("—");
  const [extraNoteLabel, setExtraNoteLabel] = React.useState("—");

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

  function isPhoneViewport() {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 767px)").matches;
  }

  const clearPoiMarkers = React.useCallback(() => {
    poiMarkersRef.current.forEach((marker) => marker.remove());
    poiMarkersRef.current = [];
  }, []);

  const syncPoiMarkerVisibility = React.useCallback(() => {
    if (!mapRef.current) return;
    const visible = mapRef.current.getZoom() >= POI_MIN_ZOOM_TO_SHOW;

    poiMarkersRef.current.forEach((marker) => {
      marker.getElement().style.display = visible ? "flex" : "none";
    });
  }, []);

  const refreshNearbyPois = React.useCallback(
    async (lat: number, lng: number) => {
      if (!mapRef.current) return;
      if (mapRef.current.getZoom() < POI_MIN_ZOOM_TO_SHOW) {
        clearPoiMarkers();
        return;
      }

      const apiKey = (process.env.NEXT_PUBLIC_TOMTOM_API_KEY || "").trim();
      if (!apiKey) return;

      const lastCenter = lastPoiCenterRef.current;
      const now = Date.now();

      const movedEnough = lastCenter
        ? distanceMeters(lastCenter.lat, lastCenter.lng, lat, lng) >=
          POI_REFRESH_MOVE_THRESHOLD_METERS
        : true;

      const longEnough = now - lastPoiFetchAtRef.current >= POI_REFRESH_MIN_MS;

      if (!movedEnough && !longEnough) return;

      lastPoiCenterRef.current = { lat, lng };
      lastPoiFetchAtRef.current = now;

      poiFetchAbortRef.current?.abort();
      const controller = new AbortController();
      poiFetchAbortRef.current = controller;

      try {
        const pois = await fetchNearbyPois(lat, lng, apiKey, controller.signal);
        if (controller.signal.aborted || !mapRef.current) return;

        clearPoiMarkers();

        const nextMarkers = pois.map((poi) => {
          const el = buildPoiLabelEl(poi.name, darkTheme);

          return new maplibregl.Marker({
            element: el,
            anchor: "bottom",
          })
            .setLngLat([poi.lng, poi.lat])
            .addTo(mapRef.current!);
        });

        poiMarkersRef.current = nextMarkers;
        syncPoiMarkerVisibility();
      } catch {}
    },
    [clearPoiMarkers, darkTheme, syncPoiMarkerVisibility],
  );

  const applyPoint = React.useCallback(
    (
      lat: number,
      lng: number,
      place?: string,
      nextStatus: LiveStatus = "live",
      createdAt?: string,
      accuracy?: number,
    ) => {
      const nextLngLat: [number, number] = [lng, lat];
      const previousPoint = lastPointRef.current;

      if (mapRef.current) {
        const needsLiveMarker = nextStatus !== "ended";

        if (!markerRef.current) {
          markerRef.current = new maplibregl.Marker({
            element: buildMarkerEl(needsLiveMarker),
            anchor: "center",
          });
        } else {
          const el = markerRef.current.getElement();
          const hasRadar = el.querySelector("[data-sk-radar='1']");

          if (
            (needsLiveMarker && !hasRadar) ||
            (!needsLiveMarker && hasRadar)
          ) {
            markerRef.current.remove();
            markerRef.current = new maplibregl.Marker({
              element: buildMarkerEl(needsLiveMarker),
              anchor: "center",
            });
          }
        }

        if (!markerRef.current.getElement().isConnected) {
          markerRef.current.setLngLat(nextLngLat).addTo(mapRef.current);
        } else {
          markerRef.current.setLngLat(nextLngLat);
        }

        const movedEnough = previousPoint
          ? distanceMeters(previousPoint.lat, previousPoint.lng, lat, lng) >=
            MOVE_FOLLOW_THRESHOLD_METERS
          : true;

        if (!hasCenteredRef.current) {
          mapRef.current.jumpTo({
            center: nextLngLat,
            zoom: INITIAL_VIEW_ZOOM,
          });
          hasCenteredRef.current = true;
        } else if (
          movedEnough &&
          nextStatus !== "ended" &&
          !mapRef.current.isMoving()
        ) {
          const center = mapRef.current.getCenter();
          const farFromCenter =
            distanceMeters(center.lat, center.lng, lat, lng) >= 120;

          if (farFromCenter) {
            mapRef.current.easeTo({
              center: nextLngLat,
              duration: 700,
              essential: true,
            });
          }
        }

        window.requestAnimationFrame(() => {
          mapRef.current?.resize();
        });
      }

      lastPointRef.current = { lat, lng };

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
      setAccuracyLabel(
        typeof accuracy === "number" && Number.isFinite(accuracy)
          ? `± ${accuracy.toFixed(1)} m`
          : "—",
      );
      setStatus(nextStatus);

      if (nextStatus !== "ended") {
        void refreshNearbyPois(lat, lng);
      }
    },
    [refreshNearbyPois],
  );
  const syncFromSeed = React.useCallback(
    (seed: SeedResp) => {
      setDestinationLabel(sessionLabelFromSeed(seed));
      setDestinationAddressLabel(cleanLabel(seed.destination_address));
      setVisitorName(cleanLabel(seed.visitor_name, "User"));
      setStartedDateLabel(formatLiveDate(seed.started_at));
      setStartedTimeLabel(formatStartedTime(seed.started_at));
      setPurposeLabel(cleanLabel(seed.purpose));
      setPersonToMeetLabel(cleanLabel(seed.person_to_meet));
      setExpectedDurationLabel(
        formatDurationMins(seed.expected_duration_minutes),
      );
      setExtraNoteLabel(cleanLabel(seed.extra_note));

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
          seed.latest.accuracy,
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
    if (!mapRef.current) return;

    const map = mapRef.current;
    const onZoom = () => syncPoiMarkerVisibility();

    map.on("zoom", onZoom);
    return () => {
      map.off("zoom", onZoom);
    };
  }, [syncPoiMarkerVisibility]);

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

    const onResize = () => {
      mapRef.current?.resize();
    };

    window.addEventListener("resize", onResize);
    const t = setTimeout(onResize, 120);

    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, []);

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
  }, [renderMode, status]);

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

  React.useEffect(() => {
    if (!accessAccepted) return;
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
          }
        } catch {}
      };

      ev.onerror = () => {
        closeStream();
        if (closed) return;
        reconnectTimerRef.current = setTimeout(connectStream, 1200);
      };
    };

    async function bootTomTomMap(seed: SeedResp) {
      if (!mapDivRef.current) throw new Error("Map container missing");

      const tomtomStyleUrl = getTomTomStyleUrl();
      const tomtomKey = (process.env.NEXT_PUBLIC_TOMTOM_API_KEY || "").trim();

      if (!tomtomStyleUrl) {
        throw new Error("Missing NEXT_PUBLIC_TOMTOM_STYLE_URL");
      }
      if (!tomtomKey) {
        throw new Error("Missing NEXT_PUBLIC_TOMTOM_API_KEY");
      }

      const hasLatest =
        seed.latest &&
        typeof seed.latest.lng === "number" &&
        typeof seed.latest.lat === "number";

      const initialCenter: [number, number] = hasLatest
        ? [seed.latest!.lng, seed.latest!.lat]
        : [0, 0];

      const initialZoom = hasLatest ? INITIAL_VIEW_ZOOM : 2.4;

      const map = new maplibregl.Map({
        container: mapDivRef.current,
        style: tomtomStyleUrl,
        center: initialCenter,
        zoom: initialZoom,
        minZoom: 3,
        maxZoom: 19,
        attributionControl: false,
        dragRotate: false,
        pitchWithRotate: false,
        trackResize: true,
        fadeDuration: 0,
        transformRequest: (url) => ({
          url,
          headers: {
            "TomTom-Api-Key": tomtomKey,
          },
        }),
      });
      mapRef.current = map;

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          setMapLoadError("The live map could not be rendered.");
          reject(new Error("The live map could not be rendered."));
        }, 8000);

        map.once("load", () => {
          clearTimeout(timeout);

          setMapReady(true);

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

        map.once("error", () => {
          clearTimeout(timeout);
          setMapReady(false);
          reject(new Error("The live map could not be rendered."));
        });
      });

      syncFromSeed(seed);

      if (!seed.ended) {
        connectStream();
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
        setMapReady(false);
        await bootTomTomMap(seed);
      } catch {
        try {
          const seed = await fetchSeed();
          if (!seed) return;

          setRenderMode("fallback");
          setMapReady(false);
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
      poiFetchAbortRef.current?.abort();
      clearReconnect();
      closeStream();
      stopPolling();
      clearPoiMarkers();
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [
    sessionId,
    darkTheme,
    accessAccepted,
    applyPoint,
    syncFromSeed,
    clearReconnect,
    closeStream,
    stopPolling,
    clearPoiMarkers,
  ]);

  const locationHeading = status === "ended" ? "Last session" : "Current area";

  const mobileHeaderEyebrow =
    status === "ended"
      ? "Last session"
      : sosActive
        ? "SOS live session"
        : "Live session";

  const cardBg = darkTheme ? "bg-black/78" : "bg-white/92";
  const cardBorder = darkTheme ? "border-white/10" : "border-black/10";
  const cardText = darkTheme ? "text-white" : "text-black";
  const mutedText = darkTheme ? "text-white/45" : "text-black/45";
  const innerBg = darkTheme ? "bg-white/5" : "bg-[#f6f7f8]";
  const coordText = darkTheme ? "!text-white" : "!text-black";

  const showSpinner = status === "loading";
  const showFallbackHint =
    renderMode === "fallback" && !isDesktop() && status !== "ended";

  const sessionMeta = sessionMetaRows(status, sosActive);
  const infoRows = [
    {
      label: "Started date",
      value: startedDateLabel,
      show: startedDateLabel !== "—",
    },
    {
      label: "Started time",
      value: startedTimeLabel,
      show: startedTimeLabel !== "—",
    },
    {
      label: "Accuracy",
      value: accuracyLabel,
      show: accuracyLabel !== "—",
    },
    {
      label: "Address / landmark",
      value: destinationAddressLabel,
      show: destinationAddressLabel !== "—",
    },
    {
      label: "Purpose",
      value: purposeLabel,
      show: purposeLabel !== "—",
    },
    {
      label: "Meeting",
      value: personToMeetLabel,
      show: personToMeetLabel !== "—",
    },
    {
      label: "Expected stay",
      value: expectedDurationLabel,
      show: expectedDurationLabel !== "—",
    },
    {
      label: "Extra note",
      value: extraNoteLabel,
      show: extraNoteLabel !== "—",
    },
  ].filter((item) => item.show);

  const isPhone = isPhoneViewport();
  const showMobileSheet = isPhone && renderMode === "map" && mapReady;
  const showZoomControls = renderMode === "map" && mapReady;
  const mobileSheetBottom = "bottom-[18px]";
  const mobileZoomBottom = "bottom-[248px]";
  return (
    <div
      className="fixed inset-0 w-screen overflow-hidden bg-transparent"
      style={{ height: "100dvh", minHeight: "100dvh" }}
    >
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
                  <div className="px-4 pt-1.5 pb-[2px]">
                    <div
                      className={`mb-1 text-center text-[6px] font-bold uppercase tracking-[0.22em] ${
                        darkTheme ? "text-white/34" : "text-black/34"
                      }`}
                    >
                      Scroll to see more info
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div
                          className={`flex items-center gap-1 text-[6px] uppercase tracking-[0.2em] font-extrabold ${mutedText}`}
                        >
                          <span>Last session</span>
                          <span>•</span>
                          <span
                            className={`rounded-full border px-1 py-[2px] text-[5px] leading-none ${
                              darkTheme
                                ? "border-white/10 text-white/44"
                                : "border-black/10 text-black/42"
                            }`}
                          >
                            {sessionMeta.statusText}
                          </span>
                        </div>

                        <div
                          className={`mt-1 text-[12px] font-black leading-[1.25] ${cardText}`}
                        >
                          {placeLabel}
                        </div>

                        <div
                          className={`mt-1 text-[9px] leading-4 ${
                            darkTheme ? "text-white/58" : "text-black/56"
                          }`}
                        >
                          Heading to {destinationLabel}
                        </div>
                      </div>

                      <div
                        className={`shrink-0 rounded-full border px-1.5 py-[4px] text-[5px] font-extrabold uppercase tracking-[0.16em] ${sessionMeta.statusClass}`}
                      >
                        {sessionMeta.statusText}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-0">
                    <div
                      className={`rounded-[18px] border ${cardBorder} ${innerBg} px-3 py-2`}
                    >
                      <div
                        className={`max-h-[92px] overflow-y-auto sk-scroll-hidden overscroll-contain pr-[2px] text-center`}
                        style={{ WebkitOverflowScrolling: "touch" }}
                      >
                        <div className="space-y-2">
                          <div>
                            <div
                              className={`text-[7px] uppercase tracking-[0.22em] font-extrabold ${
                                darkTheme ? "text-white/38" : "text-black/40"
                              }`}
                            >
                              Last update
                            </div>
                            <div
                              className={`mt-1 text-[10px] font-bold leading-4 ${cardText}`}
                            >
                              {lastUpdatedLabel}
                            </div>
                          </div>

                          <div>
                            <div
                              className={`text-[7px] uppercase tracking-[0.22em] font-extrabold ${
                                darkTheme ? "text-white/38" : "text-black/40"
                              }`}
                            >
                              Started
                            </div>
                            <div
                              className={`mt-1 text-[10px] font-bold leading-4 ${cardText}`}
                            >
                              {startedTimeLabel}
                            </div>
                          </div>

                          {infoRows.map((item) => (
                            <div key={item.label}>
                              <div
                                className={`text-[7px] uppercase tracking-[0.22em] font-extrabold ${
                                  darkTheme ? "text-white/38" : "text-black/40"
                                }`}
                              >
                                {item.label}
                              </div>
                              <div
                                className={`mt-1 text-[10px] font-bold leading-4 break-words whitespace-pre-wrap ${
                                  darkTheme ? "text-white/82" : "text-black/78"
                                }`}
                              >
                                {item.value}
                              </div>
                            </div>
                          ))}

                          {!!coordsLabel && !!mapHref && (
                            <div>
                              <div
                                className={`text-[7px] uppercase tracking-[0.22em] font-extrabold ${
                                  darkTheme ? "text-white/38" : "text-black/40"
                                }`}
                              >
                                Coordinates
                              </div>
                              <a
                                href={mapHref}
                                target="_blank"
                                rel="noreferrer"
                                className={`mt-1 block text-[10px] font-bold leading-4 underline underline-offset-4 break-all ${coordText}`}
                              >
                                {coordsLabel}
                              </a>
                            </div>
                          )}

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
          className="absolute inset-0 z-0 bg-transparent"
          style={{ height: "100dvh" }}
        />
      )}

      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20">
        {" "}
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

      {showSpinner && (
        <div className="absolute top-[92px] left-1/2 -translate-x-1/2 z-20">
          <PremiumSpinner />
        </div>
      )}

      {mapLoadError && (
        <div className="absolute top-[124px] left-1/2 -translate-x-1/2 z-20">
          <div className="rounded-full bg-red-50 border border-red-200 shadow-md px-3 py-2">
            <span className="text-[10px] tracking-[0.12em] font-bold text-red-600 whitespace-nowrap">
              {mapLoadError}
            </span>
          </div>
        </div>
      )}

      {showFallbackHint && !showSpinner && (
        <div className="absolute top-[92px] left-1/2 -translate-x-1/2 z-20">
          <div className="rounded-full bg-white/70 border border-white/80 shadow-md px-3 py-1.5">
            <span className="text-[9px] font-bold text-black/60 whitespace-nowrap">
              Open in Chrome or Safari
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
              <div
                className={`rounded-full border px-2.5 py-[6px] text-[8px] font-extrabold uppercase tracking-[0.18em] shadow-[0_0_16px_rgba(15,143,112,0.12)] ${
                  status === "live" && !sosActive
                    ? "animate-[skLivePulse_2.6s_ease-in-out_infinite]"
                    : ""
                } ${sessionMeta.statusClass}`}
              >
                {sessionMeta.statusText}
              </div>

              <div className="rounded-full border border-white/75 bg-white/88 px-2 py-[6px] text-[8px] font-extrabold uppercase tracking-[0.13em] text-black/46">
                {locationHeading} <span className="ml-1 text-black/34">›</span>
              </div>

              <div className="rounded-full border border-white/75 bg-white/92 px-2.5 py-[6px] text-[10px] font-bold text-black/78 max-w-[280px] truncate">
                {placeLabel}
              </div>

              <div className="rounded-full border border-white/75 bg-white/88 px-2 py-[6px] text-[8px] font-extrabold uppercase tracking-[0.13em] text-black/46">
                Heading to <span className="ml-1 text-black/34">›</span>
              </div>

              <div className="rounded-full border border-white/75 bg-white/92 px-2.5 py-[6px] text-[10px] font-bold text-black/78 max-w-[200px] truncate">
                {destinationLabel}
              </div>

              <div className="rounded-full border border-white/75 bg-white/88 px-2 py-[6px] text-[8px] font-extrabold uppercase tracking-[0.13em] text-black/46">
                Updated <span className="ml-1 text-black/34">›</span>
              </div>

              <div className="rounded-full border border-white/75 bg-white/92 px-2.5 py-[6px] text-[10px] font-bold text-black/78">
                {lastUpdatedLabel}
              </div>
            </div>

            {infoRows.length > 0 && (
              <div
                className={`pointer-events-auto flex max-w-[1080px] flex-wrap items-center justify-center gap-1.5 rounded-[18px] border ${cardBorder} ${cardBg} px-2.5 py-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.08)] backdrop-blur-2xl`}
              >
                {infoRows.map((item) => (
                  <React.Fragment key={item.label}>
                    <div className="rounded-full border border-white/75 bg-white/88 px-2 py-[6px] text-[8px] font-extrabold uppercase tracking-[0.13em] text-black/46">
                      {item.label} <span className="ml-1 text-black/34">›</span>
                    </div>
                    <div className="rounded-[16px] border border-white/75 bg-white/92 px-3 py-[6px] text-[10px] font-bold text-black/78 max-w-[320px] whitespace-normal break-words text-center">
                      {item.value}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}

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
          onClick={() => {
            if (!mapReady || renderMode !== "map") return;
            mapRef.current?.zoomIn({ duration: 220 });
          }}
          className={`h-7 w-7 rounded-[18px] border text-[16px] font-black shadow-[0_10px_24px_rgba(0,0,0,0.10)] backdrop-blur-xl transition-opacity ${
            !mapReady || renderMode !== "map"
              ? "border-white/35 bg-white/28 text-black/28 opacity-55 cursor-not-allowed"
              : "border-white/55 bg-white/38 text-black/58"
          }`}
        >
          +
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          disabled={!mapReady || renderMode !== "map"}
          onClick={() => {
            if (!mapReady || renderMode !== "map") return;
            mapRef.current?.zoomOut({ duration: 220 });
          }}
          className={`h-7 w-7 rounded-[18px] border text-[16px] font-black shadow-[0_10px_24px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-opacity ${
            !mapReady || renderMode !== "map"
              ? "border-white/30 bg-white/20 text-black/30 opacity-55 cursor-not-allowed"
              : "border-white/40 bg-white/22 text-black/62"
          }`}
        >
          −
        </button>
      </div>

      {accessGateOpen && !accessAccepted && (
        <div className="absolute inset-0 z-[90] flex items-center justify-center bg-black/45 backdrop-blur-md px-4">
          <div
            className={`w-full max-w-[560px] rounded-[30px] border ${cardBorder} ${
              darkTheme ? "bg-[#0d0d0d]/94" : "bg-white/95"
            } shadow-[0_30px_100px_rgba(0,0,0,0.30)] p-5 md:p-6`}
          >
            <div
              className={`text-[11px] font-black uppercase tracking-[0.34em] ${mutedText}`}
            >
              Live map access
            </div>

            <div
              className={`mt-3 text-[21px] md:text-[24px] font-black tracking-[-0.03em] ${cardText}`}
            >
              Privacy notice
            </div>

            <div
              className={`mt-3 text-[11px] md:text-[12px] leading-6 ${
                darkTheme ? "text-white/72" : "text-black/68"
              }`}
            >
              This live map is provided only for approved safety use. Do not use
              this session to stalk, monitor, harass, or track anyone you do not
              know or do not have permission to protect. Misuse may violate
              StayKnown policy, privacy rules, and applicable law.
            </div>

            <div
              className={`mt-4 rounded-[22px] border ${cardBorder} ${innerBg} p-4`}
            >
              <div
                className={`text-[12px] font-extrabold uppercase tracking-[0.24em] ${mutedText}`}
              >
                Before you continue
              </div>
              <div
                className={`mt-2 text-[13px] leading-6 ${
                  darkTheme ? "text-white/72" : "text-black/70"
                }`}
              >
                By tapping accept, you confirm that you are opening this session
                only for a legitimate safety reason.
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setAccessGateOpen(false);
                  if (typeof window !== "undefined") {
                    window.location.replace("about:blank");
                    window.close();
                  }
                }}
                className={`group relative overflow-hidden rounded-full px-5 py-3 text-[13px] font-extrabold transition-all duration-200 ease-out active:scale-[0.985] hover:-translate-y-[1px] hover:shadow-[0_14px_34px_rgba(0,0,0,0.14)] ${
                  darkTheme
                    ? "bg-white/8 text-white/82 border border-white/12 hover:bg-white/12"
                    : "bg-black/5 text-black/72 border border-black/10 hover:bg-black/[0.07]"
                }`}
              >
                <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-[linear-gradient(115deg,transparent_18%,rgba(255,255,255,0.22)_42%,transparent_64%)] bg-[length:220%_100%] animate-[skButtonSweep_1.8s_linear_infinite]" />
                <span className="pointer-events-none absolute inset-0 opacity-0 active:opacity-100 bg-white/20 animate-[skButtonFlicker_220ms_ease-out]" />
                <span className="relative z-[1]">Decline</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAccessAccepted(true);
                  setAccessGateOpen(false);
                }}
                className="group relative overflow-hidden rounded-full px-5 py-3 text-[13px] font-extrabold bg-[#dff5ee] text-[#0e8f70] border border-[#ccebdd] transition-all duration-200 ease-out active:scale-[0.985] hover:-translate-y-[1px] hover:shadow-[0_14px_34px_rgba(14,143,112,0.18)] hover:brightness-[1.02]"
              >
                <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-[linear-gradient(115deg,transparent_18%,rgba(255,255,255,0.34)_42%,transparent_64%)] bg-[length:220%_100%] animate-[skButtonSweep_1.8s_linear_infinite]" />
                <span className="pointer-events-none absolute inset-0 opacity-0 active:opacity-100 bg-white/26 animate-[skButtonFlicker_220ms_ease-out]" />
                <span className="relative z-[1]">I accept</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
