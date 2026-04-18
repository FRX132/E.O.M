import React, { useState } from 'react';
import { useStore } from '../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Cell } from 'recharts';

const PILL_COLORS = {
  'Utilities': 'blue',
  'Development': 'blue',
  'Home': 'orange',
  'Investment': 'orange',
  'Food': 'yellow',
  'Personal': 'yellow',
  'Investments': 'orange',
  'Health': 'green',
  'Transport': 'purple',
  'Entertainment': 'pink'
};

const ASSET_TYPES = ['Bank', 'Cash', 'Stock', 'Crypto', 'Investment', 'Other'];

export default function ExpenseTracker() {
  const expenses = useStore(state => state.expenses);
  const assets = useStore(state => state.assets);
  const financeSettings = useStore(state => state.financeSettings);
  
  const setExpenses = useStore(state => state.setExpenses);
  const setAssets = useStore(state => state.setAssets);
  const setFinanceSettings = useStore(state => state.setFinanceSettings);

  const [activeTab, setActiveTab] = useState('This month');
  const [viewMode, setViewMode] = useState('expenses'); // 'expenses' or 'wallet'
  const [newCatName, setNewCatName] = useState('');
  const [isCatEditorOpen, setIsCatEditorOpen] = useState(false);

  // --- Logic ---

  const addRow = () => {
    const newEntry = {
      id: Date.now(),
      name: 'New expense',
      amount: 0.00,
      category: financeSettings.categories[0] || 'Uncategorized',
      account: 'Personal',
      date: new Date().toISOString().split('T')[0], // Use ISO for easier parsing
      dueDate: '' // For bills
    };
    setExpenses([...expenses, newEntry]);
  };

  const deleteRow = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const updateRow = (id, field, value) => {
    setExpenses(expenses.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const deleteAsset = (id) => setAssets(assets.filter(a => a.id !== id));

  const updateAsset = (id, field, value) => {
    setAssets(assets.map(a => {
      if (a.id === id) {
        const updated = { ...a, [field]: value };
        // Auto-calculate change if amount is updated
        if (field === 'amount') {
          const initial = a.initialAmount !== undefined ? a.initialAmount : a.amount;
          const diff = value - initial;
          updated.change = initial !== 0 ? (diff / initial) * 100 : 0;
          if (a.initialAmount === undefined) updated.initialAmount = a.amount; // Store first legacy baseline
        }
        return updated;
      }
      return a;
    }));
  };

  const addAsset = () => {
    const newAsset = { id: Date.now(), name: 'New Asset', type: 'Bank', amount: 0.00, initialAmount: 0.00, change: 0 };
    setAssets([...assets, newAsset]);
  };

  const addCategory = () => {
    if (newCatName && !financeSettings.categories.includes(newCatName)) {
      setFinanceSettings({ categories: [...financeSettings.categories, newCatName] });
      setNewCatName('');
    }
  };

  const removeCategory = (cat) => {
    setFinanceSettings({ categories: financeSettings.categories.filter(c => c !== cat) });
  };

  // --- Chart Data Logic ---
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map(m => ({ name: m, amount: 0 }));
    
    expenses.forEach(exp => {
      const d = new Date(exp.date);
      if (!isNaN(d)) {
        const monthIdx = d.getMonth();
        data[monthIdx].amount += (exp.amount || 0);
      }
    });
    return data;
  };

  const monthlyTotals = getMonthlyData();
  const currentMonthTotal = monthlyTotals[new Date().getMonth()].amount;
  const budgetProgress = Math.min(100, (currentMonthTotal / financeSettings.monthlyBudget) * 100);
  const totalWealth = assets.reduce((sum, a) => sum + (a.amount || 0), 0);

  // --- Filter Logic ---
  const filteredExpenses = expenses.filter(exp => {
    if (activeTab === 'All') return true;
    const expDate = new Date(exp.date);
    const now = new Date();
    if (activeTab === 'Today') return expDate.toDateString() === now.toDateString();
    if (activeTab === 'This week') {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return expDate >= weekAgo;
    }
    if (activeTab === 'This month') return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    return true;
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '100px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px', fontWeight: 800 }}>Finance Hub</h1>
        <p style={{ color: 'var(--text-muted)' }}>Advanced Capital & Resource Management</p>
      </div>

      {/* --- Top Stats & Charts --- */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        {/* Budget Progress */}
        <div className="notion-block" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Monthly Budget</h3>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: budgetProgress > 90 ? 'var(--red-text)' : 'var(--blue-text)' }}>
              €{currentMonthTotal.toLocaleString()} / €{financeSettings.monthlyBudget.toLocaleString()}
            </span>
          </div>
          <div style={{ height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ 
              width: `${budgetProgress}%`, 
              height: '100%', 
              background: budgetProgress > 90 ? 'var(--red-text)' : 'var(--primary)',
              boxShadow: `0 0 15px ${budgetProgress > 90 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(var(--primary-rgb), 0.4)'}`,
              transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
          </div>
          <div style={{ marginTop: '15px', color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>{Math.round(budgetProgress)}% Consumed</span>
            <button 
              onClick={() => {
                const val = prompt('Set Monthly Budget (€):', financeSettings.monthlyBudget);
                if (val) setFinanceSettings({ monthlyBudget: parseInt(val) });
              }}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
            >
              Adjust Limit
            </button>
          </div>
        </div>

        {/* Yearly Bar Chart */}
        <div className="notion-block" style={{ padding: '20px', height: '200px' }}>
           <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTotals}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <ReTooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ background: 'rgba(15,15,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--primary)' }}
              />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {monthlyTotals.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === new Date().getMonth() ? 'var(--primary)' : 'rgba(255,255,255,0.1)'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="notion-block" style={{ marginBottom: '20px' }}>
        <div className="notion-tabs" style={{ paddingBottom: '10px' }}>
          <button className={`notion-tab ${viewMode === 'expenses' ? 'active' : ''}`} onClick={() => setViewMode('expenses')}>
            💸 Expenses & Bills
          </button>
          <button className={`notion-tab ${viewMode === 'wallet' ? 'active' : ''}`} onClick={() => setViewMode('wallet')}>
            💳 Assets & Net Worth
          </button>
          <button 
            className={`notion-tab ${isCatEditorOpen ? 'active' : ''}`} 
            onClick={() => setIsCatEditorOpen(!isCatEditorOpen)}
            style={{ marginLeft: 'auto', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '4px 15px' }}
          >
            ⚙️ Categories
          </button>
        </div>
      </div>

      {isCatEditorOpen && (
        <div className="notion-block scale-in" style={{ padding: '20px', marginBottom: '20px', background: 'rgba(var(--primary-rgb), 0.05)', border: '1px dashed var(--primary)' }}>
          <h4 style={{ margin: '0 0 15px 0' }}>Manage Expense Categories</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
            {financeSettings.categories.map(cat => (
              <span key={cat} className={`pill ${PILL_COLORS[cat] || 'blue'}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '8px' }}>
                {cat}
                <button 
                  onClick={() => removeCategory(cat)} 
                  style={{ background: 'none', border: 'none', color: 'inherit', fontWeight: 800, cursor: 'pointer', padding: '0 4px', opacity: 0.5 }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              className="notion-input" 
              placeholder="New category name..." 
              value={newCatName} 
              onChange={e => setNewCatName(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && addCategory()}
              style={{ maxWidth: '250px' }}
            />
            <button className="notion-button" onClick={addCategory} style={{ padding: '8px 20px' }}>Add Category</button>
          </div>
        </div>
      )}

      {viewMode === 'expenses' ? (
        <div className="notion-block">
          <div className="notion-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>💸 Ledger</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{filteredExpenses.length} entries</span>
          </div>

          <div className="notion-tabs">
            {['Today', 'This week', 'This month', 'All'].map(tab => (
              <button key={tab} className={`notion-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
            ))}
            <button style={{ marginLeft: 'auto', background: 'var(--primary)', color: '#fff', padding: '4px 16px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700 }} onClick={addRow}>
              + Add Transaction
            </button>
          </div>

          <div style={{ overflowX: 'auto', padding: '0 20px 20px' }}>
            <table className="notion-table" style={{ minWidth: '800px' }}>
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>Aa Description</th>
                  <th style={{ width: '12%' }}># Amount</th>
                  <th style={{ width: '15%' }}>◘ Category</th>
                  <th style={{ width: '10%' }}>● Account</th>
                  <th style={{ width: '15%' }}>📅 Trans. Date</th>
                  <th style={{ width: '15%' }}>🔔 Billing Date</th>
                  <th style={{ width: '8%' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
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
                          style={{ background: 'transparent', border: 'none', color: 'inherit', width: '100%', outline: 'none', fontWeight: 600 }}
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
                        {financeSettings.categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td>
                      <input
                        value={expense.account}
                        onChange={(e) => updateRow(expense.id, 'account', e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'inherit', width: '100%', outline: 'none', fontSize: '0.85rem' }}
                      />
                    </td>
                    <td>
                       <input
                        type="date"
                        value={expense.date}
                        onChange={(e) => updateRow(expense.id, 'date', e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', outline: 'none' }}
                      />
                    </td>
                    <td>
                       <input
                        type="date"
                        value={expense.dueDate || ''}
                        onChange={(e) => updateRow(expense.id, 'dueDate', e.target.value)}
                        style={{ 
                          background: expense.dueDate ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent', 
                          border: 'none', 
                          color: expense.dueDate ? 'var(--primary)' : 'var(--text-muted)', 
                          fontSize: '0.8rem', 
                          outline: 'none',
                          borderRadius: '4px',
                          padding: '2px 5px'
                        }}
                      />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => deleteRow(expense.id)} style={{ color: 'var(--red-text)', opacity: 0.5, fontSize: '1.2rem', padding: '0 5px' }}>×</button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan="7">
                    <button onClick={addRow} style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '15px 10px', width: '100%', textAlign: 'left' }}>
                      + New transaction entry
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
              <span>💳 Capital Assets</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>Total: €{totalWealth.toLocaleString()}</span>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                {ASSET_TYPES.map(type => {
                  const items = assets.filter(a => a.type === type);
                  const typeTotal = items.reduce((sum, a) => sum + (a.amount || 0), 0);
                  
                  return (
                    <div key={type} className="asset-stat-card" style={{ background: 'var(--bg-card-alt)', padding: '20px', borderRadius: '15px', border: '1px solid var(--border-color)', position: 'relative' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{type} Balance</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '5px' }}>€{typeTotal.toLocaleString()}</div>
                      <div style={{ position: 'absolute', top: '15px', right: '15px', opacity: 0.2, fontSize: '1.5rem' }}>
                        {type === 'Bank' ? '🏛️' : type === 'Cash' ? '💵' : type === 'Stock' ? '📈' : type === 'Crypto' ? '🪙' : type === 'Investment' ? '🏦' : '📦'}
                      </div>
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
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ color: 'var(--text-muted)', marginRight: '4px' }}>€</span>
                          <input
                            type="number"
                            value={asset.amount}
                            onChange={(e) => updateAsset(asset.id, 'amount', parseFloat(e.target.value) || 0)}
                            style={{ background: 'transparent', border: 'none', color: 'inherit', maxWidth: '100px', outline: 'none', fontWeight: 600 }}
                          />
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ 
                            color: asset.change >= 0 ? 'var(--green-text)' : 'var(--red-text)', 
                            fontWeight: 800,
                            fontSize: '0.9rem'
                          }}>
                            {asset.change >= 0 ? '+' : ''}{asset.change?.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <button onClick={() => deleteAsset(asset.id)} style={{ color: 'var(--red-text)', opacity: 0.5, fontSize: '1.2rem' }}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={addAsset} style={{ color: 'var(--primary)', fontSize: '0.85rem', padding: '20px 0', width: '100%', textAlign: 'left', borderTop: '1px solid var(--border-color)', marginTop: '10px', fontWeight: 600 }}>
                + Register New Capital Asset
              </button>
            </div>
          </div>
      )}
    </div>
  );
}
