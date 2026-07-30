#!/usr/bin/env node

import {
  copyFile,
  mkdir,
  readFile,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const homepagePath = path.join(
  projectRoot,
  "components",
  "StayKnownHomePage.tsx",
);

const timestamp = new Date()
  .toISOString()
  .replaceAll(":", "")
  .replaceAll(".", "-");

const backupPath = path.join(
  projectRoot,
  ".stayknown-backups",
  `center-home-navigation-${timestamp}`,
  "components",
  "StayKnownHomePage.tsx",
);

const centeredNavClass =
  "absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex";

function fail(message) {
  console.error(
    `StayKnown centered-navigation patch: ${message}`,
  );
  process.exit(1);
}

function addClassToken(classValue, token) {
  const tokens = classValue
    .split(/\s+/)
    .map((value) => value.trim())
    .filter(Boolean);

  if (!tokens.includes(token)) {
    tokens.unshift(token);
  }

  return tokens.join(" ");
}

async function main() {
  let source;

  try {
    source = await readFile(homepagePath, "utf8");
  } catch {
    fail(
      "components/StayKnownHomePage.tsx was not found. Run this from C:\\Users\\suppo\\stayknown-web.",
    );
  }

  let updated = source.replaceAll("\r\n", "\n");

  if (!updated.includes('aria-label="Homepage sections"')) {
    fail(
      'The navigation identified by aria-label="Homepage sections" was not found. No changes were made.',
    );
  }

  if (!updated.includes("<PublicWebsiteVisitCounter")) {
    fail(
      "The visible Visits counter was not found. No changes were made.",
    );
  }

  const navPattern =
    /<nav\b(?=[^>]*aria-label="Homepage sections")[^>]*>/;

  const navMatch = updated.match(navPattern);

  if (!navMatch) {
    fail(
      "The homepage navigation opening tag could not be read. No changes were made.",
    );
  }

  let updatedNavTag = navMatch[0];

  if (/className="[^"]*"/.test(updatedNavTag)) {
    updatedNavTag = updatedNavTag.replace(
      /className="[^"]*"/,
      `className="${centeredNavClass}"`,
    );
  } else {
    updatedNavTag = updatedNavTag.replace(
      "<nav",
      `<nav className="${centeredNavClass}"`,
    );
  }

  updated = updated.replace(navPattern, updatedNavTag);

  const headerStart = updated.indexOf(
    '<header className="sticky',
  );

  if (headerStart < 0) {
    fail(
      "The sticky homepage header was not found. No changes were made.",
    );
  }

  const firstDivPattern =
    /<div className="([^"]+)">/g;

  firstDivPattern.lastIndex = headerStart;
  const firstDivMatch = firstDivPattern.exec(updated);

  if (
    !firstDivMatch ||
    firstDivMatch.index - headerStart > 1000
  ) {
    fail(
      "The main header container was not found. No changes were made.",
    );
  }

  const currentContainerClass = firstDivMatch[1];
  const updatedContainerClass = addClassToken(
    currentContainerClass,
    "relative",
  );

  const currentContainerTag = firstDivMatch[0];
  const updatedContainerTag = currentContainerTag.replace(
    `className="${currentContainerClass}"`,
    `className="${updatedContainerClass}"`,
  );

  updated =
    updated.slice(0, firstDivMatch.index) +
    updatedContainerTag +
    updated.slice(
      firstDivMatch.index + currentContainerTag.length,
    );

  const finalNavMatch = updated.match(navPattern);

  if (
    !finalNavMatch ||
    !finalNavMatch[0].includes(centeredNavClass)
  ) {
    fail(
      "The centered navigation result could not be verified. No file was written.",
    );
  }

  if (!updated.includes("<PublicWebsiteVisitCounter")) {
    fail(
      "The Visits counter was unexpectedly missing after the patch. No file was written.",
    );
  }

  await mkdir(path.dirname(backupPath), {
    recursive: true,
  });
  await copyFile(homepagePath, backupPath);
  await writeFile(homepagePath, updated, "utf8");

  console.log("");
  console.log(
    "StayKnown desktop navigation is now centered.",
  );
  console.log(
    "Preserved: Download, three-dot menu, and Visits at the right edge.",
  );
  console.log(
    "Preserved: logo and brand at the left.",
  );
  console.log(`Backup: ${backupPath}`);
  console.log("");
  console.log("Next command:");
  console.log("npm run build");
}

main().catch((error) => {
  const type =
    error instanceof Error
      ? error.name
      : "UnknownError";

  fail(`Unexpected patch failure (${type}).`);
});
