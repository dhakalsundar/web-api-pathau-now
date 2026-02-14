/**
 * DEPRECATED: This file is maintained for backwards compatibility only.
 * 
 * ⚠️  DO NOT USE THIS FILE IN NEW CODE
 * 
 * All new code should import directly from:
 *   import axiosInstance from '@/lib/api/axios';
 * 
 * This file now simply re-exports the centralized axios instance
 * from lib/api/axios.ts which has proper token refresh, interceptors,
 * and error handling configured.
 */

import axiosInstance from '@/lib/api/axios';

/**
 * Re-export the centralized axios instance for backwards compatibility
 */
const api = axiosInstance;

export default api;
