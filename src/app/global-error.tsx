"use client";

// Catches errors in the root layout itself (must render its own <html>/<body>).
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          textAlign: "center",
          background: "#FFF9F2",
          color: "#3D3545",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 48 }}>🌈</div>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Oops, a little hiccup!</h1>
        <p style={{ maxWidth: 280, opacity: 0.7 }}>Nothing is lost. Let&rsquo;s try that again.</p>
        <button
          onClick={() => reset()}
          style={{
            minHeight: 48,
            borderRadius: 16,
            border: "none",
            background: "#F7B8D4",
            color: "#3D3545",
            padding: "12px 32px",
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
