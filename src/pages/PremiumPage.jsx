// src/pages/PremiumCheckoutPage.jsx

import { useEffect, useState, useMemo } from 'react';
import { db } from "../firebase"; // Düzgün import yolu
import { doc, setDoc } from "firebase/firestore";

// ⭐ PADDLE SECRETS (Token və ID'ler)
const PADDLE_PRODUCT_IDS = {
  monthly: "pri_01kb98xzeafsp2v65aexz1mz04",
  yearly:  "pri_01kb8ypz7b9p812z5g7p4rdzb1"
};

const CLIENT_TOKEN = "test_19fc2fa89508ca80a4e4b1093d5"; 

// ------------------- ELITE STYLES AND DESIGN -------------------
const PRIMARY_COLOR = '#F59E0B'; // Gold/Amber
const ACCENT_COLOR = '#4ade80'; // Subtle Green

const containerStyle = {
    minHeight: '100vh',
    background: '#050816',
    color: '#ffffff',
    padding: '40px 15px',
    textAlign: 'center',
    fontFamily: 'Roboto, "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif'
};

const titleStyle = {
    fontSize: '2.5rem',
    fontWeight: '700',
    letterSpacing: '-1px',
    marginBottom: '10px',
    color: PRIMARY_COLOR 
};

const plansContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    flexWrap: 'wrap',
    maxWidth: '900px',
    margin: '0 auto'
};

const checkoutButtonStyle = (isLoading) => ({
    marginTop: '60px',
    padding: "18px 25px",
    background: isLoading ? '#4b5563' : `linear-gradient(90deg, ${PRIMARY_COLOR}, #D97706)`,
    border: "none",
    borderRadius: 12,
    fontSize: 22,
    fontWeight: 'bold',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    color: "black",
    width: "100%",
    maxWidth: 400,
    boxShadow: isLoading ? 'none' : `0 10px 20px rgba(245, 158, 11, 0.4)`
});

// ------------------- COMPONENT CODE -------------------

export default function PremiumCheckoutPage() {
    const [activeTab, setActiveTab] = useState("yearly");
    const [loading, setLoading] = useState(true); 
    const [paddleLoaded, setPaddleLoaded] = useState(false); 

    const plans = useMemo(() => ({
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
    }), []);

    const userId = useMemo(() => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem("loveMeterUserId") || `guest_${Date.now()}`;
    }, []);

    // ⭐ PADDLE INIT VƏ LOADING MANAGEMENT (TƏHLÜKƏSİZ VƏ DÜZGÜN VERSİYA)
    useEffect(() => {
        let timer;
        
        const initializePaddle = () => {
             if (window.Paddle) {
                window.Paddle.Initialize({
                    // ✅ DÜZƏLİŞ: SADECE TOKEN TƏQDİM EDİLİR.
                    token: CLIENT_TOKEN, 
                });
                setPaddleLoaded(true);
                setLoading(false); 
                console.log("Paddle Initialized.");
            } else {
                 console.log("Waiting for Paddle SDK...");
                 timer = setTimeout(initializePaddle, 1000); 
            }
        };

        if (typeof window !== "undefined") {
            // İlk çağırış
            initializePaddle();
        } else {
            // Server Side Render üçün
            setLoading(false); 
        }

        return () => {
            if (timer) clearTimeout(timer); // Təmizləmə
        };
    }, []);

    // ⭐ CHECKOUT OPEN — V2 (popup)
    const handleCheckout = () => {
        if (!paddleLoaded) {
            alert("Payment system is not ready yet. Please wait a moment.");
            return;
        }

        const priceId = PADDLE_PRODUCT_IDS[activeTab];
        setLoading(true);

        window.Paddle.Checkout.open({
            items: [{ priceId: priceId, quantity: 1 }],
            customer: { id: userId },
            successCallback: async (data) => {
                console.log("SUCCESS:", data);

                try {
                    // Firebase update
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

    // ------------------- RENDER -------------------
    
    // Yüklənmə zamanı sadə ekran
    if (loading && !paddleLoaded) {
        return (
            <div style={{...containerStyle, paddingTop: '40vh', fontSize: '1.5rem'}}>
                Initializing payment system...
            </div>
        );
    }
    
    // Əsas Dizayn
    return (
        <div style={containerStyle}>
            {/* Başlıqlar */}
            <h1 style={titleStyle}>The WhispMe Premium Club</h1>
            <h3 style={{...titleStyle, fontSize: '1.2rem', color: '#a0aec0', fontWeight: '400', marginBottom: '50px'}}>
                Unlock limitless, ad-free experience and exclusive features.
            </h3>

            {/* PLAN SELECTION CARDS */}
            <div style={{...plansContainerStyle, padding: '0'}}>
                {Object.keys(plans).map((key) => {
                    const plan = plans[key];
                    const isActive = activeTab === key;
                    const cardStyle = (isActive) => ({ // Card style logic
                        background: isActive ? '#1e293b' : '#111827',
                        border: isActive ? `2px solid ${PRIMARY_COLOR}` : '2px solid #374151',
                        borderRadius: '16px',
                        padding: '30px 25px',
                        width: '100%',
                        maxWidth: '400px',
                        textAlign: 'left',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease-in-out',
                        boxShadow: isActive ? `0 0 15px rgba(245, 158, 11, 0.6)` : 'none'
                    });

                    return (
                        <div
                            key={key}
                            onClick={() => {if (!loading) setActiveTab(key)}}
                            style={cardStyle(isActive)}
                        >
                            {plan.isBestValue && <span style={{background: PRIMARY_COLOR, color: '#000', fontSize: '0.9rem', fontWeight: 'bold', padding: '6px 12px', borderRadius: '10px', marginBottom: '20px', display: 'inline-block'}}>BEST VALUE</span>}
                            <h2 style={{ margin: '0 0 5px 0', fontSize: '2.0rem', color: isActive ? PRIMARY_COLOR : '#fff' }}>
                                {plan.text}
                            </h2>
                            <p style={{ fontSize: '2.8rem', fontWeight: '800', margin: '0 0 15px 0' }}>
                                ${plan.price}
                                <span style={{ fontSize: '1.1rem', fontWeight: 'normal', color: '#a0aec0' }}> / {plan.text === 'Monthly' ? 'mo' : 'yr'}</span>
                            </p>
                            
                            {/* Features List */}
                            <ul style={{listStyleType: 'none', padding: 0, marginTop: '30px'}}>
                                {plan.features.map((feature, index) => (
                                    <li key={index} style={{display: 'flex', alignItems: 'center', marginBottom: '12px', fontSize: '1.05rem', color: '#cbd5e1'}}>
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