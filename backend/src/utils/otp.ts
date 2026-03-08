import { hash, compare } from 'bcryptjs';
import { OTP_LENGTH } from '../config/index';

/**
 * Generate a random OTP
 * @returns 6-digit OTP as string
 */
export const generateOtp = (): string => {
  const otp = Math.floor(Math.random() * Math.pow(10, OTP_LENGTH))
    .toString()
    .padStart(OTP_LENGTH, '0');
  return otp;
};

/**
 * Hash OTP using bcrypt
 * @param otp - Plain text OTP
 * @returns Hashed OTP
 */
export const hashOtp = async (otp: string): Promise<string> => {
  try {
    const hashedOtp = await hash(otp, 10);
    return hashedOtp;
  } catch (error) {
    console.error(' [OTP] Failed to hash OTP:', error);
    throw new Error('Failed to hash OTP');
  }
};

/**
 * Verify OTP
 * @param plainOtp - Plain text OTP entered by user
 * @param hashedOtp - Hashed OTP from database
 * @returns true if OTP matches, false otherwise
 */
export const verifyOtp = async (plainOtp: string, hashedOtp: string): Promise<boolean> => {
  try {
    const isMatch = await compare(plainOtp, hashedOtp);
    return isMatch;
  } catch (error) {
    console.error(' [OTP] Failed to verify OTP:', error);
    return false;
  }
};

/**
 * Check if OTP is expired
 * @param expiresAt - Expiration timestamp
 * @returns true if expired, false otherwise
 */
export const isOtpExpired = (expiresAt: Date): boolean => {
  return new Date() > expiresAt;
};
