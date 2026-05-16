import React from 'react';
import { useStore } from '../../store';

export default function ProfileModal({ isOpen, onClose }) {
  const profile = useStore(state => state.profile);
  const setProfile = useStore(state => state.setProfile);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ [name]: value });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="profile-modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-icon">👤</div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Personal Metrics</h2>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time Biometric Synchronization</p>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="metrics-grid">
            {/* Main Info */}
            <div className="input-group full">
              <label>Display Name</label>
              <input name="username" value={profile.username} onChange={handleChange} placeholder="e.g. Admin" />
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Age</label>
                <input name="age" type="number" value={profile.age} onChange={handleChange} placeholder="25" />
              </div>
              <div className="input-group">
                <label>Gender</label>
                <select name="gender" value={profile.gender} onChange={handleChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Height (cm)</label>
                <input name="height" type="number" value={profile.height} onChange={handleChange} placeholder="180" />
              </div>
              <div className="input-group">
                <label>Weight (kg)</label>
                <input name="weight" type="number" step="0.1" value={profile.weight} onChange={handleChange} placeholder="75.0" />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Target Weight</label>
                <input name="targetWeight" type="number" step="0.1" value={profile.targetWeight || ''} onChange={handleChange} placeholder="70.0" />
              </div>
              <div className="input-group">
                <label>Body Fat %</label>
                <input name="bodyFat" type="number" step="0.1" value={profile.bodyFat || ''} onChange={handleChange} placeholder="15.0" />
              </div>
            </div>

            <div className="input-group full">
              <label>Activity Level</label>
              <select name="activityLevel" value={profile.activityLevel} onChange={handleChange}>
                <option value="Sedentary">Sedentary (Office job)</option>
                <option value="Light">Lightly Active (1-2 days/week)</option>
                <option value="Moderate">Moderately Active (3-5 days/week)</option>
                <option value="VeryActive">Very Active (6-7 days/week)</option>
                <option value="Athlete">Extra Active (Professional athlete)</option>
              </select>
            </div>

            <div className="input-group full">
              <label>Fitness Primary Goal</label>
              <select name="fitnessGoal" value={profile.fitnessGoal} onChange={handleChange}>
                <option value="Lose Weight">Weight Loss / Definition</option>
                <option value="Maintain">Maintenance / Functional</option>
                <option value="Build Muscle">Muscle Gain / Strength</option>
                <option value="Endurance">Endurance / Stamina</option>
              </select>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="confirm-btn" onClick={onClose}>Done</button>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10000;
          animation: modalFadeIn 0.3s ease-out;
        }

        .profile-modal-content {
          background: rgba(15, 15, 20, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          width: 90%;
          max-width: 480px;
          padding: 30px;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255,255,255,0.02);
          position: relative;
          color: white;
          animation: modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modal-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
          position: relative;
        }

        .header-icon {
          width: 44px;
          height: 44px;
          background: var(--primary);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          box-shadow: 0 0 15px rgba(var(--primary-rgb), 0.3);
        }

        .close-btn {
          margin-left: auto;
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 1.8rem;
          cursor: pointer;
          line-height: 1;
        }

        .metrics-grid {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .input-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-group label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .input-group input, .input-group select {
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .input-group input:focus, .input-group select:focus {
          border-color: var(--primary);
          background: rgba(var(--primary-rgb), 0.05);
          outline: none;
          box-shadow: 0 0 10px rgba(var(--primary-rgb), 0.1);
        }

        .modal-footer {
          margin-top: 30px;
          display: flex;
          justify-content: flex-end;
        }

        .confirm-btn {
          background: var(--primary);
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
          box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.3);
        }

        .confirm-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(var(--primary-rgb), 0.4);
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
