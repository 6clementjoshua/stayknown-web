#!/usr/bin/env node

import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
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
  `site-visit-counter-${timestamp}`,
  "components",
  "StayKnownHomePage.tsx",
);

const importAnchor =
  'import StayKnownActionMenu from "@/components/StayKnownActionMenu";';

const counterImport =
  'import PublicWebsiteVisitCounter from "@/components/PublicWebsiteVisitCounter";';

const menuAnchor = `            <div className="sk-menu-wrap">
              <StayKnownActionMenu />
            </div>`;

const menuReplacement = `            <div className="sk-menu-wrap">
              <StayKnownActionMenu />
            </div>
            <PublicWebsiteVisitCounter />`;

function fail(message) {
  console.error(`StayKnown visit-counter patch: ${message}`);
  process.exit(1);
}

async function main() {
  let source;

  try {
    source = await readFile(homepagePath, "utf8");
  } catch {
    fail(
      "components/StayKnownHomePage.tsx was not found. Run this command from the website project root.",
    );
  }

  if (
    !source.includes(importAnchor) &&
    !source.includes(counterImport)
  ) {
    fail(
      "The expected StayKnownActionMenu import was not found. The homepage file may be a different version.",
    );
  }

  if (
    !source.includes(menuAnchor) &&
    !source.includes("<PublicWebsiteVisitCounter")
  ) {
    fail(
      "The expected three-dot menu block was not found. No homepage change was made.",
    );
  }

  if (
    source.includes(counterImport) &&
    source.includes("<PublicWebsiteVisitCounter")
  ) {
    console.log(
      "StayKnown visit-counter patch: the homepage is already integrated.",
    );
    return;
  }

  await mkdir(path.dirname(backupPath), {
    recursive: true,
  });
  await copyFile(homepagePath, backupPath);

  let updated = source.replaceAll("\r\n", "\n");

  if (!updated.includes(counterImport)) {
    updated = updated.replace(
      importAnchor,
      `${importAnchor}\n${counterImport}`,
    );
  }

  if (!updated.includes("<PublicWebsiteVisitCounter")) {
    updated = updated.replace(
      menuAnchor,
      menuReplacement,
    );
  }

  if (
    !updated.includes(counterImport) ||
    !updated.includes("<PublicWebsiteVisitCounter")
  ) {
    fail(
      "The counter integration could not be verified. The original homepage remains available in the backup.",
    );
  }

  await writeFile(homepagePath, updated, "utf8");

  console.log("");
  console.log(
    "StayKnown visible website visit counter integrated successfully.",
  );
  console.log(
    "Placement: immediately after the three-dot header action.",
  );
  console.log(`Backup: ${backupPath}`);
  console.log("");
  console.log("Next command:");
  console.log("npm run build");
}

main().catch((error) => {
  const type =
    error instanceof Error ? error.name : "UnknownError";
  fail(`Unexpected patch failure (${type}).`);
});
