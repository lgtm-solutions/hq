import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getConfig } from '../config.js';

export function registerAgentTools(server: McpServer) {
  server.tool(
    'hq_list_agents',
    'List all agents, optionally filtered by company',
    {
      companySlug: z.string().optional().describe('Filter by company slug'),
    },
    async ({ companySlug }) => {
      const config = await getConfig();
      const companies = companySlug
        ? config.companies.filter((c) => c.slug === companySlug)
        : config.companies;

      const agents = companies.flatMap((c) =>
        c.agents.map((a) => ({
          ...a,
          companySlug: c.slug,
          companyName: c.name,
        }))
      );

      return { content: [{ type: 'text', text: JSON.stringify(agents, null, 2) }] };
    }
  );

  server.tool(
    'hq_get_agent',
    'Get a specific agent by company slug and agent name',
    {
      companySlug: z.string().describe('Company slug'),
      agentName: z.string().describe('Agent name'),
    },
    async ({ companySlug, agentName }) => {
      const config = await getConfig();
      const company = config.companies.find((c) => c.slug === companySlug);
      if (!company) {
        return { isError: true, content: [{ type: 'text', text: 'Company not found' }] };
      }

      const agent = company.agents.find((a) => a.name === agentName);
      if (!agent) {
        return { isError: true, content: [{ type: 'text', text: 'Agent not found' }] };
      }

      return {
        content: [{ type: 'text', text: JSON.stringify({ ...agent, companySlug: company.slug, companyName: company.name }, null, 2) }],
      };
    }
  );
}
