import type { CSSProperties } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MAIL_CONSOLE_COOKIE } from "@/lib/mailConsoleServerAuth";
import { requireMailConsoleAdmin } from "@/lib/mailConsoleAdmin";

type LogRow = {
  id: number;
  created_at: string;
  sent_at: string | null;
  mode: string;
  recipient_email: string;
  subject: string;
  status: string;
  resend_email_id: string | null;
  error: string | null;
};

type CampaignRow = {
  id: string;
  created_at: string;
  sent_at: string | null;
  mode: string;
  subject: string;
  status: string;
  draft_label: string | null;
};

function fmtDate(v: string | null) {
  if (!v) return "—";

  const d = new Date(v);

  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleString();
}

function badge(status: string) {
  const normalized = status.toLowerCase();

  const badgeStyle: CSSProperties =
    normalized === "sent"
      ? {
          background: "rgba(22,163,74,0.10)",
          color: "rgb(21,128,61)",
          borderColor: "rgba(22,163,74,0.18)",
        }
      : normalized === "failed"
        ? {
            background: "rgba(220,38,38,0.09)",
            color: "rgb(185,28,28)",
            borderColor: "rgba(220,38,38,0.18)",
          }
        : normalized === "draft"
          ? {
              background: "rgba(0,0,0,0.045)",
              color: "rgba(0,0,0,0.62)",
              borderColor: "rgba(0,0,0,0.08)",
            }
          : {
              background: "rgba(245,158,11,0.12)",
              color: "rgb(180,83,9)",
              borderColor: "rgba(245,158,11,0.20)",
            };

  return (
    <span style={{ ...statusBadgeStyle, ...badgeStyle }}>
      {status || "unknown"}
    </span>
  );
}

export default async function MailConsoleLogsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MAIL_CONSOLE_COOKIE)?.value || "";

  let ctx;

  try {
    ctx = await requireMailConsoleAdmin(token);
  } catch (_) {
    redirect("/mail-login");
  }

  const { admin, adminEmail } = ctx;

  const { data: campaignRows, error: campaignError } = await admin
    .from("mail_console_campaigns")
    .select("id,created_at,sent_at,mode,subject,status,draft_label")
    .order("created_at", { ascending: false })
    .limit(60);

  if (campaignError) {
    throw new Error(campaignError.message);
  }

  const { data: logRows, error: logError } = await admin
    .from("mail_console_send_logs")
    .select(
      "id,created_at,sent_at,mode,recipient_email,subject,status,resend_email_id,error",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (logError) {
    throw new Error(logError.message);
  }

  const campaigns = (campaignRows || []) as CampaignRow[];
  const logs = (logRows || []) as LogRow[];

  return (
    <main className="sk-mail-logs" style={mainStyle}>
      <style>{`
        .sk-mail-logs {
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

        .sk-primary-button:hover {
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.24),
            0 20px 46px rgba(0,0,0,0.25) !important;
        }

        .sk-ghost-button:hover {
          border-color: rgba(0,0,0,0.18) !important;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.98),
            0 18px 42px rgba(0,0,0,0.11) !important;
        }

        .sk-log-panel {
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            border-color 180ms ease,
            background 180ms ease;
        }

        .sk-log-panel:hover {
          border-color: rgba(0,0,0,0.12) !important;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.94),
            0 22px 58px rgba(0,0,0,0.08) !important;
        }

        .sk-mail-logs table tbody tr {
          transition:
            background 160ms ease,
            box-shadow 160ms ease;
        }

        .sk-mail-logs table tbody tr:hover {
          background: rgba(0,0,0,0.025);
        }

        .sk-mail-logs table tbody tr:hover td {
          color: rgba(5,5,5,0.92);
        }

        @media (max-width: 720px) {
          .sk-logs-header {
            align-items: stretch !important;
          }

          .sk-logs-actions {
            width: 100%;
          }

          .sk-logs-actions a {
            width: 100%;
          }
        }
      `}</style>

      <section style={containerStyle}>
        <Header title="Email Logs" adminEmail={adminEmail} />

        <section className="sk-log-panel" style={panelStyle}>
          <div style={panelHeaderStyle}>
            <div>
              <div style={panelKickerStyle}>Campaign history</div>
              <div style={panelTitleStyle}>Campaigns and drafts</div>
            </div>

            <span style={panelCountPillStyle}>{campaigns.length} records</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={th}>Created</th>
                  <th style={th}>Mode</th>
                  <th style={th}>Subject</th>
                  <th style={th}>Status</th>
                  <th style={th}>Sent</th>
                </tr>
              </thead>

              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id}>
                    <td style={td}>{fmtDate(c.created_at)}</td>
                    <td style={td}>{c.mode}</td>
                    <td style={td}>{c.draft_label || c.subject}</td>
                    <td style={td}>{badge(c.status)}</td>
                    <td style={td}>{fmtDate(c.sent_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section
          className="sk-log-panel"
          style={{ ...panelStyle, marginTop: 18 }}
        >
          <div style={panelHeaderStyle}>
            <div>
              <div style={panelKickerStyle}>Delivery report</div>
              <div style={panelTitleStyle}>Per-recipient send logs</div>
            </div>

            <span style={panelCountPillStyle}>{logs.length} records</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={th}>Created</th>
                  <th style={th}>Mode</th>
                  <th style={th}>Recipient</th>
                  <th style={th}>Subject</th>
                  <th style={th}>Status</th>
                  <th style={th}>Resend ID</th>
                  <th style={th}>Error</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td style={td}>{fmtDate(l.created_at)}</td>
                    <td style={td}>{l.mode}</td>
                    <td style={td}>{l.recipient_email}</td>
                    <td style={td}>{l.subject}</td>
                    <td style={td}>{badge(l.status)}</td>
                    <td style={td}>{l.resend_email_id || "—"}</td>
                    <td style={td}>{l.error || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}

function Header({ title, adminEmail }: { title: string; adminEmail: string }) {
  return (
    <header className="sk-logs-header" style={headerStyle}>
      <div>
        <div style={kickerStyle}>StayKnown Mail Console</div>

        <h1 style={h1Style}>{title}</h1>

        <p style={subStyle}>Logged in as {adminEmail}</p>
      </div>

      <div className="sk-logs-actions" style={headerActionsStyle}>
        <Link
          href="/mail-console/send"
          className="sk-premium-button sk-primary-button"
          style={blackLink}
        >
          <span style={buttonIconStyle}>✎</span>
          Compose
        </Link>

        <Link
          href="/mail-console"
          className="sk-premium-button sk-ghost-button"
          style={whiteLink}
        >
          Dashboard
        </Link>
      </div>
    </header>
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
  maxWidth: 1180,
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

const headerActionsStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "flex-end",
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

const blackLink: CSSProperties = {
  ...baseButtonStyle,
  background:
    "linear-gradient(180deg, rgba(18,18,18,1) 0%, rgba(3,3,3,1) 100%)",
  color: "white",
  borderColor: "rgba(255,255,255,0.12)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.18), 0 14px 34px rgba(0,0,0,0.20)",
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

const buttonIconStyle: CSSProperties = {
  fontSize: 13,
  lineHeight: 1,
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

const panelHeaderStyle: CSSProperties = {
  padding: 18,
  borderBottom: "1px solid rgba(0,0,0,0.08)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
};

const panelKickerStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 950,
  letterSpacing: 1.5,
  textTransform: "uppercase",
  color: "rgba(0,0,0,0.45)",
  marginBottom: 5,
};

const panelTitleStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 950,
  color: "#050505",
};

const panelCountPillStyle: CSSProperties = {
  borderRadius: 999,
  padding: "7px 10px",
  background: "rgba(0,0,0,0.055)",
  color: "rgba(0,0,0,0.62)",
  fontSize: 11,
  fontWeight: 950,
};

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const th: CSSProperties = {
  textAlign: "left",
  padding: "12px 14px",
  fontSize: 12,
  fontWeight: 950,
  color: "rgba(0,0,0,0.62)",
  background: "rgba(0,0,0,0.03)",
  whiteSpace: "nowrap",
};

const td: CSSProperties = {
  padding: "12px 14px",
  borderTop: "1px solid rgba(0,0,0,0.06)",
  fontSize: 13,
  whiteSpace: "nowrap",
  color: "rgba(5,5,5,0.76)",
};

const statusBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  padding: "5px 9px",
  border: "1px solid transparent",
  fontSize: 11,
  lineHeight: 1,
  fontWeight: 950,
  textTransform: "uppercase",
  whiteSpace: "nowrap",
};
