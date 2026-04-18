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

type VisitPayload = {
  session_id?: string | null;
  purpose?: string | null;
  person_to_meet?: string | null;
  expected_duration_minutes?: number | null;
  extra_note?: string | null;
  [key: string]: unknown;
};

type VisitRow = {
  id?: string | null;
  user_id?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  destination_name?: string | null;
  destination_address?: string | null;
  start_lat?: number | null;
  start_lng?: number | null;
  end_lat?: number | null;
  end_lng?: number | null;
  payload?: VisitPayload | null;
};
type SosSessionRow = {
  ended_at?: string | null;
  started_at?: string | null;
  payload?: {
    session_id?: string | null;
    [key: string]: unknown;
  } | null;
};

type UserProfileRow = {
  display_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
};

function payloadSessionId(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const raw = (payload as { session_id?: unknown }).session_id;
  return typeof raw === "string" ? raw.trim() : "";
}

function cleanString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s ? s : null;
}

function displayNameFromProfile(profile: UserProfileRow | null): string | null {
  if (!profile) return null;

  const display = cleanString(profile.display_name);
  if (display) return display;

  const first = cleanString(profile.first_name);
  const last = cleanString(profile.last_name);
  const joined = [first, last].filter(Boolean).join(" ").trim();

  return joined || null;
}

function payloadString(payload: unknown, key: string): string | null {
  if (!payload || typeof payload !== "object") return null;
  return cleanString((payload as Record<string, unknown>)[key]);
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

    const visitRes = await sb
      .from("visits")
      .select(
        "id,user_id,started_at,ended_at,destination_name,destination_address,start_lat,start_lng,end_lat,end_lng,payload",
      )
      .eq("id", sid)
      .maybeSingle();

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

    const visit = (visitRes.data as VisitRow | null) ?? null;

    if (!visit?.id) {
      return NextResponse.json(
        {
          ok: false,
          error: "This live tracking session could not be found.",
        },
        { status: 404 },
      );
    }

    const latestRes = await sb
      .from("visit_locations")
      .select("lat,lng,accuracy,place,created_at")
      .eq("session_id", sid)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

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

    const latest = (latestRes.data as VisitLocationRow | null) ?? null;
    const ended = Boolean(visit.ended_at);

    let sos: SosSessionRow | null = null;

    if (!ended && visit.user_id) {
      const sosRes = await sb
        .from("sos_sessions")
        .select("ended_at,started_at,payload")
        .eq("user_id", visit.user_id)
        .order("started_at", { ascending: false })
        .limit(20);

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

    let visitorName: string | null = null;

    if (visit.user_id) {
      try {
        const profileRes = await sb
          .from("user_profile")
          .select("display_name,first_name,last_name")
          .eq("user_id", visit.user_id)
          .maybeSingle();

        if (!profileRes.error) {
          visitorName = displayNameFromProfile(
            (profileRes.data as UserProfileRow | null) ?? null,
          );
        }
      } catch {}
    }

    const sos_active = ended ? false : sos ? !Boolean(sos.ended_at) : false;

    const latestPoint =
      latest && typeof latest.lat === "number" && typeof latest.lng === "number"
        ? latest
        : ended &&
            typeof visit.end_lat === "number" &&
            typeof visit.end_lng === "number"
          ? {
              lat: visit.end_lat,
              lng: visit.end_lng,
              accuracy: null,
              place:
                latest?.place ??
                visit.destination_name ??
                visit.destination_address ??
                null,
              created_at: visit.ended_at ?? latest?.created_at ?? null,
            }
          : !ended &&
              typeof visit.start_lat === "number" &&
              typeof visit.start_lng === "number"
            ? {
                lat: visit.start_lat,
                lng: visit.start_lng,
                accuracy: null,
                place:
                  latest?.place ??
                  visit.destination_name ??
                  visit.destination_address ??
                  null,
                created_at: visit.started_at ?? latest?.created_at ?? null,
              }
            : null;
    const payload = (visit.payload ?? {}) as VisitPayload;

    const destinationName =
      cleanString(visit.destination_name) ??
      payloadString(visit.payload, "destination_name");

    const destinationAddress =
      cleanString(visit.destination_address) ??
      payloadString(visit.payload, "destination_address");

    return NextResponse.json({
      ok: true,
      session_id: sid,
      latest: latestPoint,
      ended,
      sos_active,
      started_at: visit.started_at ?? null,
      destination_name: destinationName,
      destination_address: destinationAddress,
      purpose: cleanString((visit.payload ?? {}).purpose),
      person_to_meet: cleanString((visit.payload ?? {}).person_to_meet),
      expected_duration_minutes:
        typeof (visit.payload ?? {}).expected_duration_minutes === "number"
          ? (visit.payload ?? {}).expected_duration_minutes
          : null,
      extra_note: cleanString((visit.payload ?? {}).extra_note),
      visitor_name: visitorName,
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
