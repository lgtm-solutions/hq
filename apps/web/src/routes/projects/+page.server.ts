import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const projects = locals.config.companies.flatMap((company) =>
    company.projects.map((project) => ({
      ...project,
      companySlug: company.slug,
      companyName: company.name,
    }))
  );

  return { projects };
};
