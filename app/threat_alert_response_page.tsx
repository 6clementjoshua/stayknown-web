import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Threat Alert response | StayKnown",
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

function first(value: SearchValue): string {
  if (Array.isArray(value)) return String(value[0] ?? "").trim();
  return String(value ?? "").trim();
}

function normalizeAction(value: string): string {
  const clean = value.trim().toLowerCase();

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

  return aliases[clean] ?? "";
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

export default async function ThreatAlertResponsePage({
  searchParams,
}: PageProps) {
  const params = await Promise.resolve(searchParams);

  const alertId = first(params.alert);
  const recipientId = first(params.recipient);
  const action = normalizeAction(first(params.action));
  const exp = first(params.exp);
  const sig = first(params.sig);

  const missing =
    !alertId || !recipientId || !action || !exp || !sig;

  const submission = missing
    ? {
        status: 400,
        result: {
          ok: false,
          error: "This secure Threat Alert response link is incomplete.",
        } satisfies FunctionResult,
      }
    : await submitSignedResponse({
        alertId,
        recipientId,
        action,
        exp,
        sig,
      });

  const result = submission.result;
  const successful = result.ok === true;
  const closed = result.closed === true || submission.status === 409;
  const expiredOrInvalid =
    submission.status === 401 ||
    submission.status === 403 ||
    (!successful &&
      String(result.error ?? "").toLowerCase().includes("unauthorized"));

  const label = actionLabel(
    result.acknowledgement?.response_kind ?? action,
  );

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
        : result.error ||
          "StayKnown could not record this response right now.";

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(145deg, #f5f5f5 0%, #ffffff 48%, #e9eaec 100%)",
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
          maxWidth: 560,
          background: "rgba(255,255,255,0.94)",
          border: "1px solid rgba(0,0,0,0.09)",
          borderRadius: 32,
          padding: "30px 24px 25px",
          boxShadow:
            "0 28px 80px rgba(0,0,0,0.13), inset 0 1px 0 rgba(255,255,255,0.9)",
          textAlign: "center",
        }}
      >
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
            fontSize: 10,
            color: "#777777",
            fontWeight: 800,
            letterSpacing: "1.2px",
          }}
        >
          A 6 Clement Joshua service™
        </div>

        <div
          aria-hidden="true"
          style={{
            width: 74,
            height: 74,
            borderRadius: 24,
            margin: "24px auto 18px",
            display: "grid",
            placeItems: "center",
            background: successful ? "#111111" : "#eceef0",
            color: successful ? "#ffffff" : "#111111",
            border: "1px solid rgba(0,0,0,0.10)",
            fontSize: 31,
            fontWeight: 950,
          }}
        >
          {successful ? "✓" : closed ? "—" : "!"}
        </div>

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
            margin: "14px auto 0",
            maxWidth: 450,
            fontSize: 14,
            lineHeight: 1.65,
            color: "#3e4146",
            fontWeight: 600,
          }}
        >
          {body}
        </p>

        {successful ? (
          <div
            style={{
              marginTop: 19,
              borderRadius: 20,
              padding: "14px 15px",
              background: "#f3f4f5",
              border: "1px solid rgba(0,0,0,0.07)",
              fontSize: 12,
              fontWeight: 850,
            }}
          >
            Current response: {label}
          </div>
        ) : null}

        <div
          style={{
            marginTop: 20,
            borderRadius: 22,
            padding: "17px",
            background: "#111111",
            color: "#ffffff",
            textAlign: "left",
          }}
        >
          <div
            style={{
              fontSize: 11,
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
            Verify through a trusted method you already know. Do not travel
            alone or place yourself at risk based only on an alert. Contact the
            appropriate local emergency service when you believe there is
            immediate danger. An acknowledgement does not mean help is on the
            way.
          </p>
        </div>

        <p
          style={{
            margin: "19px 3px 0",
            color: "#777b80",
            fontSize: 10.5,
            lineHeight: 1.55,
            fontWeight: 650,
          }}
        >
          StayKnown does not replace emergency services. This page records only
          the signed response selected from the original Threat Alert email.
        </p>
      </section>
    </main>
  );
}