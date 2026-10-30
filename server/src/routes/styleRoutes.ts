import { Router } from 'express';
import { createStyle, listStyles } from '../controllers/styleController.js';
import { generateLimiter } from '../middleware/rateLimit.js';

export const styleRoutes = Router();

// Only generating costs AI time, so only that is rate limited
styleRoutes.post('/', generateLimiter, createStyle);
styleRoutes.get('/', listStyles);
