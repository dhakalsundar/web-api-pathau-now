'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SidebarWithRoutes from '@/app/components/SidebarWithRoutes';

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
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    // Allow login page to be accessed without authentication
    if (typeof window !== 'undefined' && window.location.pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    if (!token || !userData) {
      router.push('/admin/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      
      // Check if user is admin
      if (parsedUser.role !== 'admin' && parsedUser.role !== 'ADMIN') {
        router.push('/');
        return;
      }

      setUser(parsedUser);
    } catch (error) {
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

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

  // Check if this is the login page
  if (typeof window !== 'undefined' && window.location.pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Define sidebar items
  const sidebarItems: SidebarItem[] = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: '📊',
    },
    {
      label: 'Users',
      href: '/admin/users',
      icon: '👥',
    },
    {
      label: 'Shipments',
      href: '/admin/shipments',
      icon: '📦',
    },
    {
      label: 'Riders',
      href: '/admin/riders',
      icon: '🏍️',
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Fixed Sidebar */}
      <SidebarWithRoutes
        items={sidebarItems}
        userRole={user?.role?.toUpperCase() || 'ADMIN'}
        userName={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Admin User'}
      />

      {/* Main Content Area - Adjust margin based on sidebar */}
      <main className="flex-1 ml-64 transition-all duration-300 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
