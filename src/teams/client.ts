import { Client } from "@microsoft/microsoft-graph-client";
import { ClientSecretCredential, DeviceCodeCredential } from "@azure/identity";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js";

export interface TeamsConfig {
  azure: {
    clientId: string;
    clientSecret: string;
    tenantId: string;
  };
  auth: {
    mode: "application" | "delegated" | "user";
    userId?: string;
  };
  messaging: {
    addSignature: boolean;
    signatureText?: string;
    displayName?: string;
  };
}

export class TeamsClient {
  private client: Client;
  private credential: any;
  private config: TeamsConfig;

  constructor(config: TeamsConfig) {
    this.config = config;
    
    if (config.auth.mode === "application") {
      this.credential = new ClientSecretCredential(
        config.azure.tenantId,
        config.azure.clientId,
        config.azure.clientSecret
      );
    } else {
      this.credential = new DeviceCodeCredential({
        tenantId: config.azure.tenantId,
        clientId: config.azure.clientId,
        userPromptCallback: (info) => {
          console.error("\n=== DEVICE LOGIN REQUIRED ===");
          console.error("URL:", info.verificationUri);
          console.error("Code:", info.userCode);
          console.error("=============================\n");
        },
      });
    }

    const scopes = this.getScopes();
    const authProvider = new TokenCredentialAuthenticationProvider(this.credential, { scopes });

    this.client = Client.initWithMiddleware({ authProvider });
    console.error(`Teams Client initialisiert im "${config.auth.mode}" Modus`);
  }

  private getScopes(): string[] {
    if (this.config.auth.mode === "application") {
      return ["https://graph.microsoft.com/.default"];
    }
    return [
      "https://graph.microsoft.com/User.Read",
      "https://graph.microsoft.com/Team.ReadBasic.All",
      "https://graph.microsoft.com/Channel.ReadBasic.All",
      "https://graph.microsoft.com/ChannelMessage.Read.All",
      "https://graph.microsoft.com/ChannelMessage.Send",
      "https://graph.microsoft.com/Chat.Read",
      "https://graph.microsoft.com/Chat.ReadWrite",
      "https://graph.microsoft.com/ChatMessage.Send",
      "https://graph.microsoft.com/Chat.Create",
      "https://graph.microsoft.com/Group.Read.All",
      "https://graph.microsoft.com/Files.ReadWrite",
      "https://graph.microsoft.com/OnlineMeetings.ReadWrite",
      "https://graph.microsoft.com/Calendars.ReadWrite",
    ];
  }

  getClient(): Client { return this.client; }
  getConfig(): TeamsConfig { return this.config; }

  async testConnection(): Promise<boolean> {
    try {
      if (this.config.auth.mode === "application") {
        await this.client.api("/organization").get();
      } else {
        await this.client.api("/me").get();
      }
      console.error("✓ Verbindungstest erfolgreich");
      return true;
    } catch (error) {
      console.error("✗ Verbindungstest fehlgeschlagen:", error);
      return false;
    }
  }
}
