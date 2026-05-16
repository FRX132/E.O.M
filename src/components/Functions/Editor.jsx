import React, { useState } from 'react';
import { useStore } from '../../store';
import MarkdownViewer from './MarkdownViewer';

const CodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-code-square" viewBox="0 0 16 16">
    <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
    <path d="M6.854 4.646a.5.5 0 0 1 0 .708L4.207 8l2.647 2.646a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0zm2.292 0a.5.5 0 0 0 0 .708L11.793 8l-2.647 2.646a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708 0z"/>
  </svg>
);

export default function Editor() {
  const files = useStore(state => state.editorFiles || []);
  const setFiles = useStore(state => state.setEditorFiles);

  const [activeFileId, setActiveFileId] = useState(files.length > 0 ? files[0].id : null);
  const [search, setSearch] = useState('');
  const [isPreview, setIsPreview] = useState(false);

  const activeFile = files.find(f => f.id === activeFileId);

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateNew = () => {
    const newFile = {
      id: Date.now(),
      name: 'untitled.md',
      content: '',
      timestamp: Date.now(),
    };
    setFiles([newFile, ...files]);
    setActiveFileId(newFile.id);
    setIsPreview(false);
  };

  const handleUpdate = (field, value) => {
    if (!activeFileId) return;
    setFiles(files.map(f => f.id === activeFileId ? { ...f, [field]: value, timestamp: Date.now() } : f));
  };

  const handleDelete = () => {
    if (!activeFileId) return;
    if (!confirm('Are you sure you want to delete this file?')) return;
    const updatedFiles = files.filter(f => f.id !== activeFileId);
    setFiles(updatedFiles);
    setActiveFileId(updatedFiles.length > 0 ? updatedFiles[0].id : null);
  };

  const formatDate = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="premium-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="premium-header-container" style={{ flexShrink: 0, marginBottom: '20px' }}>
        <div className="premium-icon-wrapper">
          <CodeIcon />
        </div>
        <h1 className="premium-title">Editor</h1>
        <p className="premium-subtitle">Standalone text and code editor.<br />Draft notes, scripts, or markdown documents.</p>
      </div>

      <div style={{ display: 'flex', flex: 1, gap: '20px', minHeight: 0 }}>
        
        {/* LEFT PANEL: FILE TREE */}
        <div className="premium-card" style={{ width: '280px', display: 'flex', flexDirection: 'column', padding: '16px', gap: '12px' }}>
          <button 
            onClick={handleCreateNew} 
            className="pill blue" 
            style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
          >
            + New File
          </button>
          <input 
            type="text" 
            placeholder="Search files..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              padding: '8px 12px',
              borderRadius: '6px',
              outline: 'none',
              fontSize: '0.85rem'
            }}
          />
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '4px' }}>
            {filteredFiles.map(file => (
              <div 
                key={file.id}
                onClick={() => setActiveFileId(file.id)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: activeFileId === file.id ? 'var(--primary)' : 'transparent',
                  color: activeFileId === file.id ? '#fff' : 'var(--text-main)',
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span style={{ opacity: 0.6, fontSize: '1rem' }}>📄</span>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {file.name}
                </div>
              </div>
            ))}
            {filteredFiles.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', marginTop: '20px' }}>
                No files found.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: WORKSPACE */}
        <div className="premium-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
          {activeFile ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              
              {/* Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card-alt)' }}>
                <input 
                  type="text"
                  value={activeFile.name}
                  onChange={(e) => handleUpdate('name', e.target.value)}
                  placeholder="untitled.txt"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    outline: 'none',
                    width: '300px'
                  }}
                />
                
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '8px' }}>
                    {formatDate(activeFile.timestamp)}
                  </span>
                  
                  <button 
                    onClick={() => setIsPreview(!isPreview)} 
                    className={`pill ${isPreview ? 'blue' : ''}`}
                    style={{ fontSize: '0.8rem' }}
                  >
                    {isPreview ? 'Code' : 'Preview'}
                  </button>
                  <button onClick={handleDelete} className="pill red" style={{ fontSize: '0.8rem' }}>Delete</button>
                </div>
              </div>

              {/* Editor / Viewer Area */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {isPreview ? (
                  <div style={{ padding: '24px', flex: 1 }}>
                    <MarkdownViewer 
                      content={activeFile.content || '*Empty file.*'}
                      onUpdate={(newContent) => handleUpdate('content', newContent)}
                    />
                  </div>
                ) : (
                  <textarea 
                    value={activeFile.content}
                    onChange={(e) => handleUpdate('content', e.target.value)}
                    placeholder="Write code, markdown, or plain text..."
                    spellCheck="false"
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-main)',
                      padding: '24px',
                      fontSize: '0.95rem',
                      lineHeight: '1.6',
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'var(--font-mono), monospace',
                      whiteSpace: 'pre-wrap'
                    }}
                  />
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              Select a file or create a new one.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
