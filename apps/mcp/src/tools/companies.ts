import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getConfig, getConfigDir, reloadConfig } from '../config.js';
import { createCompany, updateCompany, deleteCompany } from '@hq/config';

export function registerCompanyTools(server: McpServer) {
  server.tool(
    'hq_list_companies',
    'List all companies from config',
    {},
    async () => {
      const config = await getConfig();
      const companies = config.companies.map((c) => ({
        name: c.name,
        slug: c.slug,
        description: c.description,
        mission: c.mission,
        agentCount: c.agents.length,
        projectCount: c.projects.length,
      }));

      return { content: [{ type: 'text', text: JSON.stringify(companies, null, 2) }] };
    }
  );

  server.tool(
    'hq_get_company',
    'Get a company by slug with its agents and projects',
    { slug: z.string().describe('Company slug') },
    async ({ slug }) => {
      const config = await getConfig();
      const company = config.companies.find((c) => c.slug === slug);
      if (!company) {
        return { isError: true, content: [{ type: 'text', text: 'Company not found' }] };
      }

      return { content: [{ type: 'text', text: JSON.stringify(company, null, 2) }] };
    }
  );

  server.tool(
    'hq_create_company',
    'Create a new company (writes config files to disk)',
    {
      name: z.string().describe('Company display name'),
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).describe('Company slug (lowercase, hyphens)'),
      description: z.string().optional().describe('Company description'),
      mission: z.string().optional().describe('Company mission statement'),
    },
    async ({ name, slug, description, mission }) => {
      const config = await getConfig();
      if (config.companies.some((c) => c.slug === slug)) {
        return { isError: true, content: [{ type: 'text', text: `Company "${slug}" already exists` }] };
      }

      await createCompany(getConfigDir(), { name, slug, description, mission });
      await reloadConfig();

      return { content: [{ type: 'text', text: `Company "${name}" (${slug}) created` }] };
    }
  );

  server.tool(
    'hq_update_company',
    'Update an existing company (writes config files to disk)',
    {
      slug: z.string().describe('Company slug to update'),
      name: z.string().optional().describe('New display name'),
      description: z.string().optional().describe('New description'),
      mission: z.string().optional().describe('New mission statement'),
    },
    async ({ slug, name, description, mission }) => {
      const config = await getConfig();
      if (!config.companies.some((c) => c.slug === slug)) {
        return { isError: true, content: [{ type: 'text', text: 'Company not found' }] };
      }

      await updateCompany(getConfigDir(), slug, { name, description, mission });
      const updated = await reloadConfig();
      const company = updated.companies.find((c) => c.slug === slug);

      return { content: [{ type: 'text', text: JSON.stringify(company, null, 2) }] };
    }
  );

  server.tool(
    'hq_delete_company',
    'Delete a company and all its config files from disk',
    { slug: z.string().describe('Company slug to delete') },
    async ({ slug }) => {
      const config = await getConfig();
      if (!config.companies.some((c) => c.slug === slug)) {
        return { isError: true, content: [{ type: 'text', text: 'Company not found' }] };
      }

      await deleteCompany(getConfigDir(), slug);
      await reloadConfig();

      return { content: [{ type: 'text', text: `Company "${slug}" deleted` }] };
    }
  );
}
