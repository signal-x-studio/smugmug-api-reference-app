import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Runtime Error Detection E2E Tests
 *
 * SmugMug API Reference App - Browser-based error detection testing
 */
export default defineConfig({
  testDir: './e2e/runtime-errors',

  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'test-results/playwright-report' }],
    ['json', { outputFile: 'test-results/runtime-errors/e2e-results.json' }],
    ['list'],
  ],

  // Global test settings
  use: {
    // Base URL for tests
    baseURL: 'http://localhost:5173',

    // Capture screenshots and videos on failure
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    // Browser context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    // Collect console logs and errors
    launchOptions: {
      args: ['--disable-blink-features=AutomationControlled'],
    },
  },

  // Projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Dev server configuration
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Output directory
  outputDir: 'test-results/runtime-errors/e2e-artifacts',
});
