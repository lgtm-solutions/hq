import { db } from '$lib/server/db';
import { tasks } from '@hq/db/schema';
import { eq, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const companies = locals.config.companies;

  // Flatten agents with their company info
  const agents = companies.flatMap((c) =>
    c.agents.map((a) => ({
      ...a,
      companySlug: c.slug,
      companyName: c.name,
    }))
  );

  // Get open task counts per agent
  const taskCounts = await db
    .select({
      assignee: tasks.assignee,
      count: sql<number>`count(*)::int`,
    })
    .from(tasks)
    .where(eq(tasks.status, 'open'))
    .groupBy(tasks.assignee);

  const taskCountMap = Object.fromEntries(taskCounts.map((t) => [t.assignee, t.count]));

  return {
    agents: agents.map((a) => ({
      ...a,
      openTasks: taskCountMap[a.name] || 0,
    })),
  };
};
