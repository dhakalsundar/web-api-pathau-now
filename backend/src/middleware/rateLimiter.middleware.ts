// @ts-ignore - express-rate-limit v7+ includes types, but TS may not find them locally
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Type safe rateLimit configuration
// express-rate-limit v7+ has built-in TypeScript support
const createRateLimiter = (config: any) => rateLimit(config);

/**
 * Rate Limiter Configuration for Auth Routes
 * Prevents brute force attacks on authentication endpoints
 */

/**
 * General auth limiter: 100 requests per 15 minutes
 */
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per window
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    error: {
      statusCode: 429,
      retryAfter: '15 minutes'
    }
  },
  statusCode: 429,
  standardHeaders: true,     // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,      // Disable `X-RateLimit-*` headers
  skip: (req: Request) => {
    // Skip rate limiting for health checks or internal requests
    return false;
  },
  keyGenerator: (req: Request) => {
    // Use IP address as the key for rate limiting
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  handler: (req: Request, res: Response): void => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts',
      error: {
        statusCode: 429,
        retryAfter: '15 minutes',
        remainingAttempts: 0
      }
    });
  }
});

/**
 * Strict limiter for login: 50 requests per 15 minutes
 * More restrictive than general auth since login is more sensitive
 */
export const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,                   // 50 attempts per window
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    // Rate limit by both IP and email to prevent targeting specific accounts
    const email = req.body?.email || '';
    return `${req.ip || req.connection.remoteAddress}:${email}`;
  },
  handler: (req: Request, res: Response): void => {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Account temporarily locked. Please try again in 15 minutes.',
      error: {
        statusCode: 429,
        retryAfter: '15 minutes'
      }
    });
  }
});

/**
 * Register limiter: 10 requests per 15 minutes
 * More restrictive to prevent account registration spam
 */
export const registerLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 registrations per window
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again later.',
  },
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    // Rate limit by IP to prevent spam registrations
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  handler: (req: Request, res: Response): void => {
    res.status(429).json({
      success: false,
      message: 'Too many registration attempts. Please try again in 15 minutes.',
      error: {
        statusCode: 429,
        retryAfter: '15 minutes'
      }
    });
  }
});

/**
 * Refresh token limiter: 30 requests per 15 minutes
 * Moderate limit for token refresh
 */
export const refreshLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,                   // 30 refresh attempts per window
  message: {
    success: false,
    message: 'Too many token refresh attempts. Please try again later.',
  },
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  handler: (req: Request, res: Response): void => {
    res.status(429).json({
      success: false,
      message: 'Too many token refresh attempts. Please wait before trying again.',
      error: {
        statusCode: 429,
        retryAfter: '15 minutes'
      }
    });
  }
});
