import type { TokenMetrics } from "@pump-terminal/types";

export interface ScoringInput {
  mint: string;
  ageSeconds: number;
  buyVolumeSol: number;
  sellVolumeSol: number;
  uniqueBuyers: number;
  uniqueSellers: number;
  buyCount: number;
  sellCount: number;
  curveProgress: number;
  riskPenalty?: number;
}

const clamp = (
  value: number,
  min = 0,
  max = 100
): number => {
  return Math.max(min, Math.min(max, value));
};

export function calculateTokenScore(
  input: ScoringInput
): TokenMetrics {
  const totalVolume =
    input.buyVolumeSol + input.sellVolumeSol;

  const totalTrades =
    input.buyCount + input.sellCount;

  const buyPressure =
    totalVolume > 0
      ? (input.buyVolumeSol / totalVolume) * 100
      : 0;

  const netFlowSol =
    input.buyVolumeSol - input.sellVolumeSol;

  const buyerSignal =
    clamp(input.uniqueBuyers * 2);

  const sellerSignal =
    clamp(input.uniqueSellers * 2);

  const volumeSignal =
    clamp(totalVolume * 4);

  const velocity =
    clamp(
      (totalTrades / Math.max(input.ageSeconds, 1)) * 3000
    );

  const riskPenalty =
    clamp(input.riskPenalty ?? 0);

  const rawScore =
    buyerSignal * 0.25 +
    buyPressure * 0.2 +
    volumeSignal * 0.15 +
    velocity * 0.15 +
    clamp(input.curveProgress) * 0.1 +
    sellerSignal * 0.1;

  return {
    mint: input.mint,
    ageSeconds: input.ageSeconds,
    buyVolumeSol: input.buyVolumeSol,
    sellVolumeSol: input.sellVolumeSol,
    uniqueBuyers: input.uniqueBuyers,
    uniqueSellers: input.uniqueSellers,
    buyCount: input.buyCount,
    sellCount: input.sellCount,
    netFlowSol,
    buyPressure,
    velocity,
    curveProgress: input.curveProgress,
    riskPenalty,
    score: clamp(rawScore - riskPenalty),
    calculatedAt: Date.now()
  };
}
