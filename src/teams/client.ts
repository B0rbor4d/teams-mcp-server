import { Client } from "@microsoft/microsoft-graph-client";
import { ClientSecretCredential, DeviceCodeCredential } from "@azure/identity";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js";
import * as fs from "fs";
import * as path from "path";

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

// Token Cache Helper
const TOKEN_CACHE_PATH = "/app/cache/token-cache.json";

function loadTokenCache(): any {
  try {
    if (fs.existsSync(TOKEN_CACHE_PATH)) {
      return JSON.parse(fs.readFileSync(TOKEN_CACHE_PATH, "utf-8"));
    }
  } catch (e) {}
  return null;
}

function saveTokenCache(cache: any): void {
  try {
    const dir = path.dirname(TOKEN_CACHE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TOKEN_CACHE_PATH, JSON.stringify(cache, null, 2));
    console.error("✓ Token Cache gespeichert");
  } catch (e) {
    console.error("✗ Token Cache Speicherung fehlgeschlagen:", e);
  }
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
      // Prüfe ob wir bereits einen gespeicherten Token haben
      const cachedToken = loadTokenCache();
      
      if (cachedToken && cachedToken.refreshToken) {
        console.error("✓ Vorhandener Token Cache gefunden");
      }
      
      this.credential = new DeviceCodeCredential({
        tenantId: config.azure.tenantId,
        clientId: config.azure.clientId,
        userPromptCallback: (info) => {
          console.error("\n=== DEVICE LOGIN REQUIRED ===");
          console.error("URL:", info.verificationUri);
          console.error("Code:", info.userCode);
          console.error("Expires in:", info.message.match(/expires?\s+in\s+([\d\s]+minutes?)/i)?.[1] || "15 minutes");
          console.error("=============================\n");
          
          // Speichere Device Code Info für spätere Verwendung
          saveTokenCache({
            deviceCode: info.userCode,
            verificationUri: info.verificationUri,
            timestamp: new Date().toISOString(),
          });
        },
      });
      
      console.error(`Token Cache: ${TOKEN_CACHE_PATH}`);
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
