import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// LOGO EKLENDİ
import Logo from "../assets/whispme-logo.png";

function Home() {
  const [handle, setHandle] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("whispme_handle");
    if (saved) {
      const origin = window.location.origin;
      setHandle(saved);
      setGeneratedLink(`${origin}/m/${saved}`);
    }
  }, []);

  const createLink = async () => {
    setError("");

    const value = handle.trim().toLowerCase();
    if (!value) return setError("Lütfen bir kullanıcı adı gir.");

    const regex = /^[a-z0-9_.]{3,20}$/;
    if (!regex.test(value)) {
      return setError("3–20 karakter, harf ve rakam kullan.");
    }

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

      const origin = window.location.origin;
      setGeneratedLink(`${origin}/m/${value}`);
    } catch (err) {
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
        await navigator.share({
          title: "WhispMe",
          text,
          url: generatedLink,
        });
      } else {
        await navigator.clipboard.writeText(text);
        alert("Link panoya kopyalandı:\n" + text);
      }
    } catch (err) {}
  };

  const goPanel = () => navigate("/panel");

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
      {/* LOGO - Sol üst gibi görünmesi için */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
        <img
          src={Logo}
          alt="WhispMe Logo"
          style={{
            width: 160,
            userSelect: "none",
            marginBottom: 10,
            filter: "drop-shadow(0 0 8px #00ffff)",
          }}
        />
      </div>

      {/* Açıklama */}
      <div
        style={{
          marginTop: 10,
          textAlign: "center",
          fontSize: 16,
          opacity: 0.85,
          lineHeight: 1.4,
        }}
      >
        Arkadaşlarından <strong>anonim</strong> mesaj al.  
        WhispMe şimdi daha şık.
      </div>

      {/* Input */}
      <div style={{ marginTop: 40 }}>
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
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(0,0,0,0.25)",
            color: "white",
            outline: "none",
          }}
        />
      </div>

      {error && (
        <div
          style={{
            marginTop: 8,
            padding: 10,
            background: "rgba(255,0,0,0.15)",
            borderRadius: 10,
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      {/* Link oluştur butonu */}
      <button
        onClick={createLink}
        disabled={loading}
        style={{
          marginTop: 20,
          padding: "14px",
          width: "100%",
          borderRadius: 14,
          border: "none",
          background:
            "linear-gradient(135deg, #6a5af9, #d66efd)",
          color: "white",
          fontSize: 17,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {loading ? "Oluşturuluyor..." : "Whisp linki oluştur"}
      </button>

      {/* Sonuç sheet */}
      {generatedLink && (
        <div
          style={{
            marginTop: 30,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: "16px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div style={{ fontSize: 14, marginBottom: 8 }}>
            WhispMe linkin:
          </div>

          <div
            style={{
              fontSize: 15,
              wordBreak: "break-all",
              marginBottom: 14,
              fontWeight: 500,
            }}
          >
            {generatedLink}
          </div>

          <button
            onClick={() => navigator.clipboard.writeText(generatedLink)}
            style={{
              padding: "12px",
              width: "100%",
              borderRadius: 12,
              border: "none",
              background: "rgba(59,130,246,0.9)",
              color: "white",
              marginBottom: 10,
              fontSize: 15,
              fontWeight: 500,
            }}
          >
            Linki Kopyala
          </button>

          <button
            onClick={shareLink}
            style={{
              padding: "12px",
              width: "100%",
              borderRadius: 12,
              border: "none",
              background: "rgba(34,197,94,0.9)",
              color: "white",
              marginBottom: 10,
              fontSize: 15,
              fontWeight: 500,
            }}
          >
            Paylaş (DM / Story metni)
          </button>

          <button
            onClick={goPanel}
            style={{
              padding: "12px",
              width: "100%",
              borderRadius: 12,
              border: "none",
              background: "rgba(255,255,255,0.25)",
              color: "white",
              fontSize: 15,
              fontWeight: 500,
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
