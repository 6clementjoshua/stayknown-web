import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PresenceRow = {
  is_online?: boolean | null;
  is_in_thread?: boolean | null;
  active_thread_id?: string | null;
  last_seen_at?: string | null;
};

function clean(v: string | null) {
  return (v || "").trim();
}

function asNumber(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function metaMap(v: unknown): Record<string, any> {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    return v as Record<string, any>;
  }
  return {};
}

function distanceMeters(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const aa = s1 * s1 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * s2 * s2;
  return R * (2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa)));
}

function makeSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_KEY?.trim();

  if (!url || !key) {
    throw new Error("Supabase server credentials are missing.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

    const threadId = clean(url.searchParams.get("thread_id"));
    const messageId = clean(url.searchParams.get("message_id"));
    let senderId = clean(url.searchParams.get("sender_id"));

    const openedLat = asNumber(url.searchParams.get("lat"));
    const openedLng = asNumber(url.searchParams.get("lng"));
    const openedCapturedAt = clean(url.searchParams.get("captured_at"));

    if (!threadId && !messageId) {
      return NextResponse.json(
        {
          ok: false,
          error: "missing_context",
        },
        { status: 400 },
      );
    }

    const sb = makeSupabaseAdmin();

    let openedMessage: any = null;

    if (messageId) {
      const { data, error } = await sb
        .from("chat_messages")
        .select("id, thread_id, sender_id, kind, body, meta, created_at")
        .eq("id", messageId)
        .maybeSingle();

      if (!error && data) {
        openedMessage = data;
        if (!senderId) senderId = String(data.sender_id || "").trim();
      }
    }

    let presence: PresenceRow | null = null;

    if (senderId) {
      const { data } = await sb.rpc("chat_get_presence", {
        p_user_id: senderId,
      });

      if (Array.isArray(data) && data.length > 0) {
        presence = data[0] as PresenceRow;
      } else if (data && typeof data === "object") {
        presence = data as PresenceRow;
      }
    }

    const presenceActiveThread = clean(
      String(presence?.active_thread_id || ""),
    );

    const isOnline = presence?.is_online === true;
    const isInThisChat =
      presence?.is_in_thread === true ||
      (presenceActiveThread !== "" && presenceActiveThread === threadId);

    let latestMessage: any = null;

    if (threadId && senderId) {
      const { data: latestRows } = await sb
        .from("chat_messages")
        .select("id, thread_id, sender_id, kind, body, meta, created_at")
        .eq("thread_id", threadId)
        .eq("sender_id", senderId)
        .order("created_at", { ascending: false })
        .limit(50);

      const rows = Array.isArray(latestRows) ? latestRows : [];

      latestMessage =
        rows.find((row) => {
          const meta = metaMap(row.meta);
          const lat = asNumber(meta.lat);
          const lng = asNumber(meta.lng);
          return lat !== null && lng !== null;
        }) || null;
    }

    const latestMeta = metaMap(latestMessage?.meta);
    const latestLat = asNumber(latestMeta.lat);
    const latestLng = asNumber(latestMeta.lng);

    const openedMeta = metaMap(openedMessage?.meta);
    const messageLat = asNumber(openedMeta.lat);
    const messageLng = asNumber(openedMeta.lng);

    const effectiveOpenedLat = messageLat ?? openedLat;
    const effectiveOpenedLng = messageLng ?? openedLng;

    let newerCoordinateAvailable = false;

    if (
      latestMessage &&
      latestLat !== null &&
      latestLng !== null &&
      effectiveOpenedLat !== null &&
      effectiveOpenedLng !== null
    ) {
      const openedId = clean(String(openedMessage?.id || messageId || ""));
      const latestId = clean(String(latestMessage.id || ""));

      const distance = distanceMeters(
        effectiveOpenedLat,
        effectiveOpenedLng,
        latestLat,
        latestLng,
      );

      newerCoordinateAvailable =
        latestId !== "" &&
        openedId !== "" &&
        latestId !== openedId &&
        distance >= 8;
    }

    const openedMessageCreatedAt =
      clean(String(openedMessage?.created_at || "")) || openedCapturedAt;

    return NextResponse.json({
      ok: true,
      sender_id: senderId,
      thread_id: threadId,
      message_id: messageId,
      presence: {
        is_online: isOnline,
        is_in_this_chat: isInThisChat,
        active_thread_id: presenceActiveThread || null,
        last_seen_at: presence?.last_seen_at || null,
      },
      opened_message: openedMessage
        ? {
            id: openedMessage.id,
            created_at: openedMessage.created_at,
            kind: openedMessage.kind,
            lat: effectiveOpenedLat,
            lng: effectiveOpenedLng,
            place: clean(String(openedMeta.place || "")),
            captured_at: clean(String(openedMeta.captured_at || "")),
          }
        : {
            id: messageId || null,
            created_at: openedMessageCreatedAt || null,
            lat: effectiveOpenedLat,
            lng: effectiveOpenedLng,
            place: "",
            captured_at: openedCapturedAt || null,
          },
      latest_coordinate:
        latestMessage && latestLat !== null && latestLng !== null
          ? {
              message_id: latestMessage.id,
              lat: latestLat,
              lng: latestLng,
              place: clean(String(latestMeta.place || "")),
              captured_at: clean(String(latestMeta.captured_at || "")),
              created_at: latestMessage.created_at,
            }
          : null,
      newer_coordinate_available: newerCoordinateAvailable,
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: "status_lookup_failed",
        detail: e instanceof Error ? e.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
