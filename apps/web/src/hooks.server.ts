import type { Handle } from '@sveltejs/kit';
import { getConfig } from '$lib/server/config';
import { getDb } from '$lib/server/db';

export const handle: Handle = async ({ event, resolve }) => {
  await getDb();
  event.locals.config = await getConfig();
  return resolve(event);
};
