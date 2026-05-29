import { killPort } from '@nx/node/utils';
import { execSync } from 'child_process';
import * as path from 'path';

declare global {
  interface GlobalThis {
    __TEARDOWN_MESSAGE__?: string;
    __E2E_API_PROCESS__?: import('child_process').ChildProcess;
  }
}

module.exports = async function () {
  const workspaceRoot = path.resolve(__dirname, '../../../../');
  const composeFile = path.join(workspaceRoot, 'docker-compose.e2e.yml');

  const globalState = globalThis as GlobalThis;

  if (globalState.__E2E_API_PROCESS__) {
    try {
      globalState.__E2E_API_PROCESS__.kill('SIGTERM');
    } catch {
      // ignore
    }
  }

  try {
    await killPort(3000);
  } catch {
    // ignore
  }

  try {
    execSync(`docker compose -f ${composeFile} down -v`, {
      cwd: workspaceRoot,
      stdio: 'inherit',
    });
  } catch {
    // ignore
  }

  console.log((globalThis as GlobalThis).__TEARDOWN_MESSAGE__);
};
