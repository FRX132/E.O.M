import React, { useState, useEffect } from 'react';
import MarkdownViewer from '../Functions/MarkdownViewer';
// Styling
import '../Styles/GoalModal.css';

export default function BigTargetModal({ isOpen, onClose, onSave, initialData }) {
  const [targetData, setTargetData] = useState({
    title: '',
    notes: '',
    category: 'Work',
    img: ''
  });

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (initialData) {
      setTargetData({
        title: initialData.title || '',
        notes: initialData.notes || '',
        category: initialData.category || 'Work',
        img: initialData.img || ''
      });
    } else {
      setTargetData({ title: '', notes: '', category: 'Work', img: '' });
    }
  }, [initialData, isOpen]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!isOpen) return null;

  const handleSave = () => {
    if (!targetData.title) return;

    // Generate default image if none provided
    const finalImg = targetData.img || `https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop&q=${Date.now()}`;

    onSave({
      title: targetData.title,
      notes: targetData.notes,
      category: targetData.category,
      img: finalImg,
      date: initialData?.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      status: initialData?.status || 'Not started'
    });

    setTargetData({ title: '', notes: '', category: 'Work', img: '' });
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
            <div className="mac-row" style={{ minHeight: '60px' }}>
              <textarea 
                className="mac-input" 
                placeholder="Notes / Description" 
                style={{ resize: 'none', height: '100%', paddingTop: '8px' }}
                value={targetData.notes}
                onChange={(e) => setTargetData({ ...targetData, notes: e.target.value })}
              />
            </div>
            {targetData.notes && (
              <div style={{ padding: '12px 16px', background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', maxHeight: '180px', overflowY: 'auto' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Preview</div>
                <MarkdownViewer content={targetData.notes} />
              </div>
            )}
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
          <button className="mac-btn mac-btn-cancel" onClick={onClose}>Cancel</button>
          <button
            className="mac-btn mac-btn-add"
            onClick={handleSave}
            disabled={!targetData.title}
          >
            {initialData ? 'Save' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
