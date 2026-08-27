"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";

import {
  ANIMATION_PRESETS,
  DEFAULT_UPDATE_PRESENTATION,
  UPDATE_CATEGORIES,
  getUpdatePresentation,
  type UpdateBlock,
  withUpdatePresentation,
} from "@/lib/stayknown-updates";
import { inspectSeo, type SeoIssue } from "@/lib/stayknown-updates-seo";

const supabaseBrowserUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseBrowserKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const sb = createClient(supabaseBrowserUrl!, supabaseBrowserKey!);

function blankPost() {
  return {
    id: "",
    slug: "",
    status: "draft",
    article_type: "Article",
    category: "Product",
    kicker: "",
    title: "",
    summary: "",
    body: [
      { type: "presentation", ...DEFAULT_UPDATE_PRESENTATION },
      {
        type: "paragraph",
        text: "",
        size: "standard",
        weight: "regular",
        align: "left",
      },
    ] as UpdateBlock[],
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
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function normalizePost(input: any) {
  const base = blankPost();
  const body = withUpdatePresentation(input?.body || base.body, {});
  return { ...base, ...input, body };
}

function createBlock(type: UpdateBlock["type"]): UpdateBlock | null {
  switch (type) {
    case "paragraph":
      return {
        type,
        text: "",
        size: "standard",
        weight: "regular",
        align: "left",
      };
    case "heading2":
      return { type, text: "", size: "standard", align: "left" };
    case "heading3":
      return { type, text: "", size: "standard", align: "left" };
    case "quote":
      return { type, text: "", size: "standard", align: "left" };
    case "callout":
      return { type, title: "", text: "", size: "standard" };
    case "image":
      return {
        type,
        url: "",
        alt: "",
        caption: "",
        width: "content",
        caption_size: "small",
        caption_align: "left",
      };
    case "link":
      return { type, label: "", url: "", size: "standard" };
    case "divider":
      return { type };
    case "presentation":
      return null;
  }
}

export default function UpdatesAdminClient() {
  const [session, setSession] = useState<any>(null);
  const [allowed, setAllowed] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [post, setPost] = useState<any>(() => blankPost());
  const [tab, setTab] = useState("Overview");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, nextSession) =>
      setSession(nextSession),
    );
    return () => subscription.unsubscribe();
  }, []);

  async function api(path: string, init: RequestInit = {}) {
    const token = (await sb.auth.getSession()).data.session?.access_token;
    return fetch(path, {
      ...init,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
        ...(init.headers || {}),
      },
    });
  }

  useEffect(() => {
    if (!session) return;

    api("/api/admin/updates/session").then(async (response) => {
      setAllowed(response.ok);
      if (!response.ok) return;

      const [postsResponse, analyticsResponse] = await Promise.all([
        api("/api/admin/updates/posts").then((item) => item.json()),
        api("/api/admin/updates/analytics").then((item) => item.json()),
      ]);
      setPosts(postsResponse.posts || []);
      setAnalytics(analyticsResponse);
    });
  }, [session]);

  async function login() {
    const email = (
      document.getElementById("sk-admin-email") as HTMLInputElement
    )?.value.trim();
    if (!email) return;

    setBusy(true);
    setNote("");

    try {
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${location.origin}/admin/updates` },
      });

      setNote(
        error
          ? error.message
          : "Check your email for the secure sign-in link.",
      );
    } catch (error) {
      console.error("updates_admin_login_failed", error);
      setNote(
        error instanceof Error
          ? `Could not reach secure sign-in: ${error.message}`
          : "Could not reach secure sign-in. Please retry.",
      );
    } finally {
      setBusy(false);
    }
  }

  const issues = useMemo(() => inspectSeo(post), [post]);
  const blockers = issues.filter((issue) => issue.level === "block").length;

  function set(key: string, value: any) {
    setPost((current: any) => ({
      ...current,
      [key]: value,
      ...(key === "title" && !current.id && !current.slug
        ? { slug: slugify(value) }
        : {}),
    }));
  }

  function setPresentation(key: string, value: string) {
    setPost((current: any) => ({
      ...current,
      body: withUpdatePresentation(current.body, { [key]: value }),
    }));
  }

  function updateBlock(index: number, key: string, value: string) {
    setPost((current: any) => ({
      ...current,
      body: current.body.map((block: any, blockIndex: number) =>
        blockIndex === index ? { ...block, [key]: value } : block,
      ),
    }));
  }

  function addBlock(type: UpdateBlock["type"]) {
    const next = createBlock(type);
    if (!next) return;
    setPost((current: any) => ({
      ...current,
      body: [...current.body, next],
    }));
  }

  function removeBlock(index: number) {
    setPost((current: any) => ({
      ...current,
      body: current.body.filter(
        (block: UpdateBlock, blockIndex: number) =>
          blockIndex !== index || block.type === "presentation",
      ),
    }));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    setPost((current: any) => {
      const body = [...current.body] as UpdateBlock[];
      const target = index + direction;

      if (
        index < 0 ||
        target < 0 ||
        target >= body.length ||
        body[index]?.type === "presentation" ||
        body[target]?.type === "presentation"
      ) {
        return current;
      }

      [body[index], body[target]] = [body[target], body[index]];
      return { ...current, body };
    });
  }

  async function imageMeta() {
    const pairs = [
      ["16:9", post.image_16_9_url],
      ["4:3", post.image_4_3_url],
      ["1:1", post.image_1_1_url],
    ] as const;
    const output: Record<string, { width: number; height: number }> = {};

    await Promise.all(
      pairs.map(
        ([label, url]) =>
          new Promise<void>((resolve) => {
            if (!url) return resolve();
            const img = new Image();
            img.onload = () => {
              output[label] = {
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

    return output;
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
    const response = await api(url, {
      method: post.id ? "PUT" : "POST",
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    setBusy(false);

    if (!response.ok) {
      setNote(
        result.error === "seo_blocked"
          ? `Publishing blocked: ${(result.issues || [])
              .filter((item: any) => item.level === "block")
              .map((item: any) => item.message)
              .join(" · ")}`
          : result.error || "Save failed",
      );
      return;
    }

    setPost(normalizePost(result.post));
    setPosts(
      await api("/api/admin/updates/posts")
        .then((item) => item.json())
        .then((item) => item.posts || []),
    );
    setNote(status === "published" ? "Published successfully." : "Saved.");
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black px-4 py-20 text-white">
        <div className="mx-auto max-w-[430px] rounded-[32px] border border-white/[0.12] bg-white/[0.025] p-7">
          <div className="text-[9px] font-black uppercase tracking-[0.22em] text-white/[0.34]">
            StayKnown private publishing
          </div>
          <h1 className="mt-3 text-[42px] font-black tracking-[-0.06em]">
            Updates Admin.
          </h1>
          <p className="mt-4 text-[12px] font-semibold leading-6 text-white/[0.48]">
            Use the same approved Supabase Auth email. Access still requires the
            Updates admin allowlist.
          </p>
          <input
            id="sk-admin-email"
            type="email"
            defaultValue="6clementjoshua@gmail.com"
            className="mt-7 w-full rounded-2xl border border-white/[0.14] bg-black px-4 py-3 text-[13px] outline-none focus:border-white/[0.4]"
          />
          <button
            type="button"
            onClick={login}
            disabled={busy}
            className="mt-3 w-full rounded-2xl bg-white px-4 py-3 text-[11px] font-black text-black transition hover:scale-[1.01] active:scale-[0.98]"
          >
            {busy ? "Sending…" : "Email me a secure sign-in link"}
          </button>
          {note ? (
            <p className="mt-4 text-[11px] font-semibold text-white/[0.5]">
              {note}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-xl text-[14px] font-bold">
          This signed-in email is not authorized for StayKnown Updates.
        </div>
      </div>
    );
  }

  const tabs = ["Overview", "Posts", "Media", "Analytics", "SEO", "Settings"];

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-30 border-b border-white/[0.1] bg-black/[0.9] px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1380px] items-center justify-between gap-4">
          <div className="text-[10px] font-black tracking-[0.18em]">
            STAYKNOWN <span className="text-white/[0.35]">UPDATES ADMIN</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full border px-3 py-2 text-[9px] font-black ${
                blockers
                  ? "border-white/[0.22] text-white/[0.55]"
                  : "border-white/[0.15] text-white/[0.4]"
              }`}
            >
              {blockers
                ? `${blockers} SEO BLOCKER${blockers > 1 ? "S" : ""}`
                : "SEO READY"}
            </span>
            <button
              type="button"
              onClick={() => {
                setPost(blankPost());
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
        <aside className="border-r border-white/[0.08] p-4">
          <div className="flex gap-2 overflow-x-auto lg:block">
            {tabs.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => setTab(item)}
                className={`mb-1 w-full rounded-xl px-3 py-2.5 text-left text-[10px] font-black transition ${
                  tab === item
                    ? "bg-white text-black"
                    : "text-white/[0.42] hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </aside>

        <section className="min-w-0 p-4 sm:p-7">
          {tab === "Posts" ? (
            <div className="grid gap-6 xl:grid-cols-[0.34fr_0.66fr]">
              <div className="rounded-[28px] border border-white/[0.1] p-3">
                <div className="px-2 pb-3 text-[9px] font-black uppercase tracking-[0.2em] text-white/[0.3]">
                  Posts
                </div>
                {posts.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setPost(normalizePost(item))}
                    className="mb-2 w-full rounded-2xl border border-white/[0.08] p-3 text-left transition hover:border-white/[0.22]"
                  >
                    <div className="text-[9px] font-black uppercase text-white/[0.28]">
                      {item.status} · {item.category}
                    </div>
                    <div className="mt-1 text-[12px] font-black leading-tight">
                      {item.title}
                    </div>
                  </button>
                ))}
              </div>

              <Editor
                post={post}
                set={set}
                setPresentation={setPresentation}
                updateBlock={updateBlock}
                addBlock={addBlock}
                removeBlock={removeBlock}
                moveBlock={moveBlock}
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
  setPresentation,
  updateBlock,
  addBlock,
  removeBlock,
  moveBlock,
  issues,
  save,
  busy,
  note,
}: any) {
  const presentation = getUpdatePresentation(post.body || []);
  const visible = (post.body || []).filter(
    (block: UpdateBlock) => block.type !== "presentation",
  );

  return (
    <div className="rounded-[32px] border border-white/[0.1] p-4 sm:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Category">
          <select
            value={post.category}
            onChange={(event) => set("category", event.target.value)}
            className="input"
          >
            {UPDATE_CATEGORIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>

        <Field label="Article schema">
          <select
            value={post.article_type}
            onChange={(event) => set("article_type", event.target.value)}
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
          onChange={(event) => set("kicker", event.target.value)}
        />
      </Field>

      <Field label="Headline">
        <textarea
          className="input min-h-24"
          value={post.title}
          onChange={(event) => set("title", event.target.value)}
        />
      </Field>

      <Field label="Slug / permanent URL">
        <input
          className="input"
          value={post.slug}
          onChange={(event) => set("slug", slugify(event.target.value))}
        />
        <Hint>Canonical: /updates/{post.slug || "your-update"}</Hint>
      </Field>

      <Field label="Summary">
        <textarea
          className="input min-h-24"
          value={post.summary}
          onChange={(event) => set("summary", event.target.value)}
        />
      </Field>

      <section className="mt-6 rounded-[26px] border border-white/[0.1] bg-white/[0.02] p-4">
        <div className="text-[10px] font-black">Editorial typography</div>
        <div className="mt-1 max-w-2xl text-[9px] font-semibold leading-4 text-white/[0.35]">
          Controlled sizes keep every Update premium and responsive. These are
          editorial presets, not unrestricted pixel controls.
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <ControlSelect
            label="Headline"
            value={presentation.title_scale}
            options={[
              ["standard", "Standard"],
              ["feature", "Feature"],
            ]}
            onChange={(value) => setPresentation("title_scale", value)}
          />
          <ControlSelect
            label="Summary"
            value={presentation.summary_scale}
            options={[
              ["standard", "Standard"],
              ["large", "Large"],
            ]}
            onChange={(value) => setPresentation("summary_scale", value)}
          />
          <ControlSelect
            label="Kicker"
            value={presentation.kicker_scale}
            options={[
              ["standard", "Standard"],
              ["prominent", "Prominent"],
            ]}
            onChange={(value) => setPresentation("kicker_scale", value)}
          />
        </div>
      </section>

      <section className="mt-6 rounded-[26px] border border-white/[0.1] bg-white/[0.02] p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-black">Representative images</div>
            <div className="mt-1 text-[9px] font-semibold text-white/[0.35]">
              Strict SEO checks Google Article best-practice: crawlable 16:9,
              4:3 and 1:1 images, each ≥50K pixels.
            </div>
          </div>
          <label className="shrink-0 text-[9px] font-black">
            <input
              type="checkbox"
              checked={post.strict_seo}
              onChange={(event) => set("strict_seo", event.target.checked)}
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
              onChange={(event) => set(key, event.target.value)}
            />
          </Field>
        ))}

        <Field label="Image alt text">
          <input
            className="input"
            value={post.hero_alt_text || ""}
            onChange={(event) => set("hero_alt_text", event.target.value)}
          />
        </Field>
      </section>

      <section className="mt-7">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-[10px] font-black">Article body</div>
            <div className="mt-1 text-[9px] font-semibold text-white/[0.32]">
              Each block has controlled typography and layout options. Reorder
              or remove blocks without touching the rest of the article.
            </div>
          </div>
          <div className="text-[9px] font-black text-white/[0.3]">
            {visible.length} BLOCK{visible.length === 1 ? "" : "S"}
          </div>
        </div>

        {(post.body || []).map((block: UpdateBlock, index: number) =>
          block.type === "presentation" ? null : (
            <BlockEditor
              key={`${index}-${block.type}`}
              block={block}
              index={index}
              updateBlock={updateBlock}
              removeBlock={removeBlock}
              moveBlock={moveBlock}
              canMoveUp={index > 1}
              canMoveDown={index < post.body.length - 1}
            />
          ),
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["paragraph", "Paragraph"],
            ["heading2", "Heading 2"],
            ["heading3", "Heading 3"],
            ["quote", "Quote"],
            ["callout", "Callout"],
            ["image", "Image"],
            ["link", "Link"],
            ["divider", "Divider"],
          ].map(([type, label]) => (
            <button
              type="button"
              key={type}
              onClick={() => addBlock(type)}
              className="rounded-full border border-white/[0.12] px-3 py-2 text-[9px] font-black text-white/[0.45] transition hover:bg-white hover:text-black"
            >
              + {label}
            </button>
          ))}
        </div>
      </section>

      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <Field label="Animation / opening experience">
          <select
            className="input"
            value={post.animation_preset}
            onChange={(event) => set("animation_preset", event.target.value)}
          >
            {ANIMATION_PRESETS.map((item) => (
              <option key={item} value={item}>
                {item}
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
            onChange={(event) =>
              set(
                "scheduled_for",
                event.target.value
                  ? new Date(event.target.value).toISOString()
                  : "",
              )
            }
          />
        </Field>
      </div>

      <Field label="SEO title override (optional)">
        <input
          className="input"
          value={post.seo_title || ""}
          onChange={(event) => set("seo_title", event.target.value)}
        />
      </Field>

      <Field label="SEO description override (optional)">
        <textarea
          className="input min-h-20"
          value={post.seo_description || ""}
          onChange={(event) => set("seo_description", event.target.value)}
        />
      </Field>

      <SeoIssues issues={issues} />

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => save("draft")}
          className="rounded-full border border-white/[0.16] px-5 py-3 text-[10px] font-black transition hover:bg-white hover:text-black disabled:opacity-30"
        >
          Save draft
        </button>
        <button
          type="button"
          disabled={
            busy || issues.some((item: SeoIssue) => item.level === "block")
          }
          onClick={() => save(post.scheduled_for ? "scheduled" : "published")}
          className="rounded-full bg-white px-5 py-3 text-[10px] font-black text-black transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-25"
        >
          {post.scheduled_for ? "Schedule" : "Publish"}
        </button>
      </div>

      {note ? (
        <div className="mt-4 text-[11px] font-bold text-white/[0.52]">
          {note}
        </div>
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

function BlockEditor({
  block,
  index,
  updateBlock,
  removeBlock,
  moveBlock,
  canMoveUp,
  canMoveDown,
}: any) {
  const textBlock = [
    "paragraph",
    "heading2",
    "heading3",
    "quote",
    "callout",
  ].includes(block.type);

  return (
    <div className="mt-3 rounded-[22px] border border-white/[0.09] bg-white/[0.012] p-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[8px] font-black uppercase tracking-[0.16em] text-white/[0.36]">
          {blockLabel(block.type)}
        </div>
        <div className="flex items-center gap-1">
          <MiniButton
            label="↑"
            disabled={!canMoveUp}
            onClick={() => moveBlock(index, -1)}
          />
          <MiniButton
            label="↓"
            disabled={!canMoveDown}
            onClick={() => moveBlock(index, 1)}
          />
          <MiniButton
            label="Remove"
            danger
            onClick={() => removeBlock(index)}
          />
        </div>
      </div>

      {block.type === "callout" ? (
        <input
          className="input mt-3"
          placeholder="Callout label/title (optional)"
          value={block.title || ""}
          onChange={(event) => updateBlock(index, "title", event.target.value)}
        />
      ) : null}

      {textBlock ? (
        <textarea
          className="input mt-3 min-h-24"
          placeholder={textPlaceholder(block.type)}
          value={block.text || ""}
          onChange={(event) => updateBlock(index, "text", event.target.value)}
        />
      ) : null}

      {block.type === "image" ? (
        <>
          <input
            className="input mt-3"
            placeholder="Image HTTPS URL"
            value={block.url || ""}
            onChange={(event) => updateBlock(index, "url", event.target.value)}
          />
          <input
            className="input mt-2"
            placeholder="Alt text"
            value={block.alt || ""}
            onChange={(event) => updateBlock(index, "alt", event.target.value)}
          />
          <input
            className="input mt-2"
            placeholder="Caption (optional)"
            value={block.caption || ""}
            onChange={(event) =>
              updateBlock(index, "caption", event.target.value)
            }
          />
        </>
      ) : null}

      {block.type === "link" ? (
        <>
          <input
            className="input mt-3"
            placeholder="Button/link label"
            value={block.label || ""}
            onChange={(event) =>
              updateBlock(index, "label", event.target.value)
            }
          />
          <input
            className="input mt-2"
            placeholder="https://..."
            value={block.url || ""}
            onChange={(event) => updateBlock(index, "url", event.target.value)}
          />
        </>
      ) : null}

      {block.type !== "divider" ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {block.type === "paragraph" ? (
            <>
              <ControlSelect
                label="Text size"
                value={block.size || "standard"}
                options={[
                  ["compact", "Compact"],
                  ["standard", "Standard"],
                  ["large", "Large"],
                ]}
                onChange={(value) => updateBlock(index, "size", value)}
              />
              <ControlSelect
                label="Weight"
                value={block.weight || "regular"}
                options={[
                  ["regular", "Regular"],
                  ["medium", "Medium"],
                ]}
                onChange={(value) => updateBlock(index, "weight", value)}
              />
              <AlignmentControl
                block={block}
                index={index}
                updateBlock={updateBlock}
              />
            </>
          ) : null}

          {block.type === "heading2" ? (
            <>
              <ControlSelect
                label="Heading size"
                value={block.size || "standard"}
                options={[
                  ["standard", "Standard"],
                  ["large", "Large"],
                  ["display", "Display"],
                ]}
                onChange={(value) => updateBlock(index, "size", value)}
              />
              <AlignmentControl
                block={block}
                index={index}
                updateBlock={updateBlock}
              />
            </>
          ) : null}

          {block.type === "heading3" ? (
            <>
              <ControlSelect
                label="Heading size"
                value={block.size || "standard"}
                options={[
                  ["standard", "Standard"],
                  ["large", "Large"],
                ]}
                onChange={(value) => updateBlock(index, "size", value)}
              />
              <AlignmentControl
                block={block}
                index={index}
                updateBlock={updateBlock}
              />
            </>
          ) : null}

          {block.type === "quote" ? (
            <>
              <ControlSelect
                label="Quote size"
                value={block.size || "standard"}
                options={[
                  ["standard", "Standard"],
                  ["emphasis", "Emphasis"],
                ]}
                onChange={(value) => updateBlock(index, "size", value)}
              />
              <AlignmentControl
                block={block}
                index={index}
                updateBlock={updateBlock}
              />
            </>
          ) : null}

          {block.type === "callout" ? (
            <ControlSelect
              label="Callout size"
              value={block.size || "standard"}
              options={[
                ["standard", "Standard"],
                ["emphasis", "Emphasis"],
              ]}
              onChange={(value) => updateBlock(index, "size", value)}
            />
          ) : null}

          {block.type === "image" ? (
            <>
              <ControlSelect
                label="Image width"
                value={block.width || "content"}
                options={[
                  ["content", "Content"],
                  ["wide", "Wide"],
                  ["full", "Full article"],
                ]}
                onChange={(value) => updateBlock(index, "width", value)}
              />
              <ControlSelect
                label="Caption size"
                value={block.caption_size || "small"}
                options={[
                  ["small", "Small"],
                  ["standard", "Standard"],
                ]}
                onChange={(value) => updateBlock(index, "caption_size", value)}
              />
              <ControlSelect
                label="Caption align"
                value={block.caption_align || "left"}
                options={[
                  ["left", "Left"],
                  ["center", "Center"],
                ]}
                onChange={(value) => updateBlock(index, "caption_align", value)}
              />
            </>
          ) : null}

          {block.type === "link" ? (
            <ControlSelect
              label="Link size"
              value={block.size || "standard"}
              options={[
                ["compact", "Compact"],
                ["standard", "Standard"],
              ]}
              onChange={(value) => updateBlock(index, "size", value)}
            />
          ) : null}
        </div>
      ) : (
        <div className="mt-3 text-[9px] font-semibold text-white/[0.3]">
          Divider spacing and line weight are controlled automatically.
        </div>
      )}
    </div>
  );
}

function AlignmentControl({ block, index, updateBlock }: any) {
  return (
    <ControlSelect
      label="Alignment"
      value={block.align || "left"}
      options={[
        ["left", "Left"],
        ["center", "Center"],
      ]}
      onChange={(value) => updateBlock(index, "align", value)}
    />
  );
}

function ControlSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block rounded-[14px] border border-white/[0.08] bg-black p-2.5">
      <span className="mb-1.5 block text-[7px] font-black uppercase tracking-[0.15em] text-white/[0.3]">
        {label}
      </span>
      <select
        className="w-full bg-black text-[10px] font-bold text-white outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map(([optionValue, optionLabel]: [string, string]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function MiniButton({ label, onClick, disabled = false, danger = false }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full border px-2.5 py-1.5 text-[8px] font-black transition disabled:cursor-not-allowed disabled:opacity-20 ${
        danger
          ? "border-white/[0.12] text-white/[0.38] hover:border-white/[0.3] hover:text-white"
          : "border-white/[0.1] text-white/[0.42] hover:bg-white hover:text-black"
      }`}
    >
      {label}
    </button>
  );
}

function blockLabel(type: string) {
  return (
    {
      paragraph: "Paragraph",
      heading2: "Heading 2",
      heading3: "Heading 3",
      quote: "Quote",
      callout: "Callout",
      image: "Image",
      link: "Link",
      divider: "Divider",
    }[type] || type
  );
}

function textPlaceholder(type: string) {
  if (type === "heading2" || type === "heading3") return "Heading text";
  if (type === "quote") return "Quote text";
  if (type === "callout") return "Callout text";
  return "Paragraph text";
}

function Field({ label, children }: { label: string; children: any }) {
  return (
    <label className="mt-4 block">
      <span className="mb-2 block text-[8px] font-black uppercase tracking-[0.17em] text-white/[0.3]">
        {label}
      </span>
      {children}
    </label>
  );
}

function Hint({ children }: { children: any }) {
  return (
    <div className="mt-2 text-[9px] font-semibold leading-4 text-white/[0.28]">
      {children}
    </div>
  );
}

function SeoIssues({ issues }: { issues: SeoIssue[] }) {
  return (
    <div className="mt-7 rounded-[28px] border border-white/[0.12] p-4">
      <div className="text-[10px] font-black">SEO QUALITY GATE</div>
      <div className="mt-1 text-[9px] font-semibold text-white/[0.35]">
        Blocks stop publication. Warnings and hints teach the editor without
        pretending every recommendation is a Google requirement.
      </div>
      <div className="mt-4 space-y-2">
        {issues.map((item, index) => (
          <div
            key={`${item.code}-${index}`}
            className={`rounded-2xl border p-3 text-[10px] font-semibold leading-5 ${
              item.level === "block"
                ? "border-white/[0.25] bg-white/[0.07] text-white"
                : item.level === "warning"
                  ? "border-white/[0.13] text-white/[0.55]"
                  : "border-white/[0.08] text-white/[0.35]"
            }`}
          >
            <b className="mr-2 uppercase">{item.level}</b>
            {item.message}
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
  const published = posts.filter((item) => item.status === "published").length;
  const drafts = posts.filter((item) => item.status === "draft").length;

  return (
    <div>
      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/[0.3]">
        {tab}
      </div>
      <h1 className="mt-3 text-[48px] font-black tracking-[-0.065em]">
        Publishing control.
      </h1>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          [posts.length, "All posts"],
          [published, "Published"],
          [drafts, "Drafts"],
        ].map(([count, label]) => (
          <div
            key={String(label)}
            className="rounded-[26px] border border-white/[0.1] p-5"
          >
            <div className="text-[40px] font-black tracking-[-0.06em]">
              {count}
            </div>
            <div className="text-[9px] font-black uppercase tracking-[0.16em] text-white/[0.3]">
              {label}
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
          {(analytics?.posts || []).map((item: any) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl border border-white/[0.09] p-3 text-[10px]"
            >
              <span className="max-w-[70%] font-bold text-white/[0.6]">
                {item.title}
              </span>
              <span className="font-black tabular-nums text-white/[0.38]">
                {Number(item.views || 0).toLocaleString()} views ·{" "}
                {Number(item.likes || 0).toLocaleString()} likes
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-8 max-w-xl text-[12px] font-semibold leading-6 text-white/[0.38]">
          Views reuse StayKnown&apos;s existing privacy-preserving route
          counter. Likes are stored as aggregate counts with a one-way server
          HMAC browser token.
        </p>
      )}
    </div>
  );
}

function SeoGuide() {
  const guidance = [
    "Each published update receives its own canonical /updates/[slug] URL and Article/NewsArticle/BlogPosting JSON-LD.",
    "Google recommends representative 16:9, 4:3 and 1:1 images; StayKnown Strict SEO blocks publication until all three are supplied.",
    "Each representative image should be crawlable/indexable and at least 50,000 pixels by width × height.",
    "Headlines should be concise, but Google does not impose the old 110-character Article headline limit.",
    "Google may build snippets from the visible page content; do not keyword-stuff meta descriptions.",
    "Draft and admin surfaces stay noindex. Published content is index/follow and is added to /updates/sitemap.xml and RSS.",
    "Write original, people-first updates. Technical SEO cannot compensate for thin, copied or misleading content.",
  ];

  return (
    <div className="max-w-3xl">
      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/[0.3]">
        Editor guidance
      </div>
      <h1 className="mt-3 text-[50px] font-black tracking-[-0.065em]">
        SEO without guessing.
      </h1>
      <div className="mt-8 space-y-3">
        {guidance.map((item, index) => (
          <div
            key={item}
            className="rounded-2xl border border-white/[0.1] p-4 text-[11px] font-semibold leading-5 text-white/[0.52]"
          >
            {index + 1}. {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminSettings({ api }: any) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [note, setNote] = useState("");

  async function add() {
    const response = await api("/api/admin/updates/admins", {
      method: "POST",
      body: JSON.stringify({ email, role }),
    });
    const result = await response.json();
    setNote(
      response.ok
        ? `Added ${result.admin.email} as ${result.admin.role}.`
        : result.error || "Could not add admin.",
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/[0.3]">
        Access
      </div>
      <h1 className="mt-3 text-[48px] font-black tracking-[-0.065em]">
        Updates administrators.
      </h1>
      <p className="mt-4 text-[12px] font-semibold leading-6 text-white/[0.42]">
        The owner can add as many approved emails as needed. They still sign in
        through Supabase Auth; being signed in alone never grants admin access.
      </p>
      <div className="mt-7 rounded-[28px] border border-white/[0.1] p-5">
        <input
          className="input"
          placeholder="another-admin@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <select
          className="input mt-3"
          value={role}
          onChange={(event) => setRole(event.target.value)}
        >
          <option value="editor">Editor</option>
          <option value="analyst">Analyst</option>
          <option value="admin">Admin</option>
          <option value="owner">Owner</option>
        </select>
        <button
          type="button"
          onClick={add}
          className="mt-3 rounded-full bg-white px-5 py-3 text-[10px] font-black text-black transition hover:scale-105 active:scale-95"
        >
          Add approved email
        </button>
        {note ? (
          <div className="mt-3 text-[10px] font-bold text-white/[0.45]">
            {note}
          </div>
        ) : null}
      </div>
    </div>
  );
}
