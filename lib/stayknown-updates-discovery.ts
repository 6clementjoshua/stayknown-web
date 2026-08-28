import { submitIndexNowUrls } from "@/lib/indexnow";
import { canonicalPath, SITE_URL } from "@/lib/stayknown-updates";

export type UpdatesDiscoveryResult = {
  configured: boolean;
  submitted: boolean;
  accepted: boolean;
  reason: string;
  urls: string[];
  status: string;
  error?: string;
};

function absolute(pathname: string): string {
  return new URL(pathname, SITE_URL).toString();
}

function cleanSlugs(slugs: readonly string[]): string[] {
  return Array.from(
    new Set(
      slugs
        .map((value) => String(value || "").trim())
        .filter((value) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)),
    ),
  );
}

/**
 * Notify IndexNow-capable search engines that one or more public StayKnown
 * Update URLs changed. This is deliberately best-effort: publishing, editing,
 * restoring or deleting an Update must not fail merely because a search-engine
 * notification endpoint is temporarily unavailable.
 */
export async function notifyUpdatesDiscovery(
  slugs: readonly string[],
  reason: string,
): Promise<UpdatesDiscoveryResult> {
  const uniqueSlugs = cleanSlugs(slugs);
  const urls = [
    absolute("/updates"),
    ...uniqueSlugs.map((slug) => absolute(canonicalPath(slug))),
  ];

  const configured = Boolean(process.env.INDEXNOW_KEY?.trim());

  if (!configured) {
    return {
      configured: false,
      submitted: false,
      accepted: false,
      reason,
      urls,
      status: "not_configured",
      error: "INDEXNOW_KEY is not configured on the server.",
    };
  }

  try {
    const result = await submitIndexNowUrls(urls);
    return {
      configured: true,
      submitted: result.submitted,
      accepted: result.accepted,
      reason,
      urls,
      status: result.accepted ? "accepted" : "submitted_with_rejection",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "IndexNow notification failed.";

    console.error("updates_indexnow_notification_failed", {
      reason,
      urlCount: urls.length,
      error: message,
    });

    return {
      configured: true,
      submitted: false,
      accepted: false,
      reason,
      urls,
      status: "failed",
      error: message,
    };
  }
}
