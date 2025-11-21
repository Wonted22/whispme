// src/pages/games/Games.jsx
import { Link } from "react-router-dom";

export default function Games() {
  return (
    <div style={{ minHeight: "100vh", color: "white" }}>
      <h1 style={{ fontSize: 26, marginBottom: 12 }}>🎮 Oyunlar</h1>
      <p style={{ opacity: 0.8, fontSize: 14, marginBottom: 18 }}>
        Whisp atan kişilerle veya arkadaşlarınla oynayabileceğin mini oyunlar.
        Odanı aç, linki paylaş, geri kalan kaosu çark halletsin. 😈
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* Neon Çark Oyunu Kartı */}
        <Link
          to="/games/wheel"
          style={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              background:
                "linear-gradient(135deg, rgba(56,189,248,0.15), rgba(168,85,247,0.25))",
              border: "1px solid rgba(129,140,248,0.6)",
              boxShadow: "0 18px 45px rgba(0,0,0,0.65)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 24 }}>🎡</span>
                <h2 style={{ margin: 0, fontSize: 18 }}>Neon Çark</h2>
              </div>
              <span
                style={{
                  fontSize: 11,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "rgba(15,23,42,0.9)",
                  border: "1px solid rgba(148,163,184,0.6)",
                }}
              >
                2–5 kişi
              </span>
            </div>

            <p style={{ fontSize: 13, opacity: 0.9, marginBottom: 10 }}>
              Çark etrafında whisper profilleri dönüyor. Çark kime gelirse
              o kişi <strong>HOST hakkında</strong> dürüstçe cevap vermek zorunda.
              “Gerçek düşünceler” oyunu gibi düşün. 👀
            </p>

            <div style={{ fontSize: 12, opacity: 0.75 }}>
              ➜ “Oda Oluştur” deyip linki story’ne / DM’e at, seni tanıyanlar
              oyuna girsin. Çıkan cevaplar içerik olarak da manyak olur.
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
