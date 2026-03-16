import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import JSON5 from 'json5';

/**
 * Recursively resolve $include directives in a parsed JSON object.
 * An $include directive is an object with exactly one key "$include" whose value
 * is a file path (relative to configRoot).
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
    return Promise.all(obj.map((item) => resolveIncludes(item, configRoot, visited)));
  }

  const record = obj as Record<string, unknown>;

  // Check if this is an $include directive
  if ('$include' in record && typeof record.$include === 'string' && Object.keys(record).length === 1) {
    const includePath = resolve(configRoot, record.$include);

    if (visited.has(includePath)) {
      throw new Error(`Circular $include detected: ${includePath}`);
    }

    const content = await readFile(includePath, 'utf-8');
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
