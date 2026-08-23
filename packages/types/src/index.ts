export type Market = "pumpfun_curve" | "pumpswap";

export type MarketEventType =
  | "create"
  | "buy"
  | "sell"
  | "complete"
  | "migrate";

export type RiskLevel = "unknown" | "low" | "medium" | "high";

export interface MarketEvent {
  id: string;
  signature: string;
  instructionIndex: number;
  slot: number;
  timestamp: number;
  mint: string;
  trader?: string;
  eventType: MarketEventType;
  market: Market;
  solAmount?: number;
  tokenAmount?: number;
}

export interface Token {
  mint: string;
  name: string;
  symbol: string;
  creator: string;
  market: Market;
  createdAt: number;
  graduatedAt?: number;
  isGraduated: boolean;
  curveProgress: number;
  riskLevel: RiskLevel;
}

export interface TokenMetrics {
  mint: string;
  ageSeconds: number;
  buyVolumeSol: number;
  sellVolumeSol: number;
  uniqueBuyers: number;
  uniqueSellers: number;
  buyCount: number;
  sellCount: number;
  netFlowSol: number;
  buyPressure: number;
  velocity: number;
  curveProgress: number;
  riskPenalty: number;
  score: number;
  calculatedAt: number;
}

export interface PaperOrder {
  id: string;
  mint: string;
  side: "buy" | "sell";
  solAmount: number;
  status: "filled";
  createdAt: number;
}
