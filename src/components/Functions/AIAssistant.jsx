/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { useAI } from '../../hooks/useAI';
import { useStore } from '../../store';
import { SKILL_DEF } from '../../constants';
import {
    calculateLeistungszustand,
    buildAgentHunterContext,
    buildMorningBriefingContext,
    buildRecipeAgentContext,
    extractMissingIngredients,
    speakAgentText,
    stopAgentSpeech,
    createSpeechRecognition
} from '../../services/aiAgentService';

const AgentHunterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 0a.5.5 0 0 1 .5.5v.518A7 7 0 0 1 14.982 7.5h.518a.5.5 0 0 1 0 1h-.518A7 7 0 0 1 8.5 14.982v.518a.5.5 0 0 1-1 0v-.518A7 7 0 0 1 1.018 8.5H.5a.5.5 0 0 1 0-1h.518A7 7 0 0 1 7.5 1.018V.5A.5.5 0 0 1 8 0m-.5 2.02A6 6 0 0 0 2.02 7.5h1.005A5 5 0 0 1 7.5 3.025zm1 0v1.005A5 5 0 0 1 12.975 7.5h1.005A6 6 0 0 0 8.5 2.02M12.975 8.5A5 5 0 0 1 8.5 12.975v1.005a6 6 0 0 0 5.48-5.48zM7.5 12.975A5 5 0 0 1 3.025 8.5H2.02a6 6 0 0 0 5.48 5.48zM8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5m0 1a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3"/>
    </svg>
);

export default function AIAssistant() {
    const { isReady, isProcessing, progress, output, setOutput, error, generateText } = useAI();
    const [prompt, setPrompt] = useState('');
    const [activeDocId, setActiveDocId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [lastActionStatus, setLastActionStatus] = useState('');
    const [activeTab, setActiveTab] = useState('hub'); // 'hub' | 'workflow' | 'chat' | 'knowledge' | 'settings'
    const [agentMode, setAgentMode] = useState(null); // 'hunter' | 'briefing' | 'recipe' | 'audit' | 'chat'
    const [recipePref, setRecipePref] = useState('');
    const [detectedIngredients, setDetectedIngredients] = useState([]);
    const [actionToast, setActionToast] = useState('');

    // Voice Interface States
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [voiceLang, setVoiceLang] = useState('de-DE'); // 'de-DE' | 'en-US'
    const [speechRate, setSpeechRate] = useState(1.0);
    const recognitionRef = useRef(null);

    // State from store
    const fullState = useStore(state => state);
    const aiKnowledgeBase = useStore(state => state.aiKnowledgeBase || []);
    const addKnowledgeDocument = useStore(state => state.addKnowledgeDocument);
    const deleteKnowledgeDocument = useStore(state => state.deleteKnowledgeDocument);
    const profile = useStore(state => state.profile || {});

    const aiSettings = useStore(state => state.aiSettings) || { provider: 'local', apiKey: '', model: 'gpt-4o-mini', endpoint: '' };
    const setAiSettings = useStore(state => state.setAiSettings);

    const [provider, setProvider] = useState(aiSettings.provider || 'local');
    const [apiKey, setApiKey] = useState(aiSettings.apiKey || '');
    const [model, setModel] = useState(aiSettings.model || 'gpt-4o-mini');
    const [endpoint, setEndpoint] = useState(aiSettings.endpoint || '');

    // Real-time Leistungszustand calculation
    const perf = calculateLeistungszustand(fullState);

    // Cleanup Speech synthesis on unmount
    useEffect(() => {
        return () => {
            stopAgentSpeech();
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Extract missing ingredients when output changes in recipe mode
    useEffect(() => {
        if (output && agentMode === 'recipe') {
            const missing = extractMissingIngredients(output);
            setDetectedIngredients(missing);
        } else if (agentMode !== 'recipe') {
            setDetectedIngredients([]);
        }
    }, [output, agentMode]);

    const showActionToast = (msg) => {
        setActionToast(msg);
        setTimeout(() => setActionToast(''), 4000);
    };

    const handleSaveSettings = () => {
        setAiSettings({ provider, apiKey, model, endpoint });
        showActionToast("💾 AI Settings saved successfully!");
    };

    const getProviderTitle = () => {
        switch (aiSettings.provider) {
            case 'openai': return 'OpenAI GPT-4o Agent';
            case 'anthropic': return 'Anthropic Claude 3.5 Agent';
            case 'ollama': return 'Ollama Local LLM Agent';
            case 'lmstudio': return 'LM Studio Agent';
            default: return 'Agent Hunter Local Engine (AgentHunter.js)';
        }
    };

    // --- VOICE CONTROLS: TTS ---
    const handleToggleSpeech = () => {
        if (isSpeaking) {
            stopAgentSpeech();
            setIsSpeaking(false);
        } else if (output) {
            setIsSpeaking(true);
            speakAgentText(output, {
                lang: voiceLang,
                rate: speechRate,
                onEnd: () => setIsSpeaking(false),
                onError: (err) => {
                    console.error("Speech Error:", err);
                    setIsSpeaking(false);
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
            onError: (err) => {
                console.warn("STT Error:", err);
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

    // --- SYSTEM CONTEXT BUILDER ---
    const buildSystemContext = () => {
        const state = useStore.getState();
        const safeMap = (arr, fn) => Array.isArray(arr) ? arr.map(fn).filter(Boolean).join(', ') : 'None';
        const safeMapLines = (arr, fn) => Array.isArray(arr) ? arr.map(fn).filter(Boolean).join('\n') : 'None';
        const currency = state.profile?.currencySymbol || '€';

        const recentExpenses = Array.isArray(state.expenses) ? state.expenses.slice(-5).map(exp => `${currency}${exp.amount} for ${exp.category}`).join(', ') : 'None';
        const currentGoals = [...(Array.isArray(state.goals?.week) ? state.goals.week : []), ...(Array.isArray(state.goals?.month) ? state.goals.month : [])].map(g => g?.text).filter(Boolean).join(', ') || 'None';
        const habits = safeMap(state.customHabitTemplates || [], h => h?.name ? `${h.name} (${h.repeat || 'Daily'})` : null);
        const assets = safeMap(state.assets, a => a?.name ? `${a.name}: ${currency}${a.amount}` : null);
        const books = safeMapLines(state.books, b => b?.title ? `- ${b.title} by ${b.subtitle || 'Unknown'} [Status: ${b.status}, Rating: ${b.rating}★] ${b.notes ? `(Notes: ${b.notes})` : ''}` : null);
        const movies = safeMapLines(state.movies, m => m?.title ? `- ${m.title} [Genre/Type: ${m.subtitle || 'Unknown'}, Status: ${m.status}, Rating: ${m.rating}★] ${m.notes ? `(Notes: ${m.notes})` : ''}` : null);
        const trips = safeMap(state.trips, t => t?.location ? `${t.location} (${t.status})` : null);
        const unlockedSkills = Array.isArray(state.skills) ? state.skills.join(', ') : 'None';
        const fridgeItems = safeMap(state.fridge, f => f?.name);
        const recentJournal = safeMapLines((state.journal || []).slice(-5), j => j?.title ? `- ${j.title} (${j.date || ''}): ${j.content ? j.content.substring(0, 150) + '...' : ''}` : null);
        const recentNotes = safeMapLines((state.editorFiles || []).slice(-5), n => n?.title ? `- ${n.title} (Folder: ${n.folder || 'Root'}): ${n.content ? n.content.substring(0, 150) + '...' : ''}` : null);
        const recentWorkouts = safeMap((state.workouts || []).slice(-5), w => w?.name ? `${w.name} (${w.duration || w.date || ''})` : null);

        return `
System Context: You are Agent Hunter (A.H.), the executive Life Operating System work-agent and optimizer.
You coordinate the 8 workflow pillars: Register/Profile -> Settings -> Habits/Goals/Targets/Expense -> Timetable/Skills/Workout/Journal.
Your mission is to elevate the user's Leistungszustand towards 10.0 (100% Professional).
--- USER BASELINE ---
Name: ${state.profile?.username || 'Agent'}, Age: ${state.profile?.age || 'N/A'}, Weight: ${state.profile?.weight || 'N/A'}kg, Height: ${state.profile?.height || 'N/A'}cm, Education: ${state.profile?.education || 'N/A'}, Goal: ${state.profile?.fitnessGoal || 'Maintain'}, XP: ${state.profile?.xp || 0}
--- PERFORMANCE STATE (LEISTUNGSZUSTAND: 0..10) ---
Current Index: ${perf.score} / 10.0 (${perf.overallPct}% - ${perf.tier})
Active Goals: ${currentGoals}
Recent Expenses: ${recentExpenses}
Capital Assets: ${assets}
Active Habits: ${habits}
Fridge Inventory: ${fridgeItems}
Unlocked Skills: ${unlockedSkills}
Recent Workouts: ${recentWorkouts}
Recent Journal Entries: ${recentJournal}
Recent Personal Notes: ${recentNotes}
-----------------
${state.aiKnowledgeBase?.find(d => d.id === activeDocId) ? `\n--- ACTIVE REFERENCE DOCUMENT: ${state.aiKnowledgeBase.find(d => d.id === activeDocId).title} ---\n${state.aiKnowledgeBase.find(d => d.id === activeDocId).content.substring(0, 4000)}\n[End of Document]\n-----------------------------` : ''}
        `.trim();
    };

    // --- AGENT HUNTER WORKFLOW 1: HUNT MISSION (TAGES-JAGD) ---
    const handleRunHunterMission = async () => {
        setAgentMode('hunter');
        setLastActionStatus('');
        stopAgentSpeech();
        setIsSpeaking(false);

        const state = useStore.getState();
        const { prompt: hunterPrompt } = buildAgentHunterContext(state, 'daily_hunt');
        const sysContext = buildSystemContext();

        try {
            await generateText(hunterPrompt, sysContext);
            showActionToast("🎯 Agent Hunter (A.H.) Directives generated!");
        } catch (err) {
            console.error(err);
        }
    };

    // --- AGENT HUNTER WORKFLOW 2: MORNING BRIEFING ---
    const handleRunMorningBriefing = async () => {
        setAgentMode('briefing');
        setLastActionStatus('');
        stopAgentSpeech();
        setIsSpeaking(false);

        const state = useStore.getState();
        const { prompt: briefingPrompt } = buildMorningBriefingContext(state, []);
        const sysContext = buildSystemContext();

        try {
            await generateText(briefingPrompt, sysContext);
            showActionToast("☀️ Executive Morning Briefing ready!");
        } catch (err) {
            console.error(err);
        }
    };

    // --- AGENT HUNTER WORKFLOW 3: SMART RECIPE & RESTOCK ---
    const handleRunRecipeAgent = async () => {
        setAgentMode('recipe');
        setLastActionStatus('');
        stopAgentSpeech();
        setIsSpeaking(false);

        const state = useStore.getState();
        const { prompt: recipePrompt } = buildRecipeAgentContext(state, recipePref);
        const sysContext = buildSystemContext();

        try {
            await generateText(recipePrompt, sysContext);
            showActionToast("🍳 Kitchen & Nutrition Plan generated!");
        } catch (err) {
            console.error(err);
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
        setDetectedIngredients([]);
    };

    // --- AGENT HUNTER WORKFLOW 4: DEEP AUDIT ---
    const handleRunAudit = async () => {
        setAgentMode('audit');
        setLastActionStatus('');
        stopAgentSpeech();
        setIsSpeaking(false);

        const state = useStore.getState();
        const { prompt: auditPrompt } = buildAgentHunterContext(state, 'deep_performance_audit');
        const sysContext = buildSystemContext();

        try {
            await generateText(auditPrompt, sysContext);
            showActionToast("📊 Leistungszustand Audit complete!");
        } catch (err) {
            console.error(err);
        }
    };

    // --- PROMPT COMMAND EXECUTION ---
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (prompt.trim() !== '') {
            setLastActionStatus('');
            setAgentMode('chat');
            stopAgentSpeech();
            setIsSpeaking(false);

            try {
                const state = useStore.getState();
                const currency = state.profile?.currencySymbol || '€';
                
                // --- PSEUDO-MCP TOOL ROUTER ---
                let toolFeedback = '';
                const lowerPrompt = prompt.toLowerCase();

                // 1. ADD_EXPENSE Intent
                if (lowerPrompt.includes('ausgabe') || lowerPrompt.includes('expense') || lowerPrompt.includes('bezahlt') || lowerPrompt.includes('spent')) {
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
                    const statusText = `Added expense of ${currency}${amount} under category "${category}"`;
                    setLastActionStatus(statusText);
                    toolFeedback = `[SYSTEM ACTION COMPLETED: ${statusText}. Inform the user that it was done successfully.]`;
                  }
                }
                
                // 2. ADD_FRIDGE Intent
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
                      const statusText = `Added "${itemName}" to fridge inventory`;
                      setLastActionStatus(statusText);
                      toolFeedback = `[SYSTEM ACTION COMPLETED: ${statusText}. Inform the user.]`;
                    }
                  }
                }

                // 3. COMPLETE_HABIT Intent
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
                    const statusText = `Completed today's habit "${matchedHabit.name}" (+50 XP)`;
                    setLastActionStatus(statusText);
                    toolFeedback = `[SYSTEM ACTION COMPLETED: ${statusText}. Congratulate the user.]`;
                  }
                }

                // 4. COMPLETE_GOAL Intent
                else if ((lowerPrompt.includes('ziel') || lowerPrompt.includes('goal') || lowerPrompt.includes('aufgabe')) && (lowerPrompt.includes('erledigt') || lowerPrompt.includes('abgeschlossen') || lowerPrompt.includes('done') || lowerPrompt.includes('complete') || lowerPrompt.includes('finish') || lowerPrompt.includes('check'))) {
                  const goalList = state.goals || { week: [], month: [], year: [] };
                  let matchedGoal = null;
                  let goalType = '';

                  const searchInList = (list, key) => {
                    if (!Array.isArray(list)) return;
                    for (const g of list) {
                      if (g && g.text && lowerPrompt.includes(g.text.toLowerCase())) {
                        matchedGoal = g;
                        goalType = key;
                        break;
                      }
                    }
                  };

                  searchInList(goalList.week, 'week');
                  if (!matchedGoal) searchInList(goalList.month, 'month');
                  if (!matchedGoal) searchInList(goalList.year, 'year');

                  if (matchedGoal) {
                    state.setGoals(prev => ({
                      ...prev,
                      [goalType]: prev[goalType].map(g => g.id === matchedGoal.id ? { ...g, completed: true } : g)
                    }));
                    const statusText = `Marked goal "${matchedGoal.text}" as completed`;
                    setLastActionStatus(statusText);
                    toolFeedback = `[SYSTEM ACTION COMPLETED: ${statusText}. Congratulate the user on achieving their goal!]`;
                  }
                }

                // 5. ADD_GOAL Intent
                else if (lowerPrompt.includes('ziel') || lowerPrompt.includes('goal') || lowerPrompt.includes('aufgabe')) {
                  const goalMatch = lowerPrompt.match(/(?:ziel|goal|aufgabe)\s+([a-zA-ZäöüÄÖÜß\s]{5,100})/i);
                  if (goalMatch) {
                    const goalText = goalMatch[1].trim();
                    const newGoal = {
                      id: Date.now(),
                      text: goalText,
                      completed: false,
                      category: 'Core'
                    };
                    state.setGoals(prev => ({
                      ...prev,
                      week: [...(prev.week || []), newGoal]
                    }));
                    const statusText = `Added weekly goal: "${goalText}"`;
                    setLastActionStatus(statusText);
                    toolFeedback = `[SYSTEM ACTION COMPLETED: ${statusText}. Encourage the user.]`;
                  }
                }

                // 6. ADD_REMINDER Intent
                else if (lowerPrompt.includes('erinnerung') || lowerPrompt.includes('reminder') || lowerPrompt.includes('erinnere')) {
                  const reminderMatch = lowerPrompt.match(/(?:erinnere mich an|erinnerung|reminder|remind me to)\s+([a-zA-ZäöüÄÖÜß\s]{3,100})/i);
                  if (reminderMatch) {
                    const title = reminderMatch[1].trim();
                    const todayDayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
                    const newBlock = {
                      id: Date.now(),
                      title: title,
                      time: '12:00',
                      duration: 1,
                      day: todayDayName,
                      isReminder: true,
                      completed: false
                    };
                    state.setTimetableBlocks(prev => [...(prev || []), newBlock]);
                    const statusText = `Set reminder for today: "${title}"`;
                    setLastActionStatus(statusText);
                    toolFeedback = `[SYSTEM ACTION COMPLETED: ${statusText}. Inform the user that it will display in the Daily Reminders widget.]`;
                  }
                }

                // 7. LOG_WORKOUT Intent
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
                  const statusText = `Logged workout: "${workoutName}" (${duration})`;
                  setLastActionStatus(statusText);
                  toolFeedback = `[SYSTEM ACTION COMPLETED: ${statusText}. Congratulate the user on their physical training session.]`;
                }

                const sysContext = `${buildSystemContext()}\n${toolFeedback ? `Notice: ${toolFeedback}\n` : ''}`;
                await generateText(prompt, sysContext);
            } catch (err) {
                console.error("Error generating AI response:", err);
                alert("Sorry, an error occurred while processing your request: " + err.message);
            }
        }
    };

    return (
        <div className="premium-container" style={{ maxWidth: '1080px', margin: '0 auto' }}>
            {/* Header / Agent Cockpit Title */}
            <div className="premium-header-container" style={{ position: 'relative' }}>
                <div className="premium-icon-wrapper" style={{ background: 'rgba(var(--primary-rgb), 0.2)', color: 'var(--primary)' }}>
                    <AgentHunterIcon />
                </div>
                <h1 className="premium-title">Agent Hunter (A.H.)</h1>
                <p className="premium-subtitle">
                    Life Operating System Optimizer & Hunting Engine • Blueprint Architecture Active • {getProviderTitle()}
                </p>
            </div>

            {/* LIVE LEISTUNGSZUSTAND HUD BAR [0..10] */}
            <div style={{
                marginBottom: '20px',
                padding: '20px 24px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(var(--primary-rgb), 0.08) 100%)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                backdropFilter: 'blur(16px)'
            }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '15px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '12px',
                            background: 'rgba(0,0,0,0.4)',
                            border: `2px solid ${perf.tierColor}`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 0 16px ${perf.tierColor}33`
                        }}>
                            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: perf.tierColor, lineHeight: 1 }}>{perf.score}</span>
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>/ 10.0</span>
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h2 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 800 }}>Leistungszustand: {perf.tier}</h2>
                                <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: `${perf.tierColor}22`, color: perf.tierColor, fontWeight: 700 }}>
                                    {perf.rankLabel}
                                </span>
                            </div>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                User Baseline: {profile.username || 'Agent'} (Age: {profile.age || '—'}, {profile.weight ? `${profile.weight}kg` : '—'}, {profile.height ? `${profile.height}cm` : '—'}, {profile.education || 'Self-Taught'}) • Scale: 0 = Basics (0%) ➔ 10 = Professional (100%)
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            type="button"
                            onClick={handleRunHunterMission}
                            disabled={!isReady || isProcessing}
                            className="mac-btn mac-btn-add"
                            style={{
                                padding: '8px 16px',
                                fontSize: '0.84rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'var(--primary)',
                                color: '#fff',
                                boxShadow: '0 4px 14px rgba(var(--primary-rgb), 0.4)'
                            }}
                        >
                            <span>🎯</span>
                            {isProcessing && agentMode === 'hunter' ? 'Hunting...' : 'Tages-Jagd starten'}
                        </button>
                    </div>
                </div>

                {/* Performance State Meters Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                    {Object.entries(perf.breakdown).map(([key, item]) => (
                        <div key={key} style={{
                            padding: '8px 12px',
                            background: 'rgba(0,0,0,0.25)',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                <span>{item.label}</span>
                                <strong style={{ color: item.pct >= 70 ? '#10b981' : item.pct >= 40 ? '#f59e0b' : '#ef4444' }}>{item.pct}%</strong>
                            </div>
                            <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${item.pct}%`,
                                    height: '100%',
                                    background: item.pct >= 70 ? '#10b981' : item.pct >= 40 ? '#f59e0b' : '#ef4444',
                                    transition: 'width 0.4s ease-out'
                                }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Toast Notification */}
            {actionToast && (
                <div style={{
                    marginBottom: '15px',
                    padding: '10px 16px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '8px',
                    color: '#10b981',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    animation: 'fadeIn 0.2s ease-in'
                }}>
                    <span>⚡</span>
                    <span>{actionToast}</span>
                </div>
            )}

            {/* Navigation Tabs */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '20px',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '10px',
                overflowX: 'auto'
            }}>
                <button
                    onClick={() => setActiveTab('hub')}
                    style={{
                        padding: '8px 16px',
                        background: activeTab === 'hub' ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                        color: activeTab === 'hub' ? '#fff' : 'var(--text-muted)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <span>⚡</span> Agent Hunter Cockpit
                </button>
                <button
                    onClick={() => setActiveTab('workflow')}
                    style={{
                        padding: '8px 16px',
                        background: activeTab === 'workflow' ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                        color: activeTab === 'workflow' ? '#fff' : 'var(--text-muted)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <span>🗺️</span> Blueprint Architecture
                </button>
                <button
                    onClick={() => setActiveTab('chat')}
                    style={{
                        padding: '8px 16px',
                        background: activeTab === 'chat' ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                        color: activeTab === 'chat' ? '#fff' : 'var(--text-muted)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <span>💬</span> Prompt Terminal
                </button>
                <button
                    onClick={() => setActiveTab('knowledge')}
                    style={{
                        padding: '8px 16px',
                        background: activeTab === 'knowledge' ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                        color: activeTab === 'knowledge' ? '#fff' : 'var(--text-muted)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <span>📚</span> Knowledge Base ({aiKnowledgeBase.length})
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    style={{
                        padding: '8px 16px',
                        background: activeTab === 'settings' ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                        color: activeTab === 'settings' ? '#fff' : 'var(--text-muted)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <span>⚙️</span> AI Config
                </button>
            </div>

            {/* TAB 1: AGENT HUNTER COCKPIT */}
            {activeTab === 'hub' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Hunter Actions Cards Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                        
                        {/* 1. Daily Hunt Mission Card */}
                        <div style={{
                            padding: '20px',
                            background: 'rgba(var(--primary-rgb), 0.04)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '15px',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '1.6rem' }}>🎯</span>
                                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>Hunter Directives & Quests</h3>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                    Algorithmic bottleneck scan across Habits, Goals, Finances & Workout to generate 3 high-impact Tages-Quests.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleRunHunterMission}
                                disabled={!isReady || isProcessing}
                                className="mac-btn mac-btn-add"
                                style={{ padding: '10px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <span>⚔️</span>
                                {isProcessing && agentMode === 'hunter' ? 'Hunting Directives...' : 'Jagd-Mission berechnen'}
                            </button>
                        </div>

                        {/* 2. Daily Morning Briefing Card */}
                        <div style={{
                            padding: '20px',
                            background: 'rgba(var(--primary-rgb), 0.04)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '15px',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '1.6rem' }}>☀️</span>
                                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>Daily Morning Briefing</h3>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                    Executive morning kickoff synthesizing habits, schedule, budget, fridge inventory & global breaking news.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleRunMorningBriefing}
                                disabled={!isReady || isProcessing}
                                className="mac-btn mac-btn-add"
                                style={{ padding: '10px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <span>🌅</span>
                                {isProcessing && agentMode === 'briefing' ? 'Synthesizing...' : 'Morning Briefing'}
                            </button>
                        </div>

                        {/* 3. Smart Kitchen & Fridge Restock */}
                        <div style={{
                            padding: '20px',
                            background: 'rgba(var(--primary-rgb), 0.04)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '15px',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '1.6rem' }}>🍳</span>
                                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>Smart Recipe & Restock</h3>
                                </div>
                                <p style={{ margin: '0 0 10px 0', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                    Inspects what is currently in stock in Fridge inventory and invents fitness meals with 1-click restock.
                                </p>
                                <input
                                    type="text"
                                    placeholder="Optional: e.g. High Protein, 15 min..."
                                    value={recipePref}
                                    onChange={(e) => setRecipePref(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '6px 10px',
                                        background: 'var(--bg-card-alt)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '6px',
                                        color: 'var(--text-main)',
                                        fontSize: '0.78rem'
                                    }}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleRunRecipeAgent}
                                disabled={!isReady || isProcessing}
                                className="mac-btn mac-btn-add"
                                style={{ padding: '10px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <span>🥗</span>
                                {isProcessing && agentMode === 'recipe' ? 'Cooking...' : 'Cook from Fridge'}
                            </button>
                        </div>

                        {/* 4. Deep Leistungszustand Audit */}
                        <div style={{
                            padding: '20px',
                            background: 'rgba(var(--primary-rgb), 0.04)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '15px',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '1.6rem' }}>📊</span>
                                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>Leistungszustand Audit</h3>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                    Comprehensive diagnostic across all 7 life pillars to diagnose score leaks and plan your progression to 10.0.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleRunAudit}
                                disabled={!isReady || isProcessing}
                                className="mac-btn mac-btn-add"
                                style={{ padding: '10px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <span>📈</span>
                                {isProcessing && agentMode === 'audit' ? 'Auditing...' : 'Full Audit starten'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: BLUEPRINT ARCHITECTURE & WORKFLOW MAP */}
            {activeTab === 'workflow' && (
                <div style={{
                    padding: '24px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '14px',
                    marginBottom: '20px'
                }}>
                    <div style={{ marginBottom: '18px' }}>
                        <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🗺️ Agent Hunter (A.H.) Blueprint & Node Architecture
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            Direct implementation of the handwritten workflow plan: Register Baseline ➔ Settings ➔ System Quad ➔ Feedback Execution Engine ➔ Leistungszustand Algorithm [0..10].
                        </p>
                    </div>

                    {/* Interactive Architecture Visualization */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        background: 'rgba(0,0,0,0.3)',
                        padding: '20px',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)'
                    }}>
                        {/* Layer 1: Register Baseline */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                            <div style={{ background: 'var(--primary)', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem' }}>
                                Register Baseline
                            </div>
                            <span style={{ color: 'var(--text-muted)' }}>➔</span>
                            <span style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', fontSize: '0.8rem' }}>Age: {profile.age || 'N/A'}</span>
                            <span style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', fontSize: '0.8rem' }}>Weight: {profile.weight ? `${profile.weight}kg` : 'N/A'}</span>
                            <span style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', fontSize: '0.8rem' }}>Height: {profile.height ? `${profile.height}cm` : 'N/A'}</span>
                            <span style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', fontSize: '0.8rem' }}>Education: {profile.education || 'Self-Taught'}</span>
                            <span style={{ color: 'var(--text-muted)' }}>➔</span>
                            <div style={{ background: 'rgba(var(--primary-rgb), 0.2)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem' }}>
                                Settings & Rules
                            </div>
                        </div>

                        {/* Layer 2: Interconnected Core Quad */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>1. Expense</div>
                                <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Finanzen & Budget</strong>
                                <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>Score: {perf.breakdown.finances.pct}%</div>
                            </div>
                            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>2. Targets</div>
                                <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Big Targets & Quests</strong>
                                <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '4px' }}>{fullState.targets?.length || 0} Quests active</div>
                            </div>
                            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>3. Goals</div>
                                <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Week & Month Goals</strong>
                                <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '4px' }}>Score: {perf.breakdown.goals.pct}%</div>
                            </div>
                            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>4. Habits</div>
                                <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Daily Habits Tracker</strong>
                                <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>Score: {perf.breakdown.habits.pct}%</div>
                            </div>
                        </div>

                        {/* Layer 3: Execution Engine (Tracker -> Workout Hub -> Journal, Timetable, Skills -> Tree) */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Timetable</div>
                                <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Zeitblöcke & Reminder</strong>
                                <div style={{ fontSize: '0.75rem', color: '#00f0ff', marginTop: '4px' }}>Score: {perf.breakdown.timetable.pct}%</div>
                            </div>
                            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Workout Hub ➔ Journal</div>
                                <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Training & Reflexion</strong>
                                <div style={{ fontSize: '0.75rem', color: '#ec4899', marginTop: '4px' }}>Workouts: {perf.breakdown.workout.pct}% • Journal: {perf.breakdown.journal.pct}%</div>
                            </div>
                            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Skills ➔ Life Tree</div>
                                <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>RPG Skill Tree Engine</strong>
                                <div style={{ fontSize: '0.75rem', color: '#8b5cf6', marginTop: '4px' }}>Score: {perf.breakdown.skills.pct}% ({perf.breakdown.skills.unlocked} Skills)</div>
                            </div>
                        </div>

                        {/* Function Formula */}
                        <div style={{
                            padding: '14px',
                            background: 'rgba(var(--primary-rgb), 0.1)',
                            borderRadius: '8px',
                            border: '1px solid rgba(var(--primary-rgb), 0.3)',
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            color: 'var(--text-main)'
                        }}>
                            <code>
                                def Leistungszustand(0, 10):<br />
                                &nbsp;&nbsp;Overall = (Habits * 0.20) + (Goals * 0.20) + (Finance * 0.15) + (Workout * 0.15) + (Timetable * 0.10) + (Skills * 0.10) + (Journal * 0.10)<br />
                                &nbsp;&nbsp;Current Score = {perf.score} / 10.0 ({perf.overallPct}%) ➔ {perf.tier}
                            </code>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: PROMPT TERMINAL & COMMAND ROUTER */}
            {activeTab === 'chat' && (
                <div style={{
                    padding: '20px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    marginBottom: '20px'
                }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Agent Hunter Terminal Prompt
                            </label>
                            {/* Voice Language Selector */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Voice Lang:</span>
                                <button
                                    type="button"
                                    onClick={() => setVoiceLang(voiceLang === 'de-DE' ? 'en-US' : 'de-DE')}
                                    style={{
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '4px',
                                        padding: '2px 8px',
                                        fontSize: '0.75rem',
                                        color: 'var(--primary)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {voiceLang === 'de-DE' ? '🇩🇪 Deutsch' : '🇺🇸 English'}
                                </button>
                            </div>
                        </div>

                        <div style={{ position: 'relative', marginBottom: '12px' }}>
                            <textarea
                                className="mac-input"
                                rows={3}
                                placeholder="Type or speak: 'spent 12€ for coffee', 'complete habit gym', 'what should I cook?', 'add goal learn Rust'..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                disabled={!isReady || isProcessing}
                                style={{
                                    resize: 'vertical',
                                    minHeight: '80px',
                                    width: '100%',
                                    paddingRight: '45px',
                                    border: isListening ? '1px solid #ef4444' : '1px solid var(--border-color)'
                                }}
                            />
                            {/* Microphone STT Button */}
                            <button
                                type="button"
                                onClick={handleToggleListening}
                                title={isListening ? "Stop voice listening" : "Click to speak"}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    bottom: '12px',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    background: isListening ? '#ef4444' : 'rgba(var(--primary-rgb), 0.2)',
                                    color: isListening ? '#fff' : 'var(--primary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.9rem',
                                    boxShadow: isListening ? '0 0 12px rgba(239, 68, 68, 0.6)' : 'none',
                                    animation: isListening ? 'pulse 1.5s infinite' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {isListening ? '⏹️' : '🎙️'}
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="submit"
                                className="mac-btn mac-btn-add"
                                disabled={!isReady || isProcessing || prompt.trim() === ''}
                                style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '10px' }}
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="spinner" style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                        Processing Directives...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z" /></svg>
                                        Send to Agent Hunter
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Quick Command Suggestions */}
                    <div style={{ marginTop: '15px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {[
                            'spent 15€ for groceries',
                            'complete habit workout',
                            'goal read 30 pages',
                            'add milk to fridge',
                            'workout running for 45 min'
                        ].map((cmd, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setPrompt(cmd)}
                                style={{
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '6px',
                                    padding: '4px 10px',
                                    fontSize: '0.74rem',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer'
                                }}
                            >
                                + {cmd}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 4: KNOWLEDGE BASE (PDF RAG) */}
            {activeTab === 'knowledge' && (
                <div style={{
                    padding: '20px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <div>
                            <h3 style={{ fontSize: '0.95rem', margin: '0 0 4px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                📚 PDF Knowledge Base & RAG
                            </h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                                Upload PDFs to chat with your personal books, study material, or notes. Click a document to activate it for inference.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleUploadPDF}
                            disabled={isUploading}
                            className="notion-button secondary"
                            style={{ padding: '6px 14px', fontSize: '0.8rem', margin: 0 }}
                        >
                            {isUploading ? 'Parsing...' : '+ Upload PDF'}
                        </button>
                    </div>

                    {aiKnowledgeBase.length === 0 ? (
                        <div style={{ padding: '30px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>📑</span>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                                No reference documents uploaded yet. Upload a PDF from your desktop to enable document querying.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                            {aiKnowledgeBase.map(doc => (
                                <div
                                    key={doc.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '10px 14px',
                                        borderRadius: '8px',
                                        background: activeDocId === doc.id ? 'rgba(var(--primary-rgb), 0.15)' : 'rgba(0,0,0,0.2)',
                                        border: `1px solid ${activeDocId === doc.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)'}`,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={() => setActiveDocId(activeDocId === doc.id ? null : doc.id)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '1.3rem' }}>📄</span>
                                        <div>
                                            <div style={{ fontSize: '0.88rem', fontWeight: activeDocId === doc.id ? 600 : 500, color: activeDocId === doc.id ? 'var(--primary)' : 'var(--text-main)' }}>
                                                {doc.title}
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                                {(doc.content.length / 1000).toFixed(1)}k characters • Added {new Date(doc.dateAdded || Date.now()).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {activeDocId === doc.id && (
                                            <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', background: 'rgba(var(--primary-rgb), 0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                                                Active Focus
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteKnowledgeDocument(doc.id);
                                                if (activeDocId === doc.id) setActiveDocId(null);
                                            }}
                                            style={{ background: 'transparent', border: 'none', color: 'var(--red-text)', cursor: 'pointer', padding: '4px', fontSize: '0.9rem' }}
                                            title="Delete Document"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 5: AI SETTINGS */}
            {activeTab === 'settings' && (
                <div style={{
                    padding: '20px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px'
                }}>
                    <h3 style={{ fontSize: '0.95rem', margin: '0 0 15px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        ⚙️ AI Provider & Model Configuration
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Provider</label>
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
                                    className="mac-input"
                                    style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-card-alt)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                >
                                    <option value="local">Local AI (Transformers.js — Zero Config)</option>
                                    <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                                    <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
                                    <option value="ollama">Ollama (Local LLM Server)</option>
                                    <option value="lmstudio">LM Studio (Local LLM Server)</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Model Identifier</label>
                                <input
                                    type="text"
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                    placeholder={provider === 'local' ? 'LaMini-GPT-124M' : 'e.g. gpt-4o-mini'}
                                    disabled={provider === 'local'}
                                    className="mac-input"
                                    style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-card-alt)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                />
                            </div>
                        </div>

                        {(provider === 'openai' || provider === 'anthropic') && (
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>API Key</label>
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder={`Enter your ${provider === 'openai' ? 'OpenAI' : 'Anthropic'} API Key`}
                                    className="mac-input"
                                    style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-card-alt)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                />
                            </div>
                        )}

                        {(provider === 'ollama' || provider === 'lmstudio') && (
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Server Endpoint URL</label>
                                <input
                                    type="text"
                                    value={endpoint}
                                    onChange={(e) => setEndpoint(e.target.value)}
                                    placeholder={provider === 'ollama' ? 'http://localhost:11434' : 'http://localhost:1234'}
                                    className="mac-input"
                                    style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-card-alt)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                />
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleSaveSettings}
                            className="mac-btn mac-btn-add"
                            style={{ padding: '10px 18px', fontSize: '0.85rem', width: 'auto', alignSelf: 'flex-start' }}
                        >
                            Save Settings
                        </button>
                    </div>
                </div>
            )}

            {/* Model Loading State (Local Transformers.js) */}
            {!isReady && !error && (
                <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '12px', border: '1px solid rgba(var(--primary-rgb), 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>Loading Local AI Background Model (First time download approx. 150MB)...</span>
                    </div>
                    {progress && progress.status === 'downloading' && (
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{
                                width: `${(progress.loaded / progress.total) * 100}%`,
                                height: '100%',
                                background: 'var(--primary)',
                                transition: 'width 0.2s'
                            }}></div>
                        </div>
                    )}
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255, 60, 60, 0.1)', border: '1px solid rgba(255, 60, 60, 0.3)', borderRadius: '12px', color: '#ff4d4d', fontSize: '0.9rem' }}>
                    <strong>AI Error:</strong> {error}
                </div>
            )}

            {/* Direct Tool Action Executed Feedback */}
            {lastActionStatus && (
                <div style={{
                    marginTop: '20px',
                    padding: '12px 16px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '8px',
                    color: '#10b981',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <span>⚡</span>
                    <span>System Action Executed: {lastActionStatus}</span>
                </div>
            )}

            {/* Missing Ingredients Detected Action Banner */}
            {detectedIngredients.length > 0 && (
                <div style={{
                    marginTop: '20px',
                    padding: '14px 18px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '10px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>🛒</span>
                        <div>
                            <strong style={{ color: '#f59e0b', fontSize: '0.85rem' }}>Fehlende Zutaten erkannt:</strong>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '2px' }}>
                                {detectedIngredients.join(', ')}
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => handleAddMissingToFridge(detectedIngredients)}
                        style={{
                            background: '#f59e0b',
                            color: '#000',
                            fontWeight: 700,
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 14px',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                        }}
                    >
                        + In Kühlschrank (Einkaufsliste) eintragen
                    </button>
                </div>
            )}

            {/* AI Response Viewer with Audio / TTS Toolbar */}
            {output && (
                <div style={{
                    marginTop: '25px',
                    padding: '24px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    position: 'relative'
                }}>
                    {/* Header Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ background: 'var(--primary)', color: '#fff', padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                                {agentMode === 'hunter' ? '🎯 Agent Hunter Directives' : agentMode === 'briefing' ? '☀️ Morning Briefing' : agentMode === 'recipe' ? '🍳 Smart Kitchen Agent' : agentMode === 'audit' ? '📊 Leistungszustand Audit' : '🤖 Agent Hunter Output'}
                            </span>
                        </div>

                        {/* Audio TTS Toolbar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isSpeaking && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginRight: '6px' }}>
                                    <div className="audio-bar" style={{ width: '3px', height: '14px', background: 'var(--primary)', animation: 'soundwave 0.8s infinite alternate' }}></div>
                                    <div className="audio-bar" style={{ width: '3px', height: '20px', background: 'var(--primary)', animation: 'soundwave 0.6s infinite alternate 0.2s' }}></div>
                                    <div className="audio-bar" style={{ width: '3px', height: '12px', background: 'var(--primary)', animation: 'soundwave 0.9s infinite alternate 0.4s' }}></div>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleToggleSpeech}
                                style={{
                                    background: isSpeaking ? 'rgba(239, 68, 68, 0.2)' : 'rgba(var(--primary-rgb), 0.15)',
                                    border: `1px solid ${isSpeaking ? '#ef4444' : 'var(--primary)'}`,
                                    color: isSpeaking ? '#ef4444' : 'var(--primary)',
                                    borderRadius: '6px',
                                    padding: '4px 10px',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <span>{isSpeaking ? '⏹️ Stop Voice' : '🔊 Vorlesen (Read Aloud)'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    navigator.clipboard.writeText(output);
                                    showActionToast("📋 Copied to clipboard!");
                                }}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-muted)',
                                    borderRadius: '6px',
                                    padding: '4px 10px',
                                    fontSize: '0.78rem',
                                    cursor: 'pointer'
                                }}
                            >
                                📋 Copy
                            </button>
                        </div>
                    </div>

                    {/* Output Text */}
                    <div style={{
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        color: 'var(--text-main)',
                        fontSize: '0.94rem',
                        lineHeight: '1.7',
                        fontFamily: 'inherit'
                    }}>
                        {output}
                    </div>
                </div>
            )}

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
                @keyframes soundwave {
                    0% { height: 4px; }
                    100% { height: 18px; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
