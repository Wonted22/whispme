import { useEffect, useState } from 'react';

// 💎 PREMIUM.JSX (Checkout Page) Component
export default function PremiumCheckoutPage() {
    const [isMobile, setIsMobile] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState({ type: 'Yearly Plan', price: '19.99' });

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        // URL-dən plan parametrlərini almaq (Simulyasiya üçün)
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const type = params.get('planType');
            const price = params.get('price');
            if (type && price) {
                setSelectedPlan({ type, price });
            }
        }
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // 📳 HAPTIC FEEDBACK (Əvvəlki fəyıldan kopyalanıb)
    const triggerHaptic = (pattern = [10]) => {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    };

    const handlePayment = () => {
        triggerHaptic([50, 50, 50]);
        // ⚠️ REAL APP: Stripe/PayPal ödəniş prosesi buraya daxil edilir.
        alert(`Payment initiated for: ${selectedPlan.type} at $${selectedPlan.price}. (Simulated Success!)`);
        window.location.href = '/games/love-meter/LoveMeterSelf'; // Nəticə səhifəsinə geri qayıtma
    };

    const containerStyle = {
        minHeight: "100vh",
        color: "white",
        padding: isMobile ? "20px" : "30px",
        maxWidth: "550px",
        margin: "0 auto",
        background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)",
        fontFamily: 'sans-serif'
    };

    const cardStyle = {
        background: "linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
        borderRadius: '20px',
        padding: isMobile ? '20px' : '30px',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        textAlign: 'center'
    };
    
    const buttonStyle = {
        width: "100%",
        padding: "16px",
        borderRadius: "12px",
        border: "none",
        fontWeight: "700",
        cursor: "pointer",
        fontSize: "18px",
        background: "linear-gradient(90deg, #4ade80, #10b981)",
        color: 'black',
        marginTop: '20px'
    };

    return (
        <div style={containerStyle}>
            <h1 style={{ color: '#FCD34D', fontSize: isMobile ? '24px' : '32px', marginBottom: '30px', textAlign: 'center' }}>
                Secure Checkout
            </h1>

            <div style={cardStyle}>
                <h2 style={{ fontSize: isMobile ? '20px' : '24px', margin: '0 0 10px' }}>
                    {selectedPlan.type}
                </h2>
                <p style={{ color: '#aaa', margin: '0 0 20px' }}>
                    Full Access to Psychological Reports
                </p>

                <div style={{ padding: '15px', background: '#374151', borderRadius: '10px', marginBottom: '30px' }}>
                    <h3 style={{ margin: 0, fontSize: '36px', color: 'white' }}>
                        ${selectedPlan.price}
                    </h3>
                </div>

                <div style={{ textAlign: 'left', marginBottom: '30px' }}>
                    <h4 style={{ color: '#ccc', marginBottom: '10px' }}>Payment Details:</h4>
                    <input 
                        type="text" 
                        placeholder="Card Number" 
                        style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #555', background: '#222', color: 'white' }} 
                        readOnly={true} // Simulyasiya
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                            type="text" 
                            placeholder="MM/YY" 
                            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #555', background: '#222', color: 'white' }} 
                            readOnly={true} 
                        />
                        <input 
                            type="text" 
                            placeholder="CVC" 
                            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #555', background: '#222', color: 'white' }} 
                            readOnly={true} 
                        />
                    </div>
                </div>

                <button onClick={handlePayment} style={buttonStyle}>
                    Complete Purchase (${selectedPlan.price})
                </button>
                
                <p style={{ fontSize: '12px', color: '#888', marginTop: '15px' }}>
                    By clicking "Complete Purchase", you agree to the Terms of Service.
                </p>
            </div>
        </div>
    );
}

// ⚠️ QEYD: Bu komponenti tətbiqinizin routing (yönləndirmə) sisteminə /premium-checkout URL-i ilə əlavə etməlisiniz.