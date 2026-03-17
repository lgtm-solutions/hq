import { getDatabase } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  let status: 'connected' | 'not_configured' | 'error' = 'not_configured';
  let error: string | null = null;
  let url: string | null = null;

  try {
    const database = getDatabase();

    // Mask the connection URL for display (hide password)
    const rawUrl = (database as any).url as string;
    if (rawUrl) {
      try {
        const parsed = new URL(rawUrl);
        if (parsed.password) parsed.password = '***';
        url = parsed.toString();
      } catch {
        url = rawUrl.replace(/:([^@]+)@/, ':***@');
      }
    }

    const result = await database.testConnection();
    if (result.ok) {
      status = 'connected';
    } else {
      status = 'error';
      error = result.error;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('DATABASE_URL')) {
      status = 'not_configured';
      error = 'DATABASE_URL environment variable is not set';
    } else {
      status = 'error';
      error = msg;
    }
  }

  return { status, error, url };
};
