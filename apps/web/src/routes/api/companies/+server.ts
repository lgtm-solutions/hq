import { json } from '@sveltejs/kit';
import { getConfigDir, reloadConfig } from '$lib/server/config';
import { createCompany } from '@hq/config';
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

export const POST: RequestHandler = async ({ request, locals }) => {
  const body = await request.json();
  const { name, slug, description, mission } = body;

  if (!name || !slug) {
    return json({ error: 'name and slug are required' }, { status: 400 });
  }
  if (locals.config.companies.some((c) => c.slug === slug)) {
    return json({ error: `Company "${slug}" already exists` }, { status: 409 });
  }

  await createCompany(getConfigDir(), { name, slug, description, mission });
  const config = await reloadConfig();
  const created = config.companies.find((c) => c.slug === slug);

  return json(created, { status: 201 });
};
