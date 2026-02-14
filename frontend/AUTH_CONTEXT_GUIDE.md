# AuthContext Quick Reference

## Overview

AuthContext provides centralized authentication state management using React Context API. It stores user data, role, and authentication status, and persists them to localStorage for persistence across page refreshes.

## Setup

The `AuthProvider` is already configured in `app/layout.tsx` and wraps the entire application automatically. No additional setup required.

## Quick Start

### Import the Hook
```tsx
import { useAuth } from '@/app/context/AuthContext';
```

### Use in Components
```tsx
'use client';

import { useAuth } from '@/app/context/AuthContext';

export default function MyComponent() {
  const { user, role, isLoading, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : isAuthenticated ? (
        <p>Welcome, {user?.email}!</p>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

## API Reference

### `useAuth()` Hook

Returns the current authentication context with the following properties:

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `user` | `User \| null` | The current logged-in user or null |
| `role` | `string \| null` | User's role (CUSTOMER, STAFF, ADMIN, RIDER) or null |
| `isLoading` | `boolean` | True while auth state is being restored from localStorage or during login/logout |
| `isAuthenticated` | `boolean` | Shorthand for `user !== null` |

#### Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `login` | `email: string, password: string` | `Promise<User>` | Logs in user and stores state |
| `logout` | None | `Promise<void>` | Logs out user and clears state |
| `updateUser` | `userData: Partial<User>` | `void` | Updates user data in context and localStorage |

### User Interface

```tsx
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN' | 'RIDER';
  avatar?: string;
  phoneNumber?: string;
}
```

## Common Patterns

### Login Flow
```tsx
'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      router.push('/'); // Redirect on success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Protected Route Check
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
      router.push('/login', { scroll: false });
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <p>Loading...</p>;
  if (!isAuthenticated) return null;

  return <div>Protected content here</div>;
}
```

### Role-Based Rendering
```tsx
'use client';

import { useAuth } from '@/app/context/AuthContext';

export default function AdminOnly() {
  const { role, isLoading } = useAuth();

  if (isLoading) return <p>Loading...</p>;
  if (role !== 'ADMIN') return <p>Access denied</p>;

  return <div>Admin dashboard</div>;
}
```

### Logout
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

  return <button onClick={handleLogout}>Logout</button>;
}
```

### Update User Profile
```tsx
'use client';

import { useAuth } from '@/app/context/AuthContext';

export default function UpdateProfile() {
  const { user, updateUser } = useAuth();

  const handleUpdate = (newData: Partial<typeof user>) => {
    updateUser(newData);
  };

  return (
    <div>
      <p>Current email: {user?.email}</p>
      <button onClick={() => handleUpdate({ firstName: 'John' })}>
        Update Name
      </button>
    </div>
  );
}
```

## State Persistence

AuthContext automatically persists user data to localStorage under the key `user`:

```json
{
  "id": "user123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "ADMIN",
  "avatar": "https://...",
  "phoneNumber": "+1234567890"
}
```

### Effects on Page Refresh
- User data is automatically restored from localStorage
- `isLoading` is true during restoration
- No need to re-login after page refresh (unless tokens expired)

### Clearing State
- Calling `logout()` removes user data from localStorage
- Closing DevTools won't affect state (it's in browser localStorage)
- Use DevTools → Application → localStorage to debug

## Token Management

AuthContext works **in parallel** with axios interceptors:

- **Token Lifecycle**: Handled by axios (automatic refresh, 401 handling)
- **User State**: Handled by AuthContext (user object, role, persistence)

Example flow:
1. User calls `login(email, password)`
2. AuthService creates axios request
3. API returns `{data: {user, tokens: {accessToken, refreshToken, expiresIn}}}`
4. AuthService calls `setAuthCookies()` (stores tokens in cookies)
5. AuthContext stores user in state + localStorage
6. Subsequent requests: axios adds token from cookies automatically
7. If token expires: axios refresh interceptor handles silently
8. User data remains in context until logout

## Error Handling

### Login Errors
```tsx
try {
  await login(email, password);
} catch (error) {
  if (error instanceof Error) {
    console.error('Login failed:', error.message);
    // Display error to user
  }
}
```

### Logout Errors
```tsx
try {
  await logout();
} catch (error) {
  // Even on error, local state is cleared
  console.error('Logout error:', error);
}
```

### Type-Safe Usage
```tsx
import { useAuth } from '@/app/context/AuthContext';
import type { User } from '@/app/context/AuthContext';

export default function Component() {
  const { user }: { user: User | null } = useAuth();
  
  if (user) {
    // user is typed as User, intellisense works
    console.log(user.email);
  }
}
```

## Debugging

### Check Current State
```tsx
import { useAuth } from '@/app/context/AuthContext';

export default function DebugAuth() {
  const auth = useAuth();
  
  console.log('Auth State:', {
    user: auth.user,
    role: auth.role,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
  });

  return null;
}
```

### Check localStorage
In browser DevTools:
```javascript
console.log(JSON.parse(localStorage.getItem('user')));
```

### Verify Token Management
The axios interceptors log token operations. Check browser console for:
```
[Axios] Request - Added Authorization header
[Axios] Response 401 - Attempting token refresh
[Axios] Token refreshed - Retrying original request
```

## Best Practices

1. **Always use `'use client'` directive** in components using `useAuth`
2. **Check `isLoading` before rendering** protected content
3. **Use `isAuthenticated`** shorthand instead of checking `user !== null`
4. **Store tokens in cookies** (done by axios), store user in context
5. **Handle logout errors gracefully** - local state is cleared even if API call fails
6. **Don't manually manage user state** - use `updateUser()` for changes
7. **Use TypeScript** for type safety with User interface
8. **Wrap protected pages** with redirect logic to `/login`

## Migration from Manual Auth

### Before (Manual Token Management)
```tsx
const token = localStorage.getItem('token');
const user = localStorage.getItem('user');
```

### After (AuthContext)
```tsx
const { user, isAuthenticated } = useAuth();
```

### Before (Manual Logout)
```tsx
localStorage.removeItem('token');
localStorage.removeItem('user');
// Then manually redirect
```

### After (AuthContext)
```tsx
await logout(); // Automatically clears state and redirects if needed
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "useAuth must be used within an AuthProvider" | Ensure component has `'use client'` and is inside layout.tsx hierarchy |
| User data not persisting | Check localStorage in DevTools → Application tab |
| Login works but user is null | Check if authService returns proper user object |
| isLoading never becomes false | Check browser console for errors during initialization |
| Role-checks always fail | Verify API returns correct role (case-sensitive: ADMIN, RIDER, CUSTOMER, STAFF) |

## File Structure

```
frontend/
├── app/
│   ├── context/
│   │   └── AuthContext.tsx          # Context definition + Provider + hook
│   ├── layout.tsx                   # Root layout with AuthProvider wrapper
│   └── (auth)/
│       ├── login/page.tsx           # Can use useAuth for login
│       └── register/page.tsx        # Can use useAuth for registration
└── lib/
    └── api/
        ├── axios.ts                 # Token management (axios interceptors)
        └── ...
```

---

**For questions or issues**, check the axios token management docs at `AXIOS_TOKEN_MANAGEMENT.md`.
