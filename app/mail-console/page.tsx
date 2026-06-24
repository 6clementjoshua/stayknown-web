import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  MAIL_CONSOLE_COOKIE,
  verifyMailConsoleSessionToken,
} from "@/lib/mailConsoleServerAuth";

type SenderIdentity = {
  id: string;
  label: string;
  from_email: string;
  reply_to_email: string | null;
  purpose: string;
  can_send_support: boolean;
  can_send_newsletter: boolean;
};

function clean(v: string | undefined | null) {
  return (v || "").trim();
}

function td(value: string) {
  return (
    <td
      style={{
        padding: "12px 14px",
        borderTop: "1px solid rgba(0,0,0,0.06)",
        fontSize: 13,
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </td>
  );
}

export default async function MailConsolePage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(MAIL_CONSOLE_COOKIE)?.value || "";

  let adminEmail = "";

  try {
    const payload = verifyMailConsoleSessionToken(sessionToken);
    adminEmail = payload.email;
  } catch (_) {
    redirect("/mail-login");
  }

  const supabaseUrl = clean(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
  const serviceRole = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!supabaseUrl || !serviceRole) {
    throw new Error("Missing Supabase server configuration.");
  }

  const admin = createClient(supabaseUrl, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: adminRow } = await admin
    .from("mail_console_admins")
    .select("id,email,role,is_active")
    .ilike("email", adminEmail)
    .eq("is_active", true)
    .maybeSingle();

  if (!adminRow) {
    redirect("/mail-login");
  }

  const { data: senderRows, error: senderError } = await admin
    .from("mail_console_sender_identities")
    .select(
      "id,label,from_email,reply_to_email,purpose,can_send_support,can_send_newsletter",
    )
    .eq("is_active", true)
    .order("from_email", { ascending: true });

  if (senderError) {
    throw new Error(senderError.message);
  }

  const senders = (senderRows || []) as SenderIdentity[];

  const thStyle: React.CSSProperties = {
    textAlign: "left",
    padding: "12px 14px",
    fontSize: 12,
    fontWeight: 950,
    color: "rgba(0,0,0,0.62)",
    whiteSpace: "nowrap",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: 24,
        color: "#050505",
      }}
    >
      <section style={{ maxWidth: 1040, margin: "0 auto" }}>
        <header
          style={{
            borderRadius: 28,
            background: "rgba(255,255,255,0.88)",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 24px 70px rgba(0,0,0,0.09)",
            padding: 24,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 14,
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 950,
                  letterSpacing: 2.4,
                  textTransform: "uppercase",
                  color: "rgba(0,0,0,0.58)",
                }}
              >
                StayKnown Mail Console
              </div>

              <h1
                style={{
                  margin: "8px 0 4px",
                  fontSize: 32,
                  lineHeight: 1.05,
                  fontWeight: 950,
                }}
              >
                Email Control Center
              </h1>

              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: "rgba(0,0,0,0.62)",
                  lineHeight: 1.5,
                }}
              >
                Logged in as {adminEmail}
              </p>
            </div>

            <form action="/api/mail-console/logout" method="post">
              <button
                type="submit"
                style={{
                  border: 0,
                  borderRadius: 999,
                  padding: "12px 16px",
                  background: "#050505",
                  color: "white",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </form>
          </div>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginBottom: 18,
          }}
        >
          <div style={cardStyle}>
            <div style={labelStyle}>ACTIVE SENDERS</div>
            <div style={countStyle}>{senders.length}</div>
            <div style={hintStyle}>From addresses available for sending.</div>
          </div>

          <div style={cardStyle}>
            <div style={labelStyle}>SUPPORT SENDERS</div>
            <div style={countStyle}>
              {senders.filter((s) => s.can_send_support).length}
            </div>
            <div style={hintStyle}>Can be used for reply-enabled email.</div>
          </div>

          <div style={cardStyle}>
            <div style={labelStyle}>NEWSLETTER SENDERS</div>
            <div style={countStyle}>
              {senders.filter((s) => s.can_send_newsletter).length}
            </div>
            <div style={hintStyle}>Can be used for newsletters/adverts.</div>
          </div>
        </div>

        <section
          style={{
            borderRadius: 28,
            background: "white",
            border: "1px solid rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: 18,
              borderBottom: "1px solid rgba(0,0,0,0.08)",
              fontWeight: 950,
            }}
          >
            Sender identities
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(0,0,0,0.03)" }}>
                  <th style={thStyle}>Label</th>
                  <th style={thStyle}>From email</th>
                  <th style={thStyle}>Reply-to</th>
                  <th style={thStyle}>Purpose</th>
                  <th style={thStyle}>Support</th>
                  <th style={thStyle}>Newsletter</th>
                </tr>
              </thead>

              <tbody>
                {senders.map((s) => (
                  <tr key={s.id}>
                    {td(s.label)}
                    {td(s.from_email)}
                    {td(s.reply_to_email || "—")}
                    {td(s.purpose)}
                    {td(s.can_send_support ? "Yes" : "No")}
                    {td(s.can_send_newsletter ? "Yes" : "No")}
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

const cardStyle: React.CSSProperties = {
  borderRadius: 24,
  background: "white",
  border: "1px solid rgba(0,0,0,0.08)",
  padding: 20,
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 950,
  opacity: 0.58,
};

const countStyle: React.CSSProperties = {
  fontSize: 34,
  fontWeight: 950,
  marginTop: 8,
};

const hintStyle: React.CSSProperties = {
  fontSize: 13,
  opacity: 0.62,
  marginTop: 4,
};
