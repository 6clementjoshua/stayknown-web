#!/usr/bin/env node

import {
  copyFile,
  mkdir,
  readFile,
  writeFile,
  access,
} from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const homepagePath = path.join(
  projectRoot,
  "components",
  "StayKnownHomePage.tsx",
);
const sitemapPath = path.join(projectRoot, "app", "sitemap.ts");

const requiredNewFiles = [
  "components/StayKnownChatDemo.tsx",
  "components/StayKnownChatExperience.tsx",
  "lib/stayknown-chat-content.ts",
  "app/chat/page.tsx",
  "app/chat/opengraph-image.tsx",
  "app/chat/twitter-image.tsx",
];

const timestamp = new Date()
  .toISOString()
  .replaceAll(":", "")
  .replaceAll(".", "-");
const backupRoot = path.join(
  projectRoot,
  ".stayknown-backups",
  `chat-website-${timestamp}`,
);

function fail(message) {
  console.error(`\nStayKnown Chat website installer: ${message}\n`);
  process.exit(1);
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function backup(relativePath) {
  const source = path.join(projectRoot, relativePath);
  const destination = path.join(backupRoot, relativePath);
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
}

function patchHomepage(source) {
  let updated = source.replaceAll("\r\n", "\n");

  const importLine =
    'import StayKnownChatDemo from "@/components/StayKnownChatDemo";';
  const importAnchor =
    'import StayKnownSocialLinks from "@/components/StayKnownSocialLinks";';

  if (!updated.includes(importLine)) {
    if (!updated.includes(importAnchor)) {
      fail(
        "The latest StayKnownSocialLinks import was not found in components/StayKnownHomePage.tsx. No homepage change was made.",
      );
    }
    updated = updated.replace(importAnchor, `${importAnchor}\n${importLine}`);
  }

  const demoRender = "      <StayKnownChatDemo />";
  const renderAnchor = "      <ChatAwarenessSection />";

  if (!updated.includes(demoRender)) {
    if (!updated.includes(renderAnchor)) {
      fail(
        "The ChatAwarenessSection render anchor was not found. No homepage section was replaced or guessed.",
      );
    }
    updated = updated.replace(
      renderAnchor,
      `${renderAnchor}\n${demoRender}`,
    );
  }

  const footerLink =
    '      { label: "Chat & Trusted Circles", href: "/chat" },';
  const footerAnchor =
    '      { label: "Secure Chat", href: "/learn/chat" },';

  if (!updated.includes(footerLink)) {
    if (!updated.includes(footerAnchor)) {
      fail(
        "The existing Secure Chat footer link was not found. The installer stopped rather than changing another footer block.",
      );
    }
    updated = updated.replace(
      footerAnchor,
      `${footerAnchor}\n${footerLink}`,
    );
  }

  if (!updated.includes("        #chat-demo,")) {
    const scrollAnchor = "        #guided-demo,";
    if (updated.includes(scrollAnchor)) {
      updated = updated.replace(
        scrollAnchor,
        `${scrollAnchor}\n        #chat-demo,`,
      );
    }
  }

  const publicCopyReplacements = {
  "title: \"ProMax MainShell\",": "title: \"Pro Max Home Experience\",",
  "\"A premium, plan-aware navigation shell built for fast access to safety, contacts, chat, profile, and high-value actions.\",": "\"A premium home experience with fast access to safety, contacts, Chat, profile, and essential actions.\",",
  "\"The SOS surface stays simple and readable, helping users understand when SOS is available and when it is not active.\",": "\"The SOS screen stays simple and readable, helping users understand when SOS is ready and when protection is active.\",",
  "\"Emergency contacts and SOS responders use approval flows so safety access remains intentional, trusted, and auditable.\",": "\"Emergency contacts and SOS responders use approval steps so safety access remains intentional, trusted, and clear.\",",
  "\"Stories, avatars, names, and profile surfaces help users recognize who they are connecting with before conversations begin.\",": "\"Stories, avatars, names, and profile details help users recognize who they are connecting with before conversations begin.\",",
  "title: \"Build your trusted circle\",": "title: \"Choose your approved contacts\",",
  "body: \"Add and approve the people who may receive safety information.\",": "body: \"Choose and approve the people who may receive your safety information.\",",
  "body=\"Explore the real StayKnown product surfaces already available across safety, consent, communication, verification, and emergency flows.\"": "body=\"Explore StayKnown across safety, consent, communication, verification, and emergency support.\"",
  "body=\"The website now reflects the same Starter, Pro, and Pro Max entitlements used by the app. Final currency, provider, and checkout availability are confirmed inside StayKnown.\"": "body=\"Choose Starter, Pro, or Pro Max based on the number of trusted people and safety tools you need. Final currency, provider, and checkout availability are confirmed inside StayKnown.\"",
  "body: \"StayKnown’s public rules address stalking, harassment, luring, unauthorized monitoring, abuse, and unsafe use.\",": "body: \"StayKnown’s safety policies address stalking, harassment, luring, unauthorized monitoring, abuse, and unsafe use.\",",
  "body: \"A dedicated disclosure route gives security researchers and users a responsible path for reporting concerns.\",": "body: \"A dedicated security disclosure page gives researchers and users a responsible way to report concerns.\",",
  "eyebrow=\"Trust made discoverable\"": "eyebrow=\"Trust and responsibility\"",
  "title=\"The strongest StayKnown policies should not remain hidden in the footer.\"": "title=\"Clear policies for safer, more respectful use.\"",
  "body=\"The homepage now points visitors directly to privacy, consent, anti-stalking, emergency, child-safety, billing, and security documentation while preserving every existing policy page.\"": "body=\"Explore StayKnown’s privacy, consent, anti-stalking, emergency, child-safety, billing, and security commitments before relying on the service.\"",
  "Download StayKnown, build your approved circle, and prepare your safety settings before you need them.": "Download StayKnown, choose your approved contacts, and prepare your safety settings before you need them."
};

  for (const [internalCopy, visitorCopy] of Object.entries(
    publicCopyReplacements,
  )) {
    updated = updated.replaceAll(internalCopy, visitorCopy);
  }

  return updated;
}

function patchSitemap(source) {
  let updated = source.replaceAll("\r\n", "\n");

  const updateConstant =
    'const CHAT_EXPERIENCE_UPDATE = "2026-07-30";';
  const constantAnchor =
    'const ACCOUNT_CLOSURE_UPDATE = "2026-07-27";';

  if (!updated.includes(updateConstant)) {
    if (!updated.includes(constantAnchor)) {
      fail(
        "The July 29 sitemap authority was not detected. app/sitemap.ts was not changed.",
      );
    }
    updated = updated.replace(
      constantAnchor,
      `${constantAnchor}\n${updateConstant}`,
    );
  }

  updated = updated.replace(
    'const HOMEPAGE_UPDATE = "2026-07-24";',
    'const HOMEPAGE_UPDATE = "2026-07-30";',
  );

  const chatRoute = `  {
    path: "/chat",
    lastModified: CHAT_EXPERIENCE_UPDATE,
    changeFrequency: "weekly",
    priority: 0.94,
    images: [
      absoluteUrl("/hero/secure-chat-biometric.png"),
      absoluteUrl("/hero/chat-translation.png"),
      absoluteUrl("/hero/chat-stickers-voice.png"),
      absoluteUrl("/hero/contact-approval.png"),
    ],
  },`;

  if (!updated.includes('path: "/chat"')) {
    const watchRouteAnchor = `  {
    path: "/watch",`;

    if (!updated.includes(watchRouteAnchor)) {
      fail(
        "The /watch core-route anchor was not found in app/sitemap.ts. The installer stopped without guessing a route location.",
      );
    }

    updated = updated.replace(
      watchRouteAnchor,
      `${chatRoute}\n${watchRouteAnchor}`,
    );
  }

  return updated;
}

async function main() {
  for (const relativePath of requiredNewFiles) {
    const filePath = path.join(projectRoot, relativePath);
    if (!(await exists(filePath))) {
      fail(
        `Missing ${relativePath}. Extract the ZIP directly into the StayKnown website project root before running this command.`,
      );
    }
  }

  if (!(await exists(homepagePath))) {
    fail(
      "components/StayKnownHomePage.tsx was not found. Run this command from the active website project root.",
    );
  }

  if (!(await exists(sitemapPath))) {
    fail(
      "app/sitemap.ts was not found. Run this command from the active website project root.",
    );
  }

  const homepageSource = await readFile(homepagePath, "utf8");
  const sitemapSource = await readFile(sitemapPath, "utf8");

  const patchedHomepage = patchHomepage(homepageSource);
  const patchedSitemap = patchSitemap(sitemapSource);

  const alreadyIntegrated =
    patchedHomepage === homepageSource.replaceAll("\r\n", "\n") &&
    patchedSitemap === sitemapSource.replaceAll("\r\n", "\n");

  if (alreadyIntegrated) {
    console.log("\nStayKnown Chat website addition is already integrated.");
    console.log("No files were changed.\n");
    return;
  }

  await backup("components/StayKnownHomePage.tsx");
  await backup("app/sitemap.ts");

  await writeFile(homepagePath, patchedHomepage, "utf8");
  await writeFile(sitemapPath, patchedSitemap, "utf8");

  const verification = [
    patchedHomepage.includes(
      'import StayKnownChatDemo from "@/components/StayKnownChatDemo";',
    ),
    patchedHomepage.includes("<StayKnownChatDemo />"),
    patchedHomepage.includes(
      '{ label: "Chat & Trusted Circles", href: "/chat" },',
    ),
    patchedSitemap.includes('path: "/chat"'),
    patchedSitemap.includes("CHAT_EXPERIENCE_UPDATE"),
  ];

  if (verification.some((passed) => !passed)) {
    fail(
      `Post-write verification failed. Restore the two files from ${backupRoot}.`,
    );
  }

  console.log("\nStayKnown Chat website addition installed successfully.");
  console.log("\nAdded:");
  console.log("  • Interactive animated Chat demo on the homepage");
  console.log("  • Dedicated /chat experience");
  console.log("  • Direct Chat, Trusted Circle, consent and permission explanation");
  console.log("  • Route metadata, FAQ, HowTo, ItemList and application JSON-LD");
  console.log("  • Dedicated Open Graph and X/Twitter social images");
  console.log("  • /chat sitemap entry and homepage footer route");
  console.log(`\nBackup: ${backupRoot}`);
  console.log("\nNext commands:");
  console.log("  npm run build");
  console.log("  npm run dev");
  console.log("\nPreview: http://localhost:3000/chat\n");
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  fail(`Unexpected failure: ${message}`);
});
