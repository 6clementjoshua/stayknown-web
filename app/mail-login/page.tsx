"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { mailConsoleSupabase } from "@/lib/mailConsoleSupabase";

export default function MailLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("6clementjoshua@gmail.com");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setBusy(true);
    setMessage("");

    try {
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanEmail || !password.trim()) {
        setMessage("Enter your email and password.");
        return;
      }

      const { data, error } = await mailConsoleSupabase.auth.signInWithPassword(
        {
          email: cleanEmail,
          password,
        },
      );

      if (error || !data.session) {
        setMessage(error?.message || "Login failed.");
        return;
      }

      const { data: adminRow, error: adminError } = await mailConsoleSupabase
        .from("mail_console_admins")
        .select("id,email,role,is_active")
        .eq("email", cleanEmail)
        .eq("is_active", true)
        .maybeSingle();

      if (adminError) {
        setMessage(adminError.message);
        await mailConsoleSupabase.auth.signOut();
        return;
      }

      if (!adminRow) {
        setMessage("This email is not allowed to access the mail console.");
        await mailConsoleSupabase.auth.signOut();
        return;
      }

      router.replace("/mail-console");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
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
            Private Admin Login
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: 1.55,
              color: "rgba(0,0,0,0.58)",
            }}
          >
            Login to send support emails, newsletters, adverts, and investor
            messages using StayKnown sender addresses.
          </p>
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
              marginBottom: 14,
              color: "#050505",
            }}
          />

          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 900,
              color: "rgba(0,0,0,0.68)",
              marginBottom: 7,
            }}
          >
            Password
          </label>

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            type="password"
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
            {busy ? "Checking..." : "Open Mail Console"}
          </button>
        </form>

        {message ? (
          <div
            style={{
              marginTop: 16,
              borderRadius: 16,
              background: "rgba(255,0,0,0.06)",
              border: "1px solid rgba(255,0,0,0.14)",
              color: "#8a1111",
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
