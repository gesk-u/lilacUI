import { ZodError } from 'zod';
import { env } from '../../config/env.js';
import { createClaudeProvider } from './claude.js';
import { describeFailures, findContrastFailures } from './contrast.js';
import { createGeminiProvider } from './gemini.js';
import { createOllamaProvider } from './ollama.js';
import { parseStyle, type Style } from './styleSchema.js';
import { AiError, type StyleProvider } from './types.js';

/* Switching AI is a .env change; nothing else in the app knows which one is used */
function createProvider(): StyleProvider {
  switch (env.AI_PROVIDER) {
    case 'claude':
      return createClaudeProvider(env.ANTHROPIC_API_KEY, env.ANTHROPIC_MODEL);
    case 'gemini':
      return createGeminiProvider(env.GEMINI_API_KEY, env.GEMINI_MODEL);
    case 'ollama':
      return createOllamaProvider(env.OLLAMA_URL, env.OLLAMA_MODEL);
  }
}

export const provider = createProvider();

async function ask(prompt: string): Promise<Style> {
  const raw = await provider.generate(prompt);
  try {
    return parseStyle(raw);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new AiError('The AI replied with something that is not a style', { cause: error });
    }
    throw error;
  }
}

/*
 * Asks once, measures contrast, and if any pair fails WCAG AA asks once more with the
 * failing pairs spelled out. One retry at most, to spare the quota; whatever still fails
 * is fixed by the client and shown to the user.
 */
export async function generateStyle(prompt: string): Promise<Style> {
  const first = await ask(prompt);
  const failures = findContrastFailures(first);
  if (failures.length === 0) return first;

  console.info(`[ai] ${failures.length} contrast failures, asking again`);
  const retryPrompt = `${prompt}

Your previous answer was:
${JSON.stringify(first)}

These colour pairs fail WCAG 2.2 AA contrast:
${describeFailures(failures)}

Return the full style again. Keep the same component, label, font, shape and mood, but change the colours so every pair passes.`;

  try {
    const second = await ask(retryPrompt);
    // Keep whichever attempt fails fewer pairs
    return findContrastFailures(second).length < failures.length ? second : first;
  } catch (error) {
    console.warn('[ai] retry for contrast failed, keeping the first answer:', (error as Error).message);
    return first;
  }
}

export { AiError };
