import { createHmac } from "node:crypto";
import { adminClient } from "@/lib/stayknown-updates";
export const runtime = "nodejs";
export async function POST(
  req: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { postId } = await params;
    const body = await req.json();
    const token = String(body?.token || "");
    if (!/^[0-9a-f-]{20,80}$/i.test(token))
      return Response.json({ error: "invalid_token" }, { status: 400 });
    const secret =
      process.env.UPDATES_LIKE_HMAC_SECRET ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      "";
    if (!secret)
      return Response.json({ error: "not_configured" }, { status: 500 });
    const hash = createHmac("sha256", secret).update(token).digest("hex");
    const { data, error } = await adminClient().rpc(
      "stayknown_toggle_update_like",
      { p_post_id: postId, p_token_hash: hash },
    );
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    return Response.json(
      { liked: !!row?.liked, likeCount: Number(row?.like_count || 0) },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    return Response.json({ error: "like_failed" }, { status: 400 });
  }
}
