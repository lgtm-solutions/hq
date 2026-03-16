import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getConfig } from '../config.js';

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
}
