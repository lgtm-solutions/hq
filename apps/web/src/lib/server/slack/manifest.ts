import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';

/**
 * Generate a default Slack app manifest (v2) for an agent.
 */
export function generateDefaultManifest(agentName: string, description?: string) {
  const appName = `HQ Agent: ${agentName}`;
  const displayName = `hq-${agentName}`;

  return {
    _metadata: { major_version: 2, minor_version: 1 },
    display_information: {
      name: appName,
      description: description ?? `HQ AI Agent - ${agentName}`,
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
}

/**
 * Read a slack-manifest.json from an agent directory.
 * Returns null if not found.
 */
export async function readManifest(agentDir: string): Promise<Record<string, unknown> | null> {
  const manifestPath = resolve(agentDir, 'slack-manifest.json');
  try {
    const raw = await readFile(manifestPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Write a slack-manifest.json to an agent directory.
 */
export async function writeManifest(agentDir: string, manifest: Record<string, unknown>): Promise<void> {
  await mkdir(dirname(resolve(agentDir, 'slack-manifest.json')), { recursive: true });
  await writeFile(resolve(agentDir, 'slack-manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
}
