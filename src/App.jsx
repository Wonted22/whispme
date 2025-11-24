// src/App.jsx
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import LinkPage from "./pages/LinkPage";
import Panel from "./pages/Panel";
import Logo from "./assets/whispme-logo.png";

// GAMES
import Games from "./pages/Games";
import WheelHome from "./pages/games/wheel/WheelHome";
import WheelCreate from "./pages/games/wheel/WheelCreate";
import WheelRoom from "./pages/games/wheel/WheelRoom";

// ⭐ PREMIUM PAGE
import PremiumPage from "./pages/PremiumPage";

function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        background: "#050816",
        color: "#fff",
      }}
    >
      {/* ⭐ NAVBAR */}
      <header
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 20,
          backdropFilter: "blur(10px)",
          background: "rgba(5,8,22,0.85)",
        }}
      >
        {/* LOGO */}
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <img
            src={Logo}
            alt="WhispMe"
            style={{
              height: 30,
              filter: "drop-shadow(0 0 4px #00eaff)",
              userSelect: "none",
            }}
          />
          <span style={{ fontSize: 16, fontWeight: 700 }}>WhispMe</span>
        </Link>

        {/* NAV LINKS */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 14,
          }}
        >
          <Link
            to="/"
            style={{ color: "white", opacity: 0.8, textDecoration: "none" }}
          >
            Home
          </Link>

          <Link
            to="/panel"
            style={{ color: "white", opacity: 0.8, textDecoration: "none" }}
          >
            Whisp Kutum
          </Link>

          <Link
            to="/games"
            style={{ color: "white", opacity: 0.9, textDecoration: "none" }}
          >
            🎮 Oyunlar
          </Link>

          {/* ⭐ PREMIUM BUTTON */}
          <Link
            to="/premium"
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              background: "linear-gradient(135deg,#ffd776,#ffb347)",
              color: "#000",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 0 8px rgba(255,215,118,0.55)",
            }}
          >
            ⭐ Premium
          </Link>
        </nav>
      </header>

      {/* PAGE CONTENT */}
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/m/:handle" element={<LinkPage />} />
          <Route path="/panel" element={<Panel />} />

          {/* GAMES */}
          <Route path="/games" element={<Games />} />
          <Route path="/games/wheel/create" element={<WheelCreate />} />
          <Route path="/games/wheel/room/:roomId" element={<WheelRoom />} />

          {/* ⭐ PREMIUM PAGE */}
          <Route path="/premium" element={<PremiumPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
