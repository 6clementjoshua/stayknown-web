import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Webhook } from "svix";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ResendEmailEventType =
  | "email.sent"
  | "email.delivered"
  | "email.delivery_delayed"
  | "email.failed"
  | "email.bounced"
  | "email.complained"
  | "email.opened"
  | "email.clicked"
  | "email.suppressed"
  | "email.received"
  | string;

type ResendWebhookPayload = {
  type?: ResendEmailEventType;
  created_at?: string;
  data?: {
    email_id?: string;
    created_at?: string;
    from?: string;
    to?: string[] | string;
    subject?: string;
    broadcast_id?: string;
    template_id?: string;
    tags?: Record<string, unknown>;
    click?: Record<string, unknown>;
    open?: Record<string, unknown>;
    bounce?: Record<string, unknown>;
    error?: string;
    reason?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

type DbMeta = Record<string, unknown>;

function clean(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function getSupabaseAdmin() {
  const supabaseUrl = clean(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
  const serviceRole = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!supabaseUrl || !serviceRole) {
    throw new Error("Missing Supabase server config.");
  }

  return createClient(supabaseUrl, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function getWebhookSecret() {
  return clean(
    process.env.RESEND_WEBHOOK_SECRET ||
      process.env.RESEND_WEBHOOK_SIGNING_SECRET,
  );
}

function normalizeEmail(v: unknown) {
  return clean(v).toLowerCase();
}

function firstRecipient(to: unknown) {
  if (Array.isArray(to)) {
    return normalizeEmail(to[0]);
  }

  return normalizeEmail(to);
}

function eventTime(payload: ResendWebhookPayload) {
  return (
    clean(payload.created_at) ||
    clean(payload.data?.created_at) ||
    new Date().toISOString()
  );
}

function getErrorMessage(payload: ResendWebhookPayload) {
  const data = payload.data || {};

  const directError = clean(data.error);
  if (directError) return directError;

  const directReason = clean(data.reason);
  if (directReason) return directReason;

  const bounce = data.bounce;

  if (bounce && typeof bounce === "object") {
    const bounceObj = bounce as Record<string, unknown>;

    return (
      clean(bounceObj.message) ||
      clean(bounceObj.reason) ||
      clean(bounceObj.type) ||
      ""
    );
  }

  return "";
}

function isFinalBadStatus(status: string) {
  return ["failed", "bounced", "complained", "suppressed"].includes(status);
}

function statusFromEvent(eventType: string, currentStatus: string) {
  const current = clean(currentStatus).toLowerCase();

  if (eventType === "email.sent") {
    if (
      [
        "delivered",
        "opened",
        "clicked",
        "failed",
        "bounced",
        "complained",
        "suppressed",
      ].includes(current)
    ) {
      return current;
    }

    return "sent";
  }

  if (eventType === "email.delivered") return "delivered";
  if (eventType === "email.opened") return "opened";
  if (eventType === "email.clicked") return "clicked";
  if (eventType === "email.delivery_delayed") return "delivery_delayed";
  if (eventType === "email.failed") return "failed";
  if (eventType === "email.bounced") return "bounced";
  if (eventType === "email.complained") return "complained";
  if (eventType === "email.suppressed") return "suppressed";

  return current || "sent";
}

function timestampColumnForEvent(eventType: string) {
  if (eventType === "email.delivered") return "delivered_at";
  if (eventType === "email.opened") return "opened_at";
  if (eventType === "email.clicked") return "clicked_at";
  if (eventType === "email.delivery_delayed") return "delivery_delayed_at";
  if (eventType === "email.failed") return "failed_at";
  if (eventType === "email.bounced") return "bounced_at";
  if (eventType === "email.complained") return "complained_at";
  if (eventType === "email.suppressed") return "suppressed_at";

  return "";
}

function mergeMeta(existing: unknown, patch: DbMeta) {
  const base =
    existing && typeof existing === "object" && !Array.isArray(existing)
      ? (existing as DbMeta)
      : {};

  return {
    ...base,
    ...patch,
  };
}

function statusSummary(rows: Array<{ status?: string | null }>) {
  const summary = {
    total: rows.length,
    sent_count: 0,
    delivered_count: 0,
    opened_count: 0,
    clicked_count: 0,
    delayed_count: 0,
    failed_count: 0,
    bounced_count: 0,
    complained_count: 0,
    suppressed_count: 0,
    skipped_count: 0,
    pending_count: 0,
  };

  for (const row of rows) {
    const status = clean(row.status).toLowerCase();

    if (status === "sent") summary.sent_count += 1;
    else if (status === "delivered") summary.delivered_count += 1;
    else if (status === "opened") {
      summary.opened_count += 1;
      summary.delivered_count += 1;
    } else if (status === "clicked") {
      summary.clicked_count += 1;
      summary.delivered_count += 1;
    } else if (status === "delivery_delayed") summary.delayed_count += 1;
    else if (status === "failed") summary.failed_count += 1;
    else if (status === "bounced") summary.bounced_count += 1;
    else if (status === "complained") summary.complained_count += 1;
    else if (status === "suppressed") summary.suppressed_count += 1;
    else if (status === "skipped") summary.skipped_count += 1;
    else summary.pending_count += 1;
  }

  return summary;
}

async function refreshCampaignSummary(
  admin: ReturnType<typeof getSupabaseAdmin>,
  campaignId: string,
) {
  if (!campaignId) return;

  const { data: recipients } = await admin
    .from("mail_console_campaign_recipients")
    .select("status")
    .eq("campaign_id", campaignId);

  const rows = Array.isArray(recipients) ? recipients : [];
  const summary = statusSummary(rows);

  const { data: campaignRow } = await admin
    .from("mail_console_campaigns")
    .select("meta,status")
    .eq("id", campaignId)
    .maybeSingle();

  const failedLike =
    summary.failed_count +
    summary.bounced_count +
    summary.complained_count +
    summary.suppressed_count;

  const positiveLike =
    summary.sent_count +
    summary.delivered_count +
    summary.opened_count +
    summary.clicked_count;

  const nextCampaignStatus =
    rows.length > 0 && positiveLike === 0 && failedLike > 0 ? "failed" : "sent";

  await admin
    .from("mail_console_campaigns")
    .update({
      status: nextCampaignStatus,
      meta: mergeMeta(campaignRow?.meta, {
        resend_webhook_summary: summary,
        last_resend_webhook_at: new Date().toISOString(),
      }),
    })
    .eq("id", campaignId);
}

async function safeStoreWebhookEvent(params: {
  admin: ReturnType<typeof getSupabaseAdmin>;
  svixId: string;
  eventType: string;
  emailId: string;
  recipientEmail: string;
  payload: ResendWebhookPayload;
}) {
  const { admin, svixId, eventType, emailId, recipientEmail, payload } = params;

  const { error } = await admin
    .from("mail_console_resend_webhook_events")
    .insert({
      resend_event_id: svixId,
      event_type: eventType,
      resend_email_id: emailId || null,
      recipient_email: recipientEmail || null,
      payload,
    });

  if (error) {
    if (error.code === "23505") {
      return {
        duplicate: true,
        error: null as string | null,
      };
    }

    return {
      duplicate: false,
      error: error.message,
    };
  }

  return {
    duplicate: false,
    error: null as string | null,
  };
}

export async function POST(req: NextRequest) {
  const webhookSecret = getWebhookSecret();

  if (!webhookSecret) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing RESEND_WEBHOOK_SECRET.",
      },
      { status: 500 },
    );
  }

  const payloadText = await req.text();

  const svixId = clean(req.headers.get("svix-id"));
  const svixTimestamp = clean(req.headers.get("svix-timestamp"));
  const svixSignature = clean(req.headers.get("svix-signature"));

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing Svix signature headers.",
      },
      { status: 400 },
    );
  }

  let event: ResendWebhookPayload;

  try {
    const wh = new Webhook(webhookSecret);

    event = wh.verify(payloadText, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ResendWebhookPayload;
  } catch (_) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid webhook signature.",
      },
      { status: 400 },
    );
  }

  const admin = getSupabaseAdmin();

  const eventType = clean(event.type);
  const eventAt = eventTime(event);
  const emailId = clean(event.data?.email_id);
  const recipientEmail = firstRecipient(event.data?.to);
  const errorMessage = getErrorMessage(event);

  if (!eventType) {
    return NextResponse.json(
      {
        ok: false,
        error: "Webhook event type missing.",
      },
      { status: 400 },
    );
  }

  const stored = await safeStoreWebhookEvent({
    admin,
    svixId,
    eventType,
    emailId,
    recipientEmail,
    payload: event,
  });

  if (stored.duplicate) {
    return NextResponse.json({
      ok: true,
      duplicate: true,
      ignored: true,
      event_id: svixId,
    });
  }

  if (stored.error) {
    return NextResponse.json(
      {
        ok: false,
        error: stored.error,
      },
      { status: 500 },
    );
  }

  if (!emailId) {
    return NextResponse.json({
      ok: true,
      matched: false,
      reason: "No email_id in webhook payload.",
      event_type: eventType,
    });
  }

  const { data: logRow } = await admin
    .from("mail_console_send_logs")
    .select("id,campaign_id,recipient_email,status,meta")
    .eq("resend_email_id", emailId)
    .maybeSingle();

  const { data: recipientRow } = await admin
    .from("mail_console_campaign_recipients")
    .select("id,campaign_id,email,status,meta")
    .eq("resend_email_id", emailId)
    .maybeSingle();

  const logId = logRow?.id ? String(logRow.id) : "";
  const campaignRecipientId = recipientRow?.id ? String(recipientRow.id) : "";
  const campaignId =
    clean(logRow?.campaign_id) || clean(recipientRow?.campaign_id) || "";

  await admin
    .from("mail_console_resend_webhook_events")
    .update({
      campaign_id: campaignId || null,
      send_log_id: logId || null,
      campaign_recipient_id: campaignRecipientId || null,
    })
    .eq("resend_event_id", svixId);

  if (!logRow && !recipientRow) {
    return NextResponse.json({
      ok: true,
      matched: false,
      reason: "No matching mail console row for resend_email_id.",
      resend_email_id: emailId,
      event_type: eventType,
    });
  }

  const logNextStatus = statusFromEvent(eventType, clean(logRow?.status));
  const recipientNextStatus = statusFromEvent(
    eventType,
    clean(recipientRow?.status),
  );

  const timeColumn = timestampColumnForEvent(eventType);

  if (logRow?.id) {
    const logUpdate: Record<string, unknown> = {
      status: logNextStatus,
      last_event_type: eventType,
      last_event_at: eventAt,
      last_resend_event_id: svixId,
      meta: mergeMeta(logRow.meta, {
        last_resend_webhook: {
          event_id: svixId,
          type: eventType,
          created_at: eventAt,
          resend_email_id: emailId,
          recipient_email: recipientEmail,
          payload: event,
        },
      }),
    };

    if (timeColumn) {
      logUpdate[timeColumn] = eventAt;
    }

    if (errorMessage || isFinalBadStatus(logNextStatus)) {
      logUpdate.error =
        errorMessage || `Resend webhook status: ${logNextStatus}`;
    }

    await admin
      .from("mail_console_send_logs")
      .update(logUpdate)
      .eq("id", logRow.id);
  }

  if (recipientRow?.id) {
    const recipientUpdate: Record<string, unknown> = {
      status: recipientNextStatus,
      last_event_type: eventType,
      last_event_at: eventAt,
      last_resend_event_id: svixId,
      meta: mergeMeta(recipientRow.meta, {
        last_resend_webhook: {
          event_id: svixId,
          type: eventType,
          created_at: eventAt,
          resend_email_id: emailId,
          recipient_email: recipientEmail,
          payload: event,
        },
      }),
    };

    if (timeColumn) {
      recipientUpdate[timeColumn] = eventAt;
    }

    if (errorMessage || isFinalBadStatus(recipientNextStatus)) {
      recipientUpdate.error =
        errorMessage || `Resend webhook status: ${recipientNextStatus}`;
    }

    await admin
      .from("mail_console_campaign_recipients")
      .update(recipientUpdate)
      .eq("id", recipientRow.id);
  }

  if (campaignId) {
    await refreshCampaignSummary(admin, campaignId);
  }

  return NextResponse.json({
    ok: true,
    matched: true,
    event_id: svixId,
    event_type: eventType,
    resend_email_id: emailId,
    campaign_id: campaignId || null,
    send_log_id: logId || null,
    campaign_recipient_id: campaignRecipientId || null,
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "mail-console Resend webhook",
  });
}
