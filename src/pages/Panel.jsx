// src/pages/Panel.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import html2canvas from "html2canvas";

function Panel() {
  const [handle, setHandle] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cardText, setCardText] = useState("");
  const [showCardModal, setShowCardModal] = useState(false);

  // ---------------------------
  //  PROFİL LINK & PAYLAŞIM
  // ---------------------------

  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const profileLink = handle ? `${origin}/m/${handle}` : "";

  const shareProfileLink = async () => {
    if (!profileLink) return;
    const text = `Bana anonim Whisp göndermek için tıkla: ${profileLink}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "WhispMe",
          text,
          url: profileLink,
        });
      } else {
        await navigator.clipboard.writeText(text);
        alert("Paylaşım metni ve link panoya kopyalandı:\n\n" + text);
      }
    } catch (err) {
      console.error("Profil paylaşım hatası:", err);
    }
  };

  // ---------------------------
  //  KART PAYLAŞIMI (FOTO + LİNKLİ METİN)
  // ---------------------------

  const shareCard = async () => {
    const el = document.getElementById("previewCard");
    if (!el || !handle) return;

    const shareUrl = `${origin}/m/${handle}`;
    const shareText = `Bana anonim Whisp göndermek için tıkla: ${shareUrl}`;

    try {
      // Kartı canvas'a çevir
      const canvas = await html2canvas(el);
      const imgURL = canvas.toDataURL("image/png");
      const res = await fetch(imgURL);
      const blob = await res.blob();
      const file = new File([blob], "whispme-card.png", {
        type: "image/png",
      });

      // Dosya + metin + url destekleniyorsa tam deneyim
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: "WhispMe",
          text: shareText, // açıklama metninde link
          url: shareUrl, // ayrıca url alanında da link
          files: [file], // görsel kart
        });
        return;
      }

      // Sadece metin + url paylaşımı destekleniyorsa
      if (navigator.share) {
        await navigator.share({
          title: "WhispMe",
          text: shareText,
          url: shareUrl,
        });
        return;
      }

      // Son çare: linkli metni panoya kopyala
      await navigator.clipboard.writeText(shareText);
      alert(
        "Tarayıcın dosya paylaşımını desteklemiyor. Metin ve link panoya kopyalandı:\n\n" +
          shareText
      );
    } catch (err) {
      console.error("Kart paylaşım hatası:", err);
      alert("Paylaşım sırasında bir hata oluştu.");
    }
  };

  // ---------------------------
  //  MESAJ SİLME
  // ---------------------------

  const handleDelete = async (id) => {
    const ok = window.confirm("Bu Whisp'i silmek istediğine emin misin?");
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "messages", id));
      // onSnapshot otomatik olarak listeyi güncelliyor
    } catch (err) {
      console.error("Silme hatası:", err);
      alert("Whisp silinirken bir hata oluştu.");
    }
  };

  // ---------------------------
  //  REALTIME MESAJ AKIŞI
  // ---------------------------

  useEffect(() => {
    const savedHandle = localStorage.getItem("whispme_handle");
    if (!savedHandle) {
      setLoading(false);
      return;
    }

    setHandle(savedHandle);

    const q = query(
      collection(db, "messages"),
      where("linkId", "==", savedHandle),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setMessages(list);
        setLoading(false);
      },
      (error) => {
        console.error("Mesajları dinlerken hata:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ---------------------------
  //  ANALYTICS HESAPLAMA
  // ---------------------------

  const totalWhisps = messages.length;

  let todayWhisps = 0;
  let lastWhispTime = "";

  if (messages.length > 0) {
    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = now.getMonth();
    const todayDate = now.getDate();

    messages.forEach((m) => {
      if (m.createdAt && m.createdAt.toDate) {
        const d = m.createdAt.toDate();
        if (
          d.getFullYear() === todayYear &&
          d.getMonth() === todayMonth &&
          d.getDate() === todayDate
        ) {
          todayWhisps += 1;
        }
      }
    });

    const first = messages[0];
    if (first.createdAt && first.createdAt.toDate) {
      lastWhispTime = first.createdAt.toDate().toLocaleString();
    }
  }

  // ---------------------------
  //  HANDLE YOKSA
  // ---------------------------

  if (!handle) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
          padding: "30px 18px",
          color: "white",
        }}
      >
        <h2 style={{ marginBottom: 8 }}>Whisp Kutun</h2>
        <p style={{ opacity: 0.8, marginBottom: 16 }}>
          Önce bir WhispMe linki oluşturman gerekiyor.
        </p>
        <Link
          to="/"
          style={{ color: "#60a5fa", textDecoration: "none", fontWeight: 500 }}
        >
          Ana sayfaya dön
        </Link>
      </div>
    );
  }

  // ---------------------------
  //  RENDER
  // ---------------------------

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #0f0c29 0%, #302b63 55%, #111827 100%)",
        padding: "18px 14px 90px 14px",
        color: "white",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
      }}
    >
      {/* ÜST BAŞLIK */}
      <div
        style={{
          marginBottom: 14,
          padding: "10px 12px",
          borderRadius: 16,
          background:
            "linear-gradient(135deg, rgba(129,140,248,0.3), rgba(236,72,153,0.25))",
          border: "1px solid rgba(129,140,248,0.6)",
          boxShadow: "0 18px 45px rgba(0,0,0,0.55)",
        }}
      >
        <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 4 }}>
          Whisp Kutun
        </div>
        <h2 style={{ margin: 0, fontSize: 22 }}>
          @{handle} – Gelen Whisp'ler
        </h2>
        <div
          style={{
            fontSize: 12,
            opacity: 0.8,
            marginTop: 6,
            lineHeight: 1.4,
          }}
        >
          WhispMe linkini story’de, DM’de veya biyonda paylaş. Yeni Whisp’ler
          anlık olarak burada görünecek.
        </div>
      </div>

      {/* PROFİL LINKİ VİRAL BAR */}
      <div
        style={{
          marginBottom: 16,
          padding: "10px 12px",
          borderRadius: 16,
          background: "rgba(15,23,42,0.96)",
          border: "1px solid rgba(148,163,184,0.5)",
          fontSize: 12,
          boxShadow: "0 12px 30px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ marginBottom: 4, opacity: 0.8 }}>
          WhispMe linkin (bio / DM / tweet için):
        </div>
        <div
          style={{
            wordBreak: "break-all",
            fontSize: 13,
            marginBottom: 8,
            fontWeight: 500,
          }}
        >
          {profileLink}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => navigator.clipboard.writeText(profileLink)}
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: 999,
              border: "none",
              background: "rgba(59,130,246,0.9)",
              color: "white",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Linki Kopyala
          </button>
          <button
            onClick={shareProfileLink}
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: 999,
              border: "none",
              background: "rgba(34,197,94,0.9)",
              color: "white",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Paylaş (DM / tweet)
          </button>
        </div>
      </div>

      {/* ANALYTICS */}
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 120,
            padding: "8px 10px",
            borderRadius: 14,
            background: "rgba(15,23,42,0.96)",
            border: "1px solid rgba(148,163,184,0.45)",
          }}
        >
          <div style={{ fontSize: 11, opacity: 0.7 }}>Toplam Whisp</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{totalWhisps}</div>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 120,
            padding: "8px 10px",
            borderRadius: 14,
            background: "rgba(15,23,42,0.96)",
            border: "1px solid rgba(52,211,153,0.5)",
          }}
        >
          <div style={{ fontSize: 11, opacity: 0.7 }}>Bugünkü Whisp</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{todayWhisps}</div>
        </div>

        {lastWhispTime && (
          <div
            style={{
              flexBasis: "100%",
              padding: "8px 10px",
              borderRadius: 14,
              background: "rgba(15,23,42,0.96)",
              border: "1px solid rgba(96,165,250,0.6)",
              fontSize: 12,
            }}
          >
            <strong>Son Whisp:</strong> {lastWhispTime}
          </div>
        )}
      </div>

      {/* YÜKLENİYOR */}
      {loading && <p>Yükleniyor...</p>}

      {/* HENÜZ MESAJ YOK */}
      {!loading && messages.length === 0 && (
        <p style={{ opacity: 0.75, fontSize: 13 }}>
          Henüz Whisp yok. Linkini story / DM'de paylaşmayı dene.
        </p>
      )}

      {/* MESAJ LİSTESİ */}
      <div
        style={{
          marginTop: 4,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              background:
                "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.98))",
              padding: "12px 12px 10px 12px",
              borderRadius: 14,
              border: "1px solid rgba(148,163,184,0.35)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.55)",
            }}
          >
            <div
              style={{
                marginBottom: 8,
                fontSize: 15,
                lineHeight: 1.5,
                whiteSpace: "pre-wrap",
              }}
            >
              {msg.text}
            </div>

            <div
              style={{
                fontSize: 11,
                opacity: 0.6,
                marginBottom: 8,
              }}
            >
              {msg.createdAt && msg.createdAt.toDate
                ? msg.createdAt.toDate().toLocaleString()
                : ""}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => {
                  setCardText(msg.text);
                  setShowCardModal(true);
                }}
                style={{
                  flex: 1,
                  padding: "6px 10px",
                  fontSize: 12,
                  borderRadius: 999,
                  border: "none",
                  background:
                    "linear-gradient(135deg, rgba(129,140,248,1), rgba(236,72,153,1))",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Whisp Kartı
              </button>

              <button
                onClick={() => handleDelete(msg.id)}
                style={{
                  padding: "6px 10px",
                  fontSize: 12,
                  borderRadius: 999,
                  border: "none",
                  background: "rgba(239,68,68,0.92)",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FLOATING ACTION BUTTON – PROFİL LINK PAYLAŞ */}
      <button
        onClick={shareProfileLink}
        style={{
          position: "fixed",
          bottom: 24,
          right: 18,
          width: 56,
          height: 56,
          borderRadius: "50%",
          border: "none",
          background:
            "conic-gradient(from 160deg, #4f46e5, #ec4899, #22d3ee, #4f46e5)",
          color: "white",
          fontSize: 26,
          fontWeight: 600,
          boxShadow: "0 12px 30px rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 20,
        }}
        aria-label="WhispMe linkini paylaş"
      >
        ↻
      </button>

      {/* KART MODALI */}
      {showCardModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.78)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              background: "rgba(15,23,42,0.98)",
              padding: 18,
              borderRadius: 18,
              width: "92%",
              maxWidth: 420,
              textAlign: "center",
              border: "1px solid rgba(148,163,184,0.6)",
              boxShadow: "0 24px 70px rgba(0,0,0,0.9)",
            }}
          >
            <h3 style={{ marginBottom: 12, fontSize: 18 }}>Whisp Kartı</h3>

            {/* Kartın kendisi */}
            <div
              id="previewCard"
              style={{
                width: 300,
                height: 500,
                margin: "0 auto 18px auto",
                borderRadius: 24,
                padding: 20,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                background:
                  "linear-gradient(145deg, #4f46e5, #ec4899, #22d3ee)",
                color: "white",
                fontFamily:
                  "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                textAlign: "center",
                boxShadow: "0 20px 60px rgba(0,0,0,0.85)",
              }}
            >
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  marginBottom: 20,
                  lineHeight: 1.35,
                  whiteSpace: "pre-wrap",
                }}
              >
                {cardText}
              </div>

              {/* Kart içi buton (görselde sadece yazı olacak) */}
              <a
                href={profileLink}
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  padding: "8px 16px",
                  borderRadius: 999,
                  marginTop: 12,
                  background: "rgba(15,23,42,0.9)",
                  color: "white",
                  textDecoration: "none",
                  border: "1px solid rgba(248,250,252,0.7)",
                }}
              >
                Bana Whisp gönder!
              </a>

              <div
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  opacity: 0.9,
                  wordBreak: "break-all",
                }}
              >
                {profileLink}
              </div>
            </div>

            <button
              onClick={shareCard}
              style={{
                padding: "10px 16px",
                margin: "4px",
                border: "none",
                borderRadius: 999,
                background:
                  "linear-gradient(135deg, rgba(34,197,94,1), rgba(16,185,129,1))",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Paylaş (Foto + Linkli Metin)
            </button>

            <button
              onClick={() => setShowCardModal(false)}
              style={{
                padding: "8px 14px",
                margin: "4px",
                border: "none",
                borderRadius: 999,
                background: "rgba(148,163,184,0.4)",
                color: "white",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Panel;
