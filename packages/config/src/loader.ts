import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import JSON5 from 'json5';
import { resolveIncludes } from './include.js';
import { validateConfig } from './validate.js';
import type { HQConfig, SecretsConfig, ConfigValue, RawSecretsConfig } from './types.js';

/**
 * After $include resolution, systemPrompt may be an array of strings.
 * Flatten it into a single string joined by double newlines.
 */
function flattenSystemPrompts(config: HQConfig): void {
  for (const company of config.companies) {
    for (const agent of company.agents) {
      if (Array.isArray(agent.systemPrompt)) {
        // Flatten nested arrays (from glob expansion) and join
        const parts = (agent.systemPrompt as unknown[]).flat(Infinity).filter(
          (p): p is string => typeof p === 'string' && p.length > 0
        );
        agent.systemPrompt = parts.join('\n\n');
      }
    }
  }
}

/**
 * Load and validate the HQ config from a directory.
 * Reads companies.json5, resolves all $include directives, and validates the result.
 */
export async function loadConfig(configDir: string): Promise<HQConfig> {
  const configRoot = resolve(configDir);
  const companiesPath = resolve(configRoot, 'companies.json5');

  // Load secrets first so ${VAR} placeholders can resolve from secrets.json5
  const secrets = await loadSecrets(configDir);

  const raw = await readFile(companiesPath, 'utf-8');
  const parsed = JSON5.parse(raw);
  const resolved = await resolveIncludes(parsed, configRoot, new Set(), undefined, secrets ?? undefined) as HQConfig;

  flattenSystemPrompts(resolved);
  validateConfig(resolved);
  return resolved;
}

/**
 * Walk a dotted key path ("slack.ceo.app_token") into a nested object.
 */
function getNestedValue(obj: unknown, keyPath: string): string | undefined {
  let current: unknown = obj;
  for (const segment of keyPath.split('.')) {
    if (current === null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return typeof current === 'string' ? current : undefined;
}

/**
 * Resolve a single ConfigValue to a plain string.
 * Returns undefined if the value cannot be resolved (missing env var, file, or key).
 */
async function resolveConfigValue(value: ConfigValue, configDir: string): Promise<string | undefined> {
  if (typeof value === 'string') return value;

  switch (value.type) {
    case 'env': {
      return process.env[value.key];
    }
    case 'file': {
      const filePath = resolve(configDir, value.path);
      let content: string;
      try {
        content = await readFile(filePath, 'utf-8');
      } catch {
        return undefined;
      }

      // No key → entire file content is the value
      if (!value.key) return content.trim();

      // Key provided → parse as JSON/JSON5 and walk the dotted path
      try {
        const parsed = JSON5.parse(content);
        return getNestedValue(parsed, value.key);
      } catch {
        return undefined;
      }
    }
    default:
      return undefined;
  }
}

/**
 * Load secrets from secrets.json5 in the config directory.
 * Resolves all ConfigValue objects (env, file) into plain strings.
 * Returns a flat key-value map, or null if the file doesn't exist.
 */
export async function loadSecrets(configDir: string): Promise<SecretsConfig | null> {
  const secretsPath = resolve(configDir, 'secrets.json5');
  let raw: RawSecretsConfig;
  try {
    const content = await readFile(secretsPath, 'utf-8');
    raw = JSON5.parse(content) as RawSecretsConfig;
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw err;
  }

  const resolved: SecretsConfig = {};
  for (const [key, value] of Object.entries(raw)) {
    const result = await resolveConfigValue(value, configDir);
    if (result !== undefined) {
      resolved[key] = result;
    }
  }
  return resolved;
}

/**
 * Reload secrets (invalidate cache). Used after writing new secrets.
 */
export async function reloadSecrets(configDir: string): Promise<SecretsConfig | null> {
  return loadSecrets(configDir);
}
