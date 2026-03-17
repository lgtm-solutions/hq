import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getConfigDir, getSecrets, reloadSecrets } from '$lib/server/config';
import { deleteSecrets } from '@hq/config';
import { deleteSlackApp, agentKeyPrefix } from '$lib/server/slack';

/**
 * DELETE: Delete a Slack app and remove its credentials from secrets.
 */
export const DELETE: RequestHandler = async ({ params }) => {
  const { agentName } = params;

  const secrets = await getSecrets();
  const prefix = agentKeyPrefix(agentName);
  const appId = secrets?.[`${prefix}_APP_ID`];
  const configToken = secrets?.['SLACK_CONFIG_TOKEN'];

  // Delete from Slack if we have the credentials
  if (appId && configToken && !configToken.endsWith('...')) {
    const result = await deleteSlackApp(configToken, appId);
    if (!result.ok && result.error !== 'invalid_app_id') {
      return json({ error: result.error ?? 'Failed to delete Slack app' }, { status: 502 });
    }
  }

  // Remove all secrets for this agent
  const keysToRemove = Object.keys(secrets ?? {}).filter((k) => k.startsWith(`${prefix}_`));
  if (keysToRemove.length > 0) {
    await deleteSecrets(getConfigDir(), keysToRemove);
    await reloadSecrets();
  }

  return json({ ok: true });
};
