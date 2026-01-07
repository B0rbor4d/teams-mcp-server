import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { TeamsClient } from './teams/client.js';
import { ChannelService } from './teams/channels.js';
import { MessageService } from './teams/messages.js';
import { MeetingService } from './teams/meetings.js';
import { ChatsService } from './teams/chats.js';
import { FilesService } from './teams/files.js';
import { PresenceService } from './teams/presence.js';
import { MembersService } from './teams/members.js';
import { handleToolCall as handleToolCallImpl } from './handlers.js';
import type { Config } from './utils/config.js';

export class TeamsMCPServer {
  private server: Server;
  private teamsClient: TeamsClient;
  private channelService: ChannelService;
  private messageService: MessageService;
  private meetingService: MeetingService;
  private chatsService: ChatsService;
  private filesService: FilesService;
  private presenceService: PresenceService;
  private membersService: MembersService;

  constructor(config: Config) {
    this.server = new Server(
      {
        name: 'teams-mcp-server',
        version: '0.2.0', // Erhöht wegen neuer Features
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Teams Services initialisieren
    this.teamsClient = new TeamsClient(config);
    const client = this.teamsClient.getClient();
    this.channelService = new ChannelService(client);
    this.messageService = new MessageService(client, config);
    this.meetingService = new MeetingService(client);
    this.chatsService = new ChatsService(client, config);
    this.filesService = new FilesService(client);
    this.presenceService = new PresenceService(client);
    this.membersService = new MembersService(client);

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // Tools auflisten
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getTools(),
      };
    });

    // Tool aufrufen
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      return await this.handleToolCall(request.params.name, request.params.arguments);
    });
  }

  private getTools(): Tool[] {
    return [
      // === KANAL-TOOLS ===
      {
        name: 'teams_list_channels',
        description: 'Listet alle verfügbaren Teams-Kanäle auf',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },

      // === NACHRICHTEN-TOOLS ===
      {
        name: 'teams_read_messages',
        description: 'Liest Nachrichten aus einem bestimmten Teams-Kanal',
        inputSchema: {
          type: 'object',
          properties: {
            teamId: { type: 'string', description: 'Die ID des Teams' },
            channelId: { type: 'string', description: 'Die ID des Kanals' },
            limit: { type: 'number', description: 'Anzahl der Nachrichten (Standard: 20)', default: 20 },
          },
          required: ['teamId', 'channelId'],
        },
      },
      {
        name: 'teams_send_message',
        description: 'Sendet eine Nachricht in einen Teams-Kanal',
        inputSchema: {
          type: 'object',
          properties: {
            teamId: { type: 'string', description: 'Die ID des Teams' },
            channelId: { type: 'string', description: 'Die ID des Kanals' },
            message: { type: 'string', description: 'Der Nachrichtentext' },
          },
          required: ['teamId', 'channelId', 'message'],
        },
      },
      {
        name: 'teams_reply_to_message',
        description: 'Antwortet auf eine Nachricht in einem Teams-Kanal',
        inputSchema: {
          type: 'object',
          properties: {
            teamId: { type: 'string' },
            channelId: { type: 'string' },
            messageId: { type: 'string', description: 'Die ID der Nachricht' },
            message: { type: 'string', description: 'Der Antworttext' },
          },
          required: ['teamId', 'channelId', 'messageId', 'message'],
        },
      },
      {
        name: 'teams_edit_message',
        description: 'Bearbeitet eine existierende Nachricht (nur eigene)',
        inputSchema: {
          type: 'object',
          properties: {
            teamId: { type: 'string' },
            channelId: { type: 'string' },
            messageId: { type: 'string' },
            newContent: { type: 'string', description: 'Neuer Nachrichtentext' },
          },
          required: ['teamId', 'channelId', 'messageId', 'newContent'],
        },
      },
      {
        name: 'teams_delete_message',
        description: 'Löscht eine Nachricht (nur eigene oder als Owner)',
        inputSchema: {
          type: 'object',
          properties: {
            teamId: { type: 'string' },
            channelId: { type: 'string' },
            messageId: { type: 'string' },
          },
          required: ['teamId', 'channelId', 'messageId'],
        },
      },
      {
        name: 'teams_add_reaction',
        description: 'Fügt eine Reaktion zu einer Nachricht hinzu',
        inputSchema: {
          type: 'object',
          properties: {
            teamId: { type: 'string' },
            channelId: { type: 'string' },
            messageId: { type: 'string' },
            reactionType: {
              type: 'string',
              enum: ['like', 'heart', 'laugh', 'surprised', 'sad', 'angry'],
              description: 'Art der Reaktion',
            },
          },
          required: ['teamId', 'channelId', 'messageId', 'reactionType'],
        },
      },
      {
        name: 'teams_remove_reaction',
        description: 'Entfernt eine Reaktion von einer Nachricht',
        inputSchema: {
          type: 'object',
          properties: {
            teamId: { type: 'string' },
            channelId: { type: 'string' },
            messageId: { type: 'string' },
            reactionType: {
              type: 'string',
              enum: ['like', 'heart', 'laugh', 'surprised', 'sad', 'angry'],
            },
          },
          required: ['teamId', 'channelId', 'messageId', 'reactionType'],
        },
      },
      {
        name: 'teams_send_adaptive_card',
        description: 'Sendet eine Adaptive Card (interaktive Karte) in einen Kanal',
        inputSchema: {
          type: 'object',
          properties: {
            teamId: { type: 'string' },
            channelId: { type: 'string' },
            title: { type: 'string', description: 'Titel der Karte' },
            text: { type: 'string', description: 'Text-Inhalt' },
            actions: {
              type: 'array',
              description: 'Optionale Buttons/Actions',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  url: { type: 'string' },
                },
              },
            },
          },
          required: ['teamId', 'channelId', 'title', 'text'],
        },
      },

      // === CHAT-TOOLS (1:1 und Gruppen) ===
      {
        name: 'teams_list_chats',
        description: 'Listet alle Chats (1:1 und Gruppen) auf',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'teams_read_chat_messages',
        description: 'Liest Nachrichten aus einem Chat',
        inputSchema: {
          type: 'object',
          properties: {
            chatId: { type: 'string', description: 'Die ID des Chats' },
            limit: { type: 'number', description: 'Anzahl der Nachrichten', default: 20 },
          },
          required: ['chatId'],
        },
      },
      {
        name: 'teams_send_chat_message',
        description: 'Sendet eine Nachricht in einen Chat',
        inputSchema: {
          type: 'object',
          properties: {
            chatId: { type: 'string', description: 'Die ID des Chats' },
            message: { type: 'string', description: 'Der Nachrichtentext' },
          },
          required: ['chatId', 'message'],
        },
      },
      {
        name: 'teams_create_chat',
        description: 'Erstellt einen neuen 1:1 Chat mit einem Benutzer',
        inputSchema: {
          type: 'object',
          properties: {
            userEmail: { type: 'string', description: 'E-Mail des Benutzers' },
          },
          required: ['userEmail'],
        },
      },
      {
        name: 'teams_create_group_chat',
        description: 'Erstellt einen Gruppen-Chat',
        inputSchema: {
          type: 'object',
          properties: {
            topic: { type: 'string', description: 'Thema des Gruppen-Chats' },
            memberEmails: {
              type: 'array',
              items: { type: 'string' },
              description: 'E-Mails der Mitglieder',
            },
          },
          required: ['topic', 'memberEmails'],
        },
      },

      // === MEETING-TOOLS ===
      {
        name: 'teams_get_meetings',
        description: 'Ruft anstehende Teams-Meetings ab',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Anzahl der Meetings', default: 10 },
          },
        },
      },
      {
        name: 'teams_get_meeting_by_id',
        description: 'Ruft Details zu einem bestimmten Meeting ab',
        inputSchema: {
          type: 'object',
          properties: {
            meetingId: { type: 'string', description: 'Die ID des Meetings' },
          },
          required: ['meetingId'],
        },
      },
      {
        name: 'teams_create_meeting',
        description: 'Erstellt ein neues Teams-Meeting',
        inputSchema: {
          type: 'object',
          properties: {
            subject: { type: 'string', description: 'Betreff des Meetings' },
            startDateTime: { type: 'string', description: 'Start (ISO 8601)' },
            endDateTime: { type: 'string', description: 'Ende (ISO 8601)' },
            attendees: {
              type: 'array',
              items: { type: 'string' },
              description: 'E-Mail-Adressen der Teilnehmer',
            },
          },
          required: ['subject', 'startDateTime', 'endDateTime', 'attendees'],
        },
      },

      // === DATEI-TOOLS ===
      {
        name: 'teams_list_files',
        description: 'Listet Dateien in einem Teams-Kanal auf',
        inputSchema: {
          type: 'object',
          properties: {
            teamId: { type: 'string' },
            channelId: { type: 'string' },
          },
          required: ['teamId', 'channelId'],
        },
      },
      {
        name: 'teams_upload_file',
        description: 'Lädt eine Datei in einen Teams-Kanal hoch',
        inputSchema: {
          type: 'object',
          properties: {
            teamId: { type: 'string' },
            channelId: { type: 'string' },
            fileName: { type: 'string', description: 'Name der Datei' },
            content: { type: 'string', description: 'Dateiinhalt (Text oder Base64)' },
          },
          required: ['teamId', 'channelId', 'fileName', 'content'],
        },
      },
      {
        name: 'teams_download_file',
        description: 'Lädt eine Datei aus einem Teams-Kanal herunter',
        inputSchema: {
          type: 'object',
          properties: {
            teamId: { type: 'string' },
            channelId: { type: 'string' },
            fileId: { type: 'string', description: 'ID der Datei' },
          },
          required: ['teamId', 'channelId', 'fileId'],
        },
      },
      {
        name: 'teams_delete_file',
        description: 'Löscht eine Datei aus einem Teams-Kanal',
        inputSchema: {
          type: 'object',
          properties: {
            teamId: { type: 'string' },
            channelId: { type: 'string' },
            fileId: { type: 'string' },
          },
          required: ['teamId', 'channelId', 'fileId'],
        },
      },

      // === PRESENCE/ANWESENHEITSSTATUS ===
      {
        name: 'teams_get_user_presence',
        description: 'Holt den Anwesenheitsstatus eines Benutzers',
        inputSchema: {
          type: 'object',
          properties: {
            userEmail: { type: 'string', description: 'E-Mail des Benutzers' },
          },
          required: ['userEmail'],
        },
      },
      {
        name: 'teams_get_my_presence',
        description: 'Holt den eigenen Anwesenheitsstatus',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'teams_set_presence',
        description: 'Setzt den eigenen Anwesenheitsstatus',
        inputSchema: {
          type: 'object',
          properties: {
            availability: {
              type: 'string',
              enum: ['Available', 'Busy', 'DoNotDisturb', 'BeRightBack', 'Away'],
              description: 'Verfügbarkeitsstatus',
            },
            activity: { type: 'string', description: 'Aktivität' },
          },
          required: ['availability', 'activity'],
        },
      },

      // === MITGLIEDER-VERWALTUNG ===
      {
        name: 'teams_list_members',
        description: 'Listet alle Mitglieder eines Teams auf',
        inputSchema: {
          type: 'object',
          properties: {
            teamId: { type: 'string', description: 'Die ID des Teams' },
          },
          required: ['teamId'],
        },
      },
      {
        name: 'teams_add_member',
        description: 'Fügt ein Mitglied zu einem Team hinzu',
        inputSchema: {
          type: 'object',
          properties: {
            teamId: { type: 'string' },
            userEmail: { type: 'string', description: 'E-Mail des Benutzers' },
            role: {
              type: 'string',
              enum: ['owner', 'member'],
              description: 'Rolle im Team',
              default: 'member',
            },
          },
          required: ['teamId', 'userEmail'],
        },
      },
      {
        name: 'teams_remove_member',
        description: 'Entfernt ein Mitglied aus einem Team',
        inputSchema: {
          type: 'object',
          properties: {
            teamId: { type: 'string' },
            membershipId: { type: 'string', description: 'ID der Mitgliedschaft' },
          },
          required: ['teamId', 'membershipId'],
        },
      },
    ];
  }

  private async handleToolCall(toolName: string, args: any): Promise<any> {
    try {
      return await handleToolCallImpl(toolName, args, {
        channel: this.channelService,
        message: this.messageService,
        meeting: this.meetingService,
        chats: this.chatsService,
        files: this.filesService,
        presence: this.presenceService,
        members: this.membersService,
      });
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Fehler beim Ausführen von ${toolName}: ${error}` }],
        isError: true,
      };
    }
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Teams MCP Server gestartet (v0.2.0 - Extended)');
  }
}
