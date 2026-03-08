import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

const TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Generate single access token (7 days expiry)
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET || 'your-secret-key', {
    expiresIn: TOKEN_EXPIRY,
  });
}

/**
 * Generate token (wrapper for consistency)
 */
export function generateTokens(payload: TokenPayload) {
  const accessToken = generateAccessToken(payload);

  return {
    accessToken,
    accessTokenExpiresIn: TOKEN_EXPIRY,
  };
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  if (!JWT_SECRET) {
    console.error(' [JWT] JWT_SECRET not configured in environment variables');
    return null;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    console.log(` [JWT] Token verified for user: ${decoded.email} (role: ${decoded.role})`);
    return decoded;
  } catch (error) {
    console.error(` [JWT] Token verification failed:`, error instanceof Error ? error.message : error);
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  if (!JWT_SECRET) {
    console.error(' [JWT] JWT_SECRET not configured in environment variables');
    return null;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error(` [JWT] Refresh token verification failed:`, error instanceof Error ? error.message : error);
    return null;
  }
}
