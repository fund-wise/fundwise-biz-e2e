# Fundwise Business E2E Test Suites

This monorepo contains end-to-end test suites for all Fundwise Business applications and APIs.

## Prerequisites

- Node.js >= 22
- pnpm >= 10.15.0

## Getting Started

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Install Playwright browsers (for web tests):**

   ```bash
   pnpm --filter "*web*-e2e" exec playwright install
   ```

3. **Set up environment variables:**
   Copy `.env.example` to `.env` and configure your test environment URLs and credentials.

## Repository Structure

```
├── suites/                    # E2E test suites
│   ├── web-admin-e2e/        # Admin web app tests (Playwright)
│   ├── web-idp-e2e/          # Identity provider web tests (Playwright)
│   ├── web-investor-e2e/     # Investor web app tests (Playwright)
│   ├── api-backend-e2e/      # Backend API tests (Jest + Supertest)
│   └── api-idp-e2e/          # Identity provider API tests (Jest + Supertest)
├── packages/                  # Shared packages
│   ├── eslint-config/        # ESLint configurations
│   ├── typescript-config/    # TypeScript configurations
│   └── test-utils/           # Shared testing utilities
└── turbo.json                # Turbo build configuration
```

## Available Scripts

### Root Level Commands

- `pnpm test:e2e` - Run all e2e tests across all suites
- `pnpm lint` - Lint all packages and suites
- `pnpm typecheck` - Type check all packages and suites
- `pnpm format` - Format code with Prettier
- `pnpm clean` - Clean build artifacts and caches
- `pnpm clean:all` - Clean everything including node_modules

### Suite-Specific Commands

Run commands in specific suites using pnpm filters:

```bash
# Run web-admin e2e tests
pnpm --filter @fundwise-biz-e2e/web-admin-e2e test:e2e

# Run API tests with watch mode
pnpm --filter @fundwise-biz-e2e/api-backend-e2e test:watch

# Run Playwright tests in headed mode
pnpm --filter "*web*-e2e" test:headed
```

## Test Suites

### Web Application Tests (Playwright)

- **web-admin-e2e**: Tests for the admin dashboard application
- **web-idp-e2e**: Tests for the identity provider/authentication flows
- **web-investor-e2e**: Tests for the investor portal application

### API Tests (Jest + Supertest)

- **api-backend-e2e**: Tests for the main backend API endpoints
- **api-idp-e2e**: Tests for the identity provider API endpoints

## Environment Configuration

Create a `.env` file in the root directory with:

```env
# Application URLs
WEB_ADMIN_URL=http://localhost:3000
WEB_IDP_URL=http://localhost:3001
WEB_INVESTOR_URL=http://localhost:3002
API_BACKEND_URL=http://localhost:4000
API_IDP_URL=http://localhost:4001

# Test User Credentials
TEST_ADMIN_EMAIL=admin@test.com
TEST_ADMIN_PASSWORD=password123
TEST_INVESTOR_EMAIL=investor@test.com
TEST_INVESTOR_PASSWORD=password123
TEST_USER_EMAIL=user@test.com
TEST_USER_PASSWORD=password123

# Test Configuration
PLAYWRIGHT_HEADLESS=true
NODE_ENV=test
```

## Running Tests

### All Tests

```bash
pnpm test:e2e
```

### Specific Suite

```bash
pnpm --filter @fundwise-biz-e2e/web-admin-e2e test:e2e
```

### Debug Mode

```bash
# Playwright tests with debug
pnpm --filter @fundwise-biz-e2e/web-admin-e2e test:debug

# Jest tests with debug
pnpm --filter @fundwise-biz-e2e/api-backend-e2e test:debug
```

### Headed Mode (Playwright)

```bash
pnpm --filter "*web*-e2e" test:headed
```

### Watch Mode (Jest)

```bash
pnpm --filter "*api*-e2e" test:watch
```

## Development

### Adding New Tests

1. Navigate to the appropriate suite directory
2. Add your test files following the existing patterns
3. Use shared utilities from `@fundwise-biz-e2e/test-utils`
4. Run tests locally before committing

### Shared Utilities

The `test-utils` package provides:

- API clients for backend and IDP services
- Authentication helpers
- Common test configuration
- Utility functions (retry, wait, etc.)

### Code Quality

- ESLint configurations are shared via `@fundwise-biz-e2e/eslint-config`
- TypeScript configurations are shared via `@fundwise-biz-e2e/typescript-config`
- Prettier formatting is enforced across the monorepo

## CI/CD Integration

The test suites are configured for CI environments:

- Retries are enabled in CI mode
- JUnit XML reports are generated
- Artifacts (screenshots, videos) are captured on failure
- Tests run in parallel where possible

## Troubleshooting

### Common Issues

1. **Playwright browser installation**: Run `pnpm exec playwright install`
2. **Port conflicts**: Ensure test applications are running on expected ports
3. **Environment variables**: Verify `.env` file is configured correctly
4. **Dependencies**: Run `pnpm install` in root directory

### Debug Tips

- Use `test:debug` scripts for step-by-step debugging
- Check `test-results/` directories for failure artifacts
- Use `test:ui` for Playwright's interactive test runner
- Enable verbose logging with `DEBUG=*` environment variable
