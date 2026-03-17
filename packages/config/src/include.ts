import { readFile, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import JSON5 from 'json5';

/**
 * Replace ${VAR_NAME} patterns in a string with values from secrets map
 * first, then environment variables. Unresolved placeholders are left as-is.
 */
function resolveEnvVars(value: string, secrets?: Record<string, string>): string {
  return value.replace(/\$\{([^}]+)\}/g, (match, varName) => {
    if (secrets && varName in secrets) return secrets[varName];
    const envValue = process.env[varName];
    if (envValue !== undefined) return envValue;
    return match; // leave unresolved if not set
  });
}

/**
 * Check if a string contains glob characters.
 */
function isGlob(pattern: string): boolean {
  return pattern.includes('*') || pattern.includes('?');
}

/**
 * Check if a path is relative (starts with ./ or ../).
 */
function isRelative(path: string): boolean {
  return path.startsWith('./') || path.startsWith('../');
}

/**
 * Resolve an $include path. Relative paths (./ or ../) resolve from baseDir,
 * absolute-style paths resolve from configRoot.
 */
function resolvePath(pattern: string, configRoot: string, baseDir: string): string {
  if (isRelative(pattern)) {
    return resolve(baseDir, pattern);
  }
  return resolve(configRoot, pattern);
}

/**
 * Expand a simple glob pattern (supports * and ? in the filename part).
 * Returns sorted list of absolute file paths.
 */
async function expandGlob(pattern: string, configRoot: string, baseDir: string): Promise<string[]> {
  // Split into directory part and filename glob
  const lastSlash = pattern.lastIndexOf('/');
  const dir = lastSlash >= 0 ? pattern.slice(0, lastSlash) : '.';
  const fileGlob = lastSlash >= 0 ? pattern.slice(lastSlash + 1) : pattern;

  // Convert glob to regex: * matches anything except /
  const regexStr = '^' + fileGlob.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$';
  const regex = new RegExp(regexStr);

  const absDir = isRelative(pattern) ? resolve(baseDir, dir) : resolve(configRoot, dir);
  let entries: string[];
  try {
    entries = await readdir(absDir);
  } catch {
    return [];
  }

  return entries
    .filter((name) => regex.test(name))
    .sort()
    .map((name) => resolve(absDir, name));
}

/**
 * Recursively resolve $include directives in a parsed JSON object.
 *
 * - Paths starting with ./ or ../ resolve relative to the including file's directory (baseDir).
 * - Other paths resolve relative to configRoot.
 * - Glob patterns expand to an array of resolved file contents.
 * - Non-JSON files (.md, etc.) are returned as raw strings.
 */
export async function resolveIncludes(
  obj: unknown,
  configRoot: string,
  visited: Set<string> = new Set(),
  baseDir?: string,
  secrets?: Record<string, string>,
): Promise<unknown> {
  const effectiveBase = baseDir ?? configRoot;

  if (typeof obj === 'string') {
    return resolveEnvVars(obj, secrets);
  }

  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    const results: unknown[] = [];
    for (const item of obj) {
      const resolved = await resolveIncludes(item, configRoot, visited, effectiveBase, secrets);
      // If an $include glob expanded to an array, flatten it into the parent array
      if (Array.isArray(resolved) && isIncludeGlob(item)) {
        results.push(...resolved);
      } else {
        results.push(resolved);
      }
    }
    return results;
  }

  const record = obj as Record<string, unknown>;

  // Check if this is an $include directive
  if ('$include' in record && typeof record.$include === 'string' && Object.keys(record).length === 1) {
    const pattern = record.$include;

    // Handle glob patterns
    if (isGlob(pattern)) {
      const matches = await expandGlob(pattern, configRoot, effectiveBase);
      const results: unknown[] = [];
      for (const absPath of matches) {
        if (visited.has(absPath)) {
          throw new Error(`Circular $include detected: ${absPath}`);
        }
        const content = await readFile(absPath, 'utf-8');
        if (absPath.endsWith('.json5') || absPath.endsWith('.json')) {
          const parsed = JSON5.parse(content);
          const newVisited = new Set(visited);
          newVisited.add(absPath);
          results.push(await resolveIncludes(parsed, configRoot, newVisited, dirname(absPath), secrets));
        } else {
          results.push(content.trim());
        }
      }
      return results;
    }

    // Single file include
    const includePath = resolvePath(pattern, configRoot, effectiveBase);

    if (visited.has(includePath)) {
      throw new Error(`Circular $include detected: ${includePath}`);
    }

    const content = await readFile(includePath, 'utf-8');

    // For non-JSON files (like .md), return raw content as string
    if (!includePath.endsWith('.json5') && !includePath.endsWith('.json')) {
      return content.trim();
    }

    const parsed = JSON5.parse(content);

    const newVisited = new Set(visited);
    newVisited.add(includePath);

    return resolveIncludes(parsed, configRoot, newVisited, dirname(includePath), secrets);
  }

  // Recurse into all values
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    result[key] = await resolveIncludes(value, configRoot, visited, effectiveBase, secrets);
  }
  return result;
}

/**
 * Check if a value is an $include directive with a glob pattern.
 */
function isIncludeGlob(obj: unknown): boolean {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return false;
  const record = obj as Record<string, unknown>;
  return '$include' in record && typeof record.$include === 'string' && Object.keys(record).length === 1 && isGlob(record.$include);
}
