// app/api/missed-im-safe-response/act/route.ts

import crypto from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ResponseChoice = "will_check" | "reached_them" | "could_not_reach";
type JsonMap = Record<string, unknown>;

type NetworkCheckResult = {
  checked: boolean;
  blocked: boolean;
  provider: "ip-api" | "local_or_private" | "lookup_failed";
  reasons: string[];
  raw?: JsonMap;
};

type PublicPerson = {
  id?: string;
  name: string;
  verified: boolean;
  username?: string | null;
};

type OccurrenceLite = {
  id: string;
  user_id?: string;
  checkin_period?: string;
  local_checkin_date?: string;
  timezone_name?: string;
  expected_at?: string;
  due_at?: string;
  status?: string;
  contact_missed_alert_sent_at?: string;
  delivery_meta?: JsonMap;
};

type ResponseRow = {
  id: string;
  response: ResponseChoice;
  created_at?: string;
  meta?: JsonMap;
};

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
  "Surrogate-Control": "no-store",
};

function json(body: JsonMap, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...NO_STORE_HEADERS,
      ...(init?.headers || {}),
    },
  });
}

function admin() {
  const url = clean(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
  const serviceRole = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!url || !serviceRole) {
    throw new Error("Missed I’M SAFE response is not fully configured yet.");
  }

  return createClient(url, serviceRole, {
    auth: { persistSession: false },
  });
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function cleanEmail(value: unknown): string {
  return clean(value).toLowerCase();
}

function asMap(value: unknown): JsonMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as JsonMap;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asResponse(value: string): ResponseChoice | null {
  const normalized = value.trim().toLowerCase();
  if (normalized === "will_check") return "will_check";
  if (normalized === "reached_them") return "reached_them";
  if (normalized === "could_not_reach") return "could_not_reach";
  return null;
}

function responseLabel(response: ResponseChoice): string {
  switch (response) {
    case "will_check":
      return "I will check on them";
    case "reached_them":
      return "I reached them";
    case "could_not_reach":
      return "Could not reach them";
  }
}

function periodLabel(value: unknown): string {
  return clean(value).toLowerCase() === "night" ? "night" : "morning";
}

function titleForOwner(contactName: string, response: ResponseChoice): string {
  const who = contactName || "A trusted contact";

  switch (response) {
    case "will_check":
      return `${who} will check on you`;
    case "reached_them":
      return `${who} says they reached you`;
    case "could_not_reach":
      return `${who} could not reach you`;
  }
}

function bodyForOwner(
  contactName: string,
  response: ResponseChoice,
  period: string,
): string {
  const who = contactName || "A trusted contact";
  const slot = periodLabel(period);

  switch (response) {
    case "will_check":
      return `${who} responded to your missed ${slot} I’M SAFE notice and said they will personally check on you.`;
    case "reached_them":
      return `${who} responded that they reached you after your missed ${slot} I’M SAFE notice. This is a reassuring report, not independent proof of safety.`;
    case "could_not_reach":
      return `${who} reported that they could not reach you after your missed ${slot} I’M SAFE notice. Open StayKnown and contact them as soon as it is safe.`;
  }
}

function alreadyRecordedMessage(
  recordedResponse: ResponseChoice,
  subjectName: string,
): string {
  const subject = subjectName || "the StayKnown member";

  return (
    `You already recorded: “${responseLabel(recordedResponse)}.”\n\n` +
    "This missed I’M SAFE response has already been received. " +
    `If the situation has changed, continue checking on ${subject} directly. ` +
    "If there may be immediate danger, follow local emergency procedures."
  );
}

function signatureMessage(params: {
  uid: string;
  contact: string;
  contactName: string;
  subjectName: string;
  response: ResponseChoice;
  expected: string;
  due: string;
  sent: string;
  exp: number;
}): string {
  return [
    `uid=${params.uid}`,
    `contact=${params.contact}`,
    `contact_name=${params.contactName}`,
    `subject_name=${params.subjectName}`,
    `response=${params.response}`,
    `expected=${params.expected}`,
    `due=${params.due}`,
    `sent=${params.sent}`,
    `exp=${params.exp}`,
  ].join("&");
}

function safeEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function verifySignature(params: {
  uid: string;
  contact: string;
  contactName: string;
  subjectName: string;
  response: ResponseChoice;
  expected: string;
  due: string;
  sent: string;
  exp: number;
  sig: string;
}) {
  const secret = clean(process.env.MISSED_SAFE_RESPONSE_SIGNING_SECRET);
  if (!secret) return { ok: false, reason: "missing_secret" as const };

  if (!Number.isFinite(params.exp)) {
    return { ok: false, reason: "bad_exp" as const };
  }

  if (params.exp < Math.floor(Date.now() / 1000)) {
    return { ok: false, reason: "expired" as const };
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(signatureMessage(params))
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  if (!safeEqual(expectedSignature, params.sig)) {
    return { ok: false, reason: "bad_signature" as const };
  }

  return { ok: true as const };
}

function toIsoOrNull(value: string): string | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function firstHeader(req: Request, names: string[]): string {
  for (const name of names) {
    const value = clean(req.headers.get(name));
    if (value) return value;
  }
  return "";
}

function extractClientIp(req: Request): string {
  const forwarded = firstHeader(req, [
    "cf-connecting-ip",
    "x-real-ip",
    "x-forwarded-for",
    "x-client-ip",
    "true-client-ip",
  ]);

  return (
    forwarded
      .split(",")
      .map((part) => part.trim())
      .find(Boolean) || ""
  );
}

function isLocalOrPrivateIp(ip: string): boolean {
  const value = ip.trim().toLowerCase();
  if (!value || value === "::1" || value === "127.0.0.1") return true;
  if (value.startsWith("10.") || value.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(value)) return true;
  return (
    value.startsWith("fc") ||
    value.startsWith("fd") ||
    value.startsWith("fe80:")
  );
}

function boolOf(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

function looksLikeKnownMobileCarrier(data: JsonMap): boolean {
  if (boolOf(data.mobile)) return true;

  const combined =
    `${data.isp || ""} ${data.org || ""} ${data.as || ""}`.toLowerCase();
  return [
    "mtn",
    "airtel",
    "glo",
    "globacom",
    "9mobile",
    "etisalat",
    "vodafone",
    "orange",
    "telecom",
    "mobile",
    "wireless",
    "cellular",
  ].some((token) => combined.includes(token));
}

async function checkMaskedNetwork(ip: string): Promise<NetworkCheckResult> {
  if (isLocalOrPrivateIp(ip)) {
    return {
      checked: false,
      blocked: false,
      provider: "local_or_private",
      reasons: [],
    };
  }

  try {
    const url =
      `http://ip-api.com/json/${encodeURIComponent(ip)}` +
      "?fields=status,message,countryCode,region,city,isp,org,as,proxy,hosting,mobile,query" +
      `&_=${Date.now()}`;

    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: { "Cache-Control": "no-store", Pragma: "no-cache" },
    });

    const data = asMap(await response.json().catch(() => ({})));
    if (!response.ok || data.status !== "success") {
      return {
        checked: true,
        blocked: false,
        provider: "lookup_failed",
        reasons: [],
        raw: { status: response.status, message: data.message },
      };
    }

    const proxy = boolOf(data.proxy);
    const hosting = boolOf(data.hosting);
    const mobileCarrier = looksLikeKnownMobileCarrier(data);
    const reasons: string[] = [];

    if (proxy) reasons.push("proxy");
    if (hosting && !mobileCarrier) reasons.push("hosting");

    return {
      checked: true,
      blocked: reasons.length > 0,
      provider: "ip-api",
      reasons,
      raw: {
        countryCode: data.countryCode,
        region: data.region,
        city: data.city,
        isp: data.isp,
        org: data.org,
        as: data.as,
        proxy: data.proxy,
        hosting: data.hosting,
        mobile: data.mobile,
        query: data.query,
        mobileCarrierHeuristic: mobileCarrier,
      },
    };
  } catch (error) {
    return {
      checked: true,
      blocked: false,
      provider: "lookup_failed",
      reasons: [],
      raw: { error: error instanceof Error ? error.message : String(error) },
    };
  }
}

function decodeHeaderPart(value: string): string {
  const cleaned = value.trim();
  if (!cleaned) return "";
  try {
    return decodeURIComponent(cleaned);
  } catch {
    return cleaned;
  }
}

function coarseLocationFromHeaders(req: Request) {
  const city = decodeHeaderPart(
    firstHeader(req, ["x-vercel-ip-city", "cf-ipcity"]),
  );
  const region = decodeHeaderPart(
    firstHeader(req, ["x-vercel-ip-country-region", "cf-region-code"]),
  );
  const country = decodeHeaderPart(
    firstHeader(req, ["x-vercel-ip-country", "cf-ipcountry"]),
  );

  return {
    city,
    region,
    country,
    summary: [city, region, country].filter(Boolean).join(", "),
  };
}

function profileName(profile: JsonMap, fallback: string): string {
  const firstName = clean(profile.first_name);
  const lastName = clean(profile.last_name);
  const fullName = `${firstName} ${lastName}`.trim();
  return (
    clean(profile.display_name) ||
    fullName ||
    clean(profile.nickname) ||
    fallback
  );
}

async function loadSubjectProfile(
  sb: ReturnType<typeof admin>,
  uid: string,
): Promise<PublicPerson> {
  const { data } = await sb
    .from("profiles")
    .select("id,display_name,nickname,first_name,last_name,username,verified")
    .eq("id", uid)
    .maybeSingle();

  const profile = asMap(data);
  return {
    id: clean(profile.id) || uid,
    name: profileName(profile, "StayKnown member"),
    verified: profile.verified === true,
    username: clean(profile.username) || null,
  };
}

async function loadContactProfile(
  sb: ReturnType<typeof admin>,
  email: string,
  fallbackName: string,
): Promise<PublicPerson> {
  let profile: JsonMap = {};

  try {
    const { data } = await sb.rpc("find_profile_by_auth_email", {
      p_email: email,
    });

    if (Array.isArray(data)) {
      profile = asMap(data[0]);
    } else {
      profile = asMap(data);
    }
  } catch {
    // Fallback below supports projects where the helper RPC is unavailable.
  }

  if (!clean(profile.id)) {
    try {
      const { data } = await sb
        .from("profiles")
        .select(
          "id,display_name,nickname,first_name,last_name,username,email,verified",
        )
        .eq("email", email)
        .maybeSingle();
      profile = asMap(data);
    } catch {
      profile = {};
    }
  }

  return {
    id: clean(profile.id) || undefined,
    name: profileName(profile, fallbackName || "Trusted contact"),
    verified: profile.verified === true,
    username: clean(profile.username) || null,
  };
}

async function findOccurrence(params: {
  sb: ReturnType<typeof admin>;
  uid: string;
  dueIso: string;
  expectedIso: string;
}): Promise<OccurrenceLite | null> {
  const columns =
    "id,user_id,checkin_period,local_checkin_date,timezone_name,expected_at,due_at,status,contact_missed_alert_sent_at,delivery_meta";

  const byDue = await params.sb
    .from("daily_safety_checkin_occurrences")
    .select(columns)
    .eq("user_id", params.uid)
    .eq("due_at", params.dueIso)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (byDue.error) throw byDue.error;
  if (byDue.data) return byDue.data as OccurrenceLite;

  const byExpected = await params.sb
    .from("daily_safety_checkin_occurrences")
    .select(columns)
    .eq("user_id", params.uid)
    .eq("expected_at", params.expectedIso)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (byExpected.error) throw byExpected.error;
  return (byExpected.data as OccurrenceLite | null) ?? null;
}

async function findExistingResponse(params: {
  sb: ReturnType<typeof admin>;
  uid: string;
  contact: string;
  dueIso: string;
}): Promise<ResponseRow | null> {
  const { data, error } = await params.sb
    .from("missed_im_safe_contact_responses")
    .select("id,response,created_at,meta")
    .eq("user_id", params.uid)
    .eq("contact_email", params.contact)
    .eq("due_at", params.dueIso)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as ResponseRow | null) ?? null;
}

async function insertOrLoadResponse(params: {
  sb: ReturnType<typeof admin>;
  uid: string;
  contact: string;
  contactName: string;
  subjectName: string;
  response: ResponseChoice;
  expectedIso: string;
  dueIso: string;
  sentIso: string;
  occurrence: OccurrenceLite | null;
  actorIp: string;
  actorUserAgent: string;
  actorGeo: ReturnType<typeof coarseLocationFromHeaders>;
  networkCheck: NetworkCheckResult;
}): Promise<{ row: ResponseRow; alreadyRecorded: boolean }> {
  const existing = await findExistingResponse(params);
  if (existing) return { row: existing, alreadyRecorded: true };

  const occurrenceId = clean(params.occurrence?.id);
  const checkinPeriod = periodLabel(params.occurrence?.checkin_period);
  const nowIso = new Date().toISOString();

  const meta: JsonMap = {
    response_label: responseLabel(params.response),
    subject_name: params.subjectName,
    occurrence_id: occurrenceId || null,
    checkin_period: checkinPeriod,
    local_checkin_date: clean(params.occurrence?.local_checkin_date) || null,
    timezone_name: clean(params.occurrence?.timezone_name) || null,
    actor_location: params.actorGeo.summary || null,
    one_time_response: true,
    one_response_per_notice: true,
    recorded_at: nowIso,
    network_check: {
      checked: params.networkCheck.checked,
      provider: params.networkCheck.provider,
      blocked: params.networkCheck.blocked,
      reasons: params.networkCheck.reasons,
      raw: params.networkCheck.raw ?? null,
    },
  };

  const { data, error } = await params.sb
    .from("missed_im_safe_contact_responses")
    .insert({
      user_id: params.uid,
      contact_email: params.contact,
      contact_name: params.contactName || null,
      response: params.response,
      missed_alert_sent_at: params.sentIso,
      expected_at: params.expectedIso,
      due_at: params.dueIso,
      actor_ip: params.actorIp || null,
      actor_user_agent: params.actorUserAgent || null,
      actor_country: params.actorGeo.country || null,
      actor_region: params.actorGeo.region || null,
      actor_city: params.actorGeo.city || null,
      meta,
    })
    .select("id,response,created_at,meta")
    .single();

  if (!error && data) {
    return { row: data as ResponseRow, alreadyRecorded: false };
  }

  const code = clean((error as { code?: string } | null)?.code);
  if (code === "23505") {
    const raced = await findExistingResponse(params);
    if (raced) return { row: raced, alreadyRecorded: true };
  }

  throw error || new Error("The safety response could not be stored.");
}

function responseEventPayload(params: {
  responseRow: ResponseRow;
  occurrence: OccurrenceLite | null;
  uid: string;
  subject: PublicPerson;
  contact: PublicPerson;
  contactEmail: string;
  expectedIso: string;
  dueIso: string;
  sentIso: string;
  actorGeo: ReturnType<typeof coarseLocationFromHeaders>;
}) {
  const response = params.responseRow.response;
  const occurrenceId = clean(params.occurrence?.id);
  const period = periodLabel(params.occurrence?.checkin_period);
  const responseAt =
    clean(params.responseRow.created_at) || new Date().toISOString();

  return {
    kind: "im_safe_contact_response",
    event_type: "contact_response_received",
    response,
    response_label: responseLabel(response),
    response_id: params.responseRow.id,
    response_at: responseAt,
    occurrence_id: occurrenceId || null,
    checkin_period: period,
    local_checkin_date: clean(params.occurrence?.local_checkin_date) || null,
    timezone_name: clean(params.occurrence?.timezone_name) || null,
    expected_at: params.expectedIso,
    due_at: params.dueIso,
    missed_alert_sent_at: params.sentIso,
    subject_user_id: params.uid,
    subject_name: params.subject.name,
    subject_verified: params.subject.verified,
    subject_username: params.subject.username || null,
    contact_user_id: params.contact.id || null,
    contact_name: params.contact.name,
    contact_verified: params.contact.verified,
    contact_username: params.contact.username || null,
    contact_email: params.contactEmail,
    actor_location: params.actorGeo.summary || null,
    source: "missed_im_safe_response",
    deep_link: occurrenceId
      ? `stayknown://safety/missed-im-safe?occurrence_id=${encodeURIComponent(occurrenceId)}`
      : "stayknown://notifications",
  };
}

async function ensureTimeline(params: {
  sb: ReturnType<typeof admin>;
  uid: string;
  responseRow: ResponseRow;
  payload: ReturnType<typeof responseEventPayload>;
}) {
  const relatedKind = "missed_im_safe_contact_response";
  const relatedId = params.responseRow.id;

  const { data: existing, error: findError } = await params.sb
    .from("safety_timeline_events")
    .select("id")
    .eq("user_id", params.uid)
    .eq("related_kind", relatedKind)
    .eq("related_id", relatedId)
    .limit(1)
    .maybeSingle();

  if (findError) throw findError;
  if (existing) return clean((existing as JsonMap).id);

  const title = `${params.payload.contact_name} responded: ${params.payload.response_label}`;
  const body = bodyForOwner(
    params.payload.contact_name,
    params.responseRow.response,
    params.payload.checkin_period,
  );

  const { data, error } = await params.sb
    .from("safety_timeline_events")
    .insert({
      user_id: params.uid,
      event_type: "contact_response_received",
      title,
      body,
      severity:
        params.responseRow.response === "could_not_reach" ? "warning" : "info",
      source: "missed_im_safe_response",
      related_kind: relatedKind,
      related_id: relatedId,
      actor_user_id: params.payload.contact_user_id || null,
      actor_name: params.payload.contact_name || null,
      actor_email: params.payload.contact_email || null,
      recipients_count: 1,
      meta: params.payload,
    })
    .select("id")
    .single();

  if (error) throw error;
  return clean((data as JsonMap)?.id);
}

async function ensureNotification(params: {
  sb: ReturnType<typeof admin>;
  uid: string;
  responseRow: ResponseRow;
  payload: ReturnType<typeof responseEventPayload>;
}) {
  const title = titleForOwner(
    params.payload.contact_name,
    params.responseRow.response,
  );
  const body = bodyForOwner(
    params.payload.contact_name,
    params.responseRow.response,
    params.payload.checkin_period,
  );
  const dedupeKey = `im_safe_contact_response:${params.responseRow.id}`;

  const { data, error } = await params.sb
    .from("notifications")
    .upsert(
      {
        user_id: params.uid,
        kind: "im_safe_contact_response",
        title,
        body,
        data: params.payload,
        meta: params.payload,
        dedupe_key: dedupeKey,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,dedupe_key" },
    )
    .select("id,title,body")
    .single();

  if (error) throw error;

  return {
    id: clean((data as JsonMap)?.id),
    title: clean((data as JsonMap)?.title) || title,
    body: clean((data as JsonMap)?.body) || body,
  };
}

async function ensureOccurrenceResponse(params: {
  sb: ReturnType<typeof admin>;
  occurrence: OccurrenceLite | null;
  responseRow: ResponseRow;
  payload: ReturnType<typeof responseEventPayload>;
}) {
  if (!params.occurrence?.id) return;

  const deliveryMeta = asMap(params.occurrence.delivery_meta);
  const previousResponses = asArray(deliveryMeta.contact_responses)
    .map(asMap)
    .filter((entry) => clean(entry.response_id) !== params.responseRow.id);

  previousResponses.push({
    response_id: params.responseRow.id,
    response: params.responseRow.response,
    response_label: responseLabel(params.responseRow.response),
    response_at: params.payload.response_at,
    contact_name: params.payload.contact_name,
    contact_user_id: params.payload.contact_user_id,
    contact_verified: params.payload.contact_verified,
  });

  const { error } = await params.sb
    .from("daily_safety_checkin_occurrences")
    .update({
      delivery_meta: {
        ...deliveryMeta,
        contact_responses: previousResponses,
        contact_response_count: previousResponses.length,
        latest_contact_response:
          previousResponses[previousResponses.length - 1],
        latest_contact_response_at: params.payload.response_at,
      },
    })
    .eq("id", params.occurrence.id)
    .eq("user_id", params.payload.subject_user_id);

  if (error) throw error;
}

async function sendOwnerPush(params: {
  sb: ReturnType<typeof admin>;
  uid: string;
  responseRow: ResponseRow;
  notification: { id: string; title: string; body: string };
  payload: ReturnType<typeof responseEventPayload>;
}) {
  const responseMeta = asMap(params.responseRow.meta);
  if (clean(responseMeta.owner_push_sent_at))
    return responseMeta.owner_push_result;

  const supabaseUrl = clean(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  ).replace(/\/+$/g, "");
  const serviceRole = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const internalSecret = clean(process.env.INTERNAL_EVENT_SECRET);

  if (!supabaseUrl || !serviceRole) return null;

  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/send_push_notification`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceRole}`,
          apikey: serviceRole,
          "Content-Type": "application/json",
          ...(internalSecret
            ? { "x-internal-event-secret": internalSecret }
            : {}),
        },
        body: JSON.stringify({
          user_id: params.uid,
          notification_id: params.notification.id,
          title: params.notification.title,
          body: params.notification.body,
          kind: "im_safe_contact_response",
          collapse_key: `im_safe_contact_response:${params.responseRow.id}`,
          thread_id:
            clean(params.payload.occurrence_id) || params.responseRow.id,
          ttl_seconds: 172800,
          data: {
            ...params.payload,
            notification_id: params.notification.id,
          },
        }),
      },
    );

    const result = asMap(await response.json().catch(() => ({})));
    const patch = {
      ...responseMeta,
      owner_push_sent_at: response.ok ? new Date().toISOString() : null,
      owner_push_result: {
        ok: response.ok,
        status: response.status,
        ...result,
      },
    };

    await params.sb
      .from("missed_im_safe_contact_responses")
      .update({ meta: patch })
      .eq("id", params.responseRow.id);

    params.responseRow.meta = patch;
    return patch.owner_push_result;
  } catch (error) {
    const failure = {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };

    await params.sb
      .from("missed_im_safe_contact_responses")
      .update({
        meta: {
          ...responseMeta,
          owner_push_result: failure,
        },
      })
      .eq("id", params.responseRow.id);

    return failure;
  }
}

async function ensureSideEffects(params: {
  sb: ReturnType<typeof admin>;
  uid: string;
  responseRow: ResponseRow;
  occurrence: OccurrenceLite | null;
  payload: ReturnType<typeof responseEventPayload>;
}) {
  const timelineId = await ensureTimeline(params);
  const notification = await ensureNotification(params);
  await ensureOccurrenceResponse(params);
  const pushResult = await sendOwnerPush({
    ...params,
    notification,
  });

  return {
    timeline_id: timelineId,
    notification_id: notification.id,
    push: pushResult,
  };
}

export async function POST(req: Request) {
  try {
    const body = asMap(await req.json().catch(() => ({})));

    const uid = clean(body.uid);
    const contact = cleanEmail(body.contact);
    const signedContactName = clean(body.contact_name);
    const signedSubjectName = clean(body.subject_name);
    const response = asResponse(clean(body.response));
    const expected = clean(body.expected);
    const due = clean(body.due);
    const sent = clean(body.sent);
    const exp = Number(body.exp);
    const sig = clean(body.sig);

    if (
      !uid ||
      !contact ||
      !response ||
      !expected ||
      !due ||
      !sent ||
      !Number.isFinite(exp) ||
      !sig
    ) {
      return json(
        {
          ok: false,
          state: "invalid",
          message: "This response link is incomplete or invalid.",
        },
        { status: 400 },
      );
    }

    const verified = verifySignature({
      uid,
      contact,
      contactName: signedContactName,
      subjectName: signedSubjectName,
      response,
      expected,
      due,
      sent,
      exp,
      sig,
    });

    if (!verified.ok) {
      const expired = verified.reason === "expired";
      return json(
        {
          ok: false,
          state: expired ? "expired" : "invalid",
          message: expired
            ? "This response link expired for security reasons."
            : "This response link is invalid or can no longer be trusted.",
        },
        { status: expired ? 410 : 400 },
      );
    }

    const expectedIso = toIsoOrNull(expected);
    const dueIso = toIsoOrNull(due);
    const sentIso = toIsoOrNull(sent);

    if (!expectedIso || !dueIso || !sentIso) {
      return json(
        {
          ok: false,
          state: "invalid",
          message: "This response link contains invalid safety timing data.",
        },
        { status: 400 },
      );
    }

    const actorIp = extractClientIp(req);
    const actorGeo = coarseLocationFromHeaders(req);
    const actorUserAgent = clean(req.headers.get("user-agent"));
    const networkCheck = await checkMaskedNetwork(actorIp);

    if (networkCheck.blocked) {
      return json(
        {
          ok: false,
          state: "vpn_blocked",
          message:
            "StayKnown could not record this safety response because your connection appears to use a VPN, proxy, relay, or hosted/masked network. Turn it off and try again so the safety record is not misleading.",
          network_check: {
            checked: networkCheck.checked,
            provider: networkCheck.provider,
            reasons: networkCheck.reasons,
          },
        },
        { status: 403 },
      );
    }

    const sb = admin();
    const [subject, contactPerson, occurrence] = await Promise.all([
      loadSubjectProfile(sb, uid),
      loadContactProfile(sb, contact, signedContactName || contact),
      findOccurrence({ sb, uid, dueIso, expectedIso }),
    ]);

    const subjectName = subject.name || signedSubjectName || "StayKnown member";
    const contactName =
      contactPerson.name || signedContactName || "A trusted contact";

    const stored = await insertOrLoadResponse({
      sb,
      uid,
      contact,
      contactName,
      subjectName,
      response,
      expectedIso,
      dueIso,
      sentIso,
      occurrence,
      actorIp,
      actorUserAgent,
      actorGeo,
      networkCheck,
    });

    const payload = responseEventPayload({
      responseRow: stored.row,
      occurrence,
      uid,
      subject,
      contact: { ...contactPerson, name: contactName },
      contactEmail: contact,
      expectedIso,
      dueIso,
      sentIso,
      actorGeo,
    });

    const delivery = await ensureSideEffects({
      sb,
      uid,
      responseRow: stored.row,
      occurrence,
      payload,
    });

    if (stored.alreadyRecorded) {
      return json({
        ok: true,
        state: "already_recorded",
        title: "Response already recorded",
        message: alreadyRecordedMessage(stored.row.response, subjectName),
        subject,
        contact: { ...contactPerson, name: contactName },
        occurrence_id: clean(occurrence?.id) || null,
        delivery,
      });
    }

    const message =
      response === "will_check"
        ? `Thank you. StayKnown recorded that you will check on ${subjectName}.`
        : response === "reached_them"
          ? `Thank you. StayKnown recorded that you reached ${subjectName}.`
          : `StayKnown recorded that you could not reach ${subjectName}.`;

    return json({
      ok: true,
      state: "recorded",
      title: `${contactName} responded: ${responseLabel(response)}`,
      message,
      subject,
      contact: { ...contactPerson, name: contactName },
      occurrence_id: clean(occurrence?.id) || null,
      checkin_period: periodLabel(occurrence?.checkin_period),
      delivery,
    });
  } catch (error) {
    console.error("MISSED_IM_SAFE_RESPONSE_ERROR", error);

    return json(
      {
        ok: false,
        state: "error",
        message:
          error instanceof Error
            ? error.message
            : "This response could not be recorded right now.",
      },
      { status: 500 },
    );
  }
}
