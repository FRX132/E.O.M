import React, { useState } from 'react';
import { useStore } from '../../store';
import '../Styles/TradingTerminal.css';

// ── Icons ──────────────────────────────────────────────
const Icon = ({ d, size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 16 16">
    <path d={d} />
  </svg>
);

// ── Risk Calculator Tab ────────────────────────────────
function RiskCalc({ currency }) {
  const [capital, setCapital] = useState('');
  const [risk, setRisk] = useState('');
  const [entry, setEntry] = useState('');
  const [stop, setStop] = useState('');

  const riskAmt = capital && risk ? (parseFloat(capital) * parseFloat(risk)) / 100 : 0;
  const diff = entry && stop ? Math.abs(parseFloat(entry) - parseFloat(stop)) : 0;
  const posSize = diff > 0 ? riskAmt / diff : 0;
  const rr = entry && stop ? (diff / (parseFloat(stop) || 1)) * 100 : 0;

  return (
    <div>
      <div className="risk-calc">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: `Capital (${currency})`, val: capital, set: setCapital, ph: 'e.g. 10000' },
            { label: 'Risk %', val: risk, set: setRisk, ph: 'e.g. 1' },
            { label: 'Entry Price', val: entry, set: setEntry, ph: 'e.g. 150.00' },
            { label: 'Stop Loss', val: stop, set: setStop, ph: 'e.g. 147.00' },
          ].map(f => (
            <div className="risk-input-group" key={f.label}>
              <label>{f.label}</label>
              <input type="number" placeholder={f.ph} value={f.val} onChange={e => f.set(e.target.value)} />
            </div>
          ))}
        </div>
        <div className="risk-result-panel">
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--primary)' }}>📊 Position Sizing</h3>
          {[
            { label: 'Risk Amount', value: `${currency}${riskAmt.toFixed(2)}` },
            { label: 'Position Size', value: `${posSize.toFixed(2)} shares` },
            { label: 'Stop Distance', value: `${currency}${diff.toFixed(2)}` },
            { label: 'Risk/Entry Ratio', value: `${rr.toFixed(2)}%` },
          ].map(r => (
            <div className="risk-result-row" key={r.label}>
              <span className="label">{r.label}</span>
              <span className="value">{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Trade Journal Tab ─────────────────────────────────
function TradeJournal({ currency }) {
  const trades = useStore(s => s.trades || []);
  const setTrades = useStore(s => s.setTrades);

  const add = () => setTrades([...trades, {
    id: Date.now(), symbol: '', type: 'Long', entry: '', exit: '', size: '', pnl: '', date: new Date().toISOString().split('T')[0], notes: ''
  }]);

  const del = id => setTrades(trades.filter(t => t.id !== id));
  const upd = (id, f, v) => setTrades(trades.map(t => t.id === id ? { ...t, [f]: v } : t));

  const totalPnl = trades.reduce((s, t) => s + (parseFloat(t.pnl) || 0), 0);
  const wins = trades.filter(t => parseFloat(t.pnl) > 0).length;
  const wr = trades.length ? ((wins / trades.length) * 100).toFixed(0) : 0;

  return (
    <div>
      <div className="trading-stats-row" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total P&L', value: `${currency}${totalPnl.toFixed(2)}`, cls: totalPnl >= 0 ? 'positive' : 'negative' },
          { label: 'Trades', value: trades.length },
          { label: 'Win Rate', value: `${wr}%`, cls: wr >= 50 ? 'positive' : 'negative' },
          { label: 'Wins', value: wins },
        ].map(s => (
          <div className="trading-stat-card" key={s.label}>
            <div className="trading-stat-label">{s.label}</div>
            <div className={`trading-stat-value ${s.cls || ''}`}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button className="notion-button" onClick={add}>+ New Trade</button>
      </div>
      <div className="trading-table-container">
        <table className="trading-table">
          <thead>
            <tr>
              {['Symbol', 'Type', 'Entry', 'Exit', 'Size', `P&L (${currency})`, 'Date', 'Notes', ''].map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {trades.map(t => (
              <tr key={t.id}>
                <td><input value={t.symbol} onChange={e => upd(t.id, 'symbol', e.target.value)} placeholder="AAPL" style={{ fontWeight: 700, width: 70 }} /></td>
                <td>
                  <select value={t.type} onChange={e => upd(t.id, 'type', e.target.value)} style={{ background: 'transparent', border: 'none', color: t.type === 'Long' ? 'var(--green-text)' : 'var(--red-text)', fontWeight: 700, cursor: 'pointer' }}>
                    <option>Long</option><option>Short</option>
                  </select>
                </td>
                {['entry', 'exit', 'size', 'pnl'].map(f => (
                  <td key={f}><input type="number" value={t[f]} onChange={e => upd(t.id, f, e.target.value)} placeholder="0" style={{ width: 70 }} /></td>
                ))}
                <td><input type="date" value={t.date} onChange={e => upd(t.id, 'date', e.target.value)} /></td>
                <td><input value={t.notes} onChange={e => upd(t.id, 'notes', e.target.value)} placeholder="Notes..." /></td>
                <td><button onClick={() => del(t.id)} style={{ color: 'var(--red-text)', fontSize: '1.1rem', background: 'none', border: 'none', cursor: 'pointer' }}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!trades.length && <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No trades logged yet. Click "+ New Trade" to start.</div>}
      </div>
    </div>
  );
}

// ── Trend Analyser Tab ────────────────────────────────
function TrendAnalyser() {
  const trends = useStore(s => s.tradingTrends || []);
  const setTrends = useStore(s => s.setTradingTrends);
  const add = () => setTrends([...trends, { id: Date.now(), symbol: '', direction: 'Bullish', timeframe: 'Daily', notes: '', strength: 5 }]);
  const del = id => setTrends(trends.filter(t => t.id !== id));
  const upd = (id, f, v) => setTrends(trends.map(t => t.id === id ? { ...t, [f]: v } : t));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="notion-button" onClick={add}>+ Add Symbol</button>
      </div>
      <div className="trend-grid">
        {trends.map(t => (
          <div className="trend-card" key={t.id}>
            <div className="trend-symbol">
              <input value={t.symbol} onChange={e => upd(t.id, 'symbol', e.target.value)} placeholder="BTC / AAPL" style={{ fontWeight: 800, fontSize: '1rem', background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', width: 120 }} />
              <select value={t.direction} onChange={e => upd(t.id, 'direction', e.target.value)} className={`trend-direction ${t.direction.toLowerCase()}`} style={{ border: 'none', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                <option>Bullish</option><option>Bearish</option><option>Neutral</option>
              </select>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>
              Timeframe:&nbsp;
              <select value={t.timeframe} onChange={e => upd(t.id, 'timeframe', e.target.value)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', outline: 'none' }}>
                {['1m','5m','15m','1h','4h','Daily','Weekly'].map(tf => <option key={tf}>{tf}</option>)}
              </select>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>Strength: {t.strength}/10</div>
            <input type="range" min={1} max={10} value={t.strength} onChange={e => upd(t.id, 'strength', e.target.value)} style={{ width: '100%', accentColor: 'var(--primary)', marginBottom: 10 }} />
            <textarea className="strategy-textarea" placeholder="Trend notes..." value={t.notes} onChange={e => upd(t.id, 'notes', e.target.value)} style={{ minHeight: 60 }} />
            <button onClick={() => del(t.id)} style={{ color: 'var(--red-text)', background: 'none', border: 'none', fontSize: '0.78rem', cursor: 'pointer', textAlign: 'left', padding: 0, marginTop: 4, opacity: 0.6 }}>Remove</button>
          </div>
        ))}
        {!trends.length && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '20px 0' }}>No trends tracked yet.</div>}
      </div>
    </div>
  );
}

// ── Strategy Tab ──────────────────────────────────────
function Strategies() {
  const strategies = useStore(s => s.tradingStrategies || []);
  const setStrategies = useStore(s => s.setTradingStrategies);
  const add = () => setStrategies([...strategies, { id: Date.now(), title: 'New Strategy', setup: '', entry: '', exit: '', notes: '' }]);
  const del = id => setStrategies(strategies.filter(s => s.id !== id));
  const upd = (id, f, v) => setStrategies(strategies.map(s => s.id === id ? { ...s, [f]: v } : s));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="notion-button" onClick={add}>+ New Strategy</button>
      </div>
      <div className="strategy-grid">
        {strategies.map(s => (
          <div className="strategy-card" key={s.id}>
            <input className="strategy-title-input" value={s.title} onChange={e => upd(s.id, 'title', e.target.value)} placeholder="Strategy name..." />
            {[['setup', '📐 Setup Criteria'], ['entry', '🟢 Entry Rules'], ['exit', '🔴 Exit Rules'], ['notes', '📝 Notes']].map(([f, lbl]) => (
              <div key={f}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{lbl}</div>
                <textarea className="strategy-textarea" value={s[f]} onChange={e => upd(s.id, f, e.target.value)} placeholder={`Describe ${lbl.split(' ')[1]}...`} />
              </div>
            ))}
            <button onClick={() => del(s.id)} style={{ color: 'var(--red-text)', background: 'none', border: 'none', fontSize: '0.78rem', cursor: 'pointer', textAlign: 'left', padding: 0, opacity: 0.6 }}>Delete</button>
          </div>
        ))}
        {!strategies.length && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No strategies yet.</div>}
      </div>
    </div>
  );
}

// ── Watchlist Tab ─────────────────────────────────────
function Watchlist() {
  const stocks = useStore(s => s.watchlist || []);
  const setStocks = useStore(s => s.setWatchlist);
  const add = () => setStocks([...stocks, { id: Date.now(), ticker: '', name: '', sector: '', starred: false, notes: '' }]);
  const del = id => setStocks(stocks.filter(s => s.id !== id));
  const upd = (id, f, v) => setStocks(stocks.map(s => s.id === id ? { ...s, [f]: v } : s));
  const toggle = id => upd(id, 'starred', !stocks.find(s => s.id === id)?.starred);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="notion-button" onClick={add}>+ Add Stock</button>
      </div>
      <div className="watchlist-grid">
        {stocks.map(s => (
          <div className={`watchlist-card ${s.starred ? 'starred' : ''}`} key={s.id}>
            <button className="watchlist-star" onClick={() => toggle(s.id)}>{s.starred ? '⭐' : '☆'}</button>
            <input className="watchlist-ticker" value={s.ticker} onChange={e => upd(s.id, 'ticker', e.target.value)} placeholder="TSLA" style={{ background: 'transparent', border: 'none', outline: 'none', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)', width: '100%' }} />
            <input className="watchlist-name" value={s.name} onChange={e => upd(s.id, 'name', e.target.value)} placeholder="Company name" style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.75rem', color: 'var(--text-muted)', width: '100%', marginBottom: 8 }} />
            <input value={s.sector} onChange={e => upd(s.id, 'sector', e.target.value)} placeholder="Sector" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', borderRadius: 6, padding: '4px 8px', color: 'var(--text-muted)', fontSize: '0.75rem', outline: 'none', width: '100%', boxSizing: 'border-box', marginBottom: 8 }} />
            <textarea value={s.notes} onChange={e => upd(s.id, 'notes', e.target.value)} placeholder="Why interested..." className="strategy-textarea" style={{ minHeight: 50, fontSize: '0.78rem' }} />
            <button onClick={() => del(s.id)} style={{ color: 'var(--red-text)', background: 'none', border: 'none', fontSize: '0.75rem', cursor: 'pointer', padding: 0, opacity: 0.6, marginTop: 4 }}>Remove</button>
          </div>
        ))}
        {!stocks.length && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No stocks in watchlist yet.</div>}
      </div>
    </div>
  );
}

// ── Plan Tab ──────────────────────────────────────────
function TradingPlan() {
  const plan = useStore(s => s.tradingPlan || { goals: '', rules: '', mindset: '', routine: '' });
  const setPlan = useStore(s => s.setTradingPlan);
  const upd = (f, v) => setPlan({ ...plan, [f]: v });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      {[
        ['goals', '🎯 Trading Goals', 'What are your financial goals?'],
        ['rules', '📋 Trading Rules', 'Your strict trading rules...'],
        ['mindset', '🧠 Mindset', 'Discipline principles...'],
        ['routine', '⏰ Daily Routine', 'Pre-market, during, post-market...'],
      ].map(([f, title, ph]) => (
        <div className="strategy-card" key={f}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 8 }}>{title}</div>
          <textarea className="strategy-textarea" value={plan[f]} onChange={e => upd(f, e.target.value)} placeholder={ph} style={{ minHeight: 150 }} />
        </div>
      ))}
    </div>
  );
}

// ── Analyse Tool Tab ───────────────────────────────────
function AnalyseTool() {
  const analyses = useStore(s => s.tradingAnalyses || []);
  const setAnalyses = useStore(s => s.setTradingAnalyses);
  const add = () => setAnalyses([...analyses, { id: Date.now(), symbol: '', fundamental: '', technical: '', sentiment: '', verdict: 'Hold' }]);
  const del = id => setAnalyses(analyses.filter(a => a.id !== id));
  const upd = (id, f, v) => setAnalyses(analyses.map(a => a.id === id ? { ...a, [f]: v } : a));
  const verdictColor = v => v === 'Buy' ? 'var(--green-text)' : v === 'Sell' ? 'var(--red-text)' : 'var(--text-muted)';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="notion-button" onClick={add}>+ New Analysis</button>
      </div>
      <div className="strategy-grid">
        {analyses.map(a => (
          <div className="strategy-card" key={a.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input className="strategy-title-input" value={a.symbol} onChange={e => upd(a.id, 'symbol', e.target.value)} placeholder="Ticker / Asset..." style={{ flex: 1 }} />
              <select value={a.verdict} onChange={e => upd(a.id, 'verdict', e.target.value)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', borderRadius: 6, padding: '4px 8px', color: verdictColor(a.verdict), fontWeight: 700, cursor: 'pointer', outline: 'none' }}>
                <option>Buy</option><option>Sell</option><option>Hold</option>
              </select>
            </div>
            {[['fundamental', '📊 Fundamental'], ['technical', '📈 Technical'], ['sentiment', '💬 Sentiment']].map(([f, lbl]) => (
              <div key={f}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{lbl}</div>
                <textarea className="strategy-textarea" value={a[f]} onChange={e => upd(a.id, f, e.target.value)} placeholder={`${lbl.split(' ')[1]} notes...`} style={{ minHeight: 60 }} />
              </div>
            ))}
            <button onClick={() => del(a.id)} style={{ color: 'var(--red-text)', background: 'none', border: 'none', fontSize: '0.78rem', cursor: 'pointer', textAlign: 'left', padding: 0, opacity: 0.6 }}>Delete</button>
          </div>
        ))}
        {!analyses.length && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No analyses yet.</div>}
      </div>
    </div>
  );
}

// ── Finance Link Tab ───────────────────────────────────
function FinanceLink({ navigate, currency }) {
  const trades = useStore(s => s.trades || []);
  const expenses = useStore(s => s.expenses || []);
  const setExpenses = useStore(s => s.setExpenses);

  const totalPnl = trades.reduce((s, t) => s + (parseFloat(t.pnl) || 0), 0);

  const exportToExpenses = () => {
    const entry = {
      id: Date.now(),
      name: `Trading P&L (${trades.length} trades)`,
      amount: Math.abs(totalPnl),
      category: 'Investment',
      account: 'Trading',
      date: new Date().toISOString().split('T')[0],
      recurrence: 'None',
      dueDate: ''
    };
    setExpenses([...expenses, entry]);
    alert('✅ Exported to Finance Hub!');
  };

  return (
    <div>
      <div className="finance-link-banner">
        <div className="finance-link-banner-icon">🔗</div>
        <div>
          <h4>Finance Hub Connection</h4>
          <p>Export your trade P&L directly into the Expense Tracker as an Investment entry.</p>
        </div>
      </div>
      <div className="risk-result-panel" style={{ maxWidth: 400 }}>
        <div className="risk-result-row">
          <span className="label">Total Trades</span>
          <span className="value">{trades.length}</span>
        </div>
        <div className="risk-result-row">
          <span className="label">Total P&L</span>
          <span className="value" style={{ color: totalPnl >= 0 ? 'var(--green-text)' : 'var(--red-text)' }}>{currency}{totalPnl.toFixed(2)}</span>
        </div>
        <div className="risk-result-row">
          <span className="label">Expense Entries</span>
          <span className="value">{expenses.length}</span>
        </div>
        <button className="notion-button" onClick={exportToExpenses} style={{ marginTop: 8, width: '100%' }}>
          Export P&L → Finance Hub
        </button>
        <button onClick={() => navigate('/expenses')} style={{ width: '100%', marginTop: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '8px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.83rem' }}>
          Open Finance Hub →
        </button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────
const TABS = [
  { id: 'journal', label: 'Journal', emoji: '📓' },
  { id: 'trends', label: 'Trend Analyser', emoji: '📈' },
  { id: 'analyse', label: 'Analyse Tool', emoji: '🔍' },
  { id: 'plan', label: 'Plan', emoji: '📋' },
  { id: 'risk', label: 'Risiko Berechner', emoji: '⚖️' },
  { id: 'strategies', label: 'Strategies', emoji: '♟️' },
  { id: 'watchlist', label: 'Stock List', emoji: '⭐' },
  { id: 'finance', label: 'Finance Link', emoji: '🔗' },
];

export default function TradingTerminal({ navigate }) {
  const [tab, setTab] = useState('journal');
  const profile = useStore(state => state.profile || {});
  const currency = profile.currencySymbol || '€';

  const renderTab = () => {
    switch (tab) {
      case 'journal': return <TradeJournal currency={currency} />;
      case 'trends': return <TrendAnalyser />;
      case 'analyse': return <AnalyseTool />;
      case 'plan': return <TradingPlan />;
      case 'risk': return <RiskCalc currency={currency} />;
      case 'strategies': return <Strategies />;
      case 'watchlist': return <Watchlist />;
      case 'finance': return <FinanceLink navigate={navigate} currency={currency} />;
      default: return null;
    }
  };

  return (
    <div className="premium-container trading-terminal">
      <div className="premium-header-container">
        <div className="premium-icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path d="M0 0h1v15h15v1H0V0Zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07z"/>
          </svg>
        </div>
        <h1 className="premium-title">Trading Terminal</h1>
        <p className="premium-subtitle">Professional trading management — journal, analyse & calculate risk.</p>
      </div>

      <div className="trading-subnav">
        {TABS.map(t => (
          <button key={t.id} className={`trading-subnav-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {renderTab()}
    </div>
  );
}
