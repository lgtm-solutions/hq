import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
  const company = locals.config.companies.find((c) => c.slug === params.slug);
  if (!company) return json({ error: 'company not found' }, { status: 404 });
  return json(company.agents);
};
