import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getConfigDir, getSecrets, reloadSecrets } from '$lib/server/config';
import { updateSecrets } from '@hq/config';
import { rotateConfigToken } from '$lib/server/slack';

/**
 * POST: Rotate an expired config token using the refresh token.
 */
export const POST: RequestHandler = async () => {
  const secrets = await getSecrets();
  const refreshToken = secrets?.['SLACK_CONFIG_REFRESH_TOKEN'];

  if (!refreshToken || refreshToken.endsWith('...')) {
    return json({ error: 'No refresh token available' }, { status: 400 });
  }

  const result = await rotateConfigToken(refreshToken);

  if (!result.ok) {
    return json({ error: result.error ?? 'Token rotation failed' }, { status: 502 });
  }

  await updateSecrets(getConfigDir(), {
    SLACK_CONFIG_TOKEN: result.token!,
    SLACK_CONFIG_REFRESH_TOKEN: result.refresh_token!,
  });
  await reloadSecrets();

  return json({ ok: true });
};
