import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error("Live tracking is not fully configured yet.");
  }

  return createClient(url, serviceRole, {
    auth: { persistSession: false },
  });
}

function locationQuality(accuracy?: number | null, createdAt?: string | null) {
  const acc =
    typeof accuracy === "number" && Number.isFinite(accuracy) ? accuracy : null;

  const created =
    typeof createdAt === "string" && createdAt.trim()
      ? new Date(createdAt)
      : null;

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
  const url = new URL(req.url);
  const sid = (url.searchParams.get("sid") || "").trim();

  if (!sid) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "This live tracking link is missing its session details.",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  let sb;
  try {
    sb = admin();
  } catch (e) {
    return new Response(
      JSON.stringify({
        ok: false,
        error:
          e instanceof Error
            ? e.message
            : "Live tracking is not available right now.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const encoder = new TextEncoder();

  let closed = false;
  let keepAlive: ReturnType<typeof setInterval> | null = null;
  let ch1: ReturnType<typeof sb.channel> | null = null;
  let ch2: ReturnType<typeof sb.channel> | null = null;
  let ch3: ReturnType<typeof sb.channel> | null = null;

  const sendChunk = (
    controller: ReadableStreamDefaultController<Uint8Array>,
    obj: unknown,
  ) => {
    if (closed) return;
    try {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
    } catch {
      closed = true;
    }
  };

  const cleanup = async () => {
    if (closed) return;
    closed = true;

    if (keepAlive) {
      clearInterval(keepAlive);
      keepAlive = null;
    }

    try {
      if (ch1) await sb.removeChannel(ch1);
    } catch {}

    try {
      if (ch2) await sb.removeChannel(ch2);
    } catch {}

    try {
      if (ch3) await sb.removeChannel(ch3);
    } catch {}
  };

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      sendChunk(controller, {
        type: "ready",
        session_id: sid,
        t: Date.now(),
      });

      keepAlive = setInterval(() => {
        sendChunk(controller, { type: "ka", t: Date.now() });
      }, 15000);

      const visitRes = await sb
        .from("visits")
        .select(
          "id,user_id,ended_at,destination_name,destination_address,end_lat,end_lng",
        )
        .eq("id", sid)
        .maybeSingle();

      const visit = visitRes.data as {
        id?: string | null;
        user_id?: string | null;
        ended_at?: string | null;
        destination_name?: string | null;
        destination_address?: string | null;
        end_lat?: number | null;
        end_lng?: number | null;
      } | null;

      const latestRes = await sb
        .from("visit_locations")
        .select("lat,lng,accuracy,place,created_at")
        .eq("session_id", sid)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const latest = latestRes.data as {
        lat?: number | null;
        lng?: number | null;
        accuracy?: number | null;
        place?: string | null;
        created_at?: string | null;
      } | null;

      const ended = Boolean(visit?.ended_at);

      if (typeof latest?.lat === "number" && typeof latest?.lng === "number") {
        sendChunk(controller, {
          type: "location",
          lat: latest.lat,
          lng: latest.lng,
          accuracy: latest.accuracy ?? null,
          place:
            latest.place ??
            visit?.destination_name ??
            visit?.destination_address ??
            null,
          created_at: latest.created_at ?? null,
          initial: true,
          ended,
          ...locationQuality(
            latest.accuracy ?? null,
            latest.created_at ?? null,
          ),
        });
      } else if (
        typeof visit?.end_lat === "number" &&
        typeof visit?.end_lng === "number"
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
          ...locationQuality(null, visit.ended_at ?? null),
        });
      }

      if (ended) {
        sendChunk(controller, {
          type: "ended",
          ended_at: visit?.ended_at,
          initial: true,
        });
        return;
      }

      ch1 = sb
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
            const row = payload.new as {
              lat?: number;
              lng?: number;
              accuracy?: number | null;
              place?: string | null;
              created_at?: string | null;
            };

            if (typeof row?.lat === "number" && typeof row?.lng === "number") {
              sendChunk(controller, {
                type: "location",
                lat: row.lat,
                lng: row.lng,
                accuracy: row.accuracy ?? null,
                place: row.place ?? null,
                created_at: row.created_at ?? null,
                ended: false,
                ...locationQuality(
                  row.accuracy ?? null,
                  row.created_at ?? null,
                ),
              });
            }
          },
        )
        .subscribe();

      ch2 = sb
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
            const row = payload.new as {
              ended_at?: string | null;
              end_lat?: number | null;
              end_lng?: number | null;
              destination_name?: string | null;
              destination_address?: string | null;
            };

            if (
              typeof row?.end_lat === "number" &&
              typeof row?.end_lng === "number"
            ) {
              sendChunk(controller, {
                type: "location",
                lat: row.end_lat,
                lng: row.end_lng,
                accuracy: null,
                place: row.destination_name ?? row.destination_address ?? null,
                created_at: row.ended_at ?? null,
                ended: Boolean(row.ended_at),
                ...locationQuality(null, row.ended_at ?? null),
              });
            }

            if (row?.ended_at) {
              sendChunk(controller, {
                type: "ended",
                ended_at: row.ended_at,
              });
            }
          },
        )
        .subscribe();

      const visitOwnerId = visit?.user_id ?? null;

      if (visitOwnerId) {
        ch3 = sb
          .channel(`live-sos-${sid}-${Date.now()}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "sos_sessions",
              filter: `user_id=eq.${visitOwnerId}`,
            },
            (payload) => {
              const row = payload.new as {
                ended_at?: string | null;
                payload?: { session_id?: string | null } | null;
              } | null;

              const payloadSessionId =
                typeof row?.payload === "object" && row?.payload
                  ? String(row.payload.session_id || "").trim()
                  : "";

              if (payloadSessionId !== sid) return;

              const active = row ? !Boolean(row.ended_at) : false;

              sendChunk(controller, {
                type: "sos",
                active,
              });
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
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
