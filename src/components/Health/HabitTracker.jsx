import React, { useState, useMemo } from 'react';
import { useStore } from '../../store';
import { SKILL_DEF } from '../../constants';
import '../Styles/HabitTracker.css';
import '../Styles/Timetable.css';

const PaletteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
    <path d="M12.433 10.07C14.133 10.585 16 11.15 16 12c0 2.5-4 4-8 4S0 14.5 0 12c0-3.5 3-5.5 6-5.5-.1.1-.1.2-.1.3 0 .7.5 1.2 1.2 1.2.8 0 1.2-.8 1.7-1.2.4-.4.8-.7 1.3-.7a1 1 0 0 1 1 1c0 .4-.2.8-.4 1.1-.3.3-.4.8-.3 1.3z"/>
    <path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4"/>
  </svg>
);

const COLORS = ['blue', 'green', 'orange', 'purple', 'pink', 'yellow', 'red'];

const COLORS_MAP = {
  blue: { bg: 'rgba(59, 130, 246, 0.08)', border: '#3b82f6', text: '#3b82f6' },
  green: { bg: 'rgba(16, 185, 129, 0.08)', border: '#10b981', text: '#10b981' },
  orange: { bg: 'rgba(249, 115, 22, 0.08)', border: '#f97316', text: '#f97316' },
  purple: { bg: 'rgba(168, 85, 247, 0.08)', border: '#a855f7', text: '#a855f7' },
  pink: { bg: 'rgba(236, 72, 153, 0.08)', border: '#ec4899', text: '#ec4899' },
  yellow: { bg: 'rgba(234, 179, 8, 0.08)', border: '#eab308', text: '#eab308' },
  red: { bg: 'rgba(239, 68, 68, 0.08)', border: '#ef4444', text: '#ef4444' }
};

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

  const progressPct = habit.streakGoal ? Math.min(100, Math.round((streak / habit.streakGoal) * 100)) : null;
  const isCompleted = progressPct !== null && progressPct >= 100;
  
  let statusText = '';
  if (progressPct !== null) {
    if (progressPct >= 100) statusText = 'Goal streak achieved! 🏆';
    else if (progressPct >= 75) statusText = 'Almost accomplished! 🔥';
    else if (progressPct >= 50) statusText = 'Over halfway there! 💪';
    else if (progressPct >= 25) statusText = 'Building consistency! 📈';
    else statusText = 'Just started! 🚀';
  }

  const cStyles = COLORS_MAP[habit.color || 'blue'] || COLORS_MAP.blue;
  const barColor = isCompleted ? 'linear-gradient(90deg, #eab308, #f97316)' : cStyles.border;

  let startDateText = '';
  let endDateText = '';
  if (habit.startDate) {
    const [y, m, d] = habit.startDate.split('-').map(Number);
    startDateText = new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (habit.streakGoal) {
      const end = new Date(y, m - 1, d);
      end.setDate(end.getDate() + Number(habit.streakGoal) - 1);
      endDateText = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--sidebar-bg)', border: isCompleted ? '1px solid #eab308' : '1px solid var(--border-color)',
        borderRadius: 16, padding: 32, maxWidth: 440, width: '100%', boxSizing: 'border-box',
        boxShadow: isCompleted ? '0 0 20px rgba(234, 179, 8, 0.2)' : '0 10px 30px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 6, color: isCompleted ? '#eab308' : 'var(--text-main)' }}>
              {isCompleted ? '🏆' : (streak >= 3 ? '🔥' : '')}
              {habit.name}
            </h2>
            {progressPct !== null ? (
              <div style={{ fontSize: '0.78rem', color: isCompleted ? '#eab308' : '#f97316', fontWeight: 700, marginTop: 4 }}>
                {isCompleted ? '🎉 Goal Streak Completed!' : `Streak goal: ${streak} / ${habit.streakGoal} days`}
              </div>
            ) : (
              streak >= 3 && (
                <div style={{ fontSize: '0.78rem', color: '#f97316', fontWeight: 700, marginTop: 4 }}>
                  🔥 {streak}-day streak — keep going!
                </div>
              )
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
        </div>

        {habit.notes && (
          <div style={{
            fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20,
            background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 10,
            lineHeight: 1.5
          }}>
            {habit.notes}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Current Streak', value: `${streak} days`, color: isCompleted ? '#eab308' : (streak >= 3 ? '#f97316' : 'var(--primary)') },
            { label: 'Completion Rate', value: `${rate}%`, color: rate >= 70 ? 'var(--green-text)' : 'var(--text-main)' },
            { label: 'Days Tracked', value: total.length },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '14px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color || 'var(--text-main)' }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {progressPct !== null && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: 6 }}>
              <span style={{ color: isCompleted ? '#eab308' : 'var(--text-muted)' }}>{statusText}</span>
              <span style={{ color: isCompleted ? '#eab308' : cStyles.text }}>{progressPct}%</span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${progressPct}%`,
                background: barColor,
                boxShadow: isCompleted ? '0 0 10px rgba(234, 179, 8, 0.5)' : 'none',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        )}

        {(startDateText || habit.streakGoal) && (
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)',
            borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: '0.8rem'
          }}>
            {startDateText && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Start Date:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{startDateText}</span>
              </div>
            )}
            {endDateText && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: '1px solid rgba(255,255,255,0.04)', marginTop: 4, paddingTop: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Streak Goal Ends:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{endDateText}</span>
              </div>
            )}
            {habit.streakGoal && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: '1px solid rgba(255,255,255,0.04)', marginTop: 4, paddingTop: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Duration:</span>
                <span style={{ fontWeight: 600, color: isCompleted ? '#eab308' : 'var(--text-main)' }}>{habit.streakGoal} days</span>
              </div>
            )}
          </div>
        )}

        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Last 10 Days
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[...days].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 10).map(day => {
            const h = day.habits.find(h => h.id === habit.id);
            const done = h?.done;
            return (
              <div key={day.id} title={day.date} style={{
                width: 28, height: 28, borderRadius: 6, background: done ? (isCompleted ? '#eab308' : 'var(--primary)') : 'rgba(255,255,255,0.06)',
                border: `1px solid ${done ? (isCompleted ? '#eab308' : 'var(--primary)') : 'var(--border-color)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem',
                color: done ? '#000000' : 'var(--text-muted)'
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
  const customHabitTemplates = useStore(state => state.customHabitTemplates || []);
  const addCustomHabitTemplate = useStore(state => state.addCustomHabitTemplate);
  const removeCustomHabitTemplate = useStore(state => state.removeCustomHabitTemplate);

  const [habitTitle, setHabitTitle] = useState('');
  const [habitNotes, setHabitNotes] = useState('');
  const [habitColor, setHabitColor] = useState('blue');
  const [habitRepeat, setHabitRepeat] = useState('Daily');
  const [habitWeekdays, setHabitWeekdays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
  const [habitStartDate, setHabitStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [habitStreakGoal, setHabitStreakGoal] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [detailHabit, setDetailHabit] = useState(null);

  const todayId = new Date().toISOString().split('T')[0];
  const todayDay = days.find(d => d.id === todayId);

  // Add a custom habit template to store
  const addCustomHabit = (name, notes, color, repeat, weekdays, startDate, streakGoal) => {
    const cleanName = name.trim();
    if (!cleanName) return;
    const id = `custom-${Date.now()}`;
    addCustomHabitTemplate({
      id,
      name: cleanName,
      notes: notes.trim(),
      color,
      repeat,
      weekdays,
      startDate: startDate || new Date().toISOString().split('T')[0],
      streakGoal: streakGoal ? Number(streakGoal) : null,
      createdAt: new Date().toISOString()
    });
  };

  // Remove a custom habit template from store
  const removeCustomHabit = (habitId) => {
    removeCustomHabitTemplate(habitId);
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

  // Unique habits loaded from master templates list
  const uniqueHabits = useMemo(() => {
    return customHabitTemplates;
  }, [customHabitTemplates]);

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

      {showAddModal && (
        <div className="timetable-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="timetable-modal-content" onClick={(e) => e.stopPropagation()}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addCustomHabit(habitTitle, habitNotes, habitColor, habitRepeat, habitWeekdays, habitStartDate, habitStreakGoal);
                setShowAddModal(false);
              }}
              className="mac-modal-form"
            >
              <div className="mac-text-fields-group">
                <input
                  type="text"
                  required
                  className="mac-title-input"
                  placeholder="Title"
                  value={habitTitle}
                  onChange={e => setHabitTitle(e.target.value)}
                />
                <textarea
                  className="mac-notes-textarea"
                  placeholder="Notes"
                  rows={2}
                  value={habitNotes}
                  onChange={e => setHabitNotes(e.target.value)}
                />
              </div>

              <div className="mac-group">
                <div className="mac-group-title">Organisation</div>
                <div className="mac-group-list">
                  <div className="mac-row">
                    <span className="mac-row-label">
                      <PaletteIcon /> Color
                    </span>
                    <div className="mac-row-control">
                      <div className="mac-color-picker">
                        {COLORS.map(c => (
                          <div
                            key={c}
                            className={`mac-color-circle ${c} ${habitColor === c ? 'selected' : ''}`}
                            onClick={() => setHabitColor(c)}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mac-row">
                    <span className="mac-row-label">
                      🔄 Repeat
                    </span>
                    <div className="mac-row-control">
                      <select
                        className="mac-select"
                        value={habitRepeat}
                        onChange={e => {
                          const val = e.target.value;
                          setHabitRepeat(val);
                          if (val === 'Daily' || val === 'Once') {
                            setHabitWeekdays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
                          }
                        }}
                      >
                        <option value="Once">Once</option>
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                      </select>
                    </div>
                  </div>

                  {habitRepeat === 'Weekly' && (
                    <div className="mac-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
                      <span className="mac-row-label">
                        📅 Active Days
                      </span>
                      <div style={{ display: 'flex', gap: 8, width: '100%', justifyContent: 'space-between', marginTop: 4 }}>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                          const shortNames = {
                            Monday: 'M',
                            Tuesday: 'T',
                            Wednesday: 'W',
                            Thursday: 'T',
                            Friday: 'F',
                            Saturday: 'S',
                            Sunday: 'S'
                          };
                          const label = shortNames[day];
                          const isSelected = habitWeekdays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  if (habitWeekdays.length > 1) {
                                    setHabitWeekdays(habitWeekdays.filter(d => d !== day));
                                  }
                                } else {
                                  setHabitWeekdays([...habitWeekdays, day]);
                                }
                              }}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                border: '1px solid rgba(255,255,255,0.15)',
                                background: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                color: isSelected ? '#ffffff' : 'rgba(255,255,255,0.6)',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                                outline: 'none'
                              }}
                              title={day}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mac-group">
                <div className="mac-group-title">Duration & Streak Goal</div>
                <div className="mac-group-list">
                  <div className="mac-row">
                    <span className="mac-row-label">
                      📅 Start Date
                    </span>
                    <div className="mac-row-control">
                      <input
                        type="date"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'rgba(255, 255, 255, 0.75)',
                          fontSize: '0.85rem',
                          fontFamily: 'inherit',
                          outline: 'none',
                          textAlign: 'right',
                          cursor: 'pointer'
                        }}
                        value={habitStartDate}
                        onChange={e => setHabitStartDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mac-row">
                    <span className="mac-row-label">
                      🎯 Streak Goal (Days)
                    </span>
                    <div className="mac-row-control">
                      <input
                        type="number"
                        min="1"
                        placeholder="Indefinite"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'rgba(255, 255, 255, 0.75)',
                          fontSize: '0.85rem',
                          fontFamily: 'inherit',
                          outline: 'none',
                          textAlign: 'right',
                          width: '100px'
                        }}
                        value={habitStreakGoal}
                        onChange={e => setHabitStreakGoal(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mac-footer-actions" style={{ margin: '20px -20px -20px', padding: '16px 20px' }}>
                <button type="button" className="mac-btn-cancel" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="mac-btn-save">
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
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
            onClick={() => {
              setHabitTitle('');
              setHabitNotes('');
              setHabitColor('blue');
              setHabitRepeat('Daily');
              setHabitWeekdays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
              setHabitStartDate(new Date().toISOString().split('T')[0]);
              setHabitStreakGoal('');
              setShowAddModal(true);
            }}
          >
            + Add Habit
          </button>
        </div>

        <div style={{ padding: '12px 20px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {uniqueHabits.map(habit => {
            const streak = calcStreak(days, habit.id);
            const isCustom = habit.id.startsWith('custom-');
            const cStyles = COLORS_MAP[habit.color || 'blue'] || COLORS_MAP.blue;
            const hasGoal = habit.streakGoal > 0;
            const isCompleted = hasGoal && streak >= habit.streakGoal;

            const bg = isCompleted
              ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(249, 115, 22, 0.15) 100%)'
              : cStyles.bg;
            const border = isCompleted ? '1px solid #eab308' : `1px solid ${cStyles.border}`;
            const color = isCompleted ? '#eab308' : cStyles.text;
            const boxShadow = isCompleted ? '0 0 10px rgba(234, 179, 8, 0.25)' : 'none';

            return (
              <div
                key={habit.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: bg, border: border, boxShadow: boxShadow,
                  borderRadius: 20, padding: '5px 12px', fontSize: '0.82rem', cursor: 'pointer',
                  transition: 'all 0.2s',
                  color: color
                }}
                className={isCompleted ? 'habit-glow-gold' : ''}
                onClick={() => setDetailHabit(habit)}
                title="Click for details"
              >
                {isCompleted ? (
                  <span>🏆</span>
                ) : (
                  streak >= 3 && <span>🔥</span>
                )}
                <span style={{ fontWeight: 600 }}>{habit.name}</span>
                {hasGoal ? (
                  <span style={{ fontSize: '0.72rem', color: isCompleted ? '#eab308' : 'var(--text-muted)', fontWeight: 700 }}>
                    {streak}/{habit.streakGoal}d
                  </span>
                ) : (
                  streak > 0 && (
                    <span style={{ fontSize: '0.72rem', color: streak >= 3 ? '#f97316' : 'var(--text-muted)', fontWeight: 700 }}>
                      {streak}d
                    </span>
                  )
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
                    const cStyles = COLORS_MAP[habit.color || 'blue'] || COLORS_MAP.blue;
                    const hasGoal = habit.streakGoal > 0;
                    const isCompleted = hasGoal && streak >= habit.streakGoal;
                    return (
                      <div key={habit.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                          type="checkbox"
                          checked={habit.done}
                          onChange={() => toggleHabit(day.id, habit.id)}
                          style={{ cursor: 'pointer', accentColor: isCompleted ? '#eab308' : cStyles.border }}
                        />
                        <span
                          style={{
                            fontSize: '0.8rem',
                            opacity: habit.done ? 0.6 : 1,
                            textDecoration: habit.done ? 'line-through' : 'none',
                            cursor: 'pointer',
                            flex: 1,
                            color: habit.done ? 'var(--text-muted)' : (isCompleted ? '#eab308' : cStyles.text),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                          onClick={() => setDetailHabit(habit)}
                        >
                          <span style={{ display: 'flex', alignItems: 'center' }}>
                            {isCompleted ? (
                              <span style={{ marginRight: 4 }}>🏆</span>
                            ) : (
                              streak >= 3 && <span style={{ marginRight: 3 }}>🔥</span>
                            )}
                            {habit.name}
                          </span>
                          {hasGoal && (
                            <span style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              background: isCompleted ? 'rgba(234, 179, 8, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                              border: isCompleted ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                              borderRadius: 4,
                              padding: '1px 5px',
                              color: isCompleted ? '#eab308' : 'var(--text-muted)',
                              marginLeft: 8
                            }}>
                              {streak}/{habit.streakGoal}
                            </span>
                          )}
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
