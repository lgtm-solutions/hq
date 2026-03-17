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
  slackAppToken?: string;
  slackBotToken?: string;
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

/**
 * A config value can be a plain string or an object describing how to load it.
 *
 * Examples:
 *   "sk-ant-abc123"                                              — plain value
 *   { type: "env", key: "DATABASE_URL" }                         — read from environment variable
 *   { type: "file", path: "./secrets.json", key: "database_url"} — read a key from a JSON/JSON5 file
 *   { type: "file", path: "/run/secrets/db" }                    — read entire file as value
 */
export type ConfigValue =
  | string
  | { type: 'env'; key: string }
  | { type: 'file'; path: string; key?: string };

/**
 * Secrets are a flat key-value map. Each value is either a plain string
 * or a ConfigValue describing how to load it. After resolution, all
 * values become plain strings.
 */
export type SecretsConfig = Record<string, string>;

/**
 * Raw secrets before resolution — values can be ConfigValue objects.
 */
export type RawSecretsConfig = Record<string, ConfigValue>;
