import { resolve } from 'node:path';
import { loadConfig, loadSecrets, type HQConfig, type SecretsConfig } from '@hq/config';
import { env } from '$env/dynamic/private';

// Resolve to monorepo root (apps/web/../../ = root)
const PROJECT_ROOT = resolve(import.meta.dirname, '..', '..', '..', '..', '..');

let _config: HQConfig;

export function getConfigDir(): string {
  return env.HQ_CONFIG_DIR || resolve(PROJECT_ROOT, 'examples');
}

export async function getConfig(): Promise<HQConfig> {
  if (!_config) {
    _config = await loadConfig(getConfigDir());
  }
  return _config;
}

export async function reloadConfig(): Promise<HQConfig> {
  _config = await loadConfig(getConfigDir());
  return _config;
}

let _secrets: SecretsConfig | null;

export async function getSecrets(): Promise<SecretsConfig | null> {
  if (_secrets === undefined) {
    _secrets = await loadSecrets(getConfigDir());
  }
  return _secrets;
}
