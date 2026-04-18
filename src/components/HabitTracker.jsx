import React from 'react';
import { useStore } from '../store';
import { SKILL_DEF } from '../constants';
import './HabitTracker.css';

// Data is now entirely driven by the Zustand store (store.js), seeded by the SkillTree Core habit.

export default function HabitTracker() {
  const days = useStore(state => state.habits);
  const setDays = useStore(state => state.setHabits);

  const activeQuests = useStore(state => state.activeQuests || []);
  const updateQuestProgress = useStore(state => state.updateQuestProgress);

  const toggleHabit = (dayId, habitId) => {
    // Check if it's a quest habit
    if (habitId.startsWith('quest-')) {
      const skillId = habitId.replace('quest-', '');
      // Prevent double updates if already triggering
      updateQuestProgress(skillId);
      return;
    }

    setDays(days.map(d => {
      if (d.id !== dayId) return d;
      return {
        ...d,
        habits: d.habits.map(h => h.id === habitId ? { ...h, done: !h.done } : h)
      };
    }));
  };



  const calculateXP = (habits) => {
    return habits.filter(h => h.done).length * 50;
  };

  const calculateProgress = (habits) => {
    const total = habits.length;
    if (total === 0) return 0;
    const done = habits.filter(h => h.done).length;
    return Math.round((done / total) * 100);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Habit Tracker</h1>
        <p style={{ color: 'var(--text-muted)' }}>Build consistent habits without overthinking.<br/>Track progress daily and stay accountable.</p>
      </div>

      <div className="notion-block">
        <div className="notion-header">
          📝 10-day habit tracker
        </div>

        <div className="notion-tabs">
          <button className="notion-tab active">days</button>
        </div>

        <div className="habit-grid">
          {days.filter(day => day.id >= new Date().toISOString().split('T')[0]).map(day => {
            const xp = calculateXP(day.habits);
            const progress = calculateProgress(day.habits);
            return (
              <div key={day.id} className="notion-block roadmap" style={{ padding: '20px', position: 'relative' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--orange-text)', marginBottom: '12px', fontWeight: 600 }}>{day.date}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  {day.habits.map(habit => (
                    <div key={habit.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input 
                        type="checkbox" 
                        checked={habit.done} 
                        onChange={() => toggleHabit(day.id, habit.id)} 
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.8rem', opacity: habit.done ? 0.6 : 1, textDecoration: habit.done ? 'line-through' : 'none' }}>
                        {habit.name}
                      </span>
                    </div>
                  ))}

                  {/* Render Quests for all roadmap days */}
                  {activeQuests.map(q => {
                    const skill = SKILL_DEF.find(s => s.id === q.skillId);
                    return (
                      <div key={q.skillId} className="quest-roadmap-item">
                         <input 
                          type="checkbox" 
                          onChange={() => toggleHabit(day.id, `quest-${q.skillId}`)} 
                          style={{ cursor: 'pointer', marginTop: '3px' }}
                        />
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                           <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)' }}>
                             {skill?.icon} {skill?.name} Unlock Quest
                           </span>
                           <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                             Progress: {q.progress} / {q.total}
                           </span>
                         </div>
                      </div>
                    );
                  })}
                </div>
                
                <div style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                    <span>{xp} XP</span>
                    <span>{day.habits.length * 50} XP Max</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: 'var(--red-text)', transition: 'width var(--transition-fast)' }}></div>
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
