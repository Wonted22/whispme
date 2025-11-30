import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  addDoc,
} from "firebase/firestore";
import { db } from "../../../firebase";

// Ses dosyalarını import et
import heartbeatSound from "./sounds/heartbeat.mp3";
import tickSound from "./sounds/tick.mp3";

// --- SABİTLER ---
const REACTION_EMOJIS = ["🔥", "😂", "❤️", "😲", "🤡"];

// Soru şablonları
const TASK_TEMPLATES_HOST_SELF = [
  "Kendin hakkında en doğru düşündüğün şey nedir?",
  "Kendini 3 kelimeyle nasıl tarif edersin?",
  "Seninle ilgili kimsenin bilmediği bir şey nedir?",
  "Kendi en komik özelliğin nedir?",
  "Kendini 1-10 arası nasıl puanlarsın ve neden?",
];

const TASK_TEMPLATES_ABOUT_HOST = [
  "{host} hakkında en doğru düşündüğün şey nedir?",
  "{host}'u 3 kelimeyle nasıl tarif edersin?",
  "{host} ile ilgili kimsenin bilmediği bir şeyi söyle.",
  "{host} ile yaşadığın en komik anıyı anlat.",
  "{host}'u 1-10 arası puanla ve sebebini açıkla.",
];

const TASK_TEMPLATES_DARK_HOST_SELF = [
  "Kendinle ilgili kimseye söyleyemediğin en dürüst düşüncen nedir?",
  "Kendin hakkında en çok neyi gizliyorsun?",
  "Geçmişte yaptığın ve pişman olduğun bir şey nedir?",
];

const TASK_TEMPLATES_DARK_ABOUT_HOST = [
  "{host} ile ilgili kimseye söyleyemediğin en dürüst düşüncen nedir?",
  "{host} sence kimi daha çok seviyor? Açık ol.",
  "{host} ile yaşamak isteyip de anlatmadığın bir anıyı yaz.",
];

const INVITE_MESSAGE_TEMPLATE = (roomId, hostHandle) =>
  `Oyun seni çağırıyor! ${hostHandle ? "@" + hostHandle : "anonim host"}, seni **Neon Çark Odası (${roomId})** oyununa davet ediyor. Hemen katıl ve çarkı çevir!`;

function getOrCreateAnonId() {
  if (typeof window === "undefined") return "anon_guest";
  const key = "whispme_anon_id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const id = "anon_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  localStorage.setItem(key, id);
  return id;
}

function shortTag(id) {
  if (!id) return "";
  return "@" + id.slice(-4);
}

function getRoomUrl(roomId) {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/games/wheel/room/${roomId}`;
}

function analyzeAnswerText(text) {
  const lower = (text || "").toLowerCase();
  const pos = ["iyi", "harika", "seviyorum", "güzel", "tatlı", "mutlu", "kral", "dost", "candır", "mükemmel"]; 
  const neg = ["kötü", "nefret", "sinir", "soğuk", "gıcık", "üzücü", "iğrenç", "saçma", "bencil", "yapmacık"]; 
  let score = 0;
  pos.forEach((w) => lower.includes(w) && score++);
  neg.forEach((w) => lower.includes(w) && score--);
  if (score >= 2) return "Pozitif";
  if (score <= -1) return "Sert";
  return "Nötr";
}

// Optimize edilmiş ses çalma fonksiyonu
const playAudioSafely = (audioRef, soundFile, volume = 0.3) => {
  if (!audioRef.current) {
    try {
      const audio = new Audio(soundFile);
      audio.volume = volume;
      audioRef.current = audio;
    } catch (e) {
      console.error("Ses oluşturulamadı:", e);
      return;
    }
  }

  const audio = audioRef.current;
  
  try {
    audio.pause();
    audio.currentTime = 0;
    
    setTimeout(() => {
      audio.play().catch(error => {
        if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
          console.log("Ses oynatma hatası:", error.name);
        }
      });
    }, 10);
  } catch (error) {
    console.log("Ses işleme hatası:", error.name);
  }
};

// Davet Modal Bileşeni
const InviteModal = ({ 
  inviteOpen, 
  setInviteOpen, 
  inviteLoading, 
  inviteSenders, 
  invites, 
  room, 
  sendingInvite, 
  sendInvite, 
  cancelInvite 
}) => {
  if (!inviteOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 16
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        padding: 20,
        borderRadius: 16,
        border: '1px solid #334155',
        maxWidth: 400,
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: 'white', margin: 0, fontSize: 18 }}>Whispleştiğin Kişileri Davet Et</h3>
          <button 
            onClick={() => setInviteOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: 20,
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {inviteLoading ? (
          <div style={{ color: 'white', textAlign: 'center', padding: 20 }}>
            Yükleniyor...
          </div>
        ) : inviteSenders.length === 0 ? (
          <div style={{ color: '#94a3b8', textAlign: 'center', padding: 20 }}>
            Henüz kimseyle whispleşmemişsin.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {inviteSenders.map((senderId) => {
              const alreadyInvited = invites.find(inv => 
                inv.receiverAnonId === senderId && inv.status !== 'cancelled'
              );
              const isInRoom = room.players?.includes(senderId) || senderId === room.hostAnonId;

              return (
                <div key={senderId} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 12,
                  background: 'rgba(30, 41, 59, 0.5)',
                  borderRadius: 8,
                  border: '1px solid #334155'
                }}>
                  <span style={{ color: 'white', fontSize: 14 }}>
                    {shortTag(senderId)}
                    {isInRoom && <span style={{ color: '#22c55e', marginLeft: 8 }}>✓ Zaten odada</span>}
                  </span>
                  
                  {!isInRoom && (
                    <button
                      onClick={() => alreadyInvited ? 
                        cancelInvite(senderId, alreadyInvited.id) : 
                        sendInvite(senderId)
                      }
                      disabled={sendingInvite[senderId]}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 999,
                        border: 'none',
                        background: alreadyInvited ? 
                          'linear-gradient(135deg, #ef4444, #dc2626)' : 
                          'linear-gradient(135deg, #22c55e, #16a34a)',
                        color: 'white',
                        fontSize: 12,
                        cursor: sendingInvite[senderId] ? 'not-allowed' : 'pointer',
                        opacity: sendingInvite[senderId] ? 0.6 : 1
                      }}
                    >
                      {sendingInvite[senderId] ? '...' : alreadyInvited ? 'İptal Et' : 'Davet Et'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ANA BİLEŞEN
export default function WheelRoom() {
  const { roomId } = useParams();
  const anonId = getOrCreateAnonId();

  const timerIntervalRef = useRef(null); 
  const answerTimeoutRef = useRef(null); 
  const heartbeatAudioRef = useRef(null);
  const tickAudioRef = useRef(null); 
  const finalRotationRef = useRef(0); 
  

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  const [localTask, setLocalTask] = useState("");
  const [isSpinning, setIsSpinning] = useState(false); 
  const [wheelRotation, setWheelRotation] = useState(0); 

  const [answer, setAnswer] = useState("");
  const [sendingAnswer, setSendingAnswer] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  
  const [isCriticalTime, setIsCriticalTime] = useState(false); 
  const [isWarningTime, setIsWarningTime] = useState(false); 

  const [customQuestion, setCustomQuestion] = useState(""); 
  const [timeLeft, setTimeLeft] = useState(0); 
  const [autoSpinLeft, setAutoSpinLeft] = useState(null); 

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSenders, setInviteSenders] = useState([]);

  const [invites, setInvites] = useState([]); 
  const [sendingInvite, setSendingInvite] = useState({}); 

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);

  const [answerToast, setAnswerToast] = useState(null);

  const [isHeartbeatPlaying, setIsHeartbeatPlaying] = useState(false);

  // Responsive state
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const wheelSize = isMobile ? Math.min(280, windowWidth - 40) : 320;
  const center = wheelSize / 2;
  const radius = wheelSize * 0.4;

  // Oyuncu Listesi
  const getPlayerList = useCallback((room) => {
    if (!room) return [];
    const list = [...(room.players || [])];
    if (room.hostAnonId && !list.includes(room.hostAnonId)) {
      list.push(room.hostAnonId);
    }
    if (list.includes(anonId)) {
      return list;
    }
    list.push(anonId);
    return list;
  }, [anonId]);
  
  // Çarkın dönme açısını hesaplayan FONKSİYON - DÜZELTİLDİ
  const calculateWheelRotation = useCallback((room, targetAnonId) => {
    if (!targetAnonId) return finalRotationRef.current; 

    const fullPlayerList = getPlayerList(room);
    const sortedPlayerList = [...new Set(fullPlayerList)].sort(); 
    
    const targetIndex = sortedPlayerList.findIndex(id => id === targetAnonId);
    if (targetIndex === -1) return finalRotationRef.current; 

    const numPlayers = sortedPlayerList.length;
    const segmentAngle = 360 / numPlayers;
    
    // İBRE SABİT - ÇARK DÖNECEK
    // İbrenin pozisyonu (üst orta - 12 o'clock pozisyonu)
    const pointerPosition = -90; // Üst orta (12 o'clock)
    
    // Hedef segmentin merkez açısı
    const targetSegmentCenterAngle = (targetIndex * segmentAngle) + (segmentAngle / 2);
    
    // Çarkı döndürerek hedef segmenti ibrenin altına getir
    // 3 tam tur + hedef segmentin ibrenin altına gelmesi için gerekli açı
    const extraSpins = 360 * 5; // 5 tam tur ekstra dönüş
    const rotationNeeded = extraSpins + (360 - targetSegmentCenterAngle + pointerPosition);
    
    finalRotationRef.current = rotationNeeded;
    return rotationNeeded;
  }, [getPlayerList]);

  // Odayı dinle
  useEffect(() => {
    const ref = doc(db, "rooms", roomId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setRoom(data);

          if (data.currentTask && data.currentTask !== localTask) {
            setLocalTask(data.currentTask);
            
            setIsSpinning(true);
            
            const newRotation = calculateWheelRotation(data, data.selectedAnonId);
            setWheelRotation(newRotation); 
            
            setTimeout(() => {
              setIsSpinning(false);
            }, 4000);
            
            setHasAnswered(false);
            setAnswer("");

            if (answerTimeoutRef.current) {
                clearTimeout(answerTimeoutRef.current);
                setAnswerToast(null);
            }
          }

          if (data.answers && data.answers.length > 0) {
            const lastAnswer = data.answers[data.answers.length - 1];
            if (lastAnswer.anonId !== anonId && !hasAnswered) {
              setHasAnswered(true);
            }
          }
        } else {
          setRoom(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Oda dinlenirken hata:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [roomId, localTask, calculateWheelRotation, anonId, hasAnswered]);

  // Ses kontrol efekti
  useEffect(() => {
    if (isHeartbeatPlaying && tickAudioRef.current) {
      tickAudioRef.current.pause();
      tickAudioRef.current.currentTime = 0;
    }
  }, [isHeartbeatPlaying]);

  // Zamanlayıcılar
  useEffect(() => {
    if (!room) return;

    if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
    }

    let prevTimeLeft = timeLeft;

    const interval = setInterval(() => {
        const now = Date.now();
        let shouldPlayHeartbeat = false;

        if (room.autoSpinEnabled && room.nextAutoSpinAt) {
            const diff = Math.floor((room.nextAutoSpinAt - now) / 1000);
            if (diff <= 0) {
                if (room.hostAnonId === anonId && !isSpinning) {
                    spinWheel(true);
                }
                setAutoSpinLeft(0);
            } else {
                setAutoSpinLeft(diff);
            }
        } else {
            setAutoSpinLeft(null);
        }

        if (room.questionCreatedAt && room.currentTask) {
            const qDiff = Math.floor((60000 - (now - room.questionCreatedAt)) / 1000);
            const newTimeLeft = qDiff > 0 ? qDiff : 0;
            
            if (newTimeLeft > 0 && newTimeLeft !== prevTimeLeft && !isHeartbeatPlaying) {
                playAudioSafely(tickAudioRef, tickSound, 0.3);
            }
            prevTimeLeft = newTimeLeft;
            
            setTimeLeft(newTimeLeft);
            
            const isNowCritical = newTimeLeft > 0 && newTimeLeft <= 10;
            const isNowWarning = newTimeLeft > 10 && newTimeLeft <= 20;
            
            setIsCriticalTime(isNowCritical);
            setIsWarningTime(isNowWarning);
            
            if (room.selectedAnonId === anonId && isNowCritical) {
              shouldPlayHeartbeat = true;
            }

            if (newTimeLeft <= 0 && room.hostAnonId === anonId && room.currentTask) {
                if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                resetRound();
            }
        } else {
            setTimeLeft(0);
            setIsCriticalTime(false);
            setIsWarningTime(false);
        }
        
        if (shouldPlayHeartbeat) {
          if (!isHeartbeatPlaying) {
            setIsHeartbeatPlaying(true);
            playAudioSafely(heartbeatAudioRef, heartbeatSound, 0.5);
          }
        } else if (isHeartbeatPlaying) {
          setIsHeartbeatPlaying(false);
          if (heartbeatAudioRef.current) {
            heartbeatAudioRef.current.pause();
            heartbeatAudioRef.current.currentTime = 0;
          }
        }

    }, 1000);
    
    timerIntervalRef.current = interval;

    return () => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }
        if (answerTimeoutRef.current) {
            clearTimeout(answerTimeoutRef.current);
        }
        if (heartbeatAudioRef.current) {
          heartbeatAudioRef.current.pause();
          heartbeatAudioRef.current.currentTime = 0;
        }
        if (tickAudioRef.current) {
          tickAudioRef.current.pause();
          tickAudioRef.current.currentTime = 0;
        }
        setIsHeartbeatPlaying(false);
    };
  }, [room, anonId, hasAnswered, timeLeft, isHeartbeatPlaying]); 

  // Odaya özel davetleri dinle
  useEffect(() => {
    const invitesRef = collection(db, "rooms", roomId, "invites");
    const unsub = onSnapshot(invitesRef, (snap) => {
      const inv = [];
      snap.forEach((d) => inv.push({ id: d.id, ...d.data() }));
      setInvites(inv);
    });
    return () => unsub();
  }, [roomId]);

  // Oda sohbetini dinle
 // Odayı dinle - CEVAPLAR İÇİN DÜZELTİLDİ
useEffect(() => {
  const ref = doc(db, "rooms", roomId);
  const unsub = onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        console.log("Oda güncellendi, cevaplar:", data.answers); // Debug için
        setRoom(data);

        if (data.currentTask && data.currentTask !== localTask) {
          setLocalTask(data.currentTask);
          
          setIsSpinning(true);
          
          const newRotation = calculateWheelRotation(data, data.selectedAnonId);
          setWheelRotation(newRotation); 
          
          setTimeout(() => {
            setIsSpinning(false);
          }, 4000);
          
          setHasAnswered(false);
          setAnswer("");

          if (answerTimeoutRef.current) {
              clearTimeout(answerTimeoutRef.current);
              setAnswerToast(null);
          }
        }

        // CEVAPLARI KONTROL ET - DÜZELTİLDİ
        if (data.answers && data.answers.length > 0) {
          const userAnswer = data.answers.find(answer => answer.anonId === anonId);
          if (userAnswer && room.currentTask) {
            setHasAnswered(true);
          }
        }
      } else {
        setRoom(null);
      }
      setLoading(false);
    },
    (err) => {
      console.error("Oda dinlenirken hata:", err);
      setLoading(false);
    }
  );
  return () => unsub();
}, [roomId, localTask, calculateWheelRotation, anonId]);
  // Whispleştiğin kişileri getiren fonksiyon
  const openInviteModal = async () => {
    if (!room?.hostAnonId) return;
    
    try {
      setInviteLoading(true);
      
      const messagesRef = collection(db, "messages");
      const messagesQuery = query(
        messagesRef,
        where("senderAnonId", "==", room.hostAnonId)
      );
      
      const snap = await getDocs(messagesQuery);
      const uniqueReceivers = new Set();
      
      snap.forEach((doc) => {
        const messageData = doc.data();
        if (messageData.receiverAnonId && messageData.receiverAnonId !== room.hostAnonId) {
          uniqueReceivers.add(messageData.receiverAnonId);
        }
      });

      const receivedMessagesQuery = query(
        messagesRef,
        where("receiverAnonId", "==", room.hostAnonId)
      );
      
      const receivedSnap = await getDocs(receivedMessagesQuery);
      receivedSnap.forEach((doc) => {
        const messageData = doc.data();
        if (messageData.senderAnonId && messageData.senderAnonId !== room.hostAnonId) {
          uniqueReceivers.add(messageData.senderAnonId);
        }
      });

      setInviteSenders(Array.from(uniqueReceivers));
      setInviteOpen(true);
      
    } catch (err) {
      console.error("Davet listesi alınırken hata:", err);
    } finally {
      setInviteLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!room || isInRoom) return;
    if (players.length >= maxPlayers) { alert("Oda dolu."); return; }
    await updateDoc(doc(db, "rooms", roomId), { players: arrayUnion(anonId) });
  };

  const toggleAutoSpin = async () => {
      if (!isHost) return;
      const newState = !autoSpinEnabled;
      await updateDoc(doc(db, "rooms", roomId), {
          autoSpinEnabled: newState,
          nextAutoSpinAt: newState ? Date.now() + 60000 : null 
      });
  };

  // Çarkı çevir fonksiyonu
  const spinWheel = async (isAuto = false) => {
    if (!isHost) return;
    const allPlayers = getPlayerList(room);
    if (allPlayers.length === 0) { if(!isAuto) alert("Oyuncu yok."); return; }

    // Tüm oyunculara eşit şans ver
    const targetAnonId = allPlayers[Math.floor(Math.random() * allPlayers.length)];

    let question = "";
    if (customQuestion.trim()) {
        question = customQuestion.trim();
    } else {
        const isHostSelected = targetAnonId === room.hostAnonId;
        
        let templates;
        if (questionMode === "dark") {
          templates = isHostSelected ? TASK_TEMPLATES_DARK_HOST_SELF : TASK_TEMPLATES_DARK_ABOUT_HOST;
        } else {
          templates = isHostSelected ? TASK_TEMPLATES_HOST_SELF : TASK_TEMPLATES_ABOUT_HOST;
        }
        
        const template = templates[Math.floor(Math.random() * templates.length)];
        
        if (isHostSelected) {
          question = template;
        } else {
          question = template.replace("{host}", shortTag(room.hostAnonId));
        }
    }

    await updateDoc(doc(db, "rooms", roomId), {
        currentTask: question,
        selectedAnonId: targetAnonId,
        questionCreatedAt: Date.now(),
        status: "active",
        nextAutoSpinAt: autoSpinEnabled ? Date.now() + 60000 : null 
    });

    setCustomQuestion(""); 
  };

  // Cevap gönderme fonksiyonu
 // Cevap gönderme fonksiyonu - DÜZELTİLDİ
const sendAnswer = async () => {
  if (!canAnswer) return; 
  const text = answer.trim();
  if (!text) return;
  
  setSendingAnswer(true);
  const vibe = analyzeAnswerText(text);
  
  const newAnswer = {
    anonId: anonId,
    text: text,
    task: room.currentTask,
    vibe: vibe,
    createdAt: Date.now(),
    reactions: {},
  };

  try {
    // Mevcut cevapları al ve yeni cevabı ekle
    const currentAnswers = room.answers || [];
    const updatedAnswers = [...currentAnswers, newAnswer];

    await updateDoc(doc(db, "rooms", roomId), {
        answers: updatedAnswers, // arrayUnion yerine direkt array kullan
        currentTask: null,
        selectedAnonId: null,
        status: "waiting"
    });

    setHasAnswered(true);
    setAnswer("");
    
    setAnswerToast({
      title: vibe === "Pozitif" ? "Gönülleri Fethettin!" : vibe === "Sert" ? "Cesur Bir İtiraftı!" : "Dürüstlükten Şaşmadın!",
      text: text,
      vibe: vibe,
    });
    
    answerTimeoutRef.current = setTimeout(() => {
      setAnswerToast(null);
    }, 5000);
  } catch (error) {
    console.error("Cevap gönderilirken hata:", error);
  } finally {
    setSendingAnswer(false);
  }
};

  const addReaction = async (ansIndex, emoji) => {
      const newAnswers = [...answers];
      if(!newAnswers[ansIndex].reactions) newAnswers[ansIndex].reactions = {};
      newAnswers[ansIndex].reactions[emoji] = (newAnswers[ansIndex].reactions[emoji] || 0) + 1;
      await updateDoc(doc(db, "rooms", roomId), { answers: newAnswers });
  };

  const shareRoom = async () => {
    const url = getRoomUrl(roomId);
    const text = `Neon Çark oyunuma katıl: ${url}`;
    try {
      if (navigator.share) await navigator.share({ title: "WhispMe Neon Çark", text, url });
      else { await navigator.clipboard.writeText(text); alert("Kopyalandı!"); }
    } catch (err) {}
  };

  // Davet gönderme fonksiyonu
  const sendInvite = async (receiverAnonId) => {
      if (!isHost || !hostAnonId) return;
      setSendingInvite(prev => ({ ...prev, [receiverAnonId]: true }));
      try {
          const messageText = INVITE_MESSAGE_TEMPLATE(roomId, hostHandle);
          
          const newInviteRef = await addDoc(collection(db, "rooms", roomId, "invites"), {
              hostAnonId: hostAnonId,
              receiverAnonId: receiverAnonId,
              createdAt: Date.now(),
              status: 'pending'
          });

          await addDoc(collection(db, "messages"), {
              senderAnonId: hostAnonId, 
              receiverAnonId: receiverAnonId, 
              text: messageText,
              linkId: receiverAnonId, 
              roomInviteId: roomId, 
              inviteDocId: newInviteRef.id, 
              createdAt: Date.now(),
              type: 'room_invite'
          });
          
      } catch (err) {
          console.error("Davet gönderilirken hata:", err);
      } finally {
          setSendingInvite(prev => ({ ...prev, [receiverAnonId]: false }));
      }
  };

  // Davet iptal fonksiyonu
  const cancelInvite = async (receiverAnonId, inviteDocId) => {
      if (!isHost) return;
      setSendingInvite(prev => ({ ...prev, [receiverAnonId]: true }));
      try {
          const inviteRef = doc(db, "rooms", roomId, "invites", inviteDocId);
          await updateDoc(inviteRef, { 
            status: "cancelled", 
            cancelledAt: Date.now() 
          }); 
      } catch (err) {
          console.error("Davet iptal edilirken hata:", err);
      } finally {
          setSendingInvite(prev => ({ ...prev, [receiverAnonId]: false }));
      }
  };

  const resetRound = async () => {
    if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; }
    if (answerTimeoutRef.current) { clearTimeout(answerTimeoutRef.current); answerTimeoutRef.current = null; setAnswerToast(null); }
    if (heartbeatAudioRef.current) { heartbeatAudioRef.current.pause(); heartbeatAudioRef.current.currentTime = 0; }
    if (tickAudioRef.current) { tickAudioRef.current.pause(); tickAudioRef.current.currentTime = 0; }

    setIsCriticalTime(false); 
    setIsWarningTime(false); 
    setIsHeartbeatPlaying(false);
    setLocalTask(null);

    await updateDoc(doc(db, "rooms", roomId), { currentTask: null, selectedAnonId: null, status: "waiting" });
  };

  const clearAnswers = async () => { await updateDoc(doc(db, "rooms", roomId), { answers: [] }); };
  const closeRoom = async () => { await updateDoc(doc(db, "rooms", roomId), { status: "closed" }); };
  const changeQuestionMode = async (mode) => { await updateDoc(doc(db, "rooms", roomId), { questionMode: mode }); };
  const kickPlayer = async (id) => { if (!isHost) return; await updateDoc(doc(db, "rooms", roomId), { players: arrayRemove(id) }); };

  const sendChatMessage = async () => {
    const text = chatInput.trim();
    if (!text) return;
    setChatSending(true);
    await addDoc(collection(db, "rooms", roomId, "messages"), { anonId, text, createdAt: Date.now() });
    setChatInput("");
    setChatSending(false);
  };

  // Çark üzerindeki oyuncu etiketlerini gösteren fonksiyon - DÜZELTİLDİ
  const renderPlayerTagsAroundWheel = useCallback(() => {
    if (!room) return null;
    
    const fullPlayerList = getPlayerList(room);
    const sortedPlayerList = [...new Set(fullPlayerList)].sort();

    if (sortedPlayerList.length === 0) return null;
    
    const numPlayers = sortedPlayerList.length;
    const currentRotation = isSpinning ? wheelRotation : finalRotationRef.current;
    const adjustedRotation = currentRotation % 360;

    return sortedPlayerList.map((id, index) => {
      // Segment merkez açısı (çarkın orijinal pozisyonuna göre)
      const segmentCenterAngle = (360 * index) / numPlayers;
      
      // Çarkın dönüşünü hesaba katarak gerçek pozisyon
      const actualAngle = segmentCenterAngle - adjustedRotation;
      const radian = (actualAngle * Math.PI) / 180;
      
      const x = center + radius * Math.cos(radian);
      const y = center + radius * Math.sin(radian);
      
      const isSelected = id === (room.selectedAnonId || null);
      
      return (
        <div key={id} style={{
            position: "absolute", 
            left: x, 
            top: y, 
            transform: "translate(-50%, -50%)",
            padding: isMobile ? "3px 8px" : "4px 10px", 
            borderRadius: 999, 
            fontSize: isMobile ? 10 : 11,
            background: isSelected ? "rgba(250,204,21,0.95)" : "rgba(15,23,42,0.95)",
            color: "white", 
            border: isSelected ? "1px solid rgba(248,250,252,0.9)" : "1px solid rgba(148,163,184,0.5)",
            boxShadow: isSelected ? "0 0 16px rgba(250,204,21,0.9)" : "0 4px 12px rgba(0,0,0,0.7)",
            whiteSpace: "nowrap",
            zIndex: 10,
          }}>
          {id === anonId ? "Sen" : shortTag(id)}
          {id === room.hostAnonId ? " 👑" : ""}
        </div>
      );
    });
  }, [room, anonId, isMobile, center, radius, getPlayerList, isSpinning, wheelRotation]);

  if (loading) return (
    <div style={{ 
      minHeight: "100vh", 
      color: "white", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "linear-gradient(135deg, #0f172a, #1e293b)"
    }}>
      <p>Yükleniyor...</p>
    </div>
  );
  
  if (!room) return (
    <div style={{ 
      minHeight: "100vh", 
      color: "white", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "linear-gradient(135deg, #0f172a, #1e293b)"
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2>Oda Bulunamadı 😢</h2>
        <Link to="/games" style={{ color: '#60a5fa' }}>Ana Menüye Dön</Link>
      </div>
    </div>
  );

  // Değişkenleri room'dan sonra tanımla
  const players = room.players || [];
  const maxPlayers = room.maxPlayers || 5;
  const hostAnonId = room.hostAnonId;
  const hostHandle = room.hostHandle || null;
  const isHost = hostAnonId === anonId;
  const isInRoom = isHost || players.includes(anonId);
  const selectedAnonId = room.selectedAnonId || null;
  const canAnswer = selectedAnonId === anonId && !!room.currentTask && timeLeft > 0 && !hasAnswered; 
  const questionMode = room.questionMode || "normal";
  const answers = room.answers || [];
  const autoSpinEnabled = room.autoSpinEnabled || false;

  // Çarkın ortasındaki yazı
  const getWheelCenterText = () => {
    if (room.currentTask) {
      return "🎯";
    }
    return isSpinning ? "..." : "🎡";
  };

  const getTimerColor = () => {
      if (isCriticalTime && selectedAnonId === anonId) return '#ef4444';
      if (isWarningTime && selectedAnonId === anonId) return '#facc15';
      return '#22c55e';
  }
  const timerColor = getTimerColor();

  return (
    <div style={{ 
      minHeight: "100vh", 
      color: "white", 
      paddingBottom: 80,
      background: "linear-gradient(135deg, #0f172a, #1e293b)",
      padding: isMobile ? 12 : 16
    }}>
      
      {/* Toast Bildirimi */}
      {answerToast && (
        <div style={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'linear-gradient(135deg, #1e0a3c, #0f172a)',
          padding: 16,
          borderRadius: 16,
          border: '2px solid #fff',
          boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
          minWidth: isMobile ? 280 : 320,
          maxWidth: '90vw',
          textAlign: 'center'
        }}>
          <h4 style={{ margin: 0, fontSize: isMobile ? 16 : 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{fontSize: isMobile ? 20 : 24}}>
              {answerToast.vibe === "Pozitif" ? "🥳" : answerToast.vibe === "Sert" ? "🌶️" : "🤫"}
            </span> 
            {answerToast.title}
          </h4> 
          <p style={{ margin: 0, fontSize: isMobile ? 12 : 14, opacity: 1, marginTop: 8, padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.1)' }}>
            <span style={{fontWeight:'bold'}}>Cevabınız:</span> {answerToast.text}
          </p>
        </div>
      )}
      
      {/* Davet Modalı */}
      <InviteModal 
        inviteOpen={inviteOpen}
        setInviteOpen={setInviteOpen}
        inviteLoading={inviteLoading}
        inviteSenders={inviteSenders}
        invites={invites}
        room={room}
        sendingInvite={sendingInvite}
        sendInvite={sendInvite}
        cancelInvite={cancelInvite}
      />

      {/* ÜST BAR */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: isMobile ? "flex-start" : "center", 
        marginBottom: isMobile ? 12 : 16,
        flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? 8 : 0
      }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ 
            fontSize: isMobile ? 20 : 24, 
            marginBottom: 4, 
            display: "flex", 
            alignItems: "center", 
            gap: 8 
          }}>
            <span style={{ fontSize: isMobile ? 22 : 26 }}>🎡</span> 
            Neon Çark
            {isHost && <span style={{ fontSize: isMobile ? 16 : 20, marginLeft: 8 }}>👑</span>}
          </h1>
          {autoSpinEnabled && autoSpinLeft !== null && (
              <div style={{
                fontSize: isMobile ? 10 : 12, 
                color: '#fca5a5', 
                fontWeight:'bold'
              }}>
                ⏳ Oto Çevirme: {autoSpinLeft}sn
              </div>
          )}
          <div style={{ 
            fontSize: isMobile ? 10 : 11, 
            opacity: 0.7 
          }}>
            Oda ID: <code>{roomId}</code>
          </div>
        </div>

        <div style={{ 
          display: "flex", 
          flexDirection: isMobile ? "row" : "column", 
          gap: 6,
          width: isMobile ? '100%' : 'auto'
        }}>
          {isHost && (
            <button 
              onClick={openInviteModal} 
              disabled={inviteLoading}
              style={{ 
                border: "none", 
                borderRadius: 999, 
                padding: isMobile ? "6px 10px" : "6px 12px", 
                background: "linear-gradient(135deg, rgba(52,211,153,0.3), rgba(34,197,94,0.9))", 
                color: "white", 
                fontSize: isMobile ? 10 : 11, 
                boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
                flex: isMobile ? 1 : 'auto'
              }}
            >
              {inviteLoading ? "..." : "Davet Et"}
            </button>
          )}
          <button 
            onClick={shareRoom}
            style={{ 
              border: "none", 
              borderRadius: 999, 
              padding: isMobile ? "6px 10px" : "6px 12px", 
              background: "linear-gradient(135deg, rgba(56,189,248,0.4), rgba(192,132,252,0.9))", 
              color: "white", 
              fontSize: isMobile ? 10 : 11, 
              boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
              flex: isMobile ? 1 : 'auto'
            }}
          >
            Paylaş
          </button>
        </div>
      </div>

      {/* HOST PANELİ */}
      {isHost && (
        <div style={{ 
          padding: isMobile ? 10 : 12, 
          borderRadius: 12, 
          marginBottom: isMobile ? 12 : 14, 
          background: "rgba(15,23,42,0.9)", 
          border: "1px solid rgba(148,163,184,0.6)" 
        }}>
          <div style={{ 
            fontSize: isMobile ? 12 : 13, 
            fontWeight: 600, 
            marginBottom: 8, 
            color:'#fbbf24' 
          }}>
            👑 Host Kontrol Paneli
          </div>
          
          <input 
            type="text" 
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder="Özel soru yaz..."
            style={{
              width:'100%', 
              padding: isMobile ? 6 : 8, 
              borderRadius:8, 
              border:'1px solid #475569', 
              background:'rgba(0,0,0,0.3)', 
              color:'white', 
              fontSize: isMobile ? 12 : 14,
              marginBottom: 8
            }}
          />

          <div style={{ 
            display: "flex", 
            flexWrap: "wrap", 
            gap: 6 
          }}>
            <button 
              onClick={toggleAutoSpin} 
              style={{ 
                padding: "6px 10px", 
                borderRadius: 999, 
                background: autoSpinEnabled ? "#ef4444" : "#3b82f6", 
                border: "none", 
                color: "white", 
                fontSize: isMobile ? 10 : 11 
              }}
            >
              {autoSpinEnabled ? "⏸ Durdur" : "▶ Oto Döngü"}
            </button>

            <button 
              onClick={resetRound} 
              style={{ 
                padding: "6px 10px", 
                borderRadius: 999, 
                background: "linear-gradient(135deg,#6366f1,#818cf8)", 
                border: "none", 
                color: "white", 
                fontSize: isMobile ? 10 : 11 
              }}
            >
              Sıfırla
            </button>
            
            <button 
              onClick={clearAnswers} 
              style={{ 
                padding: "6px 10px", 
                borderRadius: 999, 
                background: "linear-gradient(135deg,#ec4899,#f97316)", 
                border: "none", 
                color: "white", 
                fontSize: isMobile ? 10 : 11 
              }}
            >
              Cevapları Sil
            </button>
            
            <button 
              onClick={closeRoom} 
              style={{ 
                padding: "6px 10px", 
                borderRadius: 999, 
                background: "linear-gradient(135deg,#ef4444,#fda4a4)", 
                border: "none", 
                color: "white", 
                fontSize: isMobile ? 10 : 11 
              }}
            >
              Kapat
            </button>
          </div>

          <div style={{ 
            marginTop: 10, 
            fontSize: isMobile ? 11 : 12 
          }}>
            Soru Modu:
          </div>
          <div style={{ 
            display: "flex", 
            gap: 6, 
            marginTop: 6 
          }}>
            <button 
              onClick={() => changeQuestionMode("normal")} 
              style={{ 
                padding: "6px 10px", 
                borderRadius: 999, 
                background: questionMode === "normal" ? "linear-gradient(135deg,#22c55e,#14b8a6)" : "rgba(75,85,99,0.6)", 
                color: "white", 
                border: "none", 
                fontSize: isMobile ? 10 : 11 
              }}
            >
              Normal
            </button>
            <button 
              onClick={() => changeQuestionMode("dark")} 
              style={{ 
                padding: "6px 10px", 
                borderRadius: 999, 
                background: questionMode === "dark" ? "linear-gradient(135deg,#f97316,#e11d48)" : "rgba(75,85,99,0.6)", 
                color: "white", 
                border: "none", 
                fontSize: isMobile ? 10 : 11 
              }}
            >
              Cesur
            </button>
          </div>
        </div>
      )}

      {/* OYUNCULAR */}
      <div style={{ 
        marginBottom: isMobile ? 12 : 16, 
        padding: isMobile ? 8 : 10, 
        borderRadius: 14, 
        background: "rgba(15,23,42,0.96)", 
        border: "1px solid rgba(148,163,184,0.6)" 
      }}>
        <div style={{ 
          fontSize: isMobile ? 12 : 13, 
          fontWeight: 600, 
          marginBottom: 6 
        }}>
          Oyuncular ({players.length}/{maxPlayers})
        </div>
        <div style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: 6 
        }}>
          {players.length === 0 && (
            <div style={{ 
              fontSize: isMobile ? 11 : 12, 
              opacity: 0.7 
            }}>
              Henüz kimse katılmadı.
            </div>
          )}
          {players.map((id) => (
            <div key={id} style={{ 
              padding: isMobile ? "3px 8px" : "4px 10px", 
              borderRadius: 999, 
              background: id === anonId ? "rgba(56,189,248,0.9)" : "rgba(148,163,184,0.5)", 
              fontSize: isMobile ? 10 : 12, 
              display: "flex", 
              alignItems: "center", 
              gap: 6 
            }}>
              {id === anonId ? "Sen" : shortTag(id)}
              {id === hostAnonId ? " 👑" : ""}
              {isHost && id !== hostAnonId && (
                <button 
                  onClick={() => kickPlayer(id)} 
                  style={{ 
                    border: "none", 
                    borderRadius: 999, 
                    padding: "2px 6px", 
                    fontSize: 8, 
                    background: "rgba(239,68,68,0.9)", 
                    color: "white" 
                  }}
                >
                  At
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ÇARK */}
      <div style={{ 
        marginTop: isMobile ? 8 : 10, 
        marginBottom: isMobile ? 16 : 22, 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        gap: isMobile ? 10 : 12 
      }}>
        <div style={{ 
          width: wheelSize, 
          height: wheelSize, 
          position: "relative",
          marginBottom: isMobile ? 8 : 12
        }}>
          {/* SABİT İBRE - GÜNCELLENDİ */}
          <div style={{
            position: "absolute",
            top: -isMobile ? 12 : 18,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: isMobile ? "8px solid transparent" : "12px solid transparent",
            borderRight: isMobile ? "8px solid transparent" : "12px solid transparent",
            borderBottom: isMobile ? "14px solid #facc15" : "20px solid #facc15",
            filter: "drop-shadow(0 0 8px #facc15)",
            zIndex: 20
          }} />
          
          {renderPlayerTagsAroundWheel()}
          
          {/* DÖNEN ÇARK */}
          <div style={{
              position: "absolute", 
              inset: 0, 
              borderRadius: "50%",
              background: isCriticalTime && selectedAnonId === anonId ? 
                "linear-gradient(135deg, #ef4444, #f97316)" : 
                "conic-gradient(from 180deg, #4f46e5, #ec4899, #22c55e, #f97316, #4f46e5)",
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              boxShadow: isCriticalTime && selectedAnonId === anonId ? 
                "0 0 30px #ef4444" : 
                "0 8px 32px rgba(0,0,0,0.8)",
              transform: `rotate(${isSpinning ? wheelRotation : finalRotationRef.current}deg)`, 
              transition: isSpinning ? "transform 4s cubic-bezier(0.23, 1, 0.32, 1)" : "none",
              animation: isCriticalTime && selectedAnonId === anonId ? "pulse 0.8s infinite alternate" : "none",
            }}>
            
            <div style={{ 
              width: wheelSize * 0.7, 
              height: wheelSize * 0.7, 
              borderRadius: "50%", 
              background: "#020617", 
              border: "2px solid rgba(248,250,252,0.2)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              textAlign: "center", 
              padding: isMobile ? 12 : 16, 
              fontSize: isMobile ? 12 : 14, 
              lineHeight: 1.4, 
              flexDirection: "column" 
            }}>
              {room.currentTask && timeLeft > 0 && ( 
                <div style={{ 
                  fontSize: isMobile ? 24 : 32, 
                  fontWeight: 'bold', 
                  color: timerColor,
                  marginBottom: 4 
                }}>
                  ⏱ {timeLeft}
                </div>
              )}
              <div style={{ fontSize: isMobile ? 20 : 24 }}>
                {getWheelCenterText()}
              </div>
              {room.currentTask && (
                <div style={{ 
                  fontSize: isMobile ? 10 : 11, 
                  opacity: 0.8, 
                  marginTop: 4 
                }}>
                  {selectedAnonId === anonId ? "Sen!" : `${shortTag(selectedAnonId)}!`}
                </div>
              )}
            </div>
          </div>
        </div>

        <button 
          onClick={() => spinWheel(false)} 
          disabled={!isHost || getPlayerList(room).length === 0}
          style={{ 
            padding: isMobile ? "12px 20px" : "14px 24px", 
            borderRadius: 999, 
            border: "none", 
            background: isHost && getPlayerList(room).length > 0 ? 
              "linear-gradient(135deg,#6366f1,#ec4899)" : 
              "rgba(75,85,99,0.6)", 
            color: "white", 
            fontSize: isMobile ? 14 : 16, 
            fontWeight: 600, 
            boxShadow: "0 8px 24px rgba(0,0,0,0.8)",
            opacity: isHost && getPlayerList(room).length > 0 ? 1 : 0.6,
            width: isMobile ? '100%' : 'auto',
            maxWidth: 300
          }}
        >
          🎡 {customQuestion ? "Özel Soruyu Sor" : "Çarkı Çevir"}
        </button>
      </div>

      {/* SORU ALANI */}
      {room.currentTask && (
        <div style={{ 
          marginBottom: isMobile ? 12 : 16, 
          padding: isMobile ? 10 : 12, 
          borderRadius: 16, 
          background: "rgba(15,23,42,0.96)", 
          border: selectedAnonId === anonId ? `2px solid ${timerColor}` : "1px solid rgba(148,163,184,0.6)" 
        }}>
          <div style={{
            display:'flex', 
            justifyContent:'space-between',
            alignItems: 'center',
            marginBottom: 8
          }}>
            <div style={{ 
              fontSize: isMobile ? 11 : 12, 
              opacity: 0.7 
            }}>
              {selectedAnonId === anonId ? "🎯 Senin için:" : `🎯 ${shortTag(selectedAnonId)} için:`}
            </div>
            {timeLeft > 0 && (
              <div style={{ 
                fontSize: isMobile ? 11 : 12, 
                color: timerColor, 
                fontWeight:'bold',
                padding: '2px 8px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: 12
              }}>
                ⏱ {timeLeft}s
              </div>
            )}
          </div>
          
          <div style={{ 
            fontSize: isMobile ? 14 : 16, 
            marginBottom: 12,
            lineHeight: 1.4
          }}>
            {room.currentTask}
          </div>
          
          {timeLeft > 0 && (
             <div style={{
               width:'100%', 
               height:4, 
               background:'#334155', 
               borderRadius:2, 
               marginBottom:8, 
               overflow:'hidden'
             }}>
               <div style={{
                 height:'100%', 
                 width:`${(timeLeft/60)*100}%`, 
                 background: timerColor,
                 transition:'width 1s linear'
               }}></div>
             </div>
          )}
          
          {hasAnswered && (
              <div style={{ 
                fontSize: isMobile ? 11 : 12, 
                color: '#22c55e', 
                fontWeight:'bold', 
                marginBottom:8,
                padding: '4px 8px',
                background: 'rgba(34,197,94,0.1)',
                borderRadius: 8
              }}>
                {selectedAnonId === anonId ? "✓ Cevabınız kaydedildi!" : `✓ ${shortTag(selectedAnonId)} cevap verdi!`}
              </div>
          )}

          {selectedAnonId && !hasAnswered && (
            <div style={{ 
              fontSize: isMobile ? 11 : 12, 
              opacity: 0.8 
            }}>
              Bu turu <strong>{selectedAnonId === anonId ? "sen" : shortTag(selectedAnonId)}</strong> cevaplayabilir.
            </div>
          )}
        </div>
      )}

      {/* CEVAP ALANI */}
      {room.currentTask && selectedAnonId === anonId && !hasAnswered && (
        <div style={{ marginBottom: isMobile ? 16 : 20 }}>
          <textarea 
            value={answer} 
            onChange={(e) => setAnswer(e.target.value)} 
            placeholder="Cevabını buraya yaz..."
            rows={4} 
            disabled={sendingAnswer} 
            style={{ 
              width: "100%", 
              padding: isMobile ? 12 : 14, 
              borderRadius: 12, 
              border: `2px solid ${timerColor}`, 
              background: "rgba(15,23,42,0.9)", 
              color: "white", 
              fontSize: isMobile ? 14 : 16, 
              marginBottom: 12,
              resize: 'vertical',
              minHeight: 100
            }} 
          />
          <button 
            onClick={sendAnswer} 
            disabled={sendingAnswer || !answer.trim() || timeLeft <= 0} 
            style={{ 
              width: "100%", 
              padding: isMobile ? 12 : 14, 
              borderRadius: 12, 
              border: "none", 
              background: timeLeft <= 0 ? "rgba(34,197,94,0.5)" : "linear-gradient(135deg,#22c55e,#14b8a6)", 
              color: "white", 
              fontSize: isMobile ? 14 : 16, 
              fontWeight: 600, 
              boxShadow: "0 8px 24px rgba(0,0,0,0.8)",
              cursor: timeLeft <= 0 ? 'not-allowed' : 'pointer'
            }}
          >
            {timeLeft <= 0 ? "⏰ Süre Doldu" : sendingAnswer ? "📤 Gönderiliyor..." : "📨 Cevabı Gönder"}
          </button>
        </div>
      )}

      {/* ODA SOHBETİ */}
      <div style={{ 
        padding: isMobile ? 10 : 12, 
        borderRadius: 12, 
        background: "rgba(15,23,42,0.9)", 
        border: "1px solid rgba(148,163,184,0.6)", 
        marginBottom: isMobile ? 16 : 20 
      }}>
        <div style={{ 
          fontSize: isMobile ? 12 : 13, 
          fontWeight: 600, 
          marginBottom: 8 
        }}>
          💬 Oda Sohbeti
        </div>
        <div style={{ 
          maxHeight: 120, 
          overflowY: "auto", 
          display: "flex", 
          flexDirection: "column", 
          gap: 6, 
          marginBottom: 8 
        }}>
          {chatMessages.length === 0 ? (
            <div style={{ 
              opacity: 0.7, 
              fontSize: isMobile ? 11 : 12,
              textAlign: 'center',
              padding: 8
            }}>
              Henüz mesaj yok.
            </div>
          ) : (
            chatMessages.map((m) => {
              const mine = m.anonId === anonId;
              const timeLabel = m.createdAt ? new Date(m.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : "";
              return (
                <div key={m.id} style={{ 
                  alignSelf: mine ? "flex-end" : "flex-start", 
                  maxWidth: "85%", 
                  padding: "6px 10px", 
                  borderRadius: 12, 
                  background: mine ? "rgba(56,189,248,0.9)" : "rgba(15,23,42,0.9)", 
                  fontSize: isMobile ? 11 : 12, 
                  color: "white" 
                }}>
                  <div style={{ 
                    fontSize: isMobile ? 9 : 10, 
                    opacity: 0.8 
                  }}>
                    {mine ? "👤 Sen" : `👤 ${shortTag(m.anonId)}`} 
                    <span style={{ opacity: 0.6, marginLeft: 4 }}>{timeLabel}</span>
                  </div>
                  <div>{m.text}</div>
                </div>
              );
            })
          )}
        </div>
        <div style={{ 
          display: "flex", 
          gap: 6 
        }}>
          <input 
            value={chatInput} 
            onChange={(e) => setChatInput(e.target.value)} 
            placeholder="Mesaj yaz..." 
            style={{ 
              flex: 1, 
              padding: isMobile ? 8 : 10, 
              borderRadius: 20, 
              background: "rgba(15,23,42,0.9)", 
              border: "1px solid rgba(148,163,184,0.6)", 
              color: "white", 
              fontSize: isMobile ? 12 : 14 
            }} 
          />
          <button 
            onClick={sendChatMessage} 
            disabled={chatSending || !chatInput.trim()} 
            style={{ 
              padding: isMobile ? "8px 12px" : "10px 16px", 
              borderRadius: 20, 
              background: "linear-gradient(135deg,#6366f1,#a855f7)", 
              border: "none", 
              color: "white", 
              fontSize: isMobile ? 12 : 14 
            }}
          >
            {chatSending ? "..." : "Gönder"}
          </button>
        </div>
      </div>

      {/* ÖNCEKİ TURLAR */}
      {answers.length > 0 && (
        <div style={{ 
          padding: isMobile ? 10 : 12, 
          borderRadius: 12, 
          background: "rgba(15,23,42,0.9)", 
          border: "1px solid rgba(148,163,184,0.6)" 
        }}>
          <div style={{ 
            fontSize: isMobile ? 12 : 13, 
            fontWeight: 600, 
            marginBottom: 8 
          }}>
            📝 Önceki Turlar
          </div>
          {answers.slice().reverse().map((a, index) => {
            const realIndex = answers.length - 1 - index;
            const vibe = analyzeAnswerText(a.text);
            const timeLabel = a.createdAt ? new Date(a.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : "";
            return (
              <div key={index} style={{ 
                padding: isMobile ? 8 : 10, 
                borderRadius: 12, 
                background: "rgba(15,23,42,0.85)", 
                border: "1px solid rgba(148,163,184,0.5)", 
                marginBottom: 8, 
                fontSize: isMobile ? 11 : 12 
              }}>
                <div style={{ 
                  fontSize: isMobile ? 10 : 11, 
                  opacity: 0.8,
                  marginBottom: 4
                }}>
                  <strong>Soru:</strong> {a.task}
                </div>
                <div style={{ marginTop: 4 }}>{a.text}</div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginTop: 6, 
                  fontSize: isMobile ? 10 : 11 
                }}>
                  <span>{a.anonId === anonId ? "👤 Sen" : `👤 ${shortTag(a.anonId)}`}</span>
                  <span style={{ opacity: 0.8 }}>{timeLabel}</span>
                  <span style={{ 
                    padding: "2px 6px", 
                    borderRadius: 999, 
                    background: vibe === "Pozitif" ? "rgba(34,197,94,0.3)" : vibe === "Sert" ? "rgba(248,113,113,0.3)" : "rgba(148,163,184,0.3)" 
                  }}>
                    {vibe}
                  </span>
                </div>
                <div style={{
                  display:'flex', 
                  gap:4, 
                  marginTop:6
                }}>
                    {REACTION_EMOJIS.map(emoji => (
                        <button 
                          key={emoji}
                          onClick={() => addReaction(realIndex, emoji)}
                          style={{
                            background:'rgba(255,255,255,0.1)', 
                            border:'none', 
                            borderRadius:8, 
                            cursor:'pointer', 
                            padding:'2px 6px', 
                            color:'white', 
                            fontSize: isMobile ? 10 : 12
                          }}
                        >
                            {emoji} {a.reactions && a.reactions[emoji] ? a.reactions[emoji] : ''}
                        </button>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ALT BUTONLAR */}
      <div style={{ 
        position: "fixed", 
        left: 0, 
        right: 0, 
        bottom: 0, 
        padding: isMobile ? 12 : 16, 
        background: "linear-gradient(180deg, rgba(15,23,42,0), #0f172a 60%)", 
        display: "flex", 
        flexDirection: "column", 
        gap: isMobile ? 8 : 10 
      }}>
        {!isInRoom && (
          <button 
            onClick={joinRoom} 
            style={{ 
              width: "100%", 
              padding: isMobile ? 12 : 14, 
              borderRadius: 12, 
              border: "none", 
              background: "linear-gradient(135deg, rgba(52,211,153,0.8), rgba(16,185,129,0.9))", 
              color: "white", 
              fontSize: isMobile ? 14 : 16, 
              fontWeight: "600", 
              boxShadow: "0 8px 24px rgba(0,0,0,0.7)" 
            }}
          >
            🎮 Oyuna Katıl
          </button>
        )}
        <Link to="/games" style={{ textDecoration: "none" }}>
          <button style={{ 
            width: "100%", 
            padding: isMobile ? 10 : 12, 
            borderRadius: 12, 
            border: "none", 
            background: "rgba(148,163,184,0.3)", 
            color: "white", 
            fontSize: isMobile ? 14 : 16, 
            fontWeight: "600" 
          }}>
            ↩ Ana Menüye Dön
          </button>
        </Link>
      </div>
    </div>
  );
}