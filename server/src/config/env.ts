import { z } from 'zod';

/* Checked once at startup, so a missing key fails loudly here, not mid-request */
const envSchema = z
  .object({
    PORT: z.coerce.number().int().positive().default(3001),
    MONGODB_URI: z.string().trim().default(''),
    AI_PROVIDER: z.enum(['ollama', 'gemini', 'claude']).default('ollama'),
    OLLAMA_URL: z.url().default('http://localhost:11434'),
    OLLAMA_MODEL: z.string().min(1).default('qwen2.5:3b'),
    GEMINI_API_KEY: z.string().trim().default(''),
    GEMINI_MODEL: z.string().min(1).default('gemini-2.5-flash'),
    ANTHROPIC_API_KEY: z.string().trim().default(''),
    ANTHROPIC_MODEL: z.string().min(1).default('claude-opus-5-5'),
    TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  })
  .refine((env) => env.AI_PROVIDER !== 'gemini' || env.GEMINI_API_KEY, {
    message: 'GEMINI_API_KEY is required when AI_PROVIDER=gemini',
    path: ['GEMINI_API_KEY'],
  });

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid server/.env:\n' + z.prettifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
