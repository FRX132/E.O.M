import { useState, useEffect, useRef, useCallback } from 'react';

export function useAI() {
    const [isReady, setIsReady] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(null);
    const [output, setOutput] = useState('');
    const [error, setError] = useState(null);

    // Speichert die Worker-Instanz
    const worker = useRef(null);

    useEffect(() => {
        // Initialisiert den Web Worker
        // Wir nutzen Vites '?worker' Syntax, damit es sauber gebundlet wird
        worker.current = new Worker(new URL('../workers/aiWorker.js', import.meta.url), {
            type: 'module'
        });

        const onMessageReceived = (e) => {
            const { status, data, output, error } = e.data;

            switch (status) {
                case 'progress':
                    // Wird aufgerufen während das Modell herunterlädt (beim 1. Start)
                    setProgress(data);
                    break;
                case 'ready':
                    // Modell ist geladen und bereit
                    setIsReady(true);
                    setProgress(null);
                    break;
                case 'processing':
                    // KI rechnet gerade
                    setIsProcessing(true);
                    setError(null);
                    break;
                case 'complete':
                    // KI ist fertig
                    setOutput(output);
                    setIsProcessing(false);
                    break;
                case 'error':
                    // Ein Fehler ist aufgetreten
                    setError(error);
                    setIsProcessing(false);
                    break;
                default:
                    break;
            }
        };

        worker.current.addEventListener('message', onMessageReceived);

        // Optional: Lade das Modell direkt beim Start der App im Hintergrund
        worker.current.postMessage({ type: 'load' });

        return () => {
            // Cleanup wenn die Component unmountet wird
            worker.current.removeEventListener('message', onMessageReceived);
            worker.current.terminate();
        };
    }, []);

    // Funktion um Text an die KI zu senden
    const generateText = useCallback((text, context) => {
        if (worker.current) {
            setOutput(''); // Reset output
            worker.current.postMessage({ type: 'generate', text, context });
        }
    }, []);

    return {
        isReady,
        isProcessing,
        progress,
        output,
        error,
        generateText
    };
}
