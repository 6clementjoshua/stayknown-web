import { NextResponse } from "next/server";
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

    if (!sid) return NextResponse.json({ ok: false, error: "missing_sid" }, { status: 400 });

    const sb = admin();

    // latest location
    const { data: latest } = await sb
        .from("visit_locations")
        .select("lat,lng,accuracy,created_at")
        .eq("session_id", sid)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    // visit ended?
    const { data: visit } = await sb
        .from("visits")
        .select("ended_at")
        .eq("id", sid)
        .maybeSingle();

    const ended = Boolean((visit as any)?.ended_at);

    // SOS active?
    const { data: sos } = await sb
        .from("sos_sessions")
        .select("ended_at")
        .eq("session_id", sid)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    const sos_active = sos ? !Boolean((sos as any)?.ended_at) : false;

    return NextResponse.json({
        ok: true,
        session_id: sid,
        latest: latest ?? undefined,
        ended,
        sos_active,
    });
}