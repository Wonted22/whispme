import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// LOGO
import Logo from "../assets/whispme-logo.png";

function Home() {
  const [handle, setHandle] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const DOMAIN = "https://whispme.online";

  useEffect(() => {
    const saved = localStorage.getItem("whispme_handle");
    if (saved) {
      setHandle(saved);
      setGeneratedLink(`${DOMAIN}/m/${saved}`);
    }
  }, []);

  const createLink = async () => {
    setError("");

    const value = handle.trim().toLowerCase();
    if (!value) return setError("Lütfen bir kullanıcı adı gir.");
    if (!/^[a-z0-9_.]{3,20}$/.test(value))
      return setError("3–20 karakter, harf/rakam/nokta/alt çizgi kullanılabilir.");

    try {
      setLoading(true);

      const ref = doc(db, "links", value);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await setDoc(ref, {
          handle: value,
          createdAt: serverTimestamp(),
        });
      }

      localStorage.setItem("whispme_handle", value);
      setGeneratedLink(`${DOMAIN}/m/${value}`);
    } catch (e) {
      setError("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const shareLink = async () => {
    if (!generatedLink) return;

    const text = `Bana anonim Whisp göndermek için tıkla: ${generatedLink}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: "WhispMe", text, url: generatedLink });
      } else {
        await navigator.clipboard.writeText(text);
        alert("Link panoya kopyalandı:\n" + text);
      }
    } catch {}
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        padding: "30px 18px",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >

      {/* 🔥 ÜST LOGO */}
      <div
        style={{
          width: "100%",
          textAlign: "center",
          marginBottom: 20,
          marginTop: 5,
        }}
      >
        <img
          src={Logo}
          alt="WhispMe"
          style={{
            height: 48,
            filter: "drop-shadow(0 0 10px #00eaff)",
            userSelect: "none",
          }}
        />
      </div>

      {/* ⭐ PREMIUM DÜYMƏSİ */}
      <button
        onClick={() => navigate("/premium")}
        style={{
          margin: "0 auto 35px auto",
          padding: "10px 18px",
          borderRadius: 14,
          border: "none",
          background: "linear-gradient(135deg, #ffd776, #ffb347)",
          color: "#000",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 0 12px rgba(255,215,118,0.55)",
        }}
      >
        ⭐ WhispMe Premium
      </button>

      {/* AÇIKLAMA */}
      <div
        style={{
          textAlign: "center",
          fontSize: 16,
          opacity: 0.85,
          lineHeight: 1.4,
          marginBottom: 30,
        }}
      >
        Arkadaşlarından <strong>anonim</strong> Whisp al.<br />
        TikTok ve Instagram için optimize edildi.
      </div>

      {/* INPUT */}
      <div>
        <div style={{ fontSize: 14, marginBottom: 8 }}>Kullanıcı adı</div>

        <input
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="ör: michael"
          style={{
            width: "100%",
            padding: "14px 16px",
            fontSize: 16,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.20)",
            background: "rgba(0,0,0,0.30)",
            color: "white",
            outline: "none",
            boxShadow: "0 0 10px rgba(0,255,255,0.25)",
          }}
        />
      </div>

      {error && (
        <div
          style={{
            marginTop: 10,
            padding: 12,
            background: "rgba(255,0,0,0.18)",
            borderRadius: 12,
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      {/* LİNK OLUŞTUR BUTONU */}
      <button
        onClick={createLink}
        disabled={loading}
        style={{
          marginTop: 22,
          padding: "14px",
          width: "100%",
          borderRadius: 14,
          border: "none",
          background: "linear-gradient(135deg, #6e5af9, #d66efd)",
          color: "white",
          fontSize: 17,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 0 12px rgba(214,110,253,0.55)",
        }}
      >
        {loading ? "Oluşturuluyor..." : "Whisp linki oluştur"}
      </button>

      {/* OLUŞAN LİNK */}
      {generatedLink && (
        <div
          style={{
            marginTop: 30,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 18,
            padding: 18,
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 0 12px rgba(0,255,255,0.15)",
          }}
        >
          <div style={{ fontSize: 14, marginBottom: 10 }}>WhispMe linkin:</div>

          <div
            style={{
              fontSize: 15,
              wordBreak: "break-all",
              marginBottom: 16,
              fontWeight: 500,
            }}
          >
            {generatedLink}
          </div>

          <button
            onClick={() => navigator.clipboard.writeText(generatedLink)}
            style={{
              padding: 12,
              width: "100%",
              borderRadius: 12,
              background: "rgba(59,130,246,0.9)",
              border: "none",
              color: "white",
              marginBottom: 10,
            }}
          >
            Linki Kopyala
          </button>

          <button
            onClick={shareLink}
            style={{
              padding: 12,
              width: "100%",
              borderRadius: 12,
              background: "rgba(34,197,94,0.9)",
              border: "none",
              color: "white",
              marginBottom: 10,
            }}
          >
            Paylaş (DM / Story Metni)
          </button>

          <button
            onClick={() => navigate("/panel")}
            style={{
              padding: 12,
              width: "100%",
              borderRadius: 12,
              background: "rgba(255,255,255,0.25)",
              border: "none",
              color: "white",
            }}
          >
            Whisp Kutuma Git
          </button>
        </div>
      )}
    </div>
  );
}

export default Home;
