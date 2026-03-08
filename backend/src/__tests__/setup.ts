// Jest setup file
beforeAll(() => {
  // Set environment variables for testing
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.MONGO_URI = 'mongodb://localhost:27017/test';
});

afterAll(() => {
  jest.clearAllMocks();
});
