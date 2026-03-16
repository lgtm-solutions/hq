export interface HQConfig {
  companies: CompanyConfig[];
}

export interface CompanyConfig {
  name: string;
  slug: string;
  description?: string;
  mission?: string;
  agents: AgentConfig[];
  projects: ProjectConfig[];
}

export interface AgentConfig {
  name: string;
  role: string;
  description?: string;
  provider: string;
  model: string;
  reportsTo: string | null;
  manages: string[];
  budget?: BudgetConfig;
  channels?: string[];
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

export interface BudgetConfig {
  monthly: number;
  currency: string;
}
