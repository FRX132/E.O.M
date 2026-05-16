import React, { useState } from 'react';
import { useStore } from '../store';
import MediaModal from './MediaModal';
import './Styles/BookList.css';

const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
    <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.156 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.596 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z" />
  </svg>
);

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
    <div className="premium-container">
      <div className="premium-header-container">
        <div className="premium-icon-wrapper">
          <BookIcon />
        </div>
        <h1 className="premium-title">Reading Library</h1>
        <p className="premium-subtitle">Track your reading progress and catalog your library.</p>
      </div>

      <div className="notion-block book-list-notion-block">
        <div className="notion-tabs book-list-tabs">
          <div className="tab-group book-list-tab-group">
            {['All', 'Reading', 'Finished', 'Want to Read'].map(tab => (
              <button
                key={tab}
                className={`tab-item ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
            <button
              className="book-list-new-btn" onClick={openAddModal}>
              New Book +
            </button>
          </div>
        </div>

        <div className="card-content book-list-card-content">
          <div className="book-list-grid">

            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="media-card"
                onClick={() => openEditModal(book)}
              >
                <div className="media-card-cover" style={{ backgroundImage: `url(${book.img})` }}></div>
                <div className="media-card-info">
                  <h3 className="media-card-title">{book.title}</h3>
                  <p className="media-card-subtitle">{book.subtitle}</p>

                  <div className="media-card-footer">
                    <span className={`pill media-card-pill ${PILL_COLORS[book.status] || 'blue'}`}>{book.status}</span>
                    <div className="media-card-rating">
                      {'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => deleteBook(e, book.id)}
                  className="delete-btn"
                >✕</button>
              </div>
            ))}

            <div
              onClick={openAddModal}
              className="add-book-card"
            >
              <span className="add-book-icon">+</span>
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
      </div>
    </div >
  );
}
