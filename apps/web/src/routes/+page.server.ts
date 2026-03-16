import { db } from '$lib/server/db';
import { tasks } from '@hq/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const openTasks = await db.select().from(tasks).where(eq(tasks.status, 'open'));
  const { companies } = locals.config;

  const projectCount = companies.reduce((sum, c) => sum + c.projects.length, 0);
  const agentCount = companies.reduce((sum, c) => sum + c.agents.length, 0);

  return {
    stats: {
      projects: projectCount,
      tasks: openTasks.length,
      agents: agentCount,
    },
  };
};
