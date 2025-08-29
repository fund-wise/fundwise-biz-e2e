# Test Utils Package

Shared utilities and configurations for Fundwise Business E2E tests.

## Overview

This package provides common utilities, API clients, authentication helpers, and configuration management used across all e2e test suites.

## Installation

This package is automatically installed as a workspace dependency when you run `pnpm install` in the monorepo root.

## Usage

```typescript
import {
  testConfig,
  AuthHelper,
  createBackendApiClient,
  createIdpApiClient,
  wait,
  retry,
} from '@fundwise-biz-e2e/test-utils';
```

## Exports

### Configuration (`config.ts`)

**`testConfig`** - Centralized test configuration object containing:

- Base URLs for all applications and APIs
- Test user credentials
- Timeout values
- Headless mode setting

```typescript
const testConfig = {
  baseUrls: {
    webAdmin: 'http://localhost:3000',
    webIdp: 'http://localhost:3001',
    webInvestor: 'http://localhost:3002',
    apiBackend: 'http://localhost:4000',
    apiIdp: 'http://localhost:4001',
  },
  testUsers: {
    admin: { email: 'admin@test.com', password: 'password123' },
    investor: { email: 'investor@test.com', password: 'password123' },
    user: { email: 'user@test.com', password: 'password123' },
  },
  timeouts: {
    short: 5000,
    medium: 15000,
    long: 30000,
    extraLong: 60000,
  },
  headless: true,
};
```

### Authentication (`auth.ts`)

**`AuthHelper`** - Static class for handling authentication:

- `login(user)` - Authenticate user and return tokens
- `logout(refreshToken)` - Logout user
- `clearTokenCache()` - Clear cached tokens

```typescript
const tokens = await AuthHelper.login(testConfig.testUsers.admin);
await AuthHelper.logout(tokens.refreshToken);
```

**Interfaces:**

- `AuthTokens` - Access and refresh token pair
- `User` - User credentials (email, password)

### API Clients (`api.ts`)

**`ApiClient`** - Generic HTTP client with authentication support:

- `authenticate(user)` - Set authentication for subsequent requests
- `get<T>(url, config?)` - GET request
- `post<T>(url, data?, config?)` - POST request
- `put<T>(url, data?, config?)` - PUT request
- `patch<T>(url, data?, config?)` - PATCH request
- `delete<T>(url, config?)` - DELETE request

**Factory Functions:**

- `createBackendApiClient()` - Create client for backend API
- `createIdpApiClient()` - Create client for IDP API

```typescript
const apiClient = createBackendApiClient();
await apiClient.authenticate(testConfig.testUsers.admin);
const projects = await apiClient.get('/projects');
```

### Utilities (`helpers.ts`)

**`wait(ms)`** - Promise-based delay function

```typescript
await wait(1000); // Wait 1 second
```

**`retry(fn, attempts?, delay?)`** - Retry function with configurable attempts and delay

```typescript
const result = await retry(
  () => apiClient.get('/health'),
  3, // 3 attempts
  1000 // 1 second delay between attempts
);
```

## Environment Variables

The package reads configuration from environment variables:

### Application URLs

- `WEB_ADMIN_URL` - Admin dashboard URL
- `WEB_IDP_URL` - Identity provider URL
- `WEB_INVESTOR_URL` - Investor portal URL
- `API_BACKEND_URL` - Backend API URL
- `API_IDP_URL` - Identity provider API URL

### Test Credentials

- `TEST_ADMIN_EMAIL` / `TEST_ADMIN_PASSWORD`
- `TEST_INVESTOR_EMAIL` / `TEST_INVESTOR_PASSWORD`
- `TEST_USER_EMAIL` / `TEST_USER_PASSWORD`

### Test Configuration

- `PLAYWRIGHT_HEADLESS` - Run Playwright tests headless (true/false)
- `NODE_ENV` - Environment (should be 'test')

## Development

### Building

```bash
pnpm build
```

### Type Checking

```bash
pnpm typecheck
```

### Cleaning

```bash
pnpm clean
```

## Examples

### Playwright Test with Utilities

```typescript
import { test, expect } from '@playwright/test';
import { testConfig } from '@fundwise-biz-e2e/test-utils';

test('admin login flow', async ({ page }) => {
  await page.goto(testConfig.baseUrls.webAdmin);

  await page.fill('[data-testid=email]', testConfig.testUsers.admin.email);
  await page.fill('[data-testid=password]', testConfig.testUsers.admin.password);
  await page.click('[data-testid=login-button]');

  await expect(page).toHaveURL(/\/dashboard/);
});
```

### Jest API Test with Utilities

```typescript
import { createBackendApiClient, testConfig } from '@fundwise-biz-e2e/test-utils';

describe('Projects API', () => {
  let apiClient: ReturnType<typeof createBackendApiClient>;

  beforeAll(async () => {
    apiClient = createBackendApiClient();
    await apiClient.authenticate(testConfig.testUsers.admin);
  });

  test('should fetch projects', async () => {
    const projects = await apiClient.get('/projects');
    expect(Array.isArray(projects.data)).toBe(true);
  });
});
```
