import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  const companies = locals.config.companies.map((c) => ({
    name: c.name,
    slug: c.slug,
  }));

  return { companies };
};
