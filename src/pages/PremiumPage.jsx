// src/pages/PremiumCheckoutPage.jsx

import { useEffect, useState } from 'react';
import { db } from "../firebase"; // Adjust path if necessary: "../firebase" or "../firebase.js"
import { doc, setDoc } from "firebase/firestore";

// ⭐ PADDLE AND FIREBASE CONFIGURATION (UNCHANGED)
const PADDLE_PRODUCT_IDS = {
  monthly: "pri_01kb8yk1xc8mdqvvrvsem5vnf2",
  yearly:  "pri_01kb8ypz7b9p812z5g7p4rdzb1"
};

const CLIENT_TOKEN = "live_3db01d894db32c6104fd77e1480";

// ------------------- ELITE STYLES AND DESIGN -------------------

const PRIMARY_COLOR = '#F59E0B'; // Gold/Amber
const ACCENT_COLOR = '#4ade80'; // Subtle Green

const containerStyle = {
    minHeight: '100vh',
    background: '#050816',
    color: '#ffffff',
    padding: '40px 15px',
    textAlign: 'center',
    fontFamily: 'Roboto, "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif' // Professional Font
};

const titleStyle = {
    fontSize: '2.5rem',
    fontWeight: '700',
    letterSpacing: '-1px',
    marginBottom: '10px',
    color: PRIMARY_COLOR // Highlight the premium title
};

const subtitleStyle = {
    fontSize: '1.2rem',
    color: '#a0aec0',
    marginBottom: '50px'
};

const plansContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    flexWrap: 'wrap',
    maxWidth: '900px',
    margin: '0 auto'
};

const planCardStyle = (isActive) => ({
    background: isActive ? '#1e293b' : '#111827',
    border: isActive ? `2px solid ${PRIMARY_COLOR}` : '2px solid #374151',
    borderRadius: '16px',
    padding: '30px 25px',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.3s ease-in-out',
    boxShadow: isActive ? `0 0 15px rgba(245, 158, 11, 0.6)` : 'none'
});

const bestValueTagStyle = {
    background: PRIMARY_COLOR,
    color: '#000',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    padding: '6px 12px',
    borderRadius: '10px',
    marginBottom: '20px',
    display: 'inline-block'
};

const featureListStyle = {
    listStyleType: 'none',
    padding: 0,
    marginTop: '30px'
};

const featureItemStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
    fontSize: '1.05rem',
    color: '#cbd5e1'
};

const checkoutButtonStyle = (loading) => ({
    marginTop: '60px',
    padding: "18px 25px",
    background: loading ? '#4b5563' : `linear-gradient(90deg, ${PRIMARY_COLOR}, #D97706)`,
    border: "none",
    borderRadius: 12,
    fontSize: 22,
    fontWeight: 'bold',
    cursor: loading ? 'not-allowed' : 'pointer',
    color: "black",
    width: "100%",
    maxWidth: 400,
    boxShadow: loading ? 'none' : `0 10px 20px rgba(245, 158, 11, 0.4)`
});


// ------------------- COMPONENT CODE -------------------

export default function PremiumCheckoutPage() {
  const [activeTab, setActiveTab] = useState("yearly");
  const [loading, setLoading] = useState(false);

  const plans = {
    monthly: { 
        price: 2.99, 
        text: "Monthly", 
        features: ['Unlimited Access to All Games', 'Ad-Free Experience', 'Priority Customer Support'] 
    },
    yearly: { 
        price: 19.99, 
        text: "Yearly", 
        isBestValue: true,
        features: ['Unlimited Access to All Games', 'Ad-Free Experience', 'Priority Customer Support', 'Save 44% Annually'] 
    }
  };

  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("loveMeterUserId") || `guest_${Date.now()}`
      : null;

  // ⭐ PADDLE INIT (V2)
  useEffect(() => {
    if (window.Paddle) {
      window.Paddle.Initialize({
        token: CLIENT_TOKEN,
        environment: "live"
      });
      console.log("Paddle Initialized");
    } else {
      console.error("Paddle FAILED to load");
    }
  }, []);

  // ⭐ CHECKOUT OPEN — V2 (popup)
  const handleCheckout = () => {
    if (!window.Paddle) {
      alert("Paddle failed to load! Please check your connection.");
      return;
    }
    const priceId = PADDLE_PRODUCT_IDS[activeTab];
    setLoading(true);

    window.Paddle.Checkout.open({
      items: [
        {
          priceId: priceId,
          quantity: 1
        }
      ],
      customer: {
        id: userId
      },
      successCallback: async (data) => {
        console.log("SUCCESS:", data);

        try {
          await setDoc(
            doc(db, "users", userId),
            {
              premium: true,
              premiumType: activeTab,
              premiumSince: Date.now()
            },
            { merge: true }
          );
            alert("✅ Premium access activated successfully!");
        } catch(error) {
            console.error("Firebase update failed after Paddle success:", error);
            alert("⚠️ Error updating profile. Please contact support.");
        }

        window.location.href = "/panel";
      },
      closeCallback: () => {
        setLoading(false);
      }
    });
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>The WhispMe Premium Club</h1>
      <h3 style={subtitleStyle}>Unlock limitless, ad-free experience and exclusive features.</h3>

      {/* PLAN SELECTION CARDS */}
      <div style={plansContainerStyle}>
        {Object.keys(plans).map((key) => {
          const plan = plans[key];
          const isActive = activeTab === key;
          return (
            <div
              key={key}
              onClick={() => {if (!loading) setActiveTab(key)}}
              style={planCardStyle(isActive)}
            >
              {plan.isBestValue && <span style={bestValueTagStyle}>BEST VALUE</span>}
              <h2 style={{ margin: '0 0 5px 0', fontSize: '2.0rem', color: isActive ? PRIMARY_COLOR : '#fff' }}>
                {plan.text}
              </h2>
              <p style={{ fontSize: '2.8rem', fontWeight: '800', margin: '0 0 15px 0' }}>
                ${plan.price}
                <span style={{ fontSize: '1.1rem', fontWeight: 'normal', color: '#a0aec0' }}> / {plan.text === 'Monthly' ? 'mo' : 'yr'}</span>
              </p>
              
              {/* Features List */}
              <ul style={featureListStyle}>
                {plan.features.map((feature, index) => (
                  <li key={index} style={featureItemStyle}>
                    <span style={{ color: ACCENT_COLOR, marginRight: '10px', fontSize: '1.2rem' }}>✔</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={loading}
        style={checkoutButtonStyle(loading)}
      >
        {loading ? "Processing..." : `Get Started Now — $${plans[activeTab].price}`}
      </button>

      <p style={{ marginTop: 20, color: "#9ca3af", fontSize: 13 }}>
        All payments are securely processed by Paddle.
      </p>
    </div>
  );
}