import type { Metadata } from "next";
import type { ReactNode } from "react";

const TITLE = "Contact Approval \u0026 Consent";
const OG_TITLE = "Contact Approval \u0026 Consent | StayKnown";
const DESCRIPTION = "Learn how StayKnown handles approved contacts, SOS responders, consent, removals and anti-stalking safeguards for trusted safety connections worldwide.";
const CANONICAL = "/contact-consent";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,

  alternates: {
    canonical: CANONICAL,
  },

  openGraph: {
    type: "website",
    url: CANONICAL,
    title: OG_TITLE,
    description: DESCRIPTION,
    siteName: "StayKnown",
    locale: "en_NG",
  },

  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
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
