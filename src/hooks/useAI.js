import { useState, useEffect, useRef, useCallback } from 'react';

export function useAI() {
    const [isReady, setIsReady] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(null);
    const [output, setOutput] = useState('');
    const [error, setError] = useState(null);
    const worker = useRef(null);


    useEffect(() => {
        worker.current = new Worker(new URL('../workers/aiWorker.js', import.meta.url), {
            type: 'module'
        });

        const onMessageReceived = (e) => {
            const { status, data, output, error } = e.data;

            switch (status) {
                case 'progress':
                    setProgress(data);
                    break;
                case 'ready':
                    setIsReady(true);
                    setProgress(null);
                    break;
                case 'processing':
                    setIsProcessing(true);
                    setError(null);
                    break;
                case 'complete':
                    setOutput(output);
                    setIsProcessing(false);
                    break;
                case 'error':
                    setError(error);
                    setIsProcessing(false);
                    break;
                default:
                    break;
            }
        };

        worker.current.addEventListener('message', onMessageReceived);
        worker.current.postMessage({ type: 'load' });

        return () => {
            worker.current.removeEventListener('message', onMessageReceived);
            worker.current.terminate();
        };
    }, []);

    const generateText = useCallback((text, context) => {
        if (worker.current) {
            setOutput('');
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
