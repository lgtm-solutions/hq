import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { projects, projectChannels } from '@hq/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  const [project] = await db.select().from(projects).where(eq(projects.id, params.id));
  if (!project) return json({ error: 'not found' }, { status: 404 });

  const channels = await db
    .select()
    .from(projectChannels)
    .where(eq(projectChannels.projectId, params.id));

  return json({ ...project, channels });
};

export const PATCH: RequestHandler = async ({ params, request }) => {
  const body = await request.json();
  const { name, git, description, metadata } = body;

  const [updated] = await db
    .update(projects)
    .set({
      ...(name !== undefined && { name }),
      ...(git !== undefined && { git }),
      ...(description !== undefined && { description }),
      ...(metadata !== undefined && { metadata }),
      updatedAt: new Date(),
    })
    .where(eq(projects.id, params.id))
    .returning();

  if (!updated) return json({ error: 'not found' }, { status: 404 });
  return json(updated);
};

export const DELETE: RequestHandler = async ({ params }) => {
  const [deleted] = await db.delete(projects).where(eq(projects.id, params.id)).returning();
  if (!deleted) return json({ error: 'not found' }, { status: 404 });
  return json({ ok: true });
};
