import { db } from '$lib/server/db';
import { tasks } from '@hq/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
  const companyId = url.searchParams.get('company') || undefined;
  const status = url.searchParams.get('status') || undefined;

  const conditions = [];
  if (companyId) conditions.push(eq(tasks.companyId, companyId));
  if (status) conditions.push(eq(tasks.status, status));

  const allTasks = await db
    .select()
    .from(tasks)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(tasks.createdAt));

  return {
    tasks: allTasks,
    companies: locals.config.companies,
    filters: { company: companyId, status },
  };
};
