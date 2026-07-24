import { createStayKnownIcon } from "@/lib/stayknown-icon";

export const runtime = "nodejs";
export const size = {
  width: 512,
  height: 512,
};
export const contentType = "image/png";

export default async function Icon() {
  return createStayKnownIcon({
    size: 512,
  });
}
