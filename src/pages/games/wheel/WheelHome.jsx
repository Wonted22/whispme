import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { db } from "../../../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

// LinkPage ile aynı anahtar: cihazdaki anonim kimlik
function getOrCreateAnonId() {
  if (typeof window === "undefined") return "anon_guest";
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

function getHandle() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("whispme_handle") || null;
}

export default function Wheel() {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const anonId = getOrCreateAnonId();
  const hostHandle = getHandle(); // panelde kullandığın handle

  const createRoom = async () => {
    if (!roomName.trim()) {
      setStatus("Lütfen bir oda adı yaz.");
      return;
    }

    try {
      setLoading(true);
      setStatus("");

      const ref = await addDoc(collection(db, "rooms"), {
        roomName: roomName.trim(),
        game: "wheel",
        createdAt: serverTimestamp(),

        // ⭐ ODA SAHİBİ
        hostAnonId: anonId,
        hostHandle: hostHandle ?? null,

        players: [anonId], // host zaten odada
        maxPlayers: 5,

        currentTask: null,
        selectedAnonId: null,
        status: "waiting",
        answers: [],
      });

      navigate(`/games/wheel/room/${ref.id}`);
    } catch (err) {
      console.error(err);
      setStatus("Oda oluşturulurken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", color: "white" }}>
      <h2 style={{ fontSize: 24, marginBottom: 10 }}>🎡 Neon Çark Odası</h2>

      <p
        style={{
          opacity: 0.8,
          fontSize: 14,
          marginBottom: 16,
        }}
      >
        En fazla 5 kişilik bir oda oluştur. Oda linkini story / DM / TikTok
        bio'ya at. Odaya giren herkes çarkta döner, çark kime gelirse{" "}
        <strong>senin hakkında</strong> dürüstçe cevap vermek zorunda. 😈
      </p>

      <label style={{ fontSize: 13, opacity: 0.8 }}>Oda adı</label>
      <input
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        placeholder="Ör: michael-friends"
        style={{
          width: "100%",
          marginTop: 6,
          marginBottom: 16,
          padding: 10,
          borderRadius: 12,
          border: "1px solid rgba(148,163,184,0.6)",
          background: "rgba(15,23,42,0.9)",
          color: "white",
          fontSize: 14,
        }}
      />

      <button
        onClick={createRoom}
        disabled={loading}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 14,
          border: "none",
          background: "linear-gradient(135deg, #6a5af9, #d66efd)",
          color: "white",
          fontSize: 16,
          fontWeight: 600,
          boxShadow: "0 12px 30px rgba(0,0,0,0.6)",
        }}
      >
        {loading ? "Oluşturuluyor..." : "Odayı Oluştur"}
      </button>

      {status && (
        <div
          style={{
            marginTop: 14,
            padding: 10,
            borderRadius: 12,
            background: "rgba(15,23,42,0.9)",
            border: "1px solid rgba(148,163,184,0.5)",
            fontSize: 13,
          }}
        >
          {status}
        </div>
      )}
    </div>
  );
}
 