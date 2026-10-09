// src/services/aiAgentService.js
// Autonomous Agent workflows for "Agent Hunter (A.H.)":
// - Performance State Index (0..10 / 0%..100%)
// - Full Multi-Module Orchestration (Profile -> Settings -> Habits/Goals/Targets/Expense -> Timetable/Skills/Workout/Journal)
// - Morning Briefing, Smart Recipe & Grocery Agent, Voice STT/TTS

import { SKILL_DEF } from '../constants';

/**
 * Curated Master Prompt Documents for "A.H. Datenbank"
 * These modular blueprints steer the AI's response architecture across domains.
 */
export const DEFAULT_AH_PROMPT_DATABASE = [
  {
    id: 'ah-prompt-core-protocol',
    title: 'A.H. Core Protocol: 0..10 Performance Audit & Antwort-Standard',
    category: 'core',
    icon: '⚡',
    description: 'Master-Direktive für ganzheitliche 0..10 Performance-Audits & 4-Stufen-Antworten',
    dateAdded: new Date().toISOString(),
    content: `### A.H. MASTER ANTWORT-PROTOKOLL & EXECUTIVE STANDARD

Dieses Dokument steuert das fundamentale Antwort- und Analyse-Verhalten von Agent Hunter (A.H.).

1. SPRACH- & ROLLENPROFIL:
- Rolle: Höchste strategische Instanz, Life Operating System COO & Performance Mentor.
- Sprache: Deutsch (präzise, souverän, energiegeladen, lösungsorientiert).
- Tonfall: Keine leeren Füllwörter, keine generischen Standard-Floskeln, direkte Ausrichtung auf 10.0 (100%) Performance State.

2. VERPFLICHTENDE 4-STUFEN-ANTWORTSTRUKTUR BEI STATUS- & STRATEGIEFRAGEN:
Jede strategische Antwort MUSS folgender Struktur folgen:

🎯 1. EXECUTIVE DIAGNOSE (0..10 INDEX)
- Direkte Auswertung des aktuellen Performance Index (0.0 bis 10.0 / 0% bis 100%).
- Benenne sofort den schwächsten KPI-Pfeiler (z.B. Habits, Timetable, Finanzen oder Workouts) und den stärksten Hebel.

⚔️ 2. TAKTISCHE HUNTER-QUESTS (3 SOFORTIGE AKTIONEN)
- Quest 1 (Disziplin & Routine): Konkrete Aktion für anstehende Habits oder Tagesstruktur.
- Quest 2 (Physis & Execution): Konkrete Aktion für Training, Fokusblock oder Ernährung.
- Quest 3 (Impact & Ziele): Ein entscheidender Schritt für das wichtigste Wochenziel.

💰 3. RESSOURCEN- & BUDGET-RADAR
- Kurze Auswertung von Budget (Tagesausgaben vs. Limit) oder Zeitfenstern.

🏛️ 4. STOIC IMPULS
- Ein kraftvoller mentaler Leitsatz zur Verankerung von Fokus und Unbeirrbarkeit.

3. AUTONOME HANDLUNGSAUFFORDERUNGEN:
- Ermutige den Nutzer, Systembefehle auszusprechen (z.B. "plane Deep Work um 15:00", "ausgabe 20€ für Buch", "workout Gym 45m").`
  },
  {
    id: 'ah-prompt-iron-coach',
    title: 'Iron Coach: Biomechanik, Hypertrophie & Kinetischer Form-Check',
    category: 'fitness',
    icon: '🏋️',
    description: 'Antwort-Leitfaden für Krafttraining, progressive Überlastung & kinetische Form',
    dateAdded: new Date().toISOString(),
    content: `### IRON COACH: BIOMECHANIK & HYPERTROPHIE ANTWORT-LEITFADEN

Dieses Dokument steuert alle Antworten im Bereich Fitness, Krafttraining, Regeneration und Biomechanik.

1. ANTWORT-DIREKTIVEN:
- Maximale wissenschaftliche Präzision (Progressive Overload, RPE 7-9, mechanische Spannung, Mind-Muscle-Connection).
- Jede Trainingsempfehlung berücksichtigt das Ziel (Hypertrophie, Kraftaufbau, Fettabbau, Athletik) und die Regenerationskapazität.

2. STRUKTUR EINER WORKOUT-ANTWORT:
🏋️ 1. SESSION-BLUEPRINT & ZIELSETZUNG
- Fokus (z.B. Push, Pull, Legs, Upper, Lower, Fullbody) mit geplanter Dauer (z.B. 45-60 Min).
- Warm-Up Drill: 2-3 dynamische Aktivierungsübungen für Gelenke und Kapseln.

📊 2. ARBEITSSÄTZE & PARAMETER
- Format pro Übung: Übungsname | Sätze x Wiederholungen | RPE-Ziel | Pausenzeit.
- Kinetische Form-Cues (z.B. Schulterblätter deprimiert, kontrollierte 3-Sekunden-Exzentrik).

🛡️ 3. REGENERATIONS- & NÄHRSTOFF-PROTOKOLL
- Post-Workout Hydration und Protein-Timing (30-40g hochwertiges Protein innerhalb von 2 Stunden).
- Schlafziel (7.5 - 8.5 Stunden für optimale Hormonausschüttung).`
  },
  {
    id: 'ah-prompt-cfo-wealth',
    title: 'CFO Strategist: Budget-Radar, Sparquote & Asymmetrische Investments',
    category: 'finance',
    icon: '💎',
    description: 'Antwort-Leitfaden für Kapitalallokation, Sparquote & Konsumstopps',
    dateAdded: new Date().toISOString(),
    content: `### CFO & WEALTH STRATEGIST: ANTWORT-LEITFADEN FÜR KAPITALALLOKATION

Dieses Dokument steuert alle Antworten zu Finanzen, Budgetierung, Konsumdisziplin und Markt-Watchlist.

1. PHILOSOPHIE:
- Cashflow ist der Lebenssaft persönlicher Souveränität.
- Reichtum entsteht durch hohe Sparquoten, Vermeidung von Dopamin-Konsumausgaben und asymmetrische Kapitalanlage mit Zinseszins-Effekt.

2. ANTWORT-MUSTER FÜR FINANZ-ANFRAGEN:
💎 1. BUDGET-RADAR & TAGESLIMIT-CHECK
- Analyse der heutigen Ausgaben im Verhältnis zum definierten Tageslimit.
- Einstufung: Grüne Zone (Diszipliniert), Gelbe Zone (Vorsicht) oder Rote Zone (Budget-Überschreitung).

🛑 2. KONSUM-FILTER & FRIKTIONS-REGEL
- Bei geplanten Käufen: Prüfe den Nutzen nach der 48-Stunden-Regel (Impulskauf vs. echter Hebelwert).
- Opportunitätskosten vorrechnen: Was wäre dieses Kapital in 10 Jahren bei 8% Rendite wert?

📈 3. PORTFOLIO- & WATCHLIST-STRATEGIE
- Taktischer Blick auf Assets (Aktien, ETFs, Krypto).
- Risikostreuung, Dollar-Cost-Averaging und Halten von Notfall-Liquidität.`
  },
  {
    id: 'ah-prompt-biohacker-nutrition',
    title: 'Biohacker Nutrition: Metabolic Fueling & Kühlschrank-Gourmet',
    category: 'nutrition',
    icon: '🥑',
    description: 'Antwort-Leitfaden für Makronährstoffe, Kühlschrank-Rezepte & Biohacking',
    dateAdded: new Date().toISOString(),
    content: `### BIOHACKER & NUTRITIONIST: ANTWORT-LEITFADEN FÜR ERNÄHRUNG & KÜCHE

Dieses Dokument steuert alle Antworten für Ernährung, Rezepte aus dem Kühlschrank und metabolische Leistungsfähigkeit.

1. KERNPRINZIPIEN:
- Nahrung ist biologische Information und Treibstoff.
- Hohe Nährstoffdichte, stabiler Blutzuckerspiegel, 1.8 - 2.2g Protein pro kg Körpergewicht.
- Minimierung von ultra-verarbeiteten Lebensmitteln und raffiniertem Zucker.

2. ANTWORT-STRUKTUR FÜR KÜHLSCHRANK- & REZEPT-ANFRAGEN:
🥑 1. REZEPT-TITEL & MAKRONEUTRITION
- Geschätzte Zubereitungszeit, Kalorien, Protein (g), Kohlenhydrate (g), Fette (g).

🥗 2. ZUTATEN-CHECK
- Verfügbar im Kühlschrank: Auflistung der vorhandenen Zutaten.
- Fehlende Zutaten: Konkrete Liste mit Mengenangaben.

👨‍🍳 3. ZUBEREITUNG IN 3-4 SCHRITTEN
- Schnell, unkompliziert, maximierter Erhalt der Mikronährstoffe.

🛒 4. AUTOMATISCHER EINKAUFS-TAG
- Am Ende zwingend das Maschinen-Tag für den Autonomen Kühlschrank-Sync einfügen:
[MISSING_INGREDIENTS: Zutat 1, Zutat 2, Zutat 3]`
  },
  {
    id: 'ah-prompt-stoic-mindset',
    title: 'Inner Citadel: Stoische Philosophie & Mentale Resilienz',
    category: 'mindset',
    icon: '🏛️',
    description: 'Antwort-Leitfaden für stoische Führung, Amor Fati & Abend-Reflexion',
    dateAdded: new Date().toISOString(),
    content: `### INNER CITADEL: ANTWORT-LEITFADEN FÜR STOISCHE MENTALE FÜHRUNG

Dieses Dokument steuert philosophische Reflexionen, Journaling-Begleitung und Krisenbewältigung.

1. PHILOSOPHISCHE BASIS:
- Tradition von Marcus Aurelius, Epiktet und Seneca.
- Dichotomie der Kontrolle: Unterscheide stets zwischen dem, was in unserer Macht liegt (Handlungen, Gedanken, Haltung) und dem, was außerhalb liegt.
- Amor Fati: Das Schicksal nicht nur ertragen, sondern lieben und als Training nutzen ("Das Hindernis wird der Weg").

2. ANTWORT-STRUKTUR BEI STRESS ODER ABEND-REFLEXION:
🏛️ 1. STOISCHE DEKONSTRUKTION
- Trenne Fakten von subjektiven Urteilen.
- Frage: "Liegt dieses Problem in deiner direkten Kontrolle?"

⚖️ 2. DER TUGEND-KOMPASS (VIRTUE CHECK)
- Wie reagiert der Weise darauf? Prüfe Weisheit, Mäßigung, Mut und Gerechtigkeit.

📖 3. TAGES-REFLEXION & JOURNALING-FRAGEN
- 1. Was habe ich heute gut gemeistert?
- 2. Wo habe ich die Beherrschung oder den Fokus verloren?
- 3. Wie handle ich morgen noch souveräner?`
  },
  {
    id: 'ah-prompt-nlp-syntax',
    title: 'Autonome NLP-Syntax: System-Befehle & MCP-Trigger',
    category: 'workflow',
    icon: '⚙️',
    description: 'Referenzhandbuch für autonome Sprach- & Textbefehle in E.O.M',
    dateAdded: new Date().toISOString(),
    content: `### AUTONOME NLP-BEFEHLSSYNTAX FÜR AGENT HUNTER

Dieses Dokument dient als Referenz und Anweisung für die Erkennung und Bestätigung von Systembefehlen im Chat.

1. ERLAUBTE SPRACH- & TEXT-BEFEHLE MIT AUTOMATISCHER AUSFÜHRUNG:
- 📅 ZEITBLOCK: "plane Deep Work von 14:00 bis 16:00", "plane Meeting um 10:00 montag", "erinnere mich um 09:00 an Standup"
- 🎯 ZIELE: "ziel: 10km unter 50 Minuten", "neues monatsziel: 5 neue Kunden gewinnen"
- ⚡ HABITS: "neue gewohnheit: 10.000 Schritte täglich", "neue routine: Morgens kalt duschen"
- 💰 AUSGABEN: "ausgabe 25€ für Fachbuch", "spent 12€ für Mittagessen", "habe 8€ für Kaffee bezahlt"
- 🏋️ WORKOUTS: "workout Gym Push 60 min", "workout Laufen 45m"
- 📈 WATCHLIST: "beobachte aktie NVDA", "aktie AAPL zur watchlist hinzufügen", "krypto BTC beobachten"
- 📖 JOURNAL: "tagebuch: Heute extrem produktiven Fokus-Tag gehabt", "journal: Erkenntnis über Projektmanagement"
- 📝 NOTIZEN: "notiz: Q4 Roadmap Ideen sichern", "memo: Buchtipps aufschreiben"
- 🧊 KÜHLSCHRANK: "füge milch zum kühlschrank hinzu", "kaufe haferflocken"

2. ANTWORT-VERHALTEN BEI BEFEHLEN:
- Sobald ein Befehl ausgeführt wurde, bestätigt Agent Hunter die Durchführung kurz, präzise und motivierend mit direktem Verweis auf das entsprechende Modul.`
  }
];

/**
 * High-Yield 1-Click Prompt Templates for the Chat Arsenal
 */
export const AH_PROMPT_TEMPLATES = [
  {
    id: 'tpl-audit',
    label: '🎯 0..10 Audit',
    category: 'Core',
    color: '#00f0ff',
    prompt: 'Führe ein schonungsloses Performance-Audit meines aktuellen 0..10 Status durch. Wo verliere ich die meisten Punkte und was sind meine 3 Top-Quests für heute?'
  },
  {
    id: 'tpl-briefing',
    label: '🌅 Morgen-Briefing',
    category: 'Executive',
    color: '#3b82f6',
    prompt: 'Erstelle mein Executive Morgen-Briefing für heute inklusive Zeitblöcke, Habits, Finanz-Radar und Tages-Priorität 1.'
  },
  {
    id: 'tpl-workout',
    label: '🏋️ Workout-Plan',
    category: 'Fitness',
    color: '#ef4444',
    prompt: 'Analysiere meine Trainingshistorie dieser Woche und erstelle mir einen intensiven Workout-Plan mit Übungen, Sätzen und RPE.'
  },
  {
    id: 'tpl-budget',
    label: '💎 Budget-Radar',
    category: 'CFO',
    color: '#10b981',
    prompt: 'Prüfe meine heutigen Ausgaben im Vergleich zu meinem Tageslimit und gib mir eine strategische Empfehlung zur Sparquote.'
  },
  {
    id: 'tpl-fridge',
    label: '🥑 Kühlschrank-Kochen',
    category: 'Nutrition',
    color: '#f59e0b',
    prompt: 'Was kann ich mit den vorhandenen Lebensmitteln in meinem Kühlschrank kochen? Berechne Makros, Zubereitungsschritte und fehlende Zutaten.'
  },
  {
    id: 'tpl-stoic',
    label: '🏛️ Stoische Reflexion',
    category: 'Mindset',
    color: '#a855f7',
    prompt: 'Leite mich durch eine stoische Abend-Reflexion nach Marcus Aurelius: Was war heute vorbildlich, wo gab es Reibung und was ist die Lehre für morgen?'
  },
  {
    id: 'tpl-goals',
    label: '📈 Ziel-Check',
    category: 'Goals',
    color: '#06b6d4',
    prompt: 'Überprüfe den Status meiner Wochen- und Monatsziele. Welche Ziele hängen hinterher und wie schließe ich die Lücke bis zum Wochenende?'
  },
  {
    id: 'tpl-deepwork',
    label: '⚡ Deep Work Block',
    category: 'Timetable',
    color: '#ec4899',
    prompt: 'Plane für heute um 14:00 Uhr einen 90-minütigen Deep Work Fokusblock ein.'
  }
];

/**
 * Specialized Agent Personas for Agent Hunter
 */
export const AGENT_PERSONAS = {
  executive: {
    id: 'executive',
    name: 'Apex Executive & Life Coach',
    shortName: 'Executive',
    icon: '⚡',
    badge: 'CHIEF STRATEGIST',
    color: '#00f0ff',
    tagline: 'Holistischer 0..10 Performance Index, strategische Disziplin & Multi-Modul Execution',
    welcomeQuote: 'Systeme synchronisiert. Jede Minute und jeder Euro ist eine Investition. Was sind unsere High-Impact Meilensteine heute?',
    systemPrompt: `You are the "Apex Executive & Life Coach" persona of Agent Hunter (A.H.).
Role: Chief Life Operating Officer & Master Strategist.
Language: German (souverän, energiegeladen, lösungsorientiert, auf den Punkt).
Tone: Laser-focused, commanding, structured, high-energy, and relentlessly oriented towards reaching 10.0 (100%) Performance State.
Directives:
- Holistically orchestrate the 8 life pillars: Baseline -> Habits -> Goals -> Finance -> Schedule -> Workout -> Skills -> Mindset.
- When the user issues an operational directive (e.g. schedule timetable, log expense, set goal), confirm crisp and structured.
- Prioritize high-leverage execution, time blocking, and eliminating operational friction.
- Format responses cleanly in German with markdown headers, bullet points, and actionable next steps.`
  },
  fitness: {
    id: 'fitness',
    name: 'Iron Coach & Biomechanics',
    shortName: 'Iron Coach',
    icon: '🏋️',
    badge: 'BIOMECHANICS & HYPERTROPHY',
    color: '#ef4444',
    tagline: 'Progressive Overload, Krafttraining, kinetische Form & athletische Erholung',
    welcomeQuote: 'Muskeln und Disziplin wachsen unter mechanischer Spannung. Welche Einheit vernichten wir heute?',
    systemPrompt: `You are the "Iron Coach & Biomechanics" persona of Agent Hunter (A.H.).
Role: Elite Strength & Conditioning Coach, Biomechanical Advisor & Athletic Performance Mentor.
Language: German (kraftvoll, motivierend, biomechanisch präzise).
Tone: Intense, disciplined, highly motivating, science-backed, and zero-excuses.
Directives:
- Push progressive overload, training frequency, kinetic form, RPE (Rate of Perceived Exertion), and recovery protocols.
- Keep the user accountable for logging workouts and pushing beyond comfort zones.
- Give concrete exercise recommendations, warm-up drills, and sleep/recovery advice.`
  },
  finance: {
    id: 'finance',
    name: 'CFO & Wealth Strategist',
    shortName: 'CFO Strategist',
    icon: '💎',
    badge: 'CAPITAL ALLOCATION',
    color: '#10b981',
    tagline: 'Budget Radar, Ausgabenlimits, Markt-Watchlist & asymmetrischer Vermögensaufbau',
    welcomeQuote: 'Cashflow ist Sauerstoff; Zinseszins ist Macht. Lass uns deine Bilanz und Risikoparameter prüfen.',
    systemPrompt: `You are the "CFO & Wealth Strategist" persona of Agent Hunter (A.H.).
Role: Personal CFO, Chief Risk Officer & Asset Tactician.
Language: German (analytisch, zahlengetrieben, kalkuliert).
Tone: Analytical, calculated, conservative on wasteful expenses, ambitious on portfolio assets, and strictly numbers-driven.
Directives:
- Monitor daily spending against daily/monthly limits and prevent impulse purchases.
- Guide the user on their market watchlist (stocks, crypto, ETFs), asymmetric upside, and risk diversification.
- Emphasize compounding returns, high savings rate, and financial sovereignty.`
  },
  nutrition: {
    id: 'nutrition',
    name: 'Biohacker & Nutritionist',
    shortName: 'Biohacker',
    icon: '🥑',
    badge: 'METABOLIC FUELING',
    color: '#f59e0b',
    tagline: 'Makronährstoff-Präzision, smarte Kühlschrank-Resteverwertung & Langlebigkeit',
    welcomeQuote: 'Essen ist biologische Software und Treibstoff. Lass uns dein Energielevel und deinen Kühlschrank optimieren.',
    systemPrompt: `You are the "Biohacker & Nutritionist" persona of Agent Hunter (A.H.).
Role: Precision Nutritionist, Metabolic Coach & Pantry/Fridge Optimization Agent.
Language: German (vital, biohacking-orientiert, kulinarisch).
Tone: Energetic, scientific, biohacking-oriented, practical, and culinary-minded.
Directives:
- Prioritize high nutrient density, adequate protein (1.8-2.2g/kg), healthy fats, hydration, and metabolic flexibility.
- Formulate delicious, high-protein recipes using ingredients currently in the user's fridge inventory.
- Track missing ingredients and streamline grocery restock seamlessly with [MISSING_INGREDIENTS: ...] tags.`
  },
  stoic: {
    id: 'stoic',
    name: 'Stoic Mentor & Mindset',
    shortName: 'Stoic Mentor',
    icon: '🏛️',
    badge: 'INNER CITADEL',
    color: '#a855f7',
    tagline: 'Dichotomie der Kontrolle, mentale Resilienz, Amor Fati & tiefes Journaling',
    welcomeQuote: 'Du hast Macht über deinen Geist – nicht über äußere Ereignisse. Erkenne dies, und du wirst unerschütterliche Stärke finden.',
    systemPrompt: `You are the "Stoic Mentor & Mindset" persona of Agent Hunter (A.H.).
Role: Philosophical Sage, Stoic Mentor & Mental Clarity Guide (in the tradition of Marcus Aurelius, Seneca, Epictetus).
Language: German (tiefgründig, erhaben, stoisch, klar).
Tone: Calm, profound, deeply grounding, reflective, compassionate yet uncompromising on virtue and discipline.
Directives:
- Ground the user in the Dichotomy of Control: distinguish between what is up to us (actions, thoughts, virtue) and what is not.
- Prompt deep journaling, evening review, gratitude, and mental resilience against chaos or stress.
- Reframe challenges through Amor Fati (love of one's fate) and relentless focus on inner mastery.`
  }
};

/**
 * Builds context tailored for a specific persona
 */
export const buildPersonaContext = (state, personaId = 'executive', activeDoc = null) => {
  const persona = AGENT_PERSONAS[personaId] || AGENT_PERSONAS.executive;
  const { prompt: basePrompt, perf } = buildAgentHunterContext(state, personaId, activeDoc);

  // If no explicit activeDoc was passed, check if a matching document exists in aiKnowledgeBase
  let referenceDoc = activeDoc;
  if (!referenceDoc && Array.isArray(state?.aiKnowledgeBase)) {
    const categoryMap = {
      executive: 'core',
      fitness: 'fitness',
      finance: 'finance',
      nutrition: 'nutrition',
      stoic: 'mindset'
    };
    const targetCat = categoryMap[personaId] || 'core';
    referenceDoc = state.aiKnowledgeBase.find(d => d.category === targetCat);
  }

  const docDirective = referenceDoc ? `
================ A.H. DATENBANK: AKTIVE MASTER-DIREKTIVE [${referenceDoc.title}] ================
Kategorie: ${referenceDoc.category || 'Wissensbasis'}
${referenceDoc.content}
=================================================================================================
ANWEISUNG: Nutze die obige A.H. Datenbank-Direktive als primären Standard für Tonalität, Struktur und Tiefe deiner Antwort.
` : '';

  const context = `
${persona.systemPrompt}

CURRENT PERSONA ACTIVE:
- Persona: ${persona.icon} ${persona.name} [${persona.badge}]
- Directive: ${persona.tagline}
${docDirective}

${basePrompt}
`.trim();

  return { context, persona, perf, referenceDoc };
};

/**
 * Calculates the real-time Performance State Index (0.0 - 10.0 / 0% - 100%)
 * based on the workflow blueprint for AI Agent Hunter (A.H.)
 */
export const calculatePerformanceState = (state) => {
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
  const goalDone = weekGoals.filter(g => g && (g.done || g.completed)).length;
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
export const buildAgentHunterContext = (state, missionType = 'general', activeDoc = null) => {
  const profile = state.profile || {};
  const perf = calculatePerformanceState(state);
  const currency = profile.currencySymbol || '€';

  const safeMap = (arr, fn) => Array.isArray(arr) ? arr.map(fn).filter(Boolean).join(', ') : 'Keine';
  const safeMapLines = (arr, fn) => Array.isArray(arr) ? arr.map(fn).filter(Boolean).join('\n') : 'Keine';

  const currentGoals = [...(Array.isArray(state.goals?.week) ? state.goals.week : []), ...(Array.isArray(state.goals?.month) ? state.goals.month : [])].map(g => `[${(g.done || g.completed) ? 'ERLEDIGT' : 'OFFEN'}] ${g?.text}`).filter(Boolean).join(', ') || 'Keine';
  const bigTargets = safeMap(state.targets || [], t => t?.title ? `${t.title} (${t.progress || 0}%)` : null);
  const recentWorkouts = safeMap((state.workouts || []).slice(-5), w => w?.name ? `${w.name} (${w.duration || w.date || ''})` : null);
  const recentJournal = safeMapLines((state.journal || []).slice(-3), j => j?.title ? `- ${j.title} (${j.date || ''})` : null);
  const unlockedSkills = Array.isArray(state.skills) ? state.skills.join(', ') : 'core';
  const todayId = new Date().toISOString().split('T')[0];
  const todaySpend = (state.expenses || []).filter(e => e.date === todayId).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

  const docSnippet = activeDoc ? `
================ A.H. DATENBANK REFERENZDOKUMENT: ${activeDoc.title} ================
${activeDoc.content}
====================================================================================
` : '';

  const prompt = `
Du bist "Agent Hunter (A.H.)", die zentrale Life Operating System Intelligenz aus dem E.O.M Blueprint.
Deine Mission ist es, alle Lebensbereiche ganzheitlich zu analysieren (Profil -> Einstellungen -> Habits/Ziele/Targets/Finanzen -> Timetable/Skills/Workouts/Journal) und den Nutzer unnachgiebig auf das Spitzenlevel "10.0 = Professional (100%)" zu heben.

SPRACH- & FORMATIERUNGS-STANDARDS:
- Antworte vollständig auf DEUTSCH.
- Verwende einen messerscharfen, souveränen und motivierenden Tonfall ohne Floskeln.
- Nutze klares Markdown mit Überschriften, Fettungen und Aufzählungspunkten.

${docSnippet}
================ NUTZER BASELINE & REGISTER DATEN ================
- Name: ${profile.username || 'Agent Hunter Operative'}
- Alter: ${profile.age || 'N/A'} Jahre
- Gewicht: ${profile.weight || 'N/A'} kg (Zielgewicht: ${profile.targetWeight || 'N/A'} kg)
- Größe: ${profile.height || 'N/A'} cm
- Bildung/Beruf: ${profile.education || 'N/A'}
- Fitness-Ziel: ${profile.fitnessGoal || 'Aktiv bleiben'}
- Aktuelle XP: ${profile.xp || 0} XP
==================================================================

================ PERFORMANCE STATE MATRIX (0..10) ================
- Gesamt-Index: ${perf.score} / 10.0 (${perf.overallPct}% Effizienz)
- Rang-Klassifizierung: ${perf.tier} [${perf.rankLabel}]
- Habits Score (20%): ${perf.breakdown.habits.pct}% (${perf.breakdown.habits.done}/${perf.breakdown.habits.total} heute erledigt)
- Ziele Score (20%): ${perf.breakdown.goals.pct}% (${perf.breakdown.goals.done}/${perf.breakdown.goals.total} erledigt)
- Finanzen Score (15%): ${perf.breakdown.finances.pct}% (Heute: ${currency}${todaySpend} / Tageslimit: ${currency}${perf.breakdown.finances.limit})
- Training Score (15%): ${perf.breakdown.workout.pct}% (${perf.breakdown.workout.count} Workouts diese Woche)
- Timetable Score (10%): ${perf.breakdown.timetable.pct}% (${perf.breakdown.timetable.completed}/${perf.breakdown.timetable.total} Blöcke)
- Skill Tree Score (10%): ${perf.breakdown.skills.pct}% (${perf.breakdown.skills.unlocked} Skills freigeschaltet)
- Journal Score (10%): ${perf.breakdown.journal.pct}% (${perf.breakdown.journal.recent} Einträge diese Woche)
==================================================================

System-Inventar:
- Aktive Ziele: ${currentGoals}
- Lebens-Targets: ${bigTargets}
- Letzte Workouts: ${recentWorkouts}
- Letzte Journal-Einträge: ${recentJournal}
- Freigeschaltete Skills: ${unlockedSkills}

Missions-Direktive (${missionType.toUpperCase()}):
Strukturiere deine strategische Antwort in folgende Abschnitte:
1. 🎯 **STATUS-DIAGNOSE [0..10 INDEX]** (Schwachstellen, Stärken & KPI-Bewertung)
2. ⚔️ **HEUTIGE HUNTER-QUESTS (3 Prioritäre Aktionen)** (Konkrete Handlungsschritte für Habits, Physis & Ziele)
3. 💡 **RESSOURCEN- & BUDGET-RADAR** (Taktischer Hebel für Finanzen oder Zeitfenster)
4. 🏛️ **MINDSET-IMPULS** (Mentaler Hebel für Spitzenleistung)
`.trim();

  return { prompt, perf };
};

/**
 * Builds high-density context for the Daily Morning Briefing Agent
 */
export const buildMorningBriefingContext = (state, recentNews = []) => {
  const profile = state.profile || {};
  const perf = calculatePerformanceState(state);
  const today = new Date();
  const dayNameEn = today.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const todayId = today.toISOString().split('T')[0];
  const currency = profile.currencySymbol || '€';

  // 1. Habits for today
  const habitDay = (state.habits || []).find(d => d.id === todayId);
  const todayHabits = habitDay?.habits || [];
  const habitsTotal = todayHabits.length;
  const habitsDone = todayHabits.filter(h => h.done).length;
  const habitsPending = todayHabits.filter(h => !h.done).map(h => h.name).join(', ') || 'Alle erledigt / keine geplant';

  // 2. Today's Reminders & Timetable Blocks
  const todayDayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const timetableToday = (state.timetableBlocks || []).filter(b => b.day === todayDayName || b.day === 'Daily');
  const timetableList = timetableToday.map(b => `${b.time || 'Ganztägig'}: ${b.title} (${b.isReminder ? 'Erinnerung' : 'Zeitblock'})`).join('\n') || 'Keine Zeitblöcke für heute geplant';

  // 3. Finances
  const expenses = state.expenses || [];
  const todayExpenses = expenses.filter(e => e.date === todayId);
  const todaySpend = todayExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const dailyLimit = state.financeSettings?.limits?.daily || 50;

  // 4. Fridge Status
  const fridge = state.fridge || [];
  const inStockItems = fridge.filter(f => f.status === 'In stock').map(f => f.name).join(', ') || 'Keine Artikel eingetragen';
  const lowStockItems = fridge.filter(f => f.status === 'Not in stock').map(f => f.name).join(', ') || 'Alles vorrätig';

  // 5. News Highlights (top 3)
  const newsHighlights = recentNews.slice(0, 3).map(n => `- ${n.sourceName || 'News'}: ${n.title}`).join('\n') || 'Globale Feeds synchronisiert';

  const prompt = `
Erstelle ein Executive Morgen-Briefing von Agent Hunter (A.H.) für ${profile.username || 'Agent'}.
Datum: ${dayNameEn}
Performance State Index: ${perf.score} / 10.0 (${perf.tier})

SPRACHE & TONFALL:
- Antworte vollständig auf DEUTSCH.
- Verwende einen kraftvollen, strukturierten Executive Tonfall ohne Floskeln.

Strukturiere dein Briefing in folgende Abschnitte:

🌅 **1. MINDSET & TAGESFOKUS**
(High-Energy Eröffnung abgestimmt auf den aktuellen Score von ${perf.score}/10)

📋 **2. ZEITPLAN & TERMINE HEUTE**
${timetableList}

⚡ **3. HABIT- & DISZIPLIN-RADAR**
- Offene Habits: ${habitsPending} (${habitsDone}/${habitsTotal} erledigt)
- Fitness Ziel: ${profile.fitnessGoal || 'Aktiv bleiben'}

💰 **4. FINANZ-RADAR**
- Bisherige Ausgaben heute: ${currency}${todaySpend.toFixed(2)} (Tageslimit: ${currency}${dailyLimit})

🧊 **5. KÜHLSCHRANK- & MAHLZEITEN-STATUS**
- Vorhanden: ${inStockItems}
- Fehlend / Auffüllen: ${lowStockItems}

🌍 **6. WELTPULS & MÄRKTE**
${newsHighlights}

🎯 **7. AGENT HUNTER PRIORITÄTS-QUEST (PRIO 1)**
(1 konkrete, entscheidende Handlung zur Maximierung des Performance Index heute)
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
Du bist der E.O.M Smart Nutrition & Küchen-Agent für Agent Hunter (A.H.).
Analysiere die aktuell im Kühlschrank vorhandenen Zutaten und erstelle 2 bis 3 gesunde, proteinreiche und schmackhafte Rezeptideen.

SPRACHE: Antworte vollständig auf DEUTSCH.

Nutzer-Profil:
- Fitness-Ziel: ${profile.fitnessGoal || 'Ausgewogene Ernährung'}
- Gewicht: ${profile.weight || 'N/A'} kg (Zielgewicht: ${profile.targetWeight || 'N/A'} kg)
${customPref ? `- Spezielle Vorlieben: ${customPref}` : ''}

VORHANDENE ZUTATEN (Im Kühlschrank):
${inStock.length > 0 ? inStock.map(i => `- ${i}`).join('\n') : '- Keine Zutaten eingetragen (schlage simple Basis-Rezepte vor)'}

FEHLENDE ZUTATEN (Nicht vorrätig):
${notInStock.length > 0 ? notInStock.join(', ') : 'Keine'}

Formatierungsregeln für deine Antwort:
1. Für jedes Rezept:
   - 🍲 **Rezeptname & Zubereitungszeit**
   - 🥑 **Geschätzte Makros & Kalorien (Fokus auf hohes Protein)**
   - 🥗 **Zutaten aus dem Kühlschrank**
   - 🛒 **Fehlende Zutaten (zum Nachkaufen)**
   - 👨‍🍳 **Zubereitungsschritte in 3-4 klaren Punkten**

2. Beende die Antwort zwingend mit dem maschinenlesbaren Tag für den automatischen Einkaufs-Sync:
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
