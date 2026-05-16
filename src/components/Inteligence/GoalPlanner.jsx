import React, { useState } from 'react';
import { useStore } from '../../store';
import GoalModal from './GoalModal';
import { SKILL_DEF } from '../../constants';

const GoalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-crosshair" viewBox="0 0 16 16">
    <path d="M8.5.5a.5.5 0 0 0-1 0v.518A7 7 0 0 0 1.018 7.5H.5a.5.5 0 0 0 0 1h.518A7 7 0 0 0 7.5 14.982v.518a.5.5 0 0 0 1 0v-.518A7 7 0 0 0 14.982 8.5h.518a.5.5 0 0 0 0-1h-.518A7 7 0 0 0 8.5 1.018zm-6.48 7A6 6 0 0 1 7.5 2.02v.48a.5.5 0 0 0 1 0v-.48a6 6 0 0 1 5.48 5.48h-.48a.5.5 0 0 0 0 1h.48a6 6 0 0 1-5.48 5.48v-.48a.5.5 0 0 0-1 0v.48A6 6 0 0 1 2.02 8.5h.48a.5.5 0 0 0 0-1zM8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4" />
  </svg>
);

export default function GoalPlanner() {
  const goals = useStore(state => state.goals);
  const setGoals = useStore(state => state.setGoals);
  const skills = useStore(state => state.skills);

  const [modalOpen, setModalOpen] = useState(false);
  const [activeCol, setActiveCol] = useState('week');

  const addXP = useStore(state => state.addXP);

  const toggleGoal = (col, id) => {
    const goal = goals[col].find(g => g.id === id);
    if (!goal) return;

    const isNowDone = !goal.done;

    // Award XP if completed
    if (isNowDone) {
      const difficultyBonus = {
        'Easy': 10,
        'Medium': 20,
        'Hard': 50,
        'Super Hard': 100
      }[goal.difficulty || 'Easy'] || 0;

      const earned = (goal.minutes || 0) * 10 + difficultyBonus;
      addXP(earned);
    }

    const updated = goals[col].map(g => g.id === id ? { ...g, done: isNowDone } : g);
    setGoals({ ...goals, [col]: updated });
  };

  const openAddModal = (col) => {
    setActiveCol(col);
    setModalOpen(true);
  };

  const handleSaveGoal = (goalData) => {
    const { list, ...rest } = goalData;
    const newGoal = {
      id: window.crypto.randomUUID(),
      done: false,
      ...rest
    };

    setGoals({
      ...goals,
      [list]: [...goals[list], newGoal]
    });
  };

  const deleteGoal = (col, id) => {
    if (!confirm('Delete this goal?')) return;
    setGoals({ ...goals, [col]: goals[col].filter(g => g.id !== id) });
  };

  const renderColumn = (colKey, title) => (
    <div style={{ flex: 1, minWidth: '220px' }}>
      <h3 style={{ color: 'var(--orange-text)', fontSize: '0.9rem', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {goals[colKey].map(g => (
          <div key={g.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', opacity: g.done ? 0.6 : 1, background: 'var(--bg-card-alt)', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <input
                type="checkbox"
                checked={g.done}
                onChange={() => toggleGoal(colKey, g.id)}
                style={{ marginTop: '4px', cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 500, textDecoration: g.done ? 'line-through' : 'none' }}>{g.text}</div>
                {g.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{g.notes}</div>}
              </div>
              <button onClick={() => deleteGoal(colKey, g.id)} style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginLeft: '24px', flexWrap: 'wrap' }}>
              {g.priority && g.priority !== 'None' && (
                <span className={`pill ${g.priority === 'High' ? 'red' : (g.priority === 'Medium' ? 'orange' : 'blue')}`} style={{ fontSize: '0.65rem' }}>
                  {g.priority}
                </span>
              )}
              {g.hasDate && (
                <span style={{ fontSize: '0.65rem', color: 'var(--blue-text)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  📅 {new Date(g.date).toLocaleDateString()} {g.hasTime ? g.time : ''}
                </span>
              )}
              {g.isUrgent && <span style={{ fontSize: '0.65rem', color: 'var(--red-text)' }}>⚠️ Urgent</span>}
            </div>
          </div>
        ))}
        <button
          onClick={() => openAddModal(colKey)}
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            textAlign: 'left',
            marginTop: '8px',
            padding: '8px',
            borderRadius: '6px',
            border: '1px dashed var(--border-color)',
            width: '100%'
          }}
        >
          + Add goal
        </button>
      </div>
    </div>
  );

  return (
    <div className="premium-container">
      <div className="premium-header-container">
        <div className="premium-icon-wrapper">
          <GoalIcon />
        </div>
        <h1 className="premium-title">Goal Planner</h1>
        <p className="premium-subtitle">Turn goals into clear, manageable actions.<br />Plan what matters weekly, monthly, and yearly.</p>
      </div>

      <div className="notion-block">
        <div className="notion-header">
          📍 Goal planning
        </div>

        <div style={{ padding: '30px', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          {renderColumn('week', 'This week')}
          {renderColumn('month', 'This month')}
          {renderColumn('year', 'This year')}
        </div>
      </div>

      <GoalModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveGoal}
        initialColumn={activeCol}
      />

      <div className="notion-block" style={{ marginTop: '40px', borderTop: '2px solid var(--primary)30' }}>
        <div className="notion-header" style={{ color: 'var(--primary)' }}>
          🏆 Game Achievements
        </div>
        <div style={{ padding: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          {SKILL_DEF.filter(s => skills.includes(s.id)).map(skill => (
            <div key={skill.id} style={{
              background: 'var(--bg-card-alt)',
              padding: '12px 20px',
              borderRadius: '10px',
              border: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '1.5rem' }}>{skill.icon}</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{skill.name}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Skill Unlocked</span>
              </div>
            </div>
          ))}
          {skills.length <= 1 && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No achievements yet. Start unlocking skills!</p>}
        </div>
      </div>
    </div>
  );
}
