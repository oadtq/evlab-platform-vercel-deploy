export interface Integration {
  name: string;
  logo: string;
  connected: boolean;
  appId?: string;
  authConfigId?: string;
  description?: string;
}

export interface ConnectionStatus {
  integration: string;
  connected: boolean;
  connectionId?: string;
  error?: string;
}

export interface AuthRequest {
  integration: string;
  redirectUrl: string | null;
  expiresAt: Date;
}

export interface ComposioTool {
  name: string;
  description: string;
  schema: any;
  execute: (params: any) => Promise<any>;
}
