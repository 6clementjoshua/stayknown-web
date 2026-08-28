"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  ANIMATION_PRESETS,
  DEFAULT_UPDATE_PRESENTATION,
  UPDATE_CATEGORIES,
  getUpdatePresentation,
  type UpdateBlock,
  withUpdatePresentation,
} from "@/lib/stayknown-updates";
import { inspectSeo, type SeoIssue } from "@/lib/stayknown-updates-seo";
import { UpdateBlocks } from "@/components/updates/UpdateBlocks";

const UPDATES_MEDIA_BUCKET = "stayknown-updates-media";
const MAX_UPDATES_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_UPDATES_VIDEO_BYTES = 250 * 1024 * 1024;
const MAX_UPDATES_AUDIO_BYTES = 100 * 1024 * 1024;
const MAX_UPDATES_FILE_BYTES = 50 * 1024 * 1024;

const REPRESENTATIVE_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

const ARTICLE_IMAGE_TYPES = [
  ...REPRESENTATIVE_IMAGE_TYPES,
  "image/gif",
] as const;

const VIDEO_TYPES = ["video/mp4", "video/webm"] as const;
const AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp4",
  "audio/aac",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
] as const;
const DOCUMENT_TYPES = [
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
] as const;

const ACCEPTED_UPDATES_MEDIA_TYPES = new Set<string>([
  ...ARTICLE_IMAGE_TYPES,
  ...VIDEO_TYPES,
  ...AUDIO_TYPES,
  ...DOCUMENT_TYPES,
]);

type UpdatesMediaPurpose =
  | "representative-16-9"
  | "representative-4-3"
  | "representative-1-1"
  | "article-body"
  | "media-library";

type MediaUploadResult = {
  url: string;
  mimeType: string;
  sizeBytes: number;
  name: string;
};

const storageBrowserUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const storageBrowserKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const storageBrowser =
  storageBrowserUrl && storageBrowserKey
    ? createClient(storageBrowserUrl, storageBrowserKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      })
    : null;

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
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+/g, "")
    .slice(0, 120);
}

function finalizeSlug(value: string) {
  return slugify(value).replace(/-+$/g, "");
}

function normalizePost(input: any) {
  const base = blankPost();
  const body = withUpdatePresentation(input?.body || base.body, {});
  const normalized = { ...base, ...input, body };
  const slug = String(normalized.slug || "").trim();

  return {
    ...normalized,
    canonical_path: slug ? `/updates/${slug}` : "",
  };
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
    case "video":
      return {
        type,
        url: "",
        poster_url: "",
        caption: "",
        width: "wide",
      };
    case "audio":
      return {
        type,
        url: "",
        title: "",
        caption: "",
      };
    case "file":
      return {
        type,
        url: "",
        label: "",
        mime_type: "",
        size_bytes: 0,
      };
    case "link":
      return { type, label: "", url: "", size: "standard" };
    case "divider":
      return { type };
    case "presentation":
      return null;
  }
}

type PostListFilter = "all" | "draft" | "published" | "scheduled";
type OverviewLibraryFilter = PostListFilter | "deleted";
type AutosaveState = "idle" | "dirty" | "saving" | "saved" | "retrying";

type PublishIntent = "published" | "scheduled";

type PublicationVerificationCheck = {
  key: string;
  label: string;
  ok: boolean;
  detail: string;
};

type PublicationVerification = {
  ok: boolean;
  publicUrl: string;
  checkedAt: string;
  views: number;
  likes: number;
  checks: PublicationVerificationCheck[];
};

type PublishFeedbackKind =
  "checking" | "blocked" | "ready" | "error" | "published";

type PublishFeedback = {
  kind: PublishFeedbackKind;
  title: string;
  detail?: string;
  issues?: SeoIssue[];
};

type PreparedUpdateEmail = {
  ok?: boolean;
  error?: string;
  open_url?: string;
  campaign_id?: string;
  reused?: boolean;
  already_sent?: boolean;
  campaign_status?: string;
};

const EDITABLE_POST_KEYS = [
  "slug",
  "status",
  "article_type",
  "category",
  "kicker",
  "title",
  "summary",
  "body",
  "hero_image_url",
  "image_16_9_url",
  "image_4_3_url",
  "image_1_1_url",
  "hero_alt_text",
  "author_name",
  "author_url",
  "seo_title",
  "seo_description",
  "canonical_path",
  "animation_preset",
  "featured",
  "strict_seo",
  "scheduled_for",
  "published_at",
] as const;

function editablePostSnapshot(input: any): string {
  const output: Record<string, unknown> = {};

  for (const key of EDITABLE_POST_KEYS) {
    output[key] = input?.[key] ?? null;
  }

  return JSON.stringify(output);
}

function hasMeaningfulDraftContent(input: any): boolean {
  if (!input) return false;

  if (
    [
      input.title,
      input.summary,
      input.kicker,
      input.slug,
      input.hero_image_url,
      input.image_16_9_url,
      input.image_4_3_url,
      input.image_1_1_url,
      input.seo_title,
      input.seo_description,
    ].some((value) => String(value || "").trim())
  ) {
    return true;
  }

  return (Array.isArray(input.body) ? input.body : []).some((block: any) => {
    if (!block || block.type === "presentation" || block.type === "divider") {
      return false;
    }

    return [
      block.text,
      block.title,
      block.label,
      block.url,
      block.alt,
      block.caption,
    ].some((value) => String(value || "").trim());
  });
}

function formatAdminDate(value?: string | null): string {
  if (!value) return "Not saved yet";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not saved yet";

  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSavedTime(value?: string | null): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sortPostsForLibrary(
  items: any[],
  filter: OverviewLibraryFilter,
): any[] {
  const value = (item: any) => {
    if (filter === "draft")
      return new Date(item.updated_at || item.created_at || 0).getTime();
    if (filter === "published")
      return new Date(item.published_at || item.created_at || 0).getTime();
    if (filter === "scheduled")
      return new Date(item.scheduled_for || item.created_at || 0).getTime();
    if (filter === "deleted") return new Date(item.deleted_at || 0).getTime();
    return new Date(item.created_at || 0).getTime();
  };

  return [...items].sort((a, b) => value(b) - value(a));
}

function firstPreviewMedia(item: any): {
  kind: "image" | "video" | "audio" | "file" | "none";
  url: string;
  poster?: string;
  label?: string;
} {
  const blocks = Array.isArray(item?.body) ? item.body : [];
  const rich = blocks.find(
    (block: any) =>
      ["video", "image", "audio", "file"].includes(block?.type) &&
      String(block?.url || "").trim(),
  );

  if (rich?.type === "video") {
    return {
      kind: "video",
      url: String(rich.url),
      poster:
        String(rich.poster_url || "") ||
        String(item.image_16_9_url || item.hero_image_url || ""),
    };
  }

  if (rich?.type === "audio") {
    return {
      kind: "audio",
      url: String(rich.url),
      label: rich.title || "Audio",
    };
  }

  if (rich?.type === "file") {
    return { kind: "file", url: String(rich.url), label: rich.label || "File" };
  }

  const image =
    (rich?.type === "image" && String(rich.url || "")) ||
    String(
      item.image_16_9_url ||
        item.hero_image_url ||
        item.image_4_3_url ||
        item.image_1_1_url ||
        "",
    );

  return image ? { kind: "image", url: image } : { kind: "none", url: "" };
}

function isPubliclyOpenable(item: any): boolean {
  if (!item || item.deleted_at) return false;
  if (item.status === "published") return true;
  if (item.status === "scheduled" && item.scheduled_for) {
    return new Date(item.scheduled_for).getTime() <= Date.now();
  }
  return false;
}

function seoIssueFix(issue: SeoIssue): string {
  const code = String(issue.code || "");

  if (code === "title_missing") return "Enter the Headline field.";
  if (code === "slug_invalid")
    return "Set a lowercase URL slug using letters, numbers and hyphens only.";
  if (code === "slug_temporary")
    return "Replace the draft-* slug with the final permanent public URL slug.";
  if (code === "summary_missing") return "Complete the Summary field.";
  if (code === "category_missing")
    return "Choose the correct publication Category.";
  if (code === "author_missing")
    return "Complete the Author / publisher field.";
  if (code === "body_missing")
    return "Add real content in Article Body before publishing.";
  if (code === "canonical_mismatch")
    return "Use the canonical path generated from the final slug.";
  if (code === "alt_missing") return "Add Representative image alt text.";
  if (code === "inline_alt_missing")
    return "Find the Article Body image without alt text and describe that image.";
  if (code.includes("image_16:9_missing"))
    return "Upload the 16:9 representative image.";
  if (code.includes("image_4:3_missing"))
    return "Upload the 4:3 representative image.";
  if (code.includes("image_1:1_missing"))
    return "Upload the 1:1 representative image.";
  if (code.includes("_small"))
    return "Replace that representative image with a larger image of the same required ratio.";
  if (code.includes("_ratio"))
    return "Crop or replace the image so it matches the named representative-image ratio.";
  if (code.includes("_https"))
    return "Use a public HTTPS image uploaded through the Updates media uploader.";
  if (code === "thin_content")
    return "Consider adding more original information if readers need more context.";
  if (code === "title_long")
    return "Shorten the headline if possible while keeping it accurate.";
  if (code === "description_long")
    return "Tighten the Summary so the main point appears earlier.";
  if (code === "description_short")
    return "Consider making the Summary more descriptive.";
  if (code === "link_scheme")
    return "Review the flagged link and use HTTPS or a valid internal / path.";

  return issue.level === "block"
    ? "Correct this item before publishing."
    : issue.level === "warning"
      ? "Review this recommendation before publishing."
      : "Optional quality guidance.";
}

export default function UpdatesAdminClient() {
  const [authState, setAuthState] = useState<
    "checking" | "signed-out" | "allowed" | "denied"
  >("checking");
  const [allowed, setAllowed] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [deletedPosts, setDeletedPosts] = useState<any[]>([]);
  const [overviewFilter, setOverviewFilter] =
    useState<OverviewLibraryFilter | null>(null);
  const [previewPost, setPreviewPost] = useState<any | null>(null);
  const [publishIntent, setPublishIntent] = useState<PublishIntent | null>(
    null,
  );
  const [verification, setVerification] =
    useState<PublicationVerification | null>(null);
  const [verificationBusy, setVerificationBusy] = useState(false);
  const [publishPreflightBusy, setPublishPreflightBusy] = useState(false);
  const [publishFeedback, setPublishFeedback] =
    useState<PublishFeedback | null>(null);

  const [analytics, setAnalytics] = useState<any>(null);
  const [post, setPost] = useState<any>(() => blankPost());
  const [tab, setTab] = useState("Overview");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [autosaveState, setAutosaveState] = useState<AutosaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState("");
  const [autosaveError, setAutosaveError] = useState("");
  const lastSavedSnapshotRef = useRef("");
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autosaveRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const autosaveRevisionRef = useRef(0);

  useEffect(() => {
    const url = new URL(window.location.href);
    const authResult = url.searchParams.get("auth");

    if (!authResult) return;

    const messages: Record<string, string> = {
      "invalid-link":
        "This publication-admin access link is incomplete. Request a new link.",
      "expired-or-invalid":
        "This publication-admin access link has expired or was already used. Request a new link.",
      "not-authorized":
        "This email is not authorized for StayKnown Updates & Publication Admin.",
      "identity-mismatch":
        "This publication-admin identity does not match the approved administrator record.",
      unavailable:
        "Updates & Publication Admin sign-in could not be completed. Request a fresh access link.",
    };

    if (messages[authResult]) {
      setNote(messages[authResult]);
    }

    url.searchParams.delete("auth");
    window.history.replaceState(
      {},
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, []);

  async function api(path: string, init: RequestInit = {}) {
    return fetch(path, {
      ...init,
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        "content-type": "application/json",
        ...(init.headers || {}),
      },
    });
  }

  function clearAutosaveTimers() {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    if (autosaveRetryTimerRef.current) {
      clearTimeout(autosaveRetryTimerRef.current);
      autosaveRetryTimerRef.current = null;
    }
  }

  function resetAutosaveTracking() {
    clearAutosaveTimers();
    autosaveRevisionRef.current += 1;
    lastSavedSnapshotRef.current = "";
    setAutosaveState("idle");
    setLastSavedAt("");
    setAutosaveError("");
  }

  async function refreshPosts() {
    const response = await api("/api/admin/updates/posts");
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.error || "Could not refresh publication posts.");
    }

    setPosts(payload.posts || []);
    setDeletedPosts(payload.deletedPosts || []);
    return payload.posts || [];
  }

  async function uploadMedia(
    file: File,
    purpose: UpdatesMediaPurpose,
  ): Promise<MediaUploadResult> {
    if (!storageBrowser) {
      throw new Error("Publication media storage is not configured.");
    }

    const representative = purpose.startsWith("representative-");
    const type = file.type.toLowerCase();

    if (
      representative &&
      !(REPRESENTATIVE_IMAGE_TYPES as readonly string[]).includes(type)
    ) {
      throw new Error("Representative images must be JPEG, PNG or WebP.");
    }

    if (!representative && !ACCEPTED_UPDATES_MEDIA_TYPES.has(type)) {
      throw new Error("This publication media type is not supported.");
    }

    const maxBytes = type.startsWith("video/")
      ? MAX_UPDATES_VIDEO_BYTES
      : type.startsWith("audio/")
        ? MAX_UPDATES_AUDIO_BYTES
        : (ARTICLE_IMAGE_TYPES as readonly string[]).includes(type)
          ? MAX_UPDATES_IMAGE_BYTES
          : MAX_UPDATES_FILE_BYTES;

    if (file.size <= 0 || file.size > maxBytes) {
      throw new Error(
        `This file is too large. Maximum for this media type is ${formatBytes(maxBytes)}.`,
      );
    }

    const ticketResponse = await api("/api/admin/updates/media/upload-url", {
      method: "POST",
      body: JSON.stringify({
        filename: file.name,
        mimeType: type,
        sizeBytes: file.size,
        purpose,
      }),
    });

    const ticket = (await ticketResponse.json().catch(() => ({}))) as {
      ok?: boolean;
      bucket?: string;
      path?: string;
      token?: string;
      publicUrl?: string;
      error?: string;
    };

    if (
      !ticketResponse.ok ||
      !ticket.path ||
      !ticket.token ||
      !ticket.publicUrl
    ) {
      throw new Error(
        ticket.error || "A secure media upload could not be prepared.",
      );
    }

    const { error: uploadError } = await storageBrowser.storage
      .from(ticket.bucket || UPDATES_MEDIA_BUCKET)
      .uploadToSignedUrl(ticket.path, ticket.token, file);

    if (uploadError) {
      throw new Error(`Media upload failed: ${uploadError.message}`);
    }

    return {
      url: ticket.publicUrl,
      mimeType: type,
      sizeBytes: file.size,
      name: file.name,
    };
  }

  async function uploadImage(
    file: File,
    purpose: UpdatesMediaPurpose,
  ): Promise<string> {
    const result = await uploadMedia(file, purpose);
    return result.url;
  }

  useEffect(() => {
    let active = true;

    async function loadAdminSession() {
      try {
        const response = await api("/api/admin/updates/session");

        if (!active) return;

        if (!response.ok) {
          setAllowed(false);
          setAuthState(response.status === 403 ? "denied" : "signed-out");
          return;
        }

        setAllowed(true);
        setAuthState("allowed");

        const [postsResponse, analyticsResponse] = await Promise.all([
          api("/api/admin/updates/posts").then((item) => item.json()),
          api("/api/admin/updates/analytics").then((item) => item.json()),
        ]);

        if (!active) return;

        setPosts(postsResponse.posts || []);
        setDeletedPosts(postsResponse.deletedPosts || []);
        setAnalytics(analyticsResponse);
      } catch (error) {
        console.error("updates_admin_session_check_failed", error);
        if (!active) return;
        setAllowed(false);
        setAuthState("signed-out");
      }
    }

    void loadAdminSession();

    return () => {
      active = false;
    };
  }, []);

  async function login() {
    const email = (
      document.getElementById("sk-admin-email") as HTMLInputElement
    )?.value.trim();
    if (!email) return;

    setBusy(true);
    setNote("");

    try {
      const response = await fetch("/api/admin/updates/request-login", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload.error ||
            `Secure sign-in request failed (${response.status}).`,
        );
      }

      setNote(
        payload.message || "Check your email for the secure sign-in link.",
      );
    } catch (error) {
      console.error("updates_admin_login_failed", error);
      setNote(
        error instanceof Error
          ? `Could not request secure sign-in: ${error.message}`
          : "Could not request secure sign-in. Please retry.",
      );
    } finally {
      setBusy(false);
    }
  }

  const issues = useMemo(() => inspectSeo(post), [post]);
  const blockers = issues.filter((issue) => issue.level === "block").length;

  function set(key: string, value: any) {
    setPublishFeedback(null);
    setPost((current: any) => {
      const next = {
        ...current,
        [key]: value,
      };

      if (key === "slug") {
        const nextSlug = String(value || "").trim();
        next.canonical_path = nextSlug ? `/updates/${nextSlug}` : "";
      }

      if (key === "title" && !current.id && !current.slug) {
        const generatedSlug = slugify(String(value || ""));
        next.slug = generatedSlug;
        next.canonical_path = generatedSlug ? `/updates/${generatedSlug}` : "";
      }

      return next;
    });
  }

  function setPresentation(key: string, value: string) {
    setPublishFeedback(null);
    setPost((current: any) => ({
      ...current,
      body: withUpdatePresentation(current.body, { [key]: value }),
    }));
  }

  function updateBlock(index: number, key: string, value: string) {
    setPublishFeedback(null);
    setPost((current: any) => ({
      ...current,
      body: current.body.map((block: any, blockIndex: number) =>
        blockIndex === index ? { ...block, [key]: value } : block,
      ),
    }));
  }

  function addBlock(type: UpdateBlock["type"]) {
    setPublishFeedback(null);
    const next = createBlock(type);
    if (!next) return;
    setPost((current: any) => ({
      ...current,
      body: [...current.body, next],
    }));
  }

  function removeBlock(index: number) {
    setPublishFeedback(null);
    setPost((current: any) => ({
      ...current,
      body: current.body.filter(
        (block: UpdateBlock, blockIndex: number) =>
          blockIndex !== index || block.type === "presentation",
      ),
    }));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    setPublishFeedback(null);
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

  async function saveDraftSnapshot(
    draft: any,
    revision: number,
    retryOnFailure: boolean,
  ): Promise<boolean> {
    if (!draft?.id || draft.status !== "draft") return false;

    const payload = {
      ...draft,
      status: "draft",
      canonical_path: draft.slug
        ? `/updates/${draft.slug}`
        : draft.canonical_path || "",
      imageMeta: {},
    };

    try {
      const response = await api(`/api/admin/updates/posts/${draft.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Draft autosave failed.");
      }

      const normalized = normalizePost(result.post);
      lastSavedSnapshotRef.current = editablePostSnapshot(normalized);

      setPosts((current) =>
        current.map((item) =>
          item.id === normalized.id ? { ...item, ...normalized } : item,
        ),
      );

      if (revision === autosaveRevisionRef.current) {
        setAutosaveState("saved");
        setLastSavedAt(
          normalized.updated_at ||
            result.post?.updated_at ||
            new Date().toISOString(),
        );
        setAutosaveError("");
      }

      return true;
    } catch (error) {
      if (revision !== autosaveRevisionRef.current) return false;

      const message =
        error instanceof Error ? error.message : "Draft autosave failed.";

      setAutosaveState(retryOnFailure ? "retrying" : "dirty");
      setAutosaveError(
        retryOnFailure
          ? `Save not completed. Retrying automatically… ${message}`
          : message,
      );

      if (retryOnFailure) {
        if (autosaveRetryTimerRef.current) {
          clearTimeout(autosaveRetryTimerRef.current);
        }

        autosaveRetryTimerRef.current = setTimeout(() => {
          if (revision !== autosaveRevisionRef.current) return;
          setAutosaveState("saving");
          void saveDraftSnapshot(draft, revision, true);
        }, 5000);
      }

      return false;
    }
  }

  useEffect(() => {
    if (!allowed || busy || !post.id || post.status !== "draft") return;

    const snapshot = editablePostSnapshot(post);

    if (!lastSavedSnapshotRef.current) {
      lastSavedSnapshotRef.current = snapshot;
      setAutosaveState("saved");
      setLastSavedAt(post.updated_at || post.created_at || "");
      return;
    }

    if (snapshot === lastSavedSnapshotRef.current) return;

    clearAutosaveTimers();
    const revision = ++autosaveRevisionRef.current;

    setAutosaveState("dirty");
    setAutosaveError("");

    autosaveTimerRef.current = setTimeout(() => {
      if (revision !== autosaveRevisionRef.current) return;
      setAutosaveState("saving");
      void saveDraftSnapshot(post, revision, true);
    }, 1200);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
    };
  }, [allowed, busy, post]);

  useEffect(() => {
    function protectUnsavedWork(event: BeforeUnloadEvent) {
      const existingDraftDirty =
        Boolean(post.id) &&
        post.status === "draft" &&
        editablePostSnapshot(post) !== lastSavedSnapshotRef.current;

      const unsavedNewPost = !post.id && hasMeaningfulDraftContent(post);

      if (!existingDraftDirty && !unsavedNewPost) return;

      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", protectUnsavedWork);
    return () => window.removeEventListener("beforeunload", protectUnsavedWork);
  }, [post]);

  async function safelyLeaveCurrentEditor(): Promise<boolean> {
    const existingDraftDirty =
      Boolean(post.id) &&
      post.status === "draft" &&
      editablePostSnapshot(post) !== lastSavedSnapshotRef.current;

    if (existingDraftDirty) {
      clearAutosaveTimers();
      const revision = ++autosaveRevisionRef.current;
      setAutosaveState("saving");
      const saved = await saveDraftSnapshot(post, revision, false);

      if (!saved) {
        setNote(
          "StayKnown kept this draft open because the latest changes could not be saved.",
        );
        return false;
      }
    }

    if (!post.id && hasMeaningfulDraftContent(post)) {
      return window.confirm(
        "This new Update has not been saved as a draft yet. Leave it and discard the unsaved content?",
      );
    }

    return true;
  }

  async function openPost(item: any) {
    if (item?.id === post.id) return;

    if (!(await safelyLeaveCurrentEditor())) return;

    const normalized = normalizePost(item);

    clearAutosaveTimers();
    autosaveRevisionRef.current += 1;
    lastSavedSnapshotRef.current = editablePostSnapshot(normalized);
    setAutosaveState(normalized.status === "draft" ? "saved" : "idle");
    setLastSavedAt(normalized.updated_at || normalized.created_at || "");
    setAutosaveError("");
    setNote("");
    setVerification(null);
    setPublishIntent(null);
    setPost(normalized);
  }

  async function startNewUpdate() {
    if (!(await safelyLeaveCurrentEditor())) return;

    resetAutosaveTracking();
    setVerification(null);
    setPublishIntent(null);
    setPost(blankPost());
    setTab("Posts");
    setNote("");
  }

  async function openPostFromOverview(item: any) {
    await openPost(item);
    if (item?.id) setTab("Posts");
  }

  async function runLibraryAction(
    action: "soft_delete" | "restore" | "permanent_delete",
    ids: string[],
    confirmation = "",
  ) {
    if (!ids.length) return { ok: true };

    const response = await api("/api/admin/updates/posts/actions", {
      method: "POST",
      body: JSON.stringify({ action, ids, confirmation }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok)
      throw new Error(result.error || "Publication action failed.");

    await refreshPosts();

    if (
      (action === "soft_delete" || action === "permanent_delete") &&
      ids.includes(post.id)
    ) {
      resetAutosaveTracking();
      setPost(blankPost());
    }

    return result;
  }

  async function verifyPublication(postId: string) {
    if (!postId) return null;

    setVerificationBusy(true);

    try {
      const response = await api(
        `/api/admin/updates/posts/${postId}/publish-check`,
      );
      const result = (await response.json().catch(() => ({}))) as
        PublicationVerification | { error?: string };

      if (!response.ok || !("checks" in result)) {
        throw new Error(
          ("error" in result && result.error) ||
            "Publication verification could not be completed.",
        );
      }

      setVerification(result);
      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Publication verification could not be completed.";

      setVerification({
        ok: false,
        publicUrl: post?.slug ? `/updates/${post.slug}` : "",
        checkedAt: new Date().toISOString(),
        views: 0,
        likes: Number(post?.like_count || 0),
        checks: [
          {
            key: "verification_service",
            label: "Publication verification",
            ok: false,
            detail: message,
          },
        ],
      });

      return null;
    } finally {
      setVerificationBusy(false);
    }
  }

  async function requestPublish(intent: PublishIntent) {
    if (busy || publishPreflightBusy) return;

    setPublishPreflightBusy(true);
    setPublishIntent(null);
    setNote("");
    setPublishFeedback({
      kind: "checking",
      title: "Checking publication requirements…",
      detail:
        "StayKnown is checking the current editor content before anything can go public.",
      issues: [],
    });

    try {
      if (intent === "scheduled") {
        const scheduled = post.scheduled_for
          ? new Date(post.scheduled_for).getTime()
          : Number.NaN;

        if (!Number.isFinite(scheduled) || scheduled <= Date.now()) {
          const scheduleIssue: SeoIssue = {
            level: "block",
            code: "schedule_invalid",
            message: "Schedule time is missing or is not in the future.",
          };
          setPublishFeedback({
            kind: "blocked",
            title: "This Update is not ready to schedule.",
            detail: "Fix the item below, then tap Review & Schedule again.",
            issues: [scheduleIssue],
          });
          return;
        }
      }

      const meta = await imageMeta();
      const response = await api(
        `/api/admin/updates/posts/${post.id || "new"}/preflight`,
        {
          method: "POST",
          body: JSON.stringify({
            ...post,
            imageMeta: meta,
            status: intent,
            canonical_path: post.slug ? `/updates/${post.slug}` : "",
          }),
        },
      );
      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        issues?: SeoIssue[];
      };

      if (!response.ok) {
        throw new Error(
          result.error || "Publication preflight could not be completed.",
        );
      }

      const checkedIssues = Array.isArray(result.issues) ? result.issues : [];
      const checkedBlockers = checkedIssues.filter(
        (item) => item.level === "block",
      );
      const checkedWarnings = checkedIssues.filter(
        (item) => item.level === "warning",
      );

      if (!result.ok || checkedBlockers.length > 0) {
        setPublishFeedback({
          kind: "blocked",
          title: `${checkedBlockers.length} publication blocker${checkedBlockers.length === 1 ? "" : "s"} found.`,
          detail:
            "Nothing was published. Fix every BLOCK item below, then run the check again.",
          issues: checkedIssues,
        });
        return;
      }

      setPublishFeedback({
        kind: "ready",
        title: "Publication check passed.",
        detail: checkedWarnings.length
          ? `${checkedWarnings.length} warning${checkedWarnings.length === 1 ? " remains" : "s remain"}. Warnings do not block publication, but review them before confirming.`
          : "No publication blockers or warnings were found.",
        issues: checkedIssues,
      });
      setPublishIntent(intent);
    } catch (error) {
      setPublishFeedback({
        kind: "error",
        title: "Publication check could not be completed.",
        detail:
          error instanceof Error
            ? error.message
            : "Please retry the publication check.",
        issues: [],
      });
    } finally {
      setPublishPreflightBusy(false);
    }
  }

  async function preparePublishedUpdateEmail(
    postId: string,
    popup: Window | null,
  ): Promise<boolean> {
    try {
      setNote("Preparing the Update email in StayKnown Mail Console…");

      const response = await api(
        `/api/admin/updates/posts/${encodeURIComponent(postId)}/email`,
        { method: "POST", body: JSON.stringify({}) },
      );
      const result = (await response
        .json()
        .catch(() => ({}))) as PreparedUpdateEmail;

      if (!response.ok) {
        if (result.already_sent) {
          if (popup && !popup.closed) {
            popup.location.href = "/mail-console/logs";
          }
          setNote(
            `Email distribution is already ${result.campaign_status || "active"} for this Update. StayKnown did not create a duplicate campaign. Mail Console Logs has the existing campaign.`,
          );
          return false;
        }

        if (popup && !popup.closed) popup.close();
        throw new Error(result.error || "Could not prepare the Update email.");
      }

      const openUrl = String(result.open_url || "").trim();
      if (!openUrl) {
        if (popup && !popup.closed) popup.close();
        throw new Error(
          "Mail Console draft was prepared, but no composer URL was returned.",
        );
      }

      setNote(
        result.reused
          ? "Update published. The existing linked email draft is reopening in Mail Console."
          : "Update published. A newsletter draft was prepared from this Update and is opening in Mail Console.",
      );

      if (popup && !popup.closed) {
        popup.location.href = openUrl;
      } else {
        window.location.href = openUrl;
      }

      return true;
    } catch (error) {
      if (popup && !popup.closed) popup.close();
      setNote(
        error instanceof Error
          ? `Update remains published. Email was not prepared: ${error.message}`
          : "Update remains published. Email was not prepared.",
      );
      return false;
    }
  }

  async function save(status?: string): Promise<any | null> {
    clearAutosaveTimers();
    autosaveRevisionRef.current += 1;

    setBusy(true);
    setNote("");

    try {
      const requestedStatus = status || post.status;

      if (requestedStatus === "scheduled") {
        const scheduled = post.scheduled_for
          ? new Date(post.scheduled_for).getTime()
          : Number.NaN;

        if (!Number.isFinite(scheduled) || scheduled <= Date.now()) {
          setNote(
            "Choose a future schedule time, or clear Schedule to publish immediately.",
          );
          return null;
        }
      }

      const meta = await imageMeta();
      const payload = {
        ...post,
        imageMeta: meta,
        status: status || post.status,
        canonical_path: post.slug ? `/updates/${post.slug}` : "",
      };
      const url = post.id
        ? `/api/admin/updates/posts/${post.id}`
        : "/api/admin/updates/posts";
      const response = await api(url, {
        method: post.id ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (result.error === "seo_blocked") {
          const serverIssues = Array.isArray(result.issues)
            ? result.issues
            : [];
          const serverBlockers = serverIssues.filter(
            (item: SeoIssue) => item.level === "block",
          );
          setPublishFeedback({
            kind: "blocked",
            title: `${serverBlockers.length} publication blocker${serverBlockers.length === 1 ? "" : "s"} found by the final server check.`,
            detail:
              "Nothing was published. Fix the BLOCK items below and try again.",
            issues: serverIssues,
          });
          setNote("");
        } else {
          setPublishFeedback({
            kind: "error",
            title: "Publication was not completed.",
            detail: result.error || "Save failed",
            issues: [],
          });
          setNote(result.error || "Save failed");
        }
        return null;
      }

      const normalized = normalizePost(result.post);
      lastSavedSnapshotRef.current = editablePostSnapshot(normalized);
      setPost(normalized);
      await refreshPosts();

      if (normalized.status === "draft") {
        setAutosaveState("saved");
        setLastSavedAt(normalized.updated_at || new Date().toISOString());
        setAutosaveError("");
        setVerification(null);
        setNote("Draft saved. Autosave is now active for this Update.");
      } else {
        setAutosaveState("idle");
        setLastSavedAt("");
        setAutosaveError("");

        if (normalized.status === "published") {
          setPublishFeedback({
            kind: "published",
            title: "Published successfully.",
            detail:
              "The Update is public. StayKnown is now verifying the main Updates page, article URL, metadata, sitemap, RSS, likes and analytics.",
            issues: [],
          });
          setNote(
            "Published. StayKnown is verifying the live publication now…",
          );
          await verifyPublication(normalized.id);
        } else {
          setVerification(null);
          setNote(
            `Scheduled successfully for ${new Intl.DateTimeFormat("en", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Africa/Lagos",
            }).format(new Date(normalized.scheduled_for))}.`,
          );
        }
      }

      return normalized;
    } catch (error) {
      setNote(error instanceof Error ? error.message : "Save failed");
      return null;
    } finally {
      setBusy(false);
    }
  }

  if (authState === "checking") {
    return (
      <div className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-xl text-[13px] font-bold text-white/[0.5]">
          Checking Updates & Publication Admin access…
        </div>
      </div>
    );
  }

  if (authState === "signed-out") {
    return (
      <div className="min-h-screen bg-black px-4 py-20 text-white">
        <div className="mx-auto max-w-[430px] rounded-[32px] border border-white/[0.12] bg-white/[0.025] p-7">
          <div className="text-[9px] font-black uppercase tracking-[0.22em] text-white/[0.34]">
            StayKnown Updates & Publication Admin
          </div>
          <h1 className="mt-3 text-[42px] font-black tracking-[-0.06em]">
            Updates Admin.
          </h1>
          <p className="mt-4 text-[12px] font-semibold leading-6 text-white/[0.48]">
            Authorized editorial access for StayKnown Updates, newsroom
            publishing, SEO review, media, analytics and publication controls.
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
            {busy ? "Sending…" : "Email Updates Admin access link"}
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

  if (authState === "denied" || !allowed) {
    return (
      <div className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-xl text-[14px] font-bold">
          This email is not authorized for StayKnown Updates & Publication
          Admin.
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
              onClick={() => void startNewUpdate()}
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
            <div className="mx-auto max-w-[980px]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setTab("Overview")}
                  className="rounded-full border border-white/[0.12] px-3 py-2 text-[9px] font-black text-white/[0.42] transition hover:bg-white hover:text-black"
                >
                  ← BACK TO PUBLICATION LIBRARY
                </button>
                {post.id ? (
                  <button
                    type="button"
                    onClick={() => setPreviewPost(normalizePost(post))}
                    className="rounded-full border border-white/[0.12] px-3 py-2 text-[9px] font-black text-white/[0.42] transition hover:bg-white hover:text-black"
                  >
                    PREVIEW HERE
                  </button>
                ) : null}
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
                uploadImage={uploadImage}
                uploadMedia={uploadMedia}
                autosaveState={autosaveState}
                lastSavedAt={lastSavedAt}
                autosaveError={autosaveError}
                onPreview={() => setPreviewPost(normalizePost(post))}
                requestPublish={requestPublish}
                verifyPublication={verifyPublication}
                verification={verification}
                verificationBusy={verificationBusy}
                publishPreflightBusy={publishPreflightBusy}
                publishFeedback={publishFeedback}
              />
            </div>
          ) : tab === "Media" ? (
            <MediaLibrary
              api={api}
              uploadImage={uploadImage}
              uploadMedia={uploadMedia}
            />
          ) : tab === "SEO" ? (
            <SeoGuide api={api} posts={posts} />
          ) : tab === "Settings" ? (
            <AdminSettings api={api} />
          ) : (
            <Dashboard
              tab={tab}
              posts={posts}
              deletedPosts={deletedPosts}
              analytics={analytics}
              activeFilter={overviewFilter}
              onFilterChange={setOverviewFilter}
              onEditPost={(item) => void openPostFromOverview(item)}
              onPreviewPost={setPreviewPost}
              onLibraryAction={runLibraryAction}
            />
          )}
        </section>
      </div>
      {previewPost ? (
        <AdminPublicationPreview
          post={previewPost}
          onClose={() => setPreviewPost(null)}
        />
      ) : null}

      {publishIntent ? (
        <PublishConfirmation
          post={post}
          intent={publishIntent}
          blockers={blockers}
          issues={issues}
          busy={busy}
          onPreview={() => {
            setPublishIntent(null);
            setPreviewPost(normalizePost(post));
          }}
          onCancel={() => setPublishIntent(null)}
          onConfirm={async () => {
            const intent = publishIntent;
            const saved = await save(intent);
            if (saved) setPublishIntent(null);
          }}
          onConfirmEmail={async () => {
            const intent = publishIntent;
            if (intent !== "published") return;

            const popup = window.open("about:blank", "_blank");
            if (popup) {
              popup.document.title = "StayKnown · Preparing email";
              popup.document.body.style.cssText =
                "margin:0;background:#000;color:#fff;font-family:Arial,sans-serif;display:grid;place-items:center;min-height:100vh";
              popup.document.body.innerHTML =
                '<div style="text-align:center"><div style="font-size:11px;font-weight:800;letter-spacing:.16em">STAYKNOWN UPDATES</div><div style="margin-top:12px;font-size:20px;font-weight:800">Publishing first…</div><div style="margin-top:8px;font-size:12px;opacity:.55">Mail Console will open after the live publication is verified.</div></div>';
            }

            const saved = await save(intent);
            if (!saved) {
              if (popup && !popup.closed) popup.close();
              return;
            }

            setPublishIntent(null);
            await preparePublishedUpdateEmail(saved.id, popup);
          }}
        />
      ) : null}
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
  uploadImage,
  uploadMedia,
  autosaveState,
  lastSavedAt,
  autosaveError,
  onPreview,
  requestPublish,
  verifyPublication,
  verification,
  verificationBusy,
  publishPreflightBusy,
  publishFeedback,
}: any) {
  const presentation = getUpdatePresentation(post.body || []);
  const visible = (post.body || []).filter(
    (block: UpdateBlock) => block.type !== "presentation",
  );

  return (
    <div className="rounded-[32px] border border-white/[0.1] p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div>
          <div className="text-[8px] font-black uppercase tracking-[0.18em] text-white/[0.28]">
            {post.id ? `${post.status} publication` : "New publication"}
          </div>
          <div className="mt-1 text-[10px] font-semibold text-white/[0.38]">
            {post.id && post.status === "draft"
              ? "This draft is stored in StayKnown and can be reopened later."
              : !post.id
                ? "Save this once as a draft to activate continuous autosave."
                : "Published and scheduled items do not autosave as drafts."}
          </div>
        </div>

        <div className="rounded-full border border-white/[0.1] px-3 py-2 text-[8px] font-black uppercase tracking-[0.12em] text-white/[0.42]">
          {!post.id
            ? "Autosave starts after first save"
            : post.status !== "draft"
              ? "Autosave off"
              : autosaveState === "saving"
                ? "Saving…"
                : autosaveState === "retrying"
                  ? "Save not completed · retrying"
                  : autosaveState === "dirty"
                    ? "Changes waiting to save"
                    : `Saved${lastSavedAt ? ` · ${formatSavedTime(lastSavedAt)}` : ""}`}
        </div>
      </div>

      {autosaveError ? (
        <div className="mb-5 rounded-2xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-[9px] font-semibold leading-5 text-white/[0.5]">
          {autosaveError}
        </div>
      ) : null}

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
          className="input disabled:cursor-not-allowed disabled:opacity-45"
          value={post.slug}
          disabled={Boolean(post.id && isPubliclyOpenable(post))}
          onChange={(event) => set("slug", slugify(event.target.value))}
          onBlur={(event) => set("slug", finalizeSlug(event.target.value))}
        />
        <Hint>
          Canonical: /updates/{post.slug || "your-update"}
          {post.id && isPubliclyOpenable(post)
            ? " · Locked because this URL is already public."
            : ""}
        </Hint>
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

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {[
            ["16:9", "image_16_9_url", "representative-16-9"],
            ["4:3", "image_4_3_url", "representative-4-3"],
            ["1:1", "image_1_1_url", "representative-1-1"],
          ].map(([label, key, purpose]) => (
            <ImageUploadControl
              key={key}
              label={`${label} representative image`}
              value={post[key] || ""}
              purpose={purpose as any}
              uploadImage={uploadImage}
              onUploaded={(url: string) => {
                set(key, url);
                if (key === "image_16_9_url") {
                  set("hero_image_url", url);
                }
              }}
              onRemove={() => {
                set(key, "");
                if (key === "image_16_9_url") {
                  set("hero_image_url", "");
                }
              }}
            />
          ))}
        </div>

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
              uploadImage={uploadImage}
              uploadMedia={uploadMedia}
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
            ["image", "Image / GIF"],
            ["video", "Video"],
            ["audio", "Audio"],
            ["file", "File"],
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

      <section className="mt-6 rounded-[26px] border border-white/[0.1] bg-white/[0.02] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/[0.35]">
              Publication control
            </div>
            <div className="mt-1 text-[11px] font-black">
              {issues.some((item: SeoIssue) => item.level === "block")
                ? "Not ready to publish"
                : post.status === "published"
                  ? "Ready to update the live publication"
                  : post.status === "scheduled"
                    ? "Ready to review the schedule"
                    : post.scheduled_for
                      ? "Ready to schedule"
                      : "Ready to publish"}
            </div>
          </div>

          <div className="rounded-full border border-white/[0.12] px-3 py-2 text-[8px] font-black uppercase tracking-[0.14em] text-white/[0.42]">
            {issues.filter((item: SeoIssue) => item.level === "block").length}{" "}
            blockers ·{" "}
            {issues.filter((item: SeoIssue) => item.level === "warning").length}{" "}
            warnings
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onPreview}
            className="rounded-full border border-white/[0.16] px-5 py-3 text-[10px] font-black transition hover:bg-white hover:text-black disabled:opacity-30"
          >
            Preview Update
          </button>

          {!post.id || post.status === "draft" ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => save("draft")}
              className="rounded-full border border-white/[0.16] px-5 py-3 text-[10px] font-black transition hover:bg-white hover:text-black disabled:opacity-30"
            >
              Save draft
            </button>
          ) : null}

          <button
            type="button"
            disabled={busy || publishPreflightBusy}
            onClick={() =>
              requestPublish(
                post.status === "published"
                  ? "published"
                  : post.status === "scheduled"
                    ? "scheduled"
                    : post.scheduled_for
                      ? "scheduled"
                      : "published",
              )
            }
            className="rounded-full bg-white px-5 py-3 text-[10px] font-black text-black transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-25"
          >
            {publishPreflightBusy
              ? "CHECKING…"
              : post.status === "published"
                ? "Review & Update Live"
                : post.status === "scheduled"
                  ? "Review Schedule"
                  : post.scheduled_for
                    ? "Review & Schedule"
                    : "Review & Publish"}
          </button>

          {post.id && isPubliclyOpenable(post) ? (
            <button
              type="button"
              disabled={verificationBusy}
              onClick={() => void verifyPublication(post.id)}
              className="rounded-full border border-white/[0.16] px-5 py-3 text-[10px] font-black text-white/[0.65] transition hover:bg-white hover:text-black disabled:opacity-30"
            >
              {verificationBusy ? "Checking…" : "Re-check Live Update"}
            </button>
          ) : null}
        </div>
      </section>

      {publishFeedback ? (
        <PublishFeedbackPanel feedback={publishFeedback} />
      ) : null}

      {note ? (
        <div className="mt-4 text-[11px] font-bold text-white/[0.52]">
          {note}
        </div>
      ) : null}

      {verification || verificationBusy ? (
        <PublicationVerificationPanel
          result={verification}
          busy={verificationBusy}
        />
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
  uploadImage,
  uploadMedia,
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
          <div className="mt-3">
            <ImageUploadControl
              label="Article image"
              value={block.url || ""}
              purpose="article-body"
              uploadImage={uploadImage}
              onUploaded={(url: string) => updateBlock(index, "url", url)}
              onRemove={() => updateBlock(index, "url", "")}
            />
          </div>
          <input
            className="input mt-2"
            placeholder="Meaningful alt text"
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

      {block.type === "video" ? (
        <>
          <div className="mt-3">
            <RichMediaUploadControl
              label="Article video"
              value={block.url || ""}
              kind="video"
              purpose="article-body"
              uploadMedia={uploadMedia}
              onUploaded={(result: MediaUploadResult) => {
                updateBlock(index, "url", result.url);
                updateBlock(index, "mime_type", result.mimeType);
              }}
              onRemove={() => updateBlock(index, "url", "")}
            />
          </div>
          <div className="mt-2">
            <ImageUploadControl
              label="Video poster / thumbnail (optional)"
              value={block.poster_url || ""}
              purpose="article-body"
              uploadImage={uploadImage}
              onUploaded={(url: string) =>
                updateBlock(index, "poster_url", url)
              }
              onRemove={() => updateBlock(index, "poster_url", "")}
            />
          </div>
          <input
            className="input mt-2"
            placeholder="Video caption (optional)"
            value={block.caption || ""}
            onChange={(event) =>
              updateBlock(index, "caption", event.target.value)
            }
          />
        </>
      ) : null}

      {block.type === "audio" ? (
        <>
          <div className="mt-3">
            <RichMediaUploadControl
              label="Article audio"
              value={block.url || ""}
              kind="audio"
              purpose="article-body"
              uploadMedia={uploadMedia}
              onUploaded={(result: MediaUploadResult) => {
                updateBlock(index, "url", result.url);
                updateBlock(index, "mime_type", result.mimeType);
              }}
              onRemove={() => updateBlock(index, "url", "")}
            />
          </div>
          <input
            className="input mt-2"
            placeholder="Audio title"
            value={block.title || ""}
            onChange={(event) =>
              updateBlock(index, "title", event.target.value)
            }
          />
          <input
            className="input mt-2"
            placeholder="Audio caption (optional)"
            value={block.caption || ""}
            onChange={(event) =>
              updateBlock(index, "caption", event.target.value)
            }
          />
        </>
      ) : null}

      {block.type === "file" ? (
        <>
          <div className="mt-3">
            <RichMediaUploadControl
              label="Publication file"
              value={block.url || ""}
              kind="file"
              purpose="article-body"
              uploadMedia={uploadMedia}
              onUploaded={(result: MediaUploadResult) => {
                updateBlock(index, "url", result.url);
                updateBlock(index, "mime_type", result.mimeType);
                updateBlock(index, "size_bytes", String(result.sizeBytes));
                if (!block.label) updateBlock(index, "label", result.name);
              }}
              onRemove={() => updateBlock(index, "url", "")}
            />
          </div>
          <input
            className="input mt-2"
            placeholder="File label"
            value={block.label || ""}
            onChange={(event) =>
              updateBlock(index, "label", event.target.value)
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

          {block.type === "video" ? (
            <ControlSelect
              label="Video width"
              value={block.width || "wide"}
              options={[
                ["content", "Content"],
                ["wide", "Wide"],
                ["full", "Full article"],
              ]}
              onChange={(value) => updateBlock(index, "width", value)}
            />
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
      image: "Image / GIF",
      video: "Video",
      audio: "Audio",
      file: "File",
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
        {issues.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.12] p-3 text-[10px] font-semibold text-white/[0.55]">
            No SEO issues detected.
          </div>
        ) : null}
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
            <div>
              <b className="mr-2 uppercase">{item.level}</b>
              {item.message}
            </div>
            <div className="mt-1 text-[9px] font-black uppercase tracking-[0.08em] text-white/[0.38]">
              What to do:{" "}
              <span className="normal-case tracking-normal text-white/[0.58]">
                {seoIssueFix(item)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type UpdatesImagePurpose = UpdatesMediaPurpose;

function formatBytes(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "";
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function RichMediaUploadControl({
  label,
  value,
  kind,
  purpose,
  uploadMedia,
  onUploaded,
  onRemove,
}: {
  label: string;
  value: string;
  kind: "video" | "audio" | "file" | "any";
  purpose: UpdatesMediaPurpose;
  uploadMedia: (
    file: File,
    purpose: UpdatesMediaPurpose,
  ) => Promise<MediaUploadResult>;
  onUploaded: (result: MediaUploadResult) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const accept =
    kind === "video"
      ? "video/mp4,video/webm"
      : kind === "audio"
        ? "audio/mpeg,audio/mp4,audio/aac,audio/wav,audio/x-wav,audio/ogg"
        : kind === "file"
          ? ".pdf,.txt,.doc,.docx,.xlsx,.pptx"
          : "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,audio/mpeg,audio/mp4,audio/aac,audio/wav,audio/x-wav,audio/ogg,.pdf,.txt,.doc,.docx,.xlsx,.pptx";

  async function choose(file?: File) {
    if (!file || uploading) return;
    setUploading(true);
    setMessage("");
    try {
      const result = await uploadMedia(file, purpose);
      onUploaded(result);
      setMessage(`Uploaded ${file.name} · ${formatBytes(file.size)}`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Media upload failed.",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="overflow-hidden rounded-[20px] border border-white/[0.1] bg-black">
      {value ? (
        <div className="border-b border-white/[0.08] p-3">
          {kind === "video" ? (
            <video
              src={value}
              controls
              preload="metadata"
              className="max-h-[280px] w-full rounded-xl bg-black"
            />
          ) : kind === "audio" ? (
            <audio src={value} controls preload="metadata" className="w-full" />
          ) : (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] p-3">
              <span className="truncate text-[9px] font-black text-white/[0.58]">
                FILE ATTACHED
              </span>
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="text-[8px] font-black text-white/[0.42] underline"
              >
                OPEN
              </a>
            </div>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="mt-2 rounded-full border border-white/[0.14] px-2.5 py-1.5 text-[8px] font-black text-white/[0.45] hover:bg-white hover:text-black"
          >
            Remove
          </button>
        </div>
      ) : null}
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="block w-full px-4 py-5 text-left transition hover:bg-white/[0.045] disabled:opacity-40"
      >
        <div className="text-[9px] font-black">
          {uploading
            ? "Uploading…"
            : value
              ? "Replace media"
              : `Upload ${label.toLowerCase()}`}
        </div>
        <div className="mt-1 text-[8px] font-semibold leading-4 text-white/[0.32]">
          Video, audio and publication files upload directly to StayKnown media
          storage.
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => void choose(event.target.files?.[0])}
      />
      {message ? (
        <div className="border-t border-white/[0.07] px-3 py-2 text-[8px] font-semibold text-white/[0.42]">
          {message}
        </div>
      ) : null}
    </div>
  );
}

function ImageUploadControl({
  label,
  value,
  purpose,
  uploadImage,
  onUploaded,
  onRemove,
}: {
  label: string;
  value: string;
  purpose: UpdatesImagePurpose;
  uploadImage: (file: File, purpose: UpdatesImagePurpose) => Promise<string>;
  onUploaded: (url: string) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("");

  async function choose(file?: File) {
    if (!file || uploading) return;

    setUploading(true);
    setMessage("");

    try {
      const url = await uploadImage(file, purpose);
      onUploaded(url);
      setMessage(`Uploaded ${file.name} · ${formatBytes(file.size)}`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Image upload failed.",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="overflow-hidden rounded-[20px] border border-white/[0.1] bg-black">
      {value ? (
        <div className="relative aspect-[16/9] overflow-hidden border-b border-white/[0.08] bg-white/[0.025]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-black/75 p-2 backdrop-blur-md">
            <span className="truncate text-[8px] font-black uppercase tracking-[0.12em] text-white/[0.62]">
              {label}
            </span>
            <button
              type="button"
              onClick={onRemove}
              className="rounded-full border border-white/[0.18] px-2 py-1 text-[8px] font-black text-white/[0.58] hover:bg-white hover:text-black"
            >
              Remove
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void choose(event.dataTransfer.files?.[0]);
        }}
        className={`block w-full px-4 py-5 text-left transition ${
          dragging ? "bg-white text-black" : "hover:bg-white/[0.045]"
        } disabled:opacity-40`}
      >
        <div className="text-[9px] font-black">
          {uploading
            ? "Uploading image…"
            : value
              ? "Replace image"
              : "Upload image"}
        </div>
        <div
          className={`mt-1 text-[8px] font-semibold leading-4 ${
            dragging ? "text-black/60" : "text-white/[0.32]"
          }`}
        >
          Drop here or choose from this device · JPEG, PNG, WebP
          {purpose === "article-body" ? " or GIF" : ""} · up to 20 MB
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={
          purpose === "article-body"
            ? "image/jpeg,image/png,image/webp,image/gif"
            : "image/jpeg,image/png,image/webp"
        }
        className="hidden"
        onChange={(event) => void choose(event.target.files?.[0])}
      />

      {message ? (
        <div className="border-t border-white/[0.07] px-3 py-2 text-[8px] font-semibold leading-4 text-white/[0.42]">
          {message}
        </div>
      ) : null}
    </div>
  );
}

function MediaLibrary({
  api,
  uploadImage,
  uploadMedia,
}: {
  api: (path: string, init?: RequestInit) => Promise<Response>;
  uploadImage: (file: File, purpose: UpdatesImagePurpose) => Promise<string>;
  uploadMedia: (
    file: File,
    purpose: UpdatesMediaPurpose,
  ) => Promise<MediaUploadResult>;
}) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");

  async function load() {
    setLoading(true);
    try {
      const response = await api("/api/admin/updates/media");
      const payload = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(payload.error || "Media could not be loaded.");
      setFiles(payload.files || []);
    } catch (error) {
      setNote(
        error instanceof Error ? error.message : "Media could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div>
      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/[0.3]">
        Media
      </div>
      <h1 className="mt-3 text-[48px] font-black tracking-[-0.065em]">
        Publication media.
      </h1>
      <p className="mt-3 max-w-2xl text-[11px] font-semibold leading-5 text-white/[0.38]">
        Images, animated GIFs, web video, audio and approved document files live
        here. Representative Article images remain JPEG, PNG or WebP only.
      </p>

      <div className="mt-7 max-w-xl">
        <RichMediaUploadControl
          label="media"
          value=""
          kind="any"
          purpose="media-library"
          uploadMedia={uploadMedia}
          onUploaded={() => {
            setNote("Media added to the publication library.");
            void load();
          }}
          onRemove={() => {}}
        />
      </div>

      {note ? (
        <div className="mt-4 text-[10px] font-bold text-white/[0.48]">
          {note}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-8 text-[10px] font-black text-white/[0.3]">
          Loading media…
        </div>
      ) : files.length ? (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {files.map((item) => {
            const mime = String(item.mimeType || "").toLowerCase();
            return (
              <div
                key={item.path}
                className="overflow-hidden rounded-[22px] border border-white/[0.1]"
              >
                <div className="flex aspect-[16/9] items-center justify-center overflow-hidden bg-white/[0.02]">
                  {mime.startsWith("video/") ? (
                    <video
                      src={item.publicUrl}
                      controls
                      preload="metadata"
                      className="h-full w-full object-contain"
                    />
                  ) : mime.startsWith("audio/") ? (
                    <div className="w-full px-4">
                      <audio
                        src={item.publicUrl}
                        controls
                        preload="metadata"
                        className="w-full"
                      />
                    </div>
                  ) : mime.startsWith("image/") ? (
                    <img
                      src={item.publicUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <a
                      href={item.publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/[0.14] px-4 py-2 text-[9px] font-black text-white/[0.5] hover:bg-white hover:text-black"
                    >
                      OPEN FILE ↗
                    </a>
                  )}
                </div>
                <div className="p-3">
                  <div className="truncate text-[9px] font-black text-white/[0.62]">
                    {item.name}
                  </div>
                  <div className="mt-1 text-[8px] font-semibold text-white/[0.28]">
                    {mime || "publication file"} ·{" "}
                    {formatBytes(Number(item.size || 0)) || "asset"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-[24px] border border-white/[0.08] p-5 text-[10px] font-semibold text-white/[0.32]">
          No publication media uploaded yet.
        </div>
      )}
    </div>
  );
}

function Dashboard({
  tab,
  posts,
  deletedPosts,
  analytics,
  activeFilter,
  onFilterChange,
  onEditPost,
  onPreviewPost,
  onLibraryAction,
}: {
  tab: string;
  posts: any[];
  deletedPosts: any[];
  analytics: any;
  activeFilter: OverviewLibraryFilter | null;
  onFilterChange: (filter: OverviewLibraryFilter | null) => void;
  onEditPost: (item: any) => void;
  onPreviewPost: (item: any) => void;
  onLibraryAction: (
    action: "soft_delete" | "restore" | "permanent_delete",
    ids: string[],
    confirmation?: string,
  ) => Promise<any>;
}) {
  const published = posts.filter((item) => item.status === "published").length;
  const drafts = posts.filter((item) => item.status === "draft").length;
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmMode, setConfirmMode] = useState<"delete" | "permanent" | null>(
    null,
  );
  const [confirmText, setConfirmText] = useState("");
  const [actionBusy, setActionBusy] = useState(false);
  const [actionNote, setActionNote] = useState("");

  const librarySource = activeFilter === "deleted" ? deletedPosts : posts;
  const visibleLibrary = sortPostsForLibrary(
    librarySource.filter((item) => {
      if (!activeFilter || activeFilter === "all" || activeFilter === "deleted")
        return true;
      return item.status === activeFilter;
    }),
    activeFilter || "all",
  );

  useEffect(() => {
    setSelected([]);
    setSelecting(false);
    setActionNote("");
  }, [activeFilter]);

  const selectedRows = visibleLibrary.filter((item) =>
    selected.includes(item.id),
  );
  const selectedHasPublished = selectedRows.some(
    (item) => item.status === "published",
  );

  function toggleSelected(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

  async function perform(
    action: "soft_delete" | "restore" | "permanent_delete",
  ) {
    if (!selected.length) return;
    setActionBusy(true);
    setActionNote("");
    try {
      await onLibraryAction(
        action,
        selected,
        action === "soft_delete"
          ? "DELETE"
          : action === "permanent_delete"
            ? "PERMANENTLY DELETE"
            : "",
      );
      setActionNote(
        action === "restore"
          ? `${selected.length} publication${selected.length === 1 ? "" : "s"} restored.`
          : action === "soft_delete"
            ? `${selected.length} publication${selected.length === 1 ? "" : "s"} moved to Recently Deleted.`
            : `${selected.length} publication${selected.length === 1 ? "" : "s"} permanently deleted.`,
      );
      setSelected([]);
      setSelecting(false);
      setConfirmMode(null);
      setConfirmText("");
    } catch (error) {
      setActionNote(
        error instanceof Error ? error.message : "Publication action failed.",
      );
    } finally {
      setActionBusy(false);
    }
  }

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
          { count: posts.length, label: "All posts", filter: "all" as const },
          {
            count: published,
            label: "Published",
            filter: "published" as const,
          },
          { count: drafts, label: "Drafts", filter: "draft" as const },
        ].map(({ count, label, filter }) => (
          <button
            type="button"
            key={label}
            onClick={() =>
              onFilterChange(activeFilter === filter ? null : filter)
            }
            className={`rounded-[26px] border p-5 text-left transition active:scale-[0.99] ${activeFilter === filter ? "border-white/[0.34] bg-white/[0.055]" : "border-white/[0.1] hover:border-white/[0.28] hover:bg-white/[0.03]"}`}
          >
            <div className="text-[40px] font-black tracking-[-0.06em]">
              {count}
            </div>
            <div className="text-[9px] font-black uppercase tracking-[0.16em] text-white/[0.3]">
              {label}
            </div>
            <div className="mt-2 text-[8px] font-semibold text-white/[0.22]">
              {activeFilter === filter ? "Hide" : "Show"} {label.toLowerCase()}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() =>
            onFilterChange(activeFilter === "deleted" ? null : "deleted")
          }
          className={`rounded-full border px-3 py-2 text-[8px] font-black uppercase tracking-[0.12em] transition ${activeFilter === "deleted" ? "border-white bg-white text-black" : "border-white/[0.1] text-white/[0.34] hover:border-white/[0.28] hover:text-white"}`}
        >
          Recently Deleted · {deletedPosts.length} · 90-day recovery
        </button>
      </div>

      {activeFilter ? (
        <section className="mt-5 rounded-[28px] border border-white/[0.08] p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/[0.34]">
                {activeFilter === "deleted"
                  ? "Recently Deleted"
                  : activeFilter === "all"
                    ? "All Posts"
                    : activeFilter}
              </div>
              <div className="mt-1 text-[8px] font-semibold text-white/[0.24]">
                Newest first · {visibleLibrary.length} item
                {visibleLibrary.length === 1 ? "" : "s"}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelecting((value) => !value)}
                className="rounded-full border border-white/[0.1] px-3 py-2 text-[8px] font-black text-white/[0.4] hover:bg-white hover:text-black"
              >
                {selecting ? "DONE SELECTING" : "SELECT"}
              </button>
              {selecting && visibleLibrary.length ? (
                <button
                  type="button"
                  onClick={() =>
                    setSelected(
                      selected.length === visibleLibrary.length
                        ? []
                        : visibleLibrary.map((item) => item.id),
                    )
                  }
                  className="rounded-full border border-white/[0.1] px-3 py-2 text-[8px] font-black text-white/[0.4] hover:bg-white hover:text-black"
                >
                  {selected.length === visibleLibrary.length
                    ? "CLEAR ALL"
                    : "SELECT ALL"}
                </button>
              ) : null}
            </div>
          </div>

          {selecting && selected.length ? (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.1] bg-white/[0.025] p-3">
              <div className="text-[9px] font-black text-white/[0.5]">
                {selected.length} selected
              </div>
              <div className="flex gap-2">
                {activeFilter === "deleted" ? (
                  <>
                    <button
                      type="button"
                      disabled={actionBusy}
                      onClick={() => void perform("restore")}
                      className="rounded-full bg-white px-3 py-2 text-[8px] font-black text-black disabled:opacity-30"
                    >
                      RESTORE SELECTED
                    </button>
                    <button
                      type="button"
                      disabled={actionBusy}
                      onClick={() => {
                        setConfirmMode("permanent");
                        setConfirmText("");
                      }}
                      className="rounded-full border border-white/[0.16] px-3 py-2 text-[8px] font-black text-white/[0.48] disabled:opacity-30"
                    >
                      PERMANENT DELETE
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={actionBusy}
                    onClick={() => {
                      setConfirmMode("delete");
                      setConfirmText("");
                    }}
                    className="rounded-full border border-white/[0.16] px-3 py-2 text-[8px] font-black text-white/[0.48] disabled:opacity-30"
                  >
                    MOVE TO RECENTLY DELETED
                  </button>
                )}
              </div>
            </div>
          ) : null}

          {actionNote ? (
            <div className="mt-3 text-[9px] font-bold text-white/[0.44]">
              {actionNote}
            </div>
          ) : null}

          {visibleLibrary.length ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {visibleLibrary.map((item) => (
                <PublicationMiniCard
                  key={item.id}
                  item={item}
                  selecting={selecting}
                  selected={selected.includes(item.id)}
                  deleted={activeFilter === "deleted"}
                  onToggleSelect={() => toggleSelected(item.id)}
                  onEdit={() => onEditPost(item)}
                  onPreview={() => onPreviewPost(item)}
                  onDelete={() => {
                    setSelected([item.id]);
                    setConfirmMode("delete");
                    setConfirmText("");
                  }}
                  onRestore={() => {
                    setSelected([item.id]);
                    void (async () => {
                      setActionBusy(true);
                      try {
                        await onLibraryAction("restore", [item.id]);
                        setActionNote("Publication restored.");
                      } catch (error) {
                        setActionNote(
                          error instanceof Error
                            ? error.message
                            : "Restore failed.",
                        );
                      } finally {
                        setActionBusy(false);
                        setSelected([]);
                      }
                    })();
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-white/[0.08] p-5 text-[9px] font-semibold text-white/[0.3]">
              Nothing in this publication section yet.
            </div>
          )}
        </section>
      ) : null}

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
      ) : tab === "Overview" ? (
        <p className="mt-6 max-w-xl text-[11px] font-semibold leading-5 text-white/[0.32]">
          Tap All Posts, Published or Drafts to expand compact publication cards
          here. Preview stays inside Admin; Open URL is available only when the
          Update is actually public.
        </p>
      ) : null}

      {confirmMode ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[28px] border border-white/[0.16] bg-black p-6 shadow-2xl">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/[0.35]">
              Deletion protection
            </div>
            <h2 className="mt-2 text-[30px] font-black tracking-[-0.05em]">
              {confirmMode === "permanent"
                ? "Delete permanently?"
                : "Move to Recently Deleted?"}
            </h2>
            <p className="mt-3 text-[10px] font-semibold leading-5 text-white/[0.45]">
              {confirmMode === "permanent"
                ? "This cannot be restored. Type PERMANENTLY DELETE to continue."
                : `${selected.length} publication${selected.length === 1 ? "" : "s"} will disappear from active Admin lists${selectedHasPublished ? " and any published Update will disappear from the public website immediately" : ""}. It remains recoverable for 90 days. Type DELETE to continue.`}
            </p>
            <input
              autoFocus
              className="input mt-4"
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder={
                confirmMode === "permanent" ? "PERMANENTLY DELETE" : "DELETE"
              }
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmMode(null);
                  setConfirmText("");
                }}
                className="rounded-full border border-white/[0.12] px-4 py-2 text-[9px] font-black text-white/[0.45]"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={
                  actionBusy ||
                  confirmText !==
                    (confirmMode === "permanent"
                      ? "PERMANENTLY DELETE"
                      : "DELETE")
                }
                onClick={() =>
                  void perform(
                    confirmMode === "permanent"
                      ? "permanent_delete"
                      : "soft_delete",
                  )
                }
                className="rounded-full bg-white px-4 py-2 text-[9px] font-black text-black disabled:opacity-25"
              >
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PublicationMiniCard({
  item,
  selecting,
  selected,
  deleted,
  onToggleSelect,
  onEdit,
  onPreview,
  onDelete,
  onRestore,
}: any) {
  const media = firstPreviewMedia(item);
  const publicUrl = `/updates/${item.slug}`;

  return (
    <article className="group relative overflow-hidden rounded-[22px] border border-white/[0.09] bg-black transition hover:border-white/[0.22]">
      {selecting ? (
        <button
          type="button"
          onClick={onToggleSelect}
          className={`absolute left-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-black backdrop-blur-md ${selected ? "border-white bg-white text-black" : "border-white/[0.25] bg-black/70 text-white"}`}
        >
          {selected ? "✓" : ""}
        </button>
      ) : null}
      <button
        type="button"
        onClick={selecting ? onToggleSelect : deleted ? onPreview : onEdit}
        className="block w-full text-left"
      >
        <PublicationPreviewMedia media={media} compact />
        <div className="p-3">
          <div className="text-[7px] font-black uppercase tracking-[0.14em] text-white/[0.28]">
            {deleted ? "RECENTLY DELETED" : item.status} · {item.category}
          </div>
          <div className="mt-1 line-clamp-2 min-h-[32px] text-[11px] font-black leading-4">
            {String(item.title || "").trim() || "Untitled draft"}
          </div>
          <div className="mt-2 text-[7px] font-semibold text-white/[0.24]">
            {deleted
              ? `Restorable until ${formatAdminDate(item.delete_after)}`
              : `Last saved ${formatAdminDate(item.updated_at || item.created_at)}`}
          </div>
        </div>
      </button>
      {!selecting ? (
        <div className="flex flex-wrap gap-1.5 border-t border-white/[0.07] p-2">
          {deleted ? (
            <button
              type="button"
              onClick={onRestore}
              className="rounded-full bg-white px-2.5 py-1.5 text-[7px] font-black text-black"
            >
              RESTORE
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onPreview}
                className="rounded-full border border-white/[0.1] px-2.5 py-1.5 text-[7px] font-black text-white/[0.42] hover:bg-white hover:text-black"
              >
                PREVIEW HERE
              </button>
              {isPubliclyOpenable(item) ? (
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/[0.1] px-2.5 py-1.5 text-[7px] font-black text-white/[0.42] hover:bg-white hover:text-black"
                >
                  OPEN URL ↗
                </a>
              ) : null}
              <button
                type="button"
                onClick={onDelete}
                className="rounded-full border border-white/[0.1] px-2.5 py-1.5 text-[7px] font-black text-white/[0.32] hover:border-white/[0.28] hover:text-white"
              >
                DELETE
              </button>
            </>
          )}
        </div>
      ) : null}
    </article>
  );
}

function PublicationPreviewMedia({
  media,
  compact = false,
}: {
  media: ReturnType<typeof firstPreviewMedia>;
  compact?: boolean;
}) {
  const className = compact ? "aspect-[16/8]" : "aspect-[16/9]";
  if (media.kind === "video")
    return (
      <div className={`${className} overflow-hidden bg-black`}>
        <video
          src={media.url}
          poster={media.poster}
          muted
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
      </div>
    );
  if (media.kind === "audio")
    return (
      <div
        className={`${className} flex flex-col items-center justify-center gap-2 bg-white/[0.025] px-3`}
      >
        <div className="text-[22px]">◉</div>
        <div className="text-[8px] font-black uppercase tracking-[0.14em] text-white/[0.35]">
          AUDIO · {media.label || "PLAYBACK"}
        </div>
      </div>
    );
  if (media.kind === "file")
    return (
      <div
        className={`${className} flex flex-col items-center justify-center gap-2 bg-white/[0.025] px-3`}
      >
        <div className="text-[22px]">▤</div>
        <div className="max-w-full truncate text-[8px] font-black uppercase tracking-[0.14em] text-white/[0.35]">
          {media.label || "PUBLICATION FILE"}
        </div>
      </div>
    );
  if (media.kind === "image")
    return (
      <div className={`${className} overflow-hidden bg-white/[0.02]`}>
        <img
          src={media.url}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    );
  return (
    <div
      className={`${className} flex items-center justify-center bg-white/[0.018] text-[8px] font-black uppercase tracking-[0.14em] text-white/[0.2]`}
    >
      No media preview
    </div>
  );
}

function AdminPublicationPreview({
  post,
  onClose,
}: {
  post: any;
  onClose: () => void;
}) {
  const presentation = getUpdatePresentation(post.body || []);
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/95 p-3 backdrop-blur-xl sm:p-6">
      <div className="mx-auto max-w-[1050px] overflow-hidden rounded-[30px] border border-white/[0.12] bg-black">
        <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-white/[0.08] bg-black/90 p-3 backdrop-blur-xl">
          <div>
            <div className="text-[8px] font-black uppercase tracking-[0.16em] text-white/[0.3]">
              ADMIN WEB PREVIEW · NOT A PUBLIC ROUTE
            </div>
            <div className="mt-1 text-[9px] font-semibold text-white/[0.25]">
              Preview this Update without leaving Publication Admin.
            </div>
          </div>
          <div className="flex gap-2">
            {isPubliclyOpenable(post) ? (
              <a
                href={`/updates/${post.slug}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/[0.14] px-3 py-2 text-[8px] font-black text-white/[0.45] hover:bg-white hover:text-black"
              >
                OPEN UPDATE URL ↗
              </a>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white px-3 py-2 text-[8px] font-black text-black"
            >
              CLOSE
            </button>
          </div>
        </div>
        <article className="px-4 py-10 sm:px-8 sm:py-14">
          <div className="mx-auto max-w-[900px]">
            <div className="text-[8px] font-black uppercase tracking-[0.18em] text-white/[0.32]">
              {post.category} · {post.status}
            </div>
            {post.kicker ? (
              <div className="mt-7 text-[10px] font-black uppercase tracking-[0.18em] text-white/[0.45]">
                {post.kicker}
              </div>
            ) : null}
            <h1
              className={`mt-3 font-black leading-[0.93] tracking-[-0.06em] ${presentation.title_scale === "feature" ? "text-[52px] sm:text-[76px]" : "text-[44px] sm:text-[64px]"}`}
            >
              {post.title || "Untitled draft"}
            </h1>
            {post.summary ? (
              <p className="mt-6 max-w-[760px] text-[16px] font-semibold leading-7 text-white/[0.55]">
                {post.summary}
              </p>
            ) : null}
            {post.hero_image_url || post.image_16_9_url ? (
              <figure className="mt-9 overflow-hidden rounded-[28px] border border-white/[0.1]">
                <img
                  src={post.hero_image_url || post.image_16_9_url}
                  alt={post.hero_alt_text || ""}
                  className="aspect-[16/9] w-full object-cover"
                />
              </figure>
            ) : null}
            <div className="mt-10">
              <UpdateBlocks
                blocks={post.body || []}
                fallbackPosterUrl={
                  post.image_16_9_url || post.hero_image_url || ""
                }
              />
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

function PublishFeedbackPanel({ feedback }: { feedback: PublishFeedback }) {
  const issues = Array.isArray(feedback.issues) ? feedback.issues : [];
  const blockers = issues.filter((item) => item.level === "block");
  const warnings = issues.filter((item) => item.level === "warning");

  return (
    <section
      className={`mt-4 rounded-[26px] border p-4 ${
        feedback.kind === "blocked" || feedback.kind === "error"
          ? "border-white/[0.24] bg-white/[0.06]"
          : "border-white/[0.12] bg-white/[0.025]"
      }`}
      aria-live="polite"
    >
      <div className="text-[8px] font-black uppercase tracking-[0.18em] text-white/[0.34]">
        Publication feedback
      </div>
      <div className="mt-2 text-[13px] font-black text-white">
        {feedback.title}
      </div>
      {feedback.detail ? (
        <div className="mt-2 text-[10px] font-semibold leading-5 text-white/[0.48]">
          {feedback.detail}
        </div>
      ) : null}

      {feedback.kind === "checking" ? (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-white/[0.7]" />
        </div>
      ) : null}

      {blockers.length > 0 ? (
        <div className="mt-4 space-y-2">
          {blockers.map((item, index) => (
            <div
              key={`${item.code}-${index}`}
              className="rounded-2xl border border-white/[0.16] p-3"
            >
              <div className="text-[9px] font-black uppercase tracking-[0.12em] text-white">
                BLOCK · {item.message}
              </div>
              <div className="mt-1 text-[9px] font-semibold leading-4 text-white/[0.48]">
                What to do: {seoIssueFix(item)}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {warnings.length > 0 ? (
        <details className="mt-4 rounded-2xl border border-white/[0.1] p-3">
          <summary className="cursor-pointer text-[9px] font-black uppercase tracking-[0.12em] text-white/[0.5]">
            {warnings.length} warning{warnings.length === 1 ? "" : "s"} to
            review
          </summary>
          <div className="mt-3 space-y-2">
            {warnings.map((item, index) => (
              <div
                key={`${item.code}-${index}`}
                className="text-[9px] font-semibold leading-4 text-white/[0.42]"
              >
                <b>WARNING ·</b> {item.message}
                <br />
                <span className="text-white/[0.32]">
                  What to do: {seoIssueFix(item)}
                </span>
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </section>
  );
}

function PublishConfirmation({
  post,
  intent,
  blockers,
  issues,
  busy,
  onPreview,
  onCancel,
  onConfirm,
  onConfirmEmail,
}: {
  post: any;
  intent: PublishIntent;
  blockers: number;
  issues: SeoIssue[];
  busy: boolean;
  onPreview: () => void;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  onConfirmEmail: () => void | Promise<void>;
}) {
  const scheduled =
    intent === "scheduled" && post.scheduled_for
      ? new Intl.DateTimeFormat("en", {
          dateStyle: "full",
          timeStyle: "short",
          timeZone: "Africa/Lagos",
        }).format(new Date(post.scheduled_for))
      : "";

  const publicPath = `/updates/${post.slug || "your-update"}`;
  const representativeCount = [
    post.image_16_9_url,
    post.image_4_3_url,
    post.image_1_1_url,
  ].filter(Boolean).length;
  const updatingLive = post.id && isPubliclyOpenable(post);
  const warnings = (Array.isArray(issues) ? issues : []).filter(
    (item: SeoIssue) => item.level === "warning",
  );

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/90 p-4 backdrop-blur-xl">
      <div className="w-full max-w-[700px] rounded-[32px] border border-white/[0.14] bg-black p-5 sm:p-7">
        <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white/[0.32]">
          Final publication review
        </div>
        <h2 className="mt-3 text-[34px] font-black tracking-[-0.055em]">
          {updatingLive
            ? "Update this live publication?"
            : intent === "scheduled"
              ? "Schedule this Update?"
              : "Publish this Update?"}
        </h2>

        <div className="mt-6 grid gap-2">
          {[
            ["Headline", post.title || "Untitled"],
            ["Public URL", publicPath],
            ["SEO blockers", String(blockers)],
            ["SEO warnings", String(warnings.length)],
            ["Representative images", `${representativeCount}/3 ready`],
            [
              intent === "scheduled" ? "Goes public" : "Visibility",
              intent === "scheduled"
                ? scheduled
                : updatingLive
                  ? "Changes become public immediately"
                  : "Immediately after confirmation",
            ],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex items-start justify-between gap-5 rounded-2xl border border-white/[0.08] px-4 py-3"
            >
              <div className="text-[8px] font-black uppercase tracking-[0.14em] text-white/[0.28]">
                {label}
              </div>
              <div className="max-w-[68%] text-right text-[10px] font-bold text-white/[0.62]">
                {value}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 overflow-hidden rounded-[24px] border border-white/[0.1] bg-white/[0.02]">
          {post.image_16_9_url ? (
            <img
              src={post.image_16_9_url}
              alt=""
              className="aspect-[16/9] w-full object-cover"
            />
          ) : null}
          <div className="p-4">
            <div className="text-[8px] font-black uppercase tracking-[0.16em] text-white/[0.3]">
              StayKnown · stay-known.com
            </div>
            <div className="mt-2 text-[18px] font-black leading-tight">
              {post.seo_title || post.title || "Untitled Update"}
            </div>
            <div className="mt-2 line-clamp-2 text-[10px] font-semibold leading-4 text-white/[0.42]">
              {post.seo_description || post.summary || "No summary yet."}
            </div>
            <div className="mt-3 text-[8px] font-black uppercase tracking-[0.14em] text-white/[0.24]">
              Social share preview · 16:9 representative image · no logo overlay
            </div>
          </div>
        </div>

        {warnings.length > 0 ? (
          <div className="mt-5 rounded-[22px] border border-white/[0.1] p-4">
            <div className="text-[8px] font-black uppercase tracking-[0.16em] text-white/[0.34]">
              Warnings to review
            </div>
            <div className="mt-3 space-y-2">
              {warnings.map((item: SeoIssue, index: number) => (
                <div
                  key={`${item.code}-${index}`}
                  className="text-[9px] font-semibold leading-4 text-white/[0.46]"
                >
                  {item.message}
                  <div className="text-white/[0.3]">
                    What to do: {seoIssueFix(item)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <p className="mt-5 text-[10px] font-semibold leading-5 text-white/[0.4]">
          {intent === "scheduled"
            ? "StayKnown will keep this Update private until the scheduled time. The server enforces the final SEO gate again before accepting the schedule. Publish + Email becomes available once an Update is being published live."
            : "After confirmation, StayKnown checks the live URL, canonical and social metadata, Article schema, Updates sitemap, RSS, likes and analytics readiness."}
        </p>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onPreview}
            className="rounded-full border border-white/[0.14] px-4 py-2.5 text-[9px] font-black text-white/[0.55] hover:bg-white hover:text-black disabled:opacity-30"
          >
            Preview full Update
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="rounded-full border border-white/[0.14] px-4 py-2.5 text-[9px] font-black text-white/[0.55] hover:bg-white hover:text-black disabled:opacity-30"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || blockers > 0}
            onClick={() => void onConfirm()}
            className="rounded-full bg-white px-5 py-2.5 text-[9px] font-black text-black transition hover:bg-white hover:!text-black disabled:opacity-25"
          >
            {busy
              ? "Working…"
              : updatingLive
                ? "Update live publication"
                : intent === "scheduled"
                  ? "Confirm schedule"
                  : "Publish only"}
          </button>
          {intent === "published" ? (
            <button
              type="button"
              disabled={busy || blockers > 0}
              onClick={() => void onConfirmEmail()}
              className="rounded-full border border-white bg-black px-5 py-2.5 text-[9px] font-black text-white transition hover:bg-white hover:!text-black disabled:opacity-25"
            >
              {busy ? "Working…" : "Publish + Email"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PublicationVerificationPanel({
  result,
  busy,
}: {
  result: PublicationVerification | null;
  busy: boolean;
}) {
  return (
    <section className="mt-5 rounded-[26px] border border-white/[0.1] bg-white/[0.02] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[8px] font-black uppercase tracking-[0.18em] text-white/[0.3]">
            Live publication verification
          </div>
          <div className="mt-1 text-[12px] font-black">
            {busy
              ? "Checking the public publication…"
              : result?.ok
                ? "Live publication verified"
                : "One or more checks need attention"}
          </div>
        </div>

        {result?.publicUrl ? (
          <a
            href={result.publicUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/[0.14] px-3 py-2 text-[8px] font-black text-white/[0.5] hover:bg-white hover:text-black"
          >
            OPEN UPDATE URL ↗
          </a>
        ) : null}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {(result?.checks || []).map((check) => (
          <div
            key={check.key}
            className="rounded-2xl border border-white/[0.08] p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-[9px] font-black text-white/[0.65]">
                {check.label}
              </div>
              <div
                className={`text-[8px] font-black uppercase tracking-[0.14em] ${
                  check.ok ? "text-white/[0.75]" : "text-white/[0.32]"
                }`}
              >
                {check.ok ? "PASS" : "CHECK"}
              </div>
            </div>
            <div className="mt-1 text-[9px] font-semibold leading-4 text-white/[0.34]">
              {check.detail}
            </div>
          </div>
        ))}

        {busy && !result ? (
          <div className="rounded-2xl border border-white/[0.08] p-3 text-[9px] font-semibold text-white/[0.36]">
            Checking public URL, metadata, sitemap and RSS…
          </div>
        ) : null}
      </div>

      {result ? (
        <div className="mt-3 text-[8px] font-black uppercase tracking-[0.13em] text-white/[0.24]">
          {result.views.toLocaleString()} views ·{" "}
          {result.likes.toLocaleString()} likes · checked{" "}
          {new Intl.DateTimeFormat("en", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "Africa/Lagos",
          }).format(new Date(result.checkedAt))}
        </div>
      ) : null}
    </section>
  );
}

function SeoGuide({ api, posts }: any) {
  const guidance = [
    "Each published update receives its own canonical /updates/[slug] URL and Article/NewsArticle/BlogPosting JSON-LD.",
    "Google recommends representative 16:9, 4:3 and 1:1 images; StayKnown Strict SEO blocks publication until all three are supplied.",
    "Each representative image should be crawlable/indexable and at least 50,000 pixels by width × height.",
    "Headlines should be concise, but Google does not impose the old 110-character Article headline limit.",
    "Google may build snippets from the visible page content; do not keyword-stuff meta descriptions.",
    "Draft and admin surfaces stay noindex. Published content is index/follow and is added to /updates/sitemap.xml and RSS.",
    "Write original, people-first updates. Technical SEO cannot compensate for thin, copied or misleading content.",
  ];
  const [discoveryBusy, setDiscoveryBusy] = useState(false);
  const [notifyBusy, setNotifyBusy] = useState(false);
  const [discovery, setDiscovery] = useState<any>(null);
  const [discoveryNote, setDiscoveryNote] = useState("");

  async function checkDiscovery() {
    setDiscoveryBusy(true);
    setDiscoveryNote("");
    try {
      const response = await api("/api/admin/updates/discovery", {
        method: "GET",
        cache: "no-store",
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        setDiscoveryNote(result.error || "Search discovery check failed.");
        return;
      }
      setDiscovery(result);
      setDiscoveryNote("Search discovery status refreshed.");
    } catch (error) {
      setDiscoveryNote(
        error instanceof Error
          ? error.message
          : "Search discovery check failed.",
      );
    } finally {
      setDiscoveryBusy(false);
    }
  }

  async function notifySearchEngines() {
    setNotifyBusy(true);
    setDiscoveryNote("");
    try {
      const response = await api("/api/admin/updates/discovery", {
        method: "POST",
        body: JSON.stringify({ action: "notify" }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        setDiscoveryNote(
          result.error ||
            result.discovery?.error ||
            "Search-engine notification was not accepted.",
        );
        return;
      }
      setDiscoveryNote(
        `IndexNow accepted ${result.notifiedPostCount || 0} public Update${
          result.notifiedPostCount === 1 ? "" : "s"
        } for discovery.`,
      );
      await checkDiscovery();
    } catch (error) {
      setDiscoveryNote(
        error instanceof Error
          ? error.message
          : "Search-engine notification failed.",
      );
    } finally {
      setNotifyBusy(false);
    }
  }

  const publishedCount = (posts || []).filter((item: any) =>
    ["published", "scheduled"].includes(String(item?.status || "")),
  ).length;

  return (
    <div className="max-w-4xl">
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

      <section className="mt-10 rounded-[30px] border border-white/[0.11] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.19em] text-white/[0.3]">
              Search discovery & distribution
            </div>
            <h2 className="mt-2 text-[30px] font-black tracking-[-0.05em]">
              Search handoff.
            </h2>
            <p className="mt-2 max-w-2xl text-[11px] font-semibold leading-5 text-white/[0.42]">
              Checks the live Updates hub, RSS autodiscovery, both sitemaps,
              robots.txt and the latest public article. IndexNow can notify Bing
              and other participating engines; Google discovery continues
              through crawlable pages, sitemaps and Search Console.
            </p>
          </div>
          <div className="rounded-full border border-white/[0.12] px-3 py-2 text-[9px] font-black text-white/[0.45]">
            {publishedCount.toLocaleString()} PUBLIC / SCHEDULED
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void checkDiscovery()}
            disabled={discoveryBusy || notifyBusy}
            className="rounded-full border border-white/[0.14] bg-black px-4 py-2.5 text-[9px] font-black text-white transition hover:bg-white hover:text-black disabled:cursor-wait disabled:opacity-50"
          >
            {discoveryBusy ? "CHECKING…" : "CHECK SEARCH DISCOVERY"}
          </button>
          <button
            type="button"
            onClick={() => void notifySearchEngines()}
            disabled={discoveryBusy || notifyBusy}
            className="rounded-full bg-white px-4 py-2.5 text-[9px] font-black text-black transition hover:bg-white/[0.88] hover:text-black disabled:cursor-wait disabled:opacity-50"
          >
            {notifyBusy ? "NOTIFYING…" : "NOTIFY INDEXNOW NOW"}
          </button>
        </div>

        {discoveryNote ? (
          <div className="mt-3 text-[10px] font-semibold leading-5 text-white/[0.48]">
            {discoveryNote}
          </div>
        ) : null}

        {discovery ? (
          <div className="mt-5">
            <div className="grid gap-2 sm:grid-cols-2">
              {(discovery.checks || []).map((check: any) => (
                <div
                  key={check.id}
                  className="rounded-2xl border border-white/[0.09] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[10px] font-black text-white/[0.76]">
                      {check.label}
                    </div>
                    <span
                      className={`rounded-full border px-2 py-1 text-[8px] font-black ${
                        check.pass
                          ? "border-white/[0.18] text-white/[0.65]"
                          : "border-white/[0.12] text-white/[0.35]"
                      }`}
                    >
                      {check.pass ? "PASS" : "ATTENTION"}
                    </span>
                  </div>
                  <div className="mt-2 text-[9px] font-semibold leading-4 text-white/[0.34]">
                    {check.detail}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-white/[0.09] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] font-black text-white/[0.76]">
                  Google Search Console readiness
                </div>
                <span className="rounded-full border border-white/[0.16] px-2 py-1 text-[8px] font-black text-white/[0.6]">
                  {discovery.googleSearchConsole?.ready ? "READY" : "CHECK"}
                </span>
              </div>
              <div className="mt-2 text-[9px] font-semibold leading-4 text-white/[0.34]">
                {discovery.googleSearchConsole?.note}
              </div>
              <div className="mt-3 space-y-1 text-[9px] font-black text-white/[0.46]">
                {(discovery.googleSearchConsole?.sitemapUrls || []).map(
                  (url: string) => (
                    <div key={url} className="break-all">
                      {url}
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="mt-3 text-[8px] font-black uppercase tracking-[0.13em] text-white/[0.24]">
              Checked{" "}
              {new Intl.DateTimeFormat("en", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "Africa/Lagos",
              }).format(new Date(discovery.checkedAt))}
            </div>
          </div>
        ) : null}
      </section>
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
