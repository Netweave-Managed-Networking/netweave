# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDeps for build)
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build:api

# Runtime stage
FROM node:22-alpine

RUN apk add --no-cache dumb-init

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy everything needed to run from builder
COPY --chown=nestjs:nodejs --from=builder /app/dist ./dist
COPY --chown=nestjs:nodejs package.json package-lock.json ./
RUN npm ci --omit=dev

# Own the app directory
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check (with longer timeout for slow starts)
HEALTHCHECK --interval=60s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Labels for metadata
LABEL org.opencontainers.image.title="Netweave API" \
      org.opencontainers.image.description="NestJS backend with scheduled API fetching and logging"

ENTRYPOINT ["dumb-init", "--"]

# start the app
CMD ["sh", "-c", "exec node dist/apps/netweave-api/main.js"]
