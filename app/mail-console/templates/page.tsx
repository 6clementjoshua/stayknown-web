import type { CSSProperties } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MAIL_CONSOLE_COOKIE } from "@/lib/mailConsoleServerAuth";
import { requireMailConsoleAdmin } from "@/lib/mailConsoleAdmin";

type Template = {
  id: string;
  slug: string | null;
  name: string;
  mode: string;
  subject: string | null;
  body_text: string | null;
  is_active: boolean;
};

export default async function TemplatesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MAIL_CONSOLE_COOKIE)?.value || "";

  let ctx;

  try {
    ctx = await requireMailConsoleAdmin(token);
  } catch (_) {
    redirect("/mail-login");
  }

  const { admin, adminEmail } = ctx;

  const { data, error } = await admin
    .from("mail_console_templates")
    .select("id,slug,name,mode,subject,body_text,is_active")
    .order("mode", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  const templates = (data || []) as Template[];

  return (
    <main className="sk-templates-page" style={mainStyle}>
      <style>{`
        .sk-templates-page {
          font-family:
            Inter,
            "SF Pro Display",
            "SF Pro Text",
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Arial,
            sans-serif;
        }

        .sk-premium-button {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          transform: translateZ(0);
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            border-color 180ms ease,
            background 180ms ease,
            color 180ms ease,
            opacity 180ms ease;
        }

        .sk-premium-button::before {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: inherit;
          background:
            linear-gradient(
              120deg,
              transparent 0%,
              rgba(255,255,255,0.46) 26%,
              transparent 52%
            );
          transform: translateX(-135%);
          transition: transform 540ms ease;
          z-index: -1;
          pointer-events: none;
        }

        .sk-premium-button::after {
          content: "";
          position: absolute;
          width: 110px;
          height: 110px;
          left: 50%;
          top: 50%;
          border-radius: 999px;
          background: radial-gradient(
            circle,
            rgba(255,255,255,0.48) 0%,
            rgba(255,255,255,0.22) 38%,
            transparent 72%
          );
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.24);
          transition:
            opacity 220ms ease,
            transform 420ms ease;
          pointer-events: none;
        }

        .sk-premium-button:hover {
          transform: translateY(-2px);
        }

        .sk-premium-button:hover::before {
          transform: translateX(135%);
        }

        .sk-premium-button:active {
          transform: translateY(0) scale(0.975);
        }

        .sk-premium-button:active::after {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
          transition: 0ms;
        }

        .sk-ghost-button:hover {
          border-color: rgba(0,0,0,0.18) !important;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.98),
            0 18px 42px rgba(0,0,0,0.11) !important;
        }

        .sk-primary-button:hover {
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.24),
            0 20px 46px rgba(0,0,0,0.25) !important;
        }

        .sk-template-card {
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            border-color 180ms ease,
            background 180ms ease;
        }

        .sk-template-card:hover {
          transform: translateY(-2px);
          border-color: rgba(0,0,0,0.12) !important;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.94),
            0 20px 50px rgba(0,0,0,0.08);
          background: rgba(255,255,255,0.96);
        }

        .sk-templates-page input,
        .sk-templates-page select,
        .sk-templates-page textarea {
          transition:
            border-color 180ms ease,
            box-shadow 180ms ease,
            background 180ms ease;
        }

        .sk-templates-page input:hover,
        .sk-templates-page select:hover,
        .sk-templates-page textarea:hover {
          border-color: rgba(0,0,0,0.20) !important;
          box-shadow: 0 12px 34px rgba(0,0,0,0.045);
        }

        .sk-templates-page input:focus,
        .sk-templates-page select:focus,
        .sk-templates-page textarea:focus {
          border-color: rgba(0,0,0,0.34) !important;
          box-shadow:
            0 0 0 4px rgba(0,0,0,0.055),
            0 16px 42px rgba(0,0,0,0.06);
        }

        .sk-active-check {
          accent-color: #050505;
          transform: scale(1.05);
        }

        @media (max-width: 720px) {
          .sk-template-header {
            align-items: stretch !important;
          }

          .sk-template-header a {
            width: 100%;
          }

          .sk-template-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <section style={containerStyle}>
        <header className="sk-template-header" style={headerStyle}>
          <div>
            <div style={kickerStyle}>StayKnown Mail Console</div>

            <h1 style={h1Style}>Reusable Templates</h1>

            <p style={subStyle}>
              Edit templates used by the composer. Logged in as {adminEmail}
            </p>
          </div>

          <Link
            href="/mail-console"
            className="sk-premium-button sk-ghost-button"
            style={whiteLink}
          >
            Dashboard
          </Link>
        </header>

        <section style={panelStyle}>
          {templates.map((t) => (
            <form
              key={t.id}
              action="/api/mail-console/template"
              method="post"
              className="sk-template-card"
              style={templateCardStyle}
            >
              <input type="hidden" name="id" value={t.id} />

              <div style={{ display: "grid", gap: 14 }}>
                <div className="sk-template-grid" style={templateGridStyle}>
                  <div>
                    <label style={labelStyle}>Template name</label>
                    <input
                      name="name"
                      defaultValue={t.name}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Mode</label>
                    <select
                      name="mode"
                      defaultValue={t.mode}
                      style={inputStyle}
                    >
                      <option value="support">support</option>
                      <option value="newsletter">newsletter</option>
                      <option value="advert">advert</option>
                      <option value="investor">investor</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Subject</label>
                  <input
                    name="subject"
                    defaultValue={t.subject || ""}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Body</label>
                  <textarea
                    name="body_text"
                    defaultValue={t.body_text || ""}
                    style={{
                      ...inputStyle,
                      minHeight: 160,
                      resize: "vertical",
                      lineHeight: 1.65,
                    }}
                  />
                </div>

                <div style={templateFooterRowStyle}>
                  <label style={activeLabelStyle}>
                    <input
                      className="sk-active-check"
                      type="checkbox"
                      name="is_active"
                      defaultChecked={t.is_active}
                    />

                    <span>Active</span>
                  </label>

                  <button
                    type="submit"
                    className="sk-premium-button sk-primary-button"
                    style={blackButton}
                  >
                    Save Template
                  </button>
                </div>
              </div>
            </form>
          ))}
        </section>
      </section>
    </main>
  );
}

const mainStyle: CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, rgba(255,255,255,0.98) 0%, rgba(243,244,246,1) 38%, rgba(235,236,239,1) 100%)",
  padding: 24,
  color: "#050505",
};

const containerStyle: CSSProperties = {
  maxWidth: 980,
  margin: "0 auto",
};

const headerStyle: CSSProperties = {
  borderRadius: 30,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.84) 100%)",
  border: "1px solid rgba(255,255,255,0.92)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.96), 0 24px 70px rgba(0,0,0,0.09)",
  padding: 24,
  marginBottom: 18,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
  backdropFilter: "blur(18px)",
};

const kickerStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 950,
  letterSpacing: 2.8,
  textTransform: "uppercase",
  color: "rgba(0,0,0,0.52)",
};

const h1Style: CSSProperties = {
  margin: "8px 0 4px",
  fontSize: 34,
  lineHeight: 1.05,
  fontWeight: 950,
  letterSpacing: -1.2,
};

const subStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: "rgba(0,0,0,0.62)",
  lineHeight: 1.5,
};

const baseButtonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  borderRadius: 999,
  padding: "10px 14px",
  minHeight: 40,
  fontSize: 13,
  lineHeight: 1,
  fontWeight: 950,
  textDecoration: "none",
  border: "1px solid transparent",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const whiteLink: CSSProperties = {
  ...baseButtonStyle,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(246,246,246,0.94) 100%)",
  color: "#050505",
  borderColor: "rgba(0,0,0,0.08)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.96), 0 10px 24px rgba(0,0,0,0.055)",
};

const panelStyle: CSSProperties = {
  borderRadius: 30,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.88) 100%)",
  border: "1px solid rgba(255,255,255,0.88)",
  overflow: "hidden",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.92), 0 14px 38px rgba(0,0,0,0.055)",
};

const templateCardStyle: CSSProperties = {
  padding: 18,
  borderBottom: "1px solid rgba(0,0,0,0.08)",
  background: "rgba(255,255,255,0.72)",
};

const templateGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 180px",
  gap: 12,
};

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 950,
  color: "rgba(0,0,0,0.65)",
  marginBottom: 7,
};

const inputStyle: CSSProperties = {
  width: "100%",
  borderRadius: 16,
  border: "1px solid rgba(0,0,0,0.12)",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,250,250,0.96) 100%)",
  padding: "13px 14px",
  fontSize: 14,
  color: "#050505",
  outline: "none",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
};

const templateFooterRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
};

const activeLabelStyle: CSSProperties = {
  display: "inline-flex",
  gap: 8,
  alignItems: "center",
  fontSize: 13,
  fontWeight: 850,
  color: "rgba(0,0,0,0.72)",
  padding: "9px 11px",
  borderRadius: 999,
  background: "rgba(0,0,0,0.035)",
  border: "1px solid rgba(0,0,0,0.06)",
};

const blackButton: CSSProperties = {
  ...baseButtonStyle,
  border: 0,
  padding: "10px 15px",
  minHeight: 40,
  background:
    "linear-gradient(180deg, rgba(18,18,18,1) 0%, rgba(3,3,3,1) 100%)",
  color: "white",
  fontFamily: "inherit",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.18), 0 14px 34px rgba(0,0,0,0.20)",
};
