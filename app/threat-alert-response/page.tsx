import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Threat Alert response | StayKnown",
  description:
    "Secure StayKnown Threat Alert response confirmation and safety information.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

type SearchValue = string | string[] | undefined;
type SearchMap = Record<string, SearchValue>;
type JsonRow = Record<string, unknown>;

type PageProps = {
  searchParams: SearchMap | Promise<SearchMap>;
};

type FunctionResult = {
  ok?: boolean;
  closed?: boolean;
  status?: string;
  error?: string;
  already_recorded?: boolean;
  message?: string;
  acknowledgement?: {
    response_kind?: string;
    response_label?: string;
  };
};

type AlertSummary = {
  found: boolean;
  ownerName: string;
  ownerAvatarUrl: string;
  verified: boolean;
  verificationBadge: string;
  status: string;
  place: string;
  lat: number | null;
  lng: number | null;
  accuracyMeters: number | null;
  locationStatus: string;
  triggeredAt: string;
  recipientsCount: number;
  respondedCount: number;
  receivedCount: number;
  checkingCount: number;
};

const ORIGINAL_LOGO_ENDPOINT = "/api/stayknown-logo";

const CONTACT_CAUTION =
  "Verify through a trusted method you already know. Do not travel alone or " +
  "place yourself at risk based only on an alert. Contact the appropriate local " +
  "emergency service when you believe there is immediate danger. An acknowledgement " +
  "does not mean help is on the way.";

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

function intOf(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.trunc(parsed));
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

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function normalizeAction(value: string): string {
  const normalized = value.trim().toLowerCase();

  const aliases: Record<string, string> = {
    received: "received",
    alert_received: "received",
    threat_alert_received: "received",
    checking: "checking",
    threat_alert_checking: "checking",
    unable_to_respond: "unable_to_respond",
    cannot_respond: "unable_to_respond",
    cant_respond: "unable_to_respond",
    threat_alert_unable: "unable_to_respond",
    contacted_emergency_help: "contacted_emergency_help",
    emergency_help: "contacted_emergency_help",
  };

  return aliases[normalized] ?? "";
}

function actionLabel(action: string): string {
  switch (action) {
    case "checking":
      return "Checking";
    case "unable_to_respond":
      return "Can’t respond";
    case "contacted_emergency_help":
      return "Emergency help contacted";
    case "received":
      return "Received";
    default:
      return "Response";
  }
}

function statusLabel(value: string): string {
  const status = value.trim().toLowerCase();

  switch (status) {
    case "dispatching":
      return "Sending";
    case "active":
      return "Active";
    case "safe":
    case "resolved_safe":
      return "Resolved — safe";
    case "accidental":
    case "resolved_accidental":
      return "Accidental alert";
    case "cancelled":
    case "canceled":
      return "Cancelled";
    case "expired":
      return "Expired";
    case "failed":
      return "Delivery incomplete";
    default:
      return status ? status.replaceAll("_", " ") : "Recorded";
  }
}

function formatDateTime(value: string): string {
  if (!value) return "Time unavailable";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time unavailable";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function coordinatesLabel(lat: number | null, lng: number | null): string {
  if (lat == null || lng == null) return "Not attached";
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

function accuracyLabel(value: number | null): string {
  if (value == null || value <= 0) return "Unavailable";
  if (value <= 80) return `Precise GPS • ±${Math.round(value)} m`;
  if (value <= 250) {
    return `Approximate area • ±${Math.round(value)} m`;
  }
  return `Broad area • ±${Math.round(value)} m`;
}

function createAdminClient(supabaseUrl: string, serviceRole: string) {
  return createClient(supabaseUrl, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

type AdminClient = ReturnType<typeof createAdminClient>;

async function submitSignedResponse(params: {
  alertId: string;
  recipientId: string;
  action: string;
  exp: string;
  sig: string;
}): Promise<{
  status: number;
  result: FunctionResult;
}> {
  const supabaseUrl = (
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    ""
  )
    .trim()
    .replace(/\/+$/g, "");

  if (!supabaseUrl) {
    return {
      status: 500,
      result: {
        ok: false,
        error: "StayKnown response service is not configured.",
      },
    };
  }

  const anonKey = (
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    ""
  ).trim();

  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/respond_threat_alert`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          ...(anonKey ? { apikey: anonKey } : {}),
        },
        body: JSON.stringify({
          alert_id: params.alertId,
          recipient_id: params.recipientId,
          response_kind: params.action,
          action: params.action,
          exp: Number(params.exp),
          sig: params.sig,
          source: "signed_email",
        }),
      },
    );

    const result = (await response.json().catch(() => ({
      ok: false,
      error: "StayKnown returned an unreadable response.",
    }))) as FunctionResult;

    return {
      status: response.status,
      result,
    };
  } catch {
    return {
      status: 503,
      result: {
        ok: false,
        error: "StayKnown could not record the response right now.",
      },
    };
  }
}

async function loadAlertSummary(alertId: string): Promise<AlertSummary> {
  const empty: AlertSummary = {
    found: false,
    ownerName: "StayKnown member",
    ownerAvatarUrl: "",
    verified: false,
    verificationBadge: "",
    status: "",
    place: "",
    lat: null,
    lng: null,
    accuracyMeters: null,
    locationStatus: "",
    triggeredAt: "",
    recipientsCount: 0,
    respondedCount: 0,
    receivedCount: 0,
    checkingCount: 0,
  };

  if (!isUuid(alertId)) return empty;

  const supabaseUrl = firstNonEmpty([
    process.env.SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ]).replace(/\/+$/g, "");

  const serviceRole = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!supabaseUrl || !serviceRole) return empty;

  const admin = createAdminClient(supabaseUrl, serviceRole);

  try {
    const { data, error } = await admin
      .from("threat_alerts")
      .select("*")
      .eq("id", alertId)
      .maybeSingle();

    if (error || !data || typeof data !== "object") return empty;

    const alert = data as JsonRow;
    const ownerUserId = clean(alert.owner_user_id);

    let userProfile: JsonRow | null = null;
    let profile: JsonRow | null = null;

    if (ownerUserId) {
      try {
        const { data: row } = await admin
          .from("user_profile")
          .select("display_name,first_name,last_name,profile_photo_url")
          .eq("user_id", ownerUserId)
          .maybeSingle();

        if (row && typeof row === "object") {
          userProfile = row as JsonRow;
        }
      } catch {}

      try {
        const { data: row } = await admin
          .from("profiles")
          .select("avatar_url,verified")
          .eq("id", ownerUserId)
          .maybeSingle();

        if (row && typeof row === "object") {
          profile = row as JsonRow;
        }
      } catch {}
    }

    const firstName = firstNonEmpty([
      userProfile?.first_name,
      alert.owner_first_name,
    ]);

    const lastName = clean(userProfile?.last_name);

    const ownerName = firstNonEmpty([
      userProfile?.display_name,
      [firstName, lastName].filter(Boolean).join(" "),
      alert.owner_full_name,
      firstName,
      "StayKnown member",
    ]);

    const imageVersion = encodeURIComponent(
      firstNonEmpty([
        alert.updated_at,
        alert.created_at,
        Date.now().toString(),
      ]),
    );

    const avatarUrl =
      `/api/threat-alert-image?alert=${encodeURIComponent(alertId)}` +
      `&kind=avatar&v=${imageVersion}`;

    const lat = numberOf(alert.lat);
    const lng = numberOf(alert.lng);

    return {
      found: true,
      ownerName,
      ownerAvatarUrl: avatarUrl,
      verified:
        profile?.verified === true ||
        Boolean(clean(alert.owner_verification_badge)),
      verificationBadge: clean(alert.owner_verification_badge),
      status: clean(alert.status),
      place: firstNonEmpty([alert.place, alert.location_name]),
      lat,
      lng,
      accuracyMeters: numberOf(
        firstNonEmpty([alert.accuracy_meters, alert.accuracy]),
      ),
      locationStatus: firstNonEmpty([
        alert.location_status,
        alert.location_source,
      ]),
      triggeredAt: firstNonEmpty([
        alert.triggered_at,
        alert.activated_at,
        alert.created_at,
      ]),
      recipientsCount: intOf(alert.recipients_count),
      respondedCount: intOf(alert.responded_count),
      receivedCount: intOf(alert.received_count),
      checkingCount: intOf(alert.checking_count),
    };
  } catch {
    return empty;
  }
}

function ResultStatusIcon({
  successful,
  closed,
  expiredOrInvalid,
}: {
  successful: boolean;
  closed: boolean;
  expiredOrInvalid: boolean;
}) {
  const path =
    successful || closed
      ? "M7.7 12.4l2.7 2.7 5.9-6"
      : expiredOrInvalid
        ? "M12 7.5v5l3 1.8"
        : "M12 8.2v4.4m0 3.2h.01";

  return (
    <div
      aria-hidden="true"
      style={{
        width: 74,
        height: 74,
        borderRadius: 24,
        margin: "23px auto 17px",
        display: "grid",
        placeItems: "center",
        background: successful ? "#111318" : "#eceff1",
        color: successful ? "#ffffff" : "#111318",
        border: "1px solid rgba(0,0,0,0.09)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,.88), 0 10px 24px rgba(0,0,0,.08)",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width="34"
        height="34"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="8.5" />
        <path d={path} />
      </svg>
    </div>
  );
}

export default async function ThreatAlertResponsePage({
  searchParams,
}: PageProps) {
  const params = await Promise.resolve(searchParams);

  const alertId = first(params.alert);
  const recipientId = first(params.recipient);
  const action = normalizeAction(first(params.action));
  const exp = first(params.exp);
  const sig = first(params.sig);

  const missing = !alertId || !recipientId || !action || !exp || !sig;

  const submissionPromise: Promise<{
    status: number;
    result: FunctionResult;
  }> = missing
    ? Promise.resolve({
        status: 400,
        result: {
          ok: false,
          error: "This secure Threat Alert response link is incomplete.",
        },
      })
    : submitSignedResponse({
        alertId,
        recipientId,
        action,
        exp,
        sig,
      });

  const [submission, alert] = await Promise.all([
    submissionPromise,
    loadAlertSummary(alertId),
  ]);

  const result: FunctionResult = submission.result;
  const successful = result.ok === true;
  const closed = result.closed === true || submission.status === 409;
  const expiredOrInvalid =
    submission.status === 401 ||
    submission.status === 403 ||
    (!successful &&
      String(result.error ?? "")
        .toLowerCase()
        .includes("unauthorized"));

  const label = actionLabel(result.acknowledgement?.response_kind ?? action);

  const title = successful
    ? `${label} recorded`
    : closed
      ? "Threat Alert already ended"
      : expiredOrInvalid
        ? "Response link invalid or expired"
        : "Response not recorded";

  const body = successful
    ? result.already_recorded
      ? `Your ${label.toLowerCase()} response was already recorded.`
      : result.message ||
        `StayKnown recorded your ${label.toLowerCase()} response.`
    : closed
      ? "The person who activated this Threat Alert has already ended or resolved it."
      : expiredOrInvalid
        ? "For safety, secure response links expire and cannot be reused after their valid period."
        : result.error || "StayKnown could not record this response right now.";

  const logoUrl = ORIGINAL_LOGO_ENDPOINT;
  const identityImage = alert.ownerAvatarUrl;
  const locationText =
    alert.place ||
    (alert.lat != null && alert.lng != null
      ? coordinatesLabel(alert.lat, alert.lng)
      : "A confirmed location was not attached when this alert was sent.");

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 10% 0%, rgba(255,255,255,.98), transparent 35%), linear-gradient(145deg, #eef1f4 0%, #ffffff 48%, #e5e8eb 100%)",
        color: "#111318",
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
          maxWidth: 620,
          background: "rgba(255,255,255,0.95)",
          border: "1px solid rgba(0,0,0,0.085)",
          borderRadius: 34,
          padding: "27px 23px 24px",
          boxShadow:
            "0 32px 90px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.98)",
          textAlign: "center",
        }}
      >
        <div
          role="img"
          aria-label="StayKnown"
          style={{
            display: "block",
            width: 72,
            height: 72,
            margin: "0 auto 13px",
            borderRadius: 22,
            backgroundColor: "#ffffff",
            backgroundImage: `url("${logoUrl}")`,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
          }}
        />

        <div
          style={{
            fontSize: 12,
            fontWeight: 950,
            letterSpacing: "2.2px",
          }}
        >
          STAYKNOWN™
        </div>

        <div
          style={{
            marginTop: 6,
            fontSize: 9.5,
            color: "#777b80",
            fontWeight: 850,
            letterSpacing: "1.05px",
          }}
        >
          A 6 CLEMENT JOSHUA SERVICE™
        </div>

        <ResultStatusIcon
          successful={successful}
          closed={closed}
          expiredOrInvalid={expiredOrInvalid}
        />

        <h1
          style={{
            margin: 0,
            fontSize: 25,
            lineHeight: 1.15,
            letterSpacing: "-0.45px",
            fontWeight: 950,
          }}
        >
          {title}
        </h1>

        <p
          style={{
            margin: "13px auto 0",
            maxWidth: 480,
            fontSize: 13.5,
            lineHeight: 1.62,
            color: "#41464c",
            fontWeight: 650,
          }}
        >
          {body}
        </p>

        {alert.found ? (
          <div
            style={{
              marginTop: 21,
              padding: 15,
              borderRadius: 25,
              background:
                "linear-gradient(145deg, rgba(255,255,255,.96), rgba(236,239,242,.86))",
              border: "1px solid rgba(0,0,0,.065)",
              textAlign: "left",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                role="img"
                aria-label={`${alert.ownerName} profile photo`}
                style={{
                  width: 58,
                  height: 58,
                  flex: "0 0 58px",
                  overflow: "hidden",
                  borderRadius: 999,
                  display: "grid",
                  placeItems: "center",
                  color: "#111318",
                  backgroundColor: "#ffffff",
                  backgroundImage: identityImage
                    ? `url("${identityImage}")`
                    : "none",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                  border: "1px solid rgba(17,19,24,.12)",
                  boxShadow: "0 8px 18px rgba(0,0,0,.10)",
                  fontSize: 19,
                  fontWeight: 950,
                }}
              >
                {!identityImage
                  ? alert.ownerName.trim().slice(0, 1).toUpperCase() || "S"
                  : null}
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    color: "#73777c",
                    fontSize: 8,
                    fontWeight: 950,
                    letterSpacing: "1.25px",
                    textTransform: "uppercase",
                  }}
                >
                  Threat Alert from
                </div>

                <div
                  style={{
                    marginTop: 4,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: 17,
                    fontWeight: 950,
                  }}
                >
                  {alert.ownerName}
                  {alert.verified ? " ✓" : ""}
                </div>

                <div
                  style={{
                    marginTop: 5,
                    color: "#73777c",
                    fontSize: 10,
                    fontWeight: 750,
                  }}
                >
                  {formatDateTime(alert.triggeredAt)}
                </div>
              </div>

              <div
                style={{
                  maxWidth: 112,
                  padding: "8px 10px",
                  borderRadius: 999,
                  color: alert.status === "active" ? "#ffffff" : "#33373c",
                  background: alert.status === "active" ? "#111318" : "#eef0f2",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: 8,
                  fontWeight: 950,
                  letterSpacing: ".65px",
                  textTransform: "uppercase",
                }}
              >
                {statusLabel(alert.status)}
              </div>
            </div>

            <div
              style={{
                marginTop: 13,
                padding: 13,
                borderRadius: 19,
                background: "rgba(255,255,255,.62)",
                border: "1px solid rgba(0,0,0,.055)",
              }}
            >
              <div
                style={{
                  color: "#73777c",
                  fontSize: 8,
                  fontWeight: 950,
                  letterSpacing: "1.1px",
                  textTransform: "uppercase",
                }}
              >
                Last confirmed location
              </div>

              <div
                style={{
                  marginTop: 7,
                  fontSize: 13.5,
                  lineHeight: 1.45,
                  fontWeight: 900,
                }}
              >
                {locationText}
              </div>

              <div
                style={{
                  marginTop: 6,
                  color: "#6f7479",
                  fontSize: 10,
                  lineHeight: 1.45,
                  fontWeight: 700,
                }}
              >
                {accuracyLabel(alert.accuracyMeters)}
                {alert.locationStatus
                  ? ` • ${alert.locationStatus.replaceAll("_", " ")}`
                  : ""}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0,1fr))",
                gap: 7,
                marginTop: 9,
              }}
            >
              {[
                ["Contacts", alert.recipientsCount],
                ["Responses", alert.respondedCount],
                ["Received", alert.receivedCount],
                ["Checking", alert.checkingCount],
              ].map(([name, value]) => (
                <div
                  key={String(name)}
                  style={{
                    minWidth: 0,
                    padding: "9px 7px",
                    borderRadius: 16,
                    background: "rgba(255,255,255,.58)",
                    border: "1px solid rgba(0,0,0,.05)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      overflow: "hidden",
                      color: "#777b80",
                      fontSize: 7,
                      fontWeight: 950,
                      letterSpacing: ".6px",
                      textOverflow: "ellipsis",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {String(name)}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      fontWeight: 950,
                    }}
                  >
                    {String(value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div
          style={{
            marginTop: 18,
            borderRadius: 22,
            padding: 17,
            background: "#111318",
            color: "#ffffff",
            textAlign: "left",
          }}
        >
          <div
            style={{
              fontSize: 10,
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
              fontSize: 11.5,
              lineHeight: 1.6,
              fontWeight: 650,
            }}
          >
            {CONTACT_CAUTION}
          </p>
        </div>

        <p
          style={{
            margin: "18px 3px 0",
            color: "#777b80",
            fontSize: 9.8,
            lineHeight: 1.55,
            fontWeight: 650,
          }}
        >
          StayKnown does not replace emergency services. This page records the
          signed response selected from the original Threat Alert email and
          displays the alert information available to the responder.
        </p>
      </section>
    </main>
  );
}
