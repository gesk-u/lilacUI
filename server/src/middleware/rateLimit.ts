import { rateLimit } from 'express-rate-limit';

/* Protects the AI (your computer's time, or a free tier's quota) from one visitor hammering it */
export const generateLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many requests. Wait a minute and try again.' },
});
