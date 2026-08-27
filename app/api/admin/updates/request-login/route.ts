import { adminClient } from "@/lib/stayknown-updates";

export const dynamic = "force-dynamic";

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function cleanEmail(value: unknown): string {
  return clean(value).toLowerCase();
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function noStoreJson(body: unknown, init: ResponseInit = {}) {
  return Response.json(body, {
    ...init,
    headers: {
      "cache-control": "no-store, max-age=0",
      ...(init.headers || {}),
    },
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function publicationAdminEmail(input: {
  siteUrl: string;
  email: string;
  accessUrl: string;
}) {
  const logoUrl = `${input.siteUrl}/6logo.png`;

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f4f4f4;font-family:Inter,Arial,sans-serif;color:#111;">
    <div style="padding:32px 14px;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e6e6e6;border-radius:28px;overflow:hidden;">
        <div style="background:#000000;padding:28px 30px;color:#ffffff;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:42px;height:42px;border-radius:14px;background:#ffffff;display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;">
              <img src="${escapeHtml(logoUrl)}" alt="6 Clement Joshua" width="24" height="24" style="display:block;width:24px;height:24px;object-fit:contain;" />
            </div>
            <div style="display:inline-block;vertical-align:middle;margin-left:10px;">
              <div style="font-size:13px;font-weight:900;letter-spacing:.18em;">STAYKNOWN</div>
              <div style="margin-top:4px;font-size:11px;font-weight:700;color:#a9a9a9;">Updates &amp; Publication Admin</div>
            </div>
          </div>
        </div>

        <div style="padding:34px 30px 30px;">
          <div style="font-size:11px;font-weight:900;letter-spacing:.15em;text-transform:uppercase;color:#777;">Private editorial access</div>
          <h1 style="margin:10px 0 0;font-size:30px;line-height:1.06;letter-spacing:-.04em;">Open StayKnown Updates &amp; Publication Admin</h1>

          <p style="margin:18px 0 0;font-size:14px;line-height:1.75;color:#555;">
            A secure access link was requested for <strong style="color:#111;">${escapeHtml(input.email)}</strong> to manage StayKnown Updates, publication content, SEO, media and editorial administration.
          </p>

          <div style="margin:26px 0;">
            <a href="${escapeHtml(input.accessUrl)}" style="display:inline-block;background:#000000;color:#ffffff;text-decoration:none;border-radius:16px;padding:14px 20px;font-size:13px;font-weight:900;">
              Continue to Updates Admin
            </a>
          </div>

          <div style="border-top:1px solid #ededed;padding-top:18px;font-size:12px;line-height:1.7;color:#777;">
            This is a private publication-administration link. It is intended only for an approved StayKnown Updates administrator and can be used once. If you did not request this access, ignore this email.
          </div>
        </div>

        <div style="border-top:1px solid #ededed;padding:18px 30px 24px;font-size:11px;color:#888;">
          A 6 Clement Joshua service™ · stay-known.com
        </div>
      </div>
    </div>
  </body>
</html>`;
}

function publicationSender(value: string): string {
  const source = clean(value);
  const bracketMatch = source.match(/<\s*([^<>\s]+@[^<>\s]+)\s*>/);
  const email = cleanEmail(bracketMatch?.[1] || source);

  if (isEmail(email)) {
    return `StayKnown Updates & Publication <${email}>`;
  }

  return source;
}

async function sendPublicationAdminEmail(input: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
}) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${input.apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: publicationSender(input.from),
      to: [input.to],
      subject: input.subject,
      html: input.html,
    }),
  });

  const body = (await response.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(body.message || body.error || "resend_delivery_failed");
  }

  return body;
}

export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(() => ({}));
    const email = cleanEmail(payload?.email);

    if (!isEmail(email)) {
      return noStoreJson(
        { ok: false, error: "Enter a valid approved publication-admin email." },
        { status: 400 },
      );
    }

    const adminDb = adminClient();
    const { data: admin, error: adminError } = await adminDb
      .from("stayknown_update_admins")
      .select("id,email,is_active")
      .ilike("email", email)
      .eq("is_active", true)
      .maybeSingle();

    if (adminError) {
      console.error("updates_login_allowlist_lookup_failed", adminError);
      return noStoreJson(
        { ok: false, error: "Updates Admin access is temporarily unavailable." },
        { status: 503 },
      );
    }

    // Do not reveal whether an arbitrary address is on the private allowlist.
    if (!admin) {
      return noStoreJson({
        ok: true,
        message:
          "If this email is approved for StayKnown Updates & Publication Admin, an access link will be sent.",
      });
    }

    const siteUrl = (
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.stay-known.com"
    ).replace(/\/$/, "");
    const resendApiKey = clean(process.env.RESEND_API_KEY);
    const resendFrom = clean(process.env.RESEND_FROM);

    if (!resendApiKey || !resendFrom) {
      console.error("updates_publication_admin_resend_not_configured");
      return noStoreJson(
        {
          ok: false,
          error: "Updates & Publication Admin email delivery is not configured.",
        },
        { status: 500 },
      );
    }

    let generated = await adminDb.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    // Approved publication admins may be newly added and not yet have an Auth
    // record. Create the Auth identity only after the private allowlist check.
    if (
      generated.error &&
      /not found|does not exist|user.*missing/i.test(generated.error.message)
    ) {
      const created = await adminDb.auth.admin.createUser({
        email,
        email_confirm: true,
      });

      if (created.error && !/already|registered|exists/i.test(created.error.message)) {
        console.error("updates_publication_admin_create_user_failed", {
          message: created.error.message,
        });
        return noStoreJson(
          {
            ok: false,
            error: "The approved admin identity could not be prepared.",
          },
          { status: 502 },
        );
      }

      generated = await adminDb.auth.admin.generateLink({
        type: "magiclink",
        email,
      });
    }

    if (generated.error) {
      console.error("updates_publication_admin_generate_link_failed", {
        message: generated.error.message,
      });
      return noStoreJson(
        {
          ok: false,
          error: "The secure publication-admin link could not be created.",
        },
        { status: 502 },
      );
    }

    const properties = generated.data.properties as {
      hashed_token?: string;
    };
    const tokenHash = clean(properties?.hashed_token);

    if (!tokenHash) {
      console.error("updates_publication_admin_token_hash_missing");
      return noStoreJson(
        {
          ok: false,
          error: "The secure publication-admin link could not be created.",
        },
        { status: 502 },
      );
    }

    const accessUrl = `${siteUrl}/admin/updates/auth/callback?token_hash=${encodeURIComponent(tokenHash)}`;

    await sendPublicationAdminEmail({
      apiKey: resendApiKey,
      from: resendFrom,
      to: email,
      subject: "StayKnown Updates & Publication Admin — secure access",
      html: publicationAdminEmail({
        siteUrl,
        email,
        accessUrl,
      }),
    });

    return noStoreJson({
      ok: true,
      message:
        "Updates & Publication Admin access email sent. Open the newest message and choose Continue to Updates Admin.",
    });
  } catch (error) {
    console.error("updates_publication_admin_request_failed", error);
    return noStoreJson(
      { ok: false, error: "Updates Admin access is temporarily unavailable." },
      { status: 500 },
    );
  }
}
