import { NextRequest, NextResponse } from "next/server";
import {
  createMailConsoleSessionToken,
  MAIL_CONSOLE_COOKIE,
  verifyMailConsoleLoginToken,
} from "@/lib/mailConsoleServerAuth";

export async function GET(req: NextRequest) {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://stay-known.com"
  ).replace(/\/+$/g, "");

  try {
    const token = req.nextUrl.searchParams.get("token") || "";

    const payload = verifyMailConsoleLoginToken(token);
    const sessionToken = createMailConsoleSessionToken(payload.email);

    const res = NextResponse.redirect(`${siteUrl}/mail-console`);

    res.cookies.set({
      name: MAIL_CONSOLE_COOKIE,
      value: sessionToken,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 12 * 60 * 60,
    });

    return res;
  } catch (_) {
    const res = NextResponse.redirect(
      `${siteUrl}/mail-login?error=login_expired`,
    );

    res.cookies.set({
      name: MAIL_CONSOLE_COOKIE,
      value: "",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return res;
  }
}
