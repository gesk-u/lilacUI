import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import { provider } from './services/ai/index.js';

await connectDb(env.MONGODB_URI);

createApp().listen(env.PORT, () => {
  console.log(`[server] http://localhost:${env.PORT}  (AI: ${provider.name} / ${provider.model})`);
});
