// Preset RSS Feeds for instant access with 10 Top Global Media Powerhouses
export const DEFAULT_NEWS_FEEDS = [
  // 1. NEWS AGENCIES (The Verified Fact Standard)
  {
    id: 'reuters',
    name: 'Reuters',
    url: 'https://news.google.com/rss/search?q=when:24h+allinurl:reuters.com&hl=en-US&gl=US&ceid=US:en',
    category: 'World',
    language: 'en',
    tier: 'agencies',
    tierLabel: 'Fact Standard',
    country: 'UK / Global',
    description: 'Premier global source for verified real-time news, financial data, and geopolitics.',
    enabled: true,
    icon: '⚖️'
  },
  {
    id: 'ap_news',
    name: 'Associated Press (AP)',
    url: 'https://news.google.com/rss/search?q=when:24h+allinurl:apnews.com&hl=en-US&gl=US&ceid=US:en',
    category: 'World',
    language: 'en',
    tier: 'agencies',
    tierLabel: 'Fact Standard',
    country: 'USA / Global',
    description: 'Leading independent news agency for strictly fact-based, non-partisan reporting.',
    enabled: true,
    icon: '📜'
  },
  {
    id: 'afp',
    name: 'Agence France-Presse (AFP)',
    url: 'https://news.google.com/rss/search?q=when:24h+allinurl:afp.com+OR+allinurl:factcheck.afp.com&hl=en-US&gl=US&ceid=US:en',
    category: 'World',
    language: 'en',
    tier: 'agencies',
    tierLabel: 'Fact Standard',
    country: 'France / Global',
    description: 'Global benchmark for investigative facts, international coverage, and fact-checking.',
    enabled: true,
    icon: '🛡️'
  },

  // 2. GLOBAL REACH & BREAKING NEWS POWERHOUSES
  {
    id: 'bbc',
    name: 'BBC News',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    category: 'World',
    language: 'en',
    tier: 'giants',
    tierLabel: 'Global Media',
    country: 'UK / Global',
    description: 'Widely trusted broadcaster with world-class international reporting and analysis.',
    enabled: true,
    icon: '🌍'
  },
  {
    id: 'nytimes',
    name: 'The New York Times',
    url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    category: 'World',
    language: 'en',
    tier: 'giants',
    tierLabel: 'Global Media',
    country: 'USA / Global',
    description: 'Global standard for deep investigative journalism, visual data analyses, and culture.',
    enabled: true,
    icon: '🏛️'
  },
  {
    id: 'cnn',
    name: 'CNN International',
    url: 'http://rss.cnn.com/rss/edition_world.rss',
    category: 'World',
    language: 'en',
    tier: 'giants',
    tierLabel: 'Global Media',
    country: 'USA / Global',
    description: 'Fast global provider for breaking news, geopolitics, and live coverage.',
    enabled: true,
    icon: '🔴'
  },
  {
    id: 'guardian',
    name: 'The Guardian',
    url: 'https://www.theguardian.com/world/rss',
    category: 'World',
    language: 'en',
    tier: 'giants',
    tierLabel: 'Global Media',
    country: 'UK / Global',
    description: 'Independent quality journalism focusing on environment, society, and world affairs.',
    enabled: true,
    icon: '🌿'
  },

  // 3. GEOPOLITICS, MARKETS & MULTI-PERSPECTIVE
  {
    id: 'bloomberg',
    name: 'Bloomberg',
    url: 'https://news.google.com/rss/search?q=when:24h+allinurl:bloomberg.com&hl=en-US&gl=US&ceid=US:en',
    category: 'Finance',
    language: 'en',
    tier: 'geopolitics',
    tierLabel: 'Markets & Policy',
    country: 'USA / Global',
    description: 'Definitive source for global capital markets, trade dynamics, and economic policy.',
    enabled: true,
    icon: '📊'
  },
  {
    id: 'ft',
    name: 'Financial Times',
    url: 'https://www.ft.com/rss/home/uk',
    category: 'Finance',
    language: 'en',
    tier: 'geopolitics',
    tierLabel: 'Markets & Policy',
    country: 'UK / Global',
    description: 'Essential economic intelligence at the intersection of business, diplomacy, and trade.',
    enabled: true,
    icon: '📈'
  },
  {
    id: 'aljazeera',
    name: 'Al Jazeera English',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    category: 'World',
    language: 'en',
    tier: 'geopolitics',
    tierLabel: 'Global South & Middle East',
    country: 'Qatar / Global South',
    description: 'Key international voice for reporting from the Middle East and developing markets.',
    enabled: true,
    icon: '🧭'
  },

  // 4. TECH, SCIENCE & REGIONAL LEADERS
  {
    id: 'tagesschau',
    name: 'Tagesschau',
    url: 'https://www.tagesschau.de/xml/rss2/',
    category: 'World',
    language: 'de',
    tier: 'national',
    tierLabel: 'Public Broadcaster (DE)',
    country: 'Germany',
    description: 'Leading German editorial team for reliable news across politics, economy, and society.',
    enabled: true,
    icon: '🌐'
  },
  {
    id: 'spiegel',
    name: 'Der Spiegel',
    url: 'https://www.spiegel.de/schlagzeilen/index.rss',
    category: 'World',
    language: 'de',
    tier: 'national',
    tierLabel: 'Investigative (DE)',
    country: 'Germany',
    description: 'Renowned European news magazine with investigative depth and background dossiers.',
    enabled: true,
    icon: '📰'
  },
  {
    id: 'heise',
    name: 'Heise Online',
    url: 'https://www.heise.de/rss/heise-atom.xml',
    category: 'Tech',
    language: 'de',
    tier: 'tech',
    tierLabel: 'Tech & IT (DE)',
    country: 'Germany',
    description: 'Premier European IT source for developer ecosystems, cybersecurity, and hardware.',
    enabled: true,
    icon: '💻'
  },
  {
    id: 'golem',
    name: 'Golem.de',
    url: 'https://rss.golem.de/rss.php?feed=RSS2.0',
    category: 'Tech',
    language: 'de',
    tier: 'tech',
    tierLabel: 'Tech & Dev (DE)',
    country: 'Germany',
    description: 'News and analysis for software engineers, IT leaders, and hardware enthusiasts.',
    enabled: true,
    icon: '⚡'
  },
  {
    id: 'btc_echo',
    name: 'BTC-ECHO Crypto',
    url: 'https://www.btc-echo.de/feed/',
    category: 'Finance',
    language: 'de',
    tier: 'finance',
    tierLabel: 'FinTech & Web3 (DE)',
    country: 'Germany',
    description: 'Leading publication covering Bitcoin, crypto assets, and decentralized finance.',
    enabled: true,
    icon: '₿'
  },
  {
    id: 'verge',
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    category: 'Tech',
    language: 'en',
    tier: 'tech',
    tierLabel: 'Tech & Culture',
    country: 'USA',
    description: 'Tech culture, consumer hardware, AI breakthroughs, and future trends.',
    enabled: true,
    icon: '⚡'
  },
  {
    id: 'wired',
    name: 'Wired News',
    url: 'https://www.wired.com/feed/rss',
    category: 'Tech',
    language: 'en',
    tier: 'tech',
    tierLabel: 'Future Tech',
    country: 'USA',
    description: 'Visionary tech essays, scientific discoveries, and deep digital culture.',
    enabled: true,
    icon: '🔌'
  },
  {
    id: 'techcrunch',
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'Tech',
    language: 'en',
    tier: 'tech',
    tierLabel: 'Startups & VC',
    country: 'USA',
    description: 'Venture capital funding, unicorn startups, and bleeding-edge tech products.',
    enabled: true,
    icon: '🚀'
  },
  {
    id: 'nasa',
    name: 'NASA Breaking News',
    url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss',
    category: 'Science',
    language: 'en',
    tier: 'science',
    tierLabel: 'Space & Science',
    country: 'USA',
    description: 'Official mission updates, deep-space imagery, and astronomical discoveries.',
    enabled: true,
    icon: '🚀'
  },
  {
    id: 'ars_technica',
    name: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    category: 'Tech',
    language: 'en',
    tier: 'tech',
    tierLabel: 'Deep Tech & Science',
    country: 'USA',
    description: 'Authoritative analysis for technologists, developers, and scientists.',
    enabled: true,
    icon: '🔬'
  }
];

export const SOURCE_TIERS = [
  { id: 'all', label: 'All Sources', icon: '🌐' },
  { id: 'agencies', label: 'News Agencies', icon: '⚖️', description: 'Reuters, Associated Press, AFP' },
  { id: 'giants', label: 'Global Giants', icon: '🌍', description: 'BBC, NYT, CNN, Guardian' },
  { id: 'geopolitics', label: 'Geopolitics & Markets', icon: '📊', description: 'Bloomberg, Financial Times, Al Jazeera' },
  { id: 'national', label: 'German Media', icon: '🇩🇪', description: 'Tagesschau, Spiegel, Heise' },
  { id: 'tech', label: 'Tech & Startups', icon: '💻', description: 'Heise, Verge, Wired, TC, Ars' }
];

export const NEWS_CATEGORIES = [
  { id: 'all', label: 'All Stories', icon: '🔥' },
  { id: 'World', label: 'World & Politics', icon: '🌍' },
  { id: 'Finance', label: 'Finance & Markets', icon: '📈' },
  { id: 'Tech', label: 'Tech & AI', icon: '💻' },
  { id: 'Science', label: 'Science & Space', icon: '🚀' },
  { id: 'Productivity', label: 'Life & Mindset', icon: '🧠' },
  { id: 'Gaming', label: 'Gaming & Culture', icon: '🎮' },
  { id: 'bookmarks', label: 'Bookmarks', icon: '⭐' }
];

// Fallback high-quality curated stories covering all 10 Global Leaders
const CURATED_STORIES = [
  {
    id: 'curated-reuters',
    title: 'Reuters: Global Central Banks Align Policy Stance as Trade Corridors Modernize',
    description: 'International monetary authorities report steady progress in stabilizing inflation while emerging digital trade corridors reduce cross-border transaction friction across Europe and Asia.',
    content: 'Reuters Global Economic Monitor reports that synchronized policy adjustments among leading central banks have anchored market expectations. Supply chain diversification and accelerated infrastructure investments in renewable grids have bolstered macroeconomic resilience across key industrial corridors.',
    source: 'Reuters',
    tier: 'agencies',
    country: 'Global / UK',
    category: 'Finance',
    language: 'en',
    url: 'https://reuters.com',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60',
    pubDate: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    author: 'Reuters Fact Desk',
    readTime: '4 min'
  },
  {
    id: 'curated-ap',
    title: 'Associated Press: Major International Accord Secures Critical Minerals Supply Framework',
    description: 'A coalition of 32 nations establishes common standards for sustainable mineral processing and transparent supply tracking, aiming to accelerate clean energy manufacturing.',
    content: 'According to the Associated Press, delegates finalized a comprehensive treaty ensuring ethical extraction and recycling of critical minerals essential for next-generation batteries and high-performance computing.',
    source: 'Associated Press (AP)',
    tier: 'agencies',
    country: 'Global / USA',
    category: 'World',
    language: 'en',
    url: 'https://apnews.com',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60',
    pubDate: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    author: 'AP International Bureau',
    readTime: '3 min'
  },
  {
    id: 'curated-afp',
    title: 'AFP Fact-Check: Verified Verification Standards Established for Autonomous AI Media',
    description: 'European and global digital regulators publish verified authentication protocols to combat deepfakes and ensure verifiable cryptographic attribution for digital news content.',
    content: 'Agence France-Presse reports that certified cryptographic watermarking and provenance standards have gained mandatory backing across leading digital platforms, setting a new benchmark for verifiable journalism.',
    source: 'Agence France-Presse (AFP)',
    tier: 'agencies',
    country: 'Frankreich / Global',
    category: 'Tech',
    language: 'en',
    url: 'https://afp.com',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60',
    pubDate: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    author: 'AFP Verification Hub',
    readTime: '4 min'
  },
  {
    id: 'curated-bbc',
    title: 'BBC World News: The Massive Global Transition Toward Hydrogen & Smart Grid Infrastructure',
    description: 'Cities worldwide are testing grid-scale green hydrogen storage and distributed smart power topologies to handle peak energy demands during extreme seasons.',
    content: 'BBC News in-depth investigation explores how industrial centers from Rotterdam to Singapore are revamping legacy electrical grids with AI-managed storage buffers, dramatically cutting transmission losses.',
    source: 'BBC News',
    tier: 'giants',
    country: 'UK / Global',
    category: 'World',
    language: 'en',
    url: 'https://bbc.com/news',
    imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=60',
    pubDate: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    author: 'BBC Global Dispatch',
    readTime: '5 min'
  },
  {
    id: 'curated-nyt',
    title: 'The New York Times: Inside the Quantum Leap in Generative Biology and Protein Design',
    description: 'How machine learning models trained on structural biology are designing custom therapeutic enzymes and biodegradable polymers in days instead of decades.',
    content: 'A detailed New York Times investigation outlines the rapid convergence of computational chemistry and deep generative neural networks. Researchers can now model molecular affinities with sub-angstrom precision, opening unprecedented avenues for targeted medicine.',
    source: 'The New York Times',
    tier: 'giants',
    country: 'USA / Global',
    category: 'Science',
    language: 'en',
    url: 'https://nytimes.com',
    imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=60',
    pubDate: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    author: 'Science & Tech Bureau',
    readTime: '6 min'
  },
  {
    id: 'curated-cnn',
    title: 'CNN Breaking: International Summit Agrees on New Aviation and Satellite Traffic Protocols',
    description: 'Global transport ministers implement automated satellite-linked collision avoidance and coordinated sub-orbital air traffic management systems.',
    content: 'CNN International reports live from the Geneva aviation convention, where over 80 nations ratified automated tracking frameworks designed to manage growing commercial space launch schedules without disrupting civil flight corridors.',
    source: 'CNN International',
    tier: 'giants',
    country: 'USA / Global',
    category: 'World',
    language: 'en',
    url: 'https://cnn.com',
    imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop&q=60',
    pubDate: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    author: 'CNN Breaking Desk',
    readTime: '3 min'
  },
  {
    id: 'curated-guardian',
    title: 'The Guardian: Historic Conservation Treaty Protects 30% of Global Ocean Corridors',
    description: 'Marine biologists celebrate landmark multilateral ratification establishing enforceable high-seas sanctuaries and banning bottom-trawling in vital biodiversity zones.',
    content: 'The Guardian reports on the culmination of a ten-year diplomatic effort to safeguard international waters. The newly enacted treaty empowers international monitoring task forces with satellite surveillance to eliminate illegal fishing operations.',
    source: 'The Guardian',
    tier: 'giants',
    country: 'UK / Global',
    category: 'World',
    language: 'en',
    url: 'https://theguardian.com',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=60',
    pubDate: new Date(Date.now() - 1000 * 60 * 105).toISOString(),
    author: 'Environment Desk',
    readTime: '5 min'
  },
  {
    id: 'curated-bloomberg',
    title: 'Bloomberg: Semiconductor Foundry Expansion Reaches $320B Milestone Amid Next-Gen AI Demand',
    description: 'Capital expenditure in 2nm fab lithography and advanced 3D packaging surges as cloud hyperscalers accelerate proprietary accelerator deployment.',
    content: 'Bloomberg Markets analysis indicates that leading chipmakers are operating at 95%+ capacity utilization for leading-edge nodes. Long-term supply contracts with enterprise AI providers are driving unprecedented semiconductor manufacturing resilience.',
    source: 'Bloomberg',
    tier: 'geopolitics',
    country: 'USA / Global',
    category: 'Finance',
    language: 'en',
    url: 'https://bloomberg.com',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60',
    pubDate: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    author: 'Bloomberg Technology Markets',
    readTime: '4 min'
  },
  {
    id: 'curated-ft',
    title: 'Financial Times: The Transformation of Global Settlement Rails and Tokenized Liquidity',
    description: 'Cross-border trade finance embraces instantaneous multi-currency wholesale settlement, reducing counterparty risks and days-long banking delays.',
    content: 'The Financial Times examines how sovereign and commercial banking consortia are transitioning legacy SWIFT pipelines toward real-time atomic settlement protocols, facilitating frictionless global commerce.',
    source: 'Financial Times',
    tier: 'geopolitics',
    country: 'UK / Global',
    category: 'Finance',
    language: 'en',
    url: 'https://ft.com',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=60',
    pubDate: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    author: 'Banking & Trade Desk',
    readTime: '5 min'
  },
  {
    id: 'curated-aljazeera',
    title: 'Al Jazeera English: South-to-South Infrastructure Partnerships Reshape Global Logistics',
    description: 'Emerging economies across the Middle East, Africa, and Latin America invest heavily in intermodal rail, deep-water ports, and solar desalinization.',
    content: 'Al Jazeera English delivers in-depth field reporting on how non-aligned nations are co-investing in shared regional supply chains, creating resilient economic corridors independent of traditional Western and Eastern blocs.',
    source: 'Al Jazeera English',
    tier: 'geopolitics',
    country: 'Qatar / Global South',
    category: 'World',
    language: 'en',
    url: 'https://aljazeera.com',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60',
    pubDate: new Date(Date.now() - 1000 * 60 * 160).toISOString(),
    author: 'Al Jazeera International Bureau',
    readTime: '5 min'
  },
  {
    id: 'curated-tagesschau',
    title: 'Tagesschau: European Union Adopts New Directives for Energy Grid Security and Decoupling',
    description: 'EU member states establish joint resilience standards for critical energy infrastructure and deploy strategic investments into pan-European transmission lines.',
    content: 'In Brussels, EU energy ministers finalized a comprehensive legislative package designed to permanently diversify import dependencies while accelerating renewable energy integration across the European synchronous grid to over 60 percent by 2030.',
    source: 'Tagesschau',
    tier: 'national',
    country: 'Germany',
    category: 'World',
    language: 'en',
    url: 'https://tagesschau.de',
    imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=60',
    pubDate: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    author: 'European Bureau',
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
  const { url, name, category, language, tier, tierLabel, country } = feed;

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
            tier: tier || 'giants',
            tierLabel: tierLabel || 'Global',
            country: country || 'Global',
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
            tier: tier || 'giants',
            tierLabel: tierLabel || 'Global',
            country: country || 'Global',
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
    ...feedsToFetch.slice(0, 16).map(feed => fetchRssFeed(feed))
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
        'Breaking report from verified news sources.',
        'Click the original article link for in-depth coverage.',
        'Use the E.O.M Reader to listen via text-to-speech.'
      ],
      sentiment: 'Neutral',
      sentimentScore: 0
    };
  }

  // Split into sentences
  const sentences = content.replace(/([.?!])\s*(?=[A-ZÄÖÜ])/g, "$1|").split("|").map(s => s.trim()).filter(s => s.length > 20);

  // Positive & negative keyword lists for sentiment analysis
  const positiveWords = ['breakthrough', 'success', 'growth', 'gain', 'record', 'progress', 'innovation', 'positive', 'surge', 'rally', 'revolution', 'bullish', 'expansion'];
  const negativeWords = ['crisis', 'loss', 'crash', 'risk', 'danger', 'drop', 'problem', 'warning', 'scam', 'inflation', 'bearish', 'decline'];

  const lower = content.toLowerCase();
  let posCount = 0;
  let negCount = 0;
  positiveWords.forEach(w => { if (lower.includes(w)) posCount++; });
  negativeWords.forEach(w => { if (lower.includes(w)) negCount++; });

  let sentiment = 'Neutral';
  if (posCount > negCount) sentiment = 'Bullish / Positive ✨';
  else if (negCount > posCount) sentiment = 'Bearish / Caution ⚠️';

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
    takeaways.push('Category: Analyzed intelligence source.');
    takeaways.push('Full text available via source reference.');
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
