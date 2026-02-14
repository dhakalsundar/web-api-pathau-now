/**
 * Tracking Number Generator Utility
 * Generates unique tracking numbers in format: PTH-YYYYMMDD-XXXX
 */

/**
 * Generate a random 4-character alphanumeric string
 * @returns Random string in format XXXX
 */
function generateRandomSuffix(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a tracking number in format: PTH-YYYYMMDD-XXXX
 * @returns Tracking number string
 */
export function generateTrackingNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomSuffix = generateRandomSuffix();

  return `PTH-${year}${month}${day}-${randomSuffix}`;
}

/**
 * Validate tracking number format
 * @param trackingNumber Tracking number to validate
 * @returns true if valid format, false otherwise
 */
export function validateTrackingNumberFormat(trackingNumber: string): boolean {
  const pattern = /^PTH-\d{8}-[A-Z0-9]{4}$/;
  return pattern.test(trackingNumber);
}
