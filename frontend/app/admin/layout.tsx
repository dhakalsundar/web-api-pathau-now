'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import SidebarWithRoutes from '@/app/components/SidebarWithRoutes';
import { readAuthFromCookies } from '@/lib/cookies';

interface SidebarItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure we're on client side
    if (typeof window === 'undefined') {
      return;
    }

    // Allow login page to be accessed without authentication
    if (pathname === '/login/admin') {
      setLoading(false);
      return;
    }

    // Check authentication from cookies
    const { token, user: cookieUser } = readAuthFromCookies();

    if (!token || !cookieUser) {
      router.push('/login/admin');
      return;
    }

    try {
      // Check if user is admin
      const role = cookieUser.role?.toUpperCase();
      if (role !== 'ADMIN' && role !== 'STAFF') {
        console.log(' Non-admin user, redirecting:', { role });
        
        // Redirect to appropriate dashboard based on role
        if (role === 'RIDER') {
          router.push('/rider/dashboard');
        } else if (role === 'CUSTOMER') {
          router.push('/user/dashboard');
        } else {
          router.push('/login');
        }
        return;
      }

      setUser(cookieUser);
    } catch (error) {
      console.error('Error processing admin auth:', error);
      router.push('/login/admin');
    } finally {
      setLoading(false);
    }
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page without sidebar
  if (pathname === '/login/admin') {
    return <>{children}</>;
  }

  // If no user data after loading (shouldn't reach here, but safety check)
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Define sidebar items
  const sidebarItems: SidebarItem[] = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: '',
    },
    {
      label: 'Users',
      href: '/admin/users',
      icon: '',
    },
    {
      label: 'Parcels',
      href: '/admin/parcels',
      icon: '',
    },
    {
      label: 'Riders',
      href: '/admin/riders',
      icon: '',
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Fixed Sidebar */}
      <SidebarWithRoutes
        items={sidebarItems}
        userRole={user?.role?.toUpperCase() || 'ADMIN'}
        userName={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Admin User'}
        userAvatar={user?.avatar}
      />

      {/* Main Content Area - Adjust margin based on sidebar */}
      <main className="flex-1 ml-64 transition-all duration-300 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
