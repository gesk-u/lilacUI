/* Anything that can turn a prompt into raw style JSON. The service validates the result. */
export type StyleProvider = {
  name: string;
  model: string;
  generate(prompt: string): Promise<unknown>;
};

/* The AI was unreachable or replied with something unusable. Safe to show its message. */
export class AiError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'AiError';
  }
}

/* Long enough for a slow local model, short enough not to hang a request forever */
export const AI_TIMEOUT_MS = 60_000;
