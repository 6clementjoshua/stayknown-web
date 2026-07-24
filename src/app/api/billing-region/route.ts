import { NextRequest, NextResponse } from "next/server";
import { resolveBillingRegionFromHeaders } from "@/lib/stayknown-billing-region";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const snapshot = await resolveBillingRegionFromHeaders(request.headers);

  return NextResponse.json(snapshot, {
    status: 200,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      Vary: [
        "x-vercel-ip-country",
        "cf-ipcountry",
        "cloudfront-viewer-country",
        "fastly-client-country",
        "x-country-code",
        "x-forwarded-for",
      ].join(", "),
    },
  });
}
