# Backend Testing Documentation

This document outlines the testing infrastructure for the pathau-now backend, including unit tests and integration tests using Jest and Supertest.

## Directory Structure

```
__tests__/
├── setup.ts                           # Jest setup file
├── unit/
│   └── user.service.test.ts           # 30 unit tests for UserService
└── integration/
    └── auth.e2e.test.ts               # 30 integration tests for Auth API
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This installs all required testing dependencies:
- **jest** - Testing framework
- **ts-jest** - TypeScript support for Jest
- **supertest** - HTTP assertion library for integration tests
- **@types/jest** - TypeScript types for Jest
- **@types/supertest** - TypeScript types for Supertest

### 2. Jest Configuration

The `jest.config.ts` file is configured with:
- **Preset**: `ts-jest` for TypeScript support
- **Environment**: Node.js runtime
- **Test Paths**: All files matching `**/__tests__/**/*.test.ts`
- **Coverage**: Excludes d.ts files and config files

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage Report
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npx jest __tests__/unit/user.service.test.ts
npx jest __tests__/integration/auth.e2e.test.ts
```

### Run Tests Matching Pattern
```bash
npx jest --testNamePattern="register"
npx jest --testNamePattern="login"
```

## Test Files Overview

### Unit Tests: `user.service.test.ts` (30 Tests)

Tests for `UserService` class with comprehensive mocking of repositories and external dependencies.

**Test Categories:**

1. **Register Tests (1-10)**
   - Successful registration
   - Email validation and duplicates
   - Password hashing
   - Password exclusion from response
   - Default role assignment
   - Error handling

2. **Login Tests (11-20)**
   - Successful login
   - Invalid credentials
   - Inactive account handling
   - JWT token generation
   - Password comparison
   - Response formatting

3. **Get User Tests (21-25)**
   - Retrieve user by ID
   - User not found error
   - Password field exclusion

4. **Update Tests (26-30)**
   - User update
   - Password hashing on update
   - Error handling

5. **Additional Tests**
   - Get all users with pagination
   - Search functionality

**Key Features:**
- All external dependencies mocked using Jest
- No database required
- Fast execution (~2-3 seconds)
- Clear test naming and organization

**Running Unit Tests:**
```bash
npx jest __tests__/unit/user.service.test.ts
```

### Integration Tests: `auth.e2e.test.ts` (30 Tests)

End-to-end tests for Auth API endpoints using Supertest.

**Test Categories:**

1. **Register Endpoint (1-12)**
   - Successful registration
   - Input validation
   - Email duplicate checking
   - Default role assignment
   - Field mapping
   - Password exposure prevention

2. **Login Endpoint (13-24)**
   - Successful login
   - Invalid credentials
   - Inactive accounts
   - Required fields validation
   - JWT token in response
   - User object in response

3. **Request/Response Tests (25-30)**
   - Content-Type headers
   - JSON parsing
   - Error messages
   - Success status codes

**Key Features:**
- Tests actual HTTP endpoints
- Verifies request/response formats
- Tests error scenarios
- Content negotiation testing

**Running Integration Tests:**
```bash
npx jest __tests__/integration/auth.e2e.test.ts
```

## Test Patterns and Best Practices

### Mocking External Dependencies

```typescript
jest.mock('../src/repositories/user.repository');
const mockUserRepository = UserRepository as jest.Mocked<typeof UserRepository>;
```

### Testing Error Scenarios

```typescript
test('Should throw error for duplicate email', async () => {
  (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
  
  await expect(userService.register(data)).rejects.toThrow(
    new HttpError(400, 'Email already in use')
  );
});
```

### Testing HTTP Responses

```typescript
const response = await request(app)
  .post('/auth/register')
  .send(validPayload);

expect(response.status).toBe(201);
expect(response.body).toHaveProperty('data');
expect(response.body.data.password).toBeUndefined();
```

## Coverage Report

After running tests with coverage:

```bash
npm run test:coverage
```

A coverage report will be generated in the `coverage/` directory. Open `coverage/index.html` in a browser to view detailed coverage metrics.

**Target Coverage:**
- Statements: >80%
- Branches: >75%
- Functions: >80%
- Lines: >80%

## Debugging Tests

### Run Single Test
```bash
npx jest --testNamePattern="Should register user successfully"
```

### Run with Verbose Output
```bash
npx jest --verbose
```

### Debug in VS Code

Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-notify"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Continuous Integration

For CI/CD pipelines, use:

```bash
npm test -- --ci --coverage --maxWorkers=2
```

## Adding New Tests

### Unit Test Template

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Should do something', async () => {
    // Arrange
    const input = { /* test data */ };
    mock.mockResolvedValue(expectedResult);

    // Act
    const result = await service.method(input);

    // Assert
    expect(result).toEqual(expectedResult);
  });
});
```

### Integration Test Template

```typescript
test('Should handle request correctly', async () => {
  const response = await request(app)
    .post('/endpoint')
    .send(payload);

  expect(response.status).toBe(expectedStatus);
  expect(response.body).toHaveProperty('data');
});
```

## Common Issues

### Import Errors
Ensure `tsconfig.json` includes `"moduleResolution": "node"` and proper path mappings.

### Module Not Found
Clear Jest cache:
```bash
npx jest --clearCache
```

### Timeout Errors
Increase timeout in jest.config.ts:
```typescript
testTimeout: 10000, // milliseconds
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://jestjs.io/docs/getting-started)

## Test Maintenance

- Keep tests synchronized with source code changes
- Update mocks when service signatures change
- Regularly review and refactor test suites
- Maintain >80% code coverage
- Run tests before committing code

---

**Last Updated**: March 6, 2026
**Total Tests**: 60 (30 Unit + 30 Integration)
**Estimated Run Time**: ~10 seconds
