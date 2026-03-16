import { db } from '$lib/server/db';
import { tasks, subtasks, comments } from '@hq/db/schema';
import { eq, asc } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  const [task] = await db.select().from(tasks).where(eq(tasks.id, params.id));
  if (!task) error(404, 'Task not found');

  const taskSubtasks = await db
    .select()
    .from(subtasks)
    .where(eq(subtasks.taskId, params.id))
    .orderBy(asc(subtasks.sortOrder));

  const taskComments = await db
    .select()
    .from(comments)
    .where(eq(comments.taskId, params.id))
    .orderBy(asc(comments.createdAt));

  const company = locals.config.companies.find((c) => c.slug === task.companyId);

  return { task, subtasks: taskSubtasks, comments: taskComments, company };
};

export const actions: Actions = {
  addComment: async ({ request, params }) => {
    const form = await request.formData();
    const author = form.get('author')?.toString()?.trim() || 'Anonymous';
    const body = form.get('body')?.toString()?.trim();
    if (!body) return fail(400, { error: 'Comment body is required' });

    await db.insert(comments).values({ taskId: params.id, author, body });
    return { success: true };
  },

  addSubtask: async ({ request, params }) => {
    const form = await request.formData();
    const title = form.get('title')?.toString()?.trim();
    if (!title) return fail(400, { error: 'Subtask title is required' });

    const existing = await db
      .select()
      .from(subtasks)
      .where(eq(subtasks.taskId, params.id));
    const sortOrder = existing.length;

    await db.insert(subtasks).values({ taskId: params.id, title, sortOrder });
    return { success: true };
  },

  toggleSubtask: async ({ request }) => {
    const form = await request.formData();
    const subtaskId = form.get('subtask_id')?.toString();
    if (!subtaskId) return fail(400, { error: 'Subtask ID is required' });

    const [subtask] = await db.select().from(subtasks).where(eq(subtasks.id, subtaskId));
    if (!subtask) return fail(404, { error: 'Subtask not found' });

    const newStatus = subtask.status === 'done' ? 'todo' : 'done';
    await db
      .update(subtasks)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(subtasks.id, subtaskId));
    return { success: true };
  },

  updateStatus: async ({ request, params }) => {
    const form = await request.formData();
    const status = form.get('status')?.toString()?.trim();
    if (!status) return fail(400, { error: 'Status is required' });

    await db
      .update(tasks)
      .set({ status, updatedAt: new Date() })
      .where(eq(tasks.id, params.id));
    return { success: true };
  },
};
