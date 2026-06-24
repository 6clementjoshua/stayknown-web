"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  getMailConsoleConfigStatus,
  mailConsoleSupabase,
} from "@/lib/mailConsoleSupabase";

const OWNER_EMAIL = "6clementjoshua@gmail.com";

export default function MailLoginPage() {
  const [email, setEmail] = useState(OWNER_EMAIL);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const config = useMemo(() => getMailConsoleConfigStatus(), []);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setBusy(true);
    setMessage("");

    try {
      const cleanEmail = email.trim().toLowerCase();

      if (!config.hasUrl || !config.hasAnonKey) {
        setMessage(
          `Missing Supabase browser config. URL: ${config.hasUrl ? "yes" : "no"}, anon key: ${config.hasAnonKey ? "yes" : "no"}`,
        );
        return;
      }

      if (!cleanEmail) {
        setMessage("Enter your admin email.");
        return;
      }

      if (cleanEmail !== OWNER_EMAIL) {
        setMessage("This email is not allowed to access the mail console.");
        return;
      }

      const redirectTo = `${window.location.origin}/mail-console`;

      const { error } = await mailConsoleSupabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: false,
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage(
        "Login link sent. Open your email and tap the link to enter the mail console.",
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";

      setMessage(
        msg.toLowerCase().includes("failed to fetch")
          ? `Failed to reach Supabase Auth. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel, then redeploy. Current URL: ${config.url || "missing"}`
          : msg,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(255,255,255,1), rgba(229,231,235,1))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 430,
          borderRadius: 28,
          background: "rgba(255,255,255,0.86)",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 30px 90px rgba(0,0,0,0.12)",
          padding: 26,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 950,
              letterSpacing: 2.4,
              color: "rgba(0,0,0,0.72)",
              textTransform: "uppercase",
            }}
          >
            StayKnown Mail Console
          </div>

          <h1
            style={{
              margin: "12px 0 6px",
              fontSize: 26,
              lineHeight: 1.1,
              fontWeight: 950,
              color: "#050505",
            }}
          >
            Private Email Login
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: 1.55,
              color: "rgba(0,0,0,0.58)",
            }}
          >
            Enter your admin email. StayKnown will send a secure login link to
            your inbox.
          </p>
        </div>

        <div
          style={{
            marginBottom: 14,
            borderRadius: 16,
            background: "rgba(0,0,0,0.035)",
            border: "1px solid rgba(0,0,0,0.08)",
            padding: 12,
            fontSize: 12,
            lineHeight: 1.5,
            color: "rgba(0,0,0,0.62)",
          }}
        >
          Supabase URL: {config.hasUrl ? "loaded" : "missing"}
          <br />
          Supabase anon key: {config.hasAnonKey ? "loaded" : "missing"}
        </div>

        <form onSubmit={handleLogin}>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 900,
              color: "rgba(0,0,0,0.68)",
              marginBottom: 7,
            }}
          >
            Admin email
          </label>

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            type="email"
            style={{
              width: "100%",
              borderRadius: 16,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "white",
              padding: "14px 14px",
              fontSize: 14,
              outline: "none",
              marginBottom: 16,
              color: "#050505",
            }}
          />

          <button
            disabled={busy}
            type="submit"
            style={{
              width: "100%",
              border: 0,
              borderRadius: 999,
              padding: "14px 18px",
              background: busy ? "rgba(0,0,0,0.48)" : "#050505",
              color: "white",
              fontSize: 14,
              fontWeight: 950,
              cursor: busy ? "not-allowed" : "pointer",
              boxShadow: "0 18px 44px rgba(0,0,0,0.18)",
            }}
          >
            {busy ? "Sending login link..." : "Send Login Link"}
          </button>
        </form>

        {message ? (
          <div
            style={{
              marginTop: 16,
              borderRadius: 16,
              background: message.toLowerCase().includes("sent")
                ? "rgba(0,180,90,0.08)"
                : "rgba(255,0,0,0.06)",
              border: message.toLowerCase().includes("sent")
                ? "1px solid rgba(0,180,90,0.18)"
                : "1px solid rgba(255,0,0,0.14)",
              color: message.toLowerCase().includes("sent")
                ? "#075f35"
                : "#8a1111",
              padding: 12,
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            {message}
          </div>
        ) : null}
      </section>
    </main>
  );
}
