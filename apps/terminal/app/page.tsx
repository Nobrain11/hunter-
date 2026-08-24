"use client";

import { useEffect, useMemo, useState } from "react";

type Token = {
  mint: string;
  name: string;
  symbol: string;
  market: string;
  curveProgress: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
};

type Metrics = {
  score: number;
  buyPressure: number;
  uniqueBuyers: number;
  buyVolumeSol: number;
  sellVolumeSol: number;
};

type Row = { token: Token; metrics: Metrics | null };

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const fallbackRows: Row[] = [
  { token: { mint: "7xKX...mP4q", name: "Kite Protocol", symbol: "KITE", market: "PUMP.FUN", curveProgress: 78, riskLevel: "LOW" }, metrics: { score: 94, buyPressure: 68.4, uniqueBuyers: 182, buyVolumeSol: 91.2, sellVolumeSol: 34.8 } },
  { token: { mint: "9qQe...hY7a", name: "Mochi Terminal", symbol: "MOCHI", market: "PUMP.FUN", curveProgress: 51, riskLevel: "MEDIUM" }, metrics: { score: 88, buyPressure: 59.1, uniqueBuyers: 116, buyVolumeSol: 54.6, sellVolumeSol: 28.2 } },
  { token: { mint: "4nVb...pL2z", name: "Orbit Dog", symbol: "ORBIT", market: "PUMP.FUN", curveProgress: 33, riskLevel: "HIGH" }, metrics: { score: 76, buyPressure: 44.8, uniqueBuyers: 74, buyVolumeSol: 22.4, sellVolumeSol: 30.1 } },
  { token: { mint: "B8sT...2Qw9", name: "Index 404", symbol: "IDX", market: "PUMP.FUN", curveProgress: 89, riskLevel: "LOW" }, metrics: { score: 71, buyPressure: 52.2, uniqueBuyers: 231, buyVolumeSol: 124.8, sellVolumeSol: 88.5 } },
  { token: { mint: "3LmR...vK81", name: "Signal Garden", symbol: "SGRN", market: "PUMP.FUN", curveProgress: 19, riskLevel: "HIGH" }, metrics: { score: 64, buyPressure: 38.5, uniqueBuyers: 52, buyVolumeSol: 13.7, sellVolumeSol: 21.6 } },
];

function formatSol(value: number) { return `${value.toFixed(1)} SOL`; }

export default function Home() {
  const [rows, setRows] = useState<Row[]>(fallbackRows);
  const [selected, setSelected] = useState<Row>(fallbackRows[0]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"trending" | "new">("trending");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("0.50");
  const [notice, setNotice] = useState("");
  const [online, setOnline] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/tokens/${tab}?limit=20`, { cache: "no-store" });
        if (!response.ok) throw new Error("offline");
        const payload = await response.json() as { data: Row[] };
        if (active && payload.data?.length) { setRows(payload.data); setSelected(payload.data[0]); setOnline(true); }
      } catch { if (active) setOnline(false); }
    };
    void load();
    const timer = setInterval(() => void load(), 10000);
    return () => { active = false; clearInterval(timer); };
  }, [tab]);

  const visibleRows = useMemo(() => rows.filter((row) => `${row.token.name} ${row.token.symbol}`.toLowerCase().includes(query.toLowerCase())), [rows, query]);
  const metrics = selected.metrics ?? { score: 0, buyPressure: 0, uniqueBuyers: 0, buyVolumeSol: 0, sellVolumeSol: 0 };

  async function submitPaperOrder() {
    const value = Number(amount);
    if (!value || value <= 0) { setNotice("Enter a positive SOL amount."); return; }
    try {
      await fetch(`${apiUrl}/api/orders/paper`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ mint: selected.token.mint, side, amountSol: value }) });
    } catch { /* paper mode still confirms locally when API is offline */ }
    setNotice(`${side.toUpperCase()} queued: ${value.toFixed(2)} SOL of $${selected.token.symbol}`);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="logo"><span className="logo-mark">P</span><span>PUMP<span className="logo-dim">/TERM</span></span></div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="nav-list" aria-label="Workspace navigation">
          <button className="nav-item active"><span>◈</span> Market <b>⌘1</b></button>
          <button className="nav-item"><span>◫</span> Watchlist <b>⌘2</b></button>
          <button className="nav-item"><span>↗</span> Positions <b>⌘3</b></button>
          <button className="nav-item"><span>≋</span> Activity</button>
        </nav>
        <div className="sidebar-foot"><div className="mode-card"><span className="status-dot" /> PAPER MODE <small>Live execution disabled</small></div><button className="pause-button">Emergency pause</button><div className="build">BUILD 0.4.2 <span>● ALL SYSTEMS NOMINAL</span></div></div>
      </aside>

      <section className="main-area">
        <header className="topbar"><div className="crumb">MARKET <span>/</span> DISCOVERY</div><div className="top-actions"><span className={`connection ${online ? "is-online" : ""}`}><i /> {online ? "API CONNECTED" : "MOCK DATA"}</span><button className="wallet-button">Connect wallet <span>↗</span></button></div></header>
        <div className="content">
          <div className="heading-row"><div><p className="kicker">PUMPFUN MARKET INTELLIGENCE <span>•</span> 10 SEC REFRESH</p><h1>Market <em>radar</em></h1></div><div className="heading-meta"><span className="live-pulse" /> Watching 1,248 tokens<br /><small>Last scan 4 seconds ago</small></div></div>
          <div className="stats-grid"><div><span>TRACKED TOKENS</span><strong>1,248</strong><small>+84 since session open</small></div><div><span>24H VOLUME</span><strong>12,482 <i>SOL</i></strong><small className="positive">↑ 18.4% vs yesterday</small></div><div><span>BUY PRESSURE</span><strong>61.8<i>%</i></strong><small className="positive">↑ 4.2% in 1h</small></div><div><span>OPPORTUNITIES</span><strong>27</strong><small>Above 75 signal score</small></div></div>
          <div className="toolbar"><div className="tabs"><button className={tab === "trending" ? "selected" : ""} onClick={() => setTab("trending")}>Trending <span>24</span></button><button className={tab === "new" ? "selected" : ""} onClick={() => setTab("new")}>New launches <span>18</span></button></div><div className="filters"><label className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tokens" /></label><button className="filter-button">Risk: all <span>⌄</span></button><button className="filter-button">Sort: score <span>⌄</span></button></div></div>
          <div className="workspace-grid"><section className="token-panel"><div className="table-header"><span>ASSET</span><span>SIGNAL</span><span>CURVE</span><span>FLOW / 1H</span><span>TRADERS</span><span>RISK</span></div>{visibleRows.map((row) => { const m = row.metrics ?? metrics; const flow = m.buyVolumeSol - m.sellVolumeSol; return <button className={`token-row ${selected.token.mint === row.token.mint ? "row-selected" : ""}`} key={row.token.mint} onClick={() => setSelected(row)}><div className="asset"><span className="token-avatar">{row.token.symbol.slice(0, 1)}</span><span><strong>${row.token.symbol}</strong><small>{row.token.name}</small></span></div><div className="signal"><strong>{Math.round(m.score)}</strong><span><i style={{ width: `${m.score}%` }} /></span></div><div className="curve"><span>{row.token.curveProgress}%</span><i><b style={{ width: `${row.token.curveProgress}%` }} /></i></div><div className={flow >= 0 ? "positive" : "negative"}>{flow >= 0 ? "+" : ""}{formatSol(flow)}</div><div>{m.uniqueBuyers}</div><div><span className={`risk ${row.token.riskLevel.toLowerCase()}`}>{row.token.riskLevel}</span></div></button> })}</section>
            <aside className="detail-panel"><div className="detail-top"><div><p className="kicker">SELECTED ASSET</p><h2><span className="token-avatar large">{selected.token.symbol.slice(0, 1)}</span>${selected.token.symbol}</h2><small>{selected.token.mint} <button>copy</button></small></div><span className={`risk ${selected.token.riskLevel.toLowerCase()}`}>{selected.token.riskLevel} RISK</span></div><div className="curve-card"><div><span>BONDING CURVE</span><strong>{selected.token.curveProgress}%</strong></div><div className="big-curve"><i style={{ width: `${selected.token.curveProgress}%` }} /></div><small>{selected.token.curveProgress > 70 ? "Near graduation threshold" : "Early curve phase"}</small></div><div className="detail-metrics"><div><span>SIGNAL</span><strong>{Math.round(metrics.score)}<small>/100</small></strong></div><div><span>BUY PRESSURE</span><strong>{metrics.buyPressure.toFixed(1)}<small>%</small></strong></div><div><span>UNIQUE BUYERS</span><strong>{metrics.uniqueBuyers}</strong></div></div><div className="activity"><div className="section-title">LIVE ACTIVITY <span>●</span></div><div className="activity-line"><b>BUY</b><span>4.20 SOL</span><small>just now</small></div><div className="activity-line"><b>BUY</b><span>0.84 SOL</span><small>12 sec ago</small></div><div className="activity-line sell-line"><b>SELL</b><span>1.10 SOL</span><small>28 sec ago</small></div></div><div className="trade-ticket"><div className="ticket-head"><strong>Paper trade</strong><span>SAFE SIMULATION</span></div><div className="trade-tabs"><button className={side === "buy" ? "buy-active" : ""} onClick={() => setSide("buy")}>Buy</button><button className={side === "sell" ? "sell-active" : ""} onClick={() => setSide("sell")}>Sell</button></div><label className="amount-input"><input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" /><span>SOL</span></label><div className="quick-amounts"><button onClick={() => setAmount("0.25")}>0.25</button><button onClick={() => setAmount("0.50")}>0.50</button><button onClick={() => setAmount("1.00")}>1.00</button><button onClick={() => setAmount("2.00")}>2.00</button></div><button className={`execute ${side}`} onClick={submitPaperOrder}>{side === "buy" ? "Simulate buy" : "Simulate sell"} <span>↗</span></button>{notice && <p className="order-notice">{notice}</p>}<small className="ticket-note">No real funds. Orders are recorded in paper mode only.</small></div></aside></div>
        </div>
      </section>
    </main>
  );
}
