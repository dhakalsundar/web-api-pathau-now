'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/app/components/DataTable';
import DashboardStatsGrid from '@/app/components/DashboardStatsGrid';
import { adminService } from '@/app/lib/services';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [recentShipments, setRecentShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch dashboard stats
        const statsResponse = await adminService.getDashboardStats();
        setStats(statsResponse.data);

        // Fetch recent shipments
        const shipmentsResponse = await adminService.getRecentShipments();
        setRecentShipments(shipmentsResponse.data || []);

        setError('');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const shipmentColumns = [
    { key: 'trackingNumber', label: 'Tracking Number', width: '150px' },
    { key: 'status', label: 'Status', width: '120px' },
    { key: 'sender', label: 'Sender', width: '150px' },
    { key: 'price', label: 'Price', width: '100px' },
    { key: 'createdAt', label: 'Booked', width: '150px' },
  ];

  const formattedShipments = recentShipments.map((s: any) => ({
    trackingNumber: s.trackingNumber,
    status: s.status?.replace('_', ' '),
    sender: s.sender?.name || '-',
    price: `৳${s.price}`,
    createdAt: new Date(s.createdAt).toLocaleDateString(),
  }));

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your business overview</p>
      </div>

      {error && (
        <div className="mb-8 bg-red-50 border-2 border-red-300 rounded-lg p-4 text-red-700 font-semibold">
          ❌ {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-600">⏳ Loading dashboard...</p>
        </div>
      ) : stats ? (
        <div className="space-y-8">
          {/* Stats Grid Using DashboardStatsGrid Component */}
          <DashboardStatsGrid />

          {/* Recent Shipments Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">📋 Recent Shipments</h2>
              <Link
                href="/admin/shipments"
                className="text-amber-600 hover:text-amber-700 font-semibold"
              >
                View All →
              </Link>
            </div>
            <DataTable
              columns={shipmentColumns}
              data={formattedShipments}
              actions={[
                {
                  label: 'View',
                  onClick: (row) => router.push(`/admin/shipments/${row.trackingNumber}`),
                  color: 'blue',
                },
              ]}
              isLoading={loading}
              emptyMessage="No shipments found"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-4 gap-6">
            <Link
              href="/admin/shipments"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition text-center"
            >
              <p className="text-3xl mb-2">📦</p>
              <h3 className="font-bold text-gray-900">Manage Shipments</h3>
              <p className="text-sm text-gray-600 mt-1">View and track all shipments</p>
            </Link>

            <Link
              href="/admin/riders"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition text-center"
            >
              <p className="text-3xl mb-2">🚴</p>
              <h3 className="font-bold text-gray-900">Manage Riders</h3>
              <p className="text-sm text-gray-600 mt-1">Rider assignments and status</p>
            </Link>

            <Link
              href="/admin/users"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition text-center"
            >
              <p className="text-3xl mb-2">👥</p>
              <h3 className="font-bold text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-600 mt-1">Create and manage accounts</p>
            </Link>

            <Link
              href="/admin/analytics"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition text-center"
            >
              <p className="text-3xl mb-2">📈</p>
              <h3 className="font-bold text-gray-900">Analytics</h3>
              <p className="text-sm text-gray-600 mt-1">Revenue and performance reports</p>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
