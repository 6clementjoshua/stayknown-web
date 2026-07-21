"use client";

import React from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export type ThreatAlertMapPayload = {
  alertId: string;
  ownerName: string;
  ownerFirstName?: string;
  ownerAvatarUrl?: string;
  ownerSafetyImageUrl?: string;
  ownerVerified?: boolean;
  ownerVerificationBadge?: string;
  status: string;
  active: boolean;
  place?: string;
  lat?: number | null;
  lng?: number | null;
  accuracyMeters?: number | null;
  locationStatus?: string;
  triggeredAt?: string;
  activatedAt?: string;
  expiresAt?: string;
  resolvedAt?: string;
  externalMapUrl?: string;
  recipientsCount?: number;
  respondedCount?: number;
  receivedCount?: number;
  checkingCount?: number;
  contactedEmergencyHelpCount?: number;
  unableToRespondCount?: number;
  caution?: string;
};

type Props = {
  alert: ThreatAlertMapPayload;
};

type MapState = "loading" | "ready" | "fallback";

type PreparedAssets = {
  ready: boolean;
  logo: string;
  avatar: string;
  safety: string;
};

const ORIGINAL_LOGO_ENDPOINT = "/api/stayknown-logo";

const DEFAULT_CAUTION =
  "StayKnown cannot independently confirm that an emergency is occurring. " +
  "Contact the person through a trusted method first and verify with a nearby " +
  "trusted person when possible. If you believe there is immediate danger, " +
  "contact the appropriate local emergency service. Do not travel alone or " +
  "place yourself at risk based only on this alert.";

const MAP_LOAD_TIMEOUT_MS = 16000;

function safeText(value: unknown): string {
  if (value == null) return "";
  const text = String(value).trim();
  return text.toLowerCase() === "null" ? "" : text;
}

function finiteNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatCoordinates(lat: number | null, lng: number | null): string {
  if (lat == null || lng == null) return "";
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

function formatDateTime(value?: string): string {
  const clean = safeText(value);
  if (!clean) return "Time unavailable";

  const date = new Date(clean);
  if (Number.isNaN(date.getTime())) return "Time unavailable";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function accuracyCopy(value: number | null): {
  label: string;
  detail: string;
  zoom: number;
} {
  if (value == null || value <= 0) {
    return {
      label: "Accuracy unavailable",
      detail: "The device did not provide a reliable accuracy estimate.",
      zoom: 14.1,
    };
  }

  if (value <= 80) {
    return {
      label: `Precise GPS • ±${Math.round(value)} m`,
      detail: "This was a relatively precise device location when sent.",
      zoom: 16.3,
    };
  }

  if (value <= 250) {
    return {
      label: `Approximate area • ±${Math.round(value)} m`,
      detail: "Treat this as an approximate area rather than an exact point.",
      zoom: 15.1,
    };
  }

  return {
    label: `Broad area • ±${Math.round(value)} m`,
    detail: "This is a broad last-known area and should be verified carefully.",
    zoom: 13.4,
  };
}

function statusCopy(
  statusValue: string,
  active: boolean,
): {
  label: string;
  detail: string;
} {
  const status = safeText(statusValue).toLowerCase();

  if (active || status === "active" || status === "dispatching") {
    return {
      label: status === "dispatching" ? "Sending alert" : "Threat Alert active",
      detail:
        "This alert is currently active. Verify the person’s condition through a trusted method.",
    };
  }

  switch (status) {
    case "safe":
    case "resolved_safe":
      return {
        label: "Resolved — safe",
        detail:
          "The alert owner later indicated that they were safe. This is their declaration, not independent proof.",
      };
    case "accidental":
    case "resolved_accidental":
      return {
        label: "Accidental alert",
        detail:
          "The alert was later marked accidental. Its recorded location remains available for safety history.",
      };
    case "cancelled":
    case "canceled":
      return {
        label: "Alert cancelled",
        detail:
          "This alert is no longer active. Its last recorded safety information remains visible.",
      };
    case "expired":
      return {
        label: "Alert expired",
        detail:
          "The alert’s active period ended. The sender and last recorded location remain visible.",
      };
    case "failed":
      return {
        label: "Delivery incomplete",
        detail:
          "Some delivery channels may not have completed. Verify the person directly.",
      };
    default:
      return {
        label: status ? status.replaceAll("_", " ") : "Threat Alert recorded",
        detail:
          "This alert is no longer active. Its last recorded safety information remains visible.",
      };
  }
}

function initialOf(name: string): string {
  return safeText(name).slice(0, 1).toUpperCase() || "S";
}

async function decodeObjectUrl(objectUrl: string): Promise<boolean> {
  const image = new window.Image();
  image.decoding = "async";
  image.src = objectUrl;

  try {
    if (typeof image.decode === "function") {
      await Promise.race([
        image.decode(),
        new Promise<never>((_, reject) => {
          window.setTimeout(
            () => reject(new Error("image_decode_timeout")),
            4500,
          );
        }),
      ]);
    } else {
      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(
          () => reject(new Error("image_load_timeout")),
          4500,
        );

        image.onload = () => {
          window.clearTimeout(timeout);
          resolve();
        };

        image.onerror = () => {
          window.clearTimeout(timeout);
          reject(new Error("image_load_failed"));
        };
      });
    }

    return true;
  } catch {
    return false;
  } finally {
    image.onload = null;
    image.onerror = null;
  }
}

async function fetchImageObjectUrl(url: string): Promise<string> {
  const cleanUrl = safeText(url);
  if (!cleanUrl) return "";

  const attempts = 3;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 7000);

    try {
      const separator = cleanUrl.includes("?") ? "&" : "?";
      const requestUrl =
        attempt === 0 ? cleanUrl : `${cleanUrl}${separator}retry=${attempt}`;

      const response = await fetch(requestUrl, {
        method: "GET",
        cache: attempt === 0 ? "default" : "reload",
        credentials: "same-origin",
        signal: controller.signal,
        headers: {
          Accept:
            "image/avif,image/webp,image/png,image/jpeg,image/*,*/*;q=0.8",
        },
      });

      if (!response.ok) {
        throw new Error(`image_http_${response.status}`);
      }

      const blob = await response.blob();
      if (!blob.type.startsWith("image/")) {
        throw new Error("image_content_type_invalid");
      }

      const objectUrl = URL.createObjectURL(blob);
      const decoded = await decodeObjectUrl(objectUrl);

      if (decoded) {
        return objectUrl;
      }

      URL.revokeObjectURL(objectUrl);
    } catch {
      // Retry below. The existing modal remains hidden until preparation ends.
    } finally {
      window.clearTimeout(timeout);
    }

    if (attempt < attempts - 1) {
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 180 * (attempt + 1));
      });
    }
  }

  return "";
}

function PreparedImage({
  src,
  fallbackLogo,
  alt,
  className,
  useInitialFallback = false,
}: {
  src: string;
  fallbackLogo: string;
  alt: string;
  className: string;
  useInitialFallback?: boolean;
}) {
  const finalSource = src || fallbackLogo;

  return (
    <div className={className} role="img" aria-label={alt}>
      {finalSource ? (
        <img src={finalSource} alt="" aria-hidden="true" draggable={false} />
      ) : useInitialFallback ? (
        <span className="sk-threat-initial">{initialOf(alt)}</span>
      ) : (
        <span className="sk-threat-wordmark-fallback">STAYKNOWN</span>
      )}
    </div>
  );
}

function createMarkerElement(params: {
  avatarUrl: string;
  logoUrl: string;
  ownerName: string;
  active: boolean;
}): HTMLDivElement {
  const root = document.createElement("div");
  root.className = "sk-threat-marker";
  root.setAttribute("aria-label", `${params.ownerName} Threat Alert location`);

  if (params.active) {
    for (let index = 0; index < 3; index += 1) {
      const ring = document.createElement("div");
      ring.className = `sk-threat-marker-ring sk-threat-marker-ring-${index + 1}`;
      root.appendChild(ring);
    }
  }

  const halo = document.createElement("div");
  halo.className = "sk-threat-marker-halo";
  root.appendChild(halo);

  const imageFrame = document.createElement("div");
  imageFrame.className = "sk-threat-marker-image-frame";

  const source = params.avatarUrl || params.logoUrl;

  if (source) {
    const image = document.createElement("img");
    image.src = source;
    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    image.draggable = false;
    image.className = params.avatarUrl
      ? "sk-threat-marker-image sk-threat-marker-image-avatar"
      : "sk-threat-marker-image sk-threat-marker-image-logo";

    imageFrame.appendChild(image);
  } else {
    const initial = document.createElement("span");
    initial.className = "sk-threat-marker-initial";
    initial.textContent = initialOf(params.ownerName);
    imageFrame.appendChild(initial);
  }

  root.appendChild(imageFrame);

  const pointer = document.createElement("div");
  pointer.className = "sk-threat-marker-pointer";
  root.appendChild(pointer);

  return root;
}

function StaticMarker({
  avatarUrl,
  logoUrl,
  ownerName,
}: {
  avatarUrl: string;
  logoUrl: string;
  ownerName: string;
}) {
  return (
    <div
      className="sk-threat-marker"
      aria-label={`${ownerName} Threat Alert location`}
    >
      <div className="sk-threat-marker-halo" />
      <div className="sk-threat-marker-image-frame">
        <PreparedImage
          src={avatarUrl}
          fallbackLogo={logoUrl}
          alt={ownerName}
          className="sk-threat-marker-react-image"
          useInitialFallback
        />
      </div>
      <div className="sk-threat-marker-pointer" />
    </div>
  );
}

function VerifiedBadge({
  verified,
  badgeType,
}: {
  verified: boolean;
  badgeType?: string;
}) {
  if (!verified) return null;

  const normalized = safeText(badgeType).toLowerCase();
  const official =
    normalized.includes("official") ||
    normalized.includes("public") ||
    normalized.includes("government") ||
    normalized.includes("organisation") ||
    normalized.includes("organization");

  return (
    <span
      className={
        official
          ? "sk-threat-verified sk-threat-verified-official"
          : "sk-threat-verified"
      }
      title={
        official ? "Verified official or public body" : "Verified individual"
      }
      aria-label={
        official ? "Verified official or public body" : "Verified individual"
      }
    >
      ✓
    </span>
  );
}

export default function ThreatAlertMapClient({ alert }: Props) {
  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<maplibregl.Map | null>(null);
  const markerRef = React.useRef<maplibregl.Marker | null>(null);

  const [mapState, setMapState] = React.useState<MapState>("loading");
  const [mapMessage, setMapMessage] = React.useState(
    "Preparing the recorded Threat Alert location…",
  );
  const [safetyPreviewOpen, setSafetyPreviewOpen] = React.useState(false);
  const [assets, setAssets] = React.useState<PreparedAssets>({
    ready: false,
    logo: "",
    avatar: "",
    safety: "",
  });

  const avatarEndpoint = safeText(alert.ownerAvatarUrl);
  const safetyEndpoint = safeText(alert.ownerSafetyImageUrl);

  const lat = finiteNumber(alert.lat);
  const lng = finiteNumber(alert.lng);

  const hasLocation =
    lat != null &&
    lng != null &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180;

  const accuracy = finiteNumber(alert.accuracyMeters);
  const accuracyInfo = accuracyCopy(accuracy);
  const statusInfo = statusCopy(alert.status, alert.active);

  const place =
    safeText(alert.place) ||
    (hasLocation
      ? formatCoordinates(lat, lng)
      : "A confirmed location was not attached when this alert was sent.");

  const responseTotal = Math.max(
    Number(alert.respondedCount || 0),
    Number(alert.receivedCount || 0) +
      Number(alert.checkingCount || 0) +
      Number(alert.contactedEmergencyHelpCount || 0) +
      Number(alert.unableToRespondCount || 0),
  );

  const displayTime =
    alert.triggeredAt || alert.activatedAt || alert.expiresAt || "";

  const safetyImage = assets.safety || assets.avatar;

  const tomtomKey = safeText(process.env.NEXT_PUBLIC_TOMTOM_API_KEY);
  const staticMapUrl =
    hasLocation && lat != null && lng != null && tomtomKey
      ? `https://api.tomtom.com/map/1/staticimage` +
        `?key=${encodeURIComponent(tomtomKey)}` +
        `&center=${encodeURIComponent(`${lng},${lat}`)}` +
        `&zoom=${encodeURIComponent(String(accuracyInfo.zoom))}` +
        `&format=png&layer=basic&style=main` +
        `&width=1300&height=748&view=Unified`
      : "";

  React.useEffect(() => {
    let cancelled = false;
    const objectUrls: string[] = [];

    async function prepare() {
      const [logo, avatar, safety] = await Promise.all([
        fetchImageObjectUrl(ORIGINAL_LOGO_ENDPOINT).catch(() => ""),
        fetchImageObjectUrl(avatarEndpoint).catch(() => ""),
        fetchImageObjectUrl(safetyEndpoint).catch(() => ""),
      ]);

      for (const value of [logo, avatar, safety]) {
        if (value) objectUrls.push(value);
      }

      if (cancelled) {
        objectUrls.forEach((value) => URL.revokeObjectURL(value));
        return;
      }

      setAssets({
        ready: true,
        logo,
        avatar,
        safety,
      });
    }

    void prepare();

    return () => {
      cancelled = true;
      objectUrls.forEach((value) => URL.revokeObjectURL(value));
    };
  }, [avatarEndpoint, safetyEndpoint]);

  React.useEffect(() => {
    if (!safetyPreviewOpen) return;

    const previousOverflow = document.body.style.overflow;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSafetyPreviewOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [safetyPreviewOpen]);

  const recenter = React.useCallback(() => {
    if (!mapRef.current || !hasLocation || lat == null || lng == null) return;

    mapRef.current.easeTo({
      center: [lng, lat],
      zoom: accuracyInfo.zoom,
      duration: 650,
      essential: true,
    });
  }, [accuracyInfo.zoom, hasLocation, lat, lng]);

  React.useEffect(() => {
    if (!assets.ready || !mapContainerRef.current) return;

    if (!hasLocation || lat == null || lng == null) {
      setMapState("fallback");
      setMapMessage("No confirmed coordinates were attached to this alert.");
      return;
    }

    const styleUrl = safeText(process.env.NEXT_PUBLIC_TOMTOM_STYLE_URL);
    const apiKey = safeText(process.env.NEXT_PUBLIC_TOMTOM_API_KEY);

    if (!styleUrl || !apiKey) {
      setMapState("fallback");
      setMapMessage(
        "The interactive map is unavailable, so StayKnown is showing the recorded map view.",
      );
      return;
    }

    let disposed = false;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    try {
      setMapState("loading");
      setMapMessage("Loading the recorded Threat Alert location…");

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: styleUrl,
        center: [lng, lat],
        zoom: accuracyInfo.zoom,
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
            "TomTom-Api-Key": apiKey,
          },
        }),
      });

      mapRef.current = map;

      const marker = new maplibregl.Marker({
        element: createMarkerElement({
          avatarUrl: assets.avatar,
          logoUrl: assets.logo,
          ownerName: alert.ownerName,
          active: alert.active,
        }),
        anchor: "bottom",
      })
        .setLngLat([lng, lat])
        .addTo(map);

      markerRef.current = marker;

      timeout = setTimeout(() => {
        if (disposed) return;
        setMapState("fallback");
        setMapMessage(
          "The interactive map took too long to load, so StayKnown is showing the recorded map view.",
        );
      }, MAP_LOAD_TIMEOUT_MS);

      map.once("load", () => {
        if (disposed) return;
        if (timeout) clearTimeout(timeout);

        setMapState("ready");
        setMapMessage("");

        map.resize();
        window.requestAnimationFrame(() => map.resize());

        window.setTimeout(() => {
          map.resize();
        }, 180);
      });

      map.on("error", () => {
        if (disposed) return;
        setMapState("fallback");
        setMapMessage(
          "The interactive map could not load here, so StayKnown is showing the recorded map view.",
        );
      });
    } catch {
      setMapState("fallback");
      setMapMessage(
        "The interactive map could not load here, so StayKnown is showing the recorded map view.",
      );
    }

    return () => {
      disposed = true;

      if (timeout) clearTimeout(timeout);

      try {
        markerRef.current?.remove();
      } catch {}

      markerRef.current = null;

      try {
        mapRef.current?.remove();
      } catch {}

      mapRef.current = null;
    };
  }, [
    accuracyInfo.zoom,
    alert.active,
    alert.ownerName,
    assets.avatar,
    assets.logo,
    assets.ready,
    hasLocation,
    lat,
    lng,
  ]);

  const showPanel = assets.ready;

  return (
    <main className="sk-threat-root">
      <style jsx global>{`
        :root {
          color-scheme: light;
        }

        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          min-height: 100%;
          background: #e7ebee;
        }

        body {
          overflow: hidden;
        }

        .sk-threat-root {
          position: relative;
          min-height: 100dvh;
          overflow: hidden;
          color: #111318;
          background: #e7ebee;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .sk-threat-map,
        .sk-threat-map-static {
          position: fixed;
          inset: 0;
          width: 100%;
          min-height: 100dvh;
        }

        .sk-threat-map {
          z-index: 1;
          background: #e3e7ea;
        }

        .sk-threat-map::after,
        .sk-threat-map-static::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.26) 0%,
            transparent 22%,
            transparent 66%,
            rgba(0, 0, 0, 0.12) 100%
          );
        }

        .sk-threat-map-static {
          z-index: 2;
          overflow: hidden;
          background-color: #dfe4e8;
          background-position: center;
          background-repeat: no-repeat;
          background-size: cover;
        }

        .sk-threat-map-static-marker {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -72%);
        }

        .sk-threat-brand {
          position: fixed;
          z-index: 20;
          top: max(14px, env(safe-area-inset-top));
          left: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 142px;
          max-width: calc(100vw - 164px);
          padding: 10px 12px 9px;
          border: 1px solid rgba(255, 255, 255, 0.88);
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.84);
          box-shadow:
            0 15px 38px rgba(0, 0, 0, 0.13),
            inset 0 1px 0 rgba(255, 255, 255, 0.98);
          text-align: center;
          backdrop-filter: blur(22px);
        }

        .sk-threat-brand-logo {
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          overflow: hidden;
          border-radius: 13px;
          background: #ffffff;
        }

        .sk-threat-brand-logo img {
          width: 100%;
          height: 100%;
          padding: 3px;
          object-fit: contain;
        }

        .sk-threat-brand-name {
          width: 100%;
          min-width: 0;
          margin-top: 6px;
          text-align: center;
        }

        .sk-threat-brand-name strong {
          display: block;
          width: 100%;
          overflow: hidden;
          text-align: center;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 1.4px;
        }

        .sk-threat-brand-name span {
          display: block;
          width: 100%;
          margin-top: 4px;
          overflow: hidden;
          color: rgba(17, 19, 24, 0.52);
          text-align: center;
          font-size: 6.8px;
          font-weight: 850;
          letter-spacing: 0.58px;
          line-height: 1.25;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sk-threat-status-pill {
          position: fixed;
          z-index: 20;
          top: max(17px, calc(env(safe-area-inset-top) + 3px));
          right: 14px;
          max-width: 140px;
          padding: 10px 13px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.88);
          border-radius: 999px;
          color: #33373c;
          background: rgba(255, 255, 255, 0.86);
          box-shadow:
            0 15px 38px rgba(0, 0, 0, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.98);
          font-size: 8.5px;
          font-weight: 950;
          letter-spacing: 0.75px;
          text-overflow: ellipsis;
          text-transform: uppercase;
          white-space: nowrap;
          backdrop-filter: blur(22px);
        }

        .sk-threat-status-pill-active {
          color: #ffffff;
          background: rgba(17, 17, 17, 0.94);
          border-color: rgba(255, 255, 255, 0.17);
        }

        .sk-threat-controls {
          position: fixed;
          z-index: 20;
          top: 82px;
          right: 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sk-threat-control {
          width: 42px;
          height: 42px;
          border: 1px solid rgba(255, 255, 255, 0.88);
          border-radius: 15px;
          color: #111318;
          background: rgba(255, 255, 255, 0.86);
          box-shadow:
            0 13px 30px rgba(0, 0, 0, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.98);
          cursor: pointer;
          font-size: 20px;
          font-weight: 800;
          backdrop-filter: blur(20px);
        }

        .sk-threat-control:active {
          transform: scale(0.96);
        }

        .sk-threat-loading {
          position: fixed;
          z-index: 40;
          top: 50%;
          left: 50%;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 12px 15px;
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 999px;
          color: #111318;
          background: rgba(255, 255, 255, 0.86);
          box-shadow:
            0 18px 44px rgba(0, 0, 0, 0.14),
            inset 0 1px 0 rgba(255, 255, 255, 0.98);
          transform: translate(-50%, -50%);
          font-size: 9px;
          font-weight: 900;
          backdrop-filter: blur(22px);
        }

        .sk-threat-loading-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #111318;
          animation: skThreatLoading 1s ease-in-out infinite alternate;
        }

        .sk-threat-panel {
          position: fixed;
          z-index: 30;
          left: 24px;
          right: 24px;
          bottom: max(24px, env(safe-area-inset-bottom));
          width: min(1180px, calc(100vw - 48px));
          max-height: min(48dvh, 450px);
          margin: 0 auto;
          overflow: auto;
          border: 1px solid rgba(255, 255, 255, 0.92);
          border-radius: 32px;
          background: linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.97),
            rgba(235, 238, 241, 0.92)
          );
          box-shadow:
            0 34px 90px rgba(0, 0, 0, 0.24),
            inset 0 1px 0 rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(28px);
          scrollbar-width: none;
        }

        .sk-threat-panel::-webkit-scrollbar {
          display: none;
        }

        .sk-threat-panel-inner {
          display: grid;
          grid-template-columns:
            minmax(300px, 1.18fr)
            minmax(210px, 0.78fr)
            minmax(350px, 1.2fr);
          grid-template-areas:
            "identity identity identity"
            "location safety response"
            "legal legal legal";
          gap: 12px;
          padding: 16px;
        }

        .sk-threat-primary-column {
          display: contents;
        }

        .sk-threat-identity {
          grid-area: identity;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sk-threat-avatar {
          position: relative;
          display: grid;
          place-items: center;
          flex: 0 0 58px;
          width: 58px;
          height: 58px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.96);
          border-radius: 21px;
          color: #ffffff;
          background: #111318;
          box-shadow:
            0 15px 28px rgba(0, 0, 0, 0.17),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .sk-threat-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sk-threat-initial {
          font-size: 21px;
          font-weight: 950;
        }

        .sk-threat-wordmark-fallback {
          display: grid;
          place-items: center;
          width: 100%;
          height: 100%;
          padding: 5px;
          color: #111318;
          background: #ffffff;
          font-size: 6px;
          font-weight: 950;
          letter-spacing: 0.7px;
        }

        .sk-threat-identity-copy {
          min-width: 0;
          flex: 1;
        }

        .sk-threat-kicker {
          color: rgba(17, 19, 24, 0.5);
          font-size: 8px;
          font-weight: 950;
          letter-spacing: 1.45px;
          text-transform: uppercase;
        }

        .sk-threat-owner-name {
          display: flex;
          align-items: center;
          min-width: 0;
          gap: 6px;
          margin-top: 4px;
        }

        .sk-threat-owner-name h1 {
          min-width: 0;
          margin: 0;
          overflow: hidden;
          font-size: 19px;
          font-weight: 950;
          letter-spacing: -0.35px;
          line-height: 1.1;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sk-threat-triggered-time {
          margin-top: 5px;
          color: rgba(17, 19, 24, 0.56);
          font-size: 10px;
          font-weight: 750;
        }

        .sk-threat-verified {
          display: inline-grid;
          place-items: center;
          flex: 0 0 auto;
          width: 17px;
          height: 17px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          border-radius: 999px;
          color: #ffffff;
          background: #111318;
          font-size: 9px;
          font-weight: 950;
        }

        .sk-threat-verified-official {
          background: #747980;
        }

        .sk-threat-location-card {
          grid-area: location;
          min-width: 0;
          margin: 0;
          padding: 16px;
          border: 1px solid rgba(0, 0, 0, 0.065);
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.66);
        }

        .sk-threat-location-card h2 {
          margin: 6px 0 0;
          font-size: 14px;
          font-weight: 950;
          line-height: 1.42;
        }

        .sk-threat-location-card p {
          margin: 7px 0 0;
          color: rgba(17, 19, 24, 0.56);
          font-size: 10.5px;
          font-weight: 700;
          line-height: 1.5;
        }

        .sk-threat-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
          margin-top: 10px;
        }

        .sk-threat-stat {
          min-width: 0;
          padding: 10px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 17px;
          background: rgba(255, 255, 255, 0.54);
        }

        .sk-threat-stat span {
          display: block;
          overflow: hidden;
          color: rgba(17, 19, 24, 0.48);
          font-size: 7px;
          font-weight: 950;
          letter-spacing: 0.9px;
          text-overflow: ellipsis;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .sk-threat-stat strong {
          display: block;
          margin-top: 5px;
          overflow: hidden;
          font-size: 10px;
          font-weight: 900;
          line-height: 1.35;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sk-threat-expanded {
          display: contents;
        }

        .sk-threat-safety-image {
          grid-area: safety;
          display: grid;
          place-items: center;
          align-self: stretch;
          min-width: 0;
          min-height: 0;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.065);
          border-radius: 22px;
          color: #ffffff;
          background: #111318;
        }

        .sk-threat-safety-image img {
          width: 100%;
          height: 100%;
          min-height: 0;
          object-fit: cover;
        }

        .sk-threat-response-panel {
          grid-area: response;
          min-width: 0;
        }

        .sk-threat-response-panel .sk-threat-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .sk-threat-mobile-feature-avatar {
          display: none;
        }

        .sk-threat-guidance {
          padding: 15px;
          border-radius: 22px;
          color: #ffffff;
          background: linear-gradient(
            145deg,
            rgba(22, 22, 24, 0.98),
            rgba(4, 5, 6, 0.96)
          );
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            inset 0 -16px 30px rgba(0, 0, 0, 0.35);
        }

        .sk-threat-guidance strong {
          display: block;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: 1.15px;
          text-transform: uppercase;
        }

        .sk-threat-guidance p {
          margin: 9px 0 0;
          color: rgba(255, 255, 255, 0.76);
          font-size: 10px;
          font-weight: 650;
          line-height: 1.58;
        }

        .sk-threat-status-detail {
          margin-top: 10px;
          padding: 11px 12px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 17px;
          color: rgba(17, 19, 24, 0.6);
          background: rgba(255, 255, 255, 0.5);
          font-size: 9.5px;
          font-weight: 700;
          line-height: 1.48;
        }

        .sk-threat-legal {
          grid-area: legal;
          margin: 0 4px;
          color: rgba(17, 19, 24, 0.42);
          text-align: center;
          font-size: 7.5px;
          font-weight: 700;
          line-height: 1.45;
        }

        .sk-threat-marker {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 96px;
          height: 108px;
        }

        .sk-threat-marker-ring {
          position: absolute;
          top: 8px;
          left: 50%;
          width: 58px;
          height: 58px;
          border: 1.2px solid rgba(80, 83, 88, 0.42);
          border-radius: 999px;
          opacity: 0;
          transform: translateX(-50%) scale(0.72);
          animation: skThreatRadar 3s ease-out infinite;
        }

        .sk-threat-marker-ring-2 {
          animation-delay: 0.85s;
        }

        .sk-threat-marker-ring-3 {
          animation-delay: 1.7s;
        }

        .sk-threat-marker-halo {
          position: absolute;
          top: 13px;
          left: 50%;
          width: 66px;
          height: 66px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.3);
          box-shadow: 0 0 0 9px rgba(255, 255, 255, 0.13);
          transform: translateX(-50%);
          backdrop-filter: blur(9px);
        }

        .sk-threat-marker-image-frame {
          position: absolute;
          z-index: 3;
          top: 18px;
          left: 50%;
          display: grid;
          place-items: center;
          width: 56px;
          height: 56px;
          overflow: hidden;
          border: 2px solid rgba(255, 255, 255, 0.98);
          border-radius: 999px;
          color: #ffffff;
          background: #111318;
          box-shadow:
            0 16px 30px rgba(0, 0, 0, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.26);
          transform: translateX(-50%);
        }

        .sk-threat-marker-react-image {
          width: 100%;
          height: 100%;
        }

        .sk-threat-marker-react-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sk-threat-marker-react-image .sk-threat-wordmark-fallback {
          font-size: 5px;
        }

        .sk-threat-marker-image {
          width: 100%;
          height: 100%;
        }

        .sk-threat-marker-image-avatar {
          object-fit: cover;
        }

        .sk-threat-marker-image-logo {
          padding: 8px;
          object-fit: contain;
          background: #ffffff;
        }

        .sk-threat-marker-initial {
          font-size: 20px;
          font-weight: 950;
        }

        .sk-threat-marker-pointer {
          position: absolute;
          z-index: 2;
          top: 65px;
          left: 50%;
          width: 18px;
          height: 18px;
          border-right: 2px solid rgba(255, 255, 255, 0.96);
          border-bottom: 2px solid rgba(255, 255, 255, 0.96);
          background: #111318;
          transform: translateX(-50%) rotate(45deg);
          box-shadow: 8px 8px 16px rgba(0, 0, 0, 0.14);
        }

        .sk-threat-image-preview-backdrop {
          position: fixed;
          z-index: 100;
          inset: 0;
          display: grid;
          place-items: center;
          padding: max(24px, env(safe-area-inset-top)) 18px
            max(24px, env(safe-area-inset-bottom));
          background: rgba(8, 9, 11, 0.62);
          backdrop-filter: blur(18px);
        }

        .sk-threat-image-preview-card {
          position: relative;
          width: min(86vw, 520px);
          max-height: min(82dvh, 720px);
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.88);
          border-radius: 30px;
          background: #ffffff;
          box-shadow:
            0 34px 100px rgba(0, 0, 0, 0.34),
            inset 0 1px 0 rgba(255, 255, 255, 0.98);
        }

        .sk-threat-image-preview-close {
          position: absolute;
          z-index: 3;
          top: 12px;
          right: 12px;
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 999px;
          color: #111318;
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.18);
          cursor: pointer;
          font-size: 25px;
          font-weight: 500;
          line-height: 1;
        }

        .sk-threat-image-preview-photo {
          display: grid;
          place-items: center;
          width: 100%;
          min-height: 320px;
          max-height: min(68dvh, 610px);
          overflow: hidden;
          background: #ffffff;
        }

        .sk-threat-image-preview-photo img {
          display: block;
          width: 100%;
          height: 100%;
          max-height: min(68dvh, 610px);
          object-fit: contain;
          object-position: center;
          background: #ffffff;
        }

        .sk-threat-image-preview-photo .sk-threat-initial {
          display: grid;
          place-items: center;
          width: 100%;
          min-height: 320px;
          color: #111318;
          background: #ffffff;
          font-size: 48px;
        }

        .sk-threat-image-preview-caption {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 14px 18px 17px;
          border-top: 1px solid rgba(0, 0, 0, 0.07);
          text-align: center;
        }

        .sk-threat-image-preview-caption strong {
          font-size: 14px;
          font-weight: 950;
        }

        .sk-threat-image-preview-caption span {
          color: rgba(17, 19, 24, 0.54);
          font-size: 9px;
          font-weight: 700;
        }

        @keyframes skThreatRadar {
          0% {
            opacity: 0;
            transform: translateX(-50%) scale(0.72);
          }
          18% {
            opacity: 0.65;
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) scale(1.62);
          }
        }

        @keyframes skThreatLoading {
          from {
            opacity: 0.3;
            transform: scale(0.78);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (max-width: 680px), (pointer: coarse) and (max-width: 1100px) {
          /*
           * Mobile branding:
           * centered on the map, vertically arranged and never truncated.
           */
          .sk-threat-brand {
            top: max(12px, env(safe-area-inset-top));
            left: 50%;
            right: auto;
            width: min(238px, calc(100vw - 150px));
            max-width: none;
            padding: 10px 14px 9px;
            transform: translateX(-50%);
            text-align: center;
          }

          .sk-threat-brand-logo {
            width: 38px;
            height: 38px;
          }

          .sk-threat-brand-name {
            width: 100%;
            min-width: 0;
            margin-top: 5px;
            overflow: visible;
            text-align: center;
          }

          .sk-threat-brand-name strong {
            display: block;
            width: 100%;
            overflow: visible;
            font-size: 9.5px;
            letter-spacing: 1.25px;
            line-height: 1.2;
            text-align: center;
            text-overflow: clip;
            white-space: nowrap;
          }

          .sk-threat-brand-name span {
            display: block;
            width: 100%;
            margin-top: 4px;
            overflow: visible;
            font-size: 6.4px;
            letter-spacing: 0.22px;
            line-height: 1.25;
            text-align: center;
            text-overflow: clip;
            white-space: normal;
          }

          /*
           * Preserve the existing bottom modal while placing the permanent
           * avatar in the right-hand area:
           *
           * identity | avatar
           * location | avatar
           * response across full width
           * legal across full width
           */
          .sk-threat-panel {
            left: 10px;
            right: 10px;
            bottom: max(10px, env(safe-area-inset-bottom));
            width: calc(100vw - 20px);
            max-height: min(72dvh, 760px);
            border-radius: 29px;
          }

          .sk-threat-panel-inner {
            display: grid;
            grid-template-columns:
              minmax(0, 1fr)
              clamp(176px, 24vw, 246px);
            grid-template-areas:
              "primary safety"
              "response response"
              "legal legal";
            align-items: start;
            gap: 10px;
            padding: 13px;
          }

          .sk-threat-primary-column {
            grid-area: primary;
            display: flex;
            flex-direction: column;
            align-self: stretch;
            min-width: 0;
            gap: 10px;
          }

          /*
           * Small identity avatar:
           * a true circle with no black square/background behind it.
           */
          .sk-threat-avatar {
            flex: 0 0 48px;
            width: 48px;
            height: 48px;
            padding: 0;
            overflow: hidden;
            border: 1px solid rgba(17, 19, 24, 0.12);
            border-radius: 999px;
            color: #111318;
            background: transparent;
            box-shadow: 0 7px 16px rgba(0, 0, 0, 0.1);
          }

          .sk-threat-avatar img {
            width: 100%;
            height: 100%;
            border-radius: inherit;
            object-fit: cover;
          }

          .sk-threat-avatar .sk-threat-wordmark-fallback {
            border-radius: inherit;
          }

          .sk-threat-identity {
            align-self: start;
            width: 100%;
            min-width: 0;
            gap: 9px;
          }

          .sk-threat-owner-name h1 {
            font-size: 16px;
          }

          .sk-threat-triggered-time {
            font-size: 8.6px;
          }

          .sk-threat-location-card {
            align-self: start;
            min-width: 0;
            width: 100%;
            margin: 0;
            padding: 12px;
          }

          /*
           * The desktop Safety Gallery block is not moved or redesigned;
           * it is simply hidden on mobile. Mobile uses the user's avatar
           * permanently in the exact right-hand position requested.
           */
          .sk-threat-safety-image-desktop {
            display: none;
          }

          .sk-threat-mobile-feature-trigger {
            grid-area: safety;
            position: relative;
            align-self: stretch;
            justify-self: stretch;
            display: block;
            min-width: 0;
            min-height: 0;
            padding: 0;
            overflow: hidden;
            border: 0;
            border-radius: 24px;
            color: inherit;
            background: #ffffff;
            cursor: pointer;
            appearance: none;
          }

          .sk-threat-mobile-feature-avatar {
            display: grid;
            place-items: center;
            width: 100%;
            height: 100%;
            min-height: 0;
            padding: 0;
            overflow: hidden;
            border: 1px solid rgba(17, 19, 24, 0.12);
            border-radius: 24px;
            color: #111318;
            background: #ffffff;
            box-shadow:
              0 14px 30px rgba(0, 0, 0, 0.11),
              inset 0 1px 0 rgba(255, 255, 255, 0.94);
          }

          .sk-threat-mobile-feature-avatar img {
            display: block;
            width: 100%;
            height: 100%;
            min-height: 0;
            border-radius: inherit;
            background: #ffffff;
            object-fit: cover;
            object-position: center 12%;
          }

          .sk-threat-mobile-feature-avatar .sk-threat-initial {
            display: grid;
            place-items: center;
            width: 100%;
            height: 100%;
            min-height: 100%;
            border-radius: inherit;
            color: #111318;
            background: #ffffff;
            font-size: 34px;
          }

          .sk-threat-mobile-feature-avatar .sk-threat-wordmark-fallback {
            border-radius: inherit;
            background: #ffffff;
          }

          .sk-threat-expanded {
            display: contents;
          }

          .sk-threat-response-panel {
            grid-area: response;
            min-width: 0;
            margin-top: 0;
          }

          .sk-threat-legal {
            grid-area: legal;
            margin-top: 0;
          }

          .sk-threat-location-card .sk-threat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 6px;
          }

          .sk-threat-response-panel .sk-threat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .sk-threat-location-card .sk-threat-stat {
            padding: 8px 7px;
            border-radius: 14px;
          }

          .sk-threat-location-card h2 {
            font-size: 12.5px;
          }

          .sk-threat-location-card p {
            font-size: 9px;
            line-height: 1.4;
          }

          .sk-threat-guidance {
            padding: 12px;
            border-radius: 18px;
          }

          .sk-threat-guidance p {
            margin-top: 7px;
            font-size: 8.8px;
            line-height: 1.48;
          }

          .sk-threat-status-detail {
            margin-top: 8px;
            padding: 9px 10px;
            border-radius: 15px;
            font-size: 8.5px;
          }

          .sk-threat-response-panel .sk-threat-grid {
            gap: 6px;
            margin-top: 8px;
          }

          .sk-threat-response-panel .sk-threat-stat {
            padding: 8px;
            border-radius: 14px;
          }

          /*
           * Keep the avatar marker circular and remove any dark backing
           * visible around the profile image.
           */
          .sk-threat-marker-image-frame {
            background: #ffffff;
          }

          .sk-threat-marker-image-avatar {
            border-radius: 999px;
          }

          .sk-threat-status-pill {
            right: 10px;
            max-width: 104px;
            padding: 8px 9px;
            font-size: 7.4px;
          }
        }

        @media (max-width: 420px) {
          .sk-threat-panel-inner {
            grid-template-columns:
              minmax(0, 1fr)
              142px;
            gap: 8px;
            padding: 11px;
          }

          .sk-threat-identity {
            gap: 7px;
          }

          .sk-threat-avatar {
            flex-basis: 42px;
            width: 42px;
            height: 42px;
          }

          .sk-threat-owner-name h1 {
            font-size: 14px;
          }

          .sk-threat-location-card {
            padding: 10px;
          }

          .sk-threat-location-card .sk-threat-stat {
            padding: 7px 6px;
          }
        }

        @media (pointer: coarse) and (min-width: 620px) and (max-width: 1100px) {
          .sk-threat-panel-inner {
            grid-template-columns:
              minmax(0, 1fr)
              clamp(220px, 23vw, 300px);
          }

          .sk-threat-location-card .sk-threat-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }

          .sk-threat-location-card .sk-threat-stat {
            min-width: 0;
            padding: 8px 6px;
          }

          .sk-threat-location-card .sk-threat-stat span,
          .sk-threat-location-card .sk-threat-stat strong {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        @media (pointer: fine) and (min-width: 681px) and (max-width: 980px) {
          .sk-threat-panel {
            width: min(860px, calc(100vw - 32px));
            max-height: min(62dvh, 620px);
          }

          .sk-threat-panel-inner {
            grid-template-columns:
              minmax(280px, 1.16fr)
              minmax(190px, 0.84fr);
            grid-template-areas:
              "identity identity"
              "location safety"
              "response response"
              "legal legal";
          }

          .sk-threat-expanded {
            display: contents;
          }

          .sk-threat-response-panel {
            grid-area: response;
          }

          .sk-threat-safety-image {
            grid-area: safety;
          }
        }
      `}</style>

      <div ref={mapContainerRef} className="sk-threat-map" />

      {mapState === "fallback" ? (
        <div
          className="sk-threat-map-static"
          style={
            staticMapUrl
              ? {
                  backgroundImage:
                    `linear-gradient(rgba(255,255,255,.05), rgba(0,0,0,.05)), ` +
                    `url("${staticMapUrl}")`,
                }
              : undefined
          }
        >
          <div className="sk-threat-map-static-marker">
            <StaticMarker
              avatarUrl={assets.avatar}
              logoUrl={assets.logo}
              ownerName={alert.ownerName}
            />
          </div>
        </div>
      ) : null}

      {!assets.ready || mapState === "loading" ? (
        <div className="sk-threat-loading">
          <span className="sk-threat-loading-dot" />
          Preparing safety map and identity
        </div>
      ) : null}

      {assets.ready ? (
        <>
          <div className="sk-threat-brand">
            <PreparedImage
              src={assets.logo}
              fallbackLogo=""
              alt="StayKnown"
              className="sk-threat-brand-logo"
            />

            <div className="sk-threat-brand-name">
              <strong>STAYKNOWN™</strong>
              <span>A 6 CLEMENT JOSHUA SERVICE™</span>
            </div>
          </div>

          <div
            className={
              alert.active
                ? "sk-threat-status-pill sk-threat-status-pill-active"
                : "sk-threat-status-pill"
            }
          >
            {statusInfo.label}
          </div>
        </>
      ) : null}

      {mapState === "ready" ? (
        <div className="sk-threat-controls">
          <button
            type="button"
            className="sk-threat-control"
            aria-label="Zoom in"
            onClick={() => mapRef.current?.zoomIn({ duration: 250 })}
          >
            +
          </button>

          <button
            type="button"
            className="sk-threat-control"
            aria-label="Zoom out"
            onClick={() => mapRef.current?.zoomOut({ duration: 250 })}
          >
            −
          </button>

          <button
            type="button"
            className="sk-threat-control"
            aria-label="Recenter on alert location"
            onClick={recenter}
          >
            ◎
          </button>
        </div>
      ) : null}

      {showPanel ? (
        <section className="sk-threat-panel">
          <div className="sk-threat-panel-inner">
            <div className="sk-threat-primary-column">
              <div className="sk-threat-identity">
                <PreparedImage
                  src={assets.avatar}
                  fallbackLogo=""
                  alt={alert.ownerName}
                  className="sk-threat-avatar"
                  useInitialFallback
                />

                <div className="sk-threat-identity-copy">
                  <div className="sk-threat-kicker">Threat Alert from</div>

                  <div className="sk-threat-owner-name">
                    <h1>{alert.ownerName}</h1>

                    <VerifiedBadge
                      verified={alert.ownerVerified === true}
                      badgeType={alert.ownerVerificationBadge}
                    />
                  </div>

                  <div className="sk-threat-triggered-time">
                    Recorded {formatDateTime(displayTime)}
                  </div>
                </div>
              </div>

              <div className="sk-threat-location-card">
                <div className="sk-threat-kicker">Last confirmed location</div>

                <h2>{place}</h2>
                <p>{accuracyInfo.detail}</p>

                <div className="sk-threat-grid">
                  <div className="sk-threat-stat">
                    <span>Accuracy</span>
                    <strong>{accuracyInfo.label}</strong>
                  </div>

                  <div className="sk-threat-stat">
                    <span>Coordinates</span>
                    <strong>
                      {formatCoordinates(lat, lng) || "Not attached"}
                    </strong>
                  </div>

                  <div className="sk-threat-stat">
                    <span>Contacts alerted</span>
                    <strong>{Number(alert.recipientsCount || 0)}</strong>
                  </div>

                  <div className="sk-threat-stat">
                    <span>Responses</span>
                    <strong>{responseTotal}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="sk-threat-expanded">
              <PreparedImage
                src={safetyImage || assets.avatar}
                fallbackLogo={assets.avatar}
                alt={`${alert.ownerName} safety image`}
                className="sk-threat-safety-image sk-threat-safety-image-desktop"
                useInitialFallback
              />

              <button
                type="button"
                className="sk-threat-mobile-feature-trigger"
                aria-label={`Open ${alert.ownerName} safety image`}
                onClick={() => setSafetyPreviewOpen(true)}
              >
                <PreparedImage
                  src={safetyImage || assets.avatar}
                  fallbackLogo={assets.avatar}
                  alt={`${alert.ownerName} safety image`}
                  className="sk-threat-mobile-feature-avatar"
                  useInitialFallback
                />
              </button>

              <div className="sk-threat-response-panel">
                <div className="sk-threat-guidance">
                  <strong>Respond without risking yourself</strong>
                  <p>{safeText(alert.caution) || DEFAULT_CAUTION}</p>
                </div>

                <div className="sk-threat-status-detail">
                  <strong>{statusInfo.label}.</strong> {statusInfo.detail}
                  {safeText(alert.locationStatus) ? (
                    <>
                      {" "}
                      Location source:{" "}
                      {safeText(alert.locationStatus).replaceAll("_", " ")}.
                    </>
                  ) : null}
                </div>

                <div className="sk-threat-grid">
                  <div className="sk-threat-stat">
                    <span>Received</span>
                    <strong>{Number(alert.receivedCount || 0)}</strong>
                  </div>

                  <div className="sk-threat-stat">
                    <span>Checking</span>
                    <strong>{Number(alert.checkingCount || 0)}</strong>
                  </div>

                  <div className="sk-threat-stat">
                    <span>Emergency help</span>
                    <strong>
                      {Number(alert.contactedEmergencyHelpCount || 0)}
                    </strong>
                  </div>

                  <div className="sk-threat-stat">
                    <span>Cannot respond</span>
                    <strong>{Number(alert.unableToRespondCount || 0)}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="sk-threat-legal">
              Acknowledging an alert does not mean emergency help has been
              dispatched. StayKnown does not replace emergency services.
            </div>
          </div>
        </section>
      ) : null}

      {safetyPreviewOpen ? (
        <div
          className="sk-threat-image-preview-backdrop"
          role="presentation"
          onClick={() => setSafetyPreviewOpen(false)}
        >
          <section
            className="sk-threat-image-preview-card"
            role="dialog"
            aria-modal="true"
            aria-label={`${alert.ownerName} safety image preview`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="sk-threat-image-preview-close"
              aria-label="Close safety image"
              onClick={() => setSafetyPreviewOpen(false)}
            >
              ×
            </button>

            <PreparedImage
              src={safetyImage || assets.avatar}
              fallbackLogo={assets.avatar}
              alt={`${alert.ownerName} safety image`}
              className="sk-threat-image-preview-photo"
              useInitialFallback
            />

            <div className="sk-threat-image-preview-caption">
              <strong>{alert.ownerName}</strong>
              <span>Safety image attached to this Threat Alert</span>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
