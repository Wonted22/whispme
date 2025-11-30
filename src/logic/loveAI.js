// src/logic/loveAI.js

// answers: [0..100, 0..100, ...]
export function calculateLoveScore(answers) {
  if (!answers || answers.length === 0) return 0;

  // sualların çəkisi (toplam 1.0)
  const weights = [
    0.25, // romantiklik
    0.2,  // ünsiyyət
    0.2,  // sadiqlik
    0.15, // empatiya
    0.1,  // qısqanclıq / drama
    0.1,  // ümumi vibe
  ];

  const limitedWeights = weights.slice(0, answers.length);

  const totalWeight = limitedWeights.reduce((a, b) => a + b, 0) || 1;

  const weighted = answers.map((ans, idx) => {
    const w = limitedWeights[idx] ?? 1 / answers.length;
    return ans * w;
  });

  const raw = weighted.reduce((a, b) => a + b, 0) / totalWeight;

  return Math.round(raw); // 0–100 arası
}
