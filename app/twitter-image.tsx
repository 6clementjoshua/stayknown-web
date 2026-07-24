import { createStayKnownSocialImage } from "@/lib/stayknown-social-image";

export const alt =
  "StayKnown consent-first personal safety app with active Visits, LIVE sharing, I’M SAFE, SOS, and approved contacts.";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";
export const runtime = "nodejs";

export default async function TwitterImage() {
  return createStayKnownSocialImage({
    variant: "twitter",
  });
}
