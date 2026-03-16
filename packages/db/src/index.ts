import { resolve } from 'node:path';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema.js';

const MIGRATIONS_DIR = resolve(import.meta.dirname, '..', 'drizzle');

export async function createDb(url: string) {
  // Run migrations on startup
  const migrationClient = postgres(url, { max: 1 });
  await migrate(drizzle(migrationClient), { migrationsFolder: MIGRATIONS_DIR });
  await migrationClient.end();

  const client = postgres(url);
  return drizzle(client, { schema });
}

export type Db = Awaited<ReturnType<typeof createDb>>;

export * from './schema.js';
