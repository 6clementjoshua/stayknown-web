// app/live/live-types.ts
//
// Shared contracts for StayKnown's signed LIVE Visit map.
//
// Privacy rules:
// - The Visit subject is always the primary map identity.
// - Nearby markers are returned only for fully approved StayKnown contacts
//   belonging to the Visit subject.
// - No anonymous-user marker contract exists in this file.
// - Nearby contact names use full first and last names.
// - Marker identifiers are opaque and must not expose raw auth user IDs.
// - Raw signing tokens, IP addresses, exact device identifiers, and account
//   credentials must never be added to any browser-facing contract.

export type SignedAccessVersion = "v1" | "v2";

export type LiveAudience = "contacts" | "self";

export type LiveStatus = "loading" | "live" | "ended" | "error";

export type LivePresenceState = "live" | "recent" | "paused";

/*
The seed and stream routes use these exact values. Keep this contract aligned
with locationQuality() in both routes.
*/
export type LiveLocationQuality =
  | "exact"
  | "approximate"
  | "coarse"
  | "unknown";

export type LiveMapRenderMode = "map" | "fallback";

export type LivePanelMode = "info" | "guidance" | "custom" | "confirm" | "sent";

export type AdvisoryKind =
  | "leave_area"
  | "check_route"
  | "location_mismatch"
  | "custom";

export type LiveTransportState =
  | "connecting"
  | "connected"
  | "polling"
  | "reconnecting"
  | "offline"
  | "ended"
  | "error";

export type LiveDeliveryHealth =
  | "healthy"
  | "delayed"
  | "degraded"
  | "offline"
  | "unknown";

export type LiveResponseAction = "checking" | "reached" | "cannot_reach";

export type LivePracticeState =
  | "inactive"
  | "active"
  | "completed"
  | "cancelled";

export type LiveAccessProps = {
  sid: string;
  exp: string;
  uid: string;
  aud: string;
  sig: string;
  rid: string;
  version: SignedAccessVersion;
};

export type LiveAccessQuery = {
  sid: string;
  exp: string;
  uid: string;
  aud: LiveAudience | string;
  sig: string;
  rid: string;
  version: SignedAccessVersion | string;
};

export type LivePoint = {
  lat: number;
  lng: number;
  accuracy?: number | null;
  place?: string | null;
  created_at?: string | null;
  location_quality?: LiveLocationQuality | null;
  location_is_exact?: boolean;
  location_is_approximate?: boolean;
  location_age_seconds?: number | null;
  location_label?: string | null;
};

export type AdvisorySnapshot = {
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

export type LiveSeedResponse = {
  ok: boolean;
  session_id: string;

  latest?: LivePoint | null;

  sos_active?: boolean;
  ended?: boolean;
  started_at?: string | null;

  destination_name?: string | null;
  destination_address?: string | null;
  purpose?: string | null;
  person_to_meet?: string | null;
  expected_duration_minutes?: number | null;
  extra_note?: string | null;

  location_quality?: LiveLocationQuality;
  location_is_exact?: boolean;
  location_is_approximate?: boolean;
  location_age_seconds?: number | null;
  location_label?: string;

  visitor_name?: string | null;
  visitor_first_name?: string | null;
  visitor_last_name?: string | null;
  visitor_avatar_url?: string | null;
  visitor_verified?: boolean;
  visitor_badge_type?: string | null;
  visitor_badge_status?: string | null;

  viewer_name?: string | null;
  viewer_user_id?: string | null;
  viewer_is_stayknown?: boolean;
  recipient_contact_id?: string | null;

  signed_access_version?: SignedAccessVersion;
  legacy_read_only?: boolean;
  can_send_advisory?: boolean;
  active_advisory?: AdvisorySnapshot | null;

  nearby_presence_enabled?: boolean;
  nearby_presence_radius_meters?: number | null;

  code?: string;
  error?: string;
};

/*
Sanitized authority returned by app/api/live/status/route.ts.

The status route may omit optional sections when a corresponding backend
foundation has not been installed. Clients must treat omitted sections as
unavailable, not as a positive safety state.
*/
export type LiveStatusResponse = {
  ok: boolean;
  session_id: string;

  status: "live" | "ended";
  ended: boolean;
  ended_at?: string | null;

  transport_hint?: LiveTransportState;
  delivery_health?: LiveDeliveryHealth;
  delivery_message?: string | null;

  location_age_seconds?: number | null;
  location_quality?: LiveLocationQuality;
  location_label?: string | null;

  safety_command_phase?: string | null;
  safety_command_label?: string | null;

  active_checkin?: {
    id?: string | null;
    state?: string | null;
    due_at?: string | null;
    remaining_seconds?: number | null;
    escalation_state?: string | null;
  } | null;

  live_intelligence?: {
    risk_level?: string | null;
    summary?: string | null;
    observations?: Array<{
      id?: string | null;
      kind?: string | null;
      label?: string | null;
      severity?: string | null;
      occurred_at?: string | null;
    }>;
  } | null;

  response?: {
    enabled: boolean;
    already_recorded?: boolean;
    recorded_action?: LiveResponseAction | null;
    available_actions?: LiveResponseAction[];
  };

  practice?: {
    enabled: boolean;
    state: LivePracticeState;
    label?: string | null;
    simulated_dispatch?: boolean;
    real_alert_sent?: boolean;
  };

  generated_at?: string;
  code?: string;
  error?: string;
};

export type LiveResponseRequest = LiveAccessProps & {
  consent_id?: string;
  action: LiveResponseAction;
};

export type LiveResponseRecord = {
  id?: string | null;
  action: LiveResponseAction;
  state?: string | null;
  recorded_at?: string | null;
  idempotent?: boolean;
};

export type LiveResponseResponse = {
  ok: boolean;
  session_id?: string;
  response?: LiveResponseRecord | null;
  delivery_health?: LiveDeliveryHealth;
  code?: string;
  error?: string;
};

export type LivePracticeRequest = LiveAccessProps & {
  action?: string;
  payload?: Record<string, unknown>;
};

export type LivePracticeResponse = {
  ok: boolean;
  session_id?: string;
  practice: {
    enabled: boolean;
    state: LivePracticeState;
    simulated_dispatch: boolean;
    real_alert_sent: false;
    message?: string | null;
  };
  code?: string;
  error?: string;
};

export type NearbyApprovedContactPresence = {
  /**
   * Opaque identifier for the rendered map marker.
   * It must not expose a raw auth user ID to the browser.
   */
  marker_id: string;

  first_name: string;
  last_name: string;
  full_name: string;

  /**
   * Example: "Chigozie's approved contact".
   * This label is generated server-side from the Visit subject's first name.
   */
  relationship_label: string;

  avatar_url?: string | null;

  verified?: boolean;
  badge_type?: string | null;
  badge_status?: string | null;

  lat: number;
  lng: number;
  accuracy?: number | null;
  place?: string | null;

  distance_meters: number;
  presence_state: LivePresenceState;
  is_sos?: boolean;

  location_quality?: LiveLocationQuality | null;
  location_is_exact?: boolean;
  location_is_approximate?: boolean;
  location_age_seconds?: number | null;

  expires_at?: string | null;
};

export type NearbyApprovedContactsResponse = {
  ok: boolean;
  session_id: string;

  subject_first_name: string;
  subject_last_name?: string | null;
  subject_full_name: string;

  radius_meters: number;
  contacts: NearbyApprovedContactPresence[];

  generated_at: string;
  next_refresh_after_seconds?: number;

  code?: string;
  error?: string;
};

export type LiveReadyEvent = {
  type: "ready";
  session_id: string;
  advisory_enabled: boolean;
  nearby_presence_enabled: boolean;
  legacy_read_only?: boolean;
  signed_access_version?: SignedAccessVersion;
  t: number;
};

export type LiveKeepAliveEvent = {
  type: "ka";
  t: number;
};

/*
Kept as a compatibility export for any earlier imports. The actual stream emits
"ka", not "heartbeat".
*/
export type LiveHeartbeatEvent = LiveKeepAliveEvent;

export type NearbyPresenceRefreshEvent = {
  type: "nearby_presence_refresh";
  session_id: string;
  reason?:
    | "presence_started"
    | "presence_updated"
    | "presence_paused"
    | "presence_ended"
    | "presence_expired"
    | "contact_membership_changed"
    | "manual_refresh";
  occurred_at?: string;
};

export type LiveLocationEvent = {
  type: "location";
  session_id?: string;

  lat: number;
  lng: number;
  accuracy?: number | null;
  place?: string | null;
  created_at?: string | null;

  initial?: boolean;
  ended?: boolean;

  location_quality?: LiveLocationQuality;
  location_is_exact?: boolean;
  location_is_approximate?: boolean;
  location_age_seconds?: number | null;
  location_label?: string | null;
};

export type LiveEndedEvent = {
  type: "ended";
  session_id?: string;
  ended_at?: string | null;
  initial?: boolean;
};

export type LiveSosEvent = {
  type: "sos";
  session_id?: string;
  active: boolean;
  occurred_at?: string;
};

export type LiveAdvisoryEvent = {
  type: "advisory";
  session_id?: string;
  initial?: boolean;
  advisory: AdvisorySnapshot | null;
};

export type LiveStreamErrorEvent = {
  type: "stream_error";
  code: string;
};

export type LiveStreamEvent =
  | LiveReadyEvent
  | LiveKeepAliveEvent
  | LiveLocationEvent
  | LiveEndedEvent
  | LiveSosEvent
  | LiveAdvisoryEvent
  | NearbyPresenceRefreshEvent
  | LiveStreamErrorEvent;

export type NearbyMarkerCardView = {
  markerId: string;
  fullName: string;
  relationshipLabel: string;
  statusLabel:
    | "LIVE Visit"
    | "Recently active"
    | "Location paused"
    | "SOS active";
  placeLabel: string;
  distanceLabel: string;
  avatarUrl: string;
  presenceState: LivePresenceState;
  verified: boolean;
  badgeType: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isOptionalString(value: unknown): boolean {
  return value == null || typeof value === "string";
}

function isOptionalBoolean(value: unknown): boolean {
  return value == null || typeof value === "boolean";
}

function isOptionalFiniteNumber(value: unknown): boolean {
  return value == null || isFiniteNumber(value);
}

export function isSignedAccessVersion(
  value: unknown,
): value is SignedAccessVersion {
  return value === "v1" || value === "v2";
}

export function isLiveLocationQuality(
  value: unknown,
): value is LiveLocationQuality {
  return (
    value === "exact" ||
    value === "approximate" ||
    value === "coarse" ||
    value === "unknown"
  );
}

export function isLivePresenceState(
  value: unknown,
): value is LivePresenceState {
  return value === "live" || value === "recent" || value === "paused";
}

export function isLiveResponseAction(
  value: unknown,
): value is LiveResponseAction {
  return (
    value === "checking" || value === "reached" || value === "cannot_reach"
  );
}

export function isLivePoint(value: unknown): value is LivePoint {
  if (!isRecord(value)) return false;

  if (
    !isFiniteNumber(value.lat) ||
    value.lat < -90 ||
    value.lat > 90 ||
    !isFiniteNumber(value.lng) ||
    value.lng < -180 ||
    value.lng > 180
  ) {
    return false;
  }

  if (
    !isOptionalFiniteNumber(value.accuracy) ||
    !isOptionalString(value.place) ||
    !isOptionalString(value.created_at) ||
    !isOptionalBoolean(value.location_is_exact) ||
    !isOptionalBoolean(value.location_is_approximate) ||
    !isOptionalFiniteNumber(value.location_age_seconds) ||
    !isOptionalString(value.location_label)
  ) {
    return false;
  }

  return (
    value.location_quality == null ||
    isLiveLocationQuality(value.location_quality)
  );
}

export function isAdvisorySnapshot(value: unknown): value is AdvisorySnapshot {
  if (!isRecord(value) || !isNonEmptyString(value.id)) {
    return false;
  }

  return (
    isOptionalString(value.message_kind) &&
    isOptionalString(value.message_text) &&
    isOptionalString(value.status) &&
    isOptionalString(value.response_kind) &&
    isOptionalString(value.created_at) &&
    isOptionalString(value.updated_at) &&
    isOptionalString(value.leaving_at) &&
    isOptionalString(value.safe_at)
  );
}

export function isNearbyApprovedContactPresence(
  value: unknown,
): value is NearbyApprovedContactPresence {
  if (!isRecord(value)) return false;

  return (
    isNonEmptyString(value.marker_id) &&
    isNonEmptyString(value.first_name) &&
    isNonEmptyString(value.last_name) &&
    isNonEmptyString(value.full_name) &&
    isNonEmptyString(value.relationship_label) &&
    isFiniteNumber(value.lat) &&
    value.lat >= -90 &&
    value.lat <= 90 &&
    isFiniteNumber(value.lng) &&
    value.lng >= -180 &&
    value.lng <= 180 &&
    isFiniteNumber(value.distance_meters) &&
    value.distance_meters >= 0 &&
    isLivePresenceState(value.presence_state) &&
    isOptionalString(value.avatar_url) &&
    isOptionalBoolean(value.verified) &&
    isOptionalString(value.badge_type) &&
    isOptionalString(value.badge_status) &&
    isOptionalFiniteNumber(value.accuracy) &&
    isOptionalString(value.place) &&
    isOptionalBoolean(value.is_sos) &&
    isOptionalBoolean(value.location_is_exact) &&
    isOptionalBoolean(value.location_is_approximate) &&
    isOptionalFiniteNumber(value.location_age_seconds) &&
    isOptionalString(value.expires_at) &&
    (value.location_quality == null ||
      isLiveLocationQuality(value.location_quality))
  );
}

export function normalizeNearbyApprovedContacts(
  value: unknown,
): NearbyApprovedContactPresence[] {
  if (!Array.isArray(value)) return [];

  const result: NearbyApprovedContactPresence[] = [];
  const seenMarkerIds = new Set<string>();

  for (const candidate of value) {
    if (!isNearbyApprovedContactPresence(candidate)) continue;

    const markerId = candidate.marker_id.trim();

    if (seenMarkerIds.has(markerId)) continue;

    seenMarkerIds.add(markerId);
    result.push(candidate);
  }

  return result;
}

export function isLiveStreamEvent(value: unknown): value is LiveStreamEvent {
  if (!isRecord(value) || !isNonEmptyString(value.type)) {
    return false;
  }

  switch (value.type) {
    case "ready":
      return (
        isNonEmptyString(value.session_id) &&
        typeof value.advisory_enabled === "boolean" &&
        typeof value.nearby_presence_enabled === "boolean" &&
        isFiniteNumber(value.t) &&
        isOptionalBoolean(value.legacy_read_only) &&
        (value.signed_access_version == null ||
          isSignedAccessVersion(value.signed_access_version))
      );

    case "ka":
      return isFiniteNumber(value.t);

    case "location":
      return (
        isFiniteNumber(value.lat) &&
        value.lat >= -90 &&
        value.lat <= 90 &&
        isFiniteNumber(value.lng) &&
        value.lng >= -180 &&
        value.lng <= 180 &&
        isOptionalString(value.session_id) &&
        isOptionalFiniteNumber(value.accuracy) &&
        isOptionalString(value.place) &&
        isOptionalString(value.created_at) &&
        isOptionalBoolean(value.initial) &&
        isOptionalBoolean(value.ended) &&
        isOptionalBoolean(value.location_is_exact) &&
        isOptionalBoolean(value.location_is_approximate) &&
        isOptionalFiniteNumber(value.location_age_seconds) &&
        isOptionalString(value.location_label) &&
        (value.location_quality == null ||
          isLiveLocationQuality(value.location_quality))
      );

    case "ended":
      return (
        isOptionalString(value.session_id) &&
        isOptionalString(value.ended_at) &&
        isOptionalBoolean(value.initial)
      );

    case "sos":
      return (
        isOptionalString(value.session_id) &&
        typeof value.active === "boolean" &&
        isOptionalString(value.occurred_at)
      );

    case "advisory":
      return (
        isOptionalString(value.session_id) &&
        isOptionalBoolean(value.initial) &&
        (value.advisory == null || isAdvisorySnapshot(value.advisory))
      );

    case "nearby_presence_refresh":
      return (
        isNonEmptyString(value.session_id) &&
        isOptionalString(value.reason) &&
        isOptionalString(value.occurred_at)
      );

    case "stream_error":
      return isNonEmptyString(value.code);

    default:
      return false;
  }
}
