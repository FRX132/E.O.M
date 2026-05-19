/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useAI } from '../../hooks/useAI';
import { useStore } from '../../store';

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

    const aiKnowledgeBase = useStore(state => state.aiKnowledgeBase || []);
    const addKnowledgeDocument = useStore(state => state.addKnowledgeDocument);
    const deleteKnowledgeDocument = useStore(state => state.deleteKnowledgeDocument);

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
            try {
                const state = useStore.getState();

                const safeMap = (arr, fn) => Array.isArray(arr) ? arr.map(fn).filter(Boolean).join(', ') : 'None';
                const safeMapLines = (arr, fn) => Array.isArray(arr) ? arr.map(fn).filter(Boolean).join('\n') : 'None';

                const currency = state.profile?.currencySymbol || '€';
                const recentExpenses = Array.isArray(state.expenses) ? state.expenses.slice(-5).map(exp => `${currency}${exp.amount} for ${exp.category}`).join(', ') : 'None';
                const currentGoals = [...(Array.isArray(state.goals?.week) ? state.goals.week : []), ...(Array.isArray(state.goals?.month) ? state.goals.month : [])].map(g => g?.text).filter(Boolean).join(', ') || 'None';

                const habits = safeMap(state.habits, h => h?.name ? `${h.name} (${h.completedDays}/${h.targetDays} days)` : null);
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
                <h1 className="premium-title">Local AI Assistant</h1>
                <p className="premium-subtitle">100% private, running entirely in your browser using Transformers.js.</p>
            </div>

            <div className="notion-block" style={{ padding: '30px' }}>

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
