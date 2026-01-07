import type { Client } from '@microsoft/microsoft-graph-client';

export interface TeamMember {
  id: string;
  userId: string;
  displayName: string;
  email?: string;
  roles: string[];
}

export class MembersService {
  constructor(private client: Client) {}

  /**
   * Listet alle Mitglieder eines Teams auf
   */
  async listTeamMembers(teamId: string): Promise<TeamMember[]> {
    try {
      const response = await this.client
        .api(`/teams/${teamId}/members`)
        .get();

      return response.value.map((member: any) => ({
        id: member.id,
        userId: member.userId,
        displayName: member.displayName,
        email: member.email,
        roles: member.roles || [],
      }));
    } catch (error) {
      console.error('Error listing team members:', error);
      throw new Error(`Failed to list team members: ${error}`);
    }
  }

  /**
   * Fügt ein Mitglied zu einem Team hinzu
   */
  async addTeamMember(
    teamId: string,
    userEmail: string,
    role: 'owner' | 'member' = 'member'
  ): Promise<TeamMember> {
    try {
      // Zuerst Benutzer-ID aus E-Mail ermitteln
      const userResponse = await this.client
        .api(`/users/${userEmail}`)
        .select('id,displayName,mail')
        .get();

      const memberData = {
        '@odata.type': '#microsoft.graph.aadUserConversationMember',
        roles: [role],
        'user@odata.bind': `https://graph.microsoft.com/v1.0/users('${userResponse.id}')`,
      };

      const response = await this.client
        .api(`/teams/${teamId}/members`)
        .post(memberData);

      return {
        id: response.id,
        userId: userResponse.id,
        displayName: userResponse.displayName,
        email: userEmail,
        roles: [role],
      };
    } catch (error) {
      console.error('Error adding team member:', error);
      throw new Error(`Failed to add team member: ${error}`);
    }
  }

  /**
   * Entfernt ein Mitglied aus einem Team
   */
  async removeTeamMember(teamId: string, membershipId: string): Promise<void> {
    try {
      await this.client
        .api(`/teams/${teamId}/members/${membershipId}`)
        .delete();
    } catch (error) {
      console.error('Error removing team member:', error);
      throw new Error(`Failed to remove team member: ${error}`);
    }
  }

  /**
   * Aktualisiert die Rolle eines Team-Mitglieds
   */
  async updateMemberRole(
    teamId: string,
    membershipId: string,
    newRole: 'owner' | 'member'
  ): Promise<TeamMember> {
    try {
      const updateData = {
        '@odata.type': '#microsoft.graph.aadUserConversationMember',
        roles: [newRole],
      };

      const response = await this.client
        .api(`/teams/${teamId}/members/${membershipId}`)
        .patch(updateData);

      return {
        id: response.id,
        userId: response.userId,
        displayName: response.displayName,
        email: response.email,
        roles: response.roles || [newRole],
      };
    } catch (error) {
      console.error('Error updating member role:', error);
      throw new Error(`Failed to update member role: ${error}`);
    }
  }

  /**
   * Holt Details zu einem bestimmten Team-Mitglied
   */
  async getTeamMember(teamId: string, membershipId: string): Promise<TeamMember> {
    try {
      const response = await this.client
        .api(`/teams/${teamId}/members/${membershipId}`)
        .get();

      return {
        id: response.id,
        userId: response.userId,
        displayName: response.displayName,
        email: response.email,
        roles: response.roles || [],
      };
    } catch (error) {
      console.error('Error getting team member:', error);
      throw new Error(`Failed to get team member: ${error}`);
    }
  }

  /**
   * Sucht ein Team-Mitglied per E-Mail
   */
  async findMemberByEmail(teamId: string, userEmail: string): Promise<TeamMember | null> {
    try {
      const members = await this.listTeamMembers(teamId);

      const member = members.find(
        (m) => m.email?.toLowerCase() === userEmail.toLowerCase()
      );

      return member || null;
    } catch (error) {
      console.error('Error finding member by email:', error);
      return null;
    }
  }

  /**
   * Listet alle Besitzer eines Teams auf
   */
  async listTeamOwners(teamId: string): Promise<TeamMember[]> {
    try {
      const members = await this.listTeamMembers(teamId);

      return members.filter((member) => member.roles.includes('owner'));
    } catch (error) {
      console.error('Error listing team owners:', error);
      throw new Error(`Failed to list team owners: ${error}`);
    }
  }

  /**
   * Fügt mehrere Mitglieder gleichzeitig zu einem Team hinzu
   */
  async addMultipleMembers(
    teamId: string,
    userEmails: string[],
    role: 'owner' | 'member' = 'member'
  ): Promise<TeamMember[]> {
    try {
      const addedMembers: TeamMember[] = [];

      for (const email of userEmails) {
        try {
          const member = await this.addTeamMember(teamId, email, role);
          addedMembers.push(member);
        } catch (error) {
          console.error(`Failed to add member ${email}:`, error);
        }
      }

      return addedMembers;
    } catch (error) {
      console.error('Error adding multiple members:', error);
      throw new Error(`Failed to add multiple members: ${error}`);
    }
  }

  /**
   * Listet alle Kanäle, auf die ein Mitglied Zugriff hat
   */
  async listMemberChannels(teamId: string, _membershipId: string): Promise<any[]> {
    try {
      // Hinweis: Dies ist eine vereinfachte Version
      // In der Praxis würde man die Channel-Berechtigungen prüfen
      const channelsResponse = await this.client
        .api(`/teams/${teamId}/channels`)
        .get();

      return channelsResponse.value;
    } catch (error) {
      console.error('Error listing member channels:', error);
      throw new Error(`Failed to list member channels: ${error}`);
    }
  }
}
