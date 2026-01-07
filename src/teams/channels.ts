import type { Client } from '@microsoft/microsoft-graph-client';

export interface Channel {
  id: string;
  displayName: string;
  description?: string;
  teamId: string;
  teamName: string;
}

export class ChannelService {
  constructor(private client: Client) {}

  async listChannels(): Promise<Channel[]> {
    try {
      // Alle Teams abrufen
      const teamsResponse = await this.client
        .api('/me/joinedTeams')
        .select('id,displayName')
        .get();

      const channels: Channel[] = [];

      // Für jedes Team die Kanäle abrufen
      for (const team of teamsResponse.value) {
        const channelsResponse = await this.client
          .api(`/teams/${team.id}/channels`)
          .select('id,displayName,description')
          .get();

        for (const channel of channelsResponse.value) {
          channels.push({
            id: channel.id,
            displayName: channel.displayName,
            description: channel.description,
            teamId: team.id,
            teamName: team.displayName,
          });
        }
      }

      return channels;
    } catch (error) {
      console.error('Error listing channels:', error);
      throw new Error(`Failed to list channels: ${error}`);
    }
  }

  async getChannel(teamId: string, channelId: string): Promise<Channel | null> {
    try {
      const channel = await this.client
        .api(`/teams/${teamId}/channels/${channelId}`)
        .select('id,displayName,description')
        .get();

      const team = await this.client
        .api(`/teams/${teamId}`)
        .select('displayName')
        .get();

      return {
        id: channel.id,
        displayName: channel.displayName,
        description: channel.description,
        teamId: teamId,
        teamName: team.displayName,
      };
    } catch (error) {
      console.error('Error getting channel:', error);
      return null;
    }
  }
}
