// src/services/aiAgentService.js
// Autonomous Agent workflows for "Agent Hunter (A.H.)":
// - Leistungszustand (Performance State Index: 0..10 / 0%..100%)
// - Full Multi-Module Orchestration (Profile -> Settings -> Habits/Goals/Targets/Expense -> Timetable/Skills/Workout/Journal)
// - Morning Briefing, Smart Recipe & Grocery Agent, Voice STT/TTS

import { SKILL_DEF } from '../constants';

/**
 * Calculates the real-time "Leistungszustand" (Performance State Index: 0.0 - 10.0 / 0% - 100%)
 * based on the workflow blueprint for AI Agent Hunter (A.H.)
 */
export const calculateLeistungszustand = (state) => {
  if (!state) return { score: 5.0, overallPct: 50, tier: 'Basics', tierColor: '#f59e0b', breakdown: {} };

  const todayId = new Date().toISOString().split('T')[0];

  // 1. Habit Mastery (Weight: 20%)
  const habitDays = state.habits || [];
  const todayHabitDay = habitDays.find(d => d.id === todayId);
  const todayHabits = todayHabitDay?.habits || [];
  const habitTotal = todayHabits.length;
  const habitDone = todayHabits.filter(h => h && h.done).length;
  const habitPct = habitTotal > 0 ? (habitDone / habitTotal) * 100 : 50;

  // 2. Goal & Target Velocity (Weight: 20%)
  const weekGoals = state.goals?.week || [];
  const goalTotal = weekGoals.length;
  const goalDone = weekGoals.filter(g => g && g.completed).length;
  const goalPct = goalTotal > 0 ? (goalDone / goalTotal) * 100 : (state.goals?.month?.length > 0 ? 60 : 40);

  // 3. Financial Discipline & Budget Radar (Weight: 15%)
  const expenses = state.expenses || [];
  const todaySpend = expenses.filter(e => e.date === todayId).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const dailyLimit = state.financeSettings?.limits?.daily || 50;
  const financePct = todaySpend <= dailyLimit 
    ? Math.max(20, 100 - (todaySpend / Math.max(1, dailyLimit)) * 40)
    : Math.max(10, 50 - ((todaySpend - dailyLimit) / Math.max(1, dailyLimit)) * 50);

  // 4. Physical / Workout Training (Weight: 15%)
  const workouts = state.workouts || [];
  const now = new Date();
  const recentWorkoutsCount = workouts.filter(w => {
    if (!w || !w.date) return false;
    const diffDays = (now - new Date(w.date)) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 7;
  }).length;
  const workoutPct = Math.min(100, (recentWorkoutsCount / 3) * 100); // 3 workouts/week = 100%

  // 5. Timetable & Schedule Execution (Weight: 10%)
  const todayDayEn = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(now);
  const todayBlocks = (state.timetableBlocks || []).filter(b => b.day === todayDayEn || b.day === 'Daily');
  const completedBlocks = todayBlocks.filter(b => b.completed).length;
  const timetablePct = todayBlocks.length > 0 ? (completedBlocks / todayBlocks.length) * 100 : 70;

  // 6. Skill Tree Progression (Weight: 10%)
  const unlockedSkills = state.skills || ['core'];
  const totalSkillsCount = SKILL_DEF?.length || 12;
  const skillPct = Math.min(100, (unlockedSkills.length / totalSkillsCount) * 100);

  // 7. Journal & Mindset Reflection (Weight: 10%)
  const journalEntries = state.journal || [];
  const journalRecent = journalEntries.filter(j => {
    if (!j || !j.date) return false;
    const diffDays = (now - new Date(j.date)) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 7;
  }).length;
  const journalPct = Math.min(100, (journalRecent / 2) * 100); // 2 journal reflections/week = 100%

  // Overall Weighted Score (0% to 100%)
  const overallPct = Math.min(100, Math.max(0, Math.round(
    (habitPct * 0.20) +
    (goalPct * 0.20) +
    (financePct * 0.15) +
    (workoutPct * 0.15) +
    (timetablePct * 0.10) +
    (skillPct * 0.10) +
    (journalPct * 0.10)
  )));

  // Scale [0, 10]: 0 = Basics (0%), 10 = Professional (100%)
  const score = parseFloat((overallPct / 10).toFixed(1));

  // Tier Classification
  let tier = '0: Basics';
  let tierColor = '#ef4444'; // Red
  let rankLabel = 'Initiate / Level 1';

  if (score >= 9.0) {
    tier = '10: Professional Master';
    tierColor = '#10b981'; // Green
    rankLabel = 'Tier X: Apex Hunter';
  } else if (score >= 7.5) {
    tier = '8: Advanced Hunter';
    tierColor = '#00f0ff'; // Cyan
    rankLabel = 'Tier A: Elite Performer';
  } else if (score >= 5.0) {
    tier = '5: Operational';
    tierColor = '#d48f48'; // Gold
    rankLabel = 'Tier B: Steady Operator';
  } else if (score >= 2.5) {
    tier = '3: Intermediate';
    tierColor = '#f59e0b'; // Amber
    rankLabel = 'Tier C: Developing';
  }

  return {
    score, // 0.0 .. 10.0
    overallPct, // 0 .. 100%
    tier,
    tierColor,
    rankLabel,
    breakdown: {
      habits: { label: 'Habits & Routine', pct: Math.round(habitPct), done: habitDone, total: habitTotal, weight: '20%' },
      goals: { label: 'Goals & Targets', pct: Math.round(goalPct), done: goalDone, total: goalTotal, weight: '20%' },
      finances: { label: 'Financial Discipline', pct: Math.round(financePct), spend: todaySpend, limit: dailyLimit, weight: '15%' },
      workout: { label: 'Physical Training', pct: Math.round(workoutPct), count: recentWorkoutsCount, weight: '15%' },
      timetable: { label: 'Timetable Execution', pct: Math.round(timetablePct), completed: completedBlocks, total: todayBlocks.length, weight: '10%' },
      skills: { label: 'Skill Tree Unlocks', pct: Math.round(skillPct), unlocked: unlockedSkills.length, total: totalSkillsCount, weight: '10%' },
      journal: { label: 'Journal & Mindset', pct: Math.round(journalPct), recent: journalRecent, weight: '10%' }
    }
  };
};

/**
 * Builds the comprehensive prompt & context for "Agent Hunter (A.H.)"
 */
export const buildAgentHunterContext = (state, missionType = 'general') => {
  const profile = state.profile || {};
  const perf = calculateLeistungszustand(state);
  const currency = profile.currencySymbol || '€';

  const safeMap = (arr, fn) => Array.isArray(arr) ? arr.map(fn).filter(Boolean).join(', ') : 'None';
  const safeMapLines = (arr, fn) => Array.isArray(arr) ? arr.map(fn).filter(Boolean).join('\n') : 'None';

  const habits = safeMap(state.customHabitTemplates || [], h => h?.name ? `${h.name} (${h.repeat || 'Daily'})` : null);
  const currentGoals = [...(Array.isArray(state.goals?.week) ? state.goals.week : []), ...(Array.isArray(state.goals?.month) ? state.goals.month : [])].map(g => `[${g.completed ? 'DONE' : 'OPEN'}] ${g?.text}`).filter(Boolean).join(', ') || 'None';
  const bigTargets = safeMap(state.targets || [], t => t?.title ? `${t.title} (${t.progress || 0}%)` : null);
  const recentWorkouts = safeMap((state.workouts || []).slice(-5), w => w?.name ? `${w.name} (${w.duration || w.date || ''})` : null);
  const recentJournal = safeMapLines((state.journal || []).slice(-3), j => j?.title ? `- ${j.title} (${j.date || ''})` : null);
  const unlockedSkills = Array.isArray(state.skills) ? state.skills.join(', ') : 'core';
  const todayId = new Date().toISOString().split('T')[0];
  const todaySpend = (state.expenses || []).filter(e => e.date === todayId).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

  const prompt = `
You are "Agent Hunter (A.H.)", the central Life Operating System intelligence agent from the E.O.M Blueprint.
Your mission is to analyze all life domains holistically (Profile Baseline -> Settings -> Habits/Goals/Targets/Expense -> Timetable/Skills/Workout/Journal) and elevate the user toward peak Performance State level "10 = Professional (100%)".

================ USER BASELINE & REGISTER DATA ================
- Name: ${profile.username || 'Agent Hunter Operative'}
- Age: ${profile.age || 'N/A'} years
- Weight: ${profile.weight || 'N/A'} kg (Target: ${profile.targetWeight || 'N/A'} kg)
- Height: ${profile.height || 'N/A'} cm
- Education: ${profile.education || 'N/A'}
- Fitness Goal: ${profile.fitnessGoal || 'Maintain'}
- Current XP: ${profile.xp || 0} XP
================================================================

================ PERFORMANCE STATE MATRIX (0..10) ================
- Overall Index: ${perf.score} / 10.0 (${perf.overallPct}% Efficiency)
- Rank Classification: ${perf.tier} [${perf.rankLabel}]
- Habits Score (20%): ${perf.breakdown.habits.pct}% (${perf.breakdown.habits.done}/${perf.breakdown.habits.total} completed today)
- Goals Score (20%): ${perf.breakdown.goals.pct}% (${perf.breakdown.goals.done}/${perf.breakdown.goals.total} completed)
- Finance Score (15%): ${perf.breakdown.finances.pct}% (Today: ${currency}${todaySpend} / Daily Limit: ${currency}${perf.breakdown.finances.limit})
- Workout Score (15%): ${perf.breakdown.workout.pct}% (${perf.breakdown.workout.count} workouts this week)
- Timetable Score (10%): ${perf.breakdown.timetable.pct}% (${perf.breakdown.timetable.completed}/${perf.breakdown.timetable.total} blocks)
- Skill Tree Score (10%): ${perf.breakdown.skills.pct}% (${perf.breakdown.skills.unlocked} skills unlocked)
- Journal Score (10%): ${perf.breakdown.journal.pct}% (${perf.breakdown.journal.recent} entries this week)
==================================================================

System Inventory:
- Active Goals: ${currentGoals}
- Big Life Targets: ${bigTargets}
- Recent Workouts: ${recentWorkouts}
- Recent Journal Entries: ${recentJournal}
- Unlocked Skills: ${unlockedSkills}

Mission Directives (${missionType.toUpperCase()}):
Analyze vulnerabilities, emphasize strengths, and deliver clear "Hunter Directives" including:
1. 🎯 **PERFORMANCE STATE DIAGNOSIS** (Where is the user dropping score in the [0..10] index?)
2. ⚔️ **TODAY'S HUNT QUESTS (3 Immediate Actions)**: Concrete action items for Habits, Workout & Goals.
3. 💰 **FINANCE & RESOURCE RADAR**: Tactical budget advisory.
4. 🛡️ **SKILL & MINDSET LEVEL-UP**: An inspiring coaching insight for the next tier leap.
`.trim();

  return { prompt, perf };
};

/**
 * Builds high-density context for the Daily Morning Briefing Agent
 */
export const buildMorningBriefingContext = (state, recentNews = []) => {
  const profile = state.profile || {};
  const perf = calculateLeistungszustand(state);
  const today = new Date();
  const dayNameEn = today.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const todayId = today.toISOString().split('T')[0];
  const currency = profile.currencySymbol || '€';

  // 1. Habits for today
  const habitDay = (state.habits || []).find(d => d.id === todayId);
  const todayHabits = habitDay?.habits || [];
  const habitsTotal = todayHabits.length;
  const habitsDone = todayHabits.filter(h => h.done).length;
  const habitsPending = todayHabits.filter(h => !h.done).map(h => h.name).join(', ') || 'All completed / none scheduled';

  // 2. Today's Reminders & Timetable Blocks
  const todayDayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const timetableToday = (state.timetableBlocks || []).filter(b => b.day === todayDayName || b.day === 'Daily');
  const timetableList = timetableToday.map(b => `${b.time || 'All Day'}: ${b.title} (${b.isReminder ? 'Reminder' : 'Timeblock'})`).join('\n') || 'No scheduled timeblocks for today';

  // 3. Active Goals
  const weekGoals = (state.goals?.week || []).map(g => `[${g.completed ? 'COMPLETED' : 'PENDING'}] ${g.text}`).join(', ') || 'None';

  // 4. Finances
  const expenses = state.expenses || [];
  const todayExpenses = expenses.filter(e => e.date === todayId);
  const todaySpend = todayExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const dailyLimit = state.financeSettings?.limits?.daily || 50;

  // 5. Fridge Status
  const fridge = state.fridge || [];
  const inStockItems = fridge.filter(f => f.status === 'In stock').map(f => f.name).join(', ') || 'No items listed';
  const lowStockItems = fridge.filter(f => f.status === 'Not in stock').map(f => f.name).join(', ') || 'All stocked';

  // 6. News Highlights (top 3)
  const newsHighlights = recentNews.slice(0, 3).map(n => `- ${n.sourceName || 'News'}: ${n.title}`).join('\n') || 'Global feeds synchronized';

  const prompt = `
Generate an Executive Morning Briefing from Agent Hunter (A.H.) for ${profile.username || 'Agent'}.
Date: ${dayNameEn}
Performance State Index: ${perf.score} / 10.0 (${perf.tier})

Structure your briefing into the following sections:

🌅 **1. MINDSET & DAILY FOCUS**
(High-energy opening suited to the current performance score of ${perf.score}/10)

📋 **2. SCHEDULE & CALENDAR BLOCKS**
${timetableList}

⚡ **3. HABIT & DISCIPLINE RADAR**
- Pending Habits: ${habitsPending} (${habitsDone}/${habitsTotal} done)
- Fitness Target: ${profile.fitnessGoal || 'Stay Active'}

💰 **4. FINANCE RADAR**
- Today's Spend: ${currency}${todaySpend.toFixed(2)} (Daily Budget Limit: ${currency}${dailyLimit})

🧊 **5. MEAL & INVENTORY CHECK**
- In Stock: ${inStockItems}
- Need Restock: ${lowStockItems}

🌍 **6. WORLD PULSE (GLOBAL HEADLINES)**
${newsHighlights}

🎯 **7. AGENT HUNTER PRIMARY DIRECTIVE**
(1 concrete high-impact priority to push performance closer to 10.0 today)
`.trim();

  return { prompt, dayNameEn, todaySpend, dailyLimit, habitsPending, habitsDone, habitsTotal, perf };
};

/**
 * Builds prompt for the Smart Recipe & Grocery Restock Agent
 */
export const buildRecipeAgentContext = (state, customPref = '') => {
  const profile = state.profile || {};
  const fridge = state.fridge || [];
  const inStock = fridge.filter(f => f.status === 'In stock').map(f => f.name);
  const notInStock = fridge.filter(f => f.status === 'Not in stock').map(f => f.name);

  const prompt = `
You are the E.O.M Smart Nutrition & Kitchen Agent for Agent Hunter (A.H.).
Analyze the ingredients currently in the user's fridge and generate 2 to 3 healthy, appetizing recipe ideas.

User Profile:
- Fitness Goal: ${profile.fitnessGoal || 'Balanced Nutrition'}
- Weight: ${profile.weight || 'N/A'} kg (Target: ${profile.targetWeight || 'N/A'} kg)
${customPref ? `- Dietary Preferences: ${customPref}` : ''}

AVAILABLE INGREDIENTS (In Stock):
${inStock.length > 0 ? inStock.map(i => `- ${i}`).join('\n') : '- No items listed (suggest simple staple recipes)'}

OUT OF STOCK INGREDIENTS:
${notInStock.length > 0 ? notInStock.join(', ') : 'None'}

Formatting Rules for your Response:
1. For each recipe:
   - 🍲 **Recipe Name** & Cook Time
   - 🥑 **Estimated Macros & Calories**
   - 🥗 **Ingredients from Fridge** (already available)
   - 🛒 **Missing Ingredients** (need to purchase)
   - 👨‍🍳 **Preparation Steps in 3-4 concise instructions**

2. End with a machine-parsable grocery section:
[MISSING_INGREDIENTS: Item 1, Item 2, Item 3]
`.trim();

  return { prompt, inStock, notInStock };
};

/**
 * Extract missing ingredients from AI response
 */
export const extractMissingIngredients = (responseText) => {
  if (!responseText) return [];
  const match = responseText.match(/\[MISSING_INGREDIENTS:\s*([^\]]+)\]/i);
  if (!match) return [];
  return match[1]
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0 && !item.toLowerCase().includes('keine') && !item.toLowerCase().includes('none'));
};

/**
 * Strips HTML tags and markdown for clean TTS voice reading
 */
export const cleanTextForTTS = (text) => {
  if (!text) return '';
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/\[\/?(ACTION|SYSTEM|NOTE|TIP|IMPORTANT|MISSING_INGREDIENTS)[^\]]*\]/gi, '')
    .replace(/[*_#`~>[\]()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Web Speech API - Text-to-Speech (TTS) Voice Synthesis
 */
export const speakAgentText = (text, options = {}) => {
  const {
    lang = 'de-DE',
    rate = 1.0,
    pitch = 1.0,
    onStart = null,
    onEnd = null,
    onError = null
  } = options;

  if (!('speechSynthesis' in window)) {
    if (onError) onError('Speech synthesis not supported in this browser environment.');
    return null;
  }

  window.speechSynthesis.cancel();

  const clean = cleanTextForTTS(text);
  if (!clean) return null;

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.rate = rate;
  utterance.pitch = pitch;

  const voices = window.speechSynthesis.getVoices();
  const isGerman = lang.startsWith('de');
  const targetPrefix = isGerman ? 'de' : 'en';

  const voice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(targetPrefix));
  if (voice) {
    utterance.voice = voice;
  }
  utterance.lang = lang;

  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;
  if (onError) utterance.onerror = onError;

  window.speechSynthesis.speak(utterance);
  return utterance;
};

/**
 * Stop active speech synthesis
 */
export const stopAgentSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Web Speech API - Speech-to-Text (STT) Speech Recognition
 */
export const createSpeechRecognition = (options = {}) => {
  const {
    lang = 'de-DE',
    continuous = false,
    interimResults = true,
    onResult = () => {},
    onEnd = () => {},
    onError = () => {}
  } = options;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return {
      supported: false,
      start: () => onError('Speech recognition is not supported in this browser. Please use Chrome/Edge or Electron.'),
      stop: () => {}
    };
  }

  const recognition = new SpeechRecognition();
  recognition.lang = lang;
  recognition.continuous = continuous;
  recognition.interimResults = interimResults;

  recognition.onresult = (event) => {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    onResult({
      transcript: finalTranscript || interimTranscript,
      isFinal: Boolean(finalTranscript),
      rawEvent: event
    });
  };

  recognition.onerror = (err) => {
    onError(err);
  };

  recognition.onend = () => {
    onEnd();
  };

  return {
    supported: true,
    start: () => {
      try {
        recognition.start();
      } catch (e) {
        console.warn("Recognition already started or error:", e);
      }
    },
    stop: () => {
      try {
        recognition.stop();
      } catch (e) {
        console.warn("Recognition stop error:", e);
      }
    },
    abort: () => {
      try {
        recognition.abort();
      } catch (e) {
        console.warn("Recognition abort error:", e);
      }
    }
  };
};
