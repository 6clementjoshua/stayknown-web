import type { Metadata } from "next";
import type { ReactNode } from "react";

const TITLE = "Submit a StayKnown Feature";
const DESCRIPTION = "Submit a StayKnown feature idea for safety, SOS, LIVE location, trusted contacts, chat, privacy, accessibility, wallet and future product improvements.";
const CANONICAL = "/submit-feature";

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
