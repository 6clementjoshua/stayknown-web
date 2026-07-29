// app/api/live/stream/route.ts
// StayKnown Upgrade Master File Record:
// secure recipient-bound LIVE Visit event stream.

import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

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

const KEEP_ALIVE_INTERVAL_MS = 15000;
const NEARBY_REFRESH_INTERVAL_MS = 25000;

const JSON_HEADERS: Record<string, string> = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "private, no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
};

const STREAM_HEADERS: Record<string, string> = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control":
    "private, no-store, no-cache, must-revalidate, no-transform, max-age=0",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
};

type NearbyRefreshReason =
  | "presence_started"
  | "presence_updated"
  | "presence_paused"
  | "presence_ended"
  | "presence_expired"
  | "contact_membership_changed"
  | "manual_refresh";

type LocationQualitySnapshot = {
  location_quality: "exact" | "approximate" | "coarse" | "unknown";
  location_is_exact: boolean;
  location_is_approximate: boolean;
  location_age_seconds: number | null;
  location_label: string;
};

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}

function locationQuality(
  accuracy?: number | null,
  createdAt?: string | null,
): LocationQualitySnapshot {
  const acc =
    typeof accuracy === "number" && Number.isFinite(accuracy)
      ? Math.max(0, accuracy)
      : null;

  const createdValue = clean(createdAt);
  const created = createdValue ? new Date(createdValue) : null;

  const ageSeconds =
    created && !Number.isNaN(created.getTime())
      ? Math.max(0, Math.floor((Date.now() - created.getTime()) / 1000))
      : null;

  if (acc == null) {
    return {
      location_quality: "unknown",
      location_is_exact: false,
      location_is_approximate: true,
      location_age_seconds: ageSeconds,
      location_label: "Accuracy unknown",
    };
  }

  if (acc <= 80 && (ageSeconds == null || ageSeconds <= 180)) {
    return {
      location_quality: "exact",
      location_is_exact: true,
      location_is_approximate: false,
      location_age_seconds: ageSeconds,
      location_label: `Exact GPS • ± ${acc.toFixed(1)} m`,
    };
  }

  if (acc <= 250 && (ageSeconds == null || ageSeconds <= 600)) {
    return {
      location_quality: "approximate",
      location_is_exact: false,
      location_is_approximate: true,
      location_age_seconds: ageSeconds,
      location_label: `Approximate area • ± ${acc.toFixed(1)} m`,
    };
  }

  return {
    location_quality: "coarse",
    location_is_exact: false,
    location_is_approximate: true,
    location_age_seconds: ageSeconds,
    location_label: `Last known approximate area • ± ${acc.toFixed(0)} m`,
  };
}

function logDatabaseFailure(
  operation: string,
  error: {
    code?: string | null;
    message?: string | null;
    details?: string | null;
    hint?: string | null;
  },
): void {
  console.error(`[SK_LIVE_STREAM] ${operation} failed`, {
    code: clean(error.code) || null,
    message: clean(error.message) || null,
    details: clean(error.details) || null,
    hint: clean(error.hint) || null,
  });
}

function safeAccessFailure(error: unknown): {
  status: number;
  error: string;
  code: string;
} {
  const code = error instanceof Error ? clean(error.message) : "";

  if (code === "visit_not_found") {
    return {
      status: 404,
      error: "This LIVE Visit is no longer available.",
      code: "visit_not_found",
    };
  }

  if (
    code === "recipient_not_authorized" ||
    code === "recipient_email_missing"
  ) {
    return {
      status: 403,
      error: "This recipient is not authorized to open the LIVE Visit.",
      code: "recipient_not_authorized",
    };
  }

  if (
    code === "visit_access_failed" ||
    code === "recipient_access_failed" ||
    code === "live_configuration_unavailable"
  ) {
    return {
      status: 503,
      error: "StayKnown could not verify this LIVE Visit right now.",
      code: "live_temporarily_unavailable",
    };
  }

  return {
    status: 500,
    error: "StayKnown could not open the LIVE Visit stream right now.",
    code: "live_stream_failed",
  };
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function payloadObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

async function loadApprovedContactUserIds(
  admin: SupabaseClient,
  ownerUserId: string,
): Promise<string[]> {
  const result = await admin
    .from("emergency_contacts")
    .select("target_user_id,approval_status,blocked,restricted")
    .eq("user_id", ownerUserId)
    .eq("approval_status", "approved");

  if (result.error) {
    logDatabaseFailure("approved-contact presence lookup", result.error);
    return [];
  }

  return Array.from(
    new Set(
      (result.data ?? [])
        .filter(
          (row) =>
            row.blocked !== true &&
            row.restricted !== true &&
            Boolean(clean(row.target_user_id)),
        )
        .map((row) => clean(row.target_user_id))
        .filter(Boolean),
    ),
  );
}

export async function GET(req: Request): Promise<Response> {
  const requestUrl = new URL(req.url);
  const access = accessFromSearchParams(requestUrl.searchParams);
  const verified = verifyLiveAccess(access);

  if (!verified.ok) {
    /*
    Do not disclose whether verification failed because of expiry, signature,
    audience, configuration, or a missing signed field.
    */
    return jsonResponse(
      {
        ok: false,
        error: "This signed LIVE Visit access is invalid or expired.",
        code: "invalid_live_access",
      },
      401,
    );
  }

  let admin: SupabaseClient;
  let accessContext: Awaited<ReturnType<typeof validateVisitAccess>>;

  try {
    admin = createAdminClient();
    accessContext = await validateVisitAccess(admin, verified);
  } catch (error) {
    console.error("[SK_LIVE_STREAM] access validation failed", {
      code: error instanceof Error ? clean(error.message) : "unknown_error",
    });

    const failure = safeAccessFailure(error);

    return jsonResponse(
      {
        ok: false,
        error: failure.error,
        code: failure.code,
      },
      failure.status,
    );
  }

  const sid = verified.sid;
  const visit = accessContext.visit;
  const ownerUserId = visitOwnerUserId(accessContext, verified);
  const recipientId = accessContext.recipient?.id ?? "";
  const initialEnded = visitHasEnded(visit);
  const interactiveActionsAllowed = canUseInteractiveLiveActions(
    verified,
    accessContext,
  );
  const nearbyPresenceEnabled = interactiveActionsAllowed && !initialEnded;

  const encoder = new TextEncoder();

  let closed = false;
  let cleanedUp = false;
  let keepAlive: ReturnType<typeof setInterval> | null = null;
  let nearbyRefreshTimer: ReturnType<typeof setInterval> | null = null;

  let locationChannel: RealtimeChannel | null = null;
  let visitChannel: RealtimeChannel | null = null;
  let sosChannel: RealtimeChannel | null = null;
  let advisoryChannel: RealtimeChannel | null = null;
  let nearbyPresenceChannel: RealtimeChannel | null = null;

  const cleanup = async (): Promise<void> => {
    if (cleanedUp) return;

    cleanedUp = true;
    closed = true;

    if (keepAlive !== null) {
      clearInterval(keepAlive);
      keepAlive = null;
    }

    if (nearbyRefreshTimer !== null) {
      clearInterval(nearbyRefreshTimer);
      nearbyRefreshTimer = null;
    }

    const channels = [
      locationChannel,
      visitChannel,
      sosChannel,
      advisoryChannel,
      nearbyPresenceChannel,
    ];

    locationChannel = null;
    visitChannel = null;
    sosChannel = null;
    advisoryChannel = null;
    nearbyPresenceChannel = null;

    await Promise.allSettled(
      channels
        .filter((channel): channel is RealtimeChannel => channel !== null)
        .map(async (channel) => {
          try {
            await admin.removeChannel(channel);
          } catch {}
        }),
    );
  };

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const closeController = async (): Promise<void> => {
        await cleanup();

        try {
          controller.close();
        } catch {}
      };

      const sendChunk = (value: unknown): boolean => {
        if (closed || req.signal.aborted) return false;

        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(value)}\n\n`),
          );
          return true;
        } catch {
          void cleanup();
          return false;
        }
      };

      const sendNearbyRefresh = (
        reason: NearbyRefreshReason = "manual_refresh",
      ): void => {
        if (!nearbyPresenceEnabled || closed) return;

        sendChunk({
          type: "nearby_presence_refresh",
          session_id: sid,
          reason,
          occurred_at: new Date().toISOString(),
        });
      };

      const abortHandler = (): void => {
        void closeController();
      };

      req.signal.addEventListener("abort", abortHandler, { once: true });

      try {
        if (req.signal.aborted) {
          await closeController();
          return;
        }

        sendChunk({
          type: "ready",
          session_id: sid,
          advisory_enabled: interactiveActionsAllowed,
          nearby_presence_enabled: nearbyPresenceEnabled,
          legacy_read_only: accessContext.legacyReadOnly,
          signed_access_version: verified.version,
          t: Date.now(),
        });

        keepAlive = setInterval(() => {
          sendChunk({
            type: "ka",
            t: Date.now(),
          });
        }, KEEP_ALIVE_INTERVAL_MS);

        if (nearbyPresenceEnabled) {
          sendNearbyRefresh("manual_refresh");

          nearbyRefreshTimer = setInterval(() => {
            sendNearbyRefresh("manual_refresh");
          }, NEARBY_REFRESH_INTERVAL_MS);
        }

        const latestResult = await admin
          .from("visit_locations")
          .select("lat,lng,accuracy,place,created_at")
          .eq("session_id", sid)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestResult.error) {
          logDatabaseFailure("initial location lookup", latestResult.error);
        }

        const latest = latestResult.data as
          | Record<string, unknown>
          | null
          | undefined;

        const ended = visitHasEnded(visit);
        const latestLat = finiteNumber(latest?.lat);
        const latestLng = finiteNumber(latest?.lng);

        if (latestLat != null && latestLng != null) {
          const accuracy = finiteNumber(latest?.accuracy);
          const createdAt = clean(latest?.created_at) || null;

          sendChunk({
            type: "location",
            lat: latestLat,
            lng: latestLng,
            accuracy,
            place:
              clean(latest?.place) ||
              clean(visit.destination_name) ||
              clean(visit.destination_address) ||
              null,
            created_at: createdAt,
            initial: true,
            ended,
            ...locationQuality(accuracy, createdAt),
          });
        } else {
          const fallbackLat = finiteNumber(
            ended ? visit.end_lat : visit.start_lat,
          );
          const fallbackLng = finiteNumber(
            ended ? visit.end_lng : visit.start_lng,
          );

          if (fallbackLat != null && fallbackLng != null) {
            const createdAt =
              clean(ended ? visit.ended_at : visit.started_at) || null;

            sendChunk({
              type: "location",
              lat: fallbackLat,
              lng: fallbackLng,
              accuracy: null,
              place:
                clean(visit.destination_name) ||
                clean(visit.destination_address) ||
                null,
              created_at: createdAt,
              initial: true,
              ended,
              ...locationQuality(null, createdAt),
            });
          }
        }

        if (recipientId) {
          const advisoryResult = await admin
            .from("visit_safety_advisories")
            .select(
              "id,message_kind,message_text,status,response_kind,created_at,updated_at,leaving_at,safe_at,sender_contact_id",
            )
            .eq("visit_id", sid)
            .eq("sender_contact_id", recipientId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (advisoryResult.error) {
            logDatabaseFailure("initial advisory lookup", advisoryResult.error);
          } else if (advisoryResult.data) {
            sendChunk({
              type: "advisory",
              initial: true,
              advisory: advisoryResult.data,
            });
          }
        }

        if (ended) {
          sendChunk({
            type: "ended",
            ended_at: clean(visit.ended_at) || null,
            initial: true,
          });

          await closeController();
          return;
        }

        locationChannel = admin
          .channel(`live-loc-${sid}-${Date.now()}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "visit_locations",
              filter: `session_id=eq.${sid}`,
            },
            (payload) => {
              const row = payload.new as Record<string, unknown>;
              const lat = finiteNumber(row.lat);
              const lng = finiteNumber(row.lng);

              if (lat == null || lng == null) return;

              const accuracy = finiteNumber(row.accuracy);
              const createdAt = clean(row.created_at) || null;

              sendChunk({
                type: "location",
                lat,
                lng,
                accuracy,
                place: clean(row.place) || null,
                created_at: createdAt,
                ended: false,
                ...locationQuality(accuracy, createdAt),
              });

              /*
              Distances to approved-contact markers are calculated from the
              Visit subject's latest coordinate, so movement needs a refresh.
              */
              sendNearbyRefresh("manual_refresh");
            },
          )
          .subscribe();

        visitChannel = admin
          .channel(`live-visit-${sid}-${Date.now()}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "visits",
              filter: `id=eq.${sid}`,
            },
            (payload) => {
              const row = payload.new as Record<string, unknown>;
              const rowEnded = visitHasEnded(row);
              const endLat = finiteNumber(row.end_lat);
              const endLng = finiteNumber(row.end_lng);

              if (endLat != null && endLng != null) {
                const createdAt =
                  clean(row.ended_at) || clean(row.updated_at) || null;

                sendChunk({
                  type: "location",
                  lat: endLat,
                  lng: endLng,
                  accuracy: null,
                  place:
                    clean(row.destination_name) ||
                    clean(row.destination_address) ||
                    null,
                  created_at: createdAt,
                  ended: rowEnded,
                  ...locationQuality(null, createdAt),
                });
              }

              if (rowEnded) {
                sendChunk({
                  type: "ended",
                  ended_at:
                    clean(row.ended_at) || clean(row.updated_at) || null,
                });
                sendNearbyRefresh("presence_ended");
                void closeController();
              }
            },
          )
          .subscribe();

        sosChannel = admin
          .channel(`live-sos-${sid}-${Date.now()}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "sos_sessions",
              filter: `user_id=eq.${ownerUserId}`,
            },
            (payload) => {
              const row = (payload.new ?? payload.old) as Record<
                string,
                unknown
              > | null;

              const embedded = payloadObject(row?.payload);

              if (clean(embedded.session_id) !== sid) return;

              const eventType = clean(payload.eventType).toUpperCase();
              const active =
                eventType !== "DELETE" &&
                Boolean(row) &&
                !Boolean(row?.ended_at);

              sendChunk({
                type: "sos",
                active,
              });
            },
          )
          .subscribe();

        if (nearbyPresenceEnabled) {
          const approvedContactUserIds = await loadApprovedContactUserIds(
            admin,
            ownerUserId,
          );

          if (approvedContactUserIds.length > 0 && !closed) {
            let channel = admin.channel(
              `live-nearby-${sid}-${recipientId}-${Date.now()}`,
            );

            for (const contactUserId of approvedContactUserIds) {
              channel = channel.on(
                "postgres_changes",
                {
                  event: "*",
                  schema: "public",
                  table: "live_safety_presence",
                  filter: `user_id=eq.${contactUserId}`,
                },
                (payload) => {
                  const row = (payload.new ?? payload.old) as Record<
                    string,
                    unknown
                  > | null;

                  const state = clean(row?.presence_state).toLowerCase();
                  const eventType = clean(payload.eventType).toUpperCase();

                  if (eventType === "DELETE") {
                    sendNearbyRefresh("presence_ended");
                  } else if (state === "paused") {
                    sendNearbyRefresh("presence_paused");
                  } else if (eventType === "INSERT") {
                    sendNearbyRefresh("presence_started");
                  } else {
                    sendNearbyRefresh("presence_updated");
                  }
                },
              );
            }

            nearbyPresenceChannel = channel.subscribe();
          }
        }

        if (recipientId) {
          advisoryChannel = admin
            .channel(`live-advisory-${sid}-${recipientId}-${Date.now()}`)
            .on(
              "postgres_changes",
              {
                event: "*",
                schema: "public",
                table: "visit_safety_advisories",
                filter: `visit_id=eq.${sid}`,
              },
              (payload) => {
                const row = (payload.new ?? payload.old) as Record<
                  string,
                  unknown
                > | null;

                if (!row || clean(row.sender_contact_id) !== recipientId) {
                  return;
                }

                sendChunk({
                  type: "advisory",
                  advisory: row,
                });
              },
            )
            .subscribe();
        }
      } catch (error) {
        console.error("[SK_LIVE_STREAM] stream setup failed", {
          code: error instanceof Error ? clean(error.message) : "unknown_error",
        });

        sendChunk({
          type: "stream_error",
          code: "live_stream_interrupted",
        });

        await closeController();
      }
    },

    async cancel() {
      await cleanup();
    },
  });

  return new Response(stream, {
    headers: STREAM_HEADERS,
  });
}
