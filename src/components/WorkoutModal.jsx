import React, { useState, useEffect } from 'react';
import './GoalModal.css';

const EXERCISE_DATABASE = {
  chest: [
    { name: 'Bench Press', sets: 3, reps: '8-12' },
    { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12' },
    { name: 'Chest Flyes', sets: 3, reps: '12-15' },
    { name: 'Pushups', sets: 3, reps: 'Until Failure' }
  ],
  'upper-back': [
    { name: 'Pullups', sets: 3, reps: 'Until Failure' },
    { name: 'Bent Over Rows', sets: 3, reps: '8-10' },
    { name: 'Lat Pulldowns', sets: 3, reps: '10-12' }
  ],
  'lower-back': [
    { name: 'Deadlifts', sets: 3, reps: '5-8' },
    { name: 'Hyperextensions', sets: 3, reps: '15' }
  ],
  deltoids: [
    { name: 'Overhead Press', sets: 3, reps: '8-10' },
    { name: 'Lateral Raises', sets: 3, reps: '15-20' },
    { name: 'Front Raises', sets: 3, reps: '12-15' },
    { name: 'Rear Delt Flyes', sets: 3, reps: '12-15' }
  ],
  biceps: [
    { name: 'Barbell Curls', sets: 3, reps: '10-12' },
    { name: 'Hammer Curls', sets: 3, reps: '12' },
    { name: 'Preacher Curls', sets: 2, reps: '12-15' }
  ],
  triceps: [
    { name: 'Skull Crushers', sets: 3, reps: '10-12' },
    { name: 'Tricep Pushdowns', sets: 3, reps: '12-15' },
    { name: 'Dips', sets: 3, reps: 'Until Failure' }
  ],
  abs: [
    { name: 'Plank', sets: 3, reps: '60s' },
    { name: 'Leg Raises', sets: 3, reps: '15-20' },
    { name: 'Crunches', sets: 3, reps: '20' }
  ],
  quadriceps: [
    { name: 'Squats', sets: 3, reps: '8-10' },
    { name: 'Leg Press', sets: 3, reps: '10-12' },
    { name: 'Leg Extensions', sets: 3, reps: '15' }
  ],
  hamstring: [
    { name: 'Stiff Leg Deadlifts', sets: 3, reps: '10-12' },
    { name: 'Leg Curls', sets: 3, reps: '12-15' }
  ],
  calves: [
    { name: 'Standing Calf Raises', sets: 4, reps: '15-20' },
    { name: 'Seated Calf Raises', sets: 3, reps: '15-20' }
  ]
};

export default function WorkoutModal({ isOpen, onClose, onSave, selectedMuscle }) {
  const [sessionData, setSessionData] = useState({
    type: '',
    exercises: [],
    notes: ''
  });

  useEffect(() => {
    if (selectedMuscle && EXERCISE_DATABASE[selectedMuscle]) {
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
  }, [selectedMuscle, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!sessionData.type) return;
    onSave({
      ...sessionData,
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      timestamp: Date.now()
    });
    onClose();
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
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '12px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '10px',
                  marginBottom: '8px',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ex.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ex.sets} Sets × {ex.reps} Reps</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={ex.done} 
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
                Select a muscle group to see recommended exercises.
              </p>
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
            Save Workout
          </button>
        </div>
      </div>
    </div>
  );
}
