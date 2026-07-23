// app/live/live-types.ts
//
// Shared contracts for StayKnown's signed LIVE Visit map.
//
// Privacy rule:
// - The Visit subject is always the primary map identity.
// - Nearby markers are returned only for fully approved StayKnown contacts
//   belonging to the Visit subject.
// - No anonymous-user marker contract exists in this file.
// - Nearby contact names use full first and last names.
// - The marker card is rendered by live-client.tsx directly above the avatar.

export type SignedAccessVersion = "v1" | "v2";

export type LiveAudience = "contacts" | "self";

export type LiveStatus = "loading" | "live" | "ended" | "error";

export type LivePresenceState = "live" | "recent" | "paused";

export type LiveLocationQuality =
  | "precise"
  | "approximate"
  | "broad"
  | "unknown";

export type LiveMapRenderMode = "map" | "fallback";

export type LivePanelMode = "info" | "guidance" | "custom" | "confirm" | "sent";

export type AdvisoryKind =
  | "leave_area"
  | "check_route"
  | "location_mismatch"
  | "custom";

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
  location_quality?: LiveLocationQuality | string | null;
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

  location_quality?: LiveLocationQuality | string;
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

  error?: string;
  detail?: string;
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

  location_quality?: LiveLocationQuality | string | null;
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

  error?: string;
  detail?: string;
};

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
  session_id: string;
  latest: LivePoint;
  sos_active?: boolean;
};

export type LiveEndedEvent = {
  type: "ended";
  session_id: string;
  ended_at?: string | null;
  latest?: LivePoint | null;
};

export type LiveSosEvent = {
  type: "sos";
  session_id: string;
  sos_active: boolean;
  occurred_at?: string;
};

export type LiveAdvisoryEvent = {
  type: "advisory";
  session_id: string;
  advisory: AdvisorySnapshot | null;
};

export type LiveHeartbeatEvent = {
  type: "heartbeat";
  session_id?: string;
  occurred_at?: string;
};

export type LiveStreamEvent =
  | LiveLocationEvent
  | LiveEndedEvent
  | LiveSosEvent
  | LiveAdvisoryEvent
  | NearbyPresenceRefreshEvent
  | LiveHeartbeatEvent;

export type NearbyMarkerCardView = {
  markerId: string;
  fullName: string;
  relationshipLabel: string;
  statusLabel: "LIVE Visit" | "Recently active" | "Location paused";
  placeLabel: string;
  distanceLabel: string;
  avatarUrl: string;
  presenceState: LivePresenceState;
  verified: boolean;
  badgeType: string;
};

export function isLivePresenceState(
  value: unknown,
): value is LivePresenceState {
  return value === "live" || value === "recent" || value === "paused";
}

export function isNearbyApprovedContactPresence(
  value: unknown,
): value is NearbyApprovedContactPresence {
  if (!value || typeof value !== "object") return false;

  const item = value as Partial<NearbyApprovedContactPresence>;

  return (
    typeof item.marker_id === "string" &&
    item.marker_id.trim().length > 0 &&
    typeof item.first_name === "string" &&
    item.first_name.trim().length > 0 &&
    typeof item.last_name === "string" &&
    item.last_name.trim().length > 0 &&
    typeof item.full_name === "string" &&
    item.full_name.trim().length > 0 &&
    typeof item.relationship_label === "string" &&
    item.relationship_label.trim().length > 0 &&
    typeof item.lat === "number" &&
    Number.isFinite(item.lat) &&
    item.lat >= -90 &&
    item.lat <= 90 &&
    typeof item.lng === "number" &&
    Number.isFinite(item.lng) &&
    item.lng >= -180 &&
    item.lng <= 180 &&
    typeof item.distance_meters === "number" &&
    Number.isFinite(item.distance_meters) &&
    item.distance_meters >= 0 &&
    isLivePresenceState(item.presence_state)
  );
}

export function normalizeNearbyApprovedContacts(
  value: unknown,
): NearbyApprovedContactPresence[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isNearbyApprovedContactPresence);
}
