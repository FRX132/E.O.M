import React, { useState } from 'react';
import { useStore } from '../store';
import MediaModal from './MediaModal';

const MovieIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
    <path d="M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1zm4 0v6h8V1H4zm8 8H4v6h8V9zM1 1v2h2V1H1zm2 3H1v2h2V4zM1 7v2h2V7H1zm2 3H1v2h2v-2zm-2 3v2h2v-2H1zM15 1h-2v2h2V1zm-2 3v2h2V4h-2zm2 3h-2v2h2V7zm-2 3v2h2v-2h-2zm2 3h-2v2h2v-2z"/>
  </svg>
);

const PILL_COLORS = {
  'Watching': 'blue',
  'Watched': 'green',
  'Watchlist': 'orange'
};

export default function MovieList() {
  const movies = useStore(state => state.movies) || [];
  const setMovies = useStore(state => state.setMovies);

  const [activeTab, setActiveTab] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);






  const openAddModal = () => {
    setEditingMovie(null);
    setIsModalOpen(true);
  };

  const openEditModal = (movie) => {
    setEditingMovie(movie);
    setIsModalOpen(true);
  };

  const handleSaveMovie = (data) => {
    if (editingMovie) {
      setMovies(movies.map(m => m.id === editingMovie.id ? { ...m, ...data } : m));
    } else {
      const newId = Date.now();
      setMovies([...movies, {
        id: newId,
        ...data
      }]);
    }
    setEditingMovie(null);
  };

  const deleteMovie = (e, id) => {
    e.stopPropagation();
    if (confirm('Bist du sicher, dass du diesen Film/Serie löschen möchtest?')) {
      setMovies(movies.filter(m => m.id !== id));
    }
  };

  const filteredMovies = activeTab === 'All'
    ? movies
    : movies.filter(m => m.status === activeTab);

  return (
    <div className="premium-container">
      <div className="premium-header-container">
        <div className="premium-icon-wrapper">
          <MovieIcon />
        </div>
        <h1 className="premium-title">Cinema & Shows</h1>
        <p className="premium-subtitle">Track what you watch and what's on your watchlist.</p>
      </div>

      <div className="notion-block" style={{ minHeight: '60vh' }}>
      <div className="notion-tabs">
        <div className="tab-group">
          {['All', 'Watching', 'Watched', 'Watchlist'].map(tab => (
            <button
              key={tab}
              className={`tab-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
          <button style={{ marginLeft: 'auto', background: 'var(--blue-bg)', color: 'var(--blue-text)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }} onClick={openAddModal}>
            New Movie +
          </button>
        </div>
      </div>

      <div className="card-content" style={{ padding: '0 20px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '30px', marginTop: '20px' }}>

          {filteredMovies.map((movie) => (
            <div
              key={movie.id}
              className="media-card"
              onClick={() => openEditModal(movie)}
              style={{
                background: 'var(--bg-main)',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                border: '1px solid var(--border-light)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                position: 'relative'
              }}
            >
              <div style={{ width: '100%', aspectRatio: '2/3', backgroundImage: `url(${movie.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '4px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{movie.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{movie.subtitle}</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`pill ${PILL_COLORS[movie.status] || 'blue'}`} style={{ fontSize: '0.65rem' }}>{movie.status}</span>
                  <div style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>
                    {'★'.repeat(movie.rating)}{'☆'.repeat(5 - movie.rating)}
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => deleteMovie(e, movie.id)}
                style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifySelf: 'center', cursor: 'pointer', opacity: 0 }}
                className="delete-btn"
              >✕</button>
            </div>
          ))}

          <div
            onClick={openAddModal}
            style={{
              borderRadius: '12px',
              border: '1px dashed var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              aspectRatio: '2/3',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <span style={{ fontSize: '2rem', marginBottom: '10px' }}>+</span>
            <span>Add Movie</span>
          </div>

        </div>
      </div>

      <MediaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMovie(null);
        }}
        onSave={handleSaveMovie}
        initialData={editingMovie}
        type="Movie"
      />

      <style>{`
        .media-card:hover {
          transform: translateY(-5px);
        }
        .media-card:hover .delete-btn {
          opacity: 1 !important;
        }
      `}</style>
    </div>
    </div>
  );
}
