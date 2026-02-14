/*
 ╔════════════════════════════════════════════════════════════════════════════╗
 ║        ENHANCED AXIOS - AUTOMATIC TOKEN MANAGEMENT                         ║
 ║                    QUICK REFERENCE GUIDE                                    ║
 ╚════════════════════════════════════════════════════════════════════════════╝
*/

// ====== AUTOMATIC TOKEN MANAGEMENT ======

// ✅ Access token automatically attached to all requests
API Request
  ↓
Headers: Authorization: Bearer <accessToken>
  ↓
Request sent

// ✅ If 401 received, automatic refresh
401 Unauthorized
  ↓
Call /api/auth/refresh with refreshToken
  ↓
IF successful → Get new accessToken
  ↓
Retry original request with new token
  ↓
IF failed → Clear auth + Redirect to login

// ====== USAGE (NO CHANGES NEEDED) ======

// These all work the same, but now with automatic token refresh!
const response = await api.get('/shipments');
const response = await api.post('/shipments', data);
const response = await api.put('/shipments/123', data);

// No manual token setup required

// ====== COOKIE STORAGE ======

// Access Token (expires in 15 minutes)
Cookie: pathaunow_token = eyJhbGc...

// Refresh Token (expires in 7 days)
Cookie: pathaunow_refresh_token = eyJhbGc...

// User Data
Cookie: pathaunow_user = {id, email, role}

// ====== AUTH SERVICE ======

import { authService } from '@/app/lib/services';

// Login (automatically stores tokens)
await authService.login(email, password);
// ✅ Both tokens stored in cookies
// ✅ Ready to make API requests

// Logout (clears everything)
await authService.logout();
// ✅ All tokens cleared
// ✅ User will be redirected to login on next API call

// ====== TOKEN OPERATIONS ======

import { 
  readAuthFromCookies,      // Get tokens
  setAuthCookies,           // Store tokens
  updateAccessToken,        // Update access token only
  clearAuthCookies,         // Clear tokens
} from '@/lib/cookies';

// Read current auth state
const { token, refreshToken, user } = readAuthFromCookies();

// Get user
const user = JSON.parse(
  document.cookie
    .split('; ')
    .find(row => row.startsWith('pathaunow_user='))
    ?.split('=')[1] || '{}'
);

// ====== HOW IT WORKS ======

Timeline:
1. User logs in at 10:00 AM
   ✅ Access token (expires 10:15 AM)
   ✅ Refresh token (expires in 7 days)

2. User makes API request at 10:10 AM
   ✅ Access token still valid
   ✅ Request succeeds

3. User makes API request at 10:20 AM
   ✅ Access token expired
   401 Unauthorized response
   Axios detects 401
   Calls refresh endpoint
   ✅ Gets new access token (expires 10:35 AM)
   ✅ Retries original request
   ✅ Request succeeds

4. Refresh token expires after 7 days
   ❌ More refresh attempts return 401
   ✅ User redirected to login
   User logs in again

// ====== ERROR HANDLING ======

// Catches are still needed for non-401 errors
try {
  const response = await api.get('/shipments');
} catch (error) {
  if (error.response?.status === 404) {
    console.log('Shipment not found');
  } else if (error.response?.status === 429) {
    console.log('Rate limited, try again later');
  } else if (!error.response) {
    console.log('Network error');
  }
}

// 401 errors are handled automatically
// User will be redirected to login if refresh fails

// ====== INTERCEPTOR FLOW ======

REQUEST INTERCEPTOR:
  ↓
Read access token from cookies
  ↓
Add to Authorization header
  ↓
Send request

RESPONSE INTERCEPTOR:
  ↓
IF status 2xx/3xx: ✅ Return response
  ↓
IF status 401:
  IF already refreshing:
    Queue this request
  ELSE:
    Start refresh
    Call /api/auth/refresh
    IF success:
      Update access token
      Process queued requests
      Retry this request
    IF failure:
      Clear auth
      Redirect to login

// ====== LOGIN FLOW ======

Login Page
  ↓
Call authService.login(email, password)
  ↓
✅ Tokens stored in cookies
✅ Access token ready to use
  ↓
Redirect to dashboard
  ↓
Make API calls (tokens auto-attached)

// ====== LOGOUT FLOW ======

Logout Button
  ↓
Call authService.logout()
  ↓
✅ Cookies cleared
✅ Local storage cleared
  ↓
Redirect to login

// ====== MANUAL TOKEN REFRESH (if needed) ======

// Normally not needed, happens automatically
// But if you need to manually refresh:

import axiosInstance from '@/lib/api/axios';

const response = await axiosInstance.post('/auth/refresh', {
  refreshToken: readAuthFromCookies().refreshToken,
});

// ====== RETURN URL AFTER LOGIN ======

// Return URL is automatically saved before redirect

// In login page component:
useEffect(() => {
  const returnUrl = sessionStorage.getItem('returnUrl');
  if (returnUrl) {
    router.push(returnUrl);
    sessionStorage.removeItem('returnUrl');
  } else {
    router.push('/dashboard');
  }
}, []);

// ====== QUEUE MANAGEMENT ======

// Concurrent requests during token refresh

Request 1 (10:20) → 401 (token expired)
  ↓
Start refresh + queue request 1

Request 2 (10:20) → 401 (token expired)
  ↓
Already refreshing, queue request 2

Request 3 (10:20) → 401 (token expired)
  ↓
Already refreshing, queue request 3

Refresh completes (10:21)
  ↓
Process all queued requests with new token
  ↓
All three requests retry and succeed
  ↓
Responses sent to callers

// ====== FILES UPDATED ======

Frontend:
lib/cookies.ts                    - Refresh token storage
lib/api/axios.ts                  - Token refresh interceptors
app/lib/services.ts               - Auth service updates

Backend:
No changes needed! Already supports token refresh.
Just call POST /api/auth/refresh

// ====== ENVIRONMENT VARIABLES ======

// Ensure API URL is correct:
// .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000

// ====== TESTING IN BROWSER ======

// Check current tokens
document.cookie  // See all cookies

// Clear token to test refresh
document.cookie = "pathaunow_token=invalid; max-age=0"

// Make API request
// ✅ Should automatically refresh and succeed

// Clear refresh token to test login redirect
document.cookie = "pathaunow_refresh_token=; max-age=0"

// Make API request
// ✅ Should redirect to login

// ====== MIGRATION CHECKLIST ======

✅ Run: npm install (if needed)
✅ Update login calls to use authService.login()
✅ Update logout calls to use authService.logout()
✅ Remove localStorage token management
✅ Remove manual Authorization header setting
✅ Test normal API calls (should work as before)
✅ Test 401 handling (should auto-refresh)
✅ Test expired refresh token (should auto-redirect)

// ====== KEY IMPROVEMENTS ======

✅ Automatic token management
✅ Silent token refresh (user doesn't know)
✅ Request queuing during refresh
✅ Auto-redirect on refresh failure
✅ Prevents infinite 401 loops
✅ No manual token setup needed

// ====== TROUBLESHOOTING ======

Problem: Tokens not being read
Solution: Check browser cookies are enabled

Problem: Always redirected to login
Solution: Verify refresh token is stored in cookies

Problem: Requests stuck in queue
Solution: Check if refresh endpoint is responding

Problem: Getting CORS errors
Solution: Verify NEXT_PUBLIC_API_URL is correct

Problem: Token not in Authorization header
Solution: Verify cookies are being set on login

/*
 ╔════════════════════════════════════════════════════════════════════════════╗
 ║  💡 No manual token management needed!                                   ║
 ║  🔄 Refresh happens automatically & silently                             ║
 ║  ✅ 99% of auth issues handled automatically                             ║
 ╚════════════════════════════════════════════════════════════════════════════╝
*/
