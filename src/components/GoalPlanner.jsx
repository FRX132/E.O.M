import React, { useState } from 'react';
import { useStore } from '../store';
import GoalModal from './GoalModal';
import { SKILL_DEF } from '../constants';

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
    if(!confirm('Delete this goal?')) return;
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
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Goal Planner</h1>
        <p style={{ color: 'var(--text-muted)' }}>Turn goals into clear, manageable actions.<br/>Plan what matters weekly, monthly, and yearly.</p>
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
