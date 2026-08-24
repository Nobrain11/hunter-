"use client";

import { useMemo, useState } from "react";

type Risk = "LOW" | "MEDIUM" | "HIGH";
type Token = { mint: string; name: string; symbol: string; score: number; curve: number; pressure: number; buyers: number; flow: number; risk: Risk; age: string };

const tokens: Token[] = [
  { mint: "7xKX...mP4q", name: "Kite Protocol", symbol: "KITE", score: 94, curve: 78, pressure: 68.4, buyers: 182, flow: 56.4, risk: "LOW", age: "8m" },
  { mint: "9qQe...hY7a", name: "Mochi Terminal", symbol: "MOCHI", score: 88, curve: 51, pressure: 59.1, buyers: 116, flow: 26.4, risk: "MEDIUM", age: "14m" },
  { mint: "4nVb...pL2z", name: "Orbit Dog", symbol: "ORBIT", score: 76, curve: 33, pressure: 44.8, buyers: 74, flow: -7.7, risk: "HIGH", age: "22m" },
  { mint: "B8sT...2Qw9", name: "Index 404", symbol: "IDX", score: 71, curve: 89, pressure: 52.2, buyers: 231, flow: 36.3, risk: "LOW", age: "31m" },
  { mint: "3LmR...vK81", name: "Signal Garden", symbol: "SGRN", score: 64, curve: 19, pressure: 38.5, buyers: 52, flow: -7.9, risk: "HIGH", age: "46m" },
  { mint: "5aPd...rT12", name: "Tiny Atlas", symbol: "ATLAS", score: 59, curve: 42, pressure: 35.2, buyers: 39, flow: 3.8, risk: "MEDIUM", age: "1h" },
];

const money = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)} SOL`;

export default function Home() {
  const [tab, setTab] = useState<"trending" | "new">("trending");
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState<"ALL" | Risk>("ALL");
  const [selected, setSelected] = useState(tokens[0]);
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [amount, setAmount] = useState("0.50");
  const [connected, setConnected] = useState(false);
  const [paused, setPaused] = useState(false);
  const [notice, setNotice] = useState("");
  const visible = useMemo(() => tokens.filter((t) => (risk === "ALL" || t.risk === risk) && `${t.name} ${t.symbol}`.toLowerCase().includes(query.toLowerCase())), [query, risk]);

  function order() { const value = Number(amount); if (!value || value <= 0) return setNotice("Enter a positive SOL amount."); setNotice(`${side} queued — ${value.toFixed(2)} SOL of $${selected.symbol}`); }

  return <main className="app-shell">
    <aside className="sidebar"><div className="brand"><span className="brand-mark">P</span><span>PUMP<span className="dim">/TERM</span></span></div><p className="eyebrow nav-eyebrow">WORKSPACE</p><nav aria-label="Workspace navigation"><button className="nav active"><span>◈</span> Market <kbd>⌘1</kbd></button><button className="nav"><span>◫</span> Watchlist <kbd>⌘2</kbd></button><button className="nav"><span>↗</span> Positions <kbd>⌘3</kbd></button><button className="nav"><span>≋</span> Activity</button></nav><div className="sidebar-bottom"><div className="mode"><span className="dot" /> PAPER MODE <small>Live execution disabled</small></div><button className="pause" onClick={() => setPaused(!paused)}>{paused ? "Resume terminal" : "Emergency pause"}</button><small className="build">BUILD 0.4.2<br /><b>● ALL SYSTEMS NOMINAL</b></small></div></aside>
    <section className="main"><header className="topbar"><span>MARKET <i>/</i> DISCOVERY</span><div className="top-actions"><span className="connection"><span className="dot" /> MOCK DATA</span><button className="wallet" onClick={() => setConnected(!connected)}>{connected ? "7xKX...mP4q" : "Connect wallet"} <b>↗</b></button></div></header>
      <div className="content"><div className="hero"><div><p className="eyebrow">PUMPFUN MARKET INTELLIGENCE <b>•</b> 10 SEC REFRESH</p><h1>Market <em>radar</em></h1></div><div className="watching"><span className="live" /> Watching 1,248 tokens<br /><small>Last scan 4 seconds ago</small></div></div>
        <section className="stats"><div><span>TRACKED TOKENS</span><strong>1,248</strong><small>+84 since session open</small></div><div><span>24H VOLUME</span><strong>12,482 <i>SOL</i></strong><small className="positive">↑ 18.4% vs yesterday</small></div><div><span>BUY PRESSURE</span><strong>61.8<i>%</i></strong><small className="positive">↑ 4.2% in 1h</small></div><div><span>OPPORTUNITIES</span><strong>27</strong><small>Above 75 signal score</small></div></section>
        <div className="toolbar"><div className="tabs"><button className={tab === "trending" ? "selected" : ""} onClick={() => setTab("trending")}>Trending <small>24</small></button><button className={tab === "new" ? "selected" : ""} onClick={() => setTab("new")}>New launches <small>18</small></button></div><div className="filters"><label className="search">⌕ <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tokens" /></label><select value={risk} onChange={(e) => setRisk(e.target.value as "ALL" | Risk)} aria-label="Risk filter"><option value="ALL">Risk: all</option><option value="LOW">Risk: low</option><option value="MEDIUM">Risk: medium</option><option value="HIGH">Risk: high</option></select><button className="sort">Sort: score <span>⌄</span></button></div></div>
        <div className="workspace"><section className="token-panel"><div className="table-head"><span>ASSET</span><span>SIGNAL</span><span>CURVE</span><span>FLOW / 1H</span><span>TRADERS</span><span>RISK</span></div>{visible.map((token) => <button key={token.mint} className={`token-row ${selected.mint === token.mint ? "row-selected" : ""}`} onClick={() => setSelected(token)}><div className="asset"><span className="avatar">{token.symbol[0]}</span><span><b>${token.symbol}</b><small>{token.name}</small></span></div><div className="signal"><b>{token.score}</b><span><i style={{ width: `${token.score}%` }} /></span></div><div className="curve"><b>{token.curve}%</b><span><i style={{ width: `${token.curve}%` }} /></span></div><div className={token.flow >= 0 ? "positive" : "negative"}>{money(token.flow)}</div><div>{token.buyers}</div><div><span className={`risk ${token.risk.toLowerCase()}`}>{token.risk}</span></div></button>)}{!visible.length && <div className="empty">No tokens match this filter.</div>}</section>
          <aside className="detail"><div className="detail-heading"><div><p className="eyebrow">SELECTED ASSET</p><h2><span className="avatar large">{selected.symbol[0]}</span>${selected.symbol}</h2><small>{selected.mint} <button className="copy">copy</button></small></div><span className={`risk ${selected.risk.toLowerCase()}`}>{selected.risk} RISK</span></div><div className="curve-card"><div><span>BONDING CURVE</span><b>{selected.curve}%</b></div><div className="big-curve"><i style={{ width: `${selected.curve}%` }} /></div><small>{selected.curve > 70 ? "Near graduation threshold" : "Early curve phase"}</small></div><div className="detail-metrics"><div><span>SIGNAL</span><b>{selected.score}<small>/100</small></b></div><div><span>BUY PRESSURE</span><b>{selected.pressure}<small>%</small></b></div><div><span>UNIQUE BUYERS</span><b>{selected.buyers}</b></div></div><div className="section-title">LIVE ACTIVITY <b>●</b></div><div className="activity"><div><strong>BUY</strong><span>4.20 SOL</span><small>just now</small></div><div><strong>BUY</strong><span>0.84 SOL</span><small>12 sec ago</small></div><div className="sell"><strong>SELL</strong><span>1.10 SOL</span><small>28 sec ago</small></div></div><div className="ticket"><div className="ticket-head"><b>Paper trade</b><span>SAFE SIMULATION</span></div><div className="trade-tabs"><button className={side === "BUY" ? "buy-active" : ""} onClick={() => setSide("BUY")}>Buy</button><button className={side === "SELL" ? "sell-active" : ""} onClick={() => setSide("SELL")}>Sell</button></div><label className="amount"><input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" /><span>SOL</span></label><div className="quick"><button onClick={() => setAmount("0.25")}>0.25</button><button onClick={() => setAmount("0.50")}>0.50</button><button onClick={() => setAmount("1.00")}>1.00</button><button onClick={() => setAmount("2.00")}>2.00</button></div><button className={`execute ${side === "SELL" ? "execute-sell" : ""}`} onClick={order} disabled={paused}> {paused ? "TERMINAL PAUSED" : `${side} ${selected.symbol}`} <span>→</span></button>{notice && <p className="notice" role="status">{notice}</p>}<small className="ticket-note">Paper orders are simulated and never touch your wallet.</small></div></aside></div>
      </div><footer className="mobile-nav"><button className="selected">◈<small>Market</small></button><button>◫<small>Watchlist</small></button><button>↗<small>Positions</small></button><button>≋<small>Activity</small></button></footer>
    </section>
  </main>;
}
