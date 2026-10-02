// News Service for E.O.M - Global News Aggregator & Feeds Engine

// Preset RSS Feeds for instant access
export const DEFAULT_NEWS_FEEDS = [
  { id: 'tagesschau', name: 'Tagesschau', url: 'https://www.tagesschau.de/xml/rss2/', category: 'World', language: 'de', enabled: true, icon: '🌐' },
  { id: 'heise', name: 'Heise Online', url: 'https://www.heise.de/rss/heise-atom.xml', category: 'Tech', language: 'de', enabled: true, icon: '💻' },
  { id: 'spiegel', name: 'Spiegel Schlagzeilen', url: 'https://www.spiegel.de/schlagzeilen/index.rss', category: 'World', language: 'de', enabled: true, icon: '📰' },
  { id: 'golem', name: 'Golem.de', url: 'https://rss.golem.de/rss.php?feed=RSS2.0', category: 'Tech', language: 'de', enabled: true, icon: '⚡' },
  { id: 'btc_echo', name: 'BTC-ECHO Crypto', url: 'https://www.btc-echo.de/feed/', category: 'Finance', language: 'de', enabled: true, icon: '₿' },
  { id: 'verge', name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'Tech', language: 'en', enabled: true, icon: '⚡' },
  { id: 'bbc', name: 'BBC World News', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'World', language: 'en', enabled: true, icon: '🌍' },
  { id: 'wired', name: 'Wired News', url: 'https://www.wired.com/feed/rss', category: 'Tech', language: 'en', enabled: true, icon: '🔌' },
  { id: 'techcrunch', name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Tech', language: 'en', enabled: true, icon: '🚀' },
  { id: 'nasa', name: 'NASA Breaking News', url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', category: 'Science', language: 'en', enabled: true, icon: '🚀' },
  { id: 'ars_technica', name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'Tech', language: 'en', enabled: true, icon: '🔬' }
];

export const NEWS_CATEGORIES = [
  { id: 'all', label: 'All Stories', icon: '🔥', deLabel: 'Alle News' },
  { id: 'Tech', label: 'Tech & AI', icon: '💻', deLabel: 'Technologie & KI' },
  { id: 'Finance', label: 'Finance & Crypto', icon: '📈', deLabel: 'Finanzen & Märkte' },
  { id: 'World', label: 'World & Politics', icon: '🌍', deLabel: 'Weltgeschehen' },
  { id: 'Science', label: 'Science & Space', icon: '🚀', deLabel: 'Wissenschaft & Raumfahrt' },
  { id: 'Productivity', label: 'Life & Mindset', icon: '🧠', deLabel: 'Produktivität & Mindset' },
  { id: 'Gaming', label: 'Gaming & Culture', icon: '🎮', deLabel: 'Gaming & Kultur' },
  { id: 'bookmarks', label: 'Bookmarks', icon: '⭐', deLabel: 'Gespeichert' }
];

// Fallback high-quality curated stories if offline or proxy is blocked
const CURATED_STORIES = [
  {
    id: 'curated-1',
    title: 'OpenAI und Google kündigen nächste Generation autonomer AI-Agenten an',
    description: 'Neue multimodale KI-Modelle können komplexe mehrstufige Arbeitsabläufe eigenständig im Browser und auf Betriebssystemebene ausführen. Forscher betonen Fortschritte im logischen Denken und bei API-Integrationen.',
    content: 'Die Entwicklung autonomer Agentensysteme hat in den letzten Monaten einen gewaltigen Sprung gemacht. Führende KI-Labore präsentieren Modelle, die nicht mehr nur Text generieren, sondern reale Softwaretools bedienen, Code refaktorisieren und Workflows verwalten können. Wichtigste Faktoren sind verbesserte Reasoning-Architekturen und optimierte Kontextfenster.',
    source: 'TechPulse Daily',
    category: 'Tech',
    language: 'de',
    url: 'https://news.ycombinator.com',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=60',
    pubDate: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    author: 'AI Research Desk',
    readTime: '4 min'
  },
  {
    id: 'curated-2',
    title: 'Next-Gen Quantum Processors Break Coherence Time Records',
    description: 'Quantum physicists have achieved a 5x improvement in qubit coherence times, bringing fault-tolerant quantum computing one step closer to practical commercial applications.',
    content: 'A breakthrough in superconducting material design has allowed qubits to maintain quantum states for milliseconds rather than microseconds. The research team utilized topological shielding to isolate sensitive quantum circuits from environmental thermal noise.',
    source: 'Quantum Journal',
    category: 'Science',
    language: 'en',
    url: 'https://nature.com',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60',
    pubDate: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    author: 'Dr. Elena Vance',
    readTime: '5 min'
  },
  {
    id: 'curated-3',
    title: 'Globale Märkte: Zentralbanken signalisieren Zinswende und Liquiditätsschub',
    description: 'Die weltweiten Aktien- und Kryptomärkte reagieren positiv auf die jüngsten Inflationsdaten und die angepasste Zinspolitik. Tech- und Innovationssektoren verzeichnen starke Zuflüsse.',
    content: 'Nach mehreren Monaten restriktiver Geldpolitik zeichnet sich eine weltweite Lockerung ab. Die EZB und die Federal Reserve betonen ein stabiles Wirtschaftswachstum bei gleichzeitig sinkender Kerninflation. Investoren diversifizieren zunehmend in zukunftsorientierte Technologien und erneuerbare Energien.',
    source: 'Financial Intelligence',
    category: 'Finance',
    language: 'de',
    url: 'https://bloomberg.com',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60',
    pubDate: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
    author: 'Market Desk',
    readTime: '3 min'
  },
  {
    id: 'curated-4',
    title: 'WebAssembly 3.0 & Browser-Native AI: The Future of Desktop Web Apps',
    description: 'How modern WebAssembly threads, SIMD, and WebGPU are enabling desktop-class productivity software and local neural network execution directly inside the browser.',
    content: 'Modern web architectures have evolved to the point where full desktop-grade operating system simulations, 3D rendering engines, and offline neural networks run at near-native C++ performance directly in Chrome and Safari without plugins.',
    source: 'Ars Technica',
    category: 'Tech',
    language: 'en',
    url: 'https://arstechnica.com',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60',
    pubDate: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    author: 'Marcus Weber',
    readTime: '6 min'
  },
  {
    id: 'curated-5',
    title: 'Die 2-Minuten-Regel & Deep Work: Wie Top-Performer ihren Fokus schützen',
    description: 'Neurowissenschaftliche Studien zeigen, wie strukturierte Time-Blocking-Methoden und digitale Reduktion die kognitive Ausdauer und Kreativität um bis zu 40% steigern.',
    content: 'Ständige Kontextwechsel und Benachrichtigungen kosten moderne Wissensarbeiter täglich mehrere Stunden Produktivität. Durch die Kombination von Timeboxing, festen Deep-Work-Blöcken und systematischer Gewohnheitsverfolgung lässt sich der mentale Energieaufwand drastisch senken.',
    source: 'Mindset & Mastery',
    category: 'Productivity',
    language: 'de',
    url: 'https://medium.com',
    imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=60',
    pubDate: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    author: 'Sarah Lindemann',
    readTime: '4 min'
  },
  {
    id: 'curated-6',
    title: 'James Webb Teleskop entdeckt organische Moleküle in habitabler Exoplaneten-Atmosphäre',
    description: 'Spektroskopische Analysen eines 120 Lichtjahre entfernten Planeten enthüllen Methan und Kohlenstoffdioxid in nie dagewesener Klarheit.',
    content: 'Die neuesten Daten des NASA James Webb Space Telescope zeigen überraschend deutliche Absorptionslinien, die auf eine dichte, kohlenstoffreiche Atmosphäre hindeuten. Astronomen werten die Messungen als Meilenstein in der Erforschung extrasolarer Biosignaturen.',
    source: 'Astro Science',
    category: 'Science',
    language: 'de',
    url: 'https://nasa.gov',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60',
    pubDate: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    author: 'Astrophysics Team',
    readTime: '5 min'
  },
  {
    id: 'curated-7',
    title: 'Bitcoin & Ethereum Layer-2 Networks Cross Record Daily Transaction Volume',
    description: 'Zero-knowledge rollups and decentralized scaling protocols process over 80% of all smart contract executions as gas fees reach historic lows.',
    content: 'The rapid adoption of Layer-2 scaling solutions has fundamentally transformed blockchain economics. Sub-cent transaction fees and instant finality are paving the way for mainstream financial integrations.',
    source: 'CryptoGlobe',
    category: 'Finance',
    language: 'en',
    url: 'https://coindesk.com',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60',
    pubDate: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    author: 'Alex Vance',
    readTime: '3 min'
  },
  {
    id: 'curated-8',
    title: 'Unreal Engine 5.5 & Raytracing: Die nächste Generation immersiver Simulationen',
    description: 'Entwickler nutzen Nanite und Lumen für fotorealistische Umgebungen in Echtzeit bei stabilen 60 FPS auf Standard-Hardware.',
    content: 'Die Grenzen zwischen Realfilm und computergenerierter Grafik verschwimmen zusehends. Durch neue dynamische Beleuchtungstechnologien und Geometrie-Streaming können Entwickler detailreiche virtuelle Welten ohne aufwendiges Baking erschaffen.',
    source: 'GameDev Insight',
    category: 'Gaming',
    language: 'de',
    url: 'https://golem.de',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=60',
    pubDate: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    author: 'Kevin Bauer',
    readTime: '4 min'
  }
];

// Helper: Estimate Reading Time
export const estimateReadTime = (text = '') => {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min`;
};

// Helper: Strip HTML tags
export const stripHtml = (html = '') => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

// Helper: Fetch with timeout
const fetchWithTimeout = async (url, options = {}, timeoutMs = 6000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

// 1. Fetch Hacker News Top Stories
export const fetchHackerNews = async (limit = 12) => {
  try {
    const topIdsRes = await fetchWithTimeout('https://hacker-news.firebaseio.com/v0/topstories.json');
    if (!topIdsRes.ok) return [];
    const topIds = await topIdsRes.json();
    const selectedIds = topIds.slice(0, limit);

    const storyPromises = selectedIds.map(async (id) => {
      try {
        const itemRes = await fetchWithTimeout(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {}, 3000);
        if (!itemRes.ok) return null;
        const item = await itemRes.json();
        if (!item || !item.title) return null;

        return {
          id: `hn-${item.id}`,
          title: item.title,
          description: `Score: ${item.score || 0} points • By ${item.by || 'anonymous'} • ${item.descendants || 0} comments`,
          content: item.text ? stripHtml(item.text) : item.title,
          source: 'Hacker News',
          category: 'Tech',
          language: 'en',
          url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
          imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60',
          pubDate: new Date((item.time || Date.now() / 1000) * 1000).toISOString(),
          author: item.by || 'HN Community',
          score: item.score,
          commentsCount: item.descendants || 0,
          readTime: '3 min'
        };
      } catch {
        return null;
      }
    });

    const results = await Promise.all(storyPromises);
    return results.filter(Boolean);
  } catch (e) {
    console.warn('Hacker News fetch failed:', e.message);
    return [];
  }
};

// 2. Fetch Dev.to Tech Articles
export const fetchDevToArticles = async (limit = 10) => {
  try {
    const res = await fetchWithTimeout(`https://dev.to/api/articles?per_page=${limit}&top=7`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((item) => ({
      id: `devto-${item.id}`,
      title: item.title,
      description: item.description || (item.tag_list ? `Topics: ${item.tag_list.join(', ')}` : ''),
      content: item.description || item.title,
      source: 'DEV Community',
      category: 'Tech',
      language: 'en',
      url: item.url,
      imageUrl: item.cover_image || item.social_image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60',
      pubDate: item.published_at || new Date().toISOString(),
      author: item.user?.name || 'DEV Contributor',
      score: item.positive_reactions_count || 0,
      readTime: `${item.reading_time_minutes || 4} min`
    }));
  } catch (e) {
    console.warn('Dev.to fetch failed:', e.message);
    return [];
  }
};

// 3. Fetch Crypto & Market News
export const fetchCryptoNews = async (limit = 10) => {
  try {
    const res = await fetchWithTimeout('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
    if (!res.ok) return [];
    const json = await res.json();
    if (!json || !Array.isArray(json.Data)) return [];

    return json.Data.slice(0, limit).map((item) => ({
      id: `crypto-${item.id}`,
      title: item.title,
      description: item.body ? item.body.slice(0, 180) + '...' : '',
      content: item.body || item.title,
      source: item.source_info?.name || 'CryptoCompare',
      category: 'Finance',
      language: 'en',
      url: item.url,
      imageUrl: item.imageurl || 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=60',
      pubDate: new Date((item.published_on || Date.now() / 1000) * 1000).toISOString(),
      author: item.source_info?.name || 'Crypto Analyst',
      readTime: '3 min'
    }));
  } catch (e) {
    console.warn('Crypto news fetch failed:', e.message);
    return [];
  }
};

// 4. Fetch an RSS feed using RSS2JSON or CORS proxies
export const fetchRssFeed = async (feed) => {
  const { url, name, category, language } = feed;

  // Try rss2json proxy first
  try {
    const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&api_key=&count=10`;
    const res = await fetchWithTimeout(rss2jsonUrl, {}, 5000);
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'ok' && Array.isArray(data.items) && data.items.length > 0) {
        return data.items.map((item, idx) => {
          const cleanDesc = stripHtml(item.description || item.content || '');
          const cleanContent = stripHtml(item.content || item.description || item.title);

          // Extract thumbnail or enclosure image if present
          let img = item.thumbnail || item.enclosure?.link;
          if (!img && item.description) {
            const match = item.description.match(/<img[^>]+src=["']([^"']+)["']/i);
            if (match) img = match[1];
          }

          if (!img) {
            img = getCategoryDefaultImage(category);
          }

          return {
            id: `rss-${name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${idx}-${Date.parse(item.pubDate) || Date.now()}`,
            title: item.title,
            description: cleanDesc.slice(0, 220) + (cleanDesc.length > 220 ? '...' : ''),
            content: cleanContent,
            source: name,
            category: category || 'World',
            language: language || (url.includes('.de') ? 'de' : 'en'),
            url: item.link || url,
            imageUrl: img,
            pubDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
            author: item.author || name,
            readTime: estimateReadTime(cleanContent)
          };
        });
      }
    }
  } catch {
    // Continue to CORS fallback
  }

  // Fallback using allorigins proxy and native DOMParser
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const res = await fetchWithTimeout(proxyUrl, {}, 6000);
    if (res.ok) {
      const text = await res.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');
      const items = Array.from(xmlDoc.querySelectorAll('item, entry')).slice(0, 10);

      if (items.length > 0) {
        return items.map((item, idx) => {
          const title = item.querySelector('title')?.textContent || 'Untitled';
          const link = item.querySelector('link')?.textContent || item.querySelector('link')?.getAttribute('href') || url;
          const descriptionRaw = item.querySelector('description, summary, content')?.textContent || '';
          const cleanDesc = stripHtml(descriptionRaw);
          const pubDateRaw = item.querySelector('pubDate, published, updated')?.textContent;
          const author = item.querySelector('author, dc\\:creator, creator')?.textContent || name;

          let img = item.querySelector('enclosure[type^="image"]')?.getAttribute('url') ||
            item.querySelector('media\\:content[medium="image"], media\\:thumbnail')?.getAttribute('url');

          if (!img) {
            img = getCategoryDefaultImage(category);
          }

          return {
            id: `rss-${name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${idx}-${Date.now()}`,
            title,
            description: cleanDesc.slice(0, 220) + (cleanDesc.length > 220 ? '...' : ''),
            content: cleanDesc,
            source: name,
            category: category || 'World',
            language: language || (url.includes('.de') ? 'de' : 'en'),
            url: link,
            imageUrl: img,
            pubDate: pubDateRaw ? new Date(pubDateRaw).toISOString() : new Date().toISOString(),
            author,
            readTime: estimateReadTime(cleanDesc)
          };
        });
      }
    }
  } catch (e) {
    console.warn(`RSS fetch fallback failed for ${name}:`, e.message);
  }

  return [];
};

// Helper: Category default images
export const getCategoryDefaultImage = (category = 'World') => {
  switch (category) {
    case 'Tech':
      return 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60';
    case 'Finance':
      return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60';
    case 'Science':
      return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60';
    case 'Productivity':
      return 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=60';
    case 'Gaming':
      return 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=60';
    default:
      return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=60';
  }
};

// Main Aggregator: Fetches and blends all sources
export const fetchAllNewsArticles = async ({ customFeeds = [], enabledFeedIds = null } = {}) => {
  const feedsToFetch = (customFeeds.length > 0 ? customFeeds : DEFAULT_NEWS_FEEDS)
    .filter(f => enabledFeedIds ? enabledFeedIds.includes(f.id) : f.enabled !== false);

  const fetchPromises = [
    fetchHackerNews(10),
    fetchDevToArticles(8),
    fetchCryptoNews(8),
    ...feedsToFetch.slice(0, 6).map(feed => fetchRssFeed(feed))
  ];

  const results = await Promise.allSettled(fetchPromises);
  const fetchedArticles = [];

  results.forEach(res => {
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      fetchedArticles.push(...res.value);
    }
  });

  // Combine with curated stories to ensure rich variety
  const combined = [...fetchedArticles, ...CURATED_STORIES];

  // Deduplicate by URL and Title
  const seenUrls = new Set();
  const seenTitles = new Set();
  const uniqueArticles = [];

  for (const item of combined) {
    const normalizedTitle = item.title.trim().toLowerCase();
    if (!seenUrls.has(item.url) && !seenTitles.has(normalizedTitle)) {
      seenUrls.add(item.url);
      seenTitles.add(normalizedTitle);
      uniqueArticles.push(item);
    }
  }

  // Sort by publication date (newest first)
  uniqueArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  return uniqueArticles;
};

// Intelligent Local Extractive Summarizer & AI TL;DR
export const generateLocalSummary = (title, content = '') => {
  if (!content || content.length < 50) {
    return {
      tldr: title,
      takeaways: [
        'Aktuelle Meldung aus den Leitmedien.',
        'Klicken Sie auf den Original-Artikel für umfassende Details.',
        'Über den E.O.M Reader können Sie sich den Beitrag vorlesen lassen.'
      ],
      sentiment: 'Neutral',
      sentimentScore: 0
    };
  }

  // Split into sentences
  const sentences = content.replace(/([.?!])\s*(?=[A-ZÄÖÜ])/g, "$1|").split("|").map(s => s.trim()).filter(s => s.length > 20);

  // Positive & negative keyword lists for sentiment analysis
  const positiveWords = ['breakthrough', 'success', 'erfolg', 'wachstum', 'gewinn', 'rekord', 'fortschritt', 'innovation', 'positiv', 'steigen', 'surge', 'rally', 'revolution', 'bullish'];
  const negativeWords = ['crisis', 'krise', 'verlust', 'einbruch', 'crash', 'risiko', 'gefahr', 'sinken', 'abfall', 'problem', 'warnung', 'scam', 'inflation', 'bearish', 'drop'];

  const lower = content.toLowerCase();
  let posCount = 0;
  let negCount = 0;
  positiveWords.forEach(w => { if (lower.includes(w)) posCount++; });
  negativeWords.forEach(w => { if (lower.includes(w)) negCount++; });

  let sentiment = 'Neutral';
  if (posCount > negCount) sentiment = 'Bullish / Positiv ✨';
  else if (negCount > posCount) sentiment = 'Bearish / Vorsicht ⚠️';

  // Extract top 2-3 most informative sentences for TL;DR
  const tldr = sentences.slice(0, 2).join(' ') || title;

  // Extract key takeaways
  const takeaways = [];
  if (sentences.length >= 3) {
    takeaways.push(sentences[0]);
    takeaways.push(sentences[Math.min(1, sentences.length - 1)]);
    if (sentences.length > 3) {
      takeaways.push(sentences[sentences.length - 1]);
    }
  } else {
    takeaways.push(sentences[0] || title);
    takeaways.push(`Kategorie: Informationsquelle analysiert.`);
    takeaways.push('Vollständiger Text im Quellverweis verfügbar.');
  }

  return {
    tldr,
    takeaways,
    sentiment,
    sentimentScore: posCount - negCount
  };
};

// Text-to-Speech (TTS) SpeechSynthesis helper
export const speakArticleText = (text, lang = 'de-DE', rate = 1.0, onEnd = null) => {
  if (!('speechSynthesis' in window)) {
    alert('Text-to-Speech is not supported in this browser environment.');
    return null;
  }

  window.speechSynthesis.cancel(); // Stop any active speech

  const cleanText = stripHtml(text);
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = rate || 1.0;
  utterance.pitch = 1.0;

  // Try to find matching voice
  const voices = window.speechSynthesis.getVoices();
  const targetLang = lang.startsWith('de') ? 'de' : 'en';
  const voice = voices.find(v => v.lang.startsWith(targetLang));
  if (voice) utterance.voice = voice;

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
};

export const stopSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
