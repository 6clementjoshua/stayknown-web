#!/usr/bin/env node

import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local", quiet: true });
loadEnv({ path: ".env", quiet: true });

const DEFAULT_SITE_ORIGIN = "https://www.stay-known.com";
const MAX_URLS_PER_REQUEST = 10_000;
const REQUEST_TIMEOUT_MS = 20_000;

function printUsage() {
  console.log(`
StayKnown IndexNow submission

Submit selected public URLs:
  npm run indexnow -- /
  npm run indexnow -- /features /plans
  npm run indexnow -- --url /features --url /plans

Submit every URL currently listed in the deployed sitemap:
  npm run indexnow -- --all

Required environment variable:
  INDEXNOW_SUBMIT_SECRET=<private route secret>

Canonical public host:
  https://www.stay-known.com
`);
}

function fail(message, exitCode = 1) {
  console.error(`IndexNow: ${message}`);
  process.exit(exitCode);
}

function parseArguments(argv) {
  const selectedUrls = [];
  let submitAll = false;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--help" || argument === "-h") {
      printUsage();
      process.exit(0);
    }

    if (argument === "--all" || argument === "--sitemap") {
      submitAll = true;
      continue;
    }

    if (argument === "--url") {
      const value = argv[index + 1];

      if (!value || value.startsWith("--")) {
        fail("--url requires a relative or absolute URL value.");
      }

      selectedUrls.push(value);
      index += 1;
      continue;
    }

    if (argument.startsWith("--")) {
      fail(`Unknown option: ${argument}`);
    }

    selectedUrls.push(argument);
  }

  if (submitAll && selectedUrls.length > 0) {
    fail("Use either --all or selected URLs, not both.");
  }

  return {
    submitAll,
    selectedUrls,
  };
}

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

function extractSitemapLocations(xml) {
  const locations = [];
  const expression = /<loc>\s*([^<]+?)\s*<\/loc>/giu;

  for (const match of xml.matchAll(expression)) {
    const value = decodeXml(match[1] ?? "").trim();
    if (value) locations.push(value);
  }

  return locations;
}

function canonicalizePublicUrl(input, siteOrigin) {
  let url;

  try {
    url = new URL(input, siteOrigin);
  } catch {
    return null;
  }

  const canonicalOrigin = new URL(siteOrigin);

  if (
    url.protocol !== canonicalOrigin.protocol ||
    url.hostname.toLowerCase() !== canonicalOrigin.hostname.toLowerCase() ||
    url.port !== canonicalOrigin.port ||
    url.username ||
    url.password
  ) {
    return null;
  }

  const lowerPath = url.pathname.toLowerCase();

  if (
    lowerPath === "/api" ||
    lowerPath.startsWith("/api/") ||
    lowerPath === "/login-callback" ||
    lowerPath.startsWith("/login-callback/") ||
    lowerPath === "/live" ||
    lowerPath.startsWith("/live/")
  ) {
    return null;
  }

  url.hash = "";

  if (url.pathname !== "/") {
    url.pathname = url.pathname.replace(/\/+$/, "") || "/";
  }

  return url.toString();
}

function prepareUrls(inputs, siteOrigin) {
  const uniqueUrls = new Set();

  for (const input of inputs) {
    const canonicalUrl = canonicalizePublicUrl(input, siteOrigin);
    if (canonicalUrl) uniqueUrls.add(canonicalUrl);
  }

  return Array.from(uniqueUrls);
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      cache: "no-store",
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function loadUrlsFromSitemap(siteOrigin) {
  const sitemapUrl = `${siteOrigin}/sitemap.xml`;
  let response;

  try {
    response = await fetchWithTimeout(sitemapUrl, {
      headers: {
        accept: "application/xml, text/xml, */*",
      },
    });
  } catch (error) {
    const type = error instanceof Error ? error.name : "UnknownError";
    fail(`Could not fetch the deployed sitemap (${type}).`);
  }

  if (!response.ok) {
    fail(`The deployed sitemap returned HTTP ${response.status}.`);
  }

  const xml = await response.text();
  const locations = extractSitemapLocations(xml);

  if (locations.length === 0) {
    fail("No <loc> entries were found in the deployed sitemap.");
  }

  return locations;
}

function chunkUrls(urls) {
  const batches = [];

  for (let index = 0; index < urls.length; index += MAX_URLS_PER_REQUEST) {
    batches.push(urls.slice(index, index + MAX_URLS_PER_REQUEST));
  }

  return batches;
}

async function submitBatch({
  endpoint,
  secret,
  urls,
  batchNumber,
  totalBatches,
}) {
  let response;

  try {
    response = await fetchWithTimeout(endpoint, {
      method: "POST",
      headers: {
        authorization: `Bearer ${secret}`,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ urls }),
    });
  } catch (error) {
    const type = error instanceof Error ? error.name : "UnknownError";
    fail(`Batch ${batchNumber}/${totalBatches} could not be sent (${type}).`);
  }

  let payload = null;

  try {
    payload = await response.json();
  } catch {
    // A non-JSON response is handled by the HTTP-status failure below.
  }

  if (!response.ok || payload?.ok !== true) {
    const code =
      typeof payload?.code === "string"
        ? payload.code
        : `http_${response.status}`;

    fail(
      `Batch ${batchNumber}/${totalBatches} was rejected (${code}).`,
    );
  }

  const acceptedUrlCount =
    typeof payload.acceptedUrlCount === "number"
      ? payload.acceptedUrlCount
      : urls.length;

  const rejectedUrlCount =
    typeof payload.rejectedUrlCount === "number"
      ? payload.rejectedUrlCount
      : Math.max(0, urls.length - acceptedUrlCount);

  console.log(
    `IndexNow batch ${batchNumber}/${totalBatches}: ` +
      `${acceptedUrlCount} accepted, ${rejectedUrlCount} rejected.`,
  );

  return {
    acceptedUrlCount,
    rejectedUrlCount,
  };
}

async function main() {
  const { submitAll, selectedUrls } = parseArguments(
    process.argv.slice(2),
  );

  const origin = DEFAULT_SITE_ORIGIN;

  const secret = process.env.INDEXNOW_SUBMIT_SECRET?.trim();

  if (!secret) {
    fail(
      "INDEXNOW_SUBMIT_SECRET is missing. Add it to .env.local or the current shell.",
    );
  }

  let requestedUrls;

  if (submitAll) {
    console.log(`IndexNow: reading ${origin}/sitemap.xml`);
    requestedUrls = await loadUrlsFromSitemap(origin);
  } else {
    requestedUrls = selectedUrls;
  }

  if (requestedUrls.length === 0) {
    printUsage();
    fail("Provide at least one public URL or use --all.");
  }

  const preparedUrls = prepareUrls(requestedUrls, origin);

  if (preparedUrls.length === 0) {
    fail("No valid public StayKnown URLs remained after validation.");
  }

  const endpoint = `${origin}/api/indexnow`;
  const batches = chunkUrls(preparedUrls);

  console.log(
    `IndexNow: submitting ${preparedUrls.length} public URL` +
      `${preparedUrls.length === 1 ? "" : "s"} in ${batches.length} batch` +
      `${batches.length === 1 ? "" : "es"}.`,
  );

  let acceptedTotal = 0;
  let rejectedTotal = 0;

  for (let index = 0; index < batches.length; index += 1) {
    const result = await submitBatch({
      endpoint,
      secret,
      urls: batches[index],
      batchNumber: index + 1,
      totalBatches: batches.length,
    });

    acceptedTotal += result.acceptedUrlCount;
    rejectedTotal += result.rejectedUrlCount;
  }

  console.log(
    `IndexNow complete: ${acceptedTotal} accepted, ` +
      `${rejectedTotal} rejected.`,
  );
}

main().catch((error) => {
  const type = error instanceof Error ? error.name : "UnknownError";
  fail(`Unexpected submission failure (${type}).`);
});