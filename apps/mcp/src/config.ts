import { resolve } from 'node:path';
import { loadConfig, type HQConfig } from '@hq/config';

// Resolve to monorepo root (src -> mcp -> apps -> root)
const PROJECT_ROOT = resolve(import.meta.dirname, '..', '..', '..');

let _config: HQConfig;

export async function getConfig(): Promise<HQConfig> {
  if (!_config) {
    const configDir = process.env.HQ_CONFIG_DIR || resolve(PROJECT_ROOT, 'examples');
    _config = await loadConfig(configDir);
  }
  return _config;
}
