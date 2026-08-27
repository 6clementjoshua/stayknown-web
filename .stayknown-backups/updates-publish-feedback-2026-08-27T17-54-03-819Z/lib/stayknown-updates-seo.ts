import type { UpdateBlock } from "./stayknown-updates";

export type SeoIssue = {
  level: "block" | "warning" | "hint";
  code: string;
  message: string;
};
const ratio = (w: number, h: number, target: number) =>
  Math.abs(w / h - target) <= 0.035;

export function inspectSeo(input: {
  title: string;
  summary: string;
  slug: string;
  category: string;
  author_name: string;
  body: UpdateBlock[];
  hero_alt_text?: string | null;
  image_16_9_url?: string | null;
  image_4_3_url?: string | null;
  image_1_1_url?: string | null;
  imageMeta?: Record<string, { width: number; height: number }>;
  strict_seo?: boolean;
  canonical_path?: string | null;
}) {
  const issues: SeoIssue[] = [];
  const wc = input.body
    .map((b: any) => `${b.title || ""} ${b.text || ""} ${b.caption || ""}`)
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const block = (code: string, message: string) =>
    issues.push({ level: "block", code, message });
  const warn = (code: string, message: string) =>
    issues.push({ level: "warning", code, message });
  const hint = (code: string, message: string) =>
    issues.push({ level: "hint", code, message });
  if (!input.title.trim())
    block(
      "title_missing",
      "Headline is required. Google needs visible, descriptive page content and the structured Article headline is generated from this field.",
    );
  if (!input.slug.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))
    block(
      "slug_invalid",
      "Use a clean lowercase slug with words separated by hyphens. This becomes the permanent canonical URL.",
    );
  if (!input.summary.trim())
    block(
      "summary_missing",
      "Add a concise human-written summary. It supports the feed, social previews and the page description.",
    );
  if (!input.category.trim())
    block(
      "category_missing",
      "Choose a publication category so the feed and archive remain understandable.",
    );
  if (!input.author_name.trim())
    block(
      "author_missing",
      "Add the real publisher/author identity used by Article structured data.",
    );
  if (!input.body.length)
    block(
      "body_missing",
      "The article body is empty. A headline-only page must not be published.",
    );
  if (wc < 120)
    warn(
      "thin_content",
      `Only ${wc} words detected. Google has no required word count; this warning exists because the update may not yet give readers enough original information.`,
    );
  if (input.title.length > 75)
    warn(
      "title_long",
      "The headline is long and may be truncated on some devices. Google has no fixed Article headline character limit; concise titles are recommended.",
    );
  if (input.summary.length > 170)
    warn(
      "description_long",
      "The summary is long. Google may create its own snippet from page content, so keep this focused rather than stuffing keywords.",
    );
  if (input.summary.length < 70)
    hint(
      "description_short",
      "Consider a more informative summary so search and social previews explain the update clearly.",
    );
  const canonical = `/updates/${input.slug}`;
  if (input.canonical_path && input.canonical_path !== canonical)
    block(
      "canonical_mismatch",
      `Canonical must stay ${canonical} for this slug. Conflicting canonical signals can make indexing less predictable.`,
    );
  const images = [
    ["16:9", input.image_16_9_url, 16 / 9],
    ["4:3", input.image_4_3_url, 4 / 3],
    ["1:1", input.image_1_1_url, 1],
  ] as const;
  const anyImage = images.some(([, u]) => !!u);
  if (input.strict_seo) {
    for (const [label, url] of images)
      if (!url)
        block(
          `image_${label}_missing`,
          `Strict SEO is ON: add the ${label} representative image. Google recommends high-resolution 16:9, 4:3 and 1:1 Article images for best results.`,
        );
  } else if (!anyImage)
    warn(
      "images_missing",
      "No representative Article images are set. Google recommends high-resolution 16:9, 4:3 and 1:1 images for best results.",
    );
  if (anyImage && !input.hero_alt_text?.trim())
    block(
      "alt_missing",
      "Add accurate image alt text. It improves accessibility and gives search systems useful image context.",
    );
  for (const [label, url, target] of images) {
    if (!url) continue;
    if (!/^https:\/\//i.test(url))
      block(
        `image_${label}_https`,
        `${label} image must use a public HTTPS URL so crawlers can fetch it.`,
      );
    const m = input.imageMeta?.[label];
    if (m) {
      if (m.width * m.height < 50000)
        block(
          `image_${label}_small`,
          `${label} image is ${m.width}×${m.height} (${(m.width * m.height).toLocaleString()} pixels). Google recommends at least 50,000 pixels for Article representative images.`,
        );
      if (!ratio(m.width, m.height, target))
        block(
          `image_${label}_ratio`,
          `${label} slot contains a ${m.width}×${m.height} image, which does not match the expected ${label} aspect ratio.`,
        );
    } else if (input.strict_seo)
      hint(
        `image_${label}_verify`,
        `The editor will verify ${label} dimensions when the URL can be loaded in the browser. Ensure the image is crawlable and indexable.`,
      );
  }
  for (const b of input.body as any[]) {
    if (b.type === "image" && (!b.alt || !String(b.alt).trim()))
      block(
        "inline_alt_missing",
        "Every editorial image block needs meaningful alt text before publication.",
      );
    if (b.type === "link" && b.url && !/^(https:\/\/|\/)/i.test(b.url))
      warn(
        "link_scheme",
        "A link uses an unusual/non-HTTPS destination. Verify it before publishing.",
      );
  }
  hint(
    "people_first",
    "SEO quality is not keyword stuffing. Publish original, useful information written for people; the technical metadata is generated around that content.",
  );
  return issues;
}
