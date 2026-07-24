import type { MetadataRoute } from "next";

const DESCRIPTION =
  "StayKnown is a consent-first personal safety platform with active Visits, LIVE safety sharing, I’M SAFE check-ins, SOS alerts, approved contacts, and secure communication.";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",

    name: "StayKnown — Consent-First Personal Safety",
    short_name: "StayKnown",
    description: DESCRIPTION,

    start_url: "/",
    scope: "/",

    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",

    lang: "en",
    dir: "ltr",

    categories: ["lifestyle", "utilities"],

    icons: [
      {
        src: "/icons/stayknown-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/stayknown-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/stayknown-maskable-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],

    shortcuts: [
      {
        name: "How StayKnown Works",
        short_name: "How It Works",
        description:
          "Open the interactive StayKnown safety-flow presentation.",
        url: "/#guided-demo",
      },
      {
        name: "Explore StayKnown Features",
        short_name: "Features",
        description:
          "Explore Visits, LIVE sharing, SOS, approved contacts, and secure communication.",
        url: "/#app-preview",
      },
      {
        name: "StayKnown Plans",
        short_name: "Plans",
        description:
          "Compare Starter, Pro, and Pro Max safety capacity.",
        url: "/#plans",
      },
      {
        name: "StayKnown Help Center",
        short_name: "Help",
        description:
          "Open StayKnown onboarding, feature, and troubleshooting guidance.",
        url: "/help-center",
      },
    ],
  };
}
