"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { mailConsoleSupabase } from "@/lib/mailConsoleSupabase";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function MailAuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Securing your admin session...");

  useEffect(() => {
    let alive = true;

    async function completeLogin() {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        if (code) {
          setMessage("Verifying secure login link...");

          const { error } =
            await mailConsoleSupabase.auth.exchangeCodeForSession(code);

          if (error) {
            throw new Error(error.message);
          }
        } else {
          setMessage("Reading secure login session...");

          const hash = new URLSearchParams(
            window.location.hash.replace(/^#/, ""),
          );

          const accessToken = hash.get("access_token");
          const refreshToken = hash.get("refresh_token");

          if (accessToken && refreshToken) {
            const { error } = await mailConsoleSupabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              throw new Error(error.message);
            }
          }
        }

        await wait(350);

        const { data } = await mailConsoleSupabase.auth.getSession();

        if (!data.session) {
          throw new Error(
            "Login session was not created. Please request a fresh admin login link.",
          );
        }

        if (!alive) return;

        window.history.replaceState({}, "", "/mail-console");
        router.replace("/mail-console");
      } catch (err) {
        if (!alive) return;

        setMessage(
          err instanceof Error
            ? err.message
            : "Could not complete admin login.",
        );

        await wait(1600);
        router.replace("/mail-login");
      }
    }

    completeLogin();

    return () => {
      alive = false;
    };
  }, [router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(255,255,255,1), rgba(229,231,235,1))",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 430,
          borderRadius: 28,
          background: "rgba(255,255,255,0.9)",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 30px 90px rgba(0,0,0,0.12)",
          padding: 26,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 950,
            letterSpacing: 2.4,
            color: "rgba(0,0,0,0.72)",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          StayKnown Mail Console
        </div>

        <h1
          style={{
            margin: "0 0 8px",
            fontSize: 24,
            lineHeight: 1.15,
            fontWeight: 950,
            color: "#050505",
          }}
        >
          Admin login
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 14,
            lineHeight: 1.6,
            color: "rgba(0,0,0,0.62)",
          }}
        >
          {message}
        </p>
      </section>
    </main>
  );
}
