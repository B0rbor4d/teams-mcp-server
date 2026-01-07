🇩🇪 Deutsch | [🇬🇧 English](FEATURES_COMPLETE.en.md)

---

# Teams MCP Server - Vollständige Feature-Dokumentation

Version 0.2.0 - Erweiterte Edition

## 📋 Inhaltsverzeichnis

1. [Übersicht](#übersicht)
2. [Alle 30+ MCP Tools](#alle-mcp-tools)
3. [Benötigte API-Berechtigungen](#benötigte-api-berechtigungen)
4. [Anwendungsbeispiele](#anwendungsbeispiele)
5. [Einrichtung](#einrichtung)

---

## Übersicht

Der Teams MCP Server bietet **30+ Tools** für vollständige Microsoft Teams Integration:

- ✅ **Teams & Kanäle:** Kanäle auflisten und verwalten
- ✅ **Nachrichten:** Lesen, Senden, Bearbeiten, Löschen
- ✅ **Reaktionen:** Likes, Hearts, und mehr
- ✅ **Adaptive Cards:** Interaktive, visuell ansprechende Karten
- ✅ **1:1 & Gruppen-Chats:** Private Kommunikation
- ✅ **Meetings:** Erstellen, Verwalten, Abrufen
- ✅ **Dateien:** Upload, Download, Löschen
- ✅ **Presence:** Anwesenheitsstatus abfragen und setzen
- ✅ **Team-Mitglieder:** Hinzufügen, Entfernen, Verwalten

---

## Alle MCP Tools

### 📢 Kanal-Tools (1)

#### `teams_list_channels`
Listet alle verfügbaren Teams-Kanäle auf.

**Parameter:** Keine

**Beispiel:**
```
"Zeige mir alle meine Teams-Kanäle"
```

---

### 💬 Nachrichten-Tools (9)

#### `teams_read_messages`
Liest Nachrichten aus einem Teams-Kanal.

**Parameter:**
- `teamId` (string) - Die ID des Teams
- `channelId` (string) - Die ID des Kanals
- `limit` (number, optional) - Anzahl der Nachrichten (Standard: 20)

#### `teams_send_message`
Sendet eine Nachricht in einen Teams-Kanal.

**Parameter:**
- `teamId` (string)
- `channelId` (string)
- `message` (string) - Der Nachrichtentext

#### `teams_reply_to_message`
Antwortet auf eine bestimmte Nachricht.

**Parameter:**
- `teamId` (string)
- `channelId` (string)
- `messageId` (string)
- `message` (string)

#### `teams_edit_message`
Bearbeitet eine existierende Nachricht (nur eigene).

**Parameter:**
- `teamId` (string)
- `channelId` (string)
- `messageId` (string)
- `newContent` (string)

#### `teams_delete_message`
Löscht eine Nachricht (nur eigene oder als Owner).

**Parameter:**
- `teamId` (string)
- `channelId` (string)
- `messageId` (string)

#### `teams_add_reaction`
Fügt eine Reaktion (Emoji) zu einer Nachricht hinzu.

**Parameter:**
- `teamId` (string)
- `channelId` (string)
- `messageId` (string)
- `reactionType` (enum) - `like`, `heart`, `laugh`, `surprised`, `sad`, `angry`

#### `teams_remove_reaction`
Entfernt eine Reaktion von einer Nachricht.

**Parameter:** Wie `teams_add_reaction`

#### `teams_send_adaptive_card`
Sendet eine interaktive Adaptive Card.

**Parameter:**
- `teamId` (string)
- `channelId` (string)
- `title` (string) - Titel der Karte
- `text` (string) - Text-Inhalt
- `actions` (array, optional) - Buttons/Actions

**Beispiel:**
```json
{
  "teamId": "...",
  "channelId": "...",
  "title": "Build erfolgreich! ✅",
  "text": "Der Build #142 wurde erfolgreich abgeschlossen.",
  "actions": [
    { "title": "Details anzeigen", "url": "https://build.example.com/142" }
  ]
}
```

---

### 💬 Chat-Tools (5)

#### `teams_list_chats`
Listet alle Chats (1:1 und Gruppen) auf.

#### `teams_read_chat_messages`
Liest Nachrichten aus einem Chat.

**Parameter:**
- `chatId` (string)
- `limit` (number, optional)

#### `teams_send_chat_message`
Sendet eine Nachricht in einen Chat.

**Parameter:**
- `chatId` (string)
- `message` (string)

#### `teams_create_chat`
Erstellt einen neuen 1:1 Chat.

**Parameter:**
- `userEmail` (string)

#### `teams_create_group_chat`
Erstellt einen Gruppen-Chat.

**Parameter:**
- `topic` (string) - Thema des Chats
- `memberEmails` (array) - E-Mail-Adressen

---

### 📅 Meeting-Tools (3)

#### `teams_get_meetings`
Ruft anstehende Meetings ab.

**Parameter:**
- `limit` (number, optional) - Standard: 10

#### `teams_get_meeting_by_id`
Holt Details zu einem Meeting.

**Parameter:**
- `meetingId` (string)

#### `teams_create_meeting`
Erstellt ein neues Teams-Meeting.

**Parameter:**
- `subject` (string)
- `startDateTime` (string) - ISO 8601 Format
- `endDateTime` (string) - ISO 8601 Format
- `attendees` (array) - E-Mail-Adressen

---

### 📁 Datei-Tools (4)

#### `teams_list_files`
Listet Dateien in einem Kanal auf.

**Parameter:**
- `teamId` (string)
- `channelId` (string)

#### `teams_upload_file`
Lädt eine Datei hoch.

**Parameter:**
- `teamId` (string)
- `channelId` (string)
- `fileName` (string)
- `content` (string) - Text oder Base64

#### `teams_download_file`
Lädt eine Datei herunter.

**Parameter:**
- `teamId` (string)
- `channelId` (string)
- `fileId` (string)

**Rückgabe:** Base64-kodierter Inhalt

#### `teams_delete_file`
Löscht eine Datei.

**Parameter:**
- `teamId` (string)
- `channelId` (string)
- `fileId` (string)

---

### 👤 Presence-Tools (3)

#### `teams_get_user_presence`
Holt Anwesenheitsstatus eines Benutzers.

**Parameter:**
- `userEmail` (string)

**Rückgabe:**
```json
{
  "availability": "Available",
  "activity": "Available",
  "statusMessage": "Arbeite von Zuhause"
}
```

#### `teams_get_my_presence`
Holt eigenen Anwesenheitsstatus.

#### `teams_set_presence`
Setzt eigenen Anwesenheitsstatus.

**Parameter:**
- `availability` (enum) - `Available`, `Busy`, `DoNotDisturb`, `BeRightBack`, `Away`
- `activity` (string)

---

### 👥 Mitglieder-Tools (3)

#### `teams_list_members`
Listet alle Team-Mitglieder auf.

**Parameter:**
- `teamId` (string)

#### `teams_add_member`
Fügt ein Mitglied hinzu.

**Parameter:**
- `teamId` (string)
- `userEmail` (string)
- `role` (enum, optional) - `owner` oder `member` (Standard)

#### `teams_remove_member`
Entfernt ein Mitglied.

**Parameter:**
- `teamId` (string)
- `membershipId` (string)

---

## Benötigte API-Berechtigungen

### Vollständige Liste (Delegated Permissions)

```
✓ User.Read
✓ Team.ReadBasic.All
✓ Channel.ReadBasic.All
✓ ChannelMessage.Read.All
✓ ChannelMessage.Send
✓ ChannelMessage.Edit (NEU)
✓ ChannelMessage.Delete (NEU)
✓ Group.Read.All
✓ Group.ReadWrite.All (NEU - für Mitglieder-Verwaltung)
✓ Chat.Read (NEU - für 1:1 Chats)
✓ Chat.ReadWrite (NEU - für 1:1 Chats)
✓ OnlineMeetings.ReadWrite
✓ Calendars.ReadWrite
✓ Files.Read.All (NEU - für Dateien)
✓ Files.ReadWrite.All (NEU - für Dateien)
✓ Presence.Read (NEU - für Anwesenheitsstatus)
✓ Presence.ReadWrite (NEU - für Anwesenheitsstatus)
```

### Berechtigungen nach Feature-Gruppe

| Feature | Benötigte Berechtigungen |
|---------|--------------------------|
| **Basis-Kanäle** | User.Read, Team.ReadBasic.All, Channel.ReadBasic.All |
| **Nachrichten lesen** | ChannelMessage.Read.All |
| **Nachrichten senden** | ChannelMessage.Send |
| **Nachrichten bearbeiten/löschen** | ChannelMessage.Edit, ChannelMessage.Delete |
| **1:1 Chats** | Chat.Read, Chat.ReadWrite |
| **Meetings** | OnlineMeetings.ReadWrite, Calendars.ReadWrite |
| **Dateien** | Files.Read.All, Files.ReadWrite.All |
| **Presence** | Presence.Read, Presence.ReadWrite |
| **Mitglieder** | Group.ReadWrite.All |

### Azure Portal Konfiguration

1. Azure Portal → App Registration → Ihre App
2. API Permissions → Add a permission
3. Microsoft Graph → Delegated permissions
4. Alle oben genannten Berechtigungen hinzufügen
5. **Grant admin consent** klicken ✅

---

## Anwendungsbeispiele

### 1. Automatische Status-Updates

```
"Sende eine Adaptive Card in den DevOps-Kanal mit dem Titel
'Build #142 erfolgreich' und einem Button zum Build-Log"
```

### 2. Team-Kommunikation

```
"Erstelle einen 1:1 Chat mit max@firma.de und sende
'Hallo Max, können wir kurz telefonieren?'"
```

### 3. Meeting-Management

```
"Erstelle ein Meeting für morgen 10:00-11:00 Uhr mit
anna@firma.de und max@firma.de, Thema: Projekt-Review"
```

### 4. Datei-Verwaltung

```
"Liste alle Dateien im Projekt-Kanal auf"
"Lade die Datei projekt-status.pdf herunter"
```

### 5. Presence-Status

```
"Setze meinen Status auf 'Busy' mit Aktivität 'In einem Meeting'"
"Zeige mir den Status von max@firma.de"
```

### 6. Team-Verwaltung

```
"Füge anna@firma.de als Mitglied zum Marketing-Team hinzu"
"Liste alle Mitglieder des DevOps-Teams auf"
```

---

## Einrichtung

### 1. Azure App Registration

Siehe [AZURE_SETUP.md](AZURE_SETUP.md) für detaillierte Anleitung.

### 2. Umgebungsvariablen

```env
# Azure Credentials
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_TENANT_ID=your-tenant-id

# Auth Mode (application/delegated/user)
AUTH_MODE=application
BOT_DISPLAY_NAME=Teams MCP Bot

# Optional: Signatur
MESSAGE_ADD_SIGNATURE=false
```

### 3. Container starten

```bash
./start-container.sh
```

### 4. Mit Claude Code verbinden

Siehe [README.md](README.md) für Integration-Details.

---

## Feature-Matrix

| Feature | Status | Tools | Berechtigungen |
|---------|--------|-------|----------------|
| Kanäle auflisten | ✅ | 1 | Team.ReadBasic.All |
| Nachrichten lesen | ✅ | 1 | ChannelMessage.Read.All |
| Nachrichten senden | ✅ | 1 | ChannelMessage.Send |
| Nachrichten bearbeiten | ✅ | 1 | ChannelMessage.Edit |
| Nachrichten löschen | ✅ | 1 | ChannelMessage.Delete |
| Reaktionen | ✅ | 2 | ChannelMessage.Send |
| Adaptive Cards | ✅ | 1 | ChannelMessage.Send |
| 1:1 Chats | ✅ | 5 | Chat.ReadWrite |
| Meetings | ✅ | 3 | OnlineMeetings.ReadWrite |
| Dateien | ✅ | 4 | Files.ReadWrite.All |
| Presence | ✅ | 3 | Presence.ReadWrite |
| Team-Mitglieder | ✅ | 3 | Group.ReadWrite.All |
| **GESAMT** | **✅** | **30+** | **17** |

---

## Roadmap

### Mögliche zukünftige Erweiterungen:

- 🔔 Webhook-Benachrichtigungen empfangen
- 📊 Teams-Analytics und Statistiken
- 🔐 Erweiterte Berechtigungsverwaltung
- 🤖 Bot-Framework Integration
- 📱 Mobile Push-Benachrichtigungen

---

## Support & Dokumentation

- **README.md** - Projekt-Übersicht & Schnellstart
- **AZURE_SETUP.md** - Azure App Registration
- **AUTH_MODES.md** - Authentifizierungs-Modi
- **API_PERMISSIONS.md** - API-Berechtigungen Details
- **Diese Datei** - Vollständige Feature-Dokumentation

---

## Changelog

### v0.2.0 (Januar 2026) - Extended Edition

**Neue Features:**
- ✨ 1:1 & Gruppen-Chats (5 Tools)
- ✨ Dateien Upload/Download (4 Tools)
- ✨ Adaptive Cards (1 Tool)
- ✨ Nachrichten-Reaktionen (2 Tools)
- ✨ Nachrichtenbearbeitung/-löschung (2 Tools)
- ✨ Anwesenheitsstatus (3 Tools)
- ✨ Team-Mitglieder-Verwaltung (3 Tools)
- ✨ Drei Authentifizierungsmodi
- ✨ Konfigurierbare Nachrichtensignaturen

**Gesamt:** Von 7 auf 30+ Tools erweitert!

### v0.1.0 (Januar 2026) - Initial Release

**Features:**
- ✅ Kanäle auflisten
- ✅ Nachrichten lesen/senden/beantworten
- ✅ Meetings erstellen/abrufen
- ✅ Basis-Funktionalität

---

**🎉 Der Teams MCP Server ist jetzt feature-complete für die meisten Anwendungsfälle!**
