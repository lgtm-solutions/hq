import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getConfigDir, reloadSecrets } from '$lib/server/config';
import { updateSecrets } from '@hq/config';

/**
 * POST: Store the Slack config token (and optional refresh token) in secrets.json5.
 */
export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { configToken, configRefreshToken } = body as {
    configToken?: string;
    configRefreshToken?: string;
  };

  if (!configToken) {
    return json({ error: 'configToken is required' }, { status: 400 });
  }

  const updates: Record<string, string> = {
    SLACK_CONFIG_TOKEN: configToken,
  };
  if (configRefreshToken) {
    updates.SLACK_CONFIG_REFRESH_TOKEN = configRefreshToken;
  }

  await updateSecrets(getConfigDir(), updates);
  await reloadSecrets();

  return json({ ok: true });
};
