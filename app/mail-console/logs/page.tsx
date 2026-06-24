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
  const bg =
    status === "sent"
      ? "rgba(0,150,80,0.10)"
      : status === "failed"
        ? "rgba(255,0,0,0.08)"
        : status === "draft"
          ? "rgba(0,0,0,0.05)"
          : "rgba(255,170,0,0.12)";

  return (
    <span
      style={{
        display: "inline-flex",
        borderRadius: 999,
        padding: "5px 9px",
        background: bg,
        fontSize: 12,
        fontWeight: 900,
        textTransform: "uppercase",
      }}
    >
      {status}
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
    <main style={mainStyle}>
      <section style={{ maxWidth: 1180, margin: "0 auto" }}>
        <Header title="Email Logs" adminEmail={adminEmail} />

        <section style={panelStyle}>
          <div style={panelHeaderStyle}>Campaigns and drafts</div>

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

        <section style={{ ...panelStyle, marginTop: 18 }}>
          <div style={panelHeaderStyle}>Per-recipient send logs</div>

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
    <header style={headerStyle}>
      <div>
        <div style={kickerStyle}>StayKnown Mail Console</div>
        <h1 style={h1Style}>{title}</h1>
        <p style={subStyle}>Logged in as {adminEmail}</p>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href="/mail-console/send" style={blackLink}>
          Compose
        </Link>
        <Link href="/mail-console" style={whiteLink}>
          Dashboard
        </Link>
      </div>
    </header>
  );
}

const mainStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f3f4f6",
  padding: 24,
  color: "#050505",
};

const headerStyle: React.CSSProperties = {
  borderRadius: 30,
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(0,0,0,0.08)",
  boxShadow: "0 24px 70px rgba(0,0,0,0.09)",
  padding: 24,
  marginBottom: 18,
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
};

const kickerStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 950,
  letterSpacing: 2.8,
  textTransform: "uppercase",
  color: "rgba(0,0,0,0.58)",
};

const h1Style: React.CSSProperties = {
  margin: "8px 0 4px",
  fontSize: 34,
  lineHeight: 1.05,
  fontWeight: 950,
};

const subStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: "rgba(0,0,0,0.62)",
};

const blackLink: React.CSSProperties = {
  borderRadius: 999,
  padding: "13px 18px",
  background: "#050505",
  color: "white",
  fontWeight: 950,
  textDecoration: "none",
};

const whiteLink: React.CSSProperties = {
  borderRadius: 999,
  padding: "13px 18px",
  background: "white",
  color: "#050505",
  fontWeight: 950,
  textDecoration: "none",
  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.10)",
};

const panelStyle: React.CSSProperties = {
  borderRadius: 30,
  background: "white",
  border: "1px solid rgba(0,0,0,0.08)",
  overflow: "hidden",
};

const panelHeaderStyle: React.CSSProperties = {
  padding: 18,
  fontSize: 14,
  fontWeight: 950,
  borderBottom: "1px solid rgba(0,0,0,0.08)",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 14px",
  fontSize: 12,
  fontWeight: 950,
  color: "rgba(0,0,0,0.62)",
  background: "rgba(0,0,0,0.03)",
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: "12px 14px",
  borderTop: "1px solid rgba(0,0,0,0.06)",
  fontSize: 13,
  whiteSpace: "nowrap",
};
