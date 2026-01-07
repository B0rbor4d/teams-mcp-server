[🇩🇪 Deutsch](README.md) | 🇬🇧 English

---

# Teams MCP Server

A complete Model Context Protocol (MCP) server for Microsoft Teams integration and bot functionality.

**Version 0.2.0 - Extended Edition** | **30+ MCP Tools** | **All Features Implemented**

## 🚀 Overview

This MCP server enables Claude Code and other MCP clients to **fully** interact with Microsoft Teams. From simple messages to Adaptive Cards, file management, and team administration.

**📖 [Complete Feature Documentation →](FEATURES_COMPLETE.en.md)**

## ✨ Features (v0.2.0)

### 📢 Teams & Channels
- ✅ List all Teams channels
- ✅ Get channel information

### 💬 Messages (Extended)
- ✅ Read, send, and reply to messages
- ✅ **NEW:** Edit and delete messages
- ✅ **NEW:** Add reactions (👍 ❤️ 😂 😮 😢 😠)
- ✅ **NEW:** Rich text and HTML formatting
- ✅ **NEW:** Adaptive Cards (interactive cards)

### 💬 Private Chats (NEW)
- ✅ **NEW:** Create and manage 1:1 chats
- ✅ **NEW:** Create group chats
- ✅ **NEW:** Read and send chat messages

### 📅 Meetings
- ✅ Retrieve upcoming meetings
- ✅ Display meeting details
- ✅ Create new meetings

### 📁 Files (NEW)
- ✅ **NEW:** List files in channels
- ✅ **NEW:** Upload files
- ✅ **NEW:** Download files
- ✅ **NEW:** Delete files

### 👤 Presence Status (NEW)
- ✅ **NEW:** Query user status (Available, Busy, DND, Away)
- ✅ **NEW:** Set own status
- ✅ **NEW:** Read and write status messages

### 👥 Team Members (NEW)
- ✅ **NEW:** List team members
- ✅ **NEW:** Add/remove members
- ✅ **NEW:** Manage roles (Owner/Member)

### 🔐 Authentication
- ✅ **NEW:** 3 auth modes (Application/Delegated/User)
- ✅ **NEW:** Configurable bot identity
- ✅ **NEW:** Optional message signatures

**Total:** **30+ MCP Tools** for complete Teams integration!

## Prerequisites

### For Container Deployment (Recommended)
- Docker or Podman
- Microsoft Teams Account
- Azure App Registration (for Teams API access)

### For Local Installation
- Node.js (v18 or higher)
- npm or yarn
- Microsoft Teams Account
- Azure App Registration (for Teams API access)

## Installation

### Option 1: Container Deployment (Recommended)

The MCP server runs in a Docker/Podman container for easy deployment and isolation.

```bash
# 1. Create .env file
cp .env.example .env
# Edit .env with your Azure credentials

# 2. Start container (auto-detects Docker or Podman)
./start-container.sh

# Alternative: Manually with Docker
docker-compose up -d --build

# Alternative: Manually with Podman
podman-compose up -d --build
```

**Container management with start-container.sh:**

```bash
./start-container.sh          # Start container
./start-container.sh stop     # Stop container
./start-container.sh restart  # Restart container
./start-container.sh logs     # Show logs
./start-container.sh status   # Check status
./start-container.sh shell    # Open shell in container
./start-container.sh clean    # Remove containers and images
```

### Option 2: Local Installation

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run build
```

## Configuration

### Step 1: Azure App Registration

**📖 [Detailed Guide: AZURE_SETUP.en.md](AZURE_SETUP.en.md)**

Azure App Registration is required to access the Microsoft Teams API.

**Quick Overview:**

1. **Open Azure Portal:** [https://portal.azure.com](https://portal.azure.com)
2. **Create App Registration:**
   - Azure Active Directory → App registrations → New registration
   - Name: `Teams MCP Server`
   - Supported account types: Single tenant or Multi-tenant
3. **Note the values:**
   - Application (client) ID → `AZURE_CLIENT_ID`
   - Directory (tenant) ID → `AZURE_TENANT_ID`
4. **Create Client Secret:**
   - Certificates & secrets → New client secret
   - Copy value → `AZURE_CLIENT_SECRET` (only visible once!)
5. **Add API permissions:**
   - API permissions → Add permission → Microsoft Graph → Delegated permissions
   - Required: `User.Read`, `Team.ReadBasic.All`, `Channel.ReadBasic.All`, `ChannelMessage.Read.All`, `ChannelMessage.Send`, `Group.Read.All`
   - Optional: `OnlineMeetings.ReadWrite`, `Calendars.ReadWrite`
   - Grant admin consent!

**📋 For the complete step-by-step guide with screenshot descriptions, see [AZURE_SETUP.en.md](AZURE_SETUP.en.md)**

### Step 2: Configure .env File

Create a `.env` file in the project directory:

```bash
cp .env.example .env
```

Edit the file with your Azure credentials:

```env
# Azure App Registration (Required)
AZURE_CLIENT_ID=12345678-1234-1234-1234-123456789abc
AZURE_CLIENT_SECRET=aBc123~dEf456_gHi789-jKl012
AZURE_TENANT_ID=87654321-4321-4321-4321-cba987654321

# Teams Bot Configuration (Optional - only for extended bot features)
BOT_ID=12345678-1234-1234-1234-123456789abc
BOT_PASSWORD=aBc123~dEf456_gHi789-jKl012
```

**⚠️ Security:** The `.env` file contains sensitive data and must never be committed to the Git repository!

## Usage

### Using with Claude Code

#### Container-based (Recommended)

Add the container-based server to your Claude Code configuration (`.claude/settings.local.json`):

**With Docker:**
```json
{
  "mcpServers": {
    "teams": {
      "command": "docker",
      "args": ["exec", "-i", "teams-mcp-server", "node", "dist/index.js"],
      "env": {
        "AZURE_CLIENT_ID": "your-client-id",
        "AZURE_CLIENT_SECRET": "your-client-secret",
        "AZURE_TENANT_ID": "your-tenant-id"
      }
    }
  }
}
```

**With Podman:**
```json
{
  "mcpServers": {
    "teams": {
      "command": "podman",
      "args": ["exec", "-i", "teams-mcp-server", "node", "dist/index.js"],
      "env": {
        "AZURE_CLIENT_ID": "your-client-id",
        "AZURE_CLIENT_SECRET": "your-client-secret",
        "AZURE_TENANT_ID": "your-tenant-id"
      }
    }
  }
}
```

**Important:** The container must be started with `./start-container.sh` before use!

#### Local Installation

Add the locally running server to your Claude Code configuration:

```json
{
  "mcpServers": {
    "teams": {
      "command": "node",
      "args": ["/absolute/path/to/teams-mcp-server/dist/index.js"],
      "env": {
        "AZURE_CLIENT_ID": "your-client-id",
        "AZURE_CLIENT_SECRET": "your-client-secret",
        "AZURE_TENANT_ID": "your-tenant-id"
      }
    }
  }
}
```

### Standalone Operation

#### With Container:
```bash
./start-container.sh
./start-container.sh logs  # Follow logs
```

#### Locally:
```bash
npm start
```

## Available Tools

The MCP server provides the following tools:

### `teams_list_channels`
Lists all available Teams channels.

### `teams_read_messages`
Reads messages from a specific channel.

**Parameters:**
- `channelId`: The channel ID
- `limit`: Number of messages to retrieve (optional)

### `teams_send_message`
Sends a message to a Teams channel.

**Parameters:**
- `channelId`: The channel ID
- `message`: The message text

### `teams_get_meetings`
Retrieves upcoming meetings.

**Parameters:**
- `limit`: Number of meetings to retrieve (optional)

## Development

```bash
# Development mode with auto-reload
npm run dev

# Run tests
npm test

# Linting
npm run lint
```

## Project Structure

```
teams-mcp-server/
├── src/
│   ├── index.ts              # Main entry point
│   ├── server.ts             # MCP server implementation
│   ├── teams/                # Teams API integration
│   │   ├── client.ts         # Teams client
│   │   ├── channels.ts       # Channel operations
│   │   ├── messages.ts       # Message operations
│   │   └── meetings.ts       # Meeting operations
│   └── utils/
│       └── config.ts         # Configuration management
├── dist/                     # Compiled files
├── Dockerfile                # Container image definition
├── docker-compose.yml        # Container orchestration
├── start-container.sh        # Container management script
├── .dockerignore             # Docker build exclusions
├── .env.example              # Example environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Security

### General
- **Never** store credentials in code
- Use environment variables for sensitive data
- The `.env` file should not be committed to the repository
- Follow Microsoft Graph API permissions and use only the minimally necessary ones

### Container Security
- Container runs with a non-root user (nodejs:1001)
- Environment variables are securely passed via `.env` or `env_file`
- Minimal Alpine-based image for reduced attack surface
- Multi-stage build reduces image size and removes build dependencies

## Troubleshooting

### Container Issues

**Container won't start:**
```bash
# Check logs
./start-container.sh logs

# Check container status
./start-container.sh status

# Rebuild container
./start-container.sh clean
./start-container.sh build
./start-container.sh
```

**Environment variables not loaded:**
```bash
# Check .env file
cat .env

# Restart container with correct ENV variables
./start-container.sh restart
```

**Teams API connection fails:**
```bash
# Switch to container shell and test
./start-container.sh shell
# In container:
env | grep AZURE  # Check if variables are set
```

### Local Installation

**TypeScript compilation errors:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Azure authentication errors:**
- Check if Azure App Registration is configured correctly
- Ensure the correct API permissions have been granted
- Validate Client ID, Client Secret, and Tenant ID

## License

MIT

## Support

For questions or issues, please open an issue in the repository.

## Next Steps

### Quick Start with Container

1. **Perform Azure App Registration** (see Configuration)
2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and enter Azure credentials
   ```
3. **Start container:**
   ```bash
   ./start-container.sh
   ```
4. **Test server:**
   ```bash
   ./start-container.sh logs  # Check logs for errors
   ```
5. **Connect with Claude Code** (see "Usage" section)
6. **Execute first Teams operation:**
   - In Claude Code: "List all Teams channels"
7. Add more tools as needed

### Local Development

1. **Perform Azure App Registration**
2. **Set up project:**
   ```bash
   npm install
   cp .env.example .env
   # Edit .env
   ```
3. **Develop and test:**
   ```bash
   npm run dev  # Development mode
   ```
4. **Compile and start:**
   ```bash
   npm run build
   npm start
   ```
