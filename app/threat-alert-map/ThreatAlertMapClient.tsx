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
  logoUrl?: string;
  caution?: string;
};

type Props = {
  alert: ThreatAlertMapPayload;
};

type MapState = "loading" | "ready" | "fallback";

const DEFAULT_LOGO_URL =
  "https://ipognlibpkbauusvfeic.supabase.co/storage/v1/object/public/public-assets/stayknown-logo.png";

const DEFAULT_CAUTION =
  "StayKnown cannot independently confirm that an emergency is occurring. " +
  "Contact the person through a trusted method first and verify with a nearby " +
  "trusted person when possible. If you believe there is immediate danger, " +
  "contact the appropriate local emergency service. Do not travel alone or " +
  "place yourself at risk based only on this alert.";

const FALLBACK_CENTER: [number, number] = [8.3349, 4.5736];
const MAP_LOAD_TIMEOUT_MS = 16000;

function safeText(value: unknown): string {
  if (value == null) return "";
  const text = String(value).trim();
  return text.toLowerCase() === "null" ? "" : text;
}

function safeHttpUrl(value: unknown): string {
  const text = safeText(value);
  if (!text) return "";

  try {
    const url = new URL(text);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : "";
  } catch {
    return "";
  }
}

function finiteCoordinate(value: unknown): number | null {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatDateTime(value?: string): string {
  const text = safeText(value);
  if (!text) return "Time unavailable";

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return "Time unavailable";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatCoordinates(lat: number | null, lng: number | null): string {
  if (lat == null || lng == null) return "";
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
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

function mapsHref(
  externalUrl: string,
  lat: number | null,
  lng: number | null,
): string {
  const direct = safeHttpUrl(externalUrl);
  if (direct) return direct;
  if (lat == null || lng == null) return "";
  return `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}`;
}

function avatarInitial(name: string): string {
  return safeText(name).slice(0, 1).toUpperCase() || "S";
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

  const image = document.createElement("img");
  image.src = params.avatarUrl || params.logoUrl;
  image.alt = params.avatarUrl ? params.ownerName : "StayKnown";
  image.className = params.avatarUrl
    ? "sk-threat-marker-image sk-threat-marker-image-avatar"
    : "sk-threat-marker-image sk-threat-marker-image-logo";

  image.onerror = () => {
    if (image.src !== params.logoUrl) {
      image.src = params.logoUrl;
      image.alt = "StayKnown";
      image.className = "sk-threat-marker-image sk-threat-marker-image-logo";
      return;
    }

    image.style.display = "none";

    const initial = document.createElement("span");
    initial.className = "sk-threat-marker-initial";
    initial.textContent = avatarInitial(params.ownerName);
    imageFrame.appendChild(initial);
  };

  imageFrame.appendChild(image);
  root.appendChild(imageFrame);

  const pointer = document.createElement("div");
  pointer.className = "sk-threat-marker-pointer";
  root.appendChild(pointer);

  return root;
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

function SafeImage({
  src,
  fallback,
  alt,
  className,
}: {
  src: string;
  fallback: string;
  alt: string;
  className: string;
}) {
  const [current, setCurrent] = React.useState(src || fallback);
  const [failedFallback, setFailedFallback] = React.useState(false);

  React.useEffect(() => {
    setCurrent(src || fallback);
    setFailedFallback(false);
  }, [src, fallback]);

  return (
    <div className={className}>
      {!failedFallback ? (
        <img
          src={current}
          alt={current === fallback ? "StayKnown" : alt}
          onError={() => {
            if (current !== fallback) {
              setCurrent(fallback);
            } else {
              setFailedFallback(true);
            }
          }}
        />
      ) : (
        <span>{avatarInitial(alt)}</span>
      )}
    </div>
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
  const [detailsExpanded, setDetailsExpanded] = React.useState(false);

  const logoUrl = safeHttpUrl(alert.logoUrl) || DEFAULT_LOGO_URL;
  const avatarUrl = safeHttpUrl(alert.ownerAvatarUrl);
  const safetyImageUrl = safeHttpUrl(alert.ownerSafetyImageUrl);
  const lat = finiteCoordinate(alert.lat);
  const lng = finiteCoordinate(alert.lng);
  const hasLocation =
    lat != null &&
    lng != null &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180;

  const accuracy = finiteCoordinate(alert.accuracyMeters);
  const accuracyInfo = accuracyCopy(accuracy);
  const statusInfo = statusCopy(alert.status, alert.active);
  const externalMapHref = mapsHref(alert.externalMapUrl || "", lat, lng);
  const appHref = `stayknown://threat-alert/${encodeURIComponent(alert.alertId)}`;
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

  const safetyImage = safetyImageUrl || avatarUrl;

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
    if (!mapContainerRef.current) return;

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
        "The embedded map is unavailable, but the recorded location details remain below.",
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
          avatarUrl,
          logoUrl,
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
          "The map is taking longer than expected. Use the external map button below.",
        );
      }, MAP_LOAD_TIMEOUT_MS);

      map.once("load", () => {
        if (disposed) return;
        if (timeout) clearTimeout(timeout);
        setMapState("ready");
        setMapMessage("");
        map.resize();
        requestAnimationFrame(() => map.resize());
      });

      map.on("error", () => {
        if (disposed) return;
        setMapState("fallback");
        setMapMessage(
          "The embedded map could not load here. The alert information and external map remain available.",
        );
      });
    } catch {
      setMapState("fallback");
      setMapMessage(
        "The embedded map could not load here. The alert information and external map remain available.",
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
    avatarUrl,
    hasLocation,
    lat,
    lng,
    logoUrl,
  ]);

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
          background: #e9ecef;
        }

        body {
          overflow-x: hidden;
        }

        .sk-threat-root {
          position: relative;
          min-height: 100dvh;
          overflow: hidden;
          color: #111318;
          background:
            radial-gradient(
              circle at 10% 0%,
              rgba(255, 255, 255, 0.96),
              transparent 34%
            ),
            linear-gradient(145deg, #eef1f4 0%, #ffffff 48%, #e5e8eb 100%);
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .sk-threat-map {
          position: fixed;
          inset: 0;
          min-height: 100dvh;
          background:
            radial-gradient(
              circle at 50% 40%,
              rgba(255, 255, 255, 0.9),
              transparent 46%
            ),
            #dfe4e8;
        }

        .sk-threat-map::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.35) 0%,
            transparent 24%,
            transparent 64%,
            rgba(0, 0, 0, 0.14) 100%
          );
        }

        .sk-threat-map-fallback {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          padding: 24px;
          background:
            radial-gradient(
              circle at 50% 36%,
              rgba(255, 255, 255, 0.94),
              transparent 30%
            ),
            repeating-linear-gradient(
              45deg,
              rgba(255, 255, 255, 0.32) 0,
              rgba(255, 255, 255, 0.32) 1px,
              transparent 1px,
              transparent 16px
            ),
            #e4e8eb;
        }

        .sk-threat-map-fallback-card {
          width: min(92vw, 430px);
          padding: 22px;
          border: 1px solid rgba(255, 255, 255, 0.92);
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.78);
          box-shadow:
            0 28px 70px rgba(0, 0, 0, 0.14),
            inset 0 1px 0 rgba(255, 255, 255, 0.98);
          text-align: center;
          backdrop-filter: blur(22px);
        }

        .sk-threat-map-fallback-card img {
          width: 58px;
          height: 58px;
          object-fit: contain;
          border-radius: 18px;
        }

        .sk-threat-map-fallback-card strong {
          display: block;
          margin-top: 13px;
          font-size: 15px;
          line-height: 1.3;
        }

        .sk-threat-map-fallback-card span {
          display: block;
          margin-top: 7px;
          color: rgba(17, 19, 24, 0.58);
          font-size: 12px;
          font-weight: 650;
          line-height: 1.55;
        }

        .sk-threat-brand {
          position: fixed;
          z-index: 20;
          top: max(14px, env(safe-area-inset-top));
          left: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          max-width: calc(100vw - 148px);
          padding: 8px 12px 8px 8px;
          border: 1px solid rgba(255, 255, 255, 0.86);
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.82);
          box-shadow:
            0 15px 38px rgba(0, 0, 0, 0.13),
            inset 0 1px 0 rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(22px);
        }

        .sk-threat-brand img {
          width: 38px;
          height: 38px;
          object-fit: contain;
          border-radius: 13px;
        }

        .sk-threat-brand-name {
          min-width: 0;
        }

        .sk-threat-brand-name strong {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 11px;
          font-weight: 950;
          letter-spacing: 1.55px;
        }

        .sk-threat-brand-name span {
          display: block;
          margin-top: 3px;
          overflow: hidden;
          color: rgba(17, 19, 24, 0.52);
          font-size: 7.5px;
          font-weight: 850;
          letter-spacing: 0.72px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sk-threat-status-pill {
          position: fixed;
          z-index: 20;
          top: max(17px, calc(env(safe-area-inset-top) + 3px));
          right: 14px;
          max-width: 128px;
          padding: 10px 12px;
          border: 1px solid rgba(255, 255, 255, 0.86);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.84);
          box-shadow:
            0 15px 38px rgba(0, 0, 0, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.98);
          font-size: 8.5px;
          font-weight: 950;
          letter-spacing: 0.75px;
          overflow: hidden;
          text-overflow: ellipsis;
          text-transform: uppercase;
          white-space: nowrap;
          backdrop-filter: blur(22px);
        }

        .sk-threat-status-pill-active {
          background: rgba(17, 17, 17, 0.92);
          color: white;
          border-color: rgba(255, 255, 255, 0.16);
        }

        .sk-threat-controls {
          position: fixed;
          z-index: 20;
          right: 14px;
          top: 82px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sk-threat-control {
          width: 42px;
          height: 42px;
          border: 1px solid rgba(255, 255, 255, 0.86);
          border-radius: 15px;
          color: #111318;
          background: rgba(255, 255, 255, 0.84);
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

        .sk-threat-panel {
          position: fixed;
          z-index: 30;
          left: 16px;
          right: 16px;
          bottom: max(16px, env(safe-area-inset-bottom));
          margin: 0 auto;
          width: min(760px, calc(100vw - 32px));
          max-height: min(72dvh, 650px);
          overflow: auto;
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 32px;
          background: linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.96),
            rgba(235, 238, 241, 0.9)
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
          padding: 16px;
        }

        .sk-threat-identity {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sk-threat-avatar {
          position: relative;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          width: 58px;
          height: 58px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.94);
          border-radius: 21px;
          color: white;
          background: #111318;
          box-shadow:
            0 15px 28px rgba(0, 0, 0, 0.17),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          font-size: 21px;
          font-weight: 950;
        }

        .sk-threat-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
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
          color: white;
          background: #111318;
          font-size: 9px;
          font-weight: 950;
        }

        .sk-threat-verified-official {
          background: #747980;
        }

        .sk-threat-expand {
          flex: 0 0 auto;
          padding: 9px 11px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 999px;
          color: #111318;
          background: rgba(255, 255, 255, 0.62);
          cursor: pointer;
          font-size: 8px;
          font-weight: 950;
          letter-spacing: 0.65px;
          text-transform: uppercase;
        }

        .sk-threat-location-card {
          margin-top: 14px;
          padding: 14px;
          border: 1px solid rgba(0, 0, 0, 0.065);
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.62);
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
          background: rgba(255, 255, 255, 0.52);
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
          display: grid;
          grid-template-columns: 178px minmax(0, 1fr);
          gap: 12px;
          margin-top: 12px;
        }

        .sk-threat-safety-image {
          position: relative;
          display: grid;
          place-items: center;
          width: 100%;
          min-height: 160px;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.065);
          border-radius: 22px;
          color: white;
          background: #111318;
          font-size: 38px;
          font-weight: 950;
        }

        .sk-threat-safety-image img {
          width: 100%;
          height: 100%;
          min-height: 160px;
          object-fit: cover;
        }

        .sk-threat-guidance {
          padding: 15px;
          border-radius: 22px;
          color: white;
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
          background: rgba(255, 255, 255, 0.48);
          font-size: 9.5px;
          font-weight: 700;
          line-height: 1.48;
        }

        .sk-threat-actions {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin-top: 12px;
        }

        .sk-threat-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 43px;
          padding: 11px 14px;
          border: 1px solid rgba(0, 0, 0, 0.09);
          border-radius: 999px;
          color: #111318;
          background: rgba(255, 255, 255, 0.65);
          text-align: center;
          text-decoration: none;
          font-size: 9.5px;
          font-weight: 950;
        }

        .sk-threat-action-primary {
          border-color: #111318;
          color: white;
          background: #111318;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.18),
            inset 0 -11px 22px rgba(0, 0, 0, 0.36);
        }

        .sk-threat-legal {
          margin: 10px 4px 0;
          color: rgba(17, 19, 24, 0.42);
          text-align: center;
          font-size: 7.5px;
          font-weight: 700;
          line-height: 1.45;
        }

        .sk-threat-loading {
          position: fixed;
          z-index: 15;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 12px 15px;
          border: 1px solid rgba(255, 255, 255, 0.88);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.82);
          box-shadow:
            0 18px 44px rgba(0, 0, 0, 0.14),
            inset 0 1px 0 rgba(255, 255, 255, 0.98);
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
          background: rgba(255, 255, 255, 0.28);
          box-shadow: 0 0 0 9px rgba(255, 255, 255, 0.12);
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
          color: white;
          background: #111318;
          box-shadow:
            0 16px 30px rgba(0, 0, 0, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.26);
          transform: translateX(-50%);
        }

        .sk-threat-marker-image {
          width: 100%;
          height: 100%;
        }

        .sk-threat-marker-image-avatar {
          object-fit: cover;
        }

        .sk-threat-marker-image-logo {
          padding: 11px;
          object-fit: contain;
          background: white;
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

        @media (max-width: 680px) {
          .sk-threat-brand {
            max-width: calc(100vw - 136px);
          }

          .sk-threat-panel {
            width: calc(100vw - 20px);
            left: 10px;
            right: 10px;
            bottom: max(10px, env(safe-area-inset-bottom));
            max-height: ${detailsExpanded ? "74dvh" : "43dvh"};
            border-radius: 29px;
          }

          .sk-threat-panel-inner {
            padding: 13px;
          }

          .sk-threat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .sk-threat-expanded {
            grid-template-columns: 1fr;
          }

          .sk-threat-safety-image,
          .sk-threat-safety-image img {
            min-height: 190px;
          }

          .sk-threat-owner-name h1 {
            font-size: 17px;
          }

          .sk-threat-actions {
            grid-template-columns: 1fr;
          }
        }

        @media (min-width: 681px) {
          .sk-threat-expand {
            display: none;
          }
        }
      `}</style>

      <div ref={mapContainerRef} className="sk-threat-map" />

      {mapState === "fallback" ? (
        <div className="sk-threat-map-fallback">
          <div className="sk-threat-map-fallback-card">
            <img src={logoUrl} alt="StayKnown" />
            <strong>Recorded Threat Alert location</strong>
            <span>{mapMessage}</span>
          </div>
        </div>
      ) : null}

      {mapState === "loading" ? (
        <div className="sk-threat-loading">
          <span className="sk-threat-loading-dot" />
          Preparing safety map
        </div>
      ) : null}

      <div className="sk-threat-brand">
        <img src={logoUrl} alt="StayKnown" />
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

      <section className="sk-threat-panel">
        <div className="sk-threat-panel-inner">
          <div className="sk-threat-identity">
            <SafeImage
              src={avatarUrl}
              fallback={logoUrl}
              alt={alert.ownerName}
              className="sk-threat-avatar"
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

            <button
              type="button"
              className="sk-threat-expand"
              onClick={() => setDetailsExpanded((value) => !value)}
            >
              {detailsExpanded ? "Minimize" : "More details"}
            </button>
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
                <strong>{formatCoordinates(lat, lng) || "Not attached"}</strong>
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

          <div className="sk-threat-expanded">
            <SafeImage
              src={safetyImage}
              fallback={logoUrl}
              alt={`${alert.ownerName} safety image`}
              className="sk-threat-safety-image"
            />

            <div>
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

          <div className="sk-threat-actions">
            {externalMapHref ? (
              <a
                href={externalMapHref}
                target="_blank"
                rel="noopener noreferrer"
                className="sk-threat-action sk-threat-action-primary"
              >
                Open external map
              </a>
            ) : (
              <span className="sk-threat-action sk-threat-action-primary">
                Location navigation unavailable
              </span>
            )}

            <a href={appHref} className="sk-threat-action">
              Open in StayKnown
            </a>
          </div>

          <div className="sk-threat-legal">
            Acknowledging an alert does not mean emergency help has been
            dispatched. StayKnown does not replace emergency services.
          </div>
        </div>
      </section>
    </main>
  );
}
