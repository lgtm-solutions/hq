import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getConfig, getConfigDir, reloadConfig } from '../config.js';
import { createProject, updateProject, deleteProject } from '@hq/config';

export function registerProjectTools(server: McpServer) {
  server.tool(
    'hq_list_projects',
    'List all projects, optionally filtered by company',
    {
      companySlug: z.string().optional().describe('Filter by company slug'),
    },
    async ({ companySlug }) => {
      const config = await getConfig();
      const companies = companySlug
        ? config.companies.filter((c) => c.slug === companySlug)
        : config.companies;

      const projects = companies.flatMap((c) =>
        c.projects.map((p) => ({
          ...p,
          companySlug: c.slug,
          companyName: c.name,
        }))
      );

      return { content: [{ type: 'text', text: JSON.stringify(projects, null, 2) }] };
    }
  );

  server.tool(
    'hq_get_project',
    'Get a specific project by company slug and project slug',
    {
      companySlug: z.string().describe('Company slug'),
      projectSlug: z.string().describe('Project slug'),
    },
    async ({ companySlug, projectSlug }) => {
      const config = await getConfig();
      const company = config.companies.find((c) => c.slug === companySlug);
      if (!company) {
        return { isError: true, content: [{ type: 'text', text: 'Company not found' }] };
      }

      const project = company.projects.find((p) => p.slug === projectSlug);
      if (!project) {
        return { isError: true, content: [{ type: 'text', text: 'Project not found' }] };
      }

      return {
        content: [{ type: 'text', text: JSON.stringify({ ...project, companySlug: company.slug, companyName: company.name }, null, 2) }],
      };
    }
  );

  server.tool(
    'hq_create_project',
    'Create a new project in a company (writes config files to disk)',
    {
      companySlug: z.string().describe('Company slug'),
      name: z.string().describe('Project display name'),
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).describe('Project slug'),
      description: z.string().optional().describe('Project description'),
      git: z.string().optional().describe('Git repository URL'),
      agents: z.array(z.string()).optional().describe('Agent names assigned to this project'),
      channels: z.array(z.string()).optional().describe('Channels linked to this project'),
      metadata: z.record(z.unknown()).optional().describe('Arbitrary metadata'),
    },
    async ({ companySlug, name, slug, description, git, agents, channels, metadata }) => {
      const config = await getConfig();
      const company = config.companies.find((c) => c.slug === companySlug);
      if (!company) {
        return { isError: true, content: [{ type: 'text', text: 'Company not found' }] };
      }
      if (company.projects.some((p) => p.slug === slug)) {
        return { isError: true, content: [{ type: 'text', text: `Project "${slug}" already exists in ${companySlug}` }] };
      }

      await createProject(getConfigDir(), companySlug, {
        name,
        slug,
        description,
        git,
        agents,
        channels,
        metadata,
      });
      await reloadConfig();

      return { content: [{ type: 'text', text: `Project "${name}" (${slug}) created in ${companySlug}` }] };
    }
  );

  server.tool(
    'hq_update_project',
    'Update an existing project (writes config files to disk)',
    {
      companySlug: z.string().describe('Company slug'),
      projectSlug: z.string().describe('Project slug to update'),
      name: z.string().optional().describe('New display name'),
      description: z.string().optional().describe('New description'),
      git: z.string().optional().describe('New git URL'),
      agents: z.array(z.string()).optional().describe('New agent assignments'),
      channels: z.array(z.string()).optional().describe('New channels'),
      metadata: z.record(z.unknown()).optional().describe('New metadata'),
    },
    async ({ companySlug, projectSlug, ...data }) => {
      const config = await getConfig();
      const company = config.companies.find((c) => c.slug === companySlug);
      if (!company) {
        return { isError: true, content: [{ type: 'text', text: 'Company not found' }] };
      }
      if (!company.projects.some((p) => p.slug === projectSlug)) {
        return { isError: true, content: [{ type: 'text', text: 'Project not found' }] };
      }

      await updateProject(getConfigDir(), companySlug, projectSlug, data);
      const updated = await reloadConfig();
      const project = updated.companies.find((c) => c.slug === companySlug)?.projects.find((p) => p.slug === projectSlug);

      return { content: [{ type: 'text', text: JSON.stringify(project, null, 2) }] };
    }
  );

  server.tool(
    'hq_delete_project',
    'Delete a project from a company (removes config file from disk)',
    {
      companySlug: z.string().describe('Company slug'),
      projectSlug: z.string().describe('Project slug to delete'),
    },
    async ({ companySlug, projectSlug }) => {
      const config = await getConfig();
      const company = config.companies.find((c) => c.slug === companySlug);
      if (!company) {
        return { isError: true, content: [{ type: 'text', text: 'Company not found' }] };
      }
      if (!company.projects.some((p) => p.slug === projectSlug)) {
        return { isError: true, content: [{ type: 'text', text: 'Project not found' }] };
      }

      await deleteProject(getConfigDir(), companySlug, projectSlug);
      await reloadConfig();

      return { content: [{ type: 'text', text: `Project "${projectSlug}" deleted from ${companySlug}` }] };
    }
  );
}
