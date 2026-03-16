import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import JSON5 from 'json5';
import { resolveIncludes } from './include.js';
import { validateConfig } from './validate.js';
import type { HQConfig, SecretsConfig } from './types.js';

/**
 * Load and validate the HQ config from a directory.
 * Reads companies.json5, resolves all $include directives, and validates the result.
 */
export async function loadConfig(configDir: string): Promise<HQConfig> {
  const configRoot = resolve(configDir);
  const companiesPath = resolve(configRoot, 'companies.json5');

  const raw = await readFile(companiesPath, 'utf-8');
  const parsed = JSON5.parse(raw);
  const resolved = await resolveIncludes(parsed, configRoot);

  validateConfig(resolved);
  return resolved;
}

/**
 * Load secrets from secrets.json5 in the config directory.
 * Returns null if the file doesn't exist.
 */
export async function loadSecrets(configDir: string): Promise<SecretsConfig | null> {
  const secretsPath = resolve(configDir, 'secrets.json5');
  try {
    const raw = await readFile(secretsPath, 'utf-8');
    return JSON5.parse(raw) as SecretsConfig;
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw err;
  }
}
