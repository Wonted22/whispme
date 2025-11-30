// src/pages/PremiumCheckoutPage.jsx

import { useEffect, useState, useMemo } from 'react';
import { db } from "../firebase"; // Adjust path if necessary: "../firebase" or "../../firebase"
import { doc, setDoc } from "firebase/firestore";

// 🛑 PADDLE_PRODUCT_IDS və CLIENT_TOKEN Tamamilə Qaldırıldı.

// ------------------- STYLES AND DESIGN CONSTANTS -------------------
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

// ... (Other style constants remain the same for Elite look)

const bestValueTagStyle = { /* ... */ };
const checkoutButtonStyle = (isLoading) => ({ /* ... */ });
const titleStyle = { /* ... */ };
const subtitleStyle = { /* ... */ };
const plansContainerStyle = { /* ... */ };

// ------------------- COMPONENT CODE -------------------

export default function PremiumCheckoutPage() {
    const [activeTab, setActiveTab] = useState("yearly");
    // Loading state simulyasiya üçün saxlanılır
    const [loading, setLoading] = useState(false); 
    
    // 🛑 Paddle SDK ilə əlaqəli olan "paddleLoaded" state-i silindi.

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

    // 🛑 PADDLE INIT useEffect-i tamamilə silindi.

    // ⭐ CHECKOUT SIMULATION
    const handleCheckout = () => {
        
        // 1. Simulyasiya loadingini başlat
        setLoading(true);

        // 2. Simulyasiya: 1.5 saniyə sonra ödəniş uğurlu olur (Promise istifadə etməklə daha təmiz)
        setTimeout(async () => {
            console.log("SIMULATION: Checkout successful.");

            try {
                // Firebase update (Eyni qalır)
                await setDoc(
                    doc(db, "users", userId),
                    {
                        premium: true,
                        premiumType: activeTab,
                        premiumSince: Date.now()
                    },
                    { merge: true }
                );
                alert("✅ Premium access activated successfully (SIMULATED)!");
            } catch(error) {
                console.error("Firebase update failed:", error);
                alert("⚠️ Error updating profile. Please contact support.");
            }

            // 3. Yönləndirmə
            window.location.href = "/panel";
            
            // 4. Loadingi bitir (Yönləndirmə baş verdiyi üçün bu, çox əhəmiyyətli deyil, amma məntiq üçün doğru saxlanılır)
            setLoading(false);

        }, 1500); // 1.5 saniyelik yüklənmə simulyasiyası
    };

    // ------------------- RENDER -------------------
    
    // NOTE: Paddle yüklənməsini gözləməyə ehtiyac yoxdur. Səhifə dərhal görünür.
    
    return (
        <div style={containerStyle}>
            {/* Başlıqlar */}
            <h1 style={{...titleStyle, fontSize: '2.5rem'}}>The WhispMe Premium Club</h1>
            <h3 style={{...titleStyle, fontSize: '1.2rem', color: '#a0aec0', fontWeight: '400', marginBottom: '50px'}}>
                Unlock limitless, ad-free experience and exclusive features.
            </h3>

            {/* PLAN SELECTION CARDS (Eyni qalır) */}
            <div style={{...plansContainerStyle, padding: '0'}}>
                {Object.keys(plans).map((key) => {
                    const plan = plans[key];
                    const isActive = activeTab === key;
                    const cardStyle = (isActive) => ({ 
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
                            {plan.isBestValue && <span style={{...bestValueTagStyle, background: PRIMARY_COLOR, color: '#000', fontSize: '0.9rem', padding: '6px 12px', borderRadius: '10px', marginBottom: '20px', display: 'inline-block'}}>BEST VALUE</span>}
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
                {loading ? "Processing Payment..." : `Get Started Now — $${plans[activeTab].price}`}
            </button>

            <p style={{ marginTop: 20, color: "#9ca3af", fontSize: 13 }}>
                (Payment Simulation: Actual payment gateway removed)
            </p>
        </div>
    );
}