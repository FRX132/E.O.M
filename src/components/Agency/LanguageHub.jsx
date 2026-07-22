import React, { useState } from 'react';
import { useStore } from '../../store';
import LanguageModal from './LanguageModal';

const LanguageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
    <path d="M4.545 6.714 4.11 8H3l1.862-5h1.284L8 8H6.833l-.435-1.286H4.545zm1.634-.736L5.5 3.956h-.049l-.679 2.022h1.407z" />
    <path d="M0 2a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-3H2a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2zm7.138 9.995c.193.301.402.583.63.846-.748.575-1.673 1.001-2.768 1.292.178.217.451.635.555.867 1.125-.359 2.08-.844 2.886-1.494.777.665 1.739 1.165 2.93 1.472.133-.254.414-.673.629-.89-1.125-.253-2.057-.694-2.82-1.284.681-.747 1.222-1.651 1.621-2.757H14V8h-3v1.047h.765c-.318.844-.74 1.546-1.272 2.13a6.066 6.066 0 0 1-.415-.492 1.988 1.988 0 0 1-.94.31z" />
  </svg>
);

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
    <div className="premium-container">
      <div className="premium-header-container">
        <div className="premium-icon-wrapper">
          <LanguageIcon />
        </div>
        <h1 className="premium-title">Language Hub</h1>
        <p className="premium-subtitle">Track your language learning progress and mastery.</p>
      </div>

      <div className="notion-block" style={{ minHeight: '60vh' }}>
        <div className="notion-tabs">
          <div className="notion-tab active">All Languages</div>
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
              cursor: 'pointer',
              alignSelf: 'center',
              marginBottom: '8px'
            }}
            onClick={openAddModal}
          >
            New Language +
          </button>
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
    </div>
  );
}
