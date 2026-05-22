import React, { useState, useEffect } from 'react';
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
  const [viewMode, setViewMode] = useState('edit'); // 'edit', 'split', 'preview'
  const [isHelperOpen, setIsHelperOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [collapsedFolders, setCollapsedFolders] = useState({});

  const [folders, setFolders] = useState(() => {
    const existing = files.map(f => f.folder).filter(Boolean);
    const defaults = ['Inbox', 'Personal', 'Work', 'Obsidian'];
    return Array.from(new Set([...defaults, ...existing]));
  });

  // Pre-load default Obsidian Handbuch file if database is empty
  useEffect(() => {
    if (files.length === 0) {
      const defaultFile = {
        id: 1,
        name: 'Obsidian Guide.md',
        folder: 'Obsidian',
        content: `# 📓 Obsidian & Markdown Guide\n\nWelcome to your E.O.M Notes Workspace! Here is an overview of the most important Markdown formatting syntax, which you can also use directly in Obsidian.\n\n## 1. Headings\nUse \`#\` followed by a space for headings:\n# Heading 1 (H1)\n## Heading 2 (H2)\n### Heading 3 (H3)\n\n## 2. Text Formatting\n* *Italic* (\`*Italic*\` or \`_Italic_\`)\n* **Bold** (\`**Bold**\` or \`__Bold__\`)\n* ***Bold & Italic*** (\`***Bold & Italic***\`)\n* ~~Strikethrough~~ (\`~~Strikethrough~~\`)\n* ==Highlighted (Obsidian Highlight)== (\`==Highlighted==\`)\n\n## 3. Lists\n### Unordered:\n- Item 1\n- Item 2\n  - Sub-item 2a\n\n### Ordered:\n1. First item\n2. Second item\n\n### Task List:\n- [ ] Open task\n- [x] Completed task\n\n## 4. Links & Images\n* External Link: [Google](https://google.com) (\`[Google](https://google.com)\`)\n* Internal Wikilink (Obsidian-Style): [[Title of another note]] (\`[[Title of another note]]\`)\n* Image: \`![Image description](URL)\`\n\n## 5. Code & Quotes\n### Inline Code:\nUse backticks: \`const temp = 24.5;\`\n\n### Code Block:\n\`\`\`javascript\n// Syntax highlighting for JS\nfunction greet() {\n  console.log("Hello World!");\n}\n\`\`\`\n\n### Blockquotes:\n> "The limits of my language mean the limits of my world." — Ludwig Wittgenstein\n\n## 6. Tables\n| Feature | Syntax | Example |\n| :--- | :---: | ---: |\n| Bold | \`**text**\` | **Bold** |\n| Code | \\\`code\\\` | \\\`Code\\\` |\n\n## 7. Math Formulas (LaTeX)\n* Inline: $E = mc^2$ (\`$E = mc^2$\`)\n`,
        timestamp: Date.now()
      };
      setFiles([defaultFile]);
      setActiveFileId(1);
    }
  }, [files, setFiles]);

  // Keep activeFileId stable when files list changes
  useEffect(() => {
    if (files.length > 0 && !activeFileId) {
      setActiveFileId(files[0].id);
    }
  }, [files, activeFileId]);

  // Keep local folders list synchronized with any folders in files
  useEffect(() => {
    const existing = files.map(f => f.folder).filter(Boolean);
    setFolders(prev => {
      const merged = Array.from(new Set([...prev, ...existing]));
      if (merged.length !== prev.length) {
        return merged;
      }
      return prev;
    });
  }, [files]);

  const activeFile = files.find(f => f.id === activeFileId);

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateNew = () => {
    const newFile = {
      id: Date.now(),
      name: 'untitled.md',
      content: '',
      folder: 'Inbox',
      timestamp: Date.now(),
    };
    setFiles([newFile, ...files]);
    setActiveFileId(newFile.id);
    setViewMode('edit');
  };

  const handleCreateFileInFolder = (folderName) => {
    const newFile = {
      id: Date.now(),
      name: 'untitled.md',
      content: '',
      folder: folderName,
      timestamp: Date.now(),
    };
    setFiles([newFile, ...files]);
    setActiveFileId(newFile.id);
    setViewMode('edit');
  };

  const handleCreateFolder = () => {
    const cleanFolder = newFolderName.trim();
    if (!cleanFolder) return;
    if (!folders.includes(cleanFolder)) {
      setFolders([...folders, cleanFolder]);
    }
    setNewFolderName('');
  };

  const handleImportFiles = async () => {
    if (!window.electronAPI || !window.electronAPI.selectFiles) {
      alert("Electron API is not available.");
      return;
    }
    const res = await window.electronAPI.selectFiles();
    if (res.success && res.files && res.files.length > 0) {
      const baseTime = Date.now();
      const imported = res.files.map((file, idx) => ({
        id: baseTime + idx,
        name: file.name,
        content: file.content,
        folder: file.folder || 'Inbox',
        timestamp: file.timestamp || baseTime
      }));
      setFiles([...imported, ...files]);
      setActiveFileId(imported[0].id);
      setViewMode('edit');
    } else if (res.error && res.error !== 'No files selected') {
      alert(`Error importing files: ${res.error}`);
    }
  };

  const handleImportFolder = async () => {
    if (!window.electronAPI || !window.electronAPI.selectVault) {
      alert("Electron API is not available.");
      return;
    }
    const res = await window.electronAPI.selectVault();
    if (res.success && res.files && res.files.length > 0) {
      const baseTime = Date.now();
      const imported = res.files.map((file, idx) => ({
        id: baseTime + idx,
        name: file.name,
        content: file.content,
        folder: file.folder,
        timestamp: file.timestamp || baseTime
      }));
      setFiles([...imported, ...files]);
      setActiveFileId(imported[0].id);
      setViewMode('edit');
    } else if (res.error && res.error !== 'No directory selected') {
      alert(`Error importing folder: ${res.error}`);
    }
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

  const toggleFolder = (folderName) => {
    setCollapsedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  const handleCollapseAll = () => {
    const collapsed = {};
    folders.forEach(f => {
      collapsed[f] = true;
    });
    setCollapsedFolders(collapsed);
  };

  const handleExpandAll = () => {
    setCollapsedFolders({});
  };

  const handleImportFilesToFolder = async (folderName) => {
    if (!window.electronAPI || !window.electronAPI.selectFiles) {
      alert("Electron API is not available.");
      return;
    }
    const res = await window.electronAPI.selectFiles();
    if (res.success && res.files && res.files.length > 0) {
      const baseTime = Date.now();
      const imported = res.files.map((file, idx) => ({
        id: baseTime + idx,
        name: file.name,
        content: file.content,
        folder: folderName,
        timestamp: file.timestamp || baseTime
      }));
      setFiles([...imported, ...files]);
      setActiveFileId(imported[0].id);
      setViewMode('edit');
    } else if (res.error && res.error !== 'No files selected') {
      alert(`Error importing files: ${res.error}`);
    }
  };

  const handleAppendFileContent = async () => {
    if (!activeFileId || !activeFile) return;
    if (!window.electronAPI || !window.electronAPI.selectFiles) {
      alert("Electron API is not available.");
      return;
    }
    const res = await window.electronAPI.selectFiles();
    if (res.success && res.files && res.files.length > 0) {
      let extraContent = '';
      res.files.forEach(f => {
        extraContent += `\n\n--- Appended from ${f.name} ---\n${f.content}`;
      });
      handleUpdate('content', (activeFile.content || '') + extraContent);
    } else if (res.error && res.error !== 'No files selected') {
      alert(`Error appending files: ${res.error}`);
    }
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
        <p className="premium-subtitle">Standalone text and markdown editor with folders.<br />Draft notes, wikis, and organize your files.</p>
      </div>

      <div style={{ display: 'flex', flex: 1, gap: '20px', minHeight: 0 }}>
        
        {/* LEFT PANEL: FILE TREE */}
        <div className="premium-card" style={{ width: '280px', minWidth: '220px', maxWidth: '400px', resize: 'horizontal', overflow: 'auto', display: 'flex', flexDirection: 'column', padding: '16px', gap: '12px' }}>
          
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              onClick={handleCreateNew} 
              className="pill blue" 
              style={{ flex: 1, justifyContent: 'center', padding: '8px', fontSize: '0.8rem' }}
            >
              + New File
            </button>
          </div>

          {/* New Folder Creator */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              placeholder="New folder..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              style={{
                flex: 1,
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                padding: '6px 10px',
                borderRadius: '6px',
                outline: 'none',
                fontSize: '0.8rem'
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
            <button 
              onClick={handleCreateFolder}
              className="pill blue"
              style={{ padding: '6px 10px', minWidth: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              +
            </button>
          </div>

          {/* Import Actions */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              onClick={handleImportFiles} 
              className="pill" 
              style={{
                flex: 1,
                justifyContent: 'center',
                padding: '6px 8px',
                fontSize: '0.75rem',
                border: '1px dashed var(--border-color)',
                background: 'rgba(255,255,255,0.02)',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Import markdown or text files"
            >
              📥 Import File(s)
            </button>
            <button 
              onClick={handleImportFolder} 
              className="pill" 
              style={{
                flex: 1,
                justifyContent: 'center',
                padding: '6px 8px',
                fontSize: '0.75rem',
                border: '1px dashed var(--border-color)',
                background: 'rgba(255,255,255,0.02)',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Import local folder or Obsidian vault"
            >
              📁 Import Folder
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Folders</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                onClick={handleExpandAll} 
                className="pill" 
                style={{ 
                  padding: '2px 6px', 
                  fontSize: '0.65rem', 
                  cursor: 'pointer', 
                  background: 'transparent', 
                  border: '1px solid var(--border-color)', 
                  color: 'var(--text-main)' 
                }}
                title="Expand All Folders"
              >
                📂 Expand All
              </button>
              <button 
                onClick={handleCollapseAll} 
                className="pill" 
                style={{ 
                  padding: '2px 6px', 
                  fontSize: '0.65rem', 
                  cursor: 'pointer', 
                  background: 'transparent', 
                  border: '1px solid var(--border-color)', 
                  color: 'var(--text-main)' 
                }}
                title="Collapse All Folders"
              >
                📁 Collapse All
              </button>
            </div>
          </div>

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

          {/* Collapsible Folders Tree */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
            {folders.map(folder => {
              const folderFiles = filteredFiles.filter(f => (f.folder || 'Inbox') === folder);
              const isCollapsed = collapsedFolders[folder];
              
              return (
                <div key={folder} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: 'rgba(255,255,255,0.02)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      transition: 'background 0.2s'
                    }}
                    onClick={() => toggleFolder(folder)}
                    className="folder-header"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{isCollapsed ? '📁' : '📂'}</span>
                      <span>{folder}</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>({folderFiles.length})</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImportFilesToFolder(folder);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          padding: '0 4px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title={`Import files to ${folder}`}
                      >
                        📥
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateFileInFolder(folder);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          fontSize: '1.1rem',
                          padding: '0 4px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title={`Create file in ${folder}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {!isCollapsed && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '12px', borderLeft: '1px solid var(--border-color)', marginLeft: '8px', marginTop: '4px' }}>
                      {folderFiles.map(file => (
                        <div 
                          key={file.id}
                          onClick={() => setActiveFileId(file.id)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: activeFileId === file.id ? 'var(--primary)' : 'transparent',
                            color: activeFileId === file.id ? '#fff' : 'var(--text-main)',
                            cursor: 'pointer',
                            transition: 'all 0.1s ease',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          <span>📄</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span>
                        </div>
                      ))}
                      {folderFiles.length === 0 && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic', padding: '4px 10px' }}>
                          Empty
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER PANEL: WORKSPACE */}
        <div className="premium-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
          {activeFile ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              
              {/* Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card-alt)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="text"
                    value={activeFile.name}
                    onChange={(e) => handleUpdate('name', e.target.value)}
                    placeholder="untitled.md"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-main)',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      outline: 'none',
                      width: '180px'
                    }}
                  />
                  
                  {/* Folder Selector Dropdown */}
                  <select
                    value={activeFile.folder || 'Inbox'}
                    onChange={(e) => handleUpdate('folder', e.target.value)}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {folders.map(folder => (
                      <option key={folder} value={folder}>{folder}</option>
                    ))}
                  </select>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '8px' }} className="hide-mobile">
                    {formatDate(activeFile.timestamp)}
                  </span>
                  
                  {/* Segmented view mode selector */}
                  <div style={{ display: 'flex', background: 'var(--bg-main)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-color)', gap: '2px' }}>
                    <button 
                      onClick={() => setViewMode('edit')} 
                      className={`pill ${viewMode === 'edit' ? 'blue' : ''}`}
                      style={{ fontSize: '0.75rem', padding: '4px 10px', background: viewMode === 'edit' ? 'var(--blue-bg)' : 'transparent', border: 'none', color: viewMode === 'edit' ? 'var(--blue-text)' : 'var(--text-muted)', cursor: 'pointer' }}
                      title="Editor Mode"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => setViewMode('split')} 
                      className={`pill ${viewMode === 'split' ? 'blue' : ''}`}
                      style={{ fontSize: '0.75rem', padding: '4px 10px', background: viewMode === 'split' ? 'var(--blue-bg)' : 'transparent', border: 'none', color: viewMode === 'split' ? 'var(--blue-text)' : 'var(--text-muted)', cursor: 'pointer' }}
                      title="Split Live Preview Mode"
                    >
                      🥞 Split
                    </button>
                    <button 
                      onClick={() => setViewMode('preview')} 
                      className={`pill ${viewMode === 'preview' ? 'blue' : ''}`}
                      style={{ fontSize: '0.75rem', padding: '4px 10px', background: viewMode === 'preview' ? 'var(--blue-bg)' : 'transparent', border: 'none', color: viewMode === 'preview' ? 'var(--blue-text)' : 'var(--text-muted)', cursor: 'pointer' }}
                      title="Preview Mode"
                    >
                      👁️ Preview
                    </button>
                  </div>

                  <button 
                    onClick={() => setIsHelperOpen(!isHelperOpen)} 
                    className={`pill ${isHelperOpen ? 'blue' : ''}`}
                    style={{ fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    📖 Manual
                  </button>

                  <button 
                    onClick={handleAppendFileContent} 
                    className="pill green" 
                    style={{ fontSize: '0.8rem', cursor: 'pointer' }}
                    title="Append file content to this note"
                  >
                    ➕ Append File
                  </button>

                  <button onClick={handleDelete} className="pill red" style={{ fontSize: '0.8rem', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>

              {/* Editor / Viewer Area */}
              <div className={`editor-split-workspace ${viewMode === 'split' ? 'split' : ''}`}>
                {(viewMode === 'edit' || viewMode === 'split') && (
                  <textarea 
                    value={activeFile.content}
                    onChange={(e) => handleUpdate('content', e.target.value)}
                    placeholder="Write code, markdown, or plain text..."
                    spellCheck="false"
                    className="editor-textarea"
                  />
                )}
                {(viewMode === 'preview' || viewMode === 'split') && (
                  <div className="editor-preview-panel">
                    <MarkdownViewer 
                      content={activeFile.content || '*Empty file.*'}
                      onUpdate={(newContent) => handleUpdate('content', newContent)}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'center', height: '100%', color: 'var(--text-muted)' }}>
              Select a file or create a new one.
            </div>
          )}
        </div>

        {/* RIGHT PANEL: MARKDOWN GUIDE */}
        {isHelperOpen && (
          <div className="premium-card" style={{ width: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '16px', gap: '12px', borderLeft: '1px solid var(--border-color)', background: 'var(--bg-card-alt)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>📖 Obsidian Manual</span>
              <button 
                onClick={() => setIsHelperOpen(false)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '0.8rem', lineHeight: '1.4' }}>
              <div>
                <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '4px' }}>Headers</strong>
                <pre style={{ background: 'var(--bg-main)', padding: '6px', borderRadius: '4px', margin: 0 }}># Title H1<br/>## Title H2<br/>### Title H3</pre>
              </div>
              
              <div>
                <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '4px' }}>Emphasis</strong>
                <pre style={{ background: 'var(--bg-main)', padding: '6px', borderRadius: '4px', margin: 0 }}>**Bold Text**<br/>*Italic Text*<br/>~~Strikethrough~~<br/>==Highlight==</pre>
              </div>

              <div>
                <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '4px' }}>Wikilinks & Links</strong>
                <pre style={{ background: 'var(--bg-main)', padding: '6px', borderRadius: '4px', margin: 0 }}>[[Internal Note]]<br/>[Link Text](https://...)</pre>
              </div>

              <div>
                <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '4px' }}>Task List</strong>
                <pre style={{ background: 'var(--bg-main)', padding: '6px', borderRadius: '4px', margin: 0 }}>- [ ] Todo Item<br/>- [x] Completed Item</pre>
              </div>

              <div>
                <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '4px' }}>Code Block</strong>
                <pre style={{ background: 'var(--bg-main)', padding: '6px', borderRadius: '4px', margin: 0 }}>\`\`\`javascript<br/>const a = 1;<br/>\`\`\`</pre>
              </div>

              <div>
                <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '4px' }}>Quotes</strong>
                <pre style={{ background: 'var(--bg-main)', padding: '6px', borderRadius: '4px', margin: 0 }}>&gt; This is a blockquote.</pre>
              </div>

              <div>
                <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '4px' }}>Tables</strong>
                <pre style={{ background: 'var(--bg-main)', padding: '6px', borderRadius: '4px', margin: 0 }}>| Col 1 | Col 2 |<br/>|---|---|<br/>| Val 1 | Val 2 |</pre>
              </div>

              <div>
                <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '4px' }}>Math (LaTeX)</strong>
                <pre style={{ background: 'var(--bg-main)', padding: '6px', borderRadius: '4px', margin: 0 }}>$E = mc^2$<br/><br/>$$<br/>a^2 + b^2 = c^2<br/>$$</pre>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
