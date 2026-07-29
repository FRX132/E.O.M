import React, { useState, useMemo } from 'react';
import { useStore } from '../../store';

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-clock" viewBox="0 0 16 16">
    <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-calendar3" viewBox="0 0 16 16">
    <path d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM1 3.857C1 3.384 1.448 3 2 3h12c.552 0 1 .384 1 .857v10.286c0 .473-.448.857-1 .857H2c-.552 0-1-.384-1-.857V3.857z"/>
    <path d="M6.5 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
  </svg>
);

const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
    <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z"/>
    <path d="M6.586 10.16A3 3 0 0 0 7.414 10.5l.586-.586a1 1 0 0 0 .154-.199 2 2 0 0 1-.861-3.337L9.12 4.45a2 2 0 1 1 2.83 2.83l-.793.792a4 4 0 0 1 .128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 10.16z"/>
  </svg>
);

const PaletteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
    <path d="M12.433 10.07C14.133 10.585 16 11.15 16 12c0 2.5-4 4-8 4S0 14.5 0 12c0-3.5 3-5.5 6-5.5-.1.1-.1.2-.1.3 0 .7.5 1.2 1.2 1.2.8 0 1.2-.8 1.7-1.2.4-.4.8-.7 1.3-.7a1 1 0 0 1 1 1c0 .4-.2.8-.4 1.1-.3.3-.4.8-.3 1.3z"/>
    <path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4"/>
  </svg>
);

const ChecklistIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3.854 2.146a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708L2 3.293l1.146-1.147a.5.5 0 0 1 .708 0zm0 4a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708L2 7.293l1.146-1.147a.5.5 0 0 1 .708 0zm0 4a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708L2 11.293l1.146-1.147a.5.5 0 0 1 .708 0z"/>
  </svg>
);

const CalendarHeaderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
    <path d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM1 3.857C1 3.384 1.448 3 2 3h12c.552 0 1 .384 1 .857v10.286c0 .473-.448.857-1 .857H2c-.552 0-1-.384-1-.857V3.857z"/>
    <path d="M6.5 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
  </svg>
);

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const COLORS = ['blue', 'green', 'orange', 'purple', 'pink', 'yellow', 'red'];

// Helper to get local YYYY-MM-DD date for a weekday in the current week
function getLocalDateOfWeekday(dayName) {
  const weekdayMapping = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6
  };
  const targetIndex = weekdayMapping[dayName];
  if (targetIndex === undefined) return null;

  const today = new Date();
  const currentDayIndex = today.getDay(); // 0-6

  let diff = targetIndex - currentDayIndex;
  
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + diff);
  return targetDate.toISOString().split('T')[0];
}

export default function Timetable() {
  const timetableBlocks = useStore(state => state.timetableBlocks || []);
  const setTimetableBlocks = useStore(state => state.setTimetableBlocks);
  const habitsDays = useStore(state => state.habits || []);
  const setHabitsDays = useStore(state => state.setHabits);
  const addXP = useStore(state => state.addXP);
  const customHabitTemplates = useStore(state => state.customHabitTemplates || []);

  // Get active habits from templates list to populate dropdown
  const uniqueHabits = useMemo(() => {
    return customHabitTemplates;
  }, [customHabitTemplates]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null); // null means adding a new block
  const [modalTab, setModalTab] = useState('event'); // 'event' or 'reminder'

  // Form inputs
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [url, setUrl] = useState('');
  const [day, setDay] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [color, setColor] = useState('blue');
  const [habitId, setHabitId] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDays, setSelectedDays] = useState(['Monday']);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [editConfirmation, setEditConfirmation] = useState(null);

  // Get today's weekday name
  const todayDayName = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'long' });
    return formatter.format(new Date());
  }, []);

  // Check if habit is completed for a block's weekday
  const getHabitCompletionStatus = (block) => {
    if (!block.habitId) return false;
    const dateStr = getLocalDateOfWeekday(block.day);
    if (!dateStr) return false;
    const dayRecord = habitsDays.find(d => d.id === dateStr);
    if (!dayRecord) return false;
    const habit = dayRecord.habits.find(h => h.id === block.habitId);
    return habit ? habit.done : false;
  };

  // Toggle habit done state from timetable card
  const handleToggleHabit = (block, e) => {
    e.stopPropagation();
    if (!block.habitId) return;

    const dateStr = getLocalDateOfWeekday(block.day);
    if (!dateStr) return;

    const dayRecord = habitsDays.find(d => d.id === dateStr);
    if (!dayRecord) return;

    const habit = dayRecord.habits.find(h => h.id === block.habitId);
    if (!habit) return;

    // Toggle XP
    const points = habit.done ? -50 : 50;
    addXP(points);

    // Update habits in store
    const updatedDays = habitsDays.map(day => {
      if (day.id !== dateStr) return day;
      return {
        ...day,
        habits: day.habits.map(h => h.id === block.habitId ? { ...h, done: !h.done } : h)
      };
    });
    setHabitsDays(updatedDays);
  };

  // Toggle custom reminder done state from timetable card
  const handleToggleReminder = (block, e) => {
    e.stopPropagation();
    // Toggle XP (+10 for simple reminder completion!)
    const points = block.completed ? -10 : 10;
    addXP(points);
    const updated = timetableBlocks.map(b => b.id === block.id ? { ...b, completed: !b.completed } : b);
    setTimetableBlocks(updated);
  };

  // Open modal for adding
  const handleOpenAdd = (selectedDay = 'Monday') => {
    setEditingBlock(null);
    setModalTab('event');
    setTitle('');
    setNotes('');
    setUrl('');
    setDay(selectedDay);
    setIsRecurring(false);
    setSelectedDays([selectedDay]);
    setStartTime('09:00');
    setEndTime('10:00');
    setColor('blue');
    setHabitId('');
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (block, e) => {
    e.stopPropagation();
    setEditingBlock(block);
    setModalTab(block.isReminder ? 'reminder' : 'event');
    setTitle(block.title);
    setNotes(block.notes || '');
    setUrl(block.url || '');
    setDay(block.day);
    setIsRecurring(false);
    setSelectedDays([block.day]);
    setStartTime(block.startTime);
    setEndTime(block.endTime);
    setColor(block.color);
    setHabitId(block.habitId || '');
    setIsModalOpen(true);
  };

  // Save Add/Edit
  const handleSave = (e) => {
    e.preventDefault();
    
    let finalTitle = title.trim();
    let finalHabitId = habitId;
    const isReminder = modalTab === 'reminder';

    if (isReminder) {
      if (!finalTitle && !finalHabitId) {
        alert('Please enter a title or link a habit!');
        return;
      }
      if (!finalTitle) {
        finalTitle = uniqueHabits.find(h => h.id === finalHabitId)?.name || 'Reminder';
      }
    } else {
      finalHabitId = null;
      if (!finalTitle) {
        alert('Please enter a title!');
        return;
      }
    }

    if (editingBlock) {
      // Edit
      if (editingBlock.recurringGroupId) {
        setEditConfirmation({
          block: editingBlock,
          fields: {
            title: finalTitle,
            notes: notes.trim(),
            url: url.trim(),
            day,
            startTime,
            endTime,
            color,
            habitId: finalHabitId || null,
            isReminder
          }
        });
        setIsModalOpen(false);
      } else {
        const updated = timetableBlocks.map(b => b.id === editingBlock.id ? {
          ...b,
          title: finalTitle,
          notes: notes.trim(),
          url: url.trim(),
          day,
          startTime,
          endTime,
          color,
          habitId: finalHabitId || null,
          isReminder,
          completed: b.completed || false
        } : b);
        setTimetableBlocks(updated);
        setIsModalOpen(false);
      }
    } else {
      // Add
      if (isRecurring && selectedDays.length > 0) {
        const recurringGroupId = window.crypto.randomUUID ? window.crypto.randomUUID() : (Date.now().toString() + '-group-' + Math.random());
        const newBlocks = selectedDays.map(d => ({
          id: window.crypto.randomUUID ? window.crypto.randomUUID() : (Date.now().toString() + '-' + Math.random()),
          recurringGroupId,
          title: finalTitle,
          notes: notes.trim(),
          url: url.trim(),
          day: d,
          startTime,
          endTime,
          color,
          habitId: finalHabitId || null,
          isReminder,
          completed: false
        }));
        setTimetableBlocks([...timetableBlocks, ...newBlocks]);
      } else {
        const newBlock = {
          id: window.crypto.randomUUID ? window.crypto.randomUUID() : Date.now().toString(),
          title: finalTitle,
          notes: notes.trim(),
          url: url.trim(),
          day,
          startTime,
          endTime,
          color,
          habitId: finalHabitId || null,
          isReminder,
          completed: false
        };
        setTimetableBlocks([...timetableBlocks, newBlock]);
      }
      setIsModalOpen(false);
    }
  };

  // Delete block
  const handleDelete = (block, e) => {
    e.stopPropagation();
    if (block.recurringGroupId) {
      setDeleteConfirmation(block);
    } else {
      if (confirm('Are you sure you want to delete this schedule block?')) {
        setTimetableBlocks(timetableBlocks.filter(b => b.id !== block.id));
      }
    }
  };

  // Confirm handlers for recurring edit
  const handleConfirmEditAll = () => {
    if (!editConfirmation) return;
    const { block, fields } = editConfirmation;
    const updated = timetableBlocks.map(b => {
      if (b.recurringGroupId === block.recurringGroupId) {
        return {
          ...b,
          title: fields.title,
          notes: fields.notes,
          url: fields.url,
          startTime: fields.startTime,
          endTime: fields.endTime,
          color: fields.color,
          habitId: fields.habitId,
          isReminder: fields.isReminder
        };
      }
      return b;
    });
    setTimetableBlocks(updated);
    setEditConfirmation(null);
  };

  const handleConfirmEditOnlyThis = () => {
    if (!editConfirmation) return;
    const { block, fields } = editConfirmation;
    const updated = timetableBlocks.map(b => b.id === block.id ? {
      ...b,
      ...fields,
      completed: b.completed || false
    } : b);
    setTimetableBlocks(updated);
    setEditConfirmation(null);
  };

  const handleCancelEditConfirmation = () => {
    if (!editConfirmation) return;
    setEditConfirmation(null);
    setIsModalOpen(true);
  };

  // Group and sort blocks by day
  const blocksByDay = useMemo(() => {
    const groups = {};
    WEEKDAYS.forEach(wd => {
      groups[wd] = timetableBlocks
        .filter(b => b.day === wd)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return groups;
  }, [timetableBlocks]);

  return (
    <div className="timetable-wrapper">
      <div className="timetable-actions">
        <div className="premium-header-container" style={{ margin: 0 }}>
          <div className="premium-icon-wrapper" style={{ background: 'rgba(var(--primary-rgb), 0.15)', color: 'var(--primary)' }}>
            <CalendarHeaderIcon />
          </div>
          <div>
            <h1 className="premium-title">Timetable</h1>
            <p className="premium-subtitle">Plan your days, structure your week, and schedule habits</p>
          </div>
        </div>
        <button className="mac-btn mac-btn-add" onClick={() => handleOpenAdd()}>
          + Add Time Block
        </button>
      </div>

      <div className="timetable-grid">
        {WEEKDAYS.map(weekday => {
          const blocks = blocksByDay[weekday] || [];
          const isToday = weekday === todayDayName;

          return (
            <div key={weekday} className={`timetable-column ${isToday ? 'today' : ''}`}>
              <div className="timetable-column-header">
                <span>{weekday}</span>
                {isToday && <span className="today-badge">Today</span>}
              </div>

              <div className="timetable-blocks-list">
                {blocks.map(block => {
                  const isCompleted = getHabitCompletionStatus(block);
                  const linkedHabitName = block.habitId ? uniqueHabits.find(h => h.id === block.habitId)?.name || 'Linked Habit' : null;

                  return (
                    <div key={block.id} className={`timetable-block-card color-${block.color}`} onClick={(e) => handleOpenEdit(block, e)}>
                      <div className="timetable-block-time">
                        <ClockIcon /> {block.startTime} - {block.endTime}
                      </div>
                      <div className="timetable-block-title">
                        {block.title}
                      </div>

                      {block.notes && (
                        <div className="timetable-block-notes">
                          {block.notes}
                        </div>
                      )}

                      {block.url && (
                        <a
                          href={block.url.startsWith('http') ? block.url : `https://${block.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="timetable-block-url"
                          onClick={e => e.stopPropagation()}
                        >
                          <LinkIcon /> Link
                        </a>
                      )}

                      {block.habitId ? (
                        <div
                          className={`timetable-block-habit-link ${isCompleted ? 'completed' : ''}`}
                          onClick={(e) => handleToggleHabit(block, e)}
                          title={isCompleted ? "Habit done! Click to mark incomplete." : "Click to mark habit as done!"}
                        >
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={(e) => handleToggleHabit(block, e)}
                          />
                          <span style={{ textDecoration: isCompleted ? 'line-through' : 'none', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {linkedHabitName}
                          </span>
                        </div>
                      ) : block.isReminder ? (
                        <div
                          className={`timetable-block-habit-link ${block.completed ? 'completed' : ''}`}
                          onClick={(e) => handleToggleReminder(block, e)}
                          title={block.completed ? "Reminder completed! Click to mark incomplete." : "Click to mark as completed!"}
                        >
                          <input
                            type="checkbox"
                            checked={!!block.completed}
                            onChange={(e) => handleToggleReminder(block, e)}
                          />
                          <span style={{ textDecoration: block.completed ? 'line-through' : 'none', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            Erledigt
                          </span>
                        </div>
                      ) : null}

                      <div className="timetable-block-footer">
                        <button className="timetable-block-action-btn edit" onClick={(e) => handleOpenEdit(block, e)} title="Edit Block">
                          ✏️
                        </button>
                        <button className="timetable-block-action-btn delete" onClick={(e) => handleDelete(block, e)} title="Delete Block">
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}

                {blocks.length === 0 && (
                  <div className="timetable-empty-state" onClick={() => handleOpenAdd(weekday)}>
                    + Click to plan
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* macOS/iOS Grouped Settings Modal */}
      {isModalOpen && (
        <div className="timetable-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="timetable-modal-content" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSave} className="mac-modal-form">
              
              {/* Ereignis / Erinnerung Segmented Tab Selector */}
              <div style={{
                display: 'flex',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '3px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }} className="mac-modal-tab-selector">
                <button
                  type="button"
                  onClick={() => setModalTab('event')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    background: modalTab === 'event' ? 'var(--primary)' : 'transparent',
                    color: '#ffffff',
                    opacity: modalTab === 'event' ? 1 : 0.6,
                    transition: 'all 0.2s'
                  }}
                >
                  Ereignis
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('reminder')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    background: modalTab === 'reminder' ? 'var(--primary)' : 'transparent',
                    color: '#ffffff',
                    opacity: modalTab === 'reminder' ? 1 : 0.6,
                    transition: 'all 0.2s'
                  }}
                >
                  Erinnerung
                </button>
              </div>

              {/* Header text inputs in a single iOS-like card block */}
              <div className="mac-text-fields-group">
                {modalTab === 'event' ? (
                  <input
                    type="text"
                    required
                    className="mac-title-input"
                    placeholder="Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                ) : (
                  <div className="mac-row" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <span className="mac-row-label" style={{ fontSize: '0.95rem' }}>
                      <ChecklistIcon /> Habit to Link
                    </span>
                    <div className="mac-row-control">
                      <select 
                        required
                        className="mac-select" 
                        value={habitId} 
                        onChange={e => {
                          setHabitId(e.target.value);
                          // Default title to habit name if not set
                          const selectedName = uniqueHabits.find(h => h.id === e.target.value)?.name || '';
                          if (!title) {
                            setTitle(selectedName);
                          }
                        }}
                      >
                        <option value="" disabled>Select habit...</option>
                        {uniqueHabits.map(h => (
                          <option key={h.id} value={h.id}>{h.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                
                {modalTab === 'reminder' && (
                  <input
                    type="text"
                    className="mac-title-input"
                    placeholder="Custom Reminder Title (Optional)"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                )}

                <textarea
                  className="mac-notes-textarea"
                  placeholder="Notes"
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
                <input
                  type="text"
                  className="mac-url-input"
                  placeholder="URL"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                />
              </div>

              {/* Group 1: Datum & Uhrzeit */}
              <div className="mac-group">
                <div className="mac-group-title">Datum & Uhrzeit</div>
                <div className="mac-group-list">
                  {!editingBlock && (
                    <div className="mac-row">
                      <span className="mac-row-label">
                        <CalendarIcon /> Wiederholend
                      </span>
                      <div className="mac-row-control">
                        <label className="mac-switch">
                          <input
                            type="checkbox"
                            className="mac-switch-checkbox"
                            checked={isRecurring}
                            onChange={e => {
                              const checked = e.target.checked;
                              setIsRecurring(checked);
                              if (checked) {
                                setSelectedDays(prev => prev.includes(day) ? prev : [...prev, day]);
                              } else {
                                setSelectedDays([day]);
                              }
                            }}
                          />
                          <span className="mac-switch-slider"></span>
                        </label>
                      </div>
                    </div>
                  )}

                  {(!editingBlock && isRecurring) ? (
                    <div className="mac-row mac-row-vertical">
                      <span className="mac-row-label" style={{ marginBottom: '8px' }}>
                        Wiederholen an:
                      </span>
                      <div className="mac-weekday-selector">
                        {WEEKDAYS.map(w => {
                          const isSelected = selectedDays.includes(w);
                          const shortLabelsGerman = {
                            'Monday': 'Mo',
                            'Tuesday': 'Di',
                            'Wednesday': 'Mi',
                            'Thursday': 'Do',
                            'Friday': 'Fr',
                            'Saturday': 'Sa',
                            'Sunday': 'So'
                          };
                          const label = shortLabelsGerman[w] || w.substring(0, 2);
                          return (
                            <button
                              key={w}
                              type="button"
                              className={`mac-weekday-pill ${isSelected ? 'active' : ''}`}
                              onClick={() => {
                                setSelectedDays(prev => 
                                  prev.includes(w)
                                    ? (prev.length > 1 ? prev.filter(d => d !== w) : prev)
                                    : [...prev, w]
                                );
                              }}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="mac-row">
                      <span className="mac-row-label">
                        <CalendarIcon /> Weekday
                      </span>
                      <div className="mac-row-control">
                        <select 
                          className="mac-select" 
                          value={day} 
                          onChange={e => {
                            setDay(e.target.value);
                            setSelectedDays([e.target.value]);
                          }}
                        >
                          {WEEKDAYS.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                  <div className="mac-row">
                    <span className="mac-row-label">
                      <ClockIcon /> Start Time
                    </span>
                    <div className="mac-row-control">
                      <input
                        type="time"
                        required
                        className="mac-time-input"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mac-row">
                    <span className="mac-row-label">
                      <ClockIcon /> End Time
                    </span>
                    <div className="mac-row-control">
                      <input
                        type="time"
                        required
                        className="mac-time-input"
                        value={endTime}
                        onChange={e => setEndTime(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Group 2: Organisation */}
              <div className="mac-group">
                <div className="mac-group-title">Organisation</div>
                <div className="mac-group-list">
                  <div className="mac-row">
                    <span className="mac-row-label">
                      <PaletteIcon /> Color
                    </span>
                    <div className="mac-row-control">
                      <div className="mac-color-picker">
                        {COLORS.map(c => (
                          <div
                            key={c}
                            className={`mac-color-circle ${c} ${color === c ? 'selected' : ''}`}
                            onClick={() => setColor(c)}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer action buttons */}
              <div className="mac-footer-actions" style={{ margin: '20px -20px -20px', padding: '16px 20px' }}>
                <button type="button" className="mac-btn-cancel" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="mac-btn-save">
                  {editingBlock ? 'Save' : 'Add'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* macOS Confirm Delete Dialog */}
      {deleteConfirmation && (
        <div className="timetable-modal-backdrop" onClick={() => setDeleteConfirmation(null)}>
          <div className="timetable-modal-content mac-confirm-dialog" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h3 className="mac-confirm-title">
                Wiederkehrende Aufgabe löschen
              </h3>
              <p className="mac-confirm-text">
                Möchtest du nur diese einzelne Aufgabe oder alle wiederkehrenden Aufgaben dieser Serie löschen?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  className="mac-btn-confirm-choice danger"
                  onClick={() => {
                    setTimetableBlocks(timetableBlocks.filter(b => b.recurringGroupId !== deleteConfirmation.recurringGroupId));
                    setDeleteConfirmation(null);
                  }}
                >
                  Alle Vorkommen löschen
                </button>
                <button
                  type="button"
                  className="mac-btn-confirm-choice secondary"
                  onClick={() => {
                    setTimetableBlocks(timetableBlocks.filter(b => b.id !== deleteConfirmation.id));
                    setDeleteConfirmation(null);
                  }}
                >
                  Nur dieses Vorkommen löschen
                </button>
                <button
                  type="button"
                  className="mac-btn-confirm-choice text"
                  onClick={() => setDeleteConfirmation(null)}
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* macOS Confirm Edit Dialog */}
      {editConfirmation && (
        <div className="timetable-modal-backdrop" onClick={handleCancelEditConfirmation}>
          <div className="timetable-modal-content mac-confirm-dialog" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h3 className="mac-confirm-title">
                Wiederkehrende Aufgabe bearbeiten
              </h3>
              <p className="mac-confirm-text">
                Möchtest du nur diese einzelne Aufgabe oder alle wiederkehrenden Aufgaben dieser Serie ändern?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  className="mac-btn-confirm-choice primary"
                  onClick={handleConfirmEditAll}
                >
                  Alle Vorkommen ändern
                </button>
                <button
                  type="button"
                  className="mac-btn-confirm-choice secondary"
                  onClick={handleConfirmEditOnlyThis}
                >
                  Nur dieses Vorkommen ändern
                </button>
                <button
                  type="button"
                  className="mac-btn-confirm-choice text"
                  onClick={handleCancelEditConfirmation}
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
