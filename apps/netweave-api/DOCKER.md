# Netweave API – Docker Guide

## Environment Variables

All variables are loaded from a `.env` file at the **workspace root**.
Copy `.env.example` and fill in real values before running anything:

```bash
cp .env.example .env
```

---

## Docker Compose

All `docker compose` commands are run from the **project root** where
`docker-compose.yml` lives.

### Start

```bash
# Start in the foreground — logs stream to the terminal, Ctrl+C to stop
docker compose up

# Start detached (background)
docker compose up -d

# Rebuild the image before starting (use this after any code change)
docker compose up --build -d

# Force a full recreate of the container even if nothing changed
docker compose up -d --force-recreate

# Rebuild only netweave-api without touching other services
docker compose up -d --build --no-deps netweave-api
```

### Stop & tear down

```bash
# Stop containers but keep them (and volumes) intact
docker compose stop

# Stop and remove containers + the default network (volumes are kept)
docker compose down

# Full wipe: containers + network + named volumes
docker compose down -v

# Also remove the locally built image
docker compose down --rmi local
```

### Logs

```bash
# Stream logs from all services
docker compose logs -f

# Stream logs from netweave-api only
docker compose logs -f netweave-api

# Show the last 50 lines then follow
docker compose logs --tail=50 -f netweave-api
```

### Status & health

```bash
# Overview of running services including the STATUS / health column
docker compose ps

# Full health-check detail from the Docker daemon
docker inspect netweave-api | grep -A 10 '"Health"'
```

The health check (`HEALTHCHECK` in the Dockerfile, mirrored in `docker-compose.yml`)
polls `GET /api` every **60 s**, allows **10 s** to respond, and marks the container
**unhealthy** after **3** consecutive failures. It waits **10 s** after start before
the first check.

### One-off commands inside a running container

```bash
# Open an interactive shell
docker compose exec netweave-api sh
```

---

## Building the Image Manually

The Dockerfile uses a **multi-stage build**: a `builder` stage compiles the Nx
project, and the lean runtime stage copies only the compiled output +
production dependencies.

```bash
# Build from the project root (context must be the workspace root)
docker build -t netweave-api:latest -f apps/netweave-api/Dockerfile .

# Tag a specific release
docker build -t netweave-api:1.0.0 -f apps/netweave-api/Dockerfile .
```

> The Nx build step (`npm run build:api`) runs **inside** the builder stage, so
> you do not need to run it locally before building the image.

---

## Running Without Compose

Useful for quick smoke tests or CI pipelines.

```bash
# Minimal run — passes required vars inline
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e RESEND_API_KEY="re_your_key" \
  -e CRON_SCHEDULE_MAIL_SEND="*/5 * * * *" \
  netweave-api:latest

# Detached with a persistent log volume
docker run -d -p 3000:3000 \
  --env-file .env \
  -v netweave-logs:/app/logs \
  --name netweave-api \
  netweave-api:latest

# View logs from the named container
docker logs -f netweave-api
```
