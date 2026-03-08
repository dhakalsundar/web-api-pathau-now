/**
 * Logger Usage Examples
 * 
 * This file demonstrates how to use the Winston logger throughout the application.
 * Replace all console.log/console.error statements with appropriate logger calls.
 */

import { logger } from './logger';


class UserService {
  async createUser(email: string, password: string) {
    logger.info(`Creating user with email: ${email}`);
    
    try {
      // Validate input
      if (!email || !password) {
        logger.warn('User creation attempt with missing fields');
        throw new Error('Email and password required');
      }

      // Check if user exists
      logger.debug(`Checking if user ${email} already exists`);
      // ... database operation

      logger.info(`User ${email} created successfully`);
      return { id: '123', email };
    } catch (error) {
      logger.error(`Failed to create user ${email}: ${error}`);
      throw error;
    }
  }

  async updateUserProfile(userId: string, updateData: any) {
    logger.info(`Updating profile for user: ${userId}`);
    
    try {
      // ... update logic
      logger.info(`Profile updated successfully for user: ${userId}`);
    } catch (error) {
      logger.error(`Failed to update profile for user ${userId}: ${error}`);
      throw error;
    }
  }
}


class AuthController {
  async login(email: string, password: string) {
    logger.info(`Login attempt from: ${email}`);
    
    try {
      // Authenticate user
      logger.debug(`Validating credentials for ${email}`);
      // ... auth logic

      logger.info(` Login successful for user: ${email}`);
      return { token: 'jwt-token', user: { id: '123', email } };
    } catch (error) {
      logger.error(` Login failed for user ${email}: ${error}`);
      throw error;
    }
  }

  async registerUser(userData: any) {
    logger.info(`New registration attempt: ${userData.email}`);
    
    try {
      // Verify email not in use
      logger.debug(`Checking email availability: ${userData.email}`);
      
      // Create user
      logger.info(` User ${userData.email} registered successfully`);
    } catch (error) {
      logger.error(` Registration failed: ${error}`, { email: userData.email });
    }
  }
}


class UserRepository {
  async findById(userId: string) {
    logger.debug(`Fetching user: ${userId}`);
    
    try {
      // Database query
      logger.debug(`User ${userId} retrieved from database`);
      return { id: userId, email: 'user@example.com' };
    } catch (error) {
      logger.error(`Database error while fetching user ${userId}:`, error);
      throw error;
    }
  }
}


const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization;
  
  if (!token) {
    logger.warn(`Unauthorized access attempt to protected route: ${req.path}`);
    return res.status(401).json({ error: 'No token' });
  }

  logger.debug(`Token verified for access to: ${req.path}`);
  next();
};


class ShipmentService {
  async assignShipment(shipmentId: string, riderId: string) {
    logger.info(`Assigning shipment ${shipmentId} to rider ${riderId}`);
    
    try {
      // Validate shipment exists
      logger.debug(`Validating shipment: ${shipmentId}`);
      
      // Validate rider exists
      logger.debug(`Validating rider: ${riderId}`);
      
      // Check rider is active
      logger.debug(`Checking rider ${riderId} status`);
      
      // Perform assignment
      logger.info(` Shipment ${shipmentId} assigned to rider ${riderId}`);
      
      return { success: true };
    } catch (error) {
      logger.error(`Failed to assign shipment`, {
        shipmentId,
        riderId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}


class DatabaseConnection {
  async connect() {
    logger.info('Attempting database connection...');
    
    try {
      // Connection logic
      logger.info(' Database connection established');
    } catch (error) {
      logger.error(' Failed to connect to database:', error);
      
      // Fallback to in-memory DB
      logger.warn('Attempting in-memory database fallback...');
      logger.info(' Connected to in-memory database');
    }
  }
}


const measurePerformance = async (operationName: string, fn: () => Promise<any>) => {
  const startTime = Date.now();
  logger.debug(`Starting operation: ${operationName}`);
  
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    
    logger.info(` ${operationName} completed in ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(` ${operationName} failed after ${duration}ms: ${error}`);
    throw error;
  }
};


class TransactionService {
  async processPayment(orderId: string, amount: number, userId: string) {
    const context = { orderId, amount, userId };
    
    logger.info('Processing payment', context);
    
    try {
      // Validate payment
      logger.debug('Validating payment fields', context);
      
      // Charge customer
      logger.info('Charging customer', context);
      
      // Confirm transaction
      logger.info(' Payment processed successfully', {
        ...context,
        transactionId: 'TXN-123-456',
      });
    } catch (error) {
      logger.error('Payment processing failed', {
        ...context,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}


const levelExamples = {
  // Use ERROR for exceptional conditions that need immediate attention
  error: () => logger.error('Payment failed: Card declined'),
  
  // Use WARN for unexpected but recoverable situations
  warn: () => logger.warn('Retry attempt 2 of 3 for API call'),
  
  // Use INFO for key business events
  info: () => logger.info('User registration completed'),
  
  // Use DEBUG for detailed troubleshooting information
  debug: () => logger.debug('SQL Query: SELECT * FROM users WHERE id = ?'),
};


export { UserService, AuthController, measurePerformance };
