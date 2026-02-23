import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function admin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
}

export async function GET(req: Request) {
    const url = new URL(req.url);
    const sid = url.searchParams.get("sid") || "";
    if (!sid) return new Response("missing sid", { status: 400 });

    const sb = admin();

    const stream = new ReadableStream({
        start(controller) {
            const enc = new TextEncoder();
            const send = (obj: any) => controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));

            // keepalive
            const ka = setInterval(() => send({ type: "ka", t: Date.now() }), 25_000);

            // visit_locations inserts
            const ch1 = sb
                .channel("live-loc-" + sid)
                .on(
                    "postgres_changes",
                    { event: "INSERT", schema: "public", table: "visit_locations", filter: `session_id=eq.${sid}` },
                    (payload) => {
                        const row: any = payload.new;
                        if (typeof row?.lat === "number" && typeof row?.lng === "number") {
                            send({ type: "location", lat: row.lat, lng: row.lng, accuracy: row.accuracy ?? null, created_at: row.created_at });
                        }
                    }
                )
                .subscribe();

            // visits ended detection
            const ch2 = sb
                .channel("live-visit-" + sid)
                .on(
                    "postgres_changes",
                    { event: "UPDATE", schema: "public", table: "visits", filter: `id=eq.${sid}` },
                    (payload) => {
                        const row: any = payload.new;
                        if (row?.ended_at) send({ type: "ended", ended_at: row.ended_at });
                    }
                )
                .subscribe();

            // sos sessions state
            const ch3 = sb
                .channel("live-sos-" + sid)
                .on(
                    "postgres_changes",
                    { event: "*", schema: "public", table: "sos_sessions", filter: `session_id=eq.${sid}` },
                    (payload) => {
                        const row: any = payload.new;
                        const active = row ? !Boolean(row.ended_at) : false;
                        send({ type: "sos", active });
                    }
                )
                .subscribe();

            // cleanup
            (controller as any)._cleanup = async () => {
                clearInterval(ka);
                try { await sb.removeChannel(ch1); } catch { }
                try { await sb.removeChannel(ch2); } catch { }
                try { await sb.removeChannel(ch3); } catch { }
                controller.close();
            };
        },
        cancel() {
            // handled below
        },
    });

    // When client disconnects
    req.signal.addEventListener("abort", async () => {
        try {
            // @ts-ignore
            await stream?.cancel?.();
        } catch { }
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
        },
    });
}