"use client";

import React from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export type CheckInSeed = {
  checkInId: string;
  userId: string;
  audience: "contacts" | "self";
  expiresAt: number;
  visitorName: string;
  visitorAvatarUrl?: string | null;
  verified: boolean;
  badgeType: string;
  checkedInAt: string;
  lat: number;
  lng: number;
  accuracy: number | null;
  place: string;
  planTier: string;
  missedAlertsEnabled: boolean;
};

type RenderMode = "map" | "fallback";

type PreparedAssets = {
  ready: boolean;
  avatar: string;
  logo: string;
};

const ORIGINAL_LOGO_ENDPOINT = "/api/stayknown-logo";

function safeText(value: unknown): string {
  if (value == null) {
    return "";
  }

  const text = String(value).trim();

  return text.toLowerCase() === "null" ? "" : text;
}

function prefersDarkTheme() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function formatCoordinates(lat: number, lng: number) {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

function accuracyLabel(accuracy: number | null) {
  if (
    typeof accuracy !== "number" ||
    !Number.isFinite(accuracy) ||
    accuracy <= 0
  ) {
    return "Accuracy unavailable";
  }

  if (accuracy <= 80) {
    return `Precise GPS area • ± ${accuracy.toFixed(1)} meters`;
  }

  if (accuracy <= 250) {
    return `Precise location • ± ${accuracy.toFixed(1)} meters`;
  }

  return `Approximate location • ± ${accuracy.toFixed(0)} meters`;
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
          window.setTimeout(() => {
            reject(new Error("image_decode_timeout"));
          }, 4500);
        }),
      ]);
    } else {
      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(() => {
          reject(new Error("image_load_timeout"));
        }, 4500);

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

  if (!cleanUrl) {
    return "";
  }

  const attempts = 3;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const controller = new AbortController();

    const timeout = window.setTimeout(() => {
      controller.abort();
    }, 7000);

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
      // Retry below.
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

function buildCheckInMarker() {
  const wrap = document.createElement("div");

  wrap.style.width = "88px";
  wrap.style.height = "88px";
  wrap.style.display = "flex";
  wrap.style.alignItems = "center";
  wrap.style.justifyContent = "center";
  wrap.style.position = "relative";

  const halo = document.createElement("div");

  halo.style.position = "absolute";
  halo.style.width = "70px";
  halo.style.height = "70px";
  halo.style.borderRadius = "9999px";
  halo.style.background = "rgba(255,255,255,0.10)";
  halo.style.border = "1px solid rgba(255,255,255,0.24)";
  halo.style.backdropFilter = "blur(10px)";
  halo.style.boxShadow =
    "0 0 0 10px rgba(255,255,255,0.05), 0 18px 40px rgba(0,0,0,0.16)";

  const pin = document.createElement("div");

  pin.style.width = "46px";
  pin.style.height = "46px";
  pin.style.borderRadius = "9999px";
  pin.style.display = "flex";
  pin.style.alignItems = "center";
  pin.style.justifyContent = "center";
  pin.style.background =
    "linear-gradient(180deg, rgba(255,255,255,0.99), rgba(243,245,247,0.96))";
  pin.style.border = "1px solid rgba(255,255,255,0.98)";
  pin.style.boxShadow =
    "0 16px 34px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,1)";
  pin.style.position = "relative";
  pin.style.zIndex = "2";

  const image = document.createElement("img");

  image.src = "/6logo.png";
  image.alt = "StayKnown";
  image.style.width = "19px";
  image.style.height = "19px";
  image.style.objectFit = "contain";

  pin.appendChild(image);
  wrap.appendChild(halo);
  wrap.appendChild(pin);

  return wrap;
}

function UserAvatar({
  name,
  avatarUrl,
  logoUrl,
}: {
  name: string;
  avatarUrl: string;
  logoUrl: string;
}) {
  const hasAvatar = Boolean(avatarUrl);

  const finalSource = avatarUrl || logoUrl || "/6logo.png";

  return (
    <div
      className={`relative grid h-[58px] w-[58px] shrink-0 place-items-center overflow-hidden rounded-[21px] border border-white/95 shadow-[0_15px_28px_rgba(0,0,0,0.17),inset_0_1px_0_rgba(255,255,255,0.20)] ${
        hasAvatar ? "bg-black" : "bg-white"
      }`}
      role="img"
      aria-label={`${name} profile picture`}
    >
      <img
        src={finalSource}
        alt=""
        aria-hidden="true"
        draggable={false}
        className={
          hasAvatar
            ? "h-full w-full object-cover"
            : "h-full w-full bg-white p-2 object-contain"
        }
      />
    </div>
  );
}

function VerifiedName({ name, verified }: { name: string; verified: boolean }) {
  return (
    <span className="inline-flex min-w-0 items-center justify-start gap-1.5">
      <span className="truncate">{name}</span>

      {verified ? (
        <span
          className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-black text-[9px] font-black text-white"
          title="Verified StayKnown user"
          aria-label="Verified StayKnown user"
        >
          ✓
        </span>
      ) : null}
    </span>
  );
}

function privacyText() {
  return (
    "This page shows one safety check-in location captured at the stated time. " +
    "It is not live tracking and it does not continue monitoring the person."
  );
}

function legalLine() {
  return `A 6 Clement Joshua service™ • © ${new Date().getFullYear()} StayKnown™`;
}

export default function CheckInClient({ seed }: { seed: CheckInSeed }) {
  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);

  const mapRef = React.useRef<maplibregl.Map | null>(null);

  const markerRef = React.useRef<maplibregl.Marker | null>(null);

  const [darkTheme, setDarkTheme] = React.useState(false);

  const [accepted, setAccepted] = React.useState(false);

  const [renderMode, setRenderMode] = React.useState<RenderMode>("map");

  const [mapReady, setMapReady] = React.useState(false);

  const [mapError, setMapError] = React.useState("");

  const [assets, setAssets] = React.useState<PreparedAssets>({
    ready: false,
    avatar: "",
    logo: "",
  });

  const avatarEndpoint = safeText(seed.visitorAvatarUrl);

  const coordinates = formatCoordinates(seed.lat, seed.lng);

  const confidence = accuracyLabel(seed.accuracy);

  React.useEffect(() => {
    let cancelled = false;

    const objectUrls: string[] = [];

    async function prepareAssets() {
      const [avatar, logo] = await Promise.all([
        fetchImageObjectUrl(avatarEndpoint).catch(() => ""),
        fetchImageObjectUrl(ORIGINAL_LOGO_ENDPOINT).catch(() => ""),
      ]);

      for (const value of [avatar, logo]) {
        if (value) {
          objectUrls.push(value);
        }
      }

      if (cancelled) {
        objectUrls.forEach((value) => {
          URL.revokeObjectURL(value);
        });

        return;
      }

      setAssets({
        ready: true,
        avatar,
        logo,
      });
    }

    void prepareAssets();

    return () => {
      cancelled = true;

      objectUrls.forEach((value) => {
        URL.revokeObjectURL(value);
      });
    };
  }, [avatarEndpoint]);

  React.useEffect(() => {
    setDarkTheme(prefersDarkTheme());

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const onChange = (event: MediaQueryListEvent) => {
      setDarkTheme(event.matches);
    };

    media.addEventListener?.("change", onChange);

    return () => {
      media.removeEventListener?.("change", onChange);
    };
  }, []);

  React.useEffect(() => {
    if (!accepted) {
      return;
    }

    if (renderMode !== "map") {
      return;
    }

    if (!mapContainerRef.current) {
      return;
    }

    const styleUrl = (process.env.NEXT_PUBLIC_TOMTOM_STYLE_URL || "").trim();

    const apiKey = (process.env.NEXT_PUBLIC_TOMTOM_API_KEY || "").trim();

    if (!styleUrl || !apiKey) {
      setRenderMode("fallback");

      setMapError("StayKnown map preview is temporarily unavailable.");

      return;
    }

    let closed = false;

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: styleUrl,
        center: [seed.lng, seed.lat],

        zoom:
          seed.accuracy !== null && seed.accuracy <= 80
            ? 16.2
            : seed.accuracy !== null && seed.accuracy <= 250
              ? 15.2
              : 13.5,

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

      const timeout = window.setTimeout(() => {
        if (closed) {
          return;
        }

        setMapError("The map is taking longer than expected.");
      }, 16000);

      map.once("load", () => {
        if (closed) {
          return;
        }

        window.clearTimeout(timeout);

        setMapReady(true);
        setMapError("");

        markerRef.current = new maplibregl.Marker({
          element: buildCheckInMarker(),
          anchor: "center",
        })
          .setLngLat([seed.lng, seed.lat])
          .addTo(map);

        map.resize();

        window.requestAnimationFrame(() => {
          map.resize();
        });

        window.setTimeout(() => {
          map.resize();
        }, 180);

        window.setTimeout(() => {
          map.resize();
        }, 500);
      });

      map.once("error", () => {
        if (closed) {
          return;
        }

        window.clearTimeout(timeout);

        setMapReady(false);
        setRenderMode("fallback");

        setMapError("StayKnown map preview is temporarily unavailable.");
      });

      const onResize = () => {
        map.resize();
      };

      window.addEventListener("resize", onResize);

      return () => {
        closed = true;

        window.clearTimeout(timeout);

        window.removeEventListener("resize", onResize);

        try {
          markerRef.current?.remove();
        } catch {}

        markerRef.current = null;

        try {
          map.remove();
        } catch {}

        mapRef.current = null;
      };
    } catch {
      setRenderMode("fallback");

      setMapError("StayKnown map preview is temporarily unavailable.");
    }
  }, [accepted, renderMode, seed.accuracy, seed.lat, seed.lng]);

  const cardBackground = darkTheme ? "bg-black/80" : "bg-white/94";

  const cardBorder = darkTheme ? "border-white/12" : "border-black/10";

  const primaryText = darkTheme ? "text-white" : "text-black";

  const mutedText = darkTheme ? "text-white/58" : "text-black/55";

  const innerBackground = darkTheme ? "bg-white/6" : "bg-[#f5f6f7]";

  const information = [
    {
      label: "Safety status",
      value: "I’M SAFE",
    },
    {
      label: "Checked-in date",
      value: formatDate(seed.checkedInAt),
    },
    {
      label: "Checked-in time",
      value: formatTime(seed.checkedInAt),
    },
    {
      label: "Location",
      value: seed.place,
    },
    {
      label: "Location confidence",
      value: confidence,
    },
    {
      label: "Coordinates",
      value: coordinates,
    },
  ];

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-[#eef1f4]"
      style={{
        height: "100dvh",
        minHeight: "100dvh",
      }}
    >
      {renderMode === "map" ? (
        <div
          ref={mapContainerRef}
          className="absolute inset-0"
          style={{
            height: "100dvh",
            background: darkTheme ? "#111111" : "#eef1f4",
          }}
        />
      ) : (
        <div
          className={`absolute inset-0 ${
            darkTheme
              ? "bg-[radial-gradient(circle_at_top,#252525,#090909_68%)]"
              : "bg-[radial-gradient(circle_at_top,#ffffff,#e9edf1_70%)]"
          }`}
        />
      )}

      <div className="absolute left-1/2 top-5 z-30 -translate-x-1/2">
        <div className="min-w-[205px] rounded-[24px] border border-white/90 bg-white/86 px-5 py-2.5 shadow-[0_16px_42px_rgba(0,0,0,0.16)] backdrop-blur-2xl">
          <div className="flex flex-col items-center">
            <img
              src="/6logo.png"
              alt="StayKnown"
              className="h-5 w-5 object-contain"
            />

            <div className="mt-1 text-[8px] font-bold uppercase tracking-[0.32em] text-black/55">
              StayKnown
            </div>

            <div className="mt-1.5 whitespace-nowrap text-[6.8px] font-extrabold tracking-[0.08em] text-black/40">
              A 6 Clement Joshua service™
            </div>
          </div>
        </div>
      </div>

      {!mapReady && renderMode === "map" && accepted ? (
        <div className="absolute left-1/2 top-[108px] z-30 -translate-x-1/2">
          <div className="rounded-full border border-white/85 bg-white/82 px-3 py-2 text-[10px] font-extrabold text-black/60 shadow-md backdrop-blur-xl">
            Preparing check-in map…
          </div>
        </div>
      ) : null}

      {mapError ? (
        <div className="absolute left-1/2 top-[148px] z-30 -translate-x-1/2">
          <div className="rounded-full border border-white/80 bg-white/82 px-3 py-2 text-[10px] font-bold text-black/58 shadow-md backdrop-blur-xl">
            {mapError}
          </div>
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-4 z-40 px-3 md:bottom-7 md:px-6">
        <div
          className={`mx-auto w-full max-w-[720px] overflow-hidden rounded-[30px] border ${cardBorder} ${cardBackground} shadow-[0_26px_80px_rgba(0,0,0,0.24)] backdrop-blur-2xl`}
        >
          <div className="px-5 pb-3 pt-5 md:px-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <UserAvatar
                  name={seed.visitorName}
                  avatarUrl={assets.avatar}
                  logoUrl={assets.logo}
                />

                <div className="min-w-0 flex-1">
                  <div
                    className={`text-[9px] font-black uppercase tracking-[0.28em] ${mutedText}`}
                  >
                    One-time safety snapshot
                  </div>

                  <div
                    className={`mt-2 min-w-0 text-[19px] font-black tracking-[-0.03em] ${primaryText}`}
                  >
                    <VerifiedName
                      name={seed.visitorName}
                      verified={seed.verified}
                    />
                  </div>

                  <div className={`mt-1 text-[12px] font-bold ${mutedText}`}>
                    marked themselves safe through StayKnown.
                  </div>
                </div>
              </div>

              <div className="rounded-full border border-[#ccebdd] bg-[#dff5ee] px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-[#0e8f70]">
                I’M SAFE
              </div>
            </div>

            <div
              className={`mt-4 max-h-[230px] overflow-y-auto rounded-[22px] border ${cardBorder} ${innerBackground} px-4 py-3`}
            >
              <div className="space-y-3">
                {information.map((item) => (
                  <div key={item.label} className="text-center">
                    <div
                      className={`text-[8px] font-black uppercase tracking-[0.22em] ${mutedText}`}
                    >
                      {item.label}
                    </div>

                    <div
                      className={`mt-1 break-words text-[12px] font-extrabold leading-5 ${primaryText}`}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}

                <div className="text-center">
                  <div
                    className={`text-[8px] font-black uppercase tracking-[0.22em] ${mutedText}`}
                  >
                    Important
                  </div>

                  <div
                    className={`mt-1 text-[11px] font-semibold leading-5 ${mutedText}`}
                  >
                    {privacyText()}
                  </div>
                </div>
              </div>
            </div>

            {renderMode === "fallback" ? (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setMapError("");
                    setMapReady(false);
                    setRenderMode("map");
                  }}
                  className={`w-full rounded-full border px-5 py-3 text-[12px] font-black transition active:scale-[0.99] ${
                    darkTheme
                      ? "border-white/14 bg-white/8 text-white"
                      : "border-black/10 bg-white text-black"
                  }`}
                >
                  Retry StayKnown map
                </button>
              </div>
            ) : null}
          </div>

          <div
            className={`border-t px-4 py-2 text-center text-[8px] font-semibold ${
              darkTheme
                ? "border-white/8 text-white/48"
                : "border-black/8 text-black/48"
            }`}
          >
            {legalLine()}
          </div>
        </div>
      </div>

      {!accepted ? (
        <div className="absolute inset-0 z-[90] flex items-center justify-center bg-black/48 px-4 backdrop-blur-md">
          <div
            className={`w-full max-w-[560px] rounded-[30px] border ${cardBorder} ${
              darkTheme ? "bg-[#0d0d0d]/95" : "bg-white/96"
            } p-5 shadow-[0_30px_100px_rgba(0,0,0,0.32)] md:p-6`}
          >
            <div
              className={`text-[10px] font-black uppercase tracking-[0.32em] ${mutedText}`}
            >
              I&apos;M SAFE map access
            </div>

            <div
              className={`mt-3 text-[22px] font-black tracking-[-0.03em] ${primaryText}`}
            >
              Privacy notice
            </div>

            <div className={`mt-3 text-[12px] leading-6 ${mutedText}`}>
              This secure page contains a one-time safety location shared with
              approved contacts. It is not live tracking and must not be used to
              stalk, harass, monitor, or expose anyone.
            </div>

            <div
              className={`mt-4 rounded-[22px] border ${cardBorder} ${innerBackground} p-4`}
            >
              <div
                className={`text-[10px] font-black uppercase tracking-[0.22em] ${mutedText}`}
              >
                Before you continue
              </div>

              <div className={`mt-2 text-[13px] leading-6 ${primaryText}`}>
                By tapping accept, you confirm that you are opening this
                check-in only for a legitimate safety reason.
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  window.location.replace("about:blank");
                  window.close();
                }}
                className={`rounded-full border px-5 py-3 text-[13px] font-extrabold ${
                  darkTheme
                    ? "border-white/12 bg-white/8 text-white/82"
                    : "border-black/10 bg-black/5 text-black/72"
                }`}
              >
                Decline
              </button>

              <button
                type="button"
                onClick={() => {
                  setAccepted(true);
                }}
                className="rounded-full border border-[#ccebdd] bg-[#dff5ee] px-5 py-3 text-[13px] font-extrabold text-[#0e8f70] shadow-[0_14px_34px_rgba(14,143,112,0.18)]"
              >
                I accept
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
