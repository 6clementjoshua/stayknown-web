import { timingSafeEqual } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { prepareIndexNowUrls, submitIndexNowUrls } from "../../../lib/indexnow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REQUEST_URLS = 10_000;
const MAX_REQUEST_BYTES = 1_000_000;

type IndexNowRequestBody = {
  url?: unknown;
  urls?: unknown;
};

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      "cache-control": "no-store, max-age=0",
      "x-content-type-options": "nosniff",
    },
  });
}

function getConfiguredSecret(): string {
  return (process.env.INDEXNOW_SUBMIT_SECRET ?? "").trim();
}

function getPresentedSecret(request: NextRequest): string {
  const authorization = request.headers.get("authorization")?.trim() ?? "";

  if (authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.slice(7).trim();
  }

  return request.headers.get("x-indexnow-secret")?.trim() ?? "";
}

function secretsMatch(expected: string, presented: string): boolean {
  if (!expected || !presented) return false;

  const expectedBuffer = Buffer.from(expected, "utf8");
  const presentedBuffer = Buffer.from(presented, "utf8");

  if (expectedBuffer.length != presentedBuffer.length) return false;

  return timingSafeEqual(expectedBuffer, presentedBuffer);
}

function normalizeRequestUrls(body: IndexNowRequestBody): string[] {
  const candidates: unknown[] = [];

  if (typeof body.url === "string") {
    candidates.push(body.url);
  }

  if (Array.isArray(body.urls)) {
    candidates.push(...body.urls);
  }

  const urls = candidates.filter(
    (value): value is string => typeof value === "string",
  );

  return urls;
}

function contentLengthIsAllowed(request: NextRequest): boolean {
  const rawContentLength = request.headers.get("content-length");
  if (!rawContentLength) return true;

  const contentLength = Number.parseInt(rawContentLength, 10);

  return (
    Number.isFinite(contentLength) &&
    contentLength >= 0 &&
    contentLength <= MAX_REQUEST_BYTES
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const configuredSecret = getConfiguredSecret();

  if (!configuredSecret) {
    console.error(
      "INDEXNOW_ROUTE unavailable reason=missing_submission_secret",
    );

    return jsonResponse(
      {
        ok: false,
        code: "service_unavailable",
        message: "IndexNow submission is not configured.",
      },
      503,
    );
  }

  const presentedSecret = getPresentedSecret(request);

  if (!secretsMatch(configuredSecret, presentedSecret)) {
    return jsonResponse(
      {
        ok: false,
        code: "unauthorized",
        message: "A valid submission secret is required.",
      },
      401,
    );
  }

  if (!contentLengthIsAllowed(request)) {
    return jsonResponse(
      {
        ok: false,
        code: "request_too_large",
        message: "The IndexNow request body is too large.",
      },
      413,
    );
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    return jsonResponse(
      {
        ok: false,
        code: "unsupported_media_type",
        message: "Send the request body as application/json.",
      },
      415,
    );
  }

  let body: IndexNowRequestBody;

  try {
    const parsed: unknown = await request.json();

    if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return jsonResponse(
        {
          ok: false,
          code: "invalid_body",
          message: "The request body must be a JSON object.",
        },
        400,
      );
    }

    body = parsed as IndexNowRequestBody;
  } catch {
    return jsonResponse(
      {
        ok: false,
        code: "invalid_json",
        message: "The request body contains invalid JSON.",
      },
      400,
    );
  }

  const requestedUrls = normalizeRequestUrls(body);

  if (requestedUrls.length === 0) {
    return jsonResponse(
      {
        ok: false,
        code: "missing_urls",
        message: "Provide one URL or a non-empty URLs array.",
      },
      400,
    );
  }

  if (requestedUrls.length > MAX_REQUEST_URLS) {
    return jsonResponse(
      {
        ok: false,
        code: "too_many_urls",
        message: `Submit no more than ${MAX_REQUEST_URLS} URLs at once.`,
      },
      400,
    );
  }

  const preparedUrls = prepareIndexNowUrls(requestedUrls);

  if (preparedUrls.length === 0) {
    return jsonResponse(
      {
        ok: false,
        code: "no_public_urls",
        message: "No valid public StayKnown URLs remained after validation.",
      },
      400,
    );
  }

  try {
    const result = await submitIndexNowUrls(preparedUrls);

    if (!result.accepted) {
      console.error(
        "INDEXNOW_ROUTE submission_not_accepted " +
          `url_count=${result.urlCount} batch_count=${result.batchCount}`,
      );

      return jsonResponse(
        {
          ok: false,
          code: "submission_not_accepted",
          submitted: result.submitted,
          accepted: result.accepted,
          urlCount: result.urlCount,
          batchCount: result.batchCount,
          batches: result.batches,
        },
        502,
      );
    }

    return jsonResponse(
      {
        ok: true,
        submitted: result.submitted,
        accepted: result.accepted,
        requestedUrlCount: requestedUrls.length,
        acceptedUrlCount: result.urlCount,
        rejectedUrlCount: requestedUrls.length - result.urlCount,
        batchCount: result.batchCount,
        batches: result.batches,
      },
      200,
    );
  } catch (error) {
    const errorType = error instanceof Error ? error.name : "UnknownError";

    console.error(`INDEXNOW_ROUTE submission_failed type=${errorType}`);

    return jsonResponse(
      {
        ok: false,
        code: "submission_failed",
        message: "IndexNow could not be reached right now.",
      },
      502,
    );
  }
}
