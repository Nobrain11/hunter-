# Pump Terminal

Pump.fun-focused discovery terminal and Telegram bot starter.

This repository currently runs in paper/demo mode. It is a complete starter scaffold, not a live trading product. It generates deterministic mock market events so the complete flow can be tested before connecting to live Solana data or wallets.

## Included

- Fastify API
- Next.js terminal
- grammY Telegram bot
- Mock Pump.fun event ingestion
- File-backed local store
- Token metrics and trend scoring
- New and trending token endpoints
- Paper order endpoint
- PostgreSQL and Redis Docker services prepared for the next phase

## Requirements

- Node.js 20+
- pnpm 10+
- Optional: Docker

## Run

```bash
cp .env.example .env
pnpm install
pnpm dev
