import { ImageResponse } from "next/og";

export const alt = "StayKnown Chat and Trusted Circles";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#000000",
          color: "#ffffff",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 620,
            height: 620,
            borderRadius: 999,
            left: -170,
            top: -210,
            background: "rgba(143,243,208,0.12)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            borderRadius: 999,
            right: -100,
            bottom: -210,
            background: "rgba(255,255,255,0.08)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "58px 66px",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 18,
                background: "#ffffff",
                color: "#000000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 20,
                boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
              }}
            >
              SK
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: 22,
                  letterSpacing: 6,
                  fontWeight: 900,
                }}
              >
                STAYKNOWN
              </div>
              <div
                style={{
                  marginTop: 5,
                  fontSize: 14,
                  color: "rgba(255,255,255,0.5)",
                  fontWeight: 700,
                }}
              >
                Consent-based safety communication
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 54 }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <div
                style={{
                  fontSize: 16,
                  color: "#b9ffe9",
                  textTransform: "uppercase",
                  letterSpacing: 4,
                  fontWeight: 900,
                }}
              >
                Chat & Trusted Circles
              </div>
              <div
                style={{
                  marginTop: 18,
                  maxWidth: 760,
                  fontSize: 67,
                  lineHeight: 0.96,
                  letterSpacing: -4.2,
                  fontWeight: 900,
                }}
              >
                Communication with visible permission boundaries.
              </div>
              <div
                style={{
                  marginTop: 22,
                  fontSize: 20,
                  color: "rgba(255,255,255,0.62)",
                  lineHeight: 1.35,
                  fontWeight: 700,
                }}
              >
                Approved contacts · Trusted Circle consent · selective audiences · translation · voice & media
              </div>
            </div>

            <div
              style={{
                width: 250,
                height: 330,
                display: "flex",
                flexDirection: "column",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 34,
                padding: 18,
                background: "rgba(255,255,255,0.045)",
                boxShadow: "0 34px 80px rgba(0,0,0,0.65)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    background: "#ffffff",
                    color: "#000000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 900,
                  }}
                >
                  CJ
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 12, fontWeight: 900 }}>
                    Home Safety Circle
                  </div>
                  <div
                    style={{
                      marginTop: 3,
                      fontSize: 9,
                      color: "#b9ffe9",
                      fontWeight: 800,
                    }}
                  >
                    4 members · consent verified
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 22,
                  borderRadius: 18,
                  border: "1px solid rgba(255,255,255,0.13)",
                  padding: 14,
                  color: "rgba(255,255,255,0.76)",
                  fontSize: 12,
                  lineHeight: 1.4,
                  fontWeight: 700,
                }}
              >
                We have arrived safely. Everyone is together.
              </div>
              <div
                style={{
                  alignSelf: "flex-end",
                  marginTop: 12,
                  maxWidth: 180,
                  borderRadius: 18,
                  background: "#ffffff",
                  padding: 14,
                  color: "#000000",
                  fontSize: 12,
                  lineHeight: 1.4,
                  fontWeight: 800,
                }}
              >
                Visible to 3 Circle members.
              </div>
              <div
                style={{
                  marginTop: "auto",
                  borderRadius: 999,
                  border: "1px solid rgba(143,243,208,0.35)",
                  padding: "9px 12px",
                  color: "#b9ffe9",
                  fontSize: 9,
                  textAlign: "center",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  fontWeight: 900,
                }}
              >
                Audience enforced
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
