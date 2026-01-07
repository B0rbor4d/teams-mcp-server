[🇩🇪 Deutsch](AUTH_MODES.md) | 🇬🇧 English

---

# Authentication Modes - Detailed Documentation

The Teams MCP Server supports three different authentication modes that determine how the server identifies itself to Microsoft Teams and which name appears on messages.

## 📋 Overview of Modes

| Mode | Identity | Azure Permissions | Use Case |
|------|----------|-------------------|----------|
| **application** | App itself (bot) | Application | Automation, bot services |
| **delegated** | Logged-in user | Delegated | Interactive applications |
| **user** | Specific user | Delegated | User impersonation |

---

## 🤖 Mode 1: Application (Recommended)

### Description

The app acts as its **own identity** - like a bot or service account.

### Configuration

**.env:**
```env
AUTH_MODE=application
BOT_DISPLAY_NAME=Teams MCP Server
```

**Azure Permissions:**
```
Application Permissions (NOT Delegated!)
- Team.ReadBasic.All
- Channel.ReadBasic.All
- ChannelMessage.Read.All
- ChannelMessage.Send
- Group.Read.All
- etc.

→ Grant Admin Consent!
```

### How Messages Appear

**In Teams:**
```
[App Icon] Teams MCP Server
Hello, this is an automated message!
```

The name comes from:
1. `BOT_DISPLAY_NAME` in .env (if set)
2. Otherwise: App name from Azure AD

### Advantages

✅ Clear identity as bot/automation
✅ No user login required
✅ Runs in background without user context
✅ Consistent name across all messages
✅ **Ideal for MCP Server**

### Disadvantages

❌ Requires Application Permissions (higher privileges)
❌ Requires Admin Consent
❌ Messages are clearly marked as "bot"

### Usage

```typescript
// In .env
AUTH_MODE=application
BOT_DISPLAY_NAME=🤖 Claude MCP Bot

// Teams shows:
// "🤖 Claude MCP Bot wrote: Hello team!"
```

---

## 👤 Mode 2: Delegated

### Description

The app acts **on behalf of a logged-in user**. The user must log in interactively.

### Configuration

**.env:**
```env
AUTH_MODE=delegated
```

**Azure Permissions:**
```
Delegated Permissions
- User.Read
- Team.ReadBasic.All
- Channel.ReadBasic.All
- ChannelMessage.Read.All
- ChannelMessage.Send
- Group.Read.All
- etc.

→ Admin Consent recommended
```

### How Messages Appear

**In Teams:**
```
[User Avatar] John Doe
Hello, this is a message!
```

The name is the **real name of the logged-in user**.

### Advantages

✅ Messages appear from real user
✅ No "bot" label
✅ Personal context
✅ Lower permissions sufficient

### Disadvantages

❌ User must log in interactively
❌ Token expires (refresh required)
❌ Not ideal for automation
❌ **IMPORTANT:** Not fully possible with ClientSecretCredential!

### Note

⚠️ **Limitation:** The current code uses `ClientSecretCredential`, which is actually meant for Application mode. For true Delegated mode with interactive login, `DeviceCodeCredential` or `InteractiveBrowserCredential` would be needed.

The delegated mode in the current implementation works similarly to application mode, but uses Delegated Permissions.

---

## 🎭 Mode 3: User (Specific User)

### Description

The app acts as a **specific user** (impersonation). Similar to delegated, but with a fixed configured User ID.

### Configuration

**.env:**
```env
AUTH_MODE=user
AUTH_USER_ID=12345678-1234-1234-1234-123456789abc
```

**Find User ID:**
```
Azure Portal → Azure Active Directory → Users → [User] → Object ID
```

**Azure Permissions:**
```
Delegated Permissions (like delegated mode)
+ possibly User.Read.All (to read other users)
```

### How Messages Appear

**In Teams:**
```
[User Avatar] Service Account Bot
Hello, this is an automated message!
```

### Advantages

✅ Fixed identity without interactive login
✅ Messages from "real" user
✅ Good for service accounts
✅ Consistent across all messages

### Disadvantages

❌ Requires dedicated service account
❌ User ID must be known
❌ Same ClientSecret limitation as delegated

### Usage

```typescript
// In .env
AUTH_MODE=user
AUTH_USER_ID=a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6

// Teams shows:
// "Bot Service Account wrote: Status update"
```

---

## 🎨 Message Signatures

In addition to Auth Mode, you can add **signatures** to messages:

### Configuration

**.env:**
```env
MESSAGE_ADD_SIGNATURE=true
MESSAGE_SIGNATURE=\n\n---\n🤖 Automatically sent via Claude Code
```

### Example

**Without Signature:**
```
Hello team, here's an update!
```

**With Signature:**
```
Hello team, here's an update!

---
🤖 Automatically sent via Claude Code
```

### Default Signature

If `MESSAGE_SIGNATURE` is not set:
```
\n\n---\n🤖 Sent via Teams MCP Server
```

---

## 🔧 Combination Options

### Option A: Bot Identity with Signature

```env
AUTH_MODE=application
BOT_DISPLAY_NAME=🤖 Teams Bot
MESSAGE_ADD_SIGNATURE=true
MESSAGE_SIGNATURE=\n\nℹ️ This is an automated message
```

**Result in Teams:**
```
🤖 Teams Bot
Status update: Build successful!

ℹ️ This is an automated message
```

### Option B: User Identity without Signature

```env
AUTH_MODE=delegated
MESSAGE_ADD_SIGNATURE=false
```

**Result in Teams:**
```
John Doe
Status update: Build successful!
```

### Option C: Service Account with Branding

```env
AUTH_MODE=user
AUTH_USER_ID=service-bot-user-id
MESSAGE_ADD_SIGNATURE=true
MESSAGE_SIGNATURE=\n\n---\n📢 DevOps Notification Service
```

**Result in Teams:**
```
DevOps Bot Account
Status update: Build successful!

---
📢 DevOps Notification Service
```

---

## ⚙️ Azure Configuration by Mode

### For Application Mode

1. **API Permissions → Application permissions:**
   ```
   Team.ReadBasic.All (Application)
   Channel.ReadBasic.All (Application)
   ChannelMessage.Read.All (Application)
   ChannelMessage.Send (Application)
   ```

2. **Grant Admin Consent** (required!)

3. **Optional: Customize app name:**
   - Azure AD → App registrations → Your app
   - Branding & properties → Change name

### For Delegated/User Mode

1. **API Permissions → Delegated permissions:**
   ```
   User.Read
   Team.ReadBasic.All
   Channel.ReadBasic.All
   ChannelMessage.Read.All
   ChannelMessage.Send
   ```

2. **Admin Consent recommended** (but not mandatory)

3. **For User Mode: Provide User ID**

---

## 🧪 Testing the Modes

After starting, the server displays the current configuration:

```
=== Teams MCP Server Configuration ===
Auth Mode: application
Tenant ID: 87654321-4321-4321-4321-cba987654321
Client ID: 12345678-1234-1234-1234-123456789abc
Display Name: "🤖 Teams MCP Server"
Signature: Active
Signature text: "\n\n---\n🤖 Automatically sent"
=====================================
Teams Client initialized in "application" mode
✓ Connection test successful
Teams MCP Server started
```

### Send Test Messages

```bash
# In Claude Code:
"Send a test message to the General channel"

# Check in Teams:
# - Which name appears as sender?
# - Is a signature visible?
# - Is the icon/avatar correct?
```

---

## 🎯 Recommendations

### For MCP Server / Claude Code:
→ **application Mode**
- Clear bot identity
- No user login required
- Consistent automation

### For Personal Tools:
→ **delegated Mode**
- Messages from own account
- Personal context

### For Service Accounts:
→ **user Mode**
- Dedicated bot account
- Clear service identity

### Add Signature?
→ **Yes, if:**
- Clarity about automation desired
- Branding important
- Legal notice required

→ **No, if:**
- Bot name is already sufficient
- Messages should appear "natural"

---

## 🚨 Common Errors

### "Insufficient privileges"
**Problem:** Wrong permission type
**Solution:** Application Mode → Application Permissions, Delegated Mode → Delegated Permissions

### "Access denied"
**Problem:** Admin Consent missing
**Solution:** Grant Admin Consent in Azure

### "User not found"
**Problem:** AUTH_USER_ID invalid
**Solution:** Use correct Object ID from Azure AD

### "401 Unauthorized"
**Problem:** Client Secret wrong/expired
**Solution:** Create new Client Secret

---

## 📚 Additional Resources

- [Microsoft Graph Permissions](https://docs.microsoft.com/en-us/graph/permissions-reference)
- [Application vs Delegated Permissions](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent)
- [Azure AD Authentication](https://docs.microsoft.com/en-us/azure/active-directory/develop/authentication-scenarios)

---

## 💡 Quick Configuration

### Fastest Start (Application Mode):

```bash
# .env
AUTH_MODE=application
BOT_DISPLAY_NAME=MCP Bot
MESSAGE_ADD_SIGNATURE=false

# Azure: Application Permissions + Admin Consent
# Done!
```

### Maximum Flexibility:

```bash
# .env
AUTH_MODE=application
BOT_DISPLAY_NAME=🤖 Claude Teams Bot
MESSAGE_ADD_SIGNATURE=true
MESSAGE_SIGNATURE=\n\n---\n✨ Powered by Claude Code\n📅 $(date)

# Azure: Application Permissions
# Extra: Dynamic signatures, logging, etc.
```
