import { db } from '$lib/server/db';
import { projects } from '@hq/db/schema';
import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const form = await request.formData();
    const name = form.get('name')?.toString()?.trim();
    const git = form.get('git')?.toString()?.trim() || null;
    const description = form.get('description')?.toString()?.trim() || null;

    if (!name) return fail(400, { error: 'Name is required' });

    const [created] = await db.insert(projects).values({ name, git, description }).returning();
    redirect(303, `/projects/${created.id}`);
  },
};
