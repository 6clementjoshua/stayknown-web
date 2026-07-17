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
  location_quality?: string;
  location_is_exact?: boolean;
  location_is_approximate?: boolean;
  location_age_seconds?: number | null;
  location_label?: string;
  purpose?: string | null;
  person_to_meet?: string | null;
  expected_duration_minutes?: number | null;
  extra_note?: string | null;
  visitor_name?: string | null;
  visitor_avatar_url?: string | null;
  visitor_verified?: boolean;
  visitor_badge_type?: string | null;
  visitor_badge_status?: string | null;
  viewer_name?: string | null;
  viewer_user_id?: string | null;
  viewer_is_stayknown?: boolean;
  recipient_contact_id?: string | null;
  signed_access_version?: "v1" | "v2";
  legacy_read_only?: boolean;
  can_send_advisory?: boolean;
  active_advisory?: AdvisorySnapshot | null;
  error?: string;
  detail?: string;
};

type LiveStatus = "loading" | "live" | "ended" | "error";
type RenderMode = "map" | "fallback";
type PanelMode = "info" | "guidance" | "custom" | "confirm" | "sent";
type AdvisoryKind =
  | "leave_area"
  | "check_route"
  | "location_mismatch"
  | "custom";

type LiveAccessProps = {
  sid: string;
  exp: string;
  uid: string;
  aud: string;
  sig: string;
  rid: string;
  version: "v1" | "v2";
};

type AdvisorySnapshot = {
  id: string;
  message_kind?: string;
  message_text?: string;
  status?: string;
  response_kind?: string | null;
  created_at?: string;
  updated_at?: string;
  leaving_at?: string | null;
  safe_at?: string | null;
};

const INITIAL_VIEW_ZOOM = 14.1;
const FALLBACK_CENTER: [number, number] = [8.3349, 4.5736];
const FALLBACK_ZOOM = 12.8;
const MOVE_FOLLOW_THRESHOLD_METERS = 28;
const MAP_LOAD_TIMEOUT_MS = 16000;
const MAP_AUTO_RETRY_LIMIT = 2;
const MAP_RETRY_DELAY_MS = 900;

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

function locationQuality(accuracy?: number) {
  if (typeof accuracy !== "number" || !Number.isFinite(accuracy)) {
    return {
      level: "unknown" as const,
      label: "Accuracy unknown",
      exact: false,
      zoom: 14.1,
    };
  }

  if (accuracy <= 80) {
    return {
      level: "exact" as const,
      label: `Exact GPS • ± ${accuracy.toFixed(1)} m`,
      exact: true,
      zoom: 16.3,
    };
  }

  if (accuracy <= 250) {
    return {
      level: "approximate" as const,
      label: `Approximate area • ± ${accuracy.toFixed(1)} m`,
      exact: false,
      zoom: 15.0,
    };
  }

  return {
    level: "coarse" as const,
    label: `Last known approximate area • ± ${accuracy.toFixed(0)} m`,
    exact: false,
    zoom: 13.2,
  };
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

function VerifiedBadge({
  verified,
  badgeType,
  compact = false,
}: {
  verified: boolean;
  badgeType?: string | null;
  compact?: boolean;
}) {
  if (!verified) return null;

  const normalized = String(badgeType || "")
    .trim()
    .toLowerCase();
  const official =
    normalized.includes("official") ||
    normalized.includes("public") ||
    normalized.includes("government") ||
    normalized.includes("organisation") ||
    normalized.includes("organization");

  return (
    <span
      title={
        official ? "Verified official or public body" : "Verified individual"
      }
      className={`inline-flex shrink-0 items-center justify-center rounded-full border font-black leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.30)] ${
        compact
          ? "h-[15px] w-[15px] text-[8px]"
          : "h-[18px] w-[18px] text-[10px]"
      } ${
        official
          ? "border-white/55 bg-[#73777d] text-white"
          : "border-white/20 bg-black text-white"
      }`}
    >
      ✓
    </span>
  );
}

function Glyph({
  name,
  className = "h-4 w-4",
}: {
  name: string;
  className?: string;
}) {
  const paths: Record<string, React.ReactNode> = {
    shield: (
      <path d="M12 3 5.5 5.7v5.1c0 4.2 2.8 7.9 6.5 9.2 3.7-1.3 6.5-5 6.5-9.2V5.7L12 3Zm0 4.1v9.1m-3.7-4.5h7.4" />
    ),
    route: (
      <path d="M6 18.5c-2.4 0-3.5-1.2-3.5-2.8 0-1.7 1.4-2.8 3.2-2.8h4.6c1.8 0 3.2-1 3.2-2.6 0-1.5-1.2-2.5-3-2.5H8m-2-2 2-2 2 2m8 12 2 2 2-2m-2 2v-5" />
    ),
    leave: <path d="M10 5H5v14h5m4-3 4-4-4-4m4 4H8" />,
    pin: (
      <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Zm0-8.3A2.7 2.7 0 1 0 12 7a2.7 2.7 0 0 0 0 5.7Z" />
    ),
    message: <path d="M4 5.5h16v11H9l-5 3v-14Zm4 4h8M8 13h5" />,
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    arrow: <path d="m9 5 7 7-7 7" />,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name] ?? paths.shield}
    </svg>
  );
}

const ADVISORY_OPTIONS: Array<{
  id: AdvisoryKind;
  title: string;
  body: string;
  icon: string;
}> = [
  {
    id: "leave_area",
    title: "Leave this area",
    body: "I’m concerned about your current area. Please leave carefully and contact me.",
    icon: "leave",
  },
  {
    id: "check_route",
    title: "Check your route",
    body: "I know this route. You may be heading toward an unsafe area. Please check your route now.",
    icon: "route",
  },
  {
    id: "location_mismatch",
    title: "Location does not match",
    body: "Your current location does not match where I expected you to be. Please confirm your location.",
    icon: "pin",
  },
];

function accessQuery(access: LiveAccessProps) {
  const params = new URLSearchParams({
    sid: access.sid,
    exp: access.exp,
    uid: access.uid,
    aud: access.aud,
    sig: access.sig,
  });
  if (access.rid) params.set("rid", access.rid);
  return params.toString();
}

export default function LiveClient({ access }: { access: LiveAccessProps }) {
  const sessionId = access.sid;
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
  const [mapRetrying, setMapRetrying] = React.useState(false);
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

  const [visitorAvatarUrl, setVisitorAvatarUrl] = React.useState("");
  const [visitorVerified, setVisitorVerified] = React.useState(false);
  const [visitorBadgeType, setVisitorBadgeType] = React.useState("");
  const [viewerName, setViewerName] = React.useState("");
  const [canSendAdvisory, setCanSendAdvisory] = React.useState(false);
  const [consentId, setConsentId] = React.useState("");
  const [consentChecked, setConsentChecked] = React.useState(false);
  const [consentRecording, setConsentRecording] = React.useState(false);
  const [consentError, setConsentError] = React.useState("");
  const [panelMode, setPanelMode] = React.useState<PanelMode>("info");
  const [selectedAdvisoryKind, setSelectedAdvisoryKind] =
    React.useState<AdvisoryKind>("leave_area");
  const [customAdvisoryMessage, setCustomAdvisoryMessage] = React.useState("");
  const [advisorySending, setAdvisorySending] = React.useState(false);
  const [advisoryError, setAdvisoryError] = React.useState("");
  const [activeAdvisory, setActiveAdvisory] =
    React.useState<AdvisorySnapshot | null>(null);

  const signedQuery = React.useMemo(() => accessQuery(access), [access]);

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

  const recordAccessDecision = React.useCallback(
    async (decision: "accepted" | "declined") => {
      if (consentRecording) return false;
      setConsentRecording(true);
      setConsentError("");

      try {
        const response = await fetch("/api/live/consent", {
          method: "POST",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...access,
            decision,
          }),
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok || result?.ok !== true) {
          throw new Error(
            String(
              result?.error || "StayKnown could not record this decision.",
            ),
          );
        }

        if (decision === "accepted") {
          setConsentId(String(result.consent_id || ""));
          setAccessAccepted(true);
          setAccessGateOpen(false);
        }

        return true;
      } catch (error) {
        setConsentError(
          error instanceof Error
            ? error.message
            : "StayKnown could not record this decision.",
        );
        return false;
      } finally {
        setConsentRecording(false);
      }
    },
    [access, consentRecording],
  );

  const declineAccess = React.useCallback(async () => {
    const recorded = await recordAccessDecision("declined");
    if (!recorded) return;

    setAccessGateOpen(false);

    if (typeof window !== "undefined") {
      window.location.replace("about:blank");
      window.close();
    }
  }, [recordAccessDecision]);

  const sendSafetyAdvisory = React.useCallback(async () => {
    if (!canSendAdvisory || advisorySending || status === "ended") return;
    if (!consentId) {
      setAdvisoryError(
        "Your recorded safety-use consent is missing. Reopen the signed map link.",
      );
      return;
    }

    setAdvisorySending(true);
    setAdvisoryError("");

    try {
      const response = await fetch("/api/live/advisory/send", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...access,
          consent_id: consentId,
          message_kind: selectedAdvisoryKind,
          custom_message:
            selectedAdvisoryKind === "custom" ? customAdvisoryMessage : "",
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.ok !== true) {
        throw new Error(
          String(result?.error || "StayKnown could not send this guidance."),
        );
      }

      const advisory = result.advisory as AdvisorySnapshot;
      setActiveAdvisory(advisory);
      setPanelMode("sent");
    } catch (error) {
      setAdvisoryError(
        error instanceof Error
          ? error.message
          : "StayKnown could not send this guidance.",
      );
    } finally {
      setAdvisorySending(false);
    }
  }, [
    access,
    advisorySending,
    canSendAdvisory,
    consentId,
    customAdvisoryMessage,
    selectedAdvisoryKind,
    status,
  ]);

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
      const quality = locationQuality(accuracy);
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
            zoom: quality.zoom,
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
          ? quality.exact
            ? place.trim()
            : `${place.trim()} • approximate area`
          : nextStatus === "ended"
            ? quality.exact
              ? "Last known location"
              : "Last known approximate area"
            : quality.exact
              ? "Live location available"
              : "Approximate live area";
      setPlaceLabel(cleanPlace);
      setCoordsLabel(formatCoords(lat, lng));
      setMapHref(googleMapsHref(lat, lng));
      setLastUpdatedLabel(formatLiveTime(createdAt));
      setAccuracyLabel(quality.label);
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
      setVisitorAvatarUrl(cleanLabel(seed.visitor_avatar_url, ""));
      setVisitorVerified(seed.visitor_verified === true);
      setVisitorBadgeType(cleanLabel(seed.visitor_badge_type, ""));
      setViewerName(cleanLabel(seed.viewer_name, ""));
      setCanSendAdvisory(seed.can_send_advisory === true);
      setActiveAdvisory(seed.active_advisory ?? null);
      if (seed.active_advisory) setPanelMode("sent");

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

      const seedRes = await fetch(`/api/live/seed?${signedQuery}`, {
        cache: "no-store",
        signal: ac.signal,
      });

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

      const ev = new EventSource(`/api/live/stream?${signedQuery}`);
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
                data.accuracy,
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

          if (data.type === "advisory") {
            const advisory = data.advisory as AdvisorySnapshot | undefined;
            if (advisory?.id) {
              setActiveAdvisory(advisory);
              setPanelMode("sent");
            }
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

      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= MAP_AUTO_RETRY_LIMIT; attempt++) {
        if (!mapDivRef.current) {
          throw new Error("Map container missing");
        }

        if (closed) return;

        try {
          setMapLoadError("");
          setMapReady(false);
          setMapRetrying(attempt > 0);

          if (mapRef.current) {
            try {
              mapRef.current.remove();
            } catch {}
            mapRef.current = null;
          }

          if (markerRef.current) {
            try {
              markerRef.current.remove();
            } catch {}
            markerRef.current = null;
          }

          clearPoiMarkers();

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
            let settled = false;

            const finish = (fn: () => void) => {
              if (settled) return;
              settled = true;
              fn();
            };

            const timeout = setTimeout(() => {
              finish(() => {
                reject(
                  new Error("The live map is taking longer than expected."),
                );
              });
            }, MAP_LOAD_TIMEOUT_MS);

            map.once("load", () => {
              finish(() => {
                clearTimeout(timeout);

                setMapReady(true);
                setMapLoadError("");

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
            });

            map.once("error", () => {
              finish(() => {
                clearTimeout(timeout);
                setMapReady(false);
                reject(new Error("The live map could not be rendered yet."));
              });
            });
          });

          setMapRetrying(false);
          syncFromSeed(seed);

          if (!seed.ended) {
            connectStream();
          }

          return;
        } catch (error) {
          lastError =
            error instanceof Error
              ? error
              : new Error("The live map could not be rendered.");

          setMapReady(false);

          if (mapRef.current) {
            try {
              mapRef.current.remove();
            } catch {}
            mapRef.current = null;
          }

          if (markerRef.current) {
            try {
              markerRef.current.remove();
            } catch {}
            markerRef.current = null;
          }

          clearPoiMarkers();

          if (attempt < MAP_AUTO_RETRY_LIMIT) {
            setMapLoadError("Reloading map…");
            await new Promise((r) => setTimeout(r, MAP_RETRY_DELAY_MS));
            continue;
          }

          setMapRetrying(false);
          throw lastError;
        }
      }

      throw lastError ?? new Error("The live map could not be rendered.");
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
    signedQuery,
    darkTheme,
    accessAccepted,
    applyPoint,
    syncFromSeed,
    clearReconnect,
    closeStream,
    stopPolling,
    clearPoiMarkers,
  ]);

  const locationHeading =
    status === "ended" ? "Last known area" : "Current area";
  const cardText = darkTheme ? "text-white" : "text-[#111318]";
  const mutedText = darkTheme ? "text-white/58" : "text-black/54";
  const glassBorder = darkTheme ? "border-white/13" : "border-white/70";
  const glassSurface = darkTheme
    ? "bg-[linear-gradient(145deg,rgba(20,20,22,.86),rgba(4,4,5,.72))]"
    : "bg-[linear-gradient(145deg,rgba(255,255,255,.94),rgba(232,235,239,.82))]";
  const insetSurface = darkTheme
    ? "bg-white/[0.055] border-white/10"
    : "bg-white/66 border-black/[0.065]";
  const sessionMeta = sessionMetaRows(status, sosActive);
  const showSpinner = status === "loading";
  const isPhone = isPhoneViewport();
  const showMobileSheet = isPhone && renderMode === "map" && mapReady;
  const showZoomControls = renderMode === "map" && mapReady;
  const mobileZoomBottom = "bottom-[216px]";

  const activeResponse = String(activeAdvisory?.response_kind || "").trim();
  const activeStatus = String(activeAdvisory?.status || "").trim();
  const advisoryClosed = ["safe", "cancelled", "expired", "failed"].includes(
    activeStatus,
  );
  const hasOpenAdvisory = Boolean(activeAdvisory) && !advisoryClosed;
  const draftAdvisoryMessage =
    selectedAdvisoryKind === "custom"
      ? customAdvisoryMessage.trim()
      : ADVISORY_OPTIONS.find((item) => item.id === selectedAdvisoryKind)
          ?.body || "";

  const advisoryMessage =
    String(activeAdvisory?.message_text || "").trim() || draftAdvisoryMessage;

  const responseCopy =
    activeResponse === "safe" || activeStatus === "safe"
      ? `${visitorName} reported that they are safe.`
      : activeResponse === "leaving_now" || activeStatus === "leaving"
        ? `${visitorName} received the guidance and says they are leaving now.`
        : "The guidance was delivered. StayKnown will show the visitor’s response here.";

  const compactInfoRows = [
    { label: "Updated", value: lastUpdatedLabel },
    { label: "Accuracy", value: accuracyLabel },
    { label: "Destination", value: destinationLabel },
    { label: "Expected stay", value: expectedDurationLabel },
  ].filter((item) => item.value && item.value !== "—");

  const VisitorIdentity = ({ compact = false }: { compact?: boolean }) => (
    <div className="flex min-w-0 items-center gap-2.5">
      <div
        className={`relative shrink-0 overflow-hidden border shadow-[inset_0_1px_0_rgba(255,255,255,.35),inset_0_-8px_18px_rgba(0,0,0,.12)] ${
          compact ? "h-8 w-8 rounded-[12px]" : "h-10 w-10 rounded-[15px]"
        } ${darkTheme ? "border-white/14 bg-white/8" : "border-white/80 bg-white"}`}
      >
        {visitorAvatarUrl ? (
          <img
            src={visitorAvatarUrl}
            alt={visitorName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className={`grid h-full w-full place-items-center font-black ${cardText}`}
          >
            {visitorName.trim().slice(0, 1).toUpperCase() || "S"}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-1.5">
          <div
            className={`truncate font-black tracking-[-0.02em] ${compact ? "text-[11px]" : "text-[13px]"} ${cardText}`}
          >
            {visitorName}
          </div>
          <VerifiedBadge
            verified={visitorVerified}
            badgeType={visitorBadgeType}
            compact={compact}
          />
        </div>
        <div
          className={`mt-0.5 truncate text-[8px] font-extrabold uppercase tracking-[0.18em] ${mutedText}`}
        >
          {sosActive
            ? "SOS live Visit"
            : status === "ended"
              ? "Visit ended"
              : "Live Visit"}
        </div>
      </div>
    </div>
  );

  const GuidanceChoices = () => (
    <div className="space-y-2">
      {ADVISORY_OPTIONS.map((option) => {
        const selected = selectedAdvisoryKind === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => setSelectedAdvisoryKind(option.id)}
            className={`group flex w-full items-start gap-2.5 rounded-[17px] border p-2.5 text-left transition active:scale-[0.992] ${
              selected
                ? darkTheme
                  ? "border-white/28 bg-white/12"
                  : "border-black/18 bg-white shadow-[inset_0_1px_0_#fff,0_8px_20px_rgba(0,0,0,.07)]"
                : darkTheme
                  ? "border-white/9 bg-white/[0.035] hover:bg-white/[0.07]"
                  : "border-black/[0.065] bg-white/45 hover:bg-white/75"
            }`}
          >
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-[12px] border ${selected ? "bg-black text-white border-black" : `${insetSurface} ${cardText}`}`}
            >
              <Glyph name={option.icon} className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className={`block text-[10px] font-black ${cardText}`}>
                {option.title}
              </span>
              <span
                className={`mt-0.5 block text-[8.5px] font-semibold leading-[1.45] ${mutedText}`}
              >
                {option.body}
              </span>
            </span>
            {selected ? (
              <Glyph
                name="check"
                className={`mt-1 h-4 w-4 shrink-0 ${cardText}`}
              />
            ) : null}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => {
          setSelectedAdvisoryKind("custom");
          setPanelMode("custom");
        }}
        className={`flex w-full items-center gap-2.5 rounded-[17px] border p-2.5 text-left transition active:scale-[0.992] ${
          selectedAdvisoryKind === "custom"
            ? darkTheme
              ? "border-white/28 bg-white/12"
              : "border-black/18 bg-white"
            : `${insetSurface}`
        }`}
      >
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-[12px] border ${insetSurface} ${cardText}`}
        >
          <Glyph name="message" className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block text-[10px] font-black ${cardText}`}>
            Write a short custom message
          </span>
          <span
            className={`mt-0.5 block text-[8.5px] font-semibold ${mutedText}`}
          >
            Plain text only • maximum 160 characters • no links
          </span>
        </span>
        <Glyph name="arrow" className={`h-4 w-4 shrink-0 ${mutedText}`} />
      </button>
    </div>
  );

  const PanelBody = () => {
    if (panelMode === "confirm") {
      return (
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div
                className={`text-[8px] font-black uppercase tracking-[0.22em] ${mutedText}`}
              >
                Confirm safety guidance
              </div>
              <div
                className={`mt-1 text-[12px] font-black tracking-[-0.02em] ${cardText}`}
              >
                Send this message to {visitorName}?
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                setPanelMode(
                  selectedAdvisoryKind === "custom" ? "custom" : "guidance",
                )
              }
              className={`grid h-7 w-7 place-items-center rounded-full border ${insetSurface} ${cardText}`}
            >
              <Glyph name="close" className="h-3.5 w-3.5" />
            </button>
          </div>

          <div
            className={`mt-2 min-h-0 flex-1 overflow-y-auto rounded-[17px] border p-3 sk-scroll-hidden ${insetSurface}`}
          >
            <div
              className={`text-[10px] font-extrabold leading-[1.55] ${cardText}`}
            >
              {draftAdvisoryMessage}
            </div>
            <div
              className={`mt-2 rounded-[14px] border p-2.5 text-[8px] font-semibold leading-[1.5] ${insetSurface} ${mutedText}`}
            >
              Confirm only for a genuine safety concern. Do not use this feature
              to control movement, frighten, punish, lure, test, manipulate,
              stalk, harass, or falsely describe an area or route. This action
              and its signed access context are recorded.
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={advisorySending}
              onClick={() =>
                setPanelMode(
                  selectedAdvisoryKind === "custom" ? "custom" : "guidance",
                )
              }
              className={`h-9 rounded-full border text-[9px] font-black ${insetSurface} ${cardText}`}
            >
              Go back
            </button>
            <button
              type="button"
              disabled={!draftAdvisoryMessage || advisorySending}
              onClick={() => void sendSafetyAdvisory()}
              className="h-9 rounded-full border border-black bg-black text-[9px] font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,.20),inset_0_-8px_18px_rgba(0,0,0,.35)] disabled:opacity-40"
            >
              {advisorySending ? "Sending…" : "Confirm and send"}
            </button>
          </div>
          {advisoryError ? (
            <div className="mt-1 text-center text-[8px] font-bold text-red-500">
              {advisoryError}
            </div>
          ) : null}
        </div>
      );
    }

    if (panelMode === "sent" && activeAdvisory) {
      return (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div
                className={`text-[8px] font-black uppercase tracking-[0.22em] ${mutedText}`}
              >
                Advisory status
              </div>
              <div
                className={`mt-1 text-[13px] font-black tracking-[-0.02em] ${cardText}`}
              >
                {advisoryClosed
                  ? "Advisory completed"
                  : activeStatus === "leaving"
                    ? "Visitor is leaving"
                    : "Guidance sent"}
              </div>
            </div>
            <div
              className={`rounded-full border px-2.5 py-1.5 text-[7px] font-black uppercase tracking-[0.16em] ${sessionMeta.statusClass}`}
            >
              {activeStatus || "Active"}
            </div>
          </div>

          <div
            className={`mt-2.5 min-h-0 flex-1 overflow-y-auto rounded-[17px] border p-3 sk-scroll-hidden ${insetSurface}`}
          >
            <div
              className={`text-[10px] font-extrabold leading-[1.5] ${cardText}`}
            >
              {advisoryMessage}
            </div>
            <div
              className={`mt-2 text-[9px] font-semibold leading-[1.5] ${mutedText}`}
            >
              {responseCopy}
            </div>
            <div
              className={`mt-2 rounded-[13px] border p-2 text-[8px] font-semibold leading-[1.45] ${insetSurface} ${mutedText}`}
            >
              “I’m leaving now” is not a declaration of safety. “I’m safe” is a
              user declaration, not independent proof of safety.
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (advisoryClosed) {
                setActiveAdvisory(null);
                setAdvisoryError("");
                setPanelMode("guidance");
              } else {
                setPanelMode("info");
              }
            }}
            className={`mt-2 h-9 rounded-full border text-[9px] font-black ${insetSurface} ${cardText}`}
          >
            {advisoryClosed
              ? "Prepare another safety guidance"
              : "Return to Visit information"}
          </button>
        </div>
      );
    }

    if (panelMode === "custom") {
      return (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPanelMode("guidance")}
              className={`text-[9px] font-black ${mutedText}`}
            >
              ← Guidance options
            </button>
            <span className={`text-[8px] font-extrabold ${mutedText}`}>
              {customAdvisoryMessage.length}/160
            </span>
          </div>
          <textarea
            autoFocus
            value={customAdvisoryMessage}
            maxLength={160}
            onChange={(event) => setCustomAdvisoryMessage(event.target.value)}
            placeholder="Write clear safety guidance without threats, links, control, or false claims…"
            className={`mt-2 min-h-0 flex-1 resize-none rounded-[18px] border px-3 py-3 text-[11px] font-semibold leading-[1.55] outline-none focus:ring-2 focus:ring-black/15 ${
              darkTheme
                ? "border-white/12 bg-black/30 text-white placeholder:text-white/30"
                : "border-black/10 bg-white/75 text-black placeholder:text-black/30"
            }`}
          />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPanelMode("guidance")}
              className={`h-9 rounded-full border text-[9px] font-black ${insetSurface} ${cardText}`}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!customAdvisoryMessage.trim() || advisorySending}
              onClick={() => {
                setAdvisoryError("");
                setPanelMode("confirm");
              }}
              className="h-9 rounded-full border border-black bg-black text-[9px] font-black text-white disabled:cursor-not-allowed disabled:opacity-35"
            >
              {advisorySending ? "Sending…" : "Review and send"}
            </button>
          </div>
          {advisoryError ? (
            <div className="mt-1 text-center text-[8px] font-bold text-red-500">
              {advisoryError}
            </div>
          ) : null}
        </div>
      );
    }

    if (panelMode === "guidance") {
      return (
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div
                className={`text-[8px] font-black uppercase tracking-[0.22em] ${mutedText}`}
              >
                Visit Safety Advisory
              </div>
              <div
                className={`mt-1 text-[12px] font-black tracking-[-0.02em] ${cardText}`}
              >
                Choose accurate, responsible guidance
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPanelMode("info")}
              className={`grid h-7 w-7 place-items-center rounded-full border ${insetSurface} ${cardText}`}
            >
              <Glyph name="close" className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-2 min-h-0 flex-1 overflow-y-auto pr-0.5 sk-scroll-hidden">
            <GuidanceChoices />
            <div
              className={`mt-2 rounded-[16px] border p-2.5 text-[8.2px] font-semibold leading-[1.5] ${insetSurface} ${mutedText}`}
            >
              Send only for a genuine safety concern. Do not stalk, frighten,
              lure, punish, control movement, or falsely describe an area or
              route. Your consent and actions are recorded and may be reviewed
              under StayKnown policy and applicable law.
            </div>
          </div>
          <button
            type="button"
            disabled={advisorySending}
            onClick={() => {
              setAdvisoryError("");
              setPanelMode("confirm");
            }}
            className="mt-2 h-9 rounded-full border border-black bg-black text-[9px] font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,.20),inset_0_-8px_18px_rgba(0,0,0,.35)] disabled:opacity-40"
          >
            {`Review message for ${visitorName}`}
          </button>
          {advisoryError ? (
            <div className="mt-1 text-center text-[8px] font-bold text-red-500">
              {advisoryError}
            </div>
          ) : null}
        </div>
      );
    }

    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-3">
          <VisitorIdentity />
          <div
            className={`rounded-full border px-2.5 py-1.5 text-[7px] font-black uppercase tracking-[0.16em] ${sessionMeta.statusClass}`}
          >
            {sessionMeta.statusText}
          </div>
        </div>

        <div
          className={`mt-2.5 min-h-0 flex-1 overflow-y-auto rounded-[18px] border p-3 sk-scroll-hidden ${insetSurface}`}
        >
          <div
            className={`text-[8px] font-black uppercase tracking-[0.20em] ${mutedText}`}
          >
            {locationHeading}
          </div>
          <div
            className={`mt-1 text-[12px] font-black leading-[1.35] tracking-[-0.02em] ${cardText}`}
          >
            {placeLabel}
          </div>
          <div
            className={`mt-1 text-[9px] font-semibold leading-[1.4] ${mutedText}`}
          >
            Heading to {destinationLabel}
          </div>

          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {compactInfoRows.map((item) => (
              <div
                key={item.label}
                className={`min-w-0 rounded-[13px] border px-2 py-1.5 ${insetSurface}`}
              >
                <div
                  className={`text-[6.5px] font-black uppercase tracking-[0.16em] ${mutedText}`}
                >
                  {item.label}
                </div>
                <div
                  className={`mt-0.5 truncate text-[8.5px] font-extrabold ${cardText}`}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {canSendAdvisory && status !== "ended" ? (
          <button
            type="button"
            onClick={() => {
              setAdvisoryError("");
              setPanelMode(hasOpenAdvisory ? "sent" : "guidance");
            }}
            className="mt-2 flex h-9 items-center justify-center gap-2 rounded-full border border-black bg-black text-[9px] font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,.22),inset_0_-10px_20px_rgba(0,0,0,.42),0_10px_24px_rgba(0,0,0,.16)] active:scale-[0.99]"
          >
            <Glyph name="shield" className="h-3.5 w-3.5" />
            {hasOpenAdvisory
              ? "Review safety guidance"
              : "Send safety guidance"}
          </button>
        ) : (
          <div
            className={`mt-2 text-center text-[7.5px] font-semibold leading-[1.4] ${mutedText}`}
          >
            {access.version === "v1" && access.aud === "contacts"
              ? "This older map link remains view-only. Use a fresh Visit email link to send safety guidance."
              : status === "ended"
                ? "Safety guidance closes when the Visit ends."
                : "Live map access is view-only for this signed audience."}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 w-screen overflow-hidden bg-[#e9edf1] text-rendering-optimizeLegibility"
      style={{
        height: "100dvh",
        minHeight: "100dvh",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontFeatureSettings: "'cv02','cv03','cv04','cv11'",
      }}
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
              background: darkTheme ? "#111214" : "#e9edf1",
            }}
          />

          {showMobileSheet ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-[14px] z-30 px-3">
              <section
                data-sk-mobile-sheet="1"
                className={`pointer-events-auto mx-auto h-[190px] w-full max-w-[640px] overflow-hidden rounded-[30px] border p-3.5 shadow-[0_26px_70px_rgba(0,0,0,.24),inset_0_1px_0_rgba(255,255,255,.30)] backdrop-blur-[26px] ${glassBorder} ${glassSurface}`}
              >
                <PanelBody />
              </section>
            </div>
          ) : null}
        </div>
      ) : (
        <div
          className={`absolute inset-0 z-0 grid place-items-center px-4 ${darkTheme ? "bg-[#0d0e10]" : "bg-[#edf0f3]"}`}
        >
          <section
            className={`w-full max-w-[620px] rounded-[30px] border p-5 shadow-[0_24px_70px_rgba(0,0,0,.18),inset_0_1px_0_rgba(255,255,255,.25)] ${glassBorder} ${glassSurface}`}
          >
            <VisitorIdentity />
            <div className={`mt-4 rounded-[20px] border p-4 ${insetSurface}`}>
              <div
                className={`text-[9px] font-black uppercase tracking-[0.2em] ${mutedText}`}
              >
                {locationHeading}
              </div>
              <div className={`mt-2 text-[17px] font-black ${cardText}`}>
                {placeLabel}
              </div>
              <div className={`mt-2 text-[11px] font-semibold ${mutedText}`}>
                {browserHint ||
                  "The full map preview is unavailable in this browser."}
              </div>
              {mapHref ? (
                <a
                  href={mapHref}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-black px-5 text-[10px] font-black text-white"
                >
                  Open location
                </a>
              ) : null}
            </div>
          </section>
        </div>
      )}

      <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2">
        <div className="min-w-[132px] rounded-[23px] border border-white/75 bg-white/72 px-4 py-2.5 shadow-[0_16px_40px_rgba(0,0,0,.16),inset_0_1px_0_rgba(255,255,255,.92)] backdrop-blur-2xl">
          <div className="flex flex-col items-center justify-center">
            <img
              src="/6logo.png"
              alt="StayKnown"
              className="h-5 w-5 object-contain"
            />
            <div className="mt-1 text-[8px] font-black uppercase tracking-[0.31em] text-black/55">
              StayKnown
            </div>
          </div>
        </div>
      </div>

      {showSpinner ? (
        <div className="absolute left-1/2 top-[90px] z-20 -translate-x-1/2 rounded-full border border-white/65 bg-white/55 p-3 shadow-lg backdrop-blur-xl">
          <PremiumSpinner />
        </div>
      ) : null}

      {mapLoadError ? (
        <div className="absolute left-1/2 top-[120px] z-20 max-w-[calc(100%-28px)] -translate-x-1/2">
          <div
            className={`rounded-full border px-3 py-2 shadow-md backdrop-blur-xl ${mapRetrying ? "border-white/75 bg-white/75" : "border-red-200 bg-red-50/92"}`}
          >
            <span
              className={`block truncate text-[9px] font-black tracking-[0.08em] ${mapRetrying ? "text-black/62" : "text-red-600"}`}
            >
              {mapLoadError}
            </span>
          </div>
        </div>
      ) : null}

      {!isPhone && renderMode === "map" && mapReady ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-7 z-30 px-4">
          <section
            className={`pointer-events-auto mx-auto h-[168px] w-full max-w-[1120px] overflow-hidden rounded-[32px] border p-4 shadow-[0_30px_80px_rgba(0,0,0,.22),inset_0_1px_0_rgba(255,255,255,.32)] backdrop-blur-[28px] ${glassBorder} ${glassSurface}`}
          >
            <PanelBody />
          </section>
        </div>
      ) : null}

      <div
        className={`absolute right-4 z-40 flex flex-col gap-2 transition-opacity ${showZoomControls ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"} ${isPhone ? mobileZoomBottom : "bottom-[210px]"}`}
      >
        {[
          {
            label: "Zoom in",
            symbol: "+",
            action: () => mapRef.current?.zoomIn({ duration: 220 }),
          },
          {
            label: "Zoom out",
            symbol: "−",
            action: () => mapRef.current?.zoomOut({ duration: 220 }),
          },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            aria-label={item.label}
            disabled={!mapReady || renderMode !== "map"}
            onClick={item.action}
            className="grid h-8 w-8 place-items-center rounded-[14px] border border-white/60 bg-white/62 text-[16px] font-black text-black/66 shadow-[0_12px_28px_rgba(0,0,0,.14),inset_0_1px_0_rgba(255,255,255,.86)] backdrop-blur-xl disabled:opacity-35"
          >
            {item.symbol}
          </button>
        ))}
      </div>

      {accessGateOpen && !accessAccepted ? (
        <div className="absolute inset-0 z-[90] grid place-items-center overflow-y-auto bg-black/52 px-4 py-6 backdrop-blur-lg">
          <section
            className={`relative w-full max-w-[590px] overflow-hidden rounded-[34px] border p-5 shadow-[0_34px_120px_rgba(0,0,0,.42),inset_0_1px_0_rgba(255,255,255,.28)] md:p-7 ${glassBorder} ${glassSurface}`}
          >
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/65 to-transparent" />

            <div className="flex items-start gap-3.5">
              <div
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-[17px] border shadow-[inset_0_1px_0_rgba(255,255,255,.30),inset_0_-12px_24px_rgba(0,0,0,.16)] ${insetSurface} ${cardText}`}
              >
                <Glyph name="shield" className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className={`text-[9px] font-black uppercase tracking-[0.28em] ${mutedText}`}
                >
                  Signed Visit map access
                </div>
                <h1
                  className={`mt-1.5 text-[23px] font-black leading-[1.1] tracking-[-0.035em] md:text-[27px] ${cardText}`}
                >
                  Protect, never control
                </h1>
                <p
                  className={`mt-2 text-[11px] font-semibold leading-[1.65] md:text-[12px] ${mutedText}`}
                >
                  This map is provided for legitimate, consent-based safety
                  support involving someone you know or are directly responsible
                  for protecting.
                </p>
              </div>
            </div>

            <div
              className={`mt-4 max-h-[250px] overflow-y-auto rounded-[22px] border p-4 sk-scroll-hidden ${insetSurface}`}
            >
              <div
                className={`text-[9px] font-black uppercase tracking-[0.20em] ${mutedText}`}
              >
                Safety and lawful-use policy
              </div>
              <div className="mt-3 grid gap-2">
                {[
                  "Do not stalk, secretly monitor, harass, punish, frighten, or control another person’s lawful movement.",
                  "Do not lure someone, fabricate danger, falsely describe a route or area, test them, or send manipulative instructions.",
                  "Use safety guidance only when you have a genuine concern. Verify through trusted methods and never place yourself at risk.",
                  "Map access, consent decisions, guidance, messages, timestamps, and responses may be recorded for safety review, abuse prevention, investigation, and lawful reporting.",
                ].map((line) => (
                  <div key={line} className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${insetSurface} ${cardText}`}
                    >
                      <Glyph name="check" className="h-3 w-3" />
                    </span>
                    <span
                      className={`text-[10px] font-semibold leading-[1.55] ${cardText}`}
                    >
                      {line}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <label
              className={`mt-4 flex cursor-pointer items-start gap-3 rounded-[19px] border p-3 ${insetSurface}`}
            >
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(event) => setConsentChecked(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-black"
              />
              <span
                className={`text-[10px] font-bold leading-[1.55] ${cardText}`}
              >
                I understand and accept this safety-use policy. I confirm that
                my access and any guidance I send are for a genuine, lawful
                safety reason.
              </span>
            </label>

            {consentError ? (
              <div className="mt-3 rounded-[15px] border border-red-200 bg-red-50 px-3 py-2 text-center text-[9px] font-bold text-red-600">
                {consentError}
              </div>
            ) : null}

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={consentRecording}
                onClick={() => void declineAccess()}
                className={`h-11 rounded-full border text-[10px] font-black transition active:scale-[0.99] disabled:opacity-40 ${insetSurface} ${cardText}`}
              >
                Decline
              </button>
              <button
                type="button"
                disabled={!consentChecked || consentRecording}
                onClick={() => void recordAccessDecision("accepted")}
                className="h-11 rounded-full border border-black bg-black text-[10px] font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,.20),inset_0_-10px_22px_rgba(0,0,0,.42),0_12px_28px_rgba(0,0,0,.18)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-35"
              >
                {consentRecording ? "Recording…" : "Accept and open map"}
              </button>
            </div>

            <div
              className={`mt-4 text-center text-[7.5px] font-semibold leading-[1.5] ${mutedText}`}
            >
              StayKnown does not replace emergency services. Misuse may lead to
              access restriction, account action, evidence preservation,
              investigation, or reporting where required.
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
