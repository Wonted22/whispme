// src/pages/admin/AdminPanel.jsx
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";

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

export default function AdminPanel() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const anonId = getOrCreateAnonId();

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "rooms"),
          where("hostAnonId", "==", anonId)
        );
        const snap = await getDocs(q);
        const docs = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setRooms(docs);
      } catch (err) {
        console.error("Oda listesi alınırken hata:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [anonId]);

  const handleDelete = async (roomId) => {
    if (!window.confirm("Bu odayı silmek istediğine emin misin?")) return;
    try {
      await deleteDoc(doc(db, "rooms", roomId));
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
    } catch (err) {
      console.error("Oda silinirken hata:", err);
      alert("Oda silinirken bir hata oluştu.");
    }
  };

  return (
    <div style={{ padding: 20, color: "white", minHeight: "100vh", background: "#0f0c29" }}>
      <h2 style={{ fontSize: 24, marginBottom: 16 }}>Admin Paneli</h2>
      {loading ? (
        <p>Yükleniyor...</p>
      ) : rooms.length === 0 ? (
        <p>Hiç oda oluşturulmamış.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {rooms.map((r) => (
            <div key={r.id} style={{
              padding: 12,
              borderRadius: 12,
              background: "rgba(15,23,42,0.9)",
              border: "1px solid rgba(148,163,184,0.5)"
            }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                {r.roomName} (ID: {r.id})
              </div>
              <div style={{ fontSize: 13, opacity: 0.8, margin: "4px 0" }}>
                Oyuncular: {r.players?.length || 0} / {r.maxPlayers || "-"}
              </div>
              <div style={{ fontSize: 13, opacity: 0.8, margin: "4px 0" }}>
                Cevaplar toplam: {r.answers?.length || 0}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button
                  onClick={() => window.open(`/games/wheel/room/${r.id}`, "_blank")}
                  style={{
                    padding: "6px 10px",
                    fontSize: 12,
                    background: "linear-gradient(135deg,#6366f1,#ec4899)",
                    border: "none",
                    borderRadius: 8,
                    color: "white",
                    cursor: "pointer"
                  }}
                >
                  Odayı Aç
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  style={{
                    padding: "6px 10px",
                    fontSize: 12,
                    background: "rgba(220,60,60,0.9)",
                    border: "none",
                    borderRadius: 8,
                    color: "white",
                    cursor: "pointer"
                  }}
                >
                  Odayı Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
