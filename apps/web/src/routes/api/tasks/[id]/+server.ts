import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { tasks, subtasks, comments } from '@hq/db/schema';
import { eq, asc } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  const [task] = await db.select().from(tasks).where(eq(tasks.id, params.id));
  if (!task) return json({ error: 'not found' }, { status: 404 });

  const taskSubtasks = await db.select().from(subtasks).where(eq(subtasks.taskId, params.id)).orderBy(asc(subtasks.sortOrder));
  const taskComments = await db.select().from(comments).where(eq(comments.taskId, params.id)).orderBy(asc(comments.createdAt));

  return json({ ...task, subtasks: taskSubtasks, comments: taskComments });
};

export const PATCH: RequestHandler = async ({ params, request }) => {
  const body = await request.json();
  const { title, description, status, priority, assignee, labels, metadata } = body;

  const [updated] = await db
    .update(tasks)
    .set({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(priority !== undefined && { priority }),
      ...(assignee !== undefined && { assignee }),
      ...(labels !== undefined && { labels }),
      ...(metadata !== undefined && { metadata }),
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, params.id))
    .returning();

  if (!updated) return json({ error: 'not found' }, { status: 404 });
  return json(updated);
};

export const DELETE: RequestHandler = async ({ params }) => {
  const [deleted] = await db.delete(tasks).where(eq(tasks.id, params.id)).returning();
  if (!deleted) return json({ error: 'not found' }, { status: 404 });
  return json({ ok: true });
};
