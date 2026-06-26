import type { CSSProperties } from "react";
import Link from "next/link";
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
        color: "rgba(5,5,5,0.78)",
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

  const supportCount = senders.filter((s) => s.can_send_support).length;
  const newsletterCount = senders.filter((s) => s.can_send_newsletter).length;

  return (
    <main className="sk-mail-dashboard" style={pageStyle}>
      <style>{`
        .sk-mail-dashboard {
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
              rgba(255,255,255,0.42) 26%,
              transparent 52%
            );
          transform: translateX(-130%);
          transition: transform 520ms ease;
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
            rgba(255,255,255,0.45) 0%,
            rgba(255,255,255,0.22) 36%,
            transparent 72%
          );
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.25);
          transition:
            opacity 220ms ease,
            transform 420ms ease;
          pointer-events: none;
        }

        .sk-premium-button:hover {
          transform: translateY(-2px);
        }

        .sk-premium-button:hover::before {
          transform: translateX(130%);
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
            inset 0 1px 0 rgba(255,255,255,0.25),
            0 20px 46px rgba(0,0,0,0.24) !important;
        }

        .sk-ghost-button:hover {
          border-color: rgba(0,0,0,0.18) !important;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.96),
            0 18px 40px rgba(0,0,0,0.10) !important;
        }

        .sk-danger-button:hover {
          border-color: rgba(220,38,38,0.22) !important;
          color: rgb(185,28,28) !important;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.96),
            0 18px 40px rgba(220,38,38,0.12) !important;
        }

        .sk-dashboard-card {
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            border-color 180ms ease,
            background 180ms ease;
        }

        .sk-dashboard-card:hover {
          transform: translateY(-3px);
          border-color: rgba(0,0,0,0.14) !important;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.94),
            0 24px 60px rgba(0,0,0,0.10) !important;
        }

        .sk-summary-toggle {
          transition:
            background 180ms ease,
            color 180ms ease,
            box-shadow 180ms ease;
        }

        .sk-summary-toggle:hover {
          background: rgba(0,0,0,0.035);
          box-shadow: inset 0 -1px 0 rgba(0,0,0,0.06);
        }

        .sk-mail-dashboard table tbody tr {
          transition: background 160ms ease;
        }

        .sk-mail-dashboard table tbody tr:hover {
          background: rgba(0,0,0,0.025);
        }

        @media (max-width: 720px) {
          .sk-dashboard-header-inner {
            align-items: stretch !important;
          }

          .sk-dashboard-actions {
            width: 100%;
          }

          .sk-dashboard-actions > a,
          .sk-dashboard-actions > form,
          .sk-dashboard-actions button {
            width: 100%;
          }
        }
      `}</style>

      <section style={containerStyle}>
        <header style={heroStyle}>
          <div className="sk-dashboard-header-inner" style={heroInnerStyle}>
            <div>
              <div style={kickerStyle}>StayKnown Mail Console</div>

              <h1 style={h1Style}>Email Control Center</h1>

              <p style={subStyle}>Logged in as {adminEmail}</p>
            </div>

            <nav className="sk-dashboard-actions" style={headerActionsStyle}>
              <Link
                href="/mail-console/send"
                className="sk-premium-button sk-primary-button"
                style={primaryButtonStyle}
              >
                <span style={buttonIconStyle}>✦</span>
                Compose
              </Link>

              <Link
                href="/mail-console/logs"
                className="sk-premium-button sk-ghost-button"
                style={ghostButtonStyle}
              >
                Logs
              </Link>

              <Link
                href="/mail-console/footer-policies"
                className="sk-premium-button sk-ghost-button"
                style={ghostButtonStyle}
              >
                Footer
              </Link>

              <Link
                href="/mail-console/templates"
                className="sk-premium-button sk-ghost-button"
                style={ghostButtonStyle}
              >
                Templates
              </Link>

              <form action="/api/mail-console/logout" method="post">
                <button
                  type="submit"
                  className="sk-premium-button sk-danger-button"
                  style={dangerButtonStyle}
                >
                  Logout
                </button>
              </form>
            </nav>
          </div>
        </header>

        <div style={cardsGridStyle}>
          <div className="sk-dashboard-card" style={cardStyle}>
            <div style={labelStyle}>ACTIVE SENDERS</div>
            <div style={countStyle}>{senders.length}</div>
            <div style={hintStyle}>From addresses available for sending.</div>
          </div>

          <div className="sk-dashboard-card" style={cardStyle}>
            <div style={labelStyle}>SUPPORT SENDERS</div>
            <div style={countStyle}>{supportCount}</div>
            <div style={hintStyle}>Can be used for reply-enabled email.</div>
          </div>

          <div className="sk-dashboard-card" style={cardStyle}>
            <div style={labelStyle}>NEWSLETTER SENDERS</div>
            <div style={countStyle}>{newsletterCount}</div>
            <div style={hintStyle}>Can be used for newsletters/adverts.</div>
          </div>
        </div>

        <section style={composerCardStyle}>
          <div style={composerCardGlowStyle} />

          <div style={composerContentStyle}>
            <div>
              <div style={smallCapsStyle}>Branded delivery</div>

              <h2 style={h2Style}>Send branded email</h2>

              <p style={bodyTextStyle}>
                Compose support messages, newsletters, adverts, investor
                updates, and branded company communication from verified
                StayKnown sender addresses.
              </p>
            </div>

            <Link
              href="/mail-console/send"
              className="sk-premium-button sk-primary-button"
              style={largePrimaryButtonStyle}
            >
              <span style={buttonIconStyle}>✎</span>
              Open Composer
            </Link>
          </div>
        </section>

        <details style={detailsStyle}>
          <summary className="sk-summary-toggle" style={summaryStyle}>
            <span>View sender identities</span>
            <span style={summaryPillStyle}>{senders.length} active</span>
          </summary>

          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
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
        </details>
      </section>
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, rgba(255,255,255,0.98) 0%, rgba(243,244,246,1) 36%, rgba(235,236,239,1) 100%)",
  padding: 24,
  color: "#050505",
};

const containerStyle: CSSProperties = {
  maxWidth: 1080,
  margin: "0 auto",
};

const heroStyle: CSSProperties = {
  borderRadius: 30,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.84) 100%)",
  border: "1px solid rgba(255,255,255,0.92)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.96), 0 24px 70px rgba(0,0,0,0.09)",
  padding: 24,
  marginBottom: 18,
  backdropFilter: "blur(18px)",
};

const heroInnerStyle: CSSProperties = {
  display: "flex",
  gap: 18,
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
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

const primaryButtonStyle: CSSProperties = {
  ...baseButtonStyle,
  background:
    "linear-gradient(180deg, rgba(18,18,18,1) 0%, rgba(3,3,3,1) 100%)",
  color: "white",
  borderColor: "rgba(255,255,255,0.12)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.18), 0 14px 34px rgba(0,0,0,0.20)",
};

const largePrimaryButtonStyle: CSSProperties = {
  ...primaryButtonStyle,
  padding: "12px 18px",
  minHeight: 44,
};

const ghostButtonStyle: CSSProperties = {
  ...baseButtonStyle,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(246,246,246,0.94) 100%)",
  color: "#050505",
  borderColor: "rgba(0,0,0,0.08)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.96), 0 10px 24px rgba(0,0,0,0.055)",
};

const dangerButtonStyle: CSSProperties = {
  ...ghostButtonStyle,
  color: "rgba(5,5,5,0.76)",
  fontFamily: "inherit",
};

const buttonIconStyle: CSSProperties = {
  fontSize: 13,
  lineHeight: 1,
};

const cardsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 16,
  marginBottom: 18,
};

const cardStyle: CSSProperties = {
  borderRadius: 26,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.84) 100%)",
  border: "1px solid rgba(255,255,255,0.86)",
  padding: 20,
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.92), 0 14px 38px rgba(0,0,0,0.055)",
};

const labelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 950,
  letterSpacing: 1.5,
  color: "rgba(0,0,0,0.48)",
};

const countStyle: CSSProperties = {
  fontSize: 34,
  fontWeight: 950,
  marginTop: 8,
  letterSpacing: -1.2,
};

const hintStyle: CSSProperties = {
  fontSize: 13,
  color: "rgba(0,0,0,0.58)",
  marginTop: 4,
};

const composerCardStyle: CSSProperties = {
  position: "relative",
  borderRadius: 30,
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(248,248,248,0.9) 52%, rgba(238,238,238,0.92) 100%)",
  border: "1px solid rgba(255,255,255,0.88)",
  overflow: "hidden",
  marginBottom: 18,
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.96), 0 20px 55px rgba(0,0,0,0.08)",
};

const composerCardGlowStyle: CSSProperties = {
  position: "absolute",
  right: -80,
  top: -100,
  width: 220,
  height: 220,
  borderRadius: 999,
  background: "radial-gradient(circle, rgba(0,0,0,0.08), transparent 68%)",
  pointerEvents: "none",
};

const composerContentStyle: CSSProperties = {
  position: "relative",
  zIndex: 1,
  padding: 22,
  display: "flex",
  gap: 18,
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
};

const smallCapsStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 950,
  letterSpacing: 1.7,
  textTransform: "uppercase",
  color: "rgba(0,0,0,0.46)",
  marginBottom: 8,
};

const h2Style: CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 950,
  letterSpacing: -0.5,
};

const bodyTextStyle: CSSProperties = {
  margin: "8px 0 0",
  fontSize: 14,
  lineHeight: 1.65,
  color: "rgba(0,0,0,0.62)",
  maxWidth: 760,
};

const detailsStyle: CSSProperties = {
  borderRadius: 30,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.88) 100%)",
  border: "1px solid rgba(255,255,255,0.88)",
  overflow: "hidden",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.92), 0 14px 38px rgba(0,0,0,0.055)",
};

const summaryStyle: CSSProperties = {
  padding: 18,
  cursor: "pointer",
  fontWeight: 950,
  listStyle: "none",
  borderBottom: "1px solid rgba(0,0,0,0.08)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const summaryPillStyle: CSSProperties = {
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

const thStyle: CSSProperties = {
  textAlign: "left",
  padding: "12px 14px",
  fontSize: 12,
  fontWeight: 950,
  color: "rgba(0,0,0,0.62)",
  whiteSpace: "nowrap",
};
