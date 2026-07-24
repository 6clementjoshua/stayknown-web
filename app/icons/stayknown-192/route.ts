import { createStayKnownIcon } from "@/lib/stayknown-icon";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  return createStayKnownIcon({
    size: 192,
    maskable: false,
  });
}
