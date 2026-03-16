import { json } from '@sveltejs/kit';
import { getConfigDir, reloadConfig } from '$lib/server/config';
import { updateCompany, deleteCompany } from '@hq/config';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
  const company = locals.config.companies.find((c) => c.slug === params.slug);
  if (!company) return json({ error: 'not found' }, { status: 404 });
  return json(company);
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  const company = locals.config.companies.find((c) => c.slug === params.slug);
  if (!company) return json({ error: 'not found' }, { status: 404 });

  const body = await request.json();
  const { name, description, mission } = body;

  await updateCompany(getConfigDir(), params.slug, { name, description, mission });
  const config = await reloadConfig();
  const updated = config.companies.find((c) => c.slug === params.slug);

  return json(updated);
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  const company = locals.config.companies.find((c) => c.slug === params.slug);
  if (!company) return json({ error: 'not found' }, { status: 404 });

  await deleteCompany(getConfigDir(), params.slug);
  await reloadConfig();

  return json({ ok: true });
};
