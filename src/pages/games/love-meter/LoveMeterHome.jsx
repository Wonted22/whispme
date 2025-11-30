
// src/pages/games/love-meter/LoveMeterHome.jsx
import { useNavigate } from "react-router-dom";

export default function LoveMeterHome() {
  const navigate = useNavigate();

  const goToSelfTest = () => {
    navigate("/games/love-meter/self");
  };

  return (
    <div>
      <h1 style={{ fontSize: 26, marginBottom: 12 }}>❤️ Love Meter</h1>
      <p style={{ opacity: 0.8, fontSize: 14, marginBottom: 18 }}>
        Özünü tanı? Sənin sevgi enerjin nə qədərdir?
      </p>

      <button
        onClick={goToSelfTest}
        style={{
          width: "100%",
          padding: "14px 0",
          background: "#ec4899",
          borderRadius: 12,
          fontWeight: 700,
          cursor: "pointer",
          fontSize: 16,
        }}
      >
        🚀 Testə Başla
      </button>
    </div>
  );
}
