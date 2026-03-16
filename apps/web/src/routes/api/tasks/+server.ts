import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { tasks } from '@hq/db/schema';
import { desc, eq, and, type SQL } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const conditions: SQL[] = [];

  const companyId = url.searchParams.get('companyId');
  if (companyId) conditions.push(eq(tasks.companyId, companyId));

  const status = url.searchParams.get('status');
  if (status) conditions.push(eq(tasks.status, status));

  const projectId = url.searchParams.get('projectId');
  if (projectId) conditions.push(eq(tasks.projectId, projectId));

  const assignee = url.searchParams.get('assignee');
  if (assignee) conditions.push(eq(tasks.assignee, assignee));

  const query = db.select().from(tasks).orderBy(desc(tasks.createdAt));
  const all = conditions.length > 0
    ? await query.where(and(...conditions))
    : await query;

  return json(all);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { companyId, projectId, title, description, priority, assignee, labels, metadata } = body;

  if (!companyId || typeof companyId !== 'string') {
    return json({ error: 'companyId is required' }, { status: 400 });
  }
  if (!title || typeof title !== 'string') {
    return json({ error: 'title is required' }, { status: 400 });
  }

  const [created] = await db
    .insert(tasks)
    .values({
      companyId,
      projectId: projectId || null,
      title,
      description: description || null,
      priority: priority || 'medium',
      assignee: assignee || null,
      labels: labels || [],
      metadata: metadata || null,
    })
    .returning();

  return json(created, { status: 201 });
};
