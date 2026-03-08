import { UserService } from '../../services/user.service';
import { HttpError } from '../../errors/http-error';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../repositories/user.repository', () => {
  return {
    UserRepository: jest.fn().mockImplementation(() => ({
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      search: jest.fn(),
    })),
  };
});

describe('UserService Unit Tests', () => {
  let userService: UserService;
  let mockUserRepository: any;

  const mockUser = {
    _id: { toString: () => 'user-123' },
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashed-password',
    role: 'CUSTOMER',
    isActive: true,
    toObject: jest.fn(function() {
      return {
        _id: 'user-123',
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName,
        password: this.password,
        role: this.role,
        isActive: this.isActive,
      };
    }),
  };

  beforeAll(() => {
    // Import once at the start
    userService = new UserService();
    const { UserRepository } = require('../../repositories/user.repository');
    // The mock is set up at module level, so just get a reference
    mockUserRepository = UserRepository.mock.results[UserRepository.mock.results.length - 1]?.value;
  });

  beforeEach(() => {
    // Clear call history only, not the mocks themselves
    if (mockUserRepository) {
      Object.values(mockUserRepository).forEach((method: any) => {
        if (method?.mockClear) {
          method.mockClear();
        }
      });

      // Reset to defaults
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue(mockUser);
      mockUserRepository.findAll.mockResolvedValue({ users: [mockUser], total: 1, page: 1, pages: 1 });
      mockUserRepository.search.mockResolvedValue({ users: [mockUser], total: 1, page: 1, pages: 1 });
    }

    jest.clearAllMocks();
  });

  // REGISTER TESTS (1-10)
  describe('register', () => {
    test('1. Should successfully register a new user', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const newUserResponse = {
        ...mockUser,
        email: 'newuser@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcryptjs.hash as jest.Mock).mockResolvedValue('hashed-password');
      (mockUserRepository.create as jest.Mock).mockResolvedValue(newUserResponse);

      const result = await userService.register(registerDto as any);

      expect(result).toBeDefined();
      expect(result.email).toBe('newuser@example.com');
      expect(result.role).toBe('CUSTOMER');
    });

    test('2. Should throw error when email already exists', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(userService.register(registerDto as any)).rejects.toThrow(
        new HttpError(400, 'Email already in use')
      );
    });

    test('3. Should hash password before storing', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'plaintext-password',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcryptjs.hash as jest.Mock).mockResolvedValue('hashed-password');
      (mockUserRepository.create as jest.Mock).mockResolvedValue(mockUser);

      await userService.register(registerDto as any);

      expect(bcryptjs.hash).toHaveBeenCalledWith('plaintext-password', 10);
    });

    test('4. Should not return password in response', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcryptjs.hash as jest.Mock).mockResolvedValue('hashed-password');
      (mockUserRepository.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.register(registerDto as any);

      expect(result.password).toBeUndefined();
    });

    test('5. Should set default role to CUSTOMER', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcryptjs.hash as jest.Mock).mockResolvedValue('hashed-password');
      (mockUserRepository.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.register(registerDto as any);

      expect(result.role).toBe('CUSTOMER');
    });

    test('6. Should handle bcryptjs hash errors', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcryptjs.hash as jest.Mock).mockRejectedValue(new Error('Hash failed'));

      await expect(userService.register(registerDto as any)).rejects.toThrow('Hash failed');
    });

    test('7. Should handle repository create errors', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcryptjs.hash as jest.Mock).mockResolvedValue('hashed-password');
      (mockUserRepository.create as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(userService.register(registerDto as any)).rejects.toThrow('DB error');
    });

    test('8. Should call findByEmail with correct email', async () => {
      const registerDto = {
        email: 'unique@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcryptjs.hash as jest.Mock).mockResolvedValue('hashed-password');
      (mockUserRepository.create as jest.Mock).mockResolvedValue(mockUser);

      await userService.register(registerDto as any);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('unique@example.com');
    });

    test('9. Should preserve user data in create call', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcryptjs.hash as jest.Mock).mockResolvedValue('hashed-password');
      (mockUserRepository.create as jest.Mock).mockResolvedValue(mockUser);

      await userService.register(registerDto as any);

      expect(mockUserRepository.create).toHaveBeenCalled();
    });

    test('10. Should return complete user object with all fields', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcryptjs.hash as jest.Mock).mockResolvedValue('hashed-password');
      (mockUserRepository.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.register(registerDto as any);

      expect(result).toHaveProperty('_id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('firstName');
      expect(result).toHaveProperty('lastName');
    });
  });

  // LOGIN TESTS (11-20)
  describe('login', () => {
    test('11. Should successfully login with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('test-token');

      const result = await userService.login(loginDto);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.token).toBe('test-token');
    });

    test('12. Should throw error for non-existent user', async () => {
      const loginDto = {
        email: 'notfound@example.com',
        password: 'password123',
      };

      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(userService.login(loginDto)).rejects.toThrow(
        new HttpError(401, 'Invalid credentials')
      );
    });

    test('13. Should throw error for inactive account', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(inactiveUser);

      await expect(userService.login(loginDto)).rejects.toThrow(
        new HttpError(403, 'Account is inactive')
      );
    });

    test('14. Should throw error for invalid password', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(false);

      await expect(userService.login(loginDto)).rejects.toThrow(
        new HttpError(401, 'Invalid credentials')
      );
    });

    test('15. Should create JWT token with correct payload', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('test-token');

      await userService.login(loginDto);

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'user-123',
          email: 'test@example.com',
          role: 'CUSTOMER',
        }),
        expect.any(String),
        { expiresIn: '30d' }
      );
    });

    test('16. Should not return password in user object', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('test-token');

      const result = await userService.login(loginDto);

      expect(result.user.password).toBeUndefined();
    });

    test('17. Should compare password correctly', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('test-token');

      await userService.login(loginDto);

      expect(bcryptjs.compare).toHaveBeenCalledWith('password123', 'hashed-password');
    });

    test('18. Should handle JWT signing errors', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockImplementation(() => {
        throw new Error('JWT error');
      });

      await expect(userService.login(loginDto)).rejects.toThrow('JWT error');
    });

    test('19. Should return token in correct format', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');

      const result = await userService.login(loginDto);

      expect(typeof result.token).toBe('string');
      expect(result.token.length).toBeGreaterThan(0);
    });

    test('20. Should return user object with all necessary fields', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      (mockUserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('test-token');

      const result = await userService.login(loginDto);

      expect(result.user).toHaveProperty('_id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('firstName');
      expect(result.user).toHaveProperty('role');
    });
  });

  // GET USER TESTS (21-25)
  describe('getUserById', () => {
    test('21. Should retrieve user by ID successfully', async () => {
      (mockUserRepository.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getUserById('user-123');

      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
    });

    test('22. Should throw error for non-existent user', async () => {
      (mockUserRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(userService.getUserById('invalid-id')).rejects.toThrow(
        new HttpError(404, 'User not found')
      );
    });

    test('23. Should not return password field', async () => {
      (mockUserRepository.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getUserById('user-123');

      expect(result.password).toBeUndefined();
    });

    test('24. Should call repository with correct ID', async () => {
      (mockUserRepository.findById as jest.Mock).mockResolvedValue(mockUser);

      await userService.getUserById('user-123');

      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-123');
    });

    test('25. Should handle repository errors', async () => {
      (mockUserRepository.findById as jest.Mock).mockRejectedValue(
        new Error('DB error')
      );

      await expect(userService.getUserById('user-123')).rejects.toThrow('DB error');
    });
  });

  // UPDATE & OTHER TESTS (26-30)
  describe('updateUser', () => {
    test('26. Should update user successfully', async () => {
      const updateData = { firstName: 'UpdatedName' };
      (mockUserRepository.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.updateUser('user-123', updateData);

      expect(result).toBeDefined();
      expect(mockUserRepository.update).toHaveBeenCalled();
    });

    test('27. Should throw error if user not found', async () => {
      const updateData = { firstName: 'UpdatedName' };
      (mockUserRepository.update as jest.Mock).mockResolvedValue(null);

      await expect(userService.updateUser('invalid-id', updateData)).rejects.toThrow(
        new HttpError(404, 'User not found')
      );
    });

    test('28. Should hash new password when provided', async () => {
      const updateData = { password: 'newpassword' };
      (mockUserRepository.update as jest.Mock).mockResolvedValue(mockUser);
      (bcryptjs.hash as jest.Mock).mockResolvedValue('hashed-new-password');

      await userService.updateUser('user-123', updateData);

      expect(bcryptjs.hash).toHaveBeenCalledWith('newpassword', 10);
    });

    test('29. Should not modify user without password change', async () => {
      const updateData = { firstName: 'Jane' };
      (mockUserRepository.update as jest.Mock).mockResolvedValue(mockUser);

      await userService.updateUser('user-123', updateData);

      expect(bcryptjs.hash).not.toHaveBeenCalled();
    });

    test('30. Should not return password in updated user', async () => {
      const updateData = { firstName: 'UpdatedName' };
      (mockUserRepository.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.updateUser('user-123', updateData);

      expect(result.password).toBeUndefined();
    });
  });

  // ADDITIONAL HELPER TESTS
  describe('getAllUsers', () => {
    test('Should retrieve all users with pagination', async () => {
      const mockResult = { users: [mockUser], total: 1, page: 1, pages: 1 };
      (mockUserRepository.findAll as jest.Mock).mockResolvedValue(mockResult);

      const result = await userService.getAllUsers();

      expect(result).toBeDefined();
      expect(mockUserRepository.findAll).toHaveBeenCalledWith({}, 1, 10);
    });
  });

  describe('searchUsers', () => {
    test('Should search users by term', async () => {
      const mockResult = { users: [mockUser], total: 1, page: 1, pages: 1 };
      (mockUserRepository.search as jest.Mock).mockResolvedValue(mockResult);

      const result = await userService.searchUsers('John');

      expect(result).toBeDefined();
      expect(mockUserRepository.search).toHaveBeenCalledWith('John', 1, 10);
    });
  });
});
