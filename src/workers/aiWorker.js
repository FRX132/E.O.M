import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;
env.useBrowserCache = true;

class PipelineSingleton {
    static task = 'text-generation';
    static model = 'Xenova/TinyLlama-1.1B-Chat-v1.0';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

self.addEventListener('message', async (event) => {
    const { text, type, context } = event.data;

    if (type === 'load') {
        try {
            await PipelineSingleton.getInstance(x => {
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

            let generator = await PipelineSingleton.getInstance(x => {
                self.postMessage({ status: 'progress', data: x });
            });

            const systemContext = context ? `Here is the user's data: ${context}. Answer based on this data if relevant.` : "You answer concisely.";
            const prompt = `<|system|>\nYou are a helpful AI assistant running locally on the user's device. ${systemContext}</s>\n<|user|>\n${text}</s>\n<|assistant|>\n`;

            let output = await generator(prompt, {
                max_new_tokens: 150,
                temperature: 0.7,
                do_sample: true,
            });

            let generatedText = output[0].generated_text;
            if (generatedText.includes("<|assistant|>\n")) {
                generatedText = generatedText.split("<|assistant|>\n")[1].trim();
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
