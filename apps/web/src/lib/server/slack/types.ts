export type SlackAppStatus = 'not_created' | 'created' | 'installed' | 'connected';

export interface ManifestCreateResponse {
  ok: boolean;
  error?: string;
  errors?: Array<{ message: string; pointer: string }>;
  app_id?: string;
  credentials?: {
    client_id: string;
    client_secret: string;
    verification_token: string;
    signing_secret: string;
  };
  oauth_authorize_url?: string;
}

export interface ManifestDeleteResponse {
  ok: boolean;
  error?: string;
}

export interface TokenRotateResponse {
  ok: boolean;
  error?: string;
  token?: string;
  refresh_token?: string;
  exp?: number;
}

export interface AgentSlackInfo {
  name: string;
  role: string;
  companySlug: string;
  status: SlackAppStatus;
  workspace?: string;
  defaultChannel?: string;
  channels: string[];
  appId?: string;
  hasAppToken: boolean;
  hasBotToken: boolean;
}
