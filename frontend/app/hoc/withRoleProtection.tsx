'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

interface WithRoleProtectionOptions {
  allowedRoles: string[];
  redirectTo?: string;
}

/**
 * Higher Order Component for role-based route protection
 * 
 * @param Component - The component to protect
 * @param options - Configuration with allowedRoles and optional redirectTo
 * @returns Protected component that redirects based on auth state and role
 * 
 * @example
 * // Protect component for admins only
 * export default withRoleProtection(AdminDashboard, { allowedRoles: ['ADMIN'] });
 * 
 * @example
 * // Protect component for multiple roles
 * export default withRoleProtection(Dashboard, { 
 *   allowedRoles: ['ADMIN', 'RIDER'],
 *   redirectTo: '/unauthorized'
 * });
 */
export function withRoleProtection<P extends object>(
  Component: React.ComponentType<P>,
  options: WithRoleProtectionOptions | string[]
): React.FC<P> {
  // Support both array shorthand and options object
  const config: WithRoleProtectionOptions = Array.isArray(options)
    ? { allowedRoles: options }
    : options;

  const { allowedRoles, redirectTo = '/' } = config;

  // Create the wrapper component
  const ProtectedComponent = (props: P) => {
    const { user, role, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = React.useState(false);

    useEffect(() => {
      // Skip redirect logic while loading
      if (isLoading) return;

      // Not authenticated → redirect to login
      if (!isAuthenticated) {
        setIsRedirecting(true);
        router.push('/login');
        return;
      }

      // Authenticated but role not allowed → redirect to home or custom redirectTo
      if (role && !allowedRoles.includes(role)) {
        setIsRedirecting(true);
        router.push(redirectTo);
        return;
      }
    }, [isAuthenticated, role, isLoading, router, allowedRoles, redirectTo]);

    // Show loading state while auth is initializing
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading authentication...</p>
          </div>
        </div>
      );
    }

    // Show nothing while redirecting
    if (isRedirecting) {
      return null;
    }

    // Not authenticated → don't render
    if (!isAuthenticated) {
      return null;
    }

    // Role not allowed → don't render
    if (role && !allowedRoles.includes(role)) {
      return null;
    }

    // All checks passed → render the protected component
    return <Component {...props} />;
  };

  // Set display name for debugging
  ProtectedComponent.displayName = `withRoleProtection(${Component.displayName || Component.name || 'Component'})`;

  return ProtectedComponent;
}

/**
 * Convenience wrapper for admin-only components
 */
export function withAdminProtection<P extends object>(
  Component: React.ComponentType<P>,
  redirectTo?: string
): React.FC<P> {
  return withRoleProtection(Component, {
    allowedRoles: ['ADMIN'],
    redirectTo,
  });
}

/**
 * Convenience wrapper for rider-only components
 */
export function withRiderProtection<P extends object>(
  Component: React.ComponentType<P>,
  redirectTo?: string
): React.FC<P> {
  return withRoleProtection(Component, {
    allowedRoles: ['RIDER'],
    redirectTo,
  });
}

/**
 * Convenience wrapper for customer-only components
 */
export function withCustomerProtection<P extends object>(
  Component: React.ComponentType<P>,
  redirectTo?: string
): React.FC<P> {
  return withRoleProtection(Component, {
    allowedRoles: ['CUSTOMER'],
    redirectTo,
  });
}

/**
 * Convenience wrapper for authenticated users (any role)
 */
export function withAuthProtection<P extends object>(
  Component: React.ComponentType<P>,
  redirectTo?: string
): React.FC<P> {
  return withRoleProtection(Component, {
    allowedRoles: ['ADMIN', 'RIDER', 'CUSTOMER', 'STAFF'],
    redirectTo,
  });
}
