import { db } from '$lib/server/db';
import { projects, projectChannels } from '@hq/db/schema';
import { eq } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const [project] = await db.select().from(projects).where(eq(projects.id, params.id));
  if (!project) error(404, 'Project not found');

  const channels = await db
    .select()
    .from(projectChannels)
    .where(eq(projectChannels.projectId, params.id));

  return { project, channels };
};

export const actions: Actions = {
  addChannel: async ({ request, params }) => {
    const form = await request.formData();
    const channelId = form.get('channel_id')?.toString()?.trim();
    if (!channelId) return fail(400, { error: 'Channel ID is required' });

    await db.insert(projectChannels).values({ projectId: params.id, channelId }).onConflictDoNothing();
    return { success: true };
  },

  removeChannel: async ({ request }) => {
    const form = await request.formData();
    const id = form.get('id')?.toString();
    if (!id) return fail(400, { error: 'ID is required' });

    await db.delete(projectChannels).where(eq(projectChannels.id, id));
    return { success: true };
  },
};
