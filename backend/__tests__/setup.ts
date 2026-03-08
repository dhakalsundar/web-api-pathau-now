// Jest Setup File
// This file is loaded before the test suite runs

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-123';
process.env.MONGO_URI = 'mongodb://localhost:27017/pathau-now-test';

// Extend test timeout for integration tests
jest.setTimeout(10000);

// Suppress console errors during tests (optional)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Close any open handles after tests complete
afterAll(async () => {
  // Add any cleanup logic here if needed
  await new Promise(resolve => setTimeout(resolve, 500));
});
