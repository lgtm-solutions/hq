import { db } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import { subtasks, comments } from '@hq/db/schema';
import { eq, asc } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  const [subtask] = await db.select().from(subtasks).where(eq(subtasks.id, params.id));
  if (!subtask) return json({ error: 'not found' }, { status: 404 });

  const subtaskComments = await db.select().from(comments).where(eq(comments.subtaskId, params.id)).orderBy(asc(comments.createdAt));

  return json({ ...subtask, comments: subtaskComments });
};

export const PATCH: RequestHandler = async ({ params, request }) => {
  const body = await request.json();
  const { title, description, status, assignee, sortOrder } = body;

  const [updated] = await db
    .update(subtasks)
    .set({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(assignee !== undefined && { assignee }),
      ...(sortOrder !== undefined && { sortOrder }),
      updatedAt: new Date(),
    })
    .where(eq(subtasks.id, params.id))
    .returning();

  if (!updated) return json({ error: 'not found' }, { status: 404 });
  return json(updated);
};

export const DELETE: RequestHandler = async ({ params }) => {
  const [deleted] = await db.delete(subtasks).where(eq(subtasks.id, params.id)).returning();
  if (!deleted) return json({ error: 'not found' }, { status: 404 });
  return json({ ok: true });
};
