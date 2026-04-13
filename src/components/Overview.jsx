import React, { useState, useEffect } from 'react';
import './Overview.css';
import { useStore } from '../store';

export default function Overview({ navigate }) {
  const habits = useStore(state => state.habits) || [];
  const expenses = useStore(state => state.expenses) || [];
  const assets = useStore(state => state.assets) || [];
  const goals = useStore(state => state.goals) || { week: [], month: [], year: [] };
  const fridge = useStore(state => state.fridge) || [];
  const profile = useStore(state => state.profile) || { username: '', goals: '' };

  const [time, setTime] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

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
  const habitProgress = todayHabitsList.length > 0 
    ? Math.round((completedToday / todayHabitsList.length) * 100) 
    : 0;

  // Calculate monthly expenses
  const monthlyTotal = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  
  // Calculate total wealth / assets
  const totalWealth = assets.reduce((sum, a) => sum + (a.amount || 0), 0);
  const netWorth = totalWealth - monthlyTotal; // Simplified net worth logic

  // Get top goals
  const activeGoals = goals.week.filter(g => !g.done).slice(0, 3);

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
      <header className="overview-header">
        <div className="overview-header">
          <div>
            <h1 className="welcome-text">Welcome back, {profile.username}</h1>
            <p className="system-status">System check: All modules operational. Your life is on track.</p>
          </div>
        </div>
        <div className="year-stats">
             <span className="day-count">Day {dayOfYear} of {totalDays}</span>
             <span className="year-pct">{Math.round((dayOfYear / totalDays) * 100)}%</span>
        </div>

        <div className="year-progress-container">
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
      </header>

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
            <span className="card-icon">📝</span>
            <h3>Daily Habits</h3>
          </div>
          <div className="card-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="progress-circle">
              <span className="progress-number">{habitProgress}%</span>
            </div>
            <div style={{ marginTop: 'auto' }}>
              <span className="stat-label">{completedToday} of {todayHabitsList.length} habits completed</span>
            </div>
          </div>
          <button className="card-action" onClick={() => navigate('/habits')}>View Tracker</button>
        </div>

        <div className="overview-card finance-card">
          <div className="card-header">
            <span className="card-icon">💸</span>
            <h3>Finances & Wallet</h3>
          </div>
          <div className="card-content">
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
          <button className="card-action" onClick={() => navigate('/expenses')}>Manage Finances</button>
        </div>

        <div className="overview-card goals-card">
          <div className="card-header">
            <span className="card-icon">🎯</span>
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
            <span className="card-icon">🍏</span>
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
          <button className="card-action" onClick={() => navigate('/targets')}>Review Objectives</button>
        </div>
      </div>

      <div className="overview-footer-grid">
         <div className="overview-card objective-card">
            <div className="card-header">
              <span className="card-icon">🏔️</span>
              <h3>Primary Objective</h3>
            </div>
            <div className="card-content">
              <p className="objective-text">
                {profile.goals?.split('\n')[0] || "No objective set."}
              </p>
            </div>
         </div>
      </div>
    </div>
  );
}
