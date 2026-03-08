'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardStatsGrid from '@/app/components/DashboardStatsGrid';
import { adminService } from '@/app/lib/services';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch dashboard stats
        const statsResponse = await adminService.getDashboardStats();
        setStats(statsResponse.data);

        setError('');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);



  return (
    <div className="p-4 md:p-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between md:gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"> Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's your business overview for today</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition"
            >
               Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-8 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 text-red-700 font-semibold">
          <p className="flex items-center gap-2">
            <span></span>
            {error}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
            <p className="text-xl text-gray-600"> Loading dashboard...</p>
          </div>
        </div>
      ) : stats ? (
        <div className="space-y-8">
          {/* Stats Grid Using DashboardStatsGrid Component */}
          <DashboardStatsGrid />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Cards */}
            <div className="space-y-4">
              {/* Summary Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Completion Rate:</span>
                    <span className="font-semibold text-blue-600">
                      {Math.round((stats.shipments.delivered / (stats.shipments.total || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rider Availability:</span>
                    <span className="font-semibold text-green-600">
                      {Math.round((stats.riders.available / (stats.riders.total || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden mt-4">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                      style={{ width: `${Math.round((stats.shipments.delivered / (stats.shipments.total || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                   Parcel Status
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending:</span>
                    <span className="font-semibold">{stats.shipments.pending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">In Transit:</span>
                    <span className="font-semibold">{stats.shipments.inTransit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Out for Delivery:</span>
                    <span className="font-semibold">{stats.shipments.outForDelivery}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivered:</span>
                    <span className="font-semibold text-green-600">{stats.shipments.delivered}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
               Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/admin/parcels"
                className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-4 hover:shadow-lg transition duration-300 text-center group"
              >
                <p className="text-3xl mb-2 group-hover:scale-110 transition-transform">📦</p>
                <h4 className="font-bold text-gray-900 group-hover:text-amber-700">Manage Parcels</h4>
                <p className="text-xs text-gray-600 mt-1">View and track all parcels</p>
              </Link>

              <Link
                href="/admin/riders"
                className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4 hover:shadow-lg transition duration-300 text-center group"
              >
                <p className="text-3xl mb-2 group-hover:scale-110 transition-transform">🏍️</p>
                <h4 className="font-bold text-gray-900 group-hover:text-red-700">Manage Riders</h4>
                <p className="text-xs text-gray-600 mt-1">Rider assignments and status</p>
              </Link>

              <Link
                href="/admin/users"
                className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4 hover:shadow-lg transition duration-300 text-center group"
              >
                <p className="text-3xl mb-2 group-hover:scale-110 transition-transform">👥</p>
                <h4 className="font-bold text-gray-900 group-hover:text-purple-700">Manage Users</h4>
                <p className="text-xs text-gray-600 mt-1">Create and manage accounts</p>
              </Link>

              <Link
                href="/admin/parcels"
                className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 hover:shadow-lg transition duration-300 text-center group"
              >
                <p className="text-3xl mb-2 group-hover:scale-110 transition-transform"></p>
                <h4 className="font-bold text-gray-900 group-hover:text-blue-700">Analytics</h4>
                <p className="text-xs text-gray-600 mt-1">Revenue and performance reports</p>
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
