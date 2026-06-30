import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRole) {
  console.error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
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
const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

function chunkArray(items, size) {
  const chunks = [];

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }

  return chunks;
}

async function main() {
  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "DELETE"}`);
  console.log(`Cleaning only bucket: ${BUCKET}`);
  console.log(`Since: ${since}`);

  const { data: campaigns, error: campaignError } = await supabase
    .from("mail_console_campaigns")
    .select("id, created_at, subject, status")
    .gte("created_at", since)
    .order("created_at", { ascending: false });

  if (campaignError) throw campaignError;

  const campaignIds = (campaigns || []).map((row) => row.id);

  console.log(`Mail-console campaigns found: ${campaignIds.length}`);

  if (campaignIds.length === 0) {
    console.log("Nothing to clean.");
    return;
  }

  const objectNames = [];

  for (const campaignId of campaignIds) {
    const { data: objects, error: listError } = await supabase.storage
      .from(BUCKET)
      .list(campaignId, {
        limit: 1000,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (listError) {
      console.warn(`Could not list ${campaignId}:`, listError.message);
      continue;
    }

    for (const object of objects || []) {
      if (!object.name) continue;

      objectNames.push(`${campaignId}/${object.name}`);
    }
  }

  const uniqueObjectNames = [...new Set(objectNames)];

  console.log(`Storage objects found in ${BUCKET}: ${uniqueObjectNames.length}`);

  if (uniqueObjectNames.length > 0) {
    console.log("Sample objects:");
    console.log(uniqueObjectNames.slice(0, 20).join("\n"));
  }

  if (DRY_RUN) {
    console.log("");
    console.log("Dry run only. Nothing deleted.");
    console.log("Run this to delete:");
    console.log("node scripts/cleanup-mail-console-storage.mjs --delete");
    return;
  }

  for (const batch of chunkArray(uniqueObjectNames, 100)) {
    const { error } = await supabase.storage.from(BUCKET).remove(batch);

    if (error) {
      console.warn("Storage delete batch failed:", error.message);
    } else {
      console.log(`Deleted ${batch.length} storage object(s).`);
    }
  }

  for (const batch of chunkArray(campaignIds, 100)) {
    await supabase.from("mail_console_attachments").delete().in("campaign_id", batch);
    await supabase.from("mail_console_send_logs").delete().in("campaign_id", batch);
    await supabase.from("mail_console_campaign_recipients").delete().in("campaign_id", batch);
    await supabase.from("mail_console_campaigns").delete().in("id", batch);
  }

  console.log("Done. Deleted only mail-console storage files and mail-console database rows from the last 7 days.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});