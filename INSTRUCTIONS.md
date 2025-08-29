# Fundwise E2E Test Suite Instructions

## Project Overview

This monorepo contains comprehensive end-to-end test suites for the Fundwise business platform. It's designed to test all applications and APIs in the main Fundwise monorepo through automated browser and API testing.

## Architecture

### Test Suites

- **web-admin-e2e**: Playwright tests for the admin dashboard (React Router v7)
- **web-idp-e2e**: Playwright tests for the identity provider UI (React Router v7)
- **web-investor-e2e**: Playwright tests for the investor portal (React Router v7)
- **api-backend-e2e**: Jest + Supertest tests for the backend API (NestJS)
- **api-idp-e2e**: Jest + Supertest tests for the identity provider API (NestJS)

### Shared Packages

- **@fundwise-biz-e2e/test-utils**: Common utilities, API clients, and test helpers
- **@fundwise-biz-e2e/eslint-config**: Shared ESLint configurations for test suites
- **@fundwise-biz-e2e/typescript-config**: Shared TypeScript configurations

## Development Workflow

### Prerequisites

- Node.js 22+
- pnpm 10.15.0+
- Playwright browsers installed
- All Fundwise applications running locally or in test environment

### Initial Setup

```bash
# Install dependencies
pnpm install

# Install Playwright browsers
pnpm --filter "*web*-e2e" exec playwright install

# Copy environment configuration
cp .env.example .env
# Edit .env with your test environment URLs and credentials

# Verify setup by running a simple test
pnpm --filter @fundwise-biz-e2e/web-admin-e2e test:e2e --grep "health"
```

### Common Commands

```bash
# Run all e2e tests
pnpm test:e2e

# Run linting across all suites
pnpm lint

# Run type checking
pnpm typecheck

# Format all code
pnpm format

# Clean test artifacts
pnpm clean

# Complete clean (including node_modules)
pnpm clean:all
```

### Working with Specific Test Suites

```bash
# Run specific web suite tests
pnpm --filter @fundwise-biz-e2e/web-admin-e2e test:e2e

# Run API tests in watch mode
pnpm --filter @fundwise-biz-e2e/api-backend-e2e test:watch

# Run Playwright tests in headed mode
pnpm --filter "*web*-e2e" test:headed

# Debug Playwright tests
pnpm --filter @fundwise-biz-e2e/web-admin-e2e test:debug

# Run tests for all web suites
turbo test:e2e --filter="*web*-e2e"
```

### Environment Configuration

Configure your test environment by editing `.env`:

```bash
# Application URLs (adjust for your environment)
WEB_ADMIN_URL=http://localhost:3000
WEB_IDP_URL=http://localhost:3001
WEB_INVESTOR_URL=http://localhost:3002
API_BACKEND_URL=http://localhost:4000
API_IDP_URL=http://localhost:4001

# Test user credentials
TEST_ADMIN_EMAIL=admin@test.com
TEST_ADMIN_PASSWORD=password123
# ... etc
```

## Testing Standards

### Test Organization

#### Playwright Tests (Web Applications)

- Organize tests by feature/page in logical directories
- Use Page Object Model for complex interactions
- Include both desktop and mobile viewport testing
- Test critical user journeys end-to-end

#### API Tests (Backend Services)

- Organize tests by API endpoint or feature
- Test both success and error scenarios
- Include authentication/authorization testing
- Validate request/response schemas

### Code Standards

#### TypeScript

- Use strict TypeScript configuration from shared packages
- All test code must pass type checking (`pnpm typecheck`)
- Leverage shared types from `@fundwise-biz-e2e/test-utils`

#### Linting

- Use shared ESLint config optimized for testing frameworks
- All code must pass linting (`pnpm lint`)
- Auto-format with Prettier (`pnpm format`)

#### Test Quality

- Write clear, descriptive test names that explain expected behavior
- Use shared utilities from test-utils package for consistency
- Clean up test data to avoid test pollution
- Include proper error handling and timeouts

## Development Guidelines

### Adding New Tests

1. **Identify the appropriate test suite** based on what you're testing
2. **Use shared utilities** from `@fundwise-biz-e2e/test-utils` for:
   - API authentication and requests
   - Common test configuration
   - Utility functions (retry, wait, etc.)
3. **Follow existing patterns** within each test suite
4. **Include both positive and negative test cases**
5. **Test error conditions and edge cases**

### Web Testing Best Practices

#### Playwright Guidelines

```typescript
// Use data-testid attributes for reliable element selection
await page.click('[data-testid=submit-button]');

// Wait for specific conditions rather than arbitrary timeouts
await expect(page.locator('[data-testid=success-message]')).toBeVisible();

// Use shared configuration and utilities
import { testConfig } from '@fundwise-biz-e2e/test-utils';
await page.goto(testConfig.baseUrls.webAdmin);
```

#### Cross-browser Testing

- All web tests run on Chrome, Firefox, Safari, and mobile viewports
- Test responsive design at different screen sizes
- Verify functionality works consistently across browsers

### API Testing Best Practices

#### Jest + Supertest Guidelines

```typescript
// Use shared API clients for consistency
import { createBackendApiClient, testConfig } from '@fundwise-biz-e2e/test-utils';

const apiClient = createBackendApiClient();
await apiClient.authenticate(testConfig.testUsers.admin);

// Test both success and error scenarios
describe('Projects API', () => {
  test('should create project with valid data', async () => {
    const project = await apiClient.post('/projects', validData);
    expect(project).toHaveProperty('id');
  });

  test('should reject invalid project data', async () => {
    await expect(apiClient.post('/projects', invalidData)).rejects.toThrow();
  });
});
```

#### Authentication Testing

- Test authentication flows thoroughly
- Verify authorization for protected endpoints
- Test token refresh and expiration scenarios
- Use shared AuthHelper for consistent authentication

### Email Testing with Resend

The Fundwise platform uses Resend.com for email delivery. E2E tests need to verify email interactions including:

- User registration email verification
- Password reset emails
- Investment notifications
- Administrative communications

#### Email Testing Strategies

##### 1. Test Email Addresses

Use dedicated test email addresses or email services that allow programmatic access:

```typescript
// In test-utils/src/config.ts
export const emailConfig = {
  testDomain: process.env.TEST_EMAIL_DOMAIN || 'test.fundwise.local',
  resendApiKey: process.env.RESEND_TEST_API_KEY,
  emailProvider: process.env.EMAIL_TEST_PROVIDER || 'resend', // 'resend' | 'ethereal' | 'mailhog'
};

// Generate unique test email addresses
export const generateTestEmail = (prefix: string = 'test') =>
  `${prefix}.${Date.now()}@${emailConfig.testDomain}`;
```

##### 2. Email Verification Helper

```typescript
// In test-utils/src/email.ts
import { Resend } from 'resend';

export class EmailTestHelper {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(emailConfig.resendApiKey);
  }

  async getEmailsByRecipient(email: string, maxAge: number = 60000): Promise<any[]> {
    // Query Resend API for recent emails to this address
    // Note: Resend may have limitations on retrieving sent emails in test mode
  }

  async extractVerificationLink(email: string, subject: string): Promise<string | null> {
    const emails = await this.getEmailsByRecipient(email);
    const targetEmail = emails.find((e) => e.subject.includes(subject));

    if (!targetEmail) return null;

    // Extract verification link from email body
    const linkMatch = targetEmail.html.match(/href="([^"]*verify[^"]*)"/);
    return linkMatch ? linkMatch[1] : null;
  }

  async waitForEmail(email: string, subject: string, timeout: number = 30000): Promise<any> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const emails = await this.getEmailsByRecipient(email);
      const targetEmail = emails.find((e) => e.subject.includes(subject));

      if (targetEmail) return targetEmail;

      await wait(2000); // Check every 2 seconds
    }

    throw new Error(`Email with subject "${subject}" not received within ${timeout}ms`);
  }
}
```

##### 3. Email Testing in E2E Tests

```typescript
// Example: Registration with email verification
import { test, expect } from '@playwright/test';
import { testConfig, generateTestEmail, EmailTestHelper } from '@fundwise-biz-e2e/test-utils';

test('user registration with email verification', async ({ page }) => {
  const emailHelper = new EmailTestHelper();
  const testEmail = generateTestEmail('registration');

  // Step 1: Register user
  await page.goto(`${testConfig.baseUrls.webIdp}/register`);
  await page.fill('[data-testid=email]', testEmail);
  await page.fill('[data-testid=password]', 'TestPassword123!');
  await page.click('[data-testid=register-button]');

  // Step 2: Verify registration success message
  await expect(page.locator('[data-testid=verification-message]')).toContainText(
    'Please check your email'
  );

  // Step 3: Wait for verification email
  const verificationEmail = await emailHelper.waitForEmail(
    testEmail,
    'Verify your email address',
    30000
  );

  // Step 4: Extract and visit verification link
  const verificationLink = await emailHelper.extractVerificationLink(
    testEmail,
    'Verify your email address'
  );

  expect(verificationLink).toBeTruthy();
  await page.goto(verificationLink!);

  // Step 5: Verify account is activated
  await expect(page.locator('[data-testid=verification-success]')).toContainText(
    'Email verified successfully'
  );
});

// Example: Password reset flow
test('password reset via email', async ({ page }) => {
  const emailHelper = new EmailTestHelper();
  const userEmail = testConfig.testUsers.user.email;

  // Step 1: Request password reset
  await page.goto(`${testConfig.baseUrls.webIdp}/forgot-password`);
  await page.fill('[data-testid=email]', userEmail);
  await page.click('[data-testid=reset-button]');

  // Step 2: Wait for reset email
  const resetEmail = await emailHelper.waitForEmail(userEmail, 'Reset your password');

  // Step 3: Extract and visit reset link
  const resetLink = await emailHelper.extractVerificationLink(userEmail, 'Reset your password');

  await page.goto(resetLink!);

  // Step 4: Set new password
  await page.fill('[data-testid=new-password]', 'NewPassword123!');
  await page.fill('[data-testid=confirm-password]', 'NewPassword123!');
  await page.click('[data-testid=update-password]');

  // Step 5: Verify password was updated
  await expect(page.locator('[data-testid=success-message]')).toContainText(
    'Password updated successfully'
  );
});
```

##### 4. Alternative Email Testing Approaches

**Option A: MailHog (Local Development)**

```bash
# Run MailHog locally for email capture
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog

# Configure applications to use MailHog SMTP
SMTP_HOST=localhost
SMTP_PORT=1025
```

**Option B: Ethereal Email (Testing Service)**

```typescript
// Use Ethereal for disposable test email accounts
import nodemailer from 'nodemailer';

export class EtherealEmailHelper {
  async createTestAccount() {
    return await nodemailer.createTestAccount();
  }

  async getInbox(testAccount: any) {
    // Access Ethereal inbox programmatically
  }
}
```

**Option C: Resend Webhook Testing**

```typescript
// Set up webhook endpoint to capture email events
export const setupEmailWebhooks = () => {
  // Configure Resend webhooks to notify test suite of email events
  // Useful for integration testing
};
```

##### 5. Environment Configuration for Email Testing

```env
# Email testing configuration
RESEND_TEST_API_KEY=re_test_123456789
TEST_EMAIL_DOMAIN=test.fundwise.local
EMAIL_TEST_PROVIDER=resend

# Alternative providers
MAILHOG_URL=http://localhost:8025
ETHEREAL_USERNAME=test@ethereal.email
ETHEREAL_PASSWORD=test123
```

##### 6. Email Content Validation

```typescript
// Test email content and formatting
describe('Email Content Validation', () => {
  test('registration email contains correct content', async () => {
    const emailHelper = new EmailTestHelper();
    const testEmail = generateTestEmail('content-test');

    // Trigger registration
    await registerUser(testEmail);

    // Get verification email
    const email = await emailHelper.waitForEmail(testEmail, 'Welcome');

    // Validate email content
    expect(email.subject).toContain('Welcome to Fundwise');
    expect(email.html).toContain('verify your email');
    expect(email.html).toContain(testEmail);
    expect(email.from).toBe('noreply@fundwise.com');

    // Validate email structure
    expect(email.html).toMatch(/<!DOCTYPE html>/);
    expect(email.text).toBeTruthy(); // Plain text version exists
  });
});
```

### Test Data Management

#### Using Test Fixtures

```typescript
// Prefer generated test data over hardcoded values
const testProject = {
  name: `Test Project ${Date.now()}`,
  description: 'Generated test project',
  targetAmount: 100000,
};

// Clean up created test data
afterEach(async () => {
  if (createdProjectId) {
    await apiClient.delete(`/projects/${createdProjectId}`);
  }
});
```

#### Environment Isolation

- Use unique identifiers (timestamps, UUIDs) to avoid conflicts
- Clean up test data after each test when possible
- Use separate test databases/environments when available

## Testing Strategies

### Critical Path Testing

Focus e2e tests on critical user journeys:

- User registration and authentication flows
- Core business workflows (project creation, investment flows)
- Payment and financial transactions
- Admin management tasks

### Integration Points

Test integration between services:

- API authentication with IDP service
- Data consistency between frontend and backend
- Cross-application navigation and state management

### Error Scenarios

Include comprehensive error testing:

- Network failures and timeouts
- Invalid user inputs and edge cases
- Authentication/authorization failures
- Service unavailability scenarios

## Debugging and Troubleshooting

### Local Debugging

#### Playwright Debugging

```bash
# Run with browser visible
pnpm --filter @fundwise-biz-e2e/web-admin-e2e test:headed

# Interactive debugging
pnpm --filter @fundwise-biz-e2e/web-admin-e2e test:debug

# Use Playwright inspector UI
pnpm --filter @fundwise-biz-e2e/web-admin-e2e test:ui
```

#### API Test Debugging

```bash
# Run with Node debugger
pnpm --filter @fundwise-biz-e2e/api-backend-e2e test:debug

# Verbose test output
pnpm --filter @fundwise-biz-e2e/api-backend-e2e test:e2e --verbose
```

### Common Issues

#### Application Not Running

- Verify all required services are running
- Check environment URLs in .env file
- Confirm applications are accessible at configured URLs

#### Authentication Failures

- Verify test user credentials in .env
- Check that test users exist in the target environment
- Ensure authentication endpoints are accessible

#### Flaky Tests

- Add proper waits instead of fixed timeouts
- Use retry mechanisms for unstable operations
- Check for race conditions in parallel tests

## CI/CD Integration

### Test Execution in CI

- Tests are configured to run headless in CI environments
- Retries are enabled for flaky test scenarios
- Test artifacts (screenshots, videos, reports) are captured
- JUnit XML reports are generated for test result analysis

### Environment Setup

```bash
# CI environment variables
NODE_ENV=test
PLAYWRIGHT_HEADLESS=true
CI=true

# Application URLs for CI environment
WEB_ADMIN_URL=https://admin-staging.fundwise.com
API_BACKEND_URL=https://api-staging.fundwise.com
# ... etc
```

## Performance and Reliability

### Test Execution Speed

- Use parallel execution where possible
- Filter test runs to specific suites during development
- Leverage Turbo's caching for faster builds
- Optimize test data setup and cleanup

### Test Reliability

- Use explicit waits instead of sleep/timeouts
- Implement retry mechanisms for flaky operations
- Clean up test data to prevent interference
- Use stable element selectors (data-testid)

## Integration with Main Fundwise Monorepo

### Repository Relationship

This e2e test suite is designed to work alongside the main `fundwise-biz` monorepo:

```
~/source/
├── fundwise-biz/           # Main application monorepo
│   ├── apps/              # Applications being tested
│   │   ├── api-backend/
│   │   ├── api-idp/
│   │   ├── web-admin/
│   │   ├── web-idp/
│   │   └── web-investor/
│   └── packages/          # Shared business logic
└── fundwise-biz-e2e/      # This e2e test suite
    ├── suites/            # Test suites for each app
    └── packages/          # Shared test utilities
```

### Version Compatibility

#### Keeping Tests in Sync

- E2E tests should be updated when application APIs or UIs change
- Use semantic versioning to track compatibility between test suite and applications
- Tag test suite versions that are compatible with specific application releases

#### Branch Strategy

```bash
# Keep e2e tests aligned with main application development
git checkout main                    # Latest stable tests
git checkout develop                 # Tests for upcoming features
git checkout feature/new-feature     # Tests for specific features
```

#### Application Change Notifications

- Monitor main repo for breaking changes that affect e2e tests
- Set up webhooks or notifications for relevant commits in main repo
- Maintain a compatibility matrix between app versions and test versions

### Development Workflow Integration

#### Local Development

```bash
# Start all Fundwise applications from main repo
cd ~/source/fundwise-biz
pnpm dev

# Run e2e tests against local applications
cd ~/source/fundwise-biz-e2e
pnpm test:e2e
```

#### Feature Development Process

1. **New feature developed** in main `fundwise-biz` repo
2. **Update e2e tests** in this repo to cover new functionality
3. **Run tests against feature branch** of main applications
4. **Merge both repos** when feature is complete and tests pass

### CI/CD Integration Strategies

#### Triggering E2E Tests from Main Repo

```yaml
# Example GitHub Actions workflow in fundwise-biz repo
name: Trigger E2E Tests
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  trigger-e2e:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger E2E Test Suite
        uses: peter-evans/repository-dispatch@v2
        with:
          token: ${{ secrets.E2E_REPO_TOKEN }}
          repository: your-org/fundwise-biz-e2e
          event-type: run-e2e-tests
          client-payload: |
            {
              "branch": "${{ github.ref_name }}",
              "commit": "${{ github.sha }}",
              "trigger_repo": "fundwise-biz"
            }
```

#### Cross-Repository Test Reporting

- Report e2e test results back to main repo PRs
- Block main repo deployments if critical e2e tests fail
- Use shared test result storage (S3, artifact storage)

### Environment Synchronization

#### Application Deployment Coordination

```bash
# Ensure applications are deployed before running e2e tests
# Example CI pipeline coordination

1. Deploy main applications to staging
2. Wait for deployment health checks
3. Trigger e2e test suite against staging environment
4. Report results back to main repo
```

#### Configuration Management

- Share environment configurations between repos where possible
- Use consistent naming conventions for URLs and services
- Maintain environment-specific test configurations

### API Contract Testing

#### Keeping API Tests Current

- Use OpenAPI/Swagger specs from main repo to validate API contracts
- Generate API client types from main repo schemas
- Run contract tests before full e2e test execution

#### Breaking Change Detection

```typescript
// Example: Detect API schema changes
import { validateApiSchema } from '@fundwise-biz-e2e/test-utils';

describe('API Contract Validation', () => {
  test('backend API schema matches expectations', async () => {
    const currentSchema = await fetchApiSchema('/api/swagger.json');
    const expectedSchema = loadExpectedSchema('backend-api-v1.json');

    expect(currentSchema).toMatchApiSchema(expectedSchema);
  });
});
```

## Monitoring and Maintenance

### Regular Maintenance Tasks

- Update test dependencies regularly
- Review and update test data and fixtures
- Monitor test execution times and optimize slow tests
- Update environment configurations as applications evolve

### Test Coverage Assessment

- Regularly review test coverage for critical user paths
- Identify gaps in error scenario testing
- Ensure new features have corresponding e2e tests
- Monitor test failure patterns to identify system issues

## Contributing

### Before Submitting Changes

1. **Run all affected tests locally**: `pnpm test:e2e`
2. **Ensure linting passes**: `pnpm lint`
3. **Verify type checking**: `pnpm typecheck`
4. **Test in multiple browsers** for web tests
5. **Update documentation** for significant changes

### Code Review Guidelines

When reviewing test code, ensure:

- [ ] Tests have clear, descriptive names
- [ ] Shared utilities are used consistently
- [ ] Test data is properly cleaned up
- [ ] Error scenarios are covered
- [ ] Tests are deterministic and not flaky
- [ ] Environment configuration is flexible

### Writing Commit Messages

```
feat(web-admin): add project creation e2e tests
fix(api-backend): handle authentication timeout scenarios
docs(readme): update debugging instructions
refactor(test-utils): improve API client error handling
```

## Security Considerations

### Test Environment Security

- Use separate test credentials from production
- Avoid hardcoding sensitive values in test code
- Use environment variables for all configuration
- Regularly rotate test user credentials

### Test Data Security

- Don't use real customer data in tests
- Generate synthetic test data
- Clean up sensitive test data after execution
- Follow data privacy guidelines for test environments
