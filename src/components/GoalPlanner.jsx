import React from 'react';
import { useStore } from '../store';

const initialGoals = {
  week: [
    { id: 1, text: 'Transfer thoughts to tasks', done: true },
    { id: 2, text: 'Check next week\'s calendar', done: false }
  ],
  month: [
    { id: 3, text: 'Read a book', done: true },
    { id: 4, text: 'Complete 20 tasks', done: false },
    { id: 5, text: 'Attend 10 trainings', done: false }
  ],
  year: [
    { id: 6, text: 'Get a job', done: false },
    { id: 7, text: 'Make research in physics', done: false },
    { id: 8, text: 'Make a new learning habit', done: false }
  ]
};

export default function GoalPlanner() {
  const goals = useStore(state => state.goals);
  const setGoals = useStore(state => state.setGoals);

  const toggleGoal = (col, id) => {
    const updated = goals[col].map(g => g.id === id ? { ...g, done: !g.done } : g);
    setGoals({ ...goals, [col]: updated });
  };

  const addGoal = (col) => {
    const text = prompt('New goal description:');
    if (!text) return;
    const newGoal = { id: Date.now(), text, done: false };
    setGoals({ ...goals, [col]: [...goals[col], newGoal] });
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
          <div key={g.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', opacity: g.done ? 0.6 : 1 }}>
            <input 
              type="checkbox" 
              checked={g.done}
              onChange={() => toggleGoal(colKey, g.id)}
              style={{ marginTop: '4px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.85rem', textDecoration: g.done ? 'line-through' : 'none', flex: 1 }}>{g.text}</span>
            <button onClick={() => deleteGoal(colKey, g.id)} style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>✕</button>
          </div>
        ))}
        <button onClick={() => addGoal(colKey)} style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'left', marginTop: '8px' }}>+</button>
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
    </div>
  );
}
