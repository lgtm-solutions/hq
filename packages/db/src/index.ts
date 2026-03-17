import { resolve } from 'node:path';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as schema from './schema.js';

const MIGRATIONS_DIR = resolve(import.meta.dirname, '..', 'drizzle');

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

export class Database {
  private client: ReturnType<typeof postgres> | null = null;
  private drizzleInstance: DrizzleDb | null = null;
  private migrated = false;
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  /**
   * Run database migrations. Only runs once per instance.
   */
  async migrate(): Promise<void> {
    if (this.migrated) return;
    const migrationClient = postgres(this.url, { max: 1, onnotice: () => {} });
    await migrate(drizzle(migrationClient), { migrationsFolder: MIGRATIONS_DIR });
    await migrationClient.end();
    this.migrated = true;
  }

  /**
   * Connect to the database.
   * Runs migrations on first connect. Reconnects if the connection is dead.
   */
  async connect(): Promise<void> {
    // If already connected, verify the connection is alive
    if (this.drizzleInstance) {
      try {
        await this.drizzleInstance.execute(sql`SELECT 1`);
        return;
      } catch {
        await this.cleanup();
      }
    }

    await this.migrate();

    this.client = postgres(this.url);
    this.drizzleInstance = drizzle(this.client, { schema });
  }

  /**
   * Test the database connection with a simple query.
   * Returns { ok: true } if healthy, or { ok: false, error } with the reason.
   */
  async testConnection(): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
      if (!this.drizzleInstance) await this.connect();
      await this.drizzleInstance!.execute(sql`SELECT 1`);
      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, error: message };
    }
  }

  /**
   * Close the database connection pool.
   */
  async disconnect(): Promise<void> {
    await this.cleanup();
  }

  /**
   * Reconnect — close existing connection and establish a new one.
   */
  async reconnect(): Promise<void> {
    await this.cleanup();
    await this.connect();
  }

  /**
   * Get the Drizzle ORM instance for queries.
   * Throws if not connected — call connect() first.
   */
  get db(): DrizzleDb {
    if (!this.drizzleInstance) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.drizzleInstance;
  }

  private async cleanup(): Promise<void> {
    if (this.client) {
      try {
        await this.client.end({ timeout: 3 });
      } catch {
        // Connection may already be dead
      }
      this.client = null;
      this.drizzleInstance = null;
    }
  }
}

export type Db = DrizzleDb;

export * from './schema.js';
