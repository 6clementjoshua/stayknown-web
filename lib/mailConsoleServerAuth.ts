import { createHmac, randomBytes, timingSafeEqual } from "crypto";

export const MAIL_CONSOLE_COOKIE = "sk_mail_console_session";

type TokenPayload = {
  email: string;
  exp: number;
  nonce: string;
  kind: "login" | "session";
};

function clean(v: string | undefined | null) {
  return (v || "").trim();
}

function getSecret() {
  const secret = clean(process.env.MAIL_CONSOLE_SESSION_SECRET);

  if (!secret) {
    throw new Error("Missing MAIL_CONSOLE_SESSION_SECRET in Vercel.");
  }

  return secret;
}

function base64UrlEncode(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64UrlDecode(input: string) {
  const normalized = input.replaceAll("-", "+").replaceAll("_", "/");
  const pad =
    normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + pad, "base64").toString("utf8");
}

function sign(payloadPart: string) {
  return base64UrlEncode(
    createHmac("sha256", getSecret()).update(payloadPart).digest(),
  );
}

function createToken(payload: TokenPayload) {
  const payloadPart = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(payloadPart);
  return `${payloadPart}.${signature}`;
}

function verifyToken(token: string, expectedKind: "login" | "session") {
  const cleanToken = clean(token);
  const parts = cleanToken.split(".");

  if (parts.length !== 2) {
    throw new Error("Invalid token.");
  }

  const [payloadPart, signature] = parts;

  const expectedSignature = sign(payloadPart);

  const a = Buffer.from(signature);
  const b = Buffer.from(expectedSignature);

  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Invalid token signature.");
  }

  const payload = JSON.parse(base64UrlDecode(payloadPart)) as TokenPayload;

  if (payload.kind !== expectedKind) {
    throw new Error("Invalid token type.");
  }

  if (!payload.email || !payload.email.includes("@")) {
    throw new Error("Invalid token email.");
  }

  if (!payload.exp || Date.now() > payload.exp) {
    throw new Error("This admin login link has expired. Request a fresh one.");
  }

  return payload;
}

export function createMailConsoleLoginToken(email: string) {
  return createToken({
    email: email.trim().toLowerCase(),
    exp: Date.now() + 15 * 60 * 1000,
    nonce: randomBytes(16).toString("hex"),
    kind: "login",
  });
}

export function verifyMailConsoleLoginToken(token: string) {
  return verifyToken(token, "login");
}

export function createMailConsoleSessionToken(email: string) {
  return createToken({
    email: email.trim().toLowerCase(),
    exp: Date.now() + 12 * 60 * 60 * 1000,
    nonce: randomBytes(16).toString("hex"),
    kind: "session",
  });
}

export function verifyMailConsoleSessionToken(token: string) {
  return verifyToken(token, "session");
}
