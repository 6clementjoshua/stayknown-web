import {
  accessFromSearchParams,
  clean,
  createAdminClient,
  validateVisitAccess,
  verifyLiveAccess,
} from "../../../live/live-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NEARBY_REFRESH_INTERVAL_MS = 25000;

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function locationQuality(accuracy?: number | null, createdAt?: string | null) {
  const acc =
    typeof accuracy === "number" && Number.isFinite(accuracy) ? accuracy : null;
  const created = createdAt && clean(createdAt) ? new Date(createdAt) : null;
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

export async function GET(req: Request) {
  const requestUrl = new URL(req.url);
  const access = accessFromSearchParams(requestUrl.searchParams);
  const verified = verifyLiveAccess(access);

  if (!verified.ok) {
    return jsonResponse(
      {
        ok: false,
        error: "This signed live-map access is invalid or expired.",
        reason: verified.reason,
      },
      401,
    );
  }

  let admin;
  let accessContext;

  try {
    admin = createAdminClient();
    accessContext = await validateVisitAccess(admin, verified);
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Live access failed.",
      },
      403,
    );
  }

  const sid = verified.sid;
  const ownerUserId = clean(accessContext.visit.user_id) || verified.uid;
  const recipientId = accessContext.recipient?.id ?? "";
  const initialEnded = Boolean(accessContext.visit.ended_at);
  const nearbyPresenceEnabled =
    verified.version === "v2" &&
    verified.aud === "contacts" &&
    Boolean(recipientId) &&
    !accessContext.legacyReadOnly &&
    !initialEnded;

  const encoder = new TextEncoder();

  let closed = false;
  let keepAlive: ReturnType<typeof setInterval> | null = null;
  let nearbyRefreshTimer: ReturnType<typeof setInterval> | null = null;

  let locationChannel: ReturnType<typeof admin.channel> | null = null;
  let visitChannel: ReturnType<typeof admin.channel> | null = null;
  let sosChannel: ReturnType<typeof admin.channel> | null = null;
  let advisoryChannel: ReturnType<typeof admin.channel> | null = null;
  let nearbyPresenceChannel: ReturnType<typeof admin.channel> | null = null;

  const sendChunk = (
    controller: ReadableStreamDefaultController<Uint8Array>,
    value: unknown,
  ) => {
    if (closed) return;
    try {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(value)}\n\n`));
    } catch {
      closed = true;
    }
  };

  const sendNearbyRefresh = (
    controller: ReadableStreamDefaultController<Uint8Array>,
    reason:
      | "presence_started"
      | "presence_updated"
      | "presence_paused"
      | "presence_ended"
      | "presence_expired"
      | "contact_membership_changed"
      | "manual_refresh" = "manual_refresh",
  ) => {
    if (!nearbyPresenceEnabled || closed) return;

    sendChunk(controller, {
      type: "nearby_presence_refresh",
      session_id: sid,
      reason,
      occurred_at: new Date().toISOString(),
    });
  };

  const cleanup = async () => {
    if (closed) return;
    closed = true;

    if (keepAlive) clearInterval(keepAlive);
    keepAlive = null;

    if (nearbyRefreshTimer) clearInterval(nearbyRefreshTimer);
    nearbyRefreshTimer = null;

    for (const channel of [
      locationChannel,
      visitChannel,
      sosChannel,
      advisoryChannel,
      nearbyPresenceChannel,
    ]) {
      if (!channel) continue;
      try {
        await admin.removeChannel(channel);
      } catch {}
    }
  };

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      sendChunk(controller, {
        type: "ready",
        session_id: sid,
        advisory_enabled: Boolean(recipientId) && !accessContext.legacyReadOnly,
        nearby_presence_enabled: nearbyPresenceEnabled,
        t: Date.now(),
      });

      keepAlive = setInterval(() => {
        sendChunk(controller, { type: "ka", t: Date.now() });
      }, 15000);

      if (nearbyPresenceEnabled) {
        sendNearbyRefresh(controller, "manual_refresh");

        nearbyRefreshTimer = setInterval(() => {
          sendNearbyRefresh(controller, "manual_refresh");
        }, NEARBY_REFRESH_INTERVAL_MS);
      }

      const visit = accessContext.visit;
      const latestResult = await admin
        .from("visit_locations")
        .select("lat,lng,accuracy,place,created_at")
        .eq("session_id", sid)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const latest = latestResult.data as Record<string, unknown> | null;
      const ended = Boolean(visit.ended_at);

      if (typeof latest?.lat === "number" && typeof latest?.lng === "number") {
        sendChunk(controller, {
          type: "location",
          lat: latest.lat,
          lng: latest.lng,
          accuracy: latest.accuracy ?? null,
          place:
            latest.place ??
            visit.destination_name ??
            visit.destination_address ??
            null,
          created_at: latest.created_at ?? null,
          initial: true,
          ended,
          ...locationQuality(
            typeof latest.accuracy === "number" ? latest.accuracy : null,
            clean(latest.created_at) || null,
          ),
        });
      } else if (
        typeof visit.end_lat === "number" &&
        typeof visit.end_lng === "number"
      ) {
        sendChunk(controller, {
          type: "location",
          lat: visit.end_lat,
          lng: visit.end_lng,
          accuracy: null,
          place: visit.destination_name ?? visit.destination_address ?? null,
          created_at: visit.ended_at ?? null,
          initial: true,
          ended: true,
          ...locationQuality(null, clean(visit.ended_at) || null),
        });
      }

      if (recipientId) {
        const advisoryResult = await admin
          .from("visit_safety_advisories")
          .select(
            "id,message_kind,message_text,status,response_kind,created_at,updated_at,leaving_at,safe_at",
          )
          .eq("visit_id", sid)
          .eq("sender_contact_id", recipientId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!advisoryResult.error && advisoryResult.data) {
          sendChunk(controller, {
            type: "advisory",
            initial: true,
            advisory: advisoryResult.data,
          });
        }
      }

      if (ended) {
        sendChunk(controller, {
          type: "ended",
          ended_at: visit.ended_at,
          initial: true,
        });
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
            if (typeof row.lat !== "number" || typeof row.lng !== "number")
              return;

            sendChunk(controller, {
              type: "location",
              lat: row.lat,
              lng: row.lng,
              accuracy: row.accuracy ?? null,
              place: row.place ?? null,
              created_at: row.created_at ?? null,
              ended: false,
              ...locationQuality(
                typeof row.accuracy === "number" ? row.accuracy : null,
                clean(row.created_at) || null,
              ),
            });

            // Distances to approved-contact markers are calculated from the
            // Visit subject's latest coordinate, so a subject movement needs
            // a secure nearby-route refresh.
            sendNearbyRefresh(controller, "manual_refresh");
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

            if (
              typeof row.end_lat === "number" &&
              typeof row.end_lng === "number"
            ) {
              sendChunk(controller, {
                type: "location",
                lat: row.end_lat,
                lng: row.end_lng,
                accuracy: null,
                place: row.destination_name ?? row.destination_address ?? null,
                created_at: row.ended_at ?? null,
                ended: Boolean(row.ended_at),
                ...locationQuality(null, clean(row.ended_at) || null),
              });
            }

            if (row.ended_at) {
              sendChunk(controller, { type: "ended", ended_at: row.ended_at });
              sendNearbyRefresh(controller, "presence_ended");
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
            const row = payload.new as Record<string, unknown> | null;
            const embedded =
              row?.payload && typeof row.payload === "object"
                ? (row.payload as Record<string, unknown>)
                : {};
            if (clean(embedded.session_id) !== sid) return;
            sendChunk(controller, {
              type: "sos",
              active: row ? !Boolean(row.ended_at) : false,
            });
          },
        )
        .subscribe();

      if (nearbyPresenceEnabled) {
        const contactsResult = await admin
          .from("emergency_contacts")
          .select("target_user_id,approval_status,blocked,restricted")
          .eq("user_id", ownerUserId)
          .eq("approval_status", "approved");

        const approvedContactUserIds = Array.from(
          new Set(
            (contactsResult.data ?? [])
              .filter(
                (row) =>
                  row.blocked !== true &&
                  row.restricted !== true &&
                  clean(row.target_user_id),
              )
              .map((row) => clean(row.target_user_id))
              .filter(Boolean),
          ),
        );

        if (approvedContactUserIds.length > 0) {
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
                  sendNearbyRefresh(controller, "presence_ended");
                } else if (state === "paused") {
                  sendNearbyRefresh(controller, "presence_paused");
                } else if (eventType === "INSERT") {
                  sendNearbyRefresh(controller, "presence_started");
                } else {
                  sendNearbyRefresh(controller, "presence_updated");
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
              if (!row || clean(row.sender_contact_id) !== recipientId) return;
              sendChunk(controller, { type: "advisory", advisory: row });
            },
          )
          .subscribe();
      }

      req.signal.addEventListener("abort", async () => {
        await cleanup();
        try {
          controller.close();
        } catch {}
      });
    },

    async cancel() {
      await cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "private, no-store, no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
