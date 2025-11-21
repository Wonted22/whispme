// src/pages/LinkPage.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

// tarayıcıya anonim id kaydet
function getOrCreateAnonId() {
  if (typeof window === "undefined") return null;
  const key = "whispme_anon_id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;

  const id =
    "anon_" +
    Date.now().toString(36) +
    "_" +
    Math.random().toString(36).slice(2, 8);

  localStorage.setItem(key, id);
  return id;
}

function LinkPage() {
  const { handle } = useParams();
  const [status, setStatus] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [exists, setExists] = useState(true);

  useEffect(() => {
    const check = async () => {
      const ref = doc(db, "links", handle);
      const snap = await getDoc(ref);
      if (!snap.exists()) setExists(false);
    };
    check();
  }, [handle]);

  const send = async () => {
    if (!text.trim()) {
      setStatus("Lütfen bir Whisp yaz.");
      return;
    }
    if (text.length > 500) {
      setStatus("Maksimum 500 karakter.");
      return;
    }

    try {
      setLoading(true);

      const anonId = getOrCreateAnonId();

      await addDoc(collection(db, "messages"), {
        linkId: handle,
        text: text.trim(),
        createdAt: serverTimestamp(),
        type: "normal",
        senderAnonId: anonId ?? null, // ⭐ whisp atan kişi için anonim id
      });

      await updateDoc(doc(db, "links", handle), {
        totalMessages: increment(1),
      });

      setText("");
      setStatus("Whisp gönderildi 🎉");
    } catch (err) {
      console.error(err);
      setStatus("Gönderilirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (!exists) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0f0c29",
          color: "white",
          padding: "30px 20px",
        }}
      >
        <h2 style={{ marginBottom: 10 }}>Böyle bir WhispMe linki yok 😢</h2>
        <p>Bu kullanıcı artık mevcut olmayabilir.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #0f0c29, #302b63 60%, #24243e)",
        padding: "30px 20px 100px 20px",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h1 style={{ fontSize: 22, marginBottom: 6 }}>
        @{handle}'e anonim Whisp gönder
      </h1>

      <div style={{ opacity: 0.75, fontSize: 14, marginBottom: 20 }}>
        İsmin görünmez. Sadece @{handle} görecek.
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Söylemek istediğin bir şey var mı? 👀"
        maxLength={500}
        style={{
          flex: 1,
          resize: "none",
          background: "rgba(255,255,255,0.08)",
          color: "white",
          padding: "14px 16px",
          borderRadius: 16,
          fontSize: 16,
          lineHeight: 1.5,
          border: "1px solid rgba(255,255,255,0.1)",
          outline: "none",
        }}
      />

      <div
        style={{
          fontSize: 12,
          opacity: 0.6,
          textAlign: "right",
          marginTop: 6,
        }}
      >
        {500 - text.length} karakter kaldı
      </div>

      {status && (
        <div
          style={{
            marginTop: 10,
            padding: 12,
            fontSize: 14,
            background: "rgba(0,0,0,0.3)",
            borderRadius: 10,
            textAlign: "center",
          }}
        >
          {status}
        </div>
      )}

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: 16,
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(10px)",
        }}
      >
        <button
          onClick={send}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            background: "linear-gradient(135deg, #6a5af9, #d66efd)",
            color: "white",
            border: "none",
            borderRadius: 14,
            fontSize: 17,
            fontWeight: 600,
          }}
        >
          {loading ? "Gönderiliyor..." : "Whisp Gönder"}
        </button>
      </div>
    </div>
  );
}

export default LinkPage;
