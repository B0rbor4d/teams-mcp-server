import type { Client } from '@microsoft/microsoft-graph-client';
import type { Config } from '../utils/config.js';

export interface Message {
  id: string;
  content: string;
  from: string;
  createdDateTime: string;
  channelId: string;
  teamId: string;
  reactions?: Reaction[];
}

export interface Reaction {
  reactionType: string; // like, heart, laugh, surprised, sad, angry
  user: string;
  createdDateTime: string;
}

export interface AdaptiveCard {
  type: 'AdaptiveCard';
  version: string;
  body: any[];
  actions?: any[];
}

export class MessageService {
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

  async readMessages(
    teamId: string,
    channelId: string,
    limit: number = 20
  ): Promise<Message[]> {
    try {
      const response = await this.client
        .api(`/teams/${teamId}/channels/${channelId}/messages`)
        .top(limit)
        .orderby('createdDateTime DESC')
        .get();

      return response.value.map((msg: any) => ({
        id: msg.id,
        content: msg.body?.content || '',
        from: msg.from?.user?.displayName || 'Unknown',
        createdDateTime: msg.createdDateTime,
        channelId: channelId,
        teamId: teamId,
      }));
    } catch (error) {
      console.error('Error reading messages:', error);
      throw new Error(`Failed to read messages: ${error}`);
    }
  }

  async sendMessage(
    teamId: string,
    channelId: string,
    content: string
  ): Promise<Message> {
    try {
      // Signatur hinzufügen, falls konfiguriert
      const finalContent = this.addSignatureToMessage(content);

      const chatMessage = {
        body: {
          content: finalContent,
          contentType: 'text',
        },
      };

      const response = await this.client
        .api(`/teams/${teamId}/channels/${channelId}/messages`)
        .post(chatMessage);

      return {
        id: response.id,
        content: response.body?.content || finalContent,
        from: response.from?.user?.displayName || this.config.messaging.displayName || 'Me',
        createdDateTime: response.createdDateTime,
        channelId: channelId,
        teamId: teamId,
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error(`Failed to send message: ${error}`);
    }
  }

  async replyToMessage(
    teamId: string,
    channelId: string,
    messageId: string,
    content: string
  ): Promise<Message> {
    try {
      // Signatur hinzufügen, falls konfiguriert
      const finalContent = this.addSignatureToMessage(content);

      const chatMessage = {
        body: {
          content: finalContent,
          contentType: 'text',
        },
      };

      const response = await this.client
        .api(`/teams/${teamId}/channels/${channelId}/messages/${messageId}/replies`)
        .post(chatMessage);

      return {
        id: response.id,
        content: response.body?.content || finalContent,
        from: response.from?.user?.displayName || this.config.messaging.displayName || 'Me',
        createdDateTime: response.createdDateTime,
        channelId: channelId,
        teamId: teamId,
      };
    } catch (error) {
      console.error('Error replying to message:', error);
      throw new Error(`Failed to reply to message: ${error}`);
    }
  }

  /**
   * Bearbeitet eine existierende Nachricht
   * Hinweis: Nur eigene Nachrichten können bearbeitet werden
   */
  async editMessage(
    teamId: string,
    channelId: string,
    messageId: string,
    newContent: string
  ): Promise<Message> {
    try {
      const finalContent = this.addSignatureToMessage(newContent);

      const updateData = {
        body: {
          content: finalContent,
          contentType: 'text',
        },
      };

      const response = await this.client
        .api(`/teams/${teamId}/channels/${channelId}/messages/${messageId}`)
        .patch(updateData);

      return {
        id: response.id,
        content: response.body?.content || finalContent,
        from: response.from?.user?.displayName || 'Me',
        createdDateTime: response.createdDateTime,
        channelId: channelId,
        teamId: teamId,
      };
    } catch (error) {
      console.error('Error editing message:', error);
      throw new Error(`Failed to edit message: ${error}`);
    }
  }

  /**
   * Löscht eine Nachricht (Soft Delete)
   * Hinweis: Nur eigene Nachrichten oder als Team-Owner möglich
   */
  async deleteMessage(
    teamId: string,
    channelId: string,
    messageId: string
  ): Promise<void> {
    try {
      await this.client
        .api(`/teams/${teamId}/channels/${channelId}/messages/${messageId}/softDelete`)
        .post({});
    } catch (error) {
      console.error('Error deleting message:', error);
      throw new Error(`Failed to delete message: ${error}`);
    }
  }

  /**
   * Fügt eine Reaktion zu einer Nachricht hinzu
   */
  async addReaction(
    teamId: string,
    channelId: string,
    messageId: string,
    reactionType: 'like' | 'heart' | 'laugh' | 'surprised' | 'sad' | 'angry'
  ): Promise<void> {
    try {
      const reactionData = {
        reactionType: reactionType,
      };

      await this.client
        .api(`/teams/${teamId}/channels/${channelId}/messages/${messageId}/setReaction`)
        .post(reactionData);
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw new Error(`Failed to add reaction: ${error}`);
    }
  }

  /**
   * Entfernt eine Reaktion von einer Nachricht
   */
  async removeReaction(
    teamId: string,
    channelId: string,
    messageId: string,
    reactionType: 'like' | 'heart' | 'laugh' | 'surprised' | 'sad' | 'angry'
  ): Promise<void> {
    try {
      const reactionData = {
        reactionType: reactionType,
      };

      await this.client
        .api(`/teams/${teamId}/channels/${channelId}/messages/${messageId}/unsetReaction`)
        .post(reactionData);
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw new Error(`Failed to remove reaction: ${error}`);
    }
  }

  /**
   * Sendet eine Adaptive Card in einen Kanal
   */
  async sendAdaptiveCard(
    teamId: string,
    channelId: string,
    card: AdaptiveCard | string
  ): Promise<Message> {
    try {
      const cardContent = typeof card === 'string' ? card : JSON.stringify(card);

      const chatMessage = {
        body: {
          contentType: 'html',
          content: `<attachment id="adaptive-card"></attachment>`,
        },
        attachments: [
          {
            id: 'adaptive-card',
            contentType: 'application/vnd.microsoft.card.adaptive',
            content: cardContent,
          },
        ],
      };

      const response = await this.client
        .api(`/teams/${teamId}/channels/${channelId}/messages`)
        .post(chatMessage);

      return {
        id: response.id,
        content: 'Adaptive Card',
        from: response.from?.user?.displayName || this.config.messaging.displayName || 'Me',
        createdDateTime: response.createdDateTime,
        channelId: channelId,
        teamId: teamId,
      };
    } catch (error) {
      console.error('Error sending adaptive card:', error);
      throw new Error(`Failed to send adaptive card: ${error}`);
    }
  }

  /**
   * Erstellt eine einfache Adaptive Card
   */
  createSimpleAdaptiveCard(
    title: string,
    text: string,
    actions?: Array<{ type: string; title: string; url?: string }>
  ): AdaptiveCard {
    const card: AdaptiveCard = {
      type: 'AdaptiveCard',
      version: '1.4',
      body: [
        {
          type: 'TextBlock',
          text: title,
          weight: 'bolder',
          size: 'large',
          wrap: true,
        },
        {
          type: 'TextBlock',
          text: text,
          wrap: true,
        },
      ],
    };

    if (actions && actions.length > 0) {
      card.actions = actions.map((action) => ({
        type: 'Action.OpenUrl',
        title: action.title,
        url: action.url || '#',
      }));
    }

    return card;
  }

  /**
   * Holt alle Reaktionen einer Nachricht
   */
  async getMessageReactions(
    teamId: string,
    channelId: string,
    messageId: string
  ): Promise<Reaction[]> {
    try {
      // Nachricht mit Reaktionen abrufen
      const response = await this.client
        .api(`/teams/${teamId}/channels/${channelId}/messages/${messageId}`)
        .expand('reactions')
        .get();

      if (!response.reactions || response.reactions.length === 0) {
        return [];
      }

      return response.reactions.map((reaction: any) => ({
        reactionType: reaction.reactionType,
        user: reaction.user?.user?.displayName || 'Unknown',
        createdDateTime: reaction.createdDateTime,
      }));
    } catch (error) {
      console.error('Error getting message reactions:', error);
      throw new Error(`Failed to get message reactions: ${error}`);
    }
  }

  /**
   * Sendet eine Rich-Text-Nachricht mit HTML-Formatierung
   */
  async sendRichMessage(
    teamId: string,
    channelId: string,
    htmlContent: string
  ): Promise<Message> {
    try {
      const chatMessage = {
        body: {
          content: htmlContent,
          contentType: 'html',
        },
      };

      const response = await this.client
        .api(`/teams/${teamId}/channels/${channelId}/messages`)
        .post(chatMessage);

      return {
        id: response.id,
        content: response.body?.content || htmlContent,
        from: response.from?.user?.displayName || this.config.messaging.displayName || 'Me',
        createdDateTime: response.createdDateTime,
        channelId: channelId,
        teamId: teamId,
      };
    } catch (error) {
      console.error('Error sending rich message:', error);
      throw new Error(`Failed to send rich message: ${error}`);
    }
  }
}
