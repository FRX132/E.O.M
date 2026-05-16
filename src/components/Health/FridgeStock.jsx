import React, { useState } from 'react';
import { useStore } from '../../store';

const CATEGORIES = ['Dairy & Eggs', 'Fruits', 'Vegetables', 'Meat', 'Snacks', 'Bakery', 'Beverages'];
const STATUSES = ['In stock', 'Not in stock'];

const FridgeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
    <path d="M4 11h2v-1H4v1zm0-3h2V7H4v1zm0-3h2V4H4v1z" />
    <path d="M2.5 0A1.5 1.5 0 0 0 1 1.5v13A1.5 1.5 0 0 0 2.5 16h11a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 13.5 0h-11zM14 1.5v4.5H2v-4.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 .5.5zm0 5.5v7.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V7h12z" />
  </svg>
);

const PILL_COLORS = {
  'In stock': 'green',
  'Not in stock': 'red',
  'Dairy & Eggs': 'blue',
  'Fruits': 'orange',
  'Vegetables': 'green',
  'Meat': 'red',
  'Snacks': 'purple',
  'Bakery': 'yellow',
  'Beverages': 'blue'
};



export default function FridgeStock() {
  const food = useStore(state => state.fridge);
  const setFood = useStore(state => state.setFridge);

  const [activeTab, setActiveTab] = useState('All');

  const addRow = () => {
    const newEntry = {
      id: Date.now(),
      name: 'New item',
      status: 'Not in stock',
      category: 'Snacks',
      cal: 0,
      price: 0
    };
    setFood([...food, newEntry]);
  };

  const updateRow = (id, field, value) => {
    setFood(food.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const deleteRow = (id) => {
    setFood(food.filter(f => f.id !== id));
  };

  const tabs = ['All', 'Dairy & Eggs', 'Fruits', 'Vegetables', 'Meat', '5 more...'];
  const filteredFood = activeTab === 'All' || activeTab.includes('more') ? food : food.filter(f => f.category === activeTab);

  return (
    <div className="premium-container">
      <div className="premium-header-container">
        <div className="premium-icon-wrapper">
          <FridgeIcon />
        </div>
        <h1 className="premium-title">Fridge Stock</h1>
        <p className="premium-subtitle">Track what you have and what's running out.<br />Avoid waste and shop smarter.</p>
      </div>

      <div className="notion-block">
        <div className="notion-header">
          🍏 Food storage
        </div>

        <div className="notion-tabs" style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
          {tabs.map(tab => (
            <button
              key={tab}
              className={`notion-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
          <button style={{ marginLeft: 'auto', background: 'var(--blue-bg)', color: 'var(--blue-text)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }} onClick={addRow}>
            New +
          </button>
        </div>

        <div style={{ overflowX: 'auto', padding: '0 20px 20px' }}>
          <table className="notion-table">
            <thead>
              <tr>
                <th>Aa Name</th>
                <th>Status</th>
                <th>◘ Category</th>
                <th>123 Calories (x1)</th>
                <th># Price</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredFood.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input
                      value={item.name}
                      onChange={(e) => updateRow(item.id, 'name', e.target.value)}
                      style={{ background: 'transparent', border: 'none', color: 'inherit', width: '100%', outline: 'none' }}
                    />
                  </td>
                  <td>
                    <select
                      value={item.status}
                      onChange={(e) => updateRow(item.id, 'status', e.target.value)}
                      className={`pill ${PILL_COLORS[item.status]}`}
                      style={{ border: 'none', appearance: 'none', outline: 'none', fontWeight: 600 }}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <select
                      value={item.category}
                      onChange={(e) => updateRow(item.id, 'category', e.target.value)}
                      className={`pill ${PILL_COLORS[item.category] || 'yellow'}`}
                      style={{ border: 'none', appearance: 'none', outline: 'none' }}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.cal}
                      onChange={(e) => updateRow(item.id, 'cal', parseFloat(e.target.value) || 0)}
                      style={{ background: 'transparent', border: 'none', color: 'inherit', maxWidth: '60px', outline: 'none', marginLeft: '4px' }}
                      step="0.1"
                    />
                  </td>
                  <td>
                    €<input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateRow(item.id, 'price', parseFloat(e.target.value) || 0)}
                      style={{ background: 'transparent', border: 'none', color: 'inherit', maxWidth: '60px', outline: 'none', marginLeft: '4px' }}
                      step="0.01"
                    />
                  </td>
                  <td>
                    <button onClick={() => deleteRow(item.id)} style={{ color: 'var(--red-text)', opacity: 0.5, fontSize: '1.2rem' }}>✕</button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="6">
                  <button onClick={addRow} style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '10px 0', width: '100%', textAlign: 'left' }}>
                    + New page
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
