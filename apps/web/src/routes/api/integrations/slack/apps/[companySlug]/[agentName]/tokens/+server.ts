import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getConfigDir, reloadSecrets } from '$lib/server/config';
import { updateSecrets } from '@hq/config';
import { agentKeyPrefix } from '$lib/server/slack';

/**
 * PUT: Store app token (xapp-) and bot token (xoxb-) for an agent after Slack install.
 */
export const PUT: RequestHandler = async ({ params, request }) => {
  const { agentName } = params;
  const { appToken, botToken } = await request.json() as {
    appToken?: string;
    botToken?: string;
  };

  if (!appToken && !botToken) {
    return json({ error: 'At least one of appToken or botToken is required' }, { status: 400 });
  }

  const prefix = agentKeyPrefix(agentName);
  const updates: Record<string, string> = {};
  if (appToken) updates[`${prefix}_APP_TOKEN`] = appToken;
  if (botToken) updates[`${prefix}_BOT_TOKEN`] = botToken;

  await updateSecrets(getConfigDir(), updates);
  await reloadSecrets();

  return json({ ok: true });
};
