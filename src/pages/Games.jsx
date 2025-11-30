// src/pages/Games.jsx
import { Link } from "react-router-dom";

export default function Games() {
  return (
    <div
      style={{
        minHeight: "100vh",
        color: "white",
        padding: "20px 16px",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 26, margin: 0, fontWeight: 700 }}>🎮 Oyunlar</h1>
        <p style={{ opacity: 0.75, fontSize: 14, marginTop: 6 }}>
          Bütün oyunlar eyni Whisp sistemi ilə işləyir:
          <br />
          <span style={{ opacity: 0.9 }}>
            Story’ndə linki paylaş → səni tanıyanlar anonim girib cavab verir →
            ilk sual həmişə <strong>“Bu şəxsi tanıyırsan?”</strong>.
          </span>
          <br />
          <span style={{ opacity: 0.8 }}>
            Yalnız “Bəli, tanıyıram” deyənlərin cavabları nəticəyə daxil olur.
            Tanımayanların cavabları fun kimi qalır, nəticəni pozmur. 💡
          </span>
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* ✅ NEON ÇARK – HOST HAQQINDA DÜRÜST CAVABLAR */}
        <Link
          to="/games/wheel"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              background:
                "linear-gradient(135deg, rgba(56,189,248,0.15), rgba(168,85,247,0.25))",
              border: "1px solid rgba(129,140,248,0.6)",
              boxShadow: "0 14px 32px rgba(0,0,0,0.55)",
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
                <h2
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 600,
                  }}
                >
                  Neon Çark
                </h2>
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
                2–5 nəfər
              </span>
            </div>

            <p
              style={{
                fontSize: 13,
                opacity: 0.9,
                marginBottom: 8,
                lineHeight: 1.45,
              }}
            >
              Çarkda səni tanıyanların anonim profilləri fırlanır. Hər girənə
              əvvəlcə <strong>“Bu şəxsi tanıyırsan?”</strong> deyə soruşulur.
              <br />
              <br />
              <span style={{ opacity: 0.85 }}>
                “Bəli” deyənlərin cavabları çarka düşür və çark kimə gəlirsə,
                o sənə aid sualı dürüst cavablayır. Yəni çarkda yalnız səni
                həqiqətən tanıyanların fikirləri var. 👀
              </span>
            </p>

            <div style={{ fontSize: 12, opacity: 0.8 }}>
              ➜ Otaq aç, linki story-də paylaş, səni tanıyanlar girsin. Çıxan
              cavablar həm content, həm də real feedback kimi MANYAK olur. 🔥
            </div>
          </div>
        </Link>

        {/* ✅ LOVE METER – SƏNİ NECƏ GÖRÜRLƏR? */}
        <Link
          to="/games/love-meter"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              background:
                "linear-gradient(135deg, rgba(244,63,94,0.18), rgba(251,191,36,0.25))",
              border: "1px solid rgba(239,68,68,0.6)",
              boxShadow: "0 14px 32px rgba(0,0,0,0.55)",
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
                <span style={{ fontSize: 24 }}>❤️</span>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 600,
                  }}
                >
                  Love Meter
                </h2>
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
                Story oyunu 🚀
              </span>
            </div>

            <p
              style={{
                fontSize: 13,
                opacity: 0.9,
                marginBottom: 8,
                lineHeight: 1.45,
              }}
            >
              Story-də Love Meter linkini paylaşırsan. Girən hər kəsə əvvəl
              <strong> “Bu şəxsi tanıyırsan?”</strong> sualı gəlir.
              <br />
              <br />
              <span style={{ opacity: 0.85 }}>
                Yalnız səni tanıyanların verdiyi ❤️ səs-lərdən
                <strong> “Real Love Score”</strong> hesablanır. Tanımayanların
                səsi nəticəni pozmur, ayrı “fun layer” kimi qalır.
              </span>
            </p>

            <div style={{ fontSize: 12, opacity: 0.8 }}>
              ➜ Ekranda “People who know you: 68% ❤️” çıxır. İstəsən story-də
              paylaşa, Premium ilə detallarını aça bilirsən.
            </div>
          </div>
        </Link>

        {/* gələcəkdə başqa oyunlar (Truth Meter, Personality Tags və s.) bura eyni sistemlə əlavə oluna bilər */}
      </div>
    </div>
  );
}
