'use client';

import Navbar from '@/app/components/Navbar';
import DashboardStatsGrid from '@/app/components/DashboardStatsGrid';
import DetailedDashboardStats from '@/app/components/DetailedDashboardStats';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PublicDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only admins can view dashboard
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full"></div>
          </div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome back, {user.firstName}! 👋
          </h1>
          <p className="text-xl text-gray-600">
            Here's a complete overview of your shipment management system
          </p>
        </div>

        {/* Quick Stats - 5 Main Cards */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Quick Overview</h2>
          <DashboardStatsGrid />
        </section>

        {/* Detailed Statistics */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 Detailed Analytics</h2>
          <DetailedDashboardStats />
        </section>
      </main>
    </div>
  );
}
