import { defineConfig, devices } from '@playwright/test';
import { testConfig } from '@fundwise-biz-e2e/test-utils';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['junit', { outputFile: 'test-results/junit-results.xml' }]],
  use: {
    baseURL: testConfig.baseUrls.webInvestor,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: testConfig.headless,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  // webServer configuration commented out - run your application separately
  // webServer: process.env.CI
  //   ? undefined
  //   : {
  //       command: 'echo "Assuming web-investor is running on port 3002"',
  //       port: 3002,
  //       reuseExistingServer: true,
  //     },
});