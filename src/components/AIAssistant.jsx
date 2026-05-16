import React, { useState } from 'react';
import { useAI } from '../hooks/useAI';
import { useStore } from '../store';
import { Card, Form, Button, ProgressBar, Spinner, Alert } from 'react-bootstrap';

export default function AIAssistant() {
    const { isReady, isProcessing, progress, output, error, generateText } = useAI();
    const [prompt, setPrompt] = useState('');

    // Fetch user data from global store for context injection
    const profile = useStore(state => state.profile);
    const expenses = useStore(state => state.expenses);
    const goals = useStore(state => state.goals);
    const Habits = useStore(state => state.Habits);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (prompt.trim() !== '') {
            // Build a short summary of the user's data
            const recentExpenses = expenses.slice(-5).map(e => `${e.amount}€ for ${e.category}`).join(', ');
            const currentGoals = [...goals.week, ...goals.month].map(g => g.text).join(', ');

            const contextData = `
                User Name: ${profile.username || 'User'}
                Recent Expenses: ${recentExpenses || 'None'}
                Current Goals: ${currentGoals || 'None'}
            `.trim();

            generateText(prompt, contextData);
        }
    };

    return (
        <Card className="m-3 shadow-sm" style={{ border: 'none', background: 'var(--bs-body-bg)' }}>
            <Card.Body>
                <Card.Title className="d-flex align-items-center gap-2">
                    <i className="bi bi-robot text-primary"></i>
                    Lokale KI (Transformers.js)
                </Card.Title>

                {/* Ladezustand / Fehler */}
                {!isReady && !error && (
                    <div className="my-3">
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <Spinner animation="border" size="m" />
                            <small>Lade KI-Modell (beim 1. Start ca. 600MB)...</small>
                        </div>
                        {progress && progress.status === 'downloading' && (
                            <ProgressBar
                                now={(progress.loaded / progress.total) * 100}
                                label={`${Math.round((progress.loaded / progress.total) * 100)}%`}
                                variant="primary"
                                style={{ height: '10px' }}
                            />
                        )}
                    </div>
                )}

                {error && (
                    <Alert variant="danger" className="mt-3">
                        Fehler beim Laden oder Ausführen der KI: {error}
                    </Alert>
                )}

                {/* Eingabefeld */}
                <Form onSubmit={handleSubmit} className="mt-3">
                    <Form.Group className="mb-3">
                        <Form.Label
                            className="text -small">Frag die KI etwas (Englisch funktioniert am besten bei diesem Modell)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="z.B. What is the meaning of life?"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={!isReady || isProcessing}
                            style={{ resize: 'none' }}
                        />
                    </Form.Group>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={!isReady || isProcessing || prompt.trim() === ''}
                        className="w-100 d-flex align-items-center justify-content-center gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <Spinner animation="border" size="sm" />
                                Generiere Antwort...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-send"></i> Senden
                            </>
                        )}
                    </Button>
                </Form>

                {/* Ausgabe */}
                {output && (
                    <div className="mt-4 p-3 rounded" style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                        <strong className="d-block mb-2 text-primary">Antwort:</strong>
                        <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{output}</p>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
}
