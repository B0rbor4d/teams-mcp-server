import type { Client } from '@microsoft/microsoft-graph-client';
import type { Config } from '../utils/config.js';

export interface Chat {
  id: string;
  chatType: string; // 'oneOnOne' | 'group' | 'meeting'
  topic?: string;
  members: string[];
  lastMessagePreview?: string;
  lastMessageDateTime?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  from: string;
  createdDateTime: string;
  chatId: string;
}

export class ChatsService {
  private config: Config;

  constructor(private client: Client, config: Config) {
    this.config = config;
  }

  /**
   * Fügt eine Signatur zur Nachricht hinzu, falls konfiguriert
   */
  private addSignatureToMessage(content: string): string {
    if (!this.config.messaging.addSignature) {
      return content;
    }

    const signature = this.config.messaging.signatureText ||
      '\n\n---\n🤖 Gesendet via Teams MCP Server';

    return `${content}${signature}`;
  }

  /**
   * Listet alle Chats des Benutzers auf
   */
  async listChats(): Promise<Chat[]> {
    try {
      const response = await this.client
        .api('/me/chats')
        .expand('members')
        .top(50)
        .orderby('lastMessageDateTime desc')
        .get();

      return response.value.map((chat: any) => ({
        id: chat.id,
        chatType: chat.chatType,
        topic: chat.topic,
        members: chat.members?.map((m: any) => m.displayName || 'Unknown') || [],
        lastMessagePreview: chat.lastMessagePreview?.content,
        lastMessageDateTime: chat.lastMessageDateTime,
      }));
    } catch (error) {
      console.error('Error listing chats:', error);
      throw new Error(`Failed to list chats: ${error}`);
    }
  }

  /**
   * Liest Nachrichten aus einem Chat
   */
  async readChatMessages(chatId: string, limit: number = 20): Promise<ChatMessage[]> {
    try {
      const response = await this.client
        .api(`/chats/${chatId}/messages`)
        .top(limit)
        .orderby('createdDateTime DESC')
        .get();

      return response.value.map((msg: any) => ({
        id: msg.id,
        content: msg.body?.content || '',
        from: msg.from?.user?.displayName || 'Unknown',
        createdDateTime: msg.createdDateTime,
        chatId: chatId,
      }));
    } catch (error) {
      console.error('Error reading chat messages:', error);
      throw new Error(`Failed to read chat messages: ${error}`);
    }
  }

  /**
   * Sendet eine Nachricht in einen Chat
   */
  async sendChatMessage(chatId: string, content: string): Promise<ChatMessage> {
    try {
      const finalContent = this.addSignatureToMessage(content);

      const chatMessage = {
        body: {
          content: finalContent,
          contentType: 'text',
        },
      };

      const response = await this.client
        .api(`/chats/${chatId}/messages`)
        .post(chatMessage);

      return {
        id: response.id,
        content: response.body?.content || finalContent,
        from: response.from?.user?.displayName || this.config.messaging.displayName || 'Me',
        createdDateTime: response.createdDateTime,
        chatId: chatId,
      };
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw new Error(`Failed to send chat message: ${error}`);
    }
  }

  /**
   * Erstellt einen neuen 1:1 Chat mit einem Benutzer
   */
  async createOneOnOneChat(userEmail: string): Promise<Chat> {
    try {
      // Zuerst Benutzer-ID aus E-Mail ermitteln
      const userResponse = await this.client
        .api(`/users/${userEmail}`)
        .select('id,displayName')
        .get();

      const userId = userResponse.id;
      const displayName = userResponse.displayName;

      // Chat erstellen
      const chatData = {
        chatType: 'oneOnOne',
        members: [
          {
            '@odata.type': '#microsoft.graph.aadUserConversationMember',
            roles: ['owner'],
            'user@odata.bind': `https://graph.microsoft.com/v1.0/users('${userId}')`,
          },
        ],
      };

      const response = await this.client
        .api('/chats')
        .post(chatData);

      return {
        id: response.id,
        chatType: response.chatType,
        topic: response.topic,
        members: [displayName],
      };
    } catch (error) {
      console.error('Error creating 1:1 chat:', error);
      throw new Error(`Failed to create 1:1 chat: ${error}`);
    }
  }

  /**
   * Erstellt einen Gruppen-Chat
   */
  async createGroupChat(topic: string, memberEmails: string[]): Promise<Chat> {
    try {
      // Benutzer-IDs aus E-Mails ermitteln
      const members = [];
      const displayNames = [];

      for (const email of memberEmails) {
        const userResponse = await this.client
          .api(`/users/${email}`)
          .select('id,displayName')
          .get();

        members.push({
          '@odata.type': '#microsoft.graph.aadUserConversationMember',
          roles: ['owner'],
          'user@odata.bind': `https://graph.microsoft.com/v1.0/users('${userResponse.id}')`,
        });

        displayNames.push(userResponse.displayName);
      }

      // Chat erstellen
      const chatData = {
        chatType: 'group',
        topic: topic,
        members: members,
      };

      const response = await this.client
        .api('/chats')
        .post(chatData);

      return {
        id: response.id,
        chatType: response.chatType,
        topic: response.topic,
        members: displayNames,
      };
    } catch (error) {
      console.error('Error creating group chat:', error);
      throw new Error(`Failed to create group chat: ${error}`);
    }
  }

  /**
   * Sucht einen existierenden 1:1 Chat mit einem Benutzer
   */
  async findOneOnOneChatByEmail(userEmail: string): Promise<Chat | null> {
    try {
      const chats = await this.listChats();

      // Nach oneOnOne Chat mit dem Benutzer suchen
      for (const chat of chats) {
        if (chat.chatType === 'oneOnOne') {
          // Chat-Details mit Mitgliedern abrufen
          const chatDetails = await this.client
            .api(`/chats/${chat.id}`)
            .expand('members')
            .get();

          const members = chatDetails.members || [];
          const hasUser = members.some((m: any) =>
            m.email?.toLowerCase() === userEmail.toLowerCase()
          );

          if (hasUser) {
            return chat;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error finding 1:1 chat:', error);
      return null;
    }
  }
}
