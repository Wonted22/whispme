import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

// ⭐ SƏNİN REAL PADDLE PRICE ID-LƏRİN
const PADDLE_PRICE_IDS = {
  monthly: "pri_01kb8yk1xc8mdqvvrvsem5vnf2",
  yearly: "pri_01kb8ypz7b9p812z5g7p4rdzb1",
};

// ⭐ SƏNİN REAL CLIENT TOKEN
const CLIENT_TOKEN = "live_3db01d894db32c6104fd77e1480";

export default function PremiumPage() {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState("yearly");

  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("loveMeterUserId") || `guest_${Date.now()}`
      : null;

  // ⭐ PADDLE INIT
  useEffect(() => {
    if (window.Paddle) {
      window.Paddle.Initialize({
        token: CLIENT_TOKEN,
        environment: "live",
      });
      console.log("Paddle Initialized ✔");
    } else {
      console.error("Paddle not loaded ❌");
    }
  }, []);

  // ⭐ CHECKOUT aç
  const startCheckout = async () => {
    if (!window.Paddle) {
      alert("Paddle yüklenmədi!");
      return;
    }

    const priceId = PADDLE_PRICE_IDS[plan];
    setLoading(true);

    window.Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: { id: userId },

      successCallback: async () => {
        await setDoc(
          doc(db, "users", userId),
          {
            premium: true,
            premiumType: plan,
            premiumSince: Date.now(),
          },
          { merge: true }
        );

        window.location.href = "/panel";
      },

      closeCallback: () => setLoading(false),
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050816",
        color: "white",
        padding: "40px 16px",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: 32, fontWeight: 800, color: "#FCD34D" }}>
        WhispMe Premium
      </h1>

      <p style={{ opacity: 0.7 }}>
        Reklamsız təcrübə, gizli nəticələr, limitsiz oyunlar.
      </p>

      {/* PLAN SEÇİMİ */}
      <div style={{ marginTop: 30 }}>
        <button
          onClick={() => setPlan("monthly")}
          style={{
            padding: "10px 16px",
            marginRight: 10,
            borderRadius: 8,
            border: "none",
            background:
              plan === "monthly" ? "#4ade80" : "rgba(255,255,255,0.15)",
            color: plan === "monthly" ? "black" : "white",
            fontWeight: 700,
          }}
        >
          Aylıq – $2.99
        </button>

        <button
          onClick={() => setPlan("yearly")}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            background:
              plan === "yearly" ? "#4ade80" : "rgba(255,255,255,0.15)",
            color: plan === "yearly" ? "black" : "white",
            fontWeight: 700,
          }}
        >
          İllik – $19.99
        </button>
      </div>

      {/* ÖDƏNİŞ DÜYMƏSİ */}
      <button
        onClick={startCheckout}
        style={{
          marginTop: 40,
          padding: "16px 20px",
          borderRadius: 10,
          border: "none",
          background: "linear-gradient(90deg,#F59E0B,#D97706)",
          color: "black",
          fontWeight: 800,
          fontSize: 20,
          width: "100%",
          maxWidth: 350,
          cursor: "pointer",
        }}
        disabled={loading}
      >
        {loading
          ? "Yüklənir..."
          : `Al – $${plan === "monthly" ? "2.99" : "19.99"}`}
      </button>

      <p style={{ marginTop: 20, opacity: 0.5, fontSize: 12 }}>
        Ödənişlər Paddle tərəfindən idarə olunur.
      </p>
    </div>
  );
}
