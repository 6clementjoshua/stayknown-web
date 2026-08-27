import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

import { adminClient } from "./stayknown-updates";

export const UPDATES_ADMIN_SESSION_COOKIE = "sk_updates_admin_session";
export const UPDATES_ADMIN_SESSION_MAX_AGE = 8 * 60 * 60;

type UpdatesAdminSessionPayload = {
  v: 1;
  userId: string;
  email: string;
  iat: number;
  exp: number;
};

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function sessionSecret(): string {
  const secret = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!secret) throw new Error("updates_admin_session_not_configured");
  return secret;
}

function encodeBase64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string): string {
  return createHmac("sha256", sessionSecret())
    .update(`stayknown-updates-admin-v1:${value}`)
    .digest("base64url");
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function readCookie(req: Request, name: string): string {
  const header = req.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    if (key !== name) continue;
    return decodeURIComponent(part.slice(index + 1).trim());
  }
  return "";
}

export function createUpdatesAdminSessionToken(input: {
  userId: string;
  email: string;
}): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: UpdatesAdminSessionPayload = {
    v: 1,
    userId: clean(input.userId),
    email: clean(input.email).toLowerCase(),
    iat: now,
    exp: now + UPDATES_ADMIN_SESSION_MAX_AGE,
  };

  if (!payload.userId || !payload.email.includes("@")) {
    throw new Error("invalid_updates_admin_session_identity");
  }

  const body = encodeBase64Url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

function parseUpdatesAdminSessionToken(
  token: string,
): UpdatesAdminSessionPayload | null {
  const [body, signature, extra] = token.split(".");
  if (!body || !signature || extra) return null;
  if (!safeEqual(signature, sign(body))) return null;

  try {
    const payload = JSON.parse(decodeBase64Url(body)) as UpdatesAdminSessionPayload;
    const now = Math.floor(Date.now() / 1000);

    if (
      payload?.v !== 1 ||
      !clean(payload.userId) ||
      !clean(payload.email).includes("@") ||
      !Number.isFinite(payload.exp) ||
      payload.exp <= now
    ) {
      return null;
    }

    return {
      ...payload,
      userId: clean(payload.userId),
      email: clean(payload.email).toLowerCase(),
    };
  } catch {
    return null;
  }
}

async function identityFromBearer(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const browserKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !browserKey) {
    throw Object.assign(new Error("auth_not_configured"), { status: 500 });
  }

  const verifier = createClient(url, browserKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await verifier.auth.getUser(token);

  if (error || !data.user?.email) {
    throw Object.assign(new Error("invalid_session"), { status: 401 });
  }

  return {
    id: data.user.id,
    email: data.user.email.toLowerCase(),
  };
}

export async function requireUpdatesAdmin(
  req: Request,
  roles: string[] = ["owner", "admin", "editor", "analyst"],
) {
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : "";

  let user: { id: string; email: string } | null = null;

  if (bearer && bearer !== "undefined" && bearer !== "null") {
    user = await identityFromBearer(bearer);
  } else {
    const cookieToken = readCookie(req, UPDATES_ADMIN_SESSION_COOKIE);
    const session = cookieToken
      ? parseUpdatesAdminSessionToken(cookieToken)
      : null;

    if (!session) {
      throw Object.assign(new Error("not_authenticated"), { status: 401 });
    }

    user = {
      id: session.userId,
      email: session.email,
    };
  }

  const sb = adminClient();
  const { data: admin, error: adminError } = await sb
    .from("stayknown_update_admins")
    .select("id,user_id,email,role,is_active")
    .ilike("email", user.email)
    .eq("is_active", true)
    .maybeSingle();

  if (adminError || !admin || !roles.includes(admin.role)) {
    throw Object.assign(new Error("not_authorized"), { status: 403 });
  }

  if (admin.user_id && admin.user_id !== user.id) {
    throw Object.assign(new Error("admin_identity_mismatch"), { status: 403 });
  }

  if (!admin.user_id) {
    await sb
      .from("stayknown_update_admins")
      .update({
        user_id: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", admin.id);
  }

  return { user, admin };
}
