const { createConfig } = require('@openedx/frontend-build');

module.exports = createConfig('jest', {
  setupFilesAfterEnv: ['<rootDir>/src/setupTest.js'],
  coveragePathIgnorePatterns: ['/__fixtures__/', 'src/setupTest.js', 'src/index.js'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/visual/'],
});
