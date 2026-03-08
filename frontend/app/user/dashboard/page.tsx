'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { parcelService } from '@/app/lib/services';
import UserNotificationPanel from '../_components/UserNotificationPanel';

interface DashboardStats {
  totalParcels: number;
  inTransit: number;
  delivered: number;
  pending: number;
  failed: number;
  totalSpent: number;
}

export default function UserDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalParcels: 0,
    inTransit: 0,
    delivered: 0,
    pending: 0,
    failed: 0,
    totalSpent: 0,
  });
  const [recentParcels, setRecentParcels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch user's parcels
        const response = await parcelService.getUserParcels({
          page: 1,
          limit: 50,
        });

        

        const shipments = Array.isArray(response.data) 
          ? response.data 
          : response.data?.items || [];


        // Calculate stats
        const statsData: DashboardStats = {
          totalParcels: shipments.length,
          inTransit: shipments.filter(
            (s: any) =>
              s.status === 'IN_TRANSIT' ||
              s.status === 'PICKED_UP' ||
              s.status === 'OUT_FOR_DELIVERY'
          ).length,
          delivered: shipments.filter((s: any) => s.status === 'DELIVERED').length,
          pending: shipments.filter((s: any) => s.status === 'PENDING').length,
          failed: shipments.filter((s: any) => s.status === 'FAILED' || s.status === 'CANCELLED')
            .length,
          totalSpent: shipments.reduce((sum: number, s: any) => sum + (s.price || 0), 0),
        };

        setStats(statsData);

        // Get recent 5 parcels
        setRecentParcels(shipments.slice(0, 5));
        setError('');
      } catch (err: any) {
        console.error('Failed to load dashboard:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
      case 'PICKED_UP':
        return 'bg-blue-100 text-blue-800';
      case 'IN_TRANSIT':
        return 'bg-yellow-100 text-yellow-800';
      case 'OUT_FOR_DELIVERY':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2"> My Dashboard</h1>
          <p className="text-gray-600">Welcome! Here's your parcel overview</p>
        </div>
        <UserNotificationPanel autoRefresh={true} refetchInterval={15000} />
      </div>

      {error && (
        <div className="mb-8 bg-red-50 border-2 border-red-300 rounded-lg p-4 text-red-700 font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
            <p className="text-xl text-gray-600"> Loading dashboard...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Parcels */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">Total Parcels</p>
                  <p className="text-4xl font-bold text-blue-900">{stats.totalParcels}</p>
                </div>
                <span className="text-4xl"></span>
              </div>
              <p className="text-xs text-blue-700 mt-4">All your parcels</p>
            </div>

            {/* In Transit */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">In Transit</p>
                  <p className="text-4xl font-bold text-yellow-900">{stats.inTransit}</p>
                </div>
                <span className="text-4xl"></span>
              </div>
              <p className="text-xs text-yellow-700 mt-4">On the way to you</p>
            </div>

            {/* Delivered */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">Delivered</p>
                  <p className="text-4xl font-bold text-green-900">{stats.delivered}</p>
                </div>
                <span className="text-4xl">✓</span>
              </div>
              <p className="text-xs text-green-700 mt-4">Successfully delivered</p>
            </div>

            {/* Pending */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">Pending</p>
                  <p className="text-4xl font-bold text-red-900">{stats.pending}</p>
                </div>
                <span className="text-4xl"></span>
              </div>
              <p className="text-xs text-red-700 mt-4">Waiting to be picked up</p>
            </div>
          </div>

          {/* Total Spent Card */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-8 shadow-sm border border-amber-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm font-semibold mb-2">Total Amount Spent</p>
                <p className="text-5xl font-bold text-amber-900">Rs{stats.totalSpent.toFixed(2)}</p>
              </div>
              <span className="text-6xl"></span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4"> Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/user/create-parcel"
                className="p-4 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-lg hover:shadow-lg transition font-semibold flex items-center gap-3"
              >
                <span className="text-2xl"></span>
                <span>Create New Parcel</span>
              </Link>
              <Link
                href="/user/parcels"
                className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-lg hover:shadow-lg transition font-semibold flex items-center gap-3"
              >
                <span className="text-2xl"></span>
                <span>View All Parcels</span>
              </Link>
              <Link
                href="/user/track"
                className="p-4 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-lg hover:shadow-lg transition font-semibold flex items-center gap-3"
              >
                <span className="text-2xl"></span>
                <span>Track Parcel</span>
              </Link>
            </div>
          </div>

          {/* Recent Parcels */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900"> Recent Parcels</h2>
              <Link href="/user/parcels" className="text-amber-600 hover:text-amber-700 font-semibold">
                View All →
              </Link>
            </div>

            {recentParcels.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Tracking ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Recipient</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentParcels.map((parcel: any) => (
                      <tr
                        key={parcel._id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition"
                      >
                        <td className="py-3 px-4">
                          <Link
                            href={`/user/track?id=${parcel.trackingNumber}`}
                            className="font-mono font-semibold text-amber-600 hover:text-amber-700"
                          >
                            {parcel.trackingNumber}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{parcel.recipient?.name || '-'}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                              parcel.status
                            )}`}
                          >
                            {parcel.status?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-900">Rs{parcel.price}</td>
                        <td className="py-3 px-4 text-gray-600">{formatDate(parcel.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4"> No parcels yet</p>
                <Link
                  href="/user/create-parcel"
                  className="inline-block px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold"
                >
                  Create Your First Parcel
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
