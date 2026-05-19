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

  const [activeEntryId, setActiveEntryId] = useState(journal.length > 0 ? journal[0].id : null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', content: '' });
  const [search, setSearch] = useState('');

  const activeEntry = journal.find(e => e.id === activeEntryId);

  // Derived state
  const sortedJournal = [...journal].sort((a, b) => b.timestamp - a.timestamp);
  const filteredJournal = sortedJournal.filter(e => 
    e.title.toLowerCase().includes(search.toLowerCase()) || 
    e.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateNew = () => {
    const newEntry = {
      id: Date.now(),
      title: 'New Entry',
      content: '',
      timestamp: Date.now(),
    };
    setJournal([newEntry, ...journal]);
    setActiveEntryId(newEntry.id);
    setEditForm({ title: newEntry.title, content: newEntry.content });
    setIsEditing(true);
  };

  const handleEdit = () => {
    if (!activeEntry) return;
    setEditForm({ title: activeEntry.title, content: activeEntry.content });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!activeEntryId) return;
    setJournal(journal.map(e => e.id === activeEntryId ? { ...e, title: editForm.title, content: editForm.content, timestamp: Date.now() } : e));
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
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {entry.title || 'Untitled'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {formatDate(entry.timestamp)}
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
        <div className="premium-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', overflowY: 'auto' }}>
          {activeEntry ? (
            isEditing ? (
              // EDIT MODE
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
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
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setIsEditing(false)} className="pill">Cancel</button>
                    <button onClick={handleSave} className="pill green">Save</button>
                  </div>
                </div>
                <textarea 
                  value={editForm.content}
                  onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                  placeholder="Start typing your entry... Markdown is supported."
                  style={{
                    flex: 1,
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '16px',
                    fontSize: '0.9rem',
                    lineHeight: '1.6',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'var(--font-main)'
                  }}
                />
              </div>
            ) : (
              // VIEW MODE
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '8px' }}>{activeEntry.title}</h2>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(activeEntry.timestamp)}</span>
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
