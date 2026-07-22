import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Cell } from 'recharts';

const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
    <path d="M12.136.326A1.5 1.5 0 0 1 14 1.78V3h.5A1.5 1.5 0 0 1 16 4.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 13.5v-9a1.5 1.5 0 0 1 1.432-1.499L12.136.326zM5.562 3H13V1.78a.5.5 0 0 0-.621-.484L5.562 3zM1.5 4a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-13z" />
  </svg>
);

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
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const expenses = useStore(state => state.expenses);
  const assets = useStore(state => state.assets);
  const financeSettings = useStore(state => state.financeSettings);
  const profile = useStore(state => state.profile || {});
  const currency = profile.currencySymbol || '€';

  const setExpenses = useStore(state => state.setExpenses);
  const setAssets = useStore(state => state.setAssets);
  const setFinanceSettings = useStore(state => state.setFinanceSettings);

  const [activeTab, setActiveTab] = useState('This month');
  const [viewMode, setViewMode] = useState('expenses'); // 'expenses' or 'wallet'
  const [newCatName, setNewCatName] = useState('');
  const [isCatEditorOpen, setIsCatEditorOpen] = useState(false);

  const [editingLimit, setEditingLimit] = useState(null);
  const [tempLimit, setTempLimit] = useState('');

  // --- Logic ---

  const addRow = () => {
    const newEntry = {
      id: Date.now(),
      name: 'New expense',
      amount: 0.00,
      category: financeSettings.categories[0] || 'Uncategorized',
      account: 'Personal',
      date: new Date().toISOString().split('T')[0], // Use ISO for easier parsing
      dueDate: '', // For bills
      recurrence: 'None'
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
  const monthlyTotals = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map(m => ({ name: m, amount: 0 }));

    (expenses || []).forEach(exp => {
      const d = new Date(exp.date);
      if (!isNaN(d)) {
        const monthIdx = d.getMonth();
        data[monthIdx].amount += (exp.amount || 0);
      }
    });
    return data;
  }, [expenses]);

  const currentMonthTotal = useMemo(() => {
    return monthlyTotals[new Date().getMonth()].amount;
  }, [monthlyTotals]);

  const limits = useMemo(() => {
    return financeSettings.limits || { daily: 50, weekly: 350, monthly: 2000, yearly: 24000 };
  }, [financeSettings.limits]);

  const budgetProgressMonthly = useMemo(() => {
    return Math.min(100, (currentMonthTotal / limits.monthly) * 100);
  }, [currentMonthTotal, limits.monthly]);

  const totalWealth = useMemo(() => {
    return (assets || []).reduce((sum, a) => sum + (a.amount || 0), 0);
  }, [assets]);

  // --- Filter Logic ---
  const filteredExpenses = useMemo(() => {
    return (expenses || []).filter(exp => {
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
  }, [expenses, activeTab]);

  return (
    <div className="premium-container">
      <div className="premium-header-container">
        <div className="premium-icon-wrapper">
          <WalletIcon />
        </div>
        <h1 className="premium-title">Finance Hub</h1>
        <p className="premium-subtitle">Advanced Capital & Resource Management</p>
      </div>

      {/* --- Top Stats & Charts --- */}
      <div className="finance-stats-grid" style={{ marginBottom: '30px' }}>
        {/* Budget Progress limits */}
        <div className="premium-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Adjustable Limits</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tap value to adjust</span>
          </div>

          <div className="finance-limits-grid">
            {['Daily', 'Weekly', 'Monthly', 'Yearly'].map(timeframe => {
              const limit = limits[timeframe.toLowerCase()];
              // To be accurate, let's just display the limits as configurable inputs.
              return (
                <div key={timeframe} style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>{timeframe} Limit</div>
                  {editingLimit === timeframe ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.2rem', marginRight: '4px' }}>{currency}</span>
                      <input
                        type="number"
                        autoFocus
                        value={tempLimit}
                        onChange={e => setTempLimit(e.target.value)}
                        onBlur={() => {
                          const val = parseInt(tempLimit);
                          if (!isNaN(val)) {
                            setFinanceSettings({
                              ...financeSettings,
                              limits: { ...limits, [timeframe.toLowerCase()]: val }
                            });
                          }
                          setEditingLimit(null);
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') e.target.blur();
                          if (e.key === 'Escape') setEditingLimit(null);
                        }}
                        style={{
                          background: 'rgba(0,0,0,0.2)',
                          border: '1px solid var(--primary)',
                          color: 'var(--primary)',
                          fontSize: '1.1rem',
                          fontWeight: 800,
                          width: '100%',
                          borderRadius: '6px',
                          outline: 'none',
                          padding: '2px 8px'
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', cursor: 'pointer', display: 'inline-block' }}
                      onClick={() => {
                        setEditingLimit(timeframe);
                        setTempLimit(limit);
                      }}
                      title="Click to edit limit"
                    >
                      {currency}{limit.toLocaleString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px' }}>
              <span>Monthly Budget Progress</span>
              <span style={{ color: budgetProgressMonthly > 90 ? 'var(--red-text)' : 'inherit' }}>
                {currency}{currentMonthTotal.toLocaleString()} / {currency}{limits.monthly.toLocaleString()}
              </span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{
                width: `${budgetProgressMonthly}%`,
                height: '100%',
                background: budgetProgressMonthly > 90 ? 'var(--red-text)' : 'var(--primary)',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
        </div>

        {/* Yearly Bar Chart */}
        <div className="notion-block" style={{ padding: '20px', height: '200px', minHeight: '200px', minWidth: 0 }}>
          {isMounted && (
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
          )}
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
        <div className="notion-block" style={{ minWidth: 0 }}>
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

          {/* Desktop Table View */}
          <div className="notion-table-wrapper desktop-only-table" style={{ overflowX: 'auto', padding: '0 20px 20px', minWidth: 0 }}>
            <table className="notion-table" style={{ minWidth: '1000px' }}>
              <thead>
                <tr>
                  <th style={{ width: '22%' }}>Aa Description</th>
                  <th style={{ width: '12%' }}># Amount</th>
                  <th style={{ width: '15%' }}>◘ Category</th>
                  <th style={{ width: '10%' }}>● Account</th>
                  <th style={{ width: '12%' }}>📅 Trans. Date</th>
                  <th style={{ width: '12%' }}>↻ Recurrence</th>
                  <th style={{ width: '12%' }}>🔔 Billing Date</th>
                  <th style={{ width: '5%' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <ExpenseRow
                    key={`${expense.id}-${expense.name}-${expense.amount}-${expense.account}-${expense.category}-${expense.date}-${expense.recurrence}-${expense.dueDate}`}
                    expense={expense}
                    categories={financeSettings.categories}
                    currency={currency}
                    updateRow={updateRow}
                    deleteRow={deleteRow}
                  />
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

          {/* Mobile Cards View */}
          <div className="finance-mobile-cards mobile-only-cards">
            {filteredExpenses.map((expense) => (
              <MobileExpenseCard
                key={`mob-${expense.id}-${expense.name}-${expense.amount}-${expense.account}-${expense.category}-${expense.date}-${expense.recurrence}-${expense.dueDate}`}
                expense={expense}
                categories={financeSettings.categories}
                currency={currency}
                updateRow={updateRow}
                deleteRow={deleteRow}
              />
            ))}
            <button className="mobile-add-btn" onClick={addRow}>
              + Add Transaction
            </button>
          </div>
        </div>
      ) : (
        <div className="notion-block scale-in">
          <div className="notion-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>💳 Capital Assets</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>Total: {currency}{totalWealth.toLocaleString()}</span>
          </div>

          <div style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              {ASSET_TYPES.map(type => {
                const items = assets.filter(a => a.type === type);
                const typeTotal = items.reduce((sum, a) => sum + (a.amount || 0), 0);

                return (
                  <div key={type} className="premium-card">
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{type} Balance</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '5px' }}>{currency}{typeTotal.toLocaleString()}</div>
                    <div style={{ position: 'absolute', top: '15px', right: '15px', opacity: 0.2, fontSize: '1.5rem' }}>
                      {type === 'Bank' ? '🏛️' : type === 'Cash' ? '💵' : type === 'Stock' ? '📈' : type === 'Crypto' ? '🪙' : type === 'Investment' ? '🏦' : '📦'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="notion-table-wrapper desktop-only-table" style={{ overflowX: 'auto', minWidth: 0, marginBottom: '10px' }}>
              <table className="notion-table" style={{ minWidth: '600px' }}>
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
                    <AssetRow
                      key={`${asset.id}-${asset.name}-${asset.amount}-${asset.type}`}
                      asset={asset}
                      types={ASSET_TYPES}
                      currency={currency}
                      updateAsset={updateAsset}
                      deleteAsset={deleteAsset}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="finance-mobile-cards mobile-only-cards">
              {assets.map((asset) => (
                <MobileAssetCard
                  key={`mob-asset-${asset.id}-${asset.name}-${asset.amount}-${asset.type}`}
                  asset={asset}
                  types={ASSET_TYPES}
                  currency={currency}
                  updateAsset={updateAsset}
                  deleteAsset={deleteAsset}
                />
              ))}
            </div>

            <button onClick={addAsset} style={{ color: 'var(--primary)', fontSize: '0.85rem', padding: '20px 0', width: '100%', textAlign: 'left', borderTop: '1px solid var(--border-color)', marginTop: '10px', fontWeight: 600 }}>
              + Register New Capital Asset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Memoized Child Components to Eliminate Mobile WebView Typing Lag ──

const ExpenseRow = React.memo(({ expense, categories, currency, updateRow, deleteRow }) => {
  const [name, setName] = useState(expense.name);
  const [amount, setAmount] = useState(expense.amount);
  const [account, setAccount] = useState(expense.account);

  const handleBlur = (field, value) => {
    if (expense[field] !== value) {
      updateRow(expense.id, field, value);
    }
  };

  return (
    <tr>
      <td>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => handleBlur('name', name)}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          style={{ background: 'transparent', border: 'none', color: 'inherit', width: '100%', outline: 'none' }}
        />
      </td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)', marginRight: '4px' }}>{currency}</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={() => handleBlur('amount', parseFloat(amount) || 0)}
            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
            style={{ background: 'transparent', border: 'none', color: 'inherit', width: '80px', outline: 'none', fontWeight: 600 }}
          />
        </div>
      </td>
      <td>
        <select
          value={expense.category}
          onChange={(e) => updateRow(expense.id, 'category', e.target.value)}
          className={`pill ${PILL_COLORS[expense.category] || 'blue'}`}
          style={{ border: 'none', appearance: 'none', outline: 'none', width: '100%' }}
        >
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </td>
      <td>
        <input
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          onBlur={() => handleBlur('account', account)}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
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
        <select
          value={expense.recurrence || 'None'}
          onChange={(e) => updateRow(expense.id, 'recurrence', e.target.value)}
          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-main)', fontSize: '0.8rem', outline: 'none', borderRadius: '4px', padding: '2px 5px' }}
        >
          <option value="None">None</option>
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
          <option value="Yearly">Yearly</option>
        </select>
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
  );
});

// Add display names for debugging
ExpenseRow.displayName = 'ExpenseRow';

const AssetRow = React.memo(({ asset, types, currency, updateAsset, deleteAsset }) => {
  const [name, setName] = useState(asset.name);
  const [amount, setAmount] = useState(asset.amount);

  const handleBlur = (field, value) => {
    if (asset[field] !== value) {
      updateAsset(asset.id, field, value);
    }
  };

  return (
    <tr>
      <td>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => handleBlur('name', name)}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
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
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)', marginRight: '4px' }}>{currency}</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={() => handleBlur('amount', parseFloat(amount) || 0)}
            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
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
  );
});

AssetRow.displayName = 'AssetRow';

const MobileExpenseCard = React.memo(({ expense, categories, currency, updateRow, deleteRow }) => {
  const [name, setName] = useState(expense.name);
  const [amount, setAmount] = useState(expense.amount);
  const [account, setAccount] = useState(expense.account);

  const handleBlur = (field, value) => {
    if (expense[field] !== value) {
      updateRow(expense.id, field, value);
    }
  };

  return (
    <div className="finance-mobile-card">
      <div className="mobile-card-row primary-row">
        <input
          className="mobile-card-title-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => handleBlur('name', name)}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          placeholder="Expense title..."
        />
        <div className="mobile-card-amount">
          <span style={{ color: 'var(--text-muted)', marginRight: '2px' }}>{currency}</span>
          <input
            type="number"
            className="mobile-card-amount-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={() => handleBlur('amount', parseFloat(amount) || 0)}
            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          />
        </div>
      </div>

      <div className="mobile-card-row tags-row">
        <select
          value={expense.category}
          onChange={(e) => updateRow(expense.id, 'category', e.target.value)}
          className={`pill ${PILL_COLORS[expense.category] || 'blue'} mobile-select`}
        >
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          className="mobile-account-input"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          onBlur={() => handleBlur('account', account)}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          placeholder="Account..."
        />
        <select
          value={expense.recurrence || 'None'}
          onChange={(e) => updateRow(expense.id, 'recurrence', e.target.value)}
          className="mobile-recurrence-select"
        >
          <option value="None">Once</option>
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
          <option value="Yearly">Yearly</option>
        </select>
      </div>

      <div className="mobile-card-row footer-row">
        <div className="mobile-date-field">
          <span className="mobile-date-label">Trans:</span>
          <input
            type="date"
            value={expense.date}
            onChange={(e) => updateRow(expense.id, 'date', e.target.value)}
          />
        </div>
        <div className="mobile-date-field">
          <span className="mobile-date-label">Due:</span>
          <input
            type="date"
            value={expense.dueDate || ''}
            onChange={(e) => updateRow(expense.id, 'dueDate', e.target.value)}
          />
        </div>
        <button
          onClick={() => deleteRow(expense.id)}
          className="mobile-delete-btn"
          title="Delete entry"
        >
          ✕
        </button>
      </div>
    </div>
  );
});

MobileExpenseCard.displayName = 'MobileExpenseCard';

const MobileAssetCard = React.memo(({ asset, types, currency, updateAsset, deleteAsset }) => {
  const [name, setName] = useState(asset.name);
  const [amount, setAmount] = useState(asset.amount);

  const handleBlur = (field, value) => {
    if (asset[field] !== value) {
      updateAsset(asset.id, field, value);
    }
  };

  return (
    <div className="finance-mobile-card">
      <div className="mobile-card-row primary-row">
        <input
          className="mobile-card-title-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => handleBlur('name', name)}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          placeholder="Asset name..."
        />
        <select
          value={asset.type}
          onChange={(e) => updateAsset(asset.id, 'type', e.target.value)}
          className="pill blue mobile-select"
        >
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="mobile-card-row footer-row" style={{ marginTop: '8px' }}>
        <div className="mobile-card-amount">
          <span style={{ color: 'var(--text-muted)', marginRight: '2px' }}>{currency}</span>
          <input
            type="number"
            className="mobile-card-amount-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={() => handleBlur('amount', parseFloat(amount) || 0)}
            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          />
        </div>
        <span className={`mobile-change-badge ${asset.change >= 0 ? 'pos' : 'neg'}`}>
          {asset.change >= 0 ? '+' : ''}{asset.change?.toFixed(1)}%
        </span>
        <button
          onClick={() => deleteAsset(asset.id)}
          className="mobile-delete-btn"
          title="Delete asset"
        >
          ✕
        </button>
      </div>
    </div>
  );
});

MobileAssetCard.displayName = 'MobileAssetCard';

