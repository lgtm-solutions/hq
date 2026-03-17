import { db } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import { projects, projectChannels } from '@hq/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

/** Lookup: given a channel ID, return the linked project (if any). */
export const GET: RequestHandler = async ({ params }) => {
  const results = await db
    .select({ project: projects })
    .from(projectChannels)
    .innerJoin(projects, eq(projects.id, projectChannels.projectId))
    .where(eq(projectChannels.channelId, params.channelId));

  if (results.length === 0) {
    return json({ project: null });
  }

  return json({ project: results[0].project });
};
