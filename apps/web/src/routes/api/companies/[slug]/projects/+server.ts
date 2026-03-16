import { json } from '@sveltejs/kit';
import { getConfigDir, reloadConfig } from '$lib/server/config';
import { createProject } from '@hq/config';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
  const company = locals.config.companies.find((c) => c.slug === params.slug);
  if (!company) return json({ error: 'company not found' }, { status: 404 });
  return json(company.projects);
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
  const company = locals.config.companies.find((c) => c.slug === params.slug);
  if (!company) return json({ error: 'company not found' }, { status: 404 });

  const body = await request.json();
  const { name, slug } = body;

  if (!name || !slug) {
    return json({ error: 'name and slug are required' }, { status: 400 });
  }
  if (company.projects.some((p) => p.slug === slug)) {
    return json({ error: `Project "${slug}" already exists` }, { status: 409 });
  }

  await createProject(getConfigDir(), params.slug, {
    name,
    slug,
    description: body.description,
    git: body.git,
    agents: body.agents,
    channels: body.channels,
    metadata: body.metadata,
  });

  const config = await reloadConfig();
  const project = config.companies.find((c) => c.slug === params.slug)?.projects.find((p) => p.slug === slug);

  return json(project, { status: 201 });
};
