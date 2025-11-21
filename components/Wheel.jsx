import { useState } from "react";

const tasks = [
  "Bu kişiyi 3 kelime ile anlat.",
  "Ona karşı dürüst bir yorum yap.",
  "Bu kişiyi 1–10 arası değerlendir.",
  "İlk izlenimini yaz.",
  "Bu kişiye soracağın bir soru yaz.",
  "Onunla ilgili gizli bir düşünceni yaz.",
  "Bu kişide en sevdiğin yön ne?",
  "Bu kişiye bir tavsiye ver.",
  "Bu kişi hakkında seni şaşırtan şey ne?",
  "Onu neden sevdiğini yaz.",
];

function Wheel({ onSelect }) {
  const [spinning, setSpinning] = useState(false);

  const spin = () => {
    if (spinning) return;

    setSpinning(true);
    const randomIndex = Math.floor(Math.random() * tasks.length);

    setTimeout(() => {
      setSpinning(false);
      onSelect(tasks[randomIndex]);
    }, 2500);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: 220,
          height: 220,
          margin: "0 auto 20px",
          borderRadius: "50%",
          background: "conic-gradient(#6a5af9, #d66efd, #6a5af9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: spinning ? "spin 2.5s ease-out" : "none",
        }}
      >
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "#0f0c29",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            textAlign: "center",
            padding: 20,
          }}
        >
          🎡 ÇARK
        </div>
      </div>

      <button
        onClick={spin}
        style={{
          padding: "12px 20px",
          fontSize: 16,
          background:
            "linear-gradient(135deg, #6a5af9, #d66efd)",
          border: "none",
          borderRadius: 12,
          color: "white",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Çarkı Çevir
      </button>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(1080deg); }
          }
        `}
      </style>
    </div>
  );
}

export default Wheel;
