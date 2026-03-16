import { json } from '@sveltejs/kit';
import { getConfigDir, reloadConfig } from '$lib/server/config';
import { updateAgent, deleteAgent } from '@hq/config';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
  const company = locals.config.companies.find((c) => c.slug === params.slug);
  if (!company) return json({ error: 'company not found' }, { status: 404 });

  const agent = company.agents.find((a) => a.name === params.name);
  if (!agent) return json({ error: 'agent not found' }, { status: 404 });

  return json(agent);
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  const company = locals.config.companies.find((c) => c.slug === params.slug);
  if (!company) return json({ error: 'company not found' }, { status: 404 });

  const agent = company.agents.find((a) => a.name === params.name);
  if (!agent) return json({ error: 'agent not found' }, { status: 404 });

  const body = await request.json();
  await updateAgent(getConfigDir(), params.slug, params.name, body);

  const config = await reloadConfig();
  const updated = config.companies.find((c) => c.slug === params.slug)?.agents.find((a) => a.name === params.name);

  return json(updated);
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  const company = locals.config.companies.find((c) => c.slug === params.slug);
  if (!company) return json({ error: 'company not found' }, { status: 404 });

  const agent = company.agents.find((a) => a.name === params.name);
  if (!agent) return json({ error: 'agent not found' }, { status: 404 });

  await deleteAgent(getConfigDir(), params.slug, params.name);
  await reloadConfig();

  return json({ ok: true });
};
