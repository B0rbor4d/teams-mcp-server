#!/bin/bash

# Farben für Ausgabe
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Funktion zur Ausgabe von Nachrichten
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Prüfe ob .env existiert
if [ ! -f .env ]; then
    log_error ".env Datei nicht gefunden!"
    log_info "Erstelle .env aus .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        log_warn "Bitte bearbeiten Sie die .env Datei mit Ihren Azure-Zugangsdaten!"
        exit 1
    else
        log_error ".env.example nicht gefunden!"
        exit 1
    fi
fi

# Erkenne Container-Runtime (Docker oder Podman)
CONTAINER_CMD=""
COMPOSE_CMD=""

if command -v podman &> /dev/null; then
    CONTAINER_CMD="podman"
    if command -v podman-compose &> /dev/null; then
        COMPOSE_CMD="podman-compose"
    else
        log_warn "podman-compose nicht gefunden, verwende podman compose"
        COMPOSE_CMD="podman compose"
    fi
    log_info "Verwende Podman"
elif command -v docker &> /dev/null; then
    CONTAINER_CMD="docker"
    if command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
    else
        COMPOSE_CMD="docker compose"
    fi
    log_info "Verwende Docker"
else
    log_error "Weder Docker noch Podman gefunden!"
    log_info "Bitte installieren Sie Docker oder Podman:"
    log_info "  - Docker: https://docs.docker.com/get-docker/"
    log_info "  - Podman: https://podman.io/getting-started/installation"
    exit 1
fi

# Verarbeite Kommandozeilen-Argumente
case "${1:-up}" in
    up|start)
        log_info "Starte Teams MCP Server Container..."
        $COMPOSE_CMD up -d --build
        if [ $? -eq 0 ]; then
            log_info "Container erfolgreich gestartet!"
            log_info "Logs anzeigen: $COMPOSE_CMD logs -f"
        else
            log_error "Fehler beim Starten des Containers!"
            exit 1
        fi
        ;;

    down|stop)
        log_info "Stoppe Teams MCP Server Container..."
        $COMPOSE_CMD down
        ;;

    restart)
        log_info "Starte Teams MCP Server Container neu..."
        $COMPOSE_CMD restart
        ;;

    logs)
        log_info "Zeige Container-Logs..."
        $COMPOSE_CMD logs -f
        ;;

    build)
        log_info "Baue Container-Image..."
        $COMPOSE_CMD build --no-cache
        ;;

    shell|bash)
        log_info "Öffne Shell im Container..."
        CONTAINER_NAME=$($COMPOSE_CMD ps -q teams-mcp-server)
        if [ -z "$CONTAINER_NAME" ]; then
            log_error "Container läuft nicht!"
            exit 1
        fi
        $CONTAINER_CMD exec -it $CONTAINER_NAME /bin/sh
        ;;

    status)
        log_info "Container-Status:"
        $COMPOSE_CMD ps
        ;;

    clean)
        log_warn "Entferne Container und Images..."
        $COMPOSE_CMD down -v
        $CONTAINER_CMD rmi teams-mcp-server:latest 2>/dev/null || true
        log_info "Cleanup abgeschlossen"
        ;;

    *)
        echo "Teams MCP Server - Container-Verwaltung"
        echo ""
        echo "Verwendung: $0 [BEFEHL]"
        echo ""
        echo "Verfügbare Befehle:"
        echo "  up|start    - Startet den Container (Standard)"
        echo "  down|stop   - Stoppt den Container"
        echo "  restart     - Startet den Container neu"
        echo "  logs        - Zeigt Container-Logs an"
        echo "  build       - Baut das Container-Image neu"
        echo "  shell|bash  - Öffnet eine Shell im Container"
        echo "  status      - Zeigt den Container-Status"
        echo "  clean       - Entfernt Container und Images"
        echo ""
        echo "Beispiele:"
        echo "  $0              # Startet den Container"
        echo "  $0 logs         # Zeigt Logs an"
        echo "  $0 restart      # Neustart"
        exit 0
        ;;
esac
