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
        .select("id,user_id,ended_at,destination_name,destination_address")
        .eq("id", sid)
        .maybeSingle();

      const visit = visitRes.data as {
        id?: string | null;
        user_id?: string | null;
        ended_at?: string | null;
        destination_name?: string | null;
        destination_address?: string | null;
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
        });
      }

      if (visit?.ended_at) {
        sendChunk(controller, {
          type: "ended",
          ended_at: visit.ended_at,
          initial: true,
        });
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
              });
            }
          },
        )
        .subscribe((status) => {
          if (status === "CHANNEL_ERROR") {
            sendChunk(controller, {
              type: "warning",
              message:
                "The live location channel had a brief issue. Reconnecting…",
            });
          }
        });

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
            const row = payload.new as { ended_at?: string | null };

            if (row?.ended_at) {
              sendChunk(controller, {
                type: "ended",
                ended_at: row.ended_at,
              });
            }
          },
        )
        .subscribe((status) => {
          if (status === "CHANNEL_ERROR") {
            sendChunk(controller, {
              type: "warning",
              message: "Visit status updates paused for a moment.",
            });
          }
        });

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
          .subscribe((status) => {
            if (status === "CHANNEL_ERROR") {
              sendChunk(controller, {
                type: "warning",
                message: "SOS status updates paused for a moment.",
              });
            }
          });
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
