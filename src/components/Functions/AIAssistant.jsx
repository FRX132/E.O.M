/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAI } from '../../hooks/useAI';
import { useStore } from '../../store';
import { SKILL_DEF } from '../../constants';
import {
    calculatePerformanceState,
    buildAgentHunterContext,
    buildPersonaContext,
    buildMorningBriefingContext,
    buildRecipeAgentContext,
    extractMissingIngredients,
    speakAgentText,
    stopAgentSpeech,
    createSpeechRecognition,
    AGENT_PERSONAS,
    DEFAULT_AH_PROMPT_DATABASE,
    AH_PROMPT_TEMPLATES
} from '../../services/aiAgentService';
import { playSuccess, playCyberClick } from '../../services/soundService';
import LoadingScreen from '../UI/LoadingScreen';

export default function AIAssistant() {
    const navigate = useNavigate();
    const { isReady, isProcessing, progress, error, generateText } = useAI();
    const [prompt, setPrompt] = useState('');
    const [activeDocId, setActiveDocId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'stats' | 'workflow' | 'knowledge' | 'settings'
    const [actionToast, setActionToast] = useState('');
    const [activePersona, setActivePersona] = useState(() => localStorage.getItem('ah_active_persona') || 'executive');

    // A.H. Prompt-Datenbank Management States
    const [showAddPromptModal, setShowAddPromptModal] = useState(false);
    const [newPromptTitle, setNewPromptTitle] = useState('');
    const [newPromptCategory, setNewPromptCategory] = useState('core');
    const [newPromptContent, setNewPromptContent] = useState('');
    const [previewDocId, setPreviewDocId] = useState(null);

    // Chat History State
    const [messages, setMessages] = useState([
        {
            id: 'init',
            sender: 'agent',
            text: `⚡ **Agent Hunter (A.H.) online.**\n\nSystem Neural MCP Router & Performance State Engine [0..10] synchronisiert.\n\nWähle oben deine **Spezialisierte Persona** (Executive, Iron Coach, CFO, Biohacker, Stoic Mentor) oder erteile direkte **Autonome Aktionen** per Text/Sprache:\n- 📅 *"plane Deep Work um 14:00 montag"*\n- 🎯 *"ziel: 10km unter 50 Minuten laufen"*\n- ⚡ *"neue gewohnheit: 10.000 Schritte"*\n- 💰 *"ausgabe 25€ für bücher"*\n- 🏋️ *"workout bench press 45 min"*\n- 📈 *"beobachte aktie NVDA"*\n- 📖 *"tagebuch: Heute extrem produktiven Fokus-Tag gehabt"*\n- 📝 *"notiz: Projektideen für Q4 festhalten"*\n- 🧊 *"was kann ich aus meinem kühlschrank kochen?"*`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            statusTag: 'ENGINE_INITIALIZED: AgentHunter.js Ready',
            actionCard: null
        }
    ]);

    // Voice Interface States
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speakingMsgId, setSpeakingMsgId] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [voiceLang, setVoiceLang] = useState('de-DE');
    const [speechRate, setSpeechRate] = useState(1.0);
    const recognitionRef = useRef(null);
    const chatEndRef = useRef(null);

    // State from store
    const fullState = useStore(state => state);
    const aiKnowledgeBase = useStore(state => state.aiKnowledgeBase || []);
    const setAiKnowledgeBase = useStore(state => state.setAiKnowledgeBase);
    const addKnowledgeDocument = useStore(state => state.addKnowledgeDocument);
    const deleteKnowledgeDocument = useStore(state => state.deleteKnowledgeDocument);
    const profile = useStore(state => state.profile || {});

    const aiSettings = useStore(state => state.aiSettings) || { provider: 'local', apiKey: '', model: 'gpt-4o-mini', endpoint: '' };
    const setAiSettings = useStore(state => state.setAiSettings);

    const [provider, setProvider] = useState(aiSettings.provider || 'local');
    const [apiKey, setApiKey] = useState(aiSettings.apiKey || '');
    const [model, setModel] = useState(aiSettings.model || 'gpt-4o-mini');
    const [endpoint, setEndpoint] = useState(aiSettings.endpoint || '');

    // Real-time Performance State calculation
    const perf = calculatePerformanceState(fullState);

    // Auto-scroll chat history
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isProcessing]);

    // Cleanup Speech synthesis on unmount
    useEffect(() => {
        return () => {
            stopAgentSpeech();
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const showActionToast = (msg) => {
        setActionToast(msg);
        setTimeout(() => setActionToast(''), 4000);
    };

    // --- PERSONA SWITCHER ---
    const handleSelectPersona = (personaId) => {
        playCyberClick();
        setActivePersona(personaId);
        localStorage.setItem('ah_active_persona', personaId);
        const p = AGENT_PERSONAS[personaId] || AGENT_PERSONAS.executive;
        showActionToast(`${p.icon} Persona aktiv: ${p.name}`);
    };

    // --- AUTONOMOUS ACTION UNDO HANDLER ---
    const handleUndoAction = (msgId, actionCard) => {
        if (!actionCard || actionCard.undone) return;
        const state = useStore.getState();
        const { type, undoPayload } = actionCard;

        try {
            if (type === 'SCHEDULE_TIMETABLE') {
                state.setTimetableBlocks(prev => (prev || []).filter(b => b.id !== undoPayload.blockId));
            } else if (type === 'ADD_EXPENSE') {
                state.setExpenses(prev => (prev || []).filter(e => e.id !== undoPayload.expenseId));
            } else if (type === 'ADD_FRIDGE') {
                state.setFridge(prev => (prev || []).filter(f => f.id !== undoPayload.fridgeId));
            } else if (type === 'COMPLETE_HABIT') {
                state.setHabits(prev => (prev || []).map(d => {
                    if (d.id === undoPayload.dateId) {
                        return {
                            ...d,
                            habits: (d.habits || []).map(h => h.id === undoPayload.habitId ? { ...h, done: false } : h)
                        };
                    }
                    return d;
                }));
            } else if (type === 'LOG_WORKOUT') {
                state.setWorkouts(prev => (prev || []).filter(w => w.id !== undoPayload.workoutId));
            } else if (type === 'ADD_GOAL') {
                state.setGoals(prev => ({
                    ...prev,
                    [undoPayload.period]: (prev?.[undoPayload.period] || []).filter(g => g.id !== undoPayload.goalId)
                }));
            } else if (type === 'ADD_HABIT') {
                if (state.removeCustomHabitTemplate) {
                    state.removeCustomHabitTemplate(undoPayload.templateId);
                }
            } else if (type === 'CREATE_JOURNAL') {
                state.setJournal(prev => (prev || []).filter(j => j.id !== undoPayload.entryId));
            } else if (type === 'ADD_WATCHLIST') {
                state.setWatchlist(prev => (prev || []).filter(s => s.id !== undoPayload.stockId));
            } else if (type === 'ADD_NOTE') {
                state.setEditorFiles(prev => (prev || []).filter(f => f.id !== undoPayload.fileId));
            }

            // Update UI message state to reflect action is undone
            setMessages(prev => prev.map(m => {
                if (m.id === msgId && m.actionCard) {
                    return {
                        ...m,
                        actionCard: { ...m.actionCard, undone: true }
                    };
                }
                return m;
            }));

            playSuccess();
            showActionToast(`↩️ Rückgängig: "${actionCard.title}"`);
        } catch (err) {
            console.error('Error undoing action:', err);
            showActionToast('⚠️ Fehler beim Rückgängig machen der Aktion');
        }
    };

    const handleSaveSettings = () => {
        setAiSettings({ provider, apiKey, model, endpoint });
        showActionToast("💾 AI Settings saved successfully!");
    };

    const getProviderTitle = () => {
        switch (aiSettings.provider) {
            case 'openai': return 'OpenAI GPT-4o';
            case 'anthropic': return 'Anthropic Claude 3.5';
            case 'ollama': return 'Ollama Local LLM';
            case 'lmstudio': return 'LM Studio';
            default: return 'AgentHunter.js (Local)';
        }
    };

    // --- VOICE CONTROLS: TTS ---
    const handleToggleSpeech = (msgId, text) => {
        if (isSpeaking && speakingMsgId === msgId) {
            stopAgentSpeech();
            setIsSpeaking(false);
            setSpeakingMsgId(null);
        } else {
            stopAgentSpeech();
            setIsSpeaking(true);
            setSpeakingMsgId(msgId);
            speakAgentText(text, {
                lang: voiceLang,
                rate: speechRate,
                onEnd: () => {
                    setIsSpeaking(false);
                    setSpeakingMsgId(null);
                },
                onError: () => {
                    setIsSpeaking(false);
                    setSpeakingMsgId(null);
                }
            });
        }
    };

    // --- VOICE CONTROLS: STT ---
    const handleToggleListening = () => {
        if (isListening) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsListening(false);
            return;
        }

        const recognizer = createSpeechRecognition({
            lang: voiceLang,
            continuous: false,
            interimResults: true,
            onResult: ({ transcript }) => {
                setPrompt(transcript);
            },
            onEnd: () => {
                setIsListening(false);
            },
            onError: () => {
                setIsListening(false);
            }
        });

        if (!recognizer.supported) {
            alert("Speech Recognition is not supported in this browser environment. Please use Chrome, Edge, or Electron.");
            return;
        }

        recognitionRef.current = recognizer;
        setIsListening(true);
        recognizer.start();
    };

    // --- PDF UPLOAD ---
    const handleUploadPDF = async () => {
        if (!window.electronAPI) {
            alert("PDF uploading requires the Electron desktop app.");
            return;
        }
        setIsUploading(true);
        try {
            const result = await window.electronAPI.parsePDF();
            if (result && result.success) {
                const newDoc = {
                    id: Date.now().toString(),
                    title: result.fileName,
                    content: result.text,
                    dateAdded: new Date().toISOString()
                };
                addKnowledgeDocument(newDoc);
                showActionToast(`📄 Uploaded "${result.fileName}" to Knowledge Base`);
            } else if (result && result.error && result.error !== 'No file selected') {
                alert("Error parsing PDF: " + result.error);
            }
        } catch (err) {
            alert("Failed to parse PDF.");
        } finally {
            setIsUploading(false);
        }
    };

    // --- A.H. DATENBANK: LOAD DEFAULT MASTER-PROMPTS (6 MODULES) ---
    const handleLoadDefaultPrompts = () => {
        playCyberClick();
        const existing = aiKnowledgeBase || [];
        const existingIds = new Set(existing.map(d => d.id));
        const toAdd = DEFAULT_AH_PROMPT_DATABASE.filter(d => !existingIds.has(d.id));
        if (toAdd.length === 0) {
            showActionToast("⚡ Alle 6 Standard A.H. Master-Prompts sind bereits in der Datenbank!");
            return;
        }
        if (setAiKnowledgeBase) {
            setAiKnowledgeBase([...existing, ...toAdd]);
        } else {
            toAdd.forEach(doc => addKnowledgeDocument(doc));
        }
        playSuccess();
        showActionToast(`⚡ ${toAdd.length} A.H. Master-Prompts erfolgreich geladen!`);
    };

    // --- A.H. DATENBANK: CREATE CUSTOM KNOWLEDGE PROMPT ---
    const handleCreateCustomPrompt = (e) => {
        e.preventDefault();
        if (!newPromptTitle.trim() || !newPromptContent.trim()) {
            alert("Bitte Titel und Inhalt für den Wissens-Prompt eingeben.");
            return;
        }
        const catIcons = {
            core: '⚡',
            fitness: '🏋️',
            finance: '💎',
            nutrition: '🥑',
            mindset: '🏛️',
            workflow: '⚙️',
            custom: '📝'
        };
        const newDoc = {
            id: `ah-prompt-${Date.now()}`,
            title: newPromptTitle.trim(),
            category: newPromptCategory,
            icon: catIcons[newPromptCategory] || '📝',
            description: `Benutzerdefinierter Prompt für A.H. (${newPromptCategory.toUpperCase()})`,
            content: newPromptContent.trim(),
            dateAdded: new Date().toISOString()
        };
        addKnowledgeDocument(newDoc);
        playSuccess();
        showActionToast(`📝 Prompt "${newDoc.title}" zur A.H. Datenbank hinzugefügt!`);
        setNewPromptTitle('');
        setNewPromptContent('');
        setShowAddPromptModal(false);
    };

    // --- SYSTEM CONTEXT BUILDER ---
    const buildSystemContext = (personaKey = activePersona) => {
        const state = useStore.getState();
        const persona = AGENT_PERSONAS[personaKey] || AGENT_PERSONAS.executive;
        const safeMap = (arr, fn) => Array.isArray(arr) ? arr.map(fn).filter(Boolean).join(', ') : 'None';
        const safeMapLines = (arr, fn) => Array.isArray(arr) ? arr.map(fn).filter(Boolean).join('\n') : 'None';
        const currency = state.profile?.currencySymbol || '€';
        const todayId = new Date().toISOString().split('T')[0];
        const todaySpend = (state.expenses || []).filter(e => e.date === todayId).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

        const recentExpenses = Array.isArray(state.expenses) ? state.expenses.slice(-5).map(exp => `${currency}${exp.amount} for ${exp.category}`).join(', ') : 'None';
        const currentGoals = [...(Array.isArray(state.goals?.week) ? state.goals.week : []), ...(Array.isArray(state.goals?.month) ? state.goals.month : [])].map(g => g?.text).filter(Boolean).join(', ') || 'None';
        const habits = safeMap(state.customHabitTemplates || [], h => h?.name ? `${h.name} (${h.repeat || 'Daily'})` : null);
        const assets = safeMap(state.assets, a => a?.name ? `${a.name}: ${currency}${a.amount}` : null);
        const fridgeItems = safeMap(state.fridge, f => f?.name);
        const unlockedSkills = Array.isArray(state.skills) ? state.skills.join(', ') : 'None';
        const recentWorkouts = safeMap((state.workouts || []).slice(-5), w => w?.name ? `${w.name} (${w.duration || w.date || ''})` : null);
        const recentJournal = safeMapLines((state.journal || []).slice(-3), j => j?.title ? `- ${j.title} (${j.date || ''}): ${j.content ? j.content.substring(0, 100) + '...' : ''}` : null);

        return `
${persona.systemPrompt}

CURRENT ACTIVE PERSONA: [${persona.icon} ${persona.name}] (${persona.badge})
Directive & Specialization: ${persona.tagline}

System Context: You are Agent Hunter (A.H.), the executive Life Operating System work-agent and optimizer.
You coordinate the 8 workflow pillars: Register/Profile -> Settings -> Habits/Goals/Targets/Expense -> Timetable/Skills/Workout/Journal.
Your mission is to elevate the user's Performance State towards 10.0 (100% Professional).
--- USER BASELINE ---
Name: ${state.profile?.username || 'Agent'}, Age: ${state.profile?.age || 'N/A'}, Weight: ${state.profile?.weight || 'N/A'}kg, Height: ${state.profile?.height || 'N/A'}cm, Education: ${state.profile?.education || 'N/A'}, Goal: ${state.profile?.fitnessGoal || 'Maintain'}, XP: ${state.profile?.xp || 0}
--- PERFORMANCE STATE (0..10) ---
Current Index: ${perf.score} / 10.0 (${perf.overallPct}% - ${perf.tier} [${perf.rankLabel}])
- Habits Score: ${perf.breakdown.habits.pct}% (${perf.breakdown.habits.done}/${perf.breakdown.habits.total} done today)
- Goals Score: ${perf.breakdown.goals.pct}% (${perf.breakdown.goals.done}/${perf.breakdown.goals.total} done)
- Budget Radar: ${currency}${todaySpend} / Limit ${currency}${perf.breakdown.finances.limit} (${perf.breakdown.finances.pct}%)
- Physical Training: ${perf.breakdown.workout.count} workouts this week (${perf.breakdown.workout.pct}%)
- Timetable Execution: ${perf.breakdown.timetable.pct}% (${perf.breakdown.timetable.completed}/${perf.breakdown.timetable.total} blocks)
- Skill Tree Progression: ${perf.breakdown.skills.pct}% unlocked
- Mindset & Journal: ${perf.breakdown.journal.recent} reflections this week
-----------------
Active Goals: ${currentGoals}
Recent Expenses: ${recentExpenses}
Capital Assets: ${assets}
Active Habits: ${habits}
Fridge Inventory: ${fridgeItems}
Unlocked Skills: ${unlockedSkills}
Recent Workouts: ${recentWorkouts}
Recent Journal Entries: ${recentJournal}
-----------------
${state.aiKnowledgeBase?.find(d => d.id === activeDocId) ? `\n--- ACTIVE REFERENCE DOCUMENT: ${state.aiKnowledgeBase.find(d => d.id === activeDocId).title} ---\n${state.aiKnowledgeBase.find(d => d.id === activeDocId).content.substring(0, 4000)}\n[End of Document]\n-----------------------------` : ''}
        `.trim();
    };

    // --- CHAT PROCESSOR WITH EXTENDED AUTONOMOUS MCP TOOL ROUTER ---
    const executeChatPrompt = async (inputPrompt) => {
        const queryText = (inputPrompt || prompt).trim();
        if (!queryText) return;

        setActiveTab('chat');
        setPrompt('');

        const userMsg = {
            id: Date.now().toString(),
            sender: 'user',
            text: queryText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);

        try {
            const state = useStore.getState();
            const currency = state.profile?.currencySymbol || '€';
            let statusText = '';
            let toolFeedback = '';
            let actionCard = null;
            const lowerPrompt = queryText.toLowerCase();

            // 1. SCHEDULE_TIMETABLE Intent
            if (
                (lowerPrompt.includes('plane') || lowerPrompt.includes('schedule') || lowerPrompt.includes('zeitblock') || lowerPrompt.includes('termin') || lowerPrompt.includes('erinnere mich') || lowerPrompt.includes('reminder') || lowerPrompt.includes('blockiere') || lowerPrompt.includes('zeitfenster')) &&
                !lowerPrompt.includes('trading plan') && !lowerPrompt.includes('was steht im timetable') && !lowerPrompt.includes('zeige mein timetable')
            ) {
                const isReminder = lowerPrompt.includes('erinnere') || lowerPrompt.includes('reminder') || lowerPrompt.includes('alarm');

                // Parse day
                let day = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
                if (lowerPrompt.includes('heute') || lowerPrompt.includes('today')) {
                    day = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
                } else if (lowerPrompt.includes('morgen') && !lowerPrompt.includes('guten morgen') && !lowerPrompt.includes('morning')) {
                    const tom = new Date();
                    tom.setDate(tom.getDate() + 1);
                    day = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(tom);
                } else if (lowerPrompt.includes('übermorgen')) {
                    const ub = new Date();
                    ub.setDate(ub.getDate() + 2);
                    day = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(ub);
                } else if (lowerPrompt.includes('täglich') || lowerPrompt.includes('daily') || lowerPrompt.includes('jeden tag')) {
                    day = 'Daily';
                } else if (lowerPrompt.includes('montag') || lowerPrompt.includes('monday')) day = 'Monday';
                else if (lowerPrompt.includes('dienstag') || lowerPrompt.includes('tuesday')) day = 'Tuesday';
                else if (lowerPrompt.includes('mittwoch') || lowerPrompt.includes('wednesday')) day = 'Wednesday';
                else if (lowerPrompt.includes('donnerstag') || lowerPrompt.includes('thursday')) day = 'Thursday';
                else if (lowerPrompt.includes('freitag') || lowerPrompt.includes('friday')) day = 'Friday';
                else if (lowerPrompt.includes('samstag') || lowerPrompt.includes('saturday')) day = 'Saturday';
                else if (lowerPrompt.includes('sonntag') || lowerPrompt.includes('sunday')) day = 'Sunday';

                // Parse times
                let startTime = '10:00';
                let endTime = '11:00';
                const rangeMatch = queryText.match(/(?:von|from)\s*(\d{1,2})(?::(\d{2}))?\s*(?:uhr)?\s*(?:bis|-|to)\s*(\d{1,2})(?::(\d{2}))?\s*(?:uhr)?/i);
                if (rangeMatch) {
                    const sH = parseInt(rangeMatch[1], 10);
                    const sM = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : 0;
                    const eH = parseInt(rangeMatch[3], 10);
                    const eM = rangeMatch[4] ? parseInt(rangeMatch[4], 10) : 0;
                    startTime = `${String(sH).padStart(2, '0')}:${String(sM).padStart(2, '0')}`;
                    endTime = `${String(eH).padStart(2, '0')}:${String(eM).padStart(2, '0')}`;
                } else {
                    const singleMatch = queryText.match(/(?:um|at)\s*(\d{1,2})(?::(\d{2}))?\s*(?:uhr)?/i) || queryText.match(/(\d{1,2}):(\d{2})/);
                    if (singleMatch) {
                        const sH = parseInt(singleMatch[1], 10);
                        const sM = singleMatch[2] ? parseInt(singleMatch[2], 10) : 0;
                        startTime = `${String(sH).padStart(2, '0')}:${String(sM).padStart(2, '0')}`;
                        endTime = `${String((sH + 1) % 24).padStart(2, '0')}:${String(sM).padStart(2, '0')}`;
                    } else {
                        const now = new Date();
                        const nextH = (now.getHours() + 1) % 24;
                        startTime = `${String(nextH).padStart(2, '0')}:00`;
                        endTime = `${String((nextH + 1) % 24).padStart(2, '0')}:00`;
                    }
                }

                // Parse title
                let blockTitle = queryText
                    .replace(/(plane|termin|schedule|zeitblock|blockiere|erinnere mich an|erinnere mich um|erinnere mich|reminder|zeitfenster|einen block|einen termin)/gi, '')
                    .replace(/(?:von|from)?\s*\d{1,2}(?::\d{2})?\s*(?:uhr)?\s*(?:bis|-|to)\s*\d{1,2}(?::\d{2})?\s*(?:uhr)?/gi, '')
                    .replace(/(?:um|at)\s*\d{1,2}(?::\d{2})?\s*(?:uhr)?/gi, '')
                    .replace(/(\d{1,2}:\d{2})/g, '')
                    .replace(/(heute|morgen|übermorgen|täglich|daily|montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi, '')
                    .replace(/\b(für|am|an|ein|einen|den|dem|im|in)\b/gi, '')
                    .trim();
                blockTitle = blockTitle.replace(/^[-:,\s]+|[-:,\s]+$/g, '');
                if (!blockTitle || blockTitle.length < 2) blockTitle = isReminder ? 'Erinnerung' : 'Fokus Zeitblock';
                blockTitle = blockTitle.charAt(0).toUpperCase() + blockTitle.slice(1);

                const newBlock = {
                    id: window.crypto?.randomUUID ? window.crypto.randomUUID() : `tb-${Date.now()}`,
                    title: blockTitle,
                    notes: 'Autonom erstellt via Agent Hunter',
                    url: '',
                    day,
                    startTime,
                    endTime,
                    color: isReminder ? '#f59e0b' : '#3b82f6',
                    habitId: null,
                    isReminder,
                    completed: false
                };

                state.setTimetableBlocks(prev => [...(prev || []), newBlock]);
                playSuccess();
                statusText = `${isReminder ? 'Erinnerung' : 'Zeitblock'} "${blockTitle}" geplant für ${day} (${startTime} - ${endTime})`;
                toolFeedback = `[SYSTEM ACTION COMPLETED: ${statusText}.]`;

                actionCard = {
                    id: `act-${Date.now()}`,
                    type: 'SCHEDULE_TIMETABLE',
                    title: isReminder ? '🔔 Erinnerung im Timetable' : '📅 Zeitblock im Timetable geplant',
                    badge: isReminder ? 'REMINDER' : 'TIMEBLOCK',
                    color: isReminder ? '#f59e0b' : '#3b82f6',
                    icon: isReminder ? '🔔' : '📅',
                    summary: `"${blockTitle}" • ${day} von ${startTime} bis ${endTime}`,
                    deepLink: '/timetable',
                    deepLinkLabel: 'Im Timetable öffnen',
                    executedAt: Date.now(),
                    undone: false,
                    undoPayload: { blockId: newBlock.id }
                };
            }

            // 2. ADD_GOAL Intent
            else if (
                (lowerPrompt.startsWith('ziel') || lowerPrompt.includes('neues ziel') || lowerPrompt.includes('setze ziel') || lowerPrompt.includes('add goal') || lowerPrompt.includes('wochenziel') || lowerPrompt.includes('monatsziel') || lowerPrompt.includes('jahresziel') || lowerPrompt.includes('ziel:') || lowerPrompt.includes('goal:')) &&
                !lowerPrompt.includes('was sind meine ziele') && !lowerPrompt.includes('zeige ziele')
            ) {
                let period = 'week';
                if (lowerPrompt.includes('monat') || lowerPrompt.includes('month')) period = 'month';
                else if (lowerPrompt.includes('jahr') || lowerPrompt.includes('year')) period = 'year';

                let goalText = queryText
                    .replace(/(wochenziel|monatsziel|jahresziel|neues ziel|setze ziel|ziel hinzufügen|add goal|goal:?|ziel:?)/gi, '')
                    .replace(/(für diese woche|diese woche|diesen monat|dieses jahr|woche|monat|jahr)/gi, '')
                    .trim()
                    .replace(/^[-:,\s]+|[-:,\s]+$/g, '');
                if (!goalText) goalText = 'Neues Ziel';
                goalText = goalText.charAt(0).toUpperCase() + goalText.slice(1);

                const newGoal = {
                    id: window.crypto?.randomUUID ? window.crypto.randomUUID() : `goal-${Date.now()}`,
                    text: goalText,
                    done: false,
                    completed: false,
                    notes: 'Autonom erstellt via Agent Hunter',
                    date: new Date().toISOString()
                };

                state.setGoals(prev => ({
                    ...prev,
                    [period]: [...(prev?.[period] || []), newGoal]
                }));
                playSuccess();
                const periodLabel = period === 'week' ? 'Woche' : period === 'month' ? 'Monat' : 'Jahr';
                statusText = `Ziel (${periodLabel}) hinzugefügt: "${goalText}"`;
                toolFeedback = `[SYSTEM ACTION COMPLETED: ${statusText}.]`;

                actionCard = {
                    id: `act-${Date.now()}`,
                    type: 'ADD_GOAL',
                    title: `🎯 Ziel definiert (${periodLabel})`,
                    badge: `GOAL: ${period.toUpperCase()}`,
                    color: '#06b6d4',
                    icon: '🎯',
                    summary: `"${goalText}"`,
                    deepLink: '/goals',
                    deepLinkLabel: 'In Ziele & Targets öffnen',
                    executedAt: Date.now(),
                    undone: false,
                    undoPayload: { goalId: newGoal.id, period }
                };
            }

            // 3. ADD_HABIT Intent
            else if (
                (lowerPrompt.includes('neue gewohnheit') || lowerPrompt.includes('neues habit') || lowerPrompt.includes('gewohnheit erstellen') || lowerPrompt.includes('habit erstellen') || lowerPrompt.includes('habit hinzufügen') || lowerPrompt.includes('tracke habit') || lowerPrompt.includes('neue routine')) &&
                !lowerPrompt.includes('abhaken') && !lowerPrompt.includes('erledigt') && !lowerPrompt.includes('complete')
            ) {
                let habitName = queryText
                    .replace(/(neue gewohnheit|neues habit|gewohnheit erstellen|habit erstellen|habit hinzufügen|tracke habit|neue routine)/gi, '')
                    .trim()
                    .replace(/^[-:,\s]+|[-:,\s]+$/g, '');
                if (!habitName) habitName = 'Neue Gewohnheit';
                habitName = habitName.charAt(0).toUpperCase() + habitName.slice(1);

                const newTemplate = {
                    id: `custom-${Date.now()}`,
                    name: habitName,
                    notes: 'Automatisch durch Agent Hunter synchronisiert',
                    color: 'cyan',
                    repeat: 'Daily',
                    weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                    createdAt: new Date().toISOString(),
                    startDate: new Date().toISOString().split('T')[0],
                    streakGoal: null
                };

                if (state.addCustomHabitTemplate) {
                    state.addCustomHabitTemplate(newTemplate);
                }
                playSuccess();
                statusText = `Neue Gewohnheit angelegt: "${habitName}"`;
                toolFeedback = `[SYSTEM ACTION COMPLETED: ${statusText}.]`;

                actionCard = {
                    id: `act-${Date.now()}`,
                    type: 'ADD_HABIT',
                    title: '⚡ Gewohnheit registriert',
                    badge: 'HABIT ROUTINE',
                    color: '#10b981',
                    icon: '⚡',
                    summary: `"${habitName}" (Tägliche Wiederholung)`,
                    deepLink: '/habits',
                    deepLinkLabel: 'Im Habit Tracker öffnen',
                    executedAt: Date.now(),
                    undone: false,
                    undoPayload: { templateId: newTemplate.id }
                };
            }

            // 4. CREATE_JOURNAL Intent
            else if (
                (lowerPrompt.startsWith('tagebuch') || lowerPrompt.startsWith('journal') || lowerPrompt.includes('tagebucheintrag') || lowerPrompt.includes('journal eintrag') || lowerPrompt.includes('notiere im journal') || lowerPrompt.includes('im tagebuch festhalten')) &&
                !lowerPrompt.includes('zeige journal') && !lowerPrompt.includes('lese journal')
            ) {
                let journalContent = queryText
                    .replace(/(tagebucheintrag|journal eintrag|tagebuch:?|journal:?|notiere im journal:?)/gi, '')
                    .trim()
                    .replace(/^[-:,\s]+|[-:,\s]+$/g, '');
                if (!journalContent) journalContent = queryText;
                const journalTitle = `Reflexion ${new Date().toLocaleDateString('de-DE')}`;

                const newEntry = {
                    id: Date.now(),
                    title: journalTitle,
                    content: journalContent,
                    timestamp: Date.now(),
                    date: new Date().toISOString().split('T')[0]
                };

                state.setJournal(prev => [newEntry, ...(prev || [])]);
                playSuccess();
                statusText = `Journal-Eintrag gespeichert: "${journalTitle}"`;
                toolFeedback = `[SYSTEM ACTION COMPLETED: ${statusText}.]`;

                actionCard = {
                    id: `act-${Date.now()}`,
                    type: 'CREATE_JOURNAL',
                    title: '📖 Journal-Eintrag gesichert',
                    badge: 'MINDSET & REFLECTION',
                    color: '#a855f7',
                    icon: '📖',
                    summary: `"${journalTitle}": ${journalContent.slice(0, 60)}...`,
                    deepLink: '/journal',
                    deepLinkLabel: 'Im Journal öffnen',
                    executedAt: Date.now(),
                    undone: false,
                    undoPayload: { entryId: newEntry.id }
                };
            }

            // 5. ADD_WATCHLIST Intent
            else if (
                (lowerPrompt.includes('watchlist') || lowerPrompt.includes('beobachte aktie') || lowerPrompt.includes('aktie hinzufügen') || lowerPrompt.includes('add stock') || lowerPrompt.includes('krypto beobachten') || lowerPrompt.includes('ticker hinzufügen')) &&
                !lowerPrompt.includes('zeige watchlist') && !lowerPrompt.includes('was ist auf der watchlist')
            ) {
                const tickerMatch = queryText.match(/\b([A-Z0-9]{2,6})\b/) || queryText.match(/(?:aktie|stock|ticker|watchlist|beobachte)\s+([a-zA-Z0-9]{2,8})/i);
                const tickerSymbol = (tickerMatch ? (tickerMatch[1] || tickerMatch[0]) : 'ASSET').toUpperCase();

                const newStock = {
                    id: Date.now(),
                    ticker: tickerSymbol,
                    name: tickerSymbol,
                    sector: 'Market Radar',
                    starred: true,
                    notes: 'Hinzugefügt via Agent Hunter CFO'
                };

                state.setWatchlist(prev => [...(prev || []), newStock]);
                playSuccess();
                statusText = `Symbol "${tickerSymbol}" zur Watchlist hinzugefügt`;
                toolFeedback = `[SYSTEM ACTION COMPLETED: ${statusText}.]`;

                actionCard = {
                    id: `act-${Date.now()}`,
                    type: 'ADD_WATCHLIST',
                    title: '📈 Symbol zur Watchlist hinzugefügt',
                    badge: 'MARKET ASSET',
                    color: '#10b981',
                    icon: '📈',
                    summary: `${tickerSymbol} (Trading Terminal Watchlist)`,
                    deepLink: '/trading',
                    deepLinkLabel: 'Im Trading Terminal öffnen',
                    executedAt: Date.now(),
                    undone: false,
                    undoPayload: { stockId: newStock.id }
                };
            }

            // 6. ADD_NOTE Intent
            else if (
                (lowerPrompt.startsWith('notiz') || lowerPrompt.startsWith('note') || lowerPrompt.includes('speichere notiz') || lowerPrompt.includes('schreibe auf') || lowerPrompt.includes('notiere:')) &&
                !lowerPrompt.includes('zeige notizen') && !lowerPrompt.includes('was steht in meinen notizen')
            ) {
                let noteContent = queryText
                    .replace(/(speichere notiz|notiz:?|note:?|mitschreiben:?|schreibe auf:?|notiere:?)/gi, '')
                    .trim()
                    .replace(/^[-:,\s]+|[-:,\s]+$/g, '');
                if (!noteContent) noteContent = queryText;
                const now = new Date();
                const noteName = `Notiz ${now.toLocaleDateString('de-DE')} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.md`;

                const newFile = {
                    id: Date.now(),
                    name: noteName,
                    folder: 'Inbox',
                    content: noteContent,
                    timestamp: Date.now()
                };

                state.setEditorFiles(prev => [newFile, ...(prev || [])]);
                playSuccess();
                statusText = `Notiz gespeichert in Inbox: "${noteName}"`;
                toolFeedback = `[SYSTEM ACTION COMPLETED: ${statusText}.]`;

                actionCard = {
                    id: `act-${Date.now()}`,
                    type: 'ADD_NOTE',
                    title: '📝 Notiz im Workspace angelegt',
                    badge: 'WORKSPACE NOTE',
                    color: '#ec4899',
                    icon: '📝',
                    summary: `"${noteName}": ${noteContent.slice(0, 60)}...`,
                    deepLink: '/editor',
                    deepLinkLabel: 'Im Editor öffnen',
                    executedAt: Date.now(),
                    undone: false,
                    undoPayload: { fileId: newFile.id }
                };
            }

            // 7. ADD_EXPENSE Intent
            else if (lowerPrompt.includes('ausgabe') || lowerPrompt.includes('expense') || lowerPrompt.includes('bezahlt') || lowerPrompt.includes('spent') || lowerPrompt.includes('kostet')) {
                const amountMatch = lowerPrompt.match(/(\d+(?:[.,]\d+)?)\s*(?:€|eur|euro|usd|\$|dollar|chf)?/i) || lowerPrompt.match(/(?:€|eur|euro|usd|\$|dollar)\s*(\d+(?:[.,]\d+)?)/i);
                if (amountMatch) {
                    const amount = parseFloat(amountMatch[1].replace(',', '.'));
                    let category = 'Sonstiges';
                    const forMatch = lowerPrompt.match(/(?:für|for|in|category|kategorie)\s+([a-zA-ZäöüÄÖÜß]+)/i);
                    if (forMatch) {
                        category = forMatch[1];
                        category = category.charAt(0).toUpperCase() + category.slice(1);
                    }
                    const newExpense = {
                        id: Date.now(),
                        amount,
                        category,
                        date: new Date().toISOString().split('T')[0]
                    };
                    state.setExpenses(prev => [...prev, newExpense]);
                    playSuccess();
                    statusText = `Added expense of ${currency}${amount} for "${category}"`;
                    toolFeedback = `[SYSTEM ACTION COMPLETED: ${statusText}.]`;

                    actionCard = {
                        id: `act-${Date.now()}`,
                        type: 'ADD_EXPENSE',
                        title: `💸 Ausgabe verbucht (${currency}${amount})`,
                        badge: 'BUDGET RADAR',
                        color: '#ef4444',
                        icon: '💸',
                        summary: `${currency}${amount.toFixed(2)} für Kategorie "${category}"`,
                        deepLink: '/expenses',
                        deepLinkLabel: 'Im Expense Tracker öffnen',
                        executedAt: Date.now(),
                        undone: false,
                        undoPayload: { expenseId: newExpense.id }
                    };
                }
            }
            
            // 8. ADD_FRIDGE Intent
            else if (lowerPrompt.includes('kühlschrank') || lowerPrompt.includes('fridge') || lowerPrompt.includes('einkauf') || lowerPrompt.includes('food item')) {
                const foodMatch = lowerPrompt.match(/(?:füge|add|kühlschrank|lebensmittel)\s+([a-zA-ZäöüÄÖÜß\s]{3,20})\s*(?:hinzu|to the fridge|in den kühlschrank)?/i);
                if (foodMatch) {
                    let itemName = foodMatch[1].replace(/(hinzu|kühlschrank|in den|in|to the|add)/g, '').trim();
                    itemName = itemName.charAt(0).toUpperCase() + itemName.slice(1);
                    if (itemName) {
                        const newFridgeItem = {
                            id: Date.now(),
                            name: itemName,
                            status: 'In stock',
                            category: 'Snacks',
                            addedDate: new Date().toISOString().split('T')[0]
                        };
                        state.setFridge(prev => [...prev, newFridgeItem]);
                        playSuccess();
                        statusText = `Added "${itemName}" to fridge inventory`;
                        toolFeedback = `[SYSTEM ACTION COMPLETED: ${statusText}.]`;

                        actionCard = {
                            id: `act-${Date.now()}`,
                            type: 'ADD_FRIDGE',
                            title: '🧊 Kühlschrank aktualisiert',
                            badge: 'PANTRY INVENTORY',
                            color: '#00f0ff',
                            icon: '🧊',
                            summary: `"${itemName}" als vorrätig registriert`,
                            deepLink: '/fridge',
                            deepLinkLabel: 'Im Kühlschrank ansehen',
                            executedAt: Date.now(),
                            undone: false,
                            undoPayload: { fridgeId: newFridgeItem.id }
                        };
                    }
                }
            }

            // 9. COMPLETE_HABIT Intent
            else if (lowerPrompt.includes('habit') || lowerPrompt.includes('gewohnheit') || lowerPrompt.includes('abhaken') || lowerPrompt.includes('check') || lowerPrompt.includes('complete')) {
                const habitsList = state.habits || [];
                const todayId = new Date().toISOString().split('T')[0];
                const todayDay = habitsList.find(d => d.id === todayId);
                let matchedHabit = null;

                if (todayDay && Array.isArray(todayDay.habits)) {
                    for (const h of todayDay.habits) {
                        if (h && h.name && lowerPrompt.includes(h.name.toLowerCase())) {
                            matchedHabit = h;
                            break;
                        }
                    }
                }

                if (matchedHabit) {
                    state.setHabits(prev => prev.map(d => {
                        if (d.id === todayId) {
                            return {
                                ...d,
                                habits: d.habits.map(h => {
                                    if (h.id === matchedHabit.id) {
                                        if (!h.done) {
                                            if (state.addXP) state.addXP(50);
                                            return { ...h, done: true };
                                        }
                                    }
                                    return h;
                                })
                            };
                        }
                        return d;
                    }));
                    playSuccess();
                    statusText = `Completed today's habit "${matchedHabit.name}" (+50 XP)`;
                    toolFeedback = `[SYSTEM ACTION COMPLETED: ${statusText}.]`;

                    actionCard = {
                        id: `act-${Date.now()}`,
                        type: 'COMPLETE_HABIT',
                        title: '✅ Gewohnheit abgehakt (+50 XP)',
                        badge: 'HABIT MASTERY',
                        color: '#10b981',
                        icon: '✅',
                        summary: `"${matchedHabit.name}" für heute erledigt`,
                        deepLink: '/habits',
                        deepLinkLabel: 'Im Habit Tracker öffnen',
                        executedAt: Date.now(),
                        undone: false,
                        undoPayload: { habitId: matchedHabit.id, dateId: todayId }
                    };
                }
            }

            // 10. LOG_WORKOUT Intent
            else if (lowerPrompt.includes('workout') || lowerPrompt.includes('training') || lowerPrompt.includes('sport') || lowerPrompt.includes('gym') || lowerPrompt.includes('laufen') || lowerPrompt.includes('joggen')) {
                const workoutMatch = lowerPrompt.match(/(?:workout|training|sport|gym|laufen|joggen)\s+([a-zA-ZäöüÄÖÜß\s]{3,30})/i);
                let workoutName = workoutMatch ? workoutMatch[1].trim() : 'General Workout';
                const durationMatch = lowerPrompt.match(/(\d+)\s*(?:minutes|minute|min|stunden|stunde|h|std)/i);
                let duration = '30 min';
                if (durationMatch) {
                    duration = `${durationMatch[1]} min`;
                    workoutName = workoutName.replace(new RegExp(`\\b(?:for|für)?\\s*${durationMatch[1]}\\s*(?:minutes|minute|min|stunden|stunde|h|std).*$`, 'i'), '').trim();
                }
                workoutName = workoutName.charAt(0).toUpperCase() + workoutName.slice(1);
                
                const newWorkout = {
                    id: Date.now(),
                    name: workoutName,
                    duration: duration,
                    date: new Date().toISOString().split('T')[0]
                };
                state.setWorkouts(prev => [...(prev || []), newWorkout]);
                playSuccess();
                statusText = `Logged workout: "${workoutName}" (${duration})`;
                toolFeedback = `[SYSTEM ACTION COMPLETED: ${statusText}.]`;

                actionCard = {
                    id: `act-${Date.now()}`,
                    type: 'LOG_WORKOUT',
                    title: '🏋️ Workout protokolliert',
                    badge: 'PHYSICAL TRAINING',
                    color: '#f97316',
                    icon: '🏋️',
                    summary: `"${workoutName}" (${duration})`,
                    deepLink: '/sport',
                    deepLinkLabel: 'Im Sport Hub ansehen',
                    executedAt: Date.now(),
                    undone: false,
                    undoPayload: { workoutId: newWorkout.id }
                };
            }

            // Context Generation with Active Persona Context & A.H. Datenbank Integration
            const activeDoc = (state.aiKnowledgeBase || []).find(d => d.id === activeDocId) || null;
            let contextPayload = '';
            if (lowerPrompt.includes('jagd') || lowerPrompt.includes('hunt') || lowerPrompt.includes('directive') || lowerPrompt.includes('mission')) {
                const { prompt: p } = buildAgentHunterContext(state, 'daily_hunt', activeDoc);
                contextPayload = p;
            } else if (lowerPrompt.includes('briefing') || lowerPrompt.includes('morgen') || lowerPrompt.includes('morning')) {
                const { prompt: p } = buildMorningBriefingContext(state, []);
                contextPayload = activeDoc ? `${p}\n\n[AKTIVE A.H. DIREKTIVE: ${activeDoc.title}]\n${activeDoc.content}` : p;
            } else if (lowerPrompt.includes('rezept') || lowerPrompt.includes('kochen') || lowerPrompt.includes('recipe') || lowerPrompt.includes('cook')) {
                const { prompt: p } = buildRecipeAgentContext(state, '');
                contextPayload = activeDoc ? `${p}\n\n[AKTIVE A.H. DIREKTIVE: ${activeDoc.title}]\n${activeDoc.content}` : p;
            } else {
                const { context: personaCtx } = buildPersonaContext(state, activePersona, activeDoc);
                contextPayload = `${personaCtx}\n${toolFeedback ? `\n[MCP_NOTIFICATION: ${toolFeedback}]\n` : ''}`;
            }

            const responseText = await generateText(queryText, contextPayload);
            const missing = extractMissingIngredients(responseText);

            const agentMsg = {
                id: (Date.now() + 1).toString(),
                sender: 'agent',
                text: responseText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                statusTag: activeDoc ? `A.H. DIREKTIVE: ${activeDoc.title}` : (statusText ? `MCP_DISPATCH: ${statusText}` : null),
                actionCard: actionCard,
                missingIngredients: missing
            };

            setMessages(prev => [...prev, agentMsg]);
        } catch (err) {
            console.error(err);
            const errorMsg = {
                id: (Date.now() + 1).toString(),
                sender: 'agent',
                text: `⚠️ **Fehler bei der Generierung:** ${err.message || 'Verbindung zum Modell fehlgeschlagen.'}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorMsg]);
        }
    };

    // --- ADD MISSING TO FRIDGE STOCK ---
    const handleAddMissingToFridge = (itemsToAdd) => {
        if (!itemsToAdd || itemsToAdd.length === 0) return;
        const state = useStore.getState();
        const newEntries = itemsToAdd.map(name => ({
            id: Date.now() + Math.random(),
            name: name.charAt(0).toUpperCase() + name.slice(1),
            status: 'Not in stock',
            category: 'Snacks',
            cal: 0,
            price: 0
        }));

        state.setFridge(prev => [...(prev || []), ...newEntries]);
        showActionToast(`🛒 Added ${itemsToAdd.length} items to Fridge Stock ("Not in stock")`);
    };

    return (
        <div style={{
            maxWidth: '920px',
            margin: '0 auto',
            padding: '10px 15px 40px',
            fontFamily: 'var(--font-main, sans-serif)'
        }}>
            {/* Action Toast */}
            {actionToast && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 9999,
                    padding: '10px 18px',
                    background: 'rgba(16, 185, 129, 0.95)',
                    border: '1px solid #10b981',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    animation: 'fadeIn 0.2s ease-in'
                }}>
                    <span>⚡</span>
                    <span>{actionToast}</span>
                </div>
            )}

            {/* PREVIEW WINDOW / CHAT TERMINAL CONTAINER */}
            <div style={{
                background: 'rgba(11, 14, 23, 0.85)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.55), 0 0 1px 1px rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '640px'
            }}>
                {/* 1. Mac-Style Window Header Titlebar */}
                <div style={{
                    padding: '12px 18px',
                    background: 'rgba(0, 0, 0, 0.45)',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px'
                }}>
                    {/* Left: Window Traffic Dots */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ff5f56', boxShadow: '0 0 6px #ff5f5666' }}></div>
                        <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ffbd2e', boxShadow: '0 0 6px #ffbd2e66' }}></div>
                        <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#27c93f', boxShadow: '0 0 6px #27c93f66' }}></div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginLeft: '8px', letterSpacing: '0.5px' }}>
                            AGENT HUNTER // TERMINAL (A.H.)
                        </span>
                        <span style={{
                            fontSize: '0.68rem',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: `${AGENT_PERSONAS[activePersona]?.color || '#00f0ff'}22`,
                            color: AGENT_PERSONAS[activePersona]?.color || '#00f0ff',
                            border: `1px solid ${AGENT_PERSONAS[activePersona]?.color || '#00f0ff'}55`,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <span>{AGENT_PERSONAS[activePersona]?.icon}</span>
                            <span>{AGENT_PERSONAS[activePersona]?.shortName || 'Executive'}</span>
                        </span>
                        <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(var(--primary-rgb), 0.15)', color: 'var(--primary)', border: '1px solid rgba(var(--primary-rgb), 0.3)', fontWeight: 600 }}>
                            {getProviderTitle()}
                        </span>
                    </div>

                    {/* Right: Window Navigation Tabs */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button
                            type="button"
                            onClick={() => setActiveTab('chat')}
                            style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                border: 'none',
                                background: activeTab === 'chat' ? 'var(--primary)' : 'transparent',
                                color: activeTab === 'chat' ? '#fff' : 'var(--text-muted)',
                                fontSize: '0.76rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                            }}
                        >
                            💬 Chat
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('stats')}
                            style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                border: 'none',
                                background: activeTab === 'stats' ? 'var(--primary)' : 'transparent',
                                color: activeTab === 'stats' ? '#fff' : 'var(--text-muted)',
                                fontSize: '0.76rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                            }}
                        >
                            📊 Status [{perf.score}]
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('workflow')}
                            style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                border: 'none',
                                background: activeTab === 'workflow' ? 'var(--primary)' : 'transparent',
                                color: activeTab === 'workflow' ? '#fff' : 'var(--text-muted)',
                                fontSize: '0.76rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                            }}
                        >
                            🗺️ Blueprint
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('knowledge')}
                            style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                border: 'none',
                                background: activeTab === 'knowledge' ? 'var(--primary)' : 'transparent',
                                color: activeTab === 'knowledge' ? '#fff' : 'var(--text-muted)',
                                fontSize: '0.76rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                            }}
                        >
                            📚 A.H. Datenbank ({aiKnowledgeBase.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('settings')}
                            style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                border: 'none',
                                background: activeTab === 'settings' ? 'var(--primary)' : 'transparent',
                                color: activeTab === 'settings' ? '#fff' : 'var(--text-muted)',
                                fontSize: '0.76rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                            }}
                        >
                            ⚙️ Config
                        </button>
                    </div>
                </div>

                {/* 2. Mini Performance State Ribbon Strip */}
                <div style={{
                    padding: '8px 18px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.76rem',
                    gap: '10px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Performance State:</span>
                        <strong style={{ color: perf.tierColor, fontSize: '0.82rem' }}>{perf.score} / 10.0 ({perf.overallPct}%)</strong>
                        <span style={{ padding: '1px 6px', borderRadius: '3px', background: `${perf.tierColor}22`, color: perf.tierColor, fontSize: '0.68rem', fontWeight: 700 }}>
                            {perf.tier}
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                        <span>Habits: <b style={{ color: 'var(--text-main)' }}>{perf.breakdown.habits.pct}%</b></span>
                        <span>Goals: <b style={{ color: 'var(--text-main)' }}>{perf.breakdown.goals.pct}%</b></span>
                        <span>Budget: <b style={{ color: 'var(--text-main)' }}>{perf.breakdown.finances.pct}%</b></span>
                        <span>Workouts: <b style={{ color: 'var(--text-main)' }}>{perf.breakdown.workout.count} / wk</b></span>
                    </div>
                </div>

                {/* 2.5 Cyber Persona Selector Bar */}
                <div style={{
                    padding: '7px 18px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    overflowX: 'auto',
                    scrollbarWidth: 'none'
                }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', whiteSpace: 'nowrap' }}>
                        PERSONA:
                    </span>
                    {Object.values(AGENT_PERSONAS).map(persona => {
                        const isSelected = activePersona === persona.id;
                        return (
                            <button
                                key={persona.id}
                                type="button"
                                onClick={() => handleSelectPersona(persona.id)}
                                title={`${persona.name}: ${persona.tagline}`}
                                style={{
                                    padding: '4px 11px',
                                    borderRadius: '20px',
                                    fontSize: '0.74rem',
                                    fontWeight: isSelected ? 700 : 500,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                                    background: isSelected ? `${persona.color}25` : 'rgba(255, 255, 255, 0.04)',
                                    color: isSelected ? persona.color : 'var(--text-muted)',
                                    border: `1px solid ${isSelected ? persona.color : 'rgba(255, 255, 255, 0.08)'}`,
                                    boxShadow: isSelected ? `0 0 14px ${persona.color}35` : 'none'
                                }}
                            >
                                <span>{persona.icon}</span>
                                <span>{persona.shortName}</span>
                                {isSelected && (
                                    <span style={{
                                        fontSize: '0.6rem',
                                        padding: '1px 5px',
                                        borderRadius: '8px',
                                        background: persona.color,
                                        color: '#000',
                                        fontWeight: 800,
                                        marginLeft: '2px'
                                    }}>
                                        AKTIV
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* 2.6 Active A.H. Directive Ribbon (Steering response prompts) */}
                {activeDocId && (
                    <div style={{
                        padding: '6px 18px',
                        background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.12), rgba(16, 185, 129, 0.08))',
                        borderBottom: '1px solid rgba(0, 240, 255, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.74rem',
                        color: '#00f0ff'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                            <span>⚡</span>
                            <span style={{ fontWeight: 800, letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>A.H. ANTWORT-DIREKTIVE AKTIV:</span>
                            <span style={{ color: '#fff', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {aiKnowledgeBase.find(d => d.id === activeDocId)?.title || 'Dokument'}
                            </span>
                            <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}>
                                (Steuert Struktur aller Antworten)
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => { setActiveDocId(null); showActionToast('Direktive deaktiviert'); }}
                            style={{
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                borderRadius: '4px',
                                padding: '2px 8px',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                whiteSpace: 'nowrap'
                            }}
                        >
                            ✕ Deaktivieren
                        </button>
                    </div>
                )}

                {/* 3. WINDOW CONTENT AREA */}

                {/* TAB: CHAT PREVIEW VIEW */}
                {activeTab === 'chat' && (
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '460px' }}>
                        {/* Model Loading Screen with Percentage Bar when local model is initializing */}
                        {aiSettings.provider === 'local' && (!isReady || progress !== null) ? (
                            <div style={{ padding: '24px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <LoadingScreen
                                    progress={progress}
                                    title="AGENT HUNTER // KI-ENGINE WIRD INITIALISIERT"
                                    subtitle="Lade lokales LaMini-GPT Modell & ONNX-Runtime in den Browser-Cache. Dies geschieht nur einmalig beim ersten Start."
                                    icon="🧠"
                                    onSwitchCloud={() => setActiveTab('settings')}
                                />
                            </div>
                        ) : (
                            <>
                                {/* Chat History Messages */}
                                <div style={{
                                    flex: 1,
                                    padding: '20px',
                                    overflowY: 'auto',
                                    maxHeight: '440px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '14px'
                                }}>
                            {messages.map(msg => (
                                <div
                                    key={msg.id}
                                    style={{
                                        maxWidth: msg.sender === 'user' ? '78%' : '86%',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        fontSize: '0.88rem',
                                        lineHeight: '1.6',
                                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                        background: msg.sender === 'user' ? 'rgba(var(--primary-rgb), 0.16)' : 'rgba(255, 255, 255, 0.04)',
                                        border: msg.sender === 'user' ? '1px solid rgba(var(--primary-rgb), 0.35)' : '1px solid var(--border-color)',
                                        color: msg.sender === 'user' ? '#fff' : 'var(--text-main)',
                                        borderBottomRightRadius: msg.sender === 'user' ? '2px' : '12px',
                                        borderBottomLeftRadius: msg.sender === 'agent' ? '2px' : '12px',
                                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                                        position: 'relative'
                                    }}
                                >
                                    {/* Message Text */}
                                    <div style={{ whiteSpace: 'pre-wrap' }}>
                                        {msg.text}
                                    </div>

                                    {/* Visual Cyber Action Card with Undo & Open */}
                                    {msg.actionCard && (
                                        <div style={{
                                            marginTop: '12px',
                                            padding: '12px 14px',
                                            borderRadius: '10px',
                                            background: msg.actionCard.undone ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.65)',
                                            border: `1px solid ${msg.actionCard.undone ? 'rgba(255, 255, 255, 0.1)' : msg.actionCard.color || 'var(--primary)'}`,
                                            boxShadow: msg.actionCard.undone ? 'none' : `0 4px 18px ${msg.actionCard.color}25`,
                                            position: 'relative',
                                            overflow: 'hidden',
                                            transition: 'all 0.25s ease'
                                        }}>
                                            {/* Glow Accent Stripe */}
                                            {!msg.actionCard.undone && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '4px',
                                                    height: '100%',
                                                    background: msg.actionCard.color || 'var(--primary)'
                                                }} />
                                            )}

                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '1.1rem' }}>{msg.actionCard.icon || '⚡'}</span>
                                                    <span style={{ fontWeight: 700, fontSize: '0.84rem', color: msg.actionCard.undone ? 'var(--text-muted)' : 'var(--text-main)' }}>
                                                        {msg.actionCard.title}
                                                    </span>
                                                </div>
                                                <span style={{
                                                    fontSize: '0.64rem',
                                                    fontWeight: 800,
                                                    padding: '2px 7px',
                                                    borderRadius: '4px',
                                                    background: msg.actionCard.undone ? 'rgba(255, 255, 255, 0.08)' : `${msg.actionCard.color}22`,
                                                    color: msg.actionCard.undone ? 'var(--text-muted)' : msg.actionCard.color,
                                                    border: `1px solid ${msg.actionCard.undone ? 'rgba(255, 255, 255, 0.12)' : `${msg.actionCard.color}44`}`,
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    {msg.actionCard.undone ? '↩️ RÜCKGÄNGIG' : msg.actionCard.badge || 'AUTONOMOUS'}
                                                </span>
                                            </div>

                                            <div style={{
                                                fontSize: '0.82rem',
                                                color: msg.actionCard.undone ? 'var(--text-muted)' : 'var(--text-main)',
                                                opacity: msg.actionCard.undone ? 0.6 : 0.95,
                                                textDecoration: msg.actionCard.undone ? 'line-through' : 'none',
                                                marginBottom: '10px'
                                            }}>
                                                {msg.actionCard.summary}
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                                                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                                    {msg.actionCard.undone ? 'Aktion wurde rückgängig gemacht' : 'Direkt in Systemdatenbank synchronisiert'}
                                                </span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {!msg.actionCard.undone && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUndoAction(msg.id, msg.actionCard)}
                                                            style={{
                                                                padding: '4px 9px',
                                                                borderRadius: '6px',
                                                                background: 'rgba(239, 68, 68, 0.15)',
                                                                border: '1px solid rgba(239, 68, 68, 0.35)',
                                                                color: '#f87171',
                                                                fontSize: '0.72rem',
                                                                fontWeight: 600,
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                transition: 'all 0.15s'
                                                            }}
                                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'}
                                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
                                                        >
                                                            <span>↩️</span>
                                                            <span>Rückgängig</span>
                                                        </button>
                                                    )}
                                                    {msg.actionCard.deepLink && !msg.actionCard.undone && (
                                                        <button
                                                            type="button"
                                                            onClick={() => navigate(msg.actionCard.deepLink)}
                                                            style={{
                                                                padding: '4px 10px',
                                                                borderRadius: '6px',
                                                                background: `${msg.actionCard.color}26`,
                                                                border: `1px solid ${msg.actionCard.color}55`,
                                                                color: msg.actionCard.color,
                                                                fontSize: '0.72rem',
                                                                fontWeight: 700,
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                transition: 'all 0.15s'
                                                            }}
                                                            onMouseEnter={e => e.currentTarget.style.background = `${msg.actionCard.color}40`}
                                                            onMouseLeave={e => e.currentTarget.style.background = `${msg.actionCard.color}26`}
                                                        >
                                                            <span>👁️</span>
                                                            <span>{msg.actionCard.deepLinkLabel || 'Öffnen'} ➔</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Pseudo-MCP Status Card */}
                                    {msg.statusTag && !msg.actionCard && (
                                        <div style={{
                                            marginTop: '10px',
                                            padding: '6px 10px',
                                            background: 'rgba(16, 185, 129, 0.1)',
                                            border: '1px dashed #10b981',
                                            borderRadius: '6px',
                                            fontFamily: 'monospace',
                                            fontSize: '0.74rem',
                                            color: '#10b981',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            <span>⚡</span>
                                            <span>[{msg.statusTag}]</span>
                                        </div>
                                    )}

                                    {/* Missing Ingredients Detection Pill */}
                                    {msg.missingIngredients && msg.missingIngredients.length > 0 && (
                                        <div style={{
                                            marginTop: '10px',
                                            padding: '8px 12px',
                                            background: 'rgba(245, 158, 11, 0.12)',
                                            border: '1px solid rgba(245, 158, 11, 0.35)',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '8px'
                                        }}>
                                            <span style={{ fontSize: '0.78rem', color: '#f59e0b' }}>
                                                🛒 Fehlend: {msg.missingIngredients.join(', ')}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleAddMissingToFridge(msg.missingIngredients)}
                                                style={{
                                                    background: '#f59e0b',
                                                    color: '#000',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '3px 8px',
                                                    fontSize: '0.72rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                + In Einkaufsliste
                                            </button>
                                        </div>
                                    )}

                                    {/* Footer Toolbar: Audio TTS & Copy */}
                                    {msg.sender === 'agent' && (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                            <span>{msg.timestamp}</span>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleSpeech(msg.id, msg.text)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: isSpeaking && speakingMsgId === msg.id ? '#ef4444' : 'var(--primary)',
                                                        cursor: 'pointer',
                                                        fontWeight: 600,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        padding: 0
                                                    }}
                                                >
                                                    {isSpeaking && speakingMsgId === msg.id ? '⏹️ Stop' : '🔊 Vorlesen'}
                                                </button>
                                                <span>•</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(msg.text);
                                                        showActionToast("📋 Copied to clipboard!");
                                                    }}
                                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                                                >
                                                    Kopieren
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Processing Indicator */}
                            {isProcessing && (
                                <div style={{
                                    alignSelf: 'flex-start',
                                    padding: '10px 16px',
                                    borderRadius: '12px',
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    border: '1px solid var(--border-color)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '0.82rem',
                                    color: 'var(--text-muted)'
                                }}>
                                    <div className="spinner" style={{ width: '14px', height: '14px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                                    <span>Agent Hunter thinking & routing...</span>
                                </div>
                            )}

                            <div ref={chatEndRef} />
                        </div>

                        {/* A.H. PROMPT-ARSENAL: 1-Click Response Prompt Templates */}
                        <div style={{
                            padding: '8px 18px 6px',
                            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                            background: 'rgba(0, 0, 0, 0.35)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.67rem', fontWeight: 800, letterSpacing: '0.8px', color: 'var(--text-muted)' }}>
                                    ⚡ A.H. PROMPT-ARSENAL (1-CLICK ANTWORTEN):
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('knowledge')}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--primary)',
                                        fontSize: '0.68rem',
                                        cursor: 'pointer',
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <span>📚 A.H. Datenbank ({aiKnowledgeBase.length})</span>
                                    <span>→</span>
                                </button>
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '7px',
                                overflowX: 'auto',
                                scrollbarWidth: 'none',
                                paddingBottom: '2px'
                            }}>
                                {AH_PROMPT_TEMPLATES.map(tpl => (
                                    <button
                                        key={tpl.id}
                                        type="button"
                                        onClick={() => executeChatPrompt(tpl.prompt)}
                                        title={tpl.prompt}
                                        style={{
                                            background: `${tpl.color}15`,
                                            border: `1px solid ${tpl.color}45`,
                                            borderRadius: '16px',
                                            padding: '4px 11px',
                                            fontSize: '0.73rem',
                                            color: tpl.color,
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                            transition: 'all 0.15s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = `${tpl.color}28`;
                                            e.currentTarget.style.boxShadow = `0 0 10px ${tpl.color}44`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = `${tpl.color}15`;
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        {tpl.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Autonomous NLP Quick Commands Row */}
                        <div style={{
                            display: 'flex',
                            gap: '7px',
                            padding: '6px 18px 8px',
                            overflowX: 'auto',
                            scrollbarWidth: 'none',
                            background: 'rgba(0, 0, 0, 0.22)'
                        }}>
                            <span style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--text-muted)', alignSelf: 'center', whiteSpace: 'nowrap', marginRight: '4px' }}>
                                BEFEHLE:
                            </span>
                            <button
                                type="button"
                                onClick={() => executeChatPrompt('plane Deep Work um 14:00 montag')}
                                style={{
                                    background: 'rgba(59, 130, 246, 0.12)',
                                    border: '1px solid rgba(59, 130, 246, 0.35)',
                                    borderRadius: '20px',
                                    padding: '4px 10px',
                                    fontSize: '0.72rem',
                                    color: '#60a5fa',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                📅 Deep Work 14:00
                            </button>
                            <button
                                type="button"
                                onClick={() => executeChatPrompt('ziel: 10km unter 50 Minuten laufen')}
                                style={{
                                    background: 'rgba(6, 182, 212, 0.12)',
                                    border: '1px solid rgba(6, 182, 212, 0.35)',
                                    borderRadius: '20px',
                                    padding: '4px 10px',
                                    fontSize: '0.72rem',
                                    color: '#22d3ee',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                🎯 Neues Ziel
                            </button>
                            <button
                                type="button"
                                onClick={() => executeChatPrompt('neue gewohnheit: 10.000 Schritte')}
                                style={{
                                    background: 'rgba(16, 185, 129, 0.12)',
                                    border: '1px solid rgba(16, 185, 129, 0.35)',
                                    borderRadius: '20px',
                                    padding: '4px 10px',
                                    fontSize: '0.72rem',
                                    color: '#34d399',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                ⚡ Habit 10k
                            </button>
                            <button
                                type="button"
                                onClick={() => executeChatPrompt('beobachte aktie NVDA')}
                                style={{
                                    background: 'rgba(16, 185, 129, 0.12)',
                                    border: '1px solid rgba(16, 185, 129, 0.35)',
                                    borderRadius: '20px',
                                    padding: '4px 10px',
                                    fontSize: '0.72rem',
                                    color: '#10b981',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                📈 Watchlist NVDA
                            </button>
                            <button
                                type="button"
                                onClick={() => executeChatPrompt('tagebuch: Heute extrem fokussiert gearbeitet und Meilenstein erreicht')}
                                style={{
                                    background: 'rgba(168, 85, 247, 0.12)',
                                    border: '1px solid rgba(168, 85, 247, 0.35)',
                                    borderRadius: '20px',
                                    padding: '4px 10px',
                                    fontSize: '0.72rem',
                                    color: '#c084fc',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                📖 Journal Eintrag
                            </button>
                            <button
                                type="button"
                                onClick={() => executeChatPrompt('ausgabe 15€ für Kaffee & Snacks')}
                                style={{
                                    background: 'rgba(239, 68, 68, 0.12)',
                                    border: '1px solid rgba(239, 68, 68, 0.35)',
                                    borderRadius: '20px',
                                    padding: '4px 10px',
                                    fontSize: '0.72rem',
                                    color: '#f87171',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                💰 spent 15€
                            </button>
                            <button
                                type="button"
                                onClick={() => executeChatPrompt('workout Gym Krafttraining 45 min')}
                                style={{
                                    background: 'rgba(249, 115, 22, 0.12)',
                                    border: '1px solid rgba(249, 115, 22, 0.35)',
                                    borderRadius: '20px',
                                    padding: '4px 10px',
                                    fontSize: '0.72rem',
                                    color: '#fb923c',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                🏋️ workout 45m
                            </button>
                        </div>

                        {/* Bottom Chat Input Bar */}
                        <form
                            onSubmit={(e) => { e.preventDefault(); executeChatPrompt(prompt); }}
                            style={{
                                padding: '12px 18px',
                                borderTop: '1px solid var(--border-color)',
                                background: 'rgba(0, 0, 0, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >
                            {/* Voice Language Pill */}
                            <button
                                type="button"
                                onClick={() => setVoiceLang(voiceLang === 'de-DE' ? 'en-US' : 'de-DE')}
                                style={{
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '6px',
                                    padding: '6px 8px',
                                    fontSize: '0.72rem',
                                    color: 'var(--primary)',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}
                                title="Click to toggle Voice Language"
                            >
                                {voiceLang === 'de-DE' ? '🇩🇪 DE' : '🇺🇸 EN'}
                            </button>

                            {/* Voice STT Microphone Button */}
                            <button
                                type="button"
                                onClick={handleToggleListening}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    background: isListening ? '#ef4444' : 'rgba(var(--primary-rgb), 0.2)',
                                    color: isListening ? '#fff' : 'var(--primary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1rem',
                                    boxShadow: isListening ? '0 0 14px rgba(239, 68, 68, 0.7)' : 'none',
                                    animation: isListening ? 'pulse 1.4s infinite' : 'none',
                                    flexShrink: 0
                                }}
                                title={isListening ? "Listening... click to stop" : "Click to speak"}
                            >
                                {isListening ? '⏹️' : '🎙️'}
                            </button>

                            {/* Text Input */}
                            <input
                                type="text"
                                placeholder={isListening ? "Listening to your voice..." : "Type or speak to Agent Hunter..."}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                disabled={!isReady || isProcessing}
                                style={{
                                    flex: 1,
                                    background: 'rgba(255,255,255,0.04)',
                                    border: isListening ? '1px solid #ef4444' : '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    padding: '9px 14px',
                                    color: 'var(--text-main)',
                                    fontSize: '0.86rem',
                                    outline: 'none'
                                }}
                            />

                            {/* Send Button */}
                            <button
                                type="submit"
                                disabled={!isReady || isProcessing || prompt.trim() === ''}
                                style={{
                                    background: 'var(--primary)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '9px 18px',
                                    fontSize: '0.84rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    opacity: (!isReady || isProcessing || prompt.trim() === '') ? 0.4 : 1
                                }}
                            >
                                <span>Send</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z" /></svg>
                            </button>
                        </form>
                            </>
                        )}
                    </div>
                )}

                {/* TAB: PERFORMANCE STATE STATS VIEW */}
                {activeTab === 'stats' && (
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: 'var(--text-main)' }}>
                                    Performance State Diagnostic Matrix [0..10]
                                </h3>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    Scale: 0 = Basics (0%) ➔ 10 = Professional (100%). Weighted telemetry across all life modules.
                                </p>
                            </div>
                            <div style={{
                                padding: '6px 14px',
                                borderRadius: '8px',
                                background: `${perf.tierColor}22`,
                                border: `1px solid ${perf.tierColor}`,
                                color: perf.tierColor,
                                fontWeight: 800,
                                fontSize: '0.9rem'
                            }}>
                                {perf.score} / 10.0 • {perf.tier}
                            </div>
                        </div>

                        {/* Breakdown Bars */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                            {Object.entries(perf.breakdown).map(([key, item]) => (
                                <div key={key} style={{
                                    padding: '12px 14px',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border-color)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>{item.label} ({item.weight})</span>
                                        <strong style={{ color: item.pct >= 70 ? '#10b981' : item.pct >= 40 ? '#f59e0b' : '#ef4444' }}>
                                            {item.pct}%
                                        </strong>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${item.pct}%`,
                                            height: '100%',
                                            background: item.pct >= 70 ? '#10b981' : item.pct >= 40 ? '#f59e0b' : '#ef4444'
                                        }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => executeChatPrompt('Perform a comprehensive Performance State diagnostic audit and explain how I can reach 10.0.')}
                            style={{
                                alignSelf: 'flex-start',
                                background: 'var(--primary)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            📊 Run Deep Audit in Chat
                        </button>
                    </div>
                )}

                {/* TAB: BLUEPRINT ARCHITECTURE */}
                {activeTab === 'workflow' && (
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: 'var(--text-main)' }}>
                                🗺️ Agent Hunter Blueprint
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Register Baseline ➔ Settings ➔ System Quad ➔ Feedback Execution Engine ➔ Performance State Algorithm.
                            </p>
                        </div>

                        <div style={{
                            padding: '16px',
                            background: 'rgba(0,0,0,0.35)',
                            borderRadius: '10px',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            fontSize: '0.82rem'
                        }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                                <span style={{ background: 'var(--primary)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontWeight: 700 }}>Register</span>
                                <span>➔ Age: {profile.age || '—'} | Weight: {profile.weight ? `${profile.weight}kg` : '—'} | Height: {profile.height ? `${profile.height}cm` : '—'} | Edu: {profile.education || 'Self-Taught'}</span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                                <span style={{ background: 'rgba(var(--primary-rgb), 0.2)', color: 'var(--primary)', padding: '4px 8px', borderRadius: '4px', fontWeight: 700 }}>Settings</span>
                                <span>➔ Expense | Targets | Goals | Habits</span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                                <span style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-main)', padding: '4px 8px', borderRadius: '4px', fontWeight: 700 }}>Tracker Engine</span>
                                <span>➔ Workout Hub ➔ Journal | Timetable | Skills ➔ Life Tree</span>
                            </div>
                            <div style={{
                                marginTop: '6px',
                                padding: '8px 12px',
                                background: 'rgba(var(--primary-rgb), 0.08)',
                                borderRadius: '6px',
                                fontFamily: 'monospace',
                                color: 'var(--primary)'
                            }}>
                                def PerformanceState(0, 10): Overall Score = {perf.score} / 10.0 ({perf.overallPct}%)
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: A.H. DATENBANK & MASTER-PROMPT BIBLIOTHEK */}
                {activeTab === 'knowledge' && (
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Header & Description */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '14px' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '1.3rem' }}>📚</span>
                                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 800 }}>
                                        A.H. Datenbank & Prompt-Bibliothek
                                    </h3>
                                    <span style={{
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        background: 'rgba(0, 240, 255, 0.12)',
                                        border: '1px solid rgba(0, 240, 255, 0.3)',
                                        color: '#00f0ff',
                                        fontSize: '0.68rem',
                                        fontWeight: 800
                                    }}>
                                        {aiKnowledgeBase.length} MODULE
                                    </span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '640px', lineHeight: 1.4 }}>
                                    Modulare Wissens-Module und Antwort-Direktiven für Agent Hunter. Klicke auf ein Dokument, um es als <b>[⚡ AKTIVE DIREKTIVE]</b> zu schalten – alle KI-Antworten richten sich dann nach dessen Parametern und Tonalität.
                                </p>
                            </div>

                            {/* Main Action Buttons */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    onClick={handleLoadDefaultPrompts}
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(16, 185, 129, 0.2))',
                                        color: '#00f0ff',
                                        border: '1px solid rgba(0, 240, 255, 0.45)',
                                        borderRadius: '7px',
                                        padding: '7px 14px',
                                        fontSize: '0.78rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'all 0.18s'
                                    }}
                                    title="Lädt die 6 kuratierten A.H. Standard-Module (Core, Iron Coach, CFO, Biohacker, Stoic, NLP Syntax)"
                                >
                                    <span>⚡</span>
                                    <span>Standard A.H. Prompts laden (6 Module)</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowAddPromptModal(!showAddPromptModal)}
                                    style={{
                                        background: showAddPromptModal ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                        color: showAddPromptModal ? '#ef4444' : '#10b981',
                                        border: `1px solid ${showAddPromptModal ? 'rgba(239, 68, 68, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
                                        borderRadius: '7px',
                                        padding: '7px 14px',
                                        fontSize: '0.78rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <span>{showAddPromptModal ? '✕' : '+'}</span>
                                    <span>{showAddPromptModal ? 'Schließen' : 'Neuer Wissens-Prompt'}</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleUploadPDF}
                                    disabled={isUploading}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        color: 'var(--text-main)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '7px',
                                        padding: '7px 12px',
                                        fontSize: '0.78rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <span>📑</span>
                                    <span>{isUploading ? 'Wird analysiert...' : 'PDF hochladen'}</span>
                                </button>
                            </div>
                        </div>

                        {/* PDF Uploading Banner */}
                        {isUploading && (
                            <LoadingScreen
                                mode="banner"
                                title="PDF DOKUMENT WIRD ANALYSIERT & EXTRAHIERT"
                                progress={65}
                                icon="📑"
                            />
                        )}

                        {/* Inline Form: Add Custom Prompt / Directive */}
                        {showAddPromptModal && (
                            <form
                                onSubmit={handleCreateCustomPrompt}
                                style={{
                                    padding: '18px 20px',
                                    borderRadius: '10px',
                                    background: 'rgba(0, 0, 0, 0.5)',
                                    border: '1px solid rgba(16, 185, 129, 0.4)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px',
                                    animation: 'fadeIn 0.2s ease-in'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#10b981', fontWeight: 700 }}>
                                        📝 Neuer A.H. Wissens-Prompt / Antwort-Direktive
                                    </h4>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                        Wird als aktives Referenz-Dokument in das LLM-System eingespeist
                                    </span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                            Titel des Prompts
                                        </label>
                                        <input
                                            type="text"
                                            value={newPromptTitle}
                                            onChange={(e) => setNewPromptTitle(e.target.value)}
                                            placeholder="z.B. Biohacking Schlaf- & Regenerations-Standard"
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '6px',
                                                color: '#fff',
                                                fontSize: '0.82rem'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                            Kategorie
                                        </label>
                                        <select
                                            value={newPromptCategory}
                                            onChange={(e) => setNewPromptCategory(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '8px 10px',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '6px',
                                                color: '#fff',
                                                fontSize: '0.82rem'
                                            }}
                                        >
                                            <option value="core">⚡ Core Protocol (Executive)</option>
                                            <option value="fitness">🏋️ Iron Coach (Biomechanik)</option>
                                            <option value="finance">💎 CFO Strategist (Finanzen)</option>
                                            <option value="nutrition">🥑 Biohacker (Ernährung)</option>
                                            <option value="mindset">🏛️ Inner Citadel (Stoizismus)</option>
                                            <option value="workflow">⚙️ NLP Syntax (Systembefehle)</option>
                                            <option value="custom">📝 Allgemeines Wissen</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                        Prompt-Inhalt & Antwort-Anweisungen (Markdown unterstützt)
                                    </label>
                                    <textarea
                                        value={newPromptContent}
                                        onChange={(e) => setNewPromptContent(e.target.value)}
                                        rows={6}
                                        placeholder="Definiere hier Anweisungen, Tonfall, Gliederung und wissenschaftliche Richtlinien für Antworten in diesem Themenfeld..."
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            background: 'rgba(255, 255, 255, 0.04)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '6px',
                                            color: '#e2e8f0',
                                            fontSize: '0.8rem',
                                            fontFamily: 'monospace',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddPromptModal(false)}
                                        style={{
                                            background: 'transparent',
                                            border: '1px solid var(--border-color)',
                                            color: 'var(--text-muted)',
                                            borderRadius: '6px',
                                            padding: '6px 14px',
                                            fontSize: '0.78rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Abbrechen
                                    </button>
                                    <button
                                        type="submit"
                                        style={{
                                            background: '#10b981',
                                            border: 'none',
                                            color: '#000',
                                            borderRadius: '6px',
                                            padding: '6px 16px',
                                            fontSize: '0.78rem',
                                            fontWeight: 800,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        💾 Prompt zur Datenbank hinzufügen
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Document & Prompt List */}
                        {aiKnowledgeBase.length === 0 ? (
                            <div style={{
                                padding: '40px 20px',
                                textAlign: 'center',
                                border: '1px dashed rgba(255, 255, 255, 0.12)',
                                borderRadius: '12px',
                                background: 'rgba(0, 0, 0, 0.2)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <span style={{ fontSize: '2.4rem' }}>⚡</span>
                                <div>
                                    <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: 'var(--text-main)', fontWeight: 700 }}>
                                        Die A.H. Datenbank ist noch leer
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '480px' }}>
                                        Installiere mit 1-Klick die 6 kuratierten Master-Prompts von Agent Hunter, erstelle eigene Prompts oder lade eigene PDF-Handbücher hoch.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleLoadDefaultPrompts}
                                    style={{
                                        marginTop: '6px',
                                        background: 'linear-gradient(135deg, #00f0ff, #10b981)',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '10px 22px',
                                        fontSize: '0.85rem',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 18px rgba(0, 240, 255, 0.25)'
                                    }}
                                >
                                    ⚡ 6 Standard A.H. Master-Prompts jetzt installieren
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
                                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Installierte Prompts & Module ({aiKnowledgeBase.length})
                                    </span>
                                    <span style={{ fontSize: '0.72rem', color: activeDocId ? '#00f0ff' : 'var(--text-muted)' }}>
                                        {activeDocId ? `⚡ 1 Modul aktiv geschaltet` : `Keine Direktive aktiv (Persona-Standard)`}
                                    </span>
                                </div>

                                {aiKnowledgeBase.map(doc => {
                                    const isActive = activeDocId === doc.id;
                                    const isPreview = previewDocId === doc.id;
                                    const catColors = {
                                        core: '#00f0ff',
                                        fitness: '#ef4444',
                                        finance: '#10b981',
                                        nutrition: '#f59e0b',
                                        mindset: '#a855f7',
                                        workflow: '#ec4899',
                                        custom: '#3b82f6'
                                    };
                                    const catColor = catColors[doc.category] || 'var(--primary)';
                                    const catIcon = doc.icon || (doc.category === 'fitness' ? '🏋️' : doc.category === 'finance' ? '💎' : doc.category === 'nutrition' ? '🥑' : doc.category === 'mindset' ? '🏛️' : doc.category === 'workflow' ? '⚙️' : '📄');

                                    return (
                                        <div
                                            key={doc.id}
                                            style={{
                                                borderRadius: '8px',
                                                background: isActive ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255, 255, 255, 0.025)',
                                                border: `1px solid ${isActive ? '#00f0ff' : 'rgba(255, 255, 255, 0.07)'}`,
                                                boxShadow: isActive ? '0 0 16px rgba(0, 240, 255, 0.15)' : 'none',
                                                overflow: 'hidden',
                                                transition: 'all 0.18s ease'
                                            }}
                                        >
                                            {/* Card Main Row */}
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexWrap: 'wrap',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '12px 16px',
                                                    gap: '12px'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '240px' }}>
                                                    <span style={{ fontSize: '1.3rem' }}>{catIcon}</span>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                                                            <span style={{
                                                                fontSize: '0.62rem',
                                                                fontWeight: 800,
                                                                padding: '1px 6px',
                                                                borderRadius: '4px',
                                                                background: `${catColor}22`,
                                                                color: catColor,
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.5px'
                                                            }}>
                                                                {doc.category || 'WISSEN'}
                                                            </span>
                                                            <strong style={{ fontSize: '0.88rem', color: isActive ? '#00f0ff' : 'var(--text-main)' }}>
                                                                {doc.title}
                                                            </strong>
                                                        </div>
                                                        <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                                            {doc.description || `${(doc.content.length / 1000).toFixed(1)}k Zeichen • Angelegt ${new Date(doc.dateAdded || Date.now()).toLocaleDateString('de-DE')}`}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Card Actions */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {/* Active Toggle Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            playCyberClick();
                                                            const newId = isActive ? null : doc.id;
                                                            setActiveDocId(newId);
                                                            showActionToast(newId ? `⚡ A.H. Antwort-Direktive aktiviert: "${doc.title}"` : 'Direktive deaktiviert');
                                                        }}
                                                        style={{
                                                            background: isActive ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                                            color: isActive ? '#00f0ff' : 'var(--text-muted)',
                                                            border: `1px solid ${isActive ? '#00f0ff' : 'rgba(255, 255, 255, 0.12)'}`,
                                                            borderRadius: '6px',
                                                            padding: '5px 12px',
                                                            fontSize: '0.72rem',
                                                            fontWeight: 800,
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '5px',
                                                            transition: 'all 0.15s'
                                                        }}
                                                    >
                                                        <span>{isActive ? '✓' : '⚡'}</span>
                                                        <span>{isActive ? 'AKTIV IN ANTWORTEN' : 'Als Direktive aktivieren'}</span>
                                                    </button>

                                                    {/* Preview Toggle Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewDocId(isPreview ? null : doc.id)}
                                                        style={{
                                                            background: 'transparent',
                                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                                            color: 'var(--text-muted)',
                                                            borderRadius: '6px',
                                                            padding: '5px 10px',
                                                            fontSize: '0.72rem',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {isPreview ? '✕ Verbergen' : '👁️ Text'}
                                                    </button>

                                                    {/* Delete Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (window.confirm(`Möchtest du "${doc.title}" wirklich aus der A.H. Datenbank löschen?`)) {
                                                                deleteKnowledgeDocument(doc.id);
                                                                if (isActive) setActiveDocId(null);
                                                                if (isPreview) setPreviewDocId(null);
                                                                showActionToast(`🗑️ "${doc.title}" gelöscht`);
                                                            }
                                                        }}
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: '#ef4444',
                                                            cursor: 'pointer',
                                                            fontSize: '0.85rem',
                                                            padding: '4px'
                                                        }}
                                                        title="Löschen"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Expandable Preview Accordion */}
                                            {isPreview && (
                                                <div style={{
                                                    padding: '14px 18px',
                                                    background: 'rgba(0, 0, 0, 0.55)',
                                                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '8px'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <span style={{ fontSize: '0.7rem', color: '#00f0ff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                                                            PROMPT-INHALT / SYSTEM-DIREKTIVE:
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                navigator.clipboard?.writeText(doc.content);
                                                                showActionToast('📋 Prompt-Text in die Zwischenablage kopiert!');
                                                            }}
                                                            style={{
                                                                background: 'rgba(255, 255, 255, 0.08)',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                padding: '3px 8px',
                                                                fontSize: '0.68rem',
                                                                color: 'var(--text-main)',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            📋 Kopieren
                                                        </button>
                                                    </div>
                                                    <pre style={{
                                                        margin: 0,
                                                        padding: '12px',
                                                        background: 'rgba(0, 0, 0, 0.4)',
                                                        borderRadius: '6px',
                                                        border: '1px solid rgba(255, 255, 255, 0.04)',
                                                        color: '#e2e8f0',
                                                        fontSize: '0.74rem',
                                                        lineHeight: 1.5,
                                                        whiteSpace: 'pre-wrap',
                                                        maxHeight: '260px',
                                                        overflowY: 'auto'
                                                    }}>
                                                        {doc.content}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: CONFIG / SETTINGS */}
                {activeTab === 'settings' && (
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: 'var(--text-main)' }}>
                                ⚙️ AI Engine Settings
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Configure backend intelligence providers (Local AgentHunter.js, OpenAI, Anthropic Claude, Ollama, LM Studio).
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Provider</label>
                                <select
                                    value={provider}
                                    onChange={(e) => {
                                        const p = e.target.value;
                                        setProvider(p);
                                        if (p === 'openai') setModel('gpt-4o-mini');
                                        else if (p === 'anthropic') setModel('claude-3-5-sonnet-20241022');
                                        else if (p === 'ollama') { setModel('llama3'); setEndpoint('http://localhost:11434'); }
                                        else if (p === 'lmstudio') { setModel('local-model'); setEndpoint('http://localhost:1234'); }
                                        else setModel('LaMini-GPT-124M');
                                    }}
                                    style={{ width: '100%', padding: '7px 10px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                                >
                                    <option value="local">Agent Hunter Local Engine (AgentHunter.js — Offline)</option>
                                    <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                                    <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
                                    <option value="ollama">Ollama (Local LLM Server)</option>
                                    <option value="lmstudio">LM Studio (Local LLM Server)</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Model Name</label>
                                <input
                                    type="text"
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                    placeholder={provider === 'local' ? 'LaMini-GPT-124M' : 'e.g. gpt-4o-mini'}
                                    disabled={provider === 'local'}
                                    style={{ width: '100%', padding: '7px 10px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                                />
                            </div>
                        </div>

                        {(provider === 'openai' || provider === 'anthropic') && (
                            <div>
                                <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '4px' }}>API Key</label>
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder={`Enter your ${provider === 'openai' ? 'OpenAI' : 'Anthropic'} API Key`}
                                    style={{ width: '100%', padding: '7px 10px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                                />
                            </div>
                        )}

                        {(provider === 'ollama' || provider === 'lmstudio') && (
                            <div>
                                <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Server Endpoint URL</label>
                                <input
                                    type="text"
                                    value={endpoint}
                                    onChange={(e) => setEndpoint(e.target.value)}
                                    placeholder={provider === 'ollama' ? 'http://localhost:11434' : 'http://localhost:1234'}
                                    style={{ width: '100%', padding: '7px 10px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                                />
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleSaveSettings}
                            style={{
                                alignSelf: 'flex-start',
                                background: 'var(--primary)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '8px 16px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                            }}
                        >
                            Save Settings
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
