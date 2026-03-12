# Docker Environment Variables

This API supports the following environment variables:

| Variable        | Default                    | Description                                                   |
| --------------- | -------------------------- | ------------------------------------------------------------- |
| `PORT`          | 3000                       | HTTP port the API listens on                                  |
| `NODE_ENV`      | production                 | Node.js environment (development/production)                  |
| `LOG_DIR`       | /app/logs                  | Directory where response logs are written                     |
| `API_URL`       | https://dummyjson.com/test | External API endpoint to fetch                                |
| `CRON_SCHEDULE` | _/5 _ \* \* \*             | Cron expression for fetch schedule (default: every 5 minutes) |

## Running the container locally

### Basic usage

```bash
docker run -p 3000:3000 netweave-api:poc
```

### With custom API and schedule

```bash
docker run -p 3000:3000 \
  -e API_URL="https://dummyjson.com/test" \
  -e CRON_SCHEDULE="0 * * * *" \
  netweave-api:poc
```

### With persistent log volume

```bash
docker run -p 3000:3000 \
  -v my-logs:/app/logs \
  netweave-api:poc
```

### View logs

```bash
docker exec <container-id> tail -f /app/logs/response-log.txt
```

## Building the image

```bash
npm run build:api
docker build -t netweave-api:latest -f apps/netweave-api/Dockerfile .
```

## Health Check

The container includes a built-in health check that:

- Starts checking after 10 seconds
- Makes HTTP GET requests to `/api` every 60 seconds
- Allows 10 seconds for a response
- Marks as unhealthy after 3 failed checks

You can check health status via:

```bash
docker ps  # Shows STATUS column with health info
docker inspect <container-id> | grep -A 5 Health
```
