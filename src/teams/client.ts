import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js';
import type { Config } from '../utils/config.js';

export class TeamsClient {
  private client: Client;
  private credential: ClientSecretCredential;
  private config: Config;

  constructor(config: Config) {
    this.config = config;
    this.credential = new ClientSecretCredential(
      config.azure.tenantId,
      config.azure.clientId,
      config.azure.clientSecret
    );

    // Scopes basierend auf Auth Mode
    const scopes = this.getScopes();

    const authProvider = new TokenCredentialAuthenticationProvider(this.credential, {
      scopes,
    });

    this.client = Client.initWithMiddleware({
      authProvider,
    });

    console.error(`Teams Client initialisiert im "${config.auth.mode}" Modus`);
  }

  private getScopes(): string[] {
    switch (this.config.auth.mode) {
      case 'application':
        // Application Permissions: App agiert als sich selbst
        return ['https://graph.microsoft.com/.default'];

      case 'delegated':
      case 'user':
        // Delegated Permissions: App agiert im Namen eines Benutzers
        return [
          'https://graph.microsoft.com/User.Read',
          'https://graph.microsoft.com/Team.ReadBasic.All',
          'https://graph.microsoft.com/Channel.ReadBasic.All',
          'https://graph.microsoft.com/ChannelMessage.Read.All',
          'https://graph.microsoft.com/ChannelMessage.Send',
          'https://graph.microsoft.com/Group.Read.All',
          'https://graph.microsoft.com/OnlineMeetings.ReadWrite',
          'https://graph.microsoft.com/Calendars.ReadWrite',
        ];

      default:
        return ['https://graph.microsoft.com/.default'];
    }
  }

  getClient(): Client {
    return this.client;
  }

  getConfig(): Config {
    return this.config;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (this.config.auth.mode === 'application') {
        // Für Application Mode: Testen mit /users oder /organization
        await this.client.api('/organization').get();
      } else {
        // Für Delegated/User Mode: Testen mit /me
        await this.client.api('/me').get();
      }
      console.error('✓ Verbindungstest erfolgreich');
      return true;
    } catch (error) {
      console.error('✗ Verbindungstest fehlgeschlagen:', error);
      return false;
    }
  }

  async getUserInfo(): Promise<any> {
    try {
      if (this.config.auth.mode === 'user' && this.config.auth.userId) {
        // Spezifischen Benutzer abrufen
        return await this.client.api(`/users/${this.config.auth.userId}`).get();
      } else if (this.config.auth.mode === 'delegated') {
        // Aktuellen Benutzer abrufen
        return await this.client.api('/me').get();
      } else {
        // Application Mode: Keine Benutzer-Info
        return null;
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzerinformationen:', error);
      return null;
    }
  }
}
