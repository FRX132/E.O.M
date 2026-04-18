import React, { useState } from 'react';
import { useStore } from '../store';

const CATEGORIES = ['Utilities', 'Development', 'Home', 'Investment', 'Food'];
const ACCOUNTS = ['Personal', 'Development', 'Investments'];

const PILL_COLORS = {
  'Utilities': 'blue',
  'Development': 'blue',
  'Home': 'orange',
  'Investment': 'orange',
  'Food': 'yellow',
  'Personal': 'yellow',
  'Investments': 'orange'
};


const ASSET_TYPES = ['Cash', 'Stock', 'Crypto', 'Investment', 'Other'];

export default function ExpenseTracker() {
  const expenses = useStore(state => state.expenses);
  const assets = useStore(state => state.assets);
  const setExpenses = useStore(state => state.setExpenses);
  const setAssets = useStore(state => state.setAssets);

  const [activeTab, setActiveTab] = useState('This month');
  const [viewMode, setViewMode] = useState('expenses'); // 'expenses' or 'wallet'

  const addRow = () => {
    const newEntry = {
      id: Date.now(),
      name: 'New expense',
      amount: 0.00,
      category: 'Food',
      account: 'Personal',
      date: new Date().toLocaleString()
    };
    setExpenses([...expenses, newEntry]);
  };

  const deleteRow = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const updateRow = (id, field, value) => {
    setExpenses(expenses.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const addAsset = () => {
    const newAsset = {
      id: Date.now(),
      name: 'New Asset',
      type: 'Cash',
      amount: 0.00,
      change: 0
    };
    setAssets([...assets, newAsset]);
  };

  const deleteAsset = (id) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  const updateAsset = (id, field, value) => {
    setAssets(assets.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const totalWealth = assets.reduce((sum, a) => sum + (a.amount || 0), 0);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Expense Tracker</h1>
        <p style={{ color: 'var(--text-muted)' }}>Track spending without manual effort.<br />See where your money goes.</p>
      </div>

      <div className="notion-block" style={{ marginBottom: '20px' }}>
        <div className="notion-tabs" style={{ paddingBottom: '10px' }}>
          <button
            className={`notion-tab ${viewMode === 'expenses' ? 'active' : ''}`}
            onClick={() => setViewMode('expenses')}
          >
            💸 Expenses
          </button>
          <button
            className={`notion-tab ${viewMode === 'wallet' ? 'active' : ''}`}
            onClick={() => setViewMode('wallet')}
          >
            💳 Wallet & Assets
          </button>
        </div>
      </div>

      {viewMode === 'expenses' ? (
        <div className="notion-block">
          <div className="notion-header">
            💸 Expenses
          </div>

          <div className="notion-tabs">
            {['Today', 'This week', 'This month', 'All'].map(tab => (
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
            <table className="notion-table" style={{ minWidth: '600px' }}>
              <thead>
                <tr>
                  <th style={{ width: '35%' }}>Aa Description</th>
                  <th style={{ width: '15%' }}># Amount</th>
                  <th style={{ width: '15%' }}>◘ Category</th>
                  <th style={{ width: '15%' }}>● Account</th>
                  <th style={{ width: '15%' }}>🕐 Created time</th>
                  <th style={{ width: '5%' }}></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>
                      <input
                        value={expense.name}
                        onChange={(e) => updateRow(expense.id, 'name', e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'inherit', width: '100%', outline: 'none' }}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)', marginRight: '4px' }}>€</span>
                        <input
                          type="number"
                          value={expense.amount}
                          onChange={(e) => updateRow(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                          style={{ background: 'transparent', border: 'none', color: 'inherit', width: '100%', outline: 'none' }}
                        />
                      </div>
                    </td>
                    <td>
                      <select
                        value={expense.category}
                        onChange={(e) => updateRow(expense.id, 'category', e.target.value)}
                        className={`pill ${PILL_COLORS[expense.category]}`}
                        style={{ border: 'none', appearance: 'none', outline: 'none', width: '100%' }}
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td>
                      <select
                        value={expense.account}
                        onChange={(e) => updateRow(expense.id, 'account', e.target.value)}
                        className={`pill ${PILL_COLORS[expense.account]}`}
                        style={{ border: 'none', appearance: 'none', outline: 'none', width: '100%' }}
                      >
                        {ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{expense.date}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => deleteRow(expense.id)} style={{ color: 'var(--red-text)', opacity: 0.5, fontSize: '1.2rem', padding: '0 5px' }}>×</button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan="6">
                    <button onClick={addRow} style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '10px 10px', width: '100%', textAlign: 'left' }}>
                      + New page
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
          <div className="notion-block scale-in">
            <div className="notion-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>💳 Assets & Resources</span>
              <span style={{ fontSize: '1.1rem', color: 'var(--blue-text)' }}>Total: €{totalWealth.toLocaleString()}</span>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                {['Cash', 'Stock', 'Crypto'].map(type => {
                  const typeTotal = assets.filter(a => a.type === type).reduce((sum, a) => sum + a.amount, 0);
                  return (
                    <div key={type} className="asset-stat-card" style={{ background: 'var(--bg-card-alt)', padding: '15px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{type}</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)' }}>€{typeTotal.toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>

              <table className="notion-table">
                <thead>
                  <tr>
                    <th>Aa Asset Name</th>
                    <th>◘ Type</th>
                    <th># Value</th>
                    <th>% Change</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.id}>
                      <td>
                        <input
                          value={asset.name}
                          onChange={(e) => updateAsset(asset.id, 'name', e.target.value)}
                          style={{ background: 'transparent', border: 'none', color: 'inherit', width: '100%', outline: 'none' }}
                        />
                      </td>
                      <td>
                        <select
                          value={asset.type}
                          onChange={(e) => updateAsset(asset.id, 'type', e.target.value)}
                          className={`pill blue`}
                          style={{ border: 'none', appearance: 'none', outline: 'none' }}
                        >
                          {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                      <td>
                        €<input
                          type="number"
                          value={asset.amount}
                          onChange={(e) => updateAsset(asset.id, 'amount', parseFloat(e.target.value) || 0)}
                          style={{ background: 'transparent', border: 'none', color: 'inherit', maxWidth: '100px', outline: 'none', marginLeft: '4px' }}
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input
                            type="number"
                            step="0.1"
                            value={asset.change}
                            onChange={(e) => updateAsset(asset.id, 'change', parseFloat(e.target.value) || 0)}
                            style={{ background: 'transparent', border: 'none', color: asset.change >= 0 ? 'var(--green-text)' : 'var(--red-text)', maxWidth: '50px', outline: 'none' }}
                          />
                          <span style={{ fontSize: '0.8rem', color: asset.change >= 0 ? 'var(--green-text)' : 'var(--red-text)' }}>%</span>
                        </div>
                      </td>
                      <td>
                        <button onClick={() => deleteAsset(asset.id)} style={{ color: 'var(--red-text)', opacity: 0.5, fontSize: '1.2rem' }}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={addAsset} style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '15px 0', width: '100%', textAlign: 'left', borderTop: '1px solid var(--border-color)', marginTop: '10px' }}>
                + Add new asset
              </button>
            </div>
          </div>
      )}
        </div>
      );
}
