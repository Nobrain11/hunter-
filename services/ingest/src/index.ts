import {
  addEvent
} from "@pump-terminal/store";
import type {
  MarketEvent
} from "@pump-terminal/types";

const mints = [
  "MOCK_MINT_001",
  "MOCK_MINT_002",
  "MOCK_MINT_003"
];

const now = Date.now();

function eventId(
  mint: string,
  type: string,
  index: number
) {
  return `mock_${mint}_${type}_${index}`;
}

async function createMockUniverse() {
  for (
    const [index, mint] of mints.entries()
  ) {
    const create: MarketEvent = {
      id: eventId(mint, "create", 0),
      signature:
        `mock_signature_${mint}_create`,
      instructionIndex: 0,
      slot: 1000 + index,
      timestamp:
        now - (index + 1) * 60_000,
      mint,
      trader:
        `MOCK_CREATOR_${index}`,
      eventType: "create",
      market: "pumpfun_curve"
    };

    await addEvent(create);

    for (
      let tradeIndex = 1;
      tradeIndex <= 12 + index * 4;
      tradeIndex++
    ) {
      const isBuy =
        tradeIndex % (index + 3) !== 0;

      const event: MarketEvent = {
        id: eventId(
          mint,
          isBuy ? "buy" : "sell",
          tradeIndex
        ),
        signature:
          `mock_signature_${mint}_${tradeIndex}`,
        instructionIndex: tradeIndex,
        slot: 2000 + tradeIndex,
        timestamp:
          now -
          (index + 1) * 60_000 +
          tradeIndex * 3_000,
        mint,
        trader:
          `MOCK_TRADER_${
            (tradeIndex + index) % 20
          }`,
        eventType: isBuy ? "buy" : "sell",
        market: "pumpfun_curve",
        solAmount: Number(
          (
            0.05 +
            ((tradeIndex + index) % 5) *
              0.03
          ).toFixed(3)
        ),
        tokenAmount:
          1000 + tradeIndex * 100
      };

      await addEvent(event);
    }
  }
}

async function addRandomTrade() {
  const mint =
    mints[
      Math.floor(
        Math.random() * mints.length
      )
    ];

  const isBuy = Math.random() > 0.3;
  const index = Date.now();

  await addEvent({
    id: eventId(
      mint,
      isBuy ? "buy" : "sell",
      index
    ),
    signature:
      `mock_live_signature_${index}`,
    instructionIndex: 0,
    slot: index,
    timestamp: Date.now(),
    mint,
    trader:
      `MOCK_LIVE_TRADER_${
        Math.floor(Math.random() * 50)
      }`,
    eventType: isBuy ? "buy" : "sell",
    market: "pumpfun_curve",
    solAmount: Number(
      (
        0.03 + Math.random() * 0.25
      ).toFixed(3)
    ),
    tokenAmount: Math.floor(
      500 + Math.random() * 5000
    )
  });
}

await createMockUniverse();

console.log(
  "Mock ingestion started. Live on-chain ingestion is not enabled."
);

setInterval(
  () => void addRandomTrade(),
  4_000
);
