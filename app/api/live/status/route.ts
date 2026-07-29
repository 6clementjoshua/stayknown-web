// app/api/live/status/route.ts
// StayKnown Upgrade Master File Record
//
// NEW FILE
//
// Read-only, recipient-aware status projection for the signed LIVE Visit map.
//
// This route:
// - revalidates the signed Visit link on every request;
// - never changes Visit, location, response, notification, escalation, SOS,
//   Practice Mode, Safety Command, or delivery-health state;
// - exposes only sanitized status labels and evidence summaries;
// - keeps optional roadmap foundations fail-soft while their migrations are
//   being deployed;
// - never returns raw signing material, IP addresses, database errors,
//   coordinates from intelligence metadata, device identifiers, or credentials.

import { createHmac } from "node:crypto";

import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  LiveDeliveryHealth,
  LiveLocationQuality,
  LivePracticeState,
  LiveResponseAction,
  LiveStatusResponse,
  LiveTransportState,
} from "../../../live/live-types";
import {
  accessFromSearchParams,
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

const RESPONSE_HEADERS: Record<string, string> = {
  "Cache-Control": "private, no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
};

type JsonObject = Record<string, unknown>;

type OptionalRow = {
  row: JsonObject;
  available: boolean;
  warning: string;
};

type SanitizedObservation = {
  id: string;
  title: string;
  message: string;
  severity: string;
  authoritative: boolean;
};

type ClientResponseAction = {
  wire: LiveResponseAction;
  label: string;
  compact_label: string;
  critical: boolean;
  enabled: boolean;
};

type ClientResponseOpportunity = {
  id: string;
  profile: "visit_time_contact_response";
  title: string;
  message: string;
  state: string;
  actions: ClientResponseAction[];
};

type StatusPayload = LiveStatusResponse & {
  generated_at: string;

  // Compatibility fields consumed by the upgraded live-client.tsx.
  is_practice: boolean;
  phase: string;
  status_label: string;
  status_message: string;
  connection_state: string;
  connection_label: string;
  delivery_label: string;
  response_endpoint_enabled: boolean;
  practice_endpoint_enabled: boolean;
  response_opportunity: ClientResponseOpportunity | null;
  observations: SanitizedObservation[];

  capabilities: {
    safety_command_available: boolean;
    active_checkin_available: boolean;
    delivery_health_available: boolean;
    live_intelligence_available: boolean;
    visit_timing_available: boolean;
    response_authority_available: boolean;
    practice_detected: boolean;
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

function asObjectList(value: unknown): JsonObject[] {
  return Array.isArray(value)
    ? value
        .filter(
          (item): item is JsonObject =>
            Boolean(item) && typeof item === "object" && !Array.isArray(item),
        )
        .map((item) => item as JsonObject)
    : [];
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return Array.from(new Set(value.map((item) => clean(item)).filter(Boolean)));
}

function finiteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function finiteInteger(value: unknown): number | null {
  const parsed = finiteNumber(value);

  if (parsed == null || !Number.isSafeInteger(Math.trunc(parsed))) {
    return null;
  }

  return Math.trunc(parsed);
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

function firstText(
  row: JsonObject,
  keys: readonly string[],
  fallback = "",
): string {
  for (const key of keys) {
    const value = clean(row[key]);

    if (value) return value;
  }

  return fallback;
}

function firstBoolean(
  rows: JsonObject[],
  keys: readonly string[],
): boolean | null {
  for (const row of rows) {
    for (const key of keys) {
      const parsed = booleanValue(row[key]);

      if (parsed != null) return parsed;
    }
  }

  return null;
}

function dateMilliseconds(value: unknown): number | null {
  const raw = clean(value);

  if (!raw) return null;

  const date = new Date(raw);
  const milliseconds = date.getTime();

  return Number.isNaN(milliseconds) ? null : milliseconds;
}

function secondsSince(value: unknown): number | null {
  const milliseconds = dateMilliseconds(value);

  if (milliseconds == null) return null;

  return Math.max(0, Math.floor((Date.now() - milliseconds) / 1000));
}

function secondsUntil(value: unknown): number | null {
  const milliseconds = dateMilliseconds(value);

  if (milliseconds == null) return null;

  return Math.max(0, Math.floor((milliseconds - Date.now()) / 1000));
}

function titleCase(value: unknown, fallback = ""): string {
  const normalized = clean(value)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return fallback;

  return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeSeverity(value: unknown): string {
  const normalized = clean(value).toLowerCase();

  if (
    normalized === "critical" ||
    normalized === "high" ||
    normalized === "warning" ||
    normalized === "medium" ||
    normalized === "info" ||
    normalized === "low"
  ) {
    return normalized;
  }

  return "info";
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
    message.includes("schema cache") ||
    message.includes("undefined column") ||
    message.includes("unknown column")
  );
}

function logDatabaseFailure(operation: string, error: unknown): void {
  const row = asObject(error);

  if (isBackendObjectMissing(error)) {
    console.info(`[SK_LIVE_STATUS] ${operation} is not installed yet`, {
      code: clean(row.code) || null,
    });
    return;
  }

  console.error(`[SK_LIVE_STATUS] ${operation} failed`, {
    code: clean(row.code) || null,
    message:
      clean(row.message) ||
      (error instanceof Error ? error.message : "unknown_error"),
    details: clean(row.details) || null,
    hint: clean(row.hint) || null,
  });
}

async function loadLatestLocation(
  admin: SupabaseClient,
  visitId: string,
): Promise<OptionalRow> {
  try {
    const result = await admin
      .from("visit_locations")
      .select("accuracy,place,created_at")
      .eq("session_id", visitId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (result.error) {
      logDatabaseFailure("latest location lookup", result.error);

      return {
        row: {},
        available: !isBackendObjectMissing(result.error),
        warning: isBackendObjectMissing(result.error)
          ? "visit_locations_unavailable"
          : "visit_locations_read_failed",
      };
    }

    return {
      row: asObject(result.data),
      available: true,
      warning: "",
    };
  } catch (error) {
    logDatabaseFailure("latest location lookup", error);

    return {
      row: {},
      available: !isBackendObjectMissing(error),
      warning: isBackendObjectMissing(error)
        ? "visit_locations_unavailable"
        : "visit_locations_read_failed",
    };
  }
}

async function loadActiveCheckin(
  admin: SupabaseClient,
  visitId: string,
  ownerUserId: string,
): Promise<OptionalRow> {
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

      return {
        row: {},
        available: !isBackendObjectMissing(result.error),
        warning: isBackendObjectMissing(result.error)
          ? "active_visit_checkins_unavailable"
          : "active_visit_checkins_read_failed",
      };
    }

    return {
      row: asObject(result.data),
      available: true,
      warning: "",
    };
  } catch (error) {
    logDatabaseFailure("active Visit check-in lookup", error);

    return {
      row: {},
      available: !isBackendObjectMissing(error),
      warning: isBackendObjectMissing(error)
        ? "active_visit_checkins_unavailable"
        : "active_visit_checkins_read_failed",
    };
  }
}

async function loadVisitTiming(
  admin: SupabaseClient,
  visitId: string,
): Promise<OptionalRow> {
  try {
    const result = await admin
      .from("visit_time_expectations")
      .select("*")
      .eq("visit_id", visitId)
      .maybeSingle();

    if (result.error) {
      logDatabaseFailure("Visit timing lookup", result.error);

      return {
        row: {},
        available: !isBackendObjectMissing(result.error),
        warning: isBackendObjectMissing(result.error)
          ? "visit_time_expectations_unavailable"
          : "visit_time_expectations_read_failed",
      };
    }

    return {
      row: asObject(result.data),
      available: true,
      warning: "",
    };
  } catch (error) {
    logDatabaseFailure("Visit timing lookup", error);

    return {
      row: {},
      available: !isBackendObjectMissing(error),
      warning: isBackendObjectMissing(error)
        ? "visit_time_expectations_unavailable"
        : "visit_time_expectations_read_failed",
    };
  }
}

async function loadSafetyCommandByColumn(
  admin: SupabaseClient,
  ownerUserId: string,
  column: "source_event_id" | "source_session_id",
  visitId: string,
): Promise<OptionalRow> {
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

      return {
        row: {},
        available: !isBackendObjectMissing(result.error),
        warning: isBackendObjectMissing(result.error)
          ? "safety_command_registry_unavailable"
          : "safety_command_registry_read_failed",
      };
    }

    return {
      row: asObject(result.data),
      available: true,
      warning: "",
    };
  } catch (error) {
    logDatabaseFailure(`Safety Command lookup by ${column}`, error);

    return {
      row: {},
      available: !isBackendObjectMissing(error),
      warning: isBackendObjectMissing(error)
        ? "safety_command_registry_unavailable"
        : "safety_command_registry_read_failed",
    };
  }
}

async function loadSafetyCommand(
  admin: SupabaseClient,
  ownerUserId: string,
  visitId: string,
): Promise<OptionalRow> {
  const byEvent = await loadSafetyCommandByColumn(
    admin,
    ownerUserId,
    "source_event_id",
    visitId,
  );

  if (Object.keys(byEvent.row).length > 0) {
    return byEvent;
  }

  const bySession = await loadSafetyCommandByColumn(
    admin,
    ownerUserId,
    "source_session_id",
    visitId,
  );

  return {
    row: bySession.row,
    available: byEvent.available || bySession.available,
    warning: byEvent.warning && bySession.warning ? bySession.warning : "",
  };
}

async function loadDeliveryHealth(
  admin: SupabaseClient,
  ownerUserId: string,
  visitId: string,
): Promise<OptionalRow> {
  try {
    const result = await admin
      .from("safety_delivery_health")
      .select("*")
      .eq("owner_user_id", ownerUserId)
      .eq("related_id", visitId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (result.error) {
      logDatabaseFailure("delivery-health lookup", result.error);

      return {
        row: {},
        available: !isBackendObjectMissing(result.error),
        warning: isBackendObjectMissing(result.error)
          ? "safety_delivery_health_unavailable"
          : "safety_delivery_health_read_failed",
      };
    }

    return {
      row: asObject(result.data),
      available: true,
      warning: "",
    };
  } catch (error) {
    logDatabaseFailure("delivery-health lookup", error);

    return {
      row: {},
      available: !isBackendObjectMissing(error),
      warning: isBackendObjectMissing(error)
        ? "safety_delivery_health_unavailable"
        : "safety_delivery_health_read_failed",
    };
  }
}

async function loadCurrentContactResponse(
  admin: SupabaseClient,
  params: {
    visitId: string;
    recipientContactId: string;
    deadlineVersion: number;
  },
): Promise<OptionalRow> {
  if (
    !params.visitId ||
    !params.recipientContactId ||
    params.deadlineVersion < 1
  ) {
    return {
      row: {},
      available: false,
      warning: "response_opportunity_unavailable",
    };
  }

  try {
    const result = await admin
      .from("visit_time_contact_responses")
      .select("*")
      .eq("visit_id", params.visitId)
      .eq("deadline_version", params.deadlineVersion)
      .eq("recipient_contact_id", params.recipientContactId)
      .order("responded_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (result.error) {
      logDatabaseFailure("selected-contact response lookup", result.error);

      return {
        row: {},
        available: !isBackendObjectMissing(result.error),
        warning: isBackendObjectMissing(result.error)
          ? "visit_time_contact_responses_unavailable"
          : "visit_time_contact_responses_read_failed",
      };
    }

    return {
      row: asObject(result.data),
      available: true,
      warning: "",
    };
  } catch (error) {
    logDatabaseFailure("selected-contact response lookup", error);

    return {
      row: {},
      available: !isBackendObjectMissing(error),
      warning: isBackendObjectMissing(error)
        ? "visit_time_contact_responses_unavailable"
        : "visit_time_contact_responses_read_failed",
    };
  }
}

function locationSnapshot(
  location: JsonObject,
  ended: boolean,
): {
  quality: LiveLocationQuality;
  label: string;
  ageSeconds: number | null;
} {
  const accuracy = finiteNumber(location.accuracy);
  const ageSeconds = secondsSince(location.created_at);

  if (accuracy == null) {
    return {
      quality: "unknown",
      label: ended
        ? "Last location accuracy unknown"
        : "Location accuracy unknown",
      ageSeconds,
    };
  }

  if (accuracy <= 80 && (ageSeconds == null || ageSeconds <= 180)) {
    return {
      quality: "exact",
      label: `Exact GPS • ± ${Math.max(0, accuracy).toFixed(1)} m`,
      ageSeconds,
    };
  }

  if (accuracy <= 250 && (ageSeconds == null || ageSeconds <= 600)) {
    return {
      quality: "approximate",
      label: `Approximate area • ± ${Math.max(0, accuracy).toFixed(1)} m`,
      ageSeconds,
    };
  }

  return {
    quality: "coarse",
    label: `Last known approximate area • ± ${Math.max(0, accuracy).toFixed(0)} m`,
    ageSeconds,
  };
}

function deliveryHealthFromRow(row: JsonObject): LiveDeliveryHealth | null {
  const state = firstText(row, [
    "overall_state",
    "delivery_health",
    "health",
    "state",
    "status",
  ]).toLowerCase();

  if (
    [
      "healthy",
      "delivered",
      "complete",
      "completed",
      "success",
      "successful",
      "sent",
      "ok",
    ].includes(state)
  ) {
    return "healthy";
  }

  if (
    ["pending", "queued", "processing", "delayed", "retrying"].includes(state)
  ) {
    return "delayed";
  }

  if (
    [
      "partial",
      "degraded",
      "warning",
      "partially_delivered",
      "partially_failed",
    ].includes(state)
  ) {
    return "degraded";
  }

  if (
    ["offline", "failed", "unavailable", "blocked", "not_delivered"].includes(
      state,
    )
  ) {
    return "offline";
  }

  return null;
}

function fallbackDeliveryHealth(
  ageSeconds: number | null,
  ended: boolean,
): LiveDeliveryHealth {
  if (ended) return "healthy";
  if (ageSeconds == null) return "unknown";
  if (ageSeconds <= 45) return "healthy";
  if (ageSeconds <= 180) return "delayed";
  if (ageSeconds <= 600) return "degraded";
  return "offline";
}

function deliveryLabel(
  health: LiveDeliveryHealth,
  ageSeconds: number | null,
  ended: boolean,
): string {
  if (ended) return "Visit ended";

  switch (health) {
    case "healthy":
      return ageSeconds == null
        ? "Safety delivery healthy"
        : "LIVE location current";
    case "delayed":
      return "Location updates delayed";
    case "degraded":
      return "Safety delivery degraded";
    case "offline":
      return "Latest verified status may be stale";
    case "unknown":
      return "Delivery health not verified";
  }
}

function connectionState(
  health: LiveDeliveryHealth,
  ended: boolean,
): {
  transport: LiveTransportState;
  state: string;
  label: string;
} {
  if (ended) {
    return {
      transport: "ended",
      state: "ended",
      label: "This LIVE Visit has ended.",
    };
  }

  switch (health) {
    case "healthy":
      return {
        transport: "connected",
        state: "connected",
        label: "Secure LIVE status is current.",
      };
    case "delayed":
      return {
        transport: "polling",
        state: "delayed",
        label: "StayKnown is checking for the latest verified update.",
      };
    case "degraded":
      return {
        transport: "reconnecting",
        state: "degraded",
        label: "LIVE evidence is available, but some updates are delayed.",
      };
    case "offline":
      return {
        transport: "offline",
        state: "offline",
        label:
          "The last verified status remains visible while updates recover.",
      };
    case "unknown":
      return {
        transport: "connecting",
        state: "checking",
        label: "StayKnown is verifying the current LIVE status.",
      };
  }
}

function practiceDetected(params: {
  visit: JsonObject;
  activeCheckin: JsonObject;
  safetyCommand: JsonObject;
}): boolean {
  const visitPayload = asObject(params.visit.payload);
  const visitMetadata = asObject(params.visit.metadata);
  const checkinMetadata = asObject(params.activeCheckin.metadata);
  const commandMetadata = asObject(params.safetyCommand.metadata);
  const commandContext = asObject(params.safetyCommand.context);

  return (
    firstBoolean(
      [
        params.visit,
        visitPayload,
        visitMetadata,
        params.activeCheckin,
        checkinMetadata,
        params.safetyCommand,
        commandMetadata,
        commandContext,
      ],
      [
        "is_practice",
        "practice_mode",
        "practice_only",
        "simulated",
        "simulation",
      ],
    ) === true
  );
}

function commandPhase(
  safetyCommand: JsonObject,
  activeCheckin: JsonObject,
  timing: JsonObject,
  ended: boolean,
  practice: boolean,
): string {
  if (ended) return practice ? "practice_completed" : "visit_ended";
  if (practice) return "practice_active";

  const timingStatus = clean(timing.status).toLowerCase();
  const expectedEndAt = dateMilliseconds(timing.expected_end_at);
  const overdue =
    ["active", "extended"].includes(timingStatus) &&
    expectedEndAt != null &&
    expectedEndAt <= Date.now();

  if (overdue) return "visit_time_exceeded";

  return (
    firstText(safetyCommand, ["phase", "command_phase", "state", "status"]) ||
    firstText(activeCheckin, ["phase", "checkin_phase", "state", "status"]) ||
    "visit_active"
  );
}

function responseKindFromRow(row: JsonObject): LiveResponseAction | null {
  const normalized = firstText(row, [
    "response_kind",
    "action_kind",
    "action",
    "state",
  ]).toLowerCase();

  if (normalized === "checking") return "checking";
  if (normalized === "reached") return "reached";

  if (
    normalized === "cannot_reach" ||
    normalized === "cant_reach" ||
    normalized === "unable_to_reach"
  ) {
    return "cannot_reach";
  }

  return null;
}

function responseOpportunityId(params: {
  visitId: string;
  recipientContactId: string;
  deadlineVersion: number;
}): string {
  const secret = clean(
    process.env.LIVE_AUDIT_HASH_SECRET ??
      process.env.INTERNAL_EVENT_SECRET ??
      process.env.TRACKING_SIGNING_SECRET,
  );

  const material =
    `${params.visitId}:` +
    `${params.recipientContactId}:` +
    `${params.deadlineVersion}`;

  if (!secret) {
    return `visit-response-${params.deadlineVersion}`;
  }

  const digest = createHmac("sha256", secret)
    .update(`stayknown-live-response:${material}`, "utf8")
    .digest("base64url")
    .slice(0, 40);

  return `visit-response-${digest}`;
}

function responseActions(): ClientResponseAction[] {
  return [
    {
      wire: "checking",
      label: "Checking",
      compact_label: "Checking",
      critical: false,
      enabled: true,
    },
    {
      wire: "reached",
      label: "Reached them",
      compact_label: "Reached",
      critical: false,
      enabled: true,
    },
    {
      wire: "cannot_reach",
      label: "Can’t reach",
      compact_label: "Can’t reach",
      critical: true,
      enabled: true,
    },
  ];
}

function buildResponseOpportunity(params: {
  interactiveActionsAllowed: boolean;
  ended: boolean;
  practice: boolean;
  timing: JsonObject;
  recipientContactId: string;
  existingResponse: JsonObject;
  responseAuthorityAvailable: boolean;
  visitId: string;
}): {
  opportunity: ClientResponseOpportunity | null;
  alreadyRecorded: boolean;
  recordedAction: LiveResponseAction | null;
  availableActions: LiveResponseAction[];
} {
  const deadlineVersion = finiteInteger(params.timing.deadline_version) ?? 0;

  const timingStatus = clean(params.timing.status).toLowerCase();
  const expectedEndAt = dateMilliseconds(params.timing.expected_end_at);

  const overdue =
    ["active", "extended"].includes(timingStatus) &&
    (Boolean(clean(params.timing.first_overdue_at)) ||
      Boolean(clean(params.timing.last_overdue_at)) ||
      (expectedEndAt != null && expectedEndAt <= Date.now()));

  const selectedContactIds = asStringArray(params.timing.selected_contact_ids);

  const recipientSelected =
    Boolean(params.recipientContactId) &&
    selectedContactIds.includes(params.recipientContactId);

  const recordedAction = responseKindFromRow(params.existingResponse);
  const alreadyRecorded = recordedAction != null;

  const enabled =
    params.interactiveActionsAllowed &&
    !params.ended &&
    !params.practice &&
    params.responseAuthorityAvailable &&
    deadlineVersion > 0 &&
    overdue &&
    recipientSelected;

  if (!enabled) {
    return {
      opportunity: null,
      alreadyRecorded,
      recordedAction,
      availableActions: [],
    };
  }

  const currentLabel =
    recordedAction === "checking"
      ? "Checking"
      : recordedAction === "reached"
        ? "Reached them"
        : recordedAction === "cannot_reach"
          ? "Can’t reach"
          : "";

  return {
    opportunity: {
      id: responseOpportunityId({
        visitId: params.visitId,
        recipientContactId: params.recipientContactId,
        deadlineVersion,
      }),
      profile: "visit_time_contact_response",
      title: "Visit contact response",
      message: currentLabel
        ? `Your current response is ${currentLabel}. You can update it while this response opportunity remains active.`
        : "The expected Visit time has passed. Record what you know without assuming the visitor is safe or unsafe.",
      state: alreadyRecorded
        ? `recorded_${recordedAction}`
        : "awaiting_contact_response",
      actions: responseActions(),
    },
    alreadyRecorded,
    recordedAction,
    availableActions: ["checking", "reached", "cannot_reach"],
  };
}

function intelligenceSnapshot(activeCheckin: JsonObject): JsonObject {
  const direct = asObject(activeCheckin.live_visit_intelligence);

  if (Object.keys(direct).length > 0) {
    return direct;
  }

  const metadata = asObject(activeCheckin.metadata);
  const intelligence = asObject(metadata.live_visit_intelligence);

  const nestedSnapshot = asObject(intelligence.snapshot);

  return Object.keys(nestedSnapshot).length > 0 ? nestedSnapshot : intelligence;
}

function sanitizeObservation(
  raw: JsonObject,
  index: number,
  authoritativeDefault: boolean,
): SanitizedObservation | null {
  const kind = firstText(raw, ["kind", "observation_kind", "type", "code"]);

  const title =
    firstText(raw, ["title", "label", "headline", "status_label"]) ||
    titleCase(kind, "LIVE Visit observation");

  const message = firstText(raw, [
    "message",
    "summary",
    "description",
    "detail",
    "evidence_label",
  ]);

  if (!title && !message) return null;

  const explicitAuthoritative = booleanValue(
    raw.authoritative ?? raw.server_authoritative ?? raw.backend_authoritative,
  );

  /*
  Coordinates, device evidence, raw metadata, source identifiers, and evidence
  payloads are intentionally not copied into the browser-facing observation.
  */
  return {
    id:
      clean(raw.id) ||
      clean(raw.observation_id) ||
      `${kind || "observation"}-${index + 1}`,
    title: title.slice(0, 100),
    message: message.slice(0, 260),
    severity: normalizeSeverity(raw.severity),
    authoritative: explicitAuthoritative ?? authoritativeDefault,
  };
}

function sanitizedIntelligence(activeCheckin: JsonObject): {
  observations: SanitizedObservation[];
  riskLevel: string;
  summary: string;
  available: boolean;
} {
  const snapshot = intelligenceSnapshot(activeCheckin);

  if (Object.keys(snapshot).length === 0) {
    return {
      observations: [],
      riskLevel: "unknown",
      summary: "",
      available: false,
    };
  }

  const metadata = asObject(snapshot.metadata);
  const authoritativeDefault =
    firstBoolean(
      [snapshot, metadata],
      ["authoritative", "server_authoritative", "backend_authoritative"],
    ) === true;

  const rawObservations = asObjectList(
    snapshot.observations ?? snapshot.signals ?? snapshot.items,
  );

  const observations = rawObservations
    .map((row, index) => sanitizeObservation(row, index, authoritativeDefault))
    .filter((item): item is SanitizedObservation => item !== null)
    .slice(0, 6);

  const severityRank: Record<string, number> = {
    low: 1,
    info: 1,
    medium: 2,
    warning: 3,
    high: 4,
    critical: 5,
  };

  const riskLevel =
    observations
      .map((item) => item.severity)
      .sort(
        (left, right) => (severityRank[right] ?? 0) - (severityRank[left] ?? 0),
      )[0] ?? "unknown";

  return {
    observations,
    riskLevel,
    summary:
      firstText(snapshot, ["summary", "message", "status_message"]) ||
      observations[0]?.message ||
      "",
    available: true,
  };
}

function activeCheckinProjection(params: {
  activeCheckin: JsonObject;
  timing: JsonObject;
}): NonNullable<LiveStatusResponse["active_checkin"]> | null {
  if (
    Object.keys(params.activeCheckin).length === 0 &&
    Object.keys(params.timing).length === 0
  ) {
    return null;
  }

  const escalation = asObject(params.activeCheckin.escalation);

  const dueAt =
    firstText(params.activeCheckin, [
      "due_at",
      "next_due_at",
      "expected_end_at",
    ]) || firstText(params.timing, ["expected_end_at"]);

  return {
    id: firstText(params.activeCheckin, ["id"]) || null,
    state:
      firstText(params.activeCheckin, ["state", "status", "phase"]) ||
      firstText(params.timing, ["status"]) ||
      null,
    due_at: dueAt || null,
    remaining_seconds: dueAt ? secondsUntil(dueAt) : null,
    escalation_state:
      firstText(escalation, ["state", "status", "phase"]) ||
      firstText(params.activeCheckin, [
        "escalation_state",
        "escalation_status",
      ]) ||
      null,
  };
}

function statusPresentation(params: {
  ended: boolean;
  practice: boolean;
  phase: string;
  safetyCommand: JsonObject;
  timing: JsonObject;
  responseOpportunity: ClientResponseOpportunity | null;
}): {
  label: string;
  message: string;
} {
  if (params.practice) {
    return {
      label: params.ended ? "Practice Mode completed" : "Practice Mode",
      message: params.ended
        ? "This simulated safety session has ended. No real alert or location dispatch was performed."
        : "Practice Mode is active. No real contact alert, emergency dispatch, or real-world safety response is performed.",
    };
  }

  if (params.ended) {
    return {
      label: "Visit ended",
      message:
        "This LIVE Visit has ended. The last verified status remains available.",
    };
  }

  if (params.responseOpportunity) {
    return {
      label: "Visit time exceeded",
      message:
        "The expected Visit time has passed. An authorized selected contact can record what they know.",
    };
  }

  const commandLabel = firstText(params.safetyCommand, [
    "status_label",
    "label",
    "title",
    "phase_label",
  ]);

  if (commandLabel) {
    return {
      label: commandLabel.slice(0, 100),
      message:
        firstText(params.safetyCommand, [
          "status_message",
          "message",
          "summary",
        ]).slice(0, 260) ||
        "StayKnown is showing the latest authorized LIVE Visit state.",
    };
  }

  const timingStatus = clean(params.timing.status).toLowerCase();

  if (timingStatus === "extended") {
    return {
      label: "Visit time extended",
      message:
        "The Visit owner added more time. StayKnown is monitoring the current authorized Visit state.",
    };
  }

  return {
    label:
      params.phase === "visit_active"
        ? "LIVE Visit active"
        : titleCase(params.phase, "LIVE Visit active"),
    message: "StayKnown is showing the latest authorized LIVE Visit state.",
  };
}

function safeFailure(error: unknown): {
  status: number;
  code: string;
  message: string;
} {
  const code = error instanceof Error ? clean(error.message) : "";

  if (code === "visit_not_found") {
    return {
      status: 404,
      code: "visit_not_found",
      message: "This LIVE Visit is no longer available.",
    };
  }

  if (
    code === "recipient_not_authorized" ||
    code === "recipient_email_missing"
  ) {
    return {
      status: 403,
      code: "recipient_not_authorized",
      message:
        "This recipient is not authorized to view the LIVE Visit status.",
    };
  }

  if (
    code === "visit_access_failed" ||
    code === "recipient_access_failed" ||
    code === "live_configuration_unavailable"
  ) {
    return {
      status: 503,
      code: "live_status_temporarily_unavailable",
      message: "StayKnown could not verify this LIVE Visit right now.",
    };
  }

  return {
    status: 500,
    code: "live_status_failed",
    message: "StayKnown could not load the LIVE Visit status right now.",
  };
}

export async function GET(req: Request): Promise<NextResponse> {
  try {
    const requestUrl = new URL(req.url);
    const access = accessFromSearchParams(requestUrl.searchParams);
    const verified = verifyLiveAccess(access);

    if (!verified.ok) {
      /*
      Do not reveal whether a signed link failed because of expiry, audience,
      missing fields, server configuration, or signature verification.
      */
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

    const visit = accessContext.visit;
    const visitId = verified.sid;
    const ownerUserId = visitOwnerUserId(accessContext, verified);
    const ended = visitHasEnded(visit);
    const recipientContactId = accessContext.recipient?.id ?? "";

    const interactiveActionsAllowed = canUseInteractiveLiveActions(
      verified,
      accessContext,
    );

    const [
      locationResult,
      activeCheckinResult,
      timingResult,
      safetyCommandResult,
      deliveryHealthResult,
    ] = await Promise.all([
      loadLatestLocation(admin, visitId),
      loadActiveCheckin(admin, visitId, ownerUserId),
      loadVisitTiming(admin, visitId),
      loadSafetyCommand(admin, ownerUserId, visitId),
      loadDeliveryHealth(admin, ownerUserId, visitId),
    ]);

    const practice = practiceDetected({
      visit,
      activeCheckin: activeCheckinResult.row,
      safetyCommand: safetyCommandResult.row,
    });

    const phase = commandPhase(
      safetyCommandResult.row,
      activeCheckinResult.row,
      timingResult.row,
      ended,
      practice,
    );

    const deadlineVersion =
      finiteInteger(timingResult.row.deadline_version) ?? 0;

    const responseAuthorityCandidate =
      interactiveActionsAllowed &&
      !ended &&
      !practice &&
      deadlineVersion > 0 &&
      Boolean(recipientContactId);

    const currentResponseResult = responseAuthorityCandidate
      ? await loadCurrentContactResponse(admin, {
          visitId,
          recipientContactId,
          deadlineVersion,
        })
      : {
          row: {},
          available: false,
          warning: "response_opportunity_not_applicable",
        };

    const responseProjection = buildResponseOpportunity({
      interactiveActionsAllowed,
      ended,
      practice,
      timing: timingResult.row,
      recipientContactId,
      existingResponse: currentResponseResult.row,
      responseAuthorityAvailable: currentResponseResult.available,
      visitId,
    });

    const location = locationSnapshot(locationResult.row, ended);

    const health =
      deliveryHealthFromRow(deliveryHealthResult.row) ??
      fallbackDeliveryHealth(location.ageSeconds, ended);

    const healthLabel = deliveryLabel(health, location.ageSeconds, ended);

    const connection = connectionState(health, ended);

    const intelligence = sanitizedIntelligence(activeCheckinResult.row);

    const presentation = statusPresentation({
      ended,
      practice,
      phase,
      safetyCommand: safetyCommandResult.row,
      timing: timingResult.row,
      responseOpportunity: responseProjection.opportunity,
    });

    const practiceState: LivePracticeState = practice
      ? ended
        ? "completed"
        : "active"
      : "inactive";

    /*
    These capabilities describe what this signed recipient may use after the
    matching route is installed. The downstream response/practice routes must
    still perform their own fresh authorization and state checks.
    */
    const responseEndpointEnabled =
      interactiveActionsAllowed &&
      !ended &&
      !practice &&
      Boolean(responseProjection.opportunity);

    const practiceEndpointEnabled =
      interactiveActionsAllowed && !ended && practice;

    const payload: StatusPayload = {
      ok: true,
      session_id: visitId,
      status: ended ? "ended" : "live",
      ended,
      ended_at:
        clean(visit.ended_at) || (ended ? clean(visit.updated_at) : "") || null,

      transport_hint: connection.transport,
      delivery_health: health,
      delivery_message: healthLabel,

      location_age_seconds: location.ageSeconds,
      location_quality: location.quality,
      location_label: location.label,

      safety_command_phase: phase,
      safety_command_label: presentation.label,

      active_checkin: activeCheckinProjection({
        activeCheckin: activeCheckinResult.row,
        timing: timingResult.row,
      }),

      live_intelligence: intelligence.available
        ? {
            risk_level: intelligence.riskLevel,
            summary: intelligence.summary || null,
            observations: intelligence.observations.map((item) => ({
              id: item.id,
              kind: item.title,
              label: item.title,
              severity: item.severity,
              occurred_at: null,
            })),
          }
        : null,

      response: {
        enabled: responseEndpointEnabled,
        already_recorded: responseProjection.alreadyRecorded,
        recorded_action: responseProjection.recordedAction,
        available_actions: responseProjection.availableActions,
      },

      practice: {
        enabled: practice,
        state: practiceState,
        label: practice ? presentation.label : null,
        simulated_dispatch: practice,
        real_alert_sent: false,
      },

      generated_at: new Date().toISOString(),

      // Flat compatibility projection used by live-client.tsx.
      is_practice: practice,
      phase,
      status_label: presentation.label,
      status_message: presentation.message,
      connection_state: connection.state,
      connection_label: connection.label,
      delivery_label: healthLabel,
      response_endpoint_enabled: responseEndpointEnabled,
      practice_endpoint_enabled: practiceEndpointEnabled,
      response_opportunity: responseProjection.opportunity,
      observations: intelligence.observations,

      capabilities: {
        safety_command_available: safetyCommandResult.available,
        active_checkin_available: activeCheckinResult.available,
        delivery_health_available: deliveryHealthResult.available,
        live_intelligence_available: intelligence.available,
        visit_timing_available: timingResult.available,
        response_authority_available: currentResponseResult.available,
        practice_detected: practice,
      },
    };

    return jsonResponse(payload);
  } catch (error) {
    console.error("[SK_LIVE_STATUS] request failed", {
      code: error instanceof Error ? clean(error.message) : "unknown_error",
    });

    const failure = safeFailure(error);

    return jsonResponse(
      {
        ok: false,
        code: failure.code,
        error: failure.message,
      },
      failure.status,
    );
  }
}
