'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { riderService, shipmentService } from '@/app/lib/services';

interface Shipment {
  _id: string;
  trackingNumber: string;
  status: 'PENDING' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED' | 'CANCELLED';
  sender: { name: string; address: string; phoneNumber: string };
  recipient: { name: string; address: string; phoneNumber: string };
  price: number;
  weight?: number;
  parcelType?: string;
  deliveryType?: string;
  createdAt: string;
  updatedAt: string;
}

export default function RiderDeliveriesPage() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDeliveries();
  }, [filterStatus]);

  const fetchDeliveries = async () => {
    try {
      console.log('📦 Fetching rider deliveries...');
      setLoading(true);

      const response = await riderService.getMyAssignedShipments({
        page: 1,
        limit: 50,
        status: filterStatus || undefined,
      });

      console.log('✅ Deliveries response:', response);

      const deliveriesData = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setDeliveries(deliveriesData);
      setError('');
    } catch (err: any) {
      console.error('❌ Error fetching deliveries:', err);
      setError(err.response?.data?.message || 'Failed to load deliveries');
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-gray-200 text-gray-800';
      case 'PICKED_UP':
        return 'bg-blue-200 text-blue-800';
      case 'IN_TRANSIT':
        return 'bg-indigo-200 text-indigo-800';
      case 'OUT_FOR_DELIVERY':
        return 'bg-yellow-200 text-yellow-800';
      case 'DELIVERED':
        return 'bg-green-200 text-green-800';
      case 'FAILED':
        return 'bg-red-200 text-red-800';
      case 'CANCELLED':
        return 'bg-purple-200 text-purple-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '⏳';
      case 'PICKED_UP':
        return '📦';
      case 'IN_TRANSIT':
        return '🚚';
      case 'OUT_FOR_DELIVERY':
        return '🚴';
      case 'DELIVERED':
        return '✅';
      case 'FAILED':
        return '❌';
      case 'CANCELLED':
        return '🛑';
      default:
        return '❓';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredDeliveries = deliveries.filter((delivery) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      delivery.trackingNumber.toLowerCase().includes(searchLower) ||
      delivery.recipient.name.toLowerCase().includes(searchLower) ||
      delivery.recipient.address.toLowerCase().includes(searchLower)
    );
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🚚 My Deliveries</h1>
          <p className="text-gray-600">
            Manage and update your assigned parcels
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700 font-medium">❌ {error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search by Tracking ID or Recipient
              </label>
              <input
                type="text"
                placeholder="Enter tracking ID or recipient name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">⏳ Pending</option>
                <option value="PICKED_UP">📦 Picked Up</option>
                <option value="IN_TRANSIT">🚚 In Transit</option>
                <option value="OUT_FOR_DELIVERY">🚴 Out for Delivery</option>
                <option value="DELIVERED">✅ Delivered</option>
                <option value="FAILED">❌ Failed</option>
                <option value="CANCELLED">🛑 Cancelled</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchDeliveries}
                className="w-full px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:shadow-lg transition"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Deliveries List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
              <p className="text-gray-600">Loading deliveries...</p>
            </div>
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Deliveries Found</h2>
            <p className="text-gray-600">
              {searchTerm || filterStatus
                ? 'Try adjusting your search or filters'
                : 'You have no assigned deliveries yet'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredDeliveries.map((delivery) => (
              <Link key={delivery._id} href={`/rider/deliveries/${delivery._id}`}>
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition cursor-pointer overflow-hidden border-l-4 border-green-500">
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      {/* Tracking Number */}
                      <div>
                        <p className="text-xs text-gray-600 font-semibold mb-1">TRACKING ID</p>
                        <p className="font-mono font-bold text-green-600 text-sm">
                          {delivery.trackingNumber}
                        </p>
                      </div>

                      {/* Status */}
                      <div>
                        <p className="text-xs text-gray-600 font-semibold mb-1">STATUS</p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getStatusIcon(delivery.status)}</span>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                              delivery.status
                            )}`}
                          >
                            {delivery.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Recipient */}
                      <div>
                        <p className="text-xs text-gray-600 font-semibold mb-1">RECIPIENT</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {delivery.recipient.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {delivery.recipient.phoneNumber}
                        </p>
                      </div>

                      {/* Delivery Type */}
                      <div>
                        <p className="text-xs text-gray-600 font-semibold mb-1">TYPE</p>
                        <p className="text-sm font-medium text-gray-900">
                          {delivery.deliveryType || 'STANDARD'}
                        </p>
                        {delivery.weight && (
                          <p className="text-xs text-gray-500">{delivery.weight}kg</p>
                        )}
                      </div>

                      {/* Action */}
                      <div className="text-right">
                        <p className="text-xs text-green-600 font-semibold">
                          View & Update →
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(delivery.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Statistics */}
        {!loading && deliveries.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Delivery Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{deliveries.length}</p>
                <p className="text-sm text-gray-600 mt-1">Total Assigned</p>
              </div>

              <div className="bg-white rounded-lg shadow p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {deliveries.filter((d) => ['IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(d.status)).length}
                </p>
                <p className="text-sm text-gray-600 mt-1">In Transit</p>
              </div>

              <div className="bg-white rounded-lg shadow p-4 text-center">
                <p className="text-3xl font-bold text-green-600">
                  {deliveries.filter((d) => d.status === 'DELIVERED').length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Delivered</p>
              </div>

              <div className="bg-white rounded-lg shadow p-4 text-center">
                <p className="text-3xl font-bold text-yellow-600">
                  {deliveries.filter((d) => d.status === 'PENDING').length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Pending</p>
              </div>

              <div className="bg-white rounded-lg shadow p-4 text-center">
                <p className="text-3xl font-bold text-red-600">
                  {deliveries.filter((d) => ['FAILED', 'CANCELLED'].includes(d.status)).length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Failed/Cancelled</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
