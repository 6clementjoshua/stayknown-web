import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRole) {
  console.error(
    "Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRole, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const BUCKET = "mail-console-attachments";
const DRY_RUN = !process.argv.includes("--delete");

// Paste the remaining object names here from the SQL query.
// Example:
// const OBJECTS_TO_DELETE = [
//   "campaign-id/body-image-example.png",
// ];
const OBJECTS_TO_DELETE = [
  "2989df8d-40aa-41d0-9b36-ef9f9f8329a5/body-inline-image-body-image-1782636434724-20d36f80377ca8-767ae32e-bb55-4f6e-aa2f-0c2cea32c1c8-StayKnown_Image.png",
  "2989df8d-40aa-41d0-9b36-ef9f9f8329a5/body-inline-image-body-image-1782631097124-1dc381d16a3e68-900080fa-4cab-4dfe-8be1-e2dad0234dd6-StayKnown_Image.png",
  "2989df8d-40aa-41d0-9b36-ef9f9f8329a5/body-inline-image-body-image-1782630995978-90123a00b0338-f41c14f8-7cdc-4840-9939-e61519bd94ab-StayKnown_Image.png",
  "2989df8d-40aa-41d0-9b36-ef9f9f8329a5/body-inline-image-body-image-1782630841882-aa052682d136d-c0c3c3e9-2cc9-4762-b487-8ed7ed9ba828-StayKnown_Image.png",
  "2989df8d-40aa-41d0-9b36-ef9f9f8329a5/body-inline-image-body-image-1782630779448-1d988dac3baf08-444d3f51-7f03-4d1a-ae3c-cb981c54d00d-StayKnown_Image.png",
  "2989df8d-40aa-41d0-9b36-ef9f9f8329a5/body-inline-image-body-image-1782630728449-b0fa2c1831aa98-042030b5-7234-496c-a7b4-13cbcb603989-StayKnown_Image.png",
  "2989df8d-40aa-41d0-9b36-ef9f9f8329a5/body-inline-image-body-image-1782630487673-5d4f9cb4a1922-4515fc3e-e4c7-429f-a264-d8a350b274a3-StayKnown_Image.png",
  "2989df8d-40aa-41d0-9b36-ef9f9f8329a5/body-inline-image-body-image-1782630425343-a07c45805adea8-7d97d41e-7494-4f8d-8c08-16d199159d43-StayKnown_Image.png",
  "2989df8d-40aa-41d0-9b36-ef9f9f8329a5/body-inline-audio-body-audio-1782629281690-1dbd982d5750a8-ae425598-86c5-49e1-be2a-d44f67164f61-StayKnown_Audio.mp3",
  "2989df8d-40aa-41d0-9b36-ef9f9f8329a5/body-inline-audio-body-audio-1782629224566-bbae9703ddae98-d58e7372-fde5-4cec-8dd9-52933294c86e-StayKnown_Audio.mp3",
  "2989df8d-40aa-41d0-9b36-ef9f9f8329a5/body-audio-34c67a37-2d2d-4fb9-98f0-25b8e5ae1b8b-StayKnown_Audio.mp3",
  "2989df8d-40aa-41d0-9b36-ef9f9f8329a5/body-image-b9c427ea-cf17-4322-929b-d01b031a987a-StayKnown_Image.png",
];

function chunkArray(items, size) {
  const chunks = [];

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }

  return chunks;
}

async function main() {
  const objectNames = [...new Set(OBJECTS_TO_DELETE.map((x) => x.trim()).filter(Boolean))];

  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "DELETE"}`);
  console.log(`Cleaning only bucket: ${BUCKET}`);
  console.log(`Objects listed: ${objectNames.length}`);

  if (objectNames.length === 0) {
    console.log("No objects listed. Paste the remaining storage object names into OBJECTS_TO_DELETE first.");
    return;
  }

  console.log("Objects:");
  console.log(objectNames.join("\n"));

  if (DRY_RUN) {
    console.log("");
    console.log("Dry run only. Nothing deleted.");
    console.log("Run this to delete:");
    console.log("node scripts/cleanup-mail-console-orphans.mjs --delete");
    return;
  }

  for (const batch of chunkArray(objectNames, 100)) {
    const { data, error } = await supabase.storage.from(BUCKET).remove(batch);

    if (error) {
      console.warn("Storage delete batch failed:", error.message);
      continue;
    }

    console.log(`Deleted ${batch.length} storage object(s).`);
    console.log(data);
  }

  console.log("Done. Deleted listed mail-console storage objects only.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});