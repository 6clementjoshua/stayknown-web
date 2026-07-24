import { createStayKnownIcon } from "@/lib/stayknown-icon";

export const runtime = "nodejs";
export const dynamic = "force-static";

export function GET() {
  return createStayKnownIcon({
    size: 512,
    maskable: false,
  });
}
