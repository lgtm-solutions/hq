import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import JSON5 from 'json5';
import type { AgentConfig, ProjectConfig } from './types.js';

/**
 * Serialize an object to pretty JSON5 (unquoted keys, trailing commas).
 */
function toJson5(obj: unknown): string {
  return JSON5.stringify(obj, null, 2) + '\n';
}

/**
 * Read and parse a JSON5 file, returning the raw object.
 */
async function readJson5(path: string): Promise<any> {
  const raw = await readFile(path, 'utf-8');
  return JSON5.parse(raw);
}

/**
 * Write an object as JSON5 to a file, creating dirs if needed.
 */
async function writeJson5(path: string, data: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, toJson5(data), 'utf-8');
}

// ─── Companies ───

export async function createCompany(
  configDir: string,
  data: { name: string; slug: string; description?: string; mission?: string }
): Promise<void> {
  const companyDir = resolve(configDir, data.slug);
  await mkdir(resolve(companyDir, 'agents'), { recursive: true });
  await mkdir(resolve(companyDir, 'projects'), { recursive: true });

  // Write company.json5
  await writeJson5(resolve(companyDir, 'company.json5'), {
    name: data.name,
    slug: data.slug,
    description: data.description || '',
    mission: data.mission || '',
    agents: [],
    projects: [],
  });

  // Add $include to companies.json5
  const companiesPath = resolve(configDir, 'companies.json5');
  const config = await readJson5(companiesPath);
  config.companies.push({ $include: `${data.slug}/company.json5` });
  await writeJson5(companiesPath, config);
}

export async function updateCompany(
  configDir: string,
  slug: string,
  data: { name?: string; description?: string; mission?: string }
): Promise<void> {
  const companyPath = resolve(configDir, slug, 'company.json5');
  const company = await readJson5(companyPath);

  if (data.name !== undefined) company.name = data.name;
  if (data.description !== undefined) company.description = data.description;
  if (data.mission !== undefined) company.mission = data.mission;

  await writeJson5(companyPath, company);
}

export async function deleteCompany(configDir: string, slug: string): Promise<void> {
  // Remove company directory
  await rm(resolve(configDir, slug), { recursive: true, force: true });

  // Remove $include from companies.json5
  const companiesPath = resolve(configDir, 'companies.json5');
  const config = await readJson5(companiesPath);
  config.companies = config.companies.filter(
    (entry: any) => !entry.$include?.startsWith(`${slug}/`)
  );
  await writeJson5(companiesPath, config);
}

// ─── Agents ───

export async function createAgent(
  configDir: string,
  companySlug: string,
  data: AgentConfig
): Promise<void> {
  // Write agent file
  const agentPath = resolve(configDir, companySlug, 'agents', `${data.name}.json5`);
  const { ...agentData } = data;
  await writeJson5(agentPath, agentData);

  // Add $include to company.json5
  const companyPath = resolve(configDir, companySlug, 'company.json5');
  const company = await readJson5(companyPath);
  company.agents.push({ $include: `${companySlug}/agents/${data.name}.json5` });
  await writeJson5(companyPath, company);
}

export async function updateAgent(
  configDir: string,
  companySlug: string,
  agentName: string,
  data: Partial<AgentConfig>
): Promise<void> {
  const agentPath = resolve(configDir, companySlug, 'agents', `${agentName}.json5`);
  const agent = await readJson5(agentPath);

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) agent[key] = value;
  }

  await writeJson5(agentPath, agent);
}

export async function deleteAgent(
  configDir: string,
  companySlug: string,
  agentName: string
): Promise<void> {
  // Remove agent file
  const agentPath = resolve(configDir, companySlug, 'agents', `${agentName}.json5`);
  await rm(agentPath, { force: true });

  // Remove $include from company.json5
  const companyPath = resolve(configDir, companySlug, 'company.json5');
  const company = await readJson5(companyPath);
  company.agents = company.agents.filter(
    (entry: any) => !entry.$include?.endsWith(`/${agentName}.json5`)
  );
  await writeJson5(companyPath, company);
}

// ─── Projects ───

export async function createProject(
  configDir: string,
  companySlug: string,
  data: ProjectConfig
): Promise<void> {
  // Write project file
  const projectPath = resolve(configDir, companySlug, 'projects', `${data.slug}.json5`);
  await writeJson5(projectPath, data);

  // Add $include to company.json5
  const companyPath = resolve(configDir, companySlug, 'company.json5');
  const company = await readJson5(companyPath);
  company.projects.push({ $include: `${companySlug}/projects/${data.slug}.json5` });
  await writeJson5(companyPath, company);
}

export async function updateProject(
  configDir: string,
  companySlug: string,
  projectSlug: string,
  data: Partial<ProjectConfig>
): Promise<void> {
  const projectPath = resolve(configDir, companySlug, 'projects', `${projectSlug}.json5`);
  const project = await readJson5(projectPath);

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) project[key] = value;
  }

  await writeJson5(projectPath, project);
}

export async function deleteProject(
  configDir: string,
  companySlug: string,
  projectSlug: string
): Promise<void> {
  // Remove project file
  const projectPath = resolve(configDir, companySlug, 'projects', `${projectSlug}.json5`);
  await rm(projectPath, { force: true });

  // Remove $include from company.json5
  const companyPath = resolve(configDir, companySlug, 'company.json5');
  const company = await readJson5(companyPath);
  company.projects = company.projects.filter(
    (entry: any) => !entry.$include?.endsWith(`/${projectSlug}.json5`)
  );
  await writeJson5(companyPath, company);
}
