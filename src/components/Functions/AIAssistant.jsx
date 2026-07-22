/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useAI } from '../../hooks/useAI';
import { useStore } from '../../store';
import { SKILL_DEF } from '../../constants';

const AIIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
        <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5ZM3 8.062C3 6.76 4.235 5.765 5.53 5.889a28.02 28.02 0 0 1 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.933.933 0 0 1-.765.935c-.845.147-2.34.346-4.235.346-1.895 0-3.39-.2-4.235-.346A.933.933 0 0 1 3 9.219V8.062Zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a24.767 24.767 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25.286 25.286 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.742-1.5a.25.25 0 0 0-.182-.135Z" />
        <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2V1.866ZM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5Z" />
    </svg>
);

export default function AIAssistant() {
    const { isReady, isProcessing, progress, output, error, generateText } = useAI();
    const [prompt, setPrompt] = useState('');
    const [activeDocId, setActiveDocId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [lastActionStatus, setLastActionStatus] = useState('');
    const [showGuide, setShowGuide] = useState(true);

    const aiKnowledgeBase = useStore(state => state.aiKnowledgeBase || []);
    const addKnowledgeDocument = useStore(state => state.addKnowledgeDocument);
    const deleteKnowledgeDocument = useStore(state => state.deleteKnowledgeDocument);

    const aiSettings = useStore(state => state.aiSettings) || { provider: 'local', apiKey: '', model: 'gpt-4o-mini', endpoint: '' };
    const setAiSettings = useStore(state => state.setAiSettings);

    const [provider, setProvider] = useState(aiSettings.provider || 'local');
    const [apiKey, setApiKey] = useState(aiSettings.apiKey || '');
    const [model, setModel] = useState(aiSettings.model || 'gpt-4o-mini');
    const [endpoint, setEndpoint] = useState(aiSettings.endpoint || '');
    const [showSettings, setShowSettings] = useState(false);

    const handleSaveSettings = () => {
        setAiSettings({ provider, apiKey, model, endpoint });
        alert("💾 AI Settings saved successfully!");
    };

    const getProviderTitle = () => {
        switch (aiSettings.provider) {
            case 'openai': return 'OpenAI GPT Assistant';
            case 'anthropic': return 'Anthropic Claude Assistant';
            case 'ollama': return 'Ollama Local LLM';
            case 'lmstudio': return 'LM Studio Local LLM';
            default: return 'Local AI Assistant';
        }
    };

    const getProviderSubtitle = () => {
        switch (aiSettings.provider) {
            case 'openai': return 'Cloud intelligence via OpenAI API.';
            case 'anthropic': return 'Cloud intelligence via Anthropic Claude API.';
            case 'ollama': return `Local offline intelligence connected to Ollama (${aiSettings.endpoint || 'http://localhost:11434'}).`;
            case 'lmstudio': return `Local offline intelligence connected to LM Studio (${aiSettings.endpoint || 'http://localhost:1234'}).`;
            default: return '100% private, running entirely in your browser using Transformers.js.';
        }
    };

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
            } else if (result && result.error && result.error !== 'No file selected') {
                alert("Error parsing PDF: " + result.error);
            }
        } catch (err) {
            alert("Failed to parse PDF.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (prompt.trim() !== '') {
            setLastActionStatus('');
            try {
                const state = useStore.getState();

                const safeMap = (arr, fn) => Array.isArray(arr) ? arr.map(fn).filter(Boolean).join(', ') : 'None';
                const safeMapLines = (arr, fn) => Array.isArray(arr) ? arr.map(fn).filter(Boolean).join('\n') : 'None';

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

                // 8. COMPLETE_GOAL Intent
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
                  } else {
                    toolFeedback = `[SYSTEM ACTION INFO: No matching goal found to complete. Ask the user which specific goal they want to mark as done.]`;
                  }
                }

                // 4. ADD_GOAL Intent
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

                // 5. ADD_REMINDER Intent
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

                // 6. UNLOCK_SKILL Intent
                else if (lowerPrompt.includes('skill') || lowerPrompt.includes('fähigkeit') || lowerPrompt.includes('freischalten') || lowerPrompt.includes('unlock')) {
                  const allSkills = SKILL_DEF || [];
                  let matchedSkill = null;
                  for (const sk of allSkills) {
                    if (sk && sk.name && lowerPrompt.includes(sk.name.toLowerCase())) {
                      matchedSkill = sk;
                      break;
                    }
                  }
                  if (matchedSkill) {
                    const alreadyUnlocked = (state.skills || []).includes(matchedSkill.id);
                    if (alreadyUnlocked) {
                      toolFeedback = `[SYSTEM ACTION INFO: Skill "${matchedSkill.name}" is already unlocked.]`;
                    } else {
                      const userXp = state.profile?.xp || 0;
                      const hasXp = userXp >= (matchedSkill.xpReq || 0);
                      const reqsMet = (matchedSkill.reqs || []).every(reqId => (state.skills || []).includes(reqId));
                      
                      if (hasXp && reqsMet) {
                        state.setSkills(prev => [...(prev || []), matchedSkill.id]);
                        const statusText = `Unlocked skill "${matchedSkill.name}" from Life Tree`;
                        setLastActionStatus(statusText);
                        toolFeedback = `[SYSTEM ACTION COMPLETED: ${statusText}. Congratulate them on expanding their Life Tree!]`;
                      } else {
                        const statusText = `Failed to unlock skill "${matchedSkill.name}" (Needs ${matchedSkill.xpReq} XP, Prerequisites: ${matchedSkill.reqs.join(', ') || 'None'})`;
                        setLastActionStatus(statusText);
                        toolFeedback = `[SYSTEM ACTION FAILED: Cannot unlock skill "${matchedSkill.name}". Requirements not met (Needs ${matchedSkill.xpReq} XP, current XP: ${userXp}, and prerequisites: ${matchedSkill.reqs.join(', ') || 'None'}). Explain this to the user.]`;
                      }
                    }
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

                // 9. DELETE_ITEM Intent
                else if (lowerPrompt.includes('lösche') || lowerPrompt.includes('delete') || lowerPrompt.includes('entferne') || lowerPrompt.includes('remove')) {
                  let deletedSomething = false;
                  let statusText = '';

                  if (lowerPrompt.includes('kühlschrank') || lowerPrompt.includes('fridge') || lowerPrompt.includes('essen') || lowerPrompt.includes('lebensmittel') || (state.fridge || []).some(f => lowerPrompt.includes(f.name.toLowerCase()))) {
                    const matchedItem = (state.fridge || []).find(f => lowerPrompt.includes(f.name.toLowerCase()));
                    if (matchedItem) {
                      state.setFridge(prev => prev.filter(f => f.id !== matchedItem.id));
                      statusText = `Removed "${matchedItem.name}" from fridge inventory`;
                      deletedSomething = true;
                    }
                  }

                  if (!deletedSomething && (lowerPrompt.includes('ziel') || lowerPrompt.includes('goal') || lowerPrompt.includes('aufgabe'))) {
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
                        [goalType]: prev[goalType].filter(g => g.id !== matchedGoal.id)
                      }));
                      statusText = `Deleted goal: "${matchedGoal.text}"`;
                      deletedSomething = true;
                    }
                  }

                  if (!deletedSomething && (lowerPrompt.includes('ausgabe') || lowerPrompt.includes('expense') || lowerPrompt.includes('kosten'))) {
                    const amountMatch = lowerPrompt.match(/(\d+(?:[.,]\d+)?)/);
                    if (amountMatch) {
                      const amount = parseFloat(amountMatch[1].replace(',', '.'));
                      const matchedExpense = (state.expenses || []).find(exp => Math.abs(exp.amount - amount) < 0.01);
                      if (matchedExpense) {
                        state.setExpenses(prev => prev.filter(exp => exp.id !== matchedExpense.id));
                        statusText = `Deleted expense of ${currency}${matchedExpense.amount} for "${matchedExpense.category}"`;
                        deletedSomething = true;
                      }
                    }
                  }

                  if (deletedSomething) {
                    setLastActionStatus(statusText);
                    toolFeedback = `[SYSTEM ACTION COMPLETED: ${statusText}. Inform the user that the item was successfully deleted.]`;
                  } else {
                    toolFeedback = `[SYSTEM ACTION INFO: Delete request was not executed because no matching item (fridge item, goal, or expense) could be identified. Ask the user for clarification.]`;
                  }
                }

                const recentExpenses = Array.isArray(state.expenses) ? state.expenses.slice(-5).map(exp => `${currency}${exp.amount} for ${exp.category}`).join(', ') : 'None';
                const currentGoals = [...(Array.isArray(state.goals?.week) ? state.goals.week : []), ...(Array.isArray(state.goals?.month) ? state.goals.month : [])].map(g => g?.text).filter(Boolean).join(', ') || 'None';

                const habits = safeMap(state.customHabitTemplates || [], h => h?.name ? `${h.name} (${h.repeat || 'Daily'})` : null);
                const assets = safeMap(state.assets, a => a?.name ? `${a.name}: ${currency}${a.amount}` : null);
                const books = safeMapLines(state.books, b => b?.title ? `- ${b.title} by ${b.subtitle || 'Unknown'} [Status: ${b.status}, Rating: ${b.rating}★] ${b.notes ? `(Notes: ${b.notes})` : ''}` : null);
                const movies = safeMapLines(state.movies, m => m?.title ? `- ${m.title} [Genre/Type: ${m.subtitle || 'Unknown'}, Status: ${m.status}, Rating: ${m.rating}★] ${m.notes ? `(Notes: ${m.notes})` : ''}` : null);
                const trips = safeMap(state.trips, t => t?.location ? `${t.location} (${t.status})` : null);
                const unlockedSkills = Array.isArray(state.skills) ? state.skills.join(', ') : 'None';
                const fridgeItems = safeMap(state.fridge, f => f?.name);

                // Extended contexts
                const recentJournal = safeMapLines((state.journal || []).slice(-5), j => j?.title ? `- ${j.title} (${j.date || ''}): ${j.content ? j.content.substring(0, 150) + '...' : ''}` : null);
                const recentNotes = safeMapLines((state.editorFiles || []).slice(-5), n => n?.title ? `- ${n.title} (Folder: ${n.folder || 'Root'}): ${n.content ? n.content.substring(0, 150) + '...' : ''}` : null);
                const tradingPlanInfo = state.tradingPlan ? `Goals: ${state.tradingPlan.goals || 'None'}, Rules: ${state.tradingPlan.rules || 'None'}, Mindset: ${state.tradingPlan.mindset || 'None'}, Routine: ${state.tradingPlan.routine || 'None'}` : 'None';
                const recentTrades = safeMap((state.trades || []).slice(-5), t => t?.symbol ? `${t.symbol} (${t.type}, P&L: ${currency}${t.pnl || 0})` : null);
                const recentWorkouts = safeMap((state.workouts || []).slice(-5), w => w?.name ? `${w.name} (${w.duration || w.date || ''})` : null);

                const contextData = `
System Context: You are an AI Assistant built into the Life Planner OS. You have full access to the user's life data. Use this data to provide highly personalized advice, motivation, and answers.
${toolFeedback ? `Notice: ${toolFeedback}\n` : ''}
--- USER DATA ---
Profile: Name: ${state.profile?.username || 'User'}, Age: ${state.profile?.age || 'N/A'}, Goal: ${state.profile?.fitnessGoal || 'N/A'}
Life Goals: ${state.profile?.goals || 'None set'}
Current Tasks: ${currentGoals}
Recent Expenses: ${recentExpenses}
Capital Assets: ${assets}
Active Habits: ${habits}
Reading Library:
${books}
Cinema Watchlist:
${movies}
Travel Plans: ${trips}
Fridge Inventory: ${fridgeItems}
Unlocked Skills: ${unlockedSkills}
Recent Workouts: ${recentWorkouts}
Trading Plan: ${tradingPlanInfo}
Recent Trades: ${recentTrades}
Recent Journal Entries:
${recentJournal}
Recent Personal Notes:
${recentNotes}
-----------------

${state.aiKnowledgeBase?.find(d => d.id === activeDocId) ? `\n--- ACTIVE REFERENCE DOCUMENT: ${state.aiKnowledgeBase.find(d => d.id === activeDocId).title} ---\n${state.aiKnowledgeBase.find(d => d.id === activeDocId).content.substring(0, 4000)}\n[End of Document]\n-----------------------------` : ''}
                `.trim();

                await generateText(prompt, contextData);
            } catch (err) {
                console.error("Error generating AI response:", err);
                alert("Sorry, an error occurred while processing your request: " + err.message);
            }
        }
    };

    return (
        <div className="premium-container" style={{ maxWidth: '900px' }}>
            <div className="premium-header-container">
                <div className="premium-icon-wrapper" style={{ background: 'rgba(var(--primary-rgb), 0.2)', color: 'var(--primary)' }}>
                    <AIIcon />
                </div>
                <h1 className="premium-title">{getProviderTitle()}</h1>
                <p className="premium-subtitle">{getProviderSubtitle()}</p>
            </div>

            {/* AI Provider Config Card */}
            <div style={{
                marginBottom: '20px',
                padding: '20px',
                background: 'rgba(var(--primary-rgb), 0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '0.95rem', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        ⚙️ AI Connection Settings
                    </h3>
                    <button
                        type="button"
                        onClick={() => setShowSettings(!showSettings)}
                        className="notion-button secondary"
                        style={{ padding: '4px 12px', fontSize: '0.75rem', margin: 0 }}
                    >
                        {showSettings ? 'Hide Settings' : 'Configure Provider'}
                    </button>
                </div>

                {showSettings && (
                    <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
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
                                    <option value="local">Local AI (Transformers.js)</option>
                                    <option value="openai">OpenAI (GPT-4o)</option>
                                    <option value="anthropic">Anthropic (Claude)</option>
                                    <option value="ollama">Ollama (Local LLM)</option>
                                    <option value="lmstudio">LM Studio (Local LLM)</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Model Name</label>
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
                            style={{ padding: '10px 16px', fontSize: '0.85rem', width: 'auto', alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            Save Settings
                        </button>
                    </div>
                )}
            </div>

            <div className="notion-block" style={{ padding: '30px' }}>
                {/* Guide Toggle Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                    <button
                        type="button"
                        onClick={() => setShowGuide(!showGuide)}
                        className="notion-button secondary"
                        style={{ margin: 0, fontSize: '0.8rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <span>{showGuide ? '📖 Hide Guide / Anleitung ausblenden' : '📖 Show Guide / Anleitung anzeigen'}</span>
                    </button>
                </div>

                {/* Capabilities Guide */}
                {showGuide && (
                    <div style={{
                        padding: '20px',
                        background: 'rgba(var(--primary-rgb), 0.04)',
                        border: '1px solid rgba(var(--primary-rgb), 0.15)',
                        borderRadius: '12px',
                        marginBottom: '25px',
                        fontSize: '0.85rem',
                        color: 'var(--text-main)',
                        lineHeight: '1.6',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: '10px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                            🤖 What can the AI do? / Was kann die KI?
                        </h3>
                        <p style={{ margin: '0 0 15px 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            This local AI has full access to your E.O.M profile data, finances, workouts, and notes to give you highly personalized feedback and perform actions directly on your OS.
                        </p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                                <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>🧠 Personal Coach / Kontext</strong>
                                    Analyzes your data (habits, journal, expenses) for motivation and summaries.
                                    <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                        Ex: "Gib mir Motivation für meine Ziele" or "Summarize my notes"
                                    </div>
                                </div>
                                
                                <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>📚 PDF Knowledge Base</strong>
                                    Upload PDFs to chat with your documents. Click an uploaded document to activate it.
                                    <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                        Ex: Upload study guide & ask questions.
                                    </div>
                                </div>
    
                                <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', gridColumn: '1 / -1' }}>
                                    <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '6px', fontSize: '0.85rem' }}>⚡ Direct App Actions (Keywords in German & English)</strong>
                                    You can execute tasks in E.O.M by typing commands with these key phrases:
                                    <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', fontSize: '0.8rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '6px 20px' }}>
                                        <li><strong>Expense:</strong> <em>"spent 12€ for coffee"</em> / <em>"Ausgabe 10€"</em></li>
                                        <li><strong>Fridge:</strong> <em>"add milk to fridge"</em> / <em>"Kühlschrank: Äpfel"</em></li>
                                        <li><strong>Habit:</strong> <em>"complete habit gym"</em> / <em>"Gewohnheit Sport erledigt"</em></li>
                                        <li><strong>Reminder:</strong> <em>"remind me to call Mom"</em> / <em>"Erinnere mich..."</em></li>
                                        <li><strong>Goal:</strong> <em>"goal read 5 books"</em> / <em>"Ziel Laufen gehen"</em></li>
                                        <li><strong>Skill Tree:</strong> <em>"unlock skill focus"</em> / <em>"Skill Meditation freischalten"</em></li>
                                    </ul>
                                </div>
                        </div>
                    </div>
                )}

                {/* Ladezustand */}
                {!isReady && !error && (
                    <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '12px', border: '1px solid rgba(var(--primary-rgb), 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>Loading AI Model (Approx. 150MB first time)...</span>
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

                {/* Error */}
                {error && (
                    <div style={{ padding: '15px', background: 'rgba(255, 60, 60, 0.1)', border: '1px solid rgba(255, 60, 60, 0.3)', borderRadius: '12px', color: '#ff4d4d', marginBottom: '20px', fontSize: '0.9rem' }}>
                        <strong>Error loading or running AI:</strong> {error}
                    </div>
                )}

                {/* Knowledge Base */}
                <div style={{ marginBottom: '20px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '0.95rem', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            📚 AI Knowledge Base
                        </h3>
                        <button
                            type="button"
                            onClick={handleUploadPDF}
                            disabled={isUploading}
                            className="notion-button secondary"
                            style={{ padding: '4px 12px', fontSize: '0.75rem', margin: 0 }}
                        >
                            {isUploading ? 'Parsing...' : 'Upload PDF'}
                        </button>
                    </div>

                    {aiKnowledgeBase.length === 0 ? (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
                            Upload PDF documents to expand the AI's knowledge. Click a document to activate it for the next prompt.
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '5px' }}>
                            {aiKnowledgeBase.map(doc => (
                                <div key={doc.id} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '8px 12px', borderRadius: '8px',
                                    background: activeDocId === doc.id ? 'rgba(var(--primary-rgb), 0.15)' : 'rgba(0,0,0,0.2)',
                                    border: `1px solid ${activeDocId === doc.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)'}`,
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }} onClick={() => setActiveDocId(activeDocId === doc.id ? null : doc.id)}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '1.2rem' }}>📄</span>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: activeDocId === doc.id ? 600 : 500, color: activeDocId === doc.id ? 'var(--primary)' : 'var(--text-main)' }}>
                                                {doc.title}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                {(doc.content.length / 1000).toFixed(1)}k chars
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {activeDocId === doc.id && <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', marginRight: '5px' }}>Active</span>}
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); deleteKnowledgeDocument(doc.id); if (activeDocId === doc.id) setActiveDocId(null); }}
                                            style={{ background: 'transparent', border: 'none', color: 'var(--red-text)', cursor: 'pointer', padding: '4px' }}
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

                {/* Eingabefeld */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Ask the AI (English recommended)
                        </label>
                        <textarea
                            className="mac-input"
                            rows={3}
                            placeholder="e.g. Can you motivate me to achieve my goals?"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={!isReady || isProcessing}
                            style={{ resize: 'vertical', minHeight: '80px', width: '100%' }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="mac-btn mac-btn-add"
                        disabled={!isReady || isProcessing || prompt.trim() === ''}
                        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px' }}
                    >
                        {isProcessing ? (
                            <>
                                <div className="spinner" style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                Generating Response...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z" /></svg>
                                Send Prompt
                            </>
                        )}
                    </button>
                </form>

                {/* Action Execution Status */}
                {lastActionStatus && (
                    <div style={{
                        marginTop: '20px',
                        padding: '12px 16px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '8px',
                        color: '#10b981',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span>⚡</span>
                        <span>Pseudo-MCP Action Executed: {lastActionStatus}</span>
                    </div>
                )}

                {/* Ausgabe */}
                {output && (
                    <div style={{
                        marginTop: '30px',
                        padding: '20px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        position: 'relative'
                    }}>
                        <div style={{ position: 'absolute', top: '-12px', left: '20px', background: 'var(--primary)', color: '#fff', padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                            AI Response
                        </div>
                        <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                            {output}
                        </p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
