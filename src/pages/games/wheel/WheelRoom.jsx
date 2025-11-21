// src/pages/games/wheel/WheelRoom.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../firebase";

// HOST hakkındaki soru şablonları
const TASK_TEMPLATES = [
  "{host} hakkında en doğru düşündüğün şeyi yaz.",
  "{host}'u 3 kelimeyle tarif et.",
  "{host} ile ilgili kimsenin bilmediği bir şeyi yaz.",
  "{host} ile yaşadığın en komik olayı anlat.",
  "{host}'u 1–10 arası puanla ve sebebini yaz.",
  "{host} hakkında gizlediğin bir fikri açıkla.",
  "{host} ile ilgili ilk izlenimini yaz.",
  "{host}'un en güçlü ve zayıf yönünü yaz.",
  "{host} sence gerçekten nasıl biri? Samimi ol.",
  "{host} seni nasıl görüyor sence? Tahmin et.",
];

// Aynı key: whispme_anon_id
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

function getRoomUrl(roomId) {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/games/wheel/room/${roomId}`;
}

function shortTag(id) {
  if (!id) return "";
  return "@" + id.slice(-4);
}

export default function WheelRoom() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isSpinning, setIsSpinning] = useState(false);
  const [localTask, setLocalTask] = useState("");
  const [answer, setAnswer] = useState("");
  const [sendingAnswer, setSendingAnswer] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSenders, setInviteSenders] = useState([]);

  const anonId = getOrCreateAnonId();

  // Odayı dinle
  useEffect(() => {
    const ref = doc(db, "rooms", roomId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setRoom(data);

          // Soru değiştiyse animasyon başlat
          if (data.currentTask && data.currentTask !== localTask) {
            setLocalTask(data.currentTask);
            setIsSpinning(true);
            setTimeout(() => setIsSpinning(false), 1800);
            setHasAnswered(false);
            setAnswer("");
          }
        } else {
          setRoom(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Oda dinlenirken hata:", err);
        setLoading(false);
      }
    );

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  if (loading) {
    return <p style={{ color: "white" }}>Yükleniyor...</p>;
  }

  if (!room) {
    return (
      <div style={{ color: "white" }}>
        <h2>Oda Bulunamadı 😢</h2>
        <p>Oda silinmiş veya hiç oluşturulmamış olabilir.</p>
      </div>
    );
  }

  const players = room.players || [];
  const maxPlayers = room.maxPlayers || 5;

  const hostAnonId = room.hostAnonId;
  const hostHandle = room.hostHandle || null;

  const isHost = hostAnonId === anonId;
  const isInRoom = isHost || players.includes(anonId);

  const selectedAnonId = room.selectedAnonId || null;
  const canAnswer = selectedAnonId === anonId && !!room.currentTask;

  // Odaya katıl (host zaten içeride)
  const joinRoom = async () => {
    if (!room) return;
    if (isInRoom) return;
    if (players.length >= maxPlayers) {
      alert("Oda dolu (5/5).");
      return;
    }
    const ref = doc(db, "rooms", roomId);
    await updateDoc(ref, {
      players: arrayUnion(anonId),
    });
  };

  // Çarkı çevir
  const spinWheel = async () => {
    if (!isHost) {
      alert("Çarkı sadece oda sahibi çevirebilir.");
      return;
    }
    if (players.length === 0) {
      alert("Henüz oyuncu yok. Önce odayı paylaş.");
      return;
    }

    const hostTag =
      hostHandle && hostHandle.length <= 20
        ? "@" + hostHandle
        : hostAnonId === anonId
        ? "seni"
        : shortTag(hostAnonId);

    const template =
      TASK_TEMPLATES[
        Math.floor(Math.random() * TASK_TEMPLATES.length)
      ];

    const question = template.split("{host}").join(hostTag);

    const randomPlayer =
      players[Math.floor(Math.random() * players.length)];

    const ref = doc(db, "rooms", roomId);
    await updateDoc(ref, {
      currentTask: question,
      selectedAnonId: randomPlayer,
      status: "question",
      questionStartedAt: serverTimestamp(),
    });
  };

  // Cevap gönder
  const sendAnswer = async () => {
    const text = answer.trim();
    if (!text || !canAnswer) return;

    try {
      setSendingAnswer(true);
      const ref = doc(db, "rooms", roomId);
      await updateDoc(ref, {
        answers: arrayUnion({
          anonId,
          text,
          task: room.currentTask,
          createdAt: serverTimestamp(),
        }),
      });
      setHasAnswered(true);
    } catch (err) {
      console.error("Cevap gönderilirken hata:", err);
      alert("Cevap gönderilirken bir hata oluştu.");
    } finally {
      setSendingAnswer(false);
    }
  };

  // Odayı paylaş
  const shareRoom = async () => {
    const url = getRoomUrl(roomId);
    const text = `Neon Çark oyunuma katılmak için tıkla: ${url}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "WhispMe Neon Çark",
          text,
          url,
        });
      } else {
        await navigator.clipboard.writeText(text);
        alert(
          "Oda linki panoya kopyalandı. Story / DM'de paylaşabilirsin.\n\n" +
            text
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Whispleştiğin kişileri çek (messages koleksiyonundan)
  const openInviteModal = async () => {
    if (!hostHandle) {
      alert(
        "Bu odada host handle kaydedilmemiş. Panelden tekrar deneyebilirsin."
      );
      return;
    }

    try {
      setInviteLoading(true);

      const q = query(
        collection(db, "messages"),
        where("linkId", "==", hostHandle)
      );
      const snap = await getDocs(q);

      const uniq = new Set();
      snap.forEach((d) => {
        const data = d.data();
        if (data.senderAnonId) {
          uniq.add(data.senderAnonId);
        }
      });

      setInviteSenders(Array.from(uniq));
      setInviteOpen(true);
    } catch (err) {
      console.error("Whispleşen kişiler alınırken hata:", err);
      alert("Whispleştiğin kişiler getirilirken hata oluştu.");
    } finally {
      setInviteLoading(false);
    }
  };

  const copyInviteFor = async (senderId) => {
    const url = getRoomUrl(roomId);
    const text = `Neon Çark oyunu: Odaya katıl (${shortTag(
      senderId
    )} için). Link: ${url}`;

    try {
      await navigator.clipboard.writeText(text);
      alert("Davet metni panoya kopyalandı. İstediğin yerden gönderebilirsin.");
    } catch (err) {
      console.error(err);
    }
  };

  // Oyuncuları çark etrafına diz
  const renderPlayerTagsAroundWheel = () => {
    if (!players.length) return null;

    const radius = 130;
    const center = 120;

    return players.map((id, index) => {
      const angle =
        (2 * Math.PI * index) / players.length - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      const isSelected = id === selectedAnonId;

      return (
        <div
          key={id}
          style={{
            position: "absolute",
            left: x,
            top: y,
            transform: "translate(-50%, -50%)",
            padding: "4px 10px",
            borderRadius: 999,
            fontSize: 11,
            background: isSelected
              ? "rgba(250,204,21,0.95)"
              : "rgba(15,23,42,0.95)",
            color: "white",
            border: isSelected
              ? "1px solid rgba(248,250,252,0.9)"
              : "1px solid rgba(148,163,184,0.5)",
            boxShadow: isSelected
              ? "0 0 16px rgba(250,204,21,0.9)"
              : "0 10px 26px rgba(0,0,0,0.7)",
            whiteSpace: "nowrap",
          }}
        >
          {id === anonId ? "Sen" : shortTag(id)}
          {id === hostAnonId ? " • Host" : ""}
        </div>
      );
    });
  };

  return (
    <div style={{ minHeight: "100vh", color: "white" }}>
      {/* ÜST BAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 24,
              marginBottom: 4,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 26 }}>🎡</span> Neon Çark Odası
          </h1>
          {room.roomName && (
            <div
              style={{
                fontSize: 13,
                opacity: 0.85,
                marginBottom: 2,
              }}
            >
              Oda: <strong>{room.roomName}</strong>
            </div>
          )}
          <div style={{ fontSize: 11, opacity: 0.7 }}>
            Oda ID: <code>{roomId}</code>
          </div>
          {isHost && (
            <div
              style={{
                fontSize: 11,
                opacity: 0.85,
                marginTop: 4,
              }}
            >
              Sen <strong>HOST</strong>sun. Çarkı sadece sen çevirebilirsin.
              Sorular senin hakkında. 😊
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {isHost && (
            <button
              onClick={openInviteModal}
              disabled={inviteLoading}
              style={{
                border: "none",
                borderRadius: 999,
                padding: "6px 12px",
                background:
                  "linear-gradient(135deg, rgba(52,211,153,0.3), rgba(34,197,94,0.9))",
                color: "white",
                fontSize: 11,
                boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
              }}
            >
              {inviteLoading
                ? "Yükleniyor..."
                : "Whispleştiğin Kişileri Davet Et"}
            </button>
          )}

          <button
            onClick={shareRoom}
            style={{
              border: "none",
              borderRadius: 999,
              padding: "6px 12px",
              background:
                "linear-gradient(135deg, rgba(56,189,248,0.4), rgba(192,132,252,0.9))",
              color: "white",
              fontSize: 11,
              boxShadow: "0 10px 25px rgba(0,0,0,0.6)",
            }}
          >
            Odayı Paylaş
          </button>
        </div>
      </div>

      {/* OYUNCULAR */}
      <div
        style={{
          marginBottom: 16,
          padding: 10,
          borderRadius: 14,
          background: "rgba(15,23,42,0.96)",
          border: "1px solid rgba(148,163,184,0.6)",
        }}
      >
        <div
          style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}
        >
          Oyuncular ({players.length}/{maxPlayers})
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {players.length === 0 && (
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              Henüz kimse katılmadı.
            </div>
          )}
          {players.map((id) => (
            <div
              key={id}
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                background:
                  id === anonId
                    ? "rgba(56,189,248,0.9)"
                    : "rgba(148,163,184,0.5)",
                fontSize: 12,
              }}
            >
              {id === anonId ? "Sen" : shortTag(id)}
              {id === hostAnonId ? " • Host" : ""}
            </div>
          ))}
        </div>
      </div>

      {/* ÇARK + PROFİLLER */}
      <div
        style={{
          marginTop: 10,
          marginBottom: 22,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 240,
            height: 240,
            position: "relative",
          }}
        >
          {renderPlayerTagsAroundWheel()}

          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background:
                "conic-gradient(from 180deg,#4f46e5,#ec4899,#22c55e,#f97316,#4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 24px 60px rgba(0,0,0,0.85)",
              transform: isSpinning ? "rotate(720deg)" : "rotate(0deg)",
              transition:
                "transform 1.8s cubic-bezier(0.22,0.61,0.36,1)",
            }}
          >
            {/* Üst ok */}
            <div
              style={{
                position: "absolute",
                top: -18,
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "12px solid transparent",
                borderRight: "12px solid transparent",
                borderBottom: "20px solid #facc15",
                filter: "drop-shadow(0 0 10px #facc15)",
              }}
            />
            {/* İç daire */}
            <div
              style={{
                width: 170,
                height: 170,
                borderRadius: "50%",
                background: "#020617",
                border: "2px solid rgba(248,250,252,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: 16,
                fontSize: 15,
                lineHeight: 1.4,
              }}
            >
              {room.currentTask
                ? "Soru hazır! Aşağıda görebilirsin."
                : "Çarkı çevir, bir oyuncu seçilsin ve herkes senin hakkında dürüst olsun."}
            </div>
          </div>
        </div>

        <button
          onClick={spinWheel}
          disabled={!isHost || players.length === 0}
          style={{
            padding: "10px 18px",
            borderRadius: 999,
            border: "none",
            background:
              isHost && players.length > 0
                ? "linear-gradient(135deg,#6366f1,#ec4899)"
                : "rgba(75,85,99,0.6)",
            color: "white",
            fontSize: 15,
            fontWeight: 600,
            boxShadow: "0 16px 40px rgba(0,0,0,0.8)",
            opacity: isHost && players.length > 0 ? 1 : 0.6,
          }}
        >
          🎡 Çarkı Çevir
        </button>

        {!isHost && (
          <div style={{ fontSize: 11, opacity: 0.7 }}>
            Çarkı sadece oda sahibi çevirebilir. Çıkan sorular host hakkında.
          </div>
        )}
      </div>

      {/* SORU + KİM CEVAPLAYACAK */}
      {room.currentTask && (
        <div
          style={{
            marginBottom: 12,
            padding: 12,
            borderRadius: 16,
            background: "rgba(15,23,42,0.96)",
            border: "1px solid rgba(148,163,184,0.6)",
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>
            Soru:
          </div>
          <div style={{ fontSize: 15, marginBottom: 8 }}>
            {room.currentTask}
          </div>

          {selectedAnonId && (
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              Bu turu{" "}
              <strong>
                {selectedAnonId === anonId
                  ? "sen"
                  : shortTag(selectedAnonId)}
              </strong>{" "}
              cevaplayabilir.
            </div>
          )}
        </div>
      )}

      {/* CEVAP ALANI */}
      {room.currentTask && (
        <div style={{ marginBottom: 80 }}>
          {canAnswer ? (
            <>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Cevabını buraya yaz..."
                rows={4}
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 14,
                  border: "1px solid rgba(148,163,184,0.6)",
                  background: "rgba(15,23,42,0.9)",
                  color: "white",
                  fontSize: 14,
                  marginBottom: 10,
                }}
              />
              <button
                onClick={sendAnswer}
                disabled={
                  sendingAnswer || hasAnswered || !answer.trim()
                }
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 14,
                  border: "none",
                  background: hasAnswered
                    ? "rgba(34,197,94,0.5)"
                    : "linear-gradient(135deg,#22c55e,#14b8a6)",
                  color: "white",
                  fontSize: 15,
                  fontWeight: 600,
                  boxShadow: "0 12px 30px rgba(0,0,0,0.8)",
                }}
              >
                {hasAnswered
                  ? "Cevabın kaydedildi ✔"
                  : sendingAnswer
                  ? "Gönderiliyor..."
                  : "Cevabı Gönder"}
              </button>
            </>
          ) : (
            <div
              style={{
                fontSize: 12,
                opacity: 0.7,
                padding: 10,
                borderRadius: 14,
                background: "rgba(15,23,42,0.9)",
                border: "1px solid rgba(55,65,81,0.9)",
              }}
            >
              Bu turu sadece seçilen oyuncu cevaplayabilir.
            </div>
          )}
        </div>
      )}

      {/* ALT BUTONLAR (MOBİL) */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          padding: 16,
          background:
            "linear-gradient(180deg, rgba(15,23,42,0), #020617 40%)",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {!isInRoom && (
          <button
            onClick={joinRoom}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 999,
              border: "none",
              background:
                "linear-gradient(135deg,#10b981,#22c55e)",
              color: "white",
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            Odaya Katıl
          </button>
        )}

        <button
          onClick={shareRoom}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 999,
            border: "none",
            background:
              "linear-gradient(135deg,#6366f1,#d946ef)",
            color: "white",
            fontSize: 15,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 16 }}>📤</span> Story’de Paylaş
        </button>
      </div>

      {/* DAVET MODALI */}
      {inviteOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              width: "92%",
              maxWidth: 420,
              background: "rgba(15,23,42,0.98)",
              borderRadius: 18,
              padding: 18,
              border: "1px solid rgba(148,163,184,0.7)",
              boxShadow: "0 24px 70px rgba(0,0,0,0.9)",
            }}
          >
            <h3 style={{ marginBottom: 10, fontSize: 18 }}>
              Whispleştiğin Kişiler
            </h3>

            {inviteSenders.length === 0 ? (
              <p style={{ fontSize: 13, opacity: 0.8 }}>
                Sana anonim Whisp atan kimse yok ya da kayıtlı değil.
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  maxHeight: 260,
                  overflowY: "auto",
                }}
              >
                {inviteSenders.map((s) => (
                  <div
                    key={s}
                    style={{
                      padding: 8,
                      borderRadius: 12,
                      background: "rgba(15,23,42,0.9)",
                      border:
                        "1px solid rgba(148,163,184,0.6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                      fontSize: 13,
                    }}
                  >
                    <div>{shortTag(s)}</div>
                    <button
                      onClick={() => copyInviteFor(s)}
                      style={{
                        border: "none",
                        borderRadius: 999,
                        padding: "6px 10px",
                        fontSize: 11,
                        background:
                          "linear-gradient(135deg,#4f46e5,#22c55e)",
                        color: "white",
                      }}
                    >
                      Davet Linkini Kopyala
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setInviteOpen(false)}
              style={{
                marginTop: 12,
                width: "100%",
                padding: 10,
                borderRadius: 999,
                border: "none",
                background: "rgba(148,163,184,0.4)",
                color: "white",
                fontSize: 13,
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
