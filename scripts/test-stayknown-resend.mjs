import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const to = process.argv[2] || "6clementjoshua@gmail.com";

const apiKey = process.env.RESEND_API_KEY_STAYKNOWN;

if (!apiKey) {
  console.error("Missing RESEND_API_KEY_STAYKNOWN in .env.local");
  process.exit(1);
}

const from = "StayKnown Debug <creators@stay-known.com>";

const payload = {
  from,
  to: [to],
  subject: `StayKnown direct Resend test ${new Date().toISOString()}`,
  html: `
    <div style="font-family:Arial,sans-serif;padding:20px;">
      <h2>StayKnown direct Resend test</h2>
      <p>This email bypassed Supabase and the mail console send route.</p>
      <p>If you receive this, the StayKnown Resend key/domain can send.</p>
    </div>
  `,
  text:
    "StayKnown direct Resend test. This bypassed Supabase and the mail console send route.",
};

console.log("Testing direct Resend send...");
console.log({
  to,
  from,
  envName: "RESEND_API_KEY_STAYKNOWN",
  hasKey: Boolean(apiKey),
});

const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

const rawText = await res.text();

let data = null;

try {
  data = JSON.parse(rawText);
} catch {
  data = rawText;
}

console.log("");
console.log("RESULT:");
console.log(
  JSON.stringify(
    {
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      response: data,
    },
    null,
    2,
  ),
);

if (!res.ok) {
  process.exit(1);
}