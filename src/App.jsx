// src/App.jsx
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import LinkPage from "./pages/LinkPage";
import Panel from "./pages/Panel";
import Logo from "./assets/whispme-logo.png";

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
      {/* NAVBAR */}
      <header
        style={{
          padding: "10px 16px",
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
        {/* LOGO (WhispMe yazısı kaldırıldı!) */}
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "white",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <img
            src={Logo}
            alt="WhispMe logo"
            style={{
              height: 30,
              userSelect: "none",
              filter: "drop-shadow(0 0 6px #00eaff)",
              borderRadius: 6,
            }}
          />
        </Link>

        <nav style={{ display: "flex", gap: 12, fontSize: 13 }}>
          <Link
            to="/"
            style={{ textDecoration: "none", color: "white", opacity: 0.8 }}
          >
            Ana Sayfa
          </Link>
          <Link
            to="/panel"
            style={{ textDecoration: "none", color: "white", opacity: 0.8 }}
          >
            Whisp Kutum
          </Link>
        </nav>
      </header>

      {/* SAYFA İÇERİĞİ */}
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/m/:handle" element={<LinkPage />} />
          <Route path="/panel" element={<Panel />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
