import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useStore } from '../../store';
import '../Styles/NewsHub.css';
import {
  fetchAllNewsArticles,
  NEWS_CATEGORIES,
  DEFAULT_NEWS_FEEDS,
  generateLocalSummary,
  speakArticleText,
  stopSpeech
} from '../../services/newsService';

// News Icons
const NewspaperIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
    <path d="M0 2.5A1.5 1.5 0 0 1 1.5 1h11A1.5 1.5 0 0 1 14 2.5v10.528c0 .3-.05.654-.238.972h.738a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 1 1 0v9a1.5 1.5 0 0 1-1.5 1.5H1.497A1.497 1.497 0 0 1 0 13.5zM12 14c.37 0 .654-.211.855-.455L13 13.316V2.5a.5.5 0 0 0-.5-.5h-11a.5.5 0 0 0-.5.5v11c0 .278.223.5.497.5z" />
    <path d="M2 3h10v2H2zm0 3h4v3H2zm0 4h4v1H2zm0 2h4v1H2zm5-6h5v1H7zm0 2h5v1H7zm0 2h5v1H7zm0 2h5v1H7z" />
  </svg>
);

const StarIcon = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? "0" : "1.5"} viewBox="0 0 16 16">
    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
  </svg>
);

const SpeakerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M11.536 14.01A8.47 8.47 0 0 0 14.026 8a8.47 8.47 0 0 0-2.49-6.01l-.708.707A7.48 7.48 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303z" />
    <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.48 5.48 0 0 1 11.025 8a5.48 5.48 0 0 1-1.61 3.89z" />
    <path d="M8.707 11.182A4.5 4.5 0 0 0 10.025 8a4.5 4.5 0 0 0-1.318-3.182L8 5.525A3.5 3.5 0 0 1 9.025 8 3.5 3.5 0 0 1 8 10.475zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06" />
  </svg>
);

const RefreshIcon = ({ spinning }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
    style={{ transition: 'transform 0.5s', transform: spinning ? 'rotate(360deg)' : 'none' }}
  >
    <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5" />
    <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z" />
  </svg>
);

function NewsCard({ item, isSaved, onToggleBookmark, onRead, onTts }) {
  return (
    <div className="news-card" onClick={() => onRead(item)}>
      <div className="news-card-img" style={{ backgroundImage: `url(${item.imageUrl})` }}>
        <div className="news-card-img-overlay" />
        <div className="news-card-top-badges">
          <span className="news-source-tag">{item.source}</span>
          <button
            className={`news-bookmark-btn ${isSaved ? 'saved' : ''}`}
            onClick={(e) => onToggleBookmark(item, e)}
            title={isSaved ? 'Gespeichert' : 'Lesezeichen setzen'}
          >
            <StarIcon filled={isSaved} />
          </button>
        </div>
      </div>

      <div className="news-card-body">
        <div>
          <div className="news-card-meta">
            <span>{new Date(item.pubDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
            <span>•</span>
            <span>{item.readTime || '3 min'}</span>
            {item.category && (
              <>
                <span>•</span>
                <span style={{ color: 'var(--primary)' }}>{item.category}</span>
              </>
            )}
          </div>

          <h3 className="news-card-title">{item.title}</h3>
          <p className="news-card-desc">{item.description}</p>
        </div>

        <div className="news-card-footer">
          <span style={{ fontSize: '0.75rem', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.author || item.source}
          </span>
          <div className="news-card-actions">
            <button
              className="news-icon-btn"
              onClick={(e) => { e.stopPropagation(); onTts(item); }}
              title="Vorlesen lassen"
            >
              <SpeakerIcon />
            </button>
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="news-icon-btn"
              onClick={(e) => e.stopPropagation()}
              title="Im Browser öffnen"
            >
              <ExternalLinkIcon />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewsHub() {
  // Zustand Store Integration
  const customFeeds = useStore((state) => state.customNewsFeeds || DEFAULT_NEWS_FEEDS);
  const newsBookmarks = useStore((state) => state.newsBookmarks || []);
  const setNewsBookmarks = useStore((state) => state.setNewsBookmarks);
  const journal = useStore((state) => state.journal || []);
  const setJournal = useStore((state) => state.setJournal);
  const addKnowledgeDoc = useStore((state) => state.addKnowledgeDocument);

  // Local State
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all'); // 'all', 'de', 'en'
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid', 'magazine', 'compact'
  const [activeReaderArticle, setActiveReaderArticle] = useState(null);
  const [readerFontSize, setReaderFontSize] = useState('md'); // 'sm', 'md', 'lg'
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);
  const [isFeedManagerOpen, setIsFeedManagerOpen] = useState(false);
  const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(false);

  // Custom Feed Form State
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [newFeedName, setNewFeedName] = useState('');
  const [newFeedCategory, setNewFeedCategory] = useState('Tech');

  const loadNews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllNewsArticles({ customFeeds });
      setArticles(data);
    } catch (e) {
      console.error('Failed to load news:', e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [customFeeds]);

  // Load news on mount
  useEffect(() => {
    loadNews();
    return () => {
      stopSpeech();
    };
  }, [loadNews]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    loadNews();
  };

  // Toggle bookmark in store
  const handleToggleBookmark = (article, e) => {
    if (e) e.stopPropagation();
    const isBookmarked = newsBookmarks.some((b) => b.id === article.id || b.url === article.url);

    if (isBookmarked) {
      const updated = newsBookmarks.filter((b) => b.id !== article.id && b.url !== article.url);
      if (setNewsBookmarks) setNewsBookmarks(updated);
      else {
        useStore.setState({ newsBookmarks: updated });
      }
    } else {
      const newBookmark = {
        ...article,
        savedAt: new Date().toISOString()
      };
      const updated = [newBookmark, ...newsBookmarks];
      if (setNewsBookmarks) setNewsBookmarks(updated);
      else {
        useStore.setState({ newsBookmarks: updated });
      }
    }
  };

  const isArticleBookmarked = (article) => {
    return newsBookmarks.some((b) => b.id === article.id || b.url === article.url);
  };

  // Filter and search logic
  const filteredArticles = useMemo(() => {
    let list = selectedCategory === 'bookmarks' ? newsBookmarks : articles;

    // Filter by Category
    if (selectedCategory !== 'all' && selectedCategory !== 'bookmarks') {
      list = list.filter((a) => a.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by Language
    if (selectedLanguage !== 'all') {
      list = list.filter((a) => a.language === selectedLanguage);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.title?.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q) ||
          a.source?.toLowerCase().includes(q) ||
          a.category?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [articles, newsBookmarks, selectedCategory, selectedLanguage, searchQuery]);

  // Breaking headlines for ticker
  const breakingNewsItems = useMemo(() => {
    return articles.slice(0, 10);
  }, [articles]);

  // Audio Text-to-Speech handler
  const handleToggleTts = (article) => {
    if (isTtsPlaying) {
      stopSpeech();
      setIsTtsPlaying(false);
    } else {
      const fullSpeech = `${article.title}. Quelle: ${article.source}. ${article.description || ''}. ${article.content || ''}`;
      speakArticleText(
        fullSpeech,
        article.language === 'de' ? 'de-DE' : 'en-US',
        1.0,
        () => setIsTtsPlaying(false)
      );
      setIsTtsPlaying(true);
    }
  };

  // Send Article to E.O.M Journal
  const handleSendToJournal = (article) => {
    const summary = generateLocalSummary(article.title, article.content || article.description);
    const newEntry = {
      id: Date.now(),
      title: `📰 News: ${article.title}`,
      content: `### [${article.title}](${article.url})\n**Quelle:** ${article.source} | **Datum:** ${new Date(article.pubDate).toLocaleDateString()}\n\n#### Zusammenfassung & Key Takeaways:\n- ${summary.takeaways.join('\n- ')}\n\n#### Auszug:\n> ${article.description || article.content}\n\n---\n*Gespeichert über E.O.M News Hub*`,
      timestamp: Date.now()
    };

    if (setJournal) {
      setJournal([newEntry, ...journal]);
    } else {
      useStore.setState({ journal: [newEntry, ...journal] });
    }
    alert('✅ Artikel wurde erfolgreich als Eintrag in dein Journal übernommen!');
  };

  // Save to AI Knowledge Base
  const handleSaveToKnowledge = (article) => {
    const summary = generateLocalSummary(article.title, article.content || article.description);
    const doc = {
      id: `news-doc-${Date.now()}`,
      name: `News: ${article.title.slice(0, 50)}...`,
      content: `Titel: ${article.title}\nQuelle: ${article.source} (${article.url})\nKategorie: ${article.category}\nDatum: ${article.pubDate}\n\nInhalt / Auszug:\n${article.content || article.description}\n\nKey Takeaways:\n${summary.takeaways.join('\n')}`,
      date: new Date().toLocaleDateString(),
      type: 'news'
    };

    if (addKnowledgeDoc) {
      addKnowledgeDoc(doc);
    } else {
      const currentKB = useStore.getState().aiKnowledgeBase || [];
      useStore.setState({ aiKnowledgeBase: [...currentKB, doc] });
    }
    alert('🧠 Artikel wurde in der AI Knowledge Base gespeichert!');
  };

  // Add Custom RSS Feed
  const handleAddFeed = (e) => {
    e.preventDefault();
    if (!newFeedUrl.trim() || !newFeedName.trim()) return;

    const newFeed = {
      id: `custom-feed-${Date.now()}`,
      name: newFeedName.trim(),
      url: newFeedUrl.trim(),
      category: newFeedCategory,
      language: 'de',
      enabled: true,
      icon: '📡'
    };

    const updated = [...customFeeds, newFeed];
    if (useStore.getState().setCustomNewsFeeds) {
      useStore.getState().setCustomNewsFeeds(updated);
    } else {
      useStore.setState({ customNewsFeeds: updated });
    }

    setNewFeedUrl('');
    setNewFeedName('');
    alert('✅ Feed hinzugefügt! Die neuen Nachrichten werden beim nächsten Refresh geladen.');
    loadNews();
  };

  // Toggle Feed enabled status
  const handleToggleFeed = (id) => {
    const updated = customFeeds.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f));
    if (useStore.getState().setCustomNewsFeeds) {
      useStore.getState().setCustomNewsFeeds(updated);
    } else {
      useStore.setState({ customNewsFeeds: updated });
    }
  };

  // Delete Custom Feed
  const handleDeleteFeed = (id) => {
    const updated = customFeeds.filter((f) => f.id !== id);
    if (useStore.getState().setCustomNewsFeeds) {
      useStore.getState().setCustomNewsFeeds(updated);
    } else {
      useStore.setState({ customNewsFeeds: updated });
    }
  };

  // Generate Daily Morning Briefing
  const dailyBriefingArticles = useMemo(() => {
    return articles.slice(0, 6);
  }, [articles]);

  return (
    <div className="news-container">
      {/* 1. Live Breaking News Ticker Bar */}
      {breakingNewsItems.length > 0 && (
        <div className="news-ticker-bar">
          <div className="news-ticker-label">
            <div className="news-ticker-dot" />
            Breaking News
          </div>
          <div className="news-ticker-track">
            <div className="news-ticker-content">
              {breakingNewsItems.map((item, idx) => (
                <div
                  key={`ticker-${item.id}-${idx}`}
                  className="news-ticker-item"
                  onClick={() => setActiveReaderArticle(item)}
                >
                  <span className="news-ticker-badge">{item.source}</span>
                  <span>{item.title}</span>
                  <span style={{ opacity: 0.5 }}>•</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Header Section */}
      <div className="news-header-section">
        <div className="news-title-row">
          <div className="news-title-left">
            <div className="news-icon-badge">
              <NewspaperIcon />
            </div>
            <div className="news-header-titles">
              <h1>
                News Hub <span style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: 600 }}>LIVE</span>
              </h1>
              <p>Echtzeit-Nachrichten aus Technologie, Wirtschaft, KI, Wissenschaft und Weltgeschehen.</p>
            </div>
          </div>

          <div className="news-header-actions">
            <button
              className="news-btn primary"
              onClick={() => setIsBriefingModalOpen(true)}
              title="Daily AI Morning Briefing"
            >
              <span>⚡</span> Daily Briefing
            </button>

            <button
              className="news-btn"
              onClick={() => setIsFeedManagerOpen(true)}
              title="Manage RSS Feeds"
            >
              <span>📡</span> Feeds ({customFeeds.filter((f) => f.enabled !== false).length})
            </button>

            <button
              className="news-btn"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              title="Aktualisieren"
            >
              <RefreshIcon spinning={isRefreshing} />
              {isRefreshing ? 'Lädt...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* 3. Controls & Filter Toolbar */}
        <div className="news-toolbar">
          <div className="news-search-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="var(--text-muted)" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
            </svg>
            <input
              type="text"
              placeholder="Thema, Quelle oder Schlagwort suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
              >
                ✕
              </button>
            )}
          </div>

          <div className="news-toolbar-right">
            {/* Language Switch */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-input)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
              <button
                className={`news-btn ${selectedLanguage === 'all' ? 'active' : ''}`}
                style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                onClick={() => setSelectedLanguage('all')}
              >
                🌐 Alle
              </button>
              <button
                className={`news-btn ${selectedLanguage === 'de' ? 'active' : ''}`}
                style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                onClick={() => setSelectedLanguage('de')}
              >
                🇩🇪 DE
              </button>
              <button
                className={`news-btn ${selectedLanguage === 'en' ? 'active' : ''}`}
                style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                onClick={() => setSelectedLanguage('en')}
              >
                🇬🇧 EN
              </button>
            </div>

            {/* Layout Toggle */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-input)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
              <button
                className={`news-btn ${layoutMode === 'grid' ? 'active' : ''}`}
                style={{ padding: '6px 10px' }}
                onClick={() => setLayoutMode('grid')}
                title="Grid Ansicht"
              >
                🎴
              </button>
              <button
                className={`news-btn ${layoutMode === 'magazine' ? 'active' : ''}`}
                style={{ padding: '6px 10px' }}
                onClick={() => setLayoutMode('magazine')}
                title="Magazin Ansicht"
              >
                📰
              </button>
              <button
                className={`news-btn ${layoutMode === 'compact' ? 'active' : ''}`}
                style={{ padding: '6px 10px' }}
                onClick={() => setLayoutMode('compact')}
                title="Kompakte Liste"
              >
                📋
              </button>
            </div>
          </div>
        </div>

        {/* 4. Category Filter Pills */}
        <div className="news-categories-bar">
          {NEWS_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            let count = 0;
            if (cat.id === 'all') count = articles.length;
            else if (cat.id === 'bookmarks') count = newsBookmarks.length;
            else count = articles.filter((a) => a.category?.toLowerCase() === cat.id.toLowerCase()).length;

            return (
              <button
                key={cat.id}
                className={`news-category-pill ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span>{cat.icon}</span>
                <span>{cat.deLabel}</span>
                <span className="news-count-badge">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Main Feed Content */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ display: 'inline-block', marginBottom: '15px' }}>
            <RefreshIcon spinning={true} />
          </div>
          <h3>Nachrichten werden aggregiert & verarbeitet...</h3>
          <p style={{ fontSize: '0.9rem' }}>Verbindung zu Tagesschau, Heise, Hacker News, Dev.to und RSS Feeds...</p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🔍</div>
          <h3>Keine Artikel gefunden</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 20px auto' }}>
            {selectedCategory === 'bookmarks'
              ? 'Du hast noch keine Artikel gespeichert. Klicke auf das Lesezeichen-Symbol bei einem Beitrag, um ihn für später zu merken.'
              : 'Passe deine Suchbegriffe oder Filter an, um passende Meldungen anzuzeigen.'}
          </p>
          {selectedCategory === 'bookmarks' ? (
            <button className="news-btn primary" onClick={() => setSelectedCategory('all')}>
              Zu allen News wechseln
            </button>
          ) : (
            <button className="news-btn" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedLanguage('all'); }}>
              Filter zurücksetzen
            </button>
          )}
        </div>
      ) : (
        <>
          {/* MAGAZINE LAYOUT */}
          {layoutMode === 'magazine' && filteredArticles.length > 0 && (
            <div className="news-magazine-layout">
              {/* Featured Top Story */}
              {filteredArticles[0] && (
                <div className="news-featured-hero" onClick={() => setActiveReaderArticle(filteredArticles[0])}>
                  <div
                    className="news-hero-img-wrap"
                    style={{ backgroundImage: `url(${filteredArticles[0].imageUrl})` }}
                  >
                    <div className="news-card-img-overlay" />
                    <div className="news-card-top-badges">
                      <span className="news-source-tag">{filteredArticles[0].source}</span>
                      <button
                        className={`news-bookmark-btn ${isArticleBookmarked(filteredArticles[0]) ? 'saved' : ''}`}
                        onClick={(e) => handleToggleBookmark(filteredArticles[0], e)}
                      >
                        <StarIcon filled={isArticleBookmarked(filteredArticles[0])} />
                      </button>
                    </div>
                  </div>
                  <div className="news-hero-content">
                    <div>
                      <div className="news-card-meta">
                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>TOP STORY</span>
                        <span>•</span>
                        <span>{new Date(filteredArticles[0].pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>•</span>
                        <span>{filteredArticles[0].readTime}</span>
                      </div>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 12px 0', color: 'var(--text-main)', cursor: 'pointer' }}>
                        {filteredArticles[0].title}
                      </h2>
                      <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem', margin: 0 }}>
                        {filteredArticles[0].description}
                      </p>
                    </div>

                    <div className="news-card-footer" style={{ marginTop: '20px' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Von {filteredArticles[0].author}</span>
                      <div className="news-card-actions">
                        <button
                          className="news-btn"
                          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                          onClick={(e) => { e.stopPropagation(); setActiveReaderArticle(filteredArticles[0]); }}
                        >
                          Artikel lesen ➔
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub Grid */}
              <div className="news-grid">
                {filteredArticles.slice(1).map((item) => (
                  <NewsCard
                    key={item.id}
                    item={item}
                    isSaved={isArticleBookmarked(item)}
                    onToggleBookmark={handleToggleBookmark}
                    onRead={setActiveReaderArticle}
                    onTts={handleToggleTts}
                  />
                ))}
              </div>
            </div>
          )}

          {/* GRID LAYOUT */}
          {layoutMode === 'grid' && (
            <div className="news-grid">
              {filteredArticles.map((item) => (
                <NewsCard
                  key={item.id}
                  item={item}
                  isSaved={isArticleBookmarked(item)}
                  onToggleBookmark={handleToggleBookmark}
                  onRead={setActiveReaderArticle}
                  onTts={handleToggleTts}
                />
              ))}
            </div>
          )}

          {/* COMPACT LIST LAYOUT */}
          {layoutMode === 'compact' && (
            <div className="news-compact-list">
              {filteredArticles.map((item) => (
                <div
                  key={item.id}
                  className="news-compact-item"
                  onClick={() => setActiveReaderArticle(item)}
                >
                  <div className="news-compact-left">
                    <span className="news-source-tag">{item.source}</span>
                    <h4 className="news-compact-title">{item.title}</h4>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      className="news-icon-btn"
                      onClick={(e) => handleToggleBookmark(item, e)}
                      title="Bookmark"
                    >
                      <StarIcon filled={isArticleBookmarked(item)} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 6. DISTRACTION-FREE READER MODAL */}
      {activeReaderArticle && (
        <div className="news-modal-backdrop" onClick={() => { setActiveReaderArticle(null); stopSpeech(); setIsTtsPlaying(false); }}>
          <div className="news-reader-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="news-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="news-source-tag">{activeReaderArticle.source}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {new Date(activeReaderArticle.pubDate).toLocaleString()}
                </span>
              </div>
              <button
                className="news-icon-btn"
                style={{ fontSize: '1.2rem', padding: '4px 8px' }}
                onClick={() => { setActiveReaderArticle(null); stopSpeech(); setIsTtsPlaying(false); }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="news-modal-body">
              {/* Cover Image */}
              {activeReaderArticle.imageUrl && (
                <div
                  className="news-reader-hero"
                  style={{ backgroundImage: `url(${activeReaderArticle.imageUrl})` }}
                >
                  <div className="news-card-img-overlay" />
                </div>
              )}

              <h1 className="news-reader-title">{activeReaderArticle.title}</h1>

              {/* Action Toolbar */}
              <div className="news-reader-action-bar">
                {/* Audio TTS Control */}
                <div className="news-audio-player">
                  <button
                    className={`news-btn ${isTtsPlaying ? 'primary' : ''}`}
                    onClick={() => handleToggleTts(activeReaderArticle)}
                  >
                    <SpeakerIcon />
                    {isTtsPlaying ? 'Pause Vorlesen' : 'Audio Vorlesen'}
                  </button>

                  {isTtsPlaying && (
                    <div className="news-audio-wave">
                      <div className="news-wave-bar" />
                      <div className="news-wave-bar" />
                      <div className="news-wave-bar" />
                      <div className="news-wave-bar" />
                    </div>
                  )}
                </div>

                {/* Font Size & Store Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                    <button
                      className={`news-btn ${readerFontSize === 'sm' ? 'active' : ''}`}
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      onClick={() => setReaderFontSize('sm')}
                    >
                      A-
                    </button>
                    <button
                      className={`news-btn ${readerFontSize === 'md' ? 'active' : ''}`}
                      style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                      onClick={() => setReaderFontSize('md')}
                    >
                      A
                    </button>
                    <button
                      className={`news-btn ${readerFontSize === 'lg' ? 'active' : ''}`}
                      style={{ padding: '4px 8px', fontSize: '0.95rem' }}
                      onClick={() => setReaderFontSize('lg')}
                    >
                      A+
                    </button>
                  </div>

                  <button
                    className={`news-btn ${isArticleBookmarked(activeReaderArticle) ? 'active' : ''}`}
                    onClick={(e) => handleToggleBookmark(activeReaderArticle, e)}
                  >
                    <StarIcon filled={isArticleBookmarked(activeReaderArticle)} />
                    {isArticleBookmarked(activeReaderArticle) ? 'Gespeichert' : 'Merken'}
                  </button>

                  <button
                    className="news-btn"
                    onClick={() => handleSendToJournal(activeReaderArticle)}
                    title="Als Notiz ins Journal übernehmen"
                  >
                    📓 Journal
                  </button>

                  <button
                    className="news-btn"
                    onClick={() => handleSaveToKnowledge(activeReaderArticle)}
                    title="In die AI Wissensdatenbank aufnehmen"
                  >
                    🧠 AI Knowledge
                  </button>

                  <a
                    href={activeReaderArticle.url}
                    target="_blank"
                    rel="noreferrer"
                    className="news-btn primary"
                  >
                    <span>Original</span>
                    <ExternalLinkIcon />
                  </a>
                </div>
              </div>

              {/* AI Key Takeaways Box */}
              {(() => {
                const summary = generateLocalSummary(activeReaderArticle.title, activeReaderArticle.content || activeReaderArticle.description);
                return (
                  <div className="news-ai-summary-card">
                    <div className="news-ai-summary-header">
                      <div className="news-ai-badge">
                        <span>🤖</span> AI Key Takeaways & Analyse
                      </div>
                      <span style={{ fontSize: '0.78rem', background: 'rgba(var(--primary-rgb), 0.15)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                        {summary.sentiment}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {summary.takeaways.map((takeaway, idx) => (
                        <div key={idx} className="news-ai-takeaway-item">
                          <span style={{ color: 'var(--primary)', fontWeight: 800 }}>•</span>
                          <span>{takeaway}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Main Content */}
              <div className={`news-reader-article-text font-${readerFontSize}`}>
                <p style={{ fontWeight: 600, fontSize: '1.1em', color: 'var(--text-main)' }}>
                  {activeReaderArticle.description}
                </p>
                {activeReaderArticle.content && activeReaderArticle.content !== activeReaderArticle.description && (
                  <div style={{ marginTop: '16px', color: 'var(--text-main)', opacity: 0.9 }}>
                    {activeReaderArticle.content}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. DAILY MORNING BRIEFING MODAL */}
      {isBriefingModalOpen && (
        <div className="news-modal-backdrop" onClick={() => setIsBriefingModalOpen(false)}>
          <div className="news-reader-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
            <div className="news-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>⚡</span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>Daily Morning Briefing</h3>
              </div>
              <button className="news-icon-btn" onClick={() => setIsBriefingModalOpen(false)}>✕</button>
            </div>

            <div className="news-modal-body">
              <div style={{ background: 'rgba(var(--primary-rgb), 0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(var(--primary-rgb), 0.25)' }}>
                <h4 style={{ margin: '0 0 6px 0', color: 'var(--primary)' }}>
                  Guten Tag, {useStore.getState().profile?.username || 'Commander'}!
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Hier ist deine automatisierte Zusammenfassung der wichtigsten Schlagzeilen von heute:
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {dailyBriefingArticles.map((art, idx) => (
                  <div
                    key={art.id}
                    style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-light)', cursor: 'pointer' }}
                    onClick={() => { setActiveReaderArticle(art); setIsBriefingModalOpen(false); }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>#{idx + 1} {art.category} • {art.source}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{art.readTime}</span>
                    </div>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: 'var(--text-main)' }}>{art.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{art.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. CUSTOM RSS FEED MANAGER MODAL */}
      {isFeedManagerOpen && (
        <div className="news-modal-backdrop" onClick={() => setIsFeedManagerOpen(false)}>
          <div className="news-reader-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
            <div className="news-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>📡</span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>RSS Feed Manager</h3>
              </div>
              <button className="news-icon-btn" onClick={() => setIsFeedManagerOpen(false)}>✕</button>
            </div>

            <div className="news-modal-body">
              {/* Add Feed Form */}
              <form onSubmit={handleAddFeed} style={{ background: 'var(--bg-input)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>Eigenen RSS Feed hinzufügen</h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Name / Quelle</label>
                    <input
                      type="text"
                      placeholder="z.B. Mein Tech Blog"
                      value={newFeedName}
                      onChange={(e) => setNewFeedName(e.target.value)}
                      style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '8px 12px', borderRadius: '8px', color: 'var(--text-main)' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Kategorie</label>
                    <select
                      value={newFeedCategory}
                      onChange={(e) => setNewFeedCategory(e.target.value)}
                      style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '8px 12px', borderRadius: '8px', color: 'var(--text-main)' }}
                    >
                      <option value="Tech">Tech & AI</option>
                      <option value="Finance">Finance & Crypto</option>
                      <option value="World">World & Politics</option>
                      <option value="Science">Science & Space</option>
                      <option value="Productivity">Life & Productivity</option>
                      <option value="Gaming">Gaming & Culture</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>RSS / Atom XML URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/rss.xml"
                    value={newFeedUrl}
                    onChange={(e) => setNewFeedUrl(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '8px 12px', borderRadius: '8px', color: 'var(--text-main)' }}
                    required
                  />
                </div>

                <button type="submit" className="news-btn primary" style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
                  + Feed hinzufügen
                </button>
              </form>

              {/* Feed List */}
              <h4 style={{ margin: '10px 0 0 0', fontSize: '1rem', color: 'var(--text-main)' }}>Verfügbare Feeds</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {customFeeds.map((feed) => (
                  <div key={feed.id} className="news-feed-item-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.2rem' }}>{feed.icon || '📰'}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-main)' }}>{feed.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{feed.category} • {feed.language?.toUpperCase() || 'DE'}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        className={`news-btn ${feed.enabled !== false ? 'active' : ''}`}
                        style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                        onClick={() => handleToggleFeed(feed.id)}
                      >
                        {feed.enabled !== false ? 'Aktiviert ✓' : 'Pausiert'}
                      </button>

                      {feed.id.startsWith('custom-feed') && (
                        <button
                          className="news-icon-btn"
                          onClick={() => handleDeleteFeed(feed.id)}
                          title="Löschen"
                          style={{ color: 'var(--red-text)' }}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
