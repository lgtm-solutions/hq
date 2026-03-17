import type { SecretsConfig } from '@hq/config';
import type { SlackAppStatus } from './types.js';

/**
 * Derive the secret key prefix for an agent.
 * e.g. agent "cto" → "SLACK_CTO"
 */
export function agentKeyPrefix(agentName: string): string {
  return `SLACK_${agentName.toUpperCase().replace(/-/g, '_')}`;
}

/**
 * Resolve token values for an agent from the flat secrets map.
 */
export function resolveAgentTokens(
  secrets: SecretsConfig | null,
  agentName: string
): { appId?: string; appToken?: string; botToken?: string } {
  if (!secrets) return {};
  const prefix = agentKeyPrefix(agentName);
  return {
    appId: secrets[`${prefix}_APP_ID`] || undefined,
    appToken: secrets[`${prefix}_APP_TOKEN`] || undefined,
    botToken: secrets[`${prefix}_BOT_TOKEN`] || undefined,
  };
}

/**
 * Compute the status of an agent's Slack integration based on available tokens.
 */
export function computeAgentStatus(
  secrets: SecretsConfig | null,
  agentName: string
): SlackAppStatus {
  const { appId, appToken, botToken } = resolveAgentTokens(secrets, agentName);

  if (appToken && botToken) return 'connected';
  if (botToken) return 'installed';
  if (appId) return 'created';
  return 'not_created';
}

function isValidToken(value: string | undefined): boolean {
  if (!value) return false;
  if (value === '') return false;
  if (value.endsWith('...')) return false;
  if (value.includes('${')) return false;
  return true;
}

/**
 * Check if any agent in the config has a valid slack bot token (resolved from secrets).
 */
export function hasAnySlackConnection(secrets: SecretsConfig | null): boolean {
  if (!secrets) return false;
  return Object.keys(secrets).some(
    (key) => key.endsWith('_BOT_TOKEN') && key.startsWith('SLACK_') && isValidToken(secrets[key])
  );
}
