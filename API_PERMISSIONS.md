🇩🇪 Deutsch | [🇬🇧 English](API_PERMISSIONS.en.md)

---

# Microsoft Graph API-Berechtigungen - Schnellreferenz

Diese Datei listet alle Microsoft Graph API-Berechtigungen auf, die für verschiedene Funktionen des Teams MCP Servers benötigt werden.

## Übersicht

Der Teams MCP Server verwendet **Delegated Permissions** (im Namen eines Benutzers). Application Permissions sind optional für fortgeschrittene Anwendungsfälle.

## Erforderliche Berechtigungen (Minimum)

Diese Berechtigungen sind für die Basis-Funktionalität erforderlich:

| Berechtigung | Zweck | MCP Tools |
|--------------|-------|-----------|
| `User.Read` | Basis-Benutzerprofil lesen | Alle (für Authentifizierung) |
| `Team.ReadBasic.All` | Teams auflisten und Basis-Informationen | `teams_list_channels` |
| `Channel.ReadBasic.All` | Kanäle auflisten und Basis-Informationen | `teams_list_channels` |
| `ChannelMessage.Read.All` | Nachrichten in Kanälen lesen | `teams_read_messages` |
| `ChannelMessage.Send` | Nachrichten in Kanäle senden | `teams_send_message`, `teams_reply_to_message` |
| `Group.Read.All` | Teams-Gruppen-Informationen lesen | `teams_list_channels` |

## Optionale Berechtigungen

Diese Berechtigungen erweitern die Funktionalität:

### Für erweiterte Teams-Verwaltung

| Berechtigung | Zweck | Benötigt für |
|--------------|-------|--------------|
| `Group.ReadWrite.All` | Teams erstellen, bearbeiten, löschen | Team-Verwaltung |
| `TeamSettings.ReadWrite.All` | Team-Einstellungen ändern | Team-Konfiguration |
| `TeamMember.ReadWrite.All` | Mitglieder hinzufügen/entfernen | Mitglieder-Verwaltung |

### Für Meetings

| Berechtigung | Zweck | MCP Tools |
|--------------|-------|-----------|
| `OnlineMeetings.ReadWrite` | Meetings erstellen und lesen | `teams_create_meeting`, `teams_get_meetings` |
| `Calendars.ReadWrite` | Kalender-Zugriff für Meeting-Planung | `teams_create_meeting`, `teams_get_meetings` |
| `OnlineMeetings.Read` | Nur Meetings lesen (ohne Schreibrechte) | `teams_get_meetings`, `teams_get_meeting_by_id` |

### Für erweiterte Nachrichten-Funktionen

| Berechtigung | Zweck | Benötigt für |
|--------------|-------|--------------|
| `ChannelMessage.Edit` | Eigene Nachrichten bearbeiten | Nachrichtenbearbeitung |
| `ChannelMessage.Delete` | Eigene Nachrichten löschen | Nachrichtenlöschung |
| `Chat.Read` | Private Chat-Nachrichten lesen | 1:1 und Gruppenchats |
| `Chat.ReadWrite` | Private Chats lesen und schreiben | 1:1 und Gruppenchats |

### Für Dateien und SharePoint

| Berechtigung | Zweck | Benötigt für |
|--------------|-------|--------------|
| `Files.Read.All` | Dateien in Teams lesen | Datei-Zugriff |
| `Files.ReadWrite.All` | Dateien in Teams lesen/schreiben | Datei-Upload/Download |
| `Sites.Read.All` | SharePoint-Sites lesen | Teams-Dokumente |

## Berechtigungstypen: Delegated vs. Application

### Delegated Permissions (Empfohlen)

- **Kontext:** Im Namen eines angemeldeten Benutzers
- **Verwendung:** MCP Server agiert als der Benutzer
- **Vorteil:** Natürliche Berechtigungsgrenzen
- **Nachteil:** Benutzer muss angemeldet sein

**Für den MCP Server empfohlen**, da Claude Code im Benutzerkontext arbeitet.

### Application Permissions (Fortgeschritten)

- **Kontext:** Als eigenständige Anwendung (ohne Benutzer)
- **Verwendung:** Für Hintergrund-Services und Automatisierung
- **Vorteil:** Läuft ohne Benutzerinteraktion
- **Nachteil:** Weitreichende Rechte, benötigt Admin Consent

**Beispiele für Application Permissions:**
- `Team.ReadBasic.All` (Application)
- `Channel.ReadBasic.All` (Application)
- `ChannelMessage.Read.All` (Application)

⚠️ **Wichtig:** Application Permissions erfordern immer Admin Consent!

## Konfiguration im Azure Portal

### Schritt-für-Schritt

1. **Azure Portal öffnen:** [https://portal.azure.com](https://portal.azure.com)
2. **Zu App Registration navigieren:**
   - Azure Active Directory → App registrations → Ihre App
3. **API permissions öffnen:**
   - Linkes Menü → API permissions
4. **Berechtigung hinzufügen:**
   - Klicken Sie auf "+ Add a permission"
   - Wählen Sie "Microsoft Graph"
   - Wählen Sie "Delegated permissions"
   - Suchen und aktivieren Sie die gewünschten Berechtigungen
5. **Admin Consent erteilen:**
   - Klicken Sie auf "Grant admin consent for [Tenant]"
   - Bestätigen Sie mit "Yes"
   - Grüner Haken ✓ erscheint bei Status

## Minimale Konfiguration für Teams MCP Server

Für eine funktionierende Basis-Installation benötigen Sie:

```
✓ User.Read
✓ Team.ReadBasic.All
✓ Channel.ReadBasic.All
✓ ChannelMessage.Read.All
✓ ChannelMessage.Send
✓ Group.Read.All
```

Admin Consent: **JA** ✓

## Erweiterte Konfiguration mit Meetings

Für volle Funktionalität inkl. Meetings:

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

Admin Consent: **JA** ✓

## Berechtigungen pro MCP Tool

### `teams_list_channels`

**Benötigt:**
- `Team.ReadBasic.All`
- `Channel.ReadBasic.All`
- `Group.Read.All`

### `teams_read_messages`

**Benötigt:**
- `ChannelMessage.Read.All`
- `Team.ReadBasic.All`
- `Channel.ReadBasic.All`

### `teams_send_message`

**Benötigt:**
- `ChannelMessage.Send`
- `Team.ReadBasic.All`
- `Channel.ReadBasic.All`

### `teams_reply_to_message`

**Benötigt:**
- `ChannelMessage.Send`
- `ChannelMessage.Read.All` (um Original-Nachricht zu lesen)
- `Team.ReadBasic.All`
- `Channel.ReadBasic.All`

### `teams_get_meetings`

**Benötigt:**
- `OnlineMeetings.ReadWrite` oder `OnlineMeetings.Read`
- `Calendars.ReadWrite` oder `Calendars.Read`

### `teams_get_meeting_by_id`

**Benötigt:**
- `OnlineMeetings.ReadWrite` oder `OnlineMeetings.Read`
- `Calendars.ReadWrite` oder `Calendars.Read`

### `teams_create_meeting`

**Benötigt:**
- `OnlineMeetings.ReadWrite`
- `Calendars.ReadWrite`

## Häufige Fehler

### "Insufficient privileges to complete the operation"

**Ursache:** Fehlende Berechtigungen oder Admin Consent nicht erteilt

**Lösung:**
1. Überprüfen Sie, ob alle erforderlichen Berechtigungen hinzugefügt wurden
2. Stellen Sie sicher, dass Admin Consent erteilt wurde (grüner Haken ✓)
3. Bei Bedarf neu anmelden, damit neue Berechtigungen wirksam werden

### "Access is denied"

**Ursache:** Falsche Berechtigungstyp (Delegated vs. Application)

**Lösung:**
- Für MCP Server: Verwenden Sie **Delegated permissions**
- Überprüfen Sie den Berechtigungstyp im Azure Portal

### "The user or administrator has not consented"

**Ursache:** Admin Consent fehlt

**Lösung:**
1. Gehen Sie zu API permissions
2. Klicken Sie auf "Grant admin consent for [Tenant]"
3. Warten Sie einige Minuten, bis die Änderungen wirksam werden

## Admin Consent

### Was ist Admin Consent?

Admin Consent ist eine Zustimmung eines Administrators, dass eine Anwendung auf Organisationsdaten zugreifen darf.

### Wann ist Admin Consent erforderlich?

- Für alle Berechtigungen, die auf Organisationsdaten zugreifen
- Besonders für Application Permissions
- Bei den meisten Microsoft Graph API-Berechtigungen

### Wie erteile ich Admin Consent?

1. **Im Azure Portal:**
   - API permissions → "Grant admin consent for [Tenant]"

2. **Über URL (dynamisch):**
   ```
   https://login.microsoftonline.com/{tenant-id}/adminconsent?client_id={app-id}
   ```

3. **Über PowerShell:**
   ```powershell
   Connect-AzureAD
   New-AzureADServiceAppRoleAssignment -ObjectId <ServicePrincipalObjectId> -PrincipalId <ServicePrincipalObjectId> -ResourceId <ResourceServicePrincipalObjectId> -Id <AppRoleId>
   ```

## Berechtigungen testen

Nach der Konfiguration können Sie die Berechtigungen testen:

```bash
# Container starten
./start-container.sh

# Logs überprüfen auf Authentifizierungsfehler
./start-container.sh logs

# In Claude Code testen:
# "Liste alle Teams-Kanäle auf"
```

Bei Berechtigungsfehlern sehen Sie Meldungen wie:
- "Access is denied"
- "Insufficient privileges"
- "Authorization_RequestDenied"

## Weitere Ressourcen

- [Microsoft Graph Permissions Reference](https://docs.microsoft.com/en-us/graph/permissions-reference)
- [Teams API Permissions](https://docs.microsoft.com/en-us/graph/teams-concept-overview)
- [Delegated vs Application Permissions](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent)
- [Admin Consent Workflow](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/configure-admin-consent-workflow)

## Zusammenfassung

### Quick Setup (Copy-Paste für Azure Portal)

**Minimal (nur Channels & Messages):**
```
User.Read
Team.ReadBasic.All
Channel.ReadBasic.All
ChannelMessage.Read.All
ChannelMessage.Send
Group.Read.All
```

**Vollständig (mit Meetings):**
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

**Nicht vergessen:** Admin Consent erteilen! ✓
