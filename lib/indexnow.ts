import "server-only";

const SITE_ORIGIN = "https://www.stay-known.com";
const SITE_HOST = "www.stay-known.com";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const INDEXNOW_MAX_URLS_PER_REQUEST = 10_000;
const INDEXNOW_REQUEST_TIMEOUT_MS = 15_000;

const INDEXNOW_KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/;

const BLOCKED_PATH_PREFIXES = ["/api", "/login-callback", "/live"] as const;

export type IndexNowSubmissionBatch = {
  batchNumber: number;
  urlCount: number;
  status: number;
  accepted: boolean;
};

export type IndexNowSubmissionResult = {
  submitted: boolean;
  accepted: boolean;
  urlCount: number;
  batchCount: number;
  batches: readonly IndexNowSubmissionBatch[];
};

type SubmitIndexNowOptions = {
  key?: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
};

function cleanEnvironmentValue(value: string | undefined): string {
  return (value ?? "").trim();
}

function getIndexNowKey(explicitKey?: string): string {
  const key = cleanEnvironmentValue(explicitKey ?? process.env.INDEXNOW_KEY);

  if (!INDEXNOW_KEY_PATTERN.test(key)) {
    throw new Error(
      "INDEXNOW_KEY must contain 8 to 128 letters, numbers, or hyphens.",
    );
  }

  return key;
}

function getIndexNowKeyLocation(key: string): string {
  return `${SITE_ORIGIN}/${key}.txt`;
}

function isBlockedPath(pathname: string): boolean {
  const normalizedPath = pathname.toLowerCase();

  return BLOCKED_PATH_PREFIXES.some((prefix) => {
    return normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`);
  });
}

function normalizePathname(pathname: string): string {
  if (pathname === "/") return pathname;

  const withoutRepeatedTrailingSlashes = pathname.replace(/\/+$/, "");
  return withoutRepeatedTrailingSlashes || "/";
}

/**
 * Converts a relative or absolute StayKnown URL into one canonical HTTPS URL.
 *
 * Foreign hosts, credentials, fragments and private application routes are
 * rejected. Query strings are preserved because a deliberately canonical
 * public URL may use them, while fragments are removed because they are not
 * sent to web servers or independently indexed.
 */
export function canonicalizeIndexNowUrl(input: string): string | null {
  const candidate = input.trim();
  if (!candidate) return null;

  let url: URL;

  try {
    url = new URL(candidate, SITE_ORIGIN);
  } catch {
    return null;
  }

  if (url.protocol !== "https:") return null;
  if (url.hostname.toLowerCase() !== SITE_HOST) return null;
  if (url.username || url.password) return null;
  if (isBlockedPath(url.pathname)) return null;

  url.protocol = "https:";
  url.hostname = SITE_HOST;
  url.port = "";
  url.pathname = normalizePathname(url.pathname);
  url.hash = "";

  return url.toString();
}

/**
 * Canonicalizes, filters and deduplicates a set of changed public URLs.
 */
export function prepareIndexNowUrls(
  inputs: readonly string[],
): readonly string[] {
  const uniqueUrls = new Set<string>();

  for (const input of inputs) {
    const canonicalUrl = canonicalizeIndexNowUrl(input);
    if (canonicalUrl) uniqueUrls.add(canonicalUrl);
  }

  return Array.from(uniqueUrls);
}

function chunkUrls(urls: readonly string[]): readonly (readonly string[])[] {
  const batches: string[][] = [];

  for (
    let index = 0;
    index < urls.length;
    index += INDEXNOW_MAX_URLS_PER_REQUEST
  ) {
    batches.push(urls.slice(index, index + INDEXNOW_MAX_URLS_PER_REQUEST));
  }

  return batches;
}

async function submitBatch({
  urls,
  key,
  keyLocation,
  batchNumber,
  fetcher,
  timeoutMs,
}: {
  urls: readonly string[];
  key: string;
  keyLocation: string;
  batchNumber: number;
  fetcher: typeof fetch;
  timeoutMs: number;
}): Promise<IndexNowSubmissionBatch> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetcher(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json; charset=utf-8",
        accept: "application/json, text/plain, */*",
      },
      body: JSON.stringify({
        host: SITE_HOST,
        key,
        keyLocation,
        urlList: urls,
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    const accepted = response.status === 200 || response.status === 202;

    return {
      batchNumber,
      urlCount: urls.length,
      status: response.status,
      accepted,
    };
  } catch (error) {
    const errorType = error instanceof Error ? error.name : "UnknownError";

    throw new Error(
      `IndexNow request failed before receiving a response (${errorType}).`,
    );
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Submits meaningful public StayKnown URL changes to the global IndexNow
 * endpoint. The verification key is read server-side from INDEXNOW_KEY unless
 * an explicit key is provided by a trusted server-only caller.
 *
 * HTTP 200 means accepted. HTTP 202 is also treated as accepted because it is
 * the documented first-submission state while the key file is being verified.
 */
export async function submitIndexNowUrls(
  inputs: readonly string[],
  options: SubmitIndexNowOptions = {},
): Promise<IndexNowSubmissionResult> {
  const urls = prepareIndexNowUrls(inputs);

  if (urls.length === 0) {
    return {
      submitted: false,
      accepted: false,
      urlCount: 0,
      batchCount: 0,
      batches: [],
    };
  }

  const key = getIndexNowKey(options.key);
  const keyLocation = getIndexNowKeyLocation(key);
  const fetcher = options.fetcher ?? fetch;
  const timeoutMs =
    options.timeoutMs != null &&
    Number.isFinite(options.timeoutMs) &&
    options.timeoutMs > 0
      ? Math.floor(options.timeoutMs)
      : INDEXNOW_REQUEST_TIMEOUT_MS;

  const urlBatches = chunkUrls(urls);
  const batches: IndexNowSubmissionBatch[] = [];

  for (let index = 0; index < urlBatches.length; index += 1) {
    const batch = await submitBatch({
      urls: urlBatches[index],
      key,
      keyLocation,
      batchNumber: index + 1,
      fetcher,
      timeoutMs,
    });

    batches.push(batch);
  }

  return {
    submitted: true,
    accepted: batches.every((batch) => batch.accepted),
    urlCount: urls.length,
    batchCount: batches.length,
    batches,
  };
}

export const indexNowConfig = Object.freeze({
  siteOrigin: SITE_ORIGIN,
  siteHost: SITE_HOST,
  endpoint: INDEXNOW_ENDPOINT,
  maximumUrlsPerRequest: INDEXNOW_MAX_URLS_PER_REQUEST,
});
