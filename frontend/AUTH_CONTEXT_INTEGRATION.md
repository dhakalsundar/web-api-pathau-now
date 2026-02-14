# AuthContext Integration Guide

This guide shows how to integrate the new `AuthContext` into your existing application components.

## Overview

The `AuthContext` is now wrapping your entire application (in `app/layout.tsx`). It automatically:

1. **Restores user authentication** from localStorage on page load
2. **Persists user data** across page refreshes
3. **Manages login/logout** state centrally
4. **Provides role-based access** for conditional rendering

## Integration Points

### 1. Login Page (Already Updated ✅)

**File:** [app/(auth)/login/page.tsx](app/(auth)/login/page.tsx)

**Changes Made:**
- Import `useAuth` instead of using `authService` directly
- Call `login()` from context
- Remove manual `localStorage.getItem('user')`

**Before:**
```tsx
const response = await authService.login(formData.email, formData.password);
const user = JSON.parse(localStorage.getItem('user') || '{}');
```

**After:**
```tsx
const user = await login(formData.email, formData.password);
```

### 2. Registration Flow

**File:** [app/(auth)/register/page.tsx](app/(auth)/register/page.tsx)

**Note:** Keep using `authService.register()` since registration is separate from authentication state. After user registers, they navigate to login page where AuthContext takes over.

### 3. Logout Button/Functionality

**Example Implementation:**
```tsx
'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <button onClick={handleLogout} className="btn btn-outline">
      Logout
    </button>
  );
}
```

### 4. Protected Pages/Dashboard

**Pattern for Admin Dashboard:**
```tsx
'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const { user, role, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Redirect to home if not admin
    if (!isLoading && role !== 'ADMIN') {
      router.push('/');
      return;
    }
  }, [isAuthenticated, role, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated || role !== 'ADMIN') return null;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user?.email}</p>
      {/* Dashboard content */}
    </div>
  );
}
```

### 5. Navbar/Header with User Info

**Example Implementation:**
```tsx
'use client';

import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="logo">
        <Link href="/">PathauNow</Link>
      </div>

      {/* Navigation Links */}
      <div className="nav-links">
        {isAuthenticated ? (
          <>
            <span>Welcome, {user?.firstName || user?.email}</span>
            {user?.role === 'ADMIN' && (
              <Link href="/admin/dashboard">Dashboard</Link>
            )}
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
```

### 6. Conditional Rendering by Role

**Example - Show admin features only:**
```tsx
'use client';

import { useAuth } from '@/app/context/AuthContext';

export default function ShipmentActions() {
  const { role } = useAuth();

  return (
    <div className="actions">
      {role === 'ADMIN' && (
        <button>Assign Rider</button>
      )}
      {role === 'RIDER' && (
        <button>Accept Shipment</button>
      )}
      {role === 'CUSTOMER' && (
        <button>Track Shipment</button>
      )}
    </div>
  );
}
```

### 7. Profile Page with User Data

**Example Implementation:**
```tsx
'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, updateUser } = useAuth();
  const router = useRouter();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleUpdateProfile = async (newData: any) => {
    try {
      // Call your API to update profile
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(newData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        updateUser(updatedUser); // Update context
      }
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  return (
    <div className="profile">
      <h1>My Profile</h1>
      <p>Email: {user?.email}</p>
      <p>Name: {user?.firstName} {user?.lastName}</p>
      <p>Role: {user?.role}</p>
      <p>Phone: {user?.phoneNumber}</p>
      <button onClick={() => handleUpdateProfile({ firstName: 'Jane' })}>
        Update Name
      </button>
    </div>
  );
}
```

## Component Types & Examples

### Client Component (Most Common)
```tsx
'use client';  // ← Required for useAuth

import { useAuth } from '@/app/context/AuthContext';

export default function Component() {
  const { user, logout } = useAuth();
  return <div>{user?.email}</div>;
}
```

### Server Component
```tsx
// No 'use client' - server only
// ❌ Cannot use useAuth here
// ✅ Can use async/await directly
// ✅ Can access server-only secrets

export default async function ServerComponent() {
  // Fetch data server-side
  return <div>Server content</div>;
}
```

### Layout with Auth (Already Done ✅)
```tsx
import { AuthProvider } from "./context/AuthContext";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

## Common Patterns

### 1. Redirect Unauthenticated Users
```tsx
'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return <div>Protected content</div>;
}
```

### 2. Redirect Already-Logged-In Users
```tsx
'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/'); // Redirect to home if already logged in
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;
  if (isAuthenticated) return null; // Don't show login page if already logged in

  return <div>Login form</div>;
}
```

### 3. Role-Based Access Control
```tsx
'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const { role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && role !== 'ADMIN') {
      router.push('/'); // Redirect if not admin
    }
  }, [role, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;
  if (role !== 'ADMIN') return null;

  return <div>Admin content</div>;
}
```

### 4. Loading State Management
```tsx
'use client';

import { useAuth } from '@/app/context/AuthContext';

export default function Component() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="spinner">
        <p>Loading authentication...</p>
      </div>
    );
  }

  return <div>Welcome, {user?.email}</div>;
}
```

## File Changes Summary

### Created
- [app/context/AuthContext.tsx](app/context/AuthContext.tsx) - Context definition, Provider, and hook

### Updated
- [app/layout.tsx](app/layout.tsx) - Wrapped with AuthProvider
- [app/(auth)/login/page.tsx](app/(auth)/login/page.tsx) - Updated to use useAuth hook

### No Changes Needed (Uses authService directly)
- [app/(auth)/register/page.tsx](app/(auth)/register/page.tsx) - Keep as is (registration ≠ authentication state)

## Data Flow

### 1. App Startup
```
App Start
  ↓
AuthProvider Mounts
  ↓
useEffect: Check localStorage for 'user'
  ↓
If exists: setUser(storedUser)
  ↓
Set isLoading = false
  ↓
App renders with user data
```

### 2. Login Flow
```
User fills login form
  ↓
Clicks submit
  ↓
context.login(email, password)
  ↓
authService.login() → API call
  ↓
API returns {user, tokens}
  ↓
setAuthCookies(accessToken, refreshToken, user) ← Stores cookies
  ↓
setUser(user) ← Updates context
  ↓
localStorage.setItem('user', user) ← Persists state
  ↓
login() returns user object
  ↓
Component redirects to dashboard
```

### 3. Logout Flow
```
User clicks logout
  ↓
context.logout()
  ↓
authService.logout() → API call
  ↓
setUser(null) ← Clear context
  ↓
localStorage.removeItem('user') ← Clear storage
  ↓
clearAuthCookies() ← Clear tokens
  ↓
logout() resolves
  ↓
Component redirects to login
```

### 4. Token Refresh (Transparent)
```
API request sent
  ↓
Axios Request Interceptor
  ↓
Add token from cookies
  ↓
API responds
  ↓
If 401: Response Interceptor
  ↓
Call /api/auth/refresh
  ↓
Get new accessToken
  ↓
updateAccessToken(newToken) ← Updates cookies only
  ↓
Retry original request (no context change)
  ↓
Request succeeds
```

## State Persistence

### What Gets Persisted
- **localStorage['user']**: Full user object (email, role, name, etc.)
- **Cookies**: Access token (1 day), Refresh token (7 days)

### What Doesn't Get Persisted
- **isLoading state**: Resets on page load (async initialization)
- **Error messages**: Not stored (would be outdated)

### Persistence Timeline
- **Page Load**: user restored from localStorage, isLoading = true
- **API Call**: tokens managed by axios (cookies)
- **Page Refresh**: user immediately available, isLoading briefly true
- **Logout**: user cleared immediately

## Debugging

### Check Current State
```tsx
'use client';

import { useAuth } from '@/app/context/AuthContext';

export default function DebugComponent() {
  const auth = useAuth();

  console.log('Auth State:', {
    user: auth.user,
    role: auth.role,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
  });

  return <pre>{JSON.stringify(auth, null, 2)}</pre>;
}
```

### Check localStorage
```javascript
// In browser DevTools console
console.log(localStorage.getItem('user'));
```

### Check Cookies
DevTools → Application → Cookies:
- `pathaunow_token` (access token)
- `pathaunow_refresh_token` (refresh token)
- `pathaunow_user` (user data backup)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "useAuth must be used within an AuthProvider" | Add `'use client'` directive at top of component |
| User is null after login | Check if authService.login returns `data.user` |
| User doesn't persist after refresh | Check localStorage in DevTools → Application |
| Login stuck on loading | Check browser console for API errors |
| Role checks not working | Verify API returns role in uppercase (ADMIN, RIDER, CUSTOMER, STAFF) |
| Logout doesn't redirect | Make sure redirect happens in component, not in context |

## Next Steps

1. **Update existing components** that manually check localStorage to use useAuth instead
2. **Add role-based guards** to admin, rider, and other protected routes
3. **Implement loading skeletons** while isLoading = true
4. **Add error boundaries** for auth failures
5. **Test logout/login** flows thoroughly
6. **Consider adding** refresh logic for getProfile() if user data can become stale

## Related Documentation

- [AUTH_CONTEXT_GUIDE.md](AUTH_CONTEXT_GUIDE.md) - Detailed API reference
- [AXIOS_TOKEN_MANAGEMENT.md](AXIOS_TOKEN_MANAGEMENT.md) - Token refresh system
- [AXIOS_QUICK_REFERENCE.md](AXIOS_QUICK_REFERENCE.md) - Axios interceptors overview
