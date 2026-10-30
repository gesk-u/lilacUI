import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { AiError } from '../services/ai/index.js';

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'Not found' });
};

/* Every error leaves as { error: message }. Details are logged, never sent to visitors. */
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({ error: error.issues[0]?.message ?? 'Invalid request' });
    return;
  }
  if (error instanceof AiError) {
    console.error('[ai]', error.message, error.cause);
    res.status(502).json({ error: error.message });
    return;
  }
  // express.json() rejects bad or oversized bodies with a status of its own
  const status = typeof error?.status === 'number' && error.status < 500 ? error.status : 500;
  if (status === 500) console.error('[server]', error);
  res.status(status).json({ error: status === 500 ? 'Something went wrong on the server' : 'Invalid request' });
};
