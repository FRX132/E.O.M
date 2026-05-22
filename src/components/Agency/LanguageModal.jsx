import React, { useState } from 'react';
import '../Styles/GoalModal.css';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function LanguageModal({ isOpen, onClose, onSave, initialData }) {
  const [langData, setLangData] = useState(() => ({
    name: initialData?.name || '',
    level: initialData?.level || 'A1',
    progress: initialData?.progress || 0,
    img: initialData?.img || '',
    notes: initialData?.notes || ''
  }));

  // If the initialData changes while the component is mounted (e.g. switching between items), 
  // you should ideally handle this via key prop in the parent. 
  // But for safety, we handle it here by checking if the name changed.
  const [prevName, setPrevName] = useState(initialData?.name);
  if (initialData?.name !== prevName) {
    setLangData({
      name: initialData?.name || '',
      level: initialData?.level || 'A1',
      progress: initialData?.progress || 0,
      img: initialData?.img || '',
      notes: initialData?.notes || ''
    });
    setPrevName(initialData?.name);
  }

  if (!isOpen) return null;

  const handleSave = () => {
    if (!langData.name) return;
    
    const defaultImg = `https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=600&fit=crop&q=80`;
    const finalImg = langData.img || defaultImg;
    
    onSave({
      ...langData,
      img: finalImg,
      dateAdded: initialData?.dateAdded || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    });
    
    onClose();
  };

  return (
    <div className="mac-modal-overlay" onClick={onClose}>
      <div className="mac-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mac-modal-header">
          <span>🌍</span> {initialData ? 'Edit Language' : 'New Language'}
        </div>

        <div className="mac-modal-content">
          <div className="mac-section-title">Common</div>
          <div className="mac-input-group">
            <div className="mac-row" style={{ minHeight: '60px' }}>
              <input 
                className="mac-input" 
                style={{ fontWeight: 600, fontSize: '17px' }}
                placeholder="Language Name (e.g. Japanese)" 
                value={langData.name}
                onChange={(e) => setLangData({ ...langData, name: e.target.value })}
                autoFocus
              />
            </div>
            <div className="mac-row">
              <span className="mac-row-label">Current Level</span>
              <select 
                className="mac-select"
                value={langData.level}
                onChange={(e) => setLangData({ ...langData, level: e.target.value })}
              >
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="mac-row">
              <span className="mac-row-label">Progress ({langData.progress}%)</span>
              <input 
                type="range"
                min="0"
                max="100"
                value={langData.progress}
                onChange={(e) => setLangData({ ...langData, progress: parseInt(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
            </div>
          </div>

          <div className="mac-section-title">Aesthetics & Notes</div>
          <div className="mac-input-group">
            <div className="mac-row">
              <span className="mac-row-label">Image URL</span>
              <input 
                className="mac-input" 
                placeholder="Flag or scenery image URL..." 
                value={langData.img}
                onChange={(e) => setLangData({ ...langData, img: e.target.value })}
              />
            </div>
            <div className="mac-row" style={{ minHeight: '80px' }}>
              <textarea 
                className="mac-input" 
                placeholder="Learning goals, resources, etc." 
                value={langData.notes}
                onChange={(e) => setLangData({ ...langData, notes: e.target.value })}
                style={{ height: '60px', padding: '10px 0', resize: 'none' }}
              />
            </div>
          </div>
        </div>

        <div className="mac-modal-footer">
          <button className="mac-btn mac-btn-cancel" onClick={onClose}>Cancel</button>
          <button 
            className="mac-btn mac-btn-add" 
            onClick={handleSave}
            disabled={!langData.name}
          >
            {initialData ? 'Save' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
