import React, { useState, useMemo } from 'react';
import { useStore } from '../../store';
import { SKILL_DEF } from '../../constants';
import '../Styles/HabitTracker.css';

const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
  </svg>
);

// Calculate streak for a custom habit across days
function calcStreak(days, habitId) {
  const sorted = [...days].sort((a, b) => b.id.localeCompare(a.id));
  let streak = 0;
  for (const day of sorted) {
    const habit = day.habits.find(h => h.id === habitId);
    if (habit?.done) streak++;
    else break;
  }
  return streak;
}

// Detail modal for a single habit
function HabitDetailModal({ habit, days, onClose }) {
  const streak = calcStreak(days, habit.id);
  const allDone = days.filter(d => d.habits.find(h => h.id === habit.id && h.done));
  const total = days.filter(d => d.habits.find(h => h.id === habit.id));
  const rate = total.length ? Math.round((allDone.length / total.length) * 100) : 0;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--sidebar-bg)', border: '1px solid var(--border-color)',
        borderRadius: 16, padding: 32, maxWidth: 440, width: '100%', boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>
              {streak >= 3 && <span style={{ marginRight: 6 }}>🔥</span>}
              {habit.name}
            </h2>
            {streak >= 3 && (
              <div style={{ fontSize: '0.78rem', color: '#f97316', fontWeight: 700, marginTop: 4 }}>
                🔥 {streak}-day streak — keep going!
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Current Streak', value: `${streak} days`, color: streak >= 3 ? '#f97316' : 'var(--primary)' },
            { label: 'Completion Rate', value: `${rate}%`, color: rate >= 70 ? 'var(--green-text)' : 'var(--text-main)' },
            { label: 'Days Tracked', value: total.length },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '14px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color || 'var(--text-main)' }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Last 10 Days
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[...days].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 10).map(day => {
            const h = day.habits.find(h => h.id === habit.id);
            const done = h?.done;
            return (
              <div key={day.id} title={day.date} style={{
                width: 28, height: 28, borderRadius: 6, background: done ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${done ? 'var(--primary)' : 'var(--border-color)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem'
              }}>
                {done ? '✓' : ''}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function HabitTracker() {
  const days = useStore(state => state.habits);
  const setDays = useStore(state => state.setHabits);
  const activeQuests = useStore(state => state.activeQuests || []);
  const updateQuestProgress = useStore(state => state.updateQuestProgress);
  const addXP = useStore(state => state.addXP);

  const [newHabitName, setNewHabitName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [detailHabit, setDetailHabit] = useState(null);

  const todayId = new Date().toISOString().split('T')[0];
  const todayDay = days.find(d => d.id === todayId);

  // Add a custom habit to ALL tracked days
  const addCustomHabit = () => {
    const name = newHabitName.trim();
    if (!name) return;
    const id = `custom-${Date.now()}`;
    setDays(days.map(day => ({
      ...day,
      habits: [...day.habits, { id, name, done: false }]
    })));
    setNewHabitName('');
    setShowAddForm(false);
  };

  // Remove a custom habit from ALL days
  const removeCustomHabit = (habitId) => {
    setDays(days.map(day => ({
      ...day,
      habits: day.habits.filter(h => h.id !== habitId)
    })));
  };

  const toggleHabit = (dayId, habitId) => {
    if (habitId.startsWith('quest-')) {
      const skillId = habitId.replace('quest-', '');
      updateQuestProgress(skillId);
      addXP(100);
      return;
    }
    const day = days.find(d => d.id === dayId);
    if (day) {
      const habit = day.habits.find(h => h.id === habitId);
      if (habit) addXP(habit.done ? -50 : 50);
    }
    setDays(days.map(d => {
      if (d.id !== dayId) return d;
      return { ...d, habits: d.habits.map(h => h.id === habitId ? { ...h, done: !h.done } : h) };
    }));
  };

  // Unique habit names from today (for the habit list header)
  const uniqueHabits = useMemo(() => {
    if (!todayDay) return [];
    return todayDay.habits.filter(h => !h.id.startsWith('quest-'));
  }, [todayDay]);

  const calculateProgress = (habits) => {
    const total = habits.length;
    if (total === 0) return 0;
    return Math.round((habits.filter(h => h.done).length / total) * 100);
  };

  const futureDays = days.filter(day => day.id >= todayId).sort((a, b) => a.id.localeCompare(b.id));

  return (
    <div className="premium-container">
      {detailHabit && (
        <HabitDetailModal
          habit={detailHabit}
          days={days}
          onClose={() => setDetailHabit(null)}
        />
      )}

      <div className="premium-header-container">
        <div className="premium-icon-wrapper"><ListIcon /></div>
        <h1 className="premium-title">Habit Tracker</h1>
        <p className="premium-subtitle">Build consistent habits. Track streaks. Stay accountable.</p>
      </div>

      {/* Custom habit manager */}
      <div className="notion-block" style={{ marginBottom: 24 }}>
        <div className="notion-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>🎯 My Habits</span>
          <button
            className="notion-button"
            style={{ fontSize: '0.8rem', padding: '5px 14px' }}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            + Add Habit
          </button>
        </div>

        {showAddForm && (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: 10 }}>
            <input
              className="notion-input"
              placeholder="e.g. Read 30 minutes, Meditate, Cold shower..."
              value={newHabitName}
              onChange={e => setNewHabitName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustomHabit()}
              autoFocus
              style={{ flex: 1 }}
            />
            <button className="notion-button" onClick={addCustomHabit} style={{ padding: '8px 18px' }}>Add</button>
            <button onClick={() => setShowAddForm(false)} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: 8, padding: '8px 14px', color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
          </div>
        )}

        <div style={{ padding: '12px 20px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {uniqueHabits.map(habit => {
            const streak = calcStreak(days, habit.id);
            const isCustom = habit.id.startsWith('custom-');
            return (
              <div
                key={habit.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
                  borderRadius: 20, padding: '5px 12px', fontSize: '0.82rem', cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => setDetailHabit(habit)}
                title="Click for details"
              >
                {streak >= 3 && <span>🔥</span>}
                <span style={{ fontWeight: 600 }}>{habit.name}</span>
                {streak > 0 && (
                  <span style={{ fontSize: '0.72rem', color: streak >= 3 ? '#f97316' : 'var(--text-muted)', fontWeight: 700 }}>
                    {streak}d
                  </span>
                )}
                {isCustom && (
                  <button
                    onClick={e => { e.stopPropagation(); removeCustomHabit(habit.id); }}
                    style={{ background: 'none', border: 'none', color: 'var(--red-text)', cursor: 'pointer', opacity: 0.5, fontSize: '0.9rem', padding: '0 2px', lineHeight: 1 }}
                    title="Remove habit"
                  >×</button>
                )}
              </div>
            );
          })}
          {uniqueHabits.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.83rem', padding: '8px 0' }}>
              No habits yet — add your first habit above!
            </div>
          )}
        </div>
      </div>

      {/* Day cards */}
      <div className="notion-block">
        <div className="notion-header">📝 10-Day Tracker</div>
        <div className="habit-grid">
          {futureDays.map(day => {
            const progress = calculateProgress(day.habits);
            const xp = day.habits.filter(h => h.done).length * 50;
            return (
              <div key={day.id} className="premium-card">
                <div style={{ fontSize: '0.9rem', color: 'var(--orange-text)', marginBottom: 12, fontWeight: 600 }}>{day.date}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                  {day.habits.map(habit => {
                    const streak = calcStreak(days, habit.id);
                    return (
                      <div key={habit.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                          type="checkbox"
                          checked={habit.done}
                          onChange={() => toggleHabit(day.id, habit.id)}
                          style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                        />
                        <span
                          style={{ fontSize: '0.8rem', opacity: habit.done ? 0.6 : 1, textDecoration: habit.done ? 'line-through' : 'none', cursor: 'pointer', flex: 1 }}
                          onClick={() => setDetailHabit(habit)}
                        >
                          {streak >= 3 && <span style={{ marginRight: 3 }}>🔥</span>}
                          {habit.name}
                        </span>
                      </div>
                    );
                  })}

                  {activeQuests.map(q => {
                    const skill = SKILL_DEF.find(s => s.id === q.skillId);
                    return (
                      <div key={q.skillId} className="quest-roadmap-item">
                        <input type="checkbox" onChange={() => toggleHabit(day.id, `quest-${q.skillId}`)} style={{ cursor: 'pointer', marginTop: 3 }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>{skill?.icon} {skill?.name} Unlock Quest</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Progress: {q.progress} / {q.total}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>
                    <span>{xp} XP</span><span>{day.habits.length * 50} XP Max</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border-color)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: 'var(--red-text)', transition: 'width var(--transition-fast)' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
