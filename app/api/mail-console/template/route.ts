import { NextRequest, NextResponse } from "next/server";
import { MAIL_CONSOLE_COOKIE } from "@/lib/mailConsoleServerAuth";
import {
  getMailConsoleSiteUrl,
  requireMailConsoleAdmin,
} from "@/lib/mailConsoleAdmin";

function clean(v: FormDataEntryValue | null) {
  return typeof v === "string" ? v.trim() : "";
}

function textToHtml(text: string) {
  return text
    .trim()
    .split(/\n{2,}/)
    .map((para) => `<p>${para.replaceAll("\n", "<br/>")}</p>`)
    .join("");
}

export async function POST(req: NextRequest) {
  const siteUrl = getMailConsoleSiteUrl();

  try {
    const token = req.cookies.get(MAIL_CONSOLE_COOKIE)?.value || "";
    const { admin } = await requireMailConsoleAdmin(token);

    const form = await req.formData();

    const id = clean(form.get("id"));
    const name = clean(form.get("name"));
    const mode = clean(form.get("mode")) || "support";
    const subject = clean(form.get("subject"));
    const bodyText = clean(form.get("body_text"));
    const isActive = form.get("is_active") === "on";

    if (!id || !name) {
      return NextResponse.redirect(
        `${siteUrl}/mail-console/templates?error=missing`,
      );
    }

    await admin
      .from("mail_console_templates")
      .update({
        name,
        mode,
        subject,
        body_text: bodyText,
        body_html: textToHtml(bodyText),
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    return NextResponse.redirect(`${siteUrl}/mail-console/templates?saved=1`);
  } catch (_) {
    return NextResponse.redirect(`${siteUrl}/mail-login`);
  }
}
