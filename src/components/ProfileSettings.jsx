import React, { useState } from 'react';
import { useStore } from '../store';

const initialProfile = {
  username: '@operator_j',
  password: '',
  height: 180,
  weight: 75,
  goals: '1. Build a successful startup\n2. Run a marathon\n3. Read 20 books this year',
  profilePicture: '',
  backgroundImage: ''
};

export default function ProfileSettings() {
  const profile = useStore(state => state.profile);
  const setProfile = useStore(state => state.setProfile);
  const [saveStatus, setSaveStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ [name]: value });
  };

  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large! Please select an image under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile({ [field]: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    // With Zustand persist, it's auto-saved on every keystroke/upload. 
    // We keep the button just for user satisfaction/feedback.
    setSaveStatus('Saved successfully!');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Profile Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your personal details and overarching objectives.</p>
      </div>

      <div className="notion-block" style={{ padding: '30px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          
          {/* Column 1: Personal Data */}
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '20px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              👤 Authentication Cache
            </h3>
            
            <div className="form-group">
              <label className="form-label">Username</label>
              <input 
                name="username"
                className="notion-input" 
                value={profile.username}
                onChange={handleChange}
                placeholder="Enter display name..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vault Password</label>
              <input 
                name="password"
                type="password"
                className="notion-input" 
                value={profile.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Used for securing local data caches.
              </span>
            </div>

            <div className="form-group" style={{ marginTop: '20px' }}>
              <label className="form-label">Personalized Assets</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Profile Picture:</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleImageUpload(e, 'profilePicture')} 
                    style={{ fontSize: '0.8rem', width: '100%' }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Background Image:</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleImageUpload(e, 'backgroundImage')} 
                    style={{ fontSize: '0.8rem', width: '100%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Physical Metrics */}
          <div>
             <h3 style={{ fontSize: '1rem', marginBottom: '20px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚖️ Physical Metrics
            </h3>

            <div className="form-group">
              <label className="form-label">Height (cm)</label>
              <input 
                name="height"
                type="number"
                className="notion-input" 
                value={profile.height}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input 
                name="weight"
                type="number"
                step="0.1"
                className="notion-input" 
                value={profile.weight}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', margin: '30px 0' }}></div>

        {/* Full width: Goals */}
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '20px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🏔️ Life Objectives
          </h3>

          <div className="form-group">
            <label className="form-label">Overarching Goals (Context for Goal Planner)</label>
            <textarea 
              name="goals"
              className="notion-textarea" 
              value={profile.goals}
              onChange={handleChange}
              placeholder="List your ultimate goals here..."
              style={{ minHeight: '120px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '30px' }}>
          <button className="notion-button" onClick={handleSave}>
            Save Configuration
          </button>
          {saveStatus && <span style={{ color: 'var(--green-text)', fontSize: '0.85rem', fontWeight: 600 }}>✓ {saveStatus}</span>}
        </div>

      </div>
    </div>
  );
}
