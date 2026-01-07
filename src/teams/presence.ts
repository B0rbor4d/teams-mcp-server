import type { Client } from '@microsoft/microsoft-graph-client';

export interface Presence {
  userId: string;
  userEmail?: string;
  userName?: string;
  availability: string; // Available, Busy, DoNotDisturb, BeRightBack, Away, Offline
  activity: string; // Available, InACall, InAMeeting, Busy, Away, etc.
  statusMessage?: string;
}

export class PresenceService {
  constructor(private client: Client) {}

  /**
   * Holt den Anwesenheitsstatus eines Benutzers per E-Mail
   */
  async getUserPresenceByEmail(userEmail: string): Promise<Presence> {
    try {
      // Zuerst Benutzer-ID aus E-Mail ermitteln
      const userResponse = await this.client
        .api(`/users/${userEmail}`)
        .select('id,displayName,mail')
        .get();

      const userId = userResponse.id;
      const userName = userResponse.displayName;

      // Anwesenheitsstatus abrufen
      const presenceResponse = await this.client
        .api(`/users/${userId}/presence`)
        .get();

      return {
        userId: userId,
        userEmail: userEmail,
        userName: userName,
        availability: presenceResponse.availability,
        activity: presenceResponse.activity,
        statusMessage: presenceResponse.statusMessage?.message?.content,
      };
    } catch (error) {
      console.error('Error getting user presence:', error);
      throw new Error(`Failed to get user presence: ${error}`);
    }
  }

  /**
   * Holt den Anwesenheitsstatus des aktuellen Benutzers
   */
  async getMyPresence(): Promise<Presence> {
    try {
      const meResponse = await this.client
        .api('/me')
        .select('id,displayName,mail')
        .get();

      const presenceResponse = await this.client
        .api('/me/presence')
        .get();

      return {
        userId: meResponse.id,
        userEmail: meResponse.mail,
        userName: meResponse.displayName,
        availability: presenceResponse.availability,
        activity: presenceResponse.activity,
        statusMessage: presenceResponse.statusMessage?.message?.content,
      };
    } catch (error) {
      console.error('Error getting my presence:', error);
      throw new Error(`Failed to get my presence: ${error}`);
    }
  }

  /**
   * Holt Anwesenheitsstatus mehrerer Benutzer gleichzeitig
   */
  async getMultiplePresences(userEmails: string[]): Promise<Presence[]> {
    try {
      const presences: Presence[] = [];

      // Benutzer-IDs sammeln
      const userIds: { id: string; email: string; name: string }[] = [];

      for (const email of userEmails) {
        try {
          const userResponse = await this.client
            .api(`/users/${email}`)
            .select('id,displayName,mail')
            .get();

          userIds.push({
            id: userResponse.id,
            email: email,
            name: userResponse.displayName,
          });
        } catch (error) {
          console.error(`Could not find user: ${email}`, error);
        }
      }

      // Batch-Anfrage für Presence (bis zu 20 Benutzer gleichzeitig)
      const batchSize = 20;
      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);

        const batchRequest = {
          requests: batch.map((user, index) => ({
            id: index.toString(),
            method: 'GET',
            url: `/users/${user.id}/presence`,
          })),
        };

        const batchResponse = await this.client
          .api('/$batch')
          .post(batchRequest);

        for (let j = 0; j < batchResponse.responses.length; j++) {
          const response = batchResponse.responses[j];
          const user = batch[j];

          if (response.status === 200) {
            presences.push({
              userId: user.id,
              userEmail: user.email,
              userName: user.name,
              availability: response.body.availability,
              activity: response.body.activity,
              statusMessage: response.body.statusMessage?.message?.content,
            });
          }
        }
      }

      return presences;
    } catch (error) {
      console.error('Error getting multiple presences:', error);
      throw new Error(`Failed to get multiple presences: ${error}`);
    }
  }

  /**
   * Setzt den Anwesenheitsstatus des aktuellen Benutzers
   */
  async setMyPresence(
    availability: 'Available' | 'Busy' | 'DoNotDisturb' | 'BeRightBack' | 'Away',
    activity: string,
    expirationDuration?: string // ISO 8601 duration, z.B. "PT1H" für 1 Stunde
  ): Promise<void> {
    try {
      const presenceData: any = {
        sessionId: 'mcp-server-session',
        availability: availability,
        activity: activity,
      };

      if (expirationDuration) {
        presenceData.expirationDuration = expirationDuration;
      }

      await this.client
        .api('/me/presence/setPresence')
        .post(presenceData);
    } catch (error) {
      console.error('Error setting presence:', error);
      throw new Error(`Failed to set presence: ${error}`);
    }
  }

  /**
   * Setzt die Statusnachricht
   */
  async setStatusMessage(message: string, expiryDateTime?: string): Promise<void> {
    try {
      const statusData: any = {
        statusMessage: {
          message: {
            content: message,
            contentType: 'text',
          },
        },
      };

      if (expiryDateTime) {
        statusData.statusMessage.expiryDateTime = {
          dateTime: expiryDateTime,
          timeZone: 'UTC',
        };
      }

      await this.client
        .api('/me/presence/setStatusMessage')
        .post(statusData);
    } catch (error) {
      console.error('Error setting status message:', error);
      throw new Error(`Failed to set status message: ${error}`);
    }
  }

  /**
   * Löscht die Statusnachricht
   */
  async clearStatusMessage(): Promise<void> {
    try {
      await this.client
        .api('/me/presence/clearPresence')
        .post({
          sessionId: 'mcp-server-session',
        });
    } catch (error) {
      console.error('Error clearing status message:', error);
      throw new Error(`Failed to clear status message: ${error}`);
    }
  }

  /**
   * Holt Anwesenheitsstatus aller Team-Mitglieder
   */
  async getTeamMembersPresence(teamId: string): Promise<Presence[]> {
    try {
      // Team-Mitglieder abrufen
      const membersResponse = await this.client
        .api(`/teams/${teamId}/members`)
        .get();

      const userEmails: string[] = [];

      for (const member of membersResponse.value) {
        if (member.email) {
          userEmails.push(member.email);
        }
      }

      // Presence für alle Mitglieder abrufen
      return await this.getMultiplePresences(userEmails);
    } catch (error) {
      console.error('Error getting team members presence:', error);
      throw new Error(`Failed to get team members presence: ${error}`);
    }
  }
}
