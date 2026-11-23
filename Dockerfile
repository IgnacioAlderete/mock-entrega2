FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Primero solo los package*.json: aprovecha la caché de capas de Docker
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src

# Carpetas de escritura (uploads de Multer y logs de Winston) para el usuario no-root
RUN mkdir -p uploads logs && chown -R node:node /app
USER node

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-8080}/api/health || exit 1

CMD ["node", "src/server.js"]