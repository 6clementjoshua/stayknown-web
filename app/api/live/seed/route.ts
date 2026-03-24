import { NextResponse } from "next/server";
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

type VisitLocationRow = {
  lat?: number | null;
  lng?: number | null;
  accuracy?: number | null;
  place?: string | null;
  created_at?: string | null;
};

type VisitRow = {
  id?: string | null;
  user_id?: string | null;
  ended_at?: string | null;
};

type SosSessionRow = {
  ended_at?: string | null;
  started_at?: string | null;
  payload?: {
    session_id?: string | null;
    [key: string]: unknown;
  } | null;
};

function payloadSessionId(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const raw = (payload as { session_id?: unknown }).session_id;
  return typeof raw === "string" ? raw.trim() : "";
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sid = (url.searchParams.get("sid") || "").trim();

    if (!sid) {
      return NextResponse.json(
        {
          ok: false,
          error: "This live tracking link is missing its session details.",
        },
        { status: 400 },
      );
    }

    const sb = admin();

    const latestResPromise = sb
      .from("visit_locations")
      .select("lat,lng,accuracy,place,created_at")
      .eq("session_id", sid)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const visitResPromise = sb
      .from("visits")
      .select("id,user_id,ended_at")
      .eq("id", sid)
      .maybeSingle();

    const [latestRes, visitRes] = await Promise.all([
      latestResPromise,
      visitResPromise,
    ]);

    if (latestRes.error) {
      return NextResponse.json(
        {
          ok: false,
          error: "We could not load the latest live location right now.",
          detail: latestRes.error.message,
        },
        { status: 500 },
      );
    }

    if (visitRes.error) {
      return NextResponse.json(
        {
          ok: false,
          error: "We could not load the visit status right now.",
          detail: visitRes.error.message,
        },
        { status: 500 },
      );
    }

    const latest = (latestRes.data as VisitLocationRow | null) ?? null;
    const visit = (visitRes.data as VisitRow | null) ?? null;

    let sos: SosSessionRow | null = null;

    if (visit?.user_id) {
      const sosRes = await sb
        .from("sos_sessions")
        .select("ended_at,started_at,payload")
        .eq("user_id", visit.user_id)
        .order("started_at", { ascending: false });

      if (sosRes.error) {
        return NextResponse.json(
          {
            ok: false,
            error: "We could not load the SOS status right now.",
            detail: sosRes.error.message,
          },
          { status: 500 },
        );
      }

      const rows = (sosRes.data ?? []) as SosSessionRow[];

      sos = rows.find((row) => payloadSessionId(row.payload) === sid) ?? null;
    }

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
        error:
          e instanceof Error
            ? e.message
            : "Live tracking could not be loaded right now.",
      },
      { status: 500 },
    );
  }
}
