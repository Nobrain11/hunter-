"use client";

import {
  useEffect,
  useState
} from "react";

type Row = {
  token: {
    mint: string;
    name: string;
    symbol: string;
    market: string;
    curveProgress: number;
    riskLevel: string;
  };

  metrics: {
    score: number;
    buyPressure: number;
    uniqueBuyers: number;
    buyVolumeSol: number;
    sellVolumeSol: number;
  } | null;
};

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

export default function Home() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/api/tokens/trending?limit=20`,
          {
            cache: "no-store"
          }
        );

        if (!response.ok) {
          throw new Error("API unavailable");
        }

        const payload = await response.json() as {
          data: Row[];
        };

        setRows(payload.data);
        setError("");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load tokens"
        );
      }
    };

    void load();

    const timer = setInterval(
      () => void load(),
      5_000
    );

    return () => clearInterval(timer);
  }, []);

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <span className="brand">
            PUMP
          </span>

          <span className="muted">
            {" / TERMINAL"}
          </span>
        </div>

        <span className="demo">
          PAPER MODE
        </span>
      </header>

      <section className="hero">
        <p className="eyebrow">
          PUMPFUN MARKET INTELLIGENCE
        </p>

        <h1>
          Trending tokens
        </h1>

        <p className="subtext">
          Real-time discovery workspace.
          Live execution is disabled in this starter.
        </p>
      </section>

      {error && (
        <div className="notice">
          {error}. Start the API and mock ingestion services.
        </div>
      )}

      <section className="tableWrap">
        <div className="tableHead">
          <span>Token</span>
          <span>Score</span>
          <span>Buy pressure</span>
          <span>Buyers</span>
          <span>Volume</span>
          <span>Market</span>
        </div>

        {rows.map((row) => {
          const metrics = row.metrics;

          return (
            <div
              className="tableRow"
              key={row.token.mint}
            >
              <div>
                <strong>
                  ${row.token.symbol}
                </strong>

                <small>
                  {row.token.mint}
                </small>
              </div>

              <span className="score">
                {Math.round(metrics?.score ?? 0)}
              </span>

              <span>
                {(metrics?.buyPressure ?? 0).toFixed(1)}%
              </span>

              <span>
                {metrics?.uniqueBuyers ?? 0}
              </span>

              <span>
                {(
                  (metrics?.buyVolumeSol ?? 0) +
                  (metrics?.sellVolumeSol ?? 0)
                ).toFixed(2)} SOL
              </span>

              <span className="pill">
                {row.token.market}
              </span>
            </div>
          );
        })}

        {!rows.length && !error && (
          <div className="empty">
            Waiting for market events...
          </div>
        )}
      </section>
    </main>
  );
}
