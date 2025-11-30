// src/App.jsx

import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import LinkPage from "./pages/LinkPage";
import Panel from "./pages/Panel";
import Logo from "./assets/whispme-logo.png";

// Games
import Games from "./pages/Games";
import LoveMeterHome from "./pages/games/love-meter/LoveMeterHome";
import LoveMeterSelf from "./pages/games/love-meter/LoveMeterSelf";
import LoveMeterRoom from "./pages/games/love-meter/LoveMeterRoom";

// Premium
import PremiumPage from "./pages/PremiumPage";

// Legal
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import RefundPage from "./pages/RefundPage";

function App() {
  const isPremium = localStorage.getItem("whispme_premium") === "true";
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050816",
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* 📱 MOBILE NAVBAR */}
      <header
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(5,8,22,0.85)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* LOGO */}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
            color: "white",
          }}
        >
          <img src={Logo} alt="WhispMe" style={{ height: 30 }} />
          <span style={{ fontSize: 16, fontWeight: "700" }}>WhispMe</span>
        </Link>

        {/* HAMBURGER BUTTON */}
        <div
          onClick={() => setMenuOpen(true)}
          style={{
            width: 30,
            height: 30,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            fontSize: 26,
          }}
        >
          ☰
        </div>
      </header>

      {/* 📂 SLIDE MENU (Right Drawer) */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(3px)",
            zIndex: 60,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "70%",
              maxWidth: 270,
              height: "100%",
              background: "#0b0f25",
              padding: "25px 18px",
              boxShadow: "0 0 20px rgba(0,0,0,0.6)",
            }}
          >
            {/* CLOSE BUTTON */}
            <div
              onClick={() => setMenuOpen(false)}
              style={{
                fontSize: 28,
                textAlign: "right",
                marginBottom: 30,
                cursor: "pointer",
              }}
            >
              ✕
            </div>

            {/* MENU LINKS */}
            <nav
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 18,
                fontSize: 17,
              }}
            >
              <Link to="/" style={linkStyle}>Home</Link>
              <Link to="/panel" style={linkStyle}>Inbox</Link>
              <Link to="/games" style={linkStyle}>Games</Link>

              {!isPremium && (
                <Link
                  to="/premium"
                  style={{
                    ...linkStyle,
                    background: "linear-gradient(135deg,#ffd776,#ffb347)",
                    color: "#000",
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontWeight: 700,
                  }}
                >
                  ⭐ Upgrade to Premium
                </Link>
              )}

              {/* LEGAL LINKS */}
              <Link to="/terms" style={subLinkStyle}>Terms & Conditions</Link>
              <Link to="/privacy" style={subLinkStyle}>Privacy Policy</Link>
              <Link to="/refund" style={subLinkStyle}>Refund Policy</Link>
            </nav>
          </div>
        </div>
      )}

      {/* CONTENT */}
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/m/:handle" element={<LinkPage />} />
          <Route path="/panel" element={<Panel />} />

          {/* Games */}
          <Route path="/games" element={<Games />} />
          <Route path="/games/love-meter" element={<LoveMeterHome />} />
          <Route path="/games/love-meter/self" element={<LoveMeterSelf />} />
          <Route path="/games/love-meter/room/:roomId" element={<LoveMeterRoom />} />

          {/* Premium */}
          <Route path="/premium" element={<PremiumPage />} />

          {/* Legal */}
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/refund" element={<RefundPage />} />
        </Routes>
      </main>
    </div>
  );
}

const linkStyle = {
  color: "#fff",
  textDecoration: "none",
  padding: "6px 0",
  fontWeight: 500,
};

const subLinkStyle = {
  color: "rgba(255,255,255,0.6)",
  textDecoration: "none",
  fontSize: 14,
};

export default App;
