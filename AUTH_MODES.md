🇩🇪 Deutsch | [🇬🇧 English](AUTH_MODES.en.md)

---

# Authentifizierungsmodi - Ausführliche Dokumentation

Der Teams MCP Server unterstützt drei verschiedene Authentifizierungsmodi, die bestimmen, wie der Server sich gegenüber Microsoft Teams identifiziert und mit welchem Namen Nachrichten erscheinen.

## 📋 Übersicht der Modi

| Modus | Identität | Azure Permissions | Anwendungsfall |
|-------|-----------|-------------------|----------------|
| **application** | App selbst (Bot) | Application | Automatisierung, Bot-Services |
| **delegated** | Angemeldeter Benutzer | Delegated | Interaktive Anwendungen |
| **user** | Spezifischer Benutzer | Delegated | Benutzer-Impersonation |

---

## 🤖 Modus 1: Application (Empfohlen)

### Beschreibung

Die App agiert als **eigene Identität** - wie ein Bot oder Service-Account.

### Konfiguration

**.env:**
```env
AUTH_MODE=application
BOT_DISPLAY_NAME=Teams MCP Server
```

**Azure-Berechtigungen:**
```
Application Permissions (NICHT Delegated!)
- Team.ReadBasic.All
- Channel.ReadBasic.All
- ChannelMessage.Read.All
- ChannelMessage.Send
- Group.Read.All
- etc.

→ Admin Consent erteilen!
```

### Wie erscheinen Nachrichten?

**In Teams:**
```
[App-Icon] Teams MCP Server
Hallo, dies ist eine automatische Nachricht!
```

Der Name kommt aus:
1. `BOT_DISPLAY_NAME` in .env (falls gesetzt)
2. Sonst: App-Name aus Azure AD

### Vorteile

✅ Klare Identität als Bot/Automatisierung
✅ Keine Benutzeranmeldung erforderlich
✅ Läuft im Hintergrund ohne User-Kontext
✅ Konsistenter Name über alle Nachrichten
✅ **Ideal für MCP Server**

### Nachteile

❌ Benötigt Application Permissions (höhere Rechte)
❌ Benötigt Admin Consent
❌ Nachrichten sind klar als "Bot" erkennbar

### Verwendung

```typescript
// In .env
AUTH_MODE=application
BOT_DISPLAY_NAME=🤖 Claude MCP Bot

// Teams zeigt:
// "🤖 Claude MCP Bot hat geschrieben: Hallo Team!"
```

---

## 👤 Modus 2: Delegated

### Beschreibung

Die App agiert **im Namen eines angemeldeten Benutzers**. Der Benutzer muss sich interaktiv anmelden.

### Konfiguration

**.env:**
```env
AUTH_MODE=delegated
```

**Azure-Berechtigungen:**
```
Delegated Permissions
- User.Read
- Team.ReadBasic.All
- Channel.ReadBasic.All
- ChannelMessage.Read.All
- ChannelMessage.Send
- Group.Read.All
- etc.

→ Admin Consent empfohlen
```

### Wie erscheinen Nachrichten?

**In Teams:**
```
[Benutzer-Avatar] Max Mustermann
Hallo, dies ist eine Nachricht!
```

Der Name ist der **echte Name des angemeldeten Benutzers**.

### Vorteile

✅ Nachrichten erscheinen vom echten Benutzer
✅ Keine "Bot"-Kennzeichnung
✅ Persönlicher Kontext
✅ Niedrigere Berechtigungen ausreichend

### Nachteile

❌ Benutzer muss sich interaktiv anmelden
❌ Token läuft ab (Refresh erforderlich)
❌ Nicht ideal für Automatisierung
❌ **WICHTIG:** Mit ClientSecretCredential nicht vollständig möglich!

### Hinweis

⚠️ **Einschränkung:** Der aktuelle Code verwendet `ClientSecretCredential`, was eigentlich für Application-Mode gedacht ist. Für echten Delegated-Mode mit interaktiver Anmeldung wäre `DeviceCodeCredential` oder `InteractiveBrowserCredential` nötig.

Der delegated-Modus in der aktuellen Implementierung funktioniert ähnlich wie application, nutzt aber Delegated Permissions.

---

## 🎭 Modus 3: User (Spezifischer Benutzer)

### Beschreibung

Die App agiert als **spezifischer Benutzer** (Impersonation). Ähnlich wie delegated, aber mit fest konfigurierter User-ID.

### Konfiguration

**.env:**
```env
AUTH_MODE=user
AUTH_USER_ID=12345678-1234-1234-1234-123456789abc
```

**User-ID finden:**
```
Azure Portal → Azure Active Directory → Users → [Benutzer] → Object ID
```

**Azure-Berechtigungen:**
```
Delegated Permissions (wie bei delegated-Mode)
+ eventuell User.Read.All (um andere Benutzer zu lesen)
```

### Wie erscheinen Nachrichten?

**In Teams:**
```
[Benutzer-Avatar] Service Account Bot
Hallo, dies ist eine automatisierte Nachricht!
```

### Vorteile

✅ Feste Identität ohne interaktive Anmeldung
✅ Nachrichten von "echtem" Benutzer
✅ Gut für Service-Accounts
✅ Konsistent über alle Nachrichten

### Nachteile

❌ Benötigt dedizierten Service-Account
❌ User-ID muss bekannt sein
❌ Gleiche ClientSecret-Einschränkung wie delegated

### Verwendung

```typescript
// In .env
AUTH_MODE=user
AUTH_USER_ID=a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6

// Teams zeigt:
// "Bot Service Account hat geschrieben: Status-Update"
```

---

## 🎨 Nachrichten-Signaturen

Zusätzlich zum Auth-Mode können Sie **Signaturen** zu Nachrichten hinzufügen:

### Konfiguration

**.env:**
```env
MESSAGE_ADD_SIGNATURE=true
MESSAGE_SIGNATURE=\n\n---\n🤖 Automatisch gesendet via Claude Code
```

### Beispiel

**Ohne Signatur:**
```
Hallo Team, hier ist ein Update!
```

**Mit Signatur:**
```
Hallo Team, hier ist ein Update!

---
🤖 Automatisch gesendet via Claude Code
```

### Standard-Signatur

Falls `MESSAGE_SIGNATURE` nicht gesetzt ist:
```
\n\n---\n🤖 Gesendet via Teams MCP Server
```

---

## 🔧 Kombinationsmöglichkeiten

### Option A: Bot-Identität mit Signatur

```env
AUTH_MODE=application
BOT_DISPLAY_NAME=🤖 Teams Bot
MESSAGE_ADD_SIGNATURE=true
MESSAGE_SIGNATURE=\n\nℹ️ Dies ist eine automatische Nachricht
```

**Resultat in Teams:**
```
🤖 Teams Bot
Statusupdate: Build erfolgreich!

ℹ️ Dies ist eine automatische Nachricht
```

### Option B: Benutzer-Identität ohne Signatur

```env
AUTH_MODE=delegated
MESSAGE_ADD_SIGNATURE=false
```

**Resultat in Teams:**
```
Max Mustermann
Statusupdate: Build erfolgreich!
```

### Option C: Service-Account mit Branding

```env
AUTH_MODE=user
AUTH_USER_ID=service-bot-user-id
MESSAGE_ADD_SIGNATURE=true
MESSAGE_SIGNATURE=\n\n---\n📢 DevOps Notification Service
```

**Resultat in Teams:**
```
DevOps Bot Account
Statusupdate: Build erfolgreich!

---
📢 DevOps Notification Service
```

---

## ⚙️ Azure-Konfiguration je nach Modus

### Für Application Mode

1. **API Permissions → Application permissions:**
   ```
   Team.ReadBasic.All (Application)
   Channel.ReadBasic.All (Application)
   ChannelMessage.Read.All (Application)
   ChannelMessage.Send (Application)
   ```

2. **Admin Consent erteilen** (erforderlich!)

3. **Optional: App-Name anpassen:**
   - Azure AD → App registrations → Ihre App
   - Branding & properties → Name ändern

### Für Delegated/User Mode

1. **API Permissions → Delegated permissions:**
   ```
   User.Read
   Team.ReadBasic.All
   Channel.ReadBasic.All
   ChannelMessage.Read.All
   ChannelMessage.Send
   ```

2. **Admin Consent empfohlen** (aber nicht zwingend)

3. **Für User-Mode: User-ID bereitstellen**

---

## 🧪 Testen der Modi

Nach dem Start zeigt der Server die aktuelle Konfiguration:

```
=== Teams MCP Server Konfiguration ===
Auth Mode: application
Tenant ID: 87654321-4321-4321-4321-cba987654321
Client ID: 12345678-1234-1234-1234-123456789abc
Display Name: "🤖 Teams MCP Server"
Signatur: Aktiv
Signaturtext: "\n\n---\n🤖 Automatisch gesendet"
=====================================
Teams Client initialisiert im "application" Modus
✓ Verbindungstest erfolgreich
Teams MCP Server gestartet
```

### Test-Nachrichten senden

```bash
# In Claude Code:
"Sende eine Testnachricht in den General-Kanal"

# Überprüfen Sie in Teams:
# - Welcher Name erscheint als Absender?
# - Ist eine Signatur sichtbar?
# - Stimmt das Icon/Avatar?
```

---

## 🎯 Empfehlungen

### Für MCP Server / Claude Code:
→ **application Mode**
- Klare Bot-Identität
- Keine Benutzeranmeldung nötig
- Konsistente Automatisierung

### Für persönliche Tools:
→ **delegated Mode**
- Nachrichten vom eigenen Account
- Persönlicher Kontext

### Für Service-Accounts:
→ **user Mode**
- Dedizierter Bot-Account
- Klare Service-Identität

### Signatur hinzufügen?
→ **Ja, wenn:**
- Klarheit über Automatisierung gewünscht
- Branding wichtig
- Rechtlicher Hinweis nötig

→ **Nein, wenn:**
- Bot-Name bereits ausreichend
- Nachrichten sollen "natürlich" wirken

---

## 🚨 Häufige Fehler

### "Insufficient privileges"
**Problem:** Falsche Permission-Type
**Lösung:** Application Mode → Application Permissions, Delegated Mode → Delegated Permissions

### "Access denied"
**Problem:** Admin Consent fehlt
**Lösung:** Admin Consent in Azure erteilen

### "User not found"
**Problem:** AUTH_USER_ID ungültig
**Lösung:** Korrekte Object-ID aus Azure AD verwenden

### "401 Unauthorized"
**Problem:** Client Secret falsch/abgelaufen
**Lösung:** Neues Client Secret erstellen

---

## 📚 Weitere Ressourcen

- [Microsoft Graph Permissions](https://docs.microsoft.com/en-us/graph/permissions-reference)
- [Application vs Delegated Permissions](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent)
- [Azure AD Authentication](https://docs.microsoft.com/en-us/azure/active-directory/develop/authentication-scenarios)

---

## 💡 Schnell-Konfiguration

### Schnellster Start (Application Mode):

```bash
# .env
AUTH_MODE=application
BOT_DISPLAY_NAME=MCP Bot
MESSAGE_ADD_SIGNATURE=false

# Azure: Application Permissions + Admin Consent
# Fertig!
```

### Maximale Flexibilität:

```bash
# .env
AUTH_MODE=application
BOT_DISPLAY_NAME=🤖 Claude Teams Bot
MESSAGE_ADD_SIGNATURE=true
MESSAGE_SIGNATURE=\n\n---\n✨ Powered by Claude Code\n📅 $(date)

# Azure: Application Permissions
# Zusatz: Dynamische Signaturen, Logging, etc.
```
