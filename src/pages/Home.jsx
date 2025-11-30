import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import Logo from "../assets/whispme-logo.png";

function Home() {
  const [handle, setHandle] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  const navigate = useNavigate();
  const DOMAIN = "https://whispme.online";

  // 🔥 Load username + premium status
  useEffect(() => {
    const saved = localStorage.getItem("whispme_handle");
    const userId = localStorage.getItem("loveMeterUserId");

    if (saved) {
      setHandle(saved);
      setGeneratedLink(`${DOMAIN}/m/${saved}`);
    }

    // Fetch premium status from Firestore
    if (userId) {
      getDoc(doc(db, "users", userId)).then((snap) => {
        if (snap.exists() && snap.data().premium === true) {
          setIsPremium(true);
        }
      });
    }
  }, []);

  const createLink = async () => {
    setError("");
    const value = handle.trim().toLowerCase();

    if (!value) return setError("Please enter a username.");
    if (!/^[a-z0-9_.]{3,20}$/.test(value))
      return setError("Username must be 3–20 characters. Letters, numbers, dot and underscore allowed.");

    try {
      setLoading(true);

      const ref = doc(db, "links", value);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await setDoc(ref, {
          handle: value,
          createdAt: serverTimestamp(),
        });
      }

      localStorage.setItem("whispme_handle", value);
      setGeneratedLink(`${DOMAIN}/m/${value}`);
    } catch (e) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const shareLink = async () => {
    if (!generatedLink) return;

    const text = `Send me an anonymous Whisp: ${generatedLink}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: "WhispMe", text, url: generatedLink });
      } else {
        await navigator.clipboard.writeText(text);
        alert("Copied:\n" + text);
      }
    } catch {}
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        padding: "28px 16px",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* LOGO */}
      <div style={{ width: "100%", textAlign: "center", marginBottom: 12 }}>
        <img
          src={Logo}
          alt="WhispMe"
          style={{
            height: 48,
            filter: "drop-shadow(0 0 10px #00eaff)",
          }}
        />

        {/* PREMIUM BADGE (only if premium) */}
        {isPremium && (
          <div
            style={{
              marginTop: 10,
              display: "inline-block",
              padding: "6px 14px",
              background: "linear-gradient(135deg,#ffd776,#ffb347)",
              color: "#000",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 13,
              boxShadow: "0 0 12px rgba(255,215,118,0.55)",
            }}
          >
            ⭐ Premium User
          </div>
        )}
      </div>

      {/* TEXT */}
      <div
        style={{
          textAlign: "center",
          fontSize: 17,
          opacity: 0.9,
          marginBottom: 30,
          lineHeight: 1.4,
        }}
      >
        Receive fully <strong>anonymous</strong> Whisps.<br />
        Designed for TikTok & Instagram.
      </div>

      {/* INPUT */}
      <div>
        <div style={{ fontSize: 14, marginBottom: 6 }}>Username</div>

        <input
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="example: michael"
          style={{
            width: "100%",
            padding: "14px 16px",
            fontSize: 16,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(0,0,0,0.30)",
            color: "white",
            outline: "none",
            boxShadow: "0 0 10px rgba(0,255,255,0.25)",
          }}
        />
      </div>

      {error && (
        <div
          style={{
            marginTop: 10,
            padding: 12,
            background: "rgba(255,0,0,0.2)",
            borderRadius: 12,
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      {/* BUTTON */}
      <button
        onClick={createLink}
        disabled={loading}
        style={{
          marginTop: 20,
          padding: "14px",
          width: "100%",
          borderRadius: 14,
          border: "none",
          background: "linear-gradient(135deg,#6e5af9,#d66efd)",
          color: "white",
          fontSize: 17,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 0 12px rgba(214,110,253,0.55)",
        }}
      >
        {loading ? "Creating..." : "Create my Whisp link"}
      </button>

      {/* LINK BOX */}
      {generatedLink && (
        <div
          style={{
            marginTop: 30,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 18,
            padding: 18,
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 0 12px rgba(0,255,255,0.15)",
          }}
        >
          <div style={{ fontSize: 14, marginBottom: 10 }}>Your WhispMe link:</div>

          <div
            style={{
              fontSize: 15,
              wordBreak: "break-all",
              marginBottom: 16,
              fontWeight: 500,
            }}
          >
            {generatedLink}
          </div>

          <button
            onClick={() => navigator.clipboard.writeText(generatedLink)}
            style={{
              padding: 12,
              width: "100%",
              borderRadius: 12,
              background: "rgba(59,130,246,0.9)",
              border: "none",
              color: "white",
              marginBottom: 10,
            }}
          >
            Copy Link
          </button>

          <button
            onClick={shareLink}
            style={{
              padding: 12,
              width: "100%",
              borderRadius: 12,
              background: "rgba(34,197,94,0.9)",
              border: "none",
              color: "white",
              marginBottom: 10,
            }}
          >
            Share (DM / Story Text)
          </button>

          <button
            onClick={() => navigate("/panel")}
            style={{
              padding: 12,
              width: "100%",
              borderRadius: 12,
              background: "rgba(255,255,255,0.25)",
              border: "none",
              color: "white",
            }}
          >
            Go to my Whisp Inbox
          </button>
        </div>
      )}

      {/* FOOTER */}
      <div
        style={{
          marginTop: "auto",
          padding: "35px 0 10px 0",
          textAlign: "center",
          opacity: 0.5,
          fontSize: 13,
        }}
      >
        <a href="/terms" style={{ color: "#fff", marginRight: 16 }}>Terms</a>
        <a href="/privacy" style={{ color: "#fff", marginRight: 16 }}>Privacy</a>
        <a href="/refund" style={{ color: "#fff" }}>Refund</a>
      </div>
    </div>
  );
}

export default Home;
