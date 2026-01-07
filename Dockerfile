# Multi-stage Build für kleinere Images
FROM node:20-alpine AS builder

# Arbeitsverzeichnis setzen
WORKDIR /app

# Package-Dateien kopieren
COPY package*.json ./
COPY tsconfig.json ./

# Abhängigkeiten installieren
RUN npm ci

# Source-Code kopieren
COPY src ./src

# TypeScript kompilieren
RUN npm run build

# Production Stage
FROM node:20-alpine

# Arbeitsverzeichnis setzen
WORKDIR /app

# Nur production dependencies installieren
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Kompilierten Code vom Builder-Stage kopieren
COPY --from=builder /app/dist ./dist

# Non-root User erstellen und verwenden
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

# Healthcheck (optional, für Container-Orchestrierung)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "process.exit(0)"

# Umgebungsvariablen (werden durch .env oder compose überschrieben)
ENV NODE_ENV=production

# Startbefehl
CMD ["node", "dist/index.js"]
