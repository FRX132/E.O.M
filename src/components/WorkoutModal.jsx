import React, { useState, useEffect } from 'react';
import './Styles/GoalModal.css';

export const EXERCISE_DATABASE = {
  chest: [
    { name: 'Bench Press', type: 'Free Weight', sets: 3, reps: '8-12' },
    { name: 'Incline Dumbbell Press', type: 'Free Weight', sets: 3, reps: '10-12' },
    { name: 'Chest Flyes', type: 'Free Weight', sets: 3, reps: '12-15' },
    { name: 'Pushups', type: 'Bodyweight', sets: 3, reps: 'Until Failure' },
    { name: 'Chest Press Machine', type: 'Machine', sets: 3, reps: '10-12' },
    { name: 'Pec Deck Machine', type: 'Machine', sets: 3, reps: '12-15' },
    { name: 'Cable Crossovers', type: 'Cable', sets: 3, reps: '12-15' }
  ],
  'upper-back': [
    { name: 'Pullups', type: 'Bodyweight', sets: 3, reps: 'Until Failure' },
    { name: 'Bent Over Rows', type: 'Free Weight', sets: 3, reps: '8-10' },
    { name: 'Lat Pulldowns', type: 'Cable', sets: 3, reps: '10-12' },
    { name: 'Seated Cable Row', type: 'Cable', sets: 3, reps: '10-12' },
    { name: 'T-Bar Row Machine', type: 'Machine', sets: 3, reps: '8-10' }
  ],
  'lower-back': [
    { name: 'Deadlifts', type: 'Free Weight', sets: 3, reps: '5-8' },
    { name: 'Hyperextensions', type: 'Bodyweight', sets: 3, reps: '15' },
    { name: 'Back Extension Machine', type: 'Machine', sets: 3, reps: '12-15' }
  ],
  deltoids: [
    { name: 'Overhead Press', type: 'Free Weight', sets: 3, reps: '8-10' },
    { name: 'Lateral Raises', type: 'Free Weight', sets: 3, reps: '15-20' },
    { name: 'Front Raises', type: 'Free Weight', sets: 3, reps: '12-15' },
    { name: 'Rear Delt Flyes', type: 'Free Weight', sets: 3, reps: '12-15' },
    { name: 'Shoulder Press Machine', type: 'Machine', sets: 3, reps: '10-12' },
    { name: 'Cable Lateral Raises', type: 'Cable', sets: 3, reps: '12-15' }
  ],
  biceps: [
    { name: 'Barbell Curls', type: 'Free Weight', sets: 3, reps: '10-12' },
    { name: 'Hammer Curls', type: 'Free Weight', sets: 3, reps: '12' },
    { name: 'Preacher Curls', type: 'Free Weight', sets: 2, reps: '12-15' },
    { name: 'Bicep Curl Machine', type: 'Machine', sets: 3, reps: '10-12' },
    { name: 'Cable Curls', type: 'Cable', sets: 3, reps: '12-15' }
  ],
  triceps: [
    { name: 'Skull Crushers', type: 'Free Weight', sets: 3, reps: '10-12' },
    { name: 'Tricep Pushdowns', type: 'Cable', sets: 3, reps: '12-15' },
    { name: 'Dips', type: 'Bodyweight', sets: 3, reps: 'Until Failure' },
    { name: 'Tricep Extension Machine', type: 'Machine', sets: 3, reps: '10-12' }
  ],
  abs: [
    { name: 'Plank', type: 'Bodyweight', sets: 3, reps: '60s' },
    { name: 'Leg Raises', type: 'Bodyweight', sets: 3, reps: '15-20' },
    { name: 'Crunches', type: 'Bodyweight', sets: 3, reps: '20' },
    { name: 'Ab Crunch Machine', type: 'Machine', sets: 3, reps: '15-20' },
    { name: 'Cable Crunches', type: 'Cable', sets: 3, reps: '15-20' }
  ],
  quadriceps: [
    { name: 'Squats', type: 'Free Weight', sets: 3, reps: '8-10' },
    { name: 'Leg Press', type: 'Machine', sets: 3, reps: '10-12' },
    { name: 'Leg Extensions', type: 'Machine', sets: 3, reps: '15' },
    { name: 'Hack Squat Machine', type: 'Machine', sets: 3, reps: '8-10' }
  ],
  hamstring: [
    { name: 'Stiff Leg Deadlifts', type: 'Free Weight', sets: 3, reps: '10-12' },
    { name: 'Seated Leg Curls', type: 'Machine', sets: 3, reps: '12-15' },
    { name: 'Lying Leg Curls', type: 'Machine', sets: 3, reps: '10-12' }
  ],
  calves: [
    { name: 'Standing Calf Raises', type: 'Free Weight', sets: 4, reps: '15-20' },
    { name: 'Seated Calf Raise Machine', type: 'Machine', sets: 3, reps: '15-20' },
    { name: 'Calf Press on Leg Press Machine', type: 'Machine', sets: 3, reps: '15-20' }
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
