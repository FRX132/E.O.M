import React, { useState } from 'react';
import { useStore } from '../store';
import MediaModal from './MediaModal';

const PILL_COLORS = {
  'Reading': 'blue',
  'Finished': 'green',
  'Want to Read': 'purple'
};

export default function BookList() {
  const books = useStore(state => state.books) || [];
  const setBooks = useStore(state => state.setBooks);

  const [activeTab, setActiveTab] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const openAddModal = () => {
    setEditingBook(null);
    setIsModalOpen(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setIsModalOpen(true);
  };

  const handleSaveBook = (data) => {
    if (editingBook) {
      setBooks(books.map(b => b.id === editingBook.id ? { ...b, ...data } : b));
    } else {
      const newId = Date.now();
      setBooks([...books, {
        id: newId,
        ...data
      }]);
    }
    setEditingBook(null);
  };

  const deleteBook = (e, id) => {
    e.stopPropagation();
    if (confirm('Bist du sicher, dass du dieses Buch löschen möchtest?')) {
      setBooks(books.filter(b => b.id !== id));
    }
  };

  const filteredBooks = activeTab === 'All'
    ? books
    : books.filter(b => b.status === activeTab);

  return (
    <div className="notion-block" style={{ minHeight: '80vh' }}>
      <div className="notion-tabs">
        <div className="tab-group">
          {['All', 'Reading', 'Finished', 'Want to Read'].map(tab => (
            <button
              key={tab}
              className={`tab-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
          <button style={{ marginLeft: 'auto', background: 'var(--blue-bg)', color: 'var(--blue-text)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }} onClick={openAddModal}>
            New Book +
          </button>
        </div>
      </div>

      <div className="card-content" style={{ padding: '0 20px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '30px', marginTop: '20px' }}>
          
          {filteredBooks.map((book) => (
            <div 
              key={book.id} 
              className="media-card"
              onClick={() => openEditModal(book)}
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
              <div style={{ width: '100%', aspectRatio: '2/3', backgroundImage: `url(${book.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '4px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{book.subtitle}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`pill ${PILL_COLORS[book.status] || 'blue'}`} style={{ fontSize: '0.65rem' }}>{book.status}</span>
                  <div style={{ color: 'var(--primary)', fontSize: '0.8rem' }}>
                    {'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}
                  </div>
                </div>
              </div>
              <button 
                onClick={(e) => deleteBook(e, book.id)}
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
            <span>Add Book</span>
          </div>

        </div>
      </div>

      <MediaModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingBook(null);
        }} 
        onSave={handleSaveBook}
        initialData={editingBook}
        type="Book"
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
  );
}
