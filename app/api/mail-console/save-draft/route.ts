import { NextRequest, NextResponse } from "next/server";
import { MAIL_CONSOLE_COOKIE } from "@/lib/mailConsoleServerAuth";
import { requireMailConsoleAdmin } from "@/lib/mailConsoleAdmin";

function clean(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function textToHtml(text: string) {
  return text
    .trim()
    .split(/\n{2,}/)
    .map((para) => {
      const lines = para
        .split(/\n/)
        .map((line) =>
          line
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;"),
        )
        .join("<br/>");

      return `<p>${lines}</p>`;
    })
    .join("");
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(MAIL_CONSOLE_COOKIE)?.value || "";
    const { admin, adminEmail } = await requireMailConsoleAdmin(token);

    const body = await req.json().catch(() => ({}));

    const mode = clean(body.mode) || "support";
    const senderIdentityId = clean(body.sender_identity_id);
    const subject = clean(body.subject) || "Untitled Draft";
    const title = clean(body.title) || subject;
    const message = clean(body.message);
    const footerHtml = clean(body.footer_html);
    const imageUrl = clean(body.image_url);
    const imagePosition = clean(body.image_position) || "none";
    const ctaLabel = clean(body.cta_label);
    const ctaUrl = clean(body.cta_url);
    const footerPolicyId = clean(body.footer_policy_id);
    const policyLinks = Array.isArray(body.policy_links)
      ? body.policy_links
      : [];

    const { data, error } = await admin
      .from("mail_console_campaigns")
      .insert({
        mode,
        sender_identity_id: senderIdentityId || null,
        footer_policy_id: footerPolicyId || null,
        draft_label: title,
        title,
        subject,
        body_html: textToHtml(message),
        body_text: message,
        image_url: imageUrl || null,
        image_position: imagePosition,
        cta_label: ctaLabel || null,
        cta_url: ctaUrl || null,
        footer_html: footerHtml,
        footer_text: footerHtml,
        reply_mode:
          mode === "newsletter" || mode === "advert"
            ? "no_reply"
            : "reply_enabled",
        status: "draft",
        meta: {
          created_from: "mail_console_save_draft",
          admin_email: adminEmail,
          policy_links: policyLinks,
        },
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      draft_id: data.id,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Could not save draft.",
      },
      { status: 500 },
    );
  }
}
