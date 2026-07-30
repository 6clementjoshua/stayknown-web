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
  `header-edge-${timestamp}`,
  "components",
  "StayKnownHomePage.tsx",
);

const currentHeaderClass =
  'className="mx-auto flex min-h-[68px] max-w-6xl items-center justify-between gap-3 px-4 sm:px-5 lg:px-6"';

const updatedHeaderClass =
  'className="mx-auto flex min-h-[68px] w-full max-w-none items-center justify-between gap-3 px-3 sm:px-4 lg:pl-6 lg:pr-1"';

const currentActionClass =
  '<div className="flex items-center gap-1">';

const updatedActionClass =
  '<div className="ml-auto flex shrink-0 items-center gap-1">';

function fail(message) {
  console.error(`StayKnown header-edge patch: ${message}`);
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

  let updated = source.replaceAll("\r\n", "\n");

  if (
    !updated.includes(currentHeaderClass) &&
    !updated.includes(updatedHeaderClass)
  ) {
    fail(
      "The expected homepage header container was not found. No changes were made.",
    );
  }

  if (!updated.includes("<PublicWebsiteVisitCounter")) {
    fail(
      "The visible visit counter is not present in this homepage version.",
    );
  }

  await mkdir(path.dirname(backupPath), {
    recursive: true,
  });
  await copyFile(homepagePath, backupPath);

  if (updated.includes(currentHeaderClass)) {
    updated = updated.replace(
      currentHeaderClass,
      updatedHeaderClass,
    );
  }

  if (!updated.includes(updatedActionClass)) {
    const actionIndex = updated.lastIndexOf(currentActionClass);

    if (actionIndex < 0) {
      fail(
        "The Download/menu/counter action group was not found. The backup remains available.",
      );
    }

    updated =
      updated.slice(0, actionIndex) +
      updatedActionClass +
      updated.slice(actionIndex + currentActionClass.length);
  }

  if (
    !updated.includes(updatedHeaderClass) ||
    !updated.includes(updatedActionClass)
  ) {
    fail(
      "The desktop edge alignment could not be verified. The backup remains available.",
    );
  }

  await writeFile(homepagePath, updated, "utf8");

  console.log("");
  console.log("StayKnown header actions moved to the desktop edge.");
  console.log("Desktop right padding: 4px.");
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
