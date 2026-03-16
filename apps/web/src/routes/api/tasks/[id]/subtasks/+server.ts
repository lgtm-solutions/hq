import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { subtasks, tasks } from '@hq/db/schema';
import { eq, asc } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  const all = await db
    .select()
    .from(subtasks)
    .where(eq(subtasks.taskId, params.id))
    .orderBy(asc(subtasks.sortOrder));

  return json(all);
};

export const POST: RequestHandler = async ({ params, request }) => {
  const [task] = await db.select().from(tasks).where(eq(tasks.id, params.id));
  if (!task) return json({ error: 'task not found' }, { status: 404 });

  const body = await request.json();
  const { title, description, assignee, sortOrder } = body;

  if (!title || typeof title !== 'string') {
    return json({ error: 'title is required' }, { status: 400 });
  }

  const [created] = await db
    .insert(subtasks)
    .values({
      taskId: params.id,
      title,
      description: description || null,
      assignee: assignee || null,
      sortOrder: sortOrder ?? 0,
    })
    .returning();

  return json(created, { status: 201 });
};
