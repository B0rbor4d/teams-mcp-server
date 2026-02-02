# Multi-stage Build für kleinere Images
FROM node:20-alpine AS builder

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

WORKDIR /app

# Cache-Verzeichnis erstellen
RUN mkdir -p /app/cache && chmod 777 /app/cache

# Nur production dependencies installieren
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Kompilierten Code vom Builder-Stage kopieren
COPY --from=builder /app/dist ./dist

# Non-root User erstellen und verwenden
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app/cache
USER nodejs

# Environment
ENV NODE_ENV=production

# Volume für Token Cache
VOLUME ["/app/cache"]

# Startbefehl
CMD ["node", "dist/index.js"]
