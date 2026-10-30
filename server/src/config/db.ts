import mongoose from 'mongoose';

/*
 * The database is optional: without it the API still makes styles, it just can't
 * cache repeated prompts or list recent ones. Handy while MongoDB isn't set up yet.
 */
export async function connectDb(uri: string) {
  if (!uri) {
    console.warn('[db] MONGODB_URI is empty: running without a database');
    return;
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('[db] connected');
  } catch (error) {
    console.error('[db] could not connect, running without a database:', (error as Error).message);
  }
}

export function isDbReady() {
  return mongoose.connection.readyState === mongoose.ConnectionStates.connected;
}
