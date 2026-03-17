import { getSecrets } from '$lib/server/config';
import { getDatabase } from '$lib/server/db';
import type { PageServerLoad } from './$types';

type IntegrationStatus = 'connected' | 'not_configured' | 'error';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'provider' | 'communication' | 'runtime' | 'source_control' | 'database';
  status: IntegrationStatus;
  statusMessage?: string;
  icon: string;
  soon?: boolean;
}

export const load: PageServerLoad = async () => {
  const secrets = await getSecrets();

  // Check if any agent has a valid slack bot token in secrets
  const hasSlackToken = secrets
    ? Object.keys(secrets).some(
        (key) => key.startsWith('SLACK_') && key.endsWith('_BOT_TOKEN') && hasValidKey(secrets[key])
      )
    : false;

  // Probe database connection
  let dbStatus: IntegrationStatus = 'not_configured';
  let dbMessage = 'Not configured';
  try {
    const database = getDatabase();
    const result = await database.testConnection();
    if (result.ok) {
      dbStatus = 'connected';
      dbMessage = 'Connected';
    } else {
      dbStatus = 'error';
      dbMessage = result.error;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('DATABASE_URL')) {
      dbStatus = 'not_configured';
      dbMessage = 'DATABASE_URL not set';
    } else {
      dbStatus = 'error';
      dbMessage = msg;
    }
  }

  const s = (key: string) => secrets?.[key];

  const integrations: Integration[] = [
    // LLM Providers
    {
      id: 'anthropic',
      name: 'Anthropic',
      description: 'Claude models for AI agent reasoning',
      category: 'provider',
      status: hasValidKey(s('ANTHROPIC_API_KEY')) ? 'connected' : 'not_configured',
      statusMessage: hasValidKey(s('ANTHROPIC_API_KEY')) ? 'API key configured' : 'No API key',
      icon: 'A',
      soon: true,
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'GPT models for AI agent reasoning',
      category: 'provider',
      status: hasValidKey(s('OPENAI_API_KEY')) ? 'connected' : 'not_configured',
      statusMessage: hasValidKey(s('OPENAI_API_KEY')) ? 'API key configured' : 'No API key',
      icon: 'O',
      soon: true,
    },

    // Communication
    {
      id: 'slack',
      name: 'Slack',
      description: 'Team messaging and agent notifications',
      category: 'communication',
      status: hasSlackToken ? 'connected' : 'not_configured',
      statusMessage: hasSlackToken ? 'Bot token configured' : 'Not configured',
      icon: 'S',
    },
    {
      id: 'discord',
      name: 'Discord',
      description: 'Community messaging and agent notifications',
      category: 'communication',
      status: hasValidKey(s('DISCORD_BOT_TOKEN')) ? 'connected' : 'not_configured',
      statusMessage: hasValidKey(s('DISCORD_BOT_TOKEN')) ? 'Bot token configured' : 'Not configured',
      icon: 'D',
      soon: true,
    },

    // Agent Runtimes
    {
      id: 'openclaw',
      name: 'OpenClaw',
      description: 'Open-source agent runtime for autonomous execution',
      category: 'runtime',
      status: hasValidKey(s('OPENCLAW_API_KEY')) ? 'connected' : 'not_configured',
      statusMessage: hasValidKey(s('OPENCLAW_API_KEY')) ? 'Connected' : 'Not configured',
      icon: 'C',
      soon: true,
    },
    {
      id: 'claude-code',
      name: 'Claude Code',
      description: 'Anthropic CLI agent for coding tasks',
      category: 'runtime',
      status: hasValidKey(s('ANTHROPIC_API_KEY')) ? 'connected' : 'not_configured',
      statusMessage: hasValidKey(s('ANTHROPIC_API_KEY')) ? 'Available via Anthropic key' : 'Requires Anthropic API key',
      icon: 'CC',
      soon: true,
    },
    {
      id: 'codex',
      name: 'Codex',
      description: 'OpenAI agent for coding tasks',
      category: 'runtime',
      status: hasValidKey(s('OPENAI_API_KEY')) ? 'connected' : 'not_configured',
      statusMessage: hasValidKey(s('OPENAI_API_KEY')) ? 'Available via OpenAI key' : 'Requires OpenAI API key',
      icon: 'CX',
      soon: true,
    },

    // Source Control
    {
      id: 'github',
      name: 'GitHub',
      description: 'Source code hosting and CI/CD',
      category: 'source_control',
      status: hasValidKey(s('GITHUB_TOKEN')) ? 'connected' : 'not_configured',
      statusMessage: hasValidKey(s('GITHUB_TOKEN')) ? 'Token configured' : 'Not configured',
      icon: 'GH',
      soon: true,
    },
    {
      id: 'gitlab',
      name: 'GitLab',
      description: 'Source code hosting and CI/CD',
      category: 'source_control',
      status: hasValidKey(s('GITLAB_TOKEN')) ? 'connected' : 'not_configured',
      statusMessage: hasValidKey(s('GITLAB_TOKEN')) ? 'Token configured' : 'Not configured',
      icon: 'GL',
      soon: true,
    },

    // Database
    {
      id: 'postgresql',
      name: 'PostgreSQL',
      description: 'Primary database for tasks, subtasks, and comments',
      category: 'database',
      status: dbStatus,
      statusMessage: dbMessage,
      icon: 'PG',
    },
  ];

  return { integrations };
};

function hasValidKey(value: string | undefined): boolean {
  if (!value) return false;
  // Placeholder values from example configs
  if (value.endsWith('...')) return false;
  if (value === '') return false;
  return true;
}
