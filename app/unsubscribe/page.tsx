export default function UnsubscribePage({
  searchParams,
}: {
  searchParams: { email?: string; token?: string };
}) {
  const email = searchParams.email || "";
  const token = searchParams.token || "";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        display: "grid",
        placeItems: "center",
        padding: 24,
        color: "#050505",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 460,
          borderRadius: 30,
          background: "white",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 24px 70px rgba(0,0,0,0.09)",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 950,
            letterSpacing: 2.6,
            textTransform: "uppercase",
            color: "rgba(0,0,0,0.58)",
          }}
        >
          StayKnown Email Preferences
        </div>

        <h1 style={{ fontSize: 28, margin: "12px 0 8px", fontWeight: 950 }}>
          Unsubscribe
        </h1>

        <p
          style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(0,0,0,0.62)" }}
        >
          Confirm that you want to stop receiving StayKnown newsletter or advert
          emails.
        </p>

        <form action="/api/mail-console/unsubscribe" method="post">
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="token" value={token} />

          <button
            type="submit"
            style={{
              border: 0,
              borderRadius: 999,
              padding: "13px 18px",
              background: "#050505",
              color: "white",
              fontWeight: 950,
              cursor: "pointer",
              marginTop: 10,
            }}
          >
            Confirm Unsubscribe
          </button>
        </form>
      </section>
    </main>
  );
}
