import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sid = url.searchParams.get("sid") || "";

  if (!sid) {
    return new Response(JSON.stringify({ ok: false, error: "missing_sid" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const sb = admin();
  const encoder = new TextEncoder();

  let closed = false;
  let keepAlive: ReturnType<typeof setInterval> | null = null;
  let ch1: ReturnType<typeof sb.channel> | null = null;
  let ch2: ReturnType<typeof sb.channel> | null = null;
  let ch3: ReturnType<typeof sb.channel> | null = null;

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
      const send = (obj: unknown) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };

      send({ type: "ready", session_id: sid, t: Date.now() });

      keepAlive = setInterval(() => {
        send({ type: "ka", t: Date.now() });
      }, 15000);

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
              send({
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
            const row = payload.new as { ended_at?: string | null };

            if (row?.ended_at) {
              send({ type: "ended", ended_at: row.ended_at });
            }
          },
        )
        .subscribe();

      ch3 = sb
        .channel(`live-sos-${sid}-${Date.now()}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "sos_sessions",
            filter: `session_id=eq.${sid}`,
          },
          (payload) => {
            const row = payload.new as { ended_at?: string | null } | null;
            const active = row ? !Boolean(row.ended_at) : false;
            send({ type: "sos", active });
          },
        )
        .subscribe();

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
