import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { projectChannels } from '@hq/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  const channels = await db
    .select()
    .from(projectChannels)
    .where(eq(projectChannels.projectId, params.id));
  return json(channels);
};

export const POST: RequestHandler = async ({ params, request }) => {
  const body = await request.json();
  const { channelId } = body;

  if (!channelId || typeof channelId !== 'string') {
    return json({ error: 'channelId is required' }, { status: 400 });
  }

  const [created] = await db
    .insert(projectChannels)
    .values({ projectId: params.id, channelId })
    .onConflictDoNothing()
    .returning();

  return json(created || { projectId: params.id, channelId }, { status: 201 });
};
