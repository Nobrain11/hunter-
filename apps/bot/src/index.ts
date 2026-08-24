import { Bot } from "grammy";
import { env } from "@pump-terminal/config";

const botToken = env.BOT_TOKEN;

if (!botToken) {
  console.log(
    "BOT_TOKEN is not configured. Telegram bot is disabled."
  );

  process.exit(0);
}

const bot = new Bot(botToken);

async function api<T>(
  endpoint: string
): Promise<T> {
  const response = await fetch(
    `${env.API_URL}${endpoint}`
  );

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status}`
    );
  }

  return response.json() as Promise<T>;
}

type TokenRow = {
  token: {
    mint: string;
    name: string;
    symbol: string;
    market: string;
  };
  metrics: {
    score: number;
    buyPressure: number;
    uniqueBuyers: number;
    curveProgress: number;
  } | null;
};

function formatRows(
  rows: TokenRow[]
) {
  return rows
    .map((row, index) => {
      const metrics = row.metrics;

      return (
        `${index + 1}. $${row.token.symbol}` +
        ` — ${Math.round(metrics?.score ?? 0)}/100\n` +
        `Buy pressure: ${
          metrics?.buyPressure?.toFixed(1) ?? "0.0"
        }% | Buyers: ${
          metrics?.uniqueBuyers ?? 0
        }\n` +
        `Mint: ${row.token.mint}`
      );
    })
    .join("\n\n");
}

bot.command("start", async (ctx) => {
  await ctx.reply(
    "Pump Terminal demo bot ready. Try /new, /trending, or /metrics."
  );
});

bot.command("new", async (ctx) => {
  const response = await api<{
    data: TokenRow[];
  }>("/api/tokens/new?limit=5");

  await ctx.reply(
    `New Pump.fun tokens (demo):\n\n${
      formatRows(response.data)
    }`
  );
});

bot.command("trending", async (ctx) => {
  const response = await api<{
    data: TokenRow[];
  }>("/api/tokens/trending?limit=5");

  await ctx.reply(
    `Trending tokens (demo):\n\n${
      formatRows(response.data)
    }`
  );
});

bot.command("metrics", async (ctx) => {
  const response = await api<{
    tokens: number;
    events: number;
    paperOrders: number;
  }>("/api/metrics");

  await ctx.reply(
    `Tokens: ${response.tokens}\n` +
    `Events: ${response.events}\n` +
    `Paper orders: ${response.paperOrders}`
  );
});

bot.catch((error) => {
  console.error(
    "Telegram bot error",
    error
  );
});

await bot.start();
