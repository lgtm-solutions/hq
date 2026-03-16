import type { HQConfig, CompanyConfig, AgentConfig, ProjectConfig } from './types.js';

export class ConfigValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validateSlug(slug: string, context: string): void {
  if (!slug) {
    throw new ConfigValidationError(`${context}: slug is required`);
  }
  if (!SLUG_RE.test(slug)) {
    throw new ConfigValidationError(
      `${context}: slug "${slug}" is invalid (must be lowercase alphanumeric with hyphens)`,
    );
  }
}

function validateAgent(agent: AgentConfig, context: string): void {
  if (!agent.name) {
    throw new ConfigValidationError(`${context}: agent name is required`);
  }
  if (!agent.role) {
    throw new ConfigValidationError(`${context}: agent "${agent.name}" is missing role`);
  }
  if (!agent.provider) {
    throw new ConfigValidationError(`${context}: agent "${agent.name}" is missing provider`);
  }
  if (!agent.model) {
    throw new ConfigValidationError(`${context}: agent "${agent.name}" is missing model`);
  }
}

function validateProject(project: ProjectConfig, context: string): void {
  if (!project.name) {
    throw new ConfigValidationError(`${context}: project name is required`);
  }
  validateSlug(project.slug, `${context} project "${project.name}"`);
}

function validateCompany(company: CompanyConfig, index: number): void {
  const ctx = `companies[${index}]`;
  if (!company.name) {
    throw new ConfigValidationError(`${ctx}: name is required`);
  }
  validateSlug(company.slug, ctx);

  if (!Array.isArray(company.agents) || company.agents.length === 0) {
    throw new ConfigValidationError(`${ctx} "${company.name}": must have at least one agent`);
  }
  company.agents.forEach((agent, i) => validateAgent(agent, `${ctx}.agents[${i}]`));

  if (!Array.isArray(company.projects)) {
    throw new ConfigValidationError(`${ctx} "${company.name}": projects must be an array`);
  }
  company.projects.forEach((project, i) => validateProject(project, `${ctx}.projects[${i}]`));
}

export function validateConfig(config: unknown): asserts config is HQConfig {
  const c = config as HQConfig;
  if (!c || !Array.isArray(c.companies)) {
    throw new ConfigValidationError('Config must have a "companies" array');
  }
  c.companies.forEach((company, i) => validateCompany(company, i));
}
