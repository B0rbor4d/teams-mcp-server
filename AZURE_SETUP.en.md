[🇩🇪 Deutsch](AZURE_SETUP.md) | 🇬🇧 English

---

# Azure App Registration - Step-by-Step Guide

This guide explains how to create and configure an Azure App Registration for the Teams MCP Server.

**📋 [API Permissions Quick Reference →](API_PERMISSIONS.en.md)**

## Overview

For the Teams MCP Server, you need:
1. **Azure App Registration** (required) - For Microsoft Graph API access
2. **Bot Registration** (optional) - Only if you need bot functionality

**Documentation:**
- This file: Step-by-step setup guide
- [API_PERMISSIONS.en.md](API_PERMISSIONS.en.md): Detailed permissions overview
- [README.en.md](README.en.md): Project overview and quick start

## Part 1: Azure App Registration (Required)

### Step 1: Open Azure Portal

1. Open the [Azure Portal](https://portal.azure.com)
2. Sign in with your Microsoft account
3. Ensure you have selected the correct Azure AD Tenant

### Step 2: Create App Registration

1. **Navigation:**
   - Click on the hamburger menu (☰) in the top left
   - Search for "Azure Active Directory" or "Microsoft Entra ID"
   - Click on "App registrations"

2. **New Registration:**
   - Click on "+ New registration"
   - Fill out the form:
     - **Name:** `Teams MCP Server` (or a name of your choice)
     - **Supported account types:**
       - Select "Accounts in this organizational directory only"
       - For personal Microsoft accounts: "Accounts in any organizational directory and personal Microsoft accounts"
     - **Redirect URI:** Leave blank (not required for MCP Server)
   - Click "Register"

3. **Note important values:**
   After registration, you'll see the overview page. Note:
   - **Application (client) ID** → This is your `AZURE_CLIENT_ID`
   - **Directory (tenant) ID** → This is your `AZURE_TENANT_ID`

### Step 3: Create Client Secret

1. **Navigate to Certificates & secrets:**
   - Click on "Certificates & secrets" in the left menu
   - Select the "Client secrets" tab

2. **Create new secret:**
   - Click on "+ New client secret"
   - **Description:** `Teams MCP Server Secret`
   - **Expires:** Choose a validity period (recommended: 6 or 12 months)
   - Click "Add"

3. **Copy secret value:**
   - ⚠️ **IMPORTANT:** Immediately copy the **Value** (not the Secret ID!)
   - This value is only shown once! → This is your `AZURE_CLIENT_SECRET`
   - Store it securely (e.g., in a password manager)

### Step 4: Configure API Permissions

1. **Navigate to API permissions:**
   - Click on "API permissions" in the left menu

2. **Add Microsoft Graph permissions:**
   - Click on "+ Add a permission"
   - Select "Microsoft Graph"
   - Select "Delegated permissions"

3. **Select required permissions:**

   **For Teams channels and messages:**
   - `Team.ReadBasic.All` - Read Teams information
   - `Channel.ReadBasic.All` - Read channel information
   - `ChannelMessage.Read.All` - Read channel messages
   - `ChannelMessage.Send` - Send messages to channels
   - `Group.Read.All` - Read group information (Teams are groups)
   - `Group.ReadWrite.All` - Read and write groups (if you want to manage Teams)

   **For Meetings:**
   - `OnlineMeetings.ReadWrite` - Read and create meetings
   - `Calendars.ReadWrite` - Read and write calendars
   - `User.Read` - Read basic user profile

4. **Grant permissions:**
   - After adding all permissions
   - Click "Grant admin consent for [Your Tenant]"
   - Confirm with "Yes"
   - ⚠️ **Important:** You need admin rights for this step
   - Status should change to green checkmark ✓

### Step 5: Application Permissions (Optional, for elevated privileges)

If you want to run the app without user interaction:

1. **Add application permissions:**
   - Select "Application permissions" instead of "Delegated permissions"
   - Add corresponding permissions:
     - `Team.ReadBasic.All`
     - `Channel.ReadBasic.All`
     - `ChannelMessage.Read.All`
     - etc.

2. **Grant Admin Consent** (required for Application permissions)

⚠️ **Note:** Application permissions are more powerful and require more security considerations.

### Step 6: Configure .env File

Create a `.env` file in your project directory:

```bash
cd projects/teams-mcp-server
cp .env.example .env
```

Edit the `.env` file with your values:

```env
# Azure App Registration
AZURE_CLIENT_ID=12345678-1234-1234-1234-123456789abc
AZURE_CLIENT_SECRET=aBc123~dEf456_gHi789-jKl012
AZURE_TENANT_ID=87654321-4321-4321-4321-cba987654321
```

### Step 7: Test Connection

After starting the container, you can test the connection:

```bash
# Start container
./start-container.sh

# Check logs
./start-container.sh logs
```

With successful authentication, you should see no error messages.

---

## Part 2: Bot Registration (Optional)

If you need advanced bot functionality (e.g., proactive messages, bot commands):

### Step 1: Create Bot Service

1. **Azure Portal → Create a resource:**
   - Search for "Azure Bot"
   - Click "Create"

2. **Bot configuration:**
   - **Bot handle:** A unique name (e.g., `teams-mcp-bot`)
   - **Subscription:** Your Azure subscription
   - **Resource group:** Create a new one or select an existing one
   - **Pricing tier:** F0 (Free) for testing
   - **Type of App:** "Multi Tenant"
   - **Creation type:** "Use existing app registration"
   - **App ID:** Use the Client ID from Part 1

3. **Create:**
   - Click "Review + create"
   - Then click "Create"

### Step 2: Connect Bot with Teams

1. **Configure channels:**
   - Open your bot resource
   - Click on "Channels"
   - Click on "Microsoft Teams" icon
   - Accept the Terms of Service
   - Click "Agree"

2. **Configure messaging endpoint:**
   - Go to "Configuration"
   - **Messaging endpoint:** `https://your-domain.com/api/messages`
   - (This is only relevant if you have a public endpoint)

### Step 3: Add Bot Credentials to .env

```env
# Teams Bot Configuration (Optional)
BOT_ID=12345678-1234-1234-1234-123456789abc
BOT_PASSWORD=aBc123~dEf456_gHi789-jKl012
```

**Note:** For the MCP Server, these are the same values as Client ID and Client Secret from the App Registration.

---

## Summary: What You Need

### Minimal Configuration (App Registration Only):

```env
AZURE_CLIENT_ID=<Application (client) ID>
AZURE_CLIENT_SECRET=<Client Secret Value>
AZURE_TENANT_ID=<Directory (tenant) ID>
```

### With Bot Functionality:

```env
AZURE_CLIENT_ID=<Application (client) ID>
AZURE_CLIENT_SECRET=<Client Secret Value>
AZURE_TENANT_ID=<Directory (tenant) ID>
BOT_ID=<Application (client) ID>
BOT_PASSWORD=<Client Secret Value>
```

---

## API Permissions: Overview Table

| Permission | Type | Purpose | Required |
|------------|------|---------|----------|
| `User.Read` | Delegated | Basic user profile | ✓ Yes |
| `Team.ReadBasic.All` | Delegated | List Teams | ✓ Yes |
| `Channel.ReadBasic.All` | Delegated | List channels | ✓ Yes |
| `ChannelMessage.Read.All` | Delegated | Read messages | ✓ Yes |
| `ChannelMessage.Send` | Delegated | Send messages | ✓ Yes |
| `Group.Read.All` | Delegated | Teams information | ✓ Yes |
| `Group.ReadWrite.All` | Delegated | Manage Teams | Optional |
| `OnlineMeetings.ReadWrite` | Delegated | Create/read meetings | Optional |
| `Calendars.ReadWrite` | Delegated | Calendar access | Optional |

---

## Common Errors and Solutions

### Error: "AADSTS700016: Application not found"
**Solution:** Check the `AZURE_CLIENT_ID` and `AZURE_TENANT_ID`

### Error: "Invalid client secret"
**Solution:**
- Create a new Client Secret
- Copy the value immediately after creation
- Make sure to copy the **Value**, not the Secret ID

### Error: "Insufficient privileges"
**Solution:**
- Check if Admin Consent has been granted
- Ensure you are logged in as an administrator
- Green checkmark ✓ must be visible for all permissions

### Error: "Tenant does not exist"
**Solution:**
- Check the `AZURE_TENANT_ID`
- Ensure you are logged into the correct Azure AD Tenant

---

## Security Notes

1. **Protect Client Secret:**
   - Never store in code or Git repository
   - Only in `.env` file (which is in `.gitignore`)
   - Rotate regularly (every 6-12 months)

2. **Minimal Permissions:**
   - Only grant the really necessary API permissions
   - Application permissions only if really necessary

3. **Monitoring:**
   - Regularly check Azure AD Sign-in Logs
   - Watch for unusual activities

4. **Multi-Factor Authentication:**
   - Enable MFA for admin accounts

---

## Next Steps

After successful Azure registration:

1. ✓ Create `.env` file with credentials
2. ✓ Start container: `./start-container.sh`
3. ✓ Check logs: `./start-container.sh logs`
4. ✓ Connect with Claude Code (see README.en.md)
5. ✓ Test first Teams operation

## Support Links

- [Azure App Registration Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [Microsoft Graph API Permissions](https://docs.microsoft.com/en-us/graph/permissions-reference)
- [Azure Bot Service Documentation](https://docs.microsoft.com/en-us/azure/bot-service/)
- [Teams App Development](https://docs.microsoft.com/en-us/microsoftteams/platform/)
