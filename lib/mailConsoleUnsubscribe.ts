import { createHmac, timingSafeEqual } from "crypto";

function clean(v: string | undefined | null) {
  return (v || "").trim();
}

function getSecret() {
  const secret =
    clean(process.env.MAIL_CONSOLE_UNSUBSCRIBE_SECRET) ||
    clean(process.env.MAIL_CONSOLE_SESSION_SECRET);

  if (!secret) {
    throw new Error(
      "Missing MAIL_CONSOLE_UNSUBSCRIBE_SECRET or MAIL_CONSOLE_SESSION_SECRET.",
    );
  }

  return secret;
}

function sign(email: string) {
  return createHmac("sha256", getSecret())
    .update(email.trim().toLowerCase())
    .digest("hex");
}

export function createUnsubscribeToken(email: string) {
  return sign(email);
}

export function verifyUnsubscribeToken(email: string, token: string) {
  const expected = sign(email);
  const a = Buffer.from(expected);
  const b = Buffer.from(token || "");

  return a.length === b.length && timingSafeEqual(a, b);
}
