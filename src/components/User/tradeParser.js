// ── Trade Report Importer Utility Functions ──────────────

const KEYWORDS = {
  symbol: ['symbol', 'pair', 'ticker', 'asset', 'instrument', 'contract', 'währungspaar', 'wertpapier', 'wkn', 'isin'],
  type: ['type', 'action', 'side', 'direction', 'buy/sell', 'trans', 'richtung', 'typ', 'transaktion'],
  entry: ['entry', 'open', 'buy price', 'entry price', 'open price', 'preis', 'einstieg', 'eröffnungspreis'],
  exit: ['exit', 'close', 'sell price', 'exit price', 'close price', 'ausstieg', 'schlusspreis'],
  size: ['size', 'qty', 'quantity', 'volume', 'lots', 'amount', 'menge', 'kontrakte', 'stückzahl'],
  pnl: ['pnl', 'p&l', 'profit', 'loss', 'net profit', 'gain', 'gewinn', 'verlust', 'ertrag'],
  date: ['date', 'time', 'timestamp', 'created', 'execution time', 'datum', 'zeit', 'erstellt'],
  notes: ['notes', 'comment', 'description', 'memo', 'notizen', 'kommentar', 'beschreibung']
};

/**
 * Parses raw CSV string, handling quotes and auto-detecting separator.
 */
export function parseCSV(text) {
  const lines = [];
  let row = [];
  let inQuotes = false;
  let cell = '';
  
  const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Detect separator (comma, semicolon, or tab)
  const firstLines = cleanText.split('\n').slice(0, 5);
  let commas = 0, semicolons = 0, tabs = 0;
  for (const line of firstLines) {
    commas += (line.match(/,/g) || []).length;
    semicolons += (line.match(/;/g) || []).length;
    tabs += (line.match(/\t/g) || []).length;
  }
  
  let separator = ',';
  if (semicolons > commas && semicolons > tabs) separator = ';';
  else if (tabs > commas && tabs > semicolons) separator = '\t';
  
  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === separator && !inQuotes) {
      row.push(cell.trim());
      cell = '';
    } else if (char === '\n' && !inQuotes) {
      row.push(cell.trim());
      lines.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (cell || row.length > 0) {
    row.push(cell.trim());
    lines.push(row);
  }
  return lines.filter(r => r.length > 0 && r.some(c => c !== ''));
}

/**
 * Identifies the header row and tries to auto-detect columns.
 */
export function detectMappings(rows) {
  if (rows.length === 0) return { headerRowIndex: 0, mappings: {} };
  
  // Find the header row (typically row 0, 1 or 2)
  let headerRowIndex = 0;
  let maxMatches = 0;
  
  for (let r = 0; r < Math.min(rows.length, 5); r++) {
    let matches = 0;
    for (const cell of rows[r]) {
      const lowerCell = cell.toLowerCase().trim();
      for (const key in KEYWORDS) {
        if (KEYWORDS[key].some(kw => lowerCell.includes(kw))) {
          matches++;
          break;
        }
      }
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      headerRowIndex = r;
    }
  }
  
  const headers = rows[headerRowIndex] || [];
  const mappings = {};
  
  // Initialize
  for (const key in KEYWORDS) {
    mappings[key] = -1;
  }
  
  // First pass: exact match or normalized check
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].toLowerCase().trim();
    for (const key in KEYWORDS) {
      if (mappings[key] === -1 && KEYWORDS[key].some(kw => header === kw || header.replace(/[^a-z0-9]/g, '').includes(kw.replace(/[^a-z0-9]/g, '')))) {
        mappings[key] = i;
      }
    }
  }
  
  // Second pass: contains check
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].toLowerCase().trim();
    for (const key in KEYWORDS) {
      if (mappings[key] === -1 && KEYWORDS[key].some(kw => header.includes(kw))) {
        mappings[key] = i;
      }
    }
  }
  
  return {
    headerRowIndex,
    mappings
  };
}

/**
 * Extracts trade fields from mapped CSV rows.
 */
export function mapCsvRowsToTrades(rows, mappings, startRowIndex) {
  const trades = [];
  
  for (let r = startRowIndex; r < rows.length; r++) {
    const row = rows[r];
    if (row.length === 0) continue;
    
    // Get fields
    const symbol = mappings.symbol !== -1 ? (row[mappings.symbol] || '') : '';
    // Skip empty lines
    if (!symbol) continue;
    
    let typeVal = mappings.type !== -1 ? (row[mappings.type] || 'Long') : 'Long';
    let type = 'Long';
    const cleanTypeVal = typeVal.toLowerCase().trim();
    if (['sell', 'short', 'put', 's', 'shorten'].includes(cleanTypeVal)) {
      type = 'Short';
    }
    
    const entry = mappings.entry !== -1 ? (row[mappings.entry] || '') : '';
    const exit = mappings.exit !== -1 ? (row[mappings.exit] || '') : '';
    const size = mappings.size !== -1 ? (row[mappings.size] || '') : '';
    const pnl = mappings.pnl !== -1 ? (row[mappings.pnl] || '') : '';
    
    let date = new Date().toISOString().split('T')[0];
    if (mappings.date !== -1 && row[mappings.date]) {
      const rawDate = row[mappings.date].trim();
      const cleanDate = rawDate.replace(/\./g, '-').replace(/\//g, '-');
      const parts = cleanDate.split('-');
      if (parts[0].length === 2 && parts[2].length === 4) {
        // DD-MM-YYYY to YYYY-MM-DD
        date = `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else if (parts[0].length === 4) {
        date = cleanDate.substring(0, 10);
      }
    }
    
    const notes = mappings.notes !== -1 ? (row[mappings.notes] || '') : 'Imported from CSV';
    
    trades.push({
      id: Date.now() + Math.random(),
      symbol: symbol.toUpperCase(),
      type,
      entry,
      exit,
      size,
      pnl,
      date,
      notes
    });
  }
  
  return trades;
}

/**
 * Parses JSON structured as array of objects or E.O.M exported backups.
 */
export function parseJSON(text) {
  try {
    const parsed = JSON.parse(text);
    let items = [];
    
    if (Array.isArray(parsed)) {
      items = parsed;
    } else if (parsed.state && Array.isArray(parsed.state.trades)) {
      items = parsed.state.trades;
    } else if (Array.isArray(parsed.trades)) {
      items = parsed.trades;
    } else {
      // Look for any array inside the object
      for (const key in parsed) {
        if (Array.isArray(parsed[key])) {
          items = parsed[key];
          break;
        }
      }
    }
    
    return items.map(item => {
      // Standardize fields
      const symbol = item.symbol || item.ticker || item.pair || '';
      let type = 'Long';
      const typeVal = String(item.type || item.action || item.direction || 'Long').toLowerCase();
      if (['sell', 'short', 'put', 's'].includes(typeVal)) {
        type = 'Short';
      }
      
      return {
        id: item.id || (Date.now() + Math.random()),
        symbol: symbol.toUpperCase(),
        type,
        entry: String(item.entry ?? item.price ?? item.entryPrice ?? ''),
        exit: String(item.exit ?? item.close ?? item.exitPrice ?? ''),
        size: String(item.size ?? item.qty ?? item.quantity ?? item.lots ?? ''),
        pnl: String(item.pnl ?? item.profit ?? item.gain ?? ''),
        date: item.date || new Date().toISOString().split('T')[0],
        notes: item.notes || item.comment || 'Imported from JSON'
      };
    }).filter(t => t.symbol);
  } catch (e) {
    console.error("JSON parsing error:", e);
    return [];
  }
}

/**
 * Regex-based parser for unstructured text logs / PDFs.
 */
export function parseUnstructuredText(text) {
  const lines = text.split(/\r?\n/);
  const parsedTrades = [];
  
  const dateRegex = /\b(\d{4}[-/.]\d{2}[-/.]\d{2}|\d{2}[-/.]\d{2}[-/.]\d{4})\b/;
  const typeRegex = /\b(buy|sell|long|short|call|put|b|s|l)\b/i;
  const symbolRegex = /\b([A-Z]{2,6}\/?[A-Z]{2,4}|[A-Z]{3,8}|[A-Z]+-[A-Z]+)\b/;
  const timeRegex = /\b\d{2}:\d{2}(?::\d{2})?\b/g;
  
  // Labeled numeric patterns (e.g. Size: 50, PnL: -120)
  const sizeLabelRegex = /\b(?:size|qty|quantity|lots|volume|amount|stück)\s*[:=]?\s*([+-]?\d+(?:\.\d+)?)\b/i;
  const pnlLabelRegex = /\b(?:pnl|profit|loss|gain|gewinn|p&l)\s*[:=]?\s*([+-]?\d+(?:\.\d+)?)\b/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    const dateMatch = trimmed.match(dateRegex);
    const typeMatch = trimmed.match(typeRegex);
    const symbolMatch = trimmed.match(symbolRegex);
    
    if (!symbolMatch) continue;

    // 1. Extract labeled data first
    let size = 1;
    let sizeFound = false;
    const sizeMatch = trimmed.match(sizeLabelRegex);
    if (sizeMatch) {
      size = parseFloat(sizeMatch[1]);
      sizeFound = true;
    }

    let pnl = 0;
    let pnlFound = false;
    const pnlMatch = trimmed.match(pnlLabelRegex);
    if (pnlMatch) {
      pnl = parseFloat(pnlMatch[1]);
      pnlFound = true;
    }

    // 2. Preprocess string to strip dates, times, and labeled items
    let lineForNumbers = trimmed;
    if (dateMatch) {
      lineForNumbers = lineForNumbers.replace(dateMatch[0], ' ');
    }
    lineForNumbers = lineForNumbers.replace(timeRegex, ' ');
    if (sizeMatch) {
      lineForNumbers = lineForNumbers.replace(sizeMatch[0], ' ');
    }
    if (pnlMatch) {
      lineForNumbers = lineForNumbers.replace(pnlMatch[0], ' ');
    }

    // 3. Find remaining generic numbers
    const numbers = [];
    let numMatch;
    const localNumRegex = /([+-]?\b\d+(?:\.\d+)?\b)/g;
    while ((numMatch = localNumRegex.exec(lineForNumbers)) !== null) {
      const valStr = numMatch[1];
      numbers.push({
        value: parseFloat(valStr),
        str: valStr,
        index: numMatch.index
      });
    }
    
    let date = new Date().toISOString().split('T')[0];
    if (dateMatch) {
      let dateStr = dateMatch[0].replace(/\./g, '-').replace(/\//g, '-');
      const parts = dateStr.split('-');
      if (parts[0].length === 2 && parts[2].length === 4) {
        dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      date = dateStr;
    }
    
    const symbol = symbolMatch[0].toUpperCase();
    
    let type = 'Long';
    if (typeMatch) {
      const t = typeMatch[0].toLowerCase();
      if (['sell', 'short', 'put', 's'].includes(t)) {
        type = 'Short';
      }
    }
    
    // 4. Map PnL if not already found from label
    if (!pnlFound) {
      let pnlIndex = numbers.findIndex(n => n.str.startsWith('+') || n.str.startsWith('-'));
      if (pnlIndex === -1 && numbers.length >= 2) {
        pnlIndex = numbers.length - 1;
      }
      if (pnlIndex !== -1) {
        pnl = numbers[pnlIndex].value;
        numbers.splice(pnlIndex, 1);
      }
    }
    
    // 5. Map Entry, Exit, and Size from remaining numbers
    let entry = 0;
    let exit = 0;
    
    if (!sizeFound) {
      if (numbers.length === 1) {
        entry = numbers[0].value;
      } else if (numbers.length === 2) {
        entry = numbers[0].value;
        exit = numbers[1].value;
      } else if (numbers.length >= 3) {
        const firstIsInt = Number.isInteger(numbers[0].value);
        if (firstIsInt && numbers[0].value > 5) {
          size = numbers[0].value;
          entry = numbers[1].value;
          exit = numbers[2].value;
        } else {
          entry = numbers[0].value;
          exit = numbers[1].value;
          size = numbers[2].value;
        }
      }
    } else {
      // Size was already found from label, map remaining to entry/exit
      if (numbers.length === 1) {
        entry = numbers[0].value;
      } else if (numbers.length >= 2) {
        entry = numbers[0].value;
        exit = numbers[1].value;
      }
    }
    
    // Estimate exit if missing
    if (entry > 0 && exit === 0 && pnl !== 0) {
      if (type === 'Long') {
        exit = entry + (pnl / size);
      } else {
        exit = entry - (pnl / size);
      }
    }
    
    parsedTrades.push({
      id: Date.now() + Math.random(),
      symbol,
      type,
      entry: entry.toString(),
      exit: exit.toString(),
      size: size.toString(),
      pnl: pnl.toString(),
      date,
      notes: `Parsed line: ${trimmed.substring(0, 50)}${trimmed.length > 50 ? '...' : ''}`
    });
  }
  
  return parsedTrades;
}

/**
 * Parses MT4 and MT5 HTML Trade Reports.
 */
export function parseHTML(text) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');
  const trades = [];
  
  const rows = doc.querySelectorAll('tr');
  
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length < 9) return;
    
    const cellTexts = Array.from(cells).map(c => c.textContent.trim());
    
    // MT5 Positions Row check (cell 0 matches date, cell 3 matches buy/sell)
    const isDateMT5 = /\d{4}\.\d{2}\.\d{2}/.test(cellTexts[0]);
    const isTypeMT5 = ['buy', 'sell'].includes(cellTexts[3]?.toLowerCase());
    
    // MT4 Closed Transactions Row check (cell 1 matches date, cell 2 matches buy/sell)
    const isDateMT4 = /\d{4}\.\d{2}\.\d{2}/.test(cellTexts[1]);
    const isTypeMT4 = ['buy', 'sell'].includes(cellTexts[2]?.toLowerCase());
    
    if (isDateMT5 && isTypeMT5) {
      const date = cellTexts[0].replace(/\./g, '-').substring(0, 10);
      const ticket = cellTexts[1];
      const symbol = cellTexts[2];
      const type = cellTexts[3].toLowerCase() === 'sell' ? 'Short' : 'Long';
      
      const hasHiddenCell = cells[4]?.classList.contains('hidden') || cells[4]?.getAttribute('colspan') === '8';
      let volume = '0';
      let entry = '0';
      let exit = '0';
      let profit = '0';
      
      if (hasHiddenCell && cellTexts.length >= 14) {
        volume = cellTexts[5];
        entry = cellTexts[6];
        exit = cellTexts[10];
        profit = cellTexts[13];
      } else {
        volume = cellTexts[4];
        entry = cellTexts[5];
        exit = cellTexts[9];
        profit = cellTexts[cellTexts.length - 1];
      }
      
      // Clean comma separators commonly used in European locales
      profit = profit.replace(/\s/g, '').replace(/,/g, '');
      entry = entry.replace(/,/g, '');
      exit = exit.replace(/,/g, '');
      volume = volume.replace(/,/g, '');

      trades.push({
        id: Date.now() + Math.random(),
        symbol: symbol.toUpperCase(),
        type,
        entry,
        exit,
        size: volume,
        pnl: profit,
        date,
        notes: `MT5 Position #${ticket}`
      });
    } else if (isDateMT4 && isTypeMT4) {
      const ticket = cellTexts[0];
      const date = cellTexts[1].replace(/\./g, '-').substring(0, 10);
      const type = cellTexts[2].toLowerCase() === 'sell' ? 'Short' : 'Long';
      let volume = cellTexts[3];
      const symbol = cellTexts[4];
      let entry = cellTexts[5];
      let exit = cellTexts[9] || cellTexts[8];
      let profit = cellTexts[cellTexts.length - 1];
      
      profit = profit.replace(/\s/g, '').replace(/,/g, '');
      entry = entry.replace(/,/g, '');
      exit = exit.replace(/,/g, '');
      volume = volume.replace(/,/g, '');

      trades.push({
        id: Date.now() + Math.random(),
        symbol: symbol.toUpperCase(),
        type,
        entry,
        exit,
        size: volume,
        pnl: profit,
        date,
        notes: `MT4 Ticket #${ticket}`
      });
    }
  });
  
  return trades;
}

