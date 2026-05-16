import React, { useState } from 'react';
import '../Styles/GoalModal.css';

export default function GoalModal({ isOpen, onClose, onSave, initialColumn }) {
  const [goalData, setGoalData] = useState({
    text: '',
    notes: '',
    url: '',
    hasDate: false,
    date: new Date().toISOString().split('T')[0],
    hasTime: false,
    time: '12:00',
    isUrgent: false,
    priority: 'None',
    difficulty: 'Easy',
    minutes: 10,
    list: initialColumn || 'week'
  });

  if (!isOpen) return null;

  const handleSave = () => {
    if (!goalData.text) return;
    onSave(goalData);
    setGoalData({
      text: '',
      notes: '',
      url: '',
      hasDate: false,
      date: new Date().toISOString().split('T')[0],
      hasTime: false,
      time: '12:00',
      isUrgent: false,
      priority: 'None',
      difficulty: 'Easy',
      minutes: 10,
      list: initialColumn || 'week'
    });
    onClose();
  };

  return (
    <div className="mac-modal-overlay" onClick={onClose}>
      <div className="mac-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mac-modal-header">
          <span>📍</span> New Goal
        </div>

        <div className="mac-modal-content">
          <div className="mac-input-group">
            <div className="mac-row" style={{ minHeight: '60px' }}>
              <input 
                className="mac-input" 
                style={{ fontWeight: 600, fontSize: '17px' }}
                placeholder="Titel" 
                value={goalData.text}
                onChange={(e) => setGoalData({ ...goalData, text: e.target.value })}
                autoFocus
              />
            </div>
            <div className="mac-row" style={{ minHeight: '60px' }}>
              <textarea 
                className="mac-input" 
                placeholder="Notizen" 
                style={{ resize: 'none', height: '100%', paddingTop: '8px' }}
                value={goalData.notes}
                onChange={(e) => setGoalData({ ...goalData, notes: e.target.value })}
              />
            </div>
            <div className="mac-row">
              <input 
                className="mac-input" 
                placeholder="URL" 
                value={goalData.url}
                onChange={(e) => setGoalData({ ...goalData, url: e.target.value })}
              />
            </div>
          </div>

          <div className="mac-section-title">Datum & Uhrzeit</div>
          <div className="mac-input-group">
            <div className="mac-row">
              <span className="mac-row-label">Datum</span>
              <label className="mac-switch">
                <input 
                  type="checkbox" 
                  checked={goalData.hasDate}
                  onChange={(e) => setGoalData({ ...goalData, hasDate: e.target.checked })}
                />
                <span className="mac-slider"></span>
              </label>
            </div>
            {goalData.hasDate && (
              <div className="mac-row">
                <input 
                  type="date" 
                  className="mac-input" 
                  style={{ textAlign: 'right' }}
                  value={goalData.date}
                  onChange={(e) => setGoalData({ ...goalData, date: e.target.value })}
                />
              </div>
            )}
            <div className="mac-row">
              <span className="mac-row-label">Uhrzeit</span>
              <label className="mac-switch">
                <input 
                  type="checkbox" 
                  checked={goalData.hasTime}
                  onChange={(e) => setGoalData({ ...goalData, hasTime: e.target.checked })}
                />
                <span className="mac-slider"></span>
              </label>
            </div>
            {goalData.hasTime && (
              <div className="mac-row">
                <input 
                  type="time" 
                  className="mac-input" 
                  style={{ textAlign: 'right' }}
                  value={goalData.time}
                  onChange={(e) => setGoalData({ ...goalData, time: e.target.value })}
                />
              </div>
            )}
            <div className="mac-row">
              <span className="mac-row-label">Dringend</span>
              <label className="mac-switch">
                <input 
                  type="checkbox" 
                  checked={goalData.isUrgent}
                  onChange={(e) => setGoalData({ ...goalData, isUrgent: e.target.checked })}
                />
                <span className="mac-slider"></span>
              </label>
            </div>
          </div>

          <div className="mac-section-title">Organisation</div>
          <div className="mac-input-group">
            <div className="mac-row">
              <span className="mac-row-label">Priorität</span>
              <select 
                className="mac-select"
                value={goalData.priority}
                onChange={(e) => setGoalData({ ...goalData, priority: e.target.value })}
              >
                <option value="None">Ohne</option>
                <option value="Low">Niedrig</option>
                <option value="Medium">Mittel</option>
                <option value="High">Hoch</option>
              </select>
            </div>
            <div className="mac-row">
              <span className="mac-row-label">Liste</span>
              <select 
                className="mac-select"
                value={goalData.list}
                onChange={(e) => setGoalData({ ...goalData, list: e.target.value })}
              >
                <option value="week">Woche</option>
                <option value="month">Monat</option>
                <option value="year">Jahr</option>
              </select>
            </div>
          </div>

          <div className="mac-section-title">XP - Fortschritt</div>
          <div className="mac-input-group">
            <div className="mac-row">
              <span className="mac-row-label">Schwierigkeit</span>
              <select 
                className="mac-select"
                value={goalData.difficulty}
                onChange={(e) => setGoalData({ ...goalData, difficulty: e.target.value })}
              >
                <option value="Easy">Easy (10 XP)</option>
                <option value="Medium">Medium (20 XP)</option>
                <option value="Hard">Hard (50 XP)</option>
                <option value="Super Hard">Super Hard (100 XP)</option>
              </select>
            </div>
            <div className="mac-row">
              <span className="mac-row-label">Zeit (Minuten)</span>
              <input 
                type="number"
                className="mac-input" 
                style={{ textAlign: 'right' }}
                value={goalData.minutes}
                onChange={(e) => setGoalData({ ...goalData, minutes: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>

        <div className="mac-modal-footer">
          <button className="mac-btn mac-btn-cancel" onClick={onClose}>Abbrechen</button>
          <button 
            className="mac-btn mac-btn-add" 
            onClick={handleSave}
            disabled={!goalData.text}
          >
            Hinzufügen
          </button>
        </div>
      </div>
    </div>
  );
}
