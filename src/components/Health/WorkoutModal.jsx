import React, { useState, useEffect } from 'react';
import '../Styles/GoalModal.css';

import { EXERCISE_DATABASE } from '../../constants';

export default function WorkoutModal({ isOpen, onClose, onSave, selectedMuscle, initialData }) {
  const [sessionData, setSessionData] = useState({
    type: '',
    exercises: [],
    notes: ''
  });

  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customEx, setCustomEx] = useState({ name: '', type: 'Custom', sets: 3, reps: '10', description: '', link: '' });

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (initialData) {
      setSessionData(initialData);
    } else if (selectedMuscle && EXERCISE_DATABASE[selectedMuscle]) {
      setSessionData({
        type: `${selectedMuscle.charAt(0).toUpperCase() + selectedMuscle.slice(1)} Session`,
        exercises: EXERCISE_DATABASE[selectedMuscle].map(ex => ({ ...ex, done: true })),
        notes: `Focusing on ${selectedMuscle} group.`
      });
    } else {
      setSessionData({
        type: '',
        exercises: [],
        notes: ''
      });
    }
  }, [selectedMuscle, initialData, isOpen]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!isOpen) return null;

  const handleSave = () => {
    if (!sessionData.type) return;
    onSave({
      ...sessionData,
      id: initialData ? initialData.id : Date.now(),
      date: initialData ? initialData.date : new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      timestamp: initialData ? initialData.timestamp : Date.now()
    });
    onClose();
  };

  const handleAddCustom = () => {
    if (!customEx.name.trim()) return;
    setSessionData({
      ...sessionData,
      exercises: [...sessionData.exercises, { ...customEx, done: true }]
    });
    setCustomEx({ name: '', type: 'Custom', sets: 3, reps: '10', description: '', link: '' });
    setShowCustomForm(false);
  };

  return (
    <div className="mac-modal-overlay" onClick={onClose}>
      <div className="mac-modal" style={{ maxWidth: '550px' }} onClick={(e) => e.stopPropagation()}>
        <div className="mac-modal-header">
          <span>💪</span> {selectedMuscle ? `Train ${selectedMuscle}` : 'Log Workout'}
        </div>

        <div className="mac-modal-content">
          <div className="mac-section-title">Session Info</div>
          <div className="mac-input-group">
            <div className="mac-row">
              <input
                className="mac-input"
                style={{ fontWeight: 600, fontSize: '17px' }}
                placeholder="Workout Title (e.g. Chest Day)"
                value={sessionData.type}
                onChange={(e) => setSessionData({ ...sessionData, type: e.target.value })}
              />
            </div>
          </div>

          <div className="mac-section-title">Exercises & Recommendations</div>
          <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '15px' }}>
            {sessionData.exercises.length > 0 ? (
              sessionData.exercises.map((ex, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '10px',
                  marginBottom: '8px',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {ex.name}
                      {ex.type && (
                        <span style={{
                          fontSize: '0.65rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'rgba(var(--primary-rgb), 0.2)',
                          color: 'var(--primary)'
                        }}>
                          {ex.type}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{ex.sets} Sets × {ex.reps} Reps</div>

                    {ex.description && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', opacity: 0.85, marginTop: '5px', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px' }}>
                        <strong>How To:</strong> {ex.description}
                      </div>
                    )}
                    {ex.link && (
                      <a href={ex.link} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none', display: 'inline-block', marginTop: '5px' }}>
                        🔗 Watch Tutorial / Reference
                      </a>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={ex.done}
                    style={{ marginTop: '5px' }}
                    onChange={() => {
                      const newExs = [...sessionData.exercises];
                      newExs[idx].done = !newExs[idx].done;
                      setSessionData({ ...sessionData, exercises: newExs });
                    }}
                  />
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>
                Select a muscle group or add custom exercises below.
              </p>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            {!showCustomForm ? (
              <button
                onClick={() => setShowCustomForm(true)}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--border-color)', color: 'var(--text-main)', width: '100%', padding: '10px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
              >
                + Add Custom Exercise
              </button>
            ) : (
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px', border: '1px solid var(--primary)' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--primary)' }}>New Exercise</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>

                  <input className="mac-input" placeholder="Exercise Name" value={customEx.name} onChange={e => setCustomEx({ ...customEx, name: e.target.value })} />
                  <input className="mac-input" placeholder="Type (e.g. Free Weight)" value={customEx.type} onChange={e => setCustomEx({ ...customEx, type: e.target.value })} />
                  <input className="mac-input" type="text" placeholder="Sets" value={customEx.sets} onChange={e => setCustomEx({ ...customEx, sets: e.target.value })} />
                  <input className="mac-input" placeholder="Reps (e.g. 8-12)" value={customEx.reps} onChange={e => setCustomEx({ ...customEx, reps: e.target.value })} />

                </div>
                <textarea className="mac-input" placeholder="How to perform this exercise (Description)" value={customEx.description} onChange={e => setCustomEx({ ...customEx, description: e.target.value })} style={{ height: '60px', marginBottom: '10px', resize: 'none' }} />
                <input className="mac-input" placeholder="Link to video/guide (https://...)" value={customEx.link} onChange={e => setCustomEx({ ...customEx, link: e.target.value })} style={{ marginBottom: '10px' }} />
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowCustomForm(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                  <button onClick={handleAddCustom} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }} disabled={!customEx.name.trim()}>Add</button>
                </div>
              </div>
            )}
          </div>

          <div className="mac-section-title">Workout Journal / Notes</div>
          <div className="mac-input-group">
            <div className="mac-row" style={{ minHeight: '80px' }}>
              <textarea
                className="mac-input"
                placeholder="How did you feel? Weight lifted? PRs?"
                value={sessionData.notes}
                onChange={(e) => setSessionData({ ...sessionData, notes: e.target.value })}
                style={{ height: '70px', padding: '10px 0', resize: 'none' }}
              />
            </div>
          </div>
        </div>

        <div className="mac-modal-footer">
          <button className="mac-btn mac-btn-cancel" onClick={onClose}>Abbrechen</button>
          <button
            className="mac-btn mac-btn-add"
            onClick={handleSave}
            disabled={!sessionData.type}
          >
            {initialData ? 'Update Workout' : 'Save Workout'}
          </button>
        </div>
      </div>
    </div>
  );
}
