import React, { useState, useEffect } from 'react';
import './Overview.css';
import { useStore } from '../store';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { calculateRank, SKILL_DEF } from '../constants';
import { LIFE_RULES } from '../data/lifeRules';

export default function Overview({ navigate }) {
  const habits = useStore(state => state.habits) || [];
  const expenses = useStore(state => state.expenses) || [];
  const assets = useStore(state => state.assets) || [];
  const goals = useStore(state => state.goals) || { week: [], month: [], year: [] };
  const fridge = useStore(state => state.fridge) || [];
  const targets = useStore(state => state.targets) || [];
  const books = useStore(state => state.books) || [];
  const movies = useStore(state => state.movies) || [];
  const profile = useStore(state => state.profile) || { username: '', goals: '', heroImage: '' };
  const setProfile = useStore(state => state.setProfile);

  const [time, setTime] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const rankStats = calculateRank(profile.xp || 0);

  const DEFAULT_HERO = "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2000";

  const handleUpdateCover = () => {
    const url = prompt('Enter Image or GIF URL for cover:', profile.heroImage || DEFAULT_HERO);
    if (url !== null) {
      setProfile({ heroImage: url });
    }
  };

  const changeMonth = (offset) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate habit progress for today
  const todayHabitsList = habits[0]?.habits || [];
  const completedToday = todayHabitsList.filter(h => h.done).length;
  const habitXpEarned = completedToday * 50;
  const habitXpMax = todayHabitsList.length * 50;
  const habitProgress = todayHabitsList.length > 0 
    ? Math.round((completedToday / todayHabitsList.length) * 100) 
    : 0;

  // Calculate monthly expenses
  const monthlyTotal = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  
  // Calculate total wealth / assets
  const totalWealth = assets.reduce((sum, a) => sum + (a.amount || 0), 0);
  const netWorth = totalWealth - monthlyTotal; // Simplified net worth logic

  // Progress metrics for the 5 databases
  const goalProg = goals.week.length > 0 ? Math.round((goals.week.filter(g=>g.done).length / goals.week.length) * 100) : 0;
  const fridgeProg = fridge.length > 0 ? Math.round((fridge.filter(f=>f.status !== 'Not in stock').length / fridge.length) * 100) : 0;
  const expenseProg = totalWealth > 0 ? Math.max(0, Math.round(100 - (monthlyTotal / totalWealth) * 100)) : 100;
  const targetProg = targets.length > 0 ? Math.round((targets.filter(t=>t.status === 'Completed').length / targets.length) * 100) : 0;
  const bookProg = books.length > 0 ? Math.round((books.filter(b=>b.status === 'Finished').length / books.length) * 100) : 0;
  const movieProg = movies.length > 0 ? Math.round((movies.filter(m=>m.status === 'Watched').length / movies.length) * 100) : 0;

  const progressItems = [
    { label: 'Expense Tracker', pct: expenseProg, color: 'var(--blue-text)' },
    { label: 'Goal Planner', pct: goalProg, color: 'var(--red-text)' },
    { label: 'Habit Tracker', pct: habitProgress, color: 'var(--purple-text)', explicitDisplay: `${habitXpEarned} / ${habitXpMax} XP` },
    { label: 'Fridge Stock', pct: fridgeProg, color: 'var(--green-text)' },
    { label: 'Big Targets', pct: targetProg, color: 'var(--orange-text)' },
    { label: 'Library', pct: bookProg, color: '#3182ce' },
    { label: 'Cinema', pct: movieProg, color: '#e53e3e' },
    // Add Active Quests to synchronization
    ...(useStore.getState().activeQuests || []).map(q => ({
      label: `QUEST: ${q.skillId}`,
      pct: q.progress && q.total ? Math.round((q.progress / q.total) * 100) : 0,
      color: 'var(--primary)',
      explicitDisplay: `${(q.total || 0) - (q.progress || 0)}d left`
    }))
  ];

  // Calculate expenses by category for the chart
  const expensesByCategory = expenses.reduce((acc, exp) => {
    if (exp.amount && exp.amount > 0) {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    }
    return acc;
  }, {});

  const chartData = Object.keys(expensesByCategory).map(key => ({
    name: key,
    value: expensesByCategory[key]
  }));

  const COLORS = ['#3b82f6', '#f97316', '#eab308', '#ec4899', '#8b5cf6', '#10b981'];

  // Get top goals
  const activeGoals = goals.week.filter(g => !g.done).slice(0, 3);

  // Get upcoming bills (due in next 7 days)
  const upcomingBills = expenses
    .filter(exp => {
      if (!exp.dueDate) return false;
      const due = new Date(exp.dueDate);
      const now = new Date();
      const diffTime = due - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    })
    .sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));

  // Get low fridge items
  const lowFridge = fridge.filter(f => f.status === 'Not in stock').slice(0, 3);

  // Year Progress Logic
  const year = time.getFullYear();
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const totalDays = isLeapYear ? 366 : 365;
  
  const start = new Date(year, 0, 0);
  const diff = time - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const dots = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Time formatted values
  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Life Rule Selection (Daily rotation)
  const ruleIndex = dayOfYear % LIFE_RULES.length;
  const currentRule = LIFE_RULES[ruleIndex];
  const ruleNumber = ruleIndex + 1;

  // Calendar Render Logic
  const renderCalendar = () => {
    const calYear = currentMonth.getFullYear();
    const calMonth = currentMonth.getMonth();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const startDay = firstDay === 0 ? 6 : firstDay - 1; // Mon=0, Sun=6

    const days = [];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="cal-day empty"></div>);
    }

    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = today.getDate() === i && today.getMonth() === calMonth && today.getFullYear() === calYear;
      days.push(
        <div key={i} className={`cal-day ${isToday ? 'today' : ''}`}>
          {i}
        </div>
      );
    }

    return (
      <div className="calendar-widget">
        <div className="cal-header">
          <button className="cal-nav" onClick={() => changeMonth(-1)}>‹</button>
          <h4>{monthNames[calMonth]} {calYear}</h4>
          <button className="cal-nav" onClick={() => changeMonth(1)}>›</button>
        </div>
        <div className="cal-weekdays">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => <div key={d} className="cal-weekday">{d}</div>)}
        </div>
        <div className="cal-days">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="overview-container">
      <div className="overview-hero">
        <div className="hero-cover">
          <img src={profile.heroImage || DEFAULT_HERO} alt="Cover" />
          <div className="hero-overlay"></div>
          <button className="change-cover-btn" onClick={handleUpdateCover} style={{ opacity: 0.8 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-camera" viewBox="0 0 16 16">
              <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4z"/>
              <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5m0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"/>
            </svg>
            Change Cover
          </button>
        </div>
        <div className="hero-content">
          <div className="hero-user">
            <div className="hero-avatar">
              {profile.profilePicture ? (
                <img src={profile.profilePicture} alt="Avatar" />
              ) : (
                profile.username?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div className="hero-welcome">
              <h1 className="hero-title">
                {profile.username || 'Workspace'}'s <span className="highlight">E.O.M</span>
              </h1>
              <p className="hero-subtitle">
                System Status: <span className="status-badge">Operational</span> • {dateStr}
              </p>
            </div>
          </div>
          
          <div className="hero-stats">
            <div className="rank-badge-container">
              <div className="rank-label">CURRENT RANK</div>
              <div className="rank-letter">{rankStats.currentRank.rank}</div>
            </div>
            <div className="xp-overview-container">
              <div className="xp-text-row">
                <span className="xp-label">XP STATUS</span>
                <span className="xp-value-text">{profile.xp || 0} / {rankStats.nextRank ? rankStats.nextRank.minXp : 'MAX'}</span>
              </div>
              <div className="xp-bar-outer">
                <div className="xp-bar-inner" style={{ width: `${rankStats.progress}%` }}></div>
              </div>
              <div className="next-rank-text">{rankStats.progress.toFixed(1)}% to RANK {rankStats.nextRank?.rank || 'MAX'}</div>
            </div>
            <div className="hero-stat-item">
              <span className="stat-value">{dayOfYear}</span>
              <span className="stat-label">Day {Math.round((dayOfYear / totalDays) * 100)}% ({totalDays - dayOfYear} Days Remaining)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="notion-block" style={{ marginBottom: '25px' }}>
        <div className="notion-tabs" style={{ marginBottom: '0', padding: '12px 20px', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
          <div className="notion-header" style={{ padding: 0, background: 'transparent', border: 'none', color: '#fff' }}>
            <span className="card-icon">📊</span>
            Subsystem Synchronization
          </div>
        </div>
        <div className="card-content sync-grid">
          {progressItems.map((item, idx) => (
            <div key={idx} className="sync-item">
              <div className="sync-info">
                <span className="sync-label">{item.label}</span>
                <span className="sync-value" style={{ color: item.color }}>{item.explicitDisplay || `${item.pct}%`}</span>
              </div>
              <div className="sync-bar-outer">
                <div className="sync-bar-inner" style={{ width: `${item.pct}%`, background: item.color }} />
              </div>
            </div>
          ))}
        </div>
        <div className="year-progress-container" style={{ marginTop: '20px', padding: '10px' }}>
          <div className="dots-grid">
            {dots.map(d => (
              <div 
                key={d} 
                className={`dot ${d <= dayOfYear ? 'active' : ''}`}
                title={`Day ${d}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="time-date-row">
        <div className="overview-card clock-card">
          <div className="clock-content">
            <div className="time-display">
              {hours}<span className="colon">:</span>{minutes}<span className="colon">:</span>{seconds}
            </div>
            <div className="date-display">{dateStr}</div>
          </div>
        </div>

        <div className="overview-card calendar-card">
          {renderCalendar()}
        </div>
      </div>

      <div className="overview-grid">
        <div className="overview-card habit-card">
          <div className="card-header">
            <span className="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-list" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
              </svg>
            </span>
            <h3>Daily Habits</h3>
          </div>
          <div className="card-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="progress-circle-wrapper">
              <div className="progress-circle-container">
                <div className="progress-circle" style={{ '--progress': `${habitProgress}%` }}>
                  <div className="progress-inner">
                    <span className="xp-value">{habitXpEarned}</span>
                    <span className="xp-label">XP EARNED</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 'auto', textAlign: 'center' }}>
              <span className="stat-label">{completedToday} of {todayHabitsList.length} habits completed</span>
            </div>
          </div>
          <button className="card-action" onClick={() => navigate('/habits')}>View Tracker</button>
        </div>

        <div className="overview-card finance-card">
          <div className="card-header">
            <span className="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-wallet" viewBox="0 0 16 16">
                <path d="M0 3a2 2 0 0 1 2-2h13.5a.5.5 0 0 1 0 1H15v2a1 1 0 0 1 1 1v8.5a1.5 1.5 0 0 1-1.5 1.5h-12A2.5 2.5 0 0 1 0 12.5V3zm1 1.732V12.5A1.5 1.5 0 0 0 2.5 14h12a.5.5 0 0 0 .5-.5V5H2a1.99 1.99 0 0 1-1-.268zM1 3a1 1 0 0 0 1 1h12V2H2a1 1 0 0 0-1 1z"/>
              </svg>
            </span>
            <h3>Finances & Wallet</h3>
          </div>
          <div className="card-content finance-content">
            <div className="finance-stats">
              <div className="expense-stat">
                <span className="total-amount">€{totalWealth.toLocaleString()}</span>
                <span className="stat-label">Total Assets</span>
              </div>
              <div className="recent-expenses">
                <div className="mini-expense">
                  <span>Net Worth</span>
                  <span className="mini-amount" style={{ color: netWorth >= 0 ? 'var(--green-text)' : 'var(--red-text)' }}>
                    €{netWorth.toLocaleString()}
                  </span>
                </div>
                <div className="mini-expense">
                  <span>Total Expenses</span>
                  <span className="mini-amount" style={{ color: 'var(--red-text)' }}>-€{monthlyTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
            {chartData.length > 0 && (
              <div className="finance-chart-container">
                <ResponsiveContainer width="100%" height={200} minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="90%"
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `€${value.toLocaleString()}`}
                      contentStyle={{ 
                        backgroundColor: 'rgba(20,20,20,0.8)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '8px', 
                        color: '#fff',
                        backdropFilter: 'blur(10px)'
                      }} 
                      itemStyle={{ color: '#fff', fontWeight: 'bold' }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          <button className="card-action" onClick={() => navigate('/expenses')}>Manage Finances</button>
        </div>

        <div className="overview-card goals-card">
          <div className="card-header">
            <span className="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-geo-alt" viewBox="0 0 16 16">
                <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10"/>
                <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
              </svg>
            </span>
            <h3>Active Goals</h3>
          </div>
          <div className="card-content">
            <ul className="mini-list">
              {activeGoals.map(goal => (
                <li key={goal.id}>
                  <span className="bullet">○</span>
                  {goal.text}
                </li>
              ))}
              {activeGoals.length === 0 && <li className="empty-msg">All weekly goals done!</li>}
            </ul>
          </div>
          <button className="card-action" onClick={() => navigate('/goals')}>Plan Goals</button>
        </div>

        <div className="overview-card fridge-card">
          <div className="card-header">
            <span className="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-fork-knife" viewBox="0 0 16 16">
                <path d="M13 .5c0-.276-.226-.506-.498-.465-1.703.257-2.94 2.012-3 8.462a.5.5 0 0 0 .498.5c.56.01 1 .13 1 1.003v5.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5zM4.25 0a.25.25 0 0 1 .25.25v5.122a.128.128 0 0 0 .256.006l.233-5.14A.25.25 0 0 1 5.24 0h.522a.25.25 0 0 1 .25.238l.233 5.14a.128.128 0 0 0 .256-.006V.25A.25.25 0 0 1 6.75 0h.29a.5.5 0 0 1 .498.458l.423 5.07a1.69 1.69 0 0 1-1.059 1.711l-.053.022a.92.92 0 0 0-.58.884L6.47 15a.971.971 0 1 1-1.942 0l.202-6.855a.92.92 0 0 0-.58-.884l-.053-.022a1.69 1.69 0 0 1-1.059-1.712L3.462.458A.5.5 0 0 1 3.96 0z"/>
              </svg>
            </span>
            <h3>Fridge Status</h3>
          </div>
          <div className="card-content">
            <ul className="mini-list">
              {lowFridge.map(item => (
                <li key={item.id} className="low-stock">
                  <span className="bullet">✕</span>
                  {item.name}
                </li>
              ))}
              {lowFridge.length === 0 && <li className="empty-msg">Everything in stock!</li>}
            </ul>
          </div>
          <button className="card-action" onClick={() => navigate('/fridge')}>Review Stock</button>
        </div>

        {upcomingBills.length > 0 && (
          <div className="overview-card bill-alert-card scale-in" style={{ border: '1px solid rgba(var(--primary-rgb), 0.3)', background: 'rgba(var(--primary-rgb), 0.05)' }}>
            <div className="card-header">
              <span className="card-icon" style={{ color: 'var(--primary)' }}>🔔</span>
              <h3 style={{ color: 'var(--primary)' }}>Upcoming Bills</h3>
            </div>
            <div className="card-content">
              <ul className="mini-list">
                {upcomingBills.map(bill => {
                  const daysLeft = Math.ceil((new Date(bill.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <li key={bill.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{bill.name}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.8rem', opacity: 0.8 }}>
                        {daysLeft === 0 ? 'DUE TODAY' : `In ${daysLeft}d`} • €{bill.amount}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <button className="card-action" style={{ background: 'var(--primary)', color: '#fff' }} onClick={() => navigate('/expenses')}>Handle Payments</button>
          </div>
        )}
      </div>

      <div className="overview-footer-grid">
          <div className="overview-card objective-card">
            <div className="card-header">
              <span className="card-icon">🎯</span>
              <h3>Primary Objective</h3>
            </div>
            <div className="card-content">
              <p className="objective-text">
                {profile.goals?.split('\n')[0] || "No objective set."}
              </p>
            </div>
          </div>

          <div className="overview-card rule-card">
            <div className="card-header">
              <span className="card-icon">📜</span>
              <h3>Daily Rule</h3>
            </div>
            <div className="card-content">
              <div className="rule-badge">Life Rule #{ruleNumber}</div>
              <p className="rule-text">
                {currentRule}
              </p>
            </div>
          </div>
      </div>
    </div>
  );
}
