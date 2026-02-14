# Role Protection HOC Guide

## Overview

`withRoleProtection` is a Higher Order Component (HOC) that protects your pages and components with role-based access control. It automatically:

1. **Prevents unauthenticated access** — Redirects to `/login` if user not logged in
2. **Enforces role restrictions** — Redirects to home (or custom path) if user's role doesn't match
3. **Shows loading state** — Displays loader while auth is initializing
4. **Transparent redirects** — Handles redirects without user seeing protected content

## Syntax

```tsx
withRoleProtection(Component, allowedRoles)
// or
withRoleProtection(Component, { allowedRoles: ['ADMIN'], redirectTo: '/unauthorized' })
```

## Basic Usage

### 1. Admin-Only Page
```tsx
'use client';

function AdminDashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Only admins can see this</p>
    </div>
  );
}

export default withRoleProtection(AdminDashboard, ['ADMIN']);
```

### 2. Multiple Roles Allowed
```tsx
'use client';

function Dashboard() {
  return <div>Dashboard for admin or staff</div>;
}

export default withRoleProtection(Dashboard, ['ADMIN', 'STAFF']);
```

### 3. Using Options Object
```tsx
'use client';

function RiderPage() {
  return <div>Rider-only area</div>;
}

export default withRoleProtection(RiderPage, {
  allowedRoles: ['RIDER'],
  redirectTo: '/unauthorized', // Custom redirect path
});
```

## Real-World Examples

### Admin Dashboard
**File:** `app/admin/dashboard/page.tsx`

```tsx
'use client';

import { withRoleProtection } from '@/app/hoc/withRoleProtection';
import { useAuth } from '@/app/context/AuthContext';

function AdminDashboard() {
  const { user } = useAuth(); // Now guaranteed to be ADMIN

  return (
    <div className="p-8">
      <h1>Welcome, {user?.email}</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="card">Total Users: 1234</div>
        <div className="card">Total Shipments: 5678</div>
        <div className="card">Active Riders: 89</div>
      </div>
    </div>
  );
}

export default withRoleProtection(AdminDashboard, ['ADMIN']);
```

### Rider Portal
**File:** `app/rider/dashboard/page.tsx`

```tsx
'use client';

import { withRoleProtection } from '@/app/hoc/withRoleProtection';
import { useAuth } from '@/app/context/AuthContext';

function RiderDashboard() {
  const { user } = useAuth(); // Guaranteed RIDER

  return (
    <div>
      <h1>Rider Dashboard</h1>
      <p>Assigned Shipments: 12</p>
      <p>Completed: 456</p>
    </div>
  );
}

export default withRoleProtection(RiderDashboard, ['RIDER']);
```

### User Profile (Any Logged-In User)
**File:** `app/profile/page.tsx`

```tsx
'use client';

import { withAuthProtection } from '@/app/hoc/withRoleProtection';
import { useAuth } from '@/app/context/AuthContext';

function ProfilePage() {
  const { user, updateUser } = useAuth(); // Any authenticated role

  return (
    <div>
      <h1>My Profile</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
      <p>Phone: {user?.phoneNumber}</p>
    </div>
  );
}

export default withAuthProtection(ProfilePage);
```

### Access Multiple Locations
**File:** `app/reports/page.tsx`

```tsx
'use client';

import { withRoleProtection } from '@/app/hoc/withRoleProtection';

function ReportsPage() {
  return (
    <div>
      <h1>Reports</h1>
      <p>Only Admin and Staff can access</p>
    </div>
  );
}

export default withRoleProtection(ReportsPage, {
  allowedRoles: ['ADMIN', 'STAFF'],
  redirectTo: '/access-denied',
});
```

## Convenience Helpers

### `withAdminProtection`
Shorthand for admin-only pages:

```tsx
export default withAdminProtection(AdminPage);
// Equivalent to:
// export default withRoleProtection(AdminPage, { allowedRoles: ['ADMIN'] });
```

### `withRiderProtection`
Shorthand for rider-only pages:

```tsx
export default withRiderProtection(RiderPage);
```

### `withCustomerProtection`
Shorthand for customer-only pages:

```tsx
export default withCustomerProtection(CustomerPage);
```

### `withAuthProtection`
Shorthand for any authenticated user:

```tsx
export default withAuthProtection(ProfilePage);
// Allows: ADMIN, RIDER, CUSTOMER, STAFF
```

## Use Cases

| Use Case | HOC | Example |
|----------|-----|---------|
| Admin-only dashboard | `withAdminProtection(Component)` | Analytics, user management |
| Rider-only access | `withRiderProtection(Component)` | Delivery tracking, shipment acceptance |
| Customer profile | `withCustomerProtection(Component)` | Order history, account settings |
| Any logged-in user | `withAuthProtection(Component)` | Dashboard, profile, settings |
| Multiple specific roles | `withRoleProtection(Component, ['ADMIN', 'STAFF'])` | Reports, moderation |

## Behavior Reference

### Authentication Not Initialized (isLoading = true)
```
├─ Display: Loading spinner
└─ User sees: "Loading authentication..."
```

### Not Authenticated (isAuthenticated = false)
```
├─ Redirect: /login
└─ User sees: Login page
```

### Authenticated But Role Mismatch
```
├─ Redirect: redirectTo prop (default: /)
└─ User sees: Home page or custom redirect target
```

### Authenticated With Correct Role
```
├─ Render: Complete component
└─ User sees: Protected content
```

## Component Props vs HOC

### Using HOC (Recommended)
```tsx
// Cleaner, built into the page
export default withRoleProtection(Dashboard, ['ADMIN']);
```

### Using useAuth Hook (Alternative)
```tsx
'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function Dashboard() {
  const { role, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    if (!isLoading && role !== 'ADMIN') {
      router.push('/');
    }
  }, [role, isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated || role !== 'ADMIN') return null;

  return <div>Dashboard</div>;
}

export default Dashboard;
```

**Why HOC is better:**
- Less boilerplate code
- Consistent protection logic
- Reusable across many components
- Easier to maintain

## Advanced Configuration

### Custom Redirect Path
```tsx
export default withRoleProtection(UnauthorizedComponent, {
  allowedRoles: ['ADMIN'],
  redirectTo: '/unauthorized', // Custom path instead of home
});
```

### Dynamic Role-Based Rendering
```tsx
'use client';

import { withRoleProtection } from '@/app/hoc/withRoleProtection';
import { useAuth } from '@/app/context/AuthContext';

function Dashboard() {
  const { role } = useAuth(); // Guaranteed to be ADMIN or STAFF

  if (role === 'ADMIN') {
    return <AdminView />;
  }

  if (role === 'STAFF') {
    return <StaffView />;
  }

  return null; // Shouldn't reach here due to HOC
}

// Only allowed roles reach this component
export default withRoleProtection(Dashboard, ['ADMIN', 'STAFF']);
```

### Combining HOC with Layout
```tsx
// app/admin/layout.tsx
import { withAdminProtection } from '@/app/hoc/withRoleProtection';

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}

export default withAdminProtection(AdminLayout);
```

## TypeScript Support

The HOC is fully type-safe:

```tsx
interface DashboardProps {
  title?: string;
}

function Dashboard({ title = 'Dashboard' }: DashboardProps) {
  return <h1>{title}</h1>;
}

// TypeScript knows props type is DashboardProps
export default withRoleProtection(Dashboard, ['ADMIN']);

// Usage:
// <Dashboard title="Admin Panel" /> ✅ Works
// <Dashboard invalid="prop" /> ❌ TypeScript error
```

## Loading State Styling

The HOC shows a loading spinner while auth initializes. Customize the loader:

```tsx
// In withRoleProtection.tsx, modify the loading render:

if (isLoading) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-200 border-t-amber-500 mx-auto mb-6"></div>
        <p className="text-gray-600 font-semibold">Verifying access...</p>
      </div>
    </div>
  );
}
```

## File Structure

```
frontend/app/
├── hoc/
│   └── withRoleProtection.tsx ← The HOC (this file)
├── admin/
│   └── dashboard/
│       └── page.tsx ← Use withAdminProtection
├── rider/
│   └── dashboard/
│       └── page.tsx ← Use withRiderProtection
└── profile/
    └── page.tsx ← Use withAuthProtection
```

## Debugging

### Check If HOC Applied
```tsx
// Works
export default withRoleProtection(Component, ['ADMIN']);

// ❌ Wrong - HOC not applied
export default Component;
```

### Verify Role Access
```tsx
// Add logging in protected component:
function Dashboard() {
  const { user, role } = useAuth();
  
  console.log('Current user:', user);
  console.log('Current role:', role);
  
  return <div>Dashboard</div>;
}

export default withRoleProtection(Dashboard, ['ADMIN']);
```

### Check DevTools
In browser DevTools, when redirecting:
- **Network tab**: Should see redirect requests
- **Console**: No errors should appear
- **Application → localStorage**: 'user' key should exist

## Common Issues

| Issue | Solution |
|-------|----------|
| Component flickers then redirects | This is expected - loading state shows briefly |
| Always redirects to login | Check if user role is correctly returned from API |
| "useAuth must be used within AuthProvider" | Ensure root layout has AuthProvider |
| Props not passing through | HOC preserves props automatically |
| Role checks not working | Verify roles in API response are uppercase (ADMIN, RIDER, etc.) |

## Best Practices

1. **Use HOC wrapping in export**
```tsx
✅ export default withRoleProtection(Component, allowedRoles);

❌ const Protected = withRoleProtection(Component, allowedRoles);
   export default Protected;
```

2. **Place HOC logic in page.tsx**
```tsx
✅ // app/admin/page.tsx
   export default withRoleProtection(AdminPage, ['ADMIN']);

❌ // Nested in app/admin/component.tsx
   // Gets confusing to track protection
```

3. **Use convenience helpers when possible**
```tsx
✅ export default withAdminProtection(Component);

❌ export default withRoleProtection(Component, ['ADMIN']);
```

4. **Combine with useAuth for role info inside component**
```tsx
✅ function Component() {
     const { role, user } = useAuth(); // Already verified by HOC
     // Safe to use role directly
   }

❌ function Component() {
     // Assume role without checking
   }
```

## Related Documentation

- [AUTH_CONTEXT_GUIDE.md](../AUTH_CONTEXT_GUIDE.md) — useAuth hook API reference
- [AUTH_CONTEXT_INTEGRATION.md](../AUTH_CONTEXT_INTEGRATION.md) — Integration patterns
- [AUTH_IMPLEMENTATION_STATUS.md](../AUTH_IMPLEMENTATION_STATUS.md) — Current authentication status

---

**Next Steps:**
1. Apply `withRoleProtection` to your admin pages
2. Apply `withRiderProtection` to rider pages
3. Apply `withAuthProtection` to user pages
4. Test redirects in different scenarios
