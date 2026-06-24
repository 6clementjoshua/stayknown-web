import { NextRequest, NextResponse } from "next/server";
import { getMailConsoleAdminClient } from "@/lib/mailConsoleAdmin";
import { verifyUnsubscribeToken } from "@/lib/mailConsoleUnsubscribe";

function clean(v: FormDataEntryValue | null) {
  return typeof v === "string" ? v.trim() : "";
}

function html(message: string) {
  return new NextResponse(
    `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>StayKnown Email Preferences</title>
</head>
<body style="margin:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#050505;">
  <main style="min-height:100vh;display:grid;place-items:center;padding:24px;">
    <section style="width:100%;max-width:460px;border-radius:30px;background:white;border:1px solid rgba(0,0,0,0.08);box-shadow:0 24px 70px rgba(0,0,0,0.09);padding:24px;text-align:center;">
      <div style="font-size:12px;font-weight:950;letter-spacing:2.6px;text-transform:uppercase;color:rgba(0,0,0,0.58);">StayKnown Email Preferences</div>
      <h1 style="font-size:28px;margin:12px 0 8px;font-weight:950;">${message}</h1>
      <p style="font-size:14px;line-height:1.65;color:rgba(0,0,0,0.62);">You can close this page now.</p>
    </section>
  </main>
</body>
</html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    },
  );
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const email = clean(form.get("email")).toLowerCase();
    const token = clean(form.get("token"));

    if (!email || !token || !verifyUnsubscribeToken(email, token)) {
      return html("Invalid unsubscribe link");
    }

    const admin = getMailConsoleAdminClient();

    await admin.from("mail_console_unsubscribes").upsert(
      {
        email,
        reason: "Confirmed from unsubscribe page",
        source: "unsubscribe_link",
      },
      {
        onConflict: "email",
      },
    );

    return html("You have been unsubscribed");
  } catch (_) {
    return html("Could not process request");
  }
}
