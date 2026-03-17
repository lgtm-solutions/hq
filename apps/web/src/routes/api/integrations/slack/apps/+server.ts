import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getConfig, getConfigDir, getSecrets, reloadSecrets } from '$lib/server/config';
import { updateSecrets } from '@hq/config';
import { createSlackApp, generateDefaultManifest, readManifest, writeManifest, agentKeyPrefix } from '$lib/server/slack';
import { resolve } from 'node:path';

/**
 * POST: Create a Slack app for an agent via the Manifest API.
 * Body: { companySlug: string, agentName: string }
 */
export const POST: RequestHandler = async ({ request }) => {
  const { companySlug, agentName } = await request.json() as {
    companySlug: string;
    agentName: string;
  };

  if (!companySlug || !agentName) {
    return json({ error: 'companySlug and agentName are required' }, { status: 400 });
  }

  const [secrets, config] = await Promise.all([getSecrets(), getConfig()]);
  const configToken = secrets?.['SLACK_CONFIG_TOKEN'];

  if (!configToken || configToken.endsWith('...')) {
    return json({ error: 'Slack config token not set. Add it first via /api/integrations/slack/config-token' }, { status: 400 });
  }

  // Find the agent in config
  const company = config.companies.find((c) => c.slug === companySlug);
  if (!company) {
    return json({ error: `Company "${companySlug}" not found` }, { status: 404 });
  }
  const agent = company.agents.find((a) => a.name === agentName);
  if (!agent) {
    return json({ error: `Agent "${agentName}" not found in ${companySlug}` }, { status: 404 });
  }

  // Read or generate manifest
  const configDir = getConfigDir();
  const agentDir = resolve(configDir, companySlug, 'agents', agentName);
  let manifest = await readManifest(agentDir);
  if (!manifest) {
    manifest = generateDefaultManifest(agentName, agent.description);
    await writeManifest(agentDir, manifest);
  }

  // Create via Slack API
  const result = await createSlackApp(configToken, manifest);

  if (!result.ok) {
    return json({
      error: result.error ?? 'Failed to create Slack app',
      details: result.errors,
    }, { status: 502 });
  }

  // Store credentials in secrets
  const prefix = agentKeyPrefix(agentName);
  await updateSecrets(configDir, {
    [`${prefix}_APP_ID`]: result.app_id!,
    [`${prefix}_CLIENT_ID`]: result.credentials!.client_id,
    [`${prefix}_CLIENT_SECRET`]: result.credentials!.client_secret,
    [`${prefix}_SIGNING_SECRET`]: result.credentials!.signing_secret,
  });
  await reloadSecrets();

  return json({
    ok: true,
    appId: result.app_id,
    installUrl: `https://api.slack.com/apps/${result.app_id}/install-on-team`,
  });
};
