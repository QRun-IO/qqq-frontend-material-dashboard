import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 60000,
  use: {
    baseURL: 'https://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: `THEME_FIXTURE=${process.env.THEME_FIXTURE || 'withFullCustomTheme'} node e2e/fixture-server.js`,
      url: 'http://localhost:8001/metaData',
      reuseExistingServer: true,
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
