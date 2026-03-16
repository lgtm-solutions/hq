import { db } from '$lib/server/db';
import { tasks } from '@hq/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  const company = locals.config.companies.find((c) => c.slug === params.slug);
  if (!company) error(404, 'Company not found');

  const agent = company.agents.find((a) => a.name === params.name);
  if (!agent) error(404, 'Agent not found');

  const assignedTasks = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.companyId, company.slug), eq(tasks.assignee, agent.name)))
    .orderBy(desc(tasks.createdAt));

  return { company, agent, assignedTasks };
};
