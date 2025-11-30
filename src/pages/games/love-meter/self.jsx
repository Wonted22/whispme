import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoveMeterSelfTest() {
  const navigate = useNavigate();

  const questions = [
    "Sən özünü pozitiv biri hesab edirsən?",
    "İnsanlarla ünsiyyəti asan qurursan?",
    "Başqalarına qarşı anlayışlı olduğunu düşünürsən?",
    "Səninlə dostluq etmək asandır?",
    "İnsanlar səninlə özlərini rahat hiss edirlər?",
    "Sən tez inciməyən tipdəsən?",
    "Konfliktlərdən qaçmağa üstünlük verirsən?",
    "Səmimi biri olduğunu düşünürsən?",
    "Sevdiyin insanlara qarşı diqqətlisən?",
    "İnsanları motivasiya etməyi bacarırsan?",
    "Yanında insanlar güvən hiss edir?",
    "Səninlə danışmaq zövqlüdür?",
    "Hisslərini gizlətməyə meyillisan?",
    "İnsanlara qarşı empatiya göstərə bilirsən?",
    "Özünü sevən biri olduğunu düşünürsən?",
  ];

  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);

  const answer = (value) => {
    setScore(score + value);
    if (step + 1 === questions.length) {
      navigate(`/games/love-meter/self/result?score=${score + value}`);
    } else {
      setStep(step + 1);
    }
  };

  const progress = Math.round(((step + 1) / questions.length) * 100);

  return (
    <div
      style={{
        minHeight: "100vh",
        color: "white",
        padding: "22px 16px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Progress */}
      <div
        style={{
          width: "100%",
          height: 8,
          background: "rgba(255,255,255,0.1)",
          borderRadius: 6,
          marginBottom: 22,
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "linear-gradient(135deg,#ff4d67,#ffb347)",
            borderRadius: 6,
          }}
        />
      </div>

      {/* Question */}
      <h2 style={{ fontSize: 20, marginBottom: 30, textAlign: "center" }}>
        {questions[step]}
      </h2>

      {/* Answers */}
      <button
        onClick={() => answer(2)}
        style={{
          width: "100%",
          padding: "12px 0",
          background: "#4ade80",
          borderRadius: 10,
          border: "none",
          fontWeight: 700,
          marginBottom: 12,
          cursor: "pointer",
        }}
      >
        ✅ Bəli
      </button>

      <button
        onClick={() => answer(1)}
        style={{
          width: "100%",
          padding: "12px 0",
          background: "#facc15",
          borderRadius: 10,
          border: "none",
          fontWeight: 700,
          marginBottom: 12,
          cursor: "pointer",
        }}
      >
        🙂 Bəzən
      </button>

      <button
        onClick={() => answer(0)}
        style={{
          width: "100%",
          padding: "12px 0",
          background: "#f87171",
          borderRadius: 10,
          border: "none",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        ❌ Xeyir
      </button>
    </div>
  );
}
