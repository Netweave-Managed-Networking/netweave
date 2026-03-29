# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime stage
FROM node:22-alpine

RUN apk add --no-cache dumb-init

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S angular -u 1001

COPY --chown=angular:nodejs --from=builder /app/dist/apps/netweave-web ./dist/apps/netweave-web
COPY --chown=angular:nodejs package.json package-lock.json ./
RUN npm ci --omit=dev

USER angular

EXPOSE 4000

LABEL org.opencontainers.image.title="Netweave Web"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/apps/netweave-web/server/server.mjs"]