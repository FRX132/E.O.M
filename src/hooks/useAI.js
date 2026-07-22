import { useState, useEffect, useRef, useCallback } from 'react';
import AIWorker from '../workers/aiWorker.js?worker&inline';
import { useStore } from '../store';

const DEFAULT_AI_SETTINGS = { provider: 'local', apiKey: '', model: 'gpt-4o-mini', endpoint: '' };

export function useAI() {
    const aiSettings = useStore(state => state.aiSettings) || DEFAULT_AI_SETTINGS;
    const [isReady, setIsReady] = useState(aiSettings.provider !== 'local');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(null);
    const [output, setOutput] = useState('');
    const [error, setError] = useState(null);
    const worker = useRef(null);

    useEffect(() => {
        if (aiSettings.provider !== 'local') {
            setIsReady(true);
            setProgress(null);
            return;
        }

        setIsReady(false);
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
            if (worker.current) {
                worker.current.removeEventListener('message', onMessageReceived);
                worker.current.terminate();
                worker.current = null;
            }
        };
    }, [aiSettings.provider]);

    const generateText = useCallback(async (text, context) => {
        setOutput('');
        setError(null);

        if (aiSettings.provider === 'local') {
            if (worker.current) {
                worker.current.postMessage({ type: 'generate', text, context });
            } else {
                setError('Local AI worker is not initialized.');
            }
            return;
        }

        setIsProcessing(true);

        try {
            let res;
            let responseText = '';

            const { provider, apiKey, model, endpoint } = aiSettings;

            if (provider === 'openai') {
                res = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: model || 'gpt-4o-mini',
                        messages: [
                            { role: 'system', content: context },
                            { role: 'user', content: text }
                        ],
                        temperature: 0.7
                    })
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error?.message || `OpenAI request failed: ${res.statusText}`);
                }

                const data = await res.json();
                responseText = data.choices?.[0]?.message?.content || '';
            } 
            
            else if (provider === 'anthropic') {
                res = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
                        'anthropic-dangerous-direct-browser-access': 'true'
                    },
                    body: JSON.stringify({
                        model: model || 'claude-3-5-sonnet-20241022',
                        system: context,
                        messages: [
                            { role: 'user', content: text }
                        ],
                        max_tokens: 1024,
                        temperature: 0.7
                    })
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error?.message || `Anthropic request failed: ${res.statusText}`);
                }

                const data = await res.json();
                responseText = data.content?.[0]?.text || '';
            } 
            
            else if (provider === 'ollama') {
                const cleanEndpoint = (endpoint || 'http://localhost:11434').replace(/\/$/, '');
                res = await fetch(`${cleanEndpoint}/api/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: model || 'llama3',
                        messages: [
                            { role: 'system', content: context },
                            { role: 'user', content: text }
                        ],
                        stream: false,
                        options: {
                            temperature: 0.7
                        }
                    })
                });

                if (!res.ok) {
                    throw new Error(`Ollama request failed: ${res.statusText}`);
                }

                const data = await res.json();
                responseText = data.message?.content || '';
            } 
            
            else if (provider === 'lmstudio') {
                const cleanEndpoint = (endpoint || 'http://localhost:1234').replace(/\/$/, '');
                res = await fetch(`${cleanEndpoint}/v1/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
                    },
                    body: JSON.stringify({
                        model: model || 'local-model',
                        messages: [
                            { role: 'system', content: context },
                            { role: 'user', content: text }
                        ],
                        temperature: 0.7
                    })
                });

                if (!res.ok) {
                    throw new Error(`LM Studio request failed: ${res.statusText}`);
                }

                const data = await res.json();
                responseText = data.choices?.[0]?.message?.content || '';
            } 
            
            else {
                throw new Error(`Unsupported provider: ${provider}`);
            }

            setOutput(responseText);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsProcessing(false);
        }
    }, [aiSettings]);

    return {
        isReady,
        isProcessing,
        progress,
        output,
        error,
        generateText
    };
}
