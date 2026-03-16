import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
  const { companies } = locals.config;
  return json(
    companies.map((c) => ({
      name: c.name,
      slug: c.slug,
      description: c.description,
      mission: c.mission,
      agentCount: c.agents.length,
      projectCount: c.projects.length,
    }))
  );
};
