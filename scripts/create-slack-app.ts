#!/usr/bin/env npx tsx
/**
 * Create a Slack app for an HQ agent using the Slack App Manifest API.
 *
 * Prerequisites:
 *   1. Go to https://api.slack.com/apps
 *   2. Under "Your App Configuration Tokens", click "Generate Token"
 *      → Select your workspace — gives you a refresh + access token pair
 *      → Config tokens expire after 12 hours; use tooling.tokens.rotate to refresh
 *   3. Set SLACK_CONFIG_TOKEN in your environment
 *
 * Usage:
 *   npx tsx scripts/create-slack-app.ts <agent-name>
 *
 * Example:
 *   SLACK_CONFIG_TOKEN=xoxe.xoxp-... npx tsx scripts/create-slack-app.ts ceo
 */

interface ManifestCreateResponse {
  ok: boolean;
  error?: string;
  errors?: Array<{ message: string; pointer: string }>;
  app_id?: string;
  credentials?: {
    client_id: string;
    client_secret: string;
    verification_token: string;
    signing_secret: string;
  };
  oauth_authorize_url?: string;
}

async function main() {
  const agentName = process.argv[2];
  if (!agentName) {
    console.error('Usage: npx tsx scripts/create-slack-app.ts <agent-name>');
    process.exit(1);
  }

  const configToken = process.env.SLACK_CONFIG_TOKEN;
  if (!configToken) {
    console.error('Error: SLACK_CONFIG_TOKEN is not set.\n');
    console.error('To get one:');
    console.error('  1. Go to https://api.slack.com/apps');
    console.error('  2. Under "Your App Configuration Tokens", click "Generate Token"');
    console.error('  3. Select your workspace and generate');
    console.error('  4. Export it: export SLACK_CONFIG_TOKEN=xoxe.xoxp-...');
    process.exit(1);
  }

  const appName = `HQ Agent: ${agentName}`;
  const displayName = `hq-${agentName}`;

  console.log(`Creating Slack app: ${appName}`);
  console.log(`Bot display name: ${displayName}\n`);

  // App manifest (v2 for standard Slack apps)
  const manifest = {
    _metadata: {
      major_version: 2,
      minor_version: 1,
    },
    display_information: {
      name: appName,
      description: `HQ AI Agent - ${agentName}`,
      background_color: '#1a1a2e',
    },
    features: {
      bot_user: {
        display_name: displayName,
        always_online: true,
      },
    },
    oauth_config: {
      scopes: {
        bot: [
          'app_mentions:read',
          'channels:history',
          'channels:read',
          'chat:write',
          'chat:write.public',
          'groups:history',
          'groups:read',
          'im:history',
          'im:read',
          'im:write',
          'mpim:history',
          'mpim:read',
          'reactions:read',
          'reactions:write',
          'users:read',
        ],
      },
    },
    settings: {
      event_subscriptions: {
        bot_events: [
          'app_mention',
          'message.channels',
          'message.groups',
          'message.im',
          'message.mpim',
        ],
      },
      socket_mode_enabled: true,
      org_deploy_enabled: false,
      token_rotation_enabled: false,
    },
  };

  // Call the Slack API
  const response = await fetch('https://slack.com/api/apps.manifest.create', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${configToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ manifest: JSON.stringify(manifest) }),
  });

  const result = (await response.json()) as ManifestCreateResponse;

  if (!result.ok) {
    console.error('Failed to create app:');
    console.error(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  const { app_id, credentials } = result;

  console.log('App created successfully!\n');
  console.log(`  App ID:         ${app_id}`);
  console.log(`  Client ID:      ${credentials!.client_id}`);
  console.log(`  Client Secret:  ${credentials!.client_secret}`);
  console.log(`  Signing Secret: ${credentials!.signing_secret}`);
  console.log('');
  console.log('Next steps:\n');
  console.log(`  1. Install the app to your workspace:`);
  console.log(`     https://api.slack.com/apps/${app_id}/install-on-team\n`);
  console.log(`  2. After installing, get the Bot Token (xoxb-...) from OAuth & Permissions:`);
  console.log(`     https://api.slack.com/apps/${app_id}/oauth\n`);
  console.log(`  3. Generate an App Token (xapp-...) with 'connections:write' scope:`);
  console.log(`     https://api.slack.com/apps/${app_id}/general\n`);

  const upperName = agentName.toUpperCase().replace(/-/g, '_');
  console.log(`  4. Add the tokens to your .env.development.local:\n`);
  console.log(`     SLACK_${upperName}_APP_TOKEN=xapp-...`);
  console.log(`     SLACK_${upperName}_BOT_TOKEN=xoxb-...`);
  console.log('');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
