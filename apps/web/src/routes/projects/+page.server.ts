import { db } from '$lib/server/db';
import { projects } from '@hq/db/schema';
import { desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const allProjects = await db.select().from(projects).orderBy(desc(projects.createdAt));
  return { projects: allProjects };
};
