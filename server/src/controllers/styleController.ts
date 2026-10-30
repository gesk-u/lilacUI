import type { Request, Response } from 'express';
import { z } from 'zod';
import { isDbReady } from '../config/db.js';
import { StyleModel, toPromptKey } from '../models/Style.js';
import { generateStyle, provider } from '../services/ai/index.js';

const createBody = z.object({
  prompt: z.string().trim().min(1, 'Describe what you want').max(300, 'Keep it under 300 characters'),
});

const listQuery = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

/* POST /api/styles  { prompt } -> { style, cached } */
export async function createStyle(req: Request, res: Response) {
  const { prompt } = createBody.parse(req.body);
  const promptKey = toPromptKey(prompt);

  if (isDbReady()) {
    const existing = await StyleModel.findOneAndUpdate({ promptKey }, { $inc: { hits: 1 } }, { new: true }).lean();
    if (existing) {
      res.json({ style: existing.style, cached: true });
      return;
    }
  }

  const style = await generateStyle(prompt);

  if (isDbReady()) {
    // Two people asking at once can race to insert; the loser just skips saving
    await StyleModel.create({ promptKey, prompt, style, provider: provider.name, model: provider.model }).catch(
      (error: { code?: number }) => {
        if (error.code !== 11000) throw error;
      },
    );
  }

  res.status(201).json({ style, cached: false });
}

/* GET /api/styles?limit=12 -> { styles: [{ prompt, style, createdAt }] } */
export async function listStyles(req: Request, res: Response) {
  const { limit } = listQuery.parse(req.query);
  if (!isDbReady()) {
    res.json({ styles: [] });
    return;
  }
  const styles = await StyleModel.find({}, { _id: 0, prompt: 1, style: 1, createdAt: 1 })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  res.json({ styles });
}
