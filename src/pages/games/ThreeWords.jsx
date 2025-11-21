// src/pages/games/ThreeWords.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";

export default function ThreeWords() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [w1, setW1] = useState("");
  const [w2, setW2] = useState("");
  const [w3, setW3] = useState("");

  const send = async () => {
    const text = `Bu kişiyi 3 kelime ile anlat:\n${w1}, ${w2}, ${w3}`;
    await addDoc(collection(db, "messages"), {
      linkId: handle,
      text,
      type: "threeWords",
      createdAt: serverTimestamp(),
    });
    navigate("/panel");
  };

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h2>📝 3 Kelime ile Anlat</h2>
      <input value={w1} onChange={(e) => setW1(e.target.value)} placeholder="1. kelime" />
      <input value={w2} onChange={(e) => setW2(e.target.value)} placeholder="2. kelime" />
      <input value={w3} onChange={(e) => setW3(e.target.value)} placeholder="3. kelime" />

      <button onClick={send} className="btn-send">
        Gönder
      </button>
    </div>
  );
}
