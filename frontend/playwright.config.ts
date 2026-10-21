import { defineConfig } from 'playwright/test';
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  retries: 0,
  use: {
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
    },
    headless: true,
    trace: 'retain-on-failure'
  },
  projects: [{
    name: 'desktop',
    use: {
      viewport: {
        width: 1440,
        height: 1200
      }
    }
  }, {
    name: 'iphone-15-pro',
    use: {
      viewport: {
        width: 393,
        height: 852
      },
      isMobile: true,
      hasTouch: true
    }
  }, {
    name: 'samsung-s20-fe',
    use: {
      viewport: {
        width: 360,
        height: 800
      },
      isMobile: true,
      hasTouch: true
    }
  }]
});
