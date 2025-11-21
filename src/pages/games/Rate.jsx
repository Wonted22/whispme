// src/pages/games/Rate.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";

export default function Rate() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [score, setScore] = useState(5);

  const send = async () => {
    const text = `Bu kişiyi puanlıyorum: ${score}/10`;
    await addDoc(collection(db, "messages"), {
      linkId: handle,
      text,
      type: "rate",
      createdAt: serverTimestamp(),
    });
    navigate("/panel");
  };

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h2>⭐ Puan Ver</h2>

      <input
        type="range"
        min="1"
        max="10"
        value={score}
        onChange={(e) => setScore(e.target.value)}
      />
      <p>Seçilen puan: {score}</p>

      <button onClick={send} className="btn-send">
        Gönder
      </button>
    </div>
  );
}
