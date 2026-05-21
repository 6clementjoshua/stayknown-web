// app/api/missed-im-safe-response/act/route.ts
import crypto from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ResponseChoice = "will_check" | "reached_them" | "could_not_reach";

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error("Missed I’M SAFE response is not fully configured yet.");
  }

  return createClient(url, serviceRole, {
    auth: { persistSession: false },
  });
}

function clean(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function asResponse(v: string): ResponseChoice | null {
  const s = v.trim().toLowerCase();
  if (s === "will_check") return "will_check";
  if (s === "reached_them") return "reached_them";
  if (s === "could_not_reach") return "could_not_reach";
  return null;
}

function responseLabel(response: ResponseChoice) {
  switch (response) {
    case "will_check":
      return "I will check on them";
    case "reached_them":
      return "I reached them";
    case "could_not_reach":
      return "Could not reach them";
  }
}

function alreadyRecordedMessage(
  recordedResponse: ResponseChoice,
  subjectName: string,
) {
  const subject = subjectName.trim() || "the StayKnown member";

  return (
    `You already recorded: “${responseLabel(recordedResponse)}.”\n\n` +
    "This missed I’M SAFE response has already been received. " +
    `If the situation has changed, continue checking on ${subject} directly. ` +
    "If there may be immediate danger, follow local emergency procedures."
  );
}

function timelineTitle(contactName: string, response: ResponseChoice) {
  const who = contactName.trim() || "A contact";
  return `${who} has tapped “${responseLabel(response)}”`;
}

function timelineBody(contactName: string, subjectName: string) {
  const who = contactName.trim() || "A contact";
  const subject = subjectName.trim() || "the StayKnown user";
  return `${who} responded to the missed I’M SAFE notice for ${subject}.`;
}

function signatureMessage(p: {
  uid: string;
  contact: string;
  contactName: string;
  subjectName: string;
  response: ResponseChoice;
  expected: string;
  due: string;
  sent: string;
  exp: number;
}) {
  return [
    `uid=${p.uid}`,
    `contact=${p.contact}`,
    `contact_name=${p.contactName}`,
    `subject_name=${p.subjectName}`,
    `response=${p.response}`,
    `expected=${p.expected}`,
    `due=${p.due}`,
    `sent=${p.sent}`,
    `exp=${p.exp}`,
  ].join("&");
}

function safeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);

  if (aBuf.length !== bBuf.length) return false;

  return crypto.timingSafeEqual(aBuf, bBuf);
}

function verifySignature(p: {
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
  const secret = (process.env.MISSED_SAFE_RESPONSE_SIGNING_SECRET || "").trim();

  if (!secret) return { ok: false, reason: "missing_secret" as const };

  const now = Math.floor(Date.now() / 1000);

  if (!Number.isFinite(p.exp)) {
    return { ok: false, reason: "bad_exp" as const };
  }

  if (p.exp < now) {
    return { ok: false, reason: "expired" as const };
  }

  const message = signatureMessage(p);

  const expected = crypto
    .createHmac("sha256", secret)
    .update(message)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  if (!safeEqual(expected, p.sig)) {
    return { ok: false, reason: "bad_signature" as const };
  }

  return { ok: true as const };
}

function toIsoOrNull(v: string) {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function firstHeader(req: Request, names: string[]) {
  for (const name of names) {
    const v = (req.headers.get(name) || "").trim();
    if (v) return v;
  }
  return "";
}

function extractClientIp(req: Request) {
  const forwarded = firstHeader(req, [
    "x-forwarded-for",
    "cf-connecting-ip",
    "x-real-ip",
  ]);

  if (!forwarded) return "";
  return forwarded.split(",")[0]?.trim() || "";
}

function coarseLocationFromHeaders(req: Request) {
  const city = firstHeader(req, ["x-vercel-ip-city", "cf-ipcity"]);
  const region = firstHeader(req, [
    "x-vercel-ip-country-region",
    "cf-region-code",
  ]);
  const country = firstHeader(req, ["x-vercel-ip-country", "cf-ipcountry"]);

  return {
    city,
    region,
    country,
    summary: [city, region, country].filter(Boolean).join(", "),
  };
}

async function findExistingResponse(p: {
  sb: ReturnType<typeof admin>;
  uid: string;
  contact: string;
  dueIso: string | null;
}) {
  let query = p.sb
    .from("missed_im_safe_contact_responses")
    .select("id,response,created_at")
    .eq("user_id", p.uid)
    .eq("contact_email", p.contact)
    .order("created_at", { ascending: true })
    .limit(1);

  if (p.dueIso) {
    query = query.eq("due_at", p.dueIso);
  } else {
    query = query.is("due_at", null);
  }

  const { data, error } = await query.maybeSingle();

  if (error) throw error;

  return data;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const uid = clean(body.uid);
    const contact = clean(body.contact).toLowerCase();
    const contactName = clean(body.contact_name);
    const subjectName = clean(body.subject_name) || "StayKnown member";
    const response = asResponse(clean(body.response));
    const expected = clean(body.expected);
    const due = clean(body.due);
    const sent = clean(body.sent);
    const expRaw = Number(body.exp);
    const sig = clean(body.sig);

    if (
      !uid ||
      !contact ||
      !response ||
      !expected ||
      !due ||
      !sent ||
      !sig ||
      !Number.isFinite(expRaw)
    ) {
      return NextResponse.json(
        {
          ok: false,
          state: "invalid",
          message: "This response link is missing required safety details.",
        },
        { status: 400 },
      );
    }

    const verified = verifySignature({
      uid,
      contact,
      contactName,
      subjectName,
      response,
      expected,
      due,
      sent,
      exp: expRaw,
      sig,
    });

    if (!verified.ok) {
      return NextResponse.json(
        {
          ok: false,
          state: verified.reason === "expired" ? "expired" : "invalid",
          message:
            verified.reason === "expired"
              ? "This response link expired for security reasons."
              : "This response link is invalid or can no longer be trusted.",
        },
        { status: 400 },
      );
    }

    const sb = admin();

    const actorIp = extractClientIp(req);
    const actorGeo = coarseLocationFromHeaders(req);
    const actorUserAgent = (req.headers.get("user-agent") || "").trim();

    const dueIso = toIsoOrNull(due);
    const expectedIso = toIsoOrNull(expected);
    const sentIso = toIsoOrNull(sent);

    const existing = await findExistingResponse({
      sb,
      uid,
      contact,
      dueIso,
    });

    if (existing?.id) {
      const recordedResponse =
        asResponse(String(existing.response || "")) || response;

      return NextResponse.json({
        ok: true,
        state: "already_recorded",
        title: "Response already recorded",
        message: alreadyRecordedMessage(recordedResponse, subjectName),
      });
    }

    const { error: insertErr } = await sb
      .from("missed_im_safe_contact_responses")
      .insert({
        user_id: uid,
        contact_email: contact,
        contact_name: contactName || null,
        response,
        missed_alert_sent_at: sentIso,
        expected_at: expectedIso,
        due_at: dueIso,
        actor_ip: actorIp || null,
        actor_user_agent: actorUserAgent || null,
        actor_country: actorGeo.country || null,
        actor_region: actorGeo.region || null,
        actor_city: actorGeo.city || null,
        meta: {
          response_label: responseLabel(response),
          subject_name: subjectName,
          actor_location: actorGeo.summary,
          one_time_response: true,
          one_response_per_notice: true,
        },
      });

    if (insertErr) {
      const code = (insertErr as { code?: string }).code;

      if (code === "23505") {
        const duplicate = await findExistingResponse({
          sb,
          uid,
          contact,
          dueIso,
        });

        const duplicateResponse =
          asResponse(String(duplicate?.response || "")) || response;

        return NextResponse.json({
          ok: true,
          state: "already_recorded",
          title: "Response already recorded",
          message: alreadyRecordedMessage(duplicateResponse, subjectName),
        });
      }

      throw insertErr;
    }

    const title = timelineTitle(contactName, response);
    const bodyText = timelineBody(contactName, subjectName);

    await sb.from("safety_timeline_events").insert({
      user_id: uid,
      event_type: "contact_response_received",
      title,
      body: bodyText,
      severity: response === "could_not_reach" ? "warning" : "info",
      source: "missed_im_safe_response",
      actor_name: contactName || null,
      actor_email: contact,
      meta: {
        response,
        response_label: responseLabel(response),
        contact_email: contact,
        contact_name: contactName,
        subject_name: subjectName,
        expected_at: expectedIso,
        due_at: dueIso,
        missed_alert_sent_at: sentIso,
        actor_ip: actorIp || null,
        actor_user_agent: actorUserAgent || null,
        actor_country: actorGeo.country || null,
        actor_region: actorGeo.region || null,
        actor_city: actorGeo.city || null,
        one_time_response: true,
        one_response_per_notice: true,
      },
    });

    return NextResponse.json({
      ok: true,
      state: "recorded",
      title,
      message:
        response === "will_check"
          ? `Thank you. StayKnown recorded that you will check on ${subjectName}.`
          : response === "reached_them"
            ? `Thank you. StayKnown recorded that you reached ${subjectName}.`
            : `StayKnown recorded that you could not reach ${subjectName}.`,
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        state: "error",
        message:
          e instanceof Error
            ? e.message
            : "This response could not be recorded right now.",
      },
      { status: 500 },
    );
  }
}
