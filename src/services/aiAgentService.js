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
Du bist "Agent Hunter (A.H.)", der zentrale Life-Operating-System-Agent aus dem E.O.M Blueprint.
Deine Aufgabe ist es, alle Lebensbereiche (Profile Baseline -> Settings -> Habits/Goals/Targets/Expense -> Timetable/Skills/Workout/Journal) holistisch zu analysieren und den Benutzer auf das Leistungs-Niveau "10 = Professional (100%)" zu jagen.

================ USER BASELINE & REGISTER DATA ================
- Name: ${profile.username || 'Agent Hunter Operative'}
- Alter (Age): ${profile.age || 'N/A'} Jahre
- Gewicht (Weight): ${profile.weight || 'N/A'} kg (Ziel: ${profile.targetWeight || 'N/A'} kg)
- Größe (Height): ${profile.height || 'N/A'} cm
- Ausbildung / Education: ${profile.education || 'N/A'}
- Fitness-Ziel: ${profile.fitnessGoal || 'Maintain'}
- Aktueller XP-Stand: ${profile.xp || 0} XP
================================================================

================ AKTUELLER LEISTUNGSZUSTAND (0..10) ================
- Gesamtwert: ${perf.score} / 10.0 (${perf.overallPct}% Effizienz)
- Einstufung: ${perf.tier} [${perf.rankLabel}]
- Gewohnheiten-Score (20%): ${perf.breakdown.habits.pct}% (${perf.breakdown.habits.done}/${perf.breakdown.habits.total} heute erledigt)
- Ziele-Score (20%): ${perf.breakdown.goals.pct}% (${perf.breakdown.goals.done}/${perf.breakdown.goals.total} erledigt)
- Finanzen-Score (15%): ${perf.breakdown.finances.pct}% (Heute: ${currency}${todaySpend} / Limit: ${currency}${perf.breakdown.finances.limit})
- Training-Score (15%): ${perf.breakdown.workout.pct}% (${perf.breakdown.workout.count} Workouts diese Woche)
- Timetable-Score (10%): ${perf.breakdown.timetable.pct}% (${perf.breakdown.timetable.completed}/${perf.breakdown.timetable.total} Blöcke)
- Skill-Tree-Score (10%): ${perf.breakdown.skills.pct}% (${perf.breakdown.skills.unlocked} Skills freigeschaltet)
- Journal-Score (10%): ${perf.breakdown.journal.pct}% (${perf.breakdown.journal.recent} Einträge diese Woche)
====================================================================

System-Inventar:
- Aktive Ziele: ${currentGoals}
- Lebens-Targets: ${bigTargets}
- Letzte Workouts: ${recentWorkouts}
- Letzte Journal-Reflexionen: ${recentJournal}
- Freigeschaltete Skills: ${unlockedSkills}

Missions-Auftrag (${missionType.toUpperCase()}):
Analysiere die Schwachstellen, hebe Stärken hervor und erstelle klare "Hunter Directives" mit:
1. 🎯 **LEISTUNGSZUSTAND-DIAGNOSE** (Wo verliert der User Punkte im [0..10] Index?)
2. ⚔️ **HEUTIGE JAGD-QUESTS (3 Sofort-Aktionen)**: Konkrete Handlungen für Habits, Workout & Goals.
3. 💰 **FINANZ- & RESSOURCEN-RADAR**: Budget-Taktik.
4. 🛡️ **SKILL & MINDSET LEVEL-UP**: Ein inspirierender Coaching-Impuls für den nächsten Level-Sprung.
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
  const dayNameDe = today.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const dayNameEn = today.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const todayId = today.toISOString().split('T')[0];
  const currency = profile.currencySymbol || '€';

  // 1. Habits for today
  const habitDay = (state.habits || []).find(d => d.id === todayId);
  const todayHabits = habitDay?.habits || [];
  const habitsTotal = todayHabits.length;
  const habitsDone = todayHabits.filter(h => h.done).length;
  const habitsPending = todayHabits.filter(h => !h.done).map(h => h.name).join(', ') || 'Alle erledigt / keine geplant';

  // 2. Today's Reminders & Timetable Blocks
  const todayDayEn = today.toLocaleDateString('en-US', { weekday: 'long' });
  const timetableToday = (state.timetableBlocks || []).filter(b => b.day === todayDayEn || b.day === 'Daily');
  const timetableList = timetableToday.map(b => `${b.time || 'Ganztägig'}: ${b.title} (${b.isReminder ? 'Reminder' : 'Zeitblock'})`).join('\n') || 'Keine Zeitblöcke für heute eingetragen';

  // 3. Active Goals
  const weekGoals = (state.goals?.week || []).map(g => `[${g.completed ? 'ERLEDIGT' : 'OFFEN'}] ${g.text}`).join(', ') || 'Keine';

  // 4. Finances
  const expenses = state.expenses || [];
  const todayExpenses = expenses.filter(e => e.date === todayId);
  const todaySpend = todayExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const dailyLimit = state.financeSettings?.limits?.daily || 50;

  // 5. Fridge Status
  const fridge = state.fridge || [];
  const inStockItems = fridge.filter(f => f.status === 'In stock').map(f => f.name).join(', ') || 'Keine Einträge';
  const lowStockItems = fridge.filter(f => f.status === 'Not in stock').map(f => f.name).join(', ') || 'Alles vorrätig';

  // 6. News Highlights (top 3)
  const newsHighlights = recentNews.slice(0, 3).map(n => `- ${n.sourceName || 'News'}: ${n.title}`).join('\n') || 'Globale Leitmedien synchronisiert';

  const prompt = `
Erstelle ein Executive Morning Briefing von Agent Hunter (A.H.) für ${profile.username || 'Agent'}.
Datum: ${dayNameDe}
Leistungszustand-Index: ${perf.score} / 10.0 (${perf.tier})

Gliedere deine Antwort in folgende Abschnitte:

🌅 **1. MINDSET & TAGESFOKUS**
(Kraftvoller Einstieg, passend zum aktuellen Leistungszustand von ${perf.score}/10)

📋 **2. ZEITPLAN & TERMINE HEUTE**
${timetableList}

⚡ **3. HABIT & DISZIPLIN-RADAR**
- Offene Gewohnheiten: ${habitsPending} (${habitsDone}/${habitsTotal} erledigt)
- Fitness-Fokus: ${profile.fitnessGoal || 'Aktiv bleiben'}

💰 **4. FINANZ-RADAR**
- Heutige Ausgaben: ${currency}${todaySpend.toFixed(2)} (Tageslimit: ${currency}${dailyLimit})

🧊 **5. MEAL & KÜHLSCHRANK CHECK**
- Vorhanden: ${inStockItems}
- Nachkaufen: ${lowStockItems}

🌍 **6. WORLD PULSE (BREAKING NEWS)**
${newsHighlights}

🎯 **7. AGENT HUNTER TAGESBEFEHL**
(1 konkrete High-Impact Mission, um heute den Leistungszustand Richtung 10.0 zu steigern)
`.trim();

  return { prompt, dayNameDe, todaySpend, dailyLimit, habitsPending, habitsDone, habitsTotal, perf };
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
Du bist der E.O.M Smart Nutrition & Kitchen Agent von Agent Hunter (A.H.).
Analysiere die aktuell im Kühlschrank vorhandenen Lebensmittel und erstelle 2 bis 3 gesunde, leckere Rezeptideen.

Benutzer-Profil:
- Fitness-Ziel: ${profile.fitnessGoal || 'Ausgewogene Ernährung'}
- Gewicht: ${profile.weight || 'N/A'} kg (Ziel: ${profile.targetWeight || 'N/A'} kg)
${customPref ? `- Zusätzliche Wünsche: ${customPref}` : ''}

VORHANDENE ZUTATEN (In Stock):
${inStock.length > 0 ? inStock.map(i => `- ${i}`).join('\n') : '- Keine eingetragen (bitte einfache Alltagszutaten vorschlagen)'}

BEREITS AUSGEGANGENE ZUTATEN:
${notInStock.length > 0 ? notInStock.join(', ') : 'Keine'}

Formatierungs-Regeln für deine Antwort:
1. Für jedes Rezept:
   - 🍲 **Rezept-Name** & Zubereitungszeit
   - 🥑 **Makros & Kalorien (Schätzung)**
   - 🥗 **Zutaten aus deinem Kühlschrank** (bereits da)
   - 🛒 **Fehlende Zutaten** (was gekauft werden müsste)
   - 👨‍🍳 **Zubereitungsschritte in 3-4 kurzen Schritten**

2. Am Ende erstelle eine maschinenlesbare Einkaufslisten-Sektion:
[MISSING_INGREDIENTS: Zutat 1, Zutat 2, Zutat 3]
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
