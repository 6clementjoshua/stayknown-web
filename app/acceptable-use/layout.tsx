import type { Metadata } from "next";
import type { ReactNode } from "react";

const TITLE = "StayKnown Acceptable Use Policy";
const DESCRIPTION = "Read StayKnown rules for lawful, consent-based use of LIVE location, SOS, secure chat, minors, payments, anti-stalking, reporting and abuse prevention.";
const CANONICAL = "/acceptable-use";

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
