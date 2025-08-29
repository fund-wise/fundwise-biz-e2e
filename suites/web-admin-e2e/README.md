# Web Admin E2E Tests

End-to-end tests for the Fundwise Business admin dashboard application using Playwright.

## Overview

This suite tests the admin dashboard functionality including:

- User authentication and session management
- Dashboard navigation and layout
- Admin-specific features and workflows
- Cross-browser compatibility

## Prerequisites

- Node.js >= 22
- Playwright browsers installed: `pnpm exec playwright install`
- Admin dashboard running on configured URL (default: http://localhost:3000)

## Running Tests

### All Tests

```bash
pnpm test:e2e
```

### Headed Mode (with browser UI)

```bash
pnpm test:headed
```

### Debug Mode

```bash
pnpm test:debug
```

### Interactive Test Runner

```bash
pnpm test:ui
```

### Specific Tests

```bash
# Run specific test file
pnpm test:e2e tests/auth.spec.ts

# Run tests matching pattern
pnpm test:e2e --grep "login"
```

## Test Structure

```
tests/
├── auth/               # Authentication tests
├── dashboard/          # Dashboard functionality tests
├── navigation/         # Navigation and routing tests
└── fixtures/          # Test data and fixtures
```

## Configuration

Tests are configured via `playwright.config.ts`:

- Base URL from environment variables
- Cross-browser testing (Chrome, Firefox, Safari, Mobile)
- Screenshots and videos on failure
- Parallel execution
- Retry logic for CI environments

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { testConfig } from '@fundwise-biz-e2e/test-utils';

test('should load admin dashboard', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Admin Dashboard/);
});
```

### Using Shared Utilities

```typescript
import { test, expect } from '@playwright/test';
import { testConfig, AuthHelper } from '@fundwise-biz-e2e/test-utils';

test('should access protected route', async ({ page }) => {
  // Use shared auth utilities
  await page.goto('/login');
  await page.fill('[data-testid=email]', testConfig.testUsers.admin.email);
  await page.fill('[data-testid=password]', testConfig.testUsers.admin.password);
  await page.click('[data-testid=submit]');

  await expect(page).toHaveURL('/dashboard');
});
```

## Best Practices

- Use data-testid attributes for reliable element selection
- Leverage Page Object Model for complex workflows
- Use shared utilities from test-utils package
- Add proper waits for dynamic content
- Test across different browsers and viewports
- Clean up test data after test completion

## Debugging

### Local Debugging

```bash
# Run with browser visible
pnpm test:headed

# Step through tests interactively
pnpm test:debug

# Use Playwright inspector
pnpm test:ui
```

### CI Debugging

- Check test-results/ for screenshots and videos
- Review Playwright HTML report
- Enable trace collection for failed tests

## Environment Variables

Required environment variables (set in root .env file):

- `WEB_ADMIN_URL` - Admin dashboard URL
- `TEST_ADMIN_EMAIL` - Test admin user email
- `TEST_ADMIN_PASSWORD` - Test admin user password
- `PLAYWRIGHT_HEADLESS` - Run tests headless (true/false)
