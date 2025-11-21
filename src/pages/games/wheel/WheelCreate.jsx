// src/pages/games/wheel/WheelCreate.jsx
import { useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebase";

function getOrCreateWhisperId() {
  const key = "whispme_whisper_id";
  if (typeof window === "undefined") return "whisper_guest";

  const saved = localStorage.getItem(key);
  if (saved) return saved;

  const newId =
    "whisper_" +
    Math.random().toString(36).slice(2, 6) +
    Date.now().toString(36).slice(-3);

  localStorage.setItem(key, newId);
  return newId;
}

export default function WheelCreate() {
  const nav = useNavigate();
  const whisperId = getOrCreateWhisperId();

  const createRoom = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const roomName = form.get("roomName") || "Oda";

    const ref = await addDoc(collection(db, "rooms"), {
      roomName,
      hostWhisperId: whisperId,
      players: [whisperId],
      maxPlayers: 5,
      currentTask: null,
      selectedWhisperId: null,
      status: "waiting",
      createdAt: serverTimestamp(),
    });

    nav(`/games/wheel/room/${ref.id}`);
  };

  return (
    <div>
      <h1 style={{ fontSize: 26, marginBottom: 12 }}>🎡 Oda Oluştr</h1>

      <form onSubmit={createRoom}>
        <input
          type="text"
          name="roomName"
          placeholder="Oda adı (örn: MichaelRoom)"
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 14,
            fontSize: 14,
            marginBottom: 12,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(15,23,42,0.9)",
            color: "white",
          }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 14,
            fontSize: 16,
            border: "none",
            fontWeight: 600,
            background: "linear-gradient(135deg,#4f46e5,#ec4899)",
            color: "white",
          }}
        >
          Odayı Başlat
        </button>
      </form>
    </div>
  );
}
