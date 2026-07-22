import React, { useState, useMemo } from 'react';
import { useStore } from '../../store';
import '../Styles/PasswordManager.css';

// Hashing helper using Web Crypto SHA-256
const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hash));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Salted XOR encryption helper
const encryptText = (text, key) => {
  if (!text) return '';
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(unescape(encodeURIComponent(result)));
};

// Salted XOR decryption helper
const decryptText = (encoded, key) => {
  if (!encoded) return '';
  try {
    const decoded = decodeURIComponent(escape(atob(encoded)));
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch {
    return 'Decryption Error';
  }
};

// Password strength analyzer
const analyzePassword = (pw) => {
  if (!pw) return { score: 0, text: 'No password', color: '#ff4d4d' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score, text: 'Very Weak 🔴', color: '#ef4444' };
  if (score === 2) return { score, text: 'Weak 🟠', color: '#f97316' };
  if (score === 3) return { score, text: 'Medium 🟡', color: '#eab308' };
  if (score === 4) return { score, text: 'Strong 🟢', color: '#10b981' };
  return { score, text: 'Excellent 🔥', color: '#06b6d4' };
};

export default function PasswordManager() {
  const passwordsVault = useStore(state => state.passwordsVault || []);
  const setPasswordsVault = useStore(state => state.setPasswordsVault);
  const masterPasswordHash = useStore(state => state.masterPasswordHash || '');
  const setMasterPassword = useStore(state => state.setMasterPassword);

  // Authentication & Session State
  const [unlockedKey, setUnlockedKey] = useState(''); // Stores typed key in memory while logged in
  const [masterInput, setMasterInput] = useState('');
  const [confirmInput, setConfirmInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // UI & CRUD State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [revealPasswordId, setRevealPasswordId] = useState(null);

  // Input states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Login');
  const [website, setWebsite] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');

  // Password Generator State
  const [genLength, setGenLength] = useState(16);
  const [genUpper, setGenUpper] = useState(true);
  const [genNumbers, setGenNumbers] = useState(true);
  const [genSymbols, setGenSymbols] = useState(true);
  const [generatedPw, setGeneratedPw] = useState('');

  // Register master password on first launch
  const handleSetupMaster = async (e) => {
    e.preventDefault();
    if (masterInput.length < 6) {
      setErrorMsg('Master Password must be at least 6 characters.');
      return;
    }
    if (masterInput !== confirmInput) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    const hash = await hashPassword(masterInput);
    setMasterPassword(hash);
    setUnlockedKey(masterInput);
    setMasterInput('');
    setConfirmInput('');
    setErrorMsg('');
  };

  // Unlock existing vault
  const handleUnlock = async (e) => {
    e.preventDefault();
    const hash = await hashPassword(masterInput);
    if (hash === masterPasswordHash) {
      setUnlockedKey(masterInput);
      setMasterInput('');
      setErrorMsg('');
    } else {
      setErrorMsg('Invalid Master Password.');
    }
  };

  // Generate strong password
  const generatePassword = () => {
    let charset = 'abcdefghijklmnopqrstuvwxyz';
    if (genUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (genNumbers) charset += '0123456789';
    if (genSymbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    let result = '';
    for (let i = 0; i < genLength; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setGeneratedPw(result);
    setPassword(result);
  };

  // Open add modal
  const handleOpenAdd = () => {
    setEditingEntry(null);
    setTitle('');
    setCategory('Login');
    setWebsite('');
    setUsername('');
    setPassword('');
    setNotes('');
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (entry) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setCategory(entry.category);
    setWebsite(entry.website || '');
    setUsername(decryptText(entry.username, unlockedKey));
    setPassword(decryptText(entry.password, unlockedKey));
    setNotes(decryptText(entry.notes, unlockedKey));
    setIsModalOpen(true);
  };

  // Save Add/Edit
  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim() || !username.trim() || !password.trim()) {
      alert('Please fill in Title, Username, and Password.');
      return;
    }

    const encryptedUser = encryptText(username.trim(), unlockedKey);
    const encryptedPass = encryptText(password.trim(), unlockedKey);
    const encryptedNotes = encryptText(notes.trim(), unlockedKey);

    if (editingEntry) {
      const updated = passwordsVault.map(entry => entry.id === editingEntry.id ? {
        ...entry,
        title: title.trim(),
        category,
        website: website.trim(),
        username: encryptedUser,
        password: encryptedPass,
        notes: encryptedNotes,
        updatedAt: new Date().toISOString()
      } : entry);
      setPasswordsVault(updated);
      if (selectedEntry && selectedEntry.id === editingEntry.id) {
        setSelectedEntry({
          ...selectedEntry,
          title: title.trim(),
          category,
          website: website.trim(),
          username: encryptedUser,
          password: encryptedPass,
          notes: encryptedNotes
        });
      }
    } else {
      const newEntry = {
        id: window.crypto.randomUUID ? window.crypto.randomUUID() : Date.now().toString(),
        title: title.trim(),
        category,
        website: website.trim(),
        username: encryptedUser,
        password: encryptedPass,
        notes: encryptedNotes,
        updatedAt: new Date().toISOString()
      };
      setPasswordsVault([...passwordsVault, newEntry]);
    }
    setIsModalOpen(false);
  };

  // Delete entry
  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this credential?')) {
      const updated = passwordsVault.filter(e => e.id !== id);
      setPasswordsVault(updated);
      setSelectedEntry(null);
    }
  };

  // Copy to clipboard helper
  const copyToClipboard = (text, type = 'Text') => {
    navigator.clipboard.writeText(text);
    alert(`${type} copied to clipboard!`);
  };

  // Lock Vault
  const handleLockVault = () => {
    setUnlockedKey('');
    setSelectedEntry(null);
    setRevealPasswordId(null);
  };

  // Filtered credentials list
  const filteredEntries = useMemo(() => {
    return passwordsVault.filter(entry => {
      const matchesCategory = activeCategory === 'All' || entry.category === activeCategory;
      const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.website.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [passwordsVault, activeCategory, searchQuery]);

  // Setup / First Launch Lock View
  if (!masterPasswordHash) {
    return (
      <div className="pw-auth-container">
        <div className="pw-auth-card">
          <div className="pw-lock-icon">🔒</div>
          <h2>Set Vault Master Password</h2>
          <p className="pw-auth-subtitle">Configure a strong password to encrypt and secure your credentials locally on your device.</p>
          <form onSubmit={handleSetupMaster} className="pw-auth-form">
            <input
              type="password"
              placeholder="Choose Master Password"
              value={masterInput}
              onChange={e => setMasterInput(e.target.value)}
              className="mac-title-input"
              style={{ border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '10px' }}
              required
            />
            <input
              type="password"
              placeholder="Confirm Master Password"
              value={confirmInput}
              onChange={e => setConfirmInput(e.target.value)}
              className="mac-title-input"
              style={{ border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '15px' }}
              required
            />
            {errorMsg && <div className="pw-error">{errorMsg}</div>}
            <button type="submit" className="mac-btn-save" style={{ width: '100%' }}>Set Master Password</button>
          </form>
        </div>
      </div>
    );
  }

  // Vault Locked View
  if (!unlockedKey) {
    return (
      <div className="pw-auth-container">
        <div className="pw-auth-card">
          <div className="pw-lock-icon animate-pulse">🔒</div>
          <h2>Decrypter Key Required</h2>
          <p className="pw-auth-subtitle">Enter your master password to decrypt and open the credential vault.</p>
          <form onSubmit={handleUnlock} className="pw-auth-form">
            <input
              type="password"
              placeholder="Enter Master Password"
              value={masterInput}
              onChange={e => setMasterInput(e.target.value)}
              className="mac-title-input"
              style={{ border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '15px' }}
              required
              autoFocus
            />
            {errorMsg && <div className="pw-error">{errorMsg}</div>}
            <button type="submit" className="mac-btn-save" style={{ width: '100%' }}>Unlock Vault</button>
          </form>
        </div>
      </div>
    );
  }

  // Main Dashboard/Vault View
  return (
    <div className="pw-vault-container">
      {/* Premium Header */}
      <div className="timetable-actions" style={{ marginBottom: '20px' }}>
        <div className="premium-header-container" style={{ margin: 0 }}>
          <div className="premium-icon-wrapper" style={{ background: 'rgba(var(--primary-rgb), 0.15)', color: 'var(--primary)' }}>
            🔑
          </div>
          <div>
            <h1 className="premium-title">Key Ring Vault</h1>
            <p className="premium-subtitle">Manage, generate, and store salted-encrypted login credentials</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="mac-btn mac-btn-cancel" onClick={handleLockVault}>
            🔒 Lock Vault
          </button>
          <button className="mac-btn mac-btn-add" onClick={handleOpenAdd}>
            + Add Credential
          </button>
        </div>
      </div>

      <div className="pw-vault-layout">
        {/* Left Side: Categories */}
        <div className="pw-vault-sidebar">
          <div className="pw-sb-title">Categories</div>
          <button className={`pw-sb-item ${activeCategory === 'All' ? 'active' : ''}`} onClick={() => setActiveCategory('All')}>
            🌐 All Accounts
          </button>
          <button className={`pw-sb-item ${activeCategory === 'Login' ? 'active' : ''}`} onClick={() => setActiveCategory('Login')}>
            👤 Logins
          </button>
          <button className={`pw-sb-item ${activeCategory === 'Card' ? 'active' : ''}`} onClick={() => setActiveCategory('Card')}>
            💳 Credit Cards
          </button>
          <button className={`pw-sb-item ${activeCategory === 'Note' ? 'active' : ''}`} onClick={() => setActiveCategory('Note')}>
            📝 Secure Notes
          </button>
        </div>

        {/* Center: List of Credentials */}
        <div className="pw-vault-list-container">
          <div className="pw-search-wrapper">
            <input
              type="text"
              placeholder="Search credentials..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pw-search-input"
            />
          </div>

          <div className="pw-entries-list">
            {filteredEntries.map(entry => (
              <div
                key={entry.id}
                className={`pw-entry-card ${selectedEntry?.id === entry.id ? 'selected' : ''}`}
                onClick={() => setSelectedEntry(entry)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="pw-card-title">{entry.title}</div>
                  <div className={`pw-category-tag ${entry.category.toLowerCase()}`}>{entry.category}</div>
                </div>
                <div className="pw-card-user">{decryptText(entry.username, unlockedKey)}</div>
                {entry.website && <div className="pw-card-web">{entry.website}</div>}
              </div>
            ))}
            {filteredEntries.length === 0 && (
              <div className="pw-empty-state">No credentials found in this vault.</div>
            )}
          </div>
        </div>

        {/* Right Side: Credential Details */}
        <div className="pw-vault-details-container">
          {selectedEntry ? (
            <div className="pw-details-card">
              <div className="pw-details-header">
                <h2>{selectedEntry.title}</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="timetable-block-action-btn edit" onClick={() => handleOpenEdit(selectedEntry)}>✏️</button>
                  <button className="timetable-block-action-btn delete" onClick={() => handleDelete(selectedEntry.id)}>🗑️</button>
                </div>
              </div>

              <div className="pw-details-body">
                {selectedEntry.website && (
                  <div className="pw-detail-row">
                    <span className="pw-detail-label">Website</span>
                    <a href={selectedEntry.website.startsWith('http') ? selectedEntry.website : `https://${selectedEntry.website}`} target="_blank" rel="noopener noreferrer" className="pw-detail-val link">
                      {selectedEntry.website} ↗
                    </a>
                  </div>
                )}

                <div className="pw-detail-row">
                  <span className="pw-detail-label">Username</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className="pw-detail-val">{decryptText(selectedEntry.username, unlockedKey)}</span>
                    <button className="pw-copy-btn" onClick={() => copyToClipboard(decryptText(selectedEntry.username, unlockedKey), 'Username')}>📋</button>
                  </div>
                </div>

                <div className="pw-detail-row">
                  <span className="pw-detail-label">Password</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className="pw-detail-val" style={{ fontFamily: revealPasswordId === selectedEntry.id ? 'monospace' : 'password' }}>
                      {revealPasswordId === selectedEntry.id ? decryptText(selectedEntry.password, unlockedKey) : '••••••••••••••••'}
                    </span>
                    <button className="pw-copy-btn" onClick={() => setRevealPasswordId(revealPasswordId === selectedEntry.id ? null : selectedEntry.id)}>
                      {revealPasswordId === selectedEntry.id ? '👁️' : '🕶️'}
                    </button>
                    <button className="pw-copy-btn" onClick={() => copyToClipboard(decryptText(selectedEntry.password, unlockedKey), 'Password')}>📋</button>
                  </div>
                  {/* Strength Bar */}
                  <div style={{ marginTop: '8px' }}>
                    {(() => {
                      const analysis = analyzePassword(decryptText(selectedEntry.password, unlockedKey));
                      return (
                        <div>
                          <div className="pw-strength-bar-container">
                            <div className="pw-strength-bar" style={{ width: `${(analysis.score / 5) * 100}%`, backgroundColor: analysis.color }} />
                          </div>
                          <div style={{ fontSize: '0.75rem', marginTop: '4px', color: analysis.color, fontWeight: 700 }}>
                            {analysis.text}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {decryptText(selectedEntry.notes, unlockedKey) && (
                  <div className="pw-detail-row">
                    <span className="pw-detail-label">Notes</span>
                    <p className="pw-detail-notes">{decryptText(selectedEntry.notes, unlockedKey)}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="pw-details-empty">
              Select a credential from the list to view secure details, copy credentials, or run strength analyses.
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="timetable-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="timetable-modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSave} className="mac-modal-form">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>
                {editingEntry ? 'Edit Credential' : 'Add Credential'}
              </h2>

              <div className="mac-text-fields-group" style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  required
                  className="mac-title-input"
                  placeholder="Service / Title (e.g. Github)"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
                <input
                  type="text"
                  className="mac-url-input"
                  placeholder="Website URL (Optional)"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                />
              </div>

              <div className="mac-group">
                <div className="mac-group-list">
                  <div className="mac-row">
                    <span className="mac-row-label">Category</span>
                    <div className="mac-row-control">
                      <select className="mac-select" value={category} onChange={e => setCategory(e.target.value)}>
                        <option value="Login">Login</option>
                        <option value="Card">Credit Card</option>
                        <option value="Note">Secure Note</option>
                      </select>
                    </div>
                  </div>

                  <div className="mac-row">
                    <span className="mac-row-label">Username / Key</span>
                    <div className="mac-row-control" style={{ flex: 1, paddingLeft: '20px' }}>
                      <input
                        type="text"
                        required
                        className="mac-time-input"
                        style={{ border: 'none', background: 'transparent', textAlign: 'right', width: '100%', color: 'var(--text-main)', outline: 'none' }}
                        placeholder="Email or Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mac-row" style={{ height: 'auto', minHeight: '46px' }}>
                    <span className="mac-row-label">Password</span>
                    <div className="mac-row-control" style={{ flex: 1, paddingLeft: '20px', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <input
                        type="text"
                        required
                        className="mac-time-input"
                        style={{ border: 'none', background: 'transparent', textAlign: 'right', width: '100%', color: 'var(--text-main)', outline: 'none', fontFamily: 'monospace' }}
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                      />
                      {password && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: analyzePassword(password).color }}>
                          {analyzePassword(password).text}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Generator Section */}
              <div className="mac-group">
                <div className="mac-group-title">Strong Password Generator</div>
                <div className="mac-group-list" style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>Length: {genLength}</span>
                    <input type="range" min="8" max="32" value={genLength} onChange={e => setGenLength(Number(e.target.value))} style={{ cursor: 'pointer', accentColor: 'var(--primary)' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer', color: 'var(--text-main)' }}>
                      <input type="checkbox" checked={genUpper} onChange={e => setGenUpper(e.target.checked)} style={{ accentColor: 'var(--primary)' }} /> Uppercase
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer', color: 'var(--text-main)' }}>
                      <input type="checkbox" checked={genNumbers} onChange={e => setGenNumbers(e.target.checked)} style={{ accentColor: 'var(--primary)' }} /> Numbers
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer', color: 'var(--text-main)' }}>
                      <input type="checkbox" checked={genSymbols} onChange={e => setGenSymbols(e.target.checked)} style={{ accentColor: 'var(--primary)' }} /> Symbols
                    </label>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" className="mac-btn-cancel" style={{ flex: 1, padding: '4px 10px' }} onClick={generatePassword}>
                      🎲 Generate
                    </button>
                    {generatedPw && (
                      <button type="button" className="mac-btn-cancel" style={{ padding: '4px 10px' }} onClick={() => copyToClipboard(generatedPw, 'Generated Password')}>
                        📋 Copy
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mac-group">
                <div className="mac-group-title">Additional Info</div>
                <div className="mac-group-list">
                  <textarea
                    className="mac-notes-textarea"
                    placeholder="Secure Notes (e.g. backup recovery codes)"
                    rows={2}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    style={{ border: 'none' }}
                  />
                </div>
              </div>

              <div className="mac-footer-actions" style={{ margin: '20px -20px -20px', padding: '16px 20px' }}>
                <button type="button" className="mac-btn-cancel" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="mac-btn-save">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
