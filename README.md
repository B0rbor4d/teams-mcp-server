🇩🇪 Deutsch | [🇬🇧 English](README.en.md)

---

# Teams MCP Server

Ein vollständiger Model Context Protocol (MCP) Server für Microsoft Teams Integration und Bot-Funktionalität.

**Version 0.2.0 - Extended Edition** | **30+ MCP Tools** | **Alle Features implementiert**

## 🚀 Übersicht

Dieser MCP Server ermöglicht es Claude Code und anderen MCP-Clients, **vollständig** mit Microsoft Teams zu interagieren. Von einfachen Nachrichten bis hin zu Adaptive Cards, Datei-Management und Team-Verwaltung.

**📖 [Vollständige Feature-Dokumentation →](FEATURES_COMPLETE.md)**

## ✨ Features (v0.2.0)

### 📢 Teams & Kanäle
- ✅ Alle Teams-Kanäle auflisten
- ✅ Kanal-Informationen abrufen

### 💬 Nachrichten (Erweitert)
- ✅ Nachrichten lesen, senden, beantworten
- ✅ **NEU:** Nachrichten bearbeiten und löschen
- ✅ **NEU:** Reaktionen hinzufügen (👍 ❤️ 😂 😮 😢 😠)
- ✅ **NEU:** Rich-Text und HTML-Formatierung
- ✅ **NEU:** Adaptive Cards (interaktive Karten)

### 💬 Private Chats (NEU)
- ✅ **NEU:** 1:1 Chats erstellen und verwalten
- ✅ **NEU:** Gruppen-Chats erstellen
- ✅ **NEU:** Chat-Nachrichten lesen und senden

### 📅 Meetings
- ✅ Anstehende Meetings abrufen
- ✅ Meeting-Details anzeigen
- ✅ Neue Meetings erstellen

### 📁 Dateien (NEU)
- ✅ **NEU:** Dateien in Kanälen auflisten
- ✅ **NEU:** Dateien hochladen
- ✅ **NEU:** Dateien herunterladen
- ✅ **NEU:** Dateien löschen

### 👤 Anwesenheitsstatus (NEU)
- ✅ **NEU:** Benutzer-Status abfragen (Available, Busy, DND, Away)
- ✅ **NEU:** Eigenen Status setzen
- ✅ **NEU:** Status-Nachrichten lesen und schreiben

### 👥 Team-Mitglieder (NEU)
- ✅ **NEU:** Team-Mitglieder auflisten
- ✅ **NEU:** Mitglieder hinzufügen/entfernen
- ✅ **NEU:** Rollen verwalten (Owner/Member)

### 🔐 Authentifizierung
- ✅ **NEU:** 3 Auth-Modi (Application/Delegated/User)
- ✅ **NEU:** Konfigurierbare Bot-Identität
- ✅ **NEU:** Optionale Nachrichtensignaturen

**Gesamt:** **30+ MCP Tools** für vollständige Teams-Integration!

## Voraussetzungen

### Für Container-Deployment (Empfohlen)
- Docker oder Podman
- Microsoft Teams Account
- Azure App Registration (für Teams API-Zugriff)

### Für lokale Installation
- Node.js (v18 oder höher)
- npm oder yarn
- Microsoft Teams Account
- Azure App Registration (für Teams API-Zugriff)

## Installation

### Option 1: Container-Deployment (Empfohlen)

Der MCP Server läuft in einem Docker/Podman Container für einfache Bereitstellung und Isolation.

```bash
# 1. .env Datei erstellen
cp .env.example .env
# Bearbeiten Sie .env mit Ihren Azure-Zugangsdaten

# 2. Container starten (erkennt automatisch Docker oder Podman)
./start-container.sh

# Alternative: Manuell mit Docker
docker-compose up -d --build

# Alternative: Manuell mit Podman
podman-compose up -d --build
```

**Container-Verwaltung mit start-container.sh:**

```bash
./start-container.sh          # Container starten
./start-container.sh stop     # Container stoppen
./start-container.sh restart  # Container neustarten
./start-container.sh logs     # Logs anzeigen
./start-container.sh status   # Status prüfen
./start-container.sh shell    # Shell im Container öffnen
./start-container.sh clean    # Container und Images entfernen
```

### Option 2: Lokale Installation

```bash
# Abhängigkeiten installieren
npm install

# TypeScript kompilieren
npm run build
```

## Konfiguration

### Schritt 1: Azure App Registration

**📖 [Detaillierte Anleitung: AZURE_SETUP.md](AZURE_SETUP.md)**

Die Azure App Registration ist erforderlich, um auf die Microsoft Teams API zuzugreifen.

**Kurzübersicht:**

1. **Azure Portal öffnen:** [https://portal.azure.com](https://portal.azure.com)
2. **App Registration erstellen:**
   - Azure Active Directory → App registrations → New registration
   - Name: `Teams MCP Server`
   - Supported account types: Single tenant oder Multi-tenant
3. **Werte notieren:**
   - Application (client) ID → `AZURE_CLIENT_ID`
   - Directory (tenant) ID → `AZURE_TENANT_ID`
4. **Client Secret erstellen:**
   - Certificates & secrets → New client secret
   - Wert kopieren → `AZURE_CLIENT_SECRET` (nur einmal sichtbar!)
5. **API-Berechtigungen hinzufügen:**
   - API permissions → Add permission → Microsoft Graph → Delegated permissions
   - Erforderlich: `User.Read`, `Team.ReadBasic.All`, `Channel.ReadBasic.All`, `ChannelMessage.Read.All`, `ChannelMessage.Send`, `Group.Read.All`
   - Optional: `OnlineMeetings.ReadWrite`, `Calendars.ReadWrite`
   - Admin consent erteilen!

**📋 Für die vollständige Schritt-für-Schritt-Anleitung mit Screenshots-Beschreibungen siehe [AZURE_SETUP.md](AZURE_SETUP.md)**

### Schritt 2: .env Datei konfigurieren

Erstellen Sie eine `.env` Datei im Projektverzeichnis:

```bash
cp .env.example .env
```

Bearbeiten Sie die Datei mit Ihren Azure-Zugangsdaten:

```env
# Azure App Registration (Erforderlich)
AZURE_CLIENT_ID=12345678-1234-1234-1234-123456789abc
AZURE_CLIENT_SECRET=aBc123~dEf456_gHi789-jKl012
AZURE_TENANT_ID=87654321-4321-4321-4321-cba987654321

# Teams Bot Configuration (Optional - nur für erweiterte Bot-Funktionen)
BOT_ID=12345678-1234-1234-1234-123456789abc
BOT_PASSWORD=aBc123~dEf456_gHi789-jKl012
```

**⚠️ Sicherheit:** Die `.env` Datei enthält sensible Daten und darf niemals ins Git-Repository committed werden!

## Verwendung

### Mit Claude Code verwenden

#### Container-basiert (Empfohlen)

Fügen Sie den Container-basierten Server zu Ihrer Claude Code Konfiguration hinzu (`.claude/settings.local.json`):

**Mit Docker:**
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

**Mit Podman:**
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

**Wichtig:** Der Container muss vor der Verwendung mit `./start-container.sh` gestartet werden!

#### Lokale Installation

Fügen Sie den lokal laufenden Server zu Ihrer Claude Code Konfiguration hinzu:

```json
{
  "mcpServers": {
    "teams": {
      "command": "node",
      "args": ["/absoluter/pfad/zu/teams-mcp-server/dist/index.js"],
      "env": {
        "AZURE_CLIENT_ID": "your-client-id",
        "AZURE_CLIENT_SECRET": "your-client-secret",
        "AZURE_TENANT_ID": "your-tenant-id"
      }
    }
  }
}
```

### Standalone-Betrieb

#### Mit Container:
```bash
./start-container.sh
./start-container.sh logs  # Logs verfolgen
```

#### Lokal:
```bash
npm start
```

## Verfügbare Tools

Der MCP Server stellt folgende Tools bereit:

### `teams_list_channels`
Listet alle verfügbaren Teams-Kanäle auf.

### `teams_read_messages`
Liest Nachrichten aus einem bestimmten Kanal.

**Parameter:**
- `channelId`: Die ID des Kanals
- `limit`: Anzahl der abzurufenden Nachrichten (optional)

### `teams_send_message`
Sendet eine Nachricht in einen Teams-Kanal.

**Parameter:**
- `channelId`: Die ID des Kanals
- `message`: Der Nachrichtentext

### `teams_get_meetings`
Ruft anstehende Meetings ab.

**Parameter:**
- `limit`: Anzahl der abzurufenden Meetings (optional)

## Entwicklung

```bash
# Development Mode mit Auto-Reload
npm run dev

# Tests ausführen
npm test

# Linting
npm run lint
```

## Projektstruktur

```
teams-mcp-server/
├── src/
│   ├── index.ts              # Haupteinstiegspunkt
│   ├── server.ts             # MCP Server Implementation
│   ├── teams/                # Teams API Integration
│   │   ├── client.ts         # Teams Client
│   │   ├── channels.ts       # Kanal-Operationen
│   │   ├── messages.ts       # Nachrichten-Operationen
│   │   └── meetings.ts       # Meeting-Operationen
│   └── utils/
│       └── config.ts         # Konfigurationsverwaltung
├── dist/                     # Kompilierte Dateien
├── Dockerfile                # Container-Image Definition
├── docker-compose.yml        # Container-Orchestrierung
├── start-container.sh        # Container-Verwaltungsskript
├── .dockerignore             # Docker Build-Ausschlüsse
├── .env.example              # Beispiel-Umgebungsvariablen
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Sicherheit

### Allgemein
- **Nie** Zugangsdaten im Code speichern
- Verwenden Sie Umgebungsvariablen für sensible Daten
- Die `.env` Datei sollte nicht ins Repository committed werden
- Beachten Sie die Microsoft Graph API-Berechtigungen und verwenden Sie nur die minimal notwendigen

### Container-Sicherheit
- Der Container läuft mit einem non-root User (nodejs:1001)
- Umgebungsvariablen werden sicher über `.env` oder `env_file` übergeben
- Minimales Alpine-basiertes Image für reduzierte Angriffsfläche
- Multi-stage Build reduziert Image-Größe und entfernt Build-Abhängigkeiten

## Fehlersuche

### Container-Probleme

**Container startet nicht:**
```bash
# Logs prüfen
./start-container.sh logs

# Container-Status prüfen
./start-container.sh status

# Container neu bauen
./start-container.sh clean
./start-container.sh build
./start-container.sh
```

**Umgebungsvariablen nicht geladen:**
```bash
# .env Datei prüfen
cat .env

# Container mit korrekten ENV-Variablen neu starten
./start-container.sh restart
```

**Verbindung zu Teams API fehlschlägt:**
```bash
# In Container-Shell wechseln und testen
./start-container.sh shell
# Im Container:
env | grep AZURE  # Prüfen ob Variablen gesetzt sind
```

### Lokale Installation

**TypeScript-Kompilierungsfehler:**
```bash
# Dependencies neu installieren
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Azure-Authentifizierungsfehler:**
- Prüfen Sie, ob die Azure App Registration korrekt konfiguriert ist
- Stellen Sie sicher, dass die richtigen API-Berechtigungen erteilt wurden
- Validieren Sie Client-ID, Client-Secret und Tenant-ID

## Lizenz

MIT

## Support

Bei Fragen oder Problemen öffnen Sie bitte ein Issue im Repository.

## Nächste Schritte

### Schnellstart mit Container

1. **Azure App Registration durchführen** (siehe Konfiguration)
2. **Umgebungsvariablen konfigurieren:**
   ```bash
   cp .env.example .env
   # .env bearbeiten und Azure-Zugangsdaten eintragen
   ```
3. **Container starten:**
   ```bash
   ./start-container.sh
   ```
4. **Server testen:**
   ```bash
   ./start-container.sh logs  # Logs auf Fehler prüfen
   ```
5. **Mit Claude Code verbinden** (siehe "Verwendung" Abschnitt)
6. **Erste Teams-Operation ausführen:**
   - In Claude Code: "Liste alle Teams-Kanäle auf"
7. Weitere Tools nach Bedarf hinzufügen

### Lokale Entwicklung

1. **Azure App Registration durchführen**
2. **Projekt aufsetzen:**
   ```bash
   npm install
   cp .env.example .env
   # .env bearbeiten
   ```
3. **Entwickeln und Testen:**
   ```bash
   npm run dev  # Development Mode
   ```
4. **Kompilieren und Starten:**
   ```bash
   npm run build
   npm start
   ```
