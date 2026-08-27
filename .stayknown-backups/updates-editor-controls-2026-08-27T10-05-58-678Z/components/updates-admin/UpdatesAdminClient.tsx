"use client";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import {
  ANIMATION_PRESETS,
  UPDATE_CATEGORIES,
  type UpdateBlock,
} from "@/lib/stayknown-updates";
import { inspectSeo, type SeoIssue } from "@/lib/stayknown-updates-seo";
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
const blank = {
  id: "",
  slug: "",
  status: "draft",
  article_type: "Article",
  category: "Product",
  kicker: "",
  title: "",
  summary: "",
  body: [{ type: "paragraph", text: "" }] as UpdateBlock[],
  hero_image_url: "",
  image_16_9_url: "",
  image_4_3_url: "",
  image_1_1_url: "",
  hero_alt_text: "",
  author_name: "StayKnown",
  author_url: "",
  seo_title: "",
  seo_description: "",
  canonical_path: "",
  animation_preset: "editorial-rise",
  featured: false,
  strict_seo: true,
  scheduled_for: "",
  published_at: "",
};
function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}
export default function UpdatesAdminClient() {
  const [session, setSession] = useState<any>(null),
    [allowed, setAllowed] = useState(false),
    [posts, setPosts] = useState<any[]>([]),
    [analytics, setAnalytics] = useState<any>(null),
    [post, setPost] = useState<any>(blank),
    [tab, setTab] = useState("Overview"),
    [busy, setBusy] = useState(false),
    [note, setNote] = useState("");
  useEffect(() => {
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);
  async function api(path: string, init: any = {}) {
    const token = (await sb.auth.getSession()).data.session?.access_token;
    return fetch(path, {
      ...init,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
        ...init.headers,
      },
    });
  }
  useEffect(() => {
    if (!session) return;
    api("/api/admin/updates/session").then(async (r) => {
      setAllowed(r.ok);
      if (r.ok) {
        const [p, a] = await Promise.all([
          api("/api/admin/updates/posts").then((x) => x.json()),
          api("/api/admin/updates/analytics").then((x) => x.json()),
        ]);
        setPosts(p.posts || []);
        setAnalytics(a);
      }
    });
  }, [session]);
  async function login() {
    const email = (
      document.getElementById("sk-admin-email") as HTMLInputElement
    )?.value.trim();
    if (!email) return;
    setBusy(true);
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/admin/updates` },
    });
    setBusy(false);
    setNote(
      error ? error.message : "Check your email for the secure sign-in link.",
    );
  }
  const issues = useMemo(() => inspectSeo(post), [post]);
  const blocks = issues.filter((i) => i.level === "block").length;
  function set(k: string, v: any) {
    setPost((p: any) => ({
      ...p,
      [k]: v,
      ...(k === "title" && !p.id && !p.slug ? { slug: slugify(v) } : {}),
    }));
  }
  function updateBlock(i: number, k: string, v: string) {
    setPost((p: any) => ({
      ...p,
      body: p.body.map((b: any, n: number) => (n === i ? { ...b, [k]: v } : b)),
    }));
  }
  function addBlock(type: string) {
    setPost((p: any) => ({
      ...p,
      body: [
        ...p.body,
        type === "divider" ? { type: "divider" } : { type, text: "" },
      ],
    }));
  }
  async function imageMeta() {
    const pairs = [
      ["16:9", post.image_16_9_url],
      ["4:3", post.image_4_3_url],
      ["1:1", post.image_1_1_url],
    ] as const;
    const out: any = {};
    await Promise.all(
      pairs.map(
        ([label, url]) =>
          new Promise<void>((resolve) => {
            if (!url) return resolve();
            const img = new Image();
            img.onload = () => {
              out[label] = {
                width: img.naturalWidth,
                height: img.naturalHeight,
              };
              resolve();
            };
            img.onerror = () => resolve();
            img.src = url;
          }),
      ),
    );
    return out;
  }
  async function save(status?: string) {
    setBusy(true);
    setNote("");
    const meta = await imageMeta();
    const payload = {
      ...post,
      imageMeta: meta,
      status: status || post.status,
      canonical_path: `/updates/${post.slug}`,
    };
    const url = post.id
      ? `/api/admin/updates/posts/${post.id}`
      : "/api/admin/updates/posts";
    const r = await api(url, {
      method: post.id ? "PUT" : "POST",
      body: JSON.stringify(payload),
    });
    const j = await r.json();
    setBusy(false);
    if (!r.ok) {
      setNote(
        j.error === "seo_blocked"
          ? `Publishing blocked: ${(j.issues || [])
              .filter((x: any) => x.level === "block")
              .map((x: any) => x.message)
              .join(" · ")}`
          : j.error || "Save failed",
      );
      return;
    }
    setPost(j.post);
    setPosts(
      await api("/api/admin/updates/posts")
        .then((x) => x.json())
        .then((x) => x.posts || []),
    );
    setNote(status === "published" ? "Published successfully." : "Saved.");
  }
  if (!session)
    return (
      <div className="min-h-screen bg-black px-4 py-20 text-white">
        <div className="mx-auto max-w-[430px] rounded-[32px] border border-white/12 bg-white/[.025] p-7">
          <div className="text-[9px] font-black uppercase tracking-[.22em] text-white/34">
            StayKnown private publishing
          </div>
          <h1 className="mt-3 text-[42px] font-black tracking-[-.06em]">
            Updates Admin.
          </h1>
          <p className="mt-4 text-[12px] font-semibold leading-6 text-white/48">
            Use the same approved Supabase Auth email. Access still requires the
            Updates admin allowlist.
          </p>
          <input
            id="sk-admin-email"
            type="email"
            defaultValue="6clementjoshua@gmail.com"
            className="mt-7 w-full rounded-2xl border border-white/14 bg-black px-4 py-3 text-[13px] outline-none focus:border-white/40"
          />
          <button
            onClick={login}
            disabled={busy}
            className="mt-3 w-full rounded-2xl bg-white px-4 py-3 text-[11px] font-black text-black transition hover:scale-[1.01] active:scale-[.98]"
          >
            {busy ? "Sending…" : "Email me a secure sign-in link"}
          </button>
          {note ? (
            <p className="mt-4 text-[11px] font-semibold text-white/50">
              {note}
            </p>
          ) : null}
        </div>
      </div>
    );
  if (!allowed)
    return (
      <div className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-xl text-[14px] font-bold">
          This signed-in email is not authorized for StayKnown Updates.
        </div>
      </div>
    );
  const tabs = ["Overview", "Posts", "Media", "Analytics", "SEO", "Settings"];
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/90 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1380px] items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-black tracking-[.18em]">
              STAYKNOWN <span className="text-white/35">UPDATES ADMIN</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full border px-3 py-2 text-[9px] font-black ${blocks ? "border-white/22 text-white/55" : "border-white/15 text-white/40"}`}
            >
              {blocks
                ? `${blocks} SEO BLOCKER${blocks > 1 ? "S" : ""}`
                : "SEO READY"}
            </span>
            <button
              onClick={() => {
                setPost(blank);
                setTab("Posts");
              }}
              className="rounded-full bg-white px-4 py-2 text-[10px] font-black text-black transition hover:scale-105 active:scale-95"
            >
              + NEW UPDATE
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1380px] lg:grid-cols-[190px_1fr]">
        <aside className="border-r border-white/8 p-4">
          <div className="flex gap-2 overflow-x-auto lg:block">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`mb-1 w-full rounded-xl px-3 py-2.5 text-left text-[10px] font-black transition ${tab === t ? "bg-white text-black" : "text-white/42 hover:bg-white/[.05] hover:text-white"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </aside>
        <section className="min-w-0 p-4 sm:p-7">
          {tab === "Posts" ? (
            <div className="grid gap-6 xl:grid-cols-[.36fr_.64fr]">
              <div className="rounded-[28px] border border-white/10 p-3">
                <div className="px-2 pb-3 text-[9px] font-black uppercase tracking-[.2em] text-white/30">
                  Posts
                </div>
                {posts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPost({ ...blank, ...p })}
                    className="mb-2 w-full rounded-2xl border border-white/8 p-3 text-left transition hover:border-white/22"
                  >
                    <div className="text-[9px] font-black uppercase text-white/28">
                      {p.status} · {p.category}
                    </div>
                    <div className="mt-1 text-[12px] font-black leading-tight">
                      {p.title}
                    </div>
                  </button>
                ))}
              </div>
              <Editor
                post={post}
                set={set}
                updateBlock={updateBlock}
                addBlock={addBlock}
                issues={issues}
                save={save}
                busy={busy}
                note={note}
              />
            </div>
          ) : tab === "SEO" ? (
            <SeoGuide />
          ) : tab === "Settings" ? (
            <AdminSettings api={api} />
          ) : (
            <Dashboard tab={tab} posts={posts} analytics={analytics} />
          )}
        </section>
      </div>
    </main>
  );
}
function Editor({
  post,
  set,
  updateBlock,
  addBlock,
  issues,
  save,
  busy,
  note,
}: any) {
  return (
    <div className="rounded-[32px] border border-white/10 p-4 sm:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Category">
          <select
            value={post.category}
            onChange={(e) => set("category", e.target.value)}
            className="input"
          >
            {UPDATE_CATEGORIES.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </Field>
        <Field label="Article schema">
          <select
            value={post.article_type}
            onChange={(e) => set("article_type", e.target.value)}
            className="input"
          >
            <option>Article</option>
            <option>NewsArticle</option>
            <option>BlogPosting</option>
          </select>
        </Field>
      </div>
      <Field label="Kicker">
        <input
          className="input"
          value={post.kicker || ""}
          onChange={(e) => set("kicker", e.target.value)}
        />
      </Field>
      <Field label="Headline">
        <textarea
          className="input min-h-24"
          value={post.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </Field>
      <Field label="Slug / permanent URL">
        <input
          className="input"
          value={post.slug}
          onChange={(e) => set("slug", slugify(e.target.value))}
        />
        <Hint>Canonical: /updates/{post.slug || "your-update"}</Hint>
      </Field>
      <Field label="Summary">
        <textarea
          className="input min-h-24"
          value={post.summary}
          onChange={(e) => set("summary", e.target.value)}
        />
      </Field>
      <div className="mt-6 rounded-[26px] border border-white/10 bg-white/[.02] p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black">Representative images</div>
            <div className="mt-1 text-[9px] font-semibold text-white/35">
              Strict SEO checks Google Article best-practice: crawlable 16:9,
              4:3 and 1:1 images, each ≥50K pixels.
            </div>
          </div>
          <label className="text-[9px] font-black">
            <input
              type="checkbox"
              checked={post.strict_seo}
              onChange={(e) => set("strict_seo", e.target.checked)}
            />{" "}
            Strict SEO
          </label>
        </div>
        {[
          ["16:9", "image_16_9_url"],
          ["4:3", "image_4_3_url"],
          ["1:1", "image_1_1_url"],
        ].map(([label, key]) => (
          <Field key={key} label={`${label} image HTTPS URL`}>
            <input
              className="input"
              value={post[key] || ""}
              onChange={(e) => set(key, e.target.value)}
            />
          </Field>
        ))}
        <Field label="Image alt text">
          <input
            className="input"
            value={post.hero_alt_text || ""}
            onChange={(e) => set("hero_alt_text", e.target.value)}
          />
        </Field>
      </div>
      <div className="mt-6">
        <div className="text-[10px] font-black">Article body</div>
        {post.body.map((b: any, i: number) => (
          <div key={i} className="mt-3 rounded-2xl border border-white/9 p-3">
            <div className="mb-2 text-[8px] font-black uppercase tracking-[.16em] text-white/30">
              {b.type}
            </div>
            {b.type !== "divider" ? (
              <textarea
                className="input min-h-20"
                value={b.text || ""}
                onChange={(e) => updateBlock(i, "text", e.target.value)}
              />
            ) : null}
            {b.type === "image" ? (
              <>
                <input
                  className="input mt-2"
                  placeholder="Image HTTPS URL"
                  value={b.url || ""}
                  onChange={(e) => updateBlock(i, "url", e.target.value)}
                />
                <input
                  className="input mt-2"
                  placeholder="Alt text"
                  value={b.alt || ""}
                  onChange={(e) => updateBlock(i, "alt", e.target.value)}
                />
                <input
                  className="input mt-2"
                  placeholder="Caption (optional)"
                  value={b.caption || ""}
                  onChange={(e) => updateBlock(i, "caption", e.target.value)}
                />
              </>
            ) : null}
            {b.type === "link" ? (
              <>
                <input
                  className="input mt-2"
                  placeholder="Button/link label"
                  value={b.label || ""}
                  onChange={(e) => updateBlock(i, "label", e.target.value)}
                />
                <input
                  className="input mt-2"
                  placeholder="https://..."
                  value={b.url || ""}
                  onChange={(e) => updateBlock(i, "url", e.target.value)}
                />
              </>
            ) : null}
          </div>
        ))}
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            "paragraph",
            "heading2",
            "heading3",
            "quote",
            "callout",
            "image",
            "link",
            "divider",
          ].map((x) => (
            <button
              key={x}
              onClick={() => addBlock(x)}
              className="rounded-full border border-white/12 px-3 py-2 text-[9px] font-black text-white/45 transition hover:bg-white hover:text-black"
            >
              + {x}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Animation / opening experience">
          <select
            className="input"
            value={post.animation_preset}
            onChange={(e) => set("animation_preset", e.target.value)}
          >
            {ANIMATION_PRESETS.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
          <Hint>
            Confetti and milestone burst use StayKnown white/grey tones only and
            respect reduced-motion accessibility.
          </Hint>
        </Field>
        <Field label="Schedule (optional)">
          <input
            type="datetime-local"
            className="input"
            value={
              post.scheduled_for ? String(post.scheduled_for).slice(0, 16) : ""
            }
            onChange={(e) =>
              set(
                "scheduled_for",
                e.target.value ? new Date(e.target.value).toISOString() : "",
              )
            }
          />
        </Field>
      </div>
      <Field label="SEO title override (optional)">
        <input
          className="input"
          value={post.seo_title || ""}
          onChange={(e) => set("seo_title", e.target.value)}
        />
      </Field>
      <Field label="SEO description override (optional)">
        <textarea
          className="input min-h-20"
          value={post.seo_description || ""}
          onChange={(e) => set("seo_description", e.target.value)}
        />
      </Field>
      <SeoIssues issues={issues} />
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          disabled={busy}
          onClick={() => save("draft")}
          className="rounded-full border border-white/16 px-5 py-3 text-[10px] font-black transition hover:bg-white hover:text-black"
        >
          Save draft
        </button>
        <button
          disabled={busy || issues.some((i: any) => i.level === "block")}
          onClick={() => save(post.scheduled_for ? "scheduled" : "published")}
          className="rounded-full bg-white px-5 py-3 text-[10px] font-black text-black transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-25"
        >
          {post.scheduled_for ? "Schedule" : "Publish"}
        </button>
      </div>
      {note ? (
        <div className="mt-4 text-[11px] font-bold text-white/52">{note}</div>
      ) : null}
      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: #000;
          color: #fff;
          border-radius: 14px;
          padding: 11px 12px;
          font-size: 12px;
          font-weight: 650;
          outline: none;
        }
        .input:focus {
          border-color: rgba(255, 255, 255, 0.38);
        }
        select.input option {
          background: #000;
          color: #fff;
        }
      `}</style>
    </div>
  );
}
function Field({ label, children }: { label: string; children: any }) {
  return (
    <label className="mt-4 block">
      <span className="mb-2 block text-[8px] font-black uppercase tracking-[.17em] text-white/30">
        {label}
      </span>
      {children}
    </label>
  );
}
function Hint({ children }: { children: any }) {
  return (
    <div className="mt-2 text-[9px] font-semibold leading-4 text-white/28">
      {children}
    </div>
  );
}
function SeoIssues({ issues }: { issues: SeoIssue[] }) {
  return (
    <div className="mt-7 rounded-[28px] border border-white/12 p-4">
      <div className="text-[10px] font-black">SEO QUALITY GATE</div>
      <div className="mt-1 text-[9px] font-semibold text-white/35">
        Blocks stop publication. Warnings and hints teach the editor without
        pretending every recommendation is a Google requirement.
      </div>
      <div className="mt-4 space-y-2">
        {issues.map((x, i) => (
          <div
            key={`${x.code}-${i}`}
            className={`rounded-2xl border p-3 text-[10px] font-semibold leading-5 ${x.level === "block" ? "border-white/25 bg-white/[.07] text-white" : x.level === "warning" ? "border-white/13 text-white/55" : "border-white/8 text-white/35"}`}
          >
            <b className="mr-2 uppercase">{x.level}</b>
            {x.message}
          </div>
        ))}
      </div>
    </div>
  );
}
function Dashboard({
  tab,
  posts,
  analytics,
}: {
  tab: string;
  posts: any[];
  analytics: any;
}) {
  const pub = posts.filter((p) => p.status === "published").length,
    draft = posts.filter((p) => p.status === "draft").length;
  return (
    <div>
      <div className="text-[9px] font-black uppercase tracking-[.2em] text-white/30">
        {tab}
      </div>
      <h1 className="mt-3 text-[48px] font-black tracking-[-.065em]">
        Publishing control.
      </h1>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          [posts.length, "All posts"],
          [pub, "Published"],
          [draft, "Drafts"],
        ].map(([n, l]) => (
          <div
            key={String(l)}
            className="rounded-[26px] border border-white/10 p-5"
          >
            <div className="text-[40px] font-black tracking-[-.06em]">{n}</div>
            <div className="text-[9px] font-black uppercase tracking-[.16em] text-white/30">
              {l}
            </div>
          </div>
        ))}
      </div>
      {tab === "Analytics" ? (
        <div className="mt-8 space-y-2">
          <div className="text-[11px] font-black">
            Recorded /updates views:{" "}
            {Number(analytics?.updatesViews || 0).toLocaleString()}
          </div>
          {(analytics?.posts || []).map((x: any) => (
            <div
              key={x.id}
              className="flex items-center justify-between rounded-2xl border border-white/9 p-3 text-[10px]"
            >
              <span className="max-w-[70%] font-bold text-white/60">
                {x.title}
              </span>
              <span className="font-black tabular-nums text-white/38">
                {Number(x.views || 0).toLocaleString()} views ·{" "}
                {Number(x.likes || 0).toLocaleString()} likes
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-8 max-w-xl text-[12px] font-semibold leading-6 text-white/38">
          Views reuse StayKnown's existing privacy-preserving route counter.
          Likes are stored as aggregate counts with a one-way server HMAC
          browser token.
        </p>
      )}
    </div>
  );
}
function SeoGuide() {
  return (
    <div className="max-w-3xl">
      <div className="text-[9px] font-black uppercase tracking-[.2em] text-white/30">
        Editor guidance
      </div>
      <h1 className="mt-3 text-[50px] font-black tracking-[-.065em]">
        SEO without guessing.
      </h1>
      <div className="mt-8 space-y-3">
        {[
          "Each published update receives its own canonical /updates/[slug] URL and Article/NewsArticle/BlogPosting JSON-LD.",
          "Google recommends representative 16:9, 4:3 and 1:1 images; StayKnown Strict SEO blocks publication until all three are supplied.",
          "Each representative image should be crawlable/indexable and at least 50,000 pixels by width × height.",
          "Headlines should be concise, but Google does not impose the old 110-character Article headline limit.",
          "Google may build snippets from the visible page content; do not keyword-stuff meta descriptions.",
          "Draft and admin surfaces stay noindex. Published content is index/follow and is added to /updates/sitemap.xml and RSS.",
          "Write original, people-first updates. Technical SEO cannot compensate for thin, copied or misleading content.",
        ].map((x, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 p-4 text-[11px] font-semibold leading-5 text-white/52"
          >
            {i + 1}. {x}
          </div>
        ))}
      </div>
    </div>
  );
}
function AdminSettings({ api }: any) {
  const [email, setEmail] = useState(""),
    [role, setRole] = useState("editor"),
    [note, setNote] = useState("");
  async function add() {
    const r = await api("/api/admin/updates/admins", {
      method: "POST",
      body: JSON.stringify({ email, role }),
    });
    const j = await r.json();
    setNote(
      r.ok
        ? `Added ${j.admin.email} as ${j.admin.role}.`
        : j.error || "Could not add admin.",
    );
  }
  return (
    <div className="max-w-2xl">
      <div className="text-[9px] font-black uppercase tracking-[.2em] text-white/30">
        Access
      </div>
      <h1 className="mt-3 text-[48px] font-black tracking-[-.065em]">
        Updates administrators.
      </h1>
      <p className="mt-4 text-[12px] font-semibold leading-6 text-white/42">
        The owner can add as many approved emails as needed. They still sign in
        through Supabase Auth; being signed in alone never grants admin access.
      </p>
      <div className="mt-7 rounded-[28px] border border-white/10 p-5">
        <input
          className="input"
          placeholder="another-admin@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select
          className="input mt-3"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="editor">Editor</option>
          <option value="analyst">Analyst</option>
          <option value="admin">Admin</option>
          <option value="owner">Owner</option>
        </select>
        <button
          onClick={add}
          className="mt-3 rounded-full bg-white px-5 py-3 text-[10px] font-black text-black transition hover:scale-105 active:scale-95"
        >
          Add approved email
        </button>
        {note ? (
          <div className="mt-3 text-[10px] font-bold text-white/45">{note}</div>
        ) : null}
      </div>
    </div>
  );
}
