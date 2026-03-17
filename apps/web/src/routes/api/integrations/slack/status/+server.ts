import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getConfig, getSecrets } from '$lib/server/config';
import { computeAgentStatus, resolveAgentTokens } from '$lib/server/slack';

export const GET: RequestHandler = async () => {
  const [config, secrets] = await Promise.all([getConfig(), getSecrets()]);

  const hasConfigToken = !!(secrets?.['SLACK_CONFIG_TOKEN'] && !secrets['SLACK_CONFIG_TOKEN'].endsWith('...'));

  const agents = config.companies.flatMap((company) =>
    company.agents.map((agent) => {
      const status = computeAgentStatus(secrets, agent.name);
      const tokens = resolveAgentTokens(secrets, agent.name);
      return {
        companySlug: company.slug,
        companyName: company.name,
        agentName: agent.name,
        role: agent.role,
        status,
        workspace: agent.integrations?.slack?.workspace ?? company.integrations?.slack?.workspace,
        defaultChannel: agent.integrations?.slack?.defaultChannel ?? company.integrations?.slack?.defaultChannel,
        channels: agent.integrations?.slack?.channels ?? company.integrations?.slack?.channels ?? [],
        appId: tokens.appId,
        hasAppToken: !!tokens.appToken,
        hasBotToken: !!tokens.botToken,
      };
    })
  );

  return json({ hasConfigToken, agents });
};
