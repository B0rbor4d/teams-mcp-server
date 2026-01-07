[🇩🇪 Deutsch](API_PERMISSIONS.md) | 🇬🇧 English

---

# Microsoft Graph API Permissions - Quick Reference

This file lists all Microsoft Graph API permissions required for various features of the Teams MCP Server.

## Overview

The Teams MCP Server uses **Delegated Permissions** (on behalf of a user). Application Permissions are optional for advanced use cases.

## Required Permissions (Minimum)

These permissions are required for basic functionality:

| Permission | Purpose | MCP Tools |
|------------|---------|-----------|
| `User.Read` | Read basic user profile | All (for authentication) |
| `Team.ReadBasic.All` | List Teams and basic information | `teams_list_channels` |
| `Channel.ReadBasic.All` | List channels and basic information | `teams_list_channels` |
| `ChannelMessage.Read.All` | Read messages in channels | `teams_read_messages` |
| `ChannelMessage.Send` | Send messages to channels | `teams_send_message`, `teams_reply_to_message` |
| `Group.Read.All` | Read Teams group information | `teams_list_channels` |

## Optional Permissions

These permissions extend functionality:

### For Advanced Teams Management

| Permission | Purpose | Required for |
|------------|---------|--------------|
| `Group.ReadWrite.All` | Create, edit, delete Teams | Team management |
| `TeamSettings.ReadWrite.All` | Change team settings | Team configuration |
| `TeamMember.ReadWrite.All` | Add/remove members | Member management |

### For Meetings

| Permission | Purpose | MCP Tools |
|------------|---------|-----------|
| `OnlineMeetings.ReadWrite` | Create and read meetings | `teams_create_meeting`, `teams_get_meetings` |
| `Calendars.ReadWrite` | Calendar access for meeting planning | `teams_create_meeting`, `teams_get_meetings` |
| `OnlineMeetings.Read` | Only read meetings (without write access) | `teams_get_meetings`, `teams_get_meeting_by_id` |

### For Advanced Message Features

| Permission | Purpose | Required for |
|------------|---------|--------------|
| `ChannelMessage.Edit` | Edit own messages | Message editing |
| `ChannelMessage.Delete` | Delete own messages | Message deletion |
| `Chat.Read` | Read private chat messages | 1:1 and group chats |
| `Chat.ReadWrite` | Read and write private chats | 1:1 and group chats |

### For Files and SharePoint

| Permission | Purpose | Required for |
|------------|---------|--------------|
| `Files.Read.All` | Read files in Teams | File access |
| `Files.ReadWrite.All` | Read/write files in Teams | File upload/download |
| `Sites.Read.All` | Read SharePoint sites | Teams documents |

## Permission Types: Delegated vs. Application

### Delegated Permissions (Recommended)

- **Context:** On behalf of a logged-in user
- **Usage:** MCP Server acts as the user
- **Advantage:** Natural permission boundaries
- **Disadvantage:** User must be logged in

**Recommended for MCP Server**, as Claude Code works in user context.

### Application Permissions (Advanced)

- **Context:** As standalone application (without user)
- **Usage:** For background services and automation
- **Advantage:** Runs without user interaction
- **Disadvantage:** Wide-reaching privileges, requires Admin Consent

**Examples for Application Permissions:**
- `Team.ReadBasic.All` (Application)
- `Channel.ReadBasic.All` (Application)
- `ChannelMessage.Read.All` (Application)

⚠️ **Important:** Application Permissions always require Admin Consent!

## Configuration in Azure Portal

### Step-by-Step

1. **Open Azure Portal:** [https://portal.azure.com](https://portal.azure.com)
2. **Navigate to App Registration:**
   - Azure Active Directory → App registrations → Your app
3. **Open API permissions:**
   - Left menu → API permissions
4. **Add permission:**
   - Click "+ Add a permission"
   - Select "Microsoft Graph"
   - Select "Delegated permissions"
   - Search and enable the desired permissions
5. **Grant Admin Consent:**
   - Click "Grant admin consent for [Tenant]"
   - Confirm with "Yes"
   - Green checkmark ✓ appears at Status

## Minimal Configuration for Teams MCP Server

For a working basic installation, you need:

```
✓ User.Read
✓ Team.ReadBasic.All
✓ Channel.ReadBasic.All
✓ ChannelMessage.Read.All
✓ ChannelMessage.Send
✓ Group.Read.All
```

Admin Consent: **YES** ✓

## Extended Configuration with Meetings

For full functionality including meetings:

```
✓ User.Read
✓ Team.ReadBasic.All
✓ Channel.ReadBasic.All
✓ ChannelMessage.Read.All
✓ ChannelMessage.Send
✓ Group.Read.All
✓ OnlineMeetings.ReadWrite
✓ Calendars.ReadWrite
```

Admin Consent: **YES** ✓

## Permissions per MCP Tool

### `teams_list_channels`

**Requires:**
- `Team.ReadBasic.All`
- `Channel.ReadBasic.All`
- `Group.Read.All`

### `teams_read_messages`

**Requires:**
- `ChannelMessage.Read.All`
- `Team.ReadBasic.All`
- `Channel.ReadBasic.All`

### `teams_send_message`

**Requires:**
- `ChannelMessage.Send`
- `Team.ReadBasic.All`
- `Channel.ReadBasic.All`

### `teams_reply_to_message`

**Requires:**
- `ChannelMessage.Send`
- `ChannelMessage.Read.All` (to read original message)
- `Team.ReadBasic.All`
- `Channel.ReadBasic.All`

### `teams_get_meetings`

**Requires:**
- `OnlineMeetings.ReadWrite` or `OnlineMeetings.Read`
- `Calendars.ReadWrite` or `Calendars.Read`

### `teams_get_meeting_by_id`

**Requires:**
- `OnlineMeetings.ReadWrite` or `OnlineMeetings.Read`
- `Calendars.ReadWrite` or `Calendars.Read`

### `teams_create_meeting`

**Requires:**
- `OnlineMeetings.ReadWrite`
- `Calendars.ReadWrite`

## Common Errors

### "Insufficient privileges to complete the operation"

**Cause:** Missing permissions or Admin Consent not granted

**Solution:**
1. Check if all required permissions have been added
2. Ensure Admin Consent has been granted (green checkmark ✓)
3. If necessary, log in again for new permissions to take effect

### "Access is denied"

**Cause:** Wrong permission type (Delegated vs. Application)

**Solution:**
- For MCP Server: Use **Delegated permissions**
- Check the permission type in Azure Portal

### "The user or administrator has not consented"

**Cause:** Admin Consent missing

**Solution:**
1. Go to API permissions
2. Click "Grant admin consent for [Tenant]"
3. Wait a few minutes for changes to take effect

## Admin Consent

### What is Admin Consent?

Admin Consent is an administrator's permission for an application to access organization data.

### When is Admin Consent required?

- For all permissions that access organization data
- Especially for Application Permissions
- For most Microsoft Graph API permissions

### How do I grant Admin Consent?

1. **In Azure Portal:**
   - API permissions → "Grant admin consent for [Tenant]"

2. **Via URL (dynamic):**
   ```
   https://login.microsoftonline.com/{tenant-id}/adminconsent?client_id={app-id}
   ```

3. **Via PowerShell:**
   ```powershell
   Connect-AzureAD
   New-AzureADServiceAppRoleAssignment -ObjectId <ServicePrincipalObjectId> -PrincipalId <ServicePrincipalObjectId> -ResourceId <ResourceServicePrincipalObjectId> -Id <AppRoleId>
   ```

## Testing Permissions

After configuration, you can test the permissions:

```bash
# Start container
./start-container.sh

# Check logs for authentication errors
./start-container.sh logs

# Test in Claude Code:
# "List all Teams channels"
```

With permission errors, you'll see messages like:
- "Access is denied"
- "Insufficient privileges"
- "Authorization_RequestDenied"

## Additional Resources

- [Microsoft Graph Permissions Reference](https://docs.microsoft.com/en-us/graph/permissions-reference)
- [Teams API Permissions](https://docs.microsoft.com/en-us/graph/teams-concept-overview)
- [Delegated vs Application Permissions](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent)
- [Admin Consent Workflow](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/configure-admin-consent-workflow)

## Summary

### Quick Setup (Copy-Paste for Azure Portal)

**Minimal (Channels & Messages only):**
```
User.Read
Team.ReadBasic.All
Channel.ReadBasic.All
ChannelMessage.Read.All
ChannelMessage.Send
Group.Read.All
```

**Complete (with Meetings):**
```
User.Read
Team.ReadBasic.All
Channel.ReadBasic.All
ChannelMessage.Read.All
ChannelMessage.Send
Group.Read.All
OnlineMeetings.ReadWrite
Calendars.ReadWrite
```

**Don't forget:** Grant Admin Consent! ✓
