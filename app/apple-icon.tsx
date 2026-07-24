import { createStayKnownIcon } from "@/lib/stayknown-icon";

export const runtime = "nodejs";
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default async function AppleIcon() {
  return createStayKnownIcon({
    size: 180,
  });
}
