import { useState, useEffect, useRef, useCallback } from 'react';
import AIWorker from '../workers/aiWorker.js?worker&inline';

export function useAI() {
    const [isReady, setIsReady] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(null);
    const [output, setOutput] = useState('');
    const [error, setError] = useState(null);
    const worker = useRef(null);


    useEffect(() => {
        worker.current = new AIWorker();

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
