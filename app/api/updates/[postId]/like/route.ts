import { createHmac } from "node:crypto";

import {
  adminClient,
  isPublicPost,
} from "@/lib/stayknown-updates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { postId } = await params;
    const body = await req.json();
    const token = String(body?.token || "");

    if (!/^[0-9a-f-]{20,80}$/i.test(token)) {
      return Response.json({ error: "invalid_token" }, { status: 400 });
    }

    const secret =
      process.env.UPDATES_LIKE_HMAC_SECRET ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      "";

    if (!secret) {
      return Response.json({ error: "not_configured" }, { status: 500 });
    }

    const sb = adminClient();
    const { data: post, error: postError } = await sb
      .from("stayknown_updates_posts")
      .select("id,status,published_at,scheduled_for,created_at,deleted_at")
      .eq("id", postId)
      .is("deleted_at", null)
      .maybeSingle();

    if (postError) throw postError;

    if (!post || !isPublicPost(post as any)) {
      return Response.json(
        { error: "publication_not_available" },
        {
          status: 404,
          headers: { "cache-control": "no-store" },
        },
      );
    }

    const hash = createHmac("sha256", secret).update(token).digest("hex");
    const { data, error } = await sb.rpc("stayknown_toggle_update_like", {
      p_post_id: postId,
      p_token_hash: hash,
    });

    if (error) throw error;

    const row = Array.isArray(data) ? data[0] : data;

    return Response.json(
      {
        liked: Boolean(row?.liked),
        likeCount: Number(row?.like_count || 0),
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    return Response.json(
      { error: "like_failed" },
      {
        status: 400,
        headers: { "cache-control": "no-store" },
      },
    );
  }
}
