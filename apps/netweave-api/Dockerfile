# Build stage
FROM node:alpine AS builder

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
FROM node:alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy everything needed to run from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Create and own logs directory
RUN mkdir -p /app/logs && chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    LOG_DIR=/app/logs \
    API_URL=https://dummyjson.com/quotes/random \
    CRON_SCHEDULE="*/1 * * * *"

# Expose port
EXPOSE 3000

# Health check (with longer timeout for slow starts)
HEALTHCHECK --interval=60s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Labels for metadata
LABEL org.opencontainers.image.title="Netweave API" \
      org.opencontainers.image.description="NestJS backend with scheduled API fetching and logging"

# Start the app
CMD ["node", "dist/apps/netweave-api/main.js"]
