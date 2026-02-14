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

interface RiderLayoutProps {
  children: React.ReactNode;
}

export default function RiderLayout({ children }: RiderLayoutProps) {
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

    console.log('🔍 Rider Layout Auth Check:', { hasUserData: !!userData });

    if (!userData) {
      console.log('❌ No user data, redirecting to login');
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      console.log('👤 Parsed user:', parsedUser);
      
      // Check if user is a RIDER
      const role = parsedUser.role?.toUpperCase();
      if (role !== 'RIDER') {
        console.log('⚠️ Non-rider user, redirecting to appropriate dashboard');
        
        if (role === 'ADMIN' || role === 'STAFF') {
          router.push('/admin/dashboard');
        } else if (role === 'CUSTOMER') {
          router.push('/user/dashboard');
        } else {
          router.push('/login');
        }
        return;
      }

      console.log('✅ Rider user verified, allowing access');
      setUser(parsedUser);
    } catch (error) {
      console.error('❌ Error parsing user data:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rider dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role?.toUpperCase() !== 'RIDER') {
    return null;
  }

  // Define sidebar items for rider
  const sidebarItems: SidebarItem[] = [
    {
      label: 'Dashboard',
      href: '/rider/dashboard',
      icon: '📊',
    },
    {
      label: 'My Deliveries',
      href: '/rider/deliveries',
      icon: '🚚',
    },
    {
      label: 'My Performance',
      href: '/rider/performance',
      icon: '📈',
    },
    {
      label: 'Profile',
      href: '/rider/profile',
      icon: '👤',
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <SidebarWithRoutes 
        items={sidebarItems} 
      />

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
}
