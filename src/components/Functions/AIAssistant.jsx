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

export default function AIAssistant() {
    const { isReady, isProcessing, progress, error, generateText } = useAI();
    const [prompt, setPrompt] = useState('');
    const [activeDocId, setActiveDocId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'stats' | 'workflow' | 'knowledge' | 'settings'
    const [actionToast, setActionToast] = useState('');

    // Chat History State
    const [messages, setMessages] = useState([
        {
            id: 'init',
            sender: 'agent',
            text: `⚡ **Agent Hunter (A.H.) online.**\n\nSystem Neural MCP Router & Leistungszustand Engine [0..10] bereit.\n\nDu kannst freie Fragen stellen oder Sprach-/Textbefehle eingeben wie:\n- *"spent 15€ for coffee"*\n- *"complete habit workout"*\n- *"what should I cook from my fridge?"*\n- *"starte mein Morning Briefing"*`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            statusTag: 'ENGINE_INITIALIZED: AgentHunter.js Ready'
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
        const fridgeItems = safeMap(state.fridge, f => f?.name);
        const unlockedSkills = Array.isArray(state.skills) ? state.skills.join(', ') : 'None';
        const recentWorkouts = safeMap((state.workouts || []).slice(-5), w => w?.name ? `${w.name} (${w.duration || w.date || ''})` : null);
        const recentJournal = safeMapLines((state.journal || []).slice(-3), j => j?.title ? `- ${j.title} (${j.date || ''}): ${j.content ? j.content.substring(0, 100) + '...' : ''}` : null);

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
-----------------
${state.aiKnowledgeBase?.find(d => d.id === activeDocId) ? `\n--- ACTIVE REFERENCE DOCUMENT: ${state.aiKnowledgeBase.find(d => d.id === activeDocId).title} ---\n${state.aiKnowledgeBase.find(d => d.id === activeDocId).content.substring(0, 4000)}\n[End of Document]\n-----------------------------` : ''}
        `.trim();
    };

    // --- CHAT PROCESSOR WITH PSEUDO-MCP TOOL ROUTER ---
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
            const lowerPrompt = queryText.toLowerCase();

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
                    statusText = `Added expense of ${currency}${amount} for "${category}"`;
                    toolFeedback = `[SYSTEM ACTION COMPLETED: ${statusText}.]`;
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
                        statusText = `Added "${itemName}" to fridge inventory`;
                        toolFeedback = `[SYSTEM ACTION COMPLETED: ${statusText}.]`;
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
                    statusText = `Completed today's habit "${matchedHabit.name}" (+50 XP)`;
                    toolFeedback = `[SYSTEM ACTION COMPLETED: ${statusText}.]`;
                }
            }

            // 4. LOG_WORKOUT Intent
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
                statusText = `Logged workout: "${workoutName}" (${duration})`;
                toolFeedback = `[SYSTEM ACTION COMPLETED: ${statusText}.]`;
            }

            // Context Generation
            let contextPayload = '';
            if (lowerPrompt.includes('jagd') || lowerPrompt.includes('hunt') || lowerPrompt.includes('directive') || lowerPrompt.includes('mission')) {
                const { prompt: p } = buildAgentHunterContext(state, 'daily_hunt');
                contextPayload = p;
            } else if (lowerPrompt.includes('briefing') || lowerPrompt.includes('morgen') || lowerPrompt.includes('morning')) {
                const { prompt: p } = buildMorningBriefingContext(state, []);
                contextPayload = p;
            } else if (lowerPrompt.includes('rezept') || lowerPrompt.includes('kochen') || lowerPrompt.includes('recipe') || lowerPrompt.includes('cook') || lowerPrompt.includes('fridge')) {
                const { prompt: p } = buildRecipeAgentContext(state, '');
                contextPayload = p;
            } else {
                contextPayload = `${buildSystemContext()}\n${toolFeedback ? `Notice: ${toolFeedback}\n` : ''}`;
            }

            const responseText = await generateText(queryText, contextPayload);
            const missing = extractMissingIngredients(responseText);

            const agentMsg = {
                id: (Date.now() + 1).toString(),
                sender: 'agent',
                text: responseText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                statusTag: statusText ? `MCP_DISPATCH: ${statusText}` : null,
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
                            📚 Docs ({aiKnowledgeBase.length})
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

                {/* 2. Mini Leistungszustand Ribbon Strip */}
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
                        <span style={{ color: 'var(--text-muted)' }}>Leistungszustand:</span>
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

                {/* 3. WINDOW CONTENT AREA */}

                {/* TAB: CHAT PREVIEW VIEW */}
                {activeTab === 'chat' && (
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '460px' }}>
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

                                    {/* Pseudo-MCP Status Card */}
                                    {msg.statusTag && (
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

                        {/* Preset Quick Actions Row */}
                        <div style={{
                            display: 'flex',
                            gap: '8px',
                            padding: '10px 18px',
                            overflowX: 'auto',
                            borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                            background: 'rgba(0, 0, 0, 0.25)'
                        }}>
                            <button
                                type="button"
                                onClick={() => executeChatPrompt('Starte meine heutige Tages-Jagd und berechne meine 3 Hunter Directives.')}
                                style={{
                                    background: 'rgba(var(--primary-rgb), 0.15)',
                                    border: '1px solid var(--primary)',
                                    borderRadius: '20px',
                                    padding: '5px 12px',
                                    fontSize: '0.74rem',
                                    color: 'var(--primary)',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                🎯 Tages-Jagd
                            </button>
                            <button
                                type="button"
                                onClick={() => executeChatPrompt('Erstelle mein Executive Morning Briefing.')}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '20px',
                                    padding: '5px 12px',
                                    fontSize: '0.74rem',
                                    color: 'var(--text-main)',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                ☀️ Morning Briefing
                            </button>
                            <button
                                type="button"
                                onClick={() => executeChatPrompt('Was kann ich mit meinen aktuellen Lebensmitteln aus dem Kühlschrank kochen?')}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '20px',
                                    padding: '5px 12px',
                                    fontSize: '0.74rem',
                                    color: 'var(--text-main)',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                🍳 Kühlschrank-Rezept
                            </button>
                            <button
                                type="button"
                                onClick={() => executeChatPrompt('spent 12€ for coffee')}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '20px',
                                    padding: '5px 12px',
                                    fontSize: '0.74rem',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                💰 spent 12€
                            </button>
                            <button
                                type="button"
                                onClick={() => executeChatPrompt('log workout chest for 45 minutes')}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '20px',
                                    padding: '5px 12px',
                                    fontSize: '0.74rem',
                                    color: 'var(--text-muted)',
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
                    </div>
                )}

                {/* TAB: LEISTUNGSZUSTAND STATS VIEW */}
                {activeTab === 'stats' && (
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: 'var(--text-main)' }}>
                                    Leistungszustand Diagnostic Matrix [0..10]
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
                            onClick={() => executeChatPrompt('Führe einen tiefen Leistungszustand-Audit durch und sag mir, wie ich auf 10.0 komme.')}
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
                            📊 Deep Audit im Chat starten
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
                                Register Baseline ➔ Settings ➔ System Quad ➔ Feedback Execution Engine ➔ Leistungszustand Algorithm.
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
                                def Leistungszustand(0, 10): Overall Score = {perf.score} / 10.0 ({perf.overallPct}%)
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: KNOWLEDGE BASE */}
                {activeTab === 'knowledge' && (
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: 'var(--text-main)' }}>
                                    📚 Document Knowledge Base & RAG
                                </h3>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    Upload PDFs to chat with your documents. Click a document to activate it for reference.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleUploadPDF}
                                disabled={isUploading}
                                style={{
                                    background: 'var(--primary)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '6px 14px',
                                    fontSize: '0.8rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                {isUploading ? 'Parsing...' : '+ Upload PDF'}
                            </button>
                        </div>

                        {aiKnowledgeBase.length === 0 ? (
                            <div style={{ padding: '25px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                                <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '6px' }}>📑</span>
                                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                                    No PDF documents uploaded yet.
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                                {aiKnowledgeBase.map(doc => (
                                    <div
                                        key={doc.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '8px 12px',
                                            borderRadius: '6px',
                                            background: activeDocId === doc.id ? 'rgba(var(--primary-rgb), 0.18)' : 'rgba(255, 255, 255, 0.03)',
                                            border: `1px solid ${activeDocId === doc.id ? 'var(--primary)' : 'var(--border-color)'}`,
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => setActiveDocId(activeDocId === doc.id ? null : doc.id)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span>📄</span>
                                            <span style={{ fontSize: '0.84rem', color: activeDocId === doc.id ? 'var(--primary)' : 'var(--text-main)', fontWeight: activeDocId === doc.id ? 700 : 500 }}>
                                                {doc.title} ({(doc.content.length / 1000).toFixed(1)}k chars)
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {activeDocId === doc.id && <span style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 700 }}>ACTIVE</span>}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteKnowledgeDocument(doc.id);
                                                    if (activeDocId === doc.id) setActiveDocId(null);
                                                }}
                                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}
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
