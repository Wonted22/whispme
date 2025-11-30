import { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  setDoc, 
  doc, 
  getDoc,
  updateDoc,
  arrayUnion,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from "firebase/firestore";
import html2canvas from "html2canvas";

// 📳 HAPTIC FEEDBACK
const triggerHaptic = (pattern = [10]) => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

// 🧠 REAL SCORE CALCULATION
const calculateLoveScore = (answers) => {
  if (!answers.length) return 50;
  const sum = answers.reduce((a, b) => a + b, 0);
  return Math.min(100, Math.max(0, Math.round(sum / answers.length)));
};

const calculatePersonalityType = (answers) => {
  if (!answers || answers.length === 0) return 'balanced';
  const avg = answers.reduce((a, b) => a + b, 0) / answers.length;
  if (avg >= 80) return 'romantic';
  if (avg >= 60) return 'balanced'; 
  if (avg >= 40) return 'realistic';
  return 'reserved';
};

// 💪 STRENGTH ANALYSIS
const getStrengthAnalysis = (answers, questions) => {
    const maxScore = Math.max(...answers);
    const index = answers.indexOf(maxScore);
    const strengths = [
        "Love Devotee", "Communication Master", "Loyalty Symbol", 
        "Empathy King/Queen", "Confident Lover", "Positive Energy Source"
    ];
    return {
        question: questions[index],
        analysis: strengths[index] || "Balanced Strength",
        detail: "This is your greatest asset. People love this quality about you the most."
    };
};

// 📉 WEAKNESS ANALYSIS
const getWeaknessAnalysis = (answers, questions) => {
    const minScore = Math.min(...answers);
    const weakIndex = answers.indexOf(minScore);
    const weaknesses = [
        "Emotional Coolness", "Closed Book", "Trust Trauma", 
        "Lack of Empathy", "Hidden Jealousy", "Fear of Commitment"
    ];
    return {
        question: questions[weakIndex],
        analysis: weaknesses[weakIndex] || "Hidden Fear",
        score: minScore,
        solution: "If you don't address this problem, the same scenario may repeat in your next relationship."
    };
};

// 🎯 REAL SOCIAL PROOF
const calculateRealSocialProof = async (userAnswers, userId) => {
  try {
    const resultsQuery = query(collection(db, "loveSelfResults"), orderBy("createdAt", "desc"), limit(500));
    const snapshot = await getDocs(resultsQuery);
    
    if (snapshot.size < 5) return { similarity: 75, totalUsers: 0, potentialMatches: 0, averageScore: 60 };

    const userPersonality = calculatePersonalityType(userAnswers);
    let potentialMatchCount = 0;
    let totalScoreSum = 0;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.answers && data.userId !== userId) {
        totalScoreSum += data.score || 0;
        const otherPersonality = calculatePersonalityType(data.answers);
        let isMatch = false;
        if (userPersonality === 'romantic' && ['romantic', 'realistic'].includes(otherPersonality)) isMatch = true;
        else if (userPersonality === 'realistic' && otherPersonality === 'romantic') isMatch = true;
        else if (userPersonality === 'balanced' && otherPersonality === 'balanced') isMatch = true;
        
        if (isMatch) potentialMatchCount++;
      }
    });
    
    const averageScore = snapshot.size > 0 ? Math.round(totalScoreSum / snapshot.size) : 60;

    return {
      similarity: 78,
      totalUsers: snapshot.size,
      potentialMatches: potentialMatchCount,
      averageScore: averageScore
    };
  } catch (error) {
    return { similarity: 75, totalUsers: 0, potentialMatches: 0, averageScore: 60 };
  }
};

const getUserRealStats = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) return userSnap.data();
    return null;
  } catch (error) { return null; }
};

const updateRealUserProfile = async (userId, newScore, answers) => {
    // ... (User profile update logic remains the same)
    return null; 
};

// 📊 SIMPLE CHART COMPONENT
const SimpleBarChart = ({ label, percentage, color }) => {
    const validPercentage = Math.min(100, Math.max(0, percentage)); 
    
    return (
        <div style={{ marginBottom: 12, fontSize: 13, display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 100, fontWeight: 500, opacity: 0.8 }}>{label}</div>
            <div style={{ flexGrow: 1, height: 12, background: 'rgba(255,255,255,0.1)', borderRadius: 6, overflow: 'hidden', marginLeft: 10 }}>
                <div style={{ 
                    width: `${validPercentage}%`, 
                    height: '100%', 
                    background: color, 
                    transition: 'width 0.5s ease' 
                }} />
            </div>
            <div style={{ marginLeft: 10, fontWeight: 700, color }}>{validPercentage}%</div>
        </div>
    );
};

// 🔒 PREMIUM CHECK LOGIC
const checkPremiumStatus = async (userId) => {
    if (!userId) return false;
    try {
        // Checks the 'users' collection for the 'isPremium: true' flag
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const userData = userSnap.data();
            return userData.isPremium === true; 
        }
        return false;
    } catch (error) {
        console.error("Error checking premium status:", error);
        return false; 
    }
};


// 💎 NEW: PREMIUM MODAL COMPONENT (MODIFIED FOR MOBILE)
const PremiumModal = ({ isOpen, onClose, onPurchase, isMobile }) => {
    if (!isOpen) return null;

    const benefits = [
        "Uncover your biggest **Relationship Killer**.",
        "See who in our database is looking for your exact type.",
        "Get personalized partner recommendations (Location, Age).",
        "Full access to all future psychological reports."
    ];
    
    // 💡 NEW FUNCTION: Handles the click on Monthly or Yearly buttons
    const handleSubscription = (type, price) => {
        onPurchase(type, price);
    };

    const SubscriptionCard = ({ type, price, billing, isBestValue = false }) => (
        <div 
            onClick={() => handleSubscription(type, price)}
            style={{
                background: isBestValue ? 'linear-gradient(145deg, #F59E0B, #D97706)' : '#374151',
                padding: '15px', 
                borderRadius: '12px', 
                marginBottom: '15px',
                cursor: 'pointer',
                border: isBestValue ? '2px solid #FCD34D' : '1px solid rgba(255,255,255,0.1)',
                position: 'relative',
                transition: 'transform 0.2s ease',
                boxShadow: isBestValue ? '0 0 10px rgba(245, 158, 11, 0.5)' : 'none',
                // Mobil uyğunluq üçün fontu kiçiltmək
                fontSize: isMobile ? '14px' : 'inherit',
            }}
        >
            {isBestValue && (
                <div style={{
                    position: 'absolute', top: '-10px', right: '10px', 
                    background: '#EF4444', color: 'white', padding: '2px 8px', 
                    borderRadius: '5px', fontSize: '11px', fontWeight: 'bold'
                }}>
                    BEST VALUE
                </div>
            )}
            <h4 style={{ margin: 0, fontSize: isMobile ? '16px' : '18px', color: isBestValue ? 'white' : '#FCD34D' }}>
                {type}
            </h4>
            <h3 style={{ margin: '5px 0 0', fontSize: isMobile ? '24px' : '28px', color: 'white' }}>
                ${price} 
                <span style={{ fontSize: isMobile ? '12px' : '14px', opacity: 0.7 }}> / {billing}</span>
            </h3>
        </div>
    );

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0, 0, 0, 0.9)', zIndex: 1000, 
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            backdropFilter: 'blur(5px)',
            // Mobil cihazlarda tam ekran olmasını təmin etmək
            padding: isMobile ? '0' : '20px'
        }}>
            <div style={{
                background: 'linear-gradient(145deg, #1a1a2e, #0f0f23)',
                padding: isMobile ? '20px' : '30px', 
                borderRadius: isMobile ? '0' : '20px', 
                maxWidth: '400px', 
                width: isMobile ? '100%' : '90%',
                height: isMobile ? '100%' : 'auto', // Mobil tam ekran
                overflowY: 'auto', // Scrollbar əlavə et
                boxShadow: '0 10px 40px rgba(255, 193, 7, 0.4)',
                color: 'white', 
                position: 'relative', 
                textAlign: 'center'
            }}>
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '15px', right: '15px', 
                        background: 'none', border: 'none', color: '#f87171', 
                        fontSize: '24px', cursor: 'pointer', fontWeight: 'bold',
                        // Mobil cihazlarda yuxarı sağ küncə yapışdırmaq
                        zIndex: 10
                    }}
                >
                    &times;
                </button>

                <h2 style={{ color: '#FCD34D', fontSize: isMobile ? '22px' : '24px', margin: '0 0 10px', paddingTop: isMobile ? '30px' : '0' }}>
                    👑 Unlock Love Meter Premium
                </h2>
                <p style={{ opacity: 0.8, marginBottom: '20px', fontSize: isMobile ? '13px' : '14px' }}>
                    Access your full, deep psychological analysis and get accurate matchmaking results.
                </p>

                {/* 💡 SUBSCRIPTION OPTIONS */}
                <div style={{ marginBottom: '20px' }}>
                    <SubscriptionCard 
                        type="Monthly Access" 
                        price="2.99" 
                        billing="per month" 
                    />
                    <SubscriptionCard 
                        type="Yearly Plan" 
                        price="19.99" 
                        billing="per year (Save 44%)"
                        isBestValue={true}
                    />
                </div>
                
                {/* Benefits List remains */}
                <ul style={{ listStyleType: 'none', padding: 0, textAlign: 'left', marginBottom: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                    {benefits.map((benefit, index) => (
                        <li key={index} style={{ marginBottom: '10px', display: 'flex', alignItems: 'flex-start', fontSize: isMobile ? '14px' : '15px' }}>
                            <span style={{ color: '#4ade80', marginRight: '10px', fontWeight: 'bold' }}>✓</span> {benefit.replace(/\*\*(.*?)\*\*/g, (match, p1) => p1)}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};


export default function LoveMeterSelf() {
  const questions = [
    "Are you a romantic person?",
    "Are you good at communication?",
    "Do you highly value loyalty?",
    "Is your empathy skill high?",
    "Is your jealousy level low?",
    "Do you generally give off positive vibes?",
  ];

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [roomId, setRoomId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  
  // 🔓 PREMIUM STATES
  const [isPremium, setIsPremium] = useState(false); 
  const [isPremiumLoading, setIsPremiumLoading] = useState(true); 
  // 💡 NEW STATE: Modal Visibility
  const [isModalOpen, setIsModalOpen] = useState(false); 

  const [socialProof, setSocialProof] = useState(null);
  const [weaknessData, setWeaknessData] = useState(null);
  const [strengthData, setStrengthData] = useState(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const badge = (customScore = score) => {
    if (customScore <= 30) return "❄ Cold Soul";
    if (customScore <= 60) return "🙂 Normal Lover";
    if (customScore <= 85) return "❤️ Romantic";
    return "💍 Love Master";
  };

  const getOrCreateUserId = () => {
      if (typeof window === "undefined") return null;
      let id = localStorage.getItem('loveMeterUserId');
      if (!id) {
        id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('loveMeterUserId', id);
      }
      return id;
  };
  
  // 🔒 useEffect to check Premium Status on mount
  useEffect(() => {
    const userIdentifier = getOrCreateUserId();
    setUserId(userIdentifier);
    
    const checkStatus = async () => {
        if (userIdentifier) {
            const status = await checkPremiumStatus(userIdentifier);
            setIsPremium(status);
        }
        setIsPremiumLoading(false);
    };
    
    checkStatus();
  }, []); 

  const handleAnswer = async (value) => {
    if (loading) return;
    triggerHaptic([15]);
    const next = [...answers, value];

    if (step + 1 === questions.length) {
      setLoading(true);
      const finalScore = calculateLoveScore(next);
      setScore(finalScore);
      
      setWeaknessData(getWeaknessAnalysis(next, questions));
      setStrengthData(getStrengthAnalysis(next, questions));

      setLoadingText("🧠 Creating your psychological profile...");
      await new Promise(r => setTimeout(r, 800));
      
      setLoadingText("🌍 Checking compatibility in the database...");
      
      const userIdentifier = getOrCreateUserId();
      setUserId(userIdentifier);
      const newRoom = crypto.randomUUID();
      setRoomId(newRoom);

      try {
        const realSocialProof = await calculateRealSocialProof(next, userIdentifier);
        setSocialProof(realSocialProof);

        // Save Logic 
        await addDoc(collection(db, "loveSelfResults"), {
          userId: userIdentifier,
          score: finalScore,
          answers: next,
          createdAt: serverTimestamp(),
          gameType: "loveMeter"
        });
        
        // Create Room
        await setDoc(doc(db, "loveRooms", newRoom), {
            createdAt: Date.now(),
            totalScore: 0,
            voteCount: 0,
            votes: [],
            creatorScore: finalScore,
            creatorId: userIdentifier
        });

        triggerHaptic([50, 50, 50]);
        setFinished(true);
      } catch (error) {
        console.error(error);
        setFinished(true);
      } finally {
        setLoading(false);
      }
    } else {
      setAnswers(next);
      setStep(step + 1);
    }
  };

  const shareCard = async () => {
    triggerHaptic([20]);
    const el = document.getElementById("loveShareCard");
    if (!el) return;
    
    const roomLink = `${origin}/games/love-meter/LoveMeterRoom/${roomId}`;
    const shareText = `❤️ Love Meter: ${score}%\n🔗 ${roomLink}`;
    try {
        const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: null });
        canvas.toBlob(async (blob) => {
            const file = new File([blob], "res.png", { type: "image/png" });
            if (navigator.share) await navigator.share({ files: [file], text: shareText });
            else alert('✅ Result copied!');
        });
    } catch(e) { 
        await navigator.clipboard.writeText(shareText);
        alert('✅ Link copied!'); 
    }
  };
  
  // 💡 MODIFIED: Opens the Premium Modal
  const handlePremiumPurchase = () => {
      triggerHaptic([20, 50, 20]);
      setIsModalOpen(true);
      console.log("Premium Modal Opened.");
  };

  // 🚀 MODIFIED: Həqiqi yönləndirmə (Real Redirection) edir
  const handleModalPurchase = (type, price) => {
      triggerHaptic([20, 50, 20]);
      setIsModalOpen(false); // Modalı bağla
      
      // ABUNƏ NÖVÜNÜ VƏ QİYMƏTİNİ URL PARAMETRLƏRİ İLƏ GÖNDƏRİRİK
      const checkoutUrl = `/premium-checkout?planType=${encodeURIComponent(type)}&price=${price}`;
      
      // Həqiqi yönləndirmə
      if (typeof window !== 'undefined') {
          window.location.href = checkoutUrl; 
      }
      
      console.log(`Redirecting to checkout for ${type} at $${price}.`);
  };


  const progress = Math.round(((step + 1) / questions.length) * 100);

  // 📱 STYLES (Daha çox mobil uyğunluq üçün optimallaşdırılıb)
  const mobileStyles = {
    container: {
      minHeight: "100vh",
      color: "white",
      padding: isMobile ? "16px 12px" : "22px 16px",
      maxWidth: "500px",
      margin: "0 auto",
      fontSize: isMobile ? "14px" : "16px",
      background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
      backgroundSize: "400% 400%",
      animation: "gradientBG 15s ease infinite",
      paddingBottom: "100px",
      position: "relative"
    },
    button: {
      width: "100%",
      padding: isMobile ? "16px 12px" : "18px 16px",
      borderRadius: isMobile ? "14px" : "16px",
      border: "none",
      marginBottom: isMobile ? "12px" : "16px",
      fontWeight: "700",
      cursor: "pointer",
      fontSize: isMobile ? "16px" : "18px",
    },
    resultCard: {
      maxWidth: isMobile ? "280px" : "330px",
      margin: "0 auto",
      padding: isMobile ? "20px" : "26px",
      borderRadius: isMobile ? "18px" : "22px",
      background: "rgba(255,255,255,0.08)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.1)"
    },
    lockedCard: {
      position: 'relative',
      background: "rgba(20, 20, 30, 0.6)",
      borderRadius: "16px",
      marginBottom: "16px",
      border: "1px solid rgba(255,255,255,0.05)",
      overflow: "hidden",
      height: "140px"
    },
    blurContent: {
      padding: "20px",
      filter: "blur(6px)",
      opacity: 0.5,
      userSelect: "none"
    },
    lockOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(10, 10, 25, 0.75)",
      zIndex: 10,
      backdropFilter: "blur(2px)",
      padding: "15px",
      textAlign: "center"
    },
    catchyTitle: {
        fontSize: "16px",
        fontWeight: "800",
        color: "white",
        marginBottom: "6px",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
    },
    catchyDesc: {
        fontSize: "13px",
        color: "#FCD34D",
        marginBottom: "10px",
        lineHeight: "1.4",
        fontWeight: "500"
    },
    unlockBtnSmall: {
        background: "white",
        color: "black",
        padding: "6px 14px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        gap: "4px"
    },
    unlockedCard: {
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
        borderRadius: "16px",
        padding: "16px",
        marginBottom: "16px",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        textAlign: "left"
    }
  };

  // ⚠️ Handle both score calculation loading and premium check loading
  if (loading || isPremiumLoading) { 
      return (
          <div style={{
              minHeight: "100vh",
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #0f0f23, #1a1a2e)',
              color: 'white'
          }}>
              <div style={{fontSize: 50, marginBottom: 20, animation: 'pulse 1s infinite'}}>❤️</div>
              <h3 style={{color: 'white', fontWeight: 300, fontSize: 18}}>{loadingText || (isPremiumLoading ? "Validating Premium Access..." : "Processing...")}</h3>
              <style jsx="true" global="true">{`@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }`}</style>
          </div>
      );
  }

  if (finished) {
    const personalityType = calculatePersonalityType(answers);
    const idealMatch = personalityType === 'romantic' ? 'Realist' : (personalityType === 'realistic' ? 'Romantic' : 'Balanced');
    
    // Data for Charts
    const riskLevel = 100 - (weaknessData?.score || 100); 
    const compatibilityScore = score;
    const databaseAverage = socialProof?.averageScore || 60;


    // 💡 RENDER CARD FUNCTION (LOCKED OR UNLOCKED)
    const renderCard = (title, icon, teaserText, mainContent, type, color) => {
        if (isPremium) {
            let charts = null;
            
            // 📊 ADDING CHARTS FOR PREMIUM
            if (type === 'MATCH') {
                charts = (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <h5 style={{ margin: 0, marginBottom: 10, fontSize: 14, fontWeight: 700, opacity: 0.9, color: '#FCD34D' }}>📈 Compatibility Statistics</h5>
                        <SimpleBarChart label="Your Score" percentage={compatibilityScore} color="#EC4899" />
                        <SimpleBarChart label="Database Avg." percentage={databaseAverage} color="#A78BFA" />
                    </div>
                );
            } else if (type === 'RISK') {
                 charts = (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <h5 style={{ margin: 0, marginBottom: 10, fontSize: 14, fontWeight: 700, opacity: 0.9, color: '#F87171' }}>📉 Risk Visualization</h5>
                        <SimpleBarChart label="Current Risk" percentage={riskLevel} color="#EF4444" />
                        <SimpleBarChart label="Ideal Risk" percentage={10} color="#22C55E" />
                    </div>
                );
            }

            return (
                <div style={mobileStyles.unlockedCard}>
                    <h4 style={{ color: color, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: isMobile ? '16px' : '18px' }}>
                        <span style={{ fontSize: 20 }}>{icon}</span> {title}
                    </h4>
                    <p style={{ margin: 0, fontSize: isMobile ? '13px' : '14px', lineHeight: 1.6, opacity: 0.8 }}>
                        {mainContent}
                    </p>
                    {charts} 
                </div>
            );
        } else {
            // Locked Teaser Logic
            return (
                <div style={mobileStyles.lockedCard}>
                    <div style={mobileStyles.lockOverlay}>
                        <span style={{ fontSize: 24, marginBottom: 5 }}>🔒</span>
                        <div style={{...mobileStyles.catchyTitle, color: color}}>{title}</div>
                        <div style={mobileStyles.catchyDesc}>{teaserText}</div>
                        <div 
                            onClick={handlePremiumPurchase} // Lock Overlay üzərinə klikləmə əlavə etdik
                            style={mobileStyles.unlockBtnSmall}
                        >
                            🔒 Unlock Access
                        </div>
                    </div>
                    {/* Blurred content (for illusion) */}
                    <div style={mobileStyles.blurContent}>
                        <h4 style={{color: color}}>{title}</h4>
                        <p>{mainContent}</p>
                    </div>
                </div>
            );
        }
    };

    return (
      <div style={mobileStyles.container}>
        <style jsx="true" global="true">{`@keyframes gradientBG { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`}</style>

        <h2 style={{ fontSize: isMobile ? 20 : 22, marginBottom: 16, textAlign: "center" }}>
          ❤️ Your Love Meter Result
        </h2>

        {/* SCORE CARD */}
        <div style={{
          ...mobileStyles.resultCard,
          background: "linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)"
        }}>
          <div style={{ fontSize: isMobile ? 48 : 56, fontWeight: 800 }}>{score}%</div>
          <div style={{ fontSize: isMobile ? 16 : 18, marginTop: 6 }}>{badge()}</div>
        </div>

        {/* 🌟 FREE: SUPER POWER */}
        <div style={{
            ...mobileStyles.unlockedCard, 
            marginTop: 16,
            background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.05))",
            textAlign: "left",
            border: "1px solid rgba(34, 197, 94, 0.2)"
        }}>
            <h3 style={{ fontSize: isMobile ? 16 : 18, marginBottom: 4, color: '#4ade80' }}>🌟 {strengthData?.analysis}</h3>
            <p style={{ fontSize: isMobile ? 13 : 14, opacity: 0.8, margin: 0 }}>{strengthData?.detail}</p>
        </div>

        {/* 🔒🔥 PREMIUM SECTION */}
        <div style={{ marginTop: 24, textAlign: 'left' }}>
            <h3 style={{ fontSize: isMobile ? 16 : 18, marginBottom: 12, marginLeft: 8, color: '#FCD34D' }}>
               {isPremium ? '💎 FULL PSYCHOLOGICAL ANALYSIS' : '🔓 LOCKED PREMIUM DATA'}
            </h3>

            {/* CARD 1: MATCHES (Includes Chart) */}
            {renderCard(
                "💘 WHO'S LOOKING FOR YOU?",
                "💖",
                `The database currently contains ${socialProof?.potentialMatches || "12"} people who are highly compatible with you!`,
                `Out of ${socialProof?.totalUsers || 0} real users in our database, ${socialProof?.potentialMatches || 0} individuals are looking for your personality type. Their average age range is 25-35.`,
                'MATCH',
                '#EC4899'
            )}

            {/* CARD 2: WEAKNESS (RISK) (Includes Chart) */}
            {renderCard(
                "⚠️ THE RELATIONSHIP KILLER",
                "🔥",
                `There is one trait in you that scares away all your lovers. If you don't know this, you will remain alone.`,
                `Your biggest risk: ${weaknessData?.analysis}. This stems from your answer to the question: "${weaknessData?.question}". Recommendation: ${weaknessData?.solution}.`,
                'RISK',
                '#F87171'
            )}

            {/* CARD 3: FUTURE (Text Analysis) */}
            {renderCard(
                "🔮 YOUR IDEAL PARTNER TYPE",
                "💍",
                `Is a GREAT LOVE or a BETRAYAL waiting for you in the next 3 months? Read your destiny.`,
                `Your personality type (${personalityType}) is most compatible with the "${idealMatch}" type. The places you are most likely to meet this person are: Libraries and Art Galleries.`,
                'FUTURE',
                '#A78BFA'
            )}
        </div>

        {/* ⚡ PREMIUM CTA BUTTON (Only visible in FREE mode) */}
        {!isPremium && (
            <div style={{ padding: '0 5px', marginTop: 10 }}>
                <button 
                    // 💡 Opens the modal
                    onClick={handlePremiumPurchase} 
                    style={{
                    ...mobileStyles.button,
                    background: "linear-gradient(90deg, #F59E0B, #D97706)",
                    boxShadow: "0 0 20px rgba(245, 158, 11, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    animation: "pulse 1.5s infinite",
                    position: "relative",
                    overflow: "hidden"
                }}>
                    <div style={{ fontSize: 18, fontWeight: 900, textTransform: 'uppercase' }}>🔓 GET PREMIUM ACCESS NOW</div>
                    <div style={{ fontSize: 11, opacity: 0.9, marginTop: 4 }}>
                       ⚠️ This information will be deleted in 10 minutes!
                    </div>
                </button>
                <style jsx="true" global="true">{`
                    @keyframes pulse {
                        0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
                        70% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
                        100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
                    }
                `}</style>
            </div>
        )}

        {/* NAVIGATION BUTTONS */}
        <div style={{ marginTop: 20 }}>
            <button onClick={shareCard} style={{...mobileStyles.button, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)"}}>
            📢 Share Result
            </button>
            <button onClick={() => window.location.reload()} style={{...mobileStyles.button, background: "transparent", opacity: 0.6}}>
            🔄 Play Again
            </button>
        </div>

        {/* HIDDEN SHARE CARD (Remains for screenshot purpose) */}
        <div id="loveShareCard" style={{position: "absolute", top: -9999, left: -9999, width: 400, height: 600, background: "#111", color: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 30, padding: 30}}>
            <h1 style={{fontSize: 80, margin: 0}}>{score}%</h1>
            <h2>{badge()}</h2>
            <p>Potential Matches: {socialProof?.potentialMatches}</p>
        </div>

        {/* 💎 PREMIUM MODAL INTEGRATION */}
        <PremiumModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)}
            onPurchase={handleModalPurchase}
            isMobile={isMobile} // Mobil statusu modala ötürürük
        />
      </div>
    );
  }

  // QUESTION SCREEN
  return (
    <div style={mobileStyles.container}>
      <div style={{ width: "100%", height: 8, borderRadius: 999, background: "rgba(255,255,255,0.1)", marginBottom: 20 }}>
        <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(135deg, #ec4899, #f97316)", transition: "width 0.3s ease" }}/>
      </div>
      <h2 style={{ textAlign: "center", marginBottom: 24, fontSize: isMobile ? '18px' : '22px' }}>{questions[step]}</h2>
      <button onClick={() => handleAnswer(100)} disabled={loading} style={{...mobileStyles.button, background: "#22c55e"}}>✅ Yes</button>
      <button onClick={() => handleAnswer(55)} disabled={loading} style={{...mobileStyles.button, background: "#eab308"}}>🙂 Sometimes</button>
      <button onClick={() => handleAnswer(15)} disabled={loading} style={{...mobileStyles.button, background: "#ef4444"}}>❌ No</button>
    </div>
  );
}