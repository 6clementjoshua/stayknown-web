import { NextResponse } from "next/server";
import {
  accessFromUnknown,
  clean,
  createAdminClient,
  requestIpHash,
  resolveStayKnownUserByEmail,
  validateVisitAccess,
  verifyLiveAccess,
} from "../../../live/live-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const POLICY_VERSION = "visit-map-safety-use-v2-2026-07-17";

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

    const decision = clean(
      (body as Record<string, unknown>).decision,
    ).toLowerCase();
    if (decision !== "accepted" && decision !== "declined") {
      return NextResponse.json(
        { ok: false, error: "Choose accept or decline before continuing." },
        { status: 400 },
      );
    }

    const admin = createAdminClient();
    const context = await validateVisitAccess(admin, verified);
    const recipient = context.recipient;
    const ownerUserId = clean(context.visit.user_id) || verified.uid;
    const viewerUserId = recipient
      ? await resolveStayKnownUserByEmail(admin, recipient.email)
      : verified.aud === "self"
        ? ownerUserId
        : "";

    const insert = await admin
      .from("visit_map_access_consents")
      .insert({
        visit_id: verified.sid,
        owner_user_id: ownerUserId,
        recipient_contact_id: recipient?.id ?? null,
        viewer_user_id: viewerUserId || null,
        viewer_email: recipient?.email ?? null,
        viewer_name:
          recipient?.name ?? (verified.aud === "self" ? "Visit owner" : null),
        audience: verified.aud,
        decision,
        policy_version: POLICY_VERSION,
        signed_exp: verified.expNumber,
        signed_version: verified.version,
        ip_hash: requestIpHash(req) || null,
        user_agent: clean(req.headers.get("user-agent")) || null,
        metadata: {
          lawful_safety_use_confirmed: decision === "accepted",
          no_stalking_confirmed: decision === "accepted",
          no_harassment_confirmed: decision === "accepted",
          no_false_route_claims_confirmed: decision === "accepted",
          no_luring_or_coercion_confirmed: decision === "accepted",
          legacy_read_only: context.legacyReadOnly,
        },
      })
      .select("id,created_at")
      .single();

    if (insert.error) {
      throw new Error(`consent_record_failed:${insert.error.message}`);
    }

    return NextResponse.json({
      ok: true,
      decision,
      consent_id: decision === "accepted" ? insert.data.id : null,
      policy_version: POLICY_VERSION,
      can_send_advisory:
        decision === "accepted" &&
        verified.aud === "contacts" &&
        Boolean(recipient) &&
        !context.legacyReadOnly &&
        !context.visit.ended_at,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "StayKnown could not record this consent decision.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
