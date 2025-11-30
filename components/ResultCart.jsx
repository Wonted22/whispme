export default function ResultCard({ score = 76, username = "You" }) {
  return (
    <div
      style={{
        width: 320,
        height: 560,
        borderRadius: 20,
        background: "linear-gradient(160deg, #0b0f24, #2a005e, #ff005d)",
        padding: "26px 20px",
        color: "white",
        fontFamily: "system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "0 0 30px rgba(255,0,100,0.4)",
      }}
    >
      {/* HEADER */}
      <div style={{ textAlign: "center", marginTop: 10 }}>
        <h3 style={{ fontSize: 18, opacity: 0.8, margin: 0 }}>Love Meter</h3>
      </div>

      {/* SCORE */}
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            fontSize: 96,
            margin: 0,
            fontWeight: 800,
            background:
              "linear-gradient(90deg,#ffb3d9,#ff4d67,#ffb347)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            textShadow: "0 0 18px rgba(255,0,100,0.7)",
          }}
        >
          {score}%
        </h1>
        <p style={{ fontSize: 14, opacity: 0.8, marginTop: -8 }}>
          Overall Score
        </p>
      </div>

      {/* USERNAME */}
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 16, opacity: 0.9 }}>
          @{username}
        </p>
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <p
          style={{
            fontSize: 14,
            opacity: 0.9,
            letterSpacing: 1,
          }}
        >
          SWIPE UP 🔥
        </p>
      </div>

      {/* BRANDING */}
      <div style={{ textAlign: "center", opacity: 0.55, fontSize: 12 }}>
        WhispMe • Anonymous
      </div>
    </div>
  );
}
