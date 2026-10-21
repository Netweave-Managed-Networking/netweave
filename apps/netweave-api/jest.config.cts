module.exports = {
  displayName: 'netweave-api',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  // the ai sdk ships as esm only, so jest (running commonjs) has to transform it like our own code
  transformIgnorePatterns: [
    '/node_modules/(?!(ai|@ai-sdk/[^/]+|@workflow/[^/]+|eventsource-parser)/)',
  ],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/netweave-api',
};
