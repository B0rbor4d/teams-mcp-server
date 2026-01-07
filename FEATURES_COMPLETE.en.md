[🇩🇪 Deutsch](FEATURES_COMPLETE.md) | 🇬🇧 English

---

# Teams MCP Server - Complete Feature Documentation

Version 0.2.0 - Extended Edition

## 📋 Table of Contents

1. [Overview](#overview)
2. [All 30+ MCP Tools](#all-mcp-tools)
3. [Required API Permissions](#required-api-permissions)
4. [Usage Examples](#usage-examples)
5. [Setup](#setup)

---

## Overview

The Teams MCP Server provides **30+ tools** for complete Microsoft Teams integration:

- ✅ **Teams & Channels:** List and manage channels
- ✅ **Messages:** Read, Send, Edit, Delete
- ✅ **Reactions:** Likes, Hearts, and more
- ✅ **Adaptive Cards:** Interactive, visually appealing cards
- ✅ **1:1 & Group Chats:** Private communication
- ✅ **Meetings:** Create, Manage, Retrieve
- ✅ **Files:** Upload, Download, Delete
- ✅ **Presence:** Query and set presence status
- ✅ **Team Members:** Add, Remove, Manage

---

## All MCP Tools

### 📢 Channel Tools (1)

#### `teams_list_channels`
Lists all available Teams channels.

**Parameters:** None

**Example:**
```
"Show me all my Teams channels"
```

---

### 💬 Message Tools (9)

#### `teams_read_messages`
Reads messages from a Teams channel.

**Parameters:**
- `teamId` (string) - The team ID
- `channelId` (string) - The channel ID
- `limit` (number, optional) - Number of messages (default: 20)

#### `teams_send_message`
Sends a message to a Teams channel.

**Parameters:**
- `teamId` (string)
- `channelId` (string)
- `message` (string) - The message text

#### `teams_reply_to_message`
Replies to a specific message.

**Parameters:**
- `teamId` (string)
- `channelId` (string)
- `messageId` (string)
- `message` (string)

#### `teams_edit_message`
Edits an existing message (only your own).

**Parameters:**
- `teamId` (string)
- `channelId` (string)
- `messageId` (string)
- `newContent` (string)

#### `teams_delete_message`
Deletes a message (only your own or as owner).

**Parameters:**
- `teamId` (string)
- `channelId` (string)
- `messageId` (string)

#### `teams_add_reaction`
Adds a reaction (emoji) to a message.

**Parameters:**
- `teamId` (string)
- `channelId` (string)
- `messageId` (string)
- `reactionType` (enum) - `like`, `heart`, `laugh`, `surprised`, `sad`, `angry`

#### `teams_remove_reaction`
Removes a reaction from a message.

**Parameters:** Same as `teams_add_reaction`

#### `teams_send_adaptive_card`
Sends an interactive Adaptive Card.

**Parameters:**
- `teamId` (string)
- `channelId` (string)
- `title` (string) - Card title
- `text` (string) - Text content
- `actions` (array, optional) - Buttons/Actions

**Example:**
```json
{
  "teamId": "...",
  "channelId": "...",
  "title": "Build successful! ✅",
  "text": "Build #142 completed successfully.",
  "actions": [
    { "title": "View details", "url": "https://build.example.com/142" }
  ]
}
```

---

### 💬 Chat Tools (5)

#### `teams_list_chats`
Lists all chats (1:1 and group).

#### `teams_read_chat_messages`
Reads messages from a chat.

**Parameters:**
- `chatId` (string)
- `limit` (number, optional)

#### `teams_send_chat_message`
Sends a message to a chat.

**Parameters:**
- `chatId` (string)
- `message` (string)

#### `teams_create_chat`
Creates a new 1:1 chat.

**Parameters:**
- `userEmail` (string)

#### `teams_create_group_chat`
Creates a group chat.

**Parameters:**
- `topic` (string) - Chat topic
- `memberEmails` (array) - Email addresses

---

### 📅 Meeting Tools (3)

#### `teams_get_meetings`
Retrieves upcoming meetings.

**Parameters:**
- `limit` (number, optional) - Default: 10

#### `teams_get_meeting_by_id`
Gets details for a meeting.

**Parameters:**
- `meetingId` (string)

#### `teams_create_meeting`
Creates a new Teams meeting.

**Parameters:**
- `subject` (string)
- `startDateTime` (string) - ISO 8601 format
- `endDateTime` (string) - ISO 8601 format
- `attendees` (array) - Email addresses

---

### 📁 File Tools (4)

#### `teams_list_files`
Lists files in a channel.

**Parameters:**
- `teamId` (string)
- `channelId` (string)

#### `teams_upload_file`
Uploads a file.

**Parameters:**
- `teamId` (string)
- `channelId` (string)
- `fileName` (string)
- `content` (string) - Text or Base64

#### `teams_download_file`
Downloads a file.

**Parameters:**
- `teamId` (string)
- `channelId` (string)
- `fileId` (string)

**Returns:** Base64-encoded content

#### `teams_delete_file`
Deletes a file.

**Parameters:**
- `teamId` (string)
- `channelId` (string)
- `fileId` (string)

---

### 👤 Presence Tools (3)

#### `teams_get_user_presence`
Gets user presence status.

**Parameters:**
- `userEmail` (string)

**Returns:**
```json
{
  "availability": "Available",
  "activity": "Available",
  "statusMessage": "Working from home"
}
```

#### `teams_get_my_presence`
Gets own presence status.

#### `teams_set_presence`
Sets own presence status.

**Parameters:**
- `availability` (enum) - `Available`, `Busy`, `DoNotDisturb`, `BeRightBack`, `Away`
- `activity` (string)

---

### 👥 Member Tools (3)

#### `teams_list_members`
Lists all team members.

**Parameters:**
- `teamId` (string)

#### `teams_add_member`
Adds a member.

**Parameters:**
- `teamId` (string)
- `userEmail` (string)
- `role` (enum, optional) - `owner` or `member` (default)

#### `teams_remove_member`
Removes a member.

**Parameters:**
- `teamId` (string)
- `membershipId` (string)

---

## Required API Permissions

### Complete List (Delegated Permissions)

```
✓ User.Read
✓ Team.ReadBasic.All
✓ Channel.ReadBasic.All
✓ ChannelMessage.Read.All
✓ ChannelMessage.Send
✓ ChannelMessage.Edit (NEW)
✓ ChannelMessage.Delete (NEW)
✓ Group.Read.All
✓ Group.ReadWrite.All (NEW - for member management)
✓ Chat.Read (NEW - for 1:1 chats)
✓ Chat.ReadWrite (NEW - for 1:1 chats)
✓ OnlineMeetings.ReadWrite
✓ Calendars.ReadWrite
✓ Files.Read.All (NEW - for files)
✓ Files.ReadWrite.All (NEW - for files)
✓ Presence.Read (NEW - for presence)
✓ Presence.ReadWrite (NEW - for presence)
```

### Permissions by Feature Group

| Feature | Required Permissions |
|---------|---------------------|
| **Basic Channels** | User.Read, Team.ReadBasic.All, Channel.ReadBasic.All |
| **Read Messages** | ChannelMessage.Read.All |
| **Send Messages** | ChannelMessage.Send |
| **Edit/Delete Messages** | ChannelMessage.Edit, ChannelMessage.Delete |
| **1:1 Chats** | Chat.Read, Chat.ReadWrite |
| **Meetings** | OnlineMeetings.ReadWrite, Calendars.ReadWrite |
| **Files** | Files.Read.All, Files.ReadWrite.All |
| **Presence** | Presence.Read, Presence.ReadWrite |
| **Members** | Group.ReadWrite.All |

### Azure Portal Configuration

1. Azure Portal → App Registration → Your App
2. API Permissions → Add a permission
3. Microsoft Graph → Delegated permissions
4. Add all permissions listed above
5. Click **Grant admin consent** ✅

---

## Usage Examples

### 1. Automatic Status Updates

```
"Send an Adaptive Card to the DevOps channel with the title
'Build #142 successful' and a button to the build log"
```

### 2. Team Communication

```
"Create a 1:1 chat with max@company.com and send
'Hello Max, can we talk briefly?'"
```

### 3. Meeting Management

```
"Create a meeting for tomorrow 10:00-11:00 with
anna@company.com and max@company.com, subject: Project Review"
```

### 4. File Management

```
"List all files in the Project channel"
"Download the file project-status.pdf"
```

### 5. Presence Status

```
"Set my status to 'Busy' with activity 'In a meeting'"
"Show me the status of max@company.com"
```

### 6. Team Management

```
"Add anna@company.com as a member to the Marketing team"
"List all members of the DevOps team"
```

---

## Setup

### 1. Azure App Registration

See [AZURE_SETUP.en.md](AZURE_SETUP.en.md) for detailed instructions.

### 2. Environment Variables

```env
# Azure Credentials
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_TENANT_ID=your-tenant-id

# Auth Mode (application/delegated/user)
AUTH_MODE=application
BOT_DISPLAY_NAME=Teams MCP Bot

# Optional: Signature
MESSAGE_ADD_SIGNATURE=false
```

### 3. Start Container

```bash
./start-container.sh
```

### 4. Connect with Claude Code

See [README.en.md](README.en.md) for integration details.

---

## Feature Matrix

| Feature | Status | Tools | Permissions |
|---------|--------|-------|-------------|
| List channels | ✅ | 1 | Team.ReadBasic.All |
| Read messages | ✅ | 1 | ChannelMessage.Read.All |
| Send messages | ✅ | 1 | ChannelMessage.Send |
| Edit messages | ✅ | 1 | ChannelMessage.Edit |
| Delete messages | ✅ | 1 | ChannelMessage.Delete |
| Reactions | ✅ | 2 | ChannelMessage.Send |
| Adaptive Cards | ✅ | 1 | ChannelMessage.Send |
| 1:1 Chats | ✅ | 5 | Chat.ReadWrite |
| Meetings | ✅ | 3 | OnlineMeetings.ReadWrite |
| Files | ✅ | 4 | Files.ReadWrite.All |
| Presence | ✅ | 3 | Presence.ReadWrite |
| Team Members | ✅ | 3 | Group.ReadWrite.All |
| **TOTAL** | **✅** | **30+** | **17** |

---

## Roadmap

### Possible future extensions:

- 🔔 Receive webhook notifications
- 📊 Teams analytics and statistics
- 🔐 Advanced permission management
- 🤖 Bot Framework integration
- 📱 Mobile push notifications

---

## Support & Documentation

- **README.en.md** - Project overview & quick start
- **AZURE_SETUP.en.md** - Azure App Registration
- **AUTH_MODES.en.md** - Authentication modes
- **API_PERMISSIONS.en.md** - API permissions details
- **This file** - Complete feature documentation

---

## Changelog

### v0.2.0 (January 2026) - Extended Edition

**New Features:**
- ✨ 1:1 & group chats (5 tools)
- ✨ File upload/download (4 tools)
- ✨ Adaptive Cards (1 tool)
- ✨ Message reactions (2 tools)
- ✨ Message editing/deletion (2 tools)
- ✨ Presence status (3 tools)
- ✨ Team member management (3 tools)
- ✨ Three authentication modes
- ✨ Configurable message signatures

**Total:** Expanded from 7 to 30+ tools!

### v0.1.0 (January 2026) - Initial Release

**Features:**
- ✅ List channels
- ✅ Read/send/reply to messages
- ✅ Create/retrieve meetings
- ✅ Basic functionality

---

**🎉 The Teams MCP Server is now feature-complete for most use cases!**
