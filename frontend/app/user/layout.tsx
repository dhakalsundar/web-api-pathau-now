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

interface UserLayoutProps {
  children: React.ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure we're on client side
    if (typeof window === 'undefined') {
      return;
    }

    // Check user data in localStorage (token is in cookies)
    const userData = localStorage.getItem('user');

    console.log('Checking auth:', { hasUserData: !!userData });

    if (!userData) {
      console.log('No user data, redirecting to login');
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      console.log('Parsed user:', parsedUser);
      
      // Check if user is admin/staff (redirect to admin)
      const role = parsedUser.role?.toUpperCase();
      if (role === 'ADMIN' || role === 'STAFF') {
        console.log('Admin/Staff user, redirecting to admin dashboard');
        router.push('/admin/dashboard');
        return;
      }

      console.log('Customer user, allowing access');
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
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

  // Define sidebar items for customer
  const sidebarItems: SidebarItem[] = [
    {
      label: 'Dashboard',
      href: '/user/dashboard',
      icon: '📊',
    },
    {
      label: 'My Parcels',
      href: '/user/my-parcels',
      icon: '📦',
    },
    {
      label: 'Create Parcel',
      href: '/user/create-parcel',
      icon: '✚',
    },
    {
      label: 'Track Parcel',
      href: '/user/track',
      icon: '🔍',
    },
    {
      label: 'Profile',
      href: '/user/profile',
      icon: '👤',
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Fixed Sidebar */}
      <SidebarWithRoutes
        items={sidebarItems}
        userRole={user?.role || 'CUSTOMER'}
        userName={user?.name || 'Customer'}
      />

      {/* Main Content */}
      <main className="flex-1 ml-64 transition-all duration-300">
        <div className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-8 py-4 flex items-center justify-between">
            <div></div>
            <div className="text-sm text-gray-600">
              Welcome, <span className="font-semibold text-gray-900">{user?.name || 'Customer'}</span>
            </div>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
