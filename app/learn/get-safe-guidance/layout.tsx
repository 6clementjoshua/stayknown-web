import type { Metadata } from "next";
import type { ReactNode } from "react";

const TITLE = "GET SAFE Safety Guidance";
const DESCRIPTION = "Explore StayKnown GET SAFE guidance for safer Visits, trusted contacts, check-ins, secure communication, location awareness and emergency preparation.";
const CANONICAL = "/learn/get-safe-guidance";

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
