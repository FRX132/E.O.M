import React, { useState, useEffect, useMemo, useRef } from 'react';
import '../Styles/Overview.css';
import { useStore } from '../../store';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { calculateRank, SKILL_DEF } from '../../constants';
import { LIFE_RULES } from '../../data/lifeRules';
import { fetchAllNewsArticles } from '../../services/newsService';

// Default Quick Links for Launchpad
const DEFAULT_QUICK_LINKS = [
  { id: '1', title: 'GitHub', url: 'https://github.com', icon: '🐙' },
  { id: '2', title: 'ChatGPT', url: 'https://chatgpt.com', icon: '🤖' },
  { id: '3', title: 'YouTube', url: 'https://youtube.com', icon: '▶️' },
  { id: '4', title: 'Google', url: 'https://google.com', icon: '🌐' }
];

// All available widgets metadata
const ALL_WIDGET_CONFIGS = [
  { key: 'timetable', label: "Today's Timetable", defaultTitle: "Today's Timetable", icon: '📅', color: '#14b8a6' },
  { key: 'habits', label: 'Daily Habits', defaultTitle: 'Daily Habits', icon: '✨', color: '#a855f7' },
  { key: 'pomodoro', label: 'Focus Pomodoro Timer', defaultTitle: 'Focus Timer', icon: '⏱️', color: '#ef4444' },
  { key: 'notes', label: 'Quick Scratchpad', defaultTitle: 'Quick Notes', icon: '📝', color: '#eab308' },
  { key: 'finances', label: 'Finances & Wallet', defaultTitle: 'Finances & Wallet', icon: '💳', color: '#3b82f6' },
  { key: 'goals', label: 'Active Goals', defaultTitle: 'Active Goals', icon: '🎯', color: '#ef4444' },
  { key: 'fridge', label: 'Fridge Status', defaultTitle: 'Fridge Status', icon: '🥗', color: '#10b981' },
  { key: 'quicklinks', label: 'Launchpad / Quick Links', defaultTitle: 'Quick Links', icon: '⚡', color: '#06b6d4' },
  { key: 'workout', label: 'Next Workout', defaultTitle: 'Sport & Workout', icon: '🏋️', color: '#f97316' },
  { key: 'trading', label: 'Market Watchlist', defaultTitle: 'Crypto & Markets', icon: '📈', color: '#10b981' },
  { key: 'media', label: 'Media Tracker', defaultTitle: 'Books & Cinema', icon: '🎬', color: '#8b5cf6' },
  { key: 'mood', label: 'Daily Reflection & Mood', defaultTitle: 'Daily Mood', icon: '🧠', color: '#ec4899' },
  { key: 'reminders', label: 'Daily Reminders', defaultTitle: 'Daily Reminders', icon: '🔔', color: '#6366f1' },
  { key: 'news', label: 'Breaking News', defaultTitle: 'Breaking News', icon: '📰', color: '#3b82f6' },
  { key: 'objective', label: 'Primary Objective', defaultTitle: 'Primary Objective', icon: '🏆', color: '#f59e0b' },
  { key: 'rule', label: 'Daily Life Rule', defaultTitle: 'Daily Rule', icon: '📜', color: '#8b5cf6' }
];

// Presets
const DASHBOARD_PRESETS = [
  { id: 'all', label: '🌟 All-in-One', desc: 'Complete view with all enabled widgets' },
  { id: 'focus', label: '🎯 Deep Work', desc: 'Focus on schedule, timer, notes and key goals', widgets: ['timetable', 'pomodoro', 'notes', 'goals', 'habits', 'quicklinks', 'objective'] },
  { id: 'health', label: '🧘 Health & Routine', desc: 'Habits, workout, fridge nutrition and reflection', widgets: ['timetable', 'habits', 'workout', 'fridge', 'mood', 'rule'] },
  { id: 'finance', label: '📊 Finance & Markets', desc: 'Net worth, expenses breakdown, markets and breaking news', widgets: ['finances', 'trading', 'news', 'goals', 'quicklinks'] },
  { id: 'minimal', label: '⚡ Minimalist', desc: 'Clean, distraction-free view with essentials', widgets: ['timetable', 'habits', 'notes', 'objective'] }
];

const DEFAULT_ORDER = [
  'timetable', 'habits', 'pomodoro', 'notes', 'finances', 'goals',
  'fridge', 'quicklinks', 'workout', 'trading', 'media', 'mood',
  'reminders', 'news', 'objective', 'rule'
];

export default function Overview({ navigate }) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Store Selectors
  const habits = useStore(state => state.habits) || [];
  const expenses = useStore(state => state.expenses) || [];
  const assets = useStore(state => state.assets) || [];
  const goals = useStore(state => state.goals) || { week: [], month: [], year: [] };
  const fridge = useStore(state => state.fridge) || [];
  const targets = useStore(state => state.targets) || [];
  const books = useStore(state => state.books) || [];
  const movies = useStore(state => state.movies) || [];
  const workouts = useStore(state => state.workouts) || [];
  const watchlist = useStore(state => state.watchlist) || [];
  const profile = useStore(state => state.profile) || { username: '', goals: '', heroImage: '' };
  const setProfile = useStore(state => state.setProfile);
  const currency = profile.currencySymbol || '€';
  const overviewSettings = useStore(state => state.overviewSettings);
  const setOverviewSettings = useStore(state => state.setOverviewSettings);

  // Timetable & Habits
  const timetableBlocks = useStore(state => state.timetableBlocks || []);
  const setTimetableBlocks = useStore(state => state.setTimetableBlocks);
  const habitsDays = useStore(state => state.habits || []);
  const setHabitsDays = useStore(state => state.setHabits);
  const customHabitTemplates = useStore(state => state.customHabitTemplates || []);
  const addXP = useStore(state => state.addXP);
  const updateQuestProgress = useStore(state => state.updateQuestProgress);

  // Local Component States
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [overviewNews, setOverviewNews] = useState([]);
  const [selectedHabitPreview, setSelectedHabitPreview] = useState(null);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [customizeTab, setCustomizeTab] = useState('widgets'); // 'widgets' | 'appearance' | 'stats'
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkIcon, setNewLinkIcon] = useState('🔗');

  // Pomodoro Local State
  const [pomoMode, setPomoMode] = useState('focus'); // 'focus' (25m) | 'short' (5m) | 'long' (15m)
  const [pomoSeconds, setPomoSeconds] = useState(25 * 60);
  const [pomoIsActive, setPomoIsActive] = useState(false);
  const [pomoSessions, setPomoSessions] = useState(0);

  // Default Overview Settings Merged
  const settings = useMemo(() => {
    const defaultVisible = {
      clock: true, calendar: true, sync: true, timetable: true, habits: true,
      pomodoro: true, notes: true, finances: true, goals: true, fridge: true,
      quicklinks: true, workout: true, trading: true, media: true, mood: true,
      reminders: false, news: true, objective: true, rule: true
    };
    const defaultTitles = {};
    ALL_WIDGET_CONFIGS.forEach(w => { defaultTitles[w.key] = w.defaultTitle; });
    defaultTitles.clock = "Clock";
    defaultTitles.calendar = "Calendar";
    defaultTitles.sync = "Stats";

    return {
      layout: overviewSettings?.layout ?? 0,
      heroStyle: overviewSettings?.heroStyle ?? 'standard', // 'standard' | 'compact' | 'hidden'
      accentColor: overviewSettings?.accentColor ?? 'default', // 'default' | 'teal' | 'cyan' | 'purple' | 'green' | 'orange' | 'red' | 'gold'
      gridColumns: overviewSettings?.gridColumns ?? 'auto', // 'auto' | '2' | '3'
      statsViewMode: overviewSettings?.statsViewMode ?? 'bars', // 'bars' | 'rings' | 'pills' | 'tiles' | 'collapsed'
      activePreset: overviewSettings?.activePreset ?? 'all',
      isPrivacyMode: !!overviewSettings?.isPrivacyMode,
      scratchpadNotes: overviewSettings?.scratchpadNotes ?? '',
      quickLinks: overviewSettings?.quickLinks ?? DEFAULT_QUICK_LINKS,
      todayMood: overviewSettings?.todayMood ?? null,
      widgetOrder: overviewSettings?.widgetOrder ?? DEFAULT_ORDER,
      widgetSizes: overviewSettings?.widgetSizes ?? {},
      visibleWidgets: { ...defaultVisible, ...(overviewSettings?.visibleWidgets || {}) },
      widgetTitles: { ...defaultTitles, ...(overviewSettings?.widgetTitles || {}) },
      visibleStatsBars: overviewSettings?.visibleStatsBars ?? {
        expenses: true, goals: true, habits: true, timetable: true, fridge: true,
        targets: true, library: true, cinema: true, quests: true
      }
    };
  }, [overviewSettings]);

  // Pomodoro countdown timer
  useEffect(() => {
    let interval = null;
    if (pomoIsActive && pomoSeconds > 0) {
      interval = setInterval(() => setPomoSeconds(s => s - 1), 1000);
    } else if (pomoSeconds === 0 && pomoIsActive) {
      setPomoIsActive(false);
      if (pomoMode === 'focus') {
        setPomoSessions(s => s + 1);
        addXP(25);
        alert('🎉 Focus Session Completed! +25 XP earned. Time for a break!');
        setPomoMode('short');
        setPomoSeconds(5 * 60);
      } else {
        alert('☕ Break finished! Ready to focus again?');
        setPomoMode('focus');
        setPomoSeconds(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [pomoIsActive, pomoSeconds, pomoMode, addXP]);

  const setPomoDuration = (mode) => {
    setPomoIsActive(false);
    setPomoMode(mode);
    if (mode === 'focus') setPomoSeconds(25 * 60);
    else if (mode === 'short') setPomoSeconds(5 * 60);
    else if (mode === 'long') setPomoSeconds(15 * 60);
  };

  // Clock & Calendar
  const [time, setTime] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [clockStyle, setClockStyle] = useState(0); // 0: 24h with sec, 1: 24h minimal, 2: 12h AM/PM
  const [calendarStyle, setCalendarStyle] = useState(0); // 0: Month Grid, 1: Weekly Strip

  const LAYOUT_NAMES = ["Default", "Minimal Clean", "Glassmorphism", "Neo-Brutalism"];
  const rankStats = calculateRank(profile.xp || 0);
  const DEFAULT_HERO = "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?fm=jpg&fit=crop&q=80&w=2000";

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchAllNewsArticles().then(items => {
      if (items && items.length > 0) setOverviewNews(items.slice(0, 4));
    }).catch(() => {});
  }, []);

  // Today's Day Name
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

  // Today's Timetable Blocks
  const todayTimetableBlocks = useMemo(() => {
    return (timetableBlocks || [])
      .filter(b => b.day === todayDayName || b.day === 'Daily')
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  }, [timetableBlocks, todayDayName]);

  // Today's Reminders
  const todayReminders = useMemo(() => {
    return todayTimetableBlocks.filter(b => b.isReminder || b.category === 'reminder');
  }, [todayTimetableBlocks]);

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

  // Toggle timetable block completion
  const handleToggleBlockInOverview = (block, e) => {
    if (e) e.stopPropagation();
    if (block.habitId) {
      const dateStr = getLocalDateOfWeekday(block.day);
      if (!dateStr) return;
      const dayRecord = habitsDays.find(d => d.id === dateStr);
      if (!dayRecord) return;
      const habit = dayRecord.habits.find(h => h.id === block.habitId);
      if (!habit) return;
      addXP(habit.done ? -50 : 50);
      setHabitsDays(habitsDays.map(day => {
        if (day.id !== dateStr) return day;
        return {
          ...day,
          habits: day.habits.map(h => h.id === block.habitId ? { ...h, done: !h.done } : h)
        };
      }));
    } else {
      addXP(block.completed ? -10 : 10);
      setTimetableBlocks(timetableBlocks.map(b => b.id === block.id ? { ...b, completed: !b.completed } : b));
    }
  };

  // Habit Calculations
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
      setHabitsDays(habitsDays.map(d => {
        if (d.id !== dateStr) return d;
        return { ...d, completedQuests: [...(d.completedQuests || []), skillId] };
      }));
      return;
    }

    const habit = todayHabitsList.find(h => h.id === habitId);
    if (!habit) return;
    addXP(habit.done ? -50 : 50);
    setHabitsDays(habitsDays.map(day => {
      if (day.id !== dateStr) return day;
      return {
        ...day,
        habits: day.habits.map(h => h.id === habitId ? { ...h, done: !h.done } : h)
      };
    }));
  };

  // Finances & Net worth
  const monthlyTotal = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const totalWealth = assets.reduce((sum, a) => sum + (a.amount || 0), 0);
  const netWorth = totalWealth - monthlyTotal;

  const formatMoney = (amount) => {
    if (settings.isPrivacyMode) return '•••• ' + currency;
    return `${currency}${amount.toLocaleString()}`;
  };

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
    ...((settings.visibleStatsBars?.quests !== false ? (useStore.getState().activeQuests || []) : []).map(q => ({
      label: `QUEST: ${q.skillId}`,
      pct: q.progress && q.total ? Math.round((q.progress / q.total) * 100) : 0,
      color: 'var(--primary)',
      explicitDisplay: `${(q.total || 0) - (q.progress || 0)}d left`
    })))
  ].filter(Boolean);

  const expensesByCategory = expenses.reduce((acc, exp) => {
    if (exp.amount && exp.amount > 0) acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const chartData = Object.keys(expensesByCategory).map(key => ({ name: key, value: expensesByCategory[key] }));
  const COLORS = ['#3b82f6', '#f97316', '#eab308', '#ec4899', '#8b5cf6', '#10b981'];

  const activeGoals = goals.week.filter(g => !g.done).slice(0, 3);
  const lowFridge = fridge.filter(f => f.status === 'Not in stock').slice(0, 3);

  const upcomingBills = expenses
    .filter(exp => {
      if (!exp.dueDate) return false;
      const due = new Date(exp.dueDate);
      const diffDays = Math.ceil((due - new Date()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  // Year Progress Logic
  const year = time.getFullYear();
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const totalDays = isLeapYear ? 366 : 365;
  const start = new Date(year, 0, 0);
  const dayOfYear = Math.floor((time - start) / (1000 * 60 * 60 * 24));
  const dots = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Time formatted values
  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const hours12 = (time.getHours() % 12 || 12).toString().padStart(2, '0');
  const ampm = time.getHours() >= 12 ? 'PM' : 'AM';
  const displayHours = clockStyle === 2 ? hours12 : hours;
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Life Rule Selection
  const ruleIndex = dayOfYear % LIFE_RULES.length;
  const currentRule = LIFE_RULES[ruleIndex];
  const ruleNumber = ruleIndex + 1;

  // Image Upload handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large! Please select an image under 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile({ heroImage: reader.result });
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const changeMonth = (offset) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  // Add quick reminder
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

  // Add quick link
  const handleAddQuickLink = (e) => {
    e.preventDefault();
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;
    const newLink = {
      id: Date.now().toString(),
      title: newLinkTitle.trim(),
      url: newLinkUrl.trim().startsWith('http') ? newLinkUrl.trim() : `https://${newLinkUrl.trim()}`,
      icon: newLinkIcon || '🔗'
    };
    const updated = [...(settings.quickLinks || []), newLink];
    setOverviewSettings({ ...settings, quickLinks: updated });
    setNewLinkTitle('');
    setNewLinkUrl('');
    setIsAddLinkOpen(false);
  };

  const handleDeleteQuickLink = (linkId, e) => {
    e.stopPropagation();
    e.preventDefault();
    const updated = (settings.quickLinks || []).filter(l => l.id !== linkId);
    setOverviewSettings({ ...settings, quickLinks: updated });
  };

  // Reordering helpers
  const handleMoveWidget = (index, direction) => {
    const currentOrder = [...settings.widgetOrder];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;
    const temp = currentOrder[index];
    currentOrder[index] = currentOrder[targetIndex];
    currentOrder[targetIndex] = temp;
    setOverviewSettings({ ...settings, widgetOrder: currentOrder });
  };

  const handleSetWidgetSize = (widgetKey, size) => {
    const updatedSizes = { ...(settings.widgetSizes || {}), [widgetKey]: size };
    setOverviewSettings({ ...settings, widgetSizes: updatedSizes });
  };

  // Active preset filtering
  const currentPresetDef = DASHBOARD_PRESETS.find(p => p.id === settings.activePreset);
  const activeWidgetList = useMemo(() => {
    let order = settings.widgetOrder || DEFAULT_ORDER;
    // ensure all widgets exist in order
    ALL_WIDGET_CONFIGS.forEach(w => {
      if (!order.includes(w.key)) order = [...order, w.key];
    });

    return order.filter(key => {
      if (settings.visibleWidgets?.[key] === false) return false;
      if (currentPresetDef && currentPresetDef.widgets && !currentPresetDef.widgets.includes(key)) {
        return false;
      }
      return true;
    });
  }, [settings.widgetOrder, settings.visibleWidgets, currentPresetDef]);

  // Calendar renderer
  const renderCalendar = () => {
    const today = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const gearButton = (
      <button
        onClick={() => setCalendarStyle(s => (s + 1) % 2)}
        style={{ position: 'absolute', top: '-15px', right: '-20px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '5px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s, background 0.2s', zIndex: 10 }}
        title="Toggle Calendar Style"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
          <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z" />
        </svg>
      </button>
    );

    if (calendarStyle === 1) {
      const currentDay = today.getDay() === 0 ? 6 : today.getDay() - 1;
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

    const calYear = currentMonth.getFullYear();
    const calMonth = currentMonth.getMonth();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const startDay = firstDay === 0 ? 6 : firstDay - 1;

    const days = [];
    for (let i = 0; i < startDay; i++) days.push(<div key={`empty-${i}`} className="cal-day empty"></div>);
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = today.getDate() === i && today.getMonth() === calMonth && today.getFullYear() === calYear;
      days.push(<div key={i} className={`cal-day ${isToday ? 'today' : ''}`}>{i}</div>);
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
        <div className="cal-days">{days}</div>
      </div>
    );
  };

  // INDIVIDUAL WIDGET RENDERERS
  const renderWidgetContent = (widgetKey) => {
    const size = settings.widgetSizes?.[widgetKey] || 'normal';
    const cardClass = `overview-card ${widgetKey}-card ${size === 'wide' ? 'span-2' : size === 'full' ? 'span-full' : ''}`;

    switch (widgetKey) {
      case 'timetable':
        return (
          <div key={widgetKey} className={cardClass}>
            <div className="card-header" style={{ justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="card-icon" style={{ color: '#14b8a6' }}>📅</span>
                <div>
                  <h3 style={{ margin: 0 }}>{settings.widgetTitles?.timetable || "Today's Timetable"}</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {todayDayName} • {completedTodayBlocks} of {todayTimetableBlocks.length} completed
                  </div>
                </div>
              </div>
              <div style={{ background: 'rgba(20, 184, 166, 0.12)', border: '1px solid rgba(20, 184, 166, 0.3)', borderRadius: '8px', padding: '4px 10px', fontSize: '0.8rem', fontWeight: 700, color: '#14b8a6' }}>
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
                    <li key={block.id} className={`timetable-overview-item ${colorClass} ${isDone ? 'is-completed' : ''}`} onClick={() => navigate('/timetable')} title={block.notes ? `${block.title}\n${block.notes}` : block.title}>
                      <input type="checkbox" className="timetable-overview-checkbox" checked={isDone} onClick={(e) => handleToggleBlockInOverview(block, e)} onChange={() => {}} />
                      <div className="timetable-overview-time-badge">
                        <span>{block.startTime || 'All Day'}{block.endTime ? ` - ${block.endTime}` : ''}</span>
                      </div>
                      <div className="timetable-overview-info">
                        <span className="timetable-overview-title">{block.title}</span>
                        {linkedHabitName && <span className="timetable-overview-habit-tag">⭐ {linkedHabitName}</span>}
                        {block.notes && <span className="timetable-overview-notes">{block.notes}</span>}
                      </div>
                      {block.url && (
                        <a href={block.url.startsWith('http') ? block.url : `https://${block.url}`} target="_blank" rel="noopener noreferrer" className="timetable-overview-link" onClick={(e) => e.stopPropagation()} title="Open Link">↗</a>
                      )}
                    </li>
                  );
                })}
                {todayTimetableBlocks.length === 0 && (
                  <div className="timetable-empty-overview">
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>No time blocks scheduled for today ({todayDayName}).</p>
                    <button className="mac-btn mac-btn-add" style={{ fontSize: '0.78rem', padding: '5px 12px' }} onClick={() => navigate('/timetable')}>+ Schedule {todayDayName}</button>
                  </div>
                )}
              </ul>
            </div>
            <button className="card-action" onClick={() => navigate('/timetable')}>Open Timetable</button>
          </div>
        );

      case 'habits':
        return (
          <div key={widgetKey} className={cardClass}>
            <div className="card-header" style={{ justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="card-icon" style={{ color: 'var(--purple-text)' }}>✨</span>
                <div>
                  <h3 style={{ margin: 0 }}>{settings.widgetTitles?.habits || "Daily Habits"}</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {completedToday} of {todayHabitsList.length} completed • +{habitXpEarned} XP
                  </div>
                </div>
              </div>
              <div style={{ background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '8px', padding: '4px 10px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--purple-text)' }}>
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
                    <li key={habit.id} className={`habit-task-item ${isDone ? 'is-completed' : ''}`} onClick={() => setSelectedHabitPreview(habit)} title="Click to view habit details & description">
                      <input type="checkbox" className="habit-task-checkbox" checked={isDone} onClick={(e) => { e.stopPropagation(); handleDirectHabitToggle(habit.id); }} onChange={() => {}} />
                      <span className="habit-task-name" title={habit.name}>{habit.name}</span>
                      {streak > 0 && <span className={`habit-task-streak ${streak >= 3 ? 'hot' : 'normal'}`}>{streak >= 3 ? '🔥 ' : ''}{streak}d</span>}
                      <span className={`habit-task-xp ${isDone ? 'earned' : 'pending'}`}>{isQuest ? '+100 XP' : '+50 XP'}</span>
                    </li>
                  );
                })}
                {todayHabitsList.length === 0 && <li className="empty-msg" style={{ padding: '20px 0' }}>No habits scheduled for today.</li>}
              </ul>
            </div>
            <button className="card-action" onClick={() => navigate('/habits')}>Open Habit Tracker</button>
          </div>
        );

      case 'pomodoro': {
        const mins = String(Math.floor(pomoSeconds / 60)).padStart(2, '0');
        const secs = String(pomoSeconds % 60).padStart(2, '0');
        return (
          <div key={widgetKey} className={cardClass}>
            <div className="card-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="card-icon" style={{ color: '#ef4444' }}>⏱️</span>
                <h3>{settings.widgetTitles?.pomodoro || "Focus Timer"}</h3>
              </div>
              <span className="pomo-sessions-badge">🍅 {pomoSessions} Done</span>
            </div>
            <div className="pomo-content">
              <div className="pomo-modes">
                <button className={`pomo-mode-btn ${pomoMode === 'focus' ? 'active' : ''}`} onClick={() => setPomoDuration('focus')}>25m Focus</button>
                <button className={`pomo-mode-btn ${pomoMode === 'short' ? 'active' : ''}`} onClick={() => setPomoDuration('short')}>5m Break</button>
                <button className={`pomo-mode-btn ${pomoMode === 'long' ? 'active' : ''}`} onClick={() => setPomoDuration('long')}>15m Rest</button>
              </div>
              <div className="pomo-timer-display">{mins}:{secs}</div>
              <div className="pomo-controls">
                <button className="pomo-main-btn" onClick={() => setPomoIsActive(!pomoIsActive)}>
                  {pomoIsActive ? '⏸ Pause' : '▶ Start Focus'}
                </button>
                <button className="pomo-reset-btn" onClick={() => setPomoDuration(pomoMode)} title="Reset Timer">↺</button>
              </div>
            </div>
          </div>
        );
      }

      case 'notes':
        return (
          <div key={widgetKey} className={cardClass}>
            <div className="card-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="card-icon" style={{ color: '#eab308' }}>📝</span>
                <h3>{settings.widgetTitles?.notes || "Quick Scratchpad"}</h3>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Auto-Saved</span>
            </div>
            <div className="notes-content">
              <textarea
                className="notes-textarea"
                placeholder="Write quick thoughts, draft ideas, or scratch notes here..."
                value={settings.scratchpadNotes}
                onChange={(e) => setOverviewSettings({ ...settings, scratchpadNotes: e.target.value })}
              />
              <div className="notes-footer">
                <span>{settings.scratchpadNotes ? `${settings.scratchpadNotes.length} chars` : 'Empty note'}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {settings.scratchpadNotes && (
                    <button
                      onClick={() => { navigator.clipboard.writeText(settings.scratchpadNotes); alert('Copied to clipboard!'); }}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}
                    >
                      Copy
                    </button>
                  )}
                  {settings.scratchpadNotes && (
                    <button
                      onClick={() => setOverviewSettings({ ...settings, scratchpadNotes: '' })}
                      style={{ background: 'none', border: 'none', color: 'var(--red-text)', cursor: 'pointer', fontSize: '0.72rem' }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'finances':
        return (
          <div key={widgetKey} className={cardClass}>
            <div className="card-header">
              <span className="card-icon">💳</span>
              <h3>{settings.widgetTitles?.finances || "Finances & Wallet"}</h3>
            </div>
            <div className="card-content finance-content">
              <div className="finance-stats">
                <div className="expense-stat">
                  <span className={`total-amount ${settings.isPrivacyMode ? 'privacy-masked' : ''}`}>{formatMoney(totalWealth)}</span>
                  <span className="stat-label">Total Assets</span>
                </div>
                <div className="recent-expenses">
                  <div className="mini-expense">
                    <span>Net Worth</span>
                    <span className={`mini-amount ${settings.isPrivacyMode ? 'privacy-masked' : ''}`} style={{ color: netWorth >= 0 ? 'var(--green-text)' : 'var(--red-text)' }}>
                      {formatMoney(netWorth)}
                    </span>
                  </div>
                  <div className="mini-expense">
                    <span>Total Expenses</span>
                    <span className={`mini-amount ${settings.isPrivacyMode ? 'privacy-masked' : ''}`} style={{ color: 'var(--red-text)' }}>
                      -{formatMoney(monthlyTotal)}
                    </span>
                  </div>
                </div>
              </div>
              {isMounted && chartData.length > 0 && !settings.isPrivacyMode && (
                <div className="finance-chart-container">
                  <ResponsiveContainer width="100%" height={160} minWidth={0} minHeight={0}>
                    <PieChart>
                      <Pie data={chartData} cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" paddingAngle={5} dataKey="value" stroke="none">
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${currency}${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <button className="card-action" onClick={() => navigate('/expenses')}>Manage Finances</button>
          </div>
        );

      case 'goals':
        return (
          <div key={widgetKey} className={cardClass}>
            <div className="card-header">
              <span className="card-icon">🎯</span>
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
        );

      case 'fridge':
        return (
          <div key={widgetKey} className={cardClass}>
            <div className="card-header">
              <span className="card-icon">🥗</span>
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
        );

      case 'quicklinks':
        return (
          <div key={widgetKey} className={cardClass}>
            <div className="card-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="card-icon" style={{ color: '#06b6d4' }}>⚡</span>
                <h3>{settings.widgetTitles?.quicklinks || "Launchpad"}</h3>
              </div>
              <button onClick={() => setIsAddLinkOpen(!isAddLinkOpen)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>
                {isAddLinkOpen ? '✕ Cancel' : '+ Add'}
              </button>
            </div>
            <div className="card-content">
              {isAddLinkOpen && (
                <form onSubmit={handleAddQuickLink} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px', background: 'var(--bg-card-alt)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input type="text" placeholder="Emoji" value={newLinkIcon} onChange={e => setNewLinkIcon(e.target.value)} style={{ width: '45px', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.85rem' }} />
                    <input type="text" placeholder="Title (e.g. GitHub)" value={newLinkTitle} onChange={e => setNewLinkTitle(e.target.value)} style={{ flex: 1, padding: '6px 8px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.8rem' }} />
                  </div>
                  <input type="text" placeholder="URL (e.g. github.com)" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} style={{ padding: '6px 8px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.8rem' }} />
                  <button type="submit" className="mac-btn mac-btn-add" style={{ padding: '6px 10px', fontSize: '0.78rem' }}>Save Link</button>
                </form>
              )}
              <div className="quicklinks-grid">
                {(settings.quickLinks || DEFAULT_QUICK_LINKS).map(link => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="quicklink-btn">
                    <button className="quicklink-del" onClick={(e) => handleDeleteQuickLink(link.id, e)} title="Delete link">✕</button>
                    <span className="quicklink-icon">{link.icon}</span>
                    <span className="quicklink-title">{link.title}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        );

      case 'workout': {
        const nextWorkout = workouts[0];
        return (
          <div key={widgetKey} className={cardClass}>
            <div className="card-header">
              <span className="card-icon" style={{ color: '#f97316' }}>🏋️</span>
              <h3>{settings.widgetTitles?.workout || "Sport & Workout"}</h3>
            </div>
            <div className="card-content">
              {nextWorkout ? (
                <div className="workout-preview-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{nextWorkout.name || 'Custom Routine'}</span>
                    <span style={{ fontSize: '0.72rem', background: 'rgba(249, 115, 22, 0.15)', color: '#f97316', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      {nextWorkout.exercises?.length || 0} Exercises
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {nextWorkout.category || 'Fitness & Strength'} • Ready for session
                  </p>
                </div>
              ) : (
                <p className="empty-msg" style={{ padding: '20px 0' }}>No workout routines created yet.</p>
              )}
            </div>
            <button className="card-action" onClick={() => navigate('/sporthub')}>Open Sport Hub</button>
          </div>
        );
      }

      case 'trading':
        return (
          <div key={widgetKey} className={cardClass}>
            <div className="card-header">
              <span className="card-icon" style={{ color: '#10b981' }}>📈</span>
              <h3>{settings.widgetTitles?.trading || "Markets & Crypto"}</h3>
            </div>
            <div className="card-content">
              <div className="trading-tickers-list">
                {[
                  { symbol: 'BTC / USD', price: '$88,420', change: '+3.8%', up: true },
                  { symbol: 'ETH / USD', price: '$2,750', change: '+1.9%', up: true },
                  { symbol: 'S&P 500', price: '5,860', change: '-0.4%', up: false }
                ].map((item, idx) => (
                  <div key={idx} className="trading-ticker-row">
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>{item.symbol}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`stat-value-text ${settings.isPrivacyMode ? 'privacy-masked' : ''}`} style={{ fontSize: '0.82rem', fontWeight: 600 }}>{item.price}</span>
                      <span className={`trend-badge ${item.up ? 'up' : 'down'}`}>{item.change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button className="card-action" onClick={() => navigate('/trading')}>Trading Terminal</button>
          </div>
        );

      case 'media': {
        const readingBook = books.find(b => b.status === 'Reading') || books[0];
        const nextMovie = movies.find(m => m.status === 'To Watch') || movies[0];
        return (
          <div key={widgetKey} className={cardClass}>
            <div className="card-header">
              <span className="card-icon" style={{ color: '#8b5cf6' }}>🎬</span>
              <h3>{settings.widgetTitles?.media || "Media Tracker"}</h3>
            </div>
            <div className="card-content">
              <div className="media-split-grid">
                <div className="media-mini-box">
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>📖 READING</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {readingBook?.title || 'No active book'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--primary)' }}>{readingBook?.author || 'Library empty'}</span>
                </div>
                <div className="media-mini-box">
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>🍿 WATCHLIST</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {nextMovie?.title || 'No movies queued'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#ec4899' }}>{nextMovie?.genre || 'Cinema queue'}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button className="card-action" style={{ margin: 0, flex: 1 }} onClick={() => navigate('/books')}>Library</button>
              <button className="card-action" style={{ margin: 0, flex: 1 }} onClick={() => navigate('/movies')}>Cinema</button>
            </div>
          </div>
        );
      }

      case 'mood': {
        const moods = [
          { emoji: '🔥', label: 'Unstoppable' },
          { emoji: '😊', label: 'Great' },
          { emoji: '⚡', label: 'Focused' },
          { emoji: '😐', label: 'Neutral' },
          { emoji: '😴', label: 'Tired' }
        ];
        return (
          <div key={widgetKey} className={cardClass}>
            <div className="card-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="card-icon" style={{ color: '#ec4899' }}>🧠</span>
                <h3>{settings.widgetTitles?.mood || "Daily Mood"}</h3>
              </div>
              {settings.todayMood && <span style={{ fontSize: '0.75rem', color: '#ec4899', fontWeight: 700 }}>+25 XP Logged</span>}
            </div>
            <div className="card-content">
              <div className="mood-emojis-row">
                {moods.map(m => (
                  <button
                    key={m.label}
                    className={`mood-emoji-btn ${settings.todayMood?.label === m.label ? 'active' : ''}`}
                    onClick={() => {
                      addXP(25);
                      setOverviewSettings({ ...settings, todayMood: { ...m, timestamp: Date.now() } });
                    }}
                  >
                    <span style={{ fontSize: '1.4rem' }}>{m.emoji}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'reminders':
        return (
          <div key={widgetKey} className={cardClass}>
            <div className="card-header">
              <span className="card-icon" style={{ color: 'var(--primary)' }}>🔔</span>
              <h3>{settings.widgetTitles?.reminders || "Daily Reminders"}</h3>
            </div>
            <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <form onSubmit={handleAddQuickReminder} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="New reminder..."
                  value={newReminderTitle}
                  onChange={e => setNewReminderTitle(e.target.value)}
                  style={{ flex: 1, background: 'var(--bg-card-alt)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 12px', fontSize: '0.8rem', color: 'var(--text-main)', outline: 'none' }}
                />
                <button type="submit" style={{ background: 'var(--primary)', border: 'none', borderRadius: '6px', color: '#fff', padding: '0 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>Add</button>
              </form>
              <ul className="mini-list" style={{ flex: 1, overflowY: 'auto', maxHeight: '180px', display: 'flex', flexDirection: 'column', gap: '8px', margin: 0, padding: 0, listStyle: 'none' }}>
                {todayReminders.map(block => {
                  const isCompleted = isBlockCompleted(block);
                  return (
                    <li key={block.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.02)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-light)', cursor: 'pointer' }} onClick={(e) => handleToggleBlockInOverview(block, e)}>
                      <input type="checkbox" checked={isCompleted} onChange={() => {}} style={{ cursor: 'pointer', accentColor: 'var(--primary)' }} />
                      <span style={{ fontSize: '0.82rem', color: isCompleted ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: isCompleted ? 'line-through' : 'none', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {block.title}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{block.startTime}</span>
                    </li>
                  );
                })}
                {todayReminders.length === 0 && <li className="empty-msg" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '20px 0' }}>No reminders scheduled for today.</li>}
              </ul>
            </div>
            <button className="card-action" onClick={() => navigate('/timetable')}>View Schedule</button>
          </div>
        );

      case 'news':
        return (
          <div key={widgetKey} className={cardClass}>
            <div className="card-header">
              <span className="card-icon" style={{ color: 'var(--primary)' }}>📰</span>
              <h3>{settings.widgetTitles?.news || "Breaking News"}</h3>
            </div>
            <div className="card-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {overviewNews.slice(0, 3).map((item, idx) => (
                  <div key={`news-${item.id || idx}`} onClick={() => navigate('/news')} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.02)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-light)', cursor: 'pointer' }}>
                    <span style={{ fontSize: '0.7rem', background: 'rgba(var(--primary-rgb), 0.15)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{item.source || 'News'}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
            <button className="card-action" onClick={() => navigate('/news')}>Zum News Hub ➔</button>
          </div>
        );

      case 'objective':
        return (
          <div key={widgetKey} className={cardClass}>
            <div className="card-header">
              <span className="card-icon">🎯</span>
              <h3>{settings.widgetTitles?.objective || "Primary Objective"}</h3>
            </div>
            <div className="card-content">
              <p className="objective-text">{profile.goals?.split('\n')[0] || "No objective set."}</p>
            </div>
          </div>
        );

      case 'rule':
        return (
          <div key={widgetKey} className={cardClass}>
            <div className="card-header">
              <span className="card-icon">📜</span>
              <h3>{settings.widgetTitles?.rule || "Daily Rule"}</h3>
            </div>
            <div className="card-content">
              <div className="rule-badge">Life Rule #{ruleNumber}</div>
              <p className="rule-text">{currentRule}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`overview-container layout-theme-${settings.layout} accent-${settings.accentColor}`} style={{ position: 'relative' }}>
      {/* Top Presets & Controls Bar */}
      <div className="overview-top-bar">
        <div className="preset-tabs-list">
          {DASHBOARD_PRESETS.map(preset => (
            <button
              key={preset.id}
              className={`preset-tab-btn ${settings.activePreset === preset.id ? 'active' : ''}`}
              onClick={() => setOverviewSettings({ ...settings, activePreset: preset.id })}
              title={preset.desc}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="top-bar-actions">
          <button
            className={`icon-action-btn ${settings.isPrivacyMode ? 'active' : ''}`}
            onClick={() => setOverviewSettings({ ...settings, isPrivacyMode: !settings.isPrivacyMode })}
            title="Toggle Privacy Mode (Hide/Show amounts)"
          >
            {settings.isPrivacyMode ? '🔒 Masked' : '👁️ Privacy'}
          </button>

          <button
            className="icon-action-btn"
            onClick={() => setIsCustomizeOpen(true)}
            title="Open Dashboard Customizer"
          >
            <span>⚙️</span> Customize
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className={`overview-hero ${settings.heroStyle === 'compact' ? 'compact-hero' : settings.heroStyle === 'hidden' ? 'hidden-hero' : ''}`}>
        <div className="hero-cover">
          <img src={profile.heroImage || DEFAULT_HERO} alt="User Profile Cover Banner" />
          <div className="hero-overlay"></div>
          <label className="change-cover-btn" style={{ opacity: 0.8, cursor: 'pointer' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
              <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4z" />
              <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5m0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0" />
            </svg>
            Change Cover
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
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
              <span className="stat-label">Day {Math.round((dayOfYear / totalDays) * 100)}% ({totalDays - dayOfYear}d Left)</span>
            </div>
          </div>
        </div>
        <div className="hero-year-progress">
          <div className="hero-dots-grid">
            {dots.map(d => (
              <div key={d} className={`hero-dot ${d <= dayOfYear ? 'active' : ''}`} title={`Day ${d}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Sync / Stats Progress Widget with Window Modes */}
      {settings.visibleWidgets?.sync !== false && (
        <div className="premium-card" style={{ marginBottom: '20px', padding: 0 }}>
          <div className="notion-tabs" style={{ marginBottom: '0', padding: '10px 16px', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
            <div className="stats-header-wrapper">
              <div className="notion-header" style={{ padding: 0, background: 'transparent', border: 'none', color: '#fff', margin: 0 }}>
                <span className="card-icon">📊</span>
                {settings.widgetTitles?.sync || "Stats"}
              </div>

              {/* Mode Switcher Buttons */}
              <div className="stats-mode-buttons">
                <button
                  className={`stats-mode-btn ${settings.statsViewMode === 'bars' ? 'active' : ''}`}
                  onClick={() => setOverviewSettings({ ...settings, statsViewMode: 'bars' })}
                  title="Progress Bars View"
                >
                  📊 Bars
                </button>
                <button
                  className={`stats-mode-btn ${settings.statsViewMode === 'rings' ? 'active' : ''}`}
                  onClick={() => setOverviewSettings({ ...settings, statsViewMode: 'rings' })}
                  title="Activity Rings View"
                >
                  ⭕ Rings
                </button>
                <button
                  className={`stats-mode-btn ${settings.statsViewMode === 'pills' ? 'active' : ''}`}
                  onClick={() => setOverviewSettings({ ...settings, statsViewMode: 'pills' })}
                  title="Compact Pills HUD View"
                >
                  🏷️ Pills
                </button>
                <button
                  className={`stats-mode-btn ${settings.statsViewMode === 'tiles' ? 'active' : ''}`}
                  onClick={() => setOverviewSettings({ ...settings, statsViewMode: 'tiles' })}
                  title="Metric Tiles View"
                >
                  🎛️ Tiles
                </button>
                <button
                  className="stats-mode-btn"
                  onClick={() => setOverviewSettings({ ...settings, statsViewMode: settings.statsViewMode === 'collapsed' ? 'bars' : 'collapsed' })}
                  title={settings.statsViewMode === 'collapsed' ? "Expand Stats Bar" : "Collapse Stats Bar"}
                  style={{ marginLeft: '4px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '8px' }}
                >
                  {settings.statsViewMode === 'collapsed' ? '▼' : '▲'}
                </button>
              </div>
            </div>
          </div>

          {/* Mode 0: Standard Progress Bars */}
          {settings.statsViewMode === 'bars' && (
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
          )}

          {/* Mode 1: Circular Activity Rings */}
          {settings.statsViewMode === 'rings' && (
            <div className="card-content sync-rings-grid">
              {progressItems.map((item, idx) => {
                const radius = 24;
                const circumference = 2 * Math.PI * radius;
                const strokeDashoffset = circumference - (Math.min(100, Math.max(0, item.pct)) / 100) * circumference;
                return (
                  <div key={idx} className="sync-ring-item">
                    <div className="sync-ring-wrapper">
                      <svg className="sync-ring-svg" viewBox="0 0 64 64">
                        <circle className="sync-ring-bg" cx="32" cy="32" r={radius} />
                        <circle
                          className="sync-ring-fill"
                          cx="32"
                          cy="32"
                          r={radius}
                          stroke={item.color}
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                        />
                      </svg>
                      <span className="sync-ring-center-text">{item.pct}%</span>
                    </div>
                    <span className="sync-ring-label" title={item.label}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mode 2: Compact Pills Bar (Single-Line HUD) */}
          {settings.statsViewMode === 'pills' && (
            <div className="card-content sync-pills-bar">
              {progressItems.map((item, idx) => (
                <div key={idx} className="sync-pill-item">
                  <div className="sync-pill-dot" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                  <span className="sync-pill-label">{item.label}:</span>
                  <span className="sync-pill-value" style={{ color: item.color }}>{item.explicitDisplay || `${item.pct}%`}</span>
                </div>
              ))}
            </div>
          )}

          {/* Mode 3: Metric Tiles Grid */}
          {settings.statsViewMode === 'tiles' && (
            <div className="card-content sync-tiles-grid">
              {progressItems.map((item, idx) => (
                <div key={idx} className="sync-tile-item">
                  <div className="sync-tile-header">
                    <span className="sync-tile-label">{item.label}</span>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                  </div>
                  <div className="sync-tile-value" style={{ color: item.color }}>
                    {item.explicitDisplay || `${item.pct}%`}
                  </div>
                  <div className="sync-tile-bar">
                    <div style={{ width: `${item.pct}%`, height: '100%', background: item.color, borderRadius: '2px' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Clock & Calendar Row */}
      {(settings.visibleWidgets?.clock !== false || settings.visibleWidgets?.calendar !== false) && (
        <div className="time-date-row">
          {settings.visibleWidgets?.clock !== false && (
            <div className="overview-card clock-card" style={{ position: 'relative' }}>
              <button
                onClick={() => setClockStyle(s => (s + 1) % 3)}
                style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
                title="Change Clock Style"
              >
                ⚙️
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

      {/* DYNAMIC MODULAR GRID */}
      <div className={`overview-grid ${settings.gridColumns !== 'auto' ? `cols-${settings.gridColumns}` : ''}`}>
        {activeWidgetList.map(key => renderWidgetContent(key))}

        {/* Upcoming Bills Alert */}
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
                        {daysLeft === 0 ? 'DUE TODAY' : `In ${daysLeft}d`} • {formatMoney(bill.amount)}
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

      {/* Floating Customize Toggle at Bottom */}
      <div className="overview-controls-bottom" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '30px', paddingBottom: '20px' }}>
        <button onClick={() => setOverviewSettings({ ...settings, layout: (settings.layout + 1) % 4 })} className="overview-control-btn">
          <span>🎨</span> {LAYOUT_NAMES[settings.layout]}
        </button>

        <button onClick={() => setIsCustomizeOpen(true)} className="overview-control-btn">
          <span>⚙️</span> Customize Page
        </button>
      </div>

      {/* CUSTOMIZE DASHBOARD MODAL */}
      {isCustomizeOpen && (
        <div className="mac-modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', zIndex: 10000 }} onClick={() => setIsCustomizeOpen(false)}>
          <div className="mac-modal" style={{ width: '640px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="mac-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>⚙️ Customize Overview Dashboard</span>
              <button onClick={() => setIsCustomizeOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', gap: '10px', padding: '12px 20px', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-card-alt)' }}>
              <button
                className={`mac-btn ${customizeTab === 'widgets' ? 'mac-btn-add' : 'mac-btn-cancel'}`}
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                onClick={() => setCustomizeTab('widgets')}
              >
                🧩 Widgets & Order
              </button>
              <button
                className={`mac-btn ${customizeTab === 'appearance' ? 'mac-btn-add' : 'mac-btn-cancel'}`}
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                onClick={() => setCustomizeTab('appearance')}
              >
                🎨 Design & Layout
              </button>
              <button
                className={`mac-btn ${customizeTab === 'stats' ? 'mac-btn-add' : 'mac-btn-cancel'}`}
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                onClick={() => setCustomizeTab('stats')}
              >
                📊 Stats Bars
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              {/* TAB 1: Widgets, Reordering & Sizes */}
              {customizeTab === 'widgets' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Reorder widgets using arrows, adjust size (1x Compact / 2x Wide / Full), and rename titles:
                  </div>

                  {settings.widgetOrder.map((key, index) => {
                    const config = ALL_WIDGET_CONFIGS.find(w => w.key === key) || { label: key, defaultTitle: key, icon: '📦' };
                    const currentSize = settings.widgetSizes?.[key] || 'normal';
                    const isVisible = settings.visibleWidgets?.[key] !== false;

                    return (
                      <div key={key} className="reorder-item-row">
                        <div className="reorder-arrows">
                          <button
                            className="reorder-arrow-btn"
                            disabled={index === 0}
                            onClick={() => handleMoveWidget(index, -1)}
                            title="Move Up"
                          >
                            ▲
                          </button>
                          <button
                            className="reorder-arrow-btn"
                            disabled={index === settings.widgetOrder.length - 1}
                            onClick={() => handleMoveWidget(index, 1)}
                            title="Move Down"
                          >
                            ▼
                          </button>
                        </div>

                        <label className="mac-switch" style={{ position: 'relative', display: 'inline-block', width: '36px', height: '20px', flexShrink: 0 }}>
                          <input
                            type="checkbox"
                            checked={isVisible}
                            onChange={(e) => {
                              const newVis = { ...settings.visibleWidgets, [key]: e.target.checked };
                              setOverviewSettings({ ...settings, visibleWidgets: newVis });
                            }}
                            style={{ opacity: 0, width: 0, height: 0 }}
                          />
                          <span className="mac-slider" style={{
                            position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: isVisible ? 'var(--primary)' : '#444',
                            borderRadius: '34px', transition: '0.3s'
                          }}>
                            <span style={{
                              position: 'absolute', height: '14px', width: '14px', left: '3px', bottom: '3px',
                              backgroundColor: 'white', borderRadius: '50%', transition: '0.3s',
                              transform: isVisible ? 'translateX(16px)' : 'translateX(0)'
                            }}></span>
                          </span>
                        </label>

                        <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{config.icon}</span>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{config.label}</div>
                          <input
                            className="mac-input"
                            style={{ borderBottom: '1px solid var(--border-light)', padding: '2px 0', fontSize: '0.85rem', color: 'var(--text-main)', width: '100%', background: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', outline: 'none' }}
                            value={settings.widgetTitles?.[key] ?? config.defaultTitle}
                            onChange={(e) => {
                              const newTitles = { ...settings.widgetTitles, [key]: e.target.value };
                              setOverviewSettings({ ...settings, widgetTitles: newTitles });
                            }}
                            placeholder={config.defaultTitle}
                            disabled={!isVisible}
                          />
                        </div>

                        {/* Size Selector */}
                        <div className="size-pill-group">
                          <button
                            className={`size-pill-btn ${currentSize === 'normal' ? 'active' : ''}`}
                            onClick={() => handleSetWidgetSize(key, 'normal')}
                            title="1 Column (Compact)"
                          >
                            1x
                          </button>
                          <button
                            className={`size-pill-btn ${currentSize === 'wide' ? 'active' : ''}`}
                            onClick={() => handleSetWidgetSize(key, 'wide')}
                            title="2 Columns (Wide)"
                          >
                            2x
                          </button>
                          <button
                            className={`size-pill-btn ${currentSize === 'full' ? 'active' : ''}`}
                            onClick={() => handleSetWidgetSize(key, 'full')}
                            title="Full Width"
                          >
                            Full
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: Appearance & Layout */}
              {customizeTab === 'appearance' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Hero Style */}
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>
                      Hero Banner Style
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                      {[
                        { id: 'standard', label: '🖼️ Full Banner', desc: 'Cover, avatar & dots' },
                        { id: 'compact', label: '⚡ Compact Slim', desc: 'Minimal header bar' },
                        { id: 'hidden', label: '🚫 Hidden', desc: 'Max screen space' }
                      ].map(h => (
                        <div
                          key={h.id}
                          onClick={() => setOverviewSettings({ ...settings, heroStyle: h.id })}
                          style={{
                            background: settings.heroStyle === h.id ? 'rgba(var(--primary-rgb), 0.15)' : 'var(--bg-card-alt)',
                            border: settings.heroStyle === h.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                            borderRadius: '10px', padding: '12px', cursor: 'pointer', textAlign: 'center'
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>{h.label}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>{h.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>
                      Dashboard Accent Color
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {[
                        { id: 'default', label: 'Default', color: '#3b82f6' },
                        { id: 'teal', label: 'Cyber Teal', color: '#14b8a6' },
                        { id: 'cyan', label: 'Electric Cyan', color: '#06b6d4' },
                        { id: 'purple', label: 'Neon Purple', color: '#a855f7' },
                        { id: 'green', label: 'Emerald', color: '#10b981' },
                        { id: 'orange', label: 'Sunset Orange', color: '#f97316' },
                        { id: 'red', label: 'Crimson', color: '#ef4444' },
                        { id: 'gold', label: 'Imperial Gold', color: '#eab308' }
                      ].map(c => (
                        <button
                          key={c.id}
                          onClick={() => setOverviewSettings({ ...settings, accentColor: c.id })}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: settings.accentColor === c.id ? 'rgba(255,255,255,0.1)' : 'var(--bg-card-alt)',
                            border: settings.accentColor === c.id ? `2px solid ${c.color}` : '1px solid var(--border-light)',
                            padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', color: 'var(--text-main)', fontSize: '0.78rem', fontWeight: 600
                          }}
                        >
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: c.color }}></span>
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grid Column Layout */}
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>
                      Grid Spaltenanzahl
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                      {[
                        { id: 'auto', label: '📱 Responsive Auto' },
                        { id: '2', label: '2 Spalten Grid' },
                        { id: '3', label: '3 Spalten Grid' }
                      ].map(g => (
                        <button
                          key={g.id}
                          onClick={() => setOverviewSettings({ ...settings, gridColumns: g.id })}
                          style={{
                            background: settings.gridColumns === g.id ? 'rgba(var(--primary-rgb), 0.15)' : 'var(--bg-card-alt)',
                            border: settings.gridColumns === g.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                            padding: '10px', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-main)', fontSize: '0.82rem', fontWeight: 700
                          }}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Stats & Objectives */}
              {customizeTab === 'stats' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '8px' }}>
                      Stats Bar Widget-Fenster Modus
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                      {[
                        { id: 'bars', label: '📊 Balken (Bars)', desc: 'Klassische Progress-Balken' },
                        { id: 'rings', label: '⭕ Ringe (Rings)', desc: 'Apple-Style Aktivitätsringe' },
                        { id: 'pills', label: '🏷️ HUD Pills', desc: 'Ultra-kompakte Einzeilen-Leiste' },
                        { id: 'tiles', label: '🎛️ KPI Tiles', desc: 'Große Kennzahlen-Kacheln' }
                      ].map(mode => (
                        <button
                          key={mode.id}
                          onClick={() => setOverviewSettings({ ...settings, statsViewMode: mode.id })}
                          style={{
                            background: settings.statsViewMode === mode.id ? 'rgba(var(--primary-rgb), 0.15)' : 'var(--bg-card-alt)',
                            border: settings.statsViewMode === mode.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                            padding: '10px 8px', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 700,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textAlign: 'center'
                          }}
                        >
                          <span>{mode.label}</span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>{mode.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                    Sichtbare Stats / Fortschrittsbalken
                  </div>
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
                            position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: settings.visibleStatsBars?.[bar.key] !== false ? 'var(--primary)' : '#444',
                            borderRadius: '34px', transition: '0.3s'
                          }}>
                            <span style={{
                              position: 'absolute', height: '12px', width: '12px', left: '3px', bottom: '3px',
                              backgroundColor: 'white', borderRadius: '50%', transition: '0.3s',
                              transform: settings.visibleStatsBars?.[bar.key] !== false ? 'translateX(16px)' : 'translateX(0)'
                            }}></span>
                          </span>
                        </label>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 500 }}>{bar.label}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginTop: '15px' }}>
                    Primary Objective Content
                  </div>
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
              )}
            </div>

            <div className="mac-modal-footer" style={{ display: 'flex', gap: '10px', padding: '16px 20px', borderTop: '1px solid var(--border-color)', justifyContent: 'space-between' }}>
              <button
                className="mac-btn mac-btn-cancel"
                onClick={() => {
                  if (confirm("Reset overview customization to defaults?")) {
                    setOverviewSettings({
                      layout: 0,
                      heroStyle: 'standard',
                      accentColor: 'default',
                      gridColumns: 'auto',
                      activePreset: 'all',
                      isPrivacyMode: false,
                      widgetOrder: DEFAULT_ORDER,
                      widgetSizes: {},
                      visibleWidgets: {
                        clock: true, calendar: true, sync: true, timetable: true, habits: true,
                        pomodoro: true, notes: true, finances: true, goals: true, fridge: true,
                        quicklinks: true, workout: true, trading: true, media: true, mood: true,
                        reminders: false, news: true, objective: true, rule: true
                      },
                      visibleStatsBars: { expenses: true, goals: true, habits: true, timetable: true, fridge: true, targets: true, library: true, cinema: true, quests: true }
                    });
                  }
                }}
              >
                Reset to Defaults
              </button>

              <button className="mac-btn mac-btn-add" onClick={() => setIsCustomizeOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Habit Preview Modal */}
      {selectedHabitPreview && (() => {
        const liveHabit = todayHabitsList.find(h => h.id === selectedHabitPreview.id) || selectedHabitPreview;
        const template = customHabitTemplates.find(t => t.id === selectedHabitPreview.id);
        const skillDef = SKILL_DEF.find(s => s.id === selectedHabitPreview.id || s.habit === selectedHabitPreview.name || selectedHabitPreview.id === `quest-${s.id}`);
        const isDone = !!liveHabit.done;
        const streak = calcHabitStreak(selectedHabitPreview.id);
        const description = selectedHabitPreview.notes || template?.notes || skillDef?.quest || 'Daily discipline habit to build consistency and elevate performance state.';

        return (
          <div className="mac-modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(10px)', zIndex: 10000, padding: '20px' }} onClick={() => setSelectedHabitPreview(null)}>
            <div className="mac-modal" style={{ width: '480px', maxWidth: '92vw', background: 'var(--bg-card)', borderRadius: '16px', border: isDone ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card-alt)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.5rem' }}>{skillDef?.icon || '✨'}</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 700 }}>{liveHabit.name}</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{skillDef?.category || 'Daily Routine'}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedHabitPreview(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: streak >= 3 ? '#f97316' : 'var(--text-main)' }}>{streak >= 3 ? '🔥 ' : ''}{streak} Days</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px' }}>Current Streak</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: isDone ? 'var(--green-text)' : 'var(--purple-text)' }}>{isDone ? 'Completed' : '+50 XP'}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px' }}>Status</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>Description</div>
                  <div style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '14px', fontSize: '0.88rem', lineHeight: '1.55', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                    {description}
                  </div>
                </div>
              </div>
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-card-alt)', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <button onClick={() => { setSelectedHabitPreview(null); navigate('/habits'); }} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Open in Tracker ➔</button>
                <button onClick={() => handleDirectHabitToggle(liveHabit.id)} style={{ background: isDone ? 'rgba(239, 68, 68, 0.15)' : 'var(--primary)', border: isDone ? '1px solid rgba(239, 68, 68, 0.4)' : 'none', color: isDone ? 'var(--red-text)' : '#fff', borderRadius: '8px', padding: '8px 18px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
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
