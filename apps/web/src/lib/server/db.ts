import { createDb, type Db } from '@hq/db';
import { env } from '$env/dynamic/private';

let _db: Db;
let _dbPromise: Promise<Db> | null = null;

export async function getDb(): Promise<Db> {
  if (_db) return _db;
  if (!_dbPromise) {
    if (!env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }
    _dbPromise = createDb(env.DATABASE_URL);
    _db = await _dbPromise;
  }
  return _dbPromise;
}

// Backward-compatible sync proxy — only works after first getDb() resolves
export const db = new Proxy({} as Db, {
  get(_, prop) {
    if (!_db) throw new Error('Database not initialized yet. Use getDb() first.');
    return (_db as any)[prop];
  },
});
