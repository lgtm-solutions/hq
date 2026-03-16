import { json } from '@sveltejs/kit';
import { getConfigDir, reloadConfig } from '$lib/server/config';
import { createAgent } from '@hq/config';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
  const company = locals.config.companies.find((c) => c.slug === params.slug);
  if (!company) return json({ error: 'company not found' }, { status: 404 });
  return json(company.agents);
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
  const company = locals.config.companies.find((c) => c.slug === params.slug);
  if (!company) return json({ error: 'company not found' }, { status: 404 });

  const body = await request.json();
  const { name, role, provider, model } = body;

  if (!name || !role || !provider || !model) {
    return json({ error: 'name, role, provider, and model are required' }, { status: 400 });
  }
  if (company.agents.some((a) => a.name === name)) {
    return json({ error: `Agent "${name}" already exists` }, { status: 409 });
  }

  await createAgent(getConfigDir(), params.slug, {
    name,
    role,
    description: body.description,
    provider,
    model,
    reportsTo: body.reportsTo ?? null,
    manages: body.manages || [],
    integrations: body.integrations,
    systemPrompt: body.systemPrompt,
  });

  const config = await reloadConfig();
  const agent = config.companies.find((c) => c.slug === params.slug)?.agents.find((a) => a.name === name);

  return json(agent, { status: 201 });
};
