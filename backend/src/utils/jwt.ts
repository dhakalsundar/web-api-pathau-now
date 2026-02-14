import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

const ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutes in seconds
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Generate access token (15 minutes expiry)
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET || 'your-secret-key', {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

/**
 * Generate refresh token (7 days expiry)
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET || 'your-secret-key', {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokens(payload: TokenPayload) {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresIn: ACCESS_TOKEN_EXPIRY,
    refreshTokenExpiresIn: REFRESH_TOKEN_EXPIRY,
  };
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET || 'your-secret-key') as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET || 'your-secret-key') as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Calculate refresh token expiry date
 */
export function getRefreshTokenExpiryDate(): Date {
  const expiryDate = new Date();
  expiryDate.setSeconds(expiryDate.getSeconds() + REFRESH_TOKEN_EXPIRY);
  return expiryDate;
}
