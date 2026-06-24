import { NextResponse } from "next/server";
import { MAIL_CONSOLE_COOKIE } from "@/lib/mailConsoleServerAuth";

export async function POST() {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://stay-known.com"
  ).replace(/\/+$/g, "");

  const res = NextResponse.redirect(`${siteUrl}/mail-login`);

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
