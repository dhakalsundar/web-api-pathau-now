# Enhanced Axios Instance with Automatic Token Management

## Overview

The axios instance has been enhanced with automatic JWT token management, including:

✅ Automatic access token attachment to all requests
✅ 401 error handling with automatic token refresh
✅ Automatic retry of failed requests with new token  
✅ Queue management for concurrent requests during refresh
✅ Automatic redirect to login on refresh failure
✅ No manual token management required

## Features

### 1. Automatic Access Token Attachment

Every request automatically includes the access token:

```typescript
// Request Header
Authorization: Bearer <accessToken>

// Automatic, no manual setup needed
const response = await axiosInstance.get('/api/shipments');
```

### 2. 401 Error Handling with Token Refresh

When a request returns 401:

```
Request → 401 Unauthorized
    ↓
Check if refreshing already in progress
    ↓
IF NOT REFRESHING:
  Call /api/auth/refresh with refreshToken
    ↓
  IF successful:
    Store new accessToken
    Retry original request
    ↓
  IF failed:
    Clear auth
    Redirect to login
    ↓
IF ALREADY REFRESHING:
  Queue request
  Wait for refresh to complete
  Retry with new token
```

### 3. Queue Management

Multiple requests can be made before token refresh completes. All queued requests are:
- Held while token refresh is in progress
- Retried with new token after refresh
- Failed only if refresh itself fails

### 4. Automatic Login Redirect

If token refresh fails:
- All cookies are cleared
- User is redirected to login
- Return URL is saved for redirect after re-login

## File Structure

### Updated Files

| File | Changes |
|------|---------|
| `lib/cookies.ts` | Added refresh token storage and update methods |
| `lib/api/axios.ts` | Complete rewrite with interceptors |
| `app/lib/services.ts` | Updated to store both access and refresh tokens |

## Usage

### No Changes Required

The enhancement works transparently. Existing code continues to work:

```typescript
// Previously
const response = await api.get('/shipments');

// Still works, but now with automatic token refresh!
const response = await api.get('/shipments');
```

### Authentication Flow

1. **User logs in:**
   ```typescript
   await authService.login(email, password);
   // ✅ Both tokens automatically stored in cookies
   ```

2. **API requests use access token:**
   ```typescript
   const response = await api.get('/shipments');
   // ✅ Authorization header automatically added
   ```

3. **Access token expires (after 15 minutes):**
   ```
   API returns 401
   Axios interceptor detects 401
   Calls /api/auth/refresh with refresh token
   ✅ Gets new access token
   ✅ Retries request automatically
   ```

4. **Refresh token expires (after 7 days):**
   ```
   Refresh fails
   User redirected to login
   ✅ Return URL saved for redirect after login
   ```

## Token Management

### Stored in Cookies

```typescript
// Access Token (15 min expiry)
Cookie: pathaunow_token = eyJhbGc...
Expires: 1 day in cookie (actual token expires in 15 min)

// Refresh Token (7 day expiry)
Cookie: pathaunow_refresh_token = eyJhbGc...
Expires: 7 days

// User Info
Cookie: pathaunow_user = {id, email, role}
Expires: 7 days
```

### Cookie Operations

```typescript
import { 
  readAuthFromCookies,      // Get all auth data
  setAuthCookies,           // Store tokens after login
  updateAccessToken,        // Update access token only
  clearAuthCookies,         // Clear on logout/failure
} from '@/lib/cookies';

// Get current tokens
const { token, refreshToken, user } = readAuthFromCookies();

// Update only access token (done automatically after refresh)
updateAccessToken(newAccessToken);

// Clear all auth (done automatically on failure)
clearAuthCookies();
```

## Response Structure

### Login Response (with new tokens)

```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "user": {
      "id": "123",
      "email": "user@example.com",
      "role": "CUSTOMER"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "accessTokenExpiresIn": 900,
      "refreshTokenExpiresIn": 604800
    }
  }
}
```

### Refresh Response

```json
{
  "success": true,
  "message": "Tokens refreshed successfully",
  "data": {
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "accessTokenExpiresIn": 900,
      "refreshTokenExpiresIn": 604800
    }
  }
}
```

## Error Handling

### 401 Unauthorized - Token Expired

```typescript
try {
  const response = await api.get('/protected-endpoint');
  // Automatic refresh happens here if needed
} catch (error) {
  if (error.response?.status === 401) {
    // User will be redirected to login automatically
  }
}
```

### Rate Limit Exceeded - 429

```typescript
try {
  const response = await api.post('/auth/login', credentials);
} catch (error) {
  if (error.response?.status === 429) {
    console.log('Too many login attempts');
    // User is rate limited, must wait
  }
}
```

### Network Error - No Refresh Possible

```typescript
try {
  const response = await api.get('/shipments');
} catch (error) {
  if (!error.response) {
    console.log('Network error - check internet connection');
  }
}
```

## Request/Response Interceptors

### Request Interceptor

1. Reads access token from cookies
2. Attaches to `Authorization: Bearer <token>` header
3. Passes request through

### Response Interceptor

1. If response is successful → pass through
2. If response is 401:
   - If refresh already in progress → queue request
   - If not in progress → start refresh
   - Use refresh token to get new access token
   - Update cookies with new token
   - Retry original request
   - If refresh fails → clear auth and redirect to login

## Retry Logic

### Single Retry Only

Each request is retried only once to prevent infinite loops:

```typescript
if (!originalRequest._retry) {
  originalRequest._retry = true;
  // Attempt refresh and retry
} else {
  // Already retried once, fail
  clearAuthCookies();
  redirectToLogin();
}
```

### Queue Management

Multiple concurrent requests during refresh:

```
Request 1 → 401 → Start Refresh
Request 2 → 401 → Queue (refreshing already)
Request 3 → 401 → Queue (refreshing already)

Refresh completes with new token
    ↓
Process queues
    ↓
Retry all with new token
    ↓
Responses returned to callers
```

## Return URL After Login

After logout and redirect to login, users can be redirected to where they came from:

```typescript
// Automatically saved in sessionStorage on redirect
const returnUrl = sessionStorage.getItem('returnUrl');

// Use after successful login
if (returnUrl) {
  router.push(returnUrl);
  sessionStorage.removeItem('returnUrl');
}
```

## Environment Variables

Ensure `NEXT_PUBLIC_API_URL` is set correctly:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000

# Production
NEXT_PUBLIC_API_URL=https://api.production.com
```

## Testing

### Test Token Refresh

1. Login
2. Wait for access token to expire (15 minutes)
3. Make API request
4. Should be redirected or request succeeds after refresh

### Test Manual Token Expiry

```typescript
// In browser console
document.cookie = "pathaunow_token=invalid; max-age=0";
// Try making a request
api.get('/shipments');
// Should redirect to login
```

### Test Rate Limiting

```bash
# Make multiple requests quickly
for i in {1..60}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done
```

## Best Practices

✅ Do:
- Let axios handle token management automatically
- Check for 401/429 in specific error handlers
- Use `authService.logout()` for proper cleanup
- Save return URL for better UX

❌ Don't:
- Manually set Authorization headers
- Try to refresh tokens manually
- Store tokens in localStorage
- Ignore 401 responses

## Migration from Old Implementation

### Old Way
```typescript
// Manual token management
const token = localStorage.getItem('token');
if (!token) redirectToLogin();

api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

### New Way
```typescript
// Automatic, no setup needed
const response = await api.get('/protected-endpoint');
// Token attached automatically, refresh handled automatically
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Requests stuck in queue | Check network, ensure refresh endpoint works |
| Always redirected to login | Check token storage in cookies |
| Token not being sent | Verify cookie consent settings |
| Infinite redirect loop | Check if login page calls protected endpoints |
| CORS errors | Verify API URL in NEXT_PUBLIC_API_URL |

## Files to Review

- `lib/cookies.ts` - Cookie storage implementation
- `lib/api/axios.ts` - Interceptor logic
- `app/lib/services.ts` - Auth service integration

---

**Status:** ✅ Fully Implemented
**Features:** Token refresh, queue management, auto-redirect, silent authentication
**Backward Compatible:** ✅ Yes
