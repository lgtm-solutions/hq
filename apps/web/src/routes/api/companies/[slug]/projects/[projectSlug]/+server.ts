import { json } from '@sveltejs/kit';
import { getConfigDir, reloadConfig } from '$lib/server/config';
import { updateProject, deleteProject } from '@hq/config';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
  const company = locals.config.companies.find((c) => c.slug === params.slug);
  if (!company) return json({ error: 'company not found' }, { status: 404 });

  const project = company.projects.find((p) => p.slug === params.projectSlug);
  if (!project) return json({ error: 'project not found' }, { status: 404 });

  return json(project);
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  const company = locals.config.companies.find((c) => c.slug === params.slug);
  if (!company) return json({ error: 'company not found' }, { status: 404 });

  const project = company.projects.find((p) => p.slug === params.projectSlug);
  if (!project) return json({ error: 'project not found' }, { status: 404 });

  const body = await request.json();
  await updateProject(getConfigDir(), params.slug, params.projectSlug, body);

  const config = await reloadConfig();
  const updated = config.companies.find((c) => c.slug === params.slug)?.projects.find((p) => p.slug === params.projectSlug);

  return json(updated);
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  const company = locals.config.companies.find((c) => c.slug === params.slug);
  if (!company) return json({ error: 'company not found' }, { status: 404 });

  const project = company.projects.find((p) => p.slug === params.projectSlug);
  if (!project) return json({ error: 'project not found' }, { status: 404 });

  await deleteProject(getConfigDir(), params.slug, params.projectSlug);
  await reloadConfig();

  return json({ ok: true });
};
