// Imports 
import React, { useState } from 'react';
import { useStore } from '../../store';

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z" />
    <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.902 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z" />
  </svg>
);

export default function ProfileSettings() {
  const profile = useStore(state => state.profile);
  const theme = useStore(state => state.theme);
  const toggleTheme = useStore(state => state.toggleTheme);
  const setProfile = useStore(state => state.setProfile);
  const logout = useStore(state => state.logout);
  const accentColor = useStore(state => state.accentColor);
  const setAccentColor = useStore(state => state.setAccentColor);
  const applyDesignPreset = useStore(state => state.applyDesignPreset);

  const [saveStatus, setSaveStatus] = useState('');


  const presets = [
    { name: 'Original', color: '#d48f48' },
    { name: 'Neon Blue', color: '#3b82f6' },
    { name: 'Emerald', color: '#10b981' },
    { name: 'Amethyst', color: '#8b5cf6' },
    { name: 'Crimson', color: '#ef4444' },
    { name: 'Amber', color: '#f59e0b' },
    { name: 'Sky', color: '#0ea5e9' },
    { name: 'Rose', color: '#f43f5e' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ [name]: value });
  };

  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large! Please select an image under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Content = reader.result;

      // Safety Check: localStorage has a ~5MB limit. 
      // We check the total size of everything in the store plus the new image.
      const currentData = localStorage.getItem('life_os_storage') || '';
      const estimatedTotalSize = currentData.length + base64Content.length;

      if (estimatedTotalSize > 4 * 1024 * 1024) { // 4MB safe limit
        alert("⚠️ STORAGE LIMIT REACHED: This image is too large or your database is too full. Please use a smaller image to ensure your data can be saved.");
        return;
      }

      setProfile({ [field]: base64Content });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    // With Zustand persist, it's auto-saved on every keystroke/upload. 
    // We keep the button just for user satisfaction/feedback.
    setSaveStatus('Saved successfully!');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const resetAllData = useStore(state => state.resetAllData);

  const handleReset = () => {
    if (window.confirm("⚠️ WARNING: This will permanently delete ALL your databases, skills, habits, and profile data from your computer. This action cannot be undone. Are you sure you want to proceed?")) {
      resetAllData();
      alert("System has been restored to factory defaults.");
    }
  };

  const handleExport = async () => {
    const state = useStore.getState();
    const dataStr = JSON.stringify(state, null, 2);

    if (window.electronAPI && window.electronAPI.saveBackup) {
      const success = await window.electronAPI.saveBackup(dataStr);
      if (success) alert('Backup saved successfully!');
    } else {
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `life_os_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = async (e) => {
    if (window.electronAPI && window.electronAPI.loadBackup) {
      const dataStr = await window.electronAPI.loadBackup();
      if (dataStr) {
        try {
          const data = JSON.parse(dataStr);
          if (data && data.profile) {
            useStore.setState(data);
            alert('Data imported successfully!');
          } else {
            alert('Invalid backup file structure!');
          }
        } catch (err) {
          alert('Error reading backup file!');
        }
      }
      return;
    }

    const file = e.target?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data && data.profile) {
          useStore.setState(data);
          alert('Data imported successfully!');
        } else {
          alert('Invalid backup file structure!');
        }
      } catch (err) {
        alert('Error reading backup file!');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = null;
  };

  const autoBackupPath = useStore(state => state.autoBackupPath);

  const handleSelectAutoBackupFolder = async () => {
    if (window.electronAPI && window.electronAPI.selectAutoBackupFolder) {
      const folderPath = await window.electronAPI.selectAutoBackupFolder();
      if (folderPath) {
        useStore.getState().setAutoBackupPath(folderPath);
        alert(`Auto-backup enabled for:\n${folderPath}\n\nThe app will now continuously save changes to EOM_AutoBackup.json in this folder.`);
      }
    } else {
      alert("Auto-backup folder selection is only available in the desktop app.");
    }
  };

  const handleDisableAutoBackup = () => {
    useStore.getState().setAutoBackupPath(null);
    alert("Auto-backup disabled.");
  };

  return (
    <div className="premium-container">
      <div className="premium-header-container">
        <div className="premium-icon-wrapper">
          <SettingsIcon />
        </div>
        <h1 className="premium-title">Profile Settings</h1>
        <p className="premium-subtitle">Manage your personal details and overarching objectives.</p>
      </div>

      <div className="premium-card" style={{ padding: '30px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>

          {/* Column 1: Personal Data */}
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '20px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              👤 Authentication Cache
            </h3>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                name="username"
                className="notion-input"
                value={profile.username}
                onChange={handleChange}
                placeholder="Enter display name..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Education</label>
              <select
                name="education"
                className="notion-input"
                value={profile.education || ''}
                onChange={handleChange}
              >
                <option value="" disabled>Select highest level...</option>
                <option value="High School / Matura">High School / Matura</option>
                <option value="Bachelor's Degree">Bachelor's Degree</option>
                <option value="Master's Degree">Master's Degree</option>
                <option value="Doctorate (PhD)">Doctorate (PhD)</option>
                <option value="Self-Taught / Other">Self-Taught / Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Vault Password</label>
              <input
                name="password"
                type="password"
                className="notion-input"
                value={profile.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Used for securing local data caches.
              </span>
            </div>

            <div className="form-group" style={{ marginTop: '20px' }}>
              <label className="form-label">Personalized Assets</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Profile Picture:</span>
                  <label className="notion-button secondary" style={{ margin: 0, padding: '4px 12px', fontSize: '0.75rem', cursor: 'pointer' }}>
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'profilePicture')}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Background Image:</span>
                  <label className="notion-button secondary" style={{ margin: 0, padding: '4px 12px', fontSize: '0.75rem', cursor: 'pointer' }}>
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'backgroundImage')}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cover Image (Overview):</span>
                  <label className="notion-button secondary" style={{ margin: 0, padding: '4px 12px', fontSize: '0.75rem', cursor: 'pointer' }}>
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'heroImage')}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Physical Metrics */}
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '20px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚖️ Physical Metrics & Demographics
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input
                  name="age"
                  type="number"
                  className="notion-input"
                  value={profile.age || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  className="notion-input"
                  value={profile.gender || 'Other'}
                  onChange={handleChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input
                  name="height"
                  type="number"
                  className="notion-input"
                  value={profile.height}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input
                  name="weight"
                  type="number"
                  step="0.1"
                  className="notion-input"
                  value={profile.weight}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label">Target Weight (kg)</label>
                <input
                  name="targetWeight"
                  type="number"
                  step="0.1"
                  className="notion-input"
                  value={profile.targetWeight || ''}
                  onChange={handleChange}
                  placeholder="Target..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Body Fat (%)</label>
                <input
                  name="bodyFat"
                  type="number"
                  step="0.1"
                  className="notion-input"
                  value={profile.bodyFat || ''}
                  onChange={handleChange}
                  placeholder="e.g. 15"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Activity Level</label>
              <select
                name="activityLevel"
                className="notion-input"
                value={profile.activityLevel || 'Moderate'}
                onChange={handleChange}
              >
                <option value="Sedentary">Sedentary (Office job)</option>
                <option value="Light">Lightly Active (1-2 days/week)</option>
                <option value="Moderate">Moderately Active (3-5 days/week)</option>
                <option value="VeryActive">Very Active (6-7 days/week)</option>
                <option value="Athlete">Extra Active (Professional athlete)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Primary Fitness Goal</label>
              <select
                name="fitnessGoal"
                className="notion-input"
                value={profile.fitnessGoal || 'Maintain'}
                onChange={handleChange}
              >
                <option value="Lose Weight">Weight Loss / Definition</option>
                <option value="Maintain">Maintenance / Functional</option>
                <option value="Build Muscle">Muscle Gain / Strength</option>
                <option value="Endurance">Endurance / Stamina</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', margin: '30px 0' }}></div>

        {/* Dynamic Color Customization Section */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '20px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🎨 Interface Aesthetics
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
            <div>
              <label className="form-label" style={{ marginBottom: '12px' }}>Accent Color Presets</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {presets.map(p => (
                  <button
                    key={p.color}
                    onClick={() => setAccentColor(p.color)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: p.color,
                      border: accentColor === p.color ? '3px solid #fff' : 'none',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    title={p.name}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="form-label" style={{ marginBottom: '12px' }}>Custom Color Picker</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  style={{ width: '40px', height: '40px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{accentColor.toUpperCase()}</span>
              </div>
            </div>
            <div>
              <label className="form-label" style={{ marginBottom: '12px' }}>System Currency Symbol</label>
              <select
                name="currencySymbol"
                value={profile.currencySymbol || '€'}
                onChange={handleChange}
                className="notion-input"
                style={{ height: '40px', padding: '0 15px', borderRadius: '8px', cursor: 'pointer' }}
              >
                <option value="€">EUR (€)</option>
                <option value="£">GBP (£)</option>
                <option value="$">USD / Dollar ($)</option>
                <option value="¥">Yen/Yuan (¥)</option>
              </select>
            </div>
            <div style={{ flexBasis: '100%', marginTop: '10px' }}>
              <button
                className={`notion-button ${useStore.getState().designSettings.enabled ? '' : 'secondary'}`}
                onClick={() => useStore.getState().setDesignSettings({ enabled: !useStore.getState().designSettings.enabled })}
                style={{
                  background: useStore.getState().designSettings.enabled ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                  color: useStore.getState().designSettings.enabled ? '#fff' : 'var(--text-main)',
                  border: useStore.getState().designSettings.enabled ? 'none' : '1px solid var(--border-color)',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                {useStore.getState().designSettings.enabled ? '✨ Design Mode: ON' : '🛠️ Enable Design Mode'}
              </button>
            </div>
          </div>

          {/* Advanced Design System Panel */}
          {useStore.getState().designSettings.enabled && (
            <div className="design-mode-panel" style={{
              marginTop: '25px',
              padding: '25px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              border: '1px solid var(--primary)',
              animation: 'fadeIn 0.4s ease-out'
            }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '20px' }}>
                Advanced Design System
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div className="design-setting-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    Glassmorphism Blur <span>{useStore.getState().designSettings.blur}px</span>
                  </label>
                  <input
                    type="range" min="0" max="25"
                    value={useStore.getState().designSettings.blur}
                    onChange={(e) => useStore.getState().setDesignSettings({ blur: parseInt(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                  />
                </div>
                <div className="design-setting-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    Corner Roundness <span>{useStore.getState().designSettings.radius}px</span>
                  </label>
                  <input
                    type="range" min="0" max="30"
                    value={useStore.getState().designSettings.radius}
                    onChange={(e) => useStore.getState().setDesignSettings({ radius: parseInt(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                  />
                </div>

                <div className="design-setting-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Active Typography</label>
                  <select
                    className="notion-input"
                    value={useStore.getState().designSettings.font}
                    onChange={(e) => useStore.getState().setDesignSettings({ font: e.target.value })}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="Inter">Inter (Classic)</option>
                    <option value="Outfit">Outfit (Modern)</option>
                    <option value="JetBrains Mono">JetBrains Mono (Technical)</option>
                    <option value="Roboto">Roboto (Clean)</option>
                  </select>
                </div>

                <div className="design-setting-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="checkbox"
                    id="neon-toggle"
                    checked={useStore.getState().designSettings.isNeon}
                    onChange={(e) => useStore.getState().setDesignSettings({ isNeon: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                  <label htmlFor="neon-toggle" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>Neon Glow Effects</label>
                </div>
                <div className="design-setting-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="checkbox"
                    id="compact-toggle"
                    checked={useStore.getState().designSettings.isCompact}
                    onChange={(e) => useStore.getState().setDesignSettings({ isCompact: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                  <label htmlFor="compact-toggle" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>Compact Mode Spacing</label>
                </div>

                <div className="design-setting-group" style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                  <label className="form-label" style={{ marginBottom: '15px' }}>Quick Design Presets</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <button
                      className="notion-button secondary"
                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      onClick={() => applyDesignPreset({ blur: 15, radius: 0, isNeon: true, isCompact: false, accent: '#ef4444', font: 'JetBrains Mono' })}
                    >
                      🚀 Cyberpunk
                    </button>
                    <button
                      className="notion-button secondary"
                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      onClick={() => applyDesignPreset({ blur: 0, radius: 4, isNeon: false, isCompact: true, accent: '#737373', font: 'Inter' })}
                    >
                      🔳 Minimalist
                    </button>
                    <button
                      className="notion-button secondary"
                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      onClick={() => applyDesignPreset({ blur: 25, radius: 25, isNeon: false, isCompact: false, accent: '#8b5cf6', font: 'Outfit' })}
                    >
                      💎 Ultra Glass
                    </button>
                    <button
                      className="notion-button secondary"
                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      onClick={() => applyDesignPreset({ blur: 10, radius: 12, isNeon: false, isCompact: false, accent: '#3b82f6', font: 'Roboto' })}
                    >
                      🖥️ Modern OS
                    </button>
                    <button
                      className="notion-button secondary"
                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      onClick={() => applyDesignPreset({ blur: 12, radius: 8, isNeon: true, isCompact: false, accent: '#10b981', font: 'JetBrains Mono' })}
                    >
                      🌿 Emerald Night
                    </button>
                    <button
                      className="notion-button secondary"
                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      onClick={() => applyDesignPreset({ blur: 5, radius: 20, isNeon: false, isCompact: false, accent: '#f59e0b', font: 'Roboto' })}
                    >
                      ☀️ Solarized
                    </button>
                    <button
                      className="notion-button secondary"
                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      onClick={() => applyDesignPreset({ blur: 20, radius: 4, isNeon: true, isCompact: false, accent: '#0ea5e9', font: 'Outfit' })}
                    >
                      🌌 Deep Space
                    </button>
                    <button
                      className="notion-button secondary"
                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      onClick={() => applyDesignPreset({ blur: 0, radius: 0, isNeon: false, isCompact: true, accent: '#ffffff', font: 'Inter' })}
                    >
                      🌑 Noir
                    </button>
                    <button
                      className="notion-button secondary"
                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      onClick={() => applyDesignPreset({ blur: 15, radius: 30, isNeon: true, isCompact: false, accent: '#f43f5e', font: 'Outfit' })}
                    >
                      🌸 Sakura
                    </button>
                    <button
                      className="notion-button secondary"
                      style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'rgba(var(--primary-rgb), 0.1)', border: '1px solid var(--primary)' }}
                      onClick={() => {
                        const fonts = ['Inter', 'Outfit', 'JetBrains Mono', 'Roboto'];
                        const colors = ['#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#0ea5e9', '#f43f5e'];
                        applyDesignPreset({
                          blur: Math.floor(Math.random() * 25),
                          radius: Math.floor(Math.random() * 30),
                          isNeon: Math.random() > 0.5,
                          isCompact: Math.random() > 0.7,
                          accent: colors[Math.floor(Math.random() * colors.length)],
                          font: fonts[Math.floor(Math.random() * fonts.length)]
                        });
                      }}
                    >
                      🎲 Randomize
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', margin: '30px 0' }}></div>

        {/* Full width: Goals */}
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '20px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🏔️ Life Objectives
          </h3>

          <div className="form-group">
            <label className="form-label">Overarching Goals (Context for Goal Planner)</label>
            <textarea
              name="goals"
              className="notion-textarea"
              value={profile.goals}
              onChange={handleChange}
              placeholder="List your ultimate goals here..."
              style={{ minHeight: '120px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button className="notion-button" onClick={handleSave}>
              Save Configuration
            </button>
            {saveStatus && <span style={{ color: 'var(--green-text)', fontSize: '0.85rem', fontWeight: 600 }}>✓ {saveStatus}</span>}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={toggleTheme}
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.8rem'
              }}>
              Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </button>
            <button
              onClick={logout}
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.8rem'
              }}>
              Log Out
            </button>
            <button
              onClick={() => {
                const confirmed = window.confirm("This will clear your local temporary cache to fix any display typos from old versions. Your main database will remain. Continue?");
                if (confirmed) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              style={{
                background: 'rgba(50,150,255,0.1)',
                color: 'var(--blue-text)',
                border: '1px solid var(--blue-text)',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.8rem'
              }}>
              Clear UI Cache
            </button>

            <button
              onClick={handleReset}

              style={{
                background: 'rgba(255,50,50,0.1)',
                color: 'var(--red-text)',
                border: '1px solid var(--red-text)',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.8rem'
              }}>
              Factory Reset
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '15px', gap: '10px' }}>
          <button
            onClick={handleExport}
            style={{
              background: 'rgba(50,200,100,0.1)',
              color: 'var(--green-text, #22c55e)',
              border: '1px solid var(--green-text, #22c55e)',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.8rem'
            }}>
            📥 Export Backup
          </button>
          {window.electronAPI ? (
            <button
              onClick={handleImport}
              style={{
                background: 'rgba(50,200,100,0.1)',
                color: 'var(--green-text, #22c55e)',
                border: '1px solid var(--green-text, #22c55e)',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.8rem',
                margin: 0
              }}>
              📤 Import Backup
            </button>
          ) : (
            <label
              style={{
                background: 'rgba(50,200,100,0.1)',
                color: 'var(--green-text, #22c55e)',
                border: '1px solid var(--green-text, #22c55e)',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.8rem',
                margin: 0
              }}>
              📤 Import Backup
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                style={{ display: 'none' }}
              />
            </label>
          )}
        </div>

        {/* Auto-Backup Directory Section */}
        <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>🔄 Live Auto-Backup Directory</h4>
            <span style={{ fontSize: '0.75rem', color: autoBackupPath ? 'var(--green-text)' : 'var(--text-muted)' }}>
              {autoBackupPath ? 'Active' : 'Disabled'}
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '15px', lineHeight: '1.4' }}>
            Choose a folder (e.g., Desktop or Dropbox) where the app will continuously write a live backup file (`EOM_AutoBackup.json`) whenever you make changes.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleSelectAutoBackupFolder}
              className="notion-button secondary"
              style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4H2.19zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139C1.72 3.042 1.95 3 2.19 3h5.396l-.707-.707z" /></svg>
              Choose Folder
            </button>

            {autoBackupPath && (
              <>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '4px', fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-main)', border: '1px solid rgba(255,255,255,0.05)', wordBreak: 'break-all', flex: 1, minWidth: '200px' }}>
                  {autoBackupPath}
                </div>
                <button
                  onClick={handleDisableAutoBackup}
                  className="notion-button secondary"
                  style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'var(--red-text)', borderColor: 'var(--red-text)', background: 'transparent' }}
                >
                  Disable
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
