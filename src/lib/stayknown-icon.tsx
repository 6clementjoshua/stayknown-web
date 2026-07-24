import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

type StayKnownIconOptions = {
  size: number;
  maskable?: boolean;
};

const LOGO_CANDIDATES = [
  "6logo.png",
  "6logo.PNG",
  "stayknown-logo.png",
  "stayknown-logo.PNG",
  "logo.png",
  "logo.PNG",
] as const;

function mimeType(filename: string): string {
  const extension = path.extname(filename).toLowerCase();

  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    default:
      return "image/png";
  }
}

async function readOfficialLogo(): Promise<string | null> {
  const publicDirectory = path.join(process.cwd(), "public");

  for (const filename of LOGO_CANDIDATES) {
    try {
      const bytes = await readFile(path.join(publicDirectory, filename));

      return `data:${mimeType(filename)};base64,${bytes.toString("base64")}`;
    } catch {
      // Try the next known StayKnown logo filename.
    }
  }

  return null;
}

export async function createStayKnownIcon({
  size,
  maskable = false,
}: StayKnownIconOptions): Promise<ImageResponse> {
  const logo = await readOfficialLogo();

  /*
   * Maskable icons need a wider protected area because Android and other
   * launchers may crop them into a circle, rounded square, or squircle.
   */
  const markSize = Math.round(size * (maskable ? 0.5 : 0.62));
  const innerRadius = Math.round(size * (maskable ? 0.19 : 0.235));
  const innerInset = Math.round(size * (maskable ? 0.145 : 0.075));
  const fallbackFontSize = Math.round(markSize * 0.94);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(145deg, #ffffff 0%, #fbfbfb 38%, #f2f2f2 72%, #e8e8e8 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(circle at 28% 18%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.72) 24%, rgba(255,255,255,0) 56%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: Math.round(size * 0.11),
            right: Math.round(size * 0.11),
            top: Math.round(size * 0.055),
            height: Math.max(1, Math.round(size * 0.006)),
            display: "flex",
            borderRadius: 999,
            background: "rgba(255,255,255,0.96)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: innerInset,
            right: innerInset,
            top: innerInset,
            bottom: innerInset,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: innerRadius,
            border: `${Math.max(1, Math.round(size * 0.004))}px solid rgba(0,0,0,0.055)`,
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.99) 0%, rgba(252,252,252,0.98) 50%, rgba(235,235,235,0.98) 100%)",
            boxShadow: [
              `0 ${Math.round(size * 0.055)}px ${Math.round(size * 0.12)}px rgba(0,0,0,0.16)`,
              `inset 0 ${Math.max(1, Math.round(size * 0.004))}px 0 rgba(255,255,255,1)`,
              `inset 0 -${Math.round(size * 0.035)}px ${Math.round(size * 0.08)}px rgba(0,0,0,0.055)`,
            ].join(", "),
          }}
        >
          {logo ? (
            <img
              src={logo}
              width={markSize}
              height={markSize}
              alt=""
              style={{
                width: markSize,
                height: markSize,
                display: "flex",
                objectFit: "contain",
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#050505",
                fontFamily: "Arial Black, Arial, sans-serif",
                fontSize: fallbackFontSize,
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: "-0.11em",
                transform: "translateX(-2%)",
              }}
            >
              6
            </div>
          )}
        </div>

        <div
          style={{
            position: "absolute",
            left: Math.round(size * 0.19),
            right: Math.round(size * 0.19),
            bottom: Math.round(size * 0.045),
            height: Math.round(size * 0.025),
            display: "flex",
            borderRadius: 999,
            background: "rgba(0,0,0,0.07)",
            filter: `blur(${Math.max(1, Math.round(size * 0.012))}px)`,
          }}
        />
      </div>
    ),
    {
      width: size,
      height: size,
      headers: {
        "Cache-Control":
          "public, max-age=31536000, s-maxage=31536000, immutable",
      },
    },
  );
}
