import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { isDbReady } from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { styleRoutes } from './routes/styleRoutes.js';
import { provider } from './services/ai/index.js';

/* The React build, served by this same server: one address for site and API */
const clientDist = fileURLToPath(new URL('../../dist', import.meta.url));

export function createApp() {
  const app = express();

  // Behind a tunnel or proxy, trust it so rate limits see the visitor's IP, not the proxy's
  if (env.TRUST_PROXY) app.set('trust proxy', env.TRUST_PROXY);

  // CSP is off for now: index.html has an inline theme script that a default CSP would block
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(express.json({ limit: '10kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, db: isDbReady(), ai: { provider: provider.name, model: provider.model } });
  });
  app.use('/api/styles', styleRoutes);
  app.use('/api', notFound);

  // Serves whatever `npm run build` last produced; in development Vite serves the site instead
  if (existsSync(clientDist)) {
    app.use(express.static(clientDist));
    // Client-side routes like /customizer: let React Router handle them
    app.get('/{*path}', (_req, res) => {
      res.sendFile('index.html', { root: clientDist });
    });
  }

  app.use(errorHandler);
  return app;
}
