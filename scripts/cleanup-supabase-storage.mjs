import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const DRY_RUN = process.env.DRY_RUN !== "false";

const CLEAN_BUCKETS = (
  process.env.CLEAN_BUCKETS ||
  "mail-console-attachments,chat_attachments,stories,profile-wallpapers,safety-gallery,profile-gallery"
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const DELETE_BATCH_SIZE = 100;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function listAllPaths(bucket, prefix = "") {
  const paths = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit: 1000,
      offset,
      sortBy: {
        column: "name",
        order: "asc",
      },
    });

    if (error) {
      throw new Error(`Failed to list bucket "${bucket}" prefix "${prefix}": ${error.message}`);
    }

    if (!data || data.length === 0) break;

    for (const item of data) {
      const itemPath = prefix ? `${prefix}/${item.name}` : item.name;

      const looksLikeFolder =
        item.id === null ||
        item.id === undefined ||
        item.metadata === null ||
        item.metadata === undefined;

      if (looksLikeFolder) {
        const nestedPaths = await listAllPaths(bucket, itemPath);
        paths.push(...nestedPaths);
      } else {
        paths.push(itemPath);
      }
    }

    if (data.length < 1000) break;
    offset += 1000;
  }

  return paths;
}

function chunkArray(items, size) {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

async function deleteBucketFiles(bucket) {
  console.log(`\nChecking bucket: ${bucket}`);

  const paths = await listAllPaths(bucket);

  console.log(`Found ${paths.length} file(s) in ${bucket}`);

  if (paths.length === 0) return;

  if (DRY_RUN) {
    console.log("DRY RUN is ON. Nothing will be deleted.");
    console.log("First 20 paths:");
    console.log(paths.slice(0, 20));
    return;
  }

  const chunks = chunkArray(paths, DELETE_BATCH_SIZE);

  for (const [index, chunk] of chunks.entries()) {
    const { error } = await supabase.storage.from(bucket).remove(chunk);

    if (error) {
      throw new Error(
        `Failed deleting batch ${index + 1}/${chunks.length} from "${bucket}": ${error.message}`,
      );
    }

    console.log(`Deleted batch ${index + 1}/${chunks.length} from ${bucket}`);
  }
}

async function main() {
  console.log("Storage cleanup started.");
  console.log("Dry run:", DRY_RUN);
  console.log("Buckets:", CLEAN_BUCKETS.join(", "));

  for (const bucket of CLEAN_BUCKETS) {
    await deleteBucketFiles(bucket);
  }

  console.log("\nStorage cleanup finished.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});