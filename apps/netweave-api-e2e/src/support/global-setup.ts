import { waitForPortOpen } from '@nx/node/utils';
import { execSync, spawn } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { seedDatabase } from './seed';

declare global {
  interface GlobalThis {
    __TEARDOWN_MESSAGE__?: string;
    __E2E_API_PROCESS__?: import('child_process').ChildProcess;
  }
}

module.exports = async function () {
  const workspaceRoot = path.resolve(__dirname, '../../../../');
  const envPath = path.join(workspaceRoot, '.env.e2e');
  dotenv.config({ path: envPath });

  // Start ephemeral database for local e2e.
  console.log('\nSetting up e2e database...\n');
  function ensureDockerDaemon() {
    try {
      execSync('docker version', { stdio: 'pipe' });
    } catch (innerError) {
      throw new Error(
        `Docker daemon does not appear to be available. Start Docker Desktop or the daemon, then retry. Original error: ${innerError}`,
      );
    }
  }

  ensureDockerDaemon();

  const composeFile = path.join(workspaceRoot, 'docker-compose.e2e.yml');
  try {
    execSync(`docker compose --env-file ${envPath} -f ${composeFile} up -d`, {
      cwd: workspaceRoot,
      stdio: 'inherit',
    });
  } catch (error) {
    throw new Error(
      `Failed to launch e2e database container. Make sure Docker is installed and the daemon is running. Original error: ${error}`,
    );
  }

  await waitForPortOpen(Number(process.env.DB_PORT ?? 5432), {
    host: process.env.DB_HOST ?? 'localhost',
  });
  console.log('Database is ready.');

  // Launch the API app using the e2e environment.
  console.log('Starting e2e API server...');
  const apiProcess = spawn(
    'node',
    [path.join(workspaceRoot, 'dist/apps/netweave-api/main.js')],
    {
      cwd: workspaceRoot,
      env: { ...process.env, NODE_ENV: 'e2e' },
      stdio: 'inherit',
    },
  );

  (globalThis as GlobalThis).__E2E_API_PROCESS__ = apiProcess;

  await waitForPortOpen(3000, { host: 'localhost' });
  console.log('API server is ready.');

  await seedDatabase();
  console.log('Seeded e2e database.');

  (globalThis as GlobalThis).__TEARDOWN_MESSAGE__ =
    '\nTearing down e2e environment...\n';
};
