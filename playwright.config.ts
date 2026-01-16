import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 60000,
  // Snapshot configuration for visual regression
  // Snapshots generated via Docker (Linux) to match CI environment
  snapshotDir: './e2e/snapshots',
  snapshotPathTemplate: '{snapshotDir}/{testFilePath}/{arg}{ext}',
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
    },
  },
  use: {
    baseURL: 'https://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ignoreHTTPSErrors: true,
    // Consistent viewport for visual regression
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      // Pass THEME_FIXTURE through to fixture server for fixture selection
      command: `THEME_FIXTURE=${process.env.THEME_FIXTURE || 'withFullCustomTheme'} node e2e/fixture-server.js`,
      url: 'http://localhost:8001/metaData',
      reuseExistingServer: false, // Don't reuse - different tests need different fixtures
      timeout: 10000,
    },
    {
      command: 'HTTPS=true PORT=3001 REACT_APP_PROXY_LOCALHOST_PORT=8001 npm start',
      url: 'https://localhost:3001',
      reuseExistingServer: true,
      timeout: 120000,
      ignoreHTTPSErrors: true,
    },
  ],
});
