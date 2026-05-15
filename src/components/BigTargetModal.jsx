import React, { useState, useEffect } from 'react';
// Styling
import './Styles/GoalModal.css';

export default function BigTargetModal({ isOpen, onClose, onSave, initialData }) {
  const [targetData, setTargetData] = useState({
    title: '',
    category: 'Work',
    img: ''
  });

  useEffect(() => {
    if (initialData) {
      setTargetData({
        title: initialData.title || '',
        category: initialData.category || 'Work',
        img: initialData.img || ''
      });
    } else {
      setTargetData({ title: '', category: 'Work', img: '' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!targetData.title) return;

    // Generate default image if none provided
    const finalImg = targetData.img || `https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop&q=${Date.now()}`;

    onSave({
      title: targetData.title,
      category: targetData.category,
      img: finalImg,
      date: initialData?.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      status: initialData?.status || 'Not started'
    });

    setTargetData({ title: '', category: 'Work', img: '' });
    onClose();
  };

  return (
    <div className="mac-modal-overlay" onClick={onClose}>
      <div className="mac-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mac-modal-header">
          <span>{initialData ? '✍️' : '🚀'}</span> {initialData ? 'Edit Big Target' : 'New Big Target'}
        </div>

        <div className="mac-modal-content">
          <div className="mac-section-title">General Info</div>
          <div className="mac-input-group">
            <div className="mac-row" style={{ minHeight: '60px' }}>
              <input
                className="mac-input"
                style={{ fontWeight: 600, fontSize: '17px' }}
                placeholder="Target Title"
                value={targetData.title}
                onChange={(e) => setTargetData({ ...targetData, title: e.target.value })}
                autoFocus
              />
            </div>
            <div className="mac-row">
              <span className="mac-row-label">Category</span>
              <select
                className="mac-select"
                value={targetData.category}
                onChange={(e) => setTargetData({ ...targetData, category: e.target.value })}
              >
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Financial">Financial</option>
              </select>
            </div>
          </div>

          <div className="mac-section-title">Appearance</div>
          <div className="mac-input-group">
            <div className="mac-row">
              <input
                className="mac-input"
                placeholder="Image URL (Unsplash recommended)"
                value={targetData.img}
                onChange={(e) => setTargetData({ ...targetData, img: e.target.value })}
              />
            </div>
          </div>
          <p style={{ margin: '0 20px 20px', fontSize: '11px', color: 'var(--text-muted)' }}>
            Tip: Leave blank to use a default high-quality background.
          </p>
        </div>

        <div className="mac-modal-footer">
          <button className="mac-btn mac-btn-cancel" onClick={onClose}>Abbrechen</button>
          <button
            className="mac-btn mac-btn-add"
            onClick={handleSave}
            disabled={!targetData.title}
          >
            {initialData ? 'Speichern' : 'Hinzufügen'}
          </button>
        </div>
      </div>
    </div>
  );
}
