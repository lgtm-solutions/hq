import { db } from '$lib/server/db';
import { tasks } from '@hq/db/schema';
import { eq, desc } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  const company = locals.config.companies.find((c) => c.slug === params.slug);
  if (!company) error(404, 'Company not found');

  const recentTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.companyId, company.slug))
    .orderBy(desc(tasks.createdAt))
    .limit(10);

  return { company, recentTasks };
};
