import { describe, it, expect } from 'vitest';
import { validateConfig, ConfigValidationError } from '../validate.js';

describe('validateConfig', () => {
  it('passes valid config', () => {
    const config = {
      companies: [
        {
          name: 'Test',
          slug: 'test',
          agents: [{ name: 'bot', role: 'Eng', provider: 'anthropic', model: 'claude', reportsTo: null, manages: [] }],
          projects: [{ name: 'App', slug: 'app' }],
        },
      ],
    };
    expect(() => validateConfig(config)).not.toThrow();
  });

  it('rejects missing companies array', () => {
    expect(() => validateConfig({})).toThrow(ConfigValidationError);
    expect(() => validateConfig({ companies: 'bad' })).toThrow(ConfigValidationError);
  });

  it('rejects company without name', () => {
    const config = {
      companies: [{ slug: 'test', agents: [{ name: 'bot', role: 'Eng', provider: 'a', model: 'b', reportsTo: null, manages: [] }], projects: [] }],
    };
    expect(() => validateConfig(config)).toThrow('name is required');
  });

  it('rejects invalid slug', () => {
    const config = {
      companies: [{ name: 'Test', slug: 'BAD SLUG', agents: [{ name: 'bot', role: 'Eng', provider: 'a', model: 'b', reportsTo: null, manages: [] }], projects: [] }],
    };
    expect(() => validateConfig(config)).toThrow('invalid');
  });

  it('rejects company with no agents', () => {
    const config = {
      companies: [{ name: 'Test', slug: 'test', agents: [], projects: [] }],
    };
    expect(() => validateConfig(config)).toThrow('at least one agent');
  });

  it('rejects agent without role', () => {
    const config = {
      companies: [{ name: 'Test', slug: 'test', agents: [{ name: 'bot', provider: 'a', model: 'b', reportsTo: null, manages: [] }], projects: [] }],
    };
    expect(() => validateConfig(config)).toThrow('missing role');
  });

  it('rejects agent without provider', () => {
    const config = {
      companies: [{ name: 'Test', slug: 'test', agents: [{ name: 'bot', role: 'Eng', model: 'b', reportsTo: null, manages: [] }], projects: [] }],
    };
    expect(() => validateConfig(config)).toThrow('missing provider');
  });

  it('rejects project with invalid slug', () => {
    const config = {
      companies: [{
        name: 'Test', slug: 'test',
        agents: [{ name: 'bot', role: 'Eng', provider: 'a', model: 'b', reportsTo: null, manages: [] }],
        projects: [{ name: 'App', slug: 'BAD!' }],
      }],
    };
    expect(() => validateConfig(config)).toThrow('invalid');
  });
});
