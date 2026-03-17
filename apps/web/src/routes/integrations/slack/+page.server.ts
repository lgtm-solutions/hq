import { getConfig, getSecrets } from '$lib/server/config';
import { computeAgentStatus, resolveAgentTokens } from '$lib/server/slack';
import type { SlackAppStatus } from '$lib/server/slack';
import type { PageServerLoad } from './$types';

interface AgentSlackInfo {
  name: string;
  role: string;
  companySlug: string;
  companyName: string;
  status: SlackAppStatus;
  workspace?: string;
  defaultChannel?: string;
  channels: string[];
  appId?: string;
  hasAppToken: boolean;
  hasBotToken: boolean;
}

export const load: PageServerLoad = async () => {
  const [config, secrets] = await Promise.all([getConfig(), getSecrets()]);

  const hasConfigToken = !!(
    secrets?.['SLACK_CONFIG_TOKEN'] &&
    !secrets['SLACK_CONFIG_TOKEN'].endsWith('...')
  );

  const agents: AgentSlackInfo[] = config.companies.flatMap((company) =>
    company.agents.map((agent) => {
      const status = computeAgentStatus(secrets, agent.name);
      const tokens = resolveAgentTokens(secrets, agent.name);
      return {
        name: agent.name,
        role: agent.role,
        companySlug: company.slug,
        companyName: company.name,
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

  return { hasConfigToken, agents };
};
