import "dotenv/config";
import {
  mkdir,
  readFile,
  rename,
  writeFile
} from "node:fs/promises";
import path from "node:path";
import { calculateTokenScore } from "@pump-terminal/scoring";
import type {
  MarketEvent,
  PaperOrder,
  Token,
  TokenMetrics
} from "@pump-terminal/types";

interface StoreFile {
  tokens: Record<string, Token>;
  events: MarketEvent[];
  metrics: Record<string, TokenMetrics>;
  paperOrders: PaperOrder[];
}

const filePath = path.resolve(
  process.env.DATA_FILE ??
    path.join(
      process.env.INIT_CWD ?? process.cwd(),
      "data/market.json"
    )
);

const emptyStore = (): StoreFile => ({
  tokens: {},
  events: [],
  metrics: {},
  paperOrders: []
});

async function ensureStore(): Promise<void> {
  try {
    await readFile(filePath, "utf8");
  } catch {
    await mkdir(path.dirname(filePath), {
      recursive: true
    });

    await writeFile(
      filePath,
      JSON.stringify(emptyStore(), null, 2)
    );
  }
}

async function readStore(): Promise<StoreFile> {
  await ensureStore();

  return JSON.parse(
    await readFile(filePath, "utf8")
  ) as StoreFile;
}

async function writeStore(
  store: StoreFile
): Promise<void> {
  await mkdir(path.dirname(filePath), {
    recursive: true
  });

  const temporary = `${filePath}.tmp`;

  await writeFile(
    temporary,
    JSON.stringify(store, null, 2)
  );

  await rename(temporary, filePath);
}

export async function resetStore(): Promise<void> {
  await writeStore(emptyStore());
}

export async function addEvent(
  event: MarketEvent
): Promise<boolean> {
  const store = await readStore();

  const duplicate = store.events.some(
    (item) => item.id === event.id
  );

  if (duplicate) {
    return false;
  }

  store.events.push(event);

  const existing = store.tokens[event.mint];

  if (
    event.eventType === "create" &&
    !existing
  ) {
    store.tokens[event.mint] = {
      mint: event.mint,
      name: `Mock Token ${event.mint.slice(-3)}`,
      symbol: `M${event.mint.slice(-3)}`,
      creator: event.trader ?? "MOCK_CREATOR",
      market: "pumpfun_curve",
      createdAt: event.timestamp,
      isGraduated: false,
      curveProgress: 0,
      riskLevel: "unknown"
    };
  }

  if (
    existing &&
    event.eventType === "migrate"
  ) {
    existing.market = "pumpswap";
    existing.isGraduated = true;
    existing.graduatedAt = event.timestamp;
  }

  if (
    existing &&
    event.eventType === "buy"
  ) {
    existing.curveProgress = Math.min(
      99,
      existing.curveProgress + 0.3
    );
  }

  if (
    existing &&
    event.eventType === "sell"
  ) {
    existing.curveProgress = Math.max(
      0,
      existing.curveProgress - 0.05
    );
  }

  if (store.tokens[event.mint]) {
    const token = store.tokens[event.mint];

    const trades = store.events.filter(
      (item) =>
        item.mint === event.mint &&
        (
          item.eventType === "buy" ||
          item.eventType === "sell"
        )
    );

    const buys = trades.filter(
      (item) => item.eventType === "buy"
    );

    const sells = trades.filter(
      (item) => item.eventType === "sell"
    );

    const buyVolumeSol = buys.reduce(
      (sum, item) =>
        sum + (item.solAmount ?? 0),
      0
    );

    const sellVolumeSol = sells.reduce(
      (sum, item) =>
        sum + (item.solAmount ?? 0),
      0
    );

    const metrics = calculateTokenScore({
      mint: event.mint,
      ageSeconds: Math.max(
        1,
        (Date.now() - token.createdAt) / 1000
      ),
      buyVolumeSol,
      sellVolumeSol,
      uniqueBuyers: new Set(
        buys
          .map((item) => item.trader)
          .filter(Boolean)
      ).size,
      uniqueSellers: new Set(
        sells
          .map((item) => item.trader)
          .filter(Boolean)
      ).size,
      buyCount: buys.length,
      sellCount: sells.length,
      curveProgress: token.curveProgress,
      riskPenalty:
        token.riskLevel === "high"
          ? 35
          : token.riskLevel === "medium"
            ? 15
            : 0
    });

    store.metrics[event.mint] = metrics;
  }

  await writeStore(store);

  return true;
}

export async function listTokens(
  order: "new" | "trending",
  limit = 50
) {
  const store = await readStore();

  return Object.values(store.tokens)
    .map((token) => ({
      token,
      metrics: store.metrics[token.mint] ?? null
    }))
    .sort((a, b) =>
      order === "new"
        ? b.token.createdAt - a.token.createdAt
        : (b.metrics?.score ?? 0) -
          (a.metrics?.score ?? 0)
    )
    .slice(
      0,
      Math.max(1, Math.min(limit, 100))
    );
}

export async function getToken(
  mint: string
) {
  const store = await readStore();
  const token = store.tokens[mint];

  return token
    ? {
        token,
        metrics: store.metrics[mint] ?? null
      }
    : null;
}

export async function addPaperOrder(
  input: Omit<
    PaperOrder,
    "id" | "status" | "createdAt"
  >
): Promise<PaperOrder> {
  const store = await readStore();

  const order: PaperOrder = {
    ...input,
    id: `paper_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    status: "filled",
    createdAt: Date.now()
  };

  store.paperOrders.push(order);

  await writeStore(store);

  return order;
}

export async function getSummary() {
  const store = await readStore();

  return {
    tokens: Object.keys(store.tokens).length,
    events: store.events.length,
    paperOrders: store.paperOrders.length,
    filePath
  };
}
