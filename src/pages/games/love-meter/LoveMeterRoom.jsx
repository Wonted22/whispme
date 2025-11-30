 // src/pages/games/love-meter/LoveMeterSelf.jsx
import { useState } from "react";
import { db } from "../../../firebase";
import { collection, addDoc, serverTimestamp, setDoc, doc } from "firebase/firestore";
import { calculateLoveScore } from "../../../logic/loveAI";
import html2canvas from "html2canvas";

export default function LoveMeterSelf() {
  const questions = [
    "Romantik biri olduğunu düşünürsən?",
    "Ünsiyyətdə yaxşısan?",
    "Sadiqliyə böyük əhəmiyyət verirsən?",
    "Empatiya bacarığın yüksəkdir?",
    "Qısqanclıq səviyyən aşağıdır?",
    "Ümumilikdə pozitiv vibe verirsən?",
  ];

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [roomId, setRoomId] = useState(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const getBadge = () => {
    if (score <= 30) return "❄ Soyuq Ruh";
    if (score <= 60) return "🙂 Normal Lover";
    if (score <= 85) return "❤️ Romantik";
    return "💍 Aşk Master";
  };

  const handleAnswer = async (value) => {
    if (locked) return;
    setLocked(true);

    const next = [...answers, value];

    if (step + 1 === questions.length) {
      const finalScore = calculateLoveScore(next);
      setScore(finalScore);
      setFinished(true);

      const newRoomId = crypto.randomUUID();
      setRoomId(newRoomId);

      try {
        await setDoc(doc(db, "loveRooms", newRoomId), {
          createdAt: Date.now(),
          totalScore: 0,
          voteCount: 0,
          votes: [],
        });

        await addDoc(collection(db, "loveSelfResults"), {
          score: finalScore,
          answers: next,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.error("Room creation error:", err);
      }
    } else {
      setAnswers(next);
      setStep(step + 1);
    }

    setTimeout(() => setLocked(false), 300);
  };

  const restart = () => {
    setStep(0);
    setAnswers([]);
    setFinished(false);
    setScore(0);
    setRoomId(null);
  };

  const shareCard = async () => {
    const el = document.getElementById("loveShareCard");
    if (!el || !roomId) return;

    const roomLink = `${origin}/games/love-meter/LoveMeterRoom/${roomId}`;
    const shareText = `❤️ Mənim Love Meter nəticəm: ${score}% – ${getBadge()}\nSən də mənim haqqımda yaz: ${roomLink}`;

    try {
      const canvas = await html2canvas(el);
      const imgURL = canvas.toDataURL("image/png");
      const res = await fetch(imgURL);
      const blob = await res.blob();
      const file = new File([blob], "love-card.png", {
        type: "image/png",
      });

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: "Love Meter • WhispMe",
          text: shareText,
          url: roomLink,
          files: [file],
        });
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: "Love Meter • WhispMe",
          text: shareText,
          url: roomLink,
        });
        return;
      }

      await navigator.clipboard.writeText(shareText);
      alert("✅ Link kopyalandı.");
    } catch {
      alert("Xəta baş verdi.");
    }
  };

  const progress = Math.round(((step + 1) / questions.length) * 100);

  if (finished) {
    const roomLink = roomId
      ? `${origin}/games/love-meter/LoveMeterRoom/${roomId}`
      : "#";

    return (
      <div
        style={{
          minHeight: "100vh",
          color: "white",
          fontFamily: "system-ui",
          padding: "22px 16px",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: 22, marginBottom: 16 }}>❤️ Love Meter nəticən</h2>

        <div
          style={{
            margin: "0 auto",
            maxWidth: 330,
            borderRadius: 18,
            padding: "28px 20px",
            background: "rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ fontSize: 52, fontWeight: 800 }}>{score}%</div>
          <div style={{ fontSize: 16, opacity: 0.9 }}>{getBadge()}</div>
        </div>

        <button
          onClick={shareCard}
          style={{
            width: "100%",
            padding: "12px 0",
            marginTop: 22,
            borderRadius: 12,
            background: "linear-gradient(135deg,#ff4d67,#7c3aed)",
            border: "none",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          📸 Paylaş (Foto + Link)
        </button>

        <button
          onClick={restart}
          style={{
            width: "100%",
            padding: "12px 0",
            marginTop: 12,
            borderRadius: 12,
            background: "rgba(255,255,255,0.15)",
            border: "none",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          🔁 Yenidən Başla
        </button>

        <div
          id="loveShareCard"
          style={{
            width: 300,
            height: 500,
            position: "absolute",
            top: -9999,
            left: -9999,
            borderRadius: 32,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background:
              "linear-gradient(145deg, #4f46e5, #ec4899, #22d3ee)",
            color: "white",
            fontFamily: "system-ui",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 80, fontWeight: 800 }}>{score}%</div>
          <div style={{ fontSize: 22, marginBottom: 30 }}>{getBadge()}</div>

          <a
            href={roomLink}
            style={{
              fontSize: 16,
              padding: "10px 20px",
              borderRadius: 999,
              background: "rgba(15,23,42,0.9)",
              color: "white",
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.7)",
            }}
          >
            Mənim haqqımda yaz!
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        color: "white",
        fontFamily: "system-ui",
        padding: "22px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          height: 8,
          background: "rgba(255,255,255,0.2)",
          borderRadius: 999,
          overflow: "hidden",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "linear-gradient(135deg,#ec4899,#f97316)",
            transition: "width .25s",
          }}
        />
      </div>

      <h2 style={{ textAlign: "center", marginBottom: 24 }}>
        {questions[step]}
      </h2>

      <button disabled={locked} onClick={() => handleAnswer(100)} style={btn("#22c55e")}>
        ✅ Bəli
      </button>

      <button disabled={locked} onClick={() => handleAnswer(55)} style={btn("#eab308")}>
        🙂 Bəzən
      </button>

      <button disabled={locked} onClick={() => handleAnswer(15)} style={btn("#ef4444")}>
        ❌ Xeyr
      </button>
    </div>
  );
}

const btn = (bg) => ({
  width: "100%",
  padding: "12px 0",
  borderRadius: 12,
  border: "none",
  marginBottom: 10,
  fontWeight: 700,
  cursor: "pointer",
  background: bg,
});
