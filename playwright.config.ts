import { defineConfig, devices } from '@playwright/test';

const fixturePort = process.env.FIXTURE_PORT || '8001';
const dashboardPort = process.env.DASHBOARD_PORT || '3001';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 60000,
  // Snapshot configuration for visual regression
  // Platform-specific snapshots: linux/ for CI, darwin/ for local macOS
  snapshotDir: './e2e/snapshots',
  snapshotPathTemplate: '{snapshotDir}/{testFilePath}/{platform}/{arg}{ext}',
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
    },
  },
  use: {
    baseURL: `https://localhost:${dashboardPort}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ignoreHTTPSErrors: true,
    channel: process.env.PLAYWRIGHT_CHANNEL,
    // Consistent viewport for visual regression
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: 'themed',
      testMatch: /.*(?<!unthemed-regression)\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'unthemed',
      testMatch: /unthemed-regression\.spec\.ts$/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: `THEME_FIXTURE=${process.env.THEME_FIXTURE || 'withFullCustomTheme'} node e2e/fixture-server.js`,
      url: `http://localhost:${fixturePort}/metaData`,
      reuseExistingServer: true,
      timeout: 60000, // 1 minute - Docker startup can be slow
    },
    {
      command: `HTTPS=true PORT=${dashboardPort} REACT_APP_PROXY_LOCALHOST_PORT=${fixturePort} npm start`,
      url: `https://localhost:${dashboardPort}`,
      reuseExistingServer: true,
      timeout: 300000, // 5 minutes - React compilation in Docker takes time
      ignoreHTTPSErrors: true,
    },
  ],
});
