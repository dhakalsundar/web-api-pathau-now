'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { riderService } from '@/app/lib/services';
import NotificationPanel from '../_components/NotificationPanel';

interface Rider {
  _id: string;
  name: string;
  email?: string;
  phoneNumber: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  vehicleType?: string;
  vehicleNumber?: string;
  totalDeliveries?: number;
  rating?: number;
}

interface Shipment {
  _id: string;
  trackingNumber: string;
  status: 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED' | 'CANCELLED';
  sender: { name: string; phone?: string };
  recipient: { name: string; phone?: string; address?: string };
  price: number;
  weight?: number;
  description?: string;
  createdAt: string;
}

interface Stats {
  totalDeliveries: number;
  rating: number;
  assignedParcelsCount: number;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
}

export default function RiderDashboard() {
  const [rider, setRider] = useState<Rider | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentDeliveries, setRecentDeliveries] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [riderRes, statsRes, shipmentsRes] = await Promise.all([
        riderService.getCurrentRider(),
        riderService.getMyStats(),
        riderService.getMyAssignedParcels({ page: 1, limit: 5 }),
      ]);

      setRider(riderRes.data);
      setStats(statsRes.data);

      // Handle both array and paginated response
      const deliveriesData = Array.isArray(shipmentsRes.data)
        ? shipmentsRes.data
        : shipmentsRes.data?.results || [];

      setRecentDeliveries(deliveriesData);
      setError('');
    } catch (err: any) {
      console.error(' Error fetching dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'BUSY':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'OFFLINE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return '🟢';
      case 'BUSY':
        return '🟡';
      case 'OFFLINE':
        return '⚫';
      default:
        return '';
    }
  };

  const getDeliveryStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '';
      case 'ASSIGNED':
        return '';
      case 'PICKED_UP':
        return '';
      case 'IN_TRANSIT':
        return '';
      case 'OUT_FOR_DELIVERY':
        return '';
      case 'DELIVERED':
        return '';
      case 'FAILED':
        return '';
      case 'CANCELLED':
        return '';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
              <p className="text-gray-600">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Notification Bell */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2"> Rider Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's your delivery overview</p>
          </div>
          <NotificationPanel autoRefresh={true} refetchInterval={10000} />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700 font-medium"> {error}</p>
          </div>
        )}

        <div className="space-y-8">
          {/* Rider Profile Card */}
          {rider && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-md p-6 border border-green-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{rider.name}</h2>
                  <div className="space-y-1">
                    <p className="text-gray-700"> {rider.phoneNumber}</p>
                    {rider.email && <p className="text-gray-700"> {rider.email}</p>}
                    {rider.vehicleType && (
                      <p className="text-gray-700">
                         {rider.vehicleType} {rider.vehicleNumber && `- ${rider.vehicleNumber}`}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`inline-block px-4 py-2 rounded-lg font-semibold border ${getStatusBadgeColor(
                      rider.status
                    )}`}
                  >
                    <span className="mr-2">{getStatusIcon(rider.status)}</span>
                    {rider.status}
                  </div>
                  <Link
                    href="/rider/profile"
                    className="block mt-3 text-green-600 hover:text-green-700 font-semibold text-sm"
                  >
                    Edit Profile →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Total Deliveries */}
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-2">Total Deliveries</p>
                    <p className="text-4xl font-bold text-green-600">{stats.totalDeliveries || 0}</p>
                  </div>
                  <span className="text-3xl"></span>
                </div>
                <p className="text-xs text-green-700 mt-4">Lifetime achievements</p>
              </div>

              {/* Current Rating */}
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-2">Rating</p>
                    <p className="text-4xl font-bold text-yellow-600">
                      {stats.rating?.toFixed(1) || '0.0'}/5
                    </p>
                  </div>
                  <span className="text-3xl"></span>
                </div>
                <p className="text-xs text-yellow-700 mt-4">Based on customer reviews</p>
              </div>

              {/* Assigned Parcels */}
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-2">Assigned Parcels</p>
                    <p className="text-4xl font-bold text-blue-600">{stats.assignedParcelsCount || 0}</p>
                  </div>
                  <span className="text-3xl"></span>
                </div>
                <p className="text-xs text-blue-700 mt-4">Waiting for delivery</p>
              </div>

              {/* Current Status */}
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-2">Your Status</p>
                    <p className="text-2xl font-bold">
                      <span className="mr-2">{getStatusIcon(stats.status)}</span>
                      {stats.status}
                    </p>
                  </div>
                  <span className="text-3xl"></span>
                </div>
                <Link
                  href="/rider/profile"
                  className="text-xs text-green-600 hover:text-green-700 font-semibold mt-4 inline-block"
                >
                  Update Status →
                </Link>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4"> Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/rider/deliveries"
                className="p-4 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-lg hover:shadow-lg transition font-semibold flex items-center gap-3"
              >
                <span className="text-2xl"></span>
                <span>View All Deliveries</span>
              </Link>
              <Link
                href="/rider/performance"
                className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-lg hover:shadow-lg transition font-semibold flex items-center gap-3"
              >
                <span className="text-2xl"></span>
                <span>View Performance</span>
              </Link>
            </div>
          </div>

          {/* Recent Deliveries */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900"> Recent Deliveries</h2>
              <Link href="/rider/deliveries" className="text-green-600 hover:text-green-700 font-semibold">
                View All →
              </Link>
            </div>

            {recentDeliveries.length > 0 ? (
              <div className="space-y-3">
                {recentDeliveries.map((delivery) => (
                  <Link key={delivery._id} href={`/rider/deliveries/${delivery._id}`}>
                    <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xl">{getDeliveryStatusIcon(delivery.status)}</span>
                            <span className="font-mono font-semibold text-green-600">
                              {delivery.trackingNumber}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-xs rounded font-semibold">
                              {delivery.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="text-gray-700 font-medium">To: {delivery.recipient.name}</p>
                          <p className="text-sm text-gray-600">
                            {delivery.recipient.address || 'Address not provided'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">Rs{delivery.price}</p>
                          <p className="text-xs text-gray-500">{formatDate(delivery.createdAt)}</p>
                          <p className="text-xs text-green-600 font-semibold mt-1">View →</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500"> No recent deliveries</p>
              </div>
            )}
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-2"> Need Help?</h3>
            <p className="text-blue-800 mb-4">
              For issues with deliveries or technical support, please contact the admin team.
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>✓ Navigate to Deliveries to manage your assigned parcels</li>
              <li>✓ Update parcel statuses in real-time for customer visibility</li>
              <li>✓ Check your performance metrics and ratings</li>
              <li>✓ Update your profile and availability status</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
