import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Threat Alert location | StayKnown",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

type SearchValue = string | string[] | undefined;
type SearchMap = Record<string, SearchValue>;

type PageProps = {
  searchParams: SearchMap | Promise<SearchMap>;
};

type ThreatAlertRow = Record<string, unknown>;

const DEFAULT_LOGO_URL =
  "https://ipognlibpkbauusvfeic.supabase.co/storage/v1/object/public/public-assets/stayknown-logo.png";

const RECIPIENT_CAUTION =
  "StayKnown cannot independently confirm that an emergency is occurring. " +
  "Contact the person through a trusted method first and verify with a nearby " +
  "trusted person when possible. If you believe there is immediate danger, " +
  "contact the appropriate local emergency service. Do not travel alone or " +
  "place yourself at risk based only on this alert.";

function first(value: SearchValue): string {
  if (Array.isArray(value)) return String(value[0] ?? "").trim();
  return String(value ?? "").trim();
}

function clean(value: unknown): string {
  if (value == null) return "";
  const text = String(value).trim();
  return text.toLowerCase() === "null" ? "" : text;
}

function numberOf(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function safeHttpUrl(value: unknown): string {
  const text = clean(value);
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

function firstNonEmpty(values: unknown[]): string {
  for (const value of values) {
    const text = clean(value);
    if (text) return text;
  }
  return "";
}

function formatDate(value: unknown): string {
  const text = clean(value);
  if (!text) return "";

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZoneName: "short",
  }).format(date);
}

function statusLabel(statusValue: unknown): string {
  const status = clean(statusValue).toLowerCase();

  switch (status) {
    case "dispatching":
      return "Sending";
    case "active":
      return "Active";
    case "safe":
    case "resolved_safe":
      return "Resolved — safe";
    case "no_longer_threatened":
    case "resolved_no_longer_threatened":
      return "Resolved";
    case "accidental":
    case "resolved_accidental":
      return "Accidental alert";
    case "cancelled":
    case "canceled":
      return "Cancelled";
    case "expired":
      return "Expired";
    case "failed":
      return "Delivery failed";
    default:
      return status ? status.replaceAll("_", " ") : "Recorded";
  }
}

function isActiveStatus(statusValue: unknown): boolean {
  const status = clean(statusValue).toLowerCase();
  return status === "active" || status === "dispatching";
}

function mapUrlFor(alert: ThreatAlertRow): string {
  const direct = safeHttpUrl(alert.external_map_url);
  if (direct) return direct;

  const lat = numberOf(alert.lat);
  const lng = numberOf(alert.lng);

  if (lat == null || lng == null) return "";

  return `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}`;
}

async function loadAlert(alertId: string): Promise<{
  status: number;
  alert: ThreatAlertRow | null;
  error: string;
}> {
  const supabaseUrl = firstNonEmpty([
    process.env.SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ]).replace(/\/+$/g, "");

  /*
  This key remains server-side because this file is a Server Component.
  Never rename it to NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY.
  */
  const serviceRole = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!supabaseUrl || !serviceRole) {
    return {
      status: 500,
      alert: null,
      error:
        "StayKnown’s secure Threat Alert map service is not configured on this website deployment.",
    };
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/threat_alerts?id=eq.${encodeURIComponent(
        alertId,
      )}&select=*&limit=1`,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          apikey: serviceRole,
          Authorization: `Bearer ${serviceRole}`,
          Accept: "application/json",
        },
      },
    );

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        status: response.status,
        alert: null,
        error: "StayKnown could not load this Threat Alert right now.",
      };
    }

    const row = Array.isArray(body) && body.length > 0 ? body[0] : null;

    if (!row || typeof row !== "object") {
      return {
        status: 404,
        alert: null,
        error: "This Threat Alert could not be found.",
      };
    }

    return {
      status: 200,
      alert: row as ThreatAlertRow,
      error: "",
    };
  } catch {
    return {
      status: 503,
      alert: null,
      error: "StayKnown could not reach the Threat Alert service right now.",
    };
  }
}

export default async function ThreatAlertMapPage({ searchParams }: PageProps) {
  const params = await Promise.resolve(searchParams);
  const alertId = first(params.alert);

  const result = !isUuid(alertId)
    ? {
        status: 400,
        alert: null,
        error: "This Threat Alert link is incomplete or invalid.",
      }
    : await loadAlert(alertId);

  const alert = result.alert;

  const ownerName = alert
    ? firstNonEmpty([
        alert.owner_full_name,
        alert.owner_first_name,
        "StayKnown member",
      ])
    : "StayKnown member";

  const imageUrl = alert
    ? safeHttpUrl(
        firstNonEmpty([alert.owner_safety_image_url, alert.owner_avatar_url]),
      )
    : "";

  const logoUrl = safeHttpUrl(process.env.BRAND_LOGO_URL) || DEFAULT_LOGO_URL;

  const place = alert ? firstNonEmpty([alert.place, alert.location_name]) : "";

  const lat = alert ? numberOf(alert.lat) : null;
  const lng = alert ? numberOf(alert.lng) : null;
  const accuracy = alert ? numberOf(alert.accuracy_meters) : null;
  const locationStatus = alert ? clean(alert.location_status) : "";
  const triggeredAt = alert
    ? formatDate(
        firstNonEmpty([
          alert.triggered_at,
          alert.activated_at,
          alert.created_at,
        ]),
      )
    : "";

  const status = alert ? statusLabel(alert.status) : "";
  const active = alert ? isActiveStatus(alert.status) : false;
  const mapUrl = alert ? mapUrlFor(alert) : "";

  const locationSummary = place
    ? place
    : lat != null && lng != null
      ? `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      : "A confirmed location was not attached when this alert was sent.";

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(145deg, #f2f3f4 0%, #ffffff 48%, #e5e7e9 100%)",
        color: "#111111",
        display: "grid",
        placeItems: "center",
        padding: "24px 14px",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 610,
          background: "rgba(255,255,255,0.96)",
          border: "1px solid rgba(0,0,0,0.09)",
          borderRadius: 32,
          overflow: "hidden",
          boxShadow:
            "0 30px 90px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.95)",
        }}
      >
        <header
          style={{
            padding: "25px 24px 17px",
            textAlign: "center",
            borderBottom: "1px solid rgba(0,0,0,0.07)",
          }}
        >
          <img
            src={logoUrl}
            width={62}
            height={62}
            alt="StayKnown"
            style={{
              width: 62,
              height: 62,
              display: "block",
              margin: "0 auto 12px",
              borderRadius: 19,
              objectFit: "contain",
            }}
          />

          <div
            style={{
              fontSize: 13,
              fontWeight: 950,
              letterSpacing: "2.3px",
            }}
          >
            STAYKNOWN™
          </div>

          <div
            style={{
              marginTop: 5,
              fontSize: 10,
              color: "#777777",
              fontWeight: 800,
              letterSpacing: "1.1px",
            }}
          >
            A 6 Clement Joshua service™
          </div>
        </header>

        <div style={{ padding: "24px" }}>
          {!alert ? (
            <div style={{ textAlign: "center", padding: "10px 2px 5px" }}>
              <div
                style={{
                  width: 74,
                  height: 74,
                  borderRadius: 24,
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto 17px",
                  background: "#eceef0",
                  border: "1px solid rgba(0,0,0,0.09)",
                  fontSize: 29,
                  fontWeight: 950,
                }}
              >
                !
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: 24,
                  lineHeight: 1.17,
                  fontWeight: 950,
                }}
              >
                Threat Alert unavailable
              </h1>

              <p
                style={{
                  margin: "13px auto 0",
                  maxWidth: 460,
                  color: "#555a60",
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  fontWeight: 650,
                }}
              >
                {result.error}
              </p>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 82,
                    height: 82,
                    flex: "0 0 82px",
                    borderRadius: 26,
                    overflow: "hidden",
                    display: "grid",
                    placeItems: "center",
                    background: "#f2f3f4",
                    border: "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  <img
                    src={imageUrl || logoUrl}
                    width={82}
                    height={82}
                    alt={imageUrl ? ownerName : "StayKnown"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: imageUrl ? "cover" : "contain",
                      padding: imageUrl ? 0 : 12,
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "7px 10px",
                      borderRadius: 999,
                      background: active ? "#111111" : "#eff0f1",
                      color: active ? "#ffffff" : "#333333",
                      fontSize: 10,
                      fontWeight: 950,
                      letterSpacing: "0.8px",
                      textTransform: "uppercase",
                    }}
                  >
                    {active ? "● " : ""}
                    {status}
                  </div>

                  <h1
                    style={{
                      margin: "10px 0 0",
                      fontSize: 23,
                      lineHeight: 1.12,
                      letterSpacing: "-0.4px",
                      fontWeight: 950,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {ownerName}
                  </h1>

                  {triggeredAt ? (
                    <div
                      style={{
                        marginTop: 7,
                        color: "#73777c",
                        fontSize: 11,
                        fontWeight: 750,
                      }}
                    >
                      Threat Alert recorded {triggeredAt}
                    </div>
                  ) : null}
                </div>
              </div>

              <div
                style={{
                  marginTop: 21,
                  padding: "17px",
                  borderRadius: 22,
                  background: "#f4f5f6",
                  border: "1px solid rgba(0,0,0,0.07)",
                }}
              >
                <div
                  style={{
                    fontSize: 10.5,
                    color: "#686c71",
                    fontWeight: 950,
                    letterSpacing: "1.15px",
                    textTransform: "uppercase",
                  }}
                >
                  Last confirmed location
                </div>

                <div
                  style={{
                    marginTop: 9,
                    fontSize: 15,
                    lineHeight: 1.5,
                    fontWeight: 900,
                    overflowWrap: "anywhere",
                  }}
                >
                  {locationSummary}
                </div>

                {accuracy != null && accuracy > 0 ? (
                  <div
                    style={{
                      marginTop: 6,
                      color: "#70757a",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    Approximate accuracy: ±{Math.round(accuracy)} metres
                  </div>
                ) : null}

                {locationStatus ? (
                  <div
                    style={{
                      marginTop: 5,
                      color: "#85898e",
                      fontSize: 10.5,
                      fontWeight: 700,
                    }}
                  >
                    Location status: {locationStatus.replaceAll("_", " ")}
                  </div>
                ) : null}

                {mapUrl ? (
                  <div style={{ marginTop: 14 }}>
                    <a
                      href={mapUrl}
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block",
                        padding: "12px 17px",
                        borderRadius: 999,
                        background: "#111111",
                        color: "#ffffff",
                        textDecoration: "none",
                        fontSize: 12.5,
                        fontWeight: 950,
                      }}
                    >
                      Open map
                    </a>
                  </div>
                ) : null}
              </div>

              {!active ? (
                <div
                  style={{
                    marginTop: 14,
                    padding: "14px 15px",
                    borderRadius: 20,
                    background: "#ffffff",
                    border: "1px solid rgba(0,0,0,0.08)",
                    color: "#555a60",
                    fontSize: 12,
                    lineHeight: 1.5,
                    fontWeight: 700,
                  }}
                >
                  This Threat Alert is no longer active. Its recorded sender,
                  status and last confirmed location remain visible for safety
                  history.
                </div>
              ) : null}

              <div
                style={{
                  marginTop: 17,
                  padding: "17px",
                  borderRadius: 22,
                  background: "#111111",
                  color: "#ffffff",
                }}
              >
                <div
                  style={{
                    fontSize: 10.5,
                    fontWeight: 950,
                    letterSpacing: "1.1px",
                    textTransform: "uppercase",
                  }}
                >
                  Respond without risking yourself
                </div>

                <p
                  style={{
                    margin: "9px 0 0",
                    color: "rgba(255,255,255,0.78)",
                    fontSize: 12,
                    lineHeight: 1.6,
                    fontWeight: 600,
                  }}
                >
                  {RECIPIENT_CAUTION}
                </p>
              </div>
            </>
          )}

          <p
            style={{
              margin: "19px 3px 0",
              color: "#7b7f84",
              textAlign: "center",
              fontSize: 10.5,
              lineHeight: 1.55,
              fontWeight: 650,
            }}
          >
            StayKnown does not replace emergency services. This page displays
            the location recorded when the Threat Alert was activated.
          </p>
        </div>
      </section>
    </main>
  );
}
