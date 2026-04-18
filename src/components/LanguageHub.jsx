import React, { useState } from 'react';
import { useStore } from '../store';
import LanguageModal from './LanguageModal';

export default function LanguageHub() {
  const languages = useStore(state => state.languages) || [];
  const setLanguages = useStore(state => state.setLanguages);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLang, setEditingLang] = useState(null);

  const openAddModal = () => {
    setEditingLang(null);
    setIsModalOpen(true);
  };

  const openEditModal = (lang) => {
    setEditingLang(lang);
    setIsModalOpen(true);
  };

  const handleSaveLanguage = (data) => {
    if (editingLang) {
      setLanguages(languages.map(l => l.id === editingLang.id ? { ...l, ...data } : l));
    } else {
      const newId = Date.now();
      setLanguages([...languages, {
        id: newId,
        ...data
      }]);
    }
    setEditingLang(null);
  };

  const deleteLanguage = (e, id) => {
    e.stopPropagation();
    if (confirm('Bist du sicher, dass du diese Sprache entfernen möchtest?')) {
      setLanguages(languages.filter(l => l.id !== id));
    }
  };

  return (
    <div className="notion-block" style={{ minHeight: '80vh' }}>
      <div className="notion-tabs">
        <div className="tab-group" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <div className="tab-item active">All Languages</div>
          <button 
            style={{ 
              marginLeft: 'auto', 
              background: 'var(--blue-bg)', 
              color: 'var(--blue-text)', 
              padding: '6px 16px', 
              borderRadius: '6px', 
              fontSize: '0.85rem', 
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer'
            }} 
            onClick={openAddModal}
          >
            New Language +
          </button>
        </div>
      </div>

      <div className="card-content" style={{ padding: '0 20px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px', marginTop: '20px' }}>
          
          {languages.map((lang) => (
            <div 
              key={lang.id} 
              className="media-card"
              onClick={() => openEditModal(lang)}
              style={{
                background: 'var(--bg-card)',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid var(--border-light)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Cover Image */}
              <div style={{ 
                width: '100%', 
                height: '180px', 
                backgroundImage: `url(${lang.img})`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(4px)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  {lang.level}
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.1)' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${lang.progress}%`, 
                  background: 'var(--primary)',
                  boxShadow: '0 0 10px var(--primary)',
                  transition: 'width 0.5s ease'
                }}></div>
              </div>

              {/* Content */}
              <div style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '6px', fontWeight: 700 }}>{lang.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', minHeight: '40px' }}>
                  {lang.notes || 'No notes added yet.'}
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="pill blue" style={{ fontSize: '0.7rem' }}>{lang.progress}% Mastered</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Added {lang.dateAdded}
                  </div>
                </div>
              </div>

              {/* Delete Button */}
              <button 
                onClick={(e) => deleteLanguage(e, lang.id)}
                style={{ 
                  position: 'absolute', 
                  top: '12px', 
                  right: '12px', 
                  background: 'rgba(255,0,0,0.2)', 
                  border: '1px solid rgba(255,255,255,0.2)', 
                  color: '#fff', 
                  borderRadius: '50%', 
                  width: '28px', 
                  height: '28px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer', 
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  backdropFilter: 'blur(4px)'
                }}
                className="delete-btn"
              >✕</button>
            </div>
          ))}

          {/* Add Placeholder */}
          <div
            onClick={openAddModal}
            style={{
              borderRadius: '16px',
              border: '2px dashed var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '300px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: 'rgba(255,255,255,0.02)'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
          >
            <div style={{ fontSize: '3rem', marginBottom: '15px', color: 'var(--primary)', opacity: 0.6 }}>+</div>
            <span style={{ fontWeight: 600 }}>Start New Language</span>
          </div>

        </div>
      </div>

      <LanguageModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingLang(null);
        }} 
        onSave={handleSaveLanguage}
        initialData={editingLang}
      />

      <style>{`
        .media-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.4);
          border-color: var(--primary) !important;
        }
        .media-card:hover .delete-btn {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
