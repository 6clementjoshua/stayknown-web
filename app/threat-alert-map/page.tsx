import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

import ThreatAlertMapClient, {
  type ThreatAlertMapPayload,
} from "./ThreatAlertMapClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Threat Alert location | StayKnown",
  description:
    "Secure StayKnown Threat Alert identity, location and responder guidance.",
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

type JsonRow = Record<string, unknown>;

const CONTACT_CAUTION =
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

function boolOf(value: unknown): boolean {
  if (value === true) return true;
  const text = clean(value).toLowerCase();
  return text === "true" || text === "1";
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

function isActiveStatus(value: unknown): boolean {
  const status = clean(value).toLowerCase();
  return status === "dispatching" || status === "active";
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

async function fetchCurrentOwnerIdentity(params: {
  admin: AdminClient;
  ownerUserId: string;
  alert: JsonRow;
}): Promise<{
  name: string;
  firstName: string;
  verified: boolean;
  verificationBadge: string;
}> {
  const { admin, ownerUserId, alert } = params;

  let userProfile: JsonRow | null = null;
  let profile: JsonRow | null = null;
  let gallery: JsonRow | null = null;
  let badge: JsonRow | null = null;

  try {
    const { data } = await admin
      .from("user_profile")
      .select("display_name,first_name,last_name,profile_photo_url,email")
      .eq("user_id", ownerUserId)
      .maybeSingle();

    if (data && typeof data === "object") userProfile = data as JsonRow;
  } catch {}

  try {
    const { data } = await admin
      .from("profiles")
      .select("avatar_url,verified,email")
      .eq("id", ownerUserId)
      .maybeSingle();

    if (data && typeof data === "object") profile = data as JsonRow;
  } catch {}

  try {
    const { data } = await admin
      .from("safety_gallery")
      .select("path,created_at")
      .eq("user_id", ownerUserId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data && typeof data === "object") gallery = data as JsonRow;
  } catch {}

  try {
    const { data } = await admin
      .from("user_verification_badges")
      .select("badge_type,status,awarded_at,removed_at")
      .eq("user_id", ownerUserId)
      .eq("status", "active")
      .is("removed_at", null)
      .order("awarded_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data && typeof data === "object") badge = data as JsonRow;
  } catch {}

  const firstName = firstNonEmpty([
    userProfile?.first_name,
    alert.owner_first_name,
  ]);

  const lastName = clean(userProfile?.last_name);

  const name = firstNonEmpty([
    userProfile?.display_name,
    [firstName, lastName].filter(Boolean).join(" "),
    alert.owner_full_name,
    firstName,
    "StayKnown member",
  ]);

  const verificationBadge = firstNonEmpty([
    badge?.badge_type,
    alert.owner_verification_badge,
  ]);

  const verified =
    Boolean(verificationBadge) ||
    boolOf(profile?.verified) ||
    clean(alert.owner_verification_badge).toLowerCase() === "verified";

  return {
    name,
    firstName: firstName || name.split(/\s+/).filter(Boolean)[0] || "Member",
    verified,
    verificationBadge,
  };
}

function responseKindOf(row: JsonRow): string {
  return firstNonEmpty([
    row.response_kind,
    row.acknowledgement_kind,
    row.response,
  ])
    .toLowerCase()
    .replaceAll("-", "_")
    .replaceAll(" ", "_");
}

async function fetchResponseCounts(params: {
  admin: AdminClient;
  alertId: string;
  alert: JsonRow;
}): Promise<{
  recipientsCount: number;
  respondedCount: number;
  receivedCount: number;
  checkingCount: number;
  contactedEmergencyHelpCount: number;
  unableToRespondCount: number;
}> {
  const fallback = {
    recipientsCount: intOf(params.alert.recipients_count),
    respondedCount: intOf(params.alert.responded_count),
    receivedCount: intOf(params.alert.received_count),
    checkingCount: intOf(params.alert.checking_count),
    contactedEmergencyHelpCount: intOf(
      params.alert.contacted_emergency_help_count,
    ),
    unableToRespondCount: intOf(params.alert.unable_to_respond_count),
  };

  try {
    const { data, error } = await params.admin
      .from("threat_alert_recipients")
      .select(
        "id,response_kind,acknowledgement_kind,response,acknowledged_at,responded_at",
      )
      .eq("alert_id", params.alertId);

    if (error || !Array.isArray(data)) return fallback;

    let receivedCount = 0;
    let checkingCount = 0;
    let contactedEmergencyHelpCount = 0;
    let unableToRespondCount = 0;
    let respondedCount = 0;

    for (const rawRow of data) {
      const row =
        rawRow && typeof rawRow === "object"
          ? (rawRow as JsonRow)
          : ({} as JsonRow);

      const kind = responseKindOf(row);
      const hasResponse =
        Boolean(kind) ||
        Boolean(clean(row.acknowledged_at)) ||
        Boolean(clean(row.responded_at));

      if (hasResponse) respondedCount += 1;

      switch (kind) {
        case "received":
        case "alert_received":
        case "threat_alert_received":
          receivedCount += 1;
          break;

        case "checking":
        case "threat_alert_checking":
          checkingCount += 1;
          break;

        case "contacted_emergency_help":
        case "emergency_help":
          contactedEmergencyHelpCount += 1;
          break;

        case "unable_to_respond":
        case "cannot_respond":
        case "cant_respond":
        case "threat_alert_unable":
          unableToRespondCount += 1;
          break;
      }
    }

    return {
      recipientsCount: data.length,
      respondedCount,
      receivedCount,
      checkingCount,
      contactedEmergencyHelpCount,
      unableToRespondCount,
    };
  } catch {
    return fallback;
  }
}

async function loadThreatAlert(alertId: string): Promise<{
  status: number;
  payload: ThreatAlertMapPayload | null;
  error: string;
}> {
  const supabaseUrl = firstNonEmpty([
    process.env.SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ]).replace(/\/+$/g, "");

  const serviceRole = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!supabaseUrl || !serviceRole) {
    return {
      status: 500,
      payload: null,
      error:
        "StayKnown’s secure Threat Alert map service is not configured on this website deployment.",
    };
  }

  const admin = createAdminClient(supabaseUrl, serviceRole);

  try {
    const { data, error } = await admin
      .from("threat_alerts")
      .select("*")
      .eq("id", alertId)
      .maybeSingle();

    if (error) {
      return {
        status: 500,
        payload: null,
        error: "StayKnown could not load this Threat Alert right now.",
      };
    }

    if (!data || typeof data !== "object") {
      return {
        status: 404,
        payload: null,
        error: "This Threat Alert could not be found.",
      };
    }

    const alert = data as JsonRow;
    const ownerUserId = clean(alert.owner_user_id);

    if (!ownerUserId) {
      return {
        status: 422,
        payload: null,
        error: "This Threat Alert is missing its sender identity.",
      };
    }

    const [identity, counts] = await Promise.all([
      fetchCurrentOwnerIdentity({
        admin,
        ownerUserId,
        alert,
      }),
      fetchResponseCounts({
        admin,
        alertId,
        alert,
      }),
    ]);

    const lat = numberOf(alert.lat);
    const lng = numberOf(alert.lng);
    const accuracyMeters = numberOf(
      firstNonEmpty([alert.accuracy_meters, alert.accuracy]),
    );

    const imageVersion = encodeURIComponent(
      firstNonEmpty([
        alert.updated_at,
        alert.created_at,
        Date.now().toString(),
      ]),
    );

    const ownerAvatarUrl =
      `/api/threat-alert-image?alert=${encodeURIComponent(alertId)}` +
      `&kind=avatar&v=${imageVersion}`;

    const ownerSafetyImageUrl =
      `/api/threat-alert-image?alert=${encodeURIComponent(alertId)}` +
      `&kind=safety&v=${imageVersion}`;

    const payload: ThreatAlertMapPayload = {
      alertId,
      ownerName: identity.name,
      ownerFirstName: identity.firstName,
      ownerAvatarUrl,
      ownerSafetyImageUrl,
      ownerVerified: identity.verified,
      ownerVerificationBadge: identity.verificationBadge,
      status: clean(alert.status) || "recorded",
      active: isActiveStatus(alert.status),
      place: firstNonEmpty([alert.place, alert.location_name]),
      lat,
      lng,
      accuracyMeters,
      locationStatus: firstNonEmpty([
        alert.location_status,
        alert.location_source,
      ]),
      triggeredAt: firstNonEmpty([alert.triggered_at, alert.created_at]),
      activatedAt: clean(alert.activated_at),
      expiresAt: clean(alert.expires_at),
      resolvedAt: firstNonEmpty([
        alert.resolved_at,
        alert.ended_at,
        alert.cancelled_at,
      ]),
      externalMapUrl:
        safeHttpUrl(alert.external_map_url) ||
        (lat != null && lng != null
          ? `https://www.google.com/maps?q=${encodeURIComponent(
              `${lat},${lng}`,
            )}`
          : ""),
      recipientsCount: counts.recipientsCount,
      respondedCount: counts.respondedCount,
      receivedCount: counts.receivedCount,
      checkingCount: counts.checkingCount,
      contactedEmergencyHelpCount: counts.contactedEmergencyHelpCount,
      unableToRespondCount: counts.unableToRespondCount,
      caution: CONTACT_CAUTION,
    };

    return {
      status: 200,
      payload,
      error: "",
    };
  } catch {
    return {
      status: 503,
      payload: null,
      error: "StayKnown could not reach the Threat Alert service right now.",
    };
  }
}

function ErrorPage({ title, message }: { title: string; message: string }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px 14px",
        color: "#111318",
        background:
          "linear-gradient(145deg, #eef1f4 0%, #ffffff 48%, #e5e8eb 100%)",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 520,
          padding: "28px 23px 24px",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 32,
          background: "rgba(255,255,255,0.95)",
          boxShadow:
            "0 30px 90px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.98)",
          textAlign: "center",
        }}
      >
        <div
          aria-label="StayKnown"
          role="img"
          style={{
            display: "grid",
            placeItems: "center",
            width: 66,
            height: 66,
            margin: "0 auto 13px",
            overflow: "hidden",
            borderRadius: 20,
            background: "#ffffff",
          }}
        >
          <svg
            viewBox="0 0 120 120"
            width="66"
            height="66"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="120" height="120" rx="26" fill="#ffffff" />
            <text
              x="60"
              y="63"
              textAnchor="middle"
              fill="#08090b"
              fontSize="58"
              fontWeight="950"
              fontFamily="Arial Black, Arial, sans-serif"
            >
              6
            </text>
            <text
              x="60"
              y="86"
              textAnchor="middle"
              fill="#08090b"
              fontSize="12"
              fontWeight="950"
              letterSpacing="1.2"
              fontFamily="Arial Black, Arial, sans-serif"
            >
              STAYKNOWN
            </text>
          </svg>
        </div>

        <div
          style={{
            fontSize: 12,
            fontWeight: 950,
            letterSpacing: "2px",
          }}
        >
          STAYKNOWN™
        </div>

        <div
          style={{
            marginTop: 5,
            color: "#777b80",
            fontSize: 9,
            fontWeight: 850,
            letterSpacing: "1px",
          }}
        >
          A 6 CLEMENT JOSHUA SERVICE™
        </div>

        <div
          style={{
            display: "grid",
            placeItems: "center",
            width: 72,
            height: 72,
            margin: "23px auto 17px",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 24,
            background: "#eef0f2",
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
            lineHeight: 1.16,
            letterSpacing: "-0.35px",
            fontWeight: 950,
          }}
        >
          {title}
        </h1>

        <p
          style={{
            maxWidth: 430,
            margin: "13px auto 0",
            color: "#555a60",
            fontSize: 13,
            lineHeight: 1.62,
            fontWeight: 650,
          }}
        >
          {message}
        </p>

        <div
          style={{
            marginTop: 19,
            padding: "14px",
            borderRadius: 20,
            color: "#ffffff",
            background: "#111318",
            fontSize: 11,
            lineHeight: 1.58,
            fontWeight: 650,
          }}
        >
          Verify the person through a trusted method. Do not travel alone or
          place yourself at risk based only on an alert.
        </div>
      </section>
    </main>
  );
}

export default async function ThreatAlertMapPage({ searchParams }: PageProps) {
  const params = await Promise.resolve(searchParams);
  const alertId = first(params.alert);

  if (!isUuid(alertId)) {
    return (
      <ErrorPage
        title="Threat Alert link incomplete"
        message="This link does not contain a valid Threat Alert identifier. Reopen the original StayKnown email or notification."
      />
    );
  }

  const result = await loadThreatAlert(alertId);

  if (!result.payload) {
    return (
      <ErrorPage
        title={
          result.status === 404
            ? "Threat Alert not found"
            : "Threat Alert unavailable"
        }
        message={result.error}
      />
    );
  }

  return <ThreatAlertMapClient alert={result.payload} />;
}
