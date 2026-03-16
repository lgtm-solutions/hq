import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { loadConfig, loadSecrets } from '../loader.js';

const FIXTURES = resolve(import.meta.dirname, 'fixtures');
const EXAMPLES = resolve(import.meta.dirname, '../../../../examples');

describe('loadConfig', () => {
  it('loads the test fixtures correctly', async () => {
    const config = await loadConfig(FIXTURES);
    expect(config.companies).toHaveLength(1);

    const company = config.companies[0];
    expect(company.name).toBe('Test Company');
    expect(company.slug).toBe('test-company');
    expect(company.agents).toHaveLength(1);
    expect(company.agents[0].name).toBe('bot');
    expect(company.projects).toHaveLength(1);
    expect(company.projects[0].slug).toBe('test-app');
  });

  it('loads the examples/ directory with acme-corp', async () => {
    const config = await loadConfig(EXAMPLES);
    expect(config.companies).toHaveLength(1);

    const acme = config.companies[0];
    expect(acme.name).toBe('Acme Corp');
    expect(acme.slug).toBe('acme-corp');
    expect(acme.agents).toHaveLength(3);
    expect(acme.projects).toHaveLength(1);

    const agentNames = acme.agents.map((a) => a.name);
    expect(agentNames).toContain('ceo');
    expect(agentNames).toContain('cto');
    expect(agentNames).toContain('fullstack-dev');
  });
});

describe('loadSecrets', () => {
  it('loads secrets from fixtures', async () => {
    const secrets = await loadSecrets(FIXTURES);
    expect(secrets).not.toBeNull();
    expect(secrets!.providers.anthropic.apiKey).toBe('sk-test-123');
    expect(secrets!.database.url).toBe('postgresql://localhost:5432/test');
  });

  it('returns null for missing secrets file', async () => {
    const secrets = await loadSecrets(resolve(FIXTURES, 'nonexistent'));
    expect(secrets).toBeNull();
  });
});
