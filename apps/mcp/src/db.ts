import { Database, type Db } from '@hq/db';

const DATABASE_URL = process.env.DATABASE_URL;

let _database: Database | null = null;

export function getDatabase(): Database {
  if (!_database) {
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }
    _database = new Database(DATABASE_URL);
  }
  return _database;
}

/**
 * Lazy proxy to the Drizzle ORM instance.
 * Only works after getDatabase().connect() has been called (done in main()).
 */
export const db = new Proxy({} as Db, {
  get(_, prop) {
    return (getDatabase().db as any)[prop];
  },
});
