import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getConfig, getConfigDir, reloadConfig } from '../config.js';
import { createAgent, updateAgent, deleteAgent } from '@hq/config';

const slackSchema = z.object({
  slackAppToken: z.string().optional().describe('Slack app token (xapp-...)'),
  slackBotToken: z.string().optional().describe('Slack bot token (xoxb-...)'),
  workspace: z.string().optional().describe('Slack workspace name'),
  defaultChannel: z.string().optional().describe('Default channel'),
  channels: z.array(z.string()).optional().describe('Channels list'),
}).optional();

const integrationsSchema = z.object({
  slack: slackSchema.describe('Slack integration config'),
}).optional();

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

  server.tool(
    'hq_create_agent',
    'Create a new agent in a company (writes config files to disk)',
    {
      companySlug: z.string().describe('Company slug'),
      name: z.string().describe('Agent name'),
      role: z.string().describe('Agent role'),
      description: z.string().optional().describe('Agent description'),
      provider: z.string().describe('LLM provider (e.g. anthropic, openai)'),
      model: z.string().describe('Model ID (e.g. claude-sonnet-4-6)'),
      reportsTo: z.string().nullable().optional().describe('Name of the agent this one reports to'),
      manages: z.array(z.string()).optional().describe('Names of agents this one manages'),
      integrations: integrationsSchema.describe('Integrations config — overrides company defaults'),
      systemPrompt: z.string().optional().describe('System prompt for the agent'),
    },
    async ({ companySlug, name, role, description, provider, model, reportsTo, manages, integrations, systemPrompt }) => {
      const config = await getConfig();
      const company = config.companies.find((c) => c.slug === companySlug);
      if (!company) {
        return { isError: true, content: [{ type: 'text', text: 'Company not found' }] };
      }
      if (company.agents.some((a) => a.name === name)) {
        return { isError: true, content: [{ type: 'text', text: `Agent "${name}" already exists in ${companySlug}` }] };
      }

      await createAgent(getConfigDir(), companySlug, {
        name,
        role,
        description,
        provider,
        model,
        reportsTo: reportsTo ?? null,
        manages: manages || [],
        integrations,
        systemPrompt,
      });
      await reloadConfig();

      return { content: [{ type: 'text', text: `Agent "${name}" created in ${companySlug}` }] };
    }
  );

  server.tool(
    'hq_update_agent',
    'Update an existing agent (writes config files to disk)',
    {
      companySlug: z.string().describe('Company slug'),
      agentName: z.string().describe('Agent name to update'),
      role: z.string().optional().describe('New role'),
      description: z.string().optional().describe('New description'),
      provider: z.string().optional().describe('New provider'),
      model: z.string().optional().describe('New model'),
      reportsTo: z.string().nullable().optional().describe('New reportsTo'),
      manages: z.array(z.string()).optional().describe('New manages list'),
      integrations: integrationsSchema.describe('Integrations config — overrides company defaults'),
      systemPrompt: z.string().optional().describe('New system prompt'),
    },
    async ({ companySlug, agentName, ...data }) => {
      const config = await getConfig();
      const company = config.companies.find((c) => c.slug === companySlug);
      if (!company) {
        return { isError: true, content: [{ type: 'text', text: 'Company not found' }] };
      }
      if (!company.agents.some((a) => a.name === agentName)) {
        return { isError: true, content: [{ type: 'text', text: 'Agent not found' }] };
      }

      await updateAgent(getConfigDir(), companySlug, agentName, data);
      const updated = await reloadConfig();
      const agent = updated.companies.find((c) => c.slug === companySlug)?.agents.find((a) => a.name === agentName);

      return { content: [{ type: 'text', text: JSON.stringify(agent, null, 2) }] };
    }
  );

  server.tool(
    'hq_delete_agent',
    'Delete an agent from a company (removes config file from disk)',
    {
      companySlug: z.string().describe('Company slug'),
      agentName: z.string().describe('Agent name to delete'),
    },
    async ({ companySlug, agentName }) => {
      const config = await getConfig();
      const company = config.companies.find((c) => c.slug === companySlug);
      if (!company) {
        return { isError: true, content: [{ type: 'text', text: 'Company not found' }] };
      }
      if (!company.agents.some((a) => a.name === agentName)) {
        return { isError: true, content: [{ type: 'text', text: 'Agent not found' }] };
      }

      await deleteAgent(getConfigDir(), companySlug, agentName);
      await reloadConfig();

      return { content: [{ type: 'text', text: `Agent "${agentName}" deleted from ${companySlug}` }] };
    }
  );
}
