import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

const WIDTH = 1200;
const HEIGHT = 630;

type SocialImageVariant = "openGraph" | "twitter";

type SocialImageOptions = {
  variant: SocialImageVariant;
};

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
    case ".png":
    default:
      return "image/png";
  }
}

async function publicAssetDataUri(relativePath: string): Promise<string> {
  const absolutePath = path.join(
    process.cwd(),
    "public",
    relativePath.replace(/^\/+/, ""),
  );

  const bytes = await readFile(absolutePath);

  return `data:${mimeType(absolutePath)};base64,${bytes.toString("base64")}`;
}

export async function createStayKnownSocialImage({
  variant,
}: SocialImageOptions): Promise<ImageResponse> {
  const [logoSource, appScreenSource] = await Promise.all([
    publicAssetDataUri("/6logo.png"),
    publicAssetDataUri("/hero/visit-live-sos.png"),
  ]);

  const networkLabel =
    variant === "twitter" ? "STAYKNOWN ON X" : "STAYKNOWN SAFETY";

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background: "#000000",
          color: "#ffffff",
          fontFamily:
            "Arial, Helvetica, ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(circle at 76% 42%, rgba(255,255,255,0.13), transparent 34%), radial-gradient(circle at 18% 15%, rgba(255,255,255,0.08), transparent 28%), linear-gradient(145deg, #050505 0%, #000000 56%, #070707 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: -230,
            right: -160,
            display: "flex",
            width: 680,
            height: 680,
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: -340,
            left: 210,
            display: "flex",
            width: 760,
            height: 760,
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            width: "100%",
            height: "100%",
            padding: "58px 62px",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "62%",
              height: "100%",
              flexDirection: "column",
              justifyContent: "space-between",
              paddingRight: 26,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
              }}
            >
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  width: 72,
                  height: 72,
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  borderRadius: 23,
                  border: "1px solid rgba(255,255,255,0.96)",
                  background:
                    "linear-gradient(145deg, #ffffff 0%, #eeeeee 55%, #d8d8d8 100%)",
                  boxShadow:
                    "0 20px 48px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,1), inset 0 -9px 18px rgba(0,0,0,0.10)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 1,
                    left: 12,
                    right: 12,
                    display: "flex",
                    height: 1,
                    background: "rgba(255,255,255,0.98)",
                  }}
                />

                <img
                  src={logoSource}
                  alt=""
                  width={43}
                  height={43}
                  style={{
                    objectFit: "contain",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 24,
                    fontWeight: 900,
                    letterSpacing: "0.24em",
                    lineHeight: 1,
                  }}
                >
                  STAYKNOWN
                </div>

                <div
                  style={{
                    display: "flex",
                    marginTop: 10,
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "0.18em",
                    color: "rgba(255,255,255,0.42)",
                  }}
                >
                  {networkLabel}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignSelf: "flex-start",
                  padding: "9px 15px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.13)",
                  background: "rgba(255,255,255,0.055)",
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: "0.17em",
                  color: "rgba(255,255,255,0.63)",
                }}
              >
                CONSENT-FIRST PERSONAL SAFETY
              </div>

              <div
                style={{
                  display: "flex",
                  maxWidth: 690,
                  marginTop: 24,
                  fontSize: 62,
                  fontWeight: 900,
                  letterSpacing: "-0.062em",
                  lineHeight: 0.96,
                }}
              >
                Safety when you choose it.
              </div>

              <div
                style={{
                  display: "flex",
                  maxWidth: 665,
                  marginTop: 8,
                  fontSize: 62,
                  fontWeight: 900,
                  letterSpacing: "-0.062em",
                  lineHeight: 0.96,
                  color: "rgba(255,255,255,0.52)",
                }}
              >
                Trusted people when you need them.
              </div>

              <div
                style={{
                  display: "flex",
                  maxWidth: 650,
                  marginTop: 23,
                  fontSize: 18,
                  fontWeight: 700,
                  lineHeight: 1.48,
                  color: "rgba(255,255,255,0.58)",
                }}
              >
                Start a Visit, share LIVE safety context, confirm I’M SAFE,
                or activate SOS—without permanent family tracking.
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 9,
                  flexWrap: "wrap",
                }}
              >
                {[
                  "ACTIVE VISITS",
                  "LIVE SHARING",
                  "I’M SAFE",
                  "SOS",
                  "APPROVED CONTACTS",
                ].map((label) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      padding: "8px 12px",
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.11)",
                      background: "rgba(255,255,255,0.045)",
                      fontSize: 10,
                      fontWeight: 900,
                      letterSpacing: "0.11em",
                      color: "rgba(255,255,255,0.58)",
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 21,
                  fontSize: 14,
                  fontWeight: 800,
                  color: "rgba(255,255,255,0.38)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: 7,
                    height: 7,
                    borderRadius: 999,
                    background: "#ffffff",
                    boxShadow: "0 0 20px rgba(255,255,255,0.55)",
                  }}
                />
                Available on Google Play
                <div
                  style={{
                    display: "flex",
                    width: 1,
                    height: 13,
                    background: "rgba(255,255,255,0.14)",
                  }}
                />
                www.stay-known.com
              </div>
            </div>
          </div>

          <div
            style={{
              position: "relative",
              display: "flex",
              width: "38%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                display: "flex",
                width: 410,
                height: 548,
                borderRadius: 46,
                border: "1px solid rgba(255,255,255,0.11)",
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.10), rgba(255,255,255,0.018))",
                boxShadow:
                  "0 45px 110px rgba(0,0,0,0.72), inset 0 1px 0 rgba(255,255,255,0.10)",
                transform: "rotate(3deg)",
              }}
            />

            <div
              style={{
                position: "absolute",
                bottom: 1,
                display: "flex",
                width: 390,
                height: 64,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.92)",
                boxShadow: "0 25px 58px rgba(0,0,0,0.98)",
              }}
            />

            <img
              src={appScreenSource}
              alt=""
              width={330}
              height={548}
              style={{
                position: "relative",
                objectFit: "contain",
              }}
            />

            <div
              style={{
                position: "absolute",
                right: 2,
                bottom: 34,
                display: "flex",
                flexDirection: "column",
                width: 196,
                padding: "16px 17px",
                borderRadius: 21,
                border: "1px solid rgba(255,255,255,0.14)",
                background:
                  "linear-gradient(145deg, rgba(19,19,19,0.96), rgba(4,4,4,0.94))",
                boxShadow:
                  "0 24px 52px rgba(0,0,0,0.62), inset 0 1px 0 rgba(255,255,255,0.10)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: "0.15em",
                  color: "rgba(255,255,255,0.38)",
                }}
              >
                USER CONTROLLED
              </div>

              <div
                style={{
                  display: "flex",
                  marginTop: 8,
                  fontSize: 17,
                  fontWeight: 900,
                  lineHeight: 1.15,
                }}
              >
                Location sharing ends with the safety session.
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            height: 7,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.62), rgba(255,255,255,0))",
          }}
        />
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
    },
  );
}
