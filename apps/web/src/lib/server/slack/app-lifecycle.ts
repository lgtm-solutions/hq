import type { ManifestCreateResponse, ManifestDeleteResponse, TokenRotateResponse } from './types.js';

const SLACK_API = 'https://slack.com/api';

/**
 * Create a Slack app via the Manifest API.
 */
export async function createSlackApp(
  configToken: string,
  manifest: Record<string, unknown>
): Promise<ManifestCreateResponse> {
  const response = await fetch(`${SLACK_API}/apps.manifest.create`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${configToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ manifest: JSON.stringify(manifest) }),
  });
  return response.json() as Promise<ManifestCreateResponse>;
}

/**
 * Delete a Slack app via the Manifest API.
 */
export async function deleteSlackApp(
  configToken: string,
  appId: string
): Promise<ManifestDeleteResponse> {
  const response = await fetch(`${SLACK_API}/apps.manifest.delete`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${configToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ app_id: appId }),
  });
  return response.json() as Promise<ManifestDeleteResponse>;
}

/**
 * Rotate a config token using a refresh token.
 */
export async function rotateConfigToken(
  refreshToken: string
): Promise<TokenRotateResponse> {
  const response = await fetch(`${SLACK_API}/tooling.tokens.rotate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ refresh_token: refreshToken }),
  });
  return response.json() as Promise<TokenRotateResponse>;
}
