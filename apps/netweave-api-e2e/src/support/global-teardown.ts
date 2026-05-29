import { killPort } from '@nx/node/utils';

declare global {
  interface GlobalThis {
    __TEARDOWN_MESSAGE__?: string;
  }
}

module.exports = async function () {
  // Put clean up logic here (e.g. stopping services, docker-compose, etc.).
  // Hint: `globalThis` is shared between setup and teardown.
  await killPort(3000);
  console.log((globalThis as GlobalThis).__TEARDOWN_MESSAGE__);
};
