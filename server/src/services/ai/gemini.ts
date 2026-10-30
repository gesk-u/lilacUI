import { SYSTEM_PROMPT } from './prompt.js';
import { COMPONENTS, FONTS } from './styleSchema.js';
import { AI_TIMEOUT_MS, AiError, type StyleProvider } from './types.js';

const COLOR_ROLES = ['primary', 'background', 'surface', 'text', 'muted', 'border'] as const;

/*
 * Gemini's responseSchema (an OpenAPI-style subset) forces the reply into this shape.
 * Mirrors styleSchema; parseStyle still validates the result.
 */
const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    component: { type: 'STRING', enum: [...COMPONENTS] },
    label: { type: 'STRING' },
    font: { type: 'STRING', enum: [...FONTS] },
    colors: {
      type: 'OBJECT',
      properties: Object.fromEntries(COLOR_ROLES.map((role) => [role, { type: 'STRING' }])),
      required: [...COLOR_ROLES],
    },
    borderRadius: { type: 'STRING' },
  },
  required: ['component', 'label', 'font', 'colors', 'borderRadius'],
  propertyOrdering: ['component', 'label', 'font', 'colors', 'borderRadius'],
};

/* Turn Google's error into a message that's safe and useful to show */
function describeFailure(status: number, detail: string, model: string) {
  if (status === 401 || status === 403 || /API key not valid|API_KEY_INVALID/i.test(detail)) {
    return 'The AI key is missing or invalid';
  }
  if (status === 404) return `The AI model "${model}" was not found. Check GEMINI_MODEL in server/.env.`;
  if (status === 429) return 'The AI is busy (free limit reached). Try again later.';
  return 'The AI failed';
}

/* Hosted free tier. The key stays on the server and is sent as a header, never in a URL. */
export function createGeminiProvider(apiKey: string, model: string): StyleProvider {
  return {
    name: 'gemini',
    model,
    async generate(prompt) {
      let response: Response;
      try {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: RESPONSE_SCHEMA,
                temperature: 0.6,
              },
            }),
            signal: AbortSignal.timeout(AI_TIMEOUT_MS),
          },
        );
      } catch (error) {
        throw new AiError('The AI is not reachable right now', { cause: error });
      }

      if (!response.ok) {
        const detail = await response.text();
        throw new AiError(describeFailure(response.status, detail, model), {
          cause: new Error(`Gemini ${response.status}: ${detail}`),
        });
      }

      const data = (await response.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
        promptFeedback?: { blockReason?: string };
      };
      // Safety filters block a prompt or a reply without an HTTP error
      const blocked = data.promptFeedback?.blockReason ?? (data.candidates?.[0]?.finishReason === 'SAFETY' && 'SAFETY');
      if (blocked) {
        throw new AiError('The AI declined this request. Try describing it differently.', {
          cause: new Error(`Gemini blocked: ${blocked}`),
        });
      }
      try {
        return JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text ?? '');
      } catch (error) {
        throw new AiError('The AI replied with something that is not a style', { cause: error });
      }
    },
  };
}
