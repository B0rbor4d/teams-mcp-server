// Tool-Handler-Implementierungen für den Teams MCP Server
// Diese Datei enthält alle Handler-Logik, um server.ts übersichtlich zu halten

import type { ChannelService } from './teams/channels.js';
import type { MessageService } from './teams/messages.js';
import type { MeetingService } from './teams/meetings.js';
import type { ChatsService } from './teams/chats.js';
import type { FilesService } from './teams/files.js';
import type { PresenceService } from './teams/presence.js';
import type { MembersService } from './teams/members.js';

export async function handleToolCall(
  toolName: string,
  args: any,
  services: {
    channel: ChannelService;
    message: MessageService;
    meeting: MeetingService;
    chats: ChatsService;
    files: FilesService;
    presence: PresenceService;
    members: MembersService;
  }
): Promise<any> {
  switch (toolName) {
    // === KANAL-TOOLS ===
    case 'teams_list_channels': {
      const channels = await services.channel.listChannels();
      return {
        content: [{ type: 'text', text: JSON.stringify(channels, null, 2) }],
      };
    }

    // === NACHRICHTEN-TOOLS ===
    case 'teams_read_messages': {
      const { teamId, channelId, limit = 20 } = args;
      const messages = await services.message.readMessages(teamId, channelId, limit);
      return {
        content: [{ type: 'text', text: JSON.stringify(messages, null, 2) }],
      };
    }

    case 'teams_send_message': {
      const { teamId, channelId, message } = args;
      const result = await services.message.sendMessage(teamId, channelId, message);
      return {
        content: [{ type: 'text', text: `Nachricht gesendet: ${JSON.stringify(result, null, 2)}` }],
      };
    }

    case 'teams_reply_to_message': {
      const { teamId, channelId, messageId, message } = args;
      const result = await services.message.replyToMessage(teamId, channelId, messageId, message);
      return {
        content: [{ type: 'text', text: `Antwort gesendet: ${JSON.stringify(result, null, 2)}` }],
      };
    }

    case 'teams_edit_message': {
      const { teamId, channelId, messageId, newContent } = args;
      const result = await services.message.editMessage(teamId, channelId, messageId, newContent);
      return {
        content: [{ type: 'text', text: `Nachricht bearbeitet: ${JSON.stringify(result, null, 2)}` }],
      };
    }

    case 'teams_delete_message': {
      const { teamId, channelId, messageId } = args;
      await services.message.deleteMessage(teamId, channelId, messageId);
      return {
        content: [{ type: 'text', text: 'Nachricht gelöscht' }],
      };
    }

    case 'teams_add_reaction': {
      const { teamId, channelId, messageId, reactionType } = args;
      await services.message.addReaction(teamId, channelId, messageId, reactionType);
      return {
        content: [{ type: 'text', text: `Reaktion "${reactionType}" hinzugefügt` }],
      };
    }

    case 'teams_remove_reaction': {
      const { teamId, channelId, messageId, reactionType } = args;
      await services.message.removeReaction(teamId, channelId, messageId, reactionType);
      return {
        content: [{ type: 'text', text: `Reaktion "${reactionType}" entfernt` }],
      };
    }

    case 'teams_send_adaptive_card': {
      const { teamId, channelId, title, text, actions } = args;
      const card = services.message.createSimpleAdaptiveCard(title, text, actions);
      const result = await services.message.sendAdaptiveCard(teamId, channelId, card);
      return {
        content: [{ type: 'text', text: `Adaptive Card gesendet: ${JSON.stringify(result, null, 2)}` }],
      };
    }

    // === CHAT-TOOLS ===
    case 'teams_list_chats': {
      const chats = await services.chats.listChats();
      return {
        content: [{ type: 'text', text: JSON.stringify(chats, null, 2) }],
      };
    }

    case 'teams_read_chat_messages': {
      const { chatId, limit = 20 } = args;
      const messages = await services.chats.readChatMessages(chatId, limit);
      return {
        content: [{ type: 'text', text: JSON.stringify(messages, null, 2) }],
      };
    }

    case 'teams_send_chat_message': {
      const { chatId, message } = args;
      const result = await services.chats.sendChatMessage(chatId, message);
      return {
        content: [{ type: 'text', text: `Chat-Nachricht gesendet: ${JSON.stringify(result, null, 2)}` }],
      };
    }

    case 'teams_create_chat': {
      const { userEmail } = args;
      const result = await services.chats.createOneOnOneChat(userEmail);
      return {
        content: [{ type: 'text', text: `1:1 Chat erstellt: ${JSON.stringify(result, null, 2)}` }],
      };
    }

    case 'teams_create_group_chat': {
      const { topic, memberEmails } = args;
      const result = await services.chats.createGroupChat(topic, memberEmails);
      return {
        content: [{ type: 'text', text: `Gruppen-Chat erstellt: ${JSON.stringify(result, null, 2)}` }],
      };
    }

    // === MEETING-TOOLS ===
    case 'teams_get_meetings': {
      const { limit = 10 } = args;
      const meetings = await services.meeting.getMeetings(limit);
      return {
        content: [{ type: 'text', text: JSON.stringify(meetings, null, 2) }],
      };
    }

    case 'teams_get_meeting_by_id': {
      const { meetingId } = args;
      const meeting = await services.meeting.getMeetingById(meetingId);
      if (!meeting) {
        throw new Error('Meeting nicht gefunden');
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(meeting, null, 2) }],
      };
    }

    case 'teams_create_meeting': {
      const { subject, startDateTime, endDateTime, attendees } = args;
      const meeting = await services.meeting.createMeeting(subject, startDateTime, endDateTime, attendees);
      return {
        content: [{ type: 'text', text: `Meeting erstellt: ${JSON.stringify(meeting, null, 2)}` }],
      };
    }

    // === DATEI-TOOLS ===
    case 'teams_list_files': {
      const { teamId, channelId } = args;
      const files = await services.files.listChannelFiles(teamId, channelId);
      return {
        content: [{ type: 'text', text: JSON.stringify(files, null, 2) }],
      };
    }

    case 'teams_upload_file': {
      const { teamId, channelId, fileName, content } = args;
      const result = await services.files.uploadChannelFile(teamId, channelId, fileName, content);
      return {
        content: [{ type: 'text', text: `Datei hochgeladen: ${JSON.stringify(result, null, 2)}` }],
      };
    }

    case 'teams_download_file': {
      const { teamId, channelId, fileId } = args;
      const result = await services.files.downloadChannelFile(teamId, channelId, fileId);
      // Konvertiere Buffer zu Base64 für Übertragung
      const base64Content = result.content.toString('base64');
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            fileName: result.fileName,
            mimeType: result.mimeType,
            content: base64Content,
            note: 'Content ist Base64-kodiert',
          }, null, 2)
        }],
      };
    }

    case 'teams_delete_file': {
      const { teamId, channelId, fileId } = args;
      await services.files.deleteChannelFile(teamId, channelId, fileId);
      return {
        content: [{ type: 'text', text: 'Datei gelöscht' }],
      };
    }

    // === PRESENCE-TOOLS ===
    case 'teams_get_user_presence': {
      const { userEmail } = args;
      const presence = await services.presence.getUserPresenceByEmail(userEmail);
      return {
        content: [{ type: 'text', text: JSON.stringify(presence, null, 2) }],
      };
    }

    case 'teams_get_my_presence': {
      const presence = await services.presence.getMyPresence();
      return {
        content: [{ type: 'text', text: JSON.stringify(presence, null, 2) }],
      };
    }

    case 'teams_set_presence': {
      const { availability, activity } = args;
      await services.presence.setMyPresence(availability, activity);
      return {
        content: [{ type: 'text', text: `Anwesenheitsstatus gesetzt: ${availability} (${activity})` }],
      };
    }

    // === MITGLIEDER-TOOLS ===
    case 'teams_list_members': {
      const { teamId } = args;
      const members = await services.members.listTeamMembers(teamId);
      return {
        content: [{ type: 'text', text: JSON.stringify(members, null, 2) }],
      };
    }

    case 'teams_add_member': {
      const { teamId, userEmail, role = 'member' } = args;
      const result = await services.members.addTeamMember(teamId, userEmail, role);
      return {
        content: [{ type: 'text', text: `Mitglied hinzugefügt: ${JSON.stringify(result, null, 2)}` }],
      };
    }

    case 'teams_remove_member': {
      const { teamId, membershipId } = args;
      await services.members.removeTeamMember(teamId, membershipId);
      return {
        content: [{ type: 'text', text: 'Mitglied entfernt' }],
      };
    }

    default:
      throw new Error(`Unbekanntes Tool: ${toolName}`);
  }
}
