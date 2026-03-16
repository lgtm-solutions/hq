import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { resolveIncludes } from '../include.js';

const FIXTURES = resolve(import.meta.dirname, 'fixtures');

describe('resolveIncludes', () => {
  it('passes through primitives unchanged', async () => {
    expect(await resolveIncludes('hello', FIXTURES)).toBe('hello');
    expect(await resolveIncludes(42, FIXTURES)).toBe(42);
    expect(await resolveIncludes(null, FIXTURES)).toBe(null);
    expect(await resolveIncludes(true, FIXTURES)).toBe(true);
  });

  it('passes through objects without $include unchanged', async () => {
    const obj = { name: 'test', value: 123 };
    expect(await resolveIncludes(obj, FIXTURES)).toEqual(obj);
  });

  it('resolves a simple $include', async () => {
    const obj = { $include: 'test-company/agents/bot.json5' };
    const result = await resolveIncludes(obj, FIXTURES);
    expect(result).toEqual({
      name: 'bot',
      role: 'Engineer',
      provider: 'anthropic',
      model: 'claude-sonnet-4-6',
      reportsTo: null,
      manages: [],
    });
  });

  it('resolves nested $include in arrays', async () => {
    const obj = {
      items: [
        { $include: 'test-company/agents/bot.json5' },
      ],
    };
    const result = (await resolveIncludes(obj, FIXTURES)) as { items: unknown[] };
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toHaveProperty('name', 'bot');
  });

  it('resolves recursive $include (company includes agents and projects)', async () => {
    const obj = { $include: 'test-company/company.json5' };
    const result = (await resolveIncludes(obj, FIXTURES)) as Record<string, unknown>;
    expect(result.name).toBe('Test Company');
    expect(result.agents).toHaveLength(1);
    expect(result.projects).toHaveLength(1);
  });

  it('detects circular includes', async () => {
    const obj = { $include: 'circular/a.json5' };
    await expect(resolveIncludes(obj, FIXTURES)).rejects.toThrow('Circular $include');
  });

  it('throws on missing file', async () => {
    const obj = { $include: 'nonexistent.json5' };
    await expect(resolveIncludes(obj, FIXTURES)).rejects.toThrow();
  });

  it('does not treat $include with extra keys as a directive', async () => {
    const obj = { $include: 'test-company/agents/bot.json5', extra: true };
    const result = await resolveIncludes(obj, FIXTURES);
    expect(result).toHaveProperty('$include');
    expect(result).toHaveProperty('extra');
  });
});
