import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  accessFromUnknown,
  clean,
  createAdminClient,
  requestIpHash,
  resolveStayKnownUserByEmail,
  validateVisitAccess,
  verifyLiveAccess,
} from "../../../../live/live-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const POLICY_VERSION = "visit-map-safety-use-v2-2026-07-17";
const COOLDOWN_SECONDS = 300;

const PRESETS: Record<string, string> = {
  leave_area:
    "I’m concerned about your current area. Please leave carefully and contact me.",
  check_route:
    "I know this route. You may be heading toward an unsafe area. Please check your route now.",
  location_mismatch:
    "Your current location does not match where I expected you to be. Please confirm your location.",
};

function escapeHtml(value: unknown): string {
  return clean(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function validateMessage(kind: string, customMessage: string): string {
  if (kind in PRESETS) return PRESETS[kind];
  if (kind !== "custom") throw new Error("unsupported_advisory_kind");

  const message = customMessage.replace(/\s+/g, " ").trim();
  if (!message) throw new Error("custom_message_required");
  if (message.length > 160) throw new Error("custom_message_too_long");
  if (/https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|app)\b/i.test(message)) {
    throw new Error("custom_message_links_not_allowed");
  }
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(message)) {
    throw new Error("custom_message_invalid_characters");
  }

  const prohibitedPatterns = [
    /\bcome\s+alone\b/i,
    /\bmeet\s+me\s+alone\b/i,
    /\bdo\s+not\s+tell\s+(anyone|your\s+family|the\s+police)\b/i,
    /\bdon['’]?t\s+tell\s+(anyone|your\s+family|the\s+police)\b/i,
    /\byou\s+must\s+obey\b/i,
    /\bi\s+am\s+watching\s+you\b/i,
    /\bi\s+will\s+(hurt|kill|punish|attack)\s+you\b/i,
    /\bI['’]?ll\s+(hurt|kill|punish|attack)\s+you\b/i,
  ];

  if (prohibitedPatterns.some((pattern) => pattern.test(message))) {
    throw new Error("custom_message_policy_blocked");
  }

  return message;
}

async function loadSenderIdentity(admin: SupabaseClient, userId: string) {
  if (!userId) {
    return {
      displayName: "",
      email: "",
      verified: false,
      badgeType: "",
      badgeStatus: "",
      avatarUrl: "",
    };
  }

  let displayName = "";
  let profileEmail = "";
  let verified = false;
  let badgeType = "";
  let badgeStatus = "";
  let avatarPath = "";

  try {
    const profile = await admin
      .from("profiles")
      .select("verified,avatar_url,email")
      .eq("id", userId)
      .maybeSingle();
    verified = profile.data?.verified === true;
    avatarPath = clean(profile.data?.avatar_url);
    profileEmail = clean(profile.data?.email).toLowerCase();
  } catch {}

  try {
    const userProfile = await admin
      .from("user_profile")
      .select("profile_photo_url,display_name,first_name,last_name,email")
      .eq("user_id", userId)
      .maybeSingle();
    avatarPath = clean(userProfile.data?.profile_photo_url) || avatarPath;
    const firstName = clean(userProfile.data?.first_name);
    const lastName = clean(userProfile.data?.last_name);
    displayName =
      clean(userProfile.data?.display_name) ||
      [firstName, lastName].filter(Boolean).join(" ").trim();
    profileEmail = clean(userProfile.data?.email).toLowerCase() || profileEmail;
  } catch {}

  try {
    const badge = await admin
      .from("user_verification_badges")
      .select("badge_type,status,awarded_at,created_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .is("removed_at", null)
      .order("awarded_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (badge.data) {
      verified = true;
      badgeType = clean(badge.data.badge_type);
      badgeStatus = clean(badge.data.status);
    }
  } catch {}

  let avatarUrl = avatarPath;
  if (avatarPath && !/^https?:\/\//i.test(avatarPath)) {
    const normalized = avatarPath.replace(/^\/+/, "");
    const candidates = normalized.startsWith("avatars/")
      ? [{ bucket: "avatars", path: normalized.slice(8) }]
      : normalized.startsWith("safety-gallery/")
        ? [
            {
              bucket: "safety-gallery",
              path: normalized.slice("safety-gallery/".length),
            },
          ]
        : [
            { bucket: "avatars", path: normalized },
            { bucket: "safety-gallery", path: normalized },
          ];

    avatarUrl = "";
    for (const candidate of candidates) {
      try {
        const signed = await admin.storage
          .from(candidate.bucket)
          .createSignedUrl(candidate.path, 60 * 60);
        if (!signed.error && clean(signed.data?.signedUrl)) {
          avatarUrl = clean(signed.data?.signedUrl);
          break;
        }
      } catch {}
    }
  }

  return {
    displayName,
    email: profileEmail,
    verified,
    badgeType,
    badgeStatus,
    avatarUrl,
  };
}

async function upsertNotification(
  admin: SupabaseClient,
  params: {
    userId: string;
    title: string;
    body: string;
    kind: string;
    dedupeKey: string;
    data: Record<string, unknown>;
  },
): Promise<string> {
  const result = await admin
    .from("notifications")
    .insert({
      user_id: params.userId,
      title: params.title,
      body: params.body,
      kind: params.kind,
      data: {
        ...params.data,
        persistent_in_app: true,
        dedupe_key: params.dedupeKey,
      },
      meta: {
        source: "visit_live_map",
        persistent_in_app: true,
        dedupe_key: params.dedupeKey,
        updated_at: new Date().toISOString(),
      },
    })
    .select("id")
    .single();

  if (result.error)
    throw new Error(`notification_failed:${result.error.message}`);
  return clean(result.data?.id);
}

async function sendPush(params: {
  userId: string;
  title: string;
  body: string;
  imageUrl: string;
  data: Record<string, unknown>;
}) {
  const supabaseUrl = clean(process.env.NEXT_PUBLIC_SUPABASE_URL).replace(
    /\/+$/g,
    "",
  );
  const secret = clean(process.env.INTERNAL_EVENT_SECRET);
  if (!supabaseUrl || !secret)
    return { ok: false, error: "push_not_configured" };

  const response = await fetch(
    `${supabaseUrl}/functions/v1/send_push_notification`,
    {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "x-internal-event-secret": secret,
      },
      body: JSON.stringify({
        user_id: params.userId,
        title: params.title,
        body: params.body,
        kind: "visit_safety_advisory",
        image_url: params.imageUrl,
        collapse_key: `visit_safety_advisory_${clean(params.data.advisory_id)}`,
        thread_id: `visit_${clean(params.data.session_id)}`,
        ttl_seconds: 86400,
        data_only_android: true,
        data: params.data,
      }),
    },
  );

  return response.json().catch(() => ({ ok: response.ok }));
}

async function sendEmail(params: {
  to: string;
  visitorName: string;
  senderName: string;
  message: string;
  place: string;
}) {
  const apiKey = clean(process.env.RESEND_API_KEY);
  const from = clean(process.env.RESEND_FROM);
  if (!apiKey || !from || !params.to.includes("@")) {
    return { ok: false, skipped: "email_not_configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: `Safety guidance from ${params.senderName}`,
      html: `
        <div style="margin:0;background:#f2f3f5;padding:28px 12px;font-family:Inter,Arial,sans-serif;color:#111;">
          <div style="max-width:620px;margin:0 auto;border-radius:30px;border:1px solid rgba(0,0,0,.08);background:rgba(255,255,255,.96);overflow:hidden;box-shadow:0 28px 80px rgba(0,0,0,.12);">
            <div style="padding:28px 24px 18px;text-align:center;background:linear-gradient(145deg,#fff,#f0f1f3);">
              <div style="font-size:11px;font-weight:950;letter-spacing:2.6px;">STAYKNOWN™</div>
              <div style="margin-top:14px;font-size:25px;font-weight:950;letter-spacing:-.5px;">Visit Safety Advisory</div>
              <div style="margin-top:8px;font-size:13px;line-height:1.6;color:#555;">${escapeHtml(params.senderName)} sent guidance about ${escapeHtml(params.visitorName)}’s active Visit.</div>
            </div>
            <div style="padding:22px 24px 26px;">
              <div style="border-radius:22px;background:#111;color:#fff;padding:20px;font-size:16px;font-weight:850;line-height:1.55;">${escapeHtml(params.message)}</div>
              ${params.place ? `<div style="margin-top:14px;border-radius:18px;background:#f4f5f6;padding:14px;font-size:12px;line-height:1.55;color:#3e4146;"><b>Location snapshot:</b> ${escapeHtml(params.place)}</div>` : ""}
              <div style="margin-top:16px;font-size:12px;line-height:1.65;color:#666;">Open StayKnown to choose <b>I’m leaving now</b> or <b>I’m safe</b>. This advisory does not replace emergency services.</div>
            </div>
          </div>
        </div>`,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, payload };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const access = accessFromUnknown(body);
    const verified = verifyLiveAccess(access);

    if (!verified.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "This signed live-map access is invalid or expired.",
          reason: verified.reason,
        },
        { status: 401 },
      );
    }

    if (verified.aud !== "contacts" || !verified.rid) {
      return NextResponse.json(
        {
          ok: false,
          error: "This map access cannot send Visit Safety Advisories.",
        },
        { status: 403 },
      );
    }

    const admin = createAdminClient();
    const context = await validateVisitAccess(admin, verified);
    const recipient = context.recipient;
    if (!recipient || context.legacyReadOnly) {
      return NextResponse.json(
        { ok: false, error: "Recipient-bound access is required." },
        { status: 403 },
      );
    }

    if (context.visit.ended_at) {
      return NextResponse.json(
        { ok: false, error: "This Visit has already ended." },
        { status: 409 },
      );
    }

    const consentId = clean((body as Record<string, unknown>).consent_id);
    if (!consentId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Accept the safety-use policy before sending guidance.",
        },
        { status: 403 },
      );
    }

    const consent = await admin
      .from("visit_map_access_consents")
      .select("id,decision,policy_version,created_at")
      .eq("id", consentId)
      .eq("visit_id", verified.sid)
      .eq("recipient_contact_id", recipient.id)
      .eq("decision", "accepted")
      .eq("policy_version", POLICY_VERSION)
      .maybeSingle();

    if (consent.error || !consent.data) {
      return NextResponse.json(
        { ok: false, error: "A valid recorded consent is required." },
        { status: 403 },
      );
    }

    const kind = clean(
      (body as Record<string, unknown>).message_kind,
    ).toLowerCase();
    const message = validateMessage(
      kind,
      clean((body as Record<string, unknown>).custom_message),
    );

    const existing = await admin
      .from("visit_safety_advisories")
      .select("id,status,created_at")
      .eq("visit_id", verified.sid)
      .eq("sender_contact_id", recipient.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!existing.error && existing.data) {
      if (["active", "leaving"].includes(clean(existing.data.status))) {
        return NextResponse.json(
          {
            ok: false,
            error: "You already have an active advisory for this Visit.",
            advisory_id: existing.data.id,
          },
          { status: 409 },
        );
      }

      const created = new Date(clean(existing.data.created_at));
      if (!Number.isNaN(created.getTime())) {
        const ageSeconds = Math.floor((Date.now() - created.getTime()) / 1000);
        if (ageSeconds < COOLDOWN_SECONDS) {
          return NextResponse.json(
            {
              ok: false,
              error: `Please wait ${COOLDOWN_SECONDS - ageSeconds} seconds before sending another advisory.`,
            },
            { status: 429 },
          );
        }
      }
    }

    const latest = await admin
      .from("visit_locations")
      .select("lat,lng,accuracy,place,created_at")
      .eq("session_id", verified.sid)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const senderUserId = await resolveStayKnownUserByEmail(
      admin,
      recipient.email,
    );
    const [senderIdentity, ownerIdentity] = await Promise.all([
      loadSenderIdentity(admin, senderUserId),
      loadSenderIdentity(admin, verified.uid),
    ]);
    const senderDisplayName = senderIdentity.displayName || recipient.name;
    const visitorName = ownerIdentity.displayName || "StayKnown user";

    const inserted = await admin
      .from("visit_safety_advisories")
      .insert({
        visit_id: verified.sid,
        owner_user_id: verified.uid,
        owner_name: visitorName,
        owner_verified: ownerIdentity.verified,
        owner_badge_type: ownerIdentity.badgeType || null,
        owner_badge_status: ownerIdentity.badgeStatus || null,
        owner_avatar_url: ownerIdentity.avatarUrl || null,
        sender_contact_id: recipient.id,
        sender_user_id: senderUserId || null,
        sender_name: senderDisplayName,
        sender_email: recipient.email,
        sender_verified: senderIdentity.verified,
        sender_badge_type: senderIdentity.badgeType || null,
        sender_badge_status: senderIdentity.badgeStatus || null,
        sender_avatar_url: senderIdentity.avatarUrl || null,
        consent_id: consentId,
        message_kind: kind,
        message_text: message,
        status: "active",
        location_lat:
          typeof latest.data?.lat === "number" ? latest.data.lat : null,
        location_lng:
          typeof latest.data?.lng === "number" ? latest.data.lng : null,
        location_accuracy:
          typeof latest.data?.accuracy === "number"
            ? latest.data.accuracy
            : null,
        location_place: clean(latest.data?.place) || null,
        location_recorded_at: clean(latest.data?.created_at) || null,
        delivery_meta: {
          source: "signed_live_map",
          policy_version: POLICY_VERSION,
          signed_access_version: verified.version,
        },
      })
      .select("*")
      .single();

    if (inserted.error) {
      if (inserted.error.code === "23505") {
        return NextResponse.json(
          { ok: false, error: "An advisory is already active." },
          { status: 409 },
        );
      }
      throw new Error(`advisory_insert_failed:${inserted.error.message}`);
    }

    const advisory = inserted.data as Record<string, unknown>;

    await admin.from("visit_safety_advisory_events").insert({
      advisory_id: advisory.id,
      visit_id: verified.sid,
      owner_user_id: verified.uid,
      actor_role: "contact",
      actor_user_id: senderUserId || null,
      actor_contact_id: recipient.id,
      event_type: "advisory_sent",
      message,
      ip_hash: requestIpHash(req) || null,
      user_agent: clean(req.headers.get("user-agent")) || null,
      metadata: { message_kind: kind, consent_id: consentId },
    });

    const ownerEmail = ownerIdentity.email;

    const notificationData: Record<string, unknown> = {
      source: "visit_live_map",
      event: "visit_safety_advisory_sent",
      audience: "visitor",
      advisory_id: advisory.id,
      visit_safety_advisory_id: advisory.id,
      session_id: verified.sid,
      visit_id: verified.sid,
      sender_contact_id: recipient.id,
      sender_user_id: senderUserId || "",
      sender_name: senderDisplayName,
      sender_email: recipient.email,
      sender_verified: senderIdentity.verified,
      sender_badge_type: senderIdentity.badgeType,
      sender_badge_status: senderIdentity.badgeStatus,
      sender_avatar_url: senderIdentity.avatarUrl,
      subject_user_id: senderUserId || "",
      subject_name: senderDisplayName,
      subject_verified: senderIdentity.verified,
      subject_badge_type: senderIdentity.badgeType,
      subject_badge_status: senderIdentity.badgeStatus,
      subject_avatar_url: senderIdentity.avatarUrl,
      advisory_message: message,
      message_kind: kind,
      place: clean(latest.data?.place),
      lat: latest.data?.lat ?? null,
      lng: latest.data?.lng ?? null,
      accuracy: latest.data?.accuracy ?? null,
      triggered_at: advisory.created_at,
      visit_advisory_leaving_label: "I’m leaving now",
      visit_advisory_safe_label: "I’m safe",
      stop_critical_sound: false,
      deep_link: `stayknown://visit-advisory/${advisory.id}`,
    };

    const notificationId = await upsertNotification(admin, {
      userId: verified.uid,
      title: `Safety guidance from ${senderDisplayName}`,
      body: message,
      kind: "visit_safety_advisory",
      dedupeKey: `visit_safety_advisory:${advisory.id}`,
      data: notificationData,
    });

    notificationData.notification_id = notificationId;

    const [pushResult, emailResult] = await Promise.all([
      sendPush({
        userId: verified.uid,
        title: `Safety guidance from ${senderDisplayName}`,
        body: message,
        imageUrl: senderIdentity.avatarUrl,
        data: notificationData,
      }),
      sendEmail({
        to: ownerEmail,
        visitorName,
        senderName: senderDisplayName,
        message,
        place: clean(latest.data?.place),
      }),
    ]);

    await admin
      .from("visit_safety_advisories")
      .update({
        delivery_meta: {
          source: "signed_live_map",
          policy_version: POLICY_VERSION,
          signed_access_version: verified.version,
          notification_id: notificationId,
          push: pushResult,
          email: emailResult,
        },
      })
      .eq("id", advisory.id);

    try {
      const timelineResult = await admin.from("safety_timeline_events").insert({
        user_id: verified.uid,
        event_type: "visit_safety_advisory_received",
        title: `Safety guidance from ${senderDisplayName}`,
        body: message,
        severity: "high",
        source: "visit_live_map",
        related_kind: "visit_safety_advisory",
        related_id: advisory.id,
        recipients_count: 1,
        meta: {
          advisory_id: advisory.id,
          visit_id: verified.sid,
          sender_name: senderDisplayName,
          sender_user_id: senderUserId || null,
          message_kind: kind,
          place: clean(latest.data?.place) || null,
        },
      });

      if (timelineResult.error) {
        console.warn(
          "[visit-advisory][timeline_insert_failed]",
          timelineResult.error.message,
        );
      }
    } catch (timelineError) {
      console.warn(
        "[visit-advisory][timeline_insert_exception]",
        timelineError,
      );
    }

    return NextResponse.json({
      ok: true,
      advisory: {
        id: advisory.id,
        message_kind: kind,
        message_text: message,
        status: "active",
        created_at: advisory.created_at,
      },
      delivery: {
        push: pushResult,
        email: emailResult,
        notification_id: notificationId,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "StayKnown could not send this safety guidance.";
    const status =
      message.includes("custom_message") || message.includes("unsupported")
        ? 400
        : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
