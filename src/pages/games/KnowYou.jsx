// src/pages/games/KnowYou.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function KnowYou() {
  const { handle } = useParams();
  const navigate = useNavigate();

  const [source, setSource] = useState("");
  const [feel, setFeel] = useState("");
  const [level, setLevel] = useState("");
  const [trait, setTrait] = useState("");

  const send = async () => {
    const text =
      `Seni nereden tanıyorum: ${source}\n` +
      `Sana karşı hissim: ${feel}\n` +
      `Seni ne kadar tanıyorum: ${level}\n` +
      `Sende en sevdiğim şey: ${trait}\n`;

    await addDoc(collection(db, "messages"), {
      linkId: handle,
      text,
      type: "knowYou",
      createdAt: serverTimestamp(),
    });

    navigate("/panel");
  };

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h2>🎮 Seni Ne Kadar Tanıyorum?</h2>
      <p>@{handle} için gizli cevap</p>

      <div className="list">
        <label>Seni nereden tanıyorum?</label>
        <select value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="">Seç</option>
          <option>Okuldan</option>
          <option>Mahalleden</option>
          <option>İnternetten</option>
          <option>Arkadaş ortamı</option>
        </select>

        <label>Bu kişiye karşı hissim:</label>
        <select value={feel} onChange={(e) => setFeel(e.target.value)}>
          <option value="">Seç</option>
          <option>Sadece arkadaşça</option>
          <option>Biraz hoşlanıyorum</option>
          <option>Platonik aşığım</option>
          <option>Karışık duygularım var</option>
        </select>

        <label>Ne kadar tanıyorum?</label>
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option>%20</option>
          <option>%50</option>
          <option>%80</option>
          <option>%100</option>
        </select>

        <label>Sende en sevdiğim şey:</label>
        <input value={trait} onChange={(e) => setTrait(e.target.value)} placeholder="gülüşün, enerjin..." />
      </div>

      <button onClick={send} className="btn-send">
        Gönder
      </button>
    </div>
  );
}
