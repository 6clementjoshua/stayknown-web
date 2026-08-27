import { createClient } from "@supabase/supabase-js";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.stay-known.com"
).replace(/\/$/, "");
export const UPDATE_CATEGORIES = [
  "Product",
  "Safety & Trust",
  "Technology",
  "Company",
  "Release",
  "Recognition",
] as const;
export const ANIMATION_PRESETS = [
  "none",
  "editorial-rise",
  "quiet-glow",
  "line-sweep",
  "spotlight",
  "milestone-burst",
  "confetti",
] as const;
export type AnimationPreset = (typeof ANIMATION_PRESETS)[number];
export type UpdateBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading2"; text: string }
  | { type: "heading3"; text: string }
  | { type: "quote"; text: string }
  | { type: "callout"; title?: string; text: string }
  | { type: "image"; url: string; alt: string; caption?: string }
  | { type: "divider" }
  | { type: "link"; label: string; url: string };

export type UpdatePost = {
  id: string;
  slug: string;
  status: string;
  article_type: "Article" | "NewsArticle" | "BlogPosting";
  category: string;
  kicker: string | null;
  title: string;
  summary: string;
  body: UpdateBlock[];
  hero_image_url: string | null;
  image_16_9_url: string | null;
  image_4_3_url: string | null;
  image_1_1_url: string | null;
  hero_alt_text: string | null;
  author_name: string;
  author_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_path: string | null;
  animation_preset: AnimationPreset;
  featured: boolean;
  strict_seo: boolean;
  like_count: number;
  scheduled_for: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("updates_server_not_configured");
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export function publicDate(
  post: Pick<UpdatePost, "published_at" | "scheduled_for" | "created_at">,
) {
  return post.published_at || post.scheduled_for || post.created_at;
}

export function isPublicPost(
  post: Pick<
    UpdatePost,
    "status" | "published_at" | "scheduled_for" | "created_at"
  >,
  now = Date.now(),
) {
  if (post.status === "published")
    return new Date(post.published_at || post.created_at).getTime() <= now;
  return (
    post.status === "scheduled" &&
    !!post.scheduled_for &&
    new Date(post.scheduled_for).getTime() <= now
  );
}

export async function listPublicUpdates(limit = 100): Promise<UpdatePost[]> {
  const sb = adminClient();
  const { data, error } = await sb
    .from("stayknown_updates_posts")
    .select("*")
    .in("status", ["published", "scheduled"])
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("scheduled_for", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return ((data || []) as UpdatePost[]).filter((p) => isPublicPost(p));
}

export async function getPublicUpdate(
  slug: string,
): Promise<UpdatePost | null> {
  const sb = adminClient();
  const { data, error } = await sb
    .from("stayknown_updates_posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  const post = data as UpdatePost | null;
  return post && isPublicPost(post) ? post : null;
}

export async function getRouteViews(path: string): Promise<number> {
  const sb = adminClient();
  const { data } = await sb
    .from("website_route_visit_totals")
    .select("total_visits")
    .eq("path", path)
    .maybeSingle();
  const n = Number((data as any)?.total_visits || 0);
  return Number.isFinite(n) ? n : 0;
}

export function canonicalPath(slug: string) {
  return `/updates/${slug}`;
}
export function canonicalUrl(slug: string) {
  return `${SITE_URL}${canonicalPath(slug)}`;
}
export function wordCount(blocks: UpdateBlock[]) {
  return blocks
    .map((b: any) => `${b.title || ""} ${b.text || ""} ${b.caption || ""}`)
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}
