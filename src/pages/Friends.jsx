// src/pages/Friends.jsx
import { useState } from "react";

export default function Friends() {
  const [tab, setTab] = useState("friends");

  // ✅ TEMP DATA (sonra Firestore-dan gələcək)
  const following = [
    { id: 1, name: "Emily", mutual: false },
    { id: 2, name: "Chris", mutual: true },
  ];

  const followers = [
    { id: 3, name: "Jacob", mutual: false },
    { id: 2, name: "Chris", mutual: true },
  ];

  const whispFriends = following.filter((u) => u.mutual);

  return (
    <div style={{ color: "white" }}>
      <h1 style={{ fontSize: 22, marginBottom: 14 }}>👥 Friends</h1>

      {/* ✅ TAB MENU */}
      <div
        style={{
          display: "flex",
          background: "rgba(255,255,255,0.05)",
          padding: 6,
          borderRadius: 10,
          marginBottom: 18,
        }}
      >
        {["friends", "following", "followers"].map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            style={{
              flex: 1,
              padding: "8px 0",
              borderRadius: 8,
              border: "none",
              background:
                tab === item ? "rgba(255,255,255,0.18)" : "transparent",
              color: "white",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {item === "friends" && "WhispFriends 🤝"}
            {item === "following" && "Following ✅"}
            {item === "followers" && "Followers 👀"}
          </button>
        ))}
      </div>

      {/* ✅ FRIENDS TAB */}
      {tab === "friends" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {whispFriends.length === 0 && (
            <p style={{ opacity: 0.6, fontSize: 13 }}>
              Hələ WhispFriendin yoxdur. Whisp at → Follow et → Mutual olsun ✅
            </p>
          )}

          {whispFriends.map((user) => (
            <div
              key={user.id}
              style={{
                padding: 12,
                borderRadius: 10,
                background: "rgba(255,255,255,0.05)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{user.name}</span>
              {/* ✅ INVITE BUTTON */}
              <button
                style={{
                  padding: "6px 10px",
                  fontSize: 12,
                  borderRadius: 6,
                  border: "none",
                  background:
                    "linear-gradient(135deg, #00eaff, #3b82f6)",
                  color: "#000",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Invite to Play 🎮
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ✅ FOLLOWING TAB */}
      {tab === "following" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {following.map((user) => (
            <div
              key={user.id}
              style={{
                padding: 12,
                borderRadius: 10,
                background: "rgba(255,255,255,0.05)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{user.name}</span>

              {/* ❌ Invite disabled */}
              <button
                disabled
                style={{
                  padding: "6px 10px",
                  fontSize: 12,
                  borderRadius: 6,
                  border: "none",
                  background: "rgba(255,255,255,0.15)",
                  color: "#888",
                }}
              >
                Invite 🔒
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ✅ FOLLOWERS TAB */}
      {tab === "followers" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {followers.map((user) => (
            <div
              key={user.id}
              style={{
                padding: 12,
                borderRadius: 10,
                background: "rgba(255,255,255,0.05)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{user.name}</span>

              {/* ❌ Invite disabled */}
              <button
                disabled
                style={{
                  padding: "6px 10px",
                  fontSize: 12,
                  borderRadius: 6,
                  border: "none",
                  background: "rgba(255,255,255,0.15)",
                  color: "#888",
                }}
              >
                Invite 🔒
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
