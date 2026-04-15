import React, { useEffect } from 'react';
import { useStore } from '../store';
import { SKILL_DEF } from '../constants';

// Data is now entirely driven by the Zustand store (store.js), seeded by the SkillTree Core habit.

export default function HabitTracker() {
  const days = useStore(state => state.habits);
  const setDays = useStore(state => state.setHabits);

  const toggleHabit = (dayId, habitId) => {
    setDays(days.map(d => {
      if (d.id !== dayId) return d;
      return {
        ...d,
        habits: d.habits.map(h => h.id === habitId ? { ...h, done: !h.done } : h)
      };
    }));
  };

  const unlockedSkills = useStore(state => state.skills);

  // Sync all unlocked skill habits into all 10 days
  useEffect(() => {
    if (!days || days.length === 0) return;

    // Build the set of habits that should exist based on unlocked skills
    const habitsThatShouldExist = SKILL_DEF
      .filter(skill => unlockedSkills.includes(skill.id) && skill.habit)
      .map(skill => ({ id: `h-${skill.id}`, name: skill.habit }));

    let needsUpdate = false;
    const updatedDays = days.map(day => {
      const existingIds = new Set(day.habits.map(h => h.id));
      const missingHabits = habitsThatShouldExist.filter(h => !existingIds.has(h.id));
      if (missingHabits.length > 0) {
        needsUpdate = true;
        return { ...day, habits: [...day.habits, ...missingHabits.map(h => ({ ...h, done: false }))] };
      }
      return day;
    });

    if (needsUpdate) {
      setDays(updatedDays);
    }
  }, [unlockedSkills]); // Runs whenever skills change

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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', padding: '0 20px 20px' }}>
          {days.map(day => {
            const xp = calculateXP(day.habits);
            const progress = calculateProgress(day.habits);
            return (
              <div key={day.id} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column'
              }}>
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
