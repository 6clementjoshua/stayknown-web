// app/api/live/practice/route.ts
// StayKnown Upgrade Master File Record
//
// NEW FILE
//
// Protected Practice Mode action route for the signed LIVE Visit website.
//
// CRITICAL SIMULATION BOUNDARY
// ----------------------------
// This route never calls or writes to real:
// - Visit mutation or Visit-ending authorities;
// - SOS, Threat Alert, missed I’M SAFE or emergency-dispatch authorities;
// - contact notification, push, email or delivery authorities;
// - real contact-response authorities;
// - LIVE-location write authorities;
// - guardian, responder or contact-approval authorities.
//
// It returns clearly labelled simulated advisory/response evidence only.
//
// The authenticated app's separate Practice Mode service and
// run_practice_safety_test Edge Function remain the authorities for persisted
// owner PracticeSafetySession records. A recipient opening a signed website
// link does not possess the owner's authenticated app session, so this route
// must not impersonate the owner or write into their Practice Mode history.

import { createHmac } from "node:crypto";

import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  AdvisorySnapshot,
  LivePracticeResponse,
  LivePracticeState,
  LiveResponseAction,
  LiveResponseRecord,
} from "../../../live/live-types";
import {
  accessFromUnknown,
  canUseInteractiveLiveActions,
  clean,
  createAdminClient,
  validateVisitAccess,
  verifyLiveAccess,
  visitHasEnded,
  visitOwnerUserId,
} from "../../../live/live-access";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const POLICY_VERSION = "visit-map-safety-use-v2-2026-07-17";

const RESPONSE_HEADERS: Record<string, string> = {
  "Cache-Control": "private, no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
};

const ADVISORY_PRESETS: Record<string, string> = {
  leave_area:
    "I’m concerned about your current area. Please leave carefully and contact me.",
  check_route:
    "I know this route. You may be heading toward an unsafe area. Please check your route now.",
  location_mismatch:
    "Your current location does not match where I expected you to be. Please confirm your location.",
};

const ACCEPTED_RESPONSE_PROFILES = new Set([
  "visit_time_contact_response",
  "practice_contact_response",
]);

type JsonObject = Record<string, unknown>;

type PracticeAction = "send_advisory" | "record_response";

type PracticeEvidence = {
  practice: boolean;
  source: "visit" | "active_visit_checkin" | "safety_command" | "none";
};

type PracticeBoundary = {
  is_practice: true;
  dispatch_mode: "simulated";
  real_alert_sent: false;
  real_contact_delivery: false;
  real_location_shared: false;
  emergency_services_contacted: false;
  real_visit_mutated: false;
  real_response_recorded: false;
  persisted_to_owner_practice_history: false;
};

type PracticeRouteResponse = LivePracticeResponse & {
  action: PracticeAction;
  label: string;
  message: string;
  advisory?: AdvisorySnapshot;
  response?: LiveResponseRecord;
  boundary: PracticeBoundary;
  persistence: {
    saved: false;
    reason: "signed_recipient_simulation_only";
  };
};

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: RESPONSE_HEADERS,
  });
}

function asObject(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
}

function booleanValue(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;

  const normalized = clean(value).toLowerCase();

  if (normalized === "true" || normalized === "1" || normalized === "yes") {
    return true;
  }

  if (normalized === "false" || normalized === "0" || normalized === "no") {
    return false;
  }

  return null;
}

function firstPracticeFlag(rows: JsonObject[]): boolean {
  const keys = [
    "is_practice",
    "practice_mode",
    "practice_only",
    "simulated",
    "simulation",
  ] as const;

  for (const row of rows) {
    for (const key of keys) {
      if (booleanValue(row[key]) === true) {
        return true;
      }
    }
  }

  return false;
}

function configuredSiteOrigin(): string {
  const raw = clean(
    process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.SITE_URL ??
      "https://www.stay-known.com",
  );

  try {
    return new URL(raw).origin;
  } catch {
    return "https://www.stay-known.com";
  }
}

function allowedOrigins(req: Request): Set<string> {
  const origins = new Set<string>();

  try {
    origins.add(new URL(req.url).origin);
  } catch {}

  origins.add(configuredSiteOrigin());

  return origins;
}

function requestIsSameOrigin(req: Request): boolean {
  const allowed = allowedOrigins(req);
  const fetchSite = clean(req.headers.get("sec-fetch-site")).toLowerCase();

  if (fetchSite === "cross-site" || fetchSite === "none") {
    return false;
  }

  const origin = clean(req.headers.get("origin"));

  if (origin && !allowed.has(origin)) {
    return false;
  }

  const referer = clean(req.headers.get("referer"));

  if (referer) {
    try {
      if (!allowed.has(new URL(referer).origin)) {
        return false;
      }
    } catch {
      return false;
    }
  }

  return Boolean(
    origin ||
    referer ||
    fetchSite === "same-origin" ||
    fetchSite === "same-site",
  );
}

function contentTypeIsJson(req: Request): boolean {
  return clean(req.headers.get("content-type"))
    .toLowerCase()
    .includes("application/json");
}

function practiceBoundary(): PracticeBoundary {
  return {
    is_practice: true,
    dispatch_mode: "simulated",
    real_alert_sent: false,
    real_contact_delivery: false,
    real_location_shared: false,
    emergency_services_contacted: false,
    real_visit_mutated: false,
    real_response_recorded: false,
    persisted_to_owner_practice_history: false,
  };
}

function requestPreservesPracticeBoundary(body: JsonObject): boolean {
  const dispatchMode = clean(body.dispatch_mode).toLowerCase();

  if (body.is_practice !== true) return false;

  if (dispatchMode && dispatchMode !== "simulated") {
    return false;
  }

  const forbiddenTrueFields = [
    "allow_real_delivery",
    "allow_location_sharing",
    "allow_emergency_dispatch",
    "real_alert_sent",
    "real_contact_delivery",
    "real_location_shared",
    "emergency_services_contacted",
  ] as const;

  return !forbiddenTrueFields.some(
    (field) => booleanValue(body[field]) === true,
  );
}

function normalizeAction(value: unknown): PracticeAction | null {
  const normalized = clean(value)
    .toLowerCase()
    .replaceAll("-", "_")
    .replaceAll(" ", "_");

  if (normalized === "send_advisory" || normalized === "record_response") {
    return normalized;
  }

  return null;
}

function normalizeResponseAction(value: unknown): LiveResponseAction | null {
  const normalized = clean(value)
    .toLowerCase()
    .replaceAll("’", "'")
    .replaceAll("-", "_")
    .replaceAll(" ", "_");

  switch (normalized) {
    case "checking":
    case "visit_time_checking":
    case "sk_visit_time_checking":
      return "checking";

    case "reached":
    case "reached_them":
    case "visit_time_reached":
    case "sk_visit_time_reached":
      return "reached";

    case "cannot_reach":
    case "cant_reach":
    case "can't_reach":
    case "unable_to_reach":
    case "cannot_respond":
    case "visit_time_cannot_reach":
    case "sk_visit_time_cannot_reach":
      return "cannot_reach";

    default:
      return null;
  }
}

function normalizeCustomMessage(value: unknown): string {
  return clean(value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function advisoryMessage(kind: string, customMessage: string): string {
  if (Object.prototype.hasOwnProperty.call(ADVISORY_PRESETS, kind)) {
    return ADVISORY_PRESETS[kind];
  }

  if (kind !== "custom") {
    throw new Error("unsupported_advisory_kind");
  }

  const message = normalizeCustomMessage(customMessage);

  if (!message) {
    throw new Error("custom_message_required");
  }

  if (message.length > 160) {
    throw new Error("custom_message_too_long");
  }

  if (/https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|app)\b/i.test(message)) {
    throw new Error("custom_message_links_not_allowed");
  }

  const prohibitedPatterns = [
    /\bcome\s+alone\b/i,
    /\bmeet\s+me\s+alone\b/i,
    /\bdo\s+not\s+tell\s+(anyone|your\s+family|the\s+police)\b/i,
    /\bdon['’]?t\s+tell\s+(anyone|your\s+family|the\s+police)\b/i,
    /\byou\s+must\s+obey\b/i,
    /\bi\s+am\s+watching\s+you\b/i,
    /\bi\s+will\s+(hurt|kill|punish|attack)\s+you\b/i,
    /\bi['’]?ll\s+(hurt|kill|punish|attack)\s+you\b/i,
  ];

  if (prohibitedPatterns.some((pattern) => pattern.test(message))) {
    throw new Error("custom_message_policy_blocked");
  }

  return message;
}

function simulationSecret(): string {
  return clean(
    process.env.LIVE_AUDIT_HASH_SECRET ??
      process.env.INTERNAL_EVENT_SECRET ??
      process.env.TRACKING_SIGNING_SECRET,
  );
}

function opaqueSimulationId(
  kind: "advisory" | "response",
  parts: string[],
): string {
  const secret = simulationSecret();
  const material = [
    "stayknown",
    "practice",
    kind,
    ...parts.map((part) => clean(part)),
  ].join(":");

  if (!secret) {
    return `practice-${kind}`;
  }

  const digest = createHmac("sha256", secret)
    .update(material, "utf8")
    .digest("base64url")
    .slice(0, 40);

  return `practice-${kind}-${digest}`;
}

function responseCopy(action: LiveResponseAction): {
  label: string;
  message: string;
} {
  switch (action) {
    case "checking":
      return {
        label: "Checking simulated",
        message:
          "Practice Mode simulated a contact selecting Checking. No real person was notified or contacted.",
      };

    case "reached":
      return {
        label: "Reached them simulated",
        message:
          "Practice Mode simulated a contact selecting Reached them. This does not prove that anyone was reached.",
      };

    case "cannot_reach":
      return {
        label: "Can’t reach simulated",
        message:
          "Practice Mode simulated a contact selecting Can’t reach. No real escalation or emergency action was started.",
      };
  }
}

function isBackendObjectMissing(error: unknown): boolean {
  const row = asObject(error);
  const code = clean(row.code).toUpperCase();
  const message = [
    clean(row.message),
    clean(row.details),
    clean(row.hint),
    error instanceof Error ? error.message : "",
  ]
    .join(" ")
    .toLowerCase();

  return (
    code === "42P01" ||
    code === "42703" ||
    code === "42883" ||
    code === "PGRST202" ||
    code === "PGRST204" ||
    code === "PGRST205" ||
    message.includes("does not exist") ||
    message.includes("could not find the table") ||
    message.includes("could not find the function") ||
    message.includes("schema cache")
  );
}

function logDatabaseFailure(operation: string, error: unknown): void {
  const row = asObject(error);

  if (isBackendObjectMissing(error)) {
    console.info(`[SK_LIVE_PRACTICE] ${operation} is not installed yet`, {
      code: clean(row.code) || null,
    });
    return;
  }

  console.error(`[SK_LIVE_PRACTICE] ${operation} failed`, {
    code: clean(row.code) || null,
    message:
      clean(row.message) ||
      (error instanceof Error ? error.message : "unknown_error"),
    details: clean(row.details) || null,
    hint: clean(row.hint) || null,
  });
}

async function loadActiveCheckinPractice(
  admin: SupabaseClient,
  visitId: string,
  ownerUserId: string,
): Promise<boolean> {
  try {
    const result = await admin
      .from("active_visit_checkins")
      .select("*")
      .eq("visit_id", visitId)
      .eq("owner_user_id", ownerUserId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (result.error) {
      logDatabaseFailure("active Visit check-in lookup", result.error);
      return false;
    }

    const row = asObject(result.data);
    const metadata = asObject(row.metadata);
    const intelligence = asObject(row.live_visit_intelligence);

    return firstPracticeFlag([row, metadata, intelligence]);
  } catch (error) {
    logDatabaseFailure("active Visit check-in lookup", error);
    return false;
  }
}

async function loadSafetyCommandByColumn(
  admin: SupabaseClient,
  ownerUserId: string,
  visitId: string,
  column: "source_event_id" | "source_session_id",
): Promise<boolean> {
  try {
    const result = await admin
      .from("safety_command_registry")
      .select("*")
      .eq("owner_user_id", ownerUserId)
      .eq("source_kind", "visit")
      .eq(column, visitId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (result.error) {
      logDatabaseFailure(`Safety Command lookup by ${column}`, result.error);
      return false;
    }

    const row = asObject(result.data);
    const metadata = asObject(row.metadata);
    const context = asObject(row.context);

    return firstPracticeFlag([row, metadata, context]);
  } catch (error) {
    logDatabaseFailure(`Safety Command lookup by ${column}`, error);
    return false;
  }
}

async function detectPracticeEvidence(
  admin: SupabaseClient,
  params: {
    visit: JsonObject;
    visitId: string;
    ownerUserId: string;
  },
): Promise<PracticeEvidence> {
  const visitPayload = asObject(params.visit.payload);
  const visitMetadata = asObject(params.visit.metadata);

  if (firstPracticeFlag([params.visit, visitPayload, visitMetadata])) {
    return {
      practice: true,
      source: "visit",
    };
  }

  const activeCheckinPractice = await loadActiveCheckinPractice(
    admin,
    params.visitId,
    params.ownerUserId,
  );

  if (activeCheckinPractice) {
    return {
      practice: true,
      source: "active_visit_checkin",
    };
  }

  const commandByEvent = await loadSafetyCommandByColumn(
    admin,
    params.ownerUserId,
    params.visitId,
    "source_event_id",
  );

  if (commandByEvent) {
    return {
      practice: true,
      source: "safety_command",
    };
  }

  const commandBySession = await loadSafetyCommandByColumn(
    admin,
    params.ownerUserId,
    params.visitId,
    "source_session_id",
  );

  return {
    practice: commandBySession,
    source: commandBySession ? "safety_command" : "none",
  };
}

async function validateConsent(
  admin: SupabaseClient,
  params: {
    consentId: string;
    visitId: string;
    ownerUserId: string;
    recipientContactId: string;
    audience: string;
    signedVersion: string;
    signedExpiry: number;
  },
): Promise<void> {
  if (!params.consentId) {
    throw new Error("consent_required");
  }

  const result = await admin
    .from("visit_map_access_consents")
    .select(
      "id,decision,policy_version,owner_user_id,recipient_contact_id,audience,signed_exp,signed_version",
    )
    .eq("id", params.consentId)
    .eq("visit_id", params.visitId)
    .eq("owner_user_id", params.ownerUserId)
    .eq("recipient_contact_id", params.recipientContactId)
    .eq("decision", "accepted")
    .eq("policy_version", POLICY_VERSION)
    .maybeSingle();

  if (result.error) {
    logDatabaseFailure("Practice consent lookup", result.error);
    throw new Error("consent_lookup_failed");
  }

  const row = asObject(result.data);

  const matches =
    Boolean(result.data) &&
    clean(row.audience) === params.audience &&
    clean(row.signed_version) === params.signedVersion &&
    Number(row.signed_exp) === params.signedExpiry;

  if (!matches) {
    throw new Error("consent_required");
  }
}

function practiceState(ended: boolean): LivePracticeState {
  return ended ? "completed" : "active";
}

function basePracticeResult(params: {
  sessionId: string;
  state: LivePracticeState;
  action: PracticeAction;
  label: string;
  message: string;
}): Omit<PracticeRouteResponse, "advisory" | "response"> {
  return {
    ok: true,
    session_id: params.sessionId,
    action: params.action,
    label: params.label,
    message: params.message,
    practice: {
      enabled: true,
      state: params.state,
      simulated_dispatch: true,
      real_alert_sent: false,
      message: params.message,
    },
    boundary: practiceBoundary(),
    persistence: {
      saved: false,
      reason: "signed_recipient_simulation_only",
    },
  };
}

function safeFailure(error: unknown): {
  status: number;
  code: string;
  message: string;
} {
  const code = error instanceof Error ? clean(error.message) : "";

  const failures: Record<string, { status: number; message: string }> = {
    invalid_action: {
      status: 400,
      message: "Choose a supported Practice Mode action.",
    },
    practice_boundary_rejected: {
      status: 422,
      message:
        "The request attempted to weaken the Practice Mode simulation boundary.",
    },
    practice_mode_required: {
      status: 409,
      message:
        "This signed LIVE Visit is not an authorized Practice Mode session.",
    },
    practice_completed: {
      status: 409,
      message: "This Practice Mode session has already ended.",
    },
    consent_required: {
      status: 403,
      message:
        "Accept the safety-use policy before using this Practice Mode action.",
    },
    consent_lookup_failed: {
      status: 503,
      message: "StayKnown could not verify the recorded safety-use consent.",
    },
    unsupported_advisory_kind: {
      status: 400,
      message: "Choose an available simulated safety advisory.",
    },
    custom_message_required: {
      status: 400,
      message: "Enter a short simulated safety message.",
    },
    custom_message_too_long: {
      status: 400,
      message: "Keep the simulated message within 160 characters.",
    },
    custom_message_links_not_allowed: {
      status: 400,
      message: "Links are not allowed in simulated safety guidance.",
    },
    custom_message_policy_blocked: {
      status: 400,
      message: "This message cannot be used in StayKnown Practice Mode.",
    },
    invalid_response_request: {
      status: 400,
      message: "Choose Checking, Reached them or Can’t reach.",
    },
    invalid_response_profile: {
      status: 400,
      message: "This Practice Mode response profile is not supported.",
    },
    invalid_response_opportunity: {
      status: 400,
      message: "The simulated response opportunity is missing or invalid.",
    },
    visit_not_found: {
      status: 404,
      message: "This signed Practice Mode session is no longer available.",
    },
    recipient_not_authorized: {
      status: 403,
      message:
        "This recipient is not authorized to use this Practice Mode session.",
    },
    recipient_email_missing: {
      status: 403,
      message:
        "This recipient is not authorized to use this Practice Mode session.",
    },
    visit_access_failed: {
      status: 503,
      message:
        "StayKnown could not verify this Practice Mode session right now.",
    },
    recipient_access_failed: {
      status: 503,
      message:
        "StayKnown could not verify this Practice Mode recipient right now.",
    },
    live_configuration_unavailable: {
      status: 503,
      message: "The secure Practice Mode service is temporarily unavailable.",
    },
  };

  const known = failures[code];

  if (known) {
    return {
      status: known.status,
      code,
      message: known.message,
    };
  }

  return {
    status: 500,
    code: "practice_action_failed",
    message:
      "StayKnown could not complete this Practice Mode action right now.",
  };
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    if (!contentTypeIsJson(req)) {
      return jsonResponse(
        {
          ok: false,
          code: "unsupported_content_type",
          error:
            "Submit this Practice Mode action from the protected StayKnown LIVE page.",
        },
        415,
      );
    }

    if (!requestIsSameOrigin(req)) {
      return jsonResponse(
        {
          ok: false,
          code: "invalid_request_origin",
          error:
            "This Practice Mode action must be submitted from the protected StayKnown LIVE page.",
        },
        403,
      );
    }

    const body = asObject(await req.json().catch(() => ({})));

    if (!requestPreservesPracticeBoundary(body)) {
      throw new Error("practice_boundary_rejected");
    }

    const action = normalizeAction(body.action);

    if (!action) {
      throw new Error("invalid_action");
    }

    const access = accessFromUnknown(body);
    const verified = verifyLiveAccess(access);

    if (!verified.ok) {
      return jsonResponse(
        {
          ok: false,
          code: "invalid_live_access",
          error: "This signed LIVE Visit access is invalid or expired.",
        },
        401,
      );
    }

    const admin = createAdminClient();
    const accessContext = await validateVisitAccess(admin, verified);

    if (!canUseInteractiveLiveActions(verified, accessContext)) {
      throw new Error("recipient_not_authorized");
    }

    const recipient = accessContext.recipient;

    if (!recipient) {
      throw new Error("recipient_not_authorized");
    }

    const ownerUserId = visitOwnerUserId(accessContext, verified);

    const evidence = await detectPracticeEvidence(admin, {
      visit: accessContext.visit,
      visitId: verified.sid,
      ownerUserId,
    });

    if (!evidence.practice) {
      throw new Error("practice_mode_required");
    }

    const ended = visitHasEnded(accessContext.visit);

    if (ended) {
      throw new Error("practice_completed");
    }

    await validateConsent(admin, {
      consentId: clean(body.consent_id),
      visitId: verified.sid,
      ownerUserId,
      recipientContactId: recipient.id,
      audience: verified.aud,
      signedVersion: verified.version,
      signedExpiry: verified.expNumber,
    });

    const state = practiceState(ended);
    const now = new Date().toISOString();

    if (action === "send_advisory") {
      const messageKind = clean(body.message_kind).toLowerCase();
      const messageText = advisoryMessage(
        messageKind,
        clean(body.custom_message),
      );

      const advisory: AdvisorySnapshot = {
        id: opaqueSimulationId("advisory", [
          verified.sid,
          recipient.id,
          messageKind,
          messageText,
        ]),
        message_kind: messageKind,
        message_text: messageText,
        status: "simulated",
        response_kind: null,
        created_at: now,
        updated_at: now,
        leaving_at: null,
        safe_at: null,
      };

      const result: PracticeRouteResponse = {
        ...basePracticeResult({
          sessionId: verified.sid,
          state,
          action,
          label: "Practice guidance simulated",
          message:
            "Practice Mode displayed this guidance without notifying a real person or starting a real safety action.",
        }),
        advisory,
      };

      return jsonResponse(result);
    }

    const responseAction = normalizeResponseAction(
      body.response_kind ?? body.action_kind,
    );

    if (!responseAction) {
      throw new Error("invalid_response_request");
    }

    const responseProfile = clean(body.response_profile);

    if (!ACCEPTED_RESPONSE_PROFILES.has(responseProfile)) {
      throw new Error("invalid_response_profile");
    }

    const responseOpportunityId = clean(body.response_opportunity_id);

    if (
      !responseOpportunityId ||
      responseOpportunityId.length > 160 ||
      !/^[A-Za-z0-9_-]+$/.test(responseOpportunityId)
    ) {
      throw new Error("invalid_response_opportunity");
    }

    const copy = responseCopy(responseAction);

    const response: LiveResponseRecord = {
      id: opaqueSimulationId("response", [
        verified.sid,
        recipient.id,
        responseOpportunityId,
        responseAction,
      ]),
      action: responseAction,
      state: "simulated",
      recorded_at: now,
      idempotent: true,
    };

    const result: PracticeRouteResponse = {
      ...basePracticeResult({
        sessionId: verified.sid,
        state,
        action,
        label: copy.label,
        message: copy.message,
      }),
      response,
    };

    return jsonResponse(result);
  } catch (error) {
    console.error("[SK_LIVE_PRACTICE] request failed", {
      code: error instanceof Error ? clean(error.message) : "unknown_error",
    });

    const failure = safeFailure(error);

    return jsonResponse(
      {
        ok: false,
        code: failure.code,
        error: failure.message,
        practice: {
          enabled: true,
          state: "active",
          simulated_dispatch: true,
          real_alert_sent: false,
          message:
            "No real alert, delivery, location sharing or emergency action occurred.",
        },
        boundary: practiceBoundary(),
      },
      failure.status,
    );
  }
}
