import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useStore } from '../../store';
import '../Styles/TradingTerminal.css';
import { parseCSV, detectMappings, mapCsvRowsToTrades, parseJSON, parseUnstructuredText, parseHTML } from './tradeParser';



// ── Icons ──────────────────────────────────────────────
const Icon = ({ d, size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 16 16">
    <path d={d} />
  </svg>
);

// ── Forex Pairs Data ───────────────────────────────────
const FOREX_PAIRS = [
  { symbol: 'EUR/USD', pipSize: 0.0001, typicalSpread: 1.2 },
  { symbol: 'GBP/USD', pipSize: 0.0001, typicalSpread: 1.5 },
  { symbol: 'USD/JPY', pipSize: 0.01, typicalSpread: 1.3 },
  { symbol: 'AUD/USD', pipSize: 0.0001, typicalSpread: 1.4 },
  { symbol: 'USD/CAD', pipSize: 0.0001, typicalSpread: 1.6 },
  { symbol: 'USD/CHF', pipSize: 0.0001, typicalSpread: 1.5 },
  { symbol: 'EUR/GBP', pipSize: 0.0001, typicalSpread: 1.5 },
  { symbol: 'EUR/JPY', pipSize: 0.01, typicalSpread: 1.6 },
  { symbol: 'GBP/JPY', pipSize: 0.01, typicalSpread: 2.0 },
  { symbol: 'NZD/USD', pipSize: 0.0001, typicalSpread: 1.6 },
  // Metalle (Gold, Silber)
  { symbol: 'XAU/USD (Gold)', pipSize: 0.1, typicalSpread: 2.5 },
  { symbol: 'XAG/USD (Silver)', pipSize: 0.01, typicalSpread: 3.0 },
  // Öl
  { symbol: 'WTI/USD (Crude Oil)', pipSize: 0.01, typicalSpread: 3.0 },
  { symbol: 'BRENT/USD (Brent Oil)', pipSize: 0.01, typicalSpread: 3.0 },
  // Krypto
  { symbol: 'BTC/USD (Bitcoin)', pipSize: 1.0, typicalSpread: 15.0 },
  { symbol: 'ETH/USD (Ethereum)', pipSize: 1.0, typicalSpread: 1.5 },
];

const getPipValue = (pair, entryPrice, currencySymbol) => {
  const isAccountEur = currencySymbol === '€';
  const isAccountGbp = currencySymbol === '£';
  const isAccountUsd = currencySymbol === '$';
  
  const entry = parseFloat(entryPrice) || 1.0;
  
  // Metals, Oil, Crypto (priced in USD)
  if (
    pair.startsWith('XAU') || 
    pair.startsWith('XAG') || 
    pair.startsWith('WTI') || 
    pair.startsWith('BRENT') || 
    pair.startsWith('BTC') || 
    pair.startsWith('ETH')
  ) {
    let basePipVal = 10;
    if (pair.startsWith('XAG')) basePipVal = 50;
    else if (pair.startsWith('BTC') || pair.startsWith('ETH')) basePipVal = 1;
    
    if (isAccountUsd) return basePipVal;
    if (isAccountEur) return basePipVal / 1.08;
    if (isAccountGbp) return basePipVal / 1.25;
    return basePipVal;
  }
  
  // Standard Forex pairs
  if (pair === 'EUR/USD') {
    if (isAccountEur) return 10 / (entry || 1.08);
    if (isAccountUsd) return 10;
    if (isAccountGbp) return 8.0;
  }
  if (pair === 'GBP/USD') {
    if (isAccountEur) return 10 / (entry || 1.35);
    if (isAccountUsd) return 10;
    if (isAccountGbp) return 10 / (entry || 1.25);
  }
  if (pair === 'USD/JPY') {
    const valUsd = 1000 / (entry || 155);
    if (isAccountUsd) return valUsd;
    if (isAccountEur) return valUsd / 1.08;
    if (isAccountGbp) return valUsd / 1.25;
  }
  if (pair === 'AUD/USD' || pair === 'NZD/USD') {
    if (isAccountEur) return 10 / 1.08;
    if (isAccountUsd) return 10;
    if (isAccountGbp) return 8.0;
  }
  if (pair === 'USD/CAD') {
    if (isAccountUsd) return 10 / 1.36;
    if (isAccountEur) return 10 / 1.47;
    if (isAccountGbp) return 10 / 1.70;
  }
  if (pair === 'USD/CHF') {
    if (isAccountUsd) return 10 / 0.9;
    if (isAccountEur) return 10 / 0.97;
    if (isAccountGbp) return 10 / 1.12;
  }
  if (pair === 'EUR/GBP') {
    if (isAccountGbp) return 10;
    if (isAccountEur) return 10 / (entry || 0.85);
    if (isAccountUsd) return 12.5;
  }
  if (pair === 'EUR/JPY' || pair === 'GBP/JPY') {
    if (isAccountEur) return 6.0;
    if (isAccountUsd) return 6.5;
    if (isAccountGbp) return 5.5;
  }
  return 10;
};

// ── Risk Calculator Tab ────────────────────────────────
function RiskCalc({ currency }) {
  const [assetType, setAssetType] = useState('forex'); // Default to Forex
  const [capital, setCapital] = useState('');
  const [risk, setRisk] = useState('');
  const [entry, setEntry] = useState('');
  const [stop, setStop] = useState('');
  const [selectedPair, setSelectedPair] = useState('EUR/USD');
  const [spread, setSpread] = useState('1.2');

  const handlePairChange = (val) => {
    setSelectedPair(val);
    const pair = FOREX_PAIRS.find(p => p.symbol === val);
    if (pair) setSpread(String(pair.typicalSpread));
  };

  // Stock Sizing Settle
  const riskAmt = capital && risk ? (parseFloat(capital) * parseFloat(risk)) / 100 : 0;
  const diff = entry && stop ? Math.abs(parseFloat(entry) - parseFloat(stop)) : 0;
  const posSize = diff > 0 ? riskAmt / diff : 0;
  const rr = entry && stop ? (diff / (parseFloat(stop) || 1)) * 100 : 0;

  // Forex Sizing Settle
  const pairData = FOREX_PAIRS.find(p => p.symbol === selectedPair) || FOREX_PAIRS[0];
  const stopLossPips = diff > 0 ? diff / pairData.pipSize : 0;
  const pipVal = getPipValue(pairData.symbol, entry, currency);
  const positionLots = (stopLossPips > 0 && pipVal > 0) ? (riskAmt / (stopLossPips * pipVal)) : 0;
  const positionUnits = positionLots * 100000;
  const spreadCost = positionLots * parseFloat(spread || 0) * pipVal;
  const totalRisk = riskAmt + spreadCost;

  return (
    <div>
      <div className="asset-type-selector" style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button 
          className={`asset-type-btn ${assetType === 'stocks' ? 'active' : ''}`}
          onClick={() => setAssetType('stocks')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: assetType === 'stocks' ? 'rgba(var(--primary-rgb), 0.15)' : 'rgba(255,255,255,0.04)',
            border: assetType === 'stocks' ? '1px solid rgba(var(--primary-rgb), 0.4)' : '1px solid transparent',
            color: assetType === 'stocks' ? 'var(--primary)' : 'var(--text-muted)',
            transition: 'all 0.2s'
          }}
        >
          📈 Stocks (Aktien)
        </button>
        <button 
          className={`asset-type-btn ${assetType === 'forex' ? 'active' : ''}`}
          onClick={() => setAssetType('forex')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: assetType === 'forex' ? 'rgba(var(--primary-rgb), 0.15)' : 'rgba(255,255,255,0.04)',
            border: assetType === 'forex' ? '1px solid rgba(var(--primary-rgb), 0.4)' : '1px solid transparent',
            color: assetType === 'forex' ? 'var(--primary)' : 'var(--text-muted)',
            transition: 'all 0.2s'
          }}
        >
          💱 Forex (Devisen)
        </button>
      </div>

      <div className="risk-calc">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {assetType === 'forex' && (
            <>
              <div className="risk-input-group">
                <label>Forex Paar</label>
                <select 
                  value={selectedPair} 
                  onChange={e => handlePairChange(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    color: 'var(--text-main)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                >
                  {FOREX_PAIRS.map(p => <option key={p.symbol} value={p.symbol}>{p.symbol}</option>)}
                </select>
              </div>
              <div className="risk-input-group">
                <label>Spread (Pips)</label>
                <input type="number" step="0.1" placeholder="e.g. 1.2" value={spread} onChange={e => setSpread(e.target.value)} />
              </div>
            </>
          )}

          {[
            { label: `Capital (${currency})`, val: capital, set: setCapital, ph: 'e.g. 10000' },
            { label: 'Risk %', val: risk, set: setRisk, ph: 'e.g. 1' },
            { label: 'Entry Price', val: entry, set: setEntry, ph: assetType === 'forex' ? 'e.g. 1.0820' : 'e.g. 150.00' },
            { label: 'Stop Loss', val: stop, set: setStop, ph: assetType === 'forex' ? 'e.g. 1.0770' : 'e.g. 147.00' },
          ].map(f => (
            <div className="risk-input-group" key={f.label}>
              <label>{f.label}</label>
              <input type="number" step="any" placeholder={f.ph} value={f.val} onChange={e => f.set(e.target.value)} />
            </div>
          ))}
        </div>

        {assetType === 'stocks' ? (
          <div className="risk-result-panel">
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--primary)' }}>📊 Position Sizing (Stocks)</h3>
            {[
              { label: 'Risk Amount', value: `${currency}${riskAmt.toFixed(2)}` },
              { label: 'Position Size', value: `${posSize.toFixed(2)} shares` },
              { label: 'Stop Distance', value: `${currency}${diff.toFixed(4)}` },
              { label: 'Risk/Entry Ratio', value: `${rr.toFixed(2)}%` },
            ].map(r => (
              <div className="risk-result-row" key={r.label}>
                <span className="label">{r.label}</span>
                <span className="value">{r.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="risk-result-panel">
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--primary)' }}>📊 Position Sizing (Forex)</h3>
            {[
              { label: 'Capital at Risk', value: `${currency}${riskAmt.toFixed(2)}` },
              { label: 'Stop Loss (Pips)', value: `${stopLossPips.toFixed(1)} pips` },
              { label: 'Standard Lots (100k)', value: `${positionLots.toFixed(2)} Lots` },
              { label: 'Mini Lots (10k)', value: `${(positionLots * 10).toFixed(1)} Mini` },
              { label: 'Micro Lots (1k)', value: `${(positionLots * 100).toFixed(1)} Micro` },
              { label: 'Total Units', value: Math.round(positionUnits).toLocaleString() },
              { label: `Spread Cost`, value: `${currency}${spreadCost.toFixed(2)}` },
              { label: `Total Transaction Risk`, value: `${currency}${totalRisk.toFixed(2)}`, isTotal: true },
            ].map(r => (
              <div className="risk-result-row" key={r.label}>
                <span className="label" style={{ fontWeight: r.isTotal ? '800' : 'inherit' }}>{r.label}</span>
                <span className="value" style={{ fontSize: r.isTotal ? '1.25rem' : 'inherit', color: r.isTotal ? 'var(--primary)' : 'var(--text-main)' }}>{r.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Trade Report Importer Modal ───────────────────────
function TradeImportModal({ isOpen, onClose, currency }) {
  const trades = useStore(s => s.trades || []);
  const setTrades = useStore(s => s.setTrades);

  const [step, setStep] = useState(1);
  const [_fileType, setFileType] = useState(null);
  const [fileName, setFileName] = useState('');
  const [rawText, setRawText] = useState('');
  const [csvRows, setCsvRows] = useState([]);
  
  const [mappings, setMappings] = useState({
    symbol: -1, type: -1, entry: -1, exit: -1, size: -1, pnl: -1, date: -1, notes: -1
  });
  const [headerRowIndex, setHeaderRowIndex] = useState(0);
  const [parsedTrades, setParsedTrades] = useState([]);
  const [selectedTrades, setSelectedTrades] = useState(new Set());
  const [dragging, setDragging] = useState(false);

  // Reset states when modal is closed
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStep(1);
        setFileType(null);
        setFileName('');
        setRawText('');
        setCsvRows([]);
        setMappings({
          symbol: -1, type: -1, entry: -1, exit: -1, size: -1, pnl: -1, date: -1, notes: -1
        });
        setHeaderRowIndex(0);
        setParsedTrades([]);
        setSelectedTrades(new Set());
        setDragging(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const processFileContent = (name, text) => {
    setFileName(name);
    const ext = name.split('.').pop().toLowerCase();
    
    if (ext === 'json') {
      const parsed = parseJSON(text);
      if (parsed.length > 0) {
        setFileType('json');
        setParsedTrades(parsed);
        setSelectedTrades(new Set(parsed.map(t => t.id)));
        setStep(3);
      } else {
        alert("Could not parse any trades from JSON file.");
      }
    } else if (ext === 'html' || ext === 'htm') {
      const parsed = parseHTML(text);
      if (parsed.length > 0) {
        setFileType('html');
        setParsedTrades(parsed);
        setSelectedTrades(new Set(parsed.map(t => t.id)));
        setStep(3);
      } else {
        alert("Could not parse any MT4/MT5 trades from HTML file.");
      }
    } else if (ext === 'csv') {
      const rows = parseCSV(text);
      if (rows.length > 0) {
        setFileType('csv');
        setCsvRows(rows);
        const detection = detectMappings(rows);
        setHeaderRowIndex(detection.headerRowIndex);
        setMappings(detection.mappings);
        setStep(2);
      } else {
        alert("The CSV file seems to be empty.");
      }
    } else {
      // Default to text parsing or check if CSV-like
      const parsed = parseUnstructuredText(text);
      if (parsed.length > 0) {
        setFileType('txt');
        setRawText(text);
        setParsedTrades(parsed);
        setSelectedTrades(new Set(parsed.map(t => t.id)));
        setStep(3);
      } else {
        const rows = parseCSV(text);
        if (rows.length > 0 && rows[0].length > 1) {
          setFileType('csv');
          setCsvRows(rows);
          const detection = detectMappings(rows);
          setHeaderRowIndex(detection.headerRowIndex);
          setMappings(detection.mappings);
          setStep(2);
        } else {
          alert("Could not extract any trades automatically. You can paste raw text in the box below to try manual parsing.");
        }
      }
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      processFileContent(file.name, event.target.result);
    };
    reader.readAsText(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      processFileContent(file.name, event.target.result);
    };
    reader.readAsText(file);
  };

  const handleNativePDF = async () => {
    if (window.electronAPI && window.electronAPI.parsePDF) {
      try {
        const res = await window.electronAPI.parsePDF();
        if (res.success) {
          setFileType('pdf');
          setFileName(res.fileName);
          setRawText(res.text);
          const parsed = parseUnstructuredText(res.text);
          if (parsed.length > 0) {
            setParsedTrades(parsed);
            setSelectedTrades(new Set(parsed.map(t => t.id)));
            setStep(3);
          } else {
            alert("PDF read successfully, but no trades were found via auto-regex. You can paste raw text in the textarea below to try manual parsing.");
            setRawText(res.text);
          }
        } else if (res.error !== 'No file selected') {
          alert("Error parsing PDF: " + res.error);
        }
      } catch (err) {
        alert("Failed to parse PDF: " + err.message);
      }
    } else {
      alert("Electron API not available for PDF reading in this context.");
    }
  };

  const handleRawTextSubmit = () => {
    if (!rawText.trim()) return;
    const parsed = parseUnstructuredText(rawText);
    if (parsed.length > 0) {
      setParsedTrades(parsed);
      setSelectedTrades(new Set(parsed.map(t => t.id)));
      setStep(3);
    } else {
      alert("Could not extract any trades with standard patterns. Please make sure the format has date, ticker, type (buy/sell), entry price, and P&L.");
    }
  };

  const handleGenerateFromCSV = () => {
    const tradesList = mapCsvRowsToTrades(csvRows, mappings, headerRowIndex + 1);
    if (tradesList.length > 0) {
      setParsedTrades(tradesList);
      setSelectedTrades(new Set(tradesList.map(t => t.id)));
      setStep(3);
    } else {
      alert("No trades were generated. Please check your column mappings.");
    }
  };

  const handleToggleSelect = (id) => {
    const newSelected = new Set(selectedTrades);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTrades(newSelected);
  };

  const handleToggleSelectAll = () => {
    if (selectedTrades.size === parsedTrades.length) {
      setSelectedTrades(new Set());
    } else {
      setSelectedTrades(new Set(parsedTrades.map(t => t.id)));
    }
  };

  const handleUpdateParsedTrade = (id, field, value) => {
    setParsedTrades(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleCommitImport = () => {
    const toImport = parsedTrades.filter(t => selectedTrades.has(t.id));
    if (toImport.length === 0) {
      alert("Please select at least one trade to import.");
      return;
    }
    
    const newTrades = toImport.map(t => ({
      id: Date.now() + Math.random(),
      symbol: t.symbol.trim().toUpperCase(),
      type: t.type === 'Short' ? 'Short' : 'Long',
      entry: t.entry,
      exit: t.exit,
      size: t.size,
      pnl: t.pnl,
      date: t.date,
      notes: t.notes
    }));

    setTrades([...trades, ...newTrades]);
    onClose();
  };

  return (
    <div className="mac-modal-overlay" onClick={onClose}>
      <div className="mac-modal" style={{ width: step === 3 ? '850px' : '550px', transition: 'width 0.3s ease', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
        <div className="mac-modal-header">
          <span>📥 Trade Report Importer</span>
          {fileName && <span style={{ fontSize: '0.8rem', opacity: 0.6, marginLeft: 'auto' }}>({fileName})</span>}
        </div>
        
        <div className="import-steps">
          <div className={`import-step-item ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <span>1. Datei auswählen {step > 1 ? '✓' : ''}</span>
          </div>
          <div className={`import-step-item ${step === 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <span>2. Spalten zuordnen {step > 2 ? '✓' : ''}</span>
          </div>
          <div className={`import-step-item ${step === 3 ? 'active' : ''}`}>
            <span>3. Vorschau & Import</span>
          </div>
        </div>

        <div className="mac-modal-content">
          {step === 1 && (
            <div>
              <div 
                className={`import-drag-zone ${dragging ? 'dragging' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => document.getElementById('import-file-input').click()}
              >
                <div className="import-drag-icon">📁</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  Drag & drop CSV, JSON, TXT, HTML here or click to browse
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Supports auto-detection of common formats (including MT4/MT5 HTML reports)
                </div>
                <input 
                  type="file" 
                  id="import-file-input" 
                  style={{ display: 'none' }} 
                  accept=".csv,.json,.txt,.html,.htm"
                  onChange={handleFileSelect}
                />
              </div>

              <div className="import-or-divider">oder PDF-Bericht einlesen</div>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <button className="notion-button" style={{ background: 'rgba(var(--primary-rgb), 0.15)', color: 'var(--primary)', border: '1px solid rgba(var(--primary-rgb), 0.4)' }} onClick={handleNativePDF}>
                  📄 Select PDF via System Dialog
                </button>
              </div>

              <div className="import-or-divider">oder Rohtext einfügen</div>

              <div className="import-textarea-container">
                <textarea 
                  className="strategy-textarea" 
                  placeholder="Paste raw trade lines here... e.g.
2026-06-12 EURUSD Buy 1.0820 1.0890 10000 +70.00
AAPL Buy 100 180.00 185.00 +500.00" 
                  value={rawText} 
                  onChange={(e) => setRawText(e.target.value)}
                  style={{ minHeight: '120px' }}
                />
                <button 
                  className="notion-button" 
                  style={{ marginTop: '10px', width: '100%' }}
                  disabled={!rawText.trim()}
                  onClick={handleRawTextSubmit}
                >
                  Parse Pasted Text
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ padding: '15px 20px 0 20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Select which column in your CSV represents each Trade Journal field.
              </div>
              
              <div className="mapping-rows-container">
                {[
                  { key: 'symbol', label: 'Symbol / Asset (e.g. AAPL)' },
                  { key: 'type', label: 'Type (Long / Short)' },
                  { key: 'entry', label: 'Entry Price' },
                  { key: 'exit', label: 'Exit Price' },
                  { key: 'size', label: 'Position Size' },
                  { key: 'pnl', label: `P&L (${currency})` },
                  { key: 'date', label: 'Execution Date' },
                  { key: 'notes', label: 'Notes / Comments' },
                ].map(item => (
                  <div className="mapping-row" key={item.key}>
                    <span className="mapping-label">{item.label}</span>
                    <select 
                      className="mapping-select"
                      value={mappings[item.key]} 
                      onChange={(e) => setMappings({ ...mappings, [item.key]: parseInt(e.target.value) })}
                    >
                      <option value="-1">-- Not present / Ignore --</option>
                      {(csvRows[headerRowIndex] || []).map((col, idx) => (
                        <option key={idx} value={idx}>
                          Col {idx + 1}: {col || `(Empty)`}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div style={{ padding: '0 20px 20px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
                  File Row Preview (Header row: {headerRowIndex + 1})
                </div>
                <div style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                    <thead>
                      <tr>
                        {(csvRows[headerRowIndex] || []).map((col, idx) => (
                          <th key={idx} style={{ padding: '4px 8px', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>
                            Col {idx + 1}: {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvRows.slice(headerRowIndex + 1, headerRowIndex + 4).map((row, rIdx) => (
                        <tr key={rIdx}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} style={{ padding: '4px 8px', borderBottom: '1px solid var(--border-light)', whiteSpace: 'nowrap' }}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div style={{ padding: '15px 20px 0 20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Verify parsed trades. You can edit values inline, check/uncheck trades, and resolve any empty fields.
              </div>

              <div className="import-preview-table-container">
                <table className="import-preview-table">
                  <thead>
                    <tr>
                      <th style={{ width: '30px', textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          className="import-row-checkbox"
                          checked={selectedTrades.size === parsedTrades.length && parsedTrades.length > 0} 
                          onChange={handleToggleSelectAll}
                        />
                      </th>
                      <th>Symbol</th>
                      <th style={{ width: '90px' }}>Type</th>
                      <th>Entry</th>
                      <th>Exit</th>
                      <th>Size</th>
                      <th>P&L</th>
                      <th style={{ width: '120px' }}>Date</th>
                      <th>Notes</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedTrades.map((t) => {
                      const isValid = t.symbol.trim() !== '' && !isNaN(parseFloat(t.pnl || '0'));
                      return (
                        <tr key={t.id} className={!isValid ? 'invalid-row' : ''}>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="checkbox" 
                              className="import-row-checkbox"
                              checked={selectedTrades.has(t.id)} 
                              onChange={() => handleToggleSelect(t.id)}
                            />
                          </td>
                          <td>
                            <input 
                              value={t.symbol} 
                              onChange={(e) => handleUpdateParsedTrade(t.id, 'symbol', e.target.value)} 
                              placeholder="e.g. AAPL"
                              style={{ fontWeight: 700 }}
                            />
                          </td>
                          <td>
                            <select 
                              value={t.type} 
                              onChange={(e) => handleUpdateParsedTrade(t.id, 'type', e.target.value)}
                            >
                              <option>Long</option>
                              <option>Short</option>
                            </select>
                          </td>
                          <td>
                            <input 
                              type="number" 
                              step="any"
                              value={t.entry} 
                              onChange={(e) => handleUpdateParsedTrade(t.id, 'entry', e.target.value)} 
                            />
                          </td>
                          <td>
                            <input 
                              type="number" 
                              step="any"
                              value={t.exit} 
                              onChange={(e) => handleUpdateParsedTrade(t.id, 'exit', e.target.value)} 
                            />
                          </td>
                          <td>
                            <input 
                              type="number" 
                              step="any"
                              value={t.size} 
                              onChange={(e) => handleUpdateParsedTrade(t.id, 'size', e.target.value)} 
                            />
                          </td>
                          <td>
                            <input 
                              type="number" 
                              step="any"
                              value={t.pnl} 
                              onChange={(e) => handleUpdateParsedTrade(t.id, 'pnl', e.target.value)} 
                            />
                          </td>
                          <td>
                            <input 
                              type="date" 
                              value={t.date} 
                              onChange={(e) => handleUpdateParsedTrade(t.id, 'date', e.target.value)} 
                            />
                          </td>
                          <td>
                            <input 
                              value={t.notes} 
                              onChange={(e) => handleUpdateParsedTrade(t.id, 'notes', e.target.value)} 
                            />
                          </td>
                          <td>
                            {isValid ? (
                              <span className="import-badge success">Ready</span>
                            ) : (
                              <span className="import-badge warning" title="Missing symbol or numbers">Fix Required</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="mac-modal-footer">
          <button className="mac-btn mac-btn-cancel" onClick={onClose}>Cancel</button>
          
          {step === 2 && (
            <button className="mac-btn mac-btn-add" onClick={handleGenerateFromCSV}>
              Generate Preview
            </button>
          )}

          {step === 3 && (
            <button 
              className="mac-btn mac-btn-add" 
              onClick={handleCommitImport}
              disabled={selectedTrades.size === 0}
            >
              Import {selectedTrades.size} Trades
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Trade Journal Tab ─────────────────────────────────
function TradeJournal({ currency }) {
  const trades = useStore(s => s.trades || []);
  const setTrades = useStore(s => s.setTrades);
  
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [pastCollapsed, setPastCollapsed] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const add = () => setTrades([...trades, {
    id: Date.now(), symbol: '', type: 'Long', entry: '', exit: '', size: '', pnl: '', date: new Date().toISOString().split('T')[0], notes: ''
  }]);

  const del = id => setTrades(trades.filter(t => t.id !== id));
  const upd = (id, f, v) => setTrades(trades.map(t => t.id === id ? { ...t, [f]: v } : t));

  const totalPnl = trades.reduce((s, t) => s + (parseFloat(t.pnl) || 0), 0);
  const wins = trades.filter(t => parseFloat(t.pnl) > 0).length;
  const wr = trades.length ? ((wins / trades.length) * 100).toFixed(0) : 0;

  const today = new Date().toISOString().split('T')[0];
  const todayTrades = trades.filter(t => t.date === today);
  const pastTrades = trades.filter(t => t.date !== today);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortHeader = (field, label) => {
    const isSorted = sortField === field;
    return (
      <th key={field} onClick={() => handleSort(field)} className="sortable-header" style={{ cursor: 'pointer', userSelect: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {label}
          {isSorted ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : <span style={{ opacity: 0.25 }}> ↕</span>}
        </div>
      </th>
    );
  };

  const sortTradesList = useCallback((list) => {
    return [...list].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      
      if (['entry', 'exit', 'size', 'pnl'].includes(sortField)) {
        valA = parseFloat(valA) || 0;
        valB = parseFloat(valB) || 0;
      } else {
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
      }
      
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sortField, sortDirection]);

  const sortedTodayTrades = useMemo(() => sortTradesList(todayTrades), [todayTrades, sortTradesList]);
  const sortedPastTrades = useMemo(() => sortTradesList(pastTrades), [pastTrades, sortTradesList]);

  const renderTradeTable = (tradesList, emptyMessage) => {
    return (
      <div className="trading-table-container">
        <table className="trading-table">
          <thead>
            <tr>
              {renderSortHeader('symbol', 'Symbol')}
              {renderSortHeader('type', 'Type')}
              {renderSortHeader('entry', 'Entry')}
              {renderSortHeader('exit', 'Exit')}
              {renderSortHeader('size', 'Size')}
              {renderSortHeader('pnl', `P&L (${currency})`)}
              {renderSortHeader('date', 'Date')}
              {renderSortHeader('notes', 'Notes')}
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {tradesList.map(t => (
              <tr key={t.id}>
                <td><input value={t.symbol} onChange={e => upd(t.id, 'symbol', e.target.value)} placeholder="AAPL" style={{ fontWeight: 700, width: 70 }} /></td>
                <td>
                  <select value={t.type} onChange={e => upd(t.id, 'type', e.target.value)} style={{ background: 'transparent', border: 'none', color: t.type === 'Long' ? 'var(--green-text)' : 'var(--red-text)', fontWeight: 700, cursor: 'pointer' }}>
                    <option>Long</option><option>Short</option>
                  </select>
                </td>
                {['entry', 'exit', 'size', 'pnl'].map(f => (
                  <td key={f}><input type="number" step="any" value={t[f]} onChange={e => upd(t.id, f, e.target.value)} placeholder="0" style={{ width: 70 }} /></td>
                ))}
                <td><input type="date" value={t.date} onChange={e => upd(t.id, 'date', e.target.value)} /></td>
                <td><input value={t.notes} onChange={e => upd(t.id, 'notes', e.target.value)} placeholder="Notes..." /></td>
                <td><button onClick={() => del(t.id)} style={{ color: 'var(--red-text)', fontSize: '1.1rem', background: 'none', border: 'none', cursor: 'pointer' }}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!tradesList.length && <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{emptyMessage}</div>}
      </div>
    );
  };

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>📅 Today's Trades (Heutige Trades)</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="notion-button" style={{ background: 'var(--blue-bg)', color: 'var(--blue-text)' }} onClick={() => setIsImportModalOpen(true)}>
            📥 Import Report
          </button>
          <button className="notion-button" onClick={add}>+ New Trade</button>
        </div>
      </div>

      {renderTradeTable(sortedTodayTrades, 'No trades logged today. Click "+ New Trade" to log one.')}

      <div className="past-trades-accordion" style={{ marginTop: 24 }}>
        <div 
          className="past-trades-header-bar" 
          onClick={() => setPastCollapsed(!pastCollapsed)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 18px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            userSelect: 'none'
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            🕒 Vergangene Trades ({sortedPastTrades.length})
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {pastCollapsed ? '▼ Ausklappen' : '▲ Einklappen'}
          </span>
        </div>
        {!pastCollapsed && (
          <div style={{ marginTop: 12 }}>
            {renderTradeTable(sortedPastTrades, 'No past trades recorded.')}
          </div>
        )}
      </div>

      <TradeImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        currency={currency} 
      />
    </div>
  );
}

// ── Market Hours / Sessions Clocks Tab ───────────────────
function TradingSessions() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (tz) => {
    return time.toLocaleTimeString('de-DE', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const formatDate = (tz) => {
    return time.toLocaleDateString('de-DE', { timeZone: tz, weekday: 'short', day: 'numeric', month: 'short' });
  };

  const sessions = [
    { id: 'sydney', name: 'Sydney', tz: 'Australia/Sydney', open: 8, close: 17, emoji: '🇦🇺' },
    { id: 'tokyo', name: 'Tokyo', tz: 'Asia/Tokyo', open: 9, close: 18, emoji: '🇯🇵' },
    { id: 'london', name: 'London', tz: 'Europe/London', open: 8, close: 17, emoji: '🇬🇧' },
    { id: 'newyork', name: 'New York', tz: 'America/New_York', open: 8, close: 17, emoji: '🇺🇸' },
  ];

  const getSessionStatus = (s) => {
    let localTimeStr;
    try {
      localTimeStr = time.toLocaleTimeString('en-US', { timeZone: s.tz, hour12: false, hour: 'numeric', minute: 'numeric', second: 'numeric' });
    } catch {
      localTimeStr = time.toLocaleTimeString('en-US', { hour12: false, hour: 'numeric', minute: 'numeric', second: 'numeric' });
    }
    const [h, m, sec] = localTimeStr.split(':').map(Number);
    const currentDec = h + m / 60 + sec / 3600;
    
    const isOpen = currentDec >= s.open && currentDec < s.close;
    
    let countdownText = '';
    if (isOpen) {
      const diffSecs = Math.max(0, Math.floor((s.close - currentDec) * 3600));
      const hours = Math.floor(diffSecs / 3600);
      const minutes = Math.floor((diffSecs % 3600) / 60);
      countdownText = `Schließt in ${hours} Std. ${minutes} Min.`;
    } else {
      let diffHours = 0;
      if (currentDec < s.open) {
        diffHours = s.open - currentDec;
      } else {
        diffHours = (24 - currentDec) + s.open;
      }
      const diffSecs = Math.max(0, Math.floor(diffHours * 3600));
      const hours = Math.floor(diffSecs / 3600);
      const minutes = Math.floor((diffSecs % 3600) / 60);
      countdownText = `Öffnet in ${hours} Std. ${minutes} Min.`;
    }
    
    return { isOpen, countdownText };
  };

  const localTimezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const isSessionOpenAtLocalHour = (s, localHour) => {
    const d = new Date(time);
    d.setHours(localHour, 0, 0, 0);
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: s.tz,
        hour: 'numeric',
        hour12: false
      });
      const tzHour = parseInt(formatter.format(d), 10);
      return tzHour >= s.open && tzHour < s.close;
    } catch {
      return false;
    }
  };

  const currentLocalHour = time.getHours();

  const sydneyStatus = getSessionStatus(sessions[0]);
  const tokyoStatus = getSessionStatus(sessions[1]);
  const londonStatus = getSessionStatus(sessions[2]);
  const newyorkStatus = getSessionStatus(sessions[3]);

  const overlaps = [];
  if (londonStatus.isOpen && newyorkStatus.isOpen) {
    overlaps.push({ name: 'London & New York Overlap', desc: '🔥 Peak Volatility & Volume (Haupt-Handelszeit)', color: 'var(--primary)' });
  }
  if (tokyoStatus.isOpen && londonStatus.isOpen) {
    overlaps.push({ name: 'Tokyo & London Overlap', desc: '⚡ Moderate Volatility (Asien/Europa-Übergang)', color: 'var(--green-text)' });
  }
  if (sydneyStatus.isOpen && tokyoStatus.isOpen) {
    overlaps.push({ name: 'Sydney & Tokyo Overlap', desc: '🌏 Standard Volatility (Pazifik/Asien-Sitzung)', color: '#4cc9f0' });
  }

  return (
    <div className="sessions-container" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {overlaps.length > 0 && (
        <div className="overlaps-banners" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {overlaps.map(o => (
            <div key={o.name} className="overlap-banner-card" style={{ borderLeft: `4px solid ${o.color}`, background: 'rgba(255,255,255,0.02)', padding: '12px 18px', borderRadius: '0 8px 8px 0', border: '1px solid var(--border-color)', borderLeftWidth: 4 }}>
              <div className="overlap-banner-title" style={{ fontWeight: 800, fontSize: '0.9rem', color: o.color }}>{o.name}</div>
              <div className="overlap-banner-desc" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{o.desc}</div>
            </div>
          ))}
        </div>
      )}

      <div className="sessions-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {sessions.map(s => {
          const { isOpen, countdownText } = getSessionStatus(s);
          return (
            <div key={s.id} className={`session-card ${isOpen ? 'open' : 'closed'}`} style={{ background: 'var(--card-bg)', border: `1px solid ${isOpen ? 'rgba(34, 197, 94, 0.3)' : 'var(--border-color)'}`, borderRadius: 12, padding: 18, position: 'relative', overflow: 'hidden' }}>
              {isOpen && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--green-text)' }} />}
              <div className="session-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span className="session-emoji-name" style={{ fontWeight: 800, fontSize: '0.95rem' }}>{s.emoji} {s.name}</span>
                <span 
                  className={`session-badge ${isOpen ? 'open' : 'closed'}`}
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 20,
                    background: isOpen ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.06)',
                    color: isOpen ? 'var(--green-text)' : 'var(--text-muted)'
                  }}
                >
                  {isOpen ? '● OPEN' : 'CLOSED'}
                </span>
              </div>
              <div className="session-time" style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>{formatTime(s.tz)}</div>
              <div className="session-date" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16 }}>{formatDate(s.tz)}</div>
              <div className="session-hours-info" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 10 }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Lokale Stunden: {s.open}:00 - {s.close === 18 ? '18:00' : '17:00'}</div>
                <div style={{ color: isOpen ? 'var(--green-text)' : 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, marginTop: 4 }}>
                  {countdownText}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="sessions-timeline-section" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 20 }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: 'var(--text-main)' }}>🕒 Forex Session Timeline</h3>
        <p style={{ margin: '0 0 18px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Lokale PC-Zeitzone: <strong>{localTimezoneName}</strong> (aktuell: {time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr)
        </p>
        
        <div className="timeline-container-wrapper" style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 640 }}>
            {/* Hours Header Row */}
            <div className="timeline-hours-header" style={{ display: 'flex', alignItems: 'center', marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 6 }}>
              <div className="timeline-row-label" style={{ width: 100, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Session</div>
              <div className="timeline-hours-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', flex: 1, gap: 2 }}>
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className={`timeline-hour-marker ${i === currentLocalHour ? 'current' : ''}`} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: i === currentLocalHour ? '800' : '600', color: i === currentLocalHour ? 'var(--primary)' : 'var(--text-muted)' }}>
                    {String(i).padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Session Rows */}
            {sessions.map(s => (
              <div key={s.id} className="timeline-row" style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                <div className="timeline-row-label" style={{ width: 100, fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  <span>{s.emoji} {s.name}</span>
                </div>
                <div className="timeline-hours-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', flex: 1, gap: 2 }}>
                  {Array.from({ length: 24 }, (_, i) => {
                    const isOpen = isSessionOpenAtLocalHour(s, i);
                    const isCurrent = i === currentLocalHour;
                    return (
                      <div 
                        key={i} 
                        className={`timeline-hour-block ${isOpen ? 'open' : 'closed'} ${isCurrent ? 'current' : ''}`}
                        style={{
                          height: 24,
                          borderRadius: 4,
                          background: isOpen 
                            ? (isCurrent ? 'rgba(34, 197, 94, 0.45)' : 'rgba(34, 197, 94, 0.2)') 
                            : (isCurrent ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255,255,255,0.03)'),
                          border: isCurrent ? '1.5px solid var(--primary)' : isOpen ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid rgba(255,255,255,0.02)',
                          boxShadow: isCurrent ? '0 0 6px rgba(var(--primary-rgb), 0.5)' : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        title={`${s.name} Session: ${isOpen ? 'Offen' : 'Geschlossen'} um ${i}:00 Uhr`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
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

  /* eslint-disable react-hooks/purity */
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
  /* eslint-enable react-hooks/purity */

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
  { id: 'risk', label: 'Risiko Berechner', emoji: '⚖️' },
  { id: 'sessions', label: 'Market Hours', emoji: '⏰' },
  { id: 'trends', label: 'Trend Analyser', emoji: '📈' },
  { id: 'analyse', label: 'Analyse Tool', emoji: '🔍' },
  { id: 'plan', label: 'Plan', emoji: '📋' },
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
      case 'risk': return <RiskCalc currency={currency} />;
      case 'sessions': return <TradingSessions />;
      case 'trends': return <TrendAnalyser />;
      case 'analyse': return <AnalyseTool />;
      case 'plan': return <TradingPlan />;
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
