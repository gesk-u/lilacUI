import { SYSTEM_PROMPT } from './prompt.js';
import { styleJsonSchema } from './styleSchema.js';
import { AI_TIMEOUT_MS, AiError, type StyleProvider } from './types.js';

/* Free and local: Ollama must be running with the model pulled (ollama pull <model>) */
export function createOllamaProvider(baseUrl: string, model: string): StyleProvider {
  return {
    name: 'ollama',
    model,
    async generate(prompt) {
      let response: Response;
      try {
        response = await fetch(new URL('/api/chat', baseUrl), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            stream: false,
            // Structured output: the reply is forced to match the schema
            format: styleJsonSchema,
            options: { temperature: 0.6 },
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: prompt },
            ],
          }),
          signal: AbortSignal.timeout(AI_TIMEOUT_MS),
        });
      } catch (error) {
        throw new AiError('The AI is not reachable. Is Ollama running?', { cause: error });
      }

      if (!response.ok) {
        const detail = await response.text();
        throw new AiError(
          response.status === 404 ? `The AI model "${model}" is not installed. Run: ollama pull ${model}` : 'The AI failed',
          { cause: new Error(`Ollama ${response.status}: ${detail}`) },
        );
      }

      const data = (await response.json()) as { message?: { content?: string } };
      try {
        return JSON.parse(data.message?.content ?? '');
      } catch (error) {
        throw new AiError('The AI replied with something that is not a style', { cause: error });
      }
    },
  };
}
