import React, { useState } from 'react';
import { useStore } from '../../store';
import MarkdownViewer from '../Functions/MarkdownViewer';

const JournalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-journal-text" viewBox="0 0 16 16">
    <path d="M5 10.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
    <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2z"/>
    <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1z"/>
  </svg>
);

export default function Journal() {
  const journal = useStore(state => state.journal || []);
  const setJournal = useStore(state => state.setJournal);
  const overviewSettings = useStore(state => state.overviewSettings);
  const setOverviewSettings = useStore(state => state.setOverviewSettings);

  const MOOD_OPTIONS = [
    { emoji: '🔥', label: 'Unstoppable' },
    { emoji: '😊', label: 'Great' },
    { emoji: '⚡', label: 'Focused' },
    { emoji: '😐', label: 'Neutral' },
    { emoji: '😴', label: 'Tired' }
  ];

  const [activeEntryId, setActiveEntryId] = useState(journal.length > 0 ? journal[0].id : null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', content: '', mood: null });
  const [moodFilter, setMoodFilter] = useState('All');
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('journal_view_mode') || 'split';
  });

  const changeViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('journal_view_mode', mode);
  };

  const [search, setSearch] = useState('');

  const activeEntry = journal.find(e => e.id === activeEntryId);

  // Derived state
  const sortedJournal = [...journal].sort((a, b) => b.timestamp - a.timestamp);
  const filteredJournal = sortedJournal.filter(e => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) || 
      e.content.toLowerCase().includes(search.toLowerCase());
    const matchesMood =
      moodFilter === 'All' ||
      e.mood?.label === moodFilter ||
      e.mood?.emoji === moodFilter;
    return matchesSearch && matchesMood;
  });

  const handleCreateNew = () => {
    const todayMood = overviewSettings?.todayMood || null;
    const newEntry = {
      id: Date.now(),
      title: todayMood ? `Daily Log - ${new Date().toLocaleDateString()}` : 'New Entry',
      content: '',
      mood: todayMood ? { emoji: todayMood.emoji, label: todayMood.label } : null,
      timestamp: Date.now(),
    };
    setJournal([newEntry, ...journal]);
    setActiveEntryId(newEntry.id);
    setEditForm({ title: newEntry.title, content: newEntry.content, mood: newEntry.mood });
    setIsEditing(true);
  };

  const handleEdit = () => {
    if (!activeEntry) return;
    setEditForm({ title: activeEntry.title, content: activeEntry.content, mood: activeEntry.mood || null });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!activeEntryId) return;
    const updatedMood = editForm.mood || null;
    setJournal(journal.map(e => e.id === activeEntryId ? {
      ...e,
      title: editForm.title,
      content: editForm.content,
      mood: updatedMood,
      timestamp: Date.now()
    } : e));

    // If updated entry has a mood, sync to today's mood in overview
    if (updatedMood) {
      setOverviewSettings({
        ...overviewSettings,
        todayMood: { ...updatedMood, timestamp: Date.now() }
      });
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!activeEntryId) return;
    if (!confirm('Are you sure you want to delete this entry?')) return;
    const updatedJournal = journal.filter(e => e.id !== activeEntryId);
    setJournal(updatedJournal);
    setActiveEntryId(updatedJournal.length > 0 ? updatedJournal[0].id : null);
    setIsEditing(false);
  };

  const formatDate = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="premium-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="premium-header-container" style={{ flexShrink: 0, marginBottom: '20px' }}>
        <div className="premium-icon-wrapper">
          <JournalIcon />
        </div>
        <h1 className="premium-title">Journal</h1>
        <p className="premium-subtitle">Document your thoughts, logs, and notes.<br />Full Markdown support.</p>
      </div>

      <div style={{ display: 'flex', flex: 1, gap: '20px', minHeight: 0 }}>
        
        {/* LEFT PANEL: LIST */}
        <div className="premium-card" style={{ width: '300px', minWidth: '180px', maxWidth: '600px', resize: 'horizontal', overflow: 'auto', display: 'flex', flexDirection: 'column', padding: '16px', gap: '12px' }}>
          <button 
            onClick={handleCreateNew} 
            className="pill blue" 
            style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
          >
            + New Entry
          </button>
          <input 
            type="text" 
            placeholder="Search entries..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              padding: '8px 12px',
              borderRadius: '6px',
              outline: 'none'
            }}
          />

          {/* Mood Filter Row */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', padding: '2px 0' }}>
            <button
              type="button"
              onClick={() => setMoodFilter('All')}
              style={{
                padding: '3px 8px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                background: moodFilter === 'All' ? 'var(--primary)' : 'transparent',
                color: moodFilter === 'All' ? '#fff' : 'var(--text-muted)',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              All
            </button>
            {MOOD_OPTIONS.map(m => (
              <button
                key={m.label}
                type="button"
                onClick={() => setMoodFilter(moodFilter === m.label ? 'All' : m.label)}
                title={m.label}
                style={{
                  padding: '3px 8px',
                  borderRadius: '12px',
                  border: `1px solid ${moodFilter === m.label ? '#ec4899' : 'var(--border-color)'}`,
                  background: moodFilter === m.label ? 'rgba(236, 72, 153, 0.25)' : 'transparent',
                  color: moodFilter === m.label ? '#ec4899' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                {m.emoji}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
            {filteredJournal.map(entry => (
              <div 
                key={entry.id}
                onClick={() => {
                  setActiveEntryId(entry.id);
                  setIsEditing(false);
                }}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: activeEntryId === entry.id ? 'var(--bg-card-alt)' : 'transparent',
                  border: `1px solid ${activeEntryId === entry.id ? 'var(--primary)' : 'var(--border-light)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  {entry.mood && <span title={entry.mood.label} style={{ fontSize: '0.95rem' }}>{entry.mood.emoji}</span>}
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                    {entry.title || 'Untitled'}
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{formatDate(entry.timestamp)}</span>
                  {entry.mood && <span style={{ color: '#ec4899', fontWeight: 600 }}>{entry.mood.label}</span>}
                </div>
              </div>
            ))}
            {filteredJournal.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', marginTop: '20px' }}>
                No entries found.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: EDITOR/VIEWER */}
        <div className="premium-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', overflow: 'hidden' }}>
          {activeEntry ? (
            isEditing ? (
              // EDIT MODE
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexShrink: 0 }}>
                  <input 
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    placeholder="Entry Title"
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '2px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      outline: 'none',
                      padding: '8px 0'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    
                    {/* Segmented view mode selector */}
                    <div style={{ display: 'flex', background: 'var(--bg-main)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-color)', gap: '2px', marginRight: '8px' }}>
                      <button 
                        onClick={() => changeViewMode('edit')} 
                        className={`pill ${viewMode === 'edit' ? 'blue' : ''}`}
                        style={{ fontSize: '0.75rem', padding: '4px 10px', background: viewMode === 'edit' ? 'var(--blue-bg)' : 'transparent', border: 'none', color: viewMode === 'edit' ? 'var(--blue-text)' : 'var(--text-muted)', cursor: 'pointer' }}
                        title="Editor Mode"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => changeViewMode('split')} 
                        className={`pill ${viewMode === 'split' ? 'blue' : ''}`}
                        style={{ fontSize: '0.75rem', padding: '4px 10px', background: viewMode === 'split' ? 'var(--blue-bg)' : 'transparent', border: 'none', color: viewMode === 'split' ? 'var(--blue-text)' : 'var(--text-muted)', cursor: 'pointer' }}
                        title="Split Live Preview Mode"
                      >
                        🥞 Split
                      </button>
                      <button 
                        onClick={() => changeViewMode('preview')} 
                        className={`pill ${viewMode === 'preview' ? 'blue' : ''}`}
                        style={{ fontSize: '0.75rem', padding: '4px 10px', background: viewMode === 'preview' ? 'var(--blue-bg)' : 'transparent', border: 'none', color: viewMode === 'preview' ? 'var(--blue-text)' : 'var(--text-muted)', cursor: 'pointer' }}
                        title="Preview Mode"
                      >
                        👁️ Preview
                      </button>
                    </div>

                    <button onClick={() => setIsEditing(false)} className="pill">Cancel</button>
                    <button onClick={handleSave} className="pill green">Save</button>
                  </div>
                </div>

                {/* Mood Selector Row in Edit Mode */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>Mood:</span>
                  {MOOD_OPTIONS.map(m => {
                    const isSelected = editForm.mood?.label === m.label;
                    return (
                      <button
                        key={m.label}
                        type="button"
                        onClick={() => setEditForm({ ...editForm, mood: isSelected ? null : m })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 10px',
                          borderRadius: '14px',
                          border: `1px solid ${isSelected ? '#ec4899' : 'var(--border-color)'}`,
                          background: isSelected ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                          color: isSelected ? '#ec4899' : 'var(--text-muted)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <span>{m.emoji}</span>
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                  {editForm.mood && (
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, mood: null })}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '0.72rem',
                        cursor: 'pointer'
                      }}
                    >
                      ✕ Clear
                    </button>
                  )}
                </div>
                
                <div className={`editor-split-workspace ${viewMode === 'split' ? 'split' : ''}`} style={{ flex: 1, display: 'flex', minHeight: 0, border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-input)' }}>
                  {(viewMode === 'edit' || viewMode === 'split') && (
                    <textarea 
                      value={editForm.content}
                      onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                      placeholder="Start typing your entry... Markdown is supported."
                      className="editor-textarea"
                      style={{
                        fontFamily: 'var(--font-main)',
                        fontSize: '0.9rem',
                        padding: '16px'
                      }}
                    />
                  )}
                  {(viewMode === 'preview' || viewMode === 'split') && (
                    <div 
                      className="editor-preview-panel"
                      style={{
                        padding: '16px'
                      }}
                    >
                      <MarkdownViewer 
                        content={editForm.content || '*Empty entry.*'}
                        onUpdate={(newContent) => setEditForm({...editForm, content: newContent})}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // VIEW MODE
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {activeEntry.mood && (
                        <span style={{ fontSize: '1.8rem' }} title={activeEntry.mood.label}>
                          {activeEntry.mood.emoji}
                        </span>
                      )}
                      <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>{activeEntry.title}</h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(activeEntry.timestamp)}</span>
                      {activeEntry.mood && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: 'rgba(236, 72, 153, 0.15)',
                          border: '1px solid rgba(236, 72, 153, 0.3)',
                          color: '#f472b6',
                          fontSize: '0.72rem',
                          fontWeight: 700
                        }}>
                          {activeEntry.mood.emoji} {activeEntry.mood.label} Mood
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleEdit} className="pill blue">Edit</button>
                    <button onClick={handleDelete} className="pill red">Delete</button>
                  </div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
                  <MarkdownViewer 
                    content={activeEntry.content || '*Empty entry.*'}
                    onUpdate={(newContent) => {
                      setJournal(journal.map(e => e.id === activeEntry.id ? { ...e, content: newContent } : e));
                    }}
                  />
                </div>
              </div>
            )
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              Select an entry or create a new one.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
