import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import JSON5 from 'json5';

/**
 * Check if a string contains glob characters.
 */
function isGlob(pattern: string): boolean {
  return pattern.includes('*') || pattern.includes('?');
}

/**
 * Expand a simple glob pattern (supports * and ** in the filename part).
 * Returns sorted list of matching file paths relative to configRoot.
 */
async function expandGlob(pattern: string, configRoot: string): Promise<string[]> {
  // Split into directory part and filename glob
  const lastSlash = pattern.lastIndexOf('/');
  const dir = lastSlash >= 0 ? pattern.slice(0, lastSlash) : '.';
  const fileGlob = lastSlash >= 0 ? pattern.slice(lastSlash + 1) : pattern;

  // Convert glob to regex: * matches anything except /
  const regexStr = '^' + fileGlob.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$';
  const regex = new RegExp(regexStr);

  const absDir = resolve(configRoot, dir);
  let entries: string[];
  try {
    entries = await readdir(absDir);
  } catch {
    return [];
  }

  return entries
    .filter((name) => regex.test(name))
    .sort()
    .map((name) => (dir === '.' ? name : `${dir}/${name}`));
}

/**
 * Recursively resolve $include directives in a parsed JSON object.
 * An $include directive is an object with exactly one key "$include" whose value
 * is a file path (relative to configRoot). Glob patterns are supported — they
 * expand to an array of resolved file contents.
 */
export async function resolveIncludes(
  obj: unknown,
  configRoot: string,
  visited: Set<string> = new Set(),
): Promise<unknown> {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    const results: unknown[] = [];
    for (const item of obj) {
      const resolved = await resolveIncludes(item, configRoot, visited);
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
      const matches = await expandGlob(pattern, configRoot);
      const results: unknown[] = [];
      for (const match of matches) {
        const absPath = resolve(configRoot, match);
        if (visited.has(absPath)) {
          throw new Error(`Circular $include detected: ${absPath}`);
        }
        const content = await readFile(absPath, 'utf-8');
        // For non-JSON files (like .md), return raw content as string
        if (absPath.endsWith('.json5') || absPath.endsWith('.json')) {
          const parsed = JSON5.parse(content);
          const newVisited = new Set(visited);
          newVisited.add(absPath);
          results.push(await resolveIncludes(parsed, configRoot, newVisited));
        } else {
          results.push(content.trim());
        }
      }
      return results;
    }

    // Single file include
    const includePath = resolve(configRoot, pattern);

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

    return resolveIncludes(parsed, configRoot, newVisited);
  }

  // Recurse into all values
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    result[key] = await resolveIncludes(value, configRoot, visited);
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
