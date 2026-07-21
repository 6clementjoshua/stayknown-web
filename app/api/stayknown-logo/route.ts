import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

type LogoFile = {
  absolutePath: string;
  extension: string;
};

const DIRECT_CANDIDATES = [
  "6logo.png",
  "6logo.PNG",
  "6logo.webp",
  "6logo.WEBP",
  "stayknown-logo.png",
  "stayknown-logo.PNG",
  "stayknown_logo.png",
  "stayknown_logo.PNG",
  "logo.png",
  "logo.PNG",
];

const ACCEPTED_EXTENSIONS = new Set([
  ".png",
  ".webp",
  ".jpg",
  ".jpeg",
  ".avif",
  ".svg",
]);

function contentType(extension: string): string {
  switch (extension.toLowerCase()) {
    case ".webp":
      return "image/webp";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".avif":
      return "image/avif";
    case ".svg":
      return "image/svg+xml";
    default:
      return "image/png";
  }
}

function logoNameScore(name: string): number {
  const lower = name.toLowerCase();

  if (lower === "6logo.png") return 100;
  if (lower.startsWith("6logo.")) return 95;
  if (lower.startsWith("stayknown-logo.")) return 90;
  if (lower.startsWith("stayknown_logo.")) return 85;
  if (lower === "logo.png") return 60;

  return 0;
}

async function findLogoRecursively(
  directory: string,
  depth: number,
): Promise<LogoFile | null> {
  if (depth < 0) return null;

  let entries;

  try {
    entries = await readdir(directory, {
      withFileTypes: true,
    });
  } catch {
    return null;
  }

  const fileMatches = entries
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const extension = path.extname(entry.name);
      return {
        entry,
        extension,
        score: ACCEPTED_EXTENSIONS.has(extension.toLowerCase())
          ? logoNameScore(entry.name)
          : 0,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (fileMatches.length > 0) {
    const best = fileMatches[0];

    return {
      absolutePath: path.join(directory, best.entry.name),
      extension: best.extension,
    };
  }

  if (depth === 0) return null;

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const nested = await findLogoRecursively(
      path.join(directory, entry.name),
      depth - 1,
    );

    if (nested) return nested;
  }

  return null;
}

async function findLogo(): Promise<LogoFile | null> {
  const publicDirectory = path.join(process.cwd(), "public");

  for (const candidate of DIRECT_CANDIDATES) {
    const absolutePath = path.join(publicDirectory, candidate);

    try {
      await readFile(absolutePath);

      return {
        absolutePath,
        extension: path.extname(candidate),
      };
    } catch {
      // Continue to the next exact filename.
    }
  }

  return findLogoRecursively(publicDirectory, 3);
}

export async function GET() {
  const logo = await findLogo();

  if (!logo) {
    return new Response(
      "Original StayKnown logo not found in the website public folder.",
      {
        status: 404,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  try {
    const bytes = await readFile(logo.absolutePath);

    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType(logo.extension),
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Original StayKnown logo could not be read.", {
      status: 500,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }
}
