import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { comments, subtasks } from '@hq/db/schema';
import { eq, asc } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  const all = await db
    .select()
    .from(comments)
    .where(eq(comments.subtaskId, params.id))
    .orderBy(asc(comments.createdAt));

  return json(all);
};

export const POST: RequestHandler = async ({ params, request }) => {
  const [subtask] = await db.select().from(subtasks).where(eq(subtasks.id, params.id));
  if (!subtask) return json({ error: 'subtask not found' }, { status: 404 });

  const body = await request.json();
  const { author, body: commentBody, metadata } = body;

  if (!author || typeof author !== 'string') {
    return json({ error: 'author is required' }, { status: 400 });
  }
  if (!commentBody || typeof commentBody !== 'string') {
    return json({ error: 'body is required' }, { status: 400 });
  }

  const [created] = await db
    .insert(comments)
    .values({
      subtaskId: params.id,
      author,
      body: commentBody,
      metadata: metadata || null,
    })
    .returning();

  return json(created, { status: 201 });
};
