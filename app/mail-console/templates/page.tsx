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
    <main style={mainStyle}>
      <section style={{ maxWidth: 980, margin: "0 auto" }}>
        <header style={headerStyle}>
          <div>
            <div style={kickerStyle}>StayKnown Mail Console</div>
            <h1 style={h1Style}>Reusable Templates</h1>
            <p style={subStyle}>
              Edit templates used by the composer. Logged in as {adminEmail}
            </p>
          </div>

          <Link href="/mail-console" style={whiteLink}>
            Dashboard
          </Link>
        </header>

        <section style={panelStyle}>
          {templates.map((t) => (
            <form
              key={t.id}
              action="/api/mail-console/template"
              method="post"
              style={{
                padding: 18,
                borderBottom: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <input type="hidden" name="id" value={t.id} />

              <div style={{ display: "grid", gap: 12 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 180px",
                    gap: 12,
                  }}
                >
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

                <label
                  style={{
                    display: "inline-flex",
                    gap: 8,
                    alignItems: "center",
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  <input
                    type="checkbox"
                    name="is_active"
                    defaultChecked={t.is_active}
                  />
                  Active
                </label>

                <div>
                  <button type="submit" style={blackButton}>
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

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 950,
  color: "rgba(0,0,0,0.65)",
  marginBottom: 7,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 16,
  border: "1px solid rgba(0,0,0,0.12)",
  background: "white",
  padding: "13px 14px",
  fontSize: 14,
  color: "#050505",
  outline: "none",
};

const blackButton: React.CSSProperties = {
  border: 0,
  borderRadius: 999,
  padding: "12px 16px",
  background: "#050505",
  color: "white",
  fontWeight: 950,
  cursor: "pointer",
};
