🇩🇪 Deutsch | [🇬🇧 English](AZURE_SETUP.en.md)

---

# Azure App Registration - Schritt-für-Schritt-Anleitung

Diese Anleitung erklärt, wie Sie eine Azure App Registration für den Teams MCP Server erstellen und konfigurieren.

**📋 [API-Berechtigungen Schnellreferenz →](API_PERMISSIONS.md)**

## Übersicht

Für den Teams MCP Server benötigen Sie:
1. **Azure App Registration** (erforderlich) - Für Microsoft Graph API-Zugriff
2. **Bot Registration** (optional) - Nur wenn Sie Bot-Funktionalität benötigen

**Dokumentation:**
- Diese Datei: Schritt-für-Schritt Setup-Anleitung
- [API_PERMISSIONS.md](API_PERMISSIONS.md): Detaillierte Berechtigungsübersicht
- [README.md](README.md): Projekt-Übersicht und Schnellstart

## Teil 1: Azure App Registration (Erforderlich)

### Schritt 1: Azure Portal öffnen

1. Öffnen Sie das [Azure Portal](https://portal.azure.com)
2. Melden Sie sich mit Ihrem Microsoft-Konto an
3. Stellen Sie sicher, dass Sie den richtigen Azure AD Tenant ausgewählt haben

### Schritt 2: App Registration erstellen

1. **Navigation:**
   - Klicken Sie auf das Hamburger-Menü (☰) oben links
   - Suchen Sie nach "Azure Active Directory" oder "Microsoft Entra ID"
   - Klicken Sie auf "App registrations" (App-Registrierungen)

2. **Neue Registrierung:**
   - Klicken Sie auf "+ New registration" (+ Neue Registrierung)
   - Füllen Sie das Formular aus:
     - **Name:** `Teams MCP Server` (oder einen Namen Ihrer Wahl)
     - **Supported account types:**
       - Wählen Sie "Accounts in this organizational directory only" (Nur Konten in diesem Organisationsverzeichnis)
       - Für persönliche Microsoft-Konten: "Accounts in any organizational directory and personal Microsoft accounts"
     - **Redirect URI:** Leer lassen (nicht erforderlich für MCP Server)
   - Klicken Sie auf "Register"

3. **Wichtige Werte notieren:**
   Nach der Registrierung sehen Sie die Übersichtsseite. Notieren Sie:
   - **Application (client) ID** → Dies ist Ihre `AZURE_CLIENT_ID`
   - **Directory (tenant) ID** → Dies ist Ihre `AZURE_TENANT_ID`

### Schritt 3: Client Secret erstellen

1. **Zum Certificates & secrets navigieren:**
   - Klicken Sie im linken Menü auf "Certificates & secrets" (Zertifikate & Geheimnisse)
   - Wählen Sie den Tab "Client secrets"

2. **Neues Secret erstellen:**
   - Klicken Sie auf "+ New client secret"
   - **Description:** `Teams MCP Server Secret`
   - **Expires:** Wählen Sie eine Gültigkeitsdauer (empfohlen: 6 oder 12 Monate)
   - Klicken Sie auf "Add"

3. **Secret-Wert kopieren:**
   - ⚠️ **WICHTIG:** Kopieren Sie sofort den **Value** (nicht die Secret ID!)
   - Dieser Wert wird nur einmal angezeigt! → Dies ist Ihr `AZURE_CLIENT_SECRET`
   - Speichern Sie ihn sicher (z.B. in einem Passwort-Manager)

### Schritt 4: API-Berechtigungen konfigurieren

1. **Zu API permissions navigieren:**
   - Klicken Sie im linken Menü auf "API permissions" (API-Berechtigungen)

2. **Microsoft Graph Berechtigungen hinzufügen:**
   - Klicken Sie auf "+ Add a permission"
   - Wählen Sie "Microsoft Graph"
   - Wählen Sie "Delegated permissions" (Delegierte Berechtigungen)

3. **Erforderliche Berechtigungen auswählen:**

   **Für Teams-Kanäle und Nachrichten:**
   - `Team.ReadBasic.All` - Teams-Informationen lesen
   - `Channel.ReadBasic.All` - Kanal-Informationen lesen
   - `ChannelMessage.Read.All` - Kanalnachrichten lesen
   - `ChannelMessage.Send` - Nachrichten in Kanäle senden
   - `Group.Read.All` - Gruppeninformationen lesen (Teams sind Gruppen)
   - `Group.ReadWrite.All` - Gruppen lesen und schreiben (falls Sie Teams verwalten möchten)

   **Für Meetings:**
   - `OnlineMeetings.ReadWrite` - Meetings lesen und erstellen
   - `Calendars.ReadWrite` - Kalender lesen und schreiben
   - `User.Read` - Basis-Benutzerprofil lesen

4. **Berechtigungen erteilen:**
   - Nachdem Sie alle Berechtigungen hinzugefügt haben
   - Klicken Sie auf "Grant admin consent for [Ihr Tenant]"
   - Bestätigen Sie mit "Yes"
   - ⚠️ **Wichtig:** Sie benötigen Admin-Rechte für diesen Schritt
   - Status sollte auf grünen Haken ✓ wechseln

### Schritt 5: Application Permissions (Optional, für erhöhte Rechte)

Falls Sie die App ohne Benutzerinteraktion ausführen möchten:

1. **Application permissions hinzufügen:**
   - Wählen Sie "Application permissions" statt "Delegated permissions"
   - Fügen Sie entsprechende Berechtigungen hinzu:
     - `Team.ReadBasic.All`
     - `Channel.ReadBasic.All`
     - `ChannelMessage.Read.All`
     - usw.

2. **Admin Consent erteilen** (erforderlich für Application permissions)

⚠️ **Hinweis:** Application permissions sind mächtiger und benötigen mehr Sicherheitsüberlegungen.

### Schritt 6: .env Datei konfigurieren

Erstellen Sie eine `.env` Datei in Ihrem Projektverzeichnis:

```bash
cd projects/teams-mcp-server
cp .env.example .env
```

Bearbeiten Sie die `.env` Datei mit Ihren Werten:

```env
# Azure App Registration
AZURE_CLIENT_ID=12345678-1234-1234-1234-123456789abc
AZURE_CLIENT_SECRET=aBc123~dEf456_gHi789-jKl012
AZURE_TENANT_ID=87654321-4321-4321-4321-cba987654321
```

### Schritt 7: Verbindung testen

Nach dem Container-Start können Sie die Verbindung testen:

```bash
# Container starten
./start-container.sh

# Logs überprüfen
./start-container.sh logs
```

Bei erfolgreicher Authentifizierung sollten Sie keine Fehlermeldungen sehen.

---

## Teil 2: Bot Registration (Optional)

Falls Sie erweiterte Bot-Funktionalität benötigen (z.B. proaktive Nachrichten, Bot-Befehle):

### Schritt 1: Bot Service erstellen

1. **Azure Portal → Create a resource:**
   - Suchen Sie nach "Azure Bot"
   - Klicken Sie auf "Create"

2. **Bot-Konfiguration:**
   - **Bot handle:** Ein eindeutiger Name (z.B. `teams-mcp-bot`)
   - **Subscription:** Ihre Azure-Subscription
   - **Resource group:** Erstellen Sie eine neue oder wählen Sie eine bestehende
   - **Pricing tier:** F0 (Free) für Tests
   - **Type of App:** "Multi Tenant"
   - **Creation type:** "Use existing app registration"
   - **App ID:** Verwenden Sie die Client-ID aus Teil 1

3. **Erstellen:**
   - Klicken Sie auf "Review + create"
   - Dann auf "Create"

### Schritt 2: Bot mit Teams verbinden

1. **Channels konfigurieren:**
   - Öffnen Sie Ihre Bot-Ressource
   - Klicken Sie auf "Channels"
   - Klicken Sie auf "Microsoft Teams" Icon
   - Akzeptieren Sie die Terms of Service
   - Klicken Sie auf "Agree"

2. **Messaging endpoint konfigurieren:**
   - Gehen Sie zu "Configuration"
   - **Messaging endpoint:** `https://ihre-domain.com/api/messages`
   - (Dies ist nur relevant wenn Sie einen öffentlichen Endpoint haben)

### Schritt 3: Bot-Zugangsdaten zur .env hinzufügen

```env
# Teams Bot Configuration (Optional)
BOT_ID=12345678-1234-1234-1234-123456789abc
BOT_PASSWORD=aBc123~dEf456_gHi789-jKl012
```

**Hinweis:** Für den MCP Server sind dies die gleichen Werte wie Client-ID und Client-Secret aus der App Registration.

---

## Zusammenfassung: Was Sie benötigen

### Minimale Konfiguration (Nur App Registration):

```env
AZURE_CLIENT_ID=<Application (client) ID>
AZURE_CLIENT_SECRET=<Client Secret Value>
AZURE_TENANT_ID=<Directory (tenant) ID>
```

### Mit Bot-Funktionalität:

```env
AZURE_CLIENT_ID=<Application (client) ID>
AZURE_CLIENT_SECRET=<Client Secret Value>
AZURE_TENANT_ID=<Directory (tenant) ID>
BOT_ID=<Application (client) ID>
BOT_PASSWORD=<Client Secret Value>
```

---

## API-Berechtigungen: Übersichtstabelle

| Berechtigung | Typ | Zweck | Erforderlich |
|--------------|-----|-------|--------------|
| `User.Read` | Delegated | Basis-Benutzerprofil | ✓ Ja |
| `Team.ReadBasic.All` | Delegated | Teams auflisten | ✓ Ja |
| `Channel.ReadBasic.All` | Delegated | Kanäle auflisten | ✓ Ja |
| `ChannelMessage.Read.All` | Delegated | Nachrichten lesen | ✓ Ja |
| `ChannelMessage.Send` | Delegated | Nachrichten senden | ✓ Ja |
| `Group.Read.All` | Delegated | Teams-Informationen | ✓ Ja |
| `Group.ReadWrite.All` | Delegated | Teams verwalten | Optional |
| `OnlineMeetings.ReadWrite` | Delegated | Meetings erstellen/lesen | Optional |
| `Calendars.ReadWrite` | Delegated | Kalender-Zugriff | Optional |

---

## Häufige Fehler und Lösungen

### Fehler: "AADSTS700016: Application not found"
**Lösung:** Überprüfen Sie die `AZURE_CLIENT_ID` und `AZURE_TENANT_ID`

### Fehler: "Invalid client secret"
**Lösung:**
- Erstellen Sie ein neues Client Secret
- Kopieren Sie den Wert sofort nach Erstellung
- Achten Sie darauf, den **Value** zu kopieren, nicht die Secret ID

### Fehler: "Insufficient privileges"
**Lösung:**
- Überprüfen Sie, ob Admin Consent erteilt wurde
- Stellen Sie sicher, dass Sie als Administrator angemeldet sind
- Grüner Haken ✓ muss bei allen Berechtigungen sichtbar sein

### Fehler: "Tenant does not exist"
**Lösung:**
- Überprüfen Sie die `AZURE_TENANT_ID`
- Stellen Sie sicher, dass Sie im richtigen Azure AD Tenant angemeldet sind

---

## Sicherheitshinweise

1. **Client Secret schützen:**
   - Nie im Code oder Git-Repository speichern
   - Nur in `.env` Datei (die in `.gitignore` ist)
   - Regelmäßig rotieren (alle 6-12 Monate)

2. **Minimale Berechtigungen:**
   - Nur die wirklich benötigten API-Berechtigungen erteilen
   - Application permissions nur wenn wirklich nötig

3. **Monitoring:**
   - Überprüfen Sie regelmäßig die Azure AD Sign-in Logs
   - Achten Sie auf ungewöhnliche Aktivitäten

4. **Multi-Factor Authentication:**
   - Aktivieren Sie MFA für Admin-Konten

---

## Nächste Schritte

Nach erfolgreicher Azure-Registrierung:

1. ✓ `.env` Datei mit Zugangsdaten erstellen
2. ✓ Container starten: `./start-container.sh`
3. ✓ Logs überprüfen: `./start-container.sh logs`
4. ✓ Mit Claude Code verbinden (siehe README.md)
5. ✓ Erste Teams-Operation testen

## Support-Links

- [Azure App Registration Dokumentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [Microsoft Graph API Berechtigungen](https://docs.microsoft.com/en-us/graph/permissions-reference)
- [Azure Bot Service Dokumentation](https://docs.microsoft.com/en-us/azure/bot-service/)
- [Teams App Entwicklung](https://docs.microsoft.com/en-us/microsoftteams/platform/)
