import { db } from '$lib/server/db';
import { tasks } from '@hq/db/schema';
import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  return {
    companies: locals.config.companies,
  };
};

export const actions: Actions = {
  default: async ({ request }) => {
    const form = await request.formData();
    const companyId = form.get('company_id')?.toString()?.trim();
    const projectId = form.get('project_id')?.toString()?.trim() || null;
    const title = form.get('title')?.toString()?.trim();
    const description = form.get('description')?.toString()?.trim() || null;
    const priority = form.get('priority')?.toString()?.trim() || 'medium';
    const assignee = form.get('assignee')?.toString()?.trim() || null;

    if (!companyId) return fail(400, { error: 'Company is required' });
    if (!title) return fail(400, { error: 'Title is required' });

    const [created] = await db
      .insert(tasks)
      .values({
        companyId,
        projectId: projectId || null,
        title,
        description,
        priority,
        assignee,
      })
      .returning();

    redirect(303, `/tasks/${created.id}`);
  },
};
