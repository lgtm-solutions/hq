export interface HQConfig {
  companies: CompanyConfig[];
}

export interface CompanyConfig {
  name: string;
  slug: string;
  description?: string;
  mission?: string;
  integrations?: IntegrationsConfig;
  agents: AgentConfig[];
  projects: ProjectConfig[];
}

export interface IntegrationsConfig {
  slack?: SlackIntegrationConfig;
  // Future: discord, telegram, etc.
}

export interface SlackIntegrationConfig {
  workspace?: string;
  defaultChannel?: string;
  channels?: string[];
}

export interface AgentConfig {
  name: string;
  role: string;
  description?: string;
  provider: string;
  model: string;
  reportsTo: string | null;
  manages: string[];
  integrations?: IntegrationsConfig;
  systemPrompt?: string | (string | { $include: string })[];
}

export interface ProjectConfig {
  name: string;
  slug: string;
  description?: string;
  git?: string;
  agents?: string[];
  channels?: string[];
  metadata?: Record<string, unknown>;
}

export interface SecretsConfig {
  providers: Record<string, { apiKey: string }>;
  database: { url: string };
  integrations?: Record<string, Record<string, string>>;
}
