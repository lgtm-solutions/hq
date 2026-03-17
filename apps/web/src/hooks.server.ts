import type { Handle } from '@sveltejs/kit';
import { getConfig } from '$lib/server/config';
import { getDatabase } from '$lib/server/db';

export const handle: Handle = async ({ event, resolve }) => {
  try {
    await getDatabase().connect();
  } catch {
    // DB unavailable — pages that need it will handle the error themselves
  }
  event.locals.config = await getConfig();
  return resolve(event);
};
