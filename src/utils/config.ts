import dotenv from 'dotenv';

dotenv.config();

export type AuthMode = 'application' | 'delegated' | 'user';

export interface Config {
  azure: {
    clientId: string;
    clientSecret: string;
    tenantId: string;
  };
  auth: {
    mode: AuthMode;
    userId?: string; // Nur für 'user' mode
  };
  messaging: {
    addSignature: boolean;
    signatureText?: string;
    displayName?: string;
  };
  bot?: {
    id: string;
    password: string;
  };
}

export function loadConfig(): Config {
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;
  const tenantId = process.env.AZURE_TENANT_ID;

  if (!clientId || !clientSecret || !tenantId) {
    throw new Error(
      'Missing required environment variables: AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID'
    );
  }

  // Auth Mode bestimmen
  const authMode = (process.env.AUTH_MODE || 'application') as AuthMode;
  const userId = process.env.AUTH_USER_ID;

  // Messaging-Konfiguration
  const addSignature = process.env.MESSAGE_ADD_SIGNATURE === 'true';
  const signatureText = process.env.MESSAGE_SIGNATURE;
  const displayName = process.env.BOT_DISPLAY_NAME;

  const config: Config = {
    azure: {
      clientId,
      clientSecret,
      tenantId,
    },
    auth: {
      mode: authMode,
      userId,
    },
    messaging: {
      addSignature,
      signatureText,
      displayName,
    },
  };

  // Optional Bot-Konfiguration
  if (process.env.BOT_ID && process.env.BOT_PASSWORD) {
    config.bot = {
      id: process.env.BOT_ID,
      password: process.env.BOT_PASSWORD,
    };
  }

  return config;
}

export function validateConfig(config: Config): void {
  if (!config.azure.clientId || !config.azure.clientSecret || !config.azure.tenantId) {
    throw new Error('Invalid configuration: Azure credentials are required');
  }

  // Validierung für user mode
  if (config.auth.mode === 'user' && !config.auth.userId) {
    throw new Error('AUTH_USER_ID is required when AUTH_MODE is set to "user"');
  }

  // Validierung für Auth Mode
  const validModes: AuthMode[] = ['application', 'delegated', 'user'];
  if (!validModes.includes(config.auth.mode)) {
    throw new Error(
      `Invalid AUTH_MODE: ${config.auth.mode}. Must be one of: ${validModes.join(', ')}`
    );
  }
}

export function getConfigSummary(config: Config): string {
  const lines = [
    '=== Teams MCP Server Konfiguration ===',
    `Auth Mode: ${config.auth.mode}`,
    `Tenant ID: ${config.azure.tenantId}`,
    `Client ID: ${config.azure.clientId}`,
  ];

  if (config.auth.userId) {
    lines.push(`User ID: ${config.auth.userId}`);
  }

  if (config.messaging.addSignature) {
    lines.push(`Signatur: Aktiv`);
    if (config.messaging.signatureText) {
      lines.push(`Signaturtext: "${config.messaging.signatureText}"`);
    }
  }

  if (config.messaging.displayName) {
    lines.push(`Display Name: "${config.messaging.displayName}"`);
  }

  lines.push('=====================================');

  return lines.join('\n');
}
