// Visual regression against the built Storybook (doc 08 §1). Runs on GitHub Actions only.
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'visual',
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  timeout: 30000,
  workers: 2,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.001, animations: 'disabled', caret: 'hide' } },
  use: { baseURL: 'http://127.0.0.1:6006', colorScheme: 'light', reducedMotion: 'reduce' },
  webServer: {
    command: 'npx http-server storybook-static -p 6006 -s',
    url: 'http://127.0.0.1:6006/index.json',
    reuseExistingServer: false,
  },
});
