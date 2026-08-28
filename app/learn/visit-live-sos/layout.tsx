import type { Metadata } from "next";
import type { ReactNode } from "react";

const TITLE = "Visit, LIVE & SOS Safety";
const DESCRIPTION = "Learn how StayKnown combines active Visits, LIVE safety sharing and SOS escalation so trusted contacts receive clearer context when support is needed.";
const CANONICAL = "/learn/visit-live-sos";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,

  alternates: {
    canonical: CANONICAL,
  },

  openGraph: {
    type: "website",
    url: CANONICAL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "StayKnown",
    locale: "en_NG",
  },

  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RouteLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}
