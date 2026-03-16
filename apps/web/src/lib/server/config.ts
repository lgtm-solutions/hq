import { resolve } from 'node:path';
import { loadConfig, type HQConfig } from '@hq/config';
import { env } from '$env/dynamic/private';

// Resolve to monorepo root (apps/web/../../ = root)
const PROJECT_ROOT = resolve(import.meta.dirname, '..', '..', '..', '..', '..');

let _config: HQConfig;

export async function getConfig(): Promise<HQConfig> {
  if (!_config) {
    const configDir = env.HQ_CONFIG_DIR || resolve(PROJECT_ROOT, 'examples');
    _config = await loadConfig(configDir);
  }
  return _config;
}
