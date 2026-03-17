import { db } from '$lib/server/db';
import { json } from '@sveltejs/kit';
import { projects } from '@hq/db/schema';
import { desc } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const all = await db.select().from(projects).orderBy(desc(projects.createdAt));
  return json(all);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { name, git, description, metadata } = body;

  if (!name || typeof name !== 'string') {
    return json({ error: 'name is required' }, { status: 400 });
  }

  const [created] = await db
    .insert(projects)
    .values({ name, git: git || null, description: description || null, metadata: metadata || null })
    .returning();

  return json(created, { status: 201 });
};
