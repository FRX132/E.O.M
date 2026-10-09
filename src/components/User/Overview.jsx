import React, { useState, useEffect, useMemo } from 'react';
import '../Styles/Overview.css';
import { useStore } from '../../store';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { calculateRank, SKILL_DEF } from '../../constants';
import { LIFE_RULES } from '../../data/lifeRules';
import { fetchAllNewsArticles } from '../../services/newsService';

export default function Overview({ navigate }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const habits = useStore(state => state.habits) || [];
  const expenses = useStore(state => state.expenses) || [];
  const assets = useStore(state => state.assets) || [];
  const goals = useStore(state => state.goals) || { week: [], month: [], year: [] };
  const fridge = useStore(state => state.fridge) || [];
  const targets = useStore(state => state.targets) || [];
  const books = useStore(state => state.books) || [];
  const movies = useStore(state => state.movies) || [];
  const profile = useStore(state => state.profile) || { username: '', goals: '', heroImage: '' };
  const setProfile = useStore(state => state.setProfile);
  const currency = profile.currencySymbol || '€';
  const overviewSettings = useStore(state => state.overviewSettings);
  const setOverviewSettings = useStore(state => state.setOverviewSettings);

  // Reminders & Habits Integration States
  const timetableBlocks = useStore(state => state.timetableBlocks || []);
  const setTimetableBlocks = useStore(state => state.setTimetableBlocks);
  const habitsDays = useStore(state => state.habits || []);
  const setHabitsDays = useStore(state => state.setHabits);
  const customHabitTemplates = useStore(state => state.customHabitTemplates || []);
  const addXP = useStore(state => state.addXP);
  const updateQuestProgress = useStore(state => state.updateQuestProgress);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [overviewNews, setOverviewNews] = useState([]);
  const [selectedHabitPreview, setSelectedHabitPreview] = useState(null);

  useEffect(() => {
    fetchAllNewsArticles().then(items => {
      if (items && items.length > 0) setOverviewNews(items.slice(0, 4));
    }).catch(() => {});
  }, []);

  const settings = overviewSettings || {
    visibleWidgets: { clock: true, calendar: true, timetable: true, habits: true, finances: true, goals: true, fridge: true, objective: true, rule: true, sync: true, reminders: true, news: true },
    widgetTitles: { clock: "Clock", calendar: "Calendar", timetable: "Today's Timetable", habits: "Daily Habits", finances: "Finances & Wallet", goals: "Active Goals", fridge: "Fridge Status", objective: "Primary Objective", rule: "Daily Rule", sync: "Stats", reminders: "Daily Reminders", news: "Breaking News" },
    visibleStatsBars: { expenses: true, goals: true, habits: true, timetable: true, fridge: true, targets: true, library: true, cinema: true, quests: true }
  };

  const [time, setTime] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [clockStyle, setClockStyle] = useState(0); // 0: 24h with sec, 1: 24h minimal, 2: 12h AM/PM
  const [calendarStyle, setCalendarStyle] = useState(0); // 0: Month Grid, 1: Weekly Strip
  const overviewLayout = settings.layout ?? 0;
  const setOverviewLayout = (newLayout) => {
    const layoutVal = typeof newLayout === 'function' ? newLayout(overviewLayout) : newLayout;
    setOverviewSettings({ ...settings, layout: layoutVal });
  };
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  const LAYOUT_NAMES = ["Default", "Minimal Clean", "Glassmorphism", "Neo-Brutalism"];

  const rankStats = calculateRank(profile.xp || 0);

  const DEFAULT_HERO = "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?fm=jpg&fit=crop&q=80&w=2000";

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large! Please select an image under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Content = reader.result;

      const currentData = localStorage.getItem('life_os_storage') || '';
      const estimatedTotalSize = currentData.length + base64Content.length;

      if (estimatedTotalSize > 4 * 1024 * 1024) {
        alert("⚠️ STORAGE LIMIT REACHED: This image is too large or your database is too full. Please use a smaller image to ensure your data can be saved.");
        return;
      }

      setProfile({ heroImage: base64Content });
    };
    reader.readAsDataURL(file);
    e.target.value = null; // reset input
  };

  const changeMonth = (offset) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate habit progress for today
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayHabitDay = habitsDays.find(d => d.id === todayDateStr) || habitsDays[0];
  const todayHabitsList = todayHabitDay?.habits || [];
  const completedToday = todayHabitsList.filter(h => h && h.done).length;
  const habitXpEarned = completedToday * 50;
  const habitXpMax = todayHabitsList.length * 50;
  const habitProgress = todayHabitsList.length > 0
    ? Math.round((completedToday / todayHabitsList.length) * 100)
    : 0;

  const calcHabitStreak = (habitId) => {
    const sorted = [...habitsDays].sort((a, b) => b.id.localeCompare(a.id));
    let streak = 0;
    for (const day of sorted) {
      const habit = (day.habits || []).find(h => h.id === habitId);
      if (habit?.done) streak++;
      else break;
    }
    return streak;
  };

  const handleDirectHabitToggle = (habitId) => {
    if (!todayHabitDay) return;
    const dateStr = todayHabitDay.id;

    if (habitId.startsWith('quest-')) {
      const skillId = habitId.replace('quest-', '');
      const isAlreadyDone = (todayHabitDay.completedQuests || []).includes(skillId);
      if (isAlreadyDone) return;

      if (updateQuestProgress) updateQuestProgress(skillId);
      addXP(100);
      const updatedDays = habitsDays.map(d => {
        if (d.id !== dateStr) return d;
        const currentCompleted = d.completedQuests || [];
        return { ...d, completedQuests: [...currentCompleted, skillId] };
      });
      setHabitsDays(updatedDays);
      return;
    }

    const habit = todayHabitsList.find(h => h.id === habitId);
    if (!habit) return;

    const points = habit.done ? -50 : 50;
    addXP(points);

    const updatedDays = habitsDays.map(day => {
      if (day.id !== dateStr) return day;
      return {
        ...day,
        habits: day.habits.map(h => h.id === habitId ? { ...h, done: !h.done } : h)
      };
    });
    setHabitsDays(updatedDays);
  };

  // Get today's weekday name in en-US
  const todayDayName = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'long' });
    return formatter.format(new Date());
  }, []);

  const uniqueHabits = useMemo(() => customHabitTemplates, [customHabitTemplates]);

  // Translate weekday to date string
  const getLocalDateOfWeekday = (targetDay) => {
    if (targetDay === 'Daily') {
      const today = new Date();
      const ye = today.getFullYear();
      const mo = String(today.getMonth() + 1).padStart(2, '0');
      const da = String(today.getDate()).padStart(2, '0');
      return `${ye}-${mo}-${da}`;
    }
    const weekdaysOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetIdx = weekdaysOrder.indexOf(targetDay);
    if (targetIdx === -1) return null;
    const now = new Date();
    const currentIdx = now.getDay();
    const diff = targetIdx - currentIdx;
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + diff);
    const ye = targetDate.getFullYear();
    const mo = String(targetDate.getMonth() + 1).padStart(2, '0');
    const da = String(targetDate.getDate()).padStart(2, '0');
    return `${ye}-${mo}-${da}`;
  };

  // Today's Timetable Blocks (all blocks for current day or Daily, sorted chronologically)
  const todayTimetableBlocks = useMemo(() => {
    return (timetableBlocks || [])
      .filter(b => b.day === todayDayName || b.day === 'Daily')
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  }, [timetableBlocks, todayDayName]);

  // Check if a timetable block is completed
  const isBlockCompleted = (block) => {
    if (block.habitId) {
      const dateStr = getLocalDateOfWeekday(block.day);
      if (!dateStr) return false;
      const dayRecord = habitsDays.find(d => d.id === dateStr);
      return !!dayRecord?.habits?.find(h => h.id === block.habitId)?.done;
    }
    return !!block.completed;
  };

  const completedTodayBlocks = todayTimetableBlocks.filter(b => isBlockCompleted(b)).length;
  const timetableProgress = todayTimetableBlocks.length > 0
    ? Math.round((completedTodayBlocks / todayTimetableBlocks.length) * 100)
    : 0;

  // Toggle habit done state from overview card
  const toggleHabitInOverview = (block) => {
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

  // Toggle custom reminder or block done state from overview card
  const toggleReminderInOverview = (block) => {
    const points = block.completed ? -10 : 10;
    addXP(points);
    const updated = timetableBlocks.map(b => b.id === block.id ? { ...b, completed: !b.completed } : b);
    setTimetableBlocks(updated);
  };

  const handleToggleBlockInOverview = (block, e) => {
    if (e) e.stopPropagation();
    if (block.habitId) {
      toggleHabitInOverview(block);
    } else {
      toggleReminderInOverview(block);
    }
  };

  // Calculate monthly expenses
  const monthlyTotal = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  // Calculate total wealth / assets
  const totalWealth = assets.reduce((sum, a) => sum + (a.amount || 0), 0);
  const netWorth = totalWealth - monthlyTotal; // Simplified net worth logic

  // Progress metrics for the 5 databases
  const goalProg = (goals?.week && goals.week.length > 0) ? Math.round((goals.week.filter(g => g.done).length / goals.week.length) * 100) : 0;
  const fridgeProg = fridge.length > 0 ? Math.round((fridge.filter(f => f.status !== 'Not in stock').length / fridge.length) * 100) : 0;
  const expenseProg = totalWealth > 0 ? Math.max(0, Math.round(100 - (monthlyTotal / totalWealth) * 100)) : 100;
  const targetProg = targets.length > 0 ? Math.round((targets.filter(t => t.status === 'Completed').length / targets.length) * 100) : 0;
  const bookProg = books.length > 0 ? Math.round((books.filter(b => b.status === 'Finished').length / books.length) * 100) : 0;
  const movieProg = movies.length > 0 ? Math.round((movies.filter(m => m.status === 'Watched').length / movies.length) * 100) : 0;

  const progressItems = [
    (settings.visibleStatsBars?.expenses !== false) && { label: 'Expense Tracker', pct: expenseProg, color: 'var(--blue-text)' },
    (settings.visibleStatsBars?.goals !== false) && { label: 'Goal Planner', pct: goalProg, color: 'var(--red-text)' },
    (settings.visibleStatsBars?.habits !== false) && { label: 'Habit Tracker', pct: habitProgress, color: 'var(--purple-text)', explicitDisplay: `${habitXpEarned} / ${habitXpMax} XP` },
    (settings.visibleStatsBars?.timetable !== false && todayTimetableBlocks.length > 0) && { label: "Today's Timetable", pct: timetableProgress, color: '#14b8a6', explicitDisplay: `${completedTodayBlocks} / ${todayTimetableBlocks.length}` },
    (settings.visibleStatsBars?.fridge !== false) && { label: 'Fridge Stock', pct: fridgeProg, color: 'var(--green-text)' },
    (settings.visibleStatsBars?.targets !== false) && { label: 'Big Targets', pct: targetProg, color: 'var(--orange-text)' },
    (settings.visibleStatsBars?.library !== false) && { label: 'Library', pct: bookProg, color: '#3182ce' },
    (settings.visibleStatsBars?.cinema !== false) && { label: 'Cinema', pct: movieProg, color: '#e53e3e' },
    // Add Active Quests to synchronization
    ...((settings.visibleStatsBars?.quests !== false ? (useStore.getState().activeQuests || []) : []).map(q => ({
      label: `QUEST: ${q.skillId}`,
      pct: q.progress && q.total ? Math.round((q.progress / q.total) * 100) : 0,
      color: 'var(--primary)',
      explicitDisplay: `${(q.total || 0) - (q.progress || 0)}d left`
    })))
  ].filter(Boolean);

  // Calculate expenses by category for the chart
  const expensesByCategory = expenses.reduce((acc, exp) => {
    if (exp.amount && exp.amount > 0) {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    }
    return acc;
  }, {});

  const chartData = Object.keys(expensesByCategory).map(key => ({
    name: key,
    value: expensesByCategory[key]
  }));

  const COLORS = ['#3b82f6', '#f97316', '#eab308', '#ec4899', '#8b5cf6', '#10b981'];

  // Get top goals
  const activeGoals = goals.week.filter(g => !g.done).slice(0, 3);

  // Get upcoming bills (due in next 7 days)
  const upcomingBills = expenses
    .filter(exp => {
      if (!exp.dueDate) return false;
      const due = new Date(exp.dueDate);
      const now = new Date();
      const diffTime = due - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  // Get low fridge items
  const lowFridge = fridge.filter(f => f.status === 'Not in stock').slice(0, 3);

  // Year Progress Logic
  const year = time.getFullYear();
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const totalDays = isLeapYear ? 366 : 365;

  const start = new Date(year, 0, 0);
  const diff = time - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const dots = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Time formatted values
  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const hours12 = (time.getHours() % 12 || 12).toString().padStart(2, '0');
  const ampm = time.getHours() >= 12 ? 'PM' : 'AM';

  const displayHours = clockStyle === 2 ? hours12 : hours;

  const dateStr = time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Life Rule Selection (Daily rotation)
  const ruleIndex = dayOfYear % LIFE_RULES.length;
  const currentRule = LIFE_RULES[ruleIndex];
  const ruleNumber = ruleIndex + 1;

  // Calendar Render Logic
  const renderCalendar = () => {
    const today = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const gearButton = (
      <button
        onClick={() => setCalendarStyle(s => (s + 1) % 2)}
        style={{ position: 'absolute', top: '-15px', right: '-20px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '5px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s, background 0.2s', zIndex: 10 }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
        title="Toggle Calendar Style"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
          <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z" />
        </svg>
      </button>
    );

    if (calendarStyle === 1) {
      // Weekly strip view
      const currentDay = today.getDay() === 0 ? 6 : today.getDay() - 1; // Mon=0, Sun=6
      const monday = new Date(today);
      monday.setDate(today.getDate() - currentDay);

      const days = [];
      const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();

        days.push(
          <div key={i} className={`cal-day ${isToday ? 'today' : ''}`} style={{ display: 'flex', flexDirection: 'column', padding: '10px 5px', gap: '5px', aspectRatio: 'auto', height: '100%', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{weekdays[i]}</span>
            <span style={{ fontWeight: isToday ? 700 : 500, fontSize: '1.1rem' }}>{d.getDate()}</span>
          </div>
        );
      }

      return (
        <div className="calendar-widget" style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {gearButton}
          <div className="cal-header" style={{ marginBottom: '15px', justifyContent: 'flex-start' }}>
            <h4 style={{ margin: 0 }}>This Week</h4>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', flex: 1 }}>
            {days}
          </div>
        </div>
      );
    }

    // Default Monthly Grid
    const calYear = currentMonth.getFullYear();
    const calMonth = currentMonth.getMonth();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const startDay = firstDay === 0 ? 6 : firstDay - 1; // Mon=0, Sun=6

    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="cal-day empty"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = today.getDate() === i && today.getMonth() === calMonth && today.getFullYear() === calYear;
      days.push(
        <div key={i} className={`cal-day ${isToday ? 'today' : ''}`}>
          {i}
        </div>
      );
    }

    return (
      <div className="calendar-widget" style={{ position: 'relative' }}>
        {gearButton}
        <div className="cal-header">
          <button className="cal-nav" onClick={() => changeMonth(-1)}>‹</button>
          <h4>{monthNames[calMonth]} {calYear}</h4>
          <button className="cal-nav" onClick={() => changeMonth(1)}>›</button>
        </div>
        <div className="cal-weekdays">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => <div key={d} className="cal-weekday">{d}</div>)}
        </div>
        <div className="cal-days">
          {days}
        </div>
      </div>
    );
  };

  // Filter today's reminders (supports specific weekday or Daily)
  const todayReminders = useMemo(() => {
    return timetableBlocks.filter(b => (b.day === todayDayName || b.day === 'Daily') && b.isReminder);
  }, [timetableBlocks, todayDayName]);

  // Helper to get completion status of a reminder
  const getReminderCompletion = (block) => isBlockCompleted(block);

  // Add quick reminder for today from widget input
  const handleAddQuickReminder = (e) => {
    e.preventDefault();
    if (!newReminderTitle.trim()) return;

    const now = new Date();
    const startH = String(now.getHours()).padStart(2, '0');
    const startM = String(now.getMinutes()).padStart(2, '0');
    const endH = String((now.getHours() + 1) % 24).padStart(2, '0');

    const newBlock = {
      id: window.crypto.randomUUID ? window.crypto.randomUUID() : Date.now().toString(),
      title: newReminderTitle.trim(),
      notes: '',
      url: '',
      day: todayDayName,
      startTime: `${startH}:${startM}`,
      endTime: `${endH}:${startM}`,
      color: 'purple',
      habitId: null,
      isReminder: true,
      completed: false
    };

    setTimetableBlocks([...timetableBlocks, newBlock]);
    setNewReminderTitle('');
  };

  return (
    <div className={`overview-container layout-theme-${overviewLayout}`} style={{ position: 'relative' }}>


      <div className="overview-hero">
        <div className="hero-cover">
          <img src={profile.heroImage || DEFAULT_HERO} alt="User Profile Cover Banner" />
          <div className="hero-overlay"></div>
          <label className="change-cover-btn" style={{ opacity: 0.8, cursor: 'pointer' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-camera" viewBox="0 0 16 16">
              <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4z" />
              <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5m0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0" />
            </svg>
            Change Cover
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>
        <div className="hero-content">
          <div className="hero-user">
            <div className="hero-avatar">
              {profile.profilePicture ? (
                <img src={profile.profilePicture} alt="User Profile Avatar" />
              ) : (
                profile.username?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div className="hero-welcome">
              <h1 className="hero-title">
                {profile.username || 'Workspace'}'s <span className="highlight">E.O.M</span>
              </h1>
              <p className="hero-subtitle">
                System Status: <span className="status-badge">Operational</span> • {dateStr}
              </p>
            </div>
          </div>

          <div className="hero-stats">
            <div className="rank-badge-container">
              <div className="rank-label">CURRENT RANK</div>
              <div className="rank-letter">{rankStats.currentRank.rank}</div>
            </div>
            <div className="xp-overview-container">
              <div className="xp-text-row">
                <span className="xp-label">XP STATUS</span>
                <span className="xp-value-text">{profile.xp || 0} / {rankStats.nextRank ? rankStats.nextRank.minXp : 'MAX'}</span>
              </div>
              <div className="xp-bar-outer">
                <div className="xp-bar-inner" style={{ width: `${rankStats.progress}%` }}></div>
              </div>
              <div className="next-rank-text">{rankStats.progress.toFixed(1)}% to RANK {rankStats.nextRank?.rank || 'MAX'}</div>
            </div>
            <div className="hero-stat-item">
              <span className="stat-value">{dayOfYear}</span>
              <span className="stat-label">Day {Math.round((dayOfYear / totalDays) * 100)}% ({totalDays - dayOfYear} Days Remaining)</span>
            </div>
          </div>
        </div>
        <div className="hero-year-progress">
          <div className="hero-dots-grid">
            {dots.map(d => (
              <div
                key={d}
                className={`hero-dot ${d <= dayOfYear ? 'active' : ''}`}
                title={`Day ${d}`}
              />
            ))}
          </div>
        </div>
      </div>

      {settings.visibleWidgets?.sync !== false && (
        <div className="premium-card" style={{ marginBottom: '25px', padding: 0 }}>
          <div className="notion-tabs" style={{ marginBottom: '0', padding: '12px 20px', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
            <div className="notion-header" style={{ padding: 0, background: 'transparent', border: 'none', color: '#fff' }}>
              <span className="card-icon">📊</span>
              {settings.widgetTitles?.sync || "Stats"}
            </div>
          </div>
          <div className="card-content sync-grid">
            {progressItems.map((item, idx) => (
              <div key={idx} className="sync-item">
                <div className="sync-info">
                  <span className="sync-label">{item.label}</span>
                  <span className="sync-value" style={{ color: item.color }}>{item.explicitDisplay || `${item.pct}%`}</span>
                </div>
                <div className="sync-bar-outer">
                  <div className="sync-bar-inner" style={{ width: `${item.pct}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(settings.visibleWidgets?.clock !== false || settings.visibleWidgets?.calendar !== false) && (
        <div className="time-date-row">
          {settings.visibleWidgets?.clock !== false && (
            <div className="overview-card clock-card" style={{ position: 'relative' }}>
              <button
                onClick={() => setClockStyle(s => (s + 1) % 3)}
                style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', transition: 'color 0.2s, background 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                title="Change Clock Style"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
                  <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z" />
                </svg>
              </button>
              <div className="clock-content" style={{ marginTop: '10px' }}>
                <div className="time-display" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
                  {displayHours}<span className="colon">:</span>{minutes}
                  {clockStyle === 0 && <><span className="colon">:</span>{seconds}</>}
                  {clockStyle === 2 && <span style={{ fontSize: '0.4em', marginLeft: '8px', opacity: 0.8 }}>{ampm}</span>}
                </div>
                <div className="date-display">{dateStr}</div>
              </div>
            </div>
          )}

          {settings.visibleWidgets?.calendar !== false && (
            <div className="overview-card calendar-card">
              {renderCalendar()}
            </div>
          )}
        </div>
      )}

      <div className="overview-grid">
        {settings.visibleWidgets?.habits !== false && (
          <div className="overview-card habit-card">
            <div className="card-header" style={{ justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="card-icon" style={{ color: 'var(--purple-text)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-check2-circle" viewBox="0 0 16 16">
                    <path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0"/>
                    <path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0z"/>
                  </svg>
                </span>
                <div>
                  <h3 style={{ margin: 0 }}>{settings.widgetTitles?.habits || "Daily Habits"}</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {completedToday} of {todayHabitsList.length} completed • +{habitXpEarned} XP
                  </div>
                </div>
              </div>
              <div style={{
                background: 'rgba(168, 85, 247, 0.12)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--purple-text)'
              }}>
                {habitProgress}%
              </div>
            </div>

            <div className="habit-widget-content">
              <div className="habit-progress-bar-bg">
                <div className="habit-progress-bar-fill" style={{ width: `${habitProgress}%` }}></div>
              </div>

              <ul className="habit-tasks-list">
                {todayHabitsList.map(habit => {
                  const isDone = !!habit.done;
                  const streak = calcHabitStreak(habit.id);
                  const isQuest = habit.id.startsWith('quest-');

                  return (
                    <li
                      key={habit.id}
                      className={`habit-task-item ${isDone ? 'is-completed' : ''}`}
                      onClick={() => setSelectedHabitPreview(habit)}
                      title="Click to view habit details & description"
                    >
                      <input
                        type="checkbox"
                        className="habit-task-checkbox"
                        checked={isDone}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDirectHabitToggle(habit.id);
                        }}
                        onChange={() => {}}
                      />
                      <span className="habit-task-name" title={habit.name}>
                        {habit.name}
                      </span>
                      {streak > 0 && (
                        <span className={`habit-task-streak ${streak >= 3 ? 'hot' : 'normal'}`}>
                          {streak >= 3 ? '🔥 ' : ''}{streak}d
                        </span>
                      )}
                      <span className={`habit-task-xp ${isDone ? 'earned' : 'pending'}`}>
                        {isQuest ? '+100 XP' : '+50 XP'}
                      </span>
                    </li>
                  );
                })}
                {todayHabitsList.length === 0 && (
                  <li className="empty-msg" style={{ padding: '20px 0' }}>
                    No habits scheduled for today.
                  </li>
                )}
              </ul>
            </div>
            <button className="card-action" onClick={() => navigate('/habits')}>Open Habit Tracker</button>
          </div>
        )}

        {settings.visibleWidgets?.timetable !== false && (
          <div className="overview-card timetable-card">
            <div className="card-header" style={{ justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="card-icon" style={{ color: '#14b8a6' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-calendar3" viewBox="0 0 16 16">
                    <path d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM1 3.857C1 3.384 1.448 3 2 3h12c.552 0 1 .384 1 .857v10.286c0 .473-.448.857-1 .857H2c-.552 0-1-.384-1-.857V3.857z"/>
                    <path d="M6.5 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                  </svg>
                </span>
                <div>
                  <h3 style={{ margin: 0 }}>{settings.widgetTitles?.timetable || "Today's Timetable"}</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {todayDayName} • {completedTodayBlocks} of {todayTimetableBlocks.length} completed
                  </div>
                </div>
              </div>
              <div style={{
                background: 'rgba(20, 184, 166, 0.12)',
                border: '1px solid rgba(20, 184, 166, 0.3)',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#14b8a6'
              }}>
                {todayTimetableBlocks.length > 0 ? `${timetableProgress}%` : todayDayName}
              </div>
            </div>

            <div className="timetable-widget-content">
              {todayTimetableBlocks.length > 0 && (
                <div className="timetable-progress-bar-bg">
                  <div className="timetable-progress-bar-fill" style={{ width: `${timetableProgress}%` }}></div>
                </div>
              )}

              <ul className="timetable-overview-list">
                {todayTimetableBlocks.map(block => {
                  const isDone = isBlockCompleted(block);
                  const linkedHabitName = block.habitId ? uniqueHabits.find(h => h.id === block.habitId)?.name || 'Linked Habit' : null;
                  const colorClass = block.color ? `color-${block.color}` : 'color-teal';

                  return (
                    <li
                      key={block.id}
                      className={`timetable-overview-item ${colorClass} ${isDone ? 'is-completed' : ''}`}
                      onClick={() => navigate('/timetable')}
                      title={block.notes ? `${block.title}\n${block.notes}` : block.title}
                    >
                      <input
                        type="checkbox"
                        className="timetable-overview-checkbox"
                        checked={isDone}
                        onClick={(e) => handleToggleBlockInOverview(block, e)}
                        onChange={() => {}}
                      />
                      <div className="timetable-overview-time-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" fill="currentColor" viewBox="0 0 16 16" style={{ opacity: 0.7 }}>
                          <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
                          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                        </svg>
                        <span>{block.startTime || 'All Day'}{block.endTime ? ` - ${block.endTime}` : ''}</span>
                      </div>
                      <div className="timetable-overview-info">
                        <span className="timetable-overview-title">{block.title}</span>
                        {linkedHabitName && (
                          <span className="timetable-overview-habit-tag">
                            ⭐ {linkedHabitName}
                          </span>
                        )}
                        {block.notes && (
                          <span className="timetable-overview-notes">{block.notes}</span>
                        )}
                      </div>
                      {block.url && (
                        <a
                          href={block.url.startsWith('http') ? block.url : `https://${block.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="timetable-overview-link"
                          onClick={(e) => e.stopPropagation()}
                          title="Open Link"
                        >
                          ↗
                        </a>
                      )}
                    </li>
                  );
                })}
                {todayTimetableBlocks.length === 0 && (
                  <div className="timetable-empty-overview">
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      No time blocks scheduled for today ({todayDayName}).
                    </p>
                    <button
                      className="mac-btn mac-btn-add"
                      style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                      onClick={() => navigate('/timetable')}
                    >
                      + Schedule {todayDayName}
                    </button>
                  </div>
                )}
              </ul>
            </div>

            <button className="card-action" onClick={() => navigate('/timetable')}>Open Timetable</button>
          </div>
        )}

        {settings.visibleWidgets?.finances !== false && (
          <div className="overview-card finance-card">
            <div className="card-header">
              <span className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-wallet" viewBox="0 0 16 16">
                  <path d="M0 3a2 2 0 0 1 2-2h13.5a.5.5 0 0 1 0 1H15v2a1 1 0 0 1 1 1v8.5a1.5 1.5 0 0 1-1.5 1.5h-12A2.5 2.5 0 0 1 0 12.5V3zm1 1.732V12.5A1.5 1.5 0 0 0 2.5 14h12a.5.5 0 0 0 .5-.5V5H2a1.99 1.99 0 0 1-1-.268zM1 3a1 1 0 0 0 1 1h12V2H2a1 1 0 0 0-1 1z" />
                </svg>
              </span>
              <h3>{settings.widgetTitles?.finances || "Finances & Wallet"}</h3>
            </div>
            <div className="card-content finance-content">
              <div className="finance-stats">
                <div className="expense-stat">
                  <span className="total-amount">{currency}{totalWealth.toLocaleString()}</span>
                  <span className="stat-label">Total Assets</span>
                </div>
                <div className="recent-expenses">
                  <div className="mini-expense">
                    <span>Net Worth</span>
                    <span className="mini-amount" style={{ color: netWorth >= 0 ? 'var(--green-text)' : 'var(--red-text)' }}>
                      {currency}{netWorth.toLocaleString()}
                    </span>
                  </div>
                  <div className="mini-expense">
                    <span>Total Expenses</span>
                    <span className="mini-amount" style={{ color: 'var(--red-text)' }}>-{currency}{monthlyTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              {isMounted && chartData.length > 0 && (
                <div className="finance-chart-container">
                  <ResponsiveContainer width="100%" height={200} minWidth={0} minHeight={0}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius="60%"
                        outerRadius="90%"
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => `${currency}${value.toLocaleString()}`}
                        contentStyle={{
                          backgroundColor: 'rgba(20,20,20,0.8)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#fff',
                          backdropFilter: 'blur(10px)'
                        }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <button className="card-action" onClick={() => navigate('/expenses')}>Manage Finances</button>
          </div>
        )}

        {settings.visibleWidgets?.goals !== false && (
          <div className="overview-card goals-card">
            <div className="card-header">
              <span className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-geo-alt" viewBox="0 0 16 16">
                  <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A32 32 0 0 1 8 14.58a32 32 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10" />
                  <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
                </svg>
              </span>
              <h3>{settings.widgetTitles?.goals || "Active Goals"}</h3>
            </div>
            <div className="card-content">
              <ul className="mini-list">
                {activeGoals.map(goal => (
                  <li key={goal.id}>
                    <span className="bullet">○</span>
                    {goal.text}
                  </li>
                ))}
                {activeGoals.length === 0 && <li className="empty-msg">All weekly goals done!</li>}
              </ul>
            </div>
            <button className="card-action" onClick={() => navigate('/goals')}>Plan Goals</button>
          </div>
        )}

        {settings.visibleWidgets?.fridge !== false && (
          <div className="overview-card fridge-card">
            <div className="card-header">
              <span className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-fork-knife" viewBox="0 0 16 16">
                  <path d="M13 .5c0-.276-.226-.506-.498-.465-1.703.257-2.94 2.012-3 8.462a.5.5 0 0 0 .498.5c.56.01 1 .13 1 1.003v5.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5zM4.25 0a.25.25 0 0 1 .25.25v5.122a.128.128 0 0 0 .256.006l.233-5.14A.25.25 0 0 1 5.24 0h.522a.25.25 0 0 1 .25.238l.233 5.14a.128.128 0 0 0 .256-.006V.25A.25.25 0 0 1 6.75 0h.29a.5.5 0 0 1 .498.458l.423 5.07a1.69 1.69 0 0 1-1.059 1.711l-.053.022a.92.92 0 0 0-.58.884L6.47 15a.971.971 0 1 1-1.942 0l.202-6.855a.92.92 0 0 0-.58-.884l-.053-.022a1.69 1.69 0 0 1-1.059-1.712L3.462.458A.5.5 0 0 1 3.96 0z" />
                </svg>
              </span>
              <h3>{settings.widgetTitles?.fridge || "Fridge Status"}</h3>
            </div>
            <div className="card-content">
              <ul className="mini-list">
                {lowFridge.map(item => (
                  <li key={item.id} className="low-stock">
                    <span className="bullet">✕</span>
                    {item.name}
                  </li>
                ))}
                {lowFridge.length === 0 && <li className="empty-msg">Everything in stock!</li>}
              </ul>
            </div>
            <button className="card-action" onClick={() => navigate('/fridge')}>Review Stock</button>
          </div>
        )}

        {settings.visibleWidgets?.reminders !== false && (
          <div className="overview-card reminders-card">
            <div className="card-header">
              <span className="card-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-check-square" viewBox="0 0 16 16" style={{ color: 'var(--primary)' }}>
                  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                  <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.235.235 0 0 1 .02-.022z"/>
                </svg>
              </span>
              <h3>{settings.widgetTitles?.reminders || "Daily Reminders"}</h3>
            </div>
            <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <form onSubmit={handleAddQuickReminder} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="New reminder..."
                  value={newReminderTitle}
                  onChange={e => setNewReminderTitle(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'var(--bg-card-alt)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    color: 'var(--text-main)',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: 'var(--primary)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    padding: '0 12px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}
                >
                  Add
                </button>
              </form>

              <ul className="mini-list" style={{ flex: 1, overflowY: 'auto', maxHeight: '180px', display: 'flex', flexDirection: 'column', gap: '8px', margin: 0, padding: 0, listStyle: 'none' }}>
                {todayReminders.map(block => {
                  const isCompleted = getReminderCompletion(block);
                  return (
                    <li
                      key={block.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-light)',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onClick={() => block.habitId ? toggleHabitInOverview(block) : toggleReminderInOverview(block)}
                    >
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => {}} // onClick handles toggling
                        style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                      />
                      <span style={{
                        fontSize: '0.82rem',
                        color: isCompleted ? 'var(--text-muted)' : 'var(--text-main)',
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        flex: 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {block.title}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {block.startTime}
                      </span>
                    </li>
                  );
                })}
                {todayReminders.length === 0 && (
                  <li className="empty-msg" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '20px 0' }}>
                    No reminders scheduled for today.
                  </li>
                )}
              </ul>
            </div>
            <button className="card-action" onClick={() => navigate('/timetable')}>View Schedule</button>
          </div>
        )}

        {settings.visibleWidgets?.news !== false && (
          <div className="overview-card news-card">
            <div className="card-header">
              <span className="card-icon" style={{ color: 'var(--primary)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M0 2.5A1.5 1.5 0 0 1 1.5 1h11A1.5 1.5 0 0 1 14 2.5v10.528c0 .3-.05.654-.238.972h.738a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 1 1 0v9a1.5 1.5 0 0 1-1.5 1.5H1.497A1.497 1.497 0 0 1 0 13.5zM12 14c.37 0 .654-.211.855-.455L13 13.316V2.5a.5.5 0 0 0-.5-.5h-11a.5.5 0 0 0-.5.5v11c0 .278.223.5.497.5z"/>
                  <path d="M2 3h10v2H2zm0 3h4v3H2zm0 4h4v1H2zm0 2h4v1H2zm5-6h5v1H7zm0 2h5v1H7zm0 2h5v1H7zm0 2h5v1H7z"/>
                </svg>
              </span>
              <h3>{settings.widgetTitles?.news || "Breaking News"}</h3>
            </div>
            <div className="card-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {overviewNews.slice(0, 3).map((item, idx) => (
                  <div
                    key={`overview-news-${item.id || idx}`}
                    onClick={() => navigate('/news')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s, background 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(var(--primary-rgb), 0.08)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
                  >
                    <span style={{ fontSize: '0.7rem', background: 'rgba(var(--primary-rgb), 0.15)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {item.source || 'News'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <button className="card-action" onClick={() => navigate('/news')}>Zum News Hub ➔</button>
          </div>
        )}

        {upcomingBills.length > 0 && (
          <div className="overview-card bill-alert-card scale-in" style={{ border: '1px solid rgba(var(--primary-rgb), 0.3)', background: 'rgba(var(--primary-rgb), 0.05)' }}>
            <div className="card-header">
              <span className="card-icon" style={{ color: 'var(--primary)' }}>🔔</span>
              <h3 style={{ color: 'var(--primary)' }}>Upcoming Bills</h3>
            </div>
            <div className="card-content">
              <ul className="mini-list">
                {upcomingBills.map(bill => {
                  const daysLeft = Math.ceil((new Date(bill.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <li key={bill.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{bill.name}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.8rem', opacity: 0.8 }}>
                        {daysLeft === 0 ? 'DUE TODAY' : `In ${daysLeft}d`} • {currency}{bill.amount}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <button className="card-action" style={{ background: 'var(--primary)', color: '#fff' }} onClick={() => navigate('/expenses')}>Handle Payments</button>
          </div>
        )}
      </div>

      {(settings.visibleWidgets?.objective !== false || settings.visibleWidgets?.rule !== false) && (
        <div className="overview-footer-grid">
          {settings.visibleWidgets?.objective !== false && (
            <div className="overview-card objective-card">
              <div className="card-header">
                <span className="card-icon">🎯</span>
                <h3>{settings.widgetTitles?.objective || "Primary Objective"}</h3>
              </div>
              <div className="card-content">
                <p className="objective-text">
                  {profile.goals?.split('\n')[0] || "No objective set."}
                </p>
              </div>
            </div>
          )}

          {settings.visibleWidgets?.rule !== false && (
            <div className="overview-card rule-card">
              <div className="card-header">
                <span className="card-icon">📜</span>
                <h3>{settings.widgetTitles?.rule || "Daily Rule"}</h3>
              </div>
              <div className="card-content">
                <div className="rule-badge">Life Rule #{ruleNumber}</div>
                <p className="rule-text">
                  {currentRule}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Theme & Customization Toggle - Moved to Bottom Center */}
      <div className="overview-controls-bottom" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '30px', paddingBottom: '20px' }}>
        <button
          onClick={() => setOverviewLayout(s => (s + 1) % 4)}
          className="overview-control-btn"
        >
          <span>🎨</span> {LAYOUT_NAMES[overviewLayout]}
        </button>

        <button
          onClick={() => setIsCustomizeOpen(true)}
          className="overview-control-btn"
        >
          <span>⚙️</span> Customize Page
        </button>
      </div>

      {/* Customize Panel Modal Overlay */}
      {isCustomizeOpen && (
        <div className="mac-modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', zIndex: 10000 }} onClick={() => setIsCustomizeOpen(false)}>
          <div className="mac-modal" style={{ width: '560px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="mac-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontWeight: 700 }}>⚙️ Customize Overview Dashboard</span>
              <button onClick={() => setIsCustomizeOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '15px' }}>Widget Visibility & Titles</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { key: 'clock', label: 'Clock Widget', defaultTitle: 'Clock' },
                  { key: 'calendar', label: 'Calendar Widget', defaultTitle: 'Calendar' },
                  { key: 'sync', label: 'Stats Widget', defaultTitle: 'Stats' },
                  { key: 'timetable', label: "Today's Timetable Card", defaultTitle: "Today's Timetable" },
                  { key: 'habits', label: 'Daily Habits Card', defaultTitle: 'Daily Habits' },
                  { key: 'finances', label: 'Finances & Wallet Card', defaultTitle: 'Finances & Wallet' },
                  { key: 'goals', label: 'Active Goals Card', defaultTitle: 'Active Goals' },
                  { key: 'fridge', label: 'Fridge Status Card', defaultTitle: 'Fridge Status' },
                  { key: 'objective', label: 'Primary Objective Card', defaultTitle: 'Primary Objective' },
                  { key: 'rule', label: 'Daily Rule Card', defaultTitle: 'Daily Rule' },
                  { key: 'reminders', label: 'Daily Reminders Card', defaultTitle: 'Daily Reminders' },
                  { key: 'news', label: 'Breaking News Card', defaultTitle: 'Breaking News' }
                ].map(widget => (
                  <div key={widget.key} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'var(--bg-card-alt)', padding: '10px 15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <label className="mac-switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px', flexShrink: 0 }}>
                      <input
                        type="checkbox"
                        checked={settings.visibleWidgets?.[widget.key] !== false}
                        onChange={(e) => {
                          const newVisible = { ...settings.visibleWidgets, [widget.key]: e.target.checked };
                          setOverviewSettings({ ...settings, visibleWidgets: newVisible });
                        }}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span className="mac-slider" style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: settings.visibleWidgets?.[widget.key] !== false ? 'var(--primary)' : '#444',
                        transition: '0.4s',
                        borderRadius: '34px'
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '""',
                          height: '16px',
                          width: '16px',
                          left: '3px',
                          bottom: '3px',
                          backgroundColor: 'white',
                          transition: '0.4s',
                          borderRadius: '50%',
                          transform: settings.visibleWidgets?.[widget.key] !== false ? 'translateX(18px)' : 'translateX(0)'
                        }}></span>
                      </span>
                    </label>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{widget.label}</div>
                      <input
                        className="mac-input"
                        style={{ borderBottom: '1px solid var(--border-light)', padding: '4px 0', fontSize: '0.9rem', color: 'var(--text-main)', width: '100%', background: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', outline: 'none' }}
                        value={settings.widgetTitles?.[widget.key] ?? widget.defaultTitle}
                        onChange={(e) => {
                          const newTitles = { ...settings.widgetTitles, [widget.key]: e.target.value };
                          setOverviewSettings({ ...settings, widgetTitles: newTitles });
                        }}
                        placeholder={widget.defaultTitle}
                        disabled={settings.visibleWidgets?.[widget.key] === false}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginTop: '25px', marginBottom: '15px' }}>Stats Progress Bars Visibility</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
                {[
                  { key: 'expenses', label: 'Expense Tracker' },
                  { key: 'goals', label: 'Goal Planner' },
                  { key: 'habits', label: 'Habit Tracker' },
                  { key: 'timetable', label: "Today's Timetable" },
                  { key: 'fridge', label: 'Fridge Stock' },
                  { key: 'targets', label: 'Big Targets' },
                  { key: 'library', label: 'Library' },
                  { key: 'cinema', label: 'Cinema' },
                  { key: 'quests', label: 'Active Quests' }
                ].map(bar => (
                  <div key={bar.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-card-alt)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <label className="mac-switch" style={{ position: 'relative', display: 'inline-block', width: '34px', height: '18px', flexShrink: 0 }}>
                      <input
                        type="checkbox"
                        checked={settings.visibleStatsBars?.[bar.key] !== false}
                        onChange={(e) => {
                          const newVisibleBars = { ...settings.visibleStatsBars, [bar.key]: e.target.checked };
                          setOverviewSettings({ ...settings, visibleStatsBars: newVisibleBars });
                        }}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span className="mac-slider" style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: settings.visibleStatsBars?.[bar.key] !== false ? 'var(--primary)' : '#444',
                        transition: '0.4s',
                        borderRadius: '34px'
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '""',
                          height: '12px',
                          width: '12px',
                          left: '3px',
                          bottom: '3px',
                          backgroundColor: 'white',
                          transition: '0.4s',
                          borderRadius: '50%',
                          transform: settings.visibleStatsBars?.[bar.key] !== false ? 'translateX(16px)' : 'translateX(0)'
                        }}></span>
                      </span>
                    </label>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 500 }}>{bar.label}</span>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginTop: '25px', marginBottom: '15px' }}>Primary Objective Content</div>
              <div className="mac-input-group" style={{ margin: '0', background: 'var(--bg-card-alt)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px' }}>
                <textarea
                  className="mac-input"
                  placeholder="Enter your primary objective..."
                  style={{ resize: 'vertical', minHeight: '60px', width: '100%', border: 'none', background: 'transparent', color: 'var(--text-main)', outline: 'none' }}
                  value={profile.goals || ''}
                  onChange={(e) => setProfile({ goals: e.target.value })}
                />
              </div>
            </div>

            <div className="mac-modal-footer" style={{ display: 'flex', gap: '10px', padding: '16px 20px', borderTop: '1px solid var(--border-color)', justifyContent: 'flex-end' }}>
              <button
                className="mac-btn mac-btn-cancel"
                onClick={() => {
                  if (confirm("Reset overview customization to defaults?")) {
                    setOverviewSettings({
                      layout: 0,
                      visibleWidgets: { clock: true, calendar: true, timetable: true, habits: true, finances: true, goals: true, fridge: true, objective: true, rule: true, sync: true, reminders: true, news: true },
                      widgetTitles: { clock: "Clock", calendar: "Calendar", timetable: "Today's Timetable", habits: "Daily Habits", finances: "Finances & Wallet", goals: "Active Goals", fridge: "Fridge Status", objective: "Primary Objective", rule: "Daily Rule", sync: "Stats", reminders: "Daily Reminders", news: "Breaking News" },
                      visibleStatsBars: { expenses: true, goals: true, habits: true, timetable: true, fridge: true, targets: true, library: true, cinema: true, quests: true }
                    });
                  }
                }}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                Reset to Defaults
              </button>
              <button
                className="mac-btn mac-btn-add"
                onClick={() => setIsCustomizeOpen(false)}
                style={{
                  background: 'var(--primary)',
                  border: 'none',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Habit Preview & Description Modal Overlay */}
      {selectedHabitPreview && (() => {
        const liveHabit = todayHabitsList.find(h => h.id === selectedHabitPreview.id) || selectedHabitPreview;
        const template = customHabitTemplates.find(t => t.id === selectedHabitPreview.id);
        const skillDef = SKILL_DEF.find(s => s.id === selectedHabitPreview.id || s.habit === selectedHabitPreview.name || selectedHabitPreview.id === `quest-${s.id}`);
        const isDone = !!liveHabit.done;
        const isQuest = selectedHabitPreview.id?.startsWith('quest-');
        const streak = calcHabitStreak(selectedHabitPreview.id);
        const description = selectedHabitPreview.notes || template?.notes || skillDef?.quest || (isQuest ? `Daily Quest task to unlock ${skillDef?.name || 'Skill'}. Complete this routine to build mastery.` : 'Daily discipline habit to build consistency and elevate performance state.');

        return (
          <div
            className="mac-modal-overlay"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(10px)',
              zIndex: 10000,
              padding: '20px'
            }}
            onClick={() => setSelectedHabitPreview(null)}
          >
            <div
              className="mac-modal"
              style={{
                width: '480px',
                maxWidth: '92vw',
                background: 'var(--bg-card)',
                borderRadius: '16px',
                border: isDone ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden'
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--bg-card-alt)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.5rem' }}>{skillDef?.icon || '✨'}</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 700 }}>
                      {liveHabit.name}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {skillDef?.category || (template?.repeat ? `${template.repeat} Habit` : 'Daily Routine')}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedHabitPreview(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.3rem', cursor: 'pointer', lineHeight: 1 }}
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Stats Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: streak >= 3 ? '#f97316' : 'var(--text-main)' }}>
                      {streak >= 3 ? '🔥 ' : ''}{streak} {streak === 1 ? 'Day' : 'Days'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px' }}>Current Streak</div>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: isDone ? 'var(--green-text)' : 'var(--purple-text)' }}>
                      {isDone ? 'Completed' : (isQuest ? '+100 XP' : '+50 XP')}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                      {isDone ? 'Earned' : 'Status'}
                    </div>
                  </div>
                </div>

                {/* Description & Notes Section */}
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>
                    Description & Instructions
                  </div>
                  <div style={{
                    background: 'var(--bg-card-alt)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '10px',
                    padding: '14px',
                    fontSize: '0.88rem',
                    lineHeight: '1.55',
                    color: 'var(--text-main)',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {description}
                  </div>
                </div>

                {/* Habit Metadata Tags */}
                {(template?.repeat || template?.streakGoal || skillDef?.xpReq !== undefined) && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {template?.repeat && (
                      <span style={{ fontSize: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-light)', padding: '4px 10px', borderRadius: '6px', color: 'var(--text-muted)' }}>
                        🔄 Frequency: {template.repeat}
                      </span>
                    )}
                    {template?.streakGoal && (
                      <span style={{ fontSize: '0.75rem', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.25)', padding: '4px 10px', borderRadius: '6px', color: '#eab308' }}>
                        🎯 Goal: {template.streakGoal} Days
                      </span>
                    )}
                    {skillDef?.xpReq !== undefined && (
                      <span style={{ fontSize: '0.75rem', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.25)', padding: '4px 10px', borderRadius: '6px', color: 'var(--purple-text)' }}>
                        ⚡ Qualification: {skillDef.xpReq} XP
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--border-color)',
                background: 'var(--bg-card-alt)',
                display: 'flex',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <button
                  onClick={() => {
                    setSelectedHabitPreview(null);
                    navigate('/habits');
                  }}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Open in Tracker ➔
                </button>

                <button
                  onClick={() => handleDirectHabitToggle(liveHabit.id)}
                  style={{
                    background: isDone ? 'rgba(239, 68, 68, 0.15)' : 'var(--primary)',
                    border: isDone ? '1px solid rgba(239, 68, 68, 0.4)' : 'none',
                    color: isDone ? 'var(--red-text)' : '#fff',
                    borderRadius: '8px',
                    padding: '8px 18px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {isDone ? 'Mark as Incomplete' : '✓ Mark as Completed (+50 XP)'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
