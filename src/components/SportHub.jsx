import React, { useState } from 'react';
import { useStore } from '../store';
import MuscleMap from './MuscleMap';
import WorkoutModal from './WorkoutModal';

export default function SportHub() {
  const workouts = useStore(state => state.workouts) || [];
  const setWorkouts = useStore(state => state.setWorkouts);
  const theme = useStore(state => state.theme);

  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectMuscle = (muscleId) => {
    setSelectedMuscle(muscleId);
    setIsModalOpen(true);
  };

  const handleSaveWorkout = (newWorkout) => {
    setWorkouts([newWorkout, ...workouts].slice(0, 50)); // Keep last 50
  };

  const deleteWorkout = (id) => {
    if (confirm('Workout löschen?')) {
      setWorkouts(workouts.filter(w => w.id !== id));
    }
  };

  return (
    <div className="notion-block" style={{ padding: '0 20px 40px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 400px', gap: '40px', alignItems: 'start', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Left Side: Interactive Body */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '30px',
          padding: '40px',
          border: '1px solid var(--border-color)',
          textAlign: 'center',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          position: 'sticky',
          top: '20px'
        }}>
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', fontWeight: 800, letterSpacing: '-0.02em' }}>Anatomical Map</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Select a muscle group to view targeting exercises or log a session.
            </p>
          </div>
          
          <MuscleMap 
            onSelectMuscle={handleSelectMuscle} 
            selectedMuscle={selectedMuscle} 
          />
        </div>

        {/* Right Side: Workout Journal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{
             display: 'flex',
             justifyContent: 'space-between',
             alignItems: 'center',
             marginBottom: '10px'
          }}>
             <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Workout Journal</h2>
             <button 
                className="pill blue" 
                style={{ cursor: 'pointer', border: 'none' }}
                onClick={() => {
                  setSelectedMuscle(null);
                  setIsModalOpen(true);
                }}
             >
               Manual Log +
             </button>
          </div>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px',
            maxHeight: '600px',
            overflowY: 'auto',
            paddingRight: '10px'
          }}>
            {workouts.length > 0 ? (
              workouts.map((w) => (
                <div key={w.id} style={{
                  background: 'var(--bg-card)',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid var(--border-light)',
                  position: 'relative',
                  transition: 'transform 0.2s'
                }}
                className="workout-entry"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)' }}>{w.type}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{w.date}</div>
                    </div>
                    <button 
                      onClick={() => deleteWorkout(w.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >✕</button>
                  </div>

                  <p style={{ fontSize: '0.85rem', marginBottom: '15px', color: 'var(--text-main)', opacity: 0.9 }}>
                    {w.notes}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {w.exercises?.filter(ex => ex.done).map((ex, idx) => (
                      <span key={idx} style={{ 
                        fontSize: '0.7rem', 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        {ex.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '100px 40px', 
                color: 'var(--text-muted)',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '20px',
                border: '2px dashed var(--border-color)'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🏃‍♂️</div>
                <div>No workouts logged yet. Start training!</div>
              </div>
            )}
          </div>

        </div>

      </div>

      <WorkoutModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveWorkout}
        selectedMuscle={selectedMuscle}
      />

      <style>{`
        .workout-entry:hover {
          transform: translateX(5px);
          border-color: var(--primary);
        }
        .workout-entry:hover button {
          color: #ff4d4d !important;
        }
        @media (max-width: 1000px) {
          .notion-block > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
