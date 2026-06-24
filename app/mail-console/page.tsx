"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { mailConsoleSupabase } from "@/lib/mailConsoleSupabase";

type SenderIdentity = {
  id: string;
  label: string;
  from_email: string;
  reply_to_email: string | null;
  purpose: string;
  can_send_support: boolean;
  can_send_newsletter: boolean;
};

export default function MailConsolePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");
  const [senders, setSenders] = useState<SenderIdentity[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function boot() {
      setLoading(true);
      setError("");

      try {
        const { data: sessionData } =
          await mailConsoleSupabase.auth.getSession();

        const session = sessionData.session;

        if (!session?.user?.email) {
          router.replace("/mail-login");
          return;
        }

        const cleanEmail = session.user.email.trim().toLowerCase();

        const { data: adminRow, error: adminError } = await mailConsoleSupabase
          .from("mail_console_admins")
          .select("id,email,role,is_active")
          .eq("email", cleanEmail)
          .eq("is_active", true)
          .maybeSingle();

        if (adminError) {
          throw new Error(adminError.message);
        }

        if (!adminRow) {
          await mailConsoleSupabase.auth.signOut();
          router.replace("/mail-login");
          return;
        }

        const { data: senderRows, error: senderError } =
          await mailConsoleSupabase
            .from("mail_console_sender_identities")
            .select(
              "id,label,from_email,reply_to_email,purpose,can_send_support,can_send_newsletter",
            )
            .eq("is_active", true)
            .order("from_email", { ascending: true });

        if (senderError) {
          throw new Error(senderError.message);
        }

        if (!alive) return;

        setAdminEmail(cleanEmail);
        setSenders((senderRows || []) as SenderIdentity[]);
      } catch (err) {
        if (!alive) return;
        setError(
          err instanceof Error ? err.message : "Failed to load console.",
        );
      } finally {
        if (alive) setLoading(false);
      }
    }

    boot();

    return () => {
      alive = false;
    };
  }, [router]);

  async function logout() {
    await mailConsoleSupabase.auth.signOut();
    router.replace("/mail-login");
  }

  if (loading) {
    return (
      <main
        style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}
      >
        <div style={{ fontWeight: 900 }}>Loading mail console...</div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: 24,
        color: "#050505",
      }}
    >
      <section
        style={{
          maxWidth: 1040,
          margin: "0 auto",
        }}
      >
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

            <button
              onClick={logout}
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
          </div>
        </header>

        {error ? (
          <div
            style={{
              borderRadius: 20,
              background: "rgba(255,0,0,0.06)",
              border: "1px solid rgba(255,0,0,0.14)",
              color: "#8a1111",
              padding: 16,
              marginBottom: 18,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              borderRadius: 24,
              background: "white",
              border: "1px solid rgba(0,0,0,0.08)",
              padding: 20,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 950, opacity: 0.58 }}>
              ACTIVE SENDERS
            </div>
            <div style={{ fontSize: 34, fontWeight: 950, marginTop: 8 }}>
              {senders.length}
            </div>
            <div style={{ fontSize: 13, opacity: 0.62, marginTop: 4 }}>
              From addresses available for support/newsletter sending.
            </div>
          </div>

          <div
            style={{
              borderRadius: 24,
              background: "white",
              border: "1px solid rgba(0,0,0,0.08)",
              padding: 20,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 950, opacity: 0.58 }}>
              SUPPORT SENDERS
            </div>
            <div style={{ fontSize: 34, fontWeight: 950, marginTop: 8 }}>
              {senders.filter((s) => s.can_send_support).length}
            </div>
            <div style={{ fontSize: 13, opacity: 0.62, marginTop: 4 }}>
              Can be used for reply-enabled email.
            </div>
          </div>

          <div
            style={{
              borderRadius: 24,
              background: "white",
              border: "1px solid rgba(0,0,0,0.08)",
              padding: 20,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 950, opacity: 0.58 }}>
              NEWSLETTER SENDERS
            </div>
            <div style={{ fontSize: 34, fontWeight: 950, marginTop: 8 }}>
              {senders.filter((s) => s.can_send_newsletter).length}
            </div>
            <div style={{ fontSize: 13, opacity: 0.62, marginTop: 4 }}>
              Can be used for newsletters/adverts.
            </div>
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
                  <th style={th}>Label</th>
                  <th style={th}>From email</th>
                  <th style={th}>Reply-to</th>
                  <th style={th}>Purpose</th>
                  <th style={th}>Support</th>
                  <th style={th}>Newsletter</th>
                </tr>
              </thead>

              <tbody>
                {senders.map((s) => (
                  <tr key={s.id}>
                    <td style={td}>{s.label}</td>
                    <td style={td}>{s.from_email}</td>
                    <td style={td}>{s.reply_to_email || "—"}</td>
                    <td style={td}>{s.purpose}</td>
                    <td style={td}>{s.can_send_support ? "Yes" : "No"}</td>
                    <td style={td}>{s.can_send_newsletter ? "Yes" : "No"}</td>
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

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 14px",
  fontSize: 12,
  fontWeight: 950,
  color: "rgba(0,0,0,0.62)",
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: "12px 14px",
  borderTop: "1px solid rgba(0,0,0,0.06)",
  fontSize: 13,
  whiteSpace: "nowrap",
};
