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
