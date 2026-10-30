import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { SYSTEM_PROMPT } from './prompt.js';
import { styleSchema } from './styleSchema.js';
import { AI_TIMEOUT_MS, AiError, type StyleProvider } from './types.js';

/*
 * Claude via the official SDK. Structured outputs constrain the reply to styleSchema,
 * so the JSON shape is guaranteed rather than hoped for. The key stays on the server.
 */
export function createClaudeProvider(apiKey: string, model: string): StyleProvider {
  // Without an explicit key the SDK falls back to ANTHROPIC_API_KEY or an `ant auth login` profile
  const client = new Anthropic({ ...(apiKey && { apiKey }), timeout: AI_TIMEOUT_MS, maxRetries: 1 });

  return {
    name: 'claude',
    model,
    async generate(prompt) {
      let response;
      try {
        response = await client.beta.messages.parse({
          model,
          max_tokens: 16000,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: prompt }],
          output_config: {
            // A small styling task: low effort keeps it fast and cheap
            effort: 'low',
            format: betaZodOutputFormat(styleSchema),
          },
          // If a request is declined, the API retries it on a suitable fallback model itself
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
        });
      } catch (error) {
        if (error instanceof Anthropic.AuthenticationError) {
          throw new AiError('The AI key is missing or invalid', { cause: error });
        }
        if (error instanceof Anthropic.RateLimitError) {
          throw new AiError('The AI is busy right now. Try again in a minute.', { cause: error });
        }
        if (error instanceof Anthropic.APIConnectionError) {
          throw new AiError('The AI is not reachable right now', { cause: error });
        }
        if (error instanceof Anthropic.APIError) {
          throw new AiError('The AI failed', { cause: error });
        }
        throw error;
      }

      if (response.stop_reason === 'refusal') {
        throw new AiError('The AI declined this request. Try describing it differently.', {
          cause: new Error(`refusal: ${response.stop_details?.category ?? 'unknown'}`),
        });
      }
      if (!response.parsed_output) {
        throw new AiError('The AI replied with something that is not a style', {
          cause: new Error(`stop_reason: ${response.stop_reason}`),
        });
      }
      return response.parsed_output;
    },
  };
}
