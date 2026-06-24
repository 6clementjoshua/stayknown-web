import { NextRequest, NextResponse } from "next/server";
import { MAIL_CONSOLE_COOKIE } from "@/lib/mailConsoleServerAuth";
import {
  getMailConsoleSiteUrl,
  requireMailConsoleAdmin,
} from "@/lib/mailConsoleAdmin";

function clean(v: FormDataEntryValue | null) {
  return typeof v === "string" ? v.trim() : "";
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
    const footerHtml = clean(form.get("footer_html"));
    const isActive = form.get("is_active") === "on";

    if (!id || !name || !footerHtml) {
      return NextResponse.redirect(
        `${siteUrl}/mail-console/footer-policies?error=missing`,
      );
    }

    await admin
      .from("mail_console_footer_policies")
      .update({
        name,
        mode,
        footer_html: footerHtml,
        footer_text: footerHtml,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    return NextResponse.redirect(
      `${siteUrl}/mail-console/footer-policies?saved=1`,
    );
  } catch (_) {
    return NextResponse.redirect(`${siteUrl}/mail-login`);
  }
}
