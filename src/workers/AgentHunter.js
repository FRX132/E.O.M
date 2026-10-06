// src/workers/AgentHunter.js
// Agent Hunter (A.H.) Autonomous Local Background Intelligence Engine
import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;
env.useBrowserCache = true;

class AgentHunterSingleton {
    static task = 'text-generation';
    static model = 'Xenova/LaMini-GPT-124M'; // Ultra-lightweight local intelligence model
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

// Event listener for Agent Hunter worker commands
self.addEventListener('message', async (event) => {
    const { text, type, context } = event.data;

    if (type === 'load') {
        try {
            await AgentHunterSingleton.getInstance(x => {
                self.postMessage({ status: 'progress', data: x });
            });
            self.postMessage({ status: 'ready' });
        } catch (error) {
            self.postMessage({ status: 'error', error: error.message });
        }
        return;
    }

    if (type === 'generate') {
        try {
            self.postMessage({ status: 'processing' });

            let generator = await AgentHunterSingleton.getInstance(x => {
                self.postMessage({ status: 'progress', data: x });
            });

            const systemContext = context ? `Context: ${context}\n\n` : "";
            const prompt = `Below is an instruction that describes a task. Write a response that appropriately completes the request.\n\n### Instruction:\n${systemContext}${text}\n\n### Response:\n`;

            let output = await generator(prompt, {
                max_new_tokens: 180,
                temperature: 0.7,
                do_sample: true,
            });

            let generatedText = output[0].generated_text;

            // Robustly extract only the generated response
            if (generatedText.startsWith(prompt)) {
                generatedText = generatedText.substring(prompt.length).trim();
            } else {
                const splitMarkers = ["### Response:\n", "### Response:", "Response:\n", "Response:"];
                for (const marker of splitMarkers) {
                    if (generatedText.includes(marker)) {
                        const parts = generatedText.split(marker);
                        generatedText = parts[parts.length - 1].trim();
                        break;
                    }
                }
            }

            self.postMessage({
                status: 'complete',
                output: generatedText,
            });
        } catch (error) {
            self.postMessage({ status: 'error', error: error.message });
        }
    }
});
