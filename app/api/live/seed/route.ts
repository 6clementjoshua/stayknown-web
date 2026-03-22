import { NextResponse } from "next/server";
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
  try {
    const url = new URL(req.url);
    const sid = url.searchParams.get("sid") || "";

    if (!sid) {
      return NextResponse.json(
        { ok: false, error: "missing_sid" },
        { status: 400 },
      );
    }

    const sb = admin();

    const [latestRes, visitRes, sosRes] = await Promise.all([
      sb
        .from("visit_locations")
        .select("lat,lng,accuracy,place,created_at")
        .eq("session_id", sid)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),

      sb.from("visits").select("ended_at").eq("id", sid).maybeSingle(),

      sb
        .from("sos_sessions")
        .select("ended_at,started_at")
        .eq("session_id", sid)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (latestRes.error) {
      return NextResponse.json(
        { ok: false, error: latestRes.error.message },
        { status: 500 },
      );
    }

    if (visitRes.error) {
      return NextResponse.json(
        { ok: false, error: visitRes.error.message },
        { status: 500 },
      );
    }

    if (sosRes.error) {
      return NextResponse.json(
        { ok: false, error: sosRes.error.message },
        { status: 500 },
      );
    }

    const latest = latestRes.data ?? undefined;
    const visit = visitRes.data as { ended_at?: string | null } | null;
    const sos = sosRes.data as { ended_at?: string | null } | null;

    const ended = Boolean(visit?.ended_at);
    const sos_active = sos ? !Boolean(sos.ended_at) : false;

    return NextResponse.json({
      ok: true,
      session_id: sid,
      latest,
      ended,
      sos_active,
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "seed_failed",
      },
      { status: 500 },
    );
  }
}
