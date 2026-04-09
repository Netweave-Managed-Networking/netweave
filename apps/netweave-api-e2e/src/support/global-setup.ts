import { waitForPortOpen } from '@nx/node/utils';

/* eslint-disable */
var __TEARDOWN_MESSAGE__: string;

module.exports = async function () {
  // Start services that that the app needs to run (e.g. database, docker-compose, etc.).
  console.log('\nSetting up...\n');

  const port = Number(process.env.PORT ?? 3000);
  await waitForPortOpen(port, { host: 'localhost' });

  // Hint: Use `globalThis` to pass variables to global teardown.
  (globalThis as any).__TEARDOWN_MESSAGE__ = '\nTearing down...\n';
};
