import React, { useState, useEffect } from 'react';
import MarkdownViewer from '../Functions/MarkdownViewer';
import '../Styles/GoalModal.css';

const getDefaultState = (initialColumn) => ({
  id: null,
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

export default function GoalModal({ isOpen, onClose, onSave, initialColumn, initialData }) {
  const [goalData, setGoalData] = useState(() => getDefaultState(initialColumn));

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setGoalData({ ...initialData, list: initialData.list || initialColumn || 'week' });
      } else {
        setGoalData(getDefaultState(initialColumn));
      }
    }
  }, [isOpen, initialData, initialColumn]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!isOpen) return null;

  const handleSave = () => {
    if (!goalData.text) return;
    onSave(goalData);
    setGoalData(getDefaultState());
    onClose();
  };

  return (
    <div className="mac-modal-overlay" onClick={onClose}>
      <div className="mac-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mac-modal-header">
           <span>📍</span> {initialData ? 'Edit Goal' : 'New Goal'}
        </div>

        <div className="mac-modal-content">
          <div className="mac-input-group">
            <div className="mac-row" style={{ minHeight: '60px' }}>
              <input 
                className="mac-input" 
                style={{ fontWeight: 600, fontSize: '17px' }}
                placeholder="Title" 
                value={goalData.text}
                onChange={(e) => setGoalData({ ...goalData, text: e.target.value })}
                autoFocus
              />
            </div>
            <div className="mac-row" style={{ minHeight: '60px' }}>
              <textarea 
                className="mac-input" 
                placeholder="Notes" 
                style={{ resize: 'none', height: '100%', paddingTop: '8px' }}
                value={goalData.notes}
                onChange={(e) => setGoalData({ ...goalData, notes: e.target.value })}
              />
            </div>
            {goalData.notes && (
              <div style={{ padding: '12px 16px', background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', maxHeight: '180px', overflowY: 'auto' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Preview</div>
                <MarkdownViewer content={goalData.notes} />
              </div>
            )}
            <div className="mac-row">
              <input 
                className="mac-input" 
                placeholder="URL" 
                value={goalData.url}
                onChange={(e) => setGoalData({ ...goalData, url: e.target.value })}
              />
            </div>
          </div>

          <div className="mac-section-title">Date & Time</div>
          <div className="mac-input-group">
            <div className="mac-row">
              <span className="mac-row-label">Date</span>
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
              <span className="mac-row-label">Time</span>
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
              <span className="mac-row-label">Urgent</span>
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

          <div className="mac-section-title">Organization</div>
          <div className="mac-input-group">
            <div className="mac-row">
              <span className="mac-row-label">Priority</span>
              <select 
                className="mac-select"
                value={goalData.priority}
                onChange={(e) => setGoalData({ ...goalData, priority: e.target.value })}
              >
                <option value="None">None</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="mac-row">
              <span className="mac-row-label">List</span>
              <select 
                className="mac-select"
                value={goalData.list}
                onChange={(e) => setGoalData({ ...goalData, list: e.target.value })}
              >
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
            </div>
          </div>

          <div className="mac-section-title">XP Progress</div>
          <div className="mac-input-group">
            <div className="mac-row">
              <span className="mac-row-label">Difficulty</span>
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
              <span className="mac-row-label">Time (Minutes)</span>
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
          <button className="mac-btn mac-btn-cancel" onClick={onClose}>Cancel</button>
          <button 
            className="mac-btn mac-btn-add" 
            onClick={handleSave}
            disabled={!goalData.text}
          >
            {initialData ? 'Save' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
