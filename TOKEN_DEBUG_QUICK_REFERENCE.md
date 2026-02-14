# Quick Token Debug Checklist

## After Rider Login

### Browser Console (DevTools → Console)
Look for these logs in ORDER:

```
✅ [AUTH] Login successful for user: 507f1f77bcf86cd799439011  ← User received
✅ [AUTH] Token confirmed in cookies                          ← Token saved
🔐 [AXIOS] Token attached to GET /api/riders/me              ← Token sent
✅ [AUTH] Token verified for user: 507f1f77bcf86cd799439011 (role: RIDER)  ← Verified
```

### Browser Cookies (DevTools → Application → Cookies → localhost:3000)

Check these 3 cookies exist:

| Cookie Name | Type | Expected Content |
|---|---|---|
| `pathaunow_token` | String | `eyJhbGc...` (JWT) |
| `pathaunow_refresh_token` | String | `eyJhbGc...` (JWT) |
| `pathaunow_user` | String | `{"id":"507f...","email":"rider@example.com","role":"RIDER"}` |

### Browser LocalStorage (DevTools → Application → Local Storage → http://localhost:3000)

Check:
| Key | Expected Value |
|---|---|
| `user` | `{"id":"507f...","email":"rider@example.com","role":"RIDER","firstName":"John"}` |

---

## If Token NOT Saved

### Test 1: Is authService.login() Being Called?
```javascript
// In browser console, before clicking login
window.checkLogin = true;

// In Redux DevTools or Network tab, verify:
// ✅ POST /api/auth/login request sent
// ✅ Response has status: true and data.tokens.accessToken present
```

### Test 2: Are Cookies Being Set?
```javascript
// Run in browser console after login
console.log("All cookies:", document.cookie);
console.log("Token cookie:", document.cookie.match(/pathaunow_token=[^;]*/)?.[0]);

// Try to set a test cookie
document.cookie = "test=value; path=/; max-age=3600; samesite=lax";
console.log("Test cookie set?", document.cookie.includes("test=value"));
// If test cookie doesn't appear, browser has cookie restrictions
```

### Test 3: Is Axios Interceptor Running?
```javascript
// In browser console
// 1. Add this code BEFORE login
const originalFetch = window.fetch;
window.fetchInterceptor = (url, options) => {
  console.log("Fetch to:", url, "Headers:", options?.headers);
  return originalFetch(url, options);
};

// 2. Then check if Authorization header is being added
// Look at Network tab → Headers → Request Headers
// Should show: Authorization: Bearer eyJhbGc...
```

---

## Backend Token Verification

### Test 1: Token Received by Backend?
```bash
# Check backend logs while making request
# Should show:
# 🔐 [AUTH] Verifying token for GET /api/riders/me

# If you see:
# ⚠️ [AUTH] No token provided in Authorization header
# → Token isn't being sent from frontend
```

### Test 2: Token Valid?
```bash
# Should show:
# ✅ [AUTH] Token verified for user: 507f1f77bcf86cd799439011 (role: RIDER)

# If you see:
# ❌ [AUTH] Token verification failed: jwt expired
# → Token is expired, use refresh token

# If you see:
# ❌ [AUTH] Token verification failed: jwt malformed
# → Token string is corrupted, login again
```

### Test 3: Manual Backend Test
```bash
# Get a token
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rider@example.com","password":"test123"}')

echo "Full response: $TOKEN_RESPONSE"

# Extract token
TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.data.tokens.accessToken')
echo "Token: $TOKEN"

# Use token to access protected endpoint
curl -X GET http://localhost:5000/api/riders/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## Complete Flow Test (Automated)

### Setup Test Environment
```bash
# 1. Ensure backend is running
cd backend && npm run dev &

# 2. Ensure frontend is running  
cd frontend && npm run dev &

# 3. Wait for both to start
sleep 5
```

### Run Test
```bash
# 1. Login
echo "1️⃣ Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rider@example.com",
    "password": "test123"
  }')

echo "Login response:"
echo $LOGIN_RESPONSE | jq '.'

# 2. Extract tokens
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.tokens.accessToken')
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.tokens.refreshToken')

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
  echo "❌ Failed to get access token!"
  echo "Response was: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Access token obtained: ${ACCESS_TOKEN:0:20}..."

# 3. Test protected endpoints
echo ""
echo "2️⃣ Testing /api/riders/me..."
curl -s -X GET http://localhost:5000/api/riders/me \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'

echo ""
echo "3️⃣ Testing /api/riders/me/shipments..."
curl -s -X GET http://localhost:5000/api/riders/me/shipments \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'

echo ""
echo "4️⃣ Testing /api/riders/me/stats..."
curl -s -X GET http://localhost:5000/api/riders/me/stats \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'

echo ""
echo "✅ All tests passed!"
```

---

## Debug Logging Levels

The enhanced code logs with visual indicators:

| Symbol | Meaning | React To |
|---|---|---|
| 🔐 | Security/Auth | Normal flow |
| ✅ | Success | No action needed |
| ⚠️ | Warning | Check issue, might be ok |
| ❌ | Error | Action required! |
| 🏍️ | Rider-specific | For rider routes |

**Example console flow (good):**
```
🔐 [AUTH] Attempting login for: rider@example.com
✅ [AUTH] Login successful for user: 507f1f77bcf86cd799439011
✅ [AUTH] Token confirmed in cookies
🔐 [AXIOS] Token attached to GET /api/riders/me
🔐 [AUTH] Verifying token for GET /api/riders/me
✅ [AUTH] Token verified for user: 507f1f77bcf86cd799439011 (role: RIDER)
```

**Example console flow (bad):**
```
🔐 [AUTH] Attempting login for: rider@example.com
⚠️ [AUTH] Token not found in cookies after login!  ← 🚨 Problem here
⚠️ [AXIOS] No token found for GET /api/riders/me
⚠️ [AUTH] No token provided in Authorization header for GET /api/riders/me
❌ [AUTH] Token verification failed: No token provided  ← Request fails
```

---

## Solution Priority (If Issues Found)

### Priority 1: Token Not Saved to Cookies
- [ ] Check `frontend/lib/cookies.ts` - `setCookie()` function
- [ ] Check `setAuthCookies()` is called in `frontend/app/lib/services.ts`
- [ ] Check browser cookie restrictions (DevTools → Application)

### Priority 2: Token Not Sent in Request
- [ ] Check `readAuthFromCookies()` can read cookies
- [ ] Check axios interceptor is registered
- [ ] Verify `Authorization` header is being added

### Priority 3: Token Not Verified by Backend  
- [ ] Check JWT_SECRET in backend `.env` matches
- [ ] Check token expiry timestamp
- [ ] Check middleware is applied to routes

### Priority 4: User Not Restored on Refresh
- [ ] Check localStorage has `user` entry
- [ ] Check AuthContext `useEffect` initialization logic
- [ ] Clear cache and test again

---

## Clear Everything & Reset

If stuck, nuclear option:

#### Browser:
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
document.cookie.split(";").forEach(c => {
  const eqPos = c.indexOf("=");
  const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
  document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
});
console.log("✅ All storage cleared");
location.reload();
```

#### Backend:
```bash
# Restart backend server
cd backend
npm run dev
```

#### Then:
1. Logout from everywhere
2. Close browser tabs/windows
3. Clear browser cache
4. Login again
5. Check console logs step by step
