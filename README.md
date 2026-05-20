# Netweave

## About

See our [Glossary](./docs/glossary.md) or [Use Case Diagram](./docs/use-case-diagram.puml)

## Software

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

Run `npx nx graph` to visually explore what was created. Now, let's get you up to speed!

### Environment Variables

Configuration values such as API keys are pulled from a `.env` file (which is ignored by git) at the workspace root. A sample is provided in `.env.example`.

Make sure `.env` is A) setting values for all keys listed by `.env.example` and B) not committed; it is listed in `.gitignore` and `.dockerignore` already.

### Run tasks

To run the dev server for your app, use:

```sh
npm run serve # starts frontend, backend and all other required nx libs
```

To create a production bundle:

```sh
npm run build
```

To see all available targets to run for a project, run:

```sh
npm run nx show project [netweave-web][netweave-api]
```

### Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

Use the plugin's generator to create new projects.

To generate a new application, use:

```sh
npm run nx g @nx/angular:app demo
```

To generate a new library, use:

```sh
npm run nx g @nx/angular:lib mylib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

### Change Database

In order to make changes to a productive database, migrations are used.

1. make changes to an entity (for example just rename any property of organization.entity.ts)
1. after each change individually generate a migration file via `npm run mig:generate -- [name]`, name could be: organizations-renamed-name
   - this will track all changes seen to the entities and pour them into the newly generated migrations file under `apps/netweave-api/src/app/db/migrations/`
1. link the new migrations file in `apps/netweave-api/src/app/db/db.migrations.ts`
1. repeat those steps for multiple different changes.
1. see that the new migration is shown, but not yet executed via `npm run mig:show`
   - when there is an "X" in the box it means the migration has already been executed in the database currently connected (see .env).
1. run all migrations via `npm run mig:run`. This will execute all migrations which have not before to the currently connected (see .env) database.
