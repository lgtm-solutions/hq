import { resolve } from 'node:path';
import { loadConfig, type HQConfig } from '@hq/config';
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
