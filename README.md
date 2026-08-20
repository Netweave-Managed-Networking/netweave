# Netweave

## About

The code written here is a pure result of the private work of Marvin Frede. It is not part of any Employment relationship.\
The code written here also does not contain any code of [Netweave 1.0](https://github.com/Netweave-Managed-Networking/netweave-v1).\
See our [Glossary](./docs/glossary.md) or [Use Case Diagram](./docs/use-case-diagram.puml)

## How to get started

There are two ways to run Netweave locally. Use the source-based workflow for
active development because it runs Angular's development server with live
reload. Use Docker Compose when you want to run the deployment-like stack.

### 1. Shared setup

1. Install Node.js and npm, then install the project dependencies from the
   repository root:

   ```sh
   npm ci
   ```

2. Create the local environment file:

   ```sh
   cp .env.example .env
   ```

3. Fill in the values in `.env`. At minimum, configure the PostgreSQL
   connection, `JWT_SECRET`, and the mail settings. Set `SEND_MAIL_ACTIVATED`
   to `false` when you do not want the application to send mail during local
   development.

### 2A. Recommended: run from source

This workflow requires a PostgreSQL server running on the local machine. The
database and user must match `.env`; for a local database, keep
`DB_HOST=localhost` and use the configured `DB_PORT` (5432 by default).

Start the frontend and API together:

```sh
npm run serve
```

Then open [http://localhost:4200](http://localhost:4200). Nx starts the API as
a dependency of the web development server. The API listens at
[http://localhost:3000/api](http://localhost:3000/api), and the Angular proxy
forwards browser requests under `/api` to it. Frontend changes are picked up
by Angular's development server automatically.

The API connects to PostgreSQL when it starts. TypeORM does not synchronize
the schema automatically, but it does run pending migrations
(`synchronize: false` and `migrationsRun: true`). The database must therefore
be reachable before running `npm run serve`.

### 2B. Run with Docker Compose

This workflow requires Docker Desktop with a running Docker daemon. It starts
PostgreSQL, the API, the server-rendered Angular web app, and an Nginx reverse
proxy:

```sh
docker compose up
```

To run the stack in the background:

```sh
docker compose up -d
```

The Compose file uses prebuilt `latest` images from GitHub Container Registry;
it does not build the checked-out source code. It also expects the Nginx TLS
certificates at:

```text
/etc/letsencrypt/live/dev.netweave.de/fullchain.pem
/etc/letsencrypt/live/dev.netweave.de/privkey.pem
```

The Nginx configuration expects the hostname `dev.netweave.de` and redirects
HTTP to HTTPS, so this path may require local DNS or `/etc/hosts` setup and
valid certificates before it works on a fresh machine. The application is
served through Nginx on ports 80 and 443; the web container does not publish a
host port directly.

Docker Compose does not provide Angular development live reload. For frontend
work, use the source-based workflow above. To stop the containers while
keeping the database volume, run `docker compose down`; `docker compose down
-v` also deletes the database volume and its data.

## Software

This workspace uses [Nx](https://nx.dev) to manage the applications and
libraries.

To explore the project graph, run:

```sh
npm run nx graph
```

To inspect the available targets for either application, run:

```sh
npm run nx show project netweave-web
npm run nx show project netweave-api
```

### Add Projects

Use Nx generators to create new libraries, components, services, ...:

```sh
npm run nx g @nx/angular:library mylib
npm run nx g c apps/netweave-web/src/app/components/.../name
```

Use `npm run nx list` to see installed plugins and
`npm run nx list <plugin-name>` to see their generators.

### Change Database

Use migrations when changing the database schema:

1. Change the relevant entity.
2. Generate a migration, giving it a descriptive name:

   ```sh
   npm run mig:generate -- organizations-renamed-name
   ```

   Generated migrations are placed under
   `apps/netweave-api/src/app/db/migrations/`.

3. Import the migration in
   `apps/netweave-api/src/app/db/db.migrations.ts`.
4. Inspect and run pending migrations against the database configured in
   `.env`:

   ```sh
   npm run mig:show
   npm run mig:run
   ```
