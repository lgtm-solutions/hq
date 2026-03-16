import { getSecrets } from '$lib/server/config';
import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';
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

  // Check database connection
  let dbStatus: IntegrationStatus = 'not_configured';
  let dbMessage = 'Not configured';
  try {
    await db.execute(sql`SELECT 1`);
    dbStatus = 'connected';
    dbMessage = 'Connected';
  } catch {
    dbStatus = 'error';
    dbMessage = 'Connection failed';
  }

  const integrations: Integration[] = [
    // LLM Providers
    {
      id: 'anthropic',
      name: 'Anthropic',
      description: 'Claude models for AI agent reasoning',
      category: 'provider',
      status: hasValidKey(secrets?.providers?.anthropic?.apiKey) ? 'connected' : 'not_configured',
      statusMessage: hasValidKey(secrets?.providers?.anthropic?.apiKey) ? 'API key configured' : 'No API key',
      icon: 'A',
      soon: true,
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'GPT models for AI agent reasoning',
      category: 'provider',
      status: hasValidKey(secrets?.providers?.openai?.apiKey) ? 'connected' : 'not_configured',
      statusMessage: hasValidKey(secrets?.providers?.openai?.apiKey) ? 'API key configured' : 'No API key',
      icon: 'O',
      soon: true,
    },

    // Communication
    {
      id: 'slack',
      name: 'Slack',
      description: 'Team messaging and agent notifications',
      category: 'communication',
      status: hasValidKey(secrets?.integrations?.slack?.botToken) ? 'connected' : 'not_configured',
      statusMessage: hasValidKey(secrets?.integrations?.slack?.botToken) ? 'Bot token configured' : 'Not configured',
      icon: 'S',
      soon: true,
    },
    {
      id: 'discord',
      name: 'Discord',
      description: 'Community messaging and agent notifications',
      category: 'communication',
      status: hasValidKey(secrets?.integrations?.discord?.botToken) ? 'connected' : 'not_configured',
      statusMessage: hasValidKey(secrets?.integrations?.discord?.botToken) ? 'Bot token configured' : 'Not configured',
      icon: 'D',
      soon: true,
    },

    // Agent Runtimes
    {
      id: 'openclaw',
      name: 'OpenClaw',
      description: 'Open-source agent runtime for autonomous execution',
      category: 'runtime',
      status: hasValidKey(secrets?.integrations?.openclaw?.apiKey) ? 'connected' : 'not_configured',
      statusMessage: hasValidKey(secrets?.integrations?.openclaw?.apiKey) ? 'Connected' : 'Not configured',
      icon: 'C',
      soon: true,
    },
    {
      id: 'claude-code',
      name: 'Claude Code',
      description: 'Anthropic CLI agent for coding tasks',
      category: 'runtime',
      status: hasValidKey(secrets?.providers?.anthropic?.apiKey) ? 'connected' : 'not_configured',
      statusMessage: hasValidKey(secrets?.providers?.anthropic?.apiKey) ? 'Available via Anthropic key' : 'Requires Anthropic API key',
      icon: 'CC',
      soon: true,
    },
    {
      id: 'codex',
      name: 'Codex',
      description: 'OpenAI agent for coding tasks',
      category: 'runtime',
      status: hasValidKey(secrets?.providers?.openai?.apiKey) ? 'connected' : 'not_configured',
      statusMessage: hasValidKey(secrets?.providers?.openai?.apiKey) ? 'Available via OpenAI key' : 'Requires OpenAI API key',
      icon: 'CX',
      soon: true,
    },

    // Source Control
    {
      id: 'github',
      name: 'GitHub',
      description: 'Source code hosting and CI/CD',
      category: 'source_control',
      status: hasValidKey(secrets?.integrations?.github?.token) ? 'connected' : 'not_configured',
      statusMessage: hasValidKey(secrets?.integrations?.github?.token) ? 'Token configured' : 'Not configured',
      icon: 'GH',
      soon: true,
    },
    {
      id: 'gitlab',
      name: 'GitLab',
      description: 'Source code hosting and CI/CD',
      category: 'source_control',
      status: hasValidKey(secrets?.integrations?.gitlab?.token) ? 'connected' : 'not_configured',
      statusMessage: hasValidKey(secrets?.integrations?.gitlab?.token) ? 'Token configured' : 'Not configured',
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
