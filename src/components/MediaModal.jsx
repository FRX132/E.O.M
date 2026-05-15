import React, { useState, useEffect } from 'react';
import './Styles/GoalModal.css';

export default function MediaModal({ isOpen, onClose, onSave, initialData, type = 'Book' }) {
  const [mediaData, setMediaData] = useState({
    title: '',
    subtitle: '', // Author for books, Genre for movies
    status: type === 'Book' ? 'Reading' : 'Watchlist',
    rating: 0,
    img: ''
  });

  useEffect(() => {
    if (initialData) {
      setMediaData({
        title: initialData.title || '',
        subtitle: initialData.subtitle || '',
        status: initialData.status || (type === 'Book' ? 'Reading' : 'Watchlist'),
        rating: initialData.rating || 0,
        img: initialData.img || ''
      });
    } else {
      setMediaData({
        title: '',
        subtitle: '',
        status: type === 'Book' ? 'Reading' : 'Watchlist',
        rating: 0,
        img: ''
      });
    }
  }, [initialData, isOpen, type]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!mediaData.title) return;
    
    // Generate default image if none provided
    const defaultImg = type === 'Book' 
      ? `https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop&q=80`
      : `https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop&q=80`;
    
    const finalImg = mediaData.img || defaultImg;
    
    onSave({
      ...mediaData,
      img: finalImg,
      dateAdded: initialData?.dateAdded || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    });
    
    onClose();
  };

  const statusOptions = type === 'Book' 
    ? ['Reading', 'Finished', 'Want to Read'] 
    : ['Watched', 'Watchlist', 'Watching'];

  return (
    <div className="mac-modal-overlay" onClick={onClose}>
      <div className="mac-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mac-modal-header">
          <span>{type === 'Book' ? '📚' : '🎬'}</span> {initialData ? `Edit ${type}` : `New ${type}`}
        </div>

        <div className="mac-modal-content">
          <div className="mac-section-title">Details</div>
          <div className="mac-input-group">
            <div className="mac-row" style={{ minHeight: '60px' }}>
              <input 
                className="mac-input" 
                style={{ fontWeight: 600, fontSize: '17px' }}
                placeholder={`${type} Title`} 
                value={mediaData.title}
                onChange={(e) => setMediaData({ ...mediaData, title: e.target.value })}
                autoFocus
              />
            </div>
            <div className="mac-row">
              <span className="mac-row-label">{type === 'Book' ? 'Author' : 'Genre'}</span>
              <input 
                className="mac-input" 
                placeholder={type === 'Book' ? 'e.g. James Clear' : 'e.g. Sci-Fi'} 
                value={mediaData.subtitle}
                onChange={(e) => setMediaData({ ...mediaData, subtitle: e.target.value })}
              />
            </div>
            <div className="mac-row">
              <span className="mac-row-label">Status</span>
              <select 
                className="mac-select"
                value={mediaData.status}
                onChange={(e) => setMediaData({ ...mediaData, status: e.target.value })}
              >
                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          <div className="mac-section-title">Rating & Cover</div>
          <div className="mac-input-group">
            <div className="mac-row">
              <span className="mac-row-label">Rating</span>
              <div style={{ display: 'flex', gap: '5px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <span 
                    key={star} 
                    onClick={() => setMediaData({ ...mediaData, rating: star })}
                    style={{ cursor: 'pointer', fontSize: '1.2rem', color: star <= mediaData.rating ? 'var(--primary)' : 'var(--text-muted)' }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <div className="mac-row">
              <span className="mac-row-label">Image URL</span>
              <input 
                className="mac-input" 
                placeholder="Paste URL here..." 
                value={mediaData.img}
                onChange={(e) => setMediaData({ ...mediaData, img: e.target.value })}
              />
            </div>
          </div>
          <p style={{ margin: '0 20px 20px', fontSize: '11px', color: 'var(--text-muted)' }}>
            Tip: Use high-quality vertical images for best look.
          </p>
        </div>

        <div className="mac-modal-footer">
          <button className="mac-btn mac-btn-cancel" onClick={onClose}>Abbrechen</button>
          <button 
            className="mac-btn mac-btn-add" 
            onClick={handleSave}
            disabled={!mediaData.title}
          >
            {initialData ? 'Speichern' : 'Hinzufügen'}
          </button>
        </div>
      </div>
    </div>
  );
}
