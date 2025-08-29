# API Backend E2E Tests

End-to-end tests for the Fundwise Business backend API using Jest and Supertest.

## Overview

This suite tests the backend API functionality including:

- REST API endpoints
- Authentication and authorization
- Data validation and error handling
- Integration with database and external services

## Prerequisites

- Node.js >= 22
- Backend API running on configured URL (default: http://localhost:4000)
- Test database available and seeded with test data

## Running Tests

### All Tests

```bash
pnpm test:e2e
```

### Watch Mode

```bash
pnpm test:watch
```

### Debug Mode

```bash
pnpm test:debug
```

### Specific Tests

```bash
# Run specific test file
pnpm test:e2e tests/auth.test.ts

# Run tests matching pattern
pnpm test:e2e --testNamePattern="should authenticate"
```

## Test Structure

```
tests/
├── auth/               # Authentication endpoint tests
├── projects/           # Project management API tests
├── investors/          # Investor management API tests
├── invitations/        # Invitation system API tests
└── helpers/           # Test helpers and utilities
```

## Configuration

Tests are configured via `jest.config.js`:

- TypeScript support with ts-jest
- Test environment setup and teardown
- Coverage collection
- Test timeout configuration

## Writing Tests

### Basic API Test Structure

```typescript
import request from 'supertest';
import { testConfig, createBackendApiClient } from '@fundwise-biz-e2e/test-utils';

describe('Projects API', () => {
  const baseUrl = testConfig.baseUrls.apiBackend;

  test('GET /projects should return projects list', async () => {
    const response = await request(baseUrl).get('/projects').expect(200);

    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

### Using Shared API Client

```typescript
import { createBackendApiClient, testConfig } from '@fundwise-biz-e2e/test-utils';

describe('Authenticated API Tests', () => {
  let apiClient: ReturnType<typeof createBackendApiClient>;

  beforeAll(async () => {
    apiClient = createBackendApiClient();
    await apiClient.authenticate(testConfig.testUsers.admin);
  });

  test('should create new project', async () => {
    const projectData = {
      name: 'Test Project',
      description: 'Test Description',
      targetAmount: 100000,
    };

    const project = await apiClient.post('/projects', projectData);
    expect(project).toHaveProperty('id');
    expect(project.name).toBe(projectData.name);
  });
});
```

## Best Practices

- Use descriptive test names that explain the expected behavior
- Test both success and error scenarios
- Clean up created test data in afterEach/afterAll hooks
- Use shared utilities for authentication and API calls
- Test request validation and response structure
- Mock external service dependencies when needed
- Use proper HTTP status code assertions

## Testing Patterns

### Authentication Testing

```typescript
describe('Authentication', () => {
  test('should authenticate with valid credentials', async () => {
    const response = await request(baseUrl)
      .post('/auth/login')
      .send({
        email: testConfig.testUsers.user.email,
        password: testConfig.testUsers.user.password,
      })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  test('should reject invalid credentials', async () => {
    await request(baseUrl)
      .post('/auth/login')
      .send({
        email: 'invalid@example.com',
        password: 'wrongpassword',
      })
      .expect(401);
  });
});
```

### CRUD Operations Testing

```typescript
describe('CRUD Operations', () => {
  let createdResourceId: string;

  afterEach(async () => {
    // Clean up created resources
    if (createdResourceId) {
      await apiClient.delete(`/resources/${createdResourceId}`);
    }
  });

  test('should create, read, update, and delete resource', async () => {
    // Create
    const createData = { name: 'Test Resource' };
    const created = await apiClient.post('/resources', createData);
    createdResourceId = created.id;

    // Read
    const retrieved = await apiClient.get(`/resources/${created.id}`);
    expect(retrieved.name).toBe(createData.name);

    // Update
    const updateData = { name: 'Updated Resource' };
    const updated = await apiClient.patch(`/resources/${created.id}`, updateData);
    expect(updated.name).toBe(updateData.name);

    // Delete
    await apiClient.delete(`/resources/${created.id}`);
    createdResourceId = ''; // Prevent cleanup
  });
});
```

## Environment Variables

Required environment variables (set in root .env file):

- `API_BACKEND_URL` - Backend API URL
- `TEST_ADMIN_EMAIL` - Test admin user email
- `TEST_ADMIN_PASSWORD` - Test admin user password
- `NODE_ENV` - Set to 'test'

## Debugging

### Local Debugging

```bash
# Run tests with Node debugger
pnpm test:debug

# Run specific test with verbose output
pnpm test:e2e --verbose tests/specific.test.ts
```

### CI Debugging

- Check test output logs
- Review coverage reports
- Examine API response dumps in test failures
